import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { divisionSlugs } from "../data/siteContent";
export const ADMIN_COOKIE = "mbi_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
type Account = { email: string; passwordHash: string; division: string | null };
function accounts(): Account[] {
  const all: Account[] = [];
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) all.push({ email: process.env.ADMIN_EMAIL.toLowerCase().trim(), passwordHash: process.env.ADMIN_PASSWORD_HASH, division: null });
  try {
    const values = JSON.parse(process.env.ADMIN_ACCOUNTS_JSON || "[]");
    if (Array.isArray(values)) for (const value of values) if (typeof value.email === "string" && typeof value.passwordHash === "string" && divisionSlugs.includes(value.division)) all.push({ email: value.email.toLowerCase().trim(), passwordHash: value.passwordHash, division: value.division });
  } catch { /* fail closed on malformed account config */ }
  return all;
}
export function adminConfigured() { return Boolean(process.env.ADMIN_SESSION_SECRET && accounts().length); }
export function checkAdminCredentials(email: string, password: string) {
  if (!adminConfigured()) return false;
  const account = accounts().find(a => a.email === email.toLowerCase().trim());
  // Perform the same work for unknown emails; never disclose account existence.
  const [algorithm,salt,digest] = (account?.passwordHash || "scrypt:invalid:" + "0".repeat(128)).split(":");
  if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/i.test(digest || "")) return false;
  return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(digest,"hex")) && Boolean(account);
}
function sign(payload: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url"); }
export function createAdminSession(email = process.env.ADMIN_EMAIL || "") {
  const account = accounts().find(a => a.email === email.toLowerCase().trim());
  if (!adminConfigured() || !account) throw new Error("Admin credentials are not configured");
  const payload = Buffer.from(JSON.stringify({ email: account.email, division: account.division, exp: Math.floor(Date.now()/1000)+SESSION_SECONDS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function readAdminIdentity(value?: string): { email: string; division: string | null } | null {
  if (!adminConfigured() || !value) return null;
  const [payload,signature,extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload)); const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected,actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));
    const account = accounts().find(a => a.email === session.email);
    return account && typeof session.exp === "number" && session.exp > Math.floor(Date.now()/1000) && (session.division ?? null) === account.division ? { email: account.email, division: account.division } : null;
  } catch { return null; }
}
export function verifyAdminSession(value?: string) { return Boolean(readAdminIdentity(value)); }
export const adminCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS };
