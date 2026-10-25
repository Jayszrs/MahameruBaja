import type { Division } from "./divisionCms";
import type { HeroSlide } from "./heroSlides";
import type { WebsiteText, TextPage } from "./websiteTexts";
import { textPages } from "./websiteTexts";
import { normalizeWebsiteText } from "./websiteTexts";
import type { SiteContent } from "./siteContent";
import { contentOwner } from "./divisionCms";
import { serviceWording } from "./serviceWording";
export type WebsiteTextChoice = {source:string;area:string;areas?:string[];pages?:TextPage[]};
export type OwnedWebsiteTextChoice = WebsiteTextChoice & {ownerDivision:string|null};
export const textAreaNames:Record<string,string>={Navbar:"Menu atas",Footer:"Bagian bawah website",UnifiedHomeContent:"Beranda",HomePage:"Pilihan divisi",AboutMergedPage:"Tentang kami",DivisionSubPage:"Halaman divisi",LaserCuttingPage:"Layanan",ProductsPage:"Katalog produk",ProductDetailPage:"Detail produk",ProjectsPage:"Galeri",KontakPage:"Kontak",QuotationPage:"Form penawaran",SocialHub:"Sosial media",SocialProof:"Ulasan & pemasok",ProjectAlbums:"Album proyek",Promotions:"Banner",HeroCarousel:"Hero",heroSlides:"Judul & deskripsi hero",divisionContent:"Profil divisi",divisionAbout:"Tentang divisi",companyIdentity:"Identitas & misi",serviceDescriptions:"Penjelasan layanan",InformasiPage:"Artikel",SearchPage:"Pencarian",CurrentDivision:"Teks profil saat ini",CurrentHero:"Teks hero saat ini",Custom:"Teks khusus"};
const pageAreas:Partial<Record<TextPage,string[]>>={home:["UnifiedHomeContent","HeroCarousel","heroSlides","CurrentHero","HomePage","SocialProof","Promotions","ContactDirectory","ProjectAlbums","clientPosters","promotions","EventCountdown","PhotoGalleryDialog","DivisionCollage","divisionLocations","serviceDescriptions"],about:["AboutMergedPage","divisionAbout","companyIdentity","DivisionVision","DivisionSubPage","DivisionSubPageAbout","DivisionCollage","PhotoGalleryDialog"],products:["ProductsPage","ProductDetailPage","ProductCard","ProductInventory","products","categories","DivisionSubPage","DivisionSubPageHero"],services:["LaserCuttingPage","serviceDescriptions","business","DivisionSubPage","DivisionSubPageHero","DivisionSubPageServices"],gallery:["ProjectsPage","ProjectAlbums","projectGallery","DivisionSubPage","DivisionSubPageHero","DivisionSubPageGallery"],contact:["KontakPage","ContactDirectory","DivisionLocation","divisionLocations","DivisionSubPage","DivisionSubPageHero"],social:["SocialHub","socialMedia"],articles:["InformasiPage","ArticleDetailPage","ShareArticle","articles"],quotation:["QuotationPage","RequestHandoff","QuotationDrawer","RequestPhotoInput"],search:["SearchPage","SearchOverlay"],legal:["Legal","page"],notfound:["NotFoundPage"]};
export function choicesForWebsite(catalog:WebsiteTextChoice[],division:Division|undefined,slides:HeroSlide[],custom:WebsiteText[],content?:SiteContent,directory:Division[]=[],articleChoices:OwnedWebsiteTextChoice[]=[],page:TextPage="all") {
  const choices=new Map<string,WebsiteTextChoice>();
  function add(source:unknown,area:string,areas:string[]=[],pages:TextPage[]=[]) {if(typeof source!=="string" || !source.trim())return;const text=normalizeWebsiteText(serviceWording(source));if(!text)return;const previous=choices.get(text);if(previous){previous.areas=[...new Set([...(previous.areas || [previous.area]),area,...areas])];if(pages.length)previous.pages=[...new Set([...(previous.pages||[]),...pages])];}else choices.set(text,{source:text,area,...(areas.length?{areas}: {}),...(pages.length?{pages}: {})});}
  for(const item of catalog)add(item.source,item.area,item.areas);
  for(const item of articleChoices)if(item.ownerDivision===(division?.slug || null))add(item.source,item.area,item.areas);
  for(const current of division ? [division] : directory) {
    for(const key of ["name","label"] as const)add(current[key],"divisionContent",["Navbar","Footer","FooterDivisions","UnifiedHomeContent","AboutMergedPage","DivisionSubPageHero","DivisionSubPageAbout","DivisionSubPageServices","DivisionSubPageGallery"]);
    add(current.area,"CurrentDivision",["UnifiedHomeContent"]);
    for(const key of ["title","intro"] as const)add(current[key],"CurrentDivision",["UnifiedHomeContent","DivisionSubPageHero"]);
    add(current.description,"CurrentDivision",["UnifiedHomeContent","AboutMergedPage","DivisionSubPageAbout","DivisionSubPageGallery"]);
    for(const value of [current.aboutHeadline,...current.values])add(value,"divisionAbout",["DivisionSubPageAbout"]);
    for(const value of [...current.offerings,...current.process,...Object.values(current.offeringDescriptions)])add(value,"serviceDescriptions",["UnifiedHomeContent","DivisionSubPageServices"]);
    for(const image of current.images)add(image.title,"CurrentDivision",["DivisionSubPageGallery","DivisionCollage"]);
    add(current.address,"divisionLocations",["UnifiedHomeContent","DivisionLocation","KontakPage"]);
    for(const faq of current.faq){add(faq.question,"serviceDescriptions",["UnifiedHomeContent"]);add(faq.answer,"serviceDescriptions",["UnifiedHomeContent"]);}
  }
  for(const slide of slides)for(const value of [slide.eyebrow,slide.title,slide.accent,slide.description,slide.primaryAction.label,slide.secondaryAction.label,slide.visualNote])add(value,"CurrentHero");
  for(const row of custom)add(row.source,"Custom",[],row.page==="all"?Object.keys(textPages).filter((page):page is TextPage=>page!=="all"): [row.page]);
  if(content) {
    const displayFields=new Set(['name','role','handle','title','label','eyebrow','accent','description','summary','excerpt','caption','intro','mission','aboutHeadline','values','process','text','action','headline','shortSpec','specifications','usages','category','benefit','terms','ctaLabel','question','answer','offerings','messages','visualNote']);
    function collect(value:unknown,area:string,field='') {
      if(typeof value==='string') {if(displayFields.has(field))add(value,area);return;}
      if(Array.isArray(value)) {for(const row of value)collect(row,area,field);return;}
      if(value && typeof value==='object')for(const [key,row] of Object.entries(value))collect(row,area,key);
    }
    const owner=division?.slug || null;
    for(const [key,area] of [['contacts','ContactDirectory'],['reviews','SocialProof'],['promotions','Promotions'],['socialPosts','SocialHub'],['socialAccounts','SocialHub'],['galleryProjects','ProjectAlbums'],['heroAnnouncements','HeroCarousel']] as const) {
      for(const row of content[key] || [])if(!owner || contentOwner(row)===owner)collect(row,area);
    }
    for(const item of content.inventory || [])if(item.product && (!owner || item.division===owner))collect(item.product,'ProductDetailPage');
  }
  return [...choices.values()];
}
Object.assign(textAreaNames,{products:'Isi produk',categories:'Kategori produk',ProductInventory:'Stok & penyedia produk',Legal:'Privasi & ketentuan',divisionLocations:'Alamat & lokasi',projectGallery:'Isi galeri',socialMedia:'Isi sosial media',articles:'Isi artikel',CurrentArticle:'Teks artikel saat ini',promotions:'Isi banner',clientPosters:'Isi poster',WhatsAppButton:'Tombol WhatsApp',FooterDivisions:'Daftar divisi di footer',WelcomePosters:'Poster pembuka',EventCountdown:'Countdown banner',PhotoGalleryDialog:'Pratinjau galeri',NotFoundPage:'Halaman tidak ditemukan',business:'Informasi layanan',DivisionSubPageHero:'Hero halaman divisi',DivisionSubPageAbout:'Tentang divisi',DivisionSubPageServices:'Layanan divisi',DivisionSubPageGallery:'Galeri divisi'});
export function choiceOnPage(choice:WebsiteTextChoice,page:TextPage,division?:Division) {
  return page==="all" || Boolean(choice.pages?.includes(page)) || (choice.areas || [choice.area]).some(area=>["Navbar","Footer","WelcomePosters","WhatsAppButton"].includes(area) || area==="FooterDivisions" && !division || area==="CurrentArticle" && page==="articles" || Boolean(pageAreas[page]?.includes(area)));
}
