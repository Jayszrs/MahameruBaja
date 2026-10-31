import type { SiteContent } from "./siteContent";
import type { Division } from "./divisionCms";
import type { Article } from "./articles";
import { resolvedInventoryProducts } from "./inventory";
import { safeHttpsUrl, safeLocalAsset } from "./safeUrls";
import { jakartaDate } from "../lib/jakartaDate";
import { appearanceForSite } from "./websiteAppearance";

export type WebsitePhoto = { id: string; src: string; alt: string; title: string; categories: string[]; href: string; sourceName?: string; sourceUrl?: string };

/** Only published website records enter this collection; the upload store is never enumerated. */
export function collectWebsitePhotos(content: SiteContent, divisions: Division[], articles: Article[], today = jakartaDate()): WebsitePhoto[] {
  const photos = new Map<string, WebsitePhoto>();
  function add(src: string | undefined, title: string, category: string, href = "", alt = title, source?: { sourceName?: string; sourceUrl?: string }) {
    if (!src || !safeHttpsUrl(src) && !safeLocalAsset(src, ["images", "media", "api/cms/media", "api/articles/media"])) return;
    const existing = photos.get(src);
    if (existing) { if (!existing.categories.includes(category)) existing.categories.push(category); return; }
    photos.set(src, { id: `website-photo-${photos.size}`, src, title, alt, categories: [category], href, ...source });
  }
  for (const album of content.galleryProjects.filter(row => row.published)) {
    const category = album.kind === "design" ? "Referensi desain" : album.kind === "activity" ? "Kegiatan" : "Proyek";
    for (const photo of album.photos) add(photo.src, album.title, category, album.kind === "design" ? "/jasa#album-desain" : "/proyek", photo.alt, album.sourceUrl ? { sourceName: album.sourceName, sourceUrl: album.sourceUrl } : undefined);
  }
  const listed = new Set(content.inventory.filter(row => row.listed).map(row => row.productId));
  for (const product of resolvedInventoryProducts(content.inventory).filter(row => listed.has(row.id))) {
    for (const src of [product.image, ...product.images]) add(src, product.name, "Produk", `/produk/${product.slug}`);
  }
  for (const division of divisions) {
    add(division.hero, division.name, "Divisi & lokasi", `/unit/${division.slug}`);
    for (const photo of division.images) add(photo.src, photo.title || division.name, "Divisi & lokasi", `/unit/${division.slug}`, photo.title);
    add(division.routeMedia?.type === "image" ? division.routeMedia.media : division.routeMedia?.poster, division.name, "Divisi & lokasi", `/unit/${division.slug}`);
    add(division.logo, `Logo ${division.name}`, "Logo & identitas", `/unit/${division.slug}`);
  }
  for (const slide of content.heroSlides.filter(row => row.published !== false)) add(slide.type === "image" ? slide.media : slide.poster, slide.title, "Beranda", slide.primaryAction.href, slide.alt);
  for (const promo of content.promotions.filter(row => row.published && (!row.startDate || row.startDate <= today) && (!row.endDate || row.endDate >= today))) {
    for (const src of [promo.image, promo.imageDesktop, promo.imageMobile]) add(src, promo.title, "Promosi", promo.ctaHref, promo.imageAlt);
  }
  for (const article of articles) add(article.image, article.title, "Artikel", `/informasi/${article.slug}`, article.imageAlt || article.title);
  for (const post of content.socialPosts.filter(row => row.published)) add(post.image, post.title, "Sosial media", post.url);
  const appearances = [appearanceForSite(content.websiteAppearance), ...divisions.map(division => appearanceForSite(content.websiteAppearance, division.slug))];
  for (const row of appearances) {
    const href = row.ownerDivision ? `/unit/${row.ownerDivision}` : "/";
    add(row.brandLogo,"Logo Mahameru","Logo & identitas",href); add(row.footerImage,"Foto latar footer","Beranda",href); add(row.aboutHeroImage,"Profil Mahameru","Divisi & lokasi","/tentang-kami");
    add(row.featureImage, "Layanan Mahameru", "Beranda", href);
    add(row.calloutImage, "Hubungi Mahameru", "Beranda", href);
    for (const item of [...row.orderSteps, ...row.needs, ...row.quotes, ...row.services]) add(item.image, item.title, row.services.includes(item) ? "Layanan" : "Beranda", item.href || href, item.alt || item.title);
    for (const item of row.memberships) add(item.image, item.title, "Logo & identitas", href, item.alt || item.title);
  }
  for (const contact of content.contacts.filter(row => row.published)) add(contact.photo, contact.name, "Tim", "/kontak");
  for (const partner of content.partnerLogos.filter(row => row.published)) add(partner.logo, partner.name, "Logo & identitas", "/#klien");
  return [...photos.values()];
}
