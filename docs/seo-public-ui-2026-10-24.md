# Website publik dan SEO — 24 Oktober 2026

Hero beranda kini menggunakan bidang terang untuk tulisan dan gambar/video tanpa gradasi hitam. Pada ponsel, konten mengalir sesuai panjang teks dan media berada di bawahnya. Navigasi slide dapat digunakan dengan tombol sebelumnya/berikutnya. Header tetap terlihat dan WhatsApp di sebelah tombol penawaran dihapus; tombol WhatsApp mengambang tetap tersedia.

Poster yang dibuka pengunjung dan pratinjau CMS menggunakan komponen yang sama, dengan gambar utuh, bidang informasi terang, tombol berukuran sentuh, dan tinggi dialog mengikuti viewport. Error Next Image pada foto sosial diperbaiki dengan memindahkan dimensi crop ke pembungkus gambar. Gambar `fill` tetap menggunakan ukuran 100% sesuai kontrak Next.js.

## Hasil pemeriksaan domain yang sedang aktif

Pemeriksaan HTTP publik pada `https://mahamerubaja.vercel.app` tanggal 24 Oktober 2026:

- Beranda, `robots.txt`, dan `sitemap.xml` menjawab HTTP 200.
- Canonical dan sitemap menggunakan domain Vercel tersebut.
- Tidak ditemukan header `X-Robots-Tag: noindex` pada ketiga respons.
- Meta verifikasi Google belum ada pada deployment yang diperiksa. Perubahan kode lokal menambahkan token yang diberikan pengguna.

Kode sekarang memberi judul beranda yang memuat Mahameru Baja, toko besi, dan jasa laser cutting Bekasi. Metadata halaman artikel/penawaran, canonical halaman hukum, Twitter card, dan sitemap produk CMS diselaraskan. Sitemap hanya menyertakan produk yang tampil pada setidaknya satu divisi, termasuk produk baru dari CMS.

## Verifikasi Google Search Console

Screenshot pengguna memperlihatkan properti `mahameru.vercel.app`. Alamat itu berbeda dari website yang diperiksa, `mahamerubaja.vercel.app`. Verifikasi harus memakai properti untuk alamat website yang benar.

Untuk subdomain Vercel saat ini:

1. Tambahkan properti **URL-prefix** `https://mahamerubaja.vercel.app/`.
2. Pilih metode **HTML tag**. Cocokkan nilai `content` dengan token pada konfigurasi `GOOGLE_SITE_VERIFICATION`. Token DNS yang diberikan sudah dipasang sebagai nilai awal, tetapi token metode HTML harus dipastikan dari Search Console; kode tidak dapat menjamin bahwa token dari metode DNS diterima oleh metode HTML.
3. Setelah perubahan ini dideploy, buka source HTML beranda dan pastikan meta `google-site-verification` sesuai. Lanjutkan **Verifikasi** di Search Console.
4. Kirim `https://mahamerubaja.vercel.app/sitemap.xml`, lalu gunakan Inspeksi URL untuk meminta pengindeksan beranda, produk, dan jasa.

Properti **Domain** memerlukan verifikasi DNS. Menaruh string TXT dalam HTML atau membuat file `.txt` pada website tidak memasang record DNS. Referensi resmi: [metode verifikasi Search Console](https://support.google.com/webmasters/answer/9008080?hl=en).

Kesiapan teknis dan permintaan pengindeksan tidak menjamin website langsung muncul atau mendapat peringkat tertentu untuk “Mahameru Baja”, “besi”, atau “laser cutting”. Google menjelaskan bahwa proses crawl dapat memakan beberapa hari sampai beberapa minggu dan permintaan crawl tidak menjamin indeks. Referensi: [meminta Google melakukan crawl ulang](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## Migrasi hosting

Atur `NEXT_PUBLIC_SITE_URL` ke origin domain resmi, misalnya `https://domain-resmi.example`, dan `GOOGLE_SITE_VERIFICATION` ke token properti baru. Lalu build dan deploy ulang. Canonical, structured data, `robots.txt`, dan sitemap mengambil origin dari konfigurasi yang sama. Domain Vercel saat ini menjadi fallback saat konfigurasi origin belum diisi. `VERCEL_ENV=preview` dan `SITE_PREVIEW_MODE=1` tetap melarang pengindeksan untuk lingkungan review.

Tidak ada deployment, perubahan DNS, atau tindakan pada akun Search Console dalam pekerjaan ini.

## Validasi lokal

`frontend/scripts/test-public-cms-revision.mjs` lulus menggunakan Chromium pada `localhost:3000`: viewport 320×640, 390×844, 768×1024, dan 1440×1000; batas dialog poster; tidak ada overflow horizontal; perpindahan hero; tombol WhatsApp; serta halaman sosial media, produk, dan divisi laser cutting. Pemeriksaan SSR menemukan token verifikasi/canonical, `robots.txt` dan sitemap menjawab 200, serta 73 URL sitemap unik tanpa halaman admin. Tidak ada error runtime browser. Screenshot lokal tersedia di `tmp/public-refinement/`.

`test-static-social-revision.mjs` beserta pemeriksaan adapter carousel/poster/ticker yang diimpornya lulus. Assertion crop diperbarui untuk memastikan ukuran berada pada pembungkus, sedangkan gambar tetap `fill`, sehingga penyebab crash sebelumnya tidak diperkenalkan kembali. Typecheck frontend lulus dan pemeriksaan mekanis Impeccable tidak menemukan masalah pada perubahan publik.

Viewport tersebut adalah emulasi Chromium. Pengujian ini tidak mengklaim hasil perangkat fisik Android/iPhone atau Safari. Metadata lokal belum tersedia di domain publik sampai perubahan dideploy; status verifikasi dan indeks Google belum dikonfirmasi melalui akun Search Console.
