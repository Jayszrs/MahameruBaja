import DivisionEditor from "../../../../src/components/DivisionEditor";
import { requireAdminData } from "../../../../src/lib/adminWorkspaceData";
import { editableDivisions } from "../../../../src/lib/divisionStore";
export default async function Page() { const actor=await requireAdminData();return <DivisionEditor initialDivisions={await editableDivisions(actor)}/>; }
