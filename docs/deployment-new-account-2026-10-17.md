# New-account deployment, 17 October 2026

## Destination

- Account: `jaelanisurya8@gmail.com`
- Team: `jaelanisurya8-7843` (`team_hdMmwgGaasI62wzS4MNvu36N`)
- Project: `mahamerubaja` (`prj_Vsf4V9tO1vcb7JOt4OVaINdy1uYV`)
- Production: https://mahamerubaja.vercel.app
- CMS: https://mahamerubaja.vercel.app/admin/login
- Private Blob: `mahamerubaja-cms` (`store_O4gI1JT44sxNtslM`), Singapore.
- Successful deployment: `dpl_CTiZNufVWLCz5H8qsNx4mSsYu68u`, READY, production, build duration 26.795 seconds.
- Source: local checkout based on `97a489d`, including uncommitted readability/logo revisions and the Blob ETag fix. No commit or push was made.

The previous team's project and Blob store were not deleted, reset, or disconnected. Local root project linkage now targets the new team. Local frontend configuration was preserved; the CLI provisioned a new ignored root `.env.local` for the new Blob connection. Credentials and session material are not included in this report.

## Explicitly accepted recovery source

The user authorized deploying the available older local data after being told that it was not a complete production backup.

- `frontend/.cms-data/site-content.json`, last modified 6 October: normalized through the existing schema/identity migrations, resulting in 10 contacts and 2 reviews, plus repository defaults for fields not present in the old file.
- `frontend/.cms-data/requests.json`: 1 request, schema defaults applied.
- Repository defaults: 5 active divisions and 7 articles.
- Existing local admin configuration: 6 accounts (one super administrator and five division administrators), stored privately. This is not a recovery of later account changes made on the old deployment.
- No private-media references or request photo references were present in the restored payload. New media index starts empty.
- Security state starts without old sessions; a new session-signing secret was generated.

Six `current.json` collection documents and the security state were created in the new private store with create-only writes and read-back checks. This avoids legacy listing on reads of these initialized collections. Test fixture directories were not used. The source local CMS files were not modified.

Later CMS edits/uploads in the inaccessible old store have NOT been recovered. Hobby storage/operation allowances remain limited; this deployment does not increase the plan's limits or reset the old team's usage.

## Login failure found and fixed before handoff

The first deployment loaded public pages but login returned HTTP 500. Live diagnosis proved:

- `get()` of the accounts JSON used Brotli and returned a weak ETag (`W/"..."`).
- `head()` returned the strong storage ETag for the same unchanged object.
- Conditional password-hash migration was rejected with `BlobPreconditionFailedError: ETag mismatch`.
- Requesting `Accept-Encoding: identity` returned the strong ETag without an additional metadata request.

`previewBlobStore.ts` and `securityState.ts` now request the identity representation for CAS snapshots. Authentication, origin validation, session revocation and conditional-write conflict protection remain enabled. The session fix also covers security state growing large enough to compress. No weak ETag is stripped or treated as a strong validator.

## Verification

- TypeScript typecheck: passed.
- Blob adapter regression: passed, now simulates weak ETags for compressed responses and checks identity reads for collection/security CAS; conflict and bounded-listing tests passed. Fixture calls are not production usage metrics.
- Admin auth/security unit checks: 68 passed.
- Existing readability interaction/code checks: passed; not browser visual QA.
- Remote production build: READY.
- Production HTTP 200: `/`, `/tentang-kami`, `/produk`, `/sosial-media`, `/admin/login`, original logo asset.
- Existing local super-admin credentials: successful deployed login and persisted session, credentials/cookie never printed.
- Authenticated `/admin` and content/division/article/account/request APIs: HTTP 200, with 5 divisions, 7 articles, 6 accounts and 1 request.
- Content save with unchanged content: HTTP 200, revision incremented and read back from the new store. Content itself was not changed by this check.
- Logout: HTTP 303; the revoked cookie is rejected with HTTP 401.
- New-deployment error-log scan after verification: no error entries returned.

No live test customer requests or media uploads were created. Browser click-through/visual inspection was not performed. Automatic Git deployment integration was not configured; this was a manual deployment from the filtered local source. Source upload excluded environment files, access files, private CMS JSON, test directories and dependency/build folders. `.vercelignore` was extended to explicitly exclude nested temporary directories and all `.admin-*.txt` files.
