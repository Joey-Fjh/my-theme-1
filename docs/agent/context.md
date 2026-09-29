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
- A harness, kept with the other batch harnesses, plus MCP browser checks recorded here.

**Acceptance checks.**

- H1: harness running the vendored Alpine 3.15.3 walker (`initTree`) with a minimal DOM stub, or a browser check through the MCP where a stub cannot run it: a module root is held until its module resolves, then initialized; a root cloned from `x-for` template content is held the same way; nested roots load in parallel through the prefetch; a `data-module-lazy` root loads only after intersection; a failed import leaves the root held with no expression error. Each check fails when the interceptor is removed.
- H2: MCP, Slow 4G + 4x CPU, cold start: search drawer, `/search` page input, collection page quick view, product page related products: 0 expression errors, 0 roots left held.
- H3: MCP tier 1 sweep, desktop and mobile, the page set in the board's H spike entry: all clean.
- H4: `rg -n "claimModuleRoot|__themeModuleClaimed" assets` → no match; `interceptInit` appears only in `assets/alpine.adapter.js`.
- H5: `npm.cmd run lint:theme`, `lint:compat`, `test:theme-check`, `lint:doc-paths`, Prettier on changed files.
- H6 (user): Theme Editor section reload and block reorder on a section with components, no console error. Done once on the spike for search (2026-09-30).

## Progress

Paused by the user (2026-09-30), to continue on the work machine. Uncommitted work in progress on this machine; nothing below is reviewed.

Done:

- `assets/alpine.adapter.js`: `holdUntilReady(shouldHold)` added over `alpine.interceptInit`; the unused `defer` export removed.
- `assets/base.js`: the H spike as the implementation: `holdForModule` interceptor registered with `adapter.holdUntilReady`, `activateModuleRoot` imports then mounts and stays held on failure, `scanModules` download-ahead only (non-lazy live roots; also called on a held root's subtree), `liveModuleRoots` helper; `claimModuleRoot` / `activateClaimedModuleRoot` / `__themeModuleClaimed` removed.
- `assets/https.js`: `replaceRegion` doc comment matches download-ahead plus interceptor hold (code unchanged).
- `docs/references/architecture/javascript-runtime.md`: load order note, the Module Discovery Contract rewritten (interception on every path, download-ahead, `data-module-lazy`, failure stays held, the user's principle on scanning versus progressive enhancement), Adapter API row `defer` → `holdUntilReady`, lifecycle table rows.
- H4 pass: no `claimModuleRoot` / `__themeModuleClaimed` in `assets`; `interceptInit` only in `assets/alpine.adapter.js`.
- H5 pass: `lint:theme`, `lint:compat`, `lint:doc-paths`, `test:theme-check` (141 files, no offenses), Prettier on the four changed files.
- H2 and H3 were run on the spike (board, H spike entry); the finalized code differs from the spike only by the removed unused `defer` export and a comment, so they are expected to hold. Rerun both before review.

Remaining:

- H1 in the browser through the MCP, on a page that does not load the fixture modules (planned: `/cart`): inject fixtures and check (1) a `cardGallery` root held (`x-ignore`, no `_x_dataStack`) right after insertion, then initialized; (2) an `x-for` clone of a `flipDigit` root initialized with no expression error; (3) a parent root and a nested child root, both unloaded, whose module requests start in parallel; (4) a `data-module-lazy` `hoverCard` root placed far below the fold not requested until scrolled near; (5) `data-module-id="does-not-exist"` stays held with only the `[Theme] Failed to load module` error. Negative control: serve the `HEAD` versions of `assets/base.js` and `assets/alpine.adapter.js` (via `git show`, then restore), rerun, and confirm (1), (2), (4), (5) fail. The MCP browser runs `--isolated`: restart `shopify theme dev` if needed and have the user enter the store password in the MCP window.
- Rerun H2 and H3 on the final code; H6 by the user (Theme Editor reload and reorder).
- Record results here, then GPT review (Ask tier).
