import type {Division} from "../data/divisionCms";
import {imageUploadHelp,videoUploadHelp} from "../lib/cmsUpload";
export default function DivisionCardMediaFields({value,disabled,update,upload}:{value:Division["routeMedia"];disabled:boolean;update:(value:Division["routeMedia"])=>void;upload:(file:File,poster?:boolean)=>Promise<void>}) {
  const media=value||{type:"image" as const,media:""};
  return <section className="editor-panel division-route-media-fields"><h3>Media kartu divisi di beranda</h3><p>Terpisah dari gambar utama website divisi. Jika dikosongkan, kartu memakai gambar utama. Kartu tetap diam saat halaman digulir, tanpa parallax.</p>
    <div className="editor-grid"><label className="editor-field">Jenis media<select value={media.type} onChange={e=>update({type:e.target.value as "image"|"video",media:""})}><option value="image">Gambar</option><option value="video">Video MP4</option></select></label>
    <label className="editor-field">Unggah gambar atau video<input type="file" disabled={disabled} accept="image/jpeg,image/png,image/webp,video/mp4" onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void upload(file);}}/></label>
    <label className="editor-field">Alamat media<input value={media.media} onChange={e=>update({...media,media:e.target.value})}/></label>
    {media.type==="video"&&<><label className="editor-field">Unggah gambar sampul video<input type="file" disabled={disabled} accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value="";if(file)void upload(file,true);}}/></label><label className="editor-field">Alamat sampul video (opsional)<input value={media.poster||""} onChange={e=>update({...media,poster:e.target.value})}/></label></>}</div>
    <p className="admin-field-help">{imageUploadHelp} {videoUploadHelp} Video diputar tanpa suara hanya ketika kartu terlihat. Preferensi kurangi gerakan atau hemat data memakai gambar sampul.</p>
    {value&&<button type="button" className="admin-secondary" onClick={()=>update(null)}>Gunakan gambar utama lagi</button>}
  </section>;
}
