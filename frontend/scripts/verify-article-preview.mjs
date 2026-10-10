// Explicit preview smoke check. Supply credentials through environment variables, never source files.
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const base = "https://mahameru-baja-preview.vercel.app";
assert(process.env.ARTICLE_PREVIEW_EMAIL && process.env.ARTICLE_PREVIEW_PASSWORD, "Provide preview credentials through environment variables.");
const login = await fetch(base + "/api/admin/login", { method: "POST", redirect: "manual", headers: { Origin: base }, body: new URLSearchParams({ email: process.env.ARTICLE_PREVIEW_EMAIL, password: process.env.ARTICLE_PREVIEW_PASSWORD }) });
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert(cookie?.startsWith("mbi_admin_session="), `Preview login failed (${login.status}).`);
const headers = { Cookie: cookie };
const hash = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function data(url) { const response = await fetch(base + url, { headers }); assert.equal(response.status, 200, url); return response.json(); }
const contentBefore = await data("/api/admin/content");
const requestsBefore = await data("/api/admin/requests");
const baseline = { content: hash(contentBefore), requests: hash(requestsBefore) };
if (process.env.ARTICLE_PREVIEW_BASELINE === "1") {
  await writeFile("/artifacts/preview-baseline.json", JSON.stringify(baseline));
  console.log("Preview baseline recorded; existing CMS collections were read without changes.");
  process.exit(0);
}
const previousBaseline = JSON.parse(await readFile("/artifacts/preview-baseline.json", "utf8"));
assert.deepEqual(baseline, previousBaseline, "Deployment must preserve existing CMS collections.");
const initial = await data("/api/admin/articles");
assert.equal((await fetch(base + "/admin/artikel", { headers })).status, 200);
assert.equal((await fetch(base + "/api/admin/articles")).status, 401);
assert.equal((await fetch(base + "/informasi")).status, 200);
let record;
const input = { title: "Pengujian draf CMS", slug: `pengujian-draf-${randomUUID()}`, category: "Pengujian", date: "2026-10-10", excerpt: "Draf verifikasi penyimpanan; tidak diterbitkan ke website.", image: "/images/hero-steel-warehouse-v2.png", imageAlt: "Gudang baja", content: "## Pengujian\n\nDraf ini memeriksa penyimpanan CMS artikel.", status: "draft" };
async function mutate(url, method, value) {
  const response = await fetch(base + url, { method, headers: { ...headers, Origin: base, "Content-Type": "application/json" }, body: JSON.stringify(value) });
  const valueOut = await response.json(); assert(response.ok, JSON.stringify(valueOut)); return valueOut;
}
try {
  record = await mutate("/api/admin/articles", "POST", input);
  assert.equal((await fetch(base + "/informasi/" + record.slug)).status, 404);
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM2sAAAAASUVORK5CYII=", "base64");
  const form = new FormData(); form.append("image", new File([png], "preview-check.png", { type: "image/png" }));
  const upload = await fetch(base + "/api/admin/articles/upload", { method: "POST", headers: { ...headers, Origin: base }, body: form });
  const media = await upload.json(); assert.equal(upload.status, 200, JSON.stringify(media));
  assert.equal((await fetch(base + media.url)).status, 404);
  const privateMedia = await fetch(base + media.url, { headers }); assert.equal(privateMedia.status, 200);
  assert.deepEqual(Buffer.from(await privateMedia.arrayBuffer()), png);
  record = await mutate(`/api/admin/articles/${record.id}`, "PUT", { ...record, image: media.url, excerpt: "Draf berhasil diperbarui melalui private Blob." });
  assert.equal((await data(`/api/admin/articles/${record.id}`)).revision, record.revision);
  console.log(`Preview CMS verified: ${initial.length} existing articles; draft save/read/update and private image upload succeeded.`);
} finally {
  if (record) {
    const latest = await data(`/api/admin/articles/${record.id}`);
    await mutate(`/api/admin/articles/${record.id}`, "DELETE", { revision: latest.revision });
  }
}
assert.deepEqual(await data("/api/admin/articles"), initial, "Only the verification draft should be removed.");
assert.equal(hash(await data("/api/admin/content")), baseline.content);
assert.equal(hash(await data("/api/admin/requests")), baseline.requests);
console.log("Verification draft removed; original articles and other CMS collections preserved.");
