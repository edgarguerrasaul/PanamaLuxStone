import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Falta RESEND_API_KEY en el archivo .env");
  if (!client) client = new Resend(key);
  return client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Panamá LuxeStone <ventas@panamaluxestone.com>";
