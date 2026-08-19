"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/store";
import { BANK_TRANSFER_INFO, YAPPY_INFO } from "@/data/business";

const PAYMENT_METHODS = [
  { id: "yappy", label: "Yappy", hint: "Pago instantáneo desde tu celular" },
  { id: "card", label: "Tarjeta", hint: "Visa / Mastercard" },
  { id: "transfer", label: "Transferencia", hint: "Ideal para pedidos de empresas" },
] as const;

export interface FreightZoneOption {
  id: string;
  name: string;
  costPerSlab: number;
}

export default function CheckoutForm({ freightZones }: { freightZones: FreightZoneOption[] }) {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<(typeof PAYMENT_METHODS)[number]["id"]>("yappy");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [freightZoneId, setFreightZoneId] = useState<string>(freightZones[0]?.id ?? "");
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const requiresProof = method === "transfer" || method === "yappy";
  const freightCost = useMemo(
    () => freightZones.find((z) => z.id === freightZoneId)?.costPerSlab ?? 0,
    [freightZones, freightZoneId]
  );
  const grandTotal = total() + freightCost;
  const purchaseMode = items.some((i) => i.mode === "pedido") ? "pedido" : "inmediato";

  if (!mounted) return null;

  async function handleProofUpload(file: File) {
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setProofOfPaymentUrl(data.url);
    } finally {
      setUploadingProof(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: form.name, email: form.email, phone: form.phone },
          paymentMethod: method,
          purchaseMode,
          shippingAddress: form.address,
          freightZoneId: freightZoneId || undefined,
          proofOfPaymentUrl: proofOfPaymentUrl ?? undefined,
          items: items.map((i) => ({
            productId: i.productId,
            areaM2: i.areaM2,
            sizeLabel: i.sizeLabel,
            thicknessCm: i.thicknessCm,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar el pedido.");
        return;
      }

      clear();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/checkout/gracias?order=${data.orderId}`);
      }
    } catch {
      setError("Hubo un problema de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-app grid gap-10 py-12 sm:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="font-serif text-2xl font-semibold">Datos de contacto</h1>
        <input
          required
          placeholder="Nombre completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          required
          type="email"
          placeholder="Correo"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          placeholder="Teléfono / WhatsApp"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          placeholder="Dirección de instalación (opcional)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />

        {freightZones.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Zona de entrega</p>
            <select
              value={freightZoneId}
              onChange={(e) => setFreightZoneId(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {freightZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} — ${z.costPerSlab.toFixed(2)} de acarreo
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="mb-2 text-sm font-medium">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`rounded border px-3 py-3 text-left text-sm ${
                  method === m.id
                    ? "border-neutral-900 bg-neutral-50 dark:border-gold-600 dark:bg-neutral-800"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{m.hint}</p>
              </button>
            ))}
          </div>
        </div>

        {requiresProof && (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900">
            {method === "transfer" ? (
              <div className="space-y-1">
                <p className="font-medium">Datos para transferencia</p>
                <p>Banco: {BANK_TRANSFER_INFO.bankName}</p>
                <p>Titular: {BANK_TRANSFER_INFO.accountHolder}</p>
                <p>Tipo de cuenta: {BANK_TRANSFER_INFO.accountType}</p>
                <p>Número de cuenta: {BANK_TRANSFER_INFO.accountNumber}</p>
                <p>RUC: {BANK_TRANSFER_INFO.ruc}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="font-medium">Datos para Yappy</p>
                <p>Número: {YAPPY_INFO.phone}</p>
              </div>
            )}
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Tu pedido quedará como <strong>"Pendiente de confirmación"</strong> hasta que revisemos tu comprobante.
            </p>
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
              <span className="text-sm">
                {uploadingProof ? "Subiendo..." : proofOfPaymentUrl ? "Comprobante subido ✓" : "Subir comprobante (opcional ahora, puedes enviarlo luego por WhatsApp)"}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleProofUpload(e.target.files[0])}
              />
            </label>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full">
          {loading ? "Procesando..." : `Confirmar pedido — $${grandTotal.toFixed(2)}`}
        </button>
      </form>

      <div>
        <h2 className="font-serif text-xl font-semibold">Resumen del pedido</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {items.map((i) => (
            <li key={`${i.productId}-${i.sizeLabel}-${i.thicknessCm}`} className="flex justify-between">
              <span>
                {i.name}
                {i.sizeLabel && ` (${i.sizeLabel}${i.thicknessCm ? `, ${i.thicknessCm}cm` : ""})`} — {i.areaM2} m²
              </span>
              <span>${(i.areaM2 * i.pricePerM2).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
          <div className="flex justify-between">
            <span>Subtotal materiales</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Acarreo</span>
            <span>${freightCost.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-2 flex justify-between border-t border-neutral-200 pt-4 font-semibold dark:border-neutral-800">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
