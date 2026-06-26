# Agent Context

Short cross-session relay. `AGENTS.md` is the rule source; durable contracts live in `docs/references/`.

## Current State

- Branch: `feat/ai-test`
- Validation on this Windows workspace: use `npm.cmd`, not plain `npm run`.
- CSS architecture: about 94/100; detailed contracts live in `docs/references/style-system/css-architecture.md`.
- JS architecture: about 93/100; runtime details live in `docs/references/architecture/javascript-runtime.md`.
- Image system: about 96/100; details live in `docs/references/style-system/image-display-contract.md`.
- Launch-ready remains REQUEST CHANGES until storefront manual QA is recorded.

## Active Theme Experience Tracks

Current work is organized around five project-level concerns:

1. Liquid organization: audit section/snippet/block readability and reuse before extracting anything.
2. Motion/animation: make reveal coverage and rhythm intentional without hiding critical first-viewport content.
3. Hover/interaction: build a consistent language for buttons, links, cards, disabled, loading, focus, and touch.
4. Mobile/touch: avoid hover-only paths; test 375px phone and 768px tablet behavior.
5. Design consistency: compare storefront screenshots against design intent at 375, 768, and 1280 widths.

## Current Focus

Review the global button breathing implementation before expanding hover patterns:

- Owner should remain `tailwind/tailwind.elements.css` for `.btn`, `.btn-primary`, and `.btn-secondary`.
- Hover should feel like subtle lift/breathing, not color inversion.
- Hover animation must be gated to fine pointer; touch should use active/tap feedback.
- Disabled and loading states must not breathe or accept pointer interaction.
- Check Shopify dynamic checkout and generated `assets/tailwind.output.css` after Tailwind source changes.

## Deferred Or Follow-Up

- Motion audit items: dense grid reveal, first-viewport media reveal, nested media reveal, and hero-like static media.
- Link/card hover vocabulary remains fragmented; migrate only when touched or scoped.
- Product-card touch behavior still needs a focused pass after button review.
- Liquid extraction should wait for evidence: repeated stable consumers, a11y drift, or style/API drift.

## Launch Gate

Do not declare launch-ready until manual QA records Pass/Fail for:

- PDP rich media and media modal/lightbox.
- Featured product and quick view media.
- Cart drawer/page.
- Collection filters, pagination, browser back.
- Predictive search.
- Mobile menu, header cart badge, newsletter overlay.
- Z-index stack: toast, lightbox, dialog, drawer, media modal, header.
- Button hover/touch and motion checks once implemented.

## Pointers

| Topic | Reference |
| --- | --- |
| CSS layers and style contracts | `docs/references/style-system/css-architecture.md` |
| CSS history and deferred notes | `docs/references/style-system/css-architecture-history.md` |
| Image display contract | `docs/references/style-system/image-display-contract.md` |
| Style-system index | `docs/references/style-system/css-and-typography.md` |
| Typography rules | `docs/references/style-system/typography-reference.md` |
| Color and surface rules | `docs/references/style-system/color-surface-reference.md` |
| SVG icon pipeline | `docs/references/style-system/svg-icon-pipeline.md` |
| Motion policy | `docs/references/architecture/motion-architecture.md` |
| Abstraction boundaries | `docs/references/architecture/abstraction-boundaries.md` |
| JS runtime | `docs/references/architecture/javascript-runtime.md` |
| Launch gate | `docs/references/code-review/launch-gate.md` |
| Documentation audit | `docs/agent/documentation-audit.md` |
