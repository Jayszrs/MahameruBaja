"use client";
import { useEffect, useRef, useId, type ReactNode } from "react";
export default function AdminDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const id = useId();
  useEffect(() => { const element = dialog.current!; const focus = document.activeElement as HTMLElement; element.showModal(); return () => { element.close(); if(focus?.isConnected) focus.focus(); }; }, []);
  return <dialog ref={dialog} className="admin-action-dialog" aria-labelledby={id} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e=>{if(e.target === e.currentTarget) onClose();}}><div><header><h2 id={id}>{title}</h2><button type="button" aria-label="Tutup dialog" onClick={onClose}>×</button></header>{children}</div></dialog>;
}
