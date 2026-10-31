"use client";
import SectionListsEditor, { readSectionLists, type ListSnapshot } from "./SectionListsEditor";
import { sectionListFields, sectionListSchema } from "../data/sectionLists";
import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "../data/siteContent";
import { sectionEditSchema, type SectionEdit } from "../data/sectionEdits";
import { serviceWording } from "../data/serviceWording";
import { normalizeWebsiteText, type TextPage } from "../data/websiteTexts";
import { useAdminWorkspace } from "./AdminWorkspace";
import { useAdminIdentity } from "./AdminIdentity";
import { uploadCmsFile } from "../lib/cmsUpload";

type Field = Pick<SectionEdit, "kind" | "source" | "label"> & {binding?:"companyVision"|"companyMission"|"companyMotto"};
function originalImage(value: string) {
  try { const url = new URL(value, window.location.origin); return url.pathname === "/_next/image" ? url.searchParams.get("url") || value : url.origin === window.location.origin ? url.pathname + url.search : value; }
  catch { return value; }
}
export function readSectionFields(document: Document, section: string): Field[] {
  const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-cms-section]")).filter(root => root.dataset.cmsSection === section);
  if (!roots.length) throw new Error("Bagian ini belum tersedia pada halaman publik. Muat ulang atau periksa pengaturan terbit kontennya.");
  const fields = new Map<string, Field>();
  const add = (kind: Field["kind"], source: string | null, label: string) => { if (!source?.trim()) return; const listValues=roots.flatMap(root=>Array.from(root.querySelectorAll<HTMLElement>("[data-cms-list-rows]")).concat(root.matches("[data-cms-list-rows]")?[root]:[])).flatMap(node=>{try{return JSON.parse(node.dataset.cmsListRows||"[]").flatMap((row:Record<string,unknown>)=>Object.values(row).filter(value=>typeof value==="string"));}catch{return [];}});
    if(listValues.some(value=>normalizeWebsiteText(serviceWording(String(value)))===normalizeWebsiteText(source)))return;
    const value = kind === "text" ? normalizeWebsiteText(source) : source; const key = `${kind}:${value}`; if (!fields.has(key)) fields.set(key, { kind, source: value, label: label.slice(0, 200) }); };
  for (const root of roots) {
    const owns = (element: Element) => element.closest("[data-cms-section]") === root;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode, parent = node.parentElement;
      if (!parent || parent.closest("[data-cms-field],[data-cms-owned],[data-cms-static]") || !owns(parent) || parent.closest("script,style,svg,noscript,code,pre,textarea,option") || !/[\p{L}\p{N}]/u.test(node.textContent || "")) continue;
      if(/^\d+[.,%\s]*$/.test((node.textContent||"").trim()))continue;
      const previous=parent.previousElementSibling;
      const label = parent.closest("h1,h2") ? (parent.closest("em,strong,i,b") ? "Subjudul heading" : "Heading section") : parent.closest("h3,h4,h5,h6") ? "Subjudul" : parent.closest("a,button") ? "Teks tombol / tautan" : parent.matches(".home-eyebrow,.industrial-eyebrow") ? "Teks pengantar" : previous?.matches("h1,h2,h3,h4,h5,h6") ? "Paragraf" : "Tulisan";
      add("text", node.textContent, label);
    }
    root.querySelectorAll<HTMLElement>("img,svg[data-logo-source],a[href],iframe[src],input[placeholder],textarea[placeholder]").forEach(element => {
      if (!owns(element) || element.closest("[data-cms-owned],[data-cms-static]")) return;
      if (element.matches("img")) add("image", originalImage(element.getAttribute("src") || ""), element.getAttribute("alt") || "Gambar section");
      else if (element.matches("svg")) add("image", element.getAttribute("data-logo-source"), "Logo section");
      else if (element.matches("a")) add("link", element.getAttribute("href"), normalizeWebsiteText(element.textContent || "Tujuan tautan"));
      else if (element.matches("iframe")) add("embed", element.getAttribute("src"), element.getAttribute("title") || "Peta");
      else add("text", element.getAttribute("placeholder"), "Petunjuk kolom formulir");
    });
  }
  for(const root of roots)root.querySelectorAll<HTMLElement>("[data-cms-field]").forEach(element=>{
    const binding=element.dataset.cmsField;
    if(binding==="companyVision"||binding==="companyMission"||binding==="companyMotto")fields.set(binding,{kind:"text",source:element.textContent||"",label:binding==="companyVision"?"Visi Mahameru Group (digunakan bersama)":binding==="companyMission"?"Misi & arah layanan Mahameru Group (digunakan bersama)":"Motto Mahameru Group (digunakan bersama)",binding});
  });
  return [...fields.values()];
}

export default function SectionContentEditor({ initialContent, page, section, url }: { initialContent: SiteContent; page: TextPage; section: string; url: string }) {
  const actor = useAdminIdentity();
  const [content, setContent] = useState(initialContent), [base, setBase] = useState(initialContent);
  const [snapshots,setSnapshots]=useState<ListSnapshot[]>([]);
  const [fields, setFields] = useState<Field[]>([]), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(""), [failed, setFailed] = useState(false), [errors, setErrors] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "text" | "image" | "link">("all");
  const records = content.sectionEdits.filter(row => !row.ownerDivision && row.page === page && row.section === section);
  const dirty = JSON.stringify(content.sectionEdits) !== JSON.stringify(base.sectionEdits) || JSON.stringify(content.sectionLists) !== JSON.stringify(base.sectionLists) || content.companyVision!==base.companyVision || content.companyMission!==base.companyMission || content.companyMotto!==base.companyMotto;
  const load = useCallback(async () => {
    setLoading(true); setFailed(false); setMessage("");
    try {
      const target = new URL(url, window.location.origin); target.searchParams.set("cms-source", String(Date.now()));
      const response = await fetch(target, { cache: "no-store" }); if (!response.ok) throw new Error(`Halaman publik belum dapat dibaca (${response.status}).`);
      const document = new DOMParser().parseFromString(await response.text(), "text/html");
      setSnapshots(readSectionLists(document,section));
      setFields(readSectionFields(document, section));
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Tidak dapat membaca section."); }
    finally { setLoading(false); }
  }, [section, url]);
  useEffect(() => { void load(); }, [load]);
  // A saved replacement is displayed by the public page. Keep its original source
  // so editing it again updates the same record rather than adding a second pass.
  const displayed = fields.map(field => { const row = records.find(row => row.kind === field.kind && (row.source === field.source || row.replacement === field.source)); return row ? { ...field, source: row.source, label: row.label || field.label } : field; });
  for (const row of records) if (!displayed.some(field => field.kind === row.kind && field.source === row.source)) displayed.push({ kind: row.kind, source: row.source, label: row.label });
  const unique = displayed.filter((field, index, all) => all.findIndex(other => other.kind === field.kind && other.source === field.source) === index);
  function change(field: Field, replacement: string) {
    if(field.binding){setContent(current=>({...current,[field.binding!]:replacement}));return;}
    const existing = records.find(row => row.kind === field.kind && row.source === field.source);
    const row: SectionEdit = { ...field, id: existing?.id || crypto.randomUUID(), page, section, ownerDivision: null, replacement, published: true };
    setContent(current => ({ ...current, sectionEdits: existing ? current.sectionEdits.map(item => item.id === existing.id ? row : item) : [...current.sectionEdits, row] }));
    setErrors(current => ({ ...current, [`${field.kind}:${field.source}`]: "" })); setMessage("");
  }
  async function save() {
    const nextErrors: Record<string, string> = {};
    for (const row of records) { const parsed = sectionEditSchema.safeParse(row); if (!parsed.success) nextErrors[`${row.kind}:${row.source}`] = parsed.error.issues[0].message; }
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); setFailed(true); setMessage("Periksa kolom yang ditandai merah."); requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()); return; }
    for(const list of content.sectionLists.filter(row=>row.page===page&&row.section===section)) {
      const parsed=sectionListSchema.safeParse(list);
      if(!parsed.success) {for(const issue of parsed.error.issues){const index=issue.path[1],field=issue.path[2];nextErrors[`${list.key}:${index}:${field}`]=issue.message;}setErrors(nextErrors);setFailed(true);setMessage("Periksa kolom item yang ditandai merah.");requestAnimationFrame(()=>document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());return;}
    }
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...content, _base: base }) });
      const next = await response.json(); if (!response.ok) throw new Error(next.message || "Perubahan belum tersimpan.");
      setContent(next); setBase(next); setMessage("Perubahan section tersimpan. Buka pratinjau untuk melihat hasilnya.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Gagal menyimpan."); }
    finally { setBusy(false); }
  }
  useAdminWorkspace({ dirty, busy, label: "Simpan section", disabled: !dirty || loading || Boolean(actor.division), onSave: save });
  return <section className="cms-section-content">
    <p>Kolom berikut dibaca dari bagian yang tampil pada website. Perubahan hanya berlaku pada section ini.</p>
    {actor.division && <p role="status">Konten website utama dikelola Super Admin. Gunakan editor konten divisi untuk mengelola website divisi Anda.</p>}
    <div className="admin-section-modes" aria-label="Jenis isi section">{(["all", "text", "image"] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} disabled={busy} onClick={() => setFilter(value)}>{({ all: "Semua", text: "Tulisan", image: "Gambar" })[value]}</button>)}</div>
    {!loading&&!failed&&!unique.length&&!snapshots.length&&!content.sectionLists.some(row=>row.page===page&&row.section===section)&&<p>Isi bagian ini dikelola melalui tab Kelola konten.</p>}
    {loading && <p role="status">Membaca isi section dari website…</p>}
    {message && <p className={`editor-notice ${failed ? "error" : "success"}`} role={failed ? "alert" : "status"}>{message}{failed && !dirty && <button type="button" onClick={() => void load()}>Muat ulang section</button>}</p>}
    <fieldset disabled={busy || Boolean(actor.division)} className="website-copy-fieldset">
    {(filter==="all"||filter==="image")&&<SectionListsEditor content={content} page={page} section={section} snapshots={snapshots} errors={errors} update={setContent} uploadState={setBusy} report={(message,failed=false)=>{setMessage(message);setFailed(failed);}}/>}
    <div className="cms-section-fields">{unique.filter(field => filter === "all" || field.kind === filter).map((field, index) => {
      const row = records.find(row => row.kind === field.kind && row.source === field.source), value = field.binding ? content[field.binding] : row?.replacement ?? field.source, key = `${field.kind}:${field.source}`;
      return <div className="editor-panel cms-section-field" key={key}><div className="cms-field-heading"><strong>{field.label} {index + 1}</strong>{row && <button type="button" className="admin-secondary" onClick={() => setContent(current => ({ ...current, sectionEdits: current.sectionEdits.filter(item => item.id !== row.id) }))}>Kembalikan bawaan</button>}</div>
        {field.kind === "image" && <>{value && <img className="cms-section-image" src={value} alt={field.label} />}<label className="editor-field">Unggah pengganti<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
          setBusy(true); setFailed(false); setMessage("Mengunggah gambar…");
          try { change(field, await uploadCmsFile(file, "image", null)); setMessage("Gambar selesai diunggah. Simpan section untuk menerapkannya."); }
          catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "Unggahan gagal."); }
          finally { setBusy(false); }
        }} /><small>JPG, PNG, WebP · maksimal 4 MB.</small></label></>}
        <label className="editor-field">{field.kind === "text" ? "Tulisan yang ditampilkan" : field.kind === "image" ? "Tautan gambar" : "Tujuan tautan"}{field.kind === "text" ? <textarea rows={value.length > 160 ? 4 : 2} value={value} maxLength={field.binding?2000:5000} aria-invalid={Boolean(errors[key])} onChange={event => change(field, event.target.value)} /> : <input value={value} maxLength={5000} aria-invalid={Boolean(errors[key])} onChange={event => change(field, event.target.value)} />}{errors[key] && <span className="cms-field-error">{errors[key]}</span>}</label>
        {field.kind === "link" && <a href={value} target="_blank" rel="noopener noreferrer">Buka tujuan tautan</a>}
      </div>;
    })}</div><div className="admin-form-actions"><p>{dirty ? "Perubahan belum disimpan." : "Semua perubahan tersimpan."}</p><button className="admin-primary" type="button" disabled={!dirty || loading || busy} onClick={() => void save()}>{busy ? "Menyimpan…" : "Simpan section"}</button></div></fieldset>
  </section>;
}
