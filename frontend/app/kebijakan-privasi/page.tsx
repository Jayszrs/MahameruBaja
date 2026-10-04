import Link from "next/link";

export const metadata = { title: "Kebijakan Privasi" };

export default function PrivacyPage() {
  return <section className="home-section bg-white"><div className="home-shell max-w-4xl">
    <p className="home-eyebrow text-brand"><span />Informasi situs</p>
    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">Kebijakan Privasi</h1>
    <div className="space-y-7 text-sm leading-8 text-steel-grey">
      <p>Mahameru Baja menggunakan informasi yang Anda isi pada formulir penawaran dan permintaan laser cutting, seperti nama, nomor WhatsApp, detail material, dan informasi proyek, untuk mencatat dan menindaklanjuti permintaan Anda. Kolom perusahaan dan email bersifat opsional jika ditampilkan demikian pada formulir.</p>
      <p>Formulir kontak menyiapkan ringkasan pesan untuk dikirim melalui WhatsApp. Pesan baru diterima tim setelah Anda melanjutkan pengirimannya di WhatsApp. Penggunaan WhatsApp mengikuti kebijakan layanan tersebut.</p>
      <p>Situs ini menyediakan tautan dan peta lokasi dari Google Maps. Saat Anda membuka peta, Google dapat memproses data penggunaan sesuai <a className="text-brand underline" href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Kebijakan Privasi Google</a>. Jika kutipan ulasan ditampilkan di situs, nama dan isi ulasan berasal dari profil publik penulis di Google Maps.</p>
      <p>Untuk pertanyaan mengenai data yang Anda kirimkan kepada Mahameru Baja, hubungi kami melalui <a className="text-brand underline" href="https://wa.me/6281218052017" target="_blank" rel="noopener noreferrer">WhatsApp utama</a>.</p>
    </div>
    <Link href="/kontak" className="home-button home-button-dark mt-10">Hubungi kami →</Link>
  </div></section>;
}
