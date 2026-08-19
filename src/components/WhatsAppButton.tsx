import { buildWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/data/business";

/**
 * Botón flotante de WhatsApp, visible en todas las páginas (se monta en
 * el layout raíz). Ver src/data/business.ts para cambiar el número o el
 * mensaje predeterminado.
 */
export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.02 3C9.4 3 4.02 8.38 4.02 15c0 2.22.6 4.3 1.65 6.08L3 29l8.12-2.6A11.9 11.9 0 0 0 16.02 27C22.65 27 28.02 21.62 28.02 15S22.65 3 16.02 3zm0 21.7c-1.94 0-3.75-.53-5.3-1.46l-.38-.22-4.82 1.55 1.57-4.7-.25-.4A9.62 9.62 0 0 1 5.32 15c0-5.9 4.8-10.7 10.7-10.7 5.9 0 10.7 4.8 10.7 10.7 0 5.9-4.8 10.7-10.7 10.7zm5.87-8.02c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.5-.16-.72.16-.21.32-.83 1.04-1.02 1.25-.19.21-.38.24-.7.08-.32-.16-1.34-.5-2.55-1.58-.94-.84-1.58-1.87-1.76-2.19-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.72-1.75-.99-2.39-.26-.63-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.43 5.44 4.8.76.33 1.35.52 1.82.67.76.24 1.46.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.6-.37z" />
      </svg>
    </a>
  );
}
