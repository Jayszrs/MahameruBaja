import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readSiteContent } from "../../../src/lib/siteContentStore";
import GalleryEditor from "../../../src/components/GalleryEditor";
export const metadata = { title: "Galeri Proyek | CMS", robots: { index: false, follow: false } };
export default async function Page() {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <GalleryEditor initialContent={await readSiteContent()} />;
}
