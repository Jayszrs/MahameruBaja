"use client";
import { useSectionList, sectionListAttributes } from "./PublicText";
import PublicText from "./PublicText";
import { useDivisionDirectory } from "./DivisionDirectory";

import Image from "./CmsImage";
import { useCallback, useEffect, useState } from "react";
import type { Division } from "../data/divisionContent";

import { visibleInDivision } from "../data/divisionCms";
import type { GalleryProject } from "../data/projectGallery";
import PhotoGalleryDialog, { type GalleryImage } from "./PhotoGalleryDialog";

export default function DivisionCollage({ division, index = 0, projects = [] }: { division: Division; index?: number; projects?: GalleryProject[] }) {
  const { divisionIdentity } = useDivisionDirectory();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [galleryCounts,setGalleryCounts]=useState<Record<string,number>>({});
  const setGalleryCount=useCallback((id:string,count:number)=>setGalleryCounts(current=>current[id]===count?current:{...current,[id]:count}),[]);
  const documented: GalleryImage[] = projects.filter(project => project.published && visibleInDivision(project,division.slug)).flatMap(project => project.photos.map(photo => ({ src: photo.src, alt: photo.alt, caption: photo.caption || `${project.title} — ${photo.alt}` })));
  const hero = division.images.find(photo => photo.src === division.hero);
  const candidates: GalleryImage[] = [...documented,
    { src: division.hero, alt: hero?.title || division.name, caption: hero?.title || division.area },
    ...division.images.map(photo => ({ src: photo.src, alt: photo.title, caption: photo.title })),
    { src: divisionIdentity[division.slug].logo, alt: `Logo ${division.name}`, caption: `Identitas ${division.name}`, kind: "logo" },
  ];
  const defaultPhotos = candidates.filter((photo, i) => candidates.findIndex(item => item.src === photo.src) === i);
  const legacyPhotos = useSectionList(`collagePhotos:${division.slug}`, defaultPhotos);
  const albums=projects.filter(project=>project.published&&visibleInDivision(project,division.slug)).slice(0,3);
  const defaults=Array.from({length:3},(_,position)=>{
    const project=albums[position];
    const cover=project?.photos.find(photo=>photo.id===project.coverId)||project?.photos[0];
    const fallback=legacyPhotos[position];
    return project&&cover?{id:project.id,title:project.title,src:fallback?.src||cover.src,alt:cover.alt}:{id:`collage-${division.slug}-${position+1}`,title:fallback?.caption||fallback?.alt||`Kolase ${position+1}`,src:fallback?.src||"",alt:fallback?.alt||""};
  });
  const savedGroups = useSectionList(`collageGroups:${division.slug}`,defaults);
  const groups=Array.from({length:3},(_,position)=>({...defaults[position],...savedGroups[position]}));
  return <PublicText><div {...sectionListAttributes(`collageGroups:${division.slug}`, groups)} className={`division-collage collage-composition-${index % 2}`} aria-label={`Kolase ${division.name}`} data-collage-images={groups.length}>
    <div className="division-collage-grid">{groups.map((group,position)=>{const project=albums.find(row=>row.id===group.id)||albums[position];const projectPhotos=project?.photos.map(photo=>({src:photo.src,alt:photo.alt,caption:photo.caption||project.title}))||[legacyPhotos[position]].filter((photo):photo is GalleryImage=>Boolean(photo));return <CollageGroup key={group.id} division={division} group={group} position={position} fallbackPhotos={projectPhotos} selected={selectedGroup===group.id?selectedPhoto:null} onCountChange={setGalleryCount} onSelect={photo=>{setSelectedGroup(photo===null?null:group.id);setSelectedPhoto(photo);}}/>;})}</div>
    <div className="division-collage-footer"><span><strong>{String(index + 1).padStart(2, "0")}</strong>{division.label}</span><button type="button" className="division-collage-open" onClick={()=>{setSelectedGroup(groups[0].id);setSelectedPhoto(0);}} aria-haspopup="dialog">Lihat {galleryCounts[groups[0].id]||legacyPhotos.length} gambar ↗</button></div>
  </div></PublicText>;
}

function CollageGroup({division,group,position,fallbackPhotos,selected,onCountChange,onSelect}:{division:Division;group:{id:string;title:string;src:string;alt:string};position:number;fallbackPhotos:GalleryImage[];selected:number|null;onCountChange:(id:string,count:number)=>void;onSelect:(index:number|null)=>void}) {
  const childKey=`collageImages:${division.slug}:${group.id}`;
  const childPhotos=useSectionList(childKey,fallbackPhotos);
  const gallery:GalleryImage[]=[{src:group.src,alt:group.alt||group.title,caption:group.title},...childPhotos.filter(photo=>photo.src!==group.src)];
  useEffect(()=>onCountChange(group.id,gallery.length),[group.id,gallery.length,onCountChange]);
  return <div {...sectionListAttributes(childKey,childPhotos)} className="division-collage-group">
    <button type="button" className={`division-collage-photo ${position===0?"division-collage-primary":`division-collage-detail-${position-1}`} ${childPhotos[0]?.kind==="logo"?"is-logo":""}`} onClick={()=>onSelect(0)} aria-haspopup="dialog" aria-label={`Buka kolase ${position+1}: ${group.title}`}>
      <Image src={group.src} alt="" fill sizes={position===0?"(max-width: 800px) 60vw, 32vw":"(max-width: 800px) 32vw, 18vw"}/>
      <span>{group.title}</span>
    </button>
    <PhotoGalleryDialog photos={gallery} title={group.title} index={selected} onSelect={onSelect} onClose={()=>onSelect(null)}/>
  </div>;
}
