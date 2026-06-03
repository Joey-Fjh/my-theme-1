# Canonical Swiper Section

Use this shape for carousels. Swiper instances must be scoped to the section and destroyed during component teardown.

## Liquid

```liquid
<section
    data-section-id="{{ section.id }}"
    data-component-kind="section"
    data-component-type="canonical-swiper"
    data-component-id="{{ section.id }}"
    class="py-12 pc:py-16"
>
    <div class="container-page">
        <div class="swiper" data-swiper>
            <div class="swiper-wrapper">
                {%- for block in section.blocks -%}
                    <article class="swiper-slide surface p-6" {{ block.shopify_attributes }}>
                        <h3>{{ block.settings.title }}</h3>
                        <p class="mt-3">{{ block.settings.text }}</p>
                    </article>
                {%- endfor -%}
            </div>

            <div class="mt-6 flex items-center gap-3">
                <button type="button" class="btn btn-secondary" data-swiper-prev aria-label="{{ 'accessibility.previous_slide' | t }}">
                    {%- render 'icons', icon: 'icon-arrow2', size: 'sm', color: 'currentColor' -%}
                </button>
                <button type="button" class="btn btn-secondary" data-swiper-next aria-label="{{ 'accessibility.next_slide' | t }}">
                    {%- render 'icons', icon: 'icon-arrow2', size: 'sm', color: 'currentColor' -%}
                </button>
            </div>
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
        'canonical-swiper',
        {
            init(el) {
                const swiperEl = el.querySelector('[data-swiper]');
                if (!swiperEl || typeof Swiper === 'undefined') return {};

                const swiper = new Swiper(swiperEl, {
                    slidesPerView: 1,
                    spaceBetween: 16,
                    navigation: {
                        prevEl: el.querySelector('[data-swiper-prev]'),
                        nextEl: el.querySelector('[data-swiper-next]'),
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                    },
                });

                return { swiper };
            },

            destroy(_el, state) {
                state?.swiper?.destroy?.(true, true);
            },
        },
        { lazy: true },
    );
})();
{%- endjavascript -%}
```

## Rules

- Query navigation and pagination controls inside `el`.
- Return the Swiper instance in component state.
- Destroy Swiper with `destroy(true, true)`.
- Use translated aria labels for icon-only controls.
