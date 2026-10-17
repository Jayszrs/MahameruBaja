"use client";
import { useEffect, useState } from "react";
import Image from "./CmsImage";

export default function RotatingHeroMedia({ images, className = "" }: { images: string[]; className?: string }) {
  const sources = [...new Set(images.filter(Boolean))];
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    change(); document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  useEffect(() => {
    if (sources.length < 2 || paused || hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive(index => (index + 1) % sources.length), 5000);
    return () => window.clearTimeout(timer);
  }, [active, paused, hidden, sources.length]);
  return <div className={`rotating-hero-media ${className}`}>
    <div aria-hidden="true">{sources.length > 0 && <Image key={sources[active % sources.length]} src={sources[active % sources.length]} alt="" fill sizes="100vw" loading="eager" className="is-active" />}</div>
    {sources.length > 1 && <button type="button" className="carousel-keyboard-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "Lanjutkan pergantian gambar" : "Hentikan pergantian gambar"}</button>}
  </div>;
}
