import AdminHome from "../../../src/components/AdminHome";
import { readAdminDashboard } from "../../../src/lib/adminWorkspaceData";
export const metadata = { title: "Dashboard | Portal Admin" };
export default async function Page() { return <AdminHome summary={await readAdminDashboard()} />; }