# Browser Compatibility Policy

Read when: changing first-party CSS or JS, embedded Liquid stylesheet or javascript blocks, the browserslist config, or Tailwind build compatibility.

Static compatibility baseline. `AGENTS.md` remains the rule source.

## Official Support Baseline

Follow the current [Shopify Theme Store browser compatibility requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#9-browser-compatibility). This project adopts that matrix as a quality baseline only. Adopting it does not adopt the Theme Store feature inventory.

## Build Boundary

The runtime is Liquid, the Tailwind CSS v4 CLI, ES modules through an import map, and Alpine. In `snippets/scripts.liquid` (rendered by `layout/theme.liquid`), Alpine is the only classic `defer` script. `templates/gift_card.liquid` renders without that layout and loads Shopify's `qrcode.js` and `assets/gift-card.js` as classic `defer` scripts.

Tailwind CSS v4 handles imports and vendor prefixes and targets modern browsers. Browserslist does not change Tailwind's compilation target. Do not add Vite, Autoprefixer, Babel, or broad polyfill bundles for this policy.

If Shopify's required range becomes older than Tailwind's supported floor, stop and make an explicit architecture decision. Do not layer another transformer over generated CSS.

## Static Tool Scope

`.browserslistrc` drives the browser range for static ESLint and Stylelint checks only. Those checks can express source-detectable support for first-party CSS, JS, and embedded Liquid stylesheet or javascript blocks. They cannot prove complete browser compatibility.

Release testing, not static lint, still covers iOS Chrome, the Instagram, Facebook, and Pinterest in-app webviews, and pixel-identical rendering or engine defects that do not appear in source.

## Commands

Commands: `AGENTS.md` Validation. `lint:compat` covers first-party CSS, JS, and embedded Liquid blocks; `scan:compat` rebuilds Tailwind output first. Allowlists and generated-artifact rules live in the lint source and config.

## Source Adoption Rules

- Prefer MDN Baseline widely available features.
- A newer feature is allowed only when every Shopify-required browser supports it, or a usable fallback precedes it.
- Use `@supports` for an optional visual enhancement when the fallback must stay usable.
- Prefer feature detection over user-agent detection.
- Keep critical navigation, product forms, and purchase paths usable without JavaScript.

## Evidence Boundary

Passing static checks means the configured tools found no unapproved source-detectable incompatibility for the represented matrix. It does not prove complete database coverage, pixel-identical rendering, application-webview support, or the absence of engine defects. Automated browser, BrowserStack, real-device, and application-webview testing remain required before a Theme Store claim of full browser verification.
