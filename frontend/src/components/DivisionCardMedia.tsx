"use client";
import {useEffect,useRef,useState} from "react";
import Image from "./CmsImage";
import type {Division} from "../data/divisionCms";
export default function DivisionCardMedia({media,fallback,alt}:{media:Division["routeMedia"];fallback:string;alt:string}) {
  const root=useRef<HTMLDivElement>(null),player=useRef<HTMLVideoElement>(null);
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false);
  const video=media?.type==="video"&&media.media;
  useEffect(()=>{
    if(!video)return;
    const node=root.current;if(!node)return;
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection=(navigator as Navigator&{connection?:EventTarget&{saveData?:boolean}}).connection;
    let visible=false;
    const sync=()=>{
      const allowed=visible&&!document.hidden&&!reduce.matches&&!connection?.saveData;
      setReady(allowed);
      if(allowed)void player.current?.play().catch(()=>{});else player.current?.pause();
    };
    const observer="IntersectionObserver" in window?new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);sync();}):null;
    observer?.observe(node);
    document.addEventListener("visibilitychange",sync);reduce.addEventListener("change",sync);connection?.addEventListener("change",sync);
    return()=>{observer?.disconnect();document.removeEventListener("visibilitychange",sync);reduce.removeEventListener("change",sync);connection?.removeEventListener("change",sync);player.current?.pause();};
  },[video]);
  const cover=media?.type==="image"&&media.media?media.media:media?.poster||fallback;
  return <div ref={root} className="home-route-media"><Image src={cover} alt={alt} fill sizes="(max-width:760px) 100vw, (max-width:1500px) 50vw, 860px"/>{video&&ready&&!failed&&<video ref={player} src={video} poster={cover} muted autoPlay playsInline loop preload="none" aria-hidden="true" onError={()=>setFailed(true)}/>}</div>;
}
