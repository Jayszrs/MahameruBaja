import type { Division } from "./divisionCms";
import type { HeroSlide } from "./heroSlides";
import type { WebsiteText, TextPage } from "./websiteTexts";
import { normalizeWebsiteText } from "./websiteTexts";
export type WebsiteTextChoice = {source:string;area:string};
export const textAreaNames:Record<string,string>={Navbar:"Menu atas",Footer:"Bagian bawah website",UnifiedHomeContent:"Beranda",HomePage:"Pilihan divisi",AboutMergedPage:"Tentang kami",DivisionSubPage:"Halaman divisi",LaserCuttingPage:"Layanan",ProductsPage:"Katalog produk",ProductDetailPage:"Detail produk",ProjectsPage:"Galeri",KontakPage:"Kontak",QuotationPage:"Form penawaran",SocialHub:"Sosial media",SocialProof:"Ulasan & pemasok",ProjectAlbums:"Album proyek",Promotions:"Banner",HeroCarousel:"Hero",heroSlides:"Judul & deskripsi hero",divisionContent:"Profil divisi",divisionAbout:"Tentang divisi",companyIdentity:"Identitas & misi",serviceDescriptions:"Penjelasan layanan",InformasiPage:"Artikel",SearchPage:"Pencarian",CurrentDivision:"Teks profil saat ini",CurrentHero:"Teks hero saat ini",Custom:"Teks khusus"};
const pageAreas:Partial<Record<TextPage,string[]>>={home:["UnifiedHomeContent","HeroCarousel","heroSlides","CurrentHero","HomePage"],about:["AboutMergedPage","divisionAbout","companyIdentity"],products:["ProductsPage","ProductDetailPage","ProductCard"],services:["LaserCuttingPage","serviceDescriptions"],gallery:["ProjectsPage","ProjectAlbums","DivisionCollage"],contact:["KontakPage","ContactDirectory","DivisionLocation"],social:["SocialHub"],articles:["InformasiPage","ArticleDetailPage","ShareArticle"],quotation:["QuotationPage","RequestHandoff","QuotationDrawer"],search:["SearchPage","SearchOverlay"]};
export function choicesForWebsite(catalog:WebsiteTextChoice[],division:Division|undefined,slides:HeroSlide[],custom:WebsiteText[]) {
  const choices=new Map<string,WebsiteTextChoice>();
  function add(source:unknown,area:string) {if(typeof source!=="string" || !source.trim())return;const text=normalizeWebsiteText(source);if(!choices.has(text))choices.set(text,{source:text,area});}
  for(const item of catalog)add(item.source,item.area);
  if(division) {
    for(const key of ["name","label","area","title","intro","description","mission","aboutHeadline","address"] as const)add(division[key],"CurrentDivision");
    for(const value of [...division.values,...division.offerings,...division.process,...Object.values(division.offeringDescriptions)])add(value,"CurrentDivision");
    for(const faq of division.faq){add(faq.question,"CurrentDivision");add(faq.answer,"CurrentDivision");}
  }
  for(const slide of slides)for(const value of [slide.eyebrow,slide.title,slide.accent,slide.description,slide.primaryAction.label,slide.secondaryAction.label,slide.visualNote])add(value,"CurrentHero");
  for(const row of custom)add(row.source,"Custom");
  return [...choices.values()];
}
export function choiceOnPage(choice:WebsiteTextChoice,page:TextPage) {
  return page==="all" || ["Navbar","Footer","CurrentDivision","divisionContent","DivisionSubPage","Custom"].includes(choice.area) || Boolean(pageAreas[page]?.includes(choice.area));
}
