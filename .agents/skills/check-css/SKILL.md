---
name: check-css
description: Validate Shopify theme CSS and Tailwind source with stylelint. Use when Codex needs to check CSS syntax, Tailwind CSS v4 source files, stylelint configuration, CSS layer changes, or decide whether npm run lint:css is the right verification command.
---

# Check CSS

Use this skill for CSS and Tailwind validation. Keep rule interpretation in `AGENTS.md`; use this skill to choose and run the CSS-specific check.

## Command

- Run CSS lint: `npm run lint:css`
- Aggregate gate that includes CSS lint: `npm run lint`

`npm run lint:css` uses this skill resource:

```text
.agents/skills/check-css/scripts/stylelint.config.js
```

## Selection Rules

1. Run `npm run lint:css` after changes to `assets/base.css`, `tailwind/**/*.css`, or stylelint configuration.
2. Run `npm run build:tw` separately when Tailwind source changes and generated CSS must be refreshed.
3. Do not run `npm run format` unless the user explicitly asks for rewrite formatting.
4. Treat stylelint failures as blockers for touched CSS unless the failure is documented as pre-existing and unrelated.

## Reporting

Report the command result and the smallest useful failure excerpt. If CSS changed but `npm run build:tw` was not run, state why.
