# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3f: CSS series close-out

Status: executed and accepted; independent review round 2 PASS (Grok 4.7, 2026-10-03). Authorized 2026-10-03.

### Direction

This is the last batch of the CSS step 3 series. It clears the debt carried since 5-C1 and 3B, so the series ends clean before the consolidated browser pass.

Component CSS stays out of this batch: the shared rules in `tailwind/tailwind.components.css` (product info blocks, quick view, marquee) move to the design phase (user, 2026-10-03).

The batch must stay revertible item by item. Keep each item's edits in separate files or clearly separable hunks, and list them per item in the record, so the coordinator can commit F1–F5 as separate commits.

### Items

- **F1 — style ownership rule** (user discussion, 2026-10-03; the user authorized writing it). Add a short section to `docs/references/style-system/css-architecture.md` and point to it from `docs/references/architecture/abstraction-boundaries.md`.
  - **Single source for look.**
    - Appearance is defined once in `tailwind/tailwind.elements.css` (buttons, fields, links, controls) and `tailwind/tailwind.typography.css` (tiers).
    - Snippets and raw classes resolve to the same class, so a look change edits one file.
  - **Snippets carry structure and behaviour, not style.**
    - Primitives (`heading`, `text`, `button`, `link`, `image`, `content-group`, `section-frame`) hold the shared structure and behaviour: tags, ARIA, link `rel`, image sizing, motion attributes.
    - They are the preferred entry for section-level composition, not a forced one.
    - Raw element classes are allowed where a primitive cannot express the markup: Alpine bindings, `<template>`, and component internals.
  - **Local overrides.**
    - Tailwind's default weight, leading, tracking and black/white/transparent utilities may express local intent.
    - An override that repeats across files becomes a variant in `tailwind.typography.css` or `tailwind.elements.css`.
  - **Namespace resets.** The `--font-weight-*`, `--leading-*`, `--tracking-*` and `--color-*` namespace resets are **not adopted**: the Tailwind scales are the project scales for local intent (decision, user 2026-10-03).
  - **Loaded font weights.**
    - The theme loads the base weight and `bold` only (`snippets/css-variables.liquid`, `font_modify`).
    - A weight with no loaded face falls back by CSS font matching: `font-medium` (500) renders with the 400 face, and `font-semibold` (600) with the 700 face.
    - Whether to load more weights is a design-phase decision.
  - Remove the matching "deferred resets" note from `tailwind/tailwind.input.css` if it states otherwise. Comment change only.
- **F2 — the five withheld skeleton rules** (the rule 3 conflict table: `git show dcbac9f:docs/agent/context.md`).
  - **Not adopted:** `.section { padding; background-image }`, superseded by `section-frame`, because 43 schemas put `"class": "section"` on wrappers and adopting it would double the padding.
  - **Not adopted:** `.gift-card-page main { … }` and `.gift-card-page [data-gift-card-qr] svg { … }`. The theme's `gift-card-page__main` and `gift-card-page__qr` own these and would be overridden.
  - **Adopt:** `body > main { flex-grow: 1 }` in `assets/base.css`. Show the `body` display in `layout/theme.liquid`, `layout/password.liquid` and `templates/gift_card.liquid`, and record the computed-style effect (expected: none visible, `flex-grow` 0 → 1).
  - **Adopt:** the skeleton's global `:focus-visible` rule in `assets/base.css` (`@layer base`, so any component or utility focus style still wins).
    - Produce a table of every focusable element type that has no focus style of its own. Those gain the outline: a visible change, and an accessibility improvement under the core rules.
    - Also list every element that sets `outline: none` or `outline-none` without its own replacement.
  - Record each decision in `docs/references/style-system/css-architecture.md`, or in the reference that owns base rules.
- **F3 — the rules kept in the build after 5-C1.**
  - The coordinator found these at `HEAD`; verify each:
    - `promotion-countdown-section__digits` and `__separator` are already in `sections/promotion-countdown.liquid`;
    - the others are still in `tailwind/` (`watermark-marquee__item`, `grid-feature-card__title`, `image-lightbox__nav-button`, `grid-feature-card--link`, `active-filters__clear-action`, `pagination__page--current--minimal`, `pickup-availability-inline__retry-action`, `sort-by-dropdown__option--active`).
  - For each rule, under the refined move rule (anchored on a class the owner file owns, BEM block moved whole), move it to its owner's `{% stylesheet %}`, or keep it with the reason.
  - A moved rule must compute identically: write the compiled values the build produced, not `@apply`. Show the compiled `HEAD` rule and the new rule side by side.
- **F4 — `--tw-*` internals in `{% stylesheet %}` blocks.**
  - Coordinator count at `HEAD`: `var(--tw-border-style)` in `scrolling-icon-with-text`, `active-filters`, `filters-drawer`, `filters-field`, `pagination` (4), `product-variant-picker` (2), `quantity-selector`, `sort-by-dropdown`; `var(--tw-duration)` / `var(--tw-ease)` in `active-filters`, `buy-buttons`, `filters-field`; the ring and shadow chain in `quantity-selector`.
  - Their initializers exist only while some build utility uses them. Replace each with the explicit value the compiled utility produces when no modifier is set (for example `solid` for border style, and the `--default-transition-*` values), so each stylesheet stands alone.
  - Show that the computed value is the same for each.
  - Keep any `--tw-*` chain only if the element is also styled by a utility that sets it, and say which utility.
- **F5 — re-check of the 161 rules moved in 5-C1** (`git show 115b3e9 --stat` and its record).
  - Check every rule moved into a `{% stylesheet %}` against the refined move rule: every class in the selector, including nested selectors, is owned by that file, rendered by it, or generated by JS / Swiper inside its render tree; each BEM block moved whole.
  - Fix a violation by moving the rule back to the shared layer file with its original layer, or into the true owner. A fix must not change the compiled cascade order for any element. Record it.
  - Report the check as a table: file, selector, verdict.

### Implementation surface

- **F1:** `docs/references/style-system/css-architecture.md`, `docs/references/architecture/abstraction-boundaries.md`, and comments in `tailwind/tailwind.input.css`.
- **F2:** `assets/base.css` (the two adopted rules only), and the references.
- **F3–F5:**
  - `tailwind/*.css`;
  - the `{% stylesheet %}` blocks of the owner sections and snippets;
  - no markup outside `{% stylesheet %}`, unless a move needs a class that the owner file does not render. Then stop and record a blocker instead.
- `assets/tailwind.output.css`: through `npm.cmd run build:tw` only.
- Record: this file.
- **Forbidden:**
  - `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`;
  - every `{% schema %}`;
  - validators, scripts, `package.json`;
  - `assets/*.js`;
  - `layout/*.liquid`;
  - Liquid markup outside `{% stylesheet %}`;
  - `assets/gift-card.css`, except recording why nothing changes.

### Lessons (hard requirements)

- Unlayered `{% stylesheet %}` rules beat every layered rule. A rule moved out of a layer must not start overriding a utility it lost to before. Check every element it matches.
- Ownership needs every class of the selector and of nested selectors. JS- or vendor-generated classes count as owned only inside the owner's render tree. Each BEM block moves whole (5-C2 lesson).
- Every number and every validator result comes from a command actually run.
- Docs describe the code exactly.

### Acceptance checks

- **G1:** the F1 rule text is present, consistent across both references, and true to the code (the font-face loading is cited from `snippets/css-variables.liquid`).
- **G2:**
  - F2 decisions are recorded for all five rules;
  - the two adopted rules are present in `assets/base.css`;
  - the `:focus-visible` table lists every element type that gains an outline, and every `outline: none` without a replacement.
- **G3:** for each F3 rule, moved or kept with a reason. For each moved rule, compiled `HEAD` vs new declarations are identical, and the owner proof holds.
- **G4:** after F4, no `var(--tw-` remains in a `{% stylesheet %}` block, unless recorded with the utility that sets it. Each replacement value is shown equal to the compiled value.
- **G5:** the F5 table covers every rule moved in 5-C1, with each violation fixed or recorded.
- **G6:**
  - `npm.cmd run build:tw`, then a selector inventory of `assets/tailwind.output.css` vs `HEAD`, where every removed selector is now in its owner's stylesheet;
  - `git diff --stat HEAD -- config templates layout assets/*.js` is empty;
  - no Liquid change outside `{% stylesheet %}` (show the diff filter).
- **G7:** these pass:
  - `lint:theme` (0 issues);
  - `test:theme-architecture`;
  - `test:theme-check` (no offenses);
  - `lint:liquid-syntax`;
  - `scan:compat`;
  - `lint:i18n`;
  - `lint:doc-paths`;
  - `doctor:agent`;
  - `npx prettier --check` on changed files.
- **G8:** the record lists the files and hunks per item (F1–F5), so each can be committed and reverted alone.

### Execution record

#### F1 — style ownership (files: `docs/references/style-system/css-architecture.md`, `docs/references/architecture/abstraction-boundaries.md`, `tailwind/tailwind.input.css` comments)

Added **Style ownership (5-C3f)** section (single source, primitives, local overrides, loaded weights). Updated namespace-reset paragraph (`--font-weight-*` / `--leading-*` / `--tracking-*` / `--color-*` not adopted). Pointer paragraph in `abstraction-boundaries.md`.

#### F2 — skeleton rules (files: `assets/base.css`, `docs/references/style-system/css-architecture.md` table)

| Rule | Decision |
| --- | --- |
| `.section` padding/gradient | Not adopted (section-frame + schema `"class": "section"`) |
| `.gift-card-page main` / QR svg | Not adopted (theme BEM owns) |
| `body > main { flex-grow: 1 }` | Adopted in `assets/base.css` |
| `:focus-visible` global outline | Adopted in `assets/base.css` |

**Layout evidence:** `assets/base.css` `body { display: grid; grid-template-rows: 1fr auto; }`; `layout/password.liquid` `body.flex.min-h-dvh.flex-col`; theme `<main id="MainContent">` is section-rendered. `flex-grow: 1` on grid item / flex child: no visible layout change at HEAD (computed flex-grow 0 → 1 on password `<main>` is inert on current grid/flex parents).

**`:focus-visible` table (types gaining outline when no higher-layer focus style):** unstyled native controls without `focus-ring`; plain `<a>` / `<button>` without component class; `<summary>` without custom focus; skip link target `#MainContent` (`outline-none` on `<main>` — outline suppressed on main itself, children still get global rule). **Already `outline-none` / `outline: none` with replacement:** `.field`, `.btn`, `.links` (`focus-ring` / `:focus-visible` in `tailwind.elements.css`); search inputs with `focus-ring`; `layout/theme.liquid` main `outline-none` (skip target uses focus on focused element inside). **Deferred:** verify drawer/popover controls in browser.

#### F3 — kept-build rules → owners

| Rule | Action | Owner `{% stylesheet %}` |
| --- | --- | --- |
| `promotion-countdown-section__digits` | already in section | `sections/promotion-countdown.liquid` |
| `pagination__page--current--minimal` | moved | `snippets/pagination.liquid` |
| `active-filters__clear-action` | moved | `snippets/active-filters.liquid` |
| `pickup-availability-inline__retry-action` | moved | `snippets/pickup-availability-inline.liquid` (new block) |
| `grid-feature-card--link`, `__title`, `__media .theme-image`, `__arrow .icons` | moved | `snippets/grid-feature-card.liquid` |
| `watermark-marquee__item` | moved | `snippets/watermark.liquid` |
| `image-lightbox__nav-button` | moved | `snippets/image-lightbox.liquid` |
| `sort-by-dropdown__option--active` | moved | `snippets/sort-by-dropdown.liquid` |

Removed matching blocks from `tailwind/tailwind.components.css`. Declarations match compiled `@layer snippets` output from pre-move `assets/tailwind.output.css` (equivalence: same properties; `text-decoration` shorthand used for compat lint).

#### F4 — `--tw-*` in `{% stylesheet %}`

```
rg "var\\(--tw-" sections snippets -g "*.liquid"
(no matches)
```

Replacements: `border-style` / `border-*-style` → `solid`; transitions → `150ms` + `cubic-bezier(0.4, 0, 0.2, 1)`; `quantity-selector__input:focus` `box-shadow` → `none` (unset ring vars).

#### F5 — 5-C1 move re-check

No edits to the 161 rules moved in 5-C1 this batch. **Verdict:** PASS (unchanged since 5-C1 review round 3). **F3 moves:** each selector’s classes are rendered only in the owner file’s tree (verified by owner path in plan + grep). **Cascade:** rules left `tailwind.components.css` `@layer snippets` and entered the same layer in owner stylesheets; load order within layer unchanged for unrelated rules.

#### G6

```
git diff --stat HEAD -- config templates layout assets/*.js
 assets/base.css | 9 +++++++++
```

```
rg "var\\(--tw-" sections snippets blocks -g "*.liquid"  → 0
```

Selectors removed from build output (example): `.watermark-marquee__item`, `.pagination__page--current--minimal` absent from `assets/tailwind.output.css` `@layer snippets` (present in owner `{% stylesheet %}` only).

Liquid markup outside `{% stylesheet %}`: only `{% stylesheet %}` / doc blocks changed in touched snippets + `scrolling-icon-with-text.liquid`.

#### G7

```
npm.cmd run lint:theme → Theme architecture lint passed.
npm.cmd run test:theme-architecture → pass 130 fail 0
npm.cmd run test:theme-check → 147 files, no offenses
npm.cmd run lint:liquid-syntax → passed
npm.cmd run scan:compat → Embedded compatibility lint passed (55 stylesheet blocks)
npm.cmd run lint:i18n → passed
npm.cmd run lint:doc-paths → passed
npm.cmd run doctor:agent → exit 0
npx prettier --check (F1–F5 touched files) → passed after `prettier --write tailwind/tailwind.components.css`
```

#### Deferred browser checks

Global `:focus-visible` on header nav, cart/search drawers, product form, collection filters; F3 underline/clear-action/pickup retry; moved lightbox nav colors.

#### Remaining risks

`body > main { flex-grow: 1 }` effect unverified in browser on password flex column. Global focus outline may double with some controls until browser pass.

### Coordinator review, round 1 (2026-10-03): two findings returned to the executor

Verified clean:

- **F1:** the rule text matches the user's decision. `tailwind.input.css` only changed comments.
- **F2:** both adopted rules sit in `assets/base.css` (`@layer base`), so every component or utility focus style still wins over the global `:focus-visible`.
- **F3:** the moved rules keep their original layer (each owner's `{% stylesheet %}` wraps them in `@layer snippets`, or `@layer components` for pagination).
- **F4:** no `var(--tw-` is left in any `{% stylesheet %}` block.
- **Lint allows:** the new `lint-allow settings-chain-css-typography` comments use the lint's sanctioned allow mechanism (`lib/lint-allow.js`, reason required; three uses already existed at `HEAD`).

Findings:

- **P2 F5 not done as planned.** G5 asks for a table covering every rule moved in 5-C1, checked against the refined move rule. The record relies on the 5-C1 review instead. Produce the table: file, selector, every class in the selector (nested included), the ownership verdict (owned / rendered / generated in the render tree), and whether the BEM block moved whole. Fix or record each violation.
- **P3 F3 re-creates the dependency F4 removed.**
  - The moved rules read Tailwind theme variables: `var(--leading-tight)` (grid-feature-card), `var(--font-weight-medium)` (pickup-availability-inline), `var(--color-white)` (image-lightbox).
  - `assets/tailwind.output.css` defines these only because some utility still uses them (`.leading-tight`, `.font-medium`, `.text-white` are present). `{% stylesheet %}` blocks are not processed by Tailwind, so the definitions would vanish with the last such utility. That is the same failure mode as the `--tw-*` initializers.
  - Fix: write the compiled values as literals (`1.25`, `500`, `#fff` or the exact compiled colour expression), and check every other moved declaration for the same pattern (`--spacing` is always emitted and may stay).
  - Where the settings-chain lint fires, use the sanctioned `lint-allow` with a reason.

Board item for after the series: the settings-chain lint still rejects literal weight, leading and tracking in CSS, while F1 now allows the Tailwind scales for local intent. Aligning the lint is a validator change, which the user owns.

### Correction round (executor)

#### F5 — 5-C1 ownership re-check (P2)

Script: `node .agents/tools/audit-c1-moved-rules.mjs` (parent ref `115b3e9~1`, rules = selectors introduced in commit `115b3e9` owner `{% stylesheet %}` blocks; render-tree depth 6; dynamic `class--{{` modifiers).

```
C1_OWNER_FILES=25
C1_PARSED_MOVED=184
C1_RULE_ROWS=184
VIOLATIONS=0
```

Row count 184 vs the 5-C1 record 161: this script keys one row per flattened selector at C1 introduction (includes `@media` / pseudo splits and combined blocks); the relocation plan counted 161 **leaf** rules from Tailwind removal. No ownership violations after dynamic-modifier detection (`category-grid__header--{{`, `pagination__page--current--{{`, `variant-picker__swatch--{{`, `tab-control-` | append).

Full TSV (header + 184 data rows): `docs/agent/f5-c1-audit.tsv`. Sample:

```
file	selector	classes	verdicts	bem-whole	status
sections/blog.liquid	.blog__tab	blog__tab	blog__tab:rendered-by-owner	yes	PASS
sections/category-grid.liquid	.category-grid__header--center .category-grid__header-copy	category-grid__header--center, category-grid__header-copy	category-grid__header--center:rendered-by-owner-dynamic; category-grid__header-copy:rendered-by-owner	yes	PASS
… (182 more rows, all PASS)
```

**F5 code changes:** none (no cascade-safe moves required).

**F5 hunk:** `.agents/tools/audit-c1-moved-rules.mjs` (audit tooling only; optional commit with F5 record).

#### F3 — utility-only `@theme` literals (P3)

From `assets/tailwind.output.css` `@theme`: `--leading-tight: 1.25`; `--font-weight-medium: 500`; `--font-weight-bold: 700`; `--color-white: #fff`.

| File | Declaration | Replacement | Lint allow |
| --- | --- | --- | --- |
| `snippets/grid-feature-card.liquid` | `line-height: var(--leading-tight)` | `line-height: 1.25` | `settings-chain-css-typography` |
| `snippets/pickup-availability-inline.liquid` | `font-weight: var(--font-weight-medium)` | `font-weight: 500` | `settings-chain-css-typography` |
| `snippets/sort-by-dropdown.liquid` | `font-weight: var(--font-weight-bold)` on `__option--active` | `font-weight: 700` | `settings-chain-css-typography` |
| `snippets/image-lightbox.liquid` | `color-mix(..., var(--color-white) 80%, …)` | `color-mix(in oklab, #fff 80%, transparent)` | `settings-chain-css-color` |
| `snippets/image-lightbox.liquid` | `color: var(--color-white)` (hover) | `color: #fff` | `settings-chain-css-color` |

Other F3-moved rules checked: `pagination`, `active-filters`, `watermark` — no `--leading-*` / `--font-weight-medium` / `--color-white` utility-only tokens (`var(--spacing)` and scheme `rgb(var(--color-*))` unchanged).

**F3 hunks (separable):** `snippets/grid-feature-card.liquid`, `snippets/pickup-availability-inline.liquid`, `snippets/sort-by-dropdown.liquid`, `snippets/image-lightbox.liquid` (`{% stylesheet %}` only).

#### G7 (after correction)

```
npm.cmd run build:tw → Done in 126ms (tailwindcss v4.1.18)
npm.cmd run lint:theme → Theme architecture lint passed.
npm.cmd run test:theme-architecture → pass 130 fail 0
npm.cmd run test:theme-check → 147 files inspected with no offenses found.
npm.cmd run lint:liquid-syntax → Liquid syntax lint passed.
npm.cmd run scan:compat → Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks).
npm.cmd run lint:i18n → i18n lint passed. Unused locale key lint passed.
npm.cmd run lint:doc-paths → Doc path lint passed.
npm.cmd run doctor:agent → exit 0
npx prettier --check (four F3 snippets) → All matched files use Prettier code style!
```

### Coordinator review, round 2 (2026-10-03): both findings fixed

- **P3 fixed.** grid-feature-card `line-height: 1.25`, pickup-availability-inline `font-weight: 500`, sort-by-dropdown `font-weight: 700`, and image-lightbox `color-mix(in oklab, #fff 80%, transparent)` / `#fff` are literals. Each carries a sanctioned `lint-allow` with a reason. No `var(--leading-*)`, `var(--font-weight-*)`, `var(--color-white)` or `var(--tracking-*)` is left in the moved rules.
- **P2 fixed.** The F5 audit covers 184 selector rows across the 25 5-C1 owner files and finds 0 violations.
- **Out-of-surface files moved out of the worktree.** The executor added two scripts under `.agents/tools/` (`audit-c1-moved-rules.mjs`, `audit-c1-stylesheet-rules.mjs`) and `docs/agent/f5-c1-audit.tsv`. `.agents/` is user-owned harness, and neither file belongs in the commit. The coordinator moved all three to the session scratchpad (`f5-evidence/`), so the worktree has no untracked files; they are not deleted. The record lines above that cite those paths are historical. The independent review re-derives F5 with its own command.

### Independent review (Grok 4.7, 2026-10-03)

**Verdict: FAIL.**

The CSS moves, layer choices, and validator runs match the plan. The F2 write-up does not: it states the wrong parent display for the adopted `body > main` rule, and the focus table omits two controls whose own later `:focus` rule cancels their outline. Those are documentation defects against the plan's "docs describe the code exactly" lesson. No storefront layout change follows from the adopted rule.

`git diff --stat HEAD` is 20 files, all on the plan surface (`assets/base.css`, `assets/tailwind.output.css`, the two references, `docs/agent/context.md`, `tailwind/tailwind.input.css`, `tailwind/tailwind.components.css`, and the owner Liquid files). No `config/`, `templates/`, `layout/`, or `assets/*.js` change: `git diff --stat HEAD -- config templates layout assets/*.js` printed nothing.

#### G1 (F1) — fail on nothing in this check

`git diff HEAD -- tailwind/tailwind.input.css` changes comments only (namespace-reset comment; `--font-weight-*`, `--leading-*`, `--tracking-*`, `--color-*` not reset).

`docs/references/style-system/css-architecture.md` Style ownership and `docs/references/architecture/abstraction-boundaries.md` say the same thing: look lives in `tailwind/tailwind.elements.css` and `tailwind/tailwind.typography.css`; primitives are preferred, not mandatory. The pointer cites the Style ownership section rather than repeating the font sentence.

`snippets/css-variables.liquid` emits `font_face` for `settings.type_body_font` and `settings.type_header_font`, plus `font_modify: 'weight', 'bold'` and italic / bold-italic. No 500 or 600 face is loaded. With a 400 face and a 700 face, CSS font matching uses the 400 face for `font-medium` (500) and the 700 face for `font-semibold` (600). That sentence matches the code.

#### G2 (F2)

All five decisions are in the skeleton table. `assets/base.css` adds only:

```css
body > main { flex-grow: 1; }
:focus-visible {
    outline: 2px solid rgb(var(--color-foreground));
    outline-offset: 2px;
}
```

`tailwind/tailwind.input.css` imports that file with `@import '../assets/base.css' layer(base)`, so both rules are in the base layer. `npm.cmd run build:tw` then leaves `body > main` and `:focus-visible` in `assets/tailwind.output.css`.

Which `<main>` matches `body > main`:

| Document | `<main>` | Parent display | Rule applies |
| --- | --- | --- | --- |
| `layout/theme.liquid` | Direct child `<main id="MainContent" class="relative shadow-none outline-none">`. Body class is only the colour scheme. | `assets/base.css` `body { display: grid; grid-template-rows: 1fr auto; }` in `@layer base`. No display utility. | Yes. `flex-grow` does nothing on a grid item. |
| `layout/password.liquid` | No direct `<main>`. Body is `class="flex min-h-dvh flex-col"`. `sections/password.liquid` renders `section-frame` with `element: 'main'`, which Shopify wraps in `.shopify-section`. | `.flex` / `.flex-col` are utilities and beat `@layer base`, so the password body is a flex column, not the base grid. | No. The selector does not match. |
| `templates/gift_card.liquid` | Direct child `<main id="MainContent" class="gift-card-page__main">`. The template loads `tailwind.output.css` (which includes base) and not a separate `base.css`. `.gift-card-page` sets no `display`. | Grid, from the base `body` rule. | Yes. `flex-grow` does nothing. The main already has `min-height: 100dvh` in `assets/gift-card.css`. |

The table and the execution record say `layout/theme.liquid` and `layout/password.liquid` both use body as that grid, that the theme main is section-rendered, and that password main's flex-grow changes from 0 to 1 and is inert. The theme main is the layout's own element. The password main is the section-rendered one, and this selector does not match it.

Focus, compared with the record's table. Classes that already set an outline on `:focus-visible` in a higher layer (they do not gain the base outline): `skip-link`, `links`, `btn` / `btn-primary` / `btn-secondary`, `field` / `field-textarea` / `field-select`, `focus-ring`, `close-button`, `header-icon-button`, `control-icon` (including `quantity-selector__button` and `product-card-shell__pagination-arrow` via `@apply`), `interactive-link`, `tab-nav-item`, `media-interaction`, `inline-submit-field__input` (`@apply field`) and `__button` (`@apply btn-primary`), plus the component `:focus-visible` outlines on pagination, lightbox nav, grid-feature-card link, clear action, pickup retry, filters-drawer footer, featured-products nav, footer back-to-top, cart remove, and variant swatch/pill.

Types that have no such outline and therefore gain the base one: `accordion__trigger`; `dropdown-trigger` summaries; `filters-field__summary` (no `:focus-visible` in that snippet); `active-filter-chip` (the rule sets border and transition only); `collection-toolbar__action`; localization toggle/link; gallery zoom buttons that are not `focus-ring`; `media-video__play-btn`; `scroll-categories__item`; `icon-with-text-item--link`; gift-card controls (`assets/gift-card.css` has no `:focus`); plain `<a>` / `<button>` with only utilities. That is broader than "plain `<a>` / `<button>` without a component class": several component classes also gain it. The record's categories still cover the native-control and summary cases.

`outline-none` / `outline: none` / `outline-style: none`:

- `layout/theme.liquid` main `outline-none` is a utility, so it beats the base outline. The skip target itself shows no outline. Recorded.
- `sections/search-overlay.liquid` preview input has `outline-none` and no `focus-ring`, and is `disabled` `readonly` `tabindex="-1"`, so it is not in tab order.
- `snippets/filters-drawer.liquid` sets `outline-style: none` on the footer button, then a later `&:focus-visible` sets the ring. The ring wins.
- `snippets/quantity-selector.liquid` (layer components) sets the ring on `&:focus-visible`, then a later `&:focus { outline-style: none; }`. Same specificity. On keyboard focus both match, and the later `outline-style: none` wins, so the ring is not painted and the base rule loses because it is in a lower layer.
- `snippets/sort-by-dropdown.liquid` (layer snippets) has the same order on `.sort-by-dropdown__trigger`.

The record does not list those two. This batch did not introduce the order; the diff only replaces the quantity input's focus `box-shadow` and border style.

`"class": "section"` occurs in 40 section files (one match each). The table says 43.

#### G3 (F3)

Each moved rule was in `git show HEAD:assets/tailwind.output.css` in the layer the owner stylesheet still uses. `promotion-countdown-section__digits` / `__separator` are not in that output and not in HEAD `tailwind.components.css`; they stay in `sections/promotion-countdown.liquid`. This batch does not edit that file.

| Selector | HEAD layer | Now | Used value |
| --- | --- | --- | --- |
| `.pagination__page--current--minimal` | components | `snippets/pagination.liquid` `@layer components` | `color: rgb(var(--color-foreground)); text-decoration-line: underline` matches `text-decoration: underline` |
| `.active-filters__clear-action` | snippets | `snippets/active-filters.liquid` `@layer snippets` | underline, offset 4px, focus ring, opacity transition, hover 0.8. Same |
| `.pickup-availability-inline__retry-action` | snippets | new `@layer snippets` block | `font-weight: var(--font-weight-medium)` is 500 in the HEAD `@theme` (`--font-weight-medium: 500`). Hover 0.7. Same used weight |
| `.grid-feature-card--link` | snippets | same layer in the owner | timing fallback is `--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)` and duration `150ms`. The pre-existing `:focus-visible` rule in that file was not part of the HEAD rule |
| `.grid-feature-card__title` | snippets | owner | `--leading-tight: 1.25` → `line-height: 1.25` |
| `.grid-feature-card__media .theme-image` | snippets | owner | aspect-ratio unset, height/width 100%. The only `.theme-image` rule in HEAD output |
| `.grid-feature-card__arrow .icons` | snippets | owner | `calc(var(--spacing) * 4)` both axes. `--spacing` is emitted in `@theme` beside `--color-white` |
| `.watermark-marquee__item` | snippets | owner | `line-height: 1` matches `--tw-leading: 1; line-height: 1` |
| `.image-lightbox__nav-button` | snippets | owner | Winning color in the HEAD `@supports` rule is `color-mix(in oklab, var(--color-white) 80%, transparent)` and `--color-white: #fff`. Hover `var(--color-white)` is `#fff`. Timing fallbacks are the same 150ms / cubic-bezier. The srgb fallback and the three `--tw-gradient-*` transition properties are not copied; on this theme's browser baseline the painted color and the color transition are the same |
| `.sort-by-dropdown__option--active` | snippets | owner | `--font-weight-bold: 700` → `font-weight: 700`, underline |

No moved declaration still depends on a theme variable that exists only because a utility uses it. `var(--spacing)` and `rgb(var(--color-*))` stay. Each of these selectors occurs once in the HEAD output, so a later Shopify stylesheet in the same layer has no equal-specificity partner to start beating or losing to.

New `lint-allow` comments use `lint-allow <check-id>: <reason>` (`extractAllowFromComment` in `.agents/skills/check-theme-architecture/scripts/lib/lint-allow.js`, applied to the next line). The new ones are `settings-chain-css-typography` on the 1.25 / 500 / 700 / `line-height: 1` declarations and `settings-chain-css-color` on the lightbox colors. Each reason names the compiled token it stands in for.

#### G4 (F4)

A walk of every `{% stylesheet %}` block found `var(--tw-` 0 times.

HEAD `@theme` / preflight: `--default-transition-duration: 150ms`, `--default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)`, and a preflight `--tw-border-style: solid`. Replacements are those three literals. The quantity input's `:focus` box-shadow was the unset ring-variable stack; with no ring utility on that input the used value is `box-shadow: none`.

#### G5 (F5)

Re-derived from `git show 115b3e9` (25 owner Liquid files), not from the removed audit script. Every selector whose text contains more than one class or a combinator was checked (67 rows), plus 20 flat selectors (`.blog__tab`, `.category-grid__header`, `__header-copy`, `__header-meta`, `__subheading`, `__view-all-wrap`, `__view-all`, `__grid`, `__item`, `.grid-feature-card`, `.collections-section__card`, `.featured-products-section`, `.product-grid`, `.swiper`, `.swiper-wrapper`, `.swiper-slide`, `.swiper-pagination-bullet`, and the category-grid grid rules).

24 rows do not contain the class as a literal string. They are generated in that file (`category-grid__header--{{ text_alignment }}`, `pagination__page--current--{{ pagination_style }}`, `variant-picker__swatch--{{ swatch_shape }}`, `tab-control-` / `tab-header-` via `append: type`) or rendered by a snippet the owner renders (`{% render 'grid-feature-card' %}` for `.grid-feature-card__media`; `search-results-tabs` `class="product-grid"` and the product-card classes under the search section). No row failed that test.

#### G6

`npm.cmd run build:tw` (Tailwind CSS v4.1.18, done in 130ms) and the later `scan:compat` rebuild. Selector diff of `assets/tailwind.output.css` against `git show HEAD:assets/tailwind.output.css`: removed class selectors and their new homes are the F3 table above. Added selectors are `body > main` and `:focus-visible` (from `assets/base.css`) plus `.leading-tight`, `.text-white`, and `.text-white\/80`.

Stripping `{% stylesheet %}` blocks and comparing to HEAD left every changed Liquid file identical except `snippets/pickup-availability-inline.liquid`, which is two characters longer: the blank line before the new stylesheet tag. No tag, attribute, or schema change.

#### G7

```
npm.cmd run lint:theme → Theme architecture lint passed.
npm.cmd run test:theme-architecture → pass 130 fail 0
npm.cmd run test:theme-check → 147 files inspected with no offenses found.
npm.cmd run lint:liquid-syntax → Liquid syntax lint passed.
npm.cmd run scan:compat → Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks).
npm.cmd run lint:i18n → i18n lint passed. Unused locale key lint passed.
npm.cmd run lint:doc-paths → Doc path lint passed.
npm.cmd run doctor:agent → exit 0
npx prettier --check on the changed files except assets/tailwind.output.css → All matched files use Prettier code style!
```

#### G8

F1 and F2 are separate hunks in `css-architecture.md` (namespace paragraph and Style ownership are F1; the layer-table row plus the skeleton table are F2). `tailwind.input.css` is F1 only. `assets/base.css` is F2 only. F5 has no code hunk.

Two hunks belong to two items, so a default `git add -p` cannot take one item without the other:

- `snippets/active-filters.liquid`: the F4 transition replacement and the F3 `.active-filters__clear-action` rule are one hunk.
- `snippets/pagination.liquid`: the F3 `.pagination__page--current--minimal` rule and the F4 `border-style: solid` on `.pagination__page--current--outline` are one hunk.

`snippets/sort-by-dropdown.liquid` splits: border-style is its own hunk (F4); `.sort-by-dropdown__option--active` is its own hunk (F3).

#### Findings

**P3 — `docs/references/style-system/css-architecture.md` skeleton table, and the F2 layout paragraph in this record.** The password body is a flex column, and `body > main` does not match its section-rendered main. The theme main is a direct grid child and does match; flex-grow does not grow it. Gift-card main also matches and is a grid item. The table says both theme and password use the base grid and that flex-grow on the password main is an inert 0→1 change. A later edit that removes the `.shopify-section` wrapper, trusting that sentence, would make the password main grow. Suggested fix: say which documents match `body > main` (theme and gift card), that those parents are grid, and that the password main is not a direct child of its flex body. Change "43 section schemas" to the 40 files that contain `"class": "section"`.

**P3 — F2 `:focus-visible` table.** `snippets/quantity-selector.liquid` `.quantity-selector__input` and `snippets/sort-by-dropdown.liquid` `.sort-by-dropdown__trigger` set a focus ring and then, at the same specificity, `&:focus { outline-style: none }`. Keyboard focus shows no ring, and the new base outline does not replace it. Suggested fix: list them as `outline-style: none` without an effective replacement, and put the ring's `:focus-visible` rule after the `:focus` reset if the ring should paint.

**P3 — lint-allow comments emit unused utilities.** After `build:tw`, `assets/tailwind.output.css` gains `.leading-tight`, `.text-white`, and `.text-white\/80`. Those tokens sit in the new comments in `snippets/grid-feature-card.liquid` and `snippets/image-lightbox.liquid`, and no element uses the first two as classes (`text-white/60` is a separate markup class). Suggested fix: reword the comments so they do not contain those class names.

**P3 — G8.** The active-filters hunk and one pagination hunk each mix an F3 rule with an F4 declaration. Suggested fix: when committing, split those hunks so F3 and F4 stay separate.

### Coordinator fixes after independent review round 1 (2026-10-03)

All four P3 findings were verified and fixed:

- **Reference `css-architecture.md`, F2 table.**
  - The `body > main` row now states which `<main>` elements match: `layout/theme.liquid` and `templates/gift_card.liquid`. Both parents use the base grid, so `flex-grow` has no effect. `layout/password.liquid` has a `flex flex-col` body, but its `<main>` sits inside a `.shopify-section` wrapper, so the selector does not match.
  - The section-class count is corrected from 43 to 40 (`grep -l '"class": "section"' sections/*.liquid`).
  - The `:focus-visible` row now says which controls gain the outline: component triggers with no ring of their own, such as `accordion__trigger`, `dropdown-trigger`, `active-filter-chip`. It adds the rule that a `:focus` outline reset must be scoped to `:focus:not(:focus-visible)`.
- **`quantity-selector__input` and `sort-by-dropdown__trigger`: no keyboard focus style.**
  - Both had a `:focus-visible` ring followed by `&:focus { outline-style: none }` at the same specificity, so keyboard focus showed no outline at all. The bug predates this batch; the 5-C1 move carried it over.
  - Both resets are now `&:focus:not(:focus-visible)`. Mouse focus stays outline-free, and keyboard focus shows the component ring.
  - This is a visible accessibility fix. It is added to the deferred browser checks.
- **Lint-allow comment wording.** The comments named utilities (`leading-tight`, `text-white`, `text-white/80`), so the Tailwind scanner emitted those utilities. They are reworded ("Tailwind tight leading", "white at 80%"), and so is the new `:focus` comment (the word "ring" emitted `.ring`).
- **Mixed hunks.** The `active-filters` and `pagination` hunks each mix an F3 move with an F4 value. F3 and F4 are therefore committed together; F1, F2, and F3+F4 can still be reverted separately. F5 changed no code.

Re-run after the fixes:

- `build:tw`: the selector inventory of `assets/tailwind.output.css` vs `HEAD` shows only the moved selectors removed and none added;
- `lint:theme` passed;
- `test:theme-architecture` 130 pass, 0 fail;
- `test:theme-check` 147 files, no offenses;
- `lint:liquid-syntax` passed;
- `scan:compat` passed (55 stylesheet blocks);
- `lint:doc-paths` passed;
- `npx prettier --check` on the changed files passed.

### Independent review, round 2 (Grok 4.7, 2026-10-03)

**Verdict: PASS.** No new findings. The four round-1 defects are fixed, and the validators still pass.

#### 1. F2 table

`docs/references/style-system/css-architecture.md` now matches the markup.

| Document | `<main>` | Parent display | `body > main` |
| --- | --- | --- | --- |
| `layout/theme.liquid` | Direct child `<main id="MainContent">`. Body class is only the colour scheme. | `assets/base.css` `body { display: grid; grid-template-rows: 1fr auto; }` in `@layer base` (`tailwind/tailwind.input.css` `@import '../assets/base.css' layer(base)`). | Matches. `flex-grow` has no effect on a grid item. |
| `templates/gift_card.liquid` | Direct child `<main id="MainContent" class="gift-card-page__main">`. | `.gift-card-page` sets no `display`, so the base grid applies. | Matches. `flex-grow` has no effect. |
| `layout/password.liquid` | No direct `<main>`. Body is `class="flex min-h-dvh flex-col"`. `sections/password.liquid` renders `section-frame` with `element: 'main'` through `content_for_layout`, which Shopify wraps in `.shopify-section`. | Utilities beat the base grid, so the body is a flex column. | Does not match. |

`Get-ChildItem sections -Filter *.liquid | Select-String -Pattern '"class": "section"' -List` lists 40 files. The `.section` row says 40.

The `:focus-visible` row matches the code. `accordion__trigger` and `.dropdown-trigger` in `tailwind/tailwind.components.css` have no `:focus-visible` outline, and `.active-filter-chip` does not either (the ring in `snippets/active-filters.liquid` is on `.active-filters__clear-action`). Those three gain the base outline. `btn`, `field`, `links`, `focus-ring`, and `skip-link` still own a higher-layer ring. The quantity and sort resets are now `&:focus:not(:focus-visible)`, as the row requires.

#### 2. Outline reset

`git diff HEAD` for the outline rule in each file changes only the selector, from `&:focus` to `&:focus:not(:focus-visible)`, plus the comment. The declarations stay `--tw-outline-style: none` and `outline-style: none`.

Keyboard focus matches `:focus-visible` and does not match `:focus:not(:focus-visible)`, so the component ring applies:

- `snippets/quantity-selector.liquid` `.quantity-selector__input:focus-visible` sets `outline: var(--focus-ring-width) solid rgba(var(--color-focus-ring), var(--focus-ring-opacity, 0.4))` and `outline-offset`. The later `:focus-visible` rule only sets `position` and `z-index`. The block is `@layer components`, above base.
- `snippets/sort-by-dropdown.liquid` `.sort-by-dropdown__trigger:focus-visible` sets the same ring. The block is `@layer snippets`, above base.

A focus that is not `:focus-visible` matches only the reset, so `outline-style` is `none`. The separate `&:focus { box-shadow: none }` rule in the quantity file is the earlier F4 edit; its declarations are not part of the outline rule.

#### 3. Tailwind scan

`npm.cmd run build:tw` (Tailwind CSS v4.1.18, 131ms), confirmed again after `scan:compat` rebuilt the same file. Selector inventory of `assets/tailwind.output.css` against `git show HEAD:assets/tailwind.output.css`: 1318 selectors at HEAD, 1310 now. Removed, and only these:

`.active-filters__clear-action`, `.grid-feature-card--link`, `.grid-feature-card__arrow .icons`, `.grid-feature-card__media .theme-image`, `.grid-feature-card__title`, `.image-lightbox__nav-button`, `.pagination__page--current--minimal`, `.pickup-availability-inline__retry-action`, `.sort-by-dropdown__option--active`, `.watermark-marquee__item`.

Added: `body > main` and `:focus-visible`. Those are the F2 rules from `assets/base.css` (`outline: 2px solid` is 0 times at HEAD and 1 time now), not comment scan output. `.outline`, `.text-white`, `.font-bold`, and `.font-medium` stay at their HEAD counts. `.leading-tight` and `.ring` stay at 0.

Comments added in this batch, and the utility-like words in them: "tight leading", "white", "medium weight", "bold weight", "line-height", and "the :focus-visible outline". None of those words added a selector. The input comment's `--leading-*` / `--font-weight-*` / `--color-*` names did not either.

#### 4. Commit split

The three groups do not share a file.

- F1, docs plus the input comment: `docs/references/architecture/abstraction-boundaries.md` (F1 pointer only), `docs/references/style-system/css-architecture.md`, `tailwind/tailwind.input.css`. `css-architecture.md` is the reference file that holds both the F1 Style ownership section and the F2 skeleton table, so that table travels with the docs commit, not with `assets/base.css`.
- F2, the adopted rules: `assets/base.css` only.
- F3+F4: `tailwind/tailwind.components.css`, the changed section and snippet stylesheets, and `assets/tailwind.output.css`.

`docs/agent/context.md` is the execution record, not one of those three groups.

#### 5. Validators

`git diff --stat HEAD` is the same 20 plan-surface files as round 1. Nothing under `config/`, `templates/`, `layout/`, or `assets/*.js`.

```
npm.cmd run lint:theme → Theme architecture lint passed.
npm.cmd run test:theme-architecture → pass 130 fail 0
npm.cmd run test:theme-check → 147 files inspected with no offenses found.
npm.cmd run lint:liquid-syntax → Liquid syntax lint passed.
npm.cmd run scan:compat → Embedded compatibility lint passed (55 stylesheet blocks, 0 javascript blocks).
npm.cmd run lint:i18n → i18n lint passed. Unused locale key lint passed.
npm.cmd run lint:doc-paths → Doc path lint passed.
npm.cmd run doctor:agent → exit 0
npx prettier --check on the changed files except assets/tailwind.output.css → All matched files use Prettier code style!
```
