# Internationalization Checklist

Shopify-specific locale ownership boundaries. `AGENTS.md` remains authoritative.

## Locale Boundaries

| Content | Source | Usage |
| --- | --- | --- |
| Storefront text, form copy, status messages, and accessible names | `locales/en.default.json` | Liquid `\| t` |
| Supported Theme Editor schema copy | `locales/en.default.schema.json` | Schema `t:` reference |
| Merchant content and preset instance values | Schema defaults or preset values | Literal value only when needed |

Merchant content, resource titles, product data, and other store-owned values stay as data, not locale keys.

## Schema-Localizable Fields

Use `t:` only in schema fields Shopify resolves through schema locale files:

- section and block names
- setting labels, help text, placeholders, and supported informational content
- option labels
- preset names and categories
- supported user-visible text defaults

Keep configuration tokens literal: enum values, booleans, numbers, URLs, resource handles, metafield paths, font identifiers, and other machine-consumed defaults. The setting type and Shopify schema-locale support determine whether `t:` is valid; not every property named `default` is translatable.

## Preset Instance Values

`presets[].settings` and `presets[].blocks[].settings` pre-populate real section and block values. They are not schema-locale fields, so a `t:` string there is rendered or stored as the literal key.

- Never use `t:` inside preset instance setting values.
- Omit a preset setting when its intended value is already the setting's schema default.
- Omit a preset block's `settings` object when the block needs no real override.
- Put translatable editor labels in schema-localizable fields, not in preset instance data.

## Validation

For locale or i18n changes during development, run `npm.cmd run lint:i18n`.

Reserve `npm.cmd run lint` and `npm.cmd test` for explicit user request or before opening a PR, version/release, or Theme Store submission. Inspect `locales/en.default.json` and `locales/en.default.schema.json` directly for the current key set.
