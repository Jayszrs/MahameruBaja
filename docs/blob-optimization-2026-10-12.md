# Blob operation optimization — 12 October 2026

## Problem and limits

The supplied dashboard shows Advanced Operations above the Hobby allowance (2.1K / 2K), while storage is only 281.56 MB / 1 GB. Live CLI logs for the linked project showed `Vercel Blob: Failed to fetch blob: 403 Forbidden` on homepage requests. No live Blob files were listed, rewritten or deleted for this task.

Previously, `readPreviewBlob()` scanned all `rev-*.json` files using `list()` on every read. Layouts, pages, published-content checks and media permission checks repeated these reads. Vercel counts `list()` as an Advanced Operation, not just uploads. Deleting images does not undo previously counted operations.

## Changes

1. Public site content, division directories, published articles and anonymous media-index reads use Next's shared Data Cache on Vercel. Six-hour revalidation reduces legacy list traffic; authenticated CMS writes expire the common, store-scoped tag immediately with `revalidateTag(tag, { expire: 0 })`. Local/self-hosted reads remain uncached. React request memoization also shares public site content inside one render.
2. Collection reads first fetch a deterministic private `<namespace>/<collection>/current.json`. It contains `{ format: 1, revision, value }`. Existing installations without that file still read the highest legacy revision, including paginated listings. Ordinary reads never perform migration writes.
3. The first successful save for a collection creates `current.json` without overwriting an existing file. Subsequent saves require the ETag returned by the fresh read (`ifMatch`). Concurrent/stale writes cannot overwrite another admin's changes. Legacy revision files remain untouched; future edits update one current document instead of growing full-document snapshots indefinitely.
4. Authentication, account reads, session revocation, rate-limit state, mutable CMS reads and mutation preconditions remain fresh. Security-state CAS logic is unchanged. Public request submissions still require persistent writes; caching does not weaken this.
5. Cache keys/tags include a hash of namespace and store credential, not the credential itself. Different stores cannot share entries accidentally. Publishing, unpublishing, archiving divisions, changing stock, and indexing media invalidate all related public projections. An uncertain committed write also expires projections, even if the caller receives a conflict result.
6. Public contact API uses the same cached public directory rather than another fresh division listing. Anonymous media-index lookup uses shared cache; authenticated lookup remains fresh, and media authorization remains enforced with private/no-store HTTP responses.

The app does not enable Cache Components, so this uses the compatible `unstable_cache` Data Cache API without a site-wide rendering/config migration. This API is superseded by `use cache` in Next 16; migration to Cache Components can be planned separately.

## Migration and deployment precautions

- **No live migration has been run.** Cache and read-path optimizations take effect only after deploying this code. Each existing collection moves to the bounded document on its first successful CMS save; untouched collections retain cached legacy reads.
- Blob access must be restored before a cold cache can read existing data or an admin can save. This code does not reset quotas, upgrade the account, bypass a suspension, or silently replace unavailable CMS content with seed data.
- Use only the updated deployment for CMS writes. Do not edit from old immutable deployment URLs after cutover: old code writes legacy revisions, which the new current-document reader no longer follows.
- Before a rollback to pre-optimization code, export all current documents and reconcile them with legacy collections. Old code cannot read current-document updates. Keep the original legacy revisions and newest exports; do not delete stores or credentials to attempt a reset.
- Private JSON documents remain private. No public raw-CMS snapshot endpoint is introduced.
- The six-hour TTL is a traffic optimization, not a promise of a fixed monthly usage count: deployments, cache misses, edits, dashboard browsing, uploads, request submissions, and security writes still consume operations. Changes written outside the updated CMS do not invalidate its tags.

## Tests and measured results

`node frontend/scripts/test-blob-optimization.mjs` uses in-memory private Blob and Data Cache adapters only. It verifies paginated legacy recovery, preservation of old bytes, migration conflicts across independent module instances, ETag stale-write protection, bounded storage, read/write failure behavior, token/namespace separation, immediate invalidation, uncertain commits, uncached local reads and uncached failures.

- 1,000 fresh reads of a migrated collection: **0 list calls**, versus at least 1,000 with the previous implementation.
- 1,000 public reads with a warm shared cache: **1 get call, 0 list calls** in the cache adapter fixture. This is not a production/dashboard measurement or a guarantee about simultaneous cold misses.
- Ten further edits: no growth in the number of stored documents; both original legacy revision files remain intact.
- `node frontend/scripts/test-admin-auth-security.mjs`: 68 security/auth checks passed.
- Production build: passed (75 generated pages); `npm run typecheck --workspace frontend`: passed after regenerating stale route types.
- `QA_CONCURRENCY=24 node frontend/scripts/test-october-revision.mjs`: passed, including 24 concurrent request submissions, publication privacy, media ranges, scoped CMS edits, gallery operations, native video upload/publication and 59 article-CMS HTTP checks. Isolated artifacts: `tmp/revision-qa-sKQyt7`.
- The older integration fixture was updated for the existing scoped CMS/private-upload rules: draft media requires its owner cookie, division editors must send scoped snapshots, and row-level conflicts must target the edited album. Rendered review/gallery assertions now distinguish visible cards from shared published RSC data. Unpublished-content assertions still inspect the entire payload.

Dependency installation was synchronized for missing packages without changing manifests/lockfile. A stale generated `.next/dev/types` directory referencing pre-route-group admin files was moved to a recoverable backup under `tmp/blob-typecache-backup-caaa3b7610d94c319244fd0ff4dd0639`; production route types were regenerated. No source pages were removed.

References: [Vercel operation pricing and Hobby limits](https://vercel.com/docs/vercel-blob/usage-and-pricing), [private Blob conditional writes](https://vercel.com/docs/vercel-blob/using-blob-sdk), and the installed Next.js 16 `unstable_cache` / `revalidateTag` documentation.
