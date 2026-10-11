import { notFound } from "next/navigation";
import AccountEditor from "../../../../src/components/AccountEditor";
import { requireAdminData } from "../../../../src/lib/adminWorkspaceData";
import { readAccounts } from "../../../../src/lib/accountStore";
import { publicAccount } from "../../../../src/data/adminAccount";
export default async function Page() { const actor=await requireAdminData();if(actor.role!=="super_admin")notFound();return <AccountEditor initialAccounts={(await readAccounts()).map(publicAccount)}/>; }
