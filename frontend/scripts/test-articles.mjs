// Destructive tests run only against an isolated local CMS store, never the preview site.
import assert from "node:assert/strict";

const base = process.env.ARTICLE_TEST_URL || "http://localhost:3000";
assert(["localhost", "127.0.0.1", "host.docker.internal"].includes(new URL(base).hostname), "Use an isolated local server.");
assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Set ARTICLE_TEST_ISOLATED=1 for a disposable CMS_DATA_DIR.");
const email = process.env.ARTICLE_TEST_EMAIL || "cms-test@example.test";
const password = process.env.ARTICLE_TEST_PASSWORD || "article-test-local";
for (let attempt = 0; attempt < 30; attempt++) {
  try { if ((await fetch(base + "/admin/login")).ok) break; }
  catch { /* The fixture container may still be starting. */ }
  assert(attempt < 29, "Fixture server did not start.");
  await new Promise(resolve => setTimeout(resolve, 200));
}
const login = await fetch(`${base}/api/admin/login`, { method: "POST", redirect: "manual", headers: { Origin: base }, body: new URLSearchParams({ email, password }) });
assert.equal(login.status, 303);
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert(cookie?.startsWith("mbi_admin_session="), "Test admin must be configured.");
let checks = 0;
async function request(url, { method = "GET", body, authenticated = true, origin = base, raw } = {}) {
  const response = await fetch(base + url, { method, headers: { ...(authenticated ? { Cookie: cookie } : {}), ...(method !== "GET" ? { Origin: origin, "Content-Type": "application/json" } : {}) }, ...(method !== "GET" ? { body: raw ?? JSON.stringify(body) } : {}), redirect: "manual" });
  checks++; return response;
}
async function json(url, options, status = 200) {
  const response = await request(url, options); const result = await response.json();
  assert.equal(response.status, status, JSON.stringify(result)); return result;
}
const initial = await json("/api/admin/articles");
assert(initial.length > 0, "Legacy articles are seeded in a fresh store.");
const contentBefore = await json("/api/admin/content");
assert.equal((await request("/api/admin/articles", { authenticated: false })).status, 401);
assert.equal((await request("/api/admin/articles", { authenticated: false, method: "POST", body: {} })).status, 401);
assert.equal((await request("/admin/artikel", { authenticated: false })).status, 307);
assert.equal((await request("/api/admin/articles", { method: "POST", body: {}, origin: "https://example.invalid" })).status, 403);
assert.equal((await request("/api/admin/articles/upload", { method: "POST", body: {}, origin: "https://example.invalid" })).status, 403);
assert.equal((await request("/api/admin/articles", { method: "POST", raw: "{" })).status, 400);
assert.equal((await request("/api/admin/articles", { method: "POST", raw: "x".repeat(400_001) })).status, 413);
const input = {
  title: "Pengujian CMS artikel lokal", slug: "pengujian-cms-artikel-lokal", category: "Panduan pengujian", date: "2026-10-10",
  excerpt: "Ringkasan pengujian yang hanya disimpan pada fixture lokal.", image: "/images/hero-steel-warehouse-v2.png", imageAlt: "Gudang baja", status: "draft",
  content: "## Judul bagian\n\nTeks **tebal**, *miring*, dan [tautan](https://example.com).\n\n1. Pertama\n2. Kedua\n\n| Material | Jumlah |\n| --- | --- |\n| Baja | 10 |\n\n<script>window.__articleXss=1</script>\n\n[Unsafe](javascript:alert(1))",
};
await json("/api/admin/articles", { method: "POST", body: { ...input, title: "", status: "published" } }, 400);
await json("/api/admin/articles", { method: "POST", body: { ...input, date: "2026-02-30" } }, 400);
await json("/api/admin/articles", { method: "POST", body: { ...input, image: "javascript:alert(1)" } }, 400);
let draft = await json("/api/admin/articles", { method: "POST", body: input }, 201);
assert.equal((await request(`/informasi/${draft.slug}`, { authenticated: false })).status, 404);
assert(!(await (await request("/informasi", { authenticated: false })).text()).includes(input.title));
await json("/api/admin/articles", { method: "POST", body: input }, 409);

async function upload(bytes, type = "image/png") {
  const form = new FormData(); form.append("image", new File([bytes], "fixture.png", { type }));
  checks++; return fetch(`${base}/api/admin/articles/upload`, { method: "POST", headers: { Origin: base, Cookie: cookie }, body: form });
}
assert.equal((await upload(Buffer.from("not an image"))).status, 400);
assert.equal((await upload(Buffer.alloc(4_000_001))).status, 400);
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM2sAAAAASUVORK5CYII=", "base64");
const uploaded = await upload(png); assert.equal(uploaded.status, 200);
const { url: media } = await uploaded.json();
assert.equal((await request(media, { authenticated: false })).status, 404);
assert.equal((await request(media)).status, 200);
draft = await json(`/api/admin/articles/${draft.id}`, { method: "PUT", body: { ...draft, image: media, content: `${input.content}\n\n![Contoh gambar](${media})`, status: "published" } });
const publicPage = await request(`/informasi/${draft.slug}`, { authenticated: false });
assert.equal(publicPage.status, 200);
const publicHtml = await publicPage.text();
assert(publicHtml.includes(input.title)); assert(publicHtml.includes("<table>")); assert(publicHtml.includes("<strong>tebal</strong>")); assert(publicHtml.includes("<ol>"));
assert(!publicHtml.includes("<script>window.__articleXss")); assert(!publicHtml.includes('href="javascript:'));
const mediaResponse = await request(media, { authenticated: false }); assert.equal(mediaResponse.status, 200);
assert(mediaResponse.headers.get("cache-control").includes("no-store"));
assert.deepEqual(Buffer.from(await mediaResponse.arrayBuffer()), png);
assert((await (await request("/sitemap.xml", { authenticated: false })).text()).includes(draft.slug));
await json(`/api/admin/articles/${draft.id}`, { method: "PUT", body: { ...draft, revision: 0 } }, 409);
await json(`/api/admin/articles/${draft.id}`, { method: "PUT", body: { ...draft, slug: "new-locked-slug" } }, 400);
const updates = await Promise.all(["A", "B"].map(value => request(`/api/admin/articles/${draft.id}`, { method: "PUT", body: { ...draft, excerpt: `${input.excerpt} ${value}` } })));
assert.deepEqual(updates.map(response => response.status).sort(), [200, 409]);
draft = await json(`/api/admin/articles/${draft.id}`);
draft = await json(`/api/admin/articles/${draft.id}`, { method: "PUT", body: { ...draft, status: "draft" } });
assert.equal((await request(`/informasi/${draft.slug}`, { authenticated: false })).status, 404);
assert.equal((await request(media, { authenticated: false })).status, 404);
assert(!(await (await request("/informasi", { authenticated: false })).text()).includes(input.title));
assert(!(await (await request("/sitemap.xml", { authenticated: false })).text()).includes(draft.slug));
await json(`/api/admin/articles/${draft.id}`, { method: "DELETE", body: { revision: draft.revision - 1 } }, 409);
await json(`/api/admin/articles/${draft.id}`, { method: "DELETE", body: { revision: draft.revision } });
await json(`/api/admin/articles/${draft.id}`, {}, 404);
const independent = await Promise.all(["a", "b"].map(suffix => json("/api/admin/articles", { method: "POST", body: { ...input, title: `Independent ${suffix}`, slug: `independent-article-${suffix}` } }, 201)));
const separateUpdates = await Promise.all(independent.map(article => json(`/api/admin/articles/${article.id}`, { method: "PUT", body: { ...article, excerpt: "Independent updates preserve both articles." } })));
for (const article of separateUpdates) {
  assert.equal((await json(`/api/admin/articles/${article.id}`)).excerpt, "Independent updates preserve both articles.");
  await json(`/api/admin/articles/${article.id}`, { method: "DELETE", body: { revision: article.revision } });
}
assert.deepEqual(await json("/api/admin/content"), contentBefore, "Other CMS collections must remain unchanged.");
const after = await json("/api/admin/articles");
assert.deepEqual(after, initial, "Deleting a test article preserves the original records.");
if (process.env.ARTICLE_TEST_EMPTY === "1") {
  for (const article of after) await json(`/api/admin/articles/${article.id}`, { method: "DELETE", body: { revision: article.revision } });
  assert.deepEqual(await json("/api/admin/articles"), []);
  const empty = await request("/informasi", { authenticated: false }); assert.equal(empty.status, 200);
  assert((await empty.text()).includes("Belum ada artikel terbit."));
  assert.deepEqual(await json("/api/admin/articles"), [], "An empty store must not reseed deleted articles.");
}
console.log(`Article CMS integration: ${checks} HTTP checks passed (isolated local store).`);
