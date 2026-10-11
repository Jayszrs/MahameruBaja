import InventoryEditor from "../../../../src/components/InventoryEditor";
import { readAdminContent, requireAdminWorkspace } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Produk & Stok | CMS" };
export default async function Page() {
  const identity = await requireAdminWorkspace();
  const { inventory } = await readAdminContent();
  const initialItems = inventory.filter(item => !identity.division || item.division === identity.division);
  return <InventoryEditor initialItems={initialItems} division={identity.division} />;
}
