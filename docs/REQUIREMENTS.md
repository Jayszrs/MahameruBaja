# Ringkasan kebutuhan klien

Sumber: `Draft_Permintaan_Mahameru_Baja.pdf` (25 halaman hasil scan). Dokumen diperlakukan sebagai sumber kebutuhan, bukan sebagai instruksi eksekusi.

## Tujuan bisnis

Website menjadi satu pintu untuk empat jalur bisnis: Mahameru Baja Retail Tambun, Garuda Marginal Baja Retail Cibitung, Mahameru Baja Indonesia Trading/Supply Proyek, serta MBI Laser Cutting/CNC Bending/Fabrikasi. Situs harus mengubah pengunjung menjadi lead, mengarahkan mereka ke nomor WhatsApp yang tepat, dan menyediakan dasar sistem operasional modular.

## Fitur publik

- Company profile, katalog, detail produk, layanan, galeri, artikel, kontak.
- Kategori produk: besi beton, hollow, plat, WF/H-Beam, UNP, CNP, siku, pipa, material konstruksi, dan produk lain.
- Produk menyimpan foto, nama, spesifikasi, ukuran, satuan, keterangan, status ketersediaan, dan mode harga "hubungi kami".
- Form minta harga mencatat kontak, kota, produk, spesifikasi, ukuran, jumlah, catatan, dan unit tujuan.
- Form laser/bending mencatat material, ketebalan, ukuran, jumlah, jenis pekerjaan, catatan, serta file desain DWG/DXF/PDF/AI/CDR/JPG/PNG.
- Empat jalur WhatsApp dan tombol floating yang menanyakan unit tujuan.
- SEO lokal Tambun, Cibitung, Bekasi; jangan membuat halaman doorway/keyword stuffing.
- Analytics agregat: kunjungan, halaman/produk populer, sumber trafik, klik WhatsApp, dan konversi form.

## CRM dan admin

- Lead: nomor, nama, WhatsApp, kota, tanggal, produk/permintaan, unit, estimasi, status, PIC, dan catatan follow-up.
- Status lead: Baru -> Sudah Dihubungi -> Penawaran Dikirim -> Follow-up -> Deal/Belum Deal.
- Pencarian berdasarkan nama, WhatsApp, produk, tanggal, unit, dan status.
- Dashboard ringkas untuk pengunjung, lead, permintaan harga, request laser, penawaran, dan deal.
- Data pribadi hanya dicatat setelah pengguna mengirim form/komunikasi dan memberi persetujuan.

## Workflow operasional

Trading: Request -> Cek Stok -> Penawaran -> PO -> Proforma Invoice -> Pembayaran -> Memo -> Surat Jalan -> Pengiriman -> Diterima.

Produksi: Gambar -> Review -> Penawaran -> SPK -> Jadwal Produksi -> Cutting -> Bending -> Fabrikasi -> QC -> Invoice -> Selesai/Lunas.

Dokumen memerlukan nomor otomatis yang formatnya dapat dikonfigurasi: quotation, PO, proforma invoice, invoice, memo, surat jalan, SPK, dan jadwal produksi. Setiap customer/order mempunyai folder dokumen terpadu.

## Keputusan fase

### Fase 1 - fondasi (sudah disiapkan di repo)

- Monorepo frontend/backend/database.
- Next.js App Router dan route publik dari prototype.
- REST endpoint pembuatan lead quotation/laser.
- Skema PostgreSQL awal untuk unit, produk, lead, item, order, dokumen, dan audit log.
- Docker Compose untuk web, API, PostgreSQL, dan object storage lokal.

### Fase 2 - sebelum go-live

- Login admin dan role/permission.
- Upload file langsung ke object storage menggunakan signed URL, antivirus scan, dan kebijakan retensi.
- CRUD katalog/CMS dan dashboard CRM produksi.
- Notifikasi admin dan routing ke empat nomor WhatsApp yang sudah dikonfirmasi.
- Analytics consent-aware, Search Console, sitemap, structured data, dan redirect map.

### Fase 3 - operasional

- State machine trading/produksi, dokumen bernomor otomatis, template PDF, pembayaran, jadwal, QC, bukti kirim.
- Integrasi accounting/ERP setelah workflow stabil; tidak membangun software akuntansi penuh di aplikasi ini.

## Data yang masih harus dikonfirmasi klien

- Empat nomor WhatsApp resmi, alamat, jam operasional, tautan Maps, email, dan akun sosial.
- Logo/brand assets final serta hak penggunaan semua foto.
- SKU, spesifikasi, stok, satuan, harga/mode harga, dan foto produk final.
- Spesifikasi mesin (dokumen menyebut laser 3000 W dan bending 160 ton, tetapi belum terverifikasi).
- Format nomor dokumen, pajak, termin, approval, PIC/role admin, kebijakan privasi/retensi, dan SLA respons.
