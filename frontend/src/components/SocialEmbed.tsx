"use client";
import { useEffect, useRef, useState } from "react";
export default function SocialEmbed({ src, title }: { src: string; title: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const node = container.current; if (!node || ready) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin:"150px" });
    observer.observe(node); return () => observer.disconnect();
  }, [ready]);
  return <div className="social-embed-container" ref={container}>{ready ? <iframe className="social-single-frame" src={src} title={title} loading="lazy" allow="fullscreen; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"/> : <button type="button" className="social-load-embed" onClick={() => setReady(true)}>Muat unggahan<span>{title}</span></button>}</div>;
}
