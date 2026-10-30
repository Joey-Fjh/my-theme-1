# Internationalization Checklist

Read when: changing locale JSON, translated Liquid strings, accessible attributes (`aria-label`, `alt`, `placeholder`, `title`), section, block, or theme-settings schema copy, preset names or categories, or hardcoded user-visible text.

`AGENTS.md` remains authoritative. Commands: `AGENTS.md` Validation.

## What the check guards

`npm.cmd run lint:i18n` (`.agents/skills/check-i18n/scripts/lint-i18n.js`, tests in `scripts/lint-i18n.test.js`) guards:

- Duplicate keys, and missing storefront or schema locale keys, including section-group JSON (`duplicate locale JSON key fails`, `missing schema locale key in section group JSON fails`).
- Hardcoded user-visible copy, including accessible attributes and non-English text (`english hardcoded visible text fails`, `chinese hardcoded visible text fails`, `hardcoded accessible attribute fails`, `uppercase visible html text fails`).
- Schema fields Shopify localizes (`shouldRequireSchemaTranslation`): section and block names, setting labels, help text, placeholders, informational content, option labels, preset names and categories (`hardcoded schema translatable label fails`, `preset name and category t: references pass`).
- Config defaults stay literal for non-text types such as `url`, `link_list`, `select`, and `font_picker` (`schema config defaults pass for link_list url and select`). Text-class defaults, including lowercase and snake_case, use `t:` (`lowercase text setting defaults require translation`, `snake_case text setting defaults require translation`).
- No `t:` inside `presets[].settings`, `presets[].blocks[].settings`, `default.settings`, or `default.blocks[].settings`. Those values pre-populate real section and block settings, so a `t:` string is stored as the literal key (`preset settings with t: value fails`, `section default settings with t: value fails`).

Text that JavaScript renders or announces comes from `locales/en.default.json` through Liquid `| t` into a `data-*` attribute. `lint:theme` `js-user-visible-copy` (`.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`) fails hardcoded literals in `textContent`, `innerText`, `innerHTML`, accessible `setAttribute`, and `alert(` in `assets/*.js` except `vendor-*`, `*.min.js`, and `gift-card.js`.

Merchant content, resource titles, product data, and other store-owned values stay data, not locale keys.

## Review judgment the check does not make

- Omit a preset or default setting when its value is already the schema default.
- Omit a preset or default block's `settings` object when the block needs no override.
- Read `locales/en.default.json` and `locales/en.default.schema.json` for the current key set.
