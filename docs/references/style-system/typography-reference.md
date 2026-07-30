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
| `body-3xl` through `body-xs` | body copy tiers derived from the global effective body size |
| `heading-size-custom`, `body-size-custom` | schema-driven custom sizes with CSS variables |
| `.rte h1` through `.rte h6` | rich text/merchant HTML headings; independent from page outline |

## Body Tier Ratios

Default body copy inherits the effective global body size:

```text
effective body size = body_font_size * body_scale
```

The `body-*` tiers are proportional variants of that effective size, not fixed rem sizes and not local section text-size settings. This keeps emphasis, labels, and larger body copy responsive to the same global body controls and custom body font settings.

At the default desktop `body_font_size` of 16px, each tier is a strict 2px step on a parallel mobile/desktop ladder. Tier math is anchored to the desktop `body_font_size` token; mobile and desktop use different ratios so the same tier is 2px smaller on mobile.

Default inherited body size uses separate theme settings:

| Viewport | Setting | CSS variable | Default |
| --- | --- | --- | --- |
| Mobile | `body_font_size_mobile` | `--font-body-size-mobile` | `14px` (min `14`) |
| Desktop | `body_font_size` | `--font-body-size` | `16px` (min `16`) |

Both respect `body_scale`. Sliders only increase from those floors up to `32px`.

Body tier map at default desktop settings:

| Tier | Mobile ratio | PC ratio | Mobile px | PC px |
| --- | --- | --- | --- | --- |
| `body-xs` | `0.625` | `0.75` | `10px` | `12px` |
| `body-sm` | `0.75` | `0.875` | `12px` | `14px` |
| `body-md` | `0.875` | `1` | `14px` | `16px` |
| `body-lg` | `1` | `1.125` | `16px` | `18px` |
| `body-xl` | `1.125` | `1.25` | `18px` | `20px` |
| `body-2xl` | `1.25` | `1.375` | `20px` | `22px` |
| `body-3xl` | `1.375` | `1.5` | `22px` | `24px` |

On mobile and desktop, default inherit matches `body-md` when `body_font_size_mobile` is `14` and `body_font_size` is `16`.

Do not add section-level body text-size settings for ordinary paragraphs. Use `body-*` only when the text is still body semantics but needs a documented emphasis or microcopy tier.

`body-size-custom` is the custom-size escape hatch for body semantics. Its local `--body-size-custom` and `--body-size-custom-pc` values are multiplied by the global `body_scale`, so custom body sizes still move with the global body typography slider. `heading-size-custom` remains an absolute heading override and does not use body scale.

## Subtitle Base And Size Tiers

Default section typography should consume semantic markup, approved size tiers, and font setting layers separately:

- Headings use semantic `h1` through `h6` plus an approved `heading-*` tier when the native fallback is not the intended visual size.
- `typo-subtitle` is the only typography role utility. It aliases `subtitle-base`: family from `subtitle_font_source` (heading or body font) plus subtitle weight/line-height/letter-spacing/text-transform. It does not set font-size.
- Subtitle size must be composed separately, such as `typo-subtitle heading-2xl` or `typo-subtitle body-lg`.
- Title and ordinary body copy use `heading-*` / `body-*` tiers or default body inheritance - no title/body role utilities.
- Default body copy uses body settings. Explicit `body-*` tiers remain available as global-body-derived emphasis tiers.
- Opacity and muted copy use local styling (`text-theme-text/80`, etc.), not `body-*` tiers. Default body copy color comes from `body` in `assets/base.css` (80% foreground).

Do not add new role utilities for title, body, action, price, nav, or component text unless a future scoped API is explicitly designed.

## Component Typography Extensions

Component text defaults to body inheritance unless the component intentionally overrides it:

- Buttons, prices, nav, badges, labels, and form controls may inherit body typography by default. When they do, body global settings and scoped body settings that apply to the render tree should affect them.
- If a component uses a special 20px or 24px size, it needs a dedicated setting/token contract before that size is merchant-configurable.
- If button text later needs independent typography control, add a button typography API such as `button_*` settings and `--font-button-*` tokens, then make `.btn` consume those tokens.
- Do not add component-owned font-size overrides and still imply that body sliders or body dropdowns control them. Once a component overrides body size, it must either be intentionally fixed or wired to its own scoped API.

## Rules

- Prefer semantic headings first; add visual tier classes only when native scale is not correct.
- Semantic heading level (`h1`–`h6`) and visual `heading-*` tier are chosen independently: pick the tier that matches the design px target, not the tag name. Example: `<h3 class="heading-h2">` when the outline needs `h3` but the visual target is 24px desktop.
- `body-*` tiers are for non-heading body semantics only. Do not put `body-*` on `h1`–`h6`.
- Do not put heading tier classes on non-heading elements unless a reviewed exception exists.
- Use `typo-subtitle` on non-heading subtitle/support text when it should consume subtitle global font settings; compose its size separately with `heading-*` or `body-*`.
- Do not add `body-md` merely to restate default body text.
- Do not convert ordinary body copy into a section/block text-size setting; let it inherit the global body size.
- Use custom size utilities only with the required `--*-size-custom` variables.
- Preserve rich-text ownership: `.rte` heading mapping is not page outline semantics.

## Lint Coverage

`npm.cmd run lint:theme` enforces the main typography protocol:

- no `heading-base` or `body-base` in Liquid markup;
- no Tailwind text-size utilities on `h1` through `h6`;
- no heading class on non-heading elements, except documented exceptions.
