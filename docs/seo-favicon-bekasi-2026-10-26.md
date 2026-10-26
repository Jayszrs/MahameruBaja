# Identitas pencarian, favicon, dan layanan Bekasi

Favicon memakai logo MBI asli yang sama dengan website, bersumber dari `frontend/public/images/steel-indonesia/company-logo.jpeg`. Script `frontend/scripts/build-brand-icons.mjs` hanya mengubah ukuran dan format distribusi, tanpa menggambar ulang logo. File statis `/favicon.ico` (16/32/48/64 px), `/favicon.png` (96 px), dan `/apple-touch-icon.png` (180 px) menggantikan URL optimizer yang sebelumnya memakai logo metalik. Aset lama tidak dihapus.

Identitas `og:site_name` kini dinyatakan pada metadata halaman yang mengganti objek Open Graph dari layout, agar tetap menyebut Mahameru Baja Indonesia. Schema WebSite di beranda dan logo Organization tetap menggunakan identitas bisnis yang sama. Tampilan favicon dan nama situs pada Google baru dapat berubah setelah pemrosesan Google; pemasangan ini tidak menjamin waktu kemunculannya.

Footer mendapatkan delapan tautan layanan yang nyata: toko besi Tambun, toko besi Cibitung, katalog besi/baja, cutting laser, bending plat, supplier proyek, fabrikasi baja, dan erection. Tautan dikelompokkan menurut kebutuhan pelanggan dan hanya muncul untuk divisi yang aktif. Tidak menggunakan daftar keyword tersembunyi, kata kunci berulang tanpa konteks, atau halaman kota duplikat.

Kelima halaman divisi dan halaman bagiannya memiliki judul/deskripsi lokal, canonical sendiri, Open Graph, serta breadcrumb yang sesuai. Nama dan pengantar bisnis mengikuti CMS; tambahan lokasi Bekasi pada deskripsi hanya digunakan bila area atau alamat CMS mendukungnya. Beranda menyebut retail, supplier proyek, cutting, bending, fabrikasi, dan erection di Bekasi.

Pengguna mengonfirmasi bahwa empat website tambahan adalah **website lain**, bukan empat divisi Mahameru. Keempat URL belum diberikan saat perubahan ini dibuat. Tidak ada website eksternal yang diubah atau diklaim sudah dioptimasi; tidak ditambahkan tautan eksternal yang ditebak.

## Validasi lokal

- Typecheck frontend dan `test-static-social-revision.mjs` lulus.
- `verify-local-seo.mjs` lulus pada 11 halaman bisnis/subhalaman dan satu artikel: SSR tanpa JavaScript, nama situs, canonical, schema, judul Bekasi, delapan tautan layanan, sitemap 73 URL, dan file ikon dengan format/ukuran yang benar.
- Chromium emulasi 320, 390, 768, dan 1440 px: tanpa overflow, dialog promo otomatis dan interaksi keyboard tetap lulus. Tampilan footer pada 390/1440 px dan favicon 96 px diperiksa. Bukti lokal: `tmp/seo-brand-footer/`.
- Detector Impeccable pada footer dan CSS yang berubah tidak menemukan masalah mekanis.

Delivery gate:

- Hard PASS: logo sumber asli, tanpa klaim bisnis/statistik baru, empat ukuran viewport lulus.
- Purpose PASS: setiap frasa layanan adalah tautan ke halaman yang benar-benar tersedia; ikon statis dapat diambil melalui HTTP.
- Liveliness PASS: warna, foto latar, dan tipografi footer mengikuti situs yang ada; tidak menambahkan dekorasi atau aset merek baru. ENERGY 2 / RHYTHM 2 / MOTION 1.
- Craftsmanship PASS: SSR, metadata, tautan, ikon, ukuran mobile, dan kontrol promo diverifikasi; tidak ada error runtime browser pada pemeriksaan.

## Batas hasil Google

Google memilih sitelinks di bawah hasil pencarian secara otomatis; tautan navigasi dan judul yang jelas membantu struktur situs, tanpa menjamin sitelinks tertentu. Google juga memilih nama situs dan favicon setelah crawl. Referensi: [favicon](https://developers.google.com/search/docs/appearance/favicon-in-search), [site names](https://developers.google.com/search/docs/appearance/site-names), dan [sitelinks](https://developers.google.com/search/docs/appearance/sitelinks).

Pengajuan indeks manual pada sesi sebelumnya tertahan kuota harian. Tidak dilakukan pengajuan berulang untuk melewati batas tersebut. Sitemap yang benar sudah diproses Google pada sesi sebelumnya.
