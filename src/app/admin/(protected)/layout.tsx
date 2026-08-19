import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/admin";
import { logoutAdminAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/instaladores", label: "Instaladores" },
  { href: "/admin/acarreo", label: "Acarreo" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/cotizaciones", label: "Cotizaciones" },
  { href: "/admin/mensajes", label: "Mensajes" },
];

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="container-app py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <nav className="flex flex-wrap gap-4 text-sm font-medium">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-neutral-600 hover:text-gold-600">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAdminAction}>
          <button type="submit" className="text-sm text-neutral-500 hover:text-red-600">
            Cerrar sesión ({session.email})
          </button>
        </form>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
