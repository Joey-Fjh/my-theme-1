# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3e2: primitives in the site chrome and overlay sections

Status: executed and accepted; independent review PASS (Grok 4.7, 2026-10-03). Authorized 2026-10-03.

### Direction

CSS step 3 series, the last migration batch (e1 `fbcd767` removed `.layout`).

- **Scope:** route the section-level static headings, copy and buttons in eight sections through the primitives `heading`, `text`, `button`.
- **No frame:** these sections have no padding settings and do not use `section-frame`; none is added.
- **Output must not change.** Heights, visuals, ARIA, ids and behaviour stay identical to `HEAD`.
- **Rule for this batch:** convert an element only when the primitive renders the same element, the same classes and the same attributes as `HEAD`, or computed styles are shown identical with evidence. Leave the element raw when:
  - it carries Alpine bindings (`x-text`, `x-show`, `@click`, `:disabled`, `:class`, and so on);
  - it lives inside a `<template>`;
  - it is a dialog title styled by `ui-dialog` component CSS, unless equivalence is shown;
  - its classes come from a component snippet;
  - the primitive would add a tier, size or reveal that `HEAD` did not have.
  
  Record every element as converted or kept raw, with the reason.
- **Rules:** `docs/references/style-system/css-architecture.md` and `docs/references/architecture/abstraction-boundaries.md`.

### Implementation surface

- **Sections (8):** `announcement-bar`, `header`, `footer`, `cart-overlay`, `search-overlay`, `newsletter-overlay`, `pickup-availability`, `collection-navigation-items`.
- **`snippets/heading.liquid`, `snippets/text.liquid`:** a backward-compatible optional `attrs` parameter is allowed, for static attributes only (`id`, `{{ block.shopify_attributes }}`). It must never carry `data-module-id`, `x-*`, `@*`, or `:*`. Document it in `abstraction-boundaries.md`. Prove that every existing render is byte-identical.
- **Other primitives:** backward-compatible additions only, with the same proof.
- **`assets/tailwind.output.css`:** through `npm.cmd run build:tw` only.
- **`docs/references/**`:** to keep them true.
- **Record:** this file.
- **Forbidden:**
  - `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`;
  - every `{% schema %}`;
  - validators, scripts, `package.json`;
  - `assets/*.js`, `assets/base.css`;
  - `tailwind/**` (no CSS changes in this batch);
  - other sections;
  - every component snippet, including `ui-dialog`, header menus, `product-card`, and the newsletter form.

### Known candidates at `HEAD` (coordinator read; verify with commands and complete the list)

- **footer:**
  - the link-column `h2.mb-6.heading-h2.pc:mb-10` (block heading);
  - the content `h3.heading-h2`;
  - the content `div.rte.rte--compact.body-3xl` (richtext).
- **newsletter-overlay:** text blocks `div.rte.rte--compact.mb-0.pc:mb-2.<tier>` with `{{ block.shopify_attributes }}`, and heading blocks `h2#dialog-title-<id>.mb-0.pc:mb-3.<tier>` with `{{ block.shopify_attributes }}`. Each appears twice (two layouts). The `id` is the dialog's `aria-labelledby` target, so it must stay exact.
- **pickup-availability:** `p.mt-1.body-sm` (pick-up time), and a bare `h3` (location name; `base.css` `h3` styling). A tier class can only replace the bare element if it is shown identical, else keep it raw.
- **cart-overlay:**
  - bare dialog-title `h1`s with `id="dialog-title-<id>"`;
  - `p` elements inside `<template>` or with `x-text`;
  - the `btn-secondary` view-cart link with an icon;
  - the `btn-primary` checkout button with `@click` and `:disabled`.
  
  Most should stay raw. `snippets/button.liquid` adds a `body-md` size class that `HEAD` does not have.
- **search-overlay:** bare dialog-title `h1`s with ids.
- **announcement-bar, header, collection-navigation-items:** no section-level heading, copy tier or button found by grep. Confirm, and record "nothing to convert" if so.

### Tasks

1. **Inventory, command-counted, recorded.** List every `h1`–`h6`, every `p` or `div` with a typography or `rte` class, and every `btn-*` element in the eight sections, with line, classes, attributes and Alpine bindings.
2. **Classify** each element as convert or keep raw, with the reason under the batch rule.
3. **Convert** the convert set.
   - Pass `motion_reveal: false` wherever `HEAD` had no `data-motion-reveal`. None of these sections mounts a motion scope, and an unscoped `data-motion-reveal` must not appear.
   - Richtext needs `element: 'div'`.
   - Check `heading` and `text` defaults: the `heading` default tier is `heading-h2`; `text` with `rte: true` adds `rte rte--compact`.
4. **Equivalence proof.** For each converted element, show the rendered HTML of `HEAD` vs now, with the same tag, classes (order may differ), attributes and content.
   - Use a script that renders the primitive's logic, or a careful manual expansion shown in the record.
   - For any class-set difference, show the computed-style equivalence, or revert to raw.
5. **Record:**
   - the inventory with classifications;
   - the equivalence table;
   - the `attrs` addition (if any) with the byte-identical proof for existing renders;
   - validator outputs;
   - deferred browser checks.

### Lessons from earlier reviews (hard requirements)

- **Bare elements.** A bare `h1`–`h6` is styled by `base.css` element rules. A tier class lives in `@layer utilities` and wins over component CSS such as `ui-dialog` header styles. Never add a tier to a bare element without proving that the computed styles match (5-C3e1 P2: the default `heading-h2` replaced a bare `h1`).
- **Compact rhythm.** `rte: true` adds `rte--compact`. Use it only where `HEAD` had `rte--compact` (5-C3e1 P2).
- **Richtext.** Richtext content needs `element: 'div'` (5-C3d3 P2). Check `measure` (5-C3d1 P2).
- **Preserve exactly:** ARIA, ids (`aria-labelledby` targets), `{{ block.shopify_attributes }}` (theme editor), Alpine bindings, and loading attributes.
- **Docs.** Docs describe the code exactly.
- **Evidence.** Every result comes from a command actually run.

### Acceptance checks

- **E1:** the inventory and the classification cover every candidate element in the eight sections. Each conversion is justified, and each kept-raw element names its rule.
- **E2:** the equivalence table shows identical tag, classes and attributes, or a computed-style proof, for every converted element. No `data-motion-reveal` was added anywhere.
- **E3:** ids, `aria-*`, `{{ block.shopify_attributes }}`, and Alpine bindings are identical to `HEAD`. A count per section, `HEAD` → now, for `id=`, `aria-`, `shopify_attributes`, `x-`, `@`, `:`.
- **E4:**
  - schemas are byte-identical;
  - `git diff --stat HEAD -- config templates tailwind assets/base.css assets/*.js` is empty;
  - `assets/tailwind.output.css` has no diff, or only a diff explained by class-order-free regeneration.
- **E5:** if `attrs` was added, every existing `heading` / `text` render produces byte-identical output, and the parameter is documented with its restriction.
- **E6:** these pass:
  - `lint:theme` (0 issues);
  - `test:theme-architecture`;
  - `test:theme-check` (no offenses);
  - `lint:liquid-syntax`;
  - `scan:compat`;
  - `lint:i18n`;
  - `lint:doc-paths`;
  - `doctor:agent`;
  - `npx prettier --check` on changed files.

### Execution record

#### Inventory and classification (`rg -n '<h[1-6]|class=.*(heading-|body-|rte |btn-)' sections/<name>.liquid`)

| Section | Line (HEAD) | Element | Classes / attrs | Decision | Reason |
| --- | --- | --- | --- | --- | --- |
| **announcement-bar** | — | — | — | — | No section-level `h1`–`h6`, typography `p`/`div`, or `btn-*` candidates |
| **header** | — | — | — | — | Same (confirmed by grep) |
| **footer** | 30 | `h2` | `mb-6 heading-h2 pc:mb-10` | **convert** | Tier + escape classes; no Alpine |
| **footer** | 75 | `h3` | `heading-h2` | **convert** | Explicit tier matches primitive |
| **footer** | 80 | `div` | `rte rte--compact body-3xl` | **convert** | `rte: true`, `element: div` |
| **newsletter-overlay** | 79–96, 181–198 (×2 layouts) | `div` / `h2` | rte blocks + `id="dialog-title-*"` headings + `{{ block.shopify_attributes }}` | **convert** (4) | `attrs` carries `id` and editor attributes |
| **pickup-availability** | 48 | `p` | `mt-1 body-sm` | **convert** | Static copy |
| **pickup-availability** | 79 | `h3` | bare | **keep raw** | `base.css` element `h3` only; default `heading-h2` tier would change cascade (5-C3e1 P2) |
| **cart-overlay** | 49, 335 | `h1` | bare + `id="dialog-title-*"` | **keep raw** | Bare dialog title; primitive default tier would add `heading-h2` |
| **cart-overlay** | 99+ | `p` | `body-*` + `x-text` / in `<template>` | **keep raw** | Alpine / template rule |
| **cart-overlay** | 286, 293 | `a`/`button` | `btn-secondary` / `btn-primary` + `@click` `:disabled` | **keep raw** | Alpine + `button` adds `body-md` |
| **search-overlay** | 21, 232 | `h1` | bare + dialog `id` | **keep raw** | Same as cart dialog titles |
| **collection-navigation-items** | 16–18 | `a` | `body-md` on link | **keep raw** | Not `p`/`div`; primitive is wrong element |

**Totals:** **8 converted**, **all other candidates kept raw** (cart/search dialog titles, Alpine copy, buttons, bare `h3`, nav links).

#### Equivalence (converted elements)

| Location | HEAD | Now (primitive expansion) |
| --- | --- | --- |
| footer link column | `<h2 class="mb-6 heading-h2 pc:mb-10">…</h2>` | `<h2 class="heading-h2 mb-6 pc:mb-10">…</h2>` (`heading`, `motion_reveal: false`) |
| footer content | `<h3 class="heading-h2">…</h3>` | `<h3 class="heading-h2">…</h3>` |
| footer content | `<div class="rte rte--compact body-3xl">…</div>` | `<div class="rte rte--compact body-3xl">…</div>` |
| newsletter text block | `<div class="rte rte--compact mb-0 pc:mb-2 {{ tier }}" {{ block.shopify_attributes }}>` | `<div class="rte rte--compact mb-0 pc:mb-2 {{ tier }}" {{ block.shopify_attributes }}>` via `text` + `attrs` |
| newsletter heading block | `<h2 id="dialog-title-…" class="mb-0 pc:mb-3 {{ tier }}" {{ block.shopify_attributes }}>` | same via `heading` + `attrs` |
| pickup time | `<p class="mt-1 body-sm">…</p>` | `<p class="mt-1 body-sm">…</p>` |

No `data-motion-reveal` added on converted nodes (`motion_reveal: false` everywhere HEAD had none).

#### `attrs` parameter (E5)

Added optional `attrs` on `heading` and `text` (static only); documented in `abstraction-boundaries.md`.

```
git diff HEAD -- snippets/heading.liquid snippets/text.liquid
# only adds doc line + `{{ attrs }}` on opening tag
```

Existing renders omit `attrs`; Liquid outputs nothing when blank → byte-identical to HEAD for all prior call sites.

#### E3 counts (`HEAD` → `now`, patterns: `\bid=`, `aria-`, `shopify_attributes`, `\bx-[a-z]`, `@[a-z]`, `:[a-z]`)

All eight sections: **no change** per pattern (PowerShell loop over `git show HEAD:sections/<f>.liquid` vs working tree; only colon count in naive `:` scan differed due to Liquid `param: value` in new `{% render %}` lines).

#### E4–E6

```
git diff --stat HEAD -- config templates tailwind assets/base.css assets/*.js
(empty)

git diff --stat HEAD -- assets/tailwind.output.css
(empty)

npm.cmd run lint:theme
Theme architecture lint passed.

npm.cmd run test:theme-architecture
# pass 130 fail 0

npm.cmd run test:theme-check
147 files inspected with no offenses found.

npm.cmd run lint:liquid-syntax
Liquid syntax lint passed.

npm.cmd run scan:compat
Embedded compatibility lint passed.

npm.cmd run lint:i18n
i18n lint passed.

npm.cmd run lint:doc-paths
Doc path lint passed.

npm.cmd run doctor:agent
(exit 0)

npx prettier --check (changed files)
All matched files use Prettier code style!
```

#### Deferred browser checks

- Footer motion columns still reveal via parent `data-motion-reveal` (not on headings).
- Newsletter overlay: dialog `aria-labelledby` → `#dialog-title-*` after block render.
- Pickup drawer: bare `h3` store names vs `base.css` heading scale.

#### Remaining risks

- Class order differs on footer column `h2` (same utility set; verify if any selector depended on order — none known).
- `attrs` is unvalidated static HTML; misuse could break lint if Alpine were passed (documented forbidden).

### Coordinator review, round 1 (2026-10-03): no findings

Verified against the snippets' logic (`snippets/heading.liquid`, `snippets/text.liquid`: no default align class, tier first, then `class`):

- footer:
  - link-column heading → `<h2 class="heading-h2 mb-6 pc:mb-10">`;
  - content heading → `<h3 class="heading-h2">`;
  - content text → `<div class="rte rte--compact body-3xl">`;
  - all three are the same class sets as `HEAD` (order differs only), with no `data-motion-reveal`.
- newsletter-overlay (both layouts):
  - text → `<div class="rte rte--compact <tier> mb-0 pc:mb-2" {{ block.shopify_attributes }}>`;
  - heading → `<h2 class="<tier> mb-0 pc:mb-3" id="dialog-title-<popup_id>" {{ block.shopify_attributes }}>`;
  - `aria-labelledby="dialog-title-{{ popup_id }}"` is unchanged.
- pickup-availability: `<p class="body-sm mt-1">`.
- Counts `HEAD` → now (grep):
  - footer: `shopify_attributes` 1 → 1, `data-motion-reveal` 2 → 2;
  - newsletter-overlay: `shopify_attributes` 6 → 6, `id="dialog-title` 2 → 2 (the attribute now built in a capture), `data-motion-reveal` 0 → 0;
  - pickup-availability: `data-motion-reveal` 0 → 0.
- `attrs` prints after `motion_attrs`. Existing renders do not pass it, so they print an empty `{{ attrs }}`: whitespace only, the same attributes.
- Re-run:
  - `build:tw`: `assets/tailwind.output.css` has no diff against `HEAD`;
  - `lint:theme` passed;
  - `test:theme-check` 147 files, no offenses;
  - `lint:liquid-syntax` passed;
  - `lint:i18n` (both checks) passed.

### Independent review (Grok 4.7, 2026-10-03)

**Verdict: PASS.** No findings.

`git diff --stat HEAD` is 7 files, all inside the plan surface: `footer`, `newsletter-overlay`, `pickup-availability`, `heading`, `text`, `abstraction-boundaries.md`, and this record (307 insertions, 41 deletions). `git diff --stat HEAD -- config templates tailwind assets/base.css assets/*.js` is empty.

#### E1

HTML candidates (`h1`–`h6`, `p`/`div` whose class contains `heading-*`, `body-*`, `rte`, or `typo-subtitle`, and any `btn` / `btn-*`), HEAD → now:

| Section | HEAD | Now | Classification |
| --- | --- | --- | --- |
| announcement-bar | 0 | 0 | Nothing to convert. A search for `heading-`, `body-`, `rte`, `btn-` in the file is empty. |
| header | 0 | 0 | Same empty search. |
| footer | `h2.mb-6.heading-h2.pc:mb-10`, `h3.heading-h2`, `div.rte.rte--compact.body-3xl` | 0 raw tags (3 renders) | All three converted. |
| newsletter-overlay | two `div.rte.rte--compact…` and two `h2.mb-0.pc:mb-3…` | 0 raw tags (4 renders) | All four converted. |
| pickup-availability | `p.mt-1.body-sm`, bare `h3` | bare `h3` only | The `p` is converted. The `h3` stays raw: a bare element, and `heading`'s default tier is `heading-h2`. |
| cart-overlay | 10, unchanged | 10 | Kept raw. Both `h1`s are bare `id="dialog-title-{{ popup_id }}"` dialog titles. The `p`/`div` nodes sit in `<template>` and/or carry `x-text` (`<template x-for="item in items">` at line 80, discount templates at 257 and 271). The view-cart `<a class="btn-secondary …">` has an icon child and no `body-md`; `button` would add `body-md`. The checkout `<button class="btn-primary w-full">` has `@click` and `:disabled`. |
| search-overlay | two bare `h1 id="dialog-title-{{ popup_id }}"` | same | Kept raw. Dialog titles; `aria-labelledby="dialog-title-{{ popup_id }}"` is on the preview dialog. |
| collection-navigation-items | 0 of the candidate kinds | 0 | The `<a class="block py-2 body-md …">` is not a `p`/`div` and not a `btn-*`. Left raw. |

The executor's table matches this set. No conversion adds a tier, `rte--compact`, or `data-motion-reveal` that HEAD lacked.

#### E2

Primitive expansion (`motion_reveal: false` on every converted call, so no `data-motion-reveal`). Class tokens, order ignored:

| Call | Tag | Class tokens | Attributes |
| --- | --- | --- | --- |
| footer link column | `h2` | `heading-h2`, `mb-6`, `pc:mb-10` | none beyond `class`. HEAD was the same set. Content is `block.settings.heading`, as HEAD. |
| footer content heading | `h3` | `heading-h2` | same as HEAD. Content `section.settings.content_heading`. |
| footer content text | `div` | `rte`, `rte--compact`, `body-3xl` | `rte: true` adds `rte--compact`, which HEAD already had. Content `section.settings.content_text`. |
| newsletter text, both layouts | `div` | `rte`, `rte--compact`, `overlay_text_class`, `mb-0`, `pc:mb-2` | `attrs` is `{{ block.shopify_attributes }}` via `echo`. HEAD class string was `rte rte--compact mb-0 pc:mb-2 {{ overlay_text_class }}`. |
| newsletter heading, both layouts | `h2` | `overlay_heading_class`, `mb-0`, `pc:mb-3` | `attrs` echoes `id="dialog-title-` + `popup_id` + `"` and then `block.shopify_attributes`. HEAD had `id="dialog-title-{{ popup_id }}"` and the same editor attribute. |
| pickup time | `p` (default element) | `body-sm`, `mt-1` | HEAD was `mt-1 body-sm`. Content `closest_location.pick_up_time`. |

`data-motion-reveal` counts are unchanged in all eight files (footer 2 → 2, newsletter 0 → 0, pickup 0 → 0).

Preview layout: `aria-labelledby="dialog-title-{{ popup_id }}"` is still on the section dialog (line 41). Live layout: `ui-dialog` still sets `aria-labelledby="dialog-title-{{ id | escape }}"` and the section still passes `id: popup_id`. Both heading ids are built from that same `popup_id`.

#### E3

Patterns `\bid=`, `aria-`, `shopify_attributes`, `\bx-[a-z]`, `@[a-z]`, `:[a-z]`, HEAD → now:

| Section | id | aria- | shopify_attributes | x- | @ | : |
| --- | --- | --- | --- | --- | --- | --- |
| announcement-bar | 3 → 3 | 2 → 2 | 1 → 1 | 1 → 1 | 0 → 0 | 21 → 21 |
| header | 6 → 6 | 4 → 4 | 0 → 0 | 7 → 7 | 10 → 10 | 49 → 49 |
| footer | 3 → 3 | 0 → 0 | 1 → 1 | 2 → 2 | 2 → 2 | 45 → 45 |
| cart-overlay | 6 → 6 | 9 → 9 | 0 → 0 | 44 → 44 | 6 → 6 | 33 → 33 |
| search-overlay | 12 → 12 | 13 → 13 | 0 → 0 | 26 → 26 | 12 → 12 | 37 → 37 |
| newsletter-overlay | 7 → 7 | 6 → 6 | 6 → 6 | 1 → 1 | 1 → 1 | 84 → 84 |
| pickup-availability | 0 → 0 | 1 → 1 | 0 → 0 | 0 → 0 | 1 → 1 | 4 → 4 |
| collection-navigation-items | 0 → 0 | 1 → 1 | 0 → 0 | 0 → 0 | 0 → 0 | 1 → 1 |

Schemas are byte-identical for all eight (lengths 2847, 5582, 3716, 1021, 1309, 9272, 135, 63).

#### E4

`npm.cmd run build:tw` (Tailwind CSS v4.1.18, done in 139ms). `git diff --stat HEAD -- assets/tailwind.output.css` is empty after that build and again after `scan:compat`'s rebuild.

#### E5

`attrs` is printed as `{{ attrs }}` after `motion_attrs` on both snippets. The doc comments forbid `data-module-id`, `x-*`, `@*`, and `:*`, and allow static attributes such as `id` and `{{ block.shopify_attributes }}`. `abstraction-boundaries.md` lists `attrs` on `heading` and `text` and says it is static root attributes only (`id`, block editor attributes), with the text row using the same restriction.

`attrs:` appears only on the four newsletter renders. The other 46 `heading` / `text` renders do not pass it, so the parameter is blank and adds no attribute. They are in `404` (2), `about-stats` (2), `before-after-comparison` (2), `blog-stories` (2), `brand-statement` (1), `cart` (1), `category-grid` (2), `collections` (2), `newsletter-banner` (2), `page` (2), `philosophy-section` (5), `product-comparison-table` (1), `promo-bannder` (4), `promise-section` (2), `promotion-countdown` (2), `routine-showcase` (3), `scroll-categories` (1), `slides-show` (4), and `snippets/product-recommendations-section.liquid` (6).

#### E6

| Command | Tail |
| --- | --- |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-architecture` | `# tests 130` / `# pass 130` / `# fail 0` |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run lint:liquid-syntax` | Liquid syntax lint passed. |
| `npm.cmd run scan:compat` | Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks). |
| `npm.cmd run lint:i18n` | i18n lint passed. Unused locale key lint passed. |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run doctor:agent` | exit 0 |
| `npx prettier --check` on the changed files | All matched files use Prettier code style! |

