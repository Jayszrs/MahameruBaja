// Logos taken directly from the supplied company profile, "Our Supplier", p.18.
// The unlabeled symbol is intentionally left unnamed, per the user's choice.
export const supplierPartners = [
  ["krakatau-steel-center", "Krakatau Steel Center & Trading"],
  ["hsc", "HSC"],
  ["grp", "GRP"], ["gunawan-dianjaya", "Gunawan Dianjaya Steel"],
  ["supplier-logo-pdf", ""], ["wahana-sentra", "Wahana Sentra Niaga"],
  ["cita-baja", "PT Cita Baja Jayaindo"], ["master-steel", "Master Steel"],
  ["lautan-steel", "PT Lautan Steel Indonesia"], ["perwira-steel", "Perwira Steel"],
  ["sentral-pipa", "PT Sentral Pipa Indonesia"], ["inter-world", "Inter World"],
  ["kwosm", "KWOSM"], ["krakatau-pipe", "Krakatau Pipe & Coating"],
  ["kpss", "KPSS"], ["intisumber-bajasakti", "PT Intisumber Bajasakti"],
  ["spindo", "SPINDO — PT Steel Pipe Industry of Indonesia, Tbk."],
].map(([id, name]) => ({ id, name, logo: `/images/compro/supplier-${id}.webp` }));
