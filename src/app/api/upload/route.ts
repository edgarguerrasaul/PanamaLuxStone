// POST /api/upload
// Recibe una imagen (form-data, campo "file"), la optimiza y la
// guarda. La usan: (a) el cotizador, cuando el cliente sube la foto
// de su cocina; (b) más adelante, el panel de administración para
// subir fotos de producto.
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { storeImage } from "@/lib/upload/storage";

export const runtime = "nodejs";
// Límite razonable: una foto de celular sin comprimir puede pesar
// 10-15MB. Si necesitas más, súbelo aquí.
export const maxDuration = 30;

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió ningún archivo (campo 'file')." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen pesa demasiado (máximo 15MB)." }, { status: 413 });
    }

    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Tipo de archivo no soportado: ${file.type}` }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = randomUUID();
    const result = await storeImage(buffer, filename);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Error subiendo imagen:", err);
    return NextResponse.json({ error: "No se pudo procesar la imagen." }, { status: 500 });
  }
}
