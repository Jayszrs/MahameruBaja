"use client";
import { useDivisionDirectory } from "./DivisionDirectory";
import Link from "next/link";
import { useRef, useState } from "react";
import { inventoryKey, inventoryListSchema, newCustomProductId, productSlug, resolvedInventoryProducts, stockLabels, stockStatuses, type CustomProduct, type InventoryItem } from "../data/inventory";
import { uploadCmsFile } from "../lib/cmsUpload";
import { useAdminWorkspace } from "./AdminWorkspace";
import AdminDialog from "./AdminDialog";
import AdminOrderList, { focusEditorRecord, moveBefore } from "./AdminOrderList";

export default function InventoryEditor({ initialItems, division }: { initialItems: InventoryItem[]; division: string | null }) {
  const { divisions, inventoryDivisionName } = useDivisionDirectory();
  const [items, setItems] = useState(initialItems);
  const base = useRef(initialItems);
  const [scope, setScope] = useState(division || 'retail-tambun');
  const [existingProduct, setExistingProduct] = useState('');
  const [query, setQuery] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const allProducts = resolvedInventoryProducts(items);
  const masterProducts = resolvedInventoryProducts(base.current);
  const validation = inventoryListSchema.safeParse(items);
  const busy = saving || uploadingKey !== null;
  const validationMessage = !validation.success ? validation.error.issues[0]?.message : '';
  function change(key: string, patch: Partial<InventoryItem>) {
    setItems(rows => rows.map(item => inventoryKey(item) === key ? { ...item, ...patch, listed: true } : item));
    setDirty(true); setMessage('');
  }
  function changeProduct(item: InventoryItem, patch: Partial<CustomProduct>) {
    if (!item.product) return;
    setItems(rows => rows.map(row => row.productId === item.productId && row.product ? { ...row, product: { ...row.product, ...patch }, listed: true } : row));
    setDirty(true); setMessage('');
  }
  function addNew() {
    const id = newCustomProductId();
    const product: CustomProduct = { id, slug: `produk-${id.slice(7)}`, name: '', sku: '', category: '', categorySlug: 'material', shortSpec: '', description: '', image: '' };
    setItems(rows => [{ productId: id, product, division: scope, listed: true, status: 'unconfirmed', quantity: null, unit: 'batang', verifiedAt: '', note: '' }, ...rows]);
    setQuery(''); setDirty(true); setFailed(false); setMessage('Produk baru ditambahkan sebagai draf untuk divisi ini. Lengkapi detailnya, lalu simpan agar masuk ke katalog master. Setelah tersimpan, produk bisa ditambahkan ke divisi lain.');
    focusEditorRecord(`inventory-${scope}:${id}`);
  }
  function addExisting() {
    if (!existingProduct || items.some(item => item.productId === existingProduct && item.division === scope)) return;
    const product = base.current.find(item => item.productId === existingProduct)?.product;
    setItems(rows => [{ productId: existingProduct, ...(product ? { product } : {}), division: scope, listed: true, status: 'unconfirmed', quantity: null, unit: 'batang', verifiedAt: '', note: '' }, ...rows]);
    setExistingProduct(''); setQuery(''); setDirty(true); setMessage('');
    focusEditorRecord(`inventory-${scope}:${existingProduct}`);
  }
  async function upload(item: InventoryItem, file: File) {
    setUploadingKey(inventoryKey(item)); setMessage(''); setFailed(false);
    try { changeProduct(item, { image: await uploadCmsFile(file, 'image', item.division) }); }
    catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setUploadingKey(null); }
  }
  async function save() {
    if (busy) return;
    if (!validation.success) { setFailed(true); setMessage(validationMessage || 'Lengkapi data produk sebelum menyimpan.'); return; }
    setSaving(true); setFailed(false); setMessage('');
    try {
      const response = await fetch('/api/admin/inventory', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items, base: base.current }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Produk dan stok gagal disimpan.');
      setItems(body.items); base.current = body.items; setDirty(false); workspace.refreshDashboard(); setMessage('Produk dan stok tersimpan. Katalog website langsung diperbarui.');
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setSaving(false); }
  }
  const workspace = useAdminWorkspace({ dirty, busy, label: 'Simpan produk & stok', disabled: !dirty, onSave: save });
  const shown = items.filter(item => item.division === scope && (!query || `${allProducts.find(product => product.id === item.productId)?.name || ''} ${item.product?.sku || ''}`.toLowerCase().includes(query.toLowerCase())));
  function reorder(from: string, to: string) {
    setItems(rows => {
      const ordered = moveBefore(rows.filter(item => item.division === scope).map(item => ({ id: inventoryKey(item), item })), from, to);
      let index = 0;
      return rows.map(item => item.division === scope ? ordered[index++].item : item);
    });
    setDirty(true); setMessage('');
  }
  return <div className="admin-management inventory-editor">
    <header className="admin-page-heading"><div><p className="industrial-eyebrow">KATALOG</p><h1>Produk & stok</h1><p>Buat produk master baru, lengkapi spesifikasinya, lalu simpan. Produk yang sudah disimpan bisa ditambahkan ke divisi lain.</p></div><button type="button" className="admin-primary" disabled={busy} onClick={addNew}>+ Tambah produk baru</button></header>
    {message && <p className={`editor-notice ${failed ? 'error' : 'success'}`} role={failed ? 'alert' : 'status'}>{message}</p>}
    {busy && <p className="editor-notice" role="status" aria-live="polite">{uploadingKey ? 'Mengunggah foto produk. Tunggu sampai selesai sebelum menyimpan.' : 'Menyimpan produk dan stok…'}</p>}

    <fieldset className="editor-fields" disabled={busy} aria-busy={busy}>
      <section className="editor-panel"><div className="editor-grid"><label className="editor-field">Divisi<select value={scope} onChange={event => { setScope(event.target.value); setExistingProduct(''); }} disabled={Boolean(division)}>{divisions.filter(item => !division || item.slug === division).map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label><label className="editor-field">Cari produk<input type="search" value={query} placeholder="Nama produk atau kode SKU" onChange={event => setQuery(event.target.value)} /></label></div>
        <details><summary>Tambahkan produk master yang sudah ada ke divisi ini</summary><p>Daftar mencakup katalog bawaan dan produk master yang sudah Anda buat.</p><div className="inventory-add"><label className="editor-field">Produk master<select value={existingProduct} onChange={event => setExistingProduct(event.target.value)}><option value="">Pilih produk master</option>{masterProducts.filter(product => !items.some(item => item.division === scope && item.productId === product.id)).map(product => <option key={product.id} value={product.id}>{product.name} · {product.category}</option>)}</select></label><button type="button" className="admin-secondary" disabled={!existingProduct} onClick={addExisting}>Tambahkan ke divisi</button></div></details>
      </section>
      {shown.length > 0 && <AdminOrderList label="Urutan produk" disabled={busy} items={shown.map(item => ({ id: inventoryKey(item), title: allProducts.find(product => product.id === item.productId)?.name || 'Produk baru', detail: item.product?.sku, image: item.product?.image }))} onMove={reorder} onSelect={key => focusEditorRecord(`inventory-${key}`)} />}
      {shown.map(item => {
        const key = inventoryKey(item); const product = allProducts.find(product => product.id === item.productId);
        if (!product) return null;
        const draft = item.product;
        return <section className="editor-panel" id={`inventory-${key}`} key={key}>
          <div className="editor-panel-title"><h2>{product.name || 'Produk baru'}</h2><span>{inventoryDivisionName(item.division)}</span></div>
          {draft ? <><div className="editor-grid"><label className="editor-field">Nama produk<input required maxLength={150} value={draft.name} onChange={event => changeProduct(item, { name: event.target.value, ...(!base.current.some(row => row.productId === item.productId) ? { slug: `${productSlug(event.target.value).slice(0,130) || 'produk'}-${draft.id.slice(7)}` } : {}) })} /></label><label className="editor-field">Kode SKU<input required maxLength={80} value={draft.sku} onChange={event => changeProduct(item, { sku: event.target.value })} /></label><label className="editor-field">Kategori<input required list="product-categories" maxLength={100} value={draft.category} onChange={event => changeProduct(item, { category: event.target.value, categorySlug: productSlug(event.target.value) || 'material' })} /><small>Pilih saran kategori atau ketik kategori baru.</small></label><label className="editor-field">Spesifikasi singkat<input required maxLength={300} value={draft.shortSpec} onChange={event => changeProduct(item, { shortSpec: event.target.value })} placeholder="Ukuran, bahan, atau tipe produk" /></label></div><label className="editor-field">Deskripsi produk<textarea required rows={3} maxLength={5000} value={draft.description} onChange={event => changeProduct(item, { description: event.target.value })} /></label><div className="editor-grid"><label className="editor-field">Foto produk<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void upload(item, file); }} /><small>{draft.image ? 'Foto siap digunakan.' : 'Unggah foto produk atau isi URL gambar.'}</small></label><label className="editor-field">URL gambar<input type="text" value={draft.image} maxLength={1000} placeholder="/images/... atau https://..." onChange={event => changeProduct(item, { image: event.target.value })} /></label></div></> : <p className="inventory-row-meta">{product.sku}</p>}
          <div className="editor-grid inventory-row-fields"><label className="editor-field">Status stok<select value={item.status} onChange={event => { const status = event.target.value as InventoryItem['status']; change(key, { status, quantity: status === 'empty' ? 0 : status === 'available' ? item.quantity : null, verifiedAt: '' }); }}>{stockStatuses.map(status => <option value={status} key={status}>{stockLabels[status]}</option>)}</select></label><label className="editor-field">Sisa stok<input type="number" min="0" max="1000000000" step="1" value={item.quantity ?? ''} disabled={item.status !== 'available'} onChange={event => change(key, { quantity: event.target.value === '' ? null : Number(event.target.value), verifiedAt: '' })} placeholder="Belum diketahui" /></label><label className="editor-field">Satuan<select value={item.unit} onChange={event => change(key, { unit: event.target.value as InventoryItem['unit'], verifiedAt: '' })}>{['batang', 'lembar', 'kg', 'set', 'buah', 'meter'].map(unit => <option key={unit}>{unit}</option>)}</select></label></div>
          <label className="editor-field">Catatan untuk pelanggan<textarea maxLength={300} rows={2} value={item.note} onChange={event => change(key, { note: event.target.value })} /></label>
          <div className="inventory-confirm"><button type="button" className="admin-secondary" disabled={item.status === 'unconfirmed' || (item.status === 'available' && (!Number.isInteger(item.quantity) || !item.quantity || item.quantity < 1))} onClick={() => change(key, { verifiedAt: new Date().toISOString() })}>Konfirmasi stok sekarang</button><span>{item.verifiedAt ? `Dikonfirmasi ${new Date(item.verifiedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB` : item.status === 'unconfirmed' ? 'Produk tetap tampil. Jumlah stok belum dikonfirmasi.' : 'Konfirmasikan jumlah stok sebelum menyimpan.'}</span></div>
          <div className="editor-item-actions">{(!draft || base.current.some(row => row.productId === item.productId)) && <Link href={`/produk/${product.slug}?unit=${item.division}`} target="_blank">Lihat produk</Link>}<button type="button" className="editor-delete" onClick={() => setDeleteKey(key)}>Hapus dari divisi</button></div>
        </section>;
      })}
      <datalist id="product-categories">{[...new Set(allProducts.map(product => product.category).filter(Boolean))].map(category => <option key={category} value={category} />)}</datalist>
      {!shown.length && <div className="editor-empty"><h2>{query ? 'Produk tidak ditemukan' : 'Belum ada produk di divisi ini'}</h2><p>{query ? 'Coba nama produk lain atau kosongkan pencarian.' : 'Gunakan Tambah produk baru untuk membuat produk pertama.'}</p></div>}
      <div className="admin-form-actions"><p>{dirty ? 'Simpan agar perubahan langsung tampil di website.' : 'Semua perubahan tersimpan.'}</p><button type="button" className="admin-primary" disabled={!dirty} onClick={() => void save()}>Simpan produk & stok</button></div>
    </fieldset>
    {deleteKey && <AdminDialog title="Hapus produk dari divisi?" onClose={() => setDeleteKey(null)}><p>Produk dan catatan stok akan dihapus dari katalog divisi setelah perubahan disimpan.</p><div className="admin-dialog-actions"><button type="button" className="admin-secondary" onClick={() => setDeleteKey(null)}>Batal</button><button type="button" className="admin-danger" onClick={() => { setItems(rows => rows.filter(row => inventoryKey(row) !== deleteKey)); setDirty(true); setMessage(''); setDeleteKey(null); }}>Hapus dari divisi</button></div></AdminDialog>}
  </div>;
}
