"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { useSideCart } from "@/lib/cart/ui-store";

export default function CartBadge() {
  // Evita el "hydration mismatch" clásico de Next.js: el carrito vive
  // en localStorage, que no existe en el servidor, así que esperamos
  // a que el componente esté montado en el navegador para leerlo.
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const toggleCart = useSideCart((s) => s.toggleCart);

  useEffect(() => setMounted(true), []);

  const count = mounted ? items.length : 0;

  return (
    <button
      type="button"
      onClick={toggleCart}
      className="relative flex items-center gap-2 text-sm font-medium hover:text-gold-600"
      aria-label="Abrir carrito"
    >
      Carrito
      {count > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs text-white dark:bg-gold-600">
          {count}
        </span>
      )}
    </button>
  );
}
