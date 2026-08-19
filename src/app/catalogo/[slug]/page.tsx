import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import AddToCartButton from "@/components/AddToCartButton";
import { buildWhatsAppUrl, whatsAppProductMessage } from "@/data/business";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { collection: true },
  });

  if (!product) notFound();

  const specs = [
    { label: "Acabado", value: product.finish },
    { label: "Tono base", value: product.toneBase },
    { label: "Veta", value: product.vein },
    { label: "Espesor", value: `${product.thicknessMm} mm` },
    { label: "Uso recomendado", value: product.usage },
    { label: "Colección", value: product.collection.name },
  ];

  return (
    <div className="container-app grid gap-10 py-12 sm:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <Image src={product.imageUrl} alt={product.name} fill priority className="object-cover" />
        {product.immediateStock && (
          <span className="absolute right-3 top-3 rounded bg-green-600 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Stock inmediato
          </span>
        )}
      </div>

      <div>
        {product.descriptionConfirmed === false && (
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <strong>Borrador sin confirmar.</strong> Esta descripción la escribió Claude a partir de la foto y/o del
            nombre del modelo — todavía falta que el equipo la revise y la corrija.
            {product.hasPlaceholderImage && " La foto también es un relleno temporal, no el producto real."}
          </div>
        )}
        <p className="text-sm uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{product.subtitle}</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold">{product.name}</h1>
        <p className="mt-4 text-2xl font-medium text-gold-600">
          ${product.pricePerM2}/m²
          {!product.priceConfirmed && (
            <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">(precio estimado, por confirmar)</span>
          )}
        </p>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {product.immediateStock
            ? "Stock disponible en Panamá — entrega mucho más rápida que un pedido por importación."
            : "Piedra por encargo (importación) — tiempo de entrega estimado de 4 a 6 meses."}
        </p>
        <p className="mt-6 text-neutral-700 dark:text-neutral-300">{product.description}</p>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-6 text-sm dark:border-neutral-800">
          {specs.map((s) => (
            <div key={s.label}>
              <dt className="text-neutral-500 dark:text-neutral-400">{s.label}</dt>
              <dd className="font-medium">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              pricePerM2: product.pricePerM2,
            }}
            availableSizesJson={product.availableSizes}
            immediateStock={product.immediateStock}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <a href="/cotizador" className="btn-secondary">
            Cotizar con esta piedra
          </a>
          <a
            href={buildWhatsAppUrl(whatsAppProductMessage(product.name))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary border-[#25D366] !text-[#128C4A] hover:border-[#128C4A] dark:!text-[#25D366]"
          >
            Solicitar visita para ver esta muestra
          </a>
        </div>
      </div>
    </div>
  );
}
