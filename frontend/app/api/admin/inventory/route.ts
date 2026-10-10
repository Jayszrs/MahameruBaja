import { cookies } from 'next/headers';
import { z } from 'zod';
import { ADMIN_COOKIE, readAdminIdentity } from '../../../../src/lib/adminAuth';
import { adminRequestOrigin } from '../../../../src/lib/adminRequestOrigin';
import { inventoryListSchema, mergeInventory } from '../../../../src/data/inventory';
import { readSiteContent, writeSiteContent } from '../../../../src/lib/siteContentStore';

export const runtime = 'nodejs';
const schema = z.object({ items: inventoryListSchema, base: inventoryListSchema });
export async function GET() {
  const identity = readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!identity) return Response.json({ message: 'Silakan masuk kembali.' }, { status: 401 });
  const { inventory } = await readSiteContent();
  return Response.json({ items: inventory.filter(i => !identity.division || i.division === identity.division) }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function PUT(request: Request) {
  const identity = readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!identity) return Response.json({ message: 'Silakan masuk kembali.' }, { status: 401 });
  if (!adminRequestOrigin(request)) return Response.json({ message: 'Asal permintaan tidak valid.' }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 300000) return Response.json({ message: 'Data terlalu besar.' }, { status: 413 });
  let json: unknown;
  try { json = JSON.parse(raw); } catch { return Response.json({ message: 'Format tidak valid.' }, { status: 400 }); }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return Response.json({ message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }, { status: 400 });
  const { items, base } = parsed.data;
  if (identity.division && [...items, ...base].some(i => i.division !== identity.division)) return Response.json({ message: 'Stok hanya boleh diubah untuk divisi akun Anda.' }, { status: 403 });
  try {
    const current = await readSiteContent();
    const scoped = current.inventory.filter(i => !identity.division || i.division === identity.division);
    const merged = mergeInventory(scoped, items, base);
    const inventory = identity.division ? [...current.inventory.filter(i => i.division !== identity.division), ...merged] : merged;
    const saved = await writeSiteContent({ ...current, inventory }, current);
    return Response.json({ items: saved.inventory.filter(i => !identity.division || i.division === identity.division) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (['CMS_CONFLICT', 'CMS_BUSY', 'BUSY'].includes((error as Error).message)) return Response.json({ message: 'Baris stok telah diubah admin lain. Muat ulang sebelum menyimpan.' }, { status: 409 });
    console.error('Inventory save failed', error);
    return Response.json({ message: 'Stok belum tersimpan. Coba lagi.' }, { status: 500 });
  }
}
