"use client";
import { useId, useState, type ReactNode } from "react";

type OrderItem = { id: string; title: string; detail?: string; image?: string };
export function moveBefore<T extends { id: string }>(items: T[], fromId: string, toId: string): T[] {
  const from = items.findIndex(item => item.id === fromId), to = items.findIndex(item => item.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}
export function focusEditorRecord(id: string) {
  requestAnimationFrame(() => {
    const record = document.getElementById(id);
    if (record instanceof HTMLDetailsElement) record.open = true;
    record?.scrollIntoView({ block: "start", behavior: "instant" });
    record?.querySelector<HTMLInputElement | HTMLTextAreaElement>("input:not([type=checkbox]):not([type=file]), textarea")?.focus({ preventScroll: true });
  });
}
export default function AdminOrderList({ items, label, onMove, onSelect, selected, disabled, children }: {
  items: OrderItem[]; label: string; onMove: (fromId: string, toId: string) => void;
  onSelect?: (id: string) => void; selected?: string; disabled?: boolean; children?: ReactNode;
}) {
  const listId = useId();
  const [drag, setDrag] = useState<{ from: string; to: string; x: number; y: number; left: number; top: number; width: number; height: number; offsetX: number; offsetY: number } | null>(null);
  const [notice, setNotice] = useState("");
  function move(from: string, to: string) {
    if (disabled || from === to) return;
    onMove(from, to);
    setNotice(`${items.find(item => item.id === from)?.title || "Item"} dipindahkan ke urutan ${items.findIndex(item => item.id === to) + 1}. Simpan untuk menerapkan urutan.`);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-order-list="${CSS.escape(listId)}"] [data-order-id="${CSS.escape(from)}"] .admin-drag-handle`)?.focus());
  }
  return <section className="admin-order-list" aria-label={label}>
    <div className="editor-list-heading"><h3>{label}</h3>{children}</div>
    {items.length > 1 && <p className="admin-field-help" id={`${listId}-help`}>Seret untuk mengubah urutan. Jika menggunakan keyboard, tekan panah atas atau bawah untuk memindahkan item.</p>}
    <div className="admin-order-items">{items.map((item, index) => { const lifted=drag?.from===item.id; return <div className="admin-order-slot" key={item.id} style={lifted?{height:drag.height}:undefined}><div data-order-list={listId} data-order-id={item.id} className={`admin-order-row${selected === item.id ? " is-selected" : ""}${drag?.to === item.id ? " is-drop-target" : ""}${lifted ? " is-dragging" : ""}`} style={lifted?{position:"fixed",left:drag.x-drag.offsetX,top:drag.y-drag.offsetY,width:drag.width,zIndex:80,pointerEvents:"none",transform:"scale(1.015) rotate(.25deg)"}:undefined}>
      <button type="button" className="admin-drag-handle" aria-label={`Atur urutan ${item.title}, posisi ${index + 1} dari ${items.length}`} aria-describedby={items.length > 1 ? `${listId}-help` : undefined} aria-keyshortcuts="ArrowUp ArrowDown" disabled={disabled || items.length < 2} style={{ touchAction: "none" }}
        onPointerDown={event => { if (event.button !== 0 || disabled || items.length < 2) return; const rect=event.currentTarget.closest<HTMLElement>(".admin-order-row")!.getBoundingClientRect(); event.currentTarget.setPointerCapture(event.pointerId); setDrag({ from:item.id,to:item.id,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top }); }}
        onPointerMove={event => { if (!drag) return;
          const scrollArea = event.currentTarget.closest<HTMLElement>(".admin-order-items");
          if (scrollArea) { const bounds = scrollArea.getBoundingClientRect(); const step = event.clientY < bounds.top + 40 ? -12 : event.clientY > bounds.bottom - 40 ? 12 : 0; if (step) scrollArea.scrollBy(0, step); }
          const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-order-id]"); setDrag({...drag,x:event.clientX,y:event.clientY,to:target?.dataset.orderList===listId&&target.dataset.orderId?target.dataset.orderId:drag.to}); }}
        onPointerUp={event => { if (drag) move(drag.from, drag.to); setDrag(null); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={event => { const offset = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0; if (!offset) return; event.preventDefault(); event.stopPropagation(); const target = items[index + offset]; if (target) move(item.id, target.id); }}>
        <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" aria-hidden="true">{[6,12,18].flatMap(y => [7,13].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5"/>))}</svg>
      </button>
      <span className="admin-order-number">{index + 1}</span>
      {item.image && <img src={item.image} alt="" className="admin-order-thumbnail"/>}
      {onSelect ? <button type="button" className="admin-order-select" disabled={disabled} aria-pressed={selected === item.id} aria-label={`Buka rincian ${item.title}`} onClick={() => onSelect(item.id)}><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}<span className="admin-order-open" aria-hidden="true">Buka rincian ↗</span></button> : <div className="admin-order-copy"><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</div>}
    </div></div>;})}</div><p className="admin-order-status" role="status" aria-live="polite">{notice}</p>
  </section>;
}
