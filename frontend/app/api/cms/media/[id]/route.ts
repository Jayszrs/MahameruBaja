import { cookies } from "next/headers";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../../../src/lib/adminAuth";
import { cmsMediaResponse } from "../../../../../src/lib/cmsMedia";
export const runtime = "nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) { return cmsMediaResponse((await params).id,await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value)); }
