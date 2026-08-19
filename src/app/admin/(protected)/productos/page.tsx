import { db } from "@/lib/db";
import { updateProductAction } from "@/app/admin/actions";

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { updated, error } = await searchParams;
  const products = await db.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Productos</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Ajusta precio, si hay stock inmediato (aparece en la pestaña "Compra Inmediata") y si es destacado.
      </p>
      {updated && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">Guardado.</p>}
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">Revisa el precio ingresado.</p>}

      {/* Encabezados (grid, no <table> — así cada fila puede ser su propio <form>) */}
      <div className="mt-6 hidden grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b border-neutral-200 pb-2 text-xs uppercase tracking-wide text-neutral-500 sm:grid">
        <span>Modelo</span>
        <span>Precio $/m²</span>
        <span>Confirmado</span>
        <span>Stock inmediato</span>
        <span>Destacado</span>
        <span></span>
      </div>

      <div className="divide-y divide-neutral-100">
        {products.map((p) => {
          const action = updateProductAction.bind(null, p.id);
          return (
            <form
              key={p.id}
              action={action}
              className="grid grid-cols-2 items-center gap-3 py-3 text-sm sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
            >
              <span className="col-span-2 font-medium sm:col-span-1">{p.name}</span>
              <label className="flex items-center gap-2 sm:block">
                <span className="text-xs text-neutral-500 sm:hidden">Precio $/m²</span>
                <input
                  type="number"
                  step="0.01"
                  name="pricePerM2"
                  defaultValue={p.pricePerM2}
                  className="w-24 rounded border border-neutral-300 px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="priceConfirmed" defaultChecked={p.priceConfirmed} />
                <span className="text-xs text-neutral-500 sm:hidden">Confirmado</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="immediateStock" defaultChecked={p.immediateStock} />
                <span className="text-xs text-neutral-500 sm:hidden">Stock inmediato</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" defaultChecked={p.featured} />
                <span className="text-xs text-neutral-500 sm:hidden">Destacado</span>
              </label>
              <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                Guardar
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
