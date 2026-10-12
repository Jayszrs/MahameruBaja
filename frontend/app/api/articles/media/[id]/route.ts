import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../../../src/lib/adminAuth";
import { articleImageResponse } from "../../../../../src/lib/articleMedia";
import { privateMediaHeaders } from "../../../../../src/lib/mediaResponse";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { return await articleImageResponse((await params).id, await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value), request); }
  catch { console.error("Article media read failed"); return new Response(null, { status: 503, headers: privateMediaHeaders }); }
}
export const HEAD = GET;
