"use client";

import { Link } from 'react-router';
import { useReveal } from '../hooks/useReveal';
import { laserImage } from '../data/business';

const services = [
  { id: 'laser-cutting', title: 'Laser Cutting & CNC Bending', desc: 'Cutting plat berdasarkan gambar CAD, bending, komponen custom dan fabrikasi. Jenis material, kapasitas mesin serta jadwal dikonfirmasi setelah review teknis.', image: laserImage, points: ['Gambar teknik / CAD', 'Cutting custom, ornamen dan panel', 'Bending sesuai gambar kerja', 'Request melalui halaman Laser Cutting & Bending'] },
  {
    id: 'penjualan',
    title: 'Penjualan Material',
    desc: 'Penjualan berbagai jenis besi dan material baja untuk kebutuhan konstruksi, dari satuan hingga volume besar. Stok selalu diperbarui untuk memastikan ketersediaan.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop&auto=format',
    points: ['Besi beton, hollow, siku, UNP, WF', 'Pipa, plat, wiremesh', 'Baja ringan, bondek, spandek', 'Aksesoris konstruksi'],
  },
  {
    id: 'konsultasi',
    title: 'Konsultasi Material',
    desc: 'Tim berpengalaman kami siap membantu Anda memilih jenis dan spesifikasi material yang tepat, menghitung estimasi kebutuhan, dan memberikan rekomendasi yang sesuai dengan proyek.',
    image: 'https://images.unsplash.com/photo-1504387508099-cece71a87e17?w=800&h=500&fit=crop&auto=format',
    points: ['Pemilihan spesifikasi material', 'Estimasi kebutuhan volume', 'Rekomendasi alternatif material', 'Konsultasi via WhatsApp'],
  },
  {
    id: 'proyek',
    title: 'Pemesanan Proyek',
    desc: 'Layanan khusus untuk kebutuhan material proyek konstruksi berskala besar. Kami menyediakan penawaran resmi, faktur, dan dapat menyesuaikan jadwal pengiriman sesuai tahapan proyek.',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=500&fit=crop&auto=format',
    points: ['Penawaran harga khusus proyek', 'Faktur dan dokumen resmi', 'Jadwal suplai bertahap', 'Koordinasi dengan kontraktor'],
  },
  {
    id: 'pengiriman',
    title: 'Pengiriman Material',
    desc: 'Layanan pengiriman material ke lokasi proyek di area Bekasi dan sekitarnya. Kami memastikan material sampai dalam kondisi baik dan sesuai dengan pesanan.',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=500&fit=crop&auto=format',
    points: ['Pengiriman area Bekasi & sekitarnya', 'Armada pengangkut besi', 'Material dikemas dengan aman', 'Estimasi waktu pengiriman'],
  },
  {
    id: 'retail',
    title: 'Supply Retail',
    desc: 'Melayani pembelian satuan untuk kebutuhan rumah tangga, renovasi rumah, dan proyek kecil. Tidak ada minimum order untuk pembelian retail.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=500&fit=crop&auto=format',
    points: ['Tanpa minimum order', 'Beli per batang / lembar / roll', 'Cocok untuk renovasi rumah', 'Dapat diambil langsung di toko'],
  },
  {
    id: 'corporate',
    title: 'Supply Kontraktor & Perusahaan',
    desc: 'Program khusus untuk kontraktor dan perusahaan yang membutuhkan pasokan material secara rutin. Termasuk penawaran harga khusus dan layanan prioritas.',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&h=500&fit=crop&auto=format',
    points: ['Harga khusus volume besar', 'Layanan akun korporat', 'Koordinasi jadwal suplai', 'Dokumen pengadaan lengkap'],
  },
];

function HeroSection() {
  return (
    <section className="pt-36 pb-20 bg-navy relative overflow-hidden" aria-labelledby="services-hero-heading">
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
          <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-white/70">Layanan</span>
        </nav>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-5 h-px bg-accent" />
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-accent">Layanan</span>
        </div>
        <h1 id="services-hero-heading" className="text-4xl sm:text-5xl font-extrabold text-white leading-tight max-w-2xl mb-4">
          Solusi Lengkap<br />Kebutuhan Material Baja
        </h1>
        <p className="text-white/60 max-w-lg text-base leading-relaxed">
          Dari penjualan satuan hingga suplai proyek skala besar — Mahameru Baja siap melayani semua kebutuhan material konstruksi Anda.
        </p>
      </div>
    </section>
  );
}

function ServicesGrid() {
  const { ref, visible } = useReveal();

  return (
    <section className="py-20 bg-surface" aria-labelledby="services-grid-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-14 reveal ${visible ? 'visible' : ''}`}>
          <h2 id="services-grid-heading" className="text-3xl lg:text-[40px] font-extrabold text-graphite">
            Layanan Kami
          </h2>
          <p className="text-muted mt-2 max-w-lg mx-auto">
            Berbagai layanan yang tersedia di Mahameru Baja untuk mendukung proyek Anda.
          </p>
        </div>

        <div className="space-y-16">
          {services.map((service, i) => (
            <div key={service.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
              <div className={`rounded-2xl overflow-hidden aspect-video bg-graphite ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted mb-2">
                  LAYANAN / {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-2xl lg:text-3xl font-extrabold text-graphite mb-3">{service.title}</h3>
                <p className="text-muted leading-relaxed mb-5 text-sm">{service.desc}</p>
                <ul className="space-y-2 mb-6">
                  {service.points.map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-graphite">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <a
                  href={service.id === 'laser-cutting' ? '/laser-cutting#request' : 'https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20bertanya%20tentang%20layanan%20Anda.'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-bold text-sm rounded-lg transition-all hover:-translate-y-0.5"
                >
                  Hubungi Kami
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const { ref, visible } = useReveal();

  const steps = [
    { num: '01', title: 'Hubungi Kami', desc: 'Via WhatsApp, telepon, atau kunjungi toko langsung.' },
    { num: '02', title: 'Ceritakan Kebutuhan', desc: 'Sampaikan jenis material, ukuran, dan jumlah yang dibutuhkan.' },
    { num: '03', title: 'Dapatkan Penawaran', desc: 'Kami berikan penawaran harga terbaik sesuai kebutuhan.' },
    { num: '04', title: 'Konfirmasi & Pembayaran', desc: 'Setujui penawaran dan lakukan konfirmasi pesanan.' },
    { num: '05', title: 'Pengiriman / Pengambilan', desc: 'Material siap dikirim atau dapat diambil di toko.' },
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="process-heading">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div ref={ref} className={`text-center mb-12 reveal ${visible ? 'visible' : ''}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-5 h-px bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-accent">Proses</span>
            <span className="w-5 h-px bg-accent" />
          </div>
          <h2 id="process-heading" className="text-3xl lg:text-[40px] font-extrabold text-graphite">
            Cara Bekerja Sama
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className={`text-center reveal reveal-delay-${i + 1} ${visible ? 'visible' : ''}`}>
              <div className="w-14 h-14 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-3">
                <span className="font-extrabold text-sm text-accent">{step.num}</span>
              </div>
              <h3 className="font-bold text-sm text-graphite mb-1">{step.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesCTA() {
  return (
    <section className="py-16 bg-graphite" aria-label="CTA Layanan">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
          Siap mulai proyek Anda?
        </h2>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Hubungi tim Mahameru Baja sekarang untuk konsultasi dan penawaran harga material.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/minta-penawaran" className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold text-sm rounded-lg transition-colors">
            Minta Penawaran
          </Link>
          <a href="https://wa.me/6281218052017" target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 border border-white/30 text-white font-bold text-sm rounded-lg hover:bg-white/10 transition-colors">
            WhatsApp Kami
          </a>
        </div>
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <HeroSection />
      <ServicesGrid />
      <ProcessSection />
      <ServicesCTA />
    </>
  );
}
