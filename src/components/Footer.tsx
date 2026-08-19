import {
  BRAND_NAME,
  CONTACT_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHYSICAL_ADDRESS,
  WHATSAPP_NUMBER,
  buildWhatsAppUrl,
  WHATSAPP_DEFAULT_MESSAGE,
} from "@/data/business";

export default function Footer() {
  const isWhatsAppConfigured = WHATSAPP_NUMBER !== "50700000000";

  return (
    <footer id="contacto" className="border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="container-app grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-lg text-white">{BRAND_NAME}</p>
          <p className="mt-2 text-sm text-neutral-400">
            Piedra sinterizada, mármol y granito para proyectos residenciales y comerciales en toda Panamá.
          </p>
          <div className="mt-4 flex gap-4 text-sm">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Instagram
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white">
              Facebook
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Contacto</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>
              {isWhatsAppConfigured ? (
                <a
                  href={buildWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              ) : (
                "WhatsApp: [pendiente de definir]"
              )}
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>{PHYSICAL_ADDRESS}</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Enlaces</p>
          <ul className="mt-2 space-y-1 text-sm text-neutral-400">
            <li>
              <a href="/catalogo" className="hover:text-white">
                Catálogo
              </a>
            </li>
            <li>
              <a href="/cotizador" className="hover:text-white">
                Cotizador
              </a>
            </li>
            <li>
              <a href="/instaladores" className="hover:text-white">
                Instaladores recomendados
              </a>
            </li>
            <li>
              <a href="/contacto" className="hover:text-white">
                Contáctanos
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500 dark:border-neutral-900">
        © {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.
      </p>
    </footer>
  );
}
