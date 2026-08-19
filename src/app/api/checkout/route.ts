// POST /api/checkout
// Recibe el carrito + datos del cliente + método de pago elegido,
// crea el pedido en la base de datos y arranca el cobro a través del
// middleware de pagos (src/lib/payments). Devuelve a dónde redirigir
// al cliente para completar el pago (si aplica).
//
// Estados posibles del pedido creado (ver prisma/schema.prisma):
//   PENDIENTE_PAGO          -> falta pagar (online) o falta subir comprobante
//   PENDIENTE_CONFIRMACION  -> comprobante subido, el admin debe verificarlo
// El resto de la máquina de estados (CONFIRMADO, EN_PREPARACION, ENVIADO,
// CANCELADO) se mueve manualmente desde /admin/pedidos.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getPaymentProvider, type PaymentMethodId } from "@/lib/payments";
import { getResend, EMAIL_FROM } from "@/lib/email/client";
import { proofOfPaymentAdminAlertEmail } from "@/lib/email/templates";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  paymentMethod: z.enum(["yappy", "card", "transfer"]),
  purchaseMode: z.enum(["pedido", "inmediato"]).default("pedido"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        areaM2: z.number().positive(),
        sizeLabel: z.string().optional(),
        thicknessCm: z.number().optional(),
      })
    )
    .min(1),
  freightZoneId: z.string().optional(),
  proofOfPaymentUrl: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const {
    customer,
    paymentMethod,
    purchaseMode,
    items,
    freightZoneId,
    proofOfPaymentUrl,
    shippingAddress,
    notes,
  } = parsed.data;

  const products = await db.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
  if (products.length !== new Set(items.map((i) => i.productId)).size) {
    return NextResponse.json({ error: "Uno o más productos ya no existen." }, { status: 400 });
  }

  let freightZone = null;
  if (freightZoneId) {
    freightZone = await db.freightZone.findUnique({ where: { id: freightZoneId } });
    if (!freightZone || !freightZone.active) {
      return NextResponse.json({ error: "La zona de entrega elegida ya no está disponible." }, { status: 400 });
    }
  }
  const freightCost = freightZone?.costPerSlab ?? 0;

  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      productId: product.id,
      areaM2: item.areaM2,
      unitPrice: product.pricePerM2,
      subtotal: Number((product.pricePerM2 * item.areaM2).toFixed(2)),
      sizeLabel: item.sizeLabel,
      thicknessCm: item.thicknessCm,
    };
  });
  const itemsTotal = orderItemsData.reduce((sum, i) => sum + i.subtotal, 0);
  const totalAmount = Number((itemsTotal + freightCost).toFixed(2));

  const dbCustomer = await db.customer.upsert({
    where: { email: customer.email },
    update: { name: customer.name, phone: customer.phone },
    create: { name: customer.name, email: customer.email, phone: customer.phone },
  });

  const order = await db.order.create({
    data: {
      customerId: dbCustomer.id,
      paymentMethod: paymentMethod.toUpperCase() as "YAPPY" | "CARD" | "TRANSFER",
      purchaseMode,
      totalAmount,
      freightZoneId: freightZone?.id,
      freightCost,
      proofOfPaymentUrl,
      shippingAddress,
      notes,
      items: { create: orderItemsData },
    },
  });

  // Si el cliente ya subió el comprobante al momento de pagar, avisamos
  // al admin de inmediato para que lo revise (sección 7 de la spec).
  // Si no lo subió ahora, puede mandarlo después por WhatsApp — el
  // pedido de todas formas queda "Pendiente de confirmación" para
  // transferencia/Yappy (se resuelve más abajo, según la respuesta del
  // proveedor de pago).
  if (proofOfPaymentUrl) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && process.env.RESEND_API_KEY) {
      try {
        const email = proofOfPaymentAdminAlertEmail({
          orderId: order.id,
          customerName: customer.name,
          total: totalAmount,
        });
        await getResend().emails.send({ from: EMAIL_FROM, to: adminEmail, subject: email.subject, html: email.html });
      } catch (err) {
        console.error("No se pudo avisar al admin del comprobante subido:", err);
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

  try {
    const provider = getPaymentProvider(paymentMethod as PaymentMethodId);
    const payment = await provider.createPayment({
      orderId: order.id,
      amountCents: Math.round(totalAmount * 100),
      currency: "USD",
      customerEmail: customer.email,
      customerName: customer.name,
      description: `Pedido Panamá LuxeStone #${order.id.slice(-6).toUpperCase()}`,
      returnUrl: `${siteUrl}/checkout/gracias?order=${order.id}`,
      cancelUrl: `${siteUrl}/carrito`,
    });

    await db.order.update({ where: { id: order.id }, data: { providerRef: payment.providerReference } });

    if (payment.status === "requires_manual_confirmation") {
      await db.order.update({ where: { id: order.id }, data: { status: "PENDIENTE_CONFIRMACION" } });
      await db.emailLog.create({ data: { to: customer.email, type: "ORDER_CONFIRMATION", orderId: order.id } });
    }

    return NextResponse.json({ ok: true, orderId: order.id, redirectUrl: payment.redirectUrl ?? null });
  } catch (err) {
    console.error("Error creando el pago:", err);
    return NextResponse.json(
      { ok: false, orderId: order.id, error: "No se pudo iniciar el pago. El pedido quedó guardado como pendiente." },
      { status: 502 }
    );
  }
}
