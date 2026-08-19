import Image from "next/image";
import { db } from "@/lib/db";
import { buildWhatsAppUrl, buildWhatsAppUrlFor } from "@/data/business";

export const revalidate = 3600;

const PROVINCE_ORDER = [
  "Bocas del Toro",
  "Coclé",
  "Colón",
  "Chiriquí",
  "Darién",
  "Herrera",
  "Los Santos",
  "Panamá",
  "Panamá Oeste",
  "Veraguas",
  "Ngäbe-Buglé",
  "Guna Yala",
  "Emberá",
];

export default async function InstaladoresPage() {
  const installers = await db.installer.findMany({
    where: { active: true },
    orderBy: [{ province: "asc" }, { name: "asc" }],
  });

  const byProvince = new Map<string, typeof installers>();
  for (const p of PROVINCE_ORDER) byProvince.set(p, []);
  for (const inst of installers) {
    if (!byProvince.has(inst.province)) byProvince.set(inst.province, []);
    byProvince.get(inst.province)!.push(inst);
  }

  return (
    <div className="container-app py-12">
      <h1 className="font-serif text-3xl font-semibold">Instaladores recomendados</h1>
      <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-400">
        Contactos de instaladores de confianza organizados por provincia. Estos son proveedores independientes:
        contáctalos directamente para coordinar tu instalación.
      </p>

      {installers.length === 0 && (
        <p className="mt-10 rounded-lg border border-neutral-200 p-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          Todavía no hay instaladores publicados en esta zona.{" "}
          <a href={buildWhatsAppUrl("Hola, ¿me pueden recomendar un instalador en mi zona?")} className="text-gold-600 underline">
            Escríbenos por WhatsApp
          </a>{" "}
          y te ayudamos a encontrar uno.
        </p>
      )}

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from(byProvince.entries())
          .filter(([, list]) => list.length > 0)
          .map(([province, list]) => (
            <div key={province} className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
              <h2 className="font-serif text-lg font-semibold">{province}</h2>
              <ul className="mt-3 space-y-4">
                {list.map((inst) => (
                  <li key={inst.id} className="flex items-center gap-3">
                    {inst.photoUrl && (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <Image src={inst.photoUrl} alt={inst.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{inst.name}</p>
                      <a
                        href={buildWhatsAppUrlFor(
                          inst.phone,
                          `Hola ${inst.name}, me recomendaron tus servicios de instalación desde Panamá LuxeStone.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold-600 hover:underline"
                      >
                        {inst.phone}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
