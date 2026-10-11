import AccountSelf from "../../../../src/components/AccountSelf";
import { requireAdminWorkspace } from "../../../../src/lib/adminWorkspaceData";
export default async function Page() { await requireAdminWorkspace();return <AccountSelf/>; }
