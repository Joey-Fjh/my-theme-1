---
name: check-i18n
description: Validate Shopify theme internationalization and locale keys. Use when user-facing text, locales, or schema labels change.
when_to_use: >
  Locale JSON files, translated Liquid strings, schema translation keys, duplicate keys,
  hardcoded copy, ARIA labels, alt text, placeholders, or npm run lint:i18n.
---

# Check I18n

Use this skill for translation and locale validation. Read `docs/references/code-review/i18n-checklist.md` when the task involves user-facing copy, schema text, accessibility labels, or launch-readiness review.

## Command

- Run i18n lint: `npm run lint:i18n`
- Aggregate gate that includes i18n lint: `npm run lint`

`npm run lint:i18n` uses this skill resource:

```text
.agents/skills/check-i18n/scripts/lint-i18n.js
```

## Selection Rules

1. Run `npm run lint:i18n` after changes to `locales/**/*.json`, Liquid visible text, schema labels/defaults, `aria-label`, `alt`, `placeholder`, or `title` text.
2. Update locale files when adding user-facing strings.
3. Classify hardcoded copy findings through `AGENTS.md`; do not silently change merchant-owned content.
4. Use the checklist reference for review context, not as a replacement for the lint command.

## Reporting

Report missing keys, duplicate keys, and hardcoded text findings with file and line. State whether failures are new, touched, or pre-existing when that is clear.
