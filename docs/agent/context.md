# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-21.

Previous batch: H5 (pre-push check) closed; records `git show b5a5ae1:docs/agent/context.md`.

## Batch 6-F2: pagination section refresh and the loading status

**Status:** executed and reviewed (2026-10-21): Ask review PASS in round 3. Not committed.

**Outcome** (corrected after review round 1, accepted by the user 2026-10-21; original: "Collection and blog pagination update in place through the Section Rendering API instead of falling back to a full navigation"). Blog pagination (`section-pagination`) keeps updating in place through `?sections=`; when a section comes back `null`, a link click (`updateHistory` true) falls back to a full navigation, while a Back or Forward (`updateHistory` false) leaves the page as it is; collection pagination, owned by `assets/collection-filters-helpers.js` (`?section_id=`), is out of scope and stays in place; and the shared loading indicator is announced to screen readers and gives a visible signal under reduced motion.

**Evidence.**
- `assets/section-pagination.js` `_executeFetch` calls `ShopifyHttp.getJSON(url + '?sections=…')`, which inherits the `Http` default `Accept: application/json` (`assets/https.js`). On the dev storefront that request answered 404 and the `.catch` navigated to the full page (backlog, 2026-10-13). The filter requests in `assets/collection-filters-helpers.js` override `Accept` and work. Shopify's Section Rendering API doc says `?sections=` returns a JSON object keyed by section ID, with `null` for a section that failed to render; it says nothing about `Accept` (Shopify Dev MCP, `shopify.dev/docs/api/ajax/section-rendering`).
- `snippets/loading.liquid`: `role="status"` and its `aria-label` sit inside a wrapper with `aria-hidden="true"`, and the whole wrapper is toggled by `x-show`, so the status is neither exposed nor announced. Under `prefers-reduced-motion: reduce` the ring is still at `opacity: 0.65` (`tailwind/tailwind.animates.css`). Five consumers: `sections/blog.liquid`, `sections/collection.liquid`, `sections/search-overlay.liquid`, `snippets/search-predictive-panel.liquid`, `snippets/search-results-tabs.liquid`.

**Changes.**
1. Pagination: pass `headers: { Accept: '*/*' }` on the `getJSON` call in `_executeFetch`. If a response section is `null`, fall back to full navigation as on error, rather than rendering nothing. No change to `assets/https.js` defaults (other callers depend on them).
2. Loading markup: the spinner wrapper keeps `x-show`, `x-cloak` and `aria-hidden="true"` and loses `role` and `aria-label`. A sibling `role="status"` element is always in the DOM (not under `x-show`), holding a `sr-only` span with the existing `accessibility.loading` text, shown with `x-show="isLoading"`. Without JavaScript the status region is empty and nothing is visible. No new locale key.
3. Reduced motion: replace the still 0.65 ring with the user's pick (decision below). Only the `@media (prefers-reduced-motion: reduce)` rule for `.spinner` / `.spinner-lg` changes.

**User decision needed when authorizing:** reduced-motion signal. (a) Coordinator recommendation: full-opacity ring with a slow opacity pulse (no rotation or movement; opacity change is not motion under WCAG 2.3.3), about 1.6 s, using the motion tokens if one fits. (b) Static full-opacity ring, no animation. Basis: own judgment.

**Dependencies.** `npm.cmd run shopify:dev` running for the runtime checks; a collection with more than one page and a blog with more than one page of articles in the dev store (if the blog has none, record it Blocked for data).

**Implementation surface:** `assets/section-pagination.js`, `snippets/loading.liquid`, `tailwind/tailwind.animates.css`, `assets/tailwind.output.css` (rebuilt by `npm.cmd run build:tw`, not edited by hand), `docs/agent/context.md`.

**Acceptance checks.**
1. `git diff --name-only` lists only surface files.
2. (Corrected after review round 1, accepted by the user 2026-10-21.) Chrome DevTools MCP on the dev storefront, blog `/blogs/news` page 1 → page 2 via the pagination link: one `?sections=` request with status 200 and a JSON response; no document navigation (same `performance.timeOrigin`); the URL updates through `pushState`; Back restores page 1 in place. A `null` section with `updateHistory` true causes one full navigation, with `updateHistory` false none, and no loop. Regression only: collection page 1 → 2 still issues `?section_id=` 200 and updates in place.
3. An accessibility snapshot taken while `isLoading` is true (throttled network) shows a `status` node named or containing "Loading"; when idle the status node is present and empty; the spinner is not in the accessibility tree.
4. With JavaScript disabled, no loading text or spinner is visible on collection and search pages.
5. Under emulated `prefers-reduced-motion: reduce`, computed style of `.spinner` matches the chosen option (no `rotate` animation in either case).
6. `review-animations` run on the motion diff (trigger: reduced-motion handling); its output recorded below.
7. `npm.cmd run lint:theme`, `npm.cmd run lint:compat`, `npm.cmd run scan:compat`, `npm.cmd run lint:i18n` pass; `npm.cmd run test:layout` with 0 new issues; `git diff --check` clean.

**Review tier:** Ask (Liquid markup in `snippets/` and `assets/*.js`). A separate verifier session; complete only on PASS.

## Progress

- Authorized (user, 2026-10-21), coordinator executes in this session. Reduced-motion option (a) by the user's acceptance of the recommendation.
- Changes as built: `assets/section-pagination.js` `_executeFetch` falls back to full navigation when any requested section is `null`; `snippets/loading.liquid` spinner wrapper is `aria-hidden` only, with a sibling always-present `role="status"` `sr-only` region whose text shows on `isLoading` (doc comment updated); `tailwind/tailwind.animates.css` reduced motion runs `spinner-pulse` (opacity 1 → 0.35 → 1, 1.6 s `ease-in-out`, fixed duration beside `spinner-turn`, since the motion tokens are 250–500 ms transition durations); `assets/tailwind.output.css` rebuilt (`build:tw`, 6 lines added, 2 removed).
- Check 1: `git diff --name-only` = surface files plus `docs/agent/backlog.md` (record file).
- Check 2: blog `/blogs/news` page 1 → 2: `GET /blogs/news?page=2&sections=template--27911770603594__main` 200 JSON, same `performance.timeOrigin`, URL `?page=2` via `pushState`, first article link changed; Back: `GET /blogs/news?sections=…` 200, same document, page 1 articles restored. `null` fallback: `sectionId` set to `does-not-exist` → `?page=3&sections=does-not-exist` 200, then a document request for `?page=3` (full navigation). Collection pagination is not a `section-pagination` path: `/collections/all` pages through `assets/collection-filters-helpers.js` (`?section_id=…` 200, in place), unchanged by this batch.
- Check 3 (Slow 3G during the blog fetch): snapshot shows `status atomic live="polite"` containing "Loading"; idle snapshot shows the same `status` node empty; no spinner node in the tree (both `.spinner` have an `aria-hidden="true"` ancestor, no `role`).
- Check 4: MCP cannot disable JavaScript; static evidence instead: the spinner wrapper and the status text both carry `x-cloak`, hidden by `[x-cloak]` in `assets/tailwind.output.css`, and the status container is `sr-only`. A real no-JS look stays a browser-pass row.
- Check 5: emulated `prefers-reduced-motion: reduce` → both `.spinner` compute `animation-name: spinner-pulse`, `1.6s`; no rotation.
- Check 6, `review-animations` (SKILL.md and STANDARDS.md read): pass. Justified (state indication for an in-flight request); opacity only (standard 7); reduced motion keeps opacity and drops movement, as standard 8 and STANDARDS.md prescribe; sub-300 ms (standard 4) and enter/exit easing (standard 3) do not apply to a continuous loading loop; `ease-in-out` fits a symmetric loop. No findings.
- Check 7: `lint:theme` passed (3 existing `dead-setting-unprovable` notices); `lint:compat` passed; `scan:compat` passed; `lint:i18n` passed; `lint:liquid-syntax` passed; `test:layout` 0 new issues (wall 195 s); `git diff --check` clean.

### Deviations

- **Accept header not changed.** The planned premise did not reproduce: on the dev storefront `ShopifyHttp.getJSON` with the default `Accept: application/json` and with `Accept: '*/*'` both return 200 and the section JSON for `/blogs/news?page=2&sections=…`, and the old code paginated the blog in place. The override (first drafted) was removed; `assets/https.js` untouched. The 2026-10-13 404 is unexplained (possibly a stale section ID or server state); not reproducible today, so the defect line leaves the backlog as not reproduced rather than fixed. Only the `null`-section fallback remains from change 1.

### Reviews

- Round 1 (separate session, 2026-10-21): FAIL on acceptance check 2 as written (it required a collection `?sections=` request; collection pagination uses `?section_id=` in `assets/collection-filters-helpers.js`, which this batch does not touch). Everything else proven: blog `?sections=` in place with Back, default `Accept` valid (header drop justified), status region active and idle, no-JS via `playwright-core` with JavaScript disabled (no visible loading text or spinner on collection and search), reduced motion `spinner-pulse` 1.6 s with `transform: none`, buy-button spinner effect acceptable, `null` fallback with and without `updateHistory` and under abort, five consumers unchanged in layout, fresh `build:tw` byte-identical (SHA-256 `D7DD7758…CB4D`), all validators passed, `test:layout` 0 new. Motion review: approve. Correction: outcome and check 2 rewritten to the delivered scope (above), pending the user's acceptance; round 2 re-checks only that.
- Round 2 (same session, 2026-10-21): the user accepted correction (a). FAIL on the record only: the Outcome and check 2 still said "pending", and the Outcome left out the `updateHistory` qualification of the `null` fallback. Proven: no implementation file changed since round 1 (same numstat, same output SHA-256), corrected check 2 matches the round-1 evidence, collection ownership (`collection-filters.js` → `collection-filters-helpers.js`) accurate. Fixed: both annotations now record the acceptance, and the Outcome states that only a link click falls back. Round 3 re-checks the record.
- Round 3 (same session, 2026-10-21): PASS, no findings. Implementation blobs unchanged since round 2 (`section-pagination.js` `6214a435…`, `loading.liquid` `9348febf…`, `tailwind.animates.css` `25010285…`, `tailwind.output.css` `955688a4…`); Outcome, check 2 and Reviews match `_executeFetch` and the round-1 evidence; `git diff --check` clean.
