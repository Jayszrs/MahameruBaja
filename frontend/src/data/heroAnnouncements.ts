import { z } from "zod";
import { contentOwner, ownershipFields } from "./divisionCms";

export const heroAnnouncementSchema = z.object({
  ...ownershipFields,
  id:z.string().trim().min(1).max(80),
  messages:z.array(z.string().trim().min(1).max(160)).max(12),
  published:z.boolean(),
});
export type HeroAnnouncement = z.infer<typeof heroAnnouncementSchema>;
export const defaultAnnouncements = ["Besi & baja untuk kebutuhan bangunan Anda", "Kirim daftar material, kami bantu cek stok & harga", "Laser cutting, bending & fabrikasi sesuai kebutuhan"];
export function heroAnnouncementMessages(rows:HeroAnnouncement[], slug?:string, offerings:string[] = []) {
  const row=rows.find(item=>contentOwner(item)===(slug || null));
  if (row) return row.published ? row.messages : [];
  return slug ? [...offerings.slice(0,4), "Tanyakan pilihan, harga & jadwal kepada tim divisi"] : defaultAnnouncements;
}
