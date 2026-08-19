# Browser Compatibility Policy

Static compatibility baseline and guardrails. `AGENTS.md` remains the rule source.

## Official Support Baseline

Follow the current [Shopify Theme Store browser compatibility requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#9-browser-compatibility):

- Safari: latest two macOS releases
- Chrome: latest three releases on macOS and Windows
- Firefox: latest three releases on macOS and Windows
- Edge: latest two Windows releases
- Mobile Safari: latest two iOS releases
- Chrome Mobile: latest three releases on Android and iOS
- Samsung Internet: latest two Android releases
- Instagram, Facebook, and Pinterest webviews: latest Android and iOS releases

`.browserslistrc` drives static tool resolution. Application webviews remain a release-test responsibility.

## Build Boundary

The runtime architecture remains Liquid, Tailwind CSS v4 CLI, classic deferred scripts, Alpine, and Swiper.

Tailwind CSS v4 handles imports and vendor prefixes and targets modern browsers. Browserslist does not change Tailwind's compilation target. Do not add Vite, Autoprefixer, Babel, or broad polyfill bundles solely for this policy.

If Shopify's required browser range ever becomes older than Tailwind's supported floor, stop and make an explicit architecture decision instead of silently layering another transformer over generated CSS.

## Commands

- `npm.cmd run lint:compat` — static compatibility scan for first-party CSS, JS, and embedded Liquid stylesheet/javascript blocks.
- `npm.cmd run scan:compat` — rebuild Tailwind output, then run compatibility checks. Use after Tailwind source changes.

Detailed exception allowlists and compiled-artifact rules live in lint source and config, not in this reference.

## Source Adoption Rules

- Prefer MDN Baseline widely available features.
- A newer feature is allowed only when every Shopify-required browser supports it or a usable fallback precedes it.
- Use `@supports` for optional visual enhancement when the fallback must remain usable.
- Prefer feature detection over user-agent detection.
- Keep critical navigation, product forms, and purchase paths usable without JavaScript.

## Project WebKit Guardrails

The architecture lint enforces deterministic regressions already confirmed in Safari:

- custom `<summary>` controls must hide `::-webkit-details-marker`;
- SVG `<text textLength>` must not contain nested `<tspan>` nodes;
- category-grid items must retain a definite full width before percentage-sized media resolves.

When a future browser defect has a stable source signature, fix the shared primitive and add a low-false-positive guard to `lint:theme`.

## Evidence Boundary

Passing static checks means the configured tools found no unapproved source-detectable incompatibility for the represented browser matrix. It does not prove complete database coverage, pixel-identical rendering, application-webview support, or the absence of browser-engine implementation defects.

Automated browser, BrowserStack, real-device, and application-webview testing remain required before a Theme Store submission claim of full browser verification.
