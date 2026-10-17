import type { Promotion } from "./promotions";
import { contentOwner, visibleInDivision } from "./divisionCms";
import type { Division } from "./divisionCms";
import type { TeamContact } from "./siteContent";
export function livePopupPosters(promotions: Promotion[], today: string, slug?: string) {
  return promotions.filter(item => item.published && item.showInPopup && item.image && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today) && (slug ? visibleInDivision(item, slug) : !contentOwner(item)));
}

// The displaying website is not necessarily the issuer of a shared poster.
export function promotionProviderSlug(item: Promotion) {
  return item.providerDivision || contentOwner(item) || /^\/unit\/([^/?#]+)/.exec(item.ctaHref)?.[1] || "";
}

export function posterDetails(item: Promotion, divisions: Division[], contacts: TeamContact[]) {
  const provider = promotionProviderSlug(item);
  const division = divisions.find(row => row.slug === provider && row.status === "active");
  const available = division ? contacts.filter(row => row.published && (row.divisions.includes(provider) || contentOwner(row) === provider)) : [];
  const contact = item.contactId ? available.find(row => row.id === item.contactId) : available.find(row => row.whatsapp) || available.find(row => row.phone || row.mobile) || available[0];
  const digits = contact?.whatsapp.replace(/\D/g, "") || "";
  const number = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  const whatsappHref = number ? `https://wa.me/${number}?text=${encodeURIComponent(`Halo ${contact?.name}, saya ingin tanya tentang ${item.title} dari ${division?.name}.`)}` : "";
  return { division, contact, whatsappHref, contactHref: division ? `/unit/${division.slug}/kontak` : "/kontak" };
}

export function posterPeriod(item: Promotion) {
  const format = (value: string) => { const date = new Date(`${value}T12:00:00+07:00`); return Number.isNaN(date.getTime()) ? "Tanggal perlu diperbarui" : new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Jakarta" }).format(date); };
  if (item.startDate && item.endDate) return `${format(item.startDate)} sampai ${format(item.endDate)}`;
  if (item.startDate) return `Mulai ${format(item.startDate)}`;
  if (item.endDate) return `Sampai ${format(item.endDate)}`;
  return "Tanyakan ketersediaan terbaru kepada tim kami.";
}
