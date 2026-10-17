# Poster, kontak, profil admin — 17 Oktober 2026

Implemented locally; not deployed or visually approved.

## Changes

- Welcome posters cycle every 2 seconds while the dialog is open. Hidden documents and reduced-motion preferences do not cycle. Reading/interacting with details, manual navigation, or enlarging a poster pauses cycling; a visible control resumes it. CMS draft previews stay manual. Refresh still opens a fresh popup.
- CMS Banner & poster now has `priority` (integer 0–999). Higher values appear first in both public banners and popup. Equal values retain CMS Naik/Turun ordering. Draft, date, owner and audience filtering remain authoritative.
- Portrait banners follow a 2:3 frame instead of a short landscape thumbnail. No white card plate around popup posters. Popup and banner previews have an enlarged-image mode that preserves all printed poster text.
- Removed CSS white glow from dark-surface corporate logos. Transparent corporate logo rendering now also removes the SVG's own CSS white background, including the cartoon cap badge. Original logo art and custom uploaded files are not overwritten.
- Services overview action text has no underline or decorative arrow. Article routes no longer mount the global motion controller; article index uses one static shop image instead of rotating three images. Responsive Next images, lighter reading typography, lazy related images, desktop-only parallax elsewhere, and no countdown timer without countdown content reduce unnecessary media/work. No measured speed improvement is claimed.
- Contact cards show existing phone/mobile/WhatsApp/email data, with a disclosed generic cartoon when no custom contact photo exists. Original division logos overlay the cap; custom contact photos remain unchanged. No phone numbers or actual portraits were invented.
- Super Admin manually enters and confirms a new password in Reset password. Backend retains scrypt, session revocation, revision conflict checks and mandatory change on next login. The chosen password is not echoed by the API. Existing API random-reset fallback remains for compatibility; no plaintext-password storage was introduced.
- Super Admin can upload/link/remove profile images on account records. Each admin can manage their own photo under Akun saya. New `/api/admin/profile` only exposes/changes the authenticated account, validates media ownership/kind, rejects privilege fields, checks revision/session version and uses private no-store responses. Account profile uploads do not become public contact images automatically.
- Follow-up: profile drafts and uploads now participate in the CMS toolbar dirty/busy state and navigation protection. Invalid URLs do not render as image sources. Cancel/retry/conflict recovery is available; password and photo actions stay separate when both forms have changes. Password changes refresh the profile revision without overwriting an unsaved photo draft. Reassigning an account to another division without an explicit replacement clears its previous photo reference.

## Image provenance

- Tool: built-in image generation, new-image mode, `transparent_background: true`.
- Original retained at `C:/Users/jaela/.codex/generated_images/01a102b3-a28f-7592-ba5f-f66ff7ee3d45/exec-648a4b98-bf31-4e14-a7f0-14a6018ee870.png`.
- Packaged asset: `frontend/public/images/contact-admin-illustration.webp`, 640×640, 40,698 bytes. Sharp only resized and converted format; native HTML/SVG overlays use original corporate logos.
- Prompt: one friendly generic adult Indonesian male customer-service cartoon, chest-up and centered, navy shirt with red piping, navy cap with an empty front panel for a real logo overlay, commercial 2D illustration, no real-person portrait, no text/logo/watermark/props/extra people, full transparent background and cap/shoulders within square composition. Same base image is reused to keep downloads small; each division has its own original logo badge.

## Verification / pending gate

- Production build and TypeScript pass.
- Disposable local account suite: 188 HTTP checks plus restart persistence, including manual reset, session invalidation, own-profile CSRF/validation/revision, avatar cross-division/anonymous denial and reassignment cleanup.
- Full content suite: 1,186 HTTP checks across six roles, plus 49 article checks and 33 empty-state checks. Priority creation/edit/invalid-value rejection and retaining a nonzero priority after restart are included; all persistent stores survived restart without reseeding.
- Auth/security unit suite: 68 checks pass using temporary filesystem/in-memory storage only.
- Broader integration: 42 public routes across all six sites, five division issuer/contact assignments, CMS text rendering, concurrency, inventory, galleries, article access, invoice generation and migration checks pass on isolated local data.
- Popup timer/priority/zoom/refresh, existing hero, mobile navigation, footer/SVG and media-validator adapter tests pass.
- Local client integration passes article/division footer SSR and upload/privacy checks.
- `test-account-avatar-editor.mjs` covers load, URL validation, upload ownership, save/remove/cancel, load retry, conflict retention, toolbar action, combined navigation protection and simultaneous password/photo actions using actual component handlers with adapters.
- Browser surface inventory is empty (`apps: [], browsers: []`). Desktop/mobile screenshots, touch/keyboard walkthrough, focus/scroll behavior, actual logo-edge appearance and performance measurements still require a connected browser. No visual PASS or release approval claimed.

## Old Vercel project — NOT deleted

Requested domain: `mahameru-baja-preview.vercel.app`, old account `jaelanisuryasaputra@gmail.com`, project `prj_z2n9svSdNTYKxVYAaPpyEXJqQ6o7`, team `team_IC7xUwpdXaeEyGYQhHEvQf3d`.

Follow-up: the newly connected Vercel app now authenticates as `jaelanisuryasaputra@gmail.com` / `jayszrs` with the exact old team as default. Its project and domain endpoints verified the ID, owning team, and the single domain `mahameru-baja-preview.vercel.app`. CLI authentication is still the new account and must not be used for deletion.

The connector's supported deletion operation returns `status: requires_user_action` and `mutationExecuted: false`. It requires the user to review and confirm deletion in Vercel, at:
https://vercel.com/d?to=%2Fjaelanisuryasaputra-2719s-projects%2Fmahamerubaja%2Fsettings%2Fgeneral%23delete-project&title=Review+in+Vercel

This is a handoff, not a successful deletion. The user's reply “oke boleh” confirms permission but does not establish that the dashboard action was completed. No project, deployment, Blob store, or file was deleted by the agent. Never target the identically named project in the new account or assume deletion resets recorded operation usage. Windows visual verification also remains unavailable: native Computer Use initialization succeeded, but `list_apps` reports an unavailable native pipe (os error 2).
