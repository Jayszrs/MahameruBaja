import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkAdminCredentials, createAdminSession } from "../../../../src/lib/adminAuth";
import { adminRequestOrigin } from "../../../../src/lib/adminRequestOrigin";

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const origin = adminRequestOrigin(request);
  if (!origin) return new NextResponse("Forbidden", { status: 403 });
  if (!adminConfigured()) return NextResponse.redirect(new URL("/admin/login?error=unavailable", origin), 303);
  if (Number(request.headers.get("content-length") || 0) > 4096) return new NextResponse("Request too large", { status: 413 });
  const ip = (request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "local").split(",")[0].slice(0, 128);
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.resetAt <= now) attempts.delete(key);
  const rate = attempts.get(ip) || { count: 0, resetAt: now + windowMs };
  if (rate.count >= 10) return NextResponse.redirect(new URL("/admin/login?error=rate", origin), 303);
  const data = await request.formData();
  const email = data.get("email");
  const password = data.get("password");
  if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 1024 || !checkAdminCredentials(email, password)) {
    rate.count += 1;
    attempts.set(ip, rate);
    return NextResponse.redirect(new URL("/admin/login?error=credentials", origin), 303);
  }
  attempts.delete(ip);
  const response = NextResponse.redirect(new URL("/admin", origin), 303);
  response.cookies.set(ADMIN_COOKIE, createAdminSession(email), adminCookieOptions);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
