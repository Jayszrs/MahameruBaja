# Revisi klien 16 Oktober 2026

## Implementasi

1. Header utama menggunakan logo MBI biasa yang sudah ada di `/images/steel-indonesia/company-logo.jpeg`, dengan nama Mahameru Baja dan subjudul Indonesia. Identitas divisi tetap terpisah.
2. Logo yang menutupi pertemuan foto pada kolase beranda dan Tentang Kami dihapus. Tiga foto dan dialog galeri tetap tersedia. Logo tetap dapat dilihat sebagai salah satu gambar di dialog, bukan sebagai tempelan pada foto.
3. Callout penawaran, footer utama, dan kartu laser cutting pada jaringan divisi menggunakan logo MBI biasa. Latar putih mempertahankan keterbacaan logo asli tanpa membuat aset baru.
4. Pada Tentang Kami, logo masing-masing divisi diposisikan di sisi kiri header profil.
5. Slogan footer dipindahkan ke atas nama perusahaan berukuran besar. Alamat dan tautan kontak tetap dekat logo.
6. Daftar penyedia material menggunakan nama Mahameru Baja Retail Tambun, Garuda Marginal Baja Retail Cibitung, dan MBI Trading, tanpa logo tambahan. Hanya penyedia yang mencatat produk sebagai listed di CMS ditampilkan. Ini mengikuti konfirmasi pengguna, bukan mengarang ketersediaan di ketiga divisi.
7. Form penawaran mendukung maksimal tiga foto JPG/PNG/WebP dengan total maksimal 3 MB. Catatan teks tetap ada.
8. Foto divalidasi dari isi berkas, di-encode ulang sebagai WebP, dibatasi 1800 x 1800 dan maksimal 1 MB per hasil. Metadata gambar tidak disalin. Foto disimpan privat di disk CMS Docker atau private Blob sesuai konfigurasi yang sudah ada.
9. Admin pusat dan admin divisi tujuan dapat melihat lampiran di detail permintaan. Pengunjung anonim dan divisi lain tidak memperoleh berkas. Foto tidak otomatis dikirim sebagai lampiran WhatsApp; formulir menjelaskannya.
10. Teks pada strip layanan hero diperbesar menjadi 14 px di desktop dan 12 px di mobile. Strip mobile membungkus baris. Baris material pada formulir ditata ulang untuk layar kecil, input mobile 16 px, dan tombol hapus memiliki target minimal 44 px.

## Alasan desain

- Palet: mempertahankan hitam, putih, dan merah sesuai arahan pengguna, bukan merombak identitas.
- Hierarki: identitas perusahaan dibedakan dari identitas layanan laser, sementara logo divisi lain tetap dipertahankan.
- Kolase: foto dokumentasi tidak ditutupi logo, sehingga material dan proses lebih mudah dilihat.
- Tipografi: strip layanan dan formulir diperbesar untuk pembaca umum, khususnya layar kecil.
- Footer: slogan didekatkan ke nama perusahaan besar sesuai anotasi klien.
- Upload: kontrol pilih berkas, pratinjau, hapus, batas ukuran, kondisi gagal, serta notifikasi tersimpan memiliki fungsi nyata.
- Arah visual antislop during: situs perusahaan baja untuk pembeli material dan pelanggan proyek, bahasa visual industrial hitam-putih-merah; ENERGY 2 / RHYTHM 2 / MOTION 1 untuk revisi ini. Tidak menambahkan animasi baru atau aset visual buatan.

## Verifikasi otomatis

Pengujian menggunakan direktori CMS sementara dan akun/foto sintetis. Tidak menulis, menghapus, atau me-list Blob produksi.

- PASS: build production dan TypeScript, termasuk route lampiran privat.
- PASS: `node frontend/scripts/test-client-revision.mjs`, tiga lampiran tersimpan, transformasi WebP, metadata terhapus, akses pusat/divisi tujuan, penolakan anonim/lintas divisi, range response, retry idempotent, dan lampiran tetap ada setelah edit.
- PASS: batas jumlah/ukuran, berkas rusak, consent tidak diberikan, divisi tidak dikenal, dan alur JSON lama tanpa foto.
- PASS: markup logo utama, slogan sebelum wordmark, hilangnya badge kolase, field foto serta catatan, dan penyedia stok yang sesuai produk.
- PASS: `node frontend/scripts/test-admin-auth-security.mjs`, 68 pemeriksaan.
- PASS: `node frontend/scripts/test-blob-optimization.mjs`, fixture cache/CAS dan operasi Blob, tanpa akses ke store produksi.
- PASS: `node frontend/scripts/test-october-revision.mjs`, lima akun divisi, 15 route, delapan submit serentak, stok, media privat, galeri, invoice dan 59 pemeriksaan HTTP artikel. Ekspektasi logo lama pada fixture diperbarui mengikuti revisi klien.

## Batas verifikasi / gate visual

Pemeriksaan kode React, skema, markup HTTP, dan aturan responsive sudah dilakukan. Namun gate visual dan click-through belum dapat dinyatakan PASS: inventori browser kosong, dan percobaan membuka IAB serta Chrome mengembalikan `Browser is not available`. Tidak ada klaim screenshot, klik UI, atau pengecekan overflow nyata yang belum dilakukan.

Sebelum rilis, periksa pada browser desktop dan viewport 360/390/768 px: logo header/footer dan kartu, posisi logo profil, galeri buka/tutup/Escape, strip hero, form tambah/hapus material, pilih/hapus/pratinjau foto, pesan validasi, submit berhasil, detail lampiran admin, serta fokus keyboard. Gate antislop visual tetap tertunda, bukan PASS menyeluruh.

Tidak ada commit, push, perubahan environment Vercel, maupun deployment produksi dalam revisi ini. Penambahan upload tidak mereset atau mengatasi pembatasan kuota Blob yang sudah terjadi.
