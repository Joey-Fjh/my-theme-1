# Backlog

Accepted work that no batch has taken yet. One line per item: what, a source (the batch or date it came from), a surface (files, sections or pages), and the governing decision when there is one. Each line ends with labeled source and surface fields per the H1 plan format. An item leaves this file when a batch plan takes it into `docs/agent/context.md`; finished work leaves no record here (history is in Git). Undecided matters stay on `docs/agent/board.md`.

Last updated: 2026-10-21.

## Theme polish: home

- Sage backgrounds where the design shows them (the `scheme-4` Sage scheme exists since 6-D2; assigning it is a template change that needs the user's approval). Source: 6-S3, 6-S5, 6-S6, 6-S9, 6-S10, 6-S11, 6-P4. Surface: `collection-list`, `scatter-gallery`, `scroll-categories`, `promo-bannder` panel 1, `icon-with-text`, `ritual-steps`, `formula-details`, `templates/*.json`.
- Badge colours darkened for contrast: compare with the design. Source: 6-S4. Surface: badge settings, `snippets/product-card-badge.liquid`.
- Tablet widths 768 to 1024 on every home section (`pc` switches at 768); keep or revise the 6-S6 1024px layout breakpoint; check on a real iPad, portrait and landscape, for crowding. Source: user, 2026-10-05. Surface: home sections.
- Hover-only behaviour on touch for 6-S3 cards and 6-S6 rows, and on every home section at tablet widths (iPad). Source: user, 2026-10-05. Surface: `collection-list`, `scroll-categories`.
- Typography misses: 6-S6 row titles at 40px against about 58, its mobile index and spacing; 6-S3 heading and title sizes; the copied `heading-h1` PC formula in `scroll-categories` back to plain tier pairs. Source: 6-S3, 6-S6. Surface: `collection-list`, `scroll-categories`.
- `scroll-categories` `pc:` / `max-pc:` tier and flex classes still switch at 768 while the two-column layout starts at 1024; the image `sizes` switch at `48rem`. Source: 6-S6 R12. Surface: `sections/scroll-categories.liquid`.
- Testimonial marquee seam: with exactly 2 testimonials, half the track holds 3 columns, so the offset alternation breaks at the loop seam. Source: 6-S7 R4. Surface: `testimonial-featured`.
- `routine-showcase`: vertical label shows the step label while the design repeats the heading; badge sage is a scheme mix; arch ratio and packshot box against a real transparent packshot (Treat and Protect have no second image in the dev store: content). Source: 6-S8. Surface: `sections/routine-showcase.liquid`.
- `promo-bannder`: pale sage panel 1 against lime panel 3 needs scheme assignment (merchant configuration); sticky header overlaps a stuck panel; small image ends at about 72% of the panel against the design's 85%; the optional link's Tab reach untested with a configured link. Source: 6-S9. Surface: `sections/promo-bannder.liquid`.
- `ritual-steps`: badge fill; proportions and spacing (oval angle and size, ring offset, star size, numeral size, packshot scale); header overlap with the sticky frame and stage. Source: 6-S11. Surface: `sections/ritual-steps.liquid`.
- `featured-product`: quantity beside add to cart on mobile (product page design) while the home mobile design stacks them; cap the `space-between` gaps on very tall screens; optional sticky add-to-cart bar; price and title sizes. Source: 6-S12. Surface: `sections/featured-product.liquid`, shared purchase snippets.
- Icon stroke: the design's icons are lighter than Phosphor regular (`flask` not added). Source: 6-S10, 6-S12. Surface: `assets/icon-*.svg` via `build:svg`.
- Mobile rails, one card per view: the user names three places at the polish pass; candidates `ritual-steps` and `routine-showcase` (`card-rail`), the `collection-list` slide, the `featured-products` tab strip, the `collection-all` nav-link scroller, the `testimonial-featured` marquee; until then their layout entries stay in the baseline. Source: user, 2026-10-11. Surface: those sections.
- Collection tab bar. Source: order after 6-D2, 2026-10-12. Surface: `collection-all`.

## Theme polish: product

- `feature-tabs`: fade 400ms onto a motion token; literal `clamp()` spacing onto `--spacing-step-*`. Source: 6-P1. Surface: `sections/feature-tabs.liquid`.
- `mood-finder`: quadrant labels carry a backing box the design lacks; section 764px against about 700, wheel 408px against about 470 at 1440; card and arrow motion 400ms onto a token; below 80rem the botanical sits between wheel and card. Source: 6-P2. Surface: `sections/mood-finder.liquid`.
- `formula-details`: band image stays inside the page margins while the design bleeds it to the edge; numbers' monospace italic follows the font-role item below. Source: 6-P4. Surface: `sections/formula-details.liquid`.
- Product main: variant picker labels smaller than the design (user: leave for now); the rating row needs review data to show. Source: 6-P5 to 6-P7. Surface: `sections/main-product.liquid`.

## Theme polish: global

- Monospace italic in the design (`ritual-steps` step labels, eyebrows, prices; `formula-details` numbers): per `design.md` use the body family, step labels as an ink-tinted chip, tabular figures for numbers (`lint:theme` forbids `font-mono`). Source: 6-S11, 6-P4, order after 6-D2. Surface: `ritual-steps`, `formula-details`.
- Medium weight: confirm the 500 face `design.md` asks for is loaded (earlier only 400 and 700 were, so `font-medium` rendered at 400). Source: design phase inputs, 2026-10-03. Surface: `layout/theme.liquid` font loading, `snippets/css-variables.liquid`.
- Migration ratchets to 0: `body-size-custom` and the countdown size (display sizes 24/40, 24/32, 36/120), the `product-card` quick-view viewport padding (`raw-spacing` 2), raw radii (43 `border-radius` declarations, about half semantic) onto the radius tokens; then `legacy-type-tier`, `stylesheet-font-size` and `raw-spacing` reach 0 and become strict. Decided (user, 2026-10-11): each check and its baseline entry are deleted when the count reaches 0, deletion needing the user's approval in that batch. Source: 6-R1 to 6-R5. Surface: sections and snippets stylesheets, lint baselines.
- Shared component CSS in `tailwind/tailwind.components.css` (product info blocks, quick view, marquee) reworked. Source: user, 2026-10-03. Surface: `tailwind/tailwind.components.css`.
- Article `padding_top`: decided (user, 2026-10-08) to fix it as a standard section setting; the article top moves by the stored value (32), which the user checks. Source: 5-C3d3. Surface: `sections/article.liquid`.
- Motion reveal: rewrite `assets/motion-reveal.js` (29.9 KB) smaller once the cascade's look is settled; the entrance `translateY` is clipped by Swiper `overflow: hidden` (for example no vertical offset inside overflow containers). Source: 6-M1, 6-S4 R10. Surface: `assets/motion-reveal.js`.
- Six optional sections meet the polish standard before submission: `before-after-comparison`, `about-stats`, `newsletter-banner` (placed outside home), `promotion-countdown`, `video-banner`, `google-map` (in no template, kept as merchant options). Decided: user, 2026-10-11. Source: cleanup survey, 2026-10-06. Surface: those sections.

## Later batches

- Card surface and depth: a card background role in the colour schemes (default white) shared by product and collection cards (collection cards hard-code `bg-white`); optional later a per-card metafield colour; hover depth from flat to raised (reference `docs/design/home/category-grid/hover-depth.png`, local), with a layered shadow measured then; reconcile with `design.md` rule 3 (tinted backdrop, no grey drop shadow). Whether product cards get the depth too is an open decision on the board. Source: user, 2026-10-05. Surface: colour scheme schema, `product-card`, `collection-list`.
- Shared carousel indicator: dots, progress pill and bars plus the optional pause button (`aria-current`, 24px targets, scheme colours; API: set active index, set progress, report a selection), controllers stay per section. Decided (user, 2026-10-04 and 2026-10-08; exception to the third-consumer threshold, confirmed 2026-10-13): extract with two real consumers, `slides-show` and `card-rail` dots, planned with the touch pause button. Source: 6-S1, 6-A1. Surface: new snippet and helper, `slides-show`, `card-rail`.

## Defects

- Pagination never uses the section refresh: `ShopifyHttp.getJSON` sends `Accept: application/json`, the dev storefront answers `?sections=` with 404, and the module falls back to full navigation. Proposed: `headers: { Accept: '*/*' }` on that request (Ask tier), verified by paginating a collection and the blog. Source: 2026-10-13. Surface: `assets/section-pagination.js`.
- Loading indicator: under reduced motion a still ring at 0.65 opacity (weak signal); `role="status"` and its label sit inside an `aria-hidden="true"` wrapper, so the label is never announced. Source: 2026-10-13. Surface: `snippets/loading.liquid`.

## Browser pass

- Rows the 2026-10-13 smoke pass did not cover: no-JavaScript; a blog article (none reachable); at 390 the cart page, cart drawer, search, lightbox, quick view, predictive search, localization, accordion, tabs; carousel pagination and keyboard; collection pagination with Back and Forward; the newsletter overlay's Tab trap; a plain dropdown with a real second level. Source: framework smoke pass, 2026-10-13. Surface: storefront.
- Rows still open from the 2026-10-04 pass: live side by side, no-JavaScript at 1440, most of G3 and G5, the 5-C3f keyboard focus sweep, the width matrix, product media Escape, native reduced motion, facet history, stylesheet subsetting on a pushed theme (5-C1), rows Blocked for data, Theme Editor, Safari or configuration. Detail: `git show fe4b986:docs/agent/board.md` and `git show 3652441:docs/migration/phase0/browser-checklist.md`. Source: 2026-10-04. Surface: storefront.
- Per-section checks not yet seen live: `slides-show` Theme Editor block select and deselect and native reduced motion; accent colour Theme Editor live preview; promo bar hover pause, touch tap not pausing; collection cards real touch tap and real `:hover`; custom badges, badges in recommendations, lite cards in the super menu (Blocked for data); testimonial marquee native reduced motion on a device; `feature-tabs`, `mood-finder` (with real products), `editorial-collage`, `formula-details` with Theme Editor toggles and uploads and in Safari. Source: 6-S1 to 6-S7, 6-P1 to 6-P4. Surface: those sections.
- Scroll-linked sections (`scatter-gallery` and later narrative sections) on a real iPhone through a pushed unpublished theme's preview link (`127.0.0.1` is unreachable from the phone). Source: user, 2026-10-05. Surface: home.
- Store configuration to classify or confirm: `/favicon.ico` 404 on the first home load; the 400 from hosted `account.js` (password-protected store; confirm it disappears once the password is removed). Source: 6-F1 review, 2026-10-13. Surface: store settings.

## Readiness, Lighthouse and CI

- Classify the collection performance (LCP 5.5 s, TBT 890 ms; mobile median 0.48) and best practices 0.59 on all three pages before any code change; the job passes on the best of three runs, so green does not prove the Theme Store bar. Source: Lighthouse CI run 38363613541, 2026-10-13. Surface: classification first.
- Manual test checklist for the launch-blocking flows (variant change, add to cart, cart drawer, menu, dialogs with keyboard and focus), following Shopify's official testing checklist read through Shopify Dev MCP. Decided (user, 2026-10-12): a document, not automation; written with the readiness review. Source: 6-T3. Surface: a new document.
- Cross-domain consolidation pass before the second submission (polish pass plus readiness review), and one read-only audit of the closed areas (JS runtime and modules, i18n, schema and settings, assets, `docs/references/` accuracy) by an external session, report outside the repo. Decided: user, 2026-10-09. Source: audit practice. Surface: read-only, then findings.
- Full 57-width layout sweep before a release; the layout baseline to 0 (37 polish-pass entries: `tap-targets` ×15 on home, `featured-product` Swiper bullets ×10 under 24px and `scroll-categories` links ×5; `page-margin` ×23; `clipped-text` ×1). Source: baseline pruned 2026-10-13. Surface: `.agents/tools/layout-check/layout-check.baseline.json` and the named sections.
- Two unconfirmed layout entries (`featured-products` tab-0 at 680, blog tab-2 at 640, one width each): confirm with `test:layout` before the polish touches them; entries pruned 2026-10-13 (`featured-products` tab-2 at 760, blog tab-1 at 360, fifth `collection-all` nav link at 1040) that reappear are unstable measurements to classify, not regressions. Source: 2026-10-13. Surface: classification.

