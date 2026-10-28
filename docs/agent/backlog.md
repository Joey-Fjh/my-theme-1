# Backlog

Accepted work that no batch has taken yet. One line per item: what, a source (the batch or date it came from), a surface (files, sections or pages), and the governing decision when there is one. Each line ends with labeled source and surface fields per the H1 plan format. An item leaves this file when a batch plan takes it into `docs/agent/context.md`; finished work leaves no record here (history is in Git). Undecided matters stay on `docs/agent/board.md`.

Last updated: 2026-10-28.

Group 4 part A (contrast, `scroll-categories` touch, sticky overlap, `promo-bannder` link) done in HP1 (`38fc9d2`; plan and reviews in `git show 38fc9d2:docs/agent/context.md`). Part B composition (order, evening ritual, header logo left, full-width testimonials) done in HC1 (`a38077a`). Order (user, 2026-10-26): the numbered groups run in order before the second submission (target one to two weeks); in groups 4 and 5, items with review risk come first and design-fidelity details are done as time allows. The last group waits until after the submission.

## Before submission 1: performance classification

Classified 2026-10-26; the theme-code fixes closed in L1 (`4c43a39`); the classification is in `git show 4c43a39:docs/agent/context.md`.

## Before submission 2: fonts and weights (one theme-wide decision)

Done 2026-10-26 in F1 (`9e6dcc5`); the plan and its reviews are in `git show 9e6dcc5:docs/agent/context.md`.

## Before submission 3: setting and behaviour fixes

Done 2026-10-26 in G3 (`fdfb7ba`); the plan and its reviews are in `git show fdfb7ba:docs/agent/context.md`.

## Before submission 4: home polish (tablet and touch first)

- LS2 after OS2 and before RR1 (user, 2026-10-28), LS2-B after LS2-A (roadmap in `docs/project.md`; LS2-A plan `git show d439f2b:docs/agent/context.md`): the items below and those of group 5, screenshot-led against `frontend-design`; LS2-A covers the containers, card hover actions, load shifts and `ritual-steps` tall-screen spacing. Source: board topic LS2, `git show 8cb6fe7:docs/agent/context.md`. Surface: per item.
- `featured-products` titles wrap beside the price at 1024. Source: HT1 tablet sweep, 2026-10-26 (the rest of the tablet item closed: swept in HT1, no real-device check, user 2026-10-27). Surface: `sections/featured-products.liquid`.
- User look at HP1's two accepted visual changes: inactive `ritual-steps` steps and `scroll-categories` rows dim to a scheme muted colour (weaker than the old opacity 0.3), and the `ritual-steps` badge no longer dims on inactive steps; strengthen the active state another way (weight, an indicator) if needed. Source: HP1, 2026-10-26. Surface: `ritual-steps`, `scroll-categories`.
- Typography misses: 6-S6 row titles at 40px against about 58, its mobile index and spacing; 6-S3 heading and title sizes. Source: 6-S3, 6-S6. Surface: `collection-list`, `scroll-categories`.
- `scroll-categories` `tablet:` tier and flex classes switch at 768 while the two-column layout starts at 1024; the image `sizes` switch at `48rem`. Source: 6-S6 R12. Surface: `sections/scroll-categories.liquid`.
- `routine-showcase`: vertical label shows the step label while the design repeats the heading; badge sage is a scheme mix; arch ratio (the packshot box done in B6, `73aa65d`). Source: 6-S8. Surface: `sections/routine-showcase.liquid`.
- `promo-bannder`: small image ends at about 72% of the panel against the design's 85%. Source: 6-S9. Surface: `sections/promo-bannder.liquid`.
- `ritual-steps`: mobile heading size and prominent italics (`impeccable` 2026-10-15; style A size done in HP3); badge fill; proportions and spacing (oval angle and size, ring offset, star size; style B numeral and packshot done in B6, `73aa65d`). Source: 6-S11. Surface: `sections/ritual-steps.liquid`.
- `featured-product`: quantity beside add to cart on mobile (product page design) while the home mobile design stacks them; cap the `space-between` gaps on very tall screens; optional sticky add-to-cart bar; price and title sizes. Source: 6-S12. Surface: `sections/featured-product.liquid`, shared purchase snippets.
- Mobile rails, one card per view: `ritual-steps` and `routine-showcase` (`card-rail`) done in B13 (2026-10-25); the user names any further places at the polish pass; remaining candidates the `collection-list` slide, the `featured-products` tab strip, the `collection-all` nav-link scroller; until then their layout entries stay in the baseline; the two `collection-all` nav-link `page-margin` entries and the `ritual_steps_carousel` 768 title stay baselined, and the page-margin rule is reconsidered only if they remain after this item (decided: user, 2026-10-21). Source: user, 2026-10-11; 6-T1, 6-C2. Surface: those sections.
- Collection tab bar. Source: order after 6-D2, 2026-10-12. Surface: `collection-all`.

## Before submission 5: product polish (collection reviewed with it)

- `feature-tabs`: fade 400ms onto a motion token; literal `clamp()` spacing onto `--spacing-step-*`. Source: 6-P1. Surface: `sections/feature-tabs.liquid`.
- `mood-finder`: quadrant labels carry a backing box the design lacks; section 764px against about 700, wheel 408px against about 470 at 1440; card and arrow motion 400ms onto a token; below 80rem the botanical sits between wheel and card. Source: 6-P2. Surface: `sections/mood-finder.liquid`.
- `formula-details`: band image stays inside the page margins while the design bleeds it to the edge; numbers' monospace italic follows the font-role item below. Source: 6-P4. Surface: `sections/formula-details.liquid`.
- Product main: variant picker labels smaller than the design (user: leave for now); the rating row needs review data to show. Source: 6-P5 to 6-P7. Surface: `sections/main-product.liquid`.

## Before submission 6: optional sections

Done 2026-10-28 in OS2 (`ba6ae10`); the plan and its reviews are in `git show ba6ae10:docs/agent/context.md`. The countdown px digit sizes stay with the migration ratchets under After submission.

## Before submission 7: consolidated browser pass

Done: BP1 (`4e0884d`) and its defects in G7 (`8182efe`).

## Before submission 8: readiness review

- Manual test checklist for the launch-blocking flows (variant change, add to cart, cart drawer, menu, dialogs with keyboard and focus), following Shopify's official testing checklist read through Shopify Dev MCP. Decided (user, 2026-10-12): a document, not automation; written with the readiness review. Source: 6-T3. Surface: a new document.
- Cross-domain consolidation pass before the second submission (polish pass plus readiness review), and one read-only audit of the closed areas (JS runtime and modules, i18n, schema and settings, assets, `docs/references/` accuracy) by an external session, report outside the repo. Decided: user, 2026-10-09. Source: audit practice. Surface: read-only, then findings.
- Full 57-width layout sweep before a release (it also covers the width matrix left open by the 2026-10-04 pass); the layout baseline to 0 (count from `.agents/tools/layout-check/layout-check.baseline.json` `issues`; mostly home `tap-targets`, `featured-product` Swiper bullets under 24px, `scroll-categories` links, `page-margin` and one `clipped-text`). Source: baseline pruned 2026-10-13. Surface: `.agents/tools/layout-check/layout-check.baseline.json` and the named sections.
- Two unconfirmed layout entries (`featured-products` tab-0 at 680, blog tab-2 at 640, one width each): confirm with `test:layout` before the polish touches them; entries pruned 2026-10-13 (`featured-products` tab-2 at 760, blog tab-1 at 360, fifth `collection-all` nav link at 1040) that reappear are unstable measurements to classify, not regressions. Source: 2026-10-13. Surface: classification.

## After submission

- Confirm the 400 from hosted `account.js` disappears once the store password is removed. Source: 6-F1 review, 2026-10-13; moved from group 7 by BP1, 2026-10-27. Surface: store settings.
- `docs/design/design.md` pass: keep principles and capabilities, move case decisions made during batches (named sections, exact factors, per-section exceptions) out to the batch records or the section notes; the design decides per section, the architecture only offers the capability. Source: user, 2026-10-25 (B11). Surface: `docs/design/design.md`.
- Migration ratchets to 0: `body-size-custom` and the countdown size (display sizes 24/40, 24/32, 36/120), the `product-card` quick-view viewport padding (`raw-spacing` 2), raw radii (43 `border-radius` declarations, about half semantic) onto the radius tokens; then `legacy-type-tier`, `stylesheet-font-size` and `raw-spacing` reach 0 and become strict. Decided (user, 2026-10-11): each check and its baseline entry are deleted when the count reaches 0, deletion needing the user's approval in that batch. Source: 6-R1 to 6-R5. Surface: sections and snippets stylesheets, lint baselines.
- Shared component CSS in `tailwind/tailwind.components.css` (product info blocks, quick view, marquee) reworked. Source: user, 2026-10-03. Surface: `tailwind/tailwind.components.css`.
- Motion reveal: rewrite `assets/motion-reveal.js` (29.9 KB) smaller once the cascade's look is settled; the entrance `translateY` is clipped by Swiper `overflow: hidden` (for example no vertical offset inside overflow containers). Source: 6-M1, 6-S4 R10. Surface: `assets/motion-reveal.js`.
- More link styles beyond `default` (resting underline) and `underline` (on hover), as design-level variants, not merchant settings. Source: user, 2026-10-25 (P1). Surface: `snippets/link.liquid`, `tailwind/tailwind.elements.css`.
- Social links: read the store's Brand settings (`shop.brand.metafields.social_links`) instead of, or as well as, the nine theme `social_*_link` settings; discuss first. Source: P1 discussion, 2026-10-25. Surface: `snippets/social-icons.liquid`, `config/settings_schema.json`.
- Card surface and depth: a card background role in the colour schemes (default white) shared by product and collection cards (collection cards hard-code `bg-white`); optional later a per-card metafield colour; hover depth from flat to raised (the reference image is no longer local; supply it again at the polish pass), with a layered shadow measured then; reconcile with `design.md` rule 3 (tinted backdrop, no grey drop shadow). Whether product cards get the raised hover too is decided at the polish pass. Source: user, 2026-10-05. Surface: colour scheme schema, `product-card`, `collection-list`.
- Shared carousel indicator: dots, progress pill and bars plus the optional pause button (`aria-current`, 24px targets, scheme colours; API: set active index, set progress, report a selection), controllers stay per section. Decided (user, 2026-10-04 and 2026-10-08; exception to the third-consumer threshold, confirmed 2026-10-13): extract with two real consumers, `slides-show` and `card-rail` dots, planned with the touch pause button. Source: 6-S1, 6-A1. Surface: new snippet and helper, `slides-show`, `card-rail`.
