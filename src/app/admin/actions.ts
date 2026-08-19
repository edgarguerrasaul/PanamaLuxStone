"use server";

// Server Actions del panel de administración. Todas corren en el
// servidor (Node.js), nunca en el navegador — es seguro que toquen la
// base de datos y las cookies de sesión directamente.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifyAdminCredentials,
} from "@/lib/auth/admin";

const ORDER_STATUSES = ["PENDIENTE_PAGO", "PENDIENTE_CONFIRMACION", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "CANCELADO"];
const QUOTE_STATUSES = ["NEW", "CONTACTED", "CONVERTED", "DISCARDED"];

// ── Sesión ──────────────────────────────────────────────────────────

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }

  const token = createSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

// ── Productos (precio, stock inmediato, destacado) ─────────────────

export async function updateProductAction(id: string, formData: FormData) {
  const pricePerM2 = Number(formData.get("pricePerM2"));
  if (!Number.isFinite(pricePerM2) || pricePerM2 <= 0) {
    redirect("/admin/productos?error=1");
  }

  await db.product.update({
    where: { id },
    data: {
      pricePerM2,
      immediateStock: formData.get("immediateStock") === "on",
      priceConfirmed: formData.get("priceConfirmed") === "on",
      featured: formData.get("featured") === "on",
    },
  });

  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  redirect("/admin/productos?updated=1");
}

// ── Instaladores ─────────────────────────────────────────────────────

export async function createInstallerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();

  if (!name || !phone || !province) {
    redirect("/admin/instaladores?error=1");
  }

  await db.installer.create({ data: { name, phone, province } });
  revalidatePath("/admin/instaladores");
  revalidatePath("/instaladores");
  redirect("/admin/instaladores?created=1");
}

export async function deleteInstallerAction(id: string) {
  await db.installer.delete({ where: { id } });
  revalidatePath("/admin/instaladores");
  revalidatePath("/instaladores");
  redirect("/admin/instaladores?deleted=1");
}

export async function toggleInstallerActiveAction(id: string, active: boolean) {
  await db.installer.update({ where: { id }, data: { active } });
  revalidatePath("/admin/instaladores");
  revalidatePath("/instaladores");
  redirect("/admin/instaladores");
}

// ── Zonas de acarreo ─────────────────────────────────────────────────

export async function updateFreightZoneAction(id: string, formData: FormData) {
  const costPerSlab = Number(formData.get("costPerSlab"));
  if (!Number.isFinite(costPerSlab) || costPerSlab < 0) {
    redirect("/admin/acarreo?error=1");
  }

  await db.freightZone.update({
    where: { id },
    data: { costPerSlab, active: formData.get("active") === "on" },
  });

  revalidatePath("/admin/acarreo");
  revalidatePath("/cotizador");
  revalidatePath("/checkout");
  redirect("/admin/acarreo?updated=1");
}

// ── Pedidos ───────────────────────────────────────────────────────────

export async function updateOrderStatusAction(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status)) {
    redirect("/admin/pedidos?error=1");
  }

  await db.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/pedidos");
  redirect("/admin/pedidos?updated=1");
}

// ── Cotizaciones ───────────────────────────────────────────────────────

export async function updateQuoteStatusAction(id: string, formData: FormData) {
  const status = String(formData.get("status") ?? "");
  if (!QUOTE_STATUSES.includes(status)) {
    redirect("/admin/cotizaciones?error=1");
  }

  await db.quote.update({ where: { id }, data: { status } });
  revalidatePath("/admin/cotizaciones");
  redirect("/admin/cotizaciones?updated=1");
}

// ── Mensajes de contacto ─────────────────────────────────────────────

export async function markMessageHandledAction(id: string, handled: boolean) {
  await db.contactMessage.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/mensajes");
  redirect("/admin/mensajes");
}
