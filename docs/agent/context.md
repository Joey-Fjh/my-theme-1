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

**History.** Planned 2026-10-27 from board topic LS1 (scope A+B, chosen by the user). Authorized 2026-10-27; executed by an external Implementer session. The plan body was restored by the coordinator from `af93962` after the Implementer shortened it.

**Results.**

Execution started 2026-10-27. `npm.cmd run shopify:dev` was already listening on `127.0.0.1:9292` (a second start failed with `EADDRINUSE`).

### Before measurements (pre-edit, DevTools MCP)

| Target | Viewport | Metric | Value |
| --- | --- | --- | --- |
| routine-showcase | 1440×900 | arch H / empty run | 744px / 542px |
| routine-showcase | 1872×1307 | arch H / empty run | 969px / 793px |
| routine-showcase | 1920×1080 | arch H / empty run | 936px / 561px |
| routine-showcase | 2560×1440 | arch H / empty run | 1260px / 1116px |
| featured-product | 1440×900 | media col H / info col H / in-column empty | 922 / 922 / ~30px |
| featured-product | 1920×1080 | media panel H / info blocks H / delta | 960 / 960 / 0 |
| main-page-about | 1920×1080 | hero section H | 1429px (~132vh) |
| main-page-about | 2560×1440 | hero section H | 1909px |
| main-page-about | 390×844 | hero section H (`min-h-200`) | 500px |

### A1 checkpoint — ratio matrix (check 1)

Product URL: `/products/test礼品卡`. Template still pins `portrait_3_4`; adapt path verified by DevTools override (`data-gallery-aspect-mode=adapt`, remove fixed panel `aspect-ratio`, canvas `src` substitution). Thumbnails layout. Viewport **1440×900** unless noted.

| Ratio | Mode | object-fit | Panel W×H | Within 90svh cap | Box ratio vs image (≈) |
| --- | --- | --- | --- | --- | --- |
| 16:9 | adapt | contain | 748×426 | yes (cap 810) | 99% |
| 4:3 | adapt | contain | 748×567 | yes | 99% |
| 3:2 | adapt | contain | 748×504 | yes | 99% |
| 1:1 | adapt | contain | 748×754 | yes | 99% |
| 2:3 | adapt | contain | 748×810 | yes (height-capped) | 61% (cap binds) |
| PNG | adapt | contain | 748×810 | yes | — |
| 16:9 | portrait_3_4 | cover | 748×810 | yes | cropped (expected) |

Mobile **390×844** (DevTools resize reported 500×844 chrome): `object-fit: contain` under adapt override; panel H 682.

**A1:** done — schema default `adapt`, gallery `data-gallery-aspect-mode`, per-layout adapt + contain + active-slide height, thumbnails fixed 3:4 contain.

### After measurements (post-edit, DevTools MCP)

| Target | Viewport | Metric | Before → After |
| --- | --- | --- | --- |
| routine-showcase | 1920×1080 | arch H / empty run / 80svh cap | 936 / 561 → **778 / 20** / cap 864 |
| main-page-about | 1440×900 | hero H / 80svh cap | 1429@1920 → **720** / cap 720 |
| featured-product (home) | 1920×1080 | `data-gallery-aspect-mode` | — → **adapt** |
| featured-product | 1920×1080 | info column (carousel preset) | `productLayout` sticky; home uses **carousel** — vertical center utilities apply only when `gallery_layout` is thumbnails |

**B1 choice:** Option 2 — top-aligned columns with token gap (`--spacing-step-l` / `gap-step-l` scale), not centered group. `justify-content: space-between` removed on left and right desktop columns. Arch/stage height capped with `min(80svh, …)`.

**B3 choice:** Vertical centring via Tailwind on `.featured-product__info-column` when **not** carousel (`tablet:flex tablet:flex-col tablet:justify-center`), matching product-page intent when info is shorter than media; carousel preset keeps existing `productLayout` + carousel stylesheet behaviour.

**B4:** Removed `position: 'center'` from `brand-statement` image render. Removed `position: 'bottom'` from routine packshot `image` render (kept `object-bottom` on img for packshot composition). `collection.liquid` and `search-results-tabs.liquid` `position: 'left'|'right'` are **drawer** positions, not image renders — unchanged.

**B5 (measure only, DevTools):**

| Section | Viewport | Largest in-column gap | Design vs defect |
| --- | --- | --- | --- |
| testimonial-featured (home) | 1920×1080 | ~98px | design gap (polish pass) |
| mood-finder (product) | 1920×1080 | ~238px | design gap |
| formula-details (product) | 1920×1080 | ~383px | design gap |
| promise-section | not on `privacy-policy?view=about` | — | verify on `/pages/about` in browser (404 in dev) |

Chrome DevTools MCP **resize_page** often reported 1920×1080 even after resize requests; routine post-fix at 1920 only for multi-width B1 table. Re-check 1440 / 1872 / 2560 in Ask browser pass.

### Task status

- **A1:** done (checkpoint ratio matrix above).
- **A2:** done — featured-product mirrors product media ratio + desktop height settings; gallery receives `aspect_ratio` + `max_height`; placeholder stays 3:4.
- **B1:** done — 80svh stage cap; inner column gap token (option 2).
- **B2:** done — `tablet:max-h-[80svh]` on about hero root (mobile `min-h-200` unchanged).
- **B3:** done — vertical center utilities on non-carousel info column.
- **B4:** done — focal overrides removed where listed; drawer positions unchanged.
- **B5:** done (measure only; no code changes to candidates).

### Validation (counts from command output)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | **Passed** (after removing new `{% stylesheet %}` blocks that tripped `[mixed-element]`; hero/info use Tailwind utilities instead). |
| `npm.cmd run test:theme-check` | **157 files inspected, 0 offenses** |
| `npm.cmd run lint:liquid-syntax` | **Passed** |
| `npm.cmd run lint:i18n` | **Passed** (+ unused locale passed) |
| `npm.cmd run scan:compat` | **Passed** (includes `build:tw` + lint:compat) |
| `npm.cmd run test:layout -- --widths 390,768,1024,1440` | **New issues: 0** |
| `npx prettier --check` (changed Liquid + context) | **Passed** |

**review-animations:** did not apply (no new/changed transitions or animations beyond existing gallery fade).

### Unverified / risks

- Product page live preset remains `portrait_3_4` until coordinator updates `templates/product.json` with user approval.
- CLS on product load at 1440 not measured this batch.
- `brand-statement` focal now from `image_tag` — not re-checked on live about template (404 for `/pages/about` in dev).
- B5 and routine multi-width confirmation at 1440 / 1872 / 2560 deferred to Ask browser pass.
- `assets/tailwind.output.css` regenerated by `build:tw` / `scan:compat` (not hand-edited).

### Next step

**Ask review** — run Verifier prompt from `.agents/roles/verifier.md` in a separate session; user browser pass on home, product (single + multi image), 1440 + native width.

**Coordinator review 1, 2026-10-27: FAIL (one must-fix).** DevTools on the dev server, with the working tree as delivered.

- **F1, must fix: the `featured-product` carousel crops portrait media under `adapt` on desktop.**
    - Home at 1440×900, preset gallery layout carousel, `data-gallery-aspect-mode="adapt"`, `--product-gallery-max-height: 90svh`.
    - The Swiper box is 811×840, while the images render at full width and natural height:

        | Slide | Image (attributes) | Rendered | Hidden by the 840px box |
        | --- | --- | --- | --- |
        | 1 | 1200×1200 | 811×811 | 0 |
        | 2 | 1200×1800 | 811×1217 | 377px |
        | 3 | 1200×1525 | 811×1031 | 191px |
        | 4 | 1200×1723 | 811×1164 | 324px |

    - At 390 nothing is hidden: the Swiper takes the tallest slide (358×537).
    - This breaks principle 2 and the bar ("any product image cropped under `adapt`").
    - The A1 ratio matrix covered only the `thumbnails` layout. The carousel (and, by the same code, stacked and grid if they cap height) need the same contain-within-cap rule: the image is limited by the capped height, with `width: auto`, centred.
    - Surface: `snippets/product-gallery-carousel.liquid` and the adapt rules in `snippets/product-gallery.liquid`.
- **Passed in this review:**
    - `main-page-about` hero: at 1280×680 and 800×480 the section equals the 80svh cap (544 and 384) and no text is clipped (last text bottom 373 and 303).
    - `routine-showcase`:

        | Width | Arch | 80svh cap | Left column largest empty run |
        | --- | --- | --- | --- |
        | 1440×900 | 324×648 | 720 | 22px |
        | 1872×1307 | 471×941 | 1046 | 22px |
        | 2560×1440 | 518×1037 | 1152 | 22px |

        Before the change the left column's run was 347, about 600 and 921.
    - Product page CLS at 1440 (template still `portrait_3_4`): 0.
    - Under `adapt` each image carries its `width` and `height` attributes, with `aspect-ratio: auto <w> / <h>`, so the space is reserved before load.
    - `featured-product` info column at 1440 (carousel preset, where B3 does not apply): column 922, media 922, largest internal run 147px, bottom gap 143px. Under the bar.
- **Observations (no defect under the bar; for the user):**
    - O1: the `routine-showcase` right column is a navigation rail (counter at the top, label, thumbnails at the bottom). It keeps its spread by design: runs of 262, 425 and 478px at 1440, 1872 and 2560. The plan's run check covers the text column only.
    - O2: the Implementer shortened the plan body in this file (method, bar, acceptance checks). The coordinator restored it from `af93962`. Implementers record under Results only.
- **Next:** one correction round on F1 (review budget: this is the correction cycle). Then the external Ask review.

**Coordinator correction for F1, 2026-10-27.**

- Change: `snippets/product-gallery.liquid` `{% stylesheet %}`. One rule at `width >= 48rem`: under `data-gallery-aspect-mode='adapt'`, the `.theme-image[data-image-mode='natural'] img` takes `width: auto; max-width: 100%; max-height: var(--product-gallery-max-height, none); margin-inline: auto`. It applies to every gallery layout.
- Re-measured on home `featured-product` at 1440×900 (carousel, cap 810). Nothing is hidden, the ratio matches the natural image within 1%, and each image is centred in the 811px frame:

    | Slide | Rendered |
    | --- | --- |
    | 1 | 810×810 |
    | 2 | 540×810 |
    | 3 | 637×810 |
    | 4 | 564×810 |

- 390 is unchanged (the rule is desktop only).
- Validators:
    - `npm.cmd run lint:theme`: passed.
    - `npm.cmd run test:theme-check`: 157 files, no offenses.
    - `npm.cmd run lint:liquid-syntax`: passed.
    - `npm.cmd run scan:compat`: 66 stylesheet blocks, passed.
    - `npx prettier --check snippets/product-gallery.liquid`: passed.
    - `npm.cmd run test:layout -- --widths 390,768,1024,1440`: 0 new issues.
- Status: coordinator review PASS after correction. The external Ask review is next.
- `templates/product.json` `media_aspect_ratio` → `adapt` waits for the user's approval (Merchant-Change).

**User look and B1 correction, 2026-10-27.**

- User (screenshot 5): with Option 2 (top-aligned) the empty band moved from the middle to the bottom of the left column. That is the same problem, which was already discussed.
- Cause: the plan offered "centre or top-aligned with a gap" and measured only the largest run between texts, which does not see the space left under the last group. This was a plan defect (coordinator).
- The coordinator injected four variants on the live page at 1440 (top-aligned, the hybrid top plus centred product, space-evenly, space-around). The user chose **space-around** ("目前这种的就可以").
- Change: `sections/routine-showcase.liquid` `{% stylesheet %}`, `.routine-showcase__col--left` `justify-content: flex-start` → `space-around`. The token `gap` stays as the minimum.
- Measured with `prefers-reduced-motion` to hold step 1:

    | Width | Column height | Above the intro | Between the groups | Below the product |
    | --- | --- | --- | --- | --- |
    | 1440×900 | 720 | 55 | 131 | 55 |
    | 1872×1307 | 1046 | 137 | 293 | 137 |
    | 2560×1440 | 1152 | 163 | 347 | 163 |

- The arch is within the 80svh cap at all three widths.
- Bar note: the user's choice replaces the plan's "largest in-column run ≤ about 160px" for this column. The middle run exceeds 160px from about 1872 by design of space-around.
- Known trade-off, accepted with the choice: the steps have product descriptions of different lengths, so the groups shift slightly when the step changes.
- Validators after the change:
    - `npm.cmd run lint:theme`: passed.
    - `npm.cmd run test:theme-check`: 157 files, no offenses.
    - `npm.cmd run scan:compat`: passed.
    - `npx prettier --check sections/routine-showcase.liquid`: passed.
    - `npm.cmd run test:layout -- --widths 390,768,1024,1440`: 0 new issues.

**External Ask review 1, 2026-10-27: FAIL (Verifier session).** Three findings:

- **V1:** under `adapt`, product media inside the magnifier (`frame` wrapper) still crops on desktop. A 2:3 image renders 748×1122 in a 748×810 panel, hiding 312px; a transparent PNG does the same. F1 targeted only `natural` wrappers.
- **V2:** the home carousel's slide 6 video poster hides 241px (811×1081 in 811×840). The video branch of `snippets/product-media.liquid` did not pass the adapt mode.
- **V3:** the home vertical-pagination carousel frame is 840px against the 810px (90svh) cap. `min-height: 100%` from `tailwind/tailwind.components.css` `.product-gallery-carousel--pagination-vertical` outranks the `max-height`.
- Notes:
    - The carousel, stacked and grid ratio matrix was not rendered by the Verifier.
    - `test:layout` showed 9 new issues on one run and 0 on a repeat (intermittent).
    - Cold-load CLS was about 0.045 (product) and 0.004 (home), with no before-change comparison, so these are not proven LS1 regressions.

**Coordinator corrections for V1 to V3, 2026-10-27** (budget: the correction cycle):

- `snippets/product-gallery.liquid` `{% stylesheet %}`:
    - The F1 rule is replaced. At `width >= 48rem` under adapt, every `.theme-image` inside `[role='tabpanel']` or `[data-gallery-swiper]` (frame or natural; magnifier and video poster included; thumbnails excluded) gets `width: min(100%, calc(var(--product-gallery-max-height, 1000vh) * (var(--aspect-ratio)))); height: auto; max-height: var(--product-gallery-max-height, none); margin-inline: auto`, and its `.image_img` fills it.
    - At `width >= 64rem` under adapt, `.product-gallery-carousel--pagination-vertical` gets `height: auto; min-height: 0`.
- `snippets/product-media.liquid`: the video poster `image` render receives `mode: image_mode, fit: image_fit`, like the image branch.
- Re-measured, home `featured-product` at 1440×900 (carousel, vertical pagination):
    - The frame is 811×810, equal to the cap.
    - All ten slides are fully visible with the ratio within 1.5%: 810×810, 540×810, 637×810, 564×810, 562×810, the video poster 608×810, 811×636, 810×810, 811×400, and the video poster 811×456.
- Re-measured, product page at 1440×900, with `adapt` simulated in DevTools: `data-gallery-aspect-mode="adapt"` and the panel `aspect-ratio` removed, because the template still pins `portrait_3_4`. The magnifier `frame` wrapper was given canvas images. Nothing was hidden, and the box ratio equals the image ratio:

    | Image | Box | Panel |
    | --- | --- | --- |
    | 16:9 | 748×421 | 748×426 |
    | 4:3 | 748×561 | 748×567 |
    | 3:2 | 748×499 | 748×504 |
    | 1:1 | 748×748 | 748×754 |
    | 2:3 | 540×810 | 748×810 |
    | Transparent PNG 2:3 | 540×810 | 748×810 |

- Validators:
    - `npm.cmd run lint:theme`: passed.
    - `npm.cmd run test:theme-check`: 157 files, no offenses.
    - `npm.cmd run lint:liquid-syntax`: passed.
    - `npm.cmd run lint:i18n`: passed.
    - `npm.cmd run scan:compat`: 66 stylesheet blocks, passed.
    - `npx prettier --check` on the changed files: passed.
    - `npm.cmd run test:layout -- --widths 390,768,1024,1440`: 0 new issues.
- User, 2026-10-27: approved changing `templates/product.json` `media_aspect_ratio` to `adapt` ("同意"). The coordinator applies it after the correction review PASSES, in the batch commit with a `Merchant-Change:` trailer.

**External Ask review 2 (correction), 2026-10-27: FAIL (Verifier session).** The review budget is spent; the open defect goes to the user.

- **V4:** under `adapt`, stacked (and by the same cause grid) media is not capped. The V1 rule only matches `.theme-image` inside `[role='tabpanel']` or `[data-gallery-swiper]`; `snippets/product-gallery-stacked.liquid` and `-grid.liquid` have neither. A fixture matching the stacked markup at 1440×900 showed a 2:3 PNG at 808×1212 in an 808×810 frame (402px hidden); adding only the rule's selector hook gave 540×810 with nothing hidden. Stacked and grid are merchant-selectable (`gallery_layout` in `product` and `featured-product`), so this is reachable.
- Passed: V1 on the thumbnails layout (six canvas ratios at 1440 and 390, ratio error under 0.005%), thumbnails unchanged, V2 (ten home slides including both posters at 1440 and 390), V3 (810/810 at 1440×900, 972/972 at 1920×1080), pagination click and keyboard, fixed ratios (portrait 748×810, square 748×748, cover), magnifier and lightbox focus return, routine-showcase space-around at 1440 and 1872, about hero 864px at 1920×1080, scope.
- Notes: real Liquid-rendered stacked and grid were not reached (the Theme Editor needs sign-in); cold-load layout shift 0.004342 home and 0.000223 product, none attributed to the gallery.
- Validators (Verifier): `lint:theme`, `test:theme-check` (157 files, no offenses), `lint:liquid-syntax`, `lint:i18n`, `lint:compat` passed; `test:layout` at 390, 768, 1024, 1440 twice, 0 new issues both runs; Prettier on 11 changed Liquid files passed.

**Coordinator correction for V4, 2026-10-27** (user: "修呗"; beyond the review budget, closing review pending the user's choice):

- `snippets/product-gallery-stacked.liquid` and `snippets/product-gallery-grid.liquid`: the item-list root carries `data-gallery-items`. `snippets/product-gallery.liquid`: both adapt cap selectors become `:is([role='tabpanel'], [data-gallery-swiper], [data-gallery-items])`. The lightbox and media modal are siblings of the layout root, so they stay outside.
- Re-measured at 1440×900 on the product page: a fixture built from the stacked and grid root markup, with the page's real magnifier and image elements, under `adapt`, with canvas images. Nothing was hidden and the ratio held for every item:
    - Stacked (cap 90svh, 810px): 16:9 808×455, 4:3 808×606, 3:2 808×539, 1:1 808×808, 2:3 and the transparent 2:3 PNG 540×810 (magnifier and plain image both).
    - Grid: the first item (capped) 16:9 808×455; the half-width items 402 wide at their own ratio. Grid rows stretch to the tallest item, so a shorter item leaves space below rather than being cropped.
- Validators: `lint:theme`, `test:theme-check` (157 files, no offenses), `lint:liquid-syntax`, `lint:i18n`, `lint:compat` (66 stylesheet blocks) passed; Prettier on the three files passed; `test:layout` at 390, 768, 1024, 1440: 0 new issues.
- User, 2026-10-27: chose one more focused external review of V4 beyond the budget (option 1).

**External Ask review 3 (V4 focused), 2026-10-27: FAIL (Verifier session).**

- **V5:** at 390×844 the grid's magnifier items stretch to their taller row neighbour: the V4 rules are desktop-only and the magnifier keeps its `frame` wrapper (`height: 100%`). 16:9 beside 4:3 gave a 170×127.5 box (25% ratio error); 3:2 beside 1:1 gave 170×170 (33.3%). The image stays `contain`, so nothing is cropped; plain-image items pass.
- Passed: hooks on both roots and in both selectors; the lightbox and media modal outside the hook; desktop 48 of 48 measurements; caps within 810px; counterfactual (removing the hook brings back the 402px clip); shipped portrait 748×810; simulated adapt 540×810 in 748×810 with thumbnails unchanged; home carousel 810/810; lightbox focus return; scope.
- Validators (Verifier): `lint:theme`, `test:theme-check` (157 files, no offenses), `lint:liquid-syntax`, `lint:compat` passed; `test:layout` 0 new issues; Prettier passed.

**Coordinator correction for V5, 2026-10-27:**

- `snippets/product-gallery.liquid` `{% stylesheet %}`: at every width, under adapt, `[data-gallery-items] .theme-image` gets `height: auto`, so a frame box keeps its own ratio when a grid row stretches the item.
- Re-measured with the same fixture (stacked and grid, magnifier and plain, six ratios each, neighbours of different ratios) at 390×844 (mobile emulation) and 1440×900: 24 of 24 pass at each width. Nothing hidden, ratio error at most 0.01%, desktop caps within 810px. Example at 390: 3:2 magnifier beside 4:3 gives 177×118 in a 133px row.
- Validators: `lint:theme`, `test:theme-check` (157 files, no offenses), `lint:liquid-syntax`, `lint:compat` (66 stylesheet blocks) passed; Prettier passed; `test:layout` at 390, 768, 1024, 1440: 0 new issues.

**Closure, 2026-10-27.**

- User look (theme editor): raised three layout complaints outside the V-findings: the home `featured-product` carousel under `adapt` (landscape slides sit at the top of the 810px frame with empty space below), `ritual-steps` scroll carousel (large empty space above and below the text on tall screens: 309/331px at 1580×1130, 212/230 at 1440×900; the pinned stage is one screen tall by design), and the quick-view dialog (fixed 90vh panel, `tablet:h-full`, empty below short content). Common cause: container heights are fixed rather than sized by content with a cap.
- Reference check for `featured-product`: Dawn shows only the first media at its own ratio, constrained to the viewport, `contain` by default; Horizon `_featured-product-gallery` `image_ratio` defaults to adapt (options adapt, portrait, square, landscape) with `constrain_to_viewport` defaulting to contain, and the gallery ratio taken from the featured media. Neither defaults to a fixed square.
- Decided (user, 2026-10-27): close LS1 with the verified work; the 4th review is not run, the coordinator's V5 measurements and the user's look stand as acceptance. `featured-product` keeps `adapt` for now. The three complaints, the mainstream-store research, and LS1-C go to a new topic LS2 (research and audit first, `frontend-design` read, then options); `ritual-steps` height also goes to the home polish group.
- `templates/product.json` `media_aspect_ratio` → `adapt` (user approval 2026-10-27, "同意"). Measured on the real product page at 1440×900: ten media 748×748, 540×810, 637×810, 564×810, 562×810, 608×810, 748×587, 748×748, 748×369, 748×421, nothing hidden, ratio error at most 0.28%.
