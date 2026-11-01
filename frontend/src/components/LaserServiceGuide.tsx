import Link from "next/link";
import PublicText from "./PublicText";
import type { Article } from "../data/articles";
const processes = [
  {title:"Potong",label:"Laser cutting",service:"Laser Cutting",text:"Pola, panel, ornamen, dan komponen plat.",path:"M5 5h14v14H5z M9 9l6 6m0-6-6 6"},
  {title:"Tekuk",label:"Bending plat",service:"Bending",text:"Tekukan sesuai arah, sudut, dan ukuran.",path:"M4 5v14h16 M9 5v9h11"},
  {title:"Rakit",label:"Fabrikasi",service:"Fabrikasi",text:"Perakitan, pengelasan, dan finishing.",path:"M4 8h6v6H4z M14 10h6v6h-6z M10 11h4 M7 14v5h10v-3"},
];
const steps = [
  {title:"Pilih proses",text:"Potong, tekuk, atau rakit."},
  {title:"Kirim gambar",text:"DWG / DXF, PDF, atau foto."},
  {title:"Lengkapi detail",text:"Ukuran, bahan, jumlah, dan target waktu."},
  {title:"Cek penawaran",text:"Tim konfirmasi harga dan jadwal."},
];
export default function LaserServiceGuide({ articles }: { articles: Article[] }) {
  return <PublicText><section className="home-section laser-service-guide service-guide-compact" aria-labelledby="laser-guide-heading"><div className="home-shell">
    <h2 id="laser-guide-heading">Butuh potong, tekuk, atau rakit?</h2><p>Jasa cutting laser Tambun & Bekasi, sesuai gambar kerja Anda.</p>
    <nav className="service-process-options" aria-label="Pilih proses pengerjaan">{processes.map(item=><Link href="#request" data-service-choice={item.service} key={item.title}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={item.path}/></svg><strong>{item.title}<small>{item.label}</small></strong><p>{item.text}</p><span>Bahas {item.label.toLowerCase()}</span></Link>)}</nav>
    <div className="service-flow-heading"><h3>Empat langkah, langsung dipahami.</h3><Link href="#request" className="home-button home-button-primary">Mulai konsultasi</Link></div>
    <ol className="service-order-flow">{steps.map((step,index)=><li key={step.title}><span aria-hidden="true">{index+1}</span><div><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol>
    <p className="service-flow-note">Cantumkan satuan ukuran dan jumlah tiap komponen. Harga, toleransi, dan jadwal dikonfirmasi sebelum produksi.</p>
    {articles.length>0&&<nav className="service-reading-links" aria-label="Panduan menyiapkan desain">{articles.map(article=><Link href={`/informasi/${article.slug}`} key={article.id}>{article.title}<span aria-hidden="true">↗</span></Link>)}</nav>}
  </div></section></PublicText>;
}
