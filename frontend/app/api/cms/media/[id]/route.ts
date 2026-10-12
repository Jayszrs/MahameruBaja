import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../../../src/lib/adminAuth";
import { cmsMediaResponse } from "../../../../../src/lib/cmsMedia";
import { privateMediaHeaders } from "../../../../../src/lib/mediaResponse";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { return await cmsMediaResponse((await params).id, await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value), request); }
  catch { console.error("CMS media read failed"); return new Response(null, { status: 503, headers: privateMediaHeaders }); }
}
export const HEAD = GET;
