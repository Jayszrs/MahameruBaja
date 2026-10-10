"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { products } from '../data/products';
import { divisions } from '../data/divisionContent';
import { inventoryKey, inventoryDivisionName, stockLabels, stockStatuses, type InventoryItem } from '../data/inventory';

export default function InventoryEditor({ initialItems, division }: { initialItems: InventoryItem[]; division: string | null }) {
  const [items, setItems] = useState(initialItems);
  const base = useRef(initialItems);
  const [scope, setScope] = useState(division || 'retail-tambun');
  const [newProduct, setNewProduct] = useState('');
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } }; window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn); }, [dirty]);
  function change(key: string, patch: Partial<InventoryItem>) { setItems(rows => rows.map(i => inventoryKey(i) === key ? { ...i, ...patch } : i)); setDirty(true); setMessage(''); }
  function add() {
    if (!newProduct || items.some(i => i.productId === newProduct && i.division === scope)) return;
    setItems(rows => [...rows, { productId: newProduct, division: scope as InventoryItem['division'], listed: false, status: 'unconfirmed', quantity: null, unit: 'batang', verifiedAt: '', note: '' }]);
    setNewProduct(''); setDirty(true);
  }
  async function save() {
    setSaving(true); setFailed(false); setMessage('');
    try {
      const r = await fetch('/api/admin/inventory', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, base: base.current }) });
      const body = await r.json();
      if (!r.ok) throw new Error(body.message || 'Stok gagal disimpan.');
      setItems(body.items); base.current = body.items; setDirty(false); setMessage('Tersimpan. Katalog dan stok tiap divisi telah diperbarui.');
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setSaving(false); }
  }
  const shown = items.filter(i => i.division === scope && (products.find(p => p.id === i.productId)?.name.toLowerCase().includes(query.toLowerCase()) || !query));
  return <div className="content-editor inventory-editor"><aside className="editor-sidebar"><Link className="editor-brand" href="/admin">MBI <span>PRODUK & STOK</span></Link><p>WEBSITE</p><Link className="editor-sidebar-link" href="/admin/konten">Kontak & ulasan</Link><Link className="editor-sidebar-link" href="/admin/sosial">Sosial media</Link><Link className="editor-sidebar-link" href="/admin/promosi">Banner & promo</Link><span className="editor-sidebar-link active">Produk & stok divisi</span><div className="editor-sidebar-bottom"><Link href="/admin">← Dashboard</Link><form action="/api/admin/logout" method="post"><button>Keluar</button></form></div></aside>
    <main className="editor-main"><header className="editor-topbar"><span>Workspace / Produk & stok</span><div><span>{dirty ? 'Perubahan belum disimpan' : 'Tersimpan'}</span><button className="editor-save" disabled={!dirty || saving} onClick={save}>{saving ? 'Menyimpan…' : 'Simpan perubahan ↗'}</button></div></header>
      <div className="editor-content"><div className="editor-title"><p className="industrial-eyebrow">KATALOG / PER DIVISI</p><h1>Produk yang tepat.<br /><em>Stok dari divisinya.</em></h1><p>Tentukan produk yang tampil untuk tiap divisi, masukkan sisa stok, lalu tekan Konfirmasi stok. Jumlah kosong bukan nol. Data ini diperbarui manual, tidak otomatis berkurang saat ada permintaan pelanggan.</p></div>
        {message && <div className={`editor-notice ${failed ? 'error' : 'success'}`} role={failed ? 'alert' : 'status'}>{message}</div>}
        <fieldset className="editor-fields" disabled={saving}><div className="editor-grid"><label className="editor-field">Divisi<select value={scope} onChange={e => { setScope(e.target.value); setNewProduct(''); }} disabled={Boolean(division)}>{divisions.filter(d => !division || d.slug === division).map(d => <option value={d.slug} key={d.slug}>{d.name}</option>)}</select></label><label className="editor-field">Cari produk<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
          <div className="inventory-add"><label className="editor-field">Tambahkan produk ke {inventoryDivisionName(scope)}<select value={newProduct} onChange={e => setNewProduct(e.target.value)}><option value="">Pilih produk dari master katalog</option>{products.filter(p => !items.some(i => i.division === scope && i.productId === p.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><button type="button" className="editor-save" disabled={!newProduct} onClick={add}>+ Tambahkan</button></div>
          {shown.map(item => {
            const key = inventoryKey(item); const product = products.find(p => p.id === item.productId)!;
            return <section className="editor-panel" key={key}><div className="editor-panel-title"><h3>{product.name}</h3><label className="editor-publish"><input type="checkbox" checked={item.listed} onChange={e => change(key, { listed: e.target.checked })} />Tampilkan di katalog divisi</label></div><p className="inventory-row-meta">{product.sku} · {inventoryDivisionName(item.division)}</p>
              <div className="editor-grid inventory-row-fields"><label className="editor-field">Status<select value={item.status} onChange={e => { const status = e.target.value as InventoryItem['status']; change(key, { status, quantity: status === 'empty' ? 0 : status === 'available' ? item.quantity : null, verifiedAt: '' }); }}>{stockStatuses.map(s => <option value={s} key={s}>{stockLabels[s]}</option>)}</select></label><label className="editor-field">Sisa stok<input type="number" min="0" max="1000000000" step="1" value={item.quantity ?? ''} disabled={item.status === 'unconfirmed' || item.status === 'empty' || item.status === 'preorder'} onChange={e => change(key, { quantity: e.target.value === '' ? null : Number(e.target.value), verifiedAt: '' })} placeholder="Belum diketahui" /></label><label className="editor-field">Satuan<select value={item.unit} onChange={e => change(key, { unit: e.target.value as InventoryItem['unit'], verifiedAt: '' })}>{['batang', 'lembar', 'kg', 'set', 'buah', 'meter'].map(unit => <option key={unit}>{unit}</option>)}</select></label></div>
              <label className="editor-field">Catatan pelanggan<textarea maxLength={300} rows={2} value={item.note} onChange={e => change(key, { note: e.target.value })} placeholder="Contoh: konfirmasikan jadwal pengiriman dengan admin" /></label>
              <div className="inventory-confirm"><button type="button" className="editor-save" disabled={item.status === 'unconfirmed' || (item.status === 'available' && (!Number.isInteger(item.quantity) || !item.quantity || item.quantity < 1))} onClick={() => change(key, { verifiedAt: new Date().toISOString() })}>Konfirmasi stok sekarang</button><span>{item.verifiedAt ? `Dikonfirmasi ${new Date(item.verifiedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB` : item.status === 'unconfirmed' ? 'Jumlah belum dikonfirmasi' : 'Perlu konfirmasi sebelum disimpan'}</span></div>
              <Link href={`/produk/${product.slug}?unit=${item.division}`} target="_blank">Preview produk ↗</Link>
            </section>;
          })}
          {!shown.length && <div className="editor-empty"><h3>Belum ada produk untuk divisi ini.</h3><p>Tambahkan produk yang memang dilayani divisi. Divisi jasa tidak otomatis mendapatkan stok material divisi retail.</p></div>}
        </fieldset>
      </div>
    </main>
  </div>;
}
