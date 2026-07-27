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

Official expectation:

- Theme name and presets must be unique, distinct, 1–2 words, and under 30 characters.
- Theme metadata must identify the real theme, author, version, documentation, and support destination.
- One preset must use the parent theme name.

Repository evidence:

- `config/settings_schema.json:4-8` currently declares:
  - theme name: `Skeleton`.
  - version: `0.1.0`.
  - author: `Shopify`.
  - Shopify Help as documentation.
  - Shopify Support as support URL.

Risk:

- Misrepresentation of authorship.
- Name collision/confusion with Shopify’s Skeleton base.
- Missing own documentation and support operation.
- Direct pre-launch rejection.

Acceptance criteria:

- Final theme and preset names are selected and checked against the Theme Store.
- Real author/Partner identity and semantic version are recorded.
- Documentation URL points to public merchant documentation.
- Support URL points to a public support form, not Shopify Support.
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

Status: **deferred by owner** (2026-07-24). This finding was explicitly removed from the reduced Package G scope and remains unresolved. Its code-owned schema/locale work is planned for Package G2; merchant-owned template defaults belong to Package I only after explicit authorization.

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

Official expectation:

- Shopify expects the theme to be fully tested before submission.
- Poorly tested themes can be rejected without full review.

Repository evidence:

- Project context previously recorded no complete manual launch QA.
- This audit produced static evidence only.
- No current Lighthouse benchmark report, browser matrix, demo-store audit, keyboard report, or licensing ledger was available.

Risk:

- Rejection even after static blockers are fixed.
- False confidence from 0 Theme Check offenses.

Acceptance criteria:

- Every item in sections 7 and 8 has a dated result, target URL/store, viewport/browser, evidence link, and Pass/Fail.
- All failures are classified as theme code, merchant configuration, content, uploaded asset, Shopify/app/vendor, or measurement noise before action.

Ownership:

- Mixed: theme code, merchant configuration/content, external operations, and QA.

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

## 7. Mandatory Runtime QA Matrix

Record every test with date, theme ID/preview URL, test data, browser/device, result, evidence, owner, and follow-up issue.

### Product And Purchase Flow

- Product with one variant.
- Product with multiple option groups and unavailable combinations.
- Sold-out product and sold-out variant.
- Product with compare-at price.
- Product with price-varying variants.
- Product with unit pricing.
- Product with selling plan.
- Gift card product with recipient fields.
- Product with pickup availability at multiple locations.
- Product with image, video, external video, and 3D model.
- Variant image selection updates gallery.
- Product form works without JavaScript.
- Dynamic checkout default enabled and brand styling unmodified.
- Shop Pay Installments/payment terms visible when eligible.

### Featured Product And Quick View

- Featured product supports the same required buying data appropriate to its form.
- App blocks and Custom Liquid render in main and featured product.
- Quick view handles rich media if it presents rich media.
- Quick view variant, quantity, add-to-cart, error, and focus-return behavior.
- No stale variant state between repeated openings.

### Cart Page And Drawer

- Empty cart.
- Single and multiple line items.
- Variant option values.
- Line-item properties.
- Unit prices.
- Selling plans.
- Line and cart discounts.
- Quantity update affecting multiple totals.
- Remove item.
- Cart note.
- Accelerated checkout.
- Checkout button.
- Tax-inclusive and non-tax-inclusive stores.
- Network failure and loading states.
- JavaScript-disabled cart page fallback.
- Cart page and drawer state synchronization.

### Collection, Search, Blog, And Article

- Empty collection.
- Mixed image aspect ratios.
- Sale, sold-out, price-range, and unit-price product cards.
- Sort and every Search & Discovery facet type.
- Filter drawer, horizontal, and vertical variants where supported.
- Pagination, clear all, browser back/forward, copied filtered URL.
- Empty search.
- Product/article/page search types.
- Search facets on product results.
- Blog excerpt fallback.
- Comments disabled, enabled, moderation enabled/disabled.
- Comment success, error, pagination.

### Header, Footer, Localization, And Overlays

- Multi-level navigation with mouse, touch, keyboard, and Escape.
- Mobile menu.
- Country and language selectors.
- Follow on Shop.
- Predictive search.
- Search overlay.
- Cart drawer.
- Newsletter overlay.
- Toast, lightbox, dialog, drawer, media modal, and sticky header z-index.
- Focus moves into and returns from every transient UI.
- Hidden UI contains no reachable controls.

### Theme Editor

- Add, remove, reorder, duplicate, select, and deselect sections/blocks.
- Settings update live without full reload where expected.
- App blocks and Custom Liquid blocks can be added.
- Header/footer group behavior.
- Fresh install default menus.
- Logo portrait and landscape aspect ratios.
- Focal points.
- Color schemes.
- Motion settings.
- Section reload teardown: no duplicate listeners, Swipers, observers, or dialogs.

### Responsive And Motion

- Required widths: 375px, 768px, and 1280px.
- Additional stress widths around breakpoints.
- 200% zoom.
- Long translated text and RTL.
- Motion enabled/disabled.
- `prefers-reduced-motion`.
- Critical above-the-fold content visible without waiting for JavaScript or animation.

## 8. Accessibility, Performance, Browser, And No-JS Gates

### Accessibility

Required evidence:

- Lighthouse accessibility average at least 90 on home/product/collection for desktop and mobile.
- Full keyboard path for navigation, product, media, cart, filters, search, tabs, drawers, dialogs, newsletter, and forms.
- Visible focus.
- DOM and focus order alignment.
- Accurate accessible names and states.
- Unique input IDs and matching labels.
- Valid HTML.
- All images have `alt`.
- Body text contrast at least 4.5:1.
- Large text and non-text UI contrast at least 3:1.
- Pointer targets at least 24 x 24 CSS px, except valid exceptions.
- Headings remain visually distinguishable and semantically appropriate.
- Screen-reader announcements for dynamic status/error/success changes.

Suggested evidence:

- Lighthouse CI.
- axe or equivalent automated scan.
- Manual keyboard and screen-reader smoke test.
- HTML validation on representative rendered pages.

### Performance

Required evidence:

- Average performance at least 60 for home/product/collection on both desktop and mobile with populated data.
- Repeat runs to separate stable defects from variance.
- Network request, unused JS/CSS, LCP, CLS, INP/TBT proxy, image loading, font loading, and third-party payload review.

Classification rule:

Every performance finding must be classified as:

1. Theme code.
2. Merchant configuration.
3. Merchant content/copy.
4. Uploaded asset/media.
5. Shopify platform/app/vendor.
6. Measurement noise.

Do not code-fix non-code findings without authorization.

### Browser And Webview Matrix

Required support:

- Safari: latest two macOS releases.
- Chrome: latest three releases on macOS and Windows.
- Firefox: latest three releases on macOS and Windows.
- Edge: latest two Windows releases.
- Mobile Safari: latest two iOS releases.
- Chrome Mobile: latest three Android and iOS releases.
- Samsung Internet: latest two Android releases.
- Instagram, Facebook, and Pinterest webviews: latest Android and iOS release.

Test browsing, product selection, add to cart, cart editing, and checkout handoff.

### No-JavaScript Gate

At minimum verify:

- Navigation remains usable.
- Product information remains visible.
- Product form and add to cart work.
- Cart page can reach checkout.
- Critical first-viewport content is not hidden behind Alpine/animation initialization.

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

Status: **owner-reviewed and accepted** (2026-07-24). The reduced Package G implementation and this acceptance record belong in the same owner commit. BLK-15 remains deferred and unresolved.

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

Scope: the code-owned portion of BLK-15 only. Status: planned; do not start until Package G is committed and the worktree is clean.

- Audit and correct merchant-facing English labels, setting info, section/block names, terminology, spelling, sentence case, active voice, action labels, ampersands, and broken schema help text in theme schema and schema locale sources.
- Preserve schema IDs, block types, section types, presets, storefront rendering, and merchant configuration.
- Do not modify `templates/*.json`, `config/settings_data.json`, demo content, uploaded media references, color schemes, or the merchant-owned/default-content portion of BLK-15; those belong to Package I after explicit authorization.

Manual gate: Theme Editor review of the affected settings for grouping, clarity, terminology, live updates, and absence of missing translation keys. This package is editorial/schema compliance, not a visual redesign.

### Package H — Theme Identity And Support Metadata

Scope: BLK-13 only. Status: blocked on business input until the user supplies the final theme name, author/Partner identity, version, documentation URL, and support URL.

Do not invent or temporarily substitute these values.

### Package I — Default Install State And Preset Content

Scope: BLK-16, the merchant-owned template/default-content portion of BLK-15, and `PLACEHOLDER-VARIETY-01`.

- Replace prohibited filler and incoherent defaults with an approved, authentic preset content direction.
- Remove or replace store-specific uploaded-image dependencies so a fresh install remains complete without the current shop's files.
- Add context-aware variation using Shopify's existing `placeholder_svg_tag` families through the shared `placeholder_key` contract; do not add custom placeholder image assets or random runtime selection.
- Product/card contexts cycle deterministically through `product-1` to `product-6`; collection contexts through `collection-1` to `collection-6`; editorial contexts use `lifestyle-1` / `lifestyle-2`; generic image-picker and hero fallbacks retain `image` unless an approved industry preset requires another official family.
- Real images always win. Placeholder changes must preserve the global image ratio, fit, crop, focal-point, responsive image, and card-layout contracts.
- Shopify's apparel-specific color placeholders remain out of scope until the final preset industry direction explicitly calls for them.

Required authorization: exact `templates/*.json` fields, preset content, uploaded media references, resource handles, disabled states, and any color-scheme changes must be approved before editing.

Manual gate: fresh install on a clean store; all required templates; empty product, collection, blog/article, hero, and generic image-picker states; deterministic placeholder variation across reloads; real-image precedence; Theme Editor integrity; demo parity; 375 / 768 / 1280 presentation; and proof that structure and unrelated merchant configuration did not change.

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

Status: **planned from owner-observed storefront behavior** (2026-07-27). This is the next confirmed storefront code package. Define and review its implementation boundary before changing motion code; do not combine it with Package G2, H, or I.

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
- No new merchant setting, animation preset expansion, visual restyling, typography/layout change, or unrelated section cleanup.
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

Required validation: targeted runtime instrumentation or rendered-state evidence for trigger/replay behavior, `node --check` for modified JavaScript, `npm.cmd run build:tw` when Tailwind source changes, Shopify MCP `validate_theme`, `npm.cmd run lint`, `npm.cmd test`, and `git diff --check`. Leave implementation uncommitted until owner storefront approval.

### Package L — Global Code Risk And Optimization Audit

Status: **planned as review-only** (2026-07-27). Run after Package K and the remaining approved code-bearing work are settled on a clean baseline, before the final BLK-18 evidence gate. This package audits and classifies; it does not implement a repository-wide cleanup.

Purpose: perform a fresh post-remediation scan for confirmed storefront risks, fragile behavior, architecture drift, unnecessary runtime cost, and narrowly supportable optimization opportunities that the original launch audit or later packages may not cover.

Required audit coverage:

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
- Run repository inventories and existing deterministic checks first; inspect discoverable facts before raising questions.
- Use targeted storefront/browser/runtime checks only where static evidence cannot prove behavior.
- Classify every finding by severity (`blocker`, `warning`, or `suggestion`), ownership (`code`, `merchant configuration/content`, `business`, `Shopify/vendor`, or `measurement`), affected surfaces, reproduction/evidence, and smallest safe remediation boundary.
- Separate confirmed defects from optimization candidates and from items needing measurement. Do not present preference, speculative micro-optimization, or visual taste as a defect.
- For duplication, prefer the smallest existing shared contract. Do not propose abstraction merely because two snippets look similar; require shared semantics and lifecycle.
- For dead code or assets, prove the absence of Liquid, JavaScript, CSS, schema, template, runtime, and build-pipeline consumers before recommending removal.
- Re-check current Shopify guidance through Shopify Dev MCP only for requirements whose interpretation or currency matters.

Required deliverable:

- A concise audit report with confirmed findings ordered by severity, exact file evidence, runtime evidence where needed, regression risk, and recommended next action.
- A separate list of disproven/safe areas so future agents do not repeat the same investigation.
- A ranked optimization backlog showing expected benefit, evidence strength, effort, and rollback domain.
- Each accepted code fix becomes its own focused follow-up package or prompt. Do not turn Package L itself into a mixed implementation batch.
- Update this context only after the owner reviews the audit conclusions.

Prohibited scope:

- No automatic refactor, formatting sweep, dead-code deletion, dependency change, framework change, visual redesign, or broad abstraction rewrite.
- No edits to `config/settings_data.json`, `templates/*.json`, merchant content, uploaded media, navigation, color schemes, theme identity, or business-owned documentation/support data without separate explicit authorization.
- No manual edits to generated or vendor assets, and no speculative Lighthouse code fixes.
- Do not mix Package K motion implementation, Package G2 copy, Package H metadata, or Package I preset/default-content work into this audit.

Completion gate: Package L is complete when the evidence-backed report and ranked follow-up list are owner-reviewed. A clean lint/Theme Check result is baseline evidence only; it does not prove the audit found no runtime, accessibility, performance, lifecycle, or fresh-install risks.

### External And Evidence Gates

- BLK-17: public documentation, support form, support policy, and operating readiness.
- BLK-18: complete runtime, accessibility, performance, browser, webview, no-JavaScript, demo, and fresh-install evidence.
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
- Manual accessibility, purchase, cart, search/filter, media, localization, responsive, motion, no-JS, browser, and webview tests pass.
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
