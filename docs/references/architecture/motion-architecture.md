# Motion Architecture Reference

Motion decision boundaries that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this when changing animation, transitions, GSAP choreography, motion policy, motion tokens or presets, reduced-motion behavior, or motion cleanup.

Inspect current source for selectors, timing, and runtime internals.

`tailwind/tailwind.animates.css` holds the motion recipes: `icons-animate-*`, `animate-spin-slow`, `is-paused` / `is-running`, panel, dialog, and drawer keyframes, the watermark marquee, and `.spinner` / `.spinner-lg`. `snippets/loading.liquid` and `snippets/buy-buttons.liquid` use `.spinner`. No file uses `.spinner-lg` today. Add further recipes under this policy.

`layout/theme.liquid` emits `data-motion-enabled="false"` only when the setting is off, so motion CSS gates on `body:not([data-motion-enabled='false'])`.

## Motion Goals

1. One semantic entry point for motion decisions.
2. Reusable animation without forcing one technology.
3. Room for a global motion setting, without scattering raw duration, ease, or transform values.
4. Alpine, Tailwind/CSS, and GSAP do not compete for the same element properties.

## Ownership

| Layer | Owns | Does not own |
| --- | --- | --- |
| CSS capability (`tailwind/tailwind.animates.css`) | Tokens, keyframes, animation classes, reduced-motion rules | Section structure, trigger logic, state |
| Alpine components | UI state and trigger behavior (open, close, show, hide, active, loading) | Keyframes and animation values |
| GSAP / ScrollTrigger | Complex narrative choreography: timeline, parallax, scrub, split text, coordinated storytelling | Ordinary storefront motion, unless explicitly classified |

## Decision Rules

| Motion need | Default path | Do not |
| --- | --- | --- |
| Hover, focus, loader, decorative loop, pause or running | CSS capability utility | GSAP |
| Open, close, show, hide, active, loading visibility | Alpine state plus CSS or state classes | GSAP, `x-transition` (`lint:theme` `x-transition`) |
| Section or media reveal | The list and card cascade (`docs/project.md`, Theme-Specific Contracts) | GSAP, unless classified as complex choreography |
| Complex narrative choreography | GSAP only after explicit classification and approval | — |

## Conflict Rule

Alpine/CSS and GSAP must not control `opacity` or `transform` on the same element. One owner per element.

## Drawer And Overlay Motion

Drawer and dialog overlay motion runs through `assets/dialog.js`, `assets/dialog-motion.js`, and `assets/drawer-motion.js`, with the `dialog-motion-*`, `drawer-motion-*`, and `panel-motion-*` keyframes in `tailwind/tailwind.animates.css`, under the `prefers-reduced-motion` policy.

## GSAP Boundary

GSAP core and ScrollTrigger are vendored for complex narrative choreography only. The active consumer is `assets/scatter-gallery.js`. Do not add GSAP elsewhere without an accepted batch.

Loading:

- Sections pass `data-gsap-src` and `data-scrolltrigger-src` on the component root.
- Only `assets/motion-gsap.js` loads the classic scripts and touches `window.gsap` / `window.ScrollTrigger`.
- A GSAP section loads the library one viewport ahead through its own observer. `assets/scatter-gallery.js` `preloadRootMargin()` uses one viewport height. The core lazy margin is 200px (`assets/base.js`, `{ rootMargin: '200px' }`), which is too late for a first-frame state.

Implementation:

- Register factories through `define()` on a `data-module-id` entry module.
- Wrap each component in one `gsap.context()` and call `revert()` in `destroy()`.
- Use `gsap.matchMedia()` for `prefers-reduced-motion: reduce` (no tween) and for layout breakpoints when distances differ.
- Skip GSAP setup entirely when `body[data-motion-enabled='false']`.
- Without JavaScript, the final (spread) layout stays visible. Do not hide critical content behind animation completion.
- Do not share `transform` or `opacity` with CSS transitions, CSS animations, or Alpine on an element GSAP transforms.

## Page-Type Policy

Product, collection, search, cart, and checkout-adjacent pages use restrained motion: state transitions, interaction feedback, media controls, and below-the-fold motion only where that section's design calls for it.

Home, brand, editorial, campaign, and storytelling pages may use richer choreography when critical first-viewport content is visible before JavaScript, no LCP candidate waits for animation, reduced motion is respected, and keyboard and screen-reader access stay intact.

## Token And Preset Rules

Do not over-tokenize motion. Tokenize a foundation value that several recipes share, or that a global motion setting should change. A component-specific value stays in its recipe until a real reuse pattern exists.

Merchant motion settings control policy, not GSAP easing names, ScrollTrigger start or end, or raw stagger amounts.

Before copying a motion pattern, check whether a capability utility or an approved runtime contract already owns it.

## Performance And Reduced Motion

- Prefer opacity and transform. Avoid layout-changing animation properties.
- Critical first-viewport content renders visible without JavaScript or animation completion.
- Do not hide that content behind GSAP, Alpine, Swiper initialization, delayed transitions, `opacity-0`, `hidden`, `x-show="false"`, off-screen transforms, or callbacks.
- Reduced motion leaves content visible and does not break UI state such as `x-show`.
- Clean up shared observers, timers, listeners, and animation runtimes in the owning component's lifecycle.
