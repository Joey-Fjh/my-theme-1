# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan LS2-A: containers sized by content, and layout shifts

**Outcome.** No container keeps a fixed height that leaves a large empty band under short content, narrow product cards keep their image visible under the hover actions, and the product page and the home `ritual-steps` section stop shifting on load.

**Decided (user, 2026-10-27 and 2026-10-28).** Board topic LS2 (option B, plan `git show 8cb6fe7:docs/agent/context.md`) and the fixed roadmap in `docs/project.md`. The roadmap's LS2 runs as two batches: this one (containers and shifts), then LS2-B (the home and product design items of backlog groups 4 and 5, screenshot-led). No user picks are left open: the scope below is fixed.

**Evidence.**

- Quick view (`snippets/product-card.liquid`): wrapper insets `tablet:px-[8vw] tablet:py-[5vh]` and panel `tablet:h-full tablet:!max-h-full`, so about 1210×810 at 1440×900 whatever the content. References at 1440×900: Dawn content width 70% with `max-height` and `overflow-y: auto`; Horizon `min(54rem, …)` × `min(38.5rem, 96vh)`; Princess Polly about 871×564, centred and sized by content.
- Home `featured-product` carousel under `adapt` (1440×900): frame fixed at 810 (the cap); slide 9 (811×400) sits at the top with about 410px empty below; the stage height `min(calc(var(--screen-height) - 6rem), 96rem)` in `sections/featured-product.liquid`. Horizon takes the gallery ratio from the featured media.
- Fixed-height inventory (static scan, 2026-10-27): `promo-bannder` panel `max(40rem, var(--screen-height))`; `article` hero `55svh`; `newsletter-overlay` media `tablet:h-full`; `promise-section` media `tablet:h-full`; `search` `min-h-[50svh]` (empty state).
- `ritual-steps` scroll carousel: text group 212/230px empty above and below at 1440×900, 309/331px at 1580×1130; the panel gap is `clamp(var(--spacing-step-3xl), 14svh, …)`; the pinned stage is one screen by design. Reload at y=1500 at 390: a 0.1339 shift from the section frame (G7 review 2).
- Product card hover actions (search, 1440, four columns, card about 275px): Quick View and Add to Cart at `body-2xl` (`--type-step-2`, viewport-fluid, at its 1280px maximum) cover most of the image (`tailwind/tailwind.components.css` `.product-card__hover-actions`).
- Product page cold load (cache bypassed, G7 review 2): 0.0826 at 1440 and 0.4155 at 390 from the product information, gallery, thumbnail navigation and variant picker; the coordinator measured 0.0125 at 1440 (icon group, buy-buttons label, thumbnail nav) on a warm load. Likely the `adapt` gallery height settling after hydration (LS1).

**Implementation surface and method.**

1. **Quick view:** `snippets/product-card.liquid` (dialog wrapper and panel classes), `snippets/product-quick-view.liquid`, the `product-quick-view` rules in `tailwind/tailwind.components.css`. A centred dialog `min(56rem, 100vw - gutters)` wide, height from content, capped at `90svh` with internal scroll in the info column; the gallery column takes the media's own ratio (`adapt`) within the cap. Mobile (below 48rem) keeps its current sheet unless it shows the same empty band.
2. **`featured-product` carousel under `adapt`:** `sections/featured-product.liquid`, `snippets/product-gallery-carousel.liquid`, `snippets/product-gallery.liquid`. The frame takes the featured media's ratio within the desktop cap; other slides are contained and centred in it (no one-sided band); the fixed stage height is replaced by the frame's own height. Fixed ratios unchanged.
3. **Inventory:** each of `promo-bannder`, `article` hero, `newsletter-overlay`, `promise-section`, `search` empty state is either changed to height-from-content with a cap or kept with a recorded design reason (one row each). Files: those sections and snippets only.
4. **`ritual-steps`:** `sections/ritual-steps.liquid` (and `assets/ritual-steps.js` only if the shift needs it). Reduce the tall-screen empty space through the content (the panel gap and the text group's scale with height; the pinned stage stays one screen), and remove the reload shift at its source.
5. **Product card hover actions:** `tailwind/tailwind.components.css` (card actions) and `snippets/product-card.liquid` if a container needs declaring. The card is an inline-size container; the buttons pick a smaller type step on narrow cards through a container query (type steps only, per the stylesheet font-size rule), padding in `em`; the actions panel covers at most the lower part of the image.
6. **Product page load shift:** the gallery and product-info files that own the shifting elements (`snippets/product-gallery*.liquid`, `assets/product-gallery.js`, `sections/product.liquid` or its blocks), named in the Results with the cause before editing. Reserve the gallery's height from the server render (the active media's ratio) so hydration does not move the information column.

Read `docs/references/architecture/javascript-runtime.md` before any JS change and `docs/references/style-system/css-architecture.md` before the CSS changes. Run `review-animations` if any motion changes.

**Review tier.** Ask: Liquid markup and possibly `assets/*.js`. The Verifier runs in a separate session from `.agents/roles/verifier.md`; the user looks at screenshots.

**Estimate:** about 7 hours (quick view 1.5, carousel 1.5, inventory 1, `ritual-steps` 1, card actions 0.5, product shift 1.5), plus the Ask review.

**Checkpoint:** two stops.

- After items 1 to 6 and validators: before and after screenshots at 1440 and 390 go to the user, then the Ask review prompt.
- Whenever a fix needs a file or method not named above.

**Bar:** judged on the default preset, the current templates and the demo products, at 1440×900, 1920×1080 and 390×844.

- **Must fix:**
    - The quick view leaves an empty band over about 120px under its content on desktop, or content taller than the cap cannot scroll.
    - The `featured-product` carousel under `adapt` leaves a one-sided empty band over about 120px on any slide, or crops any slide.
    - A four-column product card at 1440 has its hover actions covering more than about half of the image.
    - Product page cold-load shift (cache bypassed) over 0.1 at 390 or 1440; home reload at y=1500 at 390 over 0.1.
    - Any cropped product image under `adapt`, any new `test:layout` issue, any validator failure, any focus or keyboard regression in the quick view.
- **Accepted residue:** the `ritual-steps` pinned stage stays one screen tall; inventory entries kept with a recorded reason.

**Acceptance checks.**

1. Quick view at 1440×900 and 1920×1080 with a short-content product and a many-variant product: dialog size, empty run under the content, internal scroll; focus moves in, traps and returns on close; 390×844 recorded.
2. Home `featured-product` at 1440×900 and 1920×1080: every slide's frame size and empty run above and below; nothing cropped.
3. One row per inventory entry: changed (with measurement) or kept (with reason).
4. `ritual-steps` at 1440×900 and 1580×1130: empty space above and below the text group, before and after; reload shift at 390 at y=1500.
5. Product card at 1440 (four columns) and 390: the share of the image covered by the hover actions, before and after.
6. Product page cold load (cache bypassed) at 1440 and 390: shift totals and sources, before and after.
7. Validators: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n`, `npm.cmd run lint:compat` when JS changes, `npm.cmd run scan:compat` when Tailwind or a stylesheet changes, `npm.cmd run test:layout -- --widths 390,768,1024,1440` 0 new issues, Prettier on every changed file.
8. The Ask review reports PASS; the user looks at home, a product with one image and with many images, the quick view and a search results page, at 1440 and the user's own screen.

**History.** Planned 2026-10-28 from the roadmap (LS2, first batch). Not yet authorized.

**Results.**

(none yet)
