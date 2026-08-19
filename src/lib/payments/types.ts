// ────────────────────────────────────────────────────────────────
// Contrato común que TODAS las pasarelas de pago deben cumplir.
//
// La idea de este "middleware de pagos" es simple: el checkout del
// sitio nunca habla directamente con Yappy, con PagueloFácil o con
// Stripe. Solo habla con esta interfaz (PaymentProvider). Así, si
// mañana cambias de banco o agregas una pasarela nueva, solo creas
// un archivo más en providers/ y lo registras en index.ts — el resto
// del sitio (checkout, carrito, correos) no se toca.
// ────────────────────────────────────────────────────────────────

export type PaymentMethodId = "yappy" | "card" | "transfer";

export interface CreatePaymentInput {
  orderId: string;
  amountCents: number; // siempre en centavos para evitar errores de decimales
  currency: "USD";
  customerEmail: string;
  customerName: string;
  description: string;
  returnUrl: string; // a dónde regresa el cliente si el pago fue exitoso
  cancelUrl: string; // a dónde regresa si canceló
}

export interface CreatePaymentResult {
  // Si la pasarela requiere redirigir al cliente (Yappy, tarjeta hospedada), va aquí.
  redirectUrl?: string;
  // Referencia interna de la pasarela, para poder rastrear el pago luego.
  providerReference: string;
  status: "requires_redirect" | "pending" | "requires_manual_confirmation";
}

export interface WebhookVerificationResult {
  orderId: string;
  providerReference: string;
  status: "paid" | "failed";
  raw: unknown;
}

export interface PaymentProvider {
  id: PaymentMethodId;
  displayName: string;
  /** Inicia el cobro. Devuelve a dónde mandar al cliente (si aplica). */
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Valida y procesa la notificación (webhook) que manda la pasarela cuando el pago se confirma o falla. */
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult | null>;
}
