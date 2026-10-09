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
| `snippets/css-variables.liquid` | Merchant settings, color-scheme RGB triplets, colour alpha steps, typography, motion | Runtime CSS custom-property source |
| `tailwind/tailwind.input.css` | Tailwind `@theme inline` bridge | Only bridge values that need Tailwind utility consumption |
| Snippet/section inline custom properties | Per-render dynamic variables | Valid only when scoped to that render tree |
| `tailwind/tailwind.*.css` | CSS consumption of tokens | Prefer direct `var()` for geometry/motion internals |

## Global settings chain

Typography and color flow through `config/settings_schema.json` → `snippets/css-variables.liquid` → tokens → tier or scheme classes. Prefer that chain for theme-linked copy. Local intent may use the Tailwind weight, leading, and tracking scales in Liquid, and matching literals in first-party CSS; colour goes through the roles under **Color, Surface, And Inline Style** (see **Style ownership** and `settings-chain-*` in `check-theme-architecture` SKILL.md). Still reject arbitrary values (`text-[14px]`, `bg-[#f00]`), default text sizes, default font families, other palette colours, and non-chain `font-size` / `font-family` literals.

`tailwind/tailwind.input.css` resets Tailwind default namespaces to `initial` for breakpoints, font family (`--font-*`), font size (`--text-*`), easing, and animation. The `--font-weight-*`, `--leading-*`, `--tracking-*`, and `--color-*` namespace resets are **not adopted**: Tailwind's default scales remain the project scales for local utility intent (batch 5-C3f). When a palette reset is adopted later, re-declare the keyword colors `transparent`, `current`, and `inherit` after it so utilities such as `text-current` keep working.

A typography value passes when it derives from the chain or from the inherited, already-derived value: `var(--font-*)` alone or inside `calc()` / `max()` / `min()` / `clamp()`, `inherit`, `unset`, `bolder`, `lighter`, or an `em` / `%` size. `font-weight` may also use the numeric scale (`100`–`900`), `normal`, or `bold`. `line-height` may be unitless or `normal`. `font-size` literals such as `1rem` or `14px` still fail.

```css
/* Don't: a literal size bypasses body/heading sliders */
.card__title { font-size: 1.125rem; }

/* Do: take the size from the chain */
.card__title { font-size: calc(var(--font-heading-size) * var(--font-heading-scale)); }
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
| `assets/base.css` | document defaults, native elements, global `:focus-visible`, `body > main { flex-grow: 1 }`, `[x-cloak]`, universal helpers | reusable component chrome |

### Skeleton carry-over decisions (5-C3f)

| Rule (skeleton `5191a50`) | Decision | Reason |
| --- | --- | --- |
| `.section { padding; background-image }` | **Not adopted** | Superseded by `section-frame`; 40 section schemas use `"class": "section"` and would double padding. |
| `.gift-card-page main { … }` | **Not adopted** | Theme `gift-card-page__main` owns layout. |
| `.gift-card-page [data-gift-card-qr] svg { … }` | **Not adopted** | Theme `gift-card-page__qr` owns sizing. |
| `body > main { flex-grow: 1 }` | **Adopted** in `assets/base.css` | Matches the `<main>` in `layout/theme.liquid` and in `templates/gift_card.liquid`; both bodies use the base grid, so `flex-grow` has no effect today. `layout/password.liquid` has a `flex flex-col` body, but its `<main>` is rendered inside a `.shopify-section` wrapper, so the selector does not match. |
| `:focus-visible { outline … }` | **Adopted** in `assets/base.css` (`@layer base` via import) | Any focus style in a higher layer still wins (`btn`, `field`, `links`, `focus-ring`, `skip-link`, component rings). Elements without one gain the outline, including component triggers with no ring (for example `accordion__trigger`, `dropdown-trigger`, `active-filter-chip`). A component that removes the outline on `:focus` must scope that to `:focus:not(:focus-visible)` so keyboard focus keeps a ring (`quantity-selector__input`, `sort-by-dropdown__trigger`). |
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

## Style ownership (5-C3f)

**Single source for look.** Buttons, fields, links, and controls are defined in `tailwind/tailwind.elements.css`. Typography tiers live in `tailwind/tailwind.typography.css`. Snippets and raw markup classes resolve to the same utilities, so a visual change edits one layer file.

**Snippets carry structure and behaviour, not a forced style entry.** Primitives (`heading`, `text`, `button`, `link`, `image`, `content-group`, `section-frame`) hold shared tags, ARIA, link `rel`, image sizing, and motion attributes. They are the preferred entry for section-level composition; raw element classes remain valid for Alpine bindings, `<template>` contents, and component internals.

**Local overrides.** Tailwind weight, leading, tracking, and `transparent` utilities may express one-off intent; black and white only through the scrim roles. An override that repeats across files becomes a variant in `tailwind.typography.css` or `tailwind.elements.css`. `lint:theme` (`settings-chain-liquid`, `settings-chain-css-typography`, `settings-chain-css-color`) allows the same scales in Liquid classes and first-party CSS (black/white literals pass it but fail `raw-colour`); it still rejects default text sizes, font families, other palette colours, arbitrary `[…]` utilities, and non-chain `font-size` / `font-family` literals.

**Loaded font weights.** `snippets/css-variables.liquid` loads the base weight and `bold` via `font_modify` only. Weights without a face match by CSS font matching (`font-medium` / 500 uses the 400 face; `font-semibold` / 600 uses the 700 face). Loading additional weights is a design-phase decision.

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
- Those properties are comma-separated triplets (`r, g, b`). Alpha is written only in the token files, as `rgba(var(--color-foreground), var(--alpha-72))`; consumers use the roles below. The form `rgb(var(--color-foreground) / 0.55)` expands to `rgb(r, g, b / 0.55)`, which browsers reject and drop silently. `lint:theme` fails `rgb(var(--color-*) / alpha)` in `{% stylesheet %}` blocks and first-party CSS (`tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`).
- The first configured color scheme is the `:root` token fallback; it is not the implicit visible page-canvas decision.
- `settings.page_canvas_color_scheme` explicitly owns the visible `<body>` canvas behind sections, during overscroll, and in areas without their own color-scheme scope.
- Section, overlay, drawer, modal, and component color-scheme scopes override the body canvas normally.
- Use one surface role per node: `color-{{ section.settings.color_scheme }}` on the section frame, or `surface-component` on nested overlays such as dropdown panels. `lint:theme` (`section-color-scheme`) fails a section with a `color_scheme` setting whose root lacks the class. A section that renders `snippets/section-frame.liquid` with `section: section` passes only while the snippet writes `color-{{ section.settings.color_scheme }}` literally in a `class` attribute outside comments. Keep that literal; do not build it through a variable. The check reads markup, not the rendered DOM.
- Use semantic tokens or scheme utilities for theme UI; avoid hardcoded brand colors unless documented as a platform bridge or local effect.

### Colour layers (6-C4)

| Layer | Lives in | Holds | Consumers |
| --- | --- | --- | --- |
| 0 source | `config/settings_schema.json` → `snippets/css-variables.liquid`; bridge tokens in `tailwind/tailwind.input.css` | Scheme roles as RGB triplets (`--color-foreground`, `--color-border`, …); bridge tokens (`--color-theme-text`, `--color-field`, `--color-primary`, …) for utilities | CSS uses the triplets as `rgb(var(--color-*))`; the bridge tokens are utility-only (`text-theme-text`), never `var()` in CSS |
| 1 steps | `snippets/css-variables.liquid` | Abstract alpha scale on `:root`: `--alpha-5`, `-10`, `-20`, `-35`, `-50`, `-72`, `-80`; shadow steps `--alpha-shadow-sm` / `-md` / `-lg` per scheme, higher when the scheme background's `color_brightness` is below 128 | Token files only |
| 2 roles | `tailwind/tailwind.input.css` (`@theme inline`), re-declared per scheme in `snippets/css-variables.liquid` | Semantic colour and shadow tokens, each on one step. Named exceptions without a step: `--color-card` (reads its own scheme field, `--color-card-background`), and the fixed `--color-scrim-solid` (black) and `--color-on-scrim` (white) | Sections, snippets, layer CSS, as utilities or `var(--color-<role>)` |
| 3 aliases | The owning component's CSS | Optional component name for a role (`--card-border-hover: var(--color-line-strong)`) | That component |

Tint steps are one set for every scheme: a tint's strength already follows the scheme's own foreground/background contrast. Only shadows (black) rise on dark backgrounds, where a light-scheme shadow would vanish.

**Why roles are declared twice.** A custom property whose value contains `var()` resolves on the element that declares it, and descendants inherit the result. Declared only on `:root`, `var(--color-muted)` would carry the first scheme's foreground into every section. Utilities are unaffected (`@theme inline` writes the formula into each utility), but CSS consumers need the role re-declared on every scheme scope, so the scheme loop in `css-variables.liquid` repeats each scheme-dependent role with the identical value; `lint:theme` `colour-role-sync` keeps both lists equal. Scrims and on-scrim colours are fixed, so they are declared once.

| Role | Utilities | Use |
| --- | --- | --- |
| `--color-muted` | `text-muted` | Secondary text; the body default colour uses the same step |
| `--color-subtle` | `text-subtle` | Captions, meta, hints |
| `--color-faint` | `text-faint` | Graphics only (placeholder art, empty rating stars); never text |
| `--color-line` / `--color-line-strong` | `border-line`, `divide-line`, `bg-line` (1px rules) / `border-line-strong` | Dividers and card edges / hover and active edges, scrollbar thumbs |
| `--color-line-inverse` | `border-line-inverse`, `bg-line-inverse` (1px rules) | Lines on an inverted fill (a foreground-coloured card or chip); the fill itself is `rgb(var(--color-foreground))` / `bg-theme-text` with background-coloured content |
| `--color-surface-muted` / `--color-surface-strong` | `bg-surface-muted` / `bg-surface-strong` | Quiet fills and placeholders / hover, selected, pressed, track and skeleton-loader fills, disabled controls |
| `--color-indicator` / `--color-indicator-strong` | `bg-indicator` / `bg-indicator-strong` | State indicators: carousel and pagination dots, step bars / their hover or emphasised state |
| `--color-veil` | `bg-veil` | Translucent scheme background over media |
| `--color-card` | `bg-card` | White product and collection card surfaces (`card_background_color` on every scheme) |
| `--color-scrim` / `--color-scrim-strong` / `--color-scrim-solid` | `bg-scrim` / `bg-scrim-strong` / `bg-scrim-solid` | Dialog and drawer backdrops, image text scrims / full-focus media viewers / the opaque image lightbox backdrop; fixed black |
| `--color-on-scrim` / `--color-on-scrim-muted` | `text-on-scrim` / `text-on-scrim-muted` | Text and icons over a scrim; fixed white |
| `--shadow-sm` / `-md` / `-lg` | `shadow-sm`, `shadow-md`, `shadow-lg` | Elevation; the `--shadow-*` namespace is reset, so Tailwind's other shadow utilities do not exist |

**Mapping rule** for a raw value in old code: by CSS property first (`color` → text roles; borders, outlines, dividers, 1px rules and `0 0 0 1px` rings → line roles; fills on the foreground → surface roles, or indicator roles for dots and step bars; fills on the background → `veil` or `surface-muted`; black or white over media → scrim roles; decorative `box-shadow` → shadow roles), then the nearest step. A need no role covers adds a role on an existing step here, never a raw value in a consumer; a role without a step is allowed only as a named exception in the layer table above.

**Out of the role set:** setting-driven alphas (`rgba(var(--color-*), var(--…))` for focus rings and the merchant shadow settings) and the button reverse-fill mixes, which carry `lint-allow raw-colour` with that reason.

**Schemes (6-C9):** five merchant colour schemes in `config/settings_data.json`: `scheme-1` (dark green canvas), `scheme-2` (light grey page), `scheme-3` (lime accent), `scheme-4` Sage (provisional sage canvas), and `scheme-5` Page (white canvas). Home sections on the design sage background use `scheme-4` in `templates/index.json`.

**Standalone colour settings:** the only `color` / `color_background` settings outside the `color_scheme_group` definition are the eight global product-badge colours (`badge_sale_*`, `badge_sold_out_*`, `badge_custom_1_*`, `badge_custom_2_*`), each allowlisted in `colour-setting-lint.js` with a reason. The allowlist applies to `config/settings_schema.json` only; the same IDs in a section or block schema fail. `lint:theme` `colour-setting` rejects any other colour setting in `config/settings_schema.json` or section and block schemas. A section that needs its own colours offers a scheme picker instead: `main-page-contact` `form_color_scheme` (default `scheme-5`, the white Page scheme) colours the form panel.

**Enforcement:** `lint:theme` `raw-colour`, `colour-role-sync`, and `colour-setting` (see `check-theme-architecture` SKILL.md). `npm.cmd run scan:contrast` reports WCAG contrast for each scheme's key pairs from `config/settings_data.json`, including `text-muted` and `text-subtle` composited on the background; it reports and never fails.
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

Move a rule into a file's `{% stylesheet %}` block only when every compound of its selector, nested selectors included, is anchored on a class that file owns. The other classes in the selector may be:

- classes rendered inside that file's render tree, such as snippets it renders, even if other files also render those snippets;
- classes that JavaScript or a vendored library (for example Swiper) generates inside that tree.

This matches Shopify's own scope check (Theme Check `ValidScopedCSSClass`), and the anchor class keeps the rule from reaching elements outside the owner. Rules whose subject is a shared or generated class with no owned anchor stay in the Tailwind build. Move a BEM block whole.

(User decision, 2026-10-03: this replaces the stricter "every class owned" rule from 5-C2.)

Every section with merchant padding settings uses `section-frame` for that padding and the section colour shell. `assets/base.css` has no `.layout` rules. `.section-frame__inner` is `position: relative` and sits inside the root padding, so it is the containing block for absolute children; a section whose absolute children must be placed against the root (main-page-about) passes `inner_class: 'static!'`, and a layer that must cover the root padding box goes in the `background` slot (main-page-contact's watermark).

## Layout levels (5-C3a)

1. **Page frame** — see **Page frame (6-C5)** below.
2. **Section frame** — `snippets/section-frame.liquid` only.
3. **Inside a section** — repeated patterns become snippets (`content-group` for stacked copy and actions). Column grids use `grid-list`; one-off arrangements use flex/grid utilities with relationship gap tokens. No generic layout wrapper driven only by direction/alignment parameters.

## Page frame (6-C5)

Layer order: merchant settings → `snippets/css-variables.liquid` (`--page-width`, `--page-margin`) → frame tokens on `:root` in `assets/base.css` → `.shopify-section` and `container-page` → `section-frame` width/height → section interior layout.

**Ownership.** The page frame is the only owner of page width and the one-screen height unit (`--screen-height` in `tailwind/tailwind.input.css`). Inner layers consume frame tokens; they do not recompute page insets or full viewport height.

**Tokens (`assets/base.css` `:root`).**

| Token | Value / role |
| --- | --- |
| `--page-grid-columns` | Single three-track grid with named lines `full` / `content` (today's `minmax(var(--page-margin), 1fr)` … `minmax(0, var(--page-width))` … tracks). |
| `--page-inset` | `max(var(--page-margin), calc((100% - var(--page-width)) / 2))` for section-local inset without reading width/margin tokens in Liquid. |

**Consumption.**

- `.shopify-section` and `container-page` set `grid-template-columns: var(--page-grid-columns)`; direct children default to `grid-column: content`; `.full-width` uses `grid-column: full`.
- `--section-stage-min-height` is `var(--screen-height)` (`100svh` at the token source only).

**Rules.**

| Rule | Kind | Check |
| --- | --- | --- |
| One page-grid track list with named lines `full` / `content`, shared by `.shopify-section` and `container-page` | Enforced by structure (no lint) | One `--page-grid-columns` definition in `assets/base.css`; both consumers reference it |
| `sections/` and `snippets/` never read `--page-width` / `--page-margin` (Liquid comments excepted; CSS and HTML comments fail closed); custom insets use `--page-inset` | Enforced | `page-token-scope` |
| `tailwind/tailwind.components.css` never reads `--page-width`; `--page-margin` remains the gutter token there | Enforced | `page-token-scope` |
| One-screen height is `var(--screen-height)`, not literal `100svh` / `100vh` / `100lvh` / `100dvh`, in every Liquid file (`layout/`, `sections/`, `snippets/`, `blocks/`, `templates/`) | Enforced | `screen-height-literal` (only the exact header menu cap `calc(100dvh - var(--announcement-bar-height) - var(--header-height))` is excepted) |
| A `section-frame` render with `width: 'full'` only in allowlisted sections, never in snippets | Enforced | `frame-full-allowlist` (literal argument only; a variable width is not resolved) |
| Full-width sections keep text and controls on the `content` column; only backgrounds and named media span `full` | Guidance | Verifier / polish pass |
| Fractional viewport units inside a section's choreography, overlay `dvh` / `vh` caps, article/search hero heights, product `80` / `90svh` media options | Guidance | — |

**`width: 'full'` allowlist.**

| Section | Reason |
| --- | --- |
| `slides-show` | Slide media behind content |
| `routine-showcase` | Stage background |
| `article`, `blog` | Hero media behind content |
| `main-page-about` | Image behind content |
| `ritual-steps` | Stage background; copy inset with `--page-inset` |
| `promo-bannder` | Edge-to-edge panel media |
| `google-map` | Map is the content (named exception) |

Placement utilities (`place-top-left`, `place-center`, …) in `tailwind/tailwind.utilities.css` position content inside stage and media frames.

## Height kinds (5-C3a)

| Kind | Rule |
| --- | --- |
| `content` | No fixed height on copy boxes |
| `media` | `aspect-ratio` minimum; image `object-cover`; content may grow the frame |
| `stage` | `section-frame--height-stage`: `display: grid` with one `minmax(0, 1fr)` row and `min-height: var(--section-stage-min-height)` (`var(--screen-height)` via `--section-stage-min-height` in `tailwind/tailwind.input.css`; padding included via `box-sizing: border-box` on `.section-frame`). `.section-frame__inner` is the sole grid item and stretches to that row; a stretched grid item has a **definite** block size (CSS Grid), so descendant `height: 100%` / `h-full` chains resolve as under former `h-screen`. `.section-frame__stage` sets only `height: 100%` and `min-height: 0`, so the inner wrapper keeps its own display (`container-page` stays a grid). `section-frame__stage--center` adds `display: flex; flex-direction: column; justify-content: center` for vertically centred copy (404). |
| `stage-pc` | Same grid construction from `(width >= 48rem)` / `tablet` up only (`section-frame--height-stage-pc` inside the tablet breakpoint). Mobile stays content-sized. |

Overlays cap with `dvh`. Do not use `vh` in new theme CSS. Controls and icons keep fixed sizes (24px touch-target floor).

## Space scale (6-C7)

One fluid scale in `tailwind/tailwind.input.css` (`@theme inline`). Each step is a multiple of one base that runs from 6px at `100vw` = 375px to 10px at `100vw` = 1280px, the same 0.6× linear `clamp()` as section padding, written in `rem` (10px on the 62.5% root). The endpoints are in `vw` terms: the root keeps `scrollbar-gutter: stable`, so on desktop `100vw` excludes the classic scrollbar (about 15px) and a 1280px browser window computes slightly below the maximum (60px reads 59.6px). Mobile overlay scrollbars take no width, so the 375px end is exact. Measure the endpoints at a width where `100vw` equals the column header. Because the steps live in Tailwind's `--spacing-*` namespace, every spacing utility accepts them: `gap-step-m`, `mt-step-l`, `px-step-s`, `space-y-step-xs`; stylesheets read `var(--spacing-step-m)`.

| Step | × base | `100vw` = 375px | `100vw` = 1280px |
| --- | --- | --- | --- |
| `step-3xs` | 0.25 | 1.5px | 2.5px |
| `step-2xs` | 0.5 | 3px | 5px |
| `step-xs` | 0.75 | 4.5px | 7.5px |
| `step-s` | 1 | 6px | 10px |
| `step-m` | 1.5 | 9px | 15px |
| `step-l` | 2 | 12px | 20px |
| `step-xl` | 3 | 18px | 30px |
| `step-2xl` | 4 | 24px | 40px |
| `step-3xl` | 6 | 36px | 60px |

**Why `step-`.** A bare `--spacing-xl` or `--spacing-2xl` makes Tailwind resolve `max-w-xl` / `max-w-2xl` to the spacing value instead of `--container-*`. Keep the prefix for any new step.

**Semantic aliases** (map design intent to these first; use a step only when no alias fits):

| Alias | Step | Intent |
| --- | --- | --- |
| `tight` | `2xs` | parts of one item (icon and label, price and badge) |
| `related` | `s` | items of one group (heading and text, stacked copy) |
| `group` | `m` | groups inside a block (copy group and actions) |
| `section` | `xl` | header group to body inside a section (provisional value) |

`snippets/content-group.liquid` maps its `gap` parameter to `gap-tight`, `gap-related`, and `gap-group`.

**Old-to-new table** (raw Tailwind unit `--spacing: 0.25rem`, 2.5px on the 62.5% root; convert with that unit, not 4px): `1`→`3xs`, `2`→`2xs`, `3`→`xs`, `4`→`s`, `5`→`m`, `6`→`m`, `8`→`l`, `10`→`xl`, `12`→`xl`, `16`→`2xl`, `20`→`3xl`, `24`→`3xl`. Larger values and positioning offsets (`inset`, `top`, `left`, …) are named exceptions. Raw values are fixed and steps are fluid, so a migrated value shrinks to 0.6× on mobile; the polish pass owns that change. `lint:theme` `raw-spacing` (a ratchet baseline) keeps new raw spacing utilities out. Values map today's rendering; calibration comes from the design.

## Type scale (6-C8)

Eleven fluid steps `--type-step--2` .. `--type-step-8` in `snippets/css-variables.liquid`. Each step is base × ratio^n at both ends of the viewport range, with ratio interpolating from 1.2 at `100vw` = 375px to 1.25 at 1280px (fixed in code). The mobile and desktop body size settings (`body_font_size_mobile`, `body_font_size`; defaults 14 and 16) are the step-0 bases. Values are `clamp()`s in `rem` on the 62.5% root (same linear `vw` shape as the space scale). Step 3 exists on the scale but has no dedicated semantic utility yet.

**Semantic utilities** in `tailwind/tailwind.typography.css` (names do not start with `heading-` or `body-`, so the legacy-type-tier ratchet does not count them):

| Utility | Step | Role |
| --- | --- | --- |
| `title-xs` | 0 | Heading scale × `--font-heading-scale` on `heading-base` |
| `title-s` | 1 | |
| `title-m` | 2 | |
| `title-l` | 4 | |
| `title-xl` | 5 | |
| `title-2xl` | 6 | |
| `title-3xl` | 7 | |
| `title-4xl` | 8 | |
| `copy-s` | −1 | Body scale × `--font-body-scale` on `body-base` |
| `copy-m` | 0 | |
| `copy-l` | 1 | |
| `copy-xl` | 2 | |

**Legacy tier aliases** (same computed size as the mapped utility; no 768px size switch):

| Legacy | Maps to |
| --- | --- |
| `heading-h6`, `heading-h5`, `heading-h4` | `title-xs` (step 0) |
| `heading-h3` | `title-s` (1) |
| `heading-h2` | `title-m` (2) |
| `heading-h1` | `title-l` (4) |
| `heading-xl` | `title-xl` (5) |
| `heading-2xl` | `title-2xl` (6) |
| `heading-3xl` | `title-3xl` (7) |
| `heading-4xl` | `title-4xl` (8) |
| `body-xs`, `body-sm` | `copy-s` (−1) |
| `body-md` | `copy-m` (0) |
| `body-lg`, `body-xl` | `copy-l` (1) |
| `body-2xl`, `body-3xl` | `copy-xl` (2) |

`heading-size-custom` and `body-size-custom` are unchanged.

**Merchant size selects** use the semantic option values above (eight heading, four body). Labels come from `t:settings.type_size.*` in `locales/en.default.schema.json`. A mixed select (heading and body sizes in one list, for example the `collection-list` card titles) offers the mapped values of its old options only, ordered by step, with role-qualified labels from `t:settings.type_size_mixed.*` ("Heading: Medium", "Text: Large") so equal steps from the two roles stay distinguishable. A section stylesheet never sets an absolute `font-size` on an element whose size comes from a merchant setting; the stylesheet wins over utilities and would mute the setting. Relative values (`inherit`, `em`, `%`) follow the setting and are allowed.

**Section padding clamp** (merchant setting `v` in px, computed in `section-frame`):

`clamp(0.6v px, a px + b vw, v px)` with `b = 40v / 905`, `a = 0.6v − 3.75b` (three decimal places). `v = 0` yields `0`. The root sets `--section-frame-padding-top` and `--section-frame-padding-bottom`; `snippets/section-frame.liquid` stylesheet applies them on the root by default, or on descendants via `padding_mode: overlay` and `section-frame__overlay-padding`, `section-frame__overlay-padding-top`, or `section-frame__overlay-padding-bottom` (the one-sided classes set only their own side; pair `section-frame__overlay-safe-top` on a top block for the first-section-only header offset). First-section header offset uses `main > .shopify-section:first-child > .section-frame:not(.section-frame--no-safe-top)` (and overlay safe-top descendants when `padding_mode: overlay`). `safe_top: false` adds `section-frame--no-safe-top`. By default `.section-frame` clips (`overflow: hidden`). Pass `element: main`, `header`, or `footer` when the section root must be a landmark (password template); default `div`. Pass `clip: false` when sticky descendants must not be clipped vertically (product core sections): it adds `section-frame--no-clip` to the root, which sets `overflow-x: clip` and `overflow-y: visible` on the root and its direct `.section-frame__inner`. `.section-frame__inner` is positioned but sets no `z-index`, so fixed overlays rendered inside a section (drawers, modals) stack against the header as they did before the frame; tree order paints it above `.section-frame__background`.

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

1. **Plain CSS in `{% stylesheet %}`.** Shopify ships `{% stylesheet %}` content as written. `@apply`, `@utility`, and `@variant` never run there, and neither do Tailwind functions (`theme()`, `--spacing()`, `--alpha()`): the browser drops the declaration or the whole media block. `lint:theme` rejects both. Use plain CSS only: properties, nesting, pseudo-elements, keyframes, container queries, `:has()`, and direct `var()` consumption.

2. **Subsetting compatibility.** A file's `{% stylesheet %}` classes may be used only within that file or files it directly renders. Cross-file use breaks once CSS lives in a subsetted block. Example: `snippets/quantity-selector.liquid` defines control classes consumed by its own markup.

3. **Shared vocabulary boundary.** The Tailwind build (`tailwind/tailwind.input.css` and imported `tailwind.*.css` layers) owns shared vocabulary: design tokens bridged into `@theme inline`, typography tiers, surfaces, layout vocabulary, reusable motion capabilities, and cross-cutting utilities. Component-specific selectors with a single render-tree owner belong in that owner's `{% stylesheet %}` block. CSS that must survive when the defining file is absent from a subsetted response stays in the Tailwind build. **Growth rule:** new shared-layer entries require either (a) 2+ unrelated consumers, or (b) an explicit accepted architecture decision recorded in this reference or `AGENTS.md`.

4. **Liquid markup styling.** In Liquid markup, prefer existing Tailwind utilities and shared vocabulary classes. Component-owned CSS goes in the file's `{% stylesheet %}` block. Liquid templates never contain ad-hoc `<style>` elements.

## Bundled Asset Tag Constraints

Three Shopify platform constraints govern `{% stylesheet %}` and `{% javascript %}` tags. Violations pass local Theme Check and CLI validation but fail in the theme editor.

1. **One `{% stylesheet %}` per file.** Each `.liquid` file may contain at most one `{% stylesheet %}` block. More than one is a syntax error when editing theme code.
2. **One `{% javascript %}` per file.** Each `.liquid` file may contain at most one `{% javascript %}` block. More than one is a syntax error when editing theme code.
3. **No Liquid inside bundled asset tags.** Liquid output (`{{ }}`) and tags (`{% %}`) are not rendered inside `{% stylesheet %}` or `{% javascript %}` blocks. Including Liquid there can cause syntax errors or prevent styles from applying.

`npm.cmd run lint:theme` enforces all three. Sources: [JavaScript and stylesheet tags](https://shopify.dev/docs/storefronts/themes/best-practices/javascript-and-stylesheet-tags), [`{% stylesheet %}` tag](https://shopify.dev/docs/api/liquid/tags/stylesheet) (verified 2026-09-20).

## Breakpoints and hover (6-C2)

- **Breakpoints:** `--breakpoint-tablet` 48rem (768px), `--breakpoint-desktop` 64rem (1024px) and `--breakpoint-wide` 80rem (1280px), in `tailwind/tailwind.input.css`. Media query `rem` follows the user's default font size (16px), not the 62.5% root.
    - `pc` (48rem) and `fw` (80rem) remain as legacy aliases for existing classes. New markup uses `tablet:`, `desktop:` and `wide:`.
    - The migration lint counts `pc:` / `fw:`.
- **Hover:** `can-hover` is `(hover: hover) and (pointer: fine)`; `no-hover` is its negation, `not ((hover: hover) and (pointer: fine))`.
    - They are `@custom-variant`s for classes.
    - Stylesheets write the same two conditions as media queries.
    - Touch devices do not depend on hover.
- **Liquid `{% stylesheet %}` media queries** may use only:
    - `(width >= 48rem | 64rem | 80rem)` and their `<` forms;
    - the `can-hover` pair;
    - `prefers-reduced-motion`;
    - any of these joined by `and`.
    - `lint:theme` rejects px values, `min-width` / `max-width` spellings and other numbers. Custom properties and Tailwind's theme function do not work in media queries there.
- **`no-hover` stands alone.** CSS grammar does not allow `not (…)` to be joined by `and` without extra parentheses. To combine it with a width, nest a width query inside the `no-hover` block.

## Font weights (6-C3)

- **Loaded faces:** each font role loads its base face, bold (700) and their italics (`snippets/css-variables.liquid`).
- **What fails:** a weight without a loaded face falls back silently to the nearest loaded one. So markup, `@apply` and stylesheets use only `font-normal` / `font-bold` (400 / 700). `lint:theme` rejects every other weight utility and numeric `font-weight`.
- **Adding a weight:** load its face per role first (a design decision with a font payload cost), then widen the lint.

## Migration lints (6-C1)

`lint:theme` counts three legacy patterns in Liquid markup (`layout/`, `sections/`, `snippets/`), per file:

- `legacy-type-tier`: the `heading-*` / `body-*` tier utilities, read from `tailwind/tailwind.typography.css` (not the `*-base` mixins);
- `raw-spacing`: gap, padding, margin and `space-*` utilities with a numeric or arbitrary value (`0`, `px`, `auto` and token aliases do not count);
- `legacy-breakpoint`: class tokens with the `pc:`, `max-pc:`, `fw:` or `max-fw:` variant.

**What is counted:**
- **Counted:** tokens in three places:
    - quoted HTML attribute values;
    - string literals inside Liquid tags and outputs (assigns, `case` values, `render` parameters);
    - the body of `{% capture *class* %}` blocks.
- **Variants and the important modifier are stripped first:** `pc:mt-4!` counts as `mt-4`. The font weight lint uses the same extraction.
- **Not counted:**
    - text content;
    - `{% schema %}` blocks, whose option values are merchant data IDs;
    - comments, including `#` lines inside `{% liquid %}`;
    - `{% stylesheet %}` and `{% javascript %}` blocks.
- **Known limits:**
    - class names built from Liquid output (`{{ ... }}`) cannot be resolved, so they are not counted;
    - a `{% capture %}` whose name does not contain `class` is treated as text, even if it is later used as a class list;
    - every quoted attribute value and Liquid string literal is a candidate whatever its purpose. A `data-*` value such as `pc:flex` counts.

**The baseline is a ratchet:** `.agents/skills/check-theme-architecture/scripts/migration-baseline.json`.
- **Fails:** a file whose count rises above its entry, or a file with no entry that uses a pattern.
- **Falls:** a lower count passes, with a hint to run `node .agents/skills/check-theme-architecture/scripts/lint-theme.js --shrink-migration-baseline`. That flag only lowers entries and removes zeros.
- **Raising an entry:** a manual edit, and it needs the user's approval.
- **Creating it:** `--write-migration-baseline` refuses when the file exists.

The baseline reaches zero through the breakpoint, type and space batches and the polish pass.

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
