# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan LS1: product media ratio, and outer and inner limits on flagged sections (A+B)

**Outcome.**

- Product media is never cropped by default and passes the Theme Store testing checklist ratios: 16:9, 4:3, 3:2 and 1:1, portrait and landscape, and a PNG.
- The flagged media-led sections stay within the viewport on desktop. Their text columns no longer leave large empty bands at 1440, 1920 and 2560.

**Decided (user, 2026-10-27).** Board topic LS1, scope A+B, run from an external execution prompt. The three principles accepted by the user:

1. **Outer:** media-led sections cap their media in svh on desktop.
2. **Media:** product media adapts by default and is never cropped. Editorial media keeps its design ratio with `cover` plus the Shopify focal point.
3. **Inner:** where the media is taller than the content, the content position and the gaps come from design tokens. Merchant settings are added only where needed.

The evidence and measurements are in `git show 4e0884d:docs/agent/board.md` (topic LS1). C, the shared `section-frame` contract, is on the backlog under After submission.

**Sources.**

- Theme Store testing checklist: https://shopify.dev/docs/storefronts/themes/store/test-theme/checklist (product page aspect ratios; unique sections "support varying image qualities and ratios").
- Liquid `focal_point` and `image_tag`, through Shopify Dev MCP.
- Reference for behaviour only, no code copied:
    - Horizon `blocks/_product-media-gallery.liquid`: `aspect_ratio` adapt by default; constrain to viewport; fit.
    - Horizon `sections/media-with-content.liquid`: `media_height` default 80svh.
    - Dawn `sections/main-product.liquid`: `media_fit` contain by default; `constrain_to_viewport`.

**Dependencies.**

- `npm.cmd run shopify:dev` running, with Chrome DevTools MCP attached.
- No test product upload. Ratio checks use images drawn on a canvas in DevTools and substituted into the rendered gallery (`img.src` and `srcset`, or the `--aspect-ratio` the snippet derives from the image). No file is written for them.
- `templates/product.json` pins `"media_aspect_ratio": "portrait_3_4"` (and `"desktop_media_height": "balanced"`). The shipped template decides what a reviewer sees, so the new default alone does not reach the product page.
    - Changing it to `adapt` is a merchant-file change. The coordinator makes it, not the implementer, after the user's explicit approval, in a commit with a `Merchant-Change:` trailer.
    - Until then, the implementer verifies `adapt` by setting the value in DevTools on the rendered markup, or in the Theme Editor preview without saving.
    - The implementer never edits `templates/*.json` or `config/settings_data.json`.

**Implementation surface and method.**

1. **A1, product media ratio** (`sections/product.liquid`, the product gallery snippets that receive `aspect_ratio` and `max_height`, `snippets/image.liquid` only if its adapt or contain path is missing, locale files for new option labels).
    - Add `adapt` to `media_aspect_ratio` and make it the default. Each media item keeps its own ratio, the way the product card's existing adapt mode does (`snippets/product-card.liquid`, `product_card_image_ratio`).
    - Keep `portrait_3_4` and `square_1_1`.
    - When a fixed ratio is chosen, keep `cover`.
    - When `adapt` meets `desktop_media_max_height`, use `contain`: the frame is capped, and the whole product image stays visible.
    - Thumbnails keep a uniform square or 3:4 box (fit contain).
    - Read how the gallery layouts (`thumbnails`, carousel, stacked or grid) size the frame before choosing where the ratio lives. One shared rule in the gallery snippet is preferred over per-layout copies.
2. **A2, `featured-product`** (`sections/featured-product.liquid`).
    - Replace the hard-coded `aspect_ratio: '3/4'` passed to `product-gallery` with the same adapt and cap behaviour, as a section setting mirroring A1.
    - The placeholder path may keep 3:4.
3. **B1, `routine-showcase`** (`sections/routine-showcase.liquid` and its `{% stylesheet %}`).
    - Cap the arch height on desktop with an svh limit (start from 80svh, Horizon's media-with-content default, and tune to the design). The arch keeps its ratio by deriving its width from the capped height.
    - Replace `justify-content: space-between` on the text column (the three rules near the `space-between` declarations), so the content keeps a bounded gap at every width:
        - Option 1: centre the group.
        - Option 2: top-aligned with a token gap (`--spacing-step-*`).
    - Pick the option that keeps the largest in-column empty run under about 160px at 1440, 1920 and 2560, and report the choice.
    - Drop the explicit `position: 'bottom'` passed to `image` unless the packshot composition needs it. If it is kept, state why in the report.
4. **B2, `main-page-about` hero** (`sections/main-page-about.liquid`): cap the hero media height on desktop with an svh limit (currently 1.32vh at 1920). Mobile keeps its current `min-h-200`.
5. **B3, `featured-product` info column** (`sections/featured-product.liquid` stylesheet):
    - The info column is about 440px shorter than the media at 1440 and 1920.
    - Use sticky info (`position: sticky` within the media column height) or vertical centring, whichever matches the product page's own info behaviour. Report which one.
6. **B4, focal overrides.**
    - `sections/brand-statement.liquid` passes `position: 'center'` to `image`, which overrides the merchant focal point. Remove it unless the design needs it.
    - Check the `position:` arguments in `sections/collection.liquid` and `snippets/search-results-tabs.liquid`. Change only the ones that are image renders overriding a focal point.
7. **B5, confirm four candidates** (measure only; change only what fails the bar): `testimonial-featured`, `mood-finder`, `formula-details` and `promise-section` at 1440, 1920 and 2560. Record the largest in-column empty run and whether it is a design gap or a defect.

Nothing else changes. If a fix needs a file or a method not named above, stop and report.

**Review tier.** Ask: Liquid markup, schema and locale change. The Verifier runs in a separate session from `.agents/roles/verifier.md`.

**Estimate:** about 7 hours (A about 4, B about 3), plus the Ask review.

**Checkpoint:** three stops.

- After A1, with the ratio matrix (check 1), before A2 and B.
- After all items and validators, before the Ask review prompt.
- Whenever a fix needs a method or file not named above, or `templates/product.json` pins the ratio.

**Bar:** judged on the default preset, the current templates, and canvas test images.

- **Must fix:**
    - Any product image cropped under the default setting (`adapt`) at 1440 or 390.
    - A frame taller than the cap at 1440×900 or 1920×1080.
    - `routine-showcase` arch taller than its svh cap at 1872×1307, 1920×1080 or 2560×1440.
    - An in-column empty run over about 160px in `routine-showcase` at those widths.
    - About hero taller than its cap at 1920×1080.
    - Any new `test:layout` issue.
    - A Theme Check, `lint:theme`, `lint:i18n` or `lint:liquid-syntax` failure.
    - A CLS regression on the product page (layout shift entries during load at 1440).
- **Accepted residue:**
    - The stage sections (`slides-show`, `ritual-steps`, `promo-bannder`) are left as designed.
    - B5 candidates that are design gaps go to the polish pass.
    - LS1-C.

**Acceptance checks.**

1. Product page at 1440×900 and 390×844, gallery layout `thumbnails`, with canvas images at 16:9, 4:3, 3:2, 1:1, 2:3 and a transparent PNG substituted:
    - Under `adapt`, `object-fit` is `contain` (or no crop: the rendered box ratio equals the image ratio within 1%).
    - The frame is no taller than the cap.
    - Under `portrait_3_4`, `cover` still applies.
    - Record one row per ratio.
2. `featured-product` on home, 1440: the same checks for 16:9 and 1:1.
3. `routine-showcase` at 1440×900, 1872×1307, 1920×1080 and 2560×1440: arch height ≤ the cap, and the largest empty run in the text column ≤ about 160px. Record both numbers per width.
4. `main-page-about` (`/pages/privacy-policy?view=about`) at 1920×1080 and 2560×1440: hero height ≤ the cap. At 390 it is unchanged (`min-h-200`).
5. `featured-product` info column at 1440 and 1920: the chosen behaviour is applied, with the measured empty run recorded.
6. B4: the rendered `brand-statement` image carries the focal `object-position` from `image_tag`, or the documented reason for the explicit position.
7. B5: one row per candidate.
8. Validators:
    - `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax` and `npm.cmd run lint:i18n` pass.
    - `npm.cmd run scan:compat` passes when a stylesheet changes.
    - `npm.cmd run test:layout -- --widths 390,768,1024,1440` reports 0 new issues.
9. The Ask review reports PASS. The user looks at the home page, a product with one image and a product with many images, at 1440 and the user's own screen.

**History.** Planned 2026-10-27 from board topic LS1 (scope A+B, chosen by the user); execution prompt requested by the user. Not yet authorized.

**Results.**

Not started.
