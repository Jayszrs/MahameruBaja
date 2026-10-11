# CMS divisi dan akun admin

## Ruang kerja

- **Konten Publik → Profil divisi** (`/admin/divisi`): profil, layanan, media, kontak, dan lokasi.
- **Administrasi → Pengelolaan akun** (`/admin/akun`): hanya Super Admin.
- **Akun saya** (`/admin/akun-saya`): semua akun; password lama diperlukan.
- Lima kelompok sidebar dan URL editor sebelumnya tetap digunakan.

Admin divisi ditugaskan ke tepat satu divisi. Semua pembacaan dan perubahan CMS
dibatasi di server, termasuk artikel, unggahan, ulasan, stok, permintaan, dan invoice.
Konten pusat tidak diberikan kepada admin divisi melalui API admin. Konten yang
sudah diterbitkan tetap bisa dibaca sebagai pengunjung website.

Super Admin dapat memilih pemilik dan penayangan tambahan pada editor konten.
Pemilik menentukan hak sunting; penayangan tambahan tidak memberikan hak sunting.
Master katalog produk tetap berasal dari katalog yang tersedia. CMS Produk & Stok
mengelola pencatatan dan penayangan produk per divisi.

## Penyimpanan dan migrasi

PostgreSQL tidak diperlukan untuk CMS ini. Docker menggunakan `CMS_DATA_DIR` pada
volume `cms_data`. Vercel menggunakan store Blob **private** yang sama dengan CMS
sebelumnya melalui `BLOB_READ_WRITE_TOKEN`.

| Koleksi lokal | Key Blob di `mahameru-preview/v1/` | Isi |
| --- | --- | --- |
| `divisions.json` | `divisions/rev-*.json` | Profil dan revisi divisi |
| `accounts.json` | `accounts/rev-*.json` | Akun, hash, versi sesi, penanda inisialisasi |
| `site-content.json` | `site-content/rev-*.json` | Konten lama dengan field kepemilikan tambahan |
| `articles.json` | `articles/rev-*.json` | Artikel lama dengan kepemilikan tambahan |
| `requests.json` | `requests/rev-*.json` | Permintaan dan invoice yang sudah ada |
| `media-index.json` | `media-index/rev-*.json` | Pemilik unggahan private |
| `private-media/` | `private-media/` | Berkas unggahan baru |

Nama file permintaan pada versi lama harus tetap mengikuti `requestStore.ts`;
jangan mengganti nama file atau memindahkan data secara manual saat upgrade.

1. Ambil cadangan seluruh penyimpanan sebelum upgrade dan batasi penulisan selama
   pengambilan cadangan agar snapshot antar koleksi konsisten.
2. Deploy kode. Lima profil divisi lama menjadi data awal dari sumber yang sama,
   dengan slug, teks, logo, foto, dan identitas yang dipertahankan. Profil disimpan
   ke koleksi terpisah saat pertama disunting; koleksi kosong yang sudah tersimpan
   tidak diisi ulang.
3. Pada POST autentikasi pertama, `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` dan
   `ADMIN_ACCOUNTS_JSON` diimpor sekali. Akun utama menjadi Super Admin; akun dengan
   penugasan divisi menjadi Admin Divisi. Email dan hash lama dipertahankan.
4. Penanda `initialized: true` menjadikan koleksi akun sumber utama. Menghapus atau
   menonaktifkan akun tidak membuatnya muncul kembali dari environment.
5. Sesi format lama tidak digunakan lagi. Pengguna harus login ulang setelah upgrade.
   Akun hasil migrasi tetap menggunakan password lama; akun baru/reset wajib ganti
   password sementara pada login berikutnya.
6. Tidak ada akun client tambahan yang dibuat otomatis. Super Admin memasukkan nama
   dan email sebenarnya, memilih divisi, lalu menyampaikan password sementara yang
   ditampilkan sekali. Tidak ada undangan email otomatis.

Migrasi bersifat tambahan: data yang memiliki `division` atau tepat satu `divisions`
mempertahankan pemiliknya. Akun sosial Garuda dan profil ulasan Garuda mengikuti
Retail Cibitung. Artikel, Hero, banner, dan konten bersama tanpa pemilik yang jelas
tetap pusat. Data stok, invoice, video sosial, dan galeri tidak direset. Profil lama
yang sebelumnya memakai ulasan bersama mempertahankan penayangan tersebut sampai
profil ulasan divisinya diisi. Divisi baru tidak meminjam ulasan pusat secara otomatis.

## Siklus divisi dan akun

Divisi baru disimpan sebagai **Draf**. Untuk aktif, lengkapi nama, label, area, logo,
judul, pengantar, deskripsi, misi, gambar utama, dan alamat. Slug terkunci setelah
disimpan. Perubahan profil aktif langsung terlihat tanpa build/deploy berikutnya.
PIC menggunakan kontak CMS; divisi tanpa PIC tetap memiliki halaman kontak.

**Arsipkan** menutup halaman publik dan akses admin divisi, menghilangkan navigasi,
serta menolak permintaan baru. Super Admin tetap dapat membaca riwayat. Divisi
diarsipkan dapat dipulihkan. Hapus permanen hanya tersedia untuk divisi tidak aktif
yang tidak memiliki akun, konten, stok, permintaan, atau referensi terkait.

Password menggunakan scrypt dengan salt acak. Cookie menyimpan ID, versi sesi, dan
masa berlaku delapan jam, ditandatangani dengan `ADMIN_SESSION_SECRET`. Akun terbaru
dan status divisinya diperiksa pada setiap permintaan. Reset password, pergantian
password, perubahan email/divisi/status akun mencabut sesi sebelumnya.

Hanya akun admin divisi **nonaktif** yang bisa dihapus. Super Admin tidak dapat
dinonaktifkan, dipindah menjadi admin divisi, atau dihapus melalui CMS. Perubahan
password Super Admin dilakukan melalui Akun saya.

## Media

Unggahan baru menggunakan private Blob atau direktori `private-media` pada volume
persisten, ditayangkan melalui `/api/cms/media/[id]`. Jenis berkas dicek dari isi dan
MIME; gambar JPG/PNG/WebP maksimal 4 MB. Video MP4 maksimal 4 MB pada Vercel atau
30 MB lokal. Respons media memakai `private, no-store`.

Media draf hanya dibaca pemilik atau Super Admin. Media yang dirujuk konten publik
aktif dapat dibaca pengunjung; mengembalikan konten ke draf menutup akses tersebut
jika tidak ada konten terbit lain yang merujuknya. Proxy media tidak menggunakan
cache image optimizer sehingga otorisasi tidak dilewati. Media private lama artikel
dan media lokal tetap menggunakan route lamanya dengan pemeriksaan akses baru.

URL eksternal/public Blob yang pernah diterbitkan oleh versi lama tetap mengikuti
akses layanan asal. Mengarsipkan konten di CMS tidak mencabut URL public di layanan
lain. Unggahan baru tidak memakai akses public atau mengasumsikan token private
bisa menulis ke store public. Lihat [keamanan Vercel Blob](https://vercel.com/docs/vercel-blob/security).

## Cadangan dan pemulihan

Cadangan memuat hash akun dan data pelanggan: simpan di penyimpanan terbatas dan
terenkripsi, di luar Git, direktori `public`, dan folder yang disajikan website.

### Docker/lokal

1. Batasi akses tulis atau hentikan hanya layanan web selama snapshot. Jangan
   menjalankan `docker compose down -v`; opsi tersebut menghapus volume data.
2. Periksa nama volume aktual: `docker inspect mahameru-baja-web-1 --format
   '{{json .Mounts}}'`. Cadangkan seluruh isi mount `CMS_DATA_DIR`, termasuk media,
   bukan hanya `site-content.json`. Gunakan alat cadangan Docker/volume yang tersedia.
3. Untuk pemulihan, hentikan penulis, simpan snapshot kondisi sekarang, lalu pulihkan
   seluruh koleksi dan media dari satu cadangan yang konsisten. Pastikan UID 1001
   tetap memiliki hak baca/tulis. Jangan menghapus penanda inisialisasi akun.
4. Ganti `ADMIN_SESSION_SECRET` pada environment runtime agar sesi dari sebelum
   pemulihan tidak berlaku, lalu jalankan ulang web. Login memakai akun/password
   dalam snapshot, bukan mengandalkan environment untuk menghidupkan akun terhapus.

### Vercel Blob private

1. Simpan salinan seluruh prefix `mahameru-preview/v1/` dengan kredensial server,
   termasuk revisi JSON dan semua namespace media lama/baru. Jangan menaruh token
   atau hasil cadangan di browser/client. Revisi JSON sebelumnya tidak ditimpa.
2. Pilih snapshot konsisten dan batasi penulisan selama pemulihan. Cadangkan kondisi
   saat ini terlebih dahulu. Jangan sekadar menghapus revisi terbaru agar fallback
   environment atau data awal muncul kembali.
3. Pulihkan media ke pathname yang sama. Untuk setiap koleksi, baca revision terbaru,
   validasi snapshot dengan schema di repo, lalu tulis snapshot sebagai **revision
   berikutnya** melalui `writePreviewBlob`. Jika terjadi konflik, hentikan pemulihan
   dan pastikan tidak ada penulis lain. Pertahankan `initialized: true` akun.
4. Rotasi `ADMIN_SESSION_SECRET`, redeploy konfigurasi, login ulang, lalu verifikasi
   profil, konten pusat/divisi, akses draf, stok, permintaan, serta invoice.

## Pengujian terisolasi

Script di `frontend/scripts/` menolak eksekusi destruktif tanpa
`ARTICLE_TEST_ISOLATED=1`. Gunakan container/volume khusus dengan akun berakhiran
`example.test`, bukan volume project atau URL preview. Script utama:

- `test-divisions-accounts.mjs`: migrasi, CRUD, matriks akses, konflik, media,
  password sementara/reset, pencabutan sesi, arsip, dan referensi penghapusan.
- Jalankan ulang dengan `--after-restart` pada volume fixture yang sama untuk
  membandingkan snapshot penyimpanan setelah restart.
- `test-account-onboarding.mjs`: alur wajib ganti password, pembukaan workspace,
  dan pembatalan sesi setelah reset melalui browser.
- `test-division-account-ui.mjs`: form, konfirmasi perubahan, dialog, keyboard,
  hak akses, dan lebar 2560/1440/1024/768/390 px.
- `test-articles.mjs`, `test-article-editor.mjs`, `test-admin-workspace.mjs`:
  regresi kontrak dan editor sebelumnya. Gunakan fixture baru untuk baseline
  dashboard karena script tersebut menambahkan data operasional uji.

Pengujian preview setelah deploy hanya membaca UI/API. Login dapat menjalankan
inisialisasi akun satu kali yang dijelaskan di atas; tidak membuat akun uji atau
mengubah konten client.

Unggahan gambar dibatasi 4 MB dan 40 megapiksel. Server memeriksa MIME, signature,
dan hasil dekode gambar. Proxy media private tidak dapat diproses oleh cache
pengoptimal gambar Next.js sehingga perubahan terbit/draf mengikuti izin terbaru.

### Hasil pemeriksaan implementasi (11 Oktober 2026)

- Typecheck frontend dan build produksi Docker lulus.
- Integrasi divisi/akun: 167 pemeriksaan HTTP pada volume terpisah.
- Integrasi artikel: 48 pemeriksaan HTTP; tujuh artikel awal tetap utuh setelah
  dibuka dan disimpan melalui editor visual.
- Snapshot divisi, akun, konten, dan artikel tetap sama setelah restart fixture.
- Browser: onboarding password, CRUD akun/profil, isolasi navigasi, dialog,
  perubahan belum tersimpan, konflik simpan, invoice, semua workspace, serta
  lebar 2560, 1440, 1024, 768, dan 390 px.
