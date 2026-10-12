import path from "node:path";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../src/lib/adminAuth";
import { mediaAllowed } from "../../../src/lib/cmsMedia";
import { mediaFilename } from "../../../src/lib/mediaReferences";
import { localMediaSource, missingMedia, privateMediaHeaders, respondWithMedia } from "../../../src/lib/mediaResponse";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    if (!mediaFilename.test(filename)) return missingMedia();
    const source = await localMediaSource(path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "media", filename));
    if (!source || !await mediaAllowed(`/media/${filename}`, await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value))) return missingMedia();
    const mime = filename.endsWith(".mp4") ? "video/mp4" : filename.endsWith(".jpg") ? "image/jpeg" : filename.endsWith(".png") ? "image/png" : "image/webp";
    return respondWithMedia(request, source, mime, filename);
  } catch { console.error("Legacy CMS media read failed"); return new Response(null, { status: 503, headers: privateMediaHeaders }); }
}
export const HEAD = GET;
