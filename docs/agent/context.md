# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-V6 `legacy-breakpoint` strict

**Status:** accepted and authorized by the user 2026-10-13 ("可以" to making `legacy-breakpoint` strict like `mixed-element`). Run from an external execution prompt.

**Outcome:** `legacy-breakpoint` (count 0 since 6-R1) fails on any `pc:` / `max-pc:` / `fw:` / `max-fw:` variant in markup. Like 6-R4's `mixed-element`: no baseline allowance is read or written. `legacy-type-tier` and `raw-spacing` stay ratchets.

**Review tier:** Ask (validator code and its rule text).

### Implementation surface

- `.agents/skills/check-theme-architecture/scripts/lib/migration-lint.js`: `compareWithBaseline` reads no `legacy-breakpoint` allowance; `toBaseline` never writes one.
- `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`: a test that a baseline allowance for `legacy-breakpoint` is ignored (one `pc:` use fails with allowance 5); tests that use `legacy-breakpoint` to exercise ratchet mechanics (write, refusal, drop note, shrink, a rising count keeping its allowance) switch to `raw-spacing` or `legacy-type-tier`, keeping every mechanic they covered; a test that `--write-migration-baseline` omits `legacy-breakpoint`.
- `.agents/skills/check-theme-architecture/scripts/migration-baseline.json`: the `legacy-breakpoint` key removed.
- `.agents/skills/check-theme-architecture/SKILL.md` (`legacy-breakpoint` row) and `docs/references/style-system/css-architecture.md` (the migration checks section and count line): strict, no baseline allowance.
- This file.

Forbidden: theme files (`layout/`, `sections/`, `snippets/`, `templates/`, `config/`, `locales/`, `assets/`, `tailwind/`), other lints, other baselines, `prettier --write`. The `pc:` / `fw:` custom variants in `tailwind/` stay (deleting them is a separate decision).

### Acceptance checks

1. `npm.cmd run test:theme-architecture` passes; the new strictness test fails against the HEAD `migration-lint.js` (scratch copy outside the repo) and passes on the new one.
2. `git diff -U0 HEAD` hunks in the test file are confined to migration-lint tests; every ratchet mechanic covered before is still asserted (list them, before and after).
3. Counts from the lint's own functions (command named): `legacy-breakpoint` 0, `legacy-type-tier` 6, `raw-spacing` 2; `migration-baseline.json` has no `legacy-breakpoint` key.
4. `npm.cmd run lint:theme`, `lint:doc-paths`, `doctor:agent`, `npx prettier --check` on changed files pass; `git diff --stat HEAD` shows only the surface.

## 6-V6: executed

Executed 2026-10-13. Not accepted. Review tier stays Ask.

`legacy-breakpoint` is strict: `compareWithBaseline` reads no allowance, `toBaseline` writes no key, and `migration-baseline.json` no longer has the key. `legacy-type-tier` and `raw-spacing` stay ratchets.

### Ratchet mechanics

Before (HEAD tests):

| Mechanic | Test | Rule |
| --- | --- | --- |
| write | `migration baseline flags: write refuses an existing file; shrink only lowers and removes` | `legacy-breakpoint` (`pc:flex` → 1) and `raw-spacing` (`mt-4` → 1); `legacy-type-tier` written as `{}` |
| refusal | same test (second `--write-migration-baseline`); `cross review C1-C3 F4: --write-migration-baseline refuses any existing file` (existing content `null`) | none (file existence) |
| drop note | `migration lint: a drop passes with a shrink hint` | `raw-spacing` (baseline 3, markup `mt-4`) |
| shrink | same flags test (`--shrink-migration-baseline` does not add `sections/b.liquid`) | `raw-spacing` |
| rising count keeps its allowance | same flags test (written 1, markup `mt-4 mb-2 gap-6` is 3, shrink keeps 1) | `raw-spacing` |
| removal at 0 | same flags test (`pc:flex` gone, file entry removed, key left as `{}`) | `legacy-breakpoint` |

After:

| Mechanic | Test | Rule |
| --- | --- | --- |
| write | same flags test; `pc:flex` is in the markup and the key is omitted | `raw-spacing` (1) and `legacy-type-tier` (`{}`) |
| refusal | same two tests, unchanged | none |
| drop note | same drop test, unchanged | `raw-spacing` |
| shrink | same flags test; `sections/b.liquid` is still not added | `raw-spacing` |
| rising count keeps its allowance | same flags test, same assertion (1 kept while the file has 3) | `raw-spacing` |
| removal at 0 | same flags test, a later shrink drops the file entry when the count hits 0 (`raw-spacing`: `{}`) | `raw-spacing` |

`migration lint: a count above the baseline fails` is not one of those mechanics. Its fixture had dropped `pc:flex` and the breakpoint allowance of 1, because that allowance was what kept the "no `[legacy-`" assertion green. The rise-above-baseline check stays on `raw-spacing`; the at-allowance pass stays on `legacy-type-tier`.

### Validation

- `node -r C:\Users\Joey\AppData\Local\Temp\6-v6-legacy-breakpoint\require-hook.js --test --test-name-pattern "legacy-breakpoint lint: strict" .agents/skills/check-theme-architecture/scripts/theme-architecture.test.js` with `HEAD_MIGRATION_LINT` set to the scratch copy of HEAD `migration-lint.js` (outside the repo; the copy does not contain the 6-V6 comment): `# tests 1`, `# fail 1`, exit 1. The assertion `baseline 0` was falsy (HEAD honors allowance 5).
- Same test without the hook: `# tests 1`, `# pass 1`, exit 0.
- `npm.cmd run test:theme-architecture`: `# tests 238`, `# pass 238`, `# fail 0`.
- `node -e` requiring `collectMigrationCounts(process.cwd())` and `migration-baseline.json`: `legacy-breakpoint 0`, `legacy-type-tier 6`, `raw-spacing 2`, baseline keys `legacy-type-tier, raw-spacing`, `has legacy-breakpoint: false`.
- `npm.cmd run lint:theme`: `Theme architecture lint passed.` The three `[dead-setting-unprovable]` lines are the existing header, super-menu, and social-icons notes.
- `npm.cmd run lint:doc-paths`: `Doc path lint passed.`
- `npm.cmd run doctor:agent`: exit 0.
- `npx prettier --check` on the changed lint, test, baseline, SKILL, and css-architecture files: `All matched files use Prettier code style!`
- `git diff -U0 HEAD` hunks in `theme-architecture.test.js` are the count-above fixture, the new strictness test, and the flags test. All three are migration-lint tests.
- `git diff --stat HEAD` also lists `docs/agent/board.md` and `docs/design/design.md`. Those diffs were already in the worktree before this batch and were not edited here. This batch's files are the four validator paths, `docs/references/style-system/css-architecture.md`, and this file.


**Coordinator check of 6-V6 (2026-10-13):** the lint diff is the two-line 6-R4 pattern (`toBaseline` skips, `compareWithBaseline` ignores `legacy-breakpoint`); the test diff keeps write, refusal, drop note, shrink, rising-count and removal-at-0 coverage on `raw-spacing` / `legacy-type-tier`. Open for review: the test "token aliases, 0, px and auto are not raw spacing" still plants a `legacy-breakpoint` allowance on `pc:gap-group`, now ignored; it asserts only `raw-spacing`. The `board.md` and `design.md` diffs in the tree are the coordinator's pause-button record, not this batch. Verdict: ready for independent review.

**Independent review 1 (2026-10-13): PASS.** No findings; the leftover `legacy-breakpoint` allowance in the token-alias test is inert.
