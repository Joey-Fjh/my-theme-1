# Motion Architecture Reference

This reference stores motion architecture details that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing animation, transitions, GSAP choreography, motion policy, motion tokens or presets, reduced-motion behavior, or motion cleanup.

## Motion Goals

1. Preserve one semantic entry point for motion decisions.
2. Keep animation reusable without forcing every animation into one technology.
3. Make future global motion settings possible without scanning scattered duration/ease/transform values.
4. Prevent Alpine, Tailwind/CSS, and GSAP from competing for the same element properties.

## Architecture Overview

Ordinary animation is **CSS/Alpine-first**:

- **Alpine** owns when / state / trigger.
- **tailwind.animates.css** owns how / animation capability.
- **GSAP** is optional advanced narrative choreography only.

### Ownership Table

| Layer | Owns | Does not own | Examples |
| --- | --- | --- | --- |
| CSS capability (`tailwind.animates.css`) | Tokens, keyframes, animation classes, reveal behavior, reduced-motion and motion-disabled kill rules | Section business structure, trigger logic, state management | `[data-motion-reveal]` rules, `animate-spin-slow`, icon animations, spinners, pulses |
| Alpine components | UI state, trigger behavior, open/close/show/hide/active/loading visibility, ordinary reveal state changes | Animation keyframes, animation values | `x-show`, shared `IntersectionObserver`, `data-motion-state` |
| GSAP / ScrollTrigger | Complex narrative choreography: timeline, parallax, scrub, split text, coordinated storytelling | Ordinary content/media reveal, simple fade/rise/zoom, card entrance | Homepage hero timeline, scroll-linked parallax, brand-level site motion |

### Decision Rules

| Motion need | Default path | Do not |
| --- | --- | --- |
| Hover/focus, loader, decorative loop, pause/running | CSS capability utility | GSAP |
| Open/close, show/hide, active/inactive, loading visibility | Alpine state + direct CSS/state classes when needed | GSAP, restored `motion-transition` |
| Ordinary content/media reveal across sections | Alpine component with shared `IntersectionObserver` + CSS rules in `tailwind.animates.css` | GSAP |
| Complex narrative choreography (parallax, scrub, timeline, split text, coordinated storytelling) | GSAP — only after explicit classification | — |

### Motion Setting Boundary

`motion_enabled` and `body[data-motion-enabled='false']` are the merchant-facing gate for page and brand motion: section reveal, media reveal, scroll motion, and approved narrative choreography.

Do not use `body[data-motion-enabled='false']` as a blanket kill switch for state or micro interactions. Hover/focus feedback, button interactions, dropdown open/close, dialog open/close, drawer open/close, loading states, and other UI state transitions should remain functionally expressive when merchant page motion is disabled.

`motion_speed` is scoped to page and brand reveal timing. It should drive reveal-specific tokens such as `--motion-reveal-duration-base`, `--motion-reveal-stagger`, and `--motion-reveal-distance`. Do not wire it to hover, focus, panel, drawer, dialog, loading, or other state/micro interaction timings.

State and micro interactions must still respect `@media (prefers-reduced-motion: reduce)`. When an interaction uses noticeable translate, scale, parallax, or origin-based FLIP motion, reduced motion should degrade it to opacity-only or immediate state change while preserving visibility, focus, keyboard behavior, and close/open state.

If merchants later need control over micro interactions, introduce a separate policy setting such as `micro_motion_enabled`; do not expand `motion_enabled` beyond page and brand motion.

### Conflict Rule

Alpine/CSS and GSAP **must not** control `opacity` or `transform` on the same element. Choose one ownership path per element.

### GSAP Removal Rule

GSAP vendor/runtime may be removed entirely if no approved narrative choreography remains in the theme.

## CSS Capability Layer

Capabilities are low-level CSS primitives. They answer "what can CSS do?" rather than "how should this UI pattern move?"

Allowed in `tailwind/tailwind.animates.css`:

- motion CSS variables and foundation tokens
- `@keyframes`
- animation utility classes
- current reveal rules and approved animation utilities
- functional hover/focus feedback utilities when they are not part of the visual motion language
- text/media reveal classes
- icon animations, spinners, pulses
- pause/running helpers
- loader, spinner, and decorative loop utilities
- reduced-motion and motion-disabled kill rules

Capability utilities SHOULD use semantic data hooks or a clear motion namespace for new code. Do not recreate the removed legacy `motion-*` state transition recipe layer.

`tailwind.animates.css` also owns the global setting selectors that map body-level page and brand motion settings to CSS behavior, for example `body[data-content-reveal-style]`, `body[data-media-reveal-style]`, `body[data-motion-enabled]`, and `@media (prefers-reduced-motion: reduce)`. `body[data-motion-enabled]` should target reveal, media reveal, scroll, and narrative motion only; state and micro interaction recipes should use `@media (prefers-reduced-motion: reduce)` unless a future dedicated micro-motion setting is approved.

`tailwind.animates.css` does not own section business structure or trigger logic. It may style `[data-motion-reveal]` targets, but it must not require section templates to consume long internal utility class combinations for ordinary reveal.

## Ordinary Reveal Layer

Ordinary section content/media reveal should use declarative data hooks plus a lightweight Alpine component. It should not use GSAP, and it should not use `snippets/motion-transition.liquid`.

Recommended DOM contract:

```liquid
<section x-data="motionRevealSection()" data-motion-section>
    <div data-motion-reveal="content">
        ...
    </div>

    <div data-motion-reveal="media">
        ...
    </div>
</section>
```

Recommended runtime contract:

- Each `x-data="motionRevealSection()"` creates an independent Alpine instance on the section root (`data-motion-section`).
- The section instance owns lifecycle only: `init()` / `destroy()`, Theme Editor replay, `motion_enabled` / reduced-motion guards, and target registration.
- The implementation uses a module-level shared `IntersectionObserver` singleton with a `WeakMap` registry from target element to callback.
- Each visible `[data-motion-reveal]` target is observed individually — not the section root.
- Default reveal behavior aligns with **Dawn once**: `body[data-reveal-behavior='once']` (default) reveals each target once, then unobserves it.
- `body[data-reveal-behavior='always']` keeps observing: leaving the viewport resets a target to `pending`; re-entry replays. `motion_enabled=false` and `prefers-reduced-motion` skip replay and show content immediately.
- If motion is disabled, reduced motion is preferred, or `IntersectionObserver` is unavailable, all eligible targets receive `data-motion-state="revealed"` immediately.
- Initial target registration runs after Alpine's first DOM update so tab panels can settle their `x-show` / `x-cloak` state before reveal scans. Targets inside `display: none` / `visibility: hidden` ancestors (inactive tab panels) are not observed and are not revealed early; tab clicks within the section trigger a rescan to register newly visible targets.
- Non-cascade targets default to `--motion-index: 0`. Use `[data-motion-cascade]` on a container to auto-assign `0..n` to visible descendant `[data-motion-reveal]` targets (DOM order). Explicit `data-motion-index` on a target always wins. Hidden cascade children are skipped.

### Trigger Behavior

- The shared `IntersectionObserver` uses `rootMargin: '0px 0px -15% 0px'` and `threshold: 0.12`. Each target reveals when **it** crosses the inset viewport (Dawn-style per-element trigger), not when the section root intersects.
- HTML renders visible by default; Alpine sets `data-motion-state="pending"` on each observed target only after init, so no-JS and pre-init states remain safe.
- **Page-load reveal:** targets already intersecting when registered (hero copy, above-the-fold blocks) are not revealed in the same frame as `pending`. Registration sets `_deferToPageLoadFlush` before `observe()` so synchronous IO callbacks cannot skip the paint frame. After double `requestAnimationFrame`, in-view pending targets reveal with `48ms` base delay plus cascade stagger (`--motion-index × --motion-reveal-stagger`). Scroll-in targets still reveal from `IntersectionObserver` when entering view.
- Sections with critical LCP or carousel media may opt media out with `data-motion-media="static"` on the section root; JS skips observing those media targets and CSS keeps them static. Pass `motion_reveal: false` on hero images when the section root is static.

### Cascade (`data-motion-cascade`)

- Add `data-motion-cascade` on a visible wrapper (product grid, tab panel product area, card list).
- `motionRevealSection()` assigns `--motion-index` `0, 1, 2…` to visible `[data-motion-reveal]` descendants in DOM order inside that wrapper.
- Inactive tab panels (`display: none`) are excluded from indexing and registration until the panel becomes visible.
- Stagger delay applies at reveal time. Page-load reveal uses each target's `--motion-index`; scroll-in reveal batches targets that enter in the same frame and staggers that batch from `0..n`, using the cascade wrapper's inherited `--motion-reveal-stagger`. Runtime delay is capped so long grids do not become sluggish.
- Do not nest cascade containers unless intentional. Do not wrap conversion controls.

### Reveal behavior (`reveal_behavior`)

| Value | Behavior | Dawn alignment |
| --- | --- | --- |
| `once` (default) | Target reveals once, then `unobserve` | Matches Dawn scroll-trigger default |
| `always` | Target resets to `pending` when leaving viewport; re-entry replays | Optional merchant setting |

Setting: `config/settings_schema.json` → `body[data-reveal-behavior]` in `layout/theme.liquid`. Do not read merchant `settings_data.json` in theme code beyond Liquid `settings.*`.

### Reveal Speed Tokens (`motion_speed`)

`motion_speed` drives reveal-only CSS variables in `snippets/css-variables.liquid`. It does not affect hover, panel, drawer, dialog, or loading timings.

| Setting | `--motion-reveal-duration-base` | `--motion-reveal-stagger` | `--motion-reveal-distance` |
| --- | --- | --- | --- |
| `fast` | 400ms | 60ms | 1.5rem |
| `normal` (default) | 650ms | 100ms | 2.5rem |
| `slow` | 950ms | 130ms | 3rem |

`tailwind/tailwind.animates.css` consumes these tokens for content fade/rise and media fade/zoom. Content rise uses opacity + `translate3d` on Y; media zoom scales from `0.88` to `1` with `transform-origin: center`.

### Settings → Consumption Chain

```text
config/settings_schema.json (motion_enabled, motion_speed, content_reveal_style, media_reveal_style, reveal_behavior)
  → layout/theme.liquid body[data-motion-enabled], body[data-content-reveal-style], body[data-media-reveal-style], body[data-reveal-behavior]
  → snippets/css-variables.liquid (--motion-reveal-* tokens from motion_speed)
  → assets/alpine.components.ui.js motionRevealSection() (per-target IntersectionObserver, target data-motion-state, --motion-index)
  → tailwind/tailwind.animates.css ([data-motion-reveal][data-motion-state] × body reveal style)
  → sections/snippets hooks (data-motion-section root, coarse data-motion-reveal targets)
```

### Consumption Granularity

- Section root: `x-data="motionRevealSection()"` + `data-motion-section` (lifecycle only).
- Coarse targets: `data-motion-reveal="content"` / `"media"` on headline blocks, grid shells, image columns — not every heading, button, or icon.
- Stable components (`product-card`, `image.liquid`) may own internal hooks; pass `motion_reveal: false` on nested images when a parent shell already owns media reveal.
- Skip reveal on conversion controls, tab triggers, slider handles, and embeds such as `google-map` iframe sections.
- Registration skips targets inside `display: none` / `visibility: hidden` ancestors; tab clicks rescan for newly visible panel targets.
- Product grids / tab panels: use `data-motion-cascade` on the grid wrapper so `product-card` reveal hooks stagger per card.

### Theme Editor Preview

- `motionRevealSection()` does NOT skip animation in `designMode`. Merchants can preview reveal effects in the Theme Editor.
- On `shopify:section:select`, the component replays the reveal for the selected section only. This is scoped via `event.detail.sectionId` matching `data-section-id`, with DOM containment as fallback.
- On `shopify:section:reorder`, the component replays the reveal for the matching section only; reorder may change viewport position, so the section re-enters the observer path.
- Editor event listeners use `ThemeEvents.on()` with cleanup in `destroy()`. No bare `document.addEventListener` calls.
- `motion_enabled=false`, `prefers-reduced-motion`, and no-IntersectionObserver guards still apply in design mode.

Recommended CSS contract:

- HTML should render visible by default without JavaScript.
- Alpine sets `data-motion-state="pending"` on each observed target only after initialization, so no-JS content remains visible.
- `tailwind.animates.css` owns selectors such as:
  - `[data-motion-reveal='content'][data-motion-state='pending']`
  - `[data-motion-reveal='content'][data-motion-state='revealed']`
  - `[data-motion-reveal='media'][data-motion-state='pending']`
  - `[data-motion-reveal='media'][data-motion-state='revealed']`
  - `body[data-content-reveal-style='...']` and `body[data-media-reveal-style='...']` for reveal type
- Global motion setting effects should be expressed in CSS through body data attributes and motion variables, not through per-section GSAP timelines.

`x-intersect` MAY be used for isolated simple cases, but it is not the preferred architecture for ordinary reveal coverage. The preferred architecture is one shared observer behind the Alpine component, rather than many scattered `x-intersect` directives.

## Motion Hook Ownership And Granularity

Motion hooks are semantic component contracts, not caller-managed parameters.

- Media primitives such as `snippets/image.liquid` should own `data-motion-reveal="media"` internally by default.
- Stable content components such as product cards, article cards, collection cards, testimonial cards, and promotion cards MAY own internal `data-motion-reveal="content"` hooks for their own stable content regions.
- Layout, control, form, drawer, dialog, filter, search, cart, pagination, and button/link primitives should not output reveal hooks by default.
- Sections and theme blocks own the reveal root (`x-data="motionRevealSection()" data-motion-section`) and broad content grouping hooks.
- Do not expose generic motion parameters such as `motion`, `enable_reveal`, or `motion_type` unless a real reusable exception is approved.
- Prefer coarse reveal targets: content groups, media components, and stable card regions. Do not add reveal hooks to every heading, paragraph, icon, or button.
- Avoid placing a broad parent `data-motion-reveal` around child components that already own reveal hooks; parent/child opacity or transform stacking can make animation timing look inconsistent.
- Conversion-critical controls and merchant-owned custom content should not be reveal targets by default.

## Removed State Motion Recipe Layer

`snippets/motion-transition.liquid` and the old `motion-*` enter/leave recipe classes have been removed.

Do not restore this layer, replace it with scattered `x-transition:*`, or use historical preset examples as a template for new motion work.

Stateful UI such as dropdowns, drawers, tabs, toast visibility, loading visibility, and dialogs should keep functional state logic simple. Add motion back only through an explicit global data-hook and `tailwind.animates.css` contract.

Ordinary section content/media reveal must use the documented CSS/Alpine reveal pattern.

## Optional GSAP Narrative Layer

The current theme has no active GSAP runtime or project consumers. Do not reintroduce GSAP during ordinary Motion cleanup.

GSAP remains an explicitly approved future option only for complex narrative choreography such as parallax, scrubbed timelines, split text, or coordinated storytelling. It is invalid for simple fade, rise, zoom, card entrance, content reveal, or media reveal.

If GSAP is ever approved again, the implementation must follow `AGENTS.md`: use `Components.register()`, scope triggers to the component root, clean up in `destroy()`, respect reduced motion, and keep no-JS critical content visible.

## Execution Layer Boundaries

Use this decision tree:

1. Hover/focus, loader, decorative loop, pause/running state -> CSS capability utility in `tailwind/tailwind.animates.css`.
2. Open/close, show/hide, active/inactive, loading visibility -> Alpine state + direct CSS/state classes only when needed. Do not restore `motion-transition`.
3. Ordinary section content/media reveal -> `data-motion-reveal` hooks + Alpine component with shared `IntersectionObserver` + CSS rules in `tailwind.animates.css`. NOT GSAP.
4. Complex narrative choreography (parallax, scrub, timeline, split text, coordinated storytelling) -> GSAP, only after classification confirms narrative value.
5. One-off complex section animation -> only after explicit approval, with a dedicated runtime contract documented in the same change.
6. Repeated section animation or global motion language -> prefer the current data-hook CSS/Alpine chain; do not resurrect the removed `Motion.*` runtime by default.

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

`motion_enabled` is scoped to page and brand motion. It should disable or simplify section reveal, media reveal, scroll motion, and narrative choreography. It should not disable ordinary hover/focus feedback, dropdowns, dialogs, drawers, loading states, or other UI state and micro interactions.

`prefers-reduced-motion` is the baseline accessibility control for both page/brand motion and state/micro interactions. State and micro interaction recipes that use noticeable movement must provide a reduced-motion branch even when they do not read `motion_enabled`.

Allowed future global settings:

- `motion_enabled`
- `motion_speed`
- `motion_intensity`
- `reveal_behavior`
- `micro_motion_enabled`
- `scroll_motion_enabled`

Do not expose low-level implementation values such as GSAP easing names, ScrollTrigger start/end positions, individual element offsets, per-element timeline delays, or raw stagger amounts.

## Migration Rules

Motion cleanup MUST be staged:

1. Audit current motion usage before refactoring.
2. Group findings as CSS capabilities, Alpine/state recipes, GSAP/choreography, and mixed-ownership risks.
3. Keep `motion-transition` removed; do not introduce replacement preset snippets or scattered `x-transition:*`.
4. Build ordinary content/media reveal around data hooks, a shared-observer Alpine component, and CSS rules in `tailwind.animates.css`.
5. Remove scattered visual motion that bypasses the global data-hook chain, or connect it through semantic component/section hooks.
6. Introduce shared GSAP recipes only after explicit narrative classification and explicit approval.
7. Add merchant-facing global motion settings only after the relevant CSS/Alpine consumers and tokens exist.

During cleanup, preserve visual behavior unless the task explicitly asks to redesign motion.

## Duplication Detection

This table lists repeated patterns to check before adding another copy. It is a pre-flight checklist, not an automatic abstraction trigger.

| Repeated pattern to check before adding another copy                        | Destination                                | Namespace                    |
| --------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| Repeated visual state motion                                                | Explicit data-state/data-motion contract in `tailwind/tailwind.animates.css`; do not restore `motion-transition` | State motion |
| Ordinary content/media reveal hook already exists                           | Shared Alpine reveal component + `tailwind.animates.css` | `data-motion-reveal` |
| CSS `@keyframes`, `animation-*`, or phase class already defined elsewhere   | `tailwind/tailwind.animates.css`           | `motion-*` utility namespace |
| Approved narrative timeline/parallax/scrub need                             | Dedicated future runtime contract; not the removed `Motion.*` path | Explicit narrative runtime |

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

## Performance And Reduced Motion Rules

- Prefer opacity and transform for visual motion; avoid layout-changing animation properties.
- Critical first-viewport content must render visible without JavaScript or animation completion.
- Reduced motion and `body[data-motion-enabled='false']` must leave content visible and must not break UI state such as `x-show`.
- `body[data-motion-enabled='false']` is not a blanket kill rule for state or micro interactions. Hover/focus, dropdown, dialog, drawer, and loading motion should remain governed by their state contract and `prefers-reduced-motion` unless a dedicated micro-motion setting is approved.
- Shared observers, timers, listeners, or animation runtimes must be cleaned up through the owning component lifecycle.
- Do not add cookbook examples for inactive runtimes to this file. Add future runtime-specific guidance only when that runtime is approved and active again.
