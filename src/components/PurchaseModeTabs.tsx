"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect } from "react";

const STORAGE_KEY = "panama-luxestone-modo-compra";
export type PurchaseMode = "pedido" | "inmediato";

/**
 * Selector "Compra por Pedido" / "Compra Inmediata" (sección 2 de la
 * especificación). El modo activo viaja en el query string (?modo=...)
 * para que el filtro del catálogo se resuelva en el servidor, y además
 * se guarda en sessionStorage para que se recuerde mientras dure la
 * sesión del navegador, incluso si el usuario navega fuera de /catalogo
 * y vuelve sin el parámetro en la URL.
 */
export default function PurchaseModeTabs({ mode }: { mode: PurchaseMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get("modo")) {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;
      if ((saved === "pedido" || saved === "inmediato") && saved !== mode) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("modo", saved);
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
    // Solo al montar: no queremos re-disparar esto en cada cambio de searchParams.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectMode(next: PurchaseMode) {
    if (typeof window !== "undefined") sessionStorage.setItem(STORAGE_KEY, next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("modo", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-full border border-neutral-300 p-1 dark:border-neutral-700">
      <button
        type="button"
        onClick={() => selectMode("pedido")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
          mode === "pedido"
            ? "bg-neutral-900 text-white dark:bg-gold-600"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
      >
        Compra por Pedido
      </button>
      <button
        type="button"
        onClick={() => selectMode("inmediato")}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
          mode === "inmediato"
            ? "bg-neutral-900 text-white dark:bg-gold-600"
            : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
      >
        Compra Inmediata
      </button>
    </div>
  );
}
