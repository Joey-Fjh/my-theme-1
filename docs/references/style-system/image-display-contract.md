# Image Display Contract

Read when: changing `snippets/image.liquid`, image display modes, aspect ratio, placeholder behavior, or media callers.

This file documents `snippets/image.liquid` display behavior. CSS layer/token contracts live in `docs/references/style-system/css-architecture.md`.

## Display Modes

| Mode | Use case | Wrapper behavior | Image fit default |
| --- | --- | --- | --- |
| `frame` | fixed frame, aspect-ratio box, card image, gallery cell, full-bleed media | wrapper fills the frame | `object-cover` |
| `natural` | logo, editorial image, decorative brush, content image preserving intrinsic ratio | wrapper follows natural image ratio | `object-contain` unless overridden |

Calls without an explicit mode default to `frame`.

Nil images default to the shared `framed` placeholder surface so adjacent empty media remains visually distinct. The shared frame uses an opaque token-mixed surface so underlying section or root colors cannot bleed through SVG transparency. Pass `placeholder_style: 'plain'` only when the media is intentionally unframed, such as a full-bleed background, or when a composite caller applies the shared frame to its complete empty-state surface to avoid a nested double border. The caller still owns the placeholder family, aspect ratio, and outer layout.

## Parameters

| Parameter | Meaning |
| --- | --- |
| `image` | Shopify image object |
| `mode` | `frame` or `natural`; defaults to `frame` |
| `fit` | explicit object-fit intent such as `cover` or `contain` |
| `position` | optional explicit object-position whitelist value; see Object-position precedence |
| `placeholder_style` | nil-image surface: `framed` (default) or `plain`; `plain` delegates visible boundary ownership to the caller and framing never affects a real image |
| `aspect_ratio` | CSS ratio (`16/9`, `3/2`) or vocabulary keyword: `adapt`, `1:1`, `4:5`, `3:2`, `16:9` (mapped in `snippets/image.liquid`; slash forms unchanged) |
| `class` / `wrapper_class` | wrapper classes; `wrapper_class` is preferred |
| `img_class` | image element classes |
| `sizes`, `widths`, `loading`, `fetchpriority`, `alt` | rendering and performance metadata |
| `mobile_image` | optional Shopify image for viewports below `pc` (48rem); renders `<picture>` with a mobile `<source>` and the desktop `image` on the lone `<img>`. Omit to keep the desktop-only markup byte-identical to the pre-parameter path. |

## Sizes and widths

- `sizes` describes the width the image renders at in its layout. Derive it from the layout (for example the `grid-list` column count) across the `page_width` and `page_margin` setting ranges in `config/settings_schema.json`. At the browser's default font size it must never be smaller than the rendered width; a small overestimate is acceptable.
- `widths` covers about twice the largest rendered width (for 2x displays) in a few steps; more steps add no quality.
- `image.liquid` prefixes `auto, ` to the `sizes` of every lazy image, so browsers that support `sizes="auto"` pick from the laid-out width and other browsers use the given value (MDN, `<img>` `sizes`; `auto` is valid only with `loading="lazy"`). Eager images, such as the first card or the first gallery image, use the given value alone.
- Known limitation: `grid-list` columns and page margins are in rem, so a larger browser default font widens columns; browsers without `sizes="auto"` support (Safari as of 2026-09) may then pick a source smaller than the rendered width. Declaring `100vw` below 1200px would avoid it at the cost of larger downloads for every visitor, so it is accepted.
- Reference values for `grid-list` items: `sizes: '(min-width: 1200px) 33vw, (min-width: 800px) 50vw, 100vw'` and `widths: '400,700,1000,1200,1600'`.

## Object-position precedence

Final `object-position` on the rendered `<img>` follows this order:

1. **Caller-provided valid `position`** — whitelist only (`center`, `top`, `bottom`, `left`, `right`, and compounds such as `top left`). When present and valid, it overrides Shopify focal point output from `image_tag`.
2. **`image_tag` automatic focal point** — when the caller omits `position`, do not set `--image-object-position`. Shopify `image_tag` may emit inline `object-position: X% Y%` from the image focal point; that inline style must remain effective.
3. **`center`** — when the caller omits `position` and `image_tag` does not emit a focal-point style, the snippet CSS falls back to `center`.

Implementation rules:

- Record whether the caller passed `position` **before** applying any default. A silent `position | default: 'center'` would incorrectly override every focal point.
- Never feed focal-point percentage strings into the fixed `position` whitelist.
- Invalid explicit `position` values fall back to `center` and still count as an explicit override.
- `natural` / `contain` modes must not be forced to `cover` or gain extra cropping because of position/focal handling.

## Fit Detection

If `img_class` already contains an `object-*` utility, including responsive variants, the snippet should respect caller intent and not append a conflicting fit utility. Otherwise the explicit `fit` parameter or mode default applies.

## Decision Flow

1. Is the image inside a fixed frame or aspect-ratio container? Use `mode: 'frame'`.
2. Should the image keep its natural ratio? Use `mode: 'natural'`.
3. Does the merchant need an explicit crop anchor that must beat Shopify focal point? Pass a whitelist `position`.
4. Should Shopify focal point apply? Omit `position` and let `image_tag` emit it.
5. Does the merchant need cover-vs-contain control? Expose or pass `fit`.
6. The caller decides semantic mode; `image.liquid` should not guess business intent.

## Ratio vocabulary (5-C3a)

| Keyword | Maps to |
| --- | --- |
| `adapt` | Intrinsic image ratio, or placeholder ratio when image is blank |
| `1:1` | `1/1` |
| `4:5` | `4/5` |
| `3:2` | `3/2` |
| `16:9` | `16/9` |

Callers that already pass slash ratios (for example `3/4`, `16/9`) are unchanged.

## Current Contract

- `image.liquid` is the base image primitive.
- Frame mode is the default for current callers: product media, the product card, cart line items, collection and blog cards, and the article image. The header logo passes `mode: 'natural'`.
- `placeholder_style: 'plain'` is used by `sections/brand-statement.liquid` and `sections/newsletter-banner.liquid`, and `position` by the same two sections; keep both working when changing the snippet.

## Review Checklist

- Do not bypass `image.liquid` with raw `<img>` unless explicitly justified. Current exception: `templates/gift_card.liquid` renders without the main layout and outputs the shop logo with `image_tag` directly.
- Do not use wrapper classes to express image fit; use `img_class`, `fit`, or `position`.
- Do not default `position` before detecting whether the caller passed it.
- Above-the-fold image changes require visual/performance review.
- If Tailwind source changes for image display, run `npm.cmd run build:tw`.
