import "server-only";
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { accountInputSchema, accountSchema, publicAccount, type AdminAccount, type AdminIdentity } from "../data/adminAccount";
import { cmsCollection } from "./cmsCollection";
import { ensureDivision } from "./divisionStore";
import { CmsError } from "./cmsError";
import { validateMediaOwnership } from "./cmsMedia";

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
      if (seen.has(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !passwordHashParameters(entry.passwordHash)) continue;
      seen.add(email); accounts.push(accountSchema.parse({ ...entry, email, name: entry.division ? `Admin ${entry.division}` : "Super Admin", id: randomUUID(), role: entry.division ? "division_admin" : "super_admin", active: true, mustChangePassword: false, sessionVersion: 0, revision: 0, createdAt: now, updatedAt: now }));
    }
    if (!accounts.some(a => a.role === "super_admin")) throw new CmsError("Konfigurasi Super Admin belum tersedia.", 503);
    return { value: { initialized: true, accounts }, result: undefined };
  });
}
export async function accountsConfigured() { const current = await store.read(); return current.initialized ? current.accounts.some(a => a.active && a.role === "super_admin") : hasEnvironmentAccount(); }
const scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
type HashParameters = { salt: string; digest: string; legacy: boolean };
function passwordHashParameters(encoded: string): HashParameters | null {
  const legacy = /^scrypt:([a-f0-9]{16,128}):([a-f0-9]{128})$/i.exec(encoded);
  if (legacy && legacy[1].length % 2 === 0) return { salt: legacy[1], digest: legacy[2], legacy: true };
  const modern = /^scrypt-v2:131072:8:1:([a-f0-9]{32}):([a-f0-9]{128})$/i.exec(encoded);
  return modern ? { salt: modern[1], digest: modern[2], legacy: false } : null;
}
const cryptoShared = globalThis as typeof globalThis & { mbiScryptQueue?: { running: boolean; waiting: (() => void)[] } };
const cryptoQueue = cryptoShared.mbiScryptQueue ??= { running: false, waiting: [] };
async function derivePassword(password: string, salt: string, legacy: boolean): Promise<Buffer> {
  if (cryptoQueue.running) {
    if (cryptoQueue.waiting.length >= 32) throw new CmsError("Layanan autentikasi sedang sibuk. Coba kembali sebentar lagi.", 503);
    await new Promise<void>(resolve => cryptoQueue.waiting.push(resolve));
  } else cryptoQueue.running = true;
  try {
    return await new Promise<Buffer>((resolve, reject) => scrypt(password, salt, 64, legacy ? { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 } : scryptOptions, (error, result) => error ? reject(error) : resolve(result)));
  } finally {
    const next = cryptoQueue.waiting.shift();
    if (next) next(); else cryptoQueue.running = false;
  }
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt-v2:131072:8:1:${salt}:${(await derivePassword(password, salt, false)).toString("hex")}`;
}
export async function passwordMatches(password: string, encoded?: string) {
  const parameters = passwordHashParameters(encoded || "");
  const derived = await derivePassword(password, parameters?.salt || "00000000000000000000000000000000", parameters?.legacy || false);
  return timingSafeEqual(derived, Buffer.from(parameters?.digest || "0".repeat(128), "hex")) && Boolean(parameters);
}
// Successful legacy logins upgrade the hash without changing the password or invalidating other sessions.
export async function upgradeAccountPassword(accountId: string, password: string, previousHash: string) {
  if (!passwordHashParameters(previousHash)?.legacy) return;
  const passwordHash = await hashPassword(password);
  await store.mutate(current => {
    const account = current.accounts.find(a => a.id === accountId);
    if (!account || account.passwordHash !== previousHash) return { value: current, result: undefined };
    const saved = { ...account, passwordHash, revision: account.revision + 1, updatedAt: new Date().toISOString() };
    return { value: { ...current, accounts: current.accounts.map(a => a.id === accountId ? saved : a) }, result: undefined };
  });
}
export function assertSuper(actor: AdminIdentity) { if (actor.role !== "super_admin") throw new CmsError("Hanya Super Admin dapat mengelola akun.", 403); }
export async function saveOwnAvatar(actor: AdminIdentity, avatar: string, revision: number, sessionVersion: number) {
  await validateMediaOwnership({ avatar }, actor);
  return store.mutate(current => {
    const account = current.accounts.find(row => row.id === actor.id && row.active);
    if (!account || account.sessionVersion !== sessionVersion || account.revision !== revision) throw new CmsError("Akun telah diubah. Muat ulang sebelum menyimpan foto.", 409);
    const saved = accountSchema.parse({ ...account, avatar, revision: account.revision + 1, updatedAt: new Date().toISOString() });
    return { value: { ...current, accounts: current.accounts.map(row => row.id === account.id ? saved : row) }, result: publicAccount(saved) };
  });
}
export async function saveAccount(actor: AdminIdentity, input: unknown, id?: string, revision?: number) {
  assertSuper(actor); const parsed = accountInputSchema.parse(input);
  if (parsed.division) await ensureDivision(parsed.division);
  await validateMediaOwnership(parsed, { ...actor, division: parsed.division });
  const temporaryPassword = randomBytes(18).toString("base64url");
  const initialHash = id ? undefined : await hashPassword(temporaryPassword);
  return store.mutate(current => {
    const previous = id ? current.accounts.find(a => a.id === id) : undefined;
    if (id && !previous) throw new CmsError("Akun tidak ditemukan.", 404);
    if (previous && previous.revision !== revision) throw new CmsError("Akun telah diubah. Muat ulang.", 409);
    if ((!previous || previous.role === "division_admin") && !parsed.division) throw new CmsError("Pilih satu divisi untuk admin divisi.");
    if (previous?.role === "super_admin" && (parsed.division || !parsed.active)) throw new CmsError("Super Admin harus tetap aktif dan tidak ditugaskan ke satu divisi.");
    if (current.accounts.some(a => a.email === parsed.email && a.id !== id)) throw new CmsError("Email sudah digunakan.", 409);
    const now = new Date().toISOString();
    const avatar = previous && previous.division !== parsed.division ? parsed.avatar || "" : parsed.avatar ?? previous?.avatar;
    const saved = accountSchema.parse({ ...previous, ...parsed, avatar, id: id || randomUUID(), role: previous?.role || "division_admin", passwordHash: previous?.passwordHash || initialHash, mustChangePassword: previous?.mustChangePassword ?? true, sessionVersion: (previous?.sessionVersion || 0) + (previous && (previous.division !== parsed.division || previous.active !== parsed.active || previous.email !== parsed.email) ? 1 : 0), revision: previous ? previous.revision + 1 : 0, createdAt: previous?.createdAt || now, updatedAt: now });
    return { value: { ...current, accounts: previous ? current.accounts.map(a => a.id === id ? saved : a) : [...current.accounts, saved] }, result: { account: publicAccount(saved), ...(!previous ? { temporaryPassword } : {}) } };
  });
}
export async function resetAccount(actor: AdminIdentity, id: string, revision: number, chosenPassword?: string) {
  assertSuper(actor);
  const manualPassword = chosenPassword === undefined ? undefined : z.string().min(12, "Password minimal 12 karakter.").max(128).parse(chosenPassword);
  const temporaryPassword = manualPassword ?? randomBytes(18).toString("base64url");
  const passwordHash = await hashPassword(temporaryPassword);
  return store.mutate(current => {
    const account = current.accounts.find(a => a.id === id);
    if (!account) throw new CmsError("Akun tidak ditemukan.", 404);
    if (account.revision !== revision) throw new CmsError("Akun telah diubah. Muat ulang.", 409);
    if (account.id === actor.id || account.role === "super_admin") throw new CmsError("Gunakan Akun saya untuk mengganti password Super Admin.");
    const saved = { ...account, passwordHash, mustChangePassword: true, sessionVersion: account.sessionVersion + 1, revision: account.revision + 1, updatedAt: new Date().toISOString() };
    return { value: { ...current, accounts: current.accounts.map(a => a.id === id ? saved : a) }, result: { account: publicAccount(saved), ...(manualPassword === undefined ? { temporaryPassword } : {}) } };
  });
}
export const passwordChangeSchema = z.object({ currentPassword: z.string().min(1).max(1024), newPassword: z.string().min(12, "Password minimal 12 karakter.").max(128) }).refine(v => v.currentPassword !== v.newPassword, "Gunakan password baru yang berbeda.");
export async function changePassword(actor: AdminIdentity, input: unknown, expectedSessionVersion: number) {
  const parsed = passwordChangeSchema.parse(input);
  const snapshot = (await readAccounts()).find(a => a.id === actor.id && a.active);
  // Bind verification to the cookie that authorized this request, even if an
  // administrator changed assignment before this password snapshot was read.
  if (!snapshot || snapshot.sessionVersion !== expectedSessionVersion) throw new CmsError("Akun telah berubah. Silakan masuk kembali.", 409);
  if (!await passwordMatches(parsed.currentPassword, snapshot?.passwordHash) || !snapshot) throw new CmsError("Password lama tidak sesuai.", 400);
  const passwordHash = await hashPassword(parsed.newPassword);
  return store.mutate(current => {
    const account = current.accounts.find(a => a.id === actor.id && a.active);
    if (!account || account.sessionVersion !== expectedSessionVersion || account.passwordHash !== snapshot.passwordHash) throw new CmsError("Akun telah berubah. Silakan masuk kembali.", 409);
    const saved = { ...account, passwordHash, mustChangePassword: false, sessionVersion: account.sessionVersion + 1, revision: account.revision + 1, updatedAt: new Date().toISOString() };
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
