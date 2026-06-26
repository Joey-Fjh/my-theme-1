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

## Rules

- Prefer semantic headings first; add visual tier classes only when native scale is not correct.
- Do not put heading tier classes on non-heading elements unless a reviewed exception exists.
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
