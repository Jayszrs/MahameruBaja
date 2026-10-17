// Uses a new temporary CMS directory and synthetic photos, never production data.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const frontend = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.dirname(frontend);
await mkdir(path.join(root, "tmp"), { recursive: true });
const directory = await mkdtemp(path.join(root, "tmp", "client-revision-qa-"));
const origin = "http://localhost:3164";
const password = randomBytes(18).toString("hex"), salt = randomBytes(16).toString("hex");
const hash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
const server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "-p", "3164"], {
  cwd: frontend, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, CMS_DATA_DIR: directory, VERCEL: "", BLOB_READ_WRITE_TOKEN: "", ADMIN_EMAIL: "qa.owner@example.test", ADMIN_PASSWORD_HASH: hash, ADMIN_SESSION_SECRET: randomBytes(32).toString("hex"),
    ADMIN_ACCOUNTS_JSON: JSON.stringify(["retail-tambun", "retail-cibitung"].map(division => ({ email: `qa.${division}@example.test`, division, passwordHash: hash }))) },
});
let logs = "";
server.stdout.on("data", bytes => logs += bytes); server.stderr.on("data", bytes => logs += bytes);
const headers = { Origin: origin };
const input = { kind: "QUOTATION", businessUnitSlug: "retail-tambun", name: "QA Upload", whatsapp: "081234567890", consent: true, items: [{ productName: "Plat", quantity: 2, unit: "Lembar" }] };
const picture = await sharp({ create: { width: 100, height: 80, channels: 3, background: "#d92323" } }).jpeg().toBuffer();
async function send(files, value = input, key) {
  const body = new FormData(); body.set("input", JSON.stringify(value));
  for (const file of files) body.append("photos", file);
  return fetch(`${origin}/api/requests`, { method: "POST", headers: { ...headers, ...(key ? { "idempotency-key": key } : {}) }, body });
}
const photo = () => new File([picture], "foto-kebutuhan.jpg", { type: "image/jpeg" });
async function login(email) {
  const response = await fetch(`${origin}/api/admin/login`, { method: "POST", redirect: "manual", headers, body: new URLSearchParams({ email, password }) });
  assert.equal(response.status, 303);
  return response.headers.get("set-cookie").split(";")[0];
}
async function records(cookie) { const response = await fetch(`${origin}/api/admin/requests`, { headers: { Cookie: cookie } }); assert.equal(response.status, 200); return response.json(); }
try {
  let ready = false;
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${origin}/admin/login`)).status === 200) { ready = true; break; } } catch {} await new Promise(resolve => setTimeout(resolve, 250)); }
  assert.ok(ready, "Isolated production server did not start");
  const owner = await login("qa.owner@example.test"), tambun = await login("qa.retail-tambun@example.test"), cibitung = await login("qa.retail-cibitung@example.test");
  const response = await send([photo(), photo(), photo()], input, "qa-photo-replay-key");
  assert.equal(response.status, 201, await response.clone().text());
  const saved = (await response.json()).data;
  assert.equal(saved.photoCount, 3); assert.ok(!JSON.stringify(saved).includes("filename"), "Public response does not disclose private attachment URLs");
  const record = (await records(owner)).find(record => record.id === saved.id);
  assert.equal(record.photos.length, 3);
  const filename = record.photos[0].filename;
  const url = `${origin}/api/admin/requests/${record.id}/photos/${filename}`;
  assert.equal((await fetch(url)).status, 401);
  assert.equal((await fetch(url, { headers: { Cookie: cibitung } })).status, 404);
  for (const cookie of [owner, tambun]) {
    const image = await fetch(url, { headers: { Cookie: cookie } });
    assert.equal(image.status, 200); assert.equal(image.headers.get("content-type"), "image/webp"); assert.ok(image.headers.get("cache-control").includes("no-store"));
    const metadata = await sharp(Buffer.from(await image.arrayBuffer())).metadata();
    assert.equal(metadata.format, "webp"); assert.equal(metadata.exif, undefined);
  }
  assert.equal((await fetch(url, { headers: { Cookie: tambun, Range: "bytes=0-15" } })).status, 206);
  assert.equal((await fetch(`${origin}/api/admin/requests/${record.id}/photos/00000000-0000-0000-0000-000000000000.webp`, { headers: { Cookie: owner } })).status, 404);
  const adminPage = await fetch(`${origin}/admin/permintaan`, { headers: { Cookie: tambun } });
  assert.equal(adminPage.status, 200);
  assert.ok((await adminPage.text()).includes(`/api/admin/requests/${record.id}/photos/${filename}`), "Admin detail renders saved photos");
  console.log("PASS: three photos persist, re-encode to WebP, strip metadata; owner/division access, anonymous/cross-division denial, range and unknown-file checks");

  const replay = await send([photo(), photo(), photo()], input, "qa-photo-replay-key");
  assert.equal(replay.status, 201); assert.equal((await replay.json()).data.id, record.id);
  assert.equal((await records(owner)).length, 1); assert.equal((await readdir(path.join(directory, "request-photos"))).length, 3);
  const edit = await fetch(`${origin}/api/admin/requests?id=${record.id}`, { method: "PATCH", headers: { ...headers, Cookie: tambun, "Content-Type": "application/json" }, body: JSON.stringify({ revision: record.revision, notes: "QA review" }) });
  assert.equal(edit.status, 200); assert.equal((await edit.json()).photos.length, 3);
  assert.equal((await send([photo(), photo(), photo(), photo()])).status, 413);
  assert.equal((await send([new File(["<svg/>"], "bad.jpg", { type: "image/jpeg" })])).status, 400);
  assert.equal((await send([photo()], { ...input, consent: false })).status, 422);
  assert.equal((await send([photo()], { ...input, businessUnitSlug: "nonexistent" })).status, 400);
  assert.equal((await send([new File([new Uint8Array(3_000_001)], "large.jpg", { type: "image/jpeg" })])).status, 413);
  const jsonResponse = await fetch(`${origin}/api/requests`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(input) });
  assert.equal(jsonResponse.status, 201); assert.equal((await jsonResponse.json()).data.photoCount, 0);
  assert.equal((await records(owner)).length, 2); assert.equal((await readdir(path.join(directory, "request-photos"))).length, 3);
  console.log("PASS: retry deduplication, edit preservation, limits, bad bytes, consent, unknown division, original JSON flow; no orphan files after validation failures");

  const home = await (await fetch(origin)).text();
  assert.ok(!home.includes(filename), "Public homepage never receives customer photo references");
  assert.ok(home.includes("company-logo.jpeg"));
  assert.ok(home.includes("MBI LASER CUTTING") && home.includes("MAHAMERU BAJA INDONESIA"));
  assert.ok(!home.includes('class="hero-slide-dots"') && !home.includes('class="hero-carousel-pause"') && !home.includes('class="promo-motion-toggle"'));
  assert.ok(home.includes('class="carousel-keyboard-control"') && home.includes('data-corporate-logo="mbi"'));
  const sheetHref = home.match(/<image[^>]*href="([^"]*client-corporate-trio[^\"]*)"/)?.[1]?.replaceAll("&amp;", "&");
  assert.ok(sheetHref, "New inline logo frames reference the optimized client-supplied sheet");
  const optimizedSheet = await fetch(`${origin}${sheetHref}`);
  assert.equal(optimizedSheet.status, 200, "Logo optimizer delivers the original supplied artwork");
  assert.ok((await sharp(Buffer.from(await optimizedSheet.arrayBuffer())).metadata()).width > 1000);
  assert.ok(!home.includes('class="division-collage-brand"'));
  assert.ok(home.indexOf('class="company-footer-motto') >= 0 && home.indexOf('class="company-footer-motto') < home.indexOf('class="company-footer-wordmark"'));
  const assertCallout=html=>{
    const callout=html.match(/<section class="home-final"[^>]*>[\s\S]*?<\/section>/)?.[0]||'';
    assert.ok(callout.includes('class="home-final-photo" aria-hidden="true"')&&callout.includes('toko-mahameru.jpg'),'Callout retains an actual decorative shop photo');
    assert.ok(callout.includes('callout-company-logo')&&callout.includes('feColorMatrix')&&!callout.includes('main-company-logo'),'Callout uses opt-in transparent original logo, no white plate');
  };
  assertCallout(home);
  const articleIndex=await (await fetch(`${origin}/informasi`)).text();
  const articleHref=articleIndex.match(/href="(\/informasi\/[^"?#]+)"/)?.[1];assert.ok(articleHref);
  for(const route of ['/informasi',articleHref,...['retail-tambun','retail-cibitung','trading-proyek','laser-cutting','fabrikasi-erection'].map(slug=>`/unit/${slug}`)]){
    const response=await fetch(origin+route);assert.equal(response.status,200);
    const html=await response.text(),footer=html.match(/<footer class="company-footer">[\s\S]*?<\/footer>/)?.[0]||'';
    assert.ok(footer.includes('class="company-footer-photo" aria-hidden="true"')&&footer.includes('toko-mahameru.jpg'),'Shared shop photo renders on article and division footers');
    assert.ok(footer.includes(route.startsWith('/unit/')?'footer-company-logo':'footer-division-logo')&&footer.includes('feColorMatrix')&&!footer.includes('main-company-logo'),'Main footer shows each division without white plates; own-division footer preserves its identity');
    assert.ok(footer.includes('aria-label="Navigasi perusahaan"')&&footer.includes('href="/kebijakan-privasi"'),'Existing navigation remains present');
    assert.ok(footer.includes('MATERIAL, CUTTING &amp; PROYEK')&&footer.includes('Dari trading material, cutting, bending, fabrikasi sampai erection.'),'Shared footer represents material, cutting and projects with the group motto');
    if(route===articleHref){
      assert.ok(html.includes('class="article-editorial-visual"')&&html.includes('class="article-editorial-shade"'),'Article detail renders a full-width static photo hero with readable heading');
      const heading=html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)?.[0]||'';
      assert(!heading.includes('CNC'),'Visible article heading uses Laser Cutting & Bending');
      assert(!html.includes('class="article-cover"'),'Old narrow framed hero is removed');
    }
    if(route.startsWith('/unit/'))assertCallout(html);
  }
  console.log('PASS: shared photo and transparent logo SSR on article listing/detail and all five division footers, existing footer links retained');
  const form = await (await fetch(`${origin}/minta-penawaran`)).text();
  assert.ok(form.includes('id="request-photos"') && form.includes('id="catatan"'));
  const about = await (await fetch(`${origin}/tentang-kami`)).text(); assert.ok(!about.includes('class="division-collage-brand"'));
  assert.ok(about.includes('data-corporate-logo="mmn"') && about.includes('data-corporate-logo="gmb"') && about.includes('data-corporate-logo="mbi"'));
  const product = await (await fetch(`${origin}/produk/besi-beton-polos-10mm`)).text();
  const suppliers = product.match(/<ol class="inventory-suppliers">[\s\S]*?<\/ol>/)?.[0] || "";
  assert.ok(suppliers.includes("Mahameru Baja Retail Tambun"));
  assert.ok(!suppliers.includes("Garuda Marginal Baja Retail Cibitung") && !suppliers.includes("MBI Trading") && !suppliers.includes("<img"), "Only the actual listed supplier is rendered, without logo clutter");
  const schema = JSON.parse(await readFile(path.join(directory, "requests.json"), "utf8")); assert.ok(schema.every(record => record.photos.length <= 3));
  console.log("PASS: main brand, collage overlay removal, footer motto order, upload and notes markup");
  assert.ok(!/Request storage failure|Request photo cleanup deferred/.test(logs), logs);
  console.log(`Artifacts: ${directory}`);
} catch (error) { console.error(logs.slice(-5000)); throw error; }
finally { server.kill(); }
