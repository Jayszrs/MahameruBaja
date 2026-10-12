import "server-only";
import { adminActor, apiError, noStore } from "./adminApi";
import { CmsError } from "./cmsError";
import { saveCmsMedia } from "./cmsMedia";
import { readFormBody } from "./requestBody";
import { consumeUploadLimit } from "./securityState";
import { imageByteLimit, videoByteLimit, type UploadKind } from "./mediaValidation";

export async function uploadCmsRequest(request: Request, imageAlias = false) {
  try {
    const actor = await adminActor(request);
    await consumeUploadLimit(actor.id);
    if (!/^multipart\/form-data(?:;|$)/i.test(request.headers.get("content-type") || "")) throw new CmsError("Unggahan harus menggunakan multipart/form-data.");
    const form = await readFormBody(request, (imageAlias ? imageByteLimit : videoByteLimit()) + 100_000);
    const field = imageAlias ? "image" : "media";
    const file = form.get(field), owner = form.get("ownerDivision"), requestedKind = form.get("kind");
    if (form.getAll(field).length !== 1 || [...form.values()].filter(value => value instanceof File).length !== 1) throw new CmsError("Unggah satu berkas pada setiap permintaan.");
    if (form.getAll("ownerDivision").length > 1 || owner !== null && typeof owner !== "string") throw new CmsError("Divisi tidak valid.");
    if (form.getAll("kind").length > 1 || requestedKind !== null && requestedKind !== "image" && requestedKind !== "video") throw new CmsError("Jenis unggahan tidak valid.");
    if (imageAlias && requestedKind === "video") throw new CmsError("Kolom ini hanya menerima gambar.");
    const kind: UploadKind = imageAlias ? "image" : requestedKind as "image" | "video" | null || "media";
    return Response.json(await saveCmsMedia(file, actor, kind, owner === null ? undefined : owner as string || null), { headers: noStore });
  } catch (error) { return apiError(error); }
}
