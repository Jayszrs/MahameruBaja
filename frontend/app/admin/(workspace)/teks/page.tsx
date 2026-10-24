import WebsiteTextEditor from "../../../../src/components/WebsiteTextEditor";
import { readAdminArticles, readAdminContent } from "../../../../src/lib/adminWorkspaceData";
import { articleWebsiteTextChoices } from "../../../../src/lib/articleWebsiteTextCatalog";
export const metadata = { title: "Teks Website | CMS" };
export default async function Page() {
  const [content, articles] = await Promise.all([readAdminContent(), readAdminArticles()]);
  return <WebsiteTextEditor initialContent={content} articleChoices={articleWebsiteTextChoices(articles)} />;
}
