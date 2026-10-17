"use client";
import PublicText from "./PublicText";
import { useDivisionDirectory } from "./DivisionDirectory";

import { garudaLocation } from "../data/divisionLocations";
export default function DivisionLocation({ slug }: { slug: string }) {
  const { divisionWhatsApp, divisions } = useDivisionDirectory();
  const division = divisions.find(d=>d.slug===slug);
  const garuda = slug === "retail-cibitung";
  const mapsUrl = division?.mapsUrl || "";
  const address = division?.address || "";
  const embed = division?.mapEmbed || "";
  return <PublicText><section className="division-location home-shell">
    <div><p className="industrial-eyebrow">LOKASI</p><h2>Dekat. Lengkap.<br />Siap melayani Anda.</h2><p>Solusi material untuk setiap proyek. {garuda ? "Kunjungi Garuda Marginal Baja di Cibitung." : "Temui tim divisi kami di kawasan Tambun Selatan."}</p><address>{address}</address><p className="location-note">Konfirmasikan jam kunjungan dan kebutuhan Anda dengan admin.</p><div className="home-actions"><a className="home-button home-button-primary" href={mapsUrl} target="_blank" rel="noopener noreferrer">Buka Google Maps ↗</a><a className="location-admin-link" href={divisionWhatsApp(slug)} target="_blank" rel="noopener noreferrer">Hubungi admin ↗</a></div></div>
    <div className="division-map-card"><header><span>{division?.name}</span><a href={mapsUrl} target="_blank" rel="noopener noreferrer">Petunjuk arah ↗</a></header>{embed && <iframe title={garuda ? "Lokasi Garuda Marginal Baja di Wanajaya, Cibitung" : "Lokasi kawasan Mahameru di Tambun"} src={embed || undefined} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}<footer>{garuda ? "Wanajaya · Cibitung · Kabupaten Bekasi" : "Tambun Selatan · Kabupaten Bekasi"}</footer></div>
  </section></PublicText>;
}
