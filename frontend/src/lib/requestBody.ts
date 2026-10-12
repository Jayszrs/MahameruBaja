import "server-only";
import { CmsError } from "./cmsError";

/** Enforce byte limits while streaming, including requests without Content-Length. */
export async function readBodyBytes(request: Request, limit: number): Promise<Uint8Array> {
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)))) throw new CmsError("Ukuran permintaan tidak valid.", 400);
  if (declared !== null && Number(declared) > limit) throw new CmsError("Data terlalu besar.", 413);
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new CmsError("Data terlalu besar.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function readJsonBody(request: Request, limit: number): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") throw new CmsError("Gunakan format JSON.", 400);
  const bytes = await readBodyBytes(request, limit);
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new CmsError("Format data tidak valid.", 400); }
}

export async function readFormBody(request: Request, limit: number): Promise<FormData> {
  const contentType = request.headers.get("content-type") || "";
  if (!/^(?:multipart\/form-data|application\/x-www-form-urlencoded)(?:;|$)/i.test(contentType)) throw new CmsError("Format formulir tidak valid.", 400);
  const bytes = await readBodyBytes(request, limit);
  try { return await new Response(bytes.buffer as ArrayBuffer, { headers: { "Content-Type": contentType } }).formData(); }
  catch { throw new CmsError("Formulir atau unggahan rusak. Pilih berkas kembali.", 400); }
}
