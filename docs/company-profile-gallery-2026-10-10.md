# Mitra, supplier, dan album proyek

Sumber visual: `COMPRO MBI TERUPDATE HAPUS AKTE.pdf`, diberikan pengguna 10 Oktober 2026. PDF terdiri dari halaman gambar, bukan teks/vector. Gambar diekstrak dari resolusi asli halaman 1056 × 1493; tidak diperbesar atau direkonstruksi dengan AI.

## Perusahaan mitra dan supplier

Bagian perusahaan mitra menggunakan penegasan pengguna bahwa perusahaan yang tampil telah bekerja sama: Astra, Mandiri, WIKA, PP, ADHI, TOTAL. Daftar ini bukan hasil ekstraksi PDF, yang hanya memiliki daftar supplier. Kalimat contoh/preview diganti menjadi kalimat kerja sama, tanpa mengklaim kontrak aktif atau dukungan/endorsement resmi.

Supplier merupakan bagian terpisah: 17 logo pada halaman 18 “Our Supplier”, disalin dari PDF, bukan pencarian web. Logo persegi hitam-merah tanpa nama ditampilkan sesuai PDF tanpa nama perusahaan yang dikarang; pengguna memilih demikian. Logo HSC ditulis sebagai HSC karena tulisan kecil tidak cukup jelas untuk menebak nama badan hukum.

## Galeri pengalaman proyek

Halaman Galeri `/proyek` menampilkan album berikut, sesuai kelompok “Project Experience” halaman 7–17:

| Halaman PDF | Album | Foto |
| --- | --- | ---: |
| 7 | Rumah Tinggal & Villa | 8 |
| 8 | Welding Robot Station | 6 |
| 9 | Tower Monopol & ERP | 7 |
| 10 | Gedung Arsip | 6 |
| 11 | Painting | 6 |
| 12 | Floor Coating | 9 |
| 13 | Perkuatan Gedung | 9 |
| 14 | Lantai Mezanin | 9 |
| 15 | Railing Stainless Steel | 7 |
| 16 | Beautifikasi Jembatan Ajibata, Toba–Samosir | 10 |
| 17 | Jembatan Pelengkung Tanjung Lesung, Banten | 9 |

Total 86 foto. Satu foto berulang pada halaman 16 tidak diimpor dua kali. Setiap foto dipisah dari kolase tanpa bingkai merah, judul halaman, atau logo dokumen. Halaman legalitas/NPWP tidak dimasukkan sebagai aset website. Tahun, lokasi yang tidak tertulis, nama klien, nilai kontrak, spesifikasi teknik, dan status penyelesaian proyek tidak ditebak.

Klik satu album untuk membuka dialog galeri: foto besar, tombol sebelumnya/berikutnya, thumbnail, penghitung, keterangan, dan kontak divisi. Tombol panah keyboard, Escape, fokus dialog, dan pengembalian fokus didukung. Foto sumber yang kecil tetap memiliki batas ketajaman asli PDF.

## CMS

Dashboard → Galeri & proyek (`/admin/galeri`). Pengelolaan konten company profile dibagi bersama oleh admin yang sudah login, mengikuti pola konten company profile lainnya.

- Tambah/ubah/hapus album, judul, kategori, divisi, lokasi/periode opsional, dan deskripsi.
- Unggah beberapa JPG/PNG/WebP sekaligus melalui storage yang sudah ada. Batas unggahan per foto: 4 MB di Vercel, 30 MB lokal; maksimal 40 foto per album dan 80 album.
- Atur sampul, urutan album/foto, teks alternatif, keterangan foto, draf/terbit.
- Klik Simpan perubahan setelah unggah/edit. Draf dan seluruh metadata/fotonya tidak dikirim ke halaman publik. Hapus album/foto hanya menghapus referensinya, bukan berkas storage.
- Album publik muncul di galeri utama dan galeri divisi sesuai pilihan. Album seed PDF ditempatkan di divisi Fabrikasi & Erection; admin dapat memperbaiki penempatan.
- Ringkasan disimpan melalui site-content CMS yang sudah ada. Penyimpanan dari snapshot galeri kedaluwarsa menghasilkan 409, bukan menimpa perubahan diam-diam.
- Data lama yang belum memiliki field `galleryProjects` memperoleh album awal; array yang sudah disimpan, termasuk kosong, tidak diisi ulang setelah penghapusan admin.

Ekstraksi yang dapat diulang: `python frontend/scripts/extract-compro-assets.py <path-pdf>` (PyMuPDF dan Pillow). Aset berada di `frontend/public/images/compro/` dalam WebP, total sekitar 2,5 MB. Jangan memasukkan PDF lengkap ke public karena dokumen memuat halaman administrasi perusahaan.

## Verifikasi

Halaman relevan dan contact sheet seluruh aset hasil ekstraksi diperiksa secara visual. Typecheck frontend dan production build lolos. Tes integrasi lokal terisolasi memeriksa 17 supplier, 11 album, 86 foto, mezanin 9 foto, upload/storage, CMS login, perubahan urutan/sampul/keterangan, publikasi/penghapusan, validasi, konflik edit, privasi draf, dan filter divisi; tes regresi invoice/artikel/stok juga lolos.

Browser tersedia untuk QA: tidak ada pada sesi ini; tampilan/interaksi browser belum diverifikasi secara langsung. Belum commit, push, atau deploy.
