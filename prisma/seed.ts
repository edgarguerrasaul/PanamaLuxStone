// Este script llena la base de datos con el catálogo real y las zonas
// de acarreo. Se corre con: npm run db:seed
// (create-next-app + prisma db push ya deben haberse ejecutado antes)

import { PrismaClient } from "@prisma/client";
import { collections, products, STANDARD_AVAILABLE_SIZES_JSON } from "../src/data/catalog";
import { FREIGHT_ZONES } from "../src/data/logistics";

const prisma = new PrismaClient();

async function main() {
  console.log("Sembrando colecciones y productos...");

  for (const c of collections) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: c,
    });
  }

  for (const p of products) {
    const collection = await prisma.collection.findUniqueOrThrow({
      where: { slug: p.collectionSlug },
    });

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        subtitle: p.subtitle,
        description: p.description,
        finish: p.finish,
        toneBase: p.toneBase,
        vein: p.vein,
        usage: p.usage,
        thicknessMm: p.thicknessMm,
        pricePerM2: p.pricePerM2,
        priceConfirmed: p.priceConfirmed,
        descriptionConfirmed: p.descriptionConfirmed,
        hasPlaceholderImage: p.hasPlaceholderImage ?? false,
        imageUrl: `/images/products/${p.slug}.webp`,
        thumbUrl: `/images/products/${p.slug}-thumb.webp`,
        featured: p.featured ?? false,
        immediateStock: p.immediateStock ?? false,
        collectionId: collection.id,
        // Se actualiza en cada seed para que, si cambia la regla de
        // medidas/espesores del proveedor (ver src/data/catalog.ts), los
        // productos que ya existían en la base también queden al día —
        // no solo los que se crean de cero.
        availableSizes: STANDARD_AVAILABLE_SIZES_JSON,
      },
      create: {
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle,
        description: p.description,
        finish: p.finish,
        toneBase: p.toneBase,
        vein: p.vein,
        usage: p.usage,
        thicknessMm: p.thicknessMm,
        pricePerM2: p.pricePerM2,
        priceConfirmed: p.priceConfirmed,
        descriptionConfirmed: p.descriptionConfirmed,
        hasPlaceholderImage: p.hasPlaceholderImage ?? false,
        imageUrl: `/images/products/${p.slug}.webp`,
        thumbUrl: `/images/products/${p.slug}-thumb.webp`,
        featured: p.featured ?? false,
        immediateStock: p.immediateStock ?? false,
        collectionId: collection.id,
        availableSizes: STANDARD_AVAILABLE_SIZES_JSON,
      },
    });
  }

  console.log("Sembrando zonas de acarreo...");
  for (const z of FREIGHT_ZONES) {
    await prisma.freightZone.upsert({
      where: { name: z.name },
      update: { costPerSlab: z.costPerSlab, sortOrder: z.sortOrder },
      create: { name: z.name, costPerSlab: z.costPerSlab, sortOrder: z.sortOrder },
    });
  }

  console.log(
    `Listo: ${collections.length} colecciones, ${products.length} productos, ${FREIGHT_ZONES.length} zonas de acarreo.`
  );
  console.log(
    "Nota: ningún producto quedó marcado con stock inmediato (immediateStock) — actívalo desde /admin/productos para los modelos que sí tengan stock físico en Panamá."
  );
  console.log(
    "Nota: no se cargaron instaladores (no hay datos reales todavía) — agrégalos desde /admin/instaladores."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
