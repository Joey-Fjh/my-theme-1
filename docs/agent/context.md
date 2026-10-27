# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan BP1: consolidated browser pass (backlog group 7)

**Outcome.** The launch-blocking storefront flows have browser evidence at 390 and 1440. These checks were left open by the 2026-10-04 and 2026-10-13 passes. Each row ends as pass, a defect recorded for its own fix plan, or classified (code, configuration, platform, measurement).

**Decided (user, 2026-10-27).** Board topic BP1, option 1:

- The agent runs part A in DevTools as this plan.
- The user then gets one prompt for part B.
- Part C applies:
    - The width matrix and the manual test checklist document move to group 8.
    - The `account.js` 400 moves to after submission.
    - Safari, real touch and real `:hover`, rows blocked for data, and 5-C1 subsetting on a pushed theme are dropped. Stand-ins: `scan:compat` WebKit guardrails and the touch emulation in A.

Constraints: no real device; no Safari on this workstation; agents run only non-visual checks.

**Dependencies.** `npm.cmd run shopify:dev` running, with Chrome DevTools MCP attached. The store password is entered once by the agent (the dev store's own password page). No form that creates a customer or an order is submitted. Add to cart is allowed; checkout is not entered.

**Implementation surface.** None. The pass is read-only against the dev server and writes only this file. A defect found is recorded below with its evidence and is not fixed in this batch. Each defect becomes its own plan after the user decides.

**Rows (part A).**

1. **No JavaScript (390 and 1440).** The JavaScript-disabled emulation is on for each row.
    - Home: first viewport heading and call to action visible.
    - Product: title, price, gallery first image and the add-to-cart form present.
    - Collection: filter and sort links reach URL-based results.
    - `/cart`: line items visible.
2. **At 390.**
    - Cart page: change quantity and remove a line.
    - Cart drawer: open from the header and change quantity.
    - Search: overlay and predictive search results.
    - Product media lightbox.
    - Quick view.
    - Localization selector.
    - The accordion in `promise-section`.
    - Tabs: `featured-products`, search result tabs, `feature-tabs`.
3. **Keyboard and focus (1440, 5-C3f).**
    - Skip link, header, and a dropdown with a real second level.
    - Mobile menu, cart drawer, search overlay, filter drawer, quick view, product media modal and the newsletter overlay: Escape closes each one and focus returns to its opener.
    - Tab stays inside each one while it is open (the newsletter overlay included).
    - Carousel arrows, pagination dots and `slides-show` arrow keys.
    - The sort control with Enter and Space.
    - Visible focus on every stop, read from computed `outline` or `box-shadow`.
4. **History.** Collection pagination and facet changes update the URL. Back and Forward restore the grid and the active filters.
5. **Motion.**
    - `prefers-reduced-motion: reduce` emulation on home and a product page: the testimonial marquee, `slides-show` autoplay, the reveal cascade and decorative loops stop. Content stays visible.
    - `motion_enabled` off: read the rendered markup and CSS path only. Changing the setting is a merchant configuration change, so this check is not run without the user.
6. **Scroll-linked.** `scatter-gallery` and the scroll-linked home sections at 390 with touch emulation: no horizontal overflow, content reachable, no stuck pinned state.
7. **Classify.**
    - The header jump on a mid-page reload of a product page, read against the header scroll script.
    - The one-off 0.515 product shift under Slow 4G and CPU 4x: one more trace.
    - The `/favicon.ico` 404 on the first home load.

**Review tier.** Show. No code change. The evidence below is reported to the user, and the user's part B look is the review.

**Estimate:** 4 to 5 hours of agent time, plus about 1 hour of the user's part B look.

**Checkpoint:** three stops.

- After row 3, report progress and any defects so far.
- After row 7, deliver the part B prompt.
- Stop whenever a row needs a setting, content or store change.

**Bar:** defects are recorded, not fixed, in this batch.

- **Must record as a defect:**
    - Any flow in rows 1 to 4 that fails its expected behaviour at 390 or 1440.
    - A drawer or dialog that does not close with Escape, return focus, or keep Tab inside.
    - A focus stop with no visible indicator.
    - A console error raised by theme code during a row.
- **Accepted residue:** the dropped rows above; console messages from Shopify's own scripts (classified, not fixed).
- **Input:** the default preset, the current templates and the dev store's existing products.

**Acceptance checks.**

1. Every row 1 to 7 has a result line below: pass, defect (with the DevTools evidence: URL, width, element, observed value) or classification.
2. Each defect has one proposed backlog line or board topic, written once the user decides.
3. The part B prompt has been delivered to the user, and the user has reported the result.
4. `npm.cmd run lint:records` passes.

**History.** Authorized by the user 2026-10-27 ("授权执行BP1"). Run by the coordinator in this session against `shopify theme dev` (`127.0.0.1:9292`) through Chrome DevTools MCP.

**Method notes.**

- No JavaScript: DevTools MCP has no script toggle. The page HTML is fetched and rendered in an `iframe` with `sandbox="allow-same-origin"` (scripts off, `<noscript>` content parsed). Widths 390 and 1440 are the iframe widths; the document width is 375 or 1425 because of the scrollbar.
- 390: `390x844x3,mobile,touch` emulation. 1440: `1440x900x1`.
- Visible focus: after one real Tab (keyboard modality), each visible focusable element is focused by script. The check reads `outline`, `box-shadow`, or the parent's ring.
- Cart state: one line, Casual Knitted Shirt3 XS / Brown, was added by `/cart/add.js`. Checkout was not entered.

**Results.**

1. **No JavaScript.**
    - Home, 390 and 1440: pass. The first slide's heading and "Shop the collection" are visible, and the document does not overflow.
    - Product, 390 and 1440: pass, with a note.
        - Title, price and first image are visible. `<noscript>` lists one "<variant> — Add to Cart" form per available variant.
        - Note: the JS picker is still shown above that list but does nothing without JavaScript: radios, quantity buttons, and an Add to Cart button that is disabled by design.
    - Collection: **D1**. Pagination links work. Filters sit in a dialog that needs JavaScript, and sort is an Alpine disclosure, so neither can be reached.
    - `/cart`: line, remove link (`/cart/change?...&quantity=0`) and Checkout work. Quantity cannot change: **D2**.
2. **At 390.**
    - Cart page: quantity and remove update the cart. Focus is lost afterwards: **D3**.
    - Cart drawer: pass, except focus after a quantity change: **D3**.
        - Opens with focus on Close and locks body scroll.
        - The Tab cycle stays inside, and Escape returns focus to the Cart button.
        - After a quantity change focus goes to `body`, outside the dialog. The next Tab re-enters the dialog.
    - Search overlay and predictive search: pass.
        - "shirt" lists products, the panel does not overflow, and Escape returns focus to Search.
        - A suspected stale "Loading" status was checked against the markup and withdrawn: its parent is `x-show` hidden.
    - Lightbox: pass. Opens on the active slide's zoom button with focus on Close; 25×25 controls; trapped; Escape returns focus to the opener.
    - Quick view: pass. Opens with focus on Close, trapped, and Escape returns focus to the opener.
        - Note: on touch devices `openQuickView` ignores activation for a short guard window after a scroll (`shouldIgnoreTouchToggleAfterScroll`). A keyboard Enter right after a scroll does nothing; this is by design.
    - Localization selector: **D4**. No selector is reachable below 768.
    - Accordion (`promise-section`): pass. One panel open at a time, `aria-expanded` correct, closed panels `inert` and `aria-hidden`.
    - Tabs:
        - `featured-products`: pass. Arrow keys move focus and Enter activates (manual activation), and one panel shows. All three tabs read "(0)" with sample products because no collections are set: content, not code.
        - `feature-tabs`: pass. Vertical orientation; ArrowDown then Enter.
        - Product thumbnails: pass. One panel labelled by the selected tab.
        - Search page: pass. One results panel.
    - Mobile menu: pass. Focus on Close, Tab and Shift+Tab trapped, submenu `aria-expanded`, Escape returns focus to Mobile Menu.
    - Filter drawer: pass, except two issues.
        - Option rows are 23.6px tall at a 28.1px pitch, which meets the WCAG 2.5.8 spacing exception.
        - Focus after a change: **D3**. Duplicate panel ids: **D6**.
3. **Keyboard and focus (1440).**
    - Skip link: pass. Visible on the first Tab with a 2px outline; Enter moves to `main`.
    - Visible focus sweep: pass on home (73 elements), product (45), collection (66) and cart (27).
        - The only elements without an indicator are the hCaptcha badge links Privacy and Terms (`#shop-hcaptcha-badge-container`): Shopify-injected, accepted residue.
        - The collection card ring sits on `.collection-card__surface`. The variant radios ring their sibling span. The card quick-view button fades in on focus.
        - No positive `tabindex`.
    - Header dropdowns: pass.
        - "All Category" (mega menu, grouped links) and "Shop" (one child level) open with Enter, set `aria-expanded`, and Escape returns focus to the summary.
        - The store menu has no deeper level (content).
    - Drawers and dialogs, Escape and focus return: pass for the mobile menu, cart drawer, search overlay, filter drawer, quick view and lightbox (rows above).
    - Newsletter overlay (opens after 3 s on home): **D7**. Focus moves to Close on open and Escape closes it, but focus is not kept inside.
    - Carousels:
        - `slides-show`: the region is focusable, Arrow keys change the slide, and the dots set `aria-current`. Autoplay has no pause: **D8**.
        - `featured-product`: Swiper bullets (`span role=button`, 24×24, `tabindex=0`) activate with Enter.
        - The other carousels use native buttons with labels (`collection-list`, `routine-showcase`, both `ritual-steps`).
    - Sort control: pass, with one focus issue.
        - A disclosure of option buttons with `aria-pressed`; Enter opens it, and Tab then Space selects. The grid updates in the same document and the URL gets `sort_by`.
        - Focus goes to `body`: **D3**.
4. **History:** pass, with one defect.
    - Facets at 390: Back restores the unfiltered grid and Forward restores the Brown filter and its checkbox, in the same document.
    - Pagination: Back and Forward restore pages 1 and 2 and `aria-current`.
    - After an AJAX page change the viewport stays at the pagination: **D5**.

5. **Motion.**
    - `prefers-reduced-motion: reduce` at 1440: pass on home and product.
        - After scrolling the whole page there are 0 running animations, and no reveal target keeps a transform.
        - `slides-show` stays on slide 1 for 11 s.
        - Control run without reduce: 35 running animations on home, including the infinite `watermark-marquee-x` tracks of `testimonial-featured` and `scrolling-icon-with-text`, the `slides-show-text-rise` and the card cascade.
        - Text still invisible under reduce is designed state, not motion: inactive `routine-showcase__info--inactive` and `ritual-steps__panel` use `visibility: hidden`, and the card hover actions show on hover or focus.
    - Both marquees carry a "Pause scrolling text" button.
    - `motion_enabled` off: markup and CSS path only (no setting change).
        - `layout/theme.liquid` sets `data-motion-enabled="false"` on `body`.
        - The CSS stops the marquee tracks, the scrolling icon track, the cascade and the rotating badge.
        - These modules return early on it: `slides-show` (text motion), `card-rail`, `motion-reveal`, `promo-bannder`, `ritual-steps`, `scatter-gallery`, `scrolling-marquee`, `before-after-comparison`.
6. **Scroll-linked at 390 with touch emulation:** pass.
    - Home was scrolled in 211px steps over 14195px. The document width stayed 390, and no non-rail element sat off-screen in `scatter-gallery`, `ritual-steps` (sticky and carousel), `routine-showcase` or `scroll-categories`.
    - `scatter-gallery` slots settle to an identity transform, the heading stays visible, and there is no pin spacer.
    - The slots show placeholder SVGs: no images are set, which is content.
7. **Classify.**
    - **Header on a mid-page reload: theme code, D9.**
        - Product at 1440, `scrollY` 1453 restored. The fixed `.site-header` starts at `top: var(--announcement-bar-height)` = 47px, then moves to 0 once the scroll is restored.
        - About 220 ms after load `stickyHeader` adds `is-top`, because its initial state is `isTop: true` and it never reads the restored position. It keeps `is-top` at `scrollY` 1453 until the first user scroll, which then sets `is-scrolled` or `is-hidden`.
        - Fixed elements do not count in CLS, so Lighthouse does not see it.
    - **One-off 0.515 product shift: measurement.**
        - Two runs at Slow 4G and CPU 4x (412×823 mobile) logged large shifts on the main section (0.17 and 0.79). Both carried `hadRecentInput: true` (excluded from CLS) and coincided with the test's own scroll reset and restoration.
        - A cold trace (`ignoreCache`) reports CLS 0.00, so this is not a theme shift.
        - Under these conditions the dev server TTFB is 2.8 s and LCP is 10.8 s; dev-proxy timing is not a Lighthouse measure.
    - **`/favicon.ico` 404: configuration.**
        - `snippets/meta-tags.liquid` outputs the icon link only when `settings.favicon` is set, and `config/settings_data.json` sets none, so the browser requests the default `/favicon.ico`.
        - Fix: upload a favicon in the Theme Editor (merchant).

**Defects (proposed; each becomes its own backlog line or plan once the user decides).**

- **D1 — no-JS collection filter and sort (moderate).** Surface: `snippets/filters-groups.liquid` and the collection toolbar.
    - Evidence: no reachable filter form or `sort_by` link without JavaScript.
    - Shopify recommends progressive enhancement ("Render essential content in Liquid and HTML", and the "Support storefront filtering" form with submit buttons). The requirements page has no explicit rule for this.
- **D2 — no-JS cart quantity (minor).** Surface: `sections/cart.liquid`.
    - The quantity input is `name="quantity"`, not `updates[]`, and the form has no update submit.
- **D3 — focus lost after a section refresh (accessibility, must-record).** Focus goes to `body` after:
    - Cart page quantity and remove.
    - Cart drawer quantity, where focus leaves the open dialog.
    - Filter checkbox in the open drawer.
    - AJAX pagination.
    - Sort option.

    Surface: the cart and collection refresh paths in `assets/`.
- **D4 — no country or language selector below 768 (Theme Store requirement level).**
    - Selectors render only in `sections/announcement-bar.liquid`, whose localization row is `max-tablet:hidden`.
    - Neither the mobile menu drawer nor the footer has one.
    - Shopify: selectors belong in the header, the footer or a navigation drawer.
- **D5 — AJAX pagination leaves the viewport at the bottom.**
    - The first card was 1076px above the viewport at 390 after moving to page 2.
    - Surface: the collection pagination script.
- **D6 — duplicate ids in the filter drawer.**
    - `snippets/filters-groups.liquid` renders one single-item `accordion` per filter, all with `id_prefix: scope_id`.
    - So every group gets `accordion-panel-<scope>-0` (4 duplicates on `/collections/all` and `/search`), and every `aria-controls` points to the first group.
    - Invalid HTML, which the Theme Store requires to be valid.
- **D7 — newsletter overlay focus trap leaks.**
    - Tab from Submit goes to the announcement bar "United States | USD". Shift+Tab from Close does not wrap.
    - Cause: `isElementVisible` in `assets/dialog.js` checks only ancestors for `display: none`. The Shopify-injected `textarea[name=h-captcha-response]` (inline `display: none`) becomes the trap's `last` element.
    - The same failure applies to any dialog that holds a form with hCaptcha.
- **D8 — `slides-show` autoplay cannot be paused by keyboard on desktop (WCAG 2.2.2).**
    - `data-autoplay="true"`, `autoplayDelayMs` 5000.
    - The `[data-autoplay-pause]` button exists but is hidden in CSS on hover devices.
    - The keyboard-focus pause does not take effect. With "Hero slides" focused through Skip link → Tab (`:focus-visible`), the component state reads `_focusPaused: true` while Swiper reports `autoplay.running: true, paused: false`, and the slide moved 3 → 1 → 2 over 12 s.
    - Surface: `assets/slides-show.js` (`_syncAutoplay` and focus pause) and the pause button's hover-device CSS.
    - Related: the After-submission item "Shared carousel indicator ... plus the optional pause button".
- **D9 — mid-page reload: header state and a 47px content jump.**
    - The header first sits 47px down, then jumps to the top, and keeps the at-top state (`is-top`) until the first scroll.
    - The content jumps too (the user saw the scrollbar move up and down). About 200 ms after load the product main section shrinks by 47px (1391 → 1344, the announcement bar height), and scroll anchoring moves `scrollY` from 2544 to 2496.
    - Surface: `assets/sticky-header.js` (initial sync of `isTop`, `isHidden`, `lastY`), the `--announcement-bar-height` update and the main section top offset that reads it.
    - Separate and expected: at about 1.2 s `product-recommendations` loads asynchronously (125 → 513px, below the viewport). That only changes the scrollbar thumb length; reserving a minimum height is a possible polish item.
- **D10 — product magnifier pane stays open after a reload (user report, not reproduced).**
    - User screenshot: a blank 360×360 `z-layer-magnifier` pane over the variant picker that does not close.
    - A blank pane is `active: true` with `imageReady: false` while the zoom image loads.
    - In DevTools the pane opens on hover, fills once the 2400px zoom image loads, and closes on `pointerleave`. It also closes after the thumbnail tab changes the slide under a resting pointer, and after the slide becomes `inert`.
    - The DevTools pointer does not persist across a reload, so the reported path (pointer resting on the gallery during load) cannot be replayed.
    - User steps (2026-10-27):
        1. Rest the pointer on the main image.
        2. Move out, sweeping across the pane area.
        3. Move back in: the pane stays blank.
        4. Moving out no longer closes it.
    - The DevTools hover tool jumps the pointer without intermediate moves. The same path (image → title under the pane → image → title) opened, filled (`opacity` 0 → 1 over 0.25 s) and closed every time, so the sweep is not reproducible here.
    - Fix direction: defensive close (pointer outside the image rect on `pointermove` at document level, `scroll`, `blur`, `visibilitychange`), and the preview layer keyed to `zoomImageLoaded`.
    - Surface: `assets/image-magnifier.js`, `snippets/image-magnifier.liquid`.

**Observations (no defect under the bar).**

- The pagination `nav.pagination` has no `aria-label` while the page has other `nav` landmarks.
- Two tablists share the label "Tab Control" (search page and the predictive panel).
- The search overlay opens with focus on Close, not on the input.

**Checkpoint 1 (after row 3), 2026-10-27:** reported to the user, who said to continue.

**Checkpoint 2 (after row 7), 2026-10-27:** rows 1 to 7 done; the part B prompt was delivered to the user.

**Part B (user look, 2026-10-27; first report, four screenshots).**

1. **`routine-showcase` at about 1872 wide: large empty band in the left column (design).**
    - The section uses `height_kind: 'content'`. Its height is set by the arch media (about 780px), and the text column places the heading block at the top and the product block at the bottom.
    - The user asks how official themes and good practice judge this. This goes to the polish pass with the item below.
2. **Product page after a reload:**
    - The magnifier pane stays open: D10.
    - The scrollbar jumps on a mid-page reload: measured and added to D9. At the top there is no jump, only the thumb shortening as the recommendations load.
3. **Collection navigation "More" drawer: first-row names look smaller (not a defect).**
    - Every link computes `font-size: 16px` (`copy-m`) and every count `<sup>` 12px, confirmed on a screenshot at 1440.
    - The test collection names are runs of one digit, and "1" is a narrow glyph, so "111111111111" reads smaller than "333333333333333".
4. **Product with one image: large empty area under the packshot (design).**
    - At 1872×1307 the media frame is `aspect-ratio: 3 / 4`, capped to the viewport (frame 748×810 at 1440), and the image is `object-fit: cover`.
    - The packshot file has its own wide margins, so the lower part of the frame shows the image background. The description starts below the fold (1330px).
    - Design questions: the media frame ratio (fixed 3:4 or adapt to the image), the viewport cap, and the column balance with one thumbnail. This goes to the polish pass with item 1.

**Status: executed and reviewed (tier Show, the user's look), 2026-10-27.** D1 to D10 went to `docs/agent/backlog.md` group 7 in the user's batch order. Items 1 and 4 went to board topic LS1. Waiting for the commit; then this file is cleared.

The user reported nothing else in part B (2026-10-27: "B部分没啥"). The open point is items 1 and 4: in-container spacing and the outer limits of the container, judged against review and readability.

Evidence for that, coordinator, 2026-10-27:

- **Theme Store testing checklist** (https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist):
    - Product page: "Test the following aspect ratios using portrait and landscape: 16:9, 4:3, 3:2, 1:1; PNG image".
    - Unique sections: "Each section supports varying image qualities and ratios".
- **`sections/product.liquid`** offers `media_aspect_ratio` with only `portrait_3_4` (the default) and `square_1_1`, and the frame image is `object-fit: cover`.
    - A 16:9 product image in the 3:4 frame keeps about 42% of its width.
    - There is no "adapt to image" option.
    - `desktop_media_height` is `balanced` in `templates/product.json` and caps the frame to the viewport.
