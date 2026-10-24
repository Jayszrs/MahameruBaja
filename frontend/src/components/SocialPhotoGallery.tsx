"use client";
import {useRef,useState} from "react";
import Image from "./CmsImage";
import type {SocialPhoto} from "../data/instagramArchive";
export default function SocialPhotoGallery({photos,title,url,first=0}:{photos:SocialPhoto[];title:string;url:string;first?:number}) {
  const [active,setActive]=useState(first),[failed,setFailed]=useState(false);
  const touch=useRef<number|null>(null),swiped=useRef(false);
  if(!photos.length)return null;
  const photo=photos[active%photos.length],frame=photo.frame;
  function step(by:number){setFailed(false);setActive(value=>(value+by+photos.length)%photos.length);}
  const size=frame?{aspectRatio:`${frame.width} / ${frame.height}`}:{aspectRatio:`${photo.width} / ${photo.height}`};
  const crop=frame?{width:`${photo.width/frame.width*100}%`,height:`${photo.height/frame.height*100}%`,left:`${-frame.left/frame.width*100}%`,top:`${-frame.top/frame.height*100}%`,right:"auto",bottom:"auto",maxWidth:"none"}:undefined;
  return <div className="social-photo-gallery" onPointerDown={event=>{if(event.pointerType==="touch"){touch.current=event.clientX;swiped.current=false;}}} onPointerUp={event=>{if(touch.current!==null&&photos.length>1&&Math.abs(event.clientX-touch.current)>40){step(event.clientX<touch.current?1:-1);swiped.current=true;}touch.current=null;}} onPointerCancel={()=>{touch.current=null;swiped.current=false;}} onClickCapture={event=>{if(swiped.current){event.preventDefault();event.stopPropagation();swiped.current=false;}}}>
    <a className="social-image-preview" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Lihat ${title} di Instagram`} style={size}>
      {failed?<span className="social-photo-failure">Foto belum berhasil dimuat. Buka unggahan asli.</span>:<span className="social-photo-crop" style={{position:"absolute",inset:0,...crop}}><Image key={photo.src} src={photo.src} alt={`${title}${photos.length>1?`, foto ${active+1}`:""}`} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" onError={()=>setFailed(true)}/></span>}
    </a>
    {photos.length>1&&<nav className="social-photo-controls" aria-label={`Pilihan foto ${title}`}><button type="button" onClick={()=>step(-1)}>Foto sebelumnya</button><span aria-live="polite">{active+1} / {photos.length}</span><button type="button" onClick={()=>step(1)}>Foto berikutnya</button></nav>}
  </div>;
}
