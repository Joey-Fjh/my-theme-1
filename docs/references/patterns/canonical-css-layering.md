# Canonical CSS Layering

Use Tailwind utilities first. Add CSS only when a reusable pattern or Tailwind limitation makes CSS clearer.

## One-Off Liquid Styling

```liquid
<div class="container-page grid gap-8 py-12 pc:grid-cols-2 pc:py-16">
    <h2>{{ 'sections.example.heading' | t }}</h2>
    <div class="rte rte--compact">
        {{ page.content }}
    </div>
</div>
```

Define any new translation keys in `locales/en.default.json` when copying this pattern into real theme code.

## Atomic Primitive: `tailwind/tailwind.elements.css`

```css
@utility badge-status {
    @apply inline-flex items-center rounded-full border border-theme-border-20 px-3 py-1 body-sm;
}
```

Use for small UI primitives such as buttons, badges, links, surfaces, fields, and icon wrappers.

## Composite Pattern: `tailwind/tailwind.components.css`

```css
@layer components {
    .canonical-card-list {
        @apply grid gap-4 pc:grid-cols-3;

        .canonical-card-list__item {
            @apply surface p-6;
        }
    }
}
```

Use for multi-element patterns with internal selectors.

## Snippet-Scoped Pattern: `tailwind/tailwind.snippets.css`

```css
@layer components {
    .canonical-snippet {
        @apply flex items-center gap-3;
    }
}
```

Use only when a snippet owns the class and the pattern is not a global component.

## Section Stylesheet Escape Hatch

```liquid
{%- stylesheet -%}
    .canonical-section-special {
        grid-template-areas:
            "media"
            "content";
    }
{%- endstylesheet -%}
```

Use section `{% stylesheet %}` only for section-specific CSS that Tailwind cannot express cleanly. Remove empty stylesheet blocks during cleanup.

## Rules

- Do not edit `assets/tailwind.output.css` manually.
- Do not use heading classes on non-heading elements.
- Do not use arbitrary colors to bypass theme tokens.
- Use inline `style` only for dynamic CSS variables, grid area names, or calculated Liquid values.
- Run `npm.cmd run build:tw` after changing Tailwind source files.
