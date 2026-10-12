// Isolated unit checks: temporary filesystem and an in-memory private Blob CAS adapter only.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHmac, randomBytes, randomUUID, scryptSync } from "node:crypto";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRequire = createRequire(process.env.SECURITY_TEST_PACKAGES || path.join(frontend, "package.json"));
const ts = packageRequire("typescript");
const directory = fs.mkdtempSync(path.join(os.tmpdir(), "mahameru-auth-security-"));
const names = ["CMS_DATA_DIR", "CMS_BLOB_PREFIX", "BLOB_READ_WRITE_TOKEN", "ADMIN_SESSION_SECRET", "NODE_ENV", "VERCEL", "ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "ADMIN_ACCOUNTS_JSON"];
const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
let checks = 0;
const check = (condition, label) => { assert.ok(condition, label); checks++; };
async function rejected(operation, status, label) { await assert.rejects(operation, error => error.status === status, label); checks++; }
let divisionActive = true;
const blobMemory = new Map();
let blobSerial = 0;
let conditionalWrites = 0;
let uncachedReads = 0;
const blobAdapter = {
  async get(key, options) {
    assert.equal(options.access, "private"); assert.equal(options.useCache, false); uncachedReads++;
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3)));
    const row = blobMemory.get(key);
    return row ? { statusCode: 200, stream: new Response(row.text).body, blob: { etag: row.etag } } : null;
  },
  async put(key, text, options) {
    assert.equal(options.access, "private"); assert.equal(options.addRandomSuffix, false);
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 3)));
    const previous = blobMemory.get(key);
    if (options.ifMatch) { conditionalWrites++; if (previous?.etag !== options.ifMatch) throw new Error("PRECONDITION_FAILED"); }
    else if (previous && !options.allowOverwrite) throw new Error("ALREADY_EXISTS");
    blobMemory.set(key, { text, etag: String(++blobSerial) });
    return { etag: String(blobSerial) };
  },
};
function loader() {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    if (file.endsWith(`${path.sep}divisionStore.ts`)) return { readDivisions: async () => [{ slug: "retail-tambun", status: divisionActive ? "active" : "archived" }], ensureDivision: async () => {} };
    const module = { exports: {} }; cache.set(file, module);
    const require = id => {
      if (id === "server-only") return {};
      if (id === "@vercel/blob") return blobAdapter;
      if (!id.startsWith(".")) return packageRequire(id);
      const target = path.resolve(path.dirname(file), id);
      const resolved = [target, `${target}.ts`, `${target}.tsx`, `${target}.js`, `${target}.json`].find(candidate => fs.existsSync(candidate));
      if (!resolved) throw new Error(`Missing test module ${id}`);
      return resolved.endsWith(".json") ? JSON.parse(fs.readFileSync(resolved, "utf8")) : load(resolved);
    };
    const output = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
    new Function("require", "module", "exports", "__filename", "__dirname", output)(require, module, module.exports, file, path.dirname(file));
    return module.exports;
  }
  return name => load(path.join(frontend, "src/lib", `${name}.ts`));
}
try {
  process.env.CMS_DATA_DIR = directory;
  process.env.CMS_BLOB_PREFIX = "mahameru-auth-security-fixture/v1/";
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.NODE_ENV = "production";
  delete process.env.BLOB_READ_WRITE_TOKEN; delete process.env.VERCEL;
  delete process.env.ADMIN_EMAIL; delete process.env.ADMIN_PASSWORD_HASH; delete process.env.ADMIN_ACCOUNTS_JSON;
  const load = loader();
  const accounts = load("accountStore");
  const auth = load("adminAuth");
  const security = load("securityState");
  const { adminRequestOrigin } = load("adminRequestOrigin");
  const modern = await accounts.hashPassword("Fixture-password-strong-1");
  check(modern.startsWith("scrypt-v2:131072:8:1:"), "new hashes record explicit strong parameters");
  check(await accounts.passwordMatches("Fixture-password-strong-1", modern), "strong hash verifies");
  check(!await accounts.passwordMatches("wrong-password", modern), "strong hash rejects bad password");
  check(!await accounts.passwordMatches("wrong-password", "scrypt-v2:999999999:8:1:bad:bad"), "untrusted KDF parameters are never accepted");
  const salt = randomBytes(16).toString("hex");
  const legacy = `scrypt:${salt}:${scryptSync("Fixture-legacy-password-1", salt, 64).toString("hex")}`;
  check(await accounts.passwordMatches("Fixture-legacy-password-1", legacy), "legacy environment hashes verify");
  check(!await accounts.passwordMatches("wrong-password", legacy), "legacy hashes reject bad password");
  const accountId = randomUUID();
  const accountFile = path.join(directory, "accounts.json");
  const fixtureAccount = { id: accountId, name: "Fixture Admin", email: "fixture@example.test", role: "super_admin", division: null, active: true, mustChangePassword: false, sessionVersion: 0, revision: 0, passwordHash: legacy, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  fs.writeFileSync(accountFile, JSON.stringify({ initialized: true, accounts: [fixtureAccount] }));
  check(await auth.adminConfigured(), "initialized account plus strong secret is configured");
  const authenticated = await auth.checkAdminCredentials("FIXTURE@example.test", "Fixture-legacy-password-1");
  check(authenticated?.id === accountId, "credentials return bound identity/version snapshot");
  const migrated = JSON.parse(fs.readFileSync(accountFile, "utf8")).accounts[0];
  check(migrated.passwordHash.startsWith("scrypt-v2:"), "successful legacy login upgrades storage");
  check(migrated.sessionVersion === 0, "hash upgrade preserves existing account session version");
  const first = await auth.createAdminSession(authenticated);
  const second = await auth.createAdminSession(authenticated);
  check(first !== second, "independent logins have random session IDs");
  const identity = await auth.readAdminIdentity(first);
  check(identity?.id === accountId, "registered signed token authenticates");
  check(!("passwordHash" in identity) && !("sessionVersion" in identity), "identity omits hash and account session version");
  const authentication = await auth.readAdminAuthentication(second);
  check(authentication?.identity.id === accountId && authentication.sessionVersion === 0, "server authentication retains exactly the verified cookie version");
  check(!("sessionVersion" in authentication.identity), "server session metadata is separate from the public identity");
  check(await auth.verifyAdminSession(first), "normal registered session opens workspaces");
  check(!await auth.readAdminIdentity(`${first.slice(0, -1)}${first.endsWith("A") ? "B" : "A"}`), "signature tampering denied");
  check(!await auth.readAdminIdentity("a".repeat(3000)), "oversize token denied before parsing");
  const unsignedLegacy = Buffer.from(JSON.stringify({ id: accountId, version: 0, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const oldToken = `${unsignedLegacy}.${createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(unsignedLegacy).digest("base64url")}`;
  check(!await auth.readAdminIdentity(oldToken), "pre-registry token is safely invalidated on migration");
  const signedSession = patch => {
    const value = { ...JSON.parse(Buffer.from(second.split(".")[0], "base64url").toString("utf8")), ...patch };
    const payload = Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${payload}.${createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(payload).digest("base64url")}`;
  };
  check(!await auth.readAdminIdentity(signedSession({ sid: randomUUID() })), "signed but unregistered session is denied");
  check(!await auth.readAdminIdentity(signedSession({ exp: Math.floor(Date.now() / 1000) - 1 })), "expired signed session is denied");
  check(!await auth.readAdminIdentity(signedSession({ exp: Math.floor(Date.now() / 1000) + 86400 })), "cookie cannot extend registered session expiry");
  await auth.revokeAdminSession(first);
  check(!await auth.readAdminIdentity(first), "logout invalidates captured cookie at server");
  check((await auth.readAdminIdentity(second))?.id === accountId, "logout preserves other independent sessions");
  const freshAuth = loader()("adminAuth");
  check((await freshAuth.readAdminIdentity(second))?.id === accountId, "session persists across module/process-style reload");
  const saved = await accounts.changePassword(authentication.identity, { currentPassword: "Fixture-legacy-password-1", newPassword: "Fixture-new-password-strong-2" }, authentication.sessionVersion);
  check(!await auth.readAdminIdentity(second), "password change revokes all prior account-version tokens");
  await rejected(() => auth.createAdminSession(authenticated), 401, "old verification snapshot cannot issue newer-version session");
  const third = await auth.createAdminSession(saved);
  check((await auth.readAdminIdentity(third))?.id === accountId, "password-change replacement session authenticates");
  const editAccount = patch => { const state = JSON.parse(fs.readFileSync(accountFile, "utf8")); Object.assign(state.accounts[0], patch); fs.writeFileSync(accountFile, JSON.stringify(state)); };
  editAccount({ mustChangePassword: true });
  check((await auth.readAdminIdentity(third))?.mustChangePassword, "temporary-password identity is retained for onboarding");
  check(!await auth.verifyAdminSession(third), "temporary-password identity cannot open protected workspace");
  editAccount({ mustChangePassword: false, active: false });
  check(!await auth.readAdminIdentity(third), "disabled account rejects existing token");
  editAccount({ active: true, role: "division_admin", division: "retail-tambun" });
  divisionActive = false;
  check(!await auth.readAdminIdentity(third), "archived division rejects existing token");
  divisionActive = true;
  editAccount({ role: "super_admin", division: null });
  const strongSecret = process.env.ADMIN_SESSION_SECRET;
  process.env.ADMIN_SESSION_SECRET = "short";
  check(!await auth.adminConfigured(), "weak signing secret fails closed");
  check(!await auth.readAdminIdentity(third), "weak signing configuration cannot verify token");
  process.env.ADMIN_SESSION_SECRET = strongSecret;

  // An account reassignment after cookie authentication must not let a stale
  // request adopt the new session version through the change-password endpoint.
  const divisionAccount = { ...fixtureAccount, id: randomUUID(), email: "division-fixture@example.test", role: "division_admin", division: "retail-tambun" };
  const withDivisionAccount = JSON.parse(fs.readFileSync(accountFile, "utf8"));
  withDivisionAccount.accounts.push(divisionAccount);
  fs.writeFileSync(accountFile, JSON.stringify(withDivisionAccount));
  const divisionToken = await auth.createAdminSession(divisionAccount);
  const staleAuthentication = await auth.readAdminAuthentication(divisionToken);
  await accounts.saveAccount(identity, { name: divisionAccount.name, email: divisionAccount.email, division: "retail-cibitung", active: true }, divisionAccount.id, divisionAccount.revision);
  const reassigned = fs.readFileSync(accountFile, "utf8");
  await rejected(() => accounts.changePassword(staleAuthentication.identity, { currentPassword: "Fixture-legacy-password-1", newPassword: "Fixture-race-password-strong-3" }, staleAuthentication.sessionVersion), 409, "reassignment between cookie authentication and password snapshot rejects the stale request");
  check(fs.readFileSync(accountFile, "utf8") === reassigned, "rejected stale password change preserves reassignment, hash, revision, and session version");
  check(!await auth.readAdminAuthentication(divisionToken), "reassignment invalidates the old cookie authentication");
  await rejected(() => auth.createAdminSession(divisionAccount), 401, "stale reassigned account cannot receive a replacement session");

  const request = ip => new Request("http://localhost/api/admin/login", { headers: { host: "localhost", origin: "http://localhost", "x-forwarded-for": ip, "x-vercel-forwarded-for": ip } });
  const stateFile = path.join(directory, "security-state.json");
  const clearRates = () => { const state = JSON.parse(fs.readFileSync(stateFile, "utf8")); state.rates = []; fs.writeFileSync(stateFile, JSON.stringify(state)); };
  clearRates();
  const parallel = await Promise.allSettled(Array.from({ length: 16 }, () => security.consumeLoginLimit(request("203.0.113.1"), "parallel@example.test")));
  check(parallel.filter(r => r.status === "fulfilled").length === 10, "atomic concurrent account limiter admits exactly ten attempts");
  check(parallel.filter(r => r.status === "rejected" && r.reason.status === 429).length === 6, "parallel over-limit attempts return 429");
  check(parallel.find(r => r.status === "rejected").reason.retryAfter >= 890, "rate errors carry remaining Retry-After seconds");
  await rejected(() => loader()("securityState").consumeLoginLimit(request("203.0.113.2"), "parallel@example.test"), 429, "account rate persists across independent module reload");
  clearRates();
  for (let i = 0; i < 30; i++) await security.consumeLoginLimit(request(`203.0.113.${i + 1}`), `fixture-${i}@example.test`);
  await rejected(() => security.consumeLoginLimit(request("198.51.100.77"), "fixture-other@example.test"), 429, "direct deployment does not trust spoofed forwarded-IP headers");
  clearRates();
  for (let i = 0; i < 5; i++) await security.consumePasswordLimit(accountId);
  await rejected(() => security.consumePasswordLimit(accountId), 429, "password verification rate capped at five");
  for (let i = 0; i < 60; i++) await security.consumeUploadLimit(accountId);
  await rejected(() => security.consumeUploadLimit(accountId), 429, "upload rate capped at sixty");
  const expired = JSON.parse(fs.readFileSync(stateFile, "utf8")); expired.rates.forEach(r => { r.expiresAt = Date.now() - 1; }); fs.writeFileSync(stateFile, JSON.stringify(expired));
  await security.consumePasswordLimit(accountId);
  check(JSON.parse(fs.readFileSync(stateFile, "utf8")).rates.length === 1, "expired rate keys are pruned on write");
  const boundedOwner = randomUUID();
  const sessionIds = Array.from({ length: 33 }, () => randomUUID());
  for (const sid of sessionIds) await security.registerSecuritySession({ sid, accountId: boundedOwner, version: 0, expiresAt: Date.now() + 3600000 });
  check(!await security.readSecuritySession(sessionIds[0]), "oldest session revoked when account exceeds 32 active sessions");
  check(Boolean(await security.readSecuritySession(sessionIds[32])), "latest session retained at account limit");
  const persisted = fs.readFileSync(stateFile, "utf8");
  fs.writeFileSync(stateFile, "broken-json");
  await rejected(() => security.readSecuritySession(sessionIds[32]), 503, "corrupt security storage fails closed");
  fs.writeFileSync(stateFile, persisted);
  const fullRates = JSON.parse(persisted); fullRates.rates = Array.from({ length: 5000 }, (_, i) => ({ key: i.toString(16).padStart(64, "0"), count: 1, expiresAt: Date.now() + 900000 })); fs.writeFileSync(stateFile, JSON.stringify(fullRates));
  await rejected(() => security.consumePasswordLimit("new-account"), 503, "saturated rate store fails closed without evicting active limits");
  fs.writeFileSync(stateFile, persisted);

  process.env.BLOB_READ_WRITE_TOKEN = "fixture-only-token-never-sent";
  const blobOne = loader()("securityState");
  const blobTwo = loader()("securityState");
  const blobParallel = await Promise.allSettled(Array.from({ length: 16 }, (_, i) => (i % 2 ? blobOne : blobTwo).consumeLoginLimit(request("203.0.113.1"), "blob-fixture@example.test")));
  check(blobParallel.filter(r => r.status === "fulfilled").length === 10, "Blob CAS across independent instances admits exactly ten attempts");
  check(blobParallel.filter(r => r.status === "rejected" && r.reason.status === 429).length === 6, "Blob CAS preserves all concurrent rate counts");
  check(blobMemory.size === 1 && [...blobMemory.keys()][0] === "mahameru-auth-security-fixture/v1/security/state.json", "security Blob uses one bounded namespaced document without revision history");
  check(conditionalWrites > 0 && uncachedReads > 0, "Blob operations use ETag conditional writes and uncached private reads");
  const blobSession = { sid: randomUUID(), accountId, version: 1, expiresAt: Date.now() + 3600000 };
  await blobOne.registerSecuritySession(blobSession);
  check((await blobTwo.readSecuritySession(blobSession.sid))?.accountId === accountId, "private Blob session registry shared across instances");
  await blobTwo.revokeSecuritySession(blobSession.sid);
  check(!await blobOne.readSecuritySession(blobSession.sid), "private Blob revocation immediately visible across instances");
  const originalGet = blobAdapter.get;
  blobAdapter.get = async () => { throw new Error("FIXTURE_READ_OUTAGE"); };
  await rejected(() => blobOne.readSecuritySession(blobSession.sid), 503, "private Blob read outage fails closed");
  blobAdapter.get = originalGet;
  const originalPut = blobAdapter.put;
  const previousBlob = [...blobMemory.values()][0].text;
  blobAdapter.put = async () => { throw new Error("FIXTURE_WRITE_OUTAGE"); };
  await rejected(() => blobOne.registerSecuritySession({ ...blobSession, sid: randomUUID() }), 503, "private Blob write outage cannot issue session");
  check([...blobMemory.values()][0].text === previousBlob, "failed Blob write preserves registered sessions and rate limits");
  blobAdapter.put = originalPut;
  delete process.env.BLOB_READ_WRITE_TOKEN;

  const originRequest = (url, origin, host, fetchSite) => new Request(url, { headers: { origin, ...(host ? { host } : {}), ...(fetchSite ? { "sec-fetch-site": fetchSite } : {}) } });
  check(adminRequestOrigin(originRequest("http://localhost:3000/api/admin/login", "http://localhost:3000")) === "http://localhost:3000", "localhost HTTP fixture supported");
  check(adminRequestOrigin(originRequest("http://localhost:3000/api/admin/login", "http://192.168.1.2:3000", "192.168.1.2:3000")) === "http://192.168.1.2:3000", "LAN host supported behind Next internal localhost URL");
  check(!adminRequestOrigin(originRequest("https://cms.example.test/api/admin/login", "http://cms.example.test")), "public production HTTP Origin rejected");
  check(!adminRequestOrigin(originRequest("https://cms.example.test/api/admin/login", "https://other.example.test")), "different host Origin rejected");
  check(!adminRequestOrigin(originRequest("https://cms.example.test/api/admin/login", "https://cms.example.test", undefined, "same-site")), "cross-origin same-site browser submission rejected");
  check(!adminRequestOrigin(originRequest("https://cms.example.test/api/admin/login", "https://cms.example.test/path")), "non-origin URL rejected");
  check(!adminRequestOrigin(new Request("https://cms.example.test/api/admin/login", { headers: { host: "cms.example.test" } })), "missing Origin rejected for mutation");
  check(!adminRequestOrigin(new Request("https://cms.example.test/api/admin/login", { headers: { host: "cms.example.test", origin: "https://attacker.example.test", "x-forwarded-host": "attacker.example.test" } })), "untrusted forwarded host cannot authorize foreign Origin");
  check(adminRequestOrigin(originRequest("https://preview-example.vercel.app/api/admin/login", "https://preview-example.vercel.app")) === "https://preview-example.vercel.app", "Vercel alias same origin accepted");
  console.log(`Admin auth/security unit checks passed: ${checks}`);
} finally {
  for (const [name, value] of Object.entries(previous)) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
  fs.rmSync(directory, { recursive: true, force: true });
}
