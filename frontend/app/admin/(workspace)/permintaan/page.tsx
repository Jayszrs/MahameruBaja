import RequestEditor from "../../../../src/components/RequestEditor";
import { readAdminRequests, requireAdminWorkspace } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Permintaan Pelanggan | CMS" };
export default async function Page() { const identity = await requireAdminWorkspace(); return <RequestEditor initial={await readAdminRequests()} divisionScope={identity.division} />; }
