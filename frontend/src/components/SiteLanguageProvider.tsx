"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
type Language = "id" | "en" | "zh-CN";
type LanguageState = { language:Language; change:(language:Language)=>void; status:string; busy:boolean; enabled:boolean };
const Context = createContext<LanguageState>({language:"id",change:()=>{},status:"",busy:false,enabled:false});
export const useSiteLanguage = () => useContext(Context);
const excluded = "script,style,svg,code,pre,textarea,[contenteditable],.site-language,.request-handoff,.quote-success,[data-no-translate]";
function segments(text:string){const parts:string[]=[];for(let offset=0;offset<text.length;){let end=Math.min(offset+3000,text.length);if(end<text.length){const space=text.lastIndexOf(" ",end);if(space>offset+1500)end=space;}parts.push(text.slice(offset,end));offset=end;}return parts;}
export default function SiteLanguageProvider({ children, enabled=false }: { children:ReactNode; enabled?:boolean }) {
 const pathname=usePathname(); const [language,setLanguage]=useState<Language>("id"); const [status,setStatus]=useState(""); const [busy,setBusy]=useState(false);
 const originals=useRef(new WeakMap<Text,{source:string;rendered:string}>());
 const attributes=useRef(new WeakMap<Element,Map<string,{source:string;rendered:string}>>());
 const cache=useRef(new Map<string,string>());
 useEffect(()=>{if(!enabled)return;try {const saved=localStorage.getItem("mbi-language");if(saved==="en"||saved==="zh-CN")setLanguage(saved);}catch{}},[enabled]);
 useEffect(()=>{
  if(pathname.startsWith("/admin"))return;
  if(language==="id")document.documentElement.lang="id";
  let alive=true,running=false,dirty=false,failed=false;let timer:ReturnType<typeof setTimeout>;
  const controller=new AbortController();
  const root=document.querySelector(".public-site");if(!root)return;
  type Slot={source:string;write:(value:string)=>void};
  async function scan(){
   if(running){dirty=true;return;} if(failed||!alive)return; running=true;dirty=false;
   const slots:Slot[]=[];
   const walker=document.createTreeWalker(root!,NodeFilter.SHOW_TEXT);
   while(walker.nextNode()){
    const node=walker.currentNode as Text; if(!node.parentElement||node.parentElement.closest(excluded)||!node.data.trim())continue;
    let record=originals.current.get(node);
    if(!record||node.data!==record.rendered) {record={source:node.data,rendered:node.data};originals.current.set(node,record);}
    const current=record; if(!/[\p{L}]/u.test(current.source))continue;
    slots.push({source:current.source.trim(),write:value=>{const next=current.source.replace(current.source.trim(),value);if(node.data!==next)node.data=next;current.rendered=next;}});
   }
   root!.querySelectorAll("[placeholder],[title],[aria-label],img[alt]").forEach(node=>{
    if(node.closest(excluded)||node.matches("input[type=hidden]"))return;
    let records=attributes.current.get(node);if(!records){records=new Map();attributes.current.set(node,records);}
    for(const name of ["placeholder","title","aria-label","alt"]){const value=node.getAttribute(name);if(!value?.trim())continue;
     let record=records.get(name);if(!record||value!==record.rendered){record={source:value,rendered:value};records.set(name,record);}
     const current=record;slots.push({source:current.source.trim(),write:next=>{if(node.getAttribute(name)!==next)node.setAttribute(name,next);current.rendered=next;}});
    }
   });
   try {
    if(language==="id"){slots.forEach(slot=>slot.write(slot.source));setStatus("");return;}
    const missing=[...new Set(slots.flatMap(slot=>segments(slot.source)).map(text=>text.trim()).filter(Boolean))].filter(text=>!cache.current.has(`${language}:${text}`));
    if(missing.length){setBusy(true);setStatus("Menerjemahkan halaman…");}
    for(let offset=0;offset<missing.length;){
     const batch:string[]=[];let size=0;while(offset<missing.length&&batch.length<60&&size+missing[offset].length<=12000){const value=missing[offset++];batch.push(value);size+=value.length;}
     if(!batch.length){offset++;continue;}
     const response=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({language,texts:batch}),signal:controller.signal});
     const data=await response.json();if(!response.ok)throw new Error(data.message||"Terjemahan belum tersedia. Coba lagi nanti.");
     batch.forEach((source,index)=>cache.current.set(`${language}:${source}`,data.translations[index]));
    }
    if(alive){slots.forEach(slot=>slot.write(segments(slot.source).map(part=>part.replace(part.trim(),cache.current.get(`${language}:${part.trim()}`)||part.trim())).join("")));document.documentElement.lang=language;setStatus(language==="en"?"Translated by Google":"由 Google 翻译");}
   }catch(error){if(alive&&!controller.signal.aborted){failed=true;setStatus(error instanceof Error?error.message:"Terjemahan belum tersedia.");}}
   finally{running=false;if(alive)setBusy(false);if(dirty&&alive&&!failed)schedule();}
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(()=>void scan(),160);}
  const observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","aria-label","alt"]});void scan();
  return()=>{alive=false;controller.abort();clearTimeout(timer);observer.disconnect();};
 },[language,pathname]);
 function change(next:Language){setStatus("");setLanguage(next);try{localStorage.setItem("mbi-language",next);}catch{}}
 return <Context.Provider value={{language,change,status,busy,enabled}}>{children}{!pathname.startsWith("/admin")&&status&&<div className="site-translation-status" role="status" data-no-translate>{status}<button type="button" onClick={()=>change("id")} aria-label="Kembali ke Bahasa Indonesia">ID</button></div>}</Context.Provider>;
}
