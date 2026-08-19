// Transferencia / depósito bancario. Muy usado por los clientes
// grandes (constructoras, desarrolladores) que prefieren pagar por
// transferencia en vez de tarjeta. No hay redirección: se muestran
// los datos de la cuenta y el pedido queda "pendiente de confirmar"
// hasta que alguien del equipo lo marque como pagado al ver el
// comprobante (a mano, o luego conectando esto a un webhook bancario).
import type { PaymentProvider, CreatePaymentInput, CreatePaymentResult } from "../types";

export const transferProvider: PaymentProvider = {
  id: "transfer",
  displayName: "Transferencia bancaria",

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      providerReference: `TRANSFER-${input.orderId}`,
      status: "requires_manual_confirmation",
    };
  },

  async verifyWebhook(): Promise<null> {
    // No aplica: la confirmación de transferencias se hace manualmente
    // desde el panel de pedidos (o se automatiza más adelante).
    return null;
  },
};
