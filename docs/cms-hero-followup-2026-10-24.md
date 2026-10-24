# Lanjutan CMS dan hero — 24 Oktober 2026

## Perubahan lanjutan

Hero kembali menyatu: foto/video memenuhi latar, dan tulisan berada di atasnya pada desktop serta mobile. Lapisan putih hangat menggantikan bayangan hitam. Warna teks, batas tombol, dan tinggi tombol dalam satu baris disesuaikan agar tetap terbaca. Teks dan media yang dikelola CMS tetap digunakan.

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
