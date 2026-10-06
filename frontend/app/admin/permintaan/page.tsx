import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "../../../src/lib/adminAuth";
import { readRequests } from "../../../src/lib/requestStore";
import RequestEditor from "../../../src/components/RequestEditor";
export const metadata = { title:"Permintaan Pelanggan | CMS",robots:{index:false,follow:false} };
export default async function Page(){if(!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value))redirect("/admin/login");return <RequestEditor initial={await readRequests()} />;}
