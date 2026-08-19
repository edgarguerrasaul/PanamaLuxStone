// Pasarela internacional (tarjetas de fuera de Panamá, o como respaldo).
// Usa Stripe Checkout: es la opción con menos código y más confiable
// para cobrar con tarjeta si algún día venden a clientes fuera de Panamá.
import Stripe from "stripe";
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult, WebhookVerificationResult } from "../types";

function getClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Falta STRIPE_SECRET_KEY en el archivo .env");
  return new Stripe(key);
}

export const stripeProvider: PaymentProvider = {
  id: "card",
  displayName: "Tarjeta (Stripe)",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const stripe = getClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.customerEmail,
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: { name: input.description },
            unit_amount: input.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      metadata: { orderId: input.orderId },
    });

    return {
      redirectUrl: session.url ?? undefined,
      providerReference: session.id,
      status: "requires_redirect",
    };
  },

  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult | null> {
    const stripe = getClient();
    const signature = headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !secret) return null;

    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (!orderId) return null;
      return {
        orderId,
        providerReference: session.id,
        status: "paid",
        raw: event,
      };
    }

    return null;
  },
};
