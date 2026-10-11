# Portal admin bersama

Login berhasil membuka `/admin`: dashboard operasional dalam sidebar grafit dengan aksen merah, panel putih, dan latar putih hangat. Dashboard menampilkan permintaan aktif, yang perlu ditinjau, artikel terbit, banner tayang, status konten, serta permintaan/artikel terbaru.

## Menu dan tampilan

| Kelompok | URL dan pilihan |
| --- | --- |
| Sales Desk | `/admin/permintaan?view=active` atau `archived`; `filter=Perlu+ditinjau` menampilkan Baru/Review kebutuhan |
| Konten Publik | `/admin/konten?tab=contacts` atau `reviews` |
| Kanal | `/admin/sosial?tab=accounts` atau `posts` |
| Beranda | `/admin/promosi?view=all`, `live`, atau `draft` |
| Artikel | `/admin/artikel?status=all`, `draft`, atau `published` |

Parameter `id` pada artikel/permintaan dapat membuka record tertentu dari dashboard. Parameter tampilan tidak valid memakai pilihan awal. Tab/filter pada workspace yang sama tidak menghapus perubahan lokal.

Kelompok dapat dibuka/ditutup secara independen. Preferensi tersimpan di browser dan kelompok halaman aktif terbuka saat navigasi. Desktop mulai 1024 px memakai sidebar 264 px; layar lebih kecil memakai drawer dengan fokus keyboard, Escape, backdrop, dan tombol tutup. Konten dibatasi 1600 px.

## Menyimpan dan berpindah

Header bersama mengikuti tindakan workspace dan menampilkan status simpan. Navigasi yang membuang suntingan serta logout meminta konfirmasi. Pemilihan record lain memakai konfirmasi yang sama. Ketika proses simpan berlangsung, navigasi ditahan. Refresh/penutupan tab memakai dialog bawaan browser.

Pengaman `nextjs-nav-guard` dipasang pada root sebelum konten async/login agar Back/Forward diproses sebelum Next. Next dipertahankan pada versi 16.3.8 yang diuji. Sumber kompatibilitas: [dokumentasi pengaman navigasi](https://github.com/br-schneider/nextjs-nav-guard).

Layout workspace menggunakan route group `(workspace)`; URL publik admin tidak berubah, dan login berada di luar layout sidebar. Pemeriksaan sesi diterapkan pada layout dan pembacaan data terlindungi, karena halaman/layout dapat dirender paralel. API, schema penyimpanan, dan isi Blob/JSON tetap memakai kontrak sebelumnya.

Banner tayang mengikuti field tanggal terstruktur dalam WIB, termasuk batas tanggal mulai/akhir; tanggal kosong tidak membatasi periode. Permintaan aktif berarti nonarsip, dan perlu ditinjau berarti Baru/Review kebutuhan. Metrik tidak memakai angka contoh atau grafik trafik buatan.

Pengujian browser `frontend/scripts/test-admin-workspace.mjs` memerlukan fixture lokal yang dapat dibuang (`ARTICLE_TEST_ISOLATED=1`). Skrip membuat/mengubah/menghapus data fixture; jangan menjalankannya pada data kerja atau preview. Regresi artikel memakai pengujian CMS sebelumnya.
