"use client";
import { useState } from "react";
import Image from "./CmsImage";
import Link from "next/link";
import { defaultQuoteImage, type AppearanceItem } from "../data/websiteAppearance";
import PublicText from "./PublicText";
export default function WebsiteQuotes({ quotes }: { quotes: AppearanceItem[] }) {
  const [active, setActive] = useState(0);
  if (!quotes.length) return null;
  const currentIndex = active % quotes.length;
  const quote = quotes[currentIndex];
  return <PublicText><section className="home-section website-quotes" aria-labelledby="website-quotes-heading"><div className="home-shell"><h2 id="website-quotes-heading">Quotes</h2><div className={`website-quote-carousel${quotes.length===1?" is-single":""}`} aria-roledescription="carousel" aria-label="Kutipan Mahameru"><figure key={quote.id} aria-roledescription="slide" aria-label={`${currentIndex + 1} dari ${quotes.length}`}><div className="website-quote-image"><Image src={quote.image || defaultQuoteImage} alt={quote.alt || "Gambar pendukung quote Mahameru"} fill sizes="(max-width:700px) 90vw, 50vw" /></div><div className="website-quote-copy"><blockquote>{quote.title}</blockquote>{quote.text && <p className="website-quote-author">{quote.text}</p>}{quote.href && <Link href={quote.href}>Baca selengkapnya ↗</Link>}</div></figure>{quotes.length > 1 && <div className="website-quote-controls" aria-label="Navigasi kutipan"><button type="button" aria-label="Kutipan sebelumnya" onClick={() => setActive(index => (index - 1 + quotes.length) % quotes.length)}>‹</button><div className="website-quote-dots">{quotes.map((item,index)=><button type="button" key={item.id} aria-label={`Tampilkan kutipan ${index + 1}`} aria-current={index===currentIndex} onClick={()=>setActive(index)} />)}</div><button type="button" aria-label="Kutipan berikutnya" onClick={() => setActive(index => (index + 1) % quotes.length)}>›</button></div>}</div></div></section></PublicText>;
}
