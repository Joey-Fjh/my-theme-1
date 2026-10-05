# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-06.

## Batch 6-S12: `featured-product` redesign and the shared product purchase controls

**Status:** authorized (2026-10-06); R1 executed; R2 coordinator edits; user look accepted (detail goes to the Home polish pass); Ask review prompt delivered; not committed.

### Execution (implementer, 2026-10-06)

**Baseline (pre-change, `http://127.0.0.1:9292`, before edits):**

- **PDP gallery** (`/products/casual-knitted-shirt3`, thumbnails layout): root `#product-gallery-template--21686097739850__main`, classes `product-gallery h-full w-full min-w-0`; child tree uses `[data-gallery-thumbnails]` tablist + `[role=tabpanel]` zoom buttons (no `[data-gallery-swiper]`).
- **Cart quantity** (`/cart`, `data-qty-surface="cart"`): root `100.25×26.5938px`, borders `0`; button `25×25px`, `1px` border, `border-radius 2.5px`; input `border-bottom-width 1px`.

**Post-change comparisons:**

| Check                        | Before                                            | After     | Match |
| ---------------------------- | ------------------------------------------------- | --------- | ----- |
| PDP gallery                  | `hasThumbnails: true`, `hasCarouselSwiper: false` | same      | yes   |
| Cart qty root                | `100.25×26.5938`, border 0, gap `5px`             | identical | yes   |
| Cart qty button              | `25×25`, 1px border, radius `2.5px`               | identical | yes   |
| Cart qty input bottom border | `1px`                                             | `1px`     | yes   |

**Featured carousel (after sync, home `featured_product_pFb7bJ`):**

- **1440×900:** media column `getBoundingClientRect().x = 0`; pagination bullets `x = 10` (all equal), `y` strictly increasing (`5531…5648`, step 13px); pagination `display: flex`, `flex-direction: column`, `left: 10px`.
- **390×844 (devtools effective width 500):** bullets share `y`, `x` increasing (`167…247`) — horizontal row.
- **Product qty (featured):** `120×51.5938px` bordered box (`12rem` × `3.25rem` at theme root spacing); cart unchanged.
- **Benefits:** three items with title + description text on home.
- **Rating:** `0` star icons on featured product (no review metafields on `casual-knitted-shirt3`).

**Validators:**

- `npm.cmd run lint:theme` — pass (after removing `@apply` from variant-picker stylesheet).
- `npm.cmd run test:theme-check` — pass (151 files, 0 offenses).
- `npm.cmd run lint:i18n` — pass.
- `npm.cmd run lint:compat` — pass.
- `npm.cmd run lint:liquid-syntax` — pass.
- `npx prettier --check` on changed files — pass after `--write`.
- `npm.cmd run build:tw` — regenerated `assets/tailwind.output.css`.

**Changed files:** `sections/featured-product.liquid`, `sections/product.liquid` (schema), `snippets/product-gallery.liquid`, `snippets/product-gallery-carousel.liquid`, `snippets/product-variant-picker.liquid`, `snippets/product-info-blocks.liquid`, `snippets/buy-buttons.liquid`, `assets/product-gallery.js`, `tailwind/tailwind.components.css`, `assets/tailwind.output.css`, `assets/icon-content-recycle.svg`, `locales/en.default.json`, `locales/en.default.schema.json`, `templates/index.json`.

**Deviations / risks:**

- Vertical carousel pagination CSS lives in `tailwind/tailwind.components.css` (64rem+); initial `{% stylesheet %}` + Swiper `direction: 'vertical'` did not meet desktop/mobile split — corrected.
- Unbranded dynamic checkout outline is scoped under `.buy-buttons__actions--purchase-group`; global `tailwind.elements.css` still maps unbranded payment buttons to `btn-primary` outside that wrapper.
- `icon-content-flask` added to product icon schema options only; not used in `index.json` (recycle icon built via `build:svg`).
- Dev console still shows known local noise (GraphQL 400, customer-account menu, HotReload); no new theme JS errors tied to this batch verified.
- Variant picker keyboard/URL/quick-view and carousel dot-click/variant-slide interactions not re-automated end-to-end in this pass; structure preserves prior input/label/radiogroup pattern.
- Image fade gated on `body[data-motion-enabled='true']` + `prefers-reduced-motion: no-preference`; not browser-verified with `motion_enabled` off in this pass.

### Design

`docs/design/home/featured-product/` holds the following files. All are Git-ignored and local.

| File                              | Content                                                |
| --------------------------------- | ------------------------------------------------------ |
| `desktop.png` (1863 × 1155)       | Home `featured-product` on desktop                     |
| `mobile.png` (487 × 1285)         | Home `featured-product` on mobile                      |
| `reference-pdp.png` (1414 × 1103) | The product page design, which shares the right column |

**Desktop:**

- **Left, about 60%:** a single large product image filling the section from its left edge to the info column, top to bottom, with a vertical column of pagination dots at the far left, vertically centred.
- **Right column:** inside the page margin, top to bottom:
    - the product title (large, two lines);
    - a description of two lines;
    - a price row: the price large and bold on the left, five stars and "(124)" on the right, a thin divider below;
    - a small uppercase option label ("COLOR / SCENT") and rectangular option buttons (radius about 4px, 1px border, a dark border when selected), where colour values show a small round colour dot before the label;
    - "SIZE" with the same buttons, without dots;
    - "QUANTITY" with a bordered box (− 1 +), about 52px tall;
    - "ADD TO CART", a full-width solid dark button, uppercase;
    - "BUY IT NOW", a full-width outline button, uppercase;
    - three benefit items, each an icon, a title and a description line, centred, in a row.

**Mobile:** a rounded image card at the top; the same column below, full width; the option buttons wrap.

### Decisions (user, 2026-10-06)

- **Gallery.** The left gallery may change for `featured-product` only. The product page keeps its four layouts unchanged.
- **Shared controls.** The right-column purchase controls change for every product surface: product page, `featured-product`, quick view. The cart's quantity selector does **not** change.
- **Rating.** It reads Shopify's standard review metafields (`product.metafields.reviews.rating` and `reviews.rating_count`) and is hidden when they are absent.
- **Motion.** One optional touch: a soft fade on the main image when a variant change slides the gallery. Gated by `motion_enabled` and reduced motion.

### Shared-component map (coordinator, 2026-10-06)

| Component                                                             | Consumers                                                                                  | Change scope                                |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `snippets/product-gallery.liquid` → `product-gallery-carousel.liquid` | `product`, `featured-product`, quick view                                                  | New optional param only; defaults unchanged |
| `snippets/product-variant-picker.liquid`                              | `product-info-blocks` (product, `featured-product`), `product-purchase-stack` (quick view) | Button mode restyled for all                |
| `snippets/quantity-selector.liquid`                                   | `product-info-blocks`, `buy-buttons`, `sections/cart.liquid`                               | Restyle only `surface: 'product'`           |
| `snippets/product-info-blocks.liquid`                                 | `sections/product.liquid`, `sections/featured-product.liquid`                              | Price row, buttons and benefit items shared |

### Outcome

1. **Gallery (`featured-product` only).**
    - New `featured-product` setting `gallery_layout` (select: `thumbnails`, the current default, or `carousel`).
    - With `carousel`, render `product-gallery` `layout: 'carousel'` with a new optional param `pagination: 'vertical'`.
    - **Desktop (≥1024px), vertical pagination:** the Swiper dots stack vertically at the left edge, vertically centred, inside the image area. The image fills its column (`cover`) at the section's full height.
    - **Mobile:** horizontal dots below, or no visible dots if the swipe is the only control; keep the dots, as small horizontal dots, for accessibility. The image card has rounded corners.
    - **Width.** On desktop the media column is full-bleed to the left section edge; the info column keeps the page-width inset on the right (`padding-inline-end: max(var(--page-margin), calc((100% - var(--page-width)) / 2))`). Do not put `container-page` on a custom grid (6-S11 lesson).
    - Existing `thumb_position`, `desktop_media_width` and `thumbnail_size` keep working for `thumbnails`.
    - Callers that do not pass `pagination` render exactly as today.
2. **Variant picker, button mode (all product surfaces).**
    - Options render as rectangular buttons: radius about 0.25rem, a 1px border at low foreground opacity, a 1px dark foreground border when selected, padding about 0.75em 1.5em, and a body tier.
    - For an option with swatches (`value.swatch.color` or `.image`) and `swatch_shape` not `none`, the button shows a small dot (about 0.75em; circle or square per `swatch_shape`) before the value label. The label is always visible; today colour swatches render without labels.
    - Unavailable values keep their existing unavailable treatment.
    - Option names render as small uppercase labels.
    - Dropdown mode is unchanged.
    - Keyboard, `name`/`value` and the form association are unchanged: keep the existing input and label structure and only change the presentation.
3. **Quantity selector, `surface: 'product'` only.**
    - A single bordered box (1px, radius about 0.25rem) holding −, the value and +, about 3.25rem tall and about 12rem wide.
    - Buttons have no inner borders; the input is centred and borderless.
    - The `cart` surface is unchanged: verify `sections/cart.liquid` renders identically, by computed styles before and after.
4. **Buy buttons.**
    - Add to cart: full width, solid in the scheme's button colours, uppercase.
    - The dynamic checkout ("Buy it now") button: full-width outline, uppercase where Shopify's unbranded button allows it. Style only `.shopify-payment-button__button--unbranded`; branded wallet buttons stay untouched.
5. **Price row.**
    - The price takes a larger tier.
    - New price block setting `show_rating` (checkbox, default on), added to the price block schema in **both** `sections/featured-product.liquid` and `sections/product.liquid`.
    - When `show_rating` is on and `product.metafields.reviews.rating.value` exists, render `stars` at the right of the row with the count `(N)` from `reviews.rating_count`. Give the stars an accessible text through a locale key, for example "Rated 4.5 out of 5 from 124 reviews".
    - A thin divider closes the price row in both cases.
    - Absent metafields render no stars and no placeholder.
6. **Benefits.**
    - Add the existing `icon_with_text_group` block type to the `featured-product` schema, with the same settings as in `product.liquid`.
    - Add `item_1_text`, `item_2_text` and `item_3_text` (`inline_richtext`, description) to that block in **both** schemas, passed to `icon-with-text-item` as `text` (the 6-S10 param).
    - The items are centred: icon about 24px, title `body-sm`, text `body-xs`/`body-sm`.
7. **Image fade.** When a variant change makes the gallery slide to another image, the incoming main image fades in over about 300ms. CSS only where possible, with no change to the gallery's slide logic. Off with `motion_enabled` off or reduced motion.
8. **`templates/index.json`.** Only the `featured_product_pFb7bJ` entry changes:
    - `gallery_layout: "carousel"`;
    - add an `icon_with_text_group` block with the three design items, in this order:
        - leaf, "Clean Ingredients" / "Safe, natural & non-toxic.";
        - check, "Dermatologically Tested" / "Gentle on sensitive skin.";
        - a recycle-like icon, "Sustainable Packaging" / "Eco-friendly & recyclable.";
        - use existing icon options; adding Phosphor `flask` and `recycle` through `build:svg` is allowed, the same as 6-S10;
    - block order: title, description, price, variant picker, quantity, buy buttons, benefits.
    - The product stays `casual-knitted-shirt3`.

**Rules.** Tier classes only; scheme colour roles; no Tailwind functions in `{% stylesheet %}`; no inline SVG; locale keys for every string and label; no `sed -i` on theme files while `shopify theme dev` runs. Preserve every existing setting ID, block type and default.

### Implementation surface

- `sections/featured-product.liquid`
- `sections/product.liquid` (schema additions only: `show_rating`, the `item_N_text` settings)
- `snippets/product-gallery.liquid` and `snippets/product-gallery-carousel.liquid` (the `pagination` param)
- `snippets/product-variant-picker.liquid`
- `snippets/quantity-selector.liquid` (product surface styling)
- `snippets/product-info-blocks.liquid`
- `snippets/buy-buttons.liquid` (styling)
- `tailwind/tailwind.components.css` (only if the shared product rules live there)
- the matching JS files, only if the image fade or pagination needs them
- `locales/en.default.json` and `locales/en.default.schema.json` (new keys only)
- `templates/index.json` (the `featured_product_pFb7bJ` entry only)
- optional new Phosphor icons in `assets/` through `build:svg`
- `assets/tailwind.output.css` (generated)

### Review tier

**Ask.** Shared Liquid, schema and possibly JS change, across several surfaces.

### Acceptance checks

**Gates:**

- `npm.cmd run lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat` and `lint:liquid-syntax` pass.
- Prettier passes on the changed files.
- `shopify theme dev` syncs.

**Non-visual checks** (1440 × 900 and 390 × 844, numbers in the report):

1. **Product page unchanged where intended.** A product page using the thumbnails layout renders its gallery markup identically to before: compare the gallery DOM structure and classes. The right-column controls take the new styles.
2. **Cart unchanged.** In the cart, the quantity selector's computed border, size and button styles equal those before the change.
3. **Variant picker.**
    - Selecting a value by mouse and by keyboard (arrow keys and Space, as before) updates the selected state, the price and the URL (product page only).
    - The colour dot renders before the label for swatch options.
    - The labels stay visible.
    - The quick-view picker still works.
4. **Gallery (`featured-product` carousel).**
    - At 1440 the pagination is vertical at the left (bullets stacked: equal x, increasing y) and the media column reaches the section's left edge (x = 0).
    - At 390 the dots are horizontal below.
    - Swipe and dot clicks change the slide, and a variant change slides to the variant image.
5. **Rating.**
    - With no review metafields: no stars and no empty placeholder.
    - With metafields, verified by reading the Liquid path or with a store product that has them: stars plus count and an accessible text.
6. **Benefits.** Three items with titles and texts on home. The product page's existing `icon_with_text_group` blocks still render (their `text` is blank, so no body wrapper).
7. **Motion gates.** With `motion_enabled` off or reduced motion, no image fade runs.
8. **Console.** No console errors on home, a product page or the cart.

Visual detail (fonts, colours, exact sizes and spacing) is out of scope for review and goes to the Home polish pass.

### Round R2 (coordinator direct edit, user look on R1, 2026-10-06)

**User look:** "completely out of control". The media filled the full width, the info column fell below it, and the full product description ran on.

**Causes and fixes:**

- **Layout.** `sections/featured-product.liquid` used `@media (width >= theme(--breakpoint-pc))` inside `{% stylesheet %}`. Tailwind functions are not compiled there, so the browser dropped both media blocks and the grid stayed one column. Both queries are now `(min-width: 64rem)`. This is the 6-S6 failure again: it is a plan rule, and `lint:theme` does not catch it.
- **Bleed offset.** A negative `margin-inline-start` on the media panel pushed it 10px off-screen (the section is already `width: 'full'`), taking the dots with it. Removed; the dots now sit at x = 10.
- **Media height.**
    - The carousel no longer passes `aspect_ratio: '3/4'`.
    - The media column is `min(calc(100svh - 6rem), 96rem)` with the image chain at `height: 100%` and `object-fit: cover`.
    - The theme's root font size is 10px, so `56rem` was 560px; in media queries `rem` stays 16px.
- **Right column.**
    - The price tier is now `heading-h1` (was `heading-h4`) for the product and featured contexts.
    - Home's title block is `heading-xl`.
    - The block order on home is title, description, price, per the design.
    - The product quantity box is `16rem` × `4.4rem` (160 × 44px with the 10px rem).
- **Mobile.**
    - The carousel section is full width, so the mobile layout had no page margin. Below 64rem the layout pads `var(--page-margin)`.
    - In the featured context the description is now `strip_html | truncatewords: 26`; the dev product's description is thousands of words long.
- **Measured.**
    - **1440:** the media column is 840 × 840 at x = 0, the info column 560 wide from x = 865, and the section 904 tall.
    - **500** (the browser's minimum window width): media 465 × 465 at x = 10, info 709 tall, description 67 tall, no horizontal overflow.
- **Validators:** Prettier, `lint:theme`, `lint:compat`, `scan:compat`, `lint:liquid-syntax` and `test:theme-check` pass.
- **Open (polish):** on mobile the quantity sits beside add-to-cart, matching the product page design, while the home mobile design stacks them.
- **Follow-up (user look on R2).**
    - **Dots.** The Swiper dots were the default blue; they now use the scheme foreground (inactive at 0.3).
    - **Image fit.** `cover` cropped the product; the carousel image is now `contain`.
    - **Info column.** It was centred and shorter than the media column, which left empty bands. The layout now stretches, the info column and `.product-info-blocks--featured` take the full height with `justify-content: space-between`, and child top margins are reset.
    - **Measured at 1600 × 1000:** media and info are both 940 tall; the title is at the top (47) and the benefits end at 957.
    - **Validators:** Prettier, `lint:theme` and `lint:compat` pass.
- **Follow-up (user question: what happens when blocks are added to the shared right column).**
    - **Behaviour.** `productLayout` (from the product page) makes the shorter column sticky. The fixed height sat on the media column, which left the sticky media target no room, so it moved to `.featured-product__media-sticky`; the media column now stretches with the row.
    - **Normal content (1600 × 1000):** media and info are both 940 tall.
    - **With a temporary 1200px block injected into the info column** (1990 tall): the media target stays at `top: 10` while the info scrolls (the info top goes −68 → −368 → −768), then releases at the section end.
    - **Description scrolling.** The existing max-height scrolling stays; on home the 26-word truncation keeps it from triggering.
    - **Validators:** Prettier and `lint:theme` pass.

### Review R1 (verifier, 2026-10-06): FAIL, 1 finding, fixed by the coordinator

- **P2, the image fade never ran with motion enabled.** `snippets/product-gallery.liquid` gated the fade on `body[data-motion-enabled='true']`, but `layout/theme.liquid` emits the attribute only as `"false"` and omits it when motion is on.
    - **Fix:** both selectors are now `body:not([data-motion-enabled='false'])`.
    - **Measured:** variant clicks on home compute `animation-name: product-gallery-media-fade-in`.
    - **Validators:** Prettier, `lint:theme` and `lint:compat` pass.
- **Everything else proven by the verifier:**
    - scope, with the cart untouched;
    - the product page gallery, which takes the unchanged HEAD path;
    - home layout and dots, mobile, the sticky fixture;
    - variant ids on home, the product page and quick view;
    - cart computed styles equal HEAD;
    - benefits, the rating path, motion gates, the Tailwind-function check and the SVG checks.
- **Limit:** `scan:compat` was replaced by a build to temp plus a byte comparison, plus `lint:compat`.

### Re-check (verifier, 2026-10-06): PASS

- With motion on (attribute absent), a variant change computes `product-gallery-media-fade-in`; with `"false"` and with reduced motion it computes `none`.
- Only the two selectors changed since R1.
