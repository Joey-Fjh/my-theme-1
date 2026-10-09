# JavaScript Runtime Reference

This reference stores JavaScript runtime public contracts that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file when implementing or reviewing JavaScript runtime behavior, module loading, lifecycle code, Alpine components or stores, ThemeEvents, ShopifyHttp, SectionRefresher, Liquid rendering features, or script load order.

Inspect current source for exact method lists, tuning constants, and implementation internals.

## Architecture

The Skeleton runtime is a no-bundler ES module graph. Liquid markup declares behaviour; the core discovers roots from the DOM and loads component modules on demand. Third-party UI libraries are touched only through the adapter.

| Layer | Files | Loading | Responsibility |
| --- | --- | --- | --- |
| Core | `base.js`, `events.js` | Static | Layout measurement, module scanning and lazy loading, DOM teardown coordination, Theme Editor event forwarding, store bootstrap |
| Adapter | `alpine.adapter.js` | Static | Sole Alpine touchpoint: `define`, `holdUntilReady`, `mount`, `releaseHold`, `unmount`, `store`, `data` |
| Platform state | `cart.contract.js`, `https.js` | Static | Cart API ownership hydrated from `body.dataset.initialCart`, and the HTTP / Section Rendering helpers it depends on |
| UI state bridges | `alpine.store.cart.js` | Static | Cart UI store registered by the core through the adapter |
| On-demand modules | `utils.js`, feature entry files (`accordion.js`, `buy-buttons.js`, …) | Dynamic | Shared utilities and Alpine factories, imported when markup asks for them |

Every file marked Static is reached from `base.js` through a static `import`, so it downloads and parses on every page regardless of what the page renders. Only the last row uses dynamic `import()`. Keep the static graph small; measure file sizes when a change adds a static import.

The core does not import component names. It reads `data-module-id` on DOM roots, resolves the identifier through the import map in `snippets/scripts.liquid`, and calls dynamic `import()`.

## Script Load Order

`layout/theme.liquid` renders `snippets/scripts.liquid` once in `<head>`, before `content_for_header`; the snippet loads, in order (`lint:theme` fails when the layout does not render it or the snippet has no parsable import map):

1. Import map — bare specifiers such as `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, and one specifier per feature module (`accordion`, `buy-buttons`, `cart-page`, …).
2. One module entry — `<script type="module" src="{{ 'base.js' | asset_url }}">`.
3. One classic vendor script — `vendor-alpine.min.js` (Alpine MUST run after the module entry so the core can register its init interceptor and queue store registration first).

There is no classic path for theme stores, utilities, or component definitions. The one page outside this graph is `templates/gift_card.liquid`: it renders without the layout and loads Shopify's `qrcode.js` and `assets/gift-card.js` as classic `defer` scripts. GSAP and Swiper are selected libraries; vendored files are added only when an accepted consumer exists, with the version recorded at vendoring time. Shopify injects the `es-module-shims` polyfill when needed; the theme ships none.

## Module Discovery Contract

Component roots declare a module identifier and an Alpine factory name:

```html
<footer
    x-data="accordion"
    data-module-id="accordion"
    data-module-lazy
></footer>
```

Each feature file (for example `buy-buttons.js`) imports shared helpers it needs, calls `define(name, factory)` from `alpine-adapter`, and exports nothing the core reads directly.

A module's definition arrives asynchronously, while Alpine resolves an `x-data` name synchronously when it initializes an element. The core therefore checks at the moment of initialization, not beforehand: `base.js` registers one init interceptor through `adapter.holdUntilReady()`, and Alpine calls it for every element it is about to initialize, on every path: the first page walk, content cloned from `x-for`, `x-if`, and `x-teleport` templates, HTML inserted by `SectionRefresher` or the Theme Editor, and explicit mounts. When the element is a `[data-module-id]` root whose module has not loaded, the interceptor holds it (Alpine skips its directives and subtree), imports the module once, and mounts it through `adapter.mount(el)` when the module has defined its factory. A root whose import fails stays held; mounting it would only produce expression errors. Markup declares lazy-load intent with the boolean attribute `data-module-lazy`: such a root is held until it nears the viewport, then imported. The core reads that attribute and does not hold a list of module names.

`scanModules()` only downloads ahead: it starts importing the modules of non-lazy roots already in the DOM, and of a held root's descendants, so they are ready or nearly ready when Alpine reaches them. It never holds or mounts anything, and a root it misses still loads through the interceptor. A module may also import the modules its templates render (for example `countdown-timer.js` imports `flip-digit`) to avoid the first-render wait; that is a performance choice, not a correctness requirement.

Correctness of theme JavaScript must never depend on scanning the DOM and on a lint check that keeps the markup scannable: asynchronous paths are too many to enumerate, and the interceptor covers them all. Scanning `data-*` markers remains appropriate only for progressive enhancement whose miss degrades gracefully, such as motion targets (`data-motion-*`).

Pass Liquid-driven runtime values through `data-*`, then read `this.$el.dataset` inside the component factory. Do not embed Liquid JSON or quote-heavy values directly in `x-data`.

Alpine attributes hold simple expressions: a component method call, a state read, or a binding object or ternary. Statements, declarations, control flow, arrow functions, and Liquid output belong in the component factory or in `data-*`. `lint:theme` fails on them.

```html
<!-- Don't: logic and Liquid inside the attribute -->
<div @click="let link = $event.target.closest('a'); if (link) { $event.preventDefault(); loadUrl(link.href); }"></div>
<p x-text="errors['{{ item.key | escape }}']"></p>

<!-- Do: call a component method; pass the Liquid value through data-* -->
<div @click="onNavClick($event)"></div>
<p data-line-key="{{ item.key | escape }}" x-text="errors[$el.dataset.lineKey]"></p>
```

The method lives in the factory that `define` registers (for example `onNavClick` in `assets/section-pagination.js`).

## Adapter API

Only `alpine.adapter.js` may call `window.Alpine` APIs.

| Export | Purpose |
| --- | --- |
| `define(name, factory)` | Registers `alpine.data(name, factory)` before or during startup |
| `holdUntilReady(shouldHold)` | Registers an `Alpine.interceptInit` callback; when `shouldHold(el)` returns true the element gets `x-ignore` and Alpine skips it and its subtree |
| `mount(el)` | Removes the hold and calls `Alpine.initTree(el)` |
| `releaseHold(el)` | Removes the hold without initializing, so Alpine meets the element again if it is reinserted |
| `unmount(el)` | Calls `Alpine.destroyTree(el)` |
| `store(name, value?)` | Registers or reads a global Alpine store |
| `data(el)` | Reads reactive state bound to `el` |

Component modules call `define` themselves. The core never holds a manifest of component names. Alpine owns component teardown: Alpine 3 registers `destroy()` cleanup on each `x-data` root and calls `destroyTree()` when the root leaves the document. Component factories that own resources should implement `destroy()`; factories that only expose `useDisposable()` must bridge with `destroy() { this.dispose(); }`.

## ThemeEvents

Cross-section and cross-component communication must use `ThemeEvents`. Import the default export from the `events` import-map specifier:

```javascript
import ThemeEvents from 'events';

ThemeEvents.emit(ThemeEvents.events.PRODUCT_VARIANT_CHANGED, { variant });

const off = ThemeEvents.on(ThemeEvents.events.PRODUCT_VARIANT_CHANGED, (e) => {
    console.log(e.detail.variant);
});

const scope = ThemeEvents.createScope({ target: el });
scope.on('click', handler);
scope.dispose();
```

Predefined event names live in `ThemeEvents.events` inside `events.js`. When adding new cross-component events, add them there.

Do not use bare `document` listeners in Liquid or ad-hoc globals for cross-component signalling.

## Module Lifecycle And Theme Editor Forwarding

The core coordinates module roots through Alpine's init interceptor, not a component registry.

| Responsibility | Owner |
| --- | --- |
| Hold a root until its module is defined, then mount it | `holdForModule()` in `base.js`, registered through `adapter.holdUntilReady()` |
| Download ahead on first load and on `shopify:section:load` / `:reorder` | `scanModules()` in `base.js` |
| Lazy load when a root carries `data-module-lazy` | `IntersectionObserver` in `base.js`, started by `holdForModule()` |
| Held-root release on DOM removal | One `MutationObserver` in `base.js` calls `releaseModuleRoots()` for removed nodes still detached when it runs (a root moved within one task stays held and observed); it stops the lazy observer and drops the hold through `adapter.releaseHold()`, so a root reinserted later is held again from a clean state |
| Alpine teardown on owned DOM replacement | `SectionRefresher.replaceRegion()` calls `adapter.unmount()` before swapping markup, then `scanModules()` (download ahead) and `adapter.mount()`; roots whose modules are still loading are held by the interceptor |
| Alpine teardown on Theme Editor section unload | `shopify:section:unload` handler in `base.js` calls `adapter.unmount()` on every module root in the unloaded section and `releaseModuleRoots()` |
| Theme Editor select/deselect/reorder | In `Shopify.designMode` only, `base.js` listens for native Shopify events such as `shopify:section:select` and forwards them to affected `[data-module-id]` roots — including ancestor module roots when the selected block is nested inside the root — as project-owned `theme:editor:*` events through `ThemeEvents.emit(..., { target: root })` |

Platform editor events and forwarded project events use different names. The core listens on the platform vocabulary; components subscribe only to the forwarded vocabulary on their own root:

```javascript
ThemeEvents.on(ThemeEvents.events.SHOPIFY_SECTION_SELECT, handler, { target: el });
// SHOPIFY_SECTION_SELECT resolves to 'theme:editor:section-select', not 'shopify:section:select'
```

Theme Editor `select` / `deselect` are interaction events, not component-instance lifecycle methods.

## ShopifyHttp And SectionRefresher

Import from the `https` import-map specifier:

```javascript
import ShopifyHttp, { SectionRefresher, HttpError } from 'https';

const data = await ShopifyHttp.getJSON('/cart.js');
const result = await ShopifyHttp.postJSON('/cart/add.js', { items: [...] });

SectionRefresher.render(sectionHtmlMap, {
    cart: {
        targetSelector: '#shopify-section-cart',
        innerSelectors: ['.cart-items', '.cart-total'],
    },
});

SectionRefresher.updateText([{ selector: '.cart-count', text: '3' }]);
```

Application HTTP must use `ShopifyHttp`; raw `fetch()` belongs only in `assets/https.js` or vendor files. Section HTML replacement must use `SectionRefresher.render()`.

After a section refresh, `SectionRefresher` rescans module roots inside the replaced region and remounts through the adapter lifecycle.

When `innerSelectors` is set, the refresher clones only those descendants from the Section Rendering response. Shopify nests `<style data-section-stylesheet>` inside the `#shopify-section-<id>` wrapper; the `innerSelectors` path carries that style node from the parsed Section Rendering document into the live section when the response includes one. The lookup is document-scoped (`doc.querySelector('style[data-section-stylesheet]')`) and does not depend on `targetSelector` shape, so callers that pass an inner element as `targetSelector` receive the stylesheet the same way as wrapper-target callers. The full-section path (`innerSelectors` empty) already copies the wrapper `innerHTML` and carries the style; do not extend the document-scoped lookup to that path.

The live `innerSelectors` callers are the collection and blog sections. They declare selectors in markup through `data-pagination-selectors`, which `assets/section-pagination.js` hydrates before `buildDomMap()` passes them to the refresher. Collection pagination mounts `sectionPagination()` at the section root with `data-module-id="section-pagination"`. Before judging this path unused, search for `data-pagination-selectors` and for other dataset-driven configuration, not only for call arguments.

### Transitional status

`SectionRefresher` remains transitional while retained flows depend on Section Rendering API behavior. It is the required mechanism today; removing or replacing it requires an approved alternative with explicit lifecycle, accessibility, error, and history ownership. Transitional status does not authorize removal or schedule a replacement.

## Liquid Rendering Features

The Liquid `{% block %}` and `{% partial %}` tags are not required baseline dependencies of this project. Adopting either requires a separately approved decision. Ceylune composes storefront pages with **section** blocks only; it does not ship skeleton-style Theme Blocks. See `docs/project.md` (Deviations From The Skeleton).

Any approved `{% partial %}` trial must be low risk and verify:

- ordinary rendering
- Theme Editor behavior
- accessibility state
- request races
- Alpine lifecycle
- custom component lifecycle

## Cart State Ownership

Platform cart state lives in `cart.contract.js`. The contract hydrates from `document.body.dataset.initialCart`, mutates through the Cart API, and notifies subscribers.

The Alpine `$store.cart` bridge in `alpine.store.cart.js` mirrors contract state into reactive UI properties and owns merchant-facing error copy. Mutation failures normalize into `err.displayMessage`; each caller renders that message beside its own control. The cart page is the only built-in cart presentation. Storefront cart mutations must go through `$store.cart` (which delegates to the contract), not direct Cart API calls from component code.

Cart error copy is configured from `body` `data-cart-error-*` attributes rendered in `layout/theme.liquid` and read during `setupStores()` in `base.js`.

Action feedback (add to cart success, quantity limits, cart line errors, contact form success) stays local to the triggering control or form through button state, inline messages, and polite `aria-live` regions — not a global notification layer.

## Global UI Stores

The core registers stores during startup:

| Store | Module | Role |
| --- | --- | --- |
| `cart` | `alpine.store.cart.js` | UI bridge over `createCartContract()` |
| `dialog` | `dialog.js` | Global modal and drawer layer (`open`, `close`, stacking) |

Inspect the store module for configure/init APIs instead of copying historical examples.

### Dialog layer

The `dialog` store in `dialog.js` owns every `ui-dialog` shell and shared media modal root. Call sites use `open(id)` and `close()` (or `close(id)` when the handler must target a specific root). Compatibility fields: `active` is the top level id; `closing` is the top level id while its exit animation runs.

- **Replace by default.** Opening a dialog while another is open dismisses lower levels unless the new root declares `data-dialog-stack` and the current top is not already closing.
- **Declared stacking.** Only roots with `data-dialog-stack` (for example `snippets/product-media-modal.liquid`) push onto the stack. Escape, backdrop, and close buttons dismiss the top level only; focus returns to the opener on the level below.
- **Visibility helpers.** `isShown(id)` is true for open or closing levels (use in `x-show`). `isOpen(id)` is true for every open, non-closing level.
- **Scroll lock.** One lock for the whole stack: lock when the stack becomes non-empty, unlock when it empties. The store passes `lockScroll: false` to `playEnter` in `dialog-motion.js` and `drawer-motion.js`, so store dialogs never lock through motion. `image-lightbox.js` is not a store dialog: it locks through `playEnter` and unlocks once on close, both through the counted `lockScroll` / `unlockScroll` in `dialog-motion.js` that the store also uses.
- **Exit motion ownership.** `playExit` ends at animation completion without clearing motion attributes. The store removes the level from the stack; Alpine applies the `x-show` hide in the next animation frame, so the store clears the motion state one frame after that, and skips the clear when the level is shown again meanwhile. `image-lightbox.js` follows the same hide-then-clear order. A level removed without its exit animation (`forceClose`, or a replaced dialog) is cleared the same way. After `forceClose`, a lower level that stays open takes the focus trap back, and focus returns to the lowest removed level's opener, or into the remaining top level when that opener is gone. A dialog that replaces the one it was opened from (for example the cart drawer after add to cart in quick view) returns focus, when it closes, to the replaced dialog's opener on the page. A caller that opens a dialog after focus has moved (an async add to cart) passes the control that asked for it: `open(id, { opener })`; `buy-buttons.js` does.

## Shared Modules

| Module | Import specifier | Role |
| --- | --- | --- |
| `utils.js` | `utils` | `debounce`, `prefersReducedMotion`, `useDisposable()` |
| `quantity-constraints.js` | relative `./quantity-constraints.js` from feature files | Pure quantity min/max/step math |
| `performance.js` | dynamic import from `base.js` when `?debug=true` or `Shopify.designMode` | Debug-only CWV logging |

## One outlet per side effect

`lint:theme` keeps a single owner for each runtime side effect in `assets/*.js` (except `vendor-*`, `*.min.js`, and `gift-card.js`):

| API | Owner |
| --- | --- |
| `window.Alpine` / `Alpine.` | `alpine.adapter.js` |
| `fetch(` / `XMLHttpRequest` | `https.js` |
| `/cart/` paths and `routes.cart_` | `cart.contract.js` |
| Global listeners: `document.addEventListener` / `window.addEventListener` | `base.js`, `events.js`, `https.js`, `utils.js`, `alpine.adapter.js` |
| `new CustomEvent` (`js-custom-event`) | `events.js` |
| `innerHTML =`, `outerHTML =`, `.replaceWith(` (`js-section-mutation`) | `https.js` |

`gift-card.js` renders outside the module graph (`templates/gift_card.liquid`) and is excluded from these outlet checks. It uses classic `defer` scripts and may attach `document` listeners directly.

Components may read the DOM (`document.querySelector`, `this.$el`). Only global listeners belong to the core; components use `ThemeEvents` or Alpine `.window` / `.document` modifiers instead.

## Module graph contracts

- Every `x-data` root carries `data-module-id` on the same opening tag. The identifier has an import-map entry that maps through `asset_url` to the asset named after it (`accordion` → `accordion.js`); a missing or mismapped entry is a browser `TypeError` or a silently wrong module.
- Every import-map entry maps through `asset_url` to a file that exists in `assets/`.
- Every import-map entry is referenced by a `data-module-id` or a static `import` in `assets/*.js`.
- Below-the-fold or non-critical modules should carry `data-module-lazy`; the core loads them through `IntersectionObserver`.
- Preload a first-viewport module chain only when the page truly needs it before interaction (for example `modulepreload` on the product form chain, or preload on hover for a predictable next step). Do not preload every module on every page.
- The cart contract and `base.js` stay in the static graph because derived themes keep cart drawer or redirect logic on every page.

Alpine remains the deliberate UI runtime for this theme; do not add parallel Web Components for the same responsibilities.

## Motion Runtime Boundary

GSAP is optional narrative choreography only. The vendored runtime loads on demand through `assets/motion-gsap.js`; only that adapter touches `window.gsap` and `window.ScrollTrigger`. Consumer entry modules (currently `scatter-gallery.js`) must use one `gsap.context()` per root, revert it in `destroy()`, gate on `body[data-motion-enabled='false']`, and use `gsap.matchMedia()` for reduced motion. Read `docs/references/architecture/motion-architecture.md` for classification and transform ownership.

## CSS / Alpine Boundary

- Alpine owns state and trigger behaviour through adapter-registered factories and stores.
- `tailwind.animates.css` owns animation capability CSS.
- GSAP on-demand loading and transform ownership follow **Motion Runtime Boundary** above; do not duplicate that policy here.

## File Ownership

Illustrative map of core outlets and a few feature modules. The full module inventory is the import map in `snippets/scripts.liquid` (every `data-module-id` and static `import` in `assets/*.js`).

| Area | Location |
| --- | --- |
| Vendor runtime | `vendor-alpine*.min.js` (never edit) |
| Core | `base.js`, `events.js` |
| Adapter | `alpine.adapter.js` |
| Cart contract | `cart.contract.js` |
| Feature modules | `accordion.js`, `buy-buttons.js`, `cart-page.js`, `dropdown.js`, `localization-switcher.js`, `product-gallery.js`, `quantity-selector.js`, `section-pagination.js`, `variant-picker.js` — each holds its Alpine factory and `define()` call |
| Alpine stores | `alpine.store.cart.js` |
| HTTP and section refresh | `https.js` |
| Shared utilities | `utils.js`, `quantity-constraints.js` |
| Gift card (outside module graph) | `gift-card.js` |

## Inspection Rule

For section lifecycle, cart flow, HTTP refresh, events, accessibility semantics, and script loading, inspect current `layout/theme.liquid`, `sections/`, `snippets/`, and `assets/` implementations.
