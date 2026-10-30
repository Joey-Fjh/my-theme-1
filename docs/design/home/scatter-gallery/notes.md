# Scatter gallery — design notes

Local inputs (Git-ignored): `desktop.png`, `mobile.png`, `reference-alethia.png`.

Dev evidence (R10): `dev-desktop-enter.png`, `dev-desktop.png`, `dev-desktop-exit.png`, and the same three for mobile.

Images deleted after the batch was committed (design workflow).

## Reference remeasure (R12 corrected, 1440×900 desktop)

Sources: live trust block at [alethia.earth](https://www.alethia.earth/) — section **`.framer-1uyq7vj`** (unpinned; earlier notes incorrectly cited sticky **`.framer-iws7gr`**), plus local `reference-alethia-enter.png`, `reference-alethia-mid.png`, `reference-alethia.png`.

Scroll mapping on Alethia uses that block’s own scroll span (unpinned). The theme adapts with **`top bottom` → `bottom top`** on `.scatter-gallery__stage`.

| Progress | Visual (reference) | Card translate (desktop entry, px `x`/`y`, slots 1–8) | Scale / opacity | Statement | Stacking |
| --- | --- | --- | --- | --- | --- |
| **0** | Enter: packed toward centre, heavy overlap (`reference-alethia-enter.png`) | **299/241**, **62/240**, **−63/242**, **−269/106**, **−314/−207**, **−63/−203**, **73/−200**, **304/−50** | Opacity **1**; no card rotation | Static | Cards overlap each other and statement area |
| **0.25** | Entering toward layout | (interpolate toward identity) | — | — | — |
| **0.5** | Identity layout (`reference-alethia-mid.png`) | **Identity** (layout offsets ≈ **0/0**) | — | Centred | Cards around statement |
| **0.75** | Mid pass / plateau | **Identity** (same as 0.5) | — | — | — |
| **1** | Block leaving viewport | **Identity** on card transforms (reference does **not** add outward spread on cards) | — | — | — |

**User decision (step 8 look, not reference copy):** Ceylune keeps a **second phase** after the plateau — outward spread on exit (`spread` factors on `data-*`, timeline segment **0.68–1**). The reference holds card transforms at identity through the end of its pass.

**Plateau (theme):** enter **0–0.36**, hold **0.36–0.68**, spread **0.68–1** (see adapted values below).

**Adapted theme values (after table):**

| Token | Desktop | Mobile |
| --- | --- | --- |
| ScrollTrigger `start` / `end` | `top bottom` / **`bottom top`** | same |
| `scrub` | `0.85` | `0.85` |
| Gather factor (`data-gather-factor*`) | **1.08** | **0.88** |
| Spread factor (`data-spread-factor*`) | **0.24** | **0.16** |
| Enter duration (timeline) | **0.36** | same |
| Spread segment | **0.68–1** | same |
| Stacking | Heading **z-index 5**, slots **2** (statement stays on top when overlapping) | same |

## Theme motion values (prior single-phase — superseded by table above)

| Token | Desktop | Mobile |
| --- | --- | --- |
| ScrollTrigger `start` / `end` | `top bottom` / ~~`center center`~~ → **`bottom top`** | same |
| `scrub` | `0.85` | `0.85` |
| Gather factor | ~~`0.55`~~ → **1.08** | ~~`0.35`~~ → **0.88** |
| Spread factor | — → **0.24** | — → **0.16** |
| GSAP preload IO `rootMargin` | `${innerHeight}px` | same |
| Motion tween | gather → identity → spread (two segments + plateau) | same |

## Design measurement (verifier round 2, photo edges)

Stage = full design canvas. Desktop **1607×1010** (`aspect-ratio: 1607 / 1010`). Mobile **585×1238** (`aspect-ratio: 585 / 1238`).

Photo edges exclude brush marks (coordinator check 2026-10-05). Desktop slot **6** x **422–687**; mobile slot **4** x **37–278**; mobile slot **6** x **319–543**. Desktop slot **5** height from photo **223/1010 ≈ 22.08%**.

### Desktop slots (% of 1607×1010)

| Slot | left % | top % | width % | height % | Source |
| --- | ---: | ---: | ---: | ---: | --- |
| 1 | 4.29 | 8.02 | 16.74 | 33.07 | round 1 PNG |
| 2 | 29.50 | 18.12 | 15.25 | 17.62 | round 1 PNG |
| 3 | 57.31 | 6.34 | 16.68 | 35.15 | round 1 PNG |
| 4 | 78.41 | 24.65 | 14.37 | 23.07 | round 1 PNG |
| 5 | 7.41 | 52.28 | 14.93 | **22.08** | height recheck r2 |
| 6 | **26.26** | 57.52 | **16.49** | 35.35 | photo x 422–687 |
| 7 | 54.26 | 66.63 | 16.43 | 18.61 | round 1 PNG |
| 8 | 79.09 | 58.02 | 16.86 | 33.96 | round 1 PNG |

**Theme CSS (rounded):** `sections/scatter-gallery.liquid` — within ±1.5 pt of this table.

### Mobile slots (% of 585×1238)

| Slot | left % | top % | width % | height % | Source |
| --- | ---: | ---: | ---: | ---: | --- |
| 1 | 6.15 | 11.63 | 37.09 | 21.41 | round 1 PNG |
| 2 | 59.32 | 7.19 | 32.82 | 11.47 | round 1 PNG |
| 3 | 53.33 | 22.46 | 36.07 | 22.46 | round 1 PNG |
| 4 | **6.32** | 58.48 | **41.37** | 26.90 | photo x 37–278 |
| 5 | 56.24 | 59.61 | 32.14 | 15.19 | round 1 PNG |
| 6 | **54.53** | 81.02 | **38.46** | 12.92 | photo x 319–543 |

Slots 7–8 hidden on mobile.

### Statement (typography, verifier round 2)

| | Desktop | Mobile |
| --- | --- | --- |
| Text box (design px) | x **541–1067** of 1607 | x **40–545** of 585 |
| Box width % | **32.7%** (design); theme **40%** desktop / **92%** mobile for 3 lines | **~86%** design; theme **92%** |
| Box top % | **~46%** (top edge) | **~48.5%** (top edge) |
| Lines | **3** | **3** |
| Tier pair | `pc:heading-h2` / `max-pc:heading-h4` | same |
| Uppercase | section `{% stylesheet %}` on `.scatter-gallery__heading` | same |
| Line-fit lever (r2 fix) | Removed section `letter-spacing: -0.02em`; tier spacing applies. Dropped `translateY(-50%)`; **max-width 40%** (wider than design cap for theme font) | **max-width 92%**; **top 48.5%** |

### Per-slot `sizes` (from width % × ~page-width stage)

| Slot | `sizes` attribute |
| --- | --- |
| 1 | `(min-width: 768px) 17vw, 37vw` |
| 2 | `(min-width: 768px) 15vw, 33vw` |
| 3 | `(min-width: 768px) 17vw, 36vw` |
| 4 | `(min-width: 768px) 14vw, 41vw` |
| 5 | `(min-width: 768px) 15vw, 32vw` |
| 6 | `(min-width: 768px) 16vw, 39vw` |
| 7 | `(min-width: 768px) 16vw, 32vw` |
| 8 | `(min-width: 768px) 17vw, 44vw` |

## Reference (Alethia trust block, measured 2026-10-05)

- Engine: Framer Motion (no `window.gsap` on page).
- Pin: **no** (`position: relative` on ~1053px-tall block).
- Scrub feel: scroll-linked (Framer); theme uses **`scrub: 0.85`**, **`end: bottom top`**, gather/spread factors on `data-*` (see R10 table in this file).

**R11 placeholder (computed, R13):** desktop **border-radius 10px**; mobile **7.5px**; background `oklab(0.926956 -0.00187508 0.00122837)`; SVG line art stays **#000** (no `color` on `svg`).

`templates/index.json` uses eight empty image blocks → Shopify **placeholder SVGs** in dev.
