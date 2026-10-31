import Image from "./CmsImage";
import Link from "next/link";
import type { AppearanceItem } from "../data/websiteAppearance";
export default function WebsiteQuotes({ quotes }: { quotes: AppearanceItem[] }) {
  if (!quotes.length) return null;
  return <section className="home-section website-quotes" aria-label="Kata mutiara Mahameru"><div className="home-shell"><p className="home-eyebrow text-brand">Catatan Mahameru</p><div className="website-quote-grid">{quotes.map(quote => <figure key={quote.id}>{quote.image && <Image src={quote.image} alt={quote.alt || ""} width={720} height={480} sizes="(max-width:700px) 90vw, 50vw" />}<blockquote>{quote.title}</blockquote>{quote.text && <figcaption>{quote.text}</figcaption>}{quote.href && <Link href={quote.href}>Baca selengkapnya ↗</Link>}</figure>)}</div></div></section>;
}
