import { db } from "@/lib/db";
import { createInstallerAction, deleteInstallerAction, toggleInstallerActiveAction } from "@/app/admin/actions";

const PROVINCES = [
  "Bocas del Toro",
  "Coclé",
  "Colón",
  "Chiriquí",
  "Darién",
  "Herrera",
  "Los Santos",
  "Panamá",
  "Panamá Oeste",
  "Veraguas",
  "Ngäbe-Buglé",
  "Guna Yala",
  "Emberá",
];

export default async function AdminInstaladoresPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string; error?: string }>;
}) {
  const { created, deleted, error } = await searchParams;
  const installers = await db.installer.findMany({ orderBy: [{ province: "asc" }, { name: "asc" }] });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Instaladores recomendados</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Se muestran en la página pública /instaladores, agrupados por provincia. No hay ninguno cargado todavía —
        agrega los reales aquí, no se inventó ningún contacto de relleno.
      </p>

      {created && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">Instalador agregado.</p>}
      {deleted && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">Instalador eliminado.</p>}
      {error && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">Faltan datos (nombre, teléfono y provincia son obligatorios).</p>}

      <form action={createInstallerAction} className="mt-6 grid gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-4">
        <input name="name" placeholder="Nombre" required className="rounded border border-neutral-300 px-3 py-2 sm:col-span-1" />
        <input name="phone" placeholder="Teléfono / WhatsApp" required className="rounded border border-neutral-300 px-3 py-2" />
        <select name="province" required defaultValue="" className="rounded border border-neutral-300 px-3 py-2">
          <option value="" disabled>
            Provincia
          </option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">
          Agregar
        </button>
      </form>

      <div className="mt-8 divide-y divide-neutral-100">
        {installers.length === 0 && <p className="py-6 text-sm text-neutral-500">Todavía no hay instaladores cargados.</p>}
        {installers.map((i) => {
          const del = deleteInstallerAction.bind(null, i.id);
          const toggle = toggleInstallerActiveAction.bind(null, i.id, !i.active);
          return (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {i.name} {!i.active && <span className="ml-2 text-xs text-amber-600">(inactivo)</span>}
                </p>
                <p className="text-neutral-500">
                  {i.province} · {i.phone}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={toggle}>
                  <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                    {i.active ? "Desactivar" : "Activar"}
                  </button>
                </form>
                <form action={del}>
                  <button type="submit" className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
