import Link from 'next/link';
import { stockSummary, stockLabels, inventoryDivisionName, type InventoryItem } from '../data/inventory';
import { divisionIdentity, divisionWhatsApp } from '../data/companyIdentity';

export default function ProductInventory({ items, selectedDivision }: { items: InventoryItem[]; selectedDivision?: string }) {
  const shown = items.filter(i => i.listed);
  return <section className="product-inventory" aria-labelledby="product-stock-heading"><p className="industrial-eyebrow">SUMBER PRODUK & STOK</p><h2 id="product-stock-heading">Konfirmasi dari divisi yang tepat.</h2>
    {selectedDivision && !shown.some(i => i.division === selectedDivision) && <p className="inventory-scope-note">Produk ini tidak tercatat di katalog {inventoryDivisionName(selectedDivision)}. Lihat divisi penyedia di bawah.</p>}
    {shown.length ? <div>{shown.map(item => <article key={item.division} className={item.division === selectedDivision ? 'is-selected' : ''}><div><img src={divisionIdentity[item.division].logo} alt="" /><h3>{inventoryDivisionName(item.division)}</h3><span>{stockLabels[item.status]}</span></div><strong>{stockSummary(item)}</strong>{item.verifiedAt && <small>Dikonfirmasi admin: {new Date(item.verifiedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB</small>}{item.note && <p>{item.note}</p>}<nav><a href={divisionWhatsApp(item.division)} target="_blank" rel="noopener noreferrer">Konfirmasi ke admin divisi ↗</a><Link href={`/unit/${item.division}/produk`}>Katalog divisi ↗</Link></nav></article>)}</div> : <p>Belum ada divisi yang mencatat produk ini. Hubungi admin untuk menentukan divisi penyedia; jumlah stok belum dikonfirmasi.</p>}
    <p className="inventory-disclaimer">Stok adalah informasi terakhir yang dikonfirmasi admin, bukan reservasi. Konfirmasikan kembali jumlah dan harga sebelum memesan.</p>
  </section>;
}
