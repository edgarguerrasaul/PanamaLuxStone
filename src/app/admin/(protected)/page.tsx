import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [productCount, pendingOrders, newQuotes, unhandledMessages, installerCount] = await Promise.all([
    db.product.count(),
    db.order.count({ where: { status: { in: ["PENDIENTE_PAGO", "PENDIENTE_CONFIRMACION"] } } }),
    db.quote.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.installer.count(),
  ]);

  const cards = [
    { label: "Productos en catálogo", value: productCount, href: "/admin/productos" },
    { label: "Pedidos por confirmar", value: pendingOrders, href: "/admin/pedidos" },
    { label: "Cotizaciones nuevas", value: newQuotes, href: "/admin/cotizaciones" },
    { label: "Mensajes sin leer", value: unhandledMessages, href: "/admin/mensajes" },
    { label: "Instaladores registrados", value: installerCount, href: "/admin/instaladores" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Panel de administración</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-neutral-200 p-6 transition hover:border-gold-500 hover:shadow-sm"
          >
            <p className="text-3xl font-semibold">{c.value}</p>
            <p className="mt-1 text-sm text-neutral-500">{c.label}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-neutral-500">
        Para agregar un modelo de piedra nuevo (con foto), pídeselo a Claude o edita{" "}
        <code>src/data/catalog.ts</code> — desde aquí puedes ajustar precio, stock inmediato y destacado de los
        modelos que ya existen.
      </p>
    </div>
  );
}
