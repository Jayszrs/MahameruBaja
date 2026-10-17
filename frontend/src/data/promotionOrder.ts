import type { Promotion } from "./promotions";

// Keep public ordering independent of CMS validation and example content.
// Equal priorities retain the admin's manually arranged order.
export function prioritizePromotions(items: Promotion[]) {
  return [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
