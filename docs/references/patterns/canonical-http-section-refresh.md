# Canonical HTTP And Section Refresh

Use `window.ShopifyHttp` for application HTTP requests. Use `window.ShopifySectionRefresher.render()` for Shopify Section Rendering API responses and cart API `sections` responses. Do not use raw `fetch()` in application sections or snippets.

## Fetch JSON

```javascript
AlpineComponentsFactory.register('canonicalRemoteJson', function () {
    return {
        ...AlpineComponentsFactory.useDisposable(),
        loading: false,
        data: null,
        error: null,

        async load() {
            if (this.loading) return;

            const url = this.$el.dataset.url;
            const Http = window.ShopifyHttp;
            if (!url || !Http?.getJSON) return;

            this.loading = true;
            this.error = null;

            try {
                this.data = await Http.getJSON(url, {
                    credentials: 'same-origin',
                });
            } catch (error) {
                this.error = error;
                const message = this.$el.dataset.errorMessage;
                if (message) this.$store?.toast?.show?.(message, 'error');
            } finally {
                this.loading = false;
            }
        },

        destroy() {
            this.dispose();
        },
    };
});
```

## Refresh A Section

```javascript
AlpineComponentsFactory.register('canonicalSectionRefresh', function () {
    return {
        loading: false,

        async refresh() {
            if (this.loading) return;

            const sectionId = this.$el.dataset.sectionId;
            const targetSelector = this.$el.dataset.targetSelector;
            const Http = window.ShopifyHttp;
            const Refresher = window.ShopifySectionRefresher;

            if (!sectionId || !targetSelector || !Http?.request || !Refresher?.render) return;

            this.loading = true;

            try {
                const response = await Http.request(window.location.pathname, {
                    method: 'GET',
                    params: { section_id: sectionId },
                    headers: { Accept: 'text/html' },
                    credentials: 'same-origin',
                });
                const html = await response.text();

                Refresher.render(
                    { [sectionId]: html },
                    {
                        [sectionId]: {
                            targetSelector,
                        },
                    },
                );
            } finally {
                this.loading = false;
            }
        },
    };
});
```

## Local Text Update

Use `updateText()` for simple text-only updates when Alpine state is not the right fit.

```javascript
window.ShopifySectionRefresher.updateText([
    {
        selector: '[data-cart-count]',
        text: String(count),
    },
]);
```

## Rules

- Application code MUST use `window.ShopifyHttp`; raw `fetch()` is allowed only inside `assets/https.js` and vendor files.
- Cart endpoint mutations MUST go through `$store.cart`; do not call `/cart/*` endpoints from application components.
- Shopify section HTML replacement MUST use `window.ShopifySectionRefresher.render()`.
- Do not manually assign `innerHTML`, assign `outerHTML`, or call `replaceWith()` for section refreshes.
- Local loading, selected, visibility, aria, and class state SHOULD stay in Alpine bindings.
- Pass user-visible messages through translated `data-*` attributes.
- Extend `ShopifyHttp` only when the behavior belongs to the stable HTTP contract, not for one-off request handling.
