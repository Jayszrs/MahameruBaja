import { z } from "zod";
import { ownershipFields } from "./divisionCms";
import { safeHttpsUrl, safeLocalAsset } from "./safeUrls";
import { safeSectionLink } from "./sectionEdits";
import { textPages } from "./websiteTexts";
export type ListField = { key:string; label:string; type?:"image"|"link"|"textarea"|"boolean"; options?:string[] };
export const sectionListFields: Record<string, { label:string; fields:ListField[] }> = {
  productCategoryFilters: {label:"Kategori filter produk",fields:[{key:"label",label:"Nama kategori"}]},
  galleryCategories: {label:"Kategori galeri proyek",fields:[{key:"label",label:"Nama kategori"}]},
  mainGalleryPhotos: {label:"Foto galeri website utama",fields:[{key:"src",label:"Foto",type:"image"},{key:"title",label:"Nama foto"},{key:"alt",label:"Deskripsi foto",type:"textarea"},{key:"category",label:"Kategori"},{key:"href",label:"Tautan tujuan",type:"link"}]},
  unitGalleryPhotos: {label:"Foto Galeri unit",fields:[{key:"src",label:"Foto",type:"image"},{key:"title",label:"Nama foto"},{key:"alt",label:"Deskripsi foto"}]},
  heroImages: { label:"Gambar pembuka bergantian", fields:[{key:"src",label:"Gambar",type:"image"}] },
  collagePhotos: { label:"Foto kolase (tiga foto pertama tampil di halaman)", fields:[{key:"src",label:"Gambar",type:"image"},{key:"alt",label:"Deskripsi gambar"},{key:"caption",label:"Keterangan"},{key:"kind",label:"Jenis",options:["photo","logo"]}] },
  collageGroups: { label:"Kolase beranda", fields:[{key:"title",label:"Nama kolase"},{key:"src",label:"Sampul kolase",type:"image"},{key:"alt",label:"Deskripsi sampul"}] },
  collageImages: { label:"Foto dalam kolase", fields:[{key:"src",label:"Gambar",type:"image"},{key:"alt",label:"Deskripsi gambar"},{key:"caption",label:"Keterangan"}] },
  servicePaths: { label:"Pilihan kebutuhan layanan", fields:[{key:"title",label:"Judul"},{key:"detail",label:"Deskripsi",type:"textarea"},{key:"action",label:"Label tombol"},{key:"href",label:"Tujuan tombol",type:"link"},{key:"external",label:"Buka pada tab baru",type:"boolean"}] },
  scopeCards: { label:"Kartu ruang lingkup jasa", fields:[{key:"name",label:"Nama layanan"},{key:"description",label:"Deskripsi",type:"textarea"},{key:"image",label:"Gambar",type:"image"},{key:"icon",label:"Ikon",options:["laser","bend","weld","building"]},{key:"note",label:"Keterangan gambar"}] },
  workflowSteps: { label:"Alur pengerjaan", fields:[{key:"title",label:"Judul langkah"},{key:"desc",label:"Deskripsi",type:"textarea"},{key:"icon",label:"Ikon",options:["drawing","quote","calendar","machine","quality"]}] },
  orderSteps: { label:"Langkah cara pesan", fields:[{key:"title",label:"Judul langkah"},{key:"text",label:"Deskripsi",type:"textarea"}] },
  laserFAQs: { label:"Pertanyaan laser cutting & bending", fields:[{key:"question",label:"Pertanyaan"},{key:"answer",label:"Jawaban",type:"textarea"}] },
  galleryMaterials: { label:"Galeri material & pekerjaan", fields:[{key:"title",label:"Judul"},{key:"src",label:"Foto",type:"image"},{key:"category",label:"Kategori"},{key:"desc",label:"Deskripsi",type:"textarea"},{key:"unitLabel",label:"Label tombol"},{key:"unitHref",label:"Tujuan tombol",type:"link"},{key:"span",label:"Ukuran kartu",options:["","col-span-2","row-span-2"]}] },
  footerCompanyLinks: { label:"Navigasi perusahaan", fields:[{key:"label",label:"Label tautan"},{key:"href",label:"Tujuan",type:"link"}] },
  footerHelpLinks: { label:"Tautan bantuan", fields:[{key:"label",label:"Label tautan"},{key:"href",label:"Tujuan",type:"link"}] },
  footerLocalLinks: { label:"Layanan & area", fields:[{key:"group",label:"Nama kelompok"},{key:"label",label:"Label tautan"},{key:"href",label:"Tujuan",type:"link"},{key:"slug",label:"Divisi"}] },
  guideDefinitions: { label:"Potong, tekuk, atau rakit", fields:[{key:"term",label:"Nama proses"},{key:"description",label:"Penjelasan",type:"textarea"}] },
  guideChecklist: { label:"Sebelum mengirim desain", fields:[{key:"text",label:"Petunjuk",type:"textarea"}] },
  serviceGuideChoices: { label:"Pilihan proses pengerjaan", fields:[{key:"title",label:"Judul proses"},{key:"label",label:"Nama layanan"},{key:"text",label:"Penjelasan",type:"textarea"},{key:"action",label:"Teks tautan"},{key:"service",label:"Layanan formulir",options:["Laser Cutting","Bending","Fabrikasi"]}] },
  serviceContactChecklist: { label:"Yang perlu disiapkan", fields:[{key:"title",label:"Nama kebutuhan"},{key:"detail",label:"Penjelasan",type:"textarea"}] },
  serviceRequestFields: { label:"Form permintaan penawaran", fields:[{key:"label",label:"Nama field"},{key:"placeholder",label:"Petunjuk isi"},{key:"type",label:"Jenis isian",options:["text","textarea","number","email","tel","select"]},{key:"options",label:"Pilihan dropdown (satu per baris)",type:"textarea"},{key:"required",label:"Wajib diisi",type:"boolean"}] },
  aboutEngineeringSteps: { label:"Tahapan cara membantu", fields:[{key:"title",label:"Judul tahapan"},{key:"description",label:"Penjelasan tahapan",type:"textarea"}] },
};
export type SectionListRow = { id:string|number; [field:string]:string|number|boolean|string[] };
export const defaultServiceRequestFields:SectionListRow[]=[
  {id:"division",step:"0",name:"division",label:"Divisi tujuan",type:"division",placeholder:"",required:true,system:true,locked:true},
  {id:"service",step:"0",name:"service",label:"Pilih layanan",type:"service",placeholder:"",required:true,system:true,locked:true},
  {id:"file",step:"1",name:"file",label:"Gambar kerja / desain",type:"file",placeholder:"",required:true,system:true,locked:true},
  {id:"noDrawing",step:"1",name:"noDrawing",label:"Belum punya gambar, saya ingin konsultasi dulu.",type:"checkbox",placeholder:"",required:false,system:true,locked:true},
  {id:"material",step:"1",name:"material",label:"Material / bahan",type:"text",placeholder:"Contoh: plat besi, stainless, atau minta rekomendasi",required:true,system:true,locked:true},
  {id:"thickness",step:"1",name:"thickness",label:"Ketebalan (mm)",type:"number",placeholder:"",required:false,system:true,locked:false},
  {id:"dimensions",step:"1",name:"dimensions",label:"Ukuran akhir",type:"text",placeholder:"Contoh: 600 × 400 mm, atau perlu bantuan ukuran",required:true,system:true,locked:true},
  {id:"quantity",step:"1",name:"quantity",label:"Jumlah komponen",type:"number",placeholder:"",required:true,system:true,locked:true},
  {id:"notes",step:"1",name:"notes",label:"Detail kebutuhan",type:"textarea",placeholder:"Ceritakan bentuk, tekukan, finishing, dan target pengerjaan.",required:false,system:true,locked:false},
  {id:"name",step:"2",name:"name",label:"Nama",type:"text",placeholder:"",required:true,system:true,locked:true},
  {id:"company",step:"2",name:"company",label:"Perusahaan / PIC",type:"text",placeholder:"",required:false,system:true,locked:false},
  {id:"whatsapp",step:"2",name:"whatsapp",label:"Nomor WhatsApp",type:"tel",placeholder:"081218052017",required:true,system:true,locked:true},
  {id:"city",step:"2",name:"city",label:"Kota / lokasi proyek",type:"text",placeholder:"Contoh: Tambun, Bekasi",required:true,system:true,locked:true},
  {id:"review",step:"3",name:"review",label:"Ringkasan permintaan",type:"summary",placeholder:"",required:false,system:true,locked:true},
  {id:"consent",step:"3",name:"consent",label:"Persetujuan tindak lanjut WhatsApp",type:"checkbox",placeholder:"",required:true,system:true,locked:true},
];
export const sectionListSchema = z.object({
  ...ownershipFields, id:z.string().min(1).max(80), page:z.enum(Object.keys(textPages) as [keyof typeof textPages,...Array<keyof typeof textPages>]), section:z.string().regex(/^[A-Za-z][A-Za-z0-9-]{0,79}$/), key:z.string().refine(key=>Boolean(sectionListFields[key.split(":")[0]])),
  rows:z.array(z.record(z.string(),z.union([z.string().max(5000),z.number().finite(),z.boolean(),z.array(z.string().max(5000)).max(30)]))).max(300), published:z.boolean().default(true),
}).superRefine((list,ctx)=>{
  if(new Set(list.rows.map(row=>row.id)).size!==list.rows.length)ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows"],message:"ID item tidak boleh sama."});
  for(const [index,row] of list.rows.entries()) {
    if(typeof row.id!=="string"&&typeof row.id!=="number")ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"id"],message:"ID item harus terisi."});
    if(list.key.split(":")[0]==="productCategoryFilters"&&(typeof row.slug!=="string"||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"label"],message:"Nama kategori perlu diisi agar kategori dapat dipakai untuk filter."});
    if(list.key.split(":")[0]==="mainGalleryPhotos"&&typeof row.category!=="string")ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"category"],message:"Pilih kategori foto."});
    for(const field of sectionListFields[list.key.split(":")[0]]?.fields || []) {
      const value=row[field.key];
      const isOptionalMainGalleryLink = list.key.split(":")[0] === "mainGalleryPhotos" && field.key === "href";
      if((value===undefined||value==="")&&["src","image","title","name","question","answer","term","text","label","href","unitHref","group"].includes(field.key)&&!isOptionalMainGalleryLink){ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:`${field.label} harus diisi.`});continue;}
      if(value===undefined || value==="")continue;
      if(field.type==="link"&&(typeof value!=="string"||!safeSectionLink(value)))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:"Gunakan tautan halaman atau HTTPS yang valid."});
      if(field.type==="image"&&(typeof value!=="string"||!safeHttpsUrl(value)&&!safeLocalAsset(value,["images","media","api/cms/media"])))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:"Gunakan gambar lokal atau HTTPS."});
      if(field.options&&typeof value==="string"&&!field.options.includes(value))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:"Pilih salah satu opsi yang tersedia."});
    }
  }
  if(list.key.split(":")[0]==="serviceRequestFields") {
    if(list.rows.length>35)ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows"],message:"Maksimal 35 field pada form penawaran."});
    const names=new Set<string>();
    for(const [index,row] of list.rows.entries()) {
      if(!["0","1","2","3"].includes(String(row.step)))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"step"],message:"Pilih tahap input yang tersedia."});
      if(!/^[a-z][a-zA-Z0-9_]{0,39}$/.test(String(row.name||"")))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"name"],message:"Nama data harus diawali huruf, tanpa spasi."});
      if(names.has(String(row.name)))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"name"],message:"Nama data harus berbeda."});
      names.add(String(row.name));
      for(const [key,limit] of [["label",120],["placeholder",200],["options",1000]] as const)if(String(row[key]||"").length>limit)ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,key],message:`Batas ${limit} karakter.`});
      if(row.type==="select"&&!String(row.options||"").split(/\r?\n/).map(value=>value.trim()).filter(Boolean).length)ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"options"],message:"Isi setidaknya satu pilihan."});
    }
  }
  if(list.key.split(":")[0]==="collageGroups"&&list.rows.length!==3)ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows"],message:"Beranda memiliki tepat tiga kolase."});
});
export type SectionList = z.infer<typeof sectionListSchema>;
