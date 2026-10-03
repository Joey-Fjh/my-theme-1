# Merchant configuration references

Commit `926dddb`. Sources: `templates/*.json`, `sections/*-group.json`, `config/settings_data.json` (merchant-owned).

**Validation result:** Every `type` in saved JSON resolves to `sections/<type>.liquid` with a matching `{% schema %}` (or `apps` placeholder). **Findings count: 0** unmatched types.

## Global theme settings (`config/settings_data.json`)

Keys under `current` (non-`sections`) compared to `config/settings_schema.json`:

| Setting ID | Present in `settings_data.json` | Schema definition |
|------------|-----------------------------------|-------------------|
| `type_header_font` | Yes (`settings_data.json:12`) | `settings_schema.json` typography group |
| `type_body_font` | Yes (`:13`) | Same |
| `page_width` | Yes (`:14`) | Layout group |
| `page_margin` | Yes (`:15`) | Layout group |
| `toast_position` | Yes (`:16`) | Theme behavior |
| `reveal_behavior` | Yes (`:17`) | Motion (`theme.liquid:82`) |
| `color_schemes` | Yes (`:18+`) | Color scheme definitions |

No orphan keys: all `current` top-level keys map to schema IDs.

## Section groups

### `sections/header-group.json`

| Section key | Section type | Block types (count) | Section setting IDs |
|-------------|--------------|---------------------|---------------------|
| `announcement_bar_RaUVbq` | `announcement-bar` | `announcement` ×3 | `color_scheme`, `text`, `link`, `show_social`, `enable_country_selector`, `enable_language_selector` (`:37–43`) |
| `header` | `header` | — | `logo_position`, `color_scheme`, `menu_color_scheme`, `mobile_menu_color_scheme`, `menu`, `menu_type`, `desktop_menu_trigger`, `super_menu_*`, `super_collection_1–3`, `super_series_products_limit` (`:48–63`) |

### `sections/footer-group.json`

| Section key | Section type | Block types | Section setting IDs |
|-------------|--------------|-------------|---------------------|
| `footer` | `footer` | `link_column` ×3 | `color_scheme`, `bg_image`, `brand_name`, `brush_image`, `location`, `content_heading`, `content_text`, `content_link`, `content_link_text` (`:40–49`) |

### `sections/overlay-group.json`

| Section key | Section type | Block types | Section setting IDs |
|-------------|--------------|-------------|---------------------|
| `search_overlay` | `search-overlay` | — | `color_scheme`, `drawer_position`, `search_result_limit` (`:16–19`) |
| `cart_overlay` | `cart-overlay` | — | `drawer_position`, `color_scheme` (`:24–26`) |
| `newsletter_overlay_TiNaz4` | `newsletter-overlay` | `text`, `heading`, `form` | `display_mode`, `show_in_home`, `show_for_visitor`, `delay`, `expired`, `modal_placement`, `alignment`, `placeholder`, `success_message`, `error_message`, `color_scheme` (`:52–63`) |

## JSON templates

Table columns: **Section key** → **type** → **block types** → **section-level setting IDs** (values omitted; see JSON for merchant content).

### `templates/index.json`

| Section key | Type | Block types | Setting IDs |
|-------------|------|-------------|-------------|
| `main` | `slides-show` | `slide` | `color_scheme`, `heading_size`, `heading_size_mobile`, `subtitle_size`, `padding_top`, `padding_bottom` |
| `category_grid_LU4hyd` | `category-grid` | `item` ×8 | `heading`, `description`, padding, color scheme (per schema) |
| `featured_products_*` | `featured-products` | `collection` ×3 | Tab/collection/slider settings |
| `scroll-categories` | `scroll-categories` | — | Section padding/color settings |
| `scrolling-icon-with-text` | `scrolling-icon-with-text` | `item` ×4 | Icon/text marquee settings |
| `routine-showcase` | `routine-showcase` | — | Routine/media settings |
| `featured-product` | `featured-product` | `title`, `price`, `description`, `variant_picker`, `quantity_selector`, `buy_buttons` | Product picker + layout settings |
| `before-after-comparison` | `before-after-comparison` | — | Image/compare settings |
| `promotion-countdown` | `promotion-countdown` | — | Timer end date, labels |
| `promo-bannder` | `promo-bannder` | `card` ×2 | Promo card content |
| `about-stats` | `about-stats` | `stat` ×3 | Stat values |
| `blog-stories` | `blog-stories` | `article` ×3 | Blog heading + article blocks |
| `testimonial-featured` | `testimonial-featured` | `testimonial` ×3 | Testimonial content |
| `newsletter-banner` | `newsletter-banner` | — | Newsletter CTA |
| `video-banner` | `video-banner` | — | Video/media |
| `google-map` | `google-map` | — | Map embed settings |

(Exact keys and setting value strings: `templates/index.json` — auto-generated merchant file.)

### `templates/product.json`

| Section key | Type | Block types | Notes |
|-------------|------|-------------|--------|
| `main` | `product` | `vendor`, `title`, `inventory_notice`, `description`, `callout`, `price`, `quantity_selector`, `variant_picker`, `buy_buttons`, `icon_with_text_group`, `share`, `spacer`, `collapsible_tab` | PDP blocks (`product.json:13–112`) |
| `comparison` | `product-comparison-table` | `header`, `price`, `rating`, `metafield_text`, `availability` | Comparison table (`:160–182`) |
| `recommendations` | `product-recommendations` | — | Related products (`:207`) |

### `templates/collection.json`

| Section key | Type | Block types | Setting IDs |
|-------------|------|-------------|-------------|
| `main` | `collection` | — | Filters, grid, hero settings (`collection.json:13`) |

### `templates/search.json`

| Section key | Type |
|-------------|------|
| `main` | `search` |

### `templates/cart.json`

| Section key | Type |
|-------------|------|
| `main` | `cart` |

### `templates/blog.json` / `templates/article.json`

| Section key | Type | Block types |
|-------------|------|-------------|
| `main` | `blog` / `article` | — |
| `blog_stories_*` | `blog-stories` | `article` ×3 |
| `newsletter_*` | `newsletter-banner` | — |

### `templates/page.json`

| Section key | Type |
|-------------|------|
| `main` | `page` |

### `templates/page.about.json`

| Section key | Type | Block types |
|-------------|------|-------------|
| `main` | `main-page-about` | — |
| `philosophy-section` | `philosophy-section` | `card` ×3 |
| `promise-section` | `promise-section` | `accordion_item` ×4 |
| `brand-statement` | `brand-statement` | — |
| `testimonial-featured` | `testimonial-featured` | `testimonial` |
| `before-after-comparison` | `before-after-comparison` | — |
| `newsletter-banner` | `newsletter-banner` | — |

### `templates/page.contact.json`

| Section key | Type | Block types |
|-------------|------|-------------|
| `main` | `main-page-contact` | — |
| `blog-stories` | `blog-stories` | `article` ×3 |
| `about-stats` | `about-stats` | `stat` ×3 |

### `templates/list-collections.json`

| Section key | Type |
|-------------|------|
| `main` | `collections` |

### `templates/404.json`

| Section key | Type | Block types |
|-------------|------|-------------|
| `main` | `404` | — |
| `blog_stories_*` | `blog-stories` | `article` ×3 |

### `templates/password.json`

| Section key | Type |
|-------------|------|
| `header` | `password-header` |
| `main` | `password` |
| `footer` | `password-footer` |

### Gift card

| Resource | Type |
|----------|------|
| `templates/gift_card.liquid` | Liquid template (not JSON) — uses `gift-card.js` / `gift-card.css` |

## Sections with presets but no saved JSON instance

| Section type | Preset reference | Merchant impact |
|--------------|------------------|-----------------|
| `custom-liquid` | `sections/custom-liquid.liquid` schema `presets` | Add via Theme Editor only |
| `icon-with-text` | `sections/icon-with-text.liquid` schema `presets` | Add via Theme Editor only |

## Findings

| ID | Severity | Description |
|----|----------|-------------|
| — | — | **None.** All referenced section and block types exist in section schemas at this commit. |

## Notable merchant coupling (for migration)

1. **Typo-stable section type `promo-bannder`** appears in `templates/index.json` (`grep templates/index.json` → `"type": "promo-bannder"`). Renaming requires JSON migration.
2. **Super menu** header settings reference `menu: "main-menu"` (`header-group.json:53`) — navigation content is merchant-owned, not in git.
3. **`pickup-availability` and `collection-navigation-items`** are not template instances but are required for PDP/collection AJAX (Section Rendering API).
