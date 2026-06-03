# Canonical Accessibility

Use these patterns for keyboard-operable, named, and state-aware UI. Accessibility rules live in root `AGENTS.md`; this file provides copyable examples.

## Icon-Only Button

```liquid
<button
    type="button"
    class="inline-flex h-10 w-10 items-center justify-center"
    aria-label="{{ 'accessibility.close' | t }}"
    @click="close()"
>
    {%- render 'icons', icon: 'icon-close', size: 'sm', color: 'current' -%}
</button>
```

Rules:

- Use a real `button` for actions.
- Use translated `aria-label` when there is no visible text.
- The icon remains decorative; the button owns the accessible name.

## Disclosure / Accordion

```liquid
<div x-data="{ open: false }">
    <button
        type="button"
        id="faq-trigger-{{ block.id }}"
        class="flex w-full items-center justify-between"
        :aria-expanded="String(open)"
        aria-controls="faq-panel-{{ block.id }}"
        @click="open = !open"
    >
        <span>{{ block.settings.title }}</span>
        {%- render 'icons', icon: 'icon-arrow', size: 'sm', color: 'current' -%}
    </button>

    <div
        id="faq-panel-{{ block.id }}"
        role="region"
        aria-labelledby="faq-trigger-{{ block.id }}"
        x-show="open"
        x-cloak
        {% render 'motion-transition', preset: 'fade' %}
    >
        {{ block.settings.content }}
    </div>
</div>
```

Rules:

- Trigger is a `button`.
- Use `aria-expanded` on the trigger.
- Use `aria-controls` when the panel has a stable ID.
- Avoid making hidden panel content focusable when closed.

## Dialog / Drawer

```liquid
<button
    type="button"
    data-dialog-trigger="cart-drawer"
    aria-haspopup="dialog"
    @click="$store.dialog.open('cart-drawer')"
>
    {{ 'cart.title' | t }}
</button>

<div
    x-data="{}"
    x-show="$store.dialog.active === 'cart-drawer'"
    x-cloak
    role="dialog"
    aria-modal="true"
    aria-labelledby="cart-drawer-title"
    @keydown.escape.window="$store.dialog.close()"
>
    <h2 id="cart-drawer-title">{{ 'cart.title' | t }}</h2>

    <button
        type="button"
        aria-label="{{ 'accessibility.close' | t }}"
        @click="$store.dialog.close()"
    >
        {%- render 'icons', icon: 'icon-close', size: 'sm', color: 'current' -%}
    </button>

    {{ content }}
</div>
```

Rules:

- Dialog container uses `role="dialog"` and `aria-modal="true"`.
- Dialog has `aria-labelledby` or `aria-label`.
- Escape closes transient UI.
- Opening should move focus into the dialog when possible.
- Closing should return focus to the trigger when possible.

## Tabs

```liquid
<div x-data="tabControl('first')">
    <div role="tablist" aria-label="{{ 'accessibility.tabs' | t }}">
        {%- for block in section.blocks -%}
            <button
                type="button"
                role="tab"
                id="tab-{{ block.id }}"
                aria-controls="panel-{{ block.id }}"
                :aria-selected="String(activeIndex === {{ forloop.index0 }})"
                :tabindex="activeIndex === {{ forloop.index0 }} ? 0 : -1"
                @click="setActive({{ forloop.index0 }})"
            >
                {{ block.settings.title }}
            </button>
        {%- endfor -%}
    </div>

    {%- for block in section.blocks -%}
        <div
            role="tabpanel"
            id="panel-{{ block.id }}"
            aria-labelledby="tab-{{ block.id }}"
            x-show="activeIndex === {{ forloop.index0 }}"
        >
            {{ block.settings.content }}
        </div>
    {%- endfor -%}
</div>
```

Rules:

- Custom tabs need `tablist`, `tab`, and `tabpanel` roles.
- Active tab uses `aria-selected="true"` and `tabindex="0"`.
- Inactive tabs use `tabindex="-1"` when implementing roving focus.

## Live Status

```liquid
<div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    x-text="statusMessage"
></div>
```

Rules:

- Use polite live regions for non-critical updates such as cart or toast messages.
- Do not use assertive announcements unless the message is urgent.

## Images

```liquid
{%- if image != blank -%}
    {{
        image
        | image_url: width: 1200
        | image_tag:
            loading: 'lazy',
            alt: image.alt
    }}
{%- endif -%}

{%- comment -%} Decorative image {%- endcomment -%}
{{
    decorative_image
    | image_url: width: 800
    | image_tag:
        loading: 'lazy',
        alt: ''
}}
```

Rules:

- Every image needs `alt`.
- Use image-provided alt text when available.
- Decorative images use empty alt text.

## Audit Queries

Useful starting points:

```bash
rg -n "<(div|span)[^>]*(@click|onclick)|role=\"button\"|tabindex=\"0\"|aria-hidden=\"true\"|aria-label=|x-show|role=\"dialog\"|role=\"tab\"" sections snippets
rg -n "image_tag|<img|alt=" sections snippets
```

Queries find candidates only. Review semantics before editing.
