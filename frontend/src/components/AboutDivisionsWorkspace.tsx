"use client";

import { useRef, useState } from "react";
import type { Division } from "../data/divisionCms";
import { visibleInDivision } from "../data/divisionCms";
import type { SiteContent } from "../data/siteContent";
import type { SectionListRow } from "../data/sectionLists";
import { defaultGalleryProjects } from "../data/projectGallery";
import { uploadCmsFile } from "../lib/cmsUpload";
import { useAdminWorkspace } from "./AdminWorkspace";
import AdminViewTabs from "./AdminViewTabs";
import AdminOrderList, { moveBefore } from "./AdminOrderList";
import { divisionIdentity } from "../data/companyIdentity";

type Mode = "all" | "content" | "text";
type Draft = Omit<
  Division,
  "id" | "revision" | "createdAt" | "updatedAt" | "admins"
>;
type ListRow = Record<string, string | number | boolean> & {
  id: string | number;
};
const centralCopy = {
  eyebrow: "JARINGAN MAHAMERU GROUP",
  heading: "Tim yang tepat untuk",
  headingTail: "setiap kebutuhan.",
  description:
    "Mulai dari pembelian material untuk toko dan proyek hingga pengerjaan baja sesuai gambar kerja. Kenali layanan setiap divisi dan hubungi admin untuk membicarakan kebutuhan Anda.",
};

function draftOf(row: Division): Draft {
  const {
    id: _id,
    revision: _revision,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    admins: _admins,
    ...draft
  } = row;
  return draft;
}

export default function AboutDivisionsWorkspace({
  initialContent,
  initialDivisions,
  initialSite = "",
}: {
  initialContent: SiteContent;
  initialDivisions: Division[];
  initialSite?: string;
}) {
  const mainSite = !initialSite;
  const selected =
    initialDivisions.find((row) => row.slug === initialSite) ||
    initialDivisions[0];
  const [mode, setMode] = useState<Mode>("all");
  const [division, setDivision] = useState(selected);
  const [draft, setDraft] = useState<Draft | null>(
    selected ? draftOf(selected) : null,
  );
  const [content, setContent] = useState(initialContent);
  const base = useRef(initialContent);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const page: "about" | "home" = mainSite ? "about" : "home";
  const section = mainSite ? "divisions" : "intro";
  const ownerDivision = division?.slug || null;
  const galleryProjectById = new Map(content.galleryProjects.map((project) => [project.id, project]));
  const galleryProjects = [
    ...defaultGalleryProjects.map((project) => galleryProjectById.get(project.id) || project),
    ...content.galleryProjects.filter((project) => !defaultGalleryProjects.some((item) => item.id === project.id)),
  ];

  function list(key: string) {
    return content.sectionLists.find(
      (row) =>
        row.page === page &&
        row.section === section &&
        (row.ownerDivision || null) === ownerDivision &&
        row.key === key,
    );
  }
  function rowId(
    row: Record<string, string | number | boolean>,
    fallback = "",
  ) {
    return typeof row.id === "string" || typeof row.id === "number"
      ? row.id
      : fallback;
  }
  function rowsOf(
    rows: Array<Record<string, string | number | boolean>>,
  ): ListRow[] {
    return rows.map((row, index) => ({
      ...row,
      id: rowId(row, `item-${index + 1}`),
    }));
  }
  function setList(
    key: string,
    rows: Array<Record<string, string | number | boolean>>,
  ) {
    const current = list(key);
    const normalizedRows = rowsOf(rows);
    const next = {
      id: current?.id || crypto.randomUUID(),
      page,
      section,
      ownerDivision,
      key,
      rows: normalizedRows,
      published: true,
    };
    const mirrorPage: "about" | "home" =
      page === "about" ? "home" : "about";
    const mirrorSection = page === "about" ? "intro" : "divisions";
    const mirror = division?.slug
      ? (() => {
          const existing = content.sectionLists.find(
            (row) =>
              row.page === mirrorPage &&
              row.section === mirrorSection &&
              (row.ownerDivision || null) === division.slug &&
              row.key === key,
          );
          return {
            id: existing?.id || crypto.randomUUID(),
            page: mirrorPage,
            section: mirrorSection,
            ownerDivision: division.slug,
            key,
            rows: normalizedRows,
            published: true,
          };
        })()
      : null;
    setContent((value) => ({
      ...value,
      sectionLists: [
        ...value.sectionLists.filter(
          (row) =>
            !(
              row.page === page &&
              row.section === section &&
              (row.ownerDivision || null) === ownerDivision &&
              row.key === key
            ) && !(mirror &&
              row.page === mirror.page &&
              row.section === mirror.section &&
              (row.ownerDivision || null) === mirror.ownerDivision &&
              row.key === mirror.key),
        ),
        next,
        ...(mirror ? [mirror] : []),
      ],
    }));
    setDirty(true);
    setMessage("");
  }
  function defaultAlbums(): ListRow[] {
    if (!division) return [];
    const projects = galleryProjects
      .filter(
        (project) =>
          project.published && visibleInDivision(project, division.slug),
      )
      .slice(0, 3);
    const pictures = [
      { src: division.hero, title: division.area || division.name },
      ...division.images,
    ].filter((item) => item.src);
    return Array.from({ length: 3 }, (_, index) => {
      const project = projects[index];
      const cover =
        project?.photos.find((photo) => photo.id === project.coverId) ||
        project?.photos[0];
      const fallback = pictures[index] || pictures[0];
      return {
        id: project?.id || `collage-${division.slug}-${index + 1}`,
        title: project?.title || fallback?.title || `Album ${index + 1}`,
        src: cover?.src || fallback?.src || "",
        alt: cover?.alt || fallback?.title || `Sampul album ${index + 1}`,
      };
    });
  }
  const galleryKey = division ? `collageImages:${division.slug}:gallery` : "";
  const coverKey = division ? `collageGroups:${division.slug}` : "";
  const legacyPhotoRows = division
    ? content.sectionLists
        .filter((row) => row.key.startsWith(`collageImages:${division.slug}:`) && row.rows.length)
        .flatMap((row) => row.rows)
    : [];
  const documentedPhotoRows = division
    ? galleryProjects
        .filter((project) => project.published && visibleInDivision(project, division.slug))
        .flatMap((project) => project.photos)
    : [];
  const knownPhotoSources = new Set(legacyPhotoRows.map((row) => String(row.src || "")));
  const defaultPhotos: ListRow[] = rowsOf([
    ...legacyPhotoRows,
    ...documentedPhotoRows.filter((row) => !knownPhotoSources.has(row.src)),
    ...(
      division
        ? [
            { src: division.hero, alt: division.area || division.name, caption: "" },
            ...division.images.map((image) => ({
              src: image.src,
              alt: image.title,
              caption: "",
            })),
            {
              src: divisionIdentity[division.slug]?.logo || "",
              alt: `Logo ${division.name}`,
              caption: "",
            },
          ].filter((row) => row.src && !knownPhotoSources.has(row.src))
        : []
    ),
  ]);
  const photos = rowsOf(
    galleryKey && list(galleryKey)?.rows.length
      ? list(galleryKey)!.rows
      : defaultPhotos,
  );
  const defaultCovers = photos.slice(0, 3).map((row, index) => ({
    id: `cover-${index + 1}`,
    photoId: String(rowId(row)),
    title: String(row.alt || `Sampul ${index + 1}`),
    src: String(row.src || ""),
    alt: String(row.alt || ""),
  }));
  const covers = rowsOf(
    coverKey && list(coverKey)?.rows.length
      ? list(coverKey)!.rows
      : defaultCovers,
  ).slice(0, 3);
  const photo = photos.find((row) => String(rowId(row)) === selectedPhoto);
  const coverCount = covers.filter((row) => String(row.photoId || "").trim()).length;
  const album = division
    ? {
        id: "gallery",
        title: `Galeri ${division.name}`,
        src: String(covers[0]?.src || ""),
        alt: String(covers[0]?.alt || ""),
      }
    : undefined;
  const albums = album ? [album] : [];
  const albumKey = coverKey;
  const photoKey = galleryKey;
  const albumId = "gallery";

  function updateCover(id: string | number, patch: Record<string, string>) {
    setList(coverKey, covers.map((row) => (rowId(row) === id ? { ...row, ...patch } : row)));
  }
  function updateAlbum(_id: string | number, patch: Record<string, string>) {
    const first = covers[0];
    if (first) updateCover(rowId(first), patch);
  }
  function updatePhoto(id: string | number, patch: Record<string, string>) {
    setList(
      galleryKey,
      photos.map((row) => (rowId(row) === id ? { ...row, ...patch } : row)),
    );
  }
  function changeDraft(patch: Partial<Draft>) {
    setDraft((value) => (value ? { ...value, ...patch } : value));
    setDirty(true);
    setMessage("");
  }
  async function uploadCover(file: File) {
    if (!division) return;
    setBusy(true);
    try {
      const src = await uploadCmsFile(file, "image", division.slug);
      const next = { id: crypto.randomUUID(), src, alt: file.name.replace(/\.[^.]+$/, ""), caption: "" };
      setList(galleryKey, [...photos, next]);
      setSelectedPhoto(String(next.id));
      setMessage("Sampul diunggah. Simpan section untuk menerapkannya.");
    } catch (error) {
      setFailed(true);
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function uploadPhotos(files: FileList | null) {
    if (!files || !division) return;
    setBusy(true);
    setFailed(false);
    try {
      const added: SectionListRow[] = [];
      for (const file of Array.from(files))
        added.push({
          id: crypto.randomUUID(),
          src: await uploadCmsFile(file, "image", division.slug),
          alt: file.name.replace(/\.[^.]+$/, ""),
          caption: "",
        });
      setList(galleryKey, [...photos, ...added]);
      setSelectedPhoto(String(added[0]?.id || ""));
      setMessage(
        `${added.length} foto ditambahkan. Simpan section untuk menerapkannya.`,
      );
    } catch (error) {
      setFailed(true);
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function makeCover(row: SectionListRow, slot = covers[0]) {
    if (!slot) return;
    updateCover(rowId(slot), { photoId: String(rowId(row)), src: String(row.src || ""), alt: String(row.alt || row.caption || "Sampul album"), title: String(row.alt || row.caption || "Sampul album") });
  }

  const textRows = content.sectionEdits.filter(
    (row) =>
      row.page === "about" && row.section === "divisions" && !row.ownerDivision,
  );
  const textValue = (source: string) =>
    textRows.find((row) => row.source === source)?.replacement || source;
  function changeText(source: string, label: string, replacement: string) {
    setContent((current) => {
      const existing = current.sectionEdits.find(
        (row) =>
          row.page === "about" &&
          row.section === "divisions" &&
          !row.ownerDivision &&
          row.source === source,
      );
      const next = {
        id: existing?.id || crypto.randomUUID(),
        page: "about" as const,
        section: "divisions",
        kind: "text" as const,
        source,
        label,
        replacement,
        published: true,
        ownerDivision: null,
      };
      return {
        ...current,
        sectionEdits: [
          ...current.sectionEdits.filter((row) => row.id !== existing?.id),
          next,
        ],
      };
    });
    setDirty(true);
  }
  async function save() {
    if (!division || !draft || busy) return;
    setBusy(true);
    setFailed(false);
    setMessage("");
    try {
      const profileResponse = await fetch(
        `/api/admin/divisions/${division.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...draft, revision: division.revision }),
        },
      );
      const savedDivision = await profileResponse.json();
      if (!profileResponse.ok)
        throw new Error(
          savedDivision.message || "Profil divisi belum tersimpan.",
        );
      const contentResponse = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...content, _base: base.current }),
      });
      const savedContent = await contentResponse.json();
      if (!contentResponse.ok)
        throw new Error(savedContent.message || "Album belum tersimpan.");
      setDivision(savedDivision);
      setDraft(draftOf(savedDivision));
      setContent(savedContent);
      base.current = savedContent;
      setDirty(false);
      setMessage("Perubahan tersimpan dan tampil di website.");
    } catch (error) {
      setFailed(true);
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useAdminWorkspace({
    dirty,
    busy,
    label: "Simpan section",
    disabled: !dirty,
    onSave: () => void save(),
  });

  const textEditor = mainSite ? (
    <section className="editor-panel about-division-text-editor">
      <h2>Tulisan Jaringan Mahameru Group</h2>
      <div className="editor-grid">
        <label className="editor-field">
          Teks pengantar
          <input
            value={textValue(centralCopy.eyebrow)}
            onChange={(event) =>
              changeText(
                centralCopy.eyebrow,
                "Teks pengantar",
                event.target.value,
              )
            }
          />
        </label>
        <label className="editor-field">
          Heading utama
          <input
            value={textValue(centralCopy.heading)}
            onChange={(event) =>
              changeText(
                centralCopy.heading,
                "Heading utama",
                event.target.value,
              )
            }
          />
        </label>
        <label className="editor-field">
          Lanjutan heading
          <input
            value={textValue(centralCopy.headingTail)}
            onChange={(event) =>
              changeText(
                centralCopy.headingTail,
                "Lanjutan heading",
                event.target.value,
              )
            }
          />
        </label>
      </div>
      <label className="editor-field">
        Paragraf
        <textarea
          rows={4}
          value={textValue(centralCopy.description)}
          onChange={(event) =>
            changeText(centralCopy.description, "Paragraf", event.target.value)
          }
        />
      </label>
    </section>
  ) : (
    <section className="editor-panel admin-inline-empty">
      <p>
        Lanjutkan ke Konten Divisi untuk mengubah profil dan galeri website ini.
        Tulisan pembuka hanya tersedia di Website utama.
      </p>
    </section>
  );
  const contentEditor =
    division && draft ? (
      <section className="editor-panel about-division-detail">
        <h2>{division.name}</h2>
        <div className="editor-grid">
          <label className="editor-field">
            Nama divisi
            <input
              value={draft.name}
              onChange={(event) => changeDraft({ name: event.target.value })}
            />
          </label>
          <label className="editor-field">
            Judul pengantar
            <input
              value={draft.title}
              onChange={(event) => changeDraft({ title: event.target.value })}
            />
          </label>
        </div>
        <label className="editor-field">
          Deskripsi divisi
          <textarea
            rows={4}
            value={draft.description}
            onChange={(event) =>
              changeDraft({ description: event.target.value })
            }
          />
        </label>
        <label className="editor-field">
          Misi divisi
          <textarea
            rows={3}
            value={draft.mission}
            onChange={(event) => changeDraft({ mission: event.target.value })}
          />
        </label>
        <div className="about-album-editor">
          {album && (
            <section className="editor-panel about-album-detail">
              <h3>{String(album.title || "Album")}</h3>
              <div className="editor-grid">
                <label className="editor-field">
                  Nama album
                  <input
                    value={String(album.title || "")}
                    onChange={(event) =>
                      updateAlbum(albumId, { title: event.target.value })
                    }
                  />
                </label>
                <label className="editor-field">
                  Deskripsi sampul
                  <input
                    value={String(album.alt || "")}
                    onChange={(event) =>
                      updateAlbum(albumId, { alt: event.target.value })
                    }
                  />
                </label>
              </div>
              <label className="editor-field cms-collage-cover">
                Sampul album
                {album.src && (
                  <img
                    className="cms-section-image"
                    src={String(album.src)}
                    alt={String(album.alt || album.title || "Sampul album")}
                  />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    event.currentTarget.value = "";
                    if (file) void uploadCover(file);
                  }}
                />
              </label>
              <div className="about-cover-slots">
                <h4>Tiga sampul yang tampil di mozaik</h4>
                <div className="editor-grid">
                  {covers.map((cover, index) => (
                    <label className="editor-field" key={String(rowId(cover))}>
                      Sampul {index + 1}
                      <select
                        value={String(cover.photoId || "")}
                        onChange={(event) => {
                          const selectedPhotoRow = photos.find((row) => String(rowId(row)) === event.target.value);
                          if (selectedPhotoRow) makeCover(selectedPhotoRow, cover);
                        }}
                      >
                        <option value="">Pilih foto</option>
                        {photos.map((row, photoIndex) => <option key={String(rowId(row))} value={String(rowId(row))}>{String(row.alt || row.caption || `Foto ${photoIndex + 1}`)}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
                {coverCount >= 3 && <p className="admin-field-help cover-limit-notice">Tiga sampul sudah dipilih. Ganti salah satu pilihan jika ingin memakai foto lain.</p>}
              </div>
              <AdminOrderList
                label={`Foto dalam ${String(album.title || "album")}`}
                items={photos.map((row, index) => ({
                  id: String(rowId(row)),
                  title: String(row.caption || row.alt || `Foto ${index + 1}`),
                  image: String(row.src || ""),
                }))}
                selected={selectedPhoto || undefined}
                onSelect={setSelectedPhoto}
                onMove={(from, to) =>
                  setList(
                    photoKey,
                    moveBefore(
                      photos.map((row) => ({ ...row, id: String(rowId(row)) })),
                      from,
                      to,
                    ),
                  )
                }
              >
                <label className="admin-primary cms-file-button">
                  + Tambah foto
                  <input
                    hidden
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      void uploadPhotos(event.currentTarget.files);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </AdminOrderList>
              {photo && (
                <div className="cms-collage-photo-detail">
                  <div className="cms-field-heading">
                    <h4>Rincian foto</h4>
                    <button
                      type="button"
                      className="admin-danger"
                      onClick={() => {
                        setList(
                          photoKey,
                          photos.filter((row) => rowId(row) !== rowId(photo)),
                        );
                        setSelectedPhoto("");
                      }}
                    >
                      Hapus foto
                    </button>
                  </div>
                  {photo.src && (
                    <img
                      className="cms-section-image"
                      src={String(photo.src)}
                      alt={String(photo.alt || "Foto album")}
                    />
                  )}
                  <div className="editor-grid">
                    <label className="editor-field">
                      Deskripsi gambar
                      <input
                        value={String(photo.alt || "")}
                        onChange={(event) =>
                          updatePhoto(rowId(photo), { alt: event.target.value })
                        }
                      />
                    </label>
                    <label className="editor-field">
                      Keterangan
                      <input
                        value={String(photo.caption || "")}
                        onChange={(event) =>
                          updatePhoto(rowId(photo), { caption: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="editor-checkbox gallery-cover-choice">
                    <input
                      type="checkbox"
                      checked={covers.some((row) => String(row.photoId || "") === String(rowId(photo)))}
                      onChange={() => {
                        const selectedSlot = covers.find((row) => String(row.photoId || "") === String(rowId(photo)));
                        if (selectedSlot) updateCover(rowId(selectedSlot), { photoId: "", src: "", alt: "", title: "" });
                        else if (coverCount >= 3) setMessage("Tiga sampul sudah dipilih. Ganti salah satu pilihan terlebih dahulu.");
                        else {
                          const emptySlot = covers.find((row) => !String(row.photoId || "").trim());
                          if (emptySlot) makeCover(photo, emptySlot);
                        }
                      }}
                    />
                    Jadikan sampul album
                  </label>
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    ) : (
      <section className="editor-panel admin-inline-empty">
        <p>Divisi untuk website ini belum ditemukan.</p>
      </section>
    );
  const mainDivisionPicker = mainSite ? (
    <section className="editor-panel about-division-directory">
      <div className="editor-list-heading"><h2>Konten divisi di halaman utama</h2></div>
      <p className="admin-field-help">Pilih divisi untuk mengubah profil dan galeri yang tampil di halaman utama serta website divisinya.</p>
      <AdminOrderList
        label="Daftar divisi"
        items={initialDivisions.map((item, index) => ({ id: item.slug, title: item.name, image: item.logo, detail: item.area || `Divisi ${index + 1}` }))}
        selected={division?.slug}
        onMove={() => {}}
        onSelect={(id) => {
          const next = initialDivisions.find((item) => item.slug === id);
          if (!next) return;
          setDivision(next);
          setDraft(draftOf(next));
          setSelectedPhoto("");
          setMessage("");
        }}
      />
    </section>
  ) : null;
  return (
    <div className="about-divisions-workspace">
      <AdminViewTabs
        value={mode}
        onChange={setMode}
        label="Jenis isi section"
        options={[
          { value: "all", label: "Semua" },
          { value: "content", label: "Gambar" },
          { value: "text", label: "Tulisan" },
        ]}
      />
      {message && (
        <p
          className={`editor-notice ${failed ? "error" : "success"}`}
          role={failed ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      {mode === "text" && textEditor}
      {(mode === "all" || mode === "content") && <>{mainDivisionPicker}{contentEditor}</>}
    </div>
  );
}
