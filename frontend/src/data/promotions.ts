import { z } from "zod";

const short = (max: number) => z.string().trim().max(max);
const image = short(1000).refine(value => !value || /^\/(?:images|media|uploads\/promotions)\/[a-zA-Z0-9/_ .-]+$/.test(value) || (() => { try { return new URL(value).protocol === "https:"; } catch { return false; } })(), "Gunakan gambar hasil unggahan, /images/..., atau URL HTTPS");
const date = z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]);

export const promotionDestinations = [
  ["/minta-penawaran", "Form permintaan penawaran"],
  ["/unit/retail-tambun", "Toko Mahameru Baja · Tambun"],
  ["/unit/retail-cibitung", "Toko Garuda Marginal Baja · Cibitung"],
  ["/unit/trading-proyek", "Suplai proyek MBI"],
  ["/unit/laser-cutting", "MBI Laser Cutting"],
  ["/unit/laser-cutting/kontak", "Admin MBI Laser Cutting"],
  ["/unit/fabrikasi-erection", "MBI Project Fabrikasi & Erection"],
] as const;

export const promotionSchema = z.object({
  id: short(80).min(1),
  label: short(60).min(1),
  title: short(120).min(1),
  summary: short(350).min(1),
  benefit: short(220),
  appliesTo: short(220),
  terms: short(500),
  image,
  imageAlt: short(160),
  startDate: date,
  endDate: date,
  ctaLabel: short(70).min(1),
  ctaHref: z.enum(promotionDestinations.map(([href]) => href) as [string, ...string[]]),
  published: z.boolean(),
}).superRefine((item, ctx) => {
  if (item.startDate && item.endDate && item.startDate > item.endDate) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "Tanggal selesai harus sesudah tanggal mulai" });
  if (item.published) {
    for (const key of ["benefit", "appliesTo", "terms", "image", "imageAlt"] as const) {
      if (!item[key]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: "Isi sebelum menerbitkan banner" });
    }
  }
});

export type Promotion = z.infer<typeof promotionSchema>;

// Banner momen yang tampil di beranda. CS mengubah isi, periode, dan
// syaratnya lewat admin promosi; gambar diganti lewat unggahan di sana.
export const samplePromotions: Promotion[] = [
  { id: "layanan-laser", label: "Layanan MBI", title: "Gambar kerja Anda. Kami bantu wujudkan.", summary: "Konsultasikan kebutuhan laser cutting dan CNC bending, dari komponen satuan hingga pekerjaan proyek.", benefit: "Review gambar, spesifikasi material, dan kebutuhan produksi sebelum penawaran.", appliesTo: "Kebutuhan laser cutting plat dan CNC bending.", terms: "Harga, kapasitas mesin, ketebalan material, dan jadwal dikonfirmasi setelah review teknis.", image: "/images/laser-cutting-illustration.jpg", imageAlt: "Ilustrasi mesin laser cutting plat", startDate: "", endDate: "", ctaLabel: "Konsultasi laser cutting", ctaHref: "/unit/laser-cutting/kontak", published: true },
  { id: "tema-merdeka", label: "Promo Kemerdekaan", title: "Merdeka belanja besi, lebih hemat!", summary: "Diskon hingga 17% untuk besi hollow, plat hitam, dan besi beton pilihan selama periode promo.", benefit: "Diskon hingga 17% untuk pembelian material pilihan.", appliesTo: "Besi hollow 40×40 dan 50×50, plat hitam 4×8×1,2 mm, besi beton 10 mm.", terms: "Periode 1–31 Agustus 2026. Stok dan harga promo terbatas. Syarat dan ketentuan berlaku.", image: "/images/promos/promo-kemerdekaan.png", imageAlt: "Stok besi di gudang dengan dekorasi merah putih", startDate: "", endDate: "", ctaLabel: "Tanya Promo", ctaHref: "/minta-penawaran", published: false },
  { id: "tema-ramadan", label: "Persiapan Ramadan", title: "Siapkan material sebelum proyek berjalan.", summary: "Potongan harga hingga 15% untuk material pilihan selama Ramadan.", benefit: "Potongan harga hingga 15% untuk material pilihan.", appliesTo: "Besi hollow 40×40×1,6 mm, pipa hitam 2 inch, plat hitam 4×8×1,2 mm, besi beton 10 mm.", terms: "Periode 1–31 Maret 2026. Promo berlaku selama persediaan masih ada.", image: "/images/promos/promo-ramadan.png", imageAlt: "Stok besi di gudang dengan lampion Ramadan", startDate: "", endDate: "", ctaLabel: "Lihat Material Promo", ctaHref: "/unit/retail-tambun", published: false },
  { id: "promo-proyek", label: "Promo Supply Proyek", title: "Belanja lebih banyak, harga lebih ringan.", summary: "Harga khusus untuk pembelian material proyek mulai 50 batang.", benefit: "Potongan 3–7% untuk pembelian 50 batang atau lebih.", appliesTo: "Hollow, pipa, besi beton, dan plat pilihan. Minimal 50 batang.", terms: "Periode 1–30 September 2026. 50 batang potongan 3%, 100 batang 5%, 250 batang 7%, 500 batang atau lebih hubungi tim.", image: "/images/steel-indonesia/besi-beton.jpg", imageAlt: "Besi beton untuk kebutuhan proyek", startDate: "", endDate: "", ctaLabel: "Minta Harga Proyek", ctaHref: "/unit/trading-proyek", published: false },
  { id: "promo-laser", label: "Promo MBI Laser Cutting", title: "Potong plat lebih banyak, biaya per lembar lebih hemat.", summary: "Harga khusus untuk pemesanan laser cutting mulai 11 lembar.", benefit: "Diskon 5–15% untuk pemesanan 11 lembar atau lebih.", appliesTo: "Material dan ketebalan plat tertentu. Minimal 11 lembar.", terms: "Periode 1–30 November 2026. 11–25 lembar diskon 5%, 26–50 lembar 10%, 51 lembar atau lebih 15%.", image: "/images/cnc-bending-visual-v1.png", imageAlt: "Ilustrasi proses tekuk plat", startDate: "", endDate: "", ctaLabel: "Kirim Gambar", ctaHref: "/unit/laser-cutting", published: false },
];
