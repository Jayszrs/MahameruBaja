import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, readAdminIdentity } from "../../../src/lib/adminAuth";
import { readRequests } from "../../../src/lib/requestStore";
import RequestEditor from "../../../src/components/RequestEditor";
export const metadata = { title:"Permintaan Pelanggan | CMS",robots:{index:false,follow:false} };
export default async function Page(){const identity=readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);if(!identity)redirect("/admin/login");return <RequestEditor divisionScope={identity.division} initial={(await readRequests()).filter(r=>!identity.division||r.businessUnitSlug===identity.division)} />;}
