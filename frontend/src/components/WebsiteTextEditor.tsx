"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { SiteContent } from "../data/siteContent";
import { textPages, normalizeWebsiteText, type TextPage } from "../data/websiteTexts";
import catalog from "../data/websiteTextCatalog.json";
import { contentId } from "../data/socialMedia";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import { useAdminWorkspace } from "./AdminWorkspace";
import { contentOwner } from "../data/divisionCms";

const areaNames: Record<string,string> = { Navbar:"Menu atas", Footer:"Bagian bawah website", UnifiedHomeContent:"Beranda", HomePage:"Pilihan divisi", AboutMergedPage:"Tentang kami", DivisionSubPage:"Halaman divisi", ServicesPage:"Layanan", LaserCuttingPage:"Jasa laser cutting", ProductsPage:"Katalog produk", ProductDetailPage:"Detail produk", ProjectsPage:"Galeri", KontakPage:"Kontak", QuotationPage:"Permintaan penawaran", SocialHub:"Sosial media", SocialProof:"Ulasan & pemasok", ProjectAlbums:"Album proyek", Promotions:"Banner", HeroCarousel:"Hero", InformasiPage:"Artikel", SearchPage:"Pencarian" };
export default function WebsiteTextEditor({ initialContent }: { initialContent: SiteContent }) {
  const actor = useAdminIdentity(); const { divisions } = useDivisionDirectory();
  const [content,setContent] = useState(initialContent); const base = useRef(initialContent);
  const [site,setSite] = useState(actor.division || "main"); const [page,setPage] = useState<TextPage>("all");
  const [query,setQuery] = useState(""); const [area,setArea] = useState("all");
  const [source,setSource] = useState(""); const [replacement,setReplacement] = useState("");
  const [dirty,setDirty] = useState(false); const [busy,setBusy] = useState(false); const [message,setMessage] = useState(""); const [failed,setFailed] = useState(false);
  const owner = site === "main" ? null : site;
  const rows = content.websiteTexts.filter(row => contentOwner(row) === owner && row.page === page);
  const choices = catalog.filter(row => (area === "all" || row.area === area) && row.source.toLowerCase().includes(query.toLowerCase()));
  function update(next: SiteContent) { setContent(next); setDirty(true); setMessage(""); }
  function add() {
    if (!source.trim() || !replacement.trim()) return;
    const existing = rows.find(row => normalizeWebsiteText(row.source) === normalizeWebsiteText(source));
    const row = { id: existing?.id || contentId(), ownerDivision: owner, page, source: normalizeWebsiteText(source), replacement: replacement.trim(), published: true };
    update({ ...content, websiteTexts: existing ? content.websiteTexts.map(item => item.id === row.id ? row : item) : [...content.websiteTexts,row] });
    setSource(""); setReplacement("");
  }
  async function save() {
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...content,_base:base.current}) });
      const next = await response.json(); if (!response.ok) throw new Error(next.message || "Teks belum tersimpan. Coba lagi.");
      setContent(next); base.current = next; setDirty(false); workspace.refreshDashboard(); setMessage("Teks tersimpan. Buka website untuk melihat hasilnya.");
    } catch(error) { setFailed(true); setMessage((error as Error).message); } finally { setBusy(false); }
  }
  const workspace = useAdminWorkspace({dirty:dirty || Boolean(source || replacement),busy,label:"Simpan teks website",disabled:!dirty,onSave:save});
  return <div className="admin-management"><header className="admin-page-heading"><div><p className="industrial-eyebrow">KONTEN PUBLIK</p><h1>Teks website</h1><p>Pilih website dan halaman, cari tulisan yang ingin diubah, lalu isi tulisan penggantinya. Alamat tautan dan fungsi tombol tidak berubah.</p></div><Link className="admin-secondary" href={owner ? `/unit/${owner}` : "/"} target="_blank">Lihat website</Link></header>
    <div className="editor-notice">Gambar dan judul hero ada di <Link href="/admin/hero">Hero beranda</Link>. Nama, profil, serta daftar layanan ada di <Link href="/admin/divisi">Profil divisi</Link>. Poster masuk ada di <Link href="/admin/promosi">Banner & poster</Link>. Isi artikel, produk, dan kontak tetap menggunakan menu masing-masing.</div>
    {message && <p role={failed?"alert":"status"} className={`editor-notice ${failed?"error":"success"}`}>{message}</p>}
    <fieldset disabled={busy}><div className="text-editor-controls"><label className="editor-field">Website<select value={site} disabled={Boolean(actor.division)} onChange={event=>setSite(event.target.value)}>{!actor.division && <option value="main">Website utama</option>}{divisions.map(division=><option key={division.slug} value={division.slug}>{division.name}</option>)}</select></label><label className="editor-field">Halaman<select value={page} onChange={event=>setPage(event.target.value as TextPage)}>{Object.entries(textPages).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
    <section className="editor-panel"><h2>Ganti tulisan</h2><div className="text-editor-controls"><label className="editor-field">Cari tulisan<input type="search" value={query} placeholder="Misalnya: layanan, pengiriman, hubungi" onChange={event=>setQuery(event.target.value)} /></label><label className="editor-field">Bagian website<select value={area} onChange={event=>setArea(event.target.value)}><option value="all">Semua bagian</option>{[...new Set(catalog.map(row=>row.area))].map(key=><option key={key} value={key}>{areaNames[key] || key.replace(/Page$|Section$/g,"")}</option>)}</select></label></div>
    <label className="editor-field">Pilih tulisan di website<select value={source} onChange={event=>{setSource(event.target.value);setReplacement(rows.find(row=>row.source===event.target.value)?.replacement || event.target.value);}}><option value="">Pilih tulisan yang ingin diubah</option>{source && !choices.some(row=>row.source===source) && <option value={source}>{source.slice(0,100)}</option>}{choices.map(row=><option key={row.source} value={row.source}>{row.source.slice(0,150)}</option>)}</select><small>{choices.length} tulisan ditemukan. Untuk tulisan khusus yang tidak ada di daftar, salin dari website ke kolom berikut.</small></label>
    <label className="editor-field">Tulisan asli<textarea value={source} rows={2} maxLength={5000} onChange={event=>setSource(event.target.value)} /></label><label className="editor-field">Tulisan baru<textarea value={replacement} rows={4} maxLength={5000} onChange={event=>setReplacement(event.target.value)} placeholder="Tulis dengan bahasa yang mudah dipahami pelanggan." /></label><button type="button" className="admin-primary" disabled={!source.trim() || !replacement.trim() || content.websiteTexts.length>=500} onClick={add}>Terapkan ke daftar perubahan</button><p className="admin-field-help">Setelah ditambahkan, klik Simpan teks website. Menghapus penggantian di bawah akan mengembalikan tulisan bawaan.</p></section>
    <h2>Penggantian tulisan <small>({rows.length})</small></h2>{!rows.length && <p className="admin-inline-empty">Belum ada tulisan yang diganti untuk pilihan website dan halaman ini.</p>}{rows.map(row=><section key={row.id} className="text-editor-card"><small>Tulisan bawaan</small><p className="text-editor-original">{row.source}</p><label className="editor-field">Ditampilkan di website<textarea rows={3} value={row.replacement} onChange={event=>update({...content,websiteTexts:content.websiteTexts.map(item=>item.id===row.id?{...item,replacement:event.target.value}:item)})}/></label><button type="button" className="admin-secondary" onClick={()=>update({...content,websiteTexts:content.websiteTexts.filter(item=>item.id!==row.id)})}>Kembalikan tulisan bawaan</button></section>)}
    <div className="admin-form-actions"><button type="button" className="admin-primary" disabled={!dirty} onClick={()=>void save()}>{busy?"Menyimpan…":"Simpan teks website"}</button></div></fieldset></div>;
}
