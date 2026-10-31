"use client";
import { useState } from "react";
import type { SectionEdit } from "../data/sectionEdits";
import type { SiteContent } from "../data/siteContent";
import { sectionListFields, type SectionListRow } from "../data/sectionLists";
import type { TextPage } from "../data/websiteTexts";
import { normalizeWebsiteText } from "../data/websiteTexts";
import { uploadCmsFile } from "../lib/cmsUpload";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import { productSlug } from "../data/inventory";
export type ListSnapshot = { key:string; rows:SectionListRow[] };
export function readSectionLists(document:Document, section:string):ListSnapshot[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-cms-list]")).filter(element=>element.closest<HTMLElement>("[data-cms-section]")?.dataset.cmsSection===section).flatMap(element=>{
    const key=element.dataset.cmsList || ""; if(!sectionListFields[key.split(":")[0]])return [];
    try { const rows=JSON.parse(element.dataset.cmsListRows || "[]"); return Array.isArray(rows)?[{key,rows}]:[]; }catch{return [];}
  });
}
export default function SectionListsEditor({ content, page, section, ownerDivision = null, snapshots, errors, update, uploadState, report }: { content:SiteContent; page:TextPage; section:string; ownerDivision?:string|null; snapshots:ListSnapshot[]; errors:Record<string,string>; update:(next:SiteContent)=>void; uploadState:(busy:boolean)=>void; report:(message:string,failed?:boolean)=>void }) {
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set());
  const saved=content.sectionLists.filter(list=>(list.ownerDivision||null)===ownerDivision&&list.page===page&&list.section===section);
  function editText(source:string, replacement:string) {
    const existing=[...content.sectionEdits].reverse().find(row=>(row.ownerDivision||null)===ownerDivision&&row.page===page&&row.section===section&&row.kind==="text"&&normalizeWebsiteText(row.source)===normalizeWebsiteText(source));
    const row:SectionEdit={id:existing?.id||crypto.randomUUID(),ownerDivision,page,section,kind:"text",source,label:"Tulisan section",replacement,published:true};
    const dedupedEdits = content.sectionEdits.filter(item => !(item.page === page && item.section === section && (item.ownerDivision||null)===ownerDivision && item.kind === "text" && normalizeWebsiteText(item.source) === normalizeWebsiteText(source))); update({...content, sectionEdits: [...dedupedEdits, row]});
  }
  const keys=[...new Set([...snapshots.map(list=>list.key),...saved.map(list=>list.key)])];
  return <>{keys.map(key=>{
    const definition=sectionListFields[key.split(":")[0]]; if(!definition)return null;
    const list=saved.find(list=>list.key===key), rows=(list?.rows || snapshots.find(list=>list.key===key)?.rows || []) as SectionListRow[];
    function change(next:SectionListRow[]) {
      const value={id:list?.id || crypto.randomUUID(),ownerDivision,page,section,key,rows:next,published:true};
      const dedupedLists = content.sectionLists.filter(item => !(item.page === page && item.section === section && (item.ownerDivision||null)===ownerDivision && item.key === key)); update({...content, sectionLists: [...dedupedLists, value]});
    }
    function field(id:string|number,name:string,value:string|boolean) {change(rows.map(row=>row.id===id?{...row,[name]:value}:row));}
    function ensureCategorySlug(id:string|number) {if(key!=="productCategoryFilters")return;const row=rows.find(item=>item.id===id);if(row&&!String(row.slug||"").trim()&&String(row.label||"").trim())change(rows.map(item=>item.id===id?{...item,slug:productSlug(String(item.label))||"kategori"}:item));}
    const isGuideList = key === "guideDefinitions" || key === "guideChecklist";
    const headingSource=key==="laserFAQs"?"Pertanyaan laser cutting & bending.":isGuideList?(key==="guideDefinitions"?"Potong, tekuk, atau rakit?":"Sebelum mengirim desain"):null;
    const headingRow=headingSource&&[...content.sectionEdits].reverse().find(row=>(row.ownerDivision||null)===ownerDivision&&row.page===page&&row.section===section&&row.kind==="text"&&normalizeWebsiteText(row.source)===normalizeWebsiteText(headingSource));
    const noteSource=key==="guideChecklist"?"Gambar DWG atau DXF membantu peninjauan bentuk. PDF dan foto dapat dikirim untuk konsultasi awal. Tim memastikan kelayakan file, toleransi, harga, dan jadwal sebelum produksi.":null;
    const noteRow=noteSource&&[...content.sectionEdits].reverse().find(row=>(row.ownerDivision||null)===ownerDivision&&row.page===page&&row.section===section&&row.kind==="text"&&normalizeWebsiteText(row.source)===normalizeWebsiteText(noteSource));
    return <section className="editor-panel cms-section-list" key={key}><div className="editor-list-heading"><h3>{headingSource?<input className="cms-inline-title" value={headingRow?.replacement||headingSource} onChange={event=>editText(headingSource,event.target.value)} aria-label={`Judul ${definition.label}`}/>:definition.label}{key.includes(":")?` · ${key.split(":")[1]}`:""} <span className="cms-edit-hint" title="Judul dapat diedit" aria-label="Judul dapat diedit">&#9998;</span></h3><button type="button" className="admin-secondary" disabled={rows.length>=100} onClick={()=>{
      const row:SectionListRow={id:crypto.randomUUID()};for(const field of definition.fields)row[field.key]=field.type==="boolean"?false:field.options?.[0] || "";
      setExpanded(current=>new Set([...current,String(row.id)]));
      change(isGuideList?[...rows,row]:[row,...rows]);
    }}>+ Tambah item</button></div>
      {!isGuideList&&<AdminOrderList label={`Urutan ${definition.label}`} items={rows.map((row,index)=>({id:String(row.id),title:String(row.title||row.name||row.label||row.question||row.caption||row.term||`Item ${index+1}`),image:typeof row.src==="string"?row.src:typeof row.image==="string"?row.image:undefined}))} onMove={(from,to)=>change(moveBefore(rows.map(row=>({...row,id:String(row.id)})),from,to))}/>}
      {rows.length===0&&<p>Belum ada item. Tambahkan item untuk menampilkannya kembali.</p>}
      {rows.map((row,index)=><details className="cms-list-row" key={row.id} open={expanded.has(String(row.id))} onToggle={event=>{const open=event.currentTarget.open;setExpanded(current=>{if(current.has(String(row.id))===open)return current;const next=new Set(current);if(open)next.add(String(row.id));else next.delete(String(row.id));return next;});}}><summary>{index+1}. {String(row.title||row.name||row.label||row.question||row.caption||row.term||"Item baru")}<span>Buka rincian</span></summary><div className="cms-field-heading"><h4>Item {index+1}</h4><button type="button" className="admin-danger" onClick={()=>{if(window.confirm("Hapus item ini dari section? Perubahan diterapkan setelah disimpan."))change(rows.filter(item=>item.id!==row.id));}}>Hapus item</button></div><div className="cms-list-fields">{definition.fields.map(item=><label className={`editor-field${item.type==="textarea"?" cms-wide-field":""}`} key={item.key}>{item.label}{item.type==="boolean"?<input type="checkbox" checked={row[item.key]===true} onChange={event=>field(row.id,item.key,event.target.checked)}/>:item.options?<select aria-invalid={Boolean(errors[`${key}:${index}:${item.key}`])} value={String(row[item.key] || item.options[0] || "")} onChange={event=>field(row.id,item.key,event.target.value)}>{item.options.map(option=><option key={option} value={option}>{({photo:"Foto",logo:"Logo",laser:"Laser cutting",bend:"Tekuk plat",weld:"Pengelasan",building:"Bangunan",drawing:"Gambar kerja",quote:"Penawaran",calendar:"Jadwal",machine:"Mesin",quality:"Pemeriksaan"} as Record<string,string>)[option] || (option===""?"Standar":option)}</option>)}</select>:item.type==="textarea"?<textarea aria-invalid={Boolean(errors[`${key}:${index}:${item.key}`])} rows={3} maxLength={5000} value={String(row[item.key] || "")} onChange={event=>field(row.id,item.key,event.target.value)} onBlur={key==="productCategoryFilters"&&item.key==="label"?()=>ensureCategorySlug(row.id):undefined}/>:<input aria-invalid={Boolean(errors[`${key}:${index}:${item.key}`])} maxLength={5000} value={String(row[item.key] || "")} onChange={event=>field(row.id,item.key,event.target.value)} onBlur={key==="productCategoryFilters"&&item.key==="label"?()=>ensureCategorySlug(row.id):undefined}/>}
        {errors[`${key}:${index}:${item.key}`]&&<span className="cms-field-error">{errors[`${key}:${index}:${item.key}`]}</span>}
        {item.type==="image"&&<>{row[item.key]&&<img className="cms-section-image" src={String(row[item.key])} alt={String(row.alt||row.caption||row.title||"Pratinjau")}/>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event=>{
          const file=event.target.files?.[0];event.target.value="";if(!file)return;uploadState(true);report("Mengunggah gambar…");
          try{field(row.id,item.key,await uploadCmsFile(file,"image",ownerDivision));report("Gambar selesai diunggah. Simpan section untuk menerapkannya.");}catch(error){report(error instanceof Error?error.message:"Unggahan gagal.",true);}finally{uploadState(false);}
        }}/><small>JPG, PNG, WebP · maksimal 4 MB.</small></>}
      </label>)}</div></details>)}
      {noteSource && <div className="cms-list-footer-note" style={{marginTop:"1.25rem",paddingTop:"1rem",borderTop:"1px solid var(--admin-border, #e5e7eb)"}}><label className="editor-field cms-wide-field"><span style={{fontWeight:600,fontSize:"0.875rem",display:"block",marginBottom:"0.5rem"}}>Paragraf catatan (DWG/DXF):</span><textarea rows={3} maxLength={5000} value={noteRow?.replacement ?? noteSource} onChange={event=>editText(noteSource,event.target.value)} /></label></div>}
    </section>;
  })}</>;
}
