import WebsiteTextEditor from "../../../../src/components/WebsiteTextEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Teks Website | CMS" };
export default async function Page() { return <WebsiteTextEditor initialContent={await readAdminContent()} />; }
