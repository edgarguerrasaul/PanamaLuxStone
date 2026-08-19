import { Suspense } from "react";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import PurchaseModeTabs, { type PurchaseMode } from "@/components/PurchaseModeTabs";

export const revalidate = 3600;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ coleccion?: string; modo?: string }>;
}) {
  const collections = await db.collection.findMany({ orderBy: { sortOrder: "asc" } });
  const { coleccion: activeSlug, modo } = await searchParams;
  const mode: PurchaseMode = modo === "inmediato" ? "inmediato" : "pedido";

  const where = {
    ...(activeSlug ? { collection: { slug: activeSlug } } : {}),
    ...(mode === "inmediato" ? { immediateStock: true } : {}),
  };

  const products = await db.product.findMany({
    where,
    include: { collection: true },
    orderBy: { name: "asc" },
  });
  const totalProducts = await db.product.count();
  const draftCount = await db.product.count({ where: { descriptionConfirmed: false } });

  function withMode(href: string) {
    const sep = href.includes("?") ? "&" : "?";
    return `${href}${sep}modo=${mode}`;
  }

  return (
    <div className="container-app py-12">
      <h1 className="font-serif text-3xl font-semibold">Catálogo</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        {totalProducts} modelos · 12mm de espesor · acabados pulido, matt y especiales.
        {draftCount > 0 && ` (${draftCount} en borrador, pendientes de confirmar)`}
      </p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <PurchaseModeTabs mode={mode} />
        </Suspense>
        {mode === "pedido" ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Piedra importada por encargo — tiempo de entrega estimado de <strong>4 a 6 meses</strong>.
          </p>
        ) : (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Solo modelos con <strong>stock local disponible</strong> — entrega mucho más rápida.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <a
          href={withMode("/catalogo")}
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !activeSlug
              ? "border-neutral-900 bg-neutral-900 text-white dark:border-gold-600 dark:bg-gold-600"
              : "border-neutral-300 dark:border-neutral-700"
          }`}
        >
          Todos
        </a>
        {collections.map((c) => (
          <a
            key={c.slug}
            href={withMode(`/catalogo?coleccion=${c.slug}`)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              activeSlug === c.slug
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-gold-600 dark:bg-gold-600"
                : "border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {c.name}
          </a>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {products.length === 0 && mode === "inmediato" && (
        <p className="mt-10 rounded-lg border border-neutral-200 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          Todavía no hay modelos marcados con stock inmediato.{" "}
          <a href="/#contacto" className="text-gold-600 underline">
            Escríbenos por WhatsApp
          </a>{" "}
          y te confirmamos disponibilidad, o revisa la pestaña "Compra por Pedido".
        </p>
      )}
      {products.length === 0 && mode === "pedido" && (
        <p className="mt-10 text-sm text-neutral-500 dark:text-neutral-400">
          No hay productos todavía. Corre <code>npm run db:seed</code> para cargar el catálogo real.
        </p>
      )}
    </div>
  );
}
