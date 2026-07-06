# Typography Reference

This file documents typography tiers and consumption rules. `AGENTS.md` remains the rule source.

## Source Of Truth

- Typography tier CSS lives in `tailwind/tailwind.typography.css`.
- Native heading defaults live in `assets/base.css`.
- Liquid must not use Tailwind `text-*` utilities for headings.
- Component-owned typography may live in `tailwind.components.css` or `tailwind.snippets.css` when it is part of a reusable API or snippet owner contract.

## Tier Families

| Family | Use |
| --- | --- |
| `heading-4xl`, `heading-3xl`, `heading-2xl`, `heading-xl` | display/marketing headings |
| `heading-h1` through `heading-h6` | explicit visual tier on semantic heading elements |
| native `h1` through `h6` without tier class | semantic outline using base defaults |
| `body-3xl` through `body-xs` | explicit body copy scale when default body is not enough |
| `heading-size-custom`, `body-size-custom` | schema-driven custom sizes with CSS variables |
| `.rte h1` through `.rte h6` | rich text/merchant HTML headings; independent from page outline |

## Subtitle Base And Size Tiers

Default section typography should consume semantic markup, approved size tiers, and font setting layers separately:

- Headings use semantic `h1` through `h6` plus an approved `heading-*` tier when the native fallback is not the intended visual size.
- `typo-subtitle` is the only typography role utility. It aliases `subtitle-base`: family from `subtitle_font_source` (heading or body font) plus subtitle weight/line-height/letter-spacing/text-transform. It does not set font-size.
- Subtitle size must be composed separately, such as `typo-subtitle heading-2xl` or `typo-subtitle body-lg`.
- Title and ordinary body copy use `heading-*` / `body-*` tiers or default body inheritance - no title/body role utilities.
- Default body copy uses body settings. Explicit `body-*` tiers remain available for local section/block choices and body-size overrides.
- Opacity is local styling (`text-theme-text/80`, etc.), not a typography setting or role.

Do not add new role utilities for title, body, action, price, nav, or component text unless a future scoped API is explicitly designed.

## Component Typography Extensions

Component text defaults to body inheritance unless the component intentionally overrides it:

- Buttons, prices, nav, badges, labels, and form controls may inherit body typography by default. When they do, body global settings and scoped body settings that apply to the render tree should affect them.
- If a component uses a special 20px or 24px size, it needs a dedicated setting/token contract before that size is merchant-configurable.
- If button text later needs independent typography control, add a button typography API such as `button_*` settings and `--font-button-*` tokens, then make `.btn` consume those tokens.
- Do not add component-owned font-size overrides and still imply that body sliders or body dropdowns control them. Once a component overrides body size, it must either be intentionally fixed or wired to its own scoped API.

## Rules

- Prefer semantic headings first; add visual tier classes only when native scale is not correct.
- Do not put heading tier classes on non-heading elements unless a reviewed exception exists.
- Use `typo-subtitle` on non-heading subtitle/support text when it should consume subtitle global font settings; compose its size separately with `heading-*` or `body-*`.
- Do not add `body-md` merely to restate default body text.
- Use custom size utilities only with the required `--*-size-custom` variables.
- Preserve rich-text ownership: `.rte` heading mapping is not page outline semantics.

## Lint Coverage

`npm.cmd run lint:theme` enforces the main typography protocol:

- no `heading-base` or `body-base` in Liquid markup;
- no Tailwind text-size utilities on `h1` through `h6`;
- no heading class on non-heading elements, except documented exceptions.

## Deferred Notes

- Broad `body-md` deduplication should be a dedicated cleanup pass.
- Semantic/visual heading mismatches should be fixed only when the owning page or component is scoped.
- Display heading consistency belongs with visual/design work, not drive-by refactors.
