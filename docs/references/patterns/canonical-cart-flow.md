# Canonical Cart Flow

Use `$store.cart` for storefront cart state and cart endpoint mutations. Business components should not call `/cart/*` endpoints directly.

## Add To Cart

```liquid
<form
    x-data="canonicalAddToCart"
    data-variant-id="{{ product.selected_or_first_available_variant.id }}"
    data-section-id="{{ section.id }}"
    @submit.prevent="submit()"
>
    <button type="submit" class="btn btn-primary" :disabled="loading">
        <span x-show="!loading">{{ 'products.product.add_to_cart' | t }}</span>
        <span x-show="loading">{{ 'accessibility.loading' | t }}</span>
    </button>
</form>
```

```javascript
AlpineComponentsFactory.register('canonicalAddToCart', function () {
    return {
        variantId: null,
        sectionId: null,
        loading: false,

        init() {
            const data = this.$el.dataset;
            this.variantId = Number(data.variantId);
            this.sectionId = data.sectionId || null;
        },

        submit() {
            if (!this.variantId || this.loading) return;

            this.loading = true;

            const sections = this.sectionId ? [this.sectionId] : [];
            this.$store.cart.add([{ id: this.variantId, quantity: 1 }], sections).finally(() => {
                this.loading = false;
            });
        },
    };
});
```

## Quantity Change

```liquid
<button
    type="button"
    aria-label="{{ 'cart.remove' | t }}"
    @click.prevent="$store.cart.change('{{ item.key }}', 0, ['{{ section.id }}'])"
>
    {%- render 'icons', icon: 'icon-close', size: 'sm', color: 'currentColor' -%}
</button>
```

## Rules

- Use `$store.cart.add()`, `change()`, `update()`, and `fetchCart()` for cart behavior.
- Let `$store.cart` own cart endpoint calls, cart state hydration, error handling, and cart section rendering.
- Use `ShopifySectionRefresher.render()` only inside store/infrastructure or dedicated section refresh flows.
- Do not call `/cart/add.js`, `/cart/change.js`, `/cart/update.js`, or `/cart.js` from section code.
- Define new translation keys in `locales/en.default.json`; if a component needs configurable text, pass it through `data-*`.
