# Audit revisi Mahameru — 10 Oktober 2026

Dokumen ini membedakan fitur yang sudah diterapkan, hasil pengujian, dan keputusan/data yang masih diperlukan. Tidak berarti website sudah dideploy atau aplikasi E-tago sudah dimigrasikan.

## Sumber dan keputusan

- Permintaan pengguna terbaru mengutamakan lima divisi dan lima akun admin. Ini menggantikan penyebutan empat divisi/dua admin pada sebagian PDF dan screenshot lama.
- Excel `DAFTAR LOGO DANA NOMOR BARU MBI.xlsx`, `Sheet1!H11:J28`: sepuluh kontak admin. `L11:Q18`: akun sosial. `B31:B50`: visi bersama, misi lima divisi, motto.
- `Pembaruan_Website_MahameruBaja.pdf`, halaman 1–5, menjadi bahan requirement, bukan izin untuk membeli hosting, mengunggah ke akun sosial, atau mengubah aplikasi offline.
- MBI Laser Cutting menjadi identitas utama. Lima logo sumber dibersihkan dengan ImageGen: latar luar transparan, bentuk/warna/tulisan dipertahankan. Hasil PNG RGBA berada di `frontend/public/images/brand/`; bukan pengganti master vektor untuk cetak ukuran besar.
- Visi di Excel adalah visi **Mahameru Group**; tidak dibuat lima visi fiktif. Misi masing-masing divisi disalin sesuai Excel.

## Status 24 poin notulensi

| No. | Permintaan | Status revisi |
| --- | --- | --- |
| 1 | Fokus beranda dan profil divisi | Beranda fokus laser; lima profil dan subhalaman divisi tersedia. Materi/foto aktual tambahan masih perlu klien. |
| 2 | Logo utama MBI laser | Diterapkan pada navbar, footer, favicon, dan beranda. |
| 3 | Output invoice | Editor harga/jumlah dan PDF **draf** tersedia di `/admin/permintaan`; template resmi/pajak/rekening belum diberikan. |
| 4 | Copy Google Maps | Diubah menjadi “Lokasi” serta “Dekat. Lengkap. Siap melayani kebutuhan Anda.” |
| 5 | Footer | Tata letak baru, CTA material + jasa laser, tautan lima divisi; strip kartu divisi duplikat dihapus. |
| 6 | Share artikel lambat | OG/Twitter metadata pada HTML awal telah diuji; tautan share dibersihkan dari query/hash. Kecepatan cache preview WhatsApp/Meta bukan di bawah kendali website. Domain/OG final perlu dicek setelah hosting. |
| 7 | Lokasi GMB berbeda | GMB menggunakan query peta Cibitung; divisi lainnya area kompleks Tambun yang sama. **Pin/alamat GMB persis masih perlu dikonfirmasi**. |
| 8 | Struktural menghubungi admin | Divisi MBI Project Fabrikasi & Erection mengarah ke Andi/Andra. |
| 9 | Portal tiap divisi | Lima akun login dan pembatasan data permintaan berdasarkan divisi tersedia; satu aplikasi, bukan lima instalasi terpisah. |
| 10 | Satu atau banyak admin | Akun owner lama tetap didukung; lima akun divisi ditambahkan. Konten company profile masih dikelola bersama. Keputusan pengelola final diperlukan. |
| 11 | Label floating WhatsApp | Nama divisi dan admin lengkap; hanya laser menggunakan label ringkas “MBI Laser Bending”. Sepuluh nomor dari Excel. Menu membaca kontak terbit dari CMS saat dibuka. |
| 12 | Dashboard seperti event | Banner kegiatan/promo menjadi bagian teratas dashboard, dengan akses hero dan editor. |
| 13 | Logo MBI | Selesai bersama poin 2; setiap divisi memakai logonya sendiri. |
| 14 | Lima akun admin | Dibuat lokal dengan password acak, hash scrypt di env, file akses diabaikan Git. Restart Next untuk memuat env baru. |
| 15 | Input tidak bersamaan | Antrean penulisan per proses, lock lintas proses, dan retry rename atomik untuk Windows. **24 input bersamaan lulus pada dua pengujian berulang**. Revisi lama ditolak; perubahan CMS pada bagian berbeda digabung, bagian sama mendapat 409. |
| 16 | Aplikasi online | Web siap diuji sebagai deployment satu instance dengan volume persisten. **Belum deploy**. Integrasi/online-kan E-tago memerlukan source dan akses yang belum tersedia. |
| 17 | Palet warna | Token merah `#BC1726`, merah tua `#8F1020`, putih/off-white. Blok utama baru merah/putih; foto tetap warna aslinya, overlay burgundy untuk keterbacaan. |
| 18 | Nomor WhatsApp | Sepuluh kontak telah dipetakan dari Excel ke lima divisi. |
| 19 | Visi dan misi | Visi Group dan misi lima divisi sesuai Excel, pada Tentang Kami dan subhalaman Tentang. |
| 20 | CRUD admin | Kontak, ulasan, sosial, promo, hero dan permintaan dapat diedit. Arsip/pulihkan permintaan, scope akun, validasi media, dan konflik revisi diuji via HTTP. Pengujian klik editor di browser belum tersedia. |
| 21 | Cara pemesanan | Empat langkah ditampilkan sebagai draf alur: pilih divisi, kirim kebutuhan, setujui penawaran, terima hasil. Perlu persetujuan operasional sebelum go-live. |
| 22 | Label form kebutuhan jasa | Form umum: jenis kebutuhan/jasa, divisi, material/ukuran/jumlah opsional, deskripsi, kontak pelanggan. Tidak hanya laser. Lampiran gambar kerja dikirim lewat WhatsApp, belum upload dokumen privat. |
| 23 | Template penawaran PDF | **Menunggu template resmi**; PDF ringkasan permintaan dan invoice draf tersedia, bukan SPH resmi. |
| 24 | Footer href tiap divisi | Lima link menuju microsite `/unit/{slug}`. Domain eksternal divisi belum diberikan, tidak ditebak. |

## Perubahan tambahan yang diminta

- Kartu website divisi berada pada section terakhir beranda; duplikat kartu footer dihapus.
- Tentang Kami menampilkan satu profil divisi per baris, tanpa profil berbeda berdampingan dan tanpa strip divisi duplikat di bawah.
- “Unit” sebagai organisasi diganti “divisi”; path `/unit/` tetap untuk kompatibilitas. Satuan produk “Unit” tidak diganti.
- MBI Trading: Besi WF, H-Beam, Plat, Siku Besi, Besi Beton KS, Canal UNP/CNP, Baja Ringan Kepuh, Atap UPVC Single/Double Layer, Genteng UPVC. Stok, ukuran, harga dan foto khusus tiap produk belum diasumsikan.
- Hero dapat mengunggah gambar/MP4 dan poster, mengatur urutan serta CTA. Video diputar sekali per kunjungan, lalu gambar berputar otomatis setiap 4 detik; tersedia Jeda dan dukungan reduced-motion.
- Promo menggunakan kartu editorial, tautan bergaris bawah, serta dialog preview banner/detail. Diskon demo lama tidak diterbitkan otomatis; admin harus menyetujui promo nyata.
- Sosial mendukung banyak akun dan embed unggahan Instagram/TikTok/YouTube. Dua username Instagram tersedia dari Excel; TikTok/YouTube hanya **nama tampilan**, sehingga URL belum ditebak dan draft belum diterbitkan. Embed video dimuat saat diputar. Penyedia sosial dapat memblokir embed; tautan sumber tetap tersedia.
- Logo Astra/Mandiri/WIKA/dll tetap **contoh layout**, dengan label bukan pernyataan kerja sama. Daftar partner resmi membutuhkan konfirmasi.
- Foto kontak dan sampul unggahan sosial bisa diupload melalui CMS; hero/promo menggunakan penyimpanan media persisten yang sama.

## Yang belum diterapkan / belum dapat diselesaikan

1. Pelacakan progres publik yang aman, scanner/QR SPH–PO–invoice, dan notifikasi otomatis admin. Memerlukan alur/status, hak akses customer, kanal notifikasi, serta template resmi. Status internal permintaan bukan pengganti pelacakan publik.
2. Integrasi E-tago/aplikasi offline: source, schema database, lisensi dan contoh data belum tersedia. Perbaikan concurrency pada web ini **bukan** perbaikan E-tago.
3. CRUD produk/artikel/galeri lengkap melalui CMS. Data halaman tersebut masih berbasis source; editor saat ini mencakup hero, promo, sosial, kontak, ulasan, dan permintaan.
4. Posting otomatis ke akun YouTube/TikTok/Instagram. CMS menampilkan tautan/embed, bukan memposting ke akun eksternal.
5. Sinkronisasi stok aktual, template invoice/SPH resmi, promo Ramadan yang disetujui, video company profile aktual, foto proses/produk aktual dan daftar partner resmi.
6. Validasi browser/perangkat nyata pada mobile (360/390/768), keyboard, dialog, menu WhatsApp, autoplay/parallax, serta Lighthouse. Surface browser sesi ini tidak tersedia; tidak diklaim lulus visual.
7. Deploy hosting, DNS/TLS, backup/restore produksi, MFA/audit log admin dan scanning dokumen privat.

## Verifikasi teknis

Jalankan dari root repo:

```powershell
npm run typecheck -w @mahameru/frontend
npm run build -w @mahameru/frontend
node frontend/scripts/test-october-revision.mjs
```

Script membuat server sementara port 3162, akun fixture acak, dan data baru di `tmp/revision-qa-*`; tidak mengubah data/akun CMS pengguna. Hasil pengujian dan invoice fixture ada di folder tersebut. Pengujian meliputi lima login, pembatasan permintaan, 15 rute divisi, delapan input bersamaan, revisi konflik, merge konten CMS, upload/range media, penolakan file palsu, posisi divisi, metadata artikel, serta persistensi/PDF invoice. PDF invoice juga dirender dan diperiksa secara visual terpisah dari UI browser.

Stress test tambahan: `$env:QA_CONCURRENCY = '24'; node frontend/scripts/test-october-revision.mjs`. Dua run berturut-turut menghasilkan 29 record masing-masing (5 permintaan admin + 24 customer), tanpa record hilang. Arsip/pulihkan dan penolakan edit/hapus lintas divisi ikut diperiksa. Typecheck frontend/backend/database, build produksi Next, pemeriksaan diff, dan validasi Compose lulus; Docker belum dijalankan sebagai deployment produksi.

Konfigurasi Compose dapat divalidasi dengan `docker compose -f infrastructure/docker-compose.yml config --quiet`; menjalankan stack Docker/restore volume produksi belum menjadi hasil pengujian ini.
