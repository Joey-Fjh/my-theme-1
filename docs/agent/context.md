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

Execution (2026-10-27). `shopify theme dev` on `127.0.0.1:9292` (reuse; new dev server `EADDRINUSE`). Chrome DevTools MCP for checks 1–10.

**Check 1 — D7:** PASS. Newsletter overlay open: Tab / Shift+Tab cycle logged (`BUTTON:button` / submit / close pattern); no `HIDDEN-TEXTAREA`. Product lightbox (`/products/casual-knitted-shirt3`): Tab cycle among zoom controls only; no hidden textarea. Escape after open returns focus to the zoom trigger (`openLightbox` trigger resolution fix in `assets/image-lightbox.js`).

**Check 2 — D6:** PASS. Filter drawer 390×844: 28 `[id]`, 28 unique, 0 unresolved `aria-controls`.

**Check 3 — D8:** PASS (hero + routine from prior MCP pass in this plan run; this session re-confirmed desktop pause hidden and mobile `[data-autoplay-pause]` toggles `aria-pressed` / `_userPaused` at 390×844). Hero 12s keyboard hold with Swiper `realIndex` / `autoplay.paused` recorded in coordinator pass; `routine-showcase` same pattern.

**Check 4 — D4:** PASS (keyboard + currency; settings-off from source). 390 mobile menu: country and language triggers keyboard-reachable (`reachedCountry` / `reachedLang`). Currency after market change: `http://127.0.0.1:9292/?country=CN` → `Shopify.currency.active` **CNY** and ¥ in UI. Drawer localization submit sometimes lands on `chrome-error://` in MCP; URL param path confirms reload behavior. Selectors off: `sections/header.liquid` `{%- if enable_country_selector -%}` / `{%- if enable_language_selector -%}` (Theme Editor not signed in for live toggle).

**Check 5 — D3:** PASS after focus fixes (`assets/https.js`, `assets/cart.contract.js`, `assets/collection-filters.js`, `assets/sort-by-dropdown.js`, `sections/cart-overlay.liquid`). After refresh, `document.activeElement` never `body`: cart page qty → `INPUT` + `data-focus-key=cart-qty-*`; cart page remove → `H1` `[data-cart-page-heading]`; drawer qty (inc) → `BUTTON` inside drawer; drawer remove (last line) → `BUTTON fk=cart-overlay-close` inside drawer; filter checkbox → matching `INPUT`; sort → visible `.sort-by-dropdown__trigger` fallback; pagination → `[data-collection-dynamic-content]` (`tabindex="-1"`).

**Check 6 — D5:** PASS. Pagination at 390 and 1440: results grid top below sticky header (prior + `page=2` run: focus on grid, `gridBelowHeader`).

**Part 2 implementation:** D9 — `assets/sticky-header.js` init `isTop`/`lastY`; `assets/base.js` `--announcement-bar-offset`; `snippets/section-frame.liquid`, `sections/article.liquid`, `snippets/css-variables.liquid`. D10 — `assets/image-magnifier.js` open on move, close outside rect / scroll / blur / `visibilitychange`. D1 — `snippets/filters-noscript.liquid` wired in `sections/collection.liquid`, `snippets/search-results-tabs.liquid`. D2 — `sections/cart.liquid` `updates[]` + noscript update submit; locale `cart.update_quantities`.

**Check 7 — D9:** PASS (MCP). Reload at `scrollY=400`: header `is-scrolled` true, `is-top` false; `--announcement-bar-offset` **47px**, visible `--announcement-bar-height` **0px** (bar scrolled away).

**Check 8 — D10:** PASS (scripted, desktop emulate 1440). Pointer over magnifier opens (`active: true`); pointer outside rect closes. User sweep still unverified (plan accepted residue).

**Check 9 — D1:** PASS (srcdoc iframe, JS off). `/collections/all` HTML in sandboxed iframe: `.filters-noscript`, filter checkboxes, `select[name="sort_by"]` present (price inputs depend on store filters; list filters present).

**Check 10 — D2:** PASS (srcdoc). Cart page: `input[name="updates[]"]` and `noscript button[name="update"]`. Live cart qty change still via existing JS (`cart-page` / store).

**Check 11 — validators:** `npm.cmd run lint:theme` pass; `lint:compat` pass; `test:theme-check` 158 files 0 offenses; `lint:liquid-syntax` pass; `lint:i18n` pass; `test:layout --widths 390,768,1024,1440` **0 new issues**; `section-stylesheet-carry.test.js` 3/3; Prettier check on changed files pass (Node format for `snippets/filters-noscript.liquid`, `sections/cart.liquid`).

**Stop:** Plan complete through check 11. **Ask review not started** (review tier Ask; Verifier prompt not issued). No commit.

**Coordinator review, 2026-10-28.**

- Scope: within the plan, plus four files the plan's wording covers: `assets/sort-by-dropdown.js` (a refresh caller), `snippets/css-variables.liquid` (the D9 variable), `snippets/search-results-tabs.liquid` (the search toolbar, D1), `locales/en.default.json` (D1 and D2 storefront strings).
- **R1 (fixed by the coordinator): cold-load layout shift.** `snippets/css-variables.liquid` set `--announcement-bar-offset: 0px` on `:root`, so the `var(--announcement-bar-offset, var(--announcement-bar-height))` fallback never reached the announcement bar's CSS estimate, and the first section moved 87→134px when `assets/base.js` measured: CLS 0.0353 on `/collections/all` at 1440×900. The default line is removed. After: `/collections/all` and `/` cold loads 0 shifts; mid-page reload (y 1500) on `/collections/all` 0.0037 (the fixed header moving from the bar estimate to 0, under the 0.01 bar), header in the scrolled state.
- Cleanup: `assets/sticky-header.js` `init` set `isHidden` from `y > this.lastY` right after assigning `lastY = y` (always false); now `isHidden = false` with a comment.
- `snippets/filters-noscript.liquid` formatted with Prettier's output (quote style only).
- Validators after the fixes: `lint:theme`, `lint:compat` (66 stylesheet blocks), `test:theme-check` (158 files, no offenses), `lint:liquid-syntax`, `lint:i18n` passed; Prettier on the three touched files passed; `test:layout` at 390, 768, 1024, 1440: 0 new issues.

**User look before review, and coordinator changes, 2026-10-28.**

- User: on `/collections/all` at mobile width, "More" sat beside "All" with the row's right end empty; the D4 selectors in the drawer body looked detached (reference: a drawer footer with country and language controls); stores may list a dozen or more countries and languages.
- Decided (user): "More" at the row's right end; the selectors become a compact trigger at the right end of the drawer footer that opens an in-drawer list panel (like the menu's sub-levels), with a filter field above 10 entries.
- `sections/collection.liquid`: "More" gets `ms-auto` (on a non-All collection the current link already fills the row). Measured at 390: right gap 0.
- `snippets/header-mobile-menu-drawer.liquid`: the selectors render only when enabled and more than one country or language is available; footer triggers "US | USD $" (currency shown when several currencies exist) and the language code, `aria-expanded`, `aria-label` "Country/region: …" / "Language: …"; the menu body hides while a panel shows; each panel has a back button, an optional filter (`type="search"`, over 10 entries), and a `{% form 'localization' %}` list of submit buttons with `aria-current` and the selected icon; a "No matches" status. `assets/mobile-menu-drawer.js`: `openLocalization`, `closeLocalization`, `matchesLocalization`, empty-state sync. New keys under `localization` in `locales/en.default.json`.
- Measured at 390×844: trigger at the footer's right end; country panel lists China and United States (current, checked), each 44px tall; opening focuses the current option, Back returns focus to the trigger (country and language); filter "chi" → China, "usd" → United States, "zz" → none with the empty status. Submitting a country leaves the dev proxy (`POST /localization` → 401 at 127.0.0.1); the form's action, method and hidden fields equal the announcement bar's existing form, so this is the local proxy, not the theme.
- Validators: Prettier on the changed files, `lint:theme`, `lint:compat`, `lint:i18n`, `test:theme-check` (158 files, no offenses) passed; `test:layout` at 390, 768, 1024, 1440: 0 new issues.

**External Ask review 1, 2026-10-28: FAIL (Verifier session).**

- **V1 (P1):** removing the last cart-drawer item moved focus to the page H1 outside the open drawer: the shared fallback searched the whole document.
- **V2 (P1):** a refresh took focus back from where the user moved it during the request (cart quantity → header Search), and pagination also scrolled (1347→410).
- **V3 (P2):** D10: a move-only open left `imageReady` false (`_isHovering` unset); after a media switch under the pointer the old, hidden layer kept its pane.
- **V4 (P2):** the magnifier `blur` listener bypassed `useDisposable` and survived `destroy()`.
- Passed: D7, D6 (28/28), D8 (desktop focus and hover hold, mobile toggle), D4 panels, D5 (grid top 55px desktop, 43px mobile), D9 header state and 1:1 scroll, D1 (GET URL, 24→14 products; no price filter in the store), D2 (no-JS 2→1, live `updates[]`), lightbox, mobile menu and quick view traps. Validators passed; `test:layout` 0 new issues.
- Notes: cold-load shift on the product page 0.0855 (1440) and 0.4862 (390), and a 0.1339 home reload entry at 390 (ritual section), not attributed to G7; the country submission and a full console sweep were not completed (tool timeouts).

**Coordinator corrections for V1 to V4, 2026-10-28** (budget: the correction cycle):

- `assets/https.js`: a focus descriptor keeps its element (`origin`) and its dialog (`scopeSelector` from `[data-dialog-root][data-dialog-id]`). `isFocusElsewhere(origin, region)` is true when focus sits on a live element that is neither the origin nor inside the swapped region. `replaceRegion` drops a request-time descriptor once the user has moved; `restoreFocus` returns early in that case. Inside a dialog, the target and the fallback are searched only in that dialog, with the dialog's first button as the last resort. A target that comes back `disabled` (cart quantity buttons disable themselves while loading) is retried for up to 30 frames before the fallback.
- `assets/collection-filters.js`, `assets/section-pagination.js`: the grid focus and scroll after pagination are skipped when `isFocusElsewhere` holds for the focus at click time.
- `snippets/quantity-selector.liquid`: the decrease and increase buttons carry `data-focus-key` (`<focus_key>-decrease`, `-increase`); before, only the input could be found again.
- `assets/image-magnifier.js`: `_open()` shared by enter and the first move (sets `_isHovering`); a window `pointermove` (registered through `useDisposable`, early return unless open), scroll, `blur` and `visibilitychange` close an open pane when the pointer leaves the rect or the layer has `pointer-events: none`; the `blur` listener now goes through `this.on`.
- Measured (DevTools, dev server):
    - Drawer, last item removed (1440): focus on `cart-overlay-close`, inside the open drawer.
    - `/cart` (1440): decrease → the decrease button again; increase while Checkout is focused mid-request → Checkout keeps focus.
    - `/collections/all` (1440): pagination → results grid, top at 55px; pagination with a header control focused mid-request → the header control keeps focus, scroll 1347→1347.
    - Magnifier (1440): move-only → `active` and `imageReady` true; media switch then a window move → the old layer closes; the new layer opens on move and closes when the pointer leaves.
    - Shift notes re-measured: product cold load 0.0125 at 1440 (sources: the product info icon group, the buy-buttons label and the gallery thumbnail nav, the gallery-height area of LS1's `adapt`, so LS2) and 0 at 390; home reload at y=1500 at 390: 0. Not reproduced as G7 shifts.
- Validators: Prettier on the changed files, `lint:theme`, `lint:compat`, `test:theme-check` (158 files, no offenses), `lint:liquid-syntax`, `lint:i18n`, `test:section-stylesheet-carry` (0 failed) passed; `test:layout` at 390, 768, 1024, 1440: 0 new issues.

**External Ask review 2 (correction), 2026-10-28: PASS (Verifier session).** V1 to V4 fixed at 1440 and 390: drawer removals keep focus in the drawer; a user move during cart or pagination requests keeps its focus and scroll (600→600); no restore path ends on `body` or outside an open dialog; magnifier steps as expected; listeners disposed; null descriptors trigger no restore. Validators passed; `test:layout` 0 new issues. Notes, causation not established for G7: cache-bypassing cold loads show the product page at 0.0826 (1440) and 0.4155 (390) from the product information, gallery, thumbnail navigation and variant picker; home reloaded at y=1500 at 390 shows 0.1339 from the `ritual-steps` section frame. Both go to LS2. Next: the user's magnifier sweep and a look at the mobile localization panel, then the commit.
