"use client";

import { useState } from "react"

const workflows = {
  Trading: [
    "Request Baru",
    "Menunggu Cek Stok",
    "Penawaran",
    "Menunggu PO",
    "Menunggu Pembayaran",
    "Siap Kirim",
    "Sudah Dikirim",
    "Selesai",
  ],
  Produksi: [
    "Request Baru",
    "Review Gambar",
    "Penawaran",
    "Menunggu PO",
    "Pembayaran",
    "SPK",
    "Terjadwal",
    "Cutting",
    "Bending",
    "Fabrikasi",
    "QC",
    "Selesai",
    "Invoice",
    "Lunas",
  ],
}
const documentTypes = [
  "Request",
  "Gambar",
  "Quotation / Penawaran",
  "PO Customer",
  "Proforma Invoice",
  "Memo Internal",
  "SPK",
  "Schedule Produksi",
  "Surat Jalan",
  "Invoice",
  "Bukti Pembayaran",
  "Bukti Pengiriman",
  "Catatan Komunikasi",
]
const uploadGroups = [
  { id: "hero", title: "Hero slider & video", hint: "JPG, PNG, WEBP, MP4, WebM - media, urutan, dan poster", accept: "image/jpeg,image/png,image/webp,video/mp4,video/webm" },
  { id: "product", title: "Foto produk", hint: "JPG, PNG, WEBP - katalog dan thumbnail", accept: "image/jpeg,image/png,image/webp" },
  { id: "gallery", title: "Galeri toko & proyek", hint: "JPG, PNG, WEBP - dokumentasi ber-caption", accept: "image/jpeg,image/png,image/webp" },
  { id: "client", title: "Logo klien", hint: "SVG, PNG, WEBP - hanya setelah persetujuan", accept: "image/svg+xml,image/png,image/webp" },
  { id: "design", title: "Desain laser", hint: "DWG, DXF, PDF, AI, CDR, JPG, PNG", accept: ".dwg,.dxf,.pdf,.ai,.cdr,.jpg,.jpeg,.png" },
  { id: "order", title: "Dokumen pekerjaan", hint: "PO, quotation, SPK, memo, invoice, surat jalan", accept: ".pdf,.xlsx,.xls,.doc,.docx" },
  { id: "proof", title: "Bukti transaksi", hint: "Bukti pembayaran, pengiriman, dan penerimaan", accept: "image/jpeg,image/png,image/webp,application/pdf" },
]
const demoOrders = [
  {
    id: "DEMO-MBI-001",
    name: "Contoh kebutuhan panel custom",
    unit: "Produksi" as const,
    status: "Review Gambar",
    notes: "",
    payment: "Belum bayar",
  },
  {
    id: "DEMO-TRD-001",
    name: "Contoh pengadaan material proyek",
    unit: "Trading" as const,
    status: "Menunggu Cek Stok",
    notes: "",
    payment: "Belum bayar",
  },
]

export default function OperationsDemoPage() {
  const [orders, setOrders] = useState(demoOrders)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("Semua")
  const [active, setActive] = useState(orders[0].id)
  const [documents, setDocuments] = useState<Record<string, {
    type: string
    number: string
  }[]>>({})
  const [type, setType] = useState(documentTypes[2])
  const [uploadQueue, setUploadQueue] = useState<Array<{
    group: string
    name: string
    size: number
  }>>([])
  const selected = orders.find((order) => order.id === active)!
  function update(field: "status" | "notes" | "payment", value: string) {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === active ? { ...order, [field]: value } : order,
      ),
    )
  }
  function addDocument() {
    const list = documents[active] || []
    setDocuments((previous) => ({
      ...previous,
      [active]: [
        ...list,
        {
          type,
          number: `DEMO/${active}/${String(list.length + 1).padStart(3, "0")}`,
        },
      ],
    }))
  }
  function download() {
    const file = new Blob(
      [
        JSON.stringify(
          {
            mode: "DEMO_ONLY",
            order: selected,
            documents: documents[active] || [],
            fieldsRequiredForProduction: [
              "Customer / PIC",
              "Spesifikasi",
              "Quantity",
              "Harga terverifikasi",
              "Pajak",
              "Termin pembayaran",
              "Estimasi pengiriman",
              "Persetujuan pelanggan",
            ],
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    )
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    link.href = url
    link.download = `${active}-demo.json`
    link.click()
    URL.revokeObjectURL(url)
  }
  function queueFiles(group: string, files: FileList | null) {
    if (!files) return
    setUploadQueue((current) => [
      ...current,
      ...Array.from(files).map((file) => ({
        group,
        name: file.name,
        size: file.size,
      })),
    ])
  }
  return (
    <section className="business-section cms-dashboard">
      <div className="industrial-container cms-shell">
        <div className="cms-topbar">
          <div className="cms-topbar-brand"><img src="/images/steel-indonesia/company-logo.jpeg" alt="" /><span><strong>Mahameru Baja</strong><small>Content & operations workspace</small></span></div>
          <div className="cms-topbar-actions"><a href="/" className="cms-site-link">Lihat situs <span aria-hidden="true">↗</span></a><form action="/api/admin/logout" method="post"><button type="submit" className="cms-site-link">Keluar</button></form></div>
        </div>
        <div className="cms-hero">
          <div><p className="industrial-eyebrow">WORKSPACE / DEMO INTERAKTIF</p><h1>Kelola konten.<br /><em>Pantau pekerjaan.</em></h1><p>Jelajahi struktur media, alur lead, dan dokumen dalam satu tempat. Perubahan di halaman ini hanya berlaku selama sesi browser.</p></div>
          <div className="cms-hero-status"><span className="cms-status-dot" /> Sesi admin aktif <small>Konten masih mode pratinjau</small></div>
        </div>
        <nav className="cms-jump-nav" aria-label="Navigasi workspace">
          <a href="/admin/konten">Kelola kontak & ulasan ↗</a><a href="#cms-ringkasan">Ringkasan</a><a href="#cms-media">Media & halaman</a><a href="#cms-pekerjaan">Pekerjaan</a>
        </nav>
        <p className="verification-note">
          Simulasi alur dari draf PDF. Database lead publik sudah tersedia,
          dan akses portal kini dilindungi login. Kontak serta ulasan dapat disimpan melalui menu Kelola kontak & ulasan.
          Modul pekerjaan dan object storage belum aktif. File di bawah hanya masuk antrean preview sesi ini.
          Jangan masukkan dokumen pelanggan nyata.
        </p>
        <div className="cms-metrics" id="cms-ringkasan">
          <div><small>01 / PEKERJAAN</small><strong>{orders.length}</strong><span>alur contoh</span></div>
          <div><small>02 / MEDIA</small><strong>{uploadQueue.length}</strong><span>file sesi ini</span></div>
          <div><small>03 / DOKUMEN</small><strong>{Object.values(documents).reduce((total, items) => total + items.length, 0)}</strong><span>metadata contoh</span></div>
          <div><small>04 / STATUS</small><strong className="cms-metric-status">Preview</strong><span>penyimpanan belum aktif</span></div>
        </div>
        <section className="cms-upload-section" id="cms-media" aria-labelledby="cms-upload-title">
          <div className="cms-upload-heading">
            <div>
              <p className="industrial-eyebrow">CMS / MEDIA & DOKUMEN</p>
              <h2 id="cms-upload-title">Pusat media & dokumen.</h2>
            </div>
            <span>{uploadQueue.length} file dalam antrean demo</span>
          </div>
          <div className="cms-upload-grid">
            {uploadGroups.map((group) => (
              <label className="cms-upload-card" key={group.id}>
                <input
                  type="file"
                  accept={group.accept}
                  multiple
                  onChange={(event) => queueFiles(group.title, event.target.files)}
                />
                <span className="cms-upload-icon" aria-hidden="true">+</span>
                <strong>{group.title}</strong>
                <small>{group.hint}</small>
                <b>Pilih file</b>
              </label>
            ))}
          </div>
          {uploadQueue.length > 0 && (
            <div className="cms-upload-queue" aria-live="polite">
              {uploadQueue.map((file, index) => (
                <div key={`${file.name}-${index}`}>
                  <span>{file.group}</span>
                  <strong>{file.name}</strong>
                  <small>{Math.max(1, Math.round(file.size / 1024))} KB</small>
                  <button
                    type="button"
                    onClick={() => setUploadQueue((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    aria-label={`Hapus ${file.name} dari antrean`}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="cms-page-links" aria-label="Pratinjau halaman situs">
          {[
            { title: "Beranda", image: "/images/hero-steel-warehouse-v2.png", href: "/" },
            { title: "Layanan", image: "/images/steel-indonesia/toko-mahameru.jpg", href: "/layanan" },
            { title: "Proyek", image: "/images/cnc-bending-visual-v1.png", href: "/proyek" },
          ].map((page) => <a key={page.title} href={page.href} target="_blank" rel="noopener noreferrer"><img src={page.image} alt="" loading="lazy" /><span>{page.title}<small>Lihat halaman ↗</small></span></a>)}
        </div>
        <div className="cms-section-heading" id="cms-pekerjaan"><div><p className="industrial-eyebrow">WORKFLOW / SIMULASI</p><h2>Daftar pekerjaan</h2></div><span>Pilih pekerjaan untuk melihat detail dan statusnya.</span></div>
        <div className="industrial-actions">
          <input
            aria-label="Cari pekerjaan demo"
            className="border border-light-steel p-3 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari ID, pekerjaan atau status"
          />
          <select
            aria-label="Filter jalur bisnis"
            className="border border-light-steel p-3 text-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            {["Semua", "Trading", "Produksi"].map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
        </div>
        <div className="operations-grid mt-8">
          <aside>
            {orders
              .filter(
                (order) =>
                  (filter === "Semua" || order.unit === filter) &&
                  `${order.id} ${order.name} ${order.status}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              .map((order) => (
                <button
                  key={order.id}
                  onClick={() => setActive(order.id)}
                  aria-pressed={active === order.id}
                  className={`block w-full text-left border p-5 mb-3 ${
                    active === order.id
                      ? "border-brand bg-brand-light"
                      : "border-light-steel"
                  }`}
                >
                  <span className="industrial-eyebrow">{order.id}</span>
                  <h2 className="!text-lg my-2">{order.name}</h2>
                  <p className="text-xs">
                    {order.unit} / {order.status}
                  </p>
                </button>
              ))}
          </aside>
          <article className="border border-light-steel p-6">
            <p className="industrial-eyebrow">{selected.id}</p>
            <h2 className="!text-2xl mt-3 mb-6">{selected.name}</h2>
            <div className="laser-request-form">
              <label>
                Status pekerjaan
                <select
                  value={selected.status}
                  onChange={(event) => update("status", event.target.value)}
                >
                  {workflows[selected.unit].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label>
                Status pembayaran
                <select
                  value={selected.payment}
                  onChange={(event) => update("payment", event.target.value)}
                >
                  {["Belum bayar", "DP", "Lunas"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label className="form-full">
                Catatan follow-up (demo)
                <textarea
                  value={selected.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  placeholder="Gunakan catatan dummy, bukan data pelanggan"
                />
              </label>
              <label className="form-full">
                Folder dokumen — contoh penomoran
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  {documentTypes.map((document) => (
                    <option key={document}>{document}</option>
                  ))}
                </select>
              </label>
              <button
                className="industrial-button form-full"
                onClick={addDocument}
              >
                Tambah metadata dokumen demo +
              </button>
            </div>
            <ul className="mt-5">
              {(documents[active] || []).map((document) => (
                <li
                  key={document.number}
                  className="border-t border-light-steel py-3 text-xs"
                >
                  <strong>{document.type}</strong>
                  <p className="industrial-eyebrow mt-2">{document.number}</p>
                </li>
              ))}
            </ul>
            <button onClick={download} className="business-link mt-5">
              Unduh ringkasan demo (JSON) ↓
            </button>
          </article>
        </div>
      </div>
    </section>
  )
}
