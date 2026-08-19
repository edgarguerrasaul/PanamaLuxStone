import { db } from "@/lib/db";
import { updateOrderStatusAction } from "@/app/admin/actions";

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE_PAGO: "Pendiente de pago",
  PENDIENTE_CONFIRMACION: "Pendiente de confirmación",
  CONFIRMADO: "Pagado / Confirmado",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado / Entregado",
  CANCELADO: "Cancelado",
};

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, freightZone: true, items: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Pedidos</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Revisa el comprobante de transferencia/Yappy antes de pasar un pedido a "Pagado / Confirmado".
      </p>
      {updated && <p className="mt-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">Estado actualizado.</p>}

      <div className="mt-6 divide-y divide-neutral-100">
        {orders.length === 0 && <p className="py-6 text-sm text-neutral-500">Todavía no hay pedidos.</p>}
        {orders.map((o) => {
          const action = updateOrderStatusAction.bind(null, o.id);
          return (
            <div key={o.id} className="grid gap-3 py-4 text-sm sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">
                  #{o.id.slice(-6).toUpperCase()} · {o.customer.name} ({o.customer.email})
                </p>
                <p className="text-neutral-500">
                  {o.items.length} ítem(s) · ${o.totalAmount.toFixed(2)} total
                  {o.freightZone && ` (incluye acarreo a ${o.freightZone.name}: $${o.freightCost.toFixed(2)})`} ·{" "}
                  {o.paymentMethod} · modalidad: {o.purchaseMode}
                </p>
                <p className="text-neutral-400">{new Date(o.createdAt).toLocaleString("es-PA")}</p>
                {o.proofOfPaymentUrl && (
                  <a href={o.proofOfPaymentUrl} target="_blank" rel="noopener noreferrer" className="text-gold-600 underline">
                    Ver comprobante subido
                  </a>
                )}
              </div>
              <form action={action} className="flex items-center gap-2">
                <select name="status" defaultValue={o.status} className="rounded border border-neutral-300 px-2 py-1.5 text-sm">
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
