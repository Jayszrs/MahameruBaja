# Mahameru Baja Platform

Monorepo company profile, katalog produk, lead/CRM, dan fondasi workflow operasional Mahameru Baja.

## Stack

- `frontend/`: Next.js App Router + React + TypeScript + Tailwind CSS v4
- `backend/`: Fastify REST API + Zod
- `database/`: PostgreSQL + Drizzle ORM/migrations
- `infrastructure/`: Docker Compose untuk web, API, PostgreSQL, dan MinIO
- `docs/`: arsitektur, kebutuhan klien, deployment, dan runbook operasi

## Mulai cepat

1. Salin `.env.example` menjadi `.env`.
2. Jalankan `npm install`.
3. Jalankan database lokal: `docker compose -f infrastructure/docker-compose.yml up -d postgres minio`.
4. Jalankan migrasi: `npm run db:migrate`.
5. Jalankan web dan API: `npm run dev`.

Web: `http://localhost:3000`  
API health: `http://localhost:4000/health`  
MinIO Console: `http://localhost:9001`

Portal admin lokal: `http://localhost:3000/admin/login`, atau tautan **Portal Admin** di footer situs. Kredensial development tersimpan di `.admin-local-access.txt` pada root proyek (diabaikan Git). Setelah login, dashboard memuat permintaan pelanggan, kontak dan ulasan, serta kanal sosial. Form publik menyimpan permintaan ke `frontend/.cms-data/requests.json` dan menyiapkan PDF ringkasan untuk dibagikan lewat WhatsApp. Konten CMS disimpan di `frontend/.cms-data/site-content.json`; untuk server produksi, atur `CMS_DATA_DIR` ke volume persisten.

Untuk mengerjakan tampilan saja, jalankan `npm run dev:web`; API Fastify dan PostgreSQL tidak diperlukan untuk CMS Next ini. Jika muncul `EADDRINUSE` pada 3000 atau 4000, server sebelumnya masih berjalan: gunakan server itu atau hentikan proses pemilik port sebelum menjalankan ulang.

Untuk setup lengkap, keputusan hosting, environment variables, backup, dan checklist go-live, baca [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Preview Next.js di Vercel sudah disiapkan. URL, cara deploy ulang, dan batasan preview tercatat di [docs/VERCEL_PREVIEW.md](docs/VERCEL_PREVIEW.md).

CMS artikel tersedia di `/admin/artikel`: editor visual, draf/terbit, gambar, dan pratinjau. Konten artikel memakai private Blob pada Vercel dan JSON pada lokal, tanpa PostgreSQL. Panduan penggunaan dan penyimpanan: [docs/CMS_ARTICLES.md](docs/CMS_ARTICLES.md).

## Memperbarui salinan tim yang memakai Docker

Semua gambar website disimpan dan dilacak Git di `frontend/public/images`; font PDF ada di `frontend/public/fonts`. Tidak perlu menyalin aset dari komputer pembuat desain.

Setelah menarik perubahan terbaru, rebuild container web agar gambar masuk ke lokasi yang benar:

```powershell
git pull
docker compose -f infrastructure/docker-compose.yml up -d --build web
```

Periksa `http://localhost:3000/images/hero-steel-warehouse-v2.png`. Jika URL gambar itu belum muncul, pastikan container web yang dibuka sudah memakai image hasil build terbaru. Next.js standalone monorepo melayani aset dari `/app/frontend/public`, sesuai lokasi `frontend/server.js`.
