import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkAdminCredentials, createAdminSession } from "../../../../src/lib/adminAuth";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) return new NextResponse("Forbidden", { status: 403 });
  if (!adminConfigured()) return NextResponse.redirect(new URL("/admin/login?error=unavailable", request.url), 303);
  const data = await request.formData();
  const email = data.get("email");
  const password = data.get("password");
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024 || !checkAdminCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin/login?error=credentials", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), adminCookieOptions);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
