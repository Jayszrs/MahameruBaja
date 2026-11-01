export type OrderStepDestination = { value:string; label:string; group:string };

const mainDestinations:Omit<OrderStepDestination,"group">[]=[
  {value:"/",label:"Beranda"},
  {value:"/#profil",label:"Beranda > Mengenal Mahameru Group"},
  {value:"/#alur-jasa",label:"Beranda > Alur Jasa"},
  {value:"/#cara-pesan",label:"Beranda > Cara Pesan"},
  {value:"/#pilih-divisi",label:"Beranda > Pilih divisi"},
  {value:"/tentang-kami",label:"Tentang Kami"},
  {value:"/produk",label:"Produk"},
  {value:"/jasa",label:"Jasa"},
  {value:"/jasa#request",label:"Jasa > Form penawaran"},
  {value:"/proyek",label:"Galeri proyek"},
  {value:"/informasi",label:"Artikel"},
  {value:"/kontak",label:"Kontak"},
  {value:"/minta-penawaran",label:"Form penawaran"},
  {value:"/sosial-media",label:"Sosial media"},
];

export function orderStepDestinations(owner:string|null, divisions:{slug:string;name:string}[]):OrderStepDestination[]{
  const groups:OrderStepDestination[]=[];
  if(!owner)groups.push(...mainDestinations.map(item=>({...item,group:"Website utama"})));
  for(const division of divisions.filter(item=>!owner||item.slug===owner)){
    const base=`/unit/${division.slug}`;
    const quote=`/minta-penawaran?unit=${division.slug}`;
    groups.push(
      {group:division.name,value:base,label:"Beranda"},
      {group:division.name,value:`${base}#profil`,label:"Beranda > Profil divisi"},
      {group:division.name,value:`${base}#alur-jasa`,label:"Beranda > Alur jasa"},
      {group:division.name,value:`${base}#cara-pesan`,label:"Beranda > Cara pesan"},
      {group:division.name,value:`${base}/tentang`,label:"Tentang divisi"},
      {group:division.name,value:`${base}/produk`,label:"Produk"},
      {group:division.name,value:`${base}/layanan`,label:"Layanan"},
      {group:division.name,value:`${base}/galeri`,label:"Galeri"},
      {group:division.name,value:`${base}/kontak`,label:"Kontak"},
      {group:division.name,value:quote,label:"Form penawaran"},
    );
  }
  return groups;
}
