export function serviceDescription(slug: string, title: string) {
  if (slug === "laser-cutting") {
    if (/bending|tekuk/i.test(title) && !/cutting\s*\+/i.test(title)) return "Tekuk plat sesuai ukuran dan sudut yang Anda butuhkan. Kirim gambar, jenis plat, ketebalan, dan jumlah untuk pengecekan mesin serta harga.";
    if (/fabrikasi|finishing/i.test(title)) return "Lanjutkan hasil potongan dengan perakitan, pengelasan, atau perapian sesuai kebutuhan. Ceritakan hasil akhir yang Anda inginkan agar tim bisa menyiapkan penawaran.";
    return "Wujudkan potongan plat sesuai desain Anda, dari ornamen sampai komponen mesin. Kirim gambar, ukuran, bahan, dan jumlah; tim membantu mengecek proses dan harga.";
  }
  if (slug === "fabrikasi-erection") {
    if (/erection|pemasangan|lapangan/i.test(title)) return "Bantu pemasangan bagian baja di lokasi proyek sesuai gambar dan pekerjaan yang disepakati. Sampaikan lokasi, kondisi lapangan, dan target waktu agar tim dapat meninjau kebutuhan.";
    if (/gambar|konsultasi/i.test(title)) return "Sudah punya gambar atau masih menyusun rencana? Diskusikan kebutuhan struktur baja dengan tim sebelum menentukan pekerjaan, material, dan jadwal.";
    return "Pengerjaan dan perakitan bagian baja sesuai gambar proyek. Kirim ukuran, jenis material, dan jumlah agar tim dapat menyiapkan rincian pekerjaan serta penawaran.";
  }
  if (slug === "trading-proyek") return `Lengkapi kebutuhan ${title.toLowerCase()} untuk proyek Anda. Kirim daftar ukuran, jumlah, lokasi, dan target pengiriman. Tim mengecek pilihan material dan menyiapkan penawaran sesuai kebutuhan.`;
  if (/konsultasi/i.test(title)) return "Belum yakin memilih material? Ceritakan rencana pekerjaan Anda. Tim toko membantu mengecek pilihan ukuran, jumlah, harga, dan rencana pengiriman.";
  return `Cari ${title.toLowerCase()} untuk bangunan, renovasi, atau bengkel Anda. Tanyakan ukuran dan jumlah yang dibutuhkan kepada tim toko untuk konfirmasi stok, harga, serta pengiriman.`;
}
