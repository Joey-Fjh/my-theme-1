# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan LS2: containers sized by content, and a screenshot-led layout pass (option B)

**Outcome.**

- No container keeps a fixed height that leaves a large empty band under short content: the quick view, the home `featured-product` carousel, and the remaining fixed heights from the inventory either follow content with a cap or are kept with a recorded design reason.
- Home and product pages are reviewed from screenshots, not only measurements, and the user picks which layout and spacing improvements land in this batch.

**Decided (user, 2026-10-27).** Board topic LS2, option B (A plus a screenshot-led review; C, the shared `section-frame` contract, waits until B settles the standards).

**Evidence (from the board topic).**

- **Trigger.** The user's look at LS1 (2026-10-27): the home `featured-product` carousel under `adapt` leaves landscape slides at the top of a fixed 810px frame; `ritual-steps` leaves 300px above and below its text on tall screens; the quick-view dialog is a fixed 90vh panel (`tablet:h-full` in `snippets/product-card.liquid`) with empty space under short content. The user: the discussed units and layout ideas were not applied, and the result lacks aesthetic judgement.
- **Cause.** Container heights are fixed (full height, one screen, the cap as the frame) instead of sized by content with a cap. LS1 applied its principles only to the flagged sections (A+B); the shared contract (LS1-C, `snippets/section-frame.liquid`) was deferred, and no `frontend-design` read was done.
- **References so far.** `featured-product`: Dawn shows the first media only, own ratio, constrained to the viewport, `contain`; Horizon `_featured-product-gallery` defaults `image_ratio` to adapt with `constrain_to_viewport` contain and takes the gallery ratio from the featured media. Evidence: `git show 37cff5e:docs/agent/context.md` (Closure).
- **Approach agreed (user, 2026-10-27).** Research and audit before code: (1) mainstream DTC stores for the home single-product feature, the quick view and full-screen narrative sections, measured on the live pages; (2) every container (sections, dialogs, drawers, galleries) against the LS1 principles plus "height from content, with a cap", each miss measured; (3) a `frontend-design` read discussed with the user; then scope options with estimates. LS1-C folds in here.
- **Research, quick view (2026-10-27, 1440×900).** Dawn `quick-add.css`: content width 70% (80% at 750px), `max-height` from the modal offset, `overflow-y: auto`, so height follows content. Horizon `theme-styles-variables`: `--quick-add-modal-width: min(54rem, 100vw minus insets)`, `--quick-add-modal-height: min(38.5rem, 96vh)`, gallery column 24rem: a compact fixed box. Princess Polly (live): modal about 871×564, centred, sized by content, image about 336px wide at 3:4. Allbirds (live): a 440px right drawer, full height, content fills it (24px left over). Fashion Nova: a size-only sheet. Rare Beauty: no quick view, add to bag on the card. Ours: wrapper insets `8vw`/`5vh` and `tablet:h-full` on the panel, so about 1210×810 whatever the content.
- **Research, product media (live, 1440×900).** Allbirds: a fixed landscape main frame (818×467) with `cover` over square sources, a grid below. Princess Polly: two fixed portrait frames (450×610, about 3:4) with `cover`. Brands with art-directed photography pick one fixed ratio; the themes (Dawn, Horizon) default to the image's own ratio because merchant images are unknown. Not yet researched live: home single-product features and full-screen narrative sections.
- **`frontend-design` read.** Its relevant guidance is process, not numbers: spend boldness in one place and keep the rest quiet; line length under 80 characters; critique the rendered page from screenshots. LS1 was judged by measurements only, never by a screenshot critique.
- **Fixed-height inventory (static scan of `sections/` and `snippets/`).** Height not from content: quick view (`snippets/product-card.liquid`, `tablet:h-full` + `!max-h-full`); `featured-product` carousel stage `height: min(calc(var(--screen-height) - 6rem), 96rem)`; `promo-bannder` panel `max(40rem, var(--screen-height))` (at least one screen); `ritual-steps` pinned stage (one screen by design); `article` hero `55svh`; `newsletter-overlay` media `tablet:h-full`; `promise-section` media `tablet:h-full`; `search` `min-h-[50svh]` (empty state). Already content-sized with a cap: `image-lightbox` and `product-media-modal` (`max-h-[85vh]`/`90vh`), the header menu (`max-height: calc(100dvh - …)`); `snippets/section-frame.liquid` stage heights are the merchant's `section_height` setting (minimums).

**Dependencies.**

- `npm.cmd run shopify:dev` running; Chrome DevTools MCP for live-store research and screenshots.
- The user picks items at checkpoint 1 before any change from the screenshot review is made.

**Implementation surface and method.**

- **Stage 1 (no code).**
    - Live research still open: home single-product features and full-screen narrative sections, 4 to 6 mainstream stores, measured at 1440×900 (container size, content extent, empty runs).
    - Screenshot review of home (every section) and the product page (one image and many images) at 1440×900 and 390×844, read against `frontend-design` (one bold element, quiet surroundings, line length, rhythm) and the LS1 principles plus "height from content, with a cap". One row per finding: screenshot, measurement, proposed change, cost.
- **Stage 2 (code), A, fixed scope:**
    - Quick view: `snippets/product-card.liquid` dialog classes and the `product-quick-view` component styles in `tailwind/tailwind.components.css`: a centred dialog about 54 to 56rem wide, height from content, capped (about 90svh) with internal scroll; mobile unchanged unless the review says otherwise.
    - `featured-product` carousel under `adapt`: `sections/featured-product.liquid`, `snippets/product-gallery-carousel.liquid`, `snippets/product-gallery.liquid`: the frame takes the featured media's ratio within the cap (Horizon's approach); other slides are contained and centred; the fixed stage height `min(calc(var(--screen-height) - 6rem), 96rem)` is reviewed.
    - The other inventory entries (`promo-bannder`, `article` hero, `newsletter-overlay`, `promise-section`, `search` empty state): fix or record a design reason, one row each.
- **Stage 2 (code), B, the user's picks** from the stage 1 list, including `ritual-steps` empty space on tall screens (212/230px at 1440×900, 309/331px at 1580×1130; pinned one-screen stage, so the fix is in the content, not a cap; `sections/ritual-steps.liquid`). Files outside the named ones are named in the stage 1 list and approved with the pick.
- Read `frontend-design` before stage 1 (done once, 2026-10-27; reread if the direction changes). Run `review-animations` if any motion changes.

**Review tier.** Ask: Liquid markup changes. The Verifier runs in a separate session from `.agents/roles/verifier.md`; the user's look at screenshots is part of acceptance.

**Estimate:** about 8 to 10 hours (stage 1 about 3, A about 4, B picks about 2 to 3), plus the Ask review.

**Checkpoint:** three stops.

- After stage 1: the research table and the screenshot findings list go to the user, who picks; no code before this.
- After stage 2 and validators: before and after screenshots at 1440 and 390 to the user, then the Ask review prompt.
- Whenever a fix needs a file or method not named above or in the approved picks.

**Bar:** judged on the default preset, the current templates and the demo products, at 1440×900, 1920×1080 and 390×844.

- **Must fix:**
    - The quick view leaves an empty band over about 120px under its content on desktop, or its content is unreachable (no scroll) when taller than the cap.
    - The `featured-product` carousel frame under `adapt` leaves a one-sided empty band over about 120px on any slide.
    - Any approved pick not delivered, or delivered without its before and after screenshot.
    - Any cropped product image under `adapt` (the LS1 rule), any new `test:layout` issue, any validator failure, a focus or keyboard regression in the quick view.
- **Accepted residue:** the `ritual-steps` pinned stage stays one screen tall; picks the user declines; LS2-C (shared contract).

**Acceptance checks.**

1. Research table: one row per store and pattern with the measured size, recorded under Results.
2. Findings list: one row per finding with a screenshot path, measurement, proposed change and cost; the user's picks recorded.
3. Quick view at 1440×900 and 1920×1080 with a short-content product and a many-variant product: dialog size, empty run under content, internal scroll works; focus moves in, traps, and returns on close; at 390×844 unchanged or as approved.
4. Home `featured-product` at 1440×900: every slide, frame size and empty run above and below; nothing cropped.
5. One row per remaining inventory entry: changed (with measurement) or kept (with reason).
6. Each approved pick: before and after screenshot and measurement.
7. Validators: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n`; `npm.cmd run scan:compat` when Tailwind or a stylesheet changes; `npm.cmd run test:layout -- --widths 390,768,1024,1440` 0 new issues.
8. The Ask review reports PASS; the user looks at home, a product with one image and with many images, and the quick view, at 1440 and the user's own screen.

**History.** Planned 2026-10-27 from board topic LS2 (option B, chosen by the user). Not yet authorized.

**Results.**

(none yet)
