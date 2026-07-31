# SVG Icon Pipeline

This file documents the icon source-to-generated-asset pipeline. `AGENTS.md` remains the rule source.

## Ownership

- Source SVGs live in `icons/`.
- Generated theme assets live in `assets/icon-*.svg`.
- Liquid must render icons through the `icons` snippet; do not paste raw SVG into Liquid.
- Never manually edit generated `assets/icon-*.svg` files.

## Workflow

1. Check whether an equivalent icon already exists.
2. Add or update the source SVG under `icons/`.
3. Run `npm.cmd run build:svg`.
4. Review generated `assets/icon-*.svg` changes.
5. Use the `icons` snippet from Liquid.

## Validation

- Run `npm.cmd run build:svg` only when `icons/` changed or when explicitly verifying the icon pipeline.
- Run `npm.cmd run lint:theme` if Liquid icon usage changed.
- Keep source names stable because generated asset names are consumed by the icon snippet.
