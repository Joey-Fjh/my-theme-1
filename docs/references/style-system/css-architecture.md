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

Tailwind scans every token in the `@source` Liquid files, including `{% schema %}` JSON and `t:` locale-key paths. A key segment that matches a utility name, such as `presets.container`, emits that utility into the generated stylesheet. Name schema and locale keys so their segments are not utility names, and check the generated diff after a rebuild.

## Token Sources

| Source | Owns | Notes |
| --- | --- | --- |
| `snippets/css-variables.liquid` | Merchant settings, color-scheme RGB triplets, typography, motion | Runtime CSS custom-property source |
| `tailwind/tailwind.input.css` | Tailwind `@theme inline` bridge | Only bridge values that need Tailwind utility consumption |
| Snippet/section inline custom properties | Per-render dynamic variables | Valid only when scoped to that render tree |
| `tailwind/tailwind.*.css` | CSS consumption of tokens | Prefer direct `var()` for geometry/motion internals |

## Global settings chain

Typography and color flow only through `config/settings_schema.json` → `snippets/css-variables.liquid` → tokens → tier or scheme classes. Do not bypass the chain with default Tailwind typography or palette utilities, arbitrary values (`text-[14px]`, `bg-[#fff]`), or literal typography/color properties in first-party CSS.

`tailwind/tailwind.input.css` resets Tailwind default namespaces to `initial` for breakpoints, font family (`--font-*`), font size (`--text-*`), easing, and animation. The resets for font weight, line height, letter spacing, and palette colors are not adopted yet: theme CSS still uses those default utilities, and each reset lands with the CSS step 3 batch that removes its last consumer. When the palette reset lands, re-declare the keyword colors `transparent`, `current`, and `inherit` after it so utilities such as `text-current` keep working.

A typography value passes when it derives from the chain or from the inherited, already-derived value: `var(--font-*)` alone or inside `calc()` / `max()` / `min()` / `clamp()`, `inherit`, `unset`, `bolder`, `lighter`, or an `em` / `%` size. Literals such as `bold`, `600`, `1rem`, or `14px` fail, because a settings change would not reach them.

```css
/* Don't: a literal that ignores the heading weight setting */
.card__title { font-weight: 600; }

/* Do: take the value from the chain */
.card__title { font-weight: var(--font-heading-weight); }
```

`lint:theme` enforces Liquid class usage and first-party CSS (`tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`, and `{% stylesheet %}` blocks). Regenerate `assets/tailwind.output.css` with `npm.cmd run build:tw`; do not hand-edit it.

**Accepted `lint-allow` exceptions (document every new one here):**

| Location | Check id | Reason |
| --- | --- | --- |
| `sections/search.liquid` (`{% stylesheet %}`) | `settings-chain-css-typography` | iOS Safari zoom floor for search inputs (`max(16px, …)`). |
| `snippets/quantity-selector.liquid` (`{% stylesheet %}`) | `settings-chain-css-typography` | iOS Safari zoom floor for quantity inputs. |
| `tailwind/tailwind.elements.css` (`.field`) | `settings-chain-css-typography` | iOS Safari zoom floor for native fields. |
| `snippets/rotating-badge.liquid` (`<svg>`) | `raw-svg` | The circular text path renders merchant badge copy through Liquid; it cannot be a static icon (user, 2026-09-29). |
| `snippets/rotating-badge.liquid` (center `<span>`) | `settings-chain-liquid` | Center text is sized from the merchant badge size and scale, not a typography tier (user, 2026-09-29). |
| `snippets/watermark.liquid` (`<svg>`) | `raw-svg` | The SVG text renders merchant watermark copy through Liquid; it cannot be a static icon (user, 2026-09-29). |

## Bridge and recipe rules

Two valid chains exist:

1. **Bridge to a utility** — add a variable to `@theme inline` only when Liquid markup needs an atomic Tailwind utility (`bg-theme-bg`, `font-heading`, breakpoints, z-index layers).
2. **Recipe in a CSS layer** — typography tiers (`tailwind.typography.css`), motion capabilities (`tailwind.animates.css`), and other shared recipes consume tokens through plain CSS `var()` and `@utility` definitions in the Tailwind build. Do not bridge recipe-only tokens such as `--motion-duration-*` or `--motion-ease-*` into `@theme inline`.

Don't bridge motion duration or easing into `@theme`; use a recipe class instead:

```css
/* tailwind/tailwind.animates.css */
@utility spinner {
    animation: spinner-turn var(--motion-duration-base) var(--motion-ease) infinite;
}
```

## Layer Ownership

| Layer/file | Owns | Does not own |
| --- | --- | --- |
| `assets/base.css` | document defaults, native elements, global `:focus-visible`, `[x-cloak]`, universal helpers | reusable component chrome |
| `tailwind.typography.css` | project typography tiers and custom size tiers | section-specific headings or Tailwind `text-*` heading shortcuts |
| `tailwind.elements.css` | single-element base styles for native controls | composite layouts |
| `tailwind.components.css` | reusable composite APIs with 2+ unrelated consumers | section-root scoped overrides |
| `tailwind.utilities.css` | cross-cutting placement/surface/z-index utilities | business BEM styling |
| `tailwind.animates.css` | motion capabilities, keyframes, reduced-motion rules | trigger logic |
| section/block/snippet `{% stylesheet %}` | primary home for component-owned CSS scoped to one render tree (plain CSS only) | cross-render-tree selectors, Tailwind directives, shared vocabulary |

## Promotion Thresholds

| Threshold | Meaning | Action |
| --- | --- | --- |
| 2+ unrelated consumers | CSS no longer belongs to one snippet/section family | promote to `components.css` or keep in components when adding a second consumer |
| 3+ stable repeated copies | same structural UI repeated with different BEM prefixes | consolidate into one shared component API when worthwhile |

These thresholds are complementary. A pattern can be promoted to the components layer before a full shared API consolidation is justified.

## Typography

Typography tier CSS lives in `tailwind/tailwind.typography.css`. Native heading defaults live in `assets/base.css`. Liquid must not use Tailwind `text-*` utilities for headings.

The Skeleton's stable typography interface is `--font-body-*` and `--font-heading-*`, emitted from theme settings by `snippets/css-variables.liquid`. Derived themes change the values through settings or by redefining the properties, and add further roles (such as a subtitle or eyebrow style) themselves.

- Semantic `h1`–`h6` level is chosen for document outline; visual `heading-h*` tier is chosen independently for design size. Example: `<h3 class="heading-h2">` when outline needs `h3` but the visual target is a larger tier.
- `heading-h*` classes remain restricted to semantic heading elements (`lint:theme`, `typography-tier-heading`).
- `body-*` tiers belong on non-heading elements only (`lint:theme`, `typography-tier-body-on-heading`).
- Display tiers such as `heading-4xl` through `heading-xl` remain valid where intended. Section subtitles use a `body-*` size tier alone and inherit body font settings.
- Default body copy inherits global body settings; do not add section-level body text-size settings for ordinary paragraphs.
- Component-owned typography exceptions may live in component/snippet CSS when part of a reusable API. If a component overrides body size, it must not imply body sliders still control it unless wired to its own scoped API.
- `.rte h1` through `.rte h6` map rich-text/merchant HTML headings and are independent from page outline semantics.

**Usage example:** collection product card title — semantic outline `h2`, visual tier `heading-h6`:

```liquid
<h2 class="heading-h6">{{ product.title }}</h2>
```

Tier sizes are computed in `tailwind/tailwind.typography.css` from `--font-heading-scale` and `--font-body-size` / `--font-body-size-mobile`. `body-md`, `body-sm`, and `body-xs` keep mobile floors of 14px, 13px, and 12px through `max()`.

Add a tier only in `tailwind/tailwind.typography.css` on the `heading-base` / `body-base` stack; do not add unbounded tiers such as `body-8xl`. A one-off size keeps the tier stack and overrides `font-size` through a local CSS variable derived from `--font-*`.

## Color, Surface, And Inline Style

- Merchant color schemes produce RGB custom properties through `snippets/css-variables.liquid`.
- Those properties are comma-separated triplets (`r, g, b`). Write alpha as `rgba(var(--color-foreground), 0.55)`. The form `rgb(var(--color-foreground) / 0.55)` expands to `rgb(r, g, b / 0.55)`, which browsers reject and drop silently. `lint:theme` fails `rgb(var(--color-*) / alpha)` in `{% stylesheet %}` blocks and first-party CSS (`tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`).
- The first configured color scheme is the `:root` token fallback; it is not the implicit visible page-canvas decision.
- `settings.page_canvas_color_scheme` explicitly owns the visible `<body>` canvas behind sections, during overscroll, and in areas without their own color-scheme scope.
- Section, overlay, drawer, modal, and component color-scheme scopes override the body canvas normally.
- Use one surface role per node: `color-{{ section.settings.color_scheme }}` on the section frame, or `surface-component` on nested overlays such as dropdown panels. `lint:theme` (`section-color-scheme`) fails a section with a `color_scheme` setting whose root lacks the class. A section that renders `snippets/section-frame.liquid` with `section: section` passes only while the snippet writes `color-{{ section.settings.color_scheme }}` literally in a `class` attribute outside comments. Keep that literal; do not build it through a variable. The check reads markup, not the rendered DOM.
- Use semantic tokens or scheme utilities for theme UI; avoid hardcoded brand colors unless documented as a platform bridge or local effect.
- Allowed inline styles: scoped CSS custom properties from Liquid, platform-required media values, and per-render geometry that static utilities cannot express.
- Use semantic z-index utilities or variables for layered UI.

## SVG Icons

- `icons/` is an ignored temporary import directory; committed optimized runtime icons live in `assets/icon-*.svg`.
- To add or replace an icon, stage its SVG in `icons/`, run `npm.cmd run build:svg`, review the asset result, and clear the staging input. Do not hand-edit optimized icon assets.
- Do not paste raw SVG into Liquid; render icons through the `icons` snippet from Liquid.

## Platform Bridge Exceptions

Shopify-rendered payment buttons are styled only through supported selectors and custom properties where the platform exposes them. The cart page element `shopify-accelerated-checkout-cart` has no theme rule and keeps Shopify's defaults.

Branded accelerated checkout buttons render in closed shadow DOM; only supported CSS custom-property bridges should be used.

## Motion Token Chain

```text
Theme setting / token source
  -> css-variables.liquid (`--motion-duration-*`, `--motion-ease-*`)
  -> tailwind.animates.css recipe classes (for example `.spinner`)
  -> Alpine component factories own trigger state and teardown
```

Don't use `animate-spin` or `x-transition:*` for ordinary loading or state motion; use a motion recipe class such as `.spinner` in `tailwind/tailwind.animates.css`. Classification, first-viewport visibility, and reduced motion: `docs/references/architecture/motion-architecture.md`.

## CSS homes (5-C3a)

| Home | Owns |
| --- | --- |
| Tailwind utilities in Liquid | Layout and one-off adjustments |
| Owner `{% stylesheet %}` | Plain CSS on tokens: states, nesting, motion details for one render tree |
| Tailwind build (`tailwind/tailwind.*.css`) | Tokens, typography tiers, surfaces, layout vocabulary, utilities with 2+ unrelated consumers |
| `snippets/section-frame.liquid` | Section colour scheme, fluid merchant padding, width (`page` / full bleed), height kind (`content`, `media`, `stage`), first-section header offset |

Move rules into a `{% stylesheet %}` block only when every class in the selector and nested selectors belongs to that file's render tree. Move a BEM block whole. JS- or vendor-generated classes stay shared.

Unmigrated sections keep `assets/base.css` `.layout` padding (`--section-padding-top` / `--section-padding-bottom`). Migrated section roots use `section-frame` instead.

## Layout levels (5-C3a)

1. **Page frame** — `assets/base.css` (`.shopify-section` grid, `page_width`, `page_margin`) and `container-page` in `tailwind/tailwind.utilities.css`.
2. **Section frame** — `snippets/section-frame.liquid` only.
3. **Inside a section** — repeated patterns become snippets (`content-group` for stacked copy and actions). Column grids use `grid-list`; one-off arrangements use flex/grid utilities with relationship gap tokens. No generic layout wrapper driven only by direction/alignment parameters.

Placement utilities (`place-top-left`, `place-center`, …) in `tailwind/tailwind.utilities.css` position content inside stage and media frames.

## Height kinds (5-C3a)

| Kind | Rule |
| --- | --- |
| `content` | No fixed height on copy boxes |
| `media` | `aspect-ratio` minimum; image `object-cover`; content may grow the frame |
| `stage` | Shared `min-height` from `--section-stage-min-height` (`100svh` minus `--announcement-bar-height` and `--header-height`) on `section-frame--height-stage` |

Overlays cap with `dvh`. Do not use `vh` in new theme CSS. Controls and icons keep fixed sizes (24px touch-target floor).

## Spacing tokens (5-C3a)

Three relationship-named fluid gaps in `tailwind/tailwind.input.css`, consumed as `gap-tight`, `gap-related`, and `gap-group` in `tailwind/tailwind.utilities.css`:

| Token | Desktop target (dominant legacy utility) |
| --- | --- |
| `--spacing-gap-tight` | `gap-2` (8px) |
| `--spacing-gap-related` | `gap-4` (16px) |
| `--spacing-gap-group` | `gap-6` (24px) |

Each token uses the same linear `clamp()` as section padding (0.6× at 375px viewport width to 1× at 1280px). Prefer `gap` utilities; margin and `space-y` are exceptions.

**Section padding clamp** (merchant setting `v` in px, computed in `section-frame`):

`clamp(0.6v px, a px + b vw, v px)` with `b = 40v / 905`, `a = 0.6v − 3.75b` (three decimal places). `v = 0` yields `0`. The root sets `--section-frame-padding-top` and `--section-frame-padding-bottom`; `snippets/section-frame.liquid` stylesheet applies them. First-section header offset uses `main > .shopify-section:first-child > .section-frame:not(.section-frame--no-safe-top)` (equivalent to `main > section:first-child .layout:first-child` in `assets/base.css`). `safe_top: false` adds `section-frame--no-safe-top`.

## Primitive snippets (5-C3a)

| Snippet | Role |
| --- | --- |
| `snippets/section-frame.liquid` | Section root frame; optional `background` slot before `container-page` inner |
| `snippets/heading.liquid` | Semantic `h1`–`h6` + visual `heading-*` tier |
| `snippets/text.liquid` | Body / RTE copy + `body-*` tier |
| `snippets/button.liquid` | `btn` / `btn-primary` / `btn-secondary`; not plain text links (`snippets/link.liquid`) |
| `snippets/content-group.liquid` | Vertical stack with relationship gaps (3+ section consumers in inventory) |
| `snippets/image.liquid` | Image display; ratio vocabulary keywords mapped in one place |

## Stylesheet Placement Constraints

Four constraints govern CSS written from here on. Violations of 1-3 fail silently at runtime.

1. **Plain CSS in `{% stylesheet %}`.** Shopify ships `{% stylesheet %}` content as written. `@apply`, `@utility`, and `@variant` never run there. Use plain CSS only: properties, nesting, pseudo-elements, keyframes, container queries, `:has()`, and direct `var()` consumption.

2. **Subsetting compatibility.** A file's `{% stylesheet %}` classes may be used only within that file or files it directly renders. Cross-file use breaks once CSS lives in a subsetted block. Example: `snippets/quantity-selector.liquid` defines control classes consumed by its own markup.

3. **Shared vocabulary boundary.** The Tailwind build (`tailwind/tailwind.input.css` and imported `tailwind.*.css` layers) owns shared vocabulary: design tokens bridged into `@theme inline`, typography tiers, surfaces, layout vocabulary, reusable motion capabilities, and cross-cutting utilities. Component-specific selectors with a single render-tree owner belong in that owner's `{% stylesheet %}` block. CSS that must survive when the defining file is absent from a subsetted response stays in the Tailwind build. **Growth rule:** new shared-layer entries require either (a) 2+ unrelated consumers, or (b) an explicit accepted architecture decision recorded in this reference or `AGENTS.md`.

4. **Liquid markup styling.** In Liquid markup, prefer existing Tailwind utilities and shared vocabulary classes. Component-owned CSS goes in the file's `{% stylesheet %}` block. Liquid templates never contain ad-hoc `<style>` elements.

## Bundled Asset Tag Constraints

Three Shopify platform constraints govern `{% stylesheet %}` and `{% javascript %}` tags. Violations pass local Theme Check and CLI validation but fail in the theme editor.

1. **One `{% stylesheet %}` per file.** Each `.liquid` file may contain at most one `{% stylesheet %}` block. More than one is a syntax error when editing theme code.
2. **One `{% javascript %}` per file.** Each `.liquid` file may contain at most one `{% javascript %}` block. More than one is a syntax error when editing theme code.
3. **No Liquid inside bundled asset tags.** Liquid output (`{{ }}`) and tags (`{% %}`) are not rendered inside `{% stylesheet %}` or `{% javascript %}` blocks. Including Liquid there can cause syntax errors or prevent styles from applying.

`npm.cmd run lint:theme` enforces all three. Sources: [JavaScript and stylesheet tags](https://shopify.dev/docs/storefronts/themes/best-practices/javascript-and-stylesheet-tags), [`{% stylesheet %}` tag](https://shopify.dev/docs/api/liquid/tags/stylesheet) (verified 2026-09-20).

## Decision Flow

1. Is this only a token? Use `css-variables.liquid` or scoped inline custom properties.
2. Is this typography? Use `tailwind.typography.css`.
3. Is this a single control/primitive? Use `tailwind.elements.css`.
4. Is this reused by 2+ unrelated consumers? Use `tailwind.components.css`.
5. Is this owned by one section, block, or snippet render tree? Use that file's `{% stylesheet %}` block (plain CSS). Classes may be used only in that file or files it directly renders.
6. Is this cross-cutting layout/surface/z-index? Use `tailwind.utilities.css`.
7. Is this motion capability/keyframe CSS? Use `tailwind.animates.css`.
8. Must it survive subsetting when the defining Liquid file is absent? Keep it in the Tailwind build (steps 2–4, 6, or 7). Do not place it in a `{% stylesheet %}` block outside its render tree.

Never edit `vendor-*.min.css` manually. CSS source changes require `npm.cmd run build:tw`; never manually edit `assets/tailwind.output.css`.
