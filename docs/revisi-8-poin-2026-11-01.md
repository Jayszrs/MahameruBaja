# Revisi berdasarkan 8 screenshot — 1 November 2026

Permintaan terbaru ini menggantikan batas Galeri pada audit sebelumnya.

| Poin | Hasil |
|---|---|
| 1 | Galeri mengumpulkan foto dari konten yang sudah dipublikasikan, termasuk proyek, kegiatan, produk, layanan, dan referensi. Filter mengikuti kategori foto/album, termasuk Laser cutting & bending. Ada pencarian dan lightbox. Draf/unggahan privat tidak ditampilkan; referensi tetap diberi sumber. Logo, portrait tim, dan poster promo tidak dicampur ke arsip kegiatan. |
| 2 | Bagian tambahan “Lihat material dari dekat” di bawah Proyek dihapus. Album proyek asli tetap tersedia. |
| 3 | Bagian panjang alamat, harga, dan pengiriman di bawah Produk dihapus. |
| 4 | Tidak dikerjakan, sesuai koreksi pengguna. Popup gambar saja dari revisi sebelumnya tetap dipertahankan. |
| 5 | Footer menggunakan lembar logo asli resolusi penuh, membersihkan tepi abu/putih pada artwork merah/emas/hitam, tanpa outline CSS atau menggambar ulang logo. |
| 6 | Integrasi terjemahan langsung di halaman disiapkan, termasuk pilihan bahasa yang bertahan saat navigasi, teks dinamis, label, serta pemulihan ID. **Belum aktif: API key Google Cloud milik pemilik website belum ada.** English/中文 ditandai segera, bukan diklaim sudah bekerja. Lihat [panduan aktivasi](terjemahan-website.md). |
| 7 | Konsultasi Jasa menjadi ringkasan tiga data yang diperlukan, tombol sales, tombol Maps, dan ajakan kirim desain. |
| 8 | Panduan Jasa menjadi tiga pilihan Potong/Tekuk/Rakit dan empat tahap pemesanan. Pilihan layanan otomatis mengisi form konsultasi. Teks tetap tersedia lewat CMS teks, dengan katalog diperbarui. |

Validasi: build produksi dan TypeScript lulus; foto publik/deduplikasi/sumber lulus; browser 320, 390, 768, 1440 px tanpa overflow; filter, lightbox, pilihan layanan → form, penghapusan bagian Proyek/Produk, dan sumber logo footer diperiksa. Jalur API terjemahan diuji dengan respons provider tiruan untuk validasi, cache, origin, ketiadaan key, dan batas panggilan. UI terjemahan diuji dengan respons tiruan untuk navbar/footer, pergantian halaman, filter dinamis, dan kembali ID. **Tidak ada panggilan Google berbayar atau pengiriman lead/WhatsApp percobaan.**
