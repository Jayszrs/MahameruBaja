# CMS division controls, 17 October 2026

Status: local implementation, not deployed or visually approved. Existing unrelated changes are preserved. No production CMS records, permissions or API endpoints were changed.

## Requested change

Improve division buttons and related admin actions while keeping the interface familiar. The existing red/white/charcoal brand, fonts and CMS structure remain the direction. ENERGY 2 / RHYTHM 2 / MOTION 2 are retained; this change adds no animated decoration.

- Division buttons use the actual CMS logo, name, label, area and publication state. Existing corporate logo mapping is reused; no artwork is generated or substituted for custom uploads.
- Selected buttons expose `aria-pressed` and the visible label “Sedang diedit”. A red border identifies the actual selected record, not a decorative stripe.
- The selected division is repeated above the form to reduce wrong-division edits. “Buka website” uses the selected public route and identifies the new tab to assistive technology.
- Four section buttons have readable labels and short descriptions. They remain ordinary keyboard-operable buttons linked to the form fieldset with `aria-controls`.
- The main save action remains prominent with unsaved/busy feedback. Archive/delete/activate actions are grouped under a native details disclosure; existing confirmations and role restrictions remain.
- Shared CMS primary/secondary/destructive buttons have 44px minimum heights and 14px text. Primary red distinguishes save, outlined actions remain secondary. Mobile division selection uses native horizontal scrolling with hidden scrollbars; keyboard focus can still reach each button.

## Verification

- PASS: `npm run typecheck --workspace frontend`.
- PASS: `npm run build --workspace frontend` compiled successfully and generated all 76 route entries.
- PASS: `node frontend/scripts/test-division-controls.mjs`. Component adapters exercise all five selectors, four sections, correct public links, discard cancellation, draft preservation, revision-aware mocked save, role-specific UI, and CSS target/wrapping rules. No live CMS writes.
- Existing hero/banner/readability adapter tests imported by the test also pass.
- PENDING: real browser layout, mobile overflow, contrast across rendered surfaces and keyboard click-through. Browser inventory returned no apps or browsers. Code/CSS checks are not screenshots or browser measurements; this is not a completed antislop delivery gate.

No commit, push or deployment was performed for this follow-up.
