# Mahameru Baja Platform

Monorepo Next.js + Fastify + PostgreSQL. Prototype Figma Make sudah dimigrasikan ke `frontend/`.

## Development

- `npm run dev`: Next.js (3000) + Fastify API (4000)
- `npm run dev:web`: frontend only
- `npm run dev:api`: backend only
- `npm run docker:up`: full container stack

## Struktur

- `frontend/app` - Next.js App Router
- `frontend/src` - komponen, halaman prototype, data, dan CSS
- `backend/src` - REST API publik/internal
- `database/src` - schema Drizzle
- `database/migrations` - migrasi SQL
- `infrastructure` - Docker Compose
- `docs` - requirement, arsitektur, deployment, dan operasi

## Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS v4
- Fastify + Zod
- PostgreSQL + Drizzle ORM
- Docker Compose

## Styling

Tailwind CSS v4 dimuat dari `frontend/src/index.css` melalui `frontend/postcss.config.mjs`. Pertahankan token desain yang sudah ada.
