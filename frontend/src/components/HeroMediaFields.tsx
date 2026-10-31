"use client";
import { useState } from "react";
import type { HeroSlide } from "../data/heroSlides";
import { imageUploadHelp, videoUploadHelp } from "../lib/cmsUpload";

export default function HeroMediaFields({ slide, busy, update, upload }: {
  slide: HeroSlide;
  busy: boolean;
  update: (patch: Partial<HeroSlide>) => void;
  upload: (file: File, poster?: boolean) => Promise<void>;
}) {
  const [previewError, setPreviewError] = useState("");
  function change(patch: Partial<HeroSlide>) { setPreviewError(""); update(patch); }
  return <section className="hero-media-fields" aria-label={`Media ${slide.eyebrow}`} aria-busy={busy}>
    <div className="hero-media-heading"><h3>Gambar atau video hero</h3><p>Unggah dari perangkat, atau tempel link file yang sudah tersedia. Cukup pilih salah satu.</p></div>
    <div className="hero-media-options">
      <p className="hero-upload-guidance">{imageUploadHelp} {videoUploadHelp} Jenis media mengikuti file yang dipilih.</p>
      <label className="editor-field hero-upload-field">Beranda › Hero › {slide.title} — unggah gambar atau video
        <input name={`hero-upload-${slide.id}`} type="file" accept="image/jpeg,image/png,image/webp,video/mp4" disabled={busy} onChange={event => {
          const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
          if (file) { setPreviewError(""); void upload(file); }
        }} />
      </label>
      <div className="hero-link-fields">
        <label className="editor-field hero-kind-field">Jenis media dari link<select name={`hero-kind-${slide.id}`} value={slide.type} disabled={busy} onChange={event => {
          const type = event.target.value as HeroSlide["type"];
          if (type !== slide.type) change({ type, media: "", poster: undefined });
        }}><option value="image">Gambar</option><option value="video">Video MP4</option></select></label>
        <label className="editor-field hero-url-field">Link gambar atau video<input name={`hero-url-${slide.id}`} value={slide.media} maxLength={1000} disabled={busy} placeholder="https://… atau /media/…" onChange={event => change({ media: event.target.value.trim() })} />
          <small>Gunakan link HTTPS ke file langsung. Link halaman YouTube, Instagram, atau Google Drive bukan file video. Video besar bisa memakai link MP4 dari penyimpanan Anda.</small>
        </label>
      </div>
    </div>
    {slide.type === "video" && <div className="hero-media-options hero-poster-fields">
      <label className="editor-field">Beranda › Hero › {slide.title} — unggah sampul video<input name={`hero-poster-upload-${slide.id}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => {
        const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
        if (file) { setPreviewError(""); void upload(file, true); }
      }} /><small>{imageUploadHelp} Sampul terlihat sebelum video diputar.</small></label>
      <label className="editor-field">Link gambar sampul (opsional)<input name={`hero-poster-url-${slide.id}`} value={slide.poster || ""} maxLength={1000} disabled={busy} onChange={event => change({ poster: event.target.value.trim() || undefined })} />{slide.poster && <button type="button" className="admin-secondary" disabled={busy} onClick={() => change({ poster: undefined })}>Hapus sampul</button>}</label>
    </div>}
    <label className="editor-field">Deskripsi media<input name={`hero-alt-${slide.id}`} value={slide.alt} maxLength={160} disabled={busy} onChange={event => change({ alt: event.target.value })} /></label>
    <div className="hero-media-preview" aria-label="Pratinjau media hero">
      {!slide.media ? <p>Belum ada media. Pilih file atau masukkan link di atas.</p> : slide.type === "video"
        ? <video key={slide.media} src={slide.media} poster={slide.poster} controls playsInline preload="metadata" onError={() => setPreviewError("Video belum bisa diputar. Pastikan link menuju file MP4 H.264 yang dapat diakses, atau unggah ulang file.")} />
        : <img key={slide.media} src={slide.media} alt={slide.alt} onError={() => setPreviewError("Gambar belum bisa ditampilkan. Periksa link dan akses file, atau unggah ulang gambar.")} />}
    </div>
    {previewError && <p className="editor-notice error" role="alert">{previewError}</p>}
    {slide.media && <button type="button" className="admin-secondary" disabled={busy} onClick={() => change({ media: "", poster: undefined })}>Lepas media dari slide</button>}
    <p className="admin-field-help">Ganti media dengan memilih file baru. Melepas media tidak menghapus file dari slide lain. Isi media sebelum menyimpan slide.</p>
  </section>;
}
