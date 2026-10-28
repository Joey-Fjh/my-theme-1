# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-28.

## Plan RR1-A: ratchet tidy-up (exact token matches only)

**Status:** checkpoint reached (implementer, 2026-10-28); awaiting Show review.

**Outcome.** The four style ratchets carry fewer entries. Every raw value that equals a token exactly is replaced by that token, and the baselines are shrunk to the new counts. Nothing renders differently.

**Decided (user, 2026-10-28).**
- RR1 runs as batches; this is RR1-A.
- The section sweep and the social-links item closed without change (`docs/agent/backlog.md` group 8).
- The tidy-up is kept only where it is simple and invisible: a value is replaced only when a token equals it exactly; everything else stays and keeps its baseline entry.

**Evidence** (baselines on 2026-10-28):
- `migration-baseline.json`:
    - `legacy-type-tier` 5 (`sections/blog.liquid` 1, `sections/promotion-countdown.liquid` 4);
    - `raw-spacing` 2 (`snippets/product-card.liquid`).
- `stylesheet-ownership-baseline.json`:
    - `stylesheet-font-size` 1 (`promotion-countdown`);
    - `stylesheet-spacing` across 40 files.
- `lint:theme` already reports counts that fell in both baselines.

**Implementation surface and method.**

1. **Shrink first:** `node .agents/skills/check-theme-architecture/scripts/lint-theme.js --shrink-migration-baseline` and `--shrink-stylesheet-ownership-baseline`, which lock the counts that already fell.
2. **Exact replacements** in the files named by the two baselines (their `{% stylesheet %}` blocks, and for `legacy-type-tier` and `raw-spacing` the flagged class or value):
    - Spacing: a literal `padding`, `margin` or `gap` value becomes `var(--spacing-step-*)` only when that step's computed value equals it at every width. Fluid steps (`clamp()` tokens) are not equal to a fixed value, so leave those.
    - Type: a legacy tier or stylesheet `font-size` becomes a type step only when the computed size is equal at every width.
    - The token values come from `tailwind/tailwind.input.css`.
    - When in doubt, leave the value.
3. **Shrink again** with the same two flags. Never raise an entry.
4. `npm.cmd run build:tw` if any utility class changes.

Read `docs/references/style-system/css-architecture.md` (Stylesheet spacing, the ratchet table) first. Radii (`border-radius`) are not in a ratchet and are out of scope.

**Review tier.** Show: section and snippet `{% stylesheet %}` CSS plus the sanctioned shrink of two baselines (no rule change). The coordinator reports the diff and validator output; the user looks.

**Estimate:** about 2 to 3 hours.

**Checkpoint:** one stop.

- After items 1 to 4 and the validators: report the replacements per file, the before and after baseline counts, and the measurement evidence.
- Earlier, if a replacement needs a markup change or a value has no exact token but looks like it should.

**Bar:** no rendered change, judged on the default preset and current templates.

- **Must fix:**
    - Any computed `padding`, `margin`, `gap` or `font-size` that differs from `HEAD` on an element whose rule changed, at 390 and 1440. The sample is at least one element per changed file on a page that renders it.
    - Any new `test:layout` issue.
    - Any raised baseline entry.
    - Any validator failure.
- **Accepted residue:** every non-exact value, with its baseline entry.

**Acceptance checks.**

1. `npm.cmd run lint:theme` passes with no "counts fell" notice left (the baselines are shrunk). `npm.cmd run test:theme-check` and `npm.cmd run scan:compat` pass.
2. `git diff` on the two baseline JSON files shows only lowered or removed entries.
3. `npm.cmd run test:layout -- --widths 390,768,1024,1440` reports 0 new issues.
4. Chrome DevTools MCP compares computed values against `HEAD` for the sampled elements at 390 and 1440. Take the `HEAD` values before the first edit.
5. `npx prettier --check` passes on every changed file.

## Results

### Task status

1. **Shrink first:** done — `node .agents/skills/check-theme-architecture/scripts/lint-theme.js --shrink-migration-baseline` and `--shrink-stylesheet-ownership-baseline` (locked pre-existing count drops from branch commits).
2. **Exact replacements:** done — 49 literal spacing-step `clamp(...)` copies in `{% stylesheet %}` blocks replaced with matching `var(--spacing-step-*)` (and two `var(--spacing-step-l, clamp(...))` fallbacks simplified) across 16 files; no markup or utility-class edits.
3. **Shrink again:** done — second `--shrink-stylesheet-ownership-baseline` after replacements.
4. **`build:tw`:** not required for this diff (`scan:compat` / `npm.cmd run build:tw` produced no `assets/tailwind.output.css` change).

**Not migrated (accepted residue):** `legacy-type-tier` (`body-size-custom` in `sections/blog.liquid`, `sections/promotion-countdown.liquid`); `raw-spacing` baseline cleared (product-card viewport utilities already removed on branch); remaining `stylesheet-spacing` / `stylesheet-font-size` hits use fixed `rem`/`px`, `calc(var(--spacing) * n)`, viewport/svh units, or custom sizing with no exact token match.

### Replacements per file

| File | Replacements |
| --- | ---: |
| `sections/announcement-bar.liquid` | 5 |
| `sections/article.liquid` | 4 |
| `sections/collection-list.liquid` | 3 |
| `sections/featured-product.liquid` | 1 |
| `sections/header.liquid` | 5 |
| `sections/main-page-contact.liquid` | 1 |
| `sections/password-header.liquid` | 2 |
| `sections/password.liquid` | 3 |
| `sections/pickup-availability.liquid` | 3 |
| `sections/product-comparison-table.liquid` | 9 |
| `sections/routine-showcase.liquid` | 2 |
| `sections/scroll-categories.liquid` | 1 |
| `snippets/collection-card.liquid` | 3 |
| `snippets/filters-field.liquid` | 3 |
| `snippets/header-dropdown-menu.liquid` | 2 |
| `snippets/header-dropdown-super-menu.liquid` | 2 |

### Baseline counts (before → after)

**`migration-baseline.json`**

| Rule | Before | After |
| --- | --- | --- |
| `legacy-type-tier` `sections/blog.liquid` | 1 | 1 |
| `legacy-type-tier` `sections/promotion-countdown.liquid` | 4 | 4 |
| `raw-spacing` `snippets/product-card.liquid` | 2 | (removed) |

**`stylesheet-ownership-baseline.json` (`stylesheet-spacing` totals)**

- Sum of per-file entries: **187 → 154** (33 fewer declarations in baseline allowance).
- Files removed from baseline (count → 0): `sections/announcement-bar.liquid`, `sections/main-page-contact.liquid`, `sections/pickup-availability.liquid`.
- Largest drops: `sections/product-comparison-table.liquid` 12→3, `sections/header.liquid` 16→14, `sections/feature-tabs.liquid` 8→1, `sections/scroll-categories.liquid` 7→1, `snippets/filters-field.liquid` 10→7, `sections/article.liquid` 8→4, plus shrink-only drops on `sections/ritual-steps.liquid`, `sections/routine-showcase.liquid` from earlier branch work.
- `stylesheet-font-size` `sections/promotion-countdown.liquid`: 1 → 1 (unchanged).

### Computed values (Chrome DevTools MCP, `http://127.0.0.1:9292/`, default preset)

| Element | Width | Property | HEAD (before edit) | After edit |
| --- | ---: | --- | --- | --- |
| `.announcement-bar__slide` | 390 | `gap` | 9.0997px | 9.0997px |
| `.announcement-bar__grid` | 390 | `padding-block` | 4.5479px | 4.5479px |
| `.scroll-categories__heading` | 390 | `gap` | 9.0997px | 9.0997px |
| `.announcement-bar__slide` | 1440 | `gap` | 15px | 15px |
| `.announcement-bar__grid` | 1440 | `padding-block` | 7.5px | 7.5px |
| `.scroll-categories__heading` | 1440 | `gap` | 15px | 15px |

### Validators

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | Pass; no “counts fell” notice; 3 `[dead-setting-unprovable]` notes (unchanged). |
| `npm.cmd run test:theme-check` | Pass; **158** files inspected, **0** offenses. |
| `npm.cmd run scan:compat` | Pass (includes `build:tw` + `lint:compat`; embedded lint **67** stylesheet blocks). |
| `npm.cmd run test:layout -- --widths 390,768,1024,1440` | **0** new issues (not in baseline). |
| `git diff` on baseline JSON | Only lowered or removed entries; no raises. |
| `npm.cmd run build:tw` then `git diff -- assets/tailwind.output.css` | Empty diff. |
| `npx prettier --check` on changed Liquid + baseline + `docs/agent/context.md` | Pass after `prettier --write sections/announcement-bar.liquid` (format-only). |

### Coordinator check (Show tier, 2026-10-29)

- **Equivalence.** Every changed hunk under `sections/` and `snippets/` was expanded by substituting each `var(--spacing-step-*)` with its definition from `tailwind/tailwind.input.css` and compared, whitespace-insensitive, with the removed text. All 40 hunks are identical. The 15 flagged at first only carried the next file's diff header into the comparison. So each replacement is the same `clamp()` expression, and the computed value cannot differ at any width.
- **Baselines.** Only lowered or removed entries (implementer record above).
- **Remaining:** the user's look.
