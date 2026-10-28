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

Taken into plan LS2-B1 in `docs/agent/context.md` (user, 2026-10-28, scope B: the review-risk items plus the home design items, then LS2-B2 for the product page). The optional items moved to After submission.

## Before submission 5: product polish (collection reviewed with it)

Taken into plan LS2-B2 in `docs/agent/context.md` (2026-10-28). The product main items (variant label size, rating row) stay as they are (user: leave).

## Before submission 6: optional sections

Done 2026-10-28 in OS2 (`ba6ae10`); the plan and its reviews are in `git show ba6ae10:docs/agent/context.md`. The countdown px digit sizes stay with the migration ratchets under After submission.

## Before submission 7: consolidated browser pass

Done: BP1 (`4e0884d`) and its defects in G7 (`8182efe`).

## Before submission 7b: card surface and depth

- Card surface and depth: a card background role in the colour schemes (default white) shared by product and collection cards (collection cards hard-code `bg-white`); optional later a per-card metafield colour; hover depth from flat to raised (the reference image is no longer local; supply it again at the polish pass), with a layered shadow measured then; reconcile with `design.md` rule 3 (tinted backdrop, no grey drop shadow). Whether product cards get the raised hover too is decided at the polish pass. Source: user, 2026-10-05; moved before the second submission, 2026-10-28 (answers the design rejection). Surface: colour scheme schema, `product-card`, `collection-list`.

## Before submission 8: readiness review

- Manual test checklist for the launch-blocking flows (variant change, add to cart, cart drawer, menu, dialogs with keyboard and focus), following Shopify's official testing checklist read through Shopify Dev MCP. Decided (user, 2026-10-12): a document, not automation; written with the readiness review. Source: 6-T3. Surface: a new document.
- Cross-domain consolidation pass before the second submission (polish pass plus readiness review), and one read-only audit of the closed areas (JS runtime and modules, i18n, schema and settings, assets, `docs/references/` accuracy) by an external session, report outside the repo. Decided: user, 2026-10-09. Source: audit practice. Surface: read-only, then findings.
- Full 57-width layout sweep before a release (it also covers the width matrix left open by the 2026-10-04 pass); the layout baseline to 0 (count from `.agents/tools/layout-check/layout-check.baseline.json` `issues`; mostly home `tap-targets`, `featured-product` Swiper bullets under 24px, `scroll-categories` links, `page-margin` and one `clipped-text`). Source: baseline pruned 2026-10-13. Surface: `.agents/tools/layout-check/layout-check.baseline.json` and the named sections.
- `.testimonial-featured__author` (third column, first card) past the page margin at 1160–1200 on home: a `test:layout` new issue not in the baseline, pre-existing (same position under `HEAD` CSS). Source: SB1 Review 1 and 2, 2026-10-28. Surface: `sections/testimonial-featured.liquid`.
- Two unconfirmed layout entries (`featured-products` tab-0 at 680, blog tab-2 at 640, one width each): confirm with `test:layout` before the polish touches them; entries pruned 2026-10-13 (`featured-products` tab-2 at 760, blog tab-1 at 360, fifth `collection-all` nav link at 1040) that reappear are unstable measurements to classify, not regressions. Source: 2026-10-13. Surface: classification.
- Migration ratchets, tidy-up only (user, 2026-10-28: keep it if simple and invisible): replace a raw value with its token only where the token equals it exactly (the 5 `legacy-type-tier` hits, `raw-spacing` 2 in the `product-card` quick-view padding, the `border-radius` declarations that match a radius token); values with no equal token (the countdown display sizes, odd radii) stay and keep their baseline entries; shrink the baselines afterwards. No rendered change: `test:layout` and the user's look unchanged. Source: 6-R1 to 6-R5; brought back before the submission, 2026-10-28. Surface: sections and snippets stylesheets, `tailwind/` files holding the hits, lint baselines.
- Section cleanup sweep: review every section a merchant can add in the editor; remove or hide the unused and unpolished ones, since the reviewer tries them. Keep: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons in `snippets/social-icons.liquid`. Source: board Deferred ideas (user, 2026-10-05); moved before the second submission, 2026-10-28. Surface: `sections/`, `locales/` keys of removed sections.
- Social links from the store's Brand settings (`shop.brand.metafields.social_links`): do it only if Shopify's current theme requirements (Shopify Dev MCP) require it; otherwise drop. Source: P1 discussion, 2026-10-25; made conditional, 2026-10-28. Surface: `snippets/social-icons.liquid`, `config/settings_schema.json`.

## After submission

After the second submission the project takes no further architecture or feature work (user, 2026-10-28). Dropped then: the shared component CSS rework, the `motion-reveal` rewrite, link style variants, the shared carousel indicator (its accessibility part, the 24px dots, is in the group 8 layout baseline), the `design.md` pass, the sticky add-to-cart bar, more one-card mobile rails, and the collection tab bar.

- Confirm the 400 from hosted `account.js` disappears once the store password is removed (a check, not work). Source: 6-F1 review, 2026-10-13; moved from group 7 by BP1, 2026-10-27. Surface: store settings.
