# Global Settings File-by-File Review

**Task**: Review each section file for global settings chain correctness (color, typography, spacing) and component usage. Verify font classes use correct CSS variable chain, remove redundant declarations, and clean up dead code.

**Total files**: 38 section `.liquid` files
**Reviewed**: 11 | **Remaining**: 27

---

## Reviewed

- [x] `sections/404.liquid` — reviewed before this session; icons and links components adjusted
- [x] `sections/about-stats.liquid` — font chain correct, no changes needed; image component usage verified
- [x] `sections/announcement-bar.liquid` — added `section-color-apply`, removed pause button + related JS/CSS/schema/locale, removed dead `color` param from social-icons
- [x] `sections/article.liquid` — color/typography chain correct; two `<h1>` noted; `sub-heading` inherits heading weight correctly; motion deferred

## Not Reviewed

- [x] `sections/before-after-comparison.liquid` — color/typography chain correct; `text-theme-text` on wrapper redundant with `section-color-apply`; `tracking-wider` on labels bypasses body letter-spacing var (design intent noted)
- [x] `sections/blog-stories.liquid` — color/typography chain correct; no explicit tokens, fully inherits from section-color-apply and element defaults
- [x] `sections/blog.liquid` — color/typography chain correct; dual color scheme (header + content); Motion.heroReveal + Motion.scrollReveal compliant
- [x] `sections/brand-statement.liquid` — color/typography chain correct; `leading-[1.12]` intentional design override; GSAP no-JS fallback correct
- [x] `sections/cart-overlay.liquid` — color/typography chain correct; `text-theme-text/80` → `text-theme-text-80` fixed; no `section-color-apply` needed (ui-dialog handles color)
- [x] `sections/cart.liquid` — color/typography chain correct; accordion locale pipe chain fixed (translate before append); Layer Rule 5 added (alpha levels fixed to 20/50/80/100)
- [ ] `sections/collection.liquid`
- [ ] `sections/collections.liquid`
- [ ] `sections/custom-liquid.liquid`
- [ ] `sections/featured-product.liquid`
- [ ] `sections/featured-products.liquid`
- [ ] `sections/footer.liquid`
- [ ] `sections/header.liquid`
- [ ] `sections/icon-with-text.liquid`
- [ ] `sections/main-page-about.liquid`
- [ ] `sections/main-page-contact.liquid`
- [ ] `sections/newsletter-banner.liquid`
- [ ] `sections/newsletter-overlay.liquid`
- [ ] `sections/page.liquid`
- [ ] `sections/password.liquid`
- [ ] `sections/philosophy-section.liquid`
- [ ] `sections/pickup-availability.liquid`
- [ ] `sections/product-comparison-table.liquid`
- [ ] `sections/product-recommendations.liquid`
- [ ] `sections/product.liquid`
- [ ] `sections/promo-bannder.liquid`
- [ ] `sections/promotion-countdown.liquid`
- [ ] `sections/promise-section.liquid`
- [ ] `sections/routine-showcase.liquid`
- [ ] `sections/scroll-categories.liquid`
- [ ] `sections/search-overlay.liquid`
- [ ] `sections/search.liquid`
- [ ] `sections/slides-show.liquid`
- [ ] `sections/testimonial-featured.liquid`
