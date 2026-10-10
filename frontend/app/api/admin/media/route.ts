import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) return Response.json({ message: "Silakan login." }, { status: 401 });
  if (!adminRequestOrigin(request)) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  const limit = process.env.VERCEL === "1" ? 4_000_000 : 30_000_000;
  if (Number(request.headers.get("content-length") || 0) > limit + 100_000) return Response.json({ message: `Berkas maksimal ${limit / 1_000_000} MB. Video lebih besar gunakan URL HTTPS/CDN.` }, { status: 413 });
  let file: FormDataEntryValue | null;
  try { file = (await request.formData()).get("media"); } catch { return Response.json({ message: "Berkas tidak dapat dibaca." }, { status: 400 }); }
  if (!(file instanceof File) || file.size < 1 || file.size > limit) return Response.json({ message: "Ukuran berkas tidak sesuai." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = bytes.subarray(0, 3).equals(Buffer.from([255,216,255])) ? "jpg" : bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? "png" : bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP" ? "webp" : bytes.toString("ascii",4,8) === "ftyp" && ["isom","iso2","mp41","mp42","avc1","M4V "].includes(bytes.toString("ascii",8,12)) ? "mp4" : null;
  if (!extension) return Response.json({ message: "Gunakan JPG, PNG, WebP, atau MP4 (H.264)." }, { status: 400 });
  const mime = extension === "mp4" ? "video/mp4" : `image/${extension === "jpg" ? "jpeg" : extension}`;
  if (file.type !== mime) return Response.json({ message: "Isi dan format berkas tidak sesuai." }, { status: 400 });
  const name = `${randomUUID()}.${extension}`;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const saved = await put(`mahameru/media/${name}`, bytes, { access: "public", addRandomSuffix: false, contentType: mime });
      return Response.json({ url: saved.url, type: extension === "mp4" ? "video" : "image" });
    }
    if (process.env.VERCEL === "1") return Response.json({ message: "Storage belum dikonfigurasi." }, { status: 503 });
    const directory = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "media");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, name), bytes, { flag: "wx" });
    return Response.json({ url: `/media/${name}`, type: extension === "mp4" ? "video" : "image" });
  } catch { return Response.json({ message: "Unggahan gagal. Coba lagi." }, { status: 500 }); }
}
