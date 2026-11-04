"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { getImageProps } from "next/image";
import Image from "./CmsImage";
import { livePopupPosters, posterDetails } from "../data/popupPosters";
import type { Promotion } from "../data/promotions";
import type { Division } from "../data/divisionCms";
import type { TeamContact } from "../data/siteContent";
import { jakartaDate } from "../lib/jakartaDate";
import PublicText from "./PublicText";
import { isPublicBlobUrl } from "../data/safeUrls";

const posterSizes = "(max-width:760px) 96vw, 980px";

export default function WelcomePosters({ promotions, divisions = [], contacts = [], preview, onPreviewClose }: { promotions: Promotion[]; divisions?: Division[]; contacts?: TeamContact[]; preview?: Promotion | null; onPreviewClose?: () => void }) {
  const path = usePathname(); const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0); const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [desktop, setDesktop] = useState(false);
  useEffect(() => { const query = window.matchMedia("(min-width: 761px)"); const sync = () => setDesktop(query.matches); sync(); query.addEventListener("change", sync); return () => query.removeEventListener("change", sync); }, []);
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const seen = useRef(new Set<string>());
  const slug = /^\/unit\/([^/]+)/.exec(path)?.[1];
  const today = jakartaDate();
  const live = preview ? [preview] : livePopupPosters(promotions, today, slug);
  const signature = live.map(item => item.id).join(":");
  const sessionKey = `${slug || "main"}:${signature}`;
  const paused = focused;
  useEffect(() => {
    if (!open || preview || paused || live.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setInterval(() => {
      if (!document.hidden && !reduced.matches) setIndex(current => (current + 1) % live.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [open, preview, paused, signature, live.length, index]);
  useEffect(() => {
    setOpen(false); setIndex(0); setFocused(false);
  }, [path]);
  useEffect(() => {
    if (preview || path.startsWith("/admin") || !signature || seen.current.has(sessionKey)) return;
    const timer = window.setTimeout(() => { if (!seen.current.has(sessionKey)) setOpen(true); }, 700);
    return () => window.clearTimeout(timer);
  }, [path, preview, signature, sessionKey]);
  useEffect(() => { if (preview) { setIndex(0); setFocused(false); setOpen(true); } }, [preview]);
  useEffect(() => {
    if (!open || !preview && path.startsWith("/admin")) return;
    const node = dialog.current; const focused = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = "hidden";
    if (!preview) seen.current.add(sessionKey);
    return () => { node?.close(); document.body.style.overflow = overflow; focused?.focus(); };
  }, [open, path, sessionKey, Boolean(preview)]);
  const item = live[index % live.length];
  if (!item || !preview && path.startsWith("/admin")) return null;
  const firstImage = (desktop ? live[0].imageDesktop : live[0].imageMobile) || live[0].image;
  const { props: firstPoster } = getImageProps({ src: firstImage, alt: "", fill: true, sizes: posterSizes,
    unoptimized: !firstImage.startsWith("/images/") && !isPublicBlobUrl(firstImage) });
  const close = () => { setOpen(false); onPreviewClose?.(); };
  const step = (by: number) => { setIndex(current => (current + by + live.length) % live.length); };
  const details = posterDetails(item, divisions, contacts);
  const selectedImage = (desktop ? item.imageDesktop : item.imageMobile) || item.image;
  const ratio = imageRatios[selectedImage] || (desktop && item.imageDesktop ? 16 / 9 : 2 / 3);
  return <PublicText>{!preview && <><link rel="preload" as="image" href={firstPoster.src} imageSrcSet={firstPoster.srcSet} imageSizes={firstPoster.sizes} fetchPriority="high" /><button type="button" className="poster-promo-launcher" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>Promo & informasi<span>{live.length}</span></button></>}{open && <dialog className="poster-welcome poster-lightbox poster-image-only" ref={dialog} aria-labelledby="welcome-poster-heading"
    style={{ "--poster-ratio": ratio } as CSSProperties}
    onMouseEnter={() => setFocused(true)} onMouseLeave={() => setFocused(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onCancel={close} onClose={close} onClick={event => { if (event.target === event.currentTarget) close(); }}
    onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); step(1); } if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); } }}>
    <div className="poster-welcome-toolbar"><span className="poster-welcome-accessible">{preview ? "Pratinjau poster" : "Promo & informasi"}</span><button className="poster-welcome-close" type="button" autoFocus aria-label="Tutup poster" onClick={close}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
    <h2 id="welcome-poster-heading" className="poster-welcome-accessible">{item.title}</h2>
    <div className="poster-welcome-layout">
      <a className="poster-welcome-image" href={details.whatsappHref || details.contactHref} target={details.whatsappHref ? "_blank" : undefined} rel={details.whatsappHref ? "noopener noreferrer" : undefined} onClick={close} aria-label={details.whatsappHref ? `Hubungi ${details.contact?.name || "sales"} tentang ${item.title}` : `Lihat kontak untuk ${item.title}`}>
        <Image src={selectedImage} alt={item.imageAlt} fill sizes={posterSizes} loading="eager" fetchPriority="high" onLoad={event => {
          const image = event.currentTarget;
          if (image.naturalWidth && image.naturalHeight) {
            const next = image.naturalWidth / image.naturalHeight;
            setImageRatios(current => current[selectedImage] === next ? current : { ...current, [selectedImage]: next });
          }
        }}/>
      </a>
    </div>
    <nav className="poster-welcome-navigation" aria-label="Pilihan poster">
      {live.length > 1 && <button type="button" onClick={() => step(-1)} aria-label="Poster sebelumnya"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>}
      <p aria-live={paused ? "polite" : "off"}>{index % live.length + 1} / {live.length}</p>
      {live.length > 1 && <button type="button" onClick={() => step(1)} aria-label="Poster berikutnya"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>}
    </nav>
  </dialog>}</PublicText>;
}
