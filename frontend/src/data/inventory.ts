import { divisionSlugSchema, ownershipFields } from "./divisionCms";
import { z } from "zod";
import { products, type Product } from "./products";
import { safeHttpsUrl, safeLocalAsset } from "./safeUrls";
import { divisions } from "./divisionContent";

export const inventoryDivisions = ['retail-tambun', 'retail-cibitung', 'trading-proyek', 'laser-cutting', 'fabrikasi-erection'] as const;
export const stockStatuses = ['unconfirmed', 'available', 'empty', 'preorder'] as const;
export const stockLabels = { unconfirmed: 'Belum dikonfirmasi', available: 'Tersedia', empty: 'Stok habis', preorder: 'Pre-order' };
export const customProductSchema = z.object({
  id: z.string().regex(/^custom-[a-f0-9-]{36}$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  name: z.string().trim().min(2, 'Isi nama produk minimal 2 karakter.').max(150),
  sku: z.string().trim().min(1, 'Isi kode SKU produk.').max(80),
  category: z.string().trim().min(2, 'Isi kategori produk minimal 2 karakter.').max(100),
  categorySlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  shortSpec: z.string().trim().min(1, 'Isi spesifikasi singkat produk.').max(300),
  description: z.string().trim().min(1, 'Isi deskripsi produk.').max(5000),
  image: z.string().max(1000).refine(value => safeLocalAsset(value, ['images', 'media', 'api/cms/media']) || safeHttpsUrl(value), 'Unggah foto produk atau gunakan URL HTTPS.'),
});
export type CustomProduct = z.infer<typeof customProductSchema>;
export const productSlug = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export function newCustomProductId() {
  if (globalThis.crypto?.randomUUID) return `custom-${globalThis.crypto.randomUUID()}`;
  const bytes = globalThis.crypto?.getRandomValues(new Uint8Array(16)) || Uint8Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = bytes[6] & 15 | 64; bytes[8] = bytes[8] & 63 | 128;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `custom-${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export const inventorySchema = z.object({
  productId: z.string().min(1).max(100),
  product: customProductSchema.optional(),
  division: divisionSlugSchema,
  listed: z.boolean(),
  status: z.enum(stockStatuses),
  quantity: z.number().int().min(0).max(1000000000).nullable(),
  unit: z.enum(['batang', 'lembar', 'kg', 'set', 'buah', 'meter']),
  verifiedAt: z.string().datetime({ offset: true }).or(z.literal('')),
  note: z.string().trim().max(300),
}).superRefine((item, ctx) => {
  const known = products.some(p => p.id === item.productId);
  if (!known && (!item.product || item.product.id !== item.productId)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['productId'], message: 'Lengkapi data produk baru.' });
  if (item.product && (known || item.product.id !== item.productId || products.some(p => p.slug === item.product!.slug))) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['product'], message: 'Identitas produk baru tidak valid.' });
  if (item.status === 'unconfirmed' && (item.quantity !== null || item.verifiedAt)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quantity'], message: 'Stok belum dikonfirmasi tidak boleh menampilkan jumlah atau tanggal verifikasi' });
  if (item.status !== 'unconfirmed' && !item.verifiedAt) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['verifiedAt'], message: 'Konfirmasikan stok sebelum menerbitkan status' });
  if (item.status === 'available' && (item.quantity === null || item.quantity < 1)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quantity'], message: 'Isi jumlah tersedia minimal satu' });
  if (item.status === 'empty' && item.quantity !== 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['quantity'], message: 'Stok habis harus berjumlah nol' });
  if (item.verifiedAt && Date.parse(item.verifiedAt) > Date.now() + 60000) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['verifiedAt'], message: 'Tanggal konfirmasi tidak boleh di masa depan' });
});
export type InventoryItem = z.infer<typeof inventorySchema>;
export const inventoryKey = (item: Pick<InventoryItem, 'productId' | 'division'>) => `${item.division}:${item.productId}`;
export const inventoryListSchema = z.array(inventorySchema).max(500).superRefine((items, ctx) => {
  if (new Set(items.map(inventoryKey)).size !== items.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Produk hanya boleh dicatat sekali per divisi' });
  const definitions = new Map<string, string>();
  const slugs = new Map<string, string>();
  for (const item of items) if (item.product) {
    const previous = definitions.get(item.productId);
    if (previous && previous !== JSON.stringify(item.product)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Data produk yang sama harus konsisten di semua divisi.' });
    if (slugs.has(item.product.slug) && slugs.get(item.product.slug) !== item.productId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Alamat produk harus unik.' });
    definitions.set(item.productId, JSON.stringify(item.product)); slugs.set(item.product.slug, item.productId);
  }
});

export function resolvedInventoryProducts(items: InventoryItem[]): Product[] {
  const result = new Map(products.map(product => [product.id, product]));
  for (const item of items) if (item.product) result.set(item.productId, {
    ...item.product, available: item.status === 'available', images: [item.product.image],
    specifications: [{ label: 'Spesifikasi', value: item.product.shortSpec }], usages: [], tags: [item.product.category.toLowerCase()],
  });
  const ids = [...new Set([...items.map(item => item.productId), ...result.keys()])];
  return ids.map(id => result.get(id)).filter((product): product is Product => Boolean(product));
}

// Category suggestions from the division offerings, not a claim of verified stock.
// Laser and Project sell services; material catalogue stays empty until their admin lists a product.
const categories: Record<string, string[]> = {
  'retail-tambun': ['besi-beton', 'wiremesh', 'besi-hollow', 'pipa-besi', 'besi-siku', 'plat-besi', 'besi-wf', 'canal-unp', 'canal-cnp', 'bondek', 'spandek', 'baja-ringan'],
  'retail-cibitung': ['besi-hollow', 'pipa-besi', 'plat-besi', 'besi-siku', 'besi-wf'],
  'trading-proyek': ['besi-beton', 'besi-wf', 'plat-besi', 'besi-siku', 'canal-unp', 'canal-cnp', 'baja-ringan', 'atap-upvc', 'genteng-upvc'],
};
export const defaultInventory: InventoryItem[] = inventoryDivisions.flatMap(division => products.filter(p => (categories[division] || []).includes(p.categorySlug) && (!p.catalogDivisions || p.catalogDivisions.includes(division)) && (division !== 'trading-proyek' || !['besi-beton', 'baja-ringan'].includes(p.categorySlug) || p.id.startsWith('tr-'))).map(p => ({ productId: p.id, division, listed: true, status: 'unconfirmed' as const, quantity: null, unit: (['plat-besi', 'wiremesh', 'bondek', 'spandek', 'atap-upvc', 'genteng-upvc'].includes(p.categorySlug) ? 'lembar' : 'batang') as InventoryItem['unit'], verifiedAt: '', note: '' })));
export function stockSummary(item: InventoryItem) {
  return item.status === 'unconfirmed' ? 'Jumlah belum dikonfirmasi' : item.status === 'available' ? `Sisa ${item.quantity!.toLocaleString('id-ID')} ${item.unit}` : item.status === 'empty' ? `0 ${item.unit} · stok habis` : 'Pre-order · hubungi admin';
}
export const inventoryDivisionName = (slug: string) => divisions.find(d => d.slug === slug)?.name || slug;

/** Three-way merge by product + division. Concurrent edits never silently lose another row. */
export function mergeInventory(current: InventoryItem[], input: InventoryItem[], base: InventoryItem[]) {
  const a = new Map(current.map(i => [inventoryKey(i), i]));
  const b = new Map(base.map(i => [inventoryKey(i), i]));
  const c = new Map(input.map(i => [inventoryKey(i), i]));
  for (const key of new Set([...b.keys(), ...c.keys()])) {
    if (JSON.stringify(c.get(key)) === JSON.stringify(b.get(key))) continue;
    if (JSON.stringify(a.get(key)) !== JSON.stringify(b.get(key))) throw new Error('CMS_CONFLICT');
    if (c.has(key)) a.set(key, c.get(key)!); else a.delete(key);
  }
  const inputKeys = new Set(input.map(inventoryKey));
  const ordered = input.map(item => a.get(inventoryKey(item))).filter((item): item is InventoryItem => Boolean(item));
  let position = 0;
  return [...a.values()].map(item => inputKeys.has(inventoryKey(item)) ? ordered[position++] : item);
}
