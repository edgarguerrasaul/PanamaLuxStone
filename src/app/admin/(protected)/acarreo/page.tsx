import { db } from "@/lib/db";
import { updateFreightZoneAction } from "@/app/admin/actions";

export default async function AdminAcarreoPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { updated, error } = await searchParams;
  const zones = await db.freightZone.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Zonas de acarreo</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Costo de entrega por placa (3200×1600mm = 5.12 m²) según zona. Se usa en el cotizador y en el checkout.
      </p>

      {updated && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">Guardado.</p>}
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">Revisa el costo ingresado.</p>}

      <div className="mt-6 divide-y divide-neutral-100">
        {zones.map((z) => {
          const action = updateFreightZoneAction.bind(null, z.id);
          return (
            <form key={z.id} action={action} className="flex flex-wrap items-center gap-4 py-3 text-sm">
              <span className="w-40 font-medium">{z.name}</span>
              <label className="flex items-center gap-2">
                $
                <input
                  type="number"
                  step="0.01"
                  name="costPerSlab"
                  defaultValue={z.costPerSlab}
                  className="w-28 rounded border border-neutral-300 px-2 py-1"
                />
                / placa
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="active" defaultChecked={z.active} />
                Activa
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
