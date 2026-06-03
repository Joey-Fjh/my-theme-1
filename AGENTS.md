# Agent Instructions

This document defines the architecture constraints for this Shopify theme.
Any AI agent modifying code in this repository MUST follow these rules.

For project skill routing, see `.agents/skills/`. For longer agent-readable references, see `docs/`.

---

## Document Hierarchy

`AGENTS.md` (this file) is the canonical source of truth for repository-wide rules.

Use sibling documents only as supporting references:

- `docs/references/code-review/pre-merge.md` -> review checklist
- `docs/references/code-review/i18n-checklist.md` -> i18n review reference
- `docs/references/patterns/` -> canonical implementation examples for agents
- `docs/agent/` -> current plan, decision log, and next-session context
- `WORKFLOW.md` -> phase flow, handoff protocol, and agent work loop

If any supporting document conflicts with this file, `AGENTS.md` wins.

---

## Docs And Skill Resource Boundary

Use these boundaries when adding or moving agent-facing material:

- `AGENTS.md` is the repository rule source.
- `.agents/skills/` is the discoverable Agent Skills entry point.
- `docs/` is the agent-readable RAG and knowledge layer.
- `docs/references/` stores cross-skill references, canonical implementation examples, and long checklists.
- Skill-local `references/` stores only material strongly owned by one skill.
- Skill-local `scripts/` stores deterministic executable resources owned by one skill.
- Skill-local `assets/` stores templates, static resources, or output materials owned by one skill.
- Do not create empty `references/`, `scripts/`, or `assets/` directories just to mirror the full Agent Skills standard structure.
- Use `llms.txt` only for public website or documentation indexing, not as a repository rule source, skill source, or internal agent-governance entry point.

`SKILL.md` files should describe triggers, workflow, and routing. Put long details in `docs/references/` when they are shared across skills, and in skill-local `references/` only when they belong to that skill alone.

---

## Rule Strength

This document uses rule strength deliberately:

- **MUST**: hard constraint. Fix violations during cleanup unless a documented infrastructure exception applies.
- **SHOULD**: default project preference. Follow it unless the local code context proves it is a poor fit.
- **MAY**: allowed pattern. Do not report or rewrite it as a violation.
- **Infrastructure exception**: low-level implementation files may use lower-level browser APIs to provide the project abstraction. Application code should still use the abstraction.

When cleaning legacy code, do not treat a rule as absolute unless this document says it is absolute for that file type and use case.

### Progressive Rule Enforcement

A documented rule does not mean every legacy violation must be fixed immediately. Agents MUST classify findings before proposing fixes:

| Classification    | Rule strength                | Action                                |
| ----------------- | ---------------------------- | ------------------------------------- |
| Launch blocker    | MUST + user-facing / runtime | Fix now                               |
| Architecture debt | MUST + non-user-facing       | Fix now if touched; otherwise stage   |
| Review warning    | SHOULD                       | Report as warning or post-launch debt |
| Style preference  | MAY or convention only       | Report at most; do not block          |
| Known follow-up   | Pending alignment            | Record as post-launch debt with owner |

Priority rules:

1. **MUST rules with launch-blocking scope** (accessibility, SEO, runtime stability, Theme Check) MUST be fixed during the current pass.
2. **SHOULD rules, review-only findings, and known follow-ups** MAY be recorded as warnings or post-launch debt. They do not become launch blockers unless they affect Lighthouse, accessibility, SEO, or production behavior.
3. **Touched code and new code** SHOULD comply with current rules. Legacy code that is not being modified for the current task MAY be left as-is with a documented finding.
4. Do not promote a style preference or convention to a launch blocker unless this document explicitly marks it as MUST for that scope.

---

## Product And Agent Operating Principles

This repository is maintained as a multi-industry sellable Shopify theme candidate, not as a one-off store implementation.

When goals conflict, agents MUST prefer launch stability, Shopify Theme Store readiness, accessibility, SEO, maintainability, merchant configurability, and mobile reliability over visual novelty or Lighthouse micro-optimizations.

Theme code may expose configurable settings, validation, defaults, and rendering behavior. It MUST NOT silently decide merchant-owned configuration or content.

Agents MUST NOT modify merchant-owned configuration or content unless the user explicitly authorizes that scope:

- `config/settings_data.json`
- `templates/*.json`
- color scheme values
- product, collection, page, article, blog, and metafield content
- uploaded media assets
- merchant copy and navigation/content composition

If an issue could be code, configuration, content, uploaded asset, Shopify platform, or measurement noise, agents MUST classify it before proposing a fix.

### Shopify Launch Standard

Agents MUST treat Shopify Theme Store readiness as a core constraint.

Treat the following as launch blockers unless the user explicitly scopes them out:

1. Theme Check errors.
2. Repository lint or test failures.
3. Accessibility regressions in user-facing controls, navigation, forms, dialogs, drawers, filters, search, cart, product media, or checkout-adjacent flows.
4. SEO regressions caused by theme code.
5. Broken mobile layouts or mobile-only interaction failures.
6. Manual edits to generated or vendor files.
7. Changes to merchant-owned configuration or content without explicit approval.

Warnings may be recorded only when they are pre-existing, false positives, or explicitly classified as non-blocking with a follow-up.

### Storefront Experience Standard

This theme targets a balanced, multi-industry Shopify experience: polished default sections, coherent page storytelling, reliable conversion flows, and meaningful merchant configuration.

Visual richness and motion are allowed, but they must enhance the experience. They MUST NOT hide critical content, delay LCP candidates, break keyboard access, create CLS, or require JavaScript for essential content visibility.

Default section presets and defaults should be storefront-ready. A section should not rely on extensive merchant reconfiguration before it looks usable.

### Uncertainty And Question Policy

Agents MUST resolve discoverable facts through repository inspection before asking the user.

Agents MUST ask or prompt for confirmation when the unknown is a product preference, design tradeoff, configuration ownership question, launch risk boundary, or architecture direction. High-risk uncertainty MUST NOT be handled by silently guessing and editing code.

Question outcomes must be reflected in the plan, prompt, or task summary so they survive cross-session handoff.

### Agent Change Authority

Agents MUST prefer editing existing canonical files over creating new files.

New documentation files, scripts, lint tools, CI wrappers, analysis tools, or runtime abstractions are not allowed by default.

A new documentation file is allowed only when the content cannot fit cleanly in `AGENTS.md`, `WORKFLOW.md`, an existing skill `references/` file, or `docs/agent/` for current plans, decision logs, and next-session context.

New tooling is allowed only when the rule is already stable in `AGENTS.md`, manual review is unreliable or repeatedly missed, and the tool reduces net cognitive load.

New shared runtime abstractions are allowed only when there are at least two real current consumers, the invariants are shared, and the owner module is clear. Prefer three real consumers before generalizing.

### Workflow Entry Point

Agents MUST read `WORKFLOW.md` before multi-step work, cleanup, Lighthouse optimization, architecture changes, or cross-session continuation.

`AGENTS.md` defines rules. `WORKFLOW.md` defines the shared agent work context: the ReAct work loop, phase flow, user task frame, handoff protocol, and external skill usage. If they conflict, `AGENTS.md` wins.

For ambiguous or multi-step work, agents SHOULD interpret user input through the Purpose / Context / Decomposition / Feedback task frame in `WORKFLOW.md`. If the user did not provide enough information for a safe plan or prompt, the agent SHOULD ask for the missing high-risk pieces using that frame instead of guessing.

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

For new JavaScript and cleanup work, check only the canonical examples that match the behavior being implemented. They show the preferred minimal shape for this theme; the rules below remain authoritative.

Example lookup rules:

- Section lifecycle -> `docs/references/patterns/canonical-section.md`
- Alpine component -> `docs/references/patterns/canonical-alpine-component.md`
- ThemeEvents -> `docs/references/patterns/canonical-events.md`
- HTTP/section refresh -> `docs/references/patterns/canonical-http-section-refresh.md`
- Cart flow -> `docs/references/patterns/canonical-cart-flow.md`
- Swiper -> `docs/references/patterns/canonical-swiper-section.md`
- GSAP choreography -> `docs/references/patterns/canonical-gsap-section.md`
- Alpine/CSS state motion -> `docs/references/patterns/canonical-motion-transition.md`
- CSS layering -> `docs/references/patterns/canonical-css-layering.md`
- Accessibility semantics -> `docs/references/patterns/canonical-accessibility.md`

Examples are supporting patterns, not rule sources. If an example conflicts with `AGENTS.md`, `AGENTS.md` wins.

### Golden Rules

1. NEVER write inline `<script>` tags or bare DOM listeners.
2. Section/block JS behavior that needs lifecycle management MUST go through `Components.register()` inside a `{%- javascript -%}` block.
3. Reusable Alpine component behavior MUST be registered via `AlpineComponentsFactory.register()` in the appropriate `alpine.components.*.js` file (grouped by domain; base factory in `alpine.components.js`).
4. Cross-component and cross-section communication MUST use `ThemeEvents`; local DOM events inside one component MAY use native or Alpine event bindings.
5. Application-level HTTP requests MUST use `window.ShopifyHttp`; raw `fetch()` is allowed only in the HTTP infrastructure layer and vendor files.
6. Shopify section HTML replacement after AJAX MUST use `window.ShopifySectionRefresher.render()`; local text, class, aria, loading, and open/closed state changes SHOULD use Alpine bindings.

### Runtime Integration Boundaries

Use these boundaries when deciding whether a cleanup is required. `AGENTS.md` remains the source of truth for runtime integration boundaries.

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
| `__Theme__.Motion`                  | `motion.js`            | GSAP choreography recipes       |

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
 6.  motion.js
 7.  alpine.components.js
 8.  alpine.components.ui.js
 9.  alpine.components.header.js
10.  alpine.components.pagination.js
11.  alpine.components.filters.js
12.  alpine.components.product.js
13.  alpine.components.product-media.js
14.  alpine.components.product-cards.js
15.  alpine.components.search.js
16.  alpine.components.overlays.js
17.  alpine.components.registry.js      <- merges groups into window.__Theme__.AlpineComponents
18.  performance.js
19.  https.js
20.  base.js
21.  alpine.store.js
22.  alpine.store.toast.js
23.  alpine.store.dialog.js
24.  alpine.store.cart.js
25.  alpine.store.registry.js           <- merges/registers stores
26.  vendor-alpine-intersect.min.js
27.  vendor-alpine.min.js               <- MUST be last
```

**Constraints**:

- `vendor-alpine.min.js` MUST be last.
- Registry files (`*.registry.js`) load after their respective groups.
- `base.js` loads after `https.js` and component definitions.
- Store files load before `vendor-alpine.min.js`.

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

When passing Liquid values to registered Alpine components or JS components, ALWAYS use `data-*` attributes. NEVER embed complex Liquid output directly in `x-data` expressions.

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

Reusable Alpine behaviors are defined in `alpine.components.js` (base factory) and grouped files (`alpine.components.*.js`). `alpine.components.registry.js` merges all groups into `window.__Theme__.AlpineComponents`.

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

Global stores are defined in `alpine.store.js` (base) and grouped files (`alpine.store.*.js`). `alpine.store.registry.js` merges and registers all stores into Alpine. Stores are initialized in `base.js`.

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

| File                            | Type        | Purpose                                                                                                                              |
| ------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `vendor-*.min.js`               | Third-party | **DO NOT EDIT**                                                                                                                      |
| `utils.js`                      | Custom      | Utility functions (throttle, debounce)                                                                                               |
| `events.js`                     | Custom      | Event bus system (`ThemeEvents`)                                                                                                     |
| `motion.js`                     | Custom      | GSAP choreography recipes (`Motion`)                                                                                                 |
| `alpine.components.js`          | Custom      | Base Alpine component factory (`AlpineComponentsFactory`)                                                                            |
| `alpine.components.*.js`        | Custom      | Grouped Alpine component definition files (ui, header, pagination, filters, product, product-media, product-cards, search, overlays) |
| `alpine.components.registry.js` | Custom      | Merges component groups into `window.__Theme__.AlpineComponents`                                                                     |
| `performance.js`                | Custom      | Debug CWV monitoring                                                                                                                 |
| `https.js`                      | Custom      | HTTP client (`ShopifyHttp`) + Section refresher                                                                                      |
| `base.js`                       | Custom      | Component engine + Alpine init                                                                                                       |
| `alpine.store.js`               | Custom      | Base Alpine store definitions                                                                                                        |
| `alpine.store.*.js`             | Custom      | Grouped Alpine store definition files (toast, dialog, cart)                                                                          |
| `alpine.store.registry.js`      | Custom      | Merges/registers stores into Alpine                                                                                                  |

#### Custom JS Files Specification

**1. `utils.js` -- Utility Functions**

- **Namespace**: `window.__Theme__.Utils`
- **Functions**: `rafThrottle(fn)`, `throttle(fn, delay)`, `debounce(fn, wait)`
- **Usage**: See "Utils Pattern" section above

**2. `events.js` -- Event Bus System**

- **Namespace**: `window.__Theme__.Events`
- **API**: `emit(type, detail, options)`, `on(type, handler, options)`, `once(type, handler, options)`, `createScope(options)`
- **Usage**: See "ThemeEvents API" section above

**3. `motion.js` -- GSAP Choreography Recipes**

- **Namespace**: `window.__Theme__.Motion`
- **API**: `Motion.scrollReveal(el, options)` -- scroll-triggered staggered reveal; `Motion.heroReveal(el, options)` -- hero + badge entrance
- **scrollReveal Options**: `selector`, `axis`, `from`, `to`, `duration`, `stagger`, `ease`, `scrollTriggerStart`, `once`
- **heroReveal Options**: `heroSelector`, `badgeSelector`, `heroDuration`, `heroEase`, `badgeDuration`, `badgeDelay`, `badgeEase`
- **Returns**: `{ ctx, timeline }` -- `timeline` holds a GSAP Tween or Timeline; caller MUST call `ctx.revert()` in `destroy()`
- **Guards**: `Motion` is `null` if `gsap` or `ScrollTrigger` is unavailable; guard with `if (!Motion) return`

**4. `https.js` -- HTTP Client + Section Refresher**

- **Namespace**: `window.ShopifyHttp`, `window.ShopifySectionRefresher`
- **ShopifyHttp API**: `getJSON(url, options)`, `postJSON(url, body, options)`, `request(url, options)`
- **SectionRefresher API**: `render(data, domMap)`, `updateText(updates)`
- **Usage**: See "ShopifyHttp API" and "SectionRefresher API" sections above

**5. `alpine.components.js` -- Alpine Component Definitions**

- **Namespace**: `window.__Theme__.AlpineComponentsFactory`
- **Registration**: `AlpineComponentsFactory.register('name', function () { return { init() {}, dispose() {} }; })`
- **Usage**: See "Alpine Component Pattern" section above

**6. `base.js` -- Component Engine + Alpine Init**

- **Namespace**: `window.__Theme__.Components`, `window.__Theme__.Base`
- **Components API**: `register(type, handlers, options)`, `initAll(container)`, `destroyAll(container)`
- **Usage**: See "Component Engine Pattern" section above

**7. `alpine.store.js` -- Alpine Global Stores**

- **Namespace**: `window.__Theme__.AlpineStores`
- **Stores**: `$store.toast`, `$store.dialog`, `$store.cart`
- **Usage**: See "Alpine Store Pattern" section above

#### Additional Rules

**Alpine Component Encapsulation**:

Simple local Alpine state MAY remain inline in templates when ALL of the following hold:

- Used only for current-template local UI state (e.g. `x-data="{ open: false }"`, `x-data="{ hover: false }"`, `x-data="{ inView: false }"`, `x-data="{ index: null }"`)
- No Liquid output embedded in the expression
- No JSON or long object configuration
- No multi-layer quoting or escape-heavy expressions
- No side-effectful methods (HTTP, observers, timers, cross-component communication)
- Not reused across multiple templates

The following MUST be migrated to a registered Alpine component in `alpine.components.*.js`:

- Long object parameters (e.g. `productCard({ ...many params... })`)
- Complex expression parameters (e.g. `cardGallery({ imageCount: Array.isArray(...) ... })`)
- Liquid output embedded in `x-data`
- JSON embedded in `x-data`
- Multi-layer quoting or escape-risky parameters
- Reusable Alpine behavior
- Side effects / lifecycle cleanup / HTTP / cart / ThemeEvents / observers / timers

**Configuration rules**:

- Registered Alpine components with Liquid-driven configuration MUST use `data-*` attributes.
- Short, stable parameters with no Liquid (e.g. `dragScroll({ axis: 'x' })`) MAY remain inline if not reused enough to justify extraction.
- Use double quotes for HTML attributes, single quotes for Liquid tags.

**Component Reuse**:

- ALWAYS check `alpine.components.*.js` files for existing components before creating new ones
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

## Motion Architecture

Motion is a repository-wide architecture concern, not a CSS-only concern. Tailwind/CSS, Alpine, and GSAP are execution layers under one motion system. Agents MUST classify animation work before adding or refactoring motion code.

GSAP is the main execution layer for theme storytelling choreography: scroll choreography, stagger, parallax, campaign motion, brand motion, and complex timelines.

### Motion Goals

1. Preserve one semantic entry point for motion decisions.
2. Keep animation reusable without forcing every animation into one technology.
3. Make future global motion settings possible without scanning scattered duration/ease/transform values.
4. Prevent Alpine, Tailwind/CSS, and GSAP from competing for the same element properties.

### Motion Classification

Before changing animation, classify it as one of:

| Layer                   | Purpose                                            | Owner / Location                                                               |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Capability**          | Low-level motion ability                           | `tailwind/tailwind.animates.css`                                               |
| **State motion recipe** | Named open/close, show/hide, active/loading motion | Motion transition presets, exposed through `snippets/motion-transition.liquid` |
| **Choreography recipe** | Named scroll, stagger, reveal, timeline motion     | `window.__Theme__.Motion` / GSAP presets                                       |
| **Usage**               | When a specific component or section should move   | Liquid templates, Alpine components, or `Components.register()` lifecycle code |

#### Capability Layer

Capabilities are low-level CSS primitives. They answer "what can CSS do?" rather than "how should this UI pattern move?"

Allowed in `tailwind/tailwind.animates.css`:

- motion CSS variables and foundation tokens
- `@keyframes`
- animation utility classes
- hover/focus micro-motion utilities
- pause/running helpers
- loader, spinner, and decorative loop utilities

Capability utilities SHOULD use the `motion-*` naming namespace for new code.

Existing non-`motion-*` utilities MAY remain as legacy aliases during migration, but new code SHOULD NOT introduce more non-`motion-*` animation utilities.

#### State Motion Recipe Layer

State motion recipes describe reusable UI state transitions. They answer "how should this UI pattern move when state changes?"

Examples:

- `fade`
- `dropdown`
- `modal`
- `drawer-left`
- `drawer-right`
- `toast`
- `accordion`
- `loading`

State motion recipes are consumed by Alpine/CSS state changes such as:

- open / close
- active / inactive
- expanded / collapsed
- loading / idle
- visible / hidden

Repeated Alpine `x-transition:*` attribute groups SHOULD be replaced with a named motion recipe. New reusable Alpine/CSS state motion MUST NOT duplicate raw duration/ease/opacity/transform groups in Liquid when an existing recipe covers the behavior.

Preferred template usage:

```liquid
<div
    x-show='open'
    {% render 'motion-transition', preset: 'dropdown' %}
></div>
```

`snippets/motion-transition.liquid` owns the mapping from preset name to Alpine `x-transition:*` attributes. `tailwind/tailwind.animates.css` owns the CSS classes used by those phase attributes.

#### Choreography Recipe Layer

Choreography recipes describe visual direction and page-level motion. They answer "how should this content be staged over time or scroll?"

Use GSAP for:

- scroll-triggered section reveal
- staggered cards or list items
- image reveal choreography
- parallax
- timeline sequences
- hero or campaign-style motion
- brand-level site motion

Reusable GSAP motion SHOULD live under `window.__Theme__.Motion` once the motion runtime exists. Until then, local GSAP in a section is allowed when the animation is one-off.

GSAP recipes MUST be initialized through `Components.register()` and cleaned up in `destroy()`. The component lifecycle owns when GSAP starts and stops; the motion recipe owns animation values.

#### Available Choreography Recipes

| Recipe         | Namespace                          | Description                       | Status |
| -------------- | ---------------------------------- | --------------------------------- | ------ |
| `scrollReveal` | `Motion.scrollReveal(el, options)` | Scroll-triggered staggered reveal | Active |
| `heroReveal`   | `Motion.heroReveal(el, options)`   | Hero + badge entrance animation   | Active |

### Execution Layer Boundaries

Use this decision tree:

1. **Hover/focus, loader, decorative loop, pause/running state** -> CSS capability utility in `tailwind/tailwind.animates.css`.
2. **Open/close, show/hide, active/inactive, loading visibility** -> Alpine/CSS state motion recipe.
3. **Scroll, reveal, stagger, parallax, timeline, hero/brand motion** -> GSAP choreography recipe.
4. **One-off complex section animation** -> local GSAP inside that section's `{%- javascript -%}` block, still using `Components.register()` and cleanup.
5. **Repeated section animation or global motion language** -> shared GSAP recipe under `window.__Theme__.Motion`.

### Above-The-Fold Visibility

Above-the-fold critical content MUST render visible in its final layout without JavaScript.

This includes:

- page H1 and primary copy
- LCP image candidates
- product card images above the fold
- primary navigation
- product purchase controls
- search, filter, and sort entry points
- cart and checkout-adjacent actions

Agents MUST NOT make critical above-the-fold content depend on GSAP, Alpine state, Swiper initialization, delayed transitions, `opacity-0`, `hidden`, `x-show="false"`, off-screen transforms, or animation callbacks before it becomes visible.

Motion may enhance critical content only when the static no-JS state is already usable and visible.

### Page-Type Motion Policy

Conversion pages such as product, collection, search, cart, and checkout-adjacent flows SHOULD use restrained motion: state transitions, interaction feedback, media controls, and below-the-fold reveal only.

Home, brand, editorial, campaign, and storytelling pages MAY use richer GSAP choreography when no critical first-viewport content is hidden before JavaScript, no LCP candidate waits for animation, reduced motion is respected, keyboard and screen-reader access remain intact, and the animation is registered and cleaned up through `Components.register()`.

### Token and Preset Rules

Do not over-tokenize motion. Tokens are for shared foundation values, not every component detail.

Foundation motion tokens MAY include:

- duration: `fast`, `base`, `slow`
- easing: `standard`, `enter`, `exit`, `linear`
- distance: `sm`, `md`
- scale: `subtle`, `pop`
- stagger: `sm`, `md`

A value SHOULD become a token only when it is reused across multiple recipes, consumed by both CSS and JS, or expected to be affected by global motion settings.

Component-specific values SHOULD stay inside the named recipe until a real reuse pattern exists. Do not create tokens like `--motion-dropdown-y` or `--motion-toast-scale` unless they are intentionally part of the stable motion contract.

### User Configuration Boundary

Merchant-facing motion settings SHOULD control policy, not low-level implementation details.

Allowed future global settings:

- `motion_enabled`
- `motion_speed`
- `motion_intensity`
- `micro_motion_enabled`
- `scroll_motion_enabled`

Do not expose low-level implementation values such as GSAP easing names, ScrollTrigger start/end positions, individual element offsets, per-element timeline delays, or raw stagger amounts.

### Conflict Rules

The same element MUST NOT be controlled by both Alpine transitions and GSAP for the same CSS properties.

Avoid mixed ownership over:

- `opacity`
- `transform`
- `height`
- `display`
- `visibility`

If Alpine controls visibility or state, GSAP MAY animate descendants only when property ownership is clear. If GSAP controls reveal or scroll behavior, Alpine SHOULD NOT also apply `x-transition` to the same element.

CSS animation utilities MUST NOT be used as the implementation mechanism for GSAP scroll reveals, stagger choreography, parallax, or timeline animation. GSAP recipes directly own their timing, transforms, opacity, stagger, and ScrollTrigger configuration.

### Migration Rules

Motion cleanup MUST be staged:

1. Audit current motion usage before refactoring.
2. Group findings as CSS capabilities, Alpine/state recipes, GSAP/choreography, and mixed-ownership risks.
3. Create or reuse named state motion recipes before replacing repeated Alpine transition groups.
4. Rename CSS animation utilities toward `motion-*` with legacy aliases when needed.
5. Introduce shared GSAP recipes only after at least three real usages or when the animation is clearly part of the global motion language.
6. Add merchant-facing global motion settings only after the relevant recipes and tokens exist.

During cleanup, preserve visual behavior unless the task explicitly asks to redesign motion.

### Reduced Motion

Motion work SHOULD respect `prefers-reduced-motion` and any future global motion-disable policy.

Do not make content access depend on animation completion. Reduced motion may shorten or disable transitions, but must not hide required content.

### Motion Duplication Prevention

Agents MUST NOT copy-paste large blocks of GSAP, Alpine `x-transition`, or CSS animation/keyframe definitions across sections or components. Before adding motion code, check whether an existing recipe, preset, or capability utility already covers the behavior.

Duplication is a signal, not the whole rule. The real rule is whether motion has a stable owner, a clear lifecycle, and a future global policy entry point.

#### Duplication Detection Rules

This table lists repeated patterns to check **before adding another copy**. It is a pre-flight checklist, not an automatic abstraction trigger. Finding a match means "stop and evaluate" -- it does not mean "abstract immediately."

| Repeated pattern to check before adding another copy                        | Destination                                | Namespace                    |
| --------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| Alpine `x-transition:*` attribute group already defined elsewhere           | `snippets/motion-transition.liquid` preset | `motion-transition` snippet  |
| CSS `@keyframes`, `animation-*`, or phase class already defined elsewhere   | `tailwind/tailwind.animates.css`           | `motion-*` utility namespace |
| GSAP reveal, stagger, timeline, or parallax logic already defined elsewhere | `window.__Theme__.Motion` recipe           | `Motion.*` method            |

One-off section choreography MAY remain local in that section's `{%- javascript -%}` block, but it MUST still be lifecycle-scoped through `Components.register()` with proper `destroy()` cleanup.

#### Shared Recipe Trigger Conditions

Creating a new shared recipe, preset, or utility requires architectural justification. A motion pattern SHOULD become a shared recipe when **any** of the following apply:

1. **Three or more current consumers** -- the pattern is already repeated across at least three real sections or components.
2. **Global motion language** -- the pattern defines a brand-level or site-wide motion behavior (e.g. hero entrance, scroll reveal standard, campaign motion signature).
3. **Settings or policy interference** -- scattered raw values would prevent or complicate future global motion settings (`motion_enabled`, `motion_speed`, `motion_intensity`, `micro_motion_enabled`, `scroll_motion_enabled`) or `prefers-reduced-motion` enforcement.
4. **Ownership, lifecycle, or stability risk** -- scattered implementations create unclear ownership, unpredictable cleanup, cross-section regression risk, or launch stability concerns (see "Motion Encapsulation as Architecture Stability" below).

Two consumers is coincidence; three is a pattern. But even two consumers may justify extraction when condition 2, 3, or 4 applies.

#### Motion Encapsulation as Architecture Stability

Motion encapsulation is an architecture stability rule, not a style preference. It exists to guarantee that motion behavior can be governed, audited, and evolved without cascading side effects.

When evaluating whether a motion pattern is properly encapsulated, audit against these concrete criteria:

| Criterion                | What to verify                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Change control**       | Can duration, easing, distance, stagger, and reduced-motion behavior be adjusted in one stable location?                                                          |
| **Policy control**       | Can future global settings (`motion_enabled`, `motion_speed`, `motion_intensity`, `micro_motion_enabled`, `scroll_motion_enabled`) uniformly control this motion? |
| **Ownership clarity**    | Is it clear who owns `opacity`, `transform`, `visibility`, `height`, and `display` -- CSS, Alpine, or GSAP? Are there conflicts?                                  |
| **Lifecycle safety**     | Can listeners, timelines, ScrollTrigger instances, timers, and state transitions be predictably cleaned up in `destroy()`?                                        |
| **Regression isolation** | Does modifying motion in one section risk breaking other sections, or require synchronized changes in multiple places?                                            |
| **Launch stability**     | Does the motion affect `visibility`, accessibility, LCP, CLS, keyboard access, or mobile behavior?                                                                |

If any criterion fails, the motion pattern needs better encapsulation -- even if it is not duplicated.

#### Progressive Enforcement

- Touched and new motion code SHOULD comply with duplication detection and encapsulation rules immediately.
- Legacy repeated animations that are not being modified for the current task MAY be classified as warning or post-launch debt.
- Duplication or encapsulation issues escalate from warning to **now/blocker** when they affect visibility, accessibility, Lighthouse scores, runtime stability, mobile layout, or production behavior.
- Do not require immediate refactoring of all historical motion code in one pass.

### External GSAP Skills

Official or external GSAP skills MAY be used as technical references for GSAP API behavior and recommended choreography patterns.

The canonical external reference is [`greensock/gsap-skills`](https://github.com/greensock/gsap-skills) -- the GreenSock official AI skills repository. It covers GSAP API, timeline construction, ScrollTrigger configuration, plugin usage, and performance techniques. It is a **technical reference only**, not a project rule source.

#### External Reference Boundary

External skills do not override this repository's rules. Every external GSAP recommendation MUST be mapped back to the project's runtime abstractions before implementation:

| Project abstraction                   | What it governs                                           |
| ------------------------------------- | --------------------------------------------------------- |
| `Components.register()`               | Lifecycle ownership -- when GSAP starts and stops         |
| `window.__Theme__.Motion`             | Shared recipe registry -- reusable choreography           |
| Scoped selectors (`el.querySelector`) | DOM isolation -- no global `document.querySelector`       |
| `destroy()` / `ctx.revert()`          | Cleanup -- no leaked timelines or ScrollTrigger instances |
| `prefers-reduced-motion`              | Accessibility -- shortened or disabled motion             |
| No-JS / Motion unavailable visibility | Critical content must render without GSAP                 |
| Lighthouse / Theme Store readiness    | Motion must not block LCP, create CLS, or hide content    |

#### When to Escalate

If an external GSAP skill recommends any of the following, treat that as a Rule Alignment or Architecture Audit task before implementation:

- Changing script load order or vendor file selection
- Conditional vendor loading or dynamic import
- Changes to the global motion runtime (`window.__Theme__.Motion`)
- Section lazy-loading strategy changes
- New GSAP plugins that require additional vendor files

#### Agent Report Requirement

When an external skill informs an implementation, the agent report MUST state:

1. Which external recommendations were adopted.
2. Which were rejected.
3. Why each decision was made, mapped to the project abstractions above.

---

## CSS Rules

For new CSS and cleanup work, first check `docs/references/patterns/canonical-css-layering.md` for the preferred layer choice patterns. The rules below remain authoritative. For animation and transition decisions, classify the work through `Motion Architecture` before applying CSS layer rules.

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

Before adding reusable CSS, agents MUST classify the owner layer. Do not add reusable component styles to section `{% stylesheet %}` blocks.

Section `{% stylesheet %}` blocks are allowed only for section-specific CSS that Tailwind cannot express cleanly. They MUST NOT contain reusable component styles, typography systems, color systems, or motion recipes.

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

### Token Governance

Design tokens are stable public contracts. Agents MUST NOT add, rename, or remove tokens unless the task is explicitly a design-system task.

A new token is allowed only when:

1. It represents a reusable design decision, not a one-off component value.
2. It has at least three expected consumers, is exposed to merchant configuration, or is required for global theme consistency.
3. Its owner layer is clear: color, typography, spacing, radius, shadow, motion, or layout.
4. Existing tokens cannot express the design without making the code misleading.

Do not create component-specific global tokens for a single section or snippet.

Prefer semantic color tokens over raw colors, typography tiers over ad-hoc font sizes, shared radius/shadow utilities over repeated arbitrary values, and local component classes over premature global tokens.

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

#### Typography Source of Truth

- Typography utility definitions come from `tailwind/tailwind.typography.css`.
- Liquid templates MUST use project typography tiers (`hxxxl`-`h0`, `h1`-`h6`, `body-xl`-`body-xs`) instead of arbitrary Tailwind text-size utilities.
- `heading-base` and `body-base` are foundation utilities for CSS source only. They MUST NOT be used in Liquid templates.

#### CSS Inheritance Rules

- `base.css` owns native element defaults.
- `tailwind/tailwind.typography.css` owns reusable typography tiers.
- Body text SHOULD inherit from `body` by default.
- Native `h1`-`h6` elements SHOULD carry their standard visual tier without repeating matching classes.
- Only add a typography utility when the intended tier differs from the inherited body default or native heading default.

#### Body Typography Rules

1. `body-md` is the intended default body tier.
2. Broad removal of repeated `body-md` is allowed only after `body` and `body-md` are aligned in CSS.
3. Use `body-sm`, `body-lg`, `body-xl`, and `body-xs` only when intentionally different from default.
4. Redundant `body-md` is review-only debt unless it affects accessibility, layout, Lighthouse, or production behavior.

#### Semantic Rules

1. Use semantic heading tags (`h1`-`h6`) for headings.
2. Standard heading utilities (`h1`-`h6`) SHOULD NOT be used to make one semantic heading look like another, such as `<h2 class="h1">`.
3. Special display tiers (`hxxxl`-`h0`) MAY be used as classes on heading elements when the design needs display scale.
4. Non-heading elements MUST NOT use heading or display heading utilities unless an approved component style requires it.
5. Agents MUST NOT infer typography intent. If a fix changes content hierarchy, font family, brand/display treatment, or wrapper behavior, stop and ask or wait for an approved execution list.

#### Examples

```html
<!-- CORRECT -->
<body>
    <h1>Page Title</h1>
    <h2>Section Title</h2>
    <p>Paragraph text (inherits body-md)</p>
    <span class="body-sm">Small text</span>
</body>

<!-- CORRECT: clean semantic heading, no redundant class -->
<h2>Featured collection</h2>

<!-- WRONG: redundant matching heading class -->
<h2 class="h2">Featured collection</h2>

<!-- WRONG: semantic/visual mismatch - needs user/design decision, not a default pattern -->
<h2 class="h1">Featured collection</h2>

<!-- ALLOWED: special display tier on a semantic heading -->
<h1 class="hxxxl">Campaign title</h1>
<h2 class="h0">Section campaign title</h2>

<!-- WRONG: non-heading element using heading class -->
<span class="h4">Not a heading element</span>
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

1. All user-visible text (page content, buttons, placeholders, error messages, ARIA copy, Theme Editor setting names, etc.) MUST use `| t` or `t:` -- no hardcoded strings.
2. Translation keys MUST follow `category.group.description` three-layer structure, use snake_case, and live in `locales/en.default.json` (storefront content) or `locales/en.default.schema.json` (editor schema copy).
3. All user-visible fields in `{% schema %}` (`name`, `label`, `info`, `options[].label`, `presets[].name`, and `default` values displayed on the storefront) MUST use `t:` -- no direct English.
4. Global settings in `config/settings_schema.json` MUST also use `t:` references to translation keys in `en.default.schema.json`.
5. All ARIA-related copy (e.g., `aria-label`, assistive text) MUST use a `| t` key.
6. Dynamic content MUST use t filter parameter interpolation -- no string concatenation to build complete sentences.
7. English copy uses sentence case for consistent style.

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

Schema settings:

```json
// CORRECT: Use t: prefix
{
    "name": "t:general.typography",
    "label": "t:labels.page_width",
    "info": "t:labels.page_width_info"
}

// WRONG: Hardcoded English
{
    "name": "Typography",
    "label": "Page width"
}
```

### Detailed Reference

See `docs/references/code-review/i18n-checklist.md` for:

- Translation key naming conventions
- Complete translation key list
- Audit checklist

---

## Lighthouse Issue Classification

Before changing code for a Lighthouse finding, agents MUST classify the issue as one of:

1. Theme code issue.
2. Merchant configuration issue.
3. Merchant content or copy issue.
4. Uploaded asset or media issue.
5. Shopify platform, app, or vendor issue.
6. Measurement noise or run-to-run variance.

Agents MUST NOT code-fix configuration, content, asset, platform, or measurement-noise issues unless the user explicitly authorizes that scope.

For every Lighthouse code change, report:

- audit id
- affected element or request
- why it is code-owned
- exact file changed
- expected metric impact
- re-test instruction

Color scheme contrast, merchant copy, collection/product content, uploaded media compression, Shopify platform scripts, app scripts, and vendor payloads are not theme-code issues by default.

---

## Accessibility

Accessibility is a hard Theme Store requirement. Do not treat it as optional polish. Agents MUST make interactive behavior keyboard-operable, named, and understandable without adding unnecessary ARIA to static content.

### Accessibility Principles

1. Native interactive elements first.
2. Keyboard access for every interactive feature.
3. Visible focus for keyboard users.
4. Accurate accessible names and state.
5. Minimal ARIA: add ARIA only when it communicates name, state, role, or relationship that native HTML does not already provide.
6. No content access should depend on animation, hover, pointer dragging, or mouse-only interaction.

### Native Elements

- Use `<button type="button">` for actions.
- Use `<a href="...">` for navigation.
- Use native form controls (`input`, `select`, `textarea`, `button`, `label`) when possible.
- Do not use `div` or `span` as clickable controls. If legacy code has `@click` or `onclick` on a non-interactive element, convert it to `button` or `a` unless the element is truly not user-operable.
- Do not add `role="button"` to a real `<button>`.
- Do not add `tabindex="0"` to static layout or text just to make it focusable.

### Keyboard Access

All user-operable features MUST be usable with keyboard alone:

- Buttons and links must be reachable with `Tab`.
- Buttons must activate with Enter/Space through native behavior.
- Dropdowns, drawers, modals, popups, lightboxes, search overlays, filter panels, tabs, accordions, carousels, image galleries, and comparison sliders must have keyboard paths.
- Escape SHOULD close transient UI such as modals, drawers, popups, dropdowns, search overlays, and lightboxes.
- Pointer-drag interactions need a keyboard alternative, such as buttons, a range input, or arrow-key support.

### Focus Management

- Keyboard focus MUST be visible via `:focus-visible` or an equivalent tokenized focus style.
- Opening a modal, drawer, lightbox, or search overlay SHOULD move focus into the opened UI, usually to the close button, heading, or first actionable control.
- Closing a modal, drawer, lightbox, or search overlay SHOULD return focus to the trigger that opened it when possible.
- Hidden content MUST NOT contain reachable focusable elements. `x-show` is acceptable for hiding closed panels; avoid hiding focusable content only with opacity or off-screen transforms.
- Do not use `aria-hidden="true"` on a container that contains focusable elements.

### Accessible Names

- All interactive elements MUST have an accessible name.
- Icon-only controls MUST use a translated `aria-label` or an `.sr-only` text node.
- If visible text already names a button or link, do not duplicate it with an unnecessary `aria-label`.
- ARIA copy must use `| t`; schema-facing labels must use `t:`.

### State And Relationships

Add ARIA state only where it communicates real state or relationships:

- Disclosure, accordion, dropdown trigger: `aria-expanded` and `aria-controls`.
- Current page/link: `aria-current="page"` when applicable.
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, and roving `tabindex` when using custom tabs.
- Dialog/modal/lightbox: `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` or `aria-label`.
- Busy or loading regions: `aria-busy` when useful.
- Dynamic feedback: `role="status"` and `aria-live="polite"` for non-critical updates; use assertive announcements sparingly.

### Images, Icons, And Media

- All rendered `<img>` elements MUST have an `alt` attribute.
- Product and content images SHOULD use real alt text from Shopify image data when available.
- Decorative images use `alt=""`.
- Icons rendered through the icon snippet are decorative by default; the parent control supplies the accessible name.
- Media controls MUST use native buttons/range inputs where possible.
- Auto-playing or animated media must be pausable and must respect reduced motion where applicable.

### Anti-Patterns

| Bad                                                | Correct                                                            |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| `<div @click="open = true">Open</div>`             | `<button type="button" @click="open = true">Open</button>`         |
| Icon-only button without text or `aria-label`      | Button with translated `aria-label` or `.sr-only` text             |
| Static text with `tabindex="0"`                    | Static text remains unfocusable                                    |
| `aria-hidden="true"` around focusable controls     | Hide closed UI with `x-show`, `hidden`, or remove focusable access |
| Custom drag-only control                           | Add buttons, range input, or keyboard arrow handling               |
| `aria-label` duplicating visible button text       | Let visible text provide the accessible name                       |
| Raw icon SVG used as a control without parent name | Render icon snippet inside a named button or link                  |

---

## File Organization

```text
AGENTS.md                      Repository-wide agent rules (this file)
WORKFLOW.md                    Phase flow, handoff protocol, and agent work loop
docs/                         Agent-readable RAG/reference layer
    agent/                    Current plan, decision log, and next-session context
    references/               Long references, checklists, and canonical patterns
.agents/skills/                Standard project Agent Skills entry point

icons/                         Temporary or persistent SVG build inputs for `npm run build:svg`

assets/
    base.js                    Component engine + Alpine init
    events.js                  ThemeEvents event bus
    https.js                   ShopifyHttp + SectionRefresher
    performance.js             Debug CWV monitoring
    alpine.components.js       Alpine component base factory
    alpine.components.*.js     Grouped Alpine component definitions
    alpine.components.registry.js  Merges component groups
    alpine.store.js            Alpine store base definitions
    alpine.store.*.js          Grouped Alpine store definitions
    alpine.store.registry.js   Merges/registers stores
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

### Ignore File Boundaries

Agents MUST classify files before adding ignore rules.

- `.shopifyignore` controls what Shopify CLI uploads or syncs. Agent governance files, development tooling, source-only build inputs, and local editor metadata belong here when they should not be part of the live theme.
- `.gitignore` controls what is kept out of version control. Use it for local machine files, dependency folders, CLI state, release archives, temporary reports, and generated artifacts that should not be tracked.
- `.prettierignore` controls formatting scope only. Use it for generated files, vendor/minified files, or directories where formatting would damage examples or generated output.

Tracked governance files such as `AGENTS.md` and `WORKFLOW.md` MUST remain in Git, MUST be excluded from Shopify upload, and SHOULD remain Prettier-formatted unless there is a specific formatting risk.

Do not add broad ignore patterns that hide source files, theme runtime files, schemas, locales, sections, snippets, templates, or config from review.

---

## Rule Coverage

Some rules are enforced by tooling; others remain review-only. `AGENTS.md` is still authoritative in both cases.

| Rule family                               | Current coverage                   | Gate                            |
| ----------------------------------------- | ---------------------------------- | ------------------------------- |
| Inline `<script>` in Liquid               | `npm run lint:theme`               | Blocker                         |
| Inline `<style>` in Liquid                | `npm run lint:theme`               | Blocker                         |
| Complex `x-data` values                   | `npm run lint:theme` partial check | Blocker for new code            |
| Raw `fetch()` in application code         | `npm run lint:theme`               | Blocker                         |
| Direct cart endpoints outside cart store  | `npm run lint:theme`               | Blocker                         |
| Manual section HTML replacement           | `npm run lint:theme`               | Blocker                         |
| Alpine component group references         | `npm run lint:theme`               | Blocker                         |
| Heading text-size utilities               | `npm run lint:theme`               | Blocker                         |
| Heading class on non-heading elements     | `npm run lint:theme`               | Blocker                         |
| i18n key usage                            | `npm run lint:i18n` plus review    | Blocker for user-facing strings |
| CSS syntax and common style issues        | stylelint                          | Blocker when lint fails         |
| Redundant matching heading classes        | Review only                        | Warning                         |
| Mismatched heading classes                | Review only                        | Warning; needs user decision    |
| Redundant default body typography classes | Review only                        | Legacy warning                  |
| CSS layer placement                       | Review only plus stylelint         | Warning                         |
| Motion recipe usage                       | Review only                        | Warning                         |
| Accessibility semantics                   | Review only                        | Launch blocker when user-facing |
| SEO metadata and structured content       | Review only plus Lighthouse        | Launch blocker when code-owned  |
| Generated files not hand-edited           | Review only                        | Warning                         |

Warnings should be staged after launch unless they affect Lighthouse, accessibility, SEO, runtime stability, or production behavior.

Known follow-ups:

1. Align the `body` default and `body-md` semantics before removing redundant default body classes.
2. Add a typography lint for redundant default body classes only after that alignment is complete.
3. Add a lint for redundant matching heading classes such as `<h2 class="h2">` only if review misses it repeatedly.
4. Add a lint for mismatched heading classes such as `<h2 class="h1">` only if review misses it repeatedly. Mismatches are semantic/visual decisions, not auto-fixable.
5. Add focused accessibility automation only after the checklist stabilizes and manual review proves unreliable.

---

## Pre-Merge Self-Check

Before considering a task complete, verify all applicable items below.

### Architecture

1. Liquid-driven runtime values are passed through `data-*`, not embedded directly in `x-data`.
2. Section/block behavior is wired through `Components.register()` when lifecycle management is needed.
3. Reusable Alpine behavior is registered in `alpine.components.*.js` (grouped by domain).
4. Cross-component communication uses `ThemeEvents`, while local component events remain lifecycle-scoped.
5. Application HTTP requests use `window.ShopifyHttp`; raw `fetch()` appears only in allowed infrastructure/vendor files.
6. Shopify section HTML refresh uses `window.ShopifySectionRefresher.render()`; local text/state/class updates use Alpine bindings or `updateText()`.
7. Animation and transition changes have been classified through `Motion Architecture` as capability, state motion recipe, choreography recipe, or usage.
8. Before extending any shared abstraction (base class, public utility, component used by 2+ sections), the three-question gate in `Abstraction Boundary Discipline` has been applied. Adding a new core-behavior-switching parameter to a public method is treated as a red flag, not as a routine change.
   If the abstraction was still extended, the changed invariants and the existing consumers checked against them have been explicitly listed.

### Product Page

1. Variant-driven behavior listens to `PRODUCT_VARIANT_CHANGED`.
2. New PDP features do not read state from sibling component DOM when an event-driven path exists.
3. Main product and featured product capability differences are explicit, not accidental.

### Assets and Styling

1. Tailwind-first styling is preserved; no ad-hoc `<style>` blocks are introduced.
2. New reusable CSS is placed in the correct Tailwind layer source file.
3. Empty `{% stylesheet %}` blocks are removed during cleanup.
4. Motion changes follow `Motion Architecture`; repeated Alpine transition groups use named recipes when available.
5. If Tailwind source changed, run `npm run build:tw`.
6. If SVG source changed, run `npm run build:svg`.

### Validation

1. Update locales when new user-facing strings are introduced.
2. Update README/docs when architecture, vendor, or build expectations change.
3. Run `npm run lint` after meaningful theme changes.
4. Run `npm test` after meaningful theme changes.
5. Run `npm run build:tw` when Tailwind source changed, then verify `assets/tailwind.output.css` is the only expected generated CSS output.
6. Run `npm run build:svg` when files in `icons/` changed, then verify generated `assets/icon-*.svg` output before using the icon snippet.
7. Keep the diff scoped to the task; avoid unrelated churn.
8. For cleanup tasks, report the rule family cleaned and any remaining staged follow-up.
