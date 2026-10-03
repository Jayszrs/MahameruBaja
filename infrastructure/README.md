# Infrastruktur lokal

`docker-compose.yml` menyediakan Next.js, Fastify, PostgreSQL 17, dan MinIO.

```bash
docker compose -f infrastructure/docker-compose.yml up --build
```

```bash
docker compose -f infrastructure/docker-compose.yml down
```

Perintah `down` tidak menghapus volume. Penghapusan volume database/object storage sengaja tidak dijadikan script karena destruktif.
