# Mobile, readability and editorial revision — 17 October 2026

## Scope and design

Continue the existing Mahameru industrial identity: red, white and charcoal; Archivo/Manrope; ENERGY 2, RHYTHM 2, MOTION 2. No new brand assets or invented social photos. Reuse the original contact illustration and the actual division logo artwork. The smaller cap emblem follows the square illustration rather than the varying card width, and contact cards no longer stagger vertically.

The article cover now spans the page behind the editorial heading. A dark overlay serves text contrast rather than decoration. Reading text keeps its narrower measure. No article parallax. Uploaded Instagram preview images cover their card frame; image-only posts link to the actual original post. Link-only posts retain the real platform embed, whose internal cross-origin layout is not rewritten.

CMS operational labels and help text are 12–14 px, input text 15 px / mobile 16 px, action buttons 14 px with at least 44 px height. This specifically covers reorder/delete actions, save state, navigation, record summaries and media help. Existing actions and ownership protections are unchanged.

Public service copy uses “Laser Cutting & Bending”, including metadata and previously saved CMS text. The display-only normalizer preserves raw CMS records, identifiers, asset URLs, review quotations and legacy website-text source aliases. Service-description lookup keys follow the normalized service names so custom descriptions are not lost. Footer terminology is “MATERIAL & JASA CUTTING”; the shared motto starts with trading material, cutting and bending.

## Mobile performance: source evidence, not measured FPS

Observed candidates in the code:

- The global motion controller scans the main subtree, installs observers and schedules scroll animation work. It now exits before that work on narrow/coarse-pointer devices and reduced-motion setups.
- Reveal/counter hooks animated on touch devices. They now reveal content/set final counters directly; desktop reveal runs once. Counter animation frames are cancelled on cleanup. The legacy scroll-position hook also skips touch/narrow screens.
- Review/partner marquees used animation-frame-driven scrolling. They now remain manually scrollable on touch/narrow screens without the autoplay loop or its observers.
- Shared horizontal ribbons installed a permanent non-passive pointermove listener. That listener is now installed only during an actual overflowing mouse drag and removed on release/cancel/cleanup.
- Main hero mounted upcoming media; subpage heroes mounted every source photo. The main hero now keeps only current/outgoing layers, and subpage heroes render one photo. Video preload is metadata-only; social native video preload is none.
- Social frames previously existed in the initial homepage HTML. They now mount only within 150 px of the viewport or after the visitor chooses “Muat unggahan”. A failed/unsupported visibility observer still leaves that manual action and the original post link available. Fullscreen permission remains a single modern iframe allow attribute.
- Mobile CSS removes parallax transforms, reveal/copy animations, selected blur/backdrop effects and heavy card shadows while retaining short opacity transitions and explicit user controls.

Hero images rotate every 5 seconds. A healthy hero video still completes via its ended event. Popup posters remain on the separately requested 10-second timer, including reading/zoom/hidden/reduced-motion pauses.

These changes reduce known sources of browser work and media loading. They are not a measured FPS, INP, LCP, download-size or Lighthouse improvement claim.

## Verification

- Production build and TypeScript: passed.
- Timer/editor adapters: exact 5-second main/subpage image rotation; popup stays 10 seconds; hidden/focus/reduced-motion pauses; hero image/video uploads, type detection, CRUD, validation, conflict retention and all six administrator scopes.
- New `test-mobile-performance-revision.mjs`: public wording, legacy source aliases, unchanged URLs/IDs/raw CMS/review text, matching custom service descriptions, real-image-first social preview, deferred video, iframe load action/permissions, early mobile motion exit and structural CSS checks.
- `test-client-revision.mjs`: isolated production HTTP checks passed for the full-width static article hero and requested footer text on articles and all five divisions; original transparent-logo treatment and working footer links retained. Existing request-photo tests also passed.
- `test-poster-contact-refinement.mjs`, `test-footer-brand.mjs` and mobile regression adapters: passed.
- `test-october-revision.mjs`: passed against an isolated production server: 42 public routes, main/five-division legacy CMS title overrides, unchanged raw records, matching normalized service descriptions, initial social-frame deferral with original source links, media ownership, concurrent writes and 59 article CRUD/media HTTP checks. Legacy eager-iframe assertions were replaced with deferred-load/original-source assertions; iframe fullscreen behavior remains covered by the component adapter.

All HTTP writes are to disposable ignored local fixture directories with Blob disabled, never production CMS or real accounts. No commit, push or deployment is part of this change.

## Delivery gate

Pending visual verification at desktop, tablet and phone breakpoints, keyboard navigation and actual-device scroll profiling. Browser inventory returned no enabled apps or browsers. Therefore the antislop visual delivery gate is not passed, no visual/FPS approval is claimed, and this revision is not deployed. Check especially cap alignment, long article headings, CMS action wrapping and real Instagram embed presentation on an actual phone before release.
