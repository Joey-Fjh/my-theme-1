# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-V9 references match the repository

**Status:** direction and split accepted by the user 2026-10-13 ("没问题，同意。但遇到工作量大的，还是用子agent sonnet 或者消耗低的模型"). The coordinator takes that as authorization for the tidy-up batches as proposed. Executed by a delegated Implementer on Sonnet; the coordinator reviews the diff and commits.

**Outcome:** the references, the check-theme-architecture `SKILL.md`, `README.md` and `docs/project.md` describe what exists in this repository today. Stale statements and contradictions found by the 2026-10-13 document survey are corrected against the code. No rule changes meaning. The stale browser checklist is deleted.

**Review tier:** Ask (references and a skill document; a file deletion).

**Not in this batch:**
- moving durable decisions from the board to owner documents;
- removing batch ids and theme or machine specifics for the skeleton (backport);
- de-duplicating rules across documents;
- any validator code (6-V10).

### Implementation surface

Every correction is verified against the code before the edit. References cite paths and symbols, never line numbers or counts. Where a document and the code disagree on a rule, not a fact, the Implementer reports it and does not choose.

- **`docs/references/style-system/css-architecture.md`:**
  - **`lint-allow` exceptions table:** rebuild it from `git grep -n "lint-allow"` over `layout sections snippets tailwind assets`. Remove rows that no longer exist and add the missing ones.
  - **Font weights, stated once:** heading and subtitle weight come from the merchant settings `heading_weight` and `subtitle_weight` (400, 500 or 700). `snippets/css-variables.liquid` loads the selected face through `font_modify`, and it is applied through `--font-heading-weight` and `--font-subtitle-weight`. Everywhere else, markup, `@apply` and stylesheets use only 400 and 700, enforced by `unloaded-font-weight`. Remove the statements that contradict this.
  - **Typography:** the section that presents the legacy `heading-*` / `body-*` tiers as the system, with pixel floors, is corrected to what `tailwind/tailwind.typography.css` does today.
  - **Legacy breakpoints:** the `pc` / `fw` "legacy aliases for existing classes" text is corrected. The tokens still exist; the variants are rejected by `legacy-breakpoint`.
  - **Section schema count:** the stale "40 section schemas" count is removed.
  - **Layer Ownership table:** it is split by the "Skeleton carry-over decisions" heading and table. The inserted block moves below it, so both tables are whole.
  - **Scheme names:** they must agree with `docs/design/design.md` and `config/settings_schema.json` / `config/settings_data.json`. Verify which is right before editing.
- **`docs/references/architecture/javascript-runtime.md`:**
  - the static module graph and the global stores include what `assets/base.js` imports and registers (the dialog module, the toast store, the Intersect plugin);
  - the sentences that describe the skeleton and are false here are corrected (the cart page as the only cart presentation, while `sections/cart-overlay.liquid` exists);
  - the `innerSelectors` callers are listed correctly.
- **`docs/references/architecture/motion-architecture.md`:** the statements that the template ships no drawer or dialog overlay and one loading recipe are corrected to what `assets/` and `tailwind/tailwind.animates.css` contain.
- **`docs/references/style-system/image-display-contract.md`:** the "Current Contract" consumers are corrected (`placeholder_style`, `position`, `mode: 'natural'`).
- **`.agents/skills/check-theme-architecture/SKILL.md`:** three rows change:
  - `typography-tier-heading` (also `title-*`);
  - `stylesheet-directive` (also the `theme()` / `--spacing()` / `--alpha()` functions);
  - `settings-chain-liquid` (the weight statement that contradicts `unloaded-font-weight`).
- **`README.md`:** the merchant-owned list gains `sections/*-group.json`, to match `AGENTS.md`; the Documentation list gains `docs/agent/board.md`.
- **`docs/project.md`:**
  - the Identity sentence that says the layers "are being replaced" (done);
  - the dangling "3D … (see Status)" pointer;
  - the phase 5 order text that no longer matches what happened;
  - the backport timing sentence (now Track A).
- **`docs/agent/board.md`:**
  - the header sentence about `context.md` matches the `AGENTS.md` exception for executed plans that wait on verification;
  - the backport candidates' "on hold" and "after the second submission" wording points to the revised order.
- **`docs/migration/phase0/browser-checklist.md`:** deleted (user, 2026-10-13: it lists deleted sections and targets `926dddb`; the manual test checklist is rewritten against Shopify's official checklist at the readiness review). Citations in `docs/project.md` and `docs/agent/board.md` become `git show <commit>:docs/migration/phase0/browser-checklist.md`, with the last commit that holds the file.
- This file.

**Reported, not decided (the Implementer lists them; the user decides later):**
- `motion_enabled` scope: `docs/project.md` against `docs/design/design.md`. Report what the code does.
- Extraction threshold: a third consumer (`abstraction-boundaries.md`) against a second consumer (board).
- Check widths: 390 against 375.

**Forbidden:**
- theme files (`layout/`, `sections/`, `snippets/`, `blocks/`, `templates/`, `config/`, `locales/`, `assets/`, `tailwind/`);
- validator code and baselines;
- `AGENTS.md`, the roles, `package.json`, the workflows;
- vendored skill files;
- commits;
- `prettier --write`;
- any file write under theme directories (a dev server is watching them).

### Acceptance checks

1. Every edited statement is backed by a command and its output in the Implementer's report: the path, symbol or grep that shows the new text is true.
2. The `lint-allow` table rows equal the `git grep -n "lint-allow"` hits, one row per exception, with the count stated from the command.
3. `git grep -n "browser-checklist"` shows no live path citation. The file is gone, and `npm.cmd run lint:doc-paths` passes.
4. No rule changed meaning: for each reference, the report lists rule statements removed or reworded and says why each is a fact correction.
5. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; `npm.cmd run lint:theme` passes (unchanged code); `git diff --check` is clean; `git diff --stat` shows only the surface.
6. Independent review (Ask) reports PASS.

## 6-V9: executed

**Changed (each statement verified against code first):**
- `docs/references/style-system/css-architecture.md`: `lint-allow` table rebuilt (15 `git grep -n "lint-allow"` hits, 15 rows; removed the three `settings-chain-css-typography` rows); font weights stated once in "Font weights (6-C3)" (merchant 400/500/700 settings through `font_modify` and `--font-*-weight`; elsewhere only 400/700 by `unloaded-font-weight`), contradicting sentences removed or pointed there; Typography tier-size sentence corrected (aliases of `title-*` / `copy-*`, no pixel floors); `pc` / `fw` text corrected (tokens remain, variants rejected); "40 section schemas" count removed; carry-over block moved below the whole Layer Ownership table; scheme names `scheme-2` Canvas and `scheme-5` Surface; 6-R4 date 2026-10-13.
- `docs/references/architecture/javascript-runtime.md`: skeleton voice replaced; static graph lists `dialog.js`, `toast.js` and the Intersect plugin; `toast` store added; cart presentation described (`cart_type`, `cart-overlay`, `cart`); notification sentence corrected; `innerSelectors` callers listed.
- `docs/references/architecture/motion-architecture.md`: loading-recipe sentence and the "no drawer or dialog overlay" sentence corrected.
- `docs/references/style-system/image-display-contract.md`: `placeholder_style`, `position` and `mode: 'natural'` consumers.
- `.agents/skills/check-theme-architecture/SKILL.md`: rows `typography-tier-heading`, `stylesheet-directive`, `settings-chain-liquid`.
- `README.md`: `sections/*-group.json`; `docs/agent/board.md` in Documentation.
- `docs/project.md`: Identity tense; 3D pointer; phase 5 order note; backport timing; phase 0 and browser checklist citations as `git show 3652441:...`.
- `docs/agent/board.md`: header matches the `AGENTS.md` exception; backport candidates' "on hold" and timing point to the revised order; browser checklist citations reworded.
- `docs/migration/phase0/browser-checklist.md`: deleted with `git rm` (staged, not committed).

**Validation:** `npm.cmd run lint:doc-paths` passed; `npm.cmd run doctor:agent` passed; `npm.cmd run lint:theme` passed ("Theme architecture lint passed."); `git diff --check` clean. `git grep -n "browser-checklist"` leaves only `git show 3652441:...` citations and this file.

**Deviations:** `snippets/loading.liquid` and `snippets/buy-buttons.liquid` use `animate-spin`, not `.spinner`; the motion sentence says so instead of keeping the survey's wording. The `docs/project.md` phase 0 line no longer cites the `docs/migration/phase0/` directory (`lint:doc-paths` rejects a missing path).

**Reported, not decided:**
- `motion_enabled`: off (`body[data-motion-enabled='false']`) is read by `motion-reveal.js`, `scrolling-marquee.js`, `slides-show.js`, `before-after-comparison.js`, `card-rail.js`, `ritual-steps.js`, `scatter-gallery.js`, `promo-bannder.js`, the product gallery zoom, and CSS for the rotating badge, watermark marquee, scrolling icons, routine-showcase and testimonial-featured. `dialog-motion.js` and `drawer-motion.js` read only `prefers-reduced-motion`, and `tailwind.animates.css` comments call dialog and drawer motion independent of `motion_enabled`. So `project.md` is right for overlays; `design.md` ("overlays appear without travel" when off) is not implemented; `project.md`'s list of what the switch stops is shorter than the code.
- Extraction threshold: `abstraction-boundaries.md` waits for a third real consumer for a JS abstraction; the board (shared carousel controls, 2026-10-04) says extract with the second.
- Check widths: `AGENTS.md` says 390 and 1440; `design.md` says 375, 768, 1024 and 1440.
