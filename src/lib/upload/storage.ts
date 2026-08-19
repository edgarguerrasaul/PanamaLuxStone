// Capa de almacenamiento para imágenes subidas por el API (/api/upload).
// Dos "backends" intercambiables con la variable UPLOAD_PROVIDER:
//
//  - "local":      guarda el archivo en /public/uploads. Sirve para
//                   probar en tu computadora, pero NO sirve en Vercel
//                   (el disco no es permanente ahí).
//  - "cloudinary": sube la imagen a Cloudinary, que la sirve por su
//                   propio CDN ya optimizada. Recomendado en producción.
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export interface StoredImage {
  url: string;
  width: number;
  height: number;
  bytes: number;
}

// Redimensiona y convierte a WebP ANTES de guardar, sin importar el
// backend. Esto es lo que hace que la subida sea "rápida": el archivo
// que viaja y se guarda ya es liviano, no la foto original de 8-12MB
// que sale de un celular.
async function optimize(buffer: Buffer, maxWidth = 1600) {
  const image = sharp(buffer).rotate(); // rotate() respeta la orientación EXIF del celular
  const meta = await image.metadata();
  const resized = image.resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 82 });
  const output = await resized.toBuffer();
  return { output, meta };
}

async function storeLocal(buffer: Buffer, filename: string): Promise<StoredImage> {
  const { output, meta } = await optimize(buffer);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const finalName = `${filename}.webp`;
  await writeFile(path.join(dir, finalName), output);

  return {
    url: `/uploads/${finalName}`,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    bytes: output.length,
  };
}

async function storeCloudinary(buffer: Buffer, filename: string): Promise<StoredImage> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Faltan las variables CLOUDINARY_* en el archivo .env");
  }

  const { output, meta } = await optimize(buffer);

  // Firma simple para subida directa (sin SDK, para no depender de
  // paquetes extra). Cloudinary explica este esquema en su doc de
  // "Upload API": https://cloudinary.com/documentation/upload_images
  const crypto = await import("crypto");
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `public_id=panamaluxstone/${filename}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(output)], { type: "image/webp" }));
  form.append("public_id", `panamaluxstone/${filename}`);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Cloudinary respondió con error (${res.status})`);
  }

  const data = await res.json();

  return {
    url: data.secure_url,
    width: meta.width ?? data.width,
    height: meta.height ?? data.height,
    bytes: output.length,
  };
}

export async function storeImage(buffer: Buffer, filename: string): Promise<StoredImage> {
  const provider = process.env.UPLOAD_PROVIDER ?? "local";
  if (provider === "cloudinary") return storeCloudinary(buffer, filename);
  return storeLocal(buffer, filename);
}
