import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";
import { z } from "zod";
import sharp from "sharp";
import { cmsCollection } from "./cmsCollection";
import { usingPreviewBlob } from "./previewBlobStore";
import { CmsError } from "./cmsError";
import type { AdminIdentity } from "../data/adminAccount";
import { readPublicSiteContent, readSiteContent } from "./siteContentStore";
import { readPublishedArticles, readArticles } from "./articleStore";
import { readPublicDivisions, readDivisions } from "./divisionStore";
import { contentOwner } from "../data/divisionCms";
import { scopeContent } from "./contentScope";

const index = cmsCollection("media-index", z.array(z.object({ filename: z.string(), ownerDivision: z.string().nullable(), mime: z.string(), createdAt: z.string() })), () => []);
const directory = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "private-media");
const prefix = "mahameru-preview/v1/private-media/";
export async function saveCmsMedia(file: FormDataEntryValue | null, actor: AdminIdentity, imagesOnly = false, owner?: string | null) {
  const limit = imagesOnly || process.env.VERCEL === "1" ? 4_000_000 : 30_000_000;
  if (!(file instanceof File) || !file.size || file.size > limit) throw new CmsError(`Ukuran berkas maksimal ${limit / 1_000_000} MB.`);
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? "jpg" : bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? "png" : bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" ? "webp" : !imagesOnly && bytes.toString("ascii", 4, 8) === "ftyp" && ["isom", "iso2", "mp41", "mp42", "avc1", "M4V "].includes(bytes.toString("ascii", 8, 12)) ? "mp4" : null;
  if (!ext) throw new CmsError("Gunakan JPG, PNG, WebP, atau video MP4 yang didukung.");
  const mime = ext === "mp4" ? "video/mp4" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  if (file.type !== mime || ext !== "mp4" && bytes.length > 4_000_000) throw new CmsError("Format tidak sesuai atau gambar melebihi 4 MB.");
  if (ext !== "mp4") {
    try { await sharp(bytes, { failOn: "warning", limitInputPixels: 40_000_000 }).stats(); }
    catch { throw new CmsError("Isi gambar rusak atau resolusi melebihi 40 megapiksel."); }
  }
  if (actor.division && owner !== undefined && owner !== actor.division) throw new CmsError("Media hanya untuk divisi akun Anda.", 403);
  const ownerDivision = actor.division || owner || null;
  if (ownerDivision && !(await readDivisions()).some(d => d.slug === ownerDivision)) throw new CmsError("Divisi tidak dikenal.");
  const filename = `${randomUUID()}.${ext}`;
  if (usingPreviewBlob()) await put(`${prefix}${filename}`, bytes, { access: "private", addRandomSuffix: false, contentType: mime });
  else { await mkdir(directory, { recursive: true }); await writeFile(path.join(directory, filename), bytes, { flag: "wx" }); }
  await index.mutate(value => ({ value: [...value, { filename, ownerDivision, mime, createdAt: new Date().toISOString() }], result: undefined }));
  return { url: `/api/cms/media/${filename}`, type: ext === "mp4" ? "video" : "image" };
}
function references(value: unknown, url: string) { return JSON.stringify(value).includes(url); }
export async function mediaIsPublic(url: string) {
  const [content, articles, divisions] = await Promise.all([readPublicSiteContent(), readPublishedArticles(), readPublicDivisions()]);
  return references(content, url) || references(articles, url) || references(divisions, url);
}
export async function mediaAllowed(url: string, actor: AdminIdentity | null) {
  if (await mediaIsPublic(url)) return true;
  if (!actor || actor.mustChangePassword) return false;
  if (!actor.division) return true;
  const managed = (await index.read()).find(item => url === `/api/cms/media/${item.filename}`);
  if (managed?.ownerDivision === actor.division) return true;
  const [content, articles, divisions] = await Promise.all([readSiteContent(), readArticles(), readDivisions()]);
  return references(scopeContent(content, actor), url) || references(articles.filter(a => contentOwner(a) === actor.division), url) || references(divisions.filter(d => d.slug === actor.division), url);
}
export async function validateMediaOwnership(value: unknown, actor: AdminIdentity) {
  if (!actor.division) return;
  const text = JSON.stringify(value);
  for (const record of await index.read()) {
    const url = `/api/cms/media/${record.filename}`;
    if (text.includes(url) && record.ownerDivision !== actor.division && !await mediaAllowed(url, actor)) throw new CmsError("Media draf ini milik pusat atau divisi lain.", 403);
  }
  const legacyUrls = text.match(/\/api\/articles\/media\/[a-f0-9-]+\.(?:jpg|png|webp)/g) || [];
  for (const url of legacyUrls) if (!await mediaAllowed(url, actor)) throw new CmsError("Media draf ini milik pusat atau divisi lain.", 403);
}
export async function cmsMediaResponse(filename: string, actor: AdminIdentity | null) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" };
  if (!/^[a-f0-9-]{36}\.(?:jpg|png|webp|mp4)$/.test(filename) || !await mediaAllowed(`/api/cms/media/${filename}`, actor)) return new Response(null, { status: 404, headers });
  const record = (await index.read()).find(item => item.filename === filename);
  if (!record) return new Response(null, { status: 404, headers });
  if (usingPreviewBlob()) { const blob = await get(`${prefix}${filename}`, { access: "private" }); return blob?.stream ? new Response(blob.stream, { headers: { ...headers, "Content-Type": record.mime } }) : new Response(null, { status: 404, headers }); }
  try { return new Response(new Uint8Array(await readFile(path.join(directory, filename))), { headers: { ...headers, "Content-Type": record.mime, "Accept-Ranges": "none" } }); }
  catch(error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return new Response(null, { status: 404, headers }); throw error; }
}
