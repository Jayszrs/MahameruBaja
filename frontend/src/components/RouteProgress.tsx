"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const SHOW_DELAY_MS = 150;
const FORCE_HIDE_MS = 10000;

/**
 * Bar progres tipis di tepi atas saat pindah halaman.
 * Muncul hanya kalau navigasi >150ms (navigasi cepat tidak berkedip),
 * hilang begitu halaman baru render. Anti rage-click tanpa loading fullscreen.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timers = useRef<{ show?: number; hide?: number }>({});
  const pendingTargetRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    const clear = () => {
      window.clearTimeout(timers.current.show);
      window.clearTimeout(timers.current.hide);
      document.documentElement.removeAttribute("data-navigating");
      pendingTargetRef.current = null;
    };
    const start = (target: string) => {
      pendingTargetRef.current = target;
      document.documentElement.setAttribute("data-navigating", "true");
      window.clearTimeout(timers.current.show);
      window.clearTimeout(timers.current.hide);
      timers.current.show = window.setTimeout(() => setActive(true), SHOW_DELAY_MS);
      timers.current.hide = window.setTimeout(() => {
        clear();
        setActive(false);
      }, FORCE_HIDE_MS);
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement).closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href || href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) return;
      if (anchor.hasAttribute("download") || anchor.getAttribute("target") === "_blank" || anchor.getAttribute("rel")?.includes("external")) return;
      let url: URL;
      try { url = new URL(href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      const target = url.pathname + url.search;
      const now = performance.now();

      // Anti-brute: Jika request ke rute ini sedang berjalan atau baru saja di-klik dalam 300ms,
      // tahan dan abaikan klik lanjutan agar tidak membanjiri server dengan request bertubi-tubi.
      if (pendingTargetRef.current === target || (pendingTargetRef.current && now - lastClickTimeRef.current < 300)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      lastClickTimeRef.current = now;
      start(target);
    };
    const onPopState = () => {
      start(window.location.pathname + window.location.search);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      clear();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(timers.current.show);
    window.clearTimeout(timers.current.hide);
    pendingTargetRef.current = null;
    document.documentElement.removeAttribute("data-navigating");
    setActive(false);
  }, [pathname]);

  if (!active) return null;
  return <div className="route-progress" aria-hidden="true"><span /></div>;
}
