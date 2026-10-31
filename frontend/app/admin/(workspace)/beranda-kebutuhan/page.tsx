import HomeQuickLinksEditor from "../../../../src/components/HomeQuickLinksEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Pilihan kebutuhan beranda | CMS" };
export default async function Page() { return <HomeQuickLinksEditor initialContent={await readAdminContent()} />; }
