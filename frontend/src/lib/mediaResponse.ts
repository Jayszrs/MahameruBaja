import "server-only";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { BlobNotFoundError, get, head } from "@vercel/blob";

export const privateMediaHeaders = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'", "Cross-Origin-Resource-Policy": "same-origin", Vary: "Cookie" };
type ByteRange = { start: number; end: number };
export type MediaSource = { size: number; stream: (range: ByteRange | null, request: Request) => Promise<ReadableStream<Uint8Array>> };
export function missingMedia() { return new Response(null, { status: 404, headers: privateMediaHeaders }); }

export function parseMediaRange(value: string, size: number): ByteRange | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2]) || size < 1) return null;
  if (!match[1]) { const suffix = Number(match[2]); return Number.isSafeInteger(suffix) && suffix > 0 ? { start: Math.max(0, size - suffix), end: size - 1 } : null; }
  const start = Number(match[1]), requestedEnd = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(requestedEnd) || start >= size || requestedEnd < start) return null;
  return { start, end: Math.min(requestedEnd, size - 1) };
}

export async function localMediaSource(filename: string): Promise<MediaSource | null> {
  try { const file = await stat(filename); if (!file.isFile()) return null; return { size: file.size, stream: async range => Readable.toWeb(createReadStream(filename, range ? { start: range.start, end: range.end } : undefined)) as ReadableStream<Uint8Array> }; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}

function selectBytes(source: ReadableStream<Uint8Array>, range: ByteRange) {
  const reader = source.getReader(); let offset = 0; let ended = false;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (!ended) {
          const { value, done } = await reader.read();
          if (done) { ended = true; controller.close(); return; }
          const previous = offset; offset += value.length;
          if (offset <= range.start) continue;
          const bytes = value.subarray(Math.max(0, range.start - previous), Math.min(value.length, range.end + 1 - previous));
          if (bytes.length) controller.enqueue(bytes);
          if (offset > range.end) { ended = true; controller.close(); await reader.cancel(); }
          return;
        }
      } catch (error) { ended = true; controller.error(error); await reader.cancel().catch(() => {}); }
    },
    async cancel() { ended = true; await reader.cancel(); },
  });
}

export async function blobMediaSource(pathname: string): Promise<MediaSource | null> {
  try {
    const metadata = await head(pathname);
    return { size: metadata.size, stream: async (range, request) => {
      // Only our validated Range is forwarded; credentials and conditional
      // headers supplied by a visitor never reach the private Blob request.
      const blob = await get(pathname, { access: "private", abortSignal: request.signal, ...(range ? { headers: { Range: `bytes=${range.start}-${range.end}` } } : {}) });
      if (!blob?.stream) throw new Error("MEDIA_READ_FAILED");
      if (!range) return blob.stream;
      const contentRange = blob.headers.get("content-range");
      if (contentRange === `bytes ${range.start}-${range.end}/${metadata.size}`) return blob.stream;
      if (contentRange) { await blob.stream.cancel(); throw new Error("MEDIA_RANGE_FAILED"); }
      return selectBytes(blob.stream, range);
    } };
  } catch (error) { if (error instanceof BlobNotFoundError) return null; throw error; }
}

export async function respondWithMedia(request: Request, source: MediaSource, mime: string, filename: string) {
  const headers = { ...privateMediaHeaders, "Content-Type": mime, "Content-Length": String(source.size), "Accept-Ranges": "bytes", "Content-Disposition": `inline; filename="${filename}"` };
  if (request.method === "HEAD") return new Response(null, { headers });
  const requested = request.headers.get("range"); const range = requested ? parseMediaRange(requested, source.size) : null;
  if (requested && !range) return new Response(null, { status: 416, headers: { ...privateMediaHeaders, "Accept-Ranges": "bytes", "Content-Range": `bytes */${source.size}` } });
  return new Response(await source.stream(range, request), { status: range ? 206 : 200, headers: range ? { ...headers, "Content-Length": String(range.end - range.start + 1), "Content-Range": `bytes ${range.start}-${range.end}/${source.size}` } : headers });
}
