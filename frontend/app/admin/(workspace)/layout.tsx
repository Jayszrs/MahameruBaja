import { Suspense, type ReactNode } from "react";
import AdminShell from "../../../src/components/AdminShell";
import { requireAdminWorkspace } from "../../../src/lib/adminWorkspaceData";
import { AdminIdentityProvider } from "../../../src/components/AdminIdentity";
import { DivisionDirectory } from "../../../src/components/DivisionDirectory";
import { editableDivisions } from "../../../src/lib/divisionStore";
import { readSiteContent } from "../../../src/lib/siteContentStore";
export const metadata = { robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: ReactNode }) {
  const identity = await requireAdminWorkspace();
  const [divisions,content] = await Promise.all([editableDivisions(identity), readSiteContent()]);
  const directory = divisions.map(d=>({...d,admins:content.contacts.filter(c=>c.published&&c.divisions.includes(d.slug)).map(c=>({name:c.name,phone:c.whatsapp||c.mobile||c.phone})).filter(c=>c.phone)}));
  return <Suspense fallback={<div className="admin-editor-loading">Memuat ruang kerja…</div>}><AdminIdentityProvider identity={identity}><DivisionDirectory divisions={directory}><AdminShell>{children}</AdminShell></DivisionDirectory></AdminIdentityProvider></Suspense>;
}
