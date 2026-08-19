import Link from "next/link";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="container-app py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold">¡Gracias por tu pedido!</h1>
      {order && (
        <p className="mt-4 text-neutral-600">
          Número de pedido: <strong>#{order.slice(-6).toUpperCase()}</strong>
        </p>
      )}
      <p className="mt-2 text-neutral-600">Te escribiremos por correo para coordinar la medición y la instalación.</p>
      <Link href="/catalogo" className="btn-primary mt-8 inline-flex">
        Seguir viendo el catálogo
      </Link>
    </div>
  );
}
