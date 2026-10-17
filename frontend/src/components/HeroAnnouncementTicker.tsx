"use client";
import { useEffect, useState, type CSSProperties } from "react";

export default function HeroAnnouncementTicker({ messages }: { messages:string[] }) {
  const [paused,setPaused]=useState(false);
  const [hidden,setHidden]=useState(false);
  useEffect(()=>{const update=()=>setHidden(document.hidden);update();document.addEventListener("visibilitychange",update);return()=>document.removeEventListener("visibilitychange",update);},[]);
  const items=messages.map(message=>message.trim()).filter(Boolean);
  if (!items.length) return null;
  const duration=Math.max(24,Math.min(90,items.join("").length / 5));
  return <div className={`hero-announcement${paused || hidden?" is-paused":""}`} aria-label="Info material, layanan dan promo">
    <div className="hero-announcement-track" style={{"--announcement-duration":`${duration}s`} as CSSProperties}>
      {[0,1].map(copy=><div className="hero-announcement-group" aria-hidden={copy===1?true:undefined} key={copy}>{items.map((message,index)=><span key={index}><i aria-hidden="true"/>{message}</span>)}</div>)}
    </div>
    <button className="carousel-keyboard-control" type="button" aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?"Lanjutkan teks berjalan":"Hentikan teks berjalan"}</button>
  </div>;
}
