import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isIP } from "node:net";
import { get, put } from "@vercel/blob";
import { z } from "zod";
import { CmsError } from "./cmsError";
import { replaceCmsFile, withCmsFileLock } from "./cmsFileLock";
import { usingPreviewBlob } from "./previewBlobStore";
import { cmsBlobPrefix } from "./cmsStorageConfig";

const sessionSchema = z.object({ sid: z.string().uuid(), accountId: z.string().min(1).max(100), version: z.number().int().nonnegative(), expiresAt: z.number().int().positive(), createdAt: z.number().int().positive() });
const rateSchema = z.object({ key: z.string().regex(/^[a-f0-9]{64}$/), count: z.number().int().nonnegative(), expiresAt: z.number().int().positive() });
const schema = z.object({ sessions: z.array(sessionSchema).max(5000), rates: z.array(rateSchema).max(5000) });
type State = z.infer<typeof schema>;
export type SecuritySession = Omit<z.infer<typeof sessionSchema>, "createdAt">;
type RateRule = { key: string; limit: number; windowMs: number };
const empty = (): State => ({ sessions: [], rates: [] });
const stateFile = () => path.join(process.env.CMS_DATA_DIR || path.join(process.cwd(), ".cms-data"), "security-state.json");
const blobPath = () => `${cmsBlobPrefix()}security/state.json`;

export class SecurityRateError extends CmsError {
  constructor(public retryAfter: number) { super("Terlalu banyak percobaan. Tunggu beberapa menit lalu coba kembali.", 429); }
}

export function securityEvent(event: "login_success" | "login_failed" | "login_limited" | "logout" | "password_changed" | "password_failed" | "password_limited" | "upload_limited" | "security_storage_failed", accountId?: string) {
  // Only fixed event names and internal IDs are logged; never credentials or request bodies.
  console.info(JSON.stringify({ event: `admin_${event}`, at: new Date().toISOString(), ...(accountId ? { accountId } : {}) }));
}

async function readBlobState(): Promise<{ value: State; etag?: string }> {
  const result = await get(blobPath(), { access: "private", useCache: false });
  if (!result) return { value: empty() };
  if (!result.stream) throw new Error("SECURITY_STORAGE_READ_FAILED");
  return { value: schema.parse(JSON.parse(await new Response(result.stream).text())), etag: result.blob.etag };
}
async function readLocalState(): Promise<State> {
  try { return schema.parse(JSON.parse(await readFile(stateFile(), "utf8"))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return empty(); throw error; }
}
function prune(value: State, now: number): State {
  return { sessions: value.sessions.filter(s => s.expiresAt > now), rates: value.rates.filter(r => r.expiresAt > now) };
}
async function storageFailure<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error) {
    if (error instanceof CmsError) throw error;
    securityEvent("security_storage_failed");
    throw new CmsError("Layanan keamanan sedang tidak tersedia. Coba kembali sebentar lagi.", 503);
  }
}
async function mutate<R>(update: (state: State, now: number) => R): Promise<R> {
  return storageFailure(async () => {
    if (usingPreviewBlob()) {
      for (let attempt = 0; attempt < 12; attempt++) {
        const current = await readBlobState();
        const now = Date.now();
        const next = prune(current.value, now);
        const result = update(next, now);
        try {
          await put(blobPath(), JSON.stringify(schema.parse(next)), { access: "private", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 60, ...(current.etag ? { allowOverwrite: true, ifMatch: current.etag } : { allowOverwrite: false }) });
          return result;
        } catch (error) {
          const latest = await readBlobState();
          if (latest.etag === current.etag) throw error;
          await new Promise(resolve => setTimeout(resolve, Math.min(100, 10 * (attempt + 1)) + Math.random() * 20));
        }
      }
      throw new Error("SECURITY_STORAGE_BUSY");
    }
    const file = stateFile();
    return withCmsFileLock(file, async () => {
      const now = Date.now();
      const next = prune(await readLocalState(), now);
      const result = update(next, now);
      const temp = `${file}.${randomUUID()}.tmp`;
      try { await writeFile(temp, JSON.stringify(schema.parse(next)), { encoding: "utf8", mode: 0o600 }); await replaceCmsFile(temp, file); }
      finally { await unlink(temp).catch(() => {}); }
      return result;
    });
  });
}
async function read(): Promise<State> { return storageFailure(async () => prune(usingPreviewBlob() ? (await readBlobState()).value : await readLocalState(), Date.now())); }

export async function registerSecuritySession(session: SecuritySession) {
  await mutate((state, now) => {
    const own = state.sessions.filter(s => s.accountId === session.accountId).sort((a, b) => a.createdAt - b.createdAt);
    const evicted = new Set(own.slice(0, Math.max(0, own.length - 31)).map(s => s.sid));
    state.sessions = state.sessions.filter(s => !evicted.has(s.sid));
    if (state.sessions.length >= 5000) throw new CmsError("Terlalu banyak sesi aktif. Coba kembali nanti.", 503);
    state.sessions.push(sessionSchema.parse({ ...session, createdAt: now }));
  });
}
export async function readSecuritySession(sid: string) { return (await read()).sessions.find(s => s.sid === sid) || null; }
export async function revokeSecuritySession(sid: string) { await mutate(state => { state.sessions = state.sessions.filter(s => s.sid !== sid); }); }

function rateKey(kind: string, identifier: string) { return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(`${kind}:${identifier}`).digest("hex"); }
async function consume(rules: RateRule[]) {
  await mutate((state, now) => {
    const blocked = rules.map(rule => ({ rule, row: state.rates.find(r => r.key === rule.key) })).filter(({ rule, row }) => row && row.count >= rule.limit);
    if (blocked.length) throw new SecurityRateError(Math.max(1, ...blocked.map(({ row }) => Math.ceil((row!.expiresAt - now) / 1000))));
    const newCount = rules.filter(rule => !state.rates.some(r => r.key === rule.key)).length;
    if (state.rates.length + newCount > 5000) throw new CmsError("Layanan keamanan sedang sibuk. Coba kembali nanti.", 503);
    for (const rule of rules) {
      const row = state.rates.find(r => r.key === rule.key);
      if (row) row.count += 1;
      else state.rates.push({ key: rule.key, count: 1, expiresAt: now + rule.windowMs });
    }
  });
}
function trustedClientIp(request: Request) {
  // Vercel overwrites this header at its trusted edge. Direct Docker clients cannot choose their bucket.
  if (process.env.VERCEL !== "1") return "direct";
  const value = request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "";
  return isIP(value) ? value : "unknown";
}
const windowMs = 15 * 60 * 1000;
export async function consumeLoginLimit(request: Request, email: string) {
  await consume([{ key: rateKey("login-account", email.toLowerCase().trim()), limit: 10, windowMs }, { key: rateKey("login-ip", trustedClientIp(request)), limit: 30, windowMs }]);
}
export async function consumePasswordLimit(accountId: string) { await consume([{ key: rateKey("password", accountId), limit: 5, windowMs }]); }
export async function consumeUploadLimit(accountId: string) {
  try { await consume([{ key: rateKey("upload", accountId), limit: 60, windowMs }]); }
  catch (error) { if (error instanceof SecurityRateError) securityEvent("upload_limited", accountId); throw error; }
}
