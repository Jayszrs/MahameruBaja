"use client";

import { useState } from "react";
import AdminViewTabs from "./AdminViewTabs";
import AppearanceEditor from "./AppearanceEditor";
import SectionContentEditor from "./SectionContentEditor";
import type { SiteContent } from "../data/siteContent";

type View = "all" | "image" | "text";

export default function JasaTechnicalWorkspace({ initialContent, url, ownerDivision }: { initialContent: SiteContent; url: string; ownerDivision: string | null }) {
  const [view, setView] = useState<View>("all");

  return <div className="jasa-scope-workspace">
    <AdminViewTabs label="Jenis isi section" value={view} onChange={setView} options={[
      { value: "all", label: "Semua" },
      { value: "image", label: "Gambar" },
      { value: "text", label: "Tulisan" },
    ]} />
    <div className={`jasa-scope-copy${view === "image" ? " is-hidden" : ""}`} aria-hidden={view === "image"}>
      <SectionContentEditor
        initialContent={initialContent}
        page="services"
        section="technical"
        url={url}
        ownerDivision={ownerDivision}
        hideActions
        hideGuidance
        hideTabs
        viewFilter={view === "image" ? "image" : "text"}
      />
    </div>
    <AppearanceEditor
      key={`services-${ownerDivision || "main"}`}
      initialContent={initialContent}
      servicePage
      initialSection="services"
      initialOwner={ownerDivision}
      hideOwnerSelector
      hideServiceActions
      contentFilter={view}
    />
  </div>;
}
