# Client experience revision, 17 October 2026

Status: implemented and functionally tested locally, not released or visually approved. No production CMS data was written during this revision. No commit/push/deployment was performed in this turn.

## Follow-up: centered, artwork-only popup

The client requested a centered promotional poster without the white card. The dialog now explicitly uses fixed positioning, zero insets and automatic margins, rather than relying on browser default dialog margins that the CSS reset removes. Its background is transparent; visible title/footer/terms panels are removed. The original poster is the clickable offer link, with its title and terms retained for assistive technology. Close and previous/next controls remain separate dark 44px targets with visible keyboard focus. The artwork uses `object-fit: contain`, never cropping the original. The viewport-based width reserves room for controls on short screens as well as phones.

Design reason: the client-supplied artwork is the focal point; a dark backdrop separates it from the page without introducing a second white card. Existing brand direction and ENERGY 2 / RHYTHM 2 / MOTION 2 are retained; no extra animation or generated artwork is added.

Follow-up checks: popup adapter tests, CTA destination/accessibility, absence of the old header/footer, explicit transparent/centered CSS and viewport sizing calculations at 320×568, 375×667, 1440×900 and 667×375 passed. These calculations are not browser layout measurements. Typecheck passed. Visual/mobile/contrast/browser click-through remain PENDING because no browser surface is available. No release approval is claimed.

## Changes

- Shared main/division hero interval is 2,000 ms. Hover no longer freezes it. Keyboard focus, explicit keyboard pause, hidden-tab and reduced-motion protections remain. Videos no longer prevent the interval from advancing.
- Photo heroes on About, Jasa, Projects, Contact, Articles, Social Media and all division subpages use the same 2-second image rotation. Article cover images and image-free headings are not turned into unrelated slideshows.
- Supplier/review pause controls are keyboard-focus-only; no visible Jeda control. Banner controls were already focus-only and remain so.
- Horizontal scrollbars are hidden for offerings, project albums, suppliers/reviews, banners, thumbnails and mobile service cards. Native touch scrolling remains. A shared mouse-drag/keyboard handler covers offering/project ribbons, with click suppression only after a drag threshold; normal gallery/card clicks are preserved.
- Main/division route logos retain the original approved artwork, with consistent smaller white backing plates and responsive spacing. No logo was redrawn and no custom CMS-uploaded logo was replaced.
- Removed the list/count icon in the top header, not the quotation workflow. Product selection, drawer and mobile-menu access remain.

## Four client poster files

Original JPEG files were copied byte-for-byte into `frontend/public/images/posters/`. SHA-256 comparisons against the supplied source files passed. No generated image or changed artwork is used.

- `ring-cakar-sloof.jpeg`
- `selamat-pagi.jpeg`
- `promo-hollow-oktober.jpeg`
- `jasa-laser-cutting.jpeg`

The popup shows after 700 ms, once per browser session per website/poster set. It supports previous/next, arrow keys, close/Escape and backdrop dismissal. Native dialog provides modal keyboard behavior. Body scrolling/focus are restored on dismissal. No automatic poster flipping or automatic dismissal is imposed on readers.

The hollow promotion is limited to 1–31 October 2026, as printed on the supplied poster. Other client posters have no invented event/date/discount. Printed facts and artwork were not used as instructions to change store operating hours or other structured records.

`clientPosterVersion` adds these four known IDs to older content only when there is room within the existing 20-banner limit; existing records are not replaced. Once the updated content is saved, deleting/disabling the seeded posters is respected. Popup defaults are audience-addressed to all five divisions; their contact actions lead to the actual issuing Tambun/laser contacts, not a relabelled Garuda offer.

## CMS

### Banner & poster

- Separate popup and homepage-banner toggles, with publication, dates, audience/ownership and existing uploads retained.
- A Poster masuk filter and direct sidebar entry.
- Collapsible thumbnail records to avoid showing twelve long forms at once.
- Popup-only records require image/alt text rather than all banner benefit/specification fields. Existing banner publication validation remains.

### Teks website (`/admin/teks`)

- Website/page selector, searchable catalog of 602 text choices, before/after fields, and reset-to-default action.
- Static visible text in wrapped public screens/sections can be replaced at React render time. Source text can also be entered for a custom phrase absent from the catalog.
- No DOM text rewriting, HTML injection or alteration of URLs, input values, IDs, event handlers, or business data.
- Structured hero content, articles, contacts, reviews, products/stock, promotion text, profiles and galleries continue to use their existing dedicated editors.
- Replacements are owned by the main site or a specific division, with optional page targeting. Main-site replacements do not silently affect other division websites.
- `websiteTexts` uses existing scoped merge/concurrency/publication/cache-invalidation protection. Division admins cannot reassign ownership or edit another website's replacements.

### Service text

Each division receives service-specific plain-language descriptions rather than repeating unrelated value statements. A new `offeringDescriptions` field in the profile editor allows each service paragraph to be edited directly. Older records default to an empty override map and retain the current service list/order.

### Admin presentation

Navigation labels now use Pesanan pelanggan, Isi website and Sosial media. Form typography and touch targets were enlarged without replacing the existing sidebar/workspace/save/conflict workflow.

## Verification evidence

- `npm run build --workspace frontend`: passed, 76 pages/routes generated.
- `npm run typecheck --workspace frontend`: passed.
- `test-readability-revision.mjs`: exact 1,999/2,000 ms boundaries for shared/subpage heroes, no hover freeze, focus/manual/reduced-motion/visibility behavior, existing banner drag/keyboard checks.
- `test-experience-revision.mjs`: poster publish/date/audience behavior, unchanged original images, safe text rendering preserving URLs/handlers/form values, popup open/navigation/cancel/session behavior, shared ribbon drag/click/keyboard/cleanup. These use explicit hook/dialog/event adapters, not a real browser.
- `test-october-revision.mjs`: all 42 main/division routes returned HTTP 200; real HTTP saves changed rendered footer copy on the intended site only; cross-division changes returned 403; custom service paragraph saved and appeared on its division service page; disabling a seeded poster persisted.
- The same integration suite passed five division logins/scopes, eight concurrent requests, stale-edit rejection, inventory merge/privacy, gallery media/ordering/publication, invoice generation and 59 article HTTP checks. Latest artifacts: `tmp/revision-qa-M9PR1c`.
- `test-client-revision.mjs`: existing three-photo quotation upload/re-encoding/privacy/range/retry/consent/validation flows passed; artifacts `tmp/client-revision-qa-HD3TVn`.
- `test-admin-auth-security.mjs`: 68 checks passed.
- `test-blob-optimization.mjs`: existing bounded-listing/cache/CAS/security checks passed; no live Blob calls in that adapter suite.
- `git diff --check`: passed (line-ending warnings only).

## Visual delivery gate: pending, not approved

Direction: existing red/black/white industrial brand, Archivo/Manrope. ENERGY 2 / RHYTHM 2 / MOTION 2. The explicitly requested 2-second hero rotation is purposeful product imagery; other added motion is limited to popup appearance and existing scroll/drag interactions. White logo plates protect the original black logo details on dark photos. Native forms, labeled selectors and save/reset controls are used for familiar administration.

- Functional/CMS authorization gate: PASS with the concrete checks above.
- Original-asset/content provenance gate: PASS for the supplied posters and retained corporate artwork; no new promotional discounts/events/ratings invented.
- Runtime/build gate: PASS locally.
- Browser visual/mobile/contrast/complete click-through gate: PENDING. Browser inventory was `{apps:[],browsers:[]}`; an IAB creation attempt returned `Browser is not available: iab`. No screenshot, measured contrast result, viewport/overflow or full browser click-through PASS is claimed. This is not a final visually approved deliverable under the selected antislop workflow.

## Git connection: blocked on user authentication

Attempted only for `jaelanisurya8-7843/mahamerubaja` and `https://github.com/Jayszrs/MahameruBaja.git`.

Vercel returned HTTP 400: `You need to add a Login Connection to your GitHub account first.` The user was asked to connect GitHub in the new Vercel account's Authentication settings. No token/password was requested, no old connection was removed, and no repository connection is claimed successful. Do not disconnect the old account's GitHub login blindly.

## Remaining work

1. Complete the new account's GitHub login/installation approval, then retry the scoped connection and verify the production branch/root directory.
2. Run actual desktop/mobile browser inspection, poster modal/keyboard interaction, logo/scrollbar checks, admin editing and console audit. Fix issues before approving the UI release.
3. Only then finalize the release workflow. Existing production remains at the previously successful deployment; these local revisions are not live yet.
