---
name: check-i18n
description: Validate Shopify theme internationalization and locale keys. Use when user-visible copy, locale JSON files, schema labels, or translated Liquid strings change.
when_to_use: >
  Locale JSON files, translated Liquid strings, schema translation keys, duplicate keys,
  hardcoded copy, ARIA labels, alt text, or placeholders changed.
---

# Check I18n

Use this skill for project-level i18n validation. Read `docs/references/code-review/i18n-checklist.md` for locale ownership, classification, and review boundaries.

## Commands

- `npm.cmd run lint:i18n` after the changes listed in the checklist's "Read when" line; `npm.cmd run test:i18n` after validator changes.
- Merchant-owned content, product data, and runtime variables are out of scope. Do not rewrite theme files just to satisfy the linter.

Shopify Theme Check remains the platform authority. This validator supplements Theme Check with duplicate keys, missing project locale keys, unused locale keys (`lint-i18n-unused.js`; intentional keeps go in its `ALLOWLISTED_PREFIXES` with a reason), hardcoded user-visible copy, and schema/preset boundary checks.

## Reporting

Report missing keys, duplicate keys, hardcoded text, and preset/default instance `t:` misuse with file and line. State whether failures are new, touched, or pre-existing when that is clear.
