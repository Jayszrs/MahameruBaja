# Quotes, Sandblasting, form bertahap, dan identitas pencarian

Revisi 1 November 2026:

- Beranda memakai heading **Quotes**. Setiap quote tampil dengan gambar. Quote lama yang belum memiliki gambar mendapat foto toko bawaan; gambar unggahan sendiri tetap dipertahankan. CMS → Beranda → Quotes mewajibkan gambar sebelum menyimpan quote baru, serta menyediakan teks dan penulis/sumber.
- Kartu Sandblasting memperoleh ilustrasi yang bisa diganti melalui CMS → Jasa → Detail jasa → Sandblasting. Gambar kosong pada konfigurasi lama juga mendapat ilustrasi bawaan, sehingga perubahan tidak memerlukan reset seluruh pengaturan CMS.
- Form Jasa mempunyai empat tahap: Layanan, Gambar & detail, Kontak, Ringkasan. Tahap selanjutnya terkunci sampai persyaratan tahap sebelumnya lengkap. Pilihan konsultasi tanpa gambar membutuhkan penjelasan. Material/ukuran/jumlah, tipe/ukuran berkas, WhatsApp, lokasi, dan persetujuan akhir diperiksa. Tombol Kembali mempertahankan data; pemeriksaan lengkap dijalankan lagi sebelum pengiriman. Berkas desain tetap dikirim sebagai lampiran WhatsApp setelah permintaan disimpan.
- Nama situs yang diajukan lewat `WebSite` dan Open Graph adalah **MBI Laser Cutting**, dengan alternatif MBI Laser, Mahameru Baja, dan Mahameru Baja Indonesia. Judul beranda/Jasa menyebut jasa cutting laser Bekasi & Tambun. Nama perusahaan Mahameru Baja Indonesia tetap digunakan untuk identitas organisasi.
- Logo organisasi memakai aset MBI 180 × 180 yang sudah ada. Favicon PNG 96 × 96 dan ICO tetap memakai URL stabil dan diperiksa dapat diakses Googlebot-Image. Sitemap menandai perubahan beranda dan Jasa pada tanggal revisi, tanpa mengubah tanggal halaman lain secara palsu.

Search Console diperiksa melalui properti `https://mahamerubaja.vercel.app/`; beranda tercatat “URL ada di Google / Halaman diindeks”. Setelah deployment, ajukan pengindeksan ulang untuk beranda dan Jasa. Pengajuan crawl bukan jaminan peringkat atau perubahan logo/nama pada hari yang sama. Nama generik “Jasa Cutting Laser” tidak dipakai sebagai pengganti identitas merek.

Rujukan Google: [nama situs](https://developers.google.com/search/docs/appearance/site-names), [favicon](https://developers.google.com/search/docs/appearance/favicon-in-search).

## Aset ilustrasi

Mode: **built-in imagegen**, satu gambar baru. Aset akhir: `frontend/public/images/sandblasting-illustration-v1.webp` — 1200 × 800, sekitar 163 KB. Ilustrasi generik, tidak diklaim sebagai foto proyek Mahameru. Quote bawaan menggunakan foto yang sudah ada: `frontend/public/images/steel-indonesia/toko-mahameru.jpg`.

Prompt akhir:

> Create a single landscape editorial industrial illustration, 3:2 aspect ratio, for the Sandblasting service card on Mahameru Baja Indonesia's steel fabrication website. Semi-realistic photographic illustration matching premium industrial photos, muted steel gray workshop, controlled red details. Show one professional abrasive blasting operator in a proper enclosed ventilated blasting bay, wearing a full supplied-air blasting hood with face protection, heavy gloves, protective suit, boots, and a visible air supply hose, holding an abrasive blasting nozzle directed toward a large steel plate. Clear controlled abrasive stream and a small contained dust plume at the steel surface; show a visibly cleaned matte steel area next to an oxidized area so the cleaning process is understandable. Steel parts supported securely. No sparks, no welding arc, no laser machinery. Mid-wide side view, believable technical equipment and proportions, readable as a small website card image. No text, no logos, no watermark, no UI, no border. This is a generic illustrative depiction, not a documented Mahameru project.

Validasi lokal: build produksi dan TypeScript lulus; aturan tahap/file/kontak/persetujuan, navigasi maju/mundur, kirim dengan respons API tiruan, upload/simpan gambar quote pada CMS terisolasi, gambar Sandblasting, viewport 320/390/768/1440 px, serta pemeriksaan crawler tanpa JavaScript pada 12 halaman lulus. Canonical, metadata, structured data, favicon, robots, dan sitemap diperiksa. Pengujian tidak mengirim lead atau pesan WhatsApp ke produksi.
