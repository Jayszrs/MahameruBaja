# Static sections, original social media and division-card uploads

17 October 2026. Local implementation, not a deployed or visually approved release.

## Current behavior

- Home laser/bending feature, division route cards, social section, logo sections and contacts use explicit static-motion boundaries. The motion scanner skips their reveals and parallax. Social content is present in server markup, not hidden until a scroll animation completes.
- Supplier and cooperating-company logos automatically travel rightward using a two-group CSS transform. Only the first group is announced to assistive technology and carries record IDs. There are no visible buttons, pause controls or scrollbars. Animation stops offscreen/in hidden tabs; reduced-motion users get one native, keyboard-scrollable row instead. No JavaScript frame loop or scroll-position writes drive the logo animation.
- Instagram's cross-origin iframe cannot be restyled to remove its internal white canvas. The four existing verified business posts now resolve to their actual original media, keyed by their exact Instagram URL. Unknown posts retain the official lazy embed. No social image was redrawn or replaced with a different product photograph.
- The materials post retains all nine source photos. Its initial frame is photo seven, the exact pipe/rack picture shown in the user's screenshot. Source pixels are unchanged: frame coordinates crop only the white source canvas in CSS. Previous/next buttons, swipe, source links and load-failure/retry behavior remain usable. One active image is mounted at a time.
- Existing company video has a native, user-controlled inline player with `preload="none"`, no autoplay and working HTTP range delivery. It is 13,086,196 bytes, not an initial page download. Original video thumbnail was a black intro frame; no unrelated cover was substituted.
- CMS social posts offer direct photo/video versus official embed. Uploaded image/video takes precedence over the bundled source archive. Explicit embed mode selects the platform player without erasing uploaded assets. Newly added posts need their own uploaded original media to avoid platform framing.
- Nuri in Tambun, Nuri in Cibitung and Putri default to the female character, per the user's explicit answer. Other contacts are not classified from their names. Each contact has a CMS character selector; a saved custom photograph always wins. Division cap marks retain the original artwork with restrained cloth-like placement. Phone numbers are 18px desktop/16px compact. Narrow phones use a single contact column to preserve readable numbers.
- CMS path: **Profil divisi > Foto & logo > Media kartu divisi di beranda**. Each division can upload an image or MP4, choose a video cover, paste a media URL or revert to the existing division hero. The division hero itself is not overwritten.
- Card background videos mount/play only while visible and permitted by reduced-motion/save-data preferences. Offscreen/hidden videos unmount, rejected autoplay retains the poster, and failed media retains the static cover. No additional runtime dependency was introduced.

## Persistence and authorization

`division.routeMedia` is nullable and defaults to null for legacy profiles. `contact.illustration` and `socialPost.displayMode` are optional so old CMS documents remain valid. Nothing overwrites production CMS content automatically.

The existing image/video upload path, media-kind validation, owner checks, optimistic revisions and publication-aware media references cover route media and video posters. Draft uploads remain private. Referencing an upload from an active profile makes it public; removing its last published reference revokes anonymous access. A foreign division cannot use another division's draft upload. No new Blob resource, database migration, token or integration is needed.

## Source assets

Original sources: public business Instagram embeds, retrieved 17 October 2026 without authentication. URLs identify original posts, not expiring CDN locations:

- `https://www.instagram.com/reel/DeG2uVRh2uq/`: `frontend/public/videos/social/DeG2uVRh2uq.mp4` (640 × 360 original video).
- `https://www.instagram.com/reel/Dd59WrvhJtC/`: `frontend/public/images/social/Dd59WrvhJtC.jpg` (720 × 1280 original cover).
- `https://www.instagram.com/p/Dd5a7EzDk9N/`: `frontend/public/images/social/Dd5a7EzDk9N-01.jpg` through `-09.jpg` (1440 × 1800 original carousel files).
- `https://www.instagram.com/reel/Dd3OyLoB_7p/`: `frontend/public/images/social/Dd3OyLoB_7p.jpg` (720 × 1280 original cover).

Two unused newly downloaded source thumbnails, a duplicate carousel cover and the black video intro thumbnail, were moved recoverably to ignored `tmp/social-source-archive-20261017`, not shipped in public assets. All referenced source media remains intact.

### Female illustration generation

Tool: built-in `image_gen`, transparent-background mode, original male character as style reference. Final asset: `frontend/public/images/contact-admin-female-v1.webp`, 640 × 640 with alpha, 42,390 bytes. Original generated PNG is retained at `C:/Users/jaela/.codex/generated_images/01a102b3-a28f-7592-ba5f-f66ff7ee3d45/exec-992703bd-c241-495f-ab80-3c399f894fa5.png`. Sharp only resized/encoded the generated image; it did not draw or replace any logo. Original division logos are rendered separately over the blank cap. This is disclosed as an illustration, not a real staff photograph.

Final prompt specification: “Create female counterpart to supplied cartoon uniformed customer-service admin, adult Indonesian woman, friendly professional smile, dark hair tucked under same navy baseball cap, same navy shirt/red piping, chest-up centered front-facing square, matching polished semi-realistic cartoon shading/proportions, transparent alpha, blank cap for exact division logo rendered separately; no text/watermark/backdrop/white plate. Cap front approx x30–70%, y5–22%; one character, professional.”

## Footer interpretation, not an implemented change

The client's reply suggests equal individual representation of all five divisions, not only MBI Laser Cutting & Bending. It does not unambiguously specify five full footer blocks on one page versus a complete identity per division website.

Recommendation: a compact five-division identity/navigation strip above the main footer, with the group tagline above it; each division website retains its own complete identity/contact footer. On phones, stack or wrap the division options instead of shrinking five labels into one line. Do not duplicate five full footers and their link columns on every page without confirmation.

Suggested confirmation: “Pak, berarti kelima divisi ditampilkan satu per satu dengan logo, nama, dan tautan website/kontaknya, bukan hanya MBI Laser Cutting & Bending. Tagline grup ditempatkan di atas daftar divisi. Apakah begitu, atau Bapak menginginkan lima blok footer lengkap dalam satu halaman?”

## Verification evidence

- PASS: production build with all 78 routes and TypeScript.
- PASS: `test-static-social-revision.mjs`: exact archive URL matching, custom-media/embed precedence, nine source dimensions/frame bounds, initial photo seven, previous/next, touch swipe/click suppression, error recovery, explicit character overrides, transparent female asset, hidden duplicate strip, no logo buttons and background-video observer/hidden/reduced-motion/save-data cleanup.
- PASS: existing mobile performance, poster/contact and experience hook/event adapter regressions. Explicit embed mode overrides a stored video while retaining its field.
- PASS: isolated production HTTP suite with Blob disabled, disposable CMS and six synthetic administrator roles. New route-media tests exercise all five division image/MP4 uploads, unchanged hero, wrong MIME usage, foreign access, publication/removal privacy, stale revisions, persistent female choices and original video range requests. Existing coverage includes 42 public routes and 59 article/media HTTP checks.
- PENDING: real browser click-through, screenshots, cap alignment on both characters, mobile landscape, keyboard layout, rendered contrast and FPS/INP/LCP. Browser inventory returned `apps: []`, `browsers: []`. No universal iOS/Android smoothness claim is made.

## Antislop delivery-gate record

Scope: current revision. ENERGY 2 / RHYTHM 2 / MOTION 2 retained from Mahameru direction. Brand red/white/charcoal and Archivo/Manrope remain unchanged. Static social/contacts emphasize actual content; automatic logo movement is the user's explicit request for browsing a long real-company list. The female uniform illustration differentiates the selected contacts without presenting an invented photograph. Larger numbers and a one-column narrow layout prioritize calling over decoration.

- Hard Gate content/source review PASS: R-02, R-17, R-18, R-23, R-24, R-26, R-27, R-28, R-33, R-34, R-36, R-37, R-38. Direct source changes, real post URLs, explicitly requested/disclosed avatar, no new fabricated counterparties/reviews/metrics, real handlers, persistent error/empty states and no new theme toggle.
- Hard Gate PENDING: R-03, R-25, R-32, R-35 need real browser breakpoint/contrast/keyboard/click-through checks. API and adapter evidence above is not a screenshot audit.
- Purpose Gate source review PASS: R-01, R-04, R-06, R-07, R-08, R-09, R-10, R-12, R-13, R-14, R-19, R-22. No new decorative icon set, colors, background texture, badges, glass or floating cards. Cap shadow follows original uniform placement; logo animation serves the explicit long-row browsing request; real media and contact illustrations serve identification.
- Liveliness/source review PASS: explicit retained dials, real industrial imagery, red action accent, clear route/contact/social focal content and varied existing section rhythm. Rendered composition remains PENDING.
- Quality-lock source review PASS: C-1, C-2, C-3, C-5; R-05, R-11, R-15, R-16, R-20, R-21, R-29, R-30, R-31. Existing identity retained, no generic replacement layout or footer redesign inferred. C-4 remains PENDING actual-device states.
- Overall visual release gate PENDING. No commit, push, deployment, production content write or old-project deletion performed.
