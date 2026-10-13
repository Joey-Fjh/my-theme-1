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

**6-V9 state:** executed and committed (`23486ed`). The coordinator reviewed the diff: the `lint-allow` count (15 grep hits, 15 rows), the `assets/base.js` imports and store registrations, and the table move were spot-checked against the code. **Waiting on:** the independent review (Ask), run by the user in a separate session. The findings are filed on `docs/agent/board.md` ("Open: findings from 6-V9").

## 6-V10 validator fixes and dead code

**Status:** covered by the user's acceptance of the tidy-up split on 2026-10-13, including the decision "fix only the latent defects and delete dead code; no large merge of the copied helpers". Executed by a delegated Implementer on Sonnet; the coordinator reviews the diff and commits. It coexists with 6-V9 under the record-layer exception: 6-V9 is executed and waits on a review the agent cannot perform.

**Outcome:** two latent validator defects are fixed, code with no consumer is removed, and `lint:theme` prints the check id on every failure. No check becomes weaker, and no new rule is introduced.

**Review tier:** Ask (validator code).

### Implementation surface

Paths below are under `.agents/skills/check-theme-architecture/scripts/` unless a full path is given.

1. **Schema block extraction.** One trim-aware extractor that accepts `{% schema %}`, `{%- schema -%}` and mixed forms. It is used by every place that reads a section schema inside this skill: `lib/theme-contracts.js` (`section-color-scheme`), `lib/dead-setting-lint.js` (both sites), `lib/colour-setting-lint.js` and `lib/section-placement-lint.js`. The regex in `.agents/skills/check-i18n/scripts/lint-i18n.js` is made trim-aware in place, with no cross-skill import. New tests show that a section with a trimmed schema tag is checked by `dead-setting`, by `section-color-scheme` and by the i18n schema text check.
2. **Font-size rules agree in stylesheet blocks.** `settings-chain-css-typography` (`lib/theme-contracts.js`, `isAllowedTypographyValue`) accepts the type-step forms that `stylesheet-font-size` (`lib/stylesheet-ownership-lint.js`, `isAllowedStylesheetFontSize`) and `docs/references/style-system/css-architecture.md` ("Stylesheet font sizes") document as allowed. A value both documents reject stays rejected. A new test covers `font-size: var(--type-step-1)` in a stylesheet block.
3. **`dead-setting` strict.** Its baseline is empty, so the ratchet is inert.
   - Remove the baseline read and write, `dead-settings-baseline.json`, and the two CLI flags in `lint-theme.js`.
   - Any dead setting fails, as today.
   - Tests that exercised the dead-setting ratchet are replaced by one test that a dead setting fails with no baseline file present.
   - `.agents/skills/check-theme-architecture/SKILL.md` row and text are updated to match.
4. **Stale texts and inert fixtures.**
   - The hints "once 6-C2 lands" and "once 6-C8 lands" in `lib/migration-lint.js` are corrected.
   - The wrong doc comment on one `run*BaselineFlag` function in `lint-theme.js` is corrected.
   - Fixture baseline keys `'legacy-breakpoint': {}` and `'mixed-element': {}` are removed where the code no longer reads them. The two tests that assert an allowance is ignored keep theirs.
5. **Dead code with no consumer** (prove each with a grep before deleting):
   - `maskNonExecutableLiquid` and its test;
   - `parseBaselineKey`;
   - unused imports and the duplicate `require` in `lib/theme-contracts.js`;
   - the unused `STYLESHEET_OWNERSHIP_RULE` import in `lint-theme.js`;
   - `normalizeShopifySectionId` in `.agents/tools/layout-check/checks.mjs`;
   - the re-export nobody imports in `.agents/tools/layout-check/layout-check.mjs`.

   Exports are not trimmed in bulk.
6. **Check id in output.** `lint-theme.js` prints `[check-id]` on every failure line, not only the bracketed ones. Tests that assert output text are updated.
7. This file.

**Not in this batch (reported in the survey, left as is):**
- merging the copied helpers, the three class-token extractors, the three baseline implementations and the Liquid file lists;
- splitting the strict checks out of the ratchet loops;
- `lint-allow-reason` for JS files (it would be a new check);
- wiring `test:layout-harness` (it goes with 6-T4b);
- linting the tooling's own code;
- moving theme data to config (backport).

**Forbidden:**
- theme files;
- `migration-baseline.json` and `stylesheet-ownership-baseline.json` content;
- `AGENTS.md`, the roles, the references, `package.json` scripts, the workflows;
- `--write-*` / `--prune-*` / `--shrink-*` flags against the real theme;
- commits;
- `prettier --write`;
- any file write under theme directories (a dev server is watching them).

### Acceptance checks

1. `npm.cmd run test:validators` passes. State the test counts from the command output, before (HEAD) and after.
2. Each new test fails against the HEAD version of the code it covers (scratch copy outside the repository) and passes on the new one. Name the tests.
3. `npm.cmd run lint:theme` passes on the theme, and so do `lint:i18n`, `lint:liquid-syntax` and `lint:doc-paths`. Counts are unchanged, taken from the baselines and a run: `legacy-type-tier` 6, `raw-spacing` 2, `stylesheet-font-size` 1.
4. No theme section uses a trimmed schema tag today (`git grep -n -E "\{%-\s*schema|schema\s*-%\}" -- sections blocks`). If one does, report the new failures instead of hiding them.
5. Every deleted symbol: the grep that shows it had no consumer.
6. For every test removed or changed: its name, and which behaviour it covered that is still asserted elsewhere.
7. `git diff --check` is clean; `git diff --stat` shows only the surface; `npx prettier --check` is not a validator here (`.agents` is ignored).
8. Independent review (Ask) reports PASS.
