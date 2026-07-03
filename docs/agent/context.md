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

1. Title role (`typo-title`)
2. Subtitle role (`typo-subtitle`)
3. Lead / action roles where emphasis or CTA copy needs a fixed step above default body
4. Body default inheritance (16px; no `typo-body`)
5. Custom local override when a section truly needs a different system tier

### Architecture Decision

- Semantic tags and visual typography roles must stay separate.
- `h1`-`h6` control document outline, SEO, and accessibility semantics.
- Typography roles control visual size and style.
- It is valid for `h1.typo-title`, `h2.typo-title`, and `h3.typo-title` to look the same while representing different outline levels.
- Do not make "title role means h1" or "subtitle role means h2".
- Preserve h1 uniqueness by choosing heading tags from page structure, not from visual size.

### Global Settings

Global typography settings in `config/settings_schema.json` control **family, style, weight, line-height, letter-spacing, and text-transform** only for:

- **Heading** — `font_picker` / custom font URL + `heading_*` style controls + `heading_scale` (tier primitives only)
- **Subtitle** — `subtitle_font_source` (heading or body family) + `subtitle_*` style controls; **no** `subtitle_scale` and no subtitle-specific font picker
- **Body** — `font_picker` / custom font URL + `body_*` style controls + `body_scale` (tier primitives only)

`snippets/css-variables.liquid` outputs `--font-heading-*`, `--font-subtitle-*`, and `--font-body-*` accordingly. Subtitle family/style resolve from the selected heading or body source, including custom-font toggles.

### CSS Ownership

- `assets/base.css` native `h1`-`h6` styles are fallback defaults for headings without explicit visual roles. Default body copy is 16px from document/body defaults — do not add `typo-body`.
- `tailwind/tailwind.typography.css` is the typography source of truth.
- **Base stacks:** `heading-base`, `subtitle-base`, `body-base` — font family/style/weight/line-height/letter-spacing/text-transform/color only; no role font-size.
- **Role utilities** (fixed sizes; do **not** use `heading_scale` / `body_scale`; do **not** set `font-medium` / `font-semibold`):

| Role | Base | PC size | Notes |
| --- | --- | --- | --- |
| `typo-title` | `heading-base` | 80px (`8rem`) | Weight from `heading_weight` |
| `typo-subtitle` | `subtitle-base` | 60px (`6rem`) | Weight from `subtitle_weight`; not `heading-2xl` |
| `typo-lead` | `body-base` | 24px (`2.4rem`) | Emphasis/intro copy |
| `typo-action` | `body-base` | 20px (`2rem`) | CTA / important clickable text size |

Mobile breakpoints use the fixed rem values defined in `tailwind.typography.css` (e.g. `typo-title` 5.6rem → 8rem at `breakpoint-pc`). Boldness beyond the global weight is applied at the consuming section, snippet, or component (e.g. `font-medium`, `font-semibold`) — not inside role utilities.

- **Tier primitives** (`heading-h1`, `heading-xl`, `heading-2xl`, `body-lg`, `body-md`, `body-sm`, etc.) remain unchanged. They are **not** default role mappings; they are reserved for future **local custom typography override** dropdown options when a section/block opts out of the default role.
- Do not remove existing tier primitives during this refactor.

### Consumption Chain

```text
Global typography settings (family/style/weight/spacing/transform; heading/body scale for tiers only)
-> snippets/css-variables.liquid CSS variables
-> tailwind.typography.css base stacks + role utilities (+ tier primitives for overrides)
-> section/snippet markup
```

Default consumers should use role utilities, not raw tier choices:

```liquid
<h2 class="typo-title">Section title</h2>
<p class="typo-subtitle">Section subtitle</p>
<p class="typo-lead">Intro or emphasized body copy</p>
<a class="typo-action font-medium" href="#">Shop now</a>
```

Local overrides should switch to an allowed `heading-*` / `body-*` tier only when a section/block setting explicitly opts into custom typography.

### Title And Subtitle Rules

- Title and subtitle are explicit role layers with fixed sizes decoupled from semantic heading level.
- Default title/subtitle appearance should be consistent across sections when no local override is configured.
- Section title markup should choose `h1`, `h2`, or `h3` based on semantic outline, while using `typo-title` for visual appearance.
- Subtitle usually should be `p` or another non-heading element. Use `h2`/`h3` for subtitle only when it truly participates in the page outline.
- Subtitle covers supporting section copy such as subheading, eyebrow, caption-like intro, and short title support text. It does not automatically include product price, badge text, nav, button text, form labels, or ordinary paragraphs.

### Body Rules

- Normal body copy should inherit 16px defaults from `assets/base.css` / `body-base` — no `typo-body` role.
- Use `typo-lead` for 24px emphasis/intro and `typo-action` for 20px CTA-sized text when a role class is needed; add `font-medium` / `font-semibold` at the consumer if required.
- Existing `body-md` that only repeats default body sizing should be removed during the body cleanup pass.
- Existing `body-lg`, `body-sm`, `body-xl`, or custom body sizing should not be mechanically removed. First classify whether it is intentional emphasis, component microcopy, or section text that should become a configurable custom override.
- If non-default body sizing is part of section-level content, prefer a section or block custom typography setting that chooses from approved `heading-*` / `body-*` tiers.
- Product price, discount, badge, nav, button, label, and other component-specific text should not be forced into the initial role pass. Leave an extension path for future roles such as `typo-price`, `typo-badge`, `typo-product-title`, `typo-nav`.

### Custom Override Rules

- Custom does not mean free-form arbitrary font sizes.
- Custom means selecting from approved `heading-*` / `body-*` tier primitives (which may still respect `heading_scale` / `body_scale`).
- A section should default to `typo-title` / `typo-subtitle` / `typo-lead` / `typo-action` / inherited body as appropriate.
- Only when custom is enabled should the section consume tiers such as `heading-2xl`, `heading-xl`, `heading-h2`, `body-lg`, or `body-sm` directly.
- Custom override changes visual class only; it must not change semantic heading tag choice.

### Non-Goals

- Do not edit merchant-owned `config/settings_data.json` or `templates/*.json` without explicit approval.
- Do not add `subtitle_scale`, `typo-body`, or role-level `font-medium` / `font-semibold`.
- Do not rewrite every section semantically in one sweep unless required for a documented accessibility/SEO blocker.
- Do not turn product/meta/button/badge typography into part of the initial title/subtitle/body pass.
- Do not introduce Tailwind text-size utilities on headings.
- Do not delete `heading-*` or `body-*` tier primitives.
- Do not continue broad global cleanup after this phase finishes.

### Completed (global + roles)

- Subtitle global settings (`subtitle_font_source`, style controls) and `--font-subtitle-*` variables.
- `subtitle-base` and role utilities: `typo-title`, `typo-subtitle`, `typo-lead`, `typo-action`.
- `subtitle_scale` removed by decision; role sizes are fixed in CSS.

### Remaining

- Migrate section/snippet markup from ad-hoc tiers and local sizing to role utilities.
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
