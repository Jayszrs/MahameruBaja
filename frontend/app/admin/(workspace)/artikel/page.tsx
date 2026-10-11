import ArticleEditor from "../../../../src/components/ArticleEditor";
import { readAdminArticles } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Artikel | CMS" };
export default async function Page() { return <ArticleEditor initialArticles={await readAdminArticles()} />; }
