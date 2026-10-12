import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import { z } from "zod";
import { cmsCollection } from "./cmsCollection";
import { usingPreviewBlob } from "./previewBlobStore";
import { cmsBlobPrefix } from "./cmsStorageConfig";
import { CmsError } from "./cmsError";
import type { AdminIdentity } from "../data/adminAccount";
import { readPublicSiteContent, readSiteContent } from "./siteContentStore";
import { readPublishedArticles, readArticles } from "./articleStore";
import { readPublicDivisions, readDivisions } from "./divisionStore";
import { contentOwner } from "../data/divisionCms";
import { scopeContent } from "./contentScope";
import { localMediaUrl, mediaFilename, mediaReferences, referencesMedia } from "./mediaReferences";
import { normalizeUpload, type UploadKind } from "./mediaValidation";
import { blobMediaSource, localMediaSource, missingMedia, respondWithMedia } from "./mediaResponse";

const index = cmsCollection("media-index", z.array(z.object({ filename: z.string(), ownerDivision: z.string().nullable(), mime: z.string(), createdAt: z.string() })), () => []);
const directory = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "private-media");
const prefix = () => `${cmsBlobPrefix()}private-media/`;

export async function saveCmsMedia(file: FormDataEntryValue | null, actor: AdminIdentity, kind: UploadKind | boolean = "media", owner?: string | null) {
  if (actor.division && owner !== undefined && owner !== actor.division) throw new CmsError("Media hanya untuk divisi akun Anda.", 403);
  const ownerDivision = actor.division || owner || null;
  if (ownerDivision && !(await readDivisions()).some(division => division.slug === ownerDivision)) throw new CmsError("Divisi tidak dikenal.");
  const { bytes, ext, mime, type } = await normalizeUpload(file, typeof kind === "boolean" ? kind ? "image" : "media" : kind);
  const filename = `${randomUUID()}.${ext}`; const blob = usingPreviewBlob();
  const storagePath = blob ? `${prefix()}${filename}` : path.join(directory, filename);
  if (blob) await put(storagePath, bytes, { access: "private", addRandomSuffix: false, contentType: mime });
  else { await mkdir(directory, { recursive: true }); await writeFile(storagePath, bytes, { flag: "wx" }); }
  try { await index.mutate(value => ({ value: [...value, { filename, ownerDivision, mime, createdAt: new Date().toISOString() }], result: undefined })); }
  catch (error) {
    // A timed-out commit may have succeeded. Confirm before deleting bytes.
    try { if (!(await index.read()).some(record => record.filename === filename)) { if (blob) await del(storagePath); else await unlink(storagePath); } }
    catch { console.error("CMS upload cleanup deferred"); }
    throw error;
  }
  return { url: `/api/cms/media/${filename}`, type };
}

export async function mediaIsPublic(url: string) {
  const [content, articles, divisions] = await Promise.all([readPublicSiteContent(), readPublishedArticles(), readPublicDivisions()]);
  return referencesMedia(content, url) || referencesMedia(articles, url) || referencesMedia(divisions, url);
}

export async function mediaAllowed(url: string, actor: AdminIdentity | null) {
  if (actor && !actor.mustChangePassword) {
    if (!actor.division) return true;
    const managed = (await index.read()).find(item => url === `/api/cms/media/${item.filename}`);
    // An indexed owner remains authoritative after a publicly reusable image
    // becomes private again. Another division's saved copy is not a transfer.
    if (managed) return managed.ownerDivision === actor.division || await mediaIsPublic(url);
    const [content, articles, divisions] = await Promise.all([readSiteContent(), readArticles(), readDivisions()]);
    if (referencesMedia(scopeContent(content, actor), url) || referencesMedia(articles.filter(article => contentOwner(article) === actor.division), url) || referencesMedia(divisions.filter(division => division.slug === actor.division), url)) return true;
  }
  return mediaIsPublic(url);
}

export async function validateMediaKinds(value: unknown) {
  const managed = new Map((await index.read()).map(record => [`/api/cms/media/${record.filename}`, record]));
  for (const reference of mediaReferences(value)) {
    const url = localMediaUrl(reference.url);
    if (!url) continue;
    const record = managed.get(url);
    if (url.startsWith("/api/cms/media/") && !record) throw new CmsError("Media tidak ditemukan. Unggah kembali sebelum menyimpan.");
    const actual = record ? record.mime.startsWith("image/") ? "image" : "video" : url.endsWith(".mp4") ? "video" : "image";
    if (actual !== reference.kind) throw new CmsError(reference.kind === "image" ? "Kolom gambar tidak dapat menggunakan video." : "Kolom video harus menggunakan MP4.");
  }
}

export async function validateMediaOwnership(value: unknown, actor: AdminIdentity) {
  await validateMediaKinds(value);
  if (!actor.division) return;
  const urls = new Set(mediaReferences(value).map(reference => localMediaUrl(reference.url)).filter((url): url is string => Boolean(url)));
  // Validate every route generation against saved state before a new reference
  // could grant access to an unrelated division's draft file.
  for (const url of urls) if (!await mediaAllowed(url, actor)) throw new CmsError("Media draf ini milik pusat atau divisi lain.", 403);
}

export async function cmsMediaResponse(filename: string, actor: AdminIdentity | null, request = new Request("http://localhost/")) {
  if (!mediaFilename.test(filename)) return missingMedia();
  const record = (await index.read()).find(item => item.filename === filename);
  if (!record) return missingMedia();
  const source = usingPreviewBlob() ? await blobMediaSource(`${prefix()}${filename}`) : await localMediaSource(path.join(directory, filename));
  if (!source || !await mediaAllowed(`/api/cms/media/${filename}`, actor)) return missingMedia();
  return respondWithMedia(request, source, record.mime, filename);
}
