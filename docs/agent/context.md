# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-15.

## Batch 6-P1: product page `feature-tabs` section (first product page section)

**Status:** done. Review 3 PASS and the user's visual acceptance (2026-10-15). Accepted.

**Outcome.** A new section `feature-tabs`, usable on the product template (and any page): one framed panel with an image on the left and, on the right, the active item's content above a numbered item list. Selecting a row switches the image and the content. Built rough-first: logic and the design's arrangement are accepted here; detail tuning goes to the polish pass.

**Design input:** `docs/design/product/feature-tabs/notes.md` (desktop screenshot and the Mello Coffee reference are local, Git-ignored). Mobile is derived and accepted (user, 2026-10-15): image, then content, then rows, in the same frame.

**Decisions (user, 2026-10-15):**
- New section accepted (project addition).
- Click or keyboard selection only: no scroll linkage, no autoplay, no image hotspots.
- Content from blocks; per-product content comes from metafield dynamic sources in the editor, no extra code.

**Dependencies:**
- The user authorizes adding one `feature-tabs` instance to `templates/product.json` (after `main`) so the section can be seen; merchant-owned file, this batch only.

**Implementation surface:**
- `sections/feature-tabs.liquid` (new: markup, `{% stylesheet %}`, schema with preset).
- `locales/*.json` and `locales/*.schema.json`: new keys under `sections.feature-tabs` only (storefront default copy and schema labels), following `docs/references/code-review/i18n-checklist.md`.
- `templates/product.json`: add one instance after `main` (dependency above), with the preset's four blocks.
- `docs/agent/context.md` (this record).
- Not in the surface: any `assets/*.js` (reuse the existing `tabControl` component; if it cannot serve, stop and report), shared snippets, tokens, `tailwind/`, `docs/design/design.md` (the coordinator writes the product page part after the look is accepted).

**Structure (contract for the implementer):**
- Frame: `section-frame` at page width (content inside the page margins); a 1px ink border and the large radius (`--radius-card`) around the whole panel, content clipped to it.
- Accessible tabs through `tabControl` (`assets/tab-control.js`): the rows are `role="tab"` buttons in a `role="tablist"` with `aria-orientation="vertical"` (ArrowUp/Down, Home/End already handled); each item's content is a `role="tabpanel"` labelled by its tab. The images sit outside the panels, one per item, shown by the same active index, each with its own alt text (default the item heading). DOM order: images, panels, tablist; that order is also the mobile order.
- Desktop (≥ 64rem): grid, image column about 60% spanning the full height (cover crop, no radius of its own), right column about 40% with the panel on top and the tablist at the bottom. Tablet (48-64rem) follows desktop or mobile, whichever lays out cleanly; record which.
- Mobile: stacked, image landscape (about 4:3), the whole section about one screen tall at 390x844.
- Right column content: counter (`01 / 04`, zero-padded, automatic, tracked small type), eyebrow (the item label, uppercase tracked), heading (existing heading type tier, merchant select like other sections), body text (richtext). Optional section-level decorative image at the top right of the content area, empty alt, hidden below 48rem.
- Rows: number and label on one line, hairline dividers; the active row uses the scheme's ink fill with the light label and a short horizontal line at the right. Inactive rows keep a visible hover and focus style. All rows meet 24px targets.
- No-JS: the first image and first panel are visible from the server render, the other items hidden; the rows still render. JS adds switching only.
- Motion: image and panel cross-fade on switch with the motion tokens (`--motion-duration-base`); none under `prefers-reduced-motion`; nothing animates on first render.
- Placeholders: an empty image renders `decorative-placeholder-svg`; the preset ships four blocks with locale default copy.
- Schema: section settings (colour scheme, heading size, decorative image, padding top and bottom as in other sections); block `item` (image, label, heading, text), `max_blocks` 6. All labels and defaults as `t:` keys.

**Acceptance checks:**
1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`: 0 errors (counts from output).
2. `npm.cmd run test:layout -- --widths 390,768,1024,1440` with `npm.cmd run shopify:dev` running: 0 new issues on the product page; baseline not grown.
3. `npx prettier --check` on every changed file passes.
4. Chrome DevTools MCP on the product page: clicking each row and using ArrowUp/Down/Home/End switches the image and the panel; `aria-selected`, `tabindex` roving and `aria-controls`/`aria-labelledby` pairs are correct; no console errors; with reduced motion emulated there is no transition.
5. Server HTML (fetch without JS): first image and first panel visible, others hidden.
6. `review-animations` run on the motion diff, output recorded here.
7. Screenshots at 390 and 1440 handed to the user (agents do not judge the visual result).

**Review tier:** Ask (new Liquid and schema; runs from an external execution prompt). Coordinator review, then a separate review session; both must PASS.

## Progress

### Implementation (2026-10-15)

- Added `sections/feature-tabs.liquid`: `section-frame` (page width), framed panel (`--radius-card`, 1px line), DOM order images → panels → vertical `tablist`, `x-data="tabControl()"` with `data-module-id="tab-control"`, `@focusin` + `@click` on tabs (keyboard activation with stock `tabControl`), image/panel opacity cross-fade, no-JS `hidden` on non-first layers, placeholders via `decorative-placeholder-svg`, schema + preset (4 blocks).
- Locales: `sections.feature-tabs` in `locales/en.default.json` and `locales/en.default.schema.json`.
- `templates/product.json`: `feature_tabs_product` instance after `main` with four preset blocks (batch-authorized).

**Tablet (48–64rem):** uses the **mobile** stack (image 4:3, content, rows). Desktop two-column grid starts at **64rem** (`desktop:` heading tiers match).

**Deviations**

- `@focusin="setActive(tabIndexFor($el))"` on tabs (not in featured-products pattern): required so ArrowUp/Down/Home/End switches image and panel with unmodified `tab-control.js` (keydown only moves focus; focusin activates).
- `data-module-id="tab-control"` instead of `feature-tabs` (import-map lint; no new JS module).
- Preset block copy is literal English in schema preset (i18n lint); storefront fallbacks use `sections.feature-tabs.defaults.*` when block fields are blank.

### Validation

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | passed (0 issues after fixes) |
| `npm.cmd run test:theme-check` | **153** files inspected, **0** offenses |
| `npm.cmd run lint:i18n` | passed; unused locale lint passed |
| `npm.cmd run lint:liquid-syntax` | passed |
| `npm.cmd run lint:compat` | passed (embedded: **63** stylesheet blocks, **0** javascript blocks) |
| `npm.cmd run test:layout -- --widths 390,768,1024,1440` | **product** page: **0** new issues; runner reported **1** new issue on **collection-all** (`page-margin` at 1024) — outside this batch surface |
| `npx prettier --check` (changed files) | passed after `prettier --write` on `sections/feature-tabs.liquid` |

### Browser (Chrome DevTools MCP, `http://127.0.0.1:9292/products/floral-white-top`)

- Row clicks: all four tabs switch panel heading and visible image index (script + click).
- Keyboard: `ArrowDown` Origin→Process; `ArrowUp` Process→Origin; `End`→Ritual; `Home`→Origin (real `press_key` after tab focus).
- ARIA: `aria-selected`, roving `tabindex` (one `0`, rest `-1`), `aria-controls` / `aria-labelledby` pairs verified via `evaluate_script`.
- Console: only known dev-store noise (CORS storefront trials, shop.app CSP, shopify-account menu 400); no feature-tabs errors.
- Server HTML (fetch): panel 0 without `hidden`, panels 1–3 with `hidden`; first image layer `is-active` without `hidden` (panels match acceptance 5).
- **Reduced motion (runtime):** CSS block sets `transition: none` under `@media (prefers-reduced-motion: reduce)` (rule text captured); MCP `emulate` has no `prefers-reduced-motion` — live computed style under reduced motion **not** emulated in this pass.

### review-animations (motion diff: `sections/feature-tabs.liquid` `{% stylesheet %}`)

- **Pass with notes:** Image/panel use opacity-only cross-fade with `--motion-duration-base` / `--motion-ease-exit`; `prefers-reduced-motion: reduce` disables transitions; hover background gated `@media (hover: hover) and (pointer: fine)`.
- **Flag (minor):** `.feature-tabs__tab-mark` animates `width` (layout-adjacent); consider transform scaleX in polish pass if jank appears.
- No `transition: all`; no first-render animation (inactive layers start at opacity 0).

### Screenshots (user review)

- `C:\Users\Joey\AppData\Local\Temp\feature-tabs-6-p1\feature-tabs-390.png`
- `C:\Users\Joey\AppData\Local\Temp\feature-tabs-6-p1\feature-tabs-1440.png`

### Coordinator review, round 1 (2026-10-15): findings fixed directly

1. Image cross-fade never ran: image layers toggled `hidden` (display none), and the first layer kept its server `is-active` because Alpine's string `:class` does not remove static classes (two images visible after a switch once `hidden` was gone). Fixed: image layers are class-driven only (opacity and visibility); `:class` uses object syntax on images and panels.
2. Panels: the opacity transition was dead (`hidden` switches them); removed. Panel text switches instantly, the image cross-fades. Deviation from the contract, accepted for the rough pass.
3. Active row label invisible: the `title-*` tier sets the foreground colour, ink on the ink fill. Fixed with `color: inherit` on the label span.
4. Row labels used the merchant heading tier (as large as the heading), passed through a Liquid variable, which hid them from `typography-tier-heading`. Rows now `title-s desktop:title-m` with a line-level `lint-allow typography-tier-heading` (a button in the heading face, not a heading); the reviewer should confirm this exception. Heading default `title-xl` (schema and the batch's template instance).
5. `aria-live` on the image stack removed (selection is already announced); panel heading `h3` to `h2` (no level skip after the product `h1`); `tabindex="0"` on panels (APG); `block.shopify_attributes` on the tab only; colour scheme class only on the `section-frame` root (was applied twice); frame border ink, as the contract says.
6. `review-animations` flag fixed: the tab mark animates `transform: scaleX`, not `width`.
7. `assets/tailwind.output.css` (not listed in the report) carried stale `wide:title-*` rules from an intermediate build; rebuilt with `npm.cmd run build:tw` (now +108 lines, the `desktop:title-*` tiers only).
8. `collection-all` `page-margin` at 1024: reproduced alone (`--page collection-all --widths 1024`, 1 new). It is a `collection__nav-link` in the collection tab bar, the element class the baseline already holds at 1280, 1920 and 2280. Classified: existing collection tab bar debt (polish pass), not this batch; baseline not grown.

**Validation after round 1:** `lint:theme` passed; `test:theme-check` 153 files, 0 offenses; `lint:i18n` passed (unused passed); `lint:liquid-syntax` passed; `lint:compat` passed (63 stylesheet blocks); `npx prettier --check` on changed files passed; `test:layout -- --page product --widths 390,768,1024,1440` 0 new.

**Browser after round 1 (Chrome DevTools MCP):** click on row 3, ArrowUp, Home: `aria-selected`, the visible panel and the visible image follow (one each); focus lands on the first tab after Home. Reduced-motion runtime still not emulated (MCP limit). Screenshots in the coordinator's session scratchpad, `feature-tabs-1440.png` and `feature-tabs-390.png` (the browser window stops at about 485px; 390 is covered by `test:layout`).

**For the polish pass (not this batch):** row height and section height are lower than the design; serif heading face; the botanical decoration has no default.

### Review 1 (separate session, 2026-10-15): FAIL, three findings

1. P2 `assets/tailwind.output.css` carries eight stale `wide:title-*` rules (+216 lines, not +108). Cause found: the user's `npm run dev` runs `watch:tw`, whose candidate set only grows within a session; it kept the implementer's intermediate `wide:` classes and rewrote the output after the coordinator's one-shot build. Fix: restart the watcher (fresh build), then confirm the output equals `npm.cmd run build:tw`.
2. P2 the image did not cross-fade: the outgoing layer hid at once (`visibility`), so the new image faded in from the background. Fixed: the incoming layer sits on top (`z-index: 1`) and fades in with `--motion-duration-base` (400ms) and `--motion-ease-enter`; the outgoing layer keeps opacity 1 and visibility until the fade ends (delayed 0s transitions), then hides. The reduced-motion block now also names `.feature-tabs__image-layer.is-active` (its higher specificity beat the old block). Measured after a click (rAF samples): 30ms outgoing 1.00 visible / incoming 0.31; 200ms 1.00 / 0.96; 380ms 1.00 / 1.00; 460ms outgoing 0.00 hidden / incoming 1.00.
3. P3 the two `lint-allow typography-tier-heading` exceptions are not listed in `css-architecture.md` (required by `check-theme-architecture`). Adding them is a rule-exception approval: waiting on the user.

### Round 2 corrections (coordinator, 2026-10-15)

- Finding 1: the user restarted `npm run dev`; `assets/tailwind.output.css` now has 0 `wide:title-*` rules and is byte-identical to a fresh `npx tailwindcss -i ./tailwind/tailwind.input.css` build (`cmp`); diff +108 lines, the `desktop:title-*` tiers only.
- Finding 2: fixed as recorded under Review 1.
- Finding 3: the user approved the exception (2026-10-15); two rows added to the accepted `lint-allow` table in `docs/references/style-system/css-architecture.md`. That file joins this batch's surface by that approval.
- Filed for later, not this batch: `sections/featured-products.liquid` passes `title-*` tiers to a `<span>` through a Liquid variable, which `typography-tier-heading` cannot see.

### Review 2 (separate session, 2026-10-15): PASS

All three Review 1 findings resolved with fresh evidence: generated CSS equals a fresh build (+108, eight `desktop:title-*` rules); cross-fade measured both directions (outgoing opaque and visible underneath until about 400ms, then hidden); reduced motion 0s duration and delay on every layer, active included (headless Chromium); the two exception rows match the comments and carry the user's approval. Regression checks hold at 1440 and 390; layout baseline unchanged (39). `review-animations`: approve; the 400ms fade follows the accepted `--motion-duration-base`, duration tuning is a polish note. Unproven: the user's visual acceptance and rendering with uploaded images.

### User look (step 8, 2026-10-15): correction round 3

- **Bug (missed by all three reviews, which only viewed items 1 and 2):** items 3 and 4 printed `Liquid error ... Unknown SVG placeholder 'lifestyle-3'`. Shopify ships `lifestyle-1` and `lifestyle-2` only (Shopify Dev MCP, `placeholder_svg_tag`). Fixed: both loops cycle `lifestyle-1` / `lifestyle-2`.
- **Height and spacing:** the implementer's values assumed a 16px rem (root is 10px), so rows had 6.5px vertical padding. Retuned toward the design at 1440: rows about 72px (`padding-block` fluid 14 to 22px), panel padding 20 to 26px with a 36px top on desktop, counter to eyebrow 24 to 50px, eyebrow and heading 12 to 20px apart, counter, eyebrow, numbers and body `copy-m` with 0.2em tracking on counter and eyebrow, active mark 66px, desktop image column `aspect-ratio: 3 / 2` instead of the 360px minimum. Frame measured 1377 x 652 at 1440.
- Validation: `lint:theme` passed; `test:theme-check` 153 files, 0 offenses; `lint:compat` passed (63 stylesheet blocks); `test:layout -- --page product --widths 390,768,1024,1440` 0 new; prettier passed. All four items render without a Liquid error at 1440.
- **Open (user decision):** a default for the decorative illustration.
- **Decoration default (user, 2026-10-15: a default is required; naming left to the coordinator):** the user's export (`icons/image 2219.svg`) is a PNG pencil sketch wrapped in an SVG, not vector art, so the icon pipeline (svgo strips strokes and forces `fill`) cannot take it. Its alpha channel alone carries the drawing, so it ships as `assets/feature-tabs-botanical.webp` (241 x 480, 24 KB, alpha only, made from the export's embedded PNG by crop and resize), drawn as a CSS mask over `currentColor` at 0.8 opacity, so it follows the scheme. New `show_decoration` checkbox (default on); an uploaded `decorative_image` replaces the default. The mask URL reaches CSS through an inline custom property (`--feature-tabs-decoration-mask`, `asset_url`). Placeholder panels render it too. Position on space tokens (`top: var(--spacing-step-4xl)`, `right: var(--spacing-step-xl)`), width `min(28%, 9rem)`. Shown from 48rem up. Surface widened by the user's request: `assets/feature-tabs-botanical.webp`, two schema locale keys.
- Validation: `lint:theme`, `lint:i18n` (unused passed), `lint:liquid-syntax`, `lint:compat` passed; `test:theme-check` 153 files, 0 offenses; prettier passed. Browser 1440: decoration 90 x 179, mask resolves to the asset, no Liquid error.
- These changes touch Liquid and schema after Review 2, so the batch needs another review pass (Ask).

### Review 3 (separate session, 2026-10-15): PASS

Correction round 3 verified with fresh evidence: all four items render without a Liquid error at 390 and 1440 in the configured and no-block branches; 1rem probes at 10px, rows 72.25px at 1440, desktop media `aspect-ratio: 3 / 2`; the decoration mask is fetched once at 1440 and never at 390, `aria-hidden`, toggle and replacement logic correct in source; cross-fade and reduced motion unchanged; generated CSS equals a fresh build. Unproven: the Theme Editor toggle and upload live, real Safari. The user accepted the look (2026-10-15).
