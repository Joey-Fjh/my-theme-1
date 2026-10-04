# Phase 0b — Browser verification checklist

Use against commit `926dddb`. Fill **Result** (Pass/Fail/Skip), **Screenshot**, **Notes**. Capability IDs (CAP-xx) refer to the removed phase 0 inventory: `git show 047b539:docs/migration/phase0/capabilities.md`.

**Viewports:** Desktop **1440×900**; Mobile **390×844** (unless noted).

---

## Global prerequisites

| Data needed |
|-------------|
| Store with theme preview of `926dddb` |
| Product with **3+ variants**, one **sold out**, with **compare-at price** and **media** (images + optional video) |
| Product with **selling plans** (subscriptions) if enabled in store |
| Collection with **20+ products** and **active storefront filters** |
| Blog with **3+ articles**; one article with hero image |
| Navigation menu `main-menu` matching `header-group.json` |
| Markets with **2+ countries** or languages for localization toggles |

---

## `index` (home)

Global (header group / overlays — not in `templates/index.json` order):

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Tab through header | Skip link → logo → nav focus visible (CAP-03, CAP-21) | | | |
| Mobile | Open mobile menu | Drawer opens, focus trapped, Escape closes (CAP-03) | | | |
| Mobile | Scroll homepage | Sticky header does not obscure focused controls (CAP-03) | | | |
| Desktop | Wait on home (visitor) | Newsletter overlay may appear after delay (CAP-07) | | | |

Sections in `templates/index.json` `order` (`index.json:630–646`):

| Viewport | Section (type) | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|----------------|--------|----------------|--------|------------|-------|
| Desktop | `slides-show` | View hero | Headline, CTA, slide controls work (CAP-15, CAP-22) | | | |
| Desktop | `category-grid` | View grid | Category tiles and links render (CAP-15) | | | |
| Desktop | `featured-products` | Switch collection tabs | Each tab shows products; carousel advances (CAP-22) | | | |
| Desktop | `scroll-categories` | Scroll strip | Category chips scroll horizontally (CAP-15) | | | |
| Desktop | `scrolling-icon-with-text` | View marquee | Icons/text animate in chosen direction (CAP-15) | | | |
| Desktop | `routine-showcase` | View routine block | Steps/media visible; carousel on narrow width (CAP-15, CAP-22) | | | |
| Desktop | `featured-product` | Change variant / add to cart | PDP subset behaves like mini PDP (CAP-10) | | | |
| Desktop | `before-after-comparison` | Drag handle | Before/after images compare (CAP-15) | | | |
| Desktop | `promotion-countdown` | View timer | Countdown matches end date; digits update (CAP-15) | | | |
| Desktop | `promo-bannder` | Open promo cards | Card copy and links work (CAP-15) | | | |
| Desktop | `about-stats` | View stats | Stat values and imagery display (CAP-15) | | | |
| Desktop | `blog-stories` | Open article card | Links go to articles (CAP-15) | | | |
| Desktop | `testimonial-featured` | Advance testimonials | Testimonial carousel/slides work (CAP-22) | | | |
| Desktop | `newsletter-banner` | Submit email | Banner signup shows success/error (CAP-07) | | | |
| Desktop | `video-banner` | Play/pause video | Video and overlay copy behave (CAP-15) | | | |
| Desktop | `google-map` | View map | Map iframe loads when embed configured (CAP-15) | | | |

---

## `product`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Open PDP | Title, price, gallery visible without JS (CAP-08) | | | |
| Desktop | Change variant | Price, URL `?variant=`, gallery slide sync (CAP-08, CAP-09) | | | |
| Desktop | Select sold-out variant | Add disabled / sold-out messaging (CAP-08) | | | |
| Desktop | Add to cart | Toast or cart drawer updates count (CAP-05, CAP-21) | | | |
| Desktop | Open gallery modal | Modal opens, Escape closes, focus returns (CAP-09, CAP-21) | | | |
| Mobile | Pinch/zoom or magnifier | Magnifier/lightbox behaves per settings (CAP-09) | | | |
| Desktop | Scroll to recommendations | Related products load (CAP-11) | | | |
| Desktop | Comparison table | Rows align; metafield/rating cells render (CAP-08) | | | |

---

## `collection`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Open collection | Grid and hero render (CAP-12) | | | |
| Mobile | Open filter drawer | Drawer opens from chip; apply filter updates grid without full reload (CAP-12) | | | |
| Desktop | Change sort | Product order updates (CAP-12) | | | |
| Desktop | Paginate | Page 2 loads; URL updates (CAP-12) | | | |
| Desktop | Clear active filters | Chips removed; full collection returns (CAP-12) | | | |

---

## `search`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Query with results | Product tab shows cards (CAP-13) | | | |
| Desktop | Switch tabs | Article/page tabs show content (CAP-13) | | | |
| Mobile | Open filters in search | Filter drawer works (CAP-13) | | | |

---

## `cart`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | `/cart` with items | Line items, quantities, note field (CAP-05) | | | |
| Desktop | Change quantity | Line updates via AJAX (CAP-05) | | | |
| Mobile | Open cart drawer from header | Overlay matches cart state (CAP-05) | | | |

---

## `blog` / `article`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Blog index | Articles list, pagination (CAP-14) | | | |
| Desktop | Article page | Hero + body readable (CAP-14) | | | |

---

## `page`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Generic page | RTE content (CAP-15, `page` section) | | | |

---

## `page.about`

Sections in `templates/page.about.json` `order` (`page.about.json:164–171`):

| Viewport | Section (type) | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|----------------|--------|----------------|--------|------------|-------|
| Desktop | `main-page-about` | View hero | About hero image/title renders (CAP-16) | | | |
| Desktop | `philosophy-section` | Open philosophy cards | Cards and links work (CAP-15) | | | |
| Desktop | `promise-section` | Expand accordions | Accordion items open/close (CAP-15) | | | |
| Desktop | `brand-statement` | Read statement | Brand copy visible (CAP-15) | | | |
| Desktop | `testimonial-featured` | Advance testimonials | Carousel/slides work (CAP-22) | | | |
| Desktop | `before-after-comparison` | Drag comparison | Before/after slider works (CAP-15) | | | |
| Desktop | `newsletter-banner` | Submit email | Signup feedback shown (CAP-07) | | | |

---

## `page.contact`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Contact template | Form submit shows success toast (CAP-16, CAP-21) | | | |

---

## `list-collections`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Open page | All collections listed (CAP-12) | | | |

---

## `404`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Invalid URL | Custom 404 + blog stories section (CAP-19) | | | |

---

## `password`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Password store URL | Password form submits (CAP-17) | | | |

---

## `gift_card`

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| Desktop | Issued gift card URL | Balance/code display; recipient form if applicable (CAP-18) | | | |

---

## Customer account

| Viewport | Action | Expected (CAP) | Result | Screenshot | Notes |
|----------|--------|----------------|--------|------------|-------|
| — | N/A | No `templates/customers/*` in theme — use Shopify default account pages if linked from footer | Skip | | |

---

## Theme Editor checks (desktop, logged-in merchant)

| Action | Expected | Result | Screenshot | Notes |
|--------|----------|--------|------------|-------|
| Add `icon-with-text` section | Section renders; mobile carousel works (CAP-22; library TBD per `docs/agent/board.md`) | | | |
| Remove a homepage section | Section disappears without console errors | | | |
| Reorder homepage sections | No duplicate carousel init / double event handlers (CAP-22, `base.js:426–436`) | | | |
| Select slide block in `slides-show` | Correct slide highlighted in editor | | | |
| Change header `menu_type` setting | Menu layout updates (CAP-03) | | | |
| Toggle announcement bar social | Social icons show/hide (CAP-02) | | | |

---

## No-JavaScript checks

Disable JavaScript in browser (or use `?pb=0` where applicable).

| Page | Check | Expected | Result | Screenshot | Notes |
|------|-------|----------|--------|------------|-------|
| Home | First viewport | Hero text/CTA visible (CAP-15) | | | |
| Product | Default variant | Add-to-cart form present (CAP-08) | | | |
| Collection | Filters | URL-based filter links work if present (CAP-12) | | | |
| Cart | `/cart` | Line items visible (CAP-05) | | | |

---

## Keyboard & focus checks

| Surface | Keys | Expected (CAP) | Result | Screenshot | Notes |
|---------|------|----------------|--------|------------|-------|
| Mobile menu drawer | Tab, Shift+Tab, Escape | Focus cycle inside drawer; Escape closes (CAP-03, CAP-21) | | | |
| Search overlay | Escape | Closes overlay (CAP-04) | | | |
| Cart drawer | Escape | Closes (CAP-05) | | | |
| Filter drawer | Escape | Closes; focus returns (CAP-12) | | | |
| Product media modal | Escape | Closes modal (CAP-09) | | | |
| `slides-show` hero | Arrow keys | Moves slides when focused (`slides-show.liquid:269–284`) | | | |
| Sort dropdown | Enter/Space | Opens and selects option (CAP-12) | | | |

---

## Retained theme contracts (from phase 1 retention audit)

Added from the phase 1 retention audit (class C; `git show 047b539:docs/migration/step1/retention-audit.md`). Old validators guarded these; the skeleton validators do not, so each phase 4 slice checks them in the browser.

| Viewport | Action | Expected (CAP / source) | Result | Screenshot | Notes |
|----------|--------|--------------------------|--------|------------|-------|
| Desktop | Theme settings: turn `motion_enabled` off, load `/` and a PDP | No list/card cascade or decorative loops; all content visible immediately (CAP-01) | | | |
| Desktop | Same, then hover cards, open a dropdown, the cart drawer, and a dialog | State and micro interactions still animate (CAP-01) | | | |
| Desktop | OS "reduce motion" on, `motion_enabled` on | Cascade and decorative loops respect `prefers-reduced-motion`; state/micro interactions respect it too (CAP-01) | | | |
| Desktop | Collection grid, featured products tabs, blog cards, recommendations | List/card items cascade in sequence once per page view when motion is on (CAP-01) | | | |
| Mobile + Desktop (Safari / iOS) | Home `category-grid` section | Cards fill their grid column at full width (old WebKit guard on `.category-grid__item`) (CAP-15) | | | |
| Mobile + Desktop (Safari / iOS) | Open custom `<summary>` controls: header dropdown, filter field, product collapsible | No default disclosure triangle is shown (old `::-webkit-details-marker` guard) (CAP-03, CAP-08, CAP-12) | | | |
