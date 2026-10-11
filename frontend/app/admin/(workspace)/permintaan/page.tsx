import RequestEditor from "../../../../src/components/RequestEditor";
import { readAdminRequests } from "../../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Permintaan Pelanggan | CMS" };
export default async function Page() { return <RequestEditor initial={await readAdminRequests()} />; }
