"use client";

// Carrito de compras en memoria (zustand), persistido en localStorage
// del navegador del cliente — NO se usa localStorage directo de forma
// manual, la librería lo maneja internamente de forma segura para Next.js.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PurchaseMode = "pedido" | "inmediato";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  pricePerM2: number;
  areaM2: number;
  /** Medida elegida, ej. "320 × 160 cm". */
  sizeLabel?: string;
  /** Espesor elegido en cm, ej. 1.2 o 1.5. */
  thicknessCm?: number;
  /** Cantidad de láminas de esta medida (areaM2 = slabs × área de una lámina). Opcional por compatibilidad con líneas viejas guardadas sin este dato. */
  slabs?: number;
  /** De qué pestaña vino el ítem: "pedido" (4-6 meses) o "inmediato" (stock local). */
  mode: PurchaseMode;
}

/**
 * Identifica una línea única del carrito. Dos selecciones del mismo
 * producto con distinta medida/espesor son líneas separadas, así que no
 * basta con el productId para agregar, quitar o editar una línea.
 */
export function cartLineId(item: Pick<CartItem, "productId" | "sizeLabel" | "thicknessCm">) {
  return `${item.productId}::${item.sizeLabel ?? ""}::${item.thicknessCm ?? ""}`;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeLine: (lineId: string) => void;
  updateLineArea: (lineId: string, areaM2: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const id = cartLineId(item);
          const existing = state.items.find((i) => cartLineId(i) === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartLineId(i) === id
                  ? {
                      ...i,
                      areaM2: i.areaM2 + item.areaM2,
                      // Si ambas líneas traen conteo de láminas, se suman; si
                      // cualquiera de las dos no lo trae (ej. una línea vieja
                      // guardada antes de este cambio), se deja de contar
                      // láminas para esa línea en vez de mostrar un número
                      // incorrecto.
                      slabs: i.slabs !== undefined && item.slabs !== undefined ? i.slabs + item.slabs : undefined,
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeLine: (lineId) => set((state) => ({ items: state.items.filter((i) => cartLineId(i) !== lineId) })),
      updateLineArea: (lineId, areaM2) =>
        set((state) => ({
          // Editar el m² a mano (desde el carrito) desconecta la línea del
          // conteo de láminas, porque ya no es necesariamente un múltiplo
          // exacto del área de una lámina.
          items: state.items.map((i) => (cartLineId(i) === lineId ? { ...i, areaM2, slabs: undefined } : i)),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.areaM2 * i.pricePerM2, 0),
    }),
    { name: "panamaluxstone-cart" }
  )
);
