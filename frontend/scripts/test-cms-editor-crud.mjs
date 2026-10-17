import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { cmsVideo } from "./fixtures/cms-video.mjs";
assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Use a disposable CMS store.");
const { chromium } = createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const base = "http://localhost:3000", prefix = `CMS UI ${Date.now()}`;
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage(), errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("dialog", d => d.accept());
page.setDefaultTimeout(15000);
const file = { name: "cms.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC", "base64") };
async function login(email = "division-a@example.test", password = "division-fixture-a") {
  await page.goto(base + "/admin/login"); await page.getByLabel("Email admin").fill(email); await page.getByLabel("Kata sandi").fill(password);
  await page.getByRole("button", { name: /Masuk ke portal/ }).click(); await page.waitForURL(base + "/admin");
}
async function api(path) { const response = await context.request.get(base + path); assert(response.ok()); return response.json(); }
async function save(label = "Simpan perubahan", path = "/api/admin/content", method = "PUT") {
  const [response] = await Promise.all([page.waitForResponse(r => r.url().includes(path) && r.request().method() === method), page.locator(".admin-topbar").getByRole("button", { name: label, exact: true }).click()]); assert.equal(response.status(), method === "POST" ? 201 : 200, await response.text());
  await page.waitForFunction(() => document.querySelector(".admin-save-state")?.textContent === "Semua perubahan tersimpan");
  return response.json();
}
async function upload(input, payload = file) {
  const [response] = await Promise.all([page.waitForResponse(r => r.url().endsWith("/api/admin/media") && r.request().method() === "POST"), input.setInputFiles(payload)]); assert.equal(response.status(), 200, await response.text());
  await page.locator(".admin-topbar .admin-primary:not(:disabled)").waitFor(); return (await response.json()).url;
}
async function removeInline(panel) { await panel.getByRole("button", { name: "Hapus", exact: true }).click(); await panel.getByRole("button", { name: "Batal", exact: true }).click(); await panel.getByRole("button", { name: "Hapus", exact: true }).click(); await panel.getByRole("button", { name: "Ya, hapus", exact: true }).click(); }
try {
  await login();
  await page.goto(base + "/admin/konten?tab=contacts"); await page.getByRole("button", { name: "+ Tambah kontak", exact: true }).click();
  let panel = page.locator(".editor-panel").last();
  await panel.getByLabel("Nama", { exact: true }).fill(prefix + " Kontak"); await panel.getByLabel("WhatsApp", { exact: true }).fill("081234567890");
  await upload(panel.getByLabel(/^Unggah foto/)); await panel.getByLabel("Terbit", { exact: true }).check();
  let saved = await save(); const contact = saved.contacts.find(r => r.name === prefix + " Kontak"); assert(contact && contact.published);
  await page.reload(); panel = page.locator(".editor-panel").filter({ hasText: prefix + " Kontak" });
  await panel.getByLabel("Jabatan", { exact: true }).fill("Tim UI disunting");
  await page.route("**/api/admin/content", async route => route.request().method() === "PUT" ? route.fulfill({ status: 409, json: { message: "Fixture konflik: muat ulang sebelum menyimpan." } }) : route.continue());
  const conflict = page.waitForResponse(r => r.url().endsWith("/api/admin/content") && r.request().method() === "PUT");
  await page.locator(".admin-topbar").getByRole("button", { name: "Simpan perubahan", exact: true }).click(); assert.equal((await conflict).status(), 409);
  await page.getByRole("alert").filter({ hasText: "Fixture konflik" }).waitFor(); assert.equal(await panel.getByLabel("Jabatan", { exact: true }).inputValue(), "Tim UI disunting");
  await page.locator(".admin-sidebar").getByRole("link", { name: "Dashboard", exact: true }).click(); await page.getByRole("dialog", { name: "Perubahan belum disimpan" }).getByRole("button", { name: "Tetap di halaman" }).click();
  await page.unroute("**/api/admin/content"); saved = await save(); assert.equal(saved.contacts.find(r => r.id === contact.id).role, "Tim UI disunting");
  await removeInline(panel); saved = await save(); assert(!saved.contacts.some(r => r.id === contact.id)); console.log("Contacts: create, upload, publish, reload/edit, conflict retention and delete passed.");

  await page.goto(base + "/admin/konten?tab=reviews"); await page.getByRole("button", { name: "+ Tambah ulasan", exact: true }).click(); panel = page.locator(".editor-panel").last();
  await panel.getByLabel("Nama penulis (sesuai Google)", { exact: true }).fill(prefix + " Ulasan"); await panel.getByLabel(/^Komentar asli/).fill("Ulasan fixture UI"); await panel.getByLabel("Terbit", { exact: true }).check();
  saved = await save(); const review = saved.divisionReviews["retail-tambun"].reviews.find(r => r.author === prefix + " Ulasan"); assert(review);
  await page.reload(); panel = page.locator(".editor-panel").filter({ hasText: prefix + " Ulasan" }); await panel.getByLabel(/^Komentar asli/).fill("Ulasan disunting"); await save();
  await removeInline(panel); saved = await save(); assert(!saved.divisionReviews["retail-tambun"].reviews.some(r => r.id === review.id)); console.log("Division reviews: create, publish, edit and delete passed.");

  await page.goto(base + "/admin/sosial?tab=accounts"); await page.getByRole("button", { name: "+ Tambah akun", exact: true }).click(); panel = page.locator(".editor-panel").last();
  await panel.getByLabel("Username / nama kanal", { exact: true }).fill("@cms_ui_fixture"); await panel.getByLabel("URL profil resmi", { exact: true }).fill("https://www.instagram.com/cms_ui_fixture/"); await panel.getByLabel("Terbit", { exact: true }).check();
  saved = await save(); const account = saved.socialAccounts.find(r => r.handle === "@cms_ui_fixture"); assert(account);
  await page.reload(); panel = page.locator(".editor-panel").filter({ hasText: "@cms_ui_fixture" }); await panel.getByLabel("Username / nama kanal", { exact: true }).fill("@cms_ui_edited"); await save(); panel = page.locator(".editor-panel").filter({ hasText: "@cms_ui_edited" });
  await panel.getByRole("button", { name: "Hapus akun", exact: true }).click(); await page.getByRole("dialog", { name: "Hapus akun sosial?" }).getByRole("button", { name: "Batal", exact: true }).click();
  await panel.getByRole("button", { name: "Hapus akun", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Hapus akun", exact: true }).click(); saved = await save(); assert(!saved.socialAccounts.some(r => r.id === account.id));
  console.log("Social accounts: create, publish, edit and confirmed delete passed.");

  await page.goto(base + "/admin/sosial?tab=posts"); await page.getByRole("button", { name: "+ Tambah unggahan", exact: true }).click(); panel = page.locator(".editor-panel").last();
  await panel.getByLabel("Judul", { exact: true }).fill(prefix + " Unggahan"); await panel.getByLabel("Tautan unggahan asli", { exact: true }).fill("https://www.instagram.com/p/CMSUiFixture/"); await upload(panel.getByLabel(/^Unggah sampul/)); await upload(panel.getByLabel("Video asli MP4 (opsional)", { exact: true }), { name: "fixture.mp4", mimeType: "video/mp4", buffer: cmsVideo }); await panel.getByLabel("Terbit", { exact: true }).check();
  saved = await save(); const post = saved.socialPosts.find(r => r.title === prefix + " Unggahan"); assert(post);
  await page.reload(); panel = page.locator(".editor-panel").filter({ hasText: prefix + " Unggahan" }); await panel.getByLabel(/^Keterangan/).fill("Caption disunting"); await save(); await removeInline(panel); saved = await save(); assert(!saved.socialPosts.some(r => r.id === post.id)); console.log("Social posts: create, upload, publish, edit and delete passed.");

  await page.goto(base + "/admin/promosi?view=all"); await page.getByRole("button", { name: "+ Tambah banner", exact: true }).click(); panel = page.locator(".promotion-editor-panel").last();
  await panel.getByLabel("Judul banner", { exact: true }).fill(prefix + " Banner"); await panel.getByLabel(/^Yang didapat pelanggan/).fill("Konsultasi material"); await panel.getByLabel(/^Berlaku untuk material/).fill("Material fixture"); await panel.getByLabel(/^Syarat dan batasan/).fill("Konfirmasi tim"); await panel.getByLabel("Deskripsi gambar untuk pembaca layar", { exact: true }).fill("Gambar banner fixture"); await upload(panel.getByLabel(/^Unggah gambar JPG/)); await panel.getByLabel("Terbit", { exact: true }).check();
  saved = await save(); const banner = saved.promotions.find(r => r.title === prefix + " Banner"); assert(banner);
  await page.reload(); panel = page.locator(".promotion-editor-panel").filter({ hasText: prefix + " Banner" }); await panel.getByLabel(/^Penjelasan singkat/).fill("Banner disunting"); await save(); await removeInline(panel); saved = await save(); assert(!saved.promotions.some(r => r.id === banner.id)); console.log("Banners: create, upload, publish, edit and delete passed.");

  await page.goto(base + "/admin/hero"); await page.getByRole("button", { name: "+ Tambah slide", exact: true }).click(); panel = page.locator(".editor-panel").last();
  await panel.getByLabel("Judul", { exact: true }).fill(prefix + " Hero"); await panel.getByLabel("Label layanan", { exact: true }).fill(prefix + " Hero"); await upload(panel.getByLabel(/^Unggah gambar atau video/), { name: "fixture.mp4", mimeType: "video/mp4", buffer: cmsVideo }); await upload(panel.getByLabel(/^Unggah gambar sampul video/)); await panel.getByLabel("Terbit di website", { exact: true }).check();
  saved = await save("Simpan hero"); const hero = saved.heroSlides.find(r => r.title === prefix + " Hero"); assert(hero);
  await page.reload(); panel = page.locator(".editor-panel").filter({ hasText: prefix + " Hero" }); await panel.getByLabel("Deskripsi", { exact: true }).fill("Hero disunting"); await save("Simpan hero"); await panel.getByRole("button", { name: "Hapus slide", exact: true }).click(); await page.keyboard.press("Escape");
  await panel.getByRole("button", { name: "Hapus slide", exact: true }).click(); await page.getByRole("dialog", { name: "Hapus slide hero?" }).getByRole("button", { name: "Hapus slide", exact: true }).click(); saved = await save("Simpan hero"); assert(!saved.heroSlides.some(r => r.id === hero.id)); console.log("Hero: create, upload, publish, edit, Escape/cancel and delete passed.");

  await page.goto(base + "/admin/galeri"); await page.getByRole("button", { name: "+ Tambah proyek", exact: true }).click(); panel = page.locator(".gallery-editor-project");
  await panel.getByLabel("Nama proyek", { exact: true }).fill(prefix + " Galeri"); await upload(panel.getByLabel(/^Tambah beberapa foto/)); await panel.getByLabel("Terbitkan album", { exact: true }).check(); saved = await save(); const gallery = saved.galleryProjects.find(r => r.title === prefix + " Galeri"); assert(gallery && gallery.photos.length === 1);
  await panel.getByLabel(/^Deskripsi proyek/).fill("Album disunting"); await save(); await panel.locator(".gallery-photo-actions").getByRole("button", { name: "Hapus", exact: true }).click(); saved = await save(); assert.equal(saved.galleryProjects.find(r => r.id === gallery.id).published, false); assert.equal(saved.galleryProjects.find(r => r.id === gallery.id).photos.length, 0);
  await panel.getByRole("button", { name: "Hapus album", exact: true }).click(); saved = await save(); assert(!saved.galleryProjects.some(r => r.id === gallery.id)); console.log("Gallery: create, upload, publish, edit, photo deletion/unpublish and album deletion passed.");

  await page.goto(base + "/admin/produk"); const product = await page.locator(".inventory-add select option").evaluateAll(options => options.find(o => o.value)?.value); assert(product, "An unassigned master product is available for the fixture");
  await page.locator(".inventory-add select").selectOption(product); await page.getByRole("button", { name: "+ Tambahkan", exact: true }).click(); panel = page.locator(".inventory-editor .editor-panel").last(); await panel.getByLabel(/^Catatan pelanggan/).fill(prefix + " Stok"); saved = await save("Simpan perubahan", "/api/admin/inventory"); assert(saved.items.some(r => r.productId === product));
  await panel.getByLabel(/^Status/).selectOption("available"); await panel.getByLabel("Sisa stok", { exact: true }).fill("23"); await panel.getByLabel("Tampilkan di katalog divisi", { exact: true }).check(); await panel.getByRole("button", { name: "Konfirmasi stok sekarang", exact: true }).click(); saved = await save("Simpan perubahan", "/api/admin/inventory"); assert.equal(saved.items.find(r => r.productId === product).quantity, 23);
  await panel.getByRole("button", { name: "Hapus dari divisi", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Batal", exact: true }).click(); await panel.getByRole("button", { name: "Hapus dari divisi", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Hapus dari divisi", exact: true }).click(); saved = await save("Simpan perubahan", "/api/admin/inventory"); assert(!saved.items.some(r => r.productId === product)); console.log("Inventory: add master product to division, save, confirm quantity and delete division row passed.");

  await page.goto(base + "/admin/permintaan"); await page.locator(".admin-topbar").getByRole("button", { name: "+ Catat permintaan", exact: true }).click(); await page.getByLabel("Nama pelanggan", { exact: true }).fill(prefix + " Pelanggan"); await page.getByLabel("WhatsApp", { exact: true }).fill("081234567890"); await page.getByLabel(/Pelanggan setuju/).check();
  let record = await save("Simpan permintaan", "/api/admin/requests", "POST"); await page.getByLabel(/^Catatan internal/).fill("Permintaan disunting"); record = await save("Simpan permintaan", "/api/admin/requests", "PATCH"); assert.equal(record.notes, "Permintaan disunting");
  panel = page.locator(".invoice-editor"); await panel.getByLabel("Uraian", { exact: true }).first().fill("Material fixture"); await panel.getByLabel("Harga satuan (Rp)", { exact: true }).first().fill("12000");
  await page.route("**/api/admin/requests?*", async route => { await new Promise(resolve => setTimeout(resolve, 300)); await route.continue(); });
  let wait = page.waitForResponse(r => r.url().includes("/api/admin/requests?") && r.request().method() === "PATCH"); await panel.getByRole("button", { name: "Simpan draf", exact: true }).click(); assert(await panel.getByLabel("Uraian", { exact: true }).first().isDisabled()); assert(await page.locator(".admin-topbar .admin-primary").isDisabled()); assert.equal((await wait).status(), 200); await page.unroute("**/api/admin/requests?*"); await panel.getByRole("status").filter({ hasText: "Draf invoice tersimpan" }).waitFor(); await page.waitForFunction(() => document.querySelector(".admin-save-state")?.textContent === "Semua perubahan tersimpan");
  await panel.getByRole("button", { name: "+ Item invoice", exact: true }).click(); await panel.getByLabel("Uraian", { exact: true }).last().fill("Baris kedua"); await panel.getByRole("button", { name: "Hapus", exact: true }).last().click();
  await panel.getByLabel("Harga satuan (Rp)", { exact: true }).first().fill("15000"); wait = page.waitForResponse(r => r.url().includes("/api/admin/requests?") && r.request().method() === "PATCH"); await panel.getByRole("button", { name: "Simpan draf", exact: true }).click(); assert.equal((await wait).status(), 200);
  const download = page.waitForEvent("download"); await panel.getByRole("button", { name: "Unduh PDF invoice", exact: true }).click(); const pdf = await download; assert(pdf.suggestedFilename().endsWith(".pdf")); assert.equal(await pdf.failure(), null);
  await page.getByRole("button", { name: "Arsipkan", exact: true }).click(); wait = page.waitForResponse(r => r.url().includes("/api/admin/requests?") && r.request().method() === "DELETE"); await page.getByRole("button", { name: "Ya, arsipkan", exact: true }).click(); assert.equal((await wait).status(), 200); await page.waitForURL(/view=archived/);
  wait = page.waitForResponse(r => r.url().includes("/api/admin/requests?") && r.request().method() === "PATCH"); await page.getByRole("button", { name: "Pulihkan", exact: true }).click(); assert.equal((await wait).status(), 200); await page.waitForURL(/view=active/); assert.equal((await api("/api/admin/requests")).find(r => r.id === record.id).invoice.lines[0].price, 15000);
  console.log("Requests/invoice: create, edit, invoice lines, repeated save, PDF download, archive and restore passed.");

  // Filtered reordering must swap only the displayed banners.
  await page.locator(".admin-sidebar").getByRole("button", { name: /Keluar/ }).click(); await page.waitForURL(/\/admin\/login/); await login("cms-test@example.test", "article-test-local");
  const before = (await api("/api/admin/content")).promotions, drafts = before.filter(r => !r.published); assert(drafts.length >= 2);
  await page.goto(base + "/admin/promosi?view=draft"); await page.locator(".promotion-editor-panel").first().getByRole("button", { name: /Turun/ }).click(); saved = await save();
  const expected = [...before], x = expected.findIndex(r => r.id === drafts[0].id), y = expected.findIndex(r => r.id === drafts[1].id); [expected[x], expected[y]] = [expected[y], expected[x]]; assert.deepEqual(saved.promotions, expected);
  await page.locator(".promotion-editor-panel").first().getByRole("button", { name: /Turun/ }).click(); await save();
  for (const width of [2560, 1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["konten", "sosial?tab=posts", "promosi", "hero", "galeri", "produk", "permintaan"]) {
      await page.goto(base + "/admin/" + route); await page.locator(".admin-topbar").waitFor(); assert.equal(await page.locator(".admin-sidebar").count(), 1);
      const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth })); assert(size.content <= size.viewport + 1, `${route} overflow at ${width}: ${JSON.stringify(size)}`);
    }
  }
  assert.deepEqual(errors, []); console.log("CMS editors: all CRUD flows, filtered ordering and 35 responsive workspace checks passed without client errors.");
} catch (error) { await page.screenshot({ path: "/artifacts/cms-crud-failure.png", fullPage: true }); throw error; }
finally { await browser.close(); }
