"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Division } from "../data/divisionCms";
import { internationalPhone } from "../data/siteContent";
const Directory = createContext<Division[]>([]);
export function DivisionDirectory({ divisions, children }: { divisions: Division[]; children: ReactNode }) { return <Directory.Provider value={divisions}>{children}</Directory.Provider>; }
export function useDivisionDirectory() {
  const divisions = useContext(Directory);
  return useMemo(() => ({ divisions,
    divisionIdentity: Object.fromEntries(divisions.map(d => [d.slug, { logo: d.logo || "/mbi-mark.svg", mission: d.mission, admins: d.admins }])),
    divisionWhatsApp: (slug: string, name?: string) => { const d = divisions.find(item => item.slug === slug); const contact = d?.admins.find(a => a.name === name) || d?.admins[0]; return contact ? `https://wa.me/${internationalPhone(contact.phone)}` : d ? `/unit/${d.slug}/kontak` : "/kontak"; },
    businessUnits: divisions.map(d => ({ ...d, category: d.label, destination: d.primary.href })),
    inventoryDivisionName: (slug: string) => divisions.find(d => d.slug === slug)?.name || slug,
  }), [divisions]);
}
