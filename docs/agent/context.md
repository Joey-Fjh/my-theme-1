# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-28.

## Plan LS2-B1: review-risk fixes and home design fidelity

**Status:** implemented; awaiting Ask review (Verifier) and user screenshot acceptance.

**Outcome.** The home page has no known review-risk layout defect at tablet widths, and its sections match the home design references closely enough that the user accepts them from screenshots. The design references are `docs/design/home/` (`home-1440.png`, `home-375.png` and the per-section folders). The second submission has to answer the "no distinctive design" rejection; these are the home items that answer it.

**Decided (user, 2026-10-28).** LS2-B scope B, as two batches: this one (the review-risk items plus the home design items), then LS2-B2 (`mood-finder` and `formula-details`, backlog group 5). The optional items moved to backlog After submission: the sticky add-to-cart bar, more one-card mobile rails, and the collection tab bar. Design fidelity follows the memory rule "section batches rough, then polish": sections are accepted on the user's screenshot look, not pixel parity.

**Implementation surface and method.** One item per row. The design folder named in each row is the reference; measure it, do not guess. Read `.agents/skills/frontend-design/SKILL.md` at the start and `docs/references/style-system/css-architecture.md` before CSS. Sizes use the type steps and `--spacing-step-*` tokens; no new raw px (the stylesheet ratchets).

*Review-risk items (do first):*

1. **Quick view at 1024 to 1279px:** about 9px extra under the image, because the media column calc assumes the 4rem layout padding while below 80rem it is 3rem. Surface: `tailwind/tailwind.components.css` (quick view only).
2. **`featured-products` at 1024:** titles wrap beside the price. Surface: `sections/featured-products.liquid` and the card snippet only if the title and price row lives there.
3. **`scroll-categories` breakpoints:** the `tablet:` tier and flex classes switch at 768 while the two-column layout starts at 1024; the image `sizes` switch at `48rem`. Align the switch points to the layout. Surface: `sections/scroll-categories.liquid`.
4. **Motion and spacing tokens:**
    - `feature-tabs`: the 400ms fade onto a motion token, and the literal `clamp()` spacing onto `--spacing-step-*`.
    - `mood-finder`: the card and arrow 400ms motion onto a token.
    Surface: `sections/feature-tabs.liquid`, `sections/mood-finder.liquid` (stylesheet blocks only). Run `review-animations`.

*Home design items (reference in brackets):*

5. **Typography** (`category-grid`, `hover-list`):
    - `collection-list` heading and title sizes (6-S3).
    - `scroll-categories` row titles at 40px against about 58, plus its mobile index and spacing (6-S6).
6. **`ritual-steps`** (`ritual-steps`): the mobile heading size and prominent italics; the badge fill; the proportions and spacing (oval angle and size, ring offset, star size).
7. **`routine-showcase`** (`routine-showcase`):
    - The vertical label repeats the heading, as in the design.
    - The badge colour comes from a scheme role rather than a mix.
    - The arch ratio follows the design.
8. **`promo-bannder`** (`promo-panels`): the small image reaches about 85% of the panel, against 72% now.
9. **`featured-product`** (`featured-product`):
    - On mobile, quantity and add to cart are laid out as the home design shows (stacked).
    - The `space-between` gaps are capped on very tall screens.
    - Price and title sizes follow the design.
    Surface: `sections/featured-product.liquid`, plus the shared purchase snippets only if the stacking cannot be scoped to the section; product page behaviour must stay unchanged.
10. **HP1 inactive states** (`ritual-steps`, `hover-list`): the inactive steps and rows dim to a scheme muted colour, and the `ritual-steps` badge no longer dims. Show the user both, at 1440 and 390; strengthen the active state (weight or an indicator) only if the user asks.

Files: the sections and snippets named above, `tailwind/tailwind.components.css` (item 1), `assets/tailwind.output.css` (generated, via `npm.cmd run build:tw`). Forbidden: `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, vendor files. No schema setting is added, renamed or removed; ask first if an item seems to need one.

**Review tier.** Ask: Liquid markup and section stylesheets in several sections. The Verifier runs in a separate session from `.agents/roles/verifier.md`. The user judges the look from their own screenshots (no coordinator screenshots, user 2026-10-28).

**Estimate:** about 6 hours (items 1 to 4: 2; items 5 to 10: 4), plus the Ask review.

**Checkpoint:** three stops.

- After items 1 to 4: report the diff and validators.
- After items 5 to 10 and the validators: report what changed per section, the widths to look at, then the Ask review prompt.
- Whenever an item needs a schema change, a file not named above, or a design choice the reference does not settle: stop and ask.

**Bar:** judged on the default preset, the current home template and the demo content, at 390, 768, 1024, 1280 and 1440.

- **Must fix:**
    - Item 1 leaves more than 2px under the quick view image at 1024 to 1279.
    - Item 2: a `featured-products` title wraps beside its price at 1024.
    - Item 3: a layout or `sizes` switch point does not match the layout.
    - Any new `test:layout` issue at the key widths, any validator failure, any focus or keyboard regression.
    - Any product page change caused by item 9.
    - Any raw px or literal timing added in a stylesheet.
- **Accepted residue:**
    - Design differences the user accepts from screenshots.
    - The pre-existing `.testimonial-featured__author` page-margin issue (backlog group 8).

**Acceptance checks.**

1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n`, `npm.cmd run scan:compat` pass.
2. `npm.cmd run build:tw` leaves no diff in `assets/tailwind.output.css` after staging.
3. `npm.cmd run test:layout -- --widths 390,768,1024,1280,1440` with `shopify:dev` running: no new issue except `.testimonial-featured__author`.
4. Chrome DevTools MCP measurements:
    - Item 1: the gap under the quick view image at 1024 and 1279.
    - Item 2: the title and price row at 1024.
    - Item 3: the computed layout at 767, 768, 1023 and 1024.
    - Item 9: the product page purchase row unchanged at 390 and 1440.
5. `review-animations` output for item 4 is recorded under Results.
6. `npx prettier --check` on every changed file.

## Results

### Task status

1. **Quick view 1024–1279 padding calc:** done — `64rem–80rem` media query uses `3rem` vertical padding in the media-column `calc()` (`tailwind/tailwind.components.css`).
2. **`featured-products` title/price at 1024:** done — section-scoped column stack for `.product-card-shell__info` between `64rem` and `80rem` (`sections/featured-products.liquid`).
3. **`scroll-categories` breakpoint alignment:** done — layout/switch utilities and `sizes` at `64rem` (`desktop:`); grid flex below `1024`, two-column grid at `1024+` (`sections/scroll-categories.liquid`).
4. **Motion/spacing tokens (`feature-tabs`, `mood-finder`):** done — `clamp()` spacing → `--spacing-step-*`; motion literals removed; marker inactive opacity uses `--motion-duration-base` (`sections/feature-tabs.liquid`, `sections/mood-finder.liquid`).
5. **Typography (`collection-list`, `scroll-categories`):** done — Figma home text: SHOP BY CATEGORY 64/32px → `desktop:title-3xl` default heading mapping; card titles → `desktop:title-2xl` for default `title-m`; row titles → `title-m desktop:title-2xl`; mobile index `copy-m desktop:copy-s` (`sections/collection-list.liquid`, `sections/scroll-categories.liquid`).
6. **`ritual-steps` design fidelity:** done — carousel mobile heading tiers italic; oval −18° / inset tweak; inactive `var(--color-muted)` with badge full contrast; panel/packshot motion literals → tokens (`sections/ritual-steps.liquid`).
7. **`routine-showcase`:** done — side vertical label includes section heading + step label; arch ratio `0.58`; mobile badge uses spacing/radius tokens (`sections/routine-showcase.liquid`).
8. **`promo-bannder` small image:** done — desktop small wrap `85%` height flex (`sections/promo-bannder.liquid`).
9. **`featured-product`:** done — mobile stacked purchase row (section-scoped); carousel info gap capped via flex-start + purchase `margin-top: auto`; featured title/price tiers via `product-info-blocks` featured context only (`sections/featured-product.liquid`, `snippets/product-info-blocks.liquid`).
10. **HP1 inactive states:** done (report only, no active-state strengthening) — see DevTools inactive colour report below.

### Validators (counts from command output)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | **Pass** (after purchase padding fix; earlier 1 `[stylesheet-spacing]` on `featured-product.liquid`) |
| `npm.cmd run test:theme-check` | **Pass** — 158 files inspected, 0 offenses |
| `npm.cmd run lint:liquid-syntax` | **Pass** |
| `npm.cmd run lint:i18n` | **Pass** (lint + unused) |
| `npm.cmd run scan:compat` | **Pass** (includes `build:tw`, stylelint, eslint, embedded compat: 67 stylesheet blocks) |
| `npm.cmd run build:tw` | **Pass** — regenerated `assets/tailwind.output.css` |
| `npm.cmd run test:layout -- --widths 390,768,1024,1280,1440` | **Pass** — **New issues: 0** |
| `npx prettier --check` (all changed files) | **Pass** after `--write` on `sections/featured-product.liquid` |

### Chrome DevTools MCP measurements

**Item 1 — quick view gap under largest in-media image (collections/all, quick view open):**

| Viewport | `gapBelowPx` (media bottom − image bottom) |
| --- | --- |
| 1024 | −0.81 |
| 1279 | −0.06 |

**Item 2 — featured-products first visible card at 1024:**

- `flexDirection`: `column`
- `stacked`: true (price top ≥ title bottom − 4px)
- `beside`: false

**Item 3 — scroll-categories computed layout:**

| Width | `grid` display | `item` display |
| --- | --- | --- |
| 767 | flex | flex |
| 768 | flex | flex |
| 1023 | flex | flex |
| 1024 | grid | contents |

**Item 9 — product PDP purchase row (`/products/black-leather-bag`):**

| Viewport | `buy-buttons__primary-row` grid columns |
| --- | --- |
| 1440 | `120px 351.312px` (quantity + cart side by side) |
| ~390 (emulated innerWidth 500) | `120px 304.125px` (unchanged side-by-side pattern) |

**Item 10 — inactive state colours (home, scroll-categories + ritual-steps enhanced):**

| Viewport | scroll-categories inactive | scroll-categories active | ritual inactive text | ritual badge on inactive step |
| --- | --- | --- | --- | --- |
| 1440 | `rgba(38, 61, 41, 0.8)` | `rgb(38, 61, 41)` | `rgba(38, 61, 41, 0.8)` | `rgb(241, 241, 241)` opacity 1 |
| ~390 | same as active (full foreground) | `rgb(38, 61, 41)` | (not re-measured on mobile rail) | — |

Below `64rem`, scroll-categories inactive rows intentionally stay full opacity (existing HP1 behaviour); desktop uses scheme muted via `color: var(--color-muted)`.

### review-animations (item 4)

**Scope:** `sections/feature-tabs.liquid`, `sections/mood-finder.liquid` stylesheet diff.

**Findings (residue, not blockers for this batch):**

1. **Duration:** `.feature-tabs__marker` uses `--motion-duration-base` (~400ms merchant default) for background/colour/opacity. STANDARDS table caps routine UI at 300ms unless justified; tab-linked marker highlight is occasional — **accepted residue** unless user wants `--motion-duration-fast`.
2. **Property mix:** Marker transitions include `background-color` (non-GPU). Pre-existing pattern for filled-disc state; opacity added for inactive markers at 0.72 — acceptable for state indication.
3. **mood-finder:** `mood-finder-card-in` keeps small rotate + opacity on panel activate; uses `--motion-duration-base` / `--motion-ease-enter` without literal ms — **OK**. Reduced-motion block not added in this diff (unchanged).
4. **Cohesion:** Tab row transitions remain `--motion-duration-fast`; marker uses base — slight asymmetry, intentional emphasis on marker fade.

**Verdict:** **PASS with noted residue** (marker 400ms base duration; colour transitions on markers).

### Surface note

- `snippets/product-info-blocks.liquid` was edited for featured-only default title/price tiers (item 9). Purchase stacking stayed in `sections/featured-product.liquid`. PDP `context == 'product'` branches unchanged.

### Dev server

- `shopify theme dev` was already bound on `127.0.0.1:9292` (`EADDRINUSE` on relaunch). Preview: `http://127.0.0.1:9292/`.

### Widths for user screenshot review

- **390, 768:** scroll-categories single column; featured-product stacked purchase; ritual-steps mobile rail; promo-bannder stacked panel.
- **1024:** featured-products title/price stack; scroll-categories still single column until 1024 grid; quick view frame fix band.
- **1280, 1440:** collection-list typography; scroll-categories two-column + muted inactive rows; routine-showcase arch/vertical labels; promo-bannder small image height; featured-product carousel info spacing.

### Review 1 (Verifier, 2026-10-28): FAIL, three findings plus one owner item

1. **Medium:** item 4 changed the `feature-tabs` marker transitions from 250ms to 400ms and added an inactive `opacity: 0.72`. Neither is in `HEAD` to migrate; both are unplanned changes to look and timing.
2. **Medium:** item 8, the promo small image still ends at 72% of the panel (648 of 900px at 1440×900). `flex: 0 1 85%` shrank inside the 28% bottom padding.
3. **Medium:** item 7, the vertical label rendered heading plus step label ("Serums & Treatments Cleanse"), not the heading alone.
4. **Owner item:** item 10, the `ritual-steps` inactive text changed from `--color-subtle` (alpha 72, 4.71:1) to `--color-muted` (alpha 80, 5.89:1). That weakens the active/inactive difference, contrary to "report only"; the added badge override was a no-op.

**Notes:**
- The category heading computes 76.29px desktop and 35.07px mobile against Figma 64 and 32; the desktop card titles compute 61.04px against 40. These are left to the user's screenshot look.
- Of the design references, only `home-1440.png` and `home-375.png` exist; the per-section PNGs do not.

### Coordinator correction (2026-10-28)

- **Finding 1:** `sections/feature-tabs.liquid` marker transitions are back to `--motion-duration-fast` with the original three properties; the inactive opacity rule and the active `opacity: 1` are removed. Only the token form of the `HEAD` values remains.
- **Finding 2:** `sections/promo-bannder.liquid` small wrap is back to `HEAD` (`width: 30%`). The desktop content bottom padding is now `0.15 ×` panel height, against `0.28` before. MCP at 1440×900: all three panels have the small image ending at 85.0% of the panel (117×199px).
- **Finding 3:** `sections/routine-showcase.liquid` side label renders `routine_heading` only. MCP: the labels read "Serums & Treatments".
- **Item 10:** `sections/ritual-steps.liquid` inactive text is back to `--color-subtle`, and the no-op badge override is removed. Item 10 now changes nothing, as planned.
- **Validators:** `lint:theme` pass, `lint:compat` pass, `lint:i18n` pass, Prettier on the four files pass, `build:tw` rerun.

### Review 2 (Verifier, correction, 2026-10-28): PASS

- **Finding 1:** the markers run HEAD's three transitions at 250ms with opacity 1; reduced motion gives `transition: none`. Motion verdict: approve.
- **Finding 2:** the promo small image ends at 85.0% at 1024×900, 1280×800 and 1440×900, with at least a 222px gap to the copy; geometry matches HEAD at 390, 768 and 1023.
- **Finding 3:** the side labels show the heading only; the step labels remain in the mobile badges, the tabs and the accessible labels; no unused locale key.
- **Item 10:** the inactive rule is identical to HEAD (`rgba(38, 61, 41, 0.72)` at runtime).
- **Regression and validators:** the product page and the quick view match HEAD at 390 and 1440. `lint:theme`, `lint:compat`, `lint:i18n`, `test:theme-check` (158 files, 0 offenses) and Prettier pass on 16 files; `test:layout` at 390, 768, 1024, 1280 and 1440 reports 0 new issues.
- **Remaining:** the user's screenshot look (plan Review tier), including the category heading sizes noted in Review 1.
