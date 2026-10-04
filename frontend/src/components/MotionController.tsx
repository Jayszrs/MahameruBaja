"use client";

import { useEffect } from "react";

export default function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;

    const revealed = new Set<HTMLElement>();
    const parallax = new Set<HTMLElement>();
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });

    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty("--page-scroll-progress", String(Math.min(1, window.scrollY / scrollable)));
      const viewportCenter = window.innerHeight / 2;
      for (const element of parallax) {
        if (!element.isConnected) { parallax.delete(element); continue; }
        const rect = element.parentElement?.getBoundingClientRect();
        if (!rect || rect.bottom < -220 || rect.top > window.innerHeight + 220) continue;
        const speed = Number(element.dataset.parallax || "0.12");
        const limit = element.classList.contains("auto-parallax")
          ? Math.min(36, rect.height * 0.05)
          : Math.min(190, rect.height * 0.19);
        const offset = Math.max(-limit, Math.min(limit, (viewportCenter - rect.top - rect.height / 2) * speed));
        element.style.setProperty("--parallax-y", `${offset.toFixed(1)}px`);
      }
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    const scan = () => {
      main.querySelectorAll<HTMLElement>("section h1, section h2, section h3, section figure, section .business-card, section .unit-visual, article h2, article p, article ul").forEach((element) => {
        if (element.closest("[data-reveal], .reveal, .proof-marquee, .projects-lightbox, form, [aria-hidden='true']")) return;
        element.dataset.reveal = "auto";
      });
      main.querySelectorAll<HTMLImageElement>("section img").forEach((image) => {
        if (image.dataset.parallax || image.closest("[data-parallax], .hero-carousel, .proof-marquee, .home-product-tile, .projects-card, [aria-hidden='true']") || image.src.includes("logo")) return;
        image.dataset.parallax = "0.09";
        image.classList.add("auto-parallax");
      });
      main.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        if (revealed.has(element)) return;
        revealed.add(element);
        const rect = element.getBoundingClientRect();
        element.classList.add("will-reveal");
        if (rect.top < window.innerHeight && rect.bottom > 0) element.classList.add("is-visible");
        revealObserver.observe(element);
      });
      main.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => parallax.add(element));
      requestUpdate();
    };

    scan();
    root.classList.add("motion-ready");
    const mutationObserver = new MutationObserver(scan);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      root.classList.remove("motion-ready");
      root.style.removeProperty("--page-scroll-progress");
      revealObserver.disconnect();
      mutationObserver.disconnect();
      revealed.forEach((element) => element.classList.remove("will-reveal", "is-visible"));
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return null;
}
