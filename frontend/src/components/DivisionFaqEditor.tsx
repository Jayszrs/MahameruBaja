"use client";
import { useState } from "react";
import type { Division } from "../data/divisionCms";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import { useAdminWorkspace } from "./AdminWorkspace";

export default function DivisionFaqEditor({ initialDivision }: { initialDivision: Division }) {
  const [division,setDivision]=useState(initialDivision);
  const [faqHeading,setFaqHeading]=useState(initialDivision.faqHeading || "Pertanyaan laser cutting & bending.");
  const [faq,setFaq]=useState(initialDivision.faq);
  const [dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [failed,setFailed]=useState(false);
  const changeHeading=(value:string)=>{setFaqHeading(value);setDirty(true);setMessage("");};
  const changeFaq=(next:Division["faq"])=>{setFaq(next);setDirty(true);setMessage("");};
  async function save(){
    if(busy||!dirty)return;
    setBusy(true);setFailed(false);setMessage("");
    try{
      const response=await fetch(`/api/admin/divisions/${division.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...division,faqHeading,faq,revision:division.revision})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.message||"Pertanyaan belum tersimpan.");
      setDivision(result);setFaqHeading(result.faqHeading);setFaq(result.faq);setDirty(false);setMessage("Pertanyaan unit tersimpan.");workspace.refreshDashboard();
    }catch(error){setFailed(true);setMessage((error as Error).message);}finally{setBusy(false);}
  }
  const workspace=useAdminWorkspace({dirty,busy,label:"Simpan section",disabled:!dirty,onSave:save});
  return <div className="division-faq-editor">
    {message&&<p className={`editor-notice ${failed?"error":"success"}`} role={failed?"alert":"status"}>{message}</p>}
    <section className="editor-panel"><label className="editor-field">Heading section<input maxLength={250} value={faqHeading} onChange={event=>changeHeading(event.target.value)}/></label></section>
    <div className="editor-list-heading"><h3>Pertanyaan dan jawaban</h3><button type="button" className="admin-primary" disabled={busy||faq.length>=30} onClick={()=>changeFaq([...faq,{question:"Pertanyaan baru",answer:""}])}>+ Tambah pertanyaan</button></div>
    <AdminOrderList label="Urutan pertanyaan" disabled={busy} items={faq.map((item,index)=>({id:String(index),title:item.question||`Pertanyaan ${index+1}`,detail:item.answer}))} onMove={(from,to)=>changeFaq(moveBefore(faq.map((item,index)=>({...item,id:String(index)})),from,to).map(({id:_,...item})=>item))}/>
    {faq.map((item,index)=><section className="editor-panel" key={index}><div className="editor-panel-title"><h3>{index+1}. {item.question||"Pertanyaan baru"}</h3><button type="button" className="admin-danger" onClick={()=>changeFaq(faq.filter((_,itemIndex)=>itemIndex!==index))}>Hapus</button></div><label className="editor-field">Pertanyaan<input maxLength={300} value={item.question} onChange={event=>changeFaq(faq.map((value,itemIndex)=>itemIndex===index?{...value,question:event.target.value}:value))}/></label><label className="editor-field">Jawaban<textarea rows={4} maxLength={2000} value={item.answer} onChange={event=>changeFaq(faq.map((value,itemIndex)=>itemIndex===index?{...value,answer:event.target.value}:value))}/></label></section>)}
  </div>;
}
