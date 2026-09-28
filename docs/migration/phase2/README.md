# Phase 2 — file ownership map

Skeleton `5191a50` (remote `skeleton`) versus this theme after `1bf75c6`. Plan and review history: `docs/agent/context.md`.

## Deliverables

| File | Holds |
| --- | --- |
| `ownership-map.md` | Class, reason, CAP, merchant refs, F dependencies, and slice for every in-scope file (219); Part 1/1b hold same-name content comparisons and the FX API tables |
| `logic-migration.md` | Every registered component, store, and `Components.register` section script: definition, Liquid consumers, destination, CAP, slice; D-file deletion gates |
| `phase3-import.md` | Phase 3 import order, vendor loading (Alpine Intersect side-effect import, Swiper classic build behind the `carousel-swiper.js` adapter), storefront availability between steps |
| `phase4-slices.md` | Derived slice lists (generated, do not hand-edit) |
| `settings-schema.md` | Setting IDs: skeleton 29, theme 83, theme-only 54, with merchant and Liquid references |
| `locales.md` | Locale key comparison; no value conflicts on shared paths |

## Class counts

| Class | Meaning | Count |
| --- | --- | ---: |
| F | Skeleton file as is (byte-identical) | 5 |
| FX | Skeleton file; theme API differs, callers migrate (API table in Part 1b) | 8 |
| F+ | Skeleton file as base, theme additions merged | 29 |
| R | Business file rewritten under skeleton contracts | 95 |
| D | Deleted once every registered item has landed at its destination | 17 |
| V | Vendored library | 4 |
| K | Static or generated asset kept as is (icons) | 58 |
| M | Merchant-owned, out of migration scope (`sections/*-group.json`) | 3 |
| **Total** | | **219** |

## Slices (derived)

CAP IDs come from the phase 0 coverage matrix and slices from the rule in `phase4-slices.md`; `scripts/derive-slices.js` computes both and writes them into `ownership-map.md`, `logic-migration.md`, and `phase4-slices.md`. Slice assignment was taken over by the coordinator on 2026-09-28 after four correction rounds (see `docs/agent/context.md`).

| Step | Files | Components and stores |
| --- | ---: | ---: |
| Phase 3 (framework import, `P3`) | 46 | 10 |
| Slice 0 — domain-neutral shared UI | 3 | 6 |
| Slice 1 — product and cart | 32 | 13 |
| Slice 2 — navigation, search entry, localization | 9 | 5 |
| Slice 3 — collection and search listing, filters | 16 | 7 |
| Slice 4 — carousels and display sections | 23 | 4 |
| Slice 5 — the rest | 12 | 3 |

Notes:

- Components mounted by F+ snippets derive to phase 3 (`BuyButtons`, `QuantitySelector`, `VariantPicker`, `accordion`, `cart`, `dropdown`, `imageLightbox`, `localizationSwitcher`, `productGallery`), as does `AlpineComponentsFactory`, which `alpine.adapter.js` replaces: the skeleton ships these primitives, and the theme logic merges into them during phase 3, not in a later slice. The skeleton has no image lightbox module, so `imageLightbox` becomes a new module in phase 3. `phase3-import.md` lists them.
- Slice 0 is small by design: only files whose phase 0 CAPs are CAP-01, CAP-21, or INFRA, or that `layout/` renders, plus domain-neutral components (`motionRevealSection`, `dialog`, `dialogMotion`, `drawerMotion`, `toast`, `toastContainer`). Shared domain components follow their earliest consumer; later slices reuse them.
- Phase 0 matrix fix: `snippets/product-gallery-stacked.liquid` was missing from the snippet coverage matrix (69 rows under a "70 rows" heading); added as CAP-09 like its sibling gallery layouts.

## Checks

| # | Check | Command | Result |
| --- | --- | --- | --- |
| 1 | Every in-scope file appears once; counts equal `git ls-files` | row count against `git ls-files layout assets tailwind snippets sections locales` + `config/settings_schema.json` | 219 = 219 |
| 2 | CAP columns equal the phase 0 matrix (140 files); slice columns, `Components.register` rows, and class totals equal the derivation; no module lands after its markup; `phase4-slices.md` (slice lists, D-file deletion gates, dynamic renders) equals the rendering | `node docs/migration/phase2/scripts/derive-slices.js` | 0 errors |
| 3 | The check detects conflicts, ignores prose, and the D-file gate commands run | `node docs/migration/phase2/scripts/derive-slices.js --self-test`: table cells moved to slice 5; in memory into slice-1 `product-card.liquid`: `x-data` single-quoted, spaced, and unquoted, `$store['x']`, `$store?.x`; the same mount inside `{% comment %}` and `{% doc %}` (must not count); every printed `git grep` gate command runs and covers every derived mount | 6 of 6 conflicts reported; comment case 0 errors; gates cover all mounts (one mention-only extra: `snippets/search-predictive-panel.liquid` doc block) |
| 4 | Every CAP-01..CAP-22 has an R, F+, or FX carrier | `node docs/migration/phase2/scripts/check-cap-carriers.js` | missing none |
| 5 | Merchant setting references rescanned (JSONC: `settings_data.json` current and presets, templates, section groups) | `node docs/migration/phase2/scripts/scan-settings-refs.js` | `reveal_behavior`, `toast_position`, `type_header_font`, `color_schemes` referenced |
| 6 | F rows are byte-identical to the skeleton | `git rev-parse HEAD:<path>` against `skeleton/main:<path>` | 5 of 5 |

## Limits of the derivation

- Two dynamic renders (`render block` in `snippets/product-info-blocks.liquid`) cannot be resolved statically; `phase4-slices.md` lists them.
- Doc, comment, and HTML comment blocks are ignored. Mounts are found by `x-data` (any quoting, optional spaces around `=`), `$store?.name` as well as `$store.name` / `$store['name']`, and `Components.register`; components wired only from JavaScript derive no slice from Liquid and would be listed under "Components with no Liquid mount found" (none at present).

## Open questions

0. Migration stop-loss point: open on `docs/agent/board.md` (to settle before phase 4). This batch does not decide it; the slice order above is where a stop-loss would cut.
1. Theme-only settings (54 IDs, most referenced by Liquid or merchant JSON): which stay global and which move to section settings. Every rename or removal of a referenced ID is a USER DECISION (`settings-schema.md`).
2. `locales/en.default.schema.json`: merge at phase 3 with the skeleton schema keys, or per slice as each section's schema is rewritten.

## Recommendation for the board item "Old CSS structure conventions"

Carry the still-valid theme rules (motion exclusions, WebKit guards, newsletter scoping) as a theme-only allowlist in the new validators after the phase 3 Tailwind merge, rather than restoring the deleted `css-layer-allowlist.json`; treat `tailwind/tailwind.snippets.css` as slice 5 debt. Recommendation only; the decision stays on the board.
