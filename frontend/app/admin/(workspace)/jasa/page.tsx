import AppearanceEditor from "../../../../src/components/AppearanceEditor";
import { readAdminContent, requireAdminData } from "../../../../src/lib/adminWorkspaceData";
import { redirect } from "next/navigation";
export const metadata = { title:"Jasa | CMS" };
export default async function Page() {
  const identity=await requireAdminData();
  if(identity.division) redirect("/admin/divisi");
  return <AppearanceEditor initialContent={await readAdminContent()} servicePage />;
}
