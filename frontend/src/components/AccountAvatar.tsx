"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminIdentity } from "./AdminIdentity";
import Image from "./CmsImage";
import { accountAvatarSchema } from "../data/adminAccount";
import { uploadCmsFile } from "../lib/cmsUpload";
import type { AdminWorkspaceState } from "./AdminWorkspace";
export default function AccountAvatar({ onWorkspaceChange, disabled = false, profileVersion = 0 }: { onWorkspaceChange?: (state: AdminWorkspaceState) => void; disabled?: boolean; profileVersion?: number }) {
  const actor = useAdminIdentity(); const router = useRouter();
  const [avatar, setAvatar] = useState(actor.avatar || "");
  const [savedAvatar, setSavedAvatar] = useState(actor.avatar || "");
  const [revision, setRevision] = useState<number | null>(null);
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const dirty = avatar !== savedAvatar;
  const dirtyRef = useRef(dirty); dirtyRef.current = dirty;
  const invalid = !accountAvatarSchema.safeParse(avatar).success;
  const saveDisabled = busy || disabled || actor.mustChangePassword || revision === null || invalid || !dirty;
  const saveRef = useRef<() => void>(() => {});
  const saveCurrent = useCallback(() => saveRef.current(), []);
  useEffect(() => {
    onWorkspaceChange?.({ dirty, busy, disabled: saveDisabled, onSave: saveCurrent });
  }, [dirty, busy, saveDisabled, saveCurrent, onWorkspaceChange]);
  useEffect(() => {
    if (actor.mustChangePassword) return;
    setRevision(null);
    const controller = new AbortController();
    void fetch("/api/admin/profile", { signal: controller.signal }).then(async response => {
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      if (controller.signal.aborted) return;
      setRevision(result.revision); if (!dirtyRef.current) setAvatar(result.avatar || ""); setSavedAvatar(result.avatar || ""); setFailed(false); setMessage("");
    }).catch(error => { if (error.name !== "AbortError") { setFailed(true); setMessage(error.message); } });
    return () => controller.abort();
  }, [actor.id, actor.mustChangePassword, profileVersion, reload]);
  async function save() {
    if (saveDisabled) return;
    setBusy(true); setFailed(false); setMessage("");
    try {
      const response = await fetch("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar, revision }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      setRevision(result.revision); setSavedAvatar(result.avatar || ""); setMessage("Foto profil tersimpan."); router.refresh();
    } catch (error) { setFailed(true); setMessage((error as Error).message); }
    finally { setBusy(false); }
  }
  saveRef.current = () => { void save(); };
  return <section className="account-avatar-editor"><h3>Foto / logo profil saya</h3>{avatar && !invalid && <Image src={avatar} alt="Profil saya" width={88} height={88}/>}<fieldset disabled={busy || disabled || actor.mustChangePassword || revision === null}>
    <label className="editor-field">Unggah JPG, PNG, atau WebP · maksimal 4 MB<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
      const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
      setBusy(true); setMessage(""); setFailed(false);
      void uploadCmsFile(file, "image", actor.division).then(setAvatar).catch(error => { setFailed(true); setMessage(error.message); }).finally(() => setBusy(false));
    }}/></label><label className="editor-field">URL gambar<input type="text" value={avatar} aria-invalid={invalid} onChange={event => setAvatar(event.target.value)}/>{invalid && <small className="admin-field-error">Gunakan gambar hasil unggahan atau URL HTTPS.</small>}</label>
    <div className="admin-form-actions"><button type="button" className="admin-primary" disabled={saveDisabled} onClick={() => void save()}>{busy ? "Menyimpan…" : "Simpan foto profil"}</button>{avatar && <button type="button" className="admin-secondary" onClick={() => setAvatar("")}>Hapus foto</button>}{dirty && <button type="button" className="admin-secondary" onClick={() => { setAvatar(savedAvatar); setMessage(""); }}>Batalkan perubahan foto</button>}</div>
    <p className="admin-field-help">Perubahan foto perlu disimpan. Foto akun tidak otomatis tampil di halaman kontak publik.</p>
  </fieldset>{actor.mustChangePassword && <p>Ganti password sementara dahulu untuk mengelola foto profil.</p>}{message && <p role={failed ? "alert" : "status"}>{message}</p>}{failed && !actor.mustChangePassword && <button type="button" className="admin-secondary" disabled={busy || disabled} onClick={() => { setAvatar(savedAvatar); setRevision(null); setMessage(""); setReload(value => value + 1); }}>Batalkan & muat ulang profil</button>}</section>;
}
