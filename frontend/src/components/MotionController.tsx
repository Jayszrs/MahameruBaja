"use client";

import { useEffect } from "react";

export default function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) return;

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    root.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -4%", threshold: 0 },
    );
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        element.classList.add("is-visible");
      } else {
        element.classList.add("will-reveal");
        revealObserver.observe(element);
      }
    });

    const parallaxElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]"),
    );
    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const viewportCenter = window.innerHeight / 2;
      for (const element of parallaxElements) {
        const rect = element.parentElement?.getBoundingClientRect();
        if (!rect || rect.bottom < -160 || rect.top > window.innerHeight + 160) continue;
        const speed = Number(element.dataset.parallax || "0.08");
        const offset = Math.max(-72, Math.min(72, (viewportCenter - (rect.top + rect.height / 2)) * speed));
        element.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      root.classList.remove("motion-ready");
      revealObserver.disconnect();
      revealElements.forEach((element) => element.classList.remove("will-reveal", "is-visible"));
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return null;
}
