import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../../src/lib/adminAuth";
import { siteContentSchema } from "../../../../src/data/siteContent";
import { readSiteContent, writeSiteContent } from "../../../../src/lib/siteContentStore";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";

export const runtime = "nodejs";
async function authorized() { return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value); }
export async function GET() {
  if (!await authorized()) return Response.json({ message: "Silakan masuk kembali." }, { status: 401 });
  return Response.json(await readSiteContent(), { headers: { "Cache-Control": "no-store" } });
}
export async function PUT(request: Request) {
  if (!await authorized()) return Response.json({ message: "Silakan masuk kembali." }, { status: 401 });
  if (!adminRequestOrigin(request)) return Response.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 350000) return Response.json({ message: "Konten terlalu besar." }, { status: 413 });
  const raw = await request.text();
  if (raw.length > 350000) return Response.json({ message: "Konten terlalu besar." }, { status: 413 });
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return Response.json({ message: "Format konten tidak valid." }, { status: 400 }); }
  const result = siteContentSchema.safeParse(json);
  if (!result.success) return Response.json({ message: result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 400 });
  try { return Response.json(await writeSiteContent(result.data), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) {
    const code = (error as Error).message;
    if (code === "CMS_CONFLICT" || code === "CMS_BUSY") return Response.json({ message: "Konten sedang atau sudah diubah di tab lain. Muat ulang halaman sebelum menyimpan kembali." }, { status: 409 });
    console.error("CMS save failed", error);
    return Response.json({ message: "Konten belum tersimpan. Coba kembali." }, { status: 500 });
  }
}
