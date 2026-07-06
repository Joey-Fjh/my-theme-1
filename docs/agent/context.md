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

Unify theme typography around merchant-controlled heading, subtitle, and body settings without multiplying role utilities for every text use case. The current problem is that headings, subtitles, and body copy often consume `h1`-`h6`, `heading-*`, `body-lg`, `body-md`, or local CSS directly, so similar text decisions vary across sections.

The refactor should make the default storefront typography predictable:

1. Heading size system: semantic heading tags plus approved `heading-*` tiers controlled by heading settings and `heading_scale`.
2. Subtitle font setting layer: `subtitle-base` consumes subtitle family/style/weight/spacing/transform settings, but subtitle size comes from the heading/body tier selected by the consumer. There is no subtitle scale.
3. Body size system: default body settings, body size settings, and approved `body-*` tiers for section/block overrides. No broad `typo-body`, `typo-lead`, `typo-action`, nav, price, or button role pass.
4. Local override when a section truly needs a different approved system tier.

### Architecture Decision

- Semantic tags, font setting layers, and visual size tiers must stay separate.
- `h1`-`h6` control document outline, SEO, and accessibility semantics.
- Visual size comes from `heading-*`, `body-*`, native defaults, or controlled custom-size utilities.
- Subtitle is the only extra typography setting layer. It controls subtitle font attributes, not subtitle size.
- It is valid for `h1.heading-3xl`, `h2.heading-3xl`, and `h3.heading-3xl` to look the same while representing different outline levels.
- Do not make "title means h1" or "subtitle means h2".
- Preserve h1 uniqueness by choosing heading tags from page structure, not from visual size.

### Global Settings

Global typography settings in `config/settings_schema.json` control the merchant-facing typography knobs:

- **Heading** - `font_picker` / custom font URL + `heading_*` style controls + `heading_scale`
- **Subtitle** - `subtitle_font_source` (heading or body family) + `subtitle_*` style controls; **no** `subtitle_scale` and no subtitle-specific font picker. Subtitle size is chosen by the consuming section through the normal heading/body size system.
- **Body** - `font_picker` / custom font URL + `body_font_size` (16-32px) + `body_*` style controls + `body_scale` (%)

`snippets/css-variables.liquid` outputs `--font-heading-*`, `--font-subtitle-*`, and `--font-body-*` accordingly. Subtitle family/style resolve from the selected heading or body source, including custom-font toggles.

### CSS Ownership

- `assets/base.css` native `h1`-`h6` styles are fallback defaults for headings without explicit visual tiers. Default body copy comes from document/body defaults and body settings - do not add `typo-body`.
- `tailwind/tailwind.typography.css` is the typography source of truth.
- **Base stacks:** `heading-base`, `subtitle-base`, `body-base` - font family/style/weight/line-height/letter-spacing/text-transform/color only; no independent role font-size.
- **Subtitle role:** `typo-subtitle` (alias of `subtitle-base`) - family from `subtitle_font_source` (heading or body) plus subtitle weight/line-height/letter-spacing/text-transform; **no font-size**. Compose with `heading-*` or `body-*` at the consumer.
- **Tier primitives** (`heading-h1`, `heading-xl`, `heading-2xl`, `body-lg`, `body-md`, `body-sm`, etc.) remain unchanged. They are the approved size vocabulary for default section choices and local custom typography override dropdowns.
- Do not remove existing tier primitives during this refactor.

### Consumption Chain

```text
Global typography settings (heading/subtitle/body font controls and heading/body scale)
-> snippets/css-variables.liquid CSS variables
-> tailwind.typography.css base stacks + tier primitives (+ subtitle-base when needed)
-> section/snippet markup
```

Default consumers should compose semantic markup, font setting layers, and approved size tiers:

```liquid
<h2 class="heading-3xl">Section title</h2>
<p class="typo-subtitle heading-2xl">Section subtitle</p>
<p>Ordinary body copy inherits body defaults.</p>
```

Local overrides should switch to an allowed `heading-*` / `body-*` tier only when a section/block setting explicitly opts into custom typography. Opacity is local styling (`text-theme-text/80`, etc.), not a typography setting.

### Title And Subtitle Rules

- Title is not a separate typography role. Section title markup should choose `h1`, `h2`, or `h3` based on semantic outline, while using the appropriate heading tier for visual appearance.
- Subtitle usually should be `p` or another non-heading element. Use `h2`/`h3` for subtitle only when it truly participates in the page outline.
- Subtitle uses `typo-subtitle` for font settings and a separate approved size tier for size.
- Subtitle covers supporting section copy such as subheading, eyebrow, caption-like intro, and short title support text. It does not automatically include product price, badge text, nav, button text, form labels, or ordinary paragraphs.

### Body Rules

- Normal body copy should inherit body defaults from document/body and merchant body settings - no `typo-body`, `typo-lead`, or `typo-action`.
- Existing `body-md` that only repeats default body sizing should be removed during the body cleanup pass.
- Existing `body-lg`, `body-sm`, `body-xl`, or custom body sizing should not be mechanically removed. First classify whether it is intentional emphasis, component microcopy, or section text that should become a configurable custom override.
- If non-default body sizing is part of section-level content, prefer a section or block custom typography setting that chooses from approved `heading-*` / `body-*` tiers.
- Product price, discount, badge, nav, button, label, and other component-specific text should not be forced into the initial role pass. Component owners can use local CSS, approved tiers, or future scoped APIs when a real repeated pattern appears.

### Component Typography Extension Rules

- Component text can default to body inheritance. In that state, global body settings and any scoped body setting that actually applies to the render tree should affect it.
- If a component text surface opts into a special size such as 20px or 24px, that size must be controlled by a dedicated setting/token contract before it is considered merchant-configurable. For example, button typography should use future `button_*` settings and `--font-button-*` tokens before `.btn` is expected to respond independently.
- Do not add untracked component-only font sizes and then claim body global sliders or section body dropdowns control them. If the component overrides body sizing, body settings will no longer affect that surface unless the override is wired back to a setting/token.
- If a component needs a fixed visual size, classify whether it is still body content or component chrome. Body content should use the body size system; component chrome needs a component API before it becomes independently configurable.

### Custom Override Rules

- Custom does not mean free-form arbitrary font sizes.
- Custom means selecting from approved `heading-*` / `body-*` tier primitives (which may still respect `heading_scale` / `--font-body-scale`).
- A section should default to a documented heading tier, `subtitle-base` plus a documented size tier when it has subtitle copy, and inherited body as appropriate.
- Only when custom is enabled should the section consume tiers such as `heading-2xl`, `heading-xl`, `heading-h2`, `body-lg`, or `body-sm` directly.
- Custom override changes visual class only; it must not change semantic heading tag choice.

### Non-Goals

- Do not edit merchant-owned `config/settings_data.json` or `templates/*.json` without explicit approval.
- Do not add `subtitle_scale`, `typo-title`, `typo-body`, `typo-lead`, `typo-action`, or role-level `font-medium` / `font-semibold`.
- Do not rewrite every section semantically in one sweep unless required for a documented accessibility/SEO blocker.
- Do not turn product/meta/button/badge typography into part of the initial title/subtitle/body pass.
- Do not introduce Tailwind text-size utilities on headings.
- Do not delete `heading-*` or `body-*` tier primitives.
- Do not continue broad global cleanup after this phase finishes.

### Completed (global + roles)

- Subtitle global settings (`subtitle_font_source`, style controls) and `--font-subtitle-*` variables.
- `typo-subtitle` / `subtitle-base` as the retained subtitle font setting layer (`subtitle_font_source` + subtitle style props).
- `subtitle_scale` removed by decision; subtitle size uses the normal heading/body size system selected by the consumer.

### Remaining

- Migrate section/snippet markup from ad-hoc tiers and local sizing to documented heading/body tiers plus `subtitle-base` where subtitle settings are needed.
- Add section/block custom typography override schema that selects from `heading-*` / `body-*` tiers.
- Body cleanup pass (`body-md` deduplication, classify non-default body tiers).

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
