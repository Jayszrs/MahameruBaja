# Mobile UI refinement and old-project removal status

17 October 2026. Scope: the user-supplied phone/desktop screenshots, all six shared website homepages, public product detail, and the CMS navigation.

## Changes

- Decorative text arrows on public calls to action are marked as presentation hints and hidden below 760px. Footer hints are hidden at all sizes. The home route SVG arrows receive the same marker. Functional arrow-only navigation and ordinary document text remain unchanged; URLs, input values and handlers are preserved.
- Mobile hero uses natural content height, a stable header offset, smaller balanced headings, single-column full-width actions, compact rating/meta copy and no text parallax transform. Default division slides use their short introduction rather than the long profile/address paragraph; the complete profile remains in its existing section.
- Popup now returns after document refresh, using a component-local seen set rather than sessionStorage. Dismissal remains respected during same-document navigation for each website/poster set. Admin previews do not affect visitor state.
- Mobile popup has a sticky close toolbar, constrained safe-area-aware viewport, contained artwork, compact content and word-labeled previous/next controls. Detailed facts/terms move into an accessible native details disclosure; provider, named contact and main contact action remain available. Mobile uses a single dialog scroll surface.
- The remaining white logo plate was on the final homepage callout, not the already-fixed footer. Known original corporate logos now use the existing opt-in transparency filter in the callout, route cards and popup provider too. Custom CMS uploads are not replaced. The callout uses the actual existing shop photo at 14% opacity, behind its text/actions.
- Supplier rows on product details are consistent cards with selected state and full touch-sized contact/catalogue actions. These changes do not change stock, prices, quantities, catalogue ownership or product specifications.
- The floating WhatsApp button has a phone-sized footprint and moves above the product sticky action bar. The action bar and popup account for safe-area insets.
- CMS uses one hamburger button on the left: desktop toggles the sidebar and persists the width preference; mobile opens/closes its existing drawer. The redundant right-side “Lebarkan area kerja” control was removed. Dirty guards, save behavior, inert hidden navigation and drawer body-scroll restoration remain.

## Design direction and gates

Existing industrial red/white/charcoal identity, Archivo/Manrope, ENERGY 2 / RHYTHM 2 / MOTION 2. Screenshot-specific decisions prioritize reading and reaching the correct contact rather than adding decoration. No artwork, promotional claims, customer reviews, stock or price evidence was invented.

- Hard Gate/source/runtime: PASS for type checking, production build, escaping/handler isolation, scoped publication and native actionable controls. New decorative imagery is non-interactive and hidden from assistive technology; original assets are reused.
- Purpose-Gate: PASS by scoped source review. Compact type/spacing addresses actual long-content phone screenshots; neutral dark popup and low-opacity shop photo preserve hierarchy; borders mark the selected supplier rather than an ornamental stripe.
- Liveliness/direction: PASS by scoped source review. Brand type, real shop image and original corporate artwork remain the identity. No new decorative motion was added; mobile text parallax was removed.
- Functional/component/API gate: PASS for the explicit automated evidence below.
- Browser/mobile/keyboard/contrast/console visual gate: PENDING, not approved. A fresh inventory returned `{apps:[],browsers:[]}` and an in-app browser attempt returned `Browser is not available: iab`. No screenshot, full visual click-through, real mobile overflow or console-clean PASS is claimed. No UI deployment was initiated by this agent.

## Verification evidence

- `npm run build --workspace frontend`: passed, 76 routes and TypeScript.
- `test-mobile-refinement.mjs`: arrow hints preserve labels/URLs/handlers, escape HTML, do not double-wrap or remove functional arrow-only controls; CSS checks cover popup safe areas, compact hero, callout transparency/photo, supplier actions and WhatsApp offset. Mobile hamburger open/close/inert/scroll restoration verified through actual handlers with adapters, not browser clicks.
- `test-copy-review-workspace.mjs`: desktop hamburger hides/restores sidebar, updates aria-expanded/inert and persists preference; existing text editing/review snapshot checks passed.
- `test-experience-revision.mjs`: refresh reopens the popup, same-document navigation does not; poster navigation/cancel/scroll cleanup and admin preview isolation passed. Existing hero, promo, contact ownership, ticker and scroll/drag adapter checks passed.
- `test-hero-media-editor.mjs`: all six role upload/link/edit/delete handlers and video/image timer behavior passed.
- `test-client-revision.mjs`: actual SSR includes transparent callout logo and shop photo on the main site and five division homepages; article/division footer and upload/privacy tests passed.
- `test-october-revision.mjs`: 42 public routes, five-role scopes, content/text publication, gallery/inventory/invoice/conflicts and 59 article HTTP checks passed in an isolated store.
- `git diff --check`: passed; line-ending warnings only.

These checks do not replace the pending real desktop/mobile browser review.

## Old Vercel project: not deleted

Requested account: `jaelanisuryasaputra@gmail.com`.

Exact old project metadata from the existing frontend link:

- Project `mahamerubaja`, ID `prj_z2n9svSdNTYKxVYAaPpyEXJqQ6o7`.
- Team ID `team_IC7xUwpdXaeEyGYQhHEvQf3d`.
- User-specified domain `mahameru-baja-preview.vercel.app`.

The authenticated CLI account/team is the new `jaelanisurya8-7843`; its team inventory contains only that team. A read-only API lookup using the exact old project ID and explicit old teamId was denied/unavailable. The Vercel connector's user lookup also returned not-found. The user approved removal but has not yet confirmed connecting the old account. A Vercel integration was suggested to enable that connection; no installation/authentication success is claimed.

No DELETE was sent, no Blob store/file was removed, and no Git integration, environment value or CLI login was changed. Other projects in the old dashboard and the current new project are out of deletion scope. Do not retry deletion by the ambiguous name alone: both old and new projects use `mahamerubaja`. A CLI listing with an old `--scope` unexpectedly still listed the new linked team, reinforcing the need for explicit IDs and verified ownership before deletion.

Before removal, reconnect/authenticate the old account, verify its email/team/project/domain and linked-store dependencies, and preserve required backups. The request covers the named project, not indiscriminate shared storage deletion.

[Vercel Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) distinguishes Advanced Operations (upload, copy, listing, store creation) from storage size, and explains that an exceeded Hobby limit requires waiting for the usage period to recover. Therefore project deletion must not be promised as an immediate reset of already-recorded operations. [Project deletion documentation](https://vercel.com/docs/platforms/multi-project-platforms/reference) warns that deleting a project and its deployments is permanent.
