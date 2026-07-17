# JavaScript Runtime Reference

This reference stores JavaScript runtime details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when implementing or reviewing JavaScript runtime behavior, lifecycle code, Alpine components or stores, ThemeEvents, ShopifyHttp, SectionRefresher, Swiper, explicitly approved narrative motion runtime, or script load order.

## Namespace

All theme runtime objects live under `window.__Theme__`:

| Property                            | Module                 | Purpose                         |
| ----------------------------------- | ---------------------- | ------------------------------- |
| `__Theme__.Events`                  | `events.js`                 | Typed event bus (`ThemeEvents`) |
| `__Theme__.Components`              | `base.js`                   | Section/block lifecycle engine  |
| `__Theme__.ThemePerformance`        | `performance.js`            | Debug-only CWV monitoring       |
| `__Theme__.AlpineComponentsFactory` | `alpine.components.js`      | Alpine component registry       |
| `__Theme__.QuantityConstraints`     | `quantity-constraints.js`   | Pure quantity min/max/step math |

Additional globals:

| Global                           | Module     | Purpose                |
| -------------------------------- | ---------- | ---------------------- |
| `window.ShopifyHttp`             | `https.js` | HTTP client singleton  |
| `window.ShopifyHttpError`        | `https.js` | Error constructor      |
| `window.ShopifySectionRefresher` | `https.js` | Section HTML rendering |

## Script Load Order

```text
 1.  vendor-swiper.min.js
 2.  utils.js
 3.  quantity-constraints.js
 4.  events.js
 5.  alpine.components.js
 6.  alpine.components.ui.js
 7.  alpine.components.header.js
 8.  alpine.components.pagination.js
 9.  alpine.components.filters.js
10.  alpine.components.product.js
11.  alpine.components.product-media.js
12.  alpine.components.product-cards.js
13.  alpine.components.search.js
14.  alpine.components.overlays.js
15.  alpine.components.registry.js      <- merges groups into window.__Theme__.AlpineComponents
16.  performance.js
17.  https.js
18.  base.js
19.  alpine.store.js
20.  alpine.store.toast.js
21.  alpine.store.dialog.js
22.  alpine.store.cart.js
23.  alpine.store.registry.js           <- merges/registers stores
24.  vendor-alpine-intersect.min.js
25.  vendor-alpine.min.js               <- MUST be last
```

Constraints:

- `vendor-alpine.min.js` MUST be last.
- Registry files (`*.registry.js`) load after their respective groups.
- `base.js` loads after `https.js` and component definitions.
- Store files load before `vendor-alpine.min.js`.

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

Predefined events:

| Constant                           | Value                                    | Description                          |
| ---------------------------------- | ---------------------------------------- | ------------------------------------ |
| `COMPONENT_UNMOUNTED`              | `theme:component:unmounted`              | Component DOM node removed           |
| `HEADER_MENU_ACTIVE_CHANGED`       | `theme:header:menu:active-changed`       | Mega-menu open/close                 |
| `PRODUCT_VARIANT_SET_REQUEST`      | `theme:product:variant:request:set`      | Request to set a variant externally  |
| `PRODUCT_VARIANT_CHANGED`          | `theme:product:variant:changed`          | Variant selection changed            |
| `PRODUCT_GALLERY_SLIDE_TO_REQUEST` | `theme:product-gallery:request:slide-to` | Request gallery to slide to an index |
| `PRODUCT_QUANTITY_CHANGED`         | `theme:product:quantity:changed`         | Quantity input changed               |
| `PRODUCT_MEDIA_MODAL_ACTIVATE`     | `theme:product-media-modal:activate`   | Request product media modal focus    |

When adding new cross-component events, add them to `ThemeEvents.events` in `events.js`.

## ShopifyHttp API

```javascript
const http = window.ShopifyHttp;

const data = await http.getJSON('/cart.js');

const result = await http.postJSON('/cart/add.js', { items: [...] });

const response = await http.request('/some-url', {
    method: 'POST',
    timeout: 5000,
    params: { section_id: 'cart' },
});
```

Features: timeout handling, abort support, request/response interceptors, structured `ShopifyHttpError`.

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

## Data Attribute Example

Pass Liquid values through `data-*`, then read `this.$el.dataset` inside a registered component.

```html
<div
    data-product-url="{{ product.url }}"
    data-variant-id="{{ current_variant.id }}"
    data-section-id="{{ section.id }}"
    x-data="VariantPicker()"
></div>
```

Do not embed Liquid JSON or strings directly in `x-data`.

```html
<div x-data="VariantPicker('{{ product.url }}', {{ product | json }})"></div>
```

## Component Engine Pattern

Every section needing JS must follow this pattern in a `{%- javascript -%}` block:

```javascript
(function () {
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register(
        'my-section',
        {
            init(el) {
                return {};
            },
            destroy(el, state) {
                // Clean up listeners, observers, timers, Swiper, GSAP contexts, etc.
            },
        },
        { lazy: true },
    );
})();
```

Required DOM attributes on the component root:

```html
<section
    data-component-kind="section"
    data-component-type="my-section"
    data-component-id="{{ section.id }}"
></section>
```

`Components.register(type, handlers, options)`:

| Param               | Type                    | Required | Description                                   |
| ------------------- | ----------------------- | -------- | --------------------------------------------- |
| `type`              | `string`                | yes      | Matches `data-component-type` in the DOM      |
| `handlers.init`     | `(el) => state \| void` | yes      | Setup and return cleanup state                |
| `handlers.destroy`  | `(el, state) => void`   | yes      | Teardown side effects                         |
| `handlers.select`   | `(el, state) => void`   | no       | Theme editor select hook                      |
| `handlers.deselect` | `(el, state) => void`   | no       | Theme editor deselect hook                    |
| `options.lazy`      | `boolean`               | no       | If true, init waits for viewport intersection |

## Alpine Component Pattern

Reusable Alpine behaviors are defined in `alpine.components.js` (base factory) and grouped files (`alpine.components.*.js`). `alpine.components.registry.js` merges all groups into `window.__Theme__.AlpineComponents`.

```javascript
AlpineComponentsFactory.register('myComponent', function () {
    return {
        init() {
            const config = this.$el.dataset;
        },
        dispose() {
            // Called automatically on unmount.
        },
    };
});
```

`AlpineComponentsFactory.useDisposable()` provides listener and observer cleanup helpers for side-effectful components.

### Ordinary Motion Reveal Pattern

Ordinary content/media reveal should be implemented as an Alpine behavior plus CSS rules, not as GSAP and not as `x-intersect` scattered across every target.

Preferred shape:

- Register a reusable Alpine behavior such as `motionRevealSection` in an appropriate `alpine.components.*.js` group.
- Each `x-data="motionRevealSection()"` instance is independent on the section root (`data-motion-section`), but the implementation should use a module-level shared `IntersectionObserver` singleton.
- Use a registry such as a `WeakMap` to map observed reveal targets to their intersection callbacks.
- Observe each visible `[data-motion-reveal]` target individually; the section root owns lifecycle, not intersection.
- Mark reveal targets with `data-motion-reveal="content"` or `data-motion-reveal="media"`.
- Optional `data-motion-cascade` on a wrapper auto-assigns `--motion-index` to visible descendant targets.
- The Alpine component sets per-target `data-motion-state="pending"` / `"revealed"`, handles page-load double-rAF reveal for initially intersecting targets, and reads `body[data-reveal-behavior]` for once vs always.
- `tailwind/tailwind.animates.css` owns body setting selectors, target styles, keyframes, duration/ease variables, reduced-motion, and motion-disabled behavior.
- Do not reuse `base.js`'s component lazy-init `IntersectionObserver` for visual reveal; component lifecycle and visual reveal are separate concerns.

`x-intersect` is available through the Alpine Intersect plugin and may be used for isolated simple cases. It is not the preferred architecture for broad ordinary reveal coverage because motion policy, cleanup, and performance are easier to control through one shared observer behind the Alpine behavior.

## Alpine Store Pattern

Global stores are defined in `alpine.store.js` and grouped files (`alpine.store.*.js`). `alpine.store.registry.js` merges and registers all stores into Alpine. Stores are initialized in `base.js`.

```javascript
this.$store.toast.show('Message', 'success');
this.$store.dialog.open('cart-overlay');
this.$store.cart.add([{ id: variantId, quantity: 1 }]);
```

Available stores:

| Store           | Purpose          | API                                                       |
| --------------- | ---------------- | --------------------------------------------------------- |
| `$store.toast`  | Notifications    | `show(message, type, duration)`, `remove(id)`             |
| `$store.dialog` | Modal management | `open(id)`, `close()`                                     |
| `$store.cart`   | Cart state       | `add()`, `change()`, `clear()`, `fetchCart()`, `update()` |

## Utils Pattern

```javascript
const Utils = window.__Theme__.Utils;

const throttledFn = Utils.rafThrottle(callback);
throttledFn.dispose();

const debouncedFn = Utils.debounce(callback, 500);
debouncedFn.dispose();
```

Available utilities:

| Function              | Purpose             | Usage                            |
| --------------------- | ------------------- | -------------------------------- |
| `rafThrottle(fn)`     | RAF-based throttle  | Scroll handlers, resize handlers |
| `throttle(fn, delay)` | Time-based throttle | Event handlers                   |
| `debounce(fn, wait)`  | Debounce            | Search input, resize handlers    |

Always call `.dispose()` in component `destroy()` to prevent memory leaks.

## Custom JS File Ownership

| File                            | Type        | Purpose                                                                                                                              |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `vendor-*.min.js`               | Third-party | DO NOT EDIT                                                                                                                          |
| `utils.js`                      | Custom      | Utility functions                                                                                                                    |
| `events.js`                     | Custom      | ThemeEvents event bus                                                                                                                |
| `alpine.components.js`          | Custom      | Base Alpine component factory                                                                                                        |
| `alpine.components.*.js`        | Custom      | Grouped Alpine component definition files                                                                                            |
| `alpine.components.registry.js` | Custom      | Merges component groups into `window.__Theme__.AlpineComponents`                                                                     |
| `performance.js`                | Custom      | Debug CWV monitoring                                                                                                                 |
| `https.js`                      | Custom      | HTTP client and SectionRefresher                                                                                                     |
| `base.js`                       | Custom      | Component engine and Alpine init                                                                                                     |
| `alpine.store.js`               | Custom      | Base Alpine store definitions                                                                                                        |
| `alpine.store.*.js`             | Custom      | Grouped Alpine store definitions                                                                                                     |
| `alpine.store.registry.js`      | Custom      | Merges/registers stores into Alpine                                                                                                  |

## Motion Runtime

The current theme has no active GSAP runtime, no `motion.js`, and no `__Theme__.Motion` namespace.

Ordinary motion uses semantic `data-motion-*` hooks, Alpine components such as `motionRevealSection()`, and CSS rules in `tailwind/tailwind.animates.css`.

Do not add GSAP, `data-gsap-*`, `Motion.*`, or a new motion runtime during ordinary Motion cleanup. If complex narrative GSAP is explicitly approved later, document that runtime in a dedicated future change.

## Swiper Pattern

```javascript
init(el) {
    const swiperContainer = el.querySelector('.swiper');
    if (!swiperContainer || typeof Swiper === 'undefined') return;
    const swiper = new Swiper(swiperContainer, {
        loop: true,
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: { crossFade: true },
    });
    return { swiper };
},
destroy(el, state) {
    if (state?.swiper?.destroy) state.swiper.destroy(true, true);
}
```

## Anti-Patterns

| Bad                                                  | Correct                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Inline `<script>` with DOM listeners                 | `Components.register()` inside `{%- javascript -%}`                                         |
| `document.addEventListener('DOMContentLoaded', ...)` | Component `init()` -- the engine handles timing                                             |
| `document.querySelector(...)` at top level           | `el.querySelector(...)` scoped inside `init(el)`                                            |
| Raw `fetch()` in application code                    | `window.ShopifyHttp.getJSON()` / `.postJSON()`                                              |
| Manual section `innerHTML` after AJAX                | `window.ShopifySectionRefresher.render()`                                                   |
| Custom CSS in `<style>` tags                         | Tailwind utility classes                                                                    |
| Liquid values directly in `x-data="..."`             | `data-*` attributes + `this.$el.dataset`                                                    |
| Cross-component event via `new CustomEvent(...)`     | `ThemeEvents.emit(type, detail)`                                                            |
| Raw `<svg>` pasted in Liquid                         | `{%- render 'icons', icon: 'icon-name' -%}` via icon pipeline                               |
| Manually editing `assets/icon-*.svg`                 | Generate from `icons/` via `npm.cmd run build:svg` after checking for existing equivalent icons |
