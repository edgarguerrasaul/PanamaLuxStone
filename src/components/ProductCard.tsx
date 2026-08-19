"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface ProductCardData {
  slug: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  thumbUrl: string;
  pricePerM2: number;
  priceConfirmed: boolean;
  descriptionConfirmed?: boolean;
  immediateStock?: boolean;
  /** Datos breves para el reverso de la tarjeta (opcionales: si faltan, esa línea no se muestra). */
  finish?: string;
  toneBase?: string;
  vein?: string;
}

/**
 * Tarjeta de producto con efecto flip 3D (CSS transform, sin librerías).
 * En dispositivos con mouse, pasar el cursor por encima voltea la
 * tarjeta (con zoom en la imagen y cambio a la segunda foto, si hay una
 * distinta) para mostrar información breve en el reverso. En pantallas
 * táctiles (sin hover real) se usa un toque/clic como respaldo, ya que
 * "mouseenter" no es confiable en touch.
 */
export default function ProductCard({ product }: { product: ProductCardData }) {
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const isDraft = product.descriptionConfirmed === false;
  const hasAltImage = product.imageUrl && product.imageUrl !== product.thumbUrl;

  const active = hovered || tapped;

  return (
    <div className="group block overflow-hidden rounded-lg border border-neutral-200 transition hover:shadow-lg dark:border-neutral-800 dark:hover:shadow-neutral-900/50">
      <div
        className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setTapped((t) => !t)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setTapped((t) => !t);
          }
        }}
        aria-label={`Ver otra vista de ${product.name}`}
      >
        <div
          className="flip-card-inner relative h-full w-full transition-transform duration-500"
          style={{ transform: active ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Cara frontal: foto principal, con zoom suave al hacer hover */}
          <div className="flip-card-face absolute inset-0 overflow-hidden">
            <Image
              src={product.thumbUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-transform duration-500 ${active ? "scale-110" : "scale-100"}`}
            />
          </div>

          {/* Cara trasera: segunda foto (si existe) + info breve */}
          <div className="flip-card-face flip-card-back absolute inset-0 overflow-hidden">
            <Image
              src={hasAltImage ? product.imageUrl : product.thumbUrl}
              alt={`${product.name} — detalle`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-transform duration-500 ${active ? "scale-110" : "scale-100"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <p className="text-[10px] uppercase tracking-wide text-white/70">{product.subtitle}</p>

              {(product.finish || product.toneBase || product.vein) && (
                <dl className="mt-1.5 space-y-0.5 text-[11px] leading-tight">
                  {product.finish && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-white/60">Acabado</dt>
                      <dd className="text-right font-medium">{product.finish}</dd>
                    </div>
                  )}
                  {product.toneBase && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-white/60">Tono base</dt>
                      <dd className="text-right font-medium">{product.toneBase}</dd>
                    </div>
                  )}
                  {product.vein && (
                    <div className="flex justify-between gap-2">
                      <dt className="text-white/60">Veta</dt>
                      <dd className="text-right font-medium">{product.vein}</dd>
                    </div>
                  )}
                </dl>
              )}

              <p className="mt-1.5 text-sm font-medium">
                ${product.pricePerM2}/m²{" "}
                {!product.priceConfirmed && <span className="text-xs text-amber-300">(por confirmar)</span>}
              </p>
              {product.immediateStock && (
                <p className="mt-1 text-xs font-medium text-green-300">Stock inmediato disponible</p>
              )}
            </div>
          </div>
        </div>

        {isDraft && (
          <span className="absolute left-2 top-2 z-10 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Borrador
          </span>
        )}
        {product.immediateStock && (
          <span className="absolute right-2 top-2 z-10 rounded bg-green-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Stock inmediato
          </span>
        )}
        <Link
          href={`/catalogo/${product.slug}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Ver ficha completa de ${product.name}`}
          className="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-neutral-900 shadow hover:bg-white"
        >
          i
        </Link>
      </div>
      <Link href={`/catalogo/${product.slug}`} className="block p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{product.subtitle}</p>
        <h3 className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">{product.name}</h3>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          ${product.pricePerM2}/m²{" "}
          {!product.priceConfirmed && <span className="text-xs text-amber-600 dark:text-amber-400">(precio por confirmar)</span>}
        </p>
      </Link>
    </div>
  );
}
