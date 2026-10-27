# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan G7: browser pass defects D1 to D10

**Outcome.** The ten defects from BP1 are fixed: focus, keyboard and autoplay control meet the accessibility baseline (D3, D6, D7, D8), shoppers below 768 can change country and language (D4), mid-page reloads and pagination no longer jump (D9, D5), the magnifier always closes (D10), and collection filter, sort and cart quantity work without JavaScript (D1, D2).

**Decided (user, 2026-10-27).** Group 7 in full before LS2. Evidence: `git show 4e0884d:docs/agent/context.md` (BP1).

**Investigation (coordinator, 2026-10-27; root causes confirmed in source, D8 also at runtime).**

- **D7.** `isElementVisible` in `assets/dialog.js` walks from `el.parentElement`, so an element whose own `display` is `none` (the hCaptcha textarea) counts as focusable and becomes the trap's last stop. `assets/image-lightbox.js` `_isElementVisible` is a copy with the same bug.
- **D6.** `snippets/filters-groups.liquid` renders one single-item `accordion` per filter with `id_prefix: scope_id`, so every panel is `accordion-panel-<scope>-0`.
- **D4.** The selectors render only in the announcement bar's `max-tablet:hidden` row; `snippets/header-mobile-menu-drawer.liquid` and the footer have none. A header section cannot read the announcement bar's settings.
- **D3.** `SectionRefresher.render` (`assets/https.js`) swaps markup through `replaceRegion` and never restores focus. The cart page and drawer (`assets/cart.contract.js`, `assets/cart-overlay.js`), filters (`assets/collection-filters.js`, `assets/search-filters.js`), pagination (`assets/section-pagination.js`) and sort all go through it.
- **D5.** `assets/section-pagination.js` renders and pushes history but never moves focus or scroll.
- **D8.** Runtime, 1440×900: with keyboard focus inside the slideshow (`:focus-visible`, `_focusPaused` true), slides still advanced every 5s. Swiper 12 resumes autoplay after each transition, and `_onUserPauseHold` in `assets/slides-show.js` re-applies only the button pause (`if (this._userPaused)`), not focus, hover or viewport pauses. Separately, `snippets/autoplay-pause-button.liquid` hides the button under `(hover: hover) and (pointer: fine)`.
- **D9.** `assets/sticky-header.js` starts with `isTop: true` and only computes state on scroll. `assets/base.js` sets `--announcement-bar-height` to the bar's visible part on every scroll. Fixed overlays need that, but the in-flow first-section clearance in `snippets/section-frame.liquid` (and the `article` hero padding) also reads it, so a reload below the bar renders 47px less clearance, and the first 47px of a normal scroll shift content.
- **D10.** `assets/image-magnifier.js` opens only on `pointerenter` and closes only on `pointerleave`. A reload with the pointer already over the image never opens it; a media switch makes the old layer `pointer-events: none`, and its `pointerleave` can be missed, leaving the pane open.
- **D1.** Filters live in a JavaScript dialog and sort is an Alpine disclosure, so no form or `sort_by` link is reachable without JavaScript.
- **D2.** `sections/cart.liquid` quantity inputs are `name="quantity"`, with no update submit.

**Implementation surface and method.**

- **D7:** `assets/dialog.js`, `assets/image-lightbox.js`: the visibility walk starts at the element itself.
- **D6:** `snippets/filters-groups.liquid`: `id_prefix` gets the filter index.
- **D8:** `assets/slides-show.js`: the resume hold re-applies any interaction pause (`_isInteractionPaused()`). The pause button stays hidden on hover devices (user, 2026-10-27: hover already pauses; desktop keyboard users get the focus pause this fix restores).
- **D4:** `snippets/header-mobile-menu-drawer.liquid` renders `country-localization` and `language-localization` (unique form ids) below the menu. `sections/header.liquid` gains `enable_country_selector` and `enable_language_selector` (default on, as in Dawn), with locale keys in the schema locale files. `assets/localization-switcher.js` changes only if two instances conflict.
- **D3 and D5:** `assets/https.js` `SectionRefresher.render`: before the swap, record the focused element inside the target (its `id`, else a `data-focus-key`, else `name` plus `value`). After the swap, focus the match with `preventScroll`; else the caller's fallback (`config.focusFallback` selector); else the target. Callers pass fallbacks: a removed cart line goes to the cart heading or the next line; pagination goes to the results grid (`tabindex="-1"`, scrolled to its top below the sticky header, which is D5). `data-focus-key` attributes are added where ids are not stable (cart line controls, filter inputs) in the matching snippets.
- **D9:** `assets/sticky-header.js` computes `isTop` and `lastY` in `init`. `assets/base.js` also sets `--announcement-bar-offset` (the bar's full height, independent of scroll). The first-section clearance in `snippets/section-frame.liquid` and the hero padding in `sections/article.liquid` use the offset; fixed overlays keep `--announcement-bar-height`.
- **D10:** `assets/image-magnifier.js`: `moveMagnifier` opens the pane when it is not open yet. While open, a pointer position outside the element's rect (checked on move and on scroll) closes it. It also closes on `blur` and `visibilitychange`.
- **D1:** the collection and search toolbars get a `<noscript>` fallback: Shopify's storefront filtering form (GET, list filters as checkboxes, price range inputs, a submit button) and a sort `<select name="sort_by">` with a submit. Files: a new `snippets/filters-noscript.liquid`, `snippets/sort-by-dropdown.liquid`, and the collection and search toolbars.
- **D2:** `sections/cart.liquid`: quantity inputs become `name="updates[]"` with a `<noscript>` update submit, after checking that `assets/cart-page.js` does not depend on `name="quantity"`.
- Read `docs/references/architecture/javascript-runtime.md` before the JS changes. `review-animations` does not apply unless motion changes.

**Review tier.** Ask: `assets/*.js`, Liquid markup and schema change. The Verifier runs in a separate session from `.agents/roles/verifier.md`.

**Estimate:** about 10 hours (D7, D6 and D8 about 1.5; D4 about 1.5; D3 and D5 about 2.5; D9 about 1.5; D10 about 1; D1 about 2; D2 about 0.5), plus the Ask review.

**Checkpoint:** three stops.

- Before code: done 2026-10-27. The user declined the desktop pause button (D8) and approved the D4 selectors in the mobile menu drawer with header settings default on.
- After the review-risk items (D4, D6, D7, D3, D8) with their checks; then the rest.
- After all items and validators, before the Ask review prompt; also whenever a fix needs a file or method not named above.

**Bar:** judged on the default preset and the current templates, at 1440×900 and 390×844, keyboard only where stated.

- **Must fix:** any of the ten defects still reproducible by its check below; any new focus trap leak or focus loss; any new `test:layout` issue; any validator failure; any JavaScript console error on home, product, collection, search and cart.
- **Accepted residue:** the D1 and D2 fallbacks look plain (they show only without JavaScript). D10 is checked with scripted pointer events and the user's own sweep, since the DevTools hover tool did not reproduce it.

**Acceptance checks.**

1. D7: with the newsletter overlay open, Tab and Shift+Tab cycle only visible controls, and the hCaptcha textarea is never focused. The lightbox the same.
2. D6: the filter drawer has no duplicate `id` (the count of `[id]` equals the unique count), and every `aria-controls` resolves.
3. D8: keyboard focus inside the slideshow holds the slide for at least 12s, and focus out resumes. Pointer hover holds it the same way. The pause button stays hidden on desktop and still toggles at 390. `routine-showcase` the same.
4. D4: at 390 the mobile menu drawer shows country and language selectors; changing the country reloads with the new currency; both are keyboard reachable; the header settings turn them off.
5. D3: after each of cart page quantity, cart page remove, drawer quantity, drawer remove, filter checkbox, sort option and pagination, `document.activeElement` is the matching control or the named fallback, never `body`. Inside the drawer, focus stays in the dialog.
6. D5: after pagination at 390 and 1440, the results grid top is in view, below the sticky header.
7. D9: on reload at a mid-page scroll position on home and a collection, the header has the scrolled state and no layout shift entry over 0.01 occurs in the first second. Scrolling from the top moves content 1:1 with the scroll in the first 47px.
8. D10: a scripted sequence (pointer over the image, out across the pane, back in, out; and a reload with the pointer over the image) shows an image while over it and leaves the pane closed after leaving. The user repeats their sweep.
9. D1: with JavaScript disabled (sandboxed `srcdoc` iframe, as in BP1), a collection page offers filter checkboxes, a price range and sort, and submitting them changes the URL and the product list.
10. D2: with JavaScript disabled, a cart page quantity change plus the update submit changes the line quantity. With JavaScript on, the cart page still updates live.
11. Validators: `npm.cmd run lint:theme`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax` and `npm.cmd run lint:i18n` pass; `npm.cmd run test:layout -- --widths 390,768,1024,1440` reports 0 new issues; any existing JS unit test touching `assets/https.js` passes.
12. The Ask review reports PASS.

**History.** Planned 2026-10-27 from backlog group 7 (user: complete group 7 before LS2). Authorized 2026-10-27 for an external execution prompt (user: "这些给外部执行prompt吧").

**Results.**

(none yet)
