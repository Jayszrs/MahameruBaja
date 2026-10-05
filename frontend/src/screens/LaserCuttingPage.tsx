"use client";

import { useState } from "react"
import { Link } from "react-router"
import { laserImage, laserServices, laserFAQs } from "../data/business"
import { createLead, type CreateLeadInput } from "../lib/api"
import RequestHandoff from "../components/RequestHandoff"
import IndustryIcon, { type IconName } from "../components/IndustryIcon"

const scopeCards: { name: string; description: string; image: string; icon: IconName; note: string }[] = [
  { name: "Laser cutting plat & custom", description: "Cutting berdasarkan gambar CAD untuk ornamen, panel dan komponen.", image: "/images/laser-cutting-illustration.jpg", icon: "laser", note: "Visual ilustrasi" },
  { name: "CNC bending & tekuk plat", description: "Kebutuhan tekukan mengikuti ukuran dan gambar teknik yang disetujui.", image: "/images/cnc-bending-visual-v1.png", icon: "bend", note: "Visual ilustrasi" },
  { name: "Fabrikasi & finishing", description: "Diskusikan perakitan, finishing serta kebutuhan ereksion dengan tim.", image: "/images/steel-indonesia/plat-hitam.jpg", icon: "weld", note: "Foto material" },
  { name: "Produksi & pekerjaan proyek", description: "Konsultasikan jumlah, kebutuhan produksi dan jadwal proyek.", image: "/images/hero-steel-logistics-v1.png", icon: "building", note: "Visual ilustrasi" },
]

const workflowSteps: { title: string; icon: IconName }[] = [
  { title: "Gambar & review", icon: "drawing" },
  { title: "Penawaran & persetujuan", icon: "quote" },
  { title: "SPK & jadwal produksi", icon: "calendar" },
  { title: "Cutting · bending · fabrikasi", icon: "machine" },
  { title: "Quality control & selesai", icon: "quality" },
]

export default function LaserCuttingPage() {
  const [selected, setSelected] = useState("Laser Cutting")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [message, setMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [leadId, setLeadId] = useState("")
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
        kind: "LASER",
        businessUnitSlug: "laser-cutting",
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
    <>
      <section className="laser-page-hero">
        <div className="industrial-container">
          <nav className="industrial-eyebrow">
            <Link to="/">BERANDA</Link> / JASA LASER CUTTING
          </nav>
          <div className="laser-page-grid">
            <div>
              <p className="industrial-eyebrow">
                MBI / CUTTING · BENDING · FABRIKASI
              </p>
              <h1>
                Desain Anda.
                <br />
                <span>
                  Langkah produksi
                  <br />
                  berikutnya.
                </span>
              </h1>
              <p>
                Jasa laser cutting plat dan CNC bending untuk kebutuhan custom,
                ornamen, panel, komponen, fabrikasi dan proyek di Bekasi, Tambun
                serta Cibitung.
              </p>
              <a className="industrial-button" href="#request">
                Konsultasikan gambar Anda <span aria-hidden="true">↗</span>
              </a>
            </div>
            <figure>
              <img
                src={laserImage}
                alt="Ilustrasi proses pemotongan plat dengan mesin"
              />
              <figcaption>Visual ilustrasi proses laser cutting.</figcaption>
            </figure>
          </div>
        </div>
      </section>
      <section className="business-section">
        <div className="industrial-container">
          <div className="section-heading">
            <div>
              <p className="industrial-eyebrow">01 / RUANG LINGKUP</p>
              <h2>Dari plat ke komponen.</h2>
            </div>
            <p>
              Setiap kebutuhan ditinjau sesuai gambar kerja.
              <br />
              Tidak ada klaim kapasitas tanpa konfirmasi.
            </p>
          </div>
          <div className="business-grid laser-scope-grid">
            {scopeCards.map((card, index) => (
              <article className="business-card laser-scope-card" data-reveal key={card.name}>
                <div className="laser-scope-media"><img src={card.image} alt="" loading="lazy" /><small>{card.note}</small></div>
                <div className="laser-scope-card-top"><span className="industrial-eyebrow">0{index + 1}</span><span className="laser-scope-icon"><IndustryIcon name={card.icon} size={28} /></span></div>
                <h3>{card.name}</h3>
                <p>{card.description}</p>
                <a className="business-link" href="#request">
                  Request penawaran ↗
                </a>
              </article>
            ))}
          </div>
          <p className="verification-note">Kapasitas mesin, toleransi, dan material yang dapat diproses dikonfirmasi dalam review teknis sebelum penawaran.</p>
        </div>
      </section>
      <section className="laser-visual-strip" aria-label="Ilustrasi proses CNC bending">
        <div className="laser-visual-strip-media" data-parallax="0.27"><img src="/images/cnc-bending-visual-v1.png" alt="Ilustrasi plat logam yang dibentuk dengan mesin CNC bending" /></div>
        <div className="laser-visual-strip-shade" aria-hidden="true" />
        <div className="industrial-container laser-visual-strip-copy" data-reveal>
          <p className="industrial-eyebrow">CUTTING / BENDING / FABRIKASI</p>
          <h2>Dari gambar kerja<br />ke bentuk nyata.</h2>
          <span>Visual ilustrasi proses produksi</span>
        </div>
      </section>
      <section className="laser-process">
        <div className="industrial-container">
          <p className="industrial-eyebrow">02 / ALUR PEKERJAAN</p>
          <h2>Satu gambar. Alur yang jelas.</h2>
          <div className="process-grid">
            {workflowSteps.map((step, index) => (
              <div className="laser-process-step" data-reveal key={step.title}>
                <span>0{index + 1}</span>
                <div className="laser-process-icon"><IndustryIcon name={step.icon} size={42} /></div>
                <h3>{step.title}</h3>
              </div>
            ))}
          </div>
          <p>Pekerjaan dimulai setelah review teknis, penawaran, dan kesepakatan dengan tim.</p>
        </div>
      </section>
      <section id="request" className="business-section">
        <div className="industrial-container request-grid">
          <div>
            <p className="industrial-eyebrow">03 / REQUEST PENAWARAN MBI</p>
            <h2>
              Mulai dari
              <br />
              gambar Anda.
            </h2>
            <p>
              Lengkapi kebutuhan cutting atau bending. Ringkasan akan disiapkan
              untuk dikirim melalui WhatsApp kontak utama dan diteruskan ke unit
              MBI.
            </p>
            <p className="verification-note">
              Data formulir dicatat sebagai lead. Upload file desain ke object
              storage masih tahap berikutnya; untuk sementara kirim lampiran
              langsung di WhatsApp. Nomor khusus MBI menunggu konfirmasi.
            </p>
          </div>
          <form onSubmit={submit} className="laser-request-form">
            <label className="form-full">
              Jenis pekerjaan
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
              { name: "material", label: "Jenis material", required: true },
              {
                name: "ketebalan",
                label: "Ketebalan (mm)",
                required: true,
                type: "number",
              },
              {
                name: "ukuran",
                label: "Ukuran (panjang × lebar)",
                required: true,
              },
              {
                name: "jumlah",
                label: "Jumlah komponen",
                required: true,
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
                DWG, DXF, PDF, AI, CDR, JPG atau PNG. Pemilihan hanya mencatat
                nama file.
              </small>
              {fileError && (
                <span role="alert" className="text-brand">
                  {fileError}
                </span>
              )}
            </label>
            <label className="form-full">
              Catatan pekerjaan
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
              {submitting ? "Menyimpan request..." : "Simpan request penawaran"} <span aria-hidden="true">↗</span>
            </button>
            {message && requestInput && <div className="form-full"><p className="industrial-eyebrow">Request {leadId} tersimpan</p><RequestHandoff input={requestInput} id={leadId} /><p className="text-sm">File desain dikirim terpisah sebagai lampiran WhatsApp.</p></div>}

          </form>
        </div>
      </section>
      <section className="laser-faq business-section">
        <div className="industrial-container">
          <p className="industrial-eyebrow">04 / SEBELUM MEMULAI</p>
          <h2>Pertanyaan laser cutting & bending.</h2>
          {laserFAQs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
