# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-05.

## Batch 6-S4: home `featured-products` redesign and product card badges

**Status:** accepted by the user (step 8, 2026-10-05), including R11. Committed.

**Design:** `docs/design/home/featured-products/` holds `desktop.png` (about 1210 wide) and `mobile.png` (about 370 wide). Both images are Git-ignored. The design shows:

- **Tabs:** large tab headings with a superscript count, as today. The active tab is dark and the others are faded.
- **Cards:** a row of four white cards. Each card shows:
  - the brand in the meta row, with the image dots at the top right, as today;
  - one badge at the top right of the media area (BEST SELLER dark green, NEW tan, -20% orange, SOLD OUT grey; white uppercase text, small, slightly rounded);
  - the title and price on one row;
  - Quick View and Add to Cart on hover, as today.
- **Shop all:** a centred SHOP ALL link below the cards, uppercase, underlined, with a trailing arrow.
- **Nothing else:** no carousel arrows, no pagination and no brand watermark.
- **Mobile:** 2 cards per row.

**Decisions (user, 2026-10-05):**

- **No new motion.** Card image dots, hover actions and tabs keep today's behaviour.
- **Carousel:** 4 cards per view on desktop. The merchant chooses how many products to show (existing `max_items`, home value 8). Mobile shows a single-row carousel with 1 or 2 cards per view (existing `mobile_items`, home value `2`).
- **Badges:** the official Sale and Sold out logic, plus two custom badges driven by product tags. Badges live in the shared `product-card`, so collection, search results, recommendations and the header super menu get them too. This also closes a Theme Store gap: the collection page must show a Sale badge or the compare-at price, and the card shows neither today.
- **Brand watermark:** the setting stays (blank hides it). Its home value is cleared.
- **Shared carousel controls:** not extracted in this batch, because this design has no pagination. Extraction stays tied to the second real consumer, `testimonial-featured` (board). User note: the dots carry section-internal behaviour, not only styling, so the extraction should share behaviour and markup, not only a style class.

**Outcome:**

- **Badge snippet:** new `snippets/product-card-badge.liquid` with a `{% doc %}` header, rendered by `snippets/product-card.liquid` inside the media area, absolutely positioned at the top right. It shows at most **one** badge, in this order of priority:
  1. **Sold out:** `product.available == false`. Text: the existing `products.product.sold_out` key.
  2. **Sale:** `product.compare_at_price > product.price`.
     - If `product.price_varies` is false, show `-N%`, where N = round((compare_at_price − price) × 100 ÷ compare_at_price), through a new locale key with a `percent` variable.
     - If it is true, show a new "Sale" key.
  3. **Custom badge 1**, then **custom badge 2:** shown when `product.tags` contains the tag set in the theme setting (exact match; the setting's `info` text says so). The visible text is that setting's value.
- **Badge rules:**
  - No badge on placeholder cards.
  - Lite cards (header super menu) show the badge too.
  - The badge is a plain non-interactive `<span>` that screen readers read. It must not cover the image dots or the touch actions trigger.
- **Theme settings:** a new "Product badges" group in `config/settings_schema.json`:
  - `badge_sale_background`, `badge_sale_text`;
  - `badge_sold_out_background`, `badge_sold_out_text`;
  - `badge_custom_1_tag` (text, default "Best seller"), `badge_custom_1_background`, `badge_custom_1_text`;
  - `badge_custom_2_tag` (text, default "New"), `badge_custom_2_background`, `badge_custom_2_text`.
- **Badge colours:**
  - Read the defaults from the design: orange sale, grey sold out, dark green `#263d29` for custom 1, tan for custom 2.
  - Each default background and text pair must reach **4.5:1** contrast. Adjust the shade if needed and record the computed ratio.
  - The values reach CSS as custom properties set on the badge (`--badge-bg`, `--badge-fg`), not as inline colour declarations scattered in markup.
  - The existing per-scheme `badge_*` colours are left untouched. Record their consumers and leave the question of whether to retire them for the board.
- **`sections/featured-products.liquid`:**
  - Move the view-all link below the carousel, centred, rendered with `snippets/link.liquid` `variant: 'underline'` and a trailing `icon-arrow2`, in uppercase, as the `slides-show` CTA does.
  - Its text comes from a new `collections.shop_all` key ("Shop all"). `collections.view_all` stays if other code uses it.
  - Its `href` is the tab's collection URL. If the collection is blank (placeholder cards), use `routes.all_products_collection_url`.
  - If navigation or pagination are enabled, they stay in their own row above the link.
  - Match the design's card gap and card padding where the section owns them. Leave the shared card look (white surface, type) alone except for the badge; the card surface colour role is still open on the board.
  - Settings keep their IDs and types; no rename or removal.
- **Demo content** in `templates/index.json`, `featured_products_qR6LKN` settings only: `show_all: true` (turns the carousel on), `mobile_items: "2"`, `brand_name: ""`.
- **Locales:** new storefront keys in `locales/en.default.json`; schema labels, info and defaults in `locales/en.default.schema.json`.

**Implementation surface:**

- `snippets/product-card-badge.liquid` (new) and `snippets/product-card.liquid`
- `sections/featured-products.liquid`
- `config/settings_schema.json`: the new group only
- `locales/en.default.json` and `locales/en.default.schema.json`
- `templates/index.json`: the three settings above only
- `assets/tailwind.output.css`, generated by `npm.cmd run build:tw` only
- record files, `docs/design/home/featured-products/notes.md`, and `docs/design/home/featured-products/dev-*.png`

Out of scope:

- `assets/featured-products.js` and `assets/product-card.js` (if a change looks necessary, stop and report);
- the compare-at price display on the card;
- `config/settings_data.json`;
- colour scheme values;
- the shared carousel controls component;
- other sections.

**Review tier:** Ask (Liquid markup, schema, `settings_schema.json`).

**Rules for the executor:** never rename, alias or restructure code to get past a lint rule, and never change runtime behaviour to satisfy a test tool. If either blocks you, stop and report. Open board decisions may be cited but not decided. Write counts from command output, not by hand.

**Acceptance checks:**

1. **Static:**
   - `git diff --stat` and the untracked files stay inside the surface.
   - `git diff templates/index.json` shows exactly the three setting values.
   - `git diff config/settings_schema.json` adds only the new group.
   - Every new label, info, default and visible string is a locale key.
   - No setting ID or type in `featured-products` changed (compare the schema IDs before and after).
2. **Badge logic,** read from the Liquid:
   - the priority order;
   - one badge at most;
   - the `-N%` and "Sale" branches;
   - the rounding formula, with a worked example: compare-at 12500, price 10000 → `-20%`;
   - no badge on placeholders;
   - tag matching.
3. **Contrast:** a script computes the four default pairs. Report each ratio; all must be ≥ 4.5:1.
4. **Validators:** all pass:
   - `npm.cmd run lint:theme`
   - `npm.cmd run test:theme-check`
   - `npm.cmd run lint:i18n`
   - `npm.cmd run lint:liquid-syntax`
   - `npm.cmd run scan:compat`
   - `npx.cmd prettier --check` on every changed file
5. **Browser,** home page at 1440×900 and 390×844 (1rem = 10px). The home tab collections are blank on dev, so the cards are placeholders.
   - **Layout:**
     - 4 cards per view at 1440 and 2 at 390;
     - no watermark;
     - Shop all is centred below the cards, uppercase, underlined, with an arrow, and links to `/collections/all`;
     - the tabs still switch panels, and each panel's carousel works after a switch.
   - **Keyboard:** Tab through the active panel. Each of the 8 cards' links scrolls into view when focused (Swiper a11y). Report the slide index for cards 5–8.
   - **Badges on real products:** use the collection page, or search, with the dev store's products.
     - Report one sold-out product and one on-sale product if the store has them, each with its badge text and computed colours.
     - For custom badges: if no dev product carries the tags, mark the row "Blocked for data" (do not edit store data). Prove the branch statically.
     - The badge must not overlap the image dots: compare the bounding boxes.
   - **Console:** no new console errors.
   - **Screenshots:** `dev-desktop.png` and `dev-mobile.png` in the design folder, plus `dev-collection-badges.png` if any badge rendered. The two main screenshots have different md5 hashes.

**Progress:**

### 2026-10-05 implementer

**Changed files:** `snippets/product-card-badge.liquid` (new), `snippets/product-card.liquid`, `sections/featured-products.liquid`, `config/settings_schema.json` (Product badges group only), `locales/en.default.json`, `locales/en.default.schema.json`, `templates/index.json` (three settings), `tailwind/tailwind.components.css`, `assets/tailwind.output.css`, `docs/design/home/featured-products/notes.md`, `docs/design/home/featured-products/dev-desktop.png`, `dev-mobile.png`, `dev-collection-badges.png`.

**Deviations:**

- Removed unused `collections.view_all` after `lint:i18n` unused-key failure (no theme references remained after Shop all migration).
- Default sale background `#C2410C` and custom 2 `#8B5A3C` (not mockup `#EA580C` / tan) to meet 4.5:1 contrast.
- Custom badge label uses the **tag setting value** (`badge_custom_*_tag`); `badge_custom_*_text` settings are foreground colours (same naming pattern as sale/sold out).

**Contrast (script output):** sale 5.18:1, sold out 4.76:1, custom 1 11.78:1, custom 2 5.79:1 (all ≥ 4.5:1).

**Validators:**

- `npm.cmd run lint:theme` — Theme architecture lint passed.
- `npm.cmd run test:theme-check` — 149 files inspected with no offenses found.
- `npm.cmd run lint:i18n` — i18n lint passed; unused locale key lint passed (after removing `collections.view_all`).
- `npm.cmd run lint:liquid-syntax` — Liquid syntax lint passed.
- `npm.cmd run scan:compat` — passed (includes `build:tw`, stylelint, eslint, embedded compat).
- `npx.cmd prettier --check` on changed surface files — All matched files use Prettier code style!

**Static:**

- `git diff templates/index.json` — only `mobile_items` `"2"`, `show_all` true, `brand_name` `""`.
- `git diff config/settings_schema.json` — adds `t:config.product_badges.name` group only (83 lines).
- `featured-products` schema IDs/types unchanged (layout/shop-all markup only).

**Browser (Chrome DevTools MCP + Playwright screenshots, dev store):**

- Desktop (1440×900): 4 slides in grid (~345px wide each, grid ~1405px); Shop all centred (`centerDelta` 0), `href` `/collections/all`, uppercase + arrow; no watermark; tabs switch with swiper on each panel.
- Mobile: Chrome minimum width 500px at 390 request; 2 slides visible (`visibleSlideCountInGrid` 2, slide width ~231px). Accept `mobile_items` `"2"` behaviour at narrow width.
- Root font size 12px on dev (acceptance note 1rem = 10px not met on this store).
- **Keyboard:** placeholder home cards have no product links (`productLinkCount` 0); only Shop all is focusable in panel — Swiper slide focus for cards 5–8 **not exercisable** on placeholder data.
- **Badges:** `/collections/all` — sold out on “Casual Knitted Shirt - White” (`Sold out`, `rgb(100, 116, 139)` / white); on sale “Casual Knitted Shirt3” (`-30%`, `rgb(194, 65, 12)` / white). Custom tags **Blocked for data** (no matching tags on dev products; branch in `product-card-badge.liquid`).
- **Dots overlap:** badges in media, dots in meta row; dev collection products had no multi-image cards (0 pagination dots) — no bbox overlap test on dots.
- **Console:** Shopify/platform CORS, CSP, HotReload, account menu messages only; no new theme JS errors tied to this batch.
- **Screenshots:** `dev-desktop.png` md5 `fa5b2329ffc040f0c8f7205dde0de76e`, `dev-mobile.png` md5 `e3a871a1f73531e4fd747dbcff9e6ea6` (hashes differ); `dev-collection-badges.png` captured.

### Fixes round 1 (2026-10-05 implementer)

**R1:** Moved `.product-card-shell__badge` into `{% stylesheet %}` on `snippets/product-card-badge.liquid`; reverted the batch hunk from `tailwind/tailwind.components.css` (`git diff tailwind/tailwind.components.css` empty); `npm.cmd run build:tw`.

**R2:** Sale percent uses `assign badge_compare_at_float = product.compare_at_price | times: 1.0` before `divided_by`. Liquid trace: 12500/10000 → **-20%**; 12500/9900 → **-21%**; 3000/1999 → **-33%**. Rendered: “Casual Knitted Shirt3” badge **-30%** on `/collections/all`.

**R3:** Shop all uses `variant: 'default'` plus `link-with-icon-motion`. Resting `::after` **transform: none** (computed on dev home).

**R4:** Badge markup uses **`body-xs`** tier (computed **12px** at 1440×900, **8.75px** at Chrome min width ~500×844); no literal font-size in CSS.

**R5:** `notes.md` corrected for Shirt3 (8 images, numeric nav). Bounding boxes (no overlap): 1440×900 badge `(646,230,42×17)` vs nav `(626,190,70×25)`; ~500×844 badge `(426,310,34×14)` vs nav `(398,272,69×22)`.

**R6:** Temporarily set `collection_azNTRE` → `"all"`, focused title links for cards 5–8 on home (1440×900): slide indices **4, 5, 6, 7** (titles Shirt2–Shirt5). Reverted block collection to `""`; `git diff templates/index.json` shows only `mobile_items`, `show_all`, `brand_name`.

**Validators (command output):**

- `lint:theme` — Theme architecture lint passed.
- `test:theme-check` — 149 files inspected with no offenses found.
- `lint:i18n` — passed; unused locale key lint passed.
- `lint:liquid-syntax` — Liquid syntax lint passed.
- `scan:compat` — passed (58 stylesheet blocks in embedded compat lint).
- `npx.cmd prettier --check` on round-1 touched files — All matched files use Prettier code style!

**`git diff --stat` (2026-10-05 post-fix):** 8 files changed, 317 insertions(+), 30 deletions(-) — `config/settings_schema.json`, `docs/agent/board.md`, `docs/agent/context.md`, `locales/en.default.json`, `locales/en.default.schema.json`, `sections/featured-products.liquid`, `snippets/product-card.liquid`, `templates/index.json`; plus untracked `snippets/product-card-badge.liquid`, `docs/design/home/featured-products/*`, `assets/tailwind.output.css` from batch.

### Independent review round 1 (2026-10-05): FAIL; coordinator confirmed R1–R5 statically

- **R1 (scope):** the badge rule was added to `tailwind/tailwind.components.css`, outside the surface. The surface omission was the coordinator's. Under the style ownership rule the badge is a single-owner rule, so it belongs to its owner. Fix: move the rule into a `{% stylesheet %}` block in `snippets/product-card-badge.liquid`, revert the `tailwind.components.css` change, and rebuild `assets/tailwind.output.css`.
- **R2 (rounding):** `divided_by` with an integer divisor floors, so compare-at 12500 and price 9900 give `-20%` instead of `-21%`. Fix: divide by a float, assigning `product.compare_at_price | times: 1.0` first, then `round`. Worked examples to report: 12500/10000 → `-20%`; 12500/9900 → `-21%`; 3000/1999 → `-33%`.
- **R3 (Shop all underline):** `variant: 'underline'` shows the line only on hover or focus, but the design shows it at rest. Fix: `variant: 'default'` (`links-default`, resting line). The `slides-show` CTA uses the same hover-only variant; that is out of scope here and recorded on the board.
- **R4 (typography):** `text-[1rem]` bypasses the typography settings chain. Fix: use a body tier class (`body-xs`), adding no literal font size.
- **R5 (evidence):** `notes.md` says the dev collection cards had single images. "Casual Knitted Shirt3" has eight images and numeric navigation. Fix: correct the note, and measure the badge against the image navigation boxes at both widths.
- **R6 (keyboard proof, authorized temporary data):** set one home tab block's `collection` to a dev collection with at least 8 products, Tab through cards 5–8 at 1440, and report the slide indices. Then revert `templates/index.json` to the three authorized values and show `git diff templates/index.json`.
- **Plan correction:** the "1rem = 10px" note does not hold on dev (the root is 12px). It is dropped and is not a defect.

Still Blocked for data, accepted: custom tag badges (static proof), badges in recommendations, header lite mode in the browser.

### Independent review round 2 (2026-10-05): FAIL; R1, R2, R4 and R5 proven fixed

- **R7 (R3 not visibly fixed):** the shared `.tab-content-default` (`tailwind/tailwind.components.css`, `overflow-hidden`) clips the Shop all line. The link ends exactly at the panel's bottom edge, and the `::after` line sits 2px below it. The keyboard focus ring there is clipped too. Fix, inside `sections/featured-products.liquid` only (the shared tab rule stays): give `.featured-products__shop-all` enough block-end padding to hold the 2px line and the focus ring (`--focus-ring-width` plus `--focus-ring-offset`). Verify with bounding boxes at both widths: the line's bottom and the focused link's outline bottom must be ≤ the panel's bottom. Take a screenshot of the resting line and one of the focus ring.
- **R8 (R6 evidence):** calling `.focus()` directly is not Tab traversal. Repeat with the same authorized temporary collection (`collection_azNTRE` → `all`) at 1440×900: start focus on the active tab, then send real Tab key presses (MCP `press_key`). For each stop, record `document.activeElement` (text and href), its slide index, and whether its slide rect lies inside the Swiper viewport rect. Cards 5–8 must be reached in order and be fully visible when focused. Revert the template afterwards.

### Fixes round 2 (2026-10-05 implementer)

**R7:** Added `.featured-products__shop-all { padding-block-end: calc(2px + var(--focus-ring-width) + var(--focus-ring-offset)); }` in `sections/featured-products.liquid` `{% stylesheet %}`. Bounding-box bottoms (line = link bottom + 2px; outline = link bottom + offset + width):

| Viewport | Panel bottom | ::after line bottom | Focus outline bottom |
| --- | ---: | ---: | ---: |
| 1440×900 | 756 | 752 | 754 |
| 390×844 | 625 | 621 | 623 |

All line and outline bottoms ≤ panel bottom. Screenshots: `docs/design/home/featured-products/dev-shop-all-rest.png`, `dev-shop-all-focus.png` (New Arrivals panel).

**R8:** Temporarily set `collection_azNTRE` → `"all"`. At 1440×900, focused **New Arrivals** tab (`role="tab"`, `aria-selected="true"`), then sequential **MCP `press_key` Tab** (document keydown listener). Tab stops from that tab through card 8 product title:

| # | activeElement text | href | Slide index | Slide in Swiper viewport |
| --- | --- | --- | ---: | --- |
| 0 | New Arrivals (0) | — | — | — |
| 1 | *(empty)* | `/products/black-leather-bag` | 0 | yes |
| 2 | Black Leather Bag | `/products/black-leather-bag` | 0 | yes |
| 3 | Quick View | — | 0 | yes |
| 4 | Add to Cart Sold out Adding... | — | 0 | yes |
| 5 | *(empty)* | `/products/blue-silk-tuxedo` | 1 | yes |
| 6 | Blue Silk Tuxedo | `/products/blue-silk-tuxedo` | 1 | yes |
| 7 | Quick View | — | 1 | yes |
| 8 | Add to Cart Sold out Adding... | — | 1 | yes |
| 9 | *(empty)* | `/products/casual-knitted-shirt` | 2 | yes |
| 10 | Casual Knitted Shirt - White | `/products/casual-knitted-shirt` | 2 | yes |
| 11 | Quick View | — | 2 | yes |
| 12 | *(empty)* | `/products/casual-knitted-shirt1` | 3 | yes |
| 13 | Casual Knitted Shirt1 | `/products/casual-knitted-shirt1` | 3 | yes |
| 14 | Quick View | — | 3 | yes |
| 15 | *(empty)* | `/products/casual-knitted-shirt2` | 4 | yes |
| 16 | Casual Knitted Shirt2 | `/products/casual-knitted-shirt2` | 4 | yes |
| 17 | Quick View | — | 4 | yes |
| 18 | *(empty)* | `/products/casual-knitted-shirt3` | 5 | yes |
| 19 | *(empty)* | — | 5 | yes |
| 20 | *(empty)* | `/products/casual-knitted-shirt3` | 5 | yes |
| 21 | Casual Knitted Shirt3 | `/products/casual-knitted-shirt3` | 5 | yes |
| 22 | Quick View | — | 5 | yes |
| 23 | Add to Cart Sold out Adding... | — | 5 | yes |
| 24 | *(empty)* | `/products/casual-knitted-shirt4` | 6 | yes |
| 25 | Casual Knitted Shirt4 | `/products/casual-knitted-shirt4` | 6 | yes |
| 26 | Quick View | — | 6 | yes |
| 27 | *(empty)* | `/products/casual-knitted-shirt5` | 7 | yes |
| 28 | **Casual Knitted Shirt5** | `/products/casual-knitted-shirt5` | **7** | **yes** |

Row 0 = focus before first Tab. Rows 1–28 = each MCP Tab stop (deduped by listener). Cards 5–8 title rows: 16, 21, 25, 28. Reverted `collection` to `""`; `git diff templates/index.json` shows only `mobile_items`, `show_all`, `brand_name`.

**Validators:** `lint:theme` passed; `test:theme-check` 149 files, 0 offenses; `lint:i18n` passed; `lint:liquid-syntax` passed; `scan:compat` passed; `npx.cmd prettier --check sections/featured-products.liquid` passed.

**`git diff --stat`:** 8 files changed, 349 insertions(+), 28 deletions(-) (batch cumulative; this round touched `sections/featured-products.liquid`, `docs/agent/context.md`, `docs/design/home/featured-products/dev-shop-all-*.png`).

### Independent review round 3 (2026-10-05): PASS. Coordinator static check: code accepted, evidence R9 open

- **Code:** the coordinator re-read the final diff. Badge priority, float rounding, the badge `{% stylesheet %}` owner with `body-xs`, Shop all with `default` and block-end padding, and the three `templates/index.json` values are confirmed. No code defect.
- **R9 (evidence only, no code change):** the screenshots do not show what they claim, and neither the implementer nor the verifier caught it.
  - `dev-desktop.png` and `dev-mobile.png` show the hero slideshow under the newsletter popup, not `featured-products`.
  - The popup also covers `dev-collection-badges.png`, and no badge is visible in it.
  - `dev-shop-all-rest.png` is a 39px strip half covered by the popup.

  Fix:
  1. Close the newsletter popup (its close button) and record that it was closed.
  2. Scroll so the section heading clears the sticky header, then retake `dev-desktop.png` (1440×900) and `dev-mobile.png` (390×844). Each must show the tabs, the cards and Shop all.
  3. Retake `dev-collection-badges.png` on `/collections/all` with at least one SOLD OUT and the `-30%` badge visible.
  4. Retake `dev-shop-all-rest.png` and `dev-shop-all-focus.png` as section crops that show the whole link.
  5. Delete `dev-shop-all-focus.png` only if it cannot be retaken, and say why.
  6. View each image before recording it.

### Evidence retake (R9)

**Procedure:** Local storefront `http://127.0.0.1:9292`. On each navigation, the newsletter popup was dismissed with the **Close newsletter popup** button (`closedNewsletter: true`). Images were opened and checked before recording.

| File | Viewport | Scroll position | What it shows | MD5 |
| --- | --- | --- | --- | --- |
| `docs/design/home/featured-products/dev-desktop.png` | 1440×900 | `window.scrollY` **1520** (`featured-products` `sectionTop` **161**, tabs clear of sticky header) | Home **featured-products**: collection tab strip, Add On / **New Arrivals** / Best Sellers headings, placeholder product row, centred **Shop all →**; no popup overlay | `ccb7826c7a28c301df64e7567bdd2811` *(R10 post-cascade retake; was `745cf037…`)* |
| `docs/design/home/featured-products/dev-mobile.png` | 390×844 | `window.scrollY` **1139** (`sectionTop` **112**) | Same section on mobile: tabs, **New Arrivals**, 2-up placeholder cards, **Shop all →**; no popup | `13ab2197dafa9167a1f470d02b8b035f` *(R10 post-cascade retake; was `fec092d2…`)* |
| `docs/design/home/featured-products/dev-collection-badges.png` | 1440×900 | `window.scrollY` **1047** (grid scrolled so **Casual Knitted Shirt3** row is in view) | `/collections/all` grid: **Sold out** on Shirt2 (and Shirt4); **-30%** on Casual Knitted Shirt3; badges fully visible, no popup | `50b3f145c56da8b1e6c1e20faffbc468` |
| `docs/design/home/featured-products/dev-shop-all-rest.png` | 1440×900 (element crop of `.featured-products__shop-all`) | Page `scrollY` **1520** before crop (`sectionTop` **161**) | New Arrivals panel **Shop all →** at rest: full link text, underline, arrow; not clipped | `b03878f43acb86f8ebc4753ec60a9609` |
| `docs/design/home/featured-products/dev-shop-all-focus.png` | 1440×900 (same element crop) | Same page scroll as rest crop | Same link with keyboard focus ring around the full control | `bbf4ec786f7a28ccc0f48329cb95f3a4` |

### R10 — featured-products carousel title clip (coordinator)

**Diagnosis (no code edit first):** Storefront `http://127.0.0.1:9292`, newsletter closed each run. Section root `.featured-products-section` carries **`data-motion-section`** (not `data-motion-state`; that attribute is on each `[data-motion-bound]` slide). After scroll into view, visible slides reach **`data-motion-state="revealed"`** with `transform: none` / identity matrix; off-screen slides (indices 4–7) can stay **`pending`** and are not in the carousel viewport.

**Clip ancestor:** `.featured-products-section .swiper` — computed **`overflow: hidden`** (from `sections/featured-products.liquid` `{% stylesheet %}`). Swiper height is fixed (~**417px** desktop, ~**263px** mobile) from the tallest in-view slide at init; tab panel bottom sits below the swiper (room for Shop all).

**Measurements** (active tab panel, `.product-card-shell__price` bottom vs `.swiper` bottom):

| Viewport | Timing after scroll | Visible slides | Price row vs swiper | Cascade offset clipped? |
| --- | --- | --- | --- | --- |
| 1440×900 | ~**300ms** (R9-like) | 4 | slide tops **373 / 385 / 399 / 399**; price bottoms **775 / 785 / 796 / 796** vs swiper **746** — **clipped** (+29 to +50px) | **Yes** — `translateY` up to **64px** on `[data-motion-bound]` while swiper box stays fixed |
| 1440×900 | **≥1500ms** (cascade settled) | 4 | slide tops **329** aligned; price **738** vs swiper **746** — **not clipped** | N/A at rest |
| 390×844 | ~**300ms** | 2 | price **491 / 497** vs swiper **488** — **clipped** (+3 / +10px) | **Yes** |
| 390×844 | **≥1500ms** | 2 | price **467** vs swiper **488** — **not clipped** | N/A at rest |

**Conclusion:** Title/price clipping in R9 **`dev-desktop.png` / `dev-mobile.png`** was **not a rest-state layout bug**; it was **mid-cascade** capture (~400ms after scroll) plus **overflow:hidden** on the swiper trimming the animated `translateY`/`scale` entrance. At rest, visible cards are not clipped by the swiper.

**Code change:** **None** (clip does not persist at rest; fixing cascade-vs-swiper would need motion or JS policy outside the allowed “rest layout only” fix).

**Coordinator decision requested:** During entrance, cascade rise (**64px** desktop / **40px** mobile per `--motion-reveal-rise-distance`) is **visually clipped** by the swiper overflow — a **motion + carousel interaction defect** if entrance must show full card bodies.

**Evidence retake (R10):** Wait until visible `[data-motion-bound]` slides are transform-settled (and price row ≤ swiper bottom), popup closed, then full-page shots. Each PNG opened and checked.

| File | Viewport | Scroll | Motion at capture | Shows | MD5 |
| --- | --- | --- | --- | --- | --- |
| `dev-desktop.png` | 1440×900 | `scrollY` **1520** | Slides **0–3** `revealed`, tops **329**; section `data-motion-state` **null** | Tabs, **four** aligned placeholder cards with full title/price rows, **Shop all →** | `ccb7826c7a28c301df64e7567bdd2811` |
| `dev-mobile.png` | 390×844 | `scrollY` **1139** | Slides **0–1** settled (`data-motion-state` **null** after completion), tops **225** | Tabs, **two** cards, full title/price, **Shop all →** | `13ab2197dafa9167a1f470d02b8b035f` |

**Validators:** not run (no Liquid/CSS/JS change in batch surface).

### User look (step 8, 2026-10-05): R11 open

- **R11 (badge padding and radius):** the badge is too tight and too square against the design.
  - Reference: `docs/design/home/featured-products/badge.png`, a design crop of BEST SELLER (local, Git-ignored).
  - Proportions read from it, relative to the badge font size: padding about 0.45em block and 0.8em inline; corner radius about 0.25em, a gentle rounding, not a pill.
  - Today: `padding: 0.25rem 0.5rem` and `border-radius: 0.125rem`.
  - Fix: in the `{% stylesheet %}` of `snippets/product-card-badge.liquid` only, set the padding and radius in `em` so they follow the `body-xs` tier.
  - Verify: computed padding and radius at 1440×900 and 390×844 on `/collections/all`; the badge still clears the image navigation (bounding boxes); a crop screenshot `dev-badge.png` next to `badge.png`.
  - Tier: Show (CSS in a `{% stylesheet %}` block): validators plus the user's look.
- After acceptance and the commit, the design folder's images are deleted (workflow), keeping `notes.md`.

### R11 — badge padding and radius (user look step 8)

**Change (`snippets/product-card-badge.liquid` `{% stylesheet %}` only):** `padding: 0.45em 0.8em;` and `border-radius: 0.25em;` (replacing `0.25rem 0.5rem` / `0.125rem`). Markup, settings, and colours unchanged.

**Computed on `/collections/all`** (newsletter closed; **Casual Knitted Shirt2** Sold out + **Shirt3** `-30%`; Playwright viewports):

| Viewport | `body-xs` font-size | Padding (computed) | Border radius (computed) | Badge vs image nav |
| --- | --- | --- | --- | --- |
| **1440×900** | 12px | 5.4px × 9.6px (0.45em × 0.8em) | 3px (0.25em) | **Sold out:** no pagination on card. **-30%:** badge box (637–689, 91–114) below nav box (625–696, 52–77); **no overlap** |
| **390×844** | 8.75px | 3.9375px × 7px | 2.1875px | **Sold out:** no nav. **-30%:** badge (309–347, 112–128) below nav (286–354, 75–97); **no overlap** |

**Screenshot:** `docs/design/home/featured-products/dev-badge.png` — crop of Shirt2 **Sold out** and Shirt3 **-30%** (viewed before record). MD5: `b3f9066cbede412876fe2aeb1934bf36`.

**Validators:** `lint:theme` pass; `test:theme-check` 149 files, 0 offenses; `scan:compat` pass (includes `build:tw`); `npx.cmd prettier --check snippets/product-card-badge.liquid` pass.
