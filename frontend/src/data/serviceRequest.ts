export const serviceRequestSteps = ["Layanan", "Gambar & detail", "Kontak", "Ringkasan"] as const;
export type ServiceRequestDraft = { material:string; thickness:string; dimensions:string; quantity:string; notes:string; noDrawing:boolean; name:string; company:string; whatsapp:string; city:string; consent:boolean };
export const emptyServiceRequest:ServiceRequestDraft={material:"",thickness:"",dimensions:"",quantity:"",notes:"",noDrawing:false,name:"",company:"",whatsapp:"",city:"",consent:false};
export type ServiceRequestErrors=Partial<Record<keyof ServiceRequestDraft|"service"|"division"|"file",string>>;
export function validateServiceStep(step:number,draft:ServiceRequestDraft,service:string,division:string,file:Pick<File,"name"|"size">|null):ServiceRequestErrors {
 const errors:ServiceRequestErrors={};
 if(step===0){if(!service)errors.service="Pilih layanan yang Anda butuhkan.";if(!division)errors.division="Pilih divisi tujuan.";}
 if(step===1){
  if(file&&(!/\.(dwg|dxf|pdf|ai|cdr|jpe?g|png)$/i.test(file.name)||file.size>10*1024*1024))errors.file="Gunakan DWG, DXF, PDF, AI, CDR, JPG, atau PNG, maksimal 10 MB.";
  if(!file&&!draft.noDrawing)errors.file="Pilih gambar atau centang ‘Belum punya gambar’.";
  if(draft.noDrawing&&draft.notes.trim().length<10)errors.notes="Ceritakan kebutuhan Anda, minimal 10 karakter.";
  if(draft.material.trim().length<2)errors.material="Isi material, atau tulis ‘Minta rekomendasi’.";
  if(draft.dimensions.trim().length<2)errors.dimensions="Isi ukuran, atau tulis ‘Perlu bantuan menentukan ukuran’.";
  if(!/^\d+$/.test(draft.quantity)||Number(draft.quantity)<1)errors.quantity="Isi jumlah komponen, minimal 1.";
  if(draft.thickness&&(!Number.isFinite(Number(draft.thickness))||Number(draft.thickness)<=0))errors.thickness="Ketebalan harus lebih dari 0 mm.";
 }
 if(step===2){
  if(draft.name.trim().length<2)errors.name="Isi nama, minimal 2 karakter.";
  const phone=draft.whatsapp.replace(/[\s()+.-]/g,"");
  if(!/^(?:0|62)\d{8,13}$/.test(phone))errors.whatsapp="Gunakan nomor WhatsApp aktif, misalnya 081218052017.";
  if(draft.city.trim().length<2)errors.city="Isi kota atau lokasi proyek.";
 }
 if(step===3&&!draft.consent)errors.consent="Centang persetujuan sebelum mengirim permintaan.";
 return errors;
}
