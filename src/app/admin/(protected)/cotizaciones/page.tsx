import { db } from "@/lib/db";
import { updateQuoteStatusAction } from "@/app/admin/actions";

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nueva",
  CONTACTED: "Contactado",
  CONVERTED: "Convertida en pedido",
  DISCARDED: "Descartada",
};

export default async function AdminCotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const quotes = await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true, freightZone: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Cotizaciones</h1>
      <p className="mt-1 text-sm text-neutral-500">Leads generados desde el cotizador automático.</p>
      {updated && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">Estado actualizado.</p>}

      <div className="mt-6 divide-y divide-neutral-100">
        {quotes.length === 0 && <p className="py-6 text-sm text-neutral-500">Todavía no hay cotizaciones.</p>}
        {quotes.map((q) => {
          const action = updateQuoteStatusAction.bind(null, q.id);
          return (
            <div key={q.id} className="grid gap-3 py-4 text-sm sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">
                  {q.contactEmail} {q.contactPhone && `· ${q.contactPhone}`}
                </p>
                <p className="text-neutral-500">
                  {q.product?.name ?? "Sin piedra elegida"} · {q.areaTotalM2.toFixed(2)} m² · estimado $
                  {q.estimatedTotal.toFixed(2)}
                  {q.freightZone && ` + acarreo a ${q.freightZone.name} ($${q.freightCost.toFixed(2)}) = $${q.totalWithFreight.toFixed(2)}`}
                </p>
                <p className="text-neutral-400">{new Date(q.createdAt).toLocaleString("es-PA")}</p>
                {q.photoUrl && (
                  <a href={q.photoUrl} target="_blank" rel="noopener noreferrer" className="text-gold-600 underline">
                    Ver foto subida
                  </a>
                )}
              </div>
              <form action={action} className="flex items-center gap-2">
                <select name="status" defaultValue={q.status} className="rounded border border-neutral-300 px-2 py-1.5 text-sm">
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                  Guardar
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
