# Lanjutan CMS dan hero — 24 Oktober 2026

## Perubahan lanjutan

Hero kembali menyatu: foto/video memenuhi latar, dan tulisan berada di atasnya pada desktop serta mobile. Revisi 25 Oktober mempertahankan warna foto dan meningkatkan kecerahan media, tanpa lapisan putih atau gradasi hitam di kiri. Teks putih memakai bayangan untuk menjaga keterbacaan. Gambar slide yang sedang ditampilkan dimuat segera; hanya slide aktif dan sebelumnya yang dirender. Teks dan media yang dikelola CMS tetap digunakan.

Tes CRUD menemukan masalah nyata pada pembuatan divisi: frontend menyimpan status aktif, sementara server hanya menerima divisi baru berstatus draf dan kolom unggah terkunci sebelum penyimpanan pertama. Sekarang Super Admin dapat mengisi profil serta mengunggah logo/gambar sebelum menyimpan divisi baru. Simpan langsung mengaktifkan profil yang lengkap. Profil yang belum lengkap menampilkan daftar isian yang harus diisi dan membuka tab terkait. Server tetap memeriksa kelengkapan, media, keunikan alamat, hak akses, dan konflik revisi.

Tes browser diperbaiki agar menggunakan label/elemen yang benar, menunggu editor selesai dimuat, dan memeriksa urutan dalam daftar yang sedang difilter. Konfigurasi browser, URL lokal, serta berkas sesi pengujian dapat diberikan melalui environment variable. Pengujian dilakukan pada data sementara terpisah, tanpa mengubah data CMS pengguna.

## Hasil verifikasi

| Bagian | Hasil |
| --- | --- |
| Hero dan poster publik | Lulus pada 320×640, 390×844, 768×1024, 1440×1000; media memenuhi latar di belakang teks; tanpa overflow horizontal atau error runtime |
| Navigasi hero | Tombol sebelumnya/berikutnya berfungsi |
| Kontak dan ulasan | Tambah di atas, unggah foto kontak, langsung tampil setelah simpan, urutan keyboard/drag tersimpan setelah reload, edit, batal hapus, dan hapus lulus |
| Hero CMS | Unggah, tambah, simpan, hasil publik, urutan keyboard/drag, reload, dan hapus lulus |
| Poster CMS | Unggah, tambah, simpan, hasil publik, urutan keyboard/drag, reload, dan hapus lulus |
| Galeri | Unggah, tambah album, simpan, hasil publik, urutan keyboard/drag, reload, dan hapus lulus |
| Akun/unggahan sosial dan logo supplier | Tambah, unggah jika berlaku, simpan, hasil publik, urutan keyboard/drag, reload, dan hapus lulus |
| Artikel | Tambah, unggah sampul, simpan langsung tampil, halaman publik, edit, dan hapus lulus |
| Divisi | Validasi profil kosong, unggah sebelum simpan pertama, tambah langsung aktif, halaman/media publik, edit, arsip, dan hapus lulus |
| Produk baru | Buat produk baru, unggah foto, stok, simpan, reload, edit, katalog/detail/pencarian publik, mobile, dan hapus lulus |
| Teks website | Pencarian semua halaman secara default, edit teks produk, simpan, dan penggantian pada halaman publik lulus |
| Password | Reset 7 karakter ditolak; 8 karakter diterima; login dan penggantian password sementara menjadi 8 karakter lulus |
| SEO teknis lokal | Meta verifikasi/canonical ter-render, robots/sitemap HTTP 200, 73 URL unik tanpa halaman admin pada data bawaan |
| Build/typecheck | Build monorepo serta build frontend akhir lulus; pemeriksaan TypeScript seluruh workspace lulus |

Perangkat uji utama: `test-cms-autopublish-ui.mjs`, `test-products-copy-revision.mjs`, `test-public-cms-revision.mjs`, `test-inventory-schema-revision.mjs`, `test-copy-review-workspace.mjs`, dan `test-static-social-revision.mjs` di `frontend/scripts/`.

Screenshot hasil akhir tersedia di `tmp/hero-unified-final/`. Artefak dan data uji berada dalam direktori sementara yang diabaikan Git.

## Status deployment

Perubahan ini masih lokal. Tidak ada deployment, perubahan DNS, atau verifikasi akun Search Console. Penjelasan domain dan langkah Google tersedia di [catatan SEO](seo-public-ui-2026-10-24.md).

## Penyelesaian lanjutan — 25 Oktober 2026

- Popup memakai poster utuh sebagai bidang utama, tombol tutup mengambang, serta caption dan navigasi ringkas. Informasi tambahan bisa dibuka bila dibutuhkan. Pratinjau CMS memakai komponen yang sama.
- Artikel dan divisi memiliki daftar urutan dengan drag serta alternatif keyboard. Tombol Simpan menyimpan perubahan isi dan urutan sekaligus. Konflik revisi ditolak; pengurutan oleh admin divisi tidak mengubah data atau posisi milik divisi lain.
- Teks artikel CMS terkini, termasuk judul, ringkasan, isi Markdown, dan tabel GFM, masuk pencarian Teks Website sesuai pemiliknya. Penggantian teks mempertahankan tautan, format, dan kode. Handle sosial juga masuk katalog.
- Pembuatan proyek dan unggah foto galeri memakai ID yang tetap bekerja saat `crypto.randomUUID` tidak tersedia pada akses HTTP LAN.
- Tes browser terpisah membuktikan pencarian → edit → simpan → reload → artikel publik, isolasi pemilik, serta pembuatan/unggah galeri tanpa `randomUUID`. Model urutan dan tes API/browser membuktikan penyimpanan urutan, hasil publik, konflik 409, input ganda 400, dan pembatasan akses 403.
- Seluruh suite CRUD koleksi lulus pada data sementara: kontak, ulasan, hero, poster, galeri, sosial, logo, artikel, dan divisi. Data CMS pengguna tidak diubah untuk pengujian.

Tes tambahan: `test-record-order-model.mjs`, `test-record-order.mjs`, `test-dynamic-article-copy.mjs`, dan `test-article-copy-ui.mjs`. Artefak hero/poster terbaru berada di `tmp/final-photo-poster/`. Tes publik mencakup 320×640, 390×844, 484×620, 768×1024, dan 1440×1000, serta memastikan gambar slide aktif benar-benar selesai dimuat.

Verifikasi akhir memakai build standalone pada `http://127.0.0.1:3174` serta dev server pada `http://localhost:3000`: kelima viewport dan tiga rute tambahan lulus tanpa error runtime. Build seluruh monorepo dan typecheck seluruh workspace lulus. Pemindaian sumber Impeccable tidak melaporkan pola bermasalah pada tujuh berkas yang diperiksa; pemeriksaan tersebut berbasis regex, sehingga pemeriksaan visual browser tetap dilakukan. REA juga memeriksa halaman lokal secara pasif melalui CDP. Pengujian awal melalui `next start` dan origin `localhost` sempat mengalami timeout optimasi gambar pada Windows; hasil akhir diverifikasi ulang melalui server standalone yang didukung Next.js dan alamat bind `127.0.0.1`.
