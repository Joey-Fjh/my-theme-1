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
   tailwind/tailwind.input.css maps runtime variables into Tailwind theme tokens (@theme inline).

3. Usage Layers

- tailwind/tailwind.input.css: Tailwind v4 entrypoint and token bridge (@theme inline, breakpoints, and import orchestration)
- assets/base.css: global reset and structural defaults (minimal, non-feature-specific)
- tailwind/tailwind.typography.css: semantic typography utilities (hxxxl-h6, body-xl-body-xs, heading/body base)
- tailwind/tailwind.elements.css: reusable design primitives (surface, btn, field, links, icons, badges)
- tailwind/tailwind.components.css: composite UI patterns (.dropdown, .localization-switcher, .tab-control-default)
- tailwind/tailwind.snippets.css: snippet-scoped reusable UI blocks (.product-info-blocks and its context variants)
- tailwind/tailwind.utilities.css: layout and placement helpers (container-page, place-\*)
- tailwind/tailwind.animates.css: shared motion tokens and animation utilities (keyframes, icons-animate-\*, animate-spin-slow)
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

---

# RTE Standard

This theme uses a shared RTE system so rich text behaves consistently across pages, articles, product descriptions, and supporting content blocks.

Reference sources:

- Shopify docs: `richtext` outputs block HTML, `inline_richtext` outputs inline HTML without an outer `<p>`.
- Dawn: shared `rte` styling is reused for long-form and product-related content instead of redefining rich-text styles per section.

- https://shopify.dev/storefronts/themes/architecture/settings/input-settings
- https://github.com/Shopify/dawn/blob/main/sections/main-product.liquid

## Quick Decision Guide

Use this when adding or reviewing a content field:

1. If the source is `page.content` or `article.content`, always use `.rte`.
2. If the source is `product.description`, use `.rte`.
   If the description appears in a secondary panel like tabs, use `.rte rte--supporting`.
3. If the source is a Shopify `richtext` setting:
   Use `.rte rte--compact` when the section should support paragraphs, lists, links, and consistent formatting.
   Keep local typography only when the section is intentionally art-directed and shared RTE behavior would visibly change the design.
4. If the source is `inline_richtext`, do not use `.rte`.
   Style it as local UI text.

## Core Rules

1. Never output a Shopify `richtext` value inside a `<p>` or heading tag.
   `richtext` already renders block-level HTML such as `<p>` and `<ul>`.
2. Prefer modifiers over one-off section-specific overrides.
   Use `.rte--compact` or `.rte--supporting` instead of creating another custom rich-text class unless the section truly needs a custom system.
3. `.rte` is structural, not a typography reset.
   Keep font size, text color, alignment, and breakpoint-specific display styling on the section/snippet wrapper classes.
4. Adjust global RTE behavior in [tailwind.components.css](/d:/project/shopify_project/my-theme-1/tailwind/tailwind.components.css:346).
   Adjust template classification in the section/snippet markup by changing which RTE class is applied.

## RTE Variants

| Class              | Purpose                                                  | Typical use                                          |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------- |
| `.rte`             | Shared rich-text structure and content formatting        | page body, article body, main product description    |
| `.rte--compact`    | Same formatting model with tighter vertical rhythm       | hero descriptions, cards, short supporting rich text |
| `.rte--supporting` | Supporting-content mode with smaller, left-aligned media | product tabs, secondary description panels           |

## Current Project Mapping

### Full `.rte`

- [sections/page.liquid](/d:/project/shopify_project/my-theme-1/sections/page.liquid:16)
- [sections/article.liquid](/d:/project/shopify_project/my-theme-1/sections/article.liquid:100)
- [snippets/product-info-blocks.liquid](/d:/project/shopify_project/my-theme-1/snippets/product-info-blocks.liquid:82)

### `.rte rte--supporting`

- [sections/product-tabs.liquid](/d:/project/shopify_project/my-theme-1/sections/product-tabs.liquid:93)

### `.rte rte--compact`

- [sections/promise-section.liquid](/d:/project/shopify_project/my-theme-1/sections/promise-section.liquid:54)
- [sections/404.liquid](/d:/project/shopify_project/my-theme-1/sections/404.liquid:24)
- [sections/blog.liquid](/d:/project/shopify_project/my-theme-1/sections/blog.liquid:26)
- [sections/collection.liquid](/d:/project/shopify_project/my-theme-1/sections/collection.liquid:23)
- [sections/footer.liquid](/d:/project/shopify_project/my-theme-1/sections/footer.liquid:88)
- [sections/main-page-about.liquid](/d:/project/shopify_project/my-theme-1/sections/main-page-about.liquid:54)
- [sections/main-page-contact.liquid](/d:/project/shopify_project/my-theme-1/sections/main-page-contact.liquid:70)
- [sections/philosophy-section.liquid](/d:/project/shopify_project/my-theme-1/sections/philosophy-section.liquid:28)
- [sections/philosophy-section.liquid](/d:/project/shopify_project/my-theme-1/sections/philosophy-section.liquid:79)
- [sections/product-recommendations.liquid](/d:/project/shopify_project/my-theme-1/sections/product-recommendations.liquid:32)
- [sections/scroll-categories.liquid](/d:/project/shopify_project/my-theme-1/sections/scroll-categories.liquid:35)
- [sections/scroll-categories.liquid](/d:/project/shopify_project/my-theme-1/sections/scroll-categories.liquid:81)

## Intentional Exceptions

These richtext outputs still use local typography on purpose because they are either strongly art-directed or inside a reusable component where shared RTE behavior could have wider side effects:

- [sections/about-stats.liquid](/d:/project/shopify_project/my-theme-1/sections/about-stats.liquid:96)
- [sections/newsletter-overlay.liquid](/d:/project/shopify_project/my-theme-1/sections/newsletter-overlay.liquid:70)
- [snippets/accordion.liquid](/d:/project/shopify_project/my-theme-1/snippets/accordion.liquid:138)

If any of these areas later need stronger paragraph/list/link consistency, migrate them deliberately into `.rte`, `.rte--compact`, or `.rte--supporting`.

## Maintenance Notes

- The main place to change shared RTE behavior is [tailwind.components.css](/d:/project/shopify_project/my-theme-1/tailwind/tailwind.components.css:346).
- The main place to decide which behavior a block gets is the section or snippet markup where the class is assigned.
- `.rte` should not be used to force a section back to `body-md`; keep display typography on the wrapper that owns the layout.
- A structural correctness fix was applied in [sections/footer.liquid](/d:/project/shopify_project/my-theme-1/sections/footer.liquid:88): a `richtext` output wrapper was changed from `<p>` to `<div>` to avoid invalid nested block markup.
