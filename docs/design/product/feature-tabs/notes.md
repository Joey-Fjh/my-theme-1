# Product `feature-tabs` design (new section, name provisional)

Local design inputs (images are Git-ignored): `desktop.png` (the Ceylune design, 1440), `reference-mello.png` (https://mello-coffee.webflow.io/, the interaction source). No mobile design; mobile is derived (below).

## Desktop

One framed panel inside the page margins: a thin ink border with a large radius around the whole section.

- Left, about 60%: one full-height image, cropped to fill. It changes with the active item.
- Right, about 40%, cream surface, in two parts:
    - Top: a counter (`01 / 04`, tracked), an uppercase tracked eyebrow, a serif heading, body text, and an optional decorative botanical illustration at the top right. The top part shows the active item.
    - Bottom: the item list, one row per item, hairline dividers: a number and a serif label. The active row is filled ink with a light label and a short horizontal line at the right.

## Interaction

- Click (or keyboard) on a row makes it active: the left image and the top content switch to that item. No scroll linkage, no autoplay.
- The reference's numbered hotspots on the image are not used.

## Content model (proposal)

- Section: colour scheme, optional decorative image (illustration, empty alt), padding.
- Block per item (up to 4 in the design): image, label (row and eyebrow), heading, text. Counter and row numbers are automatic.

## Mobile (derived, to confirm)

Stack inside the same frame: image (landscape ratio), then the active item's content, then the rows; tapping a row switches image and content. At 390 the whole section should fit in about one screen so the change stays visible.
