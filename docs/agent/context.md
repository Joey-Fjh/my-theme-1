# Agent Context

Short cross-session relay. `AGENTS.md` is the rule source; durable contracts live in `docs/references/`.

## Current State

- Branch: `feat/ai-test`.
- Validation on this Windows workspace: use `npm.cmd`, not plain `npm run`.
- Global animation setting optimization is treated as complete. Do not reopen broad motion cleanup unless QA finds a scoped defect.
- Typography/font refactor is the last planned global code-adjustment stage before launch.
- After typography/font refactor, do not run broad exploratory code scans or global refactors before launch. Allowed work is limited to documented QA defects, launch blockers from lint/Theme Check/accessibility/SEO/Theme Store review, documentation updates, and tightly scoped local fixes.
- Launch-ready remains REQUEST CHANGES until storefront manual QA is recorded.
- Avoid broad Liquid extraction by default. Agent-driven Liquid reuse is high-risk here; only extend shared snippets when there is clear repeated stable behavior and low merchant/config impact.

## Typography/Font Refactor

### Goal

Unify theme typography around visual roles rather than section-by-section "felt" font-size choices. The current problem is that headings, subtitles, and body copy often consume `h1`-`h6`, `heading-*`, `body-lg`, `body-md`, or local CSS directly, so similar text roles vary across sections.

The refactor should make the default storefront typography predictable:

1. Title role
2. Subtitle role
3. Body default inheritance
4. Custom local override when a section truly needs a different system tier

### Architecture Decision

- Semantic tags and visual typography roles must stay separate.
- `h1`-`h6` control document outline, SEO, and accessibility semantics.
- Typography roles control visual size and style.
- It is valid for `h1.typo-title`, `h2.typo-title`, and `h3.typo-title` to look the same while representing different outline levels.
- Do not make "title role means h1" or "subtitle role means h2".
- Preserve h1 uniqueness by choosing heading tags from page structure, not from visual size.

### CSS Ownership

- `assets/base.css` native `h1`-`h6` styles are fallback defaults for headings without explicit visual roles.
- `tailwind/tailwind.typography.css` is the typography source of truth.
- Existing tier primitives such as `heading-h1`, `heading-xl`, `body-lg`, `body-md`, and `body-sm` remain visual tier primitives and custom override options.
- Add typography role utilities in `tailwind/tailwind.typography.css`, for example:
  - `typo-title` maps to a default title tier such as `heading-h1`.
  - `typo-subtitle` maps to a default subtitle tier such as `body-lg` or an approved subtitle tier.
- Do not remove existing tier primitives during the first pass. They are still useful as role mappings, legacy tiers, and custom override choices.

### Consumption Chain

The intended chain is:

```text
Global typography settings
-> snippets/css-variables.liquid CSS variables
-> tailwind.typography.css tier primitives
-> tailwind.typography.css role utilities
-> section/snippet markup
```

Default consumers should use role utilities, not raw tier choices:

```liquid
<h2 class="typo-title">Section title</h2>
<p class="typo-subtitle">Section subtitle</p>
```

Local overrides should switch to an allowed system tier only when a section/block setting explicitly opts into custom typography.

### Title And Subtitle Rules

- Title and subtitle should become explicit role layers.
- Default title/subtitle appearance should be consistent across sections when no local override is configured.
- Section title markup should choose `h1`, `h2`, or `h3` based on semantic outline, while using `typo-title` for visual appearance.
- Subtitle usually should be `p` or another non-heading element. Use `h2`/`h3` for subtitle only when it truly participates in the page outline.
- Subtitle covers supporting section copy such as subheading, eyebrow, caption-like intro, and short title support text. It does not automatically include product price, badge text, nav, button text, form labels, or ordinary paragraphs.

### Body Rules

- Body copy should not be fully role-classed by default.
- Normal body copy should inherit the `body` defaults from `assets/base.css`.
- Do not add `typo-body` everywhere just to restate the default.
- Existing `body-md` that only repeats default body sizing should be removed during the body cleanup pass.
- Existing `body-lg`, `body-sm`, `body-xl`, or custom body sizing should not be mechanically removed. First classify whether it is intentional emphasis, component microcopy, or section text that should become a configurable custom override.
- If non-default body sizing is part of section-level content, prefer adding/using a section or block custom typography setting that chooses from approved system tiers.
- Product price, discount, badge, nav, button, label, and other component-specific text should not be forced into the initial body cleanup. Leave an extension path for future roles such as `typo-price`, `typo-badge`, `typo-product-title`, `typo-nav`, or `typo-button`.

### Custom Override Rules

- Custom does not mean free-form arbitrary font sizes.
- Custom means selecting from approved typography tier primitives defined by the style system.
- A section should default to `typo-title` / `typo-subtitle` / inherited body.
- Only when custom is enabled should the section consume `heading-2xl`, `heading-xl`, `heading-h2`, `body-lg`, `body-sm`, or other approved tiers directly.
- Custom override changes visual class only; it must not change semantic heading tag choice.

### Non-Goals

- Do not edit merchant-owned `config/settings_data.json` or `templates/*.json` without explicit approval.
- Do not rewrite every section semantically in one sweep unless required for a documented accessibility/SEO blocker.
- Do not turn product/meta/button/badge typography into part of the initial title/subtitle/body pass.
- Do not introduce Tailwind text-size utilities on headings.
- Do not delete `heading-*` or `body-*` tier primitives in the first typography pass.
- Do not continue broad global cleanup after this phase finishes.

## Validation

Use the smallest command that proves the change:

- `npm.cmd run build:tw` after Tailwind source changes.
- `npm.cmd run lint` after meaningful Liquid, JS, CSS, schema, or locale changes.
- `npm.cmd test` after meaningful theme changes.
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
| Typography rules | `docs/references/style-system/typography-reference.md` |
| Style-system index | `docs/references/style-system/css-and-typography.md` |
| CSS layers and style contracts | `docs/references/style-system/css-architecture.md` |
| Motion policy | `docs/references/architecture/motion-architecture.md` |
| Abstraction boundaries | `docs/references/architecture/abstraction-boundaries.md` |
| JS runtime | `docs/references/architecture/javascript-runtime.md` |
| Launch gate | `docs/references/code-review/launch-gate.md` |
