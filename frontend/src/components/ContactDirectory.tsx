"use client";
import PublicText from "./PublicText";
import Image from "./CmsImage";
import { mainLogo } from "../data/companyIdentity";
import { useDivisionDirectory } from "./DivisionDirectory";

import { useState } from "react";
import Link from "next/link";

import { contactVisibleInDivision, internationalPhone, type TeamContact } from "../data/siteContent";

export default function ContactDirectory({ contacts, divisionSlug }: { contacts: TeamContact[]; divisionSlug?: string }) {
  const { divisions } = useDivisionDirectory();
  const [selected, setSelected] = useState(divisionSlug || "all");
  const visible = contacts.filter(c => c.published && (selected === "all" ? c.audience === undefined || c.audience.length > 0 : contactVisibleInDivision(c,selected)));
  const unit = divisions.find(d => d.slug === selected);
  return <PublicText><section className="contact-directory" id="tim-kontak">
    <div className="industrial-container">
      <div className="directory-heading" data-reveal><div><p className="industrial-eyebrow">ORANG YANG TEPAT / LANGKAH BERIKUTNYA</p><h2>Mari bicarakan<br /><em>kebutuhan Anda.</em></h2></div><p>Pilih divisi, lalu hubungi tim untuk produk, gambar kerja, atau kebutuhan proyek Anda.</p></div>
      {!divisionSlug && <div className="directory-toolbar"><label htmlFor="contact-division">Hubungi kami — pilih divisi<select id="contact-division" value={selected} onChange={e => setSelected(e.target.value)}><option value="all">Semua divisi</option>{divisions.map(d => <option value={d.slug} key={d.slug}>{d.name} — {d.label}</option>)}</select></label>{unit && <Link href={`/unit/${unit.slug}`}>Lihat profil divisi ↗</Link>}</div>}
      <div className="directory-cards">{visible.map((contact, index) => {
        const provider = unit || divisions.find(d => contact.divisions.includes(d.slug));
        const message = `Halo ${contact.name}, saya ingin berkonsultasi${unit ? ` tentang ${unit.name} (${unit.label})` : " dengan Mahameru Baja"}.`;
        return <article className="directory-card" key={contact.id} data-reveal>
          <div className="directory-portrait"><span className="directory-number">0{index + 1} / MBI</span>{contact.photo ? <img src={contact.photo} alt={contact.name} loading="lazy" /> : <div className="directory-cartoon"><Image src="/images/contact-admin-illustration.webp" alt="Ilustrasi admin bertopi, bukan foto kontak" width={640} height={640} sizes="(max-width:600px) 80vw, 320px"/><Image className="directory-cap-logo" src={provider?.logo || mainLogo} alt={provider?.name || "Mahameru Baja"} width={72} height={64} transparentLogo/><span className="directory-illustration-note">Ilustrasi admin</span></div>}<span className="directory-role">{contact.role}</span></div>
          <div className="directory-card-body"><h3>{contact.name}</h3><p>{contact.divisions.length ? contact.divisions.map(s => divisions.find(d => d.slug === s)?.label).join(" · ") : "Kontak perusahaan"}</p><div className="directory-links">
            {contact.phone && <a href={`tel:+${internationalPhone(contact.phone)}`}><span>Telepon</span><strong>{contact.phone}</strong><span aria-hidden="true">↗</span></a>}
            {contact.mobile && contact.mobile !== contact.phone && <a href={`tel:+${internationalPhone(contact.mobile)}`}><span>Seluler</span><strong>{contact.mobile}</strong><span aria-hidden="true">↗</span></a>}
            {contact.whatsapp && <a href={`https://wa.me/${internationalPhone(contact.whatsapp)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><strong>{contact.whatsapp}</strong></a>}
            {contact.email && <a href={`mailto:${contact.email}`}><span>Email</span><strong>{contact.email}</strong><span aria-hidden="true">↗</span></a>}
          </div>{contact.whatsapp && <a className="directory-whatsapp" href={`https://wa.me/${internationalPhone(contact.whatsapp)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">Chat WhatsApp <span aria-hidden="true">↗</span></a>}</div>
        </article>;
      })}</div>
      {!visible.length && <p className="directory-empty">Tim untuk divisi ini sedang diperbarui. <a href="https://wa.me/6281218052017" target="_blank" rel="noopener noreferrer">Hubungi kontak utama ↗</a></p>}
    </div>
  </section></PublicText>;
}
