---
name: check-theme-architecture
description: Validate Shopify theme architecture and static browser compatibility rules. Use when Liquid, embedded stylesheet or javascript blocks, tab markup, or browser compatibility tooling change.
when_to_use: >
  Liquid runtime-name shadowing, tab accessibility, Liquid output syntax,
  settings chain, module registration, JS outlet rules, or CSS/JS compatibility checks changed.
---

# Check Theme Architecture

Use this skill when Liquid, embedded stylesheet or javascript blocks, tab markup, or the architecture checks change. Shopify Theme Check remains the platform authority. This skill adds the project contracts in `lint:theme`.

## Commands

Which command proves which change: `AGENTS.md` Validation.

- `npm.cmd run test:theme-architecture` — fixture tests for `lint:theme`, `lint:liquid-syntax`, and `lint:compat:embedded`; run after changing those scripts.
- `npm.cmd run test:section-stylesheet-carry` — DOM tests for `SectionRefresher.carryInnerSectionStylesheet` in `assets/https.js`; run after changing it.
- `lint:compat:embedded` is part of `lint:compat`, not `lint:theme`.

## What `lint:theme` covers

`lint:theme` is `.agents/skills/check-theme-architecture/scripts/lint-theme.js`. Fixture tests are `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`. Check ids and the rules they enforce live in that script and `.agents/skills/check-theme-architecture/scripts/lib/raw-colour-lint.js` (and the other files in that `lib` directory).

Place a `lint-allow` comment on the line before the flagged line: CSS `/* lint-allow <check-id>: <reason> */`, Liquid `{% # lint-allow <check-id>: <reason> %}`. A comment without a reason fails `lint-allow-reason`. Document every accepted exception in `docs/references/style-system/css-architecture.md`.

Colour lints match CSS values with regular expressions, not a CSS tokenizer. A longer function name with a numeric argument (`custom-hsl(1)`) is rejected, and escaped forms (`\rgb(1 2 3)`, `\68sl(1)`) are not decoded. Theme code has neither. Revisit only if real code hits one; then use a tokenizer such as postcss-value-parser, as its own batch.

## Reporting

Report failures by file, line, check id, and command family. If a finding is pre-existing, say so and classify it as a warning or follow-up according to `AGENTS.md`.
