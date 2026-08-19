"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";

type Product = {
  id: string;
  slug: string;
  name: string;
  pricePerM2: number;
  priceConfirmed: boolean;
  immediateStock: boolean;
  thumbUrl: string;
};
type FreightZone = { id: string; name: string; costPerSlab: number };

// Las mismas 3 medidas de placa que se ofrecen en la ficha de cada
// producto (ver el valor por defecto de `availableSizes` en
// prisma/schema.prisma y AddToCartButton.tsx). El cotizador no pide
// medir superficie por superficie: solo cuántas placas y de qué tamaño.
const PLATE_SIZES = [
  { widthCm: 320, heightCm: 160 },
  { widthCm: 240, heightCm: 80 },
  { widthCm: 200, heightCm: 70 },
];

export default function QuoteCalculator({ products, freightZones }: { products: Product[]; freightZones: FreightZone[] }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [step, setStep] = useState(1);
  const [plateSizeIndex, setPlateSizeIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [wantsFreight, setWantsFreight] = useState<boolean | null>(null);
  const [freightZoneId, setFreightZoneId] = useState<string>(freightZones[0]?.id ?? "");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    areaTotalM2: number;
    slabsNeeded: number;
    estimatedTotal: number;
    freightCost: number;
    totalWithFreight: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPlateSize = plateSizeIndex !== null ? PLATE_SIZES[plateSizeIndex] : null;
  const areaTotal = useMemo(() => {
    if (!selectedPlateSize || quantity <= 0) return 0;
    return quantity * (selectedPlateSize.widthCm / 100) * (selectedPlateSize.heightCm / 100);
  }, [selectedPlateSize, quantity]);

  const selectedProduct = products.find((p) => p.id === productId);
  const estimate = selectedProduct ? areaTotal * selectedProduct.pricePerM2 : 0;
  const selectedZone = freightZones.find((z) => z.id === freightZoneId);
  const freightPreview = wantsFreight && selectedZone ? selectedZone.costPerSlab * quantity : 0;

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setPhotoUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedPlateSize) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail,
          contactPhone,
          productId,
          quantity,
          plateWidthCm: selectedPlateSize.widthCm,
          plateHeightCm: selectedPlateSize.heightCm,
          freightZoneId: wantsFreight ? freightZoneId || undefined : undefined,
          photoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar la cotización.");
        return;
      }
      setResult({
        areaTotalM2: data.areaTotalM2,
        slabsNeeded: data.slabsNeeded,
        estimatedTotal: data.estimatedTotal,
        freightCost: data.freightCost,
        totalWithFreight: data.totalWithFreight,
      });
    } catch {
      setError("Hubo un problema de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleConvertToOrder() {
    if (!selectedProduct) return;
    addItem({
      productId: selectedProduct.id,
      slug: selectedProduct.slug,
      name: selectedProduct.name,
      imageUrl: selectedProduct.thumbUrl,
      pricePerM2: selectedProduct.pricePerM2,
      areaM2: areaTotal,
      mode: selectedProduct.immediateStock ? "inmediato" : "pedido",
    });
    router.push("/carrito");
  }

  if (result) {
    return (
      <div className="mt-10 max-w-lg rounded-lg border border-neutral-200 p-8 print:border-0 dark:border-neutral-800">
        <h2 className="font-serif text-2xl font-semibold">Tu cotización</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">Cantidad de placas</dt>
            <dd className="font-medium">{result.slabsNeeded}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">Superficie total</dt>
            <dd className="font-medium">{result.areaTotalM2.toFixed(2)} m²</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500 dark:text-neutral-400">Materiales</dt>
            <dd className="font-medium">${result.estimatedTotal.toFixed(2)}</dd>
          </div>
          {result.freightCost > 0 && (
            <div className="flex justify-between">
              <dt className="text-neutral-500 dark:text-neutral-400">Acarreo {selectedZone && `(${selectedZone.name})`}</dt>
              <dd className="font-medium">${result.freightCost.toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-lg dark:border-neutral-800">
            <dt className="font-semibold">Total estimado</dt>
            <dd className="font-semibold text-gold-600">${result.totalWithFreight.toFixed(2)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          Te enviamos este estimado a {contactEmail}. Un asesor te contactará en menos de 24 horas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 print:hidden">
          <button className="btn-secondary" onClick={() => window.print()}>
            Imprimir / Guardar como PDF
          </button>
          {selectedProduct && (
            <button className="btn-primary" onClick={handleConvertToOrder}>
              Convertir en pedido
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-2xl">
      <div className="mb-8 flex gap-2 text-sm">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              step >= n
                ? "bg-neutral-900 text-white dark:bg-gold-600"
                : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {n}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-medium">01 · Placas que necesitas</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Elige la medida de placa y cuántas necesitas para tu proyecto.
          </p>

          <div>
            <p className="mb-2 text-sm font-medium">Medida de la placa</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {PLATE_SIZES.map((size, i) => (
                <button
                  key={`${size.widthCm}x${size.heightCm}`}
                  type="button"
                  onClick={() => setPlateSizeIndex(i)}
                  className={`rounded border px-3 py-3 text-center text-sm ${
                    plateSizeIndex === i
                      ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <p className="font-medium">
                    {size.widthCm} × {size.heightCm} cm
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {((size.widthCm / 100) * (size.heightCm / 100)).toFixed(2)} m² por placa
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between gap-4 text-sm font-medium">
              Cantidad de placas
              <input
                type="number"
                min={1}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.round(Number(e.target.value))))}
                className="w-24 rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
          </div>

          {areaTotal > 0 && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Superficie total aproximada: <strong>{areaTotal.toFixed(2)} m²</strong>
            </p>
          )}

          <button className="btn-primary" disabled={plateSizeIndex === null || quantity <= 0} onClick={() => setStep(2)}>
            Siguiente
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-medium">02 · Sube tu foto</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Fotografía de buena calidad del espacio actual (opcional, pero ayuda a nuestro equipo de diseño).
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <span className="text-3xl">📷</span>
            <span className="mt-2 text-sm">{uploading ? "Subiendo..." : photoUrl ? "Foto lista ✓" : "Toca aquí para subir tu foto"}</span>
            <span className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">JPG, PNG — alta resolución recomendada</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            />
          </label>
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Atrás
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-medium">03 · Escoge tu piedra</h2>
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded border border-neutral-200 p-2 dark:border-neutral-800">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => setProductId(p.id)}
                className={`rounded border px-3 py-2 text-left text-sm ${
                  productId === p.id
                    ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">${p.pricePerM2}/m²</p>
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">¿Deseas incluir el costo de acarreo en esta cotización?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2.5 text-sm ${
                  wantsFreight === true
                    ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="wantsFreight"
                  checked={wantsFreight === true}
                  onChange={() => setWantsFreight(true)}
                  className="accent-gold-600"
                />
                Sí, incluir el acarreo
              </label>
              <label
                className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-2.5 text-sm ${
                  wantsFreight === false
                    ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <input
                  type="radio"
                  name="wantsFreight"
                  checked={wantsFreight === false}
                  onChange={() => setWantsFreight(false)}
                  className="accent-gold-600"
                />
                No, solo el material
              </label>
            </div>
          </div>

          {wantsFreight && freightZones.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium">Zona de entrega</p>
              <select
                value={freightZoneId}
                onChange={(e) => setFreightZoneId(e.target.value)}
                className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
              >
                {freightZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} — ${z.costPerSlab.toFixed(2)}/placa
                  </option>
                ))}
              </select>
            </div>
          )}

          {estimate > 0 && (
            <p className="text-lg font-semibold">
              Estimado: <span className="text-gold-600">${(estimate + freightPreview).toFixed(2)}</span> (
              {areaTotal.toFixed(2)} m²{wantsFreight ? " + acarreo" : ", sin acarreo"})
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              type="email"
              placeholder="Tu correo"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <input
              placeholder="Teléfono / WhatsApp"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Atrás
            </button>
            <button
              className="btn-primary"
              disabled={!productId || !contactEmail || wantsFreight === null || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Enviando..." : "Calcular cotización"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
