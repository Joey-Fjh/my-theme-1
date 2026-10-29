# Image Display Contract

Read when: changing `snippets/image.liquid`, image display modes, aspect ratio, placeholder behavior, or media callers.

Display behavior of `snippets/image.liquid`. CSS layer and token contracts live in `docs/references/style-system/css-architecture.md`.

## Display Modes

| Mode | Use case | Wrapper behavior | Image fit default |
| --- | --- | --- | --- |
| `frame` | Fixed frame, aspect-ratio box, card image, gallery cell, full-bleed media | Wrapper fills the frame | `object-cover` |
| `natural` | Logo, editorial image, decorative brush, content image that keeps its intrinsic ratio | Wrapper follows the natural ratio | `object-contain` unless overridden |

Calls without an explicit mode default to `frame`. The caller chooses the mode. `image.liquid` does not guess business intent.

A nil image uses the shared `framed` placeholder so adjacent empty media stays distinct. That frame uses an opaque token-mixed surface so section or root colours cannot bleed through SVG transparency. Pass `placeholder_style: 'plain'` only when the media is intentionally unframed (a full-bleed background) or when a composite caller already frames its empty state, so the borders do not nest. The caller still owns the placeholder family, aspect ratio, and outer layout.

## Parameters

The parameter list is the `{% doc %}` block in `snippets/image.liquid`.

## Sizes and widths

- `sizes` is the width the image renders at. Derive it from the layout (for example the `grid-list` column count) across the `page_width` and `page_margin` ranges in `config/settings_schema.json`. At the browser's default font size it must not be smaller than the rendered width; a small overestimate is acceptable.
- `test:layout` runs the `image-sizes` check (`.agents/tools/layout-check/checks.mjs`): it fails when the resolved `sizes` value at a viewport is more than 2px below the drawn width (cover uses the larger of box width and box height × intrinsic ratio; contain uses the box width capped by height × ratio).
- `widths` covers about twice the largest rendered width (2x displays) in a few steps. More steps add no quality.
- `image.liquid` prefixes `auto, ` on the `sizes` of every lazy image, so browsers that support `sizes="auto"` use the laid-out width and others use the given value (MDN, `<img>` `sizes`; `auto` is valid only with `loading="lazy"`). Eager images, such as the first card or the first gallery image, use the given value alone.
- Known limitation: `grid-list` columns and page margins are in rem, so a larger default font widens columns. Browsers without `sizes="auto"` (Safari as of 2026-09) may then pick a source smaller than the rendered width. Declaring `100vw` below 1200px would avoid that and download more for every visitor, so the gap is accepted.
- Reference values for `grid-list` items: `sizes: '(min-width: 1200px) 33vw, (min-width: 800px) 50vw, 100vw'` and `widths: '400,700,1000,1200,1600'`.

## Object-position precedence

Final `object-position` on the rendered `<img>`:

1. **Caller-provided valid `position`.** Whitelist only (`center`, `top`, `bottom`, `left`, `right`, and compounds such as `top left`). A valid value overrides the Shopify focal point from `image_tag`.
2. **`image_tag` focal point.** When the caller omits `position`, do not set `--image-object-position`. The inline `object-position: X% Y%` from `image_tag` must stay effective.
3. **`center`.** When `position` is omitted and `image_tag` emits no focal-point style, snippet CSS falls back to `center`.

Record whether the caller passed `position` before any default. A silent `position | default: 'center'` overrides every focal point. Never feed focal-point percentage strings into the whitelist. An invalid explicit `position` falls back to `center` and still counts as an override. `natural` and `contain` must not be forced to `cover` or cropped because of position or focal handling.

## Fit Detection

If `img_class` already contains an `object-*` utility, including a responsive variant, respect it and do not append a conflicting fit utility. Otherwise the explicit `fit` parameter or the mode default applies.

## Ratio vocabulary

| Keyword | Maps to |
| --- | --- |
| `adapt` | Intrinsic image ratio, or the placeholder ratio when the image is blank |
| `1:1` | `1/1` |
| `4:5` | `4/5` |
| `3:2` | `3/2` |
| `16:9` | `16/9` |

Callers that already pass slash ratios (for example `3/4` or `16/9`) stay unchanged.

## Current callers

`image.liquid` is the base image primitive. Frame mode is the default for product media, the product card, cart line items, collection and blog cards, and the article image. `sections/header.liquid` (logo), `sections/footer.liquid` (brush stroke), and `sections/scatter-gallery.liquid` (decoration) pass `mode: 'natural'`.

`placeholder_style: 'plain'` is used by `sections/brand-statement.liquid`, `sections/newsletter-banner.liquid`, and `sections/slides-show.liquid`. `position` is used by `sections/newsletter-banner.liquid`. Keep both working when the snippet changes.

## Review

- Do not bypass `image.liquid` with a raw `<img>`. `lint:theme` `bare-img` (`.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`) fails that outside `snippets/image.liquid`. Current exception: `templates/gift_card.liquid` renders without the main layout and outputs the shop logo with `image_tag` directly.
- Do not use wrapper classes to express image fit. Use `img_class`, `fit`, or `position`.
- Above-the-fold image changes need a visual and performance review.
- If Tailwind source for image display changes, run `npm.cmd run build:tw`.
