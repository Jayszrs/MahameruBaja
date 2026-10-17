import { divisionSlugSchema, ownershipFields } from "./divisionCms";
import { z } from "zod";
import { safeHttpsUrl, safeInternalLink, safeLocalAsset } from "./safeUrls";
const mediaUrl = z.string().max(1000).refine(v => safeLocalAsset(v, ["images", "videos", "uploads", "media", "api/cms/media"]) || safeHttpsUrl(v), "Gunakan media lokal atau URL HTTPS");
const action = z.object({ label: z.string().trim().min(1).max(70), href: z.string().max(200).refine(safeInternalLink, "Gunakan tujuan di dalam website.") });
export const heroSlideSchema = z.object({ ...ownershipFields, published: z.boolean().optional(), id: z.string().min(1).max(80), type: z.enum(["image", "video"]), media: mediaUrl, poster: mediaUrl.optional(), alt: z.string().trim().min(1).max(160), eyebrow: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(100), accent: z.string().trim().max(100), description: z.string().trim().min(1).max(500), primaryAction: action, secondaryAction: action, objectPosition: z.string().max(40).optional(), visualNote: z.string().max(100).optional() });
export type HeroSlide = { ownerDivision?: string | null; audience?: string[]; published?: boolean;
  id: string;
  type: "image" | "video";
  media: string;
  poster?: string;
  alt: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction: { label: string; href: string };
  objectPosition?: string;
  visualNote?: string;
};

/**
 * Data ini sengaja dipisahkan agar nantinya mudah diganti oleh respons CMS.
 * Untuk video, gunakan type: "video", media: "/videos/nama-file.mp4", dan
 * isi poster dengan gambar fallback berukuran 16:9.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "laser-cutting",
    type: "image",
    media: "/images/laser-cutting-illustration.jpg",
    alt: "Ilustrasi proses laser cutting plat logam",
    eyebrow: "Jasa Laser Cutting Plat",
    title: "Plat perlu dipotong",
    accent: "sesuai gambar?",
    description: "Kirim gambar kerja, jenis dan ketebalan plat, serta jumlah yang dibutuhkan. Tim MBI akan meninjau spesifikasi dan menyiapkan penawaran.",
    primaryAction: { label: "Konsultasi Laser Cutting", href: "/jasa#request" },
    secondaryAction: { label: "Lihat Layanan", href: "/jasa" },
    objectPosition: "center 52%",
    visualNote: "Visual ilustrasi proses produksi",
  },
  {
    id: "cnc-bending",
    type: "image",
    media: "/images/cnc-bending-visual-v1.png",
    alt: "Ilustrasi pembentukan plat dengan mesin bending",
    eyebrow: "Jasa Bending",
    title: "Butuh plat dengan bentuk",
    accent: "tekukan tertentu?",
    description:
      "Sampaikan ukuran, ketebalan material, sudut tekukan, dan gambar kerja Anda. Tim MBI akan memeriksa kebutuhan pengerjaan sebelum memberikan penawaran.",
    primaryAction: { label: "Konsultasi Bending", href: "/jasa#request" },
    secondaryAction: { label: "Kirim Gambar Kerja", href: "/jasa#request" },
    objectPosition: "center 54%",
    visualNote: "Visual ilustrasi proses bending",
  },
  {
    id: "fabrikasi",
    type: "image",
    media: "/images/steel-indonesia/plat-hitam.jpg",
    alt: "Material plat baja untuk kebutuhan fabrikasi",
    eyebrow: "Fabrikasi & Erection",
    title: "Punya gambar struktur atau komponen",
    accent: "yang perlu dibuat?",
    description:
      "Diskusikan gambar, spesifikasi material, volume pekerjaan, lokasi, dan jadwal yang direncanakan bersama tim MBI Project.",
    primaryAction: { label: "Konsultasi Proyek", href: "/jasa#request" },
    secondaryAction: { label: "Lihat Hasil Pekerjaan", href: "/proyek" },
    objectPosition: "center 55%",
  },
  {
    id: "logistik-material",
    type: "image",
    media: "/images/hero-steel-warehouse-v2.png",
    alt: "Ilustrasi persediaan baja konstruksi di gudang",
    eyebrow: "Retail Besi & Supply Proyek",
    title: "Cari besi",
    accent: "untuk toko atau proyek?",
    description: "Kirim daftar kebutuhan besi Anda, lengkap dengan ukuran, jumlah, lokasi, dan jadwal pengiriman. Tim kami akan membantu mengecek stok dan menyiapkan penawaran.",
    primaryAction: { label: "Minta penawaran material", href: "/minta-penawaran" },
    secondaryAction: { label: "Pilih divisi", href: "#pilih-divisi" },
    objectPosition: "center 50%",
    visualNote: "Visual ilustrasi material",
  },
];
