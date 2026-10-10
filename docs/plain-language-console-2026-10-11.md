# Location/social copy and pasted console audit — 11 October 2026

## Scope

- Location eyebrow is now simply `LOKASI`.
- Shared homepage heading: `Dekat. Lengkap. Siap melayani kebutuhan Anda.`
- Main and retail location description: `Solusi material untuk setiap proyek.` Service divisions retain their own introduction so they are not incorrectly described as retail stores.
- Social heading: `Media sosial kami. Ikuti kegiatan dan pekerjaan kami.` The supporting sentence describes products, activities and completed work, rather than technical player permissions.
- Social empty-state and playback note use everyday language. Previously revised vision/mission, hero, projects, contact directory and footer copy remain unchanged.
- SocialHub and SocialEditor retain `allow="...fullscreen..."` and remove redundant `allowFullScreen`. Fullscreen permission is not removed.

## Supplied console text

Source: the user's `Pasted text.txt` attachment, not a live browser session.

- One duplicate `allow`/`allowfullscreen` warning: both attributes were present in our social iframe markup. Corrected in public and CMS preview components.
- React DevTools, HMR and Fast Refresh lines are development information, not failed application requests. The `tel:` external handler line records opening a phone link.
- Sixteen blocked Instagram logging requests, four blocked YouTube log-event requests and two blocked YouTube playback-stat requests report `ERR_BLOCKED_BY_CLIENT`. The named endpoints are third-party telemetry. Client-side blocking (for example browser/privacy filtering) is indicated, but the exact blocker is not identifiable from this log. Do not disable visitor privacy protections or hide console errors.
- The blocked YouTube stat URL also contains `docid=IP6GsNxExVU` and `This_video_is_unavailable`. This is evidence of a player availability failure in that session, not proof that fixing fullscreen or telemetry requests restores playback. The exact reason remains unknown; original-post links stay available.
- Forty-eight unsupported policy-feature warnings mention `attribution-reporting`, `shared-storage` and `shared-storage-select-url`; eighty policy violations mention `unload`. None of these directives is configured by this application. Its response policy is only `camera=(), microphone=(), geolocation=()`. They are consistent with embedded third-party documents, though this pasted log lacks enough origin information to assign every warning conclusively. No application security policy was relaxed.
- Seven generic preload warnings replace the resource address with `<URL>`. Without those addresses the source cannot be identified reliably, so no image/font preload was removed speculatively.
- No React hydration exception, uncaught application stack trace or own-domain failed resource request appears in this supplied log. This does not establish that every browser session is error-free.

## Verification

Integration assertions cover the new copy on the main homepage and all five divisions, fullscreen permission without the duplicate attribute, and the actual production HTTP Permissions-Policy header. Existing tests continue to cover contacts, project galleries, CMS isolation and media markup.

- `npm run build --workspace frontend`: passed, including TypeScript and 94 generated pages.
- `QA_CONCURRENCY=24 node frontend/scripts/test-october-revision.mjs`: passed, including the new copy/header/iframe assertions and 58 article-CMS HTTP checks. Isolated artifacts: `tmp/revision-qa-Glb5xa`; real CMS data was not modified.
- `git -c core.whitespace=cr-at-eol diff --check`: passed.

Browser playback and mobile rendering require a live browser check; production build and HTTP tests do not establish third-party playback availability. No CMS records, commits, pushes or deployments are changed by this task.

References: [MDN iframe attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe), [YouTube player errors](https://developers.google.com/youtube/iframe_api_reference#onError).
