# Home `featured-products`

Local design inputs (images are Git-ignored): `desktop.png`, `mobile.png`; dev results `dev-desktop.png`, `dev-mobile.png`, `dev-collection-badges.png`.

Images deleted after the batch was committed (design workflow).

No new motion. New in the design: one badge per product card (top right of the media), a centred SHOP ALL link, a carousel of 4 per view on desktop and 1 or 2 on mobile, and no brand watermark.

## Badge defaults (theme settings)

Contrast computed with WCAG relative luminance (script in batch 6-S4 progress); all pairs ≥ 4.5:1.

| Pair | Background | Text | Ratio |
| --- | --- | --- | --- |
| Sale | `#C2410C` | `#FFFFFF` | 5.18:1 |
| Sold out | `#64748B` | `#FFFFFF` | 4.76:1 |
| Custom 1 | `#263D29` | `#FFFFFF` | 11.78:1 |
| Custom 2 | `#8B5A3C` | `#FFFFFF` | 5.79:1 |

Sale and custom 2 backgrounds were darkened from the mockup oranges/tans to meet 4.5:1.

## Per-scheme `badge_*` colours (unchanged)

Consumers: `snippets/css-variables.liquid` maps `badge_background_color`, `badge_label_color`, and `badge_border_color` to `--color-badge-background`, `--color-badge-foreground`, and `--color-badge-border`. Retirement is an open board question.

## Dev browser (2026-10-05)

- Home collections are blank → placeholder cards (no badges) unless a tab block temporarily points at a collection (R6 keyboard proof only).
- **Casual Knitted Shirt3** on `/collections/all` has eight images and numeric image navigation in the meta row (not a single-image card).
- Badge vs image navigation (bounding boxes, no overlap): at 1440×900 badge `(646,230,42×17)` vs nav `(626,190,70×25)`; at ~500×844 (Chrome min width) badge `(426,310,34×14)` vs nav `(398,272,69×22)`.
- Custom tags: **Blocked for data** on dev store (no matching product tags).
