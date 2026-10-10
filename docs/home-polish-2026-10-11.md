# Homepage and about-page polish — 11 October 2026

## Requested changes

- Promo and project ribbons retain horizontal scroll, keyboard focus and a
  draggable scrollbar. Native WebKit end-arrow buttons are hidden; no new
  carousel navigation buttons were added. Existing promo pause/reduced-motion
  behavior is retained.
- The unsolicited five-division offerings ribbon is removed from the main
  homepage. Unit sites retain their own relevant service/product choices.
  Existing division navigation at the page bottom remains.
- The illustrative homepage gallery is replaced by published CMS project
  albums in a horizontal ribbon. Clicking a project opens its multi-photo
  album; the mezzanine album has nine photos. Main shows group projects, and
  unit sites show only projects assigned to that unit. No projects are relabeled
  to fill an empty unit's ribbon.
- Homepage and about-page collages show three visible, independently clickable
  tiles and a white-backed division logo. The logo also opens the gallery.
  Published, assigned CMS project photos are included in the viewer, alongside
  the existing labeled material/illustration images and brand asset. Gallery
  navigation supports thumbnails, arrow keys, Escape, close/backdrop controls,
  focus restoration, background scroll lock and horizontal touch gestures.
- Vision/mission body text is larger (17–20px), with larger section labels and
  narrow-screen spacing/layout rules. Cards have mobile-sized touch targets.

## Corrected causes

The main page explicitly replaced stored contacts with `contacts: []`, causing
the empty-state message. It now passes published contacts, with no hardcoded
replacement or changes to saved CMS records.

The old collage positioned all images absolutely, and a more-specific generic
figure rule overrode the small figures' height with `auto`. Their absolutely
positioned image content did not establish height. The new grid establishes
tile dimensions and avoids those figure selectors entirely.

The client reviews widget previously received the whole CMS content object.
Its server callers now send only the review profile fields, avoiding unrelated
division albums and contact records in the widget's client props.

## Verification

- Next production build/TypeScript passed, with 94 routes.
- Isolated integration tests cover ten visible homepage contacts, unpublished
  contact privacy, three clickable tiles in each collage, unit about pages,
  removal of the main offerings strip, eleven project ribbon albums, published
  CMS photo propagation, draft privacy and division filtering. Existing stock,
  gallery, media, social, invoice and 58 article HTTP checks also pass.
- CSS checks verify hidden native scroll buttons, horizontal overflow, stable
  tile heights and responsive vision/mission typography.
- Browser inventory was empty. Live desktop/mobile appearance, swipe handling
  and modal interaction have not been browser-verified; no screenshots are
  claimed. The computer-use skill was used to establish that limitation.
- Changes remain local. No commit, push, deployment or real CMS write was made.
