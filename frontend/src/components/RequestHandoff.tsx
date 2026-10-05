"use client";
import { useEffect, useState } from "react";
import type { CreateLeadInput } from "../lib/api";

export default function RequestHandoff({ input, id, phone="6281218052017" }: { input: CreateLeadInput; id: string; phone?: string }) {
  const [file,setFile]=useState<File|null>(null);const [url,setUrl]=useState("");const [error,setError]=useState("");const [retry,setRetry]=useState(0);const [canShare,setCanShare]=useState(false);const [sharing,setSharing]=useState(false);
  useEffect(()=>{
    let stopped=false;let objectUrl="";setFile(null);setUrl("");setError("");
    import("../lib/requestPdf").then(m=>m.createRequestPdf(input,id)).then(bytes=>{
      if(stopped)return;
      const document=new File([bytes.slice().buffer as ArrayBuffer],`${id}-permintaan-penawaran.pdf`,{type:"application/pdf"});
      objectUrl=URL.createObjectURL(document);setFile(document);setUrl(objectUrl);setCanShare(Boolean(navigator.canShare?.({files:[document]})));
    }).catch(()=>{if(!stopped)setError("PDF belum dapat dibuat. Coba lagi atau lanjutkan dengan pesan WhatsApp.");});
    return()=>{stopped=true;if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[input,id,retry]);
  const message=`Halo Mahameru Baja, saya ${input.name}. Nomor permintaan saya ${id}.\nDivisi: ${input.businessUnitSlug || "retail-tambun"}\n${input.items?.map(i=>`- ${i.productName}: ${i.quantity ?? "konfirmasi"} ${i.unit || ""}`).join("\n") || input.request || "Mohon tindak lanjut penawaran."}\nSaya menyiapkan PDF ringkasan kebutuhan untuk dilampirkan. Mohon review spesifikasi, harga, dan jadwal.`;
  function download(){if(!url)return;const a=document.createElement("a");a.href=url;a.download=file!.name;a.click();}
  async function share(){if(!file||sharing)return;setSharing(true);setError("");try{await navigator.share({files:[file],title:`Permintaan ${id}`,text:message});}catch(e){if((e as Error).name!=="AbortError")setError("Perangkat belum bisa membagikan file. Gunakan Unduh PDF lalu lampirkan di WhatsApp.");}finally{setSharing(false);}}
  return <section className="request-handoff" aria-label="PDF dan WhatsApp"><div className="request-document-icon" aria-hidden="true">PDF</div><div><h3>Ringkasan kebutuhan Anda.</h3><p>{file ? `${file.name} siap dikirim.` : error ? "Pesan WhatsApp tetap tersedia." : "Menyiapkan PDF otomatis..."}</p><small>Harga dan jadwal menunggu konfirmasi tim.</small></div><div className="request-handoff-actions">{canShare&&<button type="button" disabled={sharing||!file} onClick={share}>{sharing?"Membuka menu berbagi...":"Bagikan PDF ke WhatsApp"}</button>}<a href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" onClick={download}>{file?"Unduh PDF & buka WhatsApp":"Buka WhatsApp"}</a>{url&&<a href={url} download={file!.name} className="handoff-secondary">Unduh PDF saja</a>}{error&&<><p role="alert">{error}</p><button type="button" className="handoff-secondary" onClick={()=>setRetry(n=>n+1)}>Coba buat PDF lagi</button></>}</div><p className="handoff-note">{canShare ? "Pilih WhatsApp dan kontak tujuan pada menu berbagi perangkat." : "PDF akan diunduh. Di WhatsApp, pilih lampiran Dokumen dan sertakan PDF tersebut."} Pesan dan berkas dikirim setelah Anda menekan Kirim di WhatsApp.</p></section>;
}
