"use client";
import { useEffect, useRef } from "react";
import { useAdminIdentity } from "./AdminIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";
import { contentOwner, type ContentOwnership as Ownership } from "../data/divisionCms";
export default function ContentOwnership({ value, onChange }: { value: Ownership & { division?: string; divisions?: string[] }; onChange: (patch: Ownership) => void }) {
  const actor = useAdminIdentity(); const { divisions } = useDivisionDirectory();
  const displayMenu=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!displayMenu.current?.contains(event.target))displayMenu.current?.removeAttribute("open");};
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"&&displayMenu.current?.open){displayMenu.current.removeAttribute("open");displayMenu.current.querySelector("summary")?.focus();}};
    document.addEventListener("pointerdown",outside);document.addEventListener("keydown",escape);
    return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",escape);};
  },[]);
  if(actor.division) return <p className="admin-owner-note">Milik {divisions.find(d=>d.slug===actor.division)?.name || actor.division} · Dikelola oleh divisi Anda</p>;
  return <div className="admin-ownership"><label className="editor-field">Pemilik konten<select value={contentOwner(value) || ""} onChange={e=>onChange({ownerDivision:e.target.value || null})}><option value="">Pusat · Konten bersama</option>{divisions.map(d=><option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label><details ref={displayMenu} className="admin-ownership-display"><summary>Penayangan pada divisi</summary><div className="admin-ownership-popover"><p>Pemilik konten tetap dapat menyunting. Pengaturan ini memilih website divisi tempat konten ikut tampil.</p><div className="admin-ownership-options"><label><input type="checkbox" checked={value.audience === undefined} onChange={e=>onChange({audience:e.target.checked ? undefined : []})} />Ikuti penayangan bawaan</label>{value.audience !== undefined && divisions.map(d=><label key={d.slug}><input type="checkbox" checked={value.audience?.includes(d.slug) || false} onChange={e=>onChange({audience:e.target.checked ? [...(value.audience || []),d.slug] : value.audience?.filter(slug=>slug!==d.slug)})} />{d.name}</label>)}</div></div></details></div>;
}
