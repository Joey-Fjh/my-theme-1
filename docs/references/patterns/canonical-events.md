# Canonical ThemeEvents Usage

Use `ThemeEvents` for cross-component and cross-section communication. Local UI events inside one Alpine component may use Alpine event bindings, but behavior that crosses component boundaries should use typed events from `window.__Theme__.Events`.

## Emit From A Component

```javascript
AlpineComponentsFactory.register('canonicalVariantTrigger', function () {
    return {
        variantId: null,

        init() {
            this.variantId = Number(this.$el.dataset.variantId);
        },

        requestVariant() {
            const Events = window.__Theme__?.Events;
            const eventName = Events?.events?.PRODUCT_VARIANT_SET_REQUEST;
            if (!Events?.emit || !eventName || !this.variantId) return;

            Events.emit(eventName, {
                variantId: this.variantId,
                source: this.$el.dataset.sectionId || null,
            });
        },
    };
});
```

## Subscribe With Cleanup

```liquid
{%- javascript -%}
(function () {
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register('canonical-event-listener', {
        init(el) {
            const Events = window.__Theme__?.Events;
            const eventName = Events?.events?.PRODUCT_VARIANT_CHANGED;
            if (!Events?.on || !eventName) return {};

            const off = Events.on(eventName, (event) => {
                const variant = event.detail?.variant;
                if (!variant) return;

                el.dataset.currentVariantId = String(variant.id);
            });

            return { off };
        },

        destroy(_el, state) {
            state?.off?.();
        },
    });
})();
{%- endjavascript -%}
```

## Scoped Events

Use a scope when a component subscribes to multiple events or DOM targets.

```javascript
init(el) {
    const Events = window.__Theme__?.Events;
    if (!Events?.createScope) return {};

    const scope = Events.createScope({ target: el });
    scope.on('click', (event) => {
        const button = event.target.closest('[data-canonical-action]');
        if (!button) return;
        // Local delegated behavior.
    });

    scope.on(Events.events.PRODUCT_VARIANT_CHANGED, (event) => {
        // Cross-component behavior.
    });

    return { scope };
},

destroy(_el, state) {
    state?.scope?.dispose?.();
}
```

## Rules

- Cross-component and cross-section communication MUST use `ThemeEvents`.
- Add new cross-component event names to `ThemeEvents.events` in `assets/events.js`.
- Do not create ad-hoc `CustomEvent` objects in sections or snippets for cross-component behavior.
- Always keep the unsubscribe function or scope and dispose it during `destroy()`.
- Local UI events inside one Alpine component MAY use Alpine bindings such as `@click` and `@change`.
- Event payloads should be small structured objects, not DOM nodes from another component.
