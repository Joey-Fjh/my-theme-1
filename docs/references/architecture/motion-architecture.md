# Motion Architecture Reference

This reference stores motion decision boundaries that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing animation, transitions, GSAP choreography, motion policy, motion tokens or presets, reduced-motion behavior, or motion cleanup.

Inspect current source for exact selectors, timing values, observer tuning, and runtime internals.

## Motion Goals

1. Preserve one semantic entry point for motion decisions.
2. Keep animation reusable without forcing every animation into one technology.
3. Make future global motion settings possible without scattering raw duration/ease/transform values.
4. Prevent Alpine, Tailwind/CSS, and GSAP from competing for the same element properties.

## Ownership

| Layer | Owns | Does not own |
| --- | --- | --- |
| CSS capability (`tailwind.animates.css`) | Tokens, keyframes, animation classes, reveal behavior, reduced-motion and motion-disabled kill rules | Section business structure, trigger logic, state management |
| Alpine components | UI state, trigger behavior, open/close/show/hide/active/loading visibility, ordinary reveal state changes | Animation keyframes, animation values |
| GSAP / ScrollTrigger | Complex narrative choreography: timeline, parallax, scrub, split text, coordinated storytelling | Ordinary content/media reveal, simple fade/rise/zoom, card entrance |

## Decision Rules

| Motion need | Default path | Do not |
| --- | --- | --- |
| Hover/focus, loader, decorative loop, pause/running | CSS capability utility | GSAP |
| Open/close, show/hide, active/inactive, loading visibility | Alpine state + direct CSS/state classes when needed | GSAP, restored `motion-transition` |
| Ordinary content/media reveal across sections | Alpine component with shared `IntersectionObserver` + CSS rules in `tailwind.animates.css` | GSAP |
| Complex narrative choreography | GSAP only after explicit classification and approval | — |

## Motion Setting Boundary

`motion_enabled` and `body[data-motion-enabled='false']` gate page and brand motion: section reveal, media reveal, scroll motion, and approved narrative choreography.

Do not use `body[data-motion-enabled='false']` as a blanket kill switch for hover, focus, dropdown, dialog, drawer, loading, or other state/micro interactions. Those interactions must respect `prefers-reduced-motion`.

`motion_speed` is scoped to page and brand reveal timing. Do not wire it to hover, focus, panel, drawer, dialog, loading, or other state/micro interaction timings.

State and micro interactions must still respect `@media (prefers-reduced-motion: reduce)`.

## Conflict Rule

Alpine/CSS and GSAP must not control `opacity` or `transform` on the same element. Choose one ownership path per element.

## Ordinary Reveal Contract

Ordinary section content/media reveal uses:

- section root: `x-data="motionRevealSection()"` + `data-motion-section`
- targets: `data-motion-reveal="content"` / `"media"` and optional `data-motion-copy`
- stable geometry: `data-motion-bound` / `data-motion-copy-bound` when transforms would destabilize observation
- repeated layouts: `data-motion-cascade` and optional `data-motion-sequence`
- state: `data-motion-state`, `data-motion-resetting`, `data-motion-staging`
- policy: `body[data-motion-enabled]`, `body[data-content-reveal-style]`, `body[data-media-reveal-style]`, `body[data-reveal-behavior]`

Rules:

- HTML renders visible by default; do not hide critical first-viewport content behind animation completion.
- Do not restore `snippets/motion-transition.liquid` or scattered `x-transition:*` recipes for ordinary state motion.
- `x-intersect` may be used for isolated simple cases; the preferred architecture is one shared observer behind the Alpine behavior.
- Inspect `assets/alpine.components.ui.js` and `tailwind/tailwind.animates.css` for current runtime behavior.

## Motion Hook Ownership

- Media primitives such as `snippets/image.liquid` may own `data-motion-reveal="media"` internally by default.
- Stable content components may own internal `data-motion-reveal="content"` hooks for their own stable regions.
- Layout, control, form, drawer, dialog, filter, search, cart, pagination, and button/link primitives should not output reveal hooks by default.
- Sections own the reveal root and broad content grouping hooks.
- Conversion-critical controls and merchant-owned custom content should not be reveal targets by default.

## GSAP Boundary

The current theme has no active GSAP runtime or project consumers. Do not reintroduce GSAP during ordinary motion cleanup.

GSAP remains an explicitly approved future option only for complex narrative choreography. If approved again, use `Components.register()`, scope triggers to the component root, clean up in `destroy()`, respect reduced motion, and keep no-JS critical content visible.

## Page-Type Policy

Conversion pages such as product, collection, search, cart, and checkout-adjacent flows should use restrained motion: state transitions, interaction feedback, media controls, and below-the-fold reveal only.

Home, brand, editorial, campaign, and storytelling pages may use richer choreography when no critical first-viewport content is hidden before JavaScript, no LCP candidate waits for animation, reduced motion is respected, and keyboard and screen-reader access remain intact.

## Token And Preset Rules

Do not over-tokenize motion. Tokens are for shared foundation values reused across multiple recipes or expected to be affected by global motion settings. Component-specific values stay inside the owning recipe until a real reuse pattern exists.

Merchant-facing motion settings should control policy, not low-level implementation details such as GSAP easing names, ScrollTrigger start/end positions, or raw stagger amounts.

## Migration And Duplication

Motion cleanup must be staged:

1. Audit current motion usage before refactoring.
2. Group findings as CSS capabilities, Alpine/state recipes, GSAP/choreography, and mixed-ownership risks.
3. Keep `motion-transition` removed.
4. Build ordinary content/media reveal around data hooks, a shared-observer Alpine component, and CSS rules in `tailwind.animates.css`.
5. Preserve visual behavior unless the task explicitly asks to redesign motion.

Before adding another copy of a motion pattern, inspect whether an existing capability utility, reveal hook, or approved runtime contract already owns it.

## Performance And Reduced Motion

- Prefer opacity and transform for visual motion; avoid layout-changing animation properties.
- Critical first-viewport content must render visible without JavaScript or animation completion.
- Reduced motion and `body[data-motion-enabled='false']` must leave content visible and must not break UI state such as `x-show`.
- Shared observers, timers, listeners, or animation runtimes must be cleaned up through the owning component lifecycle.
