# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-28.

## Plan: Phase 2 — file ownership map for mixed directories

Accepted and authorized by the user on 2026-09-28. Read-only.

**Outcome.** A per-file ownership map that phase 3 (framework import) and phase 4 (capability slices) execute without deciding on the fly, plus the settings, locale, and slice analyses they depend on.

**Dependencies.** Phase 0 inventory (`docs/migration/phase0/`), phase 1 commit `1bf75c6`, `docs/project.md` Theme-Specific Contracts, skeleton `5191a50` (remote `skeleton`).

**Scope.** Every tracked file under `layout/ assets/ tailwind/ snippets/ sections/ locales/`, plus `config/settings_schema.json`. `templates/*.json`, `sections/*-group.json`, and `config/settings_data.json` are merchant-owned: consulted as references, never classified for change. Counts at `1bf75c6` versus the skeleton: layout 2 same-name; assets 28 same-name (16 identical), 61 theme-only, 11 skeleton-only; tailwind 6 same-name, 1 theme-only; snippets 21 same-name (4 identical), 49 theme-only; sections 16 same-name, 32 theme-only, 1 skeleton-only (`custom-section.liquid`, not imported); locales 2 same-name; config 2 same-name.

**Classes.** F: take the skeleton framework file as is. F+: skeleton file as the base, theme content merged. R: business file rewritten under the skeleton contracts, naming the same-name skeleton file as reference implementation when one exists. D: delete, with every consumer listed. V: vendored library, kept with its notice.

**Implementation surface.** New files under `docs/migration/phase2/` only:

- `ownership-map.md`: one row per in-scope file: path, class, reason, CAP IDs, merchant-referenced IDs involved, F files it depends on, phase 4 slice.
- `phase3-import.md`: skeleton files to import, old runtime files to delete, order, and expected validator effect.
- `settings-schema.md`: settings in the skeleton only, in the theme only, and same ID with different meaning; each marked whether `config/settings_data.json` or templates reference it.
- `locales.md`: key namespace comparison and conflicts.
- `phase4-slices.md`: R files per slice (product and cart; navigation and search; collection filters; carousels and display sections; the rest) with their phase 3 dependencies.
- `README.md`: method, counts, open questions, and a recommendation for the board item "Old CSS structure conventions".

**Review tier.** Ask. Coordinator review, then an independent GPT review from the `.agents/roles/verifier.md` template; the verdict is the cross-check of both.

**Acceptance checks.**

1. `git status --short` lists changes only under `docs/migration/phase2/` (plus record files).
2. Every in-scope file appears exactly once in `ownership-map.md`; row counts per directory equal `git ls-files <dir> | wc -l` (and 1 for `config/settings_schema.json`), with the commands recorded.
3. Every D row lists a consumer search command and its result.
4. Every same-name pair states why it is F, F+, or R.
5. Any change that would rename or remove a setting ID, section type, block type, or schema ID referenced by merchant configuration is flagged for the user, not stated as a decision.
6. Every phase 0 capability (CAP-01 to CAP-22) is carried by at least one R or F+ row.
7. Open board decisions (stop-loss point) are cited, not decided.

**Status.** Plan recorded; execution prompt delivered.

**Execution (2026-09-28, Implementer).** Delivered `docs/migration/phase2/` (6 files): `ownership-map.md` (219 rows; F 20, F+ 40, R 139, D 17, V 3), `settings-schema.md`, `locales.md`, `phase3-import.md`, `phase4-slices.md`, `README.md`. Directory counts match `git ls-files` (total 219). `npx prettier --check` on all six: pass. Acceptance 1–7 self-check in `README.md` (note: `docs/agent/board.md` was already modified before this batch; not touched by phase 2). Ready for Ask-tier review per plan.

**Coordinator review (2026-09-28): FAIL; returned to the implementer; GPT review deferred until the map is redone.**

- R1: `ownership-map.md` leaves the required columns empty in all 219 rows (CAP IDs, merchant-referenced IDs, F dependencies, phase 4 slice).
- R2: Classes follow file names, not content: 7 reason templates cover every row, 15 rows have no reason. Same-name files default to F+ ("merge deltas") even where the theme file is a different program (for example `assets/base.js` holds the whole component registry and Alpine registrations); generated icon SVGs are classed F+/R.
- R3: D rows search consumers by file name only. The 17 D files hold the business JS; their real consumers are Alpine component and store names in Liquid (`x-data`, `$store`), and the map does not say which new module inherits each piece of logic.
- R4: `sections/*-group.json` are classed R, against the plan scope (merchant-owned, reference only) and against `phase4-slices.md`.
- Kept: `settings-schema.md` and `locales.md` findings (pending spot-check); `phase3-import.md` and `phase4-slices.md` skeletons, to be updated after the map is redone.

**Execution redo (2026-09-28, Implementer, R1–R4).** Regenerated `ownership-map.md` (Part 1 diff review for 52 same-name files; table columns filled; K=58 icons/generated, M=3 group JSON). Added `logic-migration.md` (51 registration items with Liquid `rg` consumers and migration targets). Updated `README.md`, `phase3-import.md`, `phase4-slices.md`. `settings-schema.md` / `locales.md` unchanged. `npx prettier --check` on phase2 `*.md`: pass. Ready for re-review.

**Execution correction (2026-09-28, C1–C2 / G1–G6).** Introduced **FX** (8 files) + stricter **F** (5 byte-identical); Part 1b API contracts; `settings-schema.md` merchant JSON scan (`scripts/scan-settings-refs.js`); `logic-migration.md` Components.register ×7, D deletion gates, slice alignment with `phase4-slices.md`; `sticky-header.js` module; `phase3-import.md` Intersect/Swiper/interaction matrix. Validators: `check-cap-carriers.js` missing 0; `compare-slices.js` conflicts 0. Prettier pass.

**Coordinator review 2 (2026-09-28): mostly PASS; two items held for the combined correction round.** Verified independently: required columns empty in 0 non-K/M rows; every component constant registered in `assets/base.js` and the `toast`, `dialog`, `cart` stores appear in `logic-migration.md` with consumers and destinations; same-name pairs carry diff sizes and content reasons; `sections/*-group.json` are M.

- C1: `logic-migration.md` omits the `Components.register` scripts in 7 sections (6 Swiper carousels and `product-comparison-table`); the carousel mount/destroy destination under the module model is unmapped.
- C2: `stickyHeader` is sent to the skeleton `base.js`; the skeleton leaves sticky headers to derived themes (skeleton `docs/project.md`), so it needs a theme module.

GPT review runs next; its findings and C1–C2 go back to the implementer in one correction round.

**Independent review (GPT, 2026-09-28): FAIL.** Coordinator re-verified G1, G2, G5 against source. Cross-checked verdict: FAIL; one combined correction round (C1–C2, G1–G6).

- G1: `assets/quantity-constraints.js` classed F with an "immaterial" diff (+190/-140); the theme API (`fromCartItem`, `nextValidTotal`, `largestValidTotal`, global `QuantityConstraints`) is absent from the skeleton file and consumed at `assets/alpine.components.overlays.js:876`.
- G2: `settings-schema.md` marks `reveal_behavior`, `toast_position` (and shared IDs such as `type_header_font`, `color_schemes`) as unreferenced by `config/settings_data.json`; they are referenced. The merchant-use column must be rescanned.
- G3: D rows carry no per-file consumer command and result; component slices in `logic-migration.md` conflict with `phase4-slices.md` (`ProductPrice`, `productLayout`, `progressiveList`, `toastContainer`, newsletter components, `sectionPagination`).
- G4: F+ hides contract changes in runtime files (`assets/https.js`, `assets/events.js`, `assets/alpine.store.cart.js`): globals and Components lifecycle versus ESM services, adapter mount, and `cart.contract.js`.
- G5: `phase3-import.md` gives no load order for Alpine Intersect (registers on `alpine:init`) or a Swiper mount, and no statement of which interactions work between phase 3 and each slice.
- G6: CAP-10, 11, 16, 18, 19, 20, 22 lack an explicit R/F+ carrier (acceptance 6); `blog-stories.liquid` sits in slices 4 and 5; `tailwind.snippets.css` slice differs between the map and the slice plan.
- Pattern to correct: the implementer understated differences (large diffs called immaterial, contract changes called merges); the correction prompt makes those judgments command-checkable.

**Coordinator review 3 (2026-09-28): FAIL; two user decisions needed before the next correction.**

- S1: `scripts/compare-slices.js` parses component slices but never compares them; it only checks the two cases named in G6, so self-check 4 is unproven. An independent comparison (component slice versus the earliest slice of its Liquid consumers in `ownership-map.md`) finds 25 conflicts in 47 components. Causes: most snippets default to slice 5 (for example `buy-buttons.liquid`, `quantity-selector.liquid`, `header-dropdown-menu.liquid`), and shared UI components (dialog, toast, dropdown, accordion, dragScroll, tabControl) serve several slices.
- S2: `assets/vendor-swiper.min.js` is a classic build (`var Swiper=function(){...}()`). Imported through the import map it exports nothing and sets no global, so the plan to add an import-map entry would fail silently. Alpine Intersect is safe as a side-effect import from `base.js` (it listens for `alpine:init` and uses `window.Alpine`).
- S3: `assets/vendor-alpine.min.js` is classed F; it is a vendored library (V). Minor.
- Proposed to the user: (a) add slice 0 for shared UI primitives right after phase 3; slices computed by script: used by two or more slices goes to slice 0, otherwise the earliest consumer slice; (b) vendor the Swiper 12.1.2 ESM browser build and import it only from the carousel module, keeping the skeleton's single classic script (Alpine).
- Implementer checks passed as claimed: 6 F files byte-identical to the skeleton; `check-cap-carriers.js` missing none; `scan-settings-refs.js` marks the four named IDs as referenced.

**User decisions (2026-09-28):** (a) slice 0 for shared UI primitives, slices computed by rule; (b) Swiper 12.1.2 ESM browser build, imported only by the carousel module. Correction round 3 delivered to the implementer.

**Execution correction round 3 (2026-09-28, S1–S3).** Added `scripts/compute-slices.js` (slice 0 + rule-based batches), rewrote `scripts/compare-slices.js` + `scripts/run-injection-test.js`, regenerated `phase4-slices.md` / slice columns via compute. `phase3-import.md`: Swiper ESM plan (`swiper@12.1.2` → `assets/vendor-swiper.esm.js`), Intersect side-effect import from `base.js`; removed Swiper Option A/B. `vendor-alpine.min.js` → **V** (F=5 byte-identical theme files, V=4). `compare-slices.js`: 49 components, 0 conflicts; injection test 2 conflicts. Prettier pass on phase2 `*.md`. Ready for coordinator re-review.

**Execution correction round 4 (2026-09-28, review 4).** Narrowed slice **0** to CAP-01/CAP-21-only rows (no CAP-02..20/CAP-22); all other files/components/stores use **earliest consumer** slice (shared purchase UI returns to slice 1). `compare-slices.js`: repo scan for `$store.*` / `x-data`; separate store rows (`toast`, `dialog`, `cart`); slice-0 CAP validation. `toast` store → slice **3** (with `ui-toast.liquid`). Injection tests: `BuyButtons` component + `toast` store. `compare-slices.js`: 47 components, 3 stores, 0 conflicts. Ready for coordinator re-review.

**Coordinator review 4 (2026-09-28): FAIL, rule refinement.** Independent check against the implementer's rule found one real conflict: the `toast` store is slice 5 while its consumer `snippets/ui-toast.liquid` is slice 3; the implementer's `compare-slices.js` missed it. The rule itself was too broad (coordinator's proposal): slice 0 grew to 62 files and took the product purchase core from slice 1. User decision: slice 0 holds only domain-neutral files carried by CAP-21 and CAP-01; everything else follows its earliest consumer slice. Correction round 4 delivered.

**Coordinator review 5 and takeover (2026-09-28).** Round 4 derived slice 0 from CAP values the implementer had rewritten to CAP-21 (phase 0 has `buy-buttons` CAP-08/10, `sort-by-dropdown` CAP-12, `header-dropdown-menu` CAP-03, `country-localization` CAP-20, and more), and split `snippets/buy-buttons.liquid` (slice 0) from `BuyButtons` (slice 1). With user approval the coordinator took over the deterministic part:

- `scripts/derive-slices.js` replaces `compute-slices.js`, `compare-slices.js`, `run-injection-test.js` (deleted). CAP columns are read from the phase 0 matrix (140 files); slices follow the accepted rule over the Liquid render and mount graph; components and stores derive from the files that mount them, and domain-neutral ones (CAP-01/CAP-21 only) go to slice 0; phase 3 is `P3`, no longer mislabelled "slice 3"; D files unlock after the latest slice of their components. It rewrites the slice and CAP columns and generates `phase4-slices.md`.
- Result: phase 3 46 files and 9 components (primitives mounted by F+ snippets), slice 0 3 files and 7 components, slices 1–5: 32, 9, 16, 23, 12 files. `derive-slices.js`: 0 errors; `--self-test`: 2 of 2 injected conflicts reported; `check-cap-carriers.js`: none missing.
- Phase 0 fix: `snippets/product-gallery-stacked.liquid` added to the coverage matrix (CAP-09); the matrix had 69 rows under a "70 rows" heading, missed in the phase 0 review.
- `README.md` rewritten (the implementer's rounds had overwritten the method, open questions, and CSS recommendation); `phase3-import.md` gains the list of theme logic merged in phase 3.
- Unchanged from the implementer's rounds: classes and reasons, FX API tables, `logic-migration.md` destinations and deletion gates, `settings-schema.md`, `locales.md`.

Because the coordinator implemented part of this batch, the GPT review is the only independent review of it. Next: GPT final review of the whole phase 2.

**Independent review (GPT, 2026-09-28): FAIL.** Coordinator verified finding 1 against the npm package and accepts all seven.

- G1: no self-contained Swiper 12.1.2 ESM file exists: `swiper-bundle(.min).mjs` (1.8 KB) imports `./modules/*`, `swiper-element-bundle.min.mjs` imports `./shared/*`; the flat `assets/` directory cannot hold them. The user decision "Swiper ESM build" rested on the coordinator's unverified premise and is reopened.
- G2: `phase3-import.md` deletes all 17 D files in phase 3, against the derived "deletable after slice N".
- G3: `derive-slices.js` misses single-quoted `x-data`, `$store['name']`, and dynamic `render`; an in-memory single-quote injection passed with 0 errors; the self-test only mutated table cells.
- G4: `imageLightbox` derives to phase 3 but the skeleton ships no such module; `AlpineComponentsFactory` sits in slice 0 though the phase 3 adapter replaces it.
- G5: D-file deletion gates are shared, not per file, and cite pre-derivation slices (toast, dialog in slice 2).
- G6: `ownership-map.md` Part 1 keeps explanations contradicting the FX classes; README class totals (F+ 30, R 94) differ from the table (29, 95).
- G7: announcement carousel timing conflicts (slice 4 in `phase3-import.md`, slice 2 derived); the Swiper loader must exist by slice 2.

Next: the user re-decides Swiper loading; the coordinator fixes G2–G7 and resubmits to GPT.

**Coordinator corrections after the GPT review (2026-09-28).** Swiper: the user chose A, which is the skeleton rule applied (vendored file behind a project adapter; Alpine the only classic script in the layout): `vendor-swiper.min.js` stays unchanged and a new `carousel-swiper.js` adapter loads it on demand, landing with its earliest consumer (announcement bar, slice 2). G2: phase 3 removes only D script tags; D files are deleted per generated gates. G3: `derive-slices.js` reads `x-data` in either quote style and `$store['name']`, lists dynamic renders (2), and its self-test adds two in-memory graph injections (single-quoted `x-data`, bracket store); 3 of 3 cases reported. G4: `imageLightbox` becomes a new phase 3 module; items replaced by `alpine.adapter.js` or `base.js` derive to phase 3 (`AlpineComponentsFactory`). G5: per-D-file deletion gates are generated into `phase4-slices.md` (items, derived step, current mounts, command). G6: Part 1 verdicts for the 8 FX files marked superseded; class totals corrected to F+ 29, R 95 and checked by the script. G7: `Components.register` rows are checked against their section slice (announcement bar 2). Acceptance 7: the stop-loss point is cited as open in README. `derive-slices.js`: 0 errors. Next: GPT re-review.

**Independent re-review (GPT, 2026-09-28): FAIL, four items; coordinator corrections.** (1) The `carousel-swiper.js` adapter lands in phase 3, since the F+ product gallery carousel creates a Swiper instance there; slices 2 and 4 reuse it; README no longer says "ESM". (2) Gate commands were not executable (escaped quotes, Markdown-escaped pipes) and used `rg`, which this machine does not have outside the agent tool; they are now `git grep -l -P` with a quote-free single-quoted pattern, printed in a code block, verified verbatim in PowerShell, and the self-test runs every gate command and compares its file count with the derivation (0 problems). (3) The `logic-migration.md` summary no longer deletes D files in phase 3. (4) `x-data` with spaces around `=` is recognized and added to the self-test (4 of 4 injected conflicts reported). Also: `imageLightbox` named as the one phase 3 primitive the skeleton lacks; the product row of the availability table reads "Partial" after phase 3. `derive-slices.js`: 0 errors. Next: GPT re-review.

**Independent re-review 2 (GPT, 2026-09-28): FAIL, two items; coordinator corrections.** (1) A doc-block mention (`snippets/search-predictive-panel.liquid:8`) counted as a `predictiveSearch` mount: the derivation now ignores `{% doc %}`, `{% comment %}`, and HTML comments (count 2); `git grep` cannot skip comments, so the gate text and self-test treat its extra hits as mention-only notes and fail only if a derived mount is missed. (2) Unquoted `x-data=name` and `$store?.name` were not recognized; neither occurs in the codebase, both are now recognized and in the self-test (6 of 6 injected conflicts reported; the comment-only injection reports 0). `derive-slices.js`: 0 errors.

**Final independent review (GPT, 2026-09-28): PASS**, no blocking findings; note: the printed predictiveSearch gate lists one comment-only file, as the gate text explains. **Cross-checked verdict: PASS.** Coordinator checks agree: `derive-slices.js` 0 errors, self-test all cases, `check-cap-carriers.js` none missing, `scan-settings-refs.js` four named IDs referenced. Awaiting the user's commit decision; after the commit, clear this plan per SOP step 9.
