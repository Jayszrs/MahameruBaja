import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { cmsVideo } from "./fixtures/cms-video.mjs";

assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Run only against a disposable CMS_DATA_DIR.");
const base = process.env.ARTICLE_TEST_URL || "http://localhost:3000";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
let checks = 0;
async function request(cookie, path, method = "GET", data) {
  checks++;
  return fetch(base + path, { method, headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
}
async function json(cookie, path, method = "GET", data, status = 200) {
  const response = await request(cookie, path, method, data), text = await response.text();
  assert.equal(response.status, status, `${method} ${path}: ${text}`);
  return text ? JSON.parse(text) : undefined;
}
async function login(email, password) {
  const response = await fetch(base + "/api/admin/login", { method: "POST", redirect: "manual", headers: { Origin: base }, body: new URLSearchParams({ email, password }) });
  checks++; assert.equal(response.status, 303); const cookie = response.headers.get("set-cookie")?.split(";")[0]; assert(cookie); return cookie;
}
const root = await login("cms-test@example.test", "article-test-local");
const actors = [
  { cookie: root, division: null },
  { cookie: await login("division-a@example.test", "division-fixture-a"), division: "retail-tambun" },
  { cookie: await login("division-b@example.test", "division-fixture-b"), division: "retail-cibitung" },
];
const content = () => json(root, "/api/admin/content");
if (process.argv.includes("--after-restart")) {
  const saved = JSON.parse(await readFile("/artifacts/crud-persistence.json", "utf8"));
  assert.deepEqual(await content(), saved.content);
  assert.deepEqual(await json(root, "/api/admin/requests"), saved.requests);
  assert.deepEqual(await json(root, "/api/admin/inventory"), saved.inventory);
  assert.equal((await request(null, saved.media)).status, 200);
  console.log("Full CMS CRUD persistence: content, inventory, invoice/archive history and uploaded media survived restart."); process.exit(0);
}
const initial = await content();
if (process.argv.includes("--empty")) {
  const empty = { ...initial, _base: initial, contacts: [], reviews: [], socialAccounts: [], socialPosts: [], promotions: [], heroSlides: [], galleryProjects: [], divisionReviews: {}, garudaReviews: { ...initial.garudaReviews, reviews: [] } };
  await json(root, "/api/admin/content", "PUT", empty);
  await json(root, "/api/admin/inventory", "PUT", { items: [], base: initial.inventory });
  for (const article of await json(root, "/api/admin/articles")) await json(root, `/api/admin/articles/${article.id}`, "DELETE", { revision: article.revision });
  for (const path of ["/", "/kontak", "/informasi", "/sosial-media", "/produk", "/proyek", "/unit/retail-tambun", "/unit/retail-cibitung", "/unit/laser-cutting", "/unit/fabrikasi-erection/galeri", "/admin", "/admin/hero", "/admin/galeri", "/admin/produk"]) assert.equal((await request(path.startsWith("/admin") ? root : null, path)).status, 200, path);
  const reloaded = await content(); for (const key of ["contacts", "reviews", "socialAccounts", "socialPosts", "promotions", "heroSlides", "galleryProjects", "inventory"]) assert.deepEqual(reloaded[key], [], `Empty ${key} must not reseed`);
  assert.deepEqual(await json(root, "/api/admin/articles"), []);
  console.log(`CMS empty states: ${checks} HTTP checks passed; public/admin routes remain available and deleted content stays empty.`); process.exit(0);
}
const runId = Date.now();
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC", "base64");
async function upload(cookie) {
  const form = new FormData(); form.set("media", new File([png], "crud.png", { type: "image/png" })); checks++;
  const response = await fetch(base + "/api/admin/media", { method: "POST", headers: { Origin: base, Cookie: cookie }, body: form });
  assert.equal(response.status, 200, await response.clone().text()); return (await response.json()).url;
}
async function change(actor, key, update, before) {
  const current = before || await json(actor.cookie, "/api/admin/content");
  return json(actor.cookie, "/api/admin/content", "PUT", { ...current, [key]: update(structuredClone(current[key])), _base: current });
}
const keys = ["contacts", "socialAccounts", "socialPosts", "heroSlides", "promotions", "galleryProjects"];
for (const actor of actors) {
  for (const key of keys) {
    const before = await content(), id = `crud-${key}-${actor.division || "central"}-${runId}`;
    const image = key === "socialAccounts" ? null : await upload(actor.cookie);
    const row = { ...structuredClone(initial[key][0]), id, ownerDivision: actor.division, audience: actor.division ? [actor.division] : undefined, published: false };
    if ("division" in row) row.division = actor.division || "retail-tambun";
    if ("divisions" in row) row.divisions = actor.division ? [actor.division] : [];
    if (key === "contacts") Object.assign(row, { name: id, photo: image });
    if (key === "socialAccounts") Object.assign(row, { platform: "instagram", handle: "@" + id, url: "https://www.instagram.com/mahamerubajaindonesia/" });
    if (key === "socialPosts") Object.assign(row, { title: id, image, url: "https://www.instagram.com/p/CMSCrudFixture/", videoUrl: "" });
    if (key === "heroSlides") Object.assign(row, { title: id, type: "image", media: image });
    if (key === "promotions") Object.assign(row, { title: id, image, imageAlt: id, benefit: "Konsultasi", appliesTo: "Material", terms: "Konfirmasi admin", startDate: "", endDate: "" });
    if (key === "galleryProjects") Object.assign(row, { title: id, photos: [{ id: id + "-photo", src: image, alt: id, caption: "Foto fixture" }], coverId: id + "-photo" });
    let saved = await change(actor, key, rows => [...rows, row]);
    assert(saved[key].some(r => r.id === id));
    assert((await json(actor.cookie, "/api/admin/content"))[key].some(r => r.id === id));
    if (actor.division) assert(!(await json(actors.find(a => a.division && a.division !== actor.division).cookie, "/api/admin/content"))[key].some(r => r.id === id));
    if (image) assert.equal((await request(null, image)).status, 404, `${key} draft media must be private`);
    saved = await change(actor, key, rows => rows.map(r => r.id === id ? { ...r, published: true } : r));
    assert.equal(saved[key].find(r => r.id === id).published, true);
    if (image) assert.equal((await request(null, image)).status, 200, `${key} published media must be public`);
    else assert((await (await request(null, "/sosial-media")).text()).includes(id), "Published social account visible publicly");
    const stale = structuredClone(saved);
    saved = await change(actor, key, rows => rows.map(r => r.id === id ? { ...r, ...(key === "contacts" ? { role: "Tim fixture disunting" } : key === "socialAccounts" ? { handle: "@edited-" + id } : { title: "Edited " + id }) } : r));
    const edited = saved[key].find(r => r.id === id);
    assert.match(key === "contacts" ? edited.role : key === "socialAccounts" ? edited.handle : edited.title, /fixture disunting|edited-|Edited/);
    await json(actor.cookie, "/api/admin/content", "PUT", { ...stale, [key]: stale[key].map(r => r.id === id ? { ...r, published: false } : r), _base: stale }, 409);
    await change(actor, key, rows => rows.map(r => r.id === id ? { ...r, published: false } : r));
    if (image) assert.equal((await request(null, image)).status, 404, `${key} unpublish revokes public media`);
    saved = await change(actor, key, rows => rows.filter(r => r.id !== id));
    assert(!saved[key].some(r => r.id === id)); assert(!(await content())[key].some(r => r.id === id));
    const after = await content();
    for (const other of keys) assert.deepEqual(after[other], before[other], `CRUD ${key} leaves ${other} baseline unchanged`);
  }
}
// A real H.264 upload follows the same draft and ownership permissions as images.
const videoActor = actors[1], videoForm = new FormData();
videoForm.set("media", new File([cmsVideo], "fixture.mp4", { type: "video/mp4" })); checks++;
const uploadedVideo = await fetch(base + "/api/admin/media", { method: "POST", headers: { Origin: base, Cookie: videoActor.cookie }, body: videoForm });
assert.equal(uploadedVideo.status, 200); const video = await uploadedVideo.json(); assert.equal(video.type, "video");
const videoPost = { ...initial.socialPosts[0], id: "crud-video", ownerDivision: videoActor.division, division: videoActor.division, published: false, videoUrl: video.url };
await change(videoActor, "socialPosts", rows => [...rows, videoPost]);
assert.equal((await request(null, video.url)).status, 404); assert.equal((await request(actors[2].cookie, video.url)).status, 404);
const privateVideo = await request(videoActor.cookie, video.url); assert.equal(privateVideo.headers.get("content-type"), "video/mp4"); assert.deepEqual(Buffer.from(await privateVideo.arrayBuffer()), cmsVideo);
await change(videoActor, "socialPosts", rows => rows.map(r => r.id === videoPost.id ? { ...r, published: true } : r)); assert.equal((await request(null, video.url)).status, 200);
await change(videoActor, "socialPosts", rows => rows.map(r => r.id === videoPost.id ? { ...r, published: false } : r)); assert.equal((await request(null, video.url)).status, 404);
await change(videoActor, "socialPosts", rows => rows.filter(r => r.id !== videoPost.id));

// Central, Garuda and an independent division review profile each support CRUD.
const divisions = await json(root, "/api/admin/divisions");
const tambun = divisions.find(d => d.slug === "retail-tambun");
const changedDivision = await json(root, `/api/admin/divisions/${tambun.id}`, "PUT", { ...tambun, useCentralReviews: false });
for (const actor of actors) {
  const key = !actor.division ? "reviews" : actor.division === "retail-cibitung" ? "garudaReviews" : "divisionReviews";
  const id = "crud-review-" + (actor.division || "central");
  const review = { id, ownerDivision: actor.division, author: id, rating: 5, text: "Ulasan asli fixture", when: "2026-10-11", url: "https://maps.google.com/", published: false };
  const profile = { rating: 5, reviewCount: 1, ratingDate: "2026-10-11", mapsUrl: "https://maps.google.com/", reviews: [] };
  function update(value, operation) {
    if (key === "reviews") return operation(value);
    if (key === "garudaReviews") return { ...value, reviews: operation(value.reviews) };
    const current = value[actor.division] || profile; return { ...value, [actor.division]: { ...current, reviews: operation(current.reviews) } };
  }
  const extract = data => key === "reviews" ? data.reviews : key === "garudaReviews" ? data.garudaReviews.reviews : data.divisionReviews[actor.division].reviews;
  let saved = await change(actor, key, v => update(v, rows => [...rows, review])); assert(extract(saved).some(r => r.id === id));
  const path = actor.division ? `/unit/${actor.division}` : "/";
  assert(!(await (await request(null, path)).text()).includes(id));
  saved = await change(actor, key, v => update(v, rows => rows.map(r => r.id === id ? { ...r, published: true } : r)));
  assert((await (await request(null, path)).text()).includes(id), `Published ${key} visible`);
  saved = await change(actor, key, v => update(v, rows => rows.map(r => r.id === id ? { ...r, text: "Ulasan fixture disunting" } : r)));
  assert.equal(extract(saved).find(r => r.id === id).text, "Ulasan fixture disunting");
  await change(actor, key, v => update(v, rows => rows.map(r => r.id === id ? { ...r, published: false } : r)));
  assert(!(await (await request(null, path)).text()).includes(id));
  saved = await change(actor, key, v => update(v, rows => rows.filter(r => r.id !== id))); assert(!extract(saved).some(r => r.id === id));
}
await json(root, `/api/admin/divisions/${tambun.id}`, "PUT", { ...changedDivision, useCentralReviews: tambun.useCentralReviews });

// The fixed master catalogue is unchanged; rows below belong to a division.
const originalStock = await json(root, "/api/admin/inventory");
const productId = originalStock.items[0].productId;
for (const actor of actors) {
  const division = actor.division || "laser-cutting";
  let before = (await json(actor.cookie, "/api/admin/inventory")).items;
  const original = before.find(r => r.productId === productId && r.division === division);
  if (original) { const result = await json(actor.cookie, "/api/admin/inventory", "PUT", { items: before.filter(r => r !== original), base: before }); before = result.items; }
  const row = { productId, division, listed: false, status: "unconfirmed", quantity: null, unit: "batang", verifiedAt: "", note: "crud-stock-fixture" };
  let saved = (await json(actor.cookie, "/api/admin/inventory", "PUT", { items: [...before, row], base: before })).items;
  assert(saved.some(r => r.note === row.note));
  const stale = structuredClone(saved);
  saved = (await json(actor.cookie, "/api/admin/inventory", "PUT", { items: saved.map(r => r.productId === productId && r.division === division ? { ...r, status: "available", quantity: 17, verifiedAt: new Date().toISOString(), listed: true } : r), base: saved })).items;
  assert.equal(saved.find(r => r.productId === productId && r.division === division).quantity, 17);
  await json(actor.cookie, "/api/admin/inventory", "PUT", { items: stale.map(r => r.productId === productId && r.division === division ? { ...r, note: "stale" } : r), base: stale }, 409);
  const current = await content(); const publicPage = await (await request(null, `/produk?unit=${division}`)).text(); assert(publicPage.includes("crud-stock-fixture"));
  await json(actor.cookie, "/api/admin/inventory", "PUT", { items: saved.filter(r => !(r.productId === productId && r.division === division)), base: saved });
  assert(!(await json(actor.cookie, "/api/admin/inventory")).items.some(r => r.productId === productId && r.division === division));
  if (original) { const latest = (await json(actor.cookie, "/api/admin/inventory")).items; await json(actor.cookie, "/api/admin/inventory", "PUT", { items: [...latest, original], base: latest }); }
  assert.deepEqual((await content()).contacts, current.contacts);
}

for (const actor of actors) {
  const division = actor.division || "laser-cutting";
  const input = { kind: "QUOTATION", businessUnitSlug: division, name: "CRUD pelanggan fixture", whatsapp: "081234567890", consent: true, items: [] };
  let record = await json(actor.cookie, "/api/admin/requests", "POST", input, 201);
  assert((await json(actor.cookie, "/api/admin/requests")).some(r => r.id === record.id));
  const oldRevision = record.revision;
  record = await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "PATCH", { revision: record.revision, input: { ...input, name: "CRUD pelanggan disunting" }, status: "Review kebutuhan", notes: "Catatan fixture" });
  assert.equal(record.name, "CRUD pelanggan disunting");
  await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "PATCH", { revision: oldRevision, notes: "Stale" }, 409);
  const invoice = { number: "CRUD-FIXTURE", issuedAt: "2026-10-11", dueAt: "", notes: "Catatan invoice", lines: [{ description: "Material fixture", quantity: 2, unit: "batang", price: 12345 }] };
  record = await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "PATCH", { revision: record.revision, invoice }); assert.deepEqual(record.invoice.lines, invoice.lines);
  record = await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "PATCH", { revision: record.revision, invoice: { ...invoice, lines: [{ ...invoice.lines[0], price: 23456 }] } }); assert.equal(record.invoice.lines[0].price, 23456);
  record = await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "DELETE", { revision: record.revision }); assert.equal(record.archived, true); assert.equal(record.invoice.number, invoice.number);
  record = await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "PATCH", { revision: record.revision, archived: false }); assert.equal(record.archived, false);
  await json(actor.cookie, `/api/admin/requests?id=${record.id}`, "DELETE", { revision: record.revision });
}
// Save a real published upload and all stores for the restart phase.
const media = await upload(root);
await change(actors[0], "contacts", rows => [...rows.filter(row => row.id !== "crud-persistence"), { ...initial.contacts[0], id: "crud-persistence", ownerDivision: null, name: "CRUD persistence fixture", photo: media, published: true }]);
await writeFile("/artifacts/crud-persistence.json", JSON.stringify({ content: await content(), requests: await json(root, "/api/admin/requests"), inventory: await json(root, "/api/admin/inventory"), media }));
console.log(`Full CMS CRUD: ${checks} HTTP checks passed for Super Admin, division A/B, publishing, private media, conflicts, invoice and archive/restore.`);
