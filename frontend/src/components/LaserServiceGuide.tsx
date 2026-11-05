"use client";
import Link from "next/link";
import PublicText, { PublicSection, sectionListAttributes, useSectionList } from "./PublicText";
import type { Article } from "../data/articles";
const processes = [
  {title:"Potong",label:"Laser cutting",service:"Laser Cutting",text:"Pola, panel, ornamen, dan komponen plat.",path:"M5 5h14v14H5z M9 9l6 6m0-6-6 6"},
  {title:"Tekuk",label:"Bending plat",service:"Bending",text:"Tekukan sesuai arah, sudut, dan ukuran.",path:"M4 5v14h16 M9 5v9h11"},
  {title:"Rakit",label:"Fabrikasi",service:"Fabrikasi",text:"Perakitan, pengelasan, dan finishing.",path:"M4 8h6v6H4z M14 10h6v6h-6z M10 11h4 M7 14v5h10v-3"},
];
export default function LaserServiceGuide({ articles }: { articles: Article[] }) {
  const choices=useSectionList("serviceGuideChoices",processes.map(item=>({id:item.title,title:item.title,label:item.label,service:item.service,text:item.text,action:`Bahas ${item.label.toLowerCase()}`})),"guide","services");
  return <PublicText><PublicSection section="guide" page="services"><section className="home-section laser-service-guide service-guide-compact" aria-labelledby="laser-guide-heading"><div className="home-shell">
    <h2 id="laser-guide-heading">Butuh potong, tekuk, atau rakit?</h2><p>Jasa cutting laser Tambun & Bekasi, sesuai gambar kerja Anda.</p>
    <nav {...sectionListAttributes("serviceGuideChoices",choices)} className="service-process-options" aria-label="Pilih proses pengerjaan">{choices.map((item,index)=>{const icon=processes.find(value=>value.service===item.service)||processes[index%processes.length];return <Link href="#request" data-service-choice={String(item.service||item.label)} key={String(item.id)}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={icon.path}/></svg><strong>{String(item.title||"")}<small>{String(item.label||"")}</small></strong><p>{String(item.text||"")}</p><span>{String(item.action||`Bahas ${String(item.label||"").toLowerCase()}`)}</span></Link>;})}</nav>
    <div className="service-flow-heading"><div><h3>Siapkan penawaran dalam 4 tahap.</h3><p>Layanan → gambar & detail → kontak → cek dan kirim.</p></div><Link href="#request" className="home-button home-button-primary">Mulai isi kebutuhan</Link></div>
    {articles.length>0&&<nav className="service-reading-links" aria-label="Panduan menyiapkan desain">{articles.map(article=><Link href={`/informasi/${article.slug}`} key={article.id}>{article.title}<span aria-hidden="true">↗</span></Link>)}</nav>}
  </div></section></PublicSection></PublicText>;
}
