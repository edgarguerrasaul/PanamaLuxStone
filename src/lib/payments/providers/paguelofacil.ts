// ────────────────────────────────────────────────────────────────
// PagueloFácil (o alternativamente Tilopay) — pasarela panameña para
// cobrar tarjetas Visa/Mastercard emitidas en Panamá, con liquidación
// en un banco local. Es la opción recomendada para "pagar con
// tarjeta" dentro de Panamá, complementando a Yappy.
//
// Igual que con Yappy: la URL exacta y el nombre de los campos los
// confirma la documentación que te entregan al abrir la cuenta de
// comercio. Esta capa ya deja resuelto el "cómo se conecta con el
// resto del sitio" para que ese ajuste sea rápido.
// ────────────────────────────────────────────────────────────────
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, WebhookVerificationResult } from "../types";

const BASE_URL =
  process.env.PAGUELOFACIL_ENV === "production"
    ? "https://secure.paguelofacil.com/api"
    : "https://sandbox.paguelofacil.com/api";

export const pagueloFacilProvider: PaymentProvider = {
  id: "card",
  displayName: "Tarjeta (PagueloFácil)",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const apiKey = process.env.PAGUELOFACIL_API_KEY;
    if (!apiKey) throw new Error("Falta PAGUELOFACIL_API_KEY en el archivo .env");

    // TODO: ajustar el endpoint/campos exactos según la documentación
    // oficial de PagueloFácil (o Tilopay, si terminan usando esa en su lugar).
    const res = await fetch(`${BASE_URL}/PosLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        CLIENT_ID: input.orderId,
        CANT_ITEMS: "1",
        TOTAL_ITEMS: (input.amountCents / 100).toFixed(2),
        DESCRIPTION: input.description,
        RETURN_URL: input.returnUrl,
        CANCEL_URL: input.cancelUrl,
        EMAIL_CLIENTE: input.customerEmail,
      }),
    });

    if (!res.ok) {
      throw new Error(`PagueloFácil respondió con error (${res.status}). Revisa las credenciales.`);
    }

    const data = await res.json();

    return {
      redirectUrl: data.linkPago ?? data.url,
      providerReference: data.opcionalCode ?? data.id ?? input.orderId,
      status: "requires_redirect",
    };
  },

  async verifyWebhook(rawBody: string): Promise<WebhookVerificationResult | null> {
    try {
      const payload = JSON.parse(rawBody);
      const orderId = payload.CLIENT_ID ?? payload.clientId;
      if (!orderId) return null;

      return {
        orderId,
        providerReference: payload.opcionalCode ?? orderId,
        status: payload.Estado === "1" || payload.status === "approved" ? "paid" : "failed",
        raw: payload,
      };
    } catch {
      return null;
    }
  },
};
