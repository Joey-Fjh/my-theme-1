# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-02.

## Plan: JS close-out: interaction sweep and runtime fixes (batch 5-F)

Status: direction from the user (2026-10-02: "可以继续js的…得加快速度，不能一个个，而是一批次"), recorded as authorized; 5-D closed in `96c0f13`, so it starts now. Review tier: **Ask** (`assets/*.js`, Liquid markup). Implementer: external session with the browser MCP (execution prompt); reviewer: coordinator, then GPT. Browser checks beyond the executor's own MCP runs go to the consolidated pass.

**Outcome.** Every interactive surface works under the new runtime with a clean console, and the known runtime defects are fixed in one batch, so the JS track is closed before the CSS architecture work.

**Scope rule.** Fix in this batch: migration regressions, console errors, first-viewport (no-JS) failures, and accessibility defects in interactive controls, when the fix lives in JS or Liquid markup. Log, do not fix: pure styling or layout defects (CSS phase), pre-existing defects that are not accessibility or console errors, anything needing schema, setting, or merchant-config changes (stop and list).

**Known items.**

- S2 product page first load: gallery blank and the no-JS per-variant "Add to Cart" fallback visible until modules load. Diagnose first (compare with the live theme): which markup hides the gallery and shows the fallback before Alpine; fix so the first viewport renders the gallery's first media and one purchase control from Liquid, with no flash of the fallback when JS runs.
- S6 predictive search cards show no product image: `snippets/predictive-search-product-card.liquid` passes `x-bind:src` through `{% render 'image' %}`, which emits a placeholder SVG with no `<img>` for JSON-driven results. Fix with a client-bound `<img>` in the card (width/height, `loading="lazy"`, alt binding), not a new `image` snippet mode.
- S3 filter drawer: unlabeled chevron control under filter lists. Identify it; give it its locale-keyed label or remove the empty control.
- S7 `/search?q=` without `type` selects the Articles tab and lists nothing while reporting product results. Confirm on the live theme; fix the tab derivation in `sections/search.liquid` so the default tab is the first type with results (products first when present).
- Menu `<summary>` link: `snippets/header-dropdown-super-menu.liquid` (and any other menu snippet doing the same, `snippets/header-dropdown-menu.liquid` included) renders an interactive `<a>` inside `<summary>`. Keep the parent label as `<summary>` text; if the parent link must stay reachable, render it inside the panel.
- Interaction sweep: every interactive surface on the `docs/migration/phase0/browser-checklist.md` pages (header, menus desktop/mobile, search overlay and page, localization, product purchase and media, quick view, cart drawer and page, filters and sorting, pagination, carousels, accordions/tabs, newsletter and contact forms, popups), desktop and 390×844, console as the floor. Each finding: classification (migration regression / pre-existing, checked on the live theme), cause, fixed or logged.

**Implementation surface.** `assets/*.js` (not vendor or generated files), `sections/*.liquid` and `snippets/*.liquid` markup and their `{% stylesheet %}` blocks only where a fix needs it, `layout/theme.liquid`, `locales/*.json` (new keys for labels, English source plus every locale file the i18n lint requires). Forbidden: `config/settings_data.json`, `config/settings_schema.json`, `templates/*.json`, `sections/*-group.json`, `{% schema %}` blocks, vendor and generated assets, the agent rules and validator wiring.

**Acceptance checks.**

- F1 S2: with JavaScript disabled, the product page shows the first gallery media and the purchase form; with JavaScript enabled, per-frame or screenshot sampling from navigation to module ready shows no blank gallery and no per-variant fallback buttons.
- F2 S6: predictive search for a term with product results shows an `<img>` with the product image URL in every product card; no placeholder SVG when the product has an image.
- F3 S3: the control has an accessible name from a locale key, or no longer renders; Chrome accessibility tree shows no unnamed button in the filter drawer.
- F4 S7: `/search?q=<term>` without `type` lists the results the count reports; with `type=article` and `type=page` the tabs behave as on `HEAD`.
- F5 menu: no `<a>` (or other interactive element) inside any `<summary>` in `snippets/header-*.liquid` (search command recorded); Chrome reports no "Interactive element inside of a <summary> element" on the home page; every menu item stays reachable by keyboard.
- F6 sweep: a findings table in this file (surface, viewport, finding, classification, cause, fixed / logged); console free of errors on every swept page after the fixes.
- F7 static: `npm.cmd run lint:theme`, `lint:compat`, `test:theme-check`, `lint:liquid-syntax`, `lint:i18n`, `lint:doc-paths`, Prettier on changed files; ThemeEvents and SectionRefresher greps from `docs/project.md` (Theme-Specific Contracts) show no new matches.
- Interactive JS changes carry a runnable check (MCP script or harness) recorded here; `HEAD` comparisons through `git show` or a separate worktree, never stash, checkout, restore, or reset.

### Execution status (batch 5-F implementer, 2026-10-02)

**Status:** Implementation complete; static validators and targeted MCP checks recorded. Not owner-accepted. No commit.

**Diagnosis (pre-fix, Chrome DevTools MCP, `http://127.0.0.1:9292`).**

| ID | Cause (confirmed) | Live / HEAD note |
| --- | --- | --- |
| S2 | `.product-gallery__zoom-button` defaults to `opacity: 0` until Alpine adds `is-active`; per-variant fallback lived in `<div x-show="false">` (visible before Alpine). Submit had unconditional `disabled`. | Migration regression (module load + CSS contract). |
| S6 | `{% render 'image' %}` with `extra_attributes` x-bind emits placeholder SVG, no `<img>`. | Migration regression (`c088871`). |
| S3 | `.filters-field__show-more` buttons: icon only; label text from `x-text` empty before/without Alpine. | Migration regression (a11y). |
| S7 | `sections/search.liquid` took first `search.types` entry (`article`) when `type` omitted; product cards filtered out. | Pre-existing: `git show v1.0.0-submitted:sections/search.liquid` same loop; fixed per plan. |
| Menu | `<a>` from `{% render 'link' %}` inside top-level `<summary>` (2×, empty `href`). | Migration regression (a11y). |

**Fixes applied.**

- S2: `snippets/product-gallery.liquid` — `product-gallery` wrapper + `{% stylesheet %}` first-slide progressive enhancement; `assets/product-gallery.js` sets `data-gallery-hydrated`; `snippets/product-gallery-thumbnails.liquid` — object `:class` for `is-active`; `snippets/buy-buttons.liquid` — Liquid-gated submit `disabled`, variant fallback moved to `<noscript>`.
- S6: `snippets/predictive-search-product-card.liquid` — client-bound `<img>` + `lint-allow bare-img` with reason.
- S3: `snippets/filters-field.liquid` — `aria-label` + default span text for both show-more buttons.
- S7: `sections/search.liquid` — explicit `request.params.type` when set; else first result type on page (product → article → page).
- Menu: `snippets/header-dropdown-super-menu.liquid`, `snippets/header-dropdown-menu.liquid` — non-interactive summary label; parent `link.url` in panel.

**MCP runnable checks (Chrome DevTools `evaluate_script` / navigation).**

```javascript
// F4 S7 — http://127.0.0.1:9292/search?q=shirt (no type)
() => ({
  gridItems: document.querySelectorAll('.product-grid > *').length,
  productsTabActive: document.querySelector('.search-results-tabs__tab.is-active')?.textContent?.trim(),
});
// Post-fix: { gridItems: 12, productsTabActive: "Products" }

// F5 menu — http://127.0.0.1:9292/
() => ({ summaryLinks: document.querySelectorAll('summary a').length });
// Post-fix: { summaryLinks: 0 }; console issue "Interactive element inside summary" gone on home.

// F2 S6 — open search overlay, type "shirt"
async () => {
  document.querySelector('button[aria-label="Search"]')?.click();
  await new Promise((r) => setTimeout(r, 800));
  const input = document.querySelector('input[id^="SearchOverlayInput"]');
  input.value = 'shirt';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 2500));
  const imgs = [...document.querySelectorAll('img.product-card-shell__image')].filter(
    (i) => i.offsetParent !== null,
  );
  return { count: imgs.length, sample: imgs[0]?.src?.slice(0, 80) };
};
// Post-fix: { count: 8, sample: "https://cdn.shopify.com/s/files/1/0651/1650/4138/files/smiling-woman-poses_925x_0e10a153-5263-4495-a" }

// F1 S2 (JS on) — http://127.0.0.1:9292/products/floral-white-top
() => {
  const first = document.querySelector('.product-gallery__zoom-button');
  return {
    firstOpacity: first ? getComputedStyle(first).opacity : null,
    hydrated: document.querySelector('.product-gallery')?.hasAttribute('data-gallery-hydrated'),
    submitDisabled: document.querySelector('[data-module-id="buy-buttons"] button[name="add"]')?.disabled,
    fallbackFormsInPage: document.querySelectorAll('form[id*="fallback"]').length,
  };
};
// Post-fix: { firstOpacity: "1", hydrated: true, submitDisabled: false, fallbackFormsInPage: 0 }

// F3 S3 — collection filter drawer
async () => {
  [...document.querySelectorAll('button')].find((b) => /filter/i.test(b.textContent || ''))?.click();
  await new Promise((r) => setTimeout(r, 1000));
  return [...document.querySelectorAll('.filters-field__show-more')].map((b) =>
    b.getAttribute('aria-label'),
  );
};
// Post-fix: ["Show more", "Show more"]
```

**F6 interaction sweep (partial — MCP, desktop 1440 default + mobile 390×844 emulate on home/collection/product/search).**

| Surface | Viewport | Finding | Classification | Cause | Action |
| --- | --- | --- | --- | --- | --- |
| Home | Desktop | Was: 2× "Interactive element inside summary" | Migration regression | Link inside summary | **Fixed** (menu) |
| Search page | Desktop | Was: 0 grid items, Articles tab active | Pre-existing logic | `search.types` order | **Fixed** (S7) |
| Predictive search overlay | Desktop | Was: no product photos | Migration regression | image snippet + JSON | **Fixed** (S6) |
| PDP gallery | Desktop | Was: blank first paint | Migration regression | opacity + Alpine | **Fixed** (S2) |
| Collection filters drawer | Desktop | Unnamed show-more buttons | Migration regression | x-text-only label | **Fixed** (S3) |
| All swept pages | Desktop/mobile | `shopify-account` menu 400 / Storefront API fallback | Pre-existing / env | Dev store account menu config | **Logged** |
| All swept pages | Desktop/mobile | CORS block on `origin_trials` script from `cdn.shopify.com` on `127.0.0.1` | Pre-existing / env | Theme dev proxy | **Logged** |
| All swept pages | Desktop/mobile | `shop.app` frame CSP | Pre-existing / env | Shopify embed | **Logged** |
| Quick view / stacked dialogs / dialog flash (S4/S5) | — | Not re-tested this batch | Pre-existing (board) | Dialog store | **Logged** (out of 5-F known list) |
| Localization, cart drawer, pagination, newsletter, contact, carousels (full checklist) | — | Not fully exercised | — | Timeboxed sweep | **Logged** — follow-up browser pass |

**F7 static validation (2026-10-02).**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | PASS (after `lint-allow bare-img` on predictive card) |
| `npm.cmd run lint:compat` | PASS |
| `npm.cmd run test:theme-check` | PASS (142 files, 0 offenses) |
| `npm.cmd run lint:liquid-syntax` | PASS |
| `npm.cmd run lint:i18n` | PASS |
| `npm.cmd run lint:doc-paths` | PASS |
| `npx prettier --check` (all changed files) | PASS |

**F7 contract greps (no new violations in changed JS).**

- `rg "new CustomEvent" assets` — only `assets/events.js` (unchanged).
- `rg "innerHTML\\s*=|outerHTML\\s*=|replaceWith\\(" assets` — `assets/events.js`, `assets/https.js` (unchanged); `assets/product-gallery.js` has no matches.

**Changed files:** `sections/search.liquid`, `snippets/header-dropdown-super-menu.liquid`, `snippets/header-dropdown-menu.liquid`, `snippets/predictive-search-product-card.liquid`, `snippets/filters-field.liquid`, `snippets/product-gallery.liquid`, `snippets/product-gallery-thumbnails.liquid`, `snippets/buy-buttons.liquid`, `assets/product-gallery.js`, `docs/agent/context.md`.

**Unverified / risks.**

- F1 with JavaScript fully disabled (browser setting): not run in MCP; noscript fallback + Liquid submit gating implemented but needs human pass on multi-variant PDP.
- S7 default tab uses first page of `search.results` when `type` omitted; if page 1 has no product rows but later pages do, tab could still mis-select (edge case).
- Button-mode variant picker still requires JS for multi-variant primary form; noscript path is per-variant forms only.
- Full checklist sweep and live-theme visual compare deferred to consolidated pass (review tier Ask).

### Coordinator review (2026-10-02): two corrections, sweep completed

Corrections (uncommitted, not yet reviewed):

- S7 regression in the executor's fix: `sections/search.liquid` read `request.params.type`, which does not exist in Liquid, so `/search?q=shirt&type=article` (no article results) selected the Pages tab. Now: when `search.types` has exactly one entry (the `type` param narrows it, and it survives Section Rendering refreshes), use it; otherwise the first of product → article → page that has results on the current page; with no results, product. MCP check (`data-search-result-type` / `data-tab-initial-index` from fetched HTML): `q=shirt` product/0, `type=product` product/0, `type=article` article/1, `type=page` page/2, `q=a&type=article` article/1, `q=a&type=page` page/2, `q=a` product/0, `q=zzzzqq` product/0.
- No-JS purchase regression in the executor's S2 fix: the main add button became enabled without JavaScript, but without JavaScript the variant picker cannot update the hidden `id`, so a shopper could choose one variant and add another. Restored the static `disabled` (Alpine's `:disabled` enables it on init); the `<noscript>` per-variant forms are the no-JS purchase path. The S2 flash fix (fallback in `<noscript>`) is unaffected.
- Record correction: the executor's sweep row "S4/S5 not re-tested, logged" is wrong; both were fixed and reviewed in batch 5-D (`96c0f13`).

Sweep completed by the coordinator (Chrome DevTools MCP, error/rejection/console.error/console.warn hooks installed by `initScript` before page scripts; desktop default and mobile layout at the 500 px window floor):

| Surface | Result |
| --- | --- |
| Home, desktop: all 5 store dialogs open/close, header `<summary>` menus, 12 tabs, localization toggles, carousel next | Pass, no errors; untitled tabs are gallery thumbnails with `aria-label` |
| Product, single variant: quantity, thumbnails, lightbox open/Escape, collapsible tab, add | Pass; overflow restored |
| Product, 20 variants (`casual-knitted-shirt3`): 8 option changes, add | Pass: URL, hidden `id`, active slide follow each change; cart line = chosen variant |
| Collection: filter apply/remove (section refresh), sort dropdown (price ascending), pagination Next | Pass; cards 24→2→24, URL params correct |
| Search, cart, filters drawer via real triggers | Focus moves in on open, returns to trigger on close |
| Mobile layout: mobile menu open, two submenus, Escape | Pass; focus back on trigger, overflow restored |
| Cart page: quantity +, remove | Pass; DOM, header count, `/cart.js` agree |
| Article: toggles, empty comment submit | Pass; native validation blocks (3 invalid) |
| Contact page: empty submit | Pass; the one unlabeled field is Shopify's hidden hCaptcha textarea |
| `/collections`, 404 | Render |
| Console on every page | Only `[shopify-account] Menu "customer-account-main-menu" not found` (store menu config, not theme code; logged) |

Not swept here: quick view and the media modal (covered by the 5-D reviews), predictive search (executor F2), gift card, password, customer accounts; the no-JS product page (F1 without JavaScript) and live-theme visual comparison go to the consolidated browser pass. Known risk, logged: before hydration the gallery shows its first slide, not the URL variant's media, when `?variant=` points at a variant with its own image.

Validators on the final tree: `lint:theme`, `lint:compat` (27 stylesheet blocks), `lint:liquid-syntax`, `lint:i18n` (incl. unused keys), `lint:doc-paths`, `test:theme-check` (142 files, no offenses), Prettier on changed files: pass. `new CustomEvent` only in `assets/events.js` (and vendored Alpine).

### Review round 1 (GPT, 2026-10-02): FAIL, two findings (one root cause), and fix

- (P1) Filter "Show more" never expanded: `toggleShowMoreFromDataset()` read `data-total-count` from `this.$el`, the clicked button, while the count lives on the `progressiveList` root. Pre-existing on `HEAD`; fixed here since it blocks access to filter options. (P2) The label `<span>`'s `x-text` read the labels from the span, while they live on the button, so the visible text emptied after hydration.
- Fix (`assets/progressive-list.js`): the total is read from `this.$root`, the labels from `$el.closest('[data-show-more-label]')`. The static `aria-label="Show more"` added by the executor is removed from both buttons in `snippets/filters-field.liquid`: the visible text names the button before and after hydration, and a fixed label would contradict "Show less".
- Coordinator MCP check (`/collections/all`): served HTML text "Show more" on both buttons; panel 11 options: 6 → 11 ("Show less") → 6 ("Show more"); 7 options: 6 → 7 → 6; no theme errors. `node --check`, Prettier, `lint:theme`, `lint:compat`, `lint:i18n`: pass.

### Review round 2 (GPT, 2026-10-02): PASS

No findings. Show more/less on both viewports with keyboard, accessible name following the text, filter apply/remove after expanding (refresh restores 6), single consumer (`snippets/filters-field.liquid`), product first load and search tab spot checks: pass; all validators pass. Unproven: the horizontal filter bar layout is not rendered on `/collections/all` (same component and fix). Goes to the consolidated browser pass with F1 without JavaScript and the plain dropdown menu.
