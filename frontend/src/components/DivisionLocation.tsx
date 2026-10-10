import { divisionWhatsApp } from "../data/companyIdentity";
import { garudaLocation } from "../data/divisionLocations";
export default function DivisionLocation({ slug }: { slug: string }) {
  const garuda = slug === "retail-cibitung";
  const mapsUrl = garuda ? garudaLocation.mapsUrl : "https://maps.app.goo.gl/ZWbVmEBLMJm2kRBm8";
  const address = garuda ? garudaLocation.address : "Jl. Permata Regensi Blok K1 No. 38–39, Tambun Selatan, Kabupaten Bekasi 17510";
  const embed = garuda ? garudaLocation.embedUrl : "https://www.google.com/maps?q=Toko+Besi+Mahameru+Baja+Tambun+Selatan&output=embed";
  return <section className="division-location home-shell">
    <div><p className="industrial-eyebrow">LOKASI</p><h2>Dekat. Lengkap.<br />Siap melayani Anda.</h2><p>Solusi material untuk setiap proyek. {garuda ? "Kunjungi Garuda Marginal Baja di Cibitung." : "Temui tim divisi kami di kawasan Tambun Selatan."}</p><address>{address}</address><p className="location-note">Konfirmasikan jam kunjungan dan kebutuhan Anda dengan admin.</p><div className="home-actions"><a className="home-button home-button-primary" href={mapsUrl} target="_blank" rel="noopener noreferrer">Buka Google Maps ↗</a><a className="location-admin-link" href={divisionWhatsApp(slug)} target="_blank" rel="noopener noreferrer">Hubungi admin ↗</a></div></div>
    <div className="division-map-card"><header><span>{garuda ? "GARUDA / CIBITUNG" : "MAHAMERU / TAMBUN"}</span><a href={mapsUrl} target="_blank" rel="noopener noreferrer">Petunjuk arah ↗</a></header><iframe title={garuda ? "Lokasi Garuda Marginal Baja di Wanajaya, Cibitung" : "Lokasi kawasan Mahameru di Tambun"} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><footer>{garuda ? "Wanajaya · Cibitung · Kabupaten Bekasi" : "Tambun Selatan · Kabupaten Bekasi"}</footer></div>
  </section>;
}
