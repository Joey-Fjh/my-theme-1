---
name: check-theme-architecture
description: Validate Shopify theme architecture and static browser compatibility rules. Use when Liquid, embedded stylesheet or javascript blocks, tab markup, or browser compatibility tooling change.
when_to_use: >
  Liquid runtime-name shadowing, tab accessibility, Liquid output syntax,
  settings chain, module registration, JS outlet rules, or CSS/JS compatibility checks changed.
---

# Check Theme Architecture

Use this skill for project-level architecture and static compatibility validation. Shopify Theme Check remains the platform authority for schema validity, parser-blocking scripts, and other built-in theme rules. This skill supplements Theme Check with project contracts enforced by `lint:theme`.

## Commands

Which command proves which change: `AGENTS.md` Validation. Skill-specific additions:

- `npm.cmd run test:theme-architecture` — fixture tests for `lint:theme`, `lint:liquid-syntax`, and `lint:compat:embedded`; run after changing those scripts.
- `npm.cmd run test:section-stylesheet-carry` — DOM tests for `SectionRefresher.carryInnerSectionStylesheet` in `assets/https.js`; run after changing it.
- `lint:compat:embedded` is part of `lint:compat`, not `lint:theme`.

## Exception comments

Place a `lint-allow` comment on the line **before** the flagged line:

- CSS: `/* lint-allow <check-id>: <reason> */`
- Liquid: `{% # lint-allow <check-id>: <reason> %}`

A comment without a reason fails `lint-allow-reason`. Document every accepted exception in `docs/references/style-system/css-architecture.md`.

## What `lint:theme` Covers

Liquid files under `layout/`, `sections/`, `snippets/`, `blocks/`, and `templates/`; first-party CSS in `tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`, and Liquid `{% stylesheet %}` blocks; first-party `assets/*.js` except `vendor-*`, `*.min.js`, and `gift-card.js`. A Liquid file that fails to parse is reported.

| Check id | Rule |
| --- | --- |
| `protected-runtime-name` | Do not `assign` or `capture` over protected Shopify Liquid runtime names. |
| `tab-aria` | Static `role="tab"` elements must include `aria-selected` and `aria-controls` (`aria-*`, `:*`, or `x-bind:*` forms). |
| `bundled-asset-tag` | At most one `{% stylesheet %}` and one `{% javascript %}` per file; no Liquid inside them. |
| `invalid-rgb-alpha` | Scheme colors use `rgba(var(--color-*), alpha)`, never `rgb(var(--color-*) / alpha)`. |
| `alpine-expression` | Alpine attributes hold one simple JS expression; no Liquid, functions, or statements (`AGENTS.md`, `javascript-runtime.md`). |
| `settings-chain-liquid` | No default Tailwind typography/color utilities or arbitrary `text-[…]` / `bg-[…]` values in Liquid classes; use tier and scheme utilities. |
| `settings-chain-css-typography` | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` in first-party CSS derive from `var(--font-*)` (alone or in `calc`/`max`/`min`/`clamp`) or from the inherited value (`inherit`, `unset`, `bolder`, `lighter`, `em`, `%`). |
| `settings-chain-css-color` | Color properties use scheme tokens, not hex/rgb/hsl literals. |
| `typography-tier-heading` | `heading-h1`–`heading-h6` only on `h1`–`h6`. |
| `typography-tier-body-on-heading` | No `body-*` tiers on headings. |
| `stylesheet-directive` | No `@apply`, `@utility`, or `@variant` inside `{% stylesheet %}`. |
| `liquid-style-tag` | No ad-hoc `<style>` in Liquid. |
| `executable-inline-script` | No executable inline `<script>` (`importmap` and `application/ld+json` allowed). |
| `raw-svg` | No raw `<svg>` outside `snippets/icons.liquid`. |
| `bare-img` | No bare `<img>` outside `snippets/image.liquid` (`templates/gift_card.liquid` excepted). |
| `x-transition` | No `x-transition*` in Liquid; use CSS motion recipes. |
| `js-alpine-outlet`, `js-fetch-outlet`, `js-cart-route-outlet`, `js-document-outlet` | One outlet per side effect (Alpine, HTTP, cart routes, global listeners); owners in `javascript-runtime.md` "One outlet per side effect". |
| `js-user-visible-copy` | No user-visible string literals in `textContent` / `innerText` / `innerHTML`, `setAttribute` for `aria-label` / `title` / `placeholder` / `alt`, or `alert(`. |
| `module-data-module-id`, `module-import-map`, `module-import-map-unused` | Module registration and import-map mapping; contract in `javascript-runtime.md` "Module graph contracts". |
| `section-color-scheme` | Sections with a `color_scheme` setting apply `color-{{ section.settings.color_scheme }}` on the frame. |
| `vendor-notices` | Every `assets/vendor-*` file has a `THIRD_PARTY_NOTICES.md` entry. |
| `lint-allow-reason` | `lint-allow` comments must include a check id and reason. |

## Reporting

Report failures by file, line, check id, and command family. If a finding is pre-existing, say so and classify it as a warning or follow-up according to `AGENTS.md`.
