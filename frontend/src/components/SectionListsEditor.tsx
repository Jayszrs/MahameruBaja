"use client";
import { useState } from "react";
import type { SiteContent } from "../data/siteContent";
import { sectionListFields, type SectionListRow } from "../data/sectionLists";
import type { TextPage } from "../data/websiteTexts";
import { uploadCmsFile } from "../lib/cmsUpload";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
export type ListSnapshot = { key:string; rows:SectionListRow[] };
export function readSectionLists(document:Document, section:string):ListSnapshot[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-cms-list]")).filter(element=>element.closest<HTMLElement>("[data-cms-section]")?.dataset.cmsSection===section).flatMap(element=>{
    const key=element.dataset.cmsList || ""; if(!sectionListFields[key.split(":")[0]])return [];
    try { const rows=JSON.parse(element.dataset.cmsListRows || "[]"); return Array.isArray(rows)?[{key,rows}]:[]; }catch{return [];}
  });
}
export default function SectionListsEditor({ content, page, section, snapshots, errors, update, uploadState, report }: { content:SiteContent; page:TextPage; section:string; snapshots:ListSnapshot[]; errors:Record<string,string>; update:(next:SiteContent)=>void; uploadState:(busy:boolean)=>void; report:(message:string,failed?:boolean)=>void }) {
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set());
  const saved=content.sectionLists.filter(list=>!list.ownerDivision&&list.page===page&&list.section===section);
  const keys=[...new Set([...snapshots.map(list=>list.key),...saved.map(list=>list.key)])];
  return <>{keys.map(key=>{
    const definition=sectionListFields[key.split(":")[0]]; if(!definition)return null;
    const list=saved.find(list=>list.key===key), rows=(list?.rows || snapshots.find(list=>list.key===key)?.rows || []) as SectionListRow[];
    function change(next:SectionListRow[]) {
      const value={id:list?.id || crypto.randomUUID(),ownerDivision:null,page,section,key,rows:next,published:true};
      update({...content,sectionLists:list?content.sectionLists.map(item=>item.id===list.id?value:item):[...content.sectionLists,value]});
    }
    function field(id:string|number,name:string,value:string|boolean) {change(rows.map(row=>row.id===id?{...row,[name]:value}:row));}
    return <section className="editor-panel cms-section-list" key={key}><div className="editor-list-heading"><h3>{definition.label}{key.includes(":")?` · ${key.split(":")[1]}`:""}</h3><button type="button" className="admin-secondary" disabled={rows.length>=100} onClick={()=>{
      const row:SectionListRow={id:crypto.randomUUID()};for(const field of definition.fields)row[field.key]=field.type==="boolean"?false:field.options?.[0] || "";
      setExpanded(current=>new Set([...current,String(row.id)]));
      change([row,...rows]);
    }}>+ Tambah item</button></div>
      <AdminOrderList label={`Urutan ${definition.label}`} items={rows.map((row,index)=>({id:String(row.id),title:String(row.title||row.name||row.label||row.question||row.caption||row.term||`Item ${index+1}`),image:typeof row.src==="string"?row.src:typeof row.image==="string"?row.image:undefined}))} onMove={(from,to)=>change(moveBefore(rows.map(row=>({...row,id:String(row.id)})),from,to))}/>
      {rows.length===0&&<p>Belum ada item. Tambahkan item untuk menampilkannya kembali.</p>}
      {rows.map((row,index)=><details className="cms-list-row" key={row.id} open={expanded.has(String(row.id))} onToggle={event=>{const open=event.currentTarget.open;setExpanded(current=>{if(current.has(String(row.id))===open)return current;const next=new Set(current);if(open)next.add(String(row.id));else next.delete(String(row.id));return next;});}}><summary>{index+1}. {String(row.title||row.name||row.label||row.question||row.caption||row.term||"Item baru")}<span>Buka rincian</span></summary><div className="cms-field-heading"><h4>Item {index+1}</h4><button type="button" className="admin-danger" onClick={()=>{if(window.confirm("Hapus item ini dari section? Perubahan diterapkan setelah disimpan."))change(rows.filter(item=>item.id!==row.id));}}>Hapus item</button></div><div className="cms-list-fields">{definition.fields.map(item=><label className={`editor-field${item.type==="textarea"?" cms-wide-field":""}`} key={item.key}>{item.label}{item.type==="boolean"?<input type="checkbox" checked={row[item.key]===true} onChange={event=>field(row.id,item.key,event.target.checked)}/>:item.options?<select aria-invalid={Boolean(errors[`${key}:${index}:${item.key}`])} value={String(row[item.key] || item.options[0] || "")} onChange={event=>field(row.id,item.key,event.target.value)}>{item.options.map(option=><option key={option} value={option}>{({photo:"Foto",logo:"Logo",laser:"Laser cutting",bend:"Tekuk plat",weld:"Pengelasan",building:"Bangunan",drawing:"Gambar kerja",quote:"Penawaran",calendar:"Jadwal",machine:"Mesin",quality:"Pemeriksaan"} as Record<string,string>)[option] || (option===""?"Standar":option)}</option>)}</select>:item.type==="textarea"?<textarea aria-invalid={Boolean(errors[`${key}:${index}:${item.key}`])} rows={3} maxLength={5000} value={String(row[item.key] || "")} onChange={event=>field(row.id,item.key,event.target.value)}/>:<input aria-invalid={Boolean(errors[`${key}:${index}:${item.key}`])} maxLength={5000} value={String(row[item.key] || "")} onChange={event=>field(row.id,item.key,event.target.value)}/>}
        {errors[`${key}:${index}:${item.key}`]&&<span className="cms-field-error">{errors[`${key}:${index}:${item.key}`]}</span>}
        {item.type==="image"&&<>{row[item.key]&&<img className="cms-section-image" src={String(row[item.key])} alt={String(row.alt||row.caption||row.title||"Pratinjau")}/>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={async event=>{
          const file=event.target.files?.[0];event.target.value="";if(!file)return;uploadState(true);report("Mengunggah gambar…");
          try{field(row.id,item.key,await uploadCmsFile(file,"image",null));report("Gambar selesai diunggah. Simpan section untuk menerapkannya.");}catch(error){report(error instanceof Error?error.message:"Unggahan gagal.",true);}finally{uploadState(false);}
        }}/><small>JPG, PNG, WebP · maksimal 4 MB.</small></>}
      </label>)}</div></details>)}
    </section>;
  })}</>;
}
