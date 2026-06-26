# Style-System Index

This is the style-system entry reference. `AGENTS.md` remains the rule source.

Read this file for build commands and high-level style routing. Use narrower references for detailed rules:

| Topic | Reference |
| --- | --- |
| CSS layer ownership and token bridge | `docs/references/style-system/css-architecture.md` |
| CSS history and deferred notes | `docs/references/style-system/css-architecture-history.md` |
| Typography tiers and consumption | `docs/references/style-system/typography-reference.md` |
| Color, surface, inline styles, z-index | `docs/references/style-system/color-surface-reference.md` |
| Image display contract | `docs/references/style-system/image-display-contract.md` |
| SVG icon pipeline | `docs/references/style-system/svg-icon-pipeline.md` |

## CSS Source Files

| File | Responsibility |
| --- | --- |
| `assets/base.css` | document defaults, native element styles, Shopify section grid, no-JS helpers |
| `tailwind/tailwind.input.css` | Tailwind v4 entry, `@theme inline` bridge, import order |
| `tailwind/tailwind.typography.css` | typography tiers and custom size utilities |
| `tailwind/tailwind.elements.css` | element primitives such as buttons, fields, badges, links, icons, close button |
| `tailwind/tailwind.components.css` | reusable composite APIs with 2+ unrelated consumers |
| `tailwind/tailwind.snippets.css` | snippet-family CSS and scene deltas |
| `tailwind/tailwind.utilities.css` | placement, surface, z-index, and other cross-cutting helpers |
| `tailwind/tailwind.animates.css` | motion capabilities, reveal states, keyframes, reduced-motion kill switches |
| `assets/tailwind.output.css` | generated output; never edit manually |

## Build Commands

Use `npm.cmd` in this Windows workspace:

```bash
npm.cmd run build:tw   # rebuild Tailwind output after Tailwind source changes
npm.cmd run lint:theme # architecture and style protocol lint
npm.cmd run lint       # aggregate lint
npm.cmd test           # Shopify Theme Check
npm.cmd run dev        # Shopify theme dev + Tailwind watch
```

## Quick Routing

- CSS placement or token bridge question -> `css-architecture.md`.
- Typography class or heading semantics question -> `typography-reference.md`.
- Color scheme, surface, hardcoded color, inline style, or z-index question -> `color-surface-reference.md`.
- Image mode/fit question -> `image-display-contract.md`.
- Icon source/generated asset question -> `svg-icon-pipeline.md`.
- Animation/motion policy question -> `docs/references/architecture/motion-architecture.md`.
