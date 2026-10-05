# Microsite divisi dan sosial media

Pembaruan lokal: 5 Oktober 2026.

## Empat website divisi

Keempat microsite berjalan dalam aplikasi dan domain yang sama, dengan header, footer, navigasi, konten, metadata, serta URL masing-masing. Ini belum merupakan empat deployment atau domain terpisah.

| Divisi | Beranda | Menu khusus |
| --- | --- | --- |
| Mahameru Baja Tambun | `/unit/retail-tambun` | tentang, produk, galeri, kontak |
| Garuda Marginal Baja | `/unit/retail-cibitung` | tentang, produk, galeri, kontak |
| Mahameru Baja Indonesia | `/unit/trading-proyek` | tentang, layanan, galeri, kontak |
| MBI Laser Cutting | `/unit/laser-cutting` | tentang, layanan, galeri, kontak |

Total 20 halaman yang ditautkan melalui navigasi divisi. Detail produk memakai katalog bersama. Pilihan kategori tiap retail berbeda; stok, harga, serta lokasi yang belum diketahui tidak dikarang. Pengaturan kontak dan penempatan divisi tetap memakai `/admin/konten`.

## Sosial media dan CMS

- Login: `/admin/login`.
- Editor sosial: `/admin/sosial`, juga ditautkan dari dashboard dan editor kontak.
- Halaman publik: `/sosial-media`, dengan ringkasan di beranda.
- Instagram `mahamerubajaindonesia` dan TikTok `mahameru.baja.ind` diberikan pengguna.
- Kanal YouTube yang ditemukan: `https://www.youtube.com/@MahameruBajaIndonesia`, ID `UCvnljyXGnhQ2Un6qzq8Pd_Q`. Video `https://www.youtube.com/shorts/IP6GsNxExVU` berjudul “Proses laser Cutting #Laser #cnc”. Pemilihan kanal didasarkan pada nama dan isi video; kepemilikan belum dikonfirmasi pengguna.
- Facebook belum ditemukan dengan identitas yang cukup jelas. Field CMS tersedia, tetapi akun kosong/tidak terbit tidak ditampilkan ke publik.

Editor mengelola akun, URL, username, status terbit, serta unggahan pilihan dengan judul, caption, gambar sampul, tautan sumber, urutan, dan status draf. Pilih **Terbit**, kemudian **Simpan perubahan**. Draf boleh belum memiliki URL; penerbitan membutuhkan URL HTTPS dari platform yang sesuai. Sampul menggunakan path `/images/...` atau URL HTTPS, bukan upload berkas.

Instagram dan TikTok memiliki kartu profil dengan tombol memuat konten platform. YouTube dan tautan video TikTok memakai pemutar setelah diklik. Muatan pihak ketiga tidak dimuat sebelum klik; tautan sumber tetap tersedia jika embed dibatasi platform, browser, atau kebutuhan login. Tidak ada scraping berkala atau sinkronisasi API. Konten embed Instagram/TikTok belum terverifikasi secara visual di browser sesi ini.

Penyimpanan memakai store CMS yang sama, validasi Zod, cookie admin, pemeriksaan origin, penulisan atomik, dan kontrol revisi. File lama tanpa field sosial mendapat nilai awal otomatis saat dibaca. Jangan menyalin isi `.env.local` atau kredensial admin ke dokumentasi publik.

## Tampilan dan gerakan

- Strip hitam lokasi/jam/WhatsApp di atas navigasi dihapus beserta ruangnya.
- Menu utama beranda tetap tersembunyi sampai pengguna scroll; menu tersembunyi tidak menerima fokus keyboard.
- Hero beranda mempertahankan pergantian 2,5 detik.
- Parallax berjalan dua arah, memakai satu pembaruan per animation frame dan membaca layout sebelum menulis transform. Gerakan dikurangi pada layar sentuh; preferensi reduced motion dihormati.
- Seluruh jalur yang memiliki segmen `/produk` tidak memasang pengendali parallax.
- Menu divisi mobile, ukuran teks, safe area, grid, iframe sosial, dan target sentuh disesuaikan untuk layar kecil. Input 16px menghindari zoom otomatis pada iOS.
- Karakter bintang yang sebelumnya tersimpan sebagai `?` di komponen ulasan diperbaiki menjadi bintang Unicode. Teks ulasan Google individual tetap memerlukan data asli; tidak diisi komentar karangan.

## Console

- `<html data-scroll-behavior="smooth">` mengikuti pengaturan Next.js untuk navigasi.
- Preload font yang tidak perlu dimatikan; font tetap dilayani lokal melalui next/font.
- Paksaan prefetch semua navigasi dilepas; Link menggunakan perilaku default Next.
- React DevTools, HMR, dan pesan membuka handler `tel:` merupakan pesan development/browser yang normal. Console tidak dibungkam.
- Pada HTML produksi yang diperiksa, tidak ada preload font; preload CSS yang ada juga tercantum sebagai stylesheet. Hilangnya seluruh warning khusus HMR belum diverifikasi di browser.

## Verifikasi

- TypeScript dan build produksi lulus.
- 31 rute HTTP 200, termasuk 20 halaman divisi; 64 tujuan href internal dan 32 gambar merespons berhasil.
- Jalur unit/section tidak dikenal dan produk unit laser merespons 404.
- CMS tanpa login diarahkan ke login, API tanpa sesi merespons 401.
- Uji store terpisah lulus: migrasi data lama, simpan/baca ulang, draf tidak bocor ke payload publik, validasi URL/platform, penolakan origin asing, revisi usang 409, dan pemulihan data uji.
- Server verifikasi memakai port 3010 dan salinan data terpisah, bukan data CMS pengguna.
- Tidak ada browser tersedia melalui computer-use. Belum ada uji visual langsung, sentuhan, drag, atau pengukuran console di perangkat Android/iOS/tablet nyata.

Jalankan pengembangan dengan `npm run dev` dari root. Jangan menjalankan dua sesi yang memakai port 3000/4000 bersamaan.
