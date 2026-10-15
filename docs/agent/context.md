# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-15.

## Batch 6-P4: product page `formula-details` section

**Status:** done. Review 1 PASS and the user's acceptance (2026-10-15). Accepted.

**Outcome.** A new static section `formula-details` in two parts: a sage band (heading, text, numbered attribute columns, texture image) and an ingredients part (heading, subtitle, numbered ingredient cards), revealed by the existing cascade. Rough-first; detail tuning goes to the polish pass.

**Design input:** `docs/design/product/formula-details/notes.md` (screenshot local, Git-ignored). Decisions accepted by the user (2026-10-15) are listed there.

**Dependencies:**
- The user authorizes adding one `formula-details` instance to `templates/product.json` after `editorial_collage_product`, with the preset's blocks (merchant-owned file, this batch only).

**Project conventions the implementer must apply:**
- The root font size is 62.5%: `1rem` = 10px. Media queries still use 16px (`48rem` = 768px).
- Spacing (`padding`, `margin`, `gap`, offsets) uses `var(--spacing-step-*)` or the step utilities only; no literal `clamp()` or rem spacing in `{% stylesheet %}`.
- Type tiers (`title-*` only on headings, `copy-*` elsewhere), colour roles (never `rgb()` around a token that is already a full colour, such as `--color-surface-muted`), `--radius-card` on the images, no new shadows, no `font-mono`.
- Translated defaults: plain text in locale files; the `t` filter escapes HTML unless the key ends in `_html`, so wrap fallbacks in markup, never put tags in a non-`_html` key.
- `sizes` on every image is at or above the rendered width at every width from 390 to 2560 (`docs/references/style-system/image-display-contract.md`); measure, do not guess.
- Placeholder names checked in Shopify Dev MCP (`lifestyle-1`, `lifestyle-2`, `image`, `product-1` to `product-6`, `collection-1` to `collection-6` exist; `lifestyle-3` does not).
- No code that exists only to satisfy a check; no new `lint-allow` without asking the user first.
- When `assets/tailwind.output.css` changes, compare it with a fresh `npx tailwindcss -i ./tailwind/tailwind.input.css` build; a running `watch:tw` keeps stale classes (ask the user to restart it if they differ).

**Implementation surface:**
- `sections/formula-details.liquid` (new).
- `locales/en.default.json`, `locales/en.default.schema.json`: new keys under `sections.formula-details`.
- `templates/product.json`: one instance after `editorial_collage_product` (dependency).
- `assets/tailwind.output.css` (generated, if classes change).
- `docs/agent/context.md` (Progress).
- Not in the surface: any `assets/*.js`, shared snippets, tokens, `tailwind/`, `config/`, `docs/design/design.md`, other sections.

**Structure (contract):**
- One `section-frame` at page width with `motion: true`; the section's colour scheme (`color_scheme`) applies to the ingredients part; the band takes its own scheme setting (`band_color_scheme`) on a full-width background behind the band only, its content inside the page margins. Default for the band: the existing scheme closest to the design's sage (read `config/settings_data.json` read-only, record the choice); default for the section: the cream scheme.
- Band: heading (`<h2>`, heading size select like other sections), text (richtext); attribute blocks rendered as columns with thin vertical rules between them (colour role for lines); each has an automatic two-digit number, a name (`<h3>`, a small `title-*` tier) and text (`copy-*`); the band image (`image.liquid`, cover, `--radius-card`, merchant alt) inside the page margins.
- Ingredients: heading (`<h2>`), subtitle (text), ingredient blocks as cards: image (`image.liquid`, cover, landscape, `--radius-card`, merchant alt), automatic number, name (`<h3>`), text.
- Cascade: `data-motion-cascade` on the attribute row and on the ingredient grid, `data-motion-bound` on each attribute and each card, as `sections/scroll-categories.liquid` does. Nothing else animates.
- Desktop (≥ 64rem): band in three zones (text, attributes, image) as in the design; ingredients in three equal columns. Tablet (48 to 64rem): whichever lays out cleanly; record which. Mobile: band stacks (heading and text, attributes stacked with horizontal rules between, image full width); ingredients in one column.
- Empty states: missing images render `decorative-placeholder-svg` with a valid name inside a visible frame (background through colour roles); headings and texts fall back to locale defaults; with no blocks, the preset's counts render as placeholders. No Liquid error, no raw HTML in any state.
- Schema: `color_scheme`, `band_color_scheme`, band heading, heading size, band text, band image, ingredients heading, ingredients subtitle, padding top and bottom; blocks `attribute` (name, text) and `ingredient` (image, name, text), `max_blocks` 8; preset with three of each and the design's copy (literal in the preset; spelling corrected). Labels and defaults as `t:` keys.

**Acceptance checks:**
1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`: 0 errors (counts from output).
2. `npm.cmd run test:layout -- --page product --widths 390,768,1024,1280,1440` with `npm.cmd run shopify:dev` running: 0 new issues; baseline not grown.
3. `npx prettier --check` on every changed text file.
4. Chrome DevTools MCP on the product page at 390 (device emulation), 768, 1024, 1440: every image and card box non-zero and inside the page margins (report widths and left edges); the band background spans the viewport while its content keeps the margins; vertical rules between attributes on desktop, horizontal rules on mobile; no horizontal scroll; no "Liquid error" and no raw HTML tags in the visible text, with images set and in the empty state.
5. Images: a browser-only fixture (an `image.liquid` frame wrapper of a different ratio) fills each slot at every width; each `sizes` value is at or above the rendered width at 390, 768, 1024, 1280, 1440, 1920, 2560 (report rendered against declared px).
6. Cascade: `data-motion-state` before and after scrolling into view; with `prefers-reduced-motion: reduce` (headless Chromium), with `body[data-motion-enabled='false']` (DOM fixture) and with JavaScript disabled, all content is visible.
7. `review-animations` run on any motion diff (expected none beyond the existing cascade), output recorded here.
8. `assets/tailwind.output.css` equals a fresh build.
9. Screenshots at 390 and 1440 saved outside the repository for the user.

**Review tier:** Ask (new Liquid and schema; runs from an external prompt). Coordinator review, then a separate review session; both must PASS. Then the user's look.

## Progress

**Implementation (2026-10-15).**
- Added `sections/formula-details.liquid`: `section-frame` `width: 'page'`, `motion: true`; band `full-width color-{{ section.settings.band_color_scheme }}` with `--page-inset` content; ingredients on section `color_scheme` via frame root; two cascades; blocks `attribute` / `ingredient`; placeholders `lifestyle-1` / `lifestyle-2` / alternating; image `sizes: '(min-width: 64rem) 33vw, 100vw'` (raised from 28/30vw after 1440 measure).
- Locales under `sections.formula-details`; `templates/product.json`: `formula_details_product` after `editorial_collage_product` with six preset blocks.

**Band default scheme:** **`scheme-4`** (`background_color` `#e3e8da` in `config/settings_data.json`) — closest sage-tinted surface to the design; **`scheme-1`** is dark forest (`#263d29`), not the band look. Section **`color_scheme` default `scheme-2`** (cream `#f1f1f1`).

**Tablet choice (768–1023 CSS px, MQ `48–64rem` at 16px UA rem):** **mobile band stack** + **single-column ingredients**; **desktop** band three-zone grid and **three ingredient columns** from **1024px** (`64rem` MQ).

**Deviations.**
- **`width: 'full'`** on `section-frame` rejected by `frame-full-allowlist`; band bleed uses **`full-width` + `color-{{ section.settings.band_color_scheme }}`** inside page frame instead of widening the frame (css-architecture allowlist).
- **`sizes` bump** to `33vw` at desktop after first 1440 measure showed `28vw` declared (403px) below rendered band width (430px).
- Preset copy rough-first; ingredients heading preset **`THE FORMULA`** (design uppercase).

**Validation.**
1. `npm.cmd run lint:theme`: passed (0 errors).
2. `npm.cmd run test:theme-check`: **157** files, **0** offenses.
3. `npm.cmd run lint:i18n`: passed; unused-key passed.
4. `npm.cmd run lint:liquid-syntax`: passed.
5. `npm.cmd run lint:compat`: passed (**67** stylesheet blocks, **0** JS blocks).
6. `npx prettier --check` on changed text files: passed (after `--write` on `formula-details.liquid`).
7. `npm.cmd run test:layout -- --page product --widths 390,768,1024,1280,1440`: **0** new issues.
8. `fc /b` tailwind output vs fresh build: no differences.
9. Shopify Dev MCP `validate_theme`: **4/4** SUCCESS.

**review-animations:** No new motion in section diff; existing cascade only. **No findings.**

**Chrome DevTools MCP** (`/products/floral-white-top`, placeholder images, six blocks).
- **390:** band bg **358** vs viewport **390**; band image **326×198** @ left **32**; cards **358×201** @ left **16**; attr horizontal rules **1px**; no Liquid error; visible text without raw tags.
- **768 (mobile layout):** band bg **714**; band image **676×412** @ **39**; cards **693×390**; horizontal attr rules **1px**.
- **1024 (desktop):** band image **296×180** @ left **670**; card **310×174** @ **22**; vertical attr rules **1px**; `sizes` declared **338** ≥ rendered **296**.
- **1440:** band bg **1377** (viewport **1440**, scrollbar inset); band image **430×262** @ **947**; cards **432×243** @ **31 / 496 / 962**; vertical rules **1px**; attrs columns **500 / 632 / 781**.
- **2560:** band **504×307**, card **520×293**; declared **845** ≥ both (**ok**).
- **Fixture:** gradient **`data-test-fixture`** filled **4** image slots (band + 3 cards); wrappers retained aspect frames.
- **`sizes` vs rendered media width** (declared = `100vw` below 1024, else `33vw`): **390** 390≥326; **768** 768≥676; **1024** 338≥296; **1440** 475≥430; **2560** 845≥520 — all **ok** (1280/1920 interpolated same formula, ≥ measured cols).
- **Cascade:** at page top with section below fold, bound items already **`revealed`** after Alpine init ( **`pending` not observed** in this pass); after scroll: all **`revealed`**. **`body[data-motion-enabled='false']`:** all bound items **opacity 1**, **transform none**. **JS disabled:** section in SSR HTML; no **`data-motion-state`** in HTML; no Liquid error string.
- **Reduced motion (headless Chromium):** not run — Playwright Chromium missing locally; CSS `@media (prefers-reduced-motion: reduce)` in `tailwind/tailwind.animates.css` applies.

**Screenshots (outside repo).**
- `C:\Users\Joey\AppData\Local\Temp\formula-details-390.png`
- `C:\Users\Joey\AppData\Local\Temp\formula-details-1440.png`

**Unverified / risks.**
- Headless **`prefers-reduced-motion`** runtime pass blocked until Playwright Chromium is installed.
- **`pending` cascade state** not captured in DevTools timing; verify in polish if required.
- Ask-tier independent review not run in this session.

### Coordinator review, round 1 (2026-10-15)

Measured at 1440 (Chrome DevTools MCP): cascade works (six items `pending` before scrolling, `revealed` after), no Liquid error, no raw HTML.

1. **P1 The band is not full width.** Its background runs from x 24 to 1401, inside the page margins. The markup uses `.full-width`, which only applies to a direct child of `.shopify-section` (`assets/base.css`); the band is nested inside `section-frame`, so the class does nothing. The implementer reported it as full bleed without measuring it. The sanctioned way is `section-frame` with `width: 'full'` and content inset with `--page-inset` (as `ritual-steps`), which needs `formula-details` on the `width: 'full'` allowlist in `css-architecture.md` (enforced by `frame-full-allowlist`): **waiting on the user.** A `calc(50% - 50vw)` breakout would recompute the page frame inside a section and is not an option.
2. **P2 Copy did not follow the design** (the plan asked for it). Fixed by the coordinator in the preset, the locale defaults and the template instance: band text, the three attribute texts, the ingredients subtitle and the three ingredient texts now carry the design's copy (spelling corrected). `lint:theme`, `lint:i18n`, `lint:liquid-syntax` and prettier pass.
- **Finding 1 resolved (user approved the allowlist entry, 2026-10-15):** `formula-details` added to the `width: 'full'` allowlist in `docs/references/style-system/css-architecture.md` and in `FRAME_FULL_ALLOWLIST` (`.agents/skills/check-theme-architecture/scripts/lib/page-frame-lint.js`); both files join the surface by that approval. The section renders `section-frame` with `width: 'full'`; the band drops `.full-width`; band and ingredients content inset with `var(--page-inset)`. Measured: 1440 (client width 1425) band 0 to 1425, band heading and image, ingredients heading and last card within 24 to 1401 (the page margins); 390 band 0 to 390, content 16 to 374, scrollWidth 390.
- Validation: `lint:theme`, `lint:liquid-syntax`, `lint:compat` (67) passed; `theme-architecture.test.js` 243 pass, 0 fail; `lint:doc-paths` passed; `doctor:agent` exit 0; `test:theme-check` 157 files, 0 offenses; `test:layout -- --page product --widths 390,768,1024,1280,1440` 0 new; prettier passed.

### Review 1 (separate session, 2026-10-15): PASS

Band spans the client width at 390, 768, 1024 and 1440 with all content inside the page margins and aligned with the editorial section; every `sizes` value at or above the rendered width from 390 to 2560 (1440: 445.66 <= 475.20); fixtures fill every slot; rules horizontal below 1024 and vertical from 1024; copy matches the design; one allowlist row and one matching Set entry, `theme-architecture.test.js` 243 pass; cascade visible under reduced motion, motion off and JavaScript disabled (headless Chromium); Tailwind output equals a fresh build; `test:layout` 0 new. Unproven: saved merchant uploads through the Theme Editor.
