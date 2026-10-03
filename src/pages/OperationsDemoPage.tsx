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
  return (
    <section className="business-section">
      <div className="industrial-container">
        <div className="section-heading">
          <div>
            <p className="industrial-eyebrow">
              PROTOTIPE / BUKAN PANEL ADMIN PRODUKSI
            </p>
            <h1 className="text-4xl">Workspace operasional.</h1>
          </div>
          <span className="industrial-eyebrow">DEMO DATA · SESSION ONLY</span>
        </div>
        <p className="verification-note">
          Simulasi alur dari draf PDF, tanpa autentikasi, database, upload
          dokumen atau data pelanggan nyata. Perubahan hilang saat halaman
          dimuat ulang. Jangan masukkan informasi pribadi. CMS, CRM dan
          analytics produksi memerlukan backend serta kontrol akses.
        </p>
        <div className="business-grid mt-8">
          {[
            "Total lead: belum terhubung",
            "Pengunjung: analytics belum aktif",
            "Permintaan harga: demo",
            "Laser cutting: demo",
          ].map((label) => (
            <div className="business-card" key={label}>
              <p>{label}</p>
            </div>
          ))}
        </div>
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
