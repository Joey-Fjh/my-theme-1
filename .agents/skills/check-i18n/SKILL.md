---
name: check-i18n
description: Validate Shopify theme internationalization and locale keys. Use when user-visible copy, locale JSON files, schema labels, or translated Liquid strings change.
when_to_use: >
  Locale JSON files, translated Liquid strings, schema translation keys, duplicate keys,
  hardcoded copy, ARIA labels, alt text, or placeholders changed.
---

# Check I18n

Use this skill when locale files, translated Liquid, schema copy, or hardcoded user-visible text change. Read `docs/references/code-review/i18n-checklist.md` for ownership and the review gaps. Which command to run: `AGENTS.md` Validation (`npm.cmd run lint:i18n`). Run `npm.cmd run test:i18n` after validator changes.

`lint:i18n` (`.agents/skills/check-i18n/scripts/lint-i18n.js`, tests in `scripts/lint-i18n.test.js`) guards duplicate keys, missing project locale keys, unused keys (`lint-i18n-unused.js`; intentional keeps go in its `ALLOWLISTED_PREFIXES` with a reason), hardcoded user-visible copy, and the schema/preset boundary. Shopify Theme Check remains the platform authority. Merchant-owned content, product data, and runtime variables are out of scope. Do not rewrite theme files just to satisfy the linter.

Report missing keys, duplicate keys, hardcoded text, and preset or default `t:` misuse with file and line. State whether failures are new, touched, or pre-existing when that is clear.
