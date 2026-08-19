"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { useSideCart } from "@/lib/cart/ui-store";

export interface AvailableSize {
  widthCm: number;
  heightCm: number;
  thicknessesCm: number[];
}

export default function AddToCartButton({
  product,
  availableSizesJson,
  immediateStock,
}: {
  product: { productId: string; slug: string; name: string; imageUrl: string; pricePerM2: number };
  availableSizesJson: string;
  immediateStock: boolean;
}) {
  const addItem = useCart((s) => s.addItem);
  const openCart = useSideCart((s) => s.openCart);
  const [area, setArea] = useState(5.12); // una placa estándar por defecto
  const [added, setAdded] = useState(false);

  const sizes: AvailableSize[] = useMemo(() => {
    try {
      const parsed = JSON.parse(availableSizesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [availableSizesJson]);

  const [sizeIndex, setSizeIndex] = useState<number | null>(null);
  const [thickness, setThickness] = useState<number | null>(null);

  const selectedSize = sizeIndex !== null ? sizes[sizeIndex] : null;
  const canAdd = selectedSize !== null && thickness !== null;

  function handleAdd() {
    if (!selectedSize || thickness === null) return;
    addItem({
      ...product,
      areaM2: area,
      sizeLabel: `${selectedSize.widthCm} × ${selectedSize.heightCm} cm`,
      thicknessCm: thickness,
      mode: immediateStock ? "inmediato" : "pedido",
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium">1. Elige la medida</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s, i) => (
              <button
                key={`${s.widthCm}x${s.heightCm}`}
                type="button"
                onClick={() => {
                  setSizeIndex(i);
                  setThickness(null);
                }}
                className={`rounded border px-3 py-1.5 text-sm ${
                  sizeIndex === i
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-gold-600 dark:bg-gold-600"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {s.widthCm} × {s.heightCm} cm
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedSize && (
        <div>
          <p className="text-sm font-medium">2. Elige el espesor</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedSize.thicknessesCm.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setThickness(t)}
                className={`rounded border px-3 py-1.5 text-sm ${
                  thickness === t
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-gold-600 dark:bg-gold-600"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                {t} cm
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          m² a comprar
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="w-20 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={!canAdd} onClick={handleAdd}>
          {added ? "Agregado ✓" : "Agregar al carrito"}
        </button>
      </div>
      {!canAdd && sizes.length > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Elige medida y espesor para poder agregar al carrito.</p>
      )}
    </div>
  );
}
