# Global Settings File-by-File Review

**Task**: Review each section file for global settings chain correctness (color, typography, spacing) and component usage. Verify font classes use correct CSS variable chain, remove redundant declarations, and clean up dead code.

**Total section files**: 38 | **Reviewed**: 38 ✅
**Total snippet files**: 52 | **Reviewed**: 52 ✅

---

## Sections

- [x] `sections/404.liquid` — reviewed before this session; icons and links components adjusted
- [x] `sections/about-stats.liquid` — font chain correct, no changes needed; image component usage verified
- [x] `sections/announcement-bar.liquid` — added `section-color-apply`, removed pause button + related JS/CSS/schema/locale, removed dead `color` param from social-icons
- [x] `sections/article.liquid` — color/typography chain correct; two `<h1>` noted; `sub-heading` inherits heading weight correctly; motion deferred

- [x] `sections/before-after-comparison.liquid` — color/typography chain correct; `text-theme-text` on wrapper redundant with `section-color-apply`; `tracking-wider` on labels bypasses body letter-spacing var (design intent noted)
- [x] `sections/blog-stories.liquid` — color/typography chain correct; no explicit tokens, fully inherits from section-color-apply and element defaults
- [x] `sections/blog.liquid` — color/typography chain correct; dual color scheme (header + content); Motion.heroReveal + Motion.scrollReveal compliant
- [x] `sections/brand-statement.liquid` — color/typography chain correct; `leading-[1.12]` intentional design override; GSAP no-JS fallback correct
- [x] `sections/cart-overlay.liquid` — color/typography chain correct; `text-theme-text/80` → `text-theme-text-80` fixed; no `section-color-apply` needed (ui-dialog handles color)
- [x] `sections/cart.liquid` — color/typography chain correct; accordion locale pipe chain fixed (translate before append); Layer Rule 5 added (alpha levels fixed to 20/50/80/100)
- [x] `sections/collection.liquid` — 颜色/typography/spacing 链路正确; 子组件 pagination.liquid 有硬编码 hex 颜色和内联样式待重构; loading.liquid `bg-white/60` 待改; filters-drawer/sort-by-dropdown `border-theme-border-soft` 已知待迁移
- [x] `sections/collections.liquid` — 已修复: section-color-apply, h1 tier, 移除多余 bg/text 类; 硬编码 shadow 待定; pagination 子组件已知问题
- [x] `sections/custom-liquid.liquid` — 已修复: section-color-apply, 移除多余 bg/text 类
- [x] `sections/featured-product.liquid` — 已修复: section-color-apply, 移除多余 bg/text 类
- [x] `sections/featured-products.liquid` — 已修复: section-color-apply; `text-theme-text/20` 小问题待定
- [x] `sections/footer.liquid` — section-color-apply ✓; h2/h3 无 tier class（原生元素继承，不重复加 class）
- [x] `sections/header.liquid` — section-color-apply 已有，颜色/字体链路正确
- [x] `sections/icon-with-text.liquid` — 已修复: section-color-apply, 移除多余 bg/text 类
- [x] `sections/main-page-about.liquid` — 已修复: section-color-apply, 移除 text-white
- [x] `sections/main-page-contact.liquid` — 缺少 section-color-apply; text-white/80 (L43); bg-green-50/text-green-800 (L88), bg-red-50/text-red-700 (L97) 硬编码; border-theme-border-soft 多处; form_background_color 内联 hex (L69)
- [x] `sections/newsletter-banner.liquid` — section-color-apply ✓，无问题
- [x] `sections/newsletter-overlay.liquid` — 无 section-color-apply，用 bg-(--newsletter-bg) 自定义颜色，设计意图
- [x] `sections/page.liquid` — section-color-apply ✓
- [x] `sections/password.liquid` — 极简表单，无颜色问题
- [x] `sections/philosophy-section.liquid` — section-color-apply ✓
- [x] `sections/pickup-availability.liquid` — section-color-apply on icon span (L20)，设计意图
- [x] `sections/product-comparison-table.liquid` — section-color-apply ✓; text-gray-500 硬编码 (L187) 已知
- [x] `sections/product-recommendations.liquid` — section-color-apply ✓
- [x] `sections/product.liquid` — section-color-apply ✓
- [x] `sections/promo-bannder.liquid` — section-color-apply ✓
- [x] `sections/promotion-countdown.liquid` — section-color-apply ✓
- [x] `sections/promise-section.liquid` — 无 section-color-apply，设计意图
- [x] `sections/routine-showcase.liquid` — section-color-apply 在内层 div，设计意图
- [x] `sections/scroll-categories.liquid` — section-color-apply ✓
- [x] `sections/search-overlay.liquid` — border-theme-border-strong (L30) 兼容别名待迁移; 颜色由 ui-dialog 处理
- [x] `sections/search.liquid` — section-color-apply ✓
- [x] `sections/slides-show.liquid` — section-color-apply ✓
- [x] `sections/testimonial-featured.liquid` — section-color-apply ✓

---

## Snippets

### 🔴 Hardcoded colors (need refactoring)

- [ ] `snippets/pagination.liquid` — hex 颜色 (#1a1a1a, #2d3a2e, #ffffff)、内联 font-size、rgba border
- [ ] `snippets/ui-toast.liquid` — bg-red-50/text-red-900、bg-zinc-800/text-white、text-red-500
- [ ] `snippets/image-lightbox.liquid` — text-white/80、text-white、#000000 overlay

### ✅ Compatibility aliases (migrated)

- [x] `snippets/filters-drawer.liquid` — border-theme-border-soft → -20
- [x] `snippets/sort-by-dropdown.liquid` — border-theme-border-soft → -20
- [x] `snippets/buy-buttons.liquid` — border-theme-border-soft → -20
- [x] `snippets/product-recommendations-section.liquid` — border-theme-border-soft → -20
- [x] `snippets/search-predictive-panel.liquid` — border-theme-border-soft → -20
- [x] `snippets/quantity-selector.liquid` — border-theme-border-soft → -20
- [x] `snippets/search-results-tabs.liquid` — border-theme-border-soft → -20
- [x] `snippets/product-variant-picker.liquid` — border-theme-border-strong → -border
- [x] `sections/search-overlay.liquid` — border-theme-border-strong → -border
- [x] `sections/cart.liquid` — border-theme-border-soft → -20
- [x] `tailwind.input.css` — removed --color-theme-border-soft and --color-focus-soft

### 🟡 Minor

- [ ] `snippets/loading.liquid` — bg-white/60 硬编码

### ✅ No issues

`accordion` · `active-filters` · `country-localization` · `css-variables` · `filters-field` · `filters-groups` · `flip-digit` · `header-dropdown-menu` · `header-dropdown-super-menu` · `header-mobile-menu-drawer` · `icon-with-text-item` · `icons` · `image` · `image-magnifier` · `language-localization` · `link` · `meta-tags` · `motion-transition` · `product-block-icon` · `product-card` · `product-card-variant-panel` · `product-gallery` · `product-gallery-carousel` · `product-gallery-grid` · `product-gallery-stacked` · `product-gallery-thumbnails` · `product-info-blocks` · `product-purchase-stack` · `product-quick-view` · `quick-view-buy-actions` · `rotating-badge` · `show-more-icon` · `social-icons` · `starts` · `tab-control` · `ui-dialog` · `watermark`
