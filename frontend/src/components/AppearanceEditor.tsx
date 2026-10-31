"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import { useAdminView, useAdminWorkspace } from "./AdminWorkspace";
import AdminDialog from "./AdminDialog";
import { homeSections,serviceSections } from "../data/pageVisibility";
import { contentOwner } from "../data/divisionCms";
import type { SiteContent } from "../data/siteContent";
import { defaultAppearance, websiteAppearanceSchema, type AppearanceItem, type AppearanceList, type WebsiteAppearance } from "../data/websiteAppearance";
import { uploadCmsFile } from "../lib/cmsUpload";

const lists: { key: AppearanceList; label: string; help: string }[] = [
  { key: "orderSteps", label: "Cara pesan", help: "Gambar ilustrasi, judul pendek, dan satu kalimat untuk setiap langkah." },
  { key: "needs", label: "Quick FAQ — Mulai dari kebutuhan Anda", help: "Beranda > 5 layanan kebutuhan baja > Quick FAQ. Tambahkan pertanyaan singkat dengan tautan ke halaman atau bagian yang menjawabnya." },
  { key: "quotes", label: "Quote / kata mutiara", help: "Quote terpisah dari ulasan pelanggan Google. Kolom keterangan dapat berisi nama penulis atau sumber." },
  { key: "services", label: "Detail jasa laser cutting, bending, dan fabrikasi", help: "Gambar dan teks pada halaman Jasa. Untuk /jasa utama, pilih Website utama." },
  { key: "memberships", label: "Keanggotaan di header", help: "Gunakan nama dan logo keanggotaan yang benar. Label ini bukan lisensi atau sertifikasi." },
  { key:"servicePaths",label:"Apa yang bisa kami bantu?",help:"Jasa > pilihan kebutuhan. Ubah ilustrasi, judul, keterangan, dan tombol setiap pilihan." },
  { key:"serviceWorkflow",label:"Alur pekerjaan dari gambar yang Anda kirim",help:"Jasa > setelah album. Tambah, susun, atau hapus langkah proses beserta ilustrasinya." },
];
export default function AppearanceEditor({ initialContent, servicePage = false }: { initialContent: SiteContent; servicePage?: boolean }) {
  const actor = useAdminIdentity(); const { divisions } = useDivisionDirectory();
  const [content, setContent] = useState(initialContent); const base = useRef(initialContent);
  const [owner, setOwner] = useState(servicePage ? "" : actor.division || "");
  const [tab, setTab] = useAdminView("section", ["identity","about","layout","backgrounds",...lists.map(list=>list.key)] as const, servicePage ? "servicePaths" : "orderSteps");
  const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""); const [failed, setFailed] = useState(false);
  const [remove, setRemove] = useState<{ key: AppearanceList; id: string } | null>(null);
  function defaults() {
    const value = defaultAppearance(owner || null); const division = divisions.find(d => d.slug === owner);
    if (division) value.services = division.offerings.map((title, index) => ({ id: `service-${index}`, title, text: division.offeringDescriptions[title] || "", image: division.images[index % division.images.length]?.src || division.hero, alt: title, href: `/unit/${owner}/kontak` }));
    return value;
  }
  const sectionLabel = tab === "identity" ? "Logo & foto footer" : tab === "about" ? "Hero / gambar pembuka" : tab === "layout" ? "Tampilkan / sembunyikan bagian" : tab === "backgrounds" ? (servicePage ? "Hero Jasa" : "Foto latar beranda") : lists.find(list=>list.key===tab)?.label || "Tampilan";
  const pageLabel = tab === "identity" ? "Header & Footer" : tab === "about" ? "Tentang Kami" : servicePage ? "Jasa" : tab === "memberships" ? "Header" : "Beranda";
  const row = content.websiteAppearance.find(value => contentOwner(value) === (owner || null)) || defaults();
  function update(patch: Partial<WebsiteAppearance>) {
    setContent(current => {
      const existing = current.websiteAppearance.find(value => contentOwner(value) === (owner || null));
      const next = { ...(existing || defaults()), ...patch };
      return { ...current, websiteAppearance: existing ? current.websiteAppearance.map(value => value.id === existing.id ? next : value) : [...current.websiteAppearance, next] };
    }); setDirty(true); setMessage("");
  }
  function item(key: AppearanceList, id: string, patch: Partial<AppearanceItem>) { update({ [key]: row[key].map(value => value.id === id ? { ...value, ...patch } : value) }); }
  async function upload(file: File, apply: (url: string) => void) {
    if (busy) return; setBusy(true); setMessage(""); setFailed(false);
    try { apply(await uploadCmsFile(file, "image", owner || null)); setMessage("Gambar diunggah. Simpan perubahan untuk menayangkannya."); }
    catch (error) { setFailed(true); setMessage((error as Error).message); } finally { setBusy(false); }
  }
  async function save() {
    if (busy) return;
    for (const value of content.websiteAppearance) {
      const result = websiteAppearanceSchema.safeParse(value);
      if (!result.success) { setFailed(true); setMessage(result.error.issues[0].message); return; }
    }
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base.current }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Perubahan belum tersimpan.");
      setContent(data); base.current = data; setDirty(false); workspace.refreshDashboard(); setMessage("Tampilan website tersimpan.");
    } catch (error) { setFailed(true); setMessage((error as Error).message); } finally { setBusy(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: `Simpan ${pageLabel} — ${sectionLabel}`, disabled: !dirty, onSave: save });
  const mediaField = (label: string, value: string, change: (value: string) => void) => <div className="admin-media-row">{value ? <img src={value} alt={`Pratinjau ${label}`} /> : <div className="admin-image-placeholder">Belum ada gambar</div>}<div><label className="editor-field">{label}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void upload(file, change); }} /></label><label className="editor-field">Alamat gambar<input value={value} onChange={event => change(event.target.value)} /></label>{value && <button type="button" className="admin-secondary" onClick={() => change("")}>Hapus gambar</button>}</div></div>;
  return <div className="content-editor"><main className="editor-main"><header className="editor-topbar"><h1>{pageLabel} › {sectionLabel}</h1><button type="button" className="editor-save" disabled={busy || !dirty} onClick={save}>{busy ? "Memproses…" : "Simpan bagian ini"}</button></header><div className="editor-content">
    <div className="editor-panel"><label className="editor-field">Website yang diedit<select disabled={busy || servicePage || Boolean(actor.division)} value={owner} onChange={event => setOwner(event.target.value)}><option value="">Website utama</option>{divisions.map(division => <option value={division.slug} key={division.slug}>{division.name}</option>)}</select></label><p>Setiap website memiliki pengaturan sendiri. JPG, PNG, atau WebP, maksimal 4 MB.</p><div className="appearance-admin-links"><Link href={servicePage ? "/jasa" : owner ? `/unit/${owner}` : "/"} target="_blank" rel="noreferrer">Buka website ↗</Link><Link href="/admin/divisi">Foto kartu 5 divisi ↗</Link><Link href="/admin/promosi?view=popup">Poster desktop & mobile ↗</Link><Link href="/admin/galeri">Album desain & portofolio ↗</Link></div></div>
    {message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}</p>}
    <nav className="appearance-admin-tabs" aria-label="Bagian website"><button type="button" disabled={busy} aria-pressed={tab === "layout"} onClick={()=>setTab("layout")}>Tampilkan / sembunyikan bagian</button><button type="button" disabled={busy} aria-pressed={tab === "backgrounds"} onClick={() => setTab("backgrounds")}>{servicePage ? "Hero / gambar pembuka Jasa" : "Foto latar beranda"}</button>{lists.filter(list => servicePage ? ["servicePaths","services","serviceWorkflow"].includes(list.key) : !["servicePaths","services","serviceWorkflow"].includes(list.key)).map(list => <button type="button" disabled={busy} aria-pressed={tab === list.key} key={list.key} onClick={() => setTab(list.key)}>{list.label} ({row[list.key].length})</button>)}</nav>
    <fieldset disabled={busy}>
      {tab === "identity" ? <section className="editor-panel"><h2>Header & Footer</h2>{mediaField("Header > Logo perusahaan > unggah logo",row.brandLogo,brandLogo=>update({brandLogo}))}{mediaField("Footer > Foto latar > unggah gambar",row.footerImage,footerImage=>update({footerImage}))}<p>Untuk nama, alamat, logo, dan kontak tiap divisi di footer, buka Profil divisi dan Kontak sales.</p></section> : tab === "about" ? <section className="editor-panel"><h2>Tentang Kami › Hero / gambar pembuka</h2>{mediaField("Tentang Kami > Hero > unggah gambar",row.aboutHeroImage,aboutHeroImage=>update({aboutHeroImage}))}</section> : tab === "layout" ? <section className="editor-panel"><h2>{pageLabel} ? tampilkan / sembunyikan bagian</h2><p>Urutan mengikuti halaman dari atas ke bawah. Hilangkan centang untuk menyembunyikan seluruh bagian tanpa menghapus kontennya. Simpan agar berlaku di website.</p>{(servicePage ? serviceSections : homeSections).map(section=>{const key=servicePage ? "hiddenServiceSections" : "hiddenHomeSections";return <label className="editor-checkbox cms-section-visibility" key={section.id}><input type="checkbox" checked={!row[key].includes(section.id)} onChange={event=>update({[key]:event.target.checked ? row[key].filter(id=>id!==section.id) : [...row[key],section.id]})}/>{section.label}</label>;})}</section> : tab === "backgrounds" ? <section className="editor-panel"><h2>{pageLabel} › {sectionLabel}</h2><p>Unggah foto untuk bagian yang disebutkan pada label. Hapus gambar untuk menggunakan gambar bawaan.</p>{servicePage ? mediaField("Jasa > Hero > unggah gambar pembuka", row.serviceHeroImage, serviceHeroImage=>update({serviceHeroImage})) : <>{mediaField("Beranda > Laser cutting > unggah foto latar", row.featureImage, featureImage=>update({featureImage}))}{mediaField("Beranda > Siap diskusikan kebutuhan > unggah foto latar",row.calloutImage,calloutImage=>update({calloutImage}))}</>}</section> : <>
        <div className="editor-panel"><h2>{lists.find(list => list.key === tab)?.label}</h2><p>{lists.find(list => list.key === tab)?.help}</p><button type="button" className="admin-primary" disabled={row[tab].length >= ({ orderSteps: 8, needs: 12, quotes: 36, services: 12, memberships: 6, servicePaths:16, serviceWorkflow:12 }[tab])} onClick={() => update({ [tab]: [...row[tab], { id: crypto.randomUUID(), title: "Konten baru", text: "", image: "", alt: "", href: "" }] })}>+ Tambah {lists.find(list => list.key === tab)?.label.toLowerCase()}</button></div>
        {row[tab].map((value, index) => <section className="editor-panel" key={value.id}><div className="editor-panel-title"><h3>{index + 1}. {value.title}</h3><div><button type="button" disabled={index === 0} aria-label={`Naikkan ${value.title}`} onClick={() => { const next = [...row[tab]]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update({ [tab]: next }); }}>↑</button><button type="button" disabled={index === row[tab].length - 1} aria-label={`Turunkan ${value.title}`} onClick={() => { const next = [...row[tab]]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; update({ [tab]: next }); }}>↓</button><button type="button" className="admin-danger" onClick={() => setRemove({ key: tab, id: value.id })}>Hapus</button></div></div><label className="editor-field">{tab === "quotes" ? "Quote" : "Judul / pertanyaan"}<input maxLength={160} value={value.title} onChange={event => item(tab, value.id, { title: event.target.value })} /></label><label className="editor-field">{tab === "quotes" ? "Penulis / sumber" : "Keterangan singkat"}<textarea maxLength={500} value={value.text} onChange={event => item(tab, value.id, { text: event.target.value })} /></label>{mediaField(`${pageLabel} > ${sectionLabel} > ${value.title} — unggah gambar`, value.image, image => item(tab, value.id, { image }))}<label className="editor-field">Deskripsi gambar<input maxLength={200} value={value.alt} onChange={event => item(tab, value.id, { alt: event.target.value })} /></label>{["orderSteps","servicePaths","services"].includes(tab) && <label className="editor-field">Tulisan tombol (opsional)<input maxLength={80} value={value.ctaLabel || ""} onChange={event=>item(tab,value.id,{ctaLabel:event.target.value})}/></label>}{!["memberships","serviceWorkflow"].includes(tab) && <label className="editor-field">Tautan tujuan<input placeholder="/jasa#request" value={value.href} onChange={event => item(tab, value.id, { href: event.target.value })} /><small>Untuk tombol kebutuhan, isi halaman atau bagian yang menjawab pertanyaannya.</small></label>}{value.href.startsWith("/") && <Link href={value.href} target="_blank" rel="noreferrer">Periksa tujuan ↗</Link>}</section>)}
      </>}
    </fieldset>
    {remove && <AdminDialog title="Hapus konten ini?" onClose={() => setRemove(null)}><p>Perubahan berlaku setelah Anda menyimpan tampilan.</p><button type="button" className="admin-danger" onClick={() => { update({ [remove.key]: row[remove.key].filter(value => value.id !== remove.id) }); setRemove(null); }}>Hapus</button><button type="button" className="admin-secondary" onClick={() => setRemove(null)}>Batal</button></AdminDialog>}
  </div></main></div>;
}
