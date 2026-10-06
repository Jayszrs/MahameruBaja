# Preview Vercel

Frontend Next.js sudah terhubung ke proyek Vercel `mahamerubaja` pada tim `jaelanisuryasaputra-2719s-projects`.

- Preview: <https://mahameru-baja-preview-dwrcz1udx.vercel.app>
- Portal CMS: <https://mahameru-baja-preview-dwrcz1udx.vercel.app/admin/login>
- Deploy ulang dari root repo: `vercel deploy --cwd frontend --target preview --scope jaelanisuryasaputra-2719s-projects`
- Kredensial admin lokal dan preview saat ini tersimpan di `.admin-local-access.txt` pada root repo. File ini diabaikan Git. Jangan unggah atau kirimkan isinya.

Preview memakai Vercel Blob **private** untuk snapshot konten CMS dan permintaan pelanggan. Variabel `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, dan `ADMIN_SESSION_SECRET` sudah dipasang pada lingkungan Preview. Sesi admin memakai secret berbeda dari lingkungan lokal. Jangan menghapus store Blob selama data preview masih dibutuhkan.

Preview tidak memakai database PostgreSQL/Fastify dari monorepo. Permintaan dan edit CMS diuji melalui route Next.js. File PDF permintaan dibuat di browser setelah permintaan berhasil disimpan. Tombol WhatsApp mengunduh PDF lalu membuka chat; pada browser biasa pelanggan tetap memilih lampiran Dokumen sendiri. Pada perangkat yang mendukung Web Share, tombol berbagi dapat menyerahkan file ke WhatsApp.

Preview mengirim `X-Robots-Tag: noindex, nofollow` dan `robots.txt` yang melarang crawler. Pengaturan ini hanya berlaku untuk target Preview. Domain resmi, Google Search Console, dan SEO publik perlu dikonfigurasi saat go-live.

Untuk pemeriksaan cepat setelah deploy:

1. Buka beranda dan beberapa halaman unit pada URL preview.
2. Login ke `/admin/login`, ubah satu konten kecil, simpan, lalu muat ulang.
3. Kirim formulir permintaan uji, pastikan muncul di `/admin/permintaan`, PDF terunduh, dan tombol WhatsApp membuka chat dengan nomor permintaan.
4. Arsipkan permintaan uji dari CMS.

Jangan gunakan `vercel deploy --prod` untuk preview. Perintah deploy tanpa `--target preview` pernah memilih target Production pada CLI lama, jadi target ditulis eksplisit.
