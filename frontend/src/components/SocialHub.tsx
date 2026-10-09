"use client";

import Link from "next/link";
import { useState } from "react";
import { socialPlatforms, platformLabels, socialEmbedUrl, type SocialPlatform, type SocialAccount, type SocialPost } from "../data/socialMedia";

export function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{platform === "instagram" ? <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" /></> : platform === "youtube" ? <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 6 3-6 3z" fill="currentColor" stroke="none" /></> : platform === "facebook" ? <path d="M14 21v-8h3l.5-4H14V7c0-1 .4-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8" /> : <path d="M14 3h3c0 3 2 5 5 5v3c-2 0-4-1-5-2v8a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2z" />}</svg>;
}

function ProfileFeed({ account }: { account: SocialAccount }) {
  const username = new URL(account.url).pathname.replace(/\//g, "").replace(/^@/, "");
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) return null;
  const instagram = account.platform === "instagram";
  const markup = instagram ? undefined : `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#fff;font-family:Arial,sans-serif}blockquote{margin:0!important;min-width:0!important;width:100%!important}#fallback{display:none;min-height:510px;background:#18191b;color:#fff}#fallback img{display:block;width:100%;height:320px;object-fit:cover;filter:brightness(.68)}#fallback div{padding:24px}#fallback small{color:#ff505a;letter-spacing:.15em;font-size:10px}#fallback strong{display:block;font-size:29px;line-height:1.1;margin:12px 0}#fallback a{display:inline-block;margin-top:10px;color:#fff;text-decoration:underline;text-decoration-color:#ef3340;text-underline-offset:6px;font-size:13px}body.unavailable>blockquote{display:none!important}body.unavailable #fallback{display:block}</style></head><body><blockquote class="tiktok-embed" cite="https://www.tiktok.com/@${username}" data-unique-id="${username}" data-embed-type="creator" data-embed-from="oembed"><section><a target="_blank" href="https://www.tiktok.com/@${username}">@${username}</a></section></blockquote><div id="fallback"><img src="/images/laser-cutting-illustration.jpg" alt="Proses laser cutting Mahameru Baja"><div><small>TIKTOK / @${username}</small><strong>Proses baja dalam gerak.</strong><a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@${username}">Lihat video langsung di TikTok ↗</a></div></div><script async src="https://www.tiktok.com/embed.js"></script><script>setTimeout(function(){var frame=document.querySelector('blockquote iframe');if(!frame||frame.getBoundingClientRect().height<260)document.body.classList.add('unavailable')},3800)</script></body></html>`;
  return <article className={`social-feed social-feed-${account.platform}`}>
    <header><SocialIcon platform={account.platform} /><div><strong>{platformLabels[account.platform]}</strong><small>{account.handle}</small></div><a href={account.url} target="_blank" rel="noopener noreferrer" aria-label={`Buka ${platformLabels[account.platform]} Mahameru Baja`}>↗</a></header>
    <iframe className="social-profile-frame" title={`Konten ${platformLabels[account.platform]} ${account.handle}`} src={instagram ? `https://www.instagram.com/${username}/embed` : undefined} srcDoc={markup} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox={`allow-scripts allow-popups allow-popups-to-escape-sandbox allow-presentation${instagram ? " allow-same-origin" : ""}`} />
    <footer><span>LANGSUNG DARI AKUN KAMI</span><a href={account.url} target="_blank" rel="noopener noreferrer">Lihat di {platformLabels[account.platform]} ↗</a></footer>
  </article>;
}

function Post({ post }: { post: SocialPost }) {
  const [loaded, setLoaded] = useState(false);
  const embed = socialEmbedUrl(post.platform, post.url);
  return <article className={`social-post social-post-${post.platform}`}><div className="social-post-media">{loaded && embed ? <iframe src={embed} title={post.title} allow="fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <>{post.image ? <img src={post.image} alt="" loading="lazy" /> : <div className="social-post-placeholder"><SocialIcon platform={post.platform} /></div>}{embed ? <button type="button" onClick={() => setLoaded(true)} aria-label={`Putar ${post.title}`}><span>▶</span>Putar video</button> : <a href={post.url} target="_blank" rel="noopener noreferrer">Buka unggahan ↗</a>}</>}</div><div className="social-post-copy"><span><SocialIcon platform={post.platform} />{platformLabels[post.platform]}</span><h3>{post.title}</h3><p>{post.caption}</p><a href={post.url} target="_blank" rel="noopener noreferrer">Lihat di {platformLabels[post.platform]} ↗</a></div></article>;
}

export default function SocialHub({ accounts, posts, full = false }: { accounts: SocialAccount[]; posts: SocialPost[]; full?: boolean }) {
  const [filter, setFilter] = useState<SocialPlatform | "all">("all");
  const published = posts.filter(post => post.published && (filter === "all" || post.platform === filter));
  const shown = full ? published : published.slice(0, 3);
  const feeds = accounts.filter(account => account.published && account.url && ["instagram", "tiktok"].includes(account.platform) && (filter === "all" || filter === account.platform));
  return <section className={`social-hub ${full ? "social-hub-full" : ""}`} id="sosial"><div className="industrial-container">
    <div className="social-heading" data-reveal><div><p className="industrial-eyebrow">DI BALIK MATERIAL & PROSES</p><h2>Dari toko.<br />{' '}<em>Langsung ke layar Anda.</em></h2></div>{!full && <Link href="/sosial-media">Jelajahi sosial media ↗</Link>}</div>
    {full && posts.some(post => post.published) && <div className="social-filters" aria-label="Filter platform">{(["all", ...socialPlatforms] as const).map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "Semua" : platformLabels[value]}</button>)}</div>}
    {shown.length || feeds.length ? <div className={`social-post-grid ${shown.length + feeds.length === 2 ? "social-post-grid-pair" : ""}`}>{feeds.map(account => <ProfileFeed key={account.platform} account={account} />)}{shown.map(post => <Post key={post.id} post={post} />)}</div> : <div className="social-editorial"><div className="social-editorial-image"><img src="/images/steel-indonesia/toko-mahameru.jpg" alt="Toko Mahameru Baja" loading="lazy" /></div><div><p className="industrial-eyebrow">JELAJAHI MAHAMERU BAJA</p><h3>Kenali material.<br />Lihat prosesnya.</h3><p>Kunjungi galeri pekerjaan dan layanan Mahameru Baja.</p><Link href="/proyek">Jelajahi galeri ↗</Link></div></div>}
  </div></section>;
}
