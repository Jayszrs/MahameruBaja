import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

assert.equal(process.env.CMS_REVISION_TEST_ISOLATED, '1', 'Use disposable CMS data only.');
const base = process.env.CMS_TEST_URL || 'http://localhost:3173';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const { chromium } = createRequire(import.meta.url)(process.env.ARTICLE_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CMS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const stamp = Date.now();
const source = `Paragraf dinamis milik divisi ${stamp}.`;
const replacement = `Paragraf telah diperbarui melalui CMS ${stamp}.`;
async function api(route, method = 'GET', data, status = 200) {
  const response = await context.request.fetch(base + route, { method, headers: { Origin: base }, ...(data ? { data } : {}) });
  assert.equal(response.status(), status, await response.text());
  return response.json();
}
try {
  const login = await context.request.post(base + '/api/admin/login', { headers: { Origin: base }, form: { email: 'revision@example.test', password: 'revision-local-test' } });
  assert.equal(login.status(), 200);
  const article = await api('/api/admin/articles', 'POST', {
    title: `Artikel teks dinamis ${stamp}`, slug: '', category: 'Berita', date: '2026-10-25',
    excerpt: 'Artikel untuk verifikasi penyuntingan teks.', image: '/images/steel-indonesia/hollow.jpg',
    imageAlt: 'Besi hollow', content: `## Judul bagian dinamis\n\n${source}\n\n[Tautan produk](/produk) dan **teks tebal**.`,
    status: 'published', ownerDivision: 'retail-tambun',
  }, 201);
  const content = await api('/api/admin/content');
  await api('/api/admin/content', 'PUT', { ...content, _base: content, websiteTexts: [...content.websiteTexts, {
    id: `qa-main-${stamp}`, ownerDivision: null, page: 'articles', source,
    replacement: 'Teks website utama tidak boleh bocor ke artikel divisi.', published: true,
  }] });
  await page.goto(base + '/informasi/' + article.slug);
  assert((await page.locator('.article-content').innerText()).includes(source), 'Main website override does not leak into an owned article.');
  await page.goto(base + '/admin/teks');
  await page.locator('[name=copy-site]').selectOption('retail-tambun');
  await page.locator('[name=copy-page]').selectOption('articles');
  await page.locator('[name=copy-search]').fill(source);
  const field = page.locator('.text-editor-card').getByLabel('Tulisan yang ditampilkan');
  await field.waitFor();
  assert.equal(await field.count(), 1, 'Current article body is searchable.');
  await field.fill(replacement);
  const saved = page.waitForResponse(response => response.url().endsWith('/api/admin/content') && response.request().method() === 'PUT');
  await page.locator('.admin-topbar').getByRole('button', { name: 'Simpan teks website', exact: true }).click();
  assert.equal((await saved).status(), 200);
  await page.goto(base + '/informasi/' + article.slug);
  const body = page.locator('.article-content');
  assert((await body.innerText()).includes(replacement), 'CMS replacement reaches the public article.');
  assert.equal(await body.getByRole('link', { name: 'Tautan produk' }).getAttribute('href'), '/produk');
  assert.equal(await body.locator('strong').innerText(), 'teks tebal');
  await page.goto(base + '/admin/teks');
  await page.locator('[name=copy-site]').selectOption('retail-tambun');
  await page.locator('[name=copy-page]').selectOption('articles');
  await page.locator('[name=copy-search]').fill(replacement);
  assert.equal(await page.locator('.text-editor-card').getByLabel('Tulisan yang ditampilkan').inputValue(), replacement, 'Saved text remains searchable after reload.');

  // Simulate the missing UUID method on an HTTP LAN origin without weakening secure cookies.
  await page.addInitScript(() => Object.defineProperty(Crypto.prototype, 'randomUUID', { value: undefined, configurable: true }));
  await page.goto(base + '/admin/galeri');
  await page.getByRole('button', { name: '+ Tambah proyek', exact: true }).click();
  assert.equal(await page.getByLabel('Nama proyek', { exact: true }).inputValue(), 'Proyek baru');
  const uploaded = page.waitForResponse(response => response.url().endsWith('/api/admin/media') && response.request().method() === 'POST');
  await page.getByLabel('Tambah beberapa foto').setInputFiles({ name: 'lan.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC', 'base64') });
  assert.equal((await uploaded).status(), 200);
  await page.getByRole('region', { name: 'Urutan foto', exact: true }).locator('[data-order-id]').waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS browser: live article body search/edit/save/reload/public replacement, owner isolation, Markdown links/formatting, gallery create/upload without crypto.randomUUID; no runtime errors.');
} finally {
  await browser.close();
}
