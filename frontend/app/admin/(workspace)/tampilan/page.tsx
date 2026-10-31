import AppearanceEditor from "../../../../src/components/AppearanceEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Tampilan Website | CMS" };
export default async function Page() { return <AppearanceEditor initialContent={await readAdminContent()} />; }
