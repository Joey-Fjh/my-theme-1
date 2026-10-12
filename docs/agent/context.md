# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-R5 `stylesheet-font-size` 15 → 1 on the type steps

**Status:** accepted and authorized by the user 2026-10-13 ("同意" to rules A, B, C and the countdown exception). Run from an external execution prompt on the main model.

**Outcome:** 14 of the 15 `stylesheet-font-size` hits move onto the fluid type steps; `promotion-countdown` stays (it depends on `body-size-custom`, scheduled for the polish pass). The count goes 15 → 1 and stays a ratchet until that hit is gone.

**Review tier:** Ask (Liquid stylesheets and `snippets/css-variables.liquid`, a removed custom property, rendering changes, external execution prompt).

**Type steps** (`snippets/css-variables.liquid`, fluid from 375px to 1280px; px at 375 / 1280 with default settings): `-1` 11.7 / 12.8; `0` 14 / 16; `7` 50.2 / 76.3; `8` 60.2 / 95.4. Tiers multiply by `--font-body-scale` or `--font-heading-scale` (`tailwind/tailwind.typography.css`); every new value keeps the scale its old value used.

### Decisions (user, 2026-10-13)

- **Rule A, body-relative sizes → nearest step:**
  - `sections/search.liquid` small text (now `--font-body-size-mobile × 0.75`, `--font-body-size × 0.875` at ≥48rem; 10.5 / 14) → `calc(var(--font-body-scale) * var(--type-step--1))` (11.7 / 12.8), one value, the media query goes.
  - `sections/search.liquid` price (12.25 / 16) → `calc(var(--font-body-scale) * var(--type-step-0))` (14 / 16).
  - `snippets/sort-by-dropdown.liquid` (14 / 18) → `calc(var(--font-body-scale) * var(--type-step-0))` (14 / 16).
- **Rule B, merchant setting kept:** `snippets/pagination.liquid` (3 hits, `var(--font-pagination-size)` = setting px × body scale, 13px by default at every width). `snippets/css-variables.liquid` replaces `--font-pagination-size` with a unitless `--font-pagination-ratio` = `pagination_font_size` (default 13) / the mobile body size it divides by today; pagination uses `calc(var(--font-body-scale) * var(--type-step-0) * var(--font-pagination-ratio))` (13 / 14.9 by default). The setting keeps its effect; no schema change.
- **Rule C, display sizes above the scale → top step × factor (heading scale kept):**
  - `ritual-steps__outline-num` (65, jumping to 110 at ≥64rem) → `calc(var(--font-heading-scale) * var(--type-step-8) * 1.15)` (69 / 110), one fluid value, the ≥64rem override goes.
  - `ritual-steps__outline-num--mobile` (50) → `calc(var(--font-heading-scale) * var(--type-step-7))` (50 / 76).
  - `.ritual-steps__carousel-col--media .ritual-steps__outline-num` (260) → `calc(var(--font-heading-scale) * var(--type-step-8) * 2.7)` (163 / 258).
  - `snippets/watermark.liquid` marquee (`clamp(3rem, 12vw, 7.5rem)` × heading scale; about 45 / 75) → `calc(var(--font-heading-scale) * var(--type-step-8) * 0.8)` (48 / 76); `--font-watermark-marquee-size` is removed (its only consumer is that line).
- **Exception:** `sections/promotion-countdown.liquid` line with `var(--promotion-countdown-size)` stays, counted, until `body-size-custom` is migrated.

### Implementation surface

- `{% stylesheet %}` blocks of `sections/search.liquid`, `sections/ritual-steps.liquid`, `snippets/sort-by-dropdown.liquid`, `snippets/pagination.liquid`, `snippets/watermark.liquid`.
- `snippets/css-variables.liquid`: the `--font-pagination-size` declaration only.
- `.agents/skills/check-theme-architecture/scripts/stylesheet-ownership-baseline.json` (shrink flag only).
- `docs/references/style-system/css-architecture.md` (count line).
- This file.

Forbidden: markup and class attributes, `{% schema %}` / `{% javascript %}` blocks, `config/**`, `templates/**`, `sections/*-group.json`, `locales/**`, `tailwind/**`, `assets/*.js`, the lint code, other baselines, `promotion-countdown.liquid`.

### Acceptance checks

1. `collectStylesheetOwnershipCounts`: `stylesheet-font-size` 1 (only `promotion-countdown.liquid`), `mixed-element` 0 (command named); baseline shrunk to that.
2. Each new value is exactly the decision's expression; `git grep` finds no remaining `--font-pagination-size` or `--font-watermark-marquee-size` outside docs and the lint test's sample string; schema and javascript blocks and all markup outside `{% stylesheet %}` unchanged versus HEAD (script); `git diff HEAD -- tailwind config templates locales "assets/*.js"` empty.
3. Computed style, one serving pipeline (lessons from 6-R3 / 6-R4): before the first edit, two before-runs from local `npm.cmd run shopify:dev`, every page in `.agents/tools/layout-check/layout-check.config.json` at 375, 768, 1024, 1280, 1440; after, one run. Noise per (slot, element path, property); check each slot's URL (the first slot can land on `/`); Swiper or loading state that differs between runs is shown by element counts or a probe, not assumed. Accepted differences: the font sizes above and what follows from them (line boxes, widths, heights, positions of the same and later elements). Pages not covered by the config (for example pagination with more than one page, the watermark section if absent) are named as unproven. Evidence outside the repo in `D:/project/shopify_project/6-r5-evidence/`, deleted at batch close.
4. Validators: `npm.cmd run lint:theme`, `test:theme-architecture`, `test:theme-check`, `lint:liquid-syntax`, `scan:compat`, `lint:doc-paths`, `npx prettier --check` on changed files; `npm.cmd run test:layout` 0 new against the 42-entry baseline (not edited; if a change creates a new issue, stop and report).
5. User look at the changed sizes: in the consolidated browser pass.

## 6-R5: executed

**Status:** implemented 2026-10-13. Not accepted. Checks 1–4 below passed. Check 5 (user look) is still open. Review tier stays Ask.

### Per-hit result

Default settings on the dev store (`--font-body-scale` 1, `--font-heading-scale` 1, body 16px / mobile 14px, root 62.5%). Endpoint px are the clamp ends the decision names. `sections/search.liquid` title shares the price declaration (one `font-size`, two selectors).

| File:line | Old | New | px at 375 / 1280 |
| --- | --- | --- | --- |
| `sections/search.liquid:189` (brand; ≥48rem query removed) | `calc(var(--font-body-size-mobile) * var(--font-body-scale) * 0.75)` and, at ≥48rem, `calc(var(--font-body-size) * var(--font-body-scale) * 0.875)` | `calc(var(--font-body-scale) * var(--type-step--1))` | 11.7 / 12.8 |
| `sections/search.liquid:199` (title and price; ≥48rem query removed) | `calc(var(--font-body-size-mobile) * var(--font-body-scale) * 0.875)` and, at ≥48rem, `calc(var(--font-body-size) * var(--font-body-scale))` | `calc(var(--font-body-scale) * var(--type-step-0))` | 14 / 16 |
| `snippets/sort-by-dropdown.liquid:143` (≥48rem query removed) | `calc(var(--font-body-size-mobile) * var(--font-body-scale))` and, at ≥48rem, `calc(var(--font-body-size) * var(--font-body-scale) * 1.125)` | `calc(var(--font-body-scale) * var(--type-step-0))` | 14 / 16 |
| `snippets/css-variables.liquid:247` | `--font-pagination-size: calc(var(--font-body-size-mobile) * var(--font-body-scale) * pagination / mobile body)` | `--font-pagination-ratio: calc(pagination_font_size / theme_body_font_size_mobile)` (default 13 / 14) | unitless |
| `snippets/pagination.liquid:125`, `:193`, `:259` | `var(--font-pagination-size)` | `calc(var(--font-body-scale) * var(--type-step-0) * var(--font-pagination-ratio))` | 13 / 14.9 |
| `sections/ritual-steps.liquid:794` (≥64rem `11rem` override removed) | `calc(var(--font-heading-scale) * 6.5rem)` | `calc(var(--font-heading-scale) * var(--type-step-8) * 1.15)` | 69 / 110 |
| `sections/ritual-steps.liquid:806` | `calc(var(--font-heading-scale) * 5rem)` | `calc(var(--font-heading-scale) * var(--type-step-7))` | 50.2 / 76.3 (decision rounds 50 / 76) |
| `sections/ritual-steps.liquid:1059` | `calc(var(--font-heading-scale) * 26rem)` | `calc(var(--font-heading-scale) * var(--type-step-8) * 2.7)` | 163 / 258 |
| `snippets/watermark.liquid:246` (`--font-watermark-marquee-size` removed) | `var(--font-watermark-marquee-size, clamp(3rem, 12vw, 7.5rem))` | `calc(var(--font-heading-scale) * var(--type-step-8) * 0.8)` | 48 / 76 |

`sections/promotion-countdown.liquid` was not edited. Other `@media (width >= 64rem)` blocks in `ritual-steps.liquid` stay.

### Evidence

Folder `D:/project/shopify_project/6-r5-evidence/`: `computed-style.mjs`, `runs/before-1/`, `runs/before-2/`, `runs/after/` (each 35 `json.gz` slots plus `manifest.json`), `compare.jsonl`, `compare-summary.json`. Capture: local `http://127.0.0.1:9292` (`npm.cmd run shopify:dev`, theme id `156450390090` on every slot), reduced motion emulated, password from `.env` and never printed. Every slot URL matched its page (home `/`, cart `/cart`, search `/search?q=a`, collections `/collections`, collection-all `/collections/all`, not-found `/this-path-should-404-layout-check`, page-about-view `/pages/privacy-policy?view=about`) at 375, 768, 1024, 1280, 1440. A first smoke hit `{"error":"unauthorized"}` at `/` with that URL; the script treats that document as not the page and retries. The two before-runs and the after-run did not need a URL retry.

`node D:/project/shopify_project/6-r5-evidence/computed-style.mjs compare` wrote 691 differing elements after dropping cells that disagreed between the two before-runs. Classified from that file:

- **33, rule B variable.** The root custom properties only: `--font-pagination-size` gone, `--font-pagination-ratio` present.
- **30, rule C font-size, plus line-height in px** (`line-height: 1`). Home `ritual-steps__outline-num--mobile`: 50px → 50.164px at 375; at 1280 the removed ≥64rem override had been 110px → 76.293px. Home carousel `ritual-steps__outline-num`: 260px → 162.533px at 375 and 257.491px at 1280 (the 1280 window’s `100vw` sits under the clamp end, so 257.491 rather than 258).
- **96, rule B font-size, plus line-height in px.** Search and collection-all pagination buttons, page links, their icon SVGs, and anonymous children: 13px at every width → 13.806px at 768, 14.332px at 1024, 14.857px at 1280. At 375 the used size stays 13px, so those slots have no font-size diff. Each of those pages shows three page buttons (current + two others). An ellipsis for a longer list is not in the DOM.
- **183, geometry following that font-size.** Width, height, margin, and `rect-*` of the pagination row and of later elements (footer included) on those same slots. Two further records (search 768 and collection-all 768, classless) combine the ratio-variable swap with a height change of the same kind.
- **342, presence only — a different runtime document, not a type step.** Tag and class from the capture: almost all are classless `<link>` elements in `head` (for example cart 768 added 48; collections 1024 removed 128). Collections at 768 and 1024 also drop the hCaptcha subtree (`h-captcha`, `iframe`, `textarea`, `info`, `links`, `privacy`, `terms`). Element counts show it: collections 1024 is 784 / 794 / 637. Home 1280/1440 drop 4 and 3 classless links. `swiper-slide` marker counts did not differ between the two before-runs; the before-run element-count gaps were these classless nodes.
- **5, shopify-account hydration on collections 375.** `header-icon-button` loses `--shopify-account-*` (font 16px → 14px) and three descendants move from Arial 13.333px to Instrument Sans 14px. Both before-runs had the component properties; the after-run did not. No rule in this batch targets that control.

Unproven on the config pages:

- Watermark marquee: `watermark-marquee` count is 0 on every slot.
- Search predictive brand and price: `.search-predictive-panel` is in the DOM on `/search`, and 0 `product-card-shell__brand` / `__price` nodes are inside it. The results-grid cards that carry those classes sit outside the selector, so their font-size stays 14px/16px (brand) and 16.8px/20px (price).
- Sort options on collection-all: `sections/collection.liquid` `.collection-section .sort-by-dropdown__option` is `calc(var(--font-body-scale) * var(--type-step-1))` and beats the snippet rule (comment: it must beat the owner rule). Computed size stays 16.8px at 375 and 20px at 1280. The snippet declaration itself has no other rendered consumer in this sweep.
- The ritual base outline (was 65px, then 110px at ≥64rem) has no element whose before size was 65px. The outline elements on the home page are the mobile modifier and the carousel number, both measured above.

### Validation

- `node .agents/skills/check-theme-architecture/scripts/lint-theme.js --shrink-stylesheet-ownership-baseline` → `Stylesheet ownership baseline shrunk to the current counts.` Baseline file is `{ "stylesheet-font-size": { "sections/promotion-countdown.liquid": 1 } }`.
- `collectStylesheetOwnershipCounts` (node require of `.agents/skills/check-theme-architecture/scripts/lib/stylesheet-ownership-lint.js`): `stylesheet-font-size` 1 (`sections/promotion-countdown.liquid`), `mixed-element` 0.
- `git grep -n -e "--font-pagination-size" -e "--font-watermark-marquee-size"`: only `docs/agent/context.md`, `docs/references/style-system/css-architecture.md`, and the sample string in `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`.
- Markup script (strip `{% stylesheet %}`, compare `{% schema %}` and `{% javascript %}` to `HEAD`): schema and javascript identical on every touched Liquid file and on `promotion-countdown.liquid`. Outside-stylesheet identical on search, ritual-steps, sort-by-dropdown, pagination, watermark, and promotion-countdown. `snippets/css-variables.liquid` differs only by the ratio declaration, which is not inside `{% stylesheet %}`.
- `git diff HEAD --stat -- tailwind config templates locales "assets/*.js"`: empty. `assets/tailwind.output.css` and `layout-check.baseline.json` have no diff. Baseline entry count from `require('./.agents/tools/layout-check/layout-check.baseline.json')`: 42.
- `npm.cmd run lint:theme`: `Theme architecture lint passed.`
- `npm.cmd run test:theme-architecture`: `# tests 237`, `# pass 237`, `# fail 0`.
- `npm.cmd run test:theme-check`: `151 files inspected with no offenses found.`
- `npm.cmd run lint:liquid-syntax`: `Liquid syntax lint passed.`
- `npm.cmd run scan:compat`: Tailwind build, stylelint, eslint, and `Embedded compatibility lint passed (61 stylesheet blocks, 0 javascript blocks).`
- `npm.cmd run lint:doc-paths`: `Doc path lint passed.`
- `npx prettier --check` on the eight changed files: `All matched files use Prettier code style!`
- `npm.cmd run test:layout`: `New issues (not in baseline): 0`.


**Coordinator check of 6-R5 (2026-10-13):**
- `ritual-steps__outline-num--mobile` "110 → 76 at 1280": the element sits in `.ritual-steps__mobile`, which is `display: none` at ≥64rem, so that change is not painted. Painted change: 768–1023px, fixed 50px before, now the step-7 fluid value (about 62px at 768, about 69px at 1023), as the decision's 50 / 76 implies. The old ≥64rem 110px override applied to that element only while it was hidden.
- The executor's classification covers every differing element (691): decided font sizes, their geometry, the pagination ratio custom property, head and hCaptcha presence, and the `shopify-account` control's runtime custom properties. Unproven items are named (watermark, predictive search brand and price, pagination ellipsis, the base outline number); the collection sort control keeps `sections/collection.liquid`'s more specific step-1 rule, outside this batch.
- Verdict: ready for independent review.

**Independent review 1 (2026-10-13): PASS.** No findings. Unproven and bounded: watermark marquee, predictive-search brand and price, pagination ellipsis, base outline number; the user's look goes to the consolidated browser pass.
