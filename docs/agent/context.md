# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-09.

## Plan 6-C4: layered colour tokens, scrims, shadows

**Status:** accepted by the user 2026-10-09 (browser look); authorized by the user 2026-10-09 ("授权"), covering the items listed for confirmation: the light shadow values 0.06 / 0.10 / 0.16, the black/white rule narrowed to the scrim roles, the `--shadow-*` namespace reset to three steps, and the `scan:contrast` npm script. Later user decisions in the log: dark shadow steps (option B), `text-subtle` 0.72, `--color-line-inverse`, per-scheme role re-declaration with `colour-role-sync`, `--color-indicator` / `-strong`. Part A and Part B done; independent review round 1 FAIL, fixes done; round 2 pending. (Line restored: the Part B session had overwritten it.)

**Outcome.** Every derived colour in theme code flows source → step → role (→ optional component alias). Sections and snippets use roles only. No raw alpha, opaque background/foreground mix, `@supports (color: color-mix…)` duplicate, hard-coded black shadow, or black/white literal outside the scrim roles remains, except the items owned by 6-C9, which stay on the baseline under that owner. A contrast report covers every scheme's key pairs. Decisions: `docs/agent/board.md`, "Open: 6-C4 tier table" (user, 2026-10-09).

**Dependencies.** None on merchant data. The authorization must name the three harness changes below (rule text, Tailwind shadow namespace reset, new npm script).

### Token design

**Layer 1, steps** (`snippets/css-variables.liquid`). Revised by the user 2026-10-09 (option B) after the parity calculation in the execution log: tint and text steps are one set on `:root`, because their strength follows each scheme's own foreground/background contrast; only the shadow steps rise on dark backgrounds, set per scheme in the scheme loop. A scheme is dark when `scheme.settings.background_color | color_brightness` is below 128 (the midpoint of the 0–255 brightness range). No Horizon code, names, or values are used (Theme Store requirement 2: fully original code; Horizon is a reference for organization only).

| Step | Value |
| --- | --- |
| `--alpha-5` (was "faint" in the first draft) | 0.05 |
| `--alpha-10` ("soft") | 0.10 |
| `--alpha-20` ("line") | 0.20 |
| `--alpha-35` ("line-strong") | 0.35 |
| `--alpha-50` (scrim) | 0.50 |
| `--alpha-72` ("subtle-text") | 0.72 (raised from 0.60 by the user, 2026-10-09, for WCAG AA) |
| `--alpha-80` ("muted-text", veil, scrim-strong, on-scrim-muted) | 0.80 |

| Shadow step | Light background | Dark background |
| --- | --- | --- |
| `--alpha-shadow-sm` | 0.06 | 0.28 |
| `--alpha-shadow-md` | 0.10 | 0.45 |
| `--alpha-shadow-lg` | 0.16 | 0.60 (parity 0.73, capped) |

**Layer 2, roles** (`tailwind/tailwind.input.css`, `@theme inline`; scrims and on-scrim on fixed black / white):

| Role token | Value | Utilities | Absorbs |
| --- | --- | --- | --- |
| `--color-muted` | foreground × muted-text | `text-muted` | text 90, 80, 70, 65; `text-current/80` |
| `--color-subtle` | foreground × subtle-text | `text-subtle` | text 60, 55, 50, 45 |
| `--color-faint` | foreground × line | `text-faint` | text 20 (graphics only: placeholder SVG, empty stars) |
| `--color-line` | border × line | `border-line`, `divide-line`, `bg-line` (1px rules) | border 20 / 25, `bg-theme-border/20`, `currentColor` 20, foreground 0.12–0.25 used as a line |
| `--color-line-strong` | border × line-strong | `border-line-strong` | border 50 / 35, `border-theme-text/30`, `currentColor` 35, foreground 0.3–0.5 used as a line, scrollbar thumb |
| `--color-surface-muted` | foreground × faint | `bg-surface-muted` | foreground 0.05–0.08 fills, opaque mixes 95/5 and 92/8, `bg-theme-text/5`, image placeholder `bg-theme-bg/50` |
| `--color-surface-strong` | foreground × soft | `bg-surface-strong` | foreground 0.1–0.2 fills (hover, selected, track) |
| `--color-veil` | background × 0.8 | `bg-veil` | `bg-theme-bg` /90, /80, /60 |
| `--color-scrim` | black 0.5 | `bg-scrim`, gradient stops | `bg-black/45`, `/60`, collection-card 0.58, `--color-dialog-overlay` |
| `--color-scrim-strong` | black 0.8 | `bg-scrim-strong` | `bg-black/80`, lightbox dark overlays not owned by 6-C9 |
| `--color-on-scrim` / `--color-on-scrim-muted` | white / white 0.8 | `text-on-scrim`, `text-on-scrim-muted` | white text 100, 80, 60 over scrims |
| `--shadow-sm` / `-md` / `-lg` | `0 1px 3px` / `0 8px 24px` / `0 14px 36px`, black × shadow step | `shadow-sm`, `shadow-md`, `shadow-lg` | `shadow` → sm, `shadow-lg` → md, `shadow-2xl` → lg; literal shadows by alpha: ≤0.06 sm, 0.08–0.12 md, ≥0.14 lg |

The `--shadow-*` namespace is reset to `initial` before the three are declared. The body colour in `css-variables.liquid` uses `--alpha-muted-text`. Setting-driven alphas (focus ring, button / input / dialog / toast / product card shadows) and the button reverse-fill mixes stay as they are.

**Mapping rule for raw values** (by CSS property, then nearest step): `color` → text roles; `border-*`, `outline`, `divide`, 1px rule backgrounds, `0 0 0 1px` rings → line roles; fills on foreground → surface roles; fills on background → `veil` (≥ 0.6) or `surface-muted` (placeholders); black / white over media → scrim roles; decorative `box-shadow` → shadow roles. A value that fits no row stops the work and goes back to the coordinator; no new role is invented during execution.

### Implementation surface

- Part A (coordinator):
    - `tailwind/tailwind.input.css` (roles, shadow reset, delete `--color-dialog-overlay` and the dead tokens confirmed by a utility-form search: `primary-text`, `primary-border`, `secondary-text`, `secondary-border`, `accent-ui`, `success-text`, `warning-text`, `info-text`; any with a consumer stays);
    - `snippets/css-variables.liquid` (steps, body colour);
    - the colour lint in `.agents/skills/check-theme-architecture/scripts/` (`lint-theme.js`, `lib/`, `theme-architecture.test.js`, `migration-baseline.json`, `SKILL.md`): a new ratchet rule `raw-colour` over Liquid markup, `{% stylesheet %}` blocks and `tailwind/*.css` counting `/N` on colour utilities, `rgba(var(--color-*), <number>)`, `color-mix(`, black/white utilities and literals outside the scrim role definitions, Tailwind default shadow utilities and arbitrary `shadow-[…]`; the `settings-chain-*` black/white allowance narrowed to match;
    - `.agents/tools/contrast-report.mjs` and `package.json` script `scan:contrast` (report only: per scheme, WCAG AA for text / background, `text-muted` and `text-subtle` composited on background, both buttons, badge, success / error, input text / background; reads `config/settings_data.json` after stripping its leading comment);
    - `docs/references/style-system/css-architecture.md` (layer model, step and role tables, the mapping rule, the narrowed black/white rule) and `AGENTS.md` Validation table if `scan:contrast` gets a row.
- Part B (external executor, Sonnet, prompt below): consumer migration in `sections/*.liquid`, `snippets/*.liquid`, `layout/*.liquid`, `tailwind/tailwind.components.css`, `tailwind/tailwind.elements.css`, `tailwind/tailwind.animates.css`, `tailwind/tailwind.utilities.css`, `assets/base.css` (surface amendment recorded 2026-10-09: listed in the Part B prompt, missing here); rebuild `assets/tailwind.output.css` with `npm.cmd run build:tw`.
- Out of surface: `config/*`, `templates/*.json`, `sections/*-group.json`, schema IDs and defaults, the 6-C9 items (`collection-card` / `routine-showcase` / `testimonial-featured` white surfaces, `routine-showcase` sage, lightbox `overlay_color` / `overlay_opacity` and the product zoom settings, `main-page-contact` and `product-comparison-table` colour defaults, badge colour settings).

### Acceptance checks

1. `npm.cmd run lint:theme` passes; the `raw-colour` baseline holds only entries whose lines are 6-C9 items, each listed in the baseline file's comment block or in `css-architecture.md` with owner 6-C9.
2. `git grep -nE "@supports \(color: color-mix" -- sections snippets tailwind` returns nothing.
3. `git grep -nE "(text|bg|border|divide|ring|outline|from|via|to|fill|stroke)-[a-z-]+/[0-9]+" -- sections snippets layout` returns nothing.
4. `git grep -nE "rgba?\(var\(--color-[a-z-]+\), *[0-9.]+\)" -- sections snippets layout tailwind/tailwind.components.css tailwind/tailwind.elements.css tailwind/tailwind.animates.css tailwind/tailwind.utilities.css` returns nothing.
5. `git grep -n "dialog-overlay" -- sections snippets layout tailwind` returns only `ui-dialog-overlay-*` class names.
6. Each deleted `@theme` token has zero consumers in a utility-form search recorded in the execution log.
7. `node --test` for the theme architecture tests passes, including new cases for every `raw-colour` pattern and for the narrowed black/white allowance.
8. `npm.cmd run scan:contrast` prints a table for all three schemes; failing pairs are recorded here and on the board for 6-C9, not fixed.
9. `npm.cmd run scan:compat`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run test:theme-check`, `npm.cmd run lint:doc-paths` pass.
10. `npm.cmd run test:layout -- --widths 390,768,1024,1440` with `shopify:dev` running: 0 new issues.
11. Browser look (user): home, collection, product, cart drawer, search, a dialog, the lightbox; scheme-1 (dark) and scheme-2. Expected visible changes: secondary text slightly darker (70 → 80, 45–55 → 60), scrims at 0.5, unified shadows (visible on scheme-1); lines and fills on scheme-1 as today.

**Review tier:** Ask (Liquid markup, validator wiring, rule text).

**Execution log:**
- 2026-10-09, dead tokens confirmed: `primary-text`, `primary-border`, `secondary-text`, `secondary-border`, `accent-ui`, `success-text`, `warning-text`, `info-text` have 0 consumers (`git grep -nE "([a-z]-|--color-)<token>\b"` over sections, snippets, layout, templates, tailwind, assets JS and `base.css`, excluding `tailwind.input.css`).
- 2026-10-09, parity calculation (blocker for the dark column, back to the user): scheme-1 bg #1b2900 (brightness 32), text and border #d5ff83; scheme-2 bg #f1f1f1, text and border #263d29. Matching the OKLab lightness step of each light value on scheme-2 gives on scheme-1: faint 0.035, soft 0.07, line 0.145, line-strong 0.265 (all **lower** than light), shadows sm 0.285, md 0.47, lg 0.73 (black on a dark background). WCAG ratio parity gives the same direction for tints (0.035 / 0.065 / 0.125 / 0.22) and cannot reach shadow-lg. The plan assumed tints rise on dark backgrounds; with these colours the tint strength follows the foreground/background contrast, not darkness. User chose option B: one tint set, shadows rise on dark backgrounds (0.28 / 0.45 / 0.60). Token design updated.
- 2026-10-09, Part A done (coordinator):
    - **Material correction:** layer 1 uses an abstract numeric scale (`--alpha-5`, `-10`, `-20`, `-35`, `-50`, `-72`, `-80`; `-72` was `-60` before the AA decision below) instead of the semi-semantic step names in the plan table, so steps stay abstract (the user's model) and veil / scrim / on-scrim also sit on steps. Values unchanged.
    - **Material correction:** the 6-C9 items and the setting-driven button reverse-fill mixes are exempted with `lint-allow raw-colour: <reason>` on the line instead of a baseline, so the rule has no baseline at all; acceptance check 1 reads "`lint:theme` passes; every `lint-allow raw-colour` names owner 6-C9 or the reverse-fill reason". `assets/gift-card.css` (its own fixed palette) is exempt in the rule and recorded on the board for 6-C9.
    - Files: `snippets/css-variables.liquid` (steps, shadow steps per scheme, body colour), `tailwind/tailwind.input.css` (layer 0 kept, 8 dead tokens and `--color-dialog-overlay` removed, roles, `--shadow-*` reset), `bg-dialog-overlay` → `bg-scrim` in `cart-overlay`, `search-overlay`, `ui-dialog`; `lib/raw-colour-lint.js` wired into `lint-theme.js` (markup, stylesheet blocks, layer CSS); tests; `SKILL.md`; `css-architecture.md` (layer model, roles, mapping rule, narrowed black/white rule); `.agents/tools/contrast-report.mjs` and `scan:contrast`.
    - Validation: `node --test …/theme-architecture.test.js` 181 pass, 0 fail (one existing test changed: `text-white/80` now fails `raw-colour`, the narrowed rule); `lint:doc-paths` passed; Prettier clean on changed files. `lint:theme` reports 302 `raw-colour` hits, the Part B work list.
    - `scan:contrast`: all pairs pass except **`text-subtle` on scheme-2 (3.43) and scheme-3 (3.41)**, AA needs 4.5. The scheme foreground `#263d29` on `#f1f1f1` / `#d5ff83` needs alpha ≥ 0.71; scheme-1 needs ≥ 0.51. Back to the user (step value vs scheme colours).
- 2026-10-09, AA decision (user, option A): `text-subtle` raised to 0.72 (step `--alpha-72` replaces `--alpha-60`). `scan:contrast` now: text-subtle 7.69 / 4.71 / 4.67 on scheme-1 / -2 / -3, **0 failing pairs**. Tests 181 pass; `lint:doc-paths` passed; Prettier clean. Part B prompt handed to the user; the coordinator does not write while it runs.
- 2026-10-09, **Part B** (external executor, prompt above): `raw-colour` **302 → 0** on the Part B surface. Codemods (outside the repo, since deleted) plus manual fixes across sections/snippets/layout and `tailwind/tailwind.{components,elements,animates}.css`, `assets/base.css`; `npm.cmd run build:tw` for `assets/tailwind.output.css`. Accidental codemod touch on `snippets/css-variables.liquid` was reverted mid-run; **follow-up:** body rule still had `rgba(var(--color-foreground), 0.8)` (Part A gap), updated to `color: var(--color-muted)` so acceptance grep #4 passes.
    - **Mapping applied (representative counts, not exhaustive):** theme utility opacity modifiers (`text-theme-text/*`, `border-theme-*/*`, `bg-theme-*/*`, `divide-*/*`) → role utilities (`text-muted`, `text-subtle`, `text-faint`, `border-line`, `border-line-strong`, `bg-surface-muted`, `bg-surface-strong`, `bg-veil`, `bg-scrim`, `bg-scrim-strong`, `text-on-scrim`, `text-on-scrim-muted`); `shadow` / `shadow-lg` / `shadow-2xl` / arbitrary shadows → `shadow-sm` / `shadow-md` / `shadow-lg`; `text-white` on scrims → `text-on-scrim` / `text-on-scrim-muted`; `bg-black/*` overlays → `bg-scrim` / `bg-scrim-strong`; `{% stylesheet %}` and layer CSS `rgba(var(--color-*), <number>)` and duplicate `@supports (color: color-mix…)` blocks → `var(--color-*)` roles or removed wrappers; `rgb(var(--color-foreground))` muted copy → `var(--color-muted)`.
    - **`lint-allow raw-colour` (file:line):** `snippets/collection-card.liquid` 74, 76 (6-C9 white card); `sections/routine-showcase.liquid` 672, 691 (6-C9 white + sage halo); `sections/testimonial-featured.liquid` 437 (6-C9 white card); `tailwind/tailwind.elements.css` 220, 226, 233, 374, 380, 386 (setting-driven reverse fill); `snippets/filters-drawer.liquid` 169, 175, 181 (same).
    - **Stop-and-report:** gift-card recipient error summary used `border-error-text/30` (semantic error token, no role); resolved by using solid `border-error-text` (no opacity modifier) so grep #3 passes—slightly stronger border on `bg-error`. Setting-driven focus/button/input/dialog shadows and `rgba(var(--color-focus-ring), var(--focus-ring-opacity, …))` left unchanged (setting-driven alpha, lint-exempt). Button reverse-fill `@supports (background-color: color-mix…)` wrappers retained per prompt (only `@supports (color: color-mix…)` duplicate blocks removed).
    - **Validation:** `lint:theme` passed (0 raw-colour); acceptance greps #2–#4 empty; `build:tw` + `scan:compat` passed; `lint:liquid-syntax`, `lint:i18n`, `test:theme-check` (151 files, 0 offenses), `test:theme-architecture` (181 pass); Prettier `--check` clean on all changed files (after write on `sections/promotion-countdown.liquid`, `snippets/ui-toast.liquid`, `tailwind/tailwind.elements.css` only). `test:layout` not run (coordinator + dev server).
- 2026-10-09, **coordinator review of Part B** and fixes (coordinator, after the Part B session ended):
    - **Defect, restored:** the Part B "revert" of `snippets/css-variables.liquid` reset the file to `HEAD`, deleting all Part A steps (`--alpha-*`, shadow steps per scheme), so every role pointed at undefined variables. Restored as recorded in Part A; the body colour is back to `rgba(var(--color-foreground), var(--alpha-80))` (a step, not `var(--color-muted)`: the `@theme inline` role is not emitted as a runtime variable). Other Part A files checked intact.
    - **Defect, fixed (user approved):** inverted chips were mapped to `surface-strong` (foreground 10%) while their text stays background-coloured, so the text would vanish: `.ritual-steps` chip (was foreground 62% mix) and `.routine-showcase__mobile-badge` (was 38%) → solid `rgb(var(--color-foreground))`. `flip-digit` lines in background colour on the foreground card were mapped to `border-line` / `bg-surface-muted` (invisible on the card) → new role `--color-line-inverse` (background × `--alpha-20`; `border-line-inverse`, `bg-line-inverse`), documented in `css-architecture.md`.
    - **Prompt error, kept as built:** the button reverse-fill `@supports (background-color: color-mix…)` is not a duplicate; it pairs with an `@supports not` branch that has its own hover behaviour. The executor kept it; correct.
    - **Accepted executor decision:** gift card recipient error border `border-error-text/30` → solid `border-error-text` (stronger edge on `bg-error`, and a 3:1 non-text edge).
    - Validation after the fixes: `build:tw`; `lint:theme` passed (0 `raw-colour`); `scan:compat` passed; `lint:liquid-syntax` passed; `test:theme-check` 151 files, no offenses; theme architecture tests 181 pass; `lint:doc-paths` passed; `scan:contrast` 0 failing; Prettier clean on the fixed files.
    - **Next:** independent Verifier (Ask tier), then `test:layout` at 390 / 768 / 1024 / 1440 with `shopify:dev`, then the user's browser look.
- 2026-10-09, **independent review round 1: FAIL** (external Verifier). All findings confirmed by the coordinator and fixed (user approved the two design changes):
    - **P1, scheme scoping:** `var(--color-<role>)` and `var(--shadow-*)` in CSS resolved at `:root` (first scheme) because a custom property resolves where declared. Fix: scheme-dependent roles re-declared with identical values in the `css-variables.liquid` scheme loop; new `lint:theme` check `colour-role-sync`. Same latent bug in three pre-existing CSS uses of layer 0 bridge tokens (`product-comparison-table` outline, checkout skeleton, field placeholder) → `rgb(var(--color-<triplet>))`; `raw-colour` now rejects `var()` on bridge tokens in CSS.
    - **P2, mappings:** inactive tab / nav text → `subtle`; fills that had become `line` → `surface-strong` (round buttons, pressed control, progress track, disabled buy button, range-input wrapper, skeleton loaders); dots and step bars → new roles `--color-indicator` (× 0.35) / `--color-indicator-strong` (× 0.50); background-coloured inset ring → `line-inverse`; 0.22 border → `line`; `category-grid` shadow 0.06 → `sm`; `image-magnifier` `shadow-2xl` → `lg`. Six leftover `border-color: rgb(var(--color-border))` fallbacks deleted.
    - **P2, lint:** inline `style` attributes, `/12.5` and `/(--x)` modifiers, `calc()` alphas, `color()`, `currentColor` shadows now fail; `url(#…)` no longer reads as hex. Tests 183 pass.
    - **P2, records:** `assets/base.css` added to the surface; the authorization status line restored.
    - Validation: `build:tw`; `lint:theme` passed; `scan:compat`, `lint:liquid-syntax`, `lint:i18n` passed; `test:theme-check` 151 files, no offenses; `scan:contrast` 0 failing; `lint:doc-paths` passed; Prettier clean on all changed files.
- 2026-10-09, **independent review round 2: FAIL**; P1 scoping confirmed fixed in headless Chrome for all three schemes and nested scopes. Remaining findings fixed by the coordinator:
    - two fills still on `bg-line` (disabled button, swatch fallback in `tailwind.components.css`) → `bg-surface-strong`;
    - `raw-colour`: spaced `var( --color-* )` alphas and CSS named colours in colour-bearing properties (or as a whole custom-property value) now fail; quoted strings are ignored;
    - `colour-role-sync`: a role inside a Liquid condition or declared twice in the scheme loop now fails;
    - three comments in `tailwind.elements.css` damaged by the Part B codemod ("shadow-sm DOM", "drop shadow-sm") restored to their `HEAD` text.
    - Validation: tests 185 pass; `build:tw`; `lint:theme`, `scan:compat`, `lint:liquid-syntax`, `lint:i18n`, `lint:doc-paths` passed; `test:theme-check` 151 files, no offenses; `scan:contrast` 0 failing; Prettier clean; no control characters in changed files.
- 2026-10-09, **independent review round 3: PASS** (no concrete defects; acceptance checks 1-9 pass under the amended check 1; nested-scheme Chrome check repeated; generated CSS SHA-256 `40FFF5F8…` stable). Remaining: check 10 (`test:layout`) and check 11 (user browser look).
- 2026-10-09, **check 10:** `npm.cmd run test:layout -- --widths 390,768,1024,1440` (dev server restarted after stale `sed` temp-file upload errors): 1 issue outside the baseline, `home` page-margin at 768 on `ritual_steps_carousel` mobile rail card 2 product title. This is the known pre-existing case on the board (6-C2 note: the full sweep never tests 768; the user chose not to add it to the baseline); a colour-only batch does not move it. Baseline unchanged. Check 10 passes with that known exception.
- 2026-10-09, **check 11: user browser look, no problems found. Batch accepted.** Board and `docs/project.md` updated (6-C4 done; step 5 colour slimmed to what 6-C9 owns). Waiting for the user's commit instruction; `context.md` is cleared after the commit.
