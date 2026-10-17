# Popup details and hero announcements, 17 October 2026

Status: implementation and functional verification in the local workspace. Browser visual approval remains pending. No production content writes, credential rotation, Git push or deployment were performed by the agent for these requests. Other activity committed earlier revisions during the work; those commits were preserved.

## Public popup and CMS

The centered original poster remains uncropped with no white card. A dark adjacent information panel identifies the offer, description, issuer division, benefits/scope, dates, terms and actual published CMS contact. Desktop uses two columns; mobile stacks the artwork and details in a viewport-constrained scrolling dialog. Close remains sticky, navigation stays reachable, and original Escape/backdrop/session/focus restoration behavior is retained.

Provider identity is not inferred from the site displaying a shared poster. Explicit provider wins, followed by content ownership and the existing division CTA. Original Tambun posters still identify Tambun when displayed on Cibitung; the laser poster still leads to laser contacts. No new discount, stock guarantee, event or contact is invented.

CMS `Banner & poster` / `Poster saat masuk` includes a site/owner filter, Add popup poster, provider/contact selection and actual dialog preview. Each of the five division admins can create its own draft popup and preview it. Only Super Admin manages cross-division ownership/audience. API validation rejects foreign providers and unavailable contacts. New popup entries remain drafts until explicitly published.

Published contact data is used with its audience constraints. A specifically selected disabled contact does not silently become another person. Public content redacts that contact ID and the popup falls back to the appropriate contact-directory route, without changing the saved CMS record.

## Hero strip

The static wrapping service strip is replaced by a single-line, continuously rightward ticker on all six homepages. Two identical groups make the loop seamless, with the duplicate hidden from assistive technology. The strip is locally clipped rather than causing page overflow. Motion pauses on desktop hover, keyboard focus, an explicit focus-revealed control and hidden tabs. Reduced-motion preference disables animation and permits manual horizontal reading. Hover pausing is restricted to hover-capable devices to avoid sticky touch hover.

CMS `Hero beranda` / `Teks berjalan` edits one owned setting per website: up to 12 messages of 160 characters each, plus visibility. Main and division settings are independent and use the existing optimistic merge, ownership and public-cache invalidation flow. Old data defaults to neutral service/consultation copy. There is no inferred stock availability or invented promotion. Empty inputs are rejected before save with a clear message.

## Design intent

Existing red/white/charcoal identity and Archivo/Manrope are retained. ENERGY 2 / RHYTHM 2 / MOTION 2 continue the selected session direction. The original artwork is the focal point; the dark detail panel provides readable contact context without a white frame. Red is the offer action and announcement strip. Repeated marquee motion is explicitly requested, with pause/reduced-motion safeguards. No generated visual asset or new navigation hierarchy is introduced.

## Verification

- PASS: Next production build and TypeScript checks, 76 route entries.
- PASS: `test-experience-revision.mjs`: original artwork hashes, poster date/audience filters, provider/contact isolation, published-contact restrictions, named WhatsApp destination, popup navigation/dismissal/session restoration, admin draft preview, CMS popup creation and controls for all five roles, safe draft defaults, per-site announcement editing, rightward/single-line CSS, pause/visibility/reduced-motion behavior, and existing hero/banner/ribbon checks. Component/event adapters, not a browser.
- PASS: numeric 4.5:1 contrast checks for defined popup text/action and ticker color pairs. These are not a complete rendered-surface contrast audit.
- PASS: `test-october-revision.mjs`, artifacts in `tmp/revision-qa-ZsvD8m`: real local HTTP saves of provider/contact/popup/ticker data in all five divisions, actual SSR ticker text isolation, authenticated editor routes, 403 foreign-owner/provider rejection, 400 unavailable-contact rejection, hidden-contact reference privacy, 42 public routes, existing concurrent CMS/inventory/media/album/invoice checks and 59 article checks. Disposable local data only.
- PASS: division-control adapters, Blob optimization/CAS fixture checks and 68 auth/security checks. No live Blob calls from these tests.
- PENDING: visual/mobile viewport, keyboard/browser click-through and full rendered contrast gate. `cua.getState()` returned no apps/browsers; IAB creation returned `Browser is not available: iab`. No screenshot or visual PASS is claimed. This is not a final antislop-approved UI release.

## Vercel warning investigation (read-only)

Confirmed project `jaelanisurya8-7843/mahamerubaja`. The metadata for `BLOB_READ_WRITE_TOKEN` reports type `encrypted`, no Secret visibility, targeting Production/Preview/Development. Values were not printed or saved to source. This matches the screenshot warning about a secret-like value remaining readable to authorized project members, not a Blob capacity alert or evidence that the public website has the token.

Official guidance: https://vercel.com/docs/environment-variables/sensitive-environment-variables and https://vercel.com/docs/environment-variables/rotating-secrets . Tokens should use Secret type. A coordinated token rotation/configuration/redeployment requires a separate authorized operation; none was performed here, and the existing store remains intact.
