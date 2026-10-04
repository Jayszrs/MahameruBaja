"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { heroSlides } from "../data/heroSlides";

const ROTATION_INTERVAL = 5500;

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const activeSlide = heroSlides[activeIndex];

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  }, []);

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
    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % heroSlides.length), ROTATION_INTERVAL);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused]);

  return (
    <section
      className={`hero-carousel ${paused ? "is-paused" : ""}`}
      aria-roledescription="carousel"
      aria-label="Layanan utama Mahameru Baja"
    >
      <div className="hero-carousel-media" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <div className={`hero-carousel-layer ${index === activeIndex ? "is-active" : ""}`} key={slide.id}>
            <div className="hero-carousel-parallax" data-parallax="0.32">
              {slide.type === "video" ? (
                <video
                  ref={(node) => { videoRefs.current[index] = node; }}
                  src={slide.media}
                  poster={slide.poster}
                  muted
                  loop
                  playsInline
                  preload={index === 0 ? "auto" : "metadata"}
                  style={{ objectPosition: slide.objectPosition }}
                />
              ) : (
                <Image
                  src={slide.media}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  style={{ objectPosition: slide.objectPosition }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="hero-carousel-overlay" aria-hidden="true" />
      <div className="hero-carousel-grid" aria-hidden="true" />

      <div className="home-shell hero-carousel-layout">
        <div className="hero-carousel-copy-wrap" data-parallax="0.075"><div className="hero-carousel-copy" key={activeSlide.id}>
          <p className="hero-carousel-eyebrow"><span />{activeSlide.eyebrow}</p>
          <h1 id="home-heading">{activeSlide.title}<br /><em>{activeSlide.accent}</em></h1>
          <p>{activeSlide.description}</p>
          <div className="home-actions">
            <Link href={activeSlide.primaryAction.href} className="home-button home-button-primary">
              {activeSlide.primaryAction.label}<Arrow />
            </Link>
            <Link href={activeSlide.secondaryAction.href} className="home-button home-button-ghost">
              {activeSlide.secondaryAction.label}<Arrow />
            </Link>
          </div>
        </div></div>

        <div className="hero-carousel-meta" aria-label="Ringkasan perusahaan">
          <span>Bekasi / Jawa Barat</span>
          <strong>Retail • Trading • Production</strong>
          {activeSlide.visualNote && <small>{activeSlide.visualNote}</small>}
        </div>

        <div className="hero-carousel-controls">
          <div className="hero-carousel-pagination" aria-label="Pilih slide">
            {heroSlides.map((slide, index) => (
              <button
                type="button"
                className={index === activeIndex ? "is-active" : ""}
                onClick={() => goTo(index)}
                aria-label={`Tampilkan slide ${index + 1}: ${slide.eyebrow}`}
                aria-current={index === activeIndex ? "true" : undefined}
                key={slide.id}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i><b /></i>
              </button>
            ))}
          </div>
          <button type="button" className="hero-carousel-next" onClick={() => goTo(activeIndex + 1)} aria-label="Tampilkan gambar berikutnya">
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </button>
        </div>
      </div>

      <div className="home-hero-rail" aria-label="Layanan utama">
        <div className="home-shell"><span>Retail besi</span><i /><span>Supply proyek</span><i /><span>Laser cutting</span><i /><span>CNC bending</span><i /><span>Fabrikasi</span></div>
      </div>
    </section>
  );
}
