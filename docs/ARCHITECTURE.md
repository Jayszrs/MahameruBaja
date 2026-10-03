# Arsitektur

## Keputusan stack

- Next.js App Router dipilih untuk SSR/SSG, metadata, sitemap, routing berbasis file, image/CDN integration, dan reload development melalui Turbopack.
- Fastify dipisah sebagai API agar dashboard/admin, webhook, job dokumen, dan integrasi ERP tidak menumpuk di rendering frontend.
- PostgreSQL dipilih karena requirement bersifat relasional/transaksional: lead, item, order, status, pembayaran, dan dokumen.
- Drizzle menjaga schema TypeScript dekat dengan SQL dan migrasi tetap eksplisit.
- Object storage digunakan untuk desain pelanggan dan dokumen; file tidak disimpan di filesystem container.

## Batas modul

```text
Browser
  -> Next.js frontend (company profile, katalog, forms, SEO)
       -> Fastify API (validasi, rate limit, workflow/application rules)
            -> PostgreSQL (data terstruktur)
            -> Object storage (gambar/desain/dokumen)
            -> WhatsApp/notification adapter (fase berikutnya)
```

Frontend tidak menerima credential database. Semua mutation sensitif melewati API. Admin API berikutnya wajib memakai autentikasi, authorization berbasis role, audit log, dan CSRF/session policy yang sesuai.

## Struktur repo

```text
frontend/
  app/                  Next.js routes dan metadata
  src/components/       UI dan application shell
  src/screens/          halaman prototype yang dipertahankan
  src/data/             data katalog sementara
  public/               aset publik
backend/
  src/routes/           REST endpoints
  src/config.ts         validasi environment
database/
  src/schema.ts         source of truth schema
  migrations/           SQL versioned
infrastructure/
  docker-compose.yml    local/full-stack deployment
docs/
```

## Catatan performa

- Jalankan `npm run dev:web` langsung di host untuk hot reload tercepat; Docker difokuskan untuk parity dan production.
- Katalog publik nantinya di-cache/revalidate; mutation lead tetap dinamis.
- Gunakan pooled connection untuk serverless dan direct/session connection untuk container yang long-running.
- Gambar dikirim melalui object storage/CDN, bukan base64 atau database.
