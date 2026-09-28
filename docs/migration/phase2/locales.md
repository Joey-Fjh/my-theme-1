# Phase 2 locale key comparison

File pair: `locales/en.default.json` and `locales/en.default.schema.json` (schema file compared separately in acceptance; leaf counts below are `en.default.json`).

## en.default.json summary

| Metric | Theme | Skeleton |
| --- | ---: | ---: |
| Leaf keys | 314 | 113 |
| Theme-only leaves | 218 | — |
| Skeleton-only leaves | — | 17 |

Command: parse JSON from `git show HEAD:locales/en.default.json` vs `git show skeleton/main:locales/en.default.json`, flatten object paths.

## Overlapping top-level namespaces

- `404`
- `general`
- `blog`
- `cart`
- `contact`
- `collections`
- `footer`
- `gift_card`
- `recipient`
- `newsletter`
- `pagination`
- `password`
- `products`
- `search`
- `sections`
- `accessibility`

Theme-only top-level: `toast`, `components`, `testimonial`.

Skeleton-only top-level: `quantity`, `blocks`.

## Conflicting / overlapping keys (same path, different value)

Command (phase 2):

```text
node -e "/* flatten leaf paths from git show HEAD vs skeleton/main; compare values */"
```

Result: **0** shared leaf paths with differing string values (96 shared leaves compared). Overlap risk is namespace merge (adding skeleton-only `blocks.*`, `quantity.*` and theme-only `toast.*`, `components.*`), not value clashes on identical paths.

High-traffic shared namespaces: `404.*`, `general.*`, `blog.*`, `cart.*`, `collections.*`, `products.*`, `search.*`, `sections.*`, `accessibility.*`.

### Sample theme-only leaves (first 40)

- `404.not_found`
- `accessibility.account`
- `accessibility.announcements`
- `accessibility.back_to_second_level`
- `accessibility.carousel`
- `accessibility.clear_item`
- `accessibility.close`
- `accessibility.close_cart_drawer`
- `accessibility.close_collection_navigation_drawer`
- `accessibility.close_dialog`
- `accessibility.close_filters_drawer`
- `accessibility.close_mobile_menu`
- `accessibility.close_newsletter_popup`
- `accessibility.close_quick_view`
- `accessibility.close_search_drawer`
- `accessibility.close_zoom`
- `accessibility.collection_navigation`
- `accessibility.dismiss`
- `accessibility.drag_to_compare`
- `accessibility.featured_products_carousel`
- `accessibility.google_map`
- `accessibility.hero_slides`
- `accessibility.image_navigation`
- `accessibility.image_zoom`
- `accessibility.menu`
- `accessibility.mobile_menu`
- `accessibility.mute_video`
- `accessibility.next_image`
- `accessibility.next_slide`
- `accessibility.open_image_zoom`
- `accessibility.pause_slideshow`
- `accessibility.pause_video`
- `accessibility.play_slideshow`
- `accessibility.play_video`
- `accessibility.previous_image`
- `accessibility.previous_slide`
- `accessibility.product_card_actions_hide`
- `accessibility.product_card_actions_show`
- `accessibility.product_comparison`
- `accessibility.product_gallery_carousel`

### Sample skeleton-only leaves (first 40)

- `blocks.button.placeholders.empty`
- `blocks.heading.placeholders.empty`
- `blog.read_more`
- `cart.errors.generic`
- `cart.errors.network_error`
- `cart.errors.rate_limited`
- `cart.errors.server_error`
- `cart.errors.timeout`
- `collections.list_heading`
- `pagination.label`
- `password.email_placeholder`
- `password.message_html`
- `products.product.added_to_cart`
- `quantity.max_quantity`
- `quantity.min_quantity`
- `quantity.quantity_above_max`
- `quantity.quantity_below_min`

## Merge notes for phase 3+

- Skeleton introduces `blocks.*`, `pagination.*`, `quantity.*` namespaces (skeleton-only top-level).
- Theme carries `sections.*`, `toast.*`, and broader cart/product copy (`docs/migration/phase0/capabilities.md`).
- Renaming or deleting keys referenced in Liquid `| t` filters is **USER DECISION** when merchant-facing strings would change without locale update.

