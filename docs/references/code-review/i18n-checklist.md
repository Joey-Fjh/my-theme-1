# Internationalization Checklist

Use this reference when changing storefront copy, accessibility text, section schema, global theme settings, or locale files. `AGENTS.md` remains authoritative.

## Locale Boundaries

| Content | Source | Usage |
| --- | --- | --- |
| Storefront text, form copy, status messages, and accessible names | `locales/en.default.json` | Liquid `| t` |
| Supported Theme Editor schema copy | `locales/en.default.schema.json` | Schema `t:` reference |
| Merchant content and preset instance values | Schema defaults or preset values | Literal value only when needed |

Use descriptive, snake_case keys grouped by feature. The hierarchy should reflect ownership; a fixed number of key segments is not required.

## Storefront Rules

- Translate visible theme-owned copy, including buttons, placeholders, empty states, validation messages, loading states, and assistive text.
- Build complete dynamic sentences with translation parameters instead of concatenating fragments.
- Keep merchant content, resource titles, product data, and other store-owned values as data rather than locale keys.
- Use sentence case for English UI copy unless a proper name or established label requires otherwise.

Example:

```liquid
{{ 'cart.item_count' | t: count: cart.item_count }}
```

## Schema Rules

Use `t:` only in schema fields Shopify resolves through schema locale files, including:

- section and block names
- setting labels, help text, placeholders, and supported informational content
- option labels
- preset names and categories
- supported user-visible text defaults

Keep configuration tokens literal. Examples include enum values, booleans, numbers, URLs, resource handles, metafield paths, font identifiers, and other machine-consumed defaults.

Do not assume that every property named `default` is translatable. The setting type and Shopify's schema-locale support determine whether `t:` is valid.

## Preset Instance Values

`presets[].settings` and `presets[].blocks[].settings` pre-populate real section and block values. They are not schema-locale fields, so a `t:` string there is rendered or stored as the literal key.

Follow these rules:

- Never use `t:` inside preset instance setting values.
- Omit a preset setting when its intended value is already the setting's schema default.
- Omit a preset block's `settings` object when the block needs no real override.
- Keep only values that intentionally make the preset differ from schema defaults.
- Put translatable editor labels in schema-localizable fields, not in preset instance data.

Minimal block example:

```json
{
    "type": "stat"
}
```

Intentional override example:

```json
{
    "type": "icon",
    "settings": {
        "icon": "star"
    }
}
```

## Review Checklist

- [ ] Storefront locale references exist and resolve.
- [ ] Schema locale references exist and are used only in supported fields.
- [ ] Preset instance settings contain no `t:` values.
- [ ] Presets do not repeat schema defaults.
- [ ] Unused locale keys introduced by the change are removed.
- [ ] ARIA labels, placeholders, errors, loading text, and empty states are translated.
- [ ] Dynamic sentences use translation parameters.
- [ ] Configuration tokens remain literal and valid for their setting type.

## Validation

Run:

```powershell
npm.cmd run lint:i18n
```

For meaningful theme changes, also run:

```powershell
npm.cmd run lint
npm.cmd test
```

Inspect `locales/en.default.json` and `locales/en.default.schema.json` directly for the current key set. Do not maintain key-count snapshots or duplicate locale inventories in this document.
