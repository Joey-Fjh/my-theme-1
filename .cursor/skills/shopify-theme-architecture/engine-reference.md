# Component Engine — Full API Reference

Source: `assets/base.js`, class `Components` (lines 99–406).

## Static Properties

| Property | Type | Purpose |
|----------|------|---------|
| `registry` | `Map` | Registered component definitions (type → handlers + options) |
| `instances` | `Map` | Active component instances (instanceKey → record) |
| `observer` | `MutationObserver` | Auto-destroys components when DOM nodes are removed |
| `io` | `IntersectionObserver` | Lazy-initializes components when they enter the viewport |
| `lazyLoad` | `boolean` | Global lazy loading switch (default `true`) |

## Attributes

```javascript
static ATTR = {
    type: 'data-component-type',   // component name
    id:   'data-component-id',     // unique instance id
    kind: 'data-component-kind'    // "section" or "block"
};
```

Selector: `[data-component-type][data-component-id]`

## `Components.register(type, handlers, options)`

| Param | Type | Notes |
|-------|------|-------|
| `type` | `string` | Must match `data-component-type` on the DOM element |
| `handlers.init` | `(el: HTMLElement) => object \| void` | Return value is stored as `state` |
| `handlers.destroy` | `(el: HTMLElement, state: object) => void` | Called on teardown |
| `handlers.select` | `(el: HTMLElement, state: object) => void` | Theme Editor: section/block selected |
| `handlers.deselect` | `(el: HTMLElement, state: object) => void` | Theme Editor: section/block deselected |
| `options.lazy` | `boolean` | Default `true`. When `true`, init is deferred until the element enters the viewport via IntersectionObserver. |

If `type` is already registered, the call is silently ignored (no overwrite).

## Lifecycle Flow

```
1. Page load / section insert
   └─ setupLifecycle() installs MutationObserver + IntersectionObserver
       └─ initAll(document) scans for [data-component-type][data-component-id]
           ├─ lazy: true  → IntersectionObserver watches element → init on intersect
           └─ lazy: false → initElement(el) called immediately

2. initElement(el)
   └─ Calls handler.init(el)
   └─ Stores { el, state, destroy } in instances Map

3. DOM removal (MutationObserver fires)
   └─ destroyElement(el)
       └─ Calls handler.destroy(el, state)
       └─ Unobserves from IntersectionObserver
       └─ Removes from instances Map
       └─ Dispatches 'unmount' on [x-data] elements (Alpine cleanup)

4. Theme Editor events
   └─ shopify:section:load    → initAll(target)
   └─ shopify:section:unload  → destroyAll(target)
   └─ shopify:section:select  → handler.select(el, state)
   └─ shopify:section:deselect → handler.deselect(el, state)
   └─ shopify:block:select    → handler.select(el, state)
   └─ shopify:block:deselect  → handler.deselect(el, state)
```

## Alpine Integration

The engine dispatches a custom `unmount` event (non-bubbling) on all `[x-data]` elements inside removed DOM nodes. Alpine components using `AlpineComponentsFactory.useDisposable()` listen for this event and call their `dispose()` method.

Registration of Alpine components happens in `base.js` inside `alpine:init`:

```javascript
document.addEventListener('alpine:init', () => {
    Factory.init?.(window.Alpine);
    Factory.register?.(Comps.DROPDOWN, Comps.dropdown);
    // ... more registrations
});
```

## Script Load Order (layout/theme.liquid)

```
1. gsap.js                    (GSAP core)
2. gsap-ScrollTrigger.js      (ScrollTrigger plugin)
3. swiper.js                  (Swiper carousel)
4. utils.js                   (Theme utilities)
5. alpine.components.js       (Alpine component definitions)
6. base.js                    (Components engine + Alpine init)
7. alpine-intersect.js        (Alpine Intersect plugin)
8. alpine.js                  (Alpine core — MUST be last)
```

All scripts use `defer`.
