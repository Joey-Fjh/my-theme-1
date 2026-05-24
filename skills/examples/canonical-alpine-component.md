# Canonical Alpine Component

Use this shape for reusable local UI state. Liquid provides configuration through `data-*`; behavior lives in `assets/alpine.components.js`.

## Liquid Usage

```liquid
<div
    x-data="canonicalToggle"
    data-initial-open="{{ section.settings.open_by_default }}"
    data-section-id="{{ section.id }}"
>
    <button
        type="button"
        class="btn btn-secondary"
        :aria-expanded="String(open)"
        @click="toggle()"
    >
        {{ 'accessibility.toggle' | t }}
    </button>

    <div x-show="open" x-cloak>
        {{ section.settings.content }}
    </div>
</div>
```

## Registration

```javascript
AlpineComponentsFactory.register('canonicalToggle', function () {
    return {
        ...AlpineComponentsFactory.useDisposable(),
        open: false,
        sectionId: null,

        init() {
            const data = this.$el.dataset;
            this.open = data.initialOpen === 'true';
            this.sectionId = data.sectionId || null;

            const onKeydown = (event) => {
                if (event.key === 'Escape') this.open = false;
            };

            this.addListener(window, 'keydown', onKeydown);
        },

        toggle() {
            this.open = !this.open;
        },

        dispose() {
            this.disposeAll();
        },
    };
});
```

## Rules

- Use simple Alpine expressions in Liquid; put business logic in the registered component.
- Use `data-*` for Liquid-provided values, then read `this.$el.dataset`.
- Use `useDisposable()` when adding listeners, observers, timers, or abort controllers.
- Use `$store` or `ThemeEvents` for cross-component behavior; do not query sibling sections directly.
