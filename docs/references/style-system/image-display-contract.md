# Image Display Contract

This file documents `snippets/image.liquid` display behavior. CSS layer/token contracts live in `docs/references/style-system/css-architecture.md`.

## Display Modes

| Mode | Use case | Wrapper behavior | Image fit default |
| --- | --- | --- | --- |
| `frame` | fixed frame, aspect-ratio box, card image, gallery cell, full-bleed media | wrapper fills the frame | `object-cover` |
| `natural` | logo, editorial image, decorative brush, content image preserving intrinsic ratio | wrapper follows natural image ratio | `object-contain` unless overridden |

Calls without an explicit mode default to `frame` for backward compatibility.

## Parameters

| Parameter | Meaning |
| --- | --- |
| `image` | Shopify image object |
| `mode` | `frame` or `natural`; defaults to `frame` |
| `fit` | explicit object-fit intent such as `cover` or `contain` |
| `position` | optional explicit object-position whitelist value; see Object-position precedence |
| `class` / `wrapper_class` | wrapper classes; `wrapper_class` is preferred |
| `img_class` | image element classes |
| `sizes`, `widths`, `loading`, `fetchpriority`, `alt` | rendering and performance metadata |

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

## Current Status

- `image.liquid` is the base image primitive.
- Frame-mode default preserves legacy product card, gallery, hero, slide, overlay, blog, and collection behavior.
- Natural-mode is used for cases where preserving intrinsic ratio matters.
- Focal points are owned by Shopify `image_tag` unless the caller passes an explicit whitelist `position`.
- Remaining improvements are mostly merchant controls per section, not primitive plumbing.

## Review Checklist

- Do not bypass `image.liquid` with raw `<img>` unless explicitly justified.
- Do not use wrapper classes to express image fit; use `img_class`, `fit`, or `position`.
- Do not default `position` before detecting whether the caller passed it.
- Above-the-fold image changes require visual/performance review.
- If Tailwind source changes for image display, run `npm.cmd run build:tw`.
