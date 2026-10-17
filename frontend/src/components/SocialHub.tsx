"use client";
import PublicText from "./PublicText";
import Image from "./CmsImage";
import SocialEmbed from "./SocialEmbed";
import { useDivisionDirectory } from "./DivisionDirectory";

import Link from "next/link";
import { useState } from "react";

import { socialPlatforms, platformLabels, socialEmbedUrl, type SocialPlatform, type SocialAccount, type SocialPost } from "../data/socialMedia";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{platform === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></> : platform === "youtube" ? <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3z" fill="currentColor" stroke="none" /></> : platform === "facebook" ? <path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8" /> : <path d="M14 3h3c0 3 2 5 5 5v3c-2 0-4-1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2z" />}</svg>;
}
function Post({ post }: { post: SocialPost }) {
  const { divisions } = useDivisionDirectory();
  const [playerKey, setPlayerKey] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const embed = socialEmbedUrl(post.platform, post.url);
  const division = divisions.find(d => d.slug === post.division);
  return <PublicText><article className={`social-feed social-single-post social-post-${post.platform}`}>
    <header className="social-post-source"><div><strong>{division?.name || post.title}</strong><small>{post.handle || platformLabels[post.platform]}</small></div><span className="social-post-platform" aria-label={`Konten ${platformLabels[post.platform]}`} title={platformLabels[post.platform]}><SocialIcon platform={post.platform} /></span></header>
    {post.videoUrl ? <video key={playerKey} className="social-native-video" src={post.videoUrl} poster={post.image || undefined} controls playsInline preload="none" onError={() => setVideoError(true)} aria-label={post.title}><a href={post.url}>Buka unggahan asli</a></video> : post.image ? <a className="social-image-preview" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Lihat ${post.title} di ${platformLabels[post.platform]}`}><Image src={post.image} alt={post.title} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"/></a> : embed ? <SocialEmbed key={playerKey} src={embed} title={post.title}/> : <a className="social-external-post" href={post.url} target="_blank" rel="noopener noreferrer"><SocialIcon platform={post.platform} />Buka unggahan ↗</a>}
    {videoError && <div className="social-player-error" role="status"><span>Video belum berhasil dimuat.</span><button type="button" onClick={() => { setPlayerKey(key => key + 1); setVideoError(false); }}>Coba lagi</button></div>}
    <footer><h3>{post.title}</h3>{post.caption && <p>{post.caption}</p>}<a href={post.url} target="_blank" rel="noopener noreferrer">Lihat di {platformLabels[post.platform]} →</a></footer>
  </article></PublicText>;
}

export default function SocialHub({ accounts, posts, full = false, companyName = "Mahameru Baja", moreHref = "/sosial-media" }: { accounts: SocialAccount[]; posts: SocialPost[]; full?: boolean; companyName?: string; moreHref?: string }) {
  const [filter, setFilter] = useState<SocialPlatform | "all">("all");
  const published = posts.filter(post => post.published && (filter === "all" || post.platform === filter));
  const shown = full ? published : published.slice(0, 6);
  return <PublicText><section className={`social-hub ${full ? "social-hub-full" : ""}`} id="sosial"><div className="industrial-container">
    <div className="social-heading" data-reveal><div><p className="industrial-eyebrow">SOSIAL MEDIA / {companyName}</p><h2>Media sosial kami.<br />{" "}<em>Ikuti kegiatan dan pekerjaan kami.</em></h2><p>Lihat informasi produk, kegiatan, dan hasil pekerjaan melalui akun resmi kami.</p></div>{!full && <Link href={moreHref}>Semua unggahan ↗</Link>}</div>
    {full && posts.some(post => post.published) && <div className="social-filters" aria-label="Filter platform">{(["all", ...socialPlatforms] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Semua" : platformLabels[value]}</button>)}</div>}
    {shown.length ? <div className="social-post-grid social-permata-grid">{shown.map(post => <Post key={post.id} post={post} />)}</div> : <p className="social-empty">Belum ada unggahan untuk pilihan ini. Kunjungi akun resmi kami di bawah.</p>}
    <nav className="social-account-directory" aria-label="Akun resmi">{accounts.filter(a=>a.published&&a.url).map(a=><a key={`${a.platform}:${a.handle}`} href={a.url} target="_blank" rel="noopener noreferrer"><SocialIcon platform={a.platform}/><span>{platformLabels[a.platform]}<strong>{a.handle}</strong></span>↗</a>)}</nav>
  </div></section></PublicText>;
}
