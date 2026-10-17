# CMS text, shared posters and review recovery

Date: 17 October 2026. This follow-up supersedes the Git connection and remaining-work status in `client-experience-audit-2026-10-17.md` where they conflict.

## Changes and purpose

- Direct text editing on `/admin/teks`, with website/page/search filters and 731 unique catalog phrases. The catalog includes the supplied fabrication hero title, accent and description. Current division profile/service/hero text also supplies choices. Custom phrases remain supported. Structured records keep their dedicated editors.
- Main and five division administrators retain separate text ownership. Editing copy does not rewrite URLs, form values or handlers. Conflicting saves preserve the local draft.
- The CMS uses the existing red, white and charcoal industrial identity with Archivo/Manrope. ENERGY 2 / RHYTHM 2 / MOTION 2. A narrower division picker and optional hidden menu give the actual editing form more space, rather than adding decorative dashboard content. Hidden navigation is inert. Existing save, discard and mobile navigation remain.
- Review controls distinguish Google's total count from the actual saved quotations. Snapshot restoration adds only missing verified quotations, retaining existing edited/unpublished records. Visitors can expand beyond the first eight available published quotations.
- The four original popup posters now default to banner placement too. These are the same promotion records, not copied banners. New draft posters default to both placements, with independent CMS switches. Portrait artwork uses `contain` and no hover zoom to avoid clipping the supplied poster text.

## Changes already applied to live CMS data

Target: `jaelanisurya8-7843/mahamerubaja`, `https://mahamerubaja.vercel.app`.

1. Restored 34 missing main-site quotations from the old public deployment at `https://mahameru-baja-preview.vercel.app`. It exposed 35 source quotations; 36 are now saved because an additional existing quotation was preserved. Main summary remains 4.5 / 125, with source snapshot date 6 October 2026. This is not a claim that 125 quotation texts were recovered.
2. Garuda already had its three available source quotations and 5.0 / 43 summary dated 10 October. They were verified and preserved, not replaced or fabricated.
3. Enabled `showInBanner` on the four published `client-poster-*` records. Total promotion records remained 12. Status, audience, dates, image, text and action targets were unchanged.

Each mutation used a fresh authenticated CMS read, a private ignored local backup, the deployed revision-protected API and exact readback comparisons. Unrelated collections were checked unchanged. The public rendered HTML confirmed the restored review collection and all four banner actions. Sessions were logged out; credentials/cookies are not in this report.

Git is now connected to `Jayszrs/MahameruBaja`, main branch, frontend root. Commits continued concurrently during the work. No UI commit, push or deployment was initiated by this agent; live CMS data changes above are separate from UI deployment.

## Verification

- Production build: passed, 76 routes; TypeScript passed.
- `test-copy-review-workspace.mjs`: direct search/edit/save/reset and conflict handling for main plus all five division roles; snapshot deduplication/preservation; wide-workspace preference and inert navigation. Hook adapters, not browser clicks.
- `test-experience-revision.mjs`: poster publish/date/audience rules, shared banner defaults, popup navigation/cancel/session behavior, provider/contact isolation, hero/ticker behavior, scroll/drag/keyboard adapters and numeric color checks.
- `test-division-controls.mjs`: five selectors, active state, four sections, save/discard/revision and scoped controls.
- `test-october-revision.mjs`: all four posters render exactly once in each of six homepage banner ribbons; supplied hero title/accent/description saves reach actual H1/paragraph HTML for all six sites. 42 public routes, five division logins/scopes, concurrent requests, conflict rejection, inventory, galleries, media, invoice and 59 article HTTP checks passed in an isolated local store.
- `test-client-revision.mjs`: upload re-encoding, metadata stripping, photo access/ranges/retries/validation and existing quotation flows passed.
- `test-admin-auth-security.mjs`: 68 isolated checks passed. Logged simulated storage failures belong to fail-closed test cases.
- `test-blob-optimization.mjs`: bounded recovery, strong ETag/CAS, cache invalidation and security session checks passed using fixtures, not live Blob mutation.
- `git diff --check`: passed; line-ending warnings only.

## Visual delivery gate remains pending

The computer-use inventory had no enabled browser; creating an in-app browser returned `Browser is not available: iab`. Therefore desktop/mobile rendered layouts, actual keyboard focus, console errors and full click-through have not been visually approved. The selected antislop workflow requires that remaining browser review before final UI release approval. Automated/component/HTTP checks are evidence of their stated behavior, not a substitute for that visual gate.

## Follow-up: shop photo and transparent footer logo

The shared footer now uses the existing actual shop photograph at `/images/steel-indonesia/toko-mahameru.jpg`, at 16% opacity on a separate decorative layer. Footer copy and actions are not faded; the photo has no pointer interaction and is hidden from assistive technology. The existing cropped SVG logo receives an opt-in near-white-paper alpha filter only in the footer, with no white CSS plate. A subtle edge shadow separates its original black details from the dark photo. Header logo presentation and custom CMS uploads remain unchanged. No raster artwork was edited or generated.

Direction remains the established industrial brand, ENERGY 2 / RHYTHM 2 / MOTION 2. No footer motion or new navigation was introduced.

Delivery gate evidence for this scoped change:

- Hard Gate, source/runtime checks: PASS. Production build produced 76 routes; TypeScript passed. The background is decorative, isolated and non-interactive. Numeric checks meet 4.5:1 for existing white/gray footer copy even over a pure-white photo region at 16% opacity. No new claims, assets, forms or navigation were invented.
- Purpose-Gate: PASS. The real shop photo identifies the company; its opacity preserves text hierarchy. The logo edge shadow supports visibility without reintroducing a white plate. Existing typography/palette remain unchanged.
- Liveliness/direction: PASS by scoped source review. Original company photo and supplied corporate artwork retain brand identity without changing composition or adding motion.
- Craftsmanship, automated checks: PASS. `test-footer-brand.mjs` verified opt-in SVG filtering, distinct filter IDs, unchanged custom uploads and numeric contrast. `test-client-revision.mjs` verified actual SSR photo/filter markup on article listing, an article detail and all five division footers, with existing company/privacy navigation intact. Existing upload/privacy/quotation checks passed. `git diff --check` passed.
- Visual/mobile/keyboard/console gate: PENDING, not approved. A fresh browser inventory again returned `{apps:[],browsers:[]}`. No rendered screenshot or full click-through PASS is claimed. This follow-up has not been deployed by the agent.
