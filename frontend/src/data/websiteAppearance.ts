import { z } from "zod";
import { contentOwner, ownershipFields } from "./divisionCms";
import { safeInternalLink, safeHttpsUrl, safeLocalAsset } from "./safeUrls";
import { defaultServicePaths, defaultServiceWorkflow } from "./serviceContent";
import { divisions } from "./divisionContent";
import { homeSections, serviceSections } from "./pageVisibility";

const image = z.string().trim().max(1000).refine(value => !value || safeLocalAsset(value, ["images", "media", "api/cms/media"]) || safeHttpsUrl(value), "Pilih gambar atau URL HTTPS.");
const link = z.string().trim().max(500).refine(value => !value || safeInternalLink(value), "Gunakan tautan halaman website, misalnya /jasa#request.");
const item = z.object({ id: z.string().min(1).max(100), title: z.string().trim().min(1).max(160), text: z.string().trim().max(500), image, alt: z.string().trim().max(200), href: link, ctaLabel:z.string().trim().max(80).optional() });
const orderHelpCard = item.extend({ href: z.string().trim().max(500).refine(value => value === "whatsapp" || !value || safeInternalLink(value), "Pilih tujuan halaman atau WhatsApp.") });
export const websiteAppearanceSchema = z.object({
  ...ownershipFields, id: z.string().min(1).max(100), published: z.boolean(),
  featureImage: image, calloutImage: image,
  brandLogo:image.default(""),footerImage:image.default(""),aboutHeroImage:image.default(""),
  productHeroImage:image.default(""),
  serviceHeroImage:image.default(""),
  featureEyebrow:z.string().trim().max(160).optional(),
  featureTitle:z.string().trim().max(300).optional(),
  featureText:z.string().trim().max(2000).optional(),
  homeFeatureSteps:z.array(item).max(12).optional(),
  orderHelpCards:z.array(orderHelpCard).max(2).optional(),
  servicePaths:z.array(item).max(16).default(defaultServicePaths),
  serviceWorkflow:z.array(item).max(12).default(defaultServiceWorkflow),
  hiddenHomeSections:z.array(z.enum(homeSections.map(section=>section.id) as [string,...string[]])).max(20).default([]),
  hiddenServiceSections:z.array(z.enum(serviceSections.map(section=>section.id) as [string,...string[]])).max(12).default([]),
  orderSteps: z.array(item).max(8), needs: z.array(item).max(12),
  quotes: z.array(item).max(36), services: z.array(item).max(12),
  memberships: z.array(item).max(6),
}).superRefine((row, ctx) => {
  for (const key of ["orderSteps", "orderHelpCards", "needs", "quotes", "services", "memberships", "servicePaths", "serviceWorkflow", "homeFeatureSteps"] as const) {
    const items = row[key] || [];
    if (new Set(items.map(item => item.id)).size !== items.length) ctx.addIssue({ code: "custom", path: [key], message: "ID harus unik." });
  }
  row.needs.forEach((item, index) => { if (!item.href) ctx.addIssue({ code: "custom", path: ["needs", index, "href"], message: `Isi tautan tujuan untuk pertanyaan “${item.title}”.` }); });
});
export type WebsiteAppearance = z.infer<typeof websiteAppearanceSchema>;
export type AppearanceItem = WebsiteAppearance["orderSteps"][number];
export type AppearanceList = "orderSteps" | "orderHelpCards" | "needs" | "quotes" | "services" | "memberships" | "servicePaths" | "serviceWorkflow" | "homeFeatureSteps";
const entry = (id: string, title: string, text = "", image = "", href = "", alt = ""): AppearanceItem => ({ id, title, text, image, href, alt });

export function defaultAppearance(owner: string | null = null): WebsiteAppearance {
  const quote = owner ? `/minta-penawaran?unit=${owner}` : "/minta-penawaran";
  const division = divisions.find(value => value.slug === owner);
  return {
    id: `appearance-${owner || "main"}`, ownerDivision: owner, published: true,
    featureImage: "", calloutImage: "",
    brandLogo:"",footerImage:"",aboutHeroImage:"",productHeroImage:"",
    serviceHeroImage:"", servicePaths:structuredClone(defaultServicePaths), serviceWorkflow:structuredClone(defaultServiceWorkflow),
    featureEyebrow:division?.label || "LASER CUTTING & BENDING",
    featureTitle:division?.title || "Jasa laser cutting & bending plat di Tambun dan Bekasi",
    featureText:division?.intro || "Kirim gambar DWG, DXF, atau PDF beserta jenis material, ketebalan, ukuran, dan jumlah. Tim meninjau proses sebelum memberi penawaran.",
    homeFeatureSteps:(division?.offerings.slice(0,6) || ["Siapkan desain", "Review", "Penawaran", "Cutting", "Bending", "QC"]).map((title,index)=>entry(`feature-${owner || "main"}-${index}`,title)),
    hiddenHomeSections:[],hiddenServiceSections:[],
    orderSteps: [
      { ...entry("choose", "Pilih kebutuhan", "Mau beli besi atau pakai jasa?", "/images/order/choose.svg", owner ? `/unit/${owner}/kontak` : "/#pilih-divisi", "Ilustrasi pilihan material dan jasa"), ctaLabel:"Pilih kebutuhan" },
      { ...entry("send", "Kirim daftar / desain", "Kirim ukuran, bahan, dan jumlahnya.", "/images/order/send.svg", quote, "Ilustrasi gambar kerja dan daftar kebutuhan"), ctaLabel:"Kirim kebutuhan" },
      { ...entry("review", "Cek harganya", "Cocokkan harga dan jadwal dengan tim.", "/images/order/review.svg", quote, "Ilustrasi pemeriksaan penawaran"), ctaLabel:"Hubungi tim" },
      { ...entry("confirm", "Oke? Kami proses.", "Sepakat, lalu dikerjakan atau dikirim.", "/images/order/confirm.svg", quote, "Ilustrasi pengiriman material"), ctaLabel:"Hubungi tim" },
    ],
    orderHelpCards: [
      { ...entry("order-help-quote", "Sudah punya daftar atau gambar?", "Langsung kirim daftar atau desainnya.", "", owner ? quote : "/minta-penawaran"), ctaLabel:"Kirim permintaan penawaran" },
      { ...entry("order-help-whatsapp", "Masih ingin berdiskusi?", "Ceritakan kebutuhan Anda lewat WhatsApp.", "", "whatsapp"), ctaLabel:"Tanya lewat WhatsApp" },
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
    memberships: [entry("issc", "Member of ISSC", "Indonesian Society of Steel Construction", "/images/partners/issc.webp"), entry("api", "Member of APPI", "Asosiasi Pengusaha Pengelasan Indonesia", "/images/partners/appi.webp", "", "Logo APPI — Asosiasi Pengusaha Pengelasan Indonesia")],
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
  const fallback = defaultAppearance(owner || null);
  const row = rows.find(value => value.published && contentOwner(value) === (owner || null));
  return row ? { ...fallback, ...row, featureEyebrow: row.featureEyebrow ?? fallback.featureEyebrow, featureTitle: row.featureTitle ?? fallback.featureTitle, featureText: row.featureText ?? fallback.featureText, homeFeatureSteps: row.homeFeatureSteps ?? fallback.homeFeatureSteps, orderHelpCards: row.orderHelpCards ?? fallback.orderHelpCards } : fallback;
}
