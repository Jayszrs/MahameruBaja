# Pemeriksaan upload dan keamanan CMS

Pemeriksaan 12 Oktober 2026. Perubahan mempertahankan data CMS, koleksi lama, URL media, serta format hash password lama. Tidak diperlukan migrasi PostgreSQL.

## Perubahan

| Area | Perbaikan |
| --- | --- |
| Semua editor | Upload menyatakan jenis gambar/video; validasi ukuran dan keterangan UI konsisten; input dibersihkan agar file yang sama dapat dipilih kembali. Galeri melaporkan hasil sebagian. |
| Gambar | JPG/PNG/WebP didekode penuh dengan Sharp, orientasi dinormalisasi, metadata dibuang, transparansi dipertahankan. Batas 4.000.000 byte dan 40 juta pixel; gambar animasi ditolak. |
| Video | MP4Box memeriksa struktur MP4, video H.264, durasi, tabel sampel dan batas offset. Audio, bila ada, harus AAC. File palsu, terpotong, tanpa video, tabel berlebihan, compact sample table dan fragmented MP4 ditolak. Tidak ada transcoding; ekspor sebagai MP4 biasa H.264/AAC. |
| Media | File private di luar direktori public. Kepemilikan indeks menjadi acuan; menyalin URL ke draf tidak memberikan akses. Referensi diekstrak dari field media dan gambar Markdown, termasuk URL dengan query/fragment. |
| Penayangan | Media draf hanya pemilik/Super Admin; publik hanya ketika dirujuk konten publik yang sah. Aturan berlaku pada URL `/media/` lama juga. Respons memakai `private, no-store`, `nosniff`, HEAD dan Range/206/416; file lokal di-stream. |
| Login | Limiter persisten sebelum scrypt: 10 percobaan per akun dan 30 per IP per 15 menit, termasuk percobaan berhasil. Password: 5 per akun; upload: 60 per akun dalam periode yang sama. Penolakan mengirim 429 dan Retry-After. |
| Sesi | ID acak dicatat server. Logout mencabut sesi itu; perubahan password, penugasan, penonaktifan dan reset menolak sesi dengan versi lama. Sesi lama tanpa ID harus login ulang. |
| Password | Scrypt asinkron dengan antrean terbatas. Hash baru `scrypt-v2:131072:8:1:<salt>:<digest>`; hash lama ditingkatkan setelah login berhasil. Penerbitan sesi terikat pada akun dan versi yang diverifikasi. |
| Request | JSON, login dan multipart dibaca sebagai stream dengan batas byte. Format rusak 400, ukuran berlebih 413. Origin dan HTTPS diperiksa; header proxy dari pengunjung tidak menjadi sumber kepercayaan. |
| Browser | CSP bernonce per request pada admin, larangan framing, dan cache no-store. TipTap, unggahan dan PDF diuji dengan kebijakan ini. |
| Scope publik | PIC mengikuti pemilik aktif, publikasi dan audience yang sama dengan website/PDF/WhatsApp. Tautan internal, hostname Blob, kontrol karakter dan backslash divalidasi. |
| Infrastruktur | PostgreSQL/MinIO/API Compose diikat ke loopback. Fastify hanya mempercayai CIDR proxy yang dikonfigurasi. JSON koleksi baru ditulis dengan permission 0600 pada filesystem yang mendukungnya. |

Batas gambar selalu **4 MB**. Batas video **4 MB pada Vercel**, **30 MB pada lokal/VPS**. Endpoint lama `/api/admin/articles/upload` dan `/api/admin/promotions/upload` tetap menerima field `image`. Endpoint umum menerima field `media` dan `kind=image|video`; klien lama tanpa kind tetap kompatibel. Respons tetap `{url,type}`.

## Konfigurasi dan penyimpanan

- `ADMIN_SESSION_SECRET`: nilai acak minimal 32 byte; konfigurasi lemah ditolak. Gunakan satu nilai konsisten untuk instance dalam lingkungan yang sama. Jangan memakai `NEXT_PUBLIC_*` untuk secret.
- `CMS_DATA_DIR`: seluruh direktori harus persisten dan hanya dapat diakses service web/operator yang berwenang. Koleksi `security-state.json` terpisah menyimpan sesi dan limiter, dengan file lock dan penggantian atomik. Data kedaluwarsa dibersihkan saat pembaruan.
- Pada Vercel, state keamanan memakai private Blob `security/state.json` dengan ETag/ifMatch, retry terbatas dan pembacaan tanpa cache. Koleksi CMS tetap menggunakan snapshot revisi yang sudah ada.
- `CMS_BLOB_PREFIX` kosong mempertahankan namespace lama `mahameru-preview/v1/`. Namespace uji harus berbeda dan memakai akun fixture. Mengubah prefix deployment aktif tanpa menyalin data membuat aplikasi membaca koleksi berbeda; ini bukan cara upgrade biasa.
- `BLOB_READ_WRITE_TOKEN` harus milik store **private**; unggahan tidak mengasumsikan akses public.
- IP login pada Vercel hanya berasal dari header platform `x-vercel-forwarded-for`. Next pada Docker langsung tidak memiliki peer IP terpercaya, sehingga bucket IP memakai identitas `direct` bersama; batas per akun tetap terpisah. Pasang limiter IP tambahan pada reverse proxy HTTPS bila diperlukan. `TRUSTED_PROXY_CIDRS` mengatur Fastify, bukan kepercayaan header login Next.
- Jalankan satu instance web untuk CMS JSON lokal. Beberapa host dengan volume masing-masing tidak berbagi state keamanan. Paritas banyak instance diuji pada adapter Blob dan dua proses dengan volume fixture bersama.

## Menjalankan pemeriksaan terisolasi

Semua pengujian destruktif wajib memakai `ARTICLE_TEST_ISOLATED=1`, host localhost, dan CMS_DATA_DIR/volume baru. Jangan menggunakan data atau token deployment aktif.

```powershell
npm ci
npm run typecheck
npm run build
npm audit
node --conditions=react-server --import tsx frontend/scripts/test-request-body.mts
node --conditions=react-server --import tsx frontend/scripts/test-scoped-security.ts
node frontend/scripts/test-admin-auth-security.mjs
node --conditions=react-server --import tsx frontend/scripts/test-media-validation.mjs
```

Generator `create-security-fixture.mjs` hanya membuat identitas `.example.test` di direktori artifact yang ditentukan; file env tersebut tidak boleh dikomit. Script HTTP/browser lain memerlukan server fixture terlebih dahulu. `ARTICLE_PLAYWRIGHT_MODULE` dapat menunjuk instalasi Playwright terpisah; screenshot/artifact ditulis ke `/artifacts` pada container QA.

| Pemeriksaan | Hasil lokal |
| --- | --- |
| Body stream | 12 pemeriksaan: byte UTF-8, tanpa Content-Length, pembatalan stream, MIME dan format rusak. |
| Auth dan adapter private Blob | 68 pemeriksaan, termasuk CAS paralel, storage gagal, versi akun, hash, sesi, pembatasan dan race perubahan penugasan saat ganti password. |
| URL, PIC dan klien upload | 79 pemeriksaan; data awal dan tujuh artikel lama tetap valid; batas UI video mengikuti target Vercel/lokal. |
| Decoder media | 58 pemeriksaan, termasuk JPG/PNG/WebP nyata, metadata, transparansi, batas pixel dan MP4 H.264. |
| HTTP media | 200 pemeriksaan dan 16 setelah restart: semua alias, typed slots, media lama/baru, akses draf/terbit, referensi palsu, rollback indeks, Range/HEAD dan limiter. |
| HTTP keamanan | 39 pemeriksaan pada dua instance; CSP nonce, CSRF, body, logout replay dan pembatasan paralel. Empat pemeriksaan setelah restart membuktikan sesi, pencabutan dan limiter tetap berlaku. |
| CRUD CMS | 469 pemeriksaan HTTP untuk Super Admin dan divisi A/B; persistensi konten/stok/invoice/media setelah restart lulus. |
| Divisi/akun | 167 pemeriksaan HTTP; CRUD, batas akses, password sementara, reset, konflik dan arsip. Snapshot divisi/akun/konten/artikel tetap sama setelah restart. |
| Artikel | 49 pemeriksaan HTTP; draf/terbit, konflik, slug, media dan renderer aman. |
| Browser | CRUD seluruh editor; upload kontak, sosial, banner, hero, galeri, logo/hero/galeri divisi, sampul dan isi artikel. Tujuh artikel lama tetap sama setelah disimpan di TipTap. PDF invoice berhasil diunduh. H.264 32x32/0,4 detik berhasil didekode, diputar dan digeser pada media private/terbit. Kegagalan parsial galeri mempertahankan foto berhasil; retry file sama dan reset input lulus. |
| Data kosong | 23 pemeriksaan HTTP ditambah dashboard kosong melalui browser; koleksi kosong tidak diisi ulang dan halaman publik/admin tetap tersedia. |
| Responsivitas/keyboard | 35 pemeriksaan editor serta 15 screenshot pengelolaan divisi/akun; dashboard pada 2560/1440/1024/768/390 px, drawer, Escape, fokus dan dialog perubahan. |
| Dependensi/build | Typecheck monorepo dan build produksi lulus; npm audit penuh dan produksi: 0 advisory pada waktu pemeriksaan. Backend tsup dan Drizzle generate pada konfigurasi fixture lulus tanpa migrasi baru. |

Hasil adapter Blob menguji mekanisme dengan simulasi SDK, bukan bukti upload ke provider live. Token Blob hosting tidak tersedia pada lingkungan audit lokal. Verifikasi deployment dilakukan baca-saja; tidak membuat akun klien atau mengubah konten aktif. Hasil pemeriksaan deployment dilaporkan pada hasil pengiriman; kelulusan lokal tidak membuktikan konfigurasi provider live. Pengujian lokal menggunakan container/volume `mahameru-security-*`, bukan container dan data CMS asli.

## Backup dan pemulihan

1. Sebelum upgrade, backup seluruh CMS_DATA_DIR beserta media, akun, divisi, artikel, konten, permintaan dan konfigurasi secret. Untuk Blob, backup namespace dan semua media yang dirujuk; snapshot JSON saja tidak mencakup file unggahan. Batasi akses backup karena berisi hash akun dan data pelanggan.
2. Uji pemulihan pada staging/namespace berbeda. Hentikan penulisan selama snapshot lokal atau pemulihan agar file indeks dan media konsisten.
3. Pulihkan koleksi dan media sebagai satu set; pertahankan kepemilikan file untuk user service. Jangan menjalankan `docker compose down -v` saat upgrade.
4. Setelah pemulihan produksi, rotasi ADMIN_SESSION_SECRET dan kosongkan state sesi/limiter lama dengan prosedur maintenance terkontrol agar sesi dari backup tidak hidup kembali. Jangan memulihkan state keamanan lama sebagai sesi aktif. Semua admin login kembali. Pengaturan environment tidak mengimpor ulang akun yang telah diinisialisasi.
5. Lock sisa crash hanya boleh ditangani setelah semua penulis berhenti dan path tepat dalam CMS_DATA_DIR diverifikasi. Hapus hanya `.lock` yang tertinggal; jangan menghapus JSON/media/volume. Restart dan ulangi pemeriksaan baca/simpan.

Keamanan ini belum mencakup MFA, antivirus upload, audit log aktivitas lengkap atau pengujian penetrasi independen. Kesiapan hosting tetap memerlukan HTTPS, secret kuat, akses store yang benar, backup/restore dan pemantauan.
