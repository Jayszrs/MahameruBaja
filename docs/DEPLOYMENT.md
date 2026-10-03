# Deployment dan operasi

## Rekomendasi hosting

### Rekomendasi utama

- Railway Pro untuk container `web` dan `api` dari Dockerfile.
- Supabase Pro untuk PostgreSQL, Storage, dan Auth admin.
- Cloudflare untuk DNS, caching aset, WAF/rate limiting tambahan, dan pengelolaan domain.

Kombinasi ini nyaman untuk tim kecil: aplikasi tetap portable sebagai container, sedangkan backup database, storage, dan auth dikelola layanan khusus. Alternatif paling sederhana adalah seluruh stack di Railway, tetapi backup object storage dan lifecycle file perlu dirancang sendiri. Vercel Pro cocok bila ingin frontend Next.js paling native, tetapi Vercel tidak memakai Dockerfile aplikasi dan Hobby hanya untuk penggunaan personal/non-komersial.

Estimasi minimum platform produksi per Oktober 2026 (sebelum pajak/overage): Railway Pro mulai USD 20/bulan dan Supabase Pro USD 25/bulan. Verifikasi kembali pricing saat pembelian.

## Local development

```bash
copy .env.example .env
npm install
docker compose -f infrastructure/docker-compose.yml up -d postgres minio
npm run db:migrate
npm run dev
```

Untuk reload frontend paling cepat, jalankan Next.js di host (`npm run dev:web`). Dokumentasi Next.js juga merekomendasikan local dev di host pada Mac/Windows, sementara Docker digunakan untuk produksi/parity.

## Build dan smoke test

```bash
npm run typecheck
npm run build
docker compose -f infrastructure/docker-compose.yml up --build
```

Periksa:

- `GET http://localhost:4000/health` mengembalikan `status: ok`.
- halaman utama, katalog, detail produk, pencarian, quotation, laser, dan 404.
- submit quotation menghasilkan ID lead dan row di PostgreSQL.
- container restart tidak menghilangkan data volume.

## Environment production

Wajib di secret manager, bukan Git:

- `DATABASE_URL`: connection string production. Untuk container long-running gunakan direct/session pooler sesuai provider.
- `WEB_ORIGIN`: origin HTTPS frontend; pisahkan lebih dari satu dengan koma.
- `NEXT_PUBLIC_API_URL`: URL publik HTTPS API.
- `NEXT_PUBLIC_SITE_URL`: canonical domain.
- `NEXT_PUBLIC_WHATSAPP_MAIN`: nomor WhatsApp format internasional tanpa `+`.
- `S3_*`: endpoint, region, bucket, access key, secret key; beri akses minimum.

Tambahkan sebelum fitur admin/upload go-live: secret session, provider email, analytics ID, error tracking DSN, dan webhook secret.

## Railway

1. Hubungkan repository GitHub ke satu project Railway.
2. Buat service `web` memakai `frontend/Dockerfile` dan service `api` memakai `backend/Dockerfile`.
3. Atur healthcheck API `/health`; web dapat memakai `/`.
4. Pasang environment variables dan custom domain.
5. Hubungkan `api` ke Supabase memakai connection string session/direct yang sesuai jaringan Railway.
6. Jalankan migrasi sebagai release command/job terkontrol, bukan setiap replica startup.
7. Atur hard/soft spend limit dan alert penggunaan.

## Supabase

1. Buat project di region terdekat pengguna (umumnya Singapore untuk Indonesia, verifikasi latency dan kebutuhan hukum perusahaan).
2. Gunakan Postgres connection pooler yang sesuai deployment.
3. Buat bucket private untuk `customer-designs` dan `documents`; akses file melalui signed URL.
4. Terapkan batas ukuran/jenis file, scanning malware, logging download, dan retention policy.
5. Aktifkan daily backup pada plan produksi. Ingat: backup database tidak otomatis mencakup object file; buat backup/lifecycle storage terpisah.

## Migrasi database

- Perubahan schema dibuat di `database/src/schema.ts`.
- Generate migration: `npm run db:generate`.
- Review SQL yang dihasilkan.
- Backup database sebelum migration produksi.
- Jalankan `npm run db:migrate` sekali melalui job/release pipeline.
- Migration destructive (drop/rename/transform) harus diuji dengan salinan data staging dan memiliki rollback/restore plan.

## Domain dan DNS

- Canonical: `mahamerubaja.com` (konfirmasi kepemilikan).
- Redirect permanen `www` ke apex atau sebaliknya; pilih satu canonical.
- API: `api.mahamerubaja.com`.
- TLS wajib, HSTS setelah verifikasi semua subdomain HTTPS.
- Siapkan SPF/DKIM/DMARC bila mengirim email dari domain.

## Backup dan disaster recovery

- Target awal yang realistis: RPO 24 jam, RTO 4 jam; minta persetujuan bisnis.
- Daily database backup dengan retensi minimum 7 hari; backup mingguan/bulanan sesuai kebijakan perusahaan.
- Uji restore staging minimal per kuartal.
- Object storage memerlukan versioning/backup terpisah.
- Simpan runbook insiden: siapa yang dihubungi, cara rollback deployment, restore database, dan rotasi secret.

## Observability dan keamanan

- Structured logs dengan request ID; jangan log nomor WhatsApp lengkap, isi desain, token, atau credential.
- Error tracking, uptime monitor `/health`, metrik latency/error rate, dan alert disk/database.
- Rate limit sudah ada pada API publik; tambahkan CAPTCHA hanya bila abuse nyata.
- Admin wajib MFA, least privilege, audit log, dan session expiry.
- Validasi file berdasarkan content type/magic bytes, bukan ekstensi saja.
- Privacy notice dan consent harus menjelaskan tujuan, akses, retensi, serta cara meminta penghapusan data.

## Checklist go-live

- [ ] Semua data bisnis yang belum pasti telah dikonfirmasi.
- [ ] Tidak ada copy yang mengklaim stok/harga/spesifikasi mesin tanpa verifikasi.
- [ ] Form tersimpan ke database dan fallback WhatsApp berfungsi.
- [ ] Empat nomor WhatsApp dirutekan dengan benar.
- [ ] Upload file private + signed URL + scanning aktif.
- [ ] Auth admin, role, audit, dan backup/restore diuji.
- [ ] Privacy policy, terms, cookie/analytics consent sesuai kebutuhan hukum.
- [ ] Search Console, sitemap, robots, canonical, OG image, schema LocalBusiness/Product diuji.
- [ ] Lighthouse/mobile, accessibility keyboard, 404, dan error states diuji.
- [ ] DNS/TLS, monitoring, cost alerts, dan ownership akun didokumentasikan.
