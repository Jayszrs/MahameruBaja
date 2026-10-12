import assert from "node:assert/strict";
import http from "node:http";
import { readFile, writeFile } from "node:fs/promises";

assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1");
const base = "http://localhost:3000", peer = "http://localhost:3001";
let checks = 0;
async function expect(response, status, label) { checks++; assert.equal(response.status, status, `${label}: ${await response.clone().text()}`); return response; }
async function login(email = "cms-test@example.test", password = "article-test-local", origin = base) {
  return fetch(origin + "/api/admin/login", { method: "POST", headers: { Origin: origin }, body: new URLSearchParams({ email, password }), redirect: "manual" });
}
if (process.argv.includes("--after-restart")) {
  const saved = JSON.parse(await readFile("/artifacts/security-persistence.json", "utf8"));
  await expect(await fetch(base + "/api/admin/content", { headers: { Cookie: saved.cookie } }), 401, "Revocation survives restart");
  await expect(await fetch(base + "/api/admin/content", { headers: { Cookie: saved.cookie2 } }), 200, "Other session survives restart");
  await expect(await login("limit-test@example.test", "incorrect-password"), 429, "Login rate survives restart");
  await expect(await fetch(base + "/api/admin/change-password", { method: "POST", headers: { Cookie: saved.cookie2, Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: "wrong", newPassword: "new-password-testing-2026" }) }), 429, "Password rate survives restart");
  console.log("CMS security restart: revocation, active session and both rate limits persisted.");
  process.exit(0);
}
const first = await expect(await login(), 303, "Login");
const cookie = first.headers.get("set-cookie")?.split(";")[0]; assert(cookie);
for (const flag of ["HttpOnly", "SameSite=lax", "Secure"]) { assert(first.headers.get("set-cookie").includes(flag)); checks++; }
const second = await expect(await login(), 303, "Second device login");
const cookie2 = second.headers.get("set-cookie")?.split(";")[0]; assert(cookie2);
const get = (url, credential = cookie) => fetch(base + url, { headers: credential ? { Cookie: credential } : {}, redirect: "manual" });
await expect(await get("/api/admin/accounts", null), 401, "No login");
await expect(await get("/api/admin/accounts"), 200, "Authenticated API");
const accounts = await (await get("/api/admin/accounts")).json();
assert(accounts.every(a => !("passwordHash" in a) && !("sessionVersion" in a))); checks++;

const page = await get("/admin"); await expect(page, 200, "Admin dashboard");
const csp = page.headers.get("content-security-policy");
assert(csp?.includes("frame-ancestors 'none'") && csp.includes("object-src 'none'")); checks++;
const nonce = /'nonce-([^']+)'/.exec(csp)?.[1]; assert(nonce); checks++;
const html = await page.text();
assert(html.includes(`nonce="${nonce}"`), "Framework scripts receive the CSP nonce"); checks++;
const page2 = await get("/admin"); assert(!page2.headers.get("content-security-policy").includes(`'nonce-${nonce}'`)); checks++;

const write = (path, body, type = "application/json", origin = base) => fetch(base + path, { method: "PUT", headers: { Origin: origin, Cookie: cookie, "Content-Type": type }, body, redirect: "manual" });
await expect(await write("/api/admin/content", "{}", "application/json", "https://example.invalid"), 403, "CSRF origin");
await expect(await write("/api/admin/content", "{}", "text/plain"), 400, "JSON content type");
await expect(await write("/api/admin/content", "null"), 400, "Object payload");
await expect(await write("/api/admin/inventory", "x".repeat(300001)), 413, "Inventory byte limit");
await expect(await write("/api/admin/content", "{"), 400, "Malformed JSON");
await expect(await fetch(base + "/api/admin/login", { method: "POST", headers: { Origin: base, "Content-Type": "multipart/form-data; boundary=abc" }, body: "broken", redirect: "manual" }), 400, "Malformed login multipart");
await expect(await fetch(base + "/api/admin/login", { method: "POST", headers: { Origin: base, "Content-Type": "application/x-www-form-urlencoded" }, body: "a=" + "x".repeat(4096), redirect: "manual" }), 413, "Login byte limit");

async function chunked(path, method, size) {
  return new Promise((resolve, reject) => {
    const request = http.request(base + path, { method, headers: { Origin: base, Cookie: cookie, "Content-Type": "application/json", "Transfer-Encoding": "chunked" } }, response => { response.resume(); response.on("end", () => resolve(response.statusCode)); });
    request.on("error", reject); for (let n = 0; n < size; n += 10000) request.write("x".repeat(Math.min(size - n, 10000))); request.end();
  });
  }
assert.equal(await chunked("/api/admin/inventory", "PUT", 300001), 413); checks++;
assert.equal(await chunked("/api/admin/requests", "POST", 100001), 413); checks++;
assert.equal(await chunked("/api/requests", "POST", 100001), 413); checks++;

await expect(await fetch(base + "/api/admin/logout", { method: "POST", headers: { Origin: base, Cookie: cookie }, redirect: "manual" }), 303, "Logout");
await expect(await get("/api/admin/content"), 401, "Replay revoked cookie");
await expect(await get("/api/admin/content", cookie2), 200, "Other device retained");
await expect(await fetch(peer + "/api/admin/content", { headers: { Cookie: cookie } }), 401, "Revocation across instance");

const limited = await Promise.all(Array.from({ length: 12 }, () => login("limit-test@example.test", "incorrect-password")));
assert.equal(limited.filter(r => r.status === 303).length, 10); checks++;
assert.equal(limited.filter(r => r.status === 429).length, 2); checks++;
for (const response of limited.filter(r => r.status === 429)) { assert(Number(response.headers.get("retry-after")) > 0); checks++; }
await expect(await login("limit-test@example.test", "incorrect-password", peer), 429, "Rate limit across instance");
for (let n = 0; n < 5; n++) await expect(await fetch(base + "/api/admin/change-password", { method: "POST", headers: { Cookie: cookie2, Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: "wrong", newPassword: "new-password-testing-2026" }) }), 400, "Wrong old password");
const passwordRate = await expect(await fetch(base + "/api/admin/change-password", { method: "POST", headers: { Cookie: cookie2, Origin: base, "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: "wrong", newPassword: "new-password-testing-2026" }) }), 429, "Password limit");
assert(Number(passwordRate.headers.get("retry-after")) > 0); checks++;
await writeFile("/artifacts/security-persistence.json", JSON.stringify({ cookie, cookie2 }), { mode: 0o600 });
console.log(`CMS security HTTP: ${checks} checks passed (sessions, two instances, nonce CSP, bodies, CSRF and throttling).`);
