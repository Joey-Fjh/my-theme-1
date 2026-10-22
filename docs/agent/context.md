# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-22.

## Batch B1: collection cards show the collection image first

**Status:** closed 2026-10-22. Ask review PASS; committed with B2 (user).

**Outcome.** A `collection-list` card shows the collection's own image at rest whenever the collection has one; the first product's images are the fallback. Reported by the user, 2026-10-22: the cards show the first product's image, not the collection image. Classified as code: `snippets/collection-card.liquid` follows the 6-S3 rule "rest: the first product's first media image" (`git show 75d077b:docs/agent/context.md`, user, 2026-10-05). Shopify's list-collections guidance (Shopify Dev MCP) uses `collection.image` with the first product's image as the fallback; `collection.featured_image` itself falls back to the first product's featured image, so the current hover fallback can "swap" to the same product image. The user accepted direction A on 2026-10-22, replacing the 6-S3 image rule.

**New image rule** (`data-collection-card-image-rule` value in brackets):

| Collection image | First product | Rest | Hover |
| --- | --- | --- | --- |
| yes | has media or featured image | `collection.image` | first product's first media (`collection_image_product_hover`) |
| yes | none, or empty collection | `collection.image` | no swap (`collection_image_only`) |
| no | 2+ media | first product's first media | its second media (`second_product_media`) |
| no | 1 media or featured image only | first product's image | no swap (`tilt_only_no_second_media`) |
| no | none | surface placeholder | no swap (`none`) |

`collection.featured_image` is no longer read. Hover motion, focus, reduced motion, touch behaviour, image sizes, loading and the markup structure are unchanged; placeholder cards are unchanged.

**Dependencies.** None.

**Implementation surface.** `snippets/collection-card.liquid` (the `{%- liquid %}` image selection and the snippet's `{% doc %}` if it describes the rule). No consumer of the rule names exists outside the snippet (grep, 2026-10-22).

**Review tier: Ask** (changes Liquid markup logic).

**Acceptance checks.**
1. `grep -n "collection.featured_image" snippets/collection-card.liquid` returns nothing (the first product's `featured_image` stays as the fallback when it has no media); the snippet assigns only the five rule values in the table plus `placeholder`.
2. `npm.cmd run lint:theme`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run test:theme-check` pass.
3. With `npm.cmd run shopify:dev` running, on the home page every `collection-list` card's `data-collection-card-image-rule` matches the table for that collection's data, and a card whose collection has an image renders that image's URL in the rest layer (Chrome DevTools MCP: DOM read at 1440; screenshot at 390 and 1440). If no collection in the dev store has an image, record that and prove the `collection_image_*` rows on one collection the user gives an image to (store content, user's action), or leave those rows unproven with the reason.
4. `test:layout` is not required: image sources change, boxes and classes do not.

**Execution log (2026-10-22).**
- `snippets/collection-card.liquid`: the first product's image (first media, else its `featured_image`) is resolved once; `collection.image` decides rest and hover per the table; the `collection_featured_fallback`, `empty_collection_featured` and `tilt_only_no_hover_image` rules are gone (no consumer). Markup, classes, sizes and loading unchanged.
- Check 1: no `collection.featured_image`; rule values assigned: `collection_image_product_hover`, `collection_image_only`, `second_product_media`, `tilt_only_no_second_media`, `none`, `placeholder`.
- Check 2: `lint:theme`, `lint:liquid-syntax`, `lint:compat` passed; `test:theme-check` 157 files, no offenses.
- Check 3 (dev server already running on 9292 from this repo; `/collections/<handle>.json` and `products.json` for the data): `66666666666` no image, first product 8 images → `second_product_media`; `夏季产品系列`, `女士衣服`, `睡衣` have images → `collection_image_product_hover`, rest `src` under `/cdn/shop/collections/`; `77777777777777` no image, 1 image → `tilt_only_no_second_media`. All rest images loaded. Screenshots at 1440 and 390 (scratchpad, not committed) show the collection images. Console errors are platform-only (`origin_trials` CORS, shop.app CSP, account 400, a 404), none from the card. `collection_image_only` has no store data to prove it: unproven, by logic only.
- Also pending commit with this batch: the `docs/project.md` status refresh and the backlog hover-depth line (record fixes, 2026-10-22).

## Batch B2: collection card hover shadow

**Status:** closed 2026-10-22. Ask review round 2 PASS; the user accepted the section ("这个section没有bug了") and asked to commit.

**Outcome.** The hover and keyboard-focus shadow under a `collection-list` card is clearly visible. Reported by the user, 2026-10-22: today's shadow (`var(--shadow-lg)`, black 0.16, `0 14px 36px`) is barely visible on the sage background. The user's decision (2026-10-22): no tint and no new role, only a more visible shadow; tilt stays 2°; the bottom scrim behind the white hover title stays. This departs from `docs/design/design.md` rule 3 ("tinted, not a grey drop shadow"), which the user owns.

**Implementation surface.** The baseline entry rename in `.agents/tools/layout-check/layout-check.baseline.json` (user, 2026-10-22). The `{% stylesheet %}` block of `snippets/collection-card.liquid`; the slide gap in `sections/collection-list.liquid` and `assets/collection-list.js`: 16px below 48rem, 24px from 48rem (rounds 4 and 5, user, 2026-10-22).

**Review tier: Ask** (raised in round 4: the slide gap is a Liquid assign, and it moves layout). `review-animations` reviewed the motion diff (below).

**Acceptance checks.**
1. The depth is an offset shape behind the card, as the design shows (right and bottom edge) and `design.md` Elevation describes ("a blurred rectangle behind the active card"): `.collection-card::before` filled with the scheme role `--color-faint` (follows each colour scheme), `filter: blur(0.2rem)`, offset `translate(0.8rem, 1rem)`, revealed by `opacity` and moved with the surface (no `box-shadow`, no new role); `lint:theme` passes.
2. Under `prefers-reduced-motion: reduce` the surface does not move; the shape still appears at its offset.
3. `npm.cmd run lint:theme`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check` pass; with `shopify theme dev` running, `npm.cmd run test:layout` reports 0 new issues (the gap moves layout; run by the Verifier).
5. At 1440 the hovered card's tilted corner and offset shape stay inside the 24px gap (no overlap with the neighbour); below 48rem the gap is 16px, both with Swiper mounted (`spaceBetween` breakpoint 768) and in the unmounted CSS fallback (`--collection-list-gap` overridden at 48rem).
4. The user's look on the home page at 1440 (hover a card) and keyboard Tab focus; the user tunes the strength.

**Execution log (2026-10-22).**
- Shadow moved from the surface's `box-shadow` transition onto `.collection-card::before` (`isolation: isolate` on the link, `z-index: -1`), `var(--shadow-lg), var(--shadow-md)`, faded in by `opacity` and moved with the surface's `translateY(-6px) rotate(2deg)`; reduced motion drops both transforms and keeps the shadow.
- `review-animations` (SKILL.md ten standards): justified (hover and focus feedback on a media card, occasional use); hover gated by `(hover: hover) and (pointer: fine)`; 200ms with a custom cubic-bezier; transform and opacity only (the old `box-shadow` transition repainted every frame: fixed); reduced motion keeps opacity, drops movement. Outside this batch: the hover-layer and rest-image crossfade use 0.3s built-in `ease` (standards 3 and 4), and focus-visible tilts on keyboard Tab (standard 2); both predate B2, left for the home polish pass.
- `lint:theme`, `lint:compat`, `test:theme-check`, `prettier --check` passed. The interim tinted-role attempt (`--shadow-tinted` in two token files) was reverted before the user's decision; token files are unchanged.
- Dev server on 9292 returned 500 after a `sed -i` edit to the snippet; the user restarts it and looks.
- Round 2 (user's look, 2026-10-22): the layered `--shadow-lg, --shadow-md` still read as no shadow: both are centred, wide-blur, low-alpha black, a haze on sage, while the design shows an offset shape on the right and bottom edges. Replaced by the offset `--color-faint` shape above; `lint:theme`, `lint:compat`, `test:theme-check`, `prettier --check` passed. Waiting on the user's look again.
- Round 3 (user's look, 2026-10-22): bottom shadow visible but weak; the right side was covered by the next slide (8px offset plus the tilted corner inside a 16px gap; the later slide paints on top), which read as a cut slanted edge; the `--color-faint` tint followed the scheme. Changed: fixed black fill at opacity 0.2; `.collection-list__slide:hover, :focus-within { z-index: 1 }` lifts the hovered slide above its neighbours; tilt stays 2° until the user judges it with the shadow uncovered. Validators passed. Waiting on the user's look.
- Round 4 (user's look, 2026-10-22): shadow still weak, and the tilted right edge overlapped the neighbour. User: back to `--color-faint` (each scheme has it), keep 2°, widen the gap. Changed: `--color-faint` at full opacity, blur 0.4 → 0.2rem (blur was eating the 8px offset); `collection_list_slide_gap` 16 → 24 (the 2° corner overhang about 10px plus the 8px offset and blur need about 21px); the round-3 `z-index` lift removed (no overlap left to cover). Mobile gets 24px too. `lint:theme`, `lint:liquid-syntax`, `lint:compat`, `test:theme-check`, `prettier --check` passed. `test:layout` is the Verifier's (needs the dev server). Waiting on the user's look, then the Ask review.
- Round 5 (user, 2026-10-22): mobile 24px too wide. Split the gap: `collection_list_slide_gap` 16 and `collection_list_slide_gap_desktop` 24 in Liquid; `data-slide-gap-desktop` read by `assets/collection-list.js` for the existing 768 breakpoint; `--collection-list-gap-desktop` on the root and a 48rem override on `.collection-list__swiper` for the fallback layout. Validators passed (`prettier --check` after wrapping the new `parseInt`).
- Hover title scrim (user, 2026-10-22): with packshot hover images on white the white title's scrim reads as a grey band; options were dark title without scrim, or a lifestyle hover image from a collection metafield. Decision: keep as is.
- Review round 1 (2026-10-22, separate session): FAIL. (a) `assets/tailwind.output.css` carried an added `--color-scrim-solid` line, a stale build from round 3 (the shape briefly used that role); `npm.cmd run build:tw` now leaves the file identical to `HEAD` (closed). (b) `test:layout` 1 new issue: the baselined `page-margin` entry for the fifth `collection-list` card at 2040px changed its selector from `a.collection-card--has-swap` to `a.collection-card`, because B1 removed the swap for `77777777777777` (its old hover was the `collection.featured_image` fallback, the first product's own image); same element, same geometry, count 39 unchanged. Fix needs the user's approval: rewrite that baseline entry's selector (harness data; not a growth). (c) Check 1 listed two blur values; corrected to 0.2rem. Reviewer proved: shape stacking and pointer events, hover and focus, reduced motion, transform and opacity only, `--color-faint` per scheme, gaps 16/24 mounted and fallback, about 15.5px tilt clearance and 7.9px shape clearance at 1440, B1 rules intact.
- Round 1 fix (b), approved by the user 2026-10-22: the baseline entry's selector now ends `a.collection-card:nth-of-type(1)` (taken from the verifier's `.tmp-layout-check/report.json`); entry count unchanged at 39.
- Review round 2 (2026-10-22, separate session): PASS. Tailwind output equals a fresh build; baseline diff is the one approved rename (39 entries); `test:layout` 0 new issues; gaps 16/24 mounted and fallback; focus and reduced motion as planned.
