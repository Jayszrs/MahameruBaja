import type { Invoice, RequestRecord } from "../data/requests";

export async function invoicePdf(record: RequestRecord, invoice: Invoice) {
  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([import("pdf-lib"), import("@pdf-lib/fontkit")]);
  const response = await fetch("/fonts/NotoSans-Regular.ttf");
  if (!response.ok) throw new Error("Font PDF belum tersedia.");
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await response.arrayBuffer(), { subset: true });
  const supported = new Set(font.getCharacterSet());
  const clean = (value: string) => [...value.replace(/[\u0000-\u001f]/g, " ")].map(c => supported.has(c.codePointAt(0)!) ? c : "?").join("");
  const ink = rgb(.15,.16,.17), red = rgb(.65,.07,.12), muted = rgb(.4,.42,.44);
  let page = pdf.addPage([595,842]), y = 650;
  function draw(value: string, x: number, top: number, size = 9, color = ink) { page.drawText(clean(value), { x, y: top, size, font, color }); }
  function right(value: string, edge: number, top: number, maxWidth: number, size = 9, color = ink) {
    const text = clean(value);
    const fitted = Math.min(size, size * maxWidth / Math.max(1,font.widthOfTextAtSize(text,size)));
    draw(text, edge - font.widthOfTextAtSize(text,fitted), top, fitted, color);
  }
  function wrap(value: string, width: number) {
    const out: string[] = []; let line = "";
    for (const char of clean(value)) { if (font.widthOfTextAtSize(line+char,9)>width) { out.push(line); line=""; } line+=char; }
    if (line) out.push(line);
    return out;
  }
  function header() {
    page.drawRectangle({ x:0,y:825,width:595,height:17,color:red });
    draw("MAHAMERU BAJA INDONESIA",40,790,18);
    draw("DRAFT INVOICE / MENUNGGU PERSETUJUAN",40,762,11,red);
    right(invoice.number,555,739,515,10);
    draw(`Tanggal: ${invoice.issuedAt} | Jatuh tempo: ${invoice.dueAt || "Belum ditentukan"}`,40,718,9,muted);
    y=696;
    for (const value of wrap(`Kepada: ${record.name}${record.company ? ` / ${record.company}` : ""}`,515)) { draw(value,40,y); y-=14; }
    y-=18;
    draw("URAIAN",40,y,8,red);
    right("JUMLAH / SATUAN",345,y,74,7,red);
    right("HARGA SATUAN",450,y,100,8,red);
    right("SUBTOTAL",555,y,100,8,red);
    y-=24;
  }
  header();
  const money = (n: number) => new Intl.NumberFormat("id-ID", { style:"currency",currency:"IDR",maximumFractionDigits:0 }).format(n);
  for (const [index,line] of invoice.lines.entries()) {
    const description = wrap(`${index+1}. ${line.description}`,225);
    const quantity = wrap(`${line.quantity} ${line.unit}`,70);
    const height = Math.max(42,Math.max(description.length,quantity.length)*14+14);
    if (y-height<160) { page=pdf.addPage([595,842]); header(); }
    description.forEach((value,i)=>draw(value,40,y-i*14));
    quantity.forEach((value,i)=>right(value,345,y-i*14,70));
    right(money(line.price),450,y,100);
    right(money(line.price*line.quantity),555,y,100);
    y-=height;
    page.drawLine({start:{x:40,y:y+10},end:{x:555,y:y+10},color:rgb(.85,.85,.85),thickness:.5});
  }
  if (y<200) { page=pdf.addPage([595,842]); header(); }
  right(`TOTAL: ${money(invoice.lines.reduce((sum,line)=>sum+line.price*line.quantity,0))}`,555,y-10,300,12,red);
  y-=48;
  for (const line of wrap(invoice.notes,510)) {
    if (y<100) { page=pdf.addPage([595,842]); header(); }
    draw(line,40,y,9,muted); y-=14;
  }
  pdf.getPages().forEach((p,i)=>{
    p.drawText("Draf internal. Bukan faktur pajak atau bukti pembayaran. Template final perlu persetujuan.",{x:40,y:50,size:8,font,color:muted});
    p.drawText(`${record.id} | ${i+1}/${pdf.getPageCount()}`,{x:40,y:35,size:8,font,color:muted});
  });
  pdf.setTitle(`Draft Invoice ${invoice.number}`);
  pdf.setAuthor("Mahameru Baja Indonesia");
  return pdf.save();
}
