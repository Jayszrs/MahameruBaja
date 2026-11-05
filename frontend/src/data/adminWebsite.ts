import type { TextPage } from "./websiteTexts";
export type WebsiteSection = {
  id: string;
  label: string;
  editor: string;
  area?: string;
  anchor?: string;
  tab?: string;
  shared?: string;
  sourceSection?: string;
};
export type WebsiteWorkspace = {
  id: string;
  label: string;
  url: string;
  textPage: TextPage;
  sections: WebsiteSection[];
};
const section = (
  id: string,
  label: string,
  editor = "copy",
  area?: string,
  anchor?: string,
  tab?: string,
  shared?: string,
): WebsiteSection => ({ id, label, editor, area, anchor, tab, shared });
export const websiteWorkspaces: WebsiteWorkspace[] = [
  {
    id: "beranda",
    label: "Beranda",
    url: "/",
    textPage: "home",
    sections: [
      section(
        "header",
        "Header",
        "appearance",
        "HomePage",
        "header",
        "memberships",
      ),
      section(
        "hero",
        "Hero & teks berjalan",
        "hero",
        "HeroCarousel",
        "hero-beranda",
      ),
      section(
        "upvc",
        "Sorotan Atap UPVC",
        "copy",
        "UnifiedHomeContent",
        "upvc-home-highlight",
      ),
      section(
        "promo",
        "Promo & kegiatan",
        "promotions",
        "Promotions",
        "promo-beranda",
      ),
      section(
        "intro",
        "Mengenal Mahameru Group",
        "section",
        "UnifiedHomeContent",
        "profil",
      ),
      section(
        "laser",
        "Alur Jasa",
        "appearance",
        "UnifiedHomeContent",
        "alur-jasa",
        "homeFeatureSteps",
      ),
      section(
        "order",
        "Cara Pesan",
        "appearance",
        "UnifiedHomeContent",
        "cara-pesan",
        "orderSteps",
      ),
      section(
        "quotes",
        "Quote / kata mutiara",
        "appearance",
        "WebsiteQuotes",
        "quotes",
        "quotes",
      ),
      section(
        "faq",
        "Pertanyaan unit",
        "divisions",
        "UnifiedHomeContent",
        "faq-unit",
      ),
      section(
        "offerings",
        "Review Google Maps",
        "reviews",
        "UnifiedHomeContent",
        "layanan-unit",
      ),
      section(
        "suppliers",
        "Rekan & Supplier",
        "partners",
        "SocialProof",
        "supplier",
        "suppliers",
      ),
      section(
        "gallery",
        "Proyek yang Telah Dikerjakan",
        "gallery",
        "ProjectAlbums",
        "galeri-unit",
      ),
      section(
        "location",
        "Lokasi",
        "section",
        "divisionLocations",
        "location-heading",
      ),
      section(
        "callout",
        "Penutup",
        "copy",
        "UnifiedHomeContent",
        "cta-penutup",
      ),
      section(
        "network",
        "Jaringan Mahameru Group",
        "divisions",
        "HomePage",
        "pilih-divisi",
      ),
    ],
  },
  {
    id: "tentang",
    label: "Tentang Kami",
    url: "/tentang-kami",
    textPage: "about",
    sections: [
      section(
        "opening",
        "Pembuka Tentang Kami",
        "copy",
        "AboutMergedPage",
        "tentang-pembuka",
      ),
      section(
        "vision",
        "Visi dan Misi",
        "copy",
        "companyIdentity",
        "vision-heading",
      ),
      section(
        "engineering",
        "Cara Membantu",
        "section",
        "AboutMergedPage",
        "about-engineering",
      ),
      section(
        "divisions",
        "Mengenal Unit",
        "divisions",
        "divisionAbout",
        "divisi",
      ),
      section("reviews", "Ulasan pelanggan", "reviews", "SocialProof", "ulasan"),
      section("clients", "Perusahaan partner", "partners", "SocialProof", "klien", "clients"),
      section("suppliers", "Supplier material", "partners", "SocialProof", "supplier", "suppliers"),
    ],
  },
  {
    id: "produk",
    label: "Produk",
    url: "/produk",
    textPage: "products",
    sections: [
      section(
        "opening",
        "Pembuka Produk",
        "copy",
        "ProductsPage",
        "products-hero",
      ),
      section(
        "catalog",
        "Katalog, kategori & stok",
        "inventory",
        "ProductDetailPage",
      ),
    ],
  },
  {
    id: "jasa",
    label: "Jasa/Layanan",
    url: "/jasa",
    textPage: "services",
    sections: [
      section(
        "opening",
        "Hero Jasa",
        "copy",
        "LaserCuttingPage",
        "jasa-pembuka",
        undefined,
        "division",
      ),
      section(
        "guide",
        "Panduan cutting & bending",
        "copy",
        "LaserServiceGuide",
        "laser-guide-heading",
      ),
      section(
        "services",
        "Pilihan jasa",
        "copy",
        "LaserCuttingPage",
        "jasa-overview",
        undefined,
        "division",
      ),
      section(
        "technical",
        "Ruang lingkup",
        "copy",
        "LaserCuttingPage",
        "laser-cutting",
      ),
      section(
        "albums",
        "Jelajahi desain",
        "gallery",
        "ServiceAlbums",
        "album-desain",
        undefined,
        "division",
      ),
      section(
        "portfolio",
        "Portofolio hasil pekerjaan",
        "gallery",
        "ServiceAlbums",
        "portofolio-jasa",
        undefined,
        "division",
      ),
      section(
        "unit-cta",
        "Call to Action",
        "copy",
        "DivisionSubPage",
        "unit-service-cta",
        undefined,
        "division",
      ),
      section(
        "process",
        "Alur pekerjaan",
        "copy",
        "LaserCuttingPage",
        "jasa-proses",
      ),
      section(
        "request",
        "Form permintaan penawaran",
        "copy",
        "LaserCuttingPage",
        "request",
      ),
      section(
        "faq",
        "Pertanyaan laser cutting & bending",
        "copy",
        "LaserCuttingPage",
        "jasa-faq",
      ),
      section(
        "reviews",
        "Ulasan Google",
        "reviews",
        "SocialProof",
        "ulasan",
      ),
      section(
        "contact",
        "Alamat & kontak tim",
        "copy",
        "LocalBusinessDetails",
        "local-business-heading",
      ),
    ],
  },
  {
    id: "galeri",
    label: "Galeri",
    url: "/galeri",
    textPage: "gallery",
    sections: [
      section(
        "opening",
        "Pembuka Galeri",
        "copy",
        "GalleryPage",
        "galeri-pembuka",
        undefined,
        "division",
      ),
      section(
        "unit-photos",
        "Foto Galeri",
        "copy",
        "DivisionSubPage",
        "unit-gallery",
        undefined,
        "division",
      ),
      section(
        "albums",
        "Kategori & foto",
        "gallery",
        "WebsitePhotoGallery",
        "website-gallery",
        undefined,
        "division",
      ),
      section(
        "project-opening",
        "Pembuka album proyek",
        "copy",
        "ProjectsPage",
        "projects-hero-heading",
      ),
      section(
        "projects",
        "Album hasil pekerjaan",
        "gallery",
        "ProjectAlbums",
        "pengalaman-proyek",
      ),
      section(
        "cta",
        "Penutup Galeri",
        "copy",
        "ProjectsPage",
        "proyek-cta",
        undefined,
        "division",
      ),
    ],
  },
  {
    id: "artikel",
    label: "Artikel",
    url: "/informasi",
    textPage: "articles",
    sections: [
      section(
        "opening",
        "Pembuka Artikel",
        "articleIntro",
        "InformasiPage",
        "informasi-hero-heading",
      ),
      section(
        "articles",
        "Daftar & isi artikel",
        "articles",
        "CurrentArticle",
        "articles-heading",
      ),
      section("cta", "Penutup Artikel", "copy", "InformasiPage", "artikel-cta"),
    ],
  },
  {
    id: "kontak",
    label: "Kontak",
    url: "/kontak",
    textPage: "contact",
    sections: [
      section(
        "opening",
        "Pembuka Kontak",
        "copy",
        "KontakPage",
        "kontak-hero-heading",
      ),
      section(
        "contacts",
        "Kontak & WhatsApp",
        "contacts",
        "ContactDirectory",
        "tim-kontak",
        "contacts",
      ),
      section("store", "Informasi toko", "copy", "KontakPage", "informasi-toko"),
      section("form", "Formulir pesan", "copy", "KontakPage", "kontak-form-section"),
    ],
  },
  {
    id: "sosial",
    label: "Sosial Media",
    url: "/sosial-media",
    textPage: "social",
    sections: [
      section(
        "opening",
        "Pembuka Sosial Media",
        "copy",
        "SocialPageHero",
        "sosial-hero",
      ),
      section(
        "posts",
        "Unggahan sosial",
        "social",
        "SocialHub",
        "sosial",
        "posts",
      ),
      section(
        "accounts",
        "Akun sosial",
        "social",
        "SocialHub",
        "sosial",
        "accounts",
      ),
    ],
  },
  {
    id: "footer",
    label: "Footer",
    url: "/",
    textPage: "all",
    sections: [
      section("copy", "Tulisan Footer", "section", "Footer", "footer-cta"),
      section(
        "divisions",
        "Divisi Mahameru Baja",
        "footerDivisions",
        "FooterDivisions",
        "footer-divisi",
      ),
      section(
        "background",
        "Foto latar Footer",
        "footerBackground",
        "AppearanceEditor",
        "company-footer",
        "identity",
      ),
    ],
  },
];

export function publicSectionId(
  workspace: WebsiteWorkspace,
  selected: WebsiteSection,
) {
  if (workspace.id === "beranda")
    return (
      (
        {
          promo: "promotions",
          laser: "alur-jasa",
          network: "divisions",
          offerings: "offerings",
          faq: "faq",
          gallery: "albums",
        } as Record<string, string>
      )[selected.id] || selected.id
    );
  if (workspace.id === "produk" && selected.id === "copy") return "catalog";
  if (workspace.id === "artikel" && selected.id === "copy") return "articles";
  if (workspace.id === "sosial")
    return selected.id === "opening" ? "opening" : "social";
  if (workspace.id === "galeri" && selected.id === "unit-photos") return "unitGallery";
  return selected.id;
}
