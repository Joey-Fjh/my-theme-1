# CSS, Typography, Color, And Icon Reference

This reference stores style-system details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing CSS layers, Tailwind source, typography tiers, color tokens, inline styles, SVG icons, or related cleanup.

For animation and transition work, classify through `docs/references/architecture/motion-architecture.md` before applying CSS layer rules.

## CSS Layer Files

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `tailwind/tailwind.input.css`      | Entry point: `@theme inline` token bridge, breakpoints, imports           |
| `assets/base.css`                  | Global reset and structural defaults                                      |
| `tailwind/tailwind.typography.css` | Heading classes (`hxxxl`--`h6`), body text classes (`body-xl`--`body-xs`) |
| `tailwind/tailwind.elements.css`   | Atomic UI: `icons`, `links`, `btn`, `field`, `badge`                      |
| `tailwind/tailwind.components.css` | Composite patterns: `.dropdown`, `.localization-switcher`, `.rte`         |
| `tailwind/tailwind.snippets.css`   | Snippet-scoped: `.product-info-blocks` and context variants               |
| `tailwind/tailwind.utilities.css`  | Layout helpers: `container-page`, `place-*`                               |
| `tailwind/tailwind.animates.css`   | Motion: keyframes, `icons-animate-*`, `animate-spin-slow`                 |

When adding new CSS:

- Typography utility -> `tailwind.typography.css`
- Atomic design primitive -> `tailwind.elements.css`
- Composite multi-element pattern -> `tailwind.components.css`
- Snippet-scoped style -> `tailwind.snippets.css`
- Layout/placement helper -> `tailwind.utilities.css`
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

## Typography

### Font Size Tiers

| Tier         | Usage                                               |
| ------------ | --------------------------------------------------- |
| `hxxxl`-`h0` | Special large headings              |
| `h1`-`h6`    | Standard headings (corresponding to h1-h6 elements) |
| `body-xl`    | Large emphasis text                                 |
| `body-lg`    | Emphasis text                                       |
| `body-md`    | Default body text                                   |
| `body-sm`    | Auxiliary text                                      |
| `body-xs`    | Footnote, copyright                                 |

### Source Of Truth

- Typography utility definitions come from `tailwind/tailwind.typography.css`.
- Liquid templates MUST use project typography tiers (`hxxxl`-`h0`, `h1`-`h6`, `body-xl`-`body-xs`) instead of arbitrary Tailwind text-size utilities.
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

When token utilities do not cover a dynamic value, use a CSS variable such as `style="color: rgb(var(--color-foreground));"`.

Never hardcode static color values such as `style="color: red;"`.

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

Icon color follows the color scheme's `icons_color` via `--color-theme-icon` CSS variable automatically.

Adding a new icon:

1. Check whether an equivalent generated icon already exists in `assets/`.
2. If not, place the source SVG in `icons/`.
3. Run `npm run build:svg`.
4. Use in Liquid: `{%- render 'icons', icon: 'icon-name' -%}`.
5. If `icons/` is being used only as a temporary build-input directory, remove the temporary source file after verifying the generated asset.
