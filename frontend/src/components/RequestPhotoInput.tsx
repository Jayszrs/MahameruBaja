"use client";
import { useEffect, useState } from "react";
import PublicText from "./PublicText";

export default function RequestPhotoInput({ photos, onChange, disabled = false }: { photos: File[]; onChange: (files: File[]) => void; disabled?: boolean }) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const urls = photos.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [photos]);

  return <PublicText><div className="request-photo-input">
    <label htmlFor="request-photos">Upload foto kebutuhan <span>(opsional)</span></label>
    <p id="request-photos-help">Lampirkan foto material, ukuran, atau gambar kerja agar tim lebih mudah memahami kebutuhan Anda. Maksimal 3 foto JPG, PNG, atau WebP, dengan ukuran total 3 MB.</p>
    <input id="request-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled}
      aria-describedby={`request-photos-help${error ? " request-photos-error" : ""}`} aria-invalid={Boolean(error)}
      onChange={event => {
        const selected = Array.from(event.target.files || []);
        event.target.value = "";
        if (!selected.length) return;
        const next = [...photos, ...selected];
        if (next.length > 3 || next.reduce((size, file) => size + file.size, 0) > 3_000_000) {
          setError("Pilih maksimal 3 foto dengan ukuran total maksimal 3 MB. Hapus foto atau pilih ukuran yang lebih kecil."); return;
        }
        if (next.some(file => !file.size || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
          setError("Gunakan foto JPG, PNG, atau WebP yang tidak kosong."); return;
        }
        setError(""); onChange(next);
      }} />
    {error && <p id="request-photos-error" role="alert">{error}</p>}
    {photos.length > 0 && <ul className="request-photo-previews">{photos.map((photo, index) => <li key={`${photo.name}-${photo.lastModified}-${index}`}>
      {previews[index] && <img src={previews[index]} alt={`Pratinjau ${photo.name}`} />}
      <span>{photo.name}</span>
      <button type="button" disabled={disabled} onClick={() => { setError(""); onChange(photos.filter((_, i) => i !== index)); }} aria-label={`Hapus foto ${photo.name}`}>Hapus foto</button>
    </li>)}</ul>}
    <p>Foto disimpan bersama permintaan dan hanya dapat dibuka oleh admin yang menangani. Foto tidak otomatis menjadi lampiran WhatsApp.</p>
  </div></PublicText>;
}
