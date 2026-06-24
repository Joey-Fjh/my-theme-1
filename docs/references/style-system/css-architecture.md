# CSS Architecture Contract

This document is the **layer ownership and token-flow contract** for the theme style system. `AGENTS.md` remains the rule source. Read this file when auditing CSS placement, token sources, bridge gaps, or planning layer migrations.

**Companion references (no conflict — narrower scope wins):**

| Topic | Document |
| --- | --- |
| Typography tiers, surface matrix, color consumption, icons | [`css-and-typography.md`](css-and-typography.md) |
| Motion ownership, reveal contract, GSAP policy | [`../architecture/motion-architecture.md`](../architecture/motion-architecture.md) |
| Abstraction boundaries | [`../architecture/abstraction-boundaries.md`](../architecture/abstraction-boundaries.md) |

---

## 一、架构链条

### 1.1 Theme pipeline (this repository)

```text
Shopify theme settings (config/settings_schema.json)
        │
        ▼
snippets/css-variables.liquid          ← Token Source (runtime CSS custom properties)
        │   {% style %} on every layout that renders it
        ▼
tailwind/tailwind.input.css            ← Entry + Bridge (@theme inline + @import chain)
        │   npm run build:tw → assets/tailwind.output.css
        ▼
Layered CSS sources (import order matters)
        │   base → typography → elements → components → snippets → utilities → animates
        ▼
Liquid class consumption               ← sections / snippets / layout markup
        │
        ▼
Lint governance                        ← npm run lint:theme (partial coverage today)
```

**Cascade layer order** (declared in `tailwind.input.css` before the Tailwind import):

```text
theme → base → components → snippets → utilities
```

`@layer snippets` sits between `components` and `utilities`, so snippet-scoped rules beat reusable components at equal specificity; Tailwind utilities still win last.

### 1.2 Responsibility of each link

| Link | Owner file | Responsibility |
| --- | --- | --- |
| **数据源** | `snippets/css-variables.liquid` | Map merchant settings → CSS variables; font-face; per-scheme RGB triplets; `:root` globals |
| **桥接** | `tailwind/tailwind.input.css` `@theme inline` | Map selected CSS variables → Tailwind design tokens (`bg-theme-bg`, `text-theme-text`, breakpoints, z-index) |
| **入口** | `tailwind/tailwind.input.css` | Layer declaration, `@import 'tailwindcss'`, ordered imports of all layer files |
| **分层** | `assets/base.css`, `tailwind/tailwind.*.css` | Classify reusable CSS by ownership (see §四) |
| **消费治理** | Liquid templates + `lint-theme.js` | Enforce consumption protocols; layer-placement lint is Phase 6 |

### 1.3 Portable model (non-Shopify projects)

The same chain applies outside Shopify. Only the **token source** adapter changes:

| Environment | Token source equivalent |
| --- | --- |
| This theme | `snippets/css-variables.liquid` |
| Design tokens repo | `tokens/*.json` → build step → CSS variables |
| CSS-in-JS / runtime theme | Theme provider injecting variables on `:root` |
| Static design system | Published token package imported into `@theme` |

Bridge, entry, layers, and consumption governance stay the same. Replace the Liquid snippet; do not replace the layer model without an explicit architecture decision.

---

## 二、Token Source Contract

**Source of truth:** `snippets/css-variables.liquid`  
**Rendered from:** `layout/theme.liquid`, `layout/password.liquid`, `templates/gift_card.liquid`

All global runtime variables are emitted inside `{% style %}`. Nothing in `tailwind/*.css` should redefine merchant-owned values.

### 2.1 Variable groups

#### Scheme / color (per `settings.color_schemes`)

Emitted on `:root` (first scheme) and `.color-{{ scheme.id }}`:

| CSS variable | Setting source | Format | Notes |
| --- | --- | --- | --- |
| `--color-background` | `background_color` | RGB triplet | Used with `rgb(var(--color-background))` |
| `--gradient-background` | `background_gradient_color` or flat background | Full CSS color/gradient | Consumed by `surface-section` / `bg-scheme-surface` |
| `--color-foreground` | `text_color` | RGB triplet | |
| `--color-border` | `border_color` | RGB triplet | |
| `--color-focus-ring` | `focus_ring_color` | RGB triplet | |
| `--color-input-text` | `input_text_color` | RGB triplet | |
| `--color-input-background` | `input_background_color` | RGB triplet | |
| `--color-input-border` | `input_border_color` | RGB triplet | |
| `--color-input-placeholder` | `input_placeholder_color` | RGB triplet | |
| `--color-primary-button` | `primary_button_background_color` | RGB triplet | |
| `--color-primary-button-text` | `primary_button_label_color` | RGB triplet | |
| `--color-primary-button-border` | `primary_button_border_color` | RGB triplet | |
| `--color-secondary-button` | `secondary_button_background_color` | RGB triplet | |
| `--color-secondary-button-text` | `secondary_button_label_color` | RGB triplet | |
| `--color-secondary-button-border` | `secondary_button_border_color` | RGB triplet | |
| `--color-badge-background` | `badge_background_color` | RGB triplet | |
| `--color-badge-foreground` | `badge_label_color` | RGB triplet | |
| `--color-badge-border` | `badge_border_color` | RGB triplet | |
| `--color-success-background` | `success_background_color` | RGB triplet | |
| `--color-success-foreground` | `success_foreground_color` | RGB triplet | |
| `--color-warning-background` | `warning_background_color` | RGB triplet | |
| `--color-warning-foreground` | `warning_foreground_color` | RGB triplet | |
| `--color-error-background` | `error_background_color` | RGB triplet | |
| `--color-error-foreground` | `error_foreground_color` | RGB triplet | |
| `--color-info-background` | `info_background_color` | RGB triplet | |
| `--color-info-foreground` | `info_foreground_color` | RGB triplet | |

**Side effect:** `body, .color-* { color; background-color }` applies default flat scheme colors. Section gradient is a separate utility layer (`surface-section`), not automatic on every `color-*` node.

#### Layout (`:root`)

| CSS variable | Setting | Notes |
| --- | --- | --- |
| `--announcement-bar-height` | runtime `0px` | Updated by JS |
| `--header-height` | runtime `0px` | Updated by JS |
| `--page-width` | `page_width` | rem |
| `--page-margin` | `page_margin` | rem |
| `--section-margin-top` | `section_margin_top` | px |
| `--section-margin-bottom` | `section_margin_bottom` | px |

Section padding uses per-section `--section-padding-top` / `--section-padding-bottom` injected via inline `style` on section roots (not in css-variables).

#### Typography (`:root`)

| CSS variable | Setting |
| --- | --- |
| `--font-body-family`, `--font-body-style`, `--font-body-weight`, `--font-body-line-height`, `--font-body-letter-spacing`, `--font-body-text-transform`, `--font-body-scale` | body font settings |
| `--font-heading-family`, `--font-heading-style`, `--font-heading-weight`, `--font-heading-line-height`, `--font-heading-letter-spacing`, `--font-heading-text-transform`, `--font-heading-scale` | heading font settings |

Custom font URLs emit `@font-face` blocks in the same snippet when enabled.

#### Control chrome (`:root`)

| Group | Variables |
| --- | --- |
| Input | `--input-radius`, `--input-border-width`, `--input-padding-x/y`, `--input-shadow-*` |
| Button | `--button-padding-x/y`, `--button-radius`, `--button-border-width`, `--button-shadow-*` |
| Dialog | `--dialog-border-width`, `--dialog-radius`, `--dialog-shadow-*` |
| Product card | `--product-card-border-width`, `--product-card-radius`, `--product-card-shadow-*` |
| Toast | `--toast-radius`, `--toast-shadow-*` |

These are consumed directly in `tailwind.elements.css` / `tailwind.components.css` / `tailwind.snippets.css` via `var(--button-radius)` etc. They are **not** bridged into `@theme` today.

#### Motion (`:root`)

| CSS variable | Source |
| --- | --- |
| `--motion-duration` | `settings.motion_speed` case (`slow` / default / `fast`) |
| `--motion-duration-fast` | same case |
| `--motion-duration-base` | same case |
| `--motion-duration-slow` | same case |
| `--motion-ease` | static `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--motion-ease-default` | alias: `var(--motion-ease)` (since Phase 2) |
| `--motion-ease-enter` | static (same as ease) |
| `--motion-ease-exit` | static `cubic-bezier(0.55, 0, 1, 0.45)` |
| `--motion-reveal-distance` | static `1.5rem` |
| `--motion-reveal-stagger` | static `80ms` |

**Phase 2 note:** `--motion-ease-default` aliases `--motion-ease` in `css-variables.liquid`. Primary interactive paths in elements, components, and snippets consume motion duration/ease vars directly.

**Remaining governance (not token-source gaps):** low-priority cases such as decorative `animates.css` keyframes, a few elements without explicit motion vars, and any Liquid `duration-*` utility bypass — tracked in §5.2 remaining and Phase 6 lint candidates.

Body motion mode is also set in `layout/theme.liquid`: `data-motion-enabled`, `data-content-reveal-style`, `data-media-reveal-style` (see `motion-architecture.md`).

#### Focus (`:root`)

| CSS variable | Setting |
| --- | --- |
| `--focus-ring-width` | `focus_ring_width` (default 2px) |
| `--focus-ring-offset` | `focus_ring_offset` (default 2px) |

Per-scheme `--color-focus-ring` lives in scheme blocks.

### 2.2 Global vs local (snippet) variables

| Kind | Where defined | Bridge to `@theme`? | Example |
| --- | --- | --- | --- |
| **Global token** | `css-variables.liquid` `:root` or `.color-*` | Sometimes (colors, z-index) | `--color-background`, `--button-radius` |
| **Section-local** | inline `style` on section root | No | `--section-padding-top` |
| **Snippet-local** | inline `style` on snippet root element | No | `--pagination-font-size`, `--pagination-radius` |
| **Block-local** | inline `style` from block settings | No | `--product-callout-bg`, `--product-spacer-top` |
| **Static theme token** | `tailwind.input.css` `@theme` only | N/A (source is CSS, not Liquid) | `--color-dialog-overlay`, `--z-layer-modal` |

#### Registered snippet-local variables (non-exhaustive — extend when adding new patterns)

| Variable(s) | Injected by | Consumed in |
| --- | --- | --- |
| `--pagination-font-size`, `--pagination-radius` | `snippets/pagination.liquid` | `tailwind.components.css` `.pagination__*` |
| `--product-callout-bg`, `--product-callout-text` | `snippets/product-info-blocks.liquid` | `tailwind.snippets.css` |
| `--product-spacer-top`, `--product-spacer-bottom` | `snippets/product-info-blocks.liquid` | `tailwind.snippets.css` |
| `--product-collapsible-image-width` | `snippets/product-info-blocks.liquid` | `tailwind.snippets.css` |
| `--product-block-icon-size` | `snippets/product-block-icon.liquid` | `tailwind.snippets.css` |
| `--pc-media-ratio` | `snippets/product-card.liquid` | `tailwind.snippets.css` |
| `--icon-with-text-icon-size`, `--icon-with-text-icon-size-mobile`, `--icon-with-text-gap` | `snippets/icon-with-text-item.liquid` | `tailwind.components.css` (`.icon-with-text-item*`, Phase 5D-1) |
| `--thumbnail-visible-count` | `snippets/product-gallery-thumbnails.liquid` | snippet/section CSS consumers |
| `--aspect-ratio` | `snippets/image.liquid`, `snippets/media-video.liquid` | layout/media consumers |
| `--badge-size-pc`, `--badge-size-mb` | `snippets/rotating-badge.liquid` | snippet consumers |
| `--super-menu-primary-width`, etc. | `snippets/header-dropdown-super-menu.liquid` | header snippet layout |
| `--i` | `snippets/social-icons.liquid` | stagger index for icon animation |

**Rule:** Snippet-local variables are valid when (1) the value is dynamic per render, (2) only one CSS owner consumes them, and (3) they are registered in this table when the pattern stabilizes. Do not promote to `:root` unless multiple unrelated consumers share the same semantic meaning.

---

## 三、Bridge Contract

**Bridge file:** `tailwind/tailwind.input.css` → `@theme inline { ... }`

Purpose: expose selected CSS variables as Tailwind utilities (`bg-theme-bg`, `pc:`, `z-layer-modal`, etc.).

### 3.1 Mapping table

| CSS var source | Tailwind token | Consumption | Bridged? | If not bridged — why |
| --- | --- | --- | --- | --- |
| `--font-heading-family` | `--font-heading` | `font-heading` utility | Yes | |
| `--font-body-family` | `--font-body` | `font-body` utility | Yes | |
| (static) | `--breakpoint-pc: 48rem` | `pc:`, `max-pc:` | Yes | Breakpoints are build-time theme tokens |
| (static) | `--breakpoint-fw: 80rem` | `fw:` | Yes | |
| `--color-background` | `--color-theme-bg` | `bg-theme-bg`, opacity variants | Yes | RGB via `rgb(var(--color-background))` |
| `--color-foreground` | `--color-theme-text`, `--color-theme-text-80` | `text-theme-text`, etc. | Yes | |
| `--color-border` | `--color-theme-border`, `-80`, `-50`, `-20` | border utilities | Yes | |
| `--color-focus-ring` | `--color-focus-80`, `-50`, `-20` | focus tints | Yes | |
| (static) | `--color-dialog-overlay` | overlay backgrounds | Yes | Fixed `rgba(0,0,0,0.45)` — not merchant setting |
| `--color-input-*` | `--color-field`, `--color-field-text`, etc. | `bg-field`, `text-field-text` | Yes | |
| `--color-primary-button*` | `--color-primary`, `--color-primary-text`, `--color-primary-border` | `btn-primary` stack | Yes | |
| `--color-secondary-button*` | `--color-secondary`, etc. | `btn-secondary` | Yes | |
| `--color-badge-*` | `--color-badge`, `--color-badge-text`, `--color-badge-bdr` | `badge` | Yes | |
| `--color-success-*` etc. | `--color-success`, `--color-warning`, … | toast / feedback | Yes | |
| (static) | `--z-layer-dropdown` … `--z-layer-toast` | `z-layer-*` classes in utilities | Yes | Semantic stacking; also duplicated as utility classes |
| `--button-padding-x`, `--button-radius`, … | — | `var(--button-*)` in elements | **No** | Component geometry; direct `var()` is intentional |
| `--input-*`, `--dialog-*`, `--product-card-*`, `--toast-*` | — | direct `var()` in layer CSS | **No** | Same reason |
| `--page-width`, `--page-margin` | — | `container-page`, `.shopify-section` grid | **No** | Layout primitives use raw vars |
| `--motion-duration-*`, `--motion-ease*` | — | transitions in elements/snippets/components/animates | **No** | Not bridged; consumed directly via CSS vars by motion/components/snippets layers |
| `--motion-ease-default` | — | elements, snippets, components | **No** | Defined alias in token source (`var(--motion-ease)`); direct `var()` consumption — not a `@theme` utility |
| `--focus-ring-width`, `--focus-ring-offset` | — | `focus-ring`, `btn`, `field` | **No** | Direct var consumption |
| Snippet-local vars | — | owner CSS only | **No** | Scoped to one render tree |

### 3.2 Entry import order

```text
@layer theme, base, components, snippets, utilities;
@import 'tailwindcss';
@theme inline { ... }
@import vendor-swiper → layer(base)
@import base.css → layer(base)
@import typography → elements → components → snippets → utilities → animates
```

`tailwind.animates.css` is imported **after** utilities in the entry file. Reveal kill rules and body `[data-*]` selectors rely on specificity and source order; do not reorder without reviewing `motion-architecture.md`.

### 3.3 Build output

- Command: `npm run build:tw`
- Output: `assets/tailwind.output.css` — never edit manually
- Phase 1 does not require rebuild (docs only)

---

## 四、Layer Ownership

Use the decision flow in §七 before adding or moving CSS. When two layers both seem valid, prefer the **narrower** layer.

### 4.0 Consumer count thresholds (layer vs pattern)

Two different thresholds apply. They are **not** in conflict:

| Threshold | Meaning | Typical action | Phase |
| --- | --- | --- | --- |
| **2+ unrelated consumers** | Minimum **layer promotion** bar: pattern is no longer owned by one snippet/section family | Move CSS from `snippets.css` → `components.css` (or keep in components when adding a second consumer). Verify with `rg` across `sections/` and `snippets/`. | Ongoing / Phase 3–4 |
| **3+ stable repeated copies** | Minimum **pattern consolidation** bar: same structural UI repeated under different BEM prefixes | Merge copy-pasted rules into one shared component API (e.g. generic tab-nav modifiers), not merely relocate files. Lower priority than fixing misplacement. | Phase 5 |

**How to apply together (example: tab strips — pre-Phase 5A historical):**

- **Pre-Phase 5A (historical):** `blog__tab`, `collection__tab`, `search-results-tabs__tab` existed as separate full chrome blocks in `snippets.css` → **misplacement** (snippet layer used as pattern dump).
- **Phase 5A (accepted):** text tab trigger chrome consolidated to `tab-nav-item*` in `components.css`; `snippets.css` retains layout/owner deltas only; legacy BEM classes retained on markup.
- At **2+ unrelated consumers**, each variant already **qualifies** for `components.css` as separate named blocks if promotion is done early.
- At **3+ stable copies** of the same interaction (opacity + border-bottom active state, etc.), **Phase 5** consolidates them into one reusable tab-nav component API instead of three parallel class families — **done for tab triggers in Phase 5A**.
- **Pre-Phase 5B (historical):** `accordion__*` CSS lived in `snippets.css` while `snippets/accordion.liquid` already had **2+ unrelated consumers** (promise-section, cart, filters-groups) — layer misplacement until promotion.
- **Phase 5B (accepted):** `accordion__*` CSS promoted to `components.css` (layer promotion only); `snippets/accordion.liquid` remains render/API owner; Liquid classes unchanged.

**Does not change:** section-specific overrides (e.g. `.newsletter-banner-section …`) never belong in `components.css` regardless of consumer count — see §4.4 hard rule and §六 P2.

### 4.1 `assets/base.css` — base layer

| | |
| --- | --- |
| **Belongs here** | Universal reset; `html`/`body` document defaults; native `h1–h6` scale tied to `--font-heading-scale`; form control font inheritance; Shopify section grid (`.shopify-section`, `.layout`); `[x-cloak]`; structural no-JS helpers (`.no-scrollbar`) |
| **Does not belong** | Reusable component BEM; snippet-specific blocks; Tailwind tier classes; motion keyframes; merchant-configurable component chrome |
| **Promotion** | Pattern used by 2+ unrelated sections with composition → `components` |
| **Demotion** | Rare — only if mistaken for a one-off section style |
| **Example** | `body { font-size: calc(var(--font-body-scale) * 1.4rem); }` |
| **Known exception** | Native heading sizes duplicate `heading-h1–h6` tiers intentionally: semantic outline uses base; explicit tiers use typography utilities (documented in `css-and-typography.md`) |

### 4.2 `tailwind/tailwind.typography.css`

| | |
| --- | --- |
| **Belongs here** | `heading-base`, `body-base` (CSS-only foundations); `heading-4xl`–`heading-h6`, `body-3xl`–`body-xs`; `heading-size-custom` / `body-size-custom`; RTL `:lang(ar|fa|ur)` overrides |
| **Does not belong** | Color roles beyond foreground on type; layout; multi-element composition; section/snippet BEM |
| **Promotion** | Eyebrow/sub-heading tier — **`.sub-heading` migrated to typography.css (Phase 4B).** |
| **Demotion** | N/A for tiers |
| **Example** | `.heading-h2 { @apply heading-base; font-size: calc(...); }` |
| **Known exception** | `heading-base` / `body-base` forbidden in Liquid (lint). Component-internal type in `components` / `snippets` CSS is allowed as owner rules, not as Liquid classes |

**Sub-heading / eyebrow decision:** `.sub-heading` lives in `tailwind.typography.css` (Phase 4B). Consumed on `p.sub-heading` in marketing sections.

### 4.3 `tailwind/tailwind.elements.css`

| | |
| --- | --- |
| **Belongs here** | Single-element primitives: `icons`, `links`, `btn`, `field`, `badge`, `close-button`, `focus-ring`; variants that only extend the same element (`btn-primary`, `field-underline`, `badge-cart`) |
| **Does not belong** | Multi-element layout grids; child-targeting composition (except documented exceptions); section roots; snippet BEM families |
| **Promotion** | Primitive + stable 2+ consumer composition → split: primitive stays, composition → `components` |
| **Demotion** | Variant only used inside one snippet → snippet owner block (rare) |
| **Example** | `@utility btn { padding: var(--button-padding-y) var(--button-padding-x); }` |
| **Known exceptions (platform bridge whitelist)** | See §4.3.1 |

#### 4.3.1 Elements platform bridge whitelist

These are **not** generic elements; they are documented integration points. New entries require architecture review.

| Selector / block | Reason | Layer stay? |
| --- | --- | --- |
| `button.shopify-payment-button__button--unbranded` | Shopify checkout specificity override | Yes — elements |
| `button.shopify-payment-button__button--unbranded:hover:not([disabled])` | Preserve theme primary on hover | Yes |
| `shopify-accelerated-checkout { --shopify-accelerated-checkout-* }` | Official custom-property bridge to shadow DOM wallets | Yes |
| `.shopify-payment-button-wrapper` layout | Full-width payment slot | Yes |
| `links-underline` child `.icons` transform | Composition leak — Phase 5 may split to components | Yes until migrated |

### 4.4 `tailwind/tailwind.components.css` (`@layer components`)

| | |
| --- | --- |
| **Belongs here** | Composite UI with **2+ unrelated consumers**: `dropdown`, `dialog` panels, `toast`, `rte`, `tab-control`, `tab-nav-item`, `accordion`, `icon-with-text-item`, `inline-submit-field`, `localization-switcher`, `quantity-selector`, `pagination` |
| **Does not belong** | Single-snippet-only families; section root overrides (`.newsletter-banner-section .inline-submit-field__*`); atomic buttons/fields in isolation |
| **Promotion** | **2+ unrelated consumers** confirmed via `rg` → move from `snippets.css` (layer promotion only; shared API consolidation may wait for Phase 5) |
| **Demotion** | Only one consumer remains and none planned → `snippets.css` (prefer keeping in components if reuse is likely) |
| **Example** | `.quantity-selector { @apply inline-flex ... }` used on PDP, cart, featured product |
| **Known exception** | `pagination` reads **snippet-local** `--pagination-*` vars — valid hybrid: component CSS + snippet injection |

**Hard rule:** No `*-section` root scoping in this file — **zero exceptions**, including commented section constraints. Section-specific overrides belong in `sections/*.liquid` `{% stylesheet %}`, `snippets.css` with an explicit owner/modifier, or Phase 3 backlog — never in reusable `components.css`.

### 4.5 `tailwind/tailwind.snippets.css` (`@layer snippets`)

| | |
| --- | --- |
| **Belongs here** | CSS owned by **one snippet family or one business domain** with a single primary consumer path: `product-info-blocks__*`, `product-card__*`, `variant-picker__*`, `filters-field__*`, etc. |
| **Does not belong** | Generic tab/nav pattern duplicated across many sections (copy-paste variants); cross-snippet utilities; patterns that already have **2+ unrelated consumers** (those belong in `components`) |
| **Promotion** | **2+ unrelated consumers** → `components.css` (see §4.0). `accordion__*` promoted Phase 5B; single-snippet-only families stay until second consumer appears. |
| **Demotion** | From `components` when audit proves single consumer only |
| **Example** | `.variant-picker__swatch.is-selected { box-shadow: ... }` |
| **Known exception** | File remains large (~1200 lines) but is **owner-block organized** (Phase 4B). Further splits are organizational only unless a candidate promotes to `components.css`. |

**Anti-pattern:** Using this file as a "pattern dumpster" for copy-pasted tab styles (`blog__tab`, `collection__tab`, `search-results-tabs__tab`, …). Phase 4 reblocked by owner; **Phase 5A (accepted)** consolidated tab **trigger chrome** into `tab-nav-item*` in `components.css` — do not reintroduce full chrome blocks here.

### 4.6 `tailwind/tailwind.utilities.css`

| | |
| --- | --- |
| **Belongs here** | Cross-cutting layout/placement: `container-page`, `place-*`, `sup-badge`; z-index utility classes; **registered** semantic surface helpers (`surface-section`, `surface-component`, `surface-inverted`, `bg-scheme-surface` alias) |
| **Does not belong** | Multi-element components; snippet BEM; typography tiers; motion keyframes; unregistered semantic classes |
| **Promotion** | Semantic helper used with clear contract → register in `css-and-typography.md` surface matrix **and** this doc |
| **Demotion** | Misplaced semantics → correct layer (historical: `sub-heading` moved typography Phase 4B) |
| **Example** | `@utility surface-component { background-color: rgb(var(--color-background)); color: ... }` |
| **Known exception** | `place-*` are plain classes, not `@utility` — historical; new utilities should prefer `@utility` when tree-shaking matters |

### 4.7 `tailwind/tailwind.animates.css`

| | |
| --- | --- |
| **Belongs here** | `@keyframes`; motion capability utilities (`animate-spin-slow`, `icons-animate-*`); `[data-motion-reveal]` reveal CSS; `body[data-motion-enabled]` kill switches; `prefers-reduced-motion` overrides |
| **Does not belong** | Business BEM; snippet layout; ordinary hover transitions on buttons/links (primary paths use motion vars in elements/components/snippets since Phase 2) |
| **Promotion** | Interactive transition pattern copied 5+ times → optional shared capability class here (Phase 5; separate from §4.0 layer thresholds) |
| **Demotion** | N/A |
| **Example** | `body[data-content-reveal-style='fade'] [data-motion-state='pending'] [data-motion-reveal='content']` |
| **Known exception** | Does not own trigger logic — Alpine `motionRevealSection()` sets `data-motion-state` per `motion-architecture.md` |

### 4.8 Layer decision flow (quick)

```text
1. Token only?        → css-variables.liquid (or snippet-local inline var)
2. Font size tier?    → typography
3. Motion capability / reveal / keyframes? → animates
4. Single element?    → elements (check platform whitelist)
5. 2+ unrelated consumers? → components (§4.0 layer promotion)
6. One snippet family?     → snippets
7. Layout / placement / registered surface helper? → utilities
8. Browser default / document grid? → base
9. Section-only override Tailwind cannot express? → section {% stylesheet %} (last resort)
```

---

## 五、Motion Token Chain

### 5.1 Intended chain

```text
settings.motion_speed
    → css-variables.liquid (:root --motion-duration-*)
    → CSS consumers: var(--motion-duration-fast), var(--motion-ease-enter), ...
    → tailwind.animates.css: reveal rules, kill switches
    → elements / components / snippets: interactive transitions (SHOULD use same vars)
```

Trigger and state: `layout/theme.liquid` body `data-*` + Alpine (`motion-architecture.md`).  
Capability vs trigger split is intentional — do not move trigger logic into CSS files.

### 5.2 Motion gaps — resolved (Phase 2) and remaining

**Resolved in Phase 2:**

| Item (pre-Phase 2) | Fix |
| --- | --- |
| Missing `--motion-ease-default` in token source | Alias in `css-variables.liquid`: `--motion-ease-default: var(--motion-ease)` |
| Dropdown `0.25s` / `0.24s` hardcoding | `tailwind.components.css` uses motion duration/ease vars |
| Product-card `duration-300` / `duration-400` bypass | `tailwind.snippets.css` uses motion vars |

**Remaining (low priority — Phase 6 lint or drive-by only):**

| Gap | Location | Notes |
| --- | --- | --- |
| Motion vars not in `@theme` | `tailwind.input.css` | Direct `var()` is intentional today — not a token-source bug |
| `icon-breathe` decorative timing | `tailwind.animates.css` | Capability layer — not merchant motion_speed scope |
| `close-button` `transition-colors` without explicit motion var | `tailwind.elements.css` | Optional unify in Phase 5+ |
| Liquid `duration-*` utility bypass | `sections/` / `snippets/` markup | Governance item — audit via Phase 6 lint; not primary motion chain |

### 5.3 What is already unified

- Section content/media reveal: `tailwind.animates.css` + body `data-content-reveal-style` / `data-media-reveal-style`
- Reduced motion and `data-motion-enabled="false"` kill switches
- Interactive transitions in elements, dropdown, product-card, and most snippets use `--motion-duration-*` and `--motion-ease-default` (Phase 2)

---

## 六、Known Misplacements Backlog

Remediation queue. Update status as phases complete.

### P0 — `snippets.css` responsibility mixing — **Phase 4B resolved (owner blocks)**

| Field | Detail |
| --- | --- |
| **Status** | **Resolved (organizational).** Owner blocks established; mixed owners extracted from product-info-blocks. |
| **Remaining** | Phase 5A–5D-2a accepted — see §8.1; 5D-2b open |
| **Visual verification** | Done for Phase 4B scope; re-verify if Phase 5 consolidates tab APIs |

### P1 — Motion token chain break — **Phase 2 resolved**

| Field | Detail |
| --- | --- |
| **Status** | **Resolved** for primary interactive paths. See §5.2 remaining low-priority items. |

### P2 — Section override in components — **Phase 3 resolved**

| Field | Detail |
| --- | --- |
| **Status** | **Resolved.** Override moved to `sections/newsletter-banner.liquid` `{% stylesheet %}`. |

### P3 — `sub-heading` semantic drift — **Phase 4B resolved**

| Field | Detail |
| --- | --- |
| **Status** | **Resolved.** `.sub-heading` in `tailwind.typography.css`. |

### P3 — Hardcoded inventory color — **Phase 4B resolved**

| Field | Detail |
| --- | --- |
| **Status** | **Resolved.** Uses `rgb(var(--color-warning-foreground))` for low-stock dot. |

### P3 — Elements composition / platform exceptions — **open (Phase 5 optional)**

| Field | Detail |
| --- | --- |
| **Current file** | `tailwind/tailwind.elements.css` |
| **Problem** | `links-underline` targets child `.icons`; payment/accelerated-checkout blocks are documented platform bridge |
| **Target layer** | Whitelist maintained; optional split of link+icon composition to `components` in Phase 5 |
| **Phase** | 5 (optional) |
| **Visual verification** | Yes if moving link underline behavior |

---

## 七、Consumption Governance

### 7.1 Agent decision checklist

Before adding or moving CSS, answer in order:

1. **Is this a token?**  
   - Global → `css-variables.liquid` (or already exists)  
   - Per-render dynamic → snippet/section inline `style="--name: ..."` + register in §2.2

2. **Does it need Tailwind bridge?**  
   - Needs `bg-*` / `text-*` utility → map in `@theme inline`  
   - Only used inside `@utility` / component CSS → direct `var()` is fine

3. **What layer type is it?**  
   - Base default / document grid → `base.css`  
   - Font tier → `typography.css`  
   - Single control → `elements.css`  
   - 2+ consumers composite → `components.css`  
   - One snippet family → `snippets.css`  
   - Cross-cutting placement/surface → `utilities.css` (register if semantic)  
   - Motion capability → `animates.css`

4. **How many consumers?**  
   - Count with `rg` across `sections/` and `snippets/`.  
   - **2+ unrelated** → layer promotion candidate (`components.css`). See §4.0.  
   - **3+ stable copies** of the same structure → Phase 5 pattern consolidation (optional follow-up, not required for promotion).

5. **Is it section-specific override?**  
   - If yes → **not** `components.css`. Use section `{% stylesheet %}`, snippets modifier, or snippets owner.

6. **Should lint enforce it?**  
   - Stable, machine-detectable rule → Phase 6 (`lint-theme.js`)  
   - Judgment-heavy → manual review list in `css-and-typography.md`

7. **Visual / AT verification needed?**  
   - Motion, hover, focus, overlay stacking, form controls → yes  
   - Pure token alias with no computed change → optional

### 7.2 Current lint coverage

| Rule | Scope | Reference |
| --- | --- | --- |
| No `heading-base` / `body-base` in Liquid | all Liquid | `css-and-typography.md` |
| No Tailwind `text-*` size on `h1–h6` | all Liquid | pre-existing |
| No `bg-scheme-surface` in sections | `sections/**` | use `surface-section` |
| No overlay `color-{{` + manual `bg-theme-bg text-theme-text` combo | snippets | use `surface-component` |
| No `text-theme-fg` | all Liquid | use `text-theme-text` |
| No `*-section` scoping selectors in `components.css` | `tailwind/tailwind.components.css` | §4.4 hard rule — Phase 6 |
| No re-declared promoted APIs in `snippets.css` | `tab-nav-item`, `accordion__`, `icon-with-text-item` | Phase 5A/5B/5D-1 — Phase 6 |
| Text `role="tab"` requires `tab-nav-item` | Liquid (allowlist: `product-gallery__thumbnail`) | Phase 5A — Phase 6 |
| `*__tab` chrome in `snippets.css` needs owner comment | warning only | Phase 5A — Phase 6 |
| Bare `ms`/`s` in `transition` declarations (incl. multi-line blocks) | `tailwind/*.css` except `animates.css`; `assets/base.css` | warning only — Phase 6 / 6B |

Allowlist: `.agents/skills/check-theme-architecture/css-layer-allowlist.json`

### 7.3 Phase 6 lint — **accepted (2026-06-24)**

**Delivered in `lint-theme.js` → `checkCssLayerProtocol()`:**

| ID | Rule | Level |
| --- | --- | --- |
| P0-1 | `components.css` ban `*-section` root/scoping selectors (comments stripped) | error |
| P0-2 | `snippets.css` ban promoted prefix selectors (comments stripped) | error |
| P1-1 | Liquid `role="tab"` → `tab-nav-item` | error |
| P1-2 | `snippets.css` `*__tab` chrome without comment token | warning |
| P2-1 | Bare duration in `transition` declarations without motion vars (single- and multi-line) | warning |

**Deferred (not v1):** snippets cross-owner BEM heuristic; Liquid `duration-*`; `{% stylesheet %}` CSS lint; `links-underline` composition leak.

**Previous §7.3 candidates** — status merged above; no separate planning list.

### 7.4 Phase 6B lint precision — **accepted (2026-06-24)**

**Delivered (lint + allowlist only — no Tailwind/Liquid changes):**

| ID | Rule | Level |
| --- | --- | --- |
| P2-1b | Multi-line `transition:` blocks: flag bare `ms`/`s` per comma segment after `var()` stripping | warning |
| P0-2b | `snippets.css` promoted-prefix check uses CSS comment masking (same as P0-1) | error |
| P0-2c | `snippetsPromotedSelectors` allowlist array for exact selector bans (separate from prefix bans) | error |

**P2 allowances (unchanged):** `var(--motion-duration-*, fallback)`, `var(--motion-ease-*)`, `visibility 0s`, `transition-delay: 0s`; excludes `tailwind.animates.css` and `assets/tailwind.output.css`.

**Not added:** `buy-buttons__` prefix ban — deferred until 5D-2b retry-action rename or selector-level entry in `snippetsPromotedSelectors`.

---

## 八、后续 Phase

| Phase | Scope | Status |
| --- | --- | --- |
| **Phase 1** | Architecture contract + cross-links | **Accepted** (2026-06-24) |
| **Phase 2** | Motion/token chain fixes | **Accepted** |
| **Phase 3** | Remove section override from `components.css` | **Accepted** |
| **Phase 4B** | `snippets.css` owner blocks + sub-heading + inventory dot | **Accepted** |
| **Phase 5** | Pattern consolidation / selective promotion — see §8.1 | **In progress — 5A–5D-2a Accepted** |
| **Phase 5A** | Tab-nav trigger consolidation (`tab-nav-item*`) | **Accepted** (2026-06-24) |
| **Phase 5B** | Accordion CSS layer promotion (`accordion__*`) | **Accepted** (2026-06-24) |
| **Phase 5C** | Link micro-pattern (`interactive-link` utility) | **Accepted** (2026-06-24) |
| **Phase 5D-1** | Icon-with-text-item CSS layer promotion | **Accepted** (2026-06-24) |
| **Phase 5D-2a** | Buy-buttons purchase chrome CSS layer promotion | **Accepted** (2026-06-24) |
| **Phase 6** | Layer-placement lint (`checkCssLayerProtocol`) | **Accepted** (2026-06-24) |
| **Phase 6B** | Lint precision hardening (multi-line motion, comment masking, selector bans) | **Accepted** (2026-06-24) |

### 8.1 Phase 5 candidates (5A–5D-2a implemented; 5D-2b planning)

**Global constraints for every Phase 5 sub-task:**

- Phase 5 **≠** batch class rename or file rename for aesthetics
- **Must** complete consumer count (`rg`) + **API design review** before any CSS move
- **Must not** create `tailwind.patterns.css` or new layer files — shared APIs go in **`tailwind.components.css`** first
- Prefer **modifier-based** shared classes that existing BEM blocks can adopt incrementally
- One candidate per scoped sub-phase (e.g. 5A tab-nav only); `build:tw` + `lint` + visual QA each step

#### Candidate A — Tab-nav variants — **Accepted (Phase 5A, 2026-06-24)**

| Class families | Layer after 5A | Shared API |
| --- | --- | --- |
| `search-predictive-panel__tab` | `tab-nav-item tab-nav-item--search` + layout delta in `snippets.css` | `components.css` |
| `search-results-tabs__tab` | same | `components.css` |
| `search-overlay__tab` | same + `tab-nav-item--search-border-token`; section typography in `{% stylesheet %}` | `components.css` |
| `blog__tab` | `tab-nav-item--underline-opacity tab-nav-item--hover-muted` + border layout delta | `components.css` |
| `collection__tab` | `tab-nav-item--underline-opacity` + flex layout delta | `components.css` |
| `featured-products__tab` | `tab-nav-item--opacity` only | `components.css` |
| `header-dropdown-super-menu__tab` | `tab-nav-item--underline-opacity` + opacity 0.6 delta | `components.css` |

**Phase 5A delivered:** Shared trigger chrome in `tailwind.components.css` (`tab-nav-item`, `--search`, `--search-border-token`, `--underline-opacity`, `--hover-muted`, `--opacity`). Legacy BEM classes retained on all triggers; duplicate chrome removed from `snippets.css` and `search-overlay.liquid` section stylesheet. `tab-control` API unchanged.

**Remaining (post-5A):** Manual visual QA (7 scenarios); Phase 6 lint for new `*__tab` without `tab-nav-item`; optional legacy class cleanup.

#### Candidate B — Accordion — **Accepted (Phase 5B, 2026-06-24)**

| Class prefix | Layer after 5B | Owner |
| --- | --- | --- |
| `accordion__*` | `tailwind.components.css` (`@layer components`) | Render/API: `snippets/accordion.liquid` |

**Consumers (verified):** `sections/promise-section`, `sections/cart`, `snippets/filters-groups` (filters drawer / vertical filters).

**Phase 5B delivered:** Layer promotion only — accordion block moved from `snippets.css` to `components.css` (Tab Nav Item → Accordion → Dialog). All selectors and declarations unchanged. No Liquid, Alpine `accordion()`, or consumer `title_*_class` / `icon_variant` changes.

**Post-5B API hardening (deferred):** `.accordion__title.is-active` appears unused — Alpine toggles `accordion__title--active` / `--inactive` via `titleClass(index)`, not `.is-active` on the title element. Record for a future snippet/API cleanup pass; not fixed in 5B.

**Remaining:** Manual visual QA (promise-section, cart, filters drawer/vertical); optional dead-selector cleanup later.

#### Candidate C — Link micro-pattern — **Accepted (Phase 5C, 2026-06-24)**

| Legacy class | Shared utility | Owner delta |
| --- | --- | --- |
| `cart__product-link` | `interactive-link` | none (layout/typography in Liquid) |
| `cart-overlay__product-link` | `interactive-link` | none |
| `search-predictive-panel__result-link` | `interactive-link` | `text-theme-text` in `snippets.css` |
| `search-results-tabs__result-link` | `interactive-link` | `text-theme-text` in `snippets.css` |

**Phase 5 action type:** **Elements utility consolidation** — `@utility interactive-link` in `tailwind.elements.css` (focus-ring + hover underline only). **Not** a `components.css` promotion; legacy BEM class names retained on markup.

**Phase 5C delivered:** Four consumers append `interactive-link`; duplicate focus-ring + hover underline removed from `snippets.css` (cart block deleted; search links keep color-only delta).

**Remaining:** Manual visual QA (cart page, cart drawer, search predictive/results links, keyboard focus).

**Independent follow-up:** Candidate E (`links-underline` child `.icons` composition leak) — unchanged by 5C.

#### Candidate D — split into 5D-1 (icon-with-text-item) and 5D-2 (buy-buttons)

##### 5D-1 — Icon-with-text-item — **Accepted (Phase 5D-1, 2026-06-24)**

| Class prefix | Layer after 5D-1 | Owner |
| --- | --- | --- |
| `icon-with-text-item*` | `tailwind.components.css` | Render/API: `snippets/icon-with-text-item.liquid` |

**Consumers:** `sections/icon-with-text`, `snippets/product-info-blocks` (PDP `icon_with_text` block).

**Phase 5D-1 delivered:** Item-level CSS moved snippets → components (after Accordion). Selectors/declarations unchanged. Snippet-local vars (`--icon-with-text-icon-size`, `--icon-with-text-icon-size-mobile`, `--icon-with-text-gap`) injected per item in markup — **valid hybrid** (same pattern as `pagination` + `--pagination-*`). **Not migrated:** `icon-with-text-section__*`, `product-info-blocks__icon-with-text-*`, section carousel/grid CSS.

**Remaining:** Manual visual QA (section grid/carousel, PDP block, image_icon vs theme icon, color schemes).

##### 5D-2a — Buy-buttons purchase chrome — **Accepted (Phase 5D-2a, 2026-06-24)**

| Class prefix | Layer after 5D-2a | Owner |
| --- | --- | --- |
| `buy-buttons__*` (purchase chrome) | `tailwind.components.css` | Render/API: `snippets/buy-buttons.liquid` |

**Consumers:** `snippets/product-info-blocks` (PDP + featured-product), `snippets/quick-view-buy-actions` (quick view).

**Phase 5D-2a delivered:** Purchase chrome moved snippets → components (after Quantity Selector). Selectors/declarations unchanged. No Liquid, Alpine `BuyButtons()`, or consumer changes. **Not migrated:** `buy-buttons__retry-action` (pickup owner delta in `snippets.css`); `product-info-blocks__*`, `product-quick-view__*` owner deltas.

**Remaining:** Manual visual QA (PDP quantity+ATC, quantity-anchor path, sold out/unavailable, dynamic checkout, featured-product, quick view, loading label, pickup retry). **5D-2b deferred:** rename/rehome `buy-buttons__retry-action`; orphan `buy-buttons__quantity` in product-info-blocks; dead `product-info-blocks__buy-buttons` / `product-quick-view__buy-buttons` rules; `stack` layout API cleanup. **Phase 6B candidate:** `buy-buttons__` snippets re-declare ban once retry-action is renamed or listed in `snippetsPromotedSelectors`.

#### Candidate E — `links-underline` + child `.icons` (elements leak)

Optional composition split from `elements.css` to `components.css`. Lowest priority.

### 8.2 Phase 5 entry checklist

1. User names candidate(s) (A–E) and sub-phase ID
2. Agent runs `rg` consumer audit and records counts in `docs/agent/context.md` or a short API design note
3. API design review: proposed classes, modifiers, alias strategy, visual regression surfaces
4. User approves implementation scope
5. Implement in `components.css`; `build:tw` + `lint` + `test`; manual QA list per candidate

---

## Quick answers (acceptance)

| Question | Answer location |
| --- | --- |
| Where does this token come from? | §二 + §三 mapping table |
| Should it enter `@theme` bridge? | §三 "Bridged?" column + §7.1 step 2 |
| Which layer should this CSS use? | §四 + §7.1 step 3–5 |
| When does snippet CSS promote to components? | §4.0 + §4.4: **2+ unrelated consumers** (layer promotion). **3+ stable copies** → Phase 5 pattern consolidation, not a higher promotion bar. |
| Why is motion inconsistent today? | §5.2 — primary gaps resolved Phase 2; see remaining low-priority |
| What to fix next? | §8.1 Phase 5 candidates (planning) or §7.3 Phase 6 lint |
