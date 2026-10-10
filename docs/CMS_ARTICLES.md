# CMS artikel

Masuk melalui `/admin/login`, lalu pilih **Artikel & panduan** atau buka `/admin/artikel`.

## Menulis dan menerbitkan

- Pilih artikel atau **Tambah**. Isi judul, kategori, tanggal WIB, ringkasan, sampul, deskripsi gambar, dan isi.
- Toolbar visual mendukung heading, bold, italic, daftar, tautan, tabel, gambar, undo, dan redo. Markdown disimpan di balik editor; admin tidak perlu menulis kode format.
- **Simpan draf** menyimpan tanpa menayangkan artikel. **Terbitkan artikel** memvalidasi kelengkapan dan memperbarui situs. **Jadikan draf** menarik artikel dari daftar dan halaman publik. **Hapus** memerlukan konfirmasi.
- Alamat mengikuti judul saat membuat draf. Setelah pertama terbit, alamat dikunci agar tautan yang sudah dibagikan tetap berlaku. Waktu baca dihitung dari isi.
- **Pratinjau** memakai renderer yang sama dengan halaman publik. Judul bagian, tabel, dan daftar pada artikel lama tetap didukung; raw HTML tidak dieksekusi.
- Tab lama tidak boleh menimpa perubahan baru. Saat mendapat konflik revisi, gunakan **Muat ulang artikel** setelah memastikan perubahan lokal boleh diganti.

## Penyimpanan

Artikel dipisahkan dari kontak, ulasan, sosial, promo, dan permintaan. Data awal berasal dari artikel yang sudah dilacak Git, tanpa mengubah URL. Data awal hanya digunakan jika penyimpanan belum ada; menghapus semua artikel tidak mengembalikan data awal.

- Vercel: snapshot private Blob pada key `articles`, menggunakan `BLOB_READ_WRITE_TOKEN` yang sudah terhubung ke CMS. Tidak perlu PostgreSQL atau migrasi database.
- Lokal: `articles.json` dan direktori `article-media` dalam `CMS_DATA_DIR`, atau `.cms-data` pada working directory frontend.
- Docker: `CMS_DATA_DIR=/app/cms-data` dan volume `cms_data` dipasang pada `/app/cms-data`, bersama koleksi CMS lainnya. Jika instalasi lama memakai `/app/frontend/.cms-data`, cadangkan dan pindahkan datanya sebelum memakai konfigurasi ini; jangan menghapus volume lama.
- Gambar JPG, PNG, atau WebP maksimal 4 MB disimpan private. Route `/api/articles/media/[id]` menayangkan gambar terbit dan memberikan akses gambar draf hanya bagi admin. Cache media dinonaktifkan agar gambar berhenti tersedia setelah artikelnya ditarik.

Sesi admin memakai konfigurasi yang sama: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_ACCOUNTS_JSON` untuk akun divisi, dan `ADMIN_SESSION_SECRET`. Untuk Next lokal di host, gunakan `frontend/.env.local` (bukan `.env-local`). Compose membaca `.env` root lalu `frontend/.env.local` jika tersedia; nilai dari file kedua menang jika kuncinya sama. Semua akun admin dapat mengelola artikel bersama, sedangkan permintaan pelanggan tetap dibatasi menurut divisi. Nama, hash, dan secret jangan dimasukkan ke Git.

## API dan pengujian

`GET/POST /api/admin/articles`, `GET/PUT/DELETE /api/admin/articles/[id]`, dan `POST /api/admin/articles/upload` memerlukan sesi admin. Penulisan memeriksa origin, ukuran payload, schema, slug unik, dan revisi. Artikel baru dapat diterbitkan tanpa rebuild; hanya artikel terbit dipakai pada metadata, sitemap, dan daftar terkait.

Pengujian HTTP memakai `frontend/scripts/test-articles.mjs` dengan `ARTICLE_TEST_ISOLATED=1` terhadap server lokal dan direktori CMS khusus fixture. `ARTICLE_TEST_EMPTY=1` juga menguji daftar kosong dengan menghapus artikel pada fixture. Skrip menolak URL hosting publik. Jangan menjalankannya terhadap data lokal yang masih dibutuhkan.
