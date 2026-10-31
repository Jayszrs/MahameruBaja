export type AdminNavItem = { label: string; href: string };
export type AdminNavGroup = { id: string; label: string; number: string; path: string; items: AdminNavItem[] };
export const adminNavigation: AdminNavGroup[] = [
  { id:"home", number:"01", label:"Beranda", path:"/admin/halaman/beranda", items:[
    {label:"Urutan bagian Beranda",href:"/admin/halaman/beranda"}, {label:"Hero / gambar pembuka",href:"/admin/hero"}, {label:"Promo dan penawaran",href:"/admin/promosi?view=all"}, {label:"Cara pesan",href:"/admin/tampilan?section=orderSteps"}, {label:"Quote / kata mutiara",href:"/admin/tampilan?section=quotes"}, {label:"5 layanan kebutuhan baja",href:"/admin/divisi"}, {label:"Quick FAQ — kebutuhan Anda",href:"/admin/tampilan?section=needs"},
  ]},
  { id:"about", number:"02", label:"Tentang Kami", path:"/admin/halaman/tentang", items:[{label:"Urutan bagian Tentang Kami",href:"/admin/halaman/tentang"},{label:"Hero / gambar pembuka",href:"/admin/tampilan?section=about"},{label:"Profil, visi & misi divisi",href:"/admin/divisi?from=tentang"}]},
  { id:"products", number:"03", label:"Produk", path:"/admin/produk", items:[{label:"Urutan bagian Produk",href:"/admin/halaman/produk"},{label:"Kartu produk, foto & stok",href:"/admin/produk"}]},
  { id:"services", number:"04", label:"Jasa", path:"/admin/jasa", items:[{label:"Urutan bagian Jasa",href:"/admin/halaman/jasa"},{label:"Apa yang bisa kami bantu?",href:"/admin/jasa?section=servicePaths"},{label:"Detail jasa & foto",href:"/admin/jasa?section=services"},{label:"Jelajahi desain / referensi",href:"/admin/galeri?kind=design"},{label:"Alur pekerjaan jasa",href:"/admin/jasa?section=serviceWorkflow"}]},
  { id:"projects", number:"05", label:"Proyek", path:"/admin/halaman/proyek", items:[{label:"Urutan bagian Proyek",href:"/admin/halaman/proyek"},{label:"Album hasil pekerjaan",href:"/admin/galeri?kind=portfolio"}]},
  { id:"gallery", number:"06", label:"Galeri", path:"/admin/halaman/galeri", items:[{label:"Urutan bagian Galeri",href:"/admin/halaman/galeri"},{label:"Album kegiatan Mahameru",href:"/admin/galeri?kind=activity"},{label:"Kelola seluruh album",href:"/admin/galeri"}]},
  { id:"articles", number:"07", label:"Artikel", path:"/admin/artikel", items:[{label:"Urutan bagian Artikel",href:"/admin/halaman/artikel"},{label:"Semua artikel",href:"/admin/artikel?status=all"}]},
  { id:"contact", number:"08", label:"Kontak", path:"/admin/halaman/kontak", items:[{label:"Urutan bagian Kontak",href:"/admin/halaman/kontak"},{label:"Pembagian sales & email",href:"/admin/konten?tab=contacts"},{label:"Ulasan pelanggan Google",href:"/admin/konten?tab=reviews"}]},
  { id:"social", number:"09", label:"Sosial Media", path:"/admin/sosial", items:[{label:"Urutan bagian Sosial Media",href:"/admin/halaman/sosial"},{label:"Akun sosial",href:"/admin/sosial?tab=accounts"},{label:"Unggahan foto / video",href:"/admin/sosial?tab=posts"}]},
  { id:"shared", number:"10", label:"Header, footer & popup", path:"/admin/tampilan", items:[{label:"Popup iklan saat masuk",href:"/admin/promosi?view=popup"},{label:"Logo header & foto footer",href:"/admin/tampilan?section=identity"},{label:"Member of — ISSC / APPI",href:"/admin/tampilan?section=memberships"},{label:"Footer — profil & alamat divisi",href:"/admin/divisi?from=footer"},{label:"Footer — kontak sales",href:"/admin/konten?tab=contacts&from=footer"},{label:"Foto latar beranda",href:"/admin/tampilan?section=backgrounds"},{label:"Seluruh pengaturan tampilan",href:"/admin/tampilan"},{label:"Judul & teks per halaman",href:"/admin/teks"},{label:"Logo supplier",href:"/admin/mitra?tab=suppliers"},{label:"Logo perusahaan rekanan",href:"/admin/mitra?tab=clients"}]},
  { id:"sales", number:"11", label:"Pesanan pelanggan", path:"/admin/permintaan", items:[{label:"Permintaan aktif",href:"/admin/permintaan?view=active"},{label:"Arsip",href:"/admin/permintaan?view=archived"}]},
];
export function activeAdminNavigation(pathname: string, search: URLSearchParams) {
  const candidates = adminNavigation.flatMap(group => group.items.map(item => ({group,item,url:new URL(item.href,"https://admin.local")})))
    .filter(({url}) => url.pathname === pathname && [...url.searchParams].every(([key,value]) => search.get(key) === value))
    .sort((a,b) => b.url.searchParams.size-a.url.searchParams.size);
  const match = candidates[0];
  const group = match?.group || adminNavigation.find(group=>group.path===pathname);
  return {group,item:match?.item};
}
