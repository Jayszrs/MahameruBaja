"use client";
import { useEffect, useRef } from "react";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import { contentOwner, type ContentOwnership as Ownership } from "../data/divisionCms";
export default function ContentOwnership({ value, onChange, showAudience = true }: { value: Ownership & { division?: string; divisions?: string[] }; onChange: (patch: Ownership) => void; showAudience?: boolean }) {
  const actor = useAdminIdentity(); const { divisions } = useDivisionDirectory();
  const displayMenu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!displayMenu.current?.contains(event.target))displayMenu.current?.removeAttribute("open");};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"&&displayMenu.current?.open){displayMenu.current.removeAttribute("open");displayMenu.current.querySelector("summary")?.focus();}};
    document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
  },[]);
  if(actor.division) return <p className="admin-owner-note">Milik {divisions.find(d=>d.slug===actor.division)?.name || actor.division} · Dikelola oleh divisi Anda</p>;
  const automatic=value.audience===undefined;
  return <div className={`admin-ownership${showAudience?"":" admin-ownership-owner-only"}`}><label className="editor-field">Dikelola oleh<select value={contentOwner(value) || ""} onChange={e=>onChange({ownerDivision:e.target.value || null})}><option value="">Pusat · Konten bersama</option>{divisions.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select><small>Pemilik menentukan tim yang dapat mengedit konten ini.</small></label>{showAudience&&<details ref={displayMenu} className="admin-ownership-display"><summary>Website yang menampilkan konten</summary><div className="admin-ownership-popover"><p>Pemilik konten mengatur siapa yang mengedit. Pengaturan ini menentukan website divisi tempat konten terlihat.</p><label className="admin-audience-mode"><span>Atur penayangan</span><select aria-label="Atur penayangan konten" value={automatic?"automatic":"selected"} onChange={e=>onChange({audience:e.target.value==="automatic"?undefined:[]})}><option value="automatic">Otomatis mengikuti aturan konten</option><option value="selected">Pilih website divisi</option></select></label><small className="admin-audience-help">Otomatis memakai aturan penayangan yang berlaku untuk konten ini. Pilih website secara manual untuk menentukan tempat tampilnya sendiri.</small>{!automatic&&<div className="admin-ownership-options">{divisions.map(d=><label key={d.slug}><input type="checkbox" checked={value.audience?.includes(d.slug) || false} onChange={e=>onChange({audience:e.target.checked ? [...(value.audience || []),d.slug] : value.audience?.filter(slug=>slug!==d.slug)})} />{d.name}</label>)}</div>}</div></details>}</div>;
}
