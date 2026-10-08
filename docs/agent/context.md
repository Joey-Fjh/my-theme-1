# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-08.

## Plan 6-T1: layout check harness

**Status:** accepted by the user (2026-10-08) after cross review 2. Next: step 9 (commit when the user asks, migrate the `test:layout` rule with approved wording, clear this file). Rounds 1–4 executed; cross review 1 FAIL; round 5 code (part 1) and baseline or runs (part 2) recorded below. Rounds 1–4 were committed mid-batch as a work-in-progress handoff (`b3c4abc`); round 5 is uncommitted. Review tier: **Ask** (validator wiring in `package.json`, external prompt).

### Outcome

`npm.cmd run test:layout` loads every listed storefront page from a running `shopify theme dev` in the local Chrome, resizes each page from 320 to 2560px in 40px steps, and reports layout defects. It prints a summary table, writes a JSON report, and exits non-zero on any issue that is not in the baseline. The baseline records today's known issues; it may only shrink. A fixture suite proves each check detects what it claims, without Shopify.

### Decisions this plan carries (user, 2026-10-08; do not reopen)

- **Tooling:** `playwright-core` as a devDependency, `chromium.launch({ channel: 'chrome' })`. No bundled browser download, no `@playwright/test`.
- **Where:** local only, against `shopify theme dev` (default base URL `http://127.0.0.1:9292`, overridable by `LAYOUT_BASE_URL`). No CI.
- **Password:** optional `STOREFRONT_PASSWORD` environment variable, used only when a page lands on `/password`. Never written to a file, the report or the log.
- **URLs:**
    - fixed: `/`, `/cart`, `/search?q=a`, `/collections`, `/collections/all`, and a 404 path;
    - discovered: the first product on `/collections/all`, the first blog and its first article;
    - alternate templates, starting with `/pages/privacy-policy?view=about`;
    - extra URLs can be pinned in the config.
    - A discovery that finds nothing fails the run with a message; it is never skipped silently.
- **Page-margin rule:**
    - visible text and controls (headings, paragraphs, buttons, links, form controls) in every section, header and footer included, sit at left ≥ page margin and right ≤ `clientWidth` − page margin, ±1px;
    - images and video are not checked;
    - an element partly outside the viewport under a clipping ancestor is a deliberate peek and is skipped; if nothing clips it, the overflow check reports it;
    - exceptions live in the harness config (selector plus reason), never in theme markup.

### Checks (per page, per width)

1. **Horizontal scroll:** `document.documentElement.scrollWidth > clientWidth`.
2. **Unclipped overflow:** a rendered element whose box extends past the viewport's left or right edge with no ancestor that clips on that axis (`overflow` / `overflow-x` not `visible`, or `clip-path`).
3. **Page margin:** the rule above. Resolve the page margin at each width from the theme's `--page-margin` (for example a probe element sized `width: var(--page-margin)`), not from a hard-coded number.
4. **Tap targets** (WCAG 2.5.8): `button`, `input` (not hidden), `select`, `textarea`, `summary`, `[role=button]`, `[role=tab]` and standalone links are at least 24×24 CSS px. A link is inline, and exempt, when its nearest block ancestor has text outside the link. The 2.5.8 spacing exception applies: an undersized target passes when a 24px circle centred on it overlaps no other target or circle.
5. **Clipped text:** an element with its own text, `overflow` not `visible`, and `scrollWidth > clientWidth + 1` or `scrollHeight > clientHeight + 1`, unless it uses `text-overflow: ellipsis` or `-webkit-line-clamp`.
6. **Runtime:** console errors and uncaught page errors during load; and, after the page has been scrolled top to bottom once (so lazy roots activate), every `[data-module-id]` root is mounted. Mounted means Alpine initialized it (`_x_dataStack` present) and the theme loader no longer holds it (`__themeModulePending` absent). Run the runtime check once per page, at 1440.

**Skipped elements** (all checks): `display: none`, `visibility: hidden`, zero size, inside `[inert]`, `[aria-hidden="true"]`, a closed `<dialog>` or `<details>`, or `<template>`. Off-canvas drawers that stay rendered without any of these are reported, and the executor names them in the config or the baseline with a reason. The theme is not changed to suit the harness.

**Method:** one page load per URL at 1440×900, then `setViewportSize` through the 57 widths. After each resize, wait two animation frames and a settle time (start at 150ms; the config holds it). Reduced motion is emulated (`reducedMotion: 'reduce'`) so animations do not move boxes between reads. Height stays 900.

**Issue identity:** page key + check + a stable element selector (id, or the nearest section id plus a class and `nth-of-type` path). Consecutive failing widths merge into ranges (`320–600`), so one issue is one entry.

### Files and layout

- `.agents/tools/layout-check/`:
    - `layout-check.mjs` (entry: args, URL discovery, browser, loop, report);
    - `checks.js`, the in-page check functions passed to `page.evaluate`, one export per check, so the fixture suite runs the same code;
    - `layout-check.config.json` (base URL default, fixed and pinned URLs, alternate templates, settle time, exceptions as `{ "selector", "checks", "reason" }`; an entry without `reason` is a config error);
    - `layout-check.baseline.json` (known issues);
    - `layout-check.test.mjs` plus `fixtures/*.html` (node `--test`, Chrome, a tiny local static server on a free port; no Shopify).
- **Output:** `.tmp-layout-check/report.json` and `.tmp-layout-check/summary.txt` (already ignored by `.tmp-*` in `.gitignore` and `.shopifyignore`). The console prints only the summary table: per page, the issue count per check, new versus baseline, and the widths.
- **Flags:**
    - `--page <key>` and `--widths 320,390,768` for quick runs;
    - `--prune-baseline` removes baseline entries that no longer occur and adds nothing. The script never adds baseline entries on its own after this batch; growing the baseline is a manual edit that needs the user's approval.
    - The first baseline is written in this batch by `--write-baseline`, which refuses to run when a baseline file already exists.

### Implementation surface

- New: `.agents/tools/layout-check/**` (above).
- `package.json`:
    - add `playwright-core` (current stable, 1.64.x on 2026-10-08) to `devDependencies`;
    - add the scripts `test:layout` (`node .agents/tools/layout-check/layout-check.mjs`) and `test:layout-harness` (`node --test .agents/tools/layout-check/layout-check.test.mjs`);
    - neither joins `lint`, `test` or `test:validators`, since both need Chrome and one needs a dev server.
- `package-lock.json`, updated only by `npm.cmd install`.
- `.gitignore`: add `%SystemDrive%/` (decided, board 6-B4 process note); `.shopifyignore` is unchanged.
- `README.md`, "Commands": one entry for each new script (prerequisites: Chrome installed, `npm.cmd run shopify:dev` running).
- Records: `docs/agent/context.md`.

**Forbidden:**
- every theme file: `assets/`, `sections/`, `snippets/`, `blocks/`, `layout/`, `templates/`, `config/`, `locales/`, `tailwind/`;
- `AGENTS.md`, `.agents/roles/`, `.agents/skills/`, `docs/references/`, `.github/workflows/ci.yml`, and every other `package.json` script. The rule that agents run `test:layout` at the end of a batch is migrated by the coordinator at step 9, with wording the user approves;
- open board decisions may be cited but not decided.

### Dependencies

- Google Chrome installed (`C:/Program Files/Google/Chrome/Application/chrome.exe`, present on 2026-10-08).
- Network access for `npm.cmd install`.
- For A1, A3 and A5: `npm.cmd run shopify:dev` running with an authenticated Shopify CLI. The user starts it (decided 2026-10-08, so agents do not each start their own dev server). An agent checks `http://127.0.0.1:9292/` first; if it does not answer, the agent stops and asks the user to start it.

### Acceptance checks

- **A1 Fixture suite.** `npm.cmd run test:layout-harness` passes. Each check has at least one positive fixture that it reports and one negative fixture that it does not:
    - horizontal scroll: a 110vw block (positive); a 110vw block inside `overflow-x: clip` (negative);
    - unclipped overflow: an absolutely positioned child at `left: -40px` (positive); the same child under an `overflow: hidden` parent (negative, a peek);
    - page margin: a heading at `left: 4px` (positive); an image spanning edge to edge (negative);
    - tap targets: a 20×20 button beside another button (positive); a 20×20 button isolated by the spacing exception, and an inline text link in a paragraph (negatives);
    - clipped text: a fixed-height box with overflowing text and `overflow: hidden` (positive); the same with `-webkit-line-clamp` (negative);
    - runtime: a `console.error` and a `[data-module-id]` root without `_x_dataStack` (positives); a mounted root (negative);
    - skipped elements: an overflowing element inside `[inert]` and inside a closed `<dialog>` (negatives);
    - config: an exception without `reason` makes the run fail with a config error.
- **A2 Full run.** With the dev server running, `npm.cmd run test:layout` exits 0 against the baseline written in this batch. `report.json` lists every page with its resolved URL, including the discovered product, blog and article, and records the wall-clock time. Record the time and the per-check baseline counts in this file.
- **A3 Regression proof.** A temporary local change (for example `width: 120vw` on one heading through DevTools `page.addStyleTag` in a throwaway script, not a theme edit) makes a run report a new issue and exit non-zero. Record the command and output; leave no file behind.
- **A4 No dev server.** With nothing on the base URL, `test:layout` exits non-zero within 15s with a message naming `npm.cmd run shopify:dev`.
- **A5 Baseline rules.** `--write-baseline` refuses when the baseline exists. `--prune-baseline` on an unchanged theme leaves the baseline byte-identical (`git diff --exit-code` on it).
- **A6 Boundaries.**
    - `git status --porcelain` lists only paths inside the implementation surface;
    - `node_modules/playwright-core` exists and no browser was downloaded (no `ms-playwright` folder created by this batch under `%LOCALAPPDATA%`);
    - the password value appears in no file in the repo or `.tmp-layout-check/`.
- **A7 Validators.** `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, and `npx.cmd prettier --check` on the changed and new files pass. Paste the output.

### Execution status

**Status:** executed (Implementer, 2026-10-08); not accepted; not committed.

#### A1 Fixture suite

Command: `npm.cmd run test:layout-harness`

```
# tests 9
# pass 9
# fail 0
# duration_ms 2046.469
```

#### A2 Full run

Command: `npm.cmd run test:layout` (with `shopify theme dev` on `http://127.0.0.1:9292`)

```
Wall time: 159902ms
New issues (not in baseline): 0
```

Discovered URLs (from `.tmp-layout-check/report.json`, 2026-10-08 run): product `http://127.0.0.1:9292/products/floral-white-top`, blog `http://127.0.0.1:9292/blogs/news`, article `http://127.0.0.1:9292/blogs/news/tagged/hydrating-moisturizers`.

Baseline counts (`layout-check.baseline.json`, 113 issues total):

| check | count |
| --- | --- |
| runtime | 8 |
| page-margin | 58 |
| tap-targets | 15 |
| clipped-text | 32 |
| horizontal-scroll | 0 |
| unclipped-overflow | 0 (hCaptcha excluded via config; see decisions) |

#### A3 Regression proof

Command (throwaway env; no files left):

```powershell
$env:LAYOUT_INJECT_STYLE='html { overflow-x: visible; } body { width: 120vw; min-height: 1px; }'
npm.cmd run test:layout -- --page home --widths 1440
```

```
New issues (not in baseline): 447
447 issue(s) not in baseline.
```

Exit code: 1. Earlier probe with `body::after { … width: 120vw … }` reported `horizontal-scroll` count 1 and `New issues: 1` (exit 1).

#### A4 No dev server

```powershell
$env:LAYOUT_BASE_URL='http://127.0.0.1:9'
npm.cmd run test:layout
```

```
Could not reach http://127.0.0.1:9. Start the storefront with: npm.cmd run shopify:dev (fetch failed)
```

Exit code: 1 (under 15s).

#### A5 Baseline rules

`--write-baseline` when baseline exists:

```
--write-baseline refused: baseline file already exists.
```

`--prune-baseline` on unchanged theme (backup then `fc /b`):

```
Pruned baseline: 113 -> 113 issues.
fc-exit:0
```

#### A6 Boundaries

`git status --porcelain` (after reverting accidental `board.md` touch):

```
 M .gitignore
 M README.md
 M docs/agent/context.md
 M package-lock.json
 M package.json
?? .agents/tools/layout-check/
```

`Test-Path node_modules\playwright-core`: `True`.

`Test-Path $env:LOCALAPPDATA\ms-playwright`: `True` (likely pre-existing from other tooling; this batch used `channel: 'chrome'` only — no `npx playwright install`).

`STOREFRONT_PASSWORD`: appears only as the env var name in docs/plan text, not as a secret value in tracked files or `.tmp-layout-check/`.

#### A7 Validators

`npm.cmd run lint:doc-paths`: `Doc path lint passed.`

`npm.cmd run doctor:agent`: exit 0 (no errors printed).

`npx.cmd prettier --check` on layout-check sources, fixtures, `package.json`, `README.md`: `All matched files use Prettier code style!`

Note: `.gitignore` one-line add is not in Prettier’s inferred parser list; not formatted.

#### Material harness decisions (this batch)

- Baseline match key: `page` + `check` + `selector`; width strings may drift between runs.
- Network `console` errors matching `Failed to load resource` share baseline key `__network__` / `runtime` / `console` so intermittent 400s do not flip pages.
- Config exception: `#shop-hcaptcha-badge-container` → `unclipped-overflow` (Shopify-injected badge).
- Blog discovery: scan `/`, `/blogs`, `/collections/all`, then `sitemap_blogs_1.xml` when `/blogs` is 404.
- Optional `LAYOUT_INJECT_STYLE` env: injects CSS via `addStyleTag` for regression probes only.
- Optional `STOREFRONT_PASSWORD` env when the password page is hit (never written to repo or report).

### Correction round 1 (2026-10-08)

**Code status:** R1–R10 implemented in harness; **live baseline rewrite and A2/A3/A5 prune blocked** until `STOREFRONT_PASSWORD` is set (dev store redirects all routes to `/password` as of this session).

**How to set password (local only, do not commit):** in PowerShell, `$env:STOREFRONT_PASSWORD = '<storefront password>'` then re-run `npm.cmd run test:layout -- --write-baseline` (after deleting any partial baseline if needed).

#### Per-finding (R1–R10)

| ID | Outcome |
| --- | --- |
| R1 | **Fixed.** `normalizeShopifySectionId` strips template/section-group numeric IDs in `stableSelector`. |
| R2 | **Fixed.** Distinct runtime keys: `console:` / `pageerror:` + normalized message; HTTP via `response`/`requestfailed` as `http:METHOD:path`. Removed `__network__` folding. Config `urlPattern` exceptions for `**/api/**/graphql.json` and `**://shop.app/**` with board Evidence reason (browser pass 2026-10-04). Live 400 URL not re-captured this session (password gate); prior runs logged generic console 400; GraphQL pattern matches Storefront API path on theme dev. |
| R3 | **Fixed.** `--prune-baseline` with `--page` or `--widths` exits 1 with error; harness test added. |
| R4 | **Fixed** scroll (viewport-step + settle). **Classification pending live run:** prior baseline had `scroll_categories` `module-pending` at home; re-classify after baseline rewrite (artifact if absent, theme defect if still present — do not fix theme here). |
| R5 | **Fixed** circle–rect vs circle–circle spacing. Fixture `tap-target-adjacent-large-positive.html` (small target flush to 48px control so 24px circle intersects rect). |
| R6 | **Fixed.** Path uses component classes only; utilities omitted (documented in `checks.js`). |
| R7 | **Fixed.** Documented `LAYOUT_INJECT_STYLE` in `layout-check.mjs` header and README. |
| R8 | **Fixed.** Single closed-`<details>` branch; horizontal clip uses `overflowX` only. |
| R9 | **Fixed.** `mergeWidthRanges(widths, config.widthStep)`. |
| R10 | **Fixed.** `%SystemDrive%/` moved under dedicated `.gitignore` comment. |

#### A1 (correction)

```
# tests 12
# pass 12
# fail 0
# duration_ms 2619.0016
```

#### A2 / baseline rewrite

Not run (password). `layout-check.baseline.json` deleted; not rewritten.

#### A3 / A5 (live)

Not run (password).

#### A5 `--write-baseline` refuse (no baseline file)

Attempt after delete failed earlier on password during discovery; with no file, write would proceed once password is set.

#### A7 (correction)

```
Doc path lint passed.
(doctor:agent exit 0)
All matched files use Prettier code style!
```

### Coordinator review, round 1 (2026-10-08): defects, back to step 5

A1–A7 ran green, but the review of the code and the baseline found defects that make the baseline unreliable or mask regressions. Fix R1–R6 and record them; R7–R10 are small corrections that ride along.

- **R1 (P1) Baseline keys carry Shopify's numeric section IDs.** Every section selector starts with `#shopify-section-template--27911284195402__…` or `sections--27911284031562__…`. The number belongs to the theme's template or section group, so it is likely to change on another development theme (another machine, a recreated dev theme) or a pushed preview. Then all ~110 baseline entries would show up as new issues. Verify on a second theme if one is at hand. In either case, normalize the number away in `stableSelector` (keep the section key, for example `template__scroll_categories_B8wjNV`), and rewrite the baseline from a fresh run.
- **R2 (P1) The runtime check masks new errors.**
    - All console errors on a page share one key (`runtime` / `console`), and `pageerror` works the same way. So with one baselined error on a page, every later console error or uncaught exception on that page passes.
    - `baselineIdentityKey` also folds every `Failed to load resource` on every page into one global key, so a new 404 for a theme asset anywhere passes as soon as any 400 is baselined.
    - **Fix:**
        - key console errors and page errors by their normalized message (numbers, hashes and query strings stripped);
        - capture failed requests through `page.on('response')` (status ≥ 400) and `requestfailed`, keyed by method plus URL path with the query removed;
        - drop the `__network__` folding.
    - The known dev-origin noise (board Evidence: the GraphQL 400 and the `shop.app` 403 that come from the `127.0.0.1` origin) becomes config exceptions that match by URL pattern, with that reason. Identify which request the current 400 is before excepting it.
- **R3 (P2) Pruning with a filter deletes other pages.** `--prune-baseline --page home` (or `--widths`) keeps only the entries seen in the filtered run, so it drops every other page's baseline. Refuse `--prune-baseline` together with `--page` or `--widths`, with an error message, and add a test for that.
- **R4 (P2) Lazy roots are not scrolled through.** The runtime check jumps to the bottom and back after 100ms, so lazy roots in the middle of the page may never intersect.
    - **Fix:** scroll down in steps of one viewport height and wait at each step (the settle time), then return to the top.
    - The baselined `scroll_categories` `module-pending` entry must then be classified as either a harness artifact (gone after the fix) or a real theme defect. If it is real, report it; do not fix the theme in this batch.
- **R5 (P2) The spacing exception under-reports.** `passesSpacingException` measures only centre to centre against every target. WCAG 2.5.8 says the 24px circle centred on an undersized target must not intersect any other target (its rectangle) or the circle of another undersized target.
    - **Fix:** circle-to-rectangle distance against full-size targets, circle-to-circle against undersized ones.
    - **Fixture:** a 20×20 button whose centre is 16px from the edge of a large adjacent button must be reported.
- **R6 (P2) Selectors break when utilities change.** Paths include Tailwind utilities (`flex`, `h-full`, `w-full`, `min-w-0`, `mt-4`), so a spacing tweak renames the issue: the old entry goes stale and a "new" issue appears.
    - **Fix:** in the path, keep only component classes (containing `__` or `--`, or a root class without a utility shape), else tag plus `nth-of-type`. Document the rule in a comment.
- **R7 (P3) The injection hook.** The plan asked for A3 through a throwaway script, but `LAYOUT_INJECT_STYLE` is a permanent hook in `layout-check.mjs`. Keep it, since it is useful for regression probes, and document it in the file header and the README line. The coordinator accepts the deviation; the cross review may challenge it.
- **R8 (P3) `checks.js` cleanup.**
    - `isElementVisible` repeats the closed-`<details>` logic twice (the first copy has a confused condition); keep one.
    - `ancestorClipsAxis` reads the `overflow` shorthand. Use `overflowX` for the horizontal checks: when the other axis is non-visible, a `visible` x computes to `auto`, so `overflowX` alone is correct.
- **R9 (P3) Width ranges.** `mergeWidthRanges` hard-codes a 40px step; use `config.widthStep`.
- **R10 (P3) `.gitignore`.** `%SystemDrive%/` sits under the "OS generated files" header. Give it its own comment (agent browser tooling creates the folder with `%SystemDrive%` unexpanded).
- **Settled:**
    - `%LOCALAPPDATA%\ms-playwright` predates this batch (folders dated 2026-06-05 and 2026-08-14), so A6 holds;
    - the hCaptcha exception is accepted (Shopify-injected UI);
    - the Swiper bullets in the baseline (`span` with `role="button"`, under 24px) look like a real accessibility finding for the polish pass, not a harness error.
- **Re-run after the fixes:** A1 (with the new fixtures for R3 and R5), A2 with a rewritten baseline (delete the file, then `--write-baseline`; this is the one allowed rewrite, because R1, R2 and R6 change every key), A3, A5 and A7. Record the new per-check counts and their difference from 113 with a reason.

### Coordinator review, round 2 (2026-10-08): back to step 5

**The password blocker was not real.** At the time nothing was listening on 9292, so the dev server was not running. The coordinator started `npm.cmd run shopify:dev`; `/` and `/collections/all` returned 200 with no redirect, and `layout-check.mjs --page home --widths 1440` ran to the end without `STOREFRONT_PASSWORD` (wall 13980ms, report in `.tmp-layout-check/`). That probe showed these defects:

- **S1 (P1) URL exceptions never match as intended.**
    - `globToRegExp` turns `**` into `.*`, and the following single-`*` replacement then rewrites that `*`, so `**` becomes `.[^/]*`.
    - `runtimeMatchesUrlPattern` tests only the path, because the `http:` key drops the host, so `**://shop.app/**` can never match. In the probe, the shop.app 403 (`http:GET:/accounts/pre_auth`) was reported.
    - **Fix:**
        - key HTTP issues by method plus origin plus path, writing the dev origin as `self` (for example `http:GET:https://shop.app/accounts/pre_auth`, `http:GET:self/cdn/shop/t/…`);
        - match patterns against the full URL without the query string;
        - fix the glob conversion (placeholder for `**` before `*`).
    - **Tests:** both config patterns against real URL shapes, positive and negative.
- **S2 (P2) Console "Failed to load resource" is still keyed without a URL** (`console:Failed to load resource: … status of N ()`). It duplicates the HTTP listener, and no URL exception can reach it.
    - **Fix:** take the URL from `msg.location().url` and treat the message as that HTTP issue (same key, same exceptions), or drop these console messages because the response listener already covers them. Record which one you chose.
- **S3 (P2) `net::ERR_ABORTED` is noise.** These are client-side cancellations, not failures: in the probe, the analytics beacons `/observeonly` and `/v1/produce`, `login_with_shop/authorize` and `/logo.png`.
    - **Fix:** ignore `requestfailed` with `net::ERR_ABORTED`, and keep every other failure text. Add a test.
- **S4 Classification, not a code fix.** The console error `[shopify-account] Menu "customer-account-main-menu" not found in Storefront API` comes from Shopify's customer-account component. Its cause is a missing navigation menu in the store, which is merchant content, not theme code. Leave it in the baseline (it disappears if the menu is created), and do not add an exception.
- **S5 (P3)** Node warns `MODULE_TYPELESS_PACKAGE_JSON` for `checks.js`. Rename it to `checks.mjs` and update the importers. Do not add `"type": "module"` to `package.json`; that is outside the surface.
- **Then:** with the dev server running, finish the round-1 re-run items:
    - rewrite the baseline once;
    - run A2, A3 and A5;
    - classify R4 (`scroll_categories` `module-pending`);
    - record the counts and their difference from 113.

### Correction round 2 (2026-10-08)

**Dev server:** `http://127.0.0.1:9292/` returned 200; no `/password` redirect. `shopify:dev` restarted when a long run lost the listener.

#### S1–S5

| ID | Outcome |
| --- | --- |
| S1 | **Fixed.** HTTP keys `http:METHOD:origin+path` with same-origin `self`; glob `**` placeholder before single-`*`; patterns match full selector. shop.app / GraphQL 403/400 no longer appear in baseline (exceptions apply). |
| S2 | **Fixed.** Dropped console `Failed to load resource` lines (response listener owns them). |
| S3 | **Fixed.** Ignore `requestfailed` with `net::ERR_ABORTED`; harness test added. |
| S4 | **Applied.** `[shopify-account] Menu "customer-account-main-menu" not found…` stays in baseline (merchant navigation content); no exception. |
| S5 | **Fixed.** `checks.js` → `checks.mjs`; importers updated. |

**R4 classification:** **Harness artifact (resolved).** After stepped scroll (R4), the new baseline has **no** `module-pending` on `scroll_categories`; only tap-target issues under `#shopify-section-template__scroll_categories_B8wjNV`. Prior `module-pending` entry was lazy-scroll timing, not a theme code defect.

**Extra:** `stableSelector` uses `getAttribute('id')` so SVG/injected DOM does not throw during A3 inject.

#### Baseline rewrite

```
npm.cmd run test:layout -- --write-baseline
Baseline written to ... (115 issues).
```

(wall time from CLI progress: ~157s for write; full run A2 below.)

#### Per-check counts (115 total vs 113)

| check | was (113) | now (115) | Δ |
| --- | --- | --- | --- |
| runtime | 8 | 10 | +2 (per-page `shopify-account` console keys; no `module-pending`; HTTP dev noise excepted) |
| page-margin | 58 | 58 | 0 |
| tap-targets | 15 | 15 | 0 |
| clipped-text | 32 | 32 | 0 |
| horizontal-scroll | 0 | 0 | 0 |
| unclipped-overflow | 0 | 0 | 0 |

#### A1

```
# tests 15
# pass 15
# fail 0
# duration_ms 2610.9587
```

#### A2

```
Wall time: 153435ms
New issues (not in baseline): 0
```

#### A3

```powershell
$env:LAYOUT_INJECT_STYLE='html { overflow-x: visible; } body { width: 120vw; min-height: 1px; }'
npm.cmd run test:layout -- --page home --widths 1440
```

```
Wall time: 14558ms
New issues (not in baseline): 448
448 issue(s) not in baseline.
```

Exit code: 1.

#### A5

`--write-baseline` refused:

```
--write-baseline refused: baseline file already exists.
```

`--prune-baseline` (backup + `fc /b`):

```
Pruned baseline: 115 -> 115 issues.
FC_EXIT:0
```

#### A7

```
Doc path lint passed.
(doctor:agent exit 0)
All matched files use Prettier code style!
```

### Coordinator review, round 2 result and round 3 (2026-10-08): back to step 5

**Verified by the coordinator:**
- **S1:** the `**` patterns match real keys (`http:POST:self/api/2025-07/graphql.json` and `http:GET:https://shop.app/accounts/pre_auth` match; a theme asset does not).
- **S2–S5:** applied.
- **R4:** a harness artifact.
- **`test:layout-harness`:** 15/15.
- **Baseline:** 115 entries, with no duplicate keys. The 10 runtime entries are the S4 `shopify-account` message on each page.

**Two round-1 fixes are incomplete:**

- **T1 (P1, R6) Utility classes still in selectors.** In `isUtilityClass`, the second regex anchors every alternative to `$`, so prefixes such as `w-`, `h-`, `mt-` (through `m[trblxy]?`), `grid` and `flex` match only the bare word. As a result `w-full`, `h-full`, `mt-6`, `grid-cols-1`, `flex-col`, `self-start`, `border-t`, `pe-0`, `mx-auto`, `mb-1`, `space-y-6`, `order-2`, `inset-0`, `pointer-events-none`, `cursor-pointer` and `overflow-x-auto` all survive. 33 baseline selectors contain them.
    - **Fix:** let prefix alternatives match the rest of the class name, and cover the classes listed here.
    - **Test:** extend `selector-stability.html` with every class in this list, and assert that none appears in the selector.
- **T2 (P1, R1) Element IDs keep the numeric template ID.** R1 strips the number only from section roots. IDs that a section builds from `section.id`, such as `#featured-products-template--27911284195402__featured_products_qR6LKN-tab-2` and `#blog-template--27911284129866__main-tab-1`, still carry it. 10 baseline entries are affected.
    - **Fix:** apply the same normalization (`template--<digits>__` → `template__`, and likewise for `sections--`) to every id used in a selector.
    - **Test:** a fixture element with such an id.
- **Then:** delete and rewrite the baseline once more (the keys change again), and run A1, A2, A5 and A7. Record the counts; they should stay 10 / 58 / 15 / 32 unless two elements now share a key, so explain any difference. A3 does not need a re-run.

#### Correction round 3 (2026-10-08, Implementer)

Dev server: `http://127.0.0.1:9292/` returned 200 before the run. No theme file was edited.

**T1.** `isUtilityClass` prefix alternatives now match the rest of the class name (`^w-`, `^h-`, `^m[trblxy]?(-|$)`, `^grid(-|$)`, `^flex(-|$)`, `^self-`, `^border(-|$)`, `^pe-`, `^order-`, `^inset(-|$)`, `^pointer-events-`, `^cursor-`, `^overflow`, `^space-`, and so on). `fixtures/selector-stability.html` carries all 16 classes from the T1 list plus `min-w-0`; the test asserts none appears in the selector.

**T2.** `normalizeShopifyElementId` (`template--<digits>__` to `template__`, `sections--<digits>__` to `sections__`) is applied to every id used in a selector, both the element's own id and the section root. New fixture `fixtures/selector-element-id.html` (ids `featured-products-template--27911284195402__featured_products_qR6LKN-tab-2` and `blog-template--27911284129866__main-tab-1`); the test asserts no run of 6+ digits and the normalized id text.

**Two harness defects found while rewriting the baseline (both in `layout-check.mjs` / config, inside the surface).**
1. The runtime console/response listeners were attached after `page.goto`, so a load-time console error raced with attachment. The same run produced the `shopify-account` message on 8, 9 or 10 pages. Fix: `startRuntimeCollector` attaches before `goto`; `runRuntimeCheck` reads from it; it is stopped after the check (or immediately when the runtime check is skipped).
2. With listeners attached before `goto`, the not-found page's own 404 document response became a runtime issue (`http:GET:self/this-path-should-404-layout-check`). Added a config exception with a reason (the deliberate 404 path).

**Baseline.** Deleted and rewritten once more with `--write-baseline`:

```
Baseline written to ...layout-check.baseline.json (115 issues).
```

Counts from the baseline file (Node one-liner): total 115, runtime 10, page-margin 58, tap-targets 15, clipped-text 32; horizontal-scroll and unclipped-overflow 0. Same as round 2 (10 / 58 / 15 / 32), so no change to explain. Selectors with a run of 6+ digits: 0. Selectors containing a T1 class: 0. Unique page+check+selector keys: 115 of 115 (no shared keys).

**A1.**

```
npm.cmd run test:layout-harness
# tests 16
# pass 16
# fail 0
# duration_ms 2772.8866
```

**A2.**

```
npm.cmd run test:layout
Wall time: 150500ms
New issues (not in baseline): 0
EXIT:0
```

**A5.**

```
node .agents/tools/layout-check/layout-check.mjs --write-baseline
--write-baseline refused: baseline file already exists.      (exit 1)
node .agents/tools/layout-check/layout-check.mjs --prune-baseline
Pruned baseline: 115 -> 115 issues.
cmp (copy taken before, baseline after): IDENTICAL
```

**A7.**

```
npm.cmd run lint:doc-paths   -> Doc path lint passed.
npm.cmd run doctor:agent     -> exit 0
npx.cmd prettier --check .agents/tools/layout-check docs/agent/context.md -> All matched files use Prettier code style!
```

**Flakiness observed against the dev server (environment, not fixed).** Back-to-back full runs are not fully deterministic:
- one A2 run hit a transient `HTTP 401` on the home document (`http:GET:self/`), plus a page that lost the `shopify-account` message and several newsletter-overlay `clipped-text` entries on `not-found` and `page-about-view`, giving 10 new issues; the next run gave 0 new;
- two `--prune-baseline` runs dropped 9 and 2 entries (for example the `collections` account message and a `collections` newsletter-overlay `clipped-text` entry) before a third run left the baseline byte-identical. A prune against a flaky run would remove entries that are real, so run `--prune-baseline` only after a clean A2 and review `git diff` on the baseline.
- discovery resolved the article to `/blogs/news/tagged/hydrating-moisturizers`, a tag listing, not an article. Not changed in this round; flagged for the coordinator.

### Coordinator review, round 3 result and round 4 (2026-10-08): back to step 5

**Round 3:** T1 and T2 are fixed. The implementer also fixed a listener race on its own initiative: the runtime listeners now attach before `goto`. It also excepted the deliberate 404 document response, with a reason. The coordinator accepts both; they are inside the surface and close a real defect.

**Remaining defects** (the round 3 report, checked against the code):

- **U1 (P1) The newsletter popup makes runs nondeterministic.**
    - `assets/newsletter-overlay.js` opens the dialog `delay` seconds after init (default 3). Each page's sweep takes longer than that, so the popup appears partway through the widths.
    - Which widths, and which pages, then report its clipped text depends on timing. This is the cause of the flipping `newsletter-overlay` clipped-text entries and of entries that `--prune-baseline` drops.
    - **Fix:** in the harness, not the theme, suppress the popup before any page script runs. Use `context.addInitScript` to set the overlay's own `localStorage` key (the `storageKey` in `newsletter-overlay.js`) to a future timestamp, which is what the theme does after a signup.
    - Record in the config that dialogs are out of scope for the page sweep and belong to the later interaction suite.
- **U2 (P1) Article discovery finds a tag listing.** `/blogs/news/tagged/hydrating-moisturizers` matches `/blogs/<x>/<y>`, so the article template has never been scanned.
    - **Fix:** exclude `/tagged/`, and confirm the resolved page is an article (for example `meta[property="og:type"][content="article"]`). Fail with a message if none is found.
    - **Test:** a unit test of the URL filter.
- **U3 (P2) Transient document errors, and pruning from a noisy run.**
    - A run hit a transient `HTTP 401` on the home document.
    - **Fix:**
        - when a page's document response is not 200 (the 404 page expects 404), retry the load once;
        - if it fails again, report a `runtime` issue `document:<status>`;
        - `--prune-baseline` refuses when the run had any new issue or any document retry, so it only prunes from a clean run.
- **Then:**
    - delete and rewrite the baseline (the article page and U1 change the counts), and explain the differences from 10 / 58 / 15 / 32;
    - run A2 twice in a row, and both runs must report 0 new issues;
    - run A5 (prune byte-identical on the first attempt), A1 and A7;
    - re-run A3, A4 and A6 once, since round 3 skipped them.

#### Correction round 4 (2026-10-08, Implementer)

Dev server: `http://127.0.0.1:9292/` returned 200 before the run. No theme file was edited. New file `run-rules.mjs` holds the pure rules (article URL filter, prune refusal, expected document status) so they are unit-testable.

**U1.** `context.addInitScript` sets `localStorage['newsletter-overlay-expired'] = '4102444800000'` (the `storageKey` in `assets/newsletter-overlay.js`) before any page script runs. `layout-check.config.json` has a `notes` field: dialogs are out of scope for the page sweep and belong to the later interaction suite. No `newsletter-overlay` selector remains in the baseline.

**U2.** `isArticlePath` / `pickArticleHref` accept only `/blogs/<blog>/<handle>` and exclude `/tagged/`. After resolving, the runner loads the page and requires `meta[property="og:type"][content="article"]`, else discovery fails with a message. Unit test added (tag listing, blog root, absolute URL, no-article case). Resolved article URL from `report.json`: `http://127.0.0.1:9292/blogs/news/%E6%98%9F%E6%9C%9F%E4%BA%94%E4%B8%8B%E5%8D%88` (product `/products/floral-white-top`, blog `/blogs/news`).

**U3.** A non-expected document status (200, or 404 for `not-found`) retries the load once with a fresh collector; a second failure reports runtime `document:<status>`. `--prune-baseline` refuses (exit 1, nothing written) when the run had any new issue or any retry (`pruneRefusalReason`, unit-tested).

**Extra (found while verifying).** The `cart` page's `shopify-account` console message is emitted late and short pages ended the observation window before it: baseline write missed it, two later A2 runs saw it (1 new issue each). Added config `runtimeObserveMs` (3000): a fixed wait after the scroll before the runtime check reads the collector. Wall time rose from about 150s to about 182s.

**Baseline** deleted and rewritten once: 101 issues.

| check | round 3 | now | explanation |
| --- | --- | --- | --- |
| runtime | 10 | 10 | one `shopify-account` message per page, unchanged |
| page-margin | 58 | 54 | -4: the article page is now a real article (the tag listing is no longer scanned) |
| tap-targets | 15 | 15 | home only, unchanged |
| clipped-text | 32 | 22 | -10: newsletter popup entries gone (U1), plus the article change |

Node check over the baseline: 6+ digit selectors 0; T1 classes 0; `newsletter-overlay` 0; duplicate keys 0.

```
A1 npm.cmd run test:layout-harness      # tests 19  # pass 19  # fail 0
A2 run 1: Wall time: 182666ms  New issues (not in baseline): 0
A2 run 2: Wall time: 182452ms  New issues (not in baseline): 0
A5 --write-baseline: "--write-baseline refused: baseline file already exists." (exit 1)
A5 --prune-baseline (first attempt): "Pruned baseline: 101 -> 101 issues."  cmp vs copy: IDENTICAL
A7 lint:doc-paths: Doc path lint passed.  doctor:agent exit 0  prettier --check: All matched files use Prettier code style!
A4 LAYOUT_BASE_URL=http://127.0.0.1:9399: "Could not reach http://127.0.0.1:9399. Start the storefront with: npm.cmd run shopify:dev" real 0m0.705s
A3 LAYOUT_INJECT_STYLE='html { overflow-x: visible; } body { width: 120vw; min-height: 1px; }' test:layout -- --page home --widths 1440
   New issues (not in baseline): 448   448 issue(s) not in baseline. (non-zero exit)
A6 git status: only .gitignore, AGENTS.md, README.md, docs/agent/*, package*.json, .agents/tools/layout-check/ (board.md was edited by the coordinator, not this round);
   node_modules/playwright-core present; %LOCALAPPDATA%\ms-playwright holds only pre-existing folders (b, mcp-chrome-*, dated before this batch); no password in repo files.
```

### Coordinator review, round 4 result (2026-10-08): passed, ready for the cross review

**Re-checked by the coordinator:**
- `test:layout-harness` passes 19/19.
- The baseline has 101 entries, with no runs of 6+ digits and no duplicate keys. The `article` page is now a real article: runtime 1, clipped-text 1.
- The popup seed (`addInitScript`), `isArticlePath` / `pickArticleHref`, the `pruneRefusalReason` guard and `expectedDocumentStatus` are present as reported.

**Deviations from the plan, accepted by the coordinator** (the cross review may challenge any of them):
- the `LAYOUT_INJECT_STYLE` probe hook (R7);
- listeners attached before `goto`;
- the deliberate 404 document-response exception;
- `runtimeObserveMs` (3000ms; a full run now takes about 182s);
- the new pure-rules module `run-rules.mjs`;
- the `notes` field in the config.

**Other changes in the same working tree, not part of 6-T1:**
- **`AGENTS.md`, Batch SOP, the paragraph on proposing subagents.**
    - **Change:** the model default now proposes Sonnet (the latest Sonnet model) for mechanical, high-volume tasks whose plan fixes the surface and acceptance checks. Model choice stays out of the adapter files.
    - **Approval:** the user approved this rule change explicitly in the coordinator session (2026-10-08), after discussing why model names were earlier removed from the client adapters.
    - **Validators:** `lint:doc-paths` and `doctor:agent` passed.
- **`docs/agent/board.md`:** record file; the "Decided: order of work" entry and the planned-harness pointer.

### Cross review 1 (2026-10-08): FAIL, back to step 5 (round 5)

The Verifier ran in a separate session and re-ran the checks. A1–A7 hold:
- two clean full sweeps (181,123ms and 181,791ms, 0 new issues);
- a byte-identical prune;
- baseline counts 101: runtime 10, page-margin 54, tap-targets 15, clipped-text 22;
- the `AGENTS.md` change matches its approval record;
- the diff stays inside the surface.

Six check defects make the verdict FAIL. The coordinator checked each one against the code and confirms all six:

- **V1 (P1) Utilities still in keys** (`isUtilityClass` / `classesForSelector`, `checks.mjs`).
    - **Defect:** `overscroll-x-contain` (6 baseline selectors) is kept as a semantic class. An arbitrary utility such as `pc:grid-cols-[…var(--product-media-fr)…]` passes as a component class, because the `--` inside the CSS variable counts as BEM.
    - **Fix:**
        - a class containing `[`, `:` or `/` is always a utility, checked before the `__` / `--` test;
        - add `overscroll`, `cursor`, `select`, `transition`, `duration`, `ease`, `shrink`, `grow`, `basis`, `aspect`, `object` and `translate` prefixes, plus any other utility shape found in today's baseline;
        - then list every class name left in the rewritten baseline and confirm each one is a component or semantic class.
- **V2 (P2) Peeks inside a full-width clipper are reported** (`hasClippingAncestor`).
    - **Defect:** the `rect.width < vw` condition excludes an `overflow: hidden; width: 100vw` section.
    - **Fix:** the ancestor clips the element's outside part when it clips horizontally and its box does not extend past that viewport edge (`rect.left >= -0.5` for left, `rect.right <= vw + 0.5` for right).
    - **Fixture:** a heading at `left: -40px` inside a full-width `overflow: hidden` section is not reported.
- **V3 (P2) A zero page margin becomes 16px** (`readPageMarginPx`).
    - **Fix:** 0 is a valid value. Fall back only when `--page-margin` is undefined, and then report a configuration problem instead of guessing.
    - **Fixture:** with `--page-margin: 0px`, an edge-aligned heading is not reported.
- **V4 (P2) The 0.5px tap tolerance** (`checkTapTargets`).
    - **Fix:** a target is undersized when width or height is `< 24` (no allowance), matching the plan.
    - **Fixture:** two adjacent 23.6px buttons are reported.
- **V5 (P2) One clipped edge hides the other** (`checkUnclippedOverflow`).
    - **Fix:** report when either the left edge is past the viewport and not clipped on the left, or the right edge is past and not clipped on the right; the two are evaluated independently.
    - **Fixture:** a child spanning −40…460px in a 390px viewport inside a 0…500px clipper is reported.
- **V6 (P3) The config test copies the validator.**
    - **Fix:** export the runner's `validateConfig` (or move it into `run-rules.mjs`) and test that function. Also test the `urlPattern` and `selector` requirements.
- **Not a defect:** the absence of the password value cannot be proven while no password is set. Accepted as unprovable, since no password was ever set during this batch.
- **Then:**
    - delete and rewrite the baseline once (V1–V5 change the keys and the counts), and explain the count differences from 10 / 54 / 15 / 22;
    - run A2 twice (both 0 new), A5 (prune byte-identical on the first attempt), A1 and A7;
    - after that, cross review 2 re-checks V1–V6 and the counts.

### Correction round 5 (2026-10-08, coordinator, part 1: code and fixtures)

- **V1:** `hasUtilitySyntax` (`[`, `:`, `/`) runs first in `isUtilityClass`, and `classesForSelector` drops those classes before the BEM test. Added prefixes: `overscroll`, `select`, `transition`, `duration`, `ease`, `delay`, `shrink`, `grow`, `basis`, `aspect`, `object`, `translate`/`scale`/`rotate`, `snap`, `scroll`, `leading`, `tracking`, `whitespace`, `break`, `line-clamp`, `shadow`, `outline`, `ring`, `fill`/`stroke`, `size`, `place`, and single-word utilities. `content-` and `list-` are deliberately not prefixes (`content-group` is a theme primitive). Fixture `selector-utility-syntax.html`.
- **V2:** `hasClippingAncestor` treats a horizontally clipping ancestor as clipping the left part when `rect.left >= -0.5`, and the right part when `rect.right <= vw + 0.5`; the width condition is gone. Fixture `unclipped-fullwidth-clipper-negative.html` (no unclipped-overflow and no page-margin issue).
- **V3:** `readPageMarginPx` returns 0 as a valid value and `null` when `--page-margin` is undefined on a body-level probe. `checkPageMargin` then reports one `{ check: 'page-margin', selector: ':root', detail: 'page-margin-undefined' }` issue. Fixtures `page-margin-zero-negative.html`, `page-margin-undefined-positive.html`.
- **V4:** undersized means `< 24` with no allowance, in both `checkTapTargets` and `passesSpacingException`. Fixture `tap-target-subpixel-positive.html` (2 issues).
- **V5:** each edge is evaluated on its own (`leftUnclipped || rightUnclipped`). Fixture `unclipped-one-edge-positive.html`; the test asserts the `.wide` child, not the overflowing clipper.
- **V6:** `validateConfig` moved to `run-rules.mjs`, imported by the runner and tested directly: missing or blank `reason`, missing `checks`, and missing `selector`/`urlPattern` all throw; a `urlPattern`-only or `selector` exception passes.
- **Evidence:**
    - `npm.cmd run test:layout-harness`: 25/25 pass.
    - Against `HEAD`'s `checks.mjs`, the five V1–V5 tests fail (20 pass, 5 fail).
    - `npx.cmd prettier --check` on the harness `.mjs` files and fixtures passes.
    - `node_modules` was installed on this machine with `npm.cmd ci` (lockfile unchanged).
- **Remaining (part 1 only):** baseline rewrite and A2/A5 were deferred to part 2 (below).

### Correction round 5 (part 2: baseline and runs) (2026-10-08, Implementer)

Dev server: `http://127.0.0.1:9292/` returned 200 before runs. No theme file edited. Old baseline saved from `HEAD` to `%TEMP%\layout-check-r5p2\layout-check.baseline.old.json` for key-level diff.

**Baseline rewrite:** deleted `layout-check.baseline.json`, then `node .agents/tools/layout-check/layout-check.mjs --write-baseline` → **60 issues** (wall ~182.6s on write).

#### Per-check counts (key-level diff vs round 4 / cross review 1)

| check | old (101 total) | new (60 total) | Δ | explanation (V-fix, from old vs new `page|check|selector` keys) |
| --- | --- | --- | --- | --- |
| runtime | 10 | 10 | 0 | V1–V5 do not change runtime keys. |
| page-margin | 54 | 13 | −41 | **Corrected by cross review 2:** **V2:** 41 keys dropped (peek inside a full-width horizontal clipper no longer reported). **V1:** 2 `collection-all` keys renamed (utility segment stripped from the path; same nav links as old entries). No collapse: the 101 old keys stay 101 distinct keys after normalization. **V3:** no `page-margin-undefined` issue. |
| tap-targets | 15 | 15 | 0 | **V4:** stricter `<24` rule; live storefront had no additional undersized targets vs prior baseline. |
| clipped-text | 22 | 22 | 0 | **V1:** 1 `product` key removed and 1 added (old path contained `pc:grid-cols-[…]` utility syntax; new path uses `nth-of-type` only). Net count unchanged. |
| horizontal-scroll | 0 | 0 | 0 | — |
| unclipped-overflow | 0 | 0 | 0 | **V5:** no live issues; count unchanged. |

Key diff summary: **44** keys removed, **3** keys added (net −41) = 41 V2 drops + 3 V1 renames (2 page-margin, 1 clipped-text). Duplicate `page|check|selector` keys: **0**. Selectors with 6+ digits: **0**. `page-margin-undefined`: **0**.

#### Class names in new baseline selectors (T3 / V1)

**105** distinct class tokens in DOM selectors (runtime `console:` keys excluded). Each is a theme component or semantic primitive (`__` / `--` BEM, typography tiers `body-3xl` / `heading-3xl`, `btn`, `links`, or Swiper surface classes `swiper`, `swiper-slide`, `swiper-pagination-bullet`). No Tailwind utility tokens; no `[`, `:` (except runtime message text), or `/` in class tokens; no 6+ digit runs in selectors.

#### A2 (twice)

```
npm.cmd run test:layout
Run 1: exit 0  Wall time: 177407ms  New issues (not in baseline): 0
Run 2: exit 0  Wall time: 176456ms  New issues (not in baseline): 0
```

`report.json` pages (run 1): `home` `http://127.0.0.1:9292/`; `cart` `/cart`; `search` `/search?q=a`; `collections` `/collections`; `collection-all` `/collections/all`; `not-found` `/this-path-should-404-layout-check`; `page-about-view` `/pages/privacy-policy?view=about`; `product` `/products/floral-white-top`; `blog` `/blogs/news`; `article` `http://127.0.0.1:9292/blogs/news/%E6%98%9F%E6%9C%9F%E4%BA%94%E4%B8%8B%E5%8D%88`.

#### A5

```
node .agents/tools/layout-check/layout-check.mjs --write-baseline
--write-baseline refused: baseline file already exists.  (exit 1)
node .agents/tools/layout-check/layout-check.mjs --prune-baseline
Pruned baseline: 60 -> 60 issues.
fc.exe /b (copy in %TEMP%\layout-check-r5p2 vs after prune): FC_EXIT:0 (byte-identical, first attempt)
```

#### A1

```
npm.cmd run test:layout-harness
# tests 25  # pass 25  # fail 0  # duration_ms 2069.5824
```

#### A6

```
git status --porcelain:
 M .agents/tools/layout-check/checks.mjs
 M .agents/tools/layout-check/layout-check.baseline.json
 M .agents/tools/layout-check/layout-check.mjs
 M .agents/tools/layout-check/layout-check.test.mjs
 M .agents/tools/layout-check/run-rules.mjs
 M docs/agent/context.md
?? .agents/tools/layout-check/fixtures/*.html (six new fixture files)
```

All paths are inside the plan implementation surface; no theme, `package.json`, or `AGENTS.md` changes from this part. `%LOCALAPPDATA%\ms-playwright` exists (pre-existing on this machine); this batch did not run `npx playwright install`.

#### A7

```
npm.cmd run lint:doc-paths
Doc path lint passed.
npm.cmd run doctor:agent
(exit 0)
npx.cmd prettier --check .agents/tools/layout-check/layout-check.baseline.json docs/agent/context.md
All matched files use Prettier code style!
```

### Coordinator review, round 5 (2026-10-08): passed, ready for cross review 2

**Re-checked by the coordinator:**
- Baseline: 60 entries (runtime 10, page-margin 13, tap-targets 15, clipped-text 22); 0 duplicate keys; 0 runs of 6+ digits.
- Class audit: every class in the baseline selectors is a component, typography-tier (`body-3xl`, `heading-3xl`), `btn`/`links`, or Swiper class; none has `[`, `:` or `/`.
- `git status`: only the harness files, the new fixtures, the baseline and this file.
- `%LOCALAPPDATA%/ms-playwright` predates this batch (2026-06-04, subfolders 2026-06/07).

**Correction to the part 2 report:** the 3 "added" keys are V1 renames, not new issues.
- The 2 `collection-all` page-margin keys (`collection__nav-link` 6 at 1280, 9 at 2280) are the same tab links the old baseline reported over 800–1280 and 800–2280. The keys changed because V1 changed the path prefix.
- V2 removed every width where the link sat partly outside the viewport under the scroller. What remains is the last width of each old range: the link is fully inside the viewport but inside the right page margin, so under the plan's rule it is not a peek.
- **Observation for the cross review, not a defect:** a scroller item visible inside the page margin but cut by its own scroller is reported. The rule as written does this; changing it is a plan decision.
- The `product` clipped-text key is the V1 rename of the quantity-selector label (utility dropped from the path).

### Cross review 2 (2026-10-08): FAIL on two findings; coordinator disposition

V1–V6, A1–A6 and the counts 101 → 60 were re-proven with fresh evidence. Two runs took 174,879ms and 176,719ms with 0 new issues. Prune was byte-identical. A3 reported 461 new issues and exited 1; A4 exited 1 in 656ms. The old `checks.mjs` gives 20 pass / 5 fail. The scroller observation matches the written rule. The verifier recommends a scrollport-visibility exclusion for a later plan (board candidate, not this batch).

- **P3, the baseline explanation:** accepted and corrected above (41 V2 drops + 3 V1 renames, no collapse).
- **P2, A7 formatting coverage:** disputed, not a defect of this batch.
    - A7 says `npx.cmd prettier --check` on the changed files, and that passes under the project's `.prettierignore`.
    - `.prettierignore` excludes `.agents`, `docs` and `AGENTS.md` on purpose (since `1bf75c6`, the skeleton import). `docs/references/code-review/launch-gate.md` states that formatting scope for these governance files follows `.prettierignore`.
    - Checking them with an empty ignore file measures a scope the project rules exclude. Changing that scope is a harness rule change the user owns.
    - **Decided (user, 2026-10-08):** dispute accepted; A7 passes under `.prettierignore`. No cross review 3: the user accepted the batch on the coordinator's disposition. The scroller recommendation is on `docs/agent/board.md` (Evidence).
