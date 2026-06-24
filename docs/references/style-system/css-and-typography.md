# CSS, Typography, Color, And Icon Reference

This reference stores style-system details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing CSS layers, Tailwind source, typography tiers, color tokens, inline styles, SVG icons, or related cleanup.

**CSS architecture contract (token flow, layer ownership, bridge gaps, migration backlog):** see [`css-architecture.md`](css-architecture.md). Read that file first for layer-placement audits; use this file for typography, color, surface, and icon consumption detail.

For animation and transition work, classify through `docs/references/architecture/motion-architecture.md` before applying CSS layer rules.

## CSS Layer Files

| File                               | Purpose                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `tailwind/tailwind.input.css`      | Entry point: `@theme inline` token bridge, breakpoints, imports, explicit layer ordering |
| `assets/base.css`                  | Global reset and structural defaults                                      |
| `tailwind/tailwind.typography.css` | Heading classes (`heading-4xl`--`heading-h6`), body text classes (`body-3xl`--`body-xs`) |
| `tailwind/tailwind.elements.css`   | Atomic UI: `icons`, `links`, `btn`, `field`, `badge`, `close-button`, `focus-ring` |
| `tailwind/tailwind.components.css` | Reusable composite patterns (2+ consumers): `.dropdown`, `.dialog`, `.toast`, `.rte`, `.tab-control`, `.inline-submit-field`, `.localization-switcher`, `.quantity-selector`, `.pagination` — emitted into `@layer components` |
| `tailwind/tailwind.snippets.css`   | Section/snippet-scoped styles (1 consumer family): `.product-info-blocks`, `.product-card`, `.product-gallery`, `.flip-digit`, `.active-filters` — emitted into `@layer snippets` |
| `tailwind/tailwind.utilities.css`  | Narrow layout helpers and cross-cutting aids: `container-page`, `place-*`, `bg-scheme-surface`, `surface-*`, z-index layers |
| `tailwind/tailwind.animates.css`   | Motion capability layer: tokens, keyframes, transition/animation classes, motion phase classes, element-level utilities, reduced-motion kill rules |

### Cascade Layer Ordering

`tailwind.input.css` declares an explicit layer ordering before the Tailwind import:

```css
@layer theme, base, components, snippets, utilities;
```

This ensures snippet-scoped styles (`@layer snippets`) always win over reusable components (`@layer components`) when specificity is equal, while utilities still override both. The ordering is:

1. `theme` — Tailwind design tokens
2. `base` — resets, vendor defaults, native element styles
3. `components` — reusable composite patterns
4. `snippets` — section/snippet-scoped overrides
5. `utilities` — Tailwind utility classes (highest priority)

Do not add new layers without updating this declaration. If a new layer is needed, insert it at the narrowest position that satisfies its override requirements.

When adding new CSS:

- Typography utility -> `tailwind.typography.css` (`@layer` not needed — Tailwind handles typography)
- Atomic design primitive -> `tailwind.elements.css` (`@utility` declarations)
- Composite multi-element pattern -> `tailwind.components.css` (`@layer components`)
- Snippet-scoped style -> `tailwind.snippets.css` (`@layer snippets`)
- Narrow layout, placement, or cross-layer helper -> `tailwind.utilities.css` (`@utility` or `@layer utilities`)
- Animation/transition -> `tailwind.animates.css` (`@theme` / `@utility`)

Before adding reusable CSS, classify the owner layer. Do not add reusable component styles to section `{% stylesheet %}` blocks.

Section `{% stylesheet %}` blocks are allowed only for section-specific CSS that Tailwind cannot express cleanly. They MUST NOT contain reusable component styles, typography systems, color systems, or motion recipes.

### Layer Ownership Protocol

Each `tailwind/*.css` file owns a distinct responsibility. Use the decision table below to classify new or relocated CSS. When in doubt, prefer the narrower layer — promoting to a broader layer is easier than demoting.

| Layer | File | CSS Layer | Belongs here when | Does NOT belong here when |
| --- | --- | --- | --- | --- |
| **Elements** | `tailwind.elements.css` | (utility declarations) | Single-element atomic primitive (`btn`, `field`, `badge`, `icons`, `links`, `close-button`, `focus-ring`). No child selectors, no layout composition. | Multi-element composition, section-scoped variant, snippet-only override. |
| **Components** | `tailwind.components.css` | `@layer components` | Reusable composite pattern consumed by 2+ sections or snippets (`dropdown`, `dialog`, `toast`, `rte`, `tab-control`, `inline-submit-field`, `localization-switcher`, `quantity-selector`, `pagination`). | Pattern consumed by exactly one section (that is snippet-scoped). Section-specific overrides that target a single section's root class. |
| **Snippets** | `tailwind.snippets.css` | `@layer snippets` | Styles scoped to one section or one snippet family (`product-info-blocks`, `product-card`, `product-gallery`, `flip-digit`, `active-filters`). Includes context variants (e.g. `product-info-blocks--product`). | Generic reusable pattern that happens to be used inside a snippet. If 2+ unrelated consumers exist, it belongs in components. |
| **Utilities** | `tailwind.utilities.css` | (utility declarations / `@layer utilities`) | Narrow layout helpers, placement primitives, z-index layers, cross-cutting single-property aids (`container-page`, `place-*`, `bg-scheme-surface`). | Multi-element component, anything with child selectors or state pseudo-classes beyond hover/focus. |
| **Typography** | `tailwind.typography.css` | (utility declarations) | Font-size tier classes (`heading-*`, `body-*`). | Color, spacing, layout, or component-level type overrides. |
| **Animates** | `tailwind.animates.css` | `@theme` / utility declarations | Motion tokens, keyframes, transition/animation classes, motion phase classes, reduced-motion kill rules. | Static layout or color. |

#### Decision flow

```
1. Is it a single-element atomic primitive with no composition?  → elements
2. Is it a font-size tier?                                       → typography
3. Is it a motion/animation token or class?                      → animates
4. Is it a narrow layout helper or cross-cutting aid?            → utilities
5. Is it consumed by 2+ unrelated sections or snippet families?  → components
6. Is it scoped to exactly one section or snippet family?        → snippets
```

#### Promotion and demotion rules

- **Snippet → Components**: Move when a second, unrelated consumer appears. Verify all Liquid consumers with `rg` before moving. Update this doc's table if the component gains a stable name.
- **Components → Snippet**: Move when audit confirms only one section consumes it and no other consumer is planned. Prefer keeping in components if the pattern is likely to be reused (e.g. `quantity-selector` on cart + product + featured-product).
- **Section `{% stylesheet %}` → Snippet/Components**: Move when the style is reusable. Section blocks are only for one-off layout that Tailwind cannot express.
- Never move styles during a visual redesign or feature branch. Layer moves are isolated cleanup tasks.

#### Common misplacement signals

- A snippet-scoped class (e.g. `.product-info-blocks__*`) inside `tailwind.components.css` → move to snippets.
- A generic reusable pattern (e.g. `.quantity-selector`) inside `tailwind.snippets.css` → move to components.
- A section-specific override (e.g. `.newsletter-banner-section .inline-submit-field__input`) inside `tailwind.components.css` → **does not belong** in the components layer. Migrate to the owning section's `{% stylesheet %}`, a `snippets.css` owner/modifier, or track as Phase 3 backlog (`css-architecture.md` §六 P2). Never leave section-root scoping in `components.css`, with or without a comment.
- An atomic primitive with child selectors or layout composition → split: primitive stays in elements, composition moves to components.

## Breakpoints

| Token | Value   | Prefix                                       |
| ----- | ------- | -------------------------------------------- |
| `pc`  | `48rem` | `pc:` for desktop, `max-pc:` for mobile-only |
| `fw`  | `80rem` | `fw:` for full-width                         |

## Token Flow

Full chain, bridge mapping table, and unbridged variable policy: [`css-architecture.md`](css-architecture.md) §一–§三.

```text
Shopify Settings -> snippets/css-variables.liquid -> CSS custom properties
    -> tailwind/tailwind.input.css (@theme inline) -> Tailwind tokens
    -> layered tailwind/*.css + base.css -> utility classes in templates
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
| `heading-size-custom` | `heading-base` + local `--heading-size-custom` | One-off heading-stack sizes when fixed tiers do not fit |
| `body-size-custom` | `body-base` + local `--body-size-custom` | One-off body-stack sizes when fixed tiers do not fit |

### Source Of Truth

- Typography utility definitions come from `tailwind/tailwind.typography.css`.
- Liquid templates MUST use project typography tiers (`heading-4xl`-`heading-xl`, `heading-h1`-`heading-h6`, `body-3xl`-`body-xs`) instead of arbitrary Tailwind text-size utilities.
- `heading-base` and `body-base` are foundation utilities for CSS source only. They MUST NOT be used in Liquid templates (lint-enforced).

### CSS Inheritance

- `base.css` owns native element defaults.
- `tailwind/tailwind.typography.css` owns reusable typography tiers.
- Body text SHOULD inherit from `body` by default.
- Only add a typography utility when the intended tier differs from the inherited body default or native heading default.

### Typography Consumption Matrix

Quick agent reference. Use this matrix before adding or changing typography classes in Liquid.

| Role | Pattern | Scope | Notes |
| --- | --- | --- | --- |
| **display heading** | `h1`–`h6` + `heading-4xl` / `heading-3xl` / `heading-2xl` / `heading-xl` | Marketing / hero visual titles | Large display scale; not the default for ordinary page outline |
| **semantic heading** | `h1`–`h6` without tier class | Page outline, content hierarchy | Relies on `base.css` native heading defaults |
| **heading-h1-h6** | `heading-h1`–`heading-h6` on heading elements | Explicit standard semantic visual tier | Use when native `base.css` scale is wrong but outline stays semantic |
| **component-owned heading** | Component/snippet CSS in `tailwind.components.css` or `tailwind.snippets.css` | Fixed internal titles (cards, dialogs, product blocks) | Prefer the component owner over ad-hoc tier classes in Liquid |
| **rte heading** | `.rte h1`–`.rte h6` mapping in component CSS | Rich text / merchant HTML content | Independent from page outline; do not mirror page heading tiers |
| **body default** | No body tier class; inherit `body` | Ordinary paragraph and list copy | Default path — do not add `body-md` merely to restate default |
| **explicit body tier** | `body-lg`, `body-sm`, `body-xl`, `body-xs`, `body-md` | Deviations from inherited body default | Add only when size intentionally differs, responds across breakpoints, carries opacity/semantic text role, or styles form controls |
| **foundation tiers** | `heading-base`, `body-base` | `tailwind.typography.css` internal only | Liquid forbidden; lint-enforced |
| **custom size** | `heading-size-custom`, `body-size-custom` + local CSS variables | One-off sizes between or beyond fixed tiers | `heading-base` / `body-base` font logic; **font-size only** via variables; do not add `body-8xl` or `text-[...]` |

### Custom size utilities

Controlled escape hatch when no fixed `heading-*` or `body-*` tier fits. Defined in `tailwind/tailwind.typography.css`.

| Utility | Base stack | Overrides |
| --- | --- | --- |
| `heading-size-custom` | `heading-base` (family, weight, letter-spacing, text-transform, line-height, heading foreground) | `font-size` only |
| `body-size-custom` | `body-base` (family, weight, letter-spacing, text-transform, line-height, body foreground) | `font-size` only |

**CSS variables** (set on the element or an ancestor):

| Variable | Purpose |
| --- | --- |
| `--heading-size-custom` | Mobile / default heading custom `font-size` |
| `--heading-size-custom-pc` | Desktop heading size; falls back to `--heading-size-custom` when unset |
| `--body-size-custom` | Mobile / default body custom `font-size` |
| `--body-size-custom-pc` | Desktop body size; falls back to `--body-size-custom` when unset |

Pass a **complete `font-size` value**, including merchant scale when appropriate:

```html
style="--heading-size-custom: calc(var(--font-heading-scale) * 5rem);
       --heading-size-custom-pc: calc(var(--font-heading-scale) * 6.5rem);"
```

Rules:

- Custom size changes **only** `font-size`. It does not replace font family, weight, letter-spacing, text-transform, or line-height (no custom line-height variables in v1).
- Prefer an existing fixed tier first. Do not add unbounded new tiers such as `body-4xl` / `body-8xl` for small deltas.
- Do not use Tailwind `text-[...]` or arbitrary text-size utilities to bypass the typography system.
- `heading-base` and `body-base` remain foundation-only (Liquid forbidden). `heading-size-custom` and `body-size-custom` are allowed in Liquid when paired with the matching variables.

**Pilot candidates** (not migrated in v1; apply in dedicated follow-up):

- `sections/about-stats.liquid` — stat value display size
- `sections/scroll-categories.liquid` — product list title
- `sections/slides-show.liquid` — slide headline when between display tiers
- `sections/icon-with-text.liquid` — block title (`body-xl` today)

### Typography decision flow

```
1. Is it a hero / display marketing title?
   → h1–h6 + heading-4xl / heading-3xl / heading-2xl / heading-xl

2. Is it an ordinary semantic page heading?
   → Prefer h1–h6 alone; rely on base.css defaults

3. Does it need an explicit standard heading size tier?
   → heading-h1–heading-h6 on the matching heading element

4. Is it a fixed title inside a reusable component?
   → Prefer the component/snippet CSS owner in tailwind.components.css or tailwind.snippets.css

5. Is it rich text content inside .rte?
   → Let .rte own heading mapping; do not treat as page outline

6. Is it ordinary body copy?
   → Inherit body; do not add body-md

7. Does copy deviate from inherited body default, change responsively, need opacity/semantic text treatment, or style a form control?
   → Add body-lg / body-sm / body-xl / body-xs (or body-md when that tier is explicitly required)

8. Does size need to differ from every fixed tier, without adding a new global tier?
   → heading-size-custom or body-size-custom + --*-size-custom variables (full font-size expression; optional -pc)
```

### Body typography

1. Default body copy inherits from `body`. Do not add `body-md` unless the intended tier explicitly differs from that default.
2. `body` and `body-md` are aligned in CSS so broad `body-md` deduplication is possible; that cleanup is **deferred P2** — do not batch-remove `body-md` during unrelated work.
3. Use `body-sm`, `body-lg`, `body-xl`, and `body-xs` only when intentionally different from default.

### Typography consumption audit status (2026-06-23)

Completed typography consumption audit in theme Liquid:

- No Liquid Tailwind `text-*` size bypass on heading elements (existing lint: heading elements must use heading tiers).
- No Liquid `heading-base` or `body-base` consumption (lint-enforced).
- `body` and `body-md` share aligned CSS values — deduplication prerequisite met.

#### Lint enforcement

`npm run lint:theme` (`.agents/skills/check-theme-architecture/scripts/lint-theme.js`) enforces typography consumption protocol:

| Rule | Scope | Behavior |
| --- | --- | --- |
| No `heading-base` in Liquid | all Liquid (`layout/`, `sections/`, `snippets/`) | Error — foundation utility for CSS only; use heading-* tiers or native headings. |
| No `body-base` in Liquid | all Liquid (`layout/`, `sections/`, `snippets/`) | Error — foundation utility for CSS only; use body-* tiers or inherit body. |
| No Tailwind text-size on `h1`–`h6` | all Liquid | Error — use heading tiers (pre-existing). |
| No heading class on non-heading elements | all Liquid | Error — pre-existing; manual review for edge cases. |

Lint exemptions (intentionally conservative):

- `body-md` redundancy — not lint-automated; dedup is deferred P2 to avoid false positives.
- Heading semantic/visual mismatch (e.g. `h2` + `heading-h1`, sub-heading element choice) — manual review only.
- Component-owned typography inside `tailwind.components.css` / `tailwind.snippets.css` — CSS layer ownership, not Liquid lint scope.

Validation at protocol completion: `npm run lint` passed.

#### Manual review required (not lint-automated)

These patterns need human judgment during future typography work:

- **`body-md` deduplication (P2)** — remove redundant `body-md` only in a dedicated cleanup pass after spot-checking inherited contexts.
- **`sections/cart.liquid` `h2` + `heading-h1`** — semantic level vs visual tier mismatch; fix only when cart typography is explicitly scoped.
- **Sub-heading element mix** — non-heading elements carrying sub-heading visual roles; preserve until a dedicated sub-heading protocol pass.
- **Display heading scale consistency** — hero/marketing titles using `heading-4xl`–`heading-xl`; unify only during visual/hero work, not drive-by refactors.


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
- Section gradients are explicit main-surface behavior. Section roots that need the
  merchant gradient use `surface-section` (semantic alias for `bg-scheme-surface`).
  Do not apply gradient or component-surface utilities to media backgrounds,
  transparent overlays, cards, dialogs, dropdowns, or chrome merely because they
  have a color scheme.
- Add an explicit background only when an element owns an independent visual surface,
  such as a panel, card, dropdown, drawer, modal, or intentionally layered region.
- A component rendered outside its original section or moved into an overlay MUST
  establish or receive the intended color scheme when inherited variables are no
  longer reliable.
- Icons rendered through the `icons` snippet follow `currentColor`. Their consumer
  owns color unless the icon is part of a component with a distinct semantic color
  contract.

### Surface Consumption Protocol

Every visible surface in the theme falls into one of the roles below. Each role is
a class pattern that may combine several classes, but a single element should carry
only one surface role — do not layer multiple roles on the same node.

#### Surface Consumption Matrix

Quick agent reference. Use this matrix before adding or changing surface classes.

| Role | Class pattern | Scope | Notes |
| --- | --- | --- | --- |
| **section-root-gradient** | `color-* surface-section` | `sections/*.liquid` section root only | Merchant gradient via `--gradient-background`. Preferred over `bg-scheme-surface`. |
| **section-root-flat** | `color-*` only | `sections/*.liquid` section root | Flat scheme background from `css-variables.liquid`. No gradient layer. |
| **overlay-surface** | `color-{id} surface-component` | Snippets for dialog, drawer, dropdown, modal | Overlay escapes parent section DOM; must establish its own scheme scope. |
| **component-surface** | `surface-component` (preferred) or bare `bg-theme-bg` when context already owns foreground | Cards, panels, popovers, independent regions | Prefer `surface-component` over manual `bg-theme-bg text-theme-text`. |
| **inverted-surface** | `surface-inverted` | Active states, primary button labels, pagination | Swaps foreground/background intentionally. |
| **local-effect / media-frame** | `bg-theme-bg/opacity` (+ optional `text-theme-text`) | Play buttons, scrims, skeletons, loading overlays | Opacity variants (`/80`, `/60`, `/50`, `/20`) are local effects — do not migrate to `surface-component`. |
| **inherited-text-only** | `text-theme-text` or `text-theme-text/opacity` | Descendants inside an established scheme | Foreground restatement, not a surface. Do not pair with `bg-theme-bg` unless the element owns an independent surface. |

| Role | Class pattern | When to use |
| --- | --- | --- |
| **Scheme scope** | `color-{{ scheme }}` | Establishes the CSS custom property cascade for descendants and applies a flat `background-color: rgb(var(--color-background))` via `css-variables.liquid`. This is the base treatment for section roots that do not need a gradient. |
| **Section main surface** | `color-{{ scheme }} surface-section` | Section root that should also show the merchant-configured gradient background (`--gradient-background`). The `surface-section` utility layers the gradient on top of the flat background that `color-*` already provides. Only for section-owned primary surfaces. |
| **Component surface** | `surface-component` | Independent visual surface owned by a component (card, panel, popover content area). Sets `background-color` and `color` from the active scheme tokens. Does not consume gradient. |
| **Overlay surface** | `color-{id} surface-component` | Dialog, drawer, dropdown, or modal that establishes its own color scheme because it renders outside the parent section's DOM scope. The explicit `surface-component` ensures the overlay is legible even when inherited variables are unreliable. |
| **Inverted surface** | `surface-inverted` | Element that intentionally swaps foreground/background (active pagination, primary button label). |

#### Surface helper utilities

Defined in `tailwind.utilities.css`:

| Utility | Equivalent | Notes |
| --- | --- | --- |
| `surface-section` | `bg-scheme-surface` | Preferred semantic alias for section gradient surfaces. `bg-scheme-surface` remains in CSS for backward compatibility but MUST NOT appear in `sections/*.liquid` (lint-enforced). |
| `surface-component` | `bg-theme-bg text-theme-text` | Component/overlay surface with explicit foreground and background. |
| `surface-inverted` | `bg-theme-text text-theme-bg` | Inverted surface — swaps foreground and background. |

#### Preferred patterns

```
section root (gradient):  color-{{ scheme }} surface-section
flat section root:        color-{{ scheme }}
component surface:        surface-component
overlay with own scheme:  color-{id} surface-component
inverted surface:         surface-inverted
local effect / frame:     bg-theme-bg/80 text-theme-text   (do not migrate)
inherited foreground:     text-theme-text or text-theme-text/60  (not a surface)
```

Rules:

- `color-*` always renders a flat background. `surface-section` is an additional gradient layer — use it only on section main surfaces. Never apply it to cards, dialogs, dropdowns, overlays, or chrome.
- `bg-theme-bg` is for component/overlay surfaces. Do not use it to restate a section's background.
- Overlays (dialog, drawer, dropdown) that escape the parent section's DOM MUST establish their own `color-{id}` scope plus `surface-component`.
- Text and icons inherit `color` from the active scheme. Do not add `text-theme-text` to every descendant; add it only at scheme-scope or overlay-scope boundaries.
- `text-theme-fg` is NOT a defined utility. Use `text-theme-text` for explicit foreground color (lint-enforced).

#### Migration status (2026-06-23)

Completed surface semantic migration in theme Liquid:

- `sections/*.liquid` `bg-scheme-surface` count: **0** (all section gradient roots use `surface-section`).
- Section root gradient pattern is unified: `color-{{ section.settings.color_scheme }} surface-section`.
- Overlay snippets already on `color-{id} surface-component` where scheme scope is required (e.g. `ui-dialog`, header dropdown panels).

#### Lint enforcement

`npm run lint:theme` (`.agents/skills/check-theme-architecture/scripts/lint-theme.js`) enforces surface consumption protocol:

| Rule | Scope | Behavior |
| --- | --- | --- |
| No `bg-scheme-surface` in sections | `sections/**/*.liquid` | Error — use `surface-section`. |
| No manual overlay surface combo | `snippets/**/*.liquid` | Error when `class` or `assign` string contains `color-{{` + bare `bg-theme-bg` + `text-theme-text` together — use `surface-component`. |
| No `text-theme-fg` | all Liquid (`layout/`, `sections/`, `snippets/`) | Error — use `text-theme-text`. |

Lint exemptions (intentionally conservative):

- `bg-theme-bg/80`, `/60`, `/50`, `/20` — treated as local effects, not flagged.
- `bg-theme-bg text-theme-text` without `color-{{` in the same string — not flagged; requires manual review.
- `color-{{` with `text-theme-text` only (no bare `bg-theme-bg`) — not flagged; inheritance may be sufficient.

Validation at migration completion: `npm run lint` passed.

#### Manual review required (not lint-automated)

These patterns need human judgment during future surface work:

- **`snippets/product-variant-picker.liquid` option `class="bg-theme-bg text-theme-text"`** — native `<option>` styling inside an inherited scheme; kept as-is pending platform/contrast review. Do not auto-migrate to `surface-component`.
- **`bg-theme-bg/opacity` on media controls** — play/mute buttons, gallery overlays, loading scrims. These are local effects, not component surfaces.
- **Snippet surfaces without `color-{{` scope** — e.g. filters, search panels, product cards inside a section. Review whether the element inherits the section scheme or owns an independent surface before adding `surface-component` or `bg-theme-bg`.

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
- `@layer components` styles override `@layer base`; `@layer snippets` styles override `@layer components`; utilities override both. Use the narrowest layer that satisfies the override requirement.

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
