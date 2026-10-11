"use client";
import Link from "next/link";
import { useNavigationGuard } from "nextjs-nav-guard";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { activeAdminNavigation, adminNavigation } from "../data/adminNavigation";
import { AdminWorkspaceContext, emptyAdminWorkspace, type AdminWorkspaceState } from "./AdminWorkspace";

const preferenceKey = "mahameru.admin.navigation.v1";
export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const params = useSearchParams();
  const search = params.toString();
  const { group, item } = activeAdminNavigation(pathname, new URLSearchParams(search));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ sales: true });
  const [ready, setReady] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [desktop, setDesktop] = useState(true);
  const [workspace, setWorkspace] = useState<AdminWorkspaceState>(emptyAdminWorkspace);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const allowUnload = useRef(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const register = useCallback((value: AdminWorkspaceState) => setWorkspace(value), []);

  useEffect(() => {
    let saved: Record<string, boolean> = { sales: true };
    try { const parsed = JSON.parse(localStorage.getItem(preferenceKey) || "null"); if (parsed && typeof parsed === "object") saved = Object.fromEntries(adminNavigation.map(group => [group.id, parsed[group.id] === true])); } catch { /* Storage can be disabled. */ }
    if (group) saved[group.id] = true;
    setExpanded(saved); setReady(true);
    // Hydrate preferences once; subsequent navigation opens the active group below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(preferenceKey, JSON.stringify(expanded)); } catch { /* Optional preference. */ } } }, [expanded, ready]);
  useEffect(() => { if (group) setExpanded(current => ({ ...current, [group.id]: true })); }, [group?.id, item?.href]);
  useEffect(() => { setDrawer(false); allowUnload.current = false; }, [pathname, search]);
  useEffect(() => { const media = matchMedia("(min-width:1024px)"); const close = () => { setDesktop(media.matches); if (media.matches) setDrawer(false); }; close(); media.addEventListener("change", close); return () => media.removeEventListener("change", close); }, []);
  useEffect(() => { if (!drawer && !confirmOpen) return; const previous = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previous; }; }, [drawer, confirmOpen]);

  const confirmDiscard = useCallback(() => {
    if (workspace.busy) return Promise.resolve(false);
    if (!workspace.dirty) return Promise.resolve(true);
    if (resolver.current) return Promise.resolve(false);
    previousFocus.current = document.activeElement as HTMLElement;
    setConfirmOpen(true);
    return new Promise<boolean>(resolve => { resolver.current = resolve; });
  }, [workspace.busy, workspace.dirty]);
  const finishConfirm = useCallback((value: boolean) => {
    const resolve = resolver.current; resolver.current = null; setConfirmOpen(false); resolve?.(value);
    if (previousFocus.current?.isConnected) previousFocus.current.focus();
  }, []);
  useEffect(() => () => { resolver.current?.(false); }, []);

  useEffect(() => {
    const container = confirmOpen ? dialog.current : drawer ? sidebar.current : null;
    if (!container) return;
    const controls = () => Array.from(container.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')).filter(element => element.getClientRects().length > 0);
    controls()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); if (confirmOpen) finishConfirm(false); else { setDrawer(false); menuButton.current?.focus(); } }
      if (event.key !== "Tab") return;
      const items = controls(); const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keyboard); return () => document.removeEventListener("keydown", keyboard);
  }, [drawer, confirmOpen, finishConfirm]);
  const context = useMemo(() => ({ register, confirmDiscard }), [register, confirmDiscard]);
  const stateRef = useRef(workspace); stateRef.current = workspace;
  const confirmRef = useRef(confirmDiscard); confirmRef.current = confirmDiscard;
  const pathRef = useRef(pathname); pathRef.current = pathname;
  useNavigationGuard({
    enabled: useCallback(({to,type}:{to:string;type:string}) => {
      if (type === "refresh" || (type === "beforeunload" && allowUnload.current)) return false;
      const value = stateRef.current;
      if (!value.dirty && !value.busy) return false;
      if (type === "beforeunload") return true;
      return value.busy || new URL(to,location.origin).pathname !== pathRef.current;
    }, []),
    confirm: useCallback(({type}:{type:string}) => {
      if (type === "beforeunload") return false;
      return confirmRef.current();
    }, []),
  });
  return <AdminWorkspaceContext.Provider value={context}><div className="admin-shell">
    <a href="#admin-main" className="admin-skip-link">Langsung ke konten</a>
    {drawer && <button className="admin-drawer-backdrop" tabIndex={-1} aria-label="Tutup menu admin" onClick={() => { setDrawer(false); menuButton.current?.focus(); }} />}
    <aside id="admin-sidebar" ref={sidebar} inert={!desktop && !drawer} aria-hidden={!desktop && !drawer ? true : undefined} className={`admin-sidebar${drawer ? " is-open" : ""}`} role={drawer ? "dialog" : undefined} aria-modal={drawer ? true : undefined} aria-label="Navigasi admin">
      <div className="admin-sidebar-brand"><Link href="/admin"><img src="/mbi-mark.svg" alt="" /><span>Mahameru Baja<small>CONTENT STUDIO</small></span></Link><button type="button" className="admin-drawer-close" aria-label="Tutup menu" onClick={() => { setDrawer(false); menuButton.current?.focus(); }}>×</button></div>
      <nav aria-label="Menu admin"><Link className={`admin-dashboard-link${pathname === "/admin" ? " active" : ""}`} href="/admin" aria-current={pathname === "/admin" ? "page" : undefined}><span aria-hidden="true">▦</span>Dashboard</Link>
        <p className="admin-nav-caption">RUANG KERJA</p>
        {adminNavigation.map(category => <div className={`admin-nav-group${group?.id === category.id ? " current" : ""}`} key={category.id}>
          <button type="button" className="admin-group-toggle" aria-expanded={Boolean(expanded[category.id])} aria-controls={`admin-group-${category.id}`} onClick={() => setExpanded(current => ({ ...current, [category.id]: !current[category.id] }))}><span className="admin-group-number">{category.number}</span><span>{category.label}</span><svg className={expanded[category.id] ? "expanded" : ""} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button>
          <div id={`admin-group-${category.id}`} hidden={!expanded[category.id]} className="admin-submenu">{category.items.map(child => {
            const active = group?.id === category.id && item?.href === child.href;
            return <Link key={child.href} href={child.href} aria-current={active ? "page" : undefined} className={active ? "active" : ""}><span aria-hidden="true" />{child.label}</Link>;
          })}</div>
        </div>)}
      </nav>
      <div className="admin-sidebar-footer"><a href="/" target="_blank" rel="noopener noreferrer">Lihat website <span aria-hidden="true">↗</span></a><form action="/api/admin/logout" method="post" onSubmit={event => { if (allowUnload.current) return; if (workspace.busy || workspace.dirty) { event.preventDefault(); const form = event.currentTarget; void confirmDiscard().then(accepted => { if (accepted) { allowUnload.current = true; form.requestSubmit(); } }); } }}><button type="submit" disabled={workspace.busy}>Keluar <span aria-hidden="true">↗</span></button></form><small>Mahameru Baja · Portal Admin</small></div>
    </aside>
    <div className="admin-stage"><header className="admin-topbar"><div className="admin-location"><button type="button" ref={menuButton} className="admin-menu-button" aria-label="Buka menu admin" aria-expanded={drawer} aria-controls="admin-sidebar" onClick={() => setDrawer(true)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg></button><span>{group ? <><small>{group.label}</small><b aria-hidden="true">/</b>{item?.label}</> : "Dashboard"}</span></div>
      <div className="admin-topbar-actions">{workspace.label && <><span className={`admin-save-state${workspace.dirty ? " dirty" : ""}`} role="status">{workspace.busy ? "Sedang diproses…" : workspace.dirty ? "Perubahan belum disimpan" : "Semua perubahan tersimpan"}</span>{workspace.secondaryLabel && <button type="button" className="admin-secondary" disabled={workspace.busy} onClick={workspace.onSecondary}>{workspace.secondaryLabel}</button>}<button type="button" className="admin-primary" disabled={workspace.busy || workspace.disabled} onClick={workspace.onSave}>{workspace.busy ? "Memproses…" : workspace.label}</button></>}</div>
    </header><main id="admin-main" tabIndex={-1} className="admin-page-content">{children}</main></div>
    {confirmOpen && <div className="admin-modal-backdrop"><div className="admin-discard-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="admin-discard-heading"><span className="admin-dialog-icon" aria-hidden="true">!</span><h2 id="admin-discard-heading">Perubahan belum disimpan</h2><p>Perubahan pada ruang kerja ini akan hilang jika kamu melanjutkan. Simpan terlebih dahulu atau tetap di halaman ini.</p><div><button type="button" className="admin-secondary" onClick={() => finishConfirm(false)}>Tetap di halaman</button><button type="button" className="admin-primary" onClick={() => finishConfirm(true)}>Tinggalkan perubahan</button></div></div></div>}
  </div></AdminWorkspaceContext.Provider>;
}
