"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { safeArticleLink } from "../data/articleCms";

export default function ArticleRichEditor({ value, onChange, disabled, onUpload }: {
  value: string; onChange: (value: string) => void; disabled: boolean; onUpload: (file: File) => Promise<string | null>;
}) {
  const [panel, setPanel] = useState<"link" | "image" | null>(null);
  const [link, setLink] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [linkError, setLinkError] = useState("");
  const ready = useRef(false);
  const alive = useRef(true);
  const serialized = useRef("");
  const incoming = useRef(value);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, underline: false, strike: false, link: { openOnClick: false, autolink: false } }),
      Image.configure({ allowBase64: false }), TableKit.configure({ table: { resizable: false } }),
      Markdown.configure({ markedOptions: { gfm: true } }),
    ],
    content: value, contentType: "markdown", editable: !disabled,
    editorProps: { attributes: { class: "article-rich-document article-content", role: "textbox", "aria-label": "Isi artikel", "aria-multiline": "true" } },
    onCreate: ({ editor }) => { serialized.current = editor.getMarkdown(); ready.current = true; },
    onUpdate: ({ editor }) => {
      if (!ready.current || !alive.current) return;
      const markdown = editor.getMarkdown();
      if (markdown === serialized.current) return;
      serialized.current = markdown; incoming.current = markdown; onChange(markdown);
    },
  });
  const active = useEditorState({ editor, selector: ({ editor }) => editor ? {
    bold: editor.isActive("bold"), italic: editor.isActive("italic"), bullet: editor.isActive("bulletList"),
    ordered: editor.isActive("orderedList"), table: editor.isActive("table"),
    heading: editor.isActive("heading", { level: 2 }) ? "2" : editor.isActive("heading", { level: 3 }) ? "3" : "0",
    undo: editor.can().undo(), redo: editor.can().redo(),
  } : null });
  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (editor && incoming.current !== value) {
      incoming.current = value;
      editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
      serialized.current = editor.getMarkdown();
    }
  }, [editor, value]);
  if (!editor) return <div className="article-editor-loading">Menyiapkan editor…</div>;
  const button = (label: string, action: () => void, pressed?: boolean, unavailable = false) => <button type="button" disabled={disabled || unavailable} onClick={action} aria-pressed={pressed} title={label}>{label}</button>;
  return <div className="article-rich-editor">
    <div className="article-toolbar" role="toolbar" aria-label="Format isi artikel">
      <label><span className="sr-only">Format paragraf</span><select aria-label="Format paragraf" disabled={disabled} value={active?.heading || "0"} onChange={event => {
        const level = Number(event.target.value);
        if (level === 0) editor.chain().focus().setParagraph().run();
        else editor.chain().focus().setHeading({ level: level as 2 | 3 }).run();
      }}><option value="0">Paragraf</option><option value="2">Judul bagian</option><option value="3">Subjudul</option></select></label>
      {button("Bold", () => { editor.chain().focus().toggleBold().run(); }, active?.bold)}
      {button("Italic", () => { editor.chain().focus().toggleItalic().run(); }, active?.italic)}
      {button("Daftar", () => { editor.chain().focus().toggleBulletList().run(); }, active?.bullet)}
      {button("Nomor", () => { editor.chain().focus().toggleOrderedList().run(); }, active?.ordered)}
      {button("Tautan", () => { setPanel(panel === "link" ? null : "link"); setLink(editor.getAttributes("link").href || ""); setLinkError(""); }, panel === "link")}
      {button("Gambar", () => setPanel(panel === "image" ? null : "image"), panel === "image")}
      {button("Tabel", () => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); })}
      {button("Undo", () => { editor.chain().focus().undo().run(); }, undefined, !active?.undo)}
      {button("Redo", () => { editor.chain().focus().redo().run(); }, undefined, !active?.redo)}
      {active?.table && <>{button("+ Baris", () => { editor.chain().focus().addRowAfter().run(); })}{button("+ Kolom", () => { editor.chain().focus().addColumnAfter().run(); })}{button("Hapus tabel", () => { editor.chain().focus().deleteTable().run(); })}</>}
    </div>
    {panel === "link" && <div className="article-toolbar-panel">
      <label className="editor-field">Alamat tautan<input value={link} disabled={disabled} onChange={event => setLink(event.target.value)} placeholder="https://…" /></label>
      <button type="button" disabled={disabled} onClick={() => {
        if (!safeArticleLink(link.trim())) { setLinkError("Masukkan tautan http/https, email, atau halaman website yang valid."); return; }
        editor.chain().focus().extendMarkRange("link").setLink({ href: link.trim() }).run(); setPanel(null);
      }}>Pasang tautan</button>
      <button type="button" disabled={disabled} onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); setPanel(null); }}>Hapus tautan</button>
      {linkError && <p role="alert">{linkError}</p>}
    </div>}
    {panel === "image" && <div className="article-toolbar-panel">
      <label className="editor-field">Deskripsi gambar isi<input value={imageAlt} disabled={disabled} onChange={event => setImageAlt(event.target.value)} maxLength={250} /></label>
      <label className="editor-field">Unggah JPG, PNG, atau WebP · maks. 4 MB<input type="file" disabled={disabled || !imageAlt.trim()} accept="image/jpeg,image/png,image/webp" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
        const url = await onUpload(file);
        if (url) { editor.chain().focus().setImage({ src: url, alt: imageAlt.trim() }).run(); setPanel(null); setImageAlt(""); }
      }} /></label>
    </div>}
    <EditorContent editor={editor} />
  </div>;
}
