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

If any supporting document conflicts with this file, `AGENTS.md` wins.

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

### Golden Rules

1. NEVER write inline `<script>` tags or bare DOM listeners.
2. All section/block JS behavior MUST go through `Components.register()` inside a `{%- javascript -%}` block.
3. All Alpine component behavior MUST be registered via `AlpineComponentsFactory.register()` in `alpine.components.js`.
4. All cross-component communication MUST use `ThemeEvents` -- no direct DOM coupling between sections.
5. All HTTP requests MUST use `window.ShopifyHttp` -- no raw `fetch()` calls.
6. All section DOM refresh after AJAX MUST use `window.ShopifySectionRefresher.render()`.

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
| Raw `fetch()` calls                                  | `window.ShopifyHttp.getJSON()` / `.postJSON()`                                              |
| Manual DOM innerHTML after AJAX                      | `window.ShopifySectionRefresher.render()`                                                   |
| Custom CSS in `<style>` tags                         | Tailwind utility classes                                                                    |
| Liquid values directly in `x-data="..."`             | `data-*` attributes + `this.$el.dataset`                                                    |
| Bare `gsap.to(...)` outside context                  | `gsap.context(() => { ... }, el)` with cleanup                                              |
| Custom event via `new CustomEvent(...)`              | `ThemeEvents.emit(type, detail)`                                                            |
| Raw `<svg>` pasted in Liquid                         | `{%- render 'icons', icon: 'icon-name' -%}` via icon pipeline                               |
| Manually editing `assets/icon-*.svg`                 | Generate from `icons/` via `npm run build:svg` after checking for existing equivalent icons |

---

## CSS Rules

### Golden Rules

1. Tailwind utility classes first. No `<style>` blocks in Liquid templates.
2. Use `{% stylesheet %}` only for styles Tailwind cannot express.
3. Reusable patterns go in the appropriate CSS layer file, not inline.
4. NEVER use Tailwind text sizes (`text-lg`, `text-4xl`) for headings -- use `hxxxl`--`h6`.
5. NEVER use responsive prefixes for heading font sizes -- scaling is handled by CSS variables.

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
4. Cross-component communication uses `ThemeEvents`, not direct DOM coupling.
5. HTTP requests use `window.ShopifyHttp`.
6. AJAX DOM refresh uses `window.ShopifySectionRefresher.render()`.
7. Before extending any shared abstraction (base class, public utility, component used by 2+ sections), the three-question gate in `Abstraction Boundary Discipline` has been applied. Adding a new core-behavior-switching parameter to a public method is treated as a red flag, not as a routine change.
   If the abstraction was still extended, the changed invariants and the existing consumers checked against them have been explicitly listed.

### Product Page

1. Variant-driven behavior listens to `PRODUCT_VARIANT_CHANGED`.
2. New PDP features do not read state from sibling component DOM when an event-driven path exists.
3. Main product and featured product capability differences are explicit, not accidental.

### Assets and Styling

1. Tailwind-first styling is preserved; no ad-hoc `<style>` blocks are introduced.
2. New reusable CSS is placed in the correct Tailwind layer source file.
3. If Tailwind source changed, run `npm run build:tw`.
4. If SVG source changed, run `npm run build:svg`.

### Validation

1. Update locales when new user-facing strings are introduced.
2. Update README/docs when architecture, vendor, or build expectations change.
3. Run `npm test` after meaningful theme changes.
4. Keep the diff scoped to the task; avoid unrelated churn.
