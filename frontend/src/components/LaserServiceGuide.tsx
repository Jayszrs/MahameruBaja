import Link from "next/link";
import type { Article } from "../data/articles";

export default function LaserServiceGuide({ articles }: { articles: Article[] }) {
  return <section className="home-section laser-service-guide" aria-labelledby="laser-guide-heading">
    <div className="home-shell">
      <h2 id="laser-guide-heading">Jasa Cutting Laser Tambun &amp; Bekasi untuk plat sesuai gambar kerja</h2>
      <p>Jasa cutting laser adalah pemotongan plat dengan mesin laser CNC mengikuti pola gambar kerja. MBI Laser Cutting &amp; Bending melayani jasa cutting laser Bekasi, Tambun, dan sekitarnya, mulai dari ornamen pagar dan panel hingga komponen custom. Jenis bahan, ketebalan, ukuran, serta jumlah diperiksa bersama gambar sebelum pekerjaan disepakati.</p>
      <div className="local-business-columns">
        <div>
          <h3>Potong, tekuk, atau rakit?</h3>
          <dl>
            <dt>Laser cutting</dt><dd>Untuk memotong bentuk atau pola pada plat mengikuti gambar kerja, seperti panel, ornamen, dan bagian komponen.</dd>
            <dt>Bending plat</dt><dd>Untuk membuat tekukan. Sertakan arah, sudut tekuk, dan dimensi hasil akhir agar tim bisa memeriksa kebutuhan pembentukan.</dd>
            <dt>Fabrikasi</dt><dd>Untuk kebutuhan perakitan atau pengelasan setelah bagian dibuat. Sampaikan sambungan dan finishing yang dibutuhkan saat konsultasi.</dd>
          </dl>
        </div>
        <div>
          <h3>Sebelum mengirim desain</h3>
          <ul><li>Cantumkan satuan ukuran dan dimensi akhir pada gambar.</li><li>Tulis jumlah setiap desain atau komponen, bukan hanya total lembar plat.</li><li>Jelaskan apakah material disediakan sendiri atau perlu dibantu pengadaannya.</li><li>Sertakan detail tekukan, finishing, lokasi tujuan, dan target waktu.</li></ul>
          <p>Gambar DWG atau DXF membantu peninjauan bentuk. PDF dan foto dapat dikirim untuk konsultasi awal. Tim memastikan kelayakan file, toleransi, harga, dan jadwal sebelum produksi.</p>
          <Link className="local-business-action" href="#request">Kirim gambar untuk penawaran cutting laser</Link>
        </div>
      </div>
      {articles.length > 0 && <nav className="laser-guide-reading" aria-label="Panduan laser cutting"><h3>Panduan untuk menyiapkan pesanan</h3><ul>{articles.map(article => <li key={article.id}><Link href={`/informasi/${article.slug}`}>{article.title}</Link></li>)}</ul></nav>}
    </div>
  </section>;
}
