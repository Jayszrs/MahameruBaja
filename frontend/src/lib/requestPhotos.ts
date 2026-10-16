import "server-only";
import path from "node:path";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { put, del } from "@vercel/blob";
import type { RequestPhoto } from "../data/requests";
import { usingPreviewBlob } from "./previewBlobStore";
import { cmsBlobPrefix } from "./cmsStorageConfig";
import { normalizeUpload } from "./mediaValidation";
import { CmsError } from "./cmsError";
import { blobMediaSource, localMediaSource, missingMedia, respondWithMedia } from "./mediaResponse";

const photoPath = (filename: string) => usingPreviewBlob()
  ? `${cmsBlobPrefix()}request-photos/${filename}`
  : path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "request-photos", filename);

export async function prepareRequestPhotos(files: File[]) {
  if (files.length > 3 || files.reduce((size, file) => size + file.size, 0) > 3_000_000) {
    throw new CmsError("Pilih maksimal 3 foto dengan ukuran total maksimal 3 MB.", 413);
  }
  const prepared = [];
  for (const file of files) {
    const image = await normalizeUpload(file, "image");
    const bytes = await sharp(image.bytes).resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    if (bytes.length > 1_000_000) throw new CmsError("Foto terlalu besar setelah diproses. Pilih gambar yang lebih kecil.", 413);
    const photo: RequestPhoto = { filename: `${randomUUID()}.webp`, name: file.name.replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0, 160) || "Foto kebutuhan", mime: "image/webp", size: bytes.length };
    prepared.push({ photo, bytes });
  }
  return prepared;
}

export async function saveRequestPhoto(photo: RequestPhoto, bytes: Buffer) {
  const target = photoPath(photo.filename);
  if (usingPreviewBlob()) await put(target, bytes, { access: "private", addRandomSuffix: false, contentType: photo.mime });
  else { await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, bytes, { flag: "wx" }); }
}

export async function removeRequestPhotos(photos: RequestPhoto[]) {
  for (const photo of photos) {
    try { if (usingPreviewBlob()) await del(photoPath(photo.filename)); else await unlink(photoPath(photo.filename)); }
    catch { console.error("Request photo cleanup deferred"); }
  }
}

export async function requestPhotoResponse(request: Request, photo: RequestPhoto) {
  const source = usingPreviewBlob() ? await blobMediaSource(photoPath(photo.filename)) : await localMediaSource(photoPath(photo.filename));
  return source ? respondWithMedia(request, source, photo.mime, photo.filename) : missingMedia();
}
