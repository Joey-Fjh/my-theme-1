# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-15.

## Batch 6-P5: carousel dots follow the colour scheme

**Status:** done; accepted by the user's look (2026-10-16). Commit deferred: grouped with the next batches (user).

**Outcome.** Every Swiper pagination dot takes its colours from the section's colour scheme through one shared default: the active dot in the scheme foreground, the others in the same colour at a low opacity (`design.md`, Component States: selected is ink against faint siblings). Today the product page carousel shows Swiper's defaults (active `#007aff`, others `#000` at 0.2), and three sections each override the colours their own way.

**Decision (user, 2026-10-15):** gallery modes keep their structure (no thumbnails rework); only the dot colours are brought under the scheme. The slideshow's accent pill (6-A1) is unaffected: it does not use Swiper pagination.

**Implementation surface (coordinator executes):**
- `tailwind/tailwind.components.css`: one shared rule on `.swiper-pagination` setting `--swiper-pagination-color` and `--swiper-pagination-bullet-inactive-color` to `rgb(var(--color-foreground))` and `--swiper-pagination-bullet-inactive-opacity` to one value. Declared on the pagination element so the scheme resolves where the dots render (a `:root` declaration would freeze the root scheme).
- `sections/featured-product.liquid`, `sections/featured-products.liquid`, `sections/icon-with-text.liquid` (`{% stylesheet %}` only): remove their colour and opacity overrides of the dots; keep size, spacing and layout rules.
- `assets/tailwind.output.css` (build output).
- Not in the surface: markup, schema, JS, `snippets/product-gallery-carousel.liquid` (it needs no change), the slideshow.

**Acceptance checks:**
1. `npm.cmd run scan:compat`, `npm.cmd run lint:theme`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check`: 0 errors.
2. Chrome DevTools MCP: on the product page carousel (a product with several images, gallery switched to carousel by a DOM-free check of the rendered carousel or by temporarily viewing a carousel consumer), on the home `featured-product`, `featured-products` and `icon-with-text`: the active dot's computed background equals the section's `--color-foreground`, inactive dots the same colour at the shared opacity; no `#007aff` anywhere; a section on a different scheme shows its own foreground.
3. `npm.cmd run test:layout -- --page product --widths 390,1440` and the home page: 0 new issues.
4. `assets/tailwind.output.css` equals a fresh build.
5. Screenshots of the dots on the home page and the product page for the user.

**Review tier:** Show (CSS only: `tailwind/` and `{% stylesheet %}` blocks). The coordinator runs the validators and reports the diff; the user's look is the review.

**Next (board):** 6-P6, the product page right column per the design (spacing, bordered boxes, buy it now outlined, quantity label, price and rating row, payment icons block, short text block); then 6-P7, the template configuration (needs the user's approval).

## Progress

### Execution (coordinator, 2026-10-16)

- `tailwind/tailwind.components.css`: new owner block "carousel pagination dots (every Swiper consumer)" at the end of the file (before the pre-existing empty `search-predictive-panel` header): `.swiper-pagination` sets `--swiper-pagination-color` and `--swiper-pagination-bullet-inactive-color` to `rgb(var(--color-foreground))` and `--swiper-pagination-bullet-inactive-opacity: 0.3`.
- Removed the local dot colour rules from `sections/featured-product.liquid` (three variables), `sections/featured-products.liquid` (bullet colour and opacity, active opacity) and `sections/icon-with-text.liquid` (bullet colour and opacity, active opacity; size and margin kept).
- **Control (user, 2026-10-16):** after weighing a scheme colour, a global setting and a toggle, the user chose to keep the dots fixed on the scheme foreground for now; a section that needs its own dot colour later overrides the three variables in its own stylesheet behind a section setting. No schema change in this batch.
- Measured (Chrome DevTools MCP, 1440): home `featured-product` active dot `rgb(38, 61, 41)` at opacity 1, inactive the same at 0.3; fixtures in each colour scheme: `scheme-1` dots take its foreground `rgb(213, 255, 131)`, schemes 2 to 4 take `rgb(38, 61, 41)`; no element anywhere computes `rgb(0, 122, 255)`. `featured-products` and `icon-with-text` have pagination switched off in the current settings, so they were covered by the fixtures.
- Validation: `scan:compat`, `lint:theme`, `lint:compat` (67) passed; `test:theme-check` 157 files, 0 offenses; `test:layout -- --page product --widths 390,1440` and `--page home --widths 390,1440` 0 new; prettier passed; `assets/tailwind.output.css` equals a fresh build.
- Filed for later (not this batch): the empty `search-predictive-panel` owner header at the end of `tailwind/tailwind.components.css` has no rules under it.

## Batch 6-P6: product page right column per the design (code)

**Status:** done; accepted by the user (2026-10-16) together with 6-P7.

**Outcome.** The product information column follows the design's right column (`docs/design/product/main-product/desktop.png`, local): grouped spacing, buy it now as an outlined button, price and rating on one row, bordered boxes for the callout, payment icons and social links, and three new blocks (payment icons, short text, social links). Block order and the rest of the template configuration stay for 6-P7.

**Shared scope (checked 2026-10-16):** the info column is `snippets/product-info-blocks.liquid`, used by `sections/product.liquid` and the home `sections/featured-product.liquid`; the home design notes say its right column is the product page design. Changes to shared blocks (spacing, buy buttons, price row) apply to both on purpose; callout, share and the new blocks exist only in the product section. The home carousel mode keeps its own `space-between` (section stylesheet).

**Decisions (user, 2026-10-15 and 2026-10-16):** right column per the design, mainly spacing and the bordered boxes; the design's row of icons is the store's social links, not share targets: a new social links block reuses `snippets/social-icons.liquid` (the theme settings' social links, as the announcement bar does); the share block stays as it is (no Reddit); the callout keeps its icon dropdown (user, 2026-10-16); payment icons come from the store's enabled payment types (Shopify Dev MCP: `shop.enabled_payment_types` with `payment_type_svg_tag`, set in the admin, not hard-coded); no "Quantity" label; the tax line and the inventory notice stay; gallery unchanged.

**Dependencies:**
- The user authorizes adding the three new blocks (short text, payment icons, social links) to the `main` section of `templates/product.json`, appended after the existing blocks, so they can be seen and verified. Block order and other settings are 6-P7.

**Project conventions the implementer must apply:**
- `1rem` = 10px; media queries still 16px. Spacing only through `var(--spacing-step-*)` or step utilities (no literal `clamp()` or rem spacing). Type tiers only on headings; colour roles, never `rgb()` around a full-colour token; boxes use the line role and `--radius-media`.
- Shopify names and parameters checked in Shopify Dev MCP (`payment_type_svg_tag`, `shop.enabled_payment_types`, share URL formats, schema setting types).
- Translated defaults as plain text; no HTML in non-`_html` keys.
- No code that exists only to satisfy a check; no new `lint-allow` without asking first.
- `assets/tailwind.output.css` compared with a fresh build when it changes (a running `watch:tw` keeps stale classes; ask the user to restart it).

**Implementation surface:**
- `snippets/product-info-blocks.liquid` and the buy buttons and price snippets it renders, only where the items below require. `snippets/social-icons.liquid` only if a parameter is needed for the round boxed style (its other consumers must not change).
- `sections/product.liquid`: schema for the three new blocks; stylesheet if needed.
- `tailwind/tailwind.components.css`: the `product-info-blocks` owner block and the buy buttons owner, only where the items below require.
- `locales/en.default.json`, `locales/en.default.schema.json`: new keys only.
- `templates/product.json`: the three new blocks appended (dependency).
- `assets/tailwind.output.css` (generated).
- `docs/agent/context.md` (Progress).
- Not in the surface: `sections/featured-product.liquid`, the gallery snippets, `config/`, other sections, `assets/*.js` (if a JS change seems needed, stop and report).

**Items (contract):**
1. **Spacing.** Two token steps in the info column: a larger step between groups and a tight step inside a group. Groups: title with the short text; price row; variant pickers; quantity, add to cart and buy it now; icon group; the boxes (callout, payment icons, share) stacked with a medium step. It must hold when the merchant reorders blocks (base gap = the group step; tight pairs by adjacency). Measure the gaps at 1440 against the design and record them.
2. **Buy it now outlined.** The unbranded dynamic checkout button renders as an outlined secondary button (ink border and text, transparent fill, a muted hover), full width under add to cart; branded wallet buttons keep Shopify's styling. Applies on both sections. Keyboard focus visible.
3. **Price row.** Price on the left, rating (stars and count) on the right of the same row when `show_rating` is on and the reviews metafields have data; nothing rendered without data; the divider below the row stays. Applies on both sections; check both with and without rating data (DOM fixture for the data case if the store has none).
4. **Bordered boxes.** Callout, payment icons and social links render as boxes: 1px line-role border, `--radius-media`, padding on space tokens. The callout's existing `show_border` setting keeps working (on = box).
5. **Social links block** (`social_links`, product section only): a heading text setting (default "Follow us", locale key) and the store's social links through `snippets/social-icons.liquid` (theme settings, the announcement bar's source), shown as round icon links in the box, each with an accessible name; nothing rendered when no link is set. The existing share block is unchanged.
6. **Payment icons block** (`payment_icons`, product section only): heading text setting (default "Secure online shopping", locale key) and the store's enabled payment types through `payment_type_svg_tag`; a list with accessible names; nothing rendered when the store has none.
7. **Short text block** (`text`, product section only): one richtext or inline richtext setting that accepts dynamic sources, rendered with a `copy-*` tier, placeholder hidden when blank.
- Mobile keeps the stacked layout; every item works at 390.

**Acceptance checks:**
1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`, `npm.cmd run scan:compat`: 0 errors (counts from output).
2. `npm.cmd run test:layout -- --page product --widths 390,768,1024,1440` and `--page home --widths 390,1440` with `npm.cmd run shopify:dev` running: 0 new issues; baseline not grown.
3. `npx prettier --check` on every changed text file.
4. Chrome DevTools MCP on a product with variants (`/products/casual-knitted-shirt3`) at 1440 and 390 (device emulation): gaps between groups and inside groups measured; buy it now computed border, background and label colour; price and rating on one row (with a rating fixture), nothing without data; boxes with border and radius; social links from the theme settings with accessible names (and the block absent with none set, by checking the source logic); payment icons rendered (or the block absent if the store has none, stated); short text rendered; no "Liquid error" or raw HTML.
5. Home `featured-product` at 1440 and 390: buy it now outlined, price row as above, carousel layout and spacing unchanged otherwise (before and after screenshots or measurements).
6. `assets/tailwind.output.css` equals a fresh build.
7. Screenshots of the product page right column and the home featured product at 390 and 1440, saved outside the repository for the user.

**Review tier:** Ask (Liquid, schema, shared snippets; runs from an external prompt). Coordinator review, then a separate review session; both must PASS. Then the user's look.

### Progress (6-P6)

**Before measurements (Chrome DevTools MCP, pre-edit):**
- Product form column 1440: uniform 15px flex gap between direct children; buy it now (unbranded dynamic checkout) solid primary fill `rgb(38,61,41)` / white text; price row flex, no rating data on store product; announcement bar had no `.social-icons` list (no theme social URLs configured).
- Product form column 390: uniform ~13px gaps; same buy it now styling.
- Home featured-product 1440 (carousel): 15px root gap, 24px visual spacing between children (space-between); buy it now solid primary.

**Gap tokens chosen (1440, after `npm.cmd run build:tw` + reload):**
- Group step: `var(--spacing-step-l)` → 20px computed column gap.
- Tight step: `var(--spacing-step-2xs)` → 5px visual gap via sibling `margin-top: calc(tight − group)` (example vendor→title: 5px, title `margin-top: -15px`).
- Box stack step: `var(--spacing-step-m)` between adjacent `.product-info-blocks__block--box` pairs.

**Buy it now / wallets:** Unbranded dynamic checkout in `.buy-buttons__actions--purchase-group` → transparent fill, 1px line-role border, foreground text, muted surface hover (snippet `{% stylesheet %}` override; global `tailwind.elements.css` unlayered `btn-primary` on payment buttons beat `@layer components` until then). Branded wallet buttons unchanged (Shopify). Featured placeholder uses `btn-secondary` when dynamic checkout enabled.

**Deviations:**
- Added snippets `product-info-payment-icons.liquid`, `product-info-social-links.liquid`, `product-info-short-text.liquid`, `product-info-inventory-notice.liquid` (Theme Check complexity 124→0; mirrors existing `product-info-share` extraction; not listed in surface).
- `templates/product.json`: set callout `show_border: true` so bordered callout is verifiable this batch.
- New blocks appended at end of `block_order` per plan (title+text adjacency deferred to 6-P7).
- Social links block not rendered on dev (no theme social URLs); payment icons render (6 SVGs from `shop.enabled_payment_types`).
- Rating row with data verified via DevTools DOM fixture only (store product has no reviews metafield).

**Validation (`npm.cmd`, counts from command output):**
1. `lint:theme`: passed; `test:theme-check`: 161 files, 0 offenses; `lint:i18n`: passed (+ unused keys passed); `lint:liquid-syntax`: passed; `lint:compat`: passed (67 embedded stylesheet blocks); `scan:compat`: passed (includes rebuild).
2. `test:layout -- --page product --widths 390,768,1024,1440`: 0 new; `test:layout -- --page home --widths 390,1440`: 0 new.
3. `npx prettier --check` on changed text files: passed (after `--write` on 3 files).
4. Chrome DevTools MCP: product `/products/casual-knitted-shirt3` 1440/390 — gaps, outlined buy it now, price row + fixture rating, callout/payment boxes, short text at column foot, no Liquid error; social box absent (no URLs).
5. Home featured 1440/390: outlined buy it now; carousel `space-between` unchanged.
6. `assets/tailwind.output.css` matches consecutive `build:tw` (`fc /b`: no differences).
7. Screenshots outside repo (before/after): `C:\Users\Joey\AppData\Local\Temp\6-p6-before-product-1440.png`, `6-p6-before-product-390.png`, `6-p6-before-home-featured-1440.png`, `6-p6-after-product-1440.png`, `6-p6-after-product-390.png`, `6-p6-after-home-featured-1440.png`, `6-p6-after-home-featured-390.png`.

**Risks / unverified:** Announcement-bar social icons not rendered on dev (no social URLs), so “unchanged” is by source logic only, not visual diff. Ask-tier independent review not run in this session.

#### Coordinator review, round 1 (2026-10-16): fixed by the coordinator

1. **P1 Wrong grouping.** The tight step (`--spacing-step-2xs`, 5px) was set between price and variant picker, variant picker and purchase, purchase and icon group, and inventory notice and price. In the design order (6-P7) those are group gaps (measured on the design at 1440 scale: 40 to 49px). Only vendor to title, title to short text and title to inventory notice stay tight.
2. **P2 Group step too small.** `--spacing-step-l` (20px) against the design's 40 to 49px between groups. Now `--spacing-step-2xl` (40px from 1280, fluid below); the box stack keeps `--spacing-step-m` (design about 17px). Home featured product (carousel, `space-between`) checked after the change: no overflow of the info column at 1440 x 1000 (gaps 44px), 1280 x 720 (40px) and 1024 x 700 (35px); the column is taller than the media at the two short viewports, as it was with 20px gaps (content height, not this change).
3. **P2 Stray build artifact.** `assets/tailwind.output.css.built` (untracked) would upload to the store through `shopify theme dev`; deleted.
4. Accepted deviations: the four extracted snippets (Theme Check complexity, the existing `product-info-share` pattern); `show_border: true` on the template's callout (6-P7 configuration, harmless now). To be verified by the review session: the extracted inventory notice behaves exactly as before (variant change included).
- Validation after the fixes: `lint:theme` passed; `test:theme-check` 161 files, 0 offenses; `test:layout` product and home 0 new; prettier passed; Tailwind output equals a fresh build.

#### Review 1 (separate session, 2026-10-16): FAIL on the record only; resolved

- The only finding (P3): the `review-animations` result was missing. The buy it now overrides remove the primary button's hover motion (`animation: none`, `transform: none`), which triggers the skill (`AGENTS.md`, Agent Skills). **review-animations (run by the review session, recorded by the coordinator):** before, the primary-button hover animation and transform; now, a static outlined checkout button with colour feedback on hover and a visible 2px focus outline; it removes unneeded movement and keeps the feedback. Verdict: approve, no motion defect.
- Everything else was proven: spacing in the design's order by a DOM reorder fixture (group 40px at 1440 and about 24px at 390; tight 5px and about 3px; boxes 15px and about 9px); the outlined button on both sections, with the unlayered overrides beating the unlayered primary rule and no `!important`; no overflow of the home info column at 1440 x 1000, 1280 x 720, 1024 x 700; the price and rating row with and without data; six payment icons with `role="img"` and titles; social links absent without URLs and the other consumers unchanged; the short text with dynamic sources; the extracted inventory notice identical to HEAD (variant change kept "Only 3 in stock"); no stray assets; Tailwind output equals a fresh build; lints and layout 0 new.
- Unproven: branded wallet buttons and configured social links with live data.

#### Review 2 (separate session, 2026-10-16): PASS

Record-only re-review: the motion verdict is recorded as reviewed; `git diff --stat` shows only `docs/agent/context.md` changed since Review 1.

## Batch 6-P7: product template configuration (coordinator, 2026-10-16)

**Status:** done; accepted by the user after the look rounds below (2026-10-16).

- `templates/product.json`, `main` section only (other sections and the section order unchanged, checked against HEAD): form order title, short text, inventory notice, price (`show_rating: true`), variant picker, quantity selector, buy buttons, icon group, callout, payment icons, social links; gallery column: description, then three collapsible tabs (Benefits, How to Use, Ingredients, closed); vendor, share and spacer blocks disabled (kept, not deleted); icon group items per the design (Clean Ingredients / leaf, Dermatologically Tested / flask, Sustainable Packaging / recycle, each with a second line); short text with the design's sample copy. Gallery settings unchanged (user: the gallery modes stay as they are).
- Measured at 1440 on `/products/casual-knitted-shirt3`: title to short text 5px; every other group 40px; callout to payment icons 15px.
- Validation: `test:theme-check` 161 files, 0 offenses; prettier passed.
- **Follow-ups (coordinator, against the design):** the Overview tab cannot show the product description (the collapsible's dynamic content is a page picker; needs a code option); the flask icon renders as another shape; payment icons render about 20px wide against about 36 x 24 boxed chips in the design; variant picker labels smaller than the design's uppercase labels.
- **Icon fixes (coordinator, 2026-10-16; defects left from 6-S12):** `icon-content-flask` was offered in the icon dropdowns of `sections/product.liquid` and `sections/featured-product.liquid` but the asset never existed (the slot rendered empty); `assets/icon-content-flask.svg` added from Phosphor `assets/regular/flask.svg`. `assets/icon-content-recycle.svg` was not the Phosphor glyph (a hand-made path that read as a small tree); replaced with Phosphor `assets/regular/recycle.svg`; it also serves the home `featured-product` (`templates/index.json`). Both through single-file svgo runs with `svgo.config.cjs` from sources downloaded to the session scratchpad and inspected (no scripts or links); `THIRD_PARTY_NOTICES.md` Phosphor entry updated (24 icons). `lint:theme` passed; the three icons render at 1440.
- **User look round 1 (2026-10-16), coordinator fixes:** payment icons were capped by `max-h-6` (15px on the 2.5px Tailwind unit); now Shopify's native 38 x 24 frame (`3.8rem` x `2.4rem`), `gap-step-s`; boxes pad on `--spacing-step-m` with `gap-step-s`. The bordered callout now matches the other boxes (transparent fill, foreground text, same padding), its icon aligns to the heading (`items-start`, `self-start`), its text one tier smaller (`copy-s`); the template callout gets a heading ("Good to know") so it reads as two lines like the design. Measured at 1440: payment icons 38 x 24, callout padding 15px, transparent fill. The editor preview showing the vendor and the old share row is a stale editor view: the local template keeps them disabled and the storefront does not render them. Open with the user: the short text block (template-wide copy, or bind a metafield, or disable) and whether the boxed row should be social links (current) or real sharing.
- Validation: `lint:theme`, `scan:compat` passed; `test:theme-check` 161 files, 0 offenses; `test:layout -- --page product --widths 390,1440` 0 new; prettier passed; Tailwind output equals a fresh build.
- **User look round 2 (2026-10-16):** the user's editor changes were not synced to the local file (`shopify theme dev` does not write editor saves back without `--theme-editor-sync`). Corrections, owned by the coordinator: the social links block was the coordinator's own idea from a misreading (not from Shopify's documentation; the user meant the existing share block, boxed and left-aligned); the short text block was the coordinator's proposal, not separately confirmed; disabling vendor, share and spacer was not asked for. Applied: `templates/product.json` main order exactly as the user's editor screenshot (vendor, title, short text, inventory notice, price, variant picker, quantity selector, buy buttons, icon group, callout, payment icons, social links, description, three collapsible tabs, share), nothing disabled, the spacer removed (absent from the user's list), share alignment left. `snippets/product-info-share.liquid`: the share block is a box like the others (heading "Share" on its own line, links in a left-aligned row by the alignment setting), icons rendered with `size: 'fill'`; `.product-info-blocks__share-link` 32px round with a line border, icons 16px. Measured at 1440: share box border 1px, padding 15px, 15px under the payment box; links 32 x 32, icons 16 x 16.
- **Open with the user:** remove the social links block (code and template) now that the share box covers the design.
- Validation: `lint:theme` passed; `test:theme-check` 161 files, 0 offenses; `lint:i18n` passed; `test:layout -- --page product --widths 390,1440` 0 new; prettier passed; Tailwind output equals a fresh build.
- **Social links block removed (user, 2026-10-16):** `snippets/product-info-social-links.liquid` deleted; the `social_links` block schema in `sections/product.liquid`, its `when` branch in `snippets/product-info-blocks.liquid`, its CSS rule, the locale keys it added (`products.product.social_links_heading`, `accessibility.social_link`, `sections.product.blocks.social_links`, `sections.product.defaults.social_links_heading`) and its template block removed; `snippets/social-icons.liquid` restored to HEAD (its two new parameters served only that block), so the announcement bar is untouched. No reference remains (grep). Validation: `lint:theme`, `lint:i18n` (unused passed), `lint:liquid-syntax` passed; `test:theme-check` 160 files, 0 offenses; prettier passed.
- **Short text block removed (user, 2026-10-16):** `snippets/product-info-short-text.liquid` deleted; the `text` block schema in `sections/product.liquid`, its `when` branch, its tight-spacing selector, the locale keys it added (`sections.product.blocks.text`, `sections.product.defaults.short_text`) and its template block removed; `sections.product.block_settings.text` stays (the home `featured-product` uses it). Template order now: vendor, title, inventory notice, price, variant picker, quantity selector, buy buttons, icon group, callout, payment icons, description, three collapsible tabs, share. The proposed harness rule on additions was withdrawn (user). Validation: `lint:theme`, `lint:i18n`, `lint:liquid-syntax` passed; `test:theme-check` 159 files, 0 offenses; `test:layout -- --page product --widths 390,1440` 0 new; prettier passed; Tailwind output equals a fresh build.
- **Decorations at mid widths (user, 2026-10-16: no extra breakpoints, adjust the botanical's size and position; the Overview code option is dropped):** `sections/mood-finder.liquid`: between 48rem and 80rem the layout is a grid with the header and the aside (botanical and caption) on one row, the botanical 8rem wide, aligned to the end; wheel and card below as before. `sections/feature-tabs.liquid`: with a decoration present the panel gets `feature-tabs__panel-inner--decorated`; the decoration is `min(22%, 8rem)` wide and the eyebrow, heading and body keep `padding-inline-end` of that width plus `--spacing-step-m` (replaces the heading's literal clamp). Measured with emulation at 768, 1024, 1100, 1280, 1440: feature-tabs decoration 80 x 159, 0 text boxes intersecting it; mood-finder botanical 80 x 171 beside the header and above the wheel from 768 to 1279 (110 x 235 in the left column from 1280); wheel 480px circle up to 1279 and 335 to 408px from 1280; no horizontal scroll. Validation: `lint:theme`, `lint:compat`, `lint:liquid-syntax` passed; `test:theme-check` 159 files, 0 offenses; `test:layout -- --page product --widths 390,768,1024,1280,1440` 0 new; prettier passed. `assets/tailwind.output.css` had been rewritten by the user's running `watch:tw` from a stale state (old share rules and the removed short-text selector); rebuilt with `npm.cmd run build:tw`, now byte-identical to a fresh build. The watcher must be restarted (or stopped) before the commit.
