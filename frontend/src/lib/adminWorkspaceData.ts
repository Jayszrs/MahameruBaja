import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminSession } from "./adminAuth";
import { readSiteContent } from "./siteContentStore";
import { readRequests } from "./requestStore";
import { readArticles } from "./articleStore";
import { buildAdminDashboard } from "../data/adminDashboard";

export const requireAdminWorkspace = cache(async () => {
  if (!verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
});
// Guard data reads too: Next can render pages and layouts in parallel.
export const readAdminContent = cache(async () => { await requireAdminWorkspace(); return readSiteContent(); });
export const readAdminRequests = cache(async () => { await requireAdminWorkspace(); return readRequests(); });
export const readAdminArticles = cache(async () => { await requireAdminWorkspace(); return readArticles(); });
export const readAdminDashboard = cache(async () => {
  const [content, requests, articles] = await Promise.all([readAdminContent(), readAdminRequests(), readAdminArticles()]);
  return buildAdminDashboard(content, requests, articles);
});
