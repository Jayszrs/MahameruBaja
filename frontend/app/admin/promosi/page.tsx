import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readSiteContent } from "../../../src/lib/siteContentStore";
import PromotionEditor from "../../../src/components/PromotionEditor";

export const metadata = { title: "Banner & Promo | CMS", robots: { index: false, follow: false } };
export default async function PromotionPage() {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <PromotionEditor initialContent={await readSiteContent()} />;
}
