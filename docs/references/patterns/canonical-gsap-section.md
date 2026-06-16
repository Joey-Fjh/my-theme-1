# Canonical GSAP Choreography Section

Use this shape for **optional narrative choreography** after classifying the work through `AGENTS.md` `Motion Architecture`.

**Do not use GSAP for ordinary content/media reveal when CSS/Alpine is sufficient.** GSAP is reserved for complex homepage/storytelling choreography: timeline, parallax, scrub, split text, coordinated section storytelling, scroll-driven image movement.

If narrative value is unclear, use CSS/Alpine instead. If no approved narrative choreography remains, GSAP may be removed entirely.

## Valid GSAP Use

- Parallax
- Scroll-linked scrub
- Complex timeline sequences
- Split text animation
- Coordinated multi-section storytelling
- Brand-level site motion language

## Invalid GSAP Use (use CSS/Alpine instead)

- Simple fade
- Simple rise
- Simple image zoom
- Ordinary card entrance
- Ordinary section content reveal
- Ordinary media reveal

## Liquid

```liquid
<section
    data-section-id="{{ section.id }}"
    data-component-kind="section"
    data-component-type="canonical-gsap"
    data-component-id="{{ section.id }}"
    class="py-12 pc:py-16"
>
    <div class="container-page">
        {%- if section.settings.heading != blank -%}
            <h2 data-gsap-item>{{ section.settings.heading }}</h2>
        {%- endif -%}

        <div class="mt-8 grid gap-6 pc:grid-cols-3">
            {%- for block in section.blocks -%}
                <article class="surface p-6" data-gsap-item {{ block.shopify_attributes }}>
                    <h3>{{ block.settings.title }}</h3>
                    <p class="mt-3">{{ block.settings.text }}</p>
                </article>
            {%- endfor -%}
        </div>
    </div>
</section>
```

## JavaScript

### Local One-Off Choreography

Use this version when the animation is specific to one section and classified as narrative choreography.

```liquid
{%- javascript -%}
(function () {
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register(
        'canonical-gsap',
        {
            init(el) {
                if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
                    return {};
                }

                gsap.registerPlugin(ScrollTrigger);

                const ctx = gsap.context(() => {
                    const items = el.querySelectorAll('[data-gsap-item]');
                    if (!items.length) return;

                    gsap.set(items, { opacity: 0, y: 24 });
                    gsap.to(items, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.12,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 80%',
                            once: true,
                        },
                    });
                }, el);

                return { ctx };
            },

            destroy(_el, state) {
                state?.ctx?.revert();
            },
        },
        { lazy: true },
    );
})();
{%- endjavascript -%}
```

### Shared Motion Recipe Consumer

Use this shape once a shared choreography recipe exists under `window.__Theme__.Motion`.

```liquid
{%- javascript -%}
(function () {
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register(
        'canonical-gsap',
        {
            init(el) {
                const Motion = window.__Theme__?.Motion;
                const ctx = Motion?.gsap?.reveal?.(el, {
                    targets: '[data-gsap-item]',
                    trigger: el,
                });

                return { ctx };
            },

            destroy(_el, state) {
                state?.ctx?.revert?.();
            },
        },
        { lazy: true },
    );
})();
{%- endjavascript -%}
```

## Rules

- Classify GSAP work as narrative choreography under `AGENTS.md` `Motion Architecture` before editing. If the motion is ordinary content/media reveal, use CSS/Alpine instead.
- Use local GSAP for one-off section choreography.
- Use `window.__Theme__.Motion.gsap.*` when a matching shared choreography recipe already exists.
- Do not create a shared GSAP recipe for a single use unless it clearly belongs to the global motion language.
- Guard for missing `gsap` and `ScrollTrigger`.
- Always scope selectors to `el`.
- Always use `gsap.context(..., el)` and revert it in `destroy()`.
- Mark animation targets with `data-gsap-*` attributes.
- Do not implement GSAP scroll reveal by toggling Tailwind/CSS animation utility classes.
- Do not apply Alpine `x-transition` and GSAP to the same element for the same properties such as `opacity` or `transform`.
- Merchant-provided settings and block content may render directly; schema names, labels, and defaults still use `t:` keys.
