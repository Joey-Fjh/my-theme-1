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
| CSS capability (`tailwind.animates.css`) | Tokens, keyframes, transition/animation classes, motion phase classes, reduced-motion and motion-disabled kill rules | Section business structure, trigger logic, state management | `motion-fade-*`, `animate-spin-slow`, hover/focus micro-motion, icon animations, spinners, pulses |
| Alpine components | UI state, trigger behavior, open/close/show/hide/active/loading transitions, ordinary reveal state changes | Animation keyframes, animation values | `x-show`, `x-transition`, shared `IntersectionObserver`, `data-motion-state` |
| GSAP / ScrollTrigger | Complex narrative choreography: timeline, parallax, scrub, split text, coordinated storytelling | Ordinary content/media reveal, simple fade/rise/zoom, card entrance | Homepage hero timeline, scroll-linked parallax, brand-level site motion |

### Decision Rules

| Motion need | Default path | Do not |
| --- | --- | --- |
| Hover/focus, loader, decorative loop, pause/running | CSS capability utility | GSAP |
| Open/close, show/hide, active/inactive, loading visibility | Alpine state + CSS state classes | GSAP |
| Ordinary content/media reveal across sections | Alpine component with shared `IntersectionObserver` + CSS rules in `tailwind.animates.css` | GSAP |
| Complex narrative choreography (parallax, scrub, timeline, split text, coordinated storytelling) | GSAP — only after explicit classification | — |

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
- transition/animation phase classes for state motion presets
- hover/focus micro-motion utilities
- text/media reveal classes
- icon animations, spinners, pulses
- pause/running helpers
- loader, spinner, and decorative loop utilities
- reduced-motion and motion-disabled kill rules

Capability utilities SHOULD use the `motion-*` naming namespace for new code.

Existing non-`motion-*` utilities MAY remain as legacy aliases during migration, but new code SHOULD NOT introduce more non-`motion-*` animation utilities.

`tailwind.animates.css` also owns the global setting selectors that map body-level motion settings to CSS behavior, for example `body[data-content-reveal-style]`, `body[data-media-reveal-style]`, `body[data-motion-enabled]`, and `@media (prefers-reduced-motion: reduce)`.

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

- Each `x-data="motionRevealSection()"` creates an independent Alpine instance.
- The component implementation should use a module-level shared `IntersectionObserver` singleton, with a registry such as a `WeakMap` from element to instance.
- Each section instance registers its root with the shared observer during `init()` and unregisters during disposal.
- Default reveal behavior is once-only: when the section enters the viewport, set `data-motion-state="revealed"` and unobserve the section.
- If motion is disabled, reduced motion is preferred, or reveal should not wait for viewport entry, set `data-motion-state="revealed"` immediately.
- The component may assign lightweight per-target variables such as `--motion-index` for stagger, but it should not compute animation types or keyframes.

Recommended CSS contract:

- HTML should render visible by default without JavaScript.
- Alpine may set `data-motion-state="pending"` only after initialization, so no-JS content remains visible.
- `tailwind.animates.css` owns selectors such as:
  - `[data-motion-section][data-motion-state='pending'] [data-motion-reveal]`
  - `[data-motion-section][data-motion-state='revealed'] [data-motion-reveal]`
  - `body[data-content-reveal-style='...'] [data-motion-reveal='content']`
  - `body[data-media-reveal-style='...'] [data-motion-reveal='media']`
- Global motion setting effects should be expressed in CSS through body data attributes and motion variables, not through per-section GSAP timelines.

`x-intersect` MAY be used for isolated simple cases, but it is not the preferred architecture for ordinary reveal coverage. The preferred architecture is one shared observer behind the Alpine component, rather than many scattered `x-intersect` directives.

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

Repeated Alpine `x-transition:*` attribute groups MAY be replaced with a named motion helper while legacy markup is being cleaned up, but `motion-transition` is not the primary architecture for ordinary reveal.

Preferred template usage:

```liquid
<div
    x-show='open'
    {% render 'motion-transition', preset: 'dropdown' %}
></div>
```

`snippets/motion-transition.liquid` currently owns the mapping from preset name to Alpine `x-transition:*` attributes. It is a legacy/state-motion helper, not the preferred section reveal API. New ordinary reveal work should use the data-hook + Alpine component model above.

The `motion-transition` snippet is for Alpine x-transition state motion only: dropdown, drawer, modal, toast, tab-content, fade, and similar open/close/show/hide patterns. It is not the full section content/media reveal architecture and may be simplified or removed if state motion is moved to direct data-state CSS rules.

Ordinary section content/media reveal should use the documented CSS/Alpine reveal pattern, not GSAP by default.

## Optional GSAP Narrative Layer

GSAP is reserved for complex homepage/storytelling choreography only. It is not the default implementation for content fade/rise, media fade/zoom, card reveal, or ordinary section entrance.

### When GSAP is valid

- Parallax
- Scroll-linked scrub
- Complex timeline sequences
- Split text animation
- Coordinated multi-section storytelling
- Brand-level site motion language

### When GSAP is invalid (use CSS/Alpine instead)

- Simple fade
- Simple rise
- Simple image zoom
- Ordinary card entrance
- Ordinary section content reveal
- Ordinary media reveal

### GSAP Lifecycle Rules

GSAP recipes MUST be initialized through `Components.register()` and cleaned up in `destroy()`. The component lifecycle owns when GSAP starts and stops; the motion recipe owns animation values.

Reusable GSAP motion SHOULD live under `window.__Theme__.Motion` once the motion runtime exists. Until then, local GSAP in a section is allowed when the animation is one-off and classified as narrative choreography.

### ScrollTrigger Project Rules

**Allowed Configuration:**

| Option | Project Rule | Example |
|--------|--------------|---------|
| `trigger` | MUST use component root or `el` | `trigger: el` or `trigger: el.querySelector('[data-gsap-trigger]')` |
| `start` | SHOULD use `'top 80%'` for reveal | `start: 'top 80%'` |
| `scrub` | Use `1` for smooth lag, `true` for direct | `scrub: 1` |
| `toggleActions` | Use `'play none none reverse'` for reversible | `'play none none reverse'` |
| `once` | Use `true` for one-time reveal | `once: true` |
| `markers` | MUST remove before production | `markers: false` |

**Important:** Use `scrub` OR `toggleActions`, never both on the same trigger.

**Allowed Patterns (one-time narrative reveal):**

```javascript
Components.register(
    'section-reveal',
    {
        init(el) {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                return {};
            }

            gsap.registerPlugin(ScrollTrigger);

            const ctx = gsap.context(() => {
                const items = el.querySelectorAll('[data-gsap-item]');
                if (!items.length) return;

                gsap.set(items, { opacity: 0, y: 24 });
                gsap.to(items, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                        once: true,
                    },
                });
            }, el);

            return { ctx };
        },

        destroy(_el, state) {
            state?.ctx?.revert();
        },
    },
    { lazy: true },
);
```

**Allowed Patterns (scrub scroll-linked):**

```javascript
Components.register(
    'parallax-section',
    {
        init(el) {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                return {};
            }

            gsap.registerPlugin(ScrollTrigger);

            const content = el.querySelector('[data-gsap-content]');
            if (!content) return {};

            const ctx = gsap.context(() => {
                gsap.from(content, {
                    y: 100,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1,
                    },
                });
            }, el);

            return { ctx };
        },

        destroy(_el, state) {
            state?.ctx?.revert();
        },
    },
    { lazy: true },
);
```

**Prohibited:**

- PROHIBITED: Global selectors `.section`, `.hero`, `.card`, `.title`
- PROHIBITED: `trigger: '.section'` -- MUST use component root or scoped selector
- PROHIBITED: Both `scrub` and `toggleActions` on same trigger
- PROHIBITED: `markers: true` in production

### ScrollTrigger Refresh and Cleanup

**When to Refresh:**

```javascript
// After dynamic content changes (images, fonts, dynamic sections)
ScrollTrigger.refresh();

// Debounced refresh (avoid excessive calls)
let refreshTimeout;
function debouncedRefresh() {
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 200);
}
```

**Cleanup Pattern (gsap.context):**

```javascript
Components.register(
    'animated-section',
    {
        init(el) {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                return {};
            }

            gsap.registerPlugin(ScrollTrigger);

            const ctx = gsap.context(() => {
                const items = el.querySelectorAll('[data-gsap-item]');
                if (!items.length) return;

                gsap.set(items, { opacity: 0, y: 24 });
                gsap.to(items, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.12,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                        once: true,
                    },
                });
            }, el);

            return { ctx };
        },

        destroy(_el, state) {
            state?.ctx?.revert();
        },
    },
    { lazy: true },
);
```

**Prohibited:**

- PROHIBITED: `ScrollTrigger.getAll().forEach(t => t.kill())` -- kills other sections' triggers
- PROHIBITED: Global cleanup that affects sibling components
- PROHIBITED: Missing cleanup in `destroy()`

## Execution Layer Boundaries

Use this decision tree:

1. Hover/focus, loader, decorative loop, pause/running state -> CSS capability utility in `tailwind/tailwind.animates.css`.
2. Open/close, show/hide, active/inactive, loading visibility -> Alpine state + CSS state classes. Existing `motion-transition` usage is legacy/helper code, not the long-term ordinary reveal model.
3. Ordinary section content/media reveal -> `data-motion-reveal` hooks + Alpine component with shared `IntersectionObserver` + CSS rules in `tailwind.animates.css`. NOT GSAP.
4. Complex narrative choreography (parallax, scrub, timeline, split text, coordinated storytelling) -> GSAP, only after classification confirms narrative value.
5. One-off complex section animation -> local GSAP inside that section's `{%- javascript -%}` block, still using `Components.register()` and cleanup.
6. Repeated section animation or global motion language -> shared GSAP recipe under `window.__Theme__.Motion`.

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
3. Clean up existing `motion-transition` and `motion-*` classes by classifying them as state motion, ordinary reveal capability, element utility, or dead code.
4. Build ordinary content/media reveal around data hooks, a shared-observer Alpine component, and CSS rules in `tailwind.animates.css`.
5. Rename CSS animation utilities toward `motion-*` with legacy aliases when needed.
6. Introduce shared GSAP recipes only after explicit narrative classification.
7. Add merchant-facing global motion settings only after the relevant CSS/Alpine consumers and tokens exist.

During cleanup, preserve visual behavior unless the task explicitly asks to redesign motion.

## Duplication Detection

This table lists repeated patterns to check before adding another copy. It is a pre-flight checklist, not an automatic abstraction trigger.

| Repeated pattern to check before adding another copy                        | Destination                                | Namespace                    |
| --------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------- |
| Alpine `x-transition:*` attribute group already defined elsewhere           | Existing state-motion helper or direct data-state CSS | State motion |
| Ordinary content/media reveal hook already exists                           | Shared Alpine reveal component + `tailwind.animates.css` | `data-motion-reveal` |
| CSS `@keyframes`, `animation-*`, or phase class already defined elsewhere   | `tailwind/tailwind.animates.css`           | `motion-*` utility namespace |
| GSAP narrative timeline/parallax/scrub already defined elsewhere            | Optional GSAP narrative recipe             | `Motion.*` method            |

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

## Performance Rules

### Transform-First Rule

**Allowed (compositor-friendly):**

```javascript
// Transform aliases
gsap.to(el, { x: 100, y: 50, scale: 1.2, rotation: 45 });

// autoAlpha (opacity + visibility)
gsap.to(el, { autoAlpha: 0 }); // Sets visibility: hidden when opacity: 0
```

**autoAlpha boundary:** Do NOT use `autoAlpha` on critical first-viewport content that must be visible before JavaScript loads. Critical content MUST render visible without JS or animation completion. Use `autoAlpha` only for below-the-fold or non-critical elements.

**Prohibited (triggers layout):**

```javascript
// Layout properties - causes jank
gsap.to(el, { width: '200px', height: '100px', top: '50px', left: '100px' });
gsap.to(el, { margin: '20px', padding: '10px' });
```

**Rule:** Use `x`, `y`, `scale`, `rotation`, `autoAlpha` for movement. Use `width`/`height` only when explicitly needed for layout changes.

### Stagger Rule

**Required:** Use `stagger` parameter, not manual `delay` calculations.

```javascript
// CORRECT: Use stagger
gsap.from(items, { y: 50, opacity: 0, stagger: 0.1 });

// PROHIBITED: Manual delays
items.forEach((item, i) => {
    gsap.from(item, { y: 50, opacity: 0, delay: i * 0.1 });
});
```

### Cleanup Rule

**Required:** All GSAP animations MUST be cleaned up in `destroy()` using `gsap.context(..., el)` + `ctx.revert()`. See canonical pattern above for complete example.

**Prohibited:**

- PROHIBITED: `ScrollTrigger.getAll().forEach(t => t.kill())` -- kills other sections
- PROHIBITED: `gsap.killTweensOf('*')` -- kills everything
- PROHIBITED: Missing cleanup in `destroy()`

## Responsive and Reduced Motion Rules

### Responsive Animation with gsap.matchMedia()

**Required:** Use `gsap.matchMedia()` for responsive animations. All animations and ScrollTriggers created in that run are reverted automatically when media query stops matching.

```javascript
Components.register(
    'responsive-section',
    {
        init(el) {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                return {};
            }

            gsap.registerPlugin(ScrollTrigger);

            const mm = gsap.matchMedia();

            mm.add('(min-width: 768px)', () => {
                const items = el.querySelectorAll('[data-gsap-item]');
                if (!items.length) return;

                gsap.from(items, {
                    y: 50,
                    opacity: 0,
                    stagger: 0.1,
                    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
                });
            });

            mm.add('(max-width: 767px)', () => {
                const mobileItems = el.querySelectorAll('[data-gsap-mobile]');
                if (!mobileItems.length) return;

                gsap.from(mobileItems, { y: 30, opacity: 0 });
            });

            return { mm };
        },

        destroy(_el, state) {
            state?.mm?.revert();
        },
    },
    { lazy: true },
);
```

### Reduced Motion Rule

**Required:** Respect `prefers-reduced-motion`. Use `gsap.matchMedia()` to disable animations. Set final visible state for reduced motion users.

```javascript
Components.register(
    'animated-section',
    {
        init(el) {
            if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                return {};
            }

            gsap.registerPlugin(ScrollTrigger);

            const mm = gsap.matchMedia();

            mm.add('(prefers-reduced-motion: reduce)', () => {
                const items = el.querySelectorAll('[data-gsap-item]');
                gsap.set(items, { opacity: 1, y: 0 });
            });

            mm.add('(prefers-reduced-motion: no-preference)', () => {
                const items = el.querySelectorAll('[data-gsap-item]');
                if (!items.length) return;

                gsap.from(items, {
                    y: 50,
                    opacity: 0,
                    stagger: 0.1,
                    scrollTrigger: { trigger: el, start: 'top 80%', once: true },
                });
            });

            return { mm };
        },

        destroy(_el, state) {
            state?.mm?.revert();
        },
    },
    { lazy: true },
);
```

**Prohibited:**

- PROHIBITED: `gsap.globalTimeline.timeScale(100)` -- global side effect
- PROHIBITED: Skipping cleanup for reduced motion branch

## Common Pitfalls

### Pitfall 1: immediateRender with from()

When stacking multiple `from()` tweens on same property/target:

```javascript
// BAD: Second tween's immediateRender conflicts
gsap.from(el, { x: -100, duration: 1 });
gsap.from(el, { x: 100, duration: 1, delay: 1 });

// GOOD: Set immediateRender: false on later tweens
gsap.from(el, { x: -100, duration: 1 });
gsap.from(el, { x: 100, duration: 1, delay: 1, immediateRender: false });
```

### Pitfall 2: ScrollTrigger with Dynamic Content

**Problem:** ScrollTrigger calculates positions before images/fonts load, causing incorrect pin/trigger positions.

**Rule:** When section contains dynamic content (images, fonts, AJAX-loaded content), refresh ScrollTrigger after content loads. Use one of:

1. **MutationObserver in component lifecycle** -- observe `el` for child/subtree changes, call `ScrollTrigger.refresh()` on mutation, disconnect in `destroy()`.
2. **Image load events** -- listen for `load` on images inside `el`, call `ScrollTrigger.refresh()` after all images load.
3. **Debounced refresh** -- if many dynamic changes, debounce `ScrollTrigger.refresh()` to avoid excessive calls.

All approaches MUST clean up listeners/observers in `destroy()` to prevent leaks.

**Prohibited:**

- PROHIBITED: Creating ScrollTrigger before dynamic content loads without refresh plan
- PROHIBITED: `window.addEventListener('load', ...)` without cleanup in component lifecycle

### Pitfall 3: Timeline Position Mistakes

```javascript
// BAD: Overlapping tweens without position parameter
const tl = gsap.timeline();
tl.from(el.querySelector('[data-gsap-title]'), { y: 50, opacity: 0, duration: 0.5 });
tl.from(el.querySelector('[data-gsap-subtitle]'), { y: 30, opacity: 0, duration: 0.5 });

// GOOD: Use position parameter for precise control
const tl = gsap.timeline();
tl.from(el.querySelector('[data-gsap-title]'), { y: 50, opacity: 0, duration: 0.5 })
    .from(el.querySelector('[data-gsap-subtitle]'), { y: 30, opacity: 0, duration: 0.5 }, '-=0.3')
    .from(el.querySelector('[data-gsap-cta]'), { y: 20, opacity: 0, duration: 0.5 }, '+=0.2');
```

**Position Parameter Reference:**

| Value | Meaning |
|-------|---------|
| `0.5` | Absolute time (0.5s from start) |
| `'-=0.3'` | Relative to previous end (0.3s before) |
| `'+=0.2'` | Relative to previous end (0.2s after) |
| `'myLabel'` | Named label |

## External GSAP Reference

Core GSAP patterns used in this project are documented above. These patterns are informed by `greensock/gsap-skills` (reviewed at commit `aed9cfd`, 2026-04-21). The original skill files are not vendored into this repository.

For advanced GSAP API behavior not covered here, consult the upstream `greensock/gsap-skills` repository. Any external recommendation must map back to this theme's lifecycle (`Components.register()`), motion runtime (`window.__Theme__.Motion`), cleanup (`ctx.revert()`), no-JS visibility, reduced-motion, and launch-readiness rules.

See `docs/references/agent-workflow/external-skills.md` for adoption history.
