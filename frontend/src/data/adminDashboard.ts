import type { ArticleRecord } from "./articleCms";
import type { RequestRecord } from "./requests";
import type { SiteContent } from "./siteContent";
import type { Promotion } from "./promotions";
export function adminJakartaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (name: string) => parts.find(item => item.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function bannerIsLive(item: Promotion, today = adminJakartaDate()) {
  return item.published && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today);
}
export function buildAdminDashboard(content: SiteContent, requests: RequestRecord[], articles: ArticleRecord[], today = adminJakartaDate()) {
  const active = requests.filter(record => !record.archived);
  return {
    requestsActive: active.length, requestsReview: active.filter(record => ["Baru", "Review kebutuhan"].includes(record.status)).length,
    articlesPublished: articles.filter(record => record.status === "published").length,
    articlesDraft: articles.filter(record => record.status === "draft").length,
    bannersLive: content.promotions.filter(item => bannerIsLive(item, today)).length,
    bannersDraft: content.promotions.filter(item => !item.published).length,
    contactsPublished: content.contacts.filter(item => item.published).length,
    reviewsPublished: [...content.reviews, ...content.garudaReviews.reviews].filter(item => item.published).length,
    accountsPublished: content.socialAccounts.filter(item => item.published).length,
    postsPublished: content.socialPosts.filter(item => item.published).length,
    inventoryListed: content.inventory.filter(item => item.listed).length,
    projectsPublished: content.galleryProjects.filter(item => item.published).length,
    heroSlides: content.heroSlides.length,
    recentRequests: [...active].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    recentArticles: [...articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5), today,
  };
}
export type AdminDashboardSummary = ReturnType<typeof buildAdminDashboard>;
