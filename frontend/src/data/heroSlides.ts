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
};

/**
 * Data ini sengaja dipisahkan agar nantinya mudah diganti oleh respons CMS.
 * Untuk video, gunakan type: "video", media: "/videos/nama-file.mp4", dan
 * isi poster dengan gambar fallback berukuran 16:9.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "retail-tambun",
    type: "image",
    media: "/images/steel-indonesia/toko-mahameru.jpg",
    alt: "Toko Besi Mahameru Baja di Tambun Selatan, Bekasi",
    eyebrow: "Retail material / Tambun Selatan",
    title: "Baja untuk membangun",
    accent: "lebih jauh.",
    description:
      "Material konstruksi, konsultasi kebutuhan, dan akses langsung ke tim Mahameru Baja dalam satu alur yang sederhana.",
    primaryAction: { label: "Jelajahi material", href: "/produk" },
    secondaryAction: { label: "Minta penawaran", href: "/minta-penawaran" },
    objectPosition: "center 48%",
  },
  {
    id: "supply-proyek",
    type: "image",
    media: "/images/steel-indonesia/wiremesh.jpg",
    alt: "Persediaan wiremesh untuk kebutuhan konstruksi dan proyek",
    eyebrow: "Trading / Supply proyek",
    title: "Material proyek.",
    accent: "Satu jalur yang jelas.",
    description:
      "Kirim daftar material, volume, lokasi, dan target pengiriman. Tim kami membantu pengecekan kebutuhan hingga penawaran.",
    primaryAction: { label: "Request kebutuhan proyek", href: "/minta-penawaran?unit=trading-proyek" },
    secondaryAction: { label: "Lihat katalog", href: "/produk" },
    objectPosition: "center 55%",
  },
  {
    id: "laser-cutting",
    type: "image",
    media: "/images/laser-cutting-illustration.jpg",
    alt: "Proses laser cutting presisi untuk komponen logam",
    eyebrow: "Laser cutting / CNC bending",
    title: "Dari gambar kerja",
    accent: "menuju hasil presisi.",
    description:
      "Unggah desain, pilih material dan ketebalan, lalu lanjutkan ke review teknis, penawaran, produksi, dan quality control.",
    primaryAction: { label: "Kirim desain", href: "/laser-cutting#request" },
    secondaryAction: { label: "Lihat kapabilitas", href: "/laser-cutting" },
    objectPosition: "center 52%",
  },
];
