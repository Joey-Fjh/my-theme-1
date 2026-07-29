# Color And Surface Reference

This file documents color ownership, surface consumption, inline style boundaries, z-index, and CSS ownership rules. `AGENTS.md` remains the rule source.

## Color Ownership

- Merchant color schemes produce RGB custom properties through `snippets/css-variables.liquid`.
- Liquid sections choose `color_scheme`; theme code consumes scheme tokens through utilities such as `bg-theme-bg`, `text-theme-text`, and registered surface helpers.
- Do not hardcode brand colors or edit merchant-owned color scheme values without explicit approval.

## Page Canvas

- `settings.page_canvas_color_scheme` explicitly owns the `<body>` canvas used behind sections, during overscroll, and in areas without their own color-scheme scope.
- The first configured color scheme remains the `:root` token fallback; it is not the implicit visible page-canvas decision.
- Section, overlay, drawer, modal, and component color-scheme scopes override the body canvas normally.
- A section without its own color setting, such as Google Map, may inherit the page canvas for spacing around its platform content. Do not add a redundant local color-scheme setting only to cover that spacing.

## Surface Roles

Use one surface role per node. Do not layer multiple independent surface roles on the same element.

| Role | Typical use |
| --- | --- |
| `color-{{ section.settings.color_scheme }}` | section or component color-scheme scope |
| `surface-section` | main section surface/gradient layer |
| `surface-component` | cards, drawers, dialogs, dropdowns, panels |
| `surface-inverted` | intentional foreground/background inversion |
| local opacity effects | media controls, scrims, skeletons, loading overlays |

Opacity variants such as `bg-theme-bg/80` are local effects, not a reason to invent a new surface role.

## Hardcoded Color Rules

- Use semantic tokens or scheme utilities for theme UI.
- Static values are allowed only for platform bridges, transparent overlays, focus/feedback effects, or documented media/local effects.
- If a color decision affects merchant branding, route through schema/color-scheme tokens.

## Inline Styles

Allowed inline styles:

- CSS custom properties passed from Liquid to scoped CSS;
- Shopify/platform-required media values;
- per-render geometry values that cannot be expressed by static utilities.

Avoid inline styles for ordinary colors, spacing, typography, or hover states.

## z-Index

Use semantic z-index utilities or variables for layered UI. Keep overlay ordering predictable across header, drawer, dialog, lightbox, media modal, toast, and Shopify payment surfaces.

## CSS Ownership Reminders

- Section-root scoped CSS does not belong in `tailwind.components.css`.
- Reusable composite APIs belong in `tailwind.components.css` when they have 2+ unrelated consumers.
- Snippet-family deltas belong in `tailwind.snippets.css`.
- Element primitives such as button/link/field/close-button belong in `tailwind.elements.css`.
- Motion capabilities belong in `tailwind.animates.css`; trigger logic belongs in JS/Alpine.

## Review Checklist

- Does the element inherit the intended color scheme?
- Is the surface role singular and appropriate?
- Is the color hardcoded or merchant-configurable?
- Does z-index interact with cart, dialogs, search, filters, lightbox, toast, or header?
- If Tailwind source changed, run `npm.cmd run build:tw`.
