import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readSiteContent } from "../../../src/lib/siteContentStore";
import HeroEditor from "../../../src/components/HeroEditor";
export const metadata = { title: "Hero Beranda | CMS", robots: { index: false, follow: false } };
export default async function Page() { if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login"); return <HeroEditor initialContent={await readSiteContent()} />; }
