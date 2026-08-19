// POST /api/quotes
// Guarda una cotización armada desde /cotizador (cantidad de placas +
// medida elegida + foto + piedra elegida + acarreo opcional) y agenda
// el correo de "recibimos tu cotización".
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const quoteSchema = z.object({
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().int().min(1),
  plateWidthCm: z.number().positive(),
  plateHeightCm: z.number().positive(),
  // Solo viene definido si el cliente marcó "Sí, incluir el acarreo"
  // en el radio button del paso 3 del cotizador.
  freightZoneId: z.string().optional(),
  photoUrl: z.string().optional(),
  wantsRender: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { contactEmail, contactPhone, productId, quantity, plateWidthCm, plateHeightCm, freightZoneId, photoUrl, wantsRender } =
    parsed.data;

  // El cliente ya nos dice exactamente cuántas placas quiere: no hay
  // margen de desperdicio que calcular, la cantidad de láminas ES la
  // cantidad que pidió.
  const areaTotalM2 = quantity * (plateWidthCm / 100) * (plateHeightCm / 100);
  const slabsNeeded = quantity;

  let estimatedTotal = 0;
  if (productId) {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (product) estimatedTotal = Number((product.pricePerM2 * areaTotalM2).toFixed(2));
  }

  let freightZone = null;
  if (freightZoneId) {
    freightZone = await db.freightZone.findUnique({ where: { id: freightZoneId } });
  }
  const freightCost = freightZone?.active ? freightZone.costPerSlab * slabsNeeded : 0;
  const totalWithFreight = Number((estimatedTotal + freightCost).toFixed(2));

  const quote = await db.quote.create({
    data: {
      contactEmail,
      contactPhone,
      productId,
      // Reutilizamos esta columna (JSON en texto) para guardar la
      // cantidad de placas y la medida elegida — evita tener que
      // agregar columnas nuevas a la base de datos por este cambio.
      measurements: JSON.stringify({ quantity, plateWidthCm, plateHeightCm }),
      areaTotalM2,
      wasteMarginPct: 0,
      slabsNeeded,
      estimatedTotal,
      freightZoneId: freightZone?.id,
      freightCost,
      totalWithFreight,
      photoUrl,
      wantsRender: wantsRender ?? false,
    },
  });

  await db.emailLog.create({
    data: { to: contactEmail, type: "QUOTE_RECEIVED", quoteId: quote.id },
  });

  return NextResponse.json({
    ok: true,
    quoteId: quote.id,
    areaTotalM2,
    slabsNeeded,
    estimatedTotal,
    freightCost,
    totalWithFreight,
  });
}
