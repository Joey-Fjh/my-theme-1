# Backlog

Accepted work that no batch has taken yet. One line per item: what, a source (the batch or date it came from), a surface (files, sections or pages), and the governing decision when there is one. Each line ends with labeled source and surface fields per the H1 plan format. An item leaves this file when a batch plan takes it into `docs/agent/context.md`; finished work leaves no record here (history is in Git). Undecided matters stay on `docs/agent/board.md`.

Last updated: 2026-10-26.

Order (user, 2026-10-26): the numbered groups run in order before the second submission (target one to two weeks); in groups 4 and 5, items with review risk come first and design-fidelity details are done as time allows. The last group waits until after the submission.

## Before submission 1: performance classification

Classified 2026-10-26; the theme-code fixes closed in L1 (`4c43a39`); the classification is in `git show 4c43a39:docs/agent/context.md`.

## Before submission 2: fonts and weights (one theme-wide decision)

Decided 2026-10-26 (one family); the remaining work is plan F1 in `docs/agent/context.md`.

## Before submission 3: setting and behaviour fixes

- `sections/collection.liquid` filter buttons (two, near lines 649 and 659) add `surface-inverted` and `hover:opacity-90` to `btn-primary`, bypassing the scheme's button colours; decide whether they follow the scheme. Source: B12 audit, 2026-10-25. Surface: `sections/collection.liquid`.
- Article `padding_top`: decided (user, 2026-10-08) to fix it as a standard section setting; the article top moves by the stored value (32), which the user checks. Source: 5-C3d3. Surface: `sections/article.liquid`.
- Testimonial marquee seam: with exactly 2 testimonials, half the track holds 3 columns, so the offset alternation breaks at the loop seam. Source: 6-S7 R4. Surface: `testimonial-featured`.
- Design choice: product page add to cart shows a toast only, or opens the cart drawer like quick view (`open_cart_on_add` in `snippets/buy-buttons.liquid`; live theme the same). Source: 2026-10-13. Surface: `snippets/buy-buttons.liquid`, `sections/main-product.liquid`.

## Before submission 4: home polish (tablet and touch first)

- Tablet widths 768 to 1024 on every home section (`pc` switches at 768); keep or revise the 6-S6 1024px layout breakpoint; check on a real iPad, portrait and landscape, for crowding. Source: user, 2026-10-05. Surface: home sections.
- Hover-only behaviour on touch for 6-S3 cards and 6-S6 rows, and on every home section at tablet widths (iPad). Source: user, 2026-10-05. Surface: `collection-list`, `scroll-categories`.
- `impeccable` 4.5.2 home critique as input to the home pass (decided: user, 2026-10-21; advisory, shortening the narrative touches accepted composition): (P1) three `promo-bannder` panels then two `ritual-steps` read as a catalogue; (P1) `slides-show` "MORNINGS" line break at 1440; (P2) inverted heading priority at 390; (P2) `testimonial-featured` clipped side cards on mobile; (P2) full bright accent on a `promo-bannder` panel (may be scheme config). Against `design.md`: accent area misuse, header layout, mobile rails, hero CTA underline, solid buy buttons, small ritual headings. Source: 2026-10-15 critique. Surface: home sections.
- Typography misses: 6-S6 row titles at 40px against about 58, its mobile index and spacing; 6-S3 heading and title sizes. Source: 6-S3, 6-S6. Surface: `collection-list`, `scroll-categories`.
- `scroll-categories` `tablet:` tier and flex classes switch at 768 while the two-column layout starts at 1024; the image `sizes` switch at `48rem`. Source: 6-S6 R12. Surface: `sections/scroll-categories.liquid`.
- `routine-showcase`: vertical label shows the step label while the design repeats the heading; badge sage is a scheme mix; arch ratio (the packshot box done in B6, `73aa65d`). Source: 6-S8. Surface: `sections/routine-showcase.liquid`.
- `promo-bannder`: pale sage panel 1 against lime panel 3 needs scheme assignment (merchant configuration); sticky header overlaps a stuck panel; small image ends at about 72% of the panel against the design's 85%; the optional link's Tab reach untested with a configured link. Source: 6-S9. Surface: `sections/promo-bannder.liquid`.
- `ritual-steps`: badge fill; proportions and spacing (oval angle and size, ring offset, star size; style B numeral and packshot done in B6, `73aa65d`); header overlap with the sticky frame and stage. Source: 6-S11. Surface: `sections/ritual-steps.liquid`.
- `ritual-steps` inactive step text contrast (1.5 to 1.7:1 on desktop: section heading, step heading, `rte` text, badge) fails `color-contrast`; decide the dimmed state against the scheme. Source: performance classification, 2026-10-26. Surface: `sections/ritual-steps.liquid`.
- `featured-product` variant picker option labels fail `color-contrast` (4 nodes on home, desktop Lighthouse 2026-10-26). Source: L1 review. Surface: `featured-product`, shared variant picker snippet.
- `featured-product`: quantity beside add to cart on mobile (product page design) while the home mobile design stacks them; cap the `space-between` gaps on very tall screens; optional sticky add-to-cart bar; price and title sizes. Source: 6-S12. Surface: `sections/featured-product.liquid`, shared purchase snippets.
- Mobile rails, one card per view: `ritual-steps` and `routine-showcase` (`card-rail`) done in B13 (2026-10-25); the user names any further places at the polish pass; remaining candidates the `collection-list` slide, the `featured-products` tab strip, the `collection-all` nav-link scroller, the `testimonial-featured` marquee; until then their layout entries stay in the baseline; the two `collection-all` nav-link `page-margin` entries and the `ritual_steps_carousel` 768 title stay baselined, and the page-margin rule is reconsidered only if they remain after this item (decided: user, 2026-10-21). Source: user, 2026-10-11; 6-T1, 6-C2. Surface: those sections.
- Collection tab bar. Source: order after 6-D2, 2026-10-12. Surface: `collection-all`.

## Before submission 5: product polish (collection reviewed with it)

- Product info blocks shift when the payment icons box appears (0.021 at 768, 0.013 at 1440, Slow 4G and CPU 4x; Chrome DevTools trace 2026-10-26). Source: L1. Surface: `sections/main-product.liquid` product info blocks, payment icons.
- `feature-tabs`: fade 400ms onto a motion token; literal `clamp()` spacing onto `--spacing-step-*`. Source: 6-P1. Surface: `sections/feature-tabs.liquid`.
- `mood-finder`: quadrant labels carry a backing box the design lacks; section 764px against about 700, wheel 408px against about 470 at 1440; card and arrow motion 400ms onto a token; below 80rem the botanical sits between wheel and card. Source: 6-P2. Surface: `sections/mood-finder.liquid`.
- `formula-details`: band image stays inside the page margins while the design bleeds it to the edge; numbers' monospace italic follows the font-role item below. Source: 6-P4. Surface: `sections/formula-details.liquid`.
- Product main: variant picker labels smaller than the design (user: leave for now); the rating row needs review data to show. Source: 6-P5 to 6-P7. Surface: `sections/main-product.liquid`.

## Before submission 6: optional sections

- Four optional sections meet the polish standard before submission: `before-after-comparison`, `newsletter-banner` (placed outside home), `promotion-countdown`, `video-banner`. Decided: user, 2026-10-11; `about-stats` and `google-map` removed from this list for deletion (user, 2026-10-22). Source: cleanup survey, 2026-10-06. Surface: those sections.
- Section heights for sections other than hero-type: only where height is not set by content (user, 2026-10-25); candidates the optional banner sections at their polish. Source: P1 discussion. Surface: those sections.

## Before submission 7: consolidated browser pass

- Rows the 2026-10-13 smoke pass did not cover: no-JavaScript; a blog article (none reachable); at 390 the cart page, cart drawer, search, lightbox, quick view, predictive search, localization, accordion, tabs; carousel pagination and keyboard; collection pagination with Back and Forward; the newsletter overlay's Tab trap; a plain dropdown with a real second level. Source: framework smoke pass, 2026-10-13. Surface: storefront.
- Rows still open from the 2026-10-04 pass: live side by side, no-JavaScript at 1440, most of G3 and G5, the 5-C3f keyboard focus sweep, the width matrix, product media Escape, native reduced motion, facet history, stylesheet subsetting on a pushed theme (5-C1), rows Blocked for data, Theme Editor, Safari or configuration. Detail: `git show fe4b986:docs/agent/board.md` and `git show 3652441:docs/migration/phase0/browser-checklist.md`. Source: 2026-10-04. Surface: storefront.
- Per-section checks not yet seen live: `slides-show` Theme Editor block select and deselect and native reduced motion; accent colour Theme Editor live preview; promo bar hover pause, touch tap not pausing; collection cards real touch tap and real `:hover`; custom badges, badges in recommendations, lite cards in the super menu (Blocked for data); testimonial marquee native reduced motion on a device; `feature-tabs`, `mood-finder` (with real products), `editorial-collage`, `formula-details` with Theme Editor toggles and uploads and in Safari. Source: 6-S1 to 6-S7, 6-P1 to 6-P4. Surface: those sections.
- `feature-tabs` product markers with real products: native Tab order and focus ring on the marker links, click navigation, alignment on an uploaded image at 390. Source: B7, 2026-10-25. Surface: `sections/feature-tabs.liquid`.
- Scroll-linked sections (`scatter-gallery` and later narrative sections) on a real iPhone through a pushed unpublished theme's preview link (`127.0.0.1` is unreachable from the phone). Source: user, 2026-10-05. Surface: home.
- Store configuration to classify or confirm: `/favicon.ico` 404 on the first home load; the 400 from hosted `account.js` (password-protected store; confirm it disappears once the password is removed). Source: 6-F1 review, 2026-10-13. Surface: store settings.
- Manual test checklist for the launch-blocking flows (variant change, add to cart, cart drawer, menu, dialogs with keyboard and focus), following Shopify's official testing checklist read through Shopify Dev MCP. Decided (user, 2026-10-12): a document, not automation; written with the readiness review. Source: 6-T3. Surface: a new document.

## Before submission 8: readiness review

- Cross-domain consolidation pass before the second submission (polish pass plus readiness review), and one read-only audit of the closed areas (JS runtime and modules, i18n, schema and settings, assets, `docs/references/` accuracy) by an external session, report outside the repo. Decided: user, 2026-10-09. Source: audit practice. Surface: read-only, then findings.
- Full 57-width layout sweep before a release; the layout baseline to 0 (count from `.agents/tools/layout-check/layout-check.baseline.json` `issues`; mostly home `tap-targets`, `featured-product` Swiper bullets under 24px, `scroll-categories` links, `page-margin` and one `clipped-text`). Source: baseline pruned 2026-10-13. Surface: `.agents/tools/layout-check/layout-check.baseline.json` and the named sections.
- Two unconfirmed layout entries (`featured-products` tab-0 at 680, blog tab-2 at 640, one width each): confirm with `test:layout` before the polish touches them; entries pruned 2026-10-13 (`featured-products` tab-2 at 760, blog tab-1 at 360, fifth `collection-all` nav link at 1040) that reappear are unstable measurements to classify, not regressions. Source: 2026-10-13. Surface: classification.

## After submission

- `docs/design/design.md` pass: keep principles and capabilities, move case decisions made during batches (named sections, exact factors, per-section exceptions) out to the batch records or the section notes; the design decides per section, the architecture only offers the capability. Source: user, 2026-10-25 (B11). Surface: `docs/design/design.md`.
- Migration ratchets to 0: `body-size-custom` and the countdown size (display sizes 24/40, 24/32, 36/120), the `product-card` quick-view viewport padding (`raw-spacing` 2), raw radii (43 `border-radius` declarations, about half semantic) onto the radius tokens; then `legacy-type-tier`, `stylesheet-font-size` and `raw-spacing` reach 0 and become strict. Decided (user, 2026-10-11): each check and its baseline entry are deleted when the count reaches 0, deletion needing the user's approval in that batch. Source: 6-R1 to 6-R5. Surface: sections and snippets stylesheets, lint baselines.
- Shared component CSS in `tailwind/tailwind.components.css` (product info blocks, quick view, marquee) reworked. Source: user, 2026-10-03. Surface: `tailwind/tailwind.components.css`.
- Motion reveal: rewrite `assets/motion-reveal.js` (29.9 KB) smaller once the cascade's look is settled; the entrance `translateY` is clipped by Swiper `overflow: hidden` (for example no vertical offset inside overflow containers). Source: 6-M1, 6-S4 R10. Surface: `assets/motion-reveal.js`.
- More link styles beyond `default` (resting underline) and `underline` (on hover), as design-level variants, not merchant settings. Source: user, 2026-10-25 (P1). Surface: `snippets/link.liquid`, `tailwind/tailwind.elements.css`.
- Social links: read the store's Brand settings (`shop.brand.metafields.social_links`) instead of, or as well as, the nine theme `social_*_link` settings; discuss first. Source: P1 discussion, 2026-10-25. Surface: `snippets/social-icons.liquid`, `config/settings_schema.json`.
- Card surface and depth: a card background role in the colour schemes (default white) shared by product and collection cards (collection cards hard-code `bg-white`); optional later a per-card metafield colour; hover depth from flat to raised (the reference image is no longer local; supply it again at the polish pass), with a layered shadow measured then; reconcile with `design.md` rule 3 (tinted backdrop, no grey drop shadow). Whether product cards get the raised hover too is decided at the polish pass. Source: user, 2026-10-05. Surface: colour scheme schema, `product-card`, `collection-list`.
- Shared carousel indicator: dots, progress pill and bars plus the optional pause button (`aria-current`, 24px targets, scheme colours; API: set active index, set progress, report a selection), controllers stay per section. Decided (user, 2026-10-04 and 2026-10-08; exception to the third-consumer threshold, confirmed 2026-10-13): extract with two real consumers, `slides-show` and `card-rail` dots, planned with the touch pause button. Source: 6-S1, 6-A1. Surface: new snippet and helper, `slides-show`, `card-rail`.
