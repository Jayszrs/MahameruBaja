import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, readAdminIdentity } from "./adminAuth";
import { readSiteContent } from "./siteContentStore";
import { readRequests } from "./requestStore";
import { readArticles } from "./articleStore";
import { buildAdminDashboard } from "../data/adminDashboard";

export const requireAdminWorkspace = cache(async () => {
  const identity = readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!identity) redirect("/admin/login");
  return identity;
});
// Guard data reads too: Next can render pages and layouts in parallel.
export const readAdminContent = cache(async () => { await requireAdminWorkspace(); return readSiteContent(); });
export const readAdminRequests = cache(async () => { const identity = await requireAdminWorkspace(); const records = await readRequests(); return records.filter(record => !identity.division || record.businessUnitSlug === identity.division); });
export const readAdminArticles = cache(async () => { await requireAdminWorkspace(); return readArticles(); });
export const readAdminDashboard = cache(async () => {
  const [identity, content, requests, articles] = await Promise.all([requireAdminWorkspace(), readAdminContent(), readAdminRequests(), readAdminArticles()]);
  const scopedContent = identity.division ? { ...content, inventory: content.inventory.filter(item => item.division === identity.division) } : content;
  return buildAdminDashboard(scopedContent, requests, articles);
});
