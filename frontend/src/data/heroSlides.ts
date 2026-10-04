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
    id: "retail-tambun",
    type: "image",
    media: "/images/hero-steel-warehouse-v2.png",
    alt: "Ilustrasi persediaan baja konstruksi di gudang",
    eyebrow: "Retail material / Tambun Selatan",
    title: "Baja untuk membangun",
    accent: "lebih jauh.",
    description:
      "Material konstruksi, konsultasi kebutuhan, dan akses langsung ke tim Mahameru Baja dalam satu alur yang sederhana.",
    primaryAction: { label: "Jelajahi material", href: "/produk" },
    secondaryAction: { label: "Minta penawaran", href: "/minta-penawaran" },
    objectPosition: "center 54%",
    visualNote: "Visual ilustrasi material",
  },
  {
    id: "supply-proyek",
    type: "image",
    media: "/images/steel-indonesia/toko-mahameru.jpg",
    alt: "Aktivitas pengiriman material di Toko Besi Mahameru Baja",
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
    id: "logistik-material",
    type: "image",
    media: "/images/hero-steel-logistics-v1.png",
    alt: "Ilustrasi pengiriman baja konstruksi dari gudang",
    eyebrow: "Pengiriman / kebutuhan proyek",
    title: "Dari stok",
    accent: "sampai lokasi.",
    description: "Rencanakan material, volume, dan waktu kebutuhan. Tim kami membantu menyiapkan alur penawaran dan pengiriman.",
    primaryAction: { label: "Rencanakan kebutuhan", href: "/minta-penawaran" },
    secondaryAction: { label: "Lihat layanan", href: "/layanan" },
    objectPosition: "center 50%",
    visualNote: "Visual ilustrasi pengiriman",
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
