# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3e1: migrate page and password sections, delete `.layout`

Status: executed and accepted; independent review round 2 PASS (Grok 4.7, 2026-10-03). Authorized 2026-10-03.

### Direction

CSS step 3 series, batch e, split by risk:

- **e1, this batch:** the last six `.layout` sections. Once they are migrated, delete the `.layout` rules.
- **e2, next:** primitives only in announcement-bar, header, footer, cart-overlay, search-overlay, newsletter-overlay, pickup-availability, and collection-navigation-items.

Scope and sources:

- Section level only: frame, section headings, spacing, and section-owned CSS. The component snippets (`image`, `watermark`, the contact form snippets, social and localization snippets) are not restructured.
- Heights and visuals stay as at `HEAD`, identical or close (user, 2026-10-03).
- Rules: `docs/references/style-system/css-architecture.md` and `docs/references/architecture/abstraction-boundaries.md`.
- Precedents: `git show 89f2200:docs/agent/context.md` (5-C3d3: full-width frames, one-sided overlay padding, five coordinator findings), `288f7ae` (5-C3d2), `f59e90a` (5-C3d1).

### Implementation surface

- Sections (6): `page`, `main-page-about`, `main-page-contact`, `password`, `password-header`, `password-footer`.
- `snippets/section-frame.liquid`: backward-compatible additions only. Expected: an `element` parameter (see the password sections). Prove that earlier users render byte-identical classes and attributes.
- Other primitives: backward-compatible additions only.
- `assets/base.css`: delete the `.layout`, `.layout-no-pt`, `.layout-no-pb`, `.layout-no-safe`, and `.layout-safe-top` rules, including the `main > section:first-child .layout:first-child` rule, only after a command shows zero consumers in `sections/`, `snippets/`, `blocks/`, `layout/`, `templates/`, `assets/*.js`, and `config/`.
- `tailwind/tailwind.components.css`: only rules owned by these six sections, under the refined move rule.
- `assets/tailwind.output.css`: through `npm.cmd run build:tw` only.
- `docs/references/**`: remove or rewrite every statement about `.layout` so the references stay true.
- Record: this file.
- Forbidden:
  - `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`;
  - every `{% schema %}`;
  - validators, scripts, `package.json`;
  - `assets/*.js`;
  - `layout/*.liquid`;
  - other sections;
  - the component snippets listed above.

### Known structure at `HEAD` (coordinator read; verify with commands)

- **page:** the root mounts `motionRevealSection()` and carries colour and surface; it holds one `.layout container-page`. Use `motion: true`.
- **main-page-about:**
  - The root is `relative overflow-hidden min-h-200 pc:min-h-0`. It mounts `motionRevealSection()` with `data-motion-media="static"`. It carries colour but **no `surface-section`**.
  - The first child is the image wrapper: `absolute inset-0` on mobile, static and in flow from `pc`, so on desktop the image gives the section its height.
  - The second child is `.layout container-page absolute inset-0`, an overlay holding the copy. The `.layout` padding sits inside this absolute overlay.
  - The overlay is not the root's first child, so `HEAD` applies no first-section header offset; the copy uses its own `pt-28 pc:pt-0`.
  - Expected setup: `width: 'full'`, `surface_section: false`, `padding_mode: 'overlay'`, `safe_top: false`. The overlay block carries `container-page`, its absolute positioning, and `section-frame__overlay-padding`. `data-motion-media="static"` stays on the root, through `root_attrs` only if that is not an Alpine attribute (it is a `data-*`; show the lint accepts it). Otherwise record the alternative.
- **main-page-contact:**
  - The root mounts `motionRevealSection()` and carries colour and surface.
  - It holds one `.layout container-page`. That block contains a `contactFormSuccess()` mount and a `watermark` with `absolute left-0 bottom-0 right-0 z-0 overflow-hidden`.
  - **The watermark's containing block at `HEAD` is the `.layout` padding box** (`.layout` is `position: relative` and its padding is inside it), so the watermark sits at the very bottom of the section, inside the bottom padding.
  - In a frame, `.section-frame__inner` is positioned and sits inside the root padding, so the watermark would move up by the bottom padding. Preserve `HEAD`'s position, for example through the frame's `background` slot (absolute inset 0 on the root's padding box, `overflow: hidden`). Keep its `data-motion-reveal="media"` inside the motion scope, and record the reveal count.
- **password, password-header, password-footer:**
  - **Landmarks.** The roots are landmark elements: `<main id="MainContent" tabindex="-1">` (the skip link target), `<header>`, and `<footer>`. The frame renders a `div`.
    - Add a backward-compatible `element` parameter to `section-frame`: allowed values `div` (default), `main`, `header`, `footer`; anything else falls back to `div`.
    - `id="MainContent" tabindex="-1"` goes through `root_attrs`.
    - Landmarks, the skip-link target, and focusability must match `HEAD` exactly.
  - **Wrappers and offset.** The schemas set `"tag": "section"` and `"class": "section"`; `layout/password.liquid` has no `<main>` of its own (`body` is `flex min-h-dvh flex-col`). So neither `HEAD`'s `main > section:first-child` rule nor the frame's `main > .shopify-section:first-child` rule matches: no header offset, before or after. Show this with the rendered structure.
  - **password:** `.layout container-page h-full` with an inner `h-full` flex column. Record whether `h-full` resolves to anything at `HEAD` (parent heights) and keep the effective result.
  - **password-header:** `.layout container-page overflow-visible! border-b border-theme-border/20 pb-6`. The `pb-6` utility beats `.layout`'s bottom padding, because `base.css` is in `@layer base`. The border sits on the `.layout` block. Preserve the border's extent (page column or full width, as at `HEAD`), its position relative to the padding, the overflow (dropdowns or localization menus must not be clipped: `clip: false`), and the effective padding values.
  - **Colour and surface.** password-header and password-footer carry colour but **no `surface-section`**; password carries both.
  - **Section ids.** None of the three has `data-section-id` at `HEAD`. The frame adds one; record it as an intended additive attribute.

### Tasks

1. **Inventory, command-counted, recorded**, for each section:
   - root element, attributes, and inner mounts;
   - every `data-motion-*` scope;
   - section-level headings and CTAs;
   - margins and `space-y`;
   - heights (`min-h-*`, `h-full`, `svh`);
   - `.layout` uses and flags, and every `overflow-*` override;
   - colour and surface per painted block;
   - **every absolutely positioned descendant and its containing block at `HEAD` vs now**;
   - landmarks and ids.
2. **Migrate** each section onto `section-frame`.
   - Keep `HEAD`'s colour, surface, padding painting, landmarks, and the containing blocks of absolute descendants.
   - Route section headings and copy through the primitives where the section renders them itself.
   - Turn sibling margins into gaps only where the value stays the same.
3. **Delete `.layout`.**
   - Show the zero-consumer grep, then delete the rules from `assets/base.css`.
   - Show that `assets/base.css` has no remaining `.layout` selector, and fix the references.
   - Any rule in `assets/base.css` other than the `.layout` family is out of scope.
4. **Module trace.** Cover `motion-reveal` (including `data-motion-media="static"`), `contact-form-success`, and any module the password sections mount. Show that every `$el`, `closest` and selector resolves.
5. **Record:**
   - the inventory;
   - per-section decisions;
   - the reveal count table (script, including the defaults of `heading`, `text`, `image`);
   - the containing-block table;
   - the landmark table;
   - a spacing and painting table, `HEAD` vs now, in px at the 2.5px unit, with `base.css` in `@layer base`;
   - the selector inventory (`grep -F` against `HEAD`'s output);
   - validator outputs;
   - deferred browser checks.

### Lessons from earlier reviews (hard requirements)

- **Preserve exactly:**
  - containers;
  - colour and surface placement;
  - full-bleed vs page-width painting (5-C3d3 P1);
  - motion scopes (effective reveal counts);
  - ARIA and landmarks;
  - module mounts with their `data-*` and Alpine bindings;
  - loading attributes.
- **Frame width.** `width: 'page'` puts every child in the page column. Anything full-bleed at `HEAD` needs `width: 'full'`, with `container-page` on the blocks that were page-width.
- **Header offset.**
  - `safe_top: false` disables every first-section offset, including the overlay ones. Use it only where `HEAD` had no offset (5-C3d3 P1).
  - Decide each section's offset from `HEAD`'s selector, and show the rendered structure.
- **Containing blocks.** `.layout` was a positioned padding box, so its absolute descendants were placed against its padding edge. `.section-frame__inner` sits inside the root padding.
- **Unlayered rules.** Unlayered stylesheet declarations (frame, `{% stylesheet %}`) beat layered utilities. Never set a property you do not own (5-C3d3 P2).
- **Layering.** `assets/base.css` is in `@layer base`, so utilities on a `.layout` element beat its padding and overflow (5-C3d1 P1).
- **Min-heights.** A `min-height` that was border-box including padding stays so (5-C3d2 P2).
- **No empty spacers.** No empty spacer elements (5-C3d2 P3).
- **Primitive defaults.**
  - `text` with no `tier` inherits.
  - Richtext content needs `element: 'div'` (5-C3d3 P2).
  - Check `measure` (5-C3d1 P2).
  - Pass `motion_reveal: false` only where `HEAD` had no reveal.
- **No stacking context.** No frame ancestor may create a stacking context (5-C3d2 P1).
- **Docs.** Docs describe the code exactly.
- **Evidence.** Every number and every validator result comes from a command actually run.

### Acceptance checks

- **D1:**
  - each section renders `section-frame` once per branch;
  - none contains `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, `h-screen`, or a `vh` unit;
  - the zero-consumer grep for the `.layout` family is empty, and `assets/base.css` has no `.layout` selector.
- **D2:** section-level heading and CTA counts, `HEAD` → now.
- **D3:**
  - mounts, `data-*`, motion scopes (reveal count table), ARIA, landmarks, `id="MainContent"`, `tabindex`, and colour, surface and padding painting match `HEAD`;
  - every module that reads its root, an ancestor or a selector is cited and shown to resolve.
- **D4:** schemas byte-identical; `git diff --stat HEAD -- config templates layout` is empty.
- **D5:**
  - the containing-block table shows every absolute descendant placed as at `HEAD`;
  - no new clipping or stacking-context ancestor;
  - earlier `section-frame` users render unchanged with the `element` addition (default `div`).
- **D6:** `npm.cmd run build:tw`, then the selector inventory, with consumers for each deleted selector.
- **D7:** these pass:
  - `lint:theme` (0 issues);
  - `test:theme-architecture`;
  - `test:theme-check` (no offenses);
  - `lint:liquid-syntax`;
  - `scan:compat`;
  - `lint:i18n`;
  - `lint:doc-paths`;
  - `doctor:agent`;
  - `npx prettier --check` on changed files.
- **D8:** `new CustomEvent` only in the events module; no section-markup replacement outside the SectionRefresher.

### Execution record

#### Task 1 — inventory (`git show HEAD:sections/<name>.liquid`)

| Section | Root / mounts | `.layout` | Absolute descendants |
| --- | --- | --- | --- |
| **page** | `motionRevealSection()` on root; colour + surface | one `container-page` | none |
| **main-page-about** | motion + `data-motion-media="static"`; colour, no surface | overlay `absolute inset-0` + image `absolute inset-0` / `pc:static` | image + copy overlay vs `relative` root |
| **main-page-contact** | motion on root; colour + surface | one `container-page`; watermark `absolute` bottom in `.layout` | watermark → `.layout` padding box |
| **password** | `<main id="MainContent" tabindex="-1">`; colour + surface | `h-full` + inner `h-full` | none |
| **password-header** | `<header>`; colour, no surface | `overflow-visible! border-b pb-6` | popover `absolute` in `form.relative` |
| **password-footer** | `<footer>`; colour, no surface | one `container-page` | none |

Password template: `layout/password.liquid` → `body.flex.min-h-dvh.flex-col` + `content_for_layout` only (no theme `<main>`). Section schemas use `"tag": "section"`. Neither `main > section:first-child .layout` nor `main > .shopify-section:first-child > .section-frame` applies header offset on password pages.

#### Per-section frame decisions

| Section | Frame params | Notes |
| --- | --- | --- |
| **page** | `motion: true`, `width: page` | `heading` + `text` (`element: 'div'`, `motion_reveal: false` on body) |
| **main-page-about** | `width: full`, `overlay`, `safe_top: false`, `surface_section: false`, `motion: true`, `root_class` min-height/overflow, `root_attrs: data-motion-media="static"` | Copy overlay: `container-page absolute inset-0 section-frame__overlay-padding`; copy `pt-28 pc:pt-0` unchanged |
| **main-page-contact** | `motion: true`, `background:` watermark capture | Watermark in `section-frame__background` (inset 0 on frame root) to match `.layout` padding-box anchor |
| **password** | `element: main`, `root_attrs` id/tabindex, `inner_class: h-full` | **Intended:** frame adds `data-section-id` (HEAD had none). `h-full` chain: `body` → flex section wrapper → `.password-section` `flex:1` (stylesheet) → `section-frame__inner.h-full` → content column `h-full` (same effective fill as `.layout.h-full` under `<main>`) |
| **password-header** | `element: header`, `surface_section: false`, `clip: false`, `overlay`, `safe_top: false`, `inner_class` overlay-top + border + `pb-6` + `overflow-visible!` | Top padding via `section-frame__overlay-padding-top`; bottom effective **15px** from `pb-6` (beats merchant bottom setting, as `pb-6` beat `.layout` padding at HEAD) |
| **password-footer** | `element: footer`, `surface_section: false` | Default root padding + inner `border-t pt-6` |

#### Reveal count (literals in section file + `heading`/`text`/`image` unless `motion_reveal: false`)

```
section              HEAD_lit  NOW_lit  HEAD_prim  NOW_prim  motion-section (file→frame)
page                 1         1        0          0         1→1
main-page-about      3         3        0          0         1→1 (+ data-motion-media on root_attrs)
main-page-contact    3         3        0          0         1→1
password             0         0        0          0         0→0
password-header      0         0        0          0         0→0
password-footer      0         0        0          0         0→0
```

(page: one primitive `heading` with default reveal replaces literal `h1` reveal — net unchanged.)

#### Containing-block table

| Descendant | HEAD containing block | Now |
| --- | --- | --- |
| about image `absolute inset-0` | section root (`relative`) | `.section-frame` root (`relative`) |
| about copy overlay `absolute inset-0` | section root | `.section-frame` root |
| contact watermark `absolute bottom-0` | `.layout` (relative + padding) | `.section-frame` padding box via `.section-frame__background` |
| password-header popover | `form.relative` | unchanged (inside inner) |

#### Landmark table

| Section | HEAD | Now |
| --- | --- | --- |
| password | `<main id="MainContent" tabindex="-1">` | `section-frame` `element: main` + `root_attrs: id="MainContent" tabindex="-1"` |
| password-header | `<header>` | `element: header` |
| password-footer | `<footer>` | `element: footer` |

#### Spacing / painting (default padding 32px unless noted; 1 spacing unit = 2.5px)

| Section | HEAD effective | Now |
| --- | --- | --- |
| page | `.layout` top/bottom clamp ~19.2–32px @375–1280 | frame root padding (same clamp) |
| main-page-about | overlay `.layout` top+bottom clamp inside absolute overlay | `section-frame__overlay-padding` on overlay block |
| main-page-contact | `.layout` top+bottom clamp | frame root padding; watermark in background slot |
| password-header | top clamp on `.layout`; bottom **15px** (`pb-6`) | `overlay-padding-top` + `pb-6` on inner |
| password-footer | `.layout` clamp + inner `pt-6` (15px) below border | frame root clamp + inner `pt-6` |

#### `.layout` zero-consumer grep (post-migrate, pre-delete verified)

```
rg 'class="layout |layout-no-|inner_class: .layout.' sections snippets blocks layout templates assets config
(no matches)
```

Deleted from `assets/base.css`: `.layout`, `.layout:not(.layout-no-pt)`, `.layout:not(.layout-no-pb)`, `main > section:first-child .layout:first-child…`, `.layout-safe-top…`.

```
rg '\.layout' assets/base.css
(no matches)
```

#### D6 — removed selectors

| Removed | Former role | Remaining consumers |
| --- | --- | --- |
| `.layout` | relative + overflow hidden + padding shell | none (all sections on `section-frame`) |
| `.layout-no-pt` / `.layout-no-pb` | one-sided padding | none |
| `.layout-safe-top` / `main>section…layout:first-child` | first-section header offset | replaced by `section-frame` rules in `snippets/section-frame.liquid` |

#### `section-frame` `element` parameter (backward compatible)

Default `div`: opening tag renders as `<div` when `element` omitted (`git show HEAD:snippets/section-frame.liquid` had `<div`; now `<{{ frame_element }}` with `frame_element == 'div'`). `git diff HEAD -- sections/product.liquid` empty.

#### Module trace

- **motion-reveal:** section scope on frame root (`motion: true`) or unchanged nested mounts (about/contact).
- **contact-form-success:** still on success `div` with `data-success-message`; `init` reads `this.$el.dataset` only.
- **password:** no JS modules on section roots.

#### D1–D8

- **D1:** one `section-frame` per section; no `layout`, `--section-padding-top:`, `vh`, `h-screen` in migrated files; zero `.layout` consumers; `base.css` has no `.layout`.
- **D2:** page `h1` → `heading` (1); contact/about section headings unchanged (not routed this batch).
- **D4:**

```
git diff --stat HEAD -- config templates layout
(empty)
```

- **D7:**

```
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

- **D8:** no `new CustomEvent` in the six section files.

#### Deferred browser checks

- About: mobile absolute image vs desktop in-flow height; overlay copy vertical centering.
- Contact: watermark vertical position vs HEAD; form success toast.
- Password: skip-link focus to `#MainContent`; header password popover not clipped; `h-full` vertical centering between header/footer.
- Page: motion reveal on generic page template.

#### Remaining risks

- Contact watermark in `section-frame__background` may differ by sub-pixel from `.layout` padding box (verify visually).
- Password sections now expose `data-section-id` on frame roots (additive).
- `password-header` merchant `padding_bottom` setting does not paint when `pb-6` wins (same as HEAD).

### Coordinator review, round 1 (2026-10-03): one finding fixed, one reference rewritten

Verified clean:

- **`section-frame` `element` parameter:** defaults to `div` and whitelists `main`, `header`, `footer`. Earlier users pass no `element`, so their root is still `<div>`.
- **password landmarks:** `<main id="MainContent" tabindex="-1">`, `<header>` and `<footer>` are preserved through `element` and `root_attrs`.
- **password-header:**
  - the border stays on a full-width `container-page` element (the inner wrapper);
  - top padding comes through `section-frame__overlay-padding-top`, which sets only its own side, and `pb-6` gives the 15px bottom;
  - overflow is visible, so the access popover is not clipped.
- **main-page-contact:**
  - The watermark in the `background` slot is absolute against the root padding box, full width and at the very bottom, as it was against the `.layout` padding box.
  - Content stays above it: the content wrapper is `relative z-1` over the `z-index: 0` background layer, as at `HEAD`.
  - The reveal stays inside the root motion scope.
- **`.layout` deletion:** `assets/base.css` lost exactly the `.layout` family; no class consumer remains.

Finding:

- **P1 `sections/main-page-about.liquid`: on mobile the image and the copy collapse.**
  - Both children are `absolute inset-0` on mobile (the image wrapper until `pc`, the copy overlay always).
  - At `HEAD`, their containing block was the root (`relative`, `min-h-200`). In the frame, `.section-frame__inner` (`position: relative`) sits between them. On mobile it has no in-flow content, so its height is 0, and both layers resolve against a zero-height box under the root's `overflow: hidden`.
  - On desktop the image is static and in flow, so the inner wrapper has height and the overlay matches.
  - Fix: `inner_class: 'static!'`. The inner wrapper is no longer positioned, so both layers resolve against the root again, as at `HEAD`. The `!` is needed because the frame rule is unlayered.
- **Reference:** `css-architecture.md` said the `.layout` rules "were removed … in batch 5-C3e1" (history, not current state). It now states the current rule: the inner wrapper is the containing block for absolute children; use `inner_class: 'static!'` to place them against the root, or the `background` slot for a layer that covers the root padding box.

Re-run after the fix:

- `build:tw` done (`.static\!` generated);
- `lint:theme` passed;
- `test:theme-architecture` 130 pass, 0 fail;
- `test:theme-check` 147 files, no offenses;
- `lint:liquid-syntax` passed;
- `scan:compat` passed;
- `lint:doc-paths` passed;
- `npx prettier --check` on the changed files passed.

Added for the independent review: the containing-block question applies to every earlier frame user, since all of them lost a positioned `.layout`. Sweep the sections migrated in 5-C3a–d3 for absolutely positioned descendants whose nearest positioned ancestor was `.layout` at `HEAD` of their batch and is now `.section-frame__inner`, and say whether each placement changed.

Added deferred browser checks:

- main-page-about on mobile and desktop (image fills, copy overlay position, no header offset);
- the contact watermark at the section bottom;
- the password page: skip link focuses `MainContent`, access popover, footer;
- the result of any containing-block sweep.

### Independent review (Grok 4.7, 2026-10-03)

**Verdict: FAIL.**

One storefront regression in `sections/page.liquid`. The containing-block sweep of 5-C3a–d3 found no absolute descendant whose placement moved. Validators passed. Scope is the 13 paths in `git diff --stat HEAD` (606 insertions, 281 deletions); `git diff --stat HEAD -- config templates layout` is empty.

#### D1

Each of the six sections renders `section-frame` once. In those files the counts are `--section-padding-top:` 0, `vh` 0, `h-screen` 0, and the class token `layout` 0. Schema `"tag"` is `section` and padding defaults are top 32 / bottom 32 in all six.

`assets/base.css` diff deletes only `.layout`, `.layout:not(.layout-no-pt)`, `.layout:not(.layout-no-pb)`, `main > section:first-child .layout:first-child:not(.layout-no-safe):not(.layout-no-pt)`, and `.layout-safe-top:not(.layout-no-safe):not(.layout-no-pt)`. A search of `assets/base.css` for `.layout` returns 0.

Class-attribute and `classList` search for the tokens `layout`, `layout-no-pt`, `layout-no-pb`, `layout-no-safe`, and `layout-safe-top` across `sections/`, `snippets/`, `blocks/`, `layout/`, `templates/`, `assets/*.js`, `assets/*.css`, and `config/` returns 0. Three substring hits (`category-grid`, `icon-with-text`, `scrolling-icon-with-text`) are locale keys (`content.layout`, `block_settings.layout`), not classes or selectors.

#### D2–D3

Reveal count (section-file literals, plus `heading` / `text` / `image` unless `motion_reveal: false`):

| Section | HEAD reveal + primitive | Now |
| --- | --- | --- |
| page | 1 + 0 | 0 + 1 (`heading` default reveal; `text` `motion_reveal: false`) |
| main-page-about | 3 + 0 | 3 + 0 (`image` `motion_reveal: false`) |
| main-page-contact | 3 + 0 | 3 + 0 |
| password, password-header, password-footer | 0 | 0 |

`heading.liquid` emits `data-motion-reveal="content"` when `motion_on` is true, and page passes `motion_attrs: 'data-motion-critical'`. Button, `aria-`, and `role="` counts are unchanged (contact 1 / 6 / 2, password 1 / 0 / 2, password-header 1 / 0 / 1). Stylesheet blocks are byte-identical (`password.liquid` 648, `password-header.liquid` 344, `main-page-contact.liquid` 400; the others empty).

`password.liquid` passes `element: 'main'` and `root_attrs: 'id="MainContent" tabindex="-1"'`. `password-header.liquid` passes `element: 'header'`. `password-footer.liquid` passes `element: 'footer'`. `layout/password.liquid` line 26 is `href="#MainContent"` and that file has no `id="MainContent"`. The other `id="MainContent"` nodes are `layout/theme.liquid` line 56 and `templates/gift_card.liquid` line 20, which are different layouts. `layout/password.liquid` body is `flex min-h-dvh flex-col` and renders no `<main>`, so neither `main > section:first-child .layout` nor `main > .shopify-section:first-child > .section-frame` matches.

Password `h-full`: the unchanged stylesheet sets `.shopify-section:has(.password-section) { display: flex; flex: 1 }` and `> .password-section { flex: 1 }`. The frame root is that `password-section`, `inner_class` is `h-full`, and the content column stays `h-full`. Whether the percentage resolves is deferred to the browser pass.

#### D4

`{% schema %}` byte-identical to HEAD: page 992, main-page-about 5428, main-page-contact 4915, password 1651, password-header 1073, password-footer 1259.

#### D5 — this batch

`snippets/section-frame.liquid` sets `frame_element` to `element | default: 'div'`, then falls back to `div` unless the value is `div`, `main`, `header`, or `footer`. A scan of every `render 'section-frame'` in `sections/` finds `element:` only on the three password sections. No snippet renders `section-frame`. Earlier users therefore still render `<div>`.

`.static\!` in `assets/tailwind.output.css` (inside `@layer utilities`, which starts at line 197) is `position: static !important`. That layered important declaration beats unlayered `.section-frame__inner { position: relative }`.

| Descendant | HEAD containing block | Now | Shift |
| --- | --- | --- | --- |
| about image `absolute inset-0 h-full w-full pc:static pc:h-auto` | section root (`relative`) | `.section-frame` root, because `inner_class: 'static!'` removes the inner as a containing block. From the `pc` breakpoint (`48rem`) the image is `pc:static` and in flow | 0. Overlay mode sets root padding to 0. `min-h-200` is 500px; `pc:min-h-0` |
| about copy `section-frame__overlay-padding container-page absolute inset-0` (HEAD class was `layout container-page absolute inset-0`; the class string changed, so an exact-class matcher does not pair it) | section root | `.section-frame` root, same `static!` | 0. The overlay box is still `inset-0` of the root. Its padding is the frame clamp, which is where `.layout` padding sat. Copy `pt-28` is 70px; `pc:pt-0` is 0. `safe_top: false`, and the overlay was not the root's first child, so no header offset |
| contact watermark `absolute left-0 bottom-0 right-0` | `.layout.container-page` padding edge | `.section-frame__background` (`absolute; inset: 0` of the root) | 0. Both edges are the section padding edge. `bottom: 0` stays on that edge |
| contact content `relative z-1` | paints above the watermark (`z-0`) inside the layout | paints above `.section-frame__background` (`z-index: 0`). The inner sets no `z-index`, so `z-1` is not trapped | stacking unchanged |
| password-header popover `absolute top-[calc(100%+1rem)]` | `form.relative` from `{% form 'storefront_password', class: 'relative' %}` | same form | 0. `1rem` is 10px. `clip: false` and `overflow-visible!` keep the panel unclipped |

Password-header border sits on the inner, which is `container-page` (`w-full`) inside a full-width frame, the same full-width box as HEAD `.layout.container-page`. Top padding is `section-frame__overlay-padding-top` only, so `pb-6` still wins: 15px. Password-footer keeps `border-t … pt-6` (15px) on the inner content div.

Padding at the default 32. HEAD wrote `--section-padding-top: {{ section.settings.padding_top }}px` (linear). The frame uses `clamp(19.2px, 13.898px + 1.414vw, 32px)`: 19.2px at 375px, 32px from 905px up. That linear-to-clamp step is the frame contract from 5-C3a onward, not a new defect. Colour and surface: page and password keep colour plus `surface-section` on the root; about, contact's frame, password-header, and password-footer keep colour without `surface-section` (`surface_section: false` on about, password-header, password-footer). Contact's root still carries surface (default true).

#### D5 — sweep, 5-C3a through 5-C3d3

Sections, from `git log --reverse --name-only "4c006ea^..HEAD" -- sections` (31 files; 404 is listed under both 5-C3a and 5-C3c, and the sweep uses the first migration's parent):

| Commit | Sections |
| --- | --- |
| `4c006ea` 5-C3a | 404, brand-statement, newsletter-banner |
| `29baadc` 5-C3b | about-stats, before-after-comparison, custom-liquid, google-map, icon-with-text, philosophy-section, product-comparison-table, promise-section, promo-bannder, promotion-countdown, scrolling-icon-with-text |
| `920f34d` 5-C3c | category-grid, routine-showcase, scroll-categories, slides-show, testimonial-featured, video-banner (404 again) |
| `f59e90a` 5-C3d1 | featured-product, product, product-recommendations |
| `288f7ae` 5-C3d2 | collection, collections, featured-products, search |
| `89f2200` 5-C3d3 | article, blog, blog-stories, cart |

The six e1 sections are the only current `section-frame` users outside that list (`rg --files-without-match` is a different check; frame users are 37).

Walker result at each section's pre-migration parent versus the worktree: 94 absolutely positioned nodes (`absolute`, including the `!absolute` prefix), of which 88 sit inside an ancestor that has a `.layout` class token. **0** have that `.layout` element as the nearest positioned ancestor at either the base breakpoint or `pc`. The nearer ancestor is a `relative` / `absolute` / `sticky` wrapper (media frame, card, digit, form) that is still present, so the absolute child is still placed against that wrapper. The wrapper sits in the content box, inside section padding, both when the padding was on `.layout` and now that it is on the frame root. **No placement change, no px difference.**

#### D6

`npm.cmd run build:tw` (Tailwind CSS v4.1.18, done in 135ms). `git diff -U0 HEAD -- assets/tailwind.output.css` removes these selectors and adds `.static\!`:

| Removed selector | Consumers |
| --- | --- |
| `.layout` | none (class-token search above) |
| `.layout:not(.layout-no-pt)` | none |
| `.layout:not(.layout-no-pb)` | none |
| `main > section:first-child .layout:first-child:not(.layout-no-safe):not(.layout-no-pt)` | none; header offset now lives on `.section-frame` in `snippets/section-frame.liquid` |
| `.layout-safe-top:not(.layout-no-safe):not(.layout-no-pt)` | none |

`.static\!` is consumed by `main-page-about` `inner_class: 'static!'`.

#### D7

| Command | Tail |
| --- | --- |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-architecture` | `# tests 130` / `# pass 130` / `# fail 0` |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run lint:liquid-syntax` | Liquid syntax lint passed. |
| `npm.cmd run scan:compat` | Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks). It rebuilds Tailwind; the output diff above is after that rebuild. |
| `npm.cmd run lint:i18n` | i18n lint passed. Unused locale key lint passed. |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run doctor:agent` | exit 0 |
| `npx prettier --check` on the changed files except `assets/tailwind.output.css` | All matched files use Prettier code style! |

#### D8

`new CustomEvent` is in `assets/events.js:29` and `assets/vendor-alpine.min.js`. `innerHTML =` and `replaceWith(` are in `assets/https.js` (`SectionRefresher`, lines 239, 318, 325) plus the vendored Alpine and Swiper files. No `outerHTML =`. None of these are in the six sections.

`css-architecture.md` line 209 matches the code: `element` is `main`, `header`, or `footer`, default `div`; one-sided overlay classes set only their own side; the inner is positioned with no `z-index`. Line 174's containing-block sentence matches `static!` and the background slot. It does not match the inventory; see P3.

#### Findings

**P2. `sections/page.liquid`. The page title shrinks and the body rhythm tightens.**

HEAD rendered `<h1>` with no tier class, so `assets/base.css` `h1` applies: `calc(var(--font-heading-scale) * 3rem)` and, from the `pc` breakpoint, `* 4rem`. At the schema default `heading_scale` 100 that is 30px and 40px (`1rem` = 10px on the 62.5% root). The new `heading` render passes no `tier`, and `snippets/heading.liquid` defaults `tier` to `heading-h2`: 2rem / 2.4rem, which is 20px / 24px. `heading-h2` is a utility, and utilities beat the `@layer base` `h1` rule, so the title is 10px smaller below `pc` and 16px smaller from `pc`.

HEAD body was `class="rte w-full"`. `rte: true` makes `snippets/text.liquid` add `rte rte--compact`. `.rte > * + *` is `margin-top: 1.2em`; `.rte.rte--compact > * + *` is `0.6em`. At the body-size defaults (14px mobile, 16px from the desktop body size, `body_scale` 100) that is 16.8px versus 8.4px on mobile and 19.2px versus 9.6px on desktop. Compact also sets heading margins inside the RTE to `0.8em` / `0.3em` instead of `1.6em` / `0.6em` (mobile 22.4px / 8.4px versus 11.2px / 4.2px). `gap-8` (20px) on the column was already at HEAD.

Fix: pass `tier: 'heading-h1'` (same 3rem / 4rem as the element rule). Do not pass `rte: true`; pass `class: 'rte w-full'` with `element: 'div'` and `motion_reveal: false` so the body does not gain `rte--compact`.

**P3. `docs/references/style-system/css-architecture.md`. "All storefront sections use `section-frame`" is not true.**

`rg --files-without-match "render 'section-frame'" --glob "*.liquid" sections` lists eight sections: `announcement-bar`, `cart-overlay`, `collection-navigation-items`, `footer`, `header`, `newsletter-overlay`, `pickup-availability`, `search-overlay`. They are the e2 set and do not use the frame. The rest of that paragraph (no `.layout` rules in `assets/base.css`, the inner as the containing block, `static!`, the background slot) matches the code.

Fix: say every section that used `.layout` now uses `section-frame`, and name the eight that do not.

**P3. `docs/references/architecture/abstraction-boundaries.md`. The `element` note does not state the whitelist.**

The row says "`element` selects the root tag (`div` default)." The snippet only accepts `div`, `main`, `header`, and `footer`, and any other value renders `div` (`snippets/section-frame.liquid`). `css-architecture.md` line 209 already states the three landmark tags and the default.

Fix: say the root tag is `div` (default), `main`, `header`, or `footer`, and any other value renders `div`.

### Coordinator fixes after independent review round 1 (2026-10-03)

All three points were verified against the code and fixed:

- **P2 `sections/page.liquid`: title tier and body rhythm.**
  - Title: `heading` with no tier defaulted to `heading-h2`. `HEAD`'s bare `h1` used `base.css` `h1`, which is the same size as `heading-h1` (`calc(var(--font-heading-scale) * 3rem)`, and `4rem` from `pc`). Now `tier: 'heading-h1'`.
  - Body: `rte: true` added `rte--compact` (0.6em rhythm instead of 1.2em). Now `class: 'rte w-full'` without `rte: true`, which renders `HEAD`'s `rte w-full`.
- **Reference `css-architecture.md`:** "All storefront sections use `section-frame`" is now "Every section with merchant padding settings uses `section-frame`". A loop over every section with a `padding_top` setting found none without a `section-frame` render.
- **Reference `abstraction-boundaries.md`:** the `element` note now states the `div` / `main` / `header` / `footer` whitelist and the `div` fallback.

Re-run:

- `build:tw` done;
- `lint:theme` passed;
- `test:theme-check` 147 files, no offenses;
- `lint:liquid-syntax` passed;
- `lint:doc-paths` passed;
- `npx prettier --check` on the changed files passed.

Status: awaiting the independent review, round 2.

### Independent review, round 2 (Grok 4.7, 2026-10-03)

**Verdict: PASS.** No new findings. The three round-1 points are fixed, and the validators pass.

#### 1. `sections/page.liquid`

`snippets/heading.liquid` with `level: '1'`, `tier: 'heading-h1'`, and `motion_attrs: 'data-motion-critical'` (motion left at its default) renders:

```liquid
<h1 class="heading-h1" data-motion-reveal="content" data-motion-critical>
```

`snippets/text.liquid` with `element: 'div'`, `class: 'rte w-full'`, and `motion_reveal: false`, and without `rte: true`, renders `<div class="rte w-full">` and does not emit `data-motion-reveal`. That is HEAD's body class. HEAD's title had the same two motion attributes and no tier class; the added class is `heading-h1`.

Compiled `.heading-h1` in `assets/tailwind.output.css` (inside `@layer utilities`) and `assets/base.css` `h1` / `h1–h6` (`@import '../assets/base.css' layer(base)` in `tailwind/tailwind.input.css`):

| Property | `heading-h1` / `heading-base` | `base.css` `h1`–`h6` and `h1` |
| --- | --- | --- |
| font-size | `calc(var(--font-heading-scale) * 3rem)`; from `width >= 48rem`, `* 4rem` | same `* 3rem`; `@media (width >= theme(--breakpoint-pc))` is `48rem` in `@theme inline`, then `* 4rem` |
| font-family | `var(--font-heading-family)` (`--font-heading` is that variable; the built `.font-heading` utility writes the family variable directly) | `var(--font-heading-family)` |
| font-weight | `var(--font-heading-weight)` | same |
| line-height | `var(--font-heading-line-height)` | same |
| letter-spacing | `var(--font-heading-letter-spacing)` | same |
| text-transform | `var(--font-heading-text-transform)` | same |
| colour | `rgb(var(--color-foreground))` | same |

`font-style` and `word-break: break-word` match as well. The utility wins over the base-layer element rule, and the values are the same, so the win does not change the title.

#### 2. References

`css-architecture.md`: "Every section with merchant padding settings uses `section-frame`" matches the code. Of 45 section files, 37 schemas contain `"id": "padding_top"`, and each of those files renders `section-frame`. Missing frame: 0.

404, about-stats, article, before-after-comparison, blog-stories, blog, brand-statement, cart, category-grid, collection, collections, custom-liquid, featured-product, featured-products, google-map, icon-with-text, main-page-about, main-page-contact, newsletter-banner, page, password-footer, password-header, password, philosophy-section, product-comparison-table, product-recommendations, product, promise-section, promo-bannder, promotion-countdown, routine-showcase, scroll-categories, scrolling-icon-with-text, search, slides-show, testimonial-featured, video-banner.

`abstraction-boundaries.md` says `element` selects `div` (default), `main`, `header`, or `footer`, and any other value falls back to `div`. `snippets/section-frame.liquid` assigns `element | default: 'div' | strip | downcase` and resets the value to `div` unless it is one of those four.

#### 3. Regressions and validators

`git diff --stat HEAD` is the same 13 paths as the plan surface (six sections, `section-frame`, `base.css`, `tailwind.output.css`, the two references, `board.md`, this record): 754 insertions, 281 deletions.

| Command | Tail |
| --- | --- |
| `npm.cmd run build:tw` | Tailwind CSS v4.1.18, done in 133ms |
| `npm.cmd run lint:theme` | Theme architecture lint passed. |
| `npm.cmd run test:theme-architecture` | `# tests 130` / `# pass 130` / `# fail 0` |
| `npm.cmd run test:theme-check` | 147 files inspected with no offenses found. |
| `npm.cmd run lint:liquid-syntax` | Liquid syntax lint passed. |
| `npm.cmd run scan:compat` | Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks). |
| `npm.cmd run lint:i18n` | i18n lint passed. Unused locale key lint passed. |
| `npm.cmd run lint:doc-paths` | Doc path lint passed. |
| `npm.cmd run doctor:agent` | exit 0 |
| `npx prettier --check` on the changed files except `assets/tailwind.output.css` | All matched files use Prettier code style! |

