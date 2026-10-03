# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3d3: migrate cart and blog sections

Status: executed and accepted; independent review PASS (Grok 4.7, 2026-10-03). Authorized 2026-10-03.

### Direction

CSS step 3 series, batch d3, the last of d1 / d2 / d3 (d1 `f59e90a`, d2 `288f7ae`).

- Section level only: frame, section headings, spacing, and section-owned CSS.
- The component snippets these sections render (`quantity-selector`, `listing-page-hero-copy`, `rotating-badge`, `pagination`, `image`, cart and article sub-snippets) are not restructured.
- Heights and visuals stay as at `HEAD`, identical or close (user, 2026-10-03).
- Rules: `docs/references/style-system/css-architecture.md`, `docs/references/architecture/abstraction-boundaries.md`.
- Precedents and their review rounds:
  - `git show 288f7ae:docs/agent/context.md` (5-C3d2): a mount moved off the root, split `.layout` padding, the inner z-index finding, and the search height finding.
  - `git show f59e90a:docs/agent/context.md` (5-C3d1).
  - `git show 920f34d:docs/agent/context.md` (5-C3c): overlay padding and `scheme_target`.

### Implementation surface

- Sections (4): `cart`, `blog`, `blog-stories`, `article`.
- `snippets/section-frame.liquid`: backward-compatible additions only (expected: one-sided overlay padding, see `blog`). Prove that earlier users are unchanged.
- Other primitives: backward-compatible additions only.
- `tailwind/tailwind.components.css`: only rules owned by these four sections, under the refined move rule.
- `assets/tailwind.output.css`: through `npm.cmd run build:tw` only.
- `docs/references/**`: to keep them true.
- Record: this file.
- Forbidden:
  - `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`;
  - every `{% schema %}`;
  - validators, scripts, `package.json`;
  - `assets/*.js`;
  - `assets/base.css` `.layout` rules;
  - other sections;
  - the component snippets listed above.

### Known structure at `HEAD` (coordinator read; verify with commands)

- `cart`:
  - **Root mount.** The root mounts `cartPage()` (`data-module-id="cart-page"`) with six `data-shipping-msg-*` attributes and `:class="{ 'opacity-50 pointer-events-none': $store.cart.loading }"`.
    - The mount, its `data-*` and the `:class` move to one wrapper, the first frame child, which wraps everything the root wrapped.
    - The dimming then covers the content but not the frame's surface background. Record this as an intended change, or keep the dim on the whole painted area if a clean way exists.
  - **Section ids.** Two inner elements carry `data-section-id="{{ section.id }}"`, read through `$el.dataset.sectionId` by `$store.cart.change(…)`. They stay.
    - Read the cart store and every module the section mounts.
    - Show that the section re-render (target and inner selectors) still resolves with the frame root as the outer `data-section-id`.
  - **Layout.** One `.layout container-page` block, so the frame takes its padding directly.
- `blog`:
  - **Root.** It has no colour scheme and no surface, and carries `relative` and the `sectionPagination()` mount (`data-pagination-section-id`, `data-pagination-selectors`, `data-blog-tab-initial-index`). Move the mount to a wrapper as in collection (5-C3d2), and show that `section-pagination` resolves.
  - **Two `.layout` blocks with different colours.**
    - The first (`layout-no-pb`, `color-<header_color_scheme>`) takes the top padding and the first-section header offset, painted in the header colour.
    - The second (`layout-no-pt`, `color-<color_scheme> surface-section`, `pt-6 pc:pt-8`) takes the bottom padding, painted in the body colour.
    - Preserve both the values and the painting. Expected setup:
      - `scheme_target: 'none'`, `surface_section: false`, `padding_mode: 'overlay'`;
      - top padding plus the first-section-only header offset on the first block, and bottom padding on the second.
    - If the frame's overlay classes cannot express one-sided padding with the first-section-only offset, add backward-compatible classes and document them.
    - The header offset must apply only when the section is first in `<main>`, as at `HEAD`.
  - **Overflow.** Both blocks were `overflow: hidden` (`.layout`). The hero badge is `absolute` inside the first block. Keep the clipping wherever something can overflow.
- `blog-stories`: the root mounts `motionRevealSection()`, with one `.layout container-page` block, a `data-motion-sequence` and a `data-motion-cascade`. Use `motion: true`.
- `article`:
  - **Root.** It mounts `motionRevealSection()` and has the root colour and surface. Use `motion: true`.
  - **Hero.** The first child is `.article-hero` (not `.layout`; `relative overflow-hidden`, header colour, `pc:max-h-200`).
  - **Body block.** The body block is `.layout layout-no-pt … mt-12 overflow-clip!` with a `pc:sticky-viewport-panel` aside. At `HEAD`:
    - the top padding is never applied (the hero has none, and the body is `layout-no-pt`);
    - the first-section header offset does not apply (the body is not the first child);
    - only the bottom padding applies, on the body block.
  - **Preserve exactly:**
    - no top padding and no header offset (`safe_top: false` and/or overlay mode);
    - the bottom padding;
    - `mt-12`;
    - `overflow: clip` (not hidden) as the sticky aside's nearest clipping ancestor;
    - `clip: false` on the frame.
  - **Padding setting.** `padding_top` stays without effect, as at `HEAD`. Record this; the coordinator carries it to the board as a design-phase question.
  - **Hero height.** The `55svh` hero height in the stylesheet stays.

### Tasks

1. **Inventory, command-counted, recorded**, for each section:
   - root attributes and inner mounts, including Alpine bindings on the root;
   - every `data-motion-*` scope;
   - section-level headings and CTAs;
   - margins and `space-y`, in markup and stylesheets;
   - heights (`svh`, `max-h`);
   - `.layout` uses and flags, and every `overflow-*` override;
   - colour and surface per painted block;
   - sticky elements and their ancestors' `overflow`;
   - every `data-section-id`;
   - fixed overlays rendered inside the section.
2. **Migrate** each section onto `section-frame`, height kind `content`.
   - Keep `HEAD`'s colour and surface placement and padding painting.
   - Route section headings and copy through the primitives where the section renders them itself.
   - Turn sibling margins into gaps only where the value stays the same.
3. **Module and Section Rendering trace.**
   - Read the cart store and `cart-page`, `section-pagination`, `sticky-viewport-panel`, `motion-reveal`, and any other module these sections mount.
   - Show that each `$el`, `closest`, `parentElement` walk, `targetSelector` and inner selector still resolves, in the page and in the section response.
4. **Sticky, overflow and stacking trace.**
   - Trace each sticky or overlaying element up to `<main>`.
   - Confirm that no frame ancestor creates a stacking context (5-C3d2 P1).
5. **Record:**
   - the inventory;
   - per-section decisions;
   - the reveal count table (script, including the defaults of `heading`, `text`, `image`);
   - the traces;
   - a spacing and painting table, `HEAD` vs now, in px at the 2.5px unit, with `base.css` in `@layer base`;
   - the selector inventory (`grep -F` against `HEAD`'s output);
   - validator outputs;
   - deferred browser checks.

### Lessons from earlier reviews (hard requirements)

- **Preserve exactly:**
  - containers;
  - colour and surface placement;
  - motion scopes (effective reveal counts);
  - ARIA;
  - module mounts with their `data-*` and Alpine bindings;
  - loading attributes.
- **Primitive defaults.**
  - `text` with no `tier` inherits.
  - Pass `motion_reveal: false` only where `HEAD` had no reveal.
  - Check `measure`: `rte-compact-prose` always added `max-w-3xl` (5-C3d1 P2).
- **Layering.** `assets/base.css` is in `@layer base`, so utilities on a `.layout` element beat its padding and overflow. Compute `HEAD`'s effective values from that (5-C3d1 P1).
- **Min-heights.** A `min-height` that was border-box including padding at `HEAD` must stay so; do not move it inside the frame's padding (5-C3d2 P2).
- **No empty spacers.** No empty spacer elements; spacing belongs on a real block (5-C3d2 P3).
- **Unlayered rules.** Unlayered stylesheet declarations override layered utilities. Never let a frame rule override a `display` or `overflow` that `HEAD` relied on.
- **Conditional siblings.** A conditional sibling must not lose spacing that `HEAD` gave unconditionally.
- **Docs.** Docs describe the code exactly (5-C3d1 P3).
- **Evidence.** Every number and every validator result comes from a command actually run.

### Acceptance checks

- **D1:** each section renders `section-frame` once per branch. None contains `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, `h-screen`, or a `vh` unit.
- **D2:** section-level heading and CTA counts, `HEAD` → now.
- **D3:**
  - mounts with their `data-*` and bindings, motion scopes (reveal count table), ARIA, and colour, surface and padding painting match `HEAD`;
  - every module that reads its root, an ancestor or a selector is cited and shown to resolve.
- **D4:** schemas byte-identical; `git diff --stat HEAD -- config templates` is empty.
- **D5:**
  - the sticky, overlay and stacking traces show no new clipping, scroll-container or stacking-context ancestor;
  - the frame root carries one `data-section-id`, and cart's inner `data-section-id` attributes are unchanged;
  - earlier `section-frame` users are unchanged by any primitive edit.
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

#### Task 1 — inventory (commands: `git show HEAD:sections/<name>.liquid`)

**cart** (`git show HEAD:sections/cart.liquid`):

- Root: `data-section-id`, `cartPage()` / `data-module-id="cart-page"`, six `data-shipping-msg-*`, `:class` loading dim, `color_scheme` + `surface-section`, inline `--section-padding-*`, one `.layout.container-page`.
- Inner `data-section-id` on quantity controls (×2) for `$store.cart.change`.
- No `data-motion-*`; one section `<h1>` (not primitive).
- Sticky/overlays: none.

**blog**:

- Root: no colour/surface; `relative`; `sectionPagination()` + pagination `data-*` on root.
- Two `.layout` blocks: (1) `layout-no-pb` + header scheme + hero `motionRevealSection` + badge `absolute`/`z-10`; (2) `layout-no-pt` + body scheme + `surface-section` + `pt-6 pc:pt-8`.
- Root held `--section-padding-*` consumed by `.layout` rules in `assets/base.css` `@layer base`.
- `data-motion-reveal` in hero copy + badge + article cards; grid `data-motion-cascade`.

**blog-stories**:

- Root: colour + surface + `motionRevealSection()`; one `.layout.container-page`; header `data-motion-sequence`; `data-motion-cascade` on grid.
- Section `<h2>` + RTE subtitle (not primitives).

**article**:

- Root: colour + surface + `motionRevealSection()`; `--section-padding-*` on root.
- `.article-hero` (header scheme, not `.layout`); body `.layout.layout-no-pt.container-page.mt-12.overflow-clip!`; `sticky-viewport-panel` in aside.
- Hero image `loading` via `image` snippet; `55svh` in `{% stylesheet %}`.

#### Per-section decisions

| Section | Frame | Mount / bindings | Colour / padding / overflow |
| --- | --- | --- | --- |
| **cart** | `width: page`, `height_kind: content`, default padding on root | `cartPage()` on first child with `data-section-id` (for `cart-page.js` `init` `dataset.sectionId`), all shipping `data-*` and `:class` dim on same wrapper. **Intended:** dim covers frame inner content only, not the frame root’s painted padding/background (dim moved off root with mount). | Frame root: scheme + surface + merchant padding. Inner line-item `data-section-id` unchanged. |
| **blog** | `padding_mode: overlay`, `scheme_target: none`, `surface_section: false`, `safe_top: false`, `root_class: relative` | `sectionPagination()` on inner `relative` wrapper (same `data-pagination-*` as HEAD root). | Block 1: `section-frame__overlay-padding-top` + `section-frame__overlay-safe-top` + header scheme + `overflow-hidden`. Block 2: `section-frame__overlay-padding-bottom` + body scheme + `surface-section` + `pt-6 pc:pt-8` + `overflow-hidden`. First-in-`main` header offset via new frame CSS on `.overlay-padding-top.overlay-safe-top` only. |
| **blog-stories** | `motion: true` | Motion mount on frame root (CAP-01). | Single `container-page` inner; header via `heading` + `text` (`motion_reveal: false` on `text` only; wrapper keeps `data-motion-reveal="content"`). |
| **article** | `motion: true`, `clip: false`, `safe_top: false`, `padding_mode: overlay` | Motion on frame root. | Hero unchanged. Body: `section-frame__overlay-padding-bottom` + `mt-12` + `overflow-clip!` (sticky clipping ancestor preserved). **No top padding / no safe-top** on body block. **`padding_top` setting still has no painted effect** (vars on frame root; only bottom overlay block applies bottom padding), same as HEAD. |

#### Reveal count (`node` one-off; literals in section file + `render 'heading'|'text'|'image'` unless `motion_reveal: false`)

```
section          HEAD_lit  NOW_lit  HEAD_prim  NOW_prim  motion-section (file→effective)
cart             0         0        0          0         0→0
blog             3         3        0          0         2→2 (hero + grid modules in file)
blog-stories     4         3        0          1         1→1 (`motion: true` on frame)
article          2         2        0          0         1→1 (`motion: true` on frame)
```

blog-stories: `<h2 data-motion-reveal>` → `heading` default reveal (1 primitive); net content reveals unchanged.

#### Task 3 — module / Section Rendering trace

- **cart-page** (`assets/cart-page.js`): `init` reads `this.$el.dataset.sectionId` → wrapper has `data-section-id="{{ section.id }}"` (same element as `x-data`). `changeLine` uses per-control `data-section-id` (unchanged). Section refresh: `cart-overlay.js` / store use `#shopify-section-${sectionId}`; frame root still `data-section-id="{{ section.id }}"` on `.section-frame`.
- **section-pagination** (`assets/section-pagination.js`): `dataset.paginationSectionId` on wrapper; `buildDomMap` → `targetSelector: #shopify-section-${id}`, `innerSelectors` unchanged.
- **motion-reveal**: blog hero/grid still own `x-data="motionRevealSection()"` in file; blog-stories/article section scope on frame via `motion: true`.
- **sticky-viewport-panel** (`assets/sticky-viewport-panel.js`): still on `nav` inside body block; measures `$el` only.

#### Task 4 — sticky / overflow / stacking (to `<main>`)

| Element | Ancestor chain | Notes |
| --- | --- | --- |
| blog badge `z-10` | badge → hero → overlay-top block → pagination wrapper → `section-frame__inner` → `.section-frame` (no z-index on `__inner`, P1) | `overflow-hidden` on painted blocks replaces `.layout` clip. |
| article sticky aside | `nav.sticky-viewport-panel` → aside → body `overflow-clip!` → … → `.section-frame--no-clip` | `clip: false` on frame; clip on body block as HEAD. |
| cart loading dim | wrapper with `:class` → inner grid → `section-frame__inner` → frame | No new stacking context on frame inner. |

#### Spacing / painting (merchant default `padding_top`/`padding_bottom` = 32px; 1 Tailwind unit = 2.5px)

| Section | Block | HEAD effective (base `.layout` + utilities) | Now |
| --- | --- | --- | --- |
| cart | frame inner | top/bottom 32px clamp (19.2px @375 → 32px @1280) on `.layout` | same vars on frame root → inner padding |
| blog | header block | top: clamp + first-section header offset; bottom: 0 (`layout-no-pb`) | `overlay-padding-top` (+ safe-top when first) |
| blog | body block | top: 0 (`layout-no-pt`); `pt-6`/`pc:pt-8` = 15px/20px; bottom: clamp 32px | `overlay-padding-bottom` + same utilities |
| article | body | top: 0; `mt-12` = 30px; bottom: clamp 32px on `.layout` | same on overlay-bottom block |
| article | hero | no section padding | unchanged (no overlay class on hero) |

#### D6 — removed section selectors (HEAD → now)

| Selector / pattern | Consumers elsewhere |
| --- | --- |
| Inline `--section-padding-top/bottom` on section roots | Still used by unmigrated sections + `base.css` `.layout` |
| `class="… layout …"` in these four files | Many unmigrated sections |
| `blog-section full-width` on root | `full-width` remains on frame via `section_class` + frame width tokens |
| `blog_stories_subtitle_class` assign | Removed unused assign only |

#### D1–D8

- **D1:** `rg` on four sections: no `class="layout`, `--section-padding-top:`, `h-screen`, or `vh` in section files. Each has exactly one `{% render 'section-frame' %}`.
- **D2:** cart: 1× `h1` → `heading`; blog-stories: 1× `h2` → `heading`, subtitle → `text`; blog/article card titles unchanged (not section-level).
- **D3:** traces above; cart `data-section-id` on mount element restored for store registration.
- **D4:**

```
git diff --stat HEAD -- config templates
(empty)
```

- **D5:** `git diff HEAD -- sections/collection.liquid sections/product.liquid` empty. `section-frame` diff is additive CSS + first-section overlay-top safe rule; prior `overlay-padding` / full padding rules unchanged.
- **D6:** `npm.cmd run build:tw` — Done in 127–130ms (see D7 build).
- **D7:**

```
npm.cmd run lint:theme
Theme architecture lint passed.

npm.cmd run test:theme-architecture
# tests 130 … pass 130 … fail 0

npm.cmd run test:theme-check
147 files inspected with no offenses found.

npm.cmd run lint:liquid-syntax
Liquid syntax lint passed.

npm.cmd run scan:compat
(Embedded compatibility lint passed.)

npm.cmd run lint:i18n
i18n lint passed.
Unused locale key lint passed.

npm.cmd run lint:doc-paths
Doc path lint passed.

npm.cmd run doctor:agent
(exit 0)

npx prettier --check sections/cart.liquid sections/blog.liquid sections/blog-stories.liquid sections/article.liquid snippets/section-frame.liquid docs/references/architecture/abstraction-boundaries.md docs/references/style-system/css-architecture.md docs/agent/context.md
All matched files use Prettier code style!
```

- **D8:** No `new CustomEvent` in the four section files; no SectionRefresher markup replacement added in sections.

#### Deferred browser checks

- Cart: loading dim scope (content vs full section paint); empty vs filled cart.
- Blog: first-section header offset on blog index; tab pagination fetch + panel replace; hero badge position.
- Blog-stories: motion sequence/cascade timing vs HEAD.
- Article: sticky TOC vs scroll; hero `55svh`; comments block.

#### Remaining risks

- Cart loading dim no longer includes frame padding band (documented intended change).
- blog-stories `text` snippet may emit `<p>` vs HEAD `<div class="rte">` — verify typography/measure in browser.
- Article `padding_top` merchant setting still ineffective (design follow-up on board).
- First-section safe-top for blog depends on new overlay-top + safe-top selector; confirm on a real first-in-main blog template in browser.

### Coordinator review, round 1 (2026-10-03): five findings, fixed by the coordinator

Verified clean:

- cart:
  - `cartPage()`, its six `data-shipping-msg-*` attributes, and `:class` are on the first frame child.
  - `assets/cart-page.js` reads `this.$el.dataset.sectionId` for `registerSection`, so keeping `data-section-id` on that wrapper is required.
  - `assets/cart.contract.js` → `SectionRefresher.render(sections)` targets `#shopify-section-<id>` by default, so the extra `data-section-id` does not change the refresh target.
  - The loading dim now covers the content but not the frame's surface band (recorded intended change).
- blog: `sectionPagination()` and its `data-*` are on an inner wrapper.
- `tag: section`: blog, article, cart and blog-stories all set `"tag": "section"`, so `HEAD`'s `main > section:first-child` rule and the frame's `main > .shopify-section:first-child` rule match the same element.

Findings:

- P1 blog and article: page-width frame squeezed full-bleed blocks.
  - At `HEAD`, blog's two blocks were each `.layout container-page`. The body block paints `surface-section` (the scheme's `--gradient-background`) across the full width. article's hero was a direct root child, so it was full-bleed.
  - The executor used `width: 'page'`, which puts every child in the inner `container-page` column 2. The blog body surface and the article hero shrank to the page width on desktop.
  - Fix: both use `width: 'full'`. blog's two blocks and article's body block carry `container-page relative` again (`relative` also restores what `.layout` gave). The hero stays full-bleed.
- P1 blog: first-section header offset lost.
  - The frame had `safe_top: false`. The overlay safe-top rule requires `:not(.section-frame--no-safe-top)`, so `section-frame__overlay-safe-top` on the hero block never applied. When blog is first in `<main>`, the hero would sit under the header.
  - Fix: `safe_top: false` removed. The offset applies only when the section is first in `<main>`, as at `HEAD`.
- P2 `snippets/section-frame.liquid`: one-sided overlay classes zeroed the other side.
  - `.section-frame__overlay-padding-bottom` set `padding-top: 0` (and `-top` set `padding-bottom: 0`) in an unlayered stylesheet. That beats the layered `pt-6 pc:pt-8` on blog's body block, so 15px / 20px of spacing was lost.
  - Fix: each one-sided class sets only its own side. Reference updated.
- P2 blog-stories: block paragraph nested inside a paragraph.
  - The `description` setting is `richtext` (block `<p>` content). The new `text` render defaulted to `element: 'p'`, nesting `<p>` in `<p>` (`HEAD` used a `div`).
  - Fix: `element: 'div'`.
- P3 `snippets/section-frame.liquid`: a redundant selector `….section-frame__overlay-padding-top.section-frame__overlay-safe-top` was added to the first-section overlay rule. The existing `….section-frame__overlay-safe-top` selector already matches it. Removed.

Re-run after the fixes:

- `build:tw` done; `assets/tailwind.output.css` has no diff against `HEAD`.
- `lint:theme` passed.
- `test:theme-architecture` 130 pass, 0 fail.
- `test:theme-check` 147 files, no offenses.
- `lint:liquid-syntax` passed.
- `scan:compat` passed (54 stylesheet blocks).
- `lint:doc-paths` passed.
- `npx prettier --check` on the changed files passed.

Board carry-over at clear: article's `padding_top` has had no effect since before the frame (the hero has no padding and the body is `layout-no-pt`). Whether it should is a design-phase question.

Added deferred browser checks:

- blog as the first section: the hero clears the header, and the body surface spans the full width;
- the article hero is full-bleed, and the sticky aside works;
- the cart loading dim;
- blog-stories description paragraphs.

### Independent review (Grok 4.7, 2026-10-03)

**Verdict: PASS.** No findings. Browser checks stay deferred.

Scope: `git diff --stat HEAD` is 8 files (477 insertions, 102 deletions): the four sections, `snippets/section-frame.liquid`, `docs/references/architecture/abstraction-boundaries.md`, `docs/references/style-system/css-architecture.md`, and this record. `git diff --stat HEAD -- config templates` is empty. `assets/tailwind.output.css` and `assets/*.js` are outside the diff.

#### D1

`node C:\Users\Joey\AppData\Local\Temp\verify-5c3d3.mjs`, counting `vh` on the raw file with a lookbehind so `svh` does not match:

| Section | `section-frame` | `--section-padding-top:` | `class="…layout` | `h-screen` | `vh` | `svh` |
| --- | --- | --- | --- | --- | --- | --- |
| cart | 1 | 0 | 0 | 0 | 0 | none |
| blog | 1 | 0 | 0 | 0 | 0 | none |
| blog-stories | 1 | 0 | 0 | 0 | 0 | none |
| article | 1 | 0 | 0 | 0 | 0 | `55svh` (stylesheet, unchanged by the diff) |

#### D2

Same script, markup outside `{% stylesheet %}` / `{% schema %}`.

| Section | `<h1>`–`<h6>` HEAD → now | `render 'heading'` now | `<button>` HEAD → now |
| --- | --- | --- | --- |
| cart | 2 → 1 | 1 (`level: '1'`, `motion_reveal: false`) | 2 → 2 |
| blog | 1 → 1 | 0 | 0 → 0 |
| blog-stories | 3 → 2 | 1 (`level: '2'`) | 0 → 0 |
| article | 4 → 4 | 0 | 1 → 1 |

Cart’s section `<h1 class="{{ cart_heading_class }}">` becomes `heading` with that tier only (`align` defaults to start, so no extra alignment class). Blog-stories’ `<h2 class="pc:w-1/2 {{ heading class }}" data-motion-reveal="content">` becomes `heading` with `class: 'pc:w-1/2'`; the default reveal replaces that attribute. The description `div.rte.rte--compact.typo-subtitle.{{ subtitle size }}` becomes `text` with `element: 'div'`, `rte: true`, `subtitle: true`, tier `body-lg` by default, `motion_reveal: false`. `snippets/text.liquid` puts `rte rte--compact` and prepends `typo-subtitle` on a `div`, and does not add `max-w-3xl` without `measure`. The class set matches HEAD. The setting is `"type": "richtext"` (`sections/blog-stories.liquid` line 307), so the block `<p>` content sits in the `div`.

ARIA / `role` from the same script are unchanged: cart 8 / 1, blog 5 / 3, article 9 / 2, blog-stories 0 / 0.

#### D3 — reveals

Heading and text add a reveal unless `motion_reveal` is `false` or `'false'`. Image adds one unless `motion_reveal == false`.

| Section | `data-motion-reveal` HEAD → now | primitive adds | `data-motion-section` in file |
| --- | --- | --- | --- |
| cart | 0 → 0 | 1 → 1 (`heading` 0; one `image` still defaults on, one stays off) | 0 → 0 |
| blog | 3 → 3 | 0 → 0 (one `image`, `motion_reveal: false`) | 2 → 2 |
| blog-stories | 4 → 3 | 0 → 1 (`heading` 1, `text` 0, two `image` 0) | 1 → 0 |
| article | 2 → 2 | 0 → 0 (one `image`, false) | 1 → 0 |

Blog-stories and article pass `motion: true`, so the frame emits `data-motion-section` (`snippets/section-frame.liquid` lines 126–129). Effective section-motion stays 1. Cascade / sequence counts are unchanged (blog cascade 1, blog-stories cascade 1 and sequence 1).

#### D3 — cart mount and refresh

The first frame child (`sections/cart.liquid` lines 9–18) carries `x-data="cartPage()"`, `data-module-id="cart-page"`, `data-section-id="{{ section.id }}"`, all six `data-shipping-msg-*` attributes, and `:class="{ 'opacity-50 pointer-events-none': $store.cart.loading }"`.

`assets/cart-page.js` line 25 reads `this.$el.dataset.sectionId` and passes it to `registerSection` (`assets/cart.contract.js` line 86). `_readShippingMessages` (line 47) reads the six `shippingMsg*` dataset keys. `changeLine` (line 41) forwards the per-control id. The remove link (line 265) and the quantity wrapper (line 278) still have `data-section-id="{{ section.id }}"` and call `$store.cart.change(…, [$el.dataset.sectionId])`. The script listed three identical `data-section-id="{{ section.id }}"` attributes on both sides; the two inner ones are not in the diff hunks. The frame root adds the usual one (`section-frame.liquid` line 119), same `section.id`.

`assets/cart.contract.js` lines 145 and 180 call `SectionRefresher.render(data.sections)` with no target override. `assets/https.js` lines 285–288 default `targetSelector` to `#shopify-section-${key}`. The platform wrapper is that id, so the extra `data-section-id` attributes do not change the refresh target. The section response is this same Liquid.

Loading dim. HEAD put `:class` on the `full-width` root, so `opacity-50` and `pointer-events-none` covered the whole painted section, including the surface, the vertical padding, and the page-margin columns. Now the binding is on the mount wrapper, which is the single child of `.section-frame__inner.container-page` and therefore sits in column 2, inside the frame padding. The dim covers that page-column content. The frame root’s surface, its padding bands, and the container-page side columns stay at full opacity. That is the recorded intended change.

#### D3 — blog pagination and blog-stories

`sectionPagination()` and `data-pagination-section-id`, `data-pagination-selectors='["[role=\"tabpanel\"]",".sup-badge"]'`, and `data-blog-tab-initial-index` are on the inner wrapper (`sections/blog.liquid` lines 14–20). `assets/section-pagination.js` reads those dataset keys (lines 16–28) and sets `targetSelector: #shopify-section-${id}` plus those inner selectors (lines 86–90). `role="tabpanel"` is line 115 and `.sup-badge` is line 92, both inside the wrapper, so both resolve in the page and in the section response.

#### D4

Schema bodies match, byte lengths: cart 3048, blog 5827, blog-stories 10537, article 5755. Each schema `"tag"` is `section`. Padding defaults are 32 / 32 on all four.

#### Width and painting

`html { font-size: 62.5% }` (`assets/base.css` line 57). One spacing unit is 2.5px. `*, *::before, *::after { box-sizing: border-box }` (line 4). `assets/base.css` is imported in `@layer base` (`tailwind/tailwind.input.css` line 99). `.layout` padding is lines 165–167; the first-section rule is lines 169–172. Frame and `{% stylesheet %}` rules are unlayered.

| Block | HEAD | Now |
| --- | --- | --- |
| Cart root | `full-width`, `color-{{ color_scheme }}`, `surface-section`. Content in `.layout.container-page` (page column). Surface paints the full section width. | Frame root is `full-width` with the same scheme and `surface-section` (defaults). `width: 'page'` puts `container-page` on the inner. Surface still full-bleed; content still column 2. |
| Blog header | `.layout.layout-no-pb.container-page` with `color-{{ header_color_scheme }}`, no surface. The layout box is full-bleed; children sit in column 2. | `width: 'full'`. The block is `container-page relative overflow-hidden` with the same header scheme. Full-bleed colour; column 2 for the hero. |
| Blog body | `.layout.layout-no-pt.container-page` with `color-{{ color_scheme }} surface-section` and `pt-6 pc:pt-8`. Surface paints the full layout box. | Same classes on `container-page relative overflow-hidden`, plus the bottom overlay class. Surface still full-bleed. |
| Article hero | Direct child of the `full-width` root: `article-hero relative overflow-hidden color-{{ header_color_scheme }} pc:max-h-200`. Full-bleed. | Same element, still a direct child of a full-width inner (`width: 'full'`). Full-bleed header colour. |
| Article body / root | Root `full-width color-{{ color_scheme }} surface-section`. Body is `.layout.layout-no-pt.container-page` with no scheme of its own, so the root surface shows through, including the `mt-12` gap. | Frame root keeps that scheme and surface. Body is `container-page` without a scheme class. Same painting. |

`relative` and `overflow-hidden` on the blog blocks, and `relative` on the article body, replace `.layout`’s `position: relative` and `overflow: hidden` (`assets/base.css` lines 156–158). Blog’s `overflow-hidden` token count went from 1 to 3; the two new ones are those blocks. Article’s hero `overflow-hidden` is unchanged.

#### Padding and header offset

Schema default 32. HEAD wrote `--section-padding-top/bottom: {{ … }}px` (linear). The frame writes `clamp(19.2px, 13.898px + 1.414vw, 32px)` (`verify-5c3d3.mjs`, same `round: 3` arithmetic as the snippet). That linear-to-fluid change is the frame contract from 5-C3d1 / 5-C3d2. The execution table’s “clamp on `.layout`” describes the frame, not HEAD’s inline pixels.

| Section | HEAD | Now |
| --- | --- | --- |
| Cart | Layout padding-top and padding-bottom 32px linear. First in `main`: padding-top becomes `announcement-bar-height + header-height + 32px` because the layout is `:first-child`. | Same sides on the frame root, as the clamp. First in `main`: `section-frame.liquid` lines 218–226, because cart is not `padding-overlay`, not `padding-inner`, and not `no-safe-top`. |
| Blog-stories | Same single-layout padding as cart, including the first-section offset. | Same frame rule as cart. |
| Blog header | Top: 32px linear, or the header offset when the section is first (`layout:first-child`). Bottom: 0 (`layout-no-pb`). | `section-frame__overlay-padding-top` sets only padding-top to the clamp (lines 189–191). When the section is first, lines 229–236 replace it with `announcement + header + clamp`. The block does not use `section-frame__overlay-padding`, so the unconditional combined rule (lines 197–202) does not match. Bottom stays 0. |
| Blog body | Top from the section setting: 0 (`layout-no-pt`). `pt-6` / `pc:pt-8` = 15px / 20px (utilities beat layered `.layout`). Bottom: 32px linear. | `section-frame__overlay-padding-bottom` sets only padding-bottom (lines 193–195). It does not set `padding-top: 0`, so `pt-6` / `pc:pt-8` still apply. Bottom is the clamp. |
| Article | Hero has no section padding. Body is `layout-no-pt`, so top is 0 and it is not `:first-child`, so no header offset. `mt-12` = 30px. Bottom: 32px linear. `padding_top` is stored and unused. | `safe_top: false` adds `section-frame--no-safe-top`, and the body has no `overlay-safe-top` class, so neither first-section rule matches. Bottom overlay class only. `mt-12` unchanged. `padding_top` still has no painted effect. |

All four schemas use `"tag": "section"`, so the platform wrapper is `section.shopify-section`. HEAD’s `main > section:first-child` and the frame’s `main > .shopify-section:first-child` are that same wrapper. Blog’s offset lands on the header block (the old first `.layout`). Article’s body is still not that first child.

#### section-frame one-sided classes

`.section-frame__overlay-padding-top` sets `padding-top` only. `.section-frame__overlay-padding-bottom` sets `padding-bottom` only. `.section-frame__overlay-padding` still sets both sides (lines 183–186). `git diff HEAD -- snippets/section-frame.liquid` adds those two rules and the parameter sentence; the previous overlay rules are intact.

Earlier `padding_mode: 'overlay'` users, files outside this diff:

| Section | Rendered classes | Rules that match | `safe_top` |
| --- | --- | --- | --- |
| `routine-showcase` (line 67, render line 302) | `section-frame__overlay-padding container-page relative …` | Both-axes padding only. No one-sided class. | `false` (line 304), so the first-section overlay rule does not match |
| `slides-show` (line 125, render line 233) | `section-frame__overlay-padding section-frame__overlay-safe-top container-page absolute inset-0` | Both-axes padding, plus the unconditional combined safe-top rule (lines 197–202). | `false` (line 235), so the first-child rule does not match; the combined rule still applies, as before |

No other Liquid file uses `section-frame__overlay-` or `padding_mode: 'overlay'`.

#### D5 — sticky, overflow, stacking

Article aside (`sections/article.liquid` lines 63–71): `nav.pc:sticky-viewport-panel` → `aside` (`max-pc:hidden` is display, unchanged) → flex row → body `overflow-clip!` → `.section-frame__inner` → `.section-frame.section-frame--no-clip` → `section.shopify-section` → `main`. `clip: false` makes the frame and its direct inner `overflow: visible` (lines 152–155). `.shopify-section` (base.css lines 181–197) and `main` (`layout/theme.liquid` line 56, `relative shadow-none outline-none`) set no overflow. No new `hidden`, `auto`, or `scroll` ancestor. The list’s `overflow-x-auto` is inside the nav, not an ancestor. The clip on the body is the one HEAD had.

Blog badge (`absolute … z-10`, line 50) sits in the header block, which has `overflow-hidden` and `relative`. Ancestors above that block: pagination wrapper (`relative`, no overflow) → inner (no overflow; blog does not pass `clip: false`, and the inner rule sets no overflow) → frame (`overflow: hidden`, no `z-index`) → `section.shopify-section` → `main`. The block clip replaces `.layout`’s clip.

Frame stylesheet scan: `z-index: 0` only on `.section-frame__background`. No `transform`, `filter`, `isolation`, `opacity`, or `will-change`. `.section-frame__inner` is `position: relative` only (lines 214–216). `position: relative` with `z-index: auto`, and `overflow: hidden` or `visible`, do not create a stacking context. The cart dim’s `opacity-50` creates one on the mount wrapper, which is the element that was dimmed at HEAD.

#### D6

`npm.cmd run build:tw`: `Done in 204ms`. `scan:compat` rebuilt again (`Done in 142ms`). After both, `git diff --stat HEAD -- assets/tailwind.output.css` is empty. No removed selector.

#### D7

| Command | Tail |
| --- | --- |
| `npm.cmd run lint:theme` | `Theme architecture lint passed.` |
| `npm.cmd run test:theme-architecture` | `# tests 130` `# pass 130` `# fail 0` |
| `npm.cmd run test:theme-check` | `147 files inspected with no offenses found.` |
| `npm.cmd run lint:liquid-syntax` | `Liquid syntax lint passed.` |
| `npm.cmd run scan:compat` | `Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks).` |
| `npm.cmd run lint:i18n` | `i18n lint passed.` / `Unused locale key lint passed.` |
| `npm.cmd run lint:doc-paths` | `Doc path lint passed.` |
| `npm.cmd run doctor:agent` | exit 0, no findings |
| `npx prettier --check` on the four sections, `section-frame.liquid`, both references, and this file (before this review) | `All matched files use Prettier code style!` |

#### D8

`rg` of `new CustomEvent`, `innerHTML =`, `outerHTML =`, and `replaceWith(` in `*.js` and `*.liquid`: `new CustomEvent` only in `assets/events.js` line 29. `replaceWith(` at `assets/https.js` lines 239 and 318, and `innerHTML =` at line 325, inside the SectionRefresher. No hits in `sections/` or `snippets/`.

#### Docs

`css-architecture.md` and `abstraction-boundaries.md` now say the one-sided classes set only their own side, and that `section-frame__overlay-safe-top` on a top block is the first-section header offset. That matches lines 189–195 and 229–236. The `z-index` sentence from 5-C3d2 is still on the same line and still matches lines 204–216.

#### Findings

None.
