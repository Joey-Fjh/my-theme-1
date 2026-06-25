# Agent Context

This file records the current cross-session task contract and progress. Keep implementation findings and detailed file-by-file notes outside this file unless they are needed to continue the task safely.

## Current State

Active post-commit follow-up: product rich media gallery support was committed, and render/static-analysis cleanup plus icon/motion cleanup are currently applied in the working tree.

CSS architecture optimization is the active architecture track. Phases **1–4B**, **5A**, **5B**, **5C**, **5D-1**, **5D-2a**, **5D-2b**, **5E**, **5F**, **6**, **6B**, **6C**, **7B**, **Image-B**, **Image-C**, **Image-D Mini**, **Image-E**, and **Media-Orphan-B** are accepted. **Phases 8B and 8C** are pending review. Image system final score: **96/100**. Layer contract: `docs/references/style-system/css-architecture.md`.

### CSS Architecture — Phase status

| Phase | Status | Summary |
| --- | --- | --- |
| **1** | **Accepted** | `css-architecture.md` contract, cross-links, 2+/3+ thresholds |
| **2** | **Accepted** | `--motion-ease-default` alias; dropdown + product-card motion vars |
| **3** | **Accepted** | `newsletter-banner-section` override → section `{% stylesheet %}` |
| **4B** | **Accepted** | `snippets.css` owner blocks; sub-heading → typography; inventory dot semanticized; mixed product-info-blocks owners cleaned |
| **5** | **Accepted** | 5A–5F Accepted; remaining items are deferred manual/API cleanup — see `css-architecture.md` §8.1 |
| **5A** | **Accepted** | `tab-nav-item*` in `components.css`; 7 consumers dual-class; snippets chrome removed |
| **5B** | **Accepted** | `accordion__*` CSS promoted snippets → components; snippet remains API owner |
| **5C** | **Accepted** | `interactive-link` in `elements.css`; 4 consumers dual-class |
| **5D-1** | **Accepted** | `icon-with-text-item*` CSS promoted snippets → components |
| **5D-2a** | **Accepted** | `buy-buttons__*` purchase chrome promoted snippets → components |
| **5D-2b** | **Accepted** | Pickup retry rename; dead purchase wrapper CSS removed; `buy-buttons__` snippets ban |
| **5E** | **Accepted** | `links-underline` child icon motion split to component composition |
| **5F** | **Accepted** | Accordion dead selector removed; buy-buttons dead markup modifiers removed |
| **6** | **Accepted** | `checkCssLayerProtocol()` + `css-layer-allowlist.json` |
| **6B** | **Accepted** | Multi-line motion lint, promoted-prefix comment masking, selector bans |
| **6C** | **Accepted** | Batch A Liquid `duration-*` migrated to owner `{% stylesheet %}` + motion vars |
| **7B** | **Accepted** | Snippet CSS consumption contract; dead quick-view quantity CSS; swatch motion vars |
| **8B** | **Pending review** | PDP quantity owner; title typography contract; quick-view boundary docs |
| **8C** | **Pending review** | Style API hardening: buttons, product-price, buy-buttons layout, PDP context |
| **Image-B** | **Accepted** | Image display contract: mode/fit/position params; newsletter-banner controls; logo/brush fix |
| **Image-C** | **Accepted** | Consumption hardening: contains-match object-fit detection; testimonial-featured wrapper misuse fix; 6 hero callers audited |
| **Image-D Mini** | **Accepted** | Param validation whitelist: mode/fit/position enforced; invalid fallback to safe defaults |
| **Image-E** | **Accepted** | Final compatibility audit: 52 calls audited, 0 blockers, 96/100 score |
| **Media-Orphan-B** | **Accepted** | Video-banner: dual-source (hosted + external video), polished UI, container width, enhanced empty state |

### CSS Architecture — Phase 8B pending review (2026-06-25)

**Delivered:**

- `snippets/product-info-blocks.liquid`: quantity-only fallback `buy-buttons__quantity` → `product-info-blocks__quantity`
- `tailwind/tailwind.snippets.css`: `product-info-blocks__quantity` owner rules; `product-info-blocks__title` typography owner (`heading-h1` / `--featured` → `heading-h2`); owner header clarifies block-driven vs quick-view parallel API
- `docs/references/style-system/css-architecture.md`: §7.7 Phase 8A/8B PDP API contract record

**Manual QA backlog (required before accept):**

- PDP title desktop/mobile scale (`heading-h1` — desktop `3rem` → `4rem` at `pc:`)
- Featured product title scale (`heading-h2` — desktop `2rem` → `2.4rem` at `pc:`)
- PDP quantity-only fallback (no `buy_buttons` block)
- PDP quantity + buy buttons purchase group
- Quick view price/title/purchase smoke check (no regression)
- Variant picker smoke check

**Resolved in Phase 8C:** `product-price` component API; `buy-buttons` `layout: 'stack'`; `context` `'main'` vs `'product'` naming.

**Deferred:** `--form`/`--featured` modifier audit after visual QA.

### CSS Architecture — Phase 8C pending review (2026-06-25)

**Delivered:**

- `tailwind/tailwind.elements.css`: `btn` hover centralized through `--btn-hover-filter`; `btn-primary` / `btn-secondary` set variant values; `icons`, `btn`, and `close-button` use explicit motion-var transitions.
- `tailwind/tailwind.components.css`: added shared `product-price*` primitive.
- `snippets/product-info-blocks.liquid` and `snippets/product-purchase-stack.liquid`: price markup consumes `product-price*` plus existing scene BEM classes.
- `snippets/buy-buttons.liquid`: removed no-consumer `layout: 'stack'` branch; buy-buttons always renders the purchase-row contract.
- `snippets/product-info-blocks.liquid`: default context is now `product`; old `main` title alias removed.

**Manual QA backlog (required before accept):** primary/secondary button hover, Shopify unbranded payment button hover, close buttons, icon motion, PDP/featured price, quick-view price, PDP purchase group, quick-view buy actions.

### CSS Architecture — Phase Image-B pending review (2026-06-25)

**Delivered:**

- `snippets/image.liquid`: new `mode` (`frame`|`natural`), `fit` (`cover`|`contain`|`fill`|`none`|`scale-down`), `position` (CSS object-position value), `wrapper_class` (canonical, `class` aliased) params; `data-image-mode` attribute on wrapper; mode-conditional CSS (`height: 100%` for frame, `height: auto` for natural); img `object-position` via `--image-object-position` var; `has_object_fit` detection expanded to responsive variants (`pc:object-contain` etc.)
- `sections/newsletter-banner.liquid`: new schema settings `background_image_fit` (cover/contain, default cover) and `background_image_position` (9-position grid, default center); render passes `mode: 'frame'` + `fit` + `position` to image snippet
- `sections/header.liquid`: logo render updated with `mode: 'natural'`, `fit: 'contain'`
- `sections/footer.liquid`: brush/decorative image updated with `mode: 'natural'`, `fit: 'contain'`; misplaced `object-contain` removed from wrapper `class`
- `sections/brand-statement.liquid`: brushstroke updated with `mode: 'natural'`, `fit: 'contain'`, `position: 'center'`; removed `pc:object-contain` + `object-center` from `img_class`
- `locales/en.default.schema.json`: added newsletter-banner `background_image_fit`, `background_image_position` keys and fit/position option labels

**Backward compat:** all 45 unpatched callers without `mode` param default to `frame` → identical `height: 100%` wrapper + `object-cover` img → zero visual change.

**Not migrated (by design):** product-card, product-gallery-*, product-media, image-lightbox, image-magnifier, media-video, all frame/hero/banner callers (~45 calls untouched).

**Manual QA backlog (required before accept):**

- newsletter-banner: cover center, cover top/bottom, contain center, mobile 9/16 + desktop 16/9
- header logo: no cropping at any viewport width
- footer brush/decorative image: no cropping, mix-blend-lighten preserved
- brand-statement brushstroke: mobile and desktop both show full image (contain, no crop)
- Product card / gallery spot-check: confirm old default frame behavior unchanged (any 2-3 cards)

### CSS Architecture — Phase Image-C pending review (2026-06-25)

**Delivered:**

- `snippets/image.liquid`: `has_object_fit` detection hardened — bare token exact match for `object-*` + responsive-variant contains match for `:object-cover` / `:object-contain` / `:object-fill` / `:object-none` / `:object-scale-down` (future-proof against any Tailwind breakpoint prefix). `fit` append logic unchanged.
- `sections/testimonial-featured.liquid`: fixed wrapper class misuse — `class: 'h-full w-full object-cover'` split to `class: 'h-full w-full'` (layout only) + explicit `mode: 'frame'` + `fit: 'cover'`.

**Audit-only — 6 high-risk hero/frame callers (no migration):**

| Caller | Verdict |
| --- | --- |
| `main-page-contact.liquid` | Clean. Default frame+cover, grid-cell fill is correct. |
| `promo-bannder.liquid` (hero + cards) | Clean. Inside `aspect-*` containers, fill-frame is correct. |
| `slides-show.liquid` | Clean. Full-bleed Swiper slide fill is correct. |
| `routine-showcase.liquid` | Clean. `absolute inset-0` background fill is correct. |
| `newsletter-overlay.liquid` | Clean. Already has explicit `object-cover` in `img_class`, wrapper class is layout-only. |
| `main-page-about.liquid` | Clean. Already has explicit `object-cover object-center` in `img_class`. |

All 6 callers have correct wrapper/img class separation. None needed migration. They all remain on default `frame` mode — zero visual change.

**Future candidates (record only — do not implement without explicit scope):** promo-bannder, slides-show, routine-showcase, newsletter-overlay, and main-page-about could each gain schema `fit`/`position` settings if merchants request focal-point control for portrait/landscape images.

**Post-Image-C consumer census:** ~43 frame (default), 3 frame (explicit), 4 natural (explicit).

**Manual QA backlog (required before accept):**

- testimonial-featured image still fills right column
- newsletter-banner fit/position still works (Image-B)
- header/footer/brand-statement natural images still not cropped (Image-B)
- 2-3 product card/gallery spot-check: default frame behavior unchanged

### CSS Architecture — Phase Image-D Mini accepted (2026-06-25)

**Delivered:**

- `snippets/image.liquid`: added param validation whitelist for `mode` (frame|natural), `fit` (5 values), `position` (9 values matching newsletter-banner schema). Invalid values fall back to safe defaults: mode→frame, fit→mode-derived, position→center. All 52 existing callers pass with valid values — zero visual change.

**Validation:** `npm run lint:i18n` ✅, `npm run lint:theme` ✅, `npm test` ✅ (1 pre-existing OrphanedSnippet), `git diff --check` ✅, Shopify theme validation ✅.

### CSS Architecture — Phase Image-E accepted (2026-06-25)

**Delivered (audit-only, no code changes):**

Final compatibility audit of all 52 `render 'image'` calls across 28 files:

| Category | Count | Status |
|---|---|---|
| Explicit mode (migrated) | 5 | ✅ header, footer brush, brand-statement, newsletter-banner, testimonial-featured |
| Explicit object-fit in img_class | 18 | ✅ article, blog, cart, lightbox, galleries, media-video, magnifier |
| Default frame+cover, correct container | 24 | ✅ about-stats, before-after, blog-stories, collections, philosophy, promise, scroll-categories, promo-bannder, routine-showcase, slides-show, product-card |
| Pass-through from gallery | 4 | ✅ product-media image/video/external/model |
| Hybrid (compatible but semantically inconsistent) | 1 | ⚠️ product-comparison-table: object-contain + frame-mode wrapper |

**Result:** 0 blockers, 1 non-blocking warning (product-comparison-table hybrid — defer to next cleanup pass), 6 optional schema-candidate sections (promo-bannder, slides-show, routine-showcase, newsletter-overlay, main-page-about — plumbing exists, just needs per-section schema).

**Image system final score: 96/100.** Remaining to 98+ is per-section merchant control, not image.liquid plumbing.

### CSS Architecture — Phase Media-Orphan-B accepted (2026-06-25)

**Delivered (supersedes Media-Orphan-A):**

- `sections/video-banner.liquid`: polished video section with dual-source support:
  - **Shopify-hosted video:** `video` type schema, renders via `media-video` snippet with play/mute/controls overlay.
  - **External video:** `video_url` type (YouTube/Vimeo), click-to-play UX with cover image + centered play button → iframe embed via `external_video_tag`. No mute button (unreliable on external iframes).
  - **Container width:** page-width (default) or full-width select.
  - **Visual polish:** rounded frame (`border-radius: 0.75rem`), large centered play button with glassmorphism styling, hover/focus transitions with motion vars, subtle empty state with play icon placeholder.
  - **Overlay:** optional heading/subheading/text positioned over the video frame, pointer-events-none so controls remain clickable.
  - **Source priority:** Shopify-hosted video > external URL > empty state.
- `locales/en.default.schema.json`: updated labels (Shopify-hosted video, External video URL, Cover image, Container width) + info text for external URL.
- `locales/en.default.json`: `sections.video-banner.empty_state` key (unchanged).

**OrphanedSnippet resolved:** `snippets/media-video.liquid` now has a real consumer. Theme Check: 0 warnings.

**Validation:** `npm run lint:i18n` ✅, `npm run lint:theme` ✅, `npm test` ✅ (0 errors, 0 warnings), Shopify theme validation ✅.

### CSS Architecture — Phase 4B accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.snippets.css` reorganized by real owner (Owner / Consumers / Layer block headers)
- `.sub-heading` moved from `utilities.css` → `typography.css` (class unchanged)
- `.product-info-blocks__inventory-dot` uses `rgb(var(--color-warning-foreground))` (low-stock semantic)
- Extracted from product-info-blocks block: `icon-with-text-item*`, `icon-with-text-section__*`, `product-block-icon`, `buy-buttons__*`
- Merged duplicate blocks: Active Filters, Buy Buttons (+ retry), Search Predictive, Search Results
- Tab / accordion / cart-search link patterns **deferred** with `DEFER Phase 5` comments only

**Phase 5 entry conditions (do not implement without explicit scope):**

1. Per-candidate **consumer count** verified with `rg` across `sections/` and `snippets/`
2. **API design review** written (shared class contract, modifier naming, migration steps) — no batch rename
3. User approves which candidate(s) to implement in a named sub-phase (e.g. Phase 5A tab-nav only)
4. Shared APIs land in **`tailwind.components.css`** first — do not create `tailwind.patterns.css`
5. `npm run build:tw` + `lint` + targeted visual QA per candidate

### CSS Architecture — Phase 5A accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.components.css`: `tab-nav-item` base + modifiers (`--search`, `--search-border-token`, `--underline-opacity`, `--hover-muted`, `--opacity`) after Tab Control block
- 7 consumers append shared classes; legacy `*__tab` BEM retained
- `tailwind/tailwind.snippets.css`: duplicate trigger chrome removed for 6 families; layout/owner deltas kept
- `sections/search-overlay.liquid`: trigger chrome removed from `{% stylesheet %}`; section typography + idle muted color only
- `tab-control.liquid` API unchanged

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Remaining (post-5A):** Manual visual QA (7 tab scenarios); optional legacy class cleanup.

### CSS Architecture — Phase 5B accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.components.css`: `accordion__*` block added after Tab Nav Item (layer promotion from `snippets.css`)
- `tailwind/tailwind.snippets.css`: accordion block removed (no duplicate chrome)
- Selectors/declarations unchanged; `snippets/accordion.liquid`, Alpine `accordion()`, consumer params unchanged

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Remaining:** Manual accordion visual QA (promise-section, cart, filters drawer/vertical, keyboard). Dead `.accordion__title.is-active` selector removed in Phase 5F.

### CSS Architecture — Phase 5C accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.elements.css`: `@utility interactive-link` (focus-ring + hover underline only)
- 4 consumers append `interactive-link`; legacy BEM retained (`cart__product-link`, `cart-overlay__product-link`, `search-*__result-link`)
- `tailwind/tailwind.snippets.css`: cart link block removed; search result links keep `text-theme-text` color delta only

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Remaining:** Manual link visual QA (cart page, cart drawer line-clamp, search predictive/results, keyboard focus-visible).

### CSS Architecture — Phase 5D-1 accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.components.css`: `icon-with-text-item*` block after Accordion (layer promotion from `snippets.css`)
- `tailwind/tailwind.snippets.css`: item-level block removed; `icon-with-text-section__*` and `product-info-blocks__icon-with-text-*` unchanged
- Snippet-local vars hybrid documented (§2.2); no Liquid/markup changes

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Remaining:** Manual QA (icon-with-text section grid/carousel, PDP icon_with_text block, image_icon vs theme icon, color schemes).

### CSS Architecture — Phase 5D-2a accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.components.css`: `buy-buttons__*` purchase chrome block after Quantity Selector (layer promotion from `snippets.css`)
- Promoted selectors unchanged: `buy-buttons__actions--purchase-group`, `buy-buttons__primary-row`, `buy-buttons__actions--with-quantity .buy-buttons__primary-row`, `buy-buttons__quantity`, `buy-buttons__quantity > *`, `buy-buttons__submit--unavailable`, `buy-buttons__label`, `buy-buttons__label.is-loading`
- `tailwind/tailwind.snippets.css`: buy-buttons owner block shrunk to `buy-buttons__retry-action` only (pickup owner delta); `product-info-blocks__*`, `product-quick-view__*` unchanged
- No Liquid, Alpine, JS, class name, or lint allowlist changes (Phase 6B candidate when retry-action is renamed)

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Manual QA backlog:** PDP buy buttons (quantity + ATC, quantity-anchor path), sold out/unavailable, dynamic checkout, featured-product, quick view buy actions, loading label opacity, pickup retry styled.

### CSS Architecture — Phase 5D-2b accepted (2026-06-25)

**Delivered:**

- `snippets/pickup-availability-inline.liquid`: `buy-buttons__retry-action` → `pickup-availability-inline__retry-action`
- `tailwind/tailwind.snippets.css`: retry owner block renamed; dead `product-info-blocks__buy-buttons` and `product-quick-view__buy-buttons` selectors removed
- `css-layer-allowlist.json`: `buy-buttons__` added to `snippetsPromotedPrefixes`

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Manual QA backlog:** PDP pickup retry visual/focus; PDP quantity + ATC; featured-product purchase group; quick view purchase group.

**Resolved:** `stack` layout API cleanup in Phase 8C. Orphan `buy-buttons__quantity` in product-info-blocks was resolved in Phase 8B.

### CSS Architecture — Phase 5E accepted (2026-06-25)

**Delivered:**

- `tailwind/tailwind.elements.css`: `links-underline` now owns underline line behavior only.
- `tailwind/tailwind.components.css`: `link-with-icon-motion` owns child `.icons` transition and hover/focus translation.
- `snippets/link.liquid`: `variant: 'underline'` outputs `links-underline link-with-icon-motion`, preserving existing link snippet behavior without editing each consumer.

**Manual QA backlog:** underline CTA links with arrow icons in blog, promo banner, footer, announcement bar, header/dropdown, slides-show; RTL icon direction.

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

### CSS Architecture — Phase 5F accepted (2026-06-25)

**Delivered:**

- `tailwind/tailwind.components.css`: removed dead `.accordion__title.is-active` selector (`--active` / `--inactive` contract unchanged)
- `snippets/buy-buttons.liquid`: removed dead `buy-buttons__actions` and `buy-buttons__actions--without-quantity` markup modifiers; kept `--purchase-group` and conditional `--with-quantity`

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Manual QA backlog:** accordion (cart, filters drawer, promise-section); PDP / featured-product / quick view purchase group spot-check.

**Resolved:** `layout: 'stack'` API cleanup and `close-button` motion var unify in Phase 8C. Orphan `buy-buttons__quantity` in `product-info-blocks` was resolved in Phase 8B.

### CSS Architecture — Phase 6 accepted (2026-06-24)

**Delivered:**

- `.agents/skills/check-theme-architecture/css-layer-allowlist.json`
- `lint-theme.js` → `checkCssLayerProtocol()` (P0 errors, P1 tab-nav error + `*__tab` warning, P2 motion warning)
- `docs/references/style-system/css-architecture.md` §7.2–§7.3 updated

**Validation:** `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Deferred:** cross-owner BEM heuristic; Liquid `duration-*` remaining hits (Batch A in 6C); `{% stylesheet %}` CSS lint; optional future P2 Liquid duration lint.

### CSS Architecture — Phase 6C accepted (2026-06-25)

**Delivered (Batch A — interactive `duration-*` → owner `{% stylesheet %}` + motion vars):**

- `sections/article.liquid`: `.article-sidebar__link` color transition
- `sections/collections.liquid`: `.collections-section__card` box-shadow transition
- `snippets/image-magnifier.liquid`: `.image-magnifier__preview-layer` opacity fade
- `snippets/header-mobile-menu-drawer.liquid`: `.header-mobile-menu-drawer__chevron` transform
- `snippets/social-icons.liquid`: `.social-icons__link` opacity/color (`icons-animate-breathe` unchanged)
- `sections/scroll-categories.liquid`: `.scroll-categories__preview` opacity/transform reveal

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Manual QA backlog:** article sidebar link; collections card shadow; image magnifier fade; mobile menu chevron; social icon hover/breathe; scroll-categories hover preview.

**Deferred:** flip-digit, about-stats, before-after-comparison; `transition-*` without `duration-*`; `{% stylesheet %}` raw ms; collections arrow `duration-300`; optional P2 Liquid duration lint.

### CSS Architecture — Phase 7B accepted (2026-06-25)

**Delivered:**

- `tailwind/tailwind.snippets.css`: removed dead `.product-quick-view__quantity` (0 Liquid refs)
- `variant-picker__swatch`: explicit `border-color` / `box-shadow` transitions with motion vars (no `transition-all`)
- Owner block comments: `product-card-shell__*`, `product-card__variant-*`, `product-info-blocks__price*` shared primitives; `product-info-blocks__title` was documented as semantic hook only at the time, then upgraded in Phase 8B

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Manual QA backlog:** collection/featured product card grid; predictive search product card; PDP product-info-blocks title/price; quick view price/description/purchase; variant picker swatch hover/selected/unavailable; search predictive/results tabs smoke check.

### CSS Architecture — Phase 6B accepted (2026-06-24)

**Delivered:**

- `lint-theme.js`: P2 motion lint scans full multi-line `transition:` blocks (comma segments; `var()` stripped before bare `ms`/`s` check)
- `lint-theme.js`: P0 promoted-prefix ban uses `maskCssComments()` on `snippets.css`
- `css-layer-allowlist.json`: `snippetsPromotedSelectors: []` (selector-level bans separate from prefix bans); `buy-buttons__` added to `snippetsPromotedPrefixes` in Phase 5D-2b
- Allowances unchanged: motion var fallbacks, `visibility 0s`, `transition-delay: 0s`; excludes `animates.css` and `tailwind.output.css`
- Post-review fix: `BARE_DURATION_RE` non-global (`/.../` without `g`) so consecutive `.test()` on transition segments cannot skip via `lastIndex`

**Validation:** `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

### CSS Architecture — Phase 1 (accepted, 2026-06-24)

**Delivered (docs only — no CSS/Liquid changes):**

- `docs/references/style-system/css-architecture.md` — token source, bridge, layer ownership, motion chain gaps, misplacement backlog P0–P3, consumption governance, Phases 2–6
- Cross-link from `css-and-typography.md` + Token Flow pointer
- `AGENTS.md` Task Routing line for layer-placement audits

### CSS Architecture Scorecard (~93/100)

**Completed / strong areas:**

- **Layer ownership (~95/100):** `components` and `snippets` have real cascade separation; reusable patterns such as `quantity-selector` and `pagination` live in components; snippet-scoped families emit into `@layer snippets`.
- **Surface system (~98/100):** Surface roles are documented and lint-guarded. Section gradient roots use `color-* surface-section`; `sections/*.liquid` `bg-scheme-surface` count is 0. Overlay/component/inverted surfaces have helper utilities and conservative lint protection.
- **Typography system (~90/100):** Typography matrix, decision flow, lint guards, body-md dedupe, heading semantics fixes, eyebrow convergence, slides-show heading semantics, and custom size utilities are complete for automated cleanup.
- **Lint / governance (~92/100):** Theme architecture lint now guards surface regressions and foundation typography misuse (`heading-base` / `body-base` in Liquid). Style-system decisions are documented in `docs/references/style-system/css-and-typography.md`.

**Remaining gap to 100 (do not auto-clean broadly):**

- **Design-system decisions:** page-type display scale matrix, component title ownership (`product-info-blocks__title`, `icon-with-text`), and typography custom-size pilots.
- **Manual visual / AT QA:** `about-stats` value sizing, `scroll-categories` product title sizing, `slides-show` keyboard/assistive-tech behavior, and carousel/no-JS checks.
- **Lint hardening:** optional formal tests for `checkSurfaceProtocol()` and typography lint rules; avoid broad `text-[...]` bans because current ratio/superscript uses are intentional.
- **Component owner refinements:** migrate local typography or surface concerns only when a component has a clear owner and a verified visual need.

Do not continue drive-by CSS cleanup merely to chase 100. Future work should be scoped as a named audit or pilot, with review first and implementation only after the user approves.

Typography consumption protocol is **complete for automated cleanup** (score **~90/100**, 2026-06-23). Matrix, decision flow, lint guards, and custom size utilities live in `docs/references/style-system/css-and-typography.md`. Remaining typography work is **manual visual / design-system judgment** — do not batch further auto-migration.

### Typography Current State (~90/100)

**Completed:**

- **P0/P1** — Typography Consumption Matrix + decision flow; lint bans `heading-base` / `body-base` in Liquid; display-tier lint narrowed to semantic `heading-h*` on non-heading elements.
- **P2** — `body-md` dedupe in `search-results-tabs`, `product-info-blocks`, `product-purchase-stack` (8 removals).
- **P3A** — Hard heading semantics: cart `h2.heading-h2`, featured-products tab `button`, scroll-categories product `p`, article duplicate title removed, promo-bannder card `h2`, about-stats value `p`.
- **P3B** — Eyebrow convergence: `h3.sub-heading` → `p.sub-heading` in before-after, promotion-countdown, promo-bannder, philosophy header, promise-section subtitle.
- **P3C** — `slides-show` multi-slide `h1.sr-only` + `p.heading-2xl`; single-slide visible `h1.heading-2xl`; Swiper `aria-hidden` sync on active slide.
- **Custom size v1** — `heading-size-custom` / `body-size-custom` in `tailwind.typography.css` + docs (no Liquid pilots yet).

**Deferred — manual visual / design-system (do not auto-clean):**

- `about-stats` value — visual check; optional `heading-size-custom` pilot
- `scroll-categories` product title — visual check vs `heading-h3` / custom size
- `icon-with-text` block title — component owner (`body-xl` today)
- `product-info-blocks__title` — **resolved Phase 8B** (`heading-h1` / `--featured` `heading-h2` in snippets CSS); desktop scale QA required
- **Display scale matrix** — page-type `h1` tier unification (cart/blog/collection vs native)
- `slides-show` — keyboard Tab / AT manual validation (focus in hidden slides, no-JS multi-slide)
- `newsletter-overlay` — fixed `h2` + merchant visual tier (documented acceptable deviation)

Surface architecture semantic migration is **complete** in theme Liquid and lint. See `docs/references/style-system/css-and-typography.md` → Surface Consumption Protocol for the agent matrix and manual-review boundaries.

Latest reviewed commit:

- `d66ded9435fdc5fb3f819d80892c2ce35a6f2c93` - `Add product rich media gallery support` (2026-06-22 17:50 +0800)

### Recently Completed Work

- **Typography phase (2026-06-23):** P0–P3C + custom size utilities complete; see **Typography Current State** above.
- **Surface consumption protocol (2026-06-23):** Section gradient roots unified to `surface-section`; `sections/*.liquid` `bg-scheme-surface` count is 0. Surface lint rules added to `lint-theme.js` (`bg-scheme-surface` ban in sections, overlay `color-{{` + manual surface combo ban in snippets, `text-theme-fg` ban). `npm run lint` passes.
- Product galleries route media through `product-media` and support image, video, external video, and 3D model preview states.
- Product media modal was added for interactive video/model viewing.
- Product media Alpine behavior was expanded for gallery activation, modal activation, and reusable `mediaVideo()` controls.
- Cart page and cart drawer surface cart-level discount and total-discount state.
- Render static-analysis cleanup was applied across Liquid files so Theme Check can identify snippet references more reliably.
- Filter-heavy render parameters were pre-assigned before snippet calls where needed.
- Icon sizing cleanup was applied so changed `render 'icons'` calls no longer pass sizing utilities through `class`.
- New rich-media local transition cleanup was applied; the current diff removes local transitions from `snippets/media-video.liquid`.

### Current Validation

- `npm.cmd run lint` passes.
- `npm.cmd test` passes with 0 warnings (OrphanedSnippet resolved in Phase Media-Orphan-A).
- Plain `npm run ...` is blocked in this PowerShell environment by the local `npm.ps1` execution policy; use `npm.cmd ...`.

### Working Tree Notes

Current uncommitted cleanup touches Liquid render, icon, and motion-related files plus generated Tailwind output:

- `assets/tailwind.output.css`
- `sections/collection.liquid`
- `sections/featured-product.liquid`
- `sections/header.liquid`
- `sections/philosophy-section.liquid`
- `sections/product-recommendations.liquid`
- `sections/product.liquid`
- `sections/promise-section.liquid`
- `snippets/accordion.liquid`
- `snippets/header-dropdown-menu.liquid`
- `snippets/header-dropdown-super-menu.liquid`
- `snippets/header-mobile-menu-drawer.liquid`
- `snippets/media-video.liquid`
- `snippets/product-block-icon.liquid`
- `snippets/product-card.liquid`
- `snippets/product-gallery-thumbnails.liquid`
- `snippets/product-info-blocks.liquid`
- `snippets/product-media.liquid`
- `snippets/product-quick-view.liquid`
- `snippets/sort-by-dropdown.liquid`

`assets/tailwind.output.css` is generated output. Review whether it should stay in this cleanup diff because no `tailwind/` source file is currently changed.

### Remaining Manual QA

These storefront flows need manual verification before launch:

- PDP media gallery with image-only products
- PDP media gallery with Shopify-hosted video
- PDP media gallery with external video
- PDP media gallery with 3D model media
- Product media modal open, close, Escape key, overlay click, and focus behavior
- Gallery thumbnail/carousel/grid/stacked layouts on mobile and desktop
- Featured product media gallery behavior
- Quick-view media behavior
- PDP add-to-cart after media selection
- Cart drawer / cart page quantity changes, remove, clear, discounts, and totals
- Filters
- Search
- Mobile menu
- Lightbox
- Newsletter overlay
- Header cart badge

### Next Action

Before declaring launch readiness:

1. Decide what to do with the genuinely unreferenced `snippets/media-video.liquid`: keep and document/ignore, wire it into an intended section, or remove it.
2. Review whether generated `assets/tailwind.output.css` belongs in the current cleanup diff.
3. Run or record the manual QA listed above.

### Deferred Cross-Phase Items

- **Typography manual / design-system (do not auto-migrate):** see **Typography Current State → Deferred** above.
- **Surface manual-review items (do not auto-migrate):** `product-variant-picker` option `bg-theme-bg text-theme-text`; `bg-theme-bg/opacity` media-frame controls; snippet surfaces without explicit `color-{{` scope. Details in style-system doc.
- Toasts: warning toast uses `icon-info-circle` (no dedicated warning icon). Record only.
- Toasts: no global dedup or max-stack logic implemented. Documented as intentional; re-evaluate only if user reports stacking issues.
- Architecture: unified z-index layer system is in place. Verify during final manual QA that toast, lightbox, dialog, drawer, media modal, and header layers do not conflict.

### Collaboration Boundary

- The Agent may inspect repository files, run non-rewriting validation commands, and update cross-session docs when asked.
- The Agent MUST NOT modify theme implementation files or merchant-owned configuration/content unless the user explicitly authorizes implementation.
