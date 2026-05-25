# Theme Refactor Plan

This plan is the staged audit and cleanup guide for bringing the theme into alignment with `AGENTS.md`. Use it as the working plan for agent-assisted refactors. `AGENTS.md` remains the source of truth if anything conflicts.

## Operating Rules

1. Audit before editing.
2. Keep each change set focused on one rule family.
3. Preserve storefront behavior, visual design, schema IDs, block types, section types, preset names, template references, and merchant content unless explicitly requested.
4. Do not rewrite a section just to make it look cleaner.
5. Do not edit generated files directly.
6. Run the smallest relevant validation after each batch.
7. After meaningful theme changes, run `npm run lint` and `npm test`.

## Agent Execution Boundaries

Use this section to decide whether an agent may automatically edit code after an audit. If a cleanup is not listed as auto-fix allowed, treat it as ask-first or plan-only.

### Agent Auto-Fix Allowed

- Hardcoded tokenizable colors such as `text-[#...]`, `bg-[#...]`, and `border-[#...]` when a matching theme token or CSS variable already exists.
- Empty `{% stylesheet %}` blocks.
- Formatting of files already touched by the current task.
- Moving repeated, purely presentational CSS into the documented Tailwind layer when the selector and visual behavior stay unchanged.
- Replacing direct application HTTP/cart calls with the established `ShopifyHttp` or `$store.cart` API when the behavior maps one-to-one.
- Adding missing cleanup for listeners, observers, timers, GSAP contexts, and Swiper instances without changing interaction behavior.
- Splitting large runtime files into physical modules when public globals, script order, and existing `x-data` / `$store` APIs remain unchanged.

### Agent Must Ask First

- Semantic HTML changes for heading-class misuse, such as changing `div`, `p`, `span`, `a`, or `button` into heading elements.
- Shared selector or class renames, especially broad names like `.header` or `.image`.
- Schema setting ID, block type, preset, template, or section type changes.
- Motion timing, easing, distance, choreography, or visible transition redesign.
- Introducing new public APIs, new global settings, new dependencies, or a bundler/build step.
- Extending shared abstractions with new modes, enum switches, or divergent behavior.
- Accessibility fixes that alter interaction model, focus order, or keyboard behavior beyond a clearly equivalent correction.

### Plan-Only / Manual Review

- Broad section rewrites.
- Visual redesign.
- Cross-file class namespace migrations.
- Motion system migrations across multiple sections.
- Any cleanup that touches generated assets, merchant-facing settings, or persisted content.

## Known Legacy Debt

The following debt is known from the current lint and architecture state. Do not treat these as permission for broad automatic cleanup.

- `npm run format:check` may fail on existing documentation files outside the active task. Format only files intentionally touched.
- `npm run lint:theme` currently reports legacy findings across sections/snippets, including inline scripts, duplicate schema IDs, heading utility misuse, hardcoded tokenizable colors, generic CSS class names, and global listener cleanup issues.
- Tailwind source layering is acceptable as-is: `typography`, `elements`, `components`, `snippets`, `utilities`, and `animates` should not be reorganized without a separate plan.
- `assets/tailwind.output.css` and generated icon assets remain generated outputs and must not be manually edited.
- CSS cleanup should be staged by rule family; avoid mixing token cleanup, semantic heading changes, motion migration, and selector renames in one change set.

## Phase 0: Baseline Audit

Goal: produce a current inventory without changing code.

Audit buckets:

- JS lifecycle: inline scripts, bare global listeners, unscoped selectors, missing cleanup.
- Alpine: complex inline expressions, Liquid embedded directly in `x-data`, duplicate local behavior.
- Events: cross-component behavior not using `ThemeEvents`.
- HTTP/cart: raw application `fetch()`, direct `/cart/*` calls outside `$store.cart`, manual section replacement.
- Motion: CSS capability utilities, Alpine/state transitions, GSAP/choreography, mixed ownership risks.
- CSS: inline static styles, hardcoded colors, misplaced reusable styles, heading typography issues.
- Icons: raw SVG in Liquid, manual asset SVG edits, missing icon snippet usage.
- i18n: hardcoded storefront or schema strings.
- Accessibility: icon-only controls, missing labels, missing live regions, dialog/drawer focus risks.

Output:

- Grouped findings with file references.
- Recommended phase for each finding.
- Explicit blockers vs staged cleanups.

## Phase 1: Runtime Safety

Goal: fix behavior that can break lifecycle, cart, HTTP, or section rendering.

Scope:

- Move lifecycle-managed section behavior into `Components.register()`.
- Add cleanup for observers, timers, Swiper, GSAP, and global listeners.
- Route cross-component behavior through `ThemeEvents`.
- Route application HTTP through `ShopifyHttp`.
- Route cart operations through `$store.cart`.
- Route section HTML replacement through `ShopifySectionRefresher.render()`.

Examples:

- `skills/examples/canonical-section.md`
- `skills/examples/canonical-events.md`
- `skills/examples/canonical-http-section-refresh.md`
- `skills/examples/canonical-cart-flow.md`

Validation:

- `npm run lint:theme`
- `npm test` when Liquid or runtime integration changed.

## Phase 2: Motion System

Goal: establish one motion architecture while preserving current visual behavior.

Scope:

- Classify motion as capability, state motion recipe, choreography recipe, or usage.
- Add `snippets/motion-transition.liquid` when ready.
- Move repeated Alpine `x-transition:*` groups to named recipes.
- Keep `tailwind/tailwind.animates.css` as the CSS motion capability and phase-class layer.
- Rename new CSS motion utilities toward `motion-*`; keep legacy aliases during migration.
- Use local GSAP for one-off choreography.
- Add `window.__Theme__.Motion.gsap.*` recipes only after at least three real usages or clear global motion-language need.

Examples:

- `skills/examples/canonical-motion-transition.md`
- `skills/examples/canonical-gsap-section.md`

Validation:

- `npm run lint:css`
- `npm run build:tw` when Tailwind source changed.
- Manual visual check for affected state transitions and scroll animation.

## Phase 3: CSS Architecture

Goal: normalize styling without redesigning the theme.

Scope:

- Remove empty `{% stylesheet %}` blocks.
- Replace static inline styles with Tailwind utilities.
- Move reusable styles to the correct Tailwind layer.
- Replace hardcoded colors with theme tokens or CSS variables.
- Fix heading utility misuse and redundant matching heading classes.
- Keep `assets/tailwind.output.css` generated only.

Example:

- `skills/examples/canonical-css-layering.md`

Validation:

- `npm run lint:css`
- `npm run build:tw`
- `npm run format:check` for touched files.

## Phase 4: Liquid, i18n, Icons, Accessibility

Goal: clean presentation correctness and Theme Store readiness.

Scope:

- Use `t:` for schema strings.
- Use `| t` for user-visible hardcoded storefront copy.
- Ensure ARIA copy is translated.
- Ensure icon-only controls have accessible text.
- Convert clickable non-native elements to `button` or `a`.
- Ensure dropdowns, drawers, modals, popups, lightboxes, tabs, accordions, carousels, galleries, and comparison controls are keyboard-operable.
- Add `aria-expanded`, `aria-controls`, `aria-selected`, `aria-current`, `role="dialog"`, `aria-modal`, `aria-labelledby`, and live-region attributes only where semantically appropriate.
- Ensure modal, drawer, lightbox, and search overlay focus entry/return behavior is handled or explicitly logged as a follow-up risk.
- Ensure focusable elements are not reachable inside hidden UI.
- Ensure rendered images have correct `alt` attributes; decorative images use `alt=""`.
- Ensure pointer-drag interactions have keyboard alternatives.
- Replace raw SVG markup with the icon snippet.
- Generate icons through `icons/` and `npm run build:svg` only when needed.
- Preserve existing schema IDs and block types.

Validation:

- `npm run lint:i18n`
- `npm run lint:theme`
- `npm run build:svg` if icons changed.
- `npm test`.
- Keyboard smoke test for touched interactive components.

## Phase 5: Final Review

Goal: review the complete diff before merge.

Steps:

1. Run `npm run lint`.
2. Run `npm test`.
3. Run `npm run build:tw` if Tailwind source changed.
4. Run `npm run build:svg` if icon sources changed.
5. Review generated outputs for expected changes only.
6. Ask for a code review using `skills/code-review/pre-merge.md`.

Review output should include:

- Blockers.
- Warnings.
- Suggestions.
- Conclusion: `APPROVE` or `REQUEST CHANGES`.

## Suggested Agent Prompt

```text
Follow `AGENTS.md` and `skills/code-review/THEME_REFACTOR_PLAN.md`.
Start with an audit and output only grouped findings plus recommended phases.
Do not edit code during the audit.
For follow-up implementation, handle only one phase or one rule family per change set.
Preserve behavior and visual design.
After each batch, run the smallest relevant lint/test commands and report any pre-existing unrelated failures.
```
