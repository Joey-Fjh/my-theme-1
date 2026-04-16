---
name: shopify-theme-architecture
description: Enforces this Shopify theme's front-end architecture — Tailwind CSS, Alpine.js, GSAP, and the custom Components.register() engine. Use when creating or modifying Liquid sections/snippets, writing JavaScript behavior, styling UI, implementing state management, or adding animations. Pair with shopify-theme-repo-rules for formatting, naming, and safe-edit conventions.
---

# Shopify Theme Front-End Architecture

## Golden Rules

1. **CSS** — Use Tailwind utility classes exclusively. No `<style>` blocks or custom CSS unless unavoidable (pseudo-elements). Use `{% stylesheet %}` only for edge cases that Tailwind cannot express.
2. **JavaScript** — NEVER write inline `<script>` tags, bare DOM listeners, or global code. All JS must go through `Components.register()` inside a `{%- javascript -%}` block.
3. **State** — Use Alpine.js. `x-data` for local UI state; `Alpine.store()` for global shared state.
4. **HTML** — Semantic elements (`<article>`, `<nav>`, `<aside>`, etc.). Root of every section component must carry the three data attributes that bind it to the engine.
5. **SVG** - Prefer the repository SVG asset workflow for reusable icons instead of duplicating inline SVG markup.

---

## Component Engine (`Components.register`)

### Registration Pattern

Every section or block that needs JS behavior must follow this pattern inside a `{%- javascript -%}` block:

```javascript
(function(){
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register(
        'component-name',
        {
            init(el) {
                // setup: GSAP, observers, event listeners
                // MUST return a state object for cleanup
                return { /* references to clean up */ };
            },

            destroy(el, state) {
                // MUST clean up everything: ctx.revert(), disconnect(), removeEventListener()
            }
        },
        { lazy: true }
    );
})();
```

### Lifecycle Methods

| Method | Signature | Purpose |
|--------|-----------|---------|
| `init` | `init(el) → state` | Setup. Return an object with references needed for teardown. |
| `destroy` | `destroy(el, state)` | Teardown. Revert GSAP, destroy Swiper, remove listeners. |
| `select` | `select(el, state)` | Optional. Fires when selected in the Theme Editor. |
| `deselect` | `deselect(el, state)` | Optional. Fires when deselected in the Theme Editor. |

### DOM Discovery — Required Attributes

The engine finds components via `[data-component-type][data-component-id]`. Every component root element needs:

```html
<div
    data-component-kind="section"
    data-component-type="component-name"
    data-component-id="{{ section.id }}"
>
```

| Attribute | Value |
|-----------|-------|
| `data-component-kind` | `"section"` or `"block"` |
| `data-component-type` | Must match the first argument to `Components.register()` |
| `data-component-id` | `{{ section.id }}` (or `{{ block.id }}` for blocks) |

Also include `data-section-id="{{ section.id }}"` on the root for Shopify conventions.

### Automatic Cleanup

The engine's MutationObserver auto-destroys components when their DOM is removed (Theme Editor reloads, section pagination swaps). You still must implement `destroy()` to release your own resources.

---

## Liquid Section Template

A complete section follows this skeleton:

```liquid
<section
    data-section-id="{{ section.id }}"
    class="full-width"
    style="
        --section-padding-top: {{ section.settings.padding_top }}px;
        --section-padding-bottom: {{ section.settings.padding_bottom }}px;
    "
    data-component-kind="section"
    data-component-type="my-section"
    data-component-id="{{ section.id }}"
>
    <div class="layout container-page">
        {%- comment -%} Markup here — Tailwind classes only {%- endcomment -%}
    </div>
</section>

{%- javascript -%}
(function(){
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register('my-section', {
        init(el) {
            // ...
            return {};
        },
        destroy(el, state) {
            // ...
        }
    }, { lazy: true });
})();
{%- endjavascript -%}

{% schema %}
{
    "name": "My Section",
    "tag": "section",
    "class": "section",
    "settings": [],
    "blocks": [],
    "presets": [{ "name": "My Section" }]
}
{% endschema %}
```

---

## GSAP Animations

### Setup Pattern

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
            duration: 0.5,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                once: true
            }
        });
    }, el);

    return { ctx };
}
```

### Cleanup — Always `ctx.revert()`

```javascript
destroy(el, state) {
    if (state?.ctx) state.ctx.revert();
}
```

### Conventions

- Mark animation targets with `data-gsap-*` attributes (e.g. `data-gsap-image`, `data-gsap-card`, `data-gsap-content`).
- Set initial hidden state with `gsap.set()` or Tailwind classes (`opacity-0`, `translate-y-7.5`).
- ScrollTrigger: `trigger: el`, `start: 'top 75%'` to `'top 85%'`, `once: true`.
- Use `gsap.timeline()` with `defaults: { ease: 'power2.out' }` when sequencing multiple tweens. Overlap with negative offsets like `'-=0.5'`.

---

## Alpine.js

### Loading Order

Refer to `engine-reference.md` for current script load order and runtime implementation details.

Alpine must load **last** so all `Alpine.data()` registrations happen during `alpine:init`.

### Local State (`x-data`)

Use for self-contained UI — toggles, dropdowns, accordions, hover states:

```html
<div x-data="{ open: false }">
    <button @click="open = !open">Toggle</button>
    <div x-show="open" x-transition x-cloak>Content</div>
</div>
```

For Liquid-driven dynamic values, avoid embedding complex Liquid output directly inside `x-data` expressions (for example nested objects with `{{ ... | json }}`), because malformed quoting can break Alpine parsing. Prefer `data-*` attributes on the element and read values inside the Alpine component implementation (for example in `init()` via `this.$el.dataset`), while keeping `x-data` invocation simple.

```html
<div
    data-api-url="{{ api_url | escape }}"
    data-section-id="{{ section.id }}"
    x-data="myComponent()"
></div>
```

### Registered Alpine Components

Complex, reusable behaviors are defined in `assets/alpine.components.js` and registered via `AlpineComponentsFactory`. Keep the main skill principle-based; treat code as the source of truth for the current component inventory.

To add a new Alpine component, define it in `alpine.components.js` and register it in the `alpine:init` listener in `base.js`.

### Plugin: Intersect

Use `x-intersect` for in-view triggers when the Intersect plugin is available in the current runtime:

```html
<div x-data="{ visible: false }" x-intersect:enter.once="visible = true">
```

### Alpine + Component Engine Coexistence

Both systems can live on the same element. The engine handles lifecycle (GSAP, Swiper, etc.) while Alpine handles reactive UI state. The MutationObserver dispatches an `unmount` event on `[x-data]` elements when DOM is removed, enabling Alpine component cleanup via `useDisposable()`.

---

## Tailwind CSS

### Tailwind Class Authoring

1. Prefer existing project class patterns over inventing new utility combinations.
2. Keep inline utility usage readable; if a class string becomes repeated or structurally important across sections, move it into the proper CSS layer.
3. Do not introduce ad-hoc custom CSS when Tailwind utilities already express the intent clearly.
4. Avoid overly complex dynamic class expressions in Liquid. If a class value has defaults or conditions, prefer assigning it in Liquid first, then render a simpler attribute.
5. Let the repository formatter and Tailwind plugin control class ordering. Do not manually reorder classes based on personal preference.

### Configuration (v4, CSS-based)

Tailwind configuration is CSS-based in this repo. Refer to the current Tailwind input/build files rather than assuming a fixed config filename.

Custom breakpoints:

| Token | Value | Usage |
|-------|-------|-------|
| `pc` | `48rem` | Desktop |
| `fw` | `80rem` | Full-width |

Use `pc:` prefix for desktop styles (e.g. `pc:grid-cols-2`, `max-pc:hidden`).

### Build

```bash
npm run watch:tw   # development (watch mode)
npm run build:tw   # production build
npm run dev        # shopify theme dev + tailwind watch
```

Input/output file paths may evolve; rely on the current theme scripts and repository files as the source of truth.

### CSS Architecture (layered imports)

| Layer | File | Purpose |
|-------|------|---------|
| base | `vendor-swiper.min.css`, `base.css` | Resets, typography, section utilities |
| elements | `tailwind.elements.css` | Atomic UI units (`container-page`, `surface`, `icons`, `links`) |
| components | `tailwind.components.css` | Composite modules (`.dropdown`, `.localization-switcher`) |
| utilities | `tailwind.utilities.css` | Layout helpers |
| animates | `tailwind.animates.css` | `@keyframes`, Alpine transition classes, `@theme` motion vars |

### When Custom CSS Is Acceptable

- `{% stylesheet %}` blocks: only for styles Tailwind cannot express (Swiper overrides, complex selectors on third-party markup).
- `tailwind.components.css` / `tailwind.elements.css`: for reusable `@utility` or component classes that appear across many sections.
- **Never** add a `<style>` tag inside a Liquid template.

### Typography & Headings (Strictly Enforced)

- **NO Tailwind Text Sizes for Headings:** NEVER use Tailwind's built-in text size utilities (e.g., `text-lg`, `text-xl`, `text-4xl`, `text-[10rem]`) for headings or large display text.
- **NO Tailwind Responsive Font Sizes:** DO NOT use responsive prefixes for font sizes on headings (e.g., `md:text-5xl`). The responsiveness and scaling are already handled natively in `base.css` via media queries and CSS variables (`--font-heading-scale`).
- **USE Custom Classes:** You MUST STRICTLY USE our custom semantic tags or utility classes for all titles and headings:
  `hxxxl`, `hxxl`, `hxl`, `h0`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`.
- **Allowed Tailwind Typography:** You may still use Tailwind for text alignment (`text-center`), colors (`text-[#263D29]`), or body text sizing (`text-sm`, `text-base` for standard paragraphs ONLY).

---

## Accessibility (A11y) Standards

We build inclusive themes. Cursor MUST adhere to these accessibility guidelines when generating HTML:

1. **Interactive Elements**: All `<button>`, `<a>`, and `<input>` elements MUST have descriptive text. If an element is icon-only, it MUST include an `aria-label` or a visually hidden span (`<span class="sr-only">`).
2. **Dynamic Feedback**: Any dynamically injected feedback (e.g., Toast notifications, error messages, cart updates) MUST be wrapped in or contain `role="status"` and `aria-live="polite"` so screen readers can announce the changes.
3. **Forms**: Inputs must be explicitly associated with labels (using `id` and `for`, or wrapping the input) and use proper `aria-invalid` states when errors occur.
4. **Focus Management**: Modals, drawers, and popups should trap focus when open.

---

## Performance & Debugging

This theme includes runtime performance monitoring (Core Web Vitals and long-task visibility) based on browser performance APIs.

- **How to activate**: Performance logs are disabled in production by default. To view them in the browser console, append `?debug=true` to the URL or view the theme inside the Shopify Theme Editor.
- **Cursor's Responsibility**: When writing complex GSAP animations, large DOM manipulations, or heavy Alpine.js logic, ALWAYS optimize for performance to avoid triggering "Long Task" warnings (>50ms) in the performance monitor. Prefer `requestAnimationFrame` for visual updates and `debounce` for high-frequency events.

---

## Reusable Snippets

Render shared UI with `{% render %}`:

- Reuse existing snippets before adding new section-specific markup.
- Keep snippet APIs consistent and explicit through named arguments.
- Prefer extending a shared snippet over duplicating markup across sections.

Always check if an existing snippet covers your need before creating new markup.

---

## Swiper.js Integration

For carousels/sliders, use Swiper inside `Components.register`:

```javascript
init(el) {
    const swiperContainer = el.querySelector('.swiper');
    if (!swiperContainer || typeof Swiper === 'undefined') return;

    const swiper = new Swiper(swiperContainer, {
        loop: true,
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: { crossFade: true }
    });

    return { swiper };
},

destroy(el, state) {
    if (state?.swiper?.destroy) state.swiper.destroy(true, true);
}
```

Markup: standard Swiper structure (`.swiper` > `.swiper-wrapper` > `.swiper-slide`).

---

## Anti-Patterns — NEVER Do These

| Bad Practice | Correct Approach |
|---|---|
| Inline `<script>` with DOM listeners | `Components.register()` inside `{%- javascript -%}` |
| `document.addEventListener('DOMContentLoaded', ...)` | Component `init()` — the engine handles timing |
| `document.querySelector(...)` at top level | `el.querySelector(...)` scoped inside `init(el)` |
| Custom CSS in `<style>` tags | Tailwind utility classes |
| jQuery or vanilla global DOM manipulation | Alpine.js for reactivity, Component engine for lifecycle |
| Forgetting `destroy()` cleanup | Always return state from `init()`, always implement `destroy()` |
| Bare `gsap.to(...)` outside a context | Always `gsap.context(() => { ... }, el)` and return `{ ctx }` |
