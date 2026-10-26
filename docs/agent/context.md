# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan G3: setting and behaviour fixes (backlog group 3)

**Outcome.** The four items of backlog group 3 are fixed: the collection drawer buttons follow the colour scheme, the article `padding_top` setting has a visible effect, the testimonial marquee loops without a seam at any testimonial count, and add to cart on the product page follows the global `cart_type` setting like quick view.

**Decided (user, 2026-10-26).** (1) A: drop the overrides. (2) A: `padding_top` sets the gap between the article hero and the body, replacing the fixed `mt-step-xl`. (3) Bug fix. (4) A: follow `cart_type`.

**Evidence (coordinator, 2026-10-26).**
1. `sections/collection.liquid` "Load more" and "Retry" buttons in the collection navigation drawer carry `surface-inverted hover:opacity-90` on `btn-primary`; `.surface-inverted` comes after `.btn-primary` in the same utilities layer of `assets/tailwind.output.css`, so it wins background and text colour; no other `btn-primary` in the theme is overridden.
2. `sections/article.liquid`: the setting (default 32, stored 32 in the article templates) reaches only `--section-frame-padding-top` on the frame root (`padding_mode: 'overlay'`), and no descendant uses it; the body block is `section-frame__overlay-padding-bottom ... mt-step-xl`. The hero title is vertically centred, so padding on the hero would move it by about half the value.
3. `sections/testimonial-featured.liquid`: the track is two passes of `copies × columns`, animated by one pass; column offset follows the global column parity and `--wm-phase` is `(index - 1) mod 4`, so a pass must hold a multiple of 4 columns. Today: 1 testimonial 6 columns, 2 testimonials 3, 5 or 6 testimonials 6 (seam); 3, 4, 7, 8 testimonials fine.
4. `snippets/quick-view-buy-actions.liquid` maps `settings.cart_type` to `open_cart_on_add`, `open_dialog_id: 'cart-overlay-drawer'` and an empty `success_message` in drawer mode, and to the toast in page mode; `snippets/product-info-blocks.liquid` renders `buy-buttons` twice (quantity-selector anchor and buy-buttons anchor) without them, so the product page and `featured-product` always toast.

**Dependencies.** `npm.cmd run shopify:dev` running.

**Implementation surface.**
1. `sections/collection.liquid`: remove `surface-inverted` and `hover:opacity-90` from the two buttons.
2. `sections/article.liquid`: the body block replaces `mt-step-xl` with `section-frame__overlay-padding-top` (keeping `section-frame__overlay-padding-bottom`); `section-frame__overlay-padding` cannot be used because it also matches the combined rule.
3. `sections/testimonial-featured.liquid`: `testimonial_copies_per_set` becomes the smallest value at least today's count (6, 3, 2) for which `copies × columns` is a multiple of 4 (1 testimonial 8, 2 testimonials 4, 5 or 6 testimonials 4, others unchanged).
4. `snippets/product-info-blocks.liquid`: both `buy-buttons` renders pass `open_cart_on_add`, `open_dialog_id` and `success_message` mapped from `settings.cart_type` exactly as `snippets/quick-view-buy-actions.liquid` does; no change to `snippets/buy-buttons.liquid` or its defaults (other callers keep their behaviour). If the drawer then shows stale contents, stop and report.

**Review tier.** Ask (Liquid markup).

**Estimate:** 1.5 hours plus the Ask review.

**Checkpoint:** after all four items and the validators, before the review; stop whenever a fix needs a method not named above.

**Bar:** Must fix: an acceptance check failing; a new `test:layout` issue; the drawer opening without the added line or with a stale count; a seam visible at 1, 2, 3 or 5 testimonials. Accepted residue: the extra marquee DOM for 1, 2, 5 and 6 testimonials. Judged on the default settings, plus `cart_type: page` for item 4.

**Motion.** Item 3 changes how a CSS marquee repeats (no timing or keyframe change); `review-animations` runs on the motion diff before step 7 and its output is recorded here.

**Acceptance checks.**
1. Collection drawer at 390 and 1440: "Load more" computes the scheme's primary button background and text (`--color-primary-button`, `--color-primary-button-text`), and its hover is the standard `btn-primary` hover.
2. Article page at 390 and 1440: the gap between the hero bottom and the body top equals the frame's `--section-frame-padding-top` at the stored 32; measured before and after and recorded.
3. Testimonial marquee with 1, 2, 3 and 5 testimonials (Theme Editor or a local template copy that is not committed): the rendered columns per pass is a multiple of 4 (counted with a script), and the offset class and `--wm-phase` of column `n + pass length` equal those of column `n`; with `motion_enabled` off and with reduced motion emulated, the marquee stays still as before.
4. Product page, `cart_type: drawer`: add to cart opens the cart drawer with the added line and an updated count, focus moves into the drawer, no toast. `cart_type: page` (settings changed only in the running dev theme, not committed): the toast appears and no drawer opens. `featured-product` on home behaves the same.
5. Validators pass: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`, and `npm.cmd run test:layout` at 390 and 1440 with 0 new issues. `git diff --name-only` shows no merchant-owned file.

**Status.** Planned 2026-10-26. Authorized by the user 2026-10-26 ("ok"); implemented by the coordinator in this session, no subagent and no external execution prompt.

**Execution (2026-10-26).**
1. `sections/collection.liquid`: `surface-inverted` and `hover:opacity-90` removed from both buttons.
2. `sections/article.liquid`: the body block carries `section-frame__overlay-padding-top section-frame__overlay-padding-bottom`; `mt-step-xl` removed.
3. `sections/testimonial-featured.liquid`: the copies rule is general rather than per count: 8 for 1 testimonial, 4 when the column count is odd, 2 otherwise, so every pass holds a multiple of 4 columns at any block count (the plan's list covered up to 8 testimonials; 9 and 10 also needed it).
4. `snippets/product-info-blocks.liquid`: one `cart_type` mapping at the top of the snippet (same values as `snippets/quick-view-buy-actions.liquid`), passed to both `buy-buttons` renders.
5. `build:tw` removed the utilities no longer used from `assets/tailwind.output.css` (11 lines).

**Plan correction (coordinator).** Acceptance check 4, page mode: `assets/buy-buttons.js` shows the toast and then goes to the cart page when `cart_type` is `page`; the product page already passed `cart_type` before this batch, so that is existing behaviour, not "toast and stay".

**Validation (coordinator, 2026-10-26).**
1. Collection `/collections/all` at 1440: "Load more collections" and "Retry" compute background `rgb(38 61 41)` and text white, equal to the scheme's `--color-primary-button` and `--color-primary-button-text` and to the cart's Checkout button; no opacity class.
2. Article: superseded by the correction below (the "blocked for data" claim was wrong).
3. Marquee, temporary uncommitted templates `templates/index.mqtest{1,2,3,5}.json` (deleted after) plus home (6 testimonials): columns per pass 8, 4, 4, 12 and home 12, all multiples of 4; offset class and `--wm-phase` of column `n` and `n + pass` match for every column (0 mismatches). Reduced motion emulated on 2 testimonials: track and column `animation-name: none`. `motion_enabled` off: the stylesheet rule is unchanged by this batch, not re-run.
4. `cart_type: drawer`: product page add to cart sends `/cart/add.js`, the drawer shows "Floral White Top", cart count 1, focus moves to the drawer's close button, no toast (repeated after a reload); home `featured-product` the same. `cart_type: page` (temporary uncommitted edit to `config/settings_data.json`, reverted with `git checkout`): the toast path runs and the page goes to `/cart` with the line added, as before this batch. A first click right after a cart clear sent no request; not reproduced after a reload.
5. `lint:theme` passed; `test:theme-check` 157 files, no offenses; `lint:liquid-syntax` passed; `scan:compat` passed; `lint:i18n` passed; `test:layout --widths 390,1440` 0 new issues; `git status` shows no merchant-owned file.

**review-animations (coordinator, 2026-10-26).** Motion diff: the marquee's repeat count only; no easing, duration, keyframe or property change; the animation stays on `transform`; reduced motion honoured (check 3); the existing pause control stays. Note: more animated columns for 1, 2, 5 and 6 testimonials (up to 24), the plan's accepted residue. Verdict: approve.

**Review 1 (external Verifier, 2026-10-26): FAIL**, one finding: validation item 2 claimed no article exists, but `/sitemap_articles_1.xml` lists seven and `/blogs/news/博客标题1` renders the section (the coordinator's link search on the blog page was wrong). Everything else proven, including the article paddings after the change (32px at 1440, 19.41px at 390), the copies rule for 1 to 10 testimonials (pass lengths 8, 4, 4, 4, 12, 12, 8, 8, 20, 20), motion off simulated, and the drawer flow.

**Correction (coordinator, 2026-10-26).** Article `/blogs/news/博客标题1`, Chrome DevTools MCP; "before" measured by swapping the body block's class back to `mt-step-xl` in the DOM, then restoring it. Gap from the hero bottom to the body content top: 1440 before 30px (`margin-top`), after 32px (`padding-top`); 390 (mobile emulation) before 18.20px, after 19.41px. `--section-frame-padding-top` is `clamp(19.2px, 13.898px + 1.414vw, 32px)` from the stored 32, so the setting is fluid like every other section's padding; the earlier estimate "390 about 19 to 32px" in chat was wrong.

**Review 2 (external Verifier, correction, 2026-10-26): PASS.** Article measurements reproduced (1440: 30 to 32px; 390: 18.20 to 19.41px); implementation files unchanged since review 1.

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.
