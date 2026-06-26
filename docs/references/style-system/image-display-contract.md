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
| `position` | focal position such as `center`, `top`, or merchant-driven value |
| `class` / `wrapper_class` | wrapper classes; `wrapper_class` is preferred |
| `img_class` | image element classes |
| `sizes`, `widths`, `loading`, `fetchpriority`, `alt` | rendering and performance metadata |

## Fit Detection

If `img_class` already contains an `object-*` utility, including responsive variants, the snippet should respect caller intent and not append a conflicting fit utility. Otherwise the explicit `fit` parameter or mode default applies.

## Decision Flow

1. Is the image inside a fixed frame or aspect-ratio container? Use `mode: 'frame'`.
2. Should the image keep its natural ratio? Use `mode: 'natural'`.
3. Does the merchant need focal-point control? Expose or pass `position`.
4. Does the merchant need cover-vs-contain control? Expose or pass `fit`.
5. The caller decides semantic mode; `image.liquid` should not guess business intent.

## Current Status

- `image.liquid` is the base image primitive.
- Frame-mode default preserves legacy product card, gallery, hero, slide, overlay, blog, and collection behavior.
- Natural-mode is used for cases where preserving intrinsic ratio matters.
- Remaining improvements are mostly merchant controls per section, not primitive plumbing.

## Review Checklist

- Do not bypass `image.liquid` with raw `<img>` unless explicitly justified.
- Do not use wrapper classes to express image fit; use `img_class`, `fit`, or `position`.
- Above-the-fold image changes require visual/performance review.
- If Tailwind source changes for image display, run `npm.cmd run build:tw`.
