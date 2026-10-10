# Shared homepage, footer and social revision — 10 October 2026

## Public layout

Main website and all five division homepages now render `UnifiedHomeContent`.
The section order is shared: hero, promotions, introduction/vision, offerings,
feature, order flow, FAQ, reviews/partnerships/suppliers, gallery preview,
social posts, contacts, location, callout and division navigation.
Copy, media, offerings, process, FAQ, admin contacts, Maps and social posts
are selected for the current division. Garuda keeps its own Google profile.
Division promotions are selected by their existing CTA destination. An empty
division displays an honest information panel, not an invented promo.

The large white name/red-dot wordmark now appears in the main footer as
“Mahameru Baja Indonesia” and in each division footer using its own name.
The public footer no longer contains an admin login link. Admin routes remain
accessible directly and retain their existing authentication.

Supplier logos use the same draggable, looping marquee hook as client logos,
with a visible horizontal scrollbar and pause control. Duplicate copies are
hidden from accessibility. Existing reduced-motion behavior is preserved.
About-page division photos are now asymmetric layered collages, alternating
compositions. Existing material photos and labeled illustrative media are used;
no new AI-generated photography or supplier branding was introduced.

## Social sources and playback

Source workbook: `DAFTAR LOGO DANA NOMOR BARU MBI.xlsx`, Sheet1 L11:O18.
Read-only XML extraction confirmed that TikTok/YouTube cells contain display
names only. There are no profile/video hyperlinks in the workbook.

Verified YouTube source:

- https://www.youtube.com/shorts/IP6GsNxExVU
- Public YouTube oEmbed endpoint returned HTTP 200 with title
  “Proses laser Cutting #Laser #cnc”, author “Mahameru Baja Indonesia” and
  channel https://www.youtube.com/@MahameruBajaIndonesia on 10 October 2026.
- Embed endpoint returned HTTP 200, but this does not prove playable frames.
- Added as a laser-cutting post, not a Garuda video. `socialSourceVersion`
  imports it once into old CMS records, fills only the known blank MBI channel
  URL, respects existing post URLs, and does not resurrect later deletions.
- YouTube Garuda was located on 11 October 2026 via YouTube's public search:
  https://www.youtube.com/@GarudaMarginalbaja, channel ID
  `UCNUleps0OB3aCVu6f7HCpiw`. Its public description names the Wanajaya,
  Rawalele RT 02/RW 05, Cibitung address and `0812-8707-2023`, matching the
  supplied Garuda contact and its Instagram profile. This identity match,
  not the display name alone, is the basis for selecting the channel.
- Public YouTube oEmbed confirmed the same author/channel for both new posts:
  https://www.youtube.com/shorts/0onyCem9_qI (material delivery) and
  https://www.youtube.com/shorts/rGpjrXQM92M (spandek cutting).
  Added to `retail-cibitung` only. `socialSourceVersion: 2` imports these once,
  fills only the known empty Garuda account, and preserves existing URLs,
  captions, scopes, visibility and earlier MBI deletions.
- TikTok MBI/Garuda remain unpublished. Repeat searches by display names,
  Instagram handles, regional terms and public cross-links did not establish
  the correct profiles. TikTok access is blocked by robots.txt in the web tool;
  that restriction was not bypassed. The supplied Maps HTML and the YouTube
  channel descriptions contained no usable TikTok links. No guessed handles
  or unrelated videos were published.

Social account scope can be selected in `/admin/sosial`. Unset legacy scopes
fall back to the known MBI/Garuda handles; explicit empty scopes mean shared.
Public social directory supports `?divisi=<slug>` and filters posts/accounts.

Optional `videoUrl` accepts MP4 from `/media`, `/videos` or public Vercel Blob,
rejecting traversal and arbitrary external URLs. CMS supports upload, preview,
poster and removal of the direct-video override. Existing media authentication,
magic-byte validation and size limits are reused. Use company-owned originals,
not scraped Instagram media. Without an uploaded MP4 the official platform
embed remains, with a reload control and the original post link. Website code
cannot override Instagram's “Watch on Instagram” restriction.

## Verification and handoff

- Next.js production build and TypeScript checks.
- Isolated integration tests cover all six section orders, footer identity,
  absent public admin link, 17 accessible supplier logos, five collages,
  social account/post scopes, MP4 schema/player markup, one-time YouTube import,
  and existing stock/CMS/gallery/article/invoice regressions.
- No actual CMS records were changed by tests.
- 11 October follow-up: build passed with 94 routes; isolated integration
  checks include the Garuda homepage/directory embeds, no Garuda video/channel
  in the laser division, v0/v1 CMS upgrades, URL deduplication, preservation of
  curated captions/unpublished records, and no resurrection after deletion.
  A direct source-schema check also verifies the actual Garuda YouTube handle
  falls back to `retail-cibitung` when no scope is stored.
- Browser automation inventory was empty. No visual browser/mobile or actual
  third-party playback verification is claimed. Test MP4 URLs exercise schema
  and HTML markup, not decoding of a real video file.
- Changes are local; this revision does not commit, push or deploy.
