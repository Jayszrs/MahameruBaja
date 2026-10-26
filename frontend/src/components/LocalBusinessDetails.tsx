import Link from "next/link";
import type { Division } from "../data/divisionCms";

export default function LocalBusinessDetails({ divisions, service = false }: { divisions: Division[]; service?: boolean }) {
  if (!divisions.length) return null;
  return <section className="home-section local-business-details" aria-labelledby="local-business-heading">
    <div className="home-shell">
      <h2 id="local-business-heading">{service ? "Konsultasi laser cutting di Bekasi" : "Toko besi dan baja di Tambun & Cibitung, Bekasi"}</h2>
      <p>{service
        ? "Kirim gambar kerja untuk kebutuhan ornamen pagar, panel, atau komponen plat. Tim MBI Laser Cutting & Bending meninjau jenis bahan, ketebalan, ukuran, dan jumlah sebelum mengonfirmasi proses produksi."
        : "Cari besi beton, hollow, pipa, plat, WF, UNP, CNP, wiremesh, atau baja ringan melalui katalog Mahameru Baja. Untuk pembelian di Tambun dan Cibitung, pilih toko yang ingin dihubungi lalu konfirmasikan spesifikasi, stok, dan harga terbaru."}</p>
      <div className="local-business-columns">
        <div>
          <h3>{service ? "Siapkan data untuk penawaran" : "Cara cek harga dan pengiriman"}</h3>
          <ul>
            {service ? <>
              <li>Gambar DWG atau DXF; PDF dan foto dapat dipakai untuk konsultasi awal.</li>
              <li>Jenis material, ketebalan plat, dimensi, dan jumlah setiap komponen.</li>
              <li>Detail bending atau finishing, lokasi tujuan, dan target waktu.</li>
            </> : <>
              <li>Nama material, ukuran, ketebalan, dan jumlah batang atau lembar.</li>
              <li>Lokasi pengambilan atau alamat pengiriman di Bekasi dan sekitarnya.</li>
              <li>Tanggal kebutuhan, agar tim dapat mengecek stok serta jadwal pengiriman.</li>
            </>}
          </ul>
          <p>{service ? "Harga laser cutting bergantung pada bahan, panjang dan kerumitan potong, jumlah, serta proses tambahan. Kapasitas mesin, toleransi, dan jadwal dipastikan setelah gambar ditinjau." : "Harga dan stok material dapat berubah. Biaya serta jangkauan pengiriman disepakati dengan admin sesuai pesanan."}</p>
          <Link href={service ? "/jasa#request" : "/minta-penawaran"} className="local-business-action">{service ? "Kirim kebutuhan laser cutting" : "Minta harga material"}</Link>
          <p>{service ? <>Perlu bahan untuk pekerjaan Anda? <Link href="/produk">Lihat katalog besi dan baja Bekasi</Link>.</> : <>Perlu plat dipotong atau ditekuk? <Link href="/jasa">Lihat jasa laser cutting dan bending Bekasi</Link>.</>}</p>
        </div>
        <div>
          <h3>{service ? "Alamat & kontak tim laser cutting" : "Alamat & kontak toko"}</h3>
          {divisions.map(division => <div className="local-business-location" key={division.slug}>
            <h4><Link href={`/unit/${division.slug}`}>{division.name}</Link></h4>
            <address>{division.address}</address>
            {division.area && <p>Area layanan: {division.area}</p>}
            {division.admins.map(admin => <p key={`${admin.name}-${admin.phone}`}>{admin.name}: <a href={`tel:+${admin.phone.replace(/\D/g, "").replace(/^0/, "62")}`}>{admin.phone}</a></p>)}
            <div className="local-business-links">
              {division.mapsUrl && <a href={division.mapsUrl} target="_blank" rel="noopener noreferrer">Petunjuk arah Google Maps</a>}
              <Link href={`/unit/${division.slug}/kontak`}>Hubungi admin</Link>
            </div>
          </div>)}
          <p>Konfirmasikan jadwal kunjungan dengan admin sebelum datang.</p>
        </div>
      </div>
    </div>
  </section>;
}
