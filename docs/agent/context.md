# Agent Context

This file records the current cross-session task contract and progress. Keep implementation findings and detailed file-by-file notes outside this file unless they are needed to continue the task safely.

## Current State

Active post-commit follow-up: product rich media gallery support was committed, and render/static-analysis cleanup plus icon/motion cleanup are currently applied in the working tree.

CSS architecture optimization is the active architecture track. Phases **1–4B**, **5A**, **5B**, **5C**, **5D-1**, **5D-2a**, **6**, and **6B** are accepted (2026-06-24). Phase **5** overall remains **in progress** (5D-2b deferred). Layer contract: `docs/references/style-system/css-architecture.md`.

### CSS Architecture — Phase status

| Phase | Status | Summary |
| --- | --- | --- |
| **1** | **Accepted** | `css-architecture.md` contract, cross-links, 2+/3+ thresholds |
| **2** | **Accepted** | `--motion-ease-default` alias; dropdown + product-card motion vars |
| **3** | **Accepted** | `newsletter-banner-section` override → section `{% stylesheet %}` |
| **4B** | **Accepted** | `snippets.css` owner blocks; sub-heading → typography; inventory dot semanticized; mixed product-info-blocks owners cleaned |
| **5** | **In progress** | 5A–5D-2a Accepted; 5D-2b deferred — see `css-architecture.md` §8.1 |
| **5A** | **Accepted** | `tab-nav-item*` in `components.css`; 7 consumers dual-class; snippets chrome removed |
| **5B** | **Accepted** | `accordion__*` CSS promoted snippets → components; snippet remains API owner |
| **5C** | **Accepted** | `interactive-link` in `elements.css`; 4 consumers dual-class |
| **5D-1** | **Accepted** | `icon-with-text-item*` CSS promoted snippets → components |
| **5D-2a** | **Accepted** | `buy-buttons__*` purchase chrome promoted snippets → components |
| **6** | **Accepted** | `checkCssLayerProtocol()` + `css-layer-allowlist.json` |
| **6B** | **Accepted** | Multi-line motion lint, promoted-prefix comment masking, selector bans |

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

**Deferred (API hardening):** `.accordion__title.is-active` unused — Alpine uses `--active` / `--inactive` modifier classes.

**Remaining:** Manual accordion visual QA (promise-section, cart, filters drawer/vertical, keyboard).

### CSS Architecture — Phase 5C accepted (2026-06-24)

**Delivered:**

- `tailwind/tailwind.elements.css`: `@utility interactive-link` (focus-ring + hover underline only)
- 4 consumers append `interactive-link`; legacy BEM retained (`cart__product-link`, `cart-overlay__product-link`, `search-*__result-link`)
- `tailwind/tailwind.snippets.css`: cart link block removed; search result links keep `text-theme-text` color delta only

**Validation:** `npm run build:tw` passed; `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Remaining:** Manual link visual QA (cart page, cart drawer line-clamp, search predictive/results, keyboard focus-visible). Candidate E (`links-underline` + `.icons`) unchanged.

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

**5D-2b deferred:** rename/rehome `buy-buttons__retry-action`; refactor orphan `buy-buttons__quantity` in product-info-blocks; remove dead `product-info-blocks__buy-buttons` / `product-quick-view__buy-buttons` rules; `stack` layout API cleanup.

### CSS Architecture — Phase 6 accepted (2026-06-24)

**Delivered:**

- `.agents/skills/check-theme-architecture/css-layer-allowlist.json`
- `lint-theme.js` → `checkCssLayerProtocol()` (P0 errors, P1 tab-nav error + `*__tab` warning, P2 motion warning)
- `docs/references/style-system/css-architecture.md` §7.2–§7.3 updated

**Validation:** `npm run lint` passed; `npm test` passed (`OrphanedSnippet` warning only — pre-existing `snippets/media-video.liquid`); `git diff --check` passed.

**Deferred:** cross-owner BEM heuristic; Liquid `duration-*`; `{% stylesheet %}` lint; 5D-2b buy-buttons follow-up; `buy-buttons__` snippets ban when retry-action renamed or added to `snippetsPromotedSelectors`.

### CSS Architecture — Phase 6B accepted (2026-06-24)

**Delivered:**

- `lint-theme.js`: P2 motion lint scans full multi-line `transition:` blocks (comma segments; `var()` stripped before bare `ms`/`s` check)
- `lint-theme.js`: P0 promoted-prefix ban uses `maskCssComments()` on `snippets.css`
- `css-layer-allowlist.json`: `snippetsPromotedSelectors: []` (selector-level bans separate from prefix bans; `buy-buttons__` not added)
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
- `product-info-blocks__title` — snippets CSS typography owner
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
- `npm.cmd test` passes with 1 Theme Check `OrphanedSnippet` warning.
- Plain `npm run ...` is blocked in this PowerShell environment by the local `npm.ps1` execution policy; use `npm.cmd ...`.

### Known Warning

Theme Check currently reports only:

- `snippets/media-video.liquid` - `OrphanedSnippet`

This appears to be genuine. Repository search found no real `render 'media-video'` references; the snippet only contains its own doc/example reference.

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
