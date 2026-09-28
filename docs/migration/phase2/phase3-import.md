# Phase 3 — framework import plan (not executed)

Skeleton source: `5191a50` on remote `skeleton` (`git show skeleton/main:<path>`). Theme baseline: HEAD after `1bf75c6`. This document is ordering and expected validator movement only.

## Goals

1. Replace the defer-script + `AlpineComponentsFactory` graph with the skeleton import-map module graph (`docs/references/architecture/javascript-runtime.md:23-31`).
2. Land skeleton **F** and merged **F+** shell files without rewriting **R** business sections yet (storefront may be broken until phase 4).
3. Remove **D** runtime files once nothing in the static graph references them (`ownership-map.md` D rows).
4. Keep **V** vendored libraries; mount Swiper under the module model through the `carousel-swiper.js` adapter that loads the vendored classic build on demand (board: Swiper retained, `docs/agent/board.md:19`).

## Preconditions

- Phase 2 ownership map accepted.
- `npm ci` already satisfied from phase 1.
- Record skeleton commit and path list per import (`docs/project.md:22`); no `git merge skeleton/main`.

## Import order

| Step | Action | Paths (representative) | Depends on | Expected `lint:theme` effect |
| --- | --- | --- | --- | --- |
| 0 | Baseline probe (read-only, already run) | — | — | ~343 findings in 96 files (`docs/agent/board.md:23`) |
| 1 | Import map + core static graph | `layout/theme.liquid` (skeleton base + merge motion `data-*` from theme `layout/theme.liquid:73-82`), `assets/base.js`, `assets/events.js`, `assets/alpine.adapter.js`, `assets/https.js`, `assets/utils.js`, `assets/cart.contract.js`, `assets/alpine.store.cart.js` | — | Missing `data-module-id` count should drop on touched roots; new failures on Alpine-in-attribute patterns in untouched **R** sections remain |
| 2 | Feature modules (skeleton-only **F** imports) | `assets/accordion.js`, `alpine.adapter.js` (if not step 1), `buy-buttons.js`, `cart-page.js`, `dropdown.js`, `localization-switcher.js`, `product-gallery.js`, `quantity-selector.js`, `section-pagination.js`, `variant-picker.js` | Step 1 import map entries | Adapter-only Alpine API violations should not increase; modules without markup references may trigger unused-map lint until phase 4 |
| 3 | Token + CSS shell (**F+**) | `snippets/css-variables.liquid`, `tailwind/tailwind.*.css` (except theme-only `tailwind/tailwind.snippets.css` retained until slice 5), `assets/base.css`, `assets/tailwind.output.css` via `npm.cmd run build:tw` after Tailwind merge | Step 1 | `settings-chain-*` findings shift toward **R** sections still bypassing chain |
| 4 | Shared snippets (**F+**) | `snippets/image.liquid`, `snippets/price.liquid`, `snippets/quantity-selector.liquid`, `snippets/buy-buttons.liquid`, … (see `ownership-map.md` F+ rows) | Steps 1–2 module IDs referenced by snippets | Liquid-in-Alpine errors persist in unmigrated **R** sections |
| 5 | Locales + settings schema (**F+**) | `locales/en.default.json`, `locales/en.default.schema.json`, `config/settings_schema.json` | Merchant motion IDs preserved (`docs/project.md:38-39`); theme-only IDs → **USER DECISION** (`settings-schema.md`) | `lint:i18n` may report new skeleton keys until merge completes |
| 6 | Remove **D** script tags | The new `layout/theme.liquid` carries no defer tags for D assets. The 17 D files stay in the repository as the reference for their slices and are deleted per the generated gates in `phase4-slices.md` (§D-file deletion gates), not in phase 3 | Step 1 | Legacy defer tags → 0; features whose slice has not landed stay unavailable (table below) |
| 7 | **V** Swiper + Intersect | Swiper: classic build behind the `carousel-swiper.js` adapter (§Swiper); no global Swiper tag in `layout/theme.liquid`. Intersect: side-effect import from `base.js` (§Alpine Intersect) | Step 1 import map | `THIRD_PARTY_NOTICES.md` unchanged |
| 8 | Acceptance searches (phase 3 gate, `docs/project.md:42`) | `rg -n "new CustomEvent" assets --glob "*.js"` (only `events.js`); `rg -n "innerHTML\\s*=|outerHTML\\s*=|replaceWith\\(" assets sections snippets` (only SectionRefresher) | Steps 1–6 | Document command output in `context.md` when executed |

## `layout/theme.liquid` load model switch

| Current (theme) | Target (skeleton) | Evidence |
| --- | --- | --- |
| Many `defer` scripts for `alpine.components.*`, stores, motion helpers | Single `type="module"` entry `base.js` + import map + `vendor-alpine.min.js` after module | `javascript-runtime.md:25-29` vs `layout/theme.liquid:32-60` |
| `Components.register` lifecycle | `data-module-id` + dynamic `import()` | `javascript-runtime.md:33-47` |
| Body motion policy attributes | Preserve Ceylune contract on merged layout | `layout/theme.liquid:73-82`, `docs/project.md:38-39` |
| `vendor-swiper.min.js` defer on every page (`layout/theme.liquid:24`) | **Remove** the global tag; the `carousel-swiper.js` adapter (phase 3) loads the same file on demand | Skeleton layout loads only Alpine as a classic script (`AGENTS.md:16`) |

Gift card template stays outside the graph (`javascript-runtime.md:31`): `templates/gift_card.liquid` + `assets/gift-card.js` (**F**).

## Files explicitly not imported in phase 3

- All **R** `sections/*.liquid` and theme-only snippets (phase 4 slices).
- `sections/custom-section.liquid` on skeleton only — not imported (`docs/agent/context.md` scope note).
- Merchant-owned `sections/*-group.json`, `templates/*.json`, `config/settings_data.json` — never overwritten.

## Alpine Intersect (class **V**)

**Theme today:** `layout/theme.liquid` loads `vendor-alpine-intersect.min.js` before Alpine; the vendor file registers on `alpine:init` (`assets/vendor-alpine-intersect.min.js:1` — `document.addEventListener("alpine:init", () => { window.Alpine.plugin(o); })`).

**Skeleton contract:** import map → `type="module"` `base.js` → classic `vendor-alpine.min.js` after the module entry (`javascript-runtime.md` §Script Load Order).

**Phase 3 plan:** In `assets/base.js`, add a side-effect import of the vendored intersect file (same path `assets/vendor-alpine-intersect.min.js` or a copied ESM wrapper if needed):

```javascript
import "./vendor-alpine-intersect.min.js";
```

No `Alpine.plugin(...)` call in theme code: the vendor bundle does not export a plugin function; it only listens for `alpine:init` and calls `window.Alpine.plugin(...)`. `base.js` runs before the classic Alpine script tag executes, so the listener is registered in time. Do **not** keep a separate defer tag for Intersect unless a future skeleton revision requires it.

## Swiper (class **V**) — classic build behind a carousel adapter

Decided 2026-09-28 (`docs/agent/context.md`), following the skeleton rule that a vendored library sits behind a project adapter and that `layout/theme.liquid` loads only one classic script (Alpine) (`AGENTS.md:16`, `AGENTS.md:20`).

**Why not an ESM build:** Swiper 12.1.2 ships no self-contained ES module. `swiper-bundle.mjs` and `swiper-bundle.min.mjs` (about 1.8 KB) import `./modules/*.mjs`; `swiper-element-bundle.min.mjs` imports `./shared/*.mjs` (checked in the npm package on 2026-09-28). The flat `assets/` directory cannot hold those relative paths, and a bundling step would add a build tool to a no-bundler architecture. The current `assets/vendor-swiper.min.js` is the classic bundle (`var Swiper=function(){…}()`), which exports nothing through the import map.

**Plan:**

| Item | Value |
| --- | --- |
| Vendored JS | `assets/vendor-swiper.min.js` unchanged (Swiper 12.1.2, classic bundle); no edit, no rename |
| Vendored CSS | `assets/vendor-swiper.min.css` unchanged |
| Adapter | New module `assets/carousel-swiper.js` (import-map specifier `carousel-swiper`). It exports an async `loadSwiper()` that, on first call, appends one `<script src="{{ 'vendor-swiper.min.js' \| asset_url }}">` and one stylesheet link, resolves with `window.Swiper`, and caches the promise; later calls reuse it. The asset URLs reach the module through `data-*` on the section root or an import-map entry, not hard-coded paths. It also exports `createSwiper(el, options)` and `destroySwiper(instance)` so section modules share mount and cleanup |
| Consumers | Only carousel section modules (`announcement-bar.js`, `slides-show.js`, `featured-products.js`, `routine-showcase.js`, `testimonial-featured.js`, `icon-with-text.js`) and the product gallery carousel layout. Not `base.js`, not `layout/theme.liquid` |
| Timing | Phase 3: the product gallery carousel layout needs it there (F+ `snippets/product-gallery.liquid` mounts `productGallery`, which creates a Swiper instance today, `assets/alpine.components.product-media.js:185`). Slice 2 (announcement bar) and slice 4 (other carousels) reuse it |
| Lifecycle | Section modules create instances in `init()` and destroy them in `destroy()`; Theme Editor section load, unload, and block select follow the skeleton adapter mount/unmount and the handling recorded per section in `logic-migration.md` |
| Checks for the phase that lands the adapter | `lint:theme` accepts the script-injection side effect in this one module (confirm against the JS outlet rules in `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`; if it does not, record a `lint-allow` with its reason); pages without carousels request no Swiper file; carousels work with no layout-level Swiper tag |
| Removed | The `layout/theme.liquid` defer tag for `vendor-swiper.min.js` (phase 3) |

**`THIRD_PARTY_NOTICES.md`:** no change; the Swiper entry already lists `assets/vendor-swiper.min.js` and `assets/vendor-swiper.min.css` at 12.1.2.

## Storefront interactions by phase

| CAP | After phase 3 shell | After slice 0 | After slice 1 | After slice 2 | After slice 3 | After slice 4 | After slice 5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CAP-01 motion/tokens | Partial (FX merge) | Shared UI modules | Improved PDP/cart | Header shell | Listing | Marketing motion | Full motion contract |
| CAP-02 announcement | Broken until module | Dialog/toast/etc. | — | Swiper bar (carousel adapter) | ✓ | ✓ | ✓ |
| CAP-03 header/nav | Broken | Shared UI | — | ✓ sticky-header module | ✓ | ✓ | ✓ |
| CAP-04–05 search/cart | Broken | Shared UI | Cart/product core | ✓ overlays | ✓ | ✓ | ✓ |
| CAP-08–11 product | Partial: skeleton primitives with theme logic merged in phase 3 (buy buttons, variant picker, quantity, gallery including the carousel layout); price, pickup, selling plans wait for slice 1 | Shared UI | ✓ PDP stack | ✓ | ✓ | ✓ | ✓ |
| CAP-12–13 collection/search | Broken | Filters UI | — | Search results | ✓ filters | ✓ | ✓ |
| CAP-14–16 content pages | Broken | — | — | — | Partial | ✓ | ✓ blog/about/contact |
| CAP-17 password | HTML only | — | — | — | — | — | ✓ |
| CAP-18 gift card | ✓ `gift-card.js` F | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| CAP-19 404 | Static | — | — | — | — | — | ✓ |
| CAP-20 localization | Partial F+ snippets | — | — | ✓ | ✓ | ✓ | ✓ |
| CAP-21 dialogs/toast | Broken | ✓ slice 0 | — | ✓ | ✓ | ✓ | ✓ |
| CAP-22 Swiper sections | Broken (no global UMD) | — | — | announcement via adapter | — | ✓ carousels | ✓ |

Legend: ✓ = target capability testable per `browser-checklist.md`; “Broken” = relies on **D** files removed without slice rewrite.

## Expected lint trajectory (summary)

| Stage | `lint:theme` expectation |
| --- | --- |
| After mechanical skeleton layout/assets import without phase 4 | Still hundreds of findings; class mix shifts from “missing module id” toward “Alpine attribute complexity” in **R** files |
| After **D** removal | Old architecture rules satisfied; unmigrated **R** markup dominates failures |
| End of phase 4 slices | Trend toward zero on migrated surfaces; full `npm.cmd run lint` gate at release |

Do not treat lint count alone as phase 3 success; phase 3 explicitly allows a broken storefront until slice work lands (`docs/project.md:30`).

## Theme logic merged during phase 3 (derived)

`scripts/derive-slices.js` puts these components in phase 3 because F+ snippets mount them: `BuyButtons`, `QuantitySelector`, `VariantPicker`, `accordion`, `cart`, `dropdown`, `imageLightbox`, `localizationSwitcher`, `productGallery`. The skeleton ships the primitive for each of these except `imageLightbox`, which becomes a new module in phase 3 (no skeleton `assets/image-lightbox.js`); the theme behavior recorded for each in `logic-migration.md` (for example quantity rules via `fromCartItem` in the cart overlay, see the `assets/quantity-constraints.js` FX table) merges into the skeleton module in this phase, and the matching phase 0 checklist rows run at the end of phase 3.
