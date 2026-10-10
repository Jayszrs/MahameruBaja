import { tradingProducts } from "./companyIdentity";
export const divisions = [
  {
    slug: "retail-tambun", name: "Mahameru Baja", label: "Retail Tambun", area: "Tambun Selatan, Bekasi",
    title: "Toko besi Tambun untuk kebutuhan yang beragam.",
    intro: "Cari material, kirim ukuran dan jumlah, lalu konfirmasi stok serta harga terbaru bersama tim toko.",
    description: "Mahameru Baja melayani kebutuhan besi dan material konstruksi untuk renovasi, bangunan, bengkel, dan proyek di Tambun Selatan. Pilih produk dari katalog dan tanyakan spesifikasi yang sesuai sebelum memesan.",
    hero: "/images/steel-indonesia/toko-mahameru.jpg",
    images: [
      { src: "/images/steel-indonesia/besi-beton.jpg", title: "Besi beton" },
      { src: "/images/steel-indonesia/hollow.jpg", title: "Besi hollow" },
      { src: "/images/steel-indonesia/pipa-hitam.jpg", title: "Pipa besi" },
    ],
    offerings: ["Besi beton & wiremesh", "Hollow, pipa & siku", "Plat, WF, CNP & UNP", "Bondek, spandek & baja ringan"],
    process: ["Pilih material dari katalog", "Kirim ukuran dan jumlah", "Konfirmasi stok, harga, serta pengiriman"],
    faq: [
      { question: "Apakah harga di katalog sudah final?", answer: "Harga material dapat berubah. Mintalah konfirmasi stok dan harga terbaru sebelum pemesanan." },
      { question: "Apakah beberapa produk bisa ditanyakan sekaligus?", answer: "Bisa. Sertakan nama produk, ukuran, jumlah, dan lokasi kebutuhan dalam satu permintaan." },
    ],
    primary: { label: "Lihat katalog material", href: "/produk" }, quote: "/minta-penawaran?unit=retail-tambun",
  },
  {
    slug: "retail-cibitung", name: "Garuda Marginal Baja", label: "Retail Cibitung", area: "Cibitung dan sekitarnya",
    title: "Jalur material untuk Cibitung.",
    intro: "Konsultasikan kebutuhan besi, plat, dan profil baja untuk pekerjaan di Cibitung melalui divisi retail Garuda Marginal Baja.",
    description: "Garuda Marginal Baja adalah jalur retail untuk pelanggan di Cibitung dan kawasan sekitarnya. Kunjungi toko kami di Jl. Kp. Rw. Lele, RT.02/RW.05, Wanajaya, Cibitung. Tim membantu pengecekan spesifikasi, stok, harga, dan pengiriman sebelum pesanan dikonfirmasi.",
    hero: "/images/steel-indonesia/hollow.jpg",
    images: [
      { src: "/images/steel-indonesia/plat-hitam.jpg", title: "Plat besi" },
      { src: "/images/steel-indonesia/wiremesh.jpg", title: "Wiremesh" },
      { src: "/images/steel-indonesia/besi-beton.jpg", title: "Besi beton" },
    ],
    offerings: ["Profil & besi hollow", "Plat dan pipa baja", "Besi beton & wiremesh", "Konsultasi kebutuhan material"],
    process: ["Cari kategori material", "Kirim ukuran, jumlah, dan lokasi Cibitung", "Dapatkan konfirmasi dari tim"],
    faq: [
      { question: "Apakah katalog Cibitung berbeda?", answer: "Pilihan produk dapat dilihat di katalog bersama. Ketersediaan khusus unit Cibitung dikonfirmasi oleh tim." },
      { question: "Di mana lokasi unit Cibitung?", answer: "Toko kami berada di Jl. Kp. Rw. Lele, RT.02/RW.05, Wanajaya, Cibitung, Kabupaten Bekasi 17520. Buka pin Google Maps pada bagian Lokasi dan hubungi admin untuk jam kunjungan." },
    ],
    primary: { label: "Lihat pilihan material", href: "/produk" }, quote: "/minta-penawaran?unit=retail-cibitung",
  },
  {
    slug: "trading-proyek", name: "MBI Trading", label: "Trading & supply proyek", area: "Tambun Selatan, Bekasi",
    title: "Pengadaan material proyek dengan alur yang jelas.",
    intro: "Kirim daftar material, spesifikasi, volume, lokasi, serta target waktu. Tim meninjau permintaan sebelum membuat penawaran.",
    description: "Mahameru Baja Indonesia menangani kebutuhan trading dan suplai material untuk proyek. Pengadaan volume besar memerlukan pengecekan stok, penawaran, dokumen pemesanan, serta koordinasi pengiriman. Informasi lengkap sejak awal membantu tim menyiapkan tindak lanjut yang tepat.",
    hero: "/images/hero-steel-logistics-v1.png",
    images: [
      { src: "/images/steel-indonesia/wiremesh.jpg", title: "Wiremesh proyek" },
      { src: "/images/steel-indonesia/plat-hitam.jpg", title: "Plat baja" },
      { src: "/images/steel-indonesia/besi-beton.jpg", title: "Besi beton" },
    ],
    offerings: tradingProducts,
    process: ["Kirim daftar material dan lokasi", "Review stok atau pengadaan", "Setujui penawaran dan jadwal"],
    faq: [
      { question: "Bisa mengirim banyak item material?", answer: "Bisa. Kirim daftar barang, spesifikasi, ukuran, jumlah, lokasi proyek, dan tanggal kebutuhan." },
      { question: "Apakah pengiriman dapat bertahap?", answer: "Jadwal pengiriman dibahas berdasarkan ketersediaan material, lokasi, dan kesepakatan penawaran." },
    ],
    primary: { label: "Kirim kebutuhan proyek", href: "/minta-penawaran?unit=trading-proyek" }, quote: "/minta-penawaran?unit=trading-proyek",
  },
  {
    slug: "laser-cutting", name: "MBI Laser Cutting & Bending", label: "Laser cutting & CNC bending", area: "Tambun Selatan, Bekasi",
    title: "Jasa laser cutting plat dari gambar ke komponen.",
    intro: "Mulai dari gambar kerja. Tim meninjau material, ketebalan, ukuran, jumlah, serta proses cutting dan bending sebelum penawaran.",
    description: "MBI Laser Cutting melayani konsultasi jasa laser cutting plat, CNC bending, komponen custom, panel, ornamen, dan fabrikasi di area Bekasi. Setiap permintaan ditinjau berdasarkan gambar teknik agar kelayakan proses, harga, dan jadwal dapat dikonfirmasi secara bertanggung jawab.",
    hero: "/images/laser-cutting-illustration.jpg",
    images: [
      { src: "/images/laser-cutting-illustration.jpg", title: "Ilustrasi laser cutting" },
      { src: "/images/cnc-bending-visual-v1.png", title: "Ilustrasi CNC bending" },
      { src: "/images/steel-indonesia/plat-hitam.jpg", title: "Material plat" },
    ],
    offerings: ["Laser cutting plat & custom", "CNC bending 160 ton", "Cutting + bending", "Fabrikasi & finishing"],
    process: ["Kirim gambar DWG, DXF, atau PDF", "Review material dan ukuran", "Penawaran, produksi, dan pemeriksaan hasil"],
    faq: [
      { question: "Format desain apa yang bisa dikirim?", answer: "DWG dan DXF cocok untuk gambar teknik. PDF, AI, CDR, JPG, atau PNG dapat menjadi bahan konsultasi awal. File produksi ditinjau tim." },
      { question: "Apakah bisa cutting sekaligus bending?", answer: "Bisa diajukan bersama. Kelayakan proses serta biaya dikonfirmasi setelah review gambar." },
    ],
    primary: { label: "Lihat jasa laser cutting", href: "/jasa#laser-cutting" }, quote: "/jasa#request",
  },
  {
    slug: "fabrikasi-erection", name: "MBI Project Fabrikasi & Erection", label: "Fabrikasi & erection", area: "Tambun Selatan, Bekasi",
    title: "Dari fabrikasi hingga pemasangan di lapangan.",
    intro: "Diskusikan gambar struktur, volume pekerjaan, lokasi, dan jadwal langsung dengan admin proyek kami.",
    description: "MBI Project menangani konsultasi kebutuhan fabrikasi dan erection. Tim meninjau gambar kerja, spesifikasi, kondisi lapangan, dan keselamatan sebelum menyepakati ruang lingkup dan jadwal pekerjaan.",
    hero: "/images/hero-steel-warehouse-v2.png",
    images: [{ src: "/images/hero-steel-warehouse-v2.png", title: "Ilustrasi material struktur baja" }, { src: "/images/steel-indonesia/plat-hitam.jpg", title: "Plat untuk fabrikasi" }],
    offerings: ["Fabrikasi struktur baja", "Erection & pemasangan", "Konsultasi gambar struktur", "Koordinasi pekerjaan lapangan"],
    process: ["Hubungi admin proyek", "Review gambar dan lokasi", "Sepakati penawaran dan jadwal"],
    faq: [{ question: "Bagaimana membahas pekerjaan struktur?", answer: "Hubungi admin Andi atau Andra dengan gambar struktur, lokasi proyek, volume, dan target jadwal. Kapasitas serta ruang lingkup dikonfirmasi tim." }],
    primary: { label: "Hubungi admin proyek", href: "/unit/fabrikasi-erection/kontak" }, quote: "/minta-penawaran?unit=fabrikasi-erection",
  },
] as const;

export type Division = (typeof divisions)[number];
