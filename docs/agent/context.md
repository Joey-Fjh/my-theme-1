# Agent Context

Short cross-session relay. `AGENTS.md` is the rule source; durable contracts live in `docs/references/`.

## Current State

- Branch: `feat/ai-test`
- Validation on this Windows workspace: use `npm.cmd`, not plain `npm run`.
- Launch-ready remains REQUEST CHANGES until storefront manual QA is recorded.
- Recent mobile overlay, Liquid reuse, and animation/interaction cleanup are treated as mainline complete. Future work in those areas should be limited to QA defects or tightly scoped stabilization, not broad reuse/refactor passes.
- Avoid broad Liquid extraction by default. Agent-driven Liquid reuse is high-risk here; only extend shared snippets when there is clear repeated stable behavior and low merchant/config impact.

## Active Tracks

Current remaining project-level work is narrowed to two tracks:

1. Global animation setting optimization.
2. Typography/font refactor.

## Track Notes

### Global Animation Setting Optimization

- Preserve the accepted boundary: `motion_enabled` / `body[data-motion-enabled='false']` gates page and brand motion such as reveal, media reveal, scroll, and narrative choreography.
- Do not use `motion_enabled` as a blanket kill switch for state or micro interactions such as hover, focus, active, loading, dropdown, dialog, drawer, or cart transitions.
- State and micro interactions should respect `prefers-reduced-motion`.
- Above-the-fold critical content must remain visible and usable without JavaScript or animation completion.
- Before changing motion behavior, read `docs/references/architecture/motion-architecture.md`.

### Typography/Font Refactor

- Use project typography tiers; do not introduce Tailwind text-size utilities for headings.
- Keep merchant configurability and Theme Store readiness in view. Do not change merchant-owned settings/data unless explicitly authorized.
- User-visible strings, schema labels, and editor text must use locale keys.
- Before changing typography contracts, read `docs/references/style-system/typography-reference.md` and `docs/references/style-system/css-and-typography.md`.

## Validation

Use the smallest command that proves the change:

- `npm.cmd run lint` after meaningful Liquid, JS, CSS, schema, or locale changes.
- `npm.cmd test` after meaningful theme changes.
- `npm.cmd run build:tw` after Tailwind source changes.
- `npm.cmd run lint:i18n` when user-facing strings, schema labels, ARIA copy, placeholders, or locale keys change.

## Launch Gate

Do not declare launch-ready until manual QA records Pass/Fail for:

- PDP rich media and media modal/lightbox.
- Featured product and quick view media.
- Cart drawer/page.
- Collection filters, pagination, browser back.
- Predictive search and search results.
- Mobile menu, header cart badge, newsletter overlay.
- Z-index stack: toast, lightbox, dialog, drawer, media modal, header.
- Motion setting behavior and reduced-motion behavior.
- Typography/font behavior across 375, 768, and 1280 widths.

## Pointers

| Topic | Reference |
| --- | --- |
| Motion policy | `docs/references/architecture/motion-architecture.md` |
| Typography rules | `docs/references/style-system/typography-reference.md` |
| Style-system index | `docs/references/style-system/css-and-typography.md` |
| CSS layers and style contracts | `docs/references/style-system/css-architecture.md` |
| Abstraction boundaries | `docs/references/architecture/abstraction-boundaries.md` |
| JS runtime | `docs/references/architecture/javascript-runtime.md` |
| Launch gate | `docs/references/code-review/launch-gate.md` |
