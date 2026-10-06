import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminHome from "../../src/components/AdminHome";
import { readSiteContent } from "../../src/lib/siteContentStore";
import { readRequests } from "../../src/lib/requestStore";
import { ADMIN_COOKIE, verifyAdminSession } from "../../src/lib/adminAuth";

export const metadata = { title: "Portal Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifyAdminSession(session)) redirect("/admin/login");
  const [content,requests]=await Promise.all([readSiteContent(),readRequests()]);
  return <AdminHome content={content} requests={requests} />;
}
