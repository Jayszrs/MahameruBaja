import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir, access } from 'node:fs/promises';
assert.equal(process.env.CMS_REVISION_TEST_ISOLATED, '1', 'Run only against the disposable revision CMS.');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ARTICLE_PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.CMS_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const base = process.env.CMS_TEST_URL || 'http://localhost:3173';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Local fixture only.');
const statePath = process.env.CMS_PRODUCTS_AUTH_FILE || fileURLToPath(new URL('../../tmp/revision-products-auth.json', import.meta.url));
const hasState = await access(statePath).then(() => true, () => false);
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, ...(hasState ? { storageState: statePath } : {}) });
const page = await context.newPage();
page.setDefaultTimeout(30000);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', entry => { if (entry.type() === 'error') console.log('BROWSER ERROR:', entry.text()); });
const unique = `Uji Produk ${Date.now()}`;
const output = new URL('../../tmp/revision-products-qa/', import.meta.url);
await mkdir(output, { recursive: true });
let createdProduct, createdAccount;
async function get(path) { const response = await context.request.get(base + path); assert.equal(response.status(), 200, await response.text()); return response.json(); }
async function put(path, data) { const response = await context.request.put(base + path, { headers: { Origin: base }, data }); assert.equal(response.status(), 200, await response.text()); return response.json(); }
async function saveInventory() {
  const pending = page.waitForResponse(response => response.url().endsWith('/api/admin/inventory') && response.request().method() === 'PUT');
  await page.locator('.admin-topbar').getByRole('button', { name: 'Simpan produk & stok', exact: true }).click();
  const response = await pending; assert.equal(response.status(), 200, await response.text());
  return response.json();
}
try {
  if (!hasState) {
    await page.goto(base + '/admin/login');
    await page.getByLabel('Email admin').fill('revision@example.test');
    await page.getByLabel('Kata sandi').fill('revision-local-test');
    await page.getByRole('button', { name: /Masuk ke portal/ }).click();
    await page.waitForURL(base + '/admin');
    await context.storageState({ path: statePath });
  }
  await page.goto(base + '/admin/produk');
  await page.getByRole('button', { name: '+ Tambah produk baru', exact: true }).click();
  const card = page.locator('.inventory-editor .editor-panel').filter({ has: page.getByLabel('Nama produk', { exact: true }) }).first();
  await card.getByLabel('Nama produk', { exact: true }).fill(unique);
  assert.equal(await page.locator('.admin-topbar').getByRole('button', { name: 'Simpan produk & stok', exact: true }).isDisabled(), true);
  await card.getByLabel('Kode SKU', { exact: true }).fill('QA-NEW');
  await card.getByLabel('Kategori', { exact: true }).fill('Material Khusus');
  await card.getByLabel('Spesifikasi singkat', { exact: true }).fill('Plat ukuran sesuai kebutuhan');
  await card.getByLabel(/^Deskripsi produk/).fill('Produk baru dari CMS untuk menguji penyimpanan dan tampilan katalog.');
  const png = { name: 'produk.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC', 'base64') };
  const upload = page.waitForResponse(response => response.url().endsWith('/api/admin/media') && response.request().method() === 'POST').catch(error => ({ error }));
  await card.locator('input[type=file]').setInputFiles(png);
  const uploadResponse = await upload; if (uploadResponse.error) throw uploadResponse.error; assert.equal(uploadResponse.status(), 200);
  await card.getByLabel(/^Status stok/).selectOption('available');
  await card.getByLabel('Sisa stok', { exact: true }).fill('5');
  await card.getByRole('button', { name: 'Konfirmasi stok sekarang', exact: true }).click();
  let saved = await saveInventory();
  createdProduct = saved.items.find(item => item.product?.name === unique);
  assert.ok(createdProduct?.listed && createdProduct.quantity === 5);
  assert.equal(saved.items[0].productId, createdProduct.productId, 'New product stays first after save.');
  await page.reload();
  await page.getByLabel('Cari produk', { exact: true }).fill(unique);
  await page.getByLabel(/^Deskripsi produk/).fill('Deskripsi produk telah diperbarui.');
  await saveInventory();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: fileURLToPath(new URL('inventory-mobile.png', output)) });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Inventory editor fits mobile viewport.');
  await page.goto(base + `/produk?q=${encodeURIComponent(unique)}`);
  await page.locator('.product-card').getByText(unique, { exact: true }).waitFor();
  await page.goto(base + `/produk/${createdProduct.product.slug}`);
  await page.getByRole('heading', { name: unique, exact: true }).waitFor();
  assert.ok((await page.textContent('body')).includes('5 batang'));
  await page.goto(base + `/cari?q=${encodeURIComponent(unique)}`);
  await page.locator('.product-card').getByText(unique, { exact: true }).waitFor();
  console.log('PASS: new product create/upload/save/reload/edit and public catalog/detail/search; mobile editor has no horizontal overflow.');

  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto(base + '/admin/teks');
  assert.equal(await page.locator('[name=copy-page]').inputValue(), 'all');
  await page.locator('[name=copy-search]').fill('Tanyakan produk ke divisi penyedia.');
  const copy = page.locator('.text-editor-card').first();
  await copy.getByLabel('Tulisan yang ditampilkan').fill('Pilih tim penyedia produk Anda.');
  const textSave = page.waitForResponse(response => response.url().endsWith('/api/admin/content') && response.request().method() === 'PUT');
  await page.locator('.admin-topbar').getByRole('button', { name: 'Simpan teks website', exact: true }).click();
  assert.equal((await textSave).status(), 200);
  await page.goto(base + `/produk/${createdProduct.product.slug}`);
  await page.getByRole('heading', { name: 'Pilih tim penyedia produk Anda.', exact: true }).waitFor();
  console.log('PASS: website text defaults to all pages, finds formerly omitted product-inventory copy, saves and renders replacement publicly.');

  const accountResponse = await context.request.post(base + '/api/admin/accounts', { headers: { Origin: base }, data: { name: 'Uji Password Delapan', email: `password-${Date.now()}@example.test`, division: 'retail-tambun', active: true } });
  assert.equal(accountResponse.status(), 201, await accountResponse.text());
  createdAccount = (await accountResponse.json()).account;
  const resetUrl = base + `/api/admin/accounts/${createdAccount.id}/reset-password`;
  let reset = await context.request.post(resetUrl, { headers: { Origin: base }, data: { revision: createdAccount.revision, newPassword: '1234567' } });
  assert.equal(reset.status(), 400);
  reset = await context.request.post(resetUrl, { headers: { Origin: base }, data: { revision: createdAccount.revision, newPassword: 'EightQA8' } });
  assert.equal(reset.status(), 200, await reset.text());
  createdAccount = (await reset.json()).account;
  const child = await browser.newContext();
  const childPage = await child.newPage();
  await childPage.goto(base + '/admin/login'); await childPage.getByLabel('Email admin').fill(createdAccount.email); await childPage.getByLabel('Kata sandi').fill('EightQA8'); await childPage.getByRole('button', { name: /Masuk ke portal/ }).click(); await childPage.waitForURL(/\/admin\/akun-saya/);
  await childPage.getByLabel('Password saat ini', { exact: true }).fill('EightQA8');
  await childPage.getByLabel('Password baru', { exact: true }).fill('NewPass8');
  await childPage.getByLabel('Konfirmasi password baru', { exact: true }).fill('NewPass8');
  const passwordSave = childPage.waitForResponse(response => response.url().endsWith('/api/admin/change-password') && response.request().method() === 'POST');
  await childPage.locator('form').getByRole('button', { name: 'Ganti password', exact: true }).click(); assert.equal((await passwordSave).status(), 200);
  await child.close();
  console.log('PASS: server rejects 7-character reset, accepts 8; account can log in and replace temporary password with 8 characters.');

  await page.goto(base + '/admin/produk'); await page.getByLabel('Cari produk', { exact: true }).fill(unique);
  await page.getByRole('button', { name: 'Hapus dari divisi', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Hapus dari divisi', exact: true }).click();
  saved = await saveInventory(); assert.ok(!saved.items.some(item => item.productId === createdProduct.productId));
  const removed = await context.request.get(base + `/produk/${createdProduct.product.slug}`); assert.equal(removed.status(), 404);
  createdProduct = null;
  console.log('PASS: delete removes the custom product from persisted inventory and public detail returns 404.');
  assert.deepEqual(errors, []);
} catch(error) {
  console.log('PAGE ERROR CONTEXT:', (await page.locator('.editor-notice, .admin-notice').allTextContents()).join(' | '));
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)), fullPage: true });
  throw error;
} finally {
  if (createdProduct) { const current = await get('/api/admin/inventory'); await put('/api/admin/inventory', { items: current.items.filter(item => item.productId !== createdProduct.productId), base: current.items }); }
  const content = await get('/api/admin/content');
  if (content.websiteTexts.some(row => row.replacement === 'Pilih tim penyedia produk Anda.')) await put('/api/admin/content', { ...content, websiteTexts: content.websiteTexts.filter(row => row.replacement !== 'Pilih tim penyedia produk Anda.'), _base: content });
  if (createdAccount) { const account = await get(`/api/admin/accounts/${createdAccount.id}`); const saved = await put(`/api/admin/accounts/${account.id}`, { ...account, active: false }); await context.request.delete(base + `/api/admin/accounts/${account.id}`, { headers: { Origin: base }, data: { revision: saved.account.revision } }); }
  await context.close(); await browser.close();
}
