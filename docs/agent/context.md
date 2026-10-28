# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-28.

## Plan LS2-A: containers sized by content, and layout shifts

**Outcome.** No container keeps a fixed height that leaves a large empty band under short content, narrow product cards keep their image visible under the hover actions, and the product page and the home `ritual-steps` section stop shifting on load.

**Decided (user, 2026-10-27 and 2026-10-28).** Board topic LS2 (option B, plan `git show 8cb6fe7:docs/agent/context.md`) and the fixed roadmap in `docs/project.md`. The roadmap's LS2 runs as two batches: this one (containers and shifts), then LS2-B (the home and product design items of backlog groups 4 and 5, screenshot-led). No user picks are left open: the scope below is fixed. Stage 0 added (user, 2026-10-28): the live research left open in `8cb6fe7` (home single-product features and full-screen narrative sections) and the unresolved product page shift cause are investigated before any code.

**Evidence.**

- Quick view (`snippets/product-card.liquid`): wrapper insets `tablet:px-[8vw] tablet:py-[5vh]` and panel `tablet:h-full tablet:!max-h-full`, so about 1210×810 at 1440×900 whatever the content. References at 1440×900: Dawn content width 70% with `max-height` and `overflow-y: auto`; Horizon `min(54rem, …)` × `min(38.5rem, 96vh)`; Princess Polly about 871×564, centred and sized by content.
- Home `featured-product` carousel under `adapt` (1440×900): frame fixed at 810 (the cap); slide 9 (811×400) sits at the top with about 410px empty below; the stage height `min(calc(var(--screen-height) - 6rem), 96rem)` in `sections/featured-product.liquid`. Horizon takes the gallery ratio from the featured media.
- Fixed-height inventory (static scan, 2026-10-27): `promo-bannder` panel `max(40rem, var(--screen-height))`; `article` hero `55svh`; `newsletter-overlay` media `tablet:h-full`; `promise-section` media `tablet:h-full`; `search` `min-h-[50svh]` (empty state).
- `ritual-steps` scroll carousel: text group 212/230px empty above and below at 1440×900, 309/331px at 1580×1130; the panel gap is `clamp(var(--spacing-step-3xl), 14svh, …)`; the pinned stage is one screen by design. Reload at y=1500 at 390: a 0.1339 shift from the section frame (G7 review 2).
- Product card hover actions (search, 1440, four columns, card about 275px): Quick View and Add to Cart at `body-2xl` (`--type-step-2`, viewport-fluid, at its 1280px maximum) cover most of the image (`tailwind/tailwind.components.css` `.product-card__hover-actions`).
- Product page cold load (cache bypassed, G7 review 2): 0.0826 at 1440 and 0.4155 at 390 from the product information, gallery, thumbnail navigation and variant picker; the coordinator measured 0.0125 at 1440 (icon group, buy-buttons label, thumbnail nav) on a warm load. Likely the `adapt` gallery height settling after hydration (LS1).

**Implementation surface and method.**

0. **Stage 0, investigation (no code):**
    - Live research with Chrome DevTools MCP, 4 to 6 mainstream DTC stores at 1440×900: the home single-product feature (frame size, media ratio and fit, empty runs above and below) and full-screen narrative or pinned sections (stage height, content extent, empty space on a tall screen, 1440×900 and 1920×1080). One row per store and pattern under Results.
    - Product page shift: three cold loads (cache bypassed) and three warm loads at 390×844 and 1440×900 on `shopify theme dev`, with the shifting elements and the cause named under Results. G7 recorded 0.0826 / 0.4155 cold; the coordinator recorded 0.0125 / 0 warm.
    - Stop: report the findings; when they change the method of items 2, 4 or 6, agree the change with the user before Stage 1.

**Stage 1 (code), items 1 to 6:**

1. **Quick view:** `snippets/product-card.liquid` (dialog wrapper and panel classes), `snippets/product-quick-view.liquid`, the `product-quick-view` rules in `tailwind/tailwind.components.css`. A centred dialog `min(56rem, 100vw - gutters)` wide, height from content, capped at `90svh` with internal scroll in the info column; the gallery column takes the media's own ratio (`adapt`) within the cap. Mobile (below 48rem) keeps its current sheet unless it shows the same empty band.
2. **`featured-product` carousel under `adapt`:** `sections/featured-product.liquid`, `snippets/product-gallery-carousel.liquid`, `snippets/product-gallery.liquid`. The frame takes the featured media's ratio within the desktop cap; other slides are contained and centred in it (no one-sided band); the fixed stage height is replaced by the frame's own height. Fixed ratios unchanged.
3. **Inventory:** each of `promo-bannder`, `article` hero, `newsletter-overlay`, `promise-section`, `search` empty state is either changed to height-from-content with a cap or kept with a recorded design reason (one row each). Files: those sections and snippets only.
4. **`ritual-steps`:** `sections/ritual-steps.liquid` (and `assets/ritual-steps.js` only if the shift needs it). Reduce the tall-screen empty space through the content (the panel gap and the text group's scale with height; the pinned stage stays one screen), and remove the reload shift at its source.
5. **Product card hover actions:** `tailwind/tailwind.components.css` (card actions) and `snippets/product-card.liquid` if a container needs declaring. The card is an inline-size container; the buttons pick a smaller type step on narrow cards through a container query (type steps only, per the stylesheet font-size rule), padding in `em`; the actions panel covers at most the lower part of the image.
6. **Product page load shift:** the gallery and product-info files that own the shifting elements (`snippets/product-gallery*.liquid`, `assets/product-gallery.js`, `sections/product.liquid` or its blocks), named in the Results with the cause before editing. Reserve the gallery's height from the server render (the active media's ratio) so hydration does not move the information column.

Read `docs/references/architecture/javascript-runtime.md` before any JS change and `docs/references/style-system/css-architecture.md` before the CSS changes. Run `review-animations` if any motion changes.

**Review tier.** Ask: Liquid markup and possibly `assets/*.js`. The Verifier runs in a separate session from `.agents/roles/verifier.md`; the user looks in their own browser (no coordinator screenshots, user 2026-10-28).

**Estimate:** about 8.5 hours (Stage 0 1.5, quick view 1.5, carousel 1.5, inventory 1, `ritual-steps` 1, card actions 0.5, product shift 1.5), plus the Ask review.

**Checkpoint:** three stops.

- After Stage 0: findings reported, method changes for items 2, 4 or 6 agreed with the user.
- After items 1 to 6 and validators: report the diff, validator output and what to look at, then the Ask review prompt.
- Whenever a fix needs a file or method not named above.

**Bar:** judged on the default preset, the current templates and the demo products, at 1440×900, 1920×1080 and 390×844.

- **Must fix:**
    - The quick view leaves an empty band over about 120px under its content on desktop, or content taller than the cap cannot scroll.
    - The `featured-product` carousel under `adapt` leaves a one-sided empty band over about 120px on any slide, or crops any slide.
    - A four-column product card at 1440 has its hover actions covering more than about half of the image.
    - Product page cold-load shift (cache bypassed) over 0.1 at 390 or 1440; home reload at y=1500 at 390 over 0.1.
    - Any cropped product image under `adapt`, any new `test:layout` issue, any validator failure, any focus or keyboard regression in the quick view.
- **Accepted residue:** the `ritual-steps` pinned stage stays one screen tall; inventory entries kept with a recorded reason.

**Acceptance checks.**

1. Quick view at 1440×900 and 1920×1080 with a short-content product and a many-variant product: dialog size, empty run under the content, internal scroll; focus moves in, traps and returns on close; 390×844 recorded.
2. Home `featured-product` at 1440×900 and 1920×1080: every slide's frame size and empty run above and below; nothing cropped.
3. One row per inventory entry: changed (with measurement) or kept (with reason).
4. `ritual-steps` at 1440×900 and 1580×1130: empty space above and below the text group, before and after; reload shift at 390 at y=1500.
5. Product card at 1440 (four columns) and 390: the share of the image covered by the hover actions, before and after.
6. Product page cold load (cache bypassed) at 1440 and 390: shift totals and sources, before and after.
7. Validators: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n`, `npm.cmd run lint:compat` when JS changes, `npm.cmd run scan:compat` when Tailwind or a stylesheet changes, `npm.cmd run test:layout -- --widths 390,768,1024,1440` 0 new issues, Prettier on every changed file.
8. The Ask review reports PASS; the user looks at home, a product with one image and with many images, the quick view and a search results page, at 1440 and the user's own screen.

**History.** Planned 2026-10-28 from the roadmap (LS2, first batch); restored after OS2 with Stage 0 added (user, 2026-10-28). Authorized by the user 2026-10-28; coordinator implements.

**Results.**

**Stage 0, product page shift (2026-10-28).** Coordinator, Chrome DevTools MCP against `shopify theme dev`, `/products/casual-knitted-shirt3`, 1440×900. Ten loads, cold (cache bypassed) and warm. Totals: 0.105, 0.0008, 0.0826, 0.0047, 0.1051, 0.3697, 0.5148, 0.142, 0.1812, and a few at about 0. Cold and warm both shift. The difference between G7's and the earlier measurements is two independent intermittent causes, not the cache.

- **Cause A (confirmed): the adapt gallery has no height before hydration.**
    - Under `adapt`, every main slide in `snippets/product-gallery-thumbnails.liquid` is `position: absolute`. Only `.is-active` becomes `position: relative` and gives the panel its height (`snippets/product-gallery.liquid`, the `[data-gallery-aspect-mode='adapt'] .product-gallery__zoom-button.is-active` rule).
    - `.is-active` comes from Alpine `:class`, so until the gallery hydrates the panel is about 20px tall, and `product-info-blocks--gallery` sits at y=154.
    - At hydration the panel grows to 754px: 0.0802 at 3351ms on a cold load. The G7 figure 0.0826 is this cause.
    - The file already has a pre-hydration rule (`:not([data-gallery-hydrated])` first child visible) that sets opacity only, not flow.
    - Proposed fix: the first slide in flow before hydration under `adapt` (same selector pattern, `position: relative`), CSS only.
    - Residue: a variant whose featured media is not the first still swaps at hydration.
- **Cause B (located, mechanism not pinned): content painted before parsing ends.**
    - Seen in about half the loads. First paint happens while `document.readyState` is `loading`. On that frame `main` starts at y=146 to 734, and the overlay-group section `search-overlay` (`.search-overlay-section`) has 147 to 258px of in-flow height while its dialog root reports `display: none` (`x-cloak`). One capture also showed the header mega-menu content above `main`.
    - Within about 40 to 80ms (still before Alpine) the space collapses: shift 0.10 to 0.51.
    - The fully parsed page without JavaScript (fetched HTML in a script-less `srcdoc` iframe) renders `main` at 0 with every overlay root `display: none`. So the final HTML and CSS are correct, and the transient belongs to the partially parsed document.
    - The theme dev proxy streams the response, so how much of this production shows is unproven.
    - Candidate fixes, not yet chosen:
        - (1) Move `{% sections 'overlay-group' %}` after `main` in `layout/theme.liquid`. Its dialogs are modal and fixed, so source order does not set their stacking or focus.
        - (2) Take the overlay-group wrappers out of flow with CSS.
        - Both are outside the plan's item 6 surface.
- Minor, every load: `product-info-blocks__collapsible-tab` rows move 22px (0.0022) and the thumbnail nav arrows reposition (0.0023).
- 390×844 runs and the live-store research are not done yet. Stopped at the Stage 0 time budget (1.5h) to report.

**Decisions (user, 2026-10-28):**
- **Cause B:** candidate (1). `layout/theme.liquid` joins the item 6 surface: `{% sections 'overlay-group' %}` moves after `main`. Checked first: z-index comes from the `--z-layer-*` scale, not source order; no CSS, JS or selector depends on the group's position; the dialog focus code does not read siblings. Acceptance: about ten reloads at 1440 without the 0.1 to 0.5 shifts; if they remain, report back.
- **390×844 (2026-10-28):** cold 0.502 and 0.4155, warm 0. Every large shift is cause A: `product-info-blocks--gallery` pushed from y=169 to 532 to 690 at about 3.5s, when the gallery hydrates. The G7 figure 0.4155 is this. Cause B was not seen at 390 in three loads.
- **Live research, home sections (1440×900, 2026-10-28):** home sections in order, as height / height relative to the viewport (main media).
    - **rhode:** hero 810 / 0.90 (1360×810 cover); image-with-content 742 / 0.82, with the image 816×890 cover bleeding past the section; banner 641 / 0.71.
    - **Summer Fridays:** hero 900 / 1.00 (cover); the single-product feature "Flushed Lip Stain" 844 / 0.94, height from content (heading, a rail of fixed 285×320 cover shade images, title, one add to cart, about 130 / 96px padding); one sticky block in a 685 / 0.76 section.
    - **OUAI:** heroes 768 / 0.85 and 650 / 0.72 (cover); no single-product feature.
    - **Our Place:** hero 612 / 0.68; two-up 868 / 0.96; no single-product feature.
    - **Kosas:** banners 576 / 0.64 and 466 / 0.52; no single-product feature.
    - **Ritual:** non-section markup, not comparable.
    - None uses a pinned full-screen narrative stage, so the 1920×1080 tall-screen comparison had nothing to measure. Media sections take a fixed frame with `cover`, about 0.5 to 1.0 of the viewport. The one single-product feature is sized by its content, not by the viewport.
- **Effect on the plan:**
    - Item 2: confirms the method (the frame from the media ratio within the cap; drop the viewport-sized stage).
    - Item 4: no outside pattern for pinned stages, so the method stands (reduce the empty space through content, the stage stays one screen).
    - Item 6: method set to the cause A fix in `snippets/product-gallery.liquid` (in the surface), plus the cause B move in `layout/theme.liquid`.
- Not repeated: quick view and product media, researched on 2026-10-27 (`8cb6fe7`).
- **Stage 0 complete.** Next: Stage 1, items 1 to 6.
- **User, 2026-10-28:** no coordinator before and after screenshots, the user looks; the mainstream references from the earlier layout and image-ratio discussions stand, so no further live research.

**Stage 1, item 6 (product page shift), 2026-10-28:**
- **Cause A:**
    - `snippets/product-gallery.liquid`: a new rule puts the initial slide in flow under `adapt` until a slide is active (`[role='tabpanel']:not(:has(> .product-gallery__zoom-button.is-active)) > .product-gallery__zoom-button[data-gallery-initial]`). The existing pre-hydration opacity rules move from `:first-child` to `[data-gallery-initial]`.
    - The server now renders the selected variant's media as the initial slide. A new optional `initial_index` parameter on `product-gallery` (thumbnails layout only) becomes `data-initial-index` on the root and `data-gallery-initial` on that slide in `snippets/product-gallery-thumbnails.liquid`, and that slide is the eager, high-priority image (previously the first).
    - `assets/product-gallery.js` starts `activeIndex` from `data-initial-index`.
    - Callers pass `selected_or_first_available_variant.featured_image.position | minus: 1 | at_least: 0`, the same index `variant-picker.js` emits: `sections/product.liquid`, `sections/featured-product.liquid` (thumbnails branch), `snippets/product-quick-view.liquid`.
    - Why: the default product URL carries the first available variant, whose image here is slide 5, so the first slide alone still swapped at hydration (0.0757 at 390).
- **Cause B:** `layout/theme.liquid` moves `{% sections 'overlay-group' %}` after `{% sections 'footer-group' %}`, with a Liquid comment.
- **Measured after (`/products/casual-knitted-shirt3`):**
    - 390×844 cold: 0 (before 0.502 / 0.4155).
    - 1440×900, seven loads, cold and warm: 0.0002, 0, 0, 0.0002, 0, 0.0002, 0.0002. Before, about half the loads were 0.10 to 0.51.
    - The initial slide, the active slide and `data-initial-index` all equal 4.
- **Validators:** `lint:theme`, `test:theme-check` (158 files, no offenses), `lint:liquid-syntax` and `lint:compat` passed; Prettier clean (the quick-view `assign` wrapped by hand).
**Stage 1, items 1 to 5 (2026-10-28):**
1. **Quick view:** `snippets/product-card.liquid` drops the full-screen panel classes (`tablet:h-full tablet:w-full tablet:!max-h-full tablet:!max-w-full`) and the 8vw / 5vh insets (now `tablet:p-step-m`). `tailwind/tailwind.components.css`, from tablet: `.product-quick-view-dialog` is `width: min(56rem, 100%)` and `max-height: 90svh`, and `.product-quick-view__media` and `.product-quick-view__info` are capped at `calc(90svh - 4rem)`, with the info column scrolling. Mobile rules unchanged.
2. **`featured-product` carousel under `adapt`:** `sections/featured-product.liquid` adds `featured-product-section--adapt` (carousel, `adapt`, product set). The media panel carries `--featured-media-ratio` (`featured_media.aspect_ratio`, default 0.75) and `--featured-media-max-height` (the `desktop_media_height` cap, default 90svh). From 64rem the media column drops the fixed `min(calc(var(--screen-height) - 6rem), 96rem)` and the panel takes the media ratio within the cap; other slides stay `contain`, centred. Fixed ratios unchanged. The home template uses carousel with the default `adapt`.
3. **Inventory:** no code change.
    - **`promo-bannder` panel** (at least one screen, sticky): kept; a sticky stacking narrative where each panel must cover the previous one.
    - **`article` hero** (55svh, at least 32rem): kept; a `cover` hero frame within the mainstream 0.5 to 1.0 viewport range.
    - **`newsletter-overlay` media** (`tablet:h-full`): kept; it fills the row the text sets.
    - **`promise-section` media** (`tablet:h-full`): kept; same, two text rows.
    - **`search` empty state** (`min-h-[50svh]`): kept; stops the footer jumping up on a near-empty page.
4. **`ritual-steps`:**
    - **Tall-screen space:** `sections/ritual-steps.liquid`. The text column gap goes from 2rem to `clamp(var(--spacing-step-l), 8svh, var(--spacing-step-3xl))`, and the panel gap from `clamp(3xl, 14svh, 4xl × 2)` to `clamp(3xl, 18svh, 4xl × 2.5)`. Before, at 1440×900: column 720, heading 22, panel stack 415, empty 131 above and below. Expected after (computed): about 93 at 1440×900 and about 166 at 1580×1130 (before about 207).
    - **Reload shift at 390, y=1500:** still 0.1339 after cause B. The cause is not `ritual-steps`. `sections/featured-products.liquid` puts `x-cloak` on every tab panel, the first included, so before Alpine the section is 122px tall, then 421px at about 3.0s, pushing `ritual-steps` down 301px. Smaller growths at the same time: `collection-list` 330 to 363, `ritual-steps` 513 to 548.
    - **Proposed fix:** no `x-cloak` on the first panel (`{% unless forloop.first %}`). This is outside the item 4 surface and awaits the user.
5. **Product card hover actions:** `tailwind/tailwind.components.css`. `.product-card` is an inline-size container (`container: product-card / inline-size`; every consumer gives the card a definite width: grid cells, slides, `w-100` in the super menu). Below 22rem the two buttons use `copy-m` instead of `body-2xl` (about 17rem at 1440 in four columns). Button padding stays on the settings chain.

**Validators (Stage 1):** all passed.
- `lint:theme`, `test:theme-check` (158 files, no offenses), `lint:liquid-syntax`, `lint:i18n`, and `lint:compat` (stylelint CSS, ESLint `assets/*.js`, embedded).
- `scan:compat`, with `build:tw` run.
- Prettier clean on the twelve changed files.
- `test:layout -- --widths 390,768,1024,1440`: 0 new issues.

**Correction and approval (user, 2026-10-28):**
- **Root size:** the root font size is 62.5% (`assets/base.css`, 1rem = 10px). Two values had been set as if 1rem were 16px:
    - Quick view width: `min(56rem, 100%)` (560px) is now `min(88rem, 100%)` (880px; Horizon's 54rem at 16px is 864px).
    - Card container threshold: 22rem (220px) is now 32rem (320px); a four-column card at 1440 is about 275px.
- **`sections/featured-products.liquid` joins the surface (user approved):** the panel `tab-control` opens first (`initialTabStrategy: 'middle'`, `Math.floor(count / 2)` in `assets/tab-control.js`, so `section.blocks.size | divided_by: 2`) renders without `x-cloak`, and the others keep it.
- **Measured:** reload at 390 scrolled to y=1500 gives 0.0049 (before 0.1339). Validators re-run and passed; Prettier clean.

- **Note:** the carousel, stacked and grid layouts keep index 0 before hydration (unchanged).

**Ask review 1 (separate session, 2026-10-28): FAIL, two defects.**
- **Proven:**
    - Product page loads under 0.1 at 390 and 1440 (cold 0 to 0.008, warm 0 to 0.004).
    - The initial slide equals the active slide equals `data-initial-index` (4). Variant and thumbnail changes, the lightbox and the magnifier work.
    - The overlays open, trap and return focus, and stack correctly; the skip link is intact.
    - Quick view focus is correct; the mobile sheet is unchanged.
    - `ritual-steps` about 93 / 166px above and below, with reduced motion intact.
    - Home reload at y=1500: 0 and 0.0029; the middle panel shows before hydration, and there is no two-panel flash.
    - The inventory reasons hold. Validators passed and `test:layout` reports 0 new issues.
- **D1 (high):** `assets/tailwind.output.css` lacked the quick-view and card rules: quick view 420px wide, info not scrollable, cards `container: none`.
    - Cause: the file had been regenerated at 17:09 identical to HEAD.
    - The user's dev command runs `concurrently "npm run shopify:dev" "npm run watch:tw"`, so a watcher rebuilds the output whenever a source changes. A transient source state without the changes (for example a revert during the review session) would produce exactly this.
    - The source still holds the rules, and `npm.cmd run build:tw` restores both (`@container product-card`, `min(88rem`).
- **D2 (high):** the `adapt` carousel slides followed the gallery's own adapt sizing (`height: auto`, the 90svh image cap at specificity 0,4,0), not the frame. At 1440 slide 9 sat top-aligned (0 above, 410 below); at 1920 slide 2 was 972px in a 945px frame (cropped 27px).
- **Unproven (notes):** home cards in the fixture have no quick view; the four-column search cards measured about 338px, not 275px.

**Correction 1 (2026-10-28):**
- **D1:** `npm.cmd run build:tw` re-run; the output now carries both rules.
- **D2:** `sections/featured-product.liquid`, within the `featured-product-section--carousel.featured-product-section--adapt` scope (from 64rem):
    - The Swiper container, wrapper and slides take `height: 100%`.
    - `.theme-image` takes 100% × 100% with `max-height: none`, and `.image_img` is `object-fit: contain`.
    - The selectors (0,6,0) outrank the gallery adapt rules.
- **Measured:**
    - 1440×900: frame 811×810; every slide box fills it with `contain`, centred.
    - 1920×1080: frame 945×945; no image exceeds the frame (slide 2 painted 744×945). Landscape slides are centred with equal bands (slides 6, 8 and 9: 102, 239 and 207px each side), the plan's contained-and-centred behaviour, not a one-sided band.
- **Validators:** `lint:theme` and `lint:compat` passed; Prettier clean.

**Correction review (separate session, 2026-10-28): FAIL on D1; D2 passes.**
- **D2 (pass):** all ten slides fill the frame with `contain`, centred, within its height. Centred bands are at most 205px at 1440 and 239px at 1920 each side; no crop.
- **Regression checks pass:**
    - Product page cold load 0 at 390 and 0.000135 at 1440.
    - Home reload at y=1500: 0.0033.
    - The initial slide is still 4.
    - Quick view focus and the mobile sheet are fine.
- **Cards:** search and collection cards at 1440 measured about 338px, with action overlap 31% (square) and 47% (landscape).
- **D1:** `assets/tailwind.output.css` again hashed identical to HEAD (`f508abb`) at the start and end of the review, so the quick view stayed 420px wide with no internal scroll and the cards had no container.

**D1 cause, revised (coordinator, 2026-10-28):** not a review-session revert.
- The `@tailwindcss/cli --watch` process (PID 22912, started 15:51:48 by the user's `concurrently "npm run shopify:dev" "npm run watch:tw"`) predates the edit to `tailwind/tailwind.components.css` (last write 17:08:46).
- The output was rewritten to HEAD's exact bytes at 17:09 and again at 17:41:04, while the source stayed unchanged and a manual `build:tw` produces the rules.
- So the watcher did not pick up the change to the `@import`ed component file and rebuilds from its stale copy whenever a content file changes, overwriting manual builds.
- **Fix:** restart the dev command so the watcher reads the current source. No code change.

**After the restart (user restarted the dev command, 2026-10-28):**
- The watcher rebuilt `assets/tailwind.output.css` at 17:55:16. It contains `container: product-card`, `@container product-card` and `min(88rem`.
- The stylesheet served by `shopify theme dev` (`/cdn/shop/t/185/assets/tailwind.output.css?v=74832702769246019101793181294`) carries both rules, and a card on `/collections/all` computes `container-type: inline-size`.
- Next, option A (the recommendation; the user did not pick, so it stands): a D1-only review in a separate session, alongside the user's browser look.

**D1 review (separate session, 2026-10-28): PASS.**
- The generated and loaded CSS carry the three rules; the output hash `3496d392…` differs from HEAD `f508abb…` and stayed stable through the review.
- Quick view is 880px wide on `/collections/all` and `/search?q=a` at 1440 and 1920. Heights follow content: 472, 450, and 810 at 1440 for the many-variant product, whose info column scrolls the last 17px to the details link. Focus traps and returns; the mobile sheet is 370×829, unchanged.
- Cards are `container-type: inline-size`:
    - 298px at 1280 uses the copy-m step (15.97px, matching `--type-step-0`), with overlap about 27% (square) / 40% (landscape).
    - 338px at 1440 keeps body-2xl (25px), with overlap 31% / 47%.
    - At 390, the touch layout is unchanged.
- Generated CSS changes are limited to these rules plus four quick-view utilities pruned (no Liquid consumers left).
- `lint:theme`, `lint:compat` and Prettier passed; `test:layout` reports 0 new issues.
- **Remaining:** the user's browser look (step 8), then the commit when the user asks.

**User browser look, finding 1 (2026-10-28): quick view proportion.**
- The 1:1 media column (about 345px tall) next to a long info column (about 780px) left a large empty area under the image.
- Option 1 chosen by the user: the media owns the height, as in Horizon (fixed about 616px, info scrolls) and Princess Polly (871×564, 3:4 image), both recorded in `8cb6fe7`.
- **Principle restated (user, 2026-10-28):** each container has one height owner, sized by its content or its ratio, with a minimum and a maximum; the rest adapts.

**Correction 2:**
- `snippets/product-quick-view.liquid`: gallery `aspect_ratio` from `'1/1'` to `'3/4'`.
- `tailwind/tailwind.components.css`, from tablet, `.product-quick-view__info`: `contain: size`, so it takes no part in the row height and the media sets it. A thin visible scrollbar (`scrollbar-width: thin`, `scrollbar-color: var(--color-line) transparent`, plus a WebKit thumb) replaces the hidden one on desktop. Mobile keeps its own rules.
- **Measured (1440×900, `casual-knitted-shirt3` from `/search?q=casual`):** dialog 880×500; media column 405×460 (main stage 345×460, 3:4); empty under the media 20px (padding); info 460 visible of 787, scrolling with a thin scrollbar.
- **Validators:** `lint:theme`, `test:theme-check` (158, no offenses), `lint:liquid-syntax`, `lint:compat` passed; Prettier clean.
- **Tooling:** the restarted `watch:tw` again ignored the edit to `tailwind/tailwind.components.css` (only `@import`ed files; `.liquid` edits trigger rebuilds from the stale copy). `npm.cmd run build:tw` was run by hand; the output carries `contain: size` and the scrollbar rules. Any later `.liquid` edit while this watcher runs reverts them, so the dev command needs a restart before the user's look.

**User browser look, finding 2 (2026-10-28):** the coordinator had misread the request. The dialog frame itself needs fixed thresholds; it should not be sized by either column. Correction 2 gave 880×500, a short, wide box. The user's marked target at 1905×945 is about 1005×675, about 52vw by 72svh.

**Correction 3:** `tailwind/tailwind.components.css`, from 64rem (1024px):
- `.product-quick-view-dialog`: `--quick-view-height: min(clamp(56rem, 72svh, 80rem), 90svh)`, `width: min(clamp(96rem, 52vw, 112rem), 100%)` and `height: var(--quick-view-height)`.
- `.product-quick-view__layout`: `height: 100%`, with columns `calc((var(--quick-view-height) - 4rem) * 3 / 4 + 6rem) minmax(0, 1fr)`. The media fills the height at 3:4; 4rem is the layout padding, 6rem the thumbnail column and gap, measured.
- `.product-quick-view__media`: `height: 100%`.
- The minimum width was raised from 88rem to 96rem after measuring: at 1440 an 880 frame left the info only 294px wide.
- Correction 2's info `contain: size` and thin scrollbar stay. Between 768 and 1024px the media ratio sets the height (correction 2).

**Measured (`casual-knitted-shirt3`):**

| Viewport | Dialog | Media / main image | Info |
|---|---|---|---|
| 1440×900 | 960×648 | 456×608 | 374 wide, scrolls 843 |
| 1905×945 | 983×680 | 480×640 | 373 wide |

The image fills the column height at both sizes (20px padding below).

**Validators:** `lint:theme` and `lint:compat` passed; Prettier clean; `build:tw` run by hand (the watcher caveat above still applies).

**User, 2026-10-28:** quick view accepted for now ("暂时可以"); the thin scrollbar style approved. Next: a short quick-view-only review in a separate session (corrections 2 and 3, the recommendation), and the user's look at the remaining items.

**Quick view review (separate session, 2026-10-28): PASS.**
- The CSS is delivered (hash `dae3a642…`, not HEAD).
- Dialog sizes: 960×560 at 1024, 960×648 at 1440, 983×680 at 1905, 1120×800 at 2560. The main image is 3:4 and fills the height. The info scrolls with a visible thin scrollbar; Add to cart, Buy it now and the details link are reachable by Tab.
- From 768 to 1023 the info is 328 to 403px wide.
- The mobile sheet is 370×829 and scrolls as a whole; its main media is now 3:4 (350×467).
- Focus, thumbnails, arrows and variant changes work.
- **Notes:**
    - At 1024 about 9px extra space under the image: below 80rem the layout padding is 1.5rem a side (3rem in total), and the column calc assumes 4rem. This is under the bar.
    - Mouse-wheel scrolling was not physically tested.
    - Quick view renders the gallery without `zoom` (HEAD too), so no lightbox there. Pre-existing, not a regression.

**Commit (user, 2026-10-28: "先提交吧"):** committed with the quick view accepted. The user's look at the remaining items (product page shift, home carousel bands, `ritual-steps` spacing, card actions, overlays) is not reported; the separate-session reviews covered them at runtime (review 1 and the correction review). The 1024 padding note stays open; see the close-out. The carousel's Swiper start slide is not tied to `data-initial-index`, so the parameter is passed through only for thumbnails.
