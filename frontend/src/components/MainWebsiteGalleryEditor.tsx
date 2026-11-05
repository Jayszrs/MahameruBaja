"use client";
import { useMemo, useRef, useState } from "react";
import type { SiteContent } from "../data/siteContent";
import type { WebsitePhoto } from "../data/websitePhotos";
import type { SectionListRow } from "../data/sectionLists";
import { sectionListSchema } from "../data/sectionLists";
import { contentId } from "../data/socialMedia";
import { uploadCmsFile, validateUploadFile } from "../lib/cmsUpload";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import AdminViewTabs from "./AdminViewTabs";
import Image from "./CmsImage";
import { useAdminWorkspace } from "./AdminWorkspace";

type PhotoRow = SectionListRow & { src: string; sourceSrc?:string; title: string; alt: string; category: string; categories: string[]; categoryOverride?: boolean; sourceManaged?: boolean; deleted?:boolean; href: string; sourceName:string; sourceUrl:string };
type CategoryRow = SectionListRow & { label: string };
function rowList(content: SiteContent, key: string) {
  return content.sectionLists.find(row=>row.page==="gallery"&&row.key===key&&(!row.ownerDivision)&&((key==="galleryCategories"&&["photos","albums"].includes(row.section))||(key==="mainGalleryPhotos"&&row.section==="photos")));
}
function stableId(value:string,index:number){return `gallery-cat-${index+1}-${value.toLocaleLowerCase("id").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,32)||index+1}`;}

export default function MainWebsiteGalleryEditor({initialContent,initialPhotos,initialCategories}:{initialContent:SiteContent;initialPhotos:WebsitePhoto[];initialCategories:string[]}){
  const categoryList=rowList(initialContent,"galleryCategories");
  const photoList=rowList(initialContent,"mainGalleryPhotos");
  const savedCategories=(categoryList?.rows as CategoryRow[]|undefined)||[];
  const seededCategories=[...savedCategories,...initialCategories.filter(label=>!savedCategories.some(row=>row.label===label)).map((label,index)=>({id:stableId(label,savedCategories.length+index),label}))];
  const savedPhotos=(photoList?.rows as PhotoRow[]|undefined)||[];
  const sourceByUrl=new Map(initialPhotos.map((photo,index)=>[photo.src,{photo,index}]));
  const savedDeletedPhotos=savedPhotos.filter(row=>row.deleted&&sourceByUrl.has(row.sourceSrc||row.src));
  const seededPhotos:PhotoRow[]=[
    ...initialPhotos.filter(photo=>!savedDeletedPhotos.some(row=>(row.sourceSrc||row.src)===photo.src)).map((photo,index)=>{
      const saved=savedPhotos.find(row=>(row.sourceSrc||row.src)===photo.src);
      const categories=saved?.categoryOverride?(saved.categories?.length?saved.categories:[saved.category]):photo.categories;
      return {id:saved?.id||photo.id||`photo-${index+1}`,src:saved?.src||photo.src,sourceSrc:photo.src,title:saved?.title||photo.title,alt:saved?.alt||photo.alt,category:saved?.categoryOverride?saved.category:(categories[0]||initialCategories[0]||""),categories,categoryOverride:Boolean(saved?.categoryOverride),sourceManaged:true,href:saved?.href||photo.href||"",sourceName:saved?.sourceName||photo.sourceName||"",sourceUrl:saved?.sourceUrl||photo.sourceUrl||""};
    }),
    ...savedPhotos.filter(row=>!sourceByUrl.has(row.sourceSrc||row.src)).map(row=>({...row,categories:row.categories?.length?row.categories:[row.category].filter(Boolean),sourceManaged:false})),
  ];
  const [content,setContent]=useState(initialContent);
  const [base,setBase]=useState(initialContent);
  const [categories,setCategories]=useState<CategoryRow[]>(seededCategories);
  const [photos,setPhotos]=useState<PhotoRow[]>(seededPhotos);
  const [deletedPhotos,setDeletedPhotos]=useState<PhotoRow[]>(savedDeletedPhotos);
  const [stage,setStage]=useState<"categories"|"photos">("categories");
  const [selectedCategory,setSelectedCategory]=useState(String(seededCategories[0]?.id||""));
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [failed,setFailed]=useState(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const categoryNames=useMemo(()=>categories.map(row=>row.label.trim()).filter(Boolean),[categories]);
  const activeCategory=categories.find(row=>String(row.id)===selectedCategory)||categories[0];
  const dirty=JSON.stringify(content.sectionLists)!==JSON.stringify(base.sectionLists);
  function sync(nextCategories:CategoryRow[],nextPhotos:PhotoRow[],nextDeleted=deletedPhotos){
    setCategories(nextCategories);setPhotos(nextPhotos);setDeletedPhotos(nextDeleted);
    const cat={id:categoryList?.id||"main-gallery-categories",page:"gallery" as const,section:"photos",key:"galleryCategories",rows:nextCategories,published:true};
    const list={id:photoList?.id||"main-gallery-photos",page:"gallery" as const,section:"photos",key:"mainGalleryPhotos",rows:[...nextPhotos,...nextDeleted],published:true};
        setContent(current=>{
      const existing=current.sectionLists.filter(row=>{
        const samePage=row.page==="gallery"&&!row.ownerDivision;
        const oldCategory=row.key==="galleryCategories"&&["photos","albums"].includes(row.section);
        const oldPhotos=row.key==="mainGalleryPhotos"&&row.section==="photos";
        return !(samePage&&(oldCategory||oldPhotos));
      });
      return {...current,sectionLists:[...existing,cat,list]};
    });
    setNotice("");setFailed(false);
  }
  async function save(){
    if(busy)return;
    if(new Set(categoryNames.map(value=>value.toLocaleLowerCase("id"))).size!==categoryNames.length){setFailed(true);setNotice("Nama kategori harus berbeda.");return;}
    const cat={id:categoryList?.id||"main-gallery-categories",page:"gallery" as const,section:"photos",key:"galleryCategories",rows:categories,published:true};
    const list={id:photoList?.id||"main-gallery-photos",page:"gallery" as const,section:"photos",key:"mainGalleryPhotos",rows:[...photos,...deletedPhotos],published:true};
    for(const record of [cat,list]){const parsed=sectionListSchema.safeParse(record);if(!parsed.success){setFailed(true);setNotice(parsed.error.issues[0]?.message||"Periksa data kategori dan foto.");return;}}
    const categorySet=new Set(categoryNames);
    if(photos.some(photo=>!categorySet.has(photo.category))){setFailed(true);setNotice("Pilih kategori untuk setiap foto.");return;}
    setBusy(true);setFailed(false);setNotice("");
    try{const response=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...content,_base:base})});const saved=await response.json();if(!response.ok)throw new Error(saved.message||"Perubahan belum tersimpan.");setContent(saved);setBase(saved);setNotice("Kategori dan foto galeri tersimpan.");}
    catch(error){setFailed(true);setNotice(error instanceof Error?error.message:"Gagal menyimpan galeri.");}
    finally{setBusy(false);}
  }
  useAdminWorkspace({dirty,busy,label:"Simpan section",disabled:!dirty,onSave:save});
  function editCategory(id:string,patch:Partial<Pick<CategoryRow,"label">>){sync(categories.map(row=>String(row.id)===id?{...row,...patch}:row),photos);}
  function deleteCategory(row:CategoryRow){const used=photos.filter(photo=>(photo.categories||[photo.category]).includes(row.label)).length;if(used){setFailed(true);setNotice(`Kategori ini dipakai ${used} foto. Pindahkan foto tersebut sebelum menghapus kategori.`);return;}if(categories.length<=1){setFailed(true);setNotice("Sisakan setidaknya satu kategori.");return;}const next=categories.filter(item=>String(item.id)!==String(row.id));sync(next,photos);setSelectedCategory(String(next[0]?.id||""));setNotice("Kategori dihapus. Simpan perubahan untuk menerapkannya.");}
  async function uploadFiles(files:FileList|null){if(!files?.length)return;if(!categoryNames.length){setStage("categories");setFailed(true);setNotice("Tambahkan kategori sebelum mengunggah foto.");return;}const queue=Array.from(files);if(photos.length+queue.length>300){setFailed(true);setNotice("Maksimal 300 foto pada galeri ini.");return;}try{queue.forEach(file=>validateUploadFile(file,"image"));}catch(error){setFailed(true);setNotice(error instanceof Error?error.message:"Pilih berkas gambar yang valid.");return;}setBusy(true);setFailed(false);setNotice("Mengunggah foto…");let added=0;let nextPhotos=[...photos];try{for(const file of queue){const src=await uploadCmsFile(file,"image",null);const title=file.name.replace(/\.[^.]+$/," ").trim()||"Foto baru";nextPhotos=[...nextPhotos,{id:contentId(),src,title,alt:title,category:categoryNames[0],categories:[categoryNames[0]],categoryOverride:true,sourceManaged:false,href:"",sourceName:"",sourceUrl:""}];sync(categories,nextPhotos);added++;}setNotice(`${added} foto masuk ke editor. Simpan perubahan untuk menerapkannya.`);}catch(error){setFailed(true);setNotice(`${added} foto berhasil diunggah. ${error instanceof Error?error.message:"Unggahan berikutnya gagal."}`);}finally{setBusy(false);}}
  function updatePhoto(id:string,patch:Partial<Pick<PhotoRow,"src"|"title"|"alt"|"category"|"categories"|"categoryOverride"|"href"|"sourceName"|"sourceUrl">>){sync(categories,photos.map(photo=>String(photo.id)===id?{...photo,...patch}:photo));}
  function deletePhoto(id:string){const target=photos.find(photo=>String(photo.id)===String(id));const next=photos.filter(photo=>String(photo.id)!==id);const tombstone=target?.sourceManaged?{...target,deleted:true}:null;sync(categories,next,tombstone?[...deletedPhotos,tombstone]:deletedPhotos);setNotice("Foto dihapus dari galeri. Simpan perubahan untuk menerapkannya.");}
  return <section className="cms-section-content">
    <AdminViewTabs value={stage} onChange={setStage} label="Pengelolaan galeri" options={[{value:"categories",label:`Kategori (${categories.length})`},{value:"photos",label:`Foto (${photos.length})`}]} />
    {notice&&<p className={`editor-notice ${failed?"error":"success"}`} role={failed?"alert":"status"}>{notice}</p>}
    {stage==="categories"?<section className="editor-panel cms-section-list"><div className="editor-list-heading"><h2>Kategori foto</h2><button type="button" className="admin-primary" disabled={busy||categories.length>=100} onClick={()=>{const label="Kategori baru";const row={id:contentId(),label};sync([...categories,row],photos);setSelectedCategory(String(row.id));}}>+ Tambah kategori</button></div><p className="admin-field-help">Atur kategori sebelum menambahkan foto.</p><AdminOrderList label="Urutan kategori" disabled={busy} items={categories.map(row=>({id:String(row.id),title:row.label,detail:`${photos.filter(photo=>(photo.categories||[photo.category]).includes(row.label)).length} foto`}))} selected={selectedCategory||String(activeCategory?.id||"")} hideOpenHint selectionVerb="Pilih kategori" onSelect={id=>{setSelectedCategory(id);requestAnimationFrame(()=>{const detail=document.getElementById("main-gallery-category-detail");detail?.scrollIntoView({block:"center",behavior:"smooth"});detail?.querySelector<HTMLInputElement>("input")?.focus({preventScroll:true});});}} onMove={(from,to)=>sync(moveBefore(categories.map(row=>({...row,id:String(row.id)})),from,to),photos)} />{activeCategory&&<div id="main-gallery-category-detail" className="editor-grid main-gallery-category-editor"><label className="editor-field">Nama kategori<input maxLength={80} value={activeCategory.label} onChange={event=>{const previous=activeCategory.label;const next=event.target.value;const nextCategories=categories.map(row=>String(row.id)===String(activeCategory.id)?{...row,label:next}:row);const nextPhotos=photos.map(photo=>{const memberships=photo.categories||[photo.category];return {...photo,category:photo.category===previous?next:photo.category,categories:memberships.map(label=>label===previous?next:label),categoryOverride:photo.categoryOverride||photo.category===previous};});sync(nextCategories,nextPhotos);}} /></label><button type="button" className="admin-danger" disabled={busy} onClick={()=>deleteCategory(activeCategory)}>Hapus kategori</button></div>}</section>:<section className="editor-panel cms-section-list"><div className="editor-list-heading"><h2>Foto Galeri</h2><label className="admin-primary cms-file-button">+ Tambah foto<input ref={fileInput} type="file" hidden multiple accept="image/jpeg,image/png,image/webp" disabled={busy||!categories.length} onChange={event=>{void uploadFiles(event.target.files);event.target.value="";}} /></label></div>{!categories.length&&<p className="admin-field-help">Tambahkan kategori terlebih dahulu.</p>}<AdminOrderList label="Urutan foto" disabled={busy} items={photos.map(photo=>({id:String(photo.id),title:photo.title,detail:photo.category,image:photo.src}))} onMove={(from,to)=>sync(categories,moveBefore(photos.map(row=>({...row,id:String(row.id)})),from,to))}/>{photos.map((photo,index)=><details className="cms-list-row" id={`main-gallery-photo-${photo.id}`} data-cms-detail-id={`mainGalleryPhotos:${photo.id}`} key={photo.id}><summary>{index+1}. {photo.title}<span>Buka rincian</span></summary><div className="cms-list-fields"><div className="cms-gallery-photo-preview"><Image src={photo.src} alt={photo.alt||photo.title} width={480} height={300} /></div><div className="editor-grid"><label className="editor-field">Nama foto<input maxLength={200} value={photo.title} onChange={event=>updatePhoto(String(photo.id),{title:event.target.value})}/></label><label className="editor-field">Kategori<select value={photo.category} onChange={event=>updatePhoto(String(photo.id),{category:event.target.value,categories:[event.target.value],categoryOverride:true})}>{categories.map(row=><option key={String(row.id)} value={row.label}>{row.label}</option>)}</select></label><label className="editor-field cms-wide-field">Deskripsi foto<textarea rows={3} maxLength={500} value={photo.alt} onChange={event=>updatePhoto(String(photo.id),{alt:event.target.value})}/></label><label className="editor-field">Ganti foto<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={async event=>{const file=event.target.files?.[0];event.target.value="";if(!file)return;setBusy(true);setNotice("Mengunggah foto pengganti…");try{validateUploadFile(file,"image");updatePhoto(String(photo.id),{src:await uploadCmsFile(file,"image",null)});setNotice("Foto pengganti masuk ke editor. Simpan perubahan untuk menerapkannya.");}catch(error){setFailed(true);setNotice(error instanceof Error?error.message:"Unggahan gagal.");}finally{setBusy(false);}}}/><small>JPG, PNG, atau WebP · maksimal 4 MB.</small></label></div><button type="button" className="admin-danger" disabled={busy} onClick={()=>deletePhoto(String(photo.id))}>Hapus foto</button></div></details>)}{!photos.length&&<p>Belum ada foto. Tambahkan kategori, lalu unggah foto.</p>}</section>}
  </section>;
}
