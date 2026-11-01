"use client";
import { useState } from "react";
import Image from "./CmsImage";
import Link from "next/link";
import type { AppearanceItem } from "../data/websiteAppearance";
export default function WebsiteQuotes({ quotes }: { quotes: AppearanceItem[] }) {
  const [active,setActive]=useState(0);
  if (!quotes.length) return null;
  const index=Math.min(active,quotes.length-1);
  const quote=quotes[index];
  return <section className="home-section website-quotes" aria-label="Kata mutiara Mahameru"><div className="home-shell"><h2>Quotes</h2><div className="website-quote-carousel" aria-live="polite"><figure key={quote.id}>{quote.image&&<div className="website-quote-image"><Image src={quote.image} alt={quote.alt||""} fill sizes="(max-width:700px) 100vw, 50vw" /></div>}<div className="website-quote-copy"><blockquote>{quote.title}</blockquote>{quote.text&&<figcaption>{quote.text}</figcaption>}{quote.href&&<Link href={quote.href}>Baca selengkapnya ↗</Link>}</div></figure>{quotes.length>1&&<div className="website-quote-dots" aria-label="Pilih quote">{quotes.map((item,itemIndex)=><button type="button" key={item.id} aria-label={`Tampilkan quote ${itemIndex+1}`} aria-current={itemIndex===index?"true":undefined} onClick={()=>setActive(itemIndex)} />)}</div>}</div></div></section>;
}
