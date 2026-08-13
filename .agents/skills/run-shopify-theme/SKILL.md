---
name: run-shopify-theme
description: Choose and run validation commands for this Shopify theme. Use when asked to test, verify, lint, run the theme, or decide which command proves a change.
---

# Run Shopify Theme

Use this skill to select and run the smallest relevant project verification. This skill is the validation dispatcher; detailed tool ownership lives in the task-specific skills.

## Commands

Use `npm.cmd` in this Windows workspace.

- General lint gate: `npm.cmd run lint`
- Theme architecture lint: `npm.cmd run lint:theme` via `check-theme-architecture`
- Static browser compatibility lint: `npm.cmd run lint:compat` via `check-theme-architecture`
- Tailwind rebuild plus compatibility scan: `npm.cmd run scan:compat`
- i18n lint: `npm.cmd run lint:i18n` via `check-i18n`
- Liquid syntax guard plus Shopify Theme Check: `npm.cmd test`
- Shopify Theme Check only: `npm.cmd run test:theme-check`
- Tailwind build after Tailwind source changes: `npm.cmd run build:tw`
- SVG build after `icons/` changes: `npm.cmd run build:svg` via `build-svg-icons`
- Local development: `npm.cmd run dev`
- Shopify-only local preview: `npm.cmd run shopify:dev`

## Selection Rules

1. Read `AGENTS.md` validation rules before choosing commands.
2. Prefer the narrowest command that covers the change.
3. Use `check-i18n`, `check-theme-architecture`, or `build-svg-icons` when the request needs domain-specific validation details.
4. Run `npm.cmd run lint` and `npm.cmd test` after meaningful theme changes.
5. Run `npm.cmd run scan:compat` when Tailwind source changed and browser compatibility evidence is required; otherwise run `build:tw`.
6. Run `npm.cmd run build:svg` only when `icons/` source changed.
7. Do not run formatting commands that rewrite files unless the user asks.

## Reporting

Report the command, result, and any failure lines needed for follow-up. If a command cannot run because dependencies, Shopify auth, network, or permissions are missing, state that blocker and the next concrete action.
