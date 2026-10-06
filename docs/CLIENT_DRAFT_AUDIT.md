# Audit draft permintaan Mahameru Baja

Sumber: `Draft_Permintaan_Mahameru_Baja.pdf` (25 halaman hasil pindai). Audit ini membandingkan isi dokumen dengan implementasi lokal pada 6 Oktober 2026. Status **Ada** berarti fungsi atau konten dapat dipakai; **Sebagian** berarti baru sebagian alur; **Belum** berarti belum tersambung secara nyata.

## Keputusan struktur

Draft bagian 3 dan 6 menyebut empat jalur bisnis: Mahameru Baja Tambun, Garuda Marginal Baja Cibitung, Mahameru Baja Indonesia Trading, dan MBI Laser Cutting. Bagian 19 menegaskan semuanya harus terasa seperti satu perusahaan, bukan empat bisnis yang berdiri sendiri. Implementasi memakai satu domain dengan halaman pemilih `/divisi` dan empat halaman `/unit/...` yang punya konten, foto, penawaran, serta tautan silang. Ini juga memusatkan otoritas SEO dan memudahkan pengunjung kembali ke katalog bersama.

## Kesesuaian kebutuhan publik

| Bagian draft | Status | Kondisi sekarang |
| --- | --- | --- |
| 1. Tujuan situs | Sebagian | Profil, katalog, WhatsApp, dan form lead tersedia. Order dan operasional admin belum penuh. |
| 2. Domain & SEO | Sebagian | Metadata, canonical unik, sitemap, dan konten lokal tersedia. Domain publik, Search Console, indeksasi, serta hasil ranking perlu diuji setelah peluncuran. |
| 3. Empat jalur bisnis | Ada untuk halaman publik | `/divisi` menghubungkan empat microsite, masing-masing lima halaman dengan navigasi sendiri. Nomor kontak khusus tiap unit belum tersedia. |
| 4. Menu utama | Sebagian | Beranda, produk, divisi, laser, layanan, proyek/galeri, tentang, artikel, dan kontak ada. Label retail/trading/fabrikasi dipusatkan di halaman divisi. |
| 5–6. Home & empat pilihan | Ada | Hero mengutamakan laser cutting; empat kartu mengarah ke halaman unit. Material tetap tersedia di katalog. |
| 7. Katalog produk | Sebagian | Kategori, foto, detail dasar, dan jalur tanya harga ada. Stok, harga, ukuran, dan katalog per unit belum tersambung ke inventori/CMS. |
| 8. Empat WhatsApp | Belum | Pemilih divisi ada, tetapi semuanya menuju nomor kontak utama karena nomor khusus belum diberikan. |
| 9. Form minta harga | Sebagian | Form menyimpan permintaan pada store persisten, muncul di CMS, dan membuat PDF ringkasan secara otomatis. Berbagi berkas lewat WhatsApp tetap memerlukan tindakan pelanggan pada perangkatnya. |
| 10. Form laser & upload desain | Sebagian | Data pekerjaan dan nama file masuk lead. Berkas desain belum tersimpan; pelanggan diminta mengirim lampiran lewat WhatsApp. |
| 11. Database calon pelanggan | Sebagian | Permintaan publik tersimpan persisten dan dapat dicari, diubah statusnya, ditambah manual, diarsipkan, serta dipulihkan dalam CMS. Penugasan PIC dan integrasi order belum ada. |
| 12. Analitik pengunjung | Belum | Belum ada pengukuran pengunjung, sumber trafik, klik WhatsApp, dan konversi formulir. |
| 13. Galeri | Sebagian | Galeri dan filter publik ada. Foto, caption, dan kategori belum bisa dikelola lewat CMS. |
| 14. Kontak empat unit | Sebagian | Direktori Satria, Ipung, dan Andra mengikuti screenshot pengguna. CMS menyimpan nomor, email, foto, status terbit, dan pilihan divisi. Alamat khusus serta pembagian PIC per divisi masih perlu data resmi; kontak awal ditampilkan bersama. |
| 15. SEO lokal | Sebagian | Halaman laser, katalog, divisi, dan unit memuat informasi lokal yang relevan. Perlu foto pekerjaan asli, lokasi terverifikasi, tautan Google Business, dan pemantauan Search Console setelah online. |
| 17. Integrasi marketing | Sebagian | WhatsApp terhubung. Instagram/TikTok dari pengguna serta kanal YouTube bernama Mahameru Baja Indonesia ditautkan; halaman sosial dan editor persisten tersedia. Kepemilikan YouTube belum dikonfirmasi pengguna; Facebook belum ditemukan secara meyakinkan. |
| 18–19. Struktur & prinsip | Ada untuk navigasi publik | Satu situs menghubungkan katalog, permintaan harga, laser, dan empat unit; alur back-office belum lengkap. |

## Dashboard dan proses internal

| Bagian draft | Status | Kondisi sekarang |
| --- | --- | --- |
| 16. Panel admin | Sebagian | Login dan sesi admin aktif. Dashboard menampilkan angka dan permintaan riil; `/admin/permintaan` memberi CRUD permintaan, `/admin/konten` mengelola kontak/ulasan, dan `/admin/sosial` mengelola kanal. Analitik pengunjung belum tersedia. |
| 20. Proses trading | Belum | Status contoh dan skema awal tersedia; cek stok, quotation, PO, invoice, pembayaran, memo, surat jalan, dan pengiriman belum menjadi alur data yang persisten. |
| 21. Proses laser | Sebagian | Request laser tersimpan, dapat diubah statusnya di CMS, dan dapat menghasilkan PDF kebutuhan. Review gambar, SPK, jadwal produksi, QC, dan invoice belum menjadi alur transaksional. |
| 22–23. Status & dashboard | Sebagian | Status permintaan dan catatan internal tersimpan dengan kontrol revisi. Alur order, produksi, dan finansial penuh belum tersambung. |
| 24. Nomor dokumen otomatis | Sebagian | Setiap permintaan memiliki ID unik `MBI-YYYYMMDD-XXXXXXXX` dan PDF ringkasan. Nomor quotation/invoice transaksional belum diterapkan. |
| 25. Folder file/dokumen | Belum | Pilihan upload hanya antrean pratinjau; object storage dan akses per order/customer belum aktif. |
| 26. Sistem modular | Sebagian | Frontend, API, database, dan infrastruktur terpisah. Modul operasional perlu endpoint, izin akses, audit trail, dan integrasi penyimpanan. |

## Data yang dibutuhkan untuk menyelesaikan gap

### Kondisi pengujian lokal

Build produksi, typecheck, 18 rute utama, dan 51 tautan internal lulus. Alur API pada port 3010 dengan data uji terpisah lulus untuk buat permintaan, cegah duplikasi, ubah status, arsip/pulihkan, buat manual, validasi, izin admin, dan revisi konten. Modul CMS Next ini tidak membutuhkan PostgreSQL lokal; workflow API Fastify dan PostgreSQL tetap terpisah. Verifikasi visual browser pada perangkat nyata belum dilakukan.

### Kelengkapan data

1. Nomor WhatsApp, alamat, jam layanan, dan katalog khusus untuk setiap divisi.
2. Foto asli mesin, proses cutting/bending, hasil pekerjaan, dan proyek beserta izin tayang serta caption.
3. Akses operasional untuk memutuskan siapa yang menerima lead, tahapan persetujuan quotation/PO/SPK, dan format nomor dokumen.
4. Kredensial layanan analitik/Search Console dan persetujuan privasi sebelum pelacakan publik diaktifkan.
5. Cuplikan ulasan Mas Tikno dari screenshot pengguna sudah ditampilkan. Ulasan lain memerlukan sumber yang dapat diverifikasi; angka rating masih dicatat manual dan bukan sinkronisasi langsung.

Tidak ada jaminan peringkat pertama Google dari perubahan on-page saja. Google menilai relevansi, kualitas konten, persaingan, dan sinyal lain setelah situs dapat dirayapi dan diindeks.


## Pembaruan microsite, sosial, dan responsive

Empat unit kini memiliki 20 halaman yang ditautkan, dengan produk/layanan, tentang, galeri, dan kontak. Hasil uji terbaru serta batas verifikasi dijelaskan di `MICROSITES_SOCIAL_RESPONSIVE.md`. Modul operasional dan kebutuhan data asli pada audit di atas tetap berlaku.
