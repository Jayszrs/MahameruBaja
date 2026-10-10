# Logo, banner, sosial, dan stok divisi — 10 Oktober 2026

## Identitas

- Header memakai logo resmi lengkap `/images/brand/mbi-laser.png`, sama dengan footer, pada permukaan putih. Pembesaran CSS yang memotong simbol dihapus.
- Ikon tab: `frontend/public/images/brand/mbi-favicon-white-v3.png`. Logo tetap merah/emas/baja, latar putih; hanya emblem agar terbaca pada ukuran kecil.
- Aset favicon diedit dengan **built-in imagegen**, tidak menggunakan CLI. Logo sumber tidak ditimpa. Next Image menyajikan ikon tab 64 px dan Apple icon 256 px, bukan mengirim seluruh bitmap sumber 1,4 MB.

Prompt final:

> Use case: precise-object-edit. Asset type: website favicon/app icon on a white background. Input image 1 is the edit target: the official Mahameru Baja Indonesia MBI Laser Cutting logo. Create a crisp square favicon variant with opaque pure white (#ffffff) background, generous safe padding on all edges, not cropped. Preserve the identity, colors and geometry of the original red triangular shapes, dark steel central diamond and golden arcs exactly. For favicon legibility at 16–48 pixels show only this original emblem, omit tiny wordmarks and fine sparks, no new letters or elements. Center the emblem with at least 10 percent padding and a strong clear silhouette. Brand colors remain red, gold and dark steel, not white. No outline/frame around the image.

## Banner dan countdown

Deretan kartu gambar, tombol konsultasi dan preview dialog. Banner layanan serta pengingat kalender aktif; contoh diskon lama tetap draf. Bukan pengumuman acara perusahaan atau diskon yang belum disetujui.

CMS `/admin/promosi` menyediakan tanggal/jam countdown WIB, label, dan penanda tanggal perkiraan, terpisah dari periode tayang. Halloween diarahkan ke 31 Oktober 2026. Ramadan ke perkiraan 8 Februari 2027; menunggu penetapan pemerintah, bukan tanggal final ibadah. Referensi [Kalender Hijriah Kemenag 2027](https://aceh.kemenag.go.id/informasi/kalender-hijriah-indonesia-tahun-2027), [dokumen kalender](https://aceh.kemenag.go.id/storage/berita_informasi/01M2SQD5A9T6CWP76Y8A4PKB6J.pdf).

## Sosial media

Acuan: [beranda SIT Permata Hati](https://sitpermatahati.up.railway.app/). Kartu per unggahan dengan iframe resmi, nama divisi, username, judul/keterangan, serta tautan asli; bukan embed profil/grid akun. Pemutar lazy-loaded, tidak dipaksa autoplay. Playback tetap mengikuti kebijakan Instagram, YouTube, TikTok dan browser pengguna.

Empat unggahan diverifikasi dari embed profil publik `https://www.instagram.com/mbilasercutting/embed` pada 10 Oktober 2026; data pemilik setiap unggahan adalah `mbilasercutting`:

- `DeG2uVRh2uq` — video.
- `Dd59WrvhJtC` — video.
- `Dd5a7EzDk9N` — carousel/foto.
- `Dd3OyLoB_7p` — video.

Profil `gmbgarudaofficial` tidak menampilkan unggahan publik saat diperiksa. Tautan akunnya tetap ditampilkan, tanpa post buatan atau pemutar kosong. CMS `/admin/sosial` menyediakan divisi, username, URL post/reel dan preview. URL profil tidak diterima sebagai video terbit.

Migrasi `showcaseVersion` menambahkan banner dan unggahan baru sekali saja, mempertahankan konten kustom. Konten yang kemudian dihapus admin tidak dimunculkan kembali.

## Produk & stok

CMS `/admin/produk`, API `/api/admin/inventory`. Master katalog yang sudah ada tetap digunakan; keluarga produk MBI Trading dilengkapi sesuai daftar pengguna, tanpa mengarang ukuran, sertifikat, harga, atau jumlah stok.

- Produk tercatat terpisah menurut pasangan divisi + produk.
- Setiap divisi dapat mengaktifkan/menonaktifkan produk katalog sendiri.
- Status: belum dikonfirmasi, tersedia, habis, pre-order.
- Jumlah kosong berbeda dari nol. Tersedia memerlukan jumlah positif dan konfirmasi admin; habis berjumlah nol. Tanggal konfirmasi tidak boleh di masa depan.
- Admin divisi hanya boleh mengubah stok divisinya; pemilik dapat mengelola semua divisi. Endpoint konten umum tidak dapat dipakai untuk melewati pembatasan stok.
- Tiga-arah merge per produk/divisi menjaga perubahan bersamaan pada baris berbeda. Konflik pada baris sama menghasilkan HTTP 409.
- Katalog publik/filter hanya memakai produk yang diaktifkan untuk divisi, dan halaman detail menampilkan sumber divisi, sisa stok, waktu konfirmasi, dan kontak adminnya. Stok non-publik tidak dikirim sebagai props client.
- Data stok diperbarui manual; bukan integrasi POS, reservasi, atau pengurangan otomatis saat pelanggan mengirim permintaan.

Semua stok bawaan **belum dikonfirmasi** dan tidak diberi angka dummy. Produk retail memiliki saran penempatan kategori berdasarkan cakupan divisi, yang dapat diubah admin; Laser dan Project tidak otomatis mewarisi katalog material retail.

## Verifikasi

Typecheck semua workspace dan production build lulus. Tes `QA_CONCURRENCY=24 node frontend/scripts/test-october-revision.mjs` juga lulus, termasuk stok, migrasi, ukuran favicon teroptimasi, 24 input bersamaan, invoice PDF, serta 58 pemeriksaan HTTP CMS artikel. Fixture terakhir: `tmp/revision-qa-QKAG6H`. Tes memakai direktori terpisah; tidak menyentuh CMS produksi maupun akun nyata.

Browser computer-use tidak menyediakan browser/app pada sesi pemeriksaan ini (`apps: [], browsers: []`), sehingga pemeriksaan visual desktop/mobile langsung belum dapat dilakukan. Referensi Permata Hati dan akun Instagram diperiksa lewat HTML publik, bukan tangkapan layar browser lokal.
