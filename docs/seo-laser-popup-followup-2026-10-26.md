# Tindak lanjut SEO laser cutting dan popup, 26 Oktober 2026

Mengikuti permintaan pengguna berikutnya, poster kembali terbuka otomatis 700 ms setelah kunjungan. Poster yang ditutup tidak berulang saat navigasi dalam lingkup website yang sama; refresh membuka poster lagi. Tombol promo tetap tersedia untuk membuka kembali. Poster divisi mengikuti audience CMS, pratinjau admin tetap bekerja, dan gambar hanya dimuat ketika dialog dibuka. Gambar poster aktif memakai prioritas tinggi.

Halaman `/jasa` kini memakai judul “Jasa Cutting Laser Bekasi & Bending Plat | Mahameru Baja”, sementara H1 mempertahankan istilah “laser cutting Bekasi”. Konten penjelasan baru tampil setelah hero: perbedaan cutting/bending/fabrikasi, persiapan desain, dan tautan panduan yang benar-benar diterbitkan. Tidak dibuat halaman duplikat kota, daftar salah eja, harga/kapasitas fiktif, maupun klaim peringkat.

Bagian laser di beranda memiliki judul dan tautan yang menyebut layanan serta Bekasi. Artikel laser mengarahkan konsultasi ke kontak divisi laser dari CMS, menggantikan nomor toko material pada CTA sebelumnya. Artikel mendapatkan JSON-LD Article dan breadcrumb berdasarkan judul, gambar, serta tanggal yang memang disimpan, tanpa membuat tanggal pembaruan atau nama penulis baru.

## Temuan Search Console

Sesi browser pengguna kini tersedia. Pada properti `https://mahamerubaja.vercel.app/`, sitemap yang tersimpan sebelumnya adalah **`/sitemap.xml.`**, dengan titik di akhir. Google menampilkan “Tidak dapat mengambil peta situs” untuk alamat itu.

Sitemap yang benar, **`/sitemap.xml`**, sudah dikirim melalui Search Console. Setelah pemrosesan, halaman detail menampilkan **“Berhasil memproses peta situs” dan 73 halaman ditemukan**. Entri lama tidak dihapus. Bukti tangkapan layar berada di `tmp/seo-followup/sitemap-processed-73.png`.

Pengiriman sitemap dan jumlah URL ditemukan bukan bukti semua URL sudah diindeks atau telah memperoleh peringkat tertentu. Permintaan inspeksi/pengindeksan halaman utama jasa dilanjutkan setelah rilis versi ini; hasil tindakan tersebut dilaporkan terpisah kepada pengguna.

## Validasi

- Typecheck frontend lulus.
- `test-static-social-revision.mjs` lulus: popup otomatis pada 700 ms, jeda carousel, pembesaran, kontak sesuai divisi, pratinjau admin, penutupan, serta perlindungan terhadap popup muncul ulang jika pengunjung menutupnya sebelum timer awal selesai.
- `verify-local-seo.mjs` lulus lokal: delapan halaman bisnis dan satu artikel panduan terbaca tanpa JavaScript; schema/canonical/Open Graph; sitemap 73 URL dan redirect; popup otomatis, buka ulang, Escape, pemulihan fokus, banner, dan navigasi tanpa popup berulang. Viewport 320, 390, 768, dan 1440 px tidak overflow; tidak ada error runtime.
- Screenshot popup mobile serta panduan pada desktop diperiksa. Tampilan memakai font, warna, dan struktur situs yang sudah ada. Detector Impeccable tidak menemukan masalah mekanis pada target perubahan.

Delivery gate perubahan ini: Hard PASS (fakta sesuai data dan empat viewport lulus); Purpose PASS (konten membantu memilih proses dan mengirim kebutuhan); Liveliness PASS (identitas yang ada dipertahankan, ENERGY 2 / RHYTHM 2 / MOTION 1); Craftsmanship PASS (SSR, link, dialog, keyboard dan browser diverifikasi).

Rilis melalui push ke `main` agar integrasi Git Vercel membaca konfigurasi `frontend/vercel.json` dan region `sin1`. Tidak ada perubahan DNS, pengaturan perlindungan deployment, data CMS, iklan, atau Google Business Profile.

## Hasil rilis dan permintaan indeks

Implementasi commit `6428d53` sudah dipush ke `origin/main`. Build Git Vercel `dpl_AetaNG5sFEzMDeBbByPMnEoUzD2i`, URL `mahamerubaja-iw9fxgevg-jaelanisurya8-7843.vercel.app`, selesai READY dalam 36 detik, fungsi `sin1`. Domain `mahamerubaja.vercel.app` sudah memakai versi tersebut. Pengujian `verify-local-seo.mjs` diulang di domain produksi dan lulus, termasuk sembilan URL SSR, schema artikel, empat viewport, popup otomatis, penutupan/pembukaan ulang, dan navigasi tanpa popup berulang. Bukti render berada di `tmp/seo-followup-production/`.

Inspeksi Search Console untuk `/jasa` menampilkan **“URL tidak ada di Google” dan “URL tidak dikenali oleh Google”** sebelum pengajuan indeks. Sesudah rilis, tombol Minta Pengindeksan dijalankan. Google menolak dengan **“Kuota Terlampaui”**, menyatakan kuota harian terlampaui dan meminta dicoba besok. Permintaan ini **belum berhasil diajukan**. Tidak dilakukan retry berulang, penggunaan akun lain, atau upaya melewati batas Google. Bukti: `tmp/seo-followup/indexing-quota-exceeded.png`.

Sitemap yang benar tetap sudah berhasil diproses dengan 73 URL ditemukan. Ini berbeda dari keberhasilan permintaan indeks manual maupun status indeks masing-masing halaman. Tindak lanjut yang masih tersisa adalah mengajukan `/jasa` lagi setelah kuota tersedia, mulai 27 Oktober 2026, dan memantau laporan indeks/performa. Tidak ada tugas terjadwal otomatis yang dibuat.
