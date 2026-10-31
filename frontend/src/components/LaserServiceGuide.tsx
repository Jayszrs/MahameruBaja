"use client";
import { useSectionList, sectionListAttributes } from "./PublicText";
import { PublicSection } from "./PublicText";
import { Fragment } from "react";
import Link from "next/link";
import type { Article } from "../data/articles";

export default function LaserServiceGuide({ articles }: { articles: Article[] }) {
  const definitions=useSectionList("guideDefinitions",[{term:"Laser cutting",description:"Untuk memotong bentuk atau pola pada plat mengikuti gambar kerja, seperti panel, ornamen, dan bagian komponen."},{term:"Bending plat",description:"Untuk membuat tekukan. Sertakan arah, sudut tekuk, dan dimensi hasil akhir agar tim bisa memeriksa kebutuhan pembentukan."},{term:"Fabrikasi",description:"Untuk kebutuhan perakitan atau pengelasan setelah bagian dibuat. Sampaikan sambungan dan finishing yang dibutuhkan saat konsultasi."}],"guide");
  const checklist=useSectionList("guideChecklist",[{text:"Cantumkan satuan ukuran dan dimensi akhir pada gambar."},{text:"Tulis jumlah setiap desain atau komponen, bukan hanya total lembar plat."},{text:"Jelaskan apakah material disediakan sendiri atau perlu dibantu pengadaannya."},{text:"Sertakan detail tekukan, finishing, lokasi tujuan, dan target waktu."}],"guide");
  return <PublicSection section="guide"><section className="home-section laser-service-guide" aria-labelledby="laser-guide-heading">
    <div className="home-shell">
      <h2 id="laser-guide-heading">Jasa Cutting Laser Tambun &amp; Bekasi untuk plat sesuai gambar kerja</h2>
      <p>Jasa cutting laser adalah pemotongan plat dengan mesin laser CNC mengikuti pola gambar kerja. MBI Laser Cutting &amp; Bending melayani jasa cutting laser Bekasi, Tambun, dan sekitarnya, mulai dari ornamen pagar dan panel hingga komponen custom. Jenis bahan, ketebalan, ukuran, serta jumlah diperiksa bersama gambar sebelum pekerjaan disepakati.</p>
      <div className="local-business-columns">
        <div>
          <h3 data-cms-static>Potong, tekuk, atau rakit?</h3>
          <dl {...sectionListAttributes("guideDefinitions",definitions)}>{definitions.map(row=><Fragment key={row.term}><dt>{row.term}</dt><dd>{row.description}</dd></Fragment>)}</dl>
        </div>
        <div>
          <h3 data-cms-static>Sebelum mengirim desain</h3>
          <ul {...sectionListAttributes("guideChecklist",checklist)}>{checklist.map(row=><li key={row.text}>{row.text}</li>)}</ul>
          <p>Gambar DWG atau DXF membantu peninjauan bentuk. PDF dan foto dapat dikirim untuk konsultasi awal. Tim memastikan kelayakan file, toleransi, harga, dan jadwal sebelum produksi.</p>
          <Link className="local-business-action" href="#request" data-cms-static>Kirim gambar untuk penawaran cutting laser</Link>
        </div>
      </div>
      {articles.length > 0 && <nav className="laser-guide-reading" aria-label="Panduan laser cutting" data-cms-static><h3>Panduan untuk menyiapkan pesanan</h3><ul>{articles.map(article => <li key={article.id}><Link href={`/informasi/${article.slug}`}>{article.title}</Link></li>)}</ul></nav>}
    </div>
  </section></PublicSection>;
}
