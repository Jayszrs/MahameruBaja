# Aset logo divisi — 10 Oktober 2026

Mode: **tool ImageGen bawaan**, edit gambar kiriman pengguna, bukan CLI/API fallback. Semua hasil terpilih sudah disalin ke workspace; file foto sumber tidak ditimpa. PNG memiliki kanal alpha RGBA dengan nilai transparansi 0–255.

| Pemakaian | File final di repo | Tulisan logo sumber |
| --- | --- | --- |
| Identitas utama dan divisi laser | `frontend/public/images/brand/mbi-laser.png` | MAHAMERU BAJA INDONESIA / MBI LASER CUTTING |
| Retail Tambun | `frontend/public/images/brand/mahameru-retail.png` | MAHAMERU / MARGINAL NUSANTARA |
| Retail Cibitung | `frontend/public/images/brand/garuda.png` | GARUDA / MARGINAL BAJA |
| Trading | `frontend/public/images/brand/mbi-trading.png` | MBI / TRADING |
| Project | `frontend/public/images/brand/mbi-proyek.png` | MBI / PROYEK |

## Prompt set / batasan edit

Brief untuk kelima edit: gunakan logo terlampir sebagai sumber, hapus hanya latar luar hitam/putih menjadi transparan, pertahankan bentuk geometris, warna merah/emas/perak, shading metalik dan seluruh tulisan persis sesuai logo masing-masing. Rapikan tepi dan tingkatkan keterbacaan tanpa mendesain identitas baru. Jangan menambahkan simbol, tulisan, watermark, bayangan latar atau mengganti komposisi. Output logo terisolasi, transparan, tajam untuk web.

Parameter setiap panggilan: `transparent_background: true`, satu sumber logo per hasil. Hasil raster diperiksa secara visual sebelum dipakai, termasuk ejaan, bagian tengah hitam logo yang perlu dipertahankan, serta area latar transparan. Header/section memakai optimasi `next/image` agar tidak mengirim PNG ukuran penuh untuk logo kecil.

Hasil ini bukan logo master vektor dan edit generatif bukan jaminan identik piksel demi piksel. Untuk kebutuhan brand resmi/cetak besar, mintalah SVG/AI/PDF vektor asli kepada pemilik. Logo contoh partner berada terpisah di `images/client-logos/` dan bukan bukti hubungan kerja sama.
