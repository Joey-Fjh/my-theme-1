# i18n (Internationalization) Checklist

This document provides guidelines and checklist for internationalization compliance in this Shopify theme.

Reference: `AGENTS.md` Multi-language Specification section.

---

## Core Rules

1. All user-visible text (including page content, buttons, form placeholders, error messages, ARIA copy, Theme Editor setting names, etc.) MUST use `| t` or `t:` — no hardcoded strings.
2. Translation keys MUST follow a `category.group.description` three-layer structure, use snake_case, and live in `locales/en.default.json` (storefront content) or `locales/en.default.schema.json` (editor schema copy).
3. All user-visible fields in `{% schema %}` (`name`, `label`, `info`, `options[].label`, `presets[].name`, and `default` values displayed on the storefront) MUST use `t:` — no direct English.
4. Global settings in `config/settings_schema.json` MUST also use `t:` references to translation keys in `en.default.schema.json`.
5. All ARIA-related copy (e.g., `aria-label`, assistive text) MUST use a `| t` key.
6. Dynamic content MUST use t filter parameter interpolation — no string concatenation to build complete sentences.
7. English copy uses sentence case for consistent style.
8. Lint/CI checks MUST prevent hardcoded English and illegal/duplicate translation keys.

---

## Translation File Overview

### `locales/en.default.json`

User-visible text translations. Used in Liquid templates via the `| t` filter:

```liquid
<h1>{{ 'cart.title' | t }}</h1>
<button aria-label="{{ 'accessibility.close_dialog' | t }}">×</button>
```

### `locales/en.default.schema.json`

Schema setting translations. Used for `label`, `content`, `info`, `default`, etc. in section schemas and global `config/settings_schema.json`. Referenced via the `t:` prefix:

```json
{
    "name": "t:general.typography",
    "settings": [
        {
            "type": "range",
            "id": "page_width",
            "label": "t:labels.page_width"
        }
    ]
}
```

Coverage:
- `config/settings_schema.json` — Global theme settings (Logo, Typography, Layout, Colors, Input, Button, Surface, Focus, Social Icon, etc.)
- `sections/*.json` and `sections/*.liquid` schemas — Section and Block settings

---

## Translation Key Naming Conventions

### Three-Layer Structure: `category.group.description`

- **category**: Functional area (e.g., `cart`, `product`, `search`, `accessibility`, `general`)
- **group**: Sub-group (optional, for organizing complex structures)
- **description**: Specific description

Examples:
- `cart.title` — Cart title
- `cart.item.remove` — Remove item
- `accessibility.close_dialog` — Close dialog
- `product.sold_out` — Sold out

### Naming Rules

- Use snake_case: `cart.title`, `search.placeholder`
- Group by feature: `cart.add_to_cart`, `cart.remove`
- Use descriptive names: `accessibility.close_dialog` not `accessibility.close`
- Use `_html` suffix for HTML content: `blog.article_metadata_html`

---

## Audit Checklist

### Sections

- [ ] All hardcoded text replaced with `| t` filter
- [ ] Schema `name`, `label`, `info`, `options[].label`, `presets[].name` use `t:` prefix
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

### Global Settings (`config/settings_schema.json`)

- [ ] All `name`, `label`, `content`, `info` use `t:` prefix
- [ ] Missing translation keys added to `en.default.schema.json`

### Dynamic Content

- [ ] Dynamic sentences use t filter parameter interpolation, not string concatenation
- [ ] English copy uses sentence case

### Common Issues

- [ ] Check for commented-out `| t` calls
- [ ] Check for missing translation keys in `en.default.json`
- [ ] Check for missing schema translation keys in `en.default.schema.json`
- [ ] Check for typos in translation keys
- [ ] Check for hardcoded brand names (should be in settings or translated)
- [ ] Check for duplicate translation keys

---

## Examples

### User-Visible Text (`| t` filter)

```liquid
<!-- CORRECT -->
<h1>{{ 'cart.title' | t }}</h1>
<button aria-label="{{ 'accessibility.close_dialog' | t }}">×</button>
<input placeholder="{{ 'search.placeholder' | t }}">

<!-- WRONG -->
<h1>Cart</h1>
<button aria-label="Close">×</button>
<input placeholder="Search...">
```

### Schema Settings (`t:` prefix)

```json
// CORRECT
{
    "name": "t:general.typography",
    "label": "t:labels.page_width",
    "info": "t:labels.page_width_info"
}

// WRONG
{
    "name": "Typography",
    "label": "Page width",
    "info": "Page width description"
}
```

### Dynamic Content (Parameter Interpolation)

```liquid
<!-- CORRECT: parameter interpolation via t filter -->
{{ 'cart.item_count' | t: count: cart.item_count }}

<!-- WRONG: string concatenation -->
<span>{{ cart.item_count }} items</span>
```

---

## Translation Key Reference

### `en.default.json` — User-Visible Text

See `locales/en.default.json` for the complete list.

### `en.default.schema.json` — Schema Settings

Current keys:

```json
{
    "general": {
        "404", "article", "blog", "cart", "collection", "collections_grid",
        "colors", "footer", "header", "layout", "page", "password", "product",
        "search", "typography"
    },
    "labels": {
        "background", "grid_gap", "grid_item_width", "menu", "page_margin",
        "page_width", "show_payment_icons"
    },
    "options": {
        "size": { "large", "small" }
    }
}
```

### Missing Keys (Need to Add)

The following settings in `config/settings_schema.json` still use hardcoded text and need keys added to `en.default.schema.json`:

**Logo:**
- `name`: "Logo"
- `label`: "Logo", "Logo width", "Favicon"
- `info`: "Display 32 * 32 px"

**Typography:**
- `content`: "About Custom font,please check out document：..."
- `content`: "Header", "Body"
- `label`: "Use custom font URL for headings", "Custom heading font family name", "Custom heading font file URL (.woff2 recommended)", "Font", "Scale"
- `label`: "Use custom font URL for body", "Custom body font family name", "Custom body font file URL (.woff2 recommended)"

**Layout:**
- `content`: "Page Settings", "Section Settings"
- `label`: "Padding Top", "Padding Bottom"

**Colors:**
- `label`: "Background gradient", "Icons color", "Links color", "Border color", "Strong border color", "Focus ring color", "Primary button label color", "Secondary button label color", "Primary button background color", "Primary button border color", "Secondary button background color", "Secondary button border color", "Text color", "Badge background color", "Badge label color", "Badge border color"
- `info`: "The background gradient will replace the background color at all applicable positions."

**Input:**
- `name`: "Input"
- `content`: "Border", "Shadow"
- `label`: "Input border thickness", "Input radius", "Input shadow opacity", "Input shadow horizontal offset", "Input shadow vertical offset", "Input shadow blur"

**Button:**
- `name`: "Button"
- `content`: "Border", "Shadow"
- `label`: "Button border thickness", "Button radius", "Button shadow opacity", "Button shadow horizontal offset", "Button shadow vertical offset", "Button shadow blur"

**Surface:**
- `name`: "Surface"
- `content`: "Border", "Shadow"
- `label`: "Surface border thickness", "Surface radius", "Surface shadow opacity", "Surface shadow horizontal offset", "Surface shadow vertical offset", "Surface shadow blur"

**Focus:**
- `name`: "Focus"
- `label`: "Focus ring width", "Focus ring offset"

**Social Icon:**
- `name`: "Social Icon"

---

## Next Steps

1. Run `grep -r "| t" sections/ snippets/` to find existing user-visible text translations
2. Run `grep -r "t:" config/settings_schema.json` to find existing schema translations
3. Add missing user-visible text keys to `en.default.json`
4. Add missing schema setting keys to `en.default.schema.json`
5. Replace hardcoded text with `| t` filter
6. Replace hardcoded schema label/content/info with `t:` prefix references
7. Verify all translations work correctly
