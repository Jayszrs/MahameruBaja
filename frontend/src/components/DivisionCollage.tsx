"use client";

import Image from "next/image";
import { useState } from "react";
import type { Division } from "../data/divisionContent";
import { divisionIdentity } from "../data/companyIdentity";
import type { GalleryProject } from "../data/projectGallery";
import PhotoGalleryDialog, { type GalleryImage } from "./PhotoGalleryDialog";

export default function DivisionCollage({ division, index = 0, projects = [] }: { division: Division; index?: number; projects?: GalleryProject[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const documented: GalleryImage[] = projects.filter(project => project.published && project.division === division.slug).flatMap(project => project.photos.map(photo => ({ src: photo.src, alt: photo.alt, caption: photo.caption || `${project.title} — ${photo.alt}` })));
  const hero = division.images.find(photo => photo.src === division.hero);
  const candidates: GalleryImage[] = [...documented,
    { src: division.hero, alt: hero?.title || division.name, caption: hero?.title || division.area },
    ...division.images.map(photo => ({ src: photo.src, alt: photo.title, caption: photo.title })),
    { src: divisionIdentity[division.slug].logo, alt: `Logo ${division.name}`, caption: `Identitas ${division.name}`, kind: "logo" },
  ];
  const photos = candidates.filter((photo, i) => candidates.findIndex(item => item.src === photo.src) === i);
  const brandIndex = photos.findIndex(photo => photo.src === divisionIdentity[division.slug].logo);
  return <div className={`division-collage collage-composition-${index % 2}`} aria-label={`Kolase ${division.name}`} data-collage-images={photos.length}>
    <div className="division-collage-grid">{photos.slice(0, 3).map((photo, i) => <button type="button" key={photo.src}
      className={`division-collage-photo ${i === 0 ? "division-collage-primary" : `division-collage-detail-${i - 1}`} ${photo.kind === "logo" ? "is-logo" : ""}`}
      onClick={() => setSelected(i)} aria-haspopup="dialog" aria-label={`Buka gambar ${i + 1}: ${photo.alt}`}>
      <Image src={photo.src} alt={photo.alt} fill sizes={i === 0 ? "(max-width: 800px) 60vw, 32vw" : "(max-width: 800px) 32vw, 18vw"} />
      <span>{photo.caption || photo.alt}</span>
    </button>)}</div>
    <button type="button" className="division-collage-brand" onClick={() => setSelected(brandIndex)} aria-haspopup="dialog" aria-label={`Buka logo ${division.name}`}><Image src={divisionIdentity[division.slug].logo} alt={`Logo ${division.name}`} width={86} height={74} /></button>
    <div className="division-collage-footer"><span><strong>{String(index + 1).padStart(2, "0")}</strong>{division.label}</span><button type="button" className="division-collage-open" onClick={() => setSelected(0)} aria-haspopup="dialog">Lihat {photos.length} gambar ↗</button></div>
    <PhotoGalleryDialog photos={photos} title={division.name} index={selected} onSelect={setSelected} onClose={() => setSelected(null)} />
  </div>;
}
