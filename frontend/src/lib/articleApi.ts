import "server-only";
import { cookies } from "next/headers";
import { ZodError } from "zod";
import { ArticleError } from "../data/articleCms";
import { ADMIN_COOKIE, verifyAdminSession } from "./adminAuth";
import { adminRequestOrigin } from "./adminRequestOrigin";

export const articleNoStore = { "Cache-Control": "private, no-store" };
export async function articleAuthorized(request?: Request) {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return Response.json({ message: "Silakan masuk kembali." }, { status: 401, headers: articleNoStore });
  if (request && !adminRequestOrigin(request)) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403, headers: articleNoStore });
  return null;
}

export async function articleBodyBytes(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") || 0) > limit) throw new ArticleError("TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) { await reader.cancel(); throw new ArticleError("TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export async function articleJson(request: Request): Promise<unknown> {
  const bytes = await articleBodyBytes(request, 400_000);
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ArticleError("INVALID_JSON"); }
}

export function articleFailure(error: unknown) {
  if (error instanceof ZodError) return Response.json({ message: error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400, headers: articleNoStore });
  const errors: Record<string, [number, string]> = {
    NOT_FOUND: [404, "Artikel tidak ditemukan."], CONFLICT: [409, "Artikel telah diubah di tab lain. Muat ulang sebelum menyimpan kembali."],
    BUSY: [409, "Penyimpanan sedang digunakan. Coba simpan kembali."], SLUG_EXISTS: [409, "Alamat artikel sudah digunakan. Pilih alamat lain."],
    SLUG_LOCKED: [400, "Alamat artikel yang pernah terbit tidak dapat diubah."], TOO_LARGE: [413, "Konten atau gambar terlalu besar."],
    INVALID_JSON: [400, "Format konten tidak valid."], INVALID_IMAGE: [400, "Gunakan JPG, PNG, atau WebP maksimal 4 MB."],
    STORAGE_UNCONFIGURED: [503, "Penyimpanan artikel belum dikonfigurasi."],
  };
  const code = error instanceof Error ? error.message : "";
  const result = errors[code];
  if (result) return Response.json({ message: result[1], code }, { status: result[0], headers: articleNoStore });
  console.error("Article CMS request failed", error);
  return Response.json({ message: "Perubahan belum tersimpan. Coba kembali." }, { status: 500, headers: articleNoStore });
}
