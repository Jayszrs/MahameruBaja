import DivisionEditor from "../../../../src/components/DivisionEditor";
import { requireAdminData } from "../../../../src/lib/adminWorkspaceData";
import { editableDivisions } from "../../../../src/lib/divisionStore";
export default async function Page({searchParams}:{searchParams:Promise<{division?:string;tab?:string}>}) { const [actor,query]=await Promise.all([requireAdminData(),searchParams]);return <DivisionEditor initialDivisions={await editableDivisions(actor)} initialSlug={query.division} initialTab={query.tab}/>; }
