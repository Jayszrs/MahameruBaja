import { z } from "zod";
import { products } from "./products";
import { divisions } from "./divisionContent";

export const inventoryDivisions = ['retail-tambun', 'retail-cibitung', 'trading-proyek', 'laser-cutting', 'fabrikasi-erection'] as const;
export const stockStatuses = ['unconfirmed', 'available', 'empty', 'preorder'] as const;
export const stockLabels = { unconfirmed: 'Belum dikonfirmasi', available: 'Tersedia', empty: 'Stok habis', preorder: 'Pre-order' };
export const inventorySchema = z.object({
  productId: z.string().refine(id => products.some(p => p.id === id), 'Produk tidak dikenal'),
  division: z.enum(inventoryDivisions),
  listed: z.boolean(),
  status: z.enum(stockStatuses),
  quantity: z.number().int().min(0).max(1000000000).nullable(),
  unit: z.enum(['batang', 'lembar', 'kg', 'set', 'buah', 'meter']),
  verifiedAt: z.string().datetime({ offset: true }).or(z.literal('')),
  note: z.string().trim().max(300),
}).superRefine((item, ctx) => {
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
});

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
  return [...a.values()];
}
