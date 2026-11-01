import Image from "./CmsImage";
import Link from "next/link";
import { defaultQuoteImage, type AppearanceItem } from "../data/websiteAppearance";
import PublicText from "./PublicText";
export default function WebsiteQuotes({ quotes }: { quotes: AppearanceItem[] }) {
  if (!quotes.length) return null;
  return <PublicText><section className="home-section website-quotes" aria-labelledby="website-quotes-heading"><div className="home-shell"><h2 id="website-quotes-heading">Quotes</h2><div className={`website-quote-grid${quotes.length===1?" is-single":""}`}>{quotes.map(quote => <figure key={quote.id}><div className="website-quote-image"><Image src={quote.image || defaultQuoteImage} alt={quote.alt || "Gambar pendukung quote Mahameru"} fill sizes="(max-width:700px) 90vw, 50vw" /></div><div className="website-quote-copy"><blockquote>{quote.title}</blockquote>{quote.text && <p className="website-quote-author">{quote.text}</p>}{quote.href && <Link href={quote.href}>Baca selengkapnya ↗</Link>}</div></figure>)}</div></div></section></PublicText>;
}
