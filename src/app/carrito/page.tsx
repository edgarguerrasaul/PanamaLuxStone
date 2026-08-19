"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cartLineId, useCart } from "@/lib/cart/store";

export default function CarritoPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeLine, updateLineArea, total } = useCart();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="font-serif text-2xl font-semibold">Tu carrito está vacío</h1>
        <Link href="/catalogo" className="btn-primary mt-6 inline-flex">
          Ver catálogo
        </Link>
      </div>
    );
  }

  const hasPedido = items.some((i) => i.mode === "pedido");
  const hasInmediato = items.some((i) => i.mode === "inmediato");

  return (
    <div className="container-app py-12">
      <h1 className="font-serif text-3xl font-semibold">Tu carrito</h1>

      {hasPedido && (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Tu carrito incluye piedra <strong>por pedido</strong> (importación): tiempo de entrega estimado de{" "}
          <strong>4 a 6 meses</strong>.
        </p>
      )}
      {hasInmediato && (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          Tu carrito incluye piedra de <strong>stock inmediato</strong> — entrega mucho más rápida.
        </p>
      )}

      <div className="mt-8 space-y-4">
        {items.map((item) => {
          const lineId = cartLineId(item);
          return (
            <div key={lineId} className="flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="relative h-20 w-20 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  ${item.pricePerM2}/m²
                  {item.sizeLabel && ` · ${item.sizeLabel}`}
                  {item.thicknessCm && ` · ${item.thicknessCm} cm`}
                </p>
                <p className="text-xs uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  {item.mode === "pedido" ? "Compra por pedido (4-6 meses)" : "Compra inmediata (stock local)"}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                m²
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={item.areaM2}
                  onChange={(e) => updateLineArea(lineId, Number(e.target.value))}
                  className="w-20 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>
              <p className="w-24 text-right font-medium">${(item.areaM2 * item.pricePerM2).toFixed(2)}</p>
              <button onClick={() => removeLine(lineId)} className="text-sm text-neutral-400 hover:text-red-600">
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <p className="text-lg font-semibold">Total estimado: ${total().toFixed(2)}</p>
        <Link href="/checkout" className="btn-primary">
          Continuar al pago
        </Link>
      </div>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        El total final puede variar tras la medición en sitio (cortes, desperdicio de placa e instalación). El
        acarreo se calcula en el siguiente paso según tu zona de entrega.
      </p>
    </div>
  );
}
