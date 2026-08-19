"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { useSideCart } from "@/lib/cart/ui-store";

export interface AvailableSize {
  widthCm: number;
  heightCm: number;
  thicknessesCm: number[];
}

/** m² de UNA lámina de esta medida, calculado de las dimensiones (no se escribe a mano). */
function areaPerSlabM2(size: AvailableSize): number {
  return Number(((size.widthCm * size.heightCm) / 10000).toFixed(2));
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
  const [added, setAdded] = useState(false);

  const sizes: AvailableSize[] = useMemo(() => {
    try {
      const parsed = JSON.parse(availableSizesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [availableSizesJson]);

  // Cantidad de láminas que el cliente quiere de CADA medida (puede pedir
  // varias medidas distintas a la vez, ej. 1 de 320×160 + 5 de 240×80).
  // Se guarda como texto (no número) mientras el cliente escribe, para
  // poder dejar el campo vacío momentáneamente sin que salte a 0.
  const [quantities, setQuantities] = useState<string[]>(() => sizes.map(() => ""));
  const [thickness, setThickness] = useState<number | null>(null);

  function quantityFor(i: number): number {
    const n = Math.floor(Number(quantities[i]));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function handleQuantityChange(i: number, raw: string) {
    // Solo dígitos — evita negativos, decimales o texto suelto.
    const cleaned = raw.replace(/[^0-9]/g, "");
    setQuantities((prev) => prev.map((q, idx) => (idx === i ? cleaned : q)));
  }

  const selectedSizes = useMemo(
    () =>
      sizes
        .map((size, i) => ({ size, index: i, slabs: quantityFor(i), areaPerSlab: areaPerSlabM2(size) }))
        .filter((s) => s.slabs > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sizes, quantities]
  );

  const totalSlabs = selectedSizes.reduce((sum, s) => sum + s.slabs, 0);
  const totalArea = Number(selectedSizes.reduce((sum, s) => sum + s.slabs * s.areaPerSlab, 0).toFixed(2));

  // Las opciones de espesor dependen de las medidas que el cliente ya
  // marcó con cantidad — si todavía no eligió ninguna, se muestran todos
  // los espesores disponibles en cualquier medida del producto.
  const thicknessSourceSizes = selectedSizes.length > 0 ? selectedSizes.map((s) => s.size) : sizes;
  const thicknessOptions = useMemo(
    () => Array.from(new Set(thicknessSourceSizes.flatMap((s) => s.thicknessesCm))).sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thicknessSourceSizes.map((s) => s.thicknessesCm.join(",")).join("|")]
  );

  // Si el espesor elegido dejó de estar disponible (porque el cliente
  // cambió qué medidas pidió) se trata como "sin elegir" en vez de dejar
  // agregar al carrito un espesor que ya no aplica a la combinación actual.
  const effectiveThickness = thickness !== null && thicknessOptions.includes(thickness) ? thickness : null;
  const canAdd = selectedSizes.length > 0 && effectiveThickness !== null;

  function handleAdd() {
    if (!canAdd || effectiveThickness === null) return;
    for (const s of selectedSizes) {
      addItem({
        ...product,
        areaM2: Number((s.slabs * s.areaPerSlab).toFixed(2)),
        slabs: s.slabs,
        sizeLabel: `${s.size.widthCm} × ${s.size.heightCm} cm`,
        thicknessCm: effectiveThickness,
        mode: immediateStock ? "inmediato" : "pedido",
      });
    }
    setAdded(true);
    openCart();
    setQuantities(sizes.map(() => ""));
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium">1. Elige la medida y cuántas láminas de cada una</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Puedes combinar varias medidas en el mismo pedido — deja en 0 (o vacío) las que no necesites.
          </p>
          <div className="mt-2 space-y-2">
            {sizes.map((s, i) => {
              const perSlab = areaPerSlabM2(s);
              const qty = quantityFor(i);
              return (
                <div
                  key={`${s.widthCm}x${s.heightCm}`}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${
                    qty > 0
                      ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      {s.widthCm} × {s.heightCm} cm
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{perSlab.toFixed(2)} m² por lámina</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">Láminas</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        placeholder="0"
                        value={quantities[i]}
                        onChange={(e) => handleQuantityChange(i, e.target.value)}
                        className="w-16 rounded border border-neutral-300 px-2 py-1 text-right dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </label>
                    {qty > 0 && (
                      <span className="w-20 text-right text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {(qty * perSlab).toFixed(2)} m²
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedSizes.length > 0 && (
        <div>
          <p className="text-sm font-medium">2. Elige el espesor</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {thicknessOptions.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setThickness(t)}
                className={`rounded border px-3 py-1.5 text-sm ${
                  effectiveThickness === t
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

      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm">
          <p className="text-neutral-500 dark:text-neutral-400">
            {totalSlabs > 0
              ? `${totalSlabs} lámina${totalSlabs === 1 ? "" : "s"} en total`
              : "Elige cuántas láminas quieres de cada medida"}
          </p>
          <p className="text-base font-semibold">m² totales: {totalArea.toFixed(2)}</p>
        </div>
        <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={!canAdd} onClick={handleAdd}>
          {added ? "Agregado ✓" : "Agregar al carrito"}
        </button>
      </div>
      {!canAdd && sizes.length > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Elige al menos una medida con cantidad de láminas y el espesor para poder agregar al carrito.
        </p>
      )}
    </div>
  );
}
