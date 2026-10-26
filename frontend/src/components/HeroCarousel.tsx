"use client";
import PublicText from "./PublicText";

import Image from "./CmsImage";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "../data/heroSlides";
import HeroAnnouncementTicker from "./HeroAnnouncementTicker";

const ROTATION_INTERVAL = 5000;

export default function HeroCarousel({ slides: heroSlides, rating: googleRating, ratingDate: googleRatingObservedAt, mapsUrl: googleMapsUrl, companyName = "Mahameru Baja", area = "Bekasi / Jawa Barat", servicesLabel = "Retail • Trading • Production", ratingSourceName = "Mahameru Baja", serviceItems = ["Retail besi", "Supply proyek", "Laser cutting", "bending", "Fabrikasi"] }: { slides: HeroSlide[]; rating: number; ratingDate: string; mapsUrl: string; companyName?: string; area?: string; servicesLabel?: string; ratingSourceName?: string; serviceItems?: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [playedVideos, setPlayedVideos] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeSlide = heroSlides[activeIndex] || {id:"empty",type:"image",eyebrow:companyName,title:"Mari bicarakan kebutuhan Anda.",accent:"",description:"Hubungi tim untuk informasi material dan layanan.",primaryAction:{label:"Hubungi kami",href:"/kontak"},secondaryAction:{label:"Lihat website",href:"/"},visualNote:""};
  function nextSlide(completed = playedVideos) {
    for (let offset = 1; offset < heroSlides.length; offset++) {
      const index = (activeIndex + offset) % heroSlides.length;
      if (heroSlides[index].type !== "video" || !completed.has(index) && !failed.has(index)) return index;
    }
    return activeIndex;
  }
  const nextIndex = nextSlide();

  function videoEnded(index: number) {
    if (index !== activeIndex) return;
    const completed = new Set(playedVideos).add(index);
    setPlayedVideos(completed);
    goToSlide(nextSlide(completed));
  }

  function goToSlide(index: number) {
    if (index === activeIndex) return;
    setPreviousIndex(activeIndex);
    setActiveIndex(index);
  }

  useEffect(() => {
    const handleVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex && !paused && !userPaused && !interacting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => { setFailed(current => new Set(current).add(index)); });
      else video.pause();
    });
  }, [activeIndex, paused, userPaused, interacting]);

  useEffect(() => {
    if (paused || userPaused || interacting || nextIndex === activeIndex || activeSlide.type === "video" && !failed.has(activeIndex) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setPreviousIndex(activeIndex);
      setActiveIndex(nextIndex);
    }, ROTATION_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, nextIndex, paused, userPaused, interacting, activeSlide.type, failed]);

  useEffect(() => {
    if (previousIndex === null) return;
    const timer = window.setTimeout(() => setPreviousIndex(null), 900);
    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  return (
    <PublicText><section
      className={`hero-carousel hero-carousel-bright ${paused || userPaused || interacting ? "is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label={`Layanan utama ${companyName}`}
      onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}
    >
      <div className="hero-carousel-media" aria-hidden="true">
        {heroSlides.map((slide, index) => (index === activeIndex || index === previousIndex) && (
          <div className={`hero-carousel-layer ${index === activeIndex ? "is-active" : ""}`} key={slide.id}>
            <div className="hero-carousel-parallax">
              {failed.has(index) ? <Image unoptimized src={slide.poster || heroSlides.find(s=>s.type === "image")?.media || "/images/laser-cutting-illustration.jpg"} alt="" fill sizes="100vw" /> : slide.type === "video" ? (
                <video
                  ref={(node) => { videoRefs.current[index] = node; }}
                  src={slide.media}
                  poster={slide.poster}
                  muted
                  onEnded={() => videoEnded(index)}
                  playsInline
                  preload="metadata"
                  style={{ objectPosition: slide.objectPosition }}
                  onError={() => setFailed(current => new Set(current).add(index))}
                />
              ) : (
                <Image
                  src={slide.media}
                  alt=""
                  fill
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading="eager"
                  decoding="async"
                  sizes="100vw"
                  style={{ objectPosition: slide.objectPosition }}
                  onError={() => setFailed(current => new Set(current).add(index))}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="home-shell hero-carousel-layout">
        <div className="hero-carousel-copy-wrap"><div className="hero-carousel-copy" key={activeSlide.id}>
          <p className="hero-carousel-eyebrow"><span />{activeSlide.eyebrow}</p>
          <h1 id="home-heading">{activeSlide.title}<br /><em>{activeSlide.accent}</em></h1>
          <p>{activeSlide.description}</p>
          <div className="home-actions">
            <Link href={activeSlide.primaryAction.href} className="home-button home-button-primary">
              {activeSlide.primaryAction.label}
            </Link>
            <Link href={activeSlide.secondaryAction.href} className="home-button home-button-ghost">
              {activeSlide.secondaryAction.label}
            </Link>
          </div>
          {googleRating !== null && <a className="hero-rating-link" href={googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Rating Google Maps ${ratingSourceName} ${googleRating.toFixed(1)} dari 5, lihat ulasan`}>
            <span className="hero-rating-stars" aria-hidden="true"><span>★★★★★</span><span style={{ width: `${googleRating / 5 * 100}%` }}>★★★★★</span></span>
            <strong>{googleRating.toFixed(1)} / 5</strong>
            <small>{ratingSourceName} · Google Maps · dicatat {googleRatingObservedAt} ↗</small>
          </a>}
          {heroSlides.length > 1 && <nav className="hero-slide-selector" aria-label="Pilihan slide beranda">
            <button type="button" onClick={() => goToSlide((activeIndex - 1 + heroSlides.length) % heroSlides.length)} aria-label="Slide sebelumnya"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
            <span aria-live={interacting ? "polite" : "off"}>{activeIndex + 1} / {heroSlides.length}</span>
            <button type="button" onClick={() => goToSlide((activeIndex + 1) % heroSlides.length)} aria-label="Slide berikutnya"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></button>
          </nav>}
        </div></div>

        <div className="hero-carousel-meta" aria-label="Ringkasan perusahaan">
          <span>{area}</span>
          <strong>{servicesLabel}</strong>
          {activeSlide.visualNote && <small>{activeSlide.visualNote}</small>}
        </div>

      </div>

      <HeroAnnouncementTicker messages={serviceItems}/>
      <button type="button" className="carousel-keyboard-control" aria-pressed={userPaused} onClick={()=>setUserPaused(v=>!v)}>{userPaused ? "Lanjutkan pergantian hero" : "Hentikan pergantian hero"}</button>
    </section></PublicText>
  );
}
