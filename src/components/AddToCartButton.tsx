"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/store";
import { useSideCart } from "@/lib/cart/ui-store";

export interface AvailableSize {
  widthCm: number;
  heightCm: number;
  thicknessesCm: number[];
}

/** Una combinación concreta de medida + espesor que el cliente puede comprar (ej. "320×160 cm en 1.2cm"). */
interface SizeThicknessOption {
  key: string;
  widthCm: number;
  heightCm: number;
  thicknessCm: number;
  /** m² de UNA lámina de esta medida, calculado de las dimensiones (no se escribe a mano ni depende del espesor). */
  areaPerSlab: number;
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

  // Cada medida puede venir en uno o más espesores (ej. 320×160 solo en
  // 1.2cm, pero 240×80 en 1.2cm y 1.5cm), y no todas las medidas
  // comparten los mismos espesores — por eso cada combinación
  // medida+espesor es su propia opción, con su propia cantidad. Así el
  // cliente arma un pedido totalmente personalizado: por ejemplo 2
  // láminas de 320×160 (1.2cm) + 3 de 240×80 en 1.5cm + 1 de 200×70 en
  // 1.2cm, todo en la misma compra.
  const options: SizeThicknessOption[] = useMemo(
    () =>
      sizes.flatMap((s) =>
        s.thicknessesCm.map((t) => ({
          key: `${s.widthCm}x${s.heightCm}@${t}`,
          widthCm: s.widthCm,
          heightCm: s.heightCm,
          thicknessCm: t,
          areaPerSlab: Number(((s.widthCm * s.heightCm) / 10000).toFixed(2)),
        }))
      ),
    [sizes]
  );

  // Cantidad de láminas por combinación medida+espesor, guardada como
  // texto (no número) mientras el cliente escribe, para poder dejar el
  // campo vacío momentáneamente sin que salte a 0.
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  function quantityFor(key: string): number {
    const n = Math.floor(Number(quantities[key] ?? ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function handleQuantityChange(key: string, raw: string) {
    // Solo dígitos — evita negativos, decimales o texto suelto.
    const cleaned = raw.replace(/[^0-9]/g, "");
    setQuantities((prev) => ({ ...prev, [key]: cleaned }));
  }

  const selected = options.filter((o) => quantityFor(o.key) > 0);
  const totalSlabs = selected.reduce((sum, o) => sum + quantityFor(o.key), 0);
  const totalArea = Number(selected.reduce((sum, o) => sum + quantityFor(o.key) * o.areaPerSlab, 0).toFixed(2));

  // Agrupamos las opciones por medida solo para mostrarlas ordenadas en
  // la pantalla (cada espesor sigue siendo una fila con su propio input).
  const sizeGroups = useMemo(() => {
    const groups: { widthCm: number; heightCm: number; options: SizeThicknessOption[] }[] = [];
    for (const o of options) {
      let group = groups.find((g) => g.widthCm === o.widthCm && g.heightCm === o.heightCm);
      if (!group) {
        group = { widthCm: o.widthCm, heightCm: o.heightCm, options: [] };
        groups.push(group);
      }
      group.options.push(o);
    }
    return groups;
  }, [options]);

  const canAdd = selected.length > 0;

  function handleAdd() {
    if (!canAdd) return;
    for (const o of selected) {
      const slabs = quantityFor(o.key);
      addItem({
        ...product,
        areaM2: Number((slabs * o.areaPerSlab).toFixed(2)),
        slabs,
        sizeLabel: `${o.widthCm} × ${o.heightCm} cm`,
        thicknessCm: o.thicknessCm,
        mode: immediateStock ? "inmediato" : "pedido",
      });
    }
    setAdded(true);
    openCart();
    setQuantities({});
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {sizeGroups.length > 0 && (
        <div>
          <p className="text-sm font-medium">Elige medida, espesor y cuántas láminas de cada combinación</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Puedes combinar varias medidas y espesores en el mismo pedido — deja en 0 (o vacío) las que no
            necesites. No todas las medidas vienen en los mismos espesores.
          </p>
          <div className="mt-2 space-y-3">
            {sizeGroups.map((group) => (
              <div key={`${group.widthCm}x${group.heightCm}`} className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
                <p className="font-medium">
                  {group.widthCm} × {group.heightCm} cm
                  <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                    {group.options[0].areaPerSlab.toFixed(2)} m² por lámina
                  </span>
                </p>
                <div className="mt-2 space-y-2">
                  {group.options.map((o) => {
                    const qty = quantityFor(o.key);
                    return (
                      <div
                        key={o.key}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded border px-3 py-2 text-sm ${
                          qty > 0
                            ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                            : "border-neutral-300 dark:border-neutral-700"
                        }`}
                      >
                        <span>Espesor {o.thicknessCm} cm</span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">Láminas</span>
                            <input
                              type="number"
                              inputMode="numeric"
                              min={0}
                              step={1}
                              placeholder="0"
                              value={quantities[o.key] ?? ""}
                              onChange={(e) => handleQuantityChange(o.key, e.target.value)}
                              className="w-16 rounded border border-neutral-300 px-2 py-1 text-right dark:border-neutral-700 dark:bg-neutral-900"
                            />
                          </label>
                          {qty > 0 && (
                            <span className="w-20 text-right text-xs font-medium text-neutral-600 dark:text-neutral-300">
                              {(qty * o.areaPerSlab).toFixed(2)} m²
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm">
          <p className="text-neutral-500 dark:text-neutral-400">
            {totalSlabs > 0
              ? `${totalSlabs} lámina${totalSlabs === 1 ? "" : "s"} en total`
              : "Elige cuántas láminas quieres de cada combinación"}
          </p>
          <p className="text-base font-semibold">m² totales: {totalArea.toFixed(2)}</p>
        </div>
        <button className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" disabled={!canAdd} onClick={handleAdd}>
          {added ? "Agregado ✓" : "Agregar al carrito"}
        </button>
      </div>
      {!canAdd && sizeGroups.length > 0 && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Elige al menos una combinación de medida y espesor con cantidad de láminas para poder agregar al carrito.
        </p>
      )}
    </div>
  );
}
