import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readSiteContent } from "../../../src/lib/siteContentStore";
import SocialEditor from "../../../src/components/SocialEditor";
export const metadata = { title: "Sosial Media | CMS", robots: { index: false, follow: false } };
export default async function Page() {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <SocialEditor initialContent={await readSiteContent()} />;
}
