# Menjalankan dan hosting Mahameru

Panduan revisi 10 Oktober 2026. Stack tidak mewajibkan Supabase Pro atau database berlangganan: PostgreSQL dapat dijalankan sendiri bersama Docker. Lihat [audit notulensi](NOTULENSI-2026-10-10.md) untuk fitur yang sudah tersedia dan yang masih menunggu data klien.

## Local PowerShell — UI dan CMS

Buka terminal PowerShell di folder repo:

```powershell
Set-Location 'C:\Users\jaela\Downloads\Project2 Web\MahameruBaja'
npm install
node frontend/scripts/setup-division-admins.mjs
npm run dev:web
```

- Website: http://localhost:3000
- Login CMS: http://localhost:3000/admin/login
- Lima email/password tersedia hanya di `.admin-divisions-access.local.txt`, bukan di Git/log. Script tidak mereset akun yang sudah ada.
- Jika server sudah berjalan saat akun dibuat, tekan Ctrl+C pada terminal server milik Anda, lalu jalankan kembali `npm run dev:web` agar env baru dimuat.
- Hero: `/admin/hero`; banner: `/admin/promosi`; sosial: `/admin/sosial`; kontak/ulasan: `/admin/konten`; pelanggan/invoice draf: `/admin/permintaan`.
- Pengembangan UI/CMS ini tidak perlu menunggu PostgreSQL/MinIO. Next development mengompilasi rute pada kunjungan pertama; penilaian kecepatan produksi dilakukan pada build, bukan disamakan dengan dev compilation.

## Local backend dan database

```powershell
Copy-Item .env.example .env
docker compose -f infrastructure/docker-compose.yml up -d postgres minio
npm run db:migrate
npm run dev
```

Jangan menimpa `.env` yang sudah dikonfigurasi; salin contoh hanya bila file belum ada. Backend memakai PostgreSQL, sedangkan CMS frontend saat ini memakai penyimpanan JSON atomik tersendiri. Permintaan melalui `/api/requests` Next disimpan di CMS, **bukan otomatis row PostgreSQL Fastify**. Tidak ada migrasi database baru untuk revisi UI/CMS ini.

## Uji sebelum rilis

```powershell
npm run typecheck
npm run build
node frontend/scripts/test-october-revision.mjs
docker compose -f infrastructure/docker-compose.yml config --quiet
```

Tes integrasi memakai port 3162 dan direktori fixture terpisah. Jangan menjalankan dua script QA pada port tersebut sekaligus. Preview visual mobile/browser, Lighthouse, serta restore Docker perlu diuji secara terpisah; hasil CLI tidak membuktikan layout atau animasi sudah lulus di perangkat nyata.

## Docker local

```powershell
docker compose -f infrastructure/docker-compose.yml up -d --build
docker compose -f infrastructure/docker-compose.yml ps
```

Compose membaca akun admin dari `frontend/.env.local`. Volume `cms_data` dipasang ke `/app/cms-data` pada container web dan menyimpan konten, permintaan serta unggahan. Mengganti container tidak seharusnya menghapus volume; jangan memakai `down -v` untuk upgrade biasa.

Admin production menggunakan cookie Secure. Stack Docker berjalan dalam mode production: **akses admin memerlukan HTTPS**, termasuk jika menguji Docker melalui reverse proxy lokal. Untuk UI/admin biasa di localhost HTTP, gunakan `npm run dev:web`.

## Hosting Indonesia — persyaratan, bukan paket berlangganan wajib

Gunakan VPS/cloud server dengan SSH, dukungan Docker Compose, reverse proxy HTTPS dan disk persisten. Shared hosting yang hanya mendukung PHP tidak cukup untuk konfigurasi Next.js + Fastify + PostgreSQL ini. Tidak ada kewajiban Supabase, Railway atau Vercel.

Nama Animhost/harga yang muncul di PDF adalah catatan klien, bukan spesifikasi atau penawaran yang sudah diverifikasi. Sebelum membeli, minta penyedia memastikan Node/Docker long-running, RAM/CPU, root/SSH, volume, backup, bandwidth, region Indonesia dan akses HTTPS. Belum ada pembelian/deployment dalam revisi ini.

Awali **satu instance web**. CMS JSON memakai lock file dan bukan database bersama untuk banyak host/replica. Untuk scale-out, pindahkan CMS/permintaan ke PostgreSQL/object storage bersama dahulu; jangan menggandakan container web dengan volume lokal berbeda.

## Environment production

Simpan sebagai secret/env, bukan Git. Lima akun development harus dirotasi sebelum produksi.

- `frontend/.env.local` atau secret service web: `ADMIN_ACCOUNTS_JSON` berisi email, slug divisi, hash scrypt; `ADMIN_SESSION_SECRET` acak kuat. Opsional owner pusat memakai `ADMIN_EMAIL` dan `ADMIN_PASSWORD_HASH`.
- `CMS_DATA_DIR=/app/cms-data` sudah diatur Compose; volume persisten wajib.
- Root `.env`: `NEXT_PUBLIC_SITE_URL=https://domain-resmi.example`, `NEXT_PUBLIC_API_URL=https://api.domain-resmi.example`. Compose memakai kedua nilai saat **build** dan runtime; domain belum ditentukan, jangan memakai literal contoh sebagai domain final.
- Root `.env`: `POSTGRES_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`. Pakai secret kuat; password PostgreSQL sebaiknya karakter URL-safe karena dipakai pada connection string. Jangan gunakan default development.
- Jangan set `BLOB_READ_WRITE_TOKEN` pada VPS bila ingin memakai volume lokal. Jalur Vercel/Blob adalah alternatif preview, bukan kewajiban hosting.
- Pastikan preview tidak dapat diindeks. Untuk domain produksi, tinjau `SITE_PREVIEW_MODE`/robots dan canonical sebelum rebuild.

Root env dan frontend env berbeda. `NEXT_PUBLIC_*` bukan tempat untuk password atau token. Jangan menampilkan output `docker compose config` tanpa `--quiet` ke publik karena dapat memuat secret.

## Langkah go-live

1. Konfirmasi domain, pemilik akun hosting, kontak, pin Google Maps GMB, stok/foto produk, URL sosial dan template resmi.
2. Siapkan VPS dan reverse proxy (Nginx/Caddy) dengan sertifikat TLS. Batasi firewall ke SSH dari IP admin dan 80/443. Compose saat ini adalah local baseline: **tutup/remove mapping publik 5432, 9000, 9001 dan 4000**; web/API diakses reverse proxy/internal network.
3. Pasang secret production, volume dan kepemilikan file agar user `nextjs` dapat menulis CMS.
4. Backup data existing. Bila pindah dari local, pindahkan isi `frontend/.cms-data` (atau `CMS_DATA_DIR` lama) ke volume `cms_data`, termasuk subfolder `media`; jangan hanya menyalin kode. Lindungi data pelanggan selama transfer.
5. Build dengan origin final, jalankan container, uji API `/health`, login HTTPS, lima scope akun, form, upload, invoice draf, share preview dan route media setelah restart.
6. Jalankan migrasi database hanya bila schema berubah, satu kali melalui job terkontrol. Mengubah env password pada volume PostgreSQL/MinIO yang sudah ada bukan otomatis merotasi credential penyimpanan; lakukan prosedur rotasi layanan secara terpisah.
7. Uji mobile 360/390/768, keyboard, menu, promo dialog, parallax/reduced-motion dan hero autoplay. Browser dapat memblokir autoplay; poster/fallback harus tetap terlihat.
8. Uji canonical/OG image absolut menggunakan domain publik, sitemap/robots serta embed sosial. Jangan menonaktifkan keamanan demi iframe yang diblokir penyedia.
9. Atur monitoring, alert disk dan backup/restore sebelum menerima data produksi. MFA/audit log admin perlu hardening lanjutan; autentikasi sederhana saat ini belum menyediakan keduanya.

## Media dan CMS

- JPG, PNG, WebP, MP4; magic bytes/MIME diperiksa, filename dihasilkan server.
- Batas upload lokal/VPS 30 MB; preview Vercel 4 MB melalui endpoint. Video lebih besar memakai URL HTTPS/CDN dan poster; rekomendasi format kompatibel MP4 H.264. Codec tidak ditranscode atau dijamin hanya dari ekstensi.
- `/media/{uuid}.ext` melayani upload setelah build, dengan cache immutable dan HTTP Range untuk video. Pada implementasi sekarang setiap respons membaca file ke memori; volume/CDN streaming perlu ditingkatkan bila trafik video besar.
- Hero dapat diurutkan. Letakkan video company profile di slide pertama; video diputar sekali per sesi halaman, kemudian gambar berulang 4 detik.
- Upload tidak langsung menayangkan: simpan konten/aktifkan Terbit. Hapus item CMS tidak otomatis menghapus file media, agar tautan lain tidak rusak.
- Unggahan publik CMS **bukan tempat menyimpan gambar kerja rahasia customer**. Dokumen private, signed URL, malware scanning dan retention belum tersedia.
- Editor lama mendapat 409 jika bagian sama telah berubah. Simpan/salin perubahan lokal sebelum refresh. Perubahan bagian berbeda dapat digabung memakai snapshot revisi.

## Backup dan pemulihan

Backup terjadwal untuk PostgreSQL, MinIO (jika dipakai), seluruh volume CMS/media dan konfigurasi secret dengan akses terbatas. Uji restore pada staging, bukan langsung menimpa produksi.

Lock file sisa crash dapat menghentikan penulisan. Hentikan semua penulis, verifikasi target tepat `site-content.json.lock` atau `requests.json.lock` di `CMS_DATA_DIR`, lalu tangani hanya lock yang tertinggal; jangan menghapus file data atau volume. Catat kejadian sebelum restart.

Invoice masih draf, tidak berisi rekening/pajak yang dibuat-buat. Template SPH/PO/invoice resmi, pelacakan customer/QR, notifikasi, posting sosial otomatis dan integrasi E-tago belum menjadi fitur produksi.
