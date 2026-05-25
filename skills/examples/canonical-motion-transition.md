# Canonical Motion Transition

Use this shape for reusable Alpine/CSS state motion after classifying the work through `AGENTS.md` `Motion Architecture`.

State motion recipes cover open/close, show/hide, active/inactive, expanded/collapsed, loading/idle, and visible/hidden UI states. They do not cover scroll-triggered reveal, stagger choreography, parallax, or timeline motion; those belong to GSAP choreography recipes.

## Liquid Usage

```liquid
<div
    x-data="{ open: false }"
    @click.outside="open = false"
>
    <button
        type="button"
        :aria-expanded="String(open)"
        @click="open = !open"
    >
        {{ 'accessibility.toggle' | t }}
    </button>

    <div
        x-show="open"
        x-cloak
        {% render 'motion-transition', preset: 'dropdown' %}
    >
        {{ content }}
    </div>
</div>
```

## Motion Transition Snippet Shape

`snippets/motion-transition.liquid` owns the mapping from a semantic preset name to Alpine phase attributes.

```liquid
{%- case preset -%}
    {%- when 'fade' -%}
        x-transition:enter="motion-fade-enter"
        x-transition:enter-start="motion-fade-enter-start"
        x-transition:enter-end="motion-fade-enter-end"
        x-transition:leave="motion-fade-leave"
        x-transition:leave-start="motion-fade-leave-start"
        x-transition:leave-end="motion-fade-leave-end"

    {%- when 'dropdown' -%}
        x-transition:enter="motion-dropdown-enter"
        x-transition:enter-start="motion-dropdown-enter-start"
        x-transition:enter-end="motion-dropdown-enter-end"
        x-transition:leave="motion-dropdown-leave"
        x-transition:leave-start="motion-dropdown-leave-start"
        x-transition:leave-end="motion-dropdown-leave-end"
{%- endcase -%}
```

## CSS Preset Shape

`tailwind/tailwind.animates.css` owns the phase classes used by the snippet.

```css
@utility motion-fade-enter {
    transition: opacity var(--motion-duration-base, 200ms) var(--motion-ease-enter, ease-out);
}

@utility motion-fade-enter-start {
    opacity: 0;
}

@utility motion-fade-enter-end {
    opacity: 1;
}

@utility motion-fade-leave {
    transition: opacity var(--motion-duration-fast, 150ms) var(--motion-ease-exit, ease-in);
}

@utility motion-fade-leave-start {
    opacity: 1;
}

@utility motion-fade-leave-end {
    opacity: 0;
}

@utility motion-dropdown-enter {
    transition:
        opacity var(--motion-duration-base, 200ms) var(--motion-ease-enter, ease-out),
        transform var(--motion-duration-base, 200ms) var(--motion-ease-enter, ease-out);
}

@utility motion-dropdown-enter-start {
    opacity: 0;
    transform: translateY(calc(var(--motion-distance-sm, 0.5rem) * -1)) scale(var(--motion-scale-subtle, 0.98));
}

@utility motion-dropdown-enter-end {
    opacity: 1;
    transform: translateY(0) scale(1);
}
```

## Recommended First Presets

- `fade`: overlay, loading state, simple visibility.
- `dropdown`: menu/listbox popovers.
- `modal`: centered modal panel.
- `drawer-left`: left drawer panel.
- `drawer-right`: right drawer panel.
- `toast`: notification enter/leave.

## Rules

- Templates SHOULD consume motion by semantic preset name instead of duplicating raw Alpine `x-transition:*` groups.
- Add or change phase classes in `tailwind/tailwind.animates.css`, not inside component-specific CSS.
- Do not create component-specific motion tokens unless the value is reused across recipes or intentionally exposed through global motion settings.
- Alpine owns state; CSS owns state transition phase classes.
- Do not use this pattern for scroll-triggered reveal, stagger, parallax, timeline, or brand choreography. Use GSAP choreography recipes instead.
- Do not apply a state motion recipe and GSAP to the same element for the same properties such as `opacity` or `transform`.
