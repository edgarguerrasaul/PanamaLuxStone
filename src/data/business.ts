// Datos reales del negocio, centralizados en un solo archivo para que
// sea fácil actualizarlos sin tocar componentes.
//
// TODO (Edgar): todo lo marcado [PENDIENTE] es un valor de relleno —
// reemplázalo por el dato real antes de publicar el sitio.

export const BRAND_NAME = "Panamá LuxeStone";

// Número de WhatsApp del negocio, en formato internacional SIN "+" ni
// espacios (ej. "50761234567" para un número panameño). Se usa para
// armar los links "https://wa.me/...".
export const WHATSAPP_NUMBER = "50765524100"; // [PENDIENTE] reemplazar con el número real

export const CONTACT_EMAIL = "ventas@panamaluxestone.com"; // [PENDIENTE] confirmar dominio real
export const INSTAGRAM_URL = "https://instagram.com/panamaluxestone"; // [PENDIENTE]
export const FACEBOOK_URL = "https://facebook.com/panamaluxestone"; // [PENDIENTE]
export const PHYSICAL_ADDRESS = "Ciudad de Panamá, Panamá"; // [PENDIENTE] dirección exacta si aplica
// URL de embed de Google Maps (Google Maps → Compartir → Insertar un mapa → copiar el "src" del iframe).
export const GOOGLE_MAPS_EMBED_URL = ""; // [PENDIENTE] dejar vacío oculta el mapa

// Datos bancarios para pagos por transferencia (sección "Pasarela de pagos").
export const BANK_TRANSFER_INFO = {
  bankName: "[PENDIENTE] Nombre del banco",
  accountHolder: "[PENDIENTE] Titular de la cuenta",
  accountType: "[PENDIENTE] Cuenta corriente / ahorros",
  accountNumber: "[PENDIENTE] Número de cuenta",
  ruc: "[PENDIENTE] RUC / cédula jurídica",
};

// Datos para pagos por Yappy.
export const YAPPY_INFO = {
  phone: "[PENDIENTE] Número de Yappy",
  qrImageUrl: "", // [PENDIENTE] URL de la imagen del QR de Yappy (súbela a /public/images o Cloudinary)
};

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Igual que buildWhatsAppUrl, pero para un número arbitrario (ej. el de
 * un instalador recomendado, no el del negocio). Quita cualquier
 * caracter que no sea dígito, como espacios o guiones.
 */
export function buildWhatsAppUrlFor(phone: string, message: string) {
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hola, quiero agendar una visita para ver muestras de piedra sinterizada.";

export function whatsAppProductMessage(productName: string) {
  return `Hola, quiero agendar una visita para ver muestras de "${productName}".`;
}
