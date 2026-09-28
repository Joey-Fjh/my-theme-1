# Runtime dependency map

Source of truth: code at `926dddb`. Load order from `layout/theme.liquid`.

## Layout script and style order

### `layout/theme.liquid`

| Order | Asset | Loading | Notes |
|-------|--------|---------|--------|
| 1 | `tailwind.output.css` | `stylesheet_tag` + preload | `theme.liquid:21` |
| 2 | `vendor-swiper.min.js` | `defer` | `theme.liquid:24` |
| 3–5 | `utils.js`, `quantity-constraints.js`, `events.js` | `defer` | `theme.liquid:27–29` |
| 6–16 | `alpine.components*.js` (11 files) + `alpine.components.registry.js` | `defer` | `theme.liquid:32–42` |
| 17 | `performance.js` | `defer` | `theme.liquid:45` |
| 18 | `https.js` | `defer` | `theme.liquid:48` |
| 19 | `base.js` | `defer` | `theme.liquid:51` — boots `Components`, `Base`, Alpine |
| 20–26 | `alpine.store*.js`, `dialog-motion.js`, `drawer-motion.js` | `defer` | `theme.liquid:54–60` |
| 27–28 | `vendor-alpine-intersect.min.js`, `vendor-alpine.min.js` | `defer` | `theme.liquid:63–64` (Alpine last) |
| — | `content_for_header` | Shopify-injected | `theme.liquid:66` |

Body bootstrapping: `data-initial-cart`, `data-cart-type`, motion/reveal datasets (`theme.liquid:69–82`). Section groups: `overlay-group`, `header-group`, `footer-group` (`theme.liquid:88–96`). Global toast snippet (`theme.liquid:98`).

### `layout/password.liquid`

| Asset | Notes |
|-------|--------|
| `css-variables` snippet | `password.liquid:14` |
| `tailwind.output.css` | `password.liquid:17` |
| `meta-tags` | `password.liquid:20` |
| No theme `assets/*.js` | `password.liquid:22–30` |

## `window` globals (theme-owned)

| Symbol | Provided by | Consumers (examples) |
|--------|-------------|----------------------|
| `window.__Theme__.Utils` | `assets/utils.js` | `base.js:21`, Alpine components |
| `window.__Theme__.Events` (`ThemeEvents`) | `assets/events.js:96–97` | Product, UI, media components |
| `window.__Theme__.AlpineComponentsFactory` | `assets/alpine.components.js:97` | `base.js:486–541` registration |
| `window.__Theme__.AlpineComponents` | Group merges in `alpine.components.registry.js:9–20` | Factory registrations |
| `window.__Theme__.AlpineStores` | `alpine.store.registry.js:9–13` | `base.js:467–482` |
| `window.__Theme__.Components` | `assets/base.js:551` | Section `{% javascript %}` carousels |
| `window.__Theme__.Base` | `assets/base.js:550` | Layout CSS vars for header/announcement |
| `window.ShopifyHttp` | `assets/https.js:337` | Cart store, filters, search, pagination, overlays |
| `window.ShopifySectionRefresher` | `assets/https.js:339` | Same callers as HTTP |
| `window.ShopifyHttpError` | `assets/https.js:338` | HTTP error handling |
| `window.Alpine` | `vendor-alpine.min.js` (after `alpine:init` in `base.js:463`) | All `x-data` / `$store` |
| `window.Swiper` | `vendor-swiper.min.js` | Carousels (see Swiper table) |
| `window.__Theme__.ThemePerformance` | `assets/performance.js` | `base.js:456` optional init |

## `Components.register` (section-scoped)

| Registered type | Section file | DOM hook | Editor lifecycle |
|-----------------|--------------|----------|------------------|
| `announcement-bar` | `sections/announcement-bar.liquid:18`, `:99` | `data-component-type` | `Components` re-inits on `shopify:section:load` (`base.js:426–428`) |
| `featured-products` | `sections/featured-products.liquid:3`, `:302` | same | Swiper destroyed in `destroy()` (`featured-products.liquid:348–349`) |
| `icon-with-text` | `sections/icon-with-text.liquid:23`, `:105` | same | Swiper `destroy` (`icon-with-text.liquid:149`) |
| `routine-showcase` | `sections/routine-showcase.liquid:35`, `:292` | same | MQL + Swiper teardown (`routine-showcase.liquid:343–344`) |
| `slides-show` | `sections/slides-show.liquid:9`, `:221` | same | Keyboard + Swiper cleanup (`slides-show.liquid:301–302`) |
| `testimonial-featured` | `sections/testimonial-featured.liquid:9`, `:107` | same | Swiper destroy (`testimonial-featured.liquid:153–154`) |
| `product-comparison-table` | `sections/product-comparison-table.liquid:12`, `:284` | same | Scroll/sync behavior in section JS |

`Components.setupLifecycle()` listens to `shopify:section:load|reorder|unload` and `shopify:block:select|deselect` (`base.js:426–449`).

## Alpine: factory registrations

All registrations occur in `base.js` `alpine:init` handler (`base.js:491–540`).

| Alpine `x-data` name | Constant in `alpine.components.js` | Definition group file |
|----------------------|-------------------------------------|------------------------|
| `dropdown` | `DROPDOWN` | `alpine.components.ui.js` |
| `mobileMenuDrawer` | `MOBILEMENUDRAWER` | `alpine.components.header.js` |
| `dragScroll` | `DRAGSCROLL` | `alpine.components.ui.js` |
| `stickyHeader` | `STICKY_HEADER` | `alpine.components.header.js` |
| `tabControl` | `TABCONTROL` | `alpine.components.ui.js` |
| `beforeAfterComparison` | `BEFOREAFTERCOMPARISON` | `alpine.components.ui.js` |
| `countdownTimer` | `COUNTDOWNTIMER` | `alpine.components.ui.js` |
| `sectionPagination` | `SECTIONPAGINATION` | `alpine.components.pagination.js` |
| `collectionFilters` | `COLLECTIONFILTERS` | `alpine.components.filters.js` |
| `searchFilters` | `SEARCHFILTERS` | `alpine.components.filters.js` |
| `collectionNavigationCatalog` | `COLLECTIONNAVIGATIONCATALOG` | `alpine.components.filters.js` |
| `collectionFilterField` | `COLLECTIONFILTERFIELD` | `alpine.components.filters.js` |
| `progressiveList` | `PROGRESSIVELIST` | `alpine.components.ui.js` |
| `productGallery` | `PRODUCTGALLERY` | `alpine.components.product-media.js` |
| `ProductPrice` | `PRODUCTPRICE` | `alpine.components.product.js` |
| `ProductPaymentTerms` | `PRODUCTPAYMENTTERMS` | `alpine.components.product.js` |
| `VariantPicker` | `VARIANTPICKER` | `alpine.components.product.js` |
| `QuantitySelector` | `QUANTITYSELECTOR` | `alpine.components.product.js` |
| `BuyButtons` | `BUYBUTTONS` | `alpine.components.product.js` |
| `SellingPlanPicker` | `SELLINGPLANPICKER` | `alpine.components.product.js` |
| `GiftCardRecipient` | `GIFTCARDRECIPIENT` | `alpine.components.product.js` |
| `PickupAvailability` | `PICKUPAVAILABILITY` | `alpine.components.product.js` |
| `predictiveSearch` | `PREDICTIVESEARCH` | `alpine.components.search.js` |
| `relatedProducts` | `RELATEDPRODUCTS` | `alpine.components.product-cards.js` |
| `newsletterBanner` | `NEWSLETTERBANNER` | `alpine.components.overlays.js` |
| `newsletterOverlay` | `NEWSLETTEROVERLAY` | `alpine.components.overlays.js` |
| `cartPage` | `CARTPAGE` | `alpine.components.overlays.js` |
| `cartOverlay` | `CARTOVERLAY` | `alpine.components.overlays.js` |
| `cardGallery` | `CARDGALLERY` | `alpine.components.product-cards.js` |
| `productCard` | `PRODUCTCARD` | `alpine.components.product-cards.js` |
| `imageLightbox` | `IMAGELIGHTBOX` | `alpine.components.product-media.js` |
| `imageMagnifier` | `IMAGEMAGNIFIER` | `alpine.components.product-media.js` |
| `productLayout` | `PRODUCTLAYOUT` | `alpine.components.product.js` |
| `accordion` | `ACCORDION` | `alpine.components.ui.js` |
| `localizationSwitcher` | `LOCALIZATIONSWITCHER` | `alpine.components.ui.js` |
| `sortByDropdown` | `SORTBYDROPDOWN` | `alpine.components.ui.js` |
| `flipDigit` | `FLIPDIGIT` | `alpine.components.ui.js` |
| `toastContainer` | `TOASTCONTAINER` | `alpine.components.ui.js` |
| `motionRevealSection` | `MOTIONREVEALSECTION` | `alpine.components.ui.js` |
| `productMediaModal` | `PRODUCTMEDIAMODAL` | `alpine.components.product-media.js` |
| `mediaVideo` | `MEDIAVIDEO` | `alpine.components.ui.js` |

Example Liquid usage: `x-data="productLayout"` (`sections/product.liquid:49`), `x-data="motionRevealSection()"` (`sections/footer.liquid:4`).

## Alpine stores

| Store | Registered | Hydration | Example usage |
|-------|------------|-----------|---------------|
| `toast` | `base.js:469` | — | `main-page-contact.liquid:100–102` |
| `dialog` | `base.js:470` | — | `header.liquid:51`, `cart-overlay.liquid:44` |
| `cart` | `base.js:480–481` | `body.dataset.initialCart` (`base.js:475–477`, `theme.liquid:71`) | `cart.liquid:15`, `buy-buttons.liquid` via add API |

Store implementations: `alpine.store.toast.js`, `alpine.store.dialog.js`, `alpine.store.cart.js`.

## `ThemeEvents` catalog

Defined in `assets/events.js:7–16`.

| Event constant | String value | Emitters | Listeners |
|----------------|--------------|----------|-----------|
| `COMPONENT_UNMOUNTED` | `theme:component:unmounted` | Alpine factory wrapper | `alpine.components.js:30–55` |
| `HEADER_MENU_ACTIVE_CHANGED` | `theme:header:menu:active-changed` | `alpine.components.ui.js:63` | Header layout |
| `PRODUCT_VARIANT_SET_REQUEST` | `theme:product:variant:request:set` | Variant UI | `alpine.components.product.js:249` |
| `PRODUCT_VARIANT_CHANGED` | `theme:product:variant:changed` | `alpine.components.product.js:325` | Price, buy buttons, gallery, pickup |
| `PRODUCT_SELLING_PLAN_CHANGED` | `theme:product:selling-plan:changed` | `alpine.components.product.js:1853` | Buy buttons |
| `PRODUCT_GALLERY_SLIDE_TO_REQUEST` | `theme:product-gallery:request:slide-to` | Variant change | `alpine.components.product-media.js:47` |
| `PRODUCT_QUANTITY_CHANGED` | `theme:product:quantity:changed` | Quantity selector | Cart line updates `cart.liquid:277` |
| `PRODUCT_MEDIA_MODAL_ACTIVATE` | `theme:product-media-modal:activate` | Gallery | `alpine.components.product-media.js:817` |

## `ShopifyHttp` / `ShopifySectionRefresher.render`

| File | Purpose |
|------|---------|
| `alpine.store.cart.js:35` | Cart API mutations |
| `alpine.components.filters.js:328–340`, `:620–653` | Collection filter AJAX |
| `alpine.components.pagination.js:96–116` | Paginated collection/blog refresh |
| `alpine.components.search.js:204+` | Predictive search requests |
| `alpine.components.product.js:1381–1418` | Pickup availability section render |
| `alpine.components.product-cards.js:460–494` | Product card quick actions / section refresh |
| `alpine.components.overlays.js:306+`, `:598–613` | Cart drawer / overlay HTML swap |

Implementation: `assets/https.js` (`ShopifyHttp` class `:19+`, `SectionRefresher` `:217+`, export `:337–339`).

## Swiper instances

| Location | Init | Destroy / editor |
|----------|------|------------------|
| `sections/announcement-bar.liquid:108` | Autoplay carousel in `Components.register` | `destroy` on component teardown (`announcement-bar.liquid:153–154`) |
| `sections/featured-products.liquid:341` | Per-tab product sliders | `state.swipers.forEach(destroy)` (`:348–349`) |
| `sections/icon-with-text.liquid:120` | Mobile carousel | `:149` |
| `sections/routine-showcase.liquid:308` | Breakpoint-dependent | `:343–344` |
| `sections/slides-show.liquid:233` | Hero slides + keyboard | `:301–302` |
| `sections/testimonial-featured.liquid:129` | Testimonial carousel | `:153–154` |
| `assets/alpine.components.product-media.js:185` | PDP gallery carousel layout | `_swiper.destroy` in component destroy (`:205`) |

`alpine.components.ui.js:2303–2317` listens for clicks/transitions to relayout Swiper controls in the theme editor.

## Shopify Theme Editor DOM events

| Event | Listener location | Behavior |
|-------|-------------------|----------|
| `shopify:section:load` | `base.js:426–428`, `Components` lifecycle | Re-init components in loaded section root |
| `shopify:section:reorder` | `base.js:430–432` | Re-init |
| `shopify:section:unload` | `base.js:434–436` | `destroyAll` |
| `shopify:section:select` / `deselect` | `base.js:438–445` | Component hooks |
| `shopify:block:select` / `deselect` | `base.js:446–449` | Block-level hooks |
| `shopify:section:select` / `reorder` | `alpine.components.ui.js:2342–2353` | Motion reveal / cascade refresh in design mode |

`Base` also listens to section load/reorder/unload for header height CSS vars (`base.js:32–34`, `:100–102`).

## Vendor assets

| File | Role |
|------|------|
| `vendor-swiper.min.js` | Carousel library (`theme.liquid:24`) |
| `vendor-swiper.min.css` | Imported into Tailwind bundle (`tailwind/tailwind.input.css:81`) |
| `vendor-alpine.min.js` | Alpine 3 (`theme.liquid:64`) |
| `vendor-alpine-intersect.min.js` | `x-intersect` plugin (`theme.liquid:63`; registers on `alpine:init` in vendor file) |
