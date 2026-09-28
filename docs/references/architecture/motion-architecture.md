# Motion Architecture Reference

This reference stores motion decision boundaries that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing animation, transitions, GSAP choreography, motion policy, motion tokens or presets, reduced-motion behavior, or motion cleanup.

Inspect current source for exact selectors, timing values, and runtime internals.

The mother template ships one loading recipe: `.spinner` / `.spinner-lg` in `tailwind/tailwind.animates.css`, used by `snippets/buy-buttons.liquid` and `snippets/loading.liquid`. Derived themes add further recipes under this policy.

## Motion Goals

1. Preserve one semantic entry point for motion decisions.
2. Keep animation reusable without forcing every animation into one technology.
3. Make future global motion settings possible without scattering raw duration/ease/transform values.
4. Prevent Alpine, Tailwind/CSS, and GSAP from competing for the same element properties.

## Ownership

| Layer | Owns | Does not own |
| --- | --- | --- |
| CSS capability (`tailwind.animates.css`) | Tokens, keyframes, animation classes, reduced-motion rules | Section business structure, trigger logic, state management |
| Alpine components | UI state, trigger behavior, open/close/show/hide/active/loading visibility | Animation keyframes, animation values |
| GSAP / ScrollTrigger | Complex narrative choreography: timeline, parallax, scrub, split text, coordinated storytelling | Ordinary storefront motion unless explicitly classified |

## Decision Rules

| Motion need | Default path | Do not |
| --- | --- | --- |
| Hover/focus, loader, decorative loop, pause/running | CSS capability utility | GSAP |
| Open/close, show/hide, active/inactive, loading visibility | Alpine state + direct CSS/state classes when needed | GSAP, `x-transition` (`lint:theme`) |
| Section or media reveal | Derived theme defines it under this policy | GSAP unless classified as complex choreography |
| Complex narrative choreography | GSAP only after explicit classification and approval | — |

## Conflict Rule

Alpine/CSS and GSAP must not control `opacity` or `transform` on the same element. Choose one ownership path per element.

## Drawer And Overlay Motion

The mother template ships no drawer or dialog overlay. Derived themes that add one own its motion under the existing `prefers-reduced-motion` policy and must not rely on removed drawer infrastructure from this repository.

## GSAP Boundary

The current theme has no active GSAP runtime or project consumers. Do not reintroduce GSAP during ordinary motion cleanup.

GSAP remains an explicitly approved future option only for complex narrative choreography. If approved again, register factories through `define()` on a `data-module-id` entry module, scope triggers to the component root, clean up in `destroy()`, respect reduced motion, and keep no-JS critical content visible.

## Page-Type Policy

Conversion pages such as product, collection, search, cart, and checkout-adjacent flows should use restrained motion: state transitions, interaction feedback, media controls, and below-the-fold motion only when a derived theme adds it.

Home, brand, editorial, campaign, and storytelling pages may use richer choreography when no critical first-viewport content is hidden before JavaScript, no LCP candidate waits for animation, reduced motion is respected, and keyboard and screen-reader access remain intact.

## Token And Preset Rules

Do not over-tokenize motion. Tokens are for shared foundation values reused across multiple recipes or expected to be affected by global motion settings. Component-specific values stay inside the owning recipe until a real reuse pattern exists.

Merchant-facing motion settings should control policy, not low-level implementation details such as GSAP easing names, ScrollTrigger start/end positions, or raw stagger amounts.

Before adding another copy of a motion pattern, inspect whether an existing capability utility or approved runtime contract already owns it.

## Performance And Reduced Motion

- Prefer opacity and transform for visual motion; avoid layout-changing animation properties.
- Critical first-viewport content must render visible without JavaScript or animation completion.
- Do not hide critical first-viewport content behind GSAP, Alpine, Swiper initialization, delayed transitions, `opacity-0`, `hidden`, `x-show="false"`, off-screen transforms, or callbacks.
- Reduced motion must leave content visible and must not break UI state such as `x-show`.
- Shared observers, timers, listeners, or animation runtimes must be cleaned up through the owning component lifecycle.
