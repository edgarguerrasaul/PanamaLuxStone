import { db } from "@/lib/db";
import { markMessageHandledAction } from "@/app/admin/actions";

export default async function AdminMensajesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Mensajes de contacto</h1>
      <p className="mt-1 text-sm text-neutral-500">Enviados desde el formulario de /contacto.</p>

      <div className="mt-6 divide-y divide-neutral-100">
        {messages.length === 0 && <p className="py-6 text-sm text-neutral-500">Todavía no hay mensajes.</p>}
        {messages.map((m) => {
          const toggle = markMessageHandledAction.bind(null, m.id, !m.handled);
          return (
            <div key={m.id} className="grid gap-3 py-4 text-sm sm:grid-cols-[1fr_auto]">
              <div>
                <p className="font-medium">
                  {m.name} · {m.email} {m.handled && <span className="ml-2 text-xs text-green-600">(atendido)</span>}
                </p>
                <p className="mt-1 text-neutral-700">{m.message}</p>
                <p className="text-neutral-400">{new Date(m.createdAt).toLocaleString("es-PA")}</p>
              </div>
              <form action={toggle}>
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                  {m.handled ? "Marcar sin atender" : "Marcar atendido"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
