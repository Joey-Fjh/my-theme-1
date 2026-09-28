# Phase 2 ownership map (redo)

Baseline HEAD after `1bf75c6`. Skeleton `5191a50`.

## Class totals

| Class | Count |
| --- | ---: |
| F | 5 |
| FX | 8 |
| F+ | 29 |
| R | 95 |
| D | 17 |
| V | 4 |
| K | 58 |
| M | 3 |

Total rows: 219. Checked against the table by `scripts/derive-slices.js`.

## Part 1b — FX framework contracts (G1, G4)

**FX** = skeleton path, theme API differs; callers must migrate. **F** only when `git diff --no-index` is 0 lines (or hunk-by-hunk non-functional — none claimed here).

| File | Diff (+/− lines) | One-line API delta |
| --- | --- | --- |
| `layout/theme.liquid` | see Part 1 | Defer script graph + `window.__Theme__` bootstrap vs import map + single `type="module"` entry |
| `assets/base.js` | +487/−303 | Theme: `Components` + `Main.initAlpine` bulk register; skeleton: ESM `scanModules` / `data-module-id` |
| `assets/events.js` | +85/−81 | Both `ThemeEvents`; theme attaches `window.__Theme__.Events`, skeleton `export` only |
| `assets/https.js` | +279/−296 | Theme `window.__Theme__.ShopifyHttp`; skeleton `ShopifyHttp` / `SectionRefresher` exports |
| `assets/alpine.store.cart.js` | +197/−66 | Theme IIFE store + hydrate; skeleton `alpine.store.cart.js` via adapter + `cart.contract.js` |
| `assets/quantity-constraints.js` | +190/−140 | Theme `__Theme__.QuantityConstraints` incl. `fromCartItem`, `nextValidTotal`, `largestValidTotal`; skeleton ESM `export default` without those |
| `assets/utils.js` | +90/−53 | Theme globals on `__Theme__.Utils`; skeleton ESM exports |
| `assets/performance.js` | +42/−31 | Theme `ThemePerformance` on `__Theme__`; skeleton module hook |

### `assets/quantity-constraints.js` (FX) — API table (a)

| Symbol | Skeleton (`5191a50`) | Theme (HEAD) |
| --- | --- | --- |
| `resolve` / `fromVariant` / `cartQuantityForVariant` | both | both |
| `fromCartItem` | — | theme only (`quantity-constraints.js:167-193`) |
| `nextValidTotal` / `largestValidTotal` | — | theme only (`quantity-constraints.js:40-50`, api object `195-201`) |
| `window.__Theme__.QuantityConstraints` | — | theme only (`quantity-constraints.js:204`) |
| `export default api` | skeleton only | theme also `module.exports` |

**(b) Theme-only callers:** `rg -n "QuantityConstraints" assets` → `assets/alpine.components.overlays.js:876` (cart line qty); `assets/alpine.components.product.js` (variant qty). **(c) Destinations:** port helpers into skeleton ESM `quantity-constraints.js` (phase 3 FX merge); update cart/product modules to `import` (slice 1).

### `assets/base.js` (FX) — API table (a)

| Symbol | Skeleton | Theme |
| --- | --- | --- |
| `Base` layout CSS vars | yes | yes (`base.js:67-82`) |
| `scanModules` / dynamic `import()` | skeleton | — |
| `Components` registry + `data-component-type` | — | theme (`base.js:128-451`) |
| `Main.initAlpine` + `Factory.register` | — | theme (`base.js:454-540`) |
| `window.__Theme__.Components` | — | theme |

**(b) Theme-only:** `Components` → `rg -n "data-component-type" sections` (7 sections, see `logic-migration.md` §Components.register). `Factory.register` → all `x-data` factories in `logic-migration.md`. **(c)** Adopt skeleton `base.js`; move `Components` carousels to per-section `data-module-id` modules (slice 2–4); move Alpine registrations to feature modules per logic-migration.

### `assets/events.js`, `assets/https.js`, `assets/alpine.store.cart.js`, `layout/theme.liquid`

See diff stats in Part 1 entries. **Destination:** phase 3 imports skeleton modules; rewire theme call sites from `window.__Theme__.*` to ESM imports (`events`, `https`, `cart-contract`, `alpine.store.cart.js` FX merge). **Intersect/Swiper load order:** `phase3-import.md`.

## Part 1 — Same-name content review

Files: same path on `skeleton/main` and HEAD, content differs (52 files). Diff via `git diff --no-index` (skeleton blob vs working tree).

### `assets/alpine.store.cart.js`

Diff: +197 / -66 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F+** — F+: merge Ceylune cart UX onto skeleton cart store.)

- Skeleton: cart Alpine store via `alpine.adapter.js` (`javascript-runtime.md:16-17`).
- Theme: `$store.cart` hydrate + SectionRefresher usage (`alpine.store.cart.js` — CAP-05).

### `assets/base.css`

Diff: +72 / -28 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `assets/base.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `assets/base.js`

Diff: +487 / -303 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **R** — R: different program; adopt skeleton module core; migrate layout vars + registration list via `logic-migration.md`.)

- Skeleton `base.js`: ES module scanner, `data-module-id` lazy imports (`javascript-runtime.md:33-47`).
- Theme `base.js` embeds `Components` section runtime (`base.js:128-451`) and Alpine bulk `Factory.register` (`base.js:489-540`).
- Theme `Base` measures header/announcement CSS vars (`base.js:67-82`) — re-home on skeleton `base.js` in phase 3.

### `assets/events.js`

Diff: +85 / -81 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F+** — F+: merge Ceylune event constants; keep single bus.)

- Skeleton: ThemeEvents module for cross-component bus.
- Theme: extended event name constants for product/cart — merge into skeleton `events.js`.

### `assets/gift-card.css`

Diff: +243 / -6 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `assets/gift-card.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `assets/https.js`

Diff: +279 / -296 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F+** — F+: merge onto skeleton `https.js`.)

- Skeleton: `ShopifyHttp` + section render helpers.
- Theme: same contract with Ceylune endpoints — diff is implementation detail.

### `assets/performance.js`

Diff: +42 / -31 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F+** — F+: merge init hook into skeleton `base.js`.)

- Skeleton performance hooks.
- Theme `ThemePerformance.init` called from `base.js:456`.

### `assets/quantity-constraints.js`

Diff: +190 / -140 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F** — F: immaterial diff.)

- Shared quantity rules snippet contract.
- Diff is formatting/comments only per diff stat — no new merchant contract.

### `assets/tailwind.output.css`

Diff: +10509 / -583 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `assets/tailwind.output.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `assets/utils.js`

Diff: +90 / -53 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F+** — F+: merge utilities still referenced after D removal.)

- Skeleton shared utilities.
- Theme adds helpers used by legacy Alpine factories — port callers to modules during phase 4.

### `config/settings_schema.json`

Diff: +948 / -38 lines.

Classification: **F+** — F+: skeleton base + retain theme-only IDs (**USER DECISION** to remove any).

- Skeleton: ~29 global setting IDs (typography/color/social).
- Theme adds 54 theme-only IDs (motion, toast, cart_type, component tokens) — `settings-schema.md`.

### `layout/password.liquid`

Diff: +1 / -1 lines.

Classification: **F+** — F+: align with skeleton password shell after verifying asset includes.

- Skeleton: minimal password layout shell.
- Theme adds same global CSS/JS includes as storefront (`layout/password.liquid` script tags).

### `layout/theme.liquid`

Diff: +57 / -43 lines.

Classification: **FX** — superseded; see Part 1b for the API table and caller migration. (Part 1 first pass read: **F+** — F+: keep skeleton load order; merge Ceylune motion/cart `data-*` and defer removal per phase 3.)

- Skeleton: import-map module entry + `vendor-alpine.min.js` after `base.js` (`git show skeleton/main:layout/theme.liquid` ~script block).
- Theme adds defer graph for `alpine.components.*`, stores, motion (`layout/theme.liquid:32-60`).
- Theme emits motion policy on `<body>` (`layout/theme.liquid:73-82`) — merge onto skeleton layout in phase 3.

### `locales/en.default.json`

Diff: +258 / -29 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `locales/en.default.json`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `locales/en.default.schema.json`

Diff: +1578 / -75 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `locales/en.default.schema.json`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/404.liquid`

Diff: +160 / -10 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/404.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/article.liquid`

Diff: +568 / -177 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/article.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/blog.liquid`

Diff: +361 / -49 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/blog.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/cart.liquid`

Diff: +525 / -185 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/cart.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/collection.liquid`

Diff: +944 / -49 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/collection.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/collections.liquid`

Diff: +266 / -29 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/collections.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/custom-liquid.liquid`

Diff: +30 / -2 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/custom-liquid.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/footer.liquid`

Diff: +262 / -29 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/footer.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/header.liquid`

Diff: +661 / -63 lines.

Classification: **R** — Ceylune mega-menu, super-menu settings, and `$store.dialog` cart/menu integration; skeleton header is reference only.

- Skeleton: minimal header section scaffold.
- Theme: `x-data="stickyHeader"` and `$store.dialog` menu state (`sections/header.liquid:26-33`).
- Theme: `menu_type`, `super_menu_*`, `super_collection_*` schema settings (`merchant-references.md` header-group).

### `sections/main-page-contact.liquid`

Diff: +347 / -87 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/main-page-contact.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/page.liquid`

Diff: +16 / -3 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/page.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/password.liquid`

Diff: +103 / -46 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/password.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `sections/product.liquid`

Diff: +1376 / -119 lines.

Classification: **R** — Ceylune PDP block composition and `productLayout` Alpine stack; not an F+ merge.

- Skeleton: simpler product section baseline.
- Theme: gallery layout settings and block placement rules (`sections/product.liquid:1-40`, `49`).
- Theme: `x-data="productLayout"` drives variant/gallery/buy stack (`sections/product.liquid:49`; CAP-08).

### `sections/search.liquid`

Diff: +135 / -40 lines.

Classification: **R** — See bullets.

- Skeleton file provides baseline markup/contracts for `sections/search.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/accordion.liquid`

Diff: +184 / -62 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/accordion.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/buy-buttons.liquid`

Diff: +153 / -66 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/buy-buttons.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/country-localization.liquid`

Diff: +47 / -9 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/country-localization.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/css-variables.liquid`

Diff: +123 / -2 lines.

Classification: **F+** — F+: merge motion + component design tokens; keep settings-chain IDs.

- Skeleton: typography/color CSS variables from settings chain.
- Theme adds motion timing tokens (`snippets/css-variables.liquid:187` `settings.motion_speed`) and Ceylune component tokens (button/input/dialog/card).

### `snippets/header-dropdown-menu.liquid`

Diff: +88 / -42 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/header-dropdown-menu.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/icons.liquid`

Diff: +13 / -3 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/icons.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/image.liquid`

Diff: +32 / -18 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/image.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/language-localization.liquid`

Diff: +18 / -9 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/language-localization.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/loading.liquid`

Diff: +23 / -5 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/loading.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/localization-option.liquid`

Diff: +22 / -20 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/localization-option.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/localization-selected-icon.liquid`

Diff: +1 / -1 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/localization-selected-icon.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/localization-switcher.liquid`

Diff: +1 / -34 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/localization-switcher.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/pagination.liquid`

Diff: +88 / -66 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/pagination.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/product-gallery.liquid`

Diff: +110 / -18 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/product-gallery.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/product-media.liquid`

Diff: +132 / -30 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/product-media.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/product-variant-picker.liquid`

Diff: +227 / -153 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/product-variant-picker.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `snippets/quantity-selector.liquid`

Diff: +146 / -130 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `snippets/quantity-selector.liquid`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `tailwind/tailwind.animates.css`

Diff: +1409 / -22 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `tailwind/tailwind.animates.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `tailwind/tailwind.components.css`

Diff: +1424 / -51 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `tailwind/tailwind.components.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `tailwind/tailwind.elements.css`

Diff: +880 / -20 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `tailwind/tailwind.elements.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `tailwind/tailwind.input.css`

Diff: +44 / -19 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `tailwind/tailwind.input.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `tailwind/tailwind.typography.css`

Diff: +73 / -24 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `tailwind/tailwind.typography.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).

### `tailwind/tailwind.utilities.css`

Diff: +157 / -8 lines.

Classification: **F+** — See bullets.

- Skeleton file provides baseline markup/contracts for `tailwind/tailwind.utilities.css`.
- Theme diff adds Ceylune-specific settings, classes, or Alpine usage (inspect diff).


## Rows

| Path | Class | Reason | CAP | Merchant refs | Depends on F | Slice |
| --- | --- | --- | --- | --- | --- | --- |
| `layout/password.liquid` | F+ | F+: align with skeleton password shell after verifying asset includes. | CAP-17 | none | skeleton/main:layout/password.liquid @5191a50 | P3 |
| `layout/theme.liquid` | FX | Import-map vs defer graph; motion/cart body attrs preserved (Part 1b). | CAP-01 | none | skeleton/main:layout/theme.liquid, alpine.adapter.js, base.js | P3 |
| `assets/alpine.components.filters.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-12 | none | logic-migration.md (gate before delete) | after 3 |
| `assets/alpine.components.header.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-03 | none | logic-migration.md (gate before delete) | after 2 |
| `assets/alpine.components.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | INFRA | none | logic-migration.md (gate before delete) | after P3 |
| `assets/alpine.components.overlays.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-05,CAP-07 | none | logic-migration.md (gate before delete) | after 5 |
| `assets/alpine.components.pagination.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-12,CAP-14 | none | logic-migration.md (gate before delete) | after 5 |
| `assets/alpine.components.product-cards.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-11,CAP-12,CAP-13 | none | logic-migration.md (gate before delete) | after 2 |
| `assets/alpine.components.product-media.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-09 | none | logic-migration.md (gate before delete) | after 4 |
| `assets/alpine.components.product.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-08,CAP-10,CAP-18 | none | logic-migration.md (gate before delete) | after 1 |
| `assets/alpine.components.registry.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | INFRA | none | logic-migration.md (gate before delete) | after 5 |
| `assets/alpine.components.search.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-04 | none | logic-migration.md (gate before delete) | after 2 |
| `assets/alpine.components.ui.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-01,CAP-15,CAP-21,CAP-22 | none | logic-migration.md (gate before delete) | after 4 |
| `assets/alpine.store.cart.js` | FX | IIFE `$store.cart` + SectionRefresher vs skeleton adapter store (Part 1b). | CAP-05 | none | skeleton/main:assets/alpine.store.cart.js, cart.contract.js | P3 |
| `assets/alpine.store.dialog.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-21 | none | logic-migration.md (gate before delete) | after 0 |
| `assets/alpine.store.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | INFRA | none | logic-migration.md (gate before delete) | after 5 |
| `assets/alpine.store.registry.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | INFRA | none | logic-migration.md (gate before delete) | after 5 |
| `assets/alpine.store.toast.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-21 | none | logic-migration.md (gate before delete) | after 0 |
| `assets/base.css` | F+ | Same-name asset; merge or replace per Part 1. | CAP-15 | none | skeleton/main:assets/base.css @5191a50 | P3 |
| `assets/base.js` | FX | `Components` + Alpine bulk register vs module scanner (Part 1b). | INFRA | none | skeleton/main:assets/base.js, alpine.adapter.js | P3 |
| `assets/dialog-motion.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-21 | none | logic-migration.md (gate before delete) | after 0 |
| `assets/drawer-motion.js` | D | Legacy Alpine/Components runtime; delete after `logic-migration.md` destinations land. | CAP-21 | none | logic-migration.md (gate before delete) | after 0 |
| `assets/events.js` | FX | `window.__Theme__.Events` vs ESM `ThemeEvents` export. | INFRA | none | skeleton/main:assets/events.js | P3 |
| `assets/gift-card.css` | F+ | Same-name asset; merge or replace per Part 1. | CAP-15 | none | skeleton/main:assets/gift-card.css @5191a50 | P3 |
| `assets/gift-card.js` | F | `git show` byte-equal; diff 0 lines (`git diff --no-index` on blobs). | CAP-18 | none | skeleton/main:assets/gift-card.js (identical) | P3 |
| `assets/https.js` | FX | Global `ShopifyHttp` vs ESM `ShopifyHttp` / `SectionRefresher`. | INFRA | none | skeleton/main:assets/https.js | P3 |
| `assets/icon-3d-model.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-account.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-arrow.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-arrow1.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-arrow2.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-cart.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-check-circle.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-check.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-chevron-down.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-chevron-left.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-chevron-right.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-chevron-up.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-close.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-acorn.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-airplane.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-calendar-blank.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-chat.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-check.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-clock.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-currency-circle-dollar.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-drop-slash.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-gift.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-globe.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-heart.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-leaf.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-lightning.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-map-pin.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-package.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-phone.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-smiley.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-stool.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-tag.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-content-truck.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-eye.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-eyeglasses.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-facebook.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-filter.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-info-circle.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-instagram.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-menu.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-minus.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-mute.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-pinterest.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-play.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-plus.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-search.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-snapchat.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-sortby.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-star.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-tiktok.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-trash.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-tumblr.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-twitter.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-unmute.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-vimeo.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-x-circle.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/icon-youtube.svg` | K | Static generated icon asset under `assets/`. | - | none | - | - |
| `assets/performance.js` | FX | `ThemePerformance` global vs skeleton module. | INFRA | none | skeleton/main:assets/performance.js | P3 |
| `assets/quantity-constraints.js` | FX | Extra cart/grid APIs on `__Theme__.QuantityConstraints` (Part 1b). | INFRA | none | skeleton/main:assets/quantity-constraints.js | P3 |
| `assets/tailwind.output.css` | K | Generated Tailwind build output; rebuild via `npm.cmd run build:tw`. | - | none | - | - |
| `assets/utils.js` | FX | `__Theme__.Utils` vs ESM exports. | INFRA | none | skeleton/main:assets/utils.js | P3 |
| `assets/vendor-alpine-intersect.min.js` | V | Vendored library; keep with notice (board: Swiper retained). | CAP-01 | none | layout/theme.liquid | P3 |
| `assets/vendor-alpine.min.js` | V | Vendored Alpine 3.x; classic `defer` after `base.js` (skeleton load order). Not byte-classified as **F** — third-party payload. | CAP-01 | none | skeleton/main:layout/theme.liquid script order | P3 |
| `assets/vendor-swiper.min.css` | V | Vendored Swiper 12.1.2 styles; loaded on demand by the `carousel-swiper.js` adapter (`phase3-import.md` §Swiper). | CAP-22 | none | carousel-swiper.js (new adapter) | P3 |
| `assets/vendor-swiper.min.js` | V | Vendored Swiper 12.1.2 classic bundle, kept unchanged; loaded on demand by the `carousel-swiper.js` adapter; the layout defer tag goes in phase 3 (`phase3-import.md` §Swiper). | CAP-22 | none | carousel-swiper.js (new adapter) | P3 |
| `tailwind/tailwind.animates.css` | F+ | Same-name Tailwind source; merge Ceylune tokens/motion into skeleton layers. | CAP-01 | none | skeleton/main:tailwind/tailwind.animates.css @5191a50 | P3 |
| `tailwind/tailwind.components.css` | F+ | Same-name Tailwind source; merge Ceylune tokens/motion into skeleton layers. | CAP-01 | none | skeleton/main:tailwind/tailwind.components.css @5191a50 | P3 |
| `tailwind/tailwind.elements.css` | F+ | Same-name Tailwind source; merge Ceylune tokens/motion into skeleton layers. | CAP-01 | none | skeleton/main:tailwind/tailwind.elements.css @5191a50 | P3 |
| `tailwind/tailwind.input.css` | F+ | Same-name Tailwind source; merge Ceylune tokens/motion into skeleton layers. | CAP-01 | none | skeleton/main:tailwind/tailwind.input.css @5191a50 | P3 |
| `tailwind/tailwind.snippets.css` | R | Theme-only snippet CSS; reconcile in slice 5. | CAP-01 | none | skeleton Tailwind layers + slice 5 | 5 |
| `tailwind/tailwind.typography.css` | F+ | Same-name Tailwind source; merge Ceylune tokens/motion into skeleton layers. | CAP-01 | none | skeleton/main:tailwind/tailwind.typography.css @5191a50 | P3 |
| `tailwind/tailwind.utilities.css` | F+ | Same-name Tailwind source; merge Ceylune tokens/motion into skeleton layers. | CAP-01 | none | skeleton/main:tailwind/tailwind.utilities.css @5191a50 | P3 |
| `snippets/accordion.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-15,CAP-21 | none | skeleton/main:snippets/accordion.liquid @5191a50 | P3 |
| `snippets/active-filters.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/buy-buttons.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-08,CAP-10 | none | skeleton/main:snippets/buy-buttons.liquid @5191a50 | P3 |
| `snippets/cart-summary-accordion.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-05 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/content-icon.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/country-localization.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-20 | none | skeleton/main:snippets/country-localization.liquid @5191a50 | P3 |
| `snippets/css-variables.liquid` | F+ | F+: merge motion + component design tokens; keep settings-chain IDs. | CAP-01 | none | skeleton/main:snippets/css-variables.liquid @5191a50 | P3 |
| `snippets/filter-horizontal.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/filter-vertical.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/filters-drawer.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/filters-field.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/filters-groups.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/flip-digit.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 4 |
| `snippets/gift-card-recipient-form.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-18 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/grid-feature-card.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 4 |
| `snippets/header-dropdown-menu.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-03 | none | skeleton/main:snippets/header-dropdown-menu.liquid @5191a50 | P3 |
| `snippets/header-dropdown-super-menu.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-03 | none | base.js, alpine.adapter.js + slice module | 2 |
| `snippets/header-mobile-menu-drawer.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-03 | none | base.js, alpine.adapter.js + slice module | 2 |
| `snippets/icon-with-text-item.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/icons.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | INFRA | none | skeleton/main:snippets/icons.liquid @5191a50 | P3 |
| `snippets/image-lightbox.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/image-magnifier.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/image.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | INFRA | none | skeleton/main:snippets/image.liquid @5191a50 | P3 |
| `snippets/language-localization.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-20 | none | skeleton/main:snippets/language-localization.liquid @5191a50 | P3 |
| `snippets/link.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | INFRA | none | base.js, alpine.adapter.js + slice module | 0 |
| `snippets/listing-page-hero-copy.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-14 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/loading.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-21 | none | skeleton/main:snippets/loading.liquid @5191a50 | P3 |
| `snippets/localization-option.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-20 | none | skeleton/main:snippets/localization-option.liquid @5191a50 | P3 |
| `snippets/localization-selected-icon.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-20 | none | skeleton/main:snippets/localization-selected-icon.liquid @5191a50 | P3 |
| `snippets/localization-switcher.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-20 | none | skeleton/main:snippets/localization-switcher.liquid @5191a50 | P3 |
| `snippets/media-video.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 4 |
| `snippets/meta-tags.liquid` | F | Byte-identical to `skeleton/main`. | CAP-01 | none | skeleton/main:snippets/meta-tags.liquid (identical) | P3 |
| `snippets/pagination.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-12,CAP-14 | none | skeleton/main:snippets/pagination.liquid @5191a50 | P3 |
| `snippets/pickup-availability-inline.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/predictive-search-product-card.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-04 | none | base.js, alpine.adapter.js + slice module | 2 |
| `snippets/product-card-price.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12,CAP-13 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-card-variant-panel.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12,CAP-13 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-card.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12,CAP-13 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-gallery-carousel.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-gallery-grid.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-gallery-stacked.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-gallery-thumbnails.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-gallery.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-09 | none | skeleton/main:snippets/product-gallery.liquid @5191a50 | P3 |
| `snippets/product-info-blocks.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08,CAP-10 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-info-share.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-media-modal.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-09 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-media.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-09 | none | skeleton/main:snippets/product-media.liquid @5191a50 | P3 |
| `snippets/product-purchase-stack.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08,CAP-10 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-quick-view.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12,CAP-13 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-recommendations-section.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-11 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/product-tax-note.liquid` | F | Byte-identical to `skeleton/main`. | CAP-08 | none | skeleton/main:snippets/product-tax-note.liquid (identical) | P3 |
| `snippets/product-variant-picker.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-08,CAP-10 | none | skeleton/main:snippets/product-variant-picker.liquid @5191a50 | P3 |
| `snippets/product-variants-quantity-json.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/quantity-constraints.liquid` | F | Byte-identical to `skeleton/main`. | CAP-21 | none | skeleton/main:snippets/quantity-constraints.liquid (identical) | P3 |
| `snippets/quantity-selector.liquid` | F+ | Same-name snippet; merge Ceylune markup/tokens onto skeleton snippet. | CAP-08,CAP-21 | none | skeleton/main:snippets/quantity-selector.liquid @5191a50 | P3 |
| `snippets/quick-view-buy-actions.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12,CAP-13 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/rotating-badge.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/rte-compact-prose.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-14 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/search-predictive-panel.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-04 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/search-results-tabs.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-13 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/selling-plan-picker.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/show-more-icon.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/social-icons.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-02,CAP-06 | none | base.js, alpine.adapter.js + slice module | 2 |
| `snippets/sort-by-dropdown.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | none | base.js, alpine.adapter.js + slice module | 3 |
| `snippets/starts.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 1 |
| `snippets/tab-control.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-13,CAP-21 | none | base.js, alpine.adapter.js + slice module | 2 |
| `snippets/ui-dialog.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-21 | none | base.js, alpine.adapter.js + slice module | 0 |
| `snippets/ui-toast.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-21 | none | base.js, alpine.adapter.js + slice module | 0 |
| `snippets/unit-price.liquid` | F | Byte-identical to `skeleton/main`. | CAP-08 | none | skeleton/main:snippets/unit-price.liquid (identical) | P3 |
| `snippets/watermark.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | none | base.js, alpine.adapter.js + slice module | 2 |
| `sections/404.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-19 | type: 404 | base.js, alpine.adapter.js + slice module | 5 |
| `sections/about-stats.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: about-stats | base.js, alpine.adapter.js + slice module | 4 |
| `sections/announcement-bar.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-02,CAP-22 | type: announcement-bar; blocks: announcement | base.js, alpine.adapter.js + slice module | 2 |
| `sections/article.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-14 | type: article | base.js, alpine.adapter.js + slice module | 5 |
| `sections/before-after-comparison.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: before-after-comparison | base.js, alpine.adapter.js + slice module | 4 |
| `sections/blog-stories.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: blog-stories | base.js, alpine.adapter.js + slice module | 4 |
| `sections/blog.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-14 | type: blog | base.js, alpine.adapter.js + slice module | 5 |
| `sections/brand-statement.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: brand-statement | base.js, alpine.adapter.js + slice module | 4 |
| `sections/cart-overlay.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-05 | type: cart-overlay; blocks: none | base.js, alpine.adapter.js + slice module | 1 |
| `sections/cart.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-05 | type: cart; blocks: none | base.js, alpine.adapter.js + slice module | 1 |
| `sections/category-grid.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: category-grid | base.js, alpine.adapter.js + slice module | 4 |
| `sections/collection-navigation-items.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-12 | type: collection-navigation-items | base.js, alpine.adapter.js + slice module | 3 |
| `sections/collection.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-12 | type: collection; blocks: none | base.js, alpine.adapter.js + slice module | 3 |
| `sections/collections.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-12 | type: collections | base.js, alpine.adapter.js + slice module | 3 |
| `sections/custom-liquid.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-15 | type: custom-liquid | base.js, alpine.adapter.js + slice module | 4 |
| `sections/featured-product.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-10 | type: featured-product | base.js, alpine.adapter.js + slice module | 1 |
| `sections/featured-products.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15,CAP-22 | type: featured-products | base.js, alpine.adapter.js + slice module | 4 |
| `sections/footer-group.json` | M | Merchant-owned section group JSON; consult only (`docs/agent/context.md` scope). | - | type: footer; blocks: link_column | - | - |
| `sections/footer.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-06 | type: footer; blocks: link_column | base.js, alpine.adapter.js + slice module | 5 |
| `sections/google-map.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: google-map | base.js, alpine.adapter.js + slice module | 4 |
| `sections/header-group.json` | M | Merchant-owned section group JSON; consult only (`docs/agent/context.md` scope). | - | types: announcement-bar, header; blocks: announcement | - | - |
| `sections/header.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-03 | type: header; blocks: none | base.js, alpine.adapter.js + slice module | 2 |
| `sections/icon-with-text.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15,CAP-22 | type: icon-with-text | base.js, alpine.adapter.js + slice module | 4 |
| `sections/main-page-about.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-16 | type: main-page-about | base.js, alpine.adapter.js + slice module | 5 |
| `sections/main-page-contact.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-16 | type: main-page-contact | base.js, alpine.adapter.js + slice module | 5 |
| `sections/newsletter-banner.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-07 | type: newsletter-banner | base.js, alpine.adapter.js + slice module | 5 |
| `sections/newsletter-overlay.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-07 | type: newsletter-overlay | base.js, alpine.adapter.js + slice module | 5 |
| `sections/overlay-group.json` | M | Merchant-owned section group JSON; consult only (`docs/agent/context.md` scope). | - | types: search-overlay, cart-overlay, newsletter-overlay; blocks: text, heading, form | - | - |
| `sections/page.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-15 | type: page | base.js, alpine.adapter.js + slice module | 4 |
| `sections/password-footer.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-17 | type: password-footer | base.js, alpine.adapter.js + slice module | 5 |
| `sections/password-header.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-17 | type: password-header | base.js, alpine.adapter.js + slice module | 5 |
| `sections/password.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-17 | type: password | base.js, alpine.adapter.js + slice module | 5 |
| `sections/philosophy-section.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: philosophy-section | base.js, alpine.adapter.js + slice module | 4 |
| `sections/pickup-availability.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08 | type: pickup-availability | base.js, alpine.adapter.js + slice module | 1 |
| `sections/product-comparison-table.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-08 | type: product-comparison-table | base.js, alpine.adapter.js + slice module | 1 |
| `sections/product-recommendations.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-11 | type: product-recommendations | base.js, alpine.adapter.js + slice module | 1 |
| `sections/product.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-08,CAP-09 | type: product; blocks: vendor, title, variant_picker, buy_buttons, ... | base.js, alpine.adapter.js + slice module | 1 |
| `sections/promise-section.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: promise-section | base.js, alpine.adapter.js + slice module | 4 |
| `sections/promo-bannder.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: promo-bannder | base.js, alpine.adapter.js + slice module | 4 |
| `sections/promotion-countdown.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: promotion-countdown | base.js, alpine.adapter.js + slice module | 4 |
| `sections/routine-showcase.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15,CAP-22 | type: routine-showcase | base.js, alpine.adapter.js + slice module | 4 |
| `sections/scroll-categories.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: scroll-categories | base.js, alpine.adapter.js + slice module | 4 |
| `sections/scrolling-icon-with-text.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: scrolling-icon-with-text | base.js, alpine.adapter.js + slice module | 4 |
| `sections/search-overlay.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-04 | type: search-overlay; blocks: none | base.js, alpine.adapter.js + slice module | 2 |
| `sections/search.liquid` | R | Business section; rewrite under module model (skeleton same-name is reference). | CAP-13 | type: search | base.js, alpine.adapter.js + slice module | 3 |
| `sections/slides-show.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15,CAP-22 | type: slides-show | base.js, alpine.adapter.js + slice module | 4 |
| `sections/testimonial-featured.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15,CAP-22 | type: testimonial-featured | base.js, alpine.adapter.js + slice module | 4 |
| `sections/video-banner.liquid` | R | Theme-only business surface; rewrite per `phase4-slices.md`. | CAP-15 | type: video-banner | base.js, alpine.adapter.js + slice module | 4 |
| `locales/en.default.json` | F+ | Merge locale keys (see `locales.md`); retain theme namespaces. | CAP-01,CAP-14 | none | skeleton/main:locales/en.default.json @5191a50 | P3 |
| `locales/en.default.schema.json` | F+ | Merge locale keys (see `locales.md`); retain theme namespaces. | CAP-01,CAP-14 | none | skeleton/main:locales/en.default.schema.json @5191a50 | P3 |
| `config/settings_schema.json` | F+ | F+: skeleton base + retain theme-only IDs (**USER DECISION** to remove any). | CAP-01 | none | skeleton/main:config/settings_schema.json @5191a50 | P3 |
