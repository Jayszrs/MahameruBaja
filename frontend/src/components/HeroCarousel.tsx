"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "../data/heroSlides";

const ROTATION_INTERVAL = 7000;

export default function HeroCarousel({ rating: googleRating, ratingDate: googleRatingObservedAt, mapsUrl: googleMapsUrl }: { rating: number; ratingDate: string; mapsUrl: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState<Set<number>>(() => new Set());
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeSlide = heroSlides[activeIndex];
  const nextIndex = (activeIndex + 1) % heroSlides.length;

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
      if (index === activeIndex && !paused) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [activeIndex, paused]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!ready.has(nextIndex)) return;
    const timer = window.setTimeout(() => {
      setPreviousIndex(activeIndex);
      setActiveIndex(nextIndex);
    }, ROTATION_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, nextIndex, paused, ready]);

  useEffect(() => {
    if (previousIndex === null) return;
    const timer = window.setTimeout(() => setPreviousIndex(null), 900);
    return () => window.clearTimeout(timer);
  }, [previousIndex]);

  return (
    <section
      className={`hero-carousel ${paused ? "is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="Layanan utama Mahameru Baja"
    >
      <div className="hero-carousel-media" aria-hidden="true">
        {heroSlides.map((slide, index) => (index === activeIndex || index === nextIndex || index === previousIndex) && (
          <div className={`hero-carousel-layer ${index === activeIndex ? "is-active" : ""}`} key={slide.id}>
            <div className="hero-carousel-parallax" data-parallax="0.32">
              {failed.has(index) ? null : slide.type === "video" ? (
                <video
                  ref={(node) => { videoRefs.current[index] = node; }}
                  src={slide.media}
                  poster={slide.poster}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  style={{ objectPosition: slide.objectPosition }}
                  onCanPlay={() => setReady(current => new Set(current).add(index))}
                  onError={() => { setFailed(current => new Set(current).add(index)); setReady(current => new Set(current).add(index)); }}
                />
              ) : (
                <Image
                  src={slide.media}
                  alt=""
                  fill
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  sizes="100vw"
                  style={{ objectPosition: slide.objectPosition }}
                  onLoad={() => setReady(current => new Set(current).add(index))}
                  onError={() => { setFailed(current => new Set(current).add(index)); setReady(current => new Set(current).add(index)); }}
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
          {googleRating !== null && <a className="hero-rating-link" href={googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Rating Google Maps ${googleRating.toFixed(1)} dari 5, lihat ulasan`}>
            <span className="hero-rating-stars" aria-hidden="true"><span>★★★★★</span><span style={{ width: `${googleRating / 5 * 100}%` }}>★★★★★</span></span>
            <strong>{googleRating.toFixed(1)} / 5</strong>
            <small>Rating Google Maps · dilihat {googleRatingObservedAt} ↗</small>
          </a>}
        </div></div>

        <div className="hero-carousel-meta" aria-label="Ringkasan perusahaan">
          <span>Bekasi / Jawa Barat</span>
          <strong>Retail • Trading • Production</strong>
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
        <div className="home-shell"><span>Retail besi</span><i /><span>Supply proyek</span><i /><span>Laser cutting</span><i /><span>CNC bending</span><i /><span>Fabrikasi</span></div>
      </div>
    </section>
  );
}
