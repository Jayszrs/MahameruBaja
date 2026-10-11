# Verifikasi CRUD CMS Admin

## Cakupan

Pengujian destruktif memakai container dan volume Docker khusus, akun `example.test`,
serta `CMS_DATA_DIR=/app/cms-data`. Token Blob dan konfigurasi project tidak disalin
ke fixture. Data client, file environment lokal, dan volume aplikasi tidak diubah.

| Workspace | Operasi yang diperiksa |
|---|---|
| Divisi | Buat draf, sunting profil, aktifkan, arsip, pulihkan, hapus kosong; tolak hapus yang masih direferensikan |
| Akun | Buat, sunting penugasan, aktif/nonaktif, reset, password pertama, pencabutan sesi, hapus nonaktif |
| Kontak | Tambah, unggah foto, terbit/draf, sunting, hapus |
| Ulasan | CRUD dan terbit/draf pada profil pusat, Garuda, dan profil divisi |
| Sosial | CRUD akun/unggahan; gambar dan MP4 asli; konfirmasi hapus |
| Banner | CRUD, kelengkapan publikasi, periode WIB, urutan pada daftar yang difilter |
| Hero | CRUD, unggah MP4/poster, terbit/draf, konfirmasi hapus |
| Galeri | CRUD album, unggah, sunting/hapus foto, sampul, otomatis draf saat foto terakhir dihapus |
| Produk & stok | Tambah produk master ke divisi, sunting jumlah/status, konfirmasi stok, tampil/sembunyi, hapus baris divisi |
| Artikel | CRUD, slug, revisi, editor visual, gambar/tabel lama, draf/publikasi dan renderer publik |
| Permintaan/invoice | Catat/sunting, konflik revisi, arsip/pulihkan, simpan invoice berulang, tambah/hapus baris, unduh PDF |

Master produk tetap menggunakan katalog yang tersedia. Penghapusan stok hanya
menghapus pencatatan produk pada divisi. Permintaan menggunakan arsip/pulihkan
agar riwayat pelanggan dan invoice tetap tersimpan.

## Perbaikan yang dihasilkan

- Penyimpanan oleh admin divisi mempertahankan posisi konten divisi lain pada feed.
- Tombol urutan banner memilih tetangga yang terlihat pada filter aktif.
- Stok divisi memiliki tindakan hapus dengan konfirmasi; Hero dan akun sosial juga
  meminta konfirmasi sebelum dihapus dari editor.
- Invoice menggunakan hasil penyimpanan sebagai nilai form dan pembanding perubahan,
  sehingga perbedaan urutan field JSON tidak menyebabkan status belum disimpan palsu.
- Input invoice terkunci selama penyimpanan/PDF diproses. Tab arsip/pemulihan
  berpindah setelah status sibuk dan perubahan belum tersimpan selesai diperbarui.

## Menjalankan ulang

Semua script mutasi mewajibkan `ARTICLE_TEST_ISOLATED=1` dan server lokal.
Gunakan volume fixture yang berbeda untuk suite dashboard, karena suite ini
mengosongkan data di bagian akhir. Jangan menjalankannya terhadap volume project.

1. Build `docker compose -f infrastructure/docker-compose.yml build web`.
2. Jalankan image hasil build dalam container terpisah, dengan volume baru dan
   environment fixture. Gunakan identitas pengujian yang disebutkan di script;
   password hash fixture dibuat memakai scrypt seperti akun aplikasi.
3. Jalankan script Node melalui `--network container:<container-fixture>` dengan
   `frontend/scripts` dimount ke `/checks` dan folder artefak ke `/artifacts`.
4. Untuk browser, gunakan image Playwright `v1.64.0-noble`, install
   `playwright@1.64.0` pada direktori sementara, lalu arahkan
   `ARTICLE_PLAYWRIGHT_MODULE` ke modul tersebut.

Script utama:

- `test-cms-crud.mjs`: 469 pemeriksaan HTTP pada fixture baru untuk pusat dan dua admin divisi;
  unggahan gambar/video, privasi draf, konflik, publikasi, invoice, arsip/pulihkan.
- Restart container dengan volume yang sama, lalu jalankan script tersebut dengan
  `--after-restart`: bandingkan snapshot konten, stok, permintaan/invoice, dan media.
- `test-cms-crud.mjs --empty`: 30 pemeriksaan pada fixture awal berisi tujuh artikel;
  semua koleksi kosong tidak diisi ulang dan halaman admin/publik tetap merespons.
- `test-cms-editor-crud.mjs`: klik alur CRUD seluruh editor konten; konflik buatan,
  data form tetap tersedia setelah gagal simpan, unggah MP4/poster, PDF invoice,
  dan 35 kombinasi workspace/lebar 2560, 1440, 1024, 768, 390 px.
- `test-divisions-accounts.mjs`: 167 pemeriksaan migrasi, akses lintas divisi,
  akun, sesi, media, revisi, arsip, serta referensi penghapusan; mendukung
  `--after-restart` untuk snapshot koleksi divisi/akun/konten/artikel.
- `test-articles.mjs`: 48 pemeriksaan API artikel.
- `test-article-editor.mjs`: ketujuh artikel lama tetap utuh sesudah dibuka/simpan.
- `test-division-account-ui.mjs`: siklus akun lengkap termasuk reset/hapus,
  divisi baru sampai aktif/arsip/pulih/hapus, dialog, keyboard, dan 15 screenshot.
- `test-account-onboarding.mjs`: password sementara, ganti password wajib,
  masuk dashboard, dan pembatalan sesi setelah reset.
- `test-admin-workspace.mjs`: metrik dashboard, filter URL, kategori persisten,
  navigasi/history/logout, konflik, kondisi kosong, drawer, dan lima lebar layar.

Typecheck frontend dan build produksi Docker dijalankan sebelum pengiriman.
Setelah deployment, `verify-admin-preview.mjs` hanya membaca 18 tampilan admin,
membandingkan metrik dashboard dengan API, serta memastikan hash data konten,
permintaan, artikel, divisi, dan akun tetap sama sebelum/sesudah pemeriksaan.
