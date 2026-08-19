import { PrismaClient } from "@prisma/client";

// Evita crear una conexión nueva a la base de datos en cada recarga
// durante desarrollo (Next.js recarga módulos todo el tiempo).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
