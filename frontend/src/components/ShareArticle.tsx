"use client";

import { useEffect, useState } from "react";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41Z" />
      <path d="M11.97 0A11.97 11.97 0 0 0 1.48 17.72L0 24l6.43-1.45A11.9 11.9 0 0 0 11.97 24 12 12 0 1 0 11.97 0Zm0 21.89c-1.79 0-3.54-.48-5.05-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.86 9.86 0 0 1-1.51-5.26 9.91 9.91 0 1 1 9.92 9.92Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8v2.8h2.5V21h3Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.2 4h2.6l-5.7 6.6L20.8 20h-5.3l-4.1-5.4L6.6 20H4l6.1-7L3.6 4H9l3.7 4.9L17.2 4Zm-.9 14.4h1.4L8.1 5.5H6.6l9.7 12.9Z" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

/**
 * Strip bagikan kompak di akhir artikel.
 * WhatsApp, Facebook, X, dan Threads punya tautan berbagi web;
 * TikTok dan Instagram tidak — lewat menu share HP kalau ada,
 * kalau tidak tautan disalin untuk ditempel manual ke Story.
 */
export default function ShareArticle({ title }: { title: string }) {
  const [flash, setFlash] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare("share" in navigator);
  }, []);

  const pageUrl = () => {
    // Share the canonical article rather than generating separate preview caches
    // for every tracking query or scroll anchor.
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url.href;
  };
  const text = () => `${title} — Mahameru Baja`;

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=640,height=560");

  const flashFor = (key: string) => {
    setFlash(key);
    window.setTimeout(() => setFlash((current) => (current === key ? null : current)), 2200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl());
    } catch {
      const field = document.createElement("textarea");
      field.value = pageUrl();
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
  };

  const appShare = async (key: string, app: string) => {
    if (canNativeShare) {
      try {
        await navigator.share({ title: text(), text: text(), url: pageUrl() });
        return;
      } catch { return; }
    }
    await copyLink();
    flashFor(key);
    void app;
  };

  const buttons = [
    { key: "wa", label: "WhatsApp", icon: <WhatsAppIcon />, onClick: () => open(`https://wa.me/?text=${encodeURIComponent(`${text()}\n${pageUrl()}`)}`) },
    { key: "fb", label: "Facebook", icon: <FacebookIcon />, onClick: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl())}`) },
    { key: "x", label: "X", icon: <XIcon />, onClick: () => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text())}&url=${encodeURIComponent(pageUrl())}`) },
    { key: "threads", label: "Threads", icon: <ThreadsIcon />, onClick: () => open(`https://www.threads.net/intent/post?text=${encodeURIComponent(`${text()}\n${pageUrl()}`)}`) },
    { key: "tiktok", label: "TikTok", icon: <TikTokIcon />, onClick: () => appShare("tiktok", "TikTok") },
    { key: "ig", label: "Instagram", icon: <InstagramIcon />, onClick: () => appShare("ig", "Instagram") },
  ];

  return (
    <div className="article-share" role="group" aria-label="Bagikan artikel">
      <span className="article-share-label">Terbantu? Bagikan ke yang butuh.</span>
      {buttons.map((button) => (
        <button key={button.key} type="button" className="article-share-icon" title={flash === button.key ? "Tautan disalin — tempel ke Story" : button.label} aria-label={`Bagikan ke ${button.label}`} onClick={button.onClick}>
          {flash === button.key ? <CheckIcon /> : button.icon}
        </button>
      ))}
      <button type="button" className="article-share-icon" title={flash === "link" ? "Tautan disalin" : "Salin tautan"} aria-label="Salin tautan artikel" aria-live="polite" onClick={async () => { await copyLink(); flashFor("link"); }}>
        {flash === "link" ? <CheckIcon /> : <LinkIcon />}
      </button>
      {canNativeShare && (
        <button type="button" className="article-share-icon article-share-accent" title="Menu bagikan HP" aria-label="Buka menu bagikan HP" onClick={async () => { try { await navigator.share({ title: text(), text: text(), url: pageUrl() }); } catch { /* tutup */ } }}>
          <ShareIcon />
        </button>
      )}
    </div>
  );
}
