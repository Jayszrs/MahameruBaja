# Audit CMS per halaman — feat/adel

Baseline: origin/main a1b536f. Referensi 78a8438 diperiksa melalui git show. Tidak ada deployment, commit, atau push.

## 1. Kondisi awal dan perbedaan
Sidebar mengelompokkan akses berdasarkan jenis data. Tulisan menggunakan websiteTexts beserta katalog sumber; editor koleksi sudah terpisah. HomePage menulis lima pilihan kebutuhan langsung dalam JSX. InformasiPage menulis eyebrow, judul, deskripsi, ilustrasi dan keterangannya langsung dalam JSX. Tambahan homeQuickLinks sebelumnya belum terhubung ke mergeScopedContent sehingga penyimpanan tidak diterapkan.

## 2. Navigasi dan workspace
Dashboard, permintaan aktif/arsip, pengelolaan akun, akun saya, dan keluar tetap menggunakan implementasi awal. Company profile sekarang memiliki sembilan tautan datar: Beranda, Tentang Kami, Produk, Jasa, Galeri, Artikel, Kontak, Sosial Media, Footer. Rute /admin/website/[page] menyajikan tab horizontal; URL tab mempertahankan mekanisme navigation guard AdminShell untuk perubahan belum disimpan. Rute editor lama tetap tersedia.

## 3. Matriks section dan sumber
Seluruh jalur editor berikut relatif terhadap /admin/website/. Tab dinyatakan oleh ?section=<id>. Kelola konten memakai editor lama, sedangkan Tulisan section memakai WebsiteTextEditor dengan halaman dan area awal yang sesuai. Area komponen belum selalu membedakan section dalam komponen yang sama; lihat keterbatasan.

| Halaman | Section sesuai urutan implementasi | Komponen / sumber | Editor |
|---|---|---|---|
| Beranda | Hero dan teks berjalan | HeroCarousel; heroSlides, heroAnnouncements | beranda: hero / HeroEditor |
| Beranda | Promo & kegiatan | Promotions; promotions | promo / PromotionEditor |
| Beranda | Mengenal Mahameru Group | UnifiedHomeContent, DivisionCollage; divisions, companyIdentity, galleryProjects | intro / DivisionEditor + teks |
| Beranda | Laser Cutting & Bending | UnifiedHomeContent; division + literal | laser / teks |
| Beranda | Cara pesan | UnifiedHomeContent; flow + literal | order / teks |
| Beranda | Cerita & kepercayaan | SocialProof; reviews / divisionReviews / imported reviews | reviews / ContentEditor |
| Beranda | Partner lalu Supplier | SocialProof; partnerLogos | partners, suppliers / PartnerLogoEditor |
| Beranda | Galeri proyek | ProjectAlbums; galleryProjects | gallery / GalleryEditor |
| Beranda | Sosial media | SocialHub; socialAccounts, socialPosts | social / SocialEditor |
| Beranda | Tim kontak | ContactDirectory; contacts | team / ContentEditor |
| Beranda | Lokasi | UnifiedHomeContent; divisionLocations dan literal pusat | location / DivisionEditor + teks |
| Beranda | CTA penutup | UnifiedHomeContent; literal + division | callout / teks |
| Beranda | Jaringan Mahameru Group | HomePage; divisions | network / DivisionEditor |
| Beranda | Mulai dari kebutuhan Anda | HomePage; homeQuickLinks, homeQuickLinksTitle | needs / HomeQuickLinksEditor |
| Tentang Kami | Pembuka, visi, profil/misi/gambar divisi, ulasan, partner, supplier | AboutMergedPage, DivisionCollage, SocialProof; divisions, companyIdentity, reviews, partnerLogos | tentang: opening, vision, divisions, reviews, partners, suppliers |
| Produk | Pembuka, filter/katalog/stok, detail produk | ProductsPage, ProductDetailPage; inventory, products, categories | produk: opening, catalog, copy |
| Jasa | Pembuka, pilihan layanan, detail teknis, alur, formulir, FAQ | LaserCuttingPage; servicePaths, business, serviceDescriptions, request schema | jasa: opening, services, technical, request, faq |
| Galeri | Pembuka, album/foto, CTA | ProjectsPage, ProjectAlbums; galleryProjects | galeri: opening, albums, cta |
| Artikel | Pembuka, daftar, isi artikel | InformasiPage, ArticleEditor, ArticleContent; articleIntro, articleStore, websiteTexts | artikel: opening, articles, copy |
| Kontak | Pembuka, kontak, lokasi/peta, formulir/CTA | KontakPage, ContactDirectory; contacts, divisionLocations, literal | kontak: opening, contacts, location, form |
| Sosial Media | Pembuka, akun, unggahan | SocialHub; socialAccounts, socialPosts | sosial: opening, accounts, posts |
| Footer | Teks/navigasi, divisi, kontak, sosial, layanan/area | Footer, FooterDivisions, FooterLocalServices; divisions, companyIdentity, contacts, socialAccounts, literal | footer: copy, divisions, contacts, social, local |

## 4. Fitur lama dan commit referensi
ArticleEditor tidak ditulis ulang: CRUD, pencarian, sort manual/keyboard, pemilik, slug, rich editor, upload dan preview tetap digunakan. articleCms, divisionCms, articleWebsiteTextCatalog, articleWebsiteText, ArticleContent, recordOrder tidak diubah. WebsiteTextEditor memakai mekanisme simpan/katalog dan sumber dinamis yang sama, dengan opsi halaman/area awal untuk workspace. Sources artikel tetap dikumpulkan dan diserahkan ke editor. Upload menggunakan uploadCmsFile dan endpoint yang sama; blob/file penyimpanan tidak diganti.

## 5. Fungsi baru dan penyimpanan
homeQuickLinks (id/label/href), homeQuickLinksTitle, articleIntro disimpan dalam SiteContent. homeQuickLinks memakai default lima pilihan semula, validasi tautan internal dan ID unik. Penambahan ditempatkan di awal form/list, hapus dan pengurutan memakai AdminOrderList. mergeScopedContent sekarang menggabungkan ketiga field dengan pemeriksaan perubahan bersamaan dan batas Super Admin. Tidak ada tabel/migrasi database baru. API tetap /api/admin/content. Nilai default mengisi dokumen lama tanpa menghapus data.

## 6. Perubahan publik minimum
HomePage: lima tautan dan judul section membaca SiteContent, default sama; tautan divisi tetap mengikuti divisi aktif. Struktur elemen, class, arrow, urutan default dan URL dipertahankan.
InformasiPage: lima field pembuka membaca articleIntro. app/informasi/page.tsx mengambil data yang sama dari readSiteContent. Nilai awal identik dengan JSX lama. Menghapus gambar hanya menghilangkan elemen gambar setelah admin memilihnya; aset lama tidak dihapus.
Tidak menambahkan ID/anchor publik. Preview menggunakan ID yang sudah ada: pilih-divisi, profil, cara-pesan, ulasan, klien, supplier, galeri-unit, sosial, tim-kontak, location-heading, vision-heading, divisi, products-hero, laser-cutting, request, projects-hero-heading, gallery-heading, informasi-hero-heading, articles-heading, footer-divisi. Section tanpa anchor membuka halaman saja.

## 7. Verifikasi
Typecheck lulus. Model pengurutan manual lulus. Regresi dynamic article copy lulus setelah kompatibilitas fixture lama diperbaiki. Build produksi lulus (81 halaman/rute; workspace dinamis terdaftar). Tidak ada script lint di package frontend. Verifikasi browser login/upload/CRUD nyata belum selesai; tidak ada data pelanggan yang dimodifikasi untuk pengujian.

## 8. Status yang belum selesai (jangan klaim cakupan penuh)
- Area katalog teks yang bersumber dari komponen besar (UnifiedHomeContent, ProjectsPage, LaserCuttingPage) belum dipisah per section secara presisi; beberapa tab masih menampilkan sumber dari komponen yang sama.
- Media statis pembuka Tentang Kami dan Jasa, gambar CTA, literal alamat pusat, tautan Footer, daftar servicePaths, flow Cara pesan, dan FAQ Jasa belum seluruhnya memiliki CRUD/upload khusus.
- categories dan sebagian teks navigasi/filter masih memakai sumber bawaan; teks bisa ditemukan lewat editor halaman tetapi CRUD struktur belum tersedia.
- Penghapusan/pengurutan seluruh komponen statis belum tersedia. Editor koleksi yang lama tetap bekerja tetapi ini belum memenuhi syarat semua komponen.
- Audit visual desktop/mobile dan pengujian HTTP dengan sesi admin belum selesai.
- Tidak menambah anchor baru sesuai batas perubahan publik. Pratinjau tepat section hanya tersedia jika anchor sudah ada.

Pekerjaan ini masih belum memenuhi seluruh kriteria selesai pengguna. Matriks di atas membedakan akses editor yang sudah tersedia dari kemampuan yang masih harus ditambahkan.
