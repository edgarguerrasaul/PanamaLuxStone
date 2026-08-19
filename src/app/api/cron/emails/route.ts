// GET /api/cron/emails
// Vercel llama esta ruta según el horario definido en vercel.json
// (por defecto: cada hora). Hace dos cosas:
//   1) Envía cualquier correo que esté en la cola (EmailLog PENDING).
//   2) Detecta cotizaciones que quedaron "abandonadas" (creadas hace
//      más de 24h y nadie las convirtió en pedido) y les agenda un
//      correo de seguimiento, si todavía no se les mandó uno.
//
// Se protege con CRON_SECRET para que nadie más pueda llamarla y
// spamear correos.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getResend, EMAIL_FROM } from "@/lib/email/client";
import { orderConfirmationEmail, quoteFollowUpEmail, quoteReceivedEmail } from "@/lib/email/templates";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // en desarrollo local, sin secret configurado, se permite
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const results = { queued: 0, sent: 0, failed: 0 };

  // 1) Agendar seguimiento de cotizaciones abandonadas (>24h, sin conversión)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleQuotes = await db.quote.findMany({
    where: {
      status: "NEW",
      createdAt: { lt: oneDayAgo },
      emailLogs: { none: { type: "QUOTE_FOLLOWUP" } },
    },
    include: { product: true },
    take: 50,
  });

  for (const quote of staleQuotes) {
    await db.emailLog.create({
      data: { to: quote.contactEmail, type: "QUOTE_FOLLOWUP", quoteId: quote.id },
    });
    results.queued++;
  }

  // 2) Enviar todo lo que esté pendiente en la cola
  const hasResendKey = Boolean(process.env.RESEND_API_KEY);
  const pending = await db.emailLog.findMany({
    where: { status: "PENDING", scheduledFor: { lte: new Date() } },
    include: {
      order: { include: { customer: true } },
      quote: { include: { product: true } },
    },
    take: 100,
  });

  for (const log of pending) {
    try {
      if (!hasResendKey) {
        // Sin llave de Resend configurada (típico en desarrollo): no
        // truena, solo lo deja pendiente para cuando sí haya llave.
        continue;
      }

      let email: { subject: string; html: string } | null = null;
      let to = log.to;

      if (log.type === "ORDER_CONFIRMATION" && log.order) {
        email = orderConfirmationEmail({
          customerName: log.order.customer.name,
          orderId: log.order.id,
          total: log.order.totalAmount,
        });
        to = log.order.customer.email;
      } else if (log.type === "QUOTE_FOLLOWUP" && log.quote) {
        email = quoteFollowUpEmail({
          customerName: log.quote.contactEmail.split("@")[0],
          productName: log.quote.product?.name,
          estimatedTotal: log.quote.estimatedTotal,
        });
      } else if (log.type === "QUOTE_RECEIVED" && log.quote) {
        email = quoteReceivedEmail({
          customerName: log.quote.contactEmail.split("@")[0],
          estimatedTotal: log.quote.estimatedTotal,
        });
      }

      if (!email) {
        await db.emailLog.update({
          where: { id: log.id },
          data: { status: "FAILED", lastError: "Sin datos suficientes para armar el correo" },
        });
        results.failed++;
        continue;
      }

      await getResend().emails.send({ from: EMAIL_FROM, to, subject: email.subject, html: email.html });
      await db.emailLog.update({ where: { id: log.id }, data: { status: "SENT", sentAt: new Date() } });
      results.sent++;
    } catch (err) {
      await db.emailLog.update({
        where: { id: log.id },
        data: { status: "FAILED", attempts: { increment: 1 }, lastError: String(err) },
      });
      results.failed++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
