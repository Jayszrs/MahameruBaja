"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import Image from "./CmsImage";
import type {PartnerLogo} from "../data/partnerLogos";
export default function LogoMarquee({logos,kind}:{logos:PartnerLogo[];kind:"client"|"supplier"}) {
  const root=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false),[hidden,setHidden]=useState(false);
  useEffect(()=>{
    const change=()=>setHidden(document.hidden);change();document.addEventListener("visibilitychange",change);
    const node=root.current;
    const observer=node&&"IntersectionObserver" in window?new IntersectionObserver(entries=>setVisible(entries.some(entry=>entry.isIntersecting)),{rootMargin:"100px"}):null;
    if(observer&&node)observer.observe(node);else setVisible(true);
    return()=>{observer?.disconnect();document.removeEventListener("visibilitychange",change);};
  },[]);
  if(!logos.length)return null;
  return <div className={`${kind==="supplier"?"supplier-logo-grid supplier-logo-ribbon":"home-client-logo-grid"} proof-marquee partner-logo-strip logo-marquee`} data-static-motion data-running={visible&&!hidden} ref={root} tabIndex={0} aria-label={`Logo ${kind==="supplier"?"supplier":"perusahaan rekanan"}, bergerak otomatis`}>
    <div className="logo-marquee-track" style={{"--logo-cycle":`${Math.max(24,logos.length*6)}s`} as CSSProperties}>{[0,1].map(copy=><div className="logo-marquee-group" key={copy} aria-hidden={copy===1}>{logos.map(logo=><figure className={kind==="client"?"home-client-logo":undefined} key={logo.id} data-partner-id={copy===0?logo.id:undefined} title={logo.name}><Image src={logo.logo} alt={copy===1?"":logo.name?`Logo ${logo.name}`:`Logo ${kind==="supplier"?"supplier sesuai company profile":"perusahaan rekanan"}`} width={260} height={150} sizes="(max-width:760px) 150px, 220px" loading="lazy" draggable={false}/></figure>)}</div>)}</div>
  </div>;
}
