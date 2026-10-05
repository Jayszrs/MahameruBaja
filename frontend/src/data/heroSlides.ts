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
    eyebrow: "Jasa laser cutting / Bekasi, Tambun & Cibitung",
    title: "Laser cutting Bekasi.",
    accent: "Dari gambar ke bentuk.",
    description: "Jasa laser cutting plat, CNC bending, dan fabrikasi custom. Kirim gambar serta spesifikasi Anda untuk ditinjau tim MBI.",
    primaryAction: { label: "Request laser cutting", href: "/laser-cutting#request" },
    secondaryAction: { label: "Lihat empat divisi", href: "/divisi" },
    objectPosition: "center 52%",
    visualNote: "Visual ilustrasi proses produksi",
  },
  {
    id: "cnc-bending",
    type: "image",
    media: "/images/cnc-bending-visual-v1.png",
    alt: "Ilustrasi pembentukan plat dengan mesin CNC bending",
    eyebrow: "CNC bending / Tekuk plat sesuai gambar",
    title: "Dari lembaran plat",
    accent: "ke bentuk kebutuhan.",
    description:
      "Konsultasikan tekukan, ukuran, material, dan jumlah. Proses CNC bending ditinjau bersama gambar kerja sebelum penawaran.",
    primaryAction: { label: "Konsultasi bending", href: "/laser-cutting#request" },
    secondaryAction: { label: "Lihat layanan MBI", href: "/unit/laser-cutting" },
    objectPosition: "center 54%",
    visualNote: "Visual ilustrasi proses bending",
  },
  {
    id: "fabrikasi",
    type: "image",
    media: "/images/steel-indonesia/plat-hitam.jpg",
    alt: "Material plat baja untuk kebutuhan fabrikasi",
    eyebrow: "Fabrikasi / Komponen custom & proyek",
    title: "Satu gambar kerja.",
    accent: "Beragam kebutuhan.",
    description:
      "Panel, ornamen, komponen, dan kebutuhan fabrikasi. Sampaikan desain agar tim meninjau cutting, bending, serta finishing yang dibutuhkan.",
    primaryAction: { label: "Bahas kebutuhan custom", href: "/laser-cutting#request" },
    secondaryAction: { label: "Lihat galeri", href: "/proyek" },
    objectPosition: "center 55%",
  },
  {
    id: "logistik-material",
    type: "image",
    media: "/images/hero-steel-warehouse-v2.png",
    alt: "Ilustrasi persediaan baja konstruksi di gudang",
    eyebrow: "Retail besi / Trading & supply proyek",
    title: "Material yang tepat.",
    accent: "Jalur yang terhubung.",
    description: "Rencanakan material, volume, dan waktu kebutuhan. Tim kami membantu menyiapkan alur penawaran dan pengiriman.",
    primaryAction: { label: "Rencanakan kebutuhan", href: "/minta-penawaran" },
    secondaryAction: { label: "Pilih divisi", href: "/divisi" },
    objectPosition: "center 50%",
    visualNote: "Visual ilustrasi material",
  },
];
