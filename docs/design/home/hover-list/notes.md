# Hover list (scroll-categories)

Design references: `desktop.png`, `mobile.png`, `reference-himon.png` (local, Git-ignored).

## Himon Services reference (2026-10-05)

| Signal | Measured | Theme adaptation |
| --- | --- | --- |
| Inactive rows | Row wrapper `opacity: 0.3` | `.scroll-categories__row.is-inactive { opacity: 0.3 }` |
| Active rows | Wrapper `opacity: 1`, text `rgb(28, 28, 28)` | Scheme foreground at full opacity |
| Panel image change | Single `<img>`, `src` swap (cut) | Opacity cross-fade between stacked detail panels (batch decision) |
| Pointer leave | Last hovered row stays active | `scrollCategories` does not reset on mouseleave |
| Transition timing | Computed `0s` on reference | `--motion-duration-fast` 250ms rows; `--motion-duration-base` 300ms panel opacity |

## Content

- Description excerpt: `truncatewords: 24` after `strip_html`.
- Count: zero-padded `min(products, max_items)`; placeholders use `max_items`.
- Panel link: uppercase `link` variant default + `icon-arrow2` (6-S4 Shop all pattern).

## Dev captures

- `dev-desktop.png` — row 1 active, **1440×900**
- `dev-desktop-hover.png` — row 3 active, **1440×900**
- `dev-mobile.png` — **390×844** (`deviceScaleFactor: 1`)

Round 1 fixes (2026-10-05): panel hide uses **`@media (min-width: 768px)`** in section CSS; grid **62.6% / 37.4%**; link label i18n assign pattern; mobile index stacked above title; ratios **513/371** desktop, **1/1** mobile.

Images deleted after the batch was committed (design workflow).
