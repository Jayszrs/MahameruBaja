import ContentEditor from "../../../../src/components/ContentEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Kontak & Ulasan | CMS" };
export default async function Page() { return <ContentEditor initialContent={await readAdminContent()} />; }
