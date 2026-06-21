# CSS, Typography, Color, And Icon Reference

This reference stores style-system details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing CSS layers, Tailwind source, typography tiers, color tokens, inline styles, SVG icons, or related cleanup.

For animation and transition work, classify through `docs/references/architecture/motion-architecture.md` before applying CSS layer rules.

## CSS Layer Files

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `tailwind/tailwind.input.css`      | Entry point: `@theme inline` token bridge, breakpoints, imports           |
| `assets/base.css`                  | Global reset and structural defaults                                      |
| `tailwind/tailwind.typography.css` | Heading classes (`heading-4xl`--`heading-h6`), body text classes (`body-3xl`--`body-xs`) |
| `tailwind/tailwind.elements.css`   | Atomic UI: `icons`, `links`, `btn`, `field`, `badge`                      |
| `tailwind/tailwind.components.css` | Composite patterns: `.dropdown`, `.localization-switcher`, `.rte`         |
| `tailwind/tailwind.snippets.css`   | Snippet-scoped: `.product-info-blocks` and context variants               |
| `tailwind/tailwind.utilities.css`  | Narrow helpers: `container-page`, `place-*`, `bg-scheme-surface`          |
| `tailwind/tailwind.animates.css`   | Motion capability layer: tokens, keyframes, transition/animation classes, motion phase classes, element-level utilities, reduced-motion kill rules |

When adding new CSS:

- Typography utility -> `tailwind.typography.css`
- Atomic design primitive -> `tailwind.elements.css`
- Composite multi-element pattern -> `tailwind.components.css`
- Snippet-scoped style -> `tailwind.snippets.css`
- Narrow layout, placement, or cross-layer helper -> `tailwind.utilities.css`
- Animation/transition -> `tailwind.animates.css`

Before adding reusable CSS, classify the owner layer. Do not add reusable component styles to section `{% stylesheet %}` blocks.

Section `{% stylesheet %}` blocks are allowed only for section-specific CSS that Tailwind cannot express cleanly. They MUST NOT contain reusable component styles, typography systems, color systems, or motion recipes.

## Breakpoints

| Token | Value   | Prefix                                       |
| ----- | ------- | -------------------------------------------- |
| `pc`  | `48rem` | `pc:` for desktop, `max-pc:` for mobile-only |
| `fw`  | `80rem` | `fw:` for full-width                         |

## Token Flow

```text
Shopify Settings -> snippets/css-variables.liquid -> CSS custom properties
    -> tailwind/tailwind.input.css (@theme inline) -> Tailwind tokens
    -> utility classes in templates
```

## Build Commands

```bash
npm run watch:tw   # development watch mode
npm run build:tw   # production build
npm run dev        # shopify theme dev + tailwind watch
```

Output file: `assets/tailwind.output.css` -- NEVER edit manually.

Special standalone templates that cannot use `{% stylesheet %}`, such as
`templates/gift_card.liquid`, may own a small hand-written CSS asset under `assets/`.

## Typography

### Font Size Tiers

| Tier         | Usage                                               |
| ------------ | --------------------------------------------------- |
| `heading-4xl`-`heading-xl` | Special large headings              |
| `heading-h1`-`heading-h6` | Standard headings (corresponding to h1-h6 elements) |
| `body-3xl`   | Extra large emphasis text                           |
| `body-2xl`   | Extra large emphasis text                           |
| `body-xl`    | Large emphasis text                                 |
| `body-lg`    | Emphasis text                                       |
| `body-md`    | Default body text                                   |
| `body-sm`    | Auxiliary text                                      |
| `body-xs`    | Footnote, copyright                                 |

### Source Of Truth

- Typography utility definitions come from `tailwind/tailwind.typography.css`.
- Liquid templates MUST use project typography tiers (`heading-4xl`-`heading-xl`, `heading-h1`-`heading-h6`, `body-3xl`-`body-xs`) instead of arbitrary Tailwind text-size utilities.
- `heading-base` and `body-base` are foundation utilities for CSS source only. They MUST NOT be used in Liquid templates.

### CSS Inheritance

- `base.css` owns native element defaults.
- `tailwind/tailwind.typography.css` owns reusable typography tiers.
- Body text SHOULD inherit from `body` by default.
- Only add a typography utility when the intended tier differs from the inherited body default or native heading default.

### Body Typography

1. `body-md` is the intended default body tier.
2. Broad removal of repeated `body-md` is allowed only after `body` and `body-md` are aligned in CSS.
3. Use `body-sm`, `body-lg`, `body-xl`, and `body-xs` only when intentionally different from default.


## Color

Use Tailwind tokens when available:

| Token                 | CSS Variable           | Usage                     |
| --------------------- | ---------------------- | ------------------------- |
| `bg-theme-bg`         | `--color-background`   | Background color          |
| `text-theme-text`     | `--color-foreground`   | Text color                |
| `border-theme-border` | `--color-border`       | Border color              |
| `bg-primary`          | `--color-primary`      | Primary button background |
| `text-primary-text`   | `--color-primary-text` | Primary button text       |

When token utilities do not cover a Liquid-driven value, inject a local CSS variable
and consume it through a utility or component-owned rule. Prefer
`style="--component-color: {{ setting }};"` plus `text-(--component-color)` over a
direct inline `color` declaration.

Never hardcode static color values such as `style="color: red;"`.

### Color Ownership And Inheritance

- A `color-<scheme-id>` class establishes the active scheme variables for its
  descendants.
- Text and icons SHOULD inherit `color` from the active scheme or component owner by
  default. Do not add `text-theme-text` to every descendant merely to restate
  inherited foreground color.
- Background color does not inherit. A transparent child showing its ancestor's
  background is usually correct and MUST NOT receive `bg-theme-bg` automatically.
- Section gradients are explicit main-surface behavior. Add `bg-scheme-surface` only
  to a section-owned primary surface that should consume `--gradient-background`.
  Do not apply it to media backgrounds, transparent overlays, cards, dialogs,
  dropdowns, or chrome merely because they have a color scheme.
- Add an explicit background only when an element owns an independent visual surface,
  such as a panel, card, dropdown, drawer, modal, or intentionally layered region.
- A component rendered outside its original section or moved into an overlay MUST
  establish or receive the intended color scheme when inherited variables are no
  longer reliable.
- Icons rendered through the `icons` snippet follow `currentColor`. Their consumer
  owns color unless the icon is part of a component with a distinct semantic color
  contract.

### Semantic Color Ownership

Use the narrowest existing semantic owner:

- General section and content colors: background, foreground, border, and focus
  tokens from the active color scheme.
- Inputs: field background, text, border, and placeholder tokens. Review structural
  input behavior during the Inputs phase.
- Buttons: primary and secondary background, text, and border tokens. Review button
  variants and states during the Buttons phase.
- Badges: badge background, foreground, and border tokens.
- Feedback messages: success, warning, error, and info background/foreground pairs.
- Product cards, dialogs, and other shared components MAY own component-level color
  variables when their contract is distinct from general section colors.

Do not replace a component-specific semantic token with general foreground or
background merely because the rendered colors currently match.

### Transparency And Hardcoded Colors

- Opacity variants such as `text-theme-text/60` and
  `border-theme-border-20` are valid when they intentionally derive from a semantic
  token and remain legible on supported schemes.
- Do not use opacity to conceal a missing semantic token or scheme boundary.
- Static HEX, RGB, HSL, named-color utilities, and raw black/white utilities require
  classification before replacement. Preserve them only when they are an approved
  visual effect or platform requirement.
- Image overlays, scrims, gradients, shadows, and decorative artwork MAY use fixed
  neutral colors when the visual effect depends on them. They require user judgment
  and contrast verification rather than automatic token replacement.
- Merchant-configurable component colors SHOULD enter through a local CSS variable
  injected from the setting. Do not promote a one-component choice into a global
  token.
- Independent merchant-configurable surfaces SHOULD own paired background and text
  settings when both are needed for a stable contrast contract. Consumers that own
  separate semantic colors, such as fields and buttons, keep their own contracts.

### Color Abstraction Decision

Use this order when deciding whether to inherit, connect, or abstract a color:

1. Keep inheritance when the element belongs to the active scheme and has no
   independent semantic role.
2. Use an existing scheme or semantic token when the role already exists.
3. Add a component-owned class or local variable when multiple elements inside one
   component share a distinct color contract.
4. Add a shared semantic token only when multiple independent consumers share the
   same meaning and invariants.
5. Keep a one-off approved visual effect local. Repetition of a color value alone is
   not sufficient reason to create a global token.

### Color Audit Classification

Classify every finding before editing:

1. Correct inheritance or transparent background: no change.
2. Broken scheme or semantic-token chain: connect the missing owner or consumer.
3. Unintentional hardcoded or local override: replace with the correct existing
   token.
4. Intentional component or visual override: preserve and document the reason.
5. User-owned design judgment: report without changing.
6. Cross-phase issue: record for the owning phase without mixing the fix into Colors.

## Inline Styles

Allowed uses of `style`:

1. CSS variable injection: `style="--section-padding-top: {{ section.settings.padding_top }}px;"`
2. CSS Grid area naming: `style="grid-area: header;"`
3. Dynamic calculated values: `style="width: {{ percentage }}%;"`

Not allowed:

1. Static styles: `style="margin-left: 0;"` -> use Tailwind class `ml-0`.
2. Color values: `style="color: red;"` -> use a theme token or CSS variable.
3. Spacing values: `style="padding: 10px;"` -> use Tailwind spacing utilities.

When Tailwind has a matching utility, use it. When Tailwind does not have a matching utility, consider adding a reusable class to the appropriate `tailwind.*.css` layer file before falling back to inline `style`. Use `style` only when the value is dynamic (Liquid-driven), one-off, or cannot be expressed as a reusable class.

## Global z-Index Layer System

The theme uses a unified z-index layer hierarchy defined in `tailwind/tailwind.utilities.css`. All z-index values for stacking contexts (header, announcement bar, dropdowns, drawers, toasts, dialogs, modals, lightbox) MUST use the documented layer utilities. Do not add ad-hoc `z-[...]` arbitrary values or inline `z-index` styles for these layers.

Layer utilities are sorted low-to-high. A higher layer always sits above a lower layer. If a new stacking context is needed, add it to the existing layer system rather than inventing a one-off value.

## CSS Ownership Rules

- Tailwind source files (`tailwind/*.css`) own all reusable styles.
- Section `{% stylesheet %}` blocks own only section-specific CSS that Tailwind cannot express cleanly.
- Do not add reusable component, typography, color, or motion styles to section `{% stylesheet %}` blocks.
- When a style is needed by more than one section or snippet, it belongs in a `tailwind/*.css` layer file.

## SVG Icon Pipeline

```text
icons/*.svg (temporary or persistent build inputs) -> npm run build:svg
    -> assets/icon-*.svg -> {{ 'file.svg' | inline_asset_content }}
```

SVGO behavior:

- Strips: `fill`, `stroke`, `width`, `height`, `style`, `class`
- Adds: `fill="currentColor"`, `aria-hidden="true"`, `focusable="false"`
- Preserves: `viewBox`

Render icons through the icon snippet:

```liquid
{%- render 'icons', icon: 'icon-arrow2', size: 'md', color: 'currentColor' -%}
```

Snippet parameters:

| Param   | Values                       | Default  | Purpose                           |
| ------- | ---------------------------- | -------- | --------------------------------- |
| `icon`  | `'icon-arrow2'`, etc.        | required | SVG filename without `.svg`       |
| `size`  | `xs`, `sm`, `md`, `lg`, `xl` | `md`     | Maps to Tailwind size classes     |
| `class` | any Tailwind classes         | --       | Extra classes on wrapper `<span>` |

Icon color follows the active scheme's foreground via `currentColor` inheritance. The `icons` snippet renders SVGs with `fill="currentColor"`, so icons match the text color of their parent element.

Adding a new icon:

1. Check whether an equivalent generated icon already exists in `assets/`.
2. If not, place the source SVG in `icons/`.
3. Run `npm run build:svg`.
4. Use in Liquid: `{%- render 'icons', icon: 'icon-name' -%}`.
5. If `icons/` is being used only as a temporary build-input directory, remove the temporary source file after verifying the generated asset.
