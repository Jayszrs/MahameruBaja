# Retail logo name change

18 October 2026. Client request: replace visible “MMN” below the retail symbol with “Mahameru Baja”.

The shared corporate-logo renderer now clips the original retail artwork to the symbol only (sheet y=35..465), excluding the old MMN pixels. It draws the exact wordmark **MAHAMERU BAJA** as red SVG text beneath the retained original symbol. The existing 610×525 viewBox and layout dimensions stay unchanged. Text width is bounded to the symbol's width, and the existing Archivo display family is reused rather than introducing another font or asset download.

This is a native SVG/code change, not an AI raster redraw or permanent bitmap edit. The supplied source sheet and original PNG remain intact. The legacy default image URL remains mapped, so saved CMS profiles do not need a migration. Custom uploaded logo URLs are not remapped. Garuda and all MBI artwork/lettering remain unchanged. The internal `mmn` frame identifier is intentionally stable; it is metadata, not the visible lettering.

Every placement using `CmsImage` with the default retail logo receives the change, including shared public headers, profile/route imagery, footer logos and illustrated contact cap marks. Raw downloads of the old PNG remain original artwork; no claim is made that the source file was rewritten.

Antislop-ui purpose/source review: existing red/black/white identity and symbol retained, ENERGY 2 / RHYTHM 2 / MOTION 2 unchanged. No new decoration, animation, shadow, background plate or invented identity. The wordmark is an explicit client instruction. Structural tests verify old-letter exclusion, exact name, transparent/non-transparent variants, other divisions unchanged and custom-upload preservation.

PASS: production build (78 routes), TypeScript, shared logo source/markup checks and existing popup/readability regressions. The client HTTP suite also asserts the exact full retail name in actual public markup, while retaining original Garuda/MBI mappings and custom-upload preservation.

Visual release gate remains pending: current browser inventory is `apps: []`, `browsers: []`. Inspect small header/cap readability, SVG text font loading, dark/light surfaces and mobile widths when a browser is connected. Tests are not visual approval under antislop-ui R-03/R-25/R-35/C-4. No deployment or production CMS mutation is performed by this change.
