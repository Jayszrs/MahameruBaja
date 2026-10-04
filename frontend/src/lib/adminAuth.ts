import "server-only";

import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "mbi_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function configured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}

export function adminConfigured() {
  return configured();
}

export function checkAdminCredentials(email: string, password: string) {
  if (!configured()) return false;
  const expectedEmail = process.env.ADMIN_EMAIL!.trim().toLowerCase();
  const [algorithm, salt, digest] = process.env.ADMIN_PASSWORD_HASH!.split(":");
  if (algorithm !== "scrypt" || !salt || !digest || !/^[a-f0-9]{128}$/i.test(digest)) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return timingSafeEqual(candidate, expected) && email.trim().toLowerCase() === expectedEmail;
}

function sign(payload: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url");
}

export function createAdminSession() {
  if (!configured()) throw new Error("Admin credentials are not configured");
  const payload = Buffer.from(JSON.stringify({
    email: process.env.ADMIN_EMAIL!.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(value?: string) {
  if (!configured() || !value) return false;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return false;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; exp?: number };
    return session.email === process.env.ADMIN_EMAIL!.trim().toLowerCase() &&
      typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};
