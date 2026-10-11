import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { accountInputSchema, accountSchema, publicAccount, type AdminAccount, type AdminIdentity } from "../data/adminAccount";
import { cmsCollection } from "./cmsCollection";
import { ensureDivision } from "./divisionStore";
import { CmsError } from "./cmsError";

const store = cmsCollection("accounts", z.object({ initialized: z.boolean(), accounts: z.array(accountSchema) }), () => ({ initialized: false, accounts: [] }));
export async function readAccounts() { return (await store.read()).accounts; }
export function hasEnvironmentAccount() { return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH); }
export async function initializeAccounts() {
  if ((await store.read()).initialized) return;
  await store.mutate(current => {
    if (current.initialized) return { value: current, result: undefined };
    const configured: { email: string; passwordHash: string; division: string | null }[] = [];
    if (hasEnvironmentAccount()) configured.push({ email: process.env.ADMIN_EMAIL!, passwordHash: process.env.ADMIN_PASSWORD_HASH!, division: null });
    try { const list = JSON.parse(process.env.ADMIN_ACCOUNTS_JSON || "[]"); if (Array.isArray(list)) for (const entry of list) if (typeof entry.email === "string" && typeof entry.passwordHash === "string" && typeof entry.division === "string") configured.push(entry); } catch { /* malformed env fails closed */ }
    const seen = new Set<string>(); const now = new Date().toISOString();
    const accounts: AdminAccount[] = [];
    for (const entry of configured) {
      const email = entry.email.toLowerCase().trim();
      if (seen.has(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^scrypt:[a-f0-9]+:[a-f0-9]{128}$/i.test(entry.passwordHash)) continue;
      seen.add(email); accounts.push(accountSchema.parse({ ...entry, email, name: entry.division ? `Admin ${entry.division}` : "Super Admin", id: randomUUID(), role: entry.division ? "division_admin" : "super_admin", active: true, mustChangePassword: false, sessionVersion: 0, revision: 0, createdAt: now, updatedAt: now }));
    }
    if (!accounts.some(a => a.role === "super_admin")) throw new CmsError("Konfigurasi Super Admin belum tersedia.", 503);
    return { value: { initialized: true, accounts }, result: undefined };
  });
}
export async function accountsConfigured() { const current = await store.read(); return current.initialized ? current.accounts.some(a => a.active && a.role === "super_admin") : hasEnvironmentAccount(); }
export function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`; }
export function passwordMatches(password: string, encoded?: string) {
  const [algorithm, salt, digest] = (encoded || `scrypt:0000000000000000:${"0".repeat(128)}`).split(":");
  if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/i.test(digest || "")) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(digest, "hex")) && Boolean(encoded);
}
export function assertSuper(actor: AdminIdentity) { if (actor.role !== "super_admin") throw new CmsError("Hanya Super Admin dapat mengelola akun.", 403); }
export async function saveAccount(actor: AdminIdentity, input: unknown, id?: string, revision?: number) {
  assertSuper(actor); const parsed = accountInputSchema.parse(input);
  if (parsed.division) await ensureDivision(parsed.division);
  const temporaryPassword = randomBytes(18).toString("base64url");
  return store.mutate(current => {
    const previous = id ? current.accounts.find(a => a.id === id) : undefined;
    if (id && !previous) throw new CmsError("Akun tidak ditemukan.", 404);
    if (previous && previous.revision !== revision) throw new CmsError("Akun telah diubah. Muat ulang.", 409);
    if ((!previous || previous.role === "division_admin") && !parsed.division) throw new CmsError("Pilih satu divisi untuk admin divisi.");
    if (previous?.role === "super_admin" && (parsed.division || !parsed.active)) throw new CmsError("Super Admin harus tetap aktif dan tidak ditugaskan ke satu divisi.");
    if (current.accounts.some(a => a.email === parsed.email && a.id !== id)) throw new CmsError("Email sudah digunakan.", 409);
    const now = new Date().toISOString();
    const saved = accountSchema.parse({ ...previous, ...parsed, id: id || randomUUID(), role: previous?.role || "division_admin", passwordHash: previous?.passwordHash || hashPassword(temporaryPassword), mustChangePassword: previous?.mustChangePassword ?? true, sessionVersion: (previous?.sessionVersion || 0) + (previous && (previous.division !== parsed.division || previous.active !== parsed.active || previous.email !== parsed.email) ? 1 : 0), revision: previous ? previous.revision + 1 : 0, createdAt: previous?.createdAt || now, updatedAt: now });
    return { value: { ...current, accounts: previous ? current.accounts.map(a => a.id === id ? saved : a) : [...current.accounts, saved] }, result: { account: publicAccount(saved), ...(!previous ? { temporaryPassword } : {}) } };
  });
}
export async function resetAccount(actor: AdminIdentity, id: string, revision: number) {
  assertSuper(actor); const temporaryPassword = randomBytes(18).toString("base64url");
  return store.mutate(current => {
    const account = current.accounts.find(a => a.id === id);
    if (!account) throw new CmsError("Akun tidak ditemukan.", 404);
    if (account.revision !== revision) throw new CmsError("Akun telah diubah. Muat ulang.", 409);
    if (account.id === actor.id || account.role === "super_admin") throw new CmsError("Gunakan Akun saya untuk mengganti password Super Admin.");
    const saved = { ...account, passwordHash: hashPassword(temporaryPassword), mustChangePassword: true, sessionVersion: account.sessionVersion + 1, revision: account.revision + 1, updatedAt: new Date().toISOString() };
    return { value: { ...current, accounts: current.accounts.map(a => a.id === id ? saved : a) }, result: { account: publicAccount(saved), temporaryPassword } };
  });
}
export const passwordChangeSchema = z.object({ currentPassword: z.string().min(1).max(1024), newPassword: z.string().min(12, "Password minimal 12 karakter.").max(128) }).refine(v => v.currentPassword !== v.newPassword, "Gunakan password baru yang berbeda.");
export async function changePassword(actor: AdminIdentity, input: unknown) {
  const parsed = passwordChangeSchema.parse(input);
  return store.mutate(current => {
    const account = current.accounts.find(a => a.id === actor.id && a.active);
    if (!account || !passwordMatches(parsed.currentPassword, account.passwordHash)) throw new CmsError("Password lama tidak sesuai.", 400);
    const saved = { ...account, passwordHash: hashPassword(parsed.newPassword), mustChangePassword: false, sessionVersion: account.sessionVersion + 1, revision: account.revision + 1, updatedAt: new Date().toISOString() };
    return { value: { ...current, accounts: current.accounts.map(a => a.id === account.id ? saved : a) }, result: saved };
  });
}
export async function deleteAccount(actor: AdminIdentity, id: string, revision: number) {
  assertSuper(actor);
  return store.mutate(current => {
    const account = current.accounts.find(a => a.id === id);
    if (!account) throw new CmsError("Akun tidak ditemukan.", 404);
    if (account.revision !== revision) throw new CmsError("Akun telah diubah. Muat ulang.", 409);
    if (account.id === actor.id || account.role === "super_admin" || account.active) throw new CmsError("Hanya akun admin divisi nonaktif yang dapat dihapus.");
    return { value: { ...current, accounts: current.accounts.filter(a => a.id !== id) }, result: { deleted: id } };
  });
}
