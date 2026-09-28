# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-28.

## Plan: Phase 1 — outer framework replacement

Accepted and authorized by the user on 2026-09-28, including the changes to `AGENTS.md`, `.agents/`, client adapters, `docs/references/`, `package.json` scripts, and CI.

**Outcome.** The Agent layer, docs references, validators, configs, and CI come from the skeleton; theme business directories are untouched; every validator result is either passing or recorded as a known gap owned by a later phase.

**Source.** `my-skeleton-theme` at `5191a50`, added as remote `skeleton` (`../my-skeleton-theme`). Comparison evidence: `docs/migration/step1-outer-files.md`.

**Decisions applied** (user, 2026-09-28): delete `audit-home-motion-reveal.js` (recoverable from `main`); delete `css-layer-allowlist.json`; do not import `docs/references/architecture/theme-blocks.md` and remove routing to it; import the GSAP skills; take the skeleton `.theme-check.yml`; untrack `shopify.theme.toml` (keep the local file); take the skeleton `.prettierignore` (excludes merchant JSON); no `merge -s ours`.

**Implementation surface.**

- Stage A (mechanical, then stop for review):
  - A0. Record the pre-change baseline under `docs/migration/step1/`: `test:theme-check` output and the old `lint:theme`, `lint:i18n` results (counts and output).
  - A1. Replace wholesale from the skeleton: `.agents/ .codex/ .cursor/ .claude/ docs/references/` (tracked files only; delete `theme-blocks.md` after checkout).
  - A2. Check out from the skeleton: `AGENTS.md CLAUDE.md LICENSE.md THIRD_PARTY_NOTICES.md .github/ eslint.config.cjs .prettierrc .prettierignore .theme-check.yml .browserslistrc .gitattributes svgo.config.cjs stylelint.config.cjs .editorconfig .vscode/ .mcp.json`.
  - Never touched: `sections/ snippets/ assets/ templates/ config/ locales/ layout/ tailwind/ icons/ blocks/`, `docs/project.md`, `docs/agent/`, `docs/migration/` (except the new `docs/migration/step1/`), `README.md`.
- Stage B (manual merge):
  - B1. `package.json` / `package-lock.json`: skeleton scripts and dependencies; `name` `my-theme-1`; theme description; add `browserslist`; keep `shopify:dev` with `-e development` (the local `shopify.theme.toml` defines it). Run `npm.cmd ci` immediately after.
  - B2. `.gitignore`: skeleton base plus reviewed theme-only entries; `git rm --cached shopify.theme.toml`.
  - B3. `.shopifyignore`: skeleton base plus reviewed theme-only entries.
  - B4. `README.md`: theme content plus the skeleton setup, symlink, and `doctor:agent` sections.
  - B5. Deviations: remove `AGENTS.md` and reference routing to `theme-blocks.md`; record every deviation from the skeleton in the `docs/project.md` deviations section.
- Stage C (validation and gap record) under `docs/migration/step1/`.

**Review tier.** Ask. Stage A gate: coordinator review. Final: the coordinator reviews the whole batch after stage C, and an independent session on another model (GPT) reviews it from the `.agents/roles/verifier.md` template; the verdict is the cross-check of both reviews.

**Acceptance checks.**

1. `git diff --stat main -- sections snippets assets templates config locales layout tailwind blocks` is empty after every stage.
2. `git ls-files -s CLAUDE.md .claude/skills` shows mode `120000`; `npm.cmd run doctor:agent` passes.
3. `git ls-files .agents .codex .cursor .claude docs/references` equals the skeleton's list at `5191a50` for the same paths, minus `docs/references/architecture/theme-blocks.md`.
4. `npm.cmd ci` succeeds with the merged lock file.
5. `lint:liquid-syntax`, `lint:i18n`, `test:validators`, `format:check`, `doctor:agent` pass, or each failure is recorded with its owning phase and a reason it cannot be fixed in phase 1.
6. `lint:theme` and `lint:doc-paths` counts are recorded; `test:theme-check` findings are diffed against the A0 baseline and every new finding is attributed to the config change.
7. No `.shopifyignore` pattern newly excludes a file under a theme directory (script output recorded).
8. `grep -rn "theme-blocks" AGENTS.md docs .agents` returns no routing to the removed reference.

**Status.** Stages A–C complete on `refactor/skeleton-shell` (no commit). Stage A: PASS (symlink repair by user). Stage B: `package.json`/lock, `.gitignore`, `.shopifyignore`, `README.md`, deviations in `AGENTS.md` / `docs/project.md` / `javascript-runtime.md`; `shopify.theme.toml` untracked locally. Stage C: `docs/migration/step1/validation.md` + `check-shopifyignore.mjs`; acceptance 1, 2, 4, 7, 8 pass; 5–6 partial as recorded (346 `lint:theme`, 5 `lint:i18n`, 3 `lint:doc-paths`, `test:validators` blocked on `assets/https.js`; theme-check 1 new `UnusedAssign` warning vs A0). Business dirs still clean vs `main`. **Next:** coordinator whole-batch review + independent verifier per plan; then phase 2 ownership map — do not fix runtime/theme lint in phase 1 unless explicitly scoped.

**Corrections D1–D3 applied (2026-09-28).** D1: `"private": true` restored after `version`; `npm.cmd ci` OK; `package-lock.json` unchanged. D2: `lint:doc-paths` → **2** missing paths (`section-pagination.js` only, phase 3). D3: `docs/migration/step1/lint-theme.out` (346 findings) + rule-family table in `validation.md` (343→346: Alpine attr +2, +1 未解释).

**Coordinator review (2026-09-28).** Stage A: PASS (all 65 A1/A2 index entries equal `skeleton/main`). Whole batch: needs correction.

- D1: `package.json` drops the skeleton `"private": true` without a recorded deviation.
- D2: the B5 edit at `docs/references/architecture/javascript-runtime.md:158` cites `blocks/*.liquid` and causes a `lint:doc-paths` failure; it belongs to phase 1, not a later phase.
- D3: the full `lint:theme` output is not saved and the change from the 343-finding probe to 346 is unexplained; phases 3–4 need the full list.
- Passed: deviations list matches the observed differences; `.shopifyignore` equals the skeleton; `.gitignore` merge; `AGENTS.md` block routing; i18n (phase 4) and `test:validators` (phase 3) attributions; theme-check warning attribution.
- Pending: git-level re-checks (tool unavailable during review). The independent GPT review runs after D1–D3 are corrected; the verdict is the cross-check of both reviews.

**Independent review (GPT, 2026-09-28): FAIL.** Confirmed D1–D3 fixed and the git-level checks (business directories clean, no renormalization, agent file list equals the skeleton, real symlinks). Findings, all verified by the coordinator:

- F1: `THIRD_PARTY_NOTICES.md` lacks entries for the shipped `vendor-alpine-intersect.min.js`, `vendor-swiper.min.js`, `vendor-swiper.min.css` (3 `lint:theme` findings); fixable in phase 1.
- F2: `AGENTS.md:11` (skeleton text) selects Swiper while the board listed it as open. Resolved on the records side: the user kept Swiper as the skeleton's choice (board, `docs/project.md`).
- F3: `package-lock.json` differs from the skeleton beyond the name (6 packages resolved from `registry.npmmirror.com`, transitive bumps from `npm install browserslist`); `.gitignore` differs by a trailing newline. User decision: drop the `browserslist` direct dependency (the compat plugins bring it; `.browserslistrc` stays), use the skeleton lock with only the name changed, take the skeleton `.gitignore`.

Cross-checked verdict: FAIL. Correction round 2 (F1, F3) delivered to the implementer; then GPT re-reviews against the same acceptance checks.

**Corrections F1, F3 applied (2026-09-28).** F1: `THIRD_PARTY_NOTICES.md` entries for `assets/vendor-alpine-intersect.min.js`, `assets/vendor-swiper.min.js`, `assets/vendor-swiper.min.css`; `lint:theme` **343** (0 vendor-notice). Intersect version **3.15.3** follows the Alpine line (npm `@alpinejs/intersect@3.15.3`); vendored file has no header and was not byte-verified against the tarball. F3: removed direct `browserslist` devDependency; `package-lock.json` / `.gitignore` from `skeleton/main` with lock `name` → `my-theme-1` only; `npm.cmd ci` OK; `npm.cmd run lint:compat` pass; `git diff --no-index ../my-skeleton-theme/package-lock.json package-lock.json` shows only `name` lines; no `npmmirror` in lock. `validation.md` + `lint-theme.out` updated.

**Independent re-review (GPT, 2026-09-28): FAIL**, two points, both resolved by the coordinator with evidence:

- The F2 record edits were in the working tree but not staged. Fixed: `docs/project.md`, `docs/agent/board.md`, `docs/agent/context.md` staged; `git show :docs/project.md` and `git show :docs/agent/board.md` carry the Swiper resolution; no unstaged or untracked files remain.
- The Alpine Intersect version was unproven. Proven: the committed blob of `assets/vendor-alpine-intersect.min.js` equals `dist/cdn.min.js` of `@alpinejs/intersect@3.15.3` from registry.npmjs.org (both `2342257f98b4e783360b3d0d5d421c45a5cd8e55`); the working-tree copy differs only by a checkout CRLF. Alpine core carries `version:"3.15.3"` in the minified source.
- Everything else in the re-review passed: F1 (343 `lint:theme`, 0 vendor notices), F3 (package files and `.gitignore` equal the skeleton except recorded deviations), acceptance checks 1–3 and 6–8. Acceptance 4 (`npm ci`) is proven by the implementer run only, by the reviewer's instruction not to reinstall.

**Cross-checked verdict: PASS.** Remaining failures are recorded and owned by later phases: `lint:theme` 343 (phases 3–4), `lint:i18n` 5 (phase 4), `lint:doc-paths` 2 (phase 3), `test:validators` section-stylesheet carry (phase 3), theme-check 1 `UnusedAssign` warning. Awaiting the user's commit decision; after the commit, clear this plan per SOP step 9.

**Retention audit (2026-09-28).** `docs/migration/step1/retention-audit.md` compared the old outer layer (`af05311`) with the staged one. User-approved placement of the knowledge that was lost and still valid: merchant motion settings, the reveal pattern, and the two WebKit guards as acceptance items (CAP-01, browser checklist "Retained theme contracts") and as `docs/project.md` Theme-Specific Contracts; the ThemeEvents and SectionRefresher guards as phase 3 acceptance in the same section; old CSS structure conventions queued on the board for phase 2. Nothing was written back into `AGENTS.md`.
