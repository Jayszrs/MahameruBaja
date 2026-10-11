import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../src/lib/adminAuth";
import { mediaAllowed } from "../../../src/lib/cmsMedia";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|mp4)$/.test(filename)) return new Response(null, { status: 404 });
  if(!await mediaAllowed(`/media/${filename}`,await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value))) return new Response(null,{status:404,headers:{"Cache-Control":"private, no-store"}});
  try {
    const file = path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "media", filename);
    const { size } = await stat(file);
    const extension = filename.split(".").at(-1);
    const type = extension === "mp4" ? "video/mp4" : `image/${extension === "jpg" ? "jpeg" : extension}`;
    const headers = { "Content-Type": type, "Cache-Control": "private, no-store", "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff" };
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      const start = Number(match[1]); const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      const bytes = await readFile(file);
      return new Response(bytes.subarray(start, end + 1), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
    }
    return new Response(await readFile(file), { headers: { ...headers, "Content-Length": String(size) } });
  } catch { return new Response(null, { status: 404 }); }
}
