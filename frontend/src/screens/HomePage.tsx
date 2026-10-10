import Image from "next/image";
import Link from "next/link";
import SmoothImage from "../components/SmoothImage";
import type { SiteContent } from "../data/siteContent";
import { divisions, type Division } from "../data/divisionContent";
import UnifiedHomeContent from "../components/UnifiedHomeContent";
import { divisionIdentity } from "../data/companyIdentity";


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

function BusinessRoutes() {
  return (
    <section className="home-section home-routes" id="pilih-divisi" aria-labelledby="routes-heading">
      <div className="home-shell">
        <div className="home-section-heading" data-reveal>
          <div><p className="home-eyebrow text-brand"><span />Jaringan Mahameru Group</p><h2 id="routes-heading">Lima divisi.<br />Satu Mahameru, satu solusi.</h2></div>
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

export default function HomePage({ content, division }: { content: SiteContent; division?: Division }) {
  return <UnifiedHomeContent content={content} division={division}><BusinessRoutes /></UnifiedHomeContent>;
}
