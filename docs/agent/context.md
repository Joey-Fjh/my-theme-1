# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3g: align the settings-chain lint with the style ownership rule; status and record cleanup

Status: executed and accepted; independent review round 2 PASS (Grok 4.7, 2026-10-03). Authorized 2026-10-03.

### Direction

There are two parts. Both are reviewed together.

- **Part A, executor: the lint change.** The 5-C3f style ownership rule (`docs/references/style-system/css-architecture.md`, "Style ownership") allows Tailwind's default weight, leading and tracking scales, and black, white and transparent, for local intent. The settings-chain lint still rejects them, so 5-C3f needed `lint-allow` comments.
  - Align the lint with the rule.
  - Keep it rejecting what the rule still forbids: arbitrary values (`text-[…]`, `font-[…]`, `leading-[…]`, `tracking-[…]`, colour `[…]`), Tailwind's default text sizes (tiers own sizes), Tailwind's default font families, and every palette colour other than black and white (for example `red-500`).
- **Part B, coordinator: status and record cleanup, already done in the worktree.**
  - **`docs/project.md`:**
    - the Status progress line is rewritten to the current state (JS track closed, CSS architecture closed, next the browser pass, then the docs review, then the design rework);
    - the phase 1 and phase 2 entries no longer cite the deleted documents;
    - "GPT reviews" becomes "an independent review".
  - **`docs/agent/board.md`:** 13 resolved or historical entries are removed. These are the phase 0–2 history, the 3B CSS debt (settled by 5-C3f), the stale pre-existing `lint:doc-paths` and `lint:i18n` failures (both pass today), and the A8 and direction entries already done.
  - **Deleted, all kept in Git history:**
    - `docs/migration/step1/` raw validator dumps (`_lint-i18n.out`, `_lint-theme.out`, `_theme-check.out`, `lint-theme.out`);
    - `docs/migration/step1/baseline.md`, `check-shopifyignore.mjs`, `validation.md`;
    - `docs/migration/step1-outer-files.md`;
    - `docs/migration/phase2/` (whole: planning for phases 3–4, done);
    - `docs/migration/phase0/README.md`, `sizes.md`, `runtime-dependencies.md` (they describe the pre-migration runtime).
  - **Kept:** `docs/migration/phase0/capabilities.md`, `browser-checklist.md`, `merchant-references.md` (its reference to the deleted runtime file is reworded), and `docs/migration/step1/retention-audit.md` (cited by `docs/project.md`, the checklist and the capabilities).

### Implementation surface (Part A)

- `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`: `isSettingsChainLiquidViolation`, `isAllowedTypographyValue`, `isAllowedColorValue`, `isForbiddenColorValue`, and the constants they use.
- `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`: update and add tests.
- `.agents/skills/check-theme-architecture/SKILL.md`, `docs/references/style-system/css-architecture.md`: describe the new lint scope exactly, if they describe it today.
- **`lint-allow` comments for `settings-chain-css-typography`, `settings-chain-css-color`, and `settings-chain-liquid` in `sections/` and `snippets/`:**
  - remove each one the new lint no longer needs;
  - keep each one that still guards a forbidden value, with its reason;
  - record every one, `HEAD` → now.
- `assets/tailwind.output.css`: through `npm.cmd run build:tw` only. Expected unchanged; removing a comment must not change the scan.
- Record: this file.
- **Forbidden:**
  - any storefront CSS value or markup change other than deleting `lint-allow` comments;
  - other lint checks;
  - `package.json` and `.github/workflows/ci.yml`;
  - Part B files (the coordinator owns them in this batch).

### Target lint behaviour

- **Liquid classes (`settings-chain-liquid`):**
  - allow the default weights (`font-thin` … `font-black`);
  - allow `leading-<scale>` (`none`, `tight`, `snug`, `normal`, `relaxed`, `loose`, numeric);
  - allow `tracking-<scale>` (`tighter` … `widest`, `normal`);
  - allow `black` and `white` in every colour prefix, with an optional `/opacity`;
  - keep rejecting arbitrary values, default text sizes, default font families, and the other palette colours.
- **CSS typography (`settings-chain-css-typography`):**
  - allow a literal `font-weight` (`100`–`900` in steps of 100, `normal`, `bold`);
  - allow a unitless or `normal` `line-height`;
  - allow an `em`-based `letter-spacing` (already allowed today);
  - keep rejecting literal `font-size` and `font-family`.
- **CSS colour (`settings-chain-css-color`):**
  - allow `#fff`, `#ffffff`, `#000`, `#000000` (case-insensitive), the keywords `white` and `black`, `rgb` / `rgba` of pure white or black at any alpha, and `color-mix(in <space>, <white|black literal> <n>%, transparent)`;
  - keep rejecting every other literal colour.
- **Tests:**
  - one positive and one negative test per allowance above;
  - the existing tests stay or are updated with a reason;
  - `lint-allow` behaviour tests stay.

### Acceptance checks

- **H1:** the lint code implements the target behaviour exactly. Show the diff and a table: allowance → code line → test name.
- **H2:** `npm.cmd run test:theme-architecture` passes, with the new tests listed. Each new negative test fails if its allowance is widened (show one mutation run, reverted afterwards).
- **H3:** the `lint-allow` table for every settings-chain allow in `sections/` and `snippets/`, `HEAD` → now, each marked removed (no longer needed) or kept (with the forbidden value it guards). `npm.cmd run lint:theme` passes with the removed ones gone.
- **H4:**
  - `npm.cmd run build:tw` leaves `assets/tailwind.output.css` identical to `HEAD`;
  - the only storefront file changes are deleted `lint-allow` comment lines;
  - show `git diff -U0` filtered to `sections/` and `snippets/`.
- **H5:** `SKILL.md` and `css-architecture.md` describe the new scope exactly.
- **H6:** these pass:
  - `lint:theme`;
  - `test:theme-architecture`;
  - `test:theme-check` (no offenses);
  - `lint:liquid-syntax`;
  - `scan:compat`;
  - `lint:i18n`;
  - `lint:doc-paths`;
  - `doctor:agent`;
  - `npx prettier --check` on changed files.
- **H7 (Part B, for the reviewer):**
  - `docs/project.md` Status matches the commit history;
  - no tracked file cites a deleted path (`git grep` for each deleted path, except inside `docs/migration/step1/retention-audit.md`, which is historical);
  - the removed board entries are resolved or historical;
  - `lint:doc-paths` passes.

### Execution record

#### Part A — settings-chain lint alignment

##### H1 — lint code and tests

| Allowance | Code (theme-contracts.js) | Tests |
| --- | --- | --- |
| Liquid default weights | `isSettingsChainLiquidViolation`: `font-*` allows `DEFAULT_FONT_WEIGHTS` | `settings chain liquid class font-medium passes`; neg `font-sans fails` |
| Liquid `leading-*` scale | `DEFAULT_LEADING_SCALES` + numeric | `leading-tight passes`; neg `leading-[2rem] fails` |
| Liquid `tracking-*` scale | `DEFAULT_TRACKING_SCALES` | `tracking-wide passes`; neg `tracking-[0.2em] fails` |
| Liquid black/white colours | `liquidBlackOrWhiteSuffix` on `text-*` and colour prefixes | `text-white/80 passes`; neg `text-red-500 fails` |
| CSS `font-weight` literals | `isAllowedTypographyValue` property branch | `literal font-weight 500 passes`; neg `literal font-family fails` |
| CSS unitless `line-height` | `isAllowedTypographyValue` `line-height` branch | `unitless line-height passes`; neg `px line-height fails` |
| CSS `letter-spacing` em/% | `letter-spacing` branch (unchanged rule) | `em letter-spacing passes`; neg `px letter-spacing fails` |
| CSS black/white literals | `isAllowedLiteralWhiteBlackColor` + `isAllowedColorValue` | `literal white passes`, `white black color-mix passes`; neg `hex #112233 fails`, `red keyword fails` |

Summary: extended `isSettingsChainLiquidViolation`, property-aware `isAllowedTypographyValue`, and `isAllowedLiteralWhiteBlackColor`; liquid arbitrary regex unchanged; palette rejection unchanged except black/white.

##### H2 — tests and mutation

```
npm.cmd run test:theme-architecture
# tests 146
# pass 146
# fail 0
```

Mutation (reverted): in `isForbiddenColorValue`, `if (/^red$/i.test(trimmed)) return false;` → `settings chain css color literal red keyword fails` → `not ok 70` (`failureType: 'testCodeFailure'`). Mutation removed before commit.

##### H3 — lint-allow inventory (`sections/` + `snippets/`)

| File | Check | HEAD | Now | Reason |
| --- | --- | --- | --- | --- |
| `snippets/grid-feature-card.liquid` | `settings-chain-css-typography` | present | **removed** | `line-height: 1.25` allowed |
| `snippets/pickup-availability-inline.liquid` | `settings-chain-css-typography` | present | **removed** | `font-weight: 500` allowed |
| `snippets/sort-by-dropdown.liquid` | `settings-chain-css-typography` | present | **removed** | `font-weight: 700` allowed |
| `snippets/watermark.liquid` | `settings-chain-css-typography` | present | **removed** | `line-height: 1` allowed |
| `snippets/image-lightbox.liquid` | `settings-chain-css-color` | 2 lines | **removed** | `#fff` / `color-mix(...#fff...)` allowed |
| `snippets/rotating-badge.liquid` | `settings-chain-liquid` | present | **kept** | `text-[calc(...)]` arbitrary still forbidden |

```
npm.cmd run lint:theme → Theme architecture lint passed.
```

##### H4 — storefront diff and Tailwind build

```
npm.cmd run build:tw
Done in 134ms (tailwindcss v4.1.18)
fc /b assets\tailwind.output.css (pre-build copy vs post-build) → FC: no differences
```

```
git diff -U0 -- sections snippets
```
(only six deleted `lint-allow` comment lines; no declaration or markup changes — see git output in worktree.)

##### H5 — docs

Updated `check-theme-architecture/SKILL.md` (`settings-chain-*` rows) and `css-architecture.md` (Global settings chain + Style ownership lint sentence).

##### H6 — validators

```
npm.cmd run lint:theme → Theme architecture lint passed.
npm.cmd run test:theme-architecture → pass 146 fail 0
npm.cmd run test:theme-check → 146 files, no offenses
npm.cmd run lint:liquid-syntax → Liquid syntax lint passed.
npm.cmd run scan:compat → Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks).
npm.cmd run lint:i18n → passed
npm.cmd run lint:doc-paths → Doc path lint passed.
npm.cmd run doctor:agent → exit 0
npx prettier --check (changed Part A files) → All matched files use Prettier code style!
```

##### Remaining risks

- Literal `font-weight` / `line-height` in `{% stylesheet %}` no longer forces a `lint-allow`, so reviewers should still prefer `var(--font-*)` for theme-linked headings unless the override is intentional local intent (5-C3f).
- `rotating-badge` still needs `settings-chain-liquid` for arbitrary `text-[calc(...)]`; removing that class would require a markup/CSS redesign.
- Part B reviewer must still run H7 (`docs/project.md`, deleted migration paths, `board.md`).

### Coordinator review, Part A, round 1 (2026-10-03): one finding, fixed by the coordinator

Verified clean:

- **Liquid check:**
  - allows the default weights, the `leading-*` and `tracking-*` scales, and `black` / `white` with optional `/opacity` on every colour prefix;
  - still rejects arbitrary values, default text sizes, default font families, and other palette colours.
- **CSS checks:**
  - allow literal `font-weight` and unitless or `normal` `line-height`;
  - allow pure white or black literals (hex, keyword, `rgb` / `rgba`, `color-mix` with `transparent`);
  - still reject literal `font-size` / `font-family` and every other literal colour.
- **`lint-allow` comments:** 6 removed; only comment lines changed in `sections/` and `snippets/`. The `rotating-badge` `settings-chain-liquid` allow is kept, because it guards an arbitrary `text-[calc(...)]`.
- **Tailwind output:** `assets/tailwind.output.css` is identical to `HEAD` after `build:tw`.

Finding:

- **P3 `theme-contracts.js` `isAllowedTypographyValue`, `letter-spacing` branch.**
  - The branch returned early. So `calc(var(--font-…) …)`, allowed before this change, was now rejected.
  - It also rejected negative `em`, while Tailwind's `tracking-tight` / `tracking-tighter` compile to `-0.025em` / `-0.05em`, which the style ownership rule allows.
  - Fix: the early return is gone. Negative `em` is allowed for `letter-spacing` only, and everything else falls through to the shared settings-chain checks.
  - Three tests added:
    - `negative em letter-spacing passes`;
    - `calc font token letter-spacing passes`;
    - `negative px letter-spacing fails`.

Re-run:

- `test:theme-architecture` 149 pass, 0 fail;
- `lint:theme` passed;
- `test:theme-check` no offenses (146 files; the count drops by one with the deleted `docs/migration` files, and no theme file was deleted);
- `lint:liquid-syntax` passed;
- `scan:compat` passed (55 stylesheet blocks);
- `lint:i18n` (both checks) passed;
- `lint:doc-paths` passed;
- `doctor:agent` exit 0;
- `build:tw`: `assets/tailwind.output.css` has no diff against `HEAD`;
- `npx prettier --check` on the lint files passed.

### Independent review (Grok 4.7, 2026-10-03)

**FAIL.** Part A does not implement the target lint exactly. H2–H4, H6, and H7 pass. The diff stays inside the plan (lint, tests, the two lint docs, six deleted `lint-allow` comments, Part B record cleanup, and the `merchant-references.md` reword). No storefront declaration or markup changed.

#### H1 — FAIL

Probe: temp theme, `runThemeLint` on one class per line and one declaration per line (`verify-5c3g-probe.cjs`, deleted after this review). 12 failures. Everything else in the fixture passed.

| Case | Result | Path |
| --- | --- | --- |
| `font-medium`, `font-black` | pass | `isSettingsChainLiquidViolation`: `font-` + `DEFAULT_FONT_WEIGHTS` returns false |
| `leading-6`, `leading-tight` | pass | `leading-` + named scale or `/^\d+(\.\d+)?$/` returns false |
| `tracking-tight`, `tracking-wide` | pass | `tracking-` + `DEFAULT_TRACKING_SCALES` returns false |
| `text-white/80`, `bg-black/45`, `border-white/40` | pass | `liquidBlackOrWhiteSuffix`: base before `/` is `black` or `white` |
| `bg-transparent` | pass | `PROJECT_COLOR_SUFFIXES` |
| `leading-[1.1]`, `tracking-[0.2em]` | fail | arbitrary-prefix regex returns true first |
| `text-red-500`, `text-sm`, `font-sans` | fail | palette first segment, `DEFAULT_TEXT_SIZES`, `DEFAULT_FONT_FAMILIES` |
| `font-weight: 500` | pass | `/^[1-9]00$/` |
| `font-weight: 550`, `line-height: 20px`, `letter-spacing: -1px`, `font-size: 14px` | fail | no branch matches; shared `em`/`%` rule does not |
| `line-height: 1.25` | pass | `/^[\d.]+$/` |
| `letter-spacing: -0.025em` | pass | `/^-[\d.]+em$/` |
| `letter-spacing: calc(var(--font-heading-letter-spacing) * 2)` | pass | `calc(` + `var(--font-` |
| `color: #fff`, `#FFF` | pass | `/^#(?:fff\|ffffff\|000\|000000)$/i` |
| `color: rgba(0,0,0,0.6)`, `rgb(255, 255, 255, 0.4)` | pass | comma-form `rgba?` of 0 or 255 |
| `color: color-mix(in oklab, #fff 80%, transparent)` | pass | `color-mix` branch |
| `color: #fafafa`, `color: red` | fail | not an allowed literal; hex and keyword branches of `isForbiddenColorValue` |
| `color: rgb(0 0 0 / 45%)` | **fail** | comma-only allow; `/^rgb(a)?\(\s*[\d.]/` then forbids it |

Also passed, and these are wider than the target: `text-white/foo` (any token after `/`), bare `leading`, bare `tracking` (the prefix loop requires `leading-` / `tracking-`, so the bare names fall through to `return false`), `line-height: 1.2.3` (`/^[\d.]+$/`). `font-weight: 1em` and `line-height: 1.25em` still pass through the pre-existing `em`/`%` fallthrough, which the target kept.

#### H2 — pass

`npm.cmd run test:theme-architecture`: 149 pass, 0 fail.

New tests (added `test(` lines vs `HEAD`): `font-medium` passes; `font-sans` fails; `leading-tight` passes; `leading-[2rem]` fails; `tracking-wide` passes; `tracking-[0.2em]` fails; `text-white/80` passes; `text-red-500` fails; literal white passes; red keyword fails; white/black `color-mix` passes; `font-weight: 500` passes; literal `font-family` fails; unitless `line-height` passes; px `line-height` fails; em `letter-spacing` passes; negative em `letter-spacing` passes; calc font-token `letter-spacing` passes; negative px `letter-spacing` fails; px `letter-spacing` fails; literal rem `font-size` fails (weight literals allowed).

Mutation, then restore: in `isSettingsChainLiquidViolation`, `DEFAULT_FONT_FAMILIES` returned `false` instead of `true`. `node --test --test-name-pattern "font-sans fails"` exited 1: `not ok 1`, assertion expected `/settings typography\/color chain/` and got `''`. File restored from the pre-mutation bytes. `git hash-object` before and after: `cdc9cf4b87804ae2b529603e1539081dcd91f4d2`. Bytes match.

#### H3 — pass

`git grep -n "lint-allow settings-chain" HEAD -- sections snippets` and the same on the worktree. No `sections/` hit at `HEAD` or now.

| File | HEAD allow | Now | Still needed? |
| --- | --- | --- | --- |
| `snippets/grid-feature-card.liquid` | typography, `line-height: 1.25` | removed | no — unitless line-height passes; `lint:theme` passes |
| `snippets/image-lightbox.liquid` | color, `color-mix(… #fff 80% …)` and `color: #fff` | removed | no — both pass the new color allow |
| `snippets/pickup-availability-inline.liquid` | typography, `font-weight: 500` | removed | no — numeric weight passes |
| `snippets/sort-by-dropdown.liquid` | typography, `font-weight: 700` | removed | no — numeric weight passes |
| `snippets/watermark.liquid` | typography, `line-height: 1` | removed | no — unitless line-height passes |
| `snippets/rotating-badge.liquid:92` | liquid, center `text-[calc(var(--badge-size-mb)*var(--badge-center-scale))]` | kept | yes — fixture of that class fails `settings-chain-liquid` with no allow (1 failure) and passes with the allow (0) |

#### H4 — pass

`npm.cmd run build:tw`, then `scan:compat` (which runs `build:tw` again). After both, `git diff --exit-code HEAD -- assets/tailwind.output.css` exited 0. `git diff -U0 HEAD -- sections snippets` is only the six deleted `lint-allow` comment lines above.

#### H5 — fails with H1

`SKILL.md` rows `settings-chain-liquid`, `settings-chain-css-typography`, and `settings-chain-css-color`, and `css-architecture.md` (settings-chain paragraph, the typography paragraph, and Style ownership) describe the written target: weights, leading/tracking scales, black/white with optional `/opacity`, unitless line-height, and `rgb`/`rgba` of 0 or 255 channels. That is stricter than the code on `/foo`, bare `leading`/`tracking`, and `1.2.3`, and wider than the code on `rgb(0 0 0 / 45%)`. The exception table’s iOS-zoom rows (`sections/search.liquid`, `snippets/quantity-selector.liquid`, `tailwind/tailwind.elements.css`) have no `lint-allow` in the worktree; those rows are unchanged from `HEAD` and are not part of this diff.

#### H6 — pass

Tails, all exit 0:

- `lint:theme`: `Theme architecture lint passed.`
- `test:theme-architecture`: `# tests 149` / `# pass 149` / `# fail 0`
- `test:theme-check`: `146 files inspected with no offenses found.`
- `lint:liquid-syntax`: `Liquid syntax lint passed.`
- `scan:compat`: `Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks).`
- `lint:i18n`: `i18n lint passed.` / `Unused locale key lint passed.`
- `lint:doc-paths`: `Doc path lint passed.`
- `doctor:agent`: exit 0, no findings printed
- `npx prettier --check` on the 13 changed text files, before this review was appended: `All matched files use Prettier code style!`

#### H7 — pass

`git log -1 --format="%h %s"` for each cited hash. Each exists. Subjects match the status claims: `2a3c331` phase 3A core runtime; `d49e224` phase 3C-3 gallery/lightbox/Swiper; `c1e4640` phase 4 plan (range start) through `9d6499d` phase 4 Swiper leak fix; `39944ff` 5-R1; `1dd8347` 5-T1; `2683402` 5-H init interception; `2e0cddd` 5-S entry snippet; `96c0f13` 5-D focus return (the closing 5-D code commit; the dialog-layer commit is `5d224eb`); `e0b32f7` 5-F; `115b3e9` 5-C1; `66f1962` 5-C2; `4c006ea` 5-C3a through `dff0442` 5-C3f F3+F4 (F1 `063dfd5` and F2 `2d15ca0` sit inside that span); `1bf75c6` outer framework from skeleton `5191a50`; `44e84c2` phase 2 map; `3da19aa` merge of PR #20, and `git rev-parse v1.0.0-submitted` is `3da19aa63f7e3745717550119c9b922ecebd4bfc`; `926dddb` agent governance/tooling. Phases 1 and 2 no longer cite the deleted documents. Phase 5 now says an independent review.

`git grep` of the deleted path names, excluding `docs/migration/step1/retention-audit.md`, hits only this plan’s deletion list in `docs/agent/context.md`. Kept files are on disk and cited: `retention-audit.md` from `docs/project.md`, `capabilities.md`, and `browser-checklist.md`; `browser-checklist.md` and `capabilities.md` from `docs/project.md`; `merchant-references.md` from `capabilities.md`. Its diff replaces the `runtime-dependencies.md` citation with “Section Rendering API”.

Removed `board.md` content bullets (14; the plan said 13), each resolved or historical: the settings-chain lint decision (resolved by Part A); the 2026-09-29 direction; A8 round 2; the stale `lint:doc-paths` failure (`lint:doc-paths` passes); 3B CSS debt; the stale i18n failures (`lint:i18n` passes); old CSS conventions; phase 2 decisions; Swiper resolved; phase 0a; `step1-outer-files.md`; the 2026-09-24 probe; the 2026-09-28 external review; the phase 1 `lint:doc-paths` scan question. The pending 5-R1 static-check item is still on the board. Design-phase and consolidated-pass items are still on the board.

#### Findings

1. **P3** `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js` (`isAllowedLiteralWhiteBlackColor`, `isForbiddenColorValue`). `color: rgb(0 0 0 / 45%)` fails. The target and `SKILL.md` allow `rgb`/`rgba` of pure black or white at any alpha. Only the comma form passes, so a pasted Tailwind v4 declaration is rejected while `bg-black/45` is allowed. Accept space-separated `rgb`/`rgba` of channels 0 or 255 with an optional `/ <alpha>`.
2. **P3** same file, `liquidBlackOrWhiteSuffix`. `text-white/foo` passes. The target and `SKILL.md` allow an optional opacity, not an arbitrary suffix. Require the part after `/` to be a number.
3. **P3** same file, `isSettingsChainLiquidViolation`. Bare `leading` and `tracking` pass. The target allows `leading-<scale>` and `tracking-<scale>`. `HEAD` rejected a token equal to the prefix. Return a violation when the token is exactly `leading` or `tracking`.
4. **P3** same file, `isAllowedTypographyValue` line-height branch. `line-height: 1.2.3` passes via `/^[\d.]+$/`. A unitless length is one number. Use `/^\d+(\.\d+)?$/`.

### Coordinator fixes after independent review round 1 (2026-10-03)

The four P3 findings in `theme-contracts.js` were verified and fixed:

1. **Space-syntax `rgb`:** `rgb(0 0 0 / 45%)` was rejected. One regex now accepts pure black or white (`0` or `255` on all three channels, via a backreference) in comma syntax or space syntax, with an optional numeric alpha after `,` or `/`.
2. **Opacity modifier:** `text-white/foo` passed. `liquidBlackOrWhiteSuffix` now requires `^(black|white)(/\d+)?$`. The palette check strips a `/…` modifier before reading the colour name, so `text-white/foo` and `text-red-500/80` fail.
3. **Bare `leading` / `tracking`:** these passed. They fail again, as before this batch.
4. **Unitless `line-height`:** `1.2.3` passed. The check is now `^(\d+|\d*\.\d+)$`.

Six tests added:

- `text-white with non-numeric modifier fails`;
- `bare leading class fails`;
- `bare tracking class fails`;
- `rgb space syntax black passes`;
- `rgb space syntax non-black fails`;
- `malformed unitless line-height fails`.

Re-run:

- `test:theme-architecture` 155 pass, 0 fail;
- `lint:theme` passed;
- `test:theme-check` 146 files, no offenses;
- `lint:liquid-syntax` passed;
- `scan:compat` passed (55 stylesheet blocks);
- `lint:i18n` (both checks) passed;
- `lint:doc-paths` passed;
- `doctor:agent` exit 0;
- `build:tw`: `assets/tailwind.output.css` has no diff against `HEAD`;
- `npx prettier --check` on the lint files passed.

Status: awaiting the independent review, round 2.

### Independent review, round 2 (Grok 4.7, 2026-10-03)

**PASS.** No new findings. The four round 1 P3s are fixed, and the required cases match the target.

#### 1. Probe

`runThemeLint` on a temp theme, one class or declaration per line. Failures were only the cases marked fail below. `git hash-object` of `theme-contracts.js` after the probe and the mutation restore: `0533b01c60702dc66ae8de5fe71631a2167c8876`.

| Case | Result |
| --- | --- |
| `font-medium`, `font-black`, `leading-6`, `tracking-tight`, `text-white/80`, `bg-black/45`, `border-white/40`, `bg-transparent` | pass |
| `leading-[1.1]`, `tracking-[0.2em]`, `text-red-500`, `text-red-500/80`, `text-red/80`, `text-sm`, `font-sans`, `text-white/foo`, bare `leading`, bare `tracking` | fail |
| `font-weight: 500`, `line-height: 1.25`, `line-height: .9`, `line-height: 1.25em`, `letter-spacing: -0.025em`, `letter-spacing: calc(var(--font-heading-letter-spacing) * 2)`, `font-weight: 1em` | pass |
| `font-weight: 550`, `line-height: 20px`, `line-height: 1.2.3`, `line-height: 1.`, `letter-spacing: -1px`, `font-size: 14px` | fail |
| `color: #fff`, `#FFF`, `rgba(0,0,0,0.6)`, `rgb(255, 255, 255, 0.4)`, `rgb(0 0 0 / 45%)`, `rgb(255 255 255)`, `rgba(255, 255, 255, .8)`, `rgba(0 0 0 / .8)`, `color-mix(in oklab, #fff 80%, transparent)` | pass |
| `color: #fafafa`, `rgb(0 0 1 / 45%)`, `rgb(0 255 0)`, `red` | fail |

Paths: `liquidBlackOrWhiteSuffix` is `^(black|white)(/\d+)?$`; palette names split on `-` or `/`; `token === prefix` rejects bare `leading` and `tracking`; line-height is `^(\d+|\d*\.\d+)$`; `rgb`/`rgba` uses one backreference so all three channels are `0` or all three are `255`, comma or space, optional numeric alpha. `font-weight: 1em` and `line-height: 1.25em` still pass through the pre-existing `em`/`%` rule, which the target kept. `text-white/12.5` fails (integer opacity only); that is narrower than a decimal opacity, and the required `/80` and `/45` cases pass. `rgb(0, 0 0)` passes; the channels are still pure black.

#### 2. Diff since round 1

Compared with the functions recorded in the round 1 review, `theme-contracts.js` changed only for the four findings:

- space-syntax `rgb`/`rgba` of pure black or white (`isAllowedLiteralWhiteBlackColor`);
- numeric `/opacity` only, plus splitting a `/…` modifier before the palette name (`liquidBlackOrWhiteSuffix`, both `split(/[-/]/)` sites);
- bare `leading` / `tracking` (`token === prefix`);
- unitless line-height (`^(\d+|\d*\.\d+)$`).

Six new tests, at `theme-architecture.test.js`:

- `settings chain liquid class text-white with non-numeric modifier fails`
- `settings chain liquid bare leading class fails`
- `settings chain liquid bare tracking class fails`
- `settings chain css color rgb space syntax black passes`
- `settings chain css color rgb space syntax non-black fails`
- `settings chain css typography malformed unitless line-height fails`

Each fix was reverted on its own, the matching tests were run, and the file was restored before the next trial. `git hash-object --stdin` before and after: `0533b01c60702dc66ae8de5fe71631a2167c8876`.

- Opacity function restored to `split('/')`: `text-white with non-numeric modifier fails` → `not ok 1`, 0 pass, 1 fail.
- `token === prefix` removed: bare leading and bare tracking → `not ok 1`, `not ok 2`, 0 pass, 2 fail.
- `rgb` regex restored to comma-only: `rgb space syntax black passes` → `not ok 1`. `rgb space syntax non-black fails` stayed `ok` (the old code also rejects `rgb(0 0 1 / 45%)`).
- Line-height regex restored to `/^[\d.]+$/`: `malformed unitless line-height fails` → `not ok 1`, 0 pass, 1 fail.

#### 3. Regressions

`npm.cmd run build:tw`, then `scan:compat` (which runs `build:tw` again). `git diff --exit-code HEAD -- assets/tailwind.output.css` exited 0.

Tails, all exit 0:

- `test:theme-architecture`: `# tests 155` / `# pass 155` / `# fail 0`
- `lint:theme`: `Theme architecture lint passed.`
- `test:theme-check`: `146 files inspected with no offenses found.`
- `lint:liquid-syntax`: `Liquid syntax lint passed.`
- `scan:compat`: `Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks).`
- `lint:i18n`: `i18n lint passed.` / `Unused locale key lint passed.`
- `lint:doc-paths`: `Doc path lint passed.`
- `doctor:agent`: exit 0, no findings printed
- `npx prettier --check` on the 13 changed text files, before this review was appended: `All matched files use Prettier code style!`
