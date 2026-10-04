import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HeroCarousel from "../components/HeroCarousel";
import MotionController from "../components/MotionController";
import SocialProof from "../components/SocialProof";

const whatsapp = "https://wa.me/6281218052017";

const categories = [
  { name: "Besi Beton", slug: "besi-beton", image: "/images/steel-indonesia/besi-beton.jpg", note: "Polos & ulir" },
  { name: "Besi Hollow", slug: "besi-hollow", image: "/images/steel-indonesia/hollow.jpg", note: "Beragam dimensi" },
  { name: "Wiremesh", slug: "wiremesh", image: "/images/steel-indonesia/wiremesh.jpg", note: "Untuk pelat beton" },
  { name: "Bondek", slug: "bondek", image: "/images/steel-indonesia/bondek.jpg", note: "Floor deck" },
  { name: "Baja Ringan", slug: "baja-ringan", image: "/images/steel-indonesia/baja-ringan.jpg", note: "Rangka & reng" },
  { name: "Spandek", slug: "spandek", image: "/images/steel-indonesia/spandek.jpg", note: "Atap metal" },
  { name: "Plat Hitam", slug: "plat-besi", image: "/images/steel-indonesia/plat-hitam.jpg", note: "Plat konstruksi" },
  { name: "Pipa Hitam", slug: "pipa-besi", image: "/images/steel-indonesia/pipa-hitam.jpg", note: "Pipa baja" },
];

const businessRoutes = [
  { index: "01", tag: "Retail / Tambun", title: "Mahameru Baja", text: "Pembelian material satuan dan kebutuhan renovasi dengan konsultasi langsung dari toko Tambun.", href: "/produk", cta: "Lihat katalog" },
  { index: "02", tag: "Retail / Cibitung", title: "Garuda Marginal Baja", text: "Jalur retail untuk pelanggan Cibitung dan kawasan industri di sekitarnya.", href: "/unit/retail-cibitung", cta: "Lihat unit" },
  { index: "03", tag: "Trading / Proyek", title: "Mahameru Baja Indonesia", text: "Pengadaan volume proyek, pengecekan stok, penawaran, dan penjadwalan pengiriman.", href: "/minta-penawaran?unit=trading-proyek", cta: "Request proyek" },
  { index: "04", tag: "Produksi / Custom", title: "MBI Laser Cutting", text: "Laser cutting, CNC bending 160 ton, fabrikasi, dan pekerjaan berbasis gambar teknik.", href: "/laser-cutting", cta: "Lihat layanan" },
];


function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {diagonal ? <path d="M7 17 17 7M8 7h9v9" /> : <path d="M5 12h14m-6-6 6 6-6 6" />}
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41Z" />
      <path d="M11.97 0A11.97 11.97 0 0 0 1.48 17.72L0 24l6.43-1.45A11.9 11.9 0 0 0 11.97 24 12 12 0 1 0 11.97 0Zm0 21.89c-1.79 0-3.54-.48-5.05-1.39l-.36-.22-3.76.99 1-3.66-.24-.38a9.86 9.86 0 0 1-1.51-5.26 9.91 9.91 0 1 1 9.92 9.92Z" />
    </svg>
  );
}

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`home-eyebrow ${light ? "text-white/60" : "text-brand"}`}><span />{children}</p>;
}

function CategoryGrid() {
  return (
    <section className="home-section home-products" aria-labelledby="products-heading">
      <div className="home-shell">
        <div className="home-section-heading" data-reveal>
          <div><Eyebrow>Katalog material</Eyebrow><h2 id="products-heading">Mulai dari material yang tepat.</h2></div>
          <p>Foto produk bersumber dari profil publik Mahameru Baja. Harga dan ketersediaan tetap dikonfirmasi saat pemesanan.</p>
        </div>
        <div className="home-product-grid">
          {categories.map((category, index) => (
            <Link href={`/produk?kategori=${category.slug}`} className={`home-product-tile ${index === 0 || index === 5 ? "home-product-wide" : ""}`} key={category.slug} data-reveal>
              <Image src={category.image} alt={category.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" />
              <div className="home-product-shade" />
              <span className="home-product-index">{String(index + 1).padStart(2, "0")}</span>
              <div><small>{category.note}</small><h3>{category.name}</h3></div>
              <b><Arrow diagonal /></b>
            </Link>
          ))}
        </div>
        <Link href="/produk" className="home-text-link">Lihat semua produk <Arrow /></Link>
      </div>
    </section>
  );
}

function BusinessRoutes() {
  return (
    <section className="home-section home-routes" aria-labelledby="routes-heading">
      <div className="home-shell">
        <div className="home-section-heading" data-reveal>
          <div><Eyebrow light>Satu ekosistem</Eyebrow><h2 id="routes-heading">Kebutuhan berbeda.<br />Alur yang tetap sederhana.</h2></div>
          <p>Pilih jalur sesuai skala dan jenis pekerjaan. Tim yang tepat akan menerima kebutuhan Anda.</p>
        </div>
        <div className="home-route-list">
          {businessRoutes.map((route) => (
            <Link href={route.href} className="home-route-card" key={route.index} data-reveal>
              <span className="home-route-number">{route.index}</span>
              <div><small>{route.tag}</small><h3>{route.title}</h3><p>{route.text}</p></div>
              <strong>{route.cta}<Arrow diagonal /></strong>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreStory() {
  return (
    <section className="home-section home-story" aria-labelledby="story-heading">
      <div className="home-shell home-story-grid">
        <div className="home-story-photo" data-reveal>
          <div className="home-parallax-media" data-parallax="0.06"><Image src="/images/steel-indonesia/toko-mahameru.jpg" alt="Aktivitas pengiriman material di Toko Besi Mahameru Baja" fill sizes="(max-width: 900px) 100vw, 56vw" /></div>
          <span>Dokumentasi toko / Tambun Selatan</span>
        </div>
        <div className="home-story-copy" data-reveal>
          <Eyebrow>Bukan sekadar katalog</Eyebrow>
          <h2 id="story-heading">Dari stok toko sampai kebutuhan proyek.</h2>
          <p>Mahameru Baja melayani kebutuhan material dari satuan sampai volume proyek. Permintaan dicatat, diarahkan ke unit bisnis terkait, lalu ditindaklanjuti melalui penawaran dan WhatsApp.</p>
          <ol>
            <li><span>01</span><div><strong>Cari material</strong><small>Telusuri kategori dan spesifikasi dasar.</small></div></li>
            <li><span>02</span><div><strong>Kirim kebutuhan</strong><small>Isi jumlah, ukuran, lokasi, dan target waktu.</small></div></li>
            <li><span>03</span><div><strong>Terhubung dengan tim</strong><small>Dapatkan konfirmasi stok atau review gambar.</small></div></li>
          </ol>
          <div className="home-actions">
            <Link href="/tentang-kami" className="home-button home-button-dark">Tentang perusahaan <Arrow /></Link>
            <a href={`${whatsapp}?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20konsultasi.`} className="home-inline-wa" target="_blank" rel="noreferrer"><WhatsAppIcon /> Konsultasi WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaserFeature() {
  return (
    <section className="home-laser" aria-labelledby="laser-heading">
      <div className="home-laser-media" data-parallax="0.05"><Image src="/images/laser-cutting-illustration.jpg" alt="Ilustrasi proses laser cutting pada material logam" fill sizes="100vw" /></div>
      <div className="home-laser-shade" />
      <div className="home-shell home-laser-content" data-reveal>
        <Eyebrow light>MBI Laser Cutting / CNC Bending</Eyebrow>
        <h2 id="laser-heading">Gambar teknik Anda.<br /><em>Langkah awal produksi.</em></h2>
        <p>Upload desain, tentukan material dan ketebalan, lalu tim MBI meninjau kebutuhan sebelum penawaran dibuat.</p>
        <div className="home-process-line" aria-label="Alur produksi">
          {["Upload desain", "Review", "Penawaran", "Cutting", "Bending", "QC"].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}
        </div>
        <div className="home-actions">
          <Link href="/laser-cutting#request" className="home-button home-button-primary">Request pekerjaan <Arrow diagonal /></Link>
          <Link href="/laser-cutting" className="home-button home-button-ghost">Lihat layanan <Arrow /></Link>
        </div>
      </div>
    </section>
  );
}


function LocationSection() {
  return (
    <section className="home-section home-location" aria-labelledby="location-heading">
      <div className="home-shell home-location-grid">
        <div className="home-location-copy" data-reveal>
          <Eyebrow>Lokasi & pengiriman</Eyebrow>
          <h2 id="location-heading">Dekat untuk retail.<br />Siap untuk proyek.</h2>
          <p>Jl. Permata Regensi Blok K1 No. 38-39, Tambun Selatan, Kabupaten Bekasi, Jawa Barat.</p>
          <dl>
            <div><dt>Jam layanan</dt><dd>Senin-Sabtu, 07:00-17:00 WIB</dd></div>
            <div><dt>Telepon</dt><dd>021 8830 194</dd></div>
            <div><dt>WhatsApp</dt><dd>+62 812-1805-2017</dd></div>
          </dl>
          <div className="home-actions"><a href="https://www.google.com/maps/search/?api=1&query=Jl.%20Permata%20Regensi%20Blok%20K1%20Tambun%20Selatan%20Bekasi" target="_blank" rel="noreferrer" className="home-button home-button-dark">Buka Google Maps <Arrow diagonal /></a></div>
        </div>
        <div className="home-map" data-reveal>
          <iframe title="Lokasi Toko Besi Mahameru Baja" src="https://www.google.com/maps?q=Jl.%20Permata%20Regensi%20Blok%20K1%20Tambun%20Selatan%20Bekasi&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <div><span>Area layanan</span><strong>Tambun / Cibitung / Bekasi dan sekitarnya</strong></div>
        </div>
      </div>
    </section>
  );
}

function FinalCallout() {
  return (
    <section className="home-final" aria-labelledby="final-heading">
      <div className="home-grid" aria-hidden="true" />
      <div className="home-shell" data-reveal>
        <Image src="/images/steel-indonesia/company-logo.jpeg" alt="MBI" width={92} height={92} />
        <Eyebrow light>Mulai dari kebutuhan Anda</Eyebrow>
        <h2 id="final-heading">Material, gambar, atau daftar kebutuhan.<br />Kirimkan. Kami bantu arahkan.</h2>
        <div className="home-actions">
          <Link href="/minta-penawaran" className="home-button home-button-primary">Minta penawaran <Arrow /></Link>
          <a href={`${whatsapp}?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20bertanya.`} target="_blank" rel="noreferrer" className="home-button home-button-whatsapp"><WhatsAppIcon /> Chat WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return <><MotionController /><HeroCarousel /><CategoryGrid /><BusinessRoutes /><StoreStory /><LaserFeature /><SocialProof /><LocationSection /><FinalCallout /></>;
}
