# Phase 2 logic migration

Maps every registration in **D** files plus **R** JS from Part 1 (`assets/base.js`). Delete a D file only after all its rows below are implemented.

## `assets/alpine.components.filters.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| collectionFilters | assets/alpine.components.filters.js:311 | `rg x-data="collectionFilters` → sections\collection.liquid:12:    x-data="collectionFilters()" | new module `collection-filters.js` slice 3 | CAP-12 | 3 |
| searchFilters | assets/alpine.components.filters.js:409 | `rg x-data="searchFilters` → snippets\search-results-tabs.liquid:52:    x-data="searchFilters()" | new module `search-filters.js` | CAP-13 | 3 |
| collectionNavigationCatalog | assets/alpine.components.filters.js:684 | `rg x-data="collectionNavigationCatalog` → sections\collection.liquid:581:            x-data="collectionNavigationCatalog()" | new module `collection-navigation.js` | CAP-12 | 3 |
| collectionFilterField | assets/alpine.components.filters.js:854 | `rg x-data="collectionFilterField` → snippets\filters-field.liquid:184:                    x-data="collectionFilterField()" | new module `collection-filters.js` | CAP-12 | 3 |

## `assets/alpine.components.header.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| mobileMenuDrawer | assets/alpine.components.header.js:13 | `rg x-data="mobileMenuDrawer` → snippets\header-mobile-menu-drawer.liquid:14:            x-data="mobileMenuDrawer" | new module `mobile-menu-drawer.js` slice 2 | CAP-03 | 2 |
| stickyHeader | assets/alpine.components.header.js:60 | `rg x-data="stickyHeader` → sections\header.liquid:26:    x-data="stickyHeader" | **new module** `assets/sticky-header.js` (derived-theme; skeleton `docs/project.md` leaves sticky to child themes) | CAP-03 | 2 |

## `assets/alpine.components.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| AlpineComponentsFactory | assets/alpine.components.js:? | `rg x-data="AlpineComponentsFactory` → (none) | assets/alpine.adapter.js (F) | CAP-01 | P3 |

## `assets/alpine.components.overlays.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| newsletterBanner | assets/alpine.components.overlays.js:36 | `rg x-data="newsletterBanner` → sections\newsletter-banner.liquid:97:                    x-data="newsletterBanner()" | new module `newsletter-banner.js` | CAP-07 | 5 |
| newsletterOverlay | assets/alpine.components.overlays.js:55 | `rg x-data="newsletterOverlay` → sections\newsletter-overlay.liquid:151:      x-data="newsletterOverlay()" | new module `newsletter-overlay.js` | CAP-07 | 5 |
| cartPage | assets/alpine.components.overlays.js:161 | `rg x-data="cartPage` → sections\cart.liquid:8:    x-data="cartPage()" | assets/cart-page.js (F) | CAP-05 | 1 |
| cartOverlay | assets/alpine.components.overlays.js:440 | `rg x-data="cartOverlay` → sections\cart-overlay.liquid:43:            x-data="cartOverlay()" | assets/cart-page.js + cart contract (F) | CAP-05 | 1 |

## `assets/alpine.components.pagination.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| sectionPagination | assets/alpine.components.pagination.js:13 | `rg x-data="sectionPagination` → sections\blog.liquid:10:    x-data="sectionPagination()" | new module `section-pagination.js` (or skeleton `section-pagination.js` F) | CAP-14 | 5 |

## `assets/alpine.components.product-cards.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| cardGallery | assets/alpine.components.product-cards.js:34 | `rg x-data="cardGallery` → snippets\predictive-search-product-card.liquid:21:    x-data="cardGallery" | new module `card-gallery.js` | CAP-04 | 2 |
| productCard | assets/alpine.components.product-cards.js:133 | `rg x-data="productCard` → snippets\product-card.liquid:180:        x-data="productCard" | new module `product-card.js` | CAP-12 | 1 |
| relatedProducts | assets/alpine.components.product-cards.js:377 | `rg x-data="relatedProducts` → snippets\product-recommendations-section.liquid:72:        x-data="relatedProducts()" | new module `related-products.js` | CAP-11 | 1 |

## `assets/alpine.components.product-media.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| productGallery | assets/alpine.components.product-media.js:13 | `rg x-data="productGallery` → snippets\product-gallery.liquid:75:    x-data="productGallery" | assets/product-gallery.js (F) | CAP-09 | P3 |
| imageLightbox | assets/alpine.components.product-media.js:213 | `rg x-data="imageLightbox` → snippets\image-lightbox.liquid:47:        x-data="imageLightbox()"; snippets\product-gallery.liquid:89:            x-data="imageLightbox()" | new module `assets/image-lightbox.js` in phase 3 (mounted by F+ `snippets/product-gallery.liquid`; the skeleton ships none) | CAP-15 | P3 |
| imageMagnifier | assets/alpine.components.product-media.js:451 | `rg x-data="imageMagnifier` → snippets\image-magnifier.liquid:57:    x-data="imageMagnifier()" | new module from assets/alpine.components.product-media.js slice 4/5 | CAP-15 | 1 |
| beforeAfterComparison | assets/alpine.components.product-media.js:649 | `rg x-data="beforeAfterComparison` → sections\before-after-comparison.liquid:90:            x-data="beforeAfterComparison()" | new module from assets/alpine.components.product-media.js slice 4/5 | CAP-15 | 4 |
| productMediaModal | assets/alpine.components.product-media.js:799 | `rg x-data="productMediaModal` → snippets\product-media-modal.liquid:67:                x-data="productMediaModal()" | new module from assets/alpine.components.product-media.js slice 4/5 | CAP-15 | 1 |
| mediaVideo | assets/alpine.components.product-media.js:945 | `rg x-data="mediaVideo` → snippets\media-video.liquid:79:        x-data="mediaVideo()" | new module from assets/alpine.components.product-media.js slice 4/5 | CAP-15 | 4 |

## `assets/alpine.components.product.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| ProductPrice | assets/alpine.components.product.js:13 | `rg x-data="ProductPrice` → snippets\product-info-blocks.liquid:131:                            x-data="ProductPrice()"; snippets\product-purchase-stack.liquid:75:    x-data="ProductPrice()" | new module `product-price.js` | CAP-08 | 1 |
| ProductPaymentTerms | assets/alpine.components.product.js:131 | `rg x-data="ProductPaymentTerms` → snippets\product-info-blocks.liquid:170:                                x-data="ProductPaymentTerms()"; snippets\product-purchase-stack.liquid:114:        x-data="ProductPaymentTerms()" | new module `product-payment-terms.js` | CAP-08 | 1 |
| VariantPicker | assets/alpine.components.product.js:183 | `rg x-data="VariantPicker` → snippets\product-variant-picker.liquid:48:        x-data="VariantPicker()" | assets/variant-picker.js (F) | CAP-08 | P3 |
| QuantitySelector | assets/alpine.components.product.js:369 | `rg x-data="QuantitySelector` → snippets\quantity-selector.liquid:147:        x-data="QuantitySelector()" | assets/quantity-selector.js (F) | CAP-08 | P3 |
| GiftCardRecipient | assets/alpine.components.product.js:630 | `rg x-data="GiftCardRecipient` → snippets\gift-card-recipient-form.liquid:49:    x-data="GiftCardRecipient()" | new module `gift-card-recipient.js` | CAP-18 | 1 |
| BuyButtons | assets/alpine.components.product.js:936 | `rg x-data="BuyButtons` → snippets\buy-buttons.liquid:105:        x-data="BuyButtons()" | assets/buy-buttons.js (F) | CAP-08 | P3 |
| PickupAvailability | assets/alpine.components.product.js:1291 | `rg x-data="PickupAvailability` → snippets\pickup-availability-inline.liquid:24:    x-data="PickupAvailability()" | new module `pickup-availability.js` | CAP-08 | 1 |
| productLayout | assets/alpine.components.product.js:1451 | `rg x-data="productLayout` → sections\featured-product.liquid:12:    x-data="productLayout"; sections\product.liquid:49:    x-data="productLayout" | new module `product-layout.js` | CAP-08,CAP-10 | 1 |
| SellingPlanPicker | assets/alpine.components.product.js:1747 | `rg x-data="SellingPlanPicker` → snippets\selling-plan-picker.liquid:62:        x-data="SellingPlanPicker()" | new module `selling-plan-picker.js` | CAP-08 | 1 |

## `assets/alpine.components.registry.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| merge ComponentGroups | alpine.components.registry.js:9-20 | (script loader only) | skeleton import-map modules replace group merge | CAP-01 | 3 |

## `assets/alpine.components.search.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| predictiveSearch | assets/alpine.components.search.js:13 | `rg x-data="predictiveSearch` → sections\search-overlay.liquid:11:            x-data="predictiveSearch()"; sections\search.liquid:17:            x-data="predictiveSearch"; snippets\search-predictive-panel.liquid:8:    Required parent scope (from `x-data="predictiveSearch"`): | search-overlay section module slice 2 | CAP-04 | 2 |

## `assets/alpine.components.ui.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| stickyViewportPanel | assets/alpine.components.ui.js:13 | `rg x-data="stickyViewportPanel` → sections\article.liquid:76:                <nav class="pc:sticky-viewport-panel" x-data="stickyViewportPanel">; sections\collection.liquid:372:                            x-data="stickyViewportPanel" | new module from assets/alpine.components.ui.js slice 4/5 | CAP-15 | 3 |
| dropdown | assets/alpine.components.ui.js:52 | `rg x-data="dropdown` → snippets\header-dropdown-menu.liquid:12:    x-data="dropdown"; snippets\header-dropdown-super-menu.liquid:12:    x-data="dropdown"; snippets\sort-by-dropdown.liquid:33:    x-data="dropdown" | assets/dropdown.js (F import) | CAP-03 | P3 |
| dragScroll | assets/alpine.components.ui.js:325 | `rg x-data="dragScroll` → sections\collection.liquid:417:                                x-data="dragScroll({ axis: 'x' })"; snippets\header-dropdown-super-menu.liquid:194:                                                                x-data="dragScroll({ axis: 'x' })"; snippets\product-card-variant-panel.liquid:25:    <div class="product-card__variant-table-wrap" x-data="dragScroll({ axis: 'x' })">; snippets\product-card.liquid:370:                    <div class="product-card__variant-body" x-data="dragScroll({ axis: 'y' })">; snippets\product-gallery-thumbnails.liquid:82:                    x-data="dragScroll({ axis: 'x' })" | new module from assets/alpine.components.ui.js slice 4/5 | CAP-15 | 1 |
| tabControl | assets/alpine.components.ui.js:420 | `rg x-data="tabControl` → snippets\search-results-tabs.liquid:66:        x-data="tabControl()"; snippets\tab-control.liquid:36:    x-data="tabControl()" | new module from assets/alpine.components.ui.js slice 4/5 | CAP-15 | 2 |
| countdownTimer | assets/alpine.components.ui.js:765 | `rg x-data="countdownTimer` → sections\promotion-countdown.liquid:30:            x-data="countdownTimer()" | new module from assets/alpine.components.ui.js slice 4/5 | CAP-15 | 4 |
| progressiveList | assets/alpine.components.ui.js:829 | `rg x-data="progressiveList` → snippets\filters-field.liquid:56:                    x-data="progressiveList()"; snippets\filters-field.liquid:112:                    x-data="progressiveList()" | new module `progressive-list.js` | CAP-12 | 3 |
| localizationSwitcher | assets/alpine.components.ui.js:876 | `rg x-data="localizationSwitcher` → snippets\localization-switcher.liquid:18:    x-data="localizationSwitcher" | assets/localization-switcher.js (F) | CAP-20 | P3 |
| sortByDropdown | assets/alpine.components.ui.js:968 | `rg x-data="sortByDropdown` → snippets\sort-by-dropdown.liquid:41:        x-data="sortByDropdown" | new module from assets/alpine.components.ui.js slice 4/5 | CAP-15 | 3 |
| accordion | assets/alpine.components.ui.js:1019 | `rg x-data="accordion` → snippets\cart-summary-accordion.liquid:14:    x-data="accordion"; snippets\accordion.liquid:41:    x-data="accordion" | assets/accordion.js (F) | CAP-21 | P3 |
| toastContainer | assets/alpine.components.ui.js:1058 | `rg x-data="toastContainer` → snippets\ui-toast.liquid:36:    x-data="toastContainer" | new module `toast-container.js` (with `toast.js` store) | CAP-21 | 0 |
| flipDigit | assets/alpine.components.ui.js:1093 | `rg x-data="flipDigit` → snippets\flip-digit.liquid:18:        x-data="flipDigit" | new module from assets/alpine.components.ui.js slice 4/5 | CAP-15 | 4 |
| motionRevealSection | assets/alpine.components.ui.js:1144 | `rg x-data="motionRevealSection` → sections\brand-statement.liquid:8:    x-data="motionRevealSection()"; sections\blog.liquid:25:            x-data="motionRevealSection()"; sections\blog.liquid:137:                                x-data="motionRevealSection()"; sections\blog-stories.liquid:16:    x-data="motionRevealSection()"; sections\article.liquid:8:    x-data="motionRevealSection()"; sections\before-after-comparison.liquid:25:    x-data="motionRevealSection()"; sections\about-stats.liquid:14:    x-data="motionRevealSection()"; sections\category-grid.liquid:33:    x-data="motionRevealSection()" | new module `motion-reveal.js` slice 5 | CAP-01 | 0 |

## `assets/alpine.store.dialog.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| dialog | assets/alpine.store.dialog.js:? | `rg \$store.dialog` → assets\alpine.components.filters.js:724:                    this.$watch('$store.dialog.active', (activeId) => {; snippets\filters-drawer.liquid:56:            @click="$store.dialog.close()"; snippets\filters-drawer.liquid:82:            @click="$store.dialog.close()"; snippets\header-mobile-menu-drawer.liquid:15:            @keydown.escape.window="$store.dialog.close()"; snippets\header-mobile-menu-drawer.liquid:25:                    @click="$store.dialog.close()"; snippets\header-mobile-menu-drawer.liquid:171:                    attributes: '@click="$store.dialog.close()"'; snippets\header-mobile-menu-drawer.liquid:185:                    attributes: '@click="$store.dialog.close()"'; snippets\header-mobile-menu-drawer.liquid:199:                    attributes: '@click="$store.dialog.close()"' | new module `dialog.js` slice 2 | CAP-21 | 0 |

## `assets/alpine.store.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| AlpineStores shell | alpine.store.js:1-12 | base.js:467-482 | skeleton adapter store() | CAP-01 | 3 |

## `assets/alpine.store.registry.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| merge AlpineStoreGroups | alpine.store.registry.js:9-13 | base.js:466-482 | skeleton cart store + new dialog/toast stores | CAP-05,CAP-21 | 1-2 |

## `assets/alpine.store.toast.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| toast | assets/alpine.store.toast.js:? | `rg \$store.toast` → sections\main-page-contact.liquid:100:                                    if (!message || !$store.toast) return;; sections\main-page-contact.liquid:102:                                        $store.toast.show(message, 'success');; assets\alpine.components.ui.js:1063:                    this.$store.toast.configure({; assets\alpine.components.ui.js:1082:                            this.$store.toast.show(; snippets\ui-toast.liquid:49:    <template x-for="msg in $store.toast.messages" :key="msg.id">; snippets\ui-toast.liquid:78:                @click="$store.toast.remove(msg.id)" | new module `toast.js` (with `toast-container.js`) | CAP-21 | 0 |

## `assets/alpine.store.cart.js` (FX / D gate)

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| cart | assets/alpine.store.cart.js:? | `rg \$store\.cart` → sections\cart.liquid, sections\cart-overlay.liquid, snippets\buy-buttons.liquid | skeleton `alpine.store.cart.js` + `cart.contract.js` (FX merge) | CAP-05 | 1 |

## `assets/dialog-motion.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| dialogMotion | assets/dialog-motion.js:? | `rg x-data="dialogMotion` → assets/alpine.store.dialog.js:14-21 (DialogMotion()); snippets/ui-dialog.liquid | dialog module (skeleton CSS motion policy) | CAP-21 | 0 |

## `assets/drawer-motion.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| drawerMotion | assets/drawer-motion.js:? | `rg x-data="drawerMotion` → assets/alpine.store.dialog.js:14-16 (DrawerMotion()); snippets/ui-dialog.liquid | dialog/drawer module | CAP-21 | 0 |

## `assets/base.js`

| Name | Def | Liquid consumers (rg) | Migration | CAP | Slice |
| --- | --- | --- | --- | --- | --- |
| Components section runtime | base.js:128-451 | `rg -n data-component-type sections` | See §Components.register (Swiper + comparison) | CAP-02,CAP-08,CAP-22 | 2–4 |

## Components.register in sections (C1)

Theme `{% javascript %}` blocks call `window.__Theme__.Components.register` (not D files, but must migrate before removing `base.js` `Components` class).

| Section | Register name | Init / destroy | Theme Editor | Module destination | Slice |
| --- | --- | --- | --- | --- | --- |
| `sections/announcement-bar.liquid` | `announcement-bar` | Swiper fade + aria sync (`announcement-bar.liquid:99-265`); `destroy` destroys swiper | `Components` lifecycle via `base.js` section events | `announcement-bar.js` + shared `carousel-swiper.js` adapter (loads the vendored classic `vendor-swiper.min.js` on demand; see `phase3-import.md` §Swiper) | 2 |
| `sections/slides-show.liquid` | `slides-show` | Swiper fade, slideChange cleanup (`slides-show.liquid:221-265+`) | same | `slides-show.js` + shared `carousel-swiper.js` adapter | 4 |
| `sections/featured-products.liquid` | `featured-products` | Multi-Swiper per tab (`featured-products.liquid:302+`) | same | `featured-products.js` + `carousel-swiper.js` | 4 |
| `sections/routine-showcase.liquid` | `routine-showcase` | Responsive Swiper create/destroy (`routine-showcase.liquid:292-329`) | same | `routine-showcase.js` + `carousel-swiper.js` | 4 |
| `sections/testimonial-featured.liquid` | `testimonial-featured` | Swiper + cleanup (`testimonial-featured.liquid:107+`) | same | `testimonial-featured.js` + `carousel-swiper.js` | 4 |
| `sections/icon-with-text.liquid` | `icon-with-text` | Swiper carousel (`icon-with-text.liquid:105+`) | same | `icon-with-text.js` + `carousel-swiper.js` | 4 |
| `sections/product-comparison-table.liquid` | `product-comparison-table` | Sticky column scroll sync (`product-comparison-table.liquid:284+`; no Swiper) | same | `product-comparison-table.js` | 1 |

## D-file deletion gates

Generated per D file in `phase4-slices.md` (§D-file deletion gates) by `scripts/derive-slices.js`: registered items with their derived step, current Liquid mounts, the step after which the file may go, and the pre-delete command. The earlier shared probe is withdrawn.

## Summary

- D files: 17
- Registration items documented: 51
- Registration items with migration target: 51
- **Gate:** phase 3 removes only the D script tags; each D file is deleted after the step and with the command in `phase4-slices.md` (§D-file deletion gates).
