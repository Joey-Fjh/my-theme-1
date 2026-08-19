# JavaScript Runtime Reference

This reference stores JavaScript runtime public contracts that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when implementing or reviewing JavaScript runtime behavior, lifecycle code, Alpine components or stores, ThemeEvents, ShopifyHttp, SectionRefresher, Swiper, explicitly approved narrative motion runtime, or script load order.

Inspect current source for exact method lists, tuning constants, and implementation internals.

## Namespace

All theme runtime objects live under `window.__Theme__`:

| Property | Module | Purpose |
| --- | --- | --- |
| `__Theme__.Events` | `events.js` | Typed event bus (`ThemeEvents`) |
| `__Theme__.Components` | `base.js` | Section/block lifecycle engine |
| `__Theme__.ThemePerformance` | `performance.js` | Debug-only CWV monitoring |
| `__Theme__.AlpineComponentsFactory` | `alpine.components.js` | Alpine component registry |
| `__Theme__.QuantityConstraints` | `quantity-constraints.js` | Pure quantity min/max/step math |
| `__Theme__.DialogMotion` | `dialog-motion.js` | Shared dialog transition helper |
| `__Theme__.DrawerMotion` | `drawer-motion.js` | Shared drawer transition helper |

Additional globals:

| Global | Module | Purpose |
| --- | --- | --- |
| `window.ShopifyHttp` | `https.js` | HTTP client singleton |
| `window.ShopifyHttpError` | `https.js` | Error constructor |
| `window.ShopifySectionRefresher` | `https.js` | Section HTML rendering |

## Script Load Order

`layout/theme.liquid` loads deferred scripts in dependency order. Invariants:

- `vendor-alpine.min.js` MUST be last.
- Registry files (`*.registry.js`) load after their respective groups.
- `base.js` loads after `https.js` and component definitions.
- Store files load before `vendor-alpine.min.js`.

Inspect `layout/theme.liquid` for the current ordered list.

## ThemeEvents API

```javascript
const Events = window.__Theme__.Events;

Events.emit(Events.events.PRODUCT_VARIANT_CHANGED, { variant });

const off = Events.on(Events.events.PRODUCT_VARIANT_CHANGED, (e) => {
    console.log(e.detail.variant);
});

const scope = Events.createScope({ target: el });
scope.on('click', handler);
scope.dispose();
```

Predefined events live in `events.js`. When adding new cross-component events, add them to `ThemeEvents.events`.

## ShopifyHttp API

```javascript
const http = window.ShopifyHttp;

const data = await http.getJSON('/cart.js');
const result = await http.postJSON('/cart/add.js', { items: [...] });
```

Application HTTP must use `window.ShopifyHttp`; raw `fetch()` belongs only in `assets/https.js` or vendor files.

## SectionRefresher API

```javascript
window.ShopifySectionRefresher.render(sectionHtmlMap, {
    cart: {
        targetSelector: '#shopify-section-cart',
        innerSelectors: ['.cart-items', '.cart-total'],
    },
});

window.ShopifySectionRefresher.updateText([{ selector: '.cart-count', text: '3' }]);
```

Shopify section HTML replacement must use `window.ShopifySectionRefresher.render()`.

## Data Attribute Contract

Pass Liquid values through `data-*`, then read `this.$el.dataset` inside a registered component. Do not embed Liquid JSON or quote-heavy values directly in `x-data`.

## Component Engine

JS behavior needing lifecycle management must use `Components.register()` inside `{%- javascript -%}`.

Required DOM attributes on the component root:

```html
<section
    data-component-kind="section"
    data-component-type="my-section"
    data-component-id="{{ section.id }}"
></section>
```

`Components.register(type, handlers, options)`:

| Param | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `string` | yes | Matches `data-component-type` in the DOM |
| `handlers.init` | `(el) => state \| void` | yes | Setup and return cleanup state |
| `handlers.destroy` | `(el, state) => void` | yes | Teardown side effects |
| `handlers.select` | `(el, state) => void` | no | Theme editor select hook |
| `handlers.deselect` | `(el, state) => void` | no | Theme editor deselect hook |
| `options.lazy` | `boolean` | no | If true, init waits for viewport intersection |

Inspect `assets/base.js` and existing sections for the current registration pattern.

## Alpine Components And Stores

Reusable Alpine behavior must be registered via `AlpineComponentsFactory.register()` in the appropriate `alpine.components.*.js` file. `alpine.components.registry.js` merges groups into `window.__Theme__.AlpineComponents`.

Global stores are defined in `alpine.store.*.js` and registered through `alpine.store.registry.js`. Storefront cart mutations and cart UI state must go through `$store.cart`.

Inspect the grouped `alpine.components.*.js` and `alpine.store.*.js` files for current APIs instead of copying historical examples.

## Motion Runtime Boundary

Ordinary motion uses semantic `data-motion-*` hooks, Alpine components such as `motionRevealSection()`, and CSS rules in `tailwind/tailwind.animates.css`.

The current theme has no active GSAP runtime or `__Theme__.Motion` namespace. Do not add GSAP during ordinary motion cleanup. Read `docs/references/architecture/motion-architecture.md` for classification and ownership.

## Swiper Ownership

Swiper instances created in `Components.register()` must be destroyed in `destroy()`. Inspect existing carousel sections for the current pattern.

## CSS / Alpine / GSAP Boundary

- Alpine owns state and trigger behavior.
- `tailwind.animates.css` owns animation capability and reveal CSS.
- GSAP is optional narrative choreography only and must not share `opacity` or `transform` ownership with Alpine/CSS on the same element.

## File Ownership

| Area | Location |
| --- | --- |
| Vendor runtime | `vendor-*.min.js` (never edit) |
| Utilities | `utils.js` |
| Events | `events.js` |
| Alpine components | `alpine.components.js`, `alpine.components.*.js`, `alpine.components.registry.js` |
| Alpine stores | `alpine.store.js`, `alpine.store.*.js`, `alpine.store.registry.js` |
| HTTP and section refresh | `https.js` |
| Component engine and Alpine init | `base.js` |

## Inspection Rule

For section lifecycle, cart flow, HTTP refresh, events, accessibility semantics, and CSS layering, inspect current `sections/`, `snippets/`, and `assets/` implementations instead of deleted cookbook examples.
