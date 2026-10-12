# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-12.

## 6-R1 Legacy breakpoint and type tier renames

Rebuilt by the coordinator from the session after the working copy was cleared before being committed. The code is in `7b835e3`.

**Status:** complete 2026-10-12 (review round 2 PASS, layout 0 new); committed in `7b835e3`. Review round 1 FAILed on record defects only, with no implementation defect: authorization not written out, CSS count 199 → 203, layout baseline 32 → 38. The record was corrected for round 2.

**Authorization (user, 2026-10-12):** the coordinator proposed this batch: scope, the two exclusions, and the surface, including the `css-architecture.md` lines and the migration baseline shrink. The user replied "可以，这个机械化的？那就给执行prompt" ("yes, it's mechanical; give the execution prompt"). That reply accepts this plan and authorizes executing it as written. Executed by an external Sonnet session.

**Outcome:** Liquid markup uses only the token breakpoint variants and the semantic type utilities. `legacy-breakpoint` 502 → 0, `legacy-type-tier` 398 → 6 (`body-size-custom` only). No rendering change.

**Review tier:** Ask.

**Out of scope:** `mixed-element` (moves with `raw-spacing`, so raw spacing values cannot leave that ratchet's reach), `body-size-custom` (polish pass), and deleting the aliases and the two checks (a later batch, with the user's approval).

### Items

1. In class-candidate tokens (`classCandidateTokens`, `migration-lint.js`): `pc:` → `tablet:`, `max-pc:` → `max-tablet:`, `fw:` → `wide:`, `max-fw:` → `max-wide:`.
2. Legacy tiers → `title-*` / `copy-*` per the alias table in `css-architecture.md`.
3. Comparison literals and schema values stay.
4. Primitive `{% doc %}` examples and the `css-architecture.md` primitive table name `title-*` / `copy-*`.
5. `build:tw` regenerates `assets/tailwind.output.css`.
6. `--shrink-migration-baseline`.

### Acceptance checks

1. Rename equivalence against `HEAD` at the candidate offsets.
2. `lint:theme` passes, and the counts come from `collectMigrationCounts`.
3. Generated CSS: every added rule is a renamed equivalent.
4. The diff stays inside the surface.
5. `test:theme-check`, `lint:liquid-syntax`, `scan:compat`, and Prettier pass.
6. `test:layout`: 0 new issues against the baseline (38).

### Progress

- **Executor:** 748 renames in 82 files, plus 6 hand renames in 3 files whose tokens contain `%`, which `classCandidateTokens` skips (`newsletter-banner`, `newsletter-overlay`, `product-comparison-table`). The `{% doc %}` changes in `heading.liquid` and `text.liquid`. After: `legacy-breakpoint` 0, `legacy-type-tier` 6. `lint:theme`, `test:theme-check`, `lint:liquid-syntax`, `scan:compat`, and Prettier pass.
- **Review round 1:** FAIL on record defects only. 82 files, 748 renames, 0 mismatches. CSS 203 removed / 188 added, all explained. The baseline equals `shrinkBaseline(HEAD, current)`.
- **Layout check:** 4 "new" `collection-all` `page-margin` entries were the existing toolbar nav link entries, whose selector path changed from `div.body-3xl` to `div.copy-xl`. The user approved renaming those 4 baseline selectors, and the baseline stays at 38.
- **Review round 2:** PASS, no findings. It ran before the baseline selector update; the coordinator checked that 4-line diff.
- **Layout rerun (user):** 0 new issues.
- **Filed:** the `%` / `{` token skip in `classCandidateTokens` is a lint hole, filed on the board for the user's decision.
