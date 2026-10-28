import type { Division } from "./divisionCms";

const topics: Record<string, string> = {
  "retail-tambun": "Toko Besi Tambun Bekasi",
  "retail-cibitung": "Toko Besi Cibitung Bekasi",
  "trading-proyek": "Supplier Besi & Baja Proyek Bekasi",
  "laser-cutting": "Jasa Cutting Laser Tambun & Bekasi",
  "fabrikasi-erection": "Fabrikasi & Erection Bekasi",
};

export function divisionSearchTitle(division: Division) {
  return `${topics[division.slug] || division.label} | ${division.name}`;
}

export function divisionSearchDescription(division: Division) {
  const area = /bekasi/i.test(division.area) || !/bekasi/i.test(division.address) ? division.area : `${division.area}, Bekasi`;
  return `${division.name}${area ? ` di ${area}` : ""}. ${division.intro}`;
}
