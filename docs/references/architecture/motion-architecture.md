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

`motion_speed` is scoped to page and brand reveal timing. It drives `--motion-reveal-duration-base` and `--motion-reveal-stagger`; visual amplitude belongs to the selected reveal recipe so changing speed does not also change distance or scale. Do not wire it to hover, focus, panel, drawer, dialog, loading, or other state/micro interaction timings.

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

When a reveal target's own `transform` would destabilize observation or row grouping, separate the stable geometry node from the animated node:

```liquid
<div data-motion-cascade>
    <div class="group" data-motion-bound>
        <div class="product-card" data-motion-reveal="content">
            ...
        </div>
    </div>
</div>
```

Recommended runtime contract:

- Each `x-data="motionRevealSection()"` creates an independent Alpine instance on the section root (`data-motion-section`).
- The section instance owns lifecycle only: `init()` / `destroy()`, Theme Editor replay, `motion_enabled` / reduced-motion guards, and target registration.
- Each `[data-motion-reveal]` or `[data-motion-copy]` target is owned by the **nearest** ancestor `[data-motion-section]`. Parent instances must not register nested section targets.
- The implementation uses module-level shared `IntersectionObserver` singletons with `WeakMap` registries from observed element to callback. One ordinary stable bound may own several independently animated targets; the owning instance aggregates them behind one bound callback instead of letting later registrations replace earlier ones.
- `[data-motion-reveal]` is the ordinary animated node (`opacity` / `transform` via CSS). `[data-motion-copy]` is the equivalent independently observed content target for copy positioned after tall media.
- `[data-motion-bound]` is the optional stable observation / row-geometry node. When present on an owned ancestor, observers and cascade row grouping use the bound; otherwise the reveal target is observed directly.
- `[data-motion-copy-bound]` is the optional tight, transform-free observation / row-geometry node for `[data-motion-copy]`. Copy deliberately ignores a coarse card's outer `[data-motion-bound]`; without a copy bound, the copy target observes itself.
- Default reveal behavior aligns with **Dawn once**: `body[data-reveal-behavior='once']` (default) reveals each target once, then unobserves it.
- `body[data-reveal-behavior='always']` keeps observing: a target resets only after its bound fully leaves a buffered exit region. Enter uses the shared enter observer (`rootMargin: 0 0 -15% 0`). Exit uses a separate shared exit observer (`rootMargin: ±64px`) so non-intersecting fires when the bound has actually cleared the buffer — not on the first leave of the enter trigger line. Reset applies a silent `data-motion-resetting` pending state (no reverse hide animation, no transform jitter). Re-entry briefly uses internal `data-motion-staging` to restore the pending pose without a transition, then plays the full pending-to-revealed distance in either direction.
- Unbound ordinary rise/zoom targets (no separate `data-motion-bound`) stay transform-stable while `data-motion-resetting` is set (`transform: none`). Enter is confirmed on that stable box; pending transform is applied only after enter, immediately before flipping to `revealed`, and inset is not re-checked against the transformed box.
- If motion is disabled, reduced motion is preferred, `IntersectionObserver` is unavailable, or the target type's reveal style is `none`, eligible targets receive `data-motion-state="revealed"` immediately and do not enter ordinary/cascade observation.
- Initial target registration runs after Alpine's first DOM update so tab panels can settle their `x-show` / `x-cloak` state before reveal scans. Targets inside `display: none` / `visibility: hidden` ancestors (inactive tab panels) are not observed and are not revealed early; tab clicks within the section trigger a rescan to register newly visible targets.
- Storefront resize uses one module-level shared `resize` listener (first instance registers, last instance destroys). Swiper navigation / wrapper `transitionend`, tab clicks, and Theme Editor select/reorder trigger re-registration so cascade rows stay aligned with the current visual layout.
- Cascade children clipped by overflow (for example horizontally off-screen Swiper slides) are excluded until they become clip-visible.
- Non-cascade targets default to `--motion-index: 0`. A compact copy group may use `[data-motion-sequence]` to assign its owned, non-cascade descendant reveal targets DOM-order indices for ordinary CSS stagger. Use `[data-motion-cascade]` on repeated peer layouts to auto-assign `0..n` **within each current visual row** to clip-visible descendant `[data-motion-reveal]` and `[data-motion-copy]` targets (left to right). Explicit `data-motion-index` always wins. Hidden or clipped cascade children are skipped.
- Stagger ownership: cascade timing is owned by JS delayed state flips; ordinary (non-cascade) stagger delay is owned by CSS `transition-delay` on the revealed state. Do not stack both.

### Trigger Behavior

- The shared non-cascade `IntersectionObserver` uses `rootMargin: '0px 0px -15% 0px'` and `threshold: 0`. Each **non-cascade** bound (or target when no bound exists) reveals when its top/bottom edge crosses the inset viewport trigger line (bottom inset remains `15%` of viewport height), not when a fraction of the target's own height is visible and not when the section root intersects.
- A single shared passive scroll-settle listener provides a visibility recovery path after scrolling pauses. Normal recovery keeps the same `15%` inset rule. Only when the document is actually at its end does recovery relax to the full viewport, preventing lower Footer copy from remaining pending when no further scroll distance exists. The first instance attaches the listener and the last instance removes it; it does not own `always` exit/reset behavior.
- HTML renders visible by default; Alpine sets `data-motion-state="pending"` on each observed target only after init, so no-JS and pre-init states remain safe.
- **Page-load reveal:** targets already intersecting when registered (hero copy, above-the-fold blocks) are not revealed in the same frame as `pending`. On the first registration only, the runtime marks targets that are actually viewport-visible and clip-visible as `data-motion-critical-runtime`. Critical targets never begin transparent or clipped; Rise, Zoom, and Slide may still play their full transform entrance. Registration sets `_deferToPageLoadFlush` before `observe()` so synchronous IO callbacks cannot skip the paint frame. After double `requestAnimationFrame`, in-view pending targets reveal with `48ms` base delay; ordinary targets rely on CSS `--motion-index` delay for stagger, while cascade rows use JS within-row stagger. Scroll-in targets still reveal from `IntersectionObserver` when entering view.
- Page-fixed critical hero copy may use explicit `data-motion-critical`. Reorderable sections should rely on the runtime viewport-critical marker instead of broad selectors such as “the first motion section.” LCP/carousel media remains static and immediately visible.
- Sections with critical LCP or carousel media may opt media out with `data-motion-media="static"` on the section root; JS skips observing those media targets and CSS keeps them static. Pass `motion_reveal: false` on hero images when the section root is static.

### Cascade (`data-motion-cascade`)

- Add `data-motion-cascade` on a visible wrapper for repeated peer layouts (product, collection, category, article, promotion, or icon card lists).
- Cascade owns row grouping and stagger only. The selected content/media reveal style owns presentation. A repeated visual item should normally expose one coarse reveal target; nested images pass `motion_reveal: false` when the whole item reveals.
- A tall composite card may contain an independently observed `[data-motion-copy]` target when its copy enters the viewport materially later than its media or coarse card target. Give it a tight `[data-motion-copy-bound]` wrapper when the animated copy's transform would otherwise alter observation geometry. This is trigger granularity, not a separate visual style: copy still consumes the selected content reveal recipe and shared speed tokens.
- Do not use a large delay tied to the coarse parent state for this case. The delay still runs off-screen and cannot guarantee that the copy animates when the customer can see it.
- Prefer existing layout wrappers with `data-motion-bound` around each animated card so row geometry and observation stay independent from reveal `transform`.
- `motionRevealSection()` assigns `--motion-index` `0, 1, 2…` to clip-visible `[data-motion-reveal]` and `[data-motion-copy]` descendants **per visual row** (not across the whole container).
- Inactive tab panels (`display: none`) and overflow-clipped children (for example off-screen Swiper slides) are excluded from indexing and registration until they become visible.
- **Row/batch trigger:** cascade children are **not** observed individually with the ordinary per-target observer. Visible clip-visible targets inside each cascade container are grouped into visual rows using stable bound layout boxes (`8px` tolerance). Each row watches its representative bound (lowest `--motion-index` / leftmost). When that bound enters the inset viewport, **all** pending clip-visible targets in that row reveal together through JS stagger. The effective interval is reduced when necessary so the final item starts within a `500ms` row window. CSS cascade targets force transition/animation delay to `0` so JS and CSS delays never stack.
- Ordinary (non-cascade) targets keep the shared per-bound observer (`threshold: 0`, same bottom `15%` inset). Multiple targets sharing one stable bound are aggregated and revealed independently without observer callback replacement. Page-load in-view checks use the same inset trigger-line rule on the bound.
- `reveal_behavior='always'`: cascade row replay resets only when every bound in the row has fully left the buffered exit region, detected by the shared exit observer (`±64px` rootMargin). Reset uses `data-motion-resetting` so no reverse hide animation is visible. Transform changes on the animated card must not drive observation.
- Delayed reveal timers re-check ownership, visibility, clip visibility, and inset enter conditions before flipping state. On skip or success they always clear `_pageLoadQueue` so a later enter can still reveal.
- once cascade: row enter observers stay active until every pending target in the row has successfully reached `revealed` (or is no longer eligible). Scheduling stagger timers alone must not unobserve the row.
- Do not nest cascade containers unless intentional. Do not wrap conversion controls.

### Reveal behavior (`reveal_behavior`)

| Value | Behavior | Dawn alignment |
| --- | --- | --- |
| `once` (default) | Target reveals once, then `unobserve` | Matches Dawn scroll-trigger default |
| `always` | Target silently resets to `pending` only after its bound fully leaves a buffered exit region; re-entry replays. Cascade rows reset only after **every** bound in the row batch has fully left that buffered region. | Optional merchant setting |

Setting: `config/settings_schema.json` → `body[data-reveal-behavior]` in `layout/theme.liquid`. Do not read merchant `settings_data.json` in theme code beyond Liquid `settings.*`.

### Reveal Speed Tokens (`motion_speed`)

`motion_speed` drives reveal-only CSS variables in `snippets/css-variables.liquid`. It does not affect hover, panel, drawer, dialog, or loading timings.

| Setting | `--motion-reveal-duration-base` | `--motion-reveal-opacity-duration` | `--motion-reveal-stagger` |
| --- | --- | --- | --- |
| `fast` | 820ms | 480ms | 130ms |
| `normal` (default) | 1080ms | 620ms | 170ms |
| `slow` | 1340ms | 760ms | 210ms |

Speed tiers were shifted up so the previous Slow becomes the new Normal default: storefront review found Slow matched the expected “obvious but premium” feel for ordinary browsing. Step deltas remain `+260ms` duration, `+140ms` opacity, and `+40ms` stagger. Reveal easing stays `cubic-bezier(0.25, 0.4, 0.4, 1)`. `motion_speed` still controls timing only and does not change Rise, Zoom, or Slide amplitude.

`tailwind/tailwind.animates.css` consumes these timing tokens for content `fade` / `rise` / `slide` and media `fade` / `zoom` / `slide`. Rise and zoom use a shorter opacity phase than their transform phase so movement remains perceptible after content becomes readable. Recipe-owned amplitude tokens keep content rise at a responsive `40px..64px`, media zoom at `0.92..1`, content slide revealing upward, and media slide revealing left-to-right. Slide direction remains internally overridable through `--motion-slide-content-*` and `--motion-slide-media-*` without adding low-level merchant settings.

### Settings → Consumption Chain

```text
config/settings_schema.json (motion_enabled, motion_speed, content_reveal_style, media_reveal_style, reveal_behavior)
  → layout/theme.liquid body[data-motion-enabled], body[data-content-reveal-style], body[data-media-reveal-style], body[data-reveal-behavior]
  → snippets/css-variables.liquid (--motion-reveal-* tokens from motion_speed)
  → assets/alpine.components.ui.js motionRevealSection() (nearest-section ownership; per-bound IntersectionObserver for ordinary [data-motion-reveal] / [data-motion-copy] targets; row/batch cascade observer on stable bounds; target data-motion-state / data-motion-resetting / data-motion-staging; per-row --motion-index)
  → tailwind/tailwind.animates.css (:is([data-motion-reveal], [data-motion-copy])[data-motion-state] × body reveal style; silent reset/staging; cascade delay ownership)
  → sections/snippets hooks (data-motion-section lifecycle root; data-motion-bound / data-motion-copy-bound stable geometry; data-motion-sequence compact copy rhythm; data-motion-reveal / data-motion-copy animated targets)
```

### Consumption Granularity

- Section root: `x-data="motionRevealSection()"` + `data-motion-section` (lifecycle only).
- Coarse targets: `data-motion-reveal="content"` / `"media"` on stable content groups, repeated items, and image columns — not every heading, button, or icon by default.
- Compact copy sequences: use one `[data-motion-sequence]` container with a small number of meaningful descendant content targets (for example eyebrow, heading, description, CTA). The runtime assigns DOM-order stagger indices; do not hand-maintain indices for ordinary copy groups.
- Tall content groups: do not place one reveal target around content whose lower regions can remain below the viewport when its upper edge triggers. Split it into a few meaningful targets so each region is observed at its own position; sequence the containing group when the DOM order should remain legible.
- Stable observation: reuse natural layout wrappers with `data-motion-bound` when the animated node uses transform (product card cells, Swiper slides, collection/category card shells).
- Stable components (`product-card`, `image.liquid`) may own internal hooks; pass `motion_reveal: false` on nested images when a parent shell already owns media reveal.
- Skip reveal on conversion controls, tab triggers, slider handles, and embeds such as `google-map` iframe sections.
- Registration skips targets inside `display: none` / `visibility: hidden` ancestors and overflow-clipped cascade children; tab clicks, resize, and Swiper relayout rescan for newly visible targets.
- Repeated peer layouts: use `data-motion-cascade` on the layout wrapper and one coarse reveal target per item so cards stagger per current visual row without nested transform ownership.

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
  - `[data-motion-copy][data-motion-state='pending' | 'revealed']`
  - `[data-motion-resetting]` and `[data-motion-staging]` for silent `always` reset/replay
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

### Current Coverage Boundary

- Editorial copy, media, cards, grids, recommendations, and other eligible below-the-fold visual regions may use the ordinary reveal contract.
- Product purchase flows, cart, forms, controls, Header, dialogs, drawers, filters, embeds, and special pages remain static or use their own state/micro-interaction contract.
- Search and Product Recommendations may delegate motion ownership to rendered result snippets.
- Copy below tall media must observe its own position instead of inheriting the media or section trigger.
- Repeated cards use their current visual row for cascade; hidden panels and clipped slides wait until they become eligible.
- One shared observer-bound registry entry owns every target attached to that bound. A node must not own both a stable `data-motion-bound` and an animated reveal/copy hook.

Treat this as a current architecture boundary, not a frozen coverage count. Re-audit touched surfaces and run representative storefront checks when motion behavior changes.

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
