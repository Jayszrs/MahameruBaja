# Album, galeri seluruh website, APPI, dan PDF produk

Revisi lanjutan 31 Oktober 2026 berdasarkan arahan pengguna setelah publikasi CMS.

- Empat album referensi memuat 22 foto: 8 ornamen, 5 komponen, 5 tekukan, dan 4 contoh marking. Foto berasal dari halaman [Portofolio PT. Nugraha Potong Tekuk Plat](https://nugrahapotongtekukplat.com/portofolio/) yang ditautkan dari halaman Tentang yang diberikan pengguna. Nama sumber dan tautan dipertahankan pada kartu album, pembesar foto, dan galeri. Gambar ini berstatus referensi desain, bukan proyek Mahameru. Watermark asli tetap dipertahankan.
- CMS → Galeri & proyek menyediakan kolom nama dan URL sumber. Admin dapat mengganti foto, menambah foto sendiri, atau menonaktifkan album. Migrasi menambahkan album contoh sekali; penghapusan atau perubahan setelah disimpan tidak diulang pada pembacaan berikutnya.
- `/galeri` menggabungkan foto dari album, produk yang terdaftar, divisi aktif, hero, promosi dalam periode tayang, artikel terbit, sosial media terbit, foto tim, tampilan website, dan logo publik. Foto yang sama ditampilkan sekali. Pengunjung dapat mencari, memfilter kategori, dan memperbesar foto. Draft dan berkas permintaan pelanggan tidak masuk galeri.
- Tujuh ilustrasi layanan berbentuk SVG mengikuti gaya ilustrasi website. Teks dipersingkat menjadi satu kalimat per pilihan.
- Logo APPI menggunakan PNG transparan yang diberikan pengguna, dipangkas pada ruang kosong dan dioptimalkan menjadi WebP tanpa mengganti gambar logonya. Label mengikuti nama pada logo: Member of APPI — Asosiasi Pengusaha Pengelasan Indonesia. Tetap dapat diganti melalui CMS → Tampilan website → Keanggotaan.
- Popup memakai poster utuh, panel informasi terang, ringkasan, dan tombol WhatsApp hijau. Versi HP memprioritaskan poster, judul, dan tombol kontak; poster dapat diperbesar.

## PDF dari produk

Daftar penawaran disimpan di browser, termasuk jumlah dan catatan. Setelah refresh, produk tetap masuk ke form. Checkout dari produk tidak menampilkan kolom unggah file. Pelanggan melengkapi kontak dan menekan **Buat PDF & lanjut WhatsApp**.

Permintaan yang tersimpan memperoleh tautan PDF otomatis. Tombol **Kirim daftar & PDF ke WhatsApp** memasukkan rincian produk dan tautan tersebut ke teks WhatsApp sehingga pelanggan tidak harus memilih berkas. WhatsApp menerima tautan, bukan lampiran yang disisipkan secara diam-diam. Pelanggan tetap menekan Kirim pada WhatsApp.

Tautan PDF:

- Dibuat untuk satu ID permintaan, ditandatangani HMAC, dan berlaku tujuh hari.
- Memakai `REQUEST_PDF_SECRET` bila tersedia, atau `ADMIN_SESSION_SECRET` yang sudah digunakan CMS. Rahasia tidak dikirim ke browser.
- Memerlukan token yang cocok; token hilang, diubah, atau kedaluwarsa menghasilkan 404.
- Menghasilkan PDF saat dibuka; file PDF tidak disimpan permanen. Respons memakai `private, no-store` dan `noindex`.
- Font dan logo dimasukkan dalam file tracing fungsi Vercel. Unduh PDF lokal dan berbagi berkas dari perangkat tetap tersedia sebagai pilihan tambahan.

## Validasi

```text
node frontend/scripts/test-photo-privacy-and-pdf-links.mjs
ARTICLE_TEST_ISOLATED=1 node frontend/scripts/test-gallery-product-flow.mjs
```

Tes browser memakai CMS percobaan. Pengujian mencakup album dan sumber foto, filter galeri, tujuh ilustrasi, keranjang setelah refresh, checkout tanpa unggahan, PDF otomatis, tautan dalam pesan WhatsApp, penolakan token tidak valid, dan header pada lebar 320, 390, serta 768 piksel.
