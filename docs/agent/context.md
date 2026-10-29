# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-30.

## RR1-D2b: newsletter banner frame and product media modal layer

Status: implemented 2026-10-29; the user accepted it in the browser; independent review: PASS (review 2, 2026-10-29).

From the user's manual test pass (RR1-D2), decided in chat on 2026-10-29.

**Outcome.**

1. `newsletter-banner`: the media box fills its grid column at every width. Its height is at least `min(column width / image ratio, 80svh)` and taller copy still grows it. With no background image, the `lifestyle-1` placeholder fills the box (plain style, drawn in the frame's faint colour).
2. `product-media-modal`: the dialog is teleported to `body`, so a sticky gallery column no longer traps its z-index (header and product info painted over the open video). The modal video keeps its own ratio under both caps.

**Implementation surface.** `sections/newsletter-banner.liquid`, `snippets/product-media-modal.liquid`, `assets/tailwind.output.css` (built).

**Review tier.** Ask (Liquid markup).

**Estimate:** done. **Checkpoint:** the review. **Bar:** must fix: the banner narrower than its column, copy overflowing the banner, a page element painting over the open media modal, focus not returning to the opener on close, video not paused on close. Judged on the dev store content and default templates.

**Acceptance checks.**

1. At 1920×800 on `/pages/privacy-policy?view=about` the `.newsletter-banner__media` width equals its grid column (1600) and its height is 640; at a 150px-high viewport the box grows to its copy.
2. With the media modal open on `/products/casual-knitted-shirt3` and on the home featured product, `document.elementFromPoint` over the header, the add-to-cart button and the variant swatches returns an element inside the dialog; the dialog root's parent is `body`.
3. Escape closes the modal, pauses the video and returns focus to the gallery video button.
4. `lint:theme`, `lint:liquid-syntax`, `lint:compat`, `test:theme-check`, `npx prettier --check` on the changed files pass; `test:layout --page product`, `page-about-view`, `blog`, `article`: 0 new issues.

**Execution record.**

- Newsletter: aspect-ratio on a grid item shrank its width when `max-height` capped it (1138 of 1600). `width: 100%` alone overflowed the copy at short viewports, so the height moved to a container-unit `min-height` on the copy. Measured 1600×640 at 1920×800; 162 high (copy) at a 150px viewport; 451×720 at 500 wide.
- Newsletter placeholder: `lifestyle-1` in black competed with the heading; the stylesheet sets the frame's faint colour as its fill. `mixed-element` flagged the first anchor class; moved to `.newsletter-banner__media`.
- Media modal: the dialog sat inside the sticky gallery column (a stacking context). Teleported as `image-lightbox.liquid` already is. Measured: dialog parent `BODY`; all sampled points inside the dialog on product and home; Escape closed it, paused the video and returned focus to the opener. Video now 540×720 (its own size).
- A runtime scan of every `position: fixed` element on nine pages at 390 and 1440 found no other overlay inside a trapping ancestor; the header's own mobile menu and dropdowns sit in the header's layer by design.
- Validators above: all pass; the four `test:layout` runs: 0 new.

## RR1-D2c: listing title ellipsis, testimonial cards and default images

Status: implemented 2026-10-29 by the coordinator; independent review: PASS (2026-10-29); the user accepted it in the browser (2026-10-30).

From the user's manual test pass (RR1-D2), decided in chat on 2026-10-29.

**Outcome.**

1. `scroll-categories` (editor name "Collection product list"): from 64rem the row title stays on one line and ends in an ellipsis instead of running under the media column; the full title shows on hover through a `title` attribute.
2. `testimonial-featured`: the author moves under the stars when the meta row is too narrow; the placeholder media keeps only its divider towards the copy (a full square border showed inside the card's rounded corners); cards are 56vw from 48rem, 44vw from 64rem and 36vw from 80rem (at 36vw a tablet card left no room for the quote); the quote fills the space above the stars and fades out at its bottom instead of a fixed five-line clamp.
3. `templates/index.json`: the `testimonial_Ceylune` block's `show_image` is `true`, so every default card shows its image (user, 2026-10-29: "所有默认的show image"). Merchant-owned file: the commit carries a `Merchant-Change:` trailer.

**Implementation surface.** `sections/scroll-categories.liquid`, `sections/testimonial-featured.liquid`, `templates/index.json`.

**Review tier.** Ask (Liquid markup: the `title` attribute; merchant template).

**Estimate:** done. **Checkpoint:** the review. **Bar:** must fix: a title overlapping the media column from 64rem, an author outside its card, a hard-cut half line in a quote, a square corner inside a rounded card. Accepted residue: a quote that exactly fills its box shows its last line slightly faded. Judged on the dev store content.

**Execution record.**

- Ellipsis: at 900, 1100, 1200 and 1440 every title ends before the media column (`scrollWidth > clientWidth` titles truncated, right edge left of the details column); 1024 to 1279 truncates even the placeholder titles at the `title-l` tier.
- Authors: inside their cards at 900 to 1440 for all six cards.
- Quote lines that fit, media cards, before → after: 768 0 → 3, 900 1 → 5, 1024 2 → 3, 1100 2 → 5, 1280 3, 1440 5, 1920 8 (mobile unchanged).
- `lint:theme`, `lint:compat`, `scan:compat`, `lint:liquid-syntax`, `test:theme-check` (158 files, no offenses), `npx prettier --check`: pass. `test:layout --page home` and `--page page-about-view`: 0 new.

## RR1-D3: blank text settings render nothing

Status: phase 2 implemented 2026-10-29; review 1 FAIL, review 2 FAIL on two findings, both fixed by the coordinator and accepted by the user on validator evidence (option A, 2026-10-29); the four home `test:layout` entries are the known featured-products ones; the user accepted it in the browser (2026-10-30).

From RR1-D2: in `mood-finder`, clearing the eyebrow, phrase, tag line or description in the theme editor still shows text, because the section replaces a blank value with locale default copy or product data at render time. Shopify's Theme Store requirements say theme editor changes must be reflected in the editor preview; defaults belong in the schema `default`, where the merchant can see and clear them. A search (`'sections.<name>.defaults.<key>' | t` outside schema) found 51 runtime fallbacks in 11 sections: `formula-details` 12, `ritual-steps` 9, `feature-tabs` 9, `mood-finder` 6, `routine-showcase` 5, `testimonial-featured` 2, `scroll-categories` 2, `editorial-collage` 2, `blog-stories` 2, `scatter-gallery` 1, `main-page-about` 1.

**Outcome.** A text setting the merchant has cleared renders nothing: no text and no empty wrapper that leaves a gap. Demo content shown only while a section has no blocks or no resource selected (the editor placeholder state) stays.

**Dependencies.** None. RR1-D2b's uncommitted changes in `sections/newsletter-banner.liquid` and `snippets/product-media-modal.liquid` stay as they are; neither file is in this surface.

**Implementation surface.** Phase 1: none (read-only). Phase 2: the 11 section files above, and (widened 2026-10-29) any `sections/*.liquid` or `snippets/*.liquid` file that phase 1b finds with a class B row, except `sections/newsletter-banner.liquid` and `snippets/product-media-modal.liquid` (RR1-D2b, under review); `locales/en.default.json` and `locales/en.default.schema.json` (only to delete keys this batch leaves unused, or to add a schema `default` a field needs); any snippet those sections render only if a wrapper must become conditional (name it in the phase 1 report). Forbidden: `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, setting IDs, block types, section types, preset names.

**Review tier.** Ask (Liquid markup and locale key deletion).

**Estimate:** phase 1 about an hour; phase 2 about half a day. **Checkpoint:** after phase 1, report the classification table and stop; the user decides the B and C rows before phase 2. After phase 2, stop and report for review. **Bar:** must fix: any class B fallback left in a decided section; an empty wrapper or gap left when a field is blank; a placeholder state (no blocks, no resource) that no longer shows demo content; a changed setting ID, block type or preset. Accepted residue: class C rows the user keeps. Judged on the default templates with each text setting cleared in turn, and on a section with no blocks.

**Phase 1: classification.** For every runtime fallback in the 11 sections (the 51 locale defaults, plus any other replacement of a blank merchant text setting, such as `product.type`, `product.description`, `collection.title`), one row: file, line, setting, what replaces it, and a class:

- **A, keep:** shown only in the placeholder state (no blocks, no product or collection selected), or not visible text (for example an alt or ARIA fallback).
- **B, change:** a merchant text setting whose blank value is replaced while the section is configured.
- **C, user decides:** a blank value replaced by resource data the merchant chose (for example a product's type or description), where hiding it may remove content merchants expect.

**Checkpoint decisions** (user, 2026-10-29: a cleared field shows nothing, as Shopify expects).

1. Five C rows become B: `scroll-categories.liquid:48` (`heading` → `collection.title`), `mood-finder.liquid:245` (`tag_line` → `product.type`), `mood-finder.liquid:253` (`description` → `product.description`), `ritual-steps.liquid:112` and `:481` (`text` → `product.description`). Their fallbacks are removed; a cleared field renders nothing. The other two C rows become A, because no merchant text setting is replaced there: `scroll-categories.liquid:88` (each collection product card shows that product's description) and `routine-showcase.liquid:130` (each step card shows its product's description, or the placeholder copy when no product is chosen). They stay unchanged.
2. A link whose text setting is cleared (CTA, read-more, panel link, step link) is not rendered at all, so no empty link remains.
3. A tab or step control whose label is cleared shows no visible label, and the control keeps an accessible name that only assistive technology reads (a generic locale string such as "Step {{ index }}"), because Theme Store accessibility requires a named control. This is not visible fallback copy.
4. Sections with zero blocks (`ritual-steps`, `routine-showcase`) stay as they are: out of scope.
5. `blog-stories` `heading` and `description` already render nothing when blank: no change.
6. The rule is theme-wide (user, 2026-10-29): defaults live in the schema `default`; a cleared text setting renders nothing. A setting connected to a dynamic source is a filled setting and renders as such. Exception, class A: text that names a form control the form needs (submit button text, input placeholder) keeps its fallback, as decision 3 does for tab and step controls.
7. Phase 1b: the first inventory searched only locale-default fallbacks. A search for `(section|block).settings.<id> | default: <variable>` found more outside the 11 sections: `404.liquid` (`description`, `heading_line2`), `main-page-contact.liquid` (`heading`, `button_text`), `product-recommendations.liquid` (`heading`), `snippets/rte-compact-prose.liquid` (`description`), and the email `placeholder` in `newsletter-banner.liquid` and `password.liquid` (class A by decision 6). Phase 1b reads every section and snippet, adds every remaining replacement of a blank merchant text setting to the table with a class under decisions 1 to 6, then phase 2 applies them without a further stop.

**Phase 2: implementation** (after the user's decision). For each B row, and each C row the user moves to B: render the element only when the setting is not blank, so no empty wrapper or gap remains. Delete a locale key only when no file uses it any more (`lint:i18n` decides). Where a field had no schema `default` and the section relied on the runtime fallback for its first look, add the schema `default` from the same locale string.

**Acceptance checks.**

1. Phase 1: the table covers every hit of `grep -rn "\.defaults\.[a-z_]*' | t" sections snippets` outside `{% schema %}`, plus the resource fallbacks found by reading each section; each row has a class and a reason.
2. Phase 2: for every B row, the rendered HTML of the section with that setting blank contains no text from the old fallback and no empty element for it (verified on `shopify theme dev` with the setting cleared, or by reading the conditional and the Liquid render).
3. A section with no blocks still shows its placeholder state.
4. `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `test:theme-check`, `npx prettier --check` on every changed file pass; `test:layout` on the pages that hold these sections (home, product, `page-about-view`): 0 new issues.

**Execution record.**

- Phase 1 (read-only): 61-row table below (11 sections).
- Phase 1b: added 13 rows (decision 7 seeds plus full-theme scan). **Added counts:** A 3, B 10, C 0 (total 13; corrected by the coordinator from the table, 2026-10-29). Snippets touched: `listing-page-hero-copy.liquid`, `product-recommendations-section.liquid`, `product-info-blocks.liquid`.
- Phase 2: removed runtime text fallbacks for all B rows (including checkpoint C→B moves); decision 2 (omit blank link CTAs); decision 3 (`accessibility.step_control`, `accessibility.tab_control_item` for unnamed step/tab controls); schema `default` on `formula-details` and `editorial-collage`; deleted 26 keys reported unused by `lint-i18n-unused.js` from `locales/en.default.json`; no schema locale key deleted (counts corrected by the coordinator from a HEAD-to-worktree key comparison, 2026-10-29).
- Validators: `npm.cmd run lint:theme` pass; `npm.cmd run lint:i18n` pass (including unused-key pass after deletions); `npm.cmd run lint:liquid-syntax` pass; `npm.cmd run test:theme-check` pass; `npx prettier --check` pass on changed files after `--write` on `snippets/product-info-blocks.liquid`.
- `npm.cmd run test:layout` (no flags): **4 new issues on home** at widths 720, 1040, 1160–1200 (horizontal-scroll/page-margin/clipped-text mix per summary). User bar allows only the four known featured-products entries from RR1-D2a/D2b—verify these are the same before accepting.
- Unverified: browser pass with each text setting cleared; placeholder loops on no-block sections (read Liquid conditionals only).
- RR1-D2b files untouched.

### Phase 1 classification table

| File:line | Setting id | Replaces blank with | Condition | Class | Reason |
| --- | --- | --- | --- | --- | --- |
| main-page-about.liquid:18 | image_alt | `sections.main-page-about.defaults.image_alt` | `section.settings.image_alt` blank | A | Image alt fallback, not visible copy |
| main-page-about.liquid:19 | image_alt | same locale string via `\| default:` | same | A | Same alt chain at render |
| scroll-categories.liquid:6–7 | link_label | locale default via `\| default:` | `section.settings.link_label` blank | B | Section configured; link label still shows. Wrapper: link content span in panel link. Schema has `default` |
| scroll-categories.liquid:50 | heading | `sections.scroll-categories.defaults.heading` | heading blank and no collection selected | A | Placeholder catalog state (`for…else`) |
| scroll-categories.liquid:48 | heading | `selected_collection.title` | heading blank and collection selected | C | Resource title replaces cleared merchant heading |
| scroll-categories.liquid:88 | — | `product.description` (truncated) | collection has products | C | Not a theme text setting; product body copy |
| testimonial-featured.liquid:25 | heading | `sections.testimonial-featured.defaults.heading` | `section.settings.heading` blank | B | Always rendered in `<h2>`. Schema has `default` |
| testimonial-featured.liquid:157 | author_name (block) | `sections.testimonial-featured.defaults.author_name` | block author blank, blocks present | B | Wrapper: `.testimonial-featured__author`. Block schema has `default` |
| routine-showcase.liquid:27 | heading | `sections.routine-showcase.defaults.heading` | section heading blank | B | Wrapper: `.routine-showcase__heading` / mobile heading copy. Schema has `default` |
| routine-showcase.liquid:32 | cta_text | `sections.routine-showcase.defaults.cta_text` | cta_text blank | B | Wrapper: CTA link content. Schema has `default` |
| routine-showcase.liquid:107 | label (block) | `sections.routine-showcase.defaults.step_label` | block label blank, steps present | B | Wrapper: `.routine-showcase__mobile-badge` / side labels. Schema has `default` |
| routine-showcase.liquid:533 | label (block) | same | same (desktop tabs) | B | Same setting, second render site |
| routine-showcase.liquid:568 | label (block) | same | same (desktop tabs) | B | Same setting, third render site |
| routine-showcase.liquid:130 | — | `routine_product.description` or placeholder copy | step block, product pick | C | Product description when product set; placeholder string when no product |
| mood-finder.liquid:94 | eyebrow (block) | `defaults.mood_eyebrow` | mood block, eyebrow blank | B | Wrapper: `.mood-finder__tab-eyebrow`. Block schema has `default` |
| mood-finder.liquid:98 | phrase (block) | `defaults.mood_phrase` | mood block, phrase blank | B | Wrapper: `.mood-finder__tab-phrase`. Block schema has `default` |
| mood-finder.liquid:156 | — | mood_eyebrow default | no mood blocks | A | Placeholder tab loop |
| mood-finder.liquid:157 | — | mood_phrase default | no mood blocks | A | Placeholder tab loop |
| mood-finder.liquid:101 | — | tab phrase as image alt | mood image alt blank | A | Alt text only |
| mood-finder.liquid:245 | tag_line (block) | `mood_product.type` | product selected, tag_line blank | C | Resource type replaces cleared block field |
| mood-finder.liquid:248 | tag_line (block) | `defaults.tag_line` | still blank after type fallback | B | Wrapper: `.mood-finder__panel-tag` |
| mood-finder.liquid:253 | description (block) | `mood_product.description` (truncated) | product selected, description blank | C | Resource description |
| mood-finder.liquid:256 | description (block) | `placeholder_description` locale | still blank after product fallback | B | Wrapper: `.mood-finder__panel-description` |
| mood-finder.liquid:356 | — | `defaults.tag_line` | no mood blocks, panel placeholder | A | Placeholder panel loop |
| formula-details.liquid:27 | band_heading | `defaults.band_heading` | band_heading blank | B | Wrapper: band `<h2>`. No schema `default` |
| formula-details.liquid:33 | band_text | `defaults.band_text` (+ `<p>` wrap) | band_text blank | B | Wrapper: band `.rte`. No schema `default` |
| formula-details.liquid:39 | ingredients_heading | `defaults.ingredients_heading` | blank | B | Wrapper: ingredients header `<h2>`. No schema `default` |
| formula-details.liquid:45 | ingredients_subtitle | `defaults.ingredients_subtitle` | blank | B | Wrapper: ingredients header `<p>`. No schema `default` |
| formula-details.liquid:97 | name (attribute block) | `defaults.attribute_name` | attribute block, name blank | B | Wrapper: attribute `<h3>`. No block schema `default` on name |
| formula-details.liquid:101 | text (attribute block) | `defaults.attribute_text` | attribute block, text blank | B | Wrapper: attribute `<p>`. No block schema `default` on text |
| formula-details.liquid:125 | — | attribute_name default | no blocks, placeholder attributes | A | Placeholder loop |
| formula-details.liquid:126 | — | attribute_text default | no blocks | A | Placeholder loop |
| formula-details.liquid:193 | name (ingredient block) | `defaults.ingredient_name` | ingredient block, name blank | B | Wrapper: card `<h3>` |
| formula-details.liquid:197 | text (ingredient block) | `defaults.ingredient_text` | ingredient block, text blank | B | Wrapper: card `<p>` |
| formula-details.liquid:250 | — | ingredient_name default | no blocks | A | Placeholder loop |
| formula-details.liquid:251 | — | ingredient_text default | no blocks | A | Placeholder loop |
| ritual-steps.liquid:9 | heading | `defaults.heading` | section heading blank | B | Wrapper: section heading via `heading` snippet (multiple sites). Schema has `default` |
| ritual-steps.liquid:68 | label (block) | `defaults.step_label` | step block, label blank | B | Wrapper: `.ritual-steps__badge` / nav aria. Schema has `default` |
| ritual-steps.liquid:87 | link_label (block) | `defaults.link_label` | link_label blank | B | Wrapper: mobile/desktop CTA links. Schema has `default` |
| ritual-steps.liquid:112 | text (block) | `ritual_product.description` | scroll_carousel layout, product set, product has description | C | Overrides cleared block text with product body |
| ritual-steps.liquid:265 | label (block) | `defaults.step_label` | dots nav | B | Aria label only uses label text |
| ritual-steps.liquid:298 | label (block) | `defaults.step_label` | desktop sticky text column | B | Badge wrapper |
| ritual-steps.liquid:307 | link_label (block) | `defaults.link_label` | desktop sticky | B | CTA wrapper |
| ritual-steps.liquid:451 | label (block) | `defaults.step_label` | carousel layout | B | Badge wrapper |
| ritual-steps.liquid:470 | link_label (block) | `defaults.link_label` | carousel layout | B | CTA wrapper |
| ritual-steps.liquid:481 | text (block) | `ritual_product.description` | carousel layout, product with description | C | Same product-body policy as :112 |
| ritual-steps.liquid:624 | label (block) | `defaults.step_label` | carousel nav buttons | B | Nav aria |
| feature-tabs.liquid:53 | — (image alt) | `defaults.image_alt` | section image set, alt blank | A | Image alt only |
| feature-tabs.liquid:187 | heading (block) | `defaults.item_heading` | item block, heading blank | B | Wrapper: `.feature-tabs__heading`. Block schema has `default` |
| feature-tabs.liquid:191 | label (block) | `defaults.item_label` | label blank | B | Wrapper: `.feature-tabs__eyebrow` / tab label |
| feature-tabs.liquid:195 | text (block) | `defaults.item_text` | text blank | B | Wrapper: `.feature-tabs__body` |
| feature-tabs.liquid:235 | — | item_heading default | no item blocks | A | Placeholder panels |
| feature-tabs.liquid:236 | — | item_label default | no item blocks | A | Placeholder panels |
| feature-tabs.liquid:237 | — | item_text default | no item blocks | A | Placeholder panels |
| feature-tabs.liquid:289 | label (block) | `defaults.item_label` | tablist, label blank | B | Tab button label wrapper |
| feature-tabs.liquid:319 | — | item_label default | no blocks, tablist | A | Placeholder tabs |
| blog-stories.liquid:79 | link_text | `defaults.link_text` | blog selected, section link_text blank | B | Wrapper: read-more link span. Schema has `default` |
| blog-stories.liquid:150 | article_link_text (block) | `defaults.link_text` | manual blocks, block link text blank | B | Wrapper: read-more link. Block schema has `default` |
| editorial-collage.liquid:27 | heading | `defaults.heading` | heading blank | B | Wrapper: `<h2>`. No schema `default` |
| editorial-collage.liquid:33 | text | `defaults.text` (+ `<p>`) | text blank | B | Wrapper: `.rte` body column. No schema `default` |
| scatter-gallery.liquid:49 | heading | `defaults.heading` | heading blank | B | Wrapper: `.scatter-gallery__heading`. Schema has `default` |

### Phase 1b additions (decisions 1–6)

| File:line | Setting id | Replaces blank with | Condition | Class | Reason |
| --- | --- | --- | --- | --- | --- |
| 404.liquid:5–15 | description, heading_line1/2 | locale / `\| default:` | section text blank | B | Runtime fallbacks removed; schema holds defaults |
| 404.liquid:38–39 | button_text | `404.back_to_shopping` | show_button, text blank | B | Button omitted when label blank (decision 2) |
| main-page-contact.liquid:59 | heading | locale default | heading blank | B | Conditional `<h1>`; schema default kept |
| main-page-contact.liquid:69 | description | `contact.description_html` | description blank | B | Conditional `.rte` |
| main-page-contact.liquid:83 | success_message | locale default | posted, message blank | B | Status block conditional |
| main-page-contact.liquid:209 | button_text | locale default | submit | A | Form submit label (decision 6) |
| product-recommendations.liquid:7 | heading | type-based locale | heading blank | B | Pass-through only; snippet conditional |
| product-recommendations-section.liquid:23 | heading | locale related | heading blank | B | Heading render wrapped |
| listing-page-hero-copy.liquid:28,36 | header, description | locale keys | setting and object blank | B | Locale fallbacks removed; object/setting chain only |
| product-comparison-table.liquid:69 | row_title | em dash | metafield_text block blank | B | Empty `<th>` content when blank |
| product-info-blocks.liquid:430 | collapsible_tab_heading | hardcoded string | tab heading blank | B | Visible label conditional; sr-only `tab_control_item` |
| password.liquid:51 | placeholder | email locale | placeholder blank | A | Input placeholder (decision 7) |
| newsletter-banner.liquid:114 | placeholder | email locale | placeholder blank | A | RR1-D2b surface—unchanged (decision 7) |

**Phase 1b added counts:** 13 rows: A 3, B 10, C 0; some rows group several settings (counts corrected by the coordinator from the table, 2026-10-29; the row with class "section text blank" is B). **Reclassified from phase 1 (decision 1):** scroll-categories:48, mood-finder:245/:253, ritual-steps:112/:481 → B; scroll-categories:88, routine-showcase:130 → A (unchanged in phase 2).

**Coordinator correction (2026-10-29, user approved).** Diff check after the external run found two defects outside the report: (1) the new schema defaults `attribute_name` and `ingredient_name` in `locales/en.default.schema.json` contained `{{ index }}`, which schema translations do not interpolate, so a new block would show the literal text; now "Attribute" and "Ingredient". (2) `sections/404.liquid` lost its schema defaults for `button_link` (`/`) and `watermark_text` (with the `sections.404.defaults.watermark_text` schema key); neither had a runtime fallback, so the removal was outside the plan; both restored as at HEAD. The four home `test:layout` entries reported as new match the known featured-products entries at 2240 and 2400 (selectors and widths in `.tmp-layout-check/report.json`), not this batch. A 404 page whose two heading lines are both cleared has no `h1`; that follows the rule (merchant choice). Re-run after the correction: `lint:theme`, `lint:i18n` (with unused keys), `lint:liquid-syntax`, `test:theme-check` (158 files, no offenses), `npx prettier --check` on both files, `lint:records`: all pass.

**Correction after review 1 (2026-10-29, coordinator; review 1: RR1-D2b FAIL, RR1-D3 FAIL).**

1. `assets/tailwind.output.css` was stale (built while the RR1-D2a source change was stashed for a HEAD comparison), so the gallery cursor rule was missing. Rebuilt with `npm.cmd run build:tw`; the built CSS now has `&[data-lightbox-index]` (zoom-in) and `&[data-media-id]` (pointer) and no unconditional `cursor: zoom-in` on `.product-gallery__zoom-button`.
2. `snippets/listing-page-hero-copy.liquid`: phase 2 had reversed the precedence (setting before resource title and description), which made `/blogs/news` show "Blog" as both eyebrow and `h1`. Restored the HEAD order (object title, then setting header; object description, then setting description); only the locale fallback stays removed.
3. Empty wrappers: guarded the ingredients `<header>` and the band copy column in `formula-details.liquid`, the copy column in `editorial-collage.liquid`, the heading and description row in all three branches of `snippets/product-recommendations-section.liquid`, and the heading and description `<div>` in `main-page-contact.liquid`. A scan of every changed `.liquid` file for a wrapper whose only children are `!= blank` conditions added in this diff now reports none.
4. Execution record counts corrected above (phase 1b: 13 rows; locale: 26 storefront keys deleted, 2 added; 10 schema keys added, 0 deleted).

**Review 2 (correction review, 2026-10-29):** RR1-D2b PASS; RR1-D3 FAIL on two findings: an unconditional copy wrapper in `sections/404.liquid` (empty padded `div` plus the stack gap when every 404 text field is cleared) and the stale phase 1b count in the first execution line. Budget exhausted; the user chose option A (coordinator fixes both and the batch is accepted on validator evidence, no third review). Fixed: the 404 copy column renders only when a heading line, the description or a shown button with text is present (`not_found_copy_ready`), so a fully cleared 404 leaves only the watermark and no gap; the first execution line now states 13 rows, A 3, B 10, C 0.

## RR1-I1: image resource and fit check

Status: phases 1 and 2 implemented 2026-10-29; review 1 FAIL on two checker defects, fixed by the coordinator; correction review PASS (2026-10-30); the user accepted it in the browser (2026-10-30).

**User decisions (2026-10-29).**

1. `sections/scroll-categories.liquid:129` — **change** to `fit: 'contain'` (packshot shows whole); keep RR1-D2c edits.
2. `snippets/product-card.liquid` — **keep** cover; `product_card_image_ratio` (default adapt) owns crop (no change in phase 2).
3. `sections/feature-tabs.liquid:88` — correct `sizes` to drawn width (placeholder on dev store; box measured at 1024, 1280, 1440, 1920, 2560 on product template).
4. All other fit inventory rows **keep**.

From RR1-D2: product images looked blurred or cut. Evidence: `routine-showcase` desktop float image declares `sizes: '(min-width: 64rem) 11vw, 40vw'` but renders 26vw to 30vw (376px at 1440), so the browser picks the 240px source (the user's store: rendered 392×549, intrinsic 240×360). `scroll-categories` shows `product.featured_image` in a landscape frame (515×372 at 1440) with the default `frame` + `cover`, so packshots lose their top and bottom. `feature-tabs` declares 60vw from 64rem and renders 72vw at 1024 to 1279. `sizes` is hand-written at 78 `render 'image'` calls in 42 files; `docs/references/style-system/image-display-contract.md` already states the rule (`sizes` not smaller than the rendered width; `widths` up to about twice the largest rendered width), but nothing checks it.

**Outcome.**

1. `test:layout` gains a check that fails when an image's declared `sizes` resolves, at that viewport, to less than the width the image is drawn at, so the theme never asks for a source smaller than it shows. It covers every `<img>` the page renders through `snippets/image.liquid`, including below the fold.
2. Every `sizes` the check flags is corrected at its call site.
3. Every image call is classified by content (product packshot vs scene) and fit; the ones the user decides are corrected (known: `scroll-categories` packshots in `cover`).

**Dependencies.** None. RR1-D2b, RR1-D3 and RR1-D2c changes stay uncommitted in the worktree; `sections/scroll-categories.liquid` and `sections/testimonial-featured.liquid` hold RR1-D2c edits that must stay.

**Implementation surface.** Phase 1: `.agents/tools/layout-check/checks.mjs`, `.agents/tools/layout-check/layout-check.mjs`, `.agents/tools/layout-check/run-rules.mjs`, `.agents/tools/layout-check/layout-check.test.mjs`, new fixtures under `.agents/tools/layout-check/fixtures/`, and `docs/references/style-system/image-display-contract.md` (one line naming the check under Sizes and widths). Phase 2: the `sections/*.liquid` and `snippets/*.liquid` files with a flagged or decided image call. Forbidden: `layout-check.baseline.json` growth (needs the user's approval), `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, `snippets/image.liquid` behaviour, `package.json` scripts, `.github/workflows/`.

**Review tier.** Ask (validator wiring and Liquid).

**Estimate:** phase 1 about half a day; phase 2 half a day to a day. **Checkpoint:** after phase 1, report the check's design, its test results, the full list of flagged calls, and the fit inventory, then stop for the user's fit decisions. After phase 2, stop for review. **Bar:** must fix: a flagged image left uncorrected; a check that misses the `routine-showcase` case or fires on an image whose declared `sizes` covers its drawn width; a fixture-tested rule without a negative fixture; a changed image look the user did not decide. Accepted residue: none in `sizes`; fit rows the user keeps. Judged on the dev store content at the configured widths (320 to 2560, step 40).

**Check design (binding; stop and report if a part cannot work).**

- Name it `image-sizes` (or the closest name in the file's convention) and add it to `CHECK_NAMES`.
- Declared, not chosen: read the `sizes` attribute, drop a leading `auto,`, take the first entry whose media condition matches at the current viewport (`matchMedia`), and resolve its length (`vw`, `px`, `rem`, `em`, `calc()`, `min()`/`max()`) to CSS pixels in the page, for example by measuring a probe element given that width. This judges the value browsers without `sizes="auto"` use, and does not depend on which source was cached or loaded.
- Drawn width: for `object-fit: cover`, the larger of the box width and box height × the image's intrinsic ratio (from the `width`/`height` attributes); for `contain` or natural images, the box width limited by box height × ratio. Skip images narrower than 40px, hidden ones, and placeholder SVGs.
- Fail when the resolved `sizes` is below the drawn width by more than 2px. Report the selector with the declared and drawn widths in the issue detail if the reporter supports details.
- Fixtures: at least one positive (declared `sizes` too small, `cover`) and one negative (declared `sizes` covers the drawn width, plus a lazy `auto,` prefix), wired into `layout-check.test.mjs` like the existing checks.

**Phase 1 tasks.**

1. Implement the check and fixtures; `npm.cmd run test:layout-harness` passes.
2. Run `npm.cmd run test:layout` (all pages, all widths) with `shopify:dev` running. List every `image-sizes` issue grouped by call site (file:line of the `render 'image'`), with the widths it fails at and the drawn vs declared width.
3. Fit inventory: one row per `render 'image'` call in sections and snippets: file:line, what it shows (product image, collection image, merchant scene image, logo or decoration), frame or natural, fit, and a proposed class: **keep** (fit suits the content) or **change** (for example a product packshot in `cover`). Do not change fit in phase 1.
4. Do not add baseline entries; report the count instead.

**Phase 2 tasks** (after the user's decisions): correct each flagged `sizes` to the drawn width across the layout's breakpoints (token breakpoints 48rem, 64rem, 80rem; a fixed px cap where the box caps), keep `widths` up to about twice the largest drawn width, apply the user's fit decisions, then re-run `test:layout`: 0 `image-sizes` issues and no other new issue.

**Acceptance checks.**

1. `npm.cmd run test:layout-harness` passes, with the new positive and negative fixtures.
2. On the HEAD of this batch before phase 2, `test:layout` reports the `routine-showcase` float image (`sizes` 11vw) at desktop widths.
3. After phase 2, `test:layout` (all pages, all widths): 0 `image-sizes` issues; other checks: no new issue beyond the known home featured-products entries.
4. `scroll-categories` (and any other row the user moves to change) renders its packshot whole at 1440.
5. `npm.cmd run lint:theme`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run test:theme-check`, `npm.cmd run lint:doc-paths`, `npx prettier --check` on changed files: pass.

**Execution record.**

- Task 1: `image-sizes` check, positive/negative fixtures, wired in `layout-check.test.mjs`; `npm.cmd run test:layout-harness` — 29 tests, 0 fail.
- Task 2: `npm.cmd run test:layout` (all pages, widths 320–2560 step 40) with dev server on `http://127.0.0.1:9292`; **15** new `image-sizes` issues (all new baseline entries; none added). Full detail in `.tmp-layout-check/report.json` (`detailByWidth` per viewport).
- Task 3: fit inventory — **76** rows (one per `render 'image'` in `sections/` and `snippets/`, excluding `snippets/image.liquid` doc examples); regenerate with `node .tmp-layout-check/build-fit-inventory.mjs --md`. **Proposed change:** `sections/scroll-categories.liquid:129`, `snippets/product-card.liquid:280` (see table).
- Task 4: reported count **15**; baseline unchanged.

**Check design (as built).** Check name `image-sizes` in `CHECK_NAMES`. Declared width: read `sizes`, strip leading `auto,`, pick first matching `(media)` clause via `matchMedia`, resolve length with a hidden probe (`vw`, `px`, `rem`, `calc()`, etc.). Drawn width: `cover` → `max(boxW, boxH × intrinsicRatio)`; `contain` / `scale-down` → `min(boxW, boxH × intrinsicRatio)`; intrinsic ratio from `width`/`height` attributes else `naturalWidth`/`naturalHeight`. Skip width &lt; 40px, placeholder SVGs, and layout-hidden images (ancestor `display:none` / `visibility:hidden`, inert, closed dialog). **`aria-hidden` duplicate links are in scope** (uses `isImageDrawnForSizesCheck`, not `isElementVisible`). Fail when declared &lt; drawn − 2px; issue `detail`: `declared=Npx drawn=Mpx`. Runner stores `detailByWidth` in the report.

**Flagged `render 'image'` call sites** (grouped; sample at 1440px from `detailByWidth`):

| Call site | Page(s) | Failing widths | @1440 declared → drawn |
| --- | --- | --- | --- |
| `snippets/collection-card.liquid:118` (hover swap, cover) | home | slides 2–4: 320–2560; slide 1: 1200–1720 | 317px → 491–735px |
| `sections/routine-showcase.liquid:418` (scene, `(min-width: 64rem) 27vw, 70vw`) | home | 1040–1560 | 389px → 431px |
| `sections/routine-showcase.liquid:470` (desktop float, `(min-width: 64rem) 11vw, 40vw`) | home | 1040–2560 | **158px → 376px** |
| `sections/ritual-steps.liquid:582` (carousel packshot, `(min-width: 64rem) 38vw, 70vw`) | home | 1040–1680 | 547px → 648px |
| `sections/collections.liquid:90` (collection card image) | collections | 680–760, 1040–2360 (×4 cards) | 360px → 510px |
| `snippets/image-magnifier.liquid:69` (main gallery zoom source) | product | 1160–1720 | 720px → 748px |
| `sections/blog.liquid:144` (article card image) | blog | 480–760, 1040–1760 (×3 cards) | 475px → 501px |

Not flagged on this store sweep (examples): `sections/feature-tabs.liquid:88`, `sections/scroll-categories.liquid:129` (sizes may still be tight after fit fix in phase 2).

**Validators (phase 1).** `npm.cmd run test:layout-harness`: 29 pass, 0 fail. `npm.cmd run test:layout`: exit 1, **15** new issues (all `image-sizes`). `npm.cmd run lint:doc-paths`: pass. `npx prettier --check` on changed files: pass.

### Fit inventory (76 rows)

| File:line | Content | Mode | Fit | Proposal | Reason |
| --- | --- | --- | --- | --- | --- |
| sections/article.liquid:24 | merchant scene / lifestyle | frame | cover (img_class) | keep | Fit matches content type |
| sections/before-after-comparison.liquid:42 | merchant scene / lifestyle | frame | cover (mode default) | keep | Fit matches content type |
| sections/before-after-comparison.liquid:61 | merchant scene / lifestyle | frame | cover (mode default) | keep | Fit matches content type |
| sections/before-after-comparison.liquid:98 | merchant scene / lifestyle | frame | cover (mode default) | keep | Fit matches content type |
| sections/before-after-comparison.liquid:117 | merchant scene / lifestyle | frame | cover (mode default) | keep | Fit matches content type |
| sections/blog-stories.liquid:51 | article / editorial image | frame | cover (img_class) | keep | Fit matches content type |
| sections/blog-stories.liquid:117 | merchant / section image | frame | cover (img_class) | keep | Fit matches content type |
| sections/blog.liquid:144 | article / editorial image | frame | cover (img_class) | keep | Fit matches content type |
| sections/brand-statement.liquid:19 | decoration | frame | cover | keep | Fit matches content type |
| sections/brand-statement.liquid:31 | placeholder | frame | cover | keep | Placeholder SVG only |
| sections/cart.liquid:46 | merchant / section image | frame | contain (img_class) | keep | Fit matches content type |
| sections/cart.liquid:64 | merchant / section image | frame | contain | keep | Fit matches content type |
| sections/collection.liquid:142 | collection image | frame | cover | keep | Fit matches content type |
| sections/collections.liquid:90 | collection image | frame | cover (mode default) | keep | Fit matches content type |
| sections/editorial-collage.liquid:57 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/editorial-collage.liquid:84 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/editorial-collage.liquid:110 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/feature-tabs.liquid:88 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/featured-product.liquid:88 | placeholder | frame | contain | keep | Placeholder SVG only |
| sections/footer.liquid:6 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| sections/footer.liquid:123 | decoration | natural | contain | keep | Fit matches content type |
| sections/formula-details.liquid:120 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/formula-details.liquid:191 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/header.liquid:79 | logo | natural | contain | keep | Fit matches content type |
| sections/main-page-about.liquid:20 | merchant scene / lifestyle | frame | cover (img_class) | keep | Fit matches content type |
| sections/main-page-contact.liquid:36 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| sections/mood-finder.liquid:121 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/mood-finder.liquid:299 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/newsletter-banner.liquid:26 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| sections/newsletter-banner.liquid:37 | placeholder | frame | cover (mode default) | keep | Placeholder SVG only |
| sections/newsletter-overlay.liquid:63 | merchant / section image | frame | cover (img_class) | keep | Fit matches content type |
| sections/newsletter-overlay.liquid:174 | merchant / section image | frame | cover (img_class) | keep | Fit matches content type |
| sections/philosophy-section.liquid:54 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| sections/product-comparison-table.liquid:107 | placeholder | frame | contain | keep | Placeholder SVG only |
| sections/product-comparison-table.liquid:136 | merchant / section image | frame | contain (img_class) | keep | Fit matches content type |
| sections/product-comparison-table.liquid:146 | placeholder | frame | contain | keep | Placeholder SVG only |
| sections/promise-section.liquid:39 | merchant scene / lifestyle | frame | cover (mode default) | keep | Fit matches content type |
| sections/promo-bannder.liquid:72 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/promo-bannder.liquid:110 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/ritual-steps.liquid:122 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/ritual-steps.liquid:149 | product packshot | frame | contain | keep | Fit matches content type |
| sections/ritual-steps.liquid:404 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/ritual-steps.liquid:582 | product packshot | frame | contain | keep | Fit matches content type |
| sections/routine-showcase.liquid:79 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/routine-showcase.liquid:175 | product packshot | frame | contain | keep | Fit matches content type |
| sections/routine-showcase.liquid:418 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/routine-showcase.liquid:430 | merchant scene / lifestyle | frame | cover | keep | Fit matches content type |
| sections/routine-showcase.liquid:470 | product packshot | frame | contain | keep | Fit matches content type |
| sections/routine-showcase.liquid:607 | product packshot | frame | contain | keep | Fit matches content type |
| sections/scatter-gallery.liquid:72 | decoration | natural | contain | keep | Fit matches content type |
| sections/scatter-gallery.liquid:126 | decoration | frame | cover | keep | Fit matches content type |
| sections/scroll-categories.liquid:129 | product packshot (collection product column) | frame | cover (img_class) | **change** | Landscape frame crops packshot top/bottom with cover |
| sections/slides-show.liquid:127 | merchant scene / lifestyle | frame | cover (img_class) | keep | Fit matches content type |
| sections/testimonial-featured.liquid:191 | merchant / section image | frame | cover | keep | Fit matches content type |
| sections/video-banner.liquid:94 | video poster | frame | cover | keep | Fit matches content type |
| sections/video-banner.liquid:133 | video poster | frame | cover | keep | Fit matches content type |
| snippets/collection-card.liquid:81 | collection image | frame | contain | keep | Fit matches content type |
| snippets/collection-card.liquid:95 | collection image | frame | contain | keep | Fit matches content type |
| snippets/collection-card.liquid:118 | collection image | frame | cover | keep | Fit matches content type |
| snippets/decorative-illustration.liquid:26 | merchant / section image | natural | contain | keep | Fit matches content type |
| snippets/image-lightbox.liquid:59 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/image-lightbox.liquid:140 | merchant / section image | frame | contain (img_class) | keep | Fit matches content type |
| snippets/image-lightbox.liquid:153 | merchant / section image | frame | contain (img_class) | keep | Fit matches content type |
| snippets/image-magnifier.liquid:69 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/media-video.liquid:97 | video poster | frame | cover (img_class) | keep | Fit matches content type |
| snippets/product-card.liquid:280 | product packshot (card primary) | frame | cover (mode default) | **change** | Default cover crops packshots in square product cards |
| snippets/product-card.liquid:301 | product packshot | frame | contain | keep | Fit matches content type |
| snippets/product-gallery-carousel.liquid:128 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-gallery-grid.liquid:155 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-gallery-stacked.liquid:145 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-gallery-thumbnails.liquid:138 | merchant / section image | frame | contain | keep | Fit matches content type |
| snippets/product-gallery-thumbnails.liquid:289 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-media.liquid:73 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-media.liquid:93 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-media.liquid:118 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |
| snippets/product-media.liquid:141 | merchant / section image | frame | cover (mode default) | keep | Fit matches content type |

**Phase 2 execution record.**

- Task 1: updated `sizes` / `widths` at every flagged call site (see table below); feature-tabs box measured on product PDP (placeholder image): cover box drawn width 737 / 765 / 825 / 959 / 959 px at 1024 / 1280 / 1440 / 1920 / 2560.
- Task 2: scroll-categories `fit: 'contain'` + `object-contain`; feature-tabs sizes corrected; product-card unchanged per decision 2.
- Task 3: `npm.cmd run test:layout` — exit 0, **0** new issues, **0** `image-sizes`; home still shows baseline page-margin (2) and clipped-text (1) only.

**Sizes / widths changes (old → new).**

| Call site | sizes (before → after) | widths (before → after) | fit |
| --- | --- | --- | --- |
| `snippets/collection-card.liquid:118` | `(min-width: 48rem) 22vw, 44vw` → `(min-width: 80rem) 52vw, (min-width: 64rem) 52vw, (min-width: 48rem) 50vw, 100vw` | (default) → `400,600,800,1000,1200,1600,1800` | cover (unchanged) |
| `sections/routine-showcase.liquid:418` / `:430` | `(min-width: 64rem) 27vw, 70vw` → `(min-width: 64rem) 35vw, 70vw` | unchanged | cover |
| `sections/routine-showcase.liquid:470` | `(min-width: 64rem) 11vw, 40vw` → `(min-width: 64rem) 30vw, 40vw` | `240,360,480,640,800` → `400,600,800,1000,1200` | contain |
| `sections/ritual-steps.liquid:582` | `(min-width: 64rem) 38vw, 70vw` → `(min-width: 80rem) 50vw, (min-width: 64rem) 48vw, 70vw` | `360,480,640,768,960` → `400,600,800,1000,1200,1300` | contain |
| `sections/collections.liquid:90` | max-width ladder → `(min-width: 80rem) 600px, (min-width: 64rem) 56vw, (min-width: 48rem) 50vw, 100vw` | `300,450,600` → `400,600,800,1000,1200` | default cover |
| `snippets/image-magnifier.liquid:69` | when caller passes `(min-width: 48rem) 50vw, 100vw` → `(min-width: 80rem) 920px, (min-width: 64rem) 56vw, 100vw` | caller → `400,600,800,1000,1200,1840` | (pass-through) |
| `sections/blog.liquid:144` | max-width ladder → `(min-width: 80rem) 600px, (min-width: 64rem) 36vw, (min-width: 40rem) 800px, 105vw` | `400, 700` → `400,700,1000,1200,1600` | cover |
| `sections/feature-tabs.liquid:88` | `(min-width: 64rem) 60vw, 100vw` → `(min-width: 80rem) 960px, (min-width: 64rem) 72vw, 100vw` | `…,2000` → `…,1920` | cover |
| `sections/scroll-categories.liquid:129` | unchanged `(min-width: 64rem) 45vw, 100vw` | unchanged | **cover → contain** (`fit` + `object-contain`; removed `object-cover` from wrapper class) |

**Phase 2 validators.** `npm.cmd run test:layout-harness`: 29 pass, 0 fail. `npm.cmd run test:layout`: exit 0, newIssueCount **0**. `npm.cmd run lint:theme`, `lint:liquid-syntax`, `test:theme-check` (158 files, 0 offenses): pass. `npx prettier --check` on changed files: pass.

**Coordinator correction after phase 2 (2026-10-29).** Phase 2 had fixed the gallery by adding a literal-string rewrite inside `snippets/image-magnifier.liquid` (`if sizes == '(min-width: 48rem) 50vw, 100vw'` → a new `sizes` and `widths`). That couples a shared snippet to one caller's string, leaves the non-magnifier branch (`render 'image'` in the same gallery) on the old value, and also forced the thumbnails value onto `product-gallery-stacked.liquid`, whose layout differs. Reverted the snippet to HEAD; set `sizes: '(min-width: 80rem) 920px, (min-width: 64rem) 56vw, 100vw'` and `widths: '400,600,800,1000,1200,1600,1840'` on the three main-media calls in `snippets/product-gallery-thumbnails.liquid` (magnifier, plain image, product media). `product-gallery-stacked.liquid` keeps its value (not used on the dev store, so the check cannot judge it). Re-run: `lint:theme`, `lint:liquid-syntax`, `test:theme-check` (158 files, no offenses), `npx prettier --check` on both files, `test:layout --page product`: 0 new. `scroll-categories` contain: the dev store shows the placeholder (no collection selected), so acceptance check 4 waits for the user's store with a collection.

**Review 1 (2026-10-29): RR1-D2c PASS; RR1-I1 FAIL** on two checker defects, both fixed by the coordinator the same day:

1. `parseSizesEntries` split at every comma, so `min(500px, 100vw)` and `max(500px, 20vw)` resolved to 0px and failed. Now a top-level splitter (`splitTopLevel`) keeps parenthesised arguments whole; each entry's last top-level component is the size and the rest is the media condition, passed to `matchMedia` as written. New negative fixture `fixtures/image-sizes-functions-negative.html` (both functions, a 200px drawn image).
2. `isImageDrawnForSizesCheck` skipped every `[inert]` descendant, so a drawn inert copy (marquee duplicates) was never checked. The inert skip is removed; layout-hidden images are still skipped. New positive fixture `fixtures/image-sizes-inert-positive.html`.

Re-run: `npm.cmd run test:layout-harness` 29 pass, 0 fail; `npm.cmd run test:layout` (all pages, all widths) 0 new issues, 0 `image-sizes`; `npx prettier --check` on the checker, test and fixtures: pass.
