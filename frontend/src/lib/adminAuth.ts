import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { accountsConfigured, initializeAccounts, passwordMatches, readAccounts, upgradeAccountPassword } from "./accountStore";
import { readDivisions } from "./divisionStore";
import { readSecuritySession, registerSecuritySession, revokeSecuritySession } from "./securityState";
import { CmsError } from "./cmsError";
import type { AdminIdentity } from "../data/adminAccount";
export const ADMIN_COOKIE = "mbi_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
const sessionSchema = z.object({ id: z.string().min(1).max(100), version: z.number().int().nonnegative(), sid: z.string().uuid(), exp: z.number().int().positive() });
export type AuthenticatedAccount = { id: string; email: string; sessionVersion: number };
export function adminSecretConfigured() {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return Buffer.byteLength(secret, "utf8") >= 32 && new Set(secret).size >= 12;
}
export async function adminConfigured() { return adminSecretConfigured() && await accountsConfigured(); }
export async function checkAdminCredentials(email: string, password: string): Promise<AuthenticatedAccount | null> {
  if (!await adminConfigured()) return null;
  await initializeAccounts();
  const account = (await readAccounts()).find(a => a.email === email.toLowerCase().trim());
  if (!await passwordMatches(password, account?.passwordHash) || !account?.active) return null;
  if (account.division && !(await readDivisions()).some(d => d.slug === account.division && d.status === "active")) return null;
  await upgradeAccountPassword(account.id, password, account.passwordHash);
  return { id: account.id, email: account.email, sessionVersion: account.sessionVersion };
}
function sign(payload: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url"); }
function parseAdminSession(value?: string) {
  if (!adminSecretConfigured() || !value || value.length > 2048) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra || !/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
  const expected = Buffer.from(sign(payload)); const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
    return parsed.success && parsed.data.exp > Math.floor(Date.now() / 1000) ? parsed.data : null;
  } catch { return null; }
}
export async function createAdminSession(authenticated: AuthenticatedAccount) {
  if (!adminSecretConfigured()) throw new CmsError("Konfigurasi keamanan admin belum lengkap.", 503);
  // Never adopt a later version after checking an older password snapshot.
  const account = (await readAccounts()).find(a => a.id === authenticated.id && a.email === authenticated.email && a.active && a.sessionVersion === authenticated.sessionVersion);
  if (!account || (account.division && !(await readDivisions()).some(d => d.slug === account.division && d.status === "active"))) throw new CmsError("Akun telah berubah. Silakan masuk kembali.", 401);
  const session = { id: account.id, version: account.sessionVersion, sid: randomUUID(), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS };
  await registerSecuritySession({ sid: session.sid, accountId: session.id, version: session.version, expiresAt: session.exp * 1000 });
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
// The session version stays server-only; clients receive only the public identity.
export async function readAdminAuthentication(value?: string): Promise<{ identity: AdminIdentity; sessionVersion: number } | null> {
  const session = parseAdminSession(value);
  if (!session) return null;
  const registered = await readSecuritySession(session.sid);
  if (!registered || registered.accountId !== session.id || registered.version !== session.version || registered.expiresAt !== session.exp * 1000) return null;
  const account = (await readAccounts()).find(a => a.id === session.id && a.active && a.sessionVersion === session.version);
  if (!account || (account.division && !(await readDivisions()).some(d => d.slug === account.division && d.status === "active"))) return null;
  return { identity: { id: account.id, email: account.email, name: account.name, role: account.role, division: account.division, mustChangePassword: account.mustChangePassword }, sessionVersion: session.version };
}
export async function readAdminIdentity(value?: string): Promise<AdminIdentity | null> {
  return (await readAdminAuthentication(value))?.identity ?? null;
}
export async function revokeAdminSession(value?: string) {
  const session = parseAdminSession(value);
  if (session) await revokeSecuritySession(session.sid);
}
export async function verifyAdminSession(value?: string) { const identity = await readAdminIdentity(value); return Boolean(identity && !identity.mustChangePassword); }
export const adminCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS };
