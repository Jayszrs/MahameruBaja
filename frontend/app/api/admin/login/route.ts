import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkAdminCredentials, createAdminSession, readAdminIdentity } from "../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";
import { apiError, noStore } from "../../../../src/lib/adminApi";
import { readFormBody } from "../../../../src/lib/requestBody";
import { consumeLoginLimit, securityEvent, SecurityRateError } from "../../../../src/lib/securityState";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = adminRequestOrigin(request);
  if (!origin) return new NextResponse("Forbidden", { status: 403 });
  try {
    if (!await adminConfigured()) return NextResponse.redirect(new URL("/admin/login?error=unavailable", origin), 303);
    const data = await readFormBody(request, 4096);
    const email = data.get("email");
    const password = data.get("password");
    await consumeLoginLimit(request, typeof email === "string" && email.length <= 254 ? email : "invalid-form");
    const authenticated = typeof email === "string" && typeof password === "string" && email.length <= 254 && password.length <= 1024 ? await checkAdminCredentials(email, password) : null;
    if (!authenticated) {
      securityEvent("login_failed");
      return NextResponse.redirect(new URL("/admin/login?error=credentials", origin), 303);
    }
    const token = await createAdminSession(authenticated);
    const identity = await readAdminIdentity(token);
    const response = NextResponse.redirect(new URL(identity?.mustChangePassword ? "/admin/akun-saya" : "/admin", origin), 303);
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    response.headers.set("Cache-Control", "no-store");
    securityEvent("login_success", authenticated.id);
    return response;
  } catch (error) {
    if (error instanceof SecurityRateError) {
      securityEvent("login_limited");
      return new NextResponse("Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu kembali ke halaman login dan coba lagi.", { status: 429, headers: { ...noStore, "Retry-After": String(error.retryAfter), "Content-Type": "text/plain; charset=utf-8" } });
    }
    return apiError(error);
  }
}
