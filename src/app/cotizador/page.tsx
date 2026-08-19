import { db } from "@/lib/db";
import QuoteCalculator from "@/components/QuoteCalculator";

export const revalidate = 3600;

export default async function CotizadorPage() {
  const [products, freightZones] = await Promise.all([
    db.product.findMany({
      orderBy: [{ collection: { sortOrder: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        pricePerM2: true,
        priceConfirmed: true,
        immediateStock: true,
        thumbUrl: true,
      },
    }),
    db.freightZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="container-app py-12">
      <h1 className="font-serif text-3xl font-semibold">Cotiza tu proyecto en 3 pasos</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Mide tus superficies, sube una foto y elige tu piedra. Te damos un estimado al instante, incluyendo acarreo.
      </p>
      <QuoteCalculator
        products={products}
        freightZones={freightZones.map((z) => ({ id: z.id, name: z.name, costPerSlab: z.costPerSlab }))}
      />
    </div>
  );
}
