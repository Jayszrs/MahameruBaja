"use client";
import { useDivisionDirectory } from "./DivisionDirectory";
import Link from 'next/link';
import { stockSummary, stockLabels, type InventoryItem } from "../data/inventory";


export default function ProductInventory({ items, selectedDivision }: { items: InventoryItem[]; selectedDivision?: string }) {
  const { inventoryDivisionName, divisionWhatsApp } = useDivisionDirectory();
  const suppliers = [
    { slug: "retail-tambun", label: "Mahameru Baja Retail Tambun" },
    { slug: "retail-cibitung", label: "Garuda Marginal Baja Retail Cibitung" },
    { slug: "trading-proyek", label: "MBI Trading" },
  ];
  const shown = suppliers.flatMap(division => {
    const item = items.find(item => item.division === division.slug && item.listed);
    return item ? [{ ...item, label: division.label }] : [];
  });
  return <section className="product-inventory" aria-labelledby="product-stock-heading"><p className="industrial-eyebrow">PENYEDIA MATERIAL</p><h2 id="product-stock-heading">Tanyakan produk ke divisi penyedia.</h2>
    {selectedDivision && !shown.some(i => i.division === selectedDivision) && <p className="inventory-scope-note">Produk ini tidak tercatat di katalog {inventoryDivisionName(selectedDivision)}. Lihat divisi penyedia di bawah.</p>}
    {shown.length ? <ol className="inventory-suppliers">{shown.map(item => <li key={item.division}><article className={item.division === selectedDivision ? 'is-selected' : ''}><div><h3>{item.label}</h3><span>{stockLabels[item.status]}</span></div><strong>{stockSummary(item)}</strong>{item.verifiedAt && <small>Dikonfirmasi admin: {new Date(item.verifiedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })} WIB</small>}{item.note && <p>{item.note}</p>}<nav><a href={divisionWhatsApp(item.division)} target="_blank" rel="noopener noreferrer">Tanya admin</a><Link href={`/unit/${item.division}/produk`}>Lihat katalog divisi</Link></nav></article></li>)}</ol> : <p>Belum ada divisi yang mencatat produk ini. Hubungi admin untuk menentukan divisi penyedia; jumlah stok belum dikonfirmasi.</p>}
    <p className="inventory-disclaimer">Stok adalah informasi terakhir yang dikonfirmasi admin, bukan reservasi. Konfirmasikan kembali jumlah dan harga sebelum memesan.</p>
  </section>;
}
