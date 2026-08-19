"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cartLineId, useCart } from "@/lib/cart/store";
import { useSideCart } from "@/lib/cart/ui-store";

/**
 * Carrito lateral deslizable: se abre al agregar un producto o al hacer
 * clic en "Carrito" en el header, sin sacar al usuario de la página en
 * la que está. El carrito de página completa (/carrito) sigue existiendo
 * para el resumen detallado antes de pagar.
 */
export default function SideCart() {
  const [mounted, setMounted] = useState(false);
  const { open, closeCart } = useSideCart();
  const { items, removeLine, updateLineArea, total } = useCart();

  useEffect(() => setMounted(true), []);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeCart]);

  // Bloquear el scroll del fondo mientras el panel está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      {/* Fondo oscuro */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel deslizable */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-neutral-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="font-serif text-lg font-semibold">Tu carrito {items.length > 0 && `(${items.length})`}</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">Tu carrito está vacío.</p>
            <Link href="/catalogo" onClick={closeCart} className="btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const lineId = cartLineId(item);
                  return (
                    <div key={lineId} className="flex gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {item.slabs ? `${item.slabs} lámina${item.slabs === 1 ? "" : "s"} de ` : ""}
                          {item.sizeLabel && `${item.sizeLabel}`}
                          {item.thicknessCm && ` · ${item.thicknessCm} cm`}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <label className="flex items-center gap-1 text-xs">
                            m²
                            <input
                              type="number"
                              min={0.1}
                              step={0.1}
                              value={item.areaM2}
                              onChange={(e) => updateLineArea(lineId, Number(e.target.value))}
                              className="w-14 rounded border border-neutral-300 px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-800"
                            />
                          </label>
                          <span className="text-xs font-medium">
                            ${(item.areaM2 * item.pricePerM2).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeLine(lineId)}
                        aria-label={`Quitar ${item.name} del carrito`}
                        className="self-start text-xs text-neutral-400 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total estimado</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/checkout" onClick={closeCart} className="btn-primary w-full">
                  Continuar al pago
                </Link>
                <Link href="/carrito" onClick={closeCart} className="btn-secondary w-full">
                  Ver carrito completo
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
