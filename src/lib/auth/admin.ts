// Autenticación simple para el panel de administración (un solo admin,
// sin tabla de usuarios). No se usa ninguna librería externa: todo con
// el módulo `crypto` de Node (siempre disponible, cero dependencias
// nuevas que instalar).
//
// Cómo generar tu contraseña de admin:
//   node scripts/hash-password.mjs "tu-contraseña-segura"
// Copia el resultado en ADMIN_PASSWORD_HASH dentro de tu .env.
//
// Variables de entorno necesarias (ver .env.example):
//   ADMIN_EMAIL           correo con el que inicias sesión en /admin/login
//   ADMIN_PASSWORD_HASH   hash generado por scripts/hash-password.mjs
//   SESSION_SECRET        cadena aleatoria larga (para firmar la cookie de sesión)
//
// IMPORTANTE: este helper se importa solo desde Server Components y
// Route Handlers (nunca desde middleware.ts), así que siempre corre en
// runtime Node.js — puede usar `crypto` de Node sin restricciones.
import { createHmac, timingSafeEqual, scryptSync } from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "Falta SESSION_SECRET en tu archivo .env. Genera una cadena aleatoria larga y agrégala (ver .env.example)."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

/** Crea el token firmado que se guarda en la cookie de sesión del admin. */
export function createSessionToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_DURATION_MS })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

/** Verifica el token de la cookie. Devuelve el email si es válido y no expiró. */
export function verifySessionToken(token: string | undefined | null): { email: string } | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    if (typeof data.email !== "string") return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

/** Valida el email + contraseña ingresados en /admin/login contra el .env. */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH; // formato "saltHex:hashHex"
  if (!adminEmail || !passwordHash) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;

  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;

  const computed = scryptSync(password, salt, 64).toString("hex");
  const storedBuf = Buffer.from(storedHash, "hex");
  const computedBuf = Buffer.from(computed, "hex");
  if (storedBuf.length !== computedBuf.length) return false;
  return timingSafeEqual(storedBuf, computedBuf);
}
