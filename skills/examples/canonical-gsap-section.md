# Canonical GSAP Section

Use this shape for scroll-triggered section animation. GSAP belongs inside `Components.register()` so it can be scoped and destroyed correctly.

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

## Rules

- Guard for missing `gsap` and `ScrollTrigger`.
- Always scope selectors to `el`.
- Always use `gsap.context(..., el)` and revert it in `destroy()`.
- Mark animation targets with `data-gsap-*` attributes.
- Merchant-provided settings and block content may render directly; schema names, labels, and defaults still use `t:` keys.
