import type { CreateLeadInput } from "./api";
import { divisions } from "../data/divisionContent";

export async function createRequestPdf(input: CreateLeadInput, id: string, fontBytes?: Uint8Array, createdAt = new Date().toISOString()) {
  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([import("pdf-lib"), import("@pdf-lib/fontkit")]);
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const bytes = fontBytes || new Uint8Array(await fetch("/fonts/NotoSans-Regular.ttf").then(r => { if (!r.ok) throw new Error("Font PDF belum dapat dimuat."); return r.arrayBuffer(); }));
  const font = await pdf.embedFont(bytes, { subset: true });
  const ink = rgb(.12,.16,.15), muted = rgb(.42,.46,.43), red = rgb(.72,.13,.17), rule = rgb(.85,.87,.83);
  const unit = divisions.find(d => d.slug === input.businessUnitSlug);
  pdf.setTitle(`Permintaan Penawaran ${id}`); pdf.setAuthor("Mahameru Baja Indonesia"); pdf.setLanguage("id-ID");
  let page = pdf.addPage([595.28,841.89]); let y = 0;
  const clean = (value: string) => value.replace(/[\u0000-\u0008\u000b-\u001f]/g, "").replace(/\t/g, " ");
  const draw = (text: string, x: number, top: number, size = 10, color = ink) => page.drawText(clean(text), { x, y: top, size, font, color });
  function wrap(text: string, width: number, size: number) {
    const lines: string[] = [];
    for (const paragraph of clean(text || "-").split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (font.widthOfTextAtSize(`${line}${line ? " " : ""}${word}`, size) <= width) { line += `${line ? " " : ""}${word}`; continue; }
        if (line) lines.push(line); line = "";
        for (const char of word) {
          if (line && font.widthOfTextAtSize(line + char, size) > width) { lines.push(line); line = ""; }
          line += char;
        }
      }
      lines.push(line);
    }
    return lines;
  }
  function header(first: boolean) {
    page.drawRectangle({ x:0,y:826,width:595.28,height:16,color:red });
    draw("MAHAMERU BAJA",44,786,17); draw("INDONESIA / REQUEST DESK",44,769,8,muted);
    draw(id,355,786,8,red);
    draw(new Date(createdAt).toLocaleDateString("id-ID", { timeZone:"Asia/Jakarta", day:"numeric", month:"long", year:"numeric" }),355,770,8,muted);
    page.drawLine({ start:{x:44,y:750},end:{x:551,y:750},thickness:1,color:rule });
    y = 719;
    if (first) {
      draw("PERMINTAAN PENAWARAN",44,y,22); y-=26;
      draw("Ringkasan kebutuhan pelanggan",44,y,11,muted); y-=33;
    } else { draw("PERMINTAAN PENAWARAN / LANJUTAN",44,y,10,red); y-=28; }
  }
  header(true);
  function space(height: number) { if (y-height < 65) { page=pdf.addPage([595.28,841.89]);header(false); } }
  function textBlock(text: string, size=10, color=ink, width=507, x=44) {
    for (const line of wrap(text,width,size)) { space(16);draw(line,x,y,size,color);y-=16; }
  }
  function field(label:string,value:string) { space(45);draw(label.toUpperCase(),44,y,8,muted);y-=17;textBlock(value);y-=9; }
  field("Divisi tujuan",unit?.name || "Mahameru Baja");
  field("Pemohon / Perusahaan",`${input.name}${input.company ? ` / ${input.company}` : ""}`);
  field("Kontak",`${input.whatsapp}${input.email ? ` | ${input.email}` : ""}`);
  if (input.city) field("Lokasi kebutuhan",input.city);
  const tableHeader = () => { space(48);page.drawRectangle({x:44,y:y-25,width:507,height:29,color:ink});draw("NO",54,y-15,8,rgb(1,1,1));draw("MATERIAL / SPESIFIKASI",85,y-15,8,rgb(1,1,1));draw("JUMLAH",450,y-15,8,rgb(1,1,1));y-=44; };
  if (input.items?.length) {
    tableHeader();
    for (const [index,item] of input.items.entries()) {
      const lines=wrap(`${item.productName}${item.specification ? `\n${item.specification}` : ""}`,345,9);
      const quantityLines=wrap(`${item.quantity ?? "Konfirmasi"} ${item.unit || ""}`,89,9);
      let offset=0;const lineCount=Math.max(lines.length,quantityLines.length);
      while(offset<lineCount) {
        if (y < 100) { space(100);tableHeader(); }
        const count=Math.min(lineCount-offset,Math.max(1,Math.floor((y-78)/15)));
        draw(offset===0 ? String(index+1).padStart(2,"0") : "...",54,y,9,muted);
        for(let j=0;j<count;j++) { if(lines[offset+j])draw(lines[offset+j],85,y-j*15,9);if(quantityLines[offset+j])draw(quantityLines[offset+j],450,y-j*15,9); }
        y-=count*15+16;offset+=count;
        page.drawLine({start:{x:44,y:y+6},end:{x:551,y:y+6},thickness:.5,color:rule});
      }
    }
    y-=14;
  }
  if (input.request) field("Catatan / detail pekerjaan",input.request);
  const attachment = input.metadata?.attachmentName;
  if (attachment) field("Berkas desain",`${String(attachment)} - dikirim terpisah melalui WhatsApp.`);
  space(95);y-=10;
  draw("HARGA & KETERSEDIAAN: MENUNGGU KONFIRMASI",44,y,9,red);y-=22;
  textBlock("Dokumen ini adalah permintaan penawaran pelanggan, bukan penawaran harga final, invoice, atau bukti pembayaran. Tim akan meninjau spesifikasi, harga, pajak, stok, dan jadwal sebelum menerbitkan penawaran resmi.",9,muted);
  const pages=pdf.getPages();
  pages.forEach((p,index)=>{p.drawLine({start:{x:44,y:48},end:{x:551,y:48},thickness:.5,color:rule});p.drawText("MAHAMERU BAJA INDONESIA  |  RINGKASAN PERMINTAAN",{x:44,y:31,size:7,font,color:muted});p.drawText(`${index+1} / ${pages.length}`,{x:522,y:31,size:8,font,color:muted});});
  return pdf.save();
}
