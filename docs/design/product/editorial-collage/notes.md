# Product `editorial-collage` design (new section)

Local design input (Git-ignored): `desktop.png` (the Ceylune design). No reference site, no mobile design.

## Desktop

A two-row, two-column collage inside the page margins; the columns are about 55% and 42% wide and line up across both rows.

- Row 1: left, a serif heading and a paragraph of body text; right, a landscape texture close-up.
- Row 2: left, a large product image under the text column; right, a near-square detail image under the texture.

## Decisions (user, 2026-10-15)

- Image corners follow `design.md` (contained editorial media take the large radius token, which the merchant controls), not the square corners in the screenshot.
- Motion: the theme's existing list and card cascade on scroll (once per page view, follows `motion_enabled` and reduced motion). No parallax, no hover effect (the images are not links).
- Mobile (derived): heading and text, the texture full width, then the product image and the detail image side by side.
