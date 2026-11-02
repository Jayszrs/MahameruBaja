import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { websiteWorkspaces } from "../../../../../src/data/adminWebsite";
import {
  readAdminContent,
  readAdminArticles,
  requireAdminWorkspace,
} from "../../../../../src/lib/adminWorkspaceData";
import { articleWebsiteTextChoices } from "../../../../../src/lib/articleWebsiteTextCatalog";
import SectionContentEditor from "../../../../../src/components/SectionContentEditor";
import { publicSectionId } from "../../../../../src/data/adminWebsite";
import WebsiteTextEditor from "../../../../../src/components/WebsiteTextEditor";
import HeroEditor from "../../../../../src/components/HeroEditor";
import PromotionEditor from "../../../../../src/components/PromotionEditor";
import Divisions from "../../divisi/page";
import Gallery from "../../galeri/page";
import InventoryEditor from "../../../../../src/components/InventoryEditor";
import Articles from "../../artikel/page";
import ContentEditor from "../../../../../src/components/ContentEditor";
import SocialEditor from "../../../../../src/components/SocialEditor";
import Partners from "../../mitra/page";
import ArticleIntro from "../../../../../src/components/ArticleIntroEditor";
import AppearanceEditor from "../../../../../src/components/AppearanceEditor";
import GalleryEditor from "../../../../../src/components/GalleryEditor";
import FooterDivisionsEditor from "../../../../../src/components/FooterDivisionsEditor";
import { editableDivisions } from "../../../../../src/lib/divisionStore";
import { requireAdminData } from "../../../../../src/lib/adminWorkspaceData";
import HomeWebsitePicker from "../../../../../src/components/HomeWebsitePicker";
import DivisionFaqEditor from "../../../../../src/components/DivisionFaqEditor";
import HomeNetworkEditor from "../../../../../src/components/HomeNetworkEditor";
import AboutDivisionsWorkspace from "../../../../../src/components/AboutDivisionsWorkspace";
import AboutEngineeringWorkspace from "../../../../../src/components/AboutEngineeringWorkspace";
import VisionMissionWorkspace from "../../../../../src/components/VisionMissionWorkspace";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ section?: string; mode?: string; site?: string }>;
}) {
  const [{ page }, query] = await Promise.all([params, searchParams]);
  const workspace = websiteWorkspaces.find((row) => row.id === page);
  if (!workspace) notFound();
  const requestedSection = query.section === "needs" ? "header" : query.section;
  const selected =
    workspace.sections.find((row) => row.id === requestedSection) ||
    workspace.sections[0];
  const copy =
    page === "beranda" && selected.id === "hero"
      ? false
      : ["copy", "section"].includes(selected.editor) || query.mode === "copy";
  const identity =
    page === "footer" ||
    page === "produk" ||
    page === "beranda" ||
    page === "tentang"
      ? await requireAdminData()
      : null;
  const [content, articles, footerDivisions, homeDivisions] = await Promise.all(
    [
      readAdminContent(),
      readAdminArticles(),
      page === "footer" && identity
        ? editableDivisions(identity)
        : Promise.resolve([]),
      (page === "beranda" || page === "tentang") && identity
        ? editableDivisions(identity).then((rows) =>
            page === "tentang"
              ? rows
              : rows.filter((row) => row.status === "active"),
          )
        : Promise.resolve([]),
    ],
  );
  const homeSite =
    page === "beranda" || page === "tentang"
      ? identity?.division ||
        homeDivisions.find((row) => row.slug === query.site)?.slug ||
        null
      : null;
  const scopedHomeSections = new Set([
    "intro",
    "laser",
    "order",
    "location",
    "callout",
    "offerings",
    "faq",
    "quotes",
    "gallery",
    "network",
  ]);
  const homeSiteName = homeSite
    ? homeDivisions.find((row) => row.slug === homeSite)?.name || homeSite
    : "Website utama · Mahameru Baja";
  const homeUrl = homeSite ? `/unit/${homeSite}` : "/";
  const aboutUrl =
    page === "tentang" && homeSite
      ? `/unit/${homeSite}/tentang`
      : workspace.url;
  const homeProfileHref = homeSite
    ? `/admin/divisi?division=${encodeURIComponent(homeSite)}&tab=profile`
    : "/admin/divisi";
  const galleryTextPage =
    page === "beranda" ? "home" : page === "galeri" ? "gallery" : "services";
  const editors: Record<string, ReactNode> = {
    hero: <HeroEditor initialContent={content} embedded />,
    promotions: <PromotionEditor initialContent={content} embedded />,
    divisions:
      page === "tentang" && selected.id === "divisions" ? (
        <AboutDivisionsWorkspace initialContent={content} initialDivisions={homeDivisions} initialSite={homeSite || ""} />
      ) : selected.id === "network" ? (
        <HomeNetworkEditor
          initialContent={content}
          initialDivisions={homeDivisions}
          ownerDivision={homeSite}
          url={homeUrl}
        />
      ) : selected.id === "faq" ? (
        homeSite ? (
          <DivisionFaqEditor
            initialDivision={homeDivisions.find(
              (row) => row.slug === homeSite,
            )!}
          />
        ) : (
          <section className="editor-panel">
            <h3>Pilih website unit</h3>
            <p>
              Pilih website di atas untuk mengedit heading, pertanyaan, dan
              jawaban unit tersebut.
            </p>
          </section>
        )
      ) : (
        <Divisions searchParams={Promise.resolve({})} />
      ),
    gallery: (
      <GalleryEditor
        initialContent={content}
        ownerDivision={page === "beranda" ? homeSite : null}
        textPage={galleryTextPage}
        textUrl={page === "beranda" ? homeUrl : workspace.url}
      />
    ),
    inventory: (
      <InventoryEditor
        initialItems={content.inventory}
        division={identity?.division || null}
        hideActions
      />
    ),
    articles: <Articles />,
    contacts: (
      <ContentEditor initialContent={content} lockedTab="contacts" embedded />
    ),
    social: (
      <SocialEditor
        initialContent={content}
        lockedTab={selected.tab as "accounts" | "posts" | undefined}
        embedded
      />
    ),
    appearance: (
      <AppearanceEditor
        key={`${selected.tab || selected.id}-${homeSite || "main"}`}
        initialContent={content}
        servicePage={page !== "beranda" && selected.id !== "header"}
        initialSection={
          selected.tab as
            | "memberships"
            | "servicePaths"
            | "services"
            | "serviceWorkflow"
            | undefined
        }
        initialOwner={page === "beranda" ? homeSite : null}
        hideOwnerSelector={page === "beranda"}
        headerOnly={selected.id === "header"}
        embedded
      />
    ),
    footerDivisions: (
      <FooterDivisionsEditor
        initialDivisions={footerDivisions}
        initialContent={content}
      />
    ),
    partners: <Partners />,
    articleIntro: <ArticleIntro initialContent={content} />,
    reviews: <ContentEditor initialContent={content} lockedTab="reviews" embedded initialReviewScope={homeSite || "main"} />,
  };
  const href = (id: string, tab?: string, mode?: string) =>
    `/admin/website/${page}?section=${id}${tab ? `&tab=${tab}` : ""}${mode ? `&mode=${mode}` : ""}${page === "beranda" && homeSite ? `&site=${homeSite}` : ""}`;
  const needsUnitProfile = page === "beranda" && selected.id === "offerings" && selected.editor === "divisions";
  return (
    <div
      className={`admin-website-workspace${selected.editor === "social" || selected.editor === "contacts" || selected.editor === "articles" || selected.editor === "appearance" ? " is-social-editor" : ""}${page === "jasa" ? " has-section-guidance" : ""}`}
    >
      <header className="admin-page-heading">
        <div>
          <h1>{workspace.label}</h1>
        </div>
      </header>
      <nav
        className="admin-section-tabs"
        aria-label={`Bagian ${workspace.label}`}
      >
        {workspace.sections.map((row, index) => (
          <Link
            href={href(row.id, row.tab)}
            aria-current={row.id === selected.id ? "page" : undefined}
            key={row.id}
          >
            {index + 1}. {row.label}
          </Link>
        ))}
      </nav>
      {selected.id !== "header" && (
        <header className="admin-section-heading">
          <div>
            {((page === "beranda" && scopedHomeSections.has(selected.id)) ||
              (page === "tentang" && selected.id !== "divisions")) && (
              <HomeWebsitePicker
                value={homeSite || ""}
                divisions={homeDivisions}
                disabled={Boolean(identity?.division)}
              />
            )}
          </div>
          <a
            href={`${page === "beranda" ? homeUrl : workspace.url}?cms-preview=1${selected.anchor ? `#${selected.anchor}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lihat di website
          </a>
        </header>
      )}
      {![
        "copy",
        "section",
        "articleIntro",
        "footerDivisions",
        "footerBackground",
        "partners",
        "gallery",
      ].includes(selected.editor) &&
        !(
          page === "jasa" &&
          (selected.id === "albums" ||
            selected.id === "portfolio" ||
            selected.id === "process")
        ) &&
        !(
          page === "beranda" &&
          [
            "header",
            "hero",
            "promo",
            "order",
            "network",
            "offerings",
            "faq",
            "quotes",
            "needs",
          ].includes(selected.id)
        ) &&
        !(page === "tentang" && ["divisions", "engineering", "vision"].includes(selected.id)) && (
          <nav className="admin-view-tabs" aria-label="Jenis pengeditan">
            <Link
              href={href(selected.id, selected.tab)}
              aria-current={!copy ? "page" : undefined}
            >
              {page === "produk" && selected.id === "catalog"
                ? "Produk & stok"
                : "Kelola konten"}
            </Link>
            <Link
              href={href(selected.id, selected.tab, "copy")}
              aria-current={copy ? "page" : undefined}
            >
              {page === "produk" && selected.id === "catalog"
                ? "Kategori filter"
                : "Gambar, tulisan & tautan section"}
            </Link>
          </nav>
        )}
      <div
        key={`${page}-${selected.id}-${copy}-${homeSite || "main"}`}
        className="admin-section-editor"
      >
        {needsUnitProfile ? (
          <section className="editor-panel">
            <h3>
              {selected.id === "offerings"
                ? "Pilihan layanan di beranda unit"
                : "Pertanyaan yang sering diajukan unit"}
            </h3>
            {homeSite ? (
              <>
                <p>
                  Konten ini dikelola di profil unit agar sumber layanan dan FAQ
                  tetap satu. Website yang dipilih:{" "}
                  <strong>{homeSiteName}</strong>.
                </p>
                <a className="admin-primary" href={homeProfileHref}>
                  Buka Profil & layanan unit ↗
                </a>
              </>
            ) : (
              <p>
                Pilih website unit di atas untuk membuka editor layanan atau
                pertanyaan yang tampil pada beranda unit. Website utama tidak
                memiliki section ini.
              </p>
            )}
          </section>
        ) : page === "beranda" && selected.id === "laser" ? (
          <AppearanceEditor
            initialContent={content}
            homeFeature
            initialSection="homeFeatureSteps"
            initialOwner={homeSite}
            hideOwnerSelector
            saveLabel="Simpan section"
            embedded
          />
        ) : page === "beranda" &&
          ["order", "quotes", "needs"].includes(selected.id) ? (
          <AppearanceEditor
            initialContent={content}
            initialSection={
              selected.id === "order"
                ? "orderSteps"
                : selected.id === "quotes"
                  ? "quotes"
                  : "needs"
            }
            initialOwner={homeSite}
            hideOwnerSelector
            saveLabel="Simpan section"
            embedded
          />
        ) : page === "tentang" && selected.id === "vision" ? (
          <VisionMissionWorkspace initialContent={content} initialDivision={homeDivisions.find(row => row.slug === homeSite)} initialSite={homeSite || ""} />
        ) : page === "tentang" && selected.id === "engineering" ? (
          <AboutEngineeringWorkspace initialContent={content} initialDivisions={homeDivisions} initialSite={homeSite || ""} />
        ) : page === "footer" && selected.id === "copy" ? (
          <SectionContentEditor
            initialContent={content}
            page="all"
            section="footer-copy"
            url={workspace.url}
            hideImages
            hideActions
            hideGuidance
          />
        ) : page === "footer" && selected.id === "divisions" ? (
          <FooterDivisionsEditor
            initialDivisions={footerDivisions}
            initialContent={content}
          />
        ) : page === "footer" && selected.id === "background" ? (
          <AppearanceEditor
            initialContent={content}
            footerPage
            initialSection="identity"
          />
        ) : page === "jasa" && selected.id === "faq" ? (
          <div className="jasa-faq-workspace">
            <SectionContentEditor
              initialContent={content}
              page="services"
              section="faq"
              url={workspace.url}
              hideImages
              hideGuidance
              hiddenSources={["Pertanyaan laser cutting & bending."]}
            />
          </div>
        ) : page === "jasa" && selected.id === "process" ? (
          <div className="jasa-process-workspace">
            <SectionContentEditor
              initialContent={content}
              page="services"
              section="process"
              url={workspace.url}
              hideGuidance
            />
            <AppearanceEditor
              initialContent={content}
              servicePage
              initialSection="serviceWorkflow"
            />
          </div>
        ) : page === "jasa" && selected.id === "technical" ? (
          <div className="jasa-scope-workspace">
            <SectionContentEditor
              initialContent={content}
              page="services"
              section="technical"
              url={workspace.url}
              hideActions
              hideGuidance
            />
            <AppearanceEditor
              initialContent={content}
              servicePage
              initialSection="services"
              hideServiceActions
            />
          </div>
        ) : page === "jasa" &&
          (selected.id === "albums" || selected.id === "portfolio") ? (
          <div className="jasa-album-workspace">
            <SectionContentEditor
              initialContent={content}
              page="services"
              section={selected.id}
              url={workspace.url}
              hideActions
              hideGuidance
            />
            <GalleryEditor
              key={selected.id}
              initialContent={content}
              initialKind={selected.id === "albums" ? "design" : "portfolio"}
              workspaceSaveLabel="Simpan section"
            />
          </div>
        ) : copy && selected.id === "copy" && page === "artikel" ? (
          <WebsiteTextEditor
            initialContent={content}
            articleChoices={articleWebsiteTextChoices(articles)}
            initialPage="articles"
            embedded
          />
        ) : copy && page === "produk" && selected.id === "catalog" ? (
          <SectionContentEditor
            initialContent={content}
            page={workspace.textPage}
            section={publicSectionId(workspace, selected)}
            url={workspace.url}
            listOnly
            hideActions
            hideGuidance
          />
        ) : copy ? (
          <SectionContentEditor
            initialContent={content}
            page={workspace.textPage}
            section={publicSectionId(workspace, selected)}
            url={
              page === "beranda"
                ? homeUrl
                : page === "tentang"
                  ? aboutUrl
                  : workspace.url
            }
            ownerDivision={
              page === "beranda" || page === "tentang" ? homeSite : null
            }
            hideImages={page === "jasa" && selected.id === "guide"}
            hideGuidance
            preserveOrder={
              (page === "jasa" && selected.id === "opening") ||
              (page === "tentang" && selected.id === "opening")
            }
            hiddenSources={
              page === "produk" && selected.id === "opening"
                ? ["Beranda", "Produk", "/"]
                : page === "beranda" && selected.id === "location"
                  ? [
                      "Buka Google Maps",
                      "Kunjungi kami",
                      "Petunjuk arah",
                      "Area layanan",
                    ]
                  : page === "beranda" && selected.id === "callout"
                    ? ["Minta penawaran", "/minta-penawaran"]
                    : []
            }
            hideTabs={
              (page === "beranda" && selected.id === "location") ||
              (page === "tentang" && selected.id === "vision")
            }
            hideEmbedInput={page === "beranda" && selected.id === "location"}
            collapseParagraphs={page === "beranda" && selected.id === "callout"}
            mergeHeadingFields={page === "tentang" && selected.id === "opening"}
            hideTextFields={page === "tentang" && selected.id === "opening"}
            productOpening={page === "produk" && selected.id === "opening"}
            numberingOffset={
              page === "produk" && selected.id === "opening" ? 2 : 0
            }
            hideGenericText={page === "beranda" && selected.id === "intro"}
            hideActionFields={
              (page === "beranda" &&
                ["intro", "location"].includes(selected.id)) ||
              (page === "tentang" &&
                ["opening", "vision"].includes(selected.id))
            }
            hideActions={
              page === "produk" ||
              (page === "tentang" && selected.id === "vision") ||
              (page === "beranda" &&
                ["intro", "location", "callout"].includes(selected.id))
            }
          />
        ) : (
          editors[selected.editor]
        )}
      </div>
    </div>
  );
}
