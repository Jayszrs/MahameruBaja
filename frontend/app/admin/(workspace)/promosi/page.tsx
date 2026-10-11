import PromotionEditor from "../../../../src/components/PromotionEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Banner & Promo | CMS" };
export default async function Page() { return <PromotionEditor initialContent={await readAdminContent()} />; }
