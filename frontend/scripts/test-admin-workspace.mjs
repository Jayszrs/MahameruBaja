import assert from "node:assert/strict";
import { createRequire } from "node:module";
assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Use a disposable local CMS store.");
const base = "http://localhost:3000";
const { chromium } = createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = []; const nativeDialogs = [];
page.on("pageerror", error => errors.push(error.message));
page.on("dialog", async dialog => { nativeDialogs.push(dialog.type()); await dialog.dismiss(); });
async function login() {
  await page.goto(base + "/admin/login");
  assert.equal(await page.locator(".admin-sidebar").count(), 0);
  await page.getByLabel("Email admin").fill("cms-test@example.test");
  await page.getByLabel("Kata sandi").fill("article-test-local");
  await page.getByRole("button", { name: /Masuk ke portal/ }).click();
  await page.waitForURL(base + "/admin"); await page.getByRole("heading", { name: "Dashboard", exact: true }).waitFor();
}
await login();
const nav = page.locator(".admin-sidebar nav");
async function openGroup(name) { const button = nav.getByRole("button", { name }); if ((await button.getAttribute("aria-expanded")) !== "true") await button.click(); }
assert.equal(await page.locator(".admin-sidebar").count(), 1);
assert.equal(await page.locator(".admin-topbar").count(), 1);
assert.equal(await page.locator(".admin-group-toggle").count(), 5);
assert.equal(await page.locator(".admin-home-sections").count(), 0);
assert.equal(await nav.getByRole("button", { name: /Sales Desk/ }).getAttribute("aria-expanded"), "true");
await nav.getByRole("button", { name: /Kanal/ }).click();
await nav.getByRole("button", { name: /Artikel/ }).click();
await nav.getByRole("button", { name: /Kanal/ }).click();
await page.reload();
assert.equal(await nav.getByRole("button", { name: /Kanal/ }).getAttribute("aria-expanded"), "false");
assert.equal(await nav.getByRole("button", { name: /Artikel/ }).getAttribute("aria-expanded"), "true");

async function api(url, method = "GET", data) {
  const response = await context.request.fetch(base + url, { method, headers: { Origin: base }, ...(data ? { data } : {}) });
  assert(response.ok(), `${method} ${url}: ${response.status()} ${await response.text()}`); return response.json();
}
const input = { kind: "QUOTATION", businessUnitSlug: "retail-tambun", name: "Fixture pelanggan", whatsapp: "081234567890", consent: true, items: [] };
const requests = [];
for (const name of ["Baru", "Review", "Selesai", "Arsip"]) requests.push(await api("/api/admin/requests", "POST", { ...input, name: `Fixture ${name}` }));
requests[1] = await api(`/api/admin/requests?id=${requests[1].id}`, "PATCH", { revision: requests[1].revision, status: "Review kebutuhan" });
requests[2] = await api(`/api/admin/requests?id=${requests[2].id}`, "PATCH", { revision: requests[2].revision, status: "Selesai" });
requests[3] = await api(`/api/admin/requests?id=${requests[3].id}`, "DELETE", { revision: requests[3].revision });
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const relativeDate = offset => new Date(new Date(`${today}T12:00:00Z`).getTime() + offset * 86400000).toISOString().slice(0, 10);
let content = await api("/api/admin/content");
content.promotions = content.promotions.map(promotion => ({ ...promotion, published: false }));
content.promotions[0] = { ...content.promotions[0], published: true, startDate: today, endDate: today };
content.promotions[1] = { ...content.promotions[1], published: true, startDate: relativeDate(1), endDate: relativeDate(2) };
content.promotions[2] = { ...content.promotions[2], published: true, startDate: relativeDate(-2), endDate: relativeDate(-1) };
content.promotions[3] = { ...content.promotions[3], published: false };
content = await api("/api/admin/content", "PUT", content);
await api("/api/admin/articles", "POST", { title: "Draf fixture dashboard", slug: "draf-fixture-dashboard", category: "Pengujian", date: today, excerpt: "Draf lokal untuk pengujian dashboard.", image: "/images/hero-steel-warehouse-v2.png", imageAlt: "Gudang", content: "Isi artikel fixture.", status: "draft" });
await page.reload();
const liveBannerCount = content.promotions.filter(item => item.published && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today)).length;
assert.deepEqual(await page.locator(".admin-metrics strong").allTextContents(), ["3", "2", "7", String(liveBannerCount)]);
assert.equal(await page.locator(".admin-recent-table tbody tr").count(), 3);
assert.equal(await page.locator(".admin-article-activity>a").count(), 5);
assert((await page.locator(".admin-content-summary").innerText()).includes("1 draf"));
const views = [
  ["/admin/permintaan?view=active", "Permintaan aktif"], ["/admin/permintaan?view=archived", "Arsip"],
  ["/admin/konten?tab=contacts", "Kontak & divisi"], ["/admin/konten?tab=reviews", "Ulasan Google"],
  ["/admin/produk", "Produk & stok"],
  ["/admin/sosial?tab=accounts", "Akun sosial"], ["/admin/sosial?tab=posts", "Unggahan sosial"],
  ["/admin/promosi?view=all", "Semua banner"], ["/admin/promosi?view=live", "Banner tayang"], ["/admin/promosi?view=draft", "Draf"],
  ["/admin/hero", "Hero beranda"], ["/admin/galeri", "Galeri & proyek"],
  ["/admin/artikel?status=all", "Semua artikel"], ["/admin/artikel?status=draft", "Draf"], ["/admin/artikel?status=published", "Terbit"],
];
for (const [url, label] of views) {
  await page.goto(base + url);
  const selected = nav.locator('a[aria-current="page"]');
  await selected.waitFor();
  assert.equal((await selected.innerText()).trim(), label);
  assert.equal(await page.locator(".admin-sidebar").count(), 1); assert.equal(await page.locator(".admin-topbar").count(), 1);
  assert.equal(await page.locator(".editor-sidebar,.requests-sidebar,.editor-topbar,.requests-top").evaluateAll(elements => elements.filter(element => getComputedStyle(element).display !== "none" && getComputedStyle(element).visibility !== "hidden").length), 0);
}
await page.goto(base + "/admin/promosi?view=live"); assert.equal(await page.locator(".promotion-editor-panel").count(), 1);
await page.goto(base + "/admin/promosi?view=draft"); assert.equal(await page.locator(".promotion-editor-panel").count(), content.promotions.filter(item => !item.published).length);
await page.goto(base + "/admin/hero"); assert(await page.locator(".hero-editor-preview").count() > 0);
await page.goto(base + "/admin/galeri"); assert(await page.locator(".gallery-editor-project").count() > 0);
await page.goto(base + "/admin/produk"); assert(await page.locator(".inventory-editor").count() === 1);
await page.goto(base + "/admin/permintaan?view=archived"); assert.equal(await page.locator(".requests-records>button").count(), 1);
await page.goto(base + `/admin/permintaan?view=active&id=${requests[1].id}`); assert.equal(await page.getByLabel("Nama pelanggan").inputValue(), "Fixture Review");
assert(await page.locator(".invoice-editor").count() === 1, "Invoice editor remains available in Sales Desk.");
await page.goto(base + "/admin/konten?tab=invalid"); assert.equal(await nav.getByRole("link", { name: "Kontak & divisi", exact: true }).getAttribute("aria-current"), "page");
await page.getByLabel("Nama", { exact: true }).first().fill("Kontak belum disimpan");
await page.getByRole("button", { name: "Ulasan Google", exact: true }).click();
await page.getByRole("button", { name: "Kontak & divisi", exact: true }).click();
assert.equal(await page.getByLabel("Nama", { exact: true }).first().inputValue(), "Kontak belum disimpan");
await openGroup(/Artikel/);
await nav.getByRole("link", { name: "Semua artikel", exact: true }).click();
const discard = page.getByRole("dialog", { name: "Perubahan belum disimpan", exact: true });
await discard.waitFor(); await discard.getByRole("button", { name: "Tetap di halaman" }).click();
assert(page.url().includes("/admin/konten")); assert.equal(await page.getByLabel("Nama", { exact: true }).first().inputValue(), "Kontak belum disimpan");
await page.locator(".admin-topbar").getByRole("button", { name: "Simpan perubahan", exact: true }).click();
await page.locator(".admin-topbar .admin-primary:disabled").waitFor();
await page.waitForFunction(() => document.querySelector('.admin-save-state')?.textContent === 'Semua perubahan tersimpan');
await nav.getByRole("link", { name: "Semua artikel", exact: true }).click(); await page.waitForURL(/\/admin\/artikel/);
await page.getByLabel("Judul artikel", { exact: true }).fill("Judul belum disimpan");
await page.evaluate(() => history.back());
await discard.waitFor(); await discard.getByRole("button", { name: "Tetap di halaman" }).click();
assert(page.url().includes("/admin/artikel")); assert.equal(await page.getByLabel("Judul artikel", { exact: true }).inputValue(), "Judul belum disimpan");
await page.locator(".article-list-items>button").nth(1).click(); await discard.waitFor(); await page.keyboard.press("Escape");
assert.equal(await page.getByLabel("Judul artikel", { exact: true }).inputValue(), "Judul belum disimpan");
await page.locator(".admin-sidebar-footer").getByRole("button", { name: /Keluar/ }).click(); await discard.waitFor(); await discard.getByRole("button", { name: "Tetap di halaman" }).click();
await page.evaluate(() => history.back()); await discard.waitFor(); await discard.getByRole("button", { name: "Tinggalkan perubahan" }).click();
await page.waitForURL(/\/admin\/konten/);

await page.getByLabel("Nama", { exact: true }).first().fill("Perubahan belum tersimpan");
let release;
await page.route("**/api/admin/content", async route => { await new Promise(resolve => { release = resolve; }); await route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ message: "Konflik fixture: konten diubah pada tab lain." }) }); });
await page.locator(".admin-topbar").getByRole("button", { name: "Simpan perubahan", exact: true }).click();
await page.waitForFunction(() => document.querySelector('.admin-save-state')?.textContent === 'Sedang diproses…');
await openGroup(/Sales Desk/);
await nav.getByRole("link", { name: "Permintaan aktif", exact: true }).click(); assert(page.url().includes("/admin/konten"));
release(); await page.getByRole("alert").filter({ hasText: "Konflik fixture" }).waitFor();
assert.equal(await page.getByLabel("Nama", { exact: true }).first().inputValue(), "Perubahan belum tersimpan");
assert((await page.locator(".admin-save-state").textContent()).includes("belum disimpan"));
await page.unroute("**/api/admin/content");
await page.reload().catch(() => {}); assert(nativeDialogs.includes("beforeunload"));
await nav.getByRole("link", { name: "Dashboard", exact: true }).click(); await discard.waitFor(); await discard.getByRole("button", { name: "Tinggalkan perubahan" }).click(); await page.waitForURL(base + "/admin");

for (const width of [2560, 1440, 1024, 768, 390]) {
  await page.setViewportSize({ width, height: 1000 }); await page.goto(base + "/admin");
  await page.getByRole("heading", { name: "Dashboard", exact: true }).waitFor();
  const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert(size.scroll <= size.width + 1, `Dashboard overflow at ${width}: ${JSON.stringify(size)}`);
  await page.screenshot({ path: `/artifacts/admin-dashboard-${width}.png`, fullPage: true });
  await page.goto(base + "/admin/artikel?status=all"); await page.getByRole("textbox", { name: "Isi artikel", exact: true }).waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Article overflow at ${width}`);
  await page.screenshot({ path: `/artifacts/admin-article-${width}.png`, fullPage: true });
}
const menu = page.getByRole("button", { name: "Buka menu admin", exact: true });
await menu.click(); const drawer = page.getByRole("dialog", { name: "Navigasi admin", exact: true }); await drawer.waitFor();
await page.screenshot({ path: "/artifacts/admin-drawer-390.png" });
await page.keyboard.press("Shift+Tab"); assert.equal(await page.evaluate(() => document.activeElement?.textContent?.includes("Keluar")), true);
await page.keyboard.press("Escape"); assert.equal(await menu.evaluate(element => document.activeElement === element), true);
await menu.click(); await drawer.getByRole("button", { name: /Konten Publik/ }).click();
if (!(await drawer.getByRole("link", { name: "Kontak & divisi", exact: true }).isVisible())) await drawer.getByRole("button", { name: /Konten Publik/ }).click();
await drawer.getByRole("link", { name: "Kontak & divisi", exact: true }).click(); await page.waitForURL(/\/admin\/konten/);
assert.equal(await page.locator(".admin-sidebar").getAttribute("aria-hidden"), "true");
await menu.click(); await page.setViewportSize({ width: 1440, height: 1000 });
await page.waitForFunction(() => document.body.style.overflow !== 'hidden');
assert.equal(await page.locator(".admin-sidebar").getAttribute("aria-modal"), null);

// Empty dashboard: only the disposable fixture is emptied.
for (const article of await api("/api/admin/articles")) await api(`/api/admin/articles/${article.id}`, "DELETE", { revision: article.revision });
for (const request of await api("/api/admin/requests")) if (!request.archived) await api(`/api/admin/requests?id=${request.id}`, "DELETE", { revision: request.revision });
content = await api("/api/admin/content"); content.contacts=[]; content.reviews=[]; content.socialAccounts=[]; content.socialPosts=[]; content.promotions=[];
await api("/api/admin/content", "PUT", content);
await page.goto(base + "/admin"); assert.deepEqual(await page.locator(".admin-metrics strong").allTextContents(), ["0","0","0","0"]);
assert(await page.getByRole("heading", { name: "Belum ada permintaan aktif.", exact: true }).isVisible());
assert(await page.getByRole("heading", { name: "Belum ada artikel.", exact: true }).isVisible());
assert.deepEqual(errors, [], "No client-side or hydration errors.");
console.log("Admin workspace checks passed: dashboard counts, 15 views including Hero/Gallery/Inventory, invoice access, collapse persistence, dirty navigation/history/logout, conflict handling, drawer keyboard and 5 viewport widths.");
await browser.close();
