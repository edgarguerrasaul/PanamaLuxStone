// Punto único de entrada al "middleware de pagos".
// El checkout SIEMPRE importa desde aquí, nunca directo de providers/*.
import { yappyProvider } from "./providers/yappy";
import { pagueloFacilProvider } from "./providers/paguelofacil";
import { stripeProvider } from "./providers/stripe";
import { transferProvider } from "./providers/transfer";
import type { PaymentMethodId, PaymentProvider } from "./types";

// Card tiene dos posibles implementaciones (Panamá vs internacional).
// Por defecto usamos PagueloFácil para tarjetas locales; si el pedido
// viene de fuera de Panamá (o no hay credenciales de PagueloFácil),
// se usa Stripe como respaldo.
function cardProvider(): PaymentProvider {
  const hasLocal = Boolean(process.env.PAGUELOFACIL_API_KEY);
  return hasLocal ? pagueloFacilProvider : stripeProvider;
}

export function getPaymentProvider(method: PaymentMethodId): PaymentProvider {
  switch (method) {
    case "yappy":
      return yappyProvider;
    case "card":
      return cardProvider();
    case "transfer":
      return transferProvider;
    default:
      throw new Error(`Método de pago no soportado: ${method}`);
  }
}

export const availablePaymentMethods: { id: PaymentMethodId; label: string; hint: string }[] = [
  { id: "yappy", label: "Yappy", hint: "Pago instantáneo desde tu celular" },
  { id: "card", label: "Tarjeta", hint: "Visa / Mastercard" },
  { id: "transfer", label: "Transferencia", hint: "Ideal para pedidos grandes o de empresas" },
];

export * from "./types";
