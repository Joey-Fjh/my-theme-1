# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-V10 validator fixes and dead code

**Status:** covered by the user's acceptance of the tidy-up split on 2026-10-13, including the decision "fix only the latent defects and delete dead code; no large merge of the copied helpers". Executed by a delegated Implementer on Sonnet; the coordinator reviews the diff and commits. 6-V9 ran before it and is closed.

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

## 6-V10: executed

Implementer run, 2026-10-13. No commits. All edits are in the surface; the JSON deletion is staged (`git rm`).

**Baseline before edits (HEAD):** `test:validators` = i18n 32, theme-architecture 238, section-stylesheet-carry 3, doc-paths 7, all pass; `lint:theme` passed.
**After:** i18n 33, theme-architecture 242, carry 3, doc-paths 7, all pass; `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `lint:doc-paths`, `doctor:agent` pass; `test:layout-harness` 28/28 pass. Ratchets untouched (`legacy-type-tier` 6, `raw-spacing` 2, `stylesheet-font-size` 1).

1. **Schema extraction.** New `lib/schema-block.js` (`matchSchemaBlock`, trim-aware). Used by `theme-contracts.js` (`section-color-scheme`), `dead-setting-lint.js` (`extractSectionSchema` and the markup cut-off that was a fifth, `search`-based regex), `colour-setting-lint.js`, `section-placement-lint.js`. `lint-i18n.js`: regex made trim-aware in place.
2. **Font size.** `isAllowedTypographyValue` accepts `font-size` values that contain `var(--type-step-` and pass `isAllowedStylesheetFontSize` (imported; no cycle). Literals, arbitrary vars and other properties keep their verdicts. `isAllowedStylesheetFontSize` unchanged. No disagreement left over.
3. **dead-setting strict.** Removed the baseline read/write/compare/shrink, `parseBaselineKey`, `runDeadSettingsBaselineFlag` and both flags, `dead-settings-baseline.json`; SKILL.md row updated. `collectDeadSettingFailures` now runs on every root (it used to skip a root with no baseline unless it had `config/settings_schema.json`). The failure message lost "(not in baseline)". No other document names the file or flags.
4. **Stale texts.** `RULE_HINT` for type tier and breakpoint reworded (title-* / copy-*, tablet: / desktop: / wide:). Doc comment of `runStylesheetOwnershipBaselineFlag` corrected. Removed 8 `'legacy-breakpoint': {}` and 7 `'mixed-element': {}` fixture keys; the three non-empty allowance fixtures stay.
5. **Dead code removed.** `maskNonExecutableLiquid` (+ export, test, import), `parseBaselineKey`, `fs`/`parseTree`/`getNodeValue` imports and the shadowing `require('./lint-allow')` in `theme-contracts.js`, `STYLESHEET_OWNERSHIP_RULE` import, `normalizeShopifySectionId`, the unused re-export in `layout-check.mjs`. Each had no consumer at HEAD (`git grep ... HEAD`).
6. **Check id in output.** `formatFailureLine` in `lint-theme.js` prints `file:line: [check-id] message`, skipping the prefix when the message already starts with `[` or the failure has no `checkId`. No existing test asserted CLI output text.

**Tests added:** i18n `hardcoded schema label inside a whitespace-trimmed schema block fails`; theme-architecture `section color scheme missing on frame fails in a whitespace-trimmed schema block`, `stylesheet block font-size with a type step passes the settings chain`, `stylesheet block font-size literals and arbitrary vars still fail the settings chain` (guard, passes on HEAD too), `dead-setting: a dead setting fails with no baseline file and no allowance`, `dead-setting: a section with a whitespace-trimmed schema tag is checked`, `lint-theme CLI: every failure line carries its check id once`.
**HEAD-fails evidence** (HEAD `.agents/skills` in the scratchpad with the new test files, `NODE_PATH` to the repo `node_modules`): all of the above fail on HEAD except the guard test.
**Tests removed:** `maskNonExecutableLiquid preserves line breaks and length` (function deleted); `dead-setting baseline: write refuses an existing file; new dead entry fails the ratchet` (flag and ratchet deleted; "new dead entry fails" is still asserted by the unused-section-setting tests and the no-baseline test).
**Tests changed:** `dead-setting: unused section/global setting fails when not baselined` renamed (suffix dropped); the dead-setting fixtures no longer write a baseline; `migration lint: schema option values, comments and stylesheets are not counted` gained `<p>{{ section.settings.s }}</p>` so its fixture has no dead setting now that the check runs on every root.

**Deviations:** none from the plan beyond the two notes above (check runs on every root; fixture tweak).

**6-V10 state:** executed. The coordinator re-ran the validators on the working tree (2026-10-13):
- `npm.cmd run test:validators`: 33, 242, 3 and 7 tests, 0 failures.
- `lint:theme` passes, with the three existing `dead-setting-unprovable` notes.
- `lint:i18n` and `lint:doc-paths` pass; `git diff --check` is clean.

**Two points for the reviewer:**
1. `dead-setting` now runs on every root, where before it ran only when a baseline file or `config/settings_schema.json` existed. The real theme was always checked; fixture roots are stricter.
2. The Implementer's proof that the new tests fail on HEAD was an ad-hoc run with no stored output. The reviewer repeats it.

**Waiting on:** the independent review (Ask), run by the user.
