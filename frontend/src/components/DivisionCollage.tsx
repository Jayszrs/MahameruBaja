import Image from "next/image";
import type { Division } from "../data/divisionContent";

export default function DivisionCollage({ division, index = 0 }: { division: Division; index?: number }) {
  const details = division.images.filter(photo => photo.src !== division.hero);
  return <div className={`division-collage collage-composition-${index % 2}`} aria-label={`Kolase ${division.name}`}>
    <span className="division-collage-outline" aria-hidden="true" />
    <figure className="division-collage-primary"><div data-parallax="0.08"><Image src={division.hero} alt={division.name} fill sizes="(max-width: 800px) 82vw, 36vw" /></div><figcaption>{division.area}</figcaption></figure>
    {details.slice(0, 2).map((photo, i) => <figure key={photo.src} className={`division-collage-detail division-collage-detail-${i}`}><Image src={photo.src} alt={photo.title} fill sizes="(max-width: 800px) 35vw, 18vw" /><figcaption>{photo.title}</figcaption></figure>)}
    <span className="division-collage-label"><strong>{String(index + 1).padStart(2, "0")}</strong><span>{division.label}<small>MAHAMERU GROUP</small></span></span>
  </div>;
}
