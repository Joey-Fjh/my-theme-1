---
name: run-shopify-theme
description: Run or choose validation commands for this Shopify theme, including lint, Theme Check, tests, Tailwind builds, SVG builds, local Shopify development, and verification after code changes. Use when asked to test, verify, run the theme, start local dev, check lint, or decide which project command proves a change.
---

# Run Shopify Theme

Use this skill to select and run the smallest relevant project verification. This skill is the validation dispatcher; detailed tool ownership lives in the task-specific skills.

## Commands

- General lint gate: `npm run lint`
- Theme architecture lint: `npm run lint:theme` via `check-theme-architecture`
- i18n lint: `npm run lint:i18n` via `check-i18n`
- CSS lint: `npm run lint:css` via `check-css`
- Shopify Theme Check: `npm test`
- Tailwind build after Tailwind source changes: `npm run build:tw`
- SVG build after `icons/` changes: `npm run build:svg` via `build-svg-icons`
- Local development: `npm run dev`
- Shopify-only local preview: `npm run shopify:dev`

## Selection Rules

1. Read `AGENTS.md` validation rules before choosing commands.
2. Prefer the narrowest command that covers the change.
3. Use `check-css`, `check-i18n`, `check-theme-architecture`, or `build-svg-icons` when the request needs domain-specific validation details.
4. Run `npm run lint` and `npm test` after meaningful theme changes.
5. Run `npm run build:tw` only when Tailwind source changed.
6. Run `npm run build:svg` only when `icons/` source changed.
7. Do not run formatting commands that rewrite files unless the user asks.

## Reporting

Report the command, result, and any failure lines needed for follow-up. If a command cannot run because dependencies, Shopify auth, network, or permissions are missing, state that blocker and the next concrete action.
