import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 3600; // la home se regenera sola cada hora (rápida siempre, datos casi al día)

export default async function HomePage() {
  const featured = await db.product.findMany({ where: { featured: true }, take: 4 });
  const totalProducts = await db.product.count();

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="/images/products/prada-green.webp"
            alt="Piedra sinterizada Panamá LuxeStone instalada"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="container-app relative z-10 py-24 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold-400">Piedra sinterizada · Mármol · Granito</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-6xl">Panamá LuxeStone</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-200">Superficies de excepción para tu proyecto</p>
          <p className="mx-auto mt-6 max-w-xl text-neutral-300">
            {totalProducts} modelos disponibles para distribución en Panamá. Cotiza tu proyecto en minutos y recibe
            tu superficie lista para instalar.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/catalogo" className="btn-primary">
              Ver catálogo
            </Link>
            <Link
              href="/cotizador"
              className="btn-secondary whitespace-nowrap border-white !text-white hover:border-gold-400 hover:!text-white"
            >
              Cotizar mi proyecto
            </Link>
          </div>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="container-app grid items-center gap-10 py-16 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Quiénes somos</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
            Piedra sinterizada de calidad, a precio competitivo
          </h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Panamá LuxeStone importa y distribuye piedra sinterizada de gran formato directamente desde fábrica en
            China (proveedor Xiamen Vinstone), lo que nos permite ofrecer variedad, calidad y precios competitivos
            frente a la piedra natural tradicional, sin sacrificar durabilidad ni acabado.
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
          <Image src="/images/products/armani-dark-grey.webp" alt="Detalle de piedra sinterizada" fill className="object-cover" />
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="bg-stone-50 py-16 dark:bg-neutral-900">
        <div className="container-app grid items-center gap-10 sm:grid-cols-2">
          <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800 sm:order-1">
            <Image src="/images/products/hetian-jade.webp" alt="Instalación de piedra sinterizada" fill className="object-cover" />
          </div>
          <div className="order-1 sm:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Qué hacemos</p>
            <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">Para uso residencial y comercial</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Distribuimos piedra sinterizada para cocinas, fachadas, pisos, baños y revestimientos, en proyectos
              residenciales y comerciales en toda Panamá. Elige entre compra por pedido (importación) o piezas con
              stock local disponible para entrega inmediata.
            </p>
            <Link href="/catalogo" className="btn-primary mt-6 inline-flex">
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Modelos destacados */}
      <section className="container-app py-16">
        <h2 className="font-serif text-2xl font-semibold">Modelos destacados</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Aún no hay productos en la base de datos. Corre <code>npm run db:seed</code> para cargar el catálogo.
          </p>
        )}
      </section>

      {/* CTA cotizador */}
      <section className="bg-stone-50 py-16 dark:bg-neutral-900">
        <div className="container-app grid items-center gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl font-semibold">¿Cuánto cuesta tu proyecto?</h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Mide tus superficies, sube una foto y elige el modelo de piedra. Te damos un estimado al instante,
              sin compromiso, incluyendo el costo de acarreo a tu zona.
            </p>
            <Link href="/cotizador" className="btn-primary mt-6 inline-flex">
              Empezar cotización
            </Link>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
            <Image
              src="/images/products/starry-blue.webp"
              alt="Ejemplo de piedra sinterizada Starry Blue"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
