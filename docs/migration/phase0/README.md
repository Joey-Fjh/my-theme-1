# Phase 0a — Static baseline index

| Field | Value |
|-------|--------|
| Commit | `926dddb66ec89bfd127454b380e17c013354a5ac` |
| Branch | `refactor/skeleton-shell` |
| Inventory date | 2026-09-28 |
| Plan source | `docs/agent/context.md` (Phase 0a acceptance checks) |

## Method

1. **Baseline gate**: `git diff --stat main -- sections snippets assets templates config locales layout tailwind blocks` (empty before work).
2. **File inventory**: `git ls-files` for `sections/*.liquid`, `snippets/*.liquid`, `assets/*.js`.
3. **Merchant JSON**: Read `templates/*.json`, `sections/*-group.json`, `config/settings_data.json` (strip leading `/* */` comment block before `JSON.parse`). Cross-check section/block `type` values against `{% schema %}` in `sections/*.liquid`.
4. **Runtime tracing**: Read `layout/theme.liquid`, `layout/password.liquid`, `assets/base.js`, `assets/events.js`, `assets/https.js`, and `assets/alpine.*.js`; `rg` for `Components.register`, `new Swiper`, `shopify:section`, `ShopifyHttp`, `ShopifySectionRefresher`.
5. **Sizes**: Node script using `fs.readFileSync` + `zlib.gzipSync` (command recorded in `sizes.md`).

**Components.register (section carousels):** 7 sections use `Components.register` (6 with carousel via `vendor-swiper.min.js`; `product-comparison-table` without) — see `runtime-dependencies.md` and `base.js:491–540` for Alpine registrations.

## Coverage counts

| Asset class | Count in repo | Mapped in `capabilities.md` matrix |
|-------------|---------------|----------------------------------|
| `sections/*.liquid` | **45** (plan count 48 = 45 liquid + 3 `*-group.json`) | 45 / 45 |
| `snippets/*.liquid` | **70** | 70 / 70 |
| Non-vendor `assets/*.js` | **25** | 25 / 25 |

## Deliverables

| File | Purpose |
|------|---------|
| [capabilities.md](./capabilities.md) | Business capabilities + file coverage matrix |
| [merchant-references.md](./merchant-references.md) | Theme Editor JSON references |
| [runtime-dependencies.md](./runtime-dependencies.md) | Scripts, globals, events, Swiper, editor hooks |
| [sizes.md](./sizes.md) | JS/CSS byte baselines |
| [browser-checklist.md](./browser-checklist.md) | Phase 0b manual QA script |

## Open questions

1. **Section count 45 vs 48 (resolved)**: Plan count 48 included 3 section group JSON files (`header-group.json`, `footer-group.json`, `overlay-group.json`); **45** `sections/*.liquid` is correct.
2. **`icon-with-text` section**: Has a theme preset (`sections/icon-with-text.liquid` schema) but no instance in any `templates/*.json` or section group JSON at this commit. Merchants can still add it manually in the editor.
3. **`custom-liquid` section**: Same as above — preset only, not referenced in saved JSON.
4. **`collection-navigation-items`**: Not a template section instance; rendered inside `sections/collection.liquid` via `data-section-id="collection-navigation-items"` (`collection.liquid:575`) and refreshed by `collectionNavigationCatalog` Alpine component (`alpine.components.filters.js:694–706`).
5. **`pickup-availability` section**: No template JSON entry; loaded via Section Rendering API from PDP (`alpine.components.product.js:1343–1419`) into `snippets/pickup-availability-inline.liquid`.
6. **Customer account templates**: No `templates/customers/*.json` in the repo; legacy customer account flows are out of scope unless added later.
7. **`password.liquid` layout**: Loads only `tailwind.output.css` and `content_for_header` — no theme JS (`layout/password.liquid:17–22`). Password page interactivity depends on Shopify-hosted assets from `content_for_header` only.
8. **AGENTS.md runtime description**: Still documents the old stack; this inventory follows **code** per task instructions (`layout/theme.liquid`, `assets/base.js`).
