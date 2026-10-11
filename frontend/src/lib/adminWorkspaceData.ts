import "server-only";
import { scopeContent } from "./contentScope";
import { contentOwner } from "../data/divisionCms";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, readAdminIdentity } from "./adminAuth";
import { readSiteContent } from "./siteContentStore";
import { readRequests } from "./requestStore";
import { readArticles } from "./articleStore";
import { buildAdminDashboard } from "../data/adminDashboard";

export const requireAdminWorkspace = cache(async () => {
  const identity = await readAdminIdentity((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!identity) redirect("/admin/login");
  return identity;
});
// Guard data reads too: Next can render pages and layouts in parallel.
export const requireAdminData = cache(async () => { const identity = await requireAdminWorkspace(); if(identity.mustChangePassword) redirect("/admin/akun-saya"); return identity; });
export const readAdminContent = cache(async () => { const identity = await requireAdminData(); return scopeContent(await readSiteContent(),identity); });
export const readAdminRequests = cache(async () => { const identity = await requireAdminData(); const records = await readRequests(); return records.filter(record => !identity.division || record.businessUnitSlug === identity.division); });
export const readAdminArticles = cache(async () => { const identity = await requireAdminData(); return (await readArticles()).filter(a => !identity.division || contentOwner(a) === identity.division); });
export const readAdminDashboard = cache(async () => {
  const [identity, content, requests, articles] = await Promise.all([requireAdminWorkspace(), readAdminContent(), readAdminRequests(), readAdminArticles()]);
  const scopedContent = identity.division ? { ...content, inventory: content.inventory.filter(item => item.division === identity.division) } : content;
  return buildAdminDashboard(scopedContent, requests, articles);
});
