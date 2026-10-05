# CMS kontak dan ulasan

## Akses dan alur

- Masuk melalui `/admin/login`, lalu pilih **Kelola kontak & ulasan** atau buka `/admin/konten`.
- Kontak: isi nama, jabatan, telepon, seluler, WhatsApp, email, dan URL foto. Pilih divisi yang dilayani; tanpa pilihan berarti kontak bersama. Aktifkan **Terbit**, lalu **Simpan perubahan**.
- Ulasan: salin nama, bintang, komentar, tanggal, dan tautan sumber Google. Aktifkan **Terbit**, lalu simpan. Ulasan terbit tampil di carousel beranda yang bergerak ke kanan dan dapat digeser manual.
- Ringkasan rating, jumlah ulasan, tanggal pencatatan, dan tautan Google Maps juga dapat diedit. Ini pencatatan manual, bukan integrasi Google.
- Draf tidak dikirim ke payload publik. Perubahan memakai nomor revisi agar tab lama tidak menimpa perubahan yang lebih baru.

## Sumber data awal

Kontak diambil dari screenshot pengguna: Satria (Marketing), Ipung (Direktur), dan Andra (Owner). Email terpotong pada gambar sehingga tidak diisi. Penempatan kontak per divisi belum terverifikasi; semuanya diawali sebagai kontak bersama. Rating 4,5 dan 125 ulasan terlihat pada screenshot Google Maps yang diberikan pengguna pada 5 Oktober 2026.

Teks komentar individual belum tersedia. Jangan mengisi testimoni karangan sebagai ulasan Google. Carousel aktif ketika ada ulasan asli yang diterbitkan; selama kosong, situs menampilkan ringkasan rating dan tautan sumber. Website lama `https://steelindonesia.com/company/index.php` mengarah ke beranda direktori ketika diperiksa, sehingga tidak dipakai untuk menebak email atau kontak tambahan.

## Penyimpanan

Konten disimpan secara atomik ke `site-content.json` dalam `CMS_DATA_DIR`, atau `.cms-data` di working directory frontend jika variabel tidak diatur. Direktori ini diabaikan Git. Proses Next harus memiliki izin tulis. Data bertahan saat server direstart di mesin yang sama.

Untuk hosting, tetapkan `CMS_DATA_DIR` ke volume persisten dan buat backup berkala. Implementasi ini cocok untuk satu instance Next di server/container dengan disk persisten. Jangan memakai disk sementara serverless atau banyak instance tanpa mengganti penyimpanan ke database bersama. Lock file mencegah penulisan bersamaan; jika proses mati saat menulis, periksa tidak ada proses penulis aktif sebelum menghapus `site-content.json.lock` yang tertinggal.

Endpoint `/api/admin/content` memerlukan sesi admin. Penulisan memeriksa origin, ukuran payload, schema, URL, dan revisi. Kontak dan ulasan tidak bergantung pada API lead/PostgreSQL yang terpisah. Foto menerima path lokal `/images/...` atau URL HTTPS; upload berkas belum bagian dari editor ini.

## Pengujian

- TypeScript dan build produksi: lulus.
- Beranda, kontak, empat halaman divisi: HTTP 200.
- Akses tanpa login: API 401 dan editor mengarah ke login.
- Penulisan lintas origin dan URL gambar berbahaya: ditolak.
- Penyimpanan serta baca ulang server: lulus; revisi lama ditolak dengan 409.
- Ulasan draf tidak muncul di HTML/payload beranda.
- Render carousel, bintang, tautan sumber, filter kontak per divisi, dan normalisasi nomor WhatsApp: lulus menggunakan fixture khusus pengujian yang tidak diterbitkan.
- Verifikasi interaksi visual langsung belum dilakukan karena tidak ada browser yang tersedia melalui alat browser sesi ini.
