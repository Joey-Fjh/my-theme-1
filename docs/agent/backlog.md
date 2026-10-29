# Backlog

Accepted work that no batch has taken yet. One line per item: what, a source (the batch or date it came from), a surface (files, sections or pages), and the governing decision when there is one. Each line ends with labeled source and surface fields per the H1 plan format. An item leaves this file when a batch plan takes it into `docs/agent/context.md`; finished work leaves no record here (history is in Git). Undecided matters stay on `docs/agent/board.md`.

Last updated: 2026-10-29.

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

Closed without change (user, 2026-10-28): CS1 put product cards on the white card surface as `home-1440.png` shows. In the browser the user preferred the cards as they were, so it was reverted before commit. Card surface stays as is.

## Before submission 8: readiness review

Done 2026-10-29: RR1-A, the ratchet tidy-up (`48b36cb`); RR1-B, the layout sweep and baseline 40 → 9 user-approved entries (`6103066`, with the testimonial author and the two unconfirmed entries classified there). RR1-C, the read-only audit, found no launch blocker (2026-10-29); its two code defects were fixed in RR1-E (`061a180`; the plan and its reviews are in `git show 061a180:docs/agent/context.md`). RR1-D1, the reference and record corrections and the Pending migration bundle, done in `99e61ce` (plan and review in `git show 99e61ce:docs/agent/context.md`). Left: RR1-D2 below.

Section cleanup sweep closed without change (user, 2026-10-28): of the 32 addable sections, 29 are used in templates or section groups. The other three are `custom-liquid` (kept by decision), and `promotion-countdown` and `video-banner` (optional, polished in OS1 and OS2). Unused sections were removed earlier in R1 (`44c275d`).

Social links closed without change (2026-10-28). Shopify Theme Store requirements section 13 (Shopify Dev MCP) asks for a set of social icons, Open Graph and Twitter card tags, and empty social placeholder text, not Brand settings. The theme has 9 `social_*_link` settings with empty placeholders (`locales/en.default.schema.json`), and `og:` and `twitter:` tags in `snippets/meta-tags.liquid`.

- RR1-D2 (user, 2026-10-29: option B, after RR1-D1; tier Show, the user reviews by running it; each item quotes the official checklist or accessibility line it covers, maps to this theme's sections and URLs at 390 and 1440 with keyboard; the official edge-case content tests run only on the CI store `ci-test`): manual test checklist for the launch-blocking flows (variant change, add to cart, cart drawer, menu, dialogs with keyboard and focus), following Shopify's official testing checklist read through Shopify Dev MCP. Decided (user, 2026-10-12): a document, not automation; written with the readiness review. Source: 6-T3. Surface: a new document.

## After submission

After the second submission the project takes no further architecture or feature work (user, 2026-10-28). Dropped then: the shared component CSS rework, the `motion-reveal` rewrite, link style variants, the shared carousel indicator (its accessibility part, the 24px dots, is in the group 8 layout baseline), the `design.md` pass, the sticky add-to-cart bar, more one-card mobile rails, and the collection tab bar.

- Confirm the 400 from hosted `account.js` disappears once the store password is removed (a check, not work). Source: 6-F1 review, 2026-10-13; moved from group 7 by BP1, 2026-10-27. Surface: store settings.
