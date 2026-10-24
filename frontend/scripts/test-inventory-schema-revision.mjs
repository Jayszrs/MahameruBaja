import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const frontend = fileURLToPath(new URL('../', import.meta.url));
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} }; cache.set(file, module);
  const localRequire = name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : require(name);
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
const { inventorySchema, inventoryListSchema, mergeInventory, resolvedInventoryProducts, newCustomProductId, customProductSchema } = load(path.join(frontend, 'src/data/inventory.ts'));
const { products } = load(path.join(frontend, 'src/data/products.ts'));
const id = newCustomProductId();
assert.match(id, /^custom-[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/);
const product = { id, slug: 'produk-baru-khusus', name: 'Material Baru', sku: 'MB-NEW', category: 'Material Khusus', categorySlug: 'material-khusus', shortSpec: 'Ukuran khusus', description: 'Kebutuhan material sesuai spesifikasi.', image: '/images/steel-indonesia/besi-beton.jpg' };
const row = (productId, division = 'retail-tambun') => ({ productId, division, listed: true, status: 'unconfirmed', quantity: null, unit: 'batang', verifiedAt: '', note: '' });
const custom = { ...row(id), product };
assert.equal(inventorySchema.safeParse(custom).success, true);
assert.equal(inventorySchema.safeParse(row('unknown-product')).success, false);
assert.equal(inventorySchema.safeParse({ ...custom, productId: products[0].id }).success, false);
assert.equal(customProductSchema.safeParse({ ...product, image: 'javascript:alert(1)' }).success, false);
assert.equal(inventoryListSchema.safeParse([custom, custom]).success, false);
assert.equal(inventoryListSchema.safeParse([custom, { ...custom, division: 'retail-cibitung', product: { ...product, name: 'Nama berbeda' } }]).success, false);
const a = row(products[0].id, 'retail-cibitung');
const b = row(products[0].id);
const c = row(products[1].id, 'retail-cibitung');
const d = row(products[1].id);
assert.deepEqual(mergeInventory([a, b, c, d], [d, b], [b, d]), [a, d, c, b], 'Division reorders leave other division slots intact.');
assert.deepEqual(mergeInventory([a, b, c, d], [custom, b, d], [b, d]), [a, custom, c, b, d], 'A new product occupies the first owned slot.');
assert.throws(() => mergeInventory([{ ...b, note: 'Changed elsewhere' }], [{ ...b, note: 'My change' }], [b]), /CMS_CONFLICT/);
assert.equal(resolvedInventoryProducts([custom, b])[0].id, id);
assert.equal(resolvedInventoryProducts([custom]).find(product => product.id === id).description, product.description);
const cryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
try {
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: values => { values.fill(7); return values; } } });
  assert.match(newCustomProductId(), /^custom-[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/, 'LAN HTTP fallback is a valid UUID.');
} finally {
  if (cryptoDescriptor) Object.defineProperty(globalThis, 'crypto', cryptoDescriptor); else delete globalThis.crypto;
}
console.log('PASS: custom product schema/URLs, unknown or inconsistent products rejected, concurrent inventory edit conflicts, isolated division order, new-row order, public resolution, LAN UUID fallback.');

const { choicesForWebsite, choiceOnPage } = load(path.join(frontend, 'src/data/websiteTextChoices.ts'));
const catalog = JSON.parse(fs.readFileSync(path.join(frontend, 'src/data/websiteTextCatalog.json'), 'utf8'));
const choices = choicesForWebsite(catalog, undefined, [], [], { contacts: [{ name: 'Nama Kontak CMS Terkini', role: 'Konsultan', ownerDivision: 'retail-tambun' }], inventory: [custom] });
assert.ok(choices.some(choice => choice.source === 'Nama Kontak CMS Terkini'));
assert.ok(choices.some(choice => choice.source === product.name));
assert.ok(choices.some(choice => choice.source === 'Tanyakan produk ke divisi penyedia.' && choiceOnPage(choice, 'products')));
assert.ok(choices.some(choice => choice.source === 'Kebijakan Privasi' && choiceOnPage(choice, 'legal')));
assert.ok(catalog.length > 1000);
console.log('PASS: expanded copy catalog, legal/product page filters, live CMS contact/custom product discovery.');
