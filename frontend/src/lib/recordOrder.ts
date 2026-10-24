import { z } from "zod";
import { CmsError } from "./cmsError";

export const recordOrderSchema = z.object({ items: z.array(z.object({ id: z.string().min(1).max(100), revision: z.number().int().nonnegative() })).max(2000) });
export type RecordOrder = z.infer<typeof recordOrderSchema>["items"];

export function applyManualOrder<T extends { id: string; revision: number; sortOrder?: number }>(current: T[], requested: RecordOrder, canEdit: (row: T) => boolean): T[] {
  const originals = new Map(current.map(row => [row.id, row]));
  if (new Set(requested.map(row => row.id)).size !== requested.length) throw new CmsError("Daftar urutan memuat data ganda.");
  for (const row of requested) {
    const original = originals.get(row.id);
    if (original && !canEdit(original)) throw new CmsError("Urutan ini memuat data divisi lain.", 403);
    if (!original || original.revision !== row.revision) throw new CmsError("Data telah berubah. Muat ulang sebelum menyimpan urutan.", 409);
  }
  if (requested.length !== current.filter(canEdit).length) throw new CmsError("Daftar telah berubah. Muat ulang sebelum menyimpan urutan.", 409);
  const existing = current.filter(canEdit);
  if (requested.every((row, index) => row.id === existing[index]?.id)) return current;
  const ordered = requested.map(row => originals.get(row.id)!);
  let index = 0;
  return current.map((row, position) => {
    if (!canEdit(row)) return row;
    const next = ordered[index++];
    return { ...next, sortOrder: position, revision: next.revision + 1 };
  });
}
