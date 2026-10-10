"use client";

import Link from "next/link";
import { useState } from "react";
import { divisions } from "../data/divisionContent";
import { socialPlatforms, platformLabels, socialEmbedUrl, type SocialPlatform, type SocialAccount, type SocialPost } from "../data/socialMedia";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{platform === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></> : platform === "youtube" ? <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3z" fill="currentColor" stroke="none" /></> : platform === "facebook" ? <path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8" /> : <path d="M14 3h3c0 3 2 5 5 5v3c-2 0-4-1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2z" />}</svg>;
}
function Post({ post }: { post: SocialPost }) {
  const embed = socialEmbedUrl(post.platform, post.url);
  const division = divisions.find(d => d.slug === post.division);
  return <article className={`social-feed social-single-post social-post-${post.platform}`}>
    <header><div><strong>{division?.name || post.title}</strong><small>{post.handle || platformLabels[post.platform]}</small></div><span>{platformLabels[post.platform]} resmi</span></header>
    {embed ? <iframe className="social-single-frame" src={embed} title={post.title} loading="lazy" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <a className="social-external-post" href={post.url} target="_blank" rel="noopener noreferrer">{post.image && <img src={post.image} alt="" loading="lazy" />}<SocialIcon platform={post.platform} />Buka unggahan ↗</a>}
    <footer><h3>{post.title}</h3>{post.caption && <p>{post.caption}</p>}<a href={post.url} target="_blank" rel="noopener noreferrer">Buka di {platformLabels[post.platform]} →</a></footer>
  </article>;
}

export default function SocialHub({ accounts, posts, full = false }: { accounts: SocialAccount[]; posts: SocialPost[]; full?: boolean }) {
  const [filter, setFilter] = useState<SocialPlatform | "all">("all");
  const published = posts.filter(post => post.published && (filter === "all" || post.platform === filter));
  const shown = full ? published : published.slice(0, 6);
  return <section className={`social-hub ${full ? "social-hub-full" : ""}`} id="sosial"><div className="industrial-container">
    <div className="social-heading" data-reveal><div><p className="industrial-eyebrow">SOSIAL MEDIA / MAHAMERU BAJA</p><h2>Kabar dari tim.<br /><em>Lihat prosesnya langsung.</em></h2><p>Unggahan resmi dari tiap divisi. Putar video di kartu atau buka postingan aslinya.</p></div>{!full && <Link href="/sosial-media">Semua unggahan ↗</Link>}</div>
    {full && posts.some(post => post.published) && <div className="social-filters" aria-label="Filter platform">{(["all", ...socialPlatforms] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Semua" : platformLabels[value]}</button>)}</div>}
    {shown.length ? <div className="social-post-grid social-permata-grid">{shown.map(post => <Post key={post.id} post={post} />)}</div> : <p className="social-empty">Belum ada unggahan terbit untuk pilihan ini. Kunjungi akun resmi kami di bawah.</p>}
    <nav className="social-account-directory" aria-label="Akun resmi">{accounts.filter(a=>a.published&&a.url).map(a=><a key={`${a.platform}:${a.handle}`} href={a.url} target="_blank" rel="noopener noreferrer"><SocialIcon platform={a.platform}/><span>{platformLabels[a.platform]}<strong>{a.handle}</strong></span>↗</a>)}</nav>
    <p className="social-embed-note">Jika pemutar dibatasi oleh platform atau browser, gunakan tautan “Buka di” pada kartu.</p>
  </div></section>;
}
