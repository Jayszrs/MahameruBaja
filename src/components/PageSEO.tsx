import { useEffect } from "react"
import { useLocation } from "react-router"
import { articles } from "../data/articles"
import { products } from "../data/products"
import { businessUnits, laserFAQs } from "../data/business"
import siteConfiguration from "../../.figma/make/site.json"

const pages: Record<string, [string, string]> = {
  "/": [
    "Laser Cutting, CNC Bending & Toko Besi Bekasi | Mahameru Baja",
    "Konsultasikan laser cutting plat, CNC bending, fabrikasi dan kebutuhan besi baja untuk Tambun, Cibitung serta Bekasi. Jelajahi katalog dan request penawaran.",
  ],
  "/laser-cutting": [
    "Jasa Laser Cutting & CNC Bending Bekasi | Mahameru Baja",
    "Request laser cutting plat dan CNC bending untuk ornamen, panel, komponen custom serta proyek Bekasi, Tambun dan Cibitung. Konsultasikan gambar teknik Anda.",
  ],
  "/produk": [
    "Katalog Besi & Material Baja Bekasi | Mahameru Baja",
    "Cari besi beton, hollow, plat, WF, H-beam, UNP, CNP, siku dan pipa. Filter katalog dan konfirmasi spesifikasi, stok serta harga melalui penawaran.",
  ],
  "/layanan": [
    "Material, Fabrikasi & Supply Proyek | Mahameru Baja",
    "Temukan jalur layanan retail besi, trading material proyek, laser cutting, CNC bending dan fabrikasi dalam ekosistem Mahameru Baja.",
  ],
  "/tentang-kami": [
    "Tentang Ekosistem Mahameru Baja | Tambun & Cibitung",
    "Kenali empat jalur layanan Mahameru Baja: retail Tambun, retail Cibitung, trading proyek dan MBI Laser Cutting.",
  ],
  "/informasi": [
    "Panduan Laser Cutting, Bending & Material Baja | Mahameru Baja",
    "Panduan menyiapkan gambar laser cutting, kebutuhan CNC bending dan memilih material baja untuk proyek Anda.",
  ],
  "/kontak": [
    "Kontak & Konsultasi Material Bekasi | Mahameru Baja",
    "Hubungi tim untuk konsultasi besi baja, permintaan harga, pengadaan proyek atau jasa laser cutting dan bending.",
  ],
  "/proyek": [
    "Galeri Material & Pengerjaan | Mahameru Baja",
    "Jelajahi contoh kategori galeri retail, laser cutting, bending, fabrikasi dan proyek. Dokumentasi aktual menunggu verifikasi.",
  ],
  "/minta-penawaran": [
    "Minta Penawaran Besi & Material Proyek | Mahameru Baja",
    "Susun daftar kebutuhan material dan kirim ringkasan penawaran melalui WhatsApp. Harga dan stok dikonfirmasi oleh tim.",
  ],
}

export default function PageSEO() {
  const { pathname } = useLocation()
  useEffect(() => {
    const product = products.find((item) => pathname === `/produk/${item.slug}`)
    const article = articles.find(
      (item) => pathname === `/informasi/${item.slug}`,
    )
    const unit = businessUnits.find((item) => pathname === `/unit/${item.slug}`)
    const known = Boolean(pages[pathname] || product || article || unit)
    const [title, description] =
      pages[pathname] ||
      (product
        ? [
            `${product.name} | Katalog Mahameru Baja`,
            `Konsultasikan ${product.name} untuk kebutuhan proyek. Spesifikasi contoh, harga dan ketersediaan wajib dikonfirmasi sebelum pemesanan.`,
          ]
        : article
          ? [`${article.title} | Mahameru Baja`, article.excerpt]
          : unit
            ? [`${unit.name} — ${unit.label} | Mahameru Baja`, unit.description]
            : [
                "Halaman Mahameru Baja",
                "Temukan material besi, jasa laser cutting dan layanan proyek Mahameru Baja.",
              ])
    document.title = title
    const setMeta = (key: string, content: string, attribute = "name") => {
      let element = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${key}"]`,
      )
      if (!element) {
        element = document.createElement("meta")
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }
      element.content = content
    }
    setMeta("description", description)
    setMeta(
      "robots",
      known && siteConfiguration.robots.index
        ? "index,follow"
        : "noindex,follow",
    )
    setMeta("og:title", title, "property")
    setMeta("og:description", description, "property")
    setMeta("og:type", article ? "article" : "website", "property")
    setMeta("og:locale", "id_ID", "property")
    setMeta("og:url", `https://mahamerubaja.com${pathname}`, "property")
    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    if (!canonical) {
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = `https://mahamerubaja.com${pathname}`
    const schema = document.createElement("script")
    schema.type = "application/ld+json"
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": "https://mahamerubaja.com/#organization",
          name: "Mahameru Baja",
          url: "https://mahamerubaja.com",
        },
        ...(pathname === "/laser-cutting"
          ? [
              {
                "@type": "Service",
                name: "Laser Cutting & CNC Bending",
                provider: { "@id": "https://mahamerubaja.com/#organization" },
                url: "https://mahamerubaja.com/laser-cutting",
              },
              {
                "@type": "FAQPage",
                mainEntity: laserFAQs.map((item) => ({
                  "@type": "Question",
                  name: item.question,
                  acceptedAnswer: { "@type": "Answer", text: item.answer },
                })),
              },
            ]
          : []),
        ...(article
          ? [
              {
                "@type": "Article",
                headline: article.title,
                description: article.excerpt,
                image: article.image,
                mainEntityOfPage: `https://mahamerubaja.com/informasi/${article.slug}`,
                publisher: { "@id": "https://mahamerubaja.com/#organization" },
              },
            ]
          : []),
      ],
    })
    document.head.appendChild(schema)
    return () => schema.remove()
  }, [pathname])
  return null
}
