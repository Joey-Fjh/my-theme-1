---
name: build-svg-icons
description: Optimize and regenerate Shopify theme SVG icon assets. Use when files in icons/ change or npm.cmd run build:svg is needed.
---

# Build SVG Icons

Regenerate optimized icons from `icons/` to `assets/icon-*.svg`. Ownership and Liquid usage rules live in `AGENTS.md` and `docs/references/style-system/css-architecture.md`.

## Command

```powershell
npm.cmd run build:svg
```

Uses `.agents/skills/build-svg-icons/scripts/svgo.config.js`.

## Workflow

1. Confirm whether an equivalent icon already exists.
2. Add or update source SVG under `icons/`.
3. Run `npm.cmd run build:svg`.
4. Review generated asset changes before using the `icons` snippet.

Run only after `icons/` changes or when explicitly verifying the pipeline. Run `npm.cmd run lint:theme` if Liquid icon usage changed.

## Reporting

Report whether the command rewrote assets and which generated icons changed.
