# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-03.

## Batch 5-C3d1: migrate product core sections

Status: executed and accepted. Independent review round 2 PASS (Grok 4.7, 2026-10-03). Authorized 2026-10-03 ("继续"). Reviewer: independent reviewer the user names at review time.

### Direction

CSS step 3 series. Batch d is split by risk into d1 (product core, this batch), d2 (listing and search: collection, collections, search, featured-products), and d3 (cart, blog, blog-stories, article).

- This batch changes the section level only: frame, section headings, spacing, and section-owned CSS.
- The large component snippets these sections render (`product-gallery`, `product-info-blocks`, and so on) are not restructured here; their build CSS is a later step.
- Heights and visuals stay as at `HEAD`, identical or close (user, 2026-10-03).
- The rules are in `docs/references/style-system/css-architecture.md` and `docs/references/architecture/abstraction-boundaries.md`.
- Precedents and their review rounds: `git show 4c006ea:docs/agent/context.md` (5-C3a), `29baadc` (5-C3b), `920f34d` (5-C3c).

### Implementation surface

- Sections (3): `product`, `featured-product`, `product-recommendations`.
- `snippets/product-recommendations-section.liquid`, only if its section-level wrapper must change; list its consumers.
- `snippets/section-frame.liquid`: backward-compatible additions only. Expected: a no-clip option (see task 2).
- Other primitives: backward-compatible additions only.
- `tailwind/tailwind.components.css`: only rules owned by these three sections, under the refined move rule.
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
  - the component snippets' internals (`product-gallery*`, `product-info-blocks`, `buy-buttons`, `product-variant-picker`, `quantity-selector`, `product-media*`).

### Tasks

1. **Inventory, command-counted, recorded**, for each section:
   - root attributes and inner module mounts (`product-layout`, `related-products`, `motion-reveal`);
   - every `data-motion-*` scope;
   - headings and CTAs at section level;
   - margins and `space-y`, in markup and in stylesheets;
   - heights, including the `svh` media caps in `product`;
   - `.layout` uses and flags, and every `overflow-visible!` override;
   - sticky targets (`data-product-media-sticky-target`, `data-product-info-sticky-target`) and their ancestors' `overflow`.
2. **Sticky and overflow.**
   - At `HEAD`, `product` and `featured-product` override `.layout`'s `overflow: hidden` with `overflow-visible!`, so their sticky columns work. `position: sticky` stops working under an ancestor whose overflow is not visible.
   - `section-frame`'s root sets `overflow: hidden`. Add a backward-compatible option that leaves both the root and the inner wrapper unclipped, and use it here.
   - Trace every ancestor of each sticky target, from the target up to `<main>`, and record that none clips.
3. **Section Rendering.**
   - `assets/related-products.js` re-renders through `SectionRefresher` with `targetSelector` `[data-section-id="<id>"]` and `innerSelectors` `['[data-related-products-content]']`.
   - After migration, exactly one element per section carries `data-section-id` (the frame root), and `[data-related-products-content]` stays inside it in both the page and the section response.
   - Read `assets/product-layout.js` and every module these sections mount, and show that each selector and root they read still resolves.
4. **Migrate** each section onto `section-frame` with its `HEAD` height kind (content). Keep `HEAD`'s colour and surface placement, using `scheme_target` / `surface_section` as needed. Section headings and copy go through the primitives; sibling margins become gaps.
5. **Contracts:**
   - the product media `svh` caps (`80svh`, `90svh`, `100svh`) stay as caps;
   - LCP and loading attributes on the first product media are unchanged;
   - product JSON-LD, the product form, the variant picker, and buy buttons are untouched.
6. **Record:**
   - the inventory;
   - per-section decisions;
   - the reveal count table (script);
   - the sticky ancestor trace;
   - the Section Rendering selector trace;
   - spacing changes at the 10px root (2.5px unit);
   - the selector inventory (`grep -F` against `HEAD`'s output);
   - validator outputs;
   - deferred browser checks.

### Lessons from earlier reviews (hard requirements)

- Preserve exactly:
  - containers;
  - colour and surface placement (`scheme_target`, `surface_section`);
  - motion scopes, counting effective reveals with a script that includes the defaults of `heading`, `text`, and `image`;
  - ARIA;
  - module mounts;
  - loading attributes.
- `text` with no `tier` inherits. Pass `motion_reveal: false` only where `HEAD` had no reveal.
- Unlayered stylesheet declarations override layered utilities. Never let a frame or stage rule override a utility's `display` (the `container-page` grid) or `overflow` that `HEAD` relied on.
- A conditional sibling must not lose spacing that `HEAD` gave unconditionally.
- Every number and every validator result comes from a command actually run. Pixel values use the 2.5px unit.

### Acceptance checks

- D1: each section renders `section-frame` once per branch. None contains `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, `h-screen`, or a `vh` unit; `svh` caps are allowed.
- D2: section-level heading and CTA counts, `HEAD` → now.
- D3: mounts, motion scopes (reveal count table), ARIA, colour and surface placement match `HEAD`. Every module that reads its root or a selector is cited and shown to resolve.
- D4: schemas byte-identical; `git diff --stat HEAD -- config templates` empty.
- D5: the sticky ancestor trace shows no clipping ancestor. The Section Rendering trace shows one `data-section-id` per section and the inner selector present. Earlier `section-frame` users are unchanged by any primitive edit.
- D6: `npm.cmd run build:tw`, then the selector inventory with consumers for each deleted selector.
- D7: `lint:theme` (0 issues), `test:theme-architecture`, `test:theme-check` (no offenses), `lint:liquid-syntax`, `scan:compat`, `lint:i18n`, `lint:doc-paths`, and `doctor:agent` pass, plus `npx prettier --check` on changed files.
- D8: guards hold: `new CustomEvent` only in the events module; no section-markup replacement outside the SectionRefresher.

### Deferred browser checks

- **product / featured-product:** the classless `productLayout` wrapper (first frame child) does not let media widen the page column; desktop sticky column choice (`product-layout.js`) after `clip: false` on `section-frame`; magnifier/zoom overflow vs former `.layout.overflow-visible!`.
- **featured-product:** motion reveal when a product is selected (`motionRevealSection` on inner wrapper, unchanged mount topology).
- **product-recommendations:** Section Rendering API refresh still replaces `[data-related-products-content]`; loading/timeout/error `x-show` states and retry buttons.
- **product-recommendations padding:** merchant settings now govern (default 32, 19.2–32px fluid) instead of `HEAD`'s utility override (30 / 40px).
- **Padding:** merchant padding now uses `section-frame` fluid clamp (same contract as 5-C3a–c) instead of linear `--section-padding-*` on the old root.

### Execution record

#### Task 1 — inventory (commands: `rg` on working tree; HEAD via `git show HEAD:<path>`)

| Section / snippet | `data-motion-*` literals (HEAD → NOW) | `data-module-id` mounts (HEAD → NOW) | Section-level `<h*>` (HEAD → NOW) | `<button` in snippet (HEAD → NOW) | `.layout` / `overflow-visible!` (HEAD) | `svh` caps |
| --- | --- | --- | --- | --- | --- | --- |
| `product` | 0 → 0 | `product-layout` on section root → inner child of frame | 0 → 0 | — | `.layout.container-page.overflow-visible!` → removed (frame `clip: false`) | `80svh` / `90svh` / `100svh` via `max_height` on gallery (unchanged) |
| `featured-product` | 2 → 2 (`data-motion-section`, `data-motion-bound`) | `product-layout` root + conditional `motion-reveal` on inner wrapper → same topology, one level deeper inside frame | 0 → 0 | — | same as product | — |
| `product-recommendations` | 0 in section; snippet 6 → 6 | `related-products` + nested `motion-reveal` on `[data-related-products-content]` → unchanged | snippet 3× `<h2>` → 3× `{% render 'heading' %}` | 2 → 2 | `.layout.container-page` on snippet root → removed; `py-12 pc:py-16` kept | — |

`rg -c "data-motion-reveal|data-motion-section|data-motion-cascade|data-motion-bound"` (NOW): `featured-product` 2; `product-recommendations-section` 6. HEAD snippet count: 6 (`git show HEAD:snippets/product-recommendations-section.liquid | rg -c data-motion`).

#### Task 2 — sticky and overflow

- **`section-frame`:** `clip: false` adds `section-frame--no-clip` on root and sets `overflow: visible` on root and `.section-frame__inner`. Default `clip` remains true (backward compatible).
- **Sticky ancestor trace** (both `data-product-media-sticky-target` and `data-product-info-sticky-target`, product and featured-product):
  1. sticky target (`self-start` on info column)
  2. `data-product-media-column` / inner flex column (media)
  3. grid
  4. optional `motionRevealSection` wrapper (featured-product only, when product set)
  5. `productLayout` module root (`x-data="productLayout"`)
  6. `.section-frame__inner.container-page` — **visible** (`section-frame--no-clip`)
  7. `.section-frame.section-frame--no-clip` — **visible**
  8. `.shopify-section` → `main`
- **Intentional clip (unchanged):** `[data-product-media-panel]` keeps `overflow-hidden` for the gallery panel (not a sticky target).
- **Removed:** `.layout { overflow: hidden }` + `overflow-visible!` override; replaced by frame no-clip.

#### Task 3 — Section Rendering and module selectors

| Module | Root / selector | Resolves after migration |
| --- | --- | --- |
| `product-layout` | `$el` + `[data-product-media-sticky-target]`, `[data-product-media-panel]`, `[data-product-info-sticky-target]`, `[data-product-info-panel] [data-product-info-blocks]` | `productLayout` mount moved inside frame children; all selectors remain descendants of `$el`. |
| `related-products` | `$el.dataset.relatedProductsUrl`, `$el` for `IntersectionObserver` | Still the `py-12` wrapper inside frame inner; unchanged. |
| `SectionRefresher` (`related-products.js`) | `targetSelector: [data-section-id="<id>"]`, `innerSelectors: ['[data-related-products-content]']` | Exactly one `data-section-id` on `section-frame` root (`snippets/section-frame.liquid`); `[data-related-products-content]` remains inside that subtree in section HTML response. |
| `motionRevealSection` | featured inner wrapper when product present | Unchanged conditional attributes. |

`product-recommendations-section.liquid` consumers: `sections/product-recommendations.liquid` only.

#### Task 4 — per-section decisions

| Section | `section-frame` | `clip` | `scheme_target` / surface | Notes |
| --- | --- | --- | --- | --- |
| `product` | `section_class: product-section`, `width: page`, `height_kind: content` | `false` | default root `color-{{ … }}` + `surface-section` | Gallery `max_height` svh caps and LCP-related gallery params untouched. |
| `featured-product` | `featured-product-section`, content height | `false` | default root | Motion on inner wrapper when product set; `motion_reveal: true` on gallery unchanged. |
| `product-recommendations` | `product-recommendations-section`, content height | default `true` | default root | Snippet: headings via `heading`, description via `text` (`motion_reveal: false`); header/grid `mt-8` → parent `gap-8`. |

#### Reveal count table

Literal `data-motion-*` counts match HEAD (6 in recommendations snippet; 2 in featured-product). Section-level `heading` / `text` use `motion_reveal: false` where the parent already has `data-motion-reveal="content"` (3 heading + up to 3 text per snippet paths). No new primitive default reveals added.

#### Spacing (10px root, 2.5px unit)

| Location | HEAD | NOW |
| --- | --- | --- |
| Section merchant padding | `--section-padding-top/bottom: Npx` on section root + `.layout` padding rules | `section-frame` fluid clamp on frame root |
| Recommendations inner | `.layout` + `py-12 pc:py-16` (30px / 40px) | `py-12 pc:py-16` on module wrapper (unchanged) |
| Recommendations header → grid | `mt-8` (20px) | `gap-8` on flex column wrapper (20px) |
| Recommendations status rows | `mt-6` (15px) on loading/timeout/error | unchanged (conditional siblings) |
| Product grid gaps | `gap-8` / `pc:gap-10` / `fw:gap-12` | unchanged |

#### D6 selector inventory

`npm.cmd run build:tw` → `Done in 128ms` (first run) / `Done in 126ms` (scan:compat).

Node diff vs `git show HEAD:assets/tailwind.output.css`: `REMOVED total 0`, `ADDED total 0`. No deleted section-owned selectors (no `.product-section` rules existed in components).

#### Validators (D7)

| Command | Result |
| --- | --- |
| `npm.cmd run build:tw` | `Done in 128ms` |
| `npm.cmd run lint:theme` | `Theme architecture lint passed.` |
| `npm.cmd run test:theme-architecture` | `# tests 130` `# pass 130` `# fail 0` |
| `npm.cmd run test:theme-check` | `147 files inspected with no offenses found.` |
| `npm.cmd run lint:liquid-syntax` | `Liquid syntax lint passed.` |
| `npm.cmd run scan:compat` | `Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks).` |
| `npm.cmd run lint:i18n` | `i18n lint passed.` / `Unused locale key lint passed.` |
| `npm.cmd run lint:doc-paths` | `Doc path lint passed.` |
| `npm.cmd run doctor:agent` | exit 0 (no output) |
| `npx prettier --check` (changed paths) | `All matched files use Prettier code style!` |

#### D1 / D4 / D5 / D8 spot checks

- D1: each of the three sections has one `{% render 'section-frame' %}`; no `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, or `h-screen`; `svh` only in product gallery `max_height` logic.
- D4: `git diff --stat HEAD -- config templates` empty; no `+{% schema` lines in section diffs.
- D5: pilot sections `brand-statement`, `newsletter-banner`, `promotion-countdown` unchanged; `section-frame` diff is additive (`clip` only).
- D8: `rg "new CustomEvent" assets -g "*.js"` → `assets/events.js` only (plus vendored Alpine). No `innerHTML=` / `outerHTML=` / `replaceWith(` in `sections/` or `snippets/`.

#### Remaining risks

- Sticky and Section Rendering behavior unverified without browser (deferred above).
- Featured-product empty state: motion wrapper omitted when no product (same as HEAD).
- First-product-section safe-top uses frame first-child rule; visual parity with HEAD first-section offset not browser-checked.

### Coordinator review, round 1 (2026-10-03): one finding, fixed

Verified clean:

- Validators re-run by the coordinator:
  - `lint:theme` "Theme architecture lint passed."
  - `test:theme-architecture` 130/130.
  - `test:theme-check` 147 files, no offenses.
  - `lint:liquid-syntax` passed.
  - `scan:compat` passed (54 stylesheet blocks).
  - `lint:i18n` (both checks) passed.
  - `lint:doc-paths` passed.
  - `doctor:agent` exit 0.
- `section-frame` `clip: false` adds `section-frame--no-clip` (`overflow: visible` on the root and the inner wrapper), declared after `.section-frame` with equal specificity. Earlier users are unaffected.
- Effective reveals, `HEAD` → now: product 0/0, featured-product 0/0, product-recommendations 0/0; snippet `product-recommendations-section` 3/0 → 3/0.
- Unchanged against `HEAD`: sticky targets (2 each in product and featured-product), `data-related-products-content` (1), ARIA (4), and motion sequence / cascade / bound scopes.
- `data-section-id`: one per section, now on the frame root.
- `productLayout` moved from the section root to the first frame child. `assets/product-layout.js` reads only descendants (`el.querySelector` of the sticky targets and panels), so the move is safe. featured-product keeps `HEAD`'s nesting (`product-layout` outside `motion-reveal`).
- Colour and surface placement: root colour plus surface on all three, as at `HEAD`. `overflow-hidden` counts are unchanged (the gallery column, present at `HEAD`).

Finding:

- P1 (medium) product-recommendations: vertical padding is now applied twice, and the record says "unchanged".
  - At `HEAD`, the snippet's wrapper carried `.layout` and `py-12 pc:py-16`. `assets/base.css` is imported into `@layer base` (`tailwind/tailwind.input.css`), so the `utilities`-layer `py-12` won, and the merchant `padding_top` / `padding_bottom` settings (default 32) had no effect. The effective padding was 30px, or 40px from `pc`.
  - Now `section-frame` applies the merchant padding (19.2–32px fluid at the default) on the root, and the wrapper keeps `py-12 pc:py-16`, so about 62–72px at the default on desktop.
  - Recommended fix: remove `py-12 pc:py-16` from the wrapper, so the merchant settings take effect at default 32 (19.2–32px fluid), close to `HEAD`'s 30 / 40px. This is the same reasoning the user accepted for custom-liquid in 5-C3b.
  - Fixed by the coordinator (user: "直接改", 2026-10-03): the wrapper in `snippets/product-recommendations-section.liquid` now has no class attribute. Intended change: product-recommendations vertical padding is governed by the merchant settings through `section-frame`.
  - Re-run after the fix: `build:tw` done; `lint:theme` passed; `test:theme-check` 147 files, no offenses; `lint:liquid-syntax` passed; `npx prettier --check` on the snippet passed.

### Independent review (Grok 4.7, 2026-10-03)

Verdict: **FAIL**.

Scope: `git diff --name-only HEAD` is the nine files in the implementation surface plus this record (`assets/tailwind.output.css`, the two references, the three sections, `snippets/product-recommendations-section.liquid`, `snippets/section-frame.liquid`, `docs/agent/context.md`). `git diff --stat HEAD -- config templates` is empty. No `tailwind/*.css` source file is in the diff.

#### D1 — PASS

Counted on the working tree with a script over the three section files (schema and doc blocks stripped): each file contains one `render 'section-frame'`. Forbidden patterns are all 0: `--section-padding-top:`, `class="layout`, `inner_class: 'layout'`, `h-screen`, and a `vh` token that is not `svh`/`dvh`. `sections/product.liquid` still has `80svh`, `90svh`, `100svh`. The other two sections have no `svh` token.

#### D2 — PASS

Same script, `HEAD` → now. Section files: heading tags 0, heading renders 0, `<button` 0. `snippets/product-recommendations-section.liquid`: `<h2` 3 → 0 and `{% render 'heading' %}` 0 → 3 (each `level: '2'`); `<button` 2 → 2.

#### D3 — PASS for mounts, scopes, ARIA, and colour; the description width is the finding under spacing

Script counts (`HEAD` → now):

| File | effective reveals (literal `data-motion-reveal` + heading/text/image defaults) | `data-motion-section` / cascade / bound / sequence | `data-module-id` |
| --- | --- | --- | --- |
| `sections/product.liquid` | 0 → 0 | 0/0/0/0 → 0/0/0/0 | 1 → 1 |
| `sections/featured-product.liquid` | 0 → 0 (its one `image` render passes `motion_reveal: false`, so the image default does not fire) | 1/0/1/0 → 1/0/1/0 | 2 → 2 |
| `sections/product-recommendations.liquid` | 0 → 0 | 0/0/0/0 | 0 → 0 |
| `snippets/product-recommendations-section.liquid` | 3 → 3 | 1/1/1/0 → 1/1/1/0 | 2 → 2 |

The snippet's three `heading` and three `text` renders all pass `motion_reveal: false`, so those defaults add 0. `role="` 4 → 4 and `aria-` 4 → 4 on the snippet; 0 on the section files.

Colour and surface: the section files no longer contain the literals (`color-{{` 1 → 0, `surface-section` 1 → 0). `snippets/section-frame.liquid` still writes `color-{{ section.settings.color_scheme }}` on the root when `scheme_target` is `root`, and appends `surface-section` unless `surface_section` is false. None of the three renders pass `scheme_target` or `surface_section`, so both land on the frame root, the section's outer element.

Module roots, read from the unchanged JS (`git diff --stat` on these files is empty):

- `assets/product-layout.js` `init` reads `$el`, then `$el.querySelector` for `[data-product-media-sticky-target]`, `[data-product-media-panel]`, `[data-product-info-sticky-target]`, and `[data-product-info-panel] [data-product-info-blocks]`. Both sections keep one of each sticky target and panel. `productLayout` is the frame's first child and still wraps those nodes. `[data-product-info-blocks]` is the root of unchanged `snippets/product-info-blocks.liquid`, still rendered inside `[data-product-info-panel]` (render arguments byte-normalized equal to `HEAD`: product 2 calls, featured-product 1).
- `assets/related-products.js` reads `$el.dataset.relatedProductsUrl`, `$el.dataset.relatedProductsSectionId`, and observes `$el`. The snippet still has one of each attribute on the module root.
- `assets/motion-reveal.js` owns `[data-motion-section]` on `$el` and queries descendants `[data-motion-reveal]`, `[data-motion-copy]`, `[data-motion-cascade]`, `[data-motion-sequence]`, `[data-motion-bound]`. Featured-product still puts `data-motion-section` on the wrapper inside `productLayout` and `data-motion-bound` on the media column inside that wrapper. The recommendations snippet still puts `data-motion-section` on `[data-related-products-content]`, with the reveal, cascade, and bound nodes inside it.
- Gallery `motion_reveal` arguments are unchanged (normalized render text equal to `HEAD`). `git diff --stat HEAD` is empty for `snippets/product-gallery*.liquid`, `snippets/image.liquid`, and `snippets/image-magnifier.liquid`, so gallery-internal reveals are unchanged.

#### D4 — PASS

Schema bodies, `HEAD` vs working tree, SHA-256 equal: `sections/product.liquid` 61338 bytes `cea3e4bfb78392283850383afdb74f8d8b5895cc3b077bc66c1099135374a110`; `sections/featured-product.liquid` 9326 bytes `f65f068186b6f8a190dbb67459d502074840692e01320bdc2781165825d9094d`; `sections/product-recommendations.liquid` 5883 bytes `b47acbef4860e47e7936c8d871937cbe94ecd248a5885cf7e7d5a67686e43d55`. The two snippets have no schema. `git diff --stat HEAD -- config templates` is empty.

#### D5 — PASS

Sticky ancestors, both targets, both product sections, from the target up to `<main>`. Markup classes come from the section files; overflow comes from `snippets/section-frame.liquid`, `assets/base.css`, and `layout/theme.liquid`.

- Info target, then `[data-product-info-panel]`: classes `self-start` and `min-w-0`. No overflow declaration.
- Media target, then `[data-product-media-column]`: classes `flex w-full min-w-0 flex-col gap-8` and `min-w-0`. No overflow declaration.
- Product column grid: `grid w-full min-w-0 …`. No overflow declaration.
- Featured-product only: the motion wrapper between that grid and `productLayout` has no class.
- `productLayout` root: no class.
- `.section-frame__inner.container-page`: `container-page` does not set overflow. `.section-frame--no-clip > .section-frame__inner` sets `overflow: visible`.
- `.section-frame.section-frame--no-clip`: `.section-frame` sets `overflow: hidden`; `.section-frame--no-clip` sets `overflow: visible`. One class each, and the no-clip rule is later in the same stylesheet, so the used value is visible.
- `section.shopify-section` (schema `"tag": "section"`): `.shopify-section` sets position, grid, and width, and does not set overflow.
- `main#MainContent`: class `relative shadow-none outline-none`. No overflow.

`[data-product-media-panel]` still has `overflow-hidden` (count 1 → 1 in both sections). It is inside the media sticky target. `.product-info-blocks` still has `pc:overflow-hidden` in `tailwind/tailwind.components.css`, which this diff does not touch; that element is inside the info sticky target.

`clip: false` is backward compatible. `git grep -n "clip:" -- "*.liquid"` returns only `sections/product.liquid` and `sections/featured-product.liquid`. A count of `render 'section-frame'` is 24 call sites across 23 files (`sections/google-map.liquid` has 2). The other 22 omit `clip`. Omitted `clip` leaves `clip_overflow` true, does not append `section-frame--no-clip`, and the new rule does not match. The frame's element markup is otherwise the same as `HEAD`.

Section Rendering: `snippets/section-frame.liquid` contains one `data-section-id`, on the root. Each section file contains 0 and renders the frame once, so each section output has one. `[data-related-products-content]` occurs once in the snippet, opened before `{% if recommendation_data.performed %}` and closed after every branch, and that snippet is the frame's `children`. `assets/related-products.js` asks `SectionRefresher` for `[data-section-id="<id>"]` and `[data-related-products-content]`. `assets/https.js` `render` parses the section response, finds the same target selector, and replaces the inner selector only when it is inside that target. Page HTML and the section response are the same section render, so the inner node is inside the one frame root on both paths.

#### Spacing — FAIL

Unit used below: `--spacing: 0.25rem` and `html { font-size: 62.5% }` in `assets/base.css`, so one spacing step is 2.5px. `assets/base.css` is imported with `@import '../assets/base.css' layer(base)` in `tailwind/tailwind.input.css`, so a utilities-layer padding class beats `.layout`.

Schema defaults, unchanged: `padding_top` 32 and `padding_bottom` 32 on all three sections. Frame clamp for `v = 32`, computed with the snippet's rounding: `clamp(19.2px, 13.898px + 1.414vw, 32px)`.

| Place | HEAD | Now |
| --- | --- | --- |
| Product and featured-product vertical padding | `.layout` padding from `--section-padding-*` (default 32px linear). No utility overrode it. | Frame clamp, default 19.2–32px. Recorded series change. |
| Recommendations vertical padding | `py-12` / `pc:py-16` = 30px / 40px, which beat `.layout`'s 32px. | Wrapper has no class. Frame clamp only, default 19.2–32px. Matches the coordinator fix. The execution-record spacing table still says the utility padding is unchanged; the code matches the later fix note. |
| Recommendations header to grid, empty line, and loading skeleton | `mt-8` × 3 = 20px | `gap-8` × 3 = 20px |
| Loading, timeout, and error rows | `mt-6` = 15px | `mt-6` × 3, count unchanged, still outside the `gap-8` wrapper |
| Product and featured-product column gaps | `gap-8` / `pc:gap-10` / `fw:gap-12` = 20 / 25 / 30px | No spacing-token delta on those files |

Unrecorded change: the recommendations description lost `max-w-3xl`. See findings.

#### LCP, JSON-LD, form, variant picker, buy buttons — PASS

Normalized `product-gallery` and `product-info-blocks` render arguments are equal to `HEAD` (product gallery 1, info blocks 2; featured gallery 1, info blocks 1, image 1). `git diff --stat HEAD` is empty for the gallery snippets, `snippets/image.liquid`, `snippets/image-magnifier.liquid`, `snippets/product-info-blocks.liquid`, `snippets/buy-buttons.liquid`, `snippets/product-variant-picker.liquid`, and `snippets/meta-tags.liquid`. First-media `loading: 'eager'` and `fetchpriority: 'high'` still live in those unchanged gallery layouts (thumbnails at the `forloop.first` assign). Product JSON-LD is still `snippets/meta-tags.liquid` (`product | structured_data`).

#### D6 — PASS

`npm.cmd run build:tw`: `Done in 128ms`. `npm.cmd run scan:compat` rebuilt with `Done in 143ms`. After both, `git diff --stat HEAD -- assets/tailwind.output.css` is `5 -----` (314473 → 314370 bytes). The only removed rule is `.pc\:py-16`. A search of `*.liquid`, `*.js`, `*.css`, `*.json`, and `*.md` finds `pc:py-16` only in `docs/agent/context.md`. `.py-12` is still in the output (1 rule at `HEAD`, 1 now) and still has a consumer in `sections/product-comparison-table.liquid`.

#### D7 — PASS

| Command | Tail |
| --- | --- |
| `npm.cmd run lint:theme` | `Theme architecture lint passed.` |
| `npm.cmd run test:theme-architecture` | `# tests 130` `# pass 130` `# fail 0` |
| `npm.cmd run test:theme-check` | `147 files inspected with no offenses found.` |
| `npm.cmd run lint:liquid-syntax` | `Liquid syntax lint passed.` |
| `npm.cmd run scan:compat` | `Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks).` |
| `npm.cmd run lint:i18n` | `i18n lint passed.` / `Unused locale key lint passed.` |
| `npm.cmd run lint:doc-paths` | `Doc path lint passed.` |
| `npm.cmd run doctor:agent` | exit 0, no doctor output |
| `npx prettier --check` on the changed Liquid, the two references, and `docs/agent/context.md` | `All matched files use Prettier code style!` |

`assets/tailwind.output.css` is listed in `.prettierignore`.

#### D8 — PASS

`new CustomEvent` in `*.js`: `assets/events.js` only. `innerHTML =`, `outerHTML =`, and `replaceWith(` in `assets/*.js`: `assets/https.js` only (`SectionRefresher.render` / `replaceRegion`). No matches under `sections/` or `snippets/`.

#### Docs

`docs/references/architecture/abstraction-boundaries.md` matches the code: `clip` is a parameter; `clip: false` adds `section-frame--no-clip`; default `clip_overflow` stays true; the no-clip rule sets `overflow: visible` on the root and the direct inner wrapper. The height-kind and spacing-token sentences in `docs/references/style-system/css-architecture.md` were not changed and still match (`height_kind: 'content'` on all three sections; no `.section-frame--height-content` rule). One sentence in that file overstates where the class is placed. See findings.

#### Findings

1. **P2.** `snippets/product-recommendations-section.liquid` (all three `{% render 'text' %}` calls). `HEAD` rendered `snippets/rte-compact-prose.liquid`, whose wrapper is `rte rte--compact max-w-3xl` plus the content class. The removed assign prepended `typo-subtitle` to the description tier, so the element class was `rte rte--compact max-w-3xl typo-subtitle` plus the tier (`body-xl` at the schema default). The `text` renders pass `rte: true` and `subtitle: true` and omit `measure`. Simulated class from `snippets/text.liquid`: `typo-subtitle rte rte--compact body-xl`. `max-w-3xl` is `var(--container-3xl)` = `48rem` = 480px at the 10px root. A recommendation description wider than 480px no longer wraps at that measure. On `pc:flex-row items-start` it grows past the old cap; in the mobile column (`items-start`) the item's max-content width can exceed the page column. Fix: pass `measure: '3xl'` on all three `text` renders so the primitive adds `max-w-3xl`.

2. **P3.** `docs/references/style-system/css-architecture.md`, the section-padding paragraph. It says to pass `clip: false` for `section-frame--no-clip` on the root and the inner wrapper. The class is appended to `root_classes` only. The inner wrapper gets `overflow: visible` from `.section-frame--no-clip > .section-frame__inner`. Fix: say the class is on the root, and that rule also sets the direct inner wrapper to `overflow: visible`.

#### Unproven (deferred browser pass)

- Sticky columns, magnifier overflow, recommendations Section Rendering refresh, and first-section header offset.
- `HEAD`'s direct child of `container-page` was the product grid (`w-full min-w-0`). The frame's `container-page` child is now the classless `productLayout` root, in both product sections. Whether that lets media min-content widen the page column was not rendered.

### Coordinator fixes after independent review round 1 (2026-10-03)

Both findings were verified against the code and fixed:

- P2: `HEAD` rendered the descriptions through `rte-compact-prose`, which always adds `max-w-3xl`. All three `text` renders in `snippets/product-recommendations-section.liquid` now pass `measure: '3xl'`, which `snippets/text.liquid` maps to `max-w-3xl`.
- P3: `docs/references/style-system/css-architecture.md` now says `clip: false` adds `section-frame--no-clip` to the root, which sets `overflow: visible` on the root and its direct `.section-frame__inner`.
- Re-run: `build:tw` done (`assets/tailwind.output.css` vs `HEAD`: 5 deletions, the `.pc\:py-16` rule only); `lint:theme` passed; `test:theme-check` 147 files, no offenses; `lint:liquid-syntax` passed; `lint:doc-paths` passed; `npx prettier --check` on both files passed.
- Status: awaiting the independent review, round 2.

### Independent review, round 2 (Grok 4.7, 2026-10-03)

Verdict: **PASS**. No new findings.

#### P2 — fixed

`snippets/product-recommendations-section.liquid` has three `{% render 'text' %}` calls (lines 93, 135, and 164). Each passes `measure: '3xl'` together with `rte: true`, `subtitle: true`, `element: 'div'`, and `motion_reveal: false`. `snippets/text.liquid` is unchanged from `HEAD`. Its `measure == '3xl'` branch appends `max-w-3xl`.

Class set, default tier `body-xl`:

| | Classes |
| --- | --- |
| `HEAD` (`rte-compact-prose` plus the removed `typo-subtitle` prepend) | `rte`, `rte--compact`, `max-w-3xl`, `typo-subtitle`, body tier |
| Now (`text` with `rte`, `subtitle`, `measure: '3xl'`) | `typo-subtitle`, `rte`, `rte--compact`, body tier, `max-w-3xl` |

The sets match. Both wrappers are a `div`. `motion_reveal: false` still suppresses the text snippet's default reveal, which `rte-compact-prose` never emitted. The only remaining difference is source order inside the `class` attribute. Those classes do not compete on the same property, and attribute order does not change the cascade.

#### P3 — fixed

`docs/references/style-system/css-architecture.md` now says `clip: false` adds `section-frame--no-clip` to the root, which sets `overflow: visible` on the root and its direct `.section-frame__inner`. That matches `snippets/section-frame.liquid`: the class is appended to `root_classes` only, and the stylesheet rule is `.section-frame--no-clip, .section-frame--no-clip > .section-frame__inner { overflow: visible; }`. The `clip` sentence in `docs/references/architecture/abstraction-boundaries.md` says the same effect (root and inner use `overflow: visible`; the default still clips) and does not claim the class is copied onto the inner wrapper.

#### Regressions — none

`git diff --name-only HEAD` is the same nine paths as round 1: the three sections, `snippets/product-recommendations-section.liquid`, `snippets/section-frame.liquid`, `assets/tailwind.output.css`, the two references, and `docs/agent/context.md`. All are inside the plan's implementation surface. `snippets/text.liquid` is not in the diff.

| Command | Tail |
| --- | --- |
| `npm.cmd run build:tw` | `Done in 204ms` |
| `npm.cmd run lint:theme` | `Theme architecture lint passed.` |
| `npm.cmd run test:theme-architecture` | `# tests 130` `# pass 130` `# fail 0` |
| `npm.cmd run test:theme-check` | `147 files inspected with no offenses found.` |
| `npm.cmd run lint:liquid-syntax` | `Liquid syntax lint passed.` |
| `npm.cmd run scan:compat` | `Done in 128ms`, then `Embedded compatibility lint passed (54 stylesheet blocks, 0 javascript blocks).` |
| `npm.cmd run lint:i18n` | `i18n lint passed.` / `Unused locale key lint passed.` |
| `npm.cmd run lint:doc-paths` | `Doc path lint passed.` |
| `npm.cmd run doctor:agent` | exit 0, no doctor output |
| `npx prettier --check` on the changed Liquid, both references, and `docs/agent/context.md` | `All matched files use Prettier code style!` |

After both builds, `git diff --stat HEAD -- assets/tailwind.output.css` is still `5 -----`. `assets/tailwind.output.css` stays in `.prettierignore`.

Browser checks listed on the plan remain deferred.
