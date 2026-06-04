# Motion Architecture Reference

This reference stores motion architecture details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing animation, transitions, GSAP choreography, motion policy, motion tokens or presets, reduced-motion behavior, or motion cleanup.

## Motion Goals

1. Preserve one semantic entry point for motion decisions.
2. Keep animation reusable without forcing every animation into one technology.
3. Make future global motion settings possible without scanning scattered duration/ease/transform values.
4. Prevent Alpine, Tailwind/CSS, and GSAP from competing for the same element properties.

## Motion Classification

Before changing animation, classify it as one of:

| Layer                   | Purpose                                            | Owner / Location                                                               |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| Capability              | Low-level motion ability                           | `tailwind/tailwind.animates.css`                                               |
| State motion recipe     | Named open/close, show/hide, active/loading motion | Motion transition presets, exposed through `snippets/motion-transition.liquid` |
| Choreography recipe     | Named scroll, stagger, reveal, timeline motion     | `window.__Theme__.Motion` / GSAP presets                                       |
| Usage                   | When a specific component or section should move   | Liquid templates, Alpine components, or `Components.register()` lifecycle code |

## Capability Layer

Capabilities are low-level CSS primitives. They answer "what can CSS do?" rather than "how should this UI pattern move?"

Allowed in `tailwind/tailwind.animates.css`:

- motion CSS variables and foundation tokens
- `@keyframes`
- animation utility classes
- hover/focus micro-motion utilities
- pause/running helpers
- loader, spinner, and decorative loop utilities

Capability utilities SHOULD use the `motion-*` naming namespace for new code.

Existing non-`motion-*` utilities MAY remain as legacy aliases during migration, but new code SHOULD NOT introduce more non-`motion-*` animation utilities.

## State Motion Recipe Layer

State motion recipes describe reusable UI state transitions. They answer "how should this UI pattern move when state changes?"

Examples:

- `fade`
- `dropdown`
- `modal`
- `drawer-left`
- `drawer-right`
- `toast`
- `accordion`
- `loading`

State motion recipes are consumed by Alpine/CSS state changes such as:

- open / close
- active / inactive
- expanded / collapsed
- loading / idle
- visible / hidden

Repeated Alpine `x-transition:*` attribute groups SHOULD be replaced with a named motion recipe. New reusable Alpine/CSS state motion MUST NOT duplicate raw duration/ease/opacity/transform groups in Liquid when an existing recipe covers the behavior.

Preferred template usage:

```liquid
<div
    x-show='open'
    {% render 'motion-transition', preset: 'dropdown' %}
></div>
```

`snippets/motion-transition.liquid` owns the mapping from preset name to Alpine `x-transition:*` attributes. `tailwind/tailwind.animates.css` owns the CSS classes used by those phase attributes.

## Choreography Recipe Layer

Choreography recipes describe visual direction and page-level motion. They answer "how should this content be staged over time or scroll?"

Use GSAP for:

- scroll-triggered section reveal
- staggered cards or list items
- image reveal choreography
- parallax
- timeline sequences
- hero or campaign-style motion
- brand-level site motion

Reusable GSAP motion SHOULD live under `window.__Theme__.Motion` once the motion runtime exists. Until then, local GSAP in a section is allowed when the animation is one-off.

GSAP recipes MUST be initialized through `Components.register()` and cleaned up in `destroy()`. The component lifecycle owns when GSAP starts and stops; the motion recipe owns animation values.

Available choreography recipes:

| Recipe         | Namespace                          | Description                       | Status |
| -------------- | ---------------------------------- | --------------------------------- | ------ |
| `scrollReveal` | `Motion.scrollReveal(el, options)` | Scroll-triggered staggered reveal | Active |
| `heroReveal`   | `Motion.heroReveal(el, options)`   | Hero + badge entrance animation   | Active |

## Execution Layer Boundaries

Use this decision tree:

1. Hover/focus, loader, decorative loop, pause/running state -> CSS capability utility in `tailwind/tailwind.animates.css`.
2. Open/close, show/hide, active/inactive, loading visibility -> Alpine/CSS state motion recipe.
3. Scroll, reveal, stagger, parallax, timeline, hero/brand motion -> GSAP choreography recipe.
4. One-off complex section animation -> local GSAP inside that section's `{%- javascript -%}` block, still using `Components.register()` and cleanup.
5. Repeated section animation or global motion language -> shared GSAP recipe under `window.__Theme__.Motion`.

## Page-Type Motion Policy

Conversion pages such as product, collection, search, cart, and checkout-adjacent flows SHOULD use restrained motion: state transitions, interaction feedback, media controls, and below-the-fold reveal only.

Home, brand, editorial, campaign, and storytelling pages MAY use richer GSAP choreography when no critical first-viewport content is hidden before JavaScript, no LCP candidate waits for animation, reduced motion is respected, keyboard and screen-reader access remain intact, and the animation is registered and cleaned up through `Components.register()`.

## Token And Preset Rules

Do not over-tokenize motion. Tokens are for shared foundation values, not every component detail.

Foundation motion tokens MAY include:

- duration: `fast`, `base`, `slow`
- easing: `standard`, `enter`, `exit`, `linear`
- distance: `sm`, `md`
- scale: `subtle`, `pop`
- stagger: `sm`, `md`

A value SHOULD become a token only when it is reused across multiple recipes, consumed by both CSS and JS, or expected to be affected by global motion settings.

Component-specific values SHOULD stay inside the named recipe until a real reuse pattern exists. Do not create tokens like `--motion-dropdown-y` or `--motion-toast-scale` unless they are intentionally part of the stable motion contract.

## User Configuration Boundary

Merchant-facing motion settings SHOULD control policy, not low-level implementation details.

Allowed future global settings:

- `motion_enabled`
- `motion_speed`
- `motion_intensity`
- `micro_motion_enabled`
- `scroll_motion_enabled`

Do not expose low-level implementation values such as GSAP easing names, ScrollTrigger start/end positions, individual element offsets, per-element timeline delays, or raw stagger amounts.

## Migration Rules

Motion cleanup MUST be staged:

1. Audit current motion usage before refactoring.
2. Group findings as CSS capabilities, Alpine/state recipes, GSAP/choreography, and mixed-ownership risks.
3. Create or reuse named state motion recipes before replacing repeated Alpine transition groups.
4. Rename CSS animation utilities toward `motion-*` with legacy aliases when needed.
5. Introduce shared GSAP recipes only after at least three real usages or when the animation is clearly part of the global motion language.
6. Add merchant-facing global motion settings only after the relevant recipes and tokens exist.

During cleanup, preserve visual behavior unless the task explicitly asks to redesign motion.

## Duplication Detection

This table lists repeated patterns to check before adding another copy. It is a pre-flight checklist, not an automatic abstraction trigger.

| Repeated pattern to check before adding another copy                        | Destination                                | Namespace                    |
| --------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| Alpine `x-transition:*` attribute group already defined elsewhere           | `snippets/motion-transition.liquid` preset | `motion-transition` snippet  |
| CSS `@keyframes`, `animation-*`, or phase class already defined elsewhere   | `tailwind/tailwind.animates.css`           | `motion-*` utility namespace |
| GSAP reveal, stagger, timeline, or parallax logic already defined elsewhere | `window.__Theme__.Motion` recipe           | `Motion.*` method            |

One-off section choreography MAY remain local in that section's `{%- javascript -%}` block, but it MUST still be lifecycle-scoped through `Components.register()` with proper `destroy()` cleanup.

## Shared Recipe Trigger Conditions

Creating a new shared recipe, preset, or utility requires architectural justification. A motion pattern SHOULD become a shared recipe when any of the following apply:

1. Three or more current consumers: the pattern is already repeated across at least three real sections or components.
2. Global motion language: the pattern defines a brand-level or site-wide motion behavior.
3. Settings or policy interference: scattered raw values would complicate future global motion settings or `prefers-reduced-motion` enforcement.
4. Ownership, lifecycle, or stability risk: scattered implementations create unclear ownership, unpredictable cleanup, cross-section regression risk, or launch stability concerns.

Two consumers is coincidence; three is a pattern. But even two consumers may justify extraction when global language, policy interference, or stability risk applies.

## Motion Encapsulation As Architecture Stability

Motion encapsulation is an architecture stability rule, not a style preference. It exists to guarantee that motion behavior can be governed, audited, and evolved without cascading side effects.

When evaluating whether a motion pattern is properly encapsulated, audit against these criteria:

| Criterion                | What to verify                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Change control           | Can duration, easing, distance, stagger, and reduced-motion behavior be adjusted in one stable location?                                                          |
| Policy control           | Can future global settings (`motion_enabled`, `motion_speed`, `motion_intensity`, `micro_motion_enabled`, `scroll_motion_enabled`) uniformly control this motion? |
| Ownership clarity        | Is it clear who owns `opacity`, `transform`, `visibility`, `height`, and `display` -- CSS, Alpine, or GSAP? Are there conflicts?                                  |
| Lifecycle safety         | Can listeners, timelines, ScrollTrigger instances, timers, and state transitions be predictably cleaned up in `destroy()`?                                        |
| Regression isolation     | Does modifying motion in one section risk breaking other sections, or require synchronized changes in multiple places?                                            |
| Launch stability         | Does the motion affect `visibility`, accessibility, LCP, CLS, keyboard access, or mobile behavior?                                                                |

If any criterion fails, the motion pattern needs better encapsulation even if it is not duplicated.

## Progressive Enforcement

- Touched and new motion code SHOULD comply with duplication detection and encapsulation rules immediately.
- Legacy repeated animations that are not being modified for the current task MAY be classified as warning or post-launch debt.
- Duplication or encapsulation issues escalate from warning to now/blocker when they affect visibility, accessibility, Lighthouse scores, runtime stability, mobile layout, or production behavior.
- Do not require immediate refactoring of all historical motion code in one pass.

## External GSAP Skills

Official or external GSAP skills MAY be used as technical references for GSAP API behavior and recommended choreography patterns.

Read `docs/references/agent-workflow/external-skills.md` before using `greensock/gsap-skills` or any other external GSAP skill. External GSAP recommendations must map back to this theme's lifecycle, motion runtime, cleanup, no-JS visibility, reduced-motion, and launch-readiness rules.
