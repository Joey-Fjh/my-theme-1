# Shopify Theme Store Pre-Launch Audit Context

This document is the complete cross-session record for the current Shopify Theme Store pre-launch optimization. It intentionally replaces all older typography, motion, cleanup, and refactor context. Do not restore or pursue unrelated historical work unless the user explicitly asks.

`AGENTS.md` remains the repository rule source. This document records audit evidence, launch risks, required work, and acceptance criteria; it does not override repository rules.

## 1. Objective, Scope, And Current Decision

- Objective: make this theme reliably ready for Shopify Theme Store submission, not merely clean under Theme Check.
- Audit date: 2026-07-10.
- Audited branch: `feat/ai-test`.
- Audited commit at the time of review: `20ec6c0 fix: lint format fixed`.
- Audit mode: review-only. No theme implementation, merchant content, or merchant configuration was changed during the audit.
- Current decision: `REQUEST CHANGES`.
- Submission recommendation: do not submit until every blocker and every external/manual launch gate below has recorded evidence.
- Scope boundary: future work should address the numbered findings in this document only. Do not start broad exploratory refactors, visual redesign, or unrelated architecture cleanup.
- Merchant-owned boundary: `config/settings_data.json` and `templates/*.json` must not be changed without explicit user authorization, even when a Theme Store blocker is located there.
- Windows command rule: use `npm.cmd`, not plain `npm run`.

### 1.1 Current Batch Working Policy (2026-07-17)

This policy governs the next BLK implementation batch and overrides the older package execution order in this document. It does not change the original audit findings or Shopify requirements.

- Human storefront review is a hard pre-commit gate. Static validation, Theme Check, or an agent review cannot replace the user's visual and functional approval.
- BLKs are grouped by rollback domain rather than committed mechanically one ID at a time. One approved package should be reversible without removing unrelated functionality.
- The implementation scope is limited to the numbered findings in this document and the Shopify requirements cited by the audit. Do not add optional improvements, broad refactors, visual redesigns, or unrelated cleanup.
- Preserve existing layout, styling, content composition, and interaction behavior unless the named finding requires a change or the user separately authorizes a design change.
- If implementation reveals an issue outside the active package, report and classify it. Do not fix it automatically unless it directly blocks the package and is already covered by the documented requirement.
- Agents implement packages without committing by default. After static validation, provide a focused manual test matrix and wait for the user's explicit approval.
- Do not begin the next package until the active package is approved and committed, reverted, or otherwise closed by the user. Start each package from a clean worktree unless the user explicitly authorizes an exception.
- Any package touching `config/settings_data.json`, `templates/*.json`, color schemes, merchant content, navigation, or uploaded media still requires explicit authorization for those exact fields.
- Do not declare a BLK resolved, a package complete, or the theme ready to submit from static evidence alone. Record implementation as `implementation in review` until the required manual evidence passes.

Required package lifecycle:

1. Confirm the documented Shopify requirement and repository evidence.
2. Define the combined package boundary, allowed files, prohibited files, regression risks, and manual test matrix before implementation.
3. Implement only that package and leave the changes uncommitted.
4. Run the smallest relevant checks plus `npm.cmd run lint` and `npm.cmd test` for meaningful theme changes. Build generated assets only when their source changed.
5. Report the actual diff, validation results, protected-file status, and remaining runtime checks.
6. The user previews and tests the affected storefront and Theme Editor surfaces.
7. Commit the package only after the user explicitly approves it. If approval is withheld, revise or revert the package before continuing.

## 2. Official Review Model And Hard Thresholds

Shopify reviews a new theme in five stages:

1. Mandatory features and Online Store 2.0 compatibility.
2. Lighthouse performance and accessibility.
3. Technical requirements, page behavior, browser support, assets, SEO, accessibility, and social metadata.
4. Design, UX, theme settings, fonts, colors, and responsive images.
5. Exclusivity, theme/preset naming, demo stores, documentation, support, and pre-launch operations.

Current hard benchmark thresholds:

- Average Lighthouse performance score must be at least 60 across home, product, and collection pages, separately covering desktop and mobile tests.
- Average Lighthouse accessibility score must be at least 90 across the same pages and device classes.
- Tests must use populated sections with real images and content; empty sections do not prove compliance.
- A clean Theme Check result does not replace benchmark, browser, keyboard, demo-store, or reviewer testing.
- Repeated resubmission without addressing rejection reasons can lead to temporary suspension from theme submission.

Primary official references are listed in section 14.

## 3. Freshly Verified Repository Baseline

### 3.1 Commands And Results

- `npm.cmd run lint`: passed.
  - i18n lint passed.
  - theme architecture lint passed.
  - Prettier format check passed.
- `npm.cmd test`: passed.
  - Shopify Theme Check inspected 130 files.
  - 0 offenses found.
- Worktree was clean before this audit document was introduced.

These results prove the repository’s configured static gates only. They do not prove runtime, merchant-editor, accessibility, performance, browser, demo-store, licensing, or Theme Store design acceptance.

### 3.2 Confirmed Structural Coverage

The following foundations were found and should be preserved:

- Required core files/templates are present:
  - `layout/theme.liquid`
  - `templates/404.json`
  - `templates/article.json`
  - `templates/blog.json`
  - `templates/cart.json`
  - `templates/collection.json`
  - `templates/index.json`
  - `templates/list-collections.json`
  - `templates/page.json`
  - `templates/page.contact.json`
  - `templates/password.json`
  - `templates/product.json`
  - `templates/search.json`
  - `templates/gift_card.liquid`
  - `config/settings_data.json`
  - `config/settings_schema.json`
- Header and footer are rendered through section groups:
  - `layout/theme.liquid:83` renders `header-group`.
  - `layout/theme.liquid:89` renders `footer-group`.
- Custom Liquid section exists and contains a setting of type `liquid`:
  - `sections/custom-liquid.liquid:59`.
- Main product supports `@app` and a Custom Liquid block:
  - `sections/product.liquid:299`.
  - `sections/product.liquid:499-505`.
- Featured product supports `@app` and a Custom Liquid block:
  - `sections/featured-product.liquid:161`.
  - `sections/featured-product.liquid:300-306`.
- Product information is divided into configurable blocks for title, vendor, price, description, variant picker, quantity, buy buttons, share, callout, inventory notice, and related content.

### 3.3 Confirmed Feature Coverage

The audit found existing implementations for:

- Dynamic/accelerated product checkout through `form | payment_button`:
  - `snippets/buy-buttons.liquid:178`.
- Accelerated cart checkout:
  - `sections/cart.liquid:270-272`.
- Line-level and cart-level discount display:
  - `sections/cart.liquid:60-80`.
  - `sections/cart.liquid:217-239`.
- Selling-plan name display in cart:
  - `sections/cart.liquid:53-56`.
- Pickup availability on product pages:
  - `snippets/buy-buttons.liquid:185`.
  - `snippets/pickup-availability-inline.liquid`.
  - `sections/pickup-availability.liquid`.
- Related and complementary recommendation modes:
  - `sections/product-recommendations.liquid`.
- Product swatches using `swatch.image` and `swatch.color`:
  - `snippets/product-variant-picker.liquid:118-122`.
  - `snippets/product-card-variant-panel.liquid:52-56`.
- Product rich media/gallery infrastructure, including image, video, external video, and model viewer handling.
- Predictive search and search result object-type separation.
- Country and language localization selectors:
  - `snippets/country-localization.liquid`.
  - `snippets/language-localization.liquid`.
  - `snippets/localization-switcher.liquid`.
- Follow on Shop through `login_button`:
  - `sections/footer.liquid:89-95`.
- Gift card code, QR identifier, Apple Wallet link, logo/shop name:
  - `templates/gift_card.liquid`.
- Required SEO/social foundations:
  - canonical URL, page title, meta description.
  - product structured data through `product | structured_data`.
  - Open Graph tags.
  - Twitter Card tags.
  - Evidence: `snippets/meta-tags.liquid`.
- `request.locale.iso_code` on storefront HTML:
  - `layout/theme.liquid:11`.
- No `robots.txt.liquid`, Sass, `.scss`, or `config/markets.json` was found.
- Third-party minified assets are limited to vendor files, which is allowed if licenses and redistribution rights are documented.

## 4. Confirmed Submission Blockers

Every item in this section must be resolved or explicitly disproven with stronger evidence before submission.

### BLK-01 — Unit Pricing Is Missing

Official expectation:

- Unit pricing must be supported on collection, product, cart, and customer/order surfaces where applicable.
- Implementations must output `unit_price` and `unit_price_measurement`.

Repository evidence:

- No `unit_price` or `unit_price_measurement` usage was found in storefront Liquid.
- Product cards output only `product.price | money`:
  - `snippets/product-card.liquid:325`.
  - `snippets/product-card.liquid:343`.
  - `snippets/product-card.liquid:360`.
- Product price blocks and cart also lack unit-price markup.

Risk:

- Direct rejection for missing a mandatory commerce feature.
- Incorrect price presentation for merchants operating in jurisdictions that require unit pricing.

Acceptance criteria:

- Product page, featured product, quick view where it acts as a purchase form, product cards, collection/search grids, cart page, and applicable customer/order surfaces display correct unit prices.
- Measurement reference values render correctly.
- Empty/non-unit-priced products do not show broken separators or placeholders.
- Variant change updates unit price without stale content.
- Runtime tests use products with and without unit pricing.

Ownership:

- Theme code.
- Customer/account behavior must be classified against the store’s account model before implementation.

### BLK-02 — Variable Product Prices Are Not Represented

Official expectation:

- When variants have different prices, collection/product listings must communicate the variation using `product.price_varies`, normally with “From” or a price range.

Repository evidence:

- `snippets/product-card.liquid` renders a single `product.price`.
- No `product.price_varies` match was found.

Risk:

- Misleading price presentation.
- Technical/page requirement rejection.

Acceptance criteria:

- Product cards correctly show “From” or a range according to the approved UX.
- Sale state and compare-at pricing remain correct for mixed-price variants.
- All new copy uses locale keys.

Ownership:

- Theme code and locale files.

### BLK-03 — Shop Pay Installments/Payment Terms Are Missing

Official expectation:

- Product pages must support Shop Pay Installments through Shopify payment terms output.

Repository evidence:

- No `payment_terms` or `shopify-payment-terms` usage was found in product-related Liquid.
- Product price is rendered in `snippets/product-info-blocks.liquid:112-136`.

Risk:

- Missing mandatory product buying information.

Acceptance criteria:

- Payment terms render using Shopify’s supported Liquid output in the relevant product form.
- Variant selection updates the associated form/variant context correctly.
- No branded Shop Pay styling is overridden.

Ownership:

- Theme code.

### BLK-04 — Gift Card Recipient Form Is Missing

Official expectation:

- Gift card products must allow sending the card to a recipient.
- Required form values include `form.email`, `form.name`, `form.message`, and `send_on`.

Repository evidence:

- No recipient or `send_on` implementation was found in product forms.
- Existing gift card issuance page is present, but that does not replace the gift-card product recipient purchase form.

Risk:

- Missing mandatory gift card product capability.

Acceptance criteria:

- Recipient fields appear only when appropriate for gift card products.
- Validation errors, optional fields, date behavior, and accessibility labels work.
- Recipient data submits with the Shopify product form.
- Regular products remain unchanged.

Ownership:

- Theme code and locales.

### BLK-05 — Tax-Inclusive Notices Do Not Use `cart.taxes_included`

Official expectation:

- Product and cart pages must use `cart.taxes_included` to show the correct tax-inclusive message.

Repository evidence:

- No `cart.taxes_included` usage was found.
- Cart currently always renders a generic `cart.taxes_note`:
  - `sections/cart.liquid:253-255`.

Risk:

- Incorrect legal/price context for tax-inclusive stores.
- Page requirement rejection.

Acceptance criteria:

- Tax-inclusive and non-tax-inclusive stores get the correct localized message.
- Product and cart surfaces remain consistent.
- Shipping/checkout disclaimer behavior is not falsely stated.

Ownership:

- Theme code and locales.

### BLK-06 — Cart Page Is Missing Required Line-Item And Empty-State Behavior

Status: **owner-reviewed and resolved in Package C** (2026-07-21). The separate `CART-SHIPPING-01` follow-up below covers the pre-existing non-functional shipping estimator and does not reopen the BLK-06 line-item acceptance.

Official expectation:

- Cart must display line-item title, unit price, image, final price, quantity, and option values.
- Cart total must be visible.
- Quantity updates must refresh all affected totals.
- Cart must show an empty-cart message.
- Checkout and accelerated checkout must work.
- Cart notes, selling plans, discounts, and automatic discounts must be supported.

Repository evidence:

- Existing positives:
  - cart item loop: `sections/cart.liquid:21`.
  - image, title, quantity control, final line price, discounts, total, note, checkout, and accelerated checkout exist.
- Missing/uncertain:
  - no `item.unit_price`.
  - no `item.options_with_values`.
  - per-item output uses `final_line_price`, but no explicit per-unit `final_price`.
  - no empty-cart conditional/branch even though `locales/en.default.json` contains `cart.empty`.

Risk:

- Incomplete cart information.
- Empty cart can render an inappropriate order-summary shell.
- Mandatory page requirement rejection.

Acceptance criteria:

- Required line-item values render for products with variants, properties, discounts, selling plans, and unit pricing.
- Empty cart shows an intentional localized message and recovery action.
- Quantity/remove updates refresh every line and total.
- Cart works with JavaScript disabled through normal form actions or a documented functional fallback.
- Cart page and cart drawer remain behaviorally consistent.

Ownership:

- Theme code and locales.

### BLK-07 — Faceted Filtering Is Missing From Search

Status: **owner-reviewed and resolved in Package D** (2026-07-23). The implementation and this acceptance record are intended to land together in the same owner commit. The separate `PRODUCT-CARD-RATIO-01` follow-up below covers pre-existing Product card layout consistency outside Search and does not reopen BLK-07.

Official expectation:

- Faceted filtering must work on both collection and search pages.

Repository evidence:

- Reusable filtering snippets support a generic collection/search host:
  - `snippets/filters-drawer.liquid`.
  - `snippets/filter-horizontal.liquid`.
  - `snippets/filter-vertical.liquid`.
- Collection wires them in:
  - `sections/collection.liquid:63-73`.
  - `sections/collection.liquid:370-376`.
- Search does not render `search.filters` or the shared filter UI:
  - `sections/search.liquid`.
- Search defaults to product type and separates products/articles/pages through tabs.

Risk:

- Missing mandatory search functionality.
- Potential URL/history complexity when combining result-type tabs, filtering, pagination, and browser back.

Acceptance criteria:

- Product search results expose Shopify facets.
- Filters, sorting if provided, pagination, result-type tabs, browser back/forward, clear-all, empty state, and mobile drawer work together.
- Article/page tabs do not show invalid product facets.
- Section refresh uses the project SectionRefresher architecture, not manual HTML replacement.
- Keyboard and focus behavior is verified.

Ownership:

- Theme code, Alpine filter/pagination components, locales.

### BLK-08 — Blog Listing Omits Required Excerpt/Content

Status: **resolved by owner-accepted Package E** (2026-07-23).

Official expectation:

- Blog article cards must output `article.title`, `article.image`, and `article.excerpt_or_content`, with pagination or lazy loading.

Repository evidence:

- Blog listing outputs image, title, tag, and link.
- No `article.excerpt_or_content` usage was found:
  - `sections/blog.liquid:140-190` approximate listing area.

Risk:

- Blog page requirement rejection.
- Weak content preview and SEO/user experience.

Acceptance criteria:

- Article cards render safe, intentionally truncated excerpt-or-content.
- Empty images and long content do not break cards.
- Content is escaped/stripped/truncated appropriately without invalid markup.
- Existing pagination remains functional.

Ownership:

- Theme code.

### BLK-09 — Article Comments Workflow Is Missing

Status: **resolved by owner-accepted Package E** (2026-07-23).

Official expectation:

- Article pages must display comments, paginate comments, and support the comment form with correct success and error output.

Repository evidence:

- Article page outputs published date and `article.content`:
  - `sections/article.liquid:106`.
  - `sections/article.liquid:112`.
- No `article.comments`, comment pagination, or new-comment form was found.

Risk:

- Article page requirement rejection when comments are enabled.

Acceptance criteria:

- Comments render only when the blog supports them.
- Comments are paginated.
- Comment form works with and without moderation.
- Posted-successfully, moderation, and validation-error states are displayed and announced accessibly.
- All form copy is localized.

Ownership:

- Theme code and locales.

### BLK-10 — Collection List Uses The Wrong Image Object

Status: **resolved by owner-accepted Package F** (2026-07-24).

Official expectation:

- Collection list must use `collection.featured_image`, which can fall back to the first product’s featured image.

Repository evidence:

- `sections/collections.liquid:92-99` uses `collection.image`.

Risk:

- Collections without an explicitly uploaded collection image show placeholders instead of Shopify’s required fallback.

Acceptance criteria:

- Cards use `collection.featured_image`.
- Collections with no image and no product image show a compliant placeholder.
- Alt text and varying image ratios remain correct.

Ownership:

- Theme code.

### BLK-11 — Image Focal Points Are Not Systematically Supported

Status: **resolved by owner-accepted Package F** (2026-07-24).

Official expectation:

- Images selected through Shopify must respect focal points.

Repository evidence:

- Shared image snippet supports a manual `position` parameter:
  - `snippets/image.liquid:20`.
  - `snippets/image.liquid:221-223`.
- No systematic use of `image.presentation.focal_point` was found.
- Most callers rely on center or section-specific position settings.

Risk:

- Merchant-selected focal points can be ignored and important subject matter can be cropped.
- Design/UX requirement rejection.

Acceptance criteria:

- Shared image behavior derives a safe focal-point position where appropriate.
- Explicit merchant section position settings have a clearly defined precedence.
- Natural/contain modes are not incorrectly forced to crop.
- Representative image-picker sections are visually tested.

Ownership:

- Theme code and image display contract.

### BLK-12 — Custom Font URL Feature Is Not Theme Store Eligible

Status: **resolved by owner-accepted Package G** (2026-07-24).

Official expectation:

- Theme fonts must use Shopify `font_picker`.
- Defaults must use currently available Shopify fonts.
- Bold, italic, and bold-italic variants should be generated through `font_modify`.
- Current requirements explicitly state that custom fonts are not accepted.

Repository evidence:

- Custom heading font enable/name/URL settings:
  - `config/settings_schema.json:53-67`.
- Custom body font enable/name/URL settings:
  - `config/settings_schema.json:81-95`.
- Custom font consumption:
  - `snippets/css-variables.liquid:106-128`.
- Existing Shopify font picker and `font_modify` infrastructure also exists and can be preserved.

Risk:

- Direct Stage 4 rejection.
- Placeholder CDN URLs are invalid for real installation.
- Conflict with the prior internal typography plan; Theme Store policy now takes precedence for the submission version.

Acceptance criteria:

- Theme Store build exposes only compliant `font_picker` choices.
- Existing heading/subtitle/body tier architecture remains intact.
- Bold/italic variants remain correctly generated.
- No custom font URL setting, placeholder URL, or dead custom-font branch remains.
- Tailwind CSS is rebuilt if source changes, followed by lint and Theme Check.

Ownership:

- Theme code, schema, locales, CSS-variable contract.
- Do not revive the removed typography-refactor context; address only the Theme Store eligibility issue.

### BLK-13 — Theme Identity And Support Metadata Are Placeholder/Misleading

Status: **code-owned metadata and preset naming resolved by owner-accepted Packages H and I** (2026-07-30). Package H set the `theme_info` metadata to the owner-approved `Ceylune` name, ESEN identity, version, documentation destination, and support destination. Package I committed the matching `Ceylune` parent-theme preset name in `1c01a3c`. Release notes, public merchant documentation, the public support form, and support operations remain external launch work.

Official expectation:

- Theme name and presets must be unique, distinct, 1–2 words, and under 30 characters.
- Theme metadata must identify the real theme, author, version, documentation, and support destination.
- One preset must use the parent theme name.

Repository evidence:

- At the audit baseline, `config/settings_schema.json:4-8` declared:
  - theme name: `Skeleton`.
  - version: `0.1.0`.
  - author: `Shopify`.
  - Shopify Help as documentation.
  - Shopify Support as support URL.
- Package H replaces those values with `Ceylune`, `1.0.0`, `ESEN`, and the owner-supplied ESEN documentation and support destinations.

Risk:

- Misrepresentation of authorship.
- Name collision/confusion with Shopify’s Skeleton base.
- Missing own documentation and support operation.
- Direct pre-launch rejection.

Acceptance criteria:

- Final theme and preset names are selected and checked against the Theme Store.
- Real author/Partner identity and semantic version are recorded.
- Documentation URL points to public merchant documentation.
- Theme metadata points to a project-owned destination where merchants can find support, not Shopify Support. The separate requirement for a public contact form and its Theme Store listing/documentation links remains tracked under BLK-17; `theme_support_url` itself does not have to be the form's direct URL.
- Release notes are prepared for the submitted version.

Ownership:

- Requires user/business decisions plus theme schema update.

### BLK-14 — Header/Footer Menu Settings Lack Required Defaults

Status: **resolved by owner-accepted Package G** (2026-07-24).

Official expectation:

- Header `link_list` settings must default to `main-menu`.
- Footer `link_list` settings must default to `footer`.

Repository evidence:

- Header menu setting has no schema default:
  - `sections/header.liquid:612-614`.
- Footer link-column menu setting has no schema default:
  - `sections/footer.liquid:287-290`.

Risk:

- Theme editor/install-state requirement rejection.

Acceptance criteria:

- Required defaults are present in section schema.
- Existing merchant selections are not overwritten.
- Fresh install behavior is verified.

Ownership:

- Theme code.
- Do not change current merchant-selected menu handles without authorization.

### BLK-15 — Merchant-Facing Schema Terminology And Spelling Need Full Review

Status: **owner-reviewed and resolved** (2026-07-30). The code-owned schema/locale portion was committed in Package G2 as `213f81d`; the explicitly authorized Package I merchant-owned template/default-content copy tranche passed static validation and owner storefront review. Final clean-install presentation remains part of the compact submission ZIP/demo-store check and does not reopen this terminology/copy package unless it exposes a regression.

Official expectation:

- Labels and info text must use clear American English, sentence case, active voice, approved Shopify terminology, and correct grammar.
- Avoid ampersands.
- Actions should start with verbs.
- Use “Button label” rather than “CTA label”.
- Use “Slideshow” rather than “Slider” for section terminology.
- Default values must explain use and must not contain Lorem Ipsum/demo filler.

Repository evidence examples:

- `locales/en.default.schema.json:1000`: `Text & Style`.
- `locales/en.default.schema.json:1528-1530`: `Show CTA Button`, `CTA Text`, `CTA Link`.
- `locales/en.default.schema.json:1733`: `Year & Copyright`.
- `locales/en.default.schema.json:952`: `NewSletter Banner`.
- Custom font help points to `your-theme-docs.com`.
- Multiple names use Title Case instead of sentence case.

Risk:

- Common Theme Store rejection category.
- Merchant editor feels inconsistent and unfinished.

Acceptance criteria:

- Complete schema-facing English terminology audit.
- No prohibited placeholders, broken URLs, misspellings, ampersands, or unapproved terminology.
- i18n lint passes.
- Theme editor is manually reviewed for grouping, clarity, and discoverability.

Ownership:

- Locale/schema content.
- Some defaults also exist in merchant-owned JSON templates and require explicit authorization.

### BLK-16 — Default Install State Contains Prohibited And Non-Transferable Content

Status: **owner-reviewed and resolved at the Package I code-package level; committed in `1c01a3c`** (2026-07-30). The cosmetics-oriented copy, `Ceylune` preset rename, resource-handle dispositions, removal of store-specific uploaded-image dependencies, and context-aware placeholder coverage passed static validation and owner review on the directly inspectable storefront surfaces. Product, Collection, and Blog empty-resource presentation remains part of the compact submission ZIP/demo-store check and is not treated as missing Package I implementation.

Official expectation:

- Defaults and demo stores must not use Lorem Ipsum.
- Demo stores must use authentic, coherent content.
- Installed preset must match the demo’s layout and color/typography expectations.
- Demo imagery does not transfer during installation; compliant placeholders/install-state behavior are required.

Repository evidence:

- At least 45 `Lorem Ipsum` occurrences were found across templates and schema defaults.
- At least 51 `shopify://shop_images/...` references exist in `templates/*.json`.
- Examples:
  - `templates/blog.json:38-63`.
  - `templates/article.json:36-61`.
  - `templates/index.json:374`, `392`, `412-423`, `496-521`.
  - `templates/404.json:31-50`.
  - `templates/page.contact.json:33-52`.
- Repetitive/default copy includes:
  - “Personalized with AI insight”.
  - “Up To 50% Off Everything”.
  - “PRODUCT GUARANTEE NATURAL”.
  - Mixed cosmetics, fashion, AI, and generic promotional messaging.
- Template section names include `NewSletter Banner`.
- The shared image primitive accepts `placeholder_key` but defaults every omitted value to the single generic `image` placeholder:
  - `snippets/image.liquid:206`.
- Current callers that pass `placeholder_key` also pass only `image`; product, collection, and editorial empty states do not yet use Shopify's context-specific placeholder families.

Risk:

- Direct install-state/demo-store rejection.
- Fresh benchmark shop can show missing images and incoherent pages.
- Theme identity appears generic or unfinished.

Acceptance criteria:

- User explicitly authorizes edits to `templates/*.json` before implementation.
- All Lorem Ipsum and filler copy are replaced with authentic, industry-specific, support-safe defaults.
- Uploaded-image references are replaced with compliant placeholder behavior or the approved preset submission structure.
- Empty product, collection, editorial, hero, and generic image-picker states use appropriate Shopify-provided placeholders instead of repeating one generic illustration.
- Placeholder variation is deterministic by stable resource ID or rendered index, never random between page loads; real merchant images always take precedence.
- Product contexts use `product-1` through `product-6`, collection contexts use `collection-1` through `collection-6`, editorial contexts use `lifestyle-1` / `lifestyle-2`, and generic image-picker or hero surfaces retain `image` unless an approved industry preset justifies a different official family.
- Placeholder output preserves the shared image aspect-ratio, fit, crop, responsive layout, and accessibility contracts.
- Fresh-install screenshots match demo expectations without relying on store-specific uploads.
- 404, blog, article, contact, collection, product, password, search, and home templates are reviewed.
- Demo content rights are documented.

Ownership:

- Merchant-owned templates and business/design decisions.
- Requires explicit user authorization.

### BLK-17 — Public Documentation, Contact Form, And Support Operation Are Not Ready

Official expectation:

- Public merchant documentation and a public support contact form must exist before launch.
- Documentation must match theme settings and include useful FAQ/support guidance.
- Theme partners must answer support requests within two business days.
- Listing must link to documentation and the contact form.

Repository evidence:

- Theme metadata points to Shopify’s documentation/support rather than project-owned resources.
- Repository `README.md` is developer-facing and cannot substitute for merchant documentation.
- No evidence of the required public support operation was available in the repository.

Risk:

- Stage 5 rejection.
- Post-launch support and review risk.

Acceptance criteria:

- Public docs cover installation, editor settings, products, media, filters/search, cart, localization, accessibility-relevant controls, troubleshooting, app compatibility boundaries, theme updates, and FAQ.
- Public support form includes appropriate contact fields and an auto-response.
- Support SLA and ownership are documented.
- Listing links are verified publicly.

Ownership:

- External business/operations work plus theme metadata.

### BLK-18 — Submission Cannot Be Declared Ready Without Runtime And External Evidence

Status: **owner storefront smoke testing complete; exhaustive internal QA matrix retired** (2026-07-30). Remaining work is a lightweight submission check, external launch materials, and Shopify's official review feedback loop.

Official expectation:

- Shopify expects the theme to be fully tested before submission.
- Poorly tested themes can be rejected without full review.

Repository evidence:

- The owner has manually exercised the key storefront interactions throughout the accepted package reviews and reports no remaining functional issue in the currently available store states.
- Owner-observed Lighthouse scores vary between approximately 80 and 90 with local and network conditions. This is treated as performance smoke evidence, not as a single deterministic benchmark result; Shopify's current minimum average performance score is 60.
- Lighthouse accessibility remains a separate metric with a current minimum average score of 90 and must not be inferred from the performance range.
- Static validation is current through commit `2d73c77`: aggregate lint, Theme Check, required builds, Shopify theme validation, formatting, and diff checks passed for the completed code packages.

Risk:

- Shopify can still reject a submission that fails its benchmark dataset, official feature review, accessibility checks, demo-store review, or external launch requirements.
- Repeating a large internal matrix would add process cost without materially improving the already completed owner smoke coverage.

Acceptance criteria:

- Do not repeat accepted package-level storefront checks unless the submitted code changes or Shopify reports a regression.
- Before upload, run one final clean static gate and one compact smoke pass against the actual submission ZIP/demo store.
- Confirm the populated home, product, and collection averages meet Shopify's current minimums: performance 60 and accessibility 90 for desktop and mobile. Treat run-to-run performance variance as evidence only when the average remains above the threshold.
- Record and fix failures only; classify each as theme code, merchant configuration/content, uploaded asset, Shopify/app/vendor, or measurement noise.
- Shopify's official review feedback becomes the authoritative next validation loop after submission.

Ownership:

- Mixed: theme code, merchant configuration/content, external operations, and QA.

### BLK-19 — Required Shopify Account Component Is Missing

Status: **owner-reviewed and resolved through `ACCOUNT-COMPONENT-01`; committed in `2d73c77`** (2026-07-30). Shopify's platform component owns legacy, disabled, and signed-in account-mode behavior; do not create a separate internal matrix unless the official review or a reproducible storefront issue exposes a regression.

Official expectation:

- Current Shopify Theme Store requirements require the `<shopify-account>` component in the site header and require it to be visible on both mobile and desktop.
- Shopify's theme implementation guidance gates the component with `shop.customer_accounts_enabled`; the component owns the account interaction, signed-in avatar, and account sheet. The optional `signed-out-avatar` slot customizes only the signed-out avatar presentation.

Repository evidence:

- No `<shopify-account>` occurrence exists at committed baseline `1c01a3c`.
- `sections/header.liquid` renders a normal account link in the shared `header-navigation` region. That region is visible at mobile and desktop widths, so one component there can satisfy both viewport requirements.
- `snippets/header-mobile-menu-drawer.liquid` renders a second ordinary account link inside the mobile drawer. It is a supplementary navigation entry, not a substitute for the required visible Header component.

Risk:

- Direct Theme Store rejection for a missing current mandatory feature.
- Wrapping the existing link inside `<shopify-account>` would create nested or competing interactive ownership instead of implementing Shopify's account component contract.

Acceptance criteria:

- The shared Header navigation renders `<shopify-account menu="customer-account-main-menu">` when customer accounts are enabled and remains visible at mobile and desktop widths.
- The component itself owns activation. No anchor, button, Alpine dialog trigger, or duplicate interactive control is nested inside it.
- If the existing account icon is preserved, it is rendered through the `icons` snippet inside a non-interactive `signed-out-avatar` slot. Shopify retains ownership of the signed-in avatar and account sheet.
- Latest customer accounts open the Shopify-controlled account sheet; legacy customer accounts retain Shopify's supported sign-in navigation.
- The disabled-account state, Header grid, visible focus, color schemes, mobile menu, search/cart controls, and Theme Editor section reload behavior remain correct.
- The existing mobile-drawer account link is separately classified during implementation and may remain as a supplementary direct-navigation link if it does not create a conflicting or duplicate interaction.

Ownership:

- Theme code. The minimal compliant implementation does not require merchant-owned configuration or a new Header schema setting.

Implementation evidence (2026-07-30):

- `sections/header.liquid` now renders `<shopify-account menu="customer-account-main-menu">` behind `shop.customer_accounts_enabled` in the shared mobile/desktop `header-navigation` region.
- The existing account icon is preserved only as non-interactive `signed-out-avatar` slot content rendered through the `icons` snippet. Shopify owns activation, signed-in avatar presentation, and the account sheet.
- The separate mobile-drawer account link remains a supplementary direct-navigation link and still closes the drawer when activated.
- Owner review confirmed the account component and its mobile Header position. The mobile drawer's existing title/footer separators were present but visually ineffective in the default dark scheme because `border-theme-border/20` mixed two dark colors. The two mobile-menu-only separators now use the active foreground token at 30% opacity, preserving color-scheme adaptability without changing merchant-owned colors or other dialogs.
- No JavaScript, Header schema, locale, merchant-owned configuration, or vendor asset changed. `assets/tailwind.output.css` was regenerated from source after the scoped utility classes changed.
- Shopify MCP theme validation, Tailwind build, `npm.cmd run lint`, and `npm.cmd test` passed; Theme Check inspected 137 files with 0 offenses.
- Owner storefront review passed for the available account sheet, shared desktop/mobile Header placement, mobile-drawer auxiliary account area, and refined title/footer separators on 2026-07-30.

## 5. Important Risks And Non-Blocking Debt

These are not all proven rejection blockers, but they can become blockers after measurement or reviewer testing.

### RISK-01 — Global Asset And JavaScript Cost

Evidence:

- `layout/theme.liquid:20-62` globally loads the full generated CSS, Swiper, Alpine, all Alpine component groups, HTTP/runtime utilities, cart/dialog stores, and monitoring.
- Rough asset inventory at audit time:
  - all files under `assets/`: approximately 876 KB uncompressed.
  - `assets/tailwind.output.css`: approximately 336 KB.
  - `assets/vendor-swiper.min.js`: approximately 155 KB.
  - `assets/alpine.components.ui.js`: approximately 65 KB.
  - `assets/vendor-alpine.min.js`: approximately 46 KB.
- Approximately two dozen script requests are declared globally.

Risk:

- Lighthouse performance below 60 on mobile.
- Parsing/execution cost on pages that do not use product, filters, Swiper, or overlays.

Rule:

- Do not refactor based only on file size. Run benchmark-like Lighthouse first, classify code-owned findings, then make the smallest measurable changes.

### RISK-02 — Debug Performance Script Is Globally Loaded

Evidence:

- `layout/theme.liquid:43` loads `performance.js` on every page.
- The script activates only for `debug=true` or design mode, but still incurs a request and parse.

Acceptance direction:

- Measure and decide whether to conditionally load it in design/debug contexts without breaking editor diagnostics.

### RISK-03 — Countdown And Scarcity Compliance

Evidence:

- `sections/promotion-countdown.liquid` provides a merchant-configured countdown.
- Default end date was `2026-12-31 23:59:59`.
- Inventory notice can show real variant inventory and low-stock quantity.

Risk:

- Shopify prohibits fake urgency, fabricated stock, viewer counts, or scarcity.
- The current inventory notice uses real inventory and is defensible.
- Countdown is acceptable only when tied to a real promotion and must not silently auto-reset or fabricate urgency.

Acceptance direction:

- Document intended merchant use.
- Verify expired behavior and ensure defaults do not imply a false active sale.

### RISK-04 — Theme Differentiation And Positioning

Evidence:

- Shopify Skeleton is the base, which is eligible.
- Project identity is described internally as multi-industry.
- Current default templates mix cosmetics, fashion, AI language, generic discounts, and unrelated locations.
- Theme metadata still says Skeleton.

Risk:

- Current Theme Store rules demand a distinctive, intentional art direction and a clear target merchant/industry.
- Cosmetic changes, typography changes, gradients, animations, or extra sections alone do not prove uniqueness.
- Reviewers evaluate header/navigation, product cards, media treatments, page structure, and the overall experience.

Acceptance direction:

- Define the first preset’s target industry, catalog size, merchant problem, visual principles, and differentiating capabilities.
- Compare the complete experience against existing Theme Store themes before naming/submission.
- Do not begin a broad redesign until the user chooses positioning.

### RISK-05 — Icons, Vendor Libraries, And Asset Provenance

Evidence:

- Vendor inventory in README records Alpine and Swiper sources.
- `icons/` was empty during the audit.
- Generated icon SVGs exist in `assets/`.
- Some SVGs contain exporter metadata such as `p-id`, suggesting external icon sources.
- No complete submission license/provenance ledger was found.

Risk:

- Shopify can reject third-party intellectual property or unlicensed demo assets.
- Empty icon sources make regeneration and ownership verification difficult.

Acceptance direction:

- Reconstruct or locate approved icon sources.
- Record source URL/vendor, version, license, modification status, redistribution permission, and attribution obligations for every third-party library/icon/media family.
- Verify demo store images, brand names, copy, and fonts have direct rights.

### RISK-06 — Routes Object Consistency

Status: **resolved by owner-accepted Package J** (2026-07-24).

Evidence:

- Most navigation correctly uses `routes.*`.
- `sections/404.liquid:51` falls back to literal `/`.
- `sections/password-footer.liquid:18` links to `/admin`.

Risk:

- Literal storefront paths can break locale-aware routing.
- Admin link may be intentional and should be classified separately.

Acceptance direction:

- Replace storefront root fallback with `routes.root_url`.
- Keep or change admin route only after confirming Shopify guidance and intended behavior.

### RISK-07 — Shopify-Domain Links And `nofollow`

Status: **resolved by owner-accepted Package J** (2026-07-24) for the confirmed rendered-link defects. Resource loads, intentional admin routes, and business-owned theme identity/support URLs remain outside this risk's code fix.

Evidence:

- Theme/schema help text includes Shopify-domain links.
- Official rules require code links pointing to Shopify domains to include `rel="nofollow"`.

Risk:

- Rendered anchor behavior and schema Markdown rendering need classification; resource loads such as CDN preconnects are not the same as navigational anchors.

Acceptance direction:

- Audit rendered anchors only.
- Do not mechanically add `nofollow` to scripts, styles, preconnects, or non-anchor resources.

### RISK-08 — README Maintenance Debt

Evidence:

- README contains mojibake/corrupted Chinese text.
- It references files that do not exist, including older workflow/index paths.
- It includes destructive Git maintenance examples.
- It identifies a non-Shopify Skeleton CSS framework in its opening description.
- README is excluded by `.shopifyignore`.

Risk:

- Not a storefront upload blocker.
- High agent/developer onboarding and maintenance risk.
- Can undermine provenance explanations during partner review preparation.

Acceptance direction:

- Handle as a separate repository documentation task after launch blockers, unless needed for licensing/provenance.

## 6. Verified Or Likely-Passing Areas That Still Need Runtime Confirmation

Do not rewrite these areas without a documented defect:

- OS 2.0 JSON templates and section groups.
- Custom Liquid section.
- Product and featured-product app blocks.
- Product block configurability.
- Discounts in cart.
- Accelerated checkout on product/cart.
- Selling-plan label in cart.
- Pickup availability.
- Related/complementary recommendations.
- Variant swatches.
- Rich product media framework.
- Gift card issuance page basics.
- Predictive search and object-type result tabs.
- Localization selectors.
- Multi-level navigation implementation.
- Newsletter forms.
- Follow on Shop.
- SEO metadata, canonical URL, product structured data.
- Open Graph and Twitter Card tags.
- Responsive image widths/sizes strategy.
- Image alt plumbing through the shared image snippet.
- Shopify-hosted asset usage.
- No Sass/SCSS.
- No forbidden `robots.txt.liquid`.
- No `config/markets.json`.
- No non-vendor minified theme application files found.

Each remains subject to real store data, editor interaction, browser, keyboard, and visual testing.

## 7. Owner Runtime Smoke And Submission Check

Status: **core storefront smoke passed by owner; exhaustive per-case evidence tracking removed** (2026-07-30).

The owner has exercised the key storefront flows during the accepted package reviews, including responsive presentation, navigation and overlays, product and cart interactions, search/filter behavior, motion, mobile Header/account behavior, and the Theme Editor surfaces available in the current store. Do not reopen or repeat those checks without a code change or a reported regression.

Keep only this compact pre-upload check:

- Run the final repository lint, Theme Check, required generated-asset builds, and submission ZIP boundary check.
- Smoke the actual submitted ZIP/demo store through navigation, product option selection, add to cart, cart editing, checkout handoff, search/filter, mobile navigation, and one representative Theme Editor reload.
- Confirm keyboard focus for primary navigation, cart, search, account, and transient overlays; confirm navigation and the product form retain their required no-JavaScript fallback.
- Use populated home, product, and collection pages for Lighthouse. Shopify's current minimum averages are performance 60 and accessibility 90 for desktop and mobile.
- Treat the owner's approximately 80–90 score range as passing performance smoke evidence. Accessibility must be read separately and should average at least 90.
- Record only failures and the resulting focused fix. Do not maintain a screenshot/evidence row for every already accepted interaction.

## 8. Official Review Handoff

Shopify's review is the next authoritative validation stage after the compact submission check. It does not replace the minimum pre-upload smoke test, but it replaces further speculative internal test expansion.

- Submit the tested ZIP and current demo store after the external gates in sections 9 and 10 are ready.
- Treat reviewer findings as the source for any next code package; do not pre-emptively refactor areas that passed owner review.
- Address every rejection reason before resubmitting. Do not resubmit an unchanged package after a reported failure.
- Re-run only the affected flow plus the compact submission check after a reviewer-requested change.

## 9. Demo Store, Listing, Naming, And Support Gates

### Theme And Preset Naming

- Select a unique parent theme name.
- Use 1–2 words and fewer than 30 characters.
- Do not use Shopify product/event names, company/Partner account name, ecommerce platform terms, SEO promises, industries, or Theme Store collection names.
- One preset must use the parent theme name.
- Check uniqueness against current Shopify Theme Store themes and other platforms.

### Preset And Demo Store

- At least one demo store per preset.
- Demo store matches the tagged industry and catalog size.
- Fresh install matches demo layout and color/typography expectations.
- Use authentic text; no Lorem Ipsum, onboarding text, profanity, misleading claims, or fake scarcity.
- Bogus Gateway or Shopify Payments test mode enabled; other checkout methods disabled.
- Do not showcase app-dependent functionality.
- Demonstrate sale, sold-out, multiple variants, rich media, and gift card examples.
- Document rights for every image, logo, brand name, product description, and video.
- Use the latest submitted theme version.

### Listing Package

Prepare and verify:

- Theme ZIP excludes development/governance/source-only files through `.shopifyignore`.
- Theme name, preset name, version, and release notes.
- Listing description, highlights, supported features, pricing/value proposition, and screenshots.
- Demo store URLs and shared password.
- Reviewer testing instructions, admin setup notes, and feature locations.
- Contact email allow-list for Shopify submission messages.
- Documentation and public support form links.

### Support Operation

- Public documentation matches actual editor terminology.
- FAQ exists.
- Support scope and unsupported customization boundaries are clear.
- Contact form is mobile friendly and directly linkable.
- Auto-responder confirms ticket receipt.
- Team can reply within two business days.
- Process exists for bug fixes, Shopify platform changes, theme updates, and release notes.

## 10. Intellectual Property, Exclusivity, And Trust Gates

- Theme Store distribution must be exclusive to Shopify Theme Store after listing.
- Remove developer credits, affiliate links, and external marketing from theme files.
- Do not alter `powered_by_link`; it must contain only Shopify’s output.
- No app dependency for core theme functionality.
- No app-like feature requiring private/API access to function.
- No fake countdown reset, fake viewer count, fabricated sales count, false stock, or misleading claims.
- Record redistribution rights for vendor JavaScript/CSS.
- Record licenses and source for icons.
- Record rights for demo images/video/copy/brand names.
- Confirm code is original apart from the allowed Shopify Skeleton base and approved libraries.
- Demonstrate architecture-level differentiation rather than cosmetic changes to Skeleton.

## 11. Current Combined Work Packages And Order

Use one commit per approved rollback domain. Do not combine all blockers into one change set, and do not split a coherent domain into mechanical one-BLK commits unless runtime review shows that separation is safer.

### Package A — Commerce Pricing And Payment Disclosure

Status: **owner-reviewed and committed** (2026-07-20). Commit: `cef6e47`. This records Package A acceptance and its approved review follow-ups; it does not declare the whole theme ready for Theme Store submission.

Scope: BLK-01, BLK-02, BLK-03, and BLK-05, plus the scoped money-display and QUANTITY-01 regressions found during manual review.

- Unit pricing on required product, listing, and cart surfaces.
- Variable-price representation on product cards and listings.
- Shopify payment terms in the correct product form and variant context.
- Tax-inclusive messaging driven by `cart.taxes_included`.

Why combined: these findings share price presentation, variant state, product forms, cart price surfaces, and locale copy. They should be reviewed and reverted as one pricing-disclosure capability.

Owner acceptance: the implemented Package A behavior was manually reviewed with no remaining issue reported, including client money-symbol consistency, Quick view price preservation, and quantity-limit synchronization. Store and Market combinations unavailable in the current preview remain part of final launch QA.

Implementation and acceptance notes:

- Liquid filter `unit_price_with_measurement` used; no JS measurement string assembly.
- Customer order templates: N/A (`templates/customers/**` absent).
- Client money display alignment: JS Intl fallbacks in `ProductPrice._formatPrice`, `cartOverlay.formatMoney`, and predictive search use `document.documentElement.lang || undefined` and `currencyDisplay: 'narrowSymbol'` so zh locale + USD matches Liquid `| money` (`$` not `US$`). `Shopify.formatMoney` remains preferred when present. No shared money abstraction; Liquid `money` / `money_with_currency` unchanged; unit-price, payment terms, and tax notice untouched.
- QUANTITY-01 review fixes: variant payload restored to `product.variants | json` with separate `data-variants-quantity-meta` map merged in VariantPicker; ProductPrice ignores null/non-numeric price events instead of writing `$0.00`; product increments require `qty + step <= max` and reject invalid remainders; cart line max = absoluteMax − other same-variant lines; no-JS ATC submit disabled when `can_purchase` is false; cart-limit CTA uses `products.product.maximum_in_cart` (not Sold out). Validated through repository lint, Theme Check, and owner runtime review; the owner intentionally removed the temporary targeted Node test file.
- Cart drawer: server-formatted unit-price map + minimal SectionRefresher refresh of `[data-cart-unit-price-map]`; no drawer tax notice.
- Payment terms: separate product form near price; scoped `ProductPaymentTerms` on `PRODUCT_VARIANT_CHANGED`.
- Tax notice: `cart.taxes_included_note` vs preserved `cart.taxes_note` on product purchase surfaces and cart page.

#### Accepted review follow-up — QUANTITY-01 Unified Quantity Constraints

Status: **owner-reviewed and committed as part of `cef6e47`**. Scoped to quantity min/max/step behavior discovered during Package A runtime review.

Contract:

- Absolute max = `min(quantity_rule.max, inventory_quantity)` when inventory is managed and `inventory_policy == deny`; otherwise inventory does not cap.
- `quantity_rule.max == null` => no rule cap.
- `inventory_policy == continue` or unmanaged inventory => no inventory cap.
- Product / Featured / Quick view max = absolute max minus `cart | item_count_for_variant` (additional units only).
- Cart page / drawer max = absolute max (line edits total quantity; do not subtract this line).
- Matching variant lines: `item_count_for_variant` / JS `cartQuantityForVariant` sums every cart line with that `variant_id`.

Surfaces: `quantity-selector` via buy-buttons and product-info quantity block (PDP/Featured/QV), `sections/cart.liquid`, and `sections/cart-overlay.liquid` drawer controls.

Shared math: `assets/quantity-constraints.js` + `snippets/quantity-constraints.liquid`. Variant picker uses `product-variants-quantity-json` so inventory and `quantity_rule` survive client variant switches.

### Package B — Gift Card Recipient Purchase Flow

Status: **owner-reviewed and accepted** (2026-07-21). Package B implementation and this acceptance record belong in the same commit. Do not start Package C until that commit is complete. This acceptance closes the Package B review gate only and does not declare the whole theme ready for Theme Store submission.

Scope: BLK-04 only.

Why separate: gift-card recipient data, validation, accelerated-checkout restrictions, native form submission, JavaScript enhancement, and no-JavaScript behavior form a distinct high-risk purchase flow.

Owner acceptance: the owner explicitly approved Package B after storefront and Playwright review. No remaining Package B issue was reported for the gift-card recipient purchase flow, responsive presentation, shared product layout, regular-product regression, or the required manual gate.

Implementation and acceptance notes:

- Recipient form snippet `snippets/gift-card-recipient-form.liquid` rendered inside `snippets/buy-buttons.liquid` when `product.gift_card?`.
- Shopify line item property contract: `Recipient email`, `Recipient name`, `Message`, `Send on`, `__shopify_send_gift_card_to_recipient`, `__shopify_offset`.
- AJAX add-to-cart serializes enabled form `properties[*]` into `$store.cart.add()`; no-JS uses native product form + `if_present` control.
- Accelerated checkout (`payment_button`) and custom Buy now are suppressed for all gift card products while the recipient form is present (Shopify: recipient validation does not support accelerated checkout).
- Surfaces covered by shared buy-buttons: PDP, Featured Product, Quick View.
- `GiftCardRecipient` is registered in the `assets/base.js` Alpine factory chain.
- No-JS error summary maps `form.errors` key `send_on` to `#Recipient-send-on-*`; `clearErrors()` removes only dynamic error IDs from `aria-describedby` and preserves Message help IDs.
- Visual/a11y refinement: opt-in and field labels inherit the default body size; help/errors use `body-sm`; the opt-in uses `size-8`, `min-h-11`, and focus styling; the recipient root uses `gap-5` and `mb-10` above the purchase group.
- Shared layout follow-up: `productLayout` no longer writes `align-self: start` to sticky targets. Recipient expansion can switch `stickySide` from info to media without shrinking the flex-column media panel; measured media, main image, thumbnail, and gallery-block positions remained unchanged across repeated toggles, with no ResizeObserver warning.
- Final validation passed: Shopify MCP `validate_theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:theme`, `npm.cmd run lint`, `npm.cmd test` (136 files, 0 offenses), and `git diff --check`.

Manual gate: **passed by owner** (2026-07-21), covering the Package B gift-card and regular-product storefront matrix, recipient states and validation, submission/properties behavior, responsive and keyboard/accessibility behavior, JavaScript-disabled fallback, and the product-layout regression found during review.

### Package C — Cart Completeness And Progressive Enhancement

Status: **owner-reviewed and committed** (2026-07-21). Commit: `931fbf1`. This closes the Package C review gate only and does not declare the whole theme ready for Theme Store submission.

Scope: BLK-06 only. BLK-01 unit-price markup may be consumed here, but this package must not redesign the cart.

Why separate: cart page and drawer layout, line-item semantics, empty state, quantity/remove/update behavior, checkout, and no-JavaScript fallback have a large regression surface and need an independent rollback boundary.

Implementation and acceptance notes:

- Cart page keeps the existing linked product title, renders non-default variant options separately, displays localized `cart.empty`, and preserves Order Summary plus the existing Shop More action.
- Cart page and drawer render per-unit `final_price`, conditional `original_price`, existing final/original line totals, selling plans, discounts, and Package A measurement unit pricing without combining unit and line totals.
- Both surfaces render non-blank public line-item properties, hide every private key beginning with `_`, escape labels and values, and link only conservatively validated `/uploads/` values.
- The cart page remains Liquid-rendered; the drawer remains Alpine-rendered from `/cart.js`. No cross-runtime Liquid abstraction was introduced.
- `$store.cart` remains the authoritative mutation/state layer. Registered cart section IDs ensure page and drawer quantity/remove mutations refresh both surfaces and the header count without requiring the drawer to be opened first.
- Owner storefront review found no remaining Package C line-item or synchronization issue. The pre-existing Estimate Shipping control was confirmed non-functional and is tracked separately as `CART-SHIPPING-01`.
- Final validation passed: Shopify MCP `validate_theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:theme`, `npm.cmd run lint`, `npm.cmd test`, and `git diff --check`.

Manual gate: **passed by owner for the implemented Package C scope** (2026-07-21), including empty/populated cart presentation, variant options, line-item properties, prices, and page/drawer/header synchronization. Store fixtures unavailable during review remain part of the final launch evidence gate.

#### Follow-up — CART-SHIPPING-01 Cart Shipping Rate Estimator

Status: **owner-reviewed and committed** (2026-07-22). Implementation commit: `843fbf6`. Render-boundary regression fix: `47b1de4`. Keep this as a separate rollback domain from Package C.

Implementation and acceptance notes:

- The existing cart layout and Estimate Total semantics are preserved. Estimate Total remains `cart.total_price`; returned rates are informational and are not presented as selected or added to the cart total.
- Country, province, and postal code remain local form values until Get Estimate is submitted. Editing the fields does not mutate cart attributes or issue cart requests.
- Submit uses `ShopifyHttp` to POST `cart/prepare_shipping_rates.json`, then polls `cart/async_shipping_rates.json` with bounded attempts, abort handling, stale-request protection, and cleanup on Alpine component destruction.
- The estimator exposes declarative Alpine `idle`, `loading`, `success`, `empty`, and `error` states. Localized status messages use a polite live region; returned rate labels and formatted prices render through `x-text`, never `x-html`.
- Cart note, cart quantity/remove synchronization, header count, drawer state, checkout, and JavaScript-disabled checkout reachability remain unchanged.
- Review found a render-boundary regression in the original implementation: cart accordion HTML was serialized through a pipe-delimited Liquid string while the shipping `x-for` key contained JavaScript `||`. Liquid `split: '|'` truncated the `<template>` output, causing the browser and Theme Editor to lose the normal footer DOM.
- Commit `47b1de4` replaces that cart-only delimiter contract with `snippets/cart-summary-accordion.liquid`. Note and shipping HTML are passed as separate named Liquid arguments while the existing accordion classes, Alpine state, panel indexes, default-open state, icons, ARIA, and visual layout are preserved. The shared `accordion` snippet API was not extended.
- Rendered regression proof after the fix: 37 opening and 37 closing `<template>` tags, the complete shipping key expression is present, and `</main>` closes before the footer section group.
- Final validation passed: Shopify MCP `validate_theme`, `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), `node --check assets/alpine.components.overlays.js`, and `git diff --check`.
- No merchant-owned configuration, `templates/*.json`, footer implementation, generated/vendor asset, or visual redesign was included in either commit.

Manual gate: owner storefront review passed for local-only address editing, Get Estimate submission/no-rate behavior, preserved cart interactions and layout, and footer/Theme Editor recovery after the delimiter fix. Carrier-rate success, invalid-destination/API-error timing, repeated-submit races, screen-reader announcements, full responsive coverage, and JavaScript-disabled smoke testing remain part of the final launch evidence gate where the required store/network fixtures were unavailable.

### Package D — Search Facets

Status: **owner-reviewed and accepted** (2026-07-23). The Package D implementation and this acceptance record belong in the same owner commit. Do not start Package E before the separate `PRODUCT-CARD-RATIO-01` follow-up is handled.

Scope: BLK-07 only.

Why separate: product facets, sorting, pagination, tabs, URL history, clear-all behavior, mobile drawer accessibility, and section refresh belong to one independent search controller domain.

Implementation and acceptance notes:

- Product search results expose Shopify facets through the shared filter drawer; Article and Page results do not render Product filter controls.
- Search Sort was removed because it is not required by BLK-07. Existing inbound `sort_by` context is preserved across Product filter, clear, and pagination actions without exposing a Search Sort control or changing Collection sorting.
- The server-rendered active result type comes from `search.types`. Product/Article/Page switching, Back/Forward, hard refresh, and repeated type changes keep content, URL, visual activation, `aria-selected`, and roving `tabindex` aligned.
- Product facet refreshes replace only Search results and drawer body. Result-type changes recreate the complete Search `tabControl()` shell and drawer shell through `ShopifySectionRefresher`, preventing stale Alpine tab registrations.
- The Search adapter preserves query/type/prefix/filter/page context, aborts stale requests, announces result changes, and coordinates drawer focus through public dialog store APIs.
- The Product results toolbar contains Filter only. Search result tabs use compact typography and remain a single horizontally safe row at reviewed desktop/tablet/mobile widths.
- Search Product cards no longer use `h-full` and now use the same intermediate Grid wrapper as Collection cards, so the global Product card image-ratio setting remains visually effective.
- No merchant-owned configuration, `templates/*.json`, locale copy, Collection implementation, vendor/generated asset, or global Product card setting was changed.
- Final validation passed: Shopify MCP `validate_theme`, `node --check` for modified JavaScript, `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), and `git diff --check`.

Manual gate: **passed by owner** (2026-07-23), covering Product-only facets, Article/Page separation, result-type activation and history restoration, pagination and URL context, clear/empty states, rapid requests, mobile drawer focus/keyboard behavior, responsive tab layout, Search Product card image-ratio presentation, and Collection filter/sort regression checks.

#### Follow-up — PRODUCT-CARD-RATIO-01 Product Card Global Ratio Consistency

Status: **owner-reviewed and accepted** (2026-07-23). The implementation and this acceptance record belong in the same owner commit. Complete that commit before starting Package E. This was a pre-existing cross-surface visual consistency issue, not part of BLK-07.

Repository evidence:

- `sections/featured-products.liquid` passes `class: 'h-full'` to Product cards in both Grid and Swiper paths.
- `snippets/product-recommendations-section.liquid` renders Product cards as direct CSS Grid children.
- `snippets/header-dropdown-super-menu.liquid` renders fixed-width Product cards as direct children of a stretching Flex row.
- All three consumers still read the shared `settings.product_card_image_ratio`; the risk is parent/card stretching that can visually override `adapt` when mixed source-image ratios share a row.
- Collection Product cards are protected by an intermediate wrapper. Search adopted the same boundary in Package D.

Implementation and acceptance notes:

- Featured Products now always places each Product card inside a layout wrapper. The Grid path uses the established intermediate `group` boundary; the Swiper path preserves `swiper-slide h-auto`; the Product card itself no longer receives `h-full`.
- Product Recommendations now uses the same intermediate Grid wrapper, preventing the Product card Flex shell and media region from stretching to a sibling card's row height.
- Header Super Menu product rows use `items-start`, preventing direct Flex children from stretching across the cross axis while preserving fixed card width, horizontal overflow, and drag scrolling.
- Shared `product-card`, `image.liquid`, global `product_card_image_ratio`, Collection, Search, merchant-owned configuration, and uploaded images were not changed.
- Tailwind output was regenerated through `npm.cmd run build:tw`; no generated file was edited manually.
- Final static validation passed: Shopify MCP `validate_theme`, `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), and `git diff --check`.

Acceptance criteria:

- Featured Products Grid/Swiper, Product Recommendations, and Header Super Menu visibly honor all global Product card image-ratio modes: `adapt`, `square`, `portrait`, and `landscape`.
- Mixed portrait/landscape source images do not cause sibling Product card media frames to grow beyond their resolved ratio.
- Equal-height slide/card behavior is retained only where it does not override the merchant-selected image ratio.
- Do not change merchant-owned global settings, uploaded images, shared image fit semantics, Collection behavior, or Search behavior.
- Run focused desktop/mobile visual checks plus Shopify validation, `npm.cmd run lint`, `npm.cmd test`, and `git diff --check` before approval.

Manual gate: **passed by owner** (2026-07-23), covering Featured Products Grid/Swiper, Product Recommendations, Header Super Menu, global Product card ratio presentation, responsive layouts, and the affected hover/navigation/drag interactions. No remaining issue was reported.

### Package E — Blog And Article Compliance

Status: **owner-reviewed and accepted** (2026-07-23). The Package E implementation and this acceptance record belong in the same owner commit. Package F is the next implementation package.

Scope: BLK-08 and BLK-09.

- Blog cards render a non-empty `article.excerpt_or_content` preview after stripping HTML and whitespace, truncating to 30 words, and using `escape_once`; existing tag tabs, images, links, reveal behavior, and pagination remain unchanged.
- Article H1 output is always `article.title`. The existing optional section heading setting remains schema-compatible and renders only as supplementary non-H1 copy when it differs from the article title.
- Comments render only when `blog.comments_enabled?`, paginate five at a time through the shared pagination snippet, and use semantic list/article markup.
- The native `new_comment` form preserves submitted values safely, exposes linked field errors plus a focusable error summary, and distinguishes direct-publish success from moderated pending status through localized live messages.
- Owner-requested presentation refinements remove the redundant top divider, present each comment as a color-scheme-aware card with comment content followed by clear `By author · date` metadata, and use the theme `btn-primary` submit-button treatment.
- No JavaScript, merchant-owned configuration, `templates/*.json`, schema IDs, blog/article content, vendor assets, or shared pagination behavior changed. Tailwind output was regenerated through `npm.cmd run build:tw`; it was not edited manually.

Why combined: both findings belong to the editorial content domain and can be previewed across blog and article templates without affecting commerce code.

Final static validation passed: `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), and `git diff --check`.

Manual gate: **passed by owner** (2026-07-23), covering Blog excerpt presentation, Article title presentation, enabled-comment layout and metadata clarity, comment form layout, and submit-button treatment. Comment-disabled, moderation, validation-error, successful-post, pagination-over-five, and screen-reader announcement fixtures remain part of the final launch evidence gate where they were not exercised during this review.

### Package F — Collection And Image Display Contract

Status: **owner-reviewed and accepted** (2026-07-24). The Package F implementation and this acceptance record belong in the same owner commit. Package G is the next implementation package.

Scope: BLK-10 and BLK-11.

- List Collections cards use one `collection.featured_image` object consistently for image rendering, width, and alt text. Shopify owns the collection-image to first-product-image fallback; a nil result continues through the existing placeholder path.
- The shared image primitive records whether the caller supplied `position` before applying defaults. A valid explicit whitelist position is marked on the wrapper and overrides `image_tag` focal output only for that image.
- When callers omit `position`, Shopify `image_tag` retains ownership of focal-point `object-position`; images without a focal point fall back to `center` through snippet CSS.
- Invalid explicit position values safely fall back to `center`. Focal-point percentages never enter the fixed position whitelist.
- Existing `frame` / `natural`, cover / contain, aspect ratio, placeholder, responsive image, linked-image, and motion contracts remain unchanged. Newsletter Banner already passes its explicit merchant position and required no consumer change.
- `docs/references/style-system/image-display-contract.md` now records the precedence as explicit valid position, then Shopify focal point, then center.
- No JavaScript, schema, locales, merchant-owned configuration, `templates/*.json`, consumer-wide rewrite, Tailwind source, vendor asset, or generated asset belongs to Package F.

Why combined: both findings share the image rendering contract and collection/image visual QA. Revert them together if shared image behavior regresses.

Final static validation passed: Shopify MCP `validate_theme` for all three Package F files, `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), and `git diff --check`.

Manual gate: **passed by owner** (2026-07-24), covering the Package F image-source and focal-point precedence behavior. Collection fallback fixtures, nil placeholder, off-center focal crops, explicit-position rendering, natural/contain presentation, mixed ratios, and representative responsive image-picker surfaces remain part of the final launch evidence gate where they were not all exercised during this review.

### Package G — Theme Editor And Schema Compliance

Status: **owner-reviewed and accepted** (2026-07-24). The reduced Package G implementation and this acceptance record belong in the same owner commit. BLK-15 was excluded from Package G; its code-owned portion was later resolved by Package G2, while its merchant-owned/default-content portion remains in Package I.

Scope: BLK-12 and BLK-14 only.

- Removed the Theme Store-ineligible custom font URL settings, placeholder URLs, locale keys, runtime branches, and stale Tailwind guidance while preserving the heading, body, and subtitle typography tiers.
- Heading and body fonts now load from Shopify `font_picker` objects. Base, bold, italic, and bold-italic faces are generated through `font_modify` / `font_face` when the variants exist.
- Header `menu` now defaults to `main-menu`; a new Footer Link Column `menu` defaults to `footer`. Existing merchant-selected menus remain unchanged.
- The required Tailwind rebuild generated `assets/tailwind.output.css`; the additional removed utilities had no direct storefront or JavaScript consumers in the repository scan.
- No `config/settings_data.json`, `templates/*.json`, Header/Footer group JSON, merchant menu, vendor asset, or unrelated schema copy was changed.

Why combined: both accepted findings belong to Theme Editor install-state compliance and share the same editor smoke-test boundary. BLK-15 was removed before implementation to prevent an uncontrolled schema-copy rewrite.

Final static validation passed: Shopify MCP `validate_theme` for all seven changed files, `npm.cmd run build:tw`, `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), and `git diff --check`.

Manual gate: **passed by owner** (2026-07-24), covering the Shopify Heading/Body font pickers, storefront typography application, removal of custom font URL controls, Header Main menu default, new Footer Link Column Footer menu default, and preservation of existing merchant menu selections. Broader typography fixtures, fresh-install preset resolution, and representative 375 / 768 / 1280 regression coverage remain part of the final launch evidence gate where they were not separately exercised during this review.

### Package G2 — Schema Copy Compliance

Scope: the code-owned portion of BLK-15 only. Status: **owner-reviewed and committed** (2026-07-29). Commit: `213f81d`. This closes the G2 code-owned schema-copy scope only; the merchant-owned/default-content portion of BLK-15 remains in Package I and still requires explicit authorization.

- Merchant-facing English labels, setting info, section/block names, terminology, spelling, sentence case, action labels, ampersands, and broken schema help text were audited and corrected in `locales/en.default.schema.json`.
- Schema IDs, block types, section types, presets, storefront rendering, and merchant configuration were preserved.
- No `templates/*.json`, `config/settings_data.json`, demo content, uploaded media references, color schemes, or merchant-owned/default-content fields were changed; those remain in Package I after explicit authorization.

Static validation: `npm.cmd run lint:i18n` passed, theme architecture lint passed, and `npm.cmd test` inspected `137` files with `0` offenses. The current aggregate `npm.cmd run lint` reaches and passes the G2-relevant i18n and theme architecture gates, then stops in the unrelated agent-hook test because the local dependency `ajv/dist/2020` is unavailable.

Manual gate: **passed by owner** (2026-07-29), covering the affected Theme Editor settings, terminology, clarity, and absence of remaining G2 schema-copy issues. No further G2 code change is pending.

### Package H — Theme Identity And Support Metadata

Scope: the theme-metadata portion of BLK-13 only. Status: **owner-reviewed and committed** (2026-07-29). Commit: `74cca20`.

- `theme_name`: `Ceylune`, the owner-approved name selected for the cosmetics-oriented design direction. Current Shopify Theme Store and broader exact-name searches found no matching theme or obvious cosmetics brand; formal intellectual-property clearance remains a business gate rather than a repository claim.
- `theme_version`: `1.0.0`.
- `theme_author`: `ESEN`.
- `theme_documentation_url`: `https://esentheme.vercel.app/en/theme-settings`.
- `theme_support_url`: `https://esentheme.vercel.app/en/`.
- Only `config/settings_schema.json` and this context record belong to the implementation. Preset naming/content, `config/settings_data.json`, `templates/*.json`, listing metadata, documentation completeness, and support operations remain outside Package H.

Manual gate: **passed by owner** (2026-07-29), covering final acceptance of `Ceylune`, author/version accuracy, and the owner-supplied documentation and support destinations. No further Package H `theme_info` change is pending. Preset naming, release notes, documentation completeness, the public contact form, and support operations remain in their separately recorded packages or external gates.

### Package I — Default Install State And Preset Content

Scope: BLK-16, the merchant-owned template/default-content portion of BLK-15, the required parent-theme preset name, and `PLACEHOLDER-VARIETY-01`. Status: **owner-reviewed and committed** (2026-07-30). Commit: `1c01a3c`. Product, Collection, and Blog empty-resource presentation moves to the compact submission ZIP/demo-store check because the current store's route-bound resources cannot be safely cleared for this review. This remains one package with ordered phases, not separate Package I1/I2 rollback domains.

Phase 1 — content and configuration, current priority:

- Replace prohibited filler and incoherent defaults with an approved, authentic preset content direction.
- Remove or replace store-specific uploaded-image dependencies so a fresh install remains complete without the current shop's files.
- Rename the parent-theme preset from `default` to `Ceylune` without changing its settings until the exact merchant-owned fields are approved.
- Group copy cleanup, store-specific uploaded-image references, resource-handle classification, and preset configuration into this first phase. Preserve section/block structure, schema IDs, template composition, disabled states, color schemes, resource handles, and unrelated merchant configuration unless the inventory names an exact field and the owner approves it.

Phase 1 hybrid inventory workflow:

- Cursor owns the exhaustive mechanical scan and first-pass summary for high-volume, low-ambiguity fields. Its structured output must include file, exact JSON/schema path, category, current value, proposed action, merchant-owned status, and risk; Cursor does not edit or approve the fields during discovery.
- Project multi-agent work independently samples and cross-checks Cursor's coverage, counts, categories, protected-file boundaries, and omissions. A verifier reviews disputed classifications; the primary agent consolidates the authorization list.
- Cursor output is evidence input, not an accepted conclusion. If the active client cannot invoke Cursor directly, provide a bounded Cursor prompt/task capsule for the user to run and do not claim hybrid execution until its result is returned.

Phase 1 first-inventory review (2026-07-29): **request changes; do not authorize or implement from the current 283-item inventory**.

- The literal scans are reliable: independent recounts confirmed all 45 `Lorem Ipsum` values and all 53 `shopify://shop_images/` references, including the two references in `sections/footer-group.json`. The Phase 2 placeholder boundary was also preserved.
- Scope completeness is not reliable. The inventory omitted launch-relevant old-brand, furniture/apparel, malformed, and other incoherent defaults in merchant-owned JSON and `locales/en.default.schema.json`, plus the six-product handle field in `templates/product.json`.
- The proposed authorization groups overlap or conflate decisions: seven code-owned locale defaults also appear in the owner-authorized Lorem group, and the featured-product handle in `templates/index.json` is duplicated with conflicting actions. Resource handles, campaign copy, and uploaded-image dispositions require separate exact-field decisions.
- All 283 records omit the required per-item risk field. `config/settings_data.json` `presets.default` is a key rename whose complete payload must be protected; its current value must not be represented as the string `default`.
- Next action: regenerate or comprehensively correct the inventory across all merchant defaults, group JSON, schema-locale defaults, and typed resource fields; add risks, correct values/lines, deduplicate actions and authorization groups, then rerun independent verification before requesting owner authorization.

Phase 1 v2 inventory review (2026-07-29): **request targeted changes; v2 is mechanically sound but not yet an authorization basis**. The reviewed TEMP artifact had SHA-256 `DD90889D164AB4AB8F38DE1C2CE02462744A0AEE6C509219CA2C7B2EAC4C40F7` against baseline `74cca20`.

- All 211 current mutation records match repository values, have risks and unique execution paths, and partition cleanly into 170 merchant-owned authorization targets plus 41 code-owned defaults. The 45 Lorem values, 53 `shopify://shop_images/` references, 27 resource fields, and preset key-only rename were independently recounted.
- Semantic coverage still omits 12 targets: six merchant-owned fields and six corresponding code-owned schema defaults covering malformed `PRODUCT GUARANTEE NATURAL` / `PRODUCT GUARANTEE • NATURAL •` claim copy and `Personalize insight.`.
- Image disposition is not uniformly `safe-clear`: 46 fields have verified shared placeholders, six are blank-safe through different behavior than v2 records, and `footer` `brush_image` is unsafe to clear because its condition also owns the brand watermark render.
- Normalize group-file paths to one canonical file-qualified pointer form before treating the inventory as an executable mutation payload. The eventual preset rename must prove full nested-payload preservation in the implementation diff.
- Next action: produce a targeted v3 inventory correction, recompute counts/groups, and rerun independent verification. Do not request owner authorization or implement merchant-owned changes from v2.

Phase 1 v3 inventory correction (2026-07-29): **inventory gate passed; ready for owner authorization, with no theme implementation yet**. The primary-agent TEMP artifact is `package_i_phase1_inventory_v3.json`, SHA-256 `170C3ABF0AF3661E70C86C344F0A506F8C953FFF942E1607BFFA40CD4158D874`, against baseline `74cca20`.

- The corrected inventory contains 220 mutation candidates, 103 retain-only boundaries, 175 merchant-owned authorization targets, and 45 code-owned schema-default targets. All paths/values, required fields, counts, group membership, and non-overlap checks passed.
- v3 added the 12 omitted claim/malformed-copy targets, moved three valid newsletter name/translation values out of mutation scope, and records the portable 404 root link as retain-only. Its fresh semantic and typed-resource scans reported no uncovered candidate under the approved boundary; implementation review later found additional code-owned claim defaults, recorded in the copy-implementation follow-up below.
- The 53 uploaded-image references are classified as 46 placeholder-backed safe clears, six alternate blank-safe clears, and one deferred unsafe clear. `footer` `brush_image` remains a separate decision because current Liquid also hides the brand watermark when the brush is blank.
- All group JSON paths use the canonical `sections.<group-file>.<json-path>` form. The duplicate Phase 2 placeholder exclusion was removed; seven unique placeholder findings remain deferred.
- Next action: obtain owner authorization for the exact merchant groups and content direction, then implement one bounded Phase 1 batch. Preserve all 103 retain-only boundaries and verify the preset payload byte-for-byte aside from the authorized key/content changes.

Phase 1 copy implementation (2026-07-29): **owner storefront review passed**. The owner authorized a coherent cosmetics/skincare direction based on the current design and approved the `Ceylune` parent preset name. All 139 copy targets from the v3 inventory were replaced, and a narrow same-domain sweep also corrected omitted storefront fallbacks and unsupported generic claims.

- Merchant-owned copy in the approved templates and header/footer groups now follows one restrained cosmetics direction. Code-owned schema defaults remain portable, cross-industry editor prompts rather than Ceylune-specific marketing copy.
- `config/settings_data.json` renames only the parent preset key from `default` to `Ceylune`; the nested preset payload is preserved. Images, Shopify resource handles, colors, numeric/layout values, arrays/order, schema IDs/types, disabled states, and template composition were not changed.
- Two independent Terra read-only audits verified protected-boundary integrity and semantic/i18n coverage. Review findings were corrected before validation: the footer fallback is localized, list-collection grammar is plural, the location fallback is neutral, and testimonial copy avoids efficacy claims. The existing design identity `Alexandria Maria` / `Beauty Influencer` remains a manual provenance check for the owner.
- Static validation passed: all changed JSON/JSONC parsed; `npm.cmd run lint` passed; `npm.cmd test` inspected 137 files with 0 offenses; `git diff --check` passed apart from the environment-only global Git ignore permission warning.
- Follow-up storefront review found a shared rotating-badge layout bug after short percentage defaults were replaced by meaningful words. `snippets/rotating-badge.liquid` now scales center text by its length and prevents wrapping, so values such as `ROUTINE`, `EXPLORE`, and `DISCOVER` remain centered at both badge sizes. Tailwind output was regenerated; aggregate lint and Theme Check still pass. The owner accepted the corrected storefront presentation.
- The owner then clarified the acceptance rule as minimum necessary copy change: preserve any original copy that is already clear, truthful, and destination-accurate instead of rewriting it only for Ceylune tone. Qualified generic headings and CTAs were restored; three collection links originally labelled `Watch Now` now use the neutral, destination-accurate `Shop now`. Lorem, old-brand/wrong-industry text, malformed copy, unverified campaigns/claims, and incomplete placeholders remain corrected.
- The minimum-change rescan also found code-owned defaults omitted by v3: unsupported efficacy/skin-compatibility claims in the `promise-section` preset and unverified shipping/return/charity claims in product/icon defaults. These now use localized, portable product-information prompts. They are required truthfulness/fresh-install corrections, not cosmetic rewrites.
- Copy manual gate: **passed by owner** (2026-07-29), covering the affected storefront copy, minimum-change CTA policy, and corrected rotating-badge presentation. The copy tranche may be committed as accepted, but this does not complete Package I.
- Resource-handle group 1 (2026-07-29): **implemented; owner storefront review pending**. Under exact owner authorization, the apparel featured-product handle in `templates/index.json` and the six apparel product-comparison handles in `templates/product.json` were cleared. The initial handle edit changed no collection, URL, menu, image, color, layout, disabled-state, or placeholder-code field; the dependent code-owned empty-state refinements are recorded below.
- Owner review identified one Featured product empty-state defect: clearing the selected product left the media column blank and omitted the normal purchase-control structure. The scoped refinement now renders Shopify's official neutral `product-1` placeholder through `image.liquid`, with a token-based background, border, radius, and subdued SVG color; it preserves the localized example title/price/description and shows full-tone static quantity, Add to cart, and Buy it now treatments when those blocks are configured. These treatments are non-interactive elements rather than disabled-looking controls. The empty state retains only `productLayout` for its existing measured desktop sticky-column behavior; it does not initialize motion reveal, variant picker, quantity, or buy-button Alpine components. Selecting a real product preserves the existing live gallery and purchase behavior.
- The framed placeholder presentation is the business-neutral shared CSS contract `.media-placeholder-frame` in `tailwind/tailwind.components.css`; no dedicated placeholder snippet exists. `image.liquid` now applies that contract by default only when its image is blank, so content, editorial, collection, and product placeholders receive the same border, radius, surface, and subdued SVG color without consumer-specific class wiring. Full-bleed background consumers explicitly use `placeholder_style: 'plain'`; real images never receive placeholder framing. Each section still owns placeholder family/selection, aspect ratio, layout, and behavior. Featured product uses `product-1`; Product comparison deterministically cycles through Shopify's six neutral outline placeholders. Shopify's four apparel-specific color placeholders remain excluded from the cross-industry/Ceylune default direction. The no-product quantity display is the non-interactive state of the existing `quantity-selector.liquid`, not a parallel placeholder component; it emits no Alpine behavior and its native controls are disabled and hidden from assistive technology.
- Product comparison now preserves the configured comparison-table DOM, block rows, first-column highlight, borders, dimensions, and horizontal drag/scroll behavior when no products are selected. Six non-linked example columns replace only the missing product data with distinct official placeholders, localized numbered example titles, store-currency example prices, example detail text, and a neutral unavailable value. Selecting real products restores the same table cells; a selected product without a featured image receives the deterministic product placeholder for its column.
- The targeted group-1 empty-state implementation passed Shopify MCP validation, `npm.cmd run lint`, `npm.cmd test` (`139` files, `0` offenses), targeted Prettier, and `git diff --check` before the owner-requested abstraction consolidation. The current consolidated form has rebuilt Tailwind successfully and passed i18n and architecture lint; final aggregate lint and Theme Check are intentionally deferred to the end of the review batch rather than rerun after each micro-adjustment. The attempted Shopify MCP revalidation was permission-rejected and remains to be retried with the final batch if available.
- Resource-handle group 1 manual gate: home Featured product at desktop/mobile with no selected product; official framed placeholder present; example content and full-tone static purchase treatments present; the static treatments are not focusable or actionable; the shorter information column remains sticky while scrolling the taller media column; selecting/reselecting a real product restores the live gallery and purchase behavior. Product-page Comparison table with no products must retain all configured rows, six distinct placeholder columns, highlight styling, and horizontal drag/keyboard scrolling; selecting products must replace the matching placeholder state without changing layout. After owner acceptance, continue with the seven specific collection handles, then the nine portable collection-root URLs and four menu handles. The 53 uploaded-image references and broad Phase 2 context-aware placeholder work remain later.
- Resource-handle group 2 (2026-07-29): **implemented; owner storefront review pending**. Five apparel-specific collection selectors in `templates/index.json` were cleared: three Featured products tab collections, Scroll categories, and Routine showcase. The two `shopify://collections/女士衣服` Promo banner destinations were normalized to the portable `shopify://collections` root without changing banner content or layout. This brings the implemented resource-field count to 14 of 27; nine pre-existing portable collection-root URLs and four header/footer menu handles remain.
- Group 2 dependent empty states follow the owner-approved abstraction rule. `product-card.liquid` owns its static no-product state and cycles through the six neutral official product placeholders without product-card Alpine, quick-view, cart, link, or variant behavior; Featured products supplies placeholder indices while retaining its configured tabs, grid/slider geometry, and controls. Scroll categories retains its row typography, price column, foreground/background hover inversion, desktop preview position, and image-magnifier behavior. `image-magnifier.liquid` accepts the existing `placeholder_key` contract and uses an encoded official SVG as its zoom source when the Shopify image is blank. Routine showcase retains its full-screen background media layer, localized product-caption hover inversion, and normal Swiper lifecycle/navigation, rendering six official placeholder slides when its collection is blank. Composite Routine cards, content panel, and full-screen fallback own the shared visible frame while their nested SVG media uses `plain` to avoid double borders; no new placeholder snippet or parallel component was added.
- Owner clarification for Routine showcase background (2026-07-29): preserve the full-screen background media layer, not the current store-specific upload. The exact `templates/index.json` `bg_img` reference to `Desktop_-_5.png` is now cleared under owner authorization, and `routine-showcase.liquid` uses Shopify's `lifestyle-1` SVG fallback in the same absolute full-screen frame. This is one targeted uploaded-image disposition within Group 2; the other uploaded-image references remain deferred.
- Routine showcase placeholder color correction: the absolute background layer now establishes the section's configured color-scheme boundary and an opaque `bg-theme-bg` canvas before rendering the translucent lifestyle SVG. This prevents the transparent placeholder from inheriting/revealing the page's dark-green root surface and keeps the fallback merchant-themeable rather than hardcoded.
- Group 2 validation is intentionally batched: Tailwind was rebuilt after the final CSS adjustment, while aggregate lint, Theme Check, Shopify MCP validation, and 375/768/1280 visual review remain deferred until the owner finishes this review batch.
- Resource/image/Phase 2 batch (2026-07-29): **implemented and owner-accepted** (2026-07-30). All 27 resource fields now have an explicit disposition: the 14 store-specific product/collection fields from Groups 1-2 were cleared or normalized as recorded above; the three custom Footer menu handles were cleared; the generic Header `main-menu` selection and nine pre-existing portable collection-root URLs were intentionally retained. Including the two Group-2 URL normalizations, the current templates/groups contain eleven portable `shopify://collections` destinations. Empty Footer menu columns retain their headings and localized example rows as non-interactive text instead of dead `href="#"` links. Header rendering now guards the desktop menu, mobile drawer, and mobile trigger together when a merchant clears the selected menu.
- Uploaded-image closure: all 53 original `shopify://shop_images/` dependencies are now removed from `config/`, `templates/`, and section groups (Routine showcase first, then the remaining 52 fields). Existing section geometry and behavior remain the owners of the empty state. Hero and generic image-picker surfaces continue to use Shopify's generic `image` placeholder; editorial cards/media use deterministic `lifestyle-1` / `lifestyle-2`; product and cart contexts use `product-1` through `product-6`; collection/category contexts use `collection-1` through `collection-6`. Before/After keeps two distinct lifestyle placeholders and the existing draggable comparison. Decorative media may be omitted when blank. Footer watermark rendering is now independent of the optional brush image, so clearing that upload does not remove the brand treatment.
- Phase 2 code-owned coverage is implemented across Article, Blog, Blog stories, Collections, Category grid, Cart, About stats, Before/After, Promo banner, Philosophy, Promise, and Featured testimonial, in addition to the previously completed Featured product, Product comparison, Featured products, Scroll categories, and Routine showcase flows. Placeholder selection is deterministic; every real Shopify image/resource still takes precedence through the existing `image.liquid`, `image-magnifier.liquid`, and section interaction contracts. No custom placeholder asset, placeholder component, schema ID/type, section/block order, color scheme, disabled state, or layout setting was added or changed.
- Owner Slideshow decision during placeholder review: the home Slideshow no longer exposes previous/next/pause controls and no longer auto-advances. Touch/mouse drag remains Swiper-owned; multi-slide output is focusable and supports RTL-aware Left/Right keyboard navigation. The removed autoplay schema settings and matching `templates/index.json` values were explicitly approved. Slideshow alone retains an intentionally unframed visible full-bleed placeholder; Routine showcase now frames its complete empty-state surfaces while delegating nested SVG framing to the composite parent. Announcement bar behavior was not changed.
- Placeholder surface and color-state refinement (2026-07-30): `placeholder_style` remains the semantic `framed`/`plain` selector introduced in the Package I placeholder consolidation; CSS continues to own border, radius, surface, and SVG color. The shared frame now mixes the active scheme's background and foreground tokens into an opaque surface instead of placing a translucent foreground tint over arbitrary ancestors, preventing a different ancestor color from bleeding through Routine SVG transparency. Routine product cards frame image plus caption as one empty-state surface, and its empty background/content panel have distinct token-based boundaries while retaining the intended localized hover inversion. Routine and Google Map expose independent top/bottom padding settings using the project-standard 32px defaults; Google Map retains its no-color-scheme contract and renders only when enabled with a nonblank embed code. A new global `page_canvas_color_scheme` setting, defaulting to `scheme-2`, explicitly owns the body background used by section gaps, overscroll, and unscoped platform sections, replacing the previous visible reliance on whichever scheme happened to be first while retaining the first scheme as the `:root` token fallback.
- Newsletter Banner final empty-state correction (2026-07-30): Newsletter Banner is a contained `container-page` media surface, so the complete banner owns the shared frame while its nested generic Shopify placeholder remains `plain`. The illustration wrapper is geometrically centered at desktop and mobile breakpoints, the photo-only radial backdrop blur is skipped when no real image exists, and real background-image fit and position settings remain unchanged. The owner accepted the resulting empty-state presentation.
- Consolidated static validation passed after the resource/image batch and final placeholder/Slideshow consolidation: Tailwind rebuilt successfully; `npm.cmd run lint` passed; `npm.cmd test` inspected 137 files with 0 offenses; Shopify MCP `validate_theme` passed the earlier 22-file resource/placeholder set and the final 9 directly changed theme files; targeted JSONC parsing, zero-reference scans, and `git diff --check` passed. A final local Tailwind rebuild, aggregate lint, Theme Check (`137` files, `0` offenses), and `git diff --check` also passed after the Newsletter Banner centering correction. Owner storefront review passed for the directly inspectable empty states and interactions.

Required authorization: the exact copy fields/preset name, all 27 resource-field dispositions, all 53 uploaded-image removals, and the dependent code-owned placeholder behavior used by the current Package I worktree were authorized and implemented. Merchant-configured disabled states, color-scheme changes, and unrelated merchant content remain unauthorized.

Phase 1 manual gate: **passed for the current demo/storefront** (2026-07-30). Fresh-install parity remains part of the compact submission ZIP/demo-store check.

Phase 2 — context-aware placeholder coverage: **implemented and owner-accepted for directly inspectable surfaces** (2026-07-30):

- Context-aware variation uses Shopify's existing `placeholder_svg_tag` families through the shared `placeholder_key` contract; no custom placeholder image assets or random runtime selection were added.
- Product/card contexts cycle deterministically through `product-1` to `product-6`; collection contexts through `collection-1` to `collection-6`; editorial contexts use `lifestyle-1` / `lifestyle-2`; generic image-picker and hero fallbacks retain `image` unless the approved cosmetics preset requires another official family.
- Real images always win. Placeholder changes must preserve the global image ratio, fit, crop, focal-point, responsive image, and card-layout contracts.
- Apparel-specific color placeholders remain out of scope for the cosmetics direction. Do not change merchant copy, preset values, color schemes, section composition, or store-specific resource fields during phase 2.

Phase 2 authorization: the implemented code-owned placeholder consumers and exact supporting merchant-owned image clears were approved. Any newly discovered merchant-owned template field still requires separate exact-field authorization.

Phase 2 manual gate: **passed for the directly inspectable current-store surfaces** (2026-07-30). Product, Collection, and Blog are route-bound to backend resources in the current store; their minimal/empty-resource presentation and clean-install real-image precedence move to the compact submission ZIP/demo-store check rather than requiring destructive changes to published data.

Package gate: **passed by owner and committed in `1c01a3c`** (2026-07-30). This closes Package I as a code package; only the compact fresh-install/demo presentation check remains before submission.

### Package J — Route And Shopify-Link Compliance

Status: **owner-reviewed and accepted** (2026-07-24). The Package J implementation and this acceptance record belong in the same owner commit.

Scope: RISK-06 and RISK-07 only where the audit and current Shopify guidance proved a rendered-link defect.

- The 404 recovery link maps a blank setting or the schema/template literal `/` to `routes.root_url`; every other configured URL remains unchanged.
- Slides Show and Routine Showcase map only the literal `/collections` default to `routes.collections_url`; custom internal, external, query, and Shopify resource URLs remain unchanged.
- Routine Showcase renders its CTA only when both CTA text and the normalized destination are present, preventing an empty `href` anchor.
- The two confirmed Shopify-domain Markdown help links in Collection filtering and Custom Liquid schema copy were replaced with plain explanatory text because schema Markdown cannot reliably attach `rel="nofollow"`.
- The intentional Password Footer `/admin` owner entry, Shopify-generated `powered_by_link`, CDN preconnect, HTTP/cart URL construction, business-owned theme documentation/support URLs, and merchant-owned templates/configuration were not changed.
- No JavaScript, CSS, generated/vendor assets, `config/settings_data.json`, or `templates/*.json` changed.

Why combined: both findings were low-risk navigation/link compliance checks with one shared rendered-link verification boundary.

Final validation passed: Shopify MCP `validate_theme` for all four Package J files, `npm.cmd run lint`, `npm.cmd test` (137 files, 0 offenses), and `git diff --check`.

Runtime verification passed against the Shopify development storefront on 2026-07-24 by inspecting the server-rendered HTML directly:

- English 404 recovery rendered `href="/"`.
- Traditional Chinese 404 recovery rendered `href="/zh"`.
- Traditional Chinese Slides Show and Routine Showcase collection CTAs rendered locale-aware `href="/zh/collections"` anchors.
- The storefront CTAs were native anchors and did not depend on JavaScript for navigation.
- The exact-match normalization and Routine Showcase render guard prove custom URLs remain untouched and incomplete CTAs do not render.
- Both changed schema locale values parsed as plain text without Markdown links.

Verification gate: **passed**. No additional Package J storefront QA is required before the owner commit.

### Package K — Global Scroll Reveal Reliability

Status: **owner-reviewed and committed** (2026-07-28). Commit: `045b9e8`. The owner reported no remaining Package K storefront motion issue after the final reveal coverage, easing, and speed-tier tuning. Packages G2, H, and I were subsequently owner-reviewed and committed as `213f81d`, `74cca20`, and `1c01a3c`. Package L is the next review-only audit before the final BLK-18 evidence gate.

Owner-approved visual scope expansion (2026-07-27): Package K now also owns the ordinary reveal presentation language. Content options are `none` / `fade` / `rise` / `slide`; media options are `none` / `fade` / `zoom` / `slide`, with `zoom` as the new-install default. Do not add an intensity setting or media `rise`. `motion_speed` controls duration/stagger only; each style owns fixed amplitude. Slide defaults to upward content reveal and left-to-right media reveal, with internal CSS-variable override points rather than another merchant control. Cascade is generic repeated-layout choreography and uses one coarse reveal target per visual item; it is not a product-card-only style. Hero copy may keep a base delay/amplitude refinement but must respect the selected content style and global reveal speed.

Storefront visual refinement (2026-07-28; committed in `045b9e8`): earlier browser inspection at 1280x900 and 375x812 confirmed that the original Rise recipe resolved to only about 27.5px / 18.75px and that tall composite content targets completed before lower copy entered the viewport. The final recipe uses a responsive 40px..64px Rise, separate opacity/transform timing, stronger but restrained cascade/media scale, and the shared `data-motion-sequence` contract for compact copy rhythm. Ordinary reveal remains CSS/Alpine; trigger granularity and presentation did not justify a global GSAP runtime.

Storefront bug refinement (2026-07-28; committed in `045b9e8`): keep the `-15%` enter line, but use one lifecycle-managed shared scroll-settle recovery to reveal eligible pending targets that are already visibly inside the viewport after a fast scroll or at the document boundary. Browser measurements proved that parent-state copy delays still finish off-screen in tall Promo, Blog, and Product cards. `[data-motion-copy]` is therefore an independently observed content target using its own geometry (optionally stabilized by `[data-motion-copy-bound]`) while remaining inside the same shared runtime and selected content recipe. Motion-disabled and reduced-motion paths must keep that copy visible.

Copy-trigger QA (2026-07-28; committed in `045b9e8`): Promo Banner, Blog Stories, Blog, and Product Card copy now use the independent copy target. Product title/price requires a tight stable copy bound because its pending translate would otherwise place it beyond the card's `overflow: hidden` box and fail clip visibility. `always` re-entry uses an internal no-transition staging frame so both opacity and the full Rise distance replay after silent reset. Browser verification passed at 1640x900 and 375x812 for initial entry, `once`, `always` reset/replay, motion off, and reduced motion.

Purpose: repair the shared global scroll-reveal behavior without redesigning individual sections or migrating ordinary reveal animation to GSAP.

Owner-observed problems:

- On Home → Featured Products, scrolling through a multi-row product grid can cause an earlier row to cascade or flash again while a lower row enters.
- In long sections, an oversized reveal target can trigger when its top enters the viewport, allowing lower content to complete its animation before the customer can see it.
- Both `once` and `always` remain valid merchant choices; the defect is target/trigger ownership and replay stability, not the existence of the two modes.

Confirmed architecture direction:

- Ordinary scroll reveal remains Alpine/shared `IntersectionObserver` plus CSS state styling. `gsap.from()` is visually analogous to the existing pending-to-revealed transition but does not solve trigger granularity; GSAP timelines remain reserved for approved multi-element narrative choreography, parallax, scrub, or precisely coordinated hero sequences.
- A node whose geometry is changed by reveal `transform` must not also be the unstable boundary used to decide replay. Use one minimal shared semantic data-hook contract to separate a stable observation trigger from the animated target where necessary.
- Extend the existing `data-motion-*` vocabulary only when the repository-wide audit proves it is needed. Do not add section-specific observer implementations, duplicate listeners, per-section mode flags, or wrapper markup that exists only to compensate for an unclear abstraction.
- Section roots own lifecycle only. They must not cause every lower region in a tall section to reveal at once.
- Preserve existing natural layout wrappers and document semantics. Do not invent a generic semantic group that combines headings, descriptions, and buttons merely for animation. Split a target only when one existing visual/layout region spans materially different viewport entry times.
- Product/card cascades trigger independently by current visual row. Cards in an entering row reveal left to right; lower rows remain pending until their own stable trigger enters; responsive reflow must produce the correct current rows.
- `once`: each eligible target reveals once and remains visible.
- `always`: after a target has fully left a buffered observation region, it resets without a visible reverse/hide animation and may replay when re-entering from either scroll direction. Transform changes must not create observer boundary oscillation or flashing.
- First-viewport text may perform its page-load reveal once. LCP/hero/carousel media remains immediately visible and does not wait for scroll reveal.
- Hidden tabs, inactive panels, Swiper content, and dynamically refreshed content register only when visible and must not complete reveal off-screen.
- Motion disabled, `prefers-reduced-motion`, missing `IntersectionObserver`, and no-JavaScript paths keep content immediately visible and usable.
- Preserve the existing merchant controls and meanings for `motion_enabled`, content/media reveal style, motion speed, and reveal behavior. Do not modify merchant-owned `config/settings_data.json` to hide the defect or force `once`.

Expected implementation scope after the audit:

- Shared reveal lifecycle/observer logic in `assets/alpine.components.ui.js` and its existing registration path only if required.
- Reveal capability and replay/reset styling in `tailwind/tailwind.animates.css`, followed by the generated Tailwind build when that source changes.
- Focused section/snippet hook corrections where existing targets are too broad or an animated card needs a stable trigger; do not perform a visual redesign or repository-wide markup rewrite without evidence.
- Update `docs/references/architecture/motion-architecture.md` if the final stable-trigger/animated-target contract changes.

Prohibited scope:

- No ordinary-reveal migration to GSAP/ScrollTrigger, new dependency, per-section timeline, or duplicate observer.
- No changes to dialog, drawer, hover, focus, loading, carousel-control, or other state/micro-interaction motion unless a direct regression is proven.
- No motion settings beyond the owner-approved Slide options and media default change above; no intensity control, media Rise, typography/layout change, or unrelated section cleanup.
- No edits to `config/settings_data.json`, `templates/*.json`, merchant content, uploaded media, color schemes, vendor assets, or generated CSS by hand.

Acceptance matrix:

- Featured Products with at least two visual rows at 375 / 768 / 1280: each row cascades independently; slow/fast scrolling down and up produces no earlier-row flash, replay loop, or cross-row trigger.
- Repeat the Featured Products test in both `once` and `always`; `always` replays only after complete buffered exit and re-entry from either direction, without a visible reverse reset.
- Representative long sections: lower visual regions do not animate before their own viewport entry, while naturally compact content blocks remain coherent.
- Featured Products tabs, Collection/Search product grids, Product Recommendations, and Swiper-backed card surfaces register only currently visible targets and remain correct after tab/section refresh and responsive reflow.
- First viewport: critical media is visible immediately; allowed text reveal does not create an LCP blank state or pre-init flash.
- Theme Editor select/reorder previews only the relevant section without multiplying observers or listeners.
- Motion disabled, reduced motion, no `IntersectionObserver`, and JavaScript-disabled storefronts show all critical content; keyboard, focus, links, forms, and controls remain unaffected.
- Verify observer/listener cleanup and absence of duplicate callbacks after section reloads.

Completion validation included targeted runtime instrumentation and rendered-state evidence for trigger/replay behavior, `node --check` for modified JavaScript, `npm.cmd run build:tw`, Shopify MCP `validate_theme`, `npm.cmd run lint`, `npm.cmd test`, and `git diff --check`. Owner storefront approval was recorded on 2026-07-28; keep the implementation and this acceptance record together in the owner commit.

Global coverage closure (2026-07-28; committed in `045b9e8`): all Package K review blockers were implemented. The five merchant settings reach eligible ordinary reveal/copy targets; content below tall media now observes its own position across product, blog, promo, category, collection, philosophy, testimonial, Footer, and comparable layouts. Featured Products collection copy is connected, card rows use current visual rows, and Section Rendering/tab/Swiper/resize relayout remains inside the shared lifecycle.

Control and stability closure: purchase controls, forms, tab/filter/pagination triggers, accordion/slider/carousel controls, thumbnails, zoom/navigation controls, arbitrary long RTE bodies, and explicit conversion/static surfaces are outside ordinary reveal ownership. No final node combines `data-motion-bound` with an animated reveal/copy hook, and no form/control is nested below an ordinary reveal/copy target. Parent/child image reveal stacking was removed.

Runtime closure: ordinary targets sharing one stable bound are aggregated behind one callback; nearest-section ownership, current-row cascade, buffered `always` reset, page-load queue release, stale-rAF invalidation, hidden/clip-visible registration, and document-end Footer recovery are implemented. The first registration marks only actual viewport-visible/clip-visible targets as runtime critical so they never start transparent or clipped; fixed critical heroes may opt in explicitly. Rotating Badge, Before/After automatic movement, marquees, carousel autoplay, and Flip Digit now follow the applicable page-motion/reduced-motion policy.

Review result: runtime and Liquid/CSS architecture reviews report no Package K blockers. Static topology checks pass with zero same-node bound/reveal combinations and zero form/control elements under ordinary reveal/copy ancestors. Shopify MCP validation of all modified theme artifacts passed. Final validation after documentation closure also passed: Tailwind build, JavaScript syntax checks, `npm.cmd run lint`, `npm.cmd test` (`137` files, `0` offenses), targeted Prettier, and `git diff --check`.

Final parameter tune (2026-07-28; committed in `045b9e8`): speed tiers shifted up after storefront review found previous Slow matched the expected Normal feel. Final timing: Fast `820 / 480 / 130`, Normal (default) `1080 / 620 / 170`, Slow `1340 / 760 / 210` (step `+260 / +140 / +40`). Easing unchanged: `--motion-reveal-ease: cubic-bezier(0.25, 0.4, 0.4, 1)`. CSS fallbacks use Normal `1080ms / 620ms / 170ms`; JS cascade stagger fallback is `170`. Docs table in `motion-architecture.md` matches. Timing only — no reveal logic, observers, hooks, or amplitude changes. The owner accepted the final storefront feel and reported no remaining Package K issue.

The detailed coverage matrix and stable exceptions live in `docs/references/architecture/motion-architecture.md`; `docs/references/architecture/javascript-runtime.md` records the shared-bound, runtime-critical, and document-end recovery rules. Package K's owner review gate is closed. Do not repeat a broad motion matrix unless the submission smoke check, official review, or a reproducible issue exposes a regression.

### Package L — Global Code Risk And Optimization Audit

Status: **owner-reviewed and accepted** (2026-07-30). Audit baseline: `1c01a3c`. Package L audited and classified; it did not implement theme-code fixes. The owner accepted the evidence-backed report, credibility corrections, safe-area record, optimization backlog, and focused `ACCOUNT-COMPONENT-01` follow-up.

Purpose: perform a fresh post-remediation scan for confirmed storefront risks, fragile behavior, architecture drift, unnecessary runtime cost, and narrowly supportable optimization opportunities that the original launch audit or later packages may not cover.

Required audit coverage:

- Historical report credibility: independently re-verify every BLK-01 through BLK-18 and RISK-01 through RISK-08 policy assertion, repository-evidence claim, remediation status, and completion statement recorded since the original 2026-07-10 audit. Do not inherit this context's conclusions as facts.
- Evidence classification: label each material statement as a current official hard requirement, official guidance, repository fact, interpretation/inference, owner runtime evidence, external/business evidence, or not currently verifiable. Record the primary source, date checked, and exact repository or commit evidence where applicable.
- Interpretation audit: specifically search for requirements that were combined too aggressively or mapped to the wrong implementation field. The known `theme_support_url` versus public contact-form distinction is a required regression case, not an assumption that it was the only error.
- Status reconstruction: compare every accepted package and resolved blocker against Git history, current code, protected-file boundaries, static validation, runtime evidence, and owner approval. Separate "implemented," "statically validated," "owner accepted," and "launch proven."
- JavaScript lifecycle: component registration, Alpine ownership, observers, event listeners, timers, abort behavior, stale async responses, section replacement, Theme Editor reload/select/reorder, dialog/drawer cleanup, and duplicate initialization.
- Runtime architecture: `ThemeEvents`, `ShopifyHttp`, `ShopifySectionRefresher`, cart store ownership, public/private API boundaries, and flat-asset/no-bundler constraints.
- Liquid and HTML: nil/blank handling, invalid empty links/forms, pagination, routes/localization, product/variant context, responsive image use, semantic headings, accessible names, focus order, keyboard fallback, and no-JavaScript behavior.
- CSS and layout: source/generated ownership, conflicting opacity/transform ownership, brittle selectors, hidden critical content, responsive overflow, stacking/focus risks, repeated one-off recipes, and utilities with real consumers versus stale output.
- Performance: duplicated work, avoidable DOM/listener/observer volume, oversized Liquid loops or rendering, image loading/decoding/sizes behavior, LCP ownership, third-party payloads, and network hints. Measure or obtain runtime evidence before recommending a performance fix.
- Explicitly re-audit RISK-01 and RISK-02: `performance.js` is currently requested globally even though its runtime work is limited to debug/design contexts; Swiper, the Alpine Intersect plugin, every Alpine component group, and multiple page-specific stores/utilities are also declared globally from `layout/theme.liquid`.
- For each globally loaded script or third-party library, record actual storefront consumers by template/section, request/transfer/parse/execute cost, cache behavior, initialization ownership, and Theme Editor dynamic-section requirements. Classify it as required core, safely conditionally loadable, potentially removable, or not worth changing based on measured benefit.
- Evaluate conditional/on-demand loading only as an evidence-backed follow-up architecture decision. Any proposal must preserve the flat asset/no-bundler runtime, `defer` ordering, Alpine/store registration, Section Rendering and Theme Editor lifecycle, no-JavaScript behavior, and failure fallback; do not introduce scattered per-section loaders or trade one global request for duplicate/racy loading.
- Maintainability: duplicated implementations that should share an existing abstraction, abstractions that have accumulated divergent flags, dead registrations/assets/code with proof of no consumers, and documentation that no longer matches runtime behavior.
- Representative surfaces: Home, Product, Collection, Search, Cart, Blog, Article, List collections, Pages, Contact, Password, Gift card, Header/Footer groups, drawers/dialogs, Theme Editor, mobile layouts, and localization paths.

Audit method and evidence standard:

- Start from a clean committed baseline and record the exact commit.
- Use `agent-router` and `orchestrate-agents` for the credibility review: assign independent read-only work for current Shopify official-policy verification, repository/Git evidence reconstruction, and a verifier review of disputed mappings. The primary agent resolves disagreements against primary evidence; agents do not average conclusions or approve their own findings.
- Run repository inventories and existing deterministic checks first; inspect discoverable facts before raising questions.
- Use targeted storefront/browser/runtime checks only where static evidence cannot prove behavior.
- Classify every finding by severity (`blocker`, `warning`, or `suggestion`), ownership (`code`, `merchant configuration/content`, `business`, `Shopify/vendor`, or `measurement`), affected surfaces, reproduction/evidence, and smallest safe remediation boundary.
- Separate confirmed defects from optimization candidates and from items needing measurement. Do not present preference, speculative micro-optimization, or visual taste as a defect.
- For duplication, prefer the smallest existing shared contract. Do not propose abstraction merely because two snippets look similar; require shared semantics and lifecycle.
- For dead code or assets, prove the absence of Liquid, JavaScript, CSS, schema, template, runtime, and build-pipeline consumers before recommending removal.
- Re-check current Shopify guidance through Shopify Dev MCP only for requirements whose interpretation or currency matters.

Required deliverable:

- A credibility matrix for every BLK/RISK and accepted package showing the original claim, current classification, official source or repository evidence, confidence, discovered correction, and remaining proof needed.
- A concise audit report with confirmed findings ordered by severity, exact file evidence, runtime evidence where needed, regression risk, and recommended next action.
- A separate list of disproven/safe areas so future agents do not repeat the same investigation.
- A ranked optimization backlog showing expected benefit, evidence strength, effort, and rollback domain.
- Each accepted code fix becomes its own focused follow-up package or prompt. Do not turn Package L itself into a mixed implementation batch.
- Update this context only after the owner reviews the audit conclusions.

Prohibited scope:

- No automatic refactor, formatting sweep, dead-code deletion, dependency change, framework change, visual redesign, or broad abstraction rewrite.
- No edits to `config/settings_data.json`, `templates/*.json`, merchant content, uploaded media, navigation, color schemes, theme identity, or business-owned documentation/support data without separate explicit authorization.
- No manual edits to generated or vendor assets, and no speculative Lighthouse code fixes.
- Do not mix Package K motion implementation, Package G2 copy, Package H metadata, or either Package I phase into this audit.

Completion gate: **passed by owner** (2026-07-30). A clean lint/Theme Check result remains baseline evidence only; it does not prove runtime, accessibility, performance, lifecycle, or fresh-install readiness.

Accepted audit conclusions:

- Git status reconstruction: Packages A through K, G2, H, I, and the accepted cart/product-card follow-ups have implementation commits. Package I is committed in `1c01a3c`. Recorded static validation and owner acceptance prove package history, not final launch readiness.
- Policy classification: BLK-01 through BLK-12 and BLK-14 have current hard-requirement foundations, but several detailed acceptance criteria are repository QA standards or implementation inferences rather than verbatim Shopify requirements. BLK-13, BLK-15, and BLK-16 mix code, guidance, clean-install, release, and business evidence and must not be described as fully launch-proven from commits alone.
- Support mapping correction: `theme_support_url` is not required to equal the public contact-form URL. The public support contact form, documentation/listing links, and two-business-day operation remain separate BLK-17 evidence.
- Install-state correction: authentic demo content and no Lorem Ipsum are hard requirements. Exact placeholder-family selection, deterministic variation, and shared-frame styling are accepted project QA/design contracts. One `Ceylune` preset means the absent `/listings` directory is compliant; Shopify requires it only for themes with multiple presets.
- Link-policy correction: Shopify's current wording says any link in code to a Shopify domain requires `rel="nofollow"`; the previous rendered-anchor-only boundary is a repository interpretation, not verified official wording. No current rendered Shopify-domain link defect was confirmed after Package J.
- Resolved follow-up: BLK-19's mandatory `<shopify-account>` Header component was implemented and owner-accepted through `ACCOUNT-COMPONENT-01`.
- Runtime safety: no application `fetch()` outside `assets/https.js`, manual section replacement outside `ShopifySectionRefresher`, dead `Components.register()` binding, empty/hash link, inline DOM handler, or confirmed high-risk cleanup defect was found in the audited static paths.
- Runtime documentation: `docs/references/architecture/javascript-runtime.md` omits `dialog-motion.js` and `drawer-motion.js` from the documented load order. This is documentation drift, not a confirmed runtime-order failure.

Accepted optimization backlog:

1. Measure normal storefront and Theme Editor request, transfer, parse, execution, cache, long-task, and Lighthouse behavior before approving any global asset split.
2. Treat globally requested `performance.js` as the smallest conditional-loading candidate only if normal, `debug=true`, and Shopify design-mode tests prove the diagnostic path remains available.
3. Do not split Swiper, Alpine component groups, stores, or registries without measured benefit and a separately approved architecture package that preserves defer order and dynamic-section behavior.
4. Do not stress-test overlapping cart mutations, section refresh, dialog/drawer focus, or Theme Editor lifecycle without a reproduced failure or reviewer request; static review did not prove a defect.

Package L's focused `ACCOUNT-COMPONENT-01` follow-up is owner-reviewed and accepted. BLK-17, BLK-18, RISK-03, RISK-04, and RISK-05 remain external, runtime, business, design, or evidence gates.

### ACCOUNT-COMPONENT-01 — Shopify Account Header Component

Status: **owner-reviewed and accepted** (2026-07-30).

Implementation boundary:

- Replaced the shared Header's ordinary account link with Shopify's `<shopify-account>` component, gated by `shop.customer_accounts_enabled` and using the canonical `customer-account-main-menu` menu.
- Preserved the existing signed-out account icon through a non-interactive slot; retained the mobile-drawer account link as a separate auxiliary route.
- After owner visual review, strengthened only the mobile menu's title/footer separators using the active foreground token at 30% opacity; this avoids the default dark scheme's near-invisible dark-on-dark border while remaining color-scheme aware.
- Added no JavaScript, setting, translation, merchant-owned configuration, or vendor asset change. Tailwind output was regenerated from source for the new scoped utilities.

Static validation: Shopify MCP theme validation passed for `sections/header.liquid`, `snippets/header-mobile-menu-drawer.liquid`, and `assets/tailwind.output.css`; Tailwind build and `npm.cmd run lint` passed; `npm.cmd test` inspected 137 files with 0 offenses; `npm.cmd run format:check` and `git diff --check` passed.

Manual gate: **passed by owner for the directly available storefront states** (2026-07-30), covering the account sheet, shared desktop/mobile Header placement, mobile-drawer auxiliary account area, and refined separators. Do not add a separate account-mode matrix unless the submission smoke check, official review, or a reproducible issue exposes a regression.

### External And Evidence Gates

- BLK-17: public documentation, support form, support policy, and operating readiness.
- BLK-18: owner smoke is complete; only the compact submission check, official Lighthouse thresholds, and Shopify review feedback loop remain.
- RISK-05: asset and dependency provenance/business ownership decisions.

These are not ordinary theme-code packages and must not be marked resolved by static implementation commits.

### Evidence-First Risks Outside The Code Packages

RISK-01, RISK-02, RISK-03, RISK-04, and RISK-08 remain audit findings. Do not code-fix them speculatively. Measure or obtain the required business/design decision first, then create a separately approved package only if the documented Theme Store requirement proves a necessary change.

## 12. Prompt Generation Rules

When the user asks for implementation prompts:

- Generate one prompt per current combined package above; do not create a single uncontrolled “fix everything” prompt and do not mechanically generate one prompt per BLK ID.
- Include purpose, exact scope, repository evidence, allowed files, prohibited files, merchant-owned authorization, acceptance criteria, and validation commands.
- Require agents to inspect discoverable repository facts before asking questions.
- Require Shopify Dev MCP for current Liquid/theme behavior.
- Preserve schema IDs, block types, section types, preset names, and storefront behavior unless the named blocker requires an explicitly approved change.
- Do not allow redesign, broad Liquid extraction, dependency additions, framework changes, or generated/vendor file edits.
- Require a focused manual preview matrix before implementation and fresh runtime evidence afterward.
- Require implementation to remain uncommitted until the user explicitly approves the package after storefront/Theme Editor review.
- Prohibit starting the next package while the current package is unapproved or the worktree contains unresolved package changes.
- Require a remaining-risk report after each package.
- If a prompt touches `templates/*.json`, color schemes, preset content, demo copy, or uploaded media, explicitly state whether merchant-owned changes are authorized.

## 13. Final Definition Of Done

The theme may be called “ready to submit” only when all conditions are true:

- Every BLK item is marked resolved with file evidence and validation evidence, or formally reclassified with authoritative proof.
- `npm.cmd run lint` passes.
- `npm.cmd test` passes with 0 offenses.
- Required Tailwind/SVG builds are current.
- Fresh install contains no prohibited filler or broken store-specific asset references.
- Theme editor settings are clear, consistent, live-updating, and compliant.
- Performance averages at least 60 on required pages/device classes.
- Accessibility averages at least 90 on required pages/device classes.
- Owner storefront smoke is accepted, the compact submission check passes, and all Shopify reviewer findings are addressed.
- Demo store matches the submitted preset and uses authentic licensed content.
- Final theme/preset names, version, release notes, listing copy, screenshots, and reviewer instructions are ready.
- Public merchant documentation, FAQ, support form, and two-business-day support process are live.
- License/provenance ledger is complete.
- Theme Store exclusivity and Partner account submission requirements are confirmed.
- No known launch blocker is deferred as “post-launch”.
- Final review conclusion changes from `REQUEST CHANGES` to `APPROVE` based on fresh evidence, not assumption.

## 14. Official Shopify Sources Used For This Audit

- Theme Store requirements:
  - https://shopify.dev/docs/storefronts/themes/store/requirements
- Theme review process and submission:
  - https://shopify.dev/docs/storefronts/themes/store/review-process/submit-theme
- Common theme rejections:
  - https://shopify.dev/docs/storefronts/themes/store/review-process/common-theme-rejections
- Testing a theme for Theme Store:
  - https://shopify.dev/docs/storefronts/themes/store/test-theme
- Theme Store listing requirements:
  - https://shopify.dev/docs/storefronts/themes/store/review-process/listings
- Performance best practices and minimum score:
  - https://shopify.dev/docs/storefronts/themes/best-practices/performance
- Accessibility best practices:
  - https://shopify.dev/docs/storefronts/themes/best-practices/accessibility

Policies can change. Before final submission, re-check the current official pages and update this document if a requirement has changed.
