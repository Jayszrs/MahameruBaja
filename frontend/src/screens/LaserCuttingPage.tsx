"use client";
import { appearanceForSite, type WebsiteAppearance } from "../data/websiteAppearance";
import type { GalleryProject } from "../data/projectGallery";
import ServiceAlbums from "../components/ServiceAlbums";
import PublicText from "../components/PublicText";
import RotatingHeroMedia from "../components/RotatingHeroMedia";
import { useDivisionDirectory } from "../components/DivisionDirectory";

import Image from "../components/CmsImage"
import { useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router"
import { laserImage, laserServices, laserFAQs } from "../data/business"
import ServiceRequestWizard from "../components/ServiceRequestWizard"
import IndustryIcon, { type IconName } from "../components/IndustryIcon"


const scopeIcons: IconName[] = ["laser", "bend", "weld", "building", "weld"];

export default function LaserCuttingPage({ children, appearance = [], projects = [], faqs = laserFAQs }: { children?: ReactNode; appearance?: WebsiteAppearance[]; projects?: GalleryProject[]; faqs?: { question: string; answer: string }[] }) {
  const config = appearanceForSite(appearance);
  const cards = config.services;
  const { divisions } = useDivisionDirectory();
  const [selected, setSelected] = useState("")
  useEffect(() => {
    const choose = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>(".service-process-options a[data-service-choice]") : null;
      const service = link?.dataset.serviceChoice;
      if (service && laserServices.includes(service)) setSelected(service);
    };
    document.addEventListener("click", choose);
    return () => document.removeEventListener("click", choose);
  }, []);
  return (
    <PublicText>
      <section className="company-about-hero jasa-hero">
        <RotatingHeroMedia className="company-about-background" images={config.serviceHeroImage ? [config.serviceHeroImage] : [laserImage,"/images/cnc-bending-visual-v1.png","/images/steel-indonesia/plat-hitam.jpg"]} />
        <div className="home-shell"><nav aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/ Jasa</span></nav>
          <p className="industrial-eyebrow">LASER CUTTING / BENDING / FABRIKASI</p>
          <h1>Jasa Cutting Laser Bekasi &amp; Tambun<br /><em>plat, bending &amp; fabrikasi.</em></h1>
          <p>MBI Laser Cutting &amp; Bending melayani jasa cutting laser Tambun, Bekasi, dan sekitarnya untuk potong dan tekuk plat sesuai gambar kerja. Kirim desain, jenis bahan, ketebalan, dan jumlah untuk ditinjau tim sebelum penawaran.</p>
          <div className="home-actions"><a className="home-button home-button-primary" href="#request">Konsultasikan kebutuhan ↗</a><a className="home-button home-button-ghost" href="#album-desain">Jelajahi desain</a><a className="home-button home-button-ghost" href="#portofolio-jasa">Lihat hasil pekerjaan</a></div>
          <small className="jasa-hero-caption">Visual ilustrasi proses laser cutting.</small>
        </div>
      </section>
      {children}
      <section className="jasa-overview" aria-labelledby="jasa-overview-title"><div className="industrial-container"><div className="jasa-overview-head"><h2 id="jasa-overview-title">Apa yang bisa kami bantu?</h2></div><div className="jasa-paths">{config.servicePaths.map((path, index) => {
            const inner = <><div className="jasa-path-illustration">{path.image && <Image src={path.image} alt={path.alt || `Ilustrasi ${path.title.toLowerCase()}`} width={480} height={300} sizes="(max-width:650px) 100vw, 33vw" />}</div><div className="jasa-path-copy"><span>0{index + 1}</span><h3>{path.title}</h3><p>{path.text}</p><strong>{path.ctaLabel || "Lihat pilihan"} <b aria-hidden="true">&#8599;</b></strong></div></>;
            if (path.href.startsWith("#")) return <a href={path.href || "/kontak"} key={path.title}>{inner}</a>;
            return <Link to={path.href || "/kontak"} key={path.title}>{inner}</Link>;
          })}</div></div></section>
      <section id="laser-cutting" className="business-section">
        <div className="industrial-container">
          <div className="section-heading">
            <div>
              <p className="industrial-eyebrow">01 / RUANG LINGKUP</p>
              <h2>Detail jasa laser cutting, bending, dan fabrikasi.</h2>
            </div>
          </div>
          <div className="business-grid laser-scope-grid">
            {cards.map((card, index) => (
              <article className="business-card laser-scope-card" data-reveal key={card.id}>
                {card.image && <div className="laser-scope-media"><Image src={card.image} alt={card.alt || card.title} fill sizes="(max-width:650px) 90vw, 25vw" /><small>{card.alt}</small></div>}
                <div className="laser-scope-card-top"><span className="industrial-eyebrow">0{index + 1}</span><span className="laser-scope-icon"><IndustryIcon name={scopeIcons[index] || "weld"} size={28} /></span></div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <a className="business-link" href={card.href || "#request"}>
                  {card.ctaLabel || "Request penawaran"} ↗
                </a>
              </article>
            ))}
          </div>
          <p className="verification-note">Tim mengecek jenis bahan, ukuran, ketebalan, dan kemampuan mesin sebelum memberikan harga serta jadwal pengerjaan.</p>
        </div>
      </section>
      <ServiceAlbums projects={projects} />
      <section className="laser-process">
        <div className="industrial-container">
          <h2>Alur pekerjaan dari gambar yang Anda kirim.</h2>
          <div className="process-grid">
            {config.serviceWorkflow.map((step, index) => (
              <div className="laser-process-step" data-reveal key={step.title}>
                <span>0{index + 1}</span>
                <div className="laser-process-icon">{step.image ? <Image src={step.image} alt={step.alt || step.title} width={180} height={110} /> : <IndustryIcon name="drawing" size={42} />}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
          <p><strong>Kirim dalam format yang Anda punya.</strong> File DWG, DXF, PDF, foto, atau daftar kebutuhan juga bisa. Tim akan mengecek kebutuhan Anda sebelum memberikan penawaran.</p>
        </div>
      </section>
      <section id="request" className="business-section service-wizard-section">
        <div className="industrial-container">
          <header className="service-wizard-intro"><h2>Minta penawaran, satu langkah demi langkah.</h2><p>Isi layanan, detail pekerjaan, dan kontak. Tim kami mengecek kebutuhan sebelum memberikan harga.</p></header>
          <ServiceRequestWizard divisions={divisions} service={selected} onServiceChange={setSelected} />
        </div>
      </section>
      <section className="laser-faq business-section">
        <div className="industrial-container">
          <h2>Pertanyaan laser cutting & bending.</h2>
          {faqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicText>
  )
}
