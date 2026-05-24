# Shopify Theme Store Audit Summary

Date: 2026-05-08

This file tracks the current implementation status of Theme Store-related work in this repository.
It replaces older audit notes that no longer reflect the current codebase.

## Current Snapshot

The theme is no longer in the "missing most basics" state.

Several P0 items are already implemented on the theme side, while others still need work or live-store verification.

Use this file as the current status snapshot. Do not rely on older checklists without comparing them against the repository.

Important: "Implemented on theme side" below describes capability coverage, not merge approval for the current uncommitted patch.

---

## Confirmed Implemented or Partially Implemented

### P0-1 Main Product app blocks

Status: Implemented

Evidence:

- `sections/product.liquid`
- `snippets/product-info-blocks.liquid`

Notes:

- `@app` is declared in the product section schema.
- Existing `when '@app'` rendering path is already in place.

### P0-2 Featured Product app blocks

Status: Implemented

Evidence:

- `sections/featured-product.liquid`
- `snippets/product-info-blocks.liquid`

Notes:

- `@app` is declared in the featured product schema.

### P0-3 Custom Liquid section

Status: Implemented

Evidence:

- `sections/custom-liquid.liquid`

Notes:

- Implemented as an independent section, not as a block added to every existing section.

### P0-4 Pickup Availability

Status: Implemented on theme side

Evidence:

- `snippets/buy-buttons.liquid`
- `sections/pickup-availability.liquid`
- `assets/alpine.components.js`
- `assets/base.js`
- `locales/en.default.json`

Notes:

- The theme now renders a pickup availability container on PDP.
- Variant changes trigger a refresh through the existing event architecture.
- AJAX HTML refresh now flows through `window.ShopifySectionRefresher.render()`.
- Live visibility still depends on store pickup data and store configuration.

### P0-5 Complementary Products

Status: Implemented

Evidence:

- `sections/product-recommendations.liquid`
- `snippets/product-recommendations-section.liquid`

Notes:

- This was implemented by extending the existing recommendations section.
- The section now supports both `related` and `complementary` through a `recommendation_type` setting.
- The final implementation is not a separate `complementary-products` section.

### P0-11 Follow on Shop

Status: Implemented on theme side

Evidence:

- `sections/footer.liquid`

Notes:

- Theme-side integration exists behind a footer setting and `shop.features.follow_on_shop?`.
- Actual storefront visibility still depends on Shop / store-side eligibility and configuration.

---

## Still Pending or Not Fully Closed

### P0-6 Shop Pay Installments

Status: Pending

Notes:

- No final `payment_terms` implementation is in place yet.

### P0-7 Unit Pricing

Status: Pending

Notes:

- Product, listing, and cart unit-pricing coverage is not complete.

### P0-8 Selling Plans / Subscriptions

Status: Pending

Notes:

- No complete selling-plan support has been added yet.

### P0-9 Rich Product Media

Status: Pending

Notes:

- Product gallery still needs a full `product.media` upgrade path.

### P0-10 Cart accelerated checkout / cart form capability

Status: Pending

Notes:

- Cart-side accelerated checkout and form structure work still needs review and implementation.

---

## Important Clarifications

These items were previously easy to misstate and should now be treated as clarified:

- Country / language selector already exists, but is placed in the announcement bar.
- Variant image sync already exists.
- Related products already exist; the actual missing capability was complementary products.
- Theme-side Follow on Shop support is not the same as guaranteed storefront visibility.
- Theme-side Pickup Availability support is not the same as guaranteed live data visibility.

---

## Recommended Next Focus

Recommended remaining P0 order:

1. `P0-6` Shop Pay Installments
2. `P0-7` Unit Pricing
3. `P0-10` Cart accelerated checkout / cart form capability
4. `P0-8` Selling Plans / Subscriptions
5. `P0-9` Rich Product Media
