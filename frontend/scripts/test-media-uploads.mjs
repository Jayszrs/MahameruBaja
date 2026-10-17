import assert from "node:assert/strict";
import sharp from 'sharp';
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { cmsVideo } from "./fixtures/cms-video.mjs";
assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Use only a disposable CMS store.");
const base = process.env.ARTICLE_TEST_URL || "http://localhost:3000";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const dataDir = process.env.CMS_MEDIA_TEST_DATA_DIR;
if(dataDir!=='/app/cms-data')assert.ok(dataDir&&path.resolve(dataDir).startsWith(path.resolve('tmp')+path.sep),'Fault injection must stay in disposable local tmp or the fixture mount');
const persistenceFile=path.join(process.env.CMS_TEST_ARTIFACTS_DIR||'/artifacts','media-persistence.json');
let checks = 0;
async function request(cookie, endpoint, options = {}) { checks++; return fetch(base + endpoint, { redirect: "manual", ...options, headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...options.headers } }); }
async function json(cookie, endpoint, method = "GET", data, status = 200) { const response = await request(cookie, endpoint, { method, ...(data ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) } : {}) }); const text = await response.text(); assert.equal(response.status, status, `${method} ${endpoint}: ${text}`); return text ? JSON.parse(text) : null; }
async function login(email, password) { const response = await request(null, "/api/admin/login", { method: "POST", body: new URLSearchParams({ email, password }) }); assert.equal(response.status, 303); const cookie = response.headers.get("set-cookie")?.split(";")[0]; assert(cookie); return cookie; }
const root = await login("cms-test@example.test", "article-test-local"), a = await login("division-a@example.test", "division-fixture-a"), b = await login("division-b@example.test", "division-fixture-b");
if (process.argv.includes("--after-restart")) {
  const saved = JSON.parse(await readFile(persistenceFile, "utf8"));
  for (const url of [saved.image, saved.video]) { assert.equal((await request(a, url)).status, 200); assert.equal((await request(b, url)).status, 404); assert.equal((await request(null, url)).status, 404); assert.equal((await request(a, url, { headers: { Range: "bytes=0-3" } })).status, 206); }
  for (const url of [saved.legacy, saved.legacyArticle]) { assert.equal((await request(b, url)).status, 200); assert.equal((await request(a, url)).status, 404); }
  const limited = await request(b, "/api/admin/media", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=none" }, body: "broken" }); assert.equal(limited.status, 429);
  console.log(`CMS media persistence: ${checks} HTTP requests passed after restart, including private ownership, legacy media, ranges and upload rate limit.`); process.exit(0);
}
const png = await sharp({ create: { width: 12, height: 7, channels: 4, background: { r: 255, g: 0, b: 20, alpha: 0.5 } } }).png().toBuffer();
const jpeg = await sharp(png).jpeg().withMetadata({ orientation: 6 }).withExifMerge({ IFD0: { Artist: "Fixture" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "1/1 2/1 3/1" } }).toBuffer();
const webp = await sharp(png).webp().toBuffer();
function form(bytes = png, mime = "image/png", kind = "image", endpoint = "/api/admin/media", owner) { const body = new FormData(); body.set(endpoint === "/api/admin/media" ? "media" : "image", new File([bytes], "fixture", { type: mime })); if (kind !== undefined) body.set("kind", kind); if (owner !== undefined) body.set("ownerDivision", owner); return body; }
async function upload(cookie, { bytes = png, mime = "image/png", kind = "image", endpoint = "/api/admin/media", owner, status = 200, headers } = {}) { const response = await request(cookie, endpoint, { method: "POST", body: form(bytes, mime, kind, endpoint, owner), headers }); const text = await response.text(); assert.equal(response.status, status, `${endpoint} upload ${mime}/${kind}: ${text}`); return text ? JSON.parse(text) : null; }
const images = [];
for (const endpoint of ["/api/admin/media", "/api/admin/articles/upload", "/api/admin/promotions/upload"]) {
  for (const [bytes, mime] of [[png, "image/png"], [jpeg, "image/jpeg"], [webp, "image/webp"]]) {
    const media = await upload(a, { bytes, mime, endpoint }); images.push(media.url);
    assert.equal(media.type, "image"); assert.equal((await request(null, media.url)).status, 404); assert.equal((await request(b, media.url)).status, 404);
    const response = await request(a, media.url); assert.equal(response.status, 200); assert.equal(response.headers.get("content-type"), mime); assert.match(response.headers.get("cache-control"), /private, no-store/); assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    const normalized = await response.arrayBuffer(), metadata = await sharp(Buffer.from(normalized)).metadata(); assert.equal(metadata.exif, undefined); assert.equal(metadata.orientation, undefined); assert.equal(metadata.width, mime === "image/jpeg" ? 7 : 12); assert.equal(metadata.hasAlpha, mime !== "image/jpeg");
    assert.equal((await request(root, media.url)).status, 200);
    const head = await request(a, media.url, { method: "HEAD" }); assert.equal(head.status, 200); assert.equal(Number(head.headers.get("content-length")), normalized.byteLength); assert.equal((await head.arrayBuffer()).byteLength, 0);
  }
}
for (const endpoint of ["/api/admin/media", "/api/admin/articles/upload", "/api/admin/promotions/upload"]) await upload(null, { endpoint, status: 401 });
const compatibleForm = form(); compatibleForm.delete("kind");
const compatible = await request(a, "/api/admin/media", { method: "POST", body: compatibleForm }); assert.equal(compatible.status, 200); assert.equal((await compatible.json()).type, "image");
await upload(a, { headers: { Origin: "https://untrusted.example" }, status: 403 });
await upload(a, { owner: "retail-cibitung", status: 403 });
for (const [bytes, mime] of [[Buffer.from("<svg onload='alert(1)'/>"), "image/svg+xml"], [Buffer.from("GIF89a"), "image/gif"], [png.subarray(0, 24), "image/png"], [png, "image/jpeg"]]) await upload(a, { bytes, mime, status: 400 });
await upload(a, { bytes: Buffer.alloc(4_000_001), status: 413 });
await upload(a, { bytes: Buffer.alloc(30_000_001), mime: "video/mp4", kind: "video", status: 413 });
await upload(a, { bytes: cmsVideo, mime: "video/mp4", status: 400 });
await upload(a, { bytes: png, kind: "video", status: 400 });
await upload(a, { kind: "unknown", status: 400 });
await upload(a, { bytes: Buffer.from([0, 0, 0, 12, ...Buffer.from("ftypisom")]), mime: "video/mp4", kind: "video", status: 400 });
await upload(a, { bytes: cmsVideo.subarray(0, cmsVideo.length - 1), mime: "video/mp4", kind: "video", status: 400 });
for (const endpoint of ["/api/admin/articles/upload", "/api/admin/promotions/upload"]) await upload(a, { endpoint, bytes: cmsVideo, mime: "video/mp4", status: 400 });
const invalidMultipart = await request(a, "/api/admin/media", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=missing" }, body: "broken" }); assert.equal(invalidMultipart.status, 400);
const wrongType = await request(a, "/api/admin/media", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); assert.equal(wrongType.status, 400);
const duplicates = form(); duplicates.append("media", new File([png], "extra.png", { type: "image/png" })); assert.equal((await request(a, "/api/admin/media", { method: "POST", body: duplicates })).status, 400);
const video = await upload(a, { bytes: cmsVideo, mime: "video/mp4", kind: "video" }); assert.equal(video.type, "video");
for (const [range, status, expected] of [["bytes=0-15", 206, cmsVideo.subarray(0, 16)], ["bytes=16-", 206, cmsVideo.subarray(16)], ["bytes=-12", 206, cmsVideo.subarray(-12)], ["bytes=1-0", 416], ["bytes=0-1,3-5", 416], ["bytes=999999-", 416]]) {
  const response = await request(a, video.url, { headers: { Range: range } }); assert.equal(response.status, status); if (expected) { assert.equal(response.headers.get("accept-ranges"), "bytes"); assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected); }
  assert.equal((await request(b, video.url, { headers: { Range: range } })).status, 404);
}
const content = () => json(root, "/api/admin/content");
async function invalidSlot(change) { const current = await content(); await json(root, "/api/admin/content", "PUT", { ...change(structuredClone(current)), _base: current }, 400); }
await invalidSlot(c => ({ ...c, contacts: c.contacts.map((row, i) => i ? row : { ...row, photo: video.url }) }));
await invalidSlot(c => ({ ...c, promotions: c.promotions.map((row, i) => i ? row : { ...row, image: video.url }) }));
await invalidSlot(c => ({ ...c, heroSlides: c.heroSlides.map((row, i) => i ? row : { ...row, type: "image", media: video.url }) }));
await invalidSlot(c => ({ ...c, heroSlides: c.heroSlides.map((row, i) => i ? row : { ...row, type: "video", media: video.url, poster: video.url }) }));
await invalidSlot(c => ({ ...c, socialPosts: c.socialPosts.map((row, i) => i ? row : { ...row, videoUrl: images[0] }) }));
await invalidSlot(c => ({ ...c, contacts: c.contacts.map((row, i) => i ? row : { ...row, photo: "/api/cms/media/11111111-1111-4111-8111-111111111111.png" }) }));
let division = (await json(root, "/api/admin/divisions"))[0]; await json(root, `/api/admin/divisions/${division.id}`, "PUT", { ...division, logo: video.url }, 400);
const input = { title: "Media ownership fixture", slug: "media-ownership-fixture", category: "Pengujian", date: "2026-10-12", excerpt: "Pengujian media terisolasi", image: images[0], imageAlt: "Fixture", content: "## Fixture\n\nMedia fixture.", status: "draft" };
let article = await json(a, "/api/admin/articles", "POST", input, 201);
await json(b, "/api/admin/articles", "POST", { ...input, slug: "media-theft" }, 403);
article = await json(a, `/api/admin/articles/${article.id}`, "PUT", { ...article, status: "published" }); assert.equal((await request(null, images[0])).status, 200);
let copy = await json(b, "/api/admin/articles", "POST", { ...input, slug: "public-media-copy" }, 201);
article = await json(a, `/api/admin/articles/${article.id}`, "PUT", { ...article, status: "draft" }); assert.equal((await request(null, images[0])).status, 404); assert.equal((await request(b, images[0])).status, 404);
await json(b, `/api/admin/articles/${copy.id}`, "PUT", { ...copy, title: "Cannot retain other owner's private image" }, 403);
let references = await json(a, "/api/admin/articles", "POST", { ...input, slug: "media-reference-fixture", image: "/images/hero-steel-warehouse-v2.png", content: `Plain mention ${images[1]}\n\n[Link](${images[1]})`, status: "published" }, 201); assert.equal((await request(null, images[1])).status, 404);
references = await json(a, `/api/admin/articles/${references.id}`, "PUT", { ...references, content: `![Picture][photo]\n\n[photo]: ${images[1]}` }); assert.equal((await request(null, images[1])).status, 200);
references = await json(a, `/api/admin/articles/${references.id}`, "PUT", { ...references, status: "draft" }); assert.equal((await request(null, images[1])).status, 404);
// Seed only the volume created specifically for this script, exercising both
// historical proxies without changing client CMS records or files.
const legacy = "/media/22222222-2222-4222-8222-222222222222.png", legacyArticle = "/api/articles/media/33333333-3333-4333-8333-333333333333.png";
for (const [directory, name] of [["media", path.basename(legacy)], ["article-media", path.basename(legacyArticle)]]) { await mkdir(path.join(dataDir, directory), { recursive: true }); await writeFile(path.join(dataDir, directory, name), png); }
let current = await content(); const legacyContact = { ...current.contacts.find(row => row.ownerDivision === "retail-cibitung"), id: "legacy-private-fixture", published: false, photo: legacy };
await json(root, "/api/admin/content", "PUT", { ...current, contacts: [...current.contacts, legacyContact], _base: current });
await json(root, "/api/admin/articles", "POST", { ...input, ownerDivision: "retail-cibitung", slug: "legacy-article-private", image: legacyArticle }, 201);
for (const url of [legacy, legacyArticle]) { assert.equal((await request(b, url)).status, 200); assert.equal((await request(a, url)).status, 404); assert.equal((await request(null, url)).status, 404); const head = await request(b, url, { method: "HEAD" }); assert.equal(head.status, 200); const range = await request(b, url, { headers: { Range: "bytes=-3" } }); assert.equal(range.status, 206); assert.deepEqual(Buffer.from(await range.arrayBuffer()), png.subarray(-3)); }
current = await json(a, "/api/admin/content"); await json(a, "/api/admin/content", "PUT", { ...current, contacts: current.contacts.map((row, i) => i ? row : { ...row, photo: legacy }), _base: current }, 403);
await json(a, "/api/admin/articles", "POST", { ...input, slug: "legacy-article-theft", image: legacyArticle }, 403);
// Failed media-index commits must remove their own unindexed bytes, while
// existing indexed uploads remain readable. No generic recursive deletion.
const filesBefore = (await readdir(path.join(dataDir, "private-media"))).sort(); const lock = path.join(dataDir, "media-index.json.lock");
await writeFile(lock, "fault fixture", { flag: "wx" });
try { await upload(root, { status: 409 }); } finally { await unlink(lock); }
assert.deepEqual((await readdir(path.join(dataDir, "private-media"))).sort(), filesBefore); assert.equal((await request(a, images[0])).status, 200);
// The limit is shared by all upload aliases. Invalid attempts also count.
let limited = false;
for (let i = 0; i < 61; i++) { const response = await request(b, i % 2 ? "/api/admin/media" : "/api/admin/articles/upload", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=none" }, body: "broken" }); if (response.status === 429) { assert(Number(response.headers.get("retry-after")) > 0); limited = true; break; } assert.equal(response.status, 400); }
assert(limited, "Persistent account upload limit must reject repeated attempts.");
await writeFile(persistenceFile, JSON.stringify({ image: images[0], video: video.url, legacy, legacyArticle }));
console.log(`CMS uploads: ${checks} HTTP requests passed across JPEG/PNG/WebP, all API aliases, ownership/publication/legacy privacy, MP4/Range/HEAD, malformed uploads, type-safe save, rollback and rate limits.`);
