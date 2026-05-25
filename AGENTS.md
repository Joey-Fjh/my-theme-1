# Agent Instructions

This document defines the architecture constraints for this Shopify theme.
Any AI agent modifying code in this repository MUST follow these rules.

For sub-skill details, see files in `skills/`.

---

## Document Hierarchy

`AGENTS.md` (this file) is the canonical source of truth for repository-wide rules.

Use sibling documents only as supporting references:

- `skills/code-review/pre-merge.md` -> review checklist
- `skills/code-review/THEME_STORE_AUDIT_SUMMARY.md` -> current Theme Store audit snapshot
- `skills/contracts/runtime-modules.md` -> runtime module contracts and extension boundaries
- `skills/examples/` -> canonical implementation examples for agents

If any supporting document conflicts with this file, `AGENTS.md` wins.

---

## Rule Strength

This document uses rule strength deliberately:

- **MUST**: hard constraint. Fix violations during cleanup unless a documented infrastructure exception applies.
- **SHOULD**: default project preference. Follow it unless the local code context proves it is a poor fit.
- **MAY**: allowed pattern. Do not report or rewrite it as a violation.
- **Infrastructure exception**: low-level implementation files may use lower-level browser APIs to provide the project abstraction. Application code should still use the abstraction.

When cleaning legacy code, do not treat a rule as absolute unless this document says it is absolute for that file type and use case.

---

## Project Overview

This is a custom Shopify theme built on:

- **Tailwind CSS v4** (CSS-based config, `@theme inline`)
- **Alpine.js v3** (reactive UI state)
- **GSAP + ScrollTrigger** (scroll-triggered animations)
- **Swiper** (carousels)
- **Custom component engine** (`Components.register()` in `base.js`)
- **Custom event bus** (`ThemeEvents` in `events.js`)
- **Custom HTTP layer** (`ShopifyHttp` + `SectionRefresher` in `https.js`)

No bundler is used. All scripts load via `defer` in `layout/theme.liquid`.

---

## JavaScript Rules

For new JavaScript and cleanup work, first check the canonical examples in `skills/examples/`. They show the preferred minimal shape for this theme; the rules below remain authoritative.

### Golden Rules

1. NEVER write inline `<script>` tags or bare DOM listeners.
2. Section/block JS behavior that needs lifecycle management MUST go through `Components.register()` inside a `{%- javascript -%}` block.
3. Reusable Alpine component behavior MUST be registered via `AlpineComponentsFactory.register()` in `alpine.components.js`.
4. Cross-component and cross-section communication MUST use `ThemeEvents`; local DOM events inside one component MAY use native or Alpine event bindings.
5. Application-level HTTP requests MUST use `window.ShopifyHttp`; raw `fetch()` is allowed only in the HTTP infrastructure layer and vendor files.
6. Shopify section HTML replacement after AJAX MUST use `window.ShopifySectionRefresher.render()`; local text, class, aria, loading, and open/closed state changes SHOULD use Alpine bindings.

### Runtime Integration Boundaries

Use these boundaries when deciding whether a cleanup is required. `skills/contracts/runtime-modules.md` gives supporting module-level contracts, but `AGENTS.md` remains the source of truth if there is any conflict.

#### Events

- Cross-section and cross-component communication MUST use `ThemeEvents`.
- Local UI events inside a single component MAY use native DOM listeners when they are lifecycle-scoped, or Alpine bindings such as `@click` and `@change`.
- Infrastructure files that implement lifecycle or event infrastructure, such as `events.js` and `base.js`, MAY construct `CustomEvent` objects directly.
- Application sections and snippets SHOULD NOT create ad-hoc `CustomEvent` objects for cross-component behavior; add a typed event to `ThemeEvents.events` instead.

#### Cart State

- Storefront cart mutations and cart UI state MUST go through `$store.cart`.
- Application code MUST NOT call `/cart.js`, `/cart/add.js`, `/cart/change.js`, `/cart/clear.js`, or `/cart/update.js` directly.
- Direct cart endpoint calls are allowed inside `alpine.store.js`, or while explicitly refactoring the cart store itself.
- Reading Liquid-provided initial cart data is allowed when no network request is needed.

#### HTTP

- Application code MUST use `window.ShopifyHttp` for HTTP requests.
- Raw `fetch()` is allowed only inside `assets/https.js`, where `ShopifyHttp` is implemented, and in vendor files.
- Do not bypass `ShopifyHttp` to add one-off timeout, abort, header, or error handling; extend the HTTP layer only when the new behavior is part of its stable contract.

#### DOM Refresh

- Shopify Section Rendering API responses and cart API `sections` responses MUST be rendered with `window.ShopifySectionRefresher.render()`.
- Application code MUST NOT manually assign `innerHTML`, assign `outerHTML`, or call `replaceWith()` for section refreshes.
- Simple text-only updates MAY use `ShopifySectionRefresher.updateText()` when Alpine state is not the right fit.
- Local UI state changes such as loading, visibility, selected state, class toggles, and aria attributes SHOULD use Alpine bindings.
- `SectionRefresher` itself MAY use low-level DOM replacement internally, because it owns Alpine teardown/init and component re-initialization.

### JS Cleanup Decision Tree

When normalizing legacy JavaScript, classify the behavior before changing it:

1. **No interaction or runtime state** -> do not add JavaScript.
2. **Local reactive UI state** -> use a registered Alpine component and pass Liquid configuration through `data-*`.
3. **Third-party library, observer, timer, `window`/`document` listener, or Shopify Theme Editor lifecycle** -> use `Components.register()` with explicit cleanup.
4. **Cross-component state or notifications** -> use an existing Alpine store or `ThemeEvents`; do not read sibling section DOM directly.
5. **HTTP or cart behavior** -> use `ShopifyHttp` or `$store.cart` according to the boundaries above.
6. **Section HTML replacement** -> use `ShopifySectionRefresher.render()` and keep local UI state changes in Alpine.

### Namespace

All theme runtime objects live under `window.__Theme__`:

| Property                            | Module                 | Purpose                         |
| ----------------------------------- | ---------------------- | ------------------------------- |
| `__Theme__.Events`                  | `events.js`            | Typed event bus (`ThemeEvents`) |
| `__Theme__.Components`              | `base.js`              | Section/block lifecycle engine  |
| `__Theme__.ThemePerformance`        | `performance.js`       | Debug-only CWV monitoring       |
| `__Theme__.AlpineComponentsFactory` | `alpine.components.js` | Alpine component registry       |

Additional globals:

| Global                           | Module     | Purpose                |
| -------------------------------- | ---------- | ---------------------- |
| `window.ShopifyHttp`             | `https.js` | HTTP client singleton  |
| `window.ShopifyHttpError`        | `https.js` | Error constructor      |
| `window.ShopifySectionRefresher` | `https.js` | Section HTML rendering |

### Script Load Order

```text
1.  vendor-gsap.min.js
2.  vendor-gsap-scrolltrigger.min.js
3.  vendor-swiper.min.js
4.  utils.js
5.  events.js
6.  alpine.components.js
7.  performance.js
8.  https.js
9.  base.js
10. alpine.store.js
11. vendor-alpine-intersect.min.js
12. vendor-alpine.min.js          <- MUST be last
```

### ThemeEvents API

```javascript
const Events = window.__Theme__.Events;

// Emit
Events.emit(Events.events.PRODUCT_VARIANT_CHANGED, { variant });

// Subscribe (returns unsubscribe function)
const off = Events.on(Events.events.PRODUCT_VARIANT_CHANGED, (e) => {
    console.log(e.detail.variant);
});

// Scoped event group with batch dispose
const scope = Events.createScope({ target: el });
scope.on('click', handler);
scope.dispose(); // removes all listeners in the scope
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

When adding new cross-component events, add them to `ThemeEvents.events` in `events.js`.

### ShopifyHttp API

```javascript
const http = window.ShopifyHttp;

// GET JSON
const data = await http.getJSON('/cart.js');

// POST JSON
const result = await http.postJSON('/cart/add.js', { items: [...] });

// Raw request with options
const response = await http.request('/some-url', {
    method: 'POST',
    timeout: 5000,
    params: { section_id: 'cart' },
});
```

Features: timeout handling, abort support, request/response interceptors, structured `ShopifyHttpError`.

### SectionRefresher API

```javascript
// After fetching section HTML via Section Rendering API:
window.ShopifySectionRefresher.render(sectionHtmlMap, {
    cart: {
        targetSelector: '#shopify-section-cart',
        innerSelectors: ['.cart-items', '.cart-total'],
    },
});

// Simple text updates (no re-fetch needed):
window.ShopifySectionRefresher.updateText([{ selector: '.cart-count', text: '3' }]);
```

### Data Attribute Convention (MANDATORY)

When passing Liquid values to Alpine or JS components, ALWAYS use `data-*` attributes. NEVER embed complex Liquid output directly in `x-data` expressions.

```html
<!-- CORRECT -->
<div
    data-product-url="{{ product.url }}"
    data-variant-id="{{ current_variant.id }}"
    data-section-id="{{ section.id }}"
    x-data="VariantPicker()"
></div>
```

```html
<!-- WRONG -- breaks with quotes, special chars, or JSON in Liquid output -->
<div x-data="VariantPicker('{{ product.url }}', {{ product | json }})"></div>
```

Inside the component, read from `this.$el.dataset`:

```javascript
init() {
    const url = this.$el.dataset.productUrl;
    const variantId = Number(this.$el.dataset.variantId);
}
```

### Component Engine Pattern

Every section needing JS must follow this pattern in a `{%- javascript -%}` block:

```javascript
(function () {
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register(
        'my-section',
        {
            init(el) {
                // setup: GSAP, observers, event listeners
                // MUST return a state object for cleanup
                return {
                    /* references */
                };
            },
            destroy(el, state) {
                // MUST clean up everything
            },
        },
        { lazy: true },
    );
})();
```

#### `Components.register(type, handlers, options)` Parameters

| Param               | Type                    | Required | Description                                   |
| ------------------- | ----------------------- | -------- | --------------------------------------------- |
| `type`              | `string`                | yes      | Matches `data-component-type` in the DOM      |
| `handlers.init`     | `(el) => state \| void` | yes      | Setup and return cleanup state                |
| `handlers.destroy`  | `(el, state) => void`   | yes      | Teardown side effects                         |
| `handlers.select`   | `(el, state) => void`   | no       | Theme editor select hook                      |
| `handlers.deselect` | `(el, state) => void`   | no       | Theme editor deselect hook                    |
| `options.lazy`      | `boolean`               | no       | If true, init waits for viewport intersection |

Required DOM attributes on the component root:

```html
<section
    data-component-kind="section"
    data-component-type="my-section"
    data-component-id="{{ section.id }}"
></section>
```

### Alpine Component Pattern

Reusable Alpine behaviors are defined in `alpine.components.js`:

```javascript
AlpineComponentsFactory.register('myComponent', function () {
    return {
        init() {
            // Read config from data attributes
            const config = this.$el.dataset;
        },
        dispose() {
            // Cleanup -- called automatically on unmount
        },
    };
});
```

`AlpineComponentsFactory.useDisposable()` provides listener and observer cleanup helpers for side-effectful components.

### Alpine Store Pattern

Global stores are defined in `alpine.store.js` and registered in `base.js`:

```javascript
// Access stores in Alpine components
this.$store.toast.show('Message', 'success');
this.$store.dialog.open('cart-overlay');
this.$store.cart.add([{ id: variantId, quantity: 1 }]);
```

#### Available Stores

| Store           | Purpose          | API                                                       |
| --------------- | ---------------- | --------------------------------------------------------- |
| `$store.toast`  | Notifications    | `show(message, type, duration)`, `remove(id)`             |
| `$store.dialog` | Modal management | `open(id)`, `close()`                                     |
| `$store.cart`   | Cart state       | `add()`, `change()`, `clear()`, `fetchCart()`, `update()` |

#### Store Usage Rules

1. Use `$store.toast` for user feedback (success, error, info)
2. Use `$store.dialog` for modal/overlay management
3. Use `$store.cart` for all cart operations (no direct fetch calls)
4. Stores are registered in `base.js` `Main.initAlpine()`

### Utils Pattern

Utility functions are defined in `utils.js`:

```javascript
const Utils = window.__Theme__.Utils;

// Throttle (RAF-based)
const throttledFn = Utils.rafThrottle(callback);
throttledFn.dispose(); // cleanup

// Debounce
const debouncedFn = Utils.debounce(callback, 500);
debouncedFn.dispose(); // cleanup
```

#### Available Utils

| Function              | Purpose             | Usage                            |
| --------------------- | ------------------- | -------------------------------- |
| `rafThrottle(fn)`     | RAF-based throttle  | Scroll handlers, resize handlers |
| `throttle(fn, delay)` | Time-based throttle | Event handlers                   |
| `debounce(fn, wait)`  | Debounce            | Search input, resize handlers    |

#### Utils Usage Rules

1. Use `rafThrottle` for scroll/resize handlers (better performance)
2. Use `debounce` for user input handlers (search, filters)
3. Always call `.dispose()` in component `destroy()` to prevent memory leaks

### Custom JS Files Architecture

#### File Classification

| File                   | Type        | Purpose                                         |
| ---------------------- | ----------- | ----------------------------------------------- |
| `vendor-*.min.js`      | Third-party | **DO NOT EDIT**                                 |
| `utils.js`             | Custom      | Utility functions (throttle, debounce)          |
| `events.js`            | Custom      | Event bus system (`ThemeEvents`)                |
| `alpine.components.js` | Custom      | Alpine component definitions                    |
| `performance.js`       | Custom      | Debug CWV monitoring                            |
| `https.js`             | Custom      | HTTP client (`ShopifyHttp`) + Section refresher |
| `base.js`              | Custom      | Component engine + Alpine init                  |
| `alpine.store.js`      | Custom      | Alpine global stores                            |

#### Custom JS Files Specification

**1. `utils.js` — Utility Functions**

- **Namespace**: `window.__Theme__.Utils`
- **Functions**: `rafThrottle(fn)`, `throttle(fn, delay)`, `debounce(fn, wait)`
- **Usage**: See "Utils Pattern" section above

**2. `events.js` — Event Bus System**

- **Namespace**: `window.__Theme__.Events`
- **API**: `emit(type, detail, options)`, `on(type, handler, options)`, `once(type, handler, options)`, `createScope(options)`
- **Usage**: See "ThemeEvents API" section above

**3. `https.js` — HTTP Client + Section Refresher**

- **Namespace**: `window.ShopifyHttp`, `window.ShopifySectionRefresher`
- **ShopifyHttp API**: `getJSON(url, options)`, `postJSON(url, body, options)`, `request(url, options)`
- **SectionRefresher API**: `render(data, domMap)`, `updateText(updates)`
- **Usage**: See "ShopifyHttp API" and "SectionRefresher API" sections above

**4. `alpine.components.js` — Alpine Component Definitions**

- **Namespace**: `window.__Theme__.AlpineComponentsFactory`
- **Registration**: `AlpineComponentsFactory.register('name', function () { return { init() {}, dispose() {} }; })`
- **Usage**: See "Alpine Component Pattern" section above

**5. `base.js` — Component Engine + Alpine Init**

- **Namespace**: `window.__Theme__.Components`, `window.__Theme__.Base`
- **Components API**: `register(type, handlers, options)`, `initAll(container)`, `destroyAll(container)`
- **Usage**: See "Component Engine Pattern" section above

**6. `alpine.store.js` — Alpine Global Stores**

- **Namespace**: `window.__Theme__.AlpineStores`
- **Stores**: `$store.toast`, `$store.dialog`, `$store.cart`
- **Usage**: See "Alpine Store Pattern" section above

#### Additional Rules

**Alpine Component Encapsulation**:

- NEVER generate inline Alpine functions in Liquid templates
- ALL Alpine components MUST be registered in `alpine.components.js`
- Configuration MUST be passed via `data-*` attributes
- Use double quotes for HTML attributes, single quotes for Liquid tags

**Component Reuse**:

- ALWAYS check `alpine.components.js` for existing components before creating new ones
- If a similar component exists, reuse it or extend it
- NEVER create duplicate functionality

**HTTP and Events Usage**:

- Application HTTP requests MUST use `window.ShopifyHttp`; raw `fetch()` is allowed only in `assets/https.js` and vendor files
- Cross-component events MUST use `ThemeEvents.emit()` or `ThemeEvents.createScope()`
- Shopify section HTML refresh MUST use `ShopifySectionRefresher.render()`
- Simple text updates MAY use `ShopifySectionRefresher.updateText()` or Alpine bindings

**Components.register Usage**:

- Use when a section needs third-party plugins (GSAP, Swiper, etc.), observers, timers, global listeners, or Theme Editor lifecycle hooks
- Simple sections without JS dependencies don't need registration
- ALWAYS return state object from `init()` for cleanup
- ALWAYS implement `destroy()` to clean up resources

### GSAP Animation Pattern

Always guard, use `gsap.context()`, and scope to `el`:

```javascript
init(el) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
        const items = el.querySelectorAll('[data-gsap-item]');
        gsap.set(items, { opacity: 0, y: 30 });
        gsap.to(items, {
            opacity: 1, y: 0,
            duration: 0.5, stagger: 0.15, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true }
        });
    }, el);

    return { ctx };
},
destroy(el, state) {
    if (state?.ctx) state.ctx.revert();
}
```

Mark animation targets with `data-gsap-*` attributes (e.g. `data-gsap-image`, `data-gsap-card`).

### Swiper Integration Pattern

```javascript
init(el) {
    const swiperContainer = el.querySelector('.swiper');
    if (!swiperContainer || typeof Swiper === 'undefined') return;
    const swiper = new Swiper(swiperContainer, {
        loop: true, slidesPerView: 1, effect: 'fade',
        fadeEffect: { crossFade: true }
    });
    return { swiper };
},
destroy(el, state) {
    if (state?.swiper?.destroy) state.swiper.destroy(true, true);
}
```

### Anti-Patterns

| Bad                                                  | Correct                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Inline `<script>` with DOM listeners                 | `Components.register()` inside `{%- javascript -%}`                                         |
| `document.addEventListener('DOMContentLoaded', ...)` | Component `init()` -- the engine handles timing                                             |
| `document.querySelector(...)` at top level           | `el.querySelector(...)` scoped inside `init(el)`                                            |
| Raw `fetch()` in application code                    | `window.ShopifyHttp.getJSON()` / `.postJSON()`                                              |
| Manual section `innerHTML` after AJAX                | `window.ShopifySectionRefresher.render()`                                                   |
| Custom CSS in `<style>` tags                         | Tailwind utility classes                                                                    |
| Liquid values directly in `x-data="..."`             | `data-*` attributes + `this.$el.dataset`                                                    |
| Bare `gsap.to(...)` outside context                  | `gsap.context(() => { ... }, el)` with cleanup                                              |
| Cross-component event via `new CustomEvent(...)`     | `ThemeEvents.emit(type, detail)`                                                            |
| Raw `<svg>` pasted in Liquid                         | `{%- render 'icons', icon: 'icon-name' -%}` via icon pipeline                               |
| Manually editing `assets/icon-*.svg`                 | Generate from `icons/` via `npm run build:svg` after checking for existing equivalent icons |

---

## CSS Rules

For new CSS and cleanup work, first check `skills/examples/canonical-css-layering.md` for the preferred layer choice patterns. The rules below remain authoritative.

### Golden Rules

1. Tailwind utility classes first. No `<style>` blocks in Liquid templates.
2. Use `{% stylesheet %}` only for styles Tailwind cannot express.
3. Reusable patterns go in the appropriate CSS layer file, not inline.
4. NEVER use Tailwind text sizes (`text-lg`, `text-4xl`) for headings -- use `hxxxl`--`h6`.
5. NEVER use responsive prefixes to override a heading tier's built-in font size (e.g., `h1 pc:text-[3.5rem]`). Each heading tier has built-in responsive scaling. You MAY use responsive prefixes to switch between heading tiers when the design calls for a different heading rank on different viewports (e.g., `h2 pc:h1`).

### CSS Cleanup Decision Tree

When normalizing legacy CSS, classify the style before moving or rewriting it:

1. **One-off layout or visual styling** -> use Tailwind utilities directly in the Liquid `class` attribute.
2. **Repeated atomic UI primitive** -> create or reuse an `@utility` in `tailwind/tailwind.elements.css`.
3. **Composite multi-element pattern** -> place the selector rules in `tailwind/tailwind.components.css` under `@layer components`.
4. **Snippet-specific styling** -> place it in `tailwind/tailwind.snippets.css`.
5. **Layout, placement, or container helper** -> place it in `tailwind/tailwind.utilities.css`.
6. **Animation keyframes or animation utilities** -> place them in `tailwind/tailwind.animates.css`.
7. **Section-only CSS that Tailwind cannot express cleanly** -> use `{% stylesheet %}` in that section.

Empty `{% stylesheet %}` blocks MUST be removed during cleanup.

### Arbitrary Value Policy

- Tailwind arbitrary values MAY be used for real layout constraints, such as `max-w-[42rem]`, `grid-cols-[...]`, or calculated viewport sizing.
- Arbitrary values MUST NOT be used to bypass theme tokens for colors, spacing, radius, or shadows when a project token exists.
- Do not introduce hardcoded colors such as `text-[#111]`, `bg-[red]`, or `border-[#ddd]`; use theme tokens or CSS variables.

### Layer Files

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `tailwind/tailwind.input.css`      | Entry point: `@theme inline` token bridge, breakpoints, imports           |
| `assets/base.css`                  | Global reset and structural defaults                                      |
| `tailwind/tailwind.typography.css` | Heading classes (`hxxxl`--`h6`), body text classes (`body-xl`--`body-xs`) |
| `tailwind/tailwind.elements.css`   | Atomic UI: `surface`, `btn`, `field`, `links`, `icons`, `badges`          |
| `tailwind/tailwind.components.css` | Composite patterns: `.dropdown`, `.localization-switcher`, `.rte`         |
| `tailwind/tailwind.snippets.css`   | Snippet-scoped: `.product-info-blocks` and context variants               |
| `tailwind/tailwind.utilities.css`  | Layout helpers: `container-page`, `place-*`                               |
| `tailwind/tailwind.animates.css`   | Motion: keyframes, `icons-animate-*`, `animate-spin-slow`                 |

When adding new CSS:

- Typography utility -> `tailwind.typography.css`
- Atomic design primitive -> `tailwind.elements.css`
- Composite multi-element pattern -> `tailwind.components.css`
- Snippet-scoped style -> `tailwind.snippets.css`
- Layout/placement helper -> `tailwind.utilities.css`
- Animation/transition -> `tailwind.animates.css`

### Breakpoints

| Token | Value   | Prefix                                       |
| ----- | ------- | -------------------------------------------- |
| `pc`  | `48rem` | `pc:` for desktop, `max-pc:` for mobile-only |
| `fw`  | `80rem` | `fw:` for full-width                         |

### Token Flow

```text
Shopify Settings -> snippets/css-variables.liquid -> CSS custom properties
    -> tailwind/tailwind.input.css (@theme inline) -> Tailwind tokens
    -> utility classes in templates
```

### Build Commands

```bash
npm run watch:tw   # development (watch mode)
npm run build:tw   # production build
npm run dev        # shopify theme dev + tailwind watch
```

Output file: `assets/tailwind.output.css` -- NEVER edit manually.

### Typography Specification

#### Element Classification Rules

| Element Type   | Default Styling                 | Usage                               |
| -------------- | ------------------------------- | ----------------------------------- |
| `h1` element   | Native `h1` CSS in `base.css`   | Primary heading (page title)        |
| `h2` element   | Native `h2` CSS in `base.css`   | Secondary heading (section title)   |
| `h3` element   | Native `h3` CSS in `base.css`   | Tertiary heading (subsection title) |
| `h4` element   | Native `h4` CSS in `base.css`   | Quaternary heading                  |
| `h5` element   | Native `h5` CSS in `base.css`   | Quinary heading                     |
| `h6` element   | Native `h6` CSS in `base.css`   | Senary heading                      |
| `p` element    | Body text inherited from `body` | Paragraph text                      |
| `span` element | Body text inherited from `body` | Inline text                         |
| `li` element   | Body text inherited from `body` | List item text                      |
| `td` element   | Body text inherited from `body` | Table cell text                     |

#### Font Size Tier Rules

| Tier         | Usage                                               |
| ------------ | --------------------------------------------------- |
| `hxxxl`-`h0` | Special large headings (rarely used)                |
| `h1`-`h6`    | Standard headings (corresponding to h1-h6 elements) |
| `body-xl`    | Large emphasis text                                 |
| `body-lg`    | Emphasis text                                       |
| `body-md`    | **Default body text**                               |
| `body-sm`    | Auxiliary text                                      |
| `body-xs`    | Footnote, copyright                                 |

#### CSS Inheritance Rules

- `base.css` defines native heading styles for `h1`-`h6`.
- Body text inherits from the `body` element.
- Only explicitly add typography utility classes when the visual tier intentionally differs from the native element default.

#### Semantic Rules

1. Use semantic heading tags (`h1`-`h6`) for headings.
2. Do NOT add redundant matching heading classes such as `<h2 class="h2">`; the native element already carries that default style.
3. Heading utility classes (`hxxxl`-`h6`) MAY be used on heading elements only when visual hierarchy intentionally differs from semantic hierarchy.
4. Non-heading elements (`span`, `div`, `p`, etc.) CANNOT use heading classes.

#### Examples

```html
<!-- CORRECT -->
<body>
    <h1>Page Title</h1>
    <h2>Section Title</h2>
    <p>Paragraph text (inherits body-md)</p>
    <span class="body-sm">Small text</span>
</body>

<!-- CORRECT: semantic h2 with intentionally larger visual tier -->
<h2 class="h1">Featured collection</h2>

<!-- WRONG -->
<span class="h4">Not a heading element</span>
<h2 class="h2">Redundant matching heading class</h2>
```

### Color Specification

#### Rules

1. Use Tailwind tokens when available: `bg-theme-bg`, `text-theme-text`, `border-theme-border`
2. When token doesn't cover, use CSS variable: `style="color: rgb(var(--color-foreground));"`
3. NEVER hardcode color values: `style="color: red;"` is not allowed

#### Available Color Tokens

| Token                 | CSS Variable           | Usage                     |
| --------------------- | ---------------------- | ------------------------- |
| `bg-theme-bg`         | `--color-background`   | Background color          |
| `text-theme-text`     | `--color-foreground`   | Text color                |
| `border-theme-border` | `--color-border`       | Border color              |
| `bg-primary`          | `--color-primary`      | Primary button background |
| `text-primary-text`   | `--color-primary-text` | Primary button text       |

### Inline Style Specification

#### Allowed: Use `style` attribute

1. CSS variable injection: `style="--section-padding-top: {{ section.settings.padding_top }}px;"`
2. CSS Grid area naming: `style="grid-area: header;"`
3. Dynamic calculated values: `style="width: {{ percentage }}%;"`

#### NOT Allowed: Use `style` attribute

1. Static styles: `style="margin-left: 0;"` -> Use Tailwind class `ml-0`
2. Color values: `style="color: red;"` -> Use a theme token or CSS variable
3. Spacing values: `style="padding: 10px;"` -> Use Tailwind spacing utilities

#### Principle

- Use Tailwind classes when possible
- Use `style` attribute only when Tailwind cannot express
- Primary principle: Do not affect existing theme functionality

---

## SVG Icon Rules

### Pipeline

```text
icons/*.svg (temporary or persistent build inputs)  ->  npm run build:svg
    ->  assets/icon-*.svg  ->  {{ 'file.svg' | inline_asset_content }}
```

### SVGO Config (`svgo.config.js`)

- Strips: `fill`, `stroke`, `width`, `height`, `style`, `class`
- Adds: `fill="currentColor"`, `aria-hidden="true"`, `focusable="false"`
- Preserves: `viewBox`

### Mandatory Rules

1. NEVER paste raw `<svg>` markup into Liquid templates.
2. NEVER manually edit SVG files in `assets/`.
3. Before generating a new icon, ALWAYS check `assets/icon-*.svg` and any pending files in `icons/` for the same name or an equivalent shape so you do not create duplicate generated assets.
4. If an icon needs to be created or normalized, place the source SVG in `icons/`, run `npm run build:svg`, verify the generated `assets/icon-*.svg`, and then render that generated asset through the `icons` snippet.
5. `icons/` may be used as a temporary build-input directory during manual or agent-assisted SVG processing. After the generated asset in `assets/` has been verified, temporary source files in `icons/` may be removed if the team does not want to retain them.
6. All icons MUST be rendered through the `icons` snippet:

```liquid
{%- render 'icons', icon: 'icon-arrow2', size: 'md', color: 'currentColor' -%}
```

7. The `icons` snippet inlines SVG via `{{ icon_file | inline_asset_content }}`.
8. Icon color is controlled by CSS on the parent element -- never set color attributes on the SVG itself.

### Snippet Parameters

| Param   | Values                                   | Default   | Purpose                           |
| ------- | ---------------------------------------- | --------- | --------------------------------- |
| `icon`  | `'icon-arrow2'`, etc.                    | required  | SVG filename (without `.svg`)     |
| `size`  | `xs`, `sm`, `md`, `lg`, `xl`             | `md`      | Maps to Tailwind size classes     |
| `color` | `'theme'`, `'current'`, `'currentColor'` | `'theme'` | Color source                      |
| `class` | any Tailwind classes                     | --        | Extra classes on wrapper `<span>` |

### Adding a New Icon

1. Check whether an equivalent generated icon already exists in `assets/`.
2. If not, place the source SVG in `icons/`.
3. Run `npm run build:svg`.
4. Use in Liquid: `{%- render 'icons', icon: 'icon-name' -%}`.
5. If `icons/` is being used only as a temporary build-input directory, remove the temporary source file after verifying the generated asset.

---

## Liquid Rules

### Section Template Structure

```liquid
<section
    data-section-id='{{ section.id }}'
    data-component-kind='section'
    data-component-type='my-section'
    data-component-id='{{ section.id }}'
    class='full-width'
    style='
        --section-padding-top: {{ section.settings.padding_top }}px;
        --section-padding-bottom: {{ section.settings.padding_bottom }}px;
    '
>
    <div class='container-page'>
        {%- comment -%} Markup -- Tailwind classes only {%- endcomment -%}
    </div>
</section>
```

### Snippet Reuse

- Always check if an existing snippet covers your need before creating new markup.
- Render shared UI with `{% render 'snippet-name', param: value %}`.
- Keep snippet APIs consistent through named arguments.

### RTE Convention

- `richtext` settings: wrap in `.rte` or `.rte--compact` -- NEVER inside a `<p>` or heading tag.
- `inline_richtext` settings: do NOT wrap in `.rte`. Style as local UI text.

---

## Multi-language Specification

### Mandatory Rules

1. Theme-authored user-visible text MUST use `| t` filter
2. Translation keys defined in `locales/en.default.json`
3. Other languages translated via Theme Editor (Edit languages)
4. Schema defaults MUST be translated
5. Aria labels MUST be translated

Merchant-provided content such as `section.settings.*`, `block.settings.*`, resource titles, product content, article content, page content, and metafields MAY render directly. The schema names, labels, info text, and defaults that introduce those settings still need translation keys.

### Translation Key Classification

Reference Shopify official classification:

```json
{
    "general": {
        "404": { ... },
        "password": { ... },
        "gift_card": { ... }
    },
    "cart": { ... },
    "blog": { ... },
    "collections": { ... },
    "customers": { ... },
    "products": { ... },
    "search": { ... },
    "accessibility": {
        "close_dialog": "Close dialog",
        "previous_slide": "Previous slide",
        ...
    }
}
```

### Examples

```liquid
{%- comment -%} CORRECT: Use | t filter {%- endcomment -%}
<h1>{{ 'cart.title' | t }}</h1>
<button aria-label='{{ 'accessibility.close_dialog' | t }}'>x</button>

{%- comment -%} WRONG: Hardcoded text {%- endcomment -%}
<h1>Cart</h1>
<button aria-label='Close'>x</button>
```

### Detailed Reference

See `skills/code-review/i18n-checklist.md` for:

- Translation key naming conventions
- Complete translation key list
- Audit checklist

---

## Accessibility

1. All interactive elements (`<button>`, `<a>`, `<input>`) MUST have descriptive text. Icon-only controls need `aria-label` or `<span class="sr-only">`.
2. Dynamic feedback (toasts, cart updates) MUST use `role="status"` and `aria-live="polite"`.
3. Form inputs MUST be associated with labels.
4. Modals, drawers, and popups should trap focus when open.

---

## File Organization

```text
AGENTS.md                      Repository-wide agent rules (this file)
skills/                        Supporting agent docs (review checklists, audit status)
    code-review/               Review checklists and audit snapshots
    contracts/                 Runtime module contracts and boundaries
    examples/                  Canonical implementation examples

icons/                         Temporary or persistent SVG build inputs for `npm run build:svg`

assets/
    base.js                    Component engine + Alpine init
    events.js                  ThemeEvents event bus
    https.js                   ShopifyHttp + SectionRefresher
    performance.js             Debug CWV monitoring
    alpine.components.js       Alpine component definitions
    alpine.store.js            Alpine global stores
    utils.js                   Shared utilities
    vendor-*.min.js            Third-party libraries (DO NOT EDIT)
    vendor-*.min.css           Third-party styles (DO NOT EDIT)
    icon-*.svg                 SVGO-optimized icons (DO NOT EDIT -- regenerate via `icons/` + build)
    base.css                   Global reset
    tailwind.output.css        Generated (DO NOT EDIT)

tailwind/
    tailwind.input.css         Tailwind entry point
    tailwind.typography.css    Typography layer
    tailwind.elements.css      Element primitives layer
    tailwind.components.css    Component patterns layer
    tailwind.snippets.css      Snippet-scoped layer
    tailwind.utilities.css     Layout utilities layer
    tailwind.animates.css      Animation layer

layout/
    theme.liquid               Main layout (script load order defined here)

sections/                      Shopify sections
snippets/                      Reusable Liquid snippets
templates/                     JSON templates
config/                        Theme settings
locales/                       Translation files
```

---

## Abstraction Boundary Discipline

Shared abstractions (base classes, registered Alpine components used by 2+ sections, public utilities like `ShopifyHttp` / `SectionRefresher` / `sectionPagination`) carry a **contract** that every consumer silently depends on. Extending the contract for a new use case can break existing consumers in ways that surface far from the change.

Before extending any shared abstraction, apply the three-question gate below. **If any answer triggers, do NOT extend the abstraction.**

Extension is allowed only when the new use case shares the same core invariants as the existing callers. If you believe the abstraction can be safely extended, explicitly state which invariants remain unchanged in the task summary or code review notes.

### Three-Question Gate

1. **Invariants** -- Does the new use case share the same invariants as existing callers (target DOM identity, rendering context, lifecycle assumptions)? Or only the surface syntax (URL strings, fetch calls, similar-looking inputs)?
    - Repository example: `sectionPagination` assumes **the same section in the same page context** is being refreshed with different parameters. A collection tab that changes the collection pathname does **not** share that invariant, even if it still uses a URL and an HTTP request.
2. **Naming** -- Does the new method/parameter read naturally on the existing class? Awkward names like `sectionPagination.loadCollectionTab()` (pagination has no semantic relationship with cross-section navigation) are early signals of mis-fit.
3. **Branching parameter** -- Are you adding an enum or boolean that **switches core behavior** (not just a side-effect)?
    - Side-effect toggles like `updateHistory`, `silent`, `signal` are fine.
    - Core-behavior toggles like `refreshMode: 'full' | 'partial'` or `mode: 'replace' | 'append'` are red flags -- they encode two different operations into one method.

### Resolution When the Gate Triggers

Pick one, in this order of preference:

1. **Simpler, non-shared solution** -- e.g., real browser navigation instead of SRA refresh; inline the logic at the call site if it is truly a one-off.
    - If the new use case behaves more like navigation than local state refresh, prefer native page navigation over extending a shared refresh abstraction.
2. **New dedicated component** -- a clear name with a single responsibility, even if it duplicates a few lines from an existing component.
3. **Refactor the existing abstraction first** -- only after the new boundary is well understood; never pre-emptively.

NEVER pick "add a parameter to the existing public method to make the new case work."

### Anti-Pattern Table

| Bad                                                                                       | Correct                                                                                      |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Add `mode: 'a' \| 'b'` to a shared method to support a divergent new case                 | New method or new component with a single responsibility                                     |
| Add a `data-*` attribute on a shared component root that only one branch reads internally | Pass the value through the call site or scope it to the consumer                             |
| Reuse a base class because the URL pattern looks similar                                  | Compare invariants (target DOM, rendering context, lifecycle), not surface syntax            |
| Copy a hot snippet of behavior into a shared base class to "make it reusable"             | Wait for a third real consumer before generalizing -- two is coincidence, three is a pattern |

### Why This Matters

A shared abstraction's contract is consumed by every caller. Extending it for one new caller silently changes the contract for all the others, and the resulting bugs surface in code that has nothing to do with the change. Boundary discipline is a stability investment, not a code-style preference.

---

## Legacy Cleanup Safety

Use this section when the task is to normalize older code that was produced before the current rules were stable.

### Cleanup Workflow

1. Audit first; identify violations before editing.
2. Group findings by rule area: JS lifecycle, Alpine/data attributes, HTTP/cart, DOM refresh, CSS layers, i18n, accessibility, icons, and generated files.
3. Clean one rule family per change set when possible.
4. Preserve storefront behavior, visual design, schema IDs, block types, section types, and template references unless the task explicitly asks to change them.
5. Run the smallest relevant checks after each cleanup batch.
6. Summarize the rules enforced, files changed, behavior intentionally preserved, and remaining follow-up risks.

### Cleanup Priority

Fix issues in this order:

1. Runtime-breaking bugs and Theme Check blockers.
2. Accessibility and i18n blockers.
3. JS lifecycle problems, leaks, bare global listeners, raw application `fetch()`, and direct cart endpoint calls.
4. Unsafe Liquid-to-JS data passing and complex inline Alpine expressions.
5. CSS architecture issues: inline static styles, hardcoded colors, heading typography violations, and misplaced reusable CSS.
6. Icon pipeline, generated file, naming, and formatting consistency issues.

### Cleanup Non-Goals

During cleanup, agents MUST NOT:

- Redesign sections or rewrite markup only for subjective style consistency.
- Rename or remove schema setting IDs, block types, section types, preset names, or template references.
- Change business logic while fixing architecture unless the behavior is already broken.
- Introduce new dependencies.
- Edit generated assets directly.
- Expand shared abstractions to accommodate legacy code unless the abstraction boundary gate has been passed.

If a violation is widespread, create a staged cleanup plan or audit report instead of changing the entire theme in one pass.

---

## Repo Safety Rules

1. NEVER edit minified vendor files (`vendor-*.min.js`, `vendor-*.min.css`).
2. NEVER manually edit `assets/tailwind.output.css`.
3. NEVER manually edit `assets/icon-*.svg` -- regenerate via `icons/` + `npm run build:svg`.
4. Use 4-space indentation.
5. Prefer minimal diffs -- do not reformat unrelated code.
6. Separate structural refactors from behavior changes.
7. When renaming assets, update ALL references: `layout/theme.liquid`, CSS imports, `README.md`, `AGENTS.md`.

---

## Pre-Merge Self-Check

Before considering a task complete, verify all applicable items below.

### Architecture

1. Liquid-driven runtime values are passed through `data-*`, not embedded directly in `x-data`.
2. Section/block behavior is wired through `Components.register()` when lifecycle management is needed.
3. Reusable Alpine behavior is registered in `alpine.components.js`.
4. Cross-component communication uses `ThemeEvents`, while local component events remain lifecycle-scoped.
5. Application HTTP requests use `window.ShopifyHttp`; raw `fetch()` appears only in allowed infrastructure/vendor files.
6. Shopify section HTML refresh uses `window.ShopifySectionRefresher.render()`; local text/state/class updates use Alpine bindings or `updateText()`.
7. Before extending any shared abstraction (base class, public utility, component used by 2+ sections), the three-question gate in `Abstraction Boundary Discipline` has been applied. Adding a new core-behavior-switching parameter to a public method is treated as a red flag, not as a routine change.
   If the abstraction was still extended, the changed invariants and the existing consumers checked against them have been explicitly listed.

### Product Page

1. Variant-driven behavior listens to `PRODUCT_VARIANT_CHANGED`.
2. New PDP features do not read state from sibling component DOM when an event-driven path exists.
3. Main product and featured product capability differences are explicit, not accidental.

### Assets and Styling

1. Tailwind-first styling is preserved; no ad-hoc `<style>` blocks are introduced.
2. New reusable CSS is placed in the correct Tailwind layer source file.
3. Empty `{% stylesheet %}` blocks are removed during cleanup.
4. If Tailwind source changed, run `npm run build:tw`.
5. If SVG source changed, run `npm run build:svg`.

### Validation

1. Update locales when new user-facing strings are introduced.
2. Update README/docs when architecture, vendor, or build expectations change.
3. Run `npm test` after meaningful theme changes.
4. Keep the diff scoped to the task; avoid unrelated churn.
5. For cleanup tasks, report the rule family cleaned and any remaining staged follow-up.
