"use client";
import { useEffect, useRef, useState } from "react";
export default function SocialEmbed({ src, title }: { src: string; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loaded,setLoaded]=useState(false);
  useEffect(() => {
    const node = container.current; if (!node || ready) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin:"150px" });
    observer.observe(node); return () => observer.disconnect();
  }, [ready]);
  return <div className={`social-embed-container${loaded?" is-loaded":""}`} ref={container}>{ready ? <><iframe className="social-single-frame" src={src} title={title} loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" onLoad={()=>setLoaded(true)}/>{!loaded&&<p className="social-embed-loading" role="status"><i aria-hidden="true"/>Memuat pratinjau unggahan…</p>}</> : <button type="button" className="social-load-embed" onClick={() => setReady(true)}>Muat unggahan<span>{title}</span></button>}</div>;
}
