# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-12.

## 6-R2 Raw spacing to the space scale

**Status:** authorized by the user 2026-10-12 ("可以。这个也比较机械吧，执行还是执行prompt"). Proposed choices are recorded below; the user accepts them by running the prompt (`silence-means-accept`). Delegated to an external Sonnet session. Executed 2026-10-12; layout 0 new after the approved baseline growth (38 → 42); Review round 1: FAIL on one documentation sentence only; corrected; Review round 2: PASS. Complete; committed with this record.

**Outcome:** Liquid markup spacing utilities use the space scale (`*-step-*`). `raw-spacing` falls from 658 / 80 files to 2 (`snippets/product-card.liquid` `tablet:px-[8vw] tablet:py-[5vh]`, viewport-relative modal padding, kept).

**This batch changes what renders.** Steps are fluid (0.6× at 375px, full at 1280px), so every migrated value shrinks below 1280px, and off-table values shift at desktop too (list below). This is the accepted 6-C7 consequence ("a migrated value shrinks to 0.6× on mobile; the polish pass owns that change"). No browser correction happens in this batch.

**Facts (coordinator, 2026-10-12, from `classCandidateTokens` over `layout/` / `sections/` / `snippets/`):** 658 uses. 611 use a value from the 6-C7 old-to-new table, 22 a fractional value, 23 another integer value, 2 an arbitrary value, and 2 are negative. Values: 4 ×115, 3 ×108, 6 ×100, 2 ×68, 1 ×57, 8 ×47, 10 ×39, 5 ×38, 12 ×17, 1.5 ×15, 16 ×10, 20 ×7, 9 ×6, 24 ×5, 0.5 ×5, 25 ×4, 28 ×4, 14 ×3, 7 ×2, 40 ×2, 30 ×1, 32 ×1, 2.5 ×1, 3.5 ×1, `[8vw]` ×1, `[5vh]` ×1.

**Proposed choices (accepted by running the prompt):**
1. **Mapping rule:** the nearest step on a log scale (geometric midpoint between neighbouring steps), comparing desktop sizes (Tailwind unit 2.5px; step unit 10px at 1280). This reproduces every entry of the 6-C7 table and extends it.
2. **Add `step-4xl`** (×8 of the base: 48px → 80px, `clamp(4.8rem, 3.474rem + 3.536vw, 8rem)`) for the 8 section-level gaps above 3xl (28, 30, 32, 40). Mapping them to 3xl would cut 70–100px desktop gaps to 60px.
3. **Step names, not intent aliases:** choosing `related` / `group` / `section` needs judgement per gap, so it belongs to the polish pass (`design.md`, Spacing scale).
4. **`mixed-element` is a separate later batch:** once spacing is on tokens, moving utilities into stylesheets can no longer hide raw values.
5. **The two viewport-relative paddings stay** in the baseline; whether `raw-spacing` exempts viewport units is decided when the check is deleted.

### Mapping

| Raw | Step | Desktop shift (≥1280) |
| --- | --- | --- |
| 0.5 | `3xs` | 1.25 → 2.5px |
| 1 | `3xs` | exact |
| 1.5 | `2xs` | 3.75 → 5px |
| 2 | `2xs` | exact |
| 2.5 | `xs` | 6.25 → 7.5px |
| 3 | `xs` | exact |
| 3.5 | `s` | 8.75 → 10px |
| 4 | `s` | exact |
| 5 | `m` | 12.5 → 15px |
| 6 | `m` | exact |
| 7 | `l` | 17.5 → 20px |
| 8 | `l` | exact |
| 9 | `l` | 22.5 → 20px |
| 10 | `xl` | 25 → 30px |
| 12 | `xl` | exact |
| 14 | `2xl` | 35 → 40px |
| 16 | `2xl` | exact |
| 20 | `3xl` | 50 → 60px |
| 24 | `3xl` | exact |
| 25 | `3xl` | 62.5 → 60px |
| 28 | `4xl` | 70 → 80px |
| 30 | `4xl` | 75 → 80px |
| 32 | `4xl` | exact |
| 40 | `4xl` | 100 → 80px |

The utility name and sign stay, and only the value changes: `gap-x-4` → `gap-x-step-s`, `-ms-2` → `-ms-step-2xs`, `tablet:py-40` → `tablet:py-step-4xl`. Variants and the `!` modifier stay.

### Items

1. `tailwind/tailwind.input.css`: add `--spacing-step-4xl: clamp(4.8rem, 3.474rem + 3.536vw, 8rem);` after `step-3xl`.
2. Rename every raw spacing token in class-candidate positions (`classCandidateTokens`) per the mapping, except `[8vw]` / `[5vh]`.
3. `npm.cmd run build:tw`; `lint-theme.js --shrink-migration-baseline`.
4. `docs/references/style-system/css-architecture.md` (Space scale): a `step-4xl` row, the old-to-new table extended to the full mapping above, and one line with the new `raw-spacing` count. `docs/design/design.md` Spacing scale: "`--spacing-step-3xs` to `--spacing-step-4xl`".

### Implementation surface

`layout/*.liquid`, `sections/*.liquid`, `snippets/*.liquid` (class-candidate tokens only), `tailwind/tailwind.input.css` (one line), `assets/tailwind.output.css` (via `build:tw` only), `.agents/skills/check-theme-architecture/scripts/migration-baseline.json` (shrink flag only), `docs/references/style-system/css-architecture.md`, `docs/design/design.md` (one phrase), and this file.

Forbidden: `config/**`, `templates/**`, `sections/*-group.json`, `locales/**`, `assets/*.js`, `{% schema %}` / `{% stylesheet %}` / `{% javascript %}` blocks, other `tailwind/*` lines, lint and test code, and raising any baseline entry.

**Review tier:** Ask (Liquid markup; a token addition; an external execution prompt).

### Acceptance checks

1. **Rename check:** a script outside the repo applies the mapping to `HEAD`'s text only at `classCandidateTokens` offsets, and the result equals every changed Liquid file. Output: files, renames per raw value, mismatches 0.
2. **Counts from commands:** `collectMigrationCounts`: `raw-spacing` 658 → 2, `legacy-breakpoint` 0 and `legacy-type-tier` 6 unchanged. `npm.cmd run lint:theme` passes.
3. **Generated CSS:** every added rule in `assets/tailwind.output.css` is a `*-step-*` spacing utility, or the `--spacing-step-4xl` variable. Removed rules are the raw utilities that no longer have a user. Any other change is listed.
4. `git diff HEAD -- config templates locales assets/*.js` is empty; `git diff HEAD -- tailwind` is the one added line.
5. `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`: pass. Prettier passes on the changed files, or the failure exists at `HEAD`.
6. `npm.cmd run test:layout` (dev server running): 0 new issues against the 38-entry baseline. Any new issue is listed with its page, width and selector; the baseline is not edited (growth needs the user's approval).
7. **Browser look (user, deferred to the polish pass):** mobile and tablet spacing shrinks as expected; desktop shifts per the mapping table.

### Progress

- **Before** (`collectMigrationCounts('.')`): `raw-spacing` **658** (80 files); per-raw census matches plan (658 total, including `[8vw]` ×1, `[5vh]` ×1).
- **Token:** `--spacing-step-4xl` added in `tailwind/tailwind.input.css`; **656** spacing tokens renamed at `classCandidateTokens` offsets across **80** Liquid files (`%TEMP%/6-r2-rename.js`).
- **After:** `raw-spacing` **2** (`snippets/product-card.liquid` only); `legacy-breakpoint` **0**, `legacy-type-tier` **6** unchanged.
- **Validators:** `build:tw`, `--shrink-migration-baseline`, `lint:theme`, `test:theme-check`, `lint:liquid-syntax`, `scan:compat` pass; Prettier on changed files pass.
- **Layout:** `test:layout` ran (dev server up): **4** new issues vs 38-entry baseline (not edited): home `page-margin` ×2 @ 360px (testimonial author `p.testimonial-featured__author`); page-about-view `page-margin` ×1 @ 360px (same); blog `page-margin` ×1 @ 640px (`#blog-template__main-tab-2`).
- **Layout check (coordinator, 2026-10-12):** the executor's run reported 4 new `page-margin` issues, and a home-only rerun at 360 (run twice) confirmed they are stable. All 4 are in families already in the baseline and listed for the polish pass: 3 are `testimonial-featured__author` in the marquee (home slots 1 and 2, about page; 360), whose layout gap changed from `gap-10` (25px) to `gap-step-xl` (18px at 360); 1 is `#blog-template__main-tab-2` at 640, where the tab-1 entry at 360 is already baselined. These are consequences of the intended spacing shrink. **The user approved (2026-10-12)** adding them: the 4 entries are copied from `.tmp-layout-check/report.json` `newIssues` and appended (no `--write-baseline`, so no other entry changed). The baseline is now 42. Full rerun: `npm.cmd run test:layout` 0 new issues.
- **Review round 1 (2026-10-12): FAIL, Low, documentation only.** `css-architecture.md` said "values above `3xl` map to `4xl`", but `25` (62.5px) correctly maps to `3xl`. Everything else was proven independently: 656 renames with 0 mismatches, the log-nearest mapping, `step-4xl` = 2× `step-2xl`, the counts, the baselines, a byte-identical rebuild, and `test:layout` 0 new. Corrected: the sentence now states the log-nearest rule and names `28`, `30`, `32` and `40` as the `4xl` values.
- **Review round 2 (2026-10-12): PASS**, no findings. The corrected sentence matches the log-nearest mapping, nothing else changed since round 1, and the counts and the 42-entry layout baseline are confirmed.
