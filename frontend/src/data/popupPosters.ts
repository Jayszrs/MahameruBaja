import type { Promotion } from "./promotions";
import { contentOwner, visibleInDivision } from "./divisionCms";
export function livePopupPosters(promotions: Promotion[], today: string, slug?: string) {
  return promotions.filter(item => item.published && item.showInPopup && item.image && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today) && (slug ? visibleInDivision(item, slug) : !contentOwner(item)));
}
