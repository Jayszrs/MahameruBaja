"use client";

import { useEffect, useState } from "react";
import type { CreateLeadInput } from "../lib/api";

export default function RequestHandoff({ input, id, phone = "6281218052017" }: { input: CreateLeadInput; id: string; phone?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [canShare, setCanShare] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let stopped = false;
    let objectUrl = "";
    setFile(null);
    setUrl("");
    setError("");
    import("../lib/requestPdf").then(module => module.createRequestPdf(input, id)).then(bytes => {
      if (stopped) return;
      const document = new File([bytes.slice().buffer as ArrayBuffer], `${id}-permintaan-penawaran.pdf`, { type: "application/pdf" });
      objectUrl = URL.createObjectURL(document);
      setFile(document);
      setUrl(objectUrl);
      setCanShare(Boolean(navigator.canShare?.({ files: [document] })));
    }).catch(() => { if (!stopped) setError("PDF belum dapat dibuat. Coba lagi, atau hubungi tim tanpa berkas."); });
    return () => { stopped = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [input, id, retry]);

  const details = input.items?.map(item => `- ${item.productName}: ${item.quantity ?? "konfirmasi"} ${item.unit || ""}`).join("\n") || input.request || "Mohon tindak lanjut penawaran.";
  const baseMessage = `Halo Mahameru Baja, saya ${input.name}. Nomor permintaan saya ${id}.\nDivisi: ${input.businessUnitSlug || "retail-tambun"}\n${details}`;
  const message = `${baseMessage}\nSaya akan melampirkan PDF ringkasan kebutuhan. Mohon review spesifikasi, harga, dan jadwal.`;
  const fallbackMessage = `${baseMessage}\nPDF ringkasan belum tersedia. Mohon tindak lanjut kebutuhan saya.`;

  function download() {
    if (!file || !url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.click();
  }

  async function share() {
    if (!file || sharing) return;
    setSharing(true);
    setError("");
    try { await navigator.share({ files: [file], title: `Permintaan ${id}`, text: message }); }
    catch (cause) { if ((cause as Error).name !== "AbortError") setError("Perangkat tidak dapat membagikan berkas. Unduh PDF lalu lampirkan sebagai Dokumen di WhatsApp."); }
    finally { setSharing(false); }
  }

  return <section className="request-handoff" aria-label="PDF dan WhatsApp">
    <div className="request-document-icon" aria-hidden="true">PDF</div>
    <div className="request-handoff-copy"><p className="industrial-eyebrow">PERMINTAAN / {id}</p><h3>Dokumen siap untuk tim.</h3><p role="status">{file ? `${file.name} sudah dibuat.` : error ? "Pembuatan PDF perlu diulang." : "Menyiapkan PDF secara otomatis..."}</p><small>Dokumen ini merangkum kebutuhan Anda. Harga dan jadwal dikonfirmasi oleh tim.</small></div>
    <div className="request-handoff-actions">
      {canShare && <button type="button" disabled={sharing || !file} onClick={share}>{sharing ? "Membuka menu berbagi..." : "Bagikan PDF dari perangkat"}</button>}
      {file ? <a href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={download}>Unduh PDF & buka WhatsApp ↗</a> : error ? <a href={`https://wa.me/${phone}?text=${encodeURIComponent(fallbackMessage)}`} target="_blank" rel="noopener noreferrer">Chat WhatsApp tanpa PDF ↗</a> : <button type="button" disabled>Menyiapkan PDF...</button>}
      {url && <a href={url} download={file!.name} className="handoff-secondary">Unduh PDF saja</a>}
      {error && <button type="button" className="handoff-secondary" onClick={() => setRetry(value => value + 1)}>Coba buat PDF lagi</button>}
    </div>
    <p className="handoff-note">{canShare ? "Pilih WhatsApp pada menu berbagi untuk mengirim berkas secara langsung." : "Setelah WhatsApp terbuka, pilih lampiran Dokumen dan sertakan PDF yang sudah diunduh."} Pesan dan berkas baru terkirim setelah Anda menekan Kirim.</p>
  </section>;
}
