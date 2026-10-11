import HeroEditor from "../../../../src/components/HeroEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Hero Beranda | CMS" };
export default async function Page() { return <HeroEditor initialContent={await readAdminContent()} />; }
