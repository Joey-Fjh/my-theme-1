# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-28.

## Plan: phase 3 batch 3A — core runtime graph

Status: **complete: coordinator review PASS, GPT review PASS under the amended check 11, check 14 PASS.** Ready to commit when the user asks.

### Outcome

`layout/theme.liquid` loads theme code through the skeleton import map with a single `type="module"` entry (`base.js`) followed by the classic `vendor-alpine.min.js`; the core modules are the skeleton's (`5191a50`) with the theme additions listed below merged in; Alpine Intersect loads as a side-effect import from `base.js`. All other legacy script tags are gone. The storefront is expected to be broken for everything the 17 D files provided (accepted in `docs/project.md`, phase 3); those files stay in the repository untouched as the reference for their slices.

### Source

Skeleton commit `5191a50` on remote `skeleton` (`git show skeleton/main:<path>`). Import by path only; no `git merge skeleton/main`.

Path list: `layout/theme.liquid`, `layout/password.liquid`, `assets/base.js`, `assets/events.js`, `assets/https.js`, `assets/utils.js`, `assets/performance.js`, `assets/alpine.adapter.js`, `assets/cart.contract.js`, `assets/alpine.store.cart.js`.

### Implementation surface

- `layout/theme.liquid`, `layout/password.liquid`
- `assets/base.js`, `assets/events.js`, `assets/https.js`, `assets/utils.js`, `assets/performance.js`, `assets/alpine.adapter.js` (new), `assets/cart.contract.js` (new), `assets/alpine.store.cart.js`
- `locales/en.default.json` (add the `cart.errors` group only)
- Record files `docs/agent/context.md`, `docs/agent/board.md`, and the coordinator's status edit to `docs/project.md` (phase 3 batch order, made when this plan was recorded)

Not in the surface: the 17 D files, `assets/quantity-constraints.js` and every skeleton feature module (batch 3C), all `sections/`, all other `snippets/`, `tailwind/`, CSS, `config/`, `templates/`, `sections/*-group.json`, vendor files.

### Merge rules per file

| File | Result |
| --- | --- |
| `layout/theme.liquid` | Skeleton file, with: import map limited to `base`, `events`, `https`, `alpine-adapter`, `cart-contract` (the feature entries and `utils` enter in 3C with their first importers; the lint rejects unused entries, and no core module imports `utils`); theme `{% sections 'overlay-group' %}` before the header group and `{% render 'ui-toast' %}` after the footer group kept; `<main>` keeps the theme classes `relative shadow-none outline-none`; body keeps `data-initial-cart`, the skeleton `data-cart-error-*` attributes, the theme `data-cart-type`, and the four motion attributes with exactly their current conditions (`docs/project.md`, Theme-Specific Contracts). No other script tag. |
| `layout/password.liquid` | Skeleton file plus the theme's one difference: `<body class="flex min-h-dvh flex-col">`. |
| `assets/base.js` | Skeleton file plus: `import './vendor-alpine-intersect.min.js';` (side effect, before Alpine starts; `docs/migration/phase2/phase3-import.md` §Alpine Intersect); the theme `Base` measurement of `--announcement-bar-height` (theme `assets/base.js`, `Base` class: `.announcement-bar` lookup, resize observation, `setCSSVar('--announcement-bar-height', …)`), which the skeleton `Base` lacks. Nothing from the theme `Components` registry or `Main.initAlpine`. |
| `assets/events.js` | Skeleton file plus the theme event names the skeleton lacks and later slices use: `HEADER_MENU_ACTIVE_CHANGED`, `PRODUCT_MEDIA_MODAL_ACTIVATE`, `PRODUCT_SELLING_PLAN_CHANGED`, `PRODUCT_VARIANT_SET_REQUEST` (same string values as the theme file). `COMPONENT_UNMOUNTED` is dropped (belonged to the `Components` runtime). No `window.__Theme__` attachment. |
| `assets/https.js`, `assets/utils.js`, `assets/performance.js`, `assets/alpine.store.cart.js` | Skeleton file as is. Theme-only exports removed by this are ported by the slice that first needs them; the implementer lists them under Progress so the slices can find them. |
| `assets/alpine.adapter.js`, `assets/cart.contract.js` | Skeleton file as is (new here). |
| `locales/en.default.json` | Add `cart.errors.{generic, rate_limited, server_error, timeout, network_error}` with the skeleton values, placed as in the skeleton file. No other key changes. |

### Dependencies

- Remote `skeleton` fetched at `5191a50` (done 2026-09-28).
- No open board decision is needed: 3A touches neither `config/settings_schema.json` nor the schema locale.

### Acceptance checks

Each check is a command with an expected result. Run from the repository root.

1. Scripts in the layout: `git grep -nE "<script" -- layout/theme.liquid` shows exactly three tags: `type="importmap"`, `type="module"` with `base.js`, and `vendor-alpine.min.js` with `defer`.
2. Legacy loading gone: `git grep -nE "vendor-swiper|vendor-alpine-intersect|alpine\.components|alpine\.store\.(js|toast|dialog|registry|cart)|dialog-motion|drawer-motion|quantity-constraints|performance\.js" -- layout/` returns nothing.
3. Import map: its keys are exactly `base`, `events`, `https`, `alpine-adapter`, `cart-contract`, and each maps to an existing `assets/` file. (`assets/utils.js` is still imported from skeleton as a file; its map entry lands in 3C.)
4. Layout contracts kept: `git grep -nE "sections 'overlay-group'|sections 'header-group'|sections 'footer-group'|render 'ui-toast'|data-initial-cart|data-cart-type|data-motion-enabled|data-content-reveal-style|data-media-reveal-style|data-reveal-behavior|data-cart-error-" -- layout/theme.liquid` finds each item; the motion conditions are identical to `git show HEAD:layout/theme.liquid`.
5. Byte-identical to the skeleton: `git diff --exit-code skeleton/main -- assets/https.js assets/utils.js assets/performance.js assets/alpine.store.cart.js assets/alpine.adapter.js assets/cart.contract.js` exits 0.
6. Only the listed merges: `git diff skeleton/main -- assets/base.js assets/events.js layout/theme.liquid layout/password.liquid` shows only the hunks named in the merge rules.
7. No legacy globals in the surface: `git grep -n "__Theme__" -- assets/base.js assets/events.js assets/https.js assets/utils.js assets/performance.js assets/alpine.adapter.js assets/cart.contract.js assets/alpine.store.cart.js layout/` returns nothing.
8. Phase 3 guard, events: `git grep -n "new CustomEvent" -- "assets/*.js"` hits only `assets/events.js`, `assets/vendor-alpine.min.js`, and D files.
9. Phase 3 guard, section HTML: `git grep -nE "innerHTML\s*=|outerHTML\s*=|replaceWith\(" -- assets sections snippets` hits only the SectionRefresher in `assets/https.js`, vendor files, and D files.
10. D files untouched: `git diff --stat HEAD -- assets/alpine.components.filters.js assets/alpine.components.header.js assets/alpine.components.js assets/alpine.components.overlays.js assets/alpine.components.pagination.js assets/alpine.components.product-cards.js assets/alpine.components.product-media.js assets/alpine.components.product.js assets/alpine.components.registry.js assets/alpine.components.search.js assets/alpine.components.ui.js assets/alpine.store.dialog.js assets/alpine.store.js assets/alpine.store.registry.js assets/alpine.store.toast.js assets/dialog-motion.js assets/drawer-motion.js` is empty and all 17 files exist.
11. Locale: `git diff HEAD -- locales/en.default.json` adds only the five `cart.errors` keys; `npm.cmd run lint:i18n` reports no finding that is absent on `HEAD` (amended by the user on 2026-09-28 from "passes"; the five pre-existing schema-text errors and 34 unused keys are tracked on `docs/agent/board.md`).
12. Validators: `npm.cmd run lint:compat` passes; `npm.cmd run lint:liquid-syntax` passes; `npm.cmd run lint:theme` total recorded against the baseline of 343 findings, with zero findings on surface files and zero `module-import-map-unused` findings; `npm.cmd run test:theme-check` recorded, with no new errors on surface files; `npx prettier --check` passes on every changed file.
13. Surface: `git status --short` lists only surface files and record files.
14. Runtime smoke (user, `npm.cmd run shopify:dev`): the home page returns HTML; the browser console shows no import-map resolution or module 404 errors for the six core modules; `document.documentElement.style.getPropertyValue('--header-height')` is set. Feature errors from unregistered Alpine components are expected and not a failure.

### Review tier

**Ask** (Liquid layout and `assets/*.js` change; runs from an external execution prompt). Coordinator review plus an independent GPT verifier with the `.agents/roles/verifier.md` prompt; both must report PASS. No browser acceptance pass beyond check 14; phase 0 checklist rows start in 3C.

### Authorization

Authorized by the user on 2026-09-28 ("授权"), for batch 3A only, to run from the external execution prompt the coordinator delivered in chat.

### Progress

**Skeleton base:** `git rev-parse --short skeleton/main` → `5191a50` (after `git fetch skeleton`).

**Files changed**

| File | Skeleton base | Theme hunks added |
| --- | --- | --- |
| `layout/theme.liquid` | `5191a50` | Trimmed import map to six core keys; kept overlay/header/footer groups, `ui-toast`, main classes, `data-cart-type`, motion `data-*` (same Liquid conditions as pre-batch `HEAD`); removed all legacy defer script tags. |
| `layout/password.liquid` | `5191a50` | No diff vs current branch `HEAD` (body already had `class="flex min-h-dvh flex-col"`). |
| `assets/base.js` | `5191a50` | `import './vendor-alpine-intersect.min.js';`; announcement bar `--announcement-bar-height` (`announcementBar` field, resize observe, `updateAnnouncementBarHeight`). |
| `assets/events.js` | `5191a50` | `HEADER_MENU_ACTIVE_CHANGED`, `PRODUCT_VARIANT_SET_REQUEST`, `PRODUCT_SELLING_PLAN_CHANGED`, `PRODUCT_MEDIA_MODAL_ACTIVATE`. |
| `assets/https.js`, `assets/utils.js`, `assets/performance.js`, `assets/alpine.store.cart.js` | `5191a50` as-is (`git restore --source=skeleton/main`). |
| `assets/alpine.adapter.js`, `assets/cart.contract.js` | `5191a50` as-is (new; staged with `git add` so check 5 compares content). |
| `locales/en.default.json` | — | `cart.errors.{generic, rate_limited, server_error, timeout, network_error}` after `selling_plan_label`. |

**Theme-only surface removed (for later slices)** — prior `HEAD` (`926dddb` lineage on branch), not skeleton:

- `assets/events.js`: `COMPONENT_UNMOUNTED` / `'theme:component:unmounted'`; `window.__Theme__.Events` attachment (`events.js` end).
- `assets/utils.js`: `Utils.rafThrottle`, `Utils.throttle`, `Utils.getPageScrollBehavior`, `Utils.getMicroScrollBehavior`, `Utils.scrollToTop`; `window.__Theme__.Utils` (`utils.js` end). Skeleton keeps `prefersReducedMotion`, `debounce`, `useDisposable` as ESM exports.
- `assets/performance.js`: IIFE + `window.__Theme__.ThemePerformance` → skeleton ESM `export class ThemePerformance` (loaded from `base.js` via dynamic `import('./performance.js')`).
- `assets/https.js`: IIFE globals `window.ShopifyHttp`, `window.ShopifyHttpError`, `window.ShopifySectionRefresher`; `SectionRefresher` post-render `window.__Theme__?.Components?.initAll`; `ShopifyHttp.debugEnabled` via `window.__Theme__?.httpDebug` → skeleton `Http` + ESM `export { ShopifyHttp, HttpError, SectionRefresher }`.
- `assets/alpine.store.cart.js`: `window.__Theme__.AlpineStoreGroups.cart` imperative store → skeleton `export function createCartUiStore(contract)` (wired from `base.js` + `cart.contract.js`).
- `assets/base.js` (not in surface replace list but removed by swap): entire `Components` / `Main.initAlpine` / `window.__Theme__` bootstrap — replaced by skeleton module graph.

**Acceptance check output**

1. **PASS** — three script tags (importmap, module `base.js`, defer `vendor-alpine.min.js`).
2. **PASS** — `git grep` on `layout/` returned empty.
3. **PASS** — six import-map keys; each `assets/*.js` file exists.
4. **PASS** — all contract strings present; motion `{% if %}` blocks unchanged vs pre-batch `HEAD` `layout/theme.liquid`.
5. **PASS** — `git diff --exit-code skeleton/main --` (six assets) exit 0 after staging new adapter/contract files.
6. **PASS** — `git diff skeleton/main` on merged files shows only merge-rule hunks.
7. **PASS** — no `__Theme__` in surface paths.
8. **PASS** — `new CustomEvent` only in `assets/events.js` and `assets/vendor-alpine.min.js` (no D-file hits).
9. **PASS** — `innerHTML`/`replaceWith` only in `assets/https.js` among first-party `assets/` (plus vendor min files in full grep).
10. **PASS** — `git diff --stat HEAD` empty for 17 D paths; all 17 exist.
11. **PARTIAL** — locale diff adds only `cart.errors` group. `npm.cmd run lint:i18n` **exit 1** (5 pre-existing hardcoded schema strings in sections, not in surface): `sections/article.liquid:556`, `sections/before-after-comparison.liquid:340,346`, `sections/newsletter-overlay.liquid:354`, `sections/product-comparison-table.liquid:668`.
12. **PARTIAL** — `npm.cmd run lint:compat` exit 0; `npm.cmd run lint:liquid-syntax` exit 0; `npm.cmd run lint:theme` exit 1, **332** findings total (baseline 343); **one surface finding:** `layout/theme.liquid:1` `module-import-map-unused` for import map key `utils` (no `from 'utils'` in core graph until batch 3C feature modules); `npm.cmd run test:theme-check` exit 0 (1 pre-existing warning `snippets/filters-field.liquid` UnusedAssign); `npx prettier --check` on all changed files exit 0.
13. **FAIL** — `git status --short` also lists `M docs/project.md` (not edited by this batch; coordinator diff predates implementer). Otherwise surface + record files only.
14. **Not run** (user smoke).

**Blockers / notes**

- Check 12 `module-import-map-unused` for `utils` conflicts with check 3’s required six-key map until 3C lands consumers; needs verifier/coordinator ruling (skeleton has the same latent lint if feature modules are absent).
- Check 13 fails on unrelated `docs/project.md` dirty state; revert or commit separately outside 3A surface.

### Coordinator review (2026-09-28)

Re-ran checks 1–13 independently; did not inherit the implementer's results.

- Checks 1, 2, 4–10: PASS, same evidence as above. The `git diff skeleton/main` hunks for `assets/base.js`, `assets/events.js`, and `layout/theme.liquid` match the merge rules exactly; `layout/password.liquid` already equalled the target.
- Check 11: the 5 `lint:i18n` errors and the 34 unused locale keys are identical on a `git archive HEAD` copy, so they predate 3A; 3A adds none (the five `cart.errors` keys are used by the layout). Accepted as pre-existing, not a 3A defect.
- **Finding 1 (plan defect, corrected by the coordinator):** the plan required a `utils` import-map entry, but no core module imports `utils` in 3A, so `lint:theme` reported `module-import-map-unused` on `layout/theme.liquid`. The implementer followed the plan and flagged it. Correction: removed the `utils` entry (one line) and amended the merge rule and check 3; the entry lands in 3C with its first importers.
- **Finding 2 (plan defect, corrected in the record):** check 13 failed on `docs/project.md`, which holds the coordinator's phase 3 batch-order edit made when this plan was recorded. The surface now names it as a record file.
- After the correction: `lint:theme` 331 findings (baseline 343). Compared as sets against the `HEAD` copy, the only new finding was the `utils` entry, now gone; 12 findings left with the replaced `alpine.store.cart.js`, `base.js`, `https.js`; zero findings on surface files. `lint:compat` pass, `lint:liquid-syntax` pass, `test:theme-check` pass (1 pre-existing warning, `snippets/filters-field.liquid` UnusedAssign), `npx prettier --check` pass on all changed files.
- Check 14 (runtime smoke) not yet run; it is the user's.

Verdict: **PASS**, pending the independent GPT review and check 14.

### Independent GPT review (2026-09-28)

Verdict **FAIL**, on check 11 only: `lint:i18n` exits 1 while the check said "passes". The verifier independently confirmed that the five errors and the 34 unused keys are identical on a `HEAD` archive, so 3A adds no i18n finding; checks 1–10 and 12–13 PASS with fresh evidence (all five import-map keys used and resolving, load order correct, event values and announcement-bar logic match `HEAD`, motion and cart conditions unchanged, D files untouched, `lint:theme` 331 with zero new findings). The coordinator had accepted the pre-existing errors without authority to lower a check; the verifier was right to fail it.

Resolution (user, 2026-09-28, option A): check 11 amended to "no new i18n findings against `HEAD`". Under the amended check both reviews are PASS. Remaining: check 14 (user runtime smoke).

### Check 14 (user, 2026-09-28)

**PASS.** `npm.cmd run dev` serves the development theme; the home page renders. `--header-height` = `86px`, which proves `base.js` executed, so every static import in the core graph (`events`, `alpine-adapter`, `cart-contract` → `https`, and the Intersect vendor file) resolved. No import-map or module-load errors. About 200 Alpine `Uncaught TypeError: Illegal invocation` errors from `vendor-alpine.min.js`: expected, because the Alpine components the D files registered are no longer loaded, so markup expressions such as `close()` or `open()` fall through to the `window` methods of the same name. Dev warnings unrelated to 3A: "Environment file not found" (local `shopify.theme.toml` was missing on this machine; restored from `1bf75c6^`, git-ignored) and the `.shopifyignore` `__pycache__/` pattern hint (unchanged since phase 1).
