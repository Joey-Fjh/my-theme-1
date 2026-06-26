# CSS Architecture Contract

This reference is the current CSS layer, token, bridge, and consumption contract. `AGENTS.md` remains the rule source.

Read this file when auditing CSS placement, token sources, bridge use, or layer migrations. Historical phase notes live in `docs/references/style-system/css-architecture-history.md`. Image rendering rules live in `docs/references/style-system/image-display-contract.md`.

## Pipeline

```text
config/settings_schema.json + config/settings_data.json
  -> snippets/css-variables.liquid
  -> tailwind/tailwind.input.css @theme inline bridge
  -> tailwind/tailwind.*.css source layers
  -> npm.cmd run build:tw
  -> assets/tailwind.output.css (generated; never edit manually)
  -> Liquid class consumption in sections/snippets/layout
  -> npm.cmd run lint:theme architecture checks
```

## Token Sources

| Source | Owns | Notes |
| --- | --- | --- |
| `snippets/css-variables.liquid` | Merchant settings, color-scheme RGB triplets, typography, motion, button/input geometry | Runtime CSS custom-property source |
| `tailwind/tailwind.input.css` | Tailwind `@theme inline` bridge | Only bridge values that need Tailwind utility consumption |
| Snippet/section inline custom properties | Per-render dynamic variables | Valid only when scoped to that render tree |
| `tailwind/tailwind.*.css` | CSS consumption of tokens | Prefer direct `var()` for geometry/motion internals |

## Bridge Rules

Bridge a CSS variable into `@theme inline` only when Liquid markup needs a Tailwind utility such as `bg-*`, `text-*`, spacing, breakpoint, or z-index utility.

Do not bridge variables that are only consumed inside CSS layer rules. Examples that intentionally stay direct `var()` consumption:

- `--button-*`, `--input-*`, `--dialog-*`, `--toast-*`
- `--motion-duration-*`, `--motion-ease-*`
- `--focus-ring-*`
- snippet-local variables such as `--pagination-*`

## Layer Ownership

| Layer/file | Owns | Does not own |
| --- | --- | --- |
| `assets/base.css` | document defaults, native elements, `[x-cloak]`, universal helpers | reusable component chrome |
| `tailwind.typography.css` | project typography tiers and custom size tiers | section-specific headings or Tailwind `text-*` heading shortcuts |
| `tailwind.elements.css` | single-element primitives: `btn`, `field`, `badge`, links, icons, close button, focus ring | composite layouts |
| `tailwind.components.css` | reusable composite APIs with 2+ unrelated consumers | section-root scoped overrides |
| `tailwind.snippets.css` | one snippet family or snippet-owned scene deltas | pattern dumps copied across unrelated snippets |
| `tailwind.utilities.css` | cross-cutting placement/surface/z-index utilities | business BEM styling |
| `tailwind.animates.css` | motion capabilities, reveal states, keyframes, reduced-motion kill switches | trigger logic |
| section `{% stylesheet %}` | last-resort section-only styles Tailwind cannot express | reusable CSS contracts |

## Promotion Thresholds

| Threshold | Meaning | Action |
| --- | --- | --- |
| 2+ unrelated consumers | CSS no longer belongs to one snippet/section family | promote to `components.css` or keep in components when adding a second consumer |
| 3+ stable repeated copies | same structural UI repeated with different BEM prefixes | consolidate into one shared component API when worthwhile |

These thresholds are complementary. A pattern can be promoted to the components layer before a full shared API consolidation is justified.

## Platform Bridge Exceptions

The following platform selectors may live in `elements.css` because they bridge Shopify-controlled markup into the theme button system:

- `button.shopify-payment-button__button--unbranded`
- `shopify-accelerated-checkout`
- `shopify-accelerated-checkout-cart`
- Shopify payment button wrappers needed for width/layout

Branded accelerated checkout buttons render in closed shadow DOM; only supported CSS custom-property bridges should be used.

## Motion Token Chain

```text
Theme setting / token source
  -> css-variables.liquid (`--motion-duration-*`, `--motion-ease-*`)
  -> CSS consumers through direct `var()` usage
  -> tailwind.animates.css owns reveal/keyframe capabilities
  -> Alpine/Components.register owns trigger state and teardown
```

Rules:

- Do not restore `snippets/motion-transition.liquid`.
- Do not scatter `x-transition:*` recipes for ordinary state motion.
- Do not hide critical first-viewport content behind animation completion.
- Use `docs/references/architecture/motion-architecture.md` for motion classification.

## Decision Flow

1. Is this only a token? Use `css-variables.liquid` or scoped inline custom properties.
2. Is this typography? Use `tailwind.typography.css`.
3. Is this a single control/primitive? Use `tailwind.elements.css`.
4. Is this reused by 2+ unrelated consumers? Use `tailwind.components.css`.
5. Is this owned by one snippet family? Use `tailwind.snippets.css`.
6. Is this cross-cutting layout/surface/z-index? Use `tailwind.utilities.css`.
7. Is this motion capability/reveal/keyframe CSS? Use `tailwind.animates.css`.
8. Is it a section-only exception Tailwind cannot express? Use section `{% stylesheet %}` as a last resort.

## Governance

- `npm.cmd run lint:theme` enforces layer, heading, JS runtime, HTTP/cart, and related architecture rules.
- CSS source changes require `npm.cmd run build:tw`; never manually edit `assets/tailwind.output.css`.
- Record durable architecture decisions in the relevant reference, not in `context.md` unless it is short cross-session state.
- Detailed accepted-phase history and deferred notes live in `css-architecture-history.md`.
