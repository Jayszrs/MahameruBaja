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
  const [drag, setDrag] = useState<{ from: string; to: string } | null>(null);
  const [notice, setNotice] = useState("");
  function move(from: string, to: string) {
    if (disabled || from === to) return;
    onMove(from, to);
    setNotice(`${items.find(item => item.id === from)?.title || "Item"} dipindahkan ke urutan ${items.findIndex(item => item.id === to) + 1}. Simpan perubahan untuk menerapkan urutan.`);
  }
  return <section className="admin-order-list" aria-label={label}>
    <div className="editor-list-heading"><h3>{label}</h3>{children}</div>
    {items.length > 1 && <p className="admin-field-help" id={`${listId}-help`}>Tarik pegangan untuk mengatur urutan. Dengan keyboard, fokuskan pegangan lalu tekan panah atas atau bawah.</p>}
    <div className="admin-order-items">{items.map((item, index) => <div key={item.id} data-order-list={listId} data-order-id={item.id} className={`admin-order-row${selected === item.id ? " is-selected" : ""}${drag?.to === item.id ? " is-drop-target" : ""}`}>
      <button type="button" className="admin-drag-handle" aria-label={`Atur urutan ${item.title}, posisi ${index + 1} dari ${items.length}`} aria-describedby={items.length > 1 ? `${listId}-help` : undefined} disabled={disabled || items.length < 2} style={{ touchAction: "none" }}
        onPointerDown={event => { if (event.button !== 0 || disabled || items.length < 2) return; event.currentTarget.setPointerCapture(event.pointerId); setDrag({ from: item.id, to: item.id }); }}
        onPointerMove={event => { if (!drag) return;
          const scrollArea = event.currentTarget.closest<HTMLElement>(".admin-order-items");
          if (scrollArea) { const bounds = scrollArea.getBoundingClientRect(); const step = event.clientY < bounds.top + 40 ? -16 : event.clientY > bounds.bottom - 40 ? 16 : 0; if (step) scrollArea.scrollBy(0, step); }
          if (event.clientY < 70) window.scrollBy(0, -16); else if (event.clientY > window.innerHeight - 70) window.scrollBy(0, 16);
          const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-order-id]"); if (target?.dataset.orderList === listId && target.dataset.orderId) setDrag({ from: drag.from, to: target.dataset.orderId }); }}
        onPointerUp={event => { if (drag) move(drag.from, drag.to); setDrag(null); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={event => { const offset = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0; if (!offset) return; event.preventDefault(); const target = items[index + offset]; if (target) move(item.id, target.id); }}>
        <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor" aria-hidden="true">{[6,12,18].flatMap(y => [7,13].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5"/>))}</svg>
      </button>
      <span className="admin-order-number">{index + 1}</span>
      {item.image && <img src={item.image} alt="" className="admin-order-thumbnail"/>}
      {onSelect ? <button type="button" className="admin-order-select" disabled={disabled} aria-pressed={selected === item.id} onClick={() => onSelect(item.id)}><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</button> : <div className="admin-order-copy"><strong>{item.title}</strong>{item.detail && <small>{item.detail}</small>}</div>}
    </div>)}</div><p className="admin-order-status" role="status" aria-live="polite">{notice}</p>
  </section>;
}
