import PartnerLogoEditor from "../../../../src/components/PartnerLogoEditor";
import { readAdminContent } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title:"Logo Supplier & Rekanan | CMS" };
export default async function Page() { return <PartnerLogoEditor initialContent={await readAdminContent()}/>; }
