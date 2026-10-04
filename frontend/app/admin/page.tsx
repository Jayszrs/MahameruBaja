import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OperationsDemoPage from "../../src/screens/OperationsDemoPage";
import { ADMIN_COOKIE, verifyAdminSession } from "../../src/lib/adminAuth";

export const metadata = { title: "Portal Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSession(session)) redirect("/admin/login");
  return <OperationsDemoPage />;
}
