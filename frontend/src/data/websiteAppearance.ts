import { z } from "zod";
import { contentOwner, ownershipFields } from "./divisionCms";
import { safeInternalLink, safeHttpsUrl, safeLocalAsset } from "./safeUrls";

const image = z.string().trim().max(1000).refine(value => !value || safeLocalAsset(value, ["images", "media", "api/cms/media"]) || safeHttpsUrl(value), "Pilih gambar atau URL HTTPS.");
const link = z.string().trim().max(500).refine(value => !value || safeInternalLink(value), "Gunakan tautan halaman website, misalnya /jasa#request.");
const item = z.object({ id: z.string().min(1).max(100), title: z.string().trim().min(1).max(160), text: z.string().trim().max(500), image, alt: z.string().trim().max(200), href: link });
export const websiteAppearanceSchema = z.object({
  ...ownershipFields, id: z.string().min(1).max(100), published: z.boolean(),
  featureImage: image, calloutImage: image,
  orderSteps: z.array(item).max(8), needs: z.array(item).max(12),
  quotes: z.array(item).max(36), services: z.array(item).max(12),
  memberships: z.array(item).max(6),
}).superRefine((row, ctx) => {
  for (const key of ["orderSteps", "needs", "quotes", "services", "memberships"] as const) {
    if (new Set(row[key].map(item => item.id)).size !== row[key].length) ctx.addIssue({ code: "custom", path: [key], message: "ID harus unik." });
  }
  row.needs.forEach((item, index) => { if (!item.href) ctx.addIssue({ code: "custom", path: ["needs", index, "href"], message: `Isi tautan tujuan untuk pertanyaan “${item.title}”.` }); });
});
export type WebsiteAppearance = z.infer<typeof websiteAppearanceSchema>;
export type AppearanceItem = WebsiteAppearance["orderSteps"][number];
export type AppearanceList = "orderSteps" | "needs" | "quotes" | "services" | "memberships";
const entry = (id: string, title: string, text = "", image = "", href = "", alt = ""): AppearanceItem => ({ id, title, text, image, href, alt });

export function defaultAppearance(owner: string | null = null): WebsiteAppearance {
  const quote = owner ? `/minta-penawaran?unit=${owner}` : "/minta-penawaran";
  return {
    id: `appearance-${owner || "main"}`, ownerDivision: owner, published: true,
    featureImage: "", calloutImage: "",
    orderSteps: [
      entry("choose", "Pilih kebutuhan", "Material atau jasa? Pilih tim yang sesuai.", "/images/order/choose.svg", owner ? `/unit/${owner}/kontak` : "/#pilih-divisi", "Ilustrasi pilihan material dan jasa"),
      entry("send", "Kirim daftar atau desain", "Sertakan ukuran, bahan, jumlah, dan lokasi.", "/images/order/send.svg", quote, "Ilustrasi gambar kerja dan daftar kebutuhan"),
      entry("review", "Cek penawaran", "Periksa spesifikasi, harga, dan jadwal bersama tim.", "/images/order/review.svg", quote, "Ilustrasi pemeriksaan penawaran"),
      entry("confirm", "Konfirmasi pesanan", "Sepakati pesanan, lalu atur pengerjaan atau pengiriman.", "/images/order/confirm.svg", quote, "Ilustrasi pengiriman material"),
    ],
    needs: owner ? [entry("consult", "Saya ingin konsultasi kebutuhan", "", "", `/unit/${owner}/kontak`), entry("request", "Saya sudah punya daftar atau gambar", "", "", quote)] : [
      entry("retail", "Saya mau beli besi satuan di Tambun", "", "", "/unit/retail-tambun"),
      entry("garuda", "Saya cari hollow, pipa, atau plat di Cibitung", "", "", "/unit/retail-cibitung"),
      entry("supply", "Saya butuh WF, plat, atau material proyek", "", "", "/unit/trading-proyek"),
      entry("laser", "Saya mau potong atau tekuk plat sesuai gambar", "", "", "/jasa#request"),
      entry("fabrication", "Saya ingin konsultasi fabrikasi dan erection", "", "", "/unit/fabrikasi-erection/kontak"),
      entry("upvc", "Saya ingin tanya atap UPVC Atlas", "", "", "/produk?kategori=atap-upvc"),
    ],
    quotes: [entry("mahameru", "Satu Mahameru, satu solusi.", "Mahameru Baja Indonesia")],
    memberships: [entry("issc", "Member of ISSC", "Indonesian Society of Steel Construction", "/images/partners/issc.webp"), entry("api", "Member of API")],
    services: [
      entry("laser", "Laser cutting plat & custom", "Potong plat sesuai gambar kerja untuk ornamen, panel, dan komponen custom.", "/images/laser-cutting-illustration.jpg", "/jasa#request", "Ilustrasi laser cutting plat"),
      entry("bending", "Bending & tekuk plat", "Tekuk plat sesuai ukuran dan sudut pada gambar kerja.", "/images/cnc-bending-visual-v1.png", "/jasa#request", "Ilustrasi proses bending"),
      entry("fabrication", "Fabrikasi & finishing", "Perakitan, pengelasan, dan finishing sesuai ruang lingkup pekerjaan.", "/images/steel-indonesia/plat-hitam.jpg", "/unit/fabrikasi-erection/kontak", "Material plat baja"),
      entry("project", "Produksi & pekerjaan proyek", "Diskusikan spesifikasi, jumlah, dan jadwal pekerjaan proyek.", "/images/hero-steel-logistics-v1.png", "/minta-penawaran", "Ilustrasi pengadaan material proyek"),
      entry("sandblasting", "Sandblasting", "Konsultasikan pembersihan permukaan baja sebelum proses pelapisan.", "", "/unit/fabrikasi-erection/kontak"),
    ],
  };
}
export function appearanceForSite(rows: WebsiteAppearance[] = [], owner?: string | null): WebsiteAppearance {
  return rows.find(row => row.published && contentOwner(row) === (owner || null)) || defaultAppearance(owner || null);
}
