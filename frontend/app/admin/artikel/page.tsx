import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ArticleEditor from "../../../src/components/ArticleEditor";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readArticles } from "../../../src/lib/articleStore";

export const metadata = { title: "Artikel | CMS", robots: { index: false, follow: false } };
export default async function Page() {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  return <ArticleEditor initialArticles={await readArticles()} />;
}
