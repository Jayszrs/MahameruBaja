"use client";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import { contentOwner, type ContentOwnership as Ownership } from "../data/divisionCms";
export default function ContentOwnership({ value, onChange, showAudience = true }: { value: Ownership & { division?: string; divisions?: string[] }; onChange: (patch: Ownership) => void; showAudience?: boolean }) {
  const actor = useAdminIdentity(); const { divisions } = useDivisionDirectory();
  if(actor.division) return <p className="admin-owner-note">Milik {divisions.find(d=>d.slug===actor.division)?.name || actor.division} · Dikelola oleh divisi Anda</p>;
  const selected = value.audience ?? (contentOwner(value) ? [contentOwner(value)!] : ["main"]);
  const toggle = (site: string, checked: boolean) => onChange({ audience: checked ? [...new Set([...selected, site])] : selected.filter(item => item !== site) });
  return <div className={`admin-ownership${showAudience?"":" admin-ownership-owner-only"}`}><label className="editor-field">Dikelola oleh<select value={contentOwner(value) || ""} onChange={e=>onChange({ownerDivision:e.target.value || null})}><option value="">Pusat · Konten bersama</option>{divisions.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>{showAudience&&<fieldset className="admin-ownership-options"><legend>Tampilkan di website</legend><label><input type="checkbox" checked={selected.includes("main")} onChange={e=>toggle("main",e.target.checked)} />Website utama · Mahameru Baja</label>{divisions.map(d=><label key={d.slug}><input type="checkbox" checked={selected.includes(d.slug)} onChange={e=>toggle(d.slug,e.target.checked)} />{d.name}</label>)}</fieldset>}</div>;
}
