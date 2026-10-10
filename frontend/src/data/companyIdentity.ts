// Sumber: Sheet1 H10:J28, B30:B50, L10:Q18 — pembaruan klien 10 Oktober 2026.
export const groupVision = "Menjadi perusahaan baja dan konstruksi yang terpercaya, terintegrasi, profesional, dan terus berkembang dengan memberikan solusi terbaik dari penyediaan material hingga fabrikasi dan erection.";
export const groupMotto = "Dari Material, Cutting, Trading, Fabrikasi sampai Erection — Satu Mahameru, Satu Solusi.";
export const divisionIdentity: Record<string, { logo: string; mission: string; admins: { name: string; phone: string }[] }> = {
  "retail-tambun": { logo: "/images/brand/mahameru-retail.png", mission: "Menyediakan kebutuhan besi dan material konstruksi berkualitas dengan harga kompetitif serta pelayanan cepat dan terpercaya kepada konsumen.", admins: [{ name: "Tikno", phone: "0812 1805 2017" }, { name: "Nuri", phone: "081 3333 1042" }] },
  "retail-cibitung": { logo: "/images/brand/garuda.png", mission: "Mengembangkan jaringan retail material konstruksi yang dekat dengan konsumen dan menjadi pilihan utama masyarakat dalam memenuhi kebutuhan pembangunan.", admins: [{ name: "Anas", phone: "0812 8707 2023" }, { name: "Nuri", phone: "081 3333 1042" }] },
  "laser-cutting": { logo: "/images/brand/mbi-laser.png", mission: "Memberikan jasa laser cutting dan bending CNC yang presisi, cepat, dan berkualitas untuk memenuhi kebutuhan industri, kontraktor, dan proyek.", admins: [{ name: "Sony", phone: "0813 560 1981" }, { name: "Wahyu", phone: "0822 9993 4001" }] },
  "trading-proyek": { logo: "/images/brand/mbi-trading.png", mission: "Menjadi pusat perdagangan dan pengadaan material proyek yang mampu menyediakan kebutuhan proyek secara tepat jenis, jumlah, kualitas, harga, dan waktu pengiriman.", admins: [{ name: "Putri", phone: "0822 9880 7341" }, { name: "Andra", phone: "081 3333 1041" }] },
  "fabrikasi-erection": { logo: "/images/brand/mbi-proyek.png", mission: "Menyediakan pekerjaan fabrikasi dan erection yang profesional, presisi, aman, dan sesuai standar proyek, mulai dari proses produksi hingga pemasangan di lapangan.", admins: [{ name: "Andi", phone: "0812 8255 1985" }, { name: "Andra", phone: "081 3333 1041" }] },
};
export const mainLogo = divisionIdentity["laser-cutting"].logo;
export const tradingProducts = ["Besi WF", "Besi H-Beam", "Plat", "Siku Besi", "Besi Beton KS", "Canal UNP", "Canal CNP", "Baja Ringan Kepuh", "Atap UPVC Single Layer", "Atap UPVC Double Layer", "Genteng UPVC"];
export function divisionWhatsApp(slug: string, name?: string) {
  const admins = divisionIdentity[slug]?.admins || divisionIdentity["laser-cutting"].admins;
  const admin = admins.find(a => a.name === name) || admins[0];
  return `https://wa.me/62${admin.phone.replace(/\D/g, "").replace(/^0/, "")}`;
}
