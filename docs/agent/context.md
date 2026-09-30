# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-30.

## Plan: component loading by init interception (batch 5-H)

Status: authorized by the user (2026-09-30, "可以" to commit and execute 5-H); executing. 5-R1 (`39944ff`) and 5-T1 (`1dd8347`) are committed; their full execution records are in `git show 23b0cd7:docs/agent/context.md`. The H spike (`assets/base.js`, `assets/alpine.adapter.js`) is saved in the session scratch and is the starting point. Review tier: **Ask** (`assets/*.js`, the user-owned runtime reference). Implementer: coordinator (the spike is the starting point); reviewer: GPT.

**Outcome.** Every Alpine component root waits for its module at the moment Alpine initializes it, on every path, so "X is not defined" cannot occur by construction. The DOM scan survives only as download-ahead. The runtime reference states the principle (board, decision 2026-09-30).

**Implementation surface.**

- `assets/alpine.adapter.js`: `holdUntilReady(shouldHold)` over `Alpine.interceptInit`; `defer` is removed if nothing uses it.
- `assets/base.js`: `holdForModule` interceptor (import, or observe for `data-module-lazy`, then mount; a failed import stays held); `scanModules` as download-ahead for non-lazy live roots; the claim/defer scanner removed; `activateModuleRoot` without the mount-on-failure.
- `assets/https.js`: `SectionRefresher.replaceRegion` keeps `scanModules` only as download-ahead, or drops it; the contract comment matches.
- `docs/references/architecture/javascript-runtime.md` (user-owned; editing it is part of this authorization): the module loading section rewritten: the interception contract, download-ahead, `data-module-lazy`, failure behavior, and the principle that correctness never rests on scanning plus lint while `data-*` scanning is reserved for progressive enhancement.
- Per-case workarounds from 5-R1 are kept: `countdown-timer.js` importing `flip-digit` and `openQuickView()` importing the quick view modules now act as download-ahead, not as correctness.
- `layout/theme.liquid`: the core-entry comment only (widened by the user, 2026-09-30: it still described claiming roots).
- A harness, kept with the other batch harnesses, plus MCP browser checks recorded here.

**Acceptance checks.**

- H1: harness running the vendored Alpine 3.15.3 walker (`initTree`) with a minimal DOM stub, or a browser check through the MCP where a stub cannot run it: a module root is held until its module resolves, then initialized; a root cloned from `x-for` template content is held the same way; nested roots load in parallel through the prefetch; a `data-module-lazy` root loads only after intersection; a failed import leaves the root held with no expression error; a held `data-module-lazy` root moved within the document (removed and reinserted in one task) still loads when scrolled near. Each check fails when the interceptor is removed.
- H2: MCP, Slow 4G + 4x CPU, cold start: search drawer, `/search` page input, collection page quick view, product page related products: 0 expression errors, 0 roots left held.
- H3: MCP tier 1 sweep, desktop and mobile, the page set in the board's H spike entry: all clean.
- H4: `grep -rn "claimModuleRoot|__themeModuleClaimed" assets` (no `rg` on the home machine) → no match; `interceptInit` appears only in `assets/alpine.adapter.js`.
- H5: `npm.cmd run lint:theme`, `lint:compat`, `test:theme-check`, `lint:doc-paths`, Prettier on changed files.
- H6 (user): Theme Editor section reload and block reorder on a section with components, no console error. Done once on the spike for search (2026-09-30).

## Progress

Code complete; verification remaining. WIP committed as `6d68b85`; the follow-up below is uncommitted. Nothing is reviewed.

Done:

- `assets/alpine.adapter.js`: `holdUntilReady(shouldHold)` added over `alpine.interceptInit`; the unused `defer` export removed.
- `assets/base.js`: the H spike as the implementation: `holdForModule` interceptor registered with `adapter.holdUntilReady`, `activateModuleRoot` imports then mounts and stays held on failure, `scanModules` download-ahead only (non-lazy live roots; also called on a held root's subtree), `liveModuleRoots` helper; `claimModuleRoot` / `activateClaimedModuleRoot` / `__themeModuleClaimed` removed.
- `assets/https.js`: `replaceRegion` doc comment matches download-ahead plus interceptor hold (code unchanged).
- `docs/references/architecture/javascript-runtime.md`: load order note, the Module Discovery Contract rewritten (interception on every path, download-ahead, `data-module-lazy`, failure stays held, the user's principle on scanning versus progressive enhancement), Adapter API row `defer` → `holdUntilReady`, lifecycle table rows.
- H4 pass: no `claimModuleRoot` / `__themeModuleClaimed` in `assets`; `interceptInit` only in `assets/alpine.adapter.js`.
- H5 pass: `lint:theme`, `lint:compat`, `lint:doc-paths`, `test:theme-check` (141 files, no offenses), Prettier on the four changed files.
- Follow-up (coordinator, 2026-09-30, user: "可以"): the adapter's `holdUntilReady` comment no longer cites the removed `defer`; `setupMutationObserver` in `assets/base.js` skips removed nodes that are connected again when it runs, so a moved lazy root keeps its observer instead of staying held forever (reference row "Lazy observer release on DOM removal" updated); `layout/theme.liquid` core-entry comment describes the interceptor instead of claiming. `docs/agent/board.md` cleaned: the 5-R1 regression table, the A/B/D discussion and spike logs replaced by the H decision; backport entry retargeted from D to H.
- H4 and H5 rerun after the follow-up: pass (`lint:theme`, `lint:compat`, `test:theme-check` 141 files no offenses, `lint:doc-paths` passes, now including the previously failing `assets/section-pagination.js` citation; Prettier on the five changed files).
- H1–H3 browser verification (implementer, 2026-09-30, Chrome DevTools MCP on `http://127.0.0.1:9292`, `shopify theme dev` already on :9292). Scratch copies (in the repo root and `.agent-scratch-h1/`, identical to the working files) removed by the coordinator afterwards. No `assets/` code changes from verification (`git diff --stat` for `base.js` / `alpine.adapter.js` unchanged after negative controls).

**H1** (`/cart`, fixtures injected with `Alpine.initTree`; module ids from theme markup/import map).

| Sub | Positive (5-H) | Negative control |
| --- | --- | --- |
| (1) `data-module-id="card-gallery"` / `x-data="cardGallery"` | **Pass.** `heldSync` and `heldMicrotask` true (`x-ignore`, no `_x_dataStack`); initialized after module load. | **Fail (expected).** Pre-5-H (`6d68b85^` over assets, Slow 4G): `heldSync` false. |
| (2) `x-for` clones of `data-module-id="flip-digit"` / `x-data="flipDigit()"` + `x-effect="updateDigit(digit)"` | **Pass.** 3 clones, `allInit` true, 0 captured expression errors. | **Fail (expected).** Pre-5-H + Slow 4G: console `Alpine Expression Error: flipDigit is not defined` and `updateDigit is not defined` (warn level; not `console.error`). |
| (3) Nested `product-card` + `drag-scroll` (parallel prefetch) | **Pass.** `product-card.js` and `drag-scroll.js` request start times 0.2 ms apart (`delta` 0.2). | (not required) |
| (4) `data-module-lazy` + `data-module-id="hover-card"` / `x-data="hoverCard()"` below fold | **Pass.** `heldBeforeScroll` true, no `hover-card.js` before scroll; requested and initialized after `scrollIntoView`. | **Fail (expected).** Pre-5-H: `held` false (no lazy hold). |
| (5) `data-module-id="does-not-exist"` | **Pass.** `stillHeld` true; 1 `[Theme] Failed to load module` error; 0 expression errors. | **Fail (expected).** Pre-5-H: `stillHeld` false (mount-on-failure). |
| (6) Lazy `card-gallery` moved with `insertBefore` in one task | **Pass.** `heldAfterInit`/`heldAfterMove` true, no request until scroll, then initialized. | **Fail (expected).** With `node.isConnected` guard removed in `setupMutationObserver`: `initialized` false, `stillHeld` true, no module request after scroll. Guard restored; diff unchanged. |

**H2** (Slow 4G + 4× CPU, `ignoreCache` reload per path; held = `[data-module-id][x-ignore]` outside `<template>`; Alpine expression errors from per-navigation console capture + page console review).

| Path | Held roots | Expression errors |
| --- | --- | --- |
| Home → predictive search drawer, query `shirt` | 0 | 0 |
| `/search?q=shirt&type=product` (search input) | 0 | 0 |
| `/collections/all` → `.product-card__quick-view-trigger` | 0 | 0 |
| `/products/black-leather-bag` → related products (scroll) | 0 | 0 |

**H3** (desktop 1280×800 unthrottled unless noted; scroll to bottom; 5–13 s settle; metrics: held module roots, uninitialized `[x-data]` outside `<template>`, captured Alpine/`[Theme] Failed to load module` errors, `resource` entries with `responseStatus >= 400` after scroll). Platform noise not counted in expression capture (`customer-account`, HotReload, hCaptcha, etc.). **Gift-card product page: not run** — no gift-card product in `joey-new-store` (`/products/gift-card` 404; search `gift` 0 products). Multi-variant product: `/products/classic-varsity-top` (3 variants via `.js`); single-variant: `/products/black-leather-bag` (1 variant).

| Page | held | uninit `x-data` | expr | failed req (≥400) | overflow (mobile) |
| --- | --- | --- | --- | --- | --- |
| `/` | 0 | 0 | 0 | 0 | — |
| `/collections/all?filter.v.availability=1&sort_by=price-ascending` | 0 | 0 | 0 | 0 | — |
| `/collections` | 0 | 0 | 0 | 0 | — |
| `/products/classic-varsity-top` | 0 | 0 | 0 | 0 | — |
| `/products/black-leather-bag` | 0 | 0 | 0 | 0 | — |
| `/search?q=shirt&type=product` | 0 | 0 | 0 | 0 | — |
| `/cart` | 0 | 0 | 0 | 0 | — |
| `/blogs/news` | 0 | 0 | 0 | 0 | — |
| Article `/blogs/news/星期五下午` | 0 | 0 | 0 | 0 | — |
| 404 `/pages/does-not-exist-h3` | 0 | 0 | 0 | 0 | — |
| Mobile `/` | 0 | 0 | 0 | 0 | no |
| Mobile `/collections/all` | 0 | 0 | 0 | 0 | no |
| Mobile `/products/black-leather-bag` | 0 | 0 | 0 | 0 | no |

- GPT review round 1 (2026-09-30): **FAIL**, two findings. (1) A held root removed from the document and reinserted in a later task stayed held forever: `releaseModuleRoots` stopped observing but left `__themeModulePending` and `x-ignore`, and Alpine skips an ignored root before the interceptor runs (reproduced by the reviewer with a lazy `hover-card` root; the same holds for a non-lazy root detached before its import resolves). (2) The adapter export list still names the removed `defer` in `docs/references/architecture/javascript-runtime.md` (Adapter row) and `AGENTS.md` (Tech Stack).
- Round 1 fixes (coordinator, 2026-09-30): `assets/alpine.adapter.js` gains `releaseHold(el)` (removes `x-ignore` / `_x_ignore` without initializing); `releaseModuleRoots` in `assets/base.js` now also drops `__themeModulePending` and calls `adapter.releaseHold` for every held root that left the document (lazy or not), so Alpine's mutation observer re-initializes a reinserted root (it has no `_x_marker`) and the interceptor holds it again from a clean state; a double `mount` after a reinsertion race is a no-op because Alpine's `initTree` skips marked elements (checked in `assets/vendor-alpine.min.js`). Reference: Adapter row lists `holdUntilReady` and `releaseHold`, API table gains `releaseHold`, release row rewritten. `AGENTS.md` line 12 (Tech Stack adapter list) updated the same way after the user widened the surface ("可以", 2026-09-30); `lint:doc-paths` and Prettier pass; `doctor:agent` cannot run on this machine (`smol-toml`, declared in `package.json` and the lockfile, is missing from `node_modules`; environment, not this change). Validators after the fix: `lint:theme`, `lint:compat` (exit 0), `test:theme-check` 141 files no offenses, `lint:doc-paths`, Prettier on the three changed files: pass. Not yet rerun in a browser: H1 (6) plus the new case (7) below.

- GPT review round 2 (2026-09-30): **PASS** (Ask tier). Proven in the browser: a lazy root removed and reinserted in a later task loads on scroll; a non-lazy root removed before its import resolves initializes exactly once after reinsertion (also when reinserted after the import); a lazy root moved in one task stays observed; a root never reinserted stays uninitialized without errors. The `defer` mentions are gone; H2 spot check (predictive search, quick view) and H4 pass; validators pass. Unproven, left to H6: the real Theme Editor unload sequence. If the editor kept an unloaded section connected until a pending import resolved, `releaseModuleRoots` (called on unload) would let that root mount inside the dying section; Alpine then destroys it when the section is removed, so the worst case is a wasted init, not a leak or error.
- Coordinator review (2026-09-30): agrees with PASS; the diff was re-read against the round 1 findings and the vendored Alpine walker.
- H6 (user, 2026-09-30, final code): Theme Editor section reload and block and section reorder, no theme error and no blank component. Console showed only platform messages: repeated `Permissions policy violation: unload is not allowed` (no theme code registers `unload`, `pagehide`, or `beforeunload`; grep over `assets/`, `layout/`, `sections/`, `snippets/`, `blocks/`) and the known `shop.app` framing CSP block. **All acceptance checks H1–H6 pass.**

Remaining:

- Then commit on the user's request, move the durable contract (already in `javascript-runtime.md` and `AGENTS.md`), update `docs/project.md` Status, and clear this file.
