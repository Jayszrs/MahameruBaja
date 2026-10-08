"use client";

import { useEffect } from "react";

export default function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const allowParallax = !connection?.saveData && !/^(slow-2g|2g)$/.test(connection?.effectiveType ?? "");

    const revealed = new Set<HTMLElement>();
    const parallax = new Set<HTMLElement>();
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
        if (!entry.isIntersecting) (entry.target as HTMLElement).style.setProperty("--reveal-direction", entry.boundingClientRect.top < 0 ? "-1" : "1");
      }
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });

    let frame = 0;
    let lastActivity = 0;
    let lastScrollY = -1;
    const compactMotion = window.matchMedia("(pointer: coarse), (max-width: 760px)");
    const current = new Map<HTMLElement, { y: number; scale: number }>();
    const forElement = (element: HTMLElement) => {
      let state = current.get(element);
      if (!state) { state = { y: 0, scale: 1 }; current.set(element, state); }
      return state;
    };
    // Ekor loop setelah scroll berhenti: lerp butuh frame lanjutan agar
    // sempat mengejar target. Tanpa ini gerakan putus-putus saat scroll pelan.
    const TAIL_MS = 1500;
    const tickParallax = (now: number) => {
      frame = 0;
      if (document.hidden) return;
      const scrolled = window.scrollY;
      const moved = scrolled !== lastScrollY;
      lastScrollY = scrolled;
      if (moved) lastActivity = now;
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty("--page-scroll-progress", String(Math.min(1, scrolled / scrollable)));
      const viewportCenter = window.innerHeight / 2;
      // Fase 1: semua layout read dulu (getBoundingClientRect berurutan,
      // tanpa write di antaranya → tanpa forced synchronous layout).
      const jobs: { element: HTMLElement; targetY: number; targetScale: number }[] = [];
      for (const element of parallax) {
        if (!element.isConnected) { parallax.delete(element); current.delete(element); continue; }
        const rect = element.parentElement?.getBoundingClientRect();
        if (!rect || rect.bottom < -220 || rect.top > window.innerHeight + 220) continue;
        const strength = compactMotion.matches ? 0.55 : 1;
        const speed = Number(element.dataset.parallax || "0.12") * strength;
        const limit = element.classList.contains("auto-parallax")
          ? Math.min(36, rect.height * 0.05)
          : Math.min(190, rect.height * 0.19);
        const targetY = Math.max(-limit, Math.min(limit, (viewportCenter - rect.top - rect.height / 2) * speed));
        const travel = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
        jobs.push({ element, targetY, targetScale: 1 + (1 - travel) * .08 * strength });
      }
      // Fase 2: semua style write (lerp mengekor, bukan menempel scroll).
      let maxDelta = 0;
      for (const { element, targetY, targetScale } of jobs) {
        const state = forElement(element);
        state.y += (targetY - state.y) * 0.18;
        state.scale += (targetScale - state.scale) * 0.18;
        const deltaY = Math.abs(targetY - state.y);
        const deltaS = Math.abs(targetScale - state.scale);
        if (deltaY < 0.05 && deltaS < 0.0002) { state.y = targetY; state.scale = targetScale; }
        else maxDelta = Math.max(maxDelta, deltaY, deltaS * 500);
        element.style.setProperty("--parallax-y", `${state.y.toFixed(1)}px`);
        element.style.setProperty("--scene-scale", state.scale.toFixed(3));
      }
      if (moved || maxDelta > 0.05 || now - lastActivity < TAIL_MS) {
        frame = window.requestAnimationFrame(tickParallax);
      }
    };
    const requestUpdate = () => {
      lastActivity = performance.now();
      if (!frame) frame = window.requestAnimationFrame(tickParallax);
    };
    const handleVisibility = () => { if (!document.hidden) requestUpdate(); };
    document.addEventListener("visibilitychange", handleVisibility);
    const scan = () => {
      for (const element of revealed) {
        if (!element.isConnected) { revealObserver.unobserve(element); revealed.delete(element); }
      }
      main.querySelectorAll<HTMLElement>("section h1, section h2, section figure, section .business-card, section .unit-visual, article h2").forEach((element) => {
        if (element.closest("[data-reveal], .reveal, .proof-marquee, .projects-lightbox, form, [aria-hidden='true']")) return;
        element.dataset.reveal = "auto";
      });
      // Parallax hanya untuk elemen yang eksplisit punya data-parallax.
      // Auto-inject ke semua <img> dihapus: tiap gambar ikut loop scroll
      // bikin HP kentang jank + boros baterai tanpa nilai visual.
      main.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        if (revealed.has(element)) return;
        revealed.add(element);
        const rect = element.getBoundingClientRect();
        element.classList.add("will-reveal");
        if (rect.top < window.innerHeight && rect.bottom > 0) element.classList.add("is-visible");
        revealObserver.observe(element);
      });
      if (allowParallax) main.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => parallax.add(element));
      requestUpdate();
    };

    scan();
    root.classList.add("motion-ready");
    let scanFrame = 0;
    const mutationObserver = new MutationObserver(() => {
      if (scanFrame) return;
      scanFrame = window.requestAnimationFrame(() => {
        scanFrame = 0;
        scan();
      });
    });
    mutationObserver.observe(main, { childList: true, subtree: true });
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      root.classList.remove("motion-ready");
      root.style.removeProperty("--page-scroll-progress");
      revealObserver.disconnect();
      mutationObserver.disconnect();
      if (scanFrame) window.cancelAnimationFrame(scanFrame);
      revealed.forEach((element) => element.classList.remove("will-reveal", "is-visible"));
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
