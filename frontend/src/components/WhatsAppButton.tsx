"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useDivisionDirectory } from "./DivisionDirectory";
import PublicText from "./PublicText";

import { internationalPhone, type TeamContact } from '../data/siteContent';

// Label peran tanpa nama personal, sesuai arahan klien (Oktober 2026).
const salesRoles = [
  { label: "Sales Retail Mahameru", slug: "retail-tambun" },
  { label: "Sales Retail Garuda", slug: "retail-cibitung" },
  { label: "Sales WF dan Plat", slug: "trading-proyek" },
  { label: "Sales Laser Cutting", slug: "laser-cutting" },
  { label: "Sales Proyek Fabrikasi", slug: "fabrikasi-erection" },
] as const;

// Nomor utama aktif 24 jam: tombol logo WA menyambung langsung ke sini.
const mainWhatsAppNumber = "6281218052017";

function waLink(number: string, text: string) {
  return `https://wa.me/${internationalPhone(number)}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppButton() {
  const pathname = usePathname();
  const productDetail = /\/produk\/[^/]+/.test(pathname);
  const { divisions, divisionIdentity } = useDivisionDirectory();
  const [open, setOpen] = useState(false);
  const [liveNumbers, setLiveNumbers] = useState<Record<string, { name: string; phone: string; role?: string }[]> | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => { setOpen(false); setSelected(null); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void fetch('/api/contacts', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then((contacts: Array<Pick<TeamContact, 'id' | 'name' | 'role' | 'whatsapp' | 'divisions'>>) => {
      const numbers: Record<string, { name: string; phone: string; role?: string }[]> = {};
      for (const role of salesRoles) {
        numbers[role.slug] = contacts.filter(c => c.whatsapp && c.divisions.includes(role.slug)).map(c => ({ name: c.name, phone: c.whatsapp, role: c.role }));
      }
      setLiveNumbers(numbers);
    }).catch(() => { /* Keep Excel defaults if the CMS is temporarily unavailable. */ });
    return () => controller.abort();
  }, [open]);

  const mainHref = waLink(mainWhatsAppNumber, "Halo, saya ingin konsultasi kebutuhan Mahameru Baja Indonesia.");
  const actions = salesRoles.filter(role => divisions.some(d => d.slug === role.slug)).map(role => {
    const division = divisions.find(d => d.slug === role.slug);
    const contacts: { name: string; phone: string; role?: string }[] = liveNumbers?.[role.slug] ?? divisionIdentity[role.slug]?.admins ?? [];
    return {
      ...role,
      contacts: contacts.filter((contact, index, all) => contact.phone && all.findIndex(c => internationalPhone(c.phone) === internationalPhone(contact.phone)) === index).map(contact => ({ ...contact, href: waLink(contact.phone, `Halo ${role.label}, saya ingin konsultasi kebutuhan ${division?.label || "Mahameru Baja"}.`) })),
    };
  });

  return (
    <PublicText><div className={`whatsapp-floating fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2${productDetail ? " above-product-actions" : ""}`}>
      {/* Action menu */}
      {open && (
        <div className="wa-admin-menu flex flex-col gap-1.5 mb-1 items-end">
          <p className="max-w-80 p-3 text-xs bg-white rounded-lg shadow-lg text-graphite">Pilih kebutuhan Anda, kami akan mengarahkan ke tim yang tepat.</p>
          {actions.map(action => <div className="wa-sales-group" key={action.slug}>
            <button type="button" aria-expanded={selected === action.slug} aria-controls={`wa-${action.slug}`} onClick={() => setSelected(value => value === action.slug ? null : action.slug)}><span className="wa-sales-dot" />{action.label}<span aria-hidden="true">{selected === action.slug ? "−" : "+"}</span></button>
            {selected === action.slug && <div id={`wa-${action.slug}`} className="wa-contact-options">{action.contacts.length ? action.contacts.map(contact => <a key={contact.phone} href={contact.href} target="_blank" rel="noopener noreferrer" onClick={() => { setOpen(false); setSelected(null); }}><strong>WhatsApp {contact.name}</strong><small>{contact.role || action.label} · {contact.phone}</small><span aria-hidden="true">↗</span></a>) : <a href={`/unit/${action.slug}/kontak`}>Lihat kontak divisi ↗</a>}</div>}
          </div>)}
        </div>
      )}

      {/* Pilih sales per divisi */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Tutup daftar sales' : 'Pilih sales Mahameru Baja'}
        aria-expanded={open}
        className="w-10 h-10 rounded-full shadow-lg border border-light-steel bg-white text-graphite flex items-center justify-center transition-all hover:scale-105 hover:bg-[#1A7A3E] hover:text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      </button>

      {/* Tombol utama: klik logo WA langsung nyambung ke admin aktif 24 jam */}
      <a
        href={mainHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Mahameru Baja — fast respon 24 jam"
        className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 bg-[#1A7A3E] hover:bg-[#155f32]"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
          <path d="M11.974 0C5.364 0 0 5.363 0 11.974c0 2.077.537 4.036 1.478 5.745L0 24l6.433-1.448a11.913 11.913 0 005.541 1.371C18.584 23.923 24 18.56 24 11.949 24 5.362 18.584 0 11.974 0zm0 21.893a9.902 9.902 0 01-5.054-1.386l-.362-.215-3.757.984 1.002-3.657-.237-.376a9.868 9.868 0 01-1.515-5.269c0-5.464 4.446-9.909 9.909-9.909 5.463 0 9.908 4.445 9.908 9.908 0 5.463-4.445 9.92-9.894 9.92z" />
        </svg>
        <span className="absolute -top-1.5 -right-1 px-1.5 rounded-full bg-white text-[10px] font-bold leading-4 text-[#1A7A3E] shadow border border-light-steel">24 Jam</span>
      </a>
    </div></PublicText>
  );
}
