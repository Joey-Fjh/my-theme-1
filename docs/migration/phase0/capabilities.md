# Business capability inventory

Commit `926dddb`. User-visible behavior is what a shopper or merchant experiences; implementation cites are for rewrite acceptance.

## Capability summary

| ID | Domain | Proposal |
|----|--------|----------|
| CAP-01 | Global shell, tokens, motion gate | rewrite |
| CAP-02 | Announcement bar | rewrite |
| CAP-03 | Header, mega menu, mobile drawer | rewrite |
| CAP-04 | Search overlay & predictive search | rewrite |
| CAP-05 | Cart drawer & cart page | rewrite |
| CAP-06 | Footer | rewrite |
| CAP-07 | Newsletter banner & popup overlay | rewrite |
| CAP-08 | Product detail (variants, buy, pickup, comparison) | rewrite |
| CAP-09 | Product media (gallery, modal, magnifier) | rewrite |
| CAP-10 | Featured product section | rewrite |
| CAP-11 | Product recommendations | rewrite |
| CAP-12 | Collection listing, filters, sort, pagination | rewrite |
| CAP-13 | Search results page | rewrite |
| CAP-14 | Blog & article | rewrite |
| CAP-15 | Marketing / content sections | rewrite |
| CAP-16 | About & contact pages | rewrite |
| CAP-17 | Password storefront | keep (minimal) |
| CAP-18 | Gift card | rewrite |
| CAP-19 | 404 page | rewrite |
| CAP-20 | Localization & country/language | rewrite |
| CAP-21 | Toasts, dialogs, accordions, shared UI | rewrite |
| CAP-22 | Swiper carousels (section Components) | rewrite |

---

### CAP-01 — Global shell, design tokens, motion

| Field | Detail |
|-------|--------|
| **Files** | `layout/theme.liquid`, `snippets/css-variables.liquid`, `snippets/meta-tags.liquid`, `assets/base.js`, `assets/alpine.components.ui.js` (`motionRevealSection`) |
| **User-visible behavior** | Every page loads shared CSS variables, skip link, header/footer groups, and overlay group; body `data-motion-enabled` and reveal datasets control scroll animations (`theme.liquid:73–82`). Header/announcement heights become CSS variables for sticky layout (`base.js:67–82`). |
| **JS dependencies** | `Base`, `ThemeEvents`, `motionRevealSection` |
| **Theme Editor** | `Base.onShopifySectionLayout` rebinds resize targets on section load/reorder/unload (`base.js:32–34`). |
| **No-JS** | Main content, header, and footer HTML render; skip link works (`theme.liquid:84–86`). Motion classes may not animate. |
| **Proposal** | **rewrite** — replace with skeleton import-map runtime and token layer while preserving merchant motion settings semantics. |
| **Motion settings contract** (added from `docs/migration/step1/retention-audit.md`) | Merchant settings `motion_enabled`, `content_reveal_style`, `media_reveal_style`, `motion_speed`, `reveal_behavior` (`config/settings_schema.json`) keep their meaning; see `docs/project.md` (Theme-Specific Contracts). Acceptance: with `motion_enabled` off, no section reveal, media reveal, or scroll motion plays and content shows immediately, while hover, focus, dropdown, dialog, drawer, and loading transitions still run and respect `prefers-reduced-motion`; `motion_speed` changes reveal timing only; `reveal_behavior` `once` vs `always` is honored. |

### CAP-02 — Announcement bar

| Field | Detail |
|-------|--------|
| **Files** | `sections/announcement-bar.liquid`, `snippets/localization-switcher.liquid`, `snippets/social-icons.liquid` |
| **User-visible behavior** | Rotating announcements with optional link; optional social and country/language selectors in bar (`announcement-bar.liquid` schema settings in `header-group.json:37–43`). |
| **JS dependencies** | `Components.register('announcement-bar')`, Swiper (`announcement-bar.liquid:108`) |
| **Theme Editor** | Standard `Components` section load/unload (`base.js:426–436`). |
| **No-JS** | First slide text visible; carousel may not rotate. |
| **Proposal** | **rewrite** — keep merchant block types `announcement`. |

### CAP-03 — Header & navigation

| Field | Detail |
|-------|--------|
| **Files** | `sections/header.liquid`, `snippets/header-dropdown-menu.liquid`, `snippets/header-dropdown-super-menu.liquid`, `snippets/header-mobile-menu-drawer.liquid`, `assets/alpine.components.header.js` |
| **User-visible behavior** | Logo, desktop super menu or dropdown, mobile drawer, search/cart triggers opening `$store.dialog` (`header.liquid:51`, `:120–131`), cart count badge from `$store.cart` (`:137–153`). Sticky header behavior via `stickyHeader`. |
| **JS dependencies** | `dropdown`, `mobileMenuDrawer`, `stickyHeader`, `$store.dialog`, `$store.cart`, `ThemeEvents.HEADER_MENU_ACTIVE_CHANGED` |
| **Theme Editor** | Menu structure from merchant `menu` setting (`header-group.json:53`); drawer reopens via dialog store. |
| **No-JS** | Nav links and logo remain usable; drawers/dialogs may not open. |
| **Proposal** | **rewrite** — preserve `menu_type: super` merchant settings. |

### CAP-04 — Search overlay

| Field | Detail |
|-------|--------|
| **Files** | `sections/search-overlay.liquid`, `snippets/search-predictive-panel.liquid`, `snippets/predictive-search-product-card.liquid`, `assets/alpine.components.search.js` |
| **User-visible behavior** | Search drawer opens from header; predictive results as user types; keyboard escape closes (`search-overlay.liquid:16–24`). |
| **JS dependencies** | `predictiveSearch`, `ShopifyHttp`, `$store.dialog` |
| **Theme Editor** | Overlay section in `overlay-group.json`; settings `search_result_limit`, `drawer_position`. |
| **No-JS** | Link to `/search` may still work from fallback links if present. |
| **Proposal** | **rewrite** |

### CAP-05 — Cart drawer & cart page

| Field | Detail |
|-------|--------|
| **Files** | `sections/cart-overlay.liquid`, `sections/cart.liquid`, `snippets/cart-summary-accordion.liquid`, `assets/alpine.store.cart.js`, `assets/alpine.components.overlays.js` |
| **User-visible behavior** | Drawer shows line items, discounts, checkout CTA; quantity changes and remove update cart without full page reload (`cart-overlay.liquid:208–298`). Full cart page supports note and line updates (`cart.liquid:264–321`). |
| **JS dependencies** | `$store.cart`, `ShopifyHttp`, `ShopifySectionRefresher.render` (`alpine.store.cart.js:153–191`), `cartOverlay` / `cartPage` |
| **Theme Editor** | Cart overlay section settings in `overlay-group.json:22–27`. |
| **No-JS** | `/cart` page form submission still possible on cart template. |
| **Proposal** | **rewrite** — critical for Theme Store AJAX cart behavior. |

### CAP-06 — Footer

| Field | Detail |
|-------|--------|
| **Files** | `sections/footer.liquid`, `snippets/link.liquid`, `snippets/social-icons.liquid` |
| **User-visible behavior** | Brand column, link columns, optional background image, CTA link (`footer-group.json:40–49`). |
| **JS dependencies** | `motionRevealSection` optional (`footer.liquid:4`) |
| **Theme Editor** | Block type `link_column` per column. |
| **No-JS** | Fully readable links and text. |
| **Proposal** | **rewrite** |

### CAP-07 — Newsletter capture

| Field | Detail |
|-------|--------|
| **Files** | `sections/newsletter-banner.liquid`, `sections/newsletter-overlay.liquid`, `assets/alpine.components.overlays.js` |
| **User-visible behavior** | Inline banner signup; timed popup on home for visitors with delay/expiry settings (`overlay-group.json:52–63`). Success/error messages from section settings. |
| **JS dependencies** | `newsletterBanner`, `newsletterOverlay`, `ShopifyHttp` (customer API) |
| **Theme Editor** | Overlay blocks `text`, `heading`, `form`. |
| **No-JS** | Banner form may POST depending on markup; popup hidden. |
| **Proposal** | **rewrite** |

### CAP-08 — Product detail page

| Field | Detail |
|-------|--------|
| **Files** | `sections/product.liquid`, `snippets/product-info-blocks.liquid`, `snippets/product-variant-picker.liquid`, `snippets/buy-buttons.liquid`, `snippets/selling-plan-picker.liquid`, `snippets/pickup-availability-inline.liquid`, `sections/pickup-availability.liquid`, `sections/product-comparison-table.liquid`, `assets/alpine.components.product.js` |
| **User-visible behavior** | Selecting a variant updates price, SKU visibility, inventory notice, gallery slide, URL `?variant=`; unavailable variants disable add-to-cart (`product.json` block layout). Selling plans update price/terms. Pickup availability loads per variant. Comparison table shows metafields/ratings across products. |
| **JS dependencies** | `productLayout`, `VariantPicker`, `ProductPrice`, `BuyButtons`, `PickupAvailability`, `ThemeEvents` product_* events, `ShopifySectionRefresher` for pickup fragment |
| **Theme Editor** | Many section blocks on `product` section (`product.json:16–112`); comparison blocks typed `header`, `price`, etc. |
| **No-JS** | Product form submit with default variant; core product info visible in HTML. |
| **Proposal** | **rewrite** — highest-risk migration slice. |

### CAP-09 — Product media

| Field | Detail |
|-------|--------|
| **Files** | `snippets/product-gallery.liquid`, `snippets/product-gallery-carousel.liquid`, `snippets/product-gallery-grid.liquid`, `snippets/product-gallery-thumbnails.liquid`, `snippets/product-media-modal.liquid`, `snippets/image-magnifier.liquid`, `snippets/image-lightbox.liquid`, `assets/alpine.components.product-media.js` |
| **User-visible behavior** | Gallery layouts (carousel/grid/stacked), zoom/magnifier, fullscreen modal, video media; variant change scrolls gallery (`PRODUCT_GALLERY_SLIDE_TO_REQUEST`). |
| **JS dependencies** | `productGallery`, `productMediaModal`, `imageMagnifier`, `imageLightbox`, Swiper in carousel mode (`product-media.js:185`) |
| **Theme Editor** | Modal via `$store.dialog` (`product-media-modal.liquid:36–50`). |
| **No-JS** | Primary images still shown per Liquid. |
| **Proposal** | **rewrite** |

### CAP-10 — Featured product (homepage)

| Field | Detail |
|-------|--------|
| **Files** | `sections/featured-product.liquid`, shared product snippets |
| **User-visible behavior** | Single product with subset of PDP blocks (title, price, variants, quantity, buy) on marketing pages (`index.json` featured-product blocks). |
| **JS dependencies** | Same product Alpine stack as CAP-08 |
| **Theme Editor** | Block types mirror PDP subset. |
| **No-JS** | Product info and form fallback. |
| **Proposal** | **rewrite** |

### CAP-11 — Product recommendations

| Field | Detail |
|-------|--------|
| **Files** | `sections/product-recommendations.liquid`, `snippets/product-recommendations-section.liquid`, `assets/alpine.components.product-cards.js` |
| **User-visible behavior** | Related products carousel/grid on PDP with Shopify recommendations API. |
| **JS dependencies** | `relatedProducts`, `productCard`, `ShopifyHttp` |
| **Theme Editor** | Section on `product.json:207`. |
| **No-JS** | Server-rendered recommendations if present in initial HTML. |
| **Proposal** | **rewrite** |

### CAP-12 — Collection & catalog

| Field | Detail |
|-------|--------|
| **Files** | `sections/collection.liquid`, `sections/collections.liquid`, `sections/collection-navigation-items.liquid`, `snippets/filters-drawer.liquid`, `snippets/filter-vertical.liquid`, `snippets/filter-horizontal.liquid`, `snippets/filters-groups.liquid`, `snippets/filters-field.liquid`, `snippets/active-filters.liquid`, `snippets/sort-by-dropdown.liquid`, `snippets/pagination.liquid`, `assets/alpine.components.filters.js`, `assets/alpine.components.pagination.js` |
| **User-visible behavior** | Collection hero, filter drawer/horizontal filters, active filter chips, sort dropdown, paginated product grid; subcollection navigation strip refreshed via Section API (`collection.liquid:575`). |
| **JS dependencies** | `collectionFilters`, `collectionNavigationCatalog`, `collectionFilterField`, `sectionPagination`, `sortByDropdown`, `ShopifyHttp`, `ShopifySectionRefresher` |
| **Theme Editor** | Filter settings in collection section schema. |
| **No-JS** | Full page loads for pagination/filter query params (Shopify native). |
| **Proposal** | **rewrite** |

### CAP-13 — Search results

| Field | Detail |
|-------|--------|
| **Files** | `sections/search.liquid`, `snippets/search-results-tabs.liquid`, `snippets/product-card.liquid` |
| **User-visible behavior** | Tabbed product/article/page results, filters, product cards in grid. |
| **JS dependencies** | `searchFilters`, `tabControl`, `productCard` |
| **Theme Editor** | Section `search` on `search.json`. |
| **No-JS** | Results visible; tabs may degrade to stacked content. |
| **Proposal** | **rewrite** |

### CAP-14 — Blog & article

| Field | Detail |
|-------|--------|
| **Files** | `sections/blog.liquid`, `sections/article.liquid`, `snippets/listing-page-hero-copy.liquid`, `snippets/rte-compact-prose.liquid` |
| **User-visible behavior** | Blog listing with pagination; article template with hero and body content. |
| **JS dependencies** | `sectionPagination` where enabled |
| **Theme Editor** | Standard section settings. |
| **No-JS** | Articles readable. |
| **Proposal** | **rewrite** |

### CAP-15 — Marketing & content sections

| Field | Detail |
|-------|--------|
| **Files** | `sections/slides-show.liquid`, `sections/video-banner.liquid`, `sections/category-grid.liquid`, `sections/scroll-categories.liquid`, `sections/scrolling-icon-with-text.liquid`, `sections/routine-showcase.liquid`, `sections/promo-bannder.liquid`, `sections/promotion-countdown.liquid`, `sections/before-after-comparison.liquid`, `sections/blog-stories.liquid`, `sections/brand-statement.liquid`, `sections/philosophy-section.liquid`, `sections/promise-section.liquid`, `sections/about-stats.liquid`, `sections/google-map.liquid`, `sections/page.liquid`, `sections/custom-liquid.liquid`, `snippets/grid-feature-card.liquid`, `snippets/icon-with-text-item.liquid`, `snippets/media-video.liquid`, `snippets/watermark.liquid`, `snippets/content-icon.liquid`, `snippets/flip-digit.liquid`, `snippets/rotating-badge.liquid`, `snippets/show-more-icon.liquid`, `snippets/starts.liquid`, `snippets/accordion.liquid` (in sections) |
| **User-visible behavior** | Homepage and inner pages compose storytelling sections (heroes, grids, stats, promises, maps, custom liquid). Countdown shows time to date (`promotion-countdown.liquid:30` `countdownTimer`). Before/after slider drags (`before-after-comparison.liquid:103` `x-intersect`). |
| **JS dependencies** | `motionRevealSection`, `countdownTimer`, `beforeAfterComparison`, `mediaVideo`; `Components.register` on `routine-showcase` and `slides-show` (CAP-22; carousel library pending `docs/agent/board.md`) |
| **Theme Editor** | Each section has blocks (e.g. `blog-stories` → `article` blocks). |
| **No-JS** | Text/images/CTA links remain visible; carousels show first slide. |
| **Proposal** | **rewrite** — preserve section types in merchant JSON. |

#### CAP-15 section inventory

| Section | User-visible behavior (acceptance) | JS dependencies | Block types | Template references |
|---------|-----------------------------------|-----------------|-------------|---------------------|
| `slides-show` | Full-width hero slides with headline, caption, CTA, and slide navigation; keyboard moves slides when the carousel is focused (`slides-show.liquid:269–284`). | `motionRevealSection` (`slides-show.liquid:11`); `Components.register` + carousel via CAP-22 (`slides-show.liquid:9`, `:221`) | `slide` (`slides-show.liquid:628`) | `templates/index.json` (`main`, `index.json:630–631`) |
| `video-banner` | Autoplay or click-to-play hero video with overlay copy and optional CTA. | `motionRevealSection` (`video-banner.liquid:62`); inline `playing` state (`video-banner.liquid:84`) | — (settings only) | `templates/index.json` (`video_banner_JejrrE`, `index.json:645`) |
| `category-grid` | Grid of category tiles (collection/product/custom links) with hover treatment. | `motionRevealSection` (`category-grid.liquid:33`) | `item` (`category-grid.liquid:463`) | `templates/index.json` (`category_grid_LU4hyd`, `index.json:632`) |
| `scroll-categories` | Horizontally scrollable category chips/cards. | `motionRevealSection` (`scroll-categories.liquid:8`) | — | `templates/index.json` (`scroll_categories_B8wjNV`, `index.json:634`) |
| `scrolling-icon-with-text` | Marquee of icon+text items; direction and speed from section settings (`scrolling-icon-with-text.liquid:2–14`). | none (CSS marquee) | `item` (`scrolling-icon-with-text.liquid:302`) | `templates/index.json` (`scrolling_icon_with_text_XWFBb9`, `index.json:635`) |
| `routine-showcase` | Routine steps with media; carousel layout on smaller breakpoints. | `motionRevealSection` (`routine-showcase.liquid:37`); `Components.register` + carousel via CAP-22 (`routine-showcase.liquid:35`, `:292`) | — | `templates/index.json` (`routine_showcase_m77bpB`, `index.json:636`) |
| `promo-bannder` | Promo cards with image, copy, and links (typo-stable type name). | `motionRevealSection` (`promo-bannder.liquid:14`) | `card` (`promo-bannder.liquid:366`) | `templates/index.json` (`promo_bannder_QtDDTf`, `index.json:640`) |
| `promotion-countdown` | Countdown to end date with flip-digit display. | `motionRevealSection` (`promotion-countdown.liquid:14`); `countdownTimer` (`promotion-countdown.liquid:30`) | — | `templates/index.json` (`promotion_countdown_pwcKXK`, `index.json:639`) |
| `before-after-comparison` | Draggable before/after image comparison; animates when scrolled into view. | `beforeAfterComparison` (`before-after-comparison.liquid:103`); `motionRevealSection` on wrapper | — | `templates/index.json` (`before_after_comparison_x49tjT`, `index.json:638`); `templates/page.about.json` (`before_after_comparison_eXLb3W`, `page.about.json:170`) |
| `blog-stories` | Row of article cards (image, subtitle, title, link). | `motionRevealSection` (`blog-stories.liquid:16`) | `article` (`blog-stories.liquid:359`) | `templates/index.json` (`blog_stories_rHCbr7`, `index.json:642`); `templates/page.contact.json`; `templates/blog.json`; `templates/article.json`; `templates/404.json` |
| `brand-statement` | Brand statement copy with motion reveal. | `motionRevealSection` (`brand-statement.liquid:8`) | — | `templates/page.about.json` (`brand_statement_mCYE3W`, `page.about.json:168`) |
| `philosophy-section` | Philosophy cards with imagery and links. | `motionRevealSection` (`philosophy-section.liquid:8`) | `card` (`philosophy-section.liquid:270`) | `templates/page.about.json` (`philosophy_section_BqzJEC`, `page.about.json:166`) |
| `promise-section` | Accordion list of brand promises. | `motionRevealSection` (`promise-section.liquid:8`); `accordion` via snippet | `accordion_item` (`promise-section.liquid:178`) | `templates/page.about.json` (`promise_section_Fkhfxi`, `page.about.json:167`) |
| `about-stats` | Stat figures with optional image swap on interaction. | `motionRevealSection` (`about-stats.liquid:14`); inline `activeImage` (`about-stats.liquid:46`) | `stat` (`about-stats.liquid:354`) | `templates/index.json` (`about_stats_AiPE4L`, `index.json:641`); `templates/page.contact.json` |
| `google-map` | Embedded map iframe when embed code is set; accessible `title` on iframe (`google-map.liquid:6–10`). | none | — | `templates/index.json` (`google_map_aTM8nH`, `index.json:646`) |
| `page` | Generic page title and RTE body for Shopify pages. | `motionRevealSection` (`page.liquid:12`) | — | `templates/page.json` (`main`) |
| `custom-liquid` | Merchant-defined Liquid output in a section wrapper. | none | — | Preset only — not in saved JSON (`merchant-references.md` preset table) |

### CAP-16 — About & contact pages

| Field | Detail |
|-------|--------|
| **Files** | `sections/main-page-about.liquid`, `sections/main-page-contact.liquid` |
| **User-visible behavior** | Composed about page (`page.about.json`); contact page with form and success toast (`main-page-contact.liquid:100–102`). |
| **JS dependencies** | `motionRevealSection`, `$store.toast` |
| **Theme Editor** | Section instances on dedicated templates. |
| **No-JS** | Contact Shopify form still submittable. |
| **Proposal** | **rewrite** |

### CAP-17 — Password storefront

| Field | Detail |
|-------|--------|
| **Files** | `sections/password-header.liquid`, `sections/password.liquid`, `sections/password-footer.liquid`, `layout/password.liquid` |
| **User-visible behavior** | Password gate page with branding and password form. |
| **JS dependencies** | None from theme JS (`password.liquid` layout). |
| **Theme Editor** | `password.json` three sections. |
| **No-JS** | Full behavior (native form). |
| **Proposal** | **keep** — minimal JS already. |

### CAP-18 — Gift card

| Field | Detail |
|-------|--------|
| **Files** | `templates/gift_card.liquid`, `assets/gift-card.js`, `assets/gift-card.css`, `snippets/gift-card-recipient-form.liquid` |
| **User-visible behavior** | Printable gift card; optional recipient fields when enabled. |
| **JS dependencies** | `GiftCardRecipient` (`gift-card-recipient-form.liquid:49`) |
| **Theme Editor** | N/A (liquid template). |
| **No-JS** | Gift card displays. |
| **Proposal** | **rewrite** to skeleton gift-card pattern. |

### CAP-19 — 404

| Field | Detail |
|-------|--------|
| **Files** | `sections/404.liquid` |
| **User-visible behavior** | Custom 404 copy, optional CTA, related `blog-stories` section (`404.json`). |
| **JS dependencies** | `motionRevealSection` |
| **Theme Editor** | Section settings for copy/watermark. |
| **No-JS** | Message and links visible. |
| **Proposal** | **rewrite** |

### CAP-20 — Localization

| Field | Detail |
|-------|--------|
| **Files** | `snippets/localization-switcher.liquid`, `snippets/country-localization.liquid`, `snippets/language-localization.liquid`, `snippets/localization-option.liquid`, `snippets/localization-selected-icon.liquid` |
| **User-visible behavior** | Country/language selectors in announcement bar and footer when enabled. |
| **JS dependencies** | `localizationSwitcher` |
| **Theme Editor** | Toggled via announcement settings (`header-group.json:41–42`). |
| **No-JS** | Shopify may still render native localization forms. |
| **Proposal** | **rewrite** |

### CAP-21 — Shared UI primitives

| Field | Detail |
|-------|--------|
| **Files** | `snippets/ui-dialog.liquid`, `snippets/ui-toast.liquid`, `snippets/loading.liquid`, `snippets/tab-control.liquid`, `snippets/quantity-selector.liquid`, `snippets/quantity-constraints.liquid`, `assets/alpine.store.dialog.js`, `assets/alpine.store.toast.js`, `assets/dialog-motion.js`, `assets/drawer-motion.js`, `assets/alpine.components.ui.js` |
| **User-visible behavior** | Modal/drawer focus trap and motion; toast notifications on cart/contact events; shared quantity rules. |
| **JS dependencies** | `$store.dialog`, `$store.toast`, `accordion`, `dropdown`, `tabControl` |
| **Theme Editor** | Dialog IDs via `data-dialog-id` on header/collection triggers. |
| **No-JS** | Dialogs closed/hidden; core content unaffected. |
| **Proposal** | **rewrite** — maps to skeleton overlay primitives. |

### CAP-22 — Swiper-driven section carousels

| Field | Detail |
|-------|--------|
| **Files** | `sections/featured-products.liquid`, `sections/icon-with-text.liquid`, `sections/routine-showcase.liquid`, `sections/slides-show.liquid`, `sections/testimonial-featured.liquid` + CAP-02 announcement |
| **User-visible behavior** | Autoplay/slide navigation for hero, products tabs, icons, routines, testimonials; keyboard on slides-show (`slides-show.liquid:269–284`). |
| **JS dependencies** | `Components.register` + `Swiper` |
| **Theme Editor** | Re-init on section load; destroy on unload to avoid duplicate Swipers. |
| **No-JS** | First slide visible. |
| **Proposal** | **rewrite** — carousel approach pending the Swiper decision in `docs/agent/board.md`. |

---

## File coverage matrix

### Sections (`sections/*.liquid`) — 45 rows

| File | CAP ID(s) |
|------|-----------|
| 404.liquid | CAP-19 |
| about-stats.liquid | CAP-15 |
| announcement-bar.liquid | CAP-02, CAP-22 |
| article.liquid | CAP-14 |
| before-after-comparison.liquid | CAP-15 |
| blog-stories.liquid | CAP-15 |
| blog.liquid | CAP-14 |
| brand-statement.liquid | CAP-15 |
| cart-overlay.liquid | CAP-05 |
| cart.liquid | CAP-05 |
| category-grid.liquid | CAP-15 |
| collection-navigation-items.liquid | CAP-12 |
| collection.liquid | CAP-12 |
| collections.liquid | CAP-12 |
| custom-liquid.liquid | CAP-15 |
| featured-product.liquid | CAP-10 |
| featured-products.liquid | CAP-15, CAP-22 |
| footer.liquid | CAP-06 |
| google-map.liquid | CAP-15 |
| header.liquid | CAP-03 |
| icon-with-text.liquid | CAP-15, CAP-22 |
| main-page-about.liquid | CAP-16 |
| main-page-contact.liquid | CAP-16 |
| newsletter-banner.liquid | CAP-07 |
| newsletter-overlay.liquid | CAP-07 |
| page.liquid | CAP-15 |
| password-footer.liquid | CAP-17 |
| password-header.liquid | CAP-17 |
| password.liquid | CAP-17 |
| philosophy-section.liquid | CAP-15 |
| pickup-availability.liquid | CAP-08 |
| product-comparison-table.liquid | CAP-08 |
| product-recommendations.liquid | CAP-11 |
| product.liquid | CAP-08, CAP-09 |
| promise-section.liquid | CAP-15 |
| promo-bannder.liquid | CAP-15 |
| promotion-countdown.liquid | CAP-15 |
| routine-showcase.liquid | CAP-15, CAP-22 |
| scroll-categories.liquid | CAP-15 |
| scrolling-icon-with-text.liquid | CAP-15 |
| search-overlay.liquid | CAP-04 |
| search.liquid | CAP-13 |
| slides-show.liquid | CAP-15, CAP-22 |
| testimonial-featured.liquid | CAP-15, CAP-22 |
| video-banner.liquid | CAP-15 |

### Snippets (`snippets/*.liquid`) — 70 rows

| File | CAP ID(s) |
|------|-----------|
| accordion.liquid | CAP-15, CAP-21 |
| active-filters.liquid | CAP-12 |
| buy-buttons.liquid | CAP-08, CAP-10 |
| cart-summary-accordion.liquid | CAP-05 |
| content-icon.liquid | CAP-15 |
| country-localization.liquid | CAP-20 |
| css-variables.liquid | CAP-01 |
| filter-horizontal.liquid | CAP-12 |
| filter-vertical.liquid | CAP-12 |
| filters-drawer.liquid | CAP-12 |
| filters-field.liquid | CAP-12 |
| filters-groups.liquid | CAP-12 |
| flip-digit.liquid | CAP-15 |
| gift-card-recipient-form.liquid | CAP-18 |
| grid-feature-card.liquid | CAP-15 |
| header-dropdown-menu.liquid | CAP-03 |
| header-dropdown-super-menu.liquid | CAP-03 |
| header-mobile-menu-drawer.liquid | CAP-03 |
| icon-with-text-item.liquid | CAP-15 |
| icons.liquid | INFRA |
| image-lightbox.liquid | CAP-09 |
| image-magnifier.liquid | CAP-09 |
| image.liquid | INFRA |
| language-localization.liquid | CAP-20 |
| link.liquid | INFRA |
| listing-page-hero-copy.liquid | CAP-14 |
| loading.liquid | CAP-21 |
| localization-option.liquid | CAP-20 |
| localization-selected-icon.liquid | CAP-20 |
| localization-switcher.liquid | CAP-20 |
| media-video.liquid | CAP-15 |
| meta-tags.liquid | CAP-01 |
| pagination.liquid | CAP-12, CAP-14 |
| pickup-availability-inline.liquid | CAP-08 |
| predictive-search-product-card.liquid | CAP-04 |
| product-card-price.liquid | CAP-12, CAP-13 |
| product-card-variant-panel.liquid | CAP-12, CAP-13 |
| product-card.liquid | CAP-12, CAP-13 |
| product-gallery-carousel.liquid | CAP-09 |
| product-gallery-grid.liquid | CAP-09 |
| product-gallery-stacked.liquid | CAP-09 |
| product-gallery-thumbnails.liquid | CAP-09 |
| product-gallery.liquid | CAP-09 |
| product-info-blocks.liquid | CAP-08, CAP-10 |
| product-info-share.liquid | CAP-08 |
| product-media-modal.liquid | CAP-09 |
| product-media.liquid | CAP-09 |
| product-purchase-stack.liquid | CAP-08, CAP-10 |
| product-quick-view.liquid | CAP-12, CAP-13 |
| product-recommendations-section.liquid | CAP-11 |
| product-tax-note.liquid | CAP-08 |
| product-variant-picker.liquid | CAP-08, CAP-10 |
| product-variants-quantity-json.liquid | CAP-08 |
| quantity-constraints.liquid | CAP-21 |
| quantity-selector.liquid | CAP-08, CAP-21 |
| quick-view-buy-actions.liquid | CAP-12, CAP-13 |
| rotating-badge.liquid | CAP-15 |
| rte-compact-prose.liquid | CAP-14 |
| search-predictive-panel.liquid | CAP-04 |
| search-results-tabs.liquid | CAP-13 |
| selling-plan-picker.liquid | CAP-08 |
| show-more-icon.liquid | CAP-15 |
| social-icons.liquid | CAP-02, CAP-06 |
| sort-by-dropdown.liquid | CAP-12 |
| starts.liquid | CAP-15 |
| tab-control.liquid | CAP-13, CAP-21 |
| ui-dialog.liquid | CAP-21 |
| ui-toast.liquid | CAP-21 |
| unit-price.liquid | CAP-08 |
| watermark.liquid | CAP-15 |

### Non-vendor `assets/*.js` — 25 rows

| File | CAP ID / role |
|------|----------------|
| alpine.components.filters.js | CAP-12 |
| alpine.components.header.js | CAP-03 |
| alpine.components.js | INFRA |
| alpine.components.overlays.js | CAP-05, CAP-07 |
| alpine.components.pagination.js | CAP-12, CAP-14 |
| alpine.components.product-cards.js | CAP-11, CAP-12, CAP-13 |
| alpine.components.product-media.js | CAP-09 |
| alpine.components.product.js | CAP-08, CAP-10, CAP-18 |
| alpine.components.registry.js | INFRA |
| alpine.components.search.js | CAP-04 |
| alpine.components.ui.js | CAP-01, CAP-15, CAP-21, CAP-22 |
| alpine.store.cart.js | CAP-05 |
| alpine.store.dialog.js | CAP-21 |
| alpine.store.js | INFRA |
| alpine.store.registry.js | INFRA |
| alpine.store.toast.js | CAP-21 |
| base.js | INFRA |
| dialog-motion.js | CAP-21 |
| drawer-motion.js | CAP-21 |
| events.js | INFRA |
| gift-card.js | CAP-18 |
| https.js | INFRA |
| performance.js | INFRA |
| quantity-constraints.js | INFRA |
| utils.js | INFRA |
