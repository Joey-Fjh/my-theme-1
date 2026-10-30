# Product `formula-details` design (new section)

Local design input (Git-ignored): `desktop.png` (the Ceylune design). No reference site, no mobile design. One section in two parts.

## Desktop

- **Band (sage background, full width):** left, a serif heading ("A Closer Look at the Formula.") and a short paragraph; centre, three attribute columns separated by thin vertical rules, each with a number, a serif name and one line of text (01 Texture, 02 Formula, 03 Finish); right, a texture close-up.
- **Ingredients (cream background):** an uppercase serif heading ("THE FORMULA") and a subtitle, then three cards: a landscape image, a number, a serif name and one line of benefit (Aloe Vera, Green Tea, Botanical Extracts).

## Decisions (user, 2026-10-15)

- One section; each part has its own colour scheme setting. The design's sage has no scheme yet (board): the band takes the closest existing scheme, tuned in the polish pass.
- Content: two block types, attribute (name, text) and ingredient (image, name, text); numbers are automatic. Per-product content comes from metafield dynamic sources in the editor.
- Motion: the existing cascade on the attribute columns and the ingredient cards. No hover effect (images are not links).
- The band's image stays inside the page margins (only backgrounds go full width); the design shows it bleeding to the right edge.
- Numbers use the body face with tabular figures, upright, instead of the design's monospace italic (one family, F1, 2026-10-26; `lint:theme` forbids `font-mono`).
- Mobile (derived): band: heading and text, the attributes stacked with horizontal rules between them, the image full width; ingredients: heading, then the cards in one column.
