import { requestInputSchema } from "../../../src/data/requests";
import { createRequest, readRequests } from "../../../src/lib/requestStore";
import { ensureDivision } from "../../../src/lib/divisionStore";
import { prepareRequestPhotos, saveRequestPhoto, removeRequestPhotos } from "../../../src/lib/requestPhotos";
import type { RequestPhoto } from "../../../src/data/requests";
import { adminRequestOrigin } from "../../../src/lib/adminRequestOrigin";

import { CmsError } from "../../../src/lib/cmsError";
import { apiError } from "../../../src/lib/adminApi";
import { readJsonBody, readFormBody } from "../../../src/lib/requestBody";
import { requestPdfLink } from "../../../src/lib/requestPdfShare";
export const runtime = "nodejs";
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  const origin = adminRequestOrigin(request);
  if (!origin) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const now = Date.now();
  for (const [ip, value] of attempts) if (value.until < now) attempts.delete(ip);
  const rate = attempts.get(key) || { count: 0, until: now + 600000 };
  if (++rate.count > 30) return Response.json({ message: "Terlalu banyak permintaan. Coba beberapa menit lagi." }, { status: 429 });
  attempts.set(key, rate);
  let input: unknown;
  let files: File[] = [];
  try {
    if (request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
      const form = await readFormBody(request, 3_150_000);
      const payload = form.get("input");
      if (typeof payload !== "string" || new TextEncoder().encode(payload).length > 100000) throw new CmsError("Rincian permintaan tidak valid.");
      try { input = JSON.parse(payload); } catch { throw new CmsError("Rincian permintaan tidak valid."); }
      const uploads = form.getAll("photos");
      if (uploads.some(value => !(value instanceof File))) throw new CmsError("Lampiran harus berupa foto.");
      files = uploads as File[];
    } else input = await readJsonBody(request, 100000);
  } catch (error) { return apiError(error); }
  const result = requestInputSchema.safeParse(input);
  if (!result.success) return Response.json({ message: "Periksa nama, nomor WhatsApp, email, dan jumlah material.", details: result.error.flatten().fieldErrors }, { status: 422 });
  const idempotencyKey = request.headers.get("idempotency-key") || undefined;
  if (idempotencyKey && !/^[\w-]{8,100}$/.test(idempotencyKey)) return Response.json({ message: "Kunci permintaan tidak valid." }, { status: 400 });
  const photos: RequestPhoto[] = [];
  let commitStarted = false;
  try {
    if (files.length) await ensureDivision(result.data.businessUnitSlug, true);
    if (idempotencyKey && files.length) {
      const existing = (await readRequests()).find(record => record.idempotencyKey === idempotencyKey);
      if (existing) return Response.json({ data: { id: existing.id, status: existing.status, photoCount: existing.photos.length, pdfUrl: requestPdfLink(existing, origin) } }, { status: 201, headers: { "Cache-Control": "no-store" } });
    }
    const prepared = await prepareRequestPhotos(files);
    for (const { photo, bytes } of prepared) {
      // Track before the upload: a timed-out put may still have stored bytes.
      photos.push(photo);
      await saveRequestPhoto(photo, bytes);
    }
    commitStarted = true;
    const saved = await createRequest(result.data, idempotencyKey, photos);
    await removeRequestPhotos(photos.filter(photo => !saved.photos.some(savedPhoto => savedPhoto.filename === photo.filename)));
    return Response.json({ data: { id: saved.id, status: saved.status, photoCount: saved.photos.length, pdfUrl: requestPdfLink(saved, origin) } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    // A failed response can hide a successful or still-running metadata write.
    // Retain attachments after any uncertain commit instead of risking loss.
    if (photos.length && !commitStarted) await removeRequestPhotos(photos);
    else if (photos.length) console.error("Request photo cleanup deferred");
    if(error instanceof CmsError) return apiError(error);
    console.error("Request storage failure", { code: (error as NodeJS.ErrnoException).code || ((error as Error).message === "BUSY" ? "BUSY" : "UNKNOWN") });
    return Response.json({ message: (error as Error).message === "BUSY" ? "Penyimpanan sedang sibuk. Silakan coba kembali." : "Permintaan belum tersimpan. Coba kembali." }, { status: 503 });
  }
}
