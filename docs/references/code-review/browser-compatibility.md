# Browser Compatibility Policy

`AGENTS.md` remains the repository rule source. This reference defines the static compatibility baseline and proactive source guardrails for the theme.

## Official Support Baseline

The browser matrix follows the current [Shopify Theme Store browser compatibility requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#9-browser-compatibility):

- Safari: latest two macOS releases
- Chrome: latest three releases on macOS and Windows
- Firefox: latest three releases on macOS and Windows
- Edge: latest two Windows releases
- Mobile Safari: latest two iOS releases
- Chrome Mobile: latest three releases on Android and iOS
- Samsung Internet: latest two Android releases
- Instagram, Facebook, and Pinterest webviews: latest Android and iOS releases

`.browserslistrc` represents the browser engines that static tools can resolve. Its Safari and iOS `major versions` queries conservatively include every published minor release in the latest two major families, which is broader than Shopify's literal latest-two-release wording. iOS Chrome uses the iOS WebKit engine and is covered by the iOS target. Caniuse exposes only the current Chrome Android release, so the latest three desktop Chrome engines provide the static proxy for Shopify's three-release Android requirement. Application webviews remain a release-test responsibility because Browserslist cannot model them precisely.

## Build Boundary

The runtime architecture remains Liquid, Tailwind CSS v4 CLI, classic deferred scripts, Alpine, and Swiper.

Tailwind CSS v4 handles imports and vendor prefixes automatically and targets modern browsers including Safari 16.4+, Chrome 111+, and Firefox 128+. Browserslist does not change Tailwind's compilation target. Do not add Vite, Autoprefixer, Babel, or broad polyfill bundles solely for this policy.

If Shopify's required browser range ever becomes older than Tailwind's supported floor, stop and make an explicit architecture decision instead of silently layering another transformer over generated CSS.

## Static Compatibility Checks

Use:

```bash
npm.cmd run lint:compat
```

This read-only command checks:

- compiled storefront CSS and standalone first-party CSS;
- first-party JavaScript assets, excluding generated and vendor files;
- CSS inside Liquid `{% stylesheet %}` blocks;
- JavaScript inside Liquid `{% javascript %}` blocks.

Use:

```bash
npm.cmd run scan:compat
```

when Tailwind source changed. It rebuilds `assets/tailwind.output.css` before running the compatibility checks.

The strict CSS scanner checks authored Tailwind source, standalone CSS, Liquid stylesheet blocks, and the compiled artifact. Global exceptions are limited to reviewed false-positive or progressive categories that do not block core browsing or purchasing:

- optional cursor variants on touch devices;
- native resize handles;
- enhanced scrollbar styling;
- extended system font keywords with fallback stacks.
- intrinsic sizing keywords whose consumers retain explicit min/max constraints;
- doiuse's coarse `multicolumn` category, which also reports standard grid and flex `column-gap`.

Tailwind-source exceptions are explicit and reviewed: clip-path is optional motion or has a visible base state, `::marker` only enhances rich-text list markers, and intrinsic sizing utilities are paired with max/min constraints in their consumers. The compiled artifact has additional explicit exceptions for Tailwind-generated utilities and bundled Swiper CSS.

`lint:theme` closes the generated-utility gap at the first-party source boundary. New `contents`, `mix-blend-*`, `touch-*`, or `columns-*` class utilities require an explicit allowlist entry; first-party touch-action, multi-column properties, clip-path, and `::marker` declarations are similarly restricted to the reviewed owners. The current footer `mix-blend-lighten`, motion clip-path capability, rich-text list marker, and before/after comparison clip are the bounded exceptions.

Compatibility findings must identify a source-owned behavior that affects Shopify's required information, browsing, or purchasing experience before code is changed.

## Source Adoption Rules

- Prefer MDN Baseline widely available features.
- A newer feature is allowed only when every Shopify-required browser supports it or a usable fallback precedes it.
- Use `@supports` for optional visual enhancement when the fallback must remain usable.
- Prefer feature detection over user-agent detection.
- Do not add browser-specific business-logic branches when a definite layout, native-control reset, or shared primitive fixes the cause.
- Keep critical navigation, product forms, and purchase paths usable without JavaScript.

## Project WebKit Guardrails

The architecture lint enforces deterministic regressions already confirmed in Safari:

- custom `<summary>` controls must hide `::-webkit-details-marker`;
- SVG `<text textLength>` must not contain nested `<tspan>` nodes;
- category-grid items must retain a definite full width before percentage-sized media resolves.

When a future browser defect has a stable source signature, fix the shared primitive and add a low-false-positive guard to `lint:theme`.

## Evidence Boundary

Passing static checks means the configured tools found no unapproved source-detectable incompatibility for the represented browser matrix. It does not prove complete database coverage, pixel-identical rendering, application-webview support, or the absence of browser-engine implementation defects.

Automated browser, BrowserStack, real-device, and application-webview testing are intentionally deferred from the current package. They remain required before a Theme Store submission claim of full browser verification.
