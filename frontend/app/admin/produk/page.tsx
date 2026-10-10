import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, readAdminIdentity } from '../../../src/lib/adminAuth';
import { readSiteContent } from '../../../src/lib/siteContentStore';
import InventoryEditor from '../../../src/components/InventoryEditor';

export const metadata = { title: 'Produk & Stok Divisi | CMS', robots: { index: false, follow: false } };
export default async function Page() {
  const identity = readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!identity) redirect('/admin/login');
  const { inventory } = await readSiteContent();
  return <InventoryEditor initialItems={inventory.filter(i => !identity.division || i.division === identity.division)} division={identity.division} />;
}
