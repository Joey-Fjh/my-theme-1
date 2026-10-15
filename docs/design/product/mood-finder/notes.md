# Product `mood-finder` design (new section)

Local design inputs (images are Git-ignored): `desktop.png` (the Ceylune design), `reference-mello.png` (https://mello-coffee.webflow.io/, the interaction source). No mobile design; mobile is derived (below).

## Desktop

- Left column: uppercase tracked eyebrow ("Skin mood finder"), serif heading, two short uppercase lines, a botanical sketch (raster in Figma, rotated -8.43°), and a small caption at the bottom left ("Choose your mood. We'll do the rest.").
- Centre: a round wheel in four quadrants, each a texture image with a small eyebrow and a serif phrase; a thin ink outline and cross; an empty small circle at the centre.
- A hand-drawn curved arrow from the wheel to the card (static decoration).
- Right: a product card (rounded, soft shadow): image, a tracked tag line ("Balm · Restore"), product title, short description, price, a size chip ("50ml"), and an arrow link at the bottom right.

## Interaction (accepted, user, 2026-10-15)

- Selecting a quadrant (click or keyboard) shows its product in the card.
- Selected state (missing from the design, leans to the reference): an arrow inside the centre circle turns to point at the selected quadrant; the three other quadrants carry a light veil.
- Card change: fade in with a settle from about 2° tilt, about 300ms; none under reduced motion. No shake.
- No scroll linkage, no autoplay.

## Content model (accepted)

- Block per quadrant (four): texture image, eyebrow, phrase, product, tag line (fallback: product type), description (fallback: truncated product description). Image, title, price and link come from the product; the size chip is the first available variant's option value.

## Mobile (derived, accepted)

Heading area, then the wheel (full width), the caption, then the card. The botanical sketch and the curved arrow are hidden.
