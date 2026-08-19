# CSS Architecture Contract

This reference is the current CSS layer, token, typography, color/surface, bridge, and consumption contract. `AGENTS.md` remains the rule source.

Read this file when auditing CSS placement, typography tiers, color ownership, token sources, bridge use, or layer migrations. Image rendering rules live in `docs/references/style-system/image-display-contract.md`. Completed CSS migration history belongs in Git history.

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

## Typography

Typography tier CSS lives in `tailwind/tailwind.typography.css`. Native heading defaults live in `assets/base.css`. Liquid must not use Tailwind `text-*` utilities for headings.

- Semantic `h1`–`h6` level is chosen for document outline; visual `heading-h*` tier is chosen independently for design size. Example: `<h3 class="heading-h2">` when outline needs `h3` but the visual target is a larger tier.
- `heading-h*` classes remain restricted to semantic heading elements; lint bans them on non-heading elements only.
- Display tiers such as `heading-4xl` through `heading-xl` and `typo-subtitle` plus size-tier composition remain valid where intended.
- `body-*` tiers are for non-heading body semantics only; do not put them on headings.
- Default body copy inherits global body settings; do not add section-level body text-size settings for ordinary paragraphs.
- `heading-size-custom` and `body-size-custom` require their scoped CSS variables.
- Component-owned typography exceptions may live in component/snippet CSS when part of a reusable API. If a component overrides body size, it must not imply body sliders still control it unless wired to its own scoped API.
- `.rte h1` through `.rte h6` map rich-text/merchant HTML headings and are independent from page outline semantics.

Exact tier ratios, token math, and lint exceptions live in source and `lint:theme`.

## Color, Surface, And Inline Style

- Merchant color schemes produce RGB custom properties through `snippets/css-variables.liquid`.
- The first configured color scheme is the `:root` token fallback; it is not the implicit visible page-canvas decision.
- `settings.page_canvas_color_scheme` explicitly owns the visible `<body>` canvas behind sections, during overscroll, and in areas without their own color-scheme scope.
- Section, overlay, drawer, modal, and component color-scheme scopes override the body canvas normally.
- Use one surface role per node: `color-{{ section.settings.color_scheme }}`, `surface-section`, `surface-component`, `surface-inverted`, or local opacity effects.
- Use semantic tokens or scheme utilities for theme UI; avoid hardcoded brand colors unless documented as a platform bridge or local effect.
- Allowed inline styles: scoped CSS custom properties from Liquid, platform-required media values, and per-render geometry that static utilities cannot express.
- Use semantic z-index utilities or variables for layered UI.

## SVG Icons

- Source SVGs live in `icons/`; generated assets live in `assets/icon-*.svg`.
- Regenerate with `npm.cmd run build:svg`; never manually edit generated icon assets.
- Render icons through the `icons` snippet from Liquid.

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
- Keep optional cleanup ideas out of this contract until repository evidence makes them actionable.
