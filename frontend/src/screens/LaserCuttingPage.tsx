"use client";

import { useState } from "react"
import { Link } from "react-router"
import { laserImage, laserServices, laserFAQs } from "../data/business"
import { createLead, type CreateLeadInput } from "../lib/api"
import RequestHandoff from "../components/RequestHandoff"
import IndustryIcon, { type IconName } from "../components/IndustryIcon"
import { divisions } from "../data/divisionContent"

const scopeCards: { name: string; description: string; image: string; icon: IconName; note: string }[] = [
  { name: "Laser cutting plat & custom", description: "Pemotongan plat dengan laser berdasarkan gambar CAD (gambar kerja digital) untuk ornamen, panel, dan komponen custom.", image: "/images/laser-cutting-illustration.jpg", icon: "laser", note: "Visual ilustrasi" },
  { name: "CNC bending & tekuk plat", description: "Pembentukan plat dengan mesin CNC bending (tekuk plat sesuai ukuran dan sudut) berdasarkan gambar kerja.", image: "/images/cnc-bending-visual-v1.png", icon: "bend", note: "Visual ilustrasi" },
  { name: "Fabrikasi & finishing", description: "Pekerjaan fabrikasi (perakitan dan pengelasan), finishing, hingga erection (pemasangan di lokasi) sesuai kebutuhan proyek.", image: "/images/steel-indonesia/plat-hitam.jpg", icon: "weld", note: "Foto material" },
  { name: "Produksi & pekerjaan proyek", description: "Pengerjaan produksi dalam jumlah tertentu, termasuk kebutuhan custom dan pekerjaan proyek sesuai gambar, spesifikasi, dan jadwal.", image: "/images/hero-steel-logistics-v1.png", icon: "building", note: "Visual ilustrasi" },
]

const workflowSteps: { title: string; desc: string; icon: IconName }[] = [
  { title: "Kirim gambar & kebutuhan", desc: "Kirim gambar kerja, foto, atau daftar barang yang Anda punya. Tidak harus rapi.", icon: "drawing" },
  { title: "Terima penawaran", desc: "Tim mengecek kebutuhan Anda, lalu mengirim harga dan perkiraan waktu pengerjaan.", icon: "quote" },
  { title: "Setuju & atur jadwal", desc: "Sudah cocok? Pesanan dicatat dan jadwal pengerjaan disiapkan.", icon: "calendar" },
  { title: "Barang diproses", desc: "Plat dipotong, ditekuk, dan dirakit sesuai gambar dan spesifikasi.", icon: "machine" },
  { title: "Cek & terima hasil", desc: "Hasil pekerjaan diperiksa sebelum dikirim atau diambil sesuai jadwal.", icon: "quality" },
]

const servicePaths: { title: string; detail: string; href: string; action: string; external?: boolean }[] = [
  { title: "Laser Cutting & CNC Bending", detail: "Cutting plat berdasarkan gambar CAD, bending, komponen custom dan fabrikasi. Jenis material, kapasitas mesin serta jadwal dikonfirmasi setelah review teknis.", href: "#laser-cutting", action: "Lihat detail" },
  { title: "Penjualan Material", detail: "Penjualan berbagai jenis besi dan material baja untuk kebutuhan konstruksi, dari satuan hingga volume besar. Stok selalu diperbarui untuk memastikan ketersediaan.", href: "/produk", action: "Lihat produk" },
  { title: "Konsultasi Material", detail: "Tim berpengalaman kami siap membantu Anda memilih jenis dan spesifikasi material yang tepat, menghitung estimasi kebutuhan, dan memberikan rekomendasi yang sesuai dengan proyek.", href: "https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20konsultasi%20material.", action: "Chat WhatsApp", external: true },
  { title: "Pemesanan Proyek", detail: "Layanan khusus untuk kebutuhan material proyek konstruksi berskala besar. Kami menyediakan penawaran resmi, faktur, dan dapat menyesuaikan jadwal pengiriman sesuai tahapan proyek.", href: "/unit/trading-proyek", action: "Kenali suplai proyek" },
  { title: "Pengiriman Material", detail: "Layanan pengiriman material ke lokasi proyek di area Bekasi dan sekitarnya. Kami memastikan material sampai dalam kondisi baik dan sesuai dengan pesanan.", href: "/minta-penawaran", action: "Tanya pengiriman" },
  { title: "Supply Retail", detail: "Melayani pembelian satuan untuk kebutuhan rumah tangga, renovasi rumah, dan proyek kecil. Tidak ada minimum order untuk pembelian retail.", href: "/unit/retail-tambun", action: "Lihat toko" },
  { title: "Supply Kontraktor & Perusahaan", detail: "Program khusus untuk kontraktor dan perusahaan yang membutuhkan pasokan material secara rutin. Termasuk penawaran harga khusus dan layanan prioritas.", href: "/unit/trading-proyek", action: "Untuk perusahaan" },
]

export default function LaserCuttingPage() {
  const [selected, setSelected] = useState("Laser Cutting")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState("")
  const [message, setMessage] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [leadId, setLeadId] = useState("")
  const [divisionSlug, setDivisionSlug] = useState("laser-cutting")
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
    <>
      <section className="laser-page-hero jasa-hero">
        <div className="industrial-container">
          <nav aria-label="Breadcrumb"><Link to="/">Beranda</Link><span>/</span><span>Jasa</span></nav>
          <div className="laser-page-grid">
            <div>
              <p className="industrial-eyebrow">
                LASER CUTTING / CNC BENDING / FABRIKASI
              </p>
              <h1>
                Potong. Tekuk.<br /><span>Kerjakan dengan presisi.</span>
              </h1>
              <p>
                Mahameru Baja menyediakan material baja, laser cutting, CNC bending,
                dan fabrikasi untuk kebutuhan proyek maupun produksi.
              </p>
              <a className="industrial-button" href="#request">
                Konsultasikan kebutuhan <span aria-hidden="true">↗</span>
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
      <section className="jasa-overview" aria-labelledby="jasa-overview-title"><div className="industrial-container"><div className="jasa-overview-head"><h2 id="jasa-overview-title">Apa yang bisa kami bantu?</h2></div><div className="jasa-paths">{servicePaths.map((path, index) => {
            const inner = <><span>0{index + 1}</span><div><h3>{path.title}</h3><p>{path.detail}</p><strong>{path.action} ↗</strong></div></>;
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
            {message && requestInput && <div className="form-full"><p className="industrial-eyebrow">Request {leadId} tersimpan</p><RequestHandoff input={requestInput} id={leadId} /><p className="text-sm">File desain dikirim terpisah sebagai lampiran WhatsApp.</p></div>}

          </form>
        </div>
      </section>
      <section className="laser-faq business-section">
        <div className="industrial-container">
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
