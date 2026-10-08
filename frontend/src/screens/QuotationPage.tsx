"use client";

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useQuotation } from '../context/QuotationContext';
import { businessUnits } from '../data/business';
import { createLead, type CreateLeadInput } from '../lib/api';
import RequestHandoff from '../components/RequestHandoff';

interface ProductRow {
  id: string;
  produk: string;
  spesifikasi: string;
  jumlah: string;
  satuan: string;
}

const satuanOptions = ['Batang', 'Kg', 'Ton', 'Lembar', 'Roll', 'Set', 'Unit', 'Meter'];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function QuotationPage() {
  const { items } = useQuotation();
  const [params] = useSearchParams();
  const [unit, setUnit] = useState(businessUnits.some(item => item.slug === params.get('unit')) ? params.get('unit')! : 'retail-tambun');
  const [formData, setFormData] = useState({
    nama: '', perusahaan: '', whatsapp: '', email: '', lokasi: '', catatan: '',
  });
  const [rows, setRows] = useState<ProductRow[]>(() => items.length ? items.map(item => ({ id: item.id, produk: item.name, spesifikasi: [item.shortSpec, item.notes].filter(Boolean).join(' / '), jumlah: String(item.qty), satuan: item.unit })) : [
    { id: generateId(), produk: '', spesifikasi: '', jumlah: '', satuan: 'Batang' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [leadId, setLeadId] = useState('');
  const [requestInput, setRequestInput] = useState<CreateLeadInput | null>(null);

  function addRow() {
    if (rows.length >= 50) return;
    setRows(r => [...r, { id: generateId(), produk: '', spesifikasi: '', jumlah: '', satuan: 'Batang' }]);
  }

  function removeRow(id: string) {
    if (rows.length === 1) return;
    setRows(r => r.filter(row => row.id !== id));
  }

  function updateRow(id: string, field: keyof ProductRow, value: string) {
    setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row));
  }

  function buildWAMessage() {
    const selectedUnit = businessUnits.find(item => item.slug === unit)?.label || unit;
    const products = rows
      .filter(row => row.produk.trim())
      .map(row => `- ${row.produk.trim()}${row.spesifikasi.trim() ? ` (${row.spesifikasi.trim()})` : ''}: ${row.jumlah || 'jumlah konfirmasi'} ${row.satuan}`);
    const message = [
      'Halo Mahameru Baja, saya ingin meminta penawaran.',
      `Nama: ${formData.nama || '-'}`,
      `Perusahaan: ${formData.perusahaan || '-'}`,
      `WhatsApp: ${formData.whatsapp || '-'}`,
      `Email: ${formData.email || '-'}`,
      `Lokasi: ${formData.lokasi || '-'}`,
      `Divisi: ${selectedUnit}`,
      'Daftar material:',
      ...(products.length ? products : ['- Belum diisi']),
      `Catatan: ${formData.catatan || '-'}`,
    ].join('\n');
    return encodeURIComponent(message);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (formData.nama.trim().length < 2) e.nama = 'Nama harus diisi';
    if (!/^[+0-9 ()-]{8,24}$/.test(formData.whatsapp.trim())) e.whatsapp = 'Isi nomor WhatsApp yang valid';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Email tidak valid';
    if (rows.some(r => r.produk.trim() && r.jumlah && (!Number.isFinite(Number(r.jumlah)) || Number(r.jumlah) <= 0))) e.rows = 'Jumlah harus lebih besar dari nol';
    if (rows.every(r => !r.produk.trim())) e.rows = 'Masukkan minimal satu produk';
    if (!consent) e.consent = 'Persetujuan diperlukan agar tim dapat menindaklanjuti permintaan';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitError('');
    setSubmitting(true);
    try {
      const input: CreateLeadInput = {
        kind: unit === 'trading-proyek' ? 'TRADING' : 'QUOTATION',
        businessUnitSlug: unit,
        name: formData.nama,
        company: formData.perusahaan || undefined,
        whatsapp: formData.whatsapp,
        email: formData.email || undefined,
        city: formData.lokasi || undefined,
        request: formData.catatan || undefined,
        consent: true,
        items: rows.filter(row => row.produk.trim()).map(row => ({
          productName: row.produk,
          specification: row.spesifikasi || undefined,
          quantity: row.jumlah ? Number(row.jumlah) : undefined,
          unit: row.satuan,
        })),
      };
      const result = await createLead(input);
      setRequestInput(input);
      setLeadId(result.id);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Permintaan belum dapat disimpan.');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none transition-colors ${
      errors[field] ? 'border-red-400 focus:border-red-400' : 'border-rule focus:border-steel'
    }`;

  if (submitted && requestInput) {
    return <div className="quote-success industrial-container"><p className="industrial-eyebrow">PERMINTAAN TERSIMPAN / {leadId}</p><h1>Satu langkah lagi.<br /><em>Kirim ke tim kami.</em></h1><RequestHandoff input={requestInput} id={leadId} /><div className="industrial-actions"><button type="button" className="industrial-button" onClick={() => setSubmitted(false)}>Ubah rincian / buat permintaan baru</button><Link to="/produk" className="editorial-link">Kembali ke katalog</Link></div></div>;
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-12 bg-navy relative overflow-hidden" aria-labelledby="quotation-hero-heading">
        <div className="simple-hero-media" data-parallax="0.27" aria-hidden="true"><img src="/images/hero-steel-logistics-v1.png" alt="" /></div>
        <div className="simple-hero-shade" aria-hidden="true" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-white/70">Minta Penawaran</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-px bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-accent">Penawaran</span>
          </div>
          <h1 id="quotation-hero-heading" className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            Minta Penawaran Material
          </h1>
          <p className="text-white/60 max-w-lg text-sm leading-relaxed">
            Isi formulir di bawah untuk mendapatkan penawaran harga. Tim kami akan merespons melalui WhatsApp sesegera mungkin.
          </p>
          <small className="simple-visual-note">Visual ilustrasi pengiriman</small>
        </div>
      </section>

      <section className="py-12 bg-surface" aria-label="Form Penawaran">
        <div className="max-w-[860px] mx-auto px-6 lg:px-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white border border-rule p-6 mb-5 rounded-xl"><label htmlFor="unit-tujuan" className="block text-sm font-semibold mb-2">Unit tujuan</label><select id="unit-tujuan" value={unit} onChange={event => setUnit(event.target.value)} className="w-full border border-rule p-3 text-sm">{businessUnits.map(item => <option key={item.slug} value={item.slug}>{item.name} — {item.label}</option>)}</select><p className="text-xs text-muted mt-3">Nomor khusus unit menunggu konfirmasi. Ringkasan dikirim melalui kontak utama.</p>{unit === 'laser-cutting' && <Link to="/jasa#request" className="block text-sm text-brand font-semibold mt-3">Gunakan form khusus laser cutting & bending →</Link>}</div>

            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-rule p-6 mb-5">
              <h2 className="text-lg font-extrabold text-graphite mb-5">Informasi Kontak</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nama" className="block text-sm font-semibold text-graphite mb-1.5">
                    Nama <span className="text-accent">*</span>
                  </label>
                  <input id="nama" type="text" value={formData.nama}
                    onChange={e => setFormData(f => ({ ...f, nama: e.target.value }))}
                    className={inputClass('nama')} placeholder="Nama lengkap Anda" />
                  {errors.nama && <p className="mt-1 text-xs text-red-500">{errors.nama}</p>}
                </div>
                <div>
                  <label htmlFor="perusahaan" className="block text-sm font-semibold text-graphite mb-1.5">Nama Perusahaan / Proyek</label>
                  <input id="perusahaan" type="text" value={formData.perusahaan}
                    onChange={e => setFormData(f => ({ ...f, perusahaan: e.target.value }))}
                    className={inputClass('perusahaan')} placeholder="Opsional" />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-semibold text-graphite mb-1.5">
                    Nomor WhatsApp <span className="text-accent">*</span>
                  </label>
                  <input id="whatsapp" type="tel" value={formData.whatsapp}
                    onChange={e => setFormData(f => ({ ...f, whatsapp: e.target.value }))}
                    className={inputClass('whatsapp')} placeholder="08xxxxxxxxxx" />
                  {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-graphite mb-1.5">Email</label>
                  <input id="email" type="email" value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className={inputClass('email')} placeholder="email@example.com (opsional)" />
                  {errors.email && <p role="alert" className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="lokasi" className="block text-sm font-semibold text-graphite mb-1.5">Lokasi Proyek</label>
                  <input id="lokasi" type="text" value={formData.lokasi}
                    onChange={e => setFormData(f => ({ ...f, lokasi: e.target.value }))}
                    className={inputClass('lokasi')} placeholder="Kota / Kecamatan lokasi proyek" />
                </div>
              </div>
            </div>

            {/* Product rows */}
            <div className="bg-white rounded-2xl border border-rule p-6 mb-5">
              <h2 className="text-lg font-extrabold text-graphite mb-5">Daftar Kebutuhan Material</h2>
              {errors.rows && <p className="mb-3 text-sm text-red-500">{errors.rows}</p>}

              <div className="space-y-3">
                {rows.map((row, i) => (
                  <div key={row.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-4">
                      {i === 0 && <div className="text-xs font-semibold text-muted mb-1">Produk</div>}
                      <input
                        type="text" value={row.produk}
                        onChange={e => updateRow(row.id, 'produk', e.target.value)}
                        placeholder="Nama material" aria-label={`Produk baris ${i + 1}`}
                        className="w-full px-3 py-2.5 text-sm bg-surface border border-rule rounded-lg focus:outline-none focus:border-steel transition-colors"
                      />
                    </div>
                    <div className="col-span-3">
                      {i === 0 && <div className="text-xs font-semibold text-muted mb-1">Ukuran / Spesifikasi</div>}
                      <input
                        type="text" value={row.spesifikasi}
                        onChange={e => updateRow(row.id, 'spesifikasi', e.target.value)}
                        placeholder="Mis: D13, 40×40mm" aria-label={`Spesifikasi baris ${i + 1}`}
                        className="w-full px-3 py-2.5 text-sm bg-surface border border-rule rounded-lg focus:outline-none focus:border-steel transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <div className="text-xs font-semibold text-muted mb-1">Jumlah</div>}
                      <input
                        type="number" value={row.jumlah} min="0.001" step="any"
                        onChange={e => updateRow(row.id, 'jumlah', e.target.value)}
                        placeholder="0" aria-label={`Jumlah baris ${i + 1}`}
                        className="w-full px-3 py-2.5 text-sm bg-surface border border-rule rounded-lg focus:outline-none focus:border-steel transition-colors"
                      />
                    </div>
                    <div className="col-span-2">
                      {i === 0 && <div className="text-xs font-semibold text-muted mb-1">Satuan</div>}
                      <select
                        value={row.satuan} onChange={e => updateRow(row.id, 'satuan', e.target.value)}
                        aria-label={`Satuan baris ${i + 1}`}
                        className="w-full px-3 py-2.5 text-sm bg-surface border border-rule rounded-lg focus:outline-none focus:border-steel transition-colors"
                      >
                        {satuanOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1 flex items-end pb-0.5">
                      {i === 0 && <div className="text-xs font-semibold text-muted mb-1 opacity-0">—</div>}
                      <button
                        type="button" onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1}
                        aria-label={`Hapus baris ${i + 1}`}
                        className="p-2 text-muted hover:text-red-500 disabled:opacity-30 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addRow}
                className="mt-4 flex items-center gap-2 text-sm font-semibold text-steel hover:text-navy transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Tambah Material
              </button>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-rule p-6 mb-6">
              <h2 className="text-lg font-extrabold text-graphite mb-4">Catatan Tambahan</h2>
              <textarea
                id="catatan" rows={4} value={formData.catatan}
                onChange={e => setFormData(f => ({ ...f, catatan: e.target.value }))}
                placeholder="Catatan kebutuhan, jadwal pengiriman, atau informasi tambahan lainnya..."
                className="w-full px-4 py-3 text-sm bg-surface border border-rule rounded-xl focus:outline-none focus:border-steel transition-colors resize-none"
              />
              <label className="mt-4 flex items-start gap-3 text-sm text-muted">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1" />
                <span>Saya menyetujui data kontak dan kebutuhan ini disimpan untuk ditindaklanjuti oleh tim Mahameru Baja.</span>
              </label>
              {errors.consent && <p className="mt-2 text-xs text-red-500">{errors.consent}</p>}
            </div>

            {/* Submit */}
            {submitError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" disabled={submitting}
                className="flex-1 py-4 bg-accent hover:bg-accent-dark text-white font-extrabold text-sm rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg">
                {submitting ? 'Menyimpan permintaan...' : 'Kirim Permintaan Penawaran'}
              </button>
              <p className="text-xs text-muted self-center">Setelah tersimpan, PDF siap diunduh dan WhatsApp terbuka dari satu tombol.</p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
