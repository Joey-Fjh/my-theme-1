# Phase 1 — Post-change validation (Stage C)

Recorded on branch `refactor/skeleton-shell` after stages A–B (skeleton `5191a50`) and stage C command runs. Compare pre-change numbers in `baseline.md` (commit `af05311`, old validators).

Environment: Windows, `npm.cmd`, Node from project lockfile; `npm.cmd ci` succeeded after B1 lock merge.

## Acceptance checklist (context plan)

| # | Check | Result |
|---|--------|--------|
| 1 | `git diff --stat main -- sections snippets assets templates config locales layout tailwind blocks` empty | **Pass** (no output) |
| 2 | Symlinks + `doctor:agent` | **Pass** (user repaired `.claude/skills`; doctor exits 0) |
| 3 | Agent tree vs skeleton minus `theme-blocks.md` | **Pass** (stage A review) |
| 4 | `npm.cmd ci` | **Pass** (after B1) |
| 5 | Liquid syntax, i18n, validators, format, doctor | **Partial** — see table below |
| 6 | `lint:theme`, `lint:doc-paths`, theme-check vs A0 | **Recorded** — see below |
| 7 | `.shopifyignore` vs theme dirs | **Pass** — `node docs/migration/step1/check-shopifyignore.mjs` |
| 8 | No `theme-blocks` routing in `AGENTS.md` / `.agents` | **Pass** — zero matches; historical mentions only in `docs/agent/context.md` and `docs/migration/*` |

## Command results

| Command | Result | Count / notes | Owning phase (if fail) |
|---------|--------|---------------|-------------------------|
| `npm.cmd run doctor:agent` | Pass | — | — |
| `npm.cmd run lint:liquid-syntax` | Pass | — | — |
| `npm.cmd run format:check` | Pass | — | — |
| `npm.cmd run lint:compat` | Pass | 26 stylesheet blocks, 7 javascript blocks | — |
| `npm.cmd run lint:i18n` | **Fail** | **5** hardcoded schema strings | **Phase 4** (section schema locale keys; business `sections/*.liquid` untouched in phase 1) |
| `npm.cmd run test:validators` | **Fail** | Fails in `section-stylesheet-carry.test.js`: `carryInnerSectionStylesheet` missing from `assets/https.js` | **Phase 3** (skeleton runtime / `https.js` contract) |
| `npm.cmd run lint:doc-paths` | **Fail** | **2** missing cited paths | **Phase 3** (`assets/section-pagination.js` not imported yet) |
| `npm.cmd run lint:theme` | **Fail** | **343** issues (0 vendor-notice; after F1) | **Phase 3–4** — full list: `lint-theme.out` |
| `npm.cmd run test:theme-check` | Pass (with findings) | **1** warning vs A0 **0** offenses | Attribution below |

### `lint:i18n` (5)

| File | Line | Text |
|------|------|------|
| `sections/article.liquid` | 556 | `categories` |
| `sections/before-after-comparison.liquid` | 340, 346 | `BEFORE`, `AFTER` |
| `sections/newsletter-overlay.liquid` | 354 | `left` |
| `sections/product-comparison-table.liquid` | 668 | `custom.ingredients` |

New skeleton i18n rules; A0 used old linter (0 issues). Not fixed in phase 1 per business-dir freeze.

### `lint:doc-paths` (2)

After D2 (`javascript-runtime.md:158` no longer cites `blocks/*.liquid`):

| File | Line | Missing path |
|------|------|----------------|
| `docs/references/architecture/javascript-runtime.md` | 63 | `assets/section-pagination.js` |
| same | 150 | `assets/section-pagination.js` |

**Phase 3** — import or document pagination module with the skeleton runtime.

### `lint:theme` (343)

Expected until phases 3–4. **Full output:** `docs/migration/step1/lint-theme.out` (regenerated via `runThemeLint`, one `file:line: message` per finding). **F1 (2026-09-28):** `THIRD_PARTY_NOTICES.md` entries for Swiper and Alpine Intersect removed the three `vendor-notices` findings (346 → 343).

#### Counts by rule (message family)

| Count | Rule / message family |
|------:|------------------------|
| 121 | `data-module-id` (module root missing `data-module-id`) |
| 88 | `alpine-attribute-expression` |
| 29 | `alpine-api-outside-adapter` (`Alpine APIs belong in alpine.adapter.js only`) |
| 29 | `typography-color-token-bypass` (class bypasses settings typography/color chain) |
| 28 | `settings-chain-typography-prop` (`Typography property … must derive from var(--font-*)`) |
| 23 | `settings-chain-rgb-triplet` (scheme RGB triplet / `rgba(var(--color-*), …)`) |
| 6 | `settings-chain-color-prop` (`Color property … must use scheme tokens`) |
| 5 | `global-listener-outlet` |
| 5 | `cart-contract` (`Cart routes belong in cart.contract.js only`) |
| 4 | `typography-tier-body-on-heading` |
| 3 | `bare-img` |
| 2 | `raw-svg` |
| **343** | **Total** |

#### vs 2026-09-24 probe (`docs/agent/board.md`)

Probe used an **older skeleton `lint:theme`** on **`main` theme code** (output not kept): **343** findings in 96 files. Headline buckets: 121 `data-module-id`, 86 Alpine attributes (Liquid/statements), 29 Alpine API outside adapter, ~80 typography/color chain bypasses.

| Metric | 2026-09-24 probe | 2026-09-28 post-F1 (`lint-theme.out`) | Notes |
|--------|------------------|---------------------------------------|--------|
| Total | 343 | 343 | **Match** (after F1; pre-F1 run was 346 including 3 vendor-notice) |
| `data-module-id` | 121 | 121 | unchanged |
| Alpine attributes | 86 | 88 | **+2** (validator / bucketing drift; probe list not kept) |
| Alpine API outside adapter | 29 | 29 | unchanged |

### Theme Check vs A0 baseline

| | A0 (`baseline.md`) | After phase 1 |
|--|-------------------|---------------|
| Offenses | 0 | 0 errors |
| Warnings | 0 | **1** |

New warning (not a phase 1 code change):

- `snippets/filters-field.liquid:23` — `[warning]: UnusedAssign` — variable `field_is_first` assigned but unused.

Attributed to skeleton `.theme-check.yml` enabling checks that the old theme config did not surface at A0, not to edits in business directories.

## `.shopifyignore` audit (acceptance #7)

```text
node docs/migration/step1/check-shopifyignore.mjs
OK: no .shopifyignore pattern matches 227 tracked theme-directory files.
```

Script: `docs/migration/step1/check-shopifyignore.mjs`.

## `theme-blocks` grep (acceptance #8)

```powershell
rg -n "theme-blocks" AGENTS.md docs .agents
```

- **No matches** in `AGENTS.md` or `.agents`.
- Matches in `docs/agent/context.md` and `docs/migration/step1-outer-files.md` are plan/history only, not live routing.

## Stage B summary (for coordinator)

| Step | Done |
|------|------|
| B1 `package.json` / lock / `npm.cmd ci` | Yes — `name` `my-theme-1`, Ceylune description, skeleton scripts, `browserslist`, `shopify:dev` `-e development` |
| B2 `.gitignore` + untrack `shopify.theme.toml` | Yes — local file retained |
| B3 `.shopifyignore` | Yes — skeleton + `svgo.config.cjs`, `.env`, scratch patterns |
| B4 `README.md` | Yes — theme + skeleton setup / symlinks / `doctor:agent` |
| B5 deviations | Yes — `AGENTS.md`, `docs/project.md` Deviations, `javascript-runtime.md` section-block note |

**Not in scope for phase 1:** fixing `lint:theme`, runtime assets, or section schema i18n. **No commit** in this stage unless explicitly requested.
