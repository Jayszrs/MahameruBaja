export type AdminNavItem = { label: string; href: string };
export type AdminNavGroup = { id: string; label: string; number: string; path: string; items: AdminNavItem[] };
export const adminNavigation: AdminNavGroup[] = [
  { id: "sales", number: "01", label: "Pesanan pelanggan", path: "/admin/permintaan", items: [
    { label: "Permintaan aktif", href: "/admin/permintaan?view=active" }, { label: "Arsip", href: "/admin/permintaan?view=archived" },
  ] },
  { id: "content", number: "02", label: "Isi website", path: "/admin/konten", items: [
    { label: "Profil divisi", href: "/admin/divisi" }, { label: "Kontak & divisi", href: "/admin/konten?tab=contacts" }, { label: "Ulasan Google", href: "/admin/konten?tab=reviews" },
    { label: "Produk & stok", href: "/admin/produk" },
    { label: "Teks website", href: "/admin/teks" },
  ] },
  { id: "social", number: "03", label: "Sosial media", path: "/admin/sosial", items: [
    { label: "Akun sosial", href: "/admin/sosial?tab=accounts" }, { label: "Unggahan sosial", href: "/admin/sosial?tab=posts" },
  ] },
  { id: "home", number: "04", label: "Beranda", path: "/admin/promosi", items: [
    { label: "Banner & poster", href: "/admin/promosi?view=all" }, { label: "Sedang tayang", href: "/admin/promosi?view=live" }, { label: "Draf", href: "/admin/promosi?view=draft" },
    { label: "Hero beranda", href: "/admin/hero" }, { label: "Galeri & proyek", href: "/admin/galeri" },
    { label: "Poster saat masuk", href: "/admin/promosi?view=popup" },
  ] },
  { id: "articles", number: "05", label: "Artikel", path: "/admin/artikel", items: [
    { label: "Semua artikel", href: "/admin/artikel?status=all" }, { label: "Draf", href: "/admin/artikel?status=draft" }, { label: "Terbit", href: "/admin/artikel?status=published" },
  ] },
];
export function activeAdminNavigation(pathname: string, search: URLSearchParams) {
  const group = adminNavigation.find(item => item.path === pathname || item.items.some(child => new URL(child.href, "https://admin.local").pathname === pathname));
  const key = group?.id === "content" || group?.id === "social" ? "tab" : group?.id === "articles" ? "status" : "view";
  const candidates = group?.items.filter(child => new URL(child.href, "https://admin.local").pathname === pathname);
  const item = candidates?.find(child => new URL(child.href, "https://admin.local").searchParams.size === 0) || candidates?.find(child => new URL(child.href, "https://admin.local").searchParams.get(key) === search.get(key)) || candidates?.[0];
  return { group, item };
}
