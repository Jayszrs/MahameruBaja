import assert from "node:assert/strict";
import { createRequire } from "node:module";

assert.equal(process.env.ARTICLE_TEST_ISOLATED, "1", "Use a disposable local CMS_DATA_DIR.");
const base = process.env.ARTICLE_TEST_URL || "http://localhost:3000";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const { chromium } = createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("dialog", dialog => dialog.accept());
await page.goto(base + "/admin/login");
await page.getByLabel("Email admin").fill("cms-test@example.test");
await page.getByLabel("Kata sandi").fill("article-test-local");
await page.getByRole("button", { name: /Masuk ke portal/ }).click();
await page.waitForURL(base + "/admin");
await page.goto(base + "/admin/artikel");
await page.getByRole("textbox", { name: "Isi artikel", exact: true }).waitFor();
await page.waitForTimeout(100);
assert(await page.locator(".admin-topbar").getByRole("button", { name: /Simpan perubahan/ }).isDisabled(), "Opening an article must not mark it dirty.");
const records = await (await context.request.get(base + "/api/admin/articles")).json();
const publicPage = await context.newPage();
async function publicDocument(slug) {
  await publicPage.goto(base + "/informasi/" + slug);
  return publicPage.locator(".article-content").evaluate(element => ({
    text: element.textContent.replace(/\s+/g, " ").trim(),
    headings: element.querySelectorAll("h2,h3").length, tables: element.querySelectorAll("table").length,
    cells: element.querySelectorAll("td,th").length, items: element.querySelectorAll("li").length,
    bold: element.querySelectorAll("strong").length,
  }));
}
for (const article of records) {
  const before = await publicDocument(article.slug);
  await page.locator(".article-list-items>button").filter({ hasText: article.title }).click();
  const editor = page.getByRole("textbox", { name: "Isi artikel", exact: true });
  await editor.waitFor(); await editor.click(); await editor.press("Control+End"); await editor.press("Space"); await editor.press("Control+z");
  const saved = page.waitForResponse(response => response.url().endsWith(`/api/admin/articles/${article.id}`) && response.request().method() === "PUT");
  await page.locator(".admin-topbar").getByRole("button", { name: /Simpan perubahan/ }).click();
  assert.equal((await saved).status(), 200);
  assert.deepEqual(await publicDocument(article.slug), before, `Visual editing must preserve article ${article.slug}`);
}
await page.getByRole("button", { name: "+ Tambah", exact: true }).click();
await page.getByLabel("Judul artikel", { exact: true }).fill("Pengujian editor visual");
assert.equal(await page.getByLabel("Alamat artikel", { exact: true }).inputValue(), "pengujian-editor-visual");
await page.getByLabel("Kategori", { exact: true }).fill("Pengujian lokal");
await page.getByLabel("Ringkasan", { exact: true }).fill("Ringkasan dari editor visual pada fixture lokal.");
await page.getByLabel("Deskripsi gambar sampul", { exact: true }).fill("Sampul pengujian");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jM2sAAAAASUVORK5CYII=", "base64");
await page.locator(".article-cover input[type=file]").setInputFiles({ name: "fixture.png", mimeType: "image/png", buffer: png });
await page.waitForFunction(() => document.querySelector('.article-cover input[type="file"]')?.disabled === false);
const doc = page.getByRole("textbox", { name: "Isi artikel", exact: true });
await doc.fill("Panduan visual baru");
await page.getByLabel("Format paragraf").selectOption("2");
await doc.click(); await doc.press("Control+End"); await doc.press("Enter"); await doc.pressSequentially("Isi artikel dari editor visual.");
await page.getByRole("button", { name: "Tabel", exact: true }).click();
assert.equal(await doc.locator("table").count(), 1);
await page.getByRole("button", { name: "Undo", exact: true }).click(); assert.equal(await doc.locator("table").count(), 0);
await page.getByRole("button", { name: "Redo", exact: true }).click(); assert.equal(await doc.locator("table").count(), 1);
await page.getByRole("button", { name: "Pratinjau", exact: true }).click();
assert.equal(await page.locator(".article-preview h2").first().textContent(), "Pengujian editor visual");
await page.getByRole("button", { name: "Kembali ke editor", exact: true }).click();
let saved = page.waitForResponse(response => response.url().endsWith("/api/admin/articles") && response.request().method() === "POST");
await page.locator(".admin-topbar").getByRole("button", { name: /Simpan draf/ }).click();
const createdResponse = await saved; assert.equal(createdResponse.status(), 201); const created = await createdResponse.json();
assert.equal((await context.request.get(base + "/informasi/" + created.slug)).status(), 404);
saved = page.waitForResponse(response => response.url().endsWith(`/api/admin/articles/${created.id}`) && response.request().method() === "PUT");
await page.getByRole("button", { name: "Terbitkan artikel", exact: true }).click(); assert.equal((await saved).status(), 200);
assert.equal((await context.request.get(base + "/informasi/" + created.slug)).status(), 200);
assert(await page.getByLabel("Alamat artikel", { exact: true }).isDisabled());
saved = page.waitForResponse(response => response.url().endsWith(`/api/admin/articles/${created.id}`) && response.request().method() === "PUT");
await page.getByRole("button", { name: "Jadikan draf", exact: true }).click(); assert.equal((await saved).status(), 200);
assert.equal((await context.request.get(base + "/informasi/" + created.slug)).status(), 404);
await page.getByRole("button", { name: "Hapus", exact: true }).click();
saved = page.waitForResponse(response => response.url().endsWith(`/api/admin/articles/${created.id}`) && response.request().method() === "DELETE");
await page.getByRole("button", { name: "Ya, hapus artikel", exact: true }).click(); assert.equal((await saved).status(), 200);
await page.locator(".article-list-items>button").first().click();
for (const width of [2560, 1440, 768, 390]) {
  await page.setViewportSize({ width, height: width < 1000 ? 900 : 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const layout = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert(layout.document <= layout.viewport + 1, `Horizontal overflow at ${width}px: ${JSON.stringify(layout)}`);
  await page.screenshot({ path: `/artifacts/article-editor-${width}.png`, fullPage: true });
  await page.locator(".article-toolbar").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `/artifacts/article-toolbar-${width}.png` });
}
assert.deepEqual(errors, [], "No client-side errors or hydration errors.");
console.log(`Article editor browser checks passed; ${records.length} legacy articles preserved; desktop/tablet/mobile screenshots saved.`);
await browser.close();
