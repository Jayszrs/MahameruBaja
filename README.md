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

Portal admin lokal: `http://localhost:3000/admin/login`, atau tautan **Portal Admin** di footer situs. Kredensial development tersimpan di `frontend/.admin-local-access.txt` (diabaikan Git). Dashboard saat ini memakai data pratinjau sesi; login sudah aktif, sedangkan penyimpanan konten belum tersambung.

Untuk setup lengkap, keputusan hosting, environment variables, backup, dan checklist go-live, baca [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
