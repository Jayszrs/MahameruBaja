# CMS kontak dan ulasan

> Pembaruan 10 Oktober 2026: sumber kontak sekarang Excel (sepuluh admin, lima divisi), upload foto tersedia, dan konflik CMS memakai merge bagian independen. Lihat [audit terbaru](NOTULENSI-2026-10-10.md) dan [panduan local/hosting](DEPLOYMENT.md). Bagian sumber screenshot dan pengujian di bawah adalah riwayat implementasi lama, bukan sumber kontak aktif sekarang.

## Akses dan alur

- Masuk melalui `/admin/login`, lalu pilih **Kelola kontak & ulasan** atau buka `/admin/konten`.
- Kontak: isi nama, jabatan, telepon, seluler, WhatsApp, email, dan URL foto. Pilih divisi yang dilayani; tanpa pilihan berarti kontak bersama. Aktifkan **Terbit**, lalu **Simpan perubahan**.
- Ulasan: salin nama, bintang, komentar, tanggal, dan tautan sumber Google. Aktifkan **Terbit**, lalu simpan. Ulasan terbit tampil di carousel beranda yang bergerak ke kanan dan dapat digeser manual.
- Ringkasan rating, jumlah ulasan, tanggal pencatatan, dan tautan Google Maps juga dapat diedit. Ini pencatatan manual, bukan integrasi Google.
- Draf tidak dikirim ke payload publik. Perubahan memakai nomor revisi agar tab lama tidak menimpa perubahan yang lebih baru.

## Sumber data awal

Kontak diambil dari screenshot pengguna: Satria (Marketing), Ipung (Direktur), dan Andra (Owner). Email terpotong pada gambar sehingga tidak diisi. Penempatan kontak per divisi belum terverifikasi; semuanya diawali sebagai kontak bersama. Rating 4,5 dan 125 ulasan terlihat pada screenshot Google Maps yang diberikan pengguna pada 5 Oktober 2026.

Dua ulasan individual dapat dibaca pada screenshot pengguna: Mas Tikno dan Diyon putra @gmail.com Dulhadi, masing-masing 5 bintang, dengan cuplikan komentar yang terpotong. Keduanya dimasukkan ke data awal dan CMS lokal; kutipan tidak dilengkapi dengan kata yang tidak terlihat. Kartu lain dalam carousel adalah ringkasan serta ajakan menuju profil Google Maps, bukan ulasan buatan. Untuk menampilkan 125 komentar satu per satu diperlukan sumber data ulasan lengkap dari pemilik; angka 125 sendiri hanya ringkasan dari screenshot Google Maps. Website lama `https://steelindonesia.com/company/index.php` mengarah ke beranda direktori ketika diperiksa, sehingga tidak dipakai untuk menebak email atau kontak tambahan.

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


## Pembaruan desain ulasan

Kartu mengikuti referensi editorial pengguna dengan palet putih, merah, dan hitam: kutipan dengan font serif, avatar monogram, bintang SVG, dan carousel ke kanan yang dapat digeser manual. Tombol Jeda tersedia tanpa panah navigasi atau scrollbar. Saat hanya ada dua ulasan yang sumbernya terlihat, kartu ringkasan dan ajakan menuju Google Maps melengkapi putaran carousel tanpa mengarang komentar pelanggan.

Verifikasi pembaruan: typecheck dan build produksi lulus, 18 rute utama dan 51 tautan internal merespons tanpa error, serta cuplikan Mas Tikno muncul dalam HTML beranda. Belum ada verifikasi visual browser atau interaksi drag melalui perangkat nyata.
