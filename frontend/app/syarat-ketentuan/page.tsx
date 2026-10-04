import Link from "next/link";

export const metadata = { title: "Syarat & Ketentuan" };

export default function TermsPage() {
  return <section className="home-section bg-white"><div className="home-shell max-w-4xl">
    <p className="home-eyebrow text-brand"><span />Informasi situs</p>
    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Syarat & Ketentuan</h1>
    <div className="space-y-7 text-sm leading-8 text-steel-grey">
      <p>Informasi produk dan layanan pada situs Mahameru Baja membantu Anda menyiapkan kebutuhan material atau pekerjaan. Harga, stok, spesifikasi akhir, cakupan pengiriman, dan jadwal pekerjaan dikonfirmasi dalam penawaran dari tim kami.</p>
      <p>Saat mengirim permintaan, berikan informasi material, ukuran, jumlah, lokasi, dan gambar kerja yang sesuai agar tim dapat meninjau kebutuhan dengan tepat. Pengiriman formulir belum berarti pesanan atau pekerjaan disetujui.</p>
      <p>Lokasi yang ditampilkan pada peta Google Maps mengikuti <a className="text-brand underline" href="https://www.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer">Persyaratan Layanan Google Maps</a>. Rating dan kutipan ulasan, apabila ditampilkan, merujuk ke profil publik toko dan penulis di Google Maps.</p>
      <p>Jika ada pertanyaan mengenai informasi di situs atau permintaan penawaran, hubungi tim melalui halaman kontak.</p>
    </div>
    <Link href="/kontak" className="home-button home-button-dark mt-10">Hubungi kami →</Link>
  </div></section>;
}
