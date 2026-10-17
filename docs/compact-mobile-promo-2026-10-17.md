# Compact mobile promotion popup

17 October 2026. Scope: the popup in the supplied phone screenshot, not the homepage promotional ribbon or CMS data.

## Change and purpose

At 760px and below, the initial popup emphasizes the original uncropped poster, readable title, one existing scoped WhatsApp/contact action, and previous/count/next navigation. Category, description, provider identity and extra offer link no longer fill the initial view. They remain accessible inside the native, initially closed **Detail promo & kontak** disclosure along with period and terms. No contact or promotion data is removed. No extra poster or provider-logo image is downloaded for the compact detail copy.

The open mobile dialog uses a bounded column: close toolbar and navigation remain outside a single scrollable body. This avoids nested text scrolling and keeps dismissal/navigation available on short screens. Poster sizing has a `vh` fallback before `dvh`, original `object-fit:contain`, and the existing full-image zoom. No long CMS title is truncated. Desktop keeps its detailed two-column composition. There is no new browser-size hook, animation or dependency.

Five-second automatic rotation remains unchanged, including fresh timing after manual navigation and existing focus/disclosure/zoom/hidden/reduced-motion protections. No pause button was added. The CMS preview uses the same component.

## Verification / antislop delivery gate

- PASS, source/component behavior: `test-experience-revision.mjs` covers 5,000ms rotation, previous/next, zoom/back, focus/disclosure pauses, Escape/cancel/close, body-scroll restoration and repeat-session behavior. New assertions cover closed mobile details, preserved issuer/contact text, one primary-action layout, no added mobile image copy and viewport-constrained scrolling CSS.
- PASS, TypeScript and production build.
- PASS, purpose/source review: existing red/charcoal/white brand and Archivo/Manrope retained; ENERGY 2 / RHYTHM 2 / MOTION 2 unchanged. One focal poster and contact action replace competing information blocks. No generated asset, fabricated claim, generic visual treatment, new theme, decorative arrow or extra motion was introduced. Existing scoped contact/link handling is unchanged.
- PENDING, visual/keyboard/device gate (R-03/R-25/R-32/R-35/C-4): browser inventory is `apps: []`, `browsers: []`. CSS/hook checks do not prove actual iPhone SE layout, landscape behavior, rendered focus/contrast or smoothness. Check 320×568, 375×667, larger Android widths, landscape, long CMS titles, no-contact fallback, disclosure opening/closing and poster zoom before release.

No deployment, commit, push or production CMS write was performed. antislop-ui's visual delivery gate is not yet passed.
