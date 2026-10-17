# Hero media and CMS CRUD verification

17 October 2026. Implementation is local; no production data or live credentials were used by these tests. The agent did not commit, push or deploy this revision.

## Editor changes

The Hero page now puts media in its own visible section, separate from copy and button fields:

- One native upload picker accepts JPEG, PNG, WebP or MP4. A successful upload sets the media type automatically; a rejected upload preserves the existing media.
- A separate direct-file link field accepts existing local media paths or HTTPS URLs, with an explicit image/video choice. It explains that a YouTube/Instagram/Drive page is not a direct MP4 file.
- Video supports an uploaded or linked image poster, removable independently. Preview controls, upload busy/error messages, missing-media state and preview failure guidance are present.
- Replacing/removing media edits the slide reference, not the physical source file or other slides. Save still validates the slide; the final slide can be deleted without the CMS silently restoring it. Add, publish, copy edit, order, save, cancel and delete remain available.
- The old ten-slide UI cap incorrectly counted all division slides together. It now matches the existing 100-record API bound.
- Images retain the two-second timer. Healthy videos now wait for `ended` rather than being interrupted by that timer. Failed videos retain the fallback advance path; focus/visibility/manual/reduced-motion pause behavior remains.

The upload API already checked file bytes, image normalization, H.264 structure, owner access and publication state; these checks were retained, not bypassed. Current Vercel uploads are capped at 4 MB per image/video. Non-Vercel video uploads are capped at 30 MB. Large hosted videos can use a direct HTTPS MP4 link. External hosting must permit browser playback; it was not contacted by the link-storage tests.

## CRUD coverage and intentional boundaries

| Area | Verified behavior |
| --- | --- |
| Hero, contacts, social accounts/posts, banners, gallery albums, ticker messages, website text | Create/read/edit/publish/unpublish/delete for Super Admin and all five division roles, scoped merging and stale-edit rejection |
| Hero media | Real image and H.264 upload, poster, replacing with a direct HTTPS link, partial video byte response and revocation of the old public upload for all six roles |
| Reviews | Central, Garuda and independent division quote creation/edit/publication/removal; no generated customer claims outside disposable fixtures |
| Articles | Draft/publish/edit/delete, validation and media/publication behavior |
| Divisions and accounts | Owner-only administration, profile create/edit/archive/delete, account create/edit/disable/delete, forced password change/reset and session revocation |
| Inventory | Create/edit/remove each division's listing/stock record. The source-controlled product master catalogue is not a new arbitrary-product CRUD editor |
| Customer requests/invoices | Create/edit, revision conflicts, invoice edits, archive and restore. Historical requests are archived rather than permanently purged |
| Uploaded files | Unused/unpublished files become private. Record deletion is not a physical Blob purge; shared files are not deleted underneath other records |
| Image-only fields | Logos, portraits, article covers, gallery photos and banner posters keep image upload/HTTPS-link support; video is not forced into image-only slots |

## Reproducible checks

Run from the repository root after a frontend production build:

```powershell
node frontend/scripts/test-hero-media-editor.mjs
node frontend/scripts/test-cms-local.mjs
node frontend/scripts/test-cms-local.mjs --uploads
node frontend/scripts/test-cms-local.mjs --accounts
node --conditions=react-server --import tsx frontend/scripts/test-media-validation.mjs
```

The local runner creates a new ignored `tmp/cms-all-roles-*` store, disables Blob explicitly, uses test-only accounts and stops the local server on completion. Modes use port 3173 and must run sequentially. Existing Docker test defaults remain supported.

Results:

- `test-hero-media-editor.mjs`: PASS. Actual component event handlers via hook adapters for all six roles: automatic type, poster, failed file retention, link changes, validation, save/conflict, cancel/delete/recreate. The chooser resets its file input, shows preview errors and removes references. Video waits for completion; existing image/pause/motion tests also passed.
- `test-cms-local.mjs`: PASS, 1,154 CRUD HTTP checks for six roles, restart persistence, 49 article checks, and 33 persistent empty-state checks. No deleted collection reseeded.
- `--uploads`: PASS, 200 HTTP requests plus 16 after restart. JPEG/PNG/WebP, original H.264, byte ranges/HEAD, all upload aliases, private/published/legacy access, invalid files, type-safe content saves, rollback and rate limits.
- `--accounts`: PASS, 167 division/account/ownership HTTP checks and restart persistence.
- `test-media-validation.mjs`: PASS, 58 checks including image metadata removal, H.264 bounds, Vercel's 4 MB limit, local video's 30 MB limit and Range/HEAD.
- `test-october-revision.mjs`: PASS, 42 public routes across six sites, five-role scope checks, hero text publication, banners, inventory, galleries, invoices, conflicts and 59 article checks.
- `test-admin-auth-security.mjs`: PASS, 68 isolated checks. Simulated storage-failure log events belong to fail-closed test cases, not production errors.
- Browser-test selectors were updated for the new labels, but those browser suites were not executed.

## Design and delivery gate

Direction: existing red/white/charcoal admin UI, Archivo/Manrope. ENERGY 2 / RHYTHM 2 / MOTION 2. The upload area is emphasized because it is the user's main task; native inputs and specific labels retain familiar behavior. File/link choices are two columns on desktop and one column below 800px. No new imagery, marketing claims or decorative motion was introduced.

- Hard Gate/runtime: PASS for automated validation, permissions, data provenance, build and type checks. New labels have native inputs, feedback and a real action; the delete dialog retains native Escape/cancel handling.
- Purpose-Gate/direction: PASS by scoped source review. Media grouping addresses the missing-upload affordance, preview uses a dark neutral surface for image/video legibility, and existing brand accents remain limited to actions.
- Craftsmanship/functional checks: PASS at the explicit component/API level described above, including errors, empty states, conflicts and persistence.
- Browser/mobile/keyboard/console visual gate: PENDING, not approved. A fresh computer-use inventory returned `{apps:[],browsers:[]}`. No full browser click-through, screenshot, measured viewport overflow or console-clean claim is made. Do not treat automated HTTP or hook adapters as visual release approval.
