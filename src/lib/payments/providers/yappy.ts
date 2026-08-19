// ────────────────────────────────────────────────────────────────
// Yappy (Banco General) — el método de pago más usado por
// consumidores en Panamá. Se paga desde la app del celular.
//
// IMPORTANTE: Yappy exige registrar el negocio como "Yappy Comercial"
// para obtener YAPPY_MERCHANT_ID y YAPPY_SECRET_KEY, y te entregan su
// documentación técnica oficial en ese proceso. Los nombres de los
// endpoints de abajo son la estructura típica de este tipo de
// integración (validar comercio -> crear orden -> redirigir a la app
// -> recibir confirmación), pero DEBES ajustarlos con la URL exacta
// que te den al activar la cuenta. Está separado en su propio
// archivo justamente para que ese ajuste no toque nada más del sitio.
// ────────────────────────────────────────────────────────────────
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, WebhookVerificationResult } from "../types";

const BASE_URL =
  process.env.YAPPY_ENV === "production"
    ? "https://api.yappy.com.pa"
    : "https://api-sandbox.yappy.com.pa";

export const yappyProvider: PaymentProvider = {
  id: "yappy",
  displayName: "Yappy",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const merchantId = process.env.YAPPY_MERCHANT_ID;
    const secretKey = process.env.YAPPY_SECRET_KEY;
    if (!merchantId || !secretKey) {
      throw new Error("Falta YAPPY_MERCHANT_ID / YAPPY_SECRET_KEY en el archivo .env");
    }

    // TODO: reemplazar por el endpoint real que indique la documentación
    // de Yappy Comercial ("payments/payment-wc" o el que corresponda).
    const res = await fetch(`${BASE_URL}/payments/payment-wc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        orderId: input.orderId,
        domain: process.env.NEXT_PUBLIC_SITE_URL,
        paymentDate: Date.now(),
        aliasYappy: undefined,
        ipnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/payments/yappy`,
        discount: "0.00",
        taxes: "0.00",
        subtotal: (input.amountCents / 100).toFixed(2),
        total: (input.amountCents / 100).toFixed(2),
      }),
    });

    if (!res.ok) {
      throw new Error(`Yappy respondió con error (${res.status}). Revisa las credenciales y el endpoint.`);
    }

    const data = await res.json();

    return {
      redirectUrl: data.body?.transactionUrl ?? data.transactionUrl,
      providerReference: data.body?.token ?? data.token ?? input.orderId,
      status: "requires_redirect",
    };
  },

  async verifyWebhook(rawBody: string): Promise<WebhookVerificationResult | null> {
    // Yappy notifica el resultado del pago a esta URL (IPN). La forma
    // exacta del payload la define su documentación; aquí se deja el
    // patrón esperado (status + referencia de la orden) para adaptarlo
    // rápido cuando tengas las credenciales reales.
    try {
      const payload = JSON.parse(rawBody);
      const orderId = payload.orderId ?? payload.body?.orderId;
      const status = payload.status ?? payload.body?.status;
      if (!orderId) return null;

      return {
        orderId,
        providerReference: payload.token ?? payload.body?.token ?? orderId,
        status: status === "E" || status === "COMPLETED" ? "paid" : "failed",
        raw: payload,
      };
    } catch {
      return null;
    }
  },
};
