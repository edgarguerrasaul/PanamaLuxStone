// POST /api/contact
// Guarda un mensaje enviado desde el formulario de /contacto y avisa al
// admin por correo (si hay RESEND_API_KEY y ADMIN_EMAIL configurados).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getResend, EMAIL_FROM } from "@/lib/email/client";
import { contactMessageAdminAlertEmail } from "@/lib/email/templates";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(5),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, message } = parsed.data;

  await db.contactMessage.create({ data: { name, email, message } });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && process.env.RESEND_API_KEY) {
    try {
      const alert = contactMessageAdminAlertEmail({ name, email, message });
      await getResend().emails.send({ from: EMAIL_FROM, to: adminEmail, subject: alert.subject, html: alert.html });
    } catch (err) {
      console.error("No se pudo enviar el aviso de contacto:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
