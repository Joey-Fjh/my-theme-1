# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3d2: migrate listing and search sections

Status: executed; not accepted. Authorized 2026-10-03 ("直接来"). Reviewer: independent reviewer (Grok 4.7 for now, user 2026-10-03). Browser checks deferred to the consolidated pass (user, 2026-10-03).

### Direction

CSS step 3 series, batch d2 of d1 / d2 / d3 (d1 done in `f59e90a`).

- Section level only: frame, section headings, spacing, and section-owned CSS. The component snippets these sections render (`product-card`, `filter-*`, `filters-drawer`, `sort-by-dropdown`, `pagination`, `search-predictive-panel`, `search-results-tabs`, `listing-page-hero-copy`, `rotating-badge`, `tab-control`, `watermark`, `ui-dialog`) are not restructured.
- Heights and visuals stay as at `HEAD`, identical or close (user, 2026-10-03).
- Rules: `docs/references/style-system/css-architecture.md`, `docs/references/architecture/abstraction-boundaries.md`. Precedents and their review rounds: `git show 920f34d:docs/agent/context.md` (5-C3c), `git show f59e90a:docs/agent/context.md` (5-C3d1, `clip: false`).

### Implementation surface

- Sections (4): `collection`, `collections`, `search`, `featured-products`.
- `snippets/section-frame.liquid`: backward-compatible additions only, if any; prove earlier users unchanged.
- Other primitives: backward-compatible additions only.
- `tailwind/tailwind.components.css`: only rules owned by these four sections, under the refined move rule.
- `assets/tailwind.output.css` through `npm.cmd run build:tw` only.
- `docs/references/**` to keep them true.
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

- `collection`:
  - The root mounts `collectionFilters()` (`data-module-id="collection-filters"`) and carries `data-pagination-section-id`, `data-pagination-selectors`, `data-filters-form-id`, `data-filters-dialog-id`. `root_attrs` must not carry `data-module-id`, `x-data` or Alpine attributes, so the mount and its `data-*` move to one wrapper. That wrapper is the first frame child and wraps everything the root wrapped: both former `.layout` blocks and both `ui-dialog` renders.
  - `assets/collection-filters.js` reads its own `$el.dataset`; `collectionFilterField.notifyFilterChange` walks `parentElement` up to the first scope with `onChange`; pagination refreshes `#shopify-section-<id>` with the inner selectors. Show each still resolves.
  - Two `.layout` blocks split the padding. The first (`layout-no-pb … pb-0`) takes the top padding and the first-section header offset; the second (`layout-no-pt … overflow-clip!`) takes the bottom padding. In the frame this becomes one root padding; the space between the blocks stays what `HEAD` gave (the hero's `mb-8 pc:mb-10`).
  - A sticky panel (`sticky-viewport-panel`) sits in the second block. At `HEAD` that block is `overflow: clip` (not a scroll container) and the first block is `overflow: hidden`. Preserve: no ancestor of the sticky panel may be `hidden`, `auto` or `scroll`; keep `clip` where `HEAD` had it. Expect `clip: false` plus an explicit clip on the second block's wrapper.
  - An inner element carries `data-section-id="collection-navigation-items"` (a second, fixed id). It stays; record it in the Section Rendering trace.
- `collections`: the root mounts `motionRevealSection()` and has `h-full`. Use the frame's `motion` parameter (as in 5-C3a–c). Keep `h-full` only if it has an effect, and record which.
- `search`:
  - The root has `min-h-[50vh]`; the first block adds `flex min-h-[50vh] flex-col items-center justify-center` when no search ran. `vh` is not allowed (D1): use `svh`, record the change, and keep the centring when `search.performed` is false.
  - Two `.layout` blocks with `overflow-visible!`, each with top and bottom padding, so after a search the padding appears twice between the form and the results. Preserve that spacing (for example a conditional gap from the frame padding variables) and record how. The markup defaults the padding settings to 0 (`| default: 0`).
  - The predictive search panel must not be clipped: use `clip: false` and trace the panel's ancestors.
  - The `predictive-search` and (through `search-results-tabs`) `search-filters` mounts stay where they are.
- `featured-products`: the root mounts `motionRevealSection()`; inside are the `featured-products` module, `tab-control`, and `watermark`; the tab header uses `pc:overflow-x-auto`. Use `motion`.

### Tasks

1. **Inventory, command-counted, recorded**, for each section:
   - root attributes and inner mounts;
   - every `data-motion-*` scope;
   - section-level headings and CTAs;
   - margins and `space-y`, in markup and in stylesheets;
   - heights (`h-full`, `min-h`, `vh`);
   - `.layout` uses and flags, and every `overflow-*` override;
   - sticky elements and their ancestors' `overflow`;
   - every `data-section-id`.
2. **Migrate** each section onto `section-frame`, height kind `content` unless `HEAD` proves otherwise.
   - Keep `HEAD`'s colour and surface placement (`scheme_target`, `surface_section`).
   - Route section headings and copy through the primitives where the section renders them itself, not inside the listed component snippets.
   - Turn sibling margins into gaps only where the value stays the same.
3. **Module and Section Rendering trace.**
   - Read `assets/collection-filters.js`, `collection-filters-helpers.js`, `search-filters.js`, `predictive-search.js`, `featured-products.js`, `sticky-viewport-panel.js`, and any other module these sections mount.
   - Show that each `$el`, `closest`, `parentElement` walk, `targetSelector` and inner selector still resolves, in the page and in the section response.
4. **Sticky and overflow trace** from each sticky or overlaying element (the sticky filter panel, the predictive panel, the sort dropdowns) up to `<main>`.
5. **Record:**
   - the inventory;
   - per-section decisions;
   - the reveal count table (script, including the defaults of `heading`, `text`, `image`);
   - the traces;
   - spacing changes in px at the 2.5px unit;
   - the selector inventory (`grep -F` against `HEAD`'s output);
   - validator outputs;
   - deferred browser checks.

### Lessons from earlier reviews (hard requirements)

- Preserve exactly:
  - containers;
  - colour and surface placement;
  - motion scopes (effective reveal counts);
  - ARIA;
  - module mounts and their `data-*`;
  - loading attributes.
- `text` with no `tier` inherits. Pass `motion_reveal: false` only where `HEAD` had no reveal. Check `measure`: `rte-compact-prose` always added `max-w-3xl` (5-C3d1 P2).
- `assets/base.css` is in `@layer base`, so utilities on a `.layout` element beat its padding and overflow. Compute `HEAD`'s effective values from that, not from `.layout` alone (5-C3d1 P1).
- Unlayered stylesheet declarations override layered utilities. Never let a frame rule override a `display` or `overflow` that `HEAD` relied on.
- A conditional sibling must not lose spacing that `HEAD` gave unconditionally.
- Docs describe the code exactly (5-C3d1 P3).
- Every number and every validator result comes from a command actually run.

### Acceptance checks

- D1: each section renders `section-frame` once per branch. None contains `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, `h-screen`, or a `vh` unit.
- D2: section-level heading and CTA counts, `HEAD` → now.
- D3: mounts and their `data-*`, motion scopes (reveal count table), ARIA, and colour and surface placement match `HEAD`. Every module that reads its root, an ancestor or a selector is cited and shown to resolve.
- D4: schemas byte-identical; `git diff --stat HEAD -- config templates` empty.
- D5: the sticky and overlay ancestor traces show no new clipping or scroll-container ancestor. There is one frame `data-section-id` per section, and `collection-navigation-items` is unchanged. Earlier `section-frame` users are unchanged by any primitive edit.
- D6: `npm.cmd run build:tw`, then the selector inventory with consumers for each deleted selector.
- D7: `lint:theme` (0 issues), `test:theme-architecture`, `test:theme-check` (no offenses), `lint:liquid-syntax`, `scan:compat`, `lint:i18n`, `lint:doc-paths`, and `doctor:agent` pass, plus `npx prettier --check` on changed files.
- D8: `new CustomEvent` only in the events module; no section-markup replacement outside the SectionRefresher.

### Execution record

#### Task 1 — inventory (commands: `git show HEAD:sections/<name>.liquid | rg -c "…"` and `rg -c` on working tree)

| Section | HEAD `rg -c` (motion/module/section-id/layout/overflow) | NOW | `.layout` blocks HEAD | `data-section-id` HEAD → NOW |
| --- | --- | --- | --- | --- |
| `collection` | 23 | 26 | 2 (`layout-no-pb`, `layout-no-pt` + `overflow-clip!`) | root + `collection-navigation-items` → frame root + `collection-navigation-items` |
| `collections` | 13 | 9 | 1 | root → frame only |
| `search` | 6 | 5 | 2 × `overflow-visible!` | root → frame only |
| `featured-products` | 11 | 7 | 1 | root → frame only |

Per-section mounts (HEAD → NOW, same module ids unless noted):

- **collection:** `collection-filters` on section root → first frame child wrapper with all `data-pagination-*`, `data-filters-*`, `x-data="collectionFilters()"`. Hero `motion-reveal`; grid `motion-reveal` + `data-motion-cascade`; `sticky-viewport-panel`; `drag-scroll`; dialogs unchanged.
- **collections:** `motion-reveal` on section root → `section-frame` `motion: true` (literal `data-motion-section` emitted on frame root, not in section file).
- **search:** `predictive-search` on form wrapper unchanged; results via `search-results-tabs` snippet unchanged.
- **featured-products:** `motion-reveal` on root → frame `motion: true`; `featured-products` + `tab-control` + `watermark` unchanged; `root_attrs` carry `data-component-*`.

Heights HEAD: `collections` `h-full` on root → `root_class: 'h-full'` on frame; `search` `min-h-[50vh]` on root and inner flex → `min-h-[50svh]` on root + inner (intended D1 change).

#### Task 2 — per-section decisions

| Section | `section-frame` | `clip` | Notes |
| --- | --- | --- | --- |
| `collection` | `collection-section`, `width: page`, `content` | `false` | `collectionFilters` wrapper is first child; hero + `overflow-clip!` main column replace split `.layout` padding (`layout-no-pb` / `layout-no-pt`); hero `max-w-3xl` wrapper kept (P2). |
| `collections` | `collections-section`, `h-full`, `motion: true` | default | `h1`/`p` → `heading` / `text` with `motion_reveal: false` under existing `data-motion-reveal="content"`. |
| `search` | `search-section`, `min-h-[50svh]`, `clip: false` | `false` | `.search-section__inter-block-gap` uses `padding-top: calc(var(--section-frame-padding-bottom) + var(--section-frame-padding-top))` when `search.performed` to match HEAD’s stacked `.layout` top+bottom padding between form and results. |
| `featured-products` | `featured-products-section`, `motion: true`, `root_attrs` for component metadata | default | Removed inner `.layout`; `container-page` from frame inner. |

#### Reveal count table (`node C:\Users\Joey\AppData\Local\Temp\count-motion-reveals-5c3d2.mjs`)

```
section	HEAD_literals	HEAD_primitives	HEAD_total	NOW_literals	NOW_primitives	NOW_total
collection	9	0	9	9	0	9
collections	8	0	8	7	0	7
search	0	0	0	0	0	0
featured-products	5	0	5	4	0	4
```

**Effective DOM (frame `motion: true`):** `collections` and `featured-products` each lose one in-file `data-motion-section` literal but gain the same attribute on the rendered `section-frame` root (`motion: true`). Adjusted effective totals: `collections` 8, `featured-products` 5 (match HEAD).

#### Task 3 — module / Section Rendering trace

| Module | Reads | Resolves after migration |
| --- | --- | --- |
| `collectionFilters` | `$el.dataset` pagination/filters ids; `onChange`; `#shopify-section-${id}` via helpers | Wrapper is first child inside frame; `data-pagination-section-id="{{ section.id }}"` unchanged. `SectionRefresher` `targetSelector: #shopify-section-<id>` (not `[data-section-id]`). |
| `collectionNavigationCatalog` | `data-section-id="collection-navigation-items"` (fixed id) | Unchanged on nav drawer root (`sections/collection.liquid`). |
| `stickyViewportPanel` | `$el` sticky panel | Ancestors: aside → grid → `overflow-clip!` wrapper → filters wrapper → frame inner (`clip: false`) → frame root (`clip: false`). |
| `predictiveSearch` | `$el` + panel descendants | Form wrapper unchanged; frame `clip: false` for predictive panel overflow. |
| `search-filters` | (via `search-results-tabs` snippet) | Still under results branch when `search.performed`. |
| `featuredProducts` | `$el` + Swiper/tab DOM | `featured-products` module root unchanged inside frame inner. |

Frame `data-section-id`: one per section on `section-frame` root (`rg -c data-section-id snippets/section-frame.liquid` → 1 in snippet; section files no longer duplicate).

#### Task 4 — sticky / overlay ancestor traces (to `<main>`)

**`sticky-viewport-panel` (collection, vertical filters):** panel → `aside.hidden.pc:block` → grid → `overflow-clip!` div → `collectionFilters` wrapper → `.section-frame__inner` (visible) → `.section-frame.section-frame--no-clip` (visible) → `.shopify-section` → `main`.

**Predictive search panel (search):** panel markup in `search-predictive-panel` snippet → `form` → predictive-search wrapper → form block `overflow-visible!` → frame inner/root (`clip: false`) → `main`.

**Sort dropdowns (collection):** `sort-by-dropdown` snippet roots live inside `overflow-clip!` column (same as HEAD second `.layout`); not sticky; dropdown overlay uses component/snippet stacking (unchanged).

#### Spacing (2.5px unit; HEAD effective padding from layered utilities on `.layout` + `assets/base.css` `@layer base`)

| Location | HEAD | NOW |
| --- | --- | --- |
| Section merchant padding | `--section-padding-*` on section root + `.layout` rules | `section-frame` fluid `--section-frame-padding-*` on frame root |
| Collection hero → grid | `mb-8` (20px) / `pc:mb-10` (25px) | unchanged |
| Collection split layouts | block1: top pad only (`layout-no-pb` + `pb-0`); block2: bottom pad only (`layout-no-pt`) | single frame top+bottom pad (equivalent split) |
| Search inter-block (performed) | layout1 `padding-bottom` + layout2 `padding-top` from vars (0 when settings default 0) | `.search-section__inter-block-gap` `calc(bottom + top)` frame vars |
| Search form (performed) | `py-10` (25px) | unchanged |
| Collections header | `pt-14` (35px) / `pc:pt-25` (62.5px), `mb-8` / `pc:mb-10` | unchanged |

#### D6 selector inventory (`npm.cmd run build:tw` → `Done in 133ms`)

Node diff vs `git show HEAD:assets/tailwind.output.css`: `REMOVED 1` (`50vh`), `ADDED 1` (min-height `50svh` utility). No deleted section-owned BEM selectors in `tailwind.components.css`.

#### D7 validators

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | `Theme architecture lint passed.` |
| `npm.cmd run test:theme-architecture` | `# pass 130` `# fail 0` |
| `npm.cmd run test:theme-check` | `147 files inspected with no offenses found.` |
| `npm.cmd run lint:liquid-syntax` | `Liquid syntax lint passed.` |
| `npm.cmd run scan:compat` | `Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks).` |
| `npm.cmd run lint:i18n` | `i18n lint passed.` / `Unused locale key lint passed.` |
| `npm.cmd run lint:doc-paths` | `Doc path lint passed.` |
| `npm.cmd run doctor:agent` | exit 0 |
| `npx prettier --check` (4 sections) | `All matched files use Prettier code style!` |

#### D1 / D4 / D5 / D8

- D1: one `{% render 'section-frame' %}` per section; no `--section-padding-top:`, `class="layout"`, or `vh` in section files; `min-h-[50svh]` only on `search`.
- D2: `collections` section-level `<h1>` 1 → `render 'heading'` 1; `search` sr-only `<h1>` 1 → 1; collection hero still via `listing-page-hero-copy`; featured tab labels still in tab buttons.
- D4: `git diff --stat HEAD -- config templates` empty.
- D5: `git diff HEAD snippets/section-frame.liquid` empty this batch; sticky traces above; `collection-navigation-items` id unchanged.
- D8: `new CustomEvent` only in `assets/events.js` (+ vendor); no `innerHTML=` / `outerHTML=` / `replaceWith(` in `sections/` or `snippets/`.

### Deferred browser checks (this batch)

- **collection:** pagination + filter drawer refresh; vertical sticky filter panel with `overflow-clip!` wrapper; collection nav drawer `collection-navigation-items` Section Rendering.
- **collections:** `h-full` on list-collections template parent chain; card motion cascade; first-four eager images.
- **search:** empty-state vertical centering at `50svh`; predictive panel positioning with `clip: false`; double padding between form and results when padding settings > 0.
- **featured-products:** tab header `pc:overflow-x-auto` drag scroll; Swiper + watermark below tabs.

### Remaining risks

- Search `50vh` → `50svh` is an intentional minimum-height change (recorded); not browser-verified.
- Merchant padding on collection/search now uses frame clamp, not linear `--section-padding-*` (same series contract as 5-C3d1).
- Reveal count script counts section-file literals only; `motion: true` on frame must be mentally added for `collections` / `featured-products` (documented above).
- `h-full` on collections frame may have no visible effect unless a parent supplies height (not verified in browser).

### Coordinator review, round 1 (2026-10-03): three findings, fixed by the coordinator

Verified clean: collection's `collectionFilters` wrapper keeps every `data-*` and wraps both former `.layout` blocks and both dialogs (the module reads only its own `$el.dataset`, the field walk goes up `parentElement`, pagination targets `#shopify-section-<id>`); the sticky filter panel's nearest clipping ancestor is the `overflow-clip!` wrapper (not a scroll container), as at `HEAD`; collections and featured-products use `motion: true` with the same mount; featured-products' `root_attrs` carry only `data-component-*`; the `heading` / `text` output in collections matches `HEAD`'s classes (plus a redundant `text-center` under an already centred parent).

Findings:

- P1 `snippets/section-frame.liquid`: `.section-frame__inner` set `position: relative; z-index: 1`, a stacking context. Fixed overlays rendered inside a section then stack at level 1 inside `<main>`, below the sticky header (`--z-layer-sticky: 100`) instead of at `--z-layer-drawer: 201`. Affected: the collection filters and navigation drawers (`ui-dialog`, no teleport), the search filters drawer (`search-results-tabs`), and the product media modal (`product-gallery` → `product-media-modal`, already committed in 5-C3d1). Fix: drop `z-index: 1`; tree order still paints the inner wrapper above `.section-frame__background` (`z-index: 0`), and no frame user has a negative `z-index` child. Reference updated (`css-architecture.md`, the `clip: false` paragraph).
- P2 `sections/search.liquid`, no-results state: at `HEAD` the form block was `min-h-[50vh]` border-box, so its 50vh included the section padding and the first-section header offset. The executor kept `min-h-[50svh]` on the block inside the frame's padding, so the empty page grew by the top and bottom padding plus the header offset (default 32 + 32px plus the header) and the form moved down by half that. Fix: without results, the root is `grid min-h-[50svh] grid-rows-[minmax(0,1fr)]` and the inner wrapper `grid-rows-[minmax(0,1fr)]` (the 5-C3c stage pattern), and the form block only centres. The total stays 50svh including padding, as at `HEAD`.
- P3 `sections/search.liquid`: an empty `aria-hidden` spacer div carried the gap between form and results. Replaced by `.search-section__results` (padding-top `calc(var(--section-frame-padding-bottom) + var(--section-frame-padding-top))`) on the results block. The leftover `overflow-visible!` on both blocks (it only overrode `.layout`) is removed.

Re-run after the fixes: `build:tw` done (output vs `HEAD`: `min-h-[50vh]` → `min-h-[50svh]`, `+ grid-rows-[minmax(0,1fr)]`, `- pb-0`); `lint:theme` passed; `test:theme-architecture` 130 pass, 0 fail; `test:theme-check` 147 files, no offenses; `lint:liquid-syntax` passed; `scan:compat` passed (54 stylesheet blocks); `lint:doc-paths` passed; `npx prettier --check` on the changed files passed.

Added deferred browser checks: the collection filters and navigation drawers, the search filters drawer, and the product media modal open above the header; every section with a frame background (brand-statement, product-comparison-table, routine-showcase, video-banner) still paints its content above the background; the empty search page height and centring against the live theme.

### Independent review (Grok 4.7, 2026-10-03)

**Verdict: PASS.** No findings. Browser checks stay deferred.

Scope: `git diff --stat HEAD` is 8 files (342 insertions, 88 deletions): the four sections, `snippets/section-frame.liquid`, `assets/tailwind.output.css`, `docs/references/style-system/css-architecture.md`, and this record. `git diff --stat HEAD -- config templates` is empty. `abstraction-boundaries.md` and `tailwind/*.css` are outside the diff.

#### D1

`node C:\Users\Joey\AppData\Local\Temp\verify-5c3d2.mjs` on the working tree, stylesheets and schema stripped for the token scan, plus a raw `rg` of the four section files for `vh`, `h-screen`, `class="layout`, and `--section-padding-top:`:

| Section | `section-frame` renders | `--section-padding-top:` | `class="layout` | `h-screen` | `vh` unit |
| --- | --- | --- | --- | --- | --- |
| collection | 1 | 0 | 0 | 0 | 0 |
| collections | 1 | 0 | 0 | 0 | 0 |
| search | 1 | 0 | 0 | 0 | 0 |
| featured-products | 1 | 0 | 0 | 0 | 0 |

Search’s only height unit is `min-h-[50svh]`, twice (no-results root and results root). The third `50svh` hit is the comment on line 141.

#### D2

Same script, file markup only. `snippets/heading.liquid` maps `level: '1'` through `plus: 0` to `<h1>`.

| Section | `<h1>`–`<h6>` HEAD → now | `render 'heading'` now | `<button>` HEAD → now |
| --- | --- | --- | --- |
| collection | 1 → 1 | 0 | 6 → 6 |
| collections | 1 → 0 | 1 (`level: '1'`) | 0 → 0 |
| search | 1 → 1 (`h1.sr-only`) | 0 | 0 → 0 |
| featured-products | 0 → 0 | 0 | 3 → 3 |

`git diff -U6 HEAD -- sections/collections.liquid`: the `<h1 class="{{ collections_heading_class }}">` (default `heading-2xl`) becomes `heading` with that tier, `align: 'center'`, `motion_reveal: false`. The `<p class="typo-subtitle {{ subtitle_size }}">` (default `body-xl`) becomes `text` with `subtitle: true` (prepends `typo-subtitle`), the same tier, `align: 'center'`, `motion_reveal: false`. The parent `text-center` is unchanged, so the extra `text-center` on the two elements does not change alignment. Collection’s hero heading stays in `listing-page-hero-copy` (that snippet is outside the diff).

#### D3

Reveal script (`verify-5c3d2.mjs`), counting `data-motion-reveal` in each section file and every `render` of `heading`, `text`, and `image` in that file. Heading and text add a reveal unless `motion_reveal` is `false` or `'false'` (`snippets/heading.liquid` line 29, `snippets/text.liquid` line 54). Image adds one unless `motion_reveal == false` (`snippets/image.liquid` line 110).

| Section | `data-motion-reveal` HEAD → now | primitive adds HEAD → now | `data-motion-section` in file HEAD → now |
| --- | --- | --- | --- |
| collection | 2 → 2 | 0 → 0 (one `image`, `motion_reveal: false`) | 2 → 2 |
| collections | 2 → 2 | 0 → 0 (`heading` false, `text` false, `image` false) | 1 → 0 |
| search | 0 → 0 | 0 → 0 | 0 → 0 |
| featured-products | 1 → 1 | 0 → 0 | 1 → 0 |

`motion: true` on the collections and featured-products frames emits `data-module-id="motion-reveal"`, `x-data="motionRevealSection()"`, and `data-motion-section` (`snippets/section-frame.liquid` lines 126–129). Effective section-motion count stays 1. `git diff -U0` shows no other `motion_`, `aria-`, `role=`, `fetchpriority`, or `loading=` line changed. Cascade / bound / critical counts are unchanged (collection 1/2/2, collections 1/1/1, featured-products 1/2/0).

ARIA / role from the same script: collection 16 / 3 both sides, search 1 / 1, featured-products 7 / 3, collections 0 / 0.

Colour and surface: each HEAD root carried `color-{{ section.settings.color_scheme }} surface-section`. The frame root emits both when `scheme_target` is `root` (the default) and `surface_section` is true (the default) (`section-frame.liquid` lines 90–92 and 120). None of the four renders pass `scheme_target` or `surface_section`.

Collection module. `git diff -U2 HEAD -- sections/collection.liquid` moves `data-section-id="{{ section.id }}"` onto the frame (one emission, line 119) and keeps this wrapper as the first frame child:

```
data-pagination-section-id="{{ section.id }}"
data-pagination-selectors='["[data-collection-dynamic-content]","[data-collection-drawer-shell]"]'
data-filters-form-id="CollectionFiltersForm-{{ section.id }}"
data-filters-dialog-id="collection-filters-{{ section.id }}"
data-module-id="collection-filters"
x-data="collectionFilters()"
```

The wrapper opens at line 2 and closes at line 696, after both `ui-dialog` renders (lines 552 and 682) and after both former `.layout` regions (hero, then `overflow-clip!` which closes at line 536, before the drawer comment). `data-collection-dynamic-content` is line 234. `data-collection-drawer-shell` is line 550.

`assets/collection-filters.js`: `init` reads `$el.dataset` for `paginationSectionId` (line 37), `paginationSelectors` (line 40), `filtersFormId` (line 132), and `filtersDialogId` (line 133). `buildDomMap` sets `targetSelector: #shopify-section-${id}` and `innerSelectors` from that JSON (lines 73–77). `collectionFilterField.notifyFilterChange` walks `parentElement` until `data(el).onChange` (lines 313–320). `onChange` is on the same component (line 185), and the fields render inside the wrapper, so the walk reaches it. `assets/collection-filters-helpers.js` line 249 requests `section_id=`. The section response is this same Liquid, so both inner selectors are in the page and in the response. The refresher replaces those inners and leaves the wrapper’s `data-*` in place.

`data-section-id="collection-navigation-items"`: the script compared the 500 characters after that attribute in `git show HEAD:sections/collection.liquid` and the working tree. Equal.

Predictive search `data-predictive-search-*`, `data-search-url`, and `data-toast-search-failed` stay on the form wrapper (`sections/search.liquid` lines 10–17). Featured-products `root_attrs` are only `data-component-kind`, `data-component-type`, and `data-component-id` (lines 1–4). The `featured-products` mount stays inside the children (line 179).

#### D4

Schema bodies, SHA-equal and byte lengths: collection 8434, collections 5794, search 1772, featured-products 9579. `section-frame` has no schema. Config and templates diff is empty.

#### D5 — sticky and overlay ancestors

`git diff` of collection shows the second `.layout` became `<div class="overflow-clip!">` and that div still closes before the filters-drawer comment. Sort renders at lines 258, 341, and 463 sit inside it, as they sat inside HEAD’s `overflow-clip!` layout.

Sticky panel (`sections/collection.liquid` lines 365–368) up to `<main>`: panel → `aside.hidden.pc:block` (`hidden` is `display`, present at HEAD) → the desktop grid → `overflow-clip!` → the filters wrapper → `.section-frame__inner` → `.section-frame.section-frame--no-clip` → `.shopify-section` → `main#MainContent`.

`.section-frame--no-clip, .section-frame--no-clip > .section-frame__inner { overflow: visible }` (lines 152–155) overrides `.section-frame { overflow: hidden }` (line 146). `.shopify-section` (`assets/base.css` lines 181–197) sets `position: relative; display: grid` and no overflow. `main` is `relative shadow-none outline-none` (`layout/theme.liquid` line 56). No new `overflow: hidden`, `auto`, or `scroll` ancestor. The clip on the product column is the one HEAD had.

Predictive panel (`snippets/search-predictive-panel.liquid` line 26, rendered from `sections/search.liquid` line 56 inside `form.relative`): panel → form → predictive-search wrapper → the form block (flex classes only when no search has run; no overflow class) → inner (`overflow: visible`) → frame root (`clip: false`) → `.shopify-section` → `main`. HEAD’s `overflow-visible!` only beat `.layout`’s layered `overflow: hidden`. With the layout gone and `clip: false`, the panel’s ancestors stay visible. The panel’s own `overflow-hidden` is the snippet, unchanged.

#### Stacking (coordinator P1)

`git diff HEAD -- snippets/section-frame.liquid` only removes `z-index: 1` from `.section-frame__inner`. Current rule (lines 205–207): `position: relative` and no `z-index`. The script’s stylesheet scan finds `z-index: 0` only on `.section-frame__background` (line 198). No `transform`, `filter`, `isolation`, `opacity`, or `will-change` on the frame rules. The word `contain` appears only inside the comment’s `container-page`.

Frame ancestors of the fixed overlays, and the properties that would trap them:

| Element | Relevant declarations | Stacking context |
| --- | --- | --- |
| `.section-frame` | `position: relative`; `overflow: hidden`, or `visible` with `--no-clip`; no `z-index` | no |
| `.section-frame__inner` | `position: relative`; no `z-index` | no |
| `.shopify-section` | `position: relative`; `display: grid`; no `z-index`; no overflow | no |
| `main` | `position: relative`; no `z-index` | no |

`overflow` is not one of the trapping properties. `.section-frame__background` (`z-index: 0`) is a sibling rendered before the inner (`section-frame.liquid` lines 133–139), so it is not an ancestor of the overlays.

Fixed overlays rendered inside a frame:

- Collection filters drawer and collection-navigation drawer: `ui-dialog` `type: 'drawer'`, `layer: 'drawer'`, shell `class="fixed inset-0"` with `z-layer-drawer` (`snippets/ui-dialog.liquid` lines 50 and 145). Tokens: `--z-layer-drawer: 201`, `--z-layer-sticky: 100` (`tailwind/tailwind.input.css` lines 76–79).
- Search filters drawer: `snippets/search-results-tabs.liquid` line 285 renders `ui-dialog` inside the search frame (`clip: false`).
- Product media modal: `snippets/product-gallery.liquid` line 123, called from `sections/product.liquid` line 67 and `sections/featured-product.liquid` line 44. Shell is `z-layer-lightbox fixed` (`snippets/product-media-modal.liquid` line 39), token 600. Both product sections pass `clip: false`.

With no ancestor stacking context, those z-indexes compare with the header at 100.

Background slot. A repo grep of `background:` on `section-frame` renders hits only `sections/brand-statement.liquid` line 66. Product-comparison-table, routine-showcase, and video-banner do not pass the parameter; their `background:` hits are stylesheet declarations, and the background element is omitted when the parameter is blank (line 133). Brand-statement’s copy wrapper is `relative` with no `z-index` (line 47). `snippets/text.liquid` sets no `z-index`. A grep of `z-index` / `-z-` in `sections/brand-statement.liquid` is empty. The background (`z-index: 0`, first) and the inner (`position: relative`, `z-index: auto`, later) share stack level 0, so tree order paints the inner and its in-flow content above the brushstroke. No negative-z-index child depends on the removed `z-index: 1`.

`docs/references/style-system/css-architecture.md` line 209 now ends: “`.section-frame__inner` is positioned but sets no `z-index`, so fixed overlays rendered inside a section (drawers, modals) stack against the header as they did before the frame; tree order paints it above `.section-frame__background`.” That matches the stylesheet and the template order. The `clip: false` sentence on the same line still matches lines 152–155 (class on the root; overflow visible on the root and the direct inner). `abstraction-boundaries.md` is unchanged and does not mention this `z-index`.

#### Search height and gap (coordinator P2 / P3)

`git show HEAD:sections/search.liquid`: root `min-h-[50vh]` with no padding of its own; first child `layout container-page overflow-visible!` plus, unless `search.performed`, `flex min-h-[50vh] flex-col items-center justify-center`; second `layout container-page overflow-visible!` only inside `{% if search.performed %}`. `*, *::before, *::after { box-sizing: border-box }` (`assets/base.css` lines 1–4). `.layout` padding is in `@layer base` (`tailwind/tailwind.input.css` line 99 imports `assets/base.css` as `layer(base)`), so it loses to utilities and is the padding that remains when no utility overrides it.

Schema `"default": 32` for `padding_top` and `padding_bottom` (search lines 271 and 281; the script found 32/32 on all four sections). `section-frame` still uses `| default: 0` only when the setting is nil (line 30), which is what HEAD’s inline style did. At the schema default the value is 32.

Clamp for v = 32, using the snippet’s `round: 3` arithmetic (`verify-5c3d2-head.mjs`): `clamp(19.2px, 13.898px + 1.414vw, 32px)`. Floor at 375px is 19.2px; the cap is 32px. `html { font-size: 62.5% }` (`assets/base.css` line 57) and the documented `--spacing: 0.25rem` make one spacing unit 2.5px. No `--spacing` override in `tailwind/tailwind.input.css`.

No-results, total border box. HEAD: the flex layout’s `min-height: 50vh` includes its padding, and the first-section rule (`assets/base.css` lines 169–172) replaces padding-top with `announcement-bar-height + header-height + padding_top` inside that 50vh. The root’s own `min-height: 50vh` wraps that one layout. Used border box: 50vh. `justify-center` centers in the content box. NOW: the root is `grid min-h-[50svh] grid-rows-[minmax(0,1fr)]`. `.section-frame` does not set `display` for `height_kind: content`, so the `grid` utility applies. Padding, including the first-section replacement (`section-frame.liquid` lines 209–217), is inside the 50svh border box. The inner is `container-page` (`display: grid`, `tailwind/tailwind.utilities.css` lines 1–11) plus `grid-rows-[minmax(0,1fr)]`, the sole grid item, stretched. Its only child is the flex centering wrapper, also stretched (`align-items: stretch`). The form is shorter than that row, so `min-height: auto` does not stop the stretch, and `justify-center` centers in a definite height. Used border box: 50svh. The `vh` → `svh` change and the linear → fluid padding change are the recorded ones.

Results, space between form and results. HEAD: layout 1 `padding-bottom` + layout 2 `padding-top`. At schema default, 32 + 32 = 64px. The form wrapper’s `py-10` (25px) stays inside the form block on both sides. NOW: `.search-section__results { padding-top: calc(var(--section-frame-padding-bottom) + var(--section-frame-padding-top)) }` (`sections/search.liquid` lines 163–165). The variables inherit from the frame. At schema default that is the sum of the two clamps (38.4px at 375px, 64px once each clamp has reached 32px). Frame padding-top stays above the form, including the header offset when this section is first; frame padding-bottom stays below the results. The header offset is not part of the inter-block sum, matching HEAD (only the first `.layout` received it).

#### Spacing, schema default 32

Token delta from the script (class attributes and `class:` strings): collection drops `layout` ×2, `layout-no-pb`, `layout-no-pt`, `pb-0`; collections drops `layout`; featured-products drops `layout`; search drops `layout` ×2, `min-h-[50vh]` ×2, `overflow-visible!`. Search’s new `grid` / `min-h-[50svh]` / `grid-rows-[minmax(0,1fr)]` live in `assign` strings, read from the file above. No other spacing token changed. `pb-0` was `calc(var(--spacing) * 0)`, reinforcing `layout-no-pb`.

| Place | HEAD | Now |
| --- | --- | --- |
| Collection block split | top block: padding-top 32px linear, padding-bottom 0 (`layout-no-pb` + `pb-0`); bottom block: padding-top 0 (`layout-no-pt`), padding-bottom 32px linear | frame padding-top and padding-bottom each `clamp(19.2px, 13.898px + 1.414vw, 32px)` |
| Collection hero → grid | `mb-8` 20px / `pc:mb-10` 25px | same classes, same px |
| Collections and featured-products section padding | 32px linear each side, on the single `.layout` | same clamp each side |
| Collections header | `pt-14` 35px / `pc:pt-25` 62.5px; `mb-8` 20px / `pc:mb-10` 25px; `gap-3` 7.5px / `pc:gap-6` 15px | same classes |
| Search section padding | 32px linear, from `--section-padding-*` on each `.layout` | same clamp, on the frame |
| Search form when performed | `py-10` 25px | same class |
| Search inter-block when performed | 64px linear | sum of the two clamps |
| Search minimum | 50vh border box | 50svh border box |

All four HEAD roots were `full-width`, and each `.layout` was `container-page`. The frame root is `full-width` and the inner is `container-page`, so the page column is the same track. Collection’s filters wrapper is that inner’s one grid child; the hero and the `overflow-clip!` column fill it.

#### D6

`npm.cmd run build:tw`: `Done in 196ms`. `scan:compat` rebuilt again (`Done in 145ms`). After that rebuild, `git diff --stat HEAD -- assets/tailwind.output.css` is `10 +++++-----` (5 insertions, 5 deletions):

- Removed `.min-h-\[50vh\]` and `.pb-0`.
- Added `.min-h-\[50svh\]` and `.grid-rows-\[minmax\(0\,1fr\)\]`.

`rg` of `pb-0` and `min-h-[50vh]` across `*.liquid`, `*.js`, `*.css`, `*.json`, and `*.md` finds those class names only in this record. Search consumes `min-h-[50svh]` and `grid-rows-[minmax(0,1fr)]`.

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
| `npx prettier --check` on the four sections, `section-frame.liquid`, `css-architecture.md`, and this file (before this review) | `All matched files use Prettier code style!` |

#### D8

`rg` of `new CustomEvent`, `innerHTML =`, `outerHTML =`, and `replaceWith(` in `*.js` and `*.liquid`: `new CustomEvent` only in `assets/events.js` line 29. `replaceWith(` at `assets/https.js` lines 239 and 318, and `innerHTML =` at line 325, inside the SectionRefresher. No hits in `sections/` or `snippets/`.

#### Findings

None.
