import { z } from "zod";
const mediaUrl = z.string().max(1000).refine(v => /^\/(?:images|videos|uploads|media)\/[\w/ .-]+$/.test(v) || (() => { try { return new URL(v).protocol === "https:"; } catch { return false; } })(), "Gunakan media lokal atau URL HTTPS");
const action = z.object({ label: z.string().trim().min(1).max(70), href: z.string().max(200).regex(/^(?:\/(?!\/)|#)/) });
export const heroSlideSchema = z.object({ id: z.string().min(1).max(80), type: z.enum(["image", "video"]), media: mediaUrl, poster: mediaUrl.optional(), alt: z.string().trim().min(1).max(160), eyebrow: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(100), accent: z.string().trim().max(100), description: z.string().trim().min(1).max(500), primaryAction: action, secondaryAction: action, objectPosition: z.string().max(40).optional(), visualNote: z.string().max(100).optional() });
export type HeroSlide = {
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
    eyebrow: "Laser Cutting",
    title: "Butuh potong plat",
    accent: "sesuai gambar?",
    description: "Kirim gambar dan spesifikasi yang Anda punya. MBI Laser Cutting melayani laser cutting, CNC bending, dan fabrikasi untuk kebutuhan custom maupun proyek.",
    primaryAction: { label: "Kirim gambar kerja", href: "/jasa#request" },
    secondaryAction: { label: "Pilih divisi", href: "#pilih-divisi" },
    objectPosition: "center 52%",
    visualNote: "Visual ilustrasi proses produksi",
  },
  {
    id: "cnc-bending",
    type: "image",
    media: "/images/cnc-bending-visual-v1.png",
    alt: "Ilustrasi pembentukan plat dengan mesin CNC bending",
    eyebrow: "CNC Bending",
    title: "Perlu plat ditekuk",
    accent: "sesuai bentuk?",
    description:
      "Kirim gambar, ukuran, material, dan ketebalan plat. Tim kami akan mengecek kebutuhan pengerjaan dan menyiapkan penawaran.",
    primaryAction: { label: "Kirim kebutuhan bending", href: "/jasa#request" },
    secondaryAction: { label: "Kenali layanan potong & tekuk", href: "/unit/laser-cutting" },
    objectPosition: "center 54%",
    visualNote: "Visual ilustrasi proses bending",
  },
  {
    id: "fabrikasi",
    type: "image",
    media: "/images/steel-indonesia/plat-hitam.jpg",
    alt: "Material plat baja untuk kebutuhan fabrikasi",
    eyebrow: "Fabrikasi & Komponen Custom",
    title: "Punya gambar,",
    accent: "kami bantu buatkan.",
    description:
      "Untuk panel, ornamen, hingga komponen logam custom. Kirim gambar dan jumlah kebutuhan Anda. Tim kami akan membantu menghitung dan menyiapkan penawaran.",
    primaryAction: { label: "Kirim gambar dan jumlah", href: "/jasa#request" },
    secondaryAction: { label: "Kenali layanan fabrikasi", href: "/unit/laser-cutting" },
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
    description: "Kirim daftar kebutuhan Anda. Sebutkan material, ukuran, jumlah, lokasi, dan waktu pengiriman. Kami bantu siapkan penawarannya.",
    primaryAction: { label: "Minta penawaran material", href: "/minta-penawaran" },
    secondaryAction: { label: "Pilih divisi", href: "#pilih-divisi" },
    objectPosition: "center 50%",
    visualNote: "Visual ilustrasi material",
  },
];
