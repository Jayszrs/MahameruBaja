import { Suspense, type ReactNode } from "react";
import AdminShell from "../../../src/components/AdminShell";
import { requireAdminWorkspace } from "../../../src/lib/adminWorkspaceData";
export const metadata = { robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: ReactNode }) {
  await requireAdminWorkspace();
  return <Suspense fallback={<div className="admin-editor-loading">Memuat ruang kerja…</div>}><AdminShell>{children}</AdminShell></Suspense>;
}
