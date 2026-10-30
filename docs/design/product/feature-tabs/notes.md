# Product `feature-tabs` design (new section, name provisional)

Local design inputs (images are Git-ignored): `desktop.png` (the Ceylune design, 1440), `reference-mello.png` (https://mello-coffee.webflow.io/, the interaction source). No mobile design; mobile is derived (below).

## Desktop

One framed panel inside the page margins: a thin ink border with a large radius around the whole section.

- Left, about 60%: one full-height image, cropped to fill. Numbered markers sit on the image at merchant-set positions; they link to products when a product is assigned.
- Right, about 40%, cream surface, in two parts:
    - Top: a counter (`01 / 04`, tracked), an uppercase tracked eyebrow, a serif heading, body text, and an optional decorative botanical illustration at the top right. The top part shows the active item.
    - Bottom: the item list, one row per item, hairline dividers: a number and a serif label. The active row is filled ink with a light label and a short horizontal line at the right.

## Interaction

- Click (or keyboard) on a row makes it active: the top content switches to that item. The left image stays the same; the marker for the active tab is highlighted (filled ink disc). No scroll linkage, no autoplay.
- Markers are round numbered discs on the image. The active tab’s marker matches the filled ink look; hover and keyboard focus on any marker use the same filled look. Markers with a product link navigate to that product; they do not change the active tab. Markers without a product are decorative numbers only (`aria-hidden`).
- No tooltip or bubble on markers.

## Content model

- Section: colour scheme, one feature image (`image_picker`), optional decorative image (illustration, empty alt), padding.
- Block per item (up to 6): optional product (marker link target), marker horizontal and vertical position (0–100%), label (row and eyebrow), heading, text. Counter and row numbers are automatic.

## Mobile (derived, to confirm)

Stack inside the same frame: image (landscape ratio) with markers, then the active item's content, then the rows; tapping a row switches content and marker highlight. At 390 the whole section should fit in about one screen so the change stays visible.
