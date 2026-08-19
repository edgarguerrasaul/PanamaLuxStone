import ContactForm from "@/components/ContactForm";
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  FACEBOOK_URL,
  GOOGLE_MAPS_EMBED_URL,
  INSTAGRAM_URL,
  PHYSICAL_ADDRESS,
  WHATSAPP_NUMBER,
  buildWhatsAppUrl,
  WHATSAPP_DEFAULT_MESSAGE,
} from "@/data/business";

export const metadata = { title: `Contáctanos — ${BRAND_NAME}` };

export default function ContactoPage() {
  const isWhatsAppConfigured = WHATSAPP_NUMBER !== "50700000000";

  return (
    <div className="container-app py-12">
      <h1 className="font-serif text-3xl font-semibold">Contáctanos</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">Escríbenos por el canal que prefieras, o llena el formulario.</p>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">WhatsApp</p>
            {isWhatsAppConfigured ? (
              <a
                href={buildWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-600 hover:underline"
              >
                Escribirnos por WhatsApp
              </a>
            ) : (
              <p className="text-neutral-500 dark:text-neutral-400">[pendiente de definir]</p>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Correo</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold-600 hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Redes sociales</p>
            <div className="flex gap-4">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">
                Instagram
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:underline">
                Facebook
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Ubicación</p>
            <p className="text-neutral-700 dark:text-neutral-300">{PHYSICAL_ADDRESS}</p>
          </div>
          {GOOGLE_MAPS_EMBED_URL && (
            <div className="aspect-video overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
              <iframe
                src={GOOGLE_MAPS_EMBED_URL}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de ubicación"
              />
            </div>
          )}
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Escríbenos</p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
