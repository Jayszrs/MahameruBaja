import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../../src/lib/adminRequestOrigin";

export const runtime = "nodejs";

const MAX_BYTES = 4_000_000;
function fileType(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return { extension: "jpg", mime: "image/jpeg" };
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { extension: "png", mime: "image/png" };
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return { extension: "webp", mime: "image/webp" };
  return null;
}

export async function POST(request: Request) {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return Response.json({ message: "Silakan masuk kembali." }, { status: 401 });
  if (!adminRequestOrigin(request)) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > MAX_BYTES + 500_000) return Response.json({ message: "Gambar maksimal 4 MB." }, { status: 413 });
  let media: FormDataEntryValue | null;
  try { media = (await request.formData()).get("image"); }
  catch { return Response.json({ message: "Berkas tidak dapat dibaca." }, { status: 400 }); }
  if (!(media instanceof File) || media.size < 1 || media.size > MAX_BYTES) return Response.json({ message: "Pilih gambar JPG, PNG, atau WebP maksimal 4 MB." }, { status: 400 });
  const bytes = Buffer.from(await media.arrayBuffer());
  const type = fileType(bytes);
  if (!type || media.type !== type.mime) return Response.json({ message: "Format gambar tidak sesuai. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  const filename = `${randomUUID()}.${type.extension}`;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const result = await put(`mahameru/promotions/${filename}`, bytes, { access: "public", addRandomSuffix: false, contentType: type.mime });
      return Response.json({ url: result.url }, { headers: { "Cache-Control": "no-store" } });
    }
    if (process.env.VERCEL === "1") return Response.json({ message: "Penyimpanan gambar belum dikonfigurasi." }, { status: 503 });
    const directory = path.join(process.cwd(), "public", "uploads", "promotions");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    return Response.json({ url: `/uploads/promotions/${filename}` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Promotion image upload failed", error);
    return Response.json({ message: "Gambar gagal diunggah. Coba kembali." }, { status: 500 });
  }
}
