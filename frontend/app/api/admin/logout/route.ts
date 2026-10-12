import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, revokeAdminSession } from "../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";
import { apiError } from "../../../../src/lib/adminApi";
import { securityEvent } from "../../../../src/lib/securityState";

export async function POST(request: NextRequest) {
  const origin = adminRequestOrigin(request);
  if (!origin) return new NextResponse("Forbidden", { status: 403 });
  try {
    await revokeAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
    const response = NextResponse.redirect(new URL("/admin/login", origin), 303);
    response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions, maxAge: 0 });
    response.headers.set("Cache-Control", "no-store");
    securityEvent("logout");
    return response;
  } catch (error) { return apiError(error); }
}
