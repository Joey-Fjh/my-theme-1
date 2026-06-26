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
| `links-underline` child `.icons` transform | Resolved Phase 5E: `links-underline` owns underline only; `link-with-icon-motion` owns child icon motion | No |

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
| `close-button` motion | `tailwind.elements.css` | **Resolved Phase 8C:** explicit color/background/border/opacity transitions with motion vars |
| Liquid `duration-*` utility bypass | `sections/` / `snippets/` markup | **Phase 6C (Batch A):** 6 interactive hits migrated to owner `{% stylesheet %}` + motion vars. **Remaining:** flip-digit, about-stats, before-after-comparison; `transition-*` without `duration-*`; `{% stylesheet %}` raw ms; optional P2 lint |

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
| **Remaining** | Phase 5A–5E accepted; only deferred manual/API cleanup remains — see §8.1 |
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

### P3 — Elements composition / platform exceptions — **resolved (Phase 5E)**

| Field | Detail |
| --- | --- |
| **Current file** | `tailwind/tailwind.elements.css` |
| **Problem** | `links-underline` previously targeted child `.icons`; payment/accelerated-checkout blocks are documented platform bridge |
| **Target layer** | `links-underline` stays in `elements.css`; child icon choreography moved to `components.css` as `link-with-icon-motion` |
| **Phase** | 5E accepted |
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

**Deferred (not v1):** snippets cross-owner BEM heuristic; Liquid `duration-*` remaining hits (6C Batch A delivered); `{% stylesheet %}` CSS lint; optional P2 Liquid duration lint.

**Previous §7.3 candidates** — status merged above; no separate planning list.

### 7.4 Phase 6B lint precision — **accepted (2026-06-24)**

**Delivered (lint + allowlist only — no Tailwind/Liquid changes):**

| ID | Rule | Level |
| --- | --- | --- |
| P2-1b | Multi-line `transition:` blocks: flag bare `ms`/`s` per comma segment after `var()` stripping | warning |
| P0-2b | `snippets.css` promoted-prefix check uses CSS comment masking (same as P0-1) | error |
| P0-2c | `snippetsPromotedSelectors` allowlist array for exact selector bans (separate from prefix bans) | error |

**P2 allowances (unchanged):** `var(--motion-duration-*, fallback)`, `var(--motion-ease-*)`, `visibility 0s`, `transition-delay: 0s`; excludes `tailwind.animates.css` and `assets/tailwind.output.css`.

**Added (Phase 5D-2b):** `buy-buttons__` prefix ban in `snippetsPromotedPrefixes` after retry-action rename to `pickup-availability-inline__retry-action`.

### 7.5 Phase 6C — Liquid duration-* motion bypass cleanup — **Accepted (2026-06-25)**

**Scope:** Batch A interactive hits only; no lint added.

**Delivered:**

| Owner | Class | Motion |
| --- | --- | --- |
| `sections/article.liquid` | `.article-sidebar__link` | `color` → `--motion-duration-fast` + `--motion-ease-default` |
| `sections/collections.liquid` | `.collections-section__card` | `box-shadow` → `--motion-duration-base` + `--motion-ease-default` |
| `snippets/image-magnifier.liquid` | `.image-magnifier__preview-layer` | `opacity` → `--motion-duration-fast` + `--motion-ease-exit` |
| `snippets/header-mobile-menu-drawer.liquid` | `.header-mobile-menu-drawer__chevron` | `transform` → `--motion-duration-base` + `--motion-ease-default` |
| `snippets/social-icons.liquid` | `.social-icons__link` | `opacity`/`color` → motion vars; `icons-animate-breathe` unchanged |
| `sections/scroll-categories.liquid` | `.scroll-categories__preview` | `opacity`/`transform` → `--motion-duration-base` + `--motion-ease-exit` |

**Deferred:** flip-digit, about-stats, before-after-comparison; `transition-*` without `duration-*`; `{% stylesheet %}` raw ms (`product-comparison-table`, `starts`); collections arrow `duration-300`; optional future P2 Liquid duration lint.

### 7.6 Phase 7A/7B — Snippet CSS consumption contract — **Accepted (Phase 7B, 2026-06-25)**

**Phase 7A (audit):** Reviewed priority snippet owners in `tailwind.snippets.css` for boundary clarity, consumption ergonomics, and shared-primitive vs orphan classification. Conclusion: **PARTIAL CLEANUP** — no owner restructure.

**Phase 7B delivered:**

| Action | Detail |
| --- | --- |
| Dead CSS removed | `.product-quick-view__quantity` deleted (0 Liquid references) |
| Motion alignment | `.variant-picker__swatch` — explicit `border-color` / `box-shadow` transitions with `--motion-duration-fast` + `--motion-ease-default`; `.variant-picker__pill` unchanged |
| Owner comments | `product-card` and `product-info-blocks` block headers document shared primitives |

**Valid shared primitives (not orphans):**

| Prefix / class | Owner API | Consumers |
| --- | --- | --- |
| `product-card-shell__*` | `snippets/product-card.liquid` (shell) | `product-card`, `predictive-search-product-card` |
| `product-card__variant-*` | `snippets/product-card.liquid` | `product-card-variant-panel` (same family) |
| `product-info-blocks__price*` | `snippets/product-info-blocks.liquid` | `product-purchase-stack` dual-class with `product-quick-view__price*` |

**Superseded by Phase 8B:** `product-info-blocks__title` now has an explicit snippets typography owner (`heading-h1`; `--featured` -> `heading-h2`).

**Deferred (7B out of scope):** product-card dual BEM ergonomics; product-card / product-info-blocks block split; batch rename. `buy-buttons__quantity` cross-owner reuse was resolved in Phase 8B.

### 7.7 Phase 8A/8B — PDP product component API contract — **Accepted (Phase 8B, 2026-06-26)**

**Phase 8A (pre-review):** Read-only audit of PDP CSS/API consumption across `product-info-blocks`, `buy-buttons`, `product-purchase-stack`, and quick view. Conclusion: block-driven PDP owner is clear; fix orphan quantity cross-owner, clarify quick-view parallel API, promote title to explicit typography owner. Score ~82/100 for PDP CSS/API.

**Phase 8B delivered:**

| Action | Detail |
| --- | --- |
| Quantity cross-owner resolved | `product-info-blocks` quantity-only fallback: `buy-buttons__quantity` → `product-info-blocks__quantity`; owner rules in `snippets.css` (visual equivalent to components `buy-buttons__quantity`) |
| Title typography owner | `.product-info-blocks__title { heading-h1 }`; `.product-info-blocks--featured .product-info-blocks__title { heading-h2 }` |
| Owner comments | `product-info-blocks` block header: block-driven consumers (PDP, featured-product); quick view documented as parallel scene API with price primitive dual-class only |

**Block-driven consumers (product-info-blocks):**

| Section | `context` | Column |
| --- | --- | --- |
| `sections/product.liquid` | `product` | `form` + optional `gallery` |
| `sections/featured-product.liquid` | `featured` | `form` only |

**Parallel scene API (not product-info-blocks consumers):**

| Snippet | Role |
| --- | --- |
| `snippets/product-quick-view.liquid` | Modal shell + media layout |
| `snippets/product-purchase-stack.liquid` | Fixed ordered stack; dual-class `product-info-blocks__price*` only |

**Valid shared primitives (unchanged):**

| Prefix / class | Owner API | Consumers |
| --- | --- | --- |
| `product-info-blocks__price*` | `snippets/product-info-blocks.liquid` | `product-purchase-stack` dual-class with `product-quick-view__price*` |

**Typography owner:** `product-info-blocks__title` — `heading-h1` on PDP (`h1`); `heading-h2` on featured via `--featured` modifier (`h2`). Desktop PDP title scales `3rem` → `4rem` at `pc:` — **QA accepted 2026-06-26**.

**Resolved in Phase 8C:** `product-price` component API extraction; `buy-buttons` `layout: 'stack'` dead branch; `context` `'main'` vs `'product'` naming alignment.

**Manual QA (2026-06-26):** 21/21 Pass across PDP/featured title scale, quantity-only + purchase group, quick view title/price/variant/purchase, button/payment hover, close-button/icon motion, price, sold out/loading/dynamic checkout/pickup smoke.

**Deferred (8B/8C out of scope):** `--form` / `--featured` modifier audit; PDP empty-product placeholder `h2` vs `heading-h1` semantic note (low).

### 7.8 Phase 8C — Style API hardening — **Accepted (2026-06-26)**

**Purpose:** make global style changes predictable. If a shared primitive such as button hover or product price changes, update the primitive owner instead of re-auditing every snippet.

**Delivered:**

| Area | Contract |
| --- | --- |
| Button hover | `btn` owns hover behavior via `--btn-hover-filter`; `btn-primary` / `btn-secondary` only set variant filter values |
| Button/icon motion | `btn`, `icons`, and `close-button` use explicit motion-var transitions instead of `transition: all` / `transition-colors` |
| Product price | `product-price`, `product-price__main`, `product-price__compare` moved to `components.css`; PDP/featured and quick view consume the same primitive with scene BEM deltas |
| Buy buttons | Removed no-consumer `layout: 'stack'` branch; `buy-buttons` now always renders the purchase-row contract |
| PDP context | `product-info-blocks` default context is `product`; old `main` alias removed from title logic |

**Manual QA (2026-06-26):** btn-primary/secondary hover, Shopify unbranded payment hover contract, close-button/icon motion vars, PDP/featured/quick-view price, sold out/loading/dynamic checkout/pickup smoke — all Pass.

**Validation:** `npm.cmd run lint:theme` passed; `npm.cmd run lint` passed; `npm.cmd test` passed (122 files, 0 offenses).

---

## 八、后续 Phase

| Phase | Scope | Status |
| --- | --- | --- |
| **Phase 1** | Architecture contract + cross-links | **Accepted** (2026-06-24) |
| **Phase 2** | Motion/token chain fixes | **Accepted** |
| **Phase 3** | Remove section override from `components.css` | **Accepted** |
| **Phase 4B** | `snippets.css` owner blocks + sub-heading + inventory dot | **Accepted** |
| **Phase 5** | Pattern consolidation / selective promotion — see §8.1 | **Accepted — 5A–5E** |
| **Phase 5A** | Tab-nav trigger consolidation (`tab-nav-item*`) | **Accepted** (2026-06-24) |
| **Phase 5B** | Accordion CSS layer promotion (`accordion__*`) | **Accepted** (2026-06-24) |
| **Phase 5C** | Link micro-pattern (`interactive-link` utility) | **Accepted** (2026-06-24) |
| **Phase 5D-1** | Icon-with-text-item CSS layer promotion | **Accepted** (2026-06-24) |
| **Phase 5D-2a** | Buy-buttons purchase chrome CSS layer promotion | **Accepted** (2026-06-24) |
| **Phase 5E** | Link underline child-icon composition split | **Accepted** (2026-06-25) |
| **Phase 6** | Layer-placement lint (`checkCssLayerProtocol`) | **Accepted** (2026-06-24) |
| **Phase 6B** | Lint precision hardening (multi-line motion, comment masking, selector bans) | **Accepted** (2026-06-24) |
| **Phase 8B** | PDP API contract: quantity owner, title typography, quick-view boundary docs | **Accepted** (2026-06-26) |
| **Phase 8C** | Style API hardening: buttons, product-price, buy-buttons layout, PDP context | **Accepted** (2026-06-26) |

### 8.1 Phase 5 candidates (5A–5E accepted)

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

**Phase 5F delivered:** Removed dead `.accordion__title.is-active` selector — Alpine uses `accordion__title--active` / `--inactive` via `titleClass(index)`; icon/panel `.is-active` contract unchanged.

**Remaining:** Manual visual QA (promise-section, cart, filters drawer/vertical).

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

**Independent follow-up:** Candidate E (`links-underline` child `.icons` composition leak) — resolved in Phase 5E.

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

##### 5D-2b — Buy-buttons residual cleanup — **Accepted (Phase 5D-2b, 2026-06-25)**

**Delivered:**

- `pickup-availability-inline__retry-action` — pickup retry owner class renamed from `buy-buttons__retry-action` (`pickup-availability-inline.liquid` + `snippets.css`); declarations unchanged; `interactive-link` not used
- Dead CSS removed: `product-info-blocks__buy-buttons` (grouped selector; `__purchase` retained); `product-quick-view__buy-buttons` (duplicate of `__purchase`)
- `buy-buttons__` added to `snippetsPromotedPrefixes` (layer boundary lock)

**Remaining manual QA:** PDP pickup retry visual/focus; PDP quantity+ATC; quantity-anchor path; sold out/unavailable; dynamic checkout; featured-product; quick view; loading label.

**Resolved:** `stack` layout API cleanup — Phase 8C removed the no-consumer branch. Orphan `buy-buttons__quantity` — **resolved Phase 8B**.

##### 5F — Deferred API / markup cleanup — **Accepted (Phase 5F, 2026-06-25)**

**Delivered:**

- Accordion: deleted dead `.accordion__title.is-active` CSS (title contract remains `--active` / `--inactive`; icon/panel `.is-active` unchanged)
- Buy-buttons: removed dead Liquid modifiers `buy-buttons__actions` and `buy-buttons__actions--without-quantity`; kept `buy-buttons__actions--purchase-group` and conditional `buy-buttons__actions--with-quantity`

**Resolved:** `layout: 'stack'` API branch and `close-button` explicit motion vars — Phase 8C. Orphan `buy-buttons__quantity` in `product-info-blocks` — **resolved Phase 8B**.

#### Candidate E — `links-underline` + child `.icons` (elements leak) — **Accepted (Phase 5E, 2026-06-25)**

**Action type:** composition split. `links-underline` remains a single-element underline primitive in `tailwind.elements.css`; child `.icons` transition and hover/focus translation moved to `tailwind.components.css` as `link-with-icon-motion`.

**Phase 5E delivered:** `snippets/link.liquid` appends `link-with-icon-motion` for `variant: 'underline'`, preserving existing CTA arrow behavior without per-consumer class edits.

**Remaining:** Manual visual QA for underline links with icons, including RTL direction.

### 8.2 Phase 5 entry checklist

1. User names candidate(s) (A–E) and sub-phase ID
2. Agent runs `rg` consumer audit and records counts in `docs/agent/context.md` or a short API design note
3. API design review: proposed classes, modifiers, alias strategy, visual regression surfaces
4. User approves implementation scope
5. Implement in `components.css`; `build:tw` + `lint` + `test`; manual QA list per candidate

---

## 九、Image Display Contract (Phase Image-B)

`image.liquid` is the single-source base image primitive. Every `<img>` in the theme flows through it. This section defines the display-mode contract established in Phase Image-B.

### 9.1 Two display modes

| Mode | Default fit | Wrapper height | Use case |
| --- | --- | --- | --- |
| `frame` (default) | `object-cover` | `height: 100%` | Fixed-container fill: hero banners, product cards, gallery, any aspect-ratio-constrained frame |
| `natural` | `object-contain` | `height: auto` | Intrinsic/editorial images: logos, decorative brushstrokes, editorial content, product comparison shots |

**Backward compat:** all calls without `mode` default to `frame` → `height: 100%` wrapper + `object-cover` img → identical output.

### 9.2 Parameter contract

| Param | Type | Default | Behavior |
| --- | --- | --- | --- |
| `mode` | `'frame'` \| `'natural'` | `'frame'` | Controls wrapper sizing class (`[data-image-mode]`) and default `fit` |
| `fit` | `'cover'` \| `'contain'` \| `'fill'` \| `'none'` \| `'scale-down'` | derived from mode | Overrides the mode-derived default. Applied as `object-{fit}` on img when not already present in `img_class`. |
| `position` | CSS object-position value | `'center'` | `object-position` on img via `--image-object-position` CSS var. Supports `'top'`, `'bottom'`, `'left'`, `'right'`, and compound (`'top left'`, etc.). |
| `wrapper_class` | string | `''` | Canonical wrapper class param. `class` is a deprecated alias — both merge into the wrapper. |

### 9.3 Object-fit detection

The snippet checks `img_class` tokens for any `object-{fit}` utility — including responsive variants (`pc:object-contain`, `pc:object-cover`, etc.). If detected, the explicit `fit` param is **not** appended (caller intent wins). Otherwise, `fit` (or its mode-derived default) is appended.

### 9.4 CSS behavior

```css
.theme-image { width: 100%; aspect-ratio: var(--aspect-ratio); }
.theme-image[data-image-mode='frame']  { height: 100%; }
.theme-image[data-image-mode='natural'] { height: auto; }
.theme-image > .image_img {
    width: 100%; height: 100%;
    object-position: var(--image-object-position, center);
}
```

`data-image-mode` is always emitted on the wrapper. `--image-object-position` is always set via inline style.

### 9.5 Decision flow

```
1. Is the container a fixed frame (aspect-ratio, absolute fill, grid cell)? → mode: 'frame'
2. Is the image displayed at its natural ratio (logo, editorial, decorative)? → mode: 'natural'
3. Does the merchant need focal-point control? → add position param
4. Does the merchant need cover-vs-contain? → add fit param (or expose via schema)
5. Section/snippet decides mode — image.liquid does not guess business semantics
```

### 9.6 Migration status (Phase Image-B)

| Caller | Change | Reason |
| --- | --- | --- |
| `header.liquid` logo | `mode: 'natural'`, `fit: 'contain'` | Logo should never be cropped |
| `footer.liquid` brush | `mode: 'natural'`, `fit: 'contain'` | Decorative image; was passing `object-contain` on wrapper (ignored) |
| `brand-statement.liquid` brushstroke | `mode: 'natural'`, `fit: 'contain'`, `position: 'center'` | Was `pc:object-contain` only — mobile was cropped |
| `newsletter-banner.liquid` | `mode: 'frame'` + schema `fit` + `position` | Merchant control over background display |

**45 unpatched callers** remain on `frame` default — no visual change.

### 9.7 Phase Image-C — consumption hardening (2026-06-25)

**Object-fit detection hardened:**

The `has_object_fit` check now uses a two-tier detection strategy:
1. Exact match on bare tokens: `object-cover`, `object-contain`, `object-fill`, `object-none`, `object-scale-down`
2. Contains match on responsive variants: `:object-cover`, `:object-contain`, `:object-fill`, `:object-none`, `:object-scale-down` (catches `pc:object-contain`, `sm:object-cover`, any breakpoint prefix, etc.)

This replaces the previous approach of enumerating known responsive prefixes (`pc:object-cover`, `pc:object-contain`, …), making detection future-proof against new Tailwind breakpoints.

**testimonial-featured wrapper/img class misuse fixed:**

| Before | After |
| --- | --- |
| `class: 'h-full w-full object-cover'` | `class: 'h-full w-full'` + `mode: 'frame'` + `fit: 'cover'` |

The `object-cover` was in the wrapper `class` param (ignored by the old snippet, which auto-added `object-cover` anyway). Now the intent is explicit: wrapper class is layout-only, img fit is declared via `fit`.

**Audit-only — high-risk hero/frame callers (no migration):**

| Caller | Current state | Verdict | Future candidate? |
| --- | --- | --- | --- |
| `main-page-contact.liquid` | Default frame + cover, no wrapper misuse | Clean. Grid-cell fill is correct. | Schema `image_fit`/`image_position` if focal-point complaints surface. |
| `promo-bannder.liquid` (hero) | Default frame + cover inside `aspect-*` container | Clean. Hero banner fill-frame is correct. | Schema like newsletter-banner if merchants need contain/top for portrait hero images. |
| `promo-bannder.liquid` (cards) | Default frame + cover inside `aspect-*` container | Clean. Card fill is correct. | Same as hero — potential schema add. |
| `slides-show.liquid` | Default frame + cover in Swiper slide | Clean. Full-bleed slide fill is correct. | Per-slide block-level fit/position schema. |
| `routine-showcase.liquid` | Default frame + cover, `absolute inset-0` parent | Clean. Absolute background fill is correct. | Schema if product image cropping complaints. |
| `newsletter-overlay.liquid` | `class: 'w-full h-full'` (layout) + `img_class: '… object-cover'` (explicit) | Already correct. No wrapper misuse. | Schema fit/position for overlay image. |
| `main-page-about.liquid` | `class: 'h-full w-full pc:h-auto'` (layout) + `img_class: '… object-cover object-center'` (explicit) | Already correct. No wrapper misuse. | Schema fit/position for about page image. |

**Post-Image-C consumer census:**

| Mode | Count | Callers |
| --- | --- | --- |
| `frame` (default) | ~43 | All product cards, galleries, hero banners, slides, overlays, blog cards, collection cards — unchanged |
| `frame` (explicit) | 3 | `newsletter-banner`, `testimonial-featured`, `newsletter-overlay` (via `img_class`) |
| `natural` (explicit) | 4 | `header` logo, `footer` brush, `brand-statement` brushstroke, `cart` thumbnail (via `img_class`) |

### 9.8 Phase Image-D Mini — param validation whitelist (Accepted 2026-06-25)

Added defense-in-depth validation for the three public params. All existing valid values pass unchanged.

| Param | Whitelist | Invalid fallback |
| --- | --- | --- |
| `mode` | `frame`, `natural` | `frame` |
| `fit` | `cover`, `contain`, `fill`, `none`, `scale-down` | mode-derived: `contain` for natural, `cover` for frame |
| `position` | `center`, `top`, `bottom`, `left`, `right`, `top left`, `top right`, `bottom left`, `bottom right` | `center` |

### 9.9 Phase Image-E — final compatibility audit (Accepted 2026-06-25)

**Audit-only — no code changes.** All 52 `render 'image'` calls across 28 files verified.

**Post-Image-E consumer census (final):**

| Category | Count | Status |
|---|---|---|
| Explicit `mode` (migrated Image-B) | 5 | header logo, footer brush, brand-statement brushstroke, newsletter-banner bg, testimonial-featured |
| Explicit object-fit in `img_class` | 18 | article hero, blog, cart, newsletter-overlay, main-page-about, product-comparison-table, image-lightbox (3), product-gallery-carousel/grid/stacked/thumbnails (6), media-video, image-magnifier |
| Default frame+cover, correct container | 24 | about-stats (6), before-after-comparison (4), blog-stories (2), collections, footer-bg, main-page-contact, philosophy-section, promise-section, scroll-categories, promo-bannder (2), routine-showcase (2), slides-show, product-card (2) |
| Pass-through from gallery | 4 | product-media image/video/external-video/model |
| Hybrid (compatible) | 1 | product-comparison-table: `object-contain` + frame-mode wrapper — works, defer cleanup |

**Result:** 0 blockers. 1 non-blocking hybrid warning: `product-comparison-table` uses `object-contain` with frame-mode wrapper — functionally correct (flex provides height), semantically `mode: 'natural'` would be cleaner. Defer to next cleanup pass.

**Optional schema candidates (plumbing exists — `fit` + `position` params are ready):**

| Section | Rationale |
| --- | --- |
| `promo-bannder` (hero + cards) | Portrait product hero in 16:9 frame; square card mobile |
| `slides-show` | Full-bleed slides — focal point control per slide |
| `routine-showcase` | Fixed 342/198 product card AR |
| `newsletter-overlay` | h-52 pc:h-full editorial image |
| `main-page-about` | Grid editorial image |

**Image system conclusion: 96/100.** Remaining to 98+ is per-section merchant controls, not `image.liquid` plumbing. The image component contract is complete.

---

## Quick answers (acceptance)

| Question | Answer location |
| --- | --- |
| Where does this token come from? | §二 + §三 mapping table |
| Should it enter `@theme` bridge? | §三 "Bridged?" column + §7.1 step 2 |
| Which layer should this CSS use? | §四 + §7.1 step 3–5 |
| When does snippet CSS promote to components? | §4.0 + §4.4: **2+ unrelated consumers** (layer promotion). **3+ stable copies** → Phase 5 pattern consolidation, not a higher promotion bar. |
| Why is motion inconsistent today? | §5.2 — primary gaps resolved Phase 2; see remaining low-priority |
| What to fix next? | Deferred manual/API cleanup in §8.1, launch-readiness QA, or explicit lint expansion from §7.3 |
