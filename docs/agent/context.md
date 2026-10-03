# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3c: migrate media and stage sections

Status: executed and reviewed. Coordinator review PASS; independent GPT review round 5 found no defect, and the batch was accepted by the user (2026-10-03, "接受吧"). Waiting on the user's commit request; the browser checks are deferred to the end of the series.

### Direction

CSS step 3 series, batch c of b–e. The rules are in `docs/references/style-system/css-architecture.md` and `docs/references/architecture/abstraction-boundaries.md`. Precedents and their review rounds:

- `git show 4c006ea:docs/agent/context.md` (5-C3a);
- `git show 29baadc:docs/agent/context.md` (5-C3b).

User decision (2026-10-03): this batch keeps today's heights, identical or close. The home page is redesigned later, and how far other sections should sit from a full screen is a design-phase question (on the board).

| Section | Height kind | `HEAD` today |
| --- | --- | --- |
| `slides-show` | stage, all sizes | root `h-screen` |
| `routine-showcase` | stage on desktop only, content on mobile | `pc:h-screen` |
| `testimonial-featured` | stage on desktop only, content on mobile | `pc:h-screen` |
| `video-banner` | media, unchanged | |
| `category-grid` | media, unchanged | |
| `scroll-categories` | content, unchanged | |

Stage definition, fixed in this batch (it resolves the open 5-C3a note "a first-position stage is `100svh` plus its padding"):

- A stage section's **total** height, padding and first-section header offset included, is at least one screen: `min-height: 100svh` on the frame root, `box-sizing: border-box`. Content is placed inside.
- This matches `HEAD`'s `h-screen` roots. The header is `position: fixed` (`sections/header.liquid`) and overlays the first section.
- `--section-stage-min-height` becomes `100svh`.
- `svh` instead of `vh`, and a minimum instead of a fixed height, are the accepted near-parity changes.

### Implementation surface

- Sections (6): `slides-show`, `routine-showcase`, `testimonial-featured`, `video-banner`, `category-grid`, `scroll-categories`.
- `snippets/section-frame.liquid`:
  1. Stage per the definition above.
  2. A desktop-only stage option, for example `height_kind: 'stage-pc'`.
  3. A padding mode for overlay layouts: the root exposes `--section-frame-padding-*` and the safe-top offset but does not pad itself, so a slide's absolute overlay can apply them. It replaces `slides-show`'s `.layout layout-safe-top` overlay.
  - All three are backward compatible, except the stage change, which `sections/404.liquid` (the only current stage user) takes on: its total becomes exactly one screen. Record that.
- `tailwind/tailwind.input.css`: the stage token only.
- Other primitives: backward-compatible additions only.
- `tailwind/tailwind.components.css` only if a rule owned by these sections is found there (none by name today).
- Snippets rendered only by these sections, when their markup must change; list consumers.
- `assets/tailwind.output.css` through `npm.cmd run build:tw` only.
- `docs/references/**` to keep them true: stage definition, new options.
- Record: this file.
- Forbidden:
  - `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`;
  - every `{% schema %}`;
  - validators, scripts, `package.json`;
  - `assets/*.js`;
  - `assets/base.css` `.layout` rules;
  - sections outside the list.

### Tasks

1. **Inventory, command-counted, recorded**, for each section:
   - root attributes and inner module mounts;
   - every `data-motion-*` scope;
   - headings and CTAs;
   - margins and `space-y`, in markup **and** in `{% stylesheet %}`;
   - every height, `h-screen`, and `vh`;
   - `.layout` uses and their flags (`layout-safe-top`, `layout-no-*`);
   - aspect-ratio boxes and their overflow.
2. **`section-frame` stage changes** as above. Re-check `404` against `HEAD` (`git show 4c006ea~1:sections/404.liquid`) and record its height change.
3. **Migrate each section** onto `section-frame`, with height kinds per the table:
   - `.layout` overlays become the padding mode (slides-show);
   - `h-screen` / `pc:h-screen` become the stage kinds;
   - headings, text, and CTAs go through the primitives;
   - sibling margins become gaps;
   - fixed content-box heights are removed, or kept with a reason.
4. **Contracts:**
   - `.category-grid__item` keeps a definite full width (WebKit grid guard, `docs/project.md` Theme-Specific Contracts);
   - Swiper and video markup and their module roots are unchanged;
   - LCP and loading attributes on the first slide and video poster stay as at `HEAD` (`loading`, `fetchpriority`, `sizes`).
5. **Record:**
   - the inventory;
   - per-section decisions;
   - every height and spacing change, with `HEAD` and new values at the **10px root** (Tailwind unit 2.5px; tokens 3–5 / 6–10 / 9–15px);
   - the selector inventory, from `grep -F` against `git show HEAD:assets/tailwind.output.css`;
   - the validator output;
   - the deferred browser checks.

### Lessons from 5-C3a and 5-C3b reviews (hard requirements)

- Containers, motion scopes (reveal, critical, sequence, cascade, bound, copy), ARIA, and module mounts are preserved exactly.
  - Count effective reveals per section with a script: literal attributes plus the default reveals of `heading`, `text`, and `image`.
  - Pass `motion_reveal: false` only where `HEAD` had no reveal on that element.
- `text` with no `tier` inherits. Pass a tier only where `HEAD` had that size class.
- No `aria-hidden` on wrappers with real content. No `overflow: hidden` on an `aspect-ratio` element meant to grow.
- A conditional sibling must not lose spacing that `HEAD` gave unconditionally.
- A moved CSS rule must be anchored on a class the file owns (refined rule).
- `root_attrs` never carries `data-module-id`, `x-data`, or Alpine attributes.
- Every number and every validator result comes from a command actually run. Pixel values use the 2.5px unit, never 4px.

### Acceptance checks

- C1: each section renders `section-frame` once per branch. None contains `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, `h-screen`, or a `vh` unit.
- C2: the heading and CTA counts, `HEAD` → now, are recorded per section.
- C3: mounts and motion scopes match `HEAD` (diff excerpts plus the reveal count table). Modules that read their root (`$el`, `dataset`, `closest(`, `x-ref`) are cited and shown unchanged.
- C4: schemas byte-identical to `HEAD`; `git diff --stat HEAD -- config templates` empty.
- C5: the stage definition traced for a first and a non-first stage section, total height = `100svh`; `404` change recorded. The 5-C3a and 5-C3b sections are otherwise unchanged by the primitive edits.
- C6: `npm.cmd run build:tw`; selector inventory against `HEAD`, with consumers for each deleted selector.
- C7: `lint:theme` (0 issues), `test:theme-architecture`, `test:theme-check` (no offenses), `lint:liquid-syntax`, `scan:compat`, `lint:i18n`, `lint:doc-paths`, and `doctor:agent` pass, plus `npx prettier --check` on changed files.
- C8: guards hold: `new CustomEvent` only in the events module; no section-markup replacement outside the SectionRefresher.

### Deferred browser checks

- `slides-show`: stage `100svh` + overlay safe-top vs former `h-screen` + `layout-safe-top`; first-slide LCP (`loading`/`fetchpriority`/`sizes` unchanged in markup).
- `routine-showcase` / `testimonial-featured`: desktop stage (`stage-pc`) vs former `pc:h-screen`; Swiper + hover-card rails unchanged in DOM.
- `video-banner`: hosted vs external click-to-play; aspect-ratio frame after `section-frame` padding clamp.
- `category-grid`: WebKit `width: 100%` on `.category-grid__item`; header `gap-12 pc:gap-16` vs former `margin-bottom` 30px / 40px (12×2.5 / 16×2.5).
- `scroll-categories`: collection heading link + hover-card preview; color scheme now on frame root.
- `404` (stage consumer): total frame height now `min-height: 100svh` including padding (was inner `min-height: calc(100svh − header)` plus separate root padding).

### Execution record

#### Task 1 inventory (commands: `rg -c` on working tree unless noted)

| Section | `data-motion-reveal` | sequence | cascade | bound | critical | inner `data-module-id` | HEAD `<h1`–`<h6` | HEAD `<button` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| slides-show | 3 | 0 | 0 | 0 | 0 | slides-show (1) | 1 or h2 in loop | 0 |
| routine-showcase | 3 | 0 | 0 | 0 | 0 | routine-showcase, hover-card×N | 1 | 2 swiper |
| testimonial-featured | 1 (+copy) | 0 | 0 | 1 + copy-bound | 0 | testimonial-featured (1) | 0 | 0 |
| video-banner | 0 | 0 | 0 | 0 | 0 | video-banner-external (1) | 0 | 1 play |
| category-grid | 3 (→1 lit + 2 prim) | 1 | 1 | per item | 0 | — | 1 | 0 |
| scroll-categories | 5 (→4 lit + 1 prim) | 1 | 1 | per row + CTA | 0 | hover-card×N | 1 in link | 0 |

`rg -c 'margin|space-y'` in `{% stylesheet %}`: category-grid header margin removed (converted to gap); routine-showcase keeps Swiper nav `margin-top: 0` reset.

Heights at HEAD: `slides-show` root `h-screen`; `routine-showcase` inner `pc:h-screen`; `testimonial-featured` inner `pc:h-screen`; others content/media only.

#### Task 2 — `section-frame` / token / `404`

- `--section-stage-min-height: 100svh` in `tailwind/tailwind.input.css` (was `calc(100svh − announcement − header)`).
- `section-frame`: `height_kind` `stage-pc`; `padding_mode` `overlay` + `section-frame__overlay-padding` / `__overlay-safe-top`; stage min-height on root (`box-sizing: border-box`); first-child safe-top skips overlay roots and applies via overlay class when needed.
- **`404`**: still `height_kind: 'stage'`. **Change:** stage minimum is on the frame root at `100svh` (padding inside the box). Before, inner `.section-frame__stage` used `min-height: calc(100svh − header)` while root also added first-section header padding — total visual stage differed. Now one-screen total matches batch definition.

#### Task 3 — per-section decisions

| Section | `section-frame` | Height | Notes |
| --- | --- | --- | --- |
| slides-show | `width: full`, `stage`, `padding_mode: overlay`, `safe_top: false`, `motion`, `root_attrs` component + `data-motion-media="static"` | stage | Overlay replaces `layout layout-safe-top`; copy via `text`/`heading`/`link` |
| routine-showcase | `full`, `stage-pc`, `overlay`, `safe_top: false`, `motion`, `root_attrs` | stage desktop | Inner overlay padding via `section-frame__overlay-padding`; copy primitives in content cell |
| testimonial-featured | `page`, `stage-pc`, `motion`, `root_attrs` | stage desktop | `pc:h-screen` → flex `pc:flex-1` inside stage; blockquote/card label stay native markup |
| video-banner | `width` from setting, `media`, `motion` | media | Module roots unchanged |
| category-grid | `width` from `section_width`, `media`, `motion`, `root_style` grid vars | media | Header/grid `gap-12 pc:gap-16`; `heading`/`text`; `.category-grid__item` `width: 100%` preserved in CSS |
| scroll-categories | `page`, `content`, `motion` | content | Description via `text`; h1 in link unchanged |

#### Reveal count table (`node C:\Users\Joey\AppData\Local\Temp\count-motion-reveals-5c3c.mjs`)

```
section	HEAD_literals	HEAD_primitives	HEAD_total	NOW_literals	NOW_primitives	NOW_total
slides-show	3	0	3	3	0	3
routine-showcase	3	0	3	3	0	3
testimonial-featured	1	1	2	1	1	2
video-banner	0	0	0	0	0	0
category-grid	3	0	3	1	2	3
scroll-categories	5	0	5	4	1	5
```

#### Height / spacing (HEAD → now, 2.5px root)

| Section | HEAD | Now |
| --- | --- | --- |
| slides-show | root `h-screen` (100vh class) | `min-height: 100svh` on frame (`stage`) |
| routine-showcase | `pc:h-screen` on media shell | `stage-pc` frame + `pc:flex-1` shell |
| testimonial-featured | `pc:h-screen` on row | `stage-pc` + `pc:flex-1` row |
| slides-show caption | `mt-2` (8px) between year and RTE | `gap-4` on caption flex (10px at desktop) |
| category-grid header | `margin-bottom` 30px / 40px (`spacing×12/16`) | `gap-12` / `pc:gap-16` (same px) |
| testimonial floating card | `mb-3` between label and title | `gap-3` (7.5px) on flex column |
| All six | linear `--section-padding-*` on section root | `section-frame` fluid clamp on frame root (or overlay vars when `padding_mode: overlay`) |

#### C6 selector inventory (`npm.cmd run build:tw` then diff script)

ADDED 0 / REMOVED 0 class selectors vs `git show HEAD:assets/tailwind.output.css`.

#### C5 pilots

`git diff --stat HEAD` empty for `sections/brand-statement.liquid`, `sections/newsletter-banner.liquid`, `sections/promotion-countdown.liquid`.

#### Validators (C7)

| Command | Result |
| --- | --- |
| `npm.cmd run build:tw` | Done in 134ms |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-architecture` | `# pass 124` `# fail 0` |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run lint:liquid-syntax` | Liquid syntax lint passed. |
| `npm.cmd run scan:compat` | Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks). |
| `npm.cmd run lint:i18n` | pass (both) |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run doctor:agent` | `# pass 124` |
| `npx prettier --check` (changed paths) | All matched files use Prettier code style! |

C1: each of six sections `render 'section-frame'` once; no `h-screen`, `vh`, `class="layout`, or `--section-padding-top:` in section markup.

C4: `git diff --stat HEAD -- config templates` empty; schemas untouched.

C8: no forbidden DOM replacement patterns in the six section files (`rg`).

#### Remaining risks

- Stage parity is intentional `svh` + `min-height`, not fixed `h-screen`; browser pass required on iOS/Android WebKit.
- `slides-show` / `routine-showcase` overlay padding uses new classes — verify safe-top matches `layout-safe-top` with fixed header.
- `category-grid` / `scroll-categories` motion literals moved to primitives where markup migrated; totals match script.
- `404` one-screen total height change is user-accepted stage contract side effect.

### Coordinator review, round 1 (2026-10-03): FAIL, returned to step 5

Verified clean:

- Validators re-run by the coordinator:
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 124/124.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (55 stylesheet blocks).
  - `lint:i18n` (both checks) passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
- Effective reveals, content / media, `HEAD` → now: slides-show 3/0 → 3/0, routine-showcase 1/2 → 1/2, testimonial-featured 1/1 → 1/1, video-banner 0/0 → 0/0, category-grid 3/0 → 3/0, scroll-categories 5/0 → 5/0.
- `loading` / `fetchpriority` / `sizes` arguments in slides-show, video-banner, and category-grid are identical to `HEAD` (hash of the sorted arguments).
- The `.category-grid__item` width guard is kept.
- The overlay padding mode reproduces `.layout-safe-top`: the header offset is unconditional, as at `HEAD`.

Finding:

- S1 (high) Stage height chains rely on percentage heights that no longer resolve.
  - At `HEAD`, slides-show's root was `h-screen` and routine-showcase / testimonial-featured had `pc:h-screen`: a definite height, against which the nested `h-full` / `pc:h-full` elements resolved. That includes Swiper's container, plus `.swiper-wrapper` and `.swiper-slide`, which the vendored CSS sets to `height: 100%`.
  - Now the stage is a column flex container with only `min-height: 100svh`. Its main size is indefinite, so a flexed child's height is not definite (CSS Flexbox, definite sizes: a post-flexing main size is definite only when the container's main size is). Percentage heights below it fall back to `auto`.
  - Expected failure: slides whose images and overlay are absolutely positioned collapse toward zero height inside a one-screen box. The same applies to routine-showcase and testimonial-featured on desktop (`pc:h-full` remains 4 / 3 times).
  - The slides-show stylesheet patches (`.section-frame__inner > .h-full { flex: 1 1 auto }`) do not make the deeper Swiper percentages definite.
  - Fix (spec-backed, keeps the minimum semantics):
    - The stage root uses `display: grid` with one `1fr` row. The `min-height` sizes the row, and the row grows with content when larger.
    - `.section-frame__inner` is the stretched grid item. A stretched grid item's size is definite, so its descendants' percentage heights resolve, as they did under `h-screen`.
    - Content placement for 404 (centred column) stays on the inner wrapper (`display: flex; flex-direction: column; justify-content: center`).
    - Same for `stage-pc` inside the `pc` media query.
    - Remove the flex-fill chains and the slides-show patch; `HEAD`'s `h-full` / `pc:h-full` chains can stay as they were.
    - Record the reasoning, and trace each chain (root → inner → … → swiper-slide / content) for slides-show, routine-showcase (desktop), testimonial-featured (desktop), and 404.

### Correction round 1 (2026-10-03)

| Item | Fix | Evidence |
| --- | --- | --- |
| S1 | Stage / `stage-pc` use a single-row grid (`minmax(0, 1fr)`) + `min-height: 100svh`; stretched `.section-frame__inner`; `__stage` flex column + `height: 100%`; `__stage--center` for 404; removed flex-fill patches; restored `h-full` / `pc:h-full` chains | `snippets/section-frame.liquid` stylesheet; slides / routine / testimonial diffs; height traces below |

#### S1 height chains (definite size rule: **stretched grid item** in a sized row → definite block size; percentages and `h-full` resolve against that box)

**slides-show** (stage, all breakpoints):

| Element | Why height is definite |
| --- | --- |
| `.section-frame--height-stage` | `min-height: 100svh` + `grid-template-rows: minmax(0, 1fr)` sizes the row (grows with content if taller). |
| `.section-frame__inner.section-frame__stage` | Sole grid item; default stretch → row block size is **definite**. |
| `div.h-full` (slides-show module) | `height: 100%` of definite inner. |
| `.swiper.h-full` | `height: 100%` of module root. |
| `.swiper-wrapper` / `.swiper-slide` | Vendor CSS `height: 100%` of definite swiper container. |
| `.section-frame__overlay-padding…absolute.inset-0` | Absolute fill of positioned slide (`inset: 0` vs slide padding box). |

**routine-showcase** (desktop, `≥48rem`, `stage-pc`):

| Element | Why height is definite |
| --- | --- |
| `.section-frame--height-stage-pc` | Grid + `min-height: 100svh` sizes the row at `pc`. |
| `.section-frame__inner.section-frame__stage` | Stretched grid item → **definite** at `pc`. |
| `div.relative.h-full.pc:h-full` | Fills inner (replaces `pc:h-screen` against indefinite flex parent; same % resolution now that inner is definite). |
| `.section-frame__overlay-padding…pc:h-full` | `100%` of definite shell (`HEAD` `layout…pc:h-full`). |
| `.routine-showcase__layout.pc:h-full` | Unchanged `HEAD` chain. |
| `.routine-showcase__swiper-wrap.pc:h-full` → `.swiper.pc:h-full` | Unchanged `HEAD` `pc:h-full` chain into Swiper. |

**testimonial-featured** (desktop):

| Element | Why height is definite |
| --- | --- |
| `.section-frame--height-stage-pc` | Grid row sized at `pc`. |
| `.section-frame__inner…pc:h-full` | Stretched grid item + `pc:h-full` fills row (`HEAD` `layout…pc:h-full`). |
| Module row `pc:h-full.pc:flex-row` | `100%` of inner (`HEAD` used `pc:h-screen` when parent was indefinite; `pc:h-full` equivalent with definite inner). |
| `.swiper.pc:h-full` → `.swiper-slide.pc:h-full` → inner `pc:h-full` | Unchanged `HEAD` desktop chain. |

**404** (`stage`, centred copy):

| Element | Why height is definite |
| --- | --- |
| `.section-frame--height-stage` | Grid + `min-height: 100svh`. |
| `.section-frame__inner.section-frame__stage.section-frame__stage--center` | Stretched grid item (**definite**); flex `justify-content: center` for copy only (no `h-full` hero chain). |

#### Correction validators

| Command | Result |
| --- | --- |
| `npm.cmd run build:tw` | Done in 131ms |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `node count-motion-reveals-5c3c.mjs` | All six sections `HEAD_total` = `NOW_total` (table unchanged from execution record). |
| `node compare-loading-attrs-5c3c.mjs` | slides-show, video-banner, category-grid `MATCH true` |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run test:theme-architecture` | `# pass 124` `# fail 0` |
| `npm.cmd run scan:compat` | 54 stylesheet blocks (section-frame grid CSS; testimonial/routine patch blocks removed) |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run doctor:agent` | `# pass 124` |

C1: no `h-screen` / `vh` in the six batch sections (`rg`); each still renders `section-frame` once.

### Coordinator review, round 2 (2026-10-03): PASS

- S1 verified in `snippets/section-frame.liquid`:
  - `stage` and `stage-pc` (the latter inside `@media (width >= 48rem)`) make the root `display: grid`, with `grid-template-rows: minmax(0, 1fr)` and `min-height: var(--section-stage-min-height)` (`100svh`).
  - `.section-frame__inner` is the stretched grid item, with a definite height, so `HEAD`'s `h-full` / `pc:h-full` chains resolve again.
  - The flex-fill rules and the slides-show patches are gone, and slides-show passes no `inner_class`.
  - 404 centring moved to `section-frame__stage--center`, a one-line change in `sections/404.liquid`, needed because the plan's stage change applies to 404.
- On mobile, the routine-showcase shell's new `h-full` resolves against an `auto` height, so it behaves as `auto`, the same as `HEAD`, which had no mobile height.
- Prettier: the executor left `sections/routine-showcase.liquid` failing on the class order of its own new line. The coordinator reordered it by hand (`relative h-full overflow-hidden pc:h-full`); now every changed file passes `prettier --check`.
- Validators re-run by the coordinator:
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 124/124.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` (both checks) passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
- Reveal recount, content / media, unchanged from round 1: slides-show 3/0, routine-showcase 1/2, testimonial-featured 1/1, video-banner 0/0, category-grid 3/0, scroll-categories 5/0.
- Highest-priority rows for the final browser check: the home slideshow at full height (images visible, overlay placement), and routine-showcase / testimonial-featured on desktop.
- Next: independent GPT review.

### Independent review (GPT), round 1: FAIL. Reconciled by the coordinator (2026-10-03)

The coordinator confirmed all four findings and fixed them. Finding 1 was wider than reported.

- R1 (medium, wider than reported) Colour scheme and surface placement. `section-frame` put `color-{{ scheme }}` and `surface-section` on every root. A scheme class paints `background-color` and the text colour (`snippets/css-variables.liquid`); `surface-section` adds `background-image: var(--gradient-background)`. Placement at `HEAD`:
  - `slides-show`: colour on the root, no surface.
  - `routine-showcase`: no colour on the root; its inner layers carry the class.
  - `scroll-categories`: no colour on the full-width root; colour on the page-width inner `.layout container-page`, no surface.
  - `testimonial-featured`, `video-banner`, `category-grid`: colour plus surface on the root, which matches the default.

  The reviewer reported only scroll-categories' gradient.

  Fix:
  - New `section-frame` parameter `scheme_target`: `root` (default), `inner`, or `none` (the section applies the class itself). The literal stays in a class attribute, so the lint still reads it.
  - `slides-show`: `surface_section: false`.
  - `routine-showcase`: `scheme_target: 'none'` and `surface_section: false`.
  - `scroll-categories`: `scheme_target: 'inner'` and `surface_section: false`.
  - The 17 earlier frame users pass no `scheme_target`, so their output is unchanged.
  - Documented in the `section-frame` LiquidDoc and `abstraction-boundaries.md`.
- R2 (medium) Slideshow caption spacing.
  - At `HEAD` the description had `mt-2` (5px) inside the caption's existing `gap-4` (10px), so 15px in total. The record called it "8px, became `gap-4`", which was wrong.
  - Fix: `class: 'mt-2'` restored on the description `text` render. The margin is kept because it is an extra offset on one child of a uniform gap.
  - The obsolete `pc:flex-1` notes in the height table are superseded by correction round 1 (grid stage, `HEAD`'s `h-full` chains).
- R3 (medium) Selector inventory, from `grep -F` against `git show HEAD:assets/tailwind.output.css`:
  - added: none;
  - removed: `.h-screen`, `.pc\:h-screen`, with no consumers in `sections/`, `snippets/`, `layout/`, or `assets/*.js`.
- R4 (low) Heading and CTA sites, `HEAD` → now, as re-derived by the reviewer and accepted:

  | Section | Heading sites | Link-render sites |
  | --- | --- | --- |
  | slides-show | 3 → 3 | 2 → 2 (exclusive CTA branches) |
  | routine-showcase | 1 → 1 | 1 → 1 |
  | testimonial-featured | 0 → 0 | 0 → 0 |
  | video-banner | 0 → 0 | 0 → 0 |
  | category-grid | 1 → 1 | 1 → 1 |
  | scroll-categories | 3 → 3 | 1 → 1 |

- Validation after the fixes:
  - `build:tw` done; `.mt-2` still present.
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 124/124.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
  - prettier clean on every changed file.
- Next: GPT review round 2.

### Independent review (GPT), round 2: FAIL. Reconciled by the coordinator (2026-10-03)

The coordinator confirmed both findings and fixed them.

- R1 (medium) In scroll-categories, the padding bands were not painted. At `HEAD`, the coloured `.layout.container-page` carried both the colour and the padding, so the scheme painted the content and the padding. With `scheme_target: 'inner'` only the inner wrapper was coloured, while the padding stayed on the uncoloured root.
  - Fix in `snippets/section-frame.liquid`: `scheme_target: 'inner'` adds `section-frame--padding-inner`. The root's padding becomes 0, the inner wrapper takes the padding, and the first-section header offset moves to the inner wrapper too (the root first-section rule excludes `--padding-inner`).
  - The painted area again equals `HEAD`'s `.layout`: content plus padding, within the page width.
  - LiquidDoc updated.
- R2 (medium) `scheme_target: 'none'` bypassed the section-color-scheme lint: a frame render passed while no element received the class.
  - Fix in `.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`: `isSectionFrameRenderWithSection` accepts the frame path only when `scheme_target` is absent or the literal string `'root'` or `'inner'`. A `'none'` value, a variable, or a duplicate falls back to the inline check, which routine-showcase passes with its own literal classes.
  - This tightens the user-approved validator change to keep its agreed bar (the frame path at least as strict as the inline path); it adds no new rule.
- Tests (128, all pass):
  - negative: `scheme_target: 'none'` and a variable `scheme_target`, each without an inline class;
  - positive: `'inner'`, and `'none'` with the section applying the class.
- Fixture repro on a scratch copy (failures):

  | Case | Failures |
  | --- | --- |
  | inline section without the class | 1 |
  | frame with `'none'` and no class | 1 (was 0) |
  | frame with `'inner'` | 0 |
  | frame with the default target | 0 |
  | frame with a variable target | 1 |

- Sensitivity, run in place with a sha256-verified restore (`44f117ba56b62659`): with the target check disabled, 2 tests fail.
- Validation:
  - `build:tw` done; output diff unchanged (1+/11−).
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
  - prettier clean.
- Next: GPT review round 3.

### Independent review (GPT), round 3: FAIL. Reconciled by the coordinator (2026-10-03)

The coordinator confirmed both findings and fixed them.

- R1 (medium) testimonial-featured lost its desktop page columns. `.section-frame__stage` set `display: flex` (unlayered) on the inner wrapper, which overrode `container-page`'s layered `display: grid`.
  - At `HEAD`, testimonial-featured's `.layout.container-page` stayed a grid. 404's inner was flex at `HEAD`: `.flex` follows `.container-page` in `git show 4c006ea~1:assets/tailwind.output.css`.
  - Fix in `snippets/section-frame.liquid`, for `stage` and `stage-pc`: `.section-frame__stage` now sets only `height: 100%` and `min-height: 0`. `display: flex`, `flex-direction: column`, and `justify-content: center` moved to `.section-frame__stage--center`, which only 404 uses.
  - testimonial-featured's inner wrapper keeps `container-page`'s grid. Its single auto row stretches to the definite inner height, so the module row's `pc:h-full` still resolves.
  - slides-show and routine-showcase (`width: full`) are unaffected: block children resolve `h-full` against the definite inner.
- R2 (medium) A `with` / `for … as scheme_target` alias bypassed the colour lint. Liquid applies the alias after named arguments.
  - Fix in `isSectionFrameRenderWithSection`: an alias named `section` or `scheme_target` rejects the frame path.
  - New tests: the `with` and the `for` alias named `scheme_target`. Total 130, all pass.
  - The reviewer's fixtures on a scratch copy now give 1 failure each: `with target as scheme_target`, `for targets as scheme_target`, the same inside `{% liquid %}`, and an alias overriding a named `scheme_target: 'root'`. An unrelated alias and the default both give 0.
  - Sensitivity, run in place with a sha256-verified restore (`538eaf780ee99ba2`): with the alias check disabled, 2 tests fail.
- Validation:
  - `build:tw` done; output diff unchanged (1+/11−).
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 130/130.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
  - prettier clean on every changed file.
- Next: GPT review round 4.

### Independent review (GPT), round 4: FAIL on one documentation finding. Fixed by the coordinator (2026-10-03)

- The reviewer found no implementation defect:
  - stage display and height chains for all stage users;
  - 50 lint render probes, plus four snippet mutations;
  - sensitivity: 2 failures each for the alias guard and the named-target guard;
  - colour and surface placement for all 20 users;
  - C1–C8.
- Finding (low): `docs/references/style-system/css-architecture.md` (height kinds: stage) still said `.section-frame__stage` sets `display: flex`. Corrected: `__stage` sets only height; flex and centring are on `__stage--center`. `lint:doc-paths` passed, `doctor:agent` exit 0, prettier clean.
- Next: GPT review round 5, limited to this correction.

### Independent review (GPT), round 5, and acceptance (2026-10-03)

- GPT round 5 found no defect: the stage row in `css-architecture.md` matches `snippets/section-frame.liquid`, and no other contradiction was found.
- Its FAIL rested only on a missing baseline: the round 4 file hashes were not available in its session.
- The coordinator closed that point with the diff totals:
  - round 4: "16 files, 778 insertions, 176 deletions"; now "16 files, 789 insertions, 176 deletions";
  - the +11 lines equal the 11 lines appended to this file;
  - the `css-architecture.md` sentence rewrite keeps that file's numstat (2 insertions, 1 deletion).
- The user accepted the batch on that evidence ("接受吧").
