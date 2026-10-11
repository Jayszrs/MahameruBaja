import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { accountsConfigured, initializeAccounts, passwordMatches, readAccounts } from "./accountStore";
import { readDivisions } from "./divisionStore";
import type { AdminIdentity } from "../data/adminAccount";
export const ADMIN_COOKIE = "mbi_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
export async function adminConfigured() { return Boolean(process.env.ADMIN_SESSION_SECRET && await accountsConfigured()); }
export async function checkAdminCredentials(email: string, password: string) {
  if (!await adminConfigured()) return false;
  await initializeAccounts();
  const account = (await readAccounts()).find(a => a.email === email.toLowerCase().trim());
  if (!passwordMatches(password, account?.passwordHash) || !account?.active) return false;
  return !account.division || (await readDivisions()).some(d => d.slug === account.division && d.status === "active");
}
function sign(payload: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(payload).digest("base64url"); }
export async function createAdminSession(email: string) {
  const account = (await readAccounts()).find(a => a.email === email.toLowerCase().trim() && a.active);
  if (!process.env.ADMIN_SESSION_SECRET || !account) throw new Error("Admin credentials are not configured");
  const payload = Buffer.from(JSON.stringify({ id: account.id, version: account.sessionVersion, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
  return payload + "." + sign(payload);
}
export async function readAdminIdentity(value?: string): Promise<AdminIdentity | null> {
  if (!process.env.ADMIN_SESSION_SECRET || !value) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload)); const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  let session: { id?: string; version?: number; exp?: number };
  try { session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { return null; }
  if (typeof session.exp !== "number" || session.exp <= Math.floor(Date.now() / 1000)) return null;
  const account = (await readAccounts()).find(a => a.id === session.id && a.active && a.sessionVersion === session.version);
  if (!account || (account.division && !(await readDivisions()).some(d => d.slug === account.division && d.status === "active"))) return null;
  return { id: account.id, email: account.email, name: account.name, role: account.role, division: account.division, mustChangePassword: account.mustChangePassword };
}
export async function verifyAdminSession(value?: string) { const identity = await readAdminIdentity(value); return Boolean(identity && !identity.mustChangePassword); }
export const adminCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_SECONDS };
