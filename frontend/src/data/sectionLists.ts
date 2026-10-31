import { z } from "zod";
import { ownershipFields } from "./divisionCms";
import { safeHttpsUrl, safeLocalAsset } from "./safeUrls";
import { safeSectionLink } from "./sectionEdits";
import { textPages } from "./websiteTexts";
export type ListField = { key:string; label:string; type?:"image"|"link"|"textarea"|"boolean"; options?:string[] };
export const sectionListFields: Record<string, { label:string; fields:ListField[] }> = {
  productCategoryFilters: {label:"Kategori filter produk",fields:[{key:"label",label:"Nama kategori"},{key:"slug",label:"Kode kategori"}]},
  heroImages: { label:"Gambar pembuka bergantian", fields:[{key:"src",label:"Gambar",type:"image"}] },
  collagePhotos: { label:"Foto kolase (tiga foto pertama tampil di halaman)", fields:[{key:"src",label:"Gambar",type:"image"},{key:"alt",label:"Deskripsi gambar"},{key:"caption",label:"Keterangan"},{key:"kind",label:"Jenis",options:["photo","logo"]}] },
  servicePaths: { label:"Pilihan kebutuhan layanan", fields:[{key:"title",label:"Judul"},{key:"detail",label:"Deskripsi",type:"textarea"},{key:"action",label:"Label tombol"},{key:"href",label:"Tujuan tombol",type:"link"},{key:"external",label:"Buka pada tab baru",type:"boolean"}] },
  scopeCards: { label:"Kartu ruang lingkup jasa", fields:[{key:"name",label:"Nama layanan"},{key:"description",label:"Deskripsi",type:"textarea"},{key:"image",label:"Gambar",type:"image"},{key:"icon",label:"Ikon",options:["laser","bend","weld","building"]},{key:"note",label:"Keterangan gambar"}] },
  workflowSteps: { label:"Alur pengerjaan", fields:[{key:"title",label:"Judul langkah"},{key:"desc",label:"Deskripsi",type:"textarea"},{key:"icon",label:"Ikon",options:["drawing","quote","calendar","machine","quality"]}] },
  orderSteps: { label:"Langkah cara pesan", fields:[{key:"title",label:"Judul langkah"},{key:"text",label:"Deskripsi",type:"textarea"}] },
  laserFAQs: { label:"Pertanyaan dan jawaban Jasa", fields:[{key:"question",label:"Pertanyaan"},{key:"answer",label:"Jawaban",type:"textarea"}] },
  galleryMaterials: { label:"Galeri material & pekerjaan", fields:[{key:"title",label:"Judul"},{key:"src",label:"Foto",type:"image"},{key:"category",label:"Kategori"},{key:"desc",label:"Deskripsi",type:"textarea"},{key:"unitLabel",label:"Label tombol"},{key:"unitHref",label:"Tujuan tombol",type:"link"},{key:"span",label:"Ukuran kartu",options:["","col-span-2","row-span-2"]}] },
  footerCompanyLinks: { label:"Navigasi perusahaan", fields:[{key:"label",label:"Label tautan"},{key:"href",label:"Tujuan",type:"link"}] },
  footerHelpLinks: { label:"Tautan bantuan", fields:[{key:"label",label:"Label tautan"},{key:"href",label:"Tujuan",type:"link"}] },
  footerLocalLinks: { label:"Layanan & area", fields:[{key:"group",label:"Nama kelompok"},{key:"label",label:"Label tautan"},{key:"href",label:"Tujuan",type:"link"},{key:"slug",label:"Divisi"}] },
  guideDefinitions: { label:"Penjelasan potong, tekuk, atau rakit", fields:[{key:"term",label:"Nama proses"},{key:"description",label:"Penjelasan",type:"textarea"}] },
  guideChecklist: { label:"Daftar persiapan desain", fields:[{key:"text",label:"Petunjuk",type:"textarea"}] },
};
export type SectionListRow = { id:string|number; [field:string]:string|number|boolean };
export const sectionListSchema = z.object({
  ...ownershipFields, id:z.string().min(1).max(80), page:z.enum(Object.keys(textPages) as [keyof typeof textPages,...Array<keyof typeof textPages>]), section:z.string().regex(/^[a-z][a-z0-9-]{0,79}$/), key:z.string().refine(key=>Boolean(sectionListFields[key.split(":")[0]])),
  rows:z.array(z.record(z.string(),z.union([z.string().max(5000),z.number().finite(),z.boolean()]))).max(100), published:z.boolean().default(true),
}).superRefine((list,ctx)=>{
  if(new Set(list.rows.map(row=>row.id)).size!==list.rows.length)ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows"],message:"ID item tidak boleh sama."});
  for(const [index,row] of list.rows.entries()) {
    if(typeof row.id!=="string"&&typeof row.id!=="number")ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,"id"],message:"ID item harus terisi."});
    for(const field of sectionListFields[list.key.split(":")[0]]?.fields || []) {
      const value=row[field.key];
      if((value===undefined||value==="")&&["src","image","title","name","question","answer","term","text","label","href","unitHref","group"].includes(field.key)){ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:`${field.label} harus diisi.`});continue;}
      if(value===undefined || value==="")continue;
      if(field.type==="link"&&(typeof value!=="string"||!safeSectionLink(value)))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:"Gunakan tautan halaman atau HTTPS yang valid."});
      if(field.type==="image"&&(typeof value!=="string"||!safeHttpsUrl(value)&&!safeLocalAsset(value,["images","media","api/cms/media"])))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:"Gunakan gambar lokal atau HTTPS."});
      if(field.options&&typeof value==="string"&&!field.options.includes(value))ctx.addIssue({code:z.ZodIssueCode.custom,path:["rows",index,field.key],message:"Pilih salah satu opsi yang tersedia."});
    }
  }
});
export type SectionList = z.infer<typeof sectionListSchema>;
