export const unitSections = ["tentang", "layanan", "produk", "galeri", "kontak"] as const;
export type UnitSection = typeof unitSections[number];
export const unitSectionLabels: Record<UnitSection, string> = { tentang: "Tentang Kami", layanan: "Layanan", produk: "Produk", galeri: "Galeri", kontak: "Kontak" };
