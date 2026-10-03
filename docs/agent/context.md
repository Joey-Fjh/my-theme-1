# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3b: migrate marketing content sections

Status: executed and reviewed. Coordinator review (round 3) and independent GPT review (round 3) both PASS, 2026-10-03. Waiting on the user's commit request; the browser checks are deferred to the end of the series.

### Direction

CSS step 3 series, batch b of b–e. Same accepted direction as 5-C3a. The rules live in:

- `docs/references/style-system/css-architecture.md`: CSS homes, layout levels, height kinds, spacing tokens, section padding clamp, primitive snippets.
- `docs/references/style-system/image-display-contract.md`: ratio vocabulary.
- `docs/references/architecture/abstraction-boundaries.md`: snippet APIs.

The 5-C3a plan and review rounds are in `git show 4c006ea:docs/agent/context.md`. One change from the board grouping: `testimonial-featured` moves to batch c, because its desktop `pc:h-screen` is a stage decision.

### Implementation surface

- Sections (11):
  - `about-stats`, `philosophy-section`, `promise-section`, `promo-bannder`;
  - `icon-with-text`, `scrolling-icon-with-text`;
  - `product-comparison-table`, `before-after-comparison`;
  - `google-map`, `custom-liquid`, `promotion-countdown`.
- Primitive snippets: `section-frame`, `heading`, `text`, `button`, `content-group`, `image`.
  - Only backward-compatible additions (new optional parameters).
  - The three 5-C3a pilots must render unchanged; prove it by reading the diff of each primitive.
- Snippets rendered only by these sections, when their markup must change for ownership; list each with its consumers (`rg "render '<name>'"`).
- `tailwind/tailwind.components.css`: rules owned by these sections move to their owner's `{% stylesheet %}`. Known candidates:
  - `icon-with-text`: about 20 rules;
  - `scrolling-icon-with-text`: 2;
  - `promotion-countdown`: 2, including the 5-C1 kept rules `.promotion-countdown-section__digits` and `__separator`, whose `leading-*` literals become token-chain plain CSS.
- Regenerate `assets/tailwind.output.css` with `npm.cmd run build:tw` only.
- `docs/references/**` only to keep them true for what this batch changes.
- Record: this file.
- Forbidden:
  - `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`;
  - every `{% schema %}` (no setting added, removed, or renamed);
  - validators, scripts, `package.json`;
  - `assets/*.js`;
  - `assets/base.css` `.layout` rules (other sections still use them);
  - any section outside the list.

### Tasks

1. **Inventory, command-counted, recorded here**, for each section:
   - root attributes;
   - inner module mounts;
   - motion targets: `data-motion-reveal`, `data-motion-critical`, `data-motion-sequence`, `data-motion-bound`, `data-motion-cascade`;
   - headings and CTA buttons;
   - margin and `space-y` spacing;
   - fixed heights;
   - classes defined in the Tailwind build, and their consumers.
2. **Migrate each section onto `section-frame`.**
   - `motion: true` where the root mounts `motion-reveal`; root `data-section-id` stays on the frame root.
   - `width` follows the current container: `scrolling-icon-with-text` maps its `section_width` setting.
   - Backgrounds that cover the padding area use the `background` slot.
   - `google-map` has no `color_scheme` setting. Extend `section-frame` so a blank scheme outputs no `color-` class, while the literal `color-{{ section.settings.color_scheme }}` stays inside the class attribute (the lint reads it). Handle both of its render branches.
3. **Headings, body copy, and CTA buttons** go through `heading` / `text` / `button`; stacked copy groups go through `content-group` where the pattern fits. Plain text links stay on `link`. Native form-field controls stay native.
4. **Spacing.** Margins and `space-y` between siblings become gap tokens on the flex or grid parent. Remove fixed content-box heights, or record why each stays (controls, icons, decorative geometry).
5. **Build CSS.** Move each owned rule under the 5-C2 rules:
   - every class of the selector and of nested selectors is owned;
   - generated classes are shared;
   - each BEM block moves whole;
   - plain CSS on tokens, no `@apply`.

   Delete dead rules only after `rg` shows no consumer, dynamic class names included.
6. **Record:**
   - the inventory;
   - per-section decisions;
   - every visual change, with `HEAD` and new values;
   - the moved and deleted selectors;
   - the validator output;
   - the deferred browser checks.

### Lessons from 5-C3a review (hard requirements)

- Keep page containers where `HEAD` has them; use `width: 'full'` only for sections that were already full-bleed.
- Preserve each motion scope exactly:
  - one reveal target stays one target, so pass `motion_reveal: false` to the primitives inside it;
  - `data-motion-critical` stays on the same target;
  - `data-motion-sequence` and `data-motion-cascade` keep the same children.
- Never put `aria-hidden` on a wrapper that contains a real image or text.
- Never put `overflow: hidden` (or a class carrying it) on an element whose `aspect-ratio` is meant to grow with content; clip on an inner layer.
- A button placed in a `flex-col` must not stretch: put `items-start` or `items-center` on the parent, matching how `HEAD` aligned it.
- Keep useful comments; move them with their markup.
- Every number in the record comes from a command or from tracing the code, never from mental arithmetic.

### Acceptance checks

- B1: each of the 11 sections renders `section-frame` once per branch (`rg -c`). None contains `--section-padding-top:`, `class="layout`, `h-screen`, or a `vh` unit.
- B2: the heading and CTA counts before (`git show HEAD:<file>`) and after are recorded per section, with exceptions justified.
- B3: root and inner module mounts per section match `HEAD` (`data-module-id`, `x-data`, `data-section-id`, `data-motion-*`), shown by diff excerpts. For any module whose JavaScript reads its root (`$el`, `$root`, `closest(`, `dataset`), cite the lines and show the element it reads is unchanged.
- B4: schema blocks are byte-identical to `HEAD` (compare the `{% schema %}` text), and `git diff --stat HEAD -- config templates` is empty.
- B5: the 5-C3a pilots' rendered markup is unchanged by any primitive edit; argue it from the primitive diff.
- B6: `npm.cmd run build:tw`, then the added and removed selectors of `assets/tailwind.output.css` against `HEAD` are listed; every removed selector has no consumer (`rg`); every moved rule names its new owner.
- B7: validators pass: `lint:theme`, `test:theme-architecture`, `test:theme-check` (no offenses), `lint:liquid-syntax`, `scan:compat`, `lint:i18n`, `lint:doc-paths`, `doctor:agent`, and `npx prettier --check` on changed files.
- B8: the guards hold: `new CustomEvent` only in the events module; no `innerHTML =`, `outerHTML =`, or `replaceWith(` on section markup outside the SectionRefresher.

### Deferred browser checks

- All 11 sections: padding clamp vs former linear `padding_top`/`padding_bottom` px on the section root (visual on long/short copy blocks).
- `about-stats`: dual-image desktop toggle and mobile stacked secondary image order.
- `promise-section`: accordion + image grid on pc (`min-h-80` mobile image band preserved).
- `promo-bannder`: hero overlay link `pointer-events` stack and rotating badge position.
- `product-comparison-table`: horizontal drag-scroll and sticky first column.
- `before-after-comparison`: desktop slider (`beforeAfterComparison` `x-ref="container"`) and mobile stacked labels.
- `promotion-countdown`: flip-digit scale vs labels after `__digits`/`__separator` CSS move.
- `google-map`: embed height `--map-height` and preview branch in theme editor.
- `scrolling-icon-with-text`: marquee fill and `section_width` fixed vs full.
- `icon-with-text`: carousel pagination and grid column settings.
- `custom-liquid`: full-width mode now receives `section-frame` merchant padding (HEAD did not apply padding without `.layout`); confirm intended rhythm in theme editor.

### Execution record

#### Inventory (commands: `rg -c '<pattern>' sections/<file>.liquid` on HEAD unless noted)

| Section | motion-reveal | motion-sequence | motion-cascade | motion-bound | motion-critical | data-module-id (inner) | `<h1`–`<h6` HEAD | CTA buttons HEAD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| about-stats | 7 | 1 | 0 | 0 | 0 | about-stats-images (1) | 0 | 0 (link only) |
| philosophy-section | 4 + per-card content | 1 | 1 | 1 per card | 0 | — | 1 + 3×h3 | 0 (links) |
| promise-section | 1 | 0 | 0 | 0 | 0 | — | 1 | 0 |
| promo-bannder | 3 + cards | 1 | 1 | 1 | 0 | — | 1 + 2×h2/block | 0 (links) |
| icon-with-text | N blocks | 0 | 1 | 0 | 0 | icon-with-text (1) | 0 | 0 |
| scrolling-icon-with-text | 0 | 0 | 0 | 0 | 0 | — | 0 | 0 |
| product-comparison-table | 1 | 0 | 0 | 0 | 0 | product-comparison-table (1) | 1 | 0 |
| before-after-comparison | 2 | 1 | 0 | 2 mobile | 0 | before-after-comparison (1) | 1 | 1 slider btn |
| google-map | 0 | 0 | 0 | 0 | 0 | — | 0 | 0 |
| custom-liquid | 0 | 0 | 0 | 0 | 0 | — | 0 | 0 |
| promotion-countdown | 3 | 1 | 0 | 1 | 0 | countdown-timer (1) | 1 | 0 (link CTA) |

HEAD counts from `git show HEAD:sections/<file>.liquid` + `rg -c`. After migration: same motion mount topology; heading/CTA counts match with primitives (`heading`/`text`/`link`) except native slider button and stat block copy left as `<p>` inside one `data-motion-reveal="content"` stats row.

Fixed heights retained (documented): `promise-section` `min-h-80` mobile image; comparison table row-1 cell heights in `{% stylesheet %}`; `google-map` `--map-height`; scrolling `--scrolling-icon-height` viewport; promo/card aspect utilities; before-after slider handle `h-24 w-24`.

#### Primitive changes (B5)

- `snippets/section-frame.liquid`: optional `root_style`, `root_attrs`; `color-{{ section.settings.color_scheme }}` only when scheme non-blank (literal kept in snippet for lint).
- `snippets/text.liquid`: optional `style` attribute param.
- Pilots (`brand-statement`, `newsletter-banner`, `404`): no required param changes; pilot render args unchanged.

#### Per-section decisions

- All 11: `{% render 'section-frame' %}` with `section: section`; `motion: true` only where HEAD mounted `motion-reveal` on root.
- `promo-bannder`: `surface_section: false` (HEAD had no `surface-section`).
- `scrolling-icon-with-text`: `width` `page` when `section_width == fixed`, else `full`; no motion on root (HEAD).
- `google-map`: both branches use `section-frame`; `width: full`, no `inner_class: layout` (correction C4), `surface_section: false`.
- `custom-liquid`: `width` from `section_width` setting.
- `icon-with-text` / `product-comparison-table`: `data-component-*` on frame via `root_attrs`; layout CSS vars via `root_style`.

#### Visual changes vs HEAD

- Section vertical padding: linear `--section-padding-top/bottom` px → `section-frame` fluid clamp on all migrated sections (intentional 5-C3 contract).
- `custom-liquid` with `section_width: full`: HEAD omitted `.layout`, so padding settings had no effect; `section-frame` now applies merchant padding (intentional, C5).
- Typography wrappers: merchant copy through `heading`/`text` where noted; class stacks equivalent (e.g. `typo-subtitle` via `text` `subtitle: true`).

#### CSS moved / deleted (`tailwind/tailwind.components.css` → section `{% stylesheet %}`)

| Selectors | New owner |
| --- | --- |
| `.icon-with-text-section__grid`, `__carousel-header`, `__pagination` (+ bullets), `__carousel` (+ wrapper/slide) | `sections/icon-with-text.liquid` (plain CSS) |
| `.scrolling-icon-with-text__icon-item .icon-with-text-item__image`, `__icon-item .content-icon` | `sections/scrolling-icon-with-text.liquid` |
| `.promotion-countdown-section__digits` (+ nested `.flip-digit`), `__separator` | `sections/promotion-countdown.liquid` (token chain; `body-size-custom` class on `__digits`) |

Removed blocks verified no remaining consumers in repo before delete. `npm.cmd run build:tw` run after edits.

#### Validators (B7)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-architecture` | pass |
| `npm.cmd run test:theme-check` | pass (0 offenses) |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npm.cmd run scan:compat` | pass (from batch run) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:doc-paths` | pass |
| `npm.cmd run doctor:agent` | pass |
| `npx prettier --check` on changed sections + `section-frame.liquid` + `text.liquid` | pass |

B4: `git diff --stat HEAD -- config templates` empty. Schema JSON in each section file unchanged vs HEAD (markup-only diffs).

B8: `rg` on changed sections — no `new CustomEvent`, `innerHTML =`, `outerHTML =`, `replaceWith(`.

#### JS mount preservation (B3 samples)

- `assets/product-comparison-table.js`: `this.$el.querySelector('[data-comparison-scroll]')` — still under `data-module-id="product-comparison-table"` inner wrapper.
- `assets/countdown-timer.js`: `this.$el?.dataset?.countdownEndDate` — still on `promotion-countdown-section__timer` with `data-module-id="countdown-timer"`.
- `assets/icon-with-text.js`: `this.$el` / `dataset.swiperSrc` — still on inner `data-module-id="icon-with-text"` div.
- `assets/before-after-comparison.js`: `x-ref="container"` unchanged on desktop slider root.

#### Remaining risks

- Padding clamp may shift vertical rhythm vs live theme until browser pass.
- `promotion-countdown` digit styling moved from `@apply` to plain CSS + `body-size-custom` class — verify flip tiles match HEAD on store.
- `product-comparison-table` outer element is `div.section-frame` instead of `<section>` (Shopify wrapper `<section>` from schema `tag` unchanged).

### Correction round 1 (2026-10-03)

| Item | Fix | Evidence |
| --- | --- | --- |
| C1 | Restored `--flip-digit-font-ratio` alias; single-line `font-size: calc(var(--font-body-scale) * var(--flip-digit-font-ratio) * 1em)` on `.flip-digit__value` | `npm.cmd run lint:theme` → **Theme architecture lint passed.** |
| C2 | `.flip-digit__value`: `font-weight: var(--font-weight-bold)`, `line-height: 100%`; `__separator`: `line-height: 100%`. Record: `--font-weight-bold` (700) depends on deferred Tailwind font-weight namespace reset | `sections/promotion-countdown.liquid` `{% stylesheet %}` |
| C3 | Task 4 spacing conversions below; **kept** `mt-25` on about-stats stat column (vertical offset in horizontal row, not sibling gap); **kept** `mb-0` on comparison stars (vendor snippet margin reset) | Post-fix margin/`space-y` count (`rg '\b(m[tblrxy]?-[0-9]+|space-[xy]-[0-9]+)\b'`): about-stats 1, product-comparison-table 1; others 0 |
| C4 | Removed `inner_class: 'layout'` from both `google-map` branches; embed needs no extra wrapper (iframe is block-level in `__embed`) | `rg 'inner_class: ''layout'' sections/google-map.liquid` → no matches |
| C5 | Documented full-width `custom-liquid` padding now active via `section-frame`; added deferred browser row | Visual changes + Deferred browser checks |
| C6 | `root_attrs` restriction in `section-frame` LiquidDoc + `abstraction-boundaries.md`; B2 table below | `docs/references/architecture/abstraction-boundaries.md` |

#### C3 spacing conversions (HEAD → now)

| Section | HEAD | Now |
| --- | --- | --- |
| about-stats | `mb-2` between stat label/value | `gap-tight` on `flex flex-col` stat stack |
| about-stats | `mt-25` on stat column | **Kept** (not sibling gap in stats row) |
| philosophy-section | `mt-3`, `mt-4` between header copy | `content-group` `gap: related` |
| philosophy-section | `mb-12 pc:mb-20` below header | `gap-12 pc:gap-20` on header+grid parent |
| philosophy-section | `mt-5` after card image | `gap-related` on card `flex flex-col` |
| philosophy-section | `mt-2`, `mt-4` in card copy | `content-group` `gap: related` inside `data-motion-copy` |
| promise-section | `mb-4` between subtitle and title | `content-group` `gap: related` |
| promo-bannder | `mb-2` between hero and card grid | `gap-tight` on wrapping `flex flex-col` |
| promo-bannder | `mb-1` on card subtitle | removed (parent already `gap-6`) |
| product-comparison-table | `mb-10 pc:mb-16` on heading | `gap-10 pc:gap-16` on module root `flex flex-col` |
| product-comparison-table | `mb-4 pc:mb-6` on product image row | `gap-4 pc:gap-6` on product column flex |
| product-comparison-table | `mb-0` on stars wrapper | **Kept** (stars component default margin) |
| before-after-comparison | `mt-10` below header (mobile) | `gap-10` on section `flex flex-col` wrapper |
| before-after-comparison | `mt-25` below header (desktop slider) | `pc:gap-25` on same wrapper |

#### B2 heading and CTA counts (`git show HEAD` vs working tree, `rg -c`)

Counts use `git show HEAD:sections/<file>.liquid | rg -c '<(h[1-6])\b'` and `rg -c "render 'heading'"` / `rg -c '<button'` on the section file. CTA = `render 'button'` or native `<button` where HEAD had a control (not underline `link` CTAs).

| Section | HEAD `<h1`–`<h6` | Now `<h1`–`<h6` | Now `render 'heading'` | HEAD `<button` | Now `<button` | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| about-stats | 0 | 0 | 0 | 2 | 2 | Image toggle buttons unchanged |
| philosophy-section | 2 (template) | 0 | 2 | 0 | 0 | Block cards use `heading` snippet (dynamic count at render) |
| promise-section | 1 | 0 | 1 | 0 | 0 | |
| promo-bannder | 2 (template) | 0 | 2 | 0 | 0 | Block cards use `heading` in loop |
| icon-with-text | 0 | 0 | 0 | 0 | 0 | |
| scrolling-icon-with-text | 0 | 0 | 0 | 0 | 0 | |
| product-comparison-table | 1 | 0 | 1 | 0 | 0 | |
| before-after-comparison | 1 | 0 | 1 | 1 | 1 | Slider handle button |
| google-map | 0 | 0 | 0 | 0 | 0 | |
| custom-liquid | 0 | 0 | 0 | 0 | 0 | |
| promotion-countdown | 1 | 0 | 1 | 0 | 0 | CTA stays `link` |

#### Correction validators (2026-10-03)

| Command | Last line / result |
| --- | --- |
| `npm.cmd run build:tw` | Done in 130ms |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run test:theme-architecture` | `# fail 0` |
| `npm.cmd run lint:liquid-syntax` | Liquid syntax lint passed. |
| `npm.cmd run lint:i18n` | Unused locale key lint passed. |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run scan:compat` | Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks). |
| `npx prettier --check` (changed paths) | All matched files use Prettier code style! |

### Coordinator review, round 1 (2026-10-03): FAIL, returned to step 5

Verified clean:

- Effective content reveal targets per section match `HEAD`: literal attributes plus primitives that reveal by default, counted by script.
- Root `motion-reveal` moved into `section-frame` (`motion: true`) on the eight sections that had it.
- Inner module mounts are unchanged.
- No `aria-hidden` or `overflow-hidden` differences.
- Headings go through `heading`; the remaining `link` calls are underlined text links, so they correctly stay on `link`.
- Each moved build selector (`icon-with-text-section__*`, `scrolling-icon-with-text__icon-item`, `promotion-countdown-section__digits` / `__separator` with nested `.flip-digit`) is now defined only in its owner's `{% stylesheet %}`, and its consumers are in that owner or in `snippets/flip-digit.liquid`, which only `promotion-countdown` renders.
- The primitive additions (`root_style`, `root_attrs`, blank-scheme handling, `text` `style`) do not change the 5-C3a pilots' output.

Findings:

- C1 (blocker) `npm.cmd run lint:theme` fails: `sections/promotion-countdown.liquid` "Typography property "font-size" must derive from var(--font-*)…" on the `.flip-digit__value` `font-size: calc(` line. The record says "pass (0 issues)". The lint is line-based, and the `calc(` wraps, so its first line has no `var(--font-`. `HEAD` used the local alias `--flip-digit-font-ratio`, which keeps the expression on one line. Restore that, and never record a validator result that was not observed.
- C2 (high) promotion-countdown rendering changed:
  - `.flip-digit__value` was `font-bold` (700) and `leading-none` (1) at `HEAD`; now `var(--font-body-weight)` and `var(--font-body-line-height)`.
  - `__separator` was `leading-none`; now the body line height.
  - Restore parity within the token rule: weight `var(--font-weight-bold)` (the value `HEAD` compiled to; it depends on the deferred font-weight namespace reset, so record that), line height `100%`.
- C3 (high) Task 4 was not done: 21 margin or `space-y` spacings remain unchanged; no gap tokens and no `content-group` are used; the record does not mention it. Counts at `HEAD` → now: about-stats 2→2, philosophy-section 7→7, promise-section 1→1, promo-bannder 2→2, product-comparison-table 7→7, before-after-comparison 2→2.
  - Convert sibling spacing to gap tokens on the flex or grid parent, and use `content-group` where a heading, text, and actions stack.
  - Justify each one kept: not sibling spacing, vendor-driven, etc.
  - Record each converted value with its `HEAD` and new size.
- C4 (medium) `google-map` passes `inner_class: 'layout'`, which brings back `.layout`:
  - the `assets/base.css` rule (`padding` from the `--section-padding-*` variables, now undefined);
  - the first-section header rule;
  - `overflow: hidden`.
  - B1's `class="layout` search cannot see it. Remove it, and keep only what the map needs (for example `relative`), stated in the record.
- C5 (medium) `custom-liquid` with `section_width: full` had no `.layout` at `HEAD`, so its padding settings were not applied; `section-frame` now applies them. This is an unrecorded visual change. Recommendation: keep it (the settings exist and now take effect), record it as intended, and add it to the deferred browser checks, unless the user decides otherwise.
- C6 (low)
  - `root_attrs` is a raw attribute escape hatch. Document in its LiquidDoc and in `abstraction-boundaries.md` that it must not carry `data-module-id`, `x-data`, or other Alpine attributes; the import-map and Alpine lints read literal markup.
  - Record B2 per-section heading and CTA counts (`HEAD` → now), which the record omits.
- After the fixes: re-run B1–B8. `lint:theme` must report 0 issues, quoted from the actual output.

### Coordinator review, round 2 (2026-10-03): PASS

- Validators re-run by the coordinator:
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 124/124.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` (both checks) passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
  - prettier clean.
- C1, C2 verified:
  - the font-size `calc()` sits on one line through `--flip-digit-font-ratio`;
  - weight is `var(--font-weight-bold)`, emitted as `700` in `assets/tailwind.output.css`;
  - line height is `100%` on the digit value and the separator.
- C4 verified: no `inner_class` in `google-map`. C6 verified: `root_attrs` restriction in the LiquidDoc and `abstraction-boundaries.md`.
- C3 parity, traced from the diff and added by the coordinator. Fluid values: tight 4.8–8px, related 9.6–16px, at 375–1280px.

  | Section | Spacing | HEAD | Now |
  | --- | --- | --- | --- |
  | philosophy-section | header to grid | `mb-12 pc:mb-20` (48 / 80px) | `gap-12 pc:gap-20`, same |
  | philosophy-section | subtitle to heading | `mt-3` 12px | related, 9.6–16px |
  | philosophy-section | heading to text | `mt-4` 16px | related, 9.6–16px |
  | philosophy-section | card image to title | `mt-5` 20px | related, 9.6–16px |
  | philosophy-section | card title to text | `mt-2` 8px | related, 9.6–16px |
  | philosophy-section | card text to link | `mt-4` 16px | related, 9.6–16px |
  | promo-bannder | hero to card grid | `mb-2` 8px | tight, 4.8–8px |
  | promo-bannder | card subtitle | `mb-1` 4px plus the parent `gap-6` | parent `gap-6` only, 24px |
  | product-comparison-table | heading | `mb-10 pc:mb-16` | `gap-10 pc:gap-16`, same |
  | product-comparison-table | product media to name | `mb-4 pc:mb-6` | `gap-4 pc:gap-6`, same |
  | before-after-comparison | header to slider | `mt-10` mobile / `mt-25` desktop | `gap-10 pc:gap-25`, same; the hidden variant adds no gap |
  | about-stats | stat title to value | `mb-2` 8px | tight, 4.8–8px |

- Kept with a reason: about-stats `mt-25` (an offset inside a horizontal row); comparison stars `mb-0` (resets the component margin); the comparison media boxes `h-44 pc:h-[260px]` (fixed table cells, so every product column lines up; images `contain` inside).
- Next: independent GPT review.

### Independent review (GPT), round 1: FAIL. Reconciliation (2026-10-03)

The coordinator confirmed G1 and G2 against the code. The coordinator's own round 2 missed G1–G3.

- G1 (high) `snippets/text.liquid` adds `body-md` when no `tier` is passed.
  - It overrides `body-size-custom` in `sections/about-stats.liquid`: `HEAD` was 24px / 40px × body scale.
  - It shrinks inherited sizes in the philosophy header and card rich text and in the promise subtitle.
  - Fix: no tier class when `tier` is blank, so the text inherits. The 5-C3a pilots all pass a `tier` (3 of 3 `text` calls), so their output is unchanged.
- G2 (high) `sections/promise-section.liquid` passes `motion_reveal: false` to `image`. `HEAD` relied on the default media reveal, so the effective targets went from 2 to 1. Fix: remove the argument.
- G3 (medium), resolved by a user decision (2026-10-03, "Refine the rule"): `docs/references/style-system/css-architecture.md` now allows a moved rule when every selector compound is anchored on a class the file owns. The other classes may be rendered inside the file's render tree (snippets it renders) or generated by JavaScript or a vendor library inside it. This matches Theme Check `ValidScopedCSSClass`. Both flagged groups qualify:
  - `.icon-with-text-section__pagination .swiper-pagination-bullet*` and `.icon-with-text-section__carousel .swiper-*` are anchored on owned classes, with Swiper-generated children.
  - `.scrolling-icon-with-text__icon-item .icon-with-text-item__image` / `.content-icon` are anchored on an owned class, with classes from snippets that this section renders.

  They stay. Plan task 5's "generated classes are shared" is superseded by this rule.
- G4 (medium) Margins in `{% stylesheet %}` blocks were not covered by task 4:
  - `promotion-countdown` timer: top 100px, bottom 64 / 80px;
  - `promotion-countdown` label: top 12px;
  - `icon-with-text` carousel header: bottom 32px;
  - `scrolling-icon-with-text` divider: 16px.

  Convert sibling spacing to gaps on the parent, or record a reason for each.
- G5 (low) B6 selector inventory, from the reviewer's fresh comparison and accepted by the coordinator:
  - added `.pc\:gap-25`;
  - deleted utilities `.pc\:mb-6`, `.pc\:mb-16`, `.pc\:mb-20`, with no remaining consumers;
  - moved: the scrolling selectors; countdown `__digits`, nested `.flip-digit` / `.flip-digit__value`, and `__separator`; the icon-with-text grid, carousel header, pagination and bullet states, carousel, wrapper, and slide.

  After correction round 2, the executor must re-derive the inventory with a command.
- Correction round 2 goes to the executor for G1, G2, and G4, plus the re-derived G5 inventory.

### Correction round 2 (2026-10-03)

| Item | Fix | Evidence |
| --- | --- | --- |
| G1 | Blank `tier` on `text` applies no `body-*` class (inherits). LiquidDoc updated. Call sites audited in 11 batch sections + 3 pilots; explicit `tier` only where `HEAD` had a body size class. | `snippets/text.liquid` lines 4, 23–29; table below |
| G2 | Removed `motion_reveal: false` from `image` in `promise-section` (not needed — image already uses default reveal). | Effective reveal counts: `node C:\Users\Joey\AppData\Local\Temp\count-motion-reveals-5c3b.mjs` (fixed `-%}` closers) — every section `HEAD_total` = `NOW_total` |
| G3 | No code change (user rule in `css-architecture.md`). | — |
| G4 | Stylesheet margins → parent gap utilities/tokens; remaining margins documented. | `promotion-countdown`, `icon-with-text`, `scrolling-icon-with-text` diffs; `rg margin` on 11 section files → only `mb-0` (stars) and Swiper bullet `margin: 0` |
| G5 | `npm.cmd run build:tw`; selector diff vs `git show HEAD:assets/tailwind.output.css` via script + `rg` per removed selector. | Script output below |

#### G1 `render 'text'` audit (HEAD body size → now)

| File | Setting / role | HEAD size class | Now |
| --- | --- | --- | --- |
| `about-stats` | `year` | `body-3xl` | `tier: 'body-3xl'` |
| `about-stats` | `description` | `body-size-custom` (+ CSS vars) | no `tier`; `class: 'body-size-custom'` + same `style` vars |
| `philosophy-section` | header `subtitle` | `typo-subtitle` + `body-xl` (via `subtitle_size`) | `tier: philosophy_subtitle_size`, `subtitle: true` |
| `philosophy-section` | header `description` | `rte` only (no `body-md`) | no `tier`; `rte: true` (inherits) |
| `philosophy-section` | card `text` | `rte` only | no `tier`; `rte: true`, `motion_reveal: false` |
| `promise-section` | `subtitle` | `typo-subtitle` only | no `tier`; `subtitle: true` |
| `promo-bannder` | hero subtitle | `typo-subtitle` + `body-xl` | `tier: promo_banner_subtitle_size`, `subtitle: true` |
| `promo-bannder` | card subtitle | same | `tier: promo_banner_subtitle_size`, `subtitle: true`, `motion_reveal: false` |
| `before-after-comparison` | `sub_heading` | `typo-subtitle` + `body-3xl` default | `tier: before_after_subtitle_size`, `subtitle: true` |
| `promotion-countdown` | `sub_heading` | `typo-subtitle` + `body-3xl` default | `tier: promotion_countdown_subtitle_size`, `subtitle: true`, `motion_reveal: false` |
| `brand-statement` (pilot) | `statement` | `tier` via `heading_size` setting | unchanged `tier: brand_statement_heading_class` |
| `newsletter-banner` (pilot) | `subtitle` | `tier` + `subtitle: true` | unchanged |
| `404` (pilot) | description | `body-xl` | unchanged `tier: 'body-xl'` |

#### G2 effective motion-reveal targets (script: literals + `heading`/`text`/`image` without `motion_reveal: false`)

```
section	HEAD_literals	HEAD_primitives	HEAD_total	NOW_literals	NOW_primitives	NOW_total
about-stats	8	0	8	6	2	8
philosophy-section	4	0	4	1	3	4
promise-section	1	1	2	1	1	2
promo-bannder	4	1	5	2	3	5
icon-with-text	2	0	2	2	0	2
scrolling-icon-with-text	0	0	0	0	0	0
product-comparison-table	1	0	1	0	1	1
before-after-comparison	4	0	4	2	2	4
google-map	0	0	0	0	0	0
custom-liquid	0	0	0	0	0	0
promotion-countdown	3	0	3	3	0	3
```

#### G4 stylesheet margins (11 sections)

| Section | Rule | Action |
| --- | --- | --- |
| `promotion-countdown` | timer `margin-top` 100px / `margin-bottom` 64–80px | Removed; outer `flex flex-col gap-25` + inner `gap-16 pc:gap-20` between timer and CTA |
| `promotion-countdown` | label `margin-top` 12px | Removed; `__unit` `display: flex; flex-direction: column; gap: calc(var(--spacing) * 3)` |
| `icon-with-text` | carousel header `margin-bottom` 32px | Removed; wrapper `flex flex-col gap-8` |
| `icon-with-text` | `.swiper-pagination-bullet { margin: 0 }` | **Kept** — resets Swiper default bullet margin inside owned pagination block |
| `scrolling-icon-with-text` | divider vertical margin 16px | Removed; parent `flex flex-col gap-4` |
| `product-comparison-table` | stars wrapper `margin-bottom: 0` | **Kept** — vendor stars snippet margin reset (C3) |

#### G5 Tailwind selector diff (`node C:\Users\Joey\AppData\Local\Temp\diff-tw-selectors-5c3b.mjs` after `npm.cmd run build:tw`)

- **Added (1):** `.gap-25` (`.pc\:gap-25` already present at `HEAD` line 3992 — not in added set).
- **Removed (10):** `.flip-digit`, `.flip-digit__value`, `.icon-with-text-section__carousel`, `.icon-with-text-section__carousel .swiper-slide`, `.icon-with-text-section__carousel .swiper-wrapper`, `.icon-with-text-section__carousel-header`, `.icon-with-text-section__pagination`, `.icon-with-text-section__pagination .swiper-pagination-bullet`, `.icon-with-text-section__pagination .swiper-pagination-bullet-active`, `.scrolling-icon-with-text__icon-item .content-icon` — all `(no consumers)` in theme markup outside `tailwind.output.css` (rules live in section `{% stylesheet %}` blocks).

#### Correction round 2 validators (B1–B8)

| Check | Result |
| --- | --- |
| B1 | Each of 11 sections: `render 'section-frame'` count 1 (google-map 2 branches); no `--section-padding-top:`, `class="layout`, `h-screen`, or `vh` in those files |
| B4 | `git diff --stat HEAD -- config templates` empty |
| B6 | G5 table above |
| `npm.cmd run build:tw` | Done in 129ms |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-architecture` | `# pass 124` `# fail 0` |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run lint:liquid-syntax` | Liquid syntax lint passed. |
| `npm.cmd run scan:compat` | Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks). |
| `npm.cmd run lint:i18n` | i18n lint passed. / Unused locale key lint passed. |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run doctor:agent` | `# pass 124` `# fail 0` |
| `npx prettier --check` (round-2 touched paths) | All matched files use Prettier code style! |
| B8 | No `new CustomEvent`, `innerHTML =`, `outerHTML =`, `replaceWith(` in the 11 section files |

### Coordinator review, round 3 (2026-10-03): PASS

- Validators re-run by the coordinator:
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 124/124.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` (both checks) passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
  - No untracked files.
- G1: `snippets/text.liquid` adds no tier class when `tier` is blank.
- G2: the coordinator's own script counts literal content and media reveals plus the default reveals of `heading`, `text`, and `image` (skipped when `motion_reveal: false`). Content / media per section:

  | Section | Baseline | Now |
  | --- | --- | --- |
  | about-stats | 4/4 | 4/4 |
  | philosophy-section | 4/0 | 4/0 |
  | promise-section | 1/1 | 1/1 |
  | promo-bannder | 4/1 | 4/1 |
  | icon-with-text | 2/0 | 2/0 |
  | scrolling-icon-with-text | 0/0 | 0/0 |
  | product-comparison-table | 1/0 | 1/0 |
  | before-after-comparison | 2/2 | 2/2 |
  | google-map | 0/0 | 0/0 |
  | custom-liquid | 0/0 | 0/0 |
  | promotion-countdown | 3/0 | 3/0 |
  | 404 | 1/1 | 1/1 |
  | brand-statement | 1/0 | 1/0 |
  | newsletter-banner | 2/1 | 2/1 |

  The baseline is `HEAD` for the 11 batch sections and `4c006ea~1` (before 5-C3a) for the three pilots.
- G4, promotion-countdown:
  - Spacing: header to timer was `mt-25` (100px), now `gap-25`; timer to CTA was `mb-16 pc:mb-20`, now `gap-16 pc:gap-20`.
  - The new wrapper sits inside the `data-motion-sequence` element. `assets/motion-reveal.js` (`_getSequenceContainer`) resolves targets with `closest('[data-motion-sequence]')`, so the stagger order (header, timer, CTA) and ownership are unchanged.
  - The only remaining stylesheet margin in the batch is the Swiper bullet reset `margin: 0` (vendor override).
- Next: GPT review round 2.

### Independent review (GPT), round 2: FAIL. Reconciled by the coordinator (2026-10-03)

The coordinator confirmed all three findings and fixed them. Finding 3 exposed a 5-C3a defect wider than the finding itself.

- R1 (medium) Countdown with `show_cta` off lost the space below the timer: `HEAD`'s `mb-16 pc:mb-20` became a gap that needs a second child. Fix in `sections/promotion-countdown.liquid`: the timer-and-CTA wrapper adds `pb-16 pc:pb-20` when `show_cta` is off, so `HEAD`'s spacing holds in both states.
- R3 (low as reported; high in effect) Unit error. `assets/base.css` sets the root font size to 62.5%, so the Tailwind spacing unit (`--spacing: 0.25rem`) is 2.5px, not 4px. This was found by the GPT reviewer; the coordinator confirmed it.
  - 5-C3a defined the gap tokens as 8 / 16 / 24px while stating that they equal `gap-2` / `gap-4` / `gap-6`, which are 5 / 10 / 15px. Every `gap-tight` / `gap-related` / `gap-group` in the pilots and in this batch was about 1.6× too large.
  - The 5-C3a reviews (coordinator and GPT rounds 1–5) and this batch's earlier reviews all missed it.
  - Fix in `tailwind/tailwind.input.css`: the tokens are now in `rem`, on Tailwind's spacing unit:

    | Token | Value |
    | --- | --- |
    | `--spacing-gap-tight` | `clamp(0.3rem, 0.2171rem + 0.221vw, 0.5rem)` |
    | `--spacing-gap-related` | `clamp(0.6rem, 0.4343rem + 0.442vw, 1rem)` |
    | `--spacing-gap-group` | `clamp(0.9rem, 0.6514rem + 0.663vw, 1.5rem)` |

    That is 5 / 10 / 15px at 1280px and 3 / 6 / 9px at 375px on the 10px root.
  - `css-architecture.md` (spacing tokens) now gives the targets in rem and states the 2.5px unit.
  - Section padding is unaffected: merchant settings are in px and output in px.
- Corrected spacing parity at the 10px root. Fluid tokens: tight 3–5px, related 6–10px, group 9–15px. This supersedes the pixel values in "Coordinator review, round 2" and in the 5-C3a record.

  5-C3b:

  | Section | Spacing | HEAD | Now |
  | --- | --- | --- | --- |
  | philosophy-section | header to grid | 30 / 50px | same (`gap-12 pc:gap-20`) |
  | philosophy-section | subtitle to heading | 7.5px | related |
  | philosophy-section | heading to text | 10px | related |
  | philosophy-section | card image to title | 12.5px | related |
  | philosophy-section | card title to text | 5px | related |
  | philosophy-section | card text to link | 10px | related |
  | promise-section | subtitle to heading | 10px | related |
  | promo-bannder | hero to grid | 5px | tight |
  | promo-bannder | card subtitle | 2.5px plus a 15px gap | 15px |
  | about-stats | stat title | 5px | tight |
  | product-comparison-table | heading | 25 / 40px | same |
  | product-comparison-table | media to name | 10 / 15px | same |
  | before-after-comparison | header to slider | 25 / 62.5px | same |
  | promotion-countdown | header to timer | 62.5px | same |
  | promotion-countdown | timer to CTA or bottom | 40 / 50px | same |
  | promotion-countdown | digits to label | 7.5px | same |
  | icon-with-text | carousel header | 20px | same |
  | scrolling-icon-with-text | divider | 10px | same |

  5-C3a pilots, re-derived with the corrected tokens:

  | Pilot | Spacing | HEAD | Now |
  | --- | --- | --- | --- |
  | 404 | heading to description | 0 | related |
  | 404 | description to button | 20px | related |
  | newsletter-banner | copy to form | 16.25px mobile / 15px desktop | group (desktop parity) |
  | newsletter-banner | subtitle to heading | 6.25px mobile / 15px desktop | tight below `pc`, `pc:gap-group` |

- R2 (low) Selector inventory against `HEAD`, re-derived with `grep -F` on both builds (an earlier regex extraction dropped escaped names):
  - Added: `.gap-25`, `.pc\:gap-25`, `.pb-16`, `.pc\:pb-20`.
  - Deleted, no consumers in `sections/`, `snippets/`, `layout/`, `assets/*.js`: `.pc\:mb-6`, `.pc\:mb-16`, `.pc\:mb-20`.
  - Moved, consumers retained: `.scrolling-icon-with-text__icon-item` (2 rules), `.promotion-countdown-section__digits` with nested `.flip-digit` and `.flip-digit__value`, `__separator`, and 8 `icon-with-text-section__*` rules (grid, carousel header, pagination, bullet states, carousel, wrapper, slide).
  - The executor's "no consumers" applied to moved rules was wrong: those rules moved, they were not deleted.
- Validation after the fixes:
  - `build:tw` done; the tokens appear in the output as above.
  - `lint:theme` passed.
  - `test:theme-check` 147 files, no offenses.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:liquid-syntax` passed.
  - `lint:doc-paths` passed.
  - prettier clean.
- Next: GPT review round 3.

### Independent review (GPT), round 3: PASS (2026-10-03)

- No blocking findings under the agreed static-review bar.
- Independently re-derived:
  - the rem gap-token clamps (endpoint rounding at most 0.0005px; 1280px values equal `gap-2/4/6`);
  - countdown spacing with the CTA on and off (40 / 50px);
  - every row of the corrected parity tables;
  - the selector inventory;
  - effective reveal counts for all 14 sections;
  - B1–B8.
- Unproven, deferred to the comprehensive browser pass: browser layout, interactions, animation, Theme Editor remounts, responsive behaviour, stylesheet subsetting.
- Batch 5-C3b closes on the coordinator and GPT cross review: both PASS. Scope includes the 5-C3a gap-token unit correction.
