# Revisi website — 31 Oktober 2026

Acuan: permintaan terbaru pengguna, gambar referensi, `Poin_Penting_Per_Topik_Website_Mahameru.pdf`, dan contoh invoice `001.INV MBI Bpk Irfan ISSC.pdf`. Permintaan terbaru untuk cara pesan bergambar berlaku menggantikan catatan lama tanpa gambar. Dokumen diskusi berisi usulan dan tindak lanjut; rincian pelanggan, rekening, tanda tangan, serta harga pada invoice contoh tidak disalin menjadi data transaksi baru.

## Pengelolaan konten

| Bagian | Tempat edit |
| --- | --- |
| Cara pesan: ilustrasi, teks singkat, urutan, tujuan tombol | CMS → Beranda → Tampilan website & quote → Cara pesan |
| Latar bagian layanan dan ajakan diskusi | Tampilan website & quote → Foto latar |
| Pertanyaan cepat beserta tautan tujuan | Tampilan website & quote → Tombol kebutuhan / FAQ |
| Quote / kata mutiara dan gambar | Tampilan website & quote → Quote / kata mutiara |
| Foto, teks, dan tujuan kartu jasa | Tampilan website & quote → Kartu jasa |
| Logo dan label Member of ISSC / API | Tampilan website & quote → Keanggotaan di header |
| Gambar kartu setiap divisi di beranda | CMS → Isi website → Profil divisi → Media → Media kartu divisi di beranda |
| Poster landscape desktop dan portrait HP | CMS → Banner & poster → unggah poster desktop / mobile pada konten yang dipilih |
| Album desain, portofolio pekerjaan, dan kegiatan | CMS → Galeri & proyek → Jenis album |
| FAQ lengkap divisi; FAQ Jasa utama memakai profil Laser Cutting | CMS → Profil divisi → FAQ |
| Nomor, nama, bagian sales | CMS → Kontak & divisi |
| Ulasan Google | CMS → Ulasan Google |
| Artikel, foto artikel, dan isi berita | CMS → Artikel |

Pilih website utama atau website divisi sebelum menyunting tampilan. Admin divisi hanya dapat menyunting milik divisinya. Gambar unggahan baru perlu disimpan bersama kontennya agar terbit. Tautan pertanyaan cepat harus memakai halaman di website. Perubahan memiliki pemeriksaan konflik agar penyimpanan bersamaan tidak menimpa konten admin lain.

## Perubahan publik

- Pilihan sales membuka semua nomor WhatsApp aktif pada divisi itu. Pelanggan memilih satu kontak. Tersedia Sales WF dan Plat.
- Semua kutipan ulasan yang diterbitkan dimuat sejak awal; jumlah mengikuti data CMS, tanpa tombol pembatas delapan kutipan.
- Cara pesan menjadi empat langkah singkat dengan ilustrasi bawaan yang dapat diganti.
- Poster otomatis tetap muncul saat masuk; desktop memakai jendela landscape, HP portrait. Dua gambar khusus dapat diunggah agar komposisi artwork sesuai perangkat. Gambar lama tetap ditampilkan utuh jika varian baru belum diunggah.
- Halaman Jasa memiliki tombol Jelajahi desain dan Lihat hasil pekerjaan, album desain, portofolio, serta jasa sandblasting. Referensi desain tidak muncul sebagai proyek yang sudah dikerjakan.
- `/galeri` untuk kegiatan perusahaan; `/proyek` untuk dokumentasi proyek, termasuk suplai material. Admin memilih jenis album saat menerbitkan.
- Foto beranda, kartu divisi, serta kartu jasa memiliki jalur unggah CMS. Tidak diperlukan foto hasil kerja buatan untuk mengisi album kosong.
- Kop dan tabel PDF permintaan penawaran mengikuti identitas perusahaan pada contoh invoice. PDF dibuat otomatis setelah permintaan disimpan; harga dan jadwal dikonfirmasi tim.
- File desain yang dipilih disimpan sementara di halaman pelanggan. Perangkat yang mendukung berbagi berkas dapat mengirim PDF dan desain melalui menu berbagi WhatsApp. Perangkat lain mengunduh PDF, lalu pelanggan melampirkan desain asli di WhatsApp. Metadata permintaan masuk ke pipeline CMS; file CAD tidak disimpan permanen di server.
- Identitas publik menggunakan Distributor Besi Baja untuk penyebutan MBI Trading, dengan alamat URL lama tetap berlaku. Pertanyaan cepat juga mencakup UPVC Atlas.
- Header menampilkan keanggotaan ISSC/API. Logo ISSC bersumber dari [situs ISSC](https://issc.or.id/). Logo API dapat diunggah setelah berkas resminya tersedia.
- Inggris dan Mandarin tersedia melalui pilihan terjemahan Google. Pada HP, buka menu utama → Bahasa / Language.
- Artikel memakai judul editorial di latar terang, foto utama terpisah, kolom baca, informasi terbit, tombol berbagi, dan bacaan terkait.
- Profil perusahaan tetap memuat visi/misi dan penjelasan review gambar, kebutuhan/RAB, fabrikasi, serta erection.

## Operasional yang memerlukan akun atau bahan pemilik

Pengguna mengonfirmasi pada 31 Oktober 2026 bahwa domain belum dibeli dan website masih memakai Vercel. Domain, hosting, serta email `sales@mahamerubaja.com` dan `info@mahamerubaja.com` menunggu pembelian domain dan konfigurasi akun. Jangan menampilkan alamat email yang belum aktif.

Foto pabrik, foto produk UPVC Atlas, album desain, portofolio laser asli, dokumentasi kegiatan, dan logo API dapat diunggah lewat CMS ketika diberikan tim. Struktur dan kategori sudah tersedia.

Folder bahan foto sudah dibuat dan diverifikasi di [Album Website Mahameru](https://drive.google.com/drive/folders/1sjGgGIn1YLraPDr-tLyvqW0GnbOEEzbV), dengan struktur `Album Website Mahameru/{Produk,Desain Laser,Portofolio,Kegiatan,Logo}`. Simpan foto asli resolusi tinggi dan catat pemilik serta deskripsi tiap album. Akses edit diberikan kepada akun tim yang ditentukan pemilik; jangan membuat tautan edit publik untuk dokumen bisnis secara otomatis.

WhatsApp Business perlu diatur pada aplikasi milik tim. Teks balasan yang siap dipakai:

> Terima kasih telah menghubungi Mahameru Baja Indonesia. Silakan kirim kebutuhan material atau jasa, ukuran, jumlah, dan lokasi. Jika ada gambar kerja, sertakan berkasnya. Tim sales akan membantu mengecek kebutuhan dan penawaran Anda.

Tambahkan katalog WhatsApp dari produk dan jasa yang sudah dikonfirmasi. Website tidak mengirim pesan otomatis ke pelanggan. Penawaran, balasan, dan pengiriman berkas tetap melalui kontak yang dipilih.

## Pemeriksaan

Jalankan typecheck dan build frontend. Untuk pengujian CMS gunakan penyimpanan percobaan, bukan database/Blob live:

```text
ARTICLE_TEST_ISOLATED=1
REVISION_TEST_URL=http://localhost:3108
node frontend/scripts/test-customer-revision.mjs
node frontend/scripts/test-request-pdf.mjs
node frontend/scripts/test-request-handoff.mjs
```

`ARTICLE_PLAYWRIGHT_MODULE`, `ARTICLE_CHROMIUM_EXECUTABLE`, dan `REVISION_ARTIFACT_DIR` dapat disetel mengikuti lingkungan. PDF contoh dan uji pagination harus dirender serta diperiksa sebelum publikasi.
