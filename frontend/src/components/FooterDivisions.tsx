import Link from "next/link";
import Image from "./CmsImage";
import type {Division} from "../data/divisionCms";
import {internationalPhone} from "../data/siteContent";
export default function FooterDivisions({divisions}:{divisions:Division[]}) {
  if(!divisions.length)return null;
  return <section className="footer-divisions" id="footer-divisi" aria-labelledby="footer-divisions-heading" data-static-motion>
    <h2 id="footer-divisions-heading">Divisi Mahameru Baja</h2>
    <div className="footer-division-list">{divisions.map(division=><article className="footer-division" key={division.slug} data-footer-division={division.slug}>
      <Link className="footer-division-logo" href={`/unit/${division.slug}`} aria-label={`Website ${division.name}`}><Image src={division.logo||"/mbi-mark.svg"} alt={`Logo ${division.name}`} width={180} height={140} sizes="(max-width:560px) 180px, 160px" transparentLogo loading="lazy"/></Link>
      <h3>{division.name}</h3>
      <Link className="footer-division-website" href={`/unit/${division.slug}`}>Buka website divisi</Link>
      <address>{division.address?division.mapsUrl?<a href={division.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={`Lokasi ${division.name}: ${division.address}`}>{division.address}</a>:division.address:"Alamat: konfirmasi dengan admin divisi."}</address>
      <div className="footer-division-admins"><h4>Admin divisi</h4>{division.admins.length?division.admins.map((admin,index)=><a key={`${admin.name}:${index}`} href={`tel:+${internationalPhone(admin.phone)}`} aria-label={`Telepon ${admin.name}, ${division.name}, ${admin.phone}`}><span>{admin.name}</span><strong>{admin.phone}</strong></a>):<Link href={`/unit/${division.slug}/kontak`}>Lihat kontak divisi</Link>}</div>
    </article>)}</div>
  </section>;
}
