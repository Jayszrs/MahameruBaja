import SocialEditor from "../../../../src/components/SocialEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Sosial Media | CMS" };
export default async function Page() { return <SocialEditor initialContent={await readAdminContent()} />; }
