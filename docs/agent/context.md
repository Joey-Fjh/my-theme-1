# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-15.

## Batch 6-P3: product page `editorial-collage` section

**Status:** done. Review 2 PASS and the user's acceptance (2026-10-15). Accepted.

**Outcome.** A new static section `editorial-collage`: heading and text with three images in a two-row collage, revealed by the theme's existing cascade. Rough-first; detail tuning goes to the polish pass.

**Design input:** `docs/design/product/editorial-collage/notes.md` (screenshot local, Git-ignored). Decisions accepted by the user (2026-10-15): radius from the token (design.md), cascade reveal only, derived mobile.

**Dependencies:**
- The user authorizes adding one `editorial-collage` instance to `templates/product.json` after `mood_finder_product` (merchant-owned file, this batch only).

**Project conventions the implementer must apply:**
- The root font size is 62.5%: `1rem` = 10px. Never convert from 16px.
- Spacing (`padding`, `margin`, `gap`, offsets) uses `var(--spacing-step-*)` or the step utilities only; no literal `clamp()` or rem spacing in `{% stylesheet %}`.
- Type tiers (`title-*` only on headings, `copy-*` elsewhere), colour roles, `--radius-card` for these images, no new shadows.
- Shopify names and parameters are checked in Shopify Dev MCP before use.
- No code that exists only to satisfy a check; no new `lint-allow` without asking the user first.
- `icons/` is Git-ignored; list it with the file system, never with git (not needed in this batch).

**Implementation surface:**
- `sections/editorial-collage.liquid` (new).
- `locales/en.default.json`, `locales/en.default.schema.json`: new keys under `sections.editorial-collage`.
- `templates/product.json`: one instance after `mood_finder_product` (dependency).
- `docs/agent/context.md` (Progress).
- Not in the surface: any `assets/*.js`, shared snippets, tokens, `tailwind/`, `docs/design/design.md`, other sections.

**Structure (contract):**
- Frame: `section-frame`, page width, colour scheme setting, padding top and bottom, `motion: true`.
- Content: heading (`<h2>`, merchant heading size select like other sections), text (richtext, `copy-*`), three images through `snippets/image.liquid` with merchant alt text (empty alt only when the merchant leaves it blank and the image is decorative, per `docs/references/style-system/image-display-contract.md`), `sizes` matching the rendered widths, the first image not lazy only if the section can be first on the page (it cannot on the product template: all lazy).
- Reveal: the existing cascade only (`data-motion-cascade` on the collage container, `data-motion-bound` on the text block and each image), as `sections/scroll-categories.liquid` does. No new keyframes, no GSAP, no hover effect.
- Desktop (≥ 64rem): two rows, two columns (about 55% and 42% with a token gap), columns aligned across rows; row 1 text and texture image (landscape), row 2 product image and detail image; image ratios from the design (texture about 417 / 254, product about 545 / 410, detail about 417 / 410), cropped with cover; radius `--radius-card`.
- Tablet (48 to 64rem): desktop arrangement or the mobile one, whichever lays out cleanly; record which.
- Mobile: text, texture full width, product and detail images side by side (two equal columns, same height).
- Empty states: a missing image renders `decorative-placeholder-svg` with a valid name (Shopify Dev MCP; `lifestyle-1`, `lifestyle-2`, `image`, product and collection names exist; `lifestyle-3` does not); heading and text fall back to locale defaults. No Liquid error in any state.
- Schema: colour scheme, heading, heading size, text, three image pickers (texture, product, detail), padding top and bottom; preset with the design's copy (literal in the preset, as the i18n lint requires); labels and defaults as `t:` keys.

**Acceptance checks:**
1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`: 0 errors (counts from output).
2. `npm.cmd run test:layout -- --page product --widths 390,768,1024,1280,1440` with `npm.cmd run shopify:dev` running: 0 new issues; baseline not grown.
3. `npx prettier --check` on every changed text file.
4. Chrome DevTools MCP on the product page at 390 (device emulation), 768, 1024, 1440: every image box non-zero, inside the page margins, ratios as specified (report measured width x height); columns aligned across rows on desktop (report the left edges and widths); no horizontal scroll; no Liquid error in the section's text, with images set and in the empty state.
5. Cascade: with `motion_enabled` on, the bound items start hidden and settle visible after scrolling into view (report `data-motion-state` before and after); with `prefers-reduced-motion: reduce` (headless Chromium) they are visible without animation; with JavaScript disabled, all content is visible.
6. `review-animations` run on any motion diff (expected: none beyond the existing cascade), output recorded here.
7. `assets/tailwind.output.css`, if changed, equals a fresh `npx tailwindcss -i ./tailwind/tailwind.input.css` build (a running `watch:tw` keeps stale classes; ask the user to restart it if they differ).
8. Screenshots at 390 and 1440 saved outside the repository for the user.

**Review tier:** Ask (new Liquid and schema; runs from an external prompt). Coordinator review, then a separate review session; both must PASS. Then the user's look.

## Progress

**Implementation (2026-10-15).**
- Added `sections/editorial-collage.liquid`: `section-frame` + `motion: true`, cascade on grid container, four `data-motion-bound` targets (copy + three images), `image.liquid` when set / `decorative-placeholder-svg` when blank (`lifestyle-1`, `product-1`, `lifestyle-2`), all images `loading: lazy`, aspect ratios in `{% stylesheet %}`, `--radius-card` on media shells.
- Locales: `sections.editorial-collage` keys in `en.default.json` and `en.default.schema.json`.
- `templates/product.json`: `editorial_collage_product` after `mood_finder_product`.

**Tablet choice (48–64rem MQ rem ≈ 768–1023 CSS px with default UA rem):** **mobile arrangement** (stacked copy + full-width texture, then equal-height product/detail pair). Desktop two-row grid uses Tailwind `desktop:` (`width >= 64rem` → 1024px at 16px MQ rem), verified at 1024 and 1440.

**Deviations.**
- Split BEM shells from Tailwind placement wrappers so `mixed-element` stays 0 (css-architecture 6-R4); image sizing moved into `{% stylesheet %}` (`.editorial-collage__img`, `.editorial-collage__placeholder-svg`) instead of `h-full w-full` on the same node as BEM classes.
- Preset copy is rough-first placeholder prose (not read from Git-ignored `desktop.png`); matches preset literals and `en.default.json` defaults.

**Validation.**
1. `npm.cmd run lint:theme`: passed (0 errors; 3 pre-existing `[dead-setting-unprovable]` infos only).
2. `npm.cmd run test:theme-check`: 156 files inspected, 0 offenses.
3. `npm.cmd run lint:i18n`: passed; unused-key lint passed.
4. `npm.cmd run lint:liquid-syntax`: passed.
5. `npm.cmd run lint:compat`: passed (embedded: 66 stylesheet blocks, 0 javascript blocks).
6. `npx prettier --check` on changed text files: passed.
7. `npm.cmd run test:layout -- --page product --widths 390,768,1024,1280,1440`: New issues 0 (horizontal-scroll/unclipped-overflow/page-margin/tap-targets/clipped-text/runtime all 0 per width row).
8. `assets/tailwind.output.css` vs fresh `npx tailwindcss -i ./tailwind/tailwind.input.css`: `fc /b` no differences.
9. Shopify Dev MCP `validate_theme`: 4/4 files SUCCESS.

**review-animations (batch surface: cascade attrs only; no new transitions/keyframes in section).**
- No new motion authored; reuses existing `[data-motion-cascade]` / `motionRevealSection` + `tailwind.animates.css` cascade rise.
- Finding: none. No escalation triggers in the section diff.

**Chrome DevTools MCP measurements** (`/products/floral-white-top`, placeholder images, empty-image state).
- **390×844 (mobile emulation):** margins ~16px L/R; copy 358×87 @ left 16; texture 358×218 (ratio 1.642); product 174×131 @ left 16; detail 174×131 @ left 200; pair equal height; no horizontal scroll; no Liquid error.
- **768×1024:** mobile-stack; margins ~19px L; texture 714×435; product 341×256 @ left 25; detail 341×256 @ left 388; ratios ~1.641 / 1.332 / 1.332; no Liquid error.
- **1024×768:** desktop-two-column; copy & product left 22 (widths 538); texture & detail left 577 (widths 411); row1 copy+texture height 250, row2 product+detail height 404; ratios 1.644 / 1.332 / 1.017 (expected 1.642 / 1.329 / 1.017); no Liquid error.
- **1440×900:** desktop; content column left 36; texture 570×347 @ left 822; product 746×561 @ left 36; detail 570×560 @ left 822; ratios 1.643 / 1.33 / 1.018; columns aligned (left 36 / right 822); no horizontal scroll; no Liquid error.
- **Cascade (`motion_enabled`):** before scroll into section — all four bound items `data-motion-state="pending"`; after scroll + 1.5s — all `"revealed"`.
- **Reduced motion (headless Chromium):** not run — Playwright browser binary missing on this machine (`browserType.launch: Executable doesn't exist`). CSS contract: `@media (prefers-reduced-motion: reduce)` forces bound items visible in `tailwind/tailwind.animates.css`.
- **JavaScript disabled:** SSR HTML includes heading and collage markup; no `data-motion-state` in initial HTML (targets visible per animates.css no-JS note); no Liquid error string in HTML.

**Screenshots (outside repo).**
- `C:\Users\Joey\AppData\Local\Temp\editorial-collage-390.png`
- `C:\Users\Joey\AppData\Local\Temp\editorial-collage-1440.png`

**Unverified / risks.**
- Headless `prefers-reduced-motion: reduce` runtime pass blocked until Playwright Chromium is installed.
- Visual polish vs Git-ignored design PNG deferred to polish pass.
- Ask-tier independent review not run in this session.

### Coordinator review, round 1 (2026-10-15): three findings, fixed by the coordinator

1. **P1 Raw `<p>` tags on the page.** With the section's text blank (the template instance), the fallback locale string held `<p>…</p>`, and the `t` filter escapes HTML unless the key ends in `_html` (Shopify Dev MCP, storefront locale files). The locale default is now plain text and the markup wraps it: `| t | prepend: '<p>' | append: '</p>'`.
2. **P2 Invisible placeholder frames.** `.editorial-collage__image-wrap--placeholder` used `rgb(var(--color-surface-muted))`; that token is a full colour value, so the declaration was invalid and dropped (no frame, no visible radius in the empty state). Now `rgb(var(--color-background))` with the `@supports (color-mix)` `var(--color-surface-muted)` override, as in feature-tabs. Measured: placeholder background `rgba(38, 61, 41, 0.05)`, radius 16px.
3. **P3 Preset copy.** Heading and text follow the design ("An object of everyday care." and its paragraph, typos corrected) in the preset and the locale defaults.
- Checked: an uploaded-image fixture (a `theme-image` frame wrapper with a 0.6 ratio swapped into the product slot) fills the slot exactly (769 x 579 at 1440).
- Validation: `lint:theme`, `lint:i18n` (unused passed), `lint:liquid-syntax`, `lint:compat` (66) passed; `test:theme-check` 156 files, 0 offenses; `test:layout -- --page product --widths 390,768,1024,1280,1440` 0 new; prettier passed.
- Still unverified by the implementer: reduced motion in headless Chromium and the JavaScript-disabled view of the cascade; left to the review session.

### Review 1 (separate session, 2026-10-15): FAIL, one finding; fixed by the coordinator

- P3 the desktop `sizes` fallbacks undershot the rendered slots at 1440 (texture and detail 587.58px against `40vw` = 576px; product 769.42px against `52vw` = 748.8px), against the image-display contract. Now `(min-width: 64rem) 42vw` for the texture and detail, `55vw` for the product (mobile values unchanged: `100vw` texture, `50vw` pair). Measured slot widths as a share of the viewport (Chrome DevTools MCP emulation): 1024 38.9 / 50.9 / 38.9vw, 1440 39.6 / 51.8 / 39.6vw, 1920 34.6 / 45.3 / 34.6vw, 2560 25.9 / 33.9 / 25.9vw; the reviewer's 1440 reading was 40.8 / 53.4vw. The new values sit above every reading; the share falls on wider screens.
- Everything else in Review 1 was proven, including reduced motion, motion off and JavaScript disabled in headless Chromium.

### Review 2 (separate session, 2026-10-15): PASS

Rendered width at or below the declared `sizes` fallback for every slot at 390, 768, 1024, 1280, 1440, 1920 and 2560 (for example 1440: 587.58 <= 604.80, 769.42 <= 792); the source change since Review 1 is the three `sizes` strings; text and empty frames intact at 390 and 1440; Tailwind output equals a fresh build; `test:layout` 0 new. Unproven: saved merchant uploads through the Theme Editor.
