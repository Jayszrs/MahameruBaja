"use client";

import Link from "next/link";
import { useState } from "react";
import { socialPlatforms, platformLabels, socialEmbedUrl, type SocialPlatform, type SocialAccount, type SocialPost } from "../data/socialMedia";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{platform === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></> : platform === "youtube" ? <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3z" fill="currentColor" stroke="none" /></> : platform === "facebook" ? <path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8" /> : <path d="M14 3h3c0 3 2 5 5 5v3c-2 0-4-1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2z" />}</svg>;
}

function ProfileFeed({ account }: { account: SocialAccount }) {
  const [loaded, setLoaded] = useState(false);
  const username = new URL(account.url).pathname.replace(/\//g, "").replace(/^@/, "");
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return null;
  const instagram = account.platform === "instagram";
  const source = instagram ? `https://www.instagram.com/${username}/embed` : undefined;
  const markup = instagram ? undefined : `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#fff}blockquote{margin:0!important;min-width:0!important;width:100%!important}</style></head><body><blockquote class="tiktok-embed" cite="https://www.tiktok.com/@${username}" data-unique-id="${username}" data-embed-type="creator" data-embed-from="oembed"><section><a target="_blank" href="https://www.tiktok.com/@${username}">@${username}</a></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script></body></html>`;
  return <article className="social-feed"><header><SocialIcon platform={account.platform} /><div><strong>{platformLabels[account.platform]}</strong><small>{account.handle}</small></div></header>{loaded ? <iframe className="social-profile-frame" title={`Konten ${platformLabels[account.platform]} ${account.handle}`} src={source} srcDoc={markup} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox={`allow-scripts allow-popups allow-popups-to-escape-sandbox allow-presentation${instagram ? " allow-same-origin" : ""}`} /> : <div className="social-feed-cover"><img src={instagram ? "/images/steel-indonesia/toko-mahameru.jpg" : "/images/steel-indonesia/plat-hitam.jpg"} alt="" loading="lazy" /><div><SocialIcon platform={account.platform} /><h3>{instagram ? "Cerita dari toko & workshop." : "Lihat proses dalam gerak."}</h3><button type="button" onClick={() => setLoaded(true)}>Tampilkan konten {platformLabels[account.platform]} ↗</button></div></div>}<a className="social-feed-source" href={account.url} target="_blank" rel="noopener noreferrer">Buka langsung di {platformLabels[account.platform]} ↗</a><p className="social-feed-note">Jika konten dibatasi platform, buka melalui tautan di atas.</p></article>;
}

function Post({ post }: { post: SocialPost }) {
  const [loaded, setLoaded] = useState(false);
  const embed = socialEmbedUrl(post.platform, post.url);
  return <article className={`social-post social-post-${post.platform}`}><div className="social-post-media">{loaded && embed ? <iframe src={embed} title={post.title} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <>{post.image ? <img src={post.image} alt="" loading="lazy" /> : <div className="social-post-placeholder"><SocialIcon platform={post.platform} /></div>}{embed ? <button onClick={() => setLoaded(true)} aria-label={`Putar ${post.title}`}><span>▶</span>Putar video</button> : <a href={post.url} target="_blank" rel="noopener noreferrer">Buka unggahan ↗</a>}</>}</div><div className="social-post-copy"><span><SocialIcon platform={post.platform} />{platformLabels[post.platform]}</span><h3>{post.title}</h3><p>{post.caption}</p><a href={post.url} target="_blank" rel="noopener noreferrer">Lihat di {platformLabels[post.platform]} ↗</a></div></article>;
}

export default function SocialHub({ accounts, posts, full = false }: { accounts: SocialAccount[]; posts: SocialPost[]; full?: boolean }) {
  const [filter, setFilter] = useState<SocialPlatform | "all">("all");
  const published = posts.filter(p => p.published && (filter === "all" || p.platform === filter));
  const shown = full ? published : published.slice(0, 3);
  const feeds = accounts.filter(a => a.published && a.url && ["instagram", "tiktok"].includes(a.platform) && (filter === "all" || filter === a.platform));
  return <section className={`social-hub ${full ? "social-hub-full" : ""}`} id="sosial"><div className="industrial-container"><div className="social-heading" data-reveal><div><p className="industrial-eyebrow">DI BALIK MATERIAL & PROSES</p><h2>Lebih dekat.<br /><em>Lewat cerita sehari-hari.</em></h2></div>{!full && <Link href="/sosial-media">Jelajahi sosial media ↗</Link>}</div><div className="social-accounts">{socialPlatforms.filter(platform => accounts.some(a => a.platform === platform && a.published && a.url)).map(platform => {
    const account = accounts.find(a => a.platform === platform && a.published && a.url);
    const body = <><SocialIcon platform={platform} /><div><strong>{platformLabels[platform]}</strong><small>{account?.handle || (account ? "Kunjungi kanal kami" : "Kanal belum ditautkan")}</small></div><span aria-hidden="true">{account ? "↗" : "—"}</span></>;
    return account ? <a key={platform} href={account.url} target="_blank" rel="noopener noreferrer">{body}</a> : <div key={platform}>{body}</div>;
  })}</div>
  {full && posts.some(p => p.published) && <div className="social-filters" aria-label="Filter platform">{(["all", ...socialPlatforms] as const).map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Semua" : platformLabels[value]}</button>)}</div>}
  {shown.length || feeds.length ? <div className="social-post-grid">{feeds.map(account => <ProfileFeed key={account.platform} account={account} />)}{shown.map(post => <Post key={post.id} post={post} />)}</div> : <div className="social-editorial"><div className="social-editorial-image"><img src="/images/steel-indonesia/toko-mahameru.jpg" alt="Toko Mahameru Baja" loading="lazy" /></div><div><p className="industrial-eyebrow">JELAJAHI MAHAMERU BAJA</p><h3>Kenali material.<br />Lihat prosesnya.</h3><p>{posts.some(p => p.published) ? "Belum ada unggahan pada platform ini." : "Sambil menunggu pembaruan kanal sosial, jelajahi galeri material dan layanan kami."}</p><Link href="/proyek">Jelajahi galeri ↗</Link></div></div>}
  </div></section>;
}
