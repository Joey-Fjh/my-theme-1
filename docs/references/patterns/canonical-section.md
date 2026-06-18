# Canonical Section

Use this as the smallest preferred shape for Shopify sections. Static sections should stay static; only add component wiring when lifecycle-managed JavaScript is required.

## Static Section

```liquid
<section
    data-section-id="{{ section.id }}"
    class="py-12 pc:py-16"
    style="
        --section-padding-top: {{ section.settings.padding_top }}px;
        --section-padding-bottom: {{ section.settings.padding_bottom }}px;
    "
>
    <div class="container-page">
        {%- if section.settings.heading != blank -%}
            <h2>{{ section.settings.heading }}</h2>
        {%- endif -%}

        {%- if section.settings.text != blank -%}
            <div class="rte rte--compact mt-4">
                {{ section.settings.text }}
            </div>
        {%- endif -%}
    </div>
</section>

{% schema %}
{
    "name": "t:sections.canonical_static.name",
    "settings": [
        {
            "type": "inline_richtext",
            "id": "heading",
            "label": "t:sections.canonical_static.settings.heading.label",
            "default": "t:sections.canonical_static.settings.heading.default"
        },
        {
            "type": "richtext",
            "id": "text",
            "label": "t:sections.canonical_static.settings.text.label"
        },
        {
            "type": "range",
            "id": "padding_top",
            "label": "t:sections.canonical_static.settings.padding_top.label",
            "min": 0,
            "max": 120,
            "step": 4,
            "unit": "px",
            "default": 48
        },
        {
            "type": "range",
            "id": "padding_bottom",
            "label": "t:sections.canonical_static.settings.padding_bottom.label",
            "min": 0,
            "max": 120,
            "step": 4,
            "unit": "px",
            "default": 48
        }
    ],
    "presets": [
        {
            "name": "t:sections.canonical_static.presets.default.name"
        }
    ]
}
{% endschema %}
```

## Lifecycle Section

```liquid
<section
    data-section-id="{{ section.id }}"
    data-component-kind="section"
    data-component-type="canonical-section"
    data-component-id="{{ section.id }}"
    class="py-12 pc:py-16"
>
    <div class="container-page">
        {%- if section.settings.heading != blank -%}
            <h2>{{ section.settings.heading }}</h2>
        {%- endif -%}

        <div data-canonical-target></div>
    </div>
</section>

{%- javascript -%}
(function () {
    const Components = window.__Theme__?.Components;
    if (!Components) return;

    Components.register(
        'canonical-section',
        {
            init(el) {
                const target = el.querySelector('[data-canonical-target]');
                return { target };
            },
            destroy(_el, _state) {},
        },
        { lazy: true },
    );
})();
{%- endjavascript -%}
```

## Rules

- Do not add `data-component-*` attributes unless JavaScript lifecycle management is needed.
- Pass Liquid values to JavaScript with `data-*`; do not put complex Liquid output into `x-data`.
- Keep richtext settings inside `.rte` or `.rte--compact`; do not wrap richtext in headings or paragraphs.
- Merchant-provided settings such as `section.settings.heading` may render directly; schema names, labels, and defaults still use `t:` keys.
- Use `t:` keys for schema names, labels, and text defaults, then define them in locale files.
- Schema setting IDs are public configuration. Do not rename existing IDs during cleanup.
