# Preview Vercel

Frontend Next.js sudah terhubung ke proyek Vercel `mahamerubaja` pada tim `jaelanisuryasaputra-2719s-projects`.

- URL preview tetap: <https://mahameru-baja-preview.vercel.app>
- Portal CMS: <https://mahameru-baja-preview.vercel.app/admin/login>
- GitHub `Jayszrs/MahameruBaja` sudah terhubung. Push ke `main` memperbarui URL tetap. Root Directory proyek Vercel adalah `frontend`.
- Deploy terpisah dari root repo: `vercel deploy --target preview --scope jaelanisuryasaputra-2719s-projects`
- Kredensial admin lokal dan preview saat ini tersimpan di `.admin-local-access.txt` pada root repo. File ini diabaikan Git. Jangan unggah atau kirimkan isinya.

Preview memakai Vercel Blob **private** untuk snapshot konten CMS dan permintaan pelanggan. Variabel `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, dan `ADMIN_SESSION_SECRET` sudah dipasang pada lingkungan Preview dan Production Vercel. Keduanya memakai store preview yang sama. Sesi admin memakai secret berbeda per lingkungan. Jangan menghapus store Blob selama data preview masih dibutuhkan.

Preview tidak memakai database PostgreSQL/Fastify dari monorepo. Permintaan dan edit CMS diuji melalui route Next.js. File PDF permintaan dibuat di browser setelah permintaan berhasil disimpan. Tombol WhatsApp mengunduh PDF lalu membuka chat; pada browser biasa pelanggan tetap memilih lampiran Dokumen sendiri. Pada perangkat yang mendukung Web Share, tombol berbagi dapat menyerahkan file ke WhatsApp.

Preview mengirim `X-Robots-Tag: noindex, nofollow` dan `robots.txt` yang melarang crawler. Target Production Vercel juga memakai `SITE_PREVIEW_MODE=1`, karena URL tetap saat ini masih untuk review website. Saat go-live, hapus flag itu, atur `NEXT_PUBLIC_SITE_URL` ke domain resmi, lalu deploy ulang. Google Search Console dikonfigurasi setelah domain resmi aktif.

Untuk pemeriksaan cepat setelah deploy:

1. Buka beranda dan beberapa halaman unit pada URL preview.
2. Login ke `/admin/login`, ubah satu konten kecil, simpan, lalu muat ulang.
3. Kirim formulir permintaan uji, pastikan muncul di `/admin/permintaan`, PDF terunduh, dan tombol WhatsApp membuka chat dengan nomor permintaan.
4. Arsipkan permintaan uji dari CMS.

Perintah `vercel deploy --prod` dari root repo memperbarui URL tetap. Gunakan `--target preview` untuk hasil uji terpisah. Jangan menjalankan CLI dari `frontend` setelah Root Directory proyek diatur ke `frontend`; jalankan dari root monorepo.
