---
name: build-svg-icons
description: Optimize and regenerate Shopify theme SVG icon assets. Use when files in icons/ change or npm.cmd run build:svg is needed.
---

# Build SVG Icons

Use this skill for the icon source-to-generated-asset pipeline. Source SVGs live in `icons/`; generated theme assets live in `assets/icon-*.svg`.

Read `docs/references/style-system/svg-icon-pipeline.md` when icon pipeline details or ownership boundaries matter.

## Command

- Regenerate optimized icons: `npm.cmd run build:svg`

`npm.cmd run build:svg` uses this skill resource:

```text
.agents/skills/build-svg-icons/scripts/svgo.config.js
```

## Selection Rules

1. Run `npm.cmd run build:svg` only after `icons/*.svg` changes or when explicitly verifying the icon pipeline.
2. Do not manually edit generated `assets/icon-*.svg`; regenerate from `icons/`.
3. Before adding a new icon source, check whether an equivalent generated icon already exists.
4. After running the build, verify generated asset changes are expected before using the icon snippet.

## Reporting

Report whether the command rewrote assets and which generated icons changed. If the command was not run because it would rewrite files, state that explicitly.
