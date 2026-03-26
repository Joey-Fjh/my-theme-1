my skeleton theme is based on the [Skeleton](http://getskeleton.com/) framework.

# Third-Party Libraries Used in Theme

| Library       | Version | File(s)                                         | CDN / Source                                                                                                               |
| ------------- | ------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Alpine.js     | v3.15.3 | `vendor-alpine.min.js`                          | https://cdn.jsdelivr.net/npm/alpinejs@3.15.3/dist/cdn.min.js                                                               |
| Intersect.js  | v3.x.x  | `vendor-alpine-intersect.min.js`                | https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js                                                     |
| Swiper        | v12.0.3 | `vendor-swiper.min.js`, `vendor-swiper.min.css` | https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css , https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js |
| GSAP          | v3.14.1 | `vendor-gsap.min.js`                            | https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/gsap.min.js                                                                  |
| ScrollTrigger | v3.14.1 | `vendor-gsap-scrolltrigger.min.js`              | https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollTrigger.min.js                                                         |

> 💡 Always update this file when replacing or upgrading a library.

---

# CSS Architecture and Token Mapping

1. Runtime Tokens (Liquid)
   snippets/css-variables.liquid outputs CSS custom properties from Shopify settings and color schemes.

2. Tailwind Theme Bridge (v4)
   assets/tailwind.input.css maps runtime variables into Tailwind theme tokens (@theme inline).

3. Usage Layers

- assets/tailwind.input.css: Tailwind v4 entrypoint and token bridge (@theme inline, breakpoints, and import orchestration)
- assets/base.css: global reset and structural defaults (minimal, non-feature-specific)
- assets/tailwind.elements.css: reusable design primitives (h1, body-md, surface, btn, field, links)
- assets/tailwind.components.css: composite UI patterns (.dropdown, .localization-switcher, .tab-control-default)
- assets/tailwind.snippets.css: snippet-scoped reusable UI blocks (.product-info-blocks and its context variants)
- assets/tailwind.utilities.css: layout and placement helpers (container-page, place-\*)
- assets/tailwind.animates.css: shared motion tokens and animation utilities (keyframes, icons-animate-\*, animate-spin-slow)
- assets/tailwind.output.css: generated compiled CSS artifact (build output, do not edit manually)

4. Token Mapping Table (Source -> Bridge -> Consumption)

| Source (Shopify/Liquid) | Runtime Variable                     | Tailwind Bridge Token                               | Primary Consumption        | Typical Classes                          |
| ----------------------- | ------------------------------------ | --------------------------------------------------- | -------------------------- | ---------------------------------------- |
| color scheme background | `--color-background`                 | `--color-theme-bg`                                  | surfaces/backgrounds       | `bg-theme-bg`, `surface`                 |
| color scheme text       | `--color-foreground`                 | `--color-theme-text`                                | text defaults              | `text-theme-text`                        |
| icon color              | `--color-icons`                      | `--color-theme-icon`                                | icon wrappers              | `icons`, `text-theme-icon`               |
| link color              | `--color-links`                      | `--color-theme-link`                                | links                      | `links`, `links-underline`               |
| border color            | `--color-border`                     | `--color-theme-border`, `--color-theme-border-soft` | inputs/surfaces borders    | `border-theme-border-soft`               |
| strong border color     | `--color-border-strong`              | `--color-theme-border-strong`                       | active/focus emphasis      | `border-theme-border-strong`             |
| focus ring color        | `--color-focus-ring`                 | `--color-focus`, `--color-focus-soft`               | accessible focus outlines  | via `btn` / `field` / `links`            |
| primary button colors   | `--color-primary-button*`            | `--color-primary*`                                  | CTA button primitive       | `btn btn-primary`                        |
| secondary button colors | `--color-secondary-button*`          | `--color-secondary*`                                | secondary button primitive | `btn btn-secondary`                      |
| input radius/shadow     | `--input-*`                          | `--radius-input`, `--shadow-input`                  | field primitive            | `field`                                  |
| button radius/shadow    | `--button-*`                         | `--radius-button`, `--shadow-button`                | button primitive           | `btn`                                    |
| surface radius/shadow   | `--surface-*`                        | `--radius-surface`, `--shadow-surface`              | card/panel primitive       | `surface`                                |
| breakpoints             | `--breakpoint-pc`, `--breakpoint-fw` | same                                                | responsive variants/media  | `pc:*`, `fw:*`, `theme(--breakpoint-pc)` |

---

# Svgo Icons Usage

This theme uses SVGO to normalize and clean SVG icons before they are used in Shopify.

The goal is to ensure that all icons:

- Are styleable via CSS (color, width, height)
- Inherit color from their parent (currentColor)
- Have consistent, predictable markup
- Stay lightweight and maintainable
