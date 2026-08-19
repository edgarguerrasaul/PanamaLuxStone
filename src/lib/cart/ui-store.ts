"use client";

// Estado de la interfaz del carrito lateral (side cart). Deliberadamente
// separado de useCart (src/lib/cart/store.ts), que guarda los ITEMS del
// carrito y sí se persiste en localStorage — esto solo guarda si el
// panel está abierto o cerrado, así que no necesita persistir entre
// visitas.
import { create } from "zustand";

interface SideCartState {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useSideCart = create<SideCartState>((set) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
  toggleCart: () => set((s) => ({ open: !s.open })),
}));
