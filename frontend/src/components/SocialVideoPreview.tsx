"use client";
import { useEffect, useRef } from "react";

export default function SocialVideoPreview({src,poster,title}:{src:string;poster?:string;title:string}) {
  const video=useRef<HTMLVideoElement>(null);
  useEffect(()=>{
    const element=video.current;
    if(!element)return;
    const stop=()=>{element.pause();if(document.pictureInPictureElement===element)void document.exitPictureInPicture().catch(()=>{});};
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.target===element&&entry.intersectionRatio<0.2))stop();},{threshold:[0,0.2]});
    observer.observe(element);
    return ()=>{observer.disconnect();stop();};
  },[src]);
  return <video ref={video} className="editor-social-preview" src={src} poster={poster||undefined} controls playsInline preload="metadata" disablePictureInPicture aria-label={title}><a href={src}>Buka video asli</a></video>;
}
