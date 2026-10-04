"use client";

import { useState } from 'react';
import { Link } from 'react-router';
import { useReveal } from '../hooks/useReveal';

export default function KontakPage() {
  const [formData, setFormData] = useState({ nama: '', whatsapp: '', email: '', subjek: '', pesan: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { ref, visible } = useReveal();

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.nama.trim()) e.nama = 'Nama harus diisi';
    if (!formData.whatsapp.trim()) e.whatsapp = 'Nomor WhatsApp harus diisi';
    if (!formData.pesan.trim()) e.pesan = 'Pesan harus diisi';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
    setErrors({});
  }

  function Field({ id, label, required = false, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-semibold text-graphite mb-1.5">
          {label} {required && <span className="text-accent">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-400' : 'border-rule focus:border-steel'
    }`;

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-14 bg-graphite relative overflow-hidden" aria-labelledby="kontak-hero-heading">
        <div className="simple-hero-media" data-parallax="0.27" aria-hidden="true"><img src="/images/steel-indonesia/toko-mahameru.jpg" alt="" /></div>
        <div className="simple-hero-shade" aria-hidden="true" />
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
            <span className="text-white/70">Kontak</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-accent">Hubungi Kami</span>
          </div>
          <h1 id="kontak-hero-heading" className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Kontak Mahameru Baja
          </h1>
          <p className="text-white/60 max-w-lg">
            Hubungi kami untuk informasi produk, penawaran harga, atau kunjungi toko kami langsung di Tambun Selatan, Bekasi.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface" aria-labelledby="kontak-section-heading">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <h2 id="kontak-section-heading" className="sr-only">Informasi Kontak</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact info */}
            <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`}>
              <h3 className="text-2xl font-extrabold text-graphite mb-6">Informasi Toko</h3>

              <div className="space-y-5 mb-8">
                {[
                  {
                    icon: <LocationIcon />,
                    label: 'Alamat',
                    content: (
                      <p className="text-sm text-muted leading-relaxed">
                        Jl. Permata Regensi Blok K1 No. 38–39,<br />
                        Sumberjaya, Tambun Selatan,<br />
                        Kabupaten Bekasi, Jawa Barat 17510
                      </p>
                    ),
                  },
                  {
                    icon: <PhoneIcon />,
                    label: 'WhatsApp / Telepon',
                    content: (
                      <div className="flex gap-2">
                        <a href="https://wa.me/6281218052017" target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
                          +62 812-1805-2017
                        </a>
                      </div>
                    ),
                  },
                  {
                    icon: <ClockIcon />,
                    label: 'Jam Operasional',
                    content: (
                      <div className="text-sm text-muted space-y-0.5">
                        <div className="flex gap-4"><span className="font-medium text-graphite w-20">Senin–Sabtu</span><span>07:00 – 17:00 WIB</span></div>
                        <div className="flex gap-4"><span className="font-medium text-graphite w-20">Minggu</span><span>07:00 – 15:00 WIB</span></div>
                      </div>
                    ),
                  },
                ].map(item => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-rule flex items-center justify-center text-muted shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">{item.label}</div>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 mb-8">
                <a
                  href="https://wa.me/6281218052017?text=Halo%20Mahameru%20Baja%2C%20saya%20ingin%20berkonsultasi."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-3 bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-sm rounded-xl transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                    <path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" />
                  </svg>
                  Hubungi via WhatsApp
                </a>
                <a href="tel:+6281218052017"
                  className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-rule hover:bg-surface text-graphite font-bold text-sm rounded-xl transition-colors">
                  <PhoneIcon />
                  Telepon Kami
                </a>
                <a
                  href="https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-rule hover:bg-surface text-graphite font-bold text-sm rounded-xl transition-colors">
                  <LocationIcon />
                  Buka Google Maps
                </a>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-rule bg-surface-2 aspect-[4/3]">
                <iframe title="Lokasi Toko Besi Mahameru Baja di Google Maps" src="https://www.google.com/maps?q=Toko%20Besi%20Mahameru%20Baja%20Tambun%20Selatan&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full border-0" />
              </div>
            </div>

            {/* Contact form */}
            <div>
              <div className="bg-white rounded-2xl border border-rule p-6 lg:p-8">
                <h3 className="text-xl font-extrabold text-graphite mb-6">Kirim Pesan</h3>

                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-positive/15 flex items-center justify-center mx-auto mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-extrabold text-graphite mb-2">Ringkasan siap — belum terkirim</h4>
                    <p className="text-muted text-sm mb-5">Form belum terhubung ke database. Kirim pesan melalui WhatsApp agar tim menerima pertanyaan Anda.</p>
                    <a
                      href={`https://wa.me/6281218052017?text=${encodeURIComponent(`Halo Mahameru Baja, nama saya ${formData.nama}. WhatsApp: ${formData.whatsapp}. Pesan: ${formData.pesan}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white font-bold text-sm rounded-lg"
                    >
                      Lanjut via WhatsApp
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field id="nama" label="Nama" required error={errors.nama}>
                        <input
                          id="nama" type="text" value={formData.nama}
                          onChange={e => setFormData(f => ({ ...f, nama: e.target.value }))}
                          className={inputClass('nama')} placeholder="Nama lengkap"
                        />
                      </Field>
                      <Field id="whatsapp" label="Nomor WhatsApp" required error={errors.whatsapp}>
                        <input
                          id="whatsapp" type="tel" value={formData.whatsapp}
                          onChange={e => setFormData(f => ({ ...f, whatsapp: e.target.value }))}
                          className={inputClass('whatsapp')} placeholder="08xxxxxxxxxx"
                        />
                      </Field>
                    </div>
                    <Field id="email" label="Email">
                      <input
                        id="email" type="email" value={formData.email}
                        onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                        className={inputClass('email')} placeholder="email@example.com (opsional)"
                      />
                    </Field>
                    <Field id="subjek" label="Subjek">
                      <input
                        id="subjek" type="text" value={formData.subjek}
                        onChange={e => setFormData(f => ({ ...f, subjek: e.target.value }))}
                        className={inputClass('subjek')} placeholder="Tentang apa pesan ini?"
                      />
                    </Field>
                    <Field id="pesan" label="Pesan" required error={errors.pesan}>
                      <textarea
                        id="pesan" rows={5} value={formData.pesan}
                        onChange={e => setFormData(f => ({ ...f, pesan: e.target.value }))}
                        className={inputClass('pesan')} placeholder="Tuliskan kebutuhan atau pertanyaan Anda..."
                      />
                    </Field>
                    <button type="submit"
                      className="w-full py-3.5 bg-graphite hover:bg-navy text-white font-bold text-sm rounded-xl transition-colors">
                      Kirim Pesan
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function LocationIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.07 6.07l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>;
}
function ClockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}
