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
import PartnerLogoEditor from "../../../../../src/components/PartnerLogoEditor";
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
import JasaTechnicalWorkspace from "../../../../../src/components/JasaTechnicalWorkspace";
import MainWebsiteGalleryEditor from "../../../../../src/components/MainWebsiteGalleryEditor";
import UnitGalleryPhotosEditor from "../../../../../src/components/UnitGalleryPhotosEditor";
import DivisionLocationEditor from "../../../../../src/components/DivisionLocationEditor";
import { collectWebsitePhotos } from "../../../../../src/data/websitePhotos";
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
  const siteScopedPage = ["beranda", "tentang", "produk", "kontak", "jasa", "galeri"].includes(page);
  const identity =
    page === "footer" || siteScopedPage ? await requireAdminData() : null;
  const [content, articles, footerDivisions, homeDivisions] = await Promise.all(
    [
      readAdminContent(),
      readAdminArticles(),
      page === "footer" && identity
        ? editableDivisions(identity)
        : Promise.resolve([]),
      siteScopedPage && identity
        ? editableDivisions(identity)
        : Promise.resolve([]),
    ],
  );
  const homeSite = siteScopedPage
    ? identity?.division ||
      homeDivisions.find((row) => row.slug === query.site)?.slug ||
      null
    : null;
  const scopedSections =
    page === "jasa"
      ? homeSite
        ? workspace.sections.filter((row) => row.shared === "division")
        : workspace.sections.filter((row) => row.id !== "unit-cta")
      : page === "galeri"
        ? homeSite
          ? workspace.sections.filter((row) => row.shared === "division")
          : workspace.sections.filter((row) => row.id !== "unit-photos")
      : page === "beranda"
        ? workspace.sections.filter((row) => row.id !== "upvc" || ["retail-tambun", "retail-cibitung", "trading-proyek"].includes(homeSite || ""))
      : page === "tentang" && homeSite
        ? workspace.sections.filter((row) => !["reviews", "clients", "suppliers"].includes(row.id))
      : page === "kontak" && homeSite
        ? workspace.sections.filter((row) => row.id !== "form")
      : workspace.sections;
  const selected =
    scopedSections.find((row) => row.id === requestedSection) ||
    scopedSections[0];
  const copy =
    page === "galeri"
      ? ["opening", "project-opening", "cta"].includes(selected.id)
      : page === "beranda" && selected.id === "hero"
        ? false
        : (["copy", "section"].includes(selected.editor) ||
            (query.mode === "copy" && selected.editor !== "contacts"));
  const scopedHomeSections = new Set([
    "intro",
    "upvc",
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
  const productUrl = homeSite ? `/unit/${homeSite}/produk` : workspace.url;
  const aboutUrl =
    page === "tentang" && homeSite
      ? `/unit/${homeSite}/tentang`
      : workspace.url;
  const kontakUrl =
    page === "kontak" && homeSite
      ? `/unit/${homeSite}/kontak`
      : workspace.url;
  const jasaUrl =
    page === "jasa" && homeSite
      ? `/unit/${homeSite}/layanan`
      : workspace.url;
  const galleryUrl = homeSite ? `/unit/${homeSite}/galeri` : page === "galeri" && ["project-opening","projects","cta"].includes(selected.id) ? "/proyek" : "/galeri";
  const mainGalleryPhotos = page === "galeri" && !homeSite
    ? collectWebsitePhotos(content,homeDivisions.filter(row=>row.status==="active"),articles.filter(article=>article.status==="published")).filter(photo=>!photo.categories.some(category=>["Logo & identitas","Tim","Promosi"].includes(category)))
    : [];
  const mainGalleryCategories = [...new Set(mainGalleryPhotos.flatMap(photo=>photo.categories))];
  const unitServiceCtaLinks = homeSite
    ? [
        { value: `/unit/${homeSite}`, label: `${homeSiteName} · Beranda` },
        { value: `/unit/${homeSite}/tentang`, label: `${homeSiteName} · Tentang Kami` },
        { value: `/unit/${homeSite}/produk`, label: `${homeSiteName} · Produk` },
        { value: `/unit/${homeSite}/layanan`, label: `${homeSiteName} · Layanan` },
        { value: `/unit/${homeSite}/galeri`, label: `${homeSiteName} · Galeri` },
        { value: `/unit/${homeSite}/kontak`, label: `${homeSiteName} · Kontak` },
      ]
    : undefined;
  const previewAnchor=page==="jasa"&&homeSite&&selected.id==="services"?"unit-service-list":page==="galeri"&&homeSite&&selected.id==="opening"?"galeri-pembuka":page==="galeri"&&homeSite&&selected.id==="cta"?"unit-gallery-cta":selected.anchor;
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
    gallery: page === "galeri" && selected.id === "albums" && !homeSite ? (
      <MainWebsiteGalleryEditor initialContent={content} initialPhotos={mainGalleryPhotos} initialCategories={mainGalleryCategories} />
    ) : (
      <GalleryEditor
        key={`${page}-${homeSite || "main"}`}
        initialContent={content}
        ownerDivision={page === "beranda" || page === "galeri" ? homeSite : null}
        initialKind={page === "galeri" && selected.id === "projects" ? "portfolio" : undefined}
        excludeKinds={page === "galeri" && homeSite ? ["design"] : undefined}
        mainCategories={false}
        textPage={galleryTextPage}
        textUrl={page === "beranda" ? homeUrl : page === "galeri" ? galleryUrl : workspace.url}
        textSection="albums"
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
    partners: <PartnerLogoEditor initialContent={content} initialTab={selected.tab === "clients" ? "clients" : "suppliers"} lockedTab={selected.tab === "clients" ? "clients" : "suppliers"} />,
    articleIntro: <ArticleIntro initialContent={content} />,
    reviews: <ContentEditor initialContent={content} lockedTab="reviews" embedded initialReviewScope={page === "jasa" ? "laser-cutting" : homeSite || "main"} hideReviewScopePicker={selected.id === "reviews"} />,
  };
  const href = (id: string, tab?: string, mode?: string) =>
    `/admin/website/${page}?section=${id}${tab ? `&tab=${tab}` : ""}${mode ? `&mode=${mode}` : ""}${siteScopedPage && homeSite ? `&site=${homeSite}` : ""}`;
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
      {(page === "jasa" || page === "galeri") && (
        <header className={`admin-section-heading ${page}-site-picker-heading`}>
          <div>
            <HomeWebsitePicker
              value={homeSite || ""}
              divisions={homeDivisions}
              disabled={Boolean(identity?.division)}
            />
          </div>
        </header>
      )}
      <nav
        className="admin-section-tabs"
        aria-label={`Bagian ${workspace.label}`}
      >
        {scopedSections.map((row, index) => (
          <Link
            href={href(row.id, row.tab)}
            aria-current={row.id === selected.id ? "page" : undefined}
            key={row.id}
          >
            {index + 1}. {page === "jasa" && row.id === "services" && homeSite ? "Layanan unit" : page === "galeri" && row.id === "albums" && homeSite ? "Album proyek" : page === "galeri" && row.id === "albums" ? "Kategori & foto" : row.label}
          </Link>
        ))}
      </nav>
      {selected.id !== "header" && (
        <header className="admin-section-heading">
          <div>
            {((page === "beranda" && scopedHomeSections.has(selected.id)) ||
              (page === "tentang" && selected.id !== "divisions") ||
              (page === "produk" && selected.id === "opening") ||
              (page === "kontak" && ["opening", "store", "form"].includes(selected.id))) && (
              <HomeWebsitePicker
                value={homeSite || ""}
                divisions={homeDivisions}
                disabled={Boolean(identity?.division)}
              />
            )}
          </div>
          <a
            href={`${page === "beranda" ? homeUrl : page === "produk" ? productUrl : page === "tentang" ? aboutUrl : page === "kontak" ? kontakUrl : page === "jasa" ? jasaUrl : page === "galeri" ? galleryUrl : workspace.url}?cms-preview=1${previewAnchor ? `#${previewAnchor}` : ""}`}
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
        "contacts",
        "reviews",
      ].includes(selected.editor) &&
        !(
          page === "jasa" &&
          (selected.id === "albums" ||
            selected.id === "portfolio" ||
            selected.id === "process" ||
            selected.id === "technical" ||
            selected.id === "services" ||
            selected.id === "request" ||
            selected.id === "contact")
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
        !(page === "tentang" && ["divisions", "engineering", "vision"].includes(selected.id)) &&
        !(page === "galeri" && selected.editor === "copy") && (
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
            {homeDivisions.find(row => row.slug === "laser-cutting") ? <DivisionFaqEditor initialDivision={homeDivisions.find(row => row.slug === "laser-cutting")!} /> : <SectionContentEditor initialContent={content} page="services" section="faq" url={jasaUrl} hideImages hideGuidance />}
          </div>
        ) : page === "jasa" && selected.id === "process" ? (
          <div className="jasa-process-workspace">
            <SectionContentEditor
              initialContent={content}
              page="services"
              section="process"
              url={jasaUrl}
              ownerDivision={homeSite}
              hideGuidance
            />
            <AppearanceEditor
              key={`serviceWorkflow-${homeSite || "main"}`}
              initialContent={content}
              servicePage
              initialSection="serviceWorkflow"
              initialOwner={homeSite}
              hideOwnerSelector
            />
          </div>
        ) : page === "jasa" && selected.id === "technical" ? (
          <JasaTechnicalWorkspace initialContent={content} url={jasaUrl} ownerDivision={homeSite} />
        ) : page === "jasa" && selected.id === "guide" ? (
          <SectionContentEditor initialContent={content} page="services" section="guide" url={jasaUrl} hideImages hideGuidance hideLists />
        ) : page === "jasa" && selected.id === "reviews" ? (
          <div className="jasa-reviews-workspace">
            <SectionContentEditor initialContent={content} page="services" section="reviews" url={jasaUrl} hideImages hideActions hideGuidance />
            <ContentEditor initialContent={content} lockedTab="reviews" embedded initialReviewScope="laser-cutting" hideReviewIntro hideReviewScopePicker />
          </div>
        ) : page === "jasa" && selected.id === "contact" ? (
          <div className="jasa-contact-workspace">
            <SectionContentEditor initialContent={content} page="services" section="contact" url={jasaUrl} ownerDivision={homeSite} hideImages hideGuidance />
            <section className="editor-panel">
              <h3>Alamat dan kontak tim</h3>
              <p>Nama divisi, alamat, peta, dan nomor sales mengikuti data profil divisi.</p>
              <a className="admin-secondary" href="/admin/divisi?division=laser-cutting&tab=profile">Kelola profil Laser Cutting &amp; Bending ↗</a>
            </section>
          </div>
        ) : page === "kontak" && selected.id === "store" && homeSite ? (
          <DivisionLocationEditor key={`location-${homeSite}`} initialDivision={homeDivisions.find(row => row.slug === homeSite)!} />
        ) : page === "jasa" && selected.id === "services" ? (
          <div className="jasa-scope-workspace">
            {!homeSite && <SectionContentEditor initialContent={content} page="services" section="services" url={jasaUrl} hideImages hideActions hideGuidance />}
            <AppearanceEditor
              key={`${homeSite ? "unit-services" : "servicePaths"}-${homeSite || "main"}`}
              initialContent={content}
              servicePage
              initialSection={homeSite ? "services" : "servicePaths"}
              initialOwner={homeSite}
              hideOwnerSelector
            />
          </div>
        ) : page === "jasa" &&
          (selected.id === "albums" || selected.id === "portfolio") ? (
          <div className="jasa-album-workspace">
            <SectionContentEditor
              initialContent={content}
              page="services"
              section={selected.id}
              url={jasaUrl}
              ownerDivision={homeSite}
              hideActions
              hideGuidance
            />
            <GalleryEditor
              key={`${selected.id}-${homeSite || "main"}`}
              initialContent={content}
              initialKind={selected.id === "albums" ? "design" : "portfolio"}
              ownerDivision={homeSite}
              allowedDivisions={homeSite ? undefined : ["laser-cutting", "fabrikasi-erection"]}
              defaultDivision={homeSite || "laser-cutting"}
              textPage="services"
              textUrl={jasaUrl}
              textSection={selected.id}
              workspaceSaveLabel="Simpan section"
            />
          </div>
        ) : page === "galeri" && selected.id === "unit-photos" && homeSite ? (
          <UnitGalleryPhotosEditor
            key={`unit-gallery-${homeSite}`}
            initialContent={content}
            ownerDivision={homeSite}
            initialPhotos={homeDivisions.find(row => row.slug === homeSite)?.images || []}
          />
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
            linkOptions={page === "jasa" && selected.id === "unit-cta" ? unitServiceCtaLinks : undefined}
            url={
              page === "beranda"
                ? homeUrl
                : page === "tentang"
                  ? aboutUrl
                  : page === "produk"
                    ? productUrl
                  : page === "kontak"
                    ? kontakUrl
                      : page === "jasa"
                      ? jasaUrl
                        : page === "galeri"
                          ? galleryUrl
                      : workspace.url
            }
            ownerDivision={
              page === "beranda" || page === "tentang" || page === "produk" || page === "kontak" || page === "jasa" || page === "galeri" ? homeSite : null
            }
            hideImages={(page === "jasa" && selected.id === "guide") || (page === "galeri" && selected.id === "opening" && !homeSite)}
            hideLists={page === "galeri" && selected.id === "opening" && !homeSite}
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
            numberingOffset={0}
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
