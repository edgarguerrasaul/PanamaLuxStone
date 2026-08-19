// POST /api/webhooks/payments/yappy
// POST /api/webhooks/payments/card   (Stripe o PagueloFácil, según cuál esté activa)
//
// Aquí es donde la pasarela de pago "toca la puerta" para avisar que
// un pago se completó o falló. Verificamos la notificación con el
// proveedor correspondiente y actualizamos el pedido.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider, type PaymentMethodId } from "@/lib/payments";

export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const methodId = provider as PaymentMethodId;
  const rawBody = await req.text();

  let result;
  try {
    const provider = getPaymentProvider(methodId);
    result = await provider.verifyWebhook(rawBody, req.headers);
  } catch (err) {
    console.error("Webhook de pago inválido:", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (!result) {
    // Notificación que no nos interesa (otro tipo de evento) — se responde 200 igual.
    return NextResponse.json({ ok: true, ignored: true });
  }

  // "paid" -> el pago online se confirmó, pasa a CONFIRMADO.
  // "failed" -> el intento de pago falló; vuelve a PENDIENTE_PAGO para
  // que el cliente pueda reintentar (no se cancela el pedido solo).
  const order = await db.order.update({
    where: { id: result.orderId },
    data: {
      status: result.status === "paid" ? "CONFIRMADO" : "PENDIENTE_PAGO",
      providerRef: result.providerReference,
    },
  });

  await db.emailLog.create({
    data: {
      to: "", // se resuelve con order.customer al momento de enviar
      type: result.status === "paid" ? "ORDER_CONFIRMATION" : "PAYMENT_FAILED",
      orderId: order.id,
    },
  });

  return NextResponse.json({ ok: true });
}
