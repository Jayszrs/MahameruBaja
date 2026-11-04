# Terjemahan seluruh website

Selector ID / English / 中文 menerjemahkan teks publik langsung di halaman yang sama. Pilihan disimpan di browser dan dipertahankan saat pindah halaman. Navbar, footer, judul, teks CMS, artikel, label formulir, placeholder, alt gambar, dan konten yang muncul setelah filter ikut diproses. Nilai yang diketik pelanggan, ringkasan privat setelah pengiriman formulir, panel PDF/WhatsApp yang memuat nama berkas, URL, telepon tujuan, dan admin CMS tidak diubah. Tulisan yang menyatu dalam gambar/poster tidak dapat diterjemahkan sebagai teks HTML; unggah aset bahasa lain jika dibutuhkan.

Status 1 November 2026: integrasi disiapkan, **belum diaktifkan karena API key belum tersedia**. Pilihan English / 中文 ditandai “segera” dan belum bisa dipilih sampai key terpasang. Pengujian UI mengaktifkan pilihan hanya pada browser percobaan dengan respons terjemahan tiruan; ini tidak membuktikan koneksi Google aktif.

## Mendapatkan key resmi

1. Buka [Google Cloud Console](https://console.cloud.google.com/projectcreate), masuk dengan akun perusahaan/pemilik, lalu buat atau pilih proyek.
2. Hubungkan billing. Google mensyaratkan billing untuk Cloud Translation. Langkah ini harus diputuskan pemilik akun, bukan diaktifkan otomatis oleh kode website.
3. Aktifkan [Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com).
4. Di [Credentials](https://console.cloud.google.com/apis/credentials), buat API key dan batasi API-nya ke Cloud Translation API. Key dipakai server Vercel; jangan memakai pembatas HTTP referrer yang hanya cocok untuk panggilan browser.
5. Pada Vercel → proyek Mahameru Baja → Settings → Environment Variables, isi `GOOGLE_TRANSLATE_API_KEY` untuk Production. Jangan menaruh key di chat, repository, CMS, atau variabel `NEXT_PUBLIC_*`.
6. Atur kuota penggunaan di Google Cloud, lalu deploy ulang. Batas karakter per instance pada aplikasi adalah perlindungan tambahan; serverless memiliki banyak instance sehingga batas ini bukan batas global biaya.
7. Uji English dan 中文 pada Beranda, Jasa, Produk, Galeri, artikel, filter, dan drawer penawaran. Pastikan ID mengembalikan teks asli serta form tetap menerima data dengan benar.

Google mencantumkan 500.000 karakter pertama per bulan untuk model NMT gratis sebagai kredit bulanan; penggunaan setelah itu dapat ditagihkan. Verifikasi harga dan kuota sebelum mengaktifkan billing. Cache aplikasi hanya mengurangi panggilan selama instance masih hidup, bukan jaminan gratis.

Sumber resmi: [setup](https://docs.cloud.google.com/translate/docs/setup), [API key Basic](https://docs.cloud.google.com/translate/docs/authentication), [harga](https://cloud.google.com/products/translate/pricing), [kuota](https://docs.cloud.google.com/translate/quotas).
