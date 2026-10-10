"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "../data/heroSlides";

const ROTATION_INTERVAL = 4000;

export default function HeroCarousel({ slides: heroSlides, rating: googleRating, ratingDate: googleRatingObservedAt, mapsUrl: googleMapsUrl, companyName = "Mahameru Baja", area = "Bekasi / Jawa Barat", servicesLabel = "Retail • Trading • Production", ratingSourceName = "Mahameru Baja", serviceItems = ["Retail besi", "Supply proyek", "Laser cutting", "CNC bending", "Fabrikasi"] }: { slides: HeroSlide[]; rating: number; ratingDate: string; mapsUrl: string; companyName?: string; area?: string; servicesLabel?: string; ratingSourceName?: string; serviceItems?: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [playedVideos, setPlayedVideos] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeSlide = heroSlides[activeIndex];
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
      if (index === activeIndex && !paused && !userPaused && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => { setFailed(current => new Set(current).add(index)); });
      else video.pause();
    });
  }, [activeIndex, paused, userPaused]);

  useEffect(() => {
    if (paused || userPaused || nextIndex === activeIndex || window.matchMedia("(prefers-reduced-motion: reduce)").matches || activeSlide.type === "video" && !failed.has(activeIndex)) return;
    const timer = window.setTimeout(() => {
      setPreviousIndex(activeIndex);
      setActiveIndex(nextIndex);
    }, ROTATION_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, nextIndex, paused, userPaused, activeSlide.type, failed]);

  useEffect(() => {
    if (previousIndex === null) return;
    const timer = window.setTimeout(() => setPreviousIndex(null), 900);
    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  return (
    <section
      className={`hero-carousel ${paused || userPaused ? "is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label={`Layanan utama ${companyName}`}
    >
      <div className="hero-carousel-media" aria-hidden="true">
        {heroSlides.map((slide, index) => (index === activeIndex || index === nextIndex || index === previousIndex) && (
          <div className={`hero-carousel-layer ${index === activeIndex ? "is-active" : ""}`} key={slide.id}>
            <div className="hero-carousel-parallax" data-parallax="0.32">
              {failed.has(index) ? <Image unoptimized src={slide.poster || heroSlides.find(s=>s.type === "image")?.media || "/images/laser-cutting-illustration.jpg"} alt="" fill sizes="100vw" /> : slide.type === "video" ? (
                <video
                  ref={(node) => { videoRefs.current[index] = node; }}
                  src={slide.media}
                  poster={slide.poster}
                  muted
                  onEnded={() => videoEnded(index)}
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  style={{ objectPosition: slide.objectPosition }}
                  onError={() => setFailed(current => new Set(current).add(index))}
                />
              ) : (
                <Image
                  src={slide.media}
                  unoptimized={slide.media.startsWith("https://")}
                  alt=""
                  fill
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
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
      <div className="hero-carousel-overlay" aria-hidden="true" />

      <div className="home-shell hero-carousel-layout">
        <div className="hero-carousel-copy-wrap" data-parallax="0.075"><div className="hero-carousel-copy" key={activeSlide.id}>
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
        </div></div>

        <div className="hero-carousel-meta" aria-label="Ringkasan perusahaan">
          <span>{area}</span>
          <strong>{servicesLabel}</strong>
          {activeSlide.visualNote && <small>{activeSlide.visualNote}</small>}
        </div>

        <div className="hero-slide-dots" role="tablist" aria-label="Pilih layanan unggulan">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`${index + 1} dari ${heroSlides.length}: ${slide.eyebrow}`}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => goToSlide(index)}
            >
              <i aria-hidden="true">{index === activeIndex && <b aria-hidden="true" />}</i>
            </button>
          ))}
        </div>
      </div>

      <div className="home-hero-rail" aria-label="Layanan utama">
        <div className="home-shell">{serviceItems.map((service, index) => <span key={service}>{index > 0 && <i aria-hidden="true" />}{service}</span>)}</div>
      </div>
      <button type="button" className="hero-carousel-pause" aria-pressed={userPaused} onClick={()=>setUserPaused(v=>!v)}>{userPaused ? "Lanjutkan slideshow ▶" : "Jeda slideshow Ⅱ"}</button>
    </section>
  );
}
