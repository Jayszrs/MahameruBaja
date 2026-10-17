# Revisi keterbacaan dan logo, 17 Oktober 2026

## Perubahan

- Nama header utama dikembalikan menjadi `MBI LASER CUTTING` dan subjudul `MAHAMERU BAJA INDONESIA`, sesuai permintaan terbaru. Nama dan subjudul masing-masing divisi tetap terpisah.
- Artwork klien `Corporate Logo Trio_ MMN, GMB, MBI.png` disalin tanpa mengubah piksel ke `frontend/public/images/brand/client-corporate-trio.png` (1437 x 1095). Komponen logo menggunakan frame SVG untuk menampilkan bagian MMN, GMB, atau MBI dari sumber asli, bukan menggambar ulang atau memotong file raster.
- Alias aset bawaan lama MMN/GMB/MBI memakai artwork baru pada presentasi. URL logo kustom dari CMS tidak diubah, dan tidak ada profil CMS yang ditulis ulang. Rendering memakai satu URL optimasi gambar yang sama untuk sheet logo.
- Bintang hero 30 px desktop / 29 px mobile; angka rating 22 px; sumber dan tanggal rating 14 px. Ringkasan area/layanan hero 13–17 px. Ringkasan juga dapat dibaca di mobile, bukan disembunyikan.
- Dot/tab pemilih slide serta tombol `Jeda slideshow` dihilangkan dari tampilan normal. Timer hero tetap 4 detik untuk slide gambar; perilaku video berakhir tetap dipertahankan.
- Scrollbar banner dan tombol `Jeda banner` tidak terlihat pada tampilan normal. Banner tetap mendukung autoplay, swipe native, drag mouse, dan panah/Home/End saat track mendapat fokus keyboard. Gesture drag tidak membuka popup secara tidak sengaja; klik biasa tetap berfungsi.
- Untuk aksesibilitas, tombol hentikan/lanjutkan tersedia hanya saat mendapat fokus keyboard. Hover, fokus, tab tersembunyi, dan preferensi reduced-motion tetap menghentikan gerak sesuai keadaan.
- Logo profil Tentang Kami diperbesar menjadi 180 x 144 px desktop / 138 x 112 px mobile; logo footer 200 x 174 px. Komposisi kiri dan kolase tiga foto dipertahankan.
- Deskripsi profil, misi, tautan, promo/countdown, kontak, footer, dan teks kecil publik diperbesar. Archivo/Manrope dan palet hitam-putih-merah dipertahankan. Stylesheet terbatas pada komponen publik; ukuran formulir dan dashboard admin tidak dirombak.

## Alasan desain / antislop during

- Arah: perusahaan baja untuk pelanggan retail dan proyek; industrial dengan hierarki baca yang tegas. ENERGY 2 / RHYTHM 2 / MOTION 2.
- Tipografi: ukuran teks dinaikkan untuk pembacaan di telepon tanpa mengganti font merek atau copy yang sudah disetujui.
- Logo: identitas dari artwork klien, dengan rasio gambar tetap terjaga dan tanpa membuat ulang merek.
- Gerak: pergantian layanan/promo dipertahankan karena diminta pengguna, bukan dekorasi. Kontrol visual dikurangi, tetapi penghentian gerakan dan akses keyboard tetap tersedia.
- Layout: kartu promo dapat tumbuh mengikuti teks dan CTA membungkus baris; tidak mengecilkan font agar muat dalam tinggi tetap.
- Data: tidak mengubah nilai rating, jumlah stok, isi CMS, akun, atau ulasan.

## Bukti verifikasi

- PASS, `npm run build --workspace frontend`: kompilasi production dan TypeScript, 75 halaman.
- PASS, `node frontend/scripts/test-readability-revision.mjs`: in-memory component/timer adapter. Rotasi hero gambar, hover/jeda, perubahan visibility, reduced motion, video play/pause/ended, promo autoplay, drag, suppression click setelah drag, klik normal, navigasi keyboard, aturan CSS ukuran teks, dan mapping logo. Bukan pengujian DOM/browser.
- PASS, `node frontend/scripts/test-client-revision.mjs`: server production dengan CMS sementara. Menampilkan tiga identitas SVG, URL artwork teroptimasi menghasilkan HTTP 200, header dan kontrol baru sesuai markup. Upload foto, privasi, edit, retry, dan batas ukuran tetap lolos.
- PASS, `node frontend/scripts/test-october-revision.mjs`: login/scoping lima divisi, route publik/admin, submit bersamaan, stok, media, galeri, invoice dan 59 pemeriksaan HTTP artikel tetap lolos pada CMS sementara.
- PASS, `git diff --check`: tidak ada kesalahan whitespace.

## Gate yang masih tertunda

Inventori Computer Use mengembalikan `apps: []` dan `browsers: []`. Gate visual antislop belum dapat dinyatakan PASS: belum ada screenshot hasil revisi atau click-through browser sebenarnya. Perlu memeriksa logo beserta clipping, header 320/360/390/768 px, overflow, dialog promo, swipe native, drag mouse dan fokus keyboard di browser yang terhubung. Pemeriksaan kode dan adapter tidak menggantikan langkah ini.

Tidak melakukan commit, push, deploy, perubahan environment Vercel, atau operasi terhadap Blob/CMS produksi.
