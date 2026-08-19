import Link from "next/link";
import CartBadge from "@/components/CartBadge";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="container-app flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-lg font-semibold tracking-wide">
          Panamá <span className="text-gold-600">LuxeStone</span>
        </Link>
        <nav className="hidden gap-8 text-sm font-medium sm:flex">
          <Link href="/catalogo" className="hover:text-gold-600">
            Catálogo
          </Link>
          <Link href="/cotizador" className="hover:text-gold-600">
            Cotizador
          </Link>
          <Link href="/instaladores" className="hover:text-gold-600">
            Instaladores
          </Link>
          <Link href="/contacto" className="hover:text-gold-600">
            Contáctanos
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
