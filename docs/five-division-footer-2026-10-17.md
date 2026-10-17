# Five-division footer and transparent partner logos

17 October 2026. This implements the user's clarified footer request, replacing the earlier interpretation-only recommendation. Implementation is already present in commit `51a4756`; the continuation verified it without replacing unrelated changes.

## Behavior

- Main-site footer shows all active CMS divisions, currently five: Mahameru Baja, Garuda Marginal Baja, MBI Trading, MBI Laser Cutting & Bending, and MBI Project Fabrikasi & Erection.
- Each unboxed division block contains its existing logo, name, website link, address (linked to its saved map when available), and published administrator names/numbers with telephone links. No address, administrator or logo was invented. Missing address/contact data uses an explicit confirmation/contact-page fallback.
- Group motto appears above the division directory. Main-site contact action points to the directory instead of defaulting to laser cutting. Division websites keep their own individual footer identity and links.
- Logo, address and contact changes reuse existing CMS data: **Profil divisi** for logo/address/map and **Kontak & ulasan** for administrator publication, name and number. No duplicate footer-only data collection was introduced. Archived divisions and unpublished contacts remain subject to existing public-read rules.
- Desktop uses five columns, then three/two columns at narrower widths, and a single readable column on narrow phones. The directory has no parallax, white cards or floating shadows.
- Supplier and client-logo ribbons opt into display-only white-paper removal for raster images as well as existing corporate SVG frames. Raster treatment combines a near-white alpha matrix with original source alpha. Original file bytes, image URLs, lazy loading and image dimensions remain unchanged. Ordinary photos and unflagged images are unaffected.

The filter removes near-white pixels, not a semantic background mask: intentional white lettering or very pale artwork can also become transparent. This is an explicit logo-display treatment, not a claim that every logo has been manually retouched. Inspect pale HSC artwork and custom uploads before release. No AI redraw or permanent image overwrite was used.

## Verification evidence

- PASS: `test-footer-brand.mjs`, corporate/raster opt-in filter markup, original custom URL preservation, original-alpha composition, distinct filter IDs, unchanged ordinary image rendering and numeric footer text contrast.
- PASS: `test-footer-divisions.mjs`, five logo/website/map/telephone blocks, CMS-provided content, empty/missing-data fallbacks, main/individual-site separation, lazy logo flags and five/three/two/one-column CSS.
- PASS: `verifyFooterCms` inside `test-october-revision.mjs`, actual production HTML for all five divisions, motto placement, individual footer preservation, address edit reaching main footer, administrator edit reaching correct division, foreign-division non-leakage, unpublished-contact removal and fixture restoration.
- PASS: isolated production suite, 42 public-route checks, supplier/client authorization regression, all five division route-media saves and 59 article/media HTTP checks. Artifacts: `tmp/revision-qa-e8QAEj`. All writes used a disposable local CMS with Blob disabled, not production.
- PASS: `test-client-revision.mjs`, updated group/individual footer expectations and existing media/form regression; artifacts `tmp/client-revision-qa-vvp0C7`.
- PASS: production build and TypeScript. Component and API checks are not browser screenshot or device-performance measurements.

## Antislop delivery gate

Antislop-ui influenced an unboxed, content-led directory rather than five duplicated full footers. Existing red/charcoal/white brand and Archivo/Manrope retained, ENERGY 2 / RHYTHM 2 / MOTION 2. The five identities have equal importance; phone numbers and destinations stay readable rather than squeezing five columns onto phones. Group motto explains their relationship. No new decorative icons, badges, glass, animation, theme or invented trust claim was added.

- Hard Gate source/data PASS: R-02/R-17/R-18/R-23/R-24/R-26/R-27/R-28/R-33/R-34/R-36/R-37/R-38. Real CMS content, opt-in source rendering, working links and explicit missing-data fallbacks; no new generated asset or fabricated metric.
- Purpose Gate source PASS: R-01/R-04/R-06/R-07/R-08/R-09/R-10/R-12/R-13/R-14/R-19/R-22. Existing branding retained; layout serves the user's five-division identification/contact requirement, with no new visual effects beyond the requested logo transparency.
- Liveliness/source PASS: retained explicit dials, existing industrial backdrop, original identities, structured spacing and one group-level hierarchy. Actual rendered composition remains unverified.
- Quality Locks source PASS: C-1/C-2/C-3/C-5 and R-05/R-11/R-15/R-16/R-20/R-21/R-29/R-30/R-31. No speculative navigation, cloned design, new generic copy or fake business relationship.
- Visual/device gate PENDING: R-03/R-25/R-32/R-35/C-4 require real-browser checks for pale logos, SVG filter behavior, long names, mobile/landscape layout, keyboard focus and rendered contrast. Current browser inventory returned `apps: []`, `browsers: []`. This is not visual release approval.

No commit, push, deployment, production CMS mutation, project deletion or asset purge was performed by the agent during this continuation.
