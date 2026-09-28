# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-28.

## Plan: Phase 1 — outer framework replacement

Accepted by the user on 2026-09-28. Execution requires the user's explicit authorization.

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

**Review tier.** Ask (agent rules and validator wiring change; runs from an external prompt). Verifier: the coordinator. Review gate after stage A and after stage C.

**Acceptance checks.**

1. `git diff --stat main -- sections snippets assets templates config locales layout tailwind blocks` is empty after every stage.
2. `git ls-files -s CLAUDE.md .claude/skills` shows mode `120000`; `npm.cmd run doctor:agent` passes.
3. `git ls-files .agents .codex .cursor .claude docs/references` equals the skeleton's list at `5191a50` for the same paths, minus `docs/references/architecture/theme-blocks.md`.
4. `npm.cmd ci` succeeds with the merged lock file.
5. `lint:liquid-syntax`, `lint:i18n`, `test:validators`, `format:check`, `doctor:agent` pass, or each failure is recorded with its owning phase and a reason it cannot be fixed in phase 1.
6. `lint:theme` and `lint:doc-paths` counts are recorded; `test:theme-check` findings are diffed against the A0 baseline and every new finding is attributed to the config change.
7. No `.shopifyignore` pattern newly excludes a file under a theme directory (script output recorded).
8. `grep -rn "theme-blocks" AGENTS.md docs .agents` returns no routing to the removed reference.

**Status.** Plan recorded; awaiting user authorization.
