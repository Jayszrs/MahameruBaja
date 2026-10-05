import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readSiteContent } from "../../../src/lib/siteContentStore";
import ContentEditor from "../../../src/components/ContentEditor";

export const metadata = { title: "Kontak & Ulasan | CMS", robots: { index: false, follow: false } };
export default async function ContentPage() {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <ContentEditor initialContent={await readSiteContent()} />;
}
