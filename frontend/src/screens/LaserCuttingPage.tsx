"use client";
import { appearanceForSite, type WebsiteAppearance } from "../data/websiteAppearance";
import type { GalleryProject } from "../data/projectGallery";
import ServiceAlbums from "../components/ServiceAlbums";
import PublicText from "../components/PublicText";
import RotatingHeroMedia from "../components/RotatingHeroMedia";
import { useDivisionDirectory } from "../components/DivisionDirectory";

import Image from "../components/CmsImage"
import { useState, type ReactNode } from "react"
import { Link } from "react-router"
import { laserImage, laserServices, laserFAQs } from "../data/business"
import { createLead, type CreateLeadInput } from "../lib/api"
import RequestHandoff from "../components/RequestHandoff"
import IndustryIcon, { type IconName } from "../components/IndustryIcon"


const scopeIcons: IconName[] = ["laser", "bend", "weld", "building", "weld"];

const workflowSteps: { title: string; desc: string; icon: IconName }[] = [
  { title: "Kirim gambar & kebutuhan", desc: "Kirim gambar kerja, foto, atau daftar barang yang Anda punya. Tidak harus rapi.", icon: "drawing" },
  { title: "Terima penawaran", desc: "Tim mengecek kebutuhan Anda, lalu mengirim harga dan perkiraan waktu pengerjaan.", icon: "quote" },
  { title: "Setuju & atur jadwal", desc: "Sudah cocok? Pesanan dicatat dan jadwal pengerjaan disiapkan.", icon: "calendar" },
  { title: "Barang diproses", desc: "Plat dipotong, ditekuk, dan dirakit sesuai gambar dan spesifikasi.", icon: "machine" },
  { title: "Cek & terima hasil", desc: "Hasil pekerjaan diperiksa sebelum dikirim atau diambil sesuai jadwal.", icon: "quality" },
]

const servicePaths: { title: string; detail: string; href: string; action: string; external?: boolean }[] = [
  { title: "Laser Cutting & Bending", detail: "Potong dan tekuk plat sesuai gambar Anda. Kirim desain, ukuran, bahan, dan jumlah agar tim bisa mengecek pengerjaan serta menyiapkan harga.", href: "#laser-cutting", action: "Lihat jasa potong & tekuk" },
  { title: "Penjualan Material", detail: "Cari besi beton, hollow, pipa, plat, dan material bangunan lainnya. Tanyakan ukuran, stok, dan harga terbaru langsung kepada tim toko.", href: "/produk", action: "Cari material" },
  { title: "Bantu Pilih Material", detail: "Masih bingung memilih besi? Ceritakan rencana pekerjaan Anda. Tim membantu mengecek pilihan jenis, ukuran, dan jumlah yang dibutuhkan.", href: "/kontak", action: "Tanya tim toko" },
  { title: "Material untuk Proyek", detail: "Kirim daftar material, jumlah, lokasi, dan rencana pengiriman. Tim MBI Trading membantu menyiapkan penawaran untuk kebutuhan proyek Anda.", href: "/unit/trading-proyek", action: "Hubungi MBI Trading" },
  { title: "Pengiriman Material", detail: "Tanyakan pengiriman ke lokasi Anda di Bekasi dan sekitarnya. Biaya, jangkauan, dan jadwal disepakati bersama admin sesuai pesanan.", href: "/minta-penawaran", action: "Tanya pengiriman" },
  { title: "Belanja untuk Renovasi & Bengkel", detail: "Lengkapi kebutuhan rumah, renovasi, dan bengkel lewat toko Mahameru Baja. Konfirmasikan pilihan material dan jumlah yang ingin dibeli.", href: "/unit/retail-tambun", action: "Lihat toko" },
  { title: "Kebutuhan Kontraktor & Perusahaan", detail: "Butuh material secara rutin atau dalam jumlah besar? Diskusikan daftar kebutuhan, dokumen pemesanan, dan rencana pengiriman dengan tim kami.", href: "/unit/trading-proyek", action: "Tanyakan kebutuhan perusahaan" },
]

export default function LaserCuttingPage({ children, appearance = [], projects = [], faqs = laserFAQs }: { children?: ReactNode; appearance?: WebsiteAppearance[]; projects?: GalleryProject[]; faqs?: { question: string; answer: string }[] }) {
  const cards = appearanceForSite(appearance).services;
  const { divisions } = useDivisionDirectory();
  const [selected, setSelected] = useState("Laser Cutting")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [message, setMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [leadId, setLeadId] = useState("")
  const [divisionSlug, setDivisionSlug] = useState(divisions.find(d=>d.slug === "laser-cutting")?.slug || divisions[0]?.slug || "")
  const [requestInput, setRequestInput] = useState<CreateLeadInput | null>(null)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (fileError) return
    const data = new FormData(event.currentTarget)
    const details = [
      "nama",
      "perusahaan",
      "whatsapp",
      "kota",
      "material",
      "ketebalan",
      "ukuran",
      "jumlah",
      "catatan",
    ]
      .map((field) => `${field}: ${data.get(field) || "-"}`)
      .join("\n")
    setSubmitting(true)
    setSubmitError("")
    try {
      const input: CreateLeadInput = {
        kind: divisionSlug === "laser-cutting" ? "LASER" : divisionSlug === "trading-proyek" ? "TRADING" : "GENERAL",
        businessUnitSlug: divisionSlug,
        name: String(data.get("nama") || ""),
        company: String(data.get("perusahaan") || "") || undefined,
        whatsapp: String(data.get("whatsapp") || ""),
        city: String(data.get("kota") || "") || undefined,
        request: `${selected}\n${details}`,
        consent: true,
        metadata: {
          service: selected,
          material: data.get("material"),
          thickness: data.get("ketebalan"),
          dimensions: data.get("ukuran"),
          quantity: data.get("jumlah"),
          attachmentName: file?.name,
          attachmentSize: file?.size,
        },
      }
      const result = await createLead(input)
      setRequestInput(input)
      setLeadId(result.id)
      setMessage(
        `Halo Mahameru Baja, nomor request saya ${result.id}. Saya ingin request ${selected}.\n${details}\nFile desain: ${file?.name || "akan dikirim melalui chat"}\nMohon arahkan ke tim MBI Laser Cutting dan konfirmasi kelayakan, harga serta jadwal.`,
      )
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Request belum dapat disimpan.")
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <PublicText>
      <section className="company-about-hero jasa-hero">
        <RotatingHeroMedia className="company-about-background" images={[laserImage,"/images/cnc-bending-visual-v1.png","/images/steel-indonesia/plat-hitam.jpg"]} />
        <div className="home-shell"><nav aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/ Jasa</span></nav>
          <p className="industrial-eyebrow">LASER CUTTING / BENDING / FABRIKASI</p>
          <h1>Jasa Cutting Laser Bekasi &amp; Tambun<br /><em>plat, bending &amp; fabrikasi.</em></h1>
          <p>MBI Laser Cutting &amp; Bending melayani jasa cutting laser Tambun, Bekasi, dan sekitarnya untuk potong dan tekuk plat sesuai gambar kerja. Kirim desain, jenis bahan, ketebalan, dan jumlah untuk ditinjau tim sebelum penawaran.</p>
          <div className="home-actions"><a className="home-button home-button-primary" href="#request">Konsultasikan kebutuhan ↗</a><a className="home-button home-button-ghost" href="#album-desain">Jelajahi desain</a><a className="home-button home-button-ghost" href="#portofolio-jasa">Lihat hasil pekerjaan</a></div>
          <small className="jasa-hero-caption">Visual ilustrasi proses laser cutting.</small>
        </div>
      </section>
      {children}
      <section className="jasa-overview" aria-labelledby="jasa-overview-title"><div className="industrial-container"><div className="jasa-overview-head"><h2 id="jasa-overview-title">Apa yang bisa kami bantu?</h2></div><div className="jasa-paths">{servicePaths.map((path, index) => {
            const inner = <><span>0{index + 1}</span><div><h3>{path.title}</h3><p>{path.detail}</p><strong>{path.action}</strong></div></>;
            if (path.external) return <a href={path.href} key={path.title} target="_blank" rel="noreferrer">{inner}</a>;
            if (path.href.startsWith("#")) return <a href={path.href} key={path.title}>{inner}</a>;
            return <Link to={path.href} key={path.title}>{inner}</Link>;
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
                  Request penawaran ↗
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
            {workflowSteps.map((step, index) => (
              <div className="laser-process-step" data-reveal key={step.title}>
                <span>0{index + 1}</span>
                <div className="laser-process-icon"><IndustryIcon name={step.icon} size={42} /></div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <p><strong>Kirim dalam format yang Anda punya.</strong> File DWG, DXF, PDF, foto, atau daftar kebutuhan juga bisa. Tim akan mengecek kebutuhan Anda sebelum memberikan penawaran.</p>
        </div>
      </section>
      <section id="request" className="business-section">
        <div className="industrial-container request-grid">
          <div>
            <h2>Ceritakan kebutuhan material atau jasa Anda.</h2>
            <p>
              Pilih divisi dan ceritakan kebutuhan material atau jasa Anda. Ringkasan tersimpan di portal dan dapat dikirim langsung ke WhatsApp admin divisi.
            </p>
            <p className="verification-note">
              Setelah permintaan tersimpan, lanjutkan percakapan melalui WhatsApp.
              File gambar dikirim sebagai lampiran di sana agar tim bisa meninjaunya.
            </p>
          </div>
          <form onSubmit={submit} className="laser-request-form">
            <label className="form-full">Divisi tujuan<select value={divisionSlug} onChange={e => setDivisionSlug(e.target.value)}>{divisions.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}</select></label>
            <label className="form-full">
              Kebutuhan / layanan
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                {laserServices.map((service) => (
                  <option key={service}>{service}</option>
                ))}
              </select>
            </label>
            {[
              { name: "nama", label: "Nama", required: true },
              { name: "perusahaan", label: "Perusahaan / PIC" },
              {
                name: "whatsapp",
                label: "Nomor WhatsApp",
                required: true,
                type: "tel",
              },
              { name: "kota", label: "Kota / lokasi proyek", required: true },
              { name: "material", label: "Material / produk (jika sudah diketahui)" },
              {
                name: "ketebalan",
                label: "Ketebalan (mm)",
                required: false,
                type: "number",
              },
              {
                name: "ukuran",
                label: "Spesifikasi / ukuran (jika diketahui)",
                required: false,
              },
              {
                name: "jumlah",
                label: "Jumlah kebutuhan",
                required: false,
                type: "number",
              },
            ].map((field) => (
              <label key={field.name}>
                {field.label}
                {field.required && " *"}
                <input
                  name={field.name}
                  type={field.type || "text"}
                  required={field.required}
                  min={
                    field.type === "number"
                      ? field.name === "jumlah"
                        ? "1"
                        : "0.01"
                      : undefined
                  }
                  step={field.name === "jumlah" ? "1" : "any"}
                  placeholder={
                    field.name === "ukuran" ? "Contoh: 600 × 400 mm" : undefined
                  }
                />
              </label>
            ))}
            <label className="form-full">
              Gambar / desain (opsional, maks. 10 MB)
              <input
                type="file"
                accept=".dwg,.dxf,.pdf,.ai,.cdr,.jpg,.jpeg,.png"
                onChange={(event) => {
                  const attachment = event.target.files?.[0] || null
                  const valid =
                    !attachment ||
                    (/\.(dwg|dxf|pdf|ai|cdr|jpe?g|png)$/i.test(
                      attachment.name,
                    ) &&
                      attachment.size <= 10 * 1024 * 1024)
                  setFileError(
                    valid
                      ? ""
                      : "Pilih format yang didukung dengan ukuran maksimal 10 MB.",
                  )
                  setFile(valid ? attachment : null)
                  setMessage("")
                }}
              />
              <small>
                DWG, DXF, PDF, AI, CDR, JPG atau PNG. Setelah mengisi formulir,
                kirim file tersebut sebagai lampiran WhatsApp.
              </small>
              {fileError && (
                <span role="alert" className="text-brand">
                  {fileError}
                </span>
              )}
            </label>
            <label className="form-full">
              Detail kebutuhan / pekerjaan
              <textarea
                name="catatan"
                rows={3}
                placeholder="Detail tekukan, finishing, jadwal kebutuhan atau pertanyaan teknis"
              />
            </label>
            <label className="form-full consent-label">
              <input type="checkbox" required />
              Saya setuju membagikan informasi ini kepada tim melalui WhatsApp.
            </label>
            {submitError && <p role="alert" className="form-full text-brand">{submitError}</p>}
            <button className="industrial-button form-full" type="submit" disabled={submitting}>
              {submitting ? "Menyimpan permintaan..." : "Simpan dan lanjut ke WhatsApp"} <span aria-hidden="true">↗</span>
            </button>
            {message && requestInput && <div className="form-full"><p className="industrial-eyebrow">Request {leadId} tersimpan</p><RequestHandoff input={requestInput} id={leadId} attachment={file} /></div>}

          </form>
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
