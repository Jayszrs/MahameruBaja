import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import HeroCarousel from "../components/HeroCarousel";
import SmoothImage from "../components/SmoothImage";
import SocialProof from "../components/SocialProof";
import type { SiteContent } from "../data/siteContent";
import SocialHub from "../components/SocialHub";
import Promotions from "../components/Promotions";
import { divisions } from "../data/divisionContent";
import { divisionIdentity, mainLogo } from "../data/companyIdentity";

const whatsapp = "https://wa.me/6281218052017";

const businessRoutes = [
  { index: "01", tag: "Toko besi · Tambun", title: "Mahameru Baja", text: "Beli besi dan material bangunan di Tambun untuk kebutuhan satuan, renovasi, atau bengkel. Tanyakan ukuran, stok, dan harga ke tim toko.", href: "/unit/retail-tambun", image: "/images/steel-indonesia/toko-mahameru.jpg", imageAlt: "Toko besi Mahameru Baja" },
  { index: "02", tag: "Toko besi · Cibitung", title: "Garuda Marginal Baja", text: "Cari besi, hollow, pipa, atau plat melalui toko di Cibitung. Tim membantu mengecek pilihan material sesuai kebutuhan Anda.", href: "/unit/retail-cibitung", image: "/images/steel-indonesia/hollow.jpg", imageAlt: "Besi hollow di jalur toko material" },
  { index: "03", tag: "Suplai proyek · Tambun & Cibitung", title: "Mahameru Baja Indonesia", text: "Kirim daftar material, volume, dan lokasi proyek di Tambun, Cibitung, dan Bekasi. Tim menyiapkan pengecekan kebutuhan, penawaran, dan jadwal suplai.", href: "/unit/trading-proyek", image: "/images/steel-indonesia/besi-beton.jpg", imageAlt: "Besi beton untuk kebutuhan proyek" },
  { index: "04", tag: "Jasa produksi · Sesuai gambar", title: "MBI Laser Cutting", text: "Potong dan tekuk plat sesuai gambar kerja. Kirim file, jenis material, ukuran, dan jumlah untuk ditinjau sebelum penawaran.", href: "/unit/laser-cutting", image: "/images/laser-cutting-illustration.jpg", imageAlt: "Ilustrasi proses laser cutting plat" },
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

function BusinessRoutes() {
  return (
    <section className="home-section home-routes" id="pilih-divisi" aria-labelledby="routes-heading">
      <div className="home-shell">
        <div className="home-section-heading" data-reveal>
          <div><Eyebrow>Jaringan Mahameru Group</Eyebrow><h2 id="routes-heading">Lima divisi.<br />Satu Mahameru, satu solusi.</h2></div>
          <p>Pilih kebutuhan Anda, kami akan mengarahkan ke tim yang tepat. Buka website divisi untuk melihat layanan dan menghubungi adminnya.</p>
        </div>
        <div className="home-route-list">
          {divisions.map((division, index) => {
            const route = businessRoutes[index] || { index: "05", tag: division.label, title: division.name, text: division.intro, href: `/unit/${division.slug}`, image: division.hero, imageAlt: division.name };
            return (
            <Link href={route.href} prefetch={false} className="home-route-card" key={route.index} data-reveal>
              <div className="home-route-media" data-parallax="0.12"><SmoothImage src={route.image} alt={route.imageAlt} sizes="(max-width: 760px) 100vw, (max-width: 1500px) 50vw, 860px" /></div>
              <span className="home-route-shade" aria-hidden="true" />
              <span className="home-route-number">{route.index}</span>
              <Image className="route-division-logo" src={divisionIdentity[division.slug].logo} alt={`Logo ${division.name}`} width={140} height={120} />
              <div><small>{route.tag}</small><h3>{division.name}</h3><p>{route.text}</p></div>
              <strong>Buka website divisi <Arrow diagonal /></strong>
            </Link>
          ); })}
        </div>
        <div className="home-needs" aria-label="Pilih berdasarkan kebutuhan">
          <p>Mulai dari kebutuhan Anda</p>
          <div>
            <Link href="/unit/retail-tambun">Saya mau beli besi satuan di Tambun <Arrow diagonal /></Link>
            <Link href="/unit/retail-cibitung">Saya cari hollow, pipa, atau plat di Cibitung <Arrow diagonal /></Link>
            <Link href="/unit/trading-proyek">Saya butuh material untuk proyek <Arrow diagonal /></Link>
            <Link href="/unit/laser-cutting">Saya mau potong atau tekuk plat sesuai gambar <Arrow diagonal /></Link>
            <Link href="/unit/fabrikasi-erection/kontak">Saya ingin konsultasi fabrikasi dan erection <Arrow diagonal /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderFlow() {
  return (
    <section className="home-section home-order" id="cara-pesan" aria-labelledby="order-heading">
      <div className="home-shell">
        <div className="home-order-heading" data-reveal>
          <div><h2 id="order-heading">Cara pesan di Mahameru Baja</h2></div>
        </div>
        <ol className="home-order-steps">
          <li data-reveal><span>01</span><div><h3>Pilih divisi yang sesuai</h3><p>Retail Tambun, Retail Cibitung, MBI Trading, MBI Laser Cutting & Bending, atau MBI Project Fabrikasi & Erection.</p><Link href="#pilih-divisi">Lihat pilihan divisi <Arrow diagonal /></Link></div></li>
          <li data-reveal><span>02</span><div><h3>Kirim kebutuhan</h3><p>Cantumkan material atau gambar, ukuran, jumlah, lokasi, dan tanggal kebutuhan.</p><Link href="/minta-penawaran">Isi permintaan <Arrow diagonal /></Link></div></li>
          <li data-reveal><span>03</span><div><h3>Setujui penawaran</h3><p>Tim mengecek stok atau proses kerja, lalu mengirim harga, perkiraan waktu, dan ketentuan pembayaran. Pesanan diproses setelah Anda setuju.</p><Link href={`${whatsapp}?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20menanyakan%20penawaran%20saya.`} target="_blank" rel="noreferrer">Tanya penawaran saya <Arrow diagonal /></Link></div></li>
          <li data-reveal><span>04</span><div><h3>Terima barang atau hasil kerja</h3><p>Pengiriman material atau penyelesaian pekerjaan mengikuti jadwal yang disepakati.</p><Link href="/kontak">Lihat kontak tim <Arrow diagonal /></Link></div></li>
        </ol>
        <div className="home-order-help">
          <div className="home-order-card" data-reveal>
            <h3>Sudah tahu barang yang Anda mau?</h3>
            <p>Tulis jenis material, ukuran, dan jumlah di formulir. Tim mengecek stok lalu mengirim penawaran.</p>
            <Link href="/minta-penawaran" className="home-button home-button-primary">Kirim permintaan penawaran</Link>
          </div>
          <div className="home-order-card" data-reveal>
            <h3>Belum tahu ukurannya?</h3>
            <p>Kirim foto, deskripsi, atau info seadanya lewat WhatsApp. Tim kami membantu menyusunnya sampai jelas.</p>
            <a className="home-button home-button-primary" href={`${whatsapp}?text=Halo%20Mahameru%20Baja%2C%20saya%20belum%20tahu%20ukuran%20yang%20saya%20butuhkan.%20Ini%20info%20yang%20saya%20punya%3A%20`} target="_blank" rel="noreferrer">Tanya lewat WhatsApp</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaserFeature() {
  return (
    <section className="home-laser" aria-labelledby="laser-heading">
      <div className="home-laser-media" data-parallax="0.15"><SmoothImage src="/images/cnc-bending-visual-v1.png" alt="Ilustrasi proses CNC bending pada plat logam" sizes="100vw" /></div>
      <div className="home-laser-shade" />
      <div className="home-shell home-laser-content" data-reveal>
        <h2 id="laser-heading">Butuh plat dipotong atau ditekuk sesuai gambar?</h2>
        <p>Kirim gambar DWG, DXF, atau PDF beserta jenis material, ketebalan, ukuran, dan jumlah. Tim MBI Laser Cutting akan meninjau proses cutting dan bending sebelum memberi penawaran.</p>
        <div className="home-process-line" aria-label="Alur produksi">
          {["Siapkan desain", "Review", "Penawaran", "Cutting", "Bending", "QC"].map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></div>)}
        </div>
        <div className="home-actions">
          <Link href="/jasa#request" className="home-button home-button-primary">Kirim gambar untuk ditinjau</Link>
          <Link href="/unit/laser-cutting" className="home-button home-button-ghost">Kenali layanan potong & tekuk</Link>
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
          <Eyebrow>Lokasi</Eyebrow>
          <h2 id="location-heading">Dekat. Lengkap.<br />Siap melayani kebutuhan Anda.</h2>
          <p>Solusi material untuk setiap proyek. Kunjungi tim kami untuk kebutuhan baja, laser cutting, dan CNC bending.</p>
          <p>Jl. Permata Regensi Blok K1 No. 38-39, Tambun Selatan, Kabupaten Bekasi, Jawa Barat.</p>
          <dl>
            <div><dt>Jam layanan</dt><dd>Senin-Sabtu, 07:00-17:00 WIB</dd></div>
            <div><dt>Telepon</dt><dd>021 8830 194</dd></div>
            <div><dt>WhatsApp</dt><dd>+62 812-1805-2017</dd></div>
          </dl>
          <div className="home-actions"><a href="https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8" target="_blank" rel="noreferrer" className="home-button home-button-dark">Buka Google Maps <Arrow diagonal /></a></div>
        </div>
        <div className="home-map" data-reveal>
          <div className="home-map-heading"><span>Kunjungi kami</span><strong>Toko Besi Mahameru Baja</strong><a href="https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8" target="_blank" rel="noopener noreferrer">Petunjuk arah ↗</a></div>
          <div className="home-map-canvas"><iframe title="Lokasi Toko Besi Mahameru Baja" src="https://www.google.com/maps?q=Toko%20Besi%20Mahameru%20Baja%20Tambun%20Selatan&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
          <div className="home-map-caption"><span>Area layanan</span><strong>Tambun · Cibitung · Bekasi dan sekitarnya</strong></div>
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
        <Image src={mainLogo} alt="Mahameru Baja Indonesia — MBI Laser Cutting" width={160} height={130} />
        <h2 id="final-heading">Siap kirim daftar material atau gambar kerja?</h2>
        <p>Isi formulir untuk mendapat penawaran, atau tanyakan kebutuhan awal melalui WhatsApp.</p>
        <div className="home-actions">
          <Link href="/minta-penawaran" className="home-button home-button-primary">Minta penawaran</Link>
          <a href={`${whatsapp}?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20bertanya.`} target="_blank" rel="noreferrer" className="home-button home-button-whatsapp"><WhatsAppIcon /> Chat WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ content }: { content: SiteContent }) {
  return <><HeroCarousel slides={content.heroSlides} rating={content.rating} ratingDate={content.ratingDate} mapsUrl={content.mapsUrl} /><Promotions promotions={content.promotions} /><LaserFeature /><OrderFlow /><SocialProof content={content} /><SocialHub accounts={content.socialAccounts} posts={content.socialPosts} /><LocationSection /><FinalCallout /><BusinessRoutes /></>;
}
