# Popup, unboxed contacts and partner-logo CMS

17 October 2026. This request supersedes the previous 10-second popup interval.

Follow-up: automatic supplier/client ribbons, explicit female contact choices, direct original Instagram photos and route-card media now supersede the manual-only ribbon implementation below. See `static-social-route-media-2026-10-17.md` for the current behavior and verification limits.

## Changes

- Popup: five-second rotation, no pause/resume button. Manual navigation starts a fresh interval. Zoom, expanded terms, keyboard focus in the details, hidden documents and reduced-motion preferences still stop automatic changes. A new website/preview session resets zoom and reading state.
- Contacts: no white card, rounded container or gray portrait panel. The original transparent illustration sits directly on the page; name, role, division, phone and WhatsApp remain usable beneath it. Custom contact photos are preserved. The illustration is explicitly disclosed, not represented as a real staff photograph.
- Suppliers and client companies: logos only, no white figure cards or duplicate captions. Native horizontal scrolling plus mouse/keyboard interaction replaces repeated animated logo copies. Each published logo appears once, reducing the logo DOM from 69 to 23 for the original data set. This is a component count, not a measured FPS or network improvement claim.
- CMS navigation: **Isi website > Logo supplier** and **Logo perusahaan rekanan**, at `/admin/mitra?tab=suppliers` and `/admin/mitra?tab=clients`.
- CMS supports image upload or a direct image URL, name changes, independent ordering per type, publish/draft, cancel/delete confirmation, preview errors and persistent saves. Deleting a record unlists it; it does not permanently purge the uploaded object.

## Data, ownership and migration

The new `partnerLogos` collection is part of the existing revisioned site-content store. No additional database, Blob store, token or dependency was introduced. It uses the existing authenticated image-upload and media-reference mechanisms, including image type/size normalization, private drafts, owner validation and public-access revocation after unpublishing.

Each record has a stable ID, type (`supplier`/`client`), name, logo, publication flag, owner and optional audience. Super admin manages central and division records. Division admins only receive and modify their own records. Central logos show on the main website and, by default, division websites; an explicit audience limits division placements. Division-owned logos stay on their assigned division website unless super admin explicitly shares them. Cross-division edits are rejected, not merely hidden in the UI.

Only a missing legacy collection receives the 17 existing company-profile supplier logos and six existing client logos. Explicitly saved empty lists remain empty. Published supplier names and original artwork are preserved; no counterparty, logo, endorsement or relationship was invented. Unknown supplier artwork remains unnamed.

## Mobile and visual direction

Continue Mahameru red/white/charcoal, Archivo/Manrope and ENERGY 2 / RHYTHM 2 / MOTION 2. The antislop-ui layout decision is intentionally unboxed because the identity artwork, rather than a container, is the focal point. The cap badge remains anchored to the square illustration. The restrained contact CTA keeps one clear action per person.

React review focused on fewer repeated nodes, lazy images, avoiding new animation loops, stable IDs, effect cleanup, schema validation, explicit failure states and existing CMS draft protection. Private-storage guidance influenced reuse of the current media authorization path instead of publishing every upload immediately.

Contact portraits are smaller on narrow screens; logo strips preserve native touch scrolling, and hover transforms/strip transitions are disabled on coarse-pointer devices. Dialog sizes have `vh` fallbacks before dynamic viewport units. Existing mobile animation reductions and deferred social embeds remain intact.

This does **not** guarantee every historical iOS/Android version. The installed Next.js 16.3.8 documentation lists Safari 16.4+, Chrome/Edge 111+ and Firefox 111+ as supported defaults (`node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md`). Actual-device profiling and older-browser testing have not been performed.

## Verification and delivery gate

- Schema/component PASS: `test-partner-logos-editor.mjs` checks 23 preserved seeds, explicitly empty lists, ownership visibility, immutable reorder, duplicate/unsafe URL validation, six administrator handler scopes, upload/type rejection, draft validation, edits, save failures with retained drafts, delete/cancel and both record types.
- Popup PASS: actual hook/timer adapters verify exactly 5,000 ms, no pause button, fresh intervals after navigation and focus/terms/zoom/visibility/reduced-motion behavior.
- Real API/data/rendering PASS: `verifyPartnerLogos` runs inside the isolated production HTTP suite. All six roles exercise draft/published media access, publish, one logo instance in actual HTML, order, name edits, stale-write conflicts, forbidden ownership/audience changes, invalid and duplicate records, unpublish and deletion of the final record. Central sharing and explicitly clearing/restoring the fixture list are covered.
- Regression PASS: production build/TypeScript, mobile/contact component checks, 42 public route audit and article/media HTTP suite. Tests use disposable ignored fixture directories with Blob disabled, never live CMS accounts or production content.
- Visual/keyboard/device gate PENDING: browser inventory returned `apps: []`, `browsers: []`. No visual screenshot audit, real-browser keyboard audit, FPS/INP/LCP result or universal mobile compatibility claim is made. The antislop visual delivery gate is not passed.

No deployment, production CMS mutation or storage purge was performed by the agent. Before release, visually check long contact names, character alignment, transparent/cropped supplier artwork, both CMS tabs and popup scrolling on Safari and Android Chrome at narrow widths and landscape orientation.
