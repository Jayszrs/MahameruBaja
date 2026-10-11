import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../../../src/lib/adminAuth";
import { articleImageResponse } from "../../../../../src/lib/articleMedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { return await articleImageResponse((await params).id, await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value)); }
  catch (error) { console.error("Article media read failed", error); return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
