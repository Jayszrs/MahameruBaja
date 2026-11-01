# Audit dan revisi CMS / company profile — 1 November 2026

Audit memakai alur Impeccable: pemeriksaan implementasi, label, responsif, aksesibilitas, dan kecocokan CMS dengan halaman publik. Pengguna mengizinkan audit sekaligus perbaikan yang jelas; QR ditunda atas permintaan pengguna.

## Status 16 poin

| No. | Permintaan | Hasil dan lokasi pengelolaan |
|---|---|---|
| 1 | Popup desktop landscape, HP portrait | Empat gambar desktop landscape dibuat terpisah. HP mempertahankan poster portrait asli. CMS → Header, footer & popup → Popup iklan saat masuk. Unggahan ke slot komputer menolak gambar portrait; slot HP menolak landscape. |
| 2 | CMS Jasa dan penamaan sesuai halaman | Menu mengikuti navbar: Beranda, Tentang Kami, Produk, Jasa, Proyek, Galeri, Artikel, Kontak, Sosial Media. Jasa memiliki editor sendiri. Panduan tiap halaman menyebut heading, tujuan unggahan, dan editor yang benar. |
| 3 | Jelajahi desain di Jasa | Tersedia 4 album / 22 foto referensi dengan sumber; tidak diklaim sebagai pekerjaan Mahameru. CMS → Jasa → Jelajahi desain / referensi. |
| 4 | Galeri untuk aktivitas Mahameru | `/galeri` hanya menampilkan album berjenis kegiatan perusahaan. Foto produk dan referensi tidak lagi masuk di sini. CMS → Galeri → Album kegiatan Mahameru. |
| 5 | Cara pesan ringkas dan ilustratif | Empat ilustrasi dengan judul pendek: Pilih kebutuhan, Kirim daftar/desain, Cek harganya, Oke? Kami proses. Semua teks, ilustrasi, dan tautan dapat diubah pada Beranda → Cara pesan. |
| 6 | Identitas Mahameru juga melayani cutting | Hero utama sudah memprioritaskan laser cutting. Pengantar diperjelas: “Bajanya ada. Potong dan bentuknya juga bisa.” Jalur Jasa, referensi desain, portofolio, dan konsultasi tetap tersedia. |
| 7 | Pembagian nomor sales | Lima kategori kebutuhan. Setiap kategori membuka kontak aktif yang ditugaskan lewat CMS → Kontak → Pembagian sales & email. Jumlah kontak tidak dikunci dua. Tombol WA utama mengambil kontak retail Tambun pertama yang aktif, lalu kontak aktif lain jika tidak tersedia; tidak lagi bergantung pada nomor literal di kode. |
| 8 | Footer dibagi per divisi | Footer utama menampilkan divisi aktif, logo, alamat, lokasi, website divisi, dan kontak admin dari data CMS yang sama. Profil/alamat/logo di Profil divisi; admin di Kontak. Nomor pada footer merupakan tautan telepon. |
| 9 | Scan QR | Ditunda atas jawaban pengguna: “itu mah nanti aja”. Tidak dibuat QR dengan tujuan yang diasumsikan. |
| 10 | Tombol kartu produk untuk admin | Pengunjung memakai Detail, Penawaran, dan WA. Admin mengelola nama, foto, spesifikasi, stok, publikasi, dan penghapusan melalui CMS Produk. Hak edit tidak ditambahkan ke kartu publik. |
| 11 | Impresi lima layanan dalam satu tempat | Heading diubah menjadi “5 layanan kebutuhan baja. Satu Mahameru.” Penjelasan menyebut beli besi, suplai proyek, potong, tekuk, dan fabrikasi. |
| 12 | Urutan edit sesuai halaman dan kontrol konten | Panduan 9 halaman mengikuti urutan bagian, dengan tautan editor yang relevan. Quick FAQ dapat ditambah. Beranda/Jasa memiliki kontrol tampil/sembunyikan section. Kartu kebutuhan, jasa, proses, quote, album, dan keanggotaan memiliki tambah, ubah, susun, unggah, dan hapus. Logo header, latar footer, serta hero Tentang Kami juga mempunyai kolom gambar. Ini pengelolaan konten, bukan editor bebas untuk mengganti struktur HTML, validasi form, atau rute aplikasi. |
| 13 | Tombol terjemahan jelas sejak awal | “Bahasa / Language” terlihat pada header desktop dan bar khusus HP. English/Mandarin membuka Google Translate untuk halaman publik yang sedang dilihat; bukan penerjemahan lokal otomatis dan bukan penulisan ulang isi CMS. |
| 14 | Member of | ISSC dan APPI tampil di header. Logo APPI sesuai berkas pengguna. CMS → Header, footer & popup → Member of — ISSC / APPI. Label keanggotaan tidak disebut lisensi/sertifikasi. |
| 15 | Album kegiatan | Mendukung beberapa foto, sampul, kategori, urutan, draf/publikasi, penghapusan foto dan album. **Foto family gathering asli belum diberikan**, sehingga album tidak diisi foto perusahaan lain. |
| 16 | Email tampil di mana | Email pada Kontak ditampilkan di kartu kontak bila kolomnya diisi; bisa diubah lewat CMS Kontak. Tidak dijadikan elemen mengambang. Domain dan email perusahaan baru belum dibuat karena domain belum dibeli. |

## Tambahan: Google Maps MBI Laser Cutting

Sumber: berkas pengguna `mbi laser cutting - Penelusuran Google.html`, dicatat 1 November 2026. File berisi **5,0/5 dari 16 ulasan**: **14 komentar dan 2 penilaian tanpa komentar**. Seluruh 16 ID unik berhasil diambil. Untuk ulasan dengan versi ringkas dan versi lengkap, importer memilih versi lengkap.

- Profil sumber: [MBI Laser Cutting di Google Maps](https://www.google.com/maps?cid=11804939362540675168).
- Data ini khusus divisi Laser Cutting; rating dan kutipan retail Tambun/Garuda tidak diganti.
- Ditampilkan di `/jasa` dan `/unit/laser-cutting`.
- CMS → Jasa → Ulasan Google Maps Laser, atau Kontak → Ulasan Google → profil Laser Cutting.
- Dua ulasan kosong tetap kosong di data. UI menjelaskan bahwa penulis memberi bintang tanpa komentar; tidak membuat komentar pengganti.
- Import sekali menambah ulasan yang belum ada. Setelah admin menyimpan penghapusan atau penonaktifan, pembacaan berikutnya tidak menghidupkannya kembali. Snapshot dapat dipulihkan secara sengaja dari CMS.
- Rekam jejak sumber ada pada `frontend/data/laser-google-reviews-source.json`. HTML lengkap tidak dimasukkan ke repository karena memuat konten akun/browser di luar ulasan publik.
- Ini snapshot dari file pengguna, bukan klaim sinkronisasi Google Maps otomatis.

## Temuan audit yang diperbaiki

| Prioritas | Temuan awal | Dampak | Perbaikan |
|---|---|---|---|
| P1 | Tidak ada ruang kerja bernama Jasa | Admin harus menebak lokasi edit dan beberapa kartu masih statis | Editor Jasa, panduan halaman, dan kontrol konten langsung |
| P1 | Galeri menggabungkan produk/referensi/kegiatan | Tidak sesuai makna Galeri kegiatan yang diminta | Filter album kegiatan; desain tetap di Jasa dan proyek tetap di Proyek |
| P2 | Slot desktop ada tetapi memakai aset portrait | Poster desktop tetap tampak seperti iklan HP | Aset landscape terpisah dan validasi orientasi unggahan |
| P2 | Quick FAQ tersembunyi di label generik | Fitur tambah disangka tidak tersedia | Jalur Beranda → Quick FAQ dan label mengikuti heading |
| P2 | Bahasa tersembunyi dalam menu HP | Pengunjung sulit menemukan pilihan bahasa | Bar bahasa terlihat pada layar sempit |
| P2 | Nomor WA utama literal | Perubahan kontak CMS tidak mengubah tombol utama | Nomor berasal dari kontak aktif CMS |

Pemeriksaan mekanis Impeccable menemukan satu aksen garis samping 3 px pada pemberitahuan PDF. Garis tersebut diganti dengan border biasa yang memakai token warna. Komponen dan palet merek yang sudah ada dipertahankan.

## Pemeriksaan teknis dan batas cakupan

Penilaian berikut merupakan penilaian audit UI dengan kriteria Impeccable, **bukan skor PageSpeed/Lighthouse atau sertifikasi WCAG**.

| Dimensi | Nilai / 4 | Bukti / batas |
|---|---:|---|
| Aksesibilitas | 3 | Form berlabel, kontrol section berupa checkbox, dialog dan status unggah tersedia; belum menguji seluruh kombinasi pembaca layar/perangkat fisik. |
| Performa | 3 | Empat poster landscape dioptimalkan WebP, sekitar 1,07 MB total; gambar lain mengikuti pemuatan website. Pengukuran Lighthouse baru tidak dijalankan pada audit ini. |
| Token / tema | 3 | Kontrol baru memakai token merek; CSS lama masih memiliki warna literal. Website mempertahankan tema yang ada. |
| Responsif | 3 | Chromium emulasi pada 320, 390, 768, 1024, dan 1440 px tanpa overflow halaman; bukan pengujian perangkat sentuh fisik. |
| Integritas implementasi | 3 | Kontrol konten terhubung ke penyimpanan dan halaman publik. Rating laser dipisah dari retail dan ulasan kosong tidak direkayasa. |
| **Total** | **15 / 20** | **Good menurut rubrik audit internal** |

Validasi mencakup tambah Quick FAQ, simpan teks/gambar Jasa, tampil/sembunyikan section, publikasi/hapus album kegiatan, orientasi poster, rating/seluruh ulasan, penonaktifan ulasan yang bertahan setelah refresh, izin antar divisi, dan PDF produk otomatis pada data CMS percobaan. Pengujian tidak mengirim pesan WhatsApp atau lead percobaan ke produksi.

Langkah berikutnya yang masih menunggu materi/keputusan: unggah foto kegiatan asli, QR sesuai waktu yang dipilih pengguna, serta domain/email setelah dibeli. Untuk pengujian visual menyeluruh pada perangkat fisik dapat dilanjutkan dengan `impeccable adapt`, lalu `impeccable polish`.

Rujukan cara kerja terjemahan: [Google Translate — menerjemahkan website](https://support.google.com/translate/answer/2534559?co=GENIE.Platform&hl=en).
