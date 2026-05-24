# i18n (Internationalization) Checklist

This document provides guidelines and checklist for internationalization compliance in this Shopify theme.

Reference: `AGENTS.md` Multi-language Specification section.

---

## Translation Key Classification

### Shopify Official Classification

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

### Naming Conventions

- Use snake_case for keys: `cart.title`, `search.placeholder`
- Group by feature: `cart.add_to_cart`, `cart.remove`
- Use descriptive names: `accessibility.close_dialog` not `accessibility.close`
- Use `_html` suffix for HTML content: `blog.article_metadata_html`

---

## Mandatory Rules

1. All user-visible text MUST use `| t` filter
2. Translation keys defined in `locales/en.default.json`
3. Other languages translated via Theme Editor
4. Schema defaults MUST be translated
5. Aria labels MUST be translated

---

## Audit Checklist

### Sections

- [ ] All hardcoded text replaced with `| t` filter
- [ ] Schema defaults translated
- [ ] Aria labels translated
- [ ] Placeholder text translated
- [ ] Button text translated
- [ ] Error messages translated
- [ ] Loading states translated
- [ ] Empty states translated

### Snippets

- [ ] All hardcoded text replaced with `| t` filter
- [ ] Aria labels translated
- [ ] Button text translated
- [ ] Status text translated
- [ ] Error messages translated

### Common Issues

- [ ] Check for commented-out `| t` calls (e.g., `snippets/pagination.liquid`)
- [ ] Check for missing translation keys in `en.default.json`
- [ ] Check for typos in translation keys
- [ ] Check for hardcoded brand names (should be in settings or translated)

---

## Examples

### CORRECT

```liquid
{%- comment -%} Use | t filter {%- endcomment -%}
<h1>{{ 'cart.title' | t }}</h1>
<button aria-label="{{ 'accessibility.close_dialog' | t }}">×</button>
<input placeholder="{{ 'search.placeholder' | t }}">
```

### WRONG

```liquid
{%- comment -%} Hardcoded text {%- endcomment -%}
<h1>Cart</h1>
<button aria-label="Close">×</button>
<input placeholder="Search...">
```

---

## Translation Key Reference

### Current Keys in `en.default.json`

See `locales/en.default.json` for complete list.

### Missing Keys (Need to Add)

Based on codebase analysis, the following keys are missing:

- `cart.order_summary`
- `cart.estimate_total`
- `cart.shop_more`
- `cart.add_more_product`
- `cart.empty`
- `cart.loading`
- `search.no_results`
- `search.no_products`
- `search.no_articles`
- `search.no_pages`
- `filters.title`
- `filters.close`
- `pagination.previous`
- `pagination.next`
- `product.add_to_cart`
- `product.sold_out`
- `product.buy_now`
- `product.unavailable`
- `product.adding`
- `product.view_full_details`
- ... (see full analysis in conversation)

---

## Next Steps

1. Run `grep -r "| t" sections/ snippets/` to find existing translations
2. Run `grep -r "hardcoded" sections/ snippets/` to find missing translations
3. Add missing keys to `en.default.json`
4. Replace hardcoded text with `| t` filter
5. Verify all translations work correctly
