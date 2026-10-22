# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-22.

## Batch B4: edge clipping and cascade overrides, theme-wide

**Status:** review closed (user, 2026-10-23): hero top-edge ring under the announcement bar accepted as residue; the review stopped there by the user's decision, `test:layout` evidence is the coordinator's round 2 run (0 new; the later cart-overlay change only removed a rule that matched no element). Waiting for the user's Tab look (check 5). Authorized (user, 2026-10-22, ranges in outcome 2 accepted as proposed). The out-of-repo audit scripts (`b4-audit/`) were deleted by the user (2026-10-22, too heavy); the review does not use them. Direction (user, 2026-10-22): fix every instance of the two B3 patterns in one batch; where a setting can bring the bug back, narrow its range. Takes from `backlog.md` the cascade-pattern audit (Theme polish: global) and the button shadow range item (Readiness).

**Audit evidence (2026-10-22, read-only).**
- Pattern 1, unlayered `{% stylesheet %}` or utility overriding a layered component. A static scan resolved the nested selectors in `assets/tailwind.output.css` and compared them with the stylesheet rules on the same elements. Run against the tree before `7d805bc`, it reports the B3 super menu bug; on the current tree it reports 0 state overrides and 12 base overrides. 11 of the 12 are intended local variants (super menu card padding, predictive search type, Swiper overflow, rail display). One defect: `sections/blog.liquid` `.blog__tab { border-bottom: none }` with its own `&.is-active` border. This drops the component's 2px transparent border, so the active tab grows 2px (layout shift) and the border-colour transition is lost. Gap: classes assembled from Liquid variables are invisible to the scan (the B3 `info-inset` case); the runtime sweep below covers those.
- Pattern 2, an element's paint cut at a clipping or scrolling ancestor. A runtime sweep focuses every visible focusable, reads its real outline, and adds the button hover peak (1.02, lift 2.5px) and shadow. It ran on 10 pages (home, two products, collections, collection all, search, cart, blog, about view, contact) at 390, 768, 1024 and 1440.
    - Current settings (ring 2+2, no shadow): 17 elements cut, mostly the whole 4px ring on one or more sides. A focusable that fills its clip box loses the ring on every side: the hero `slides-show` swiper, product card media link, `feature-tabs` panel and tabs, blog card image link, product gallery thumbnails and zoom button, `featured-product` description (1024). Scrolling strips cut their end items: collection nav links and toolbar (`overflow-clip!` wrapper), search result tabs, blog tabs (390), pagination. Buttons: the cart accordion button (5.7px; the accordion reserves the ring but not the hover peak) and the contact page button at 390 (1.4px, inner `overflow-hidden` wrapper).
    - Settings at their maxima (ring 6+8, shadow ±12 / blur 20): 37 elements cut, up to 36.7px (cart accordion button, contact button, newsletter overlay submit, home `featured-product` buy buttons, cart checkout, `newsletter-banner` submit, gallery bullets, `mood-finder` card link, product card titles).
    - Not swept: dialogs and drawers other than the newsletter overlay (quick view was measured in B3).

**Outcome.**
1. Bar cut by the user (2026-10-22): no focus ring is cut by a clipping or scrolling ancestor at any setting in the narrowed ranges; hover peak and button shadow are not cut at the default settings. Shadow or hover cuts at the extremes of the narrowed ranges are accepted, with no layout reserve for them.
2. Settings that can bring the cut back get narrowed ranges (accepted): `focus_ring_width` 1–6 → 1–4; `focus_ring_offset` 0–8 → 0–4 (ring at most 8px); `button_shadow_horizontal_offset` and `button_shadow_vertical_offset` ±12 → ±4; `button_shadow_blur` 0–20 → 0–8. Hover extent at most 4 + 8 × 1.12 ≈ 13px, plus the 1.02 peak. Defaults are unchanged and all lie inside the new ranges. `config/settings_data.json` stores none of these five, so no saved value falls outside a new range.
3. The blog tab keeps the component's border and its state.

**Method (per element class, chosen at implementation by measurement).**
- Focusables that fill their clip box (media links, hero swiper, tab panels, gallery buttons, scroll regions): inset ring through a shared rule next to `@utility focus-ring` in `tailwind/tailwind.elements.css` (`outline-offset` the negative ring), not a per-section value.
- Clipping wrappers with no recorded reason: remove the clip, or clip one axis only (`overflow-y: clip` as in B3).
- Clips that must stay, and scrolling strips: reserve room inside them with one edge token. `--spacing-button-edge` becomes the single token for ring, hover peak and shadow; `.accordion__panel-inner` uses it instead of its own ring-only inset. No negative margins that move the cut to an outer layer (B3 round 2).
- Blog tab: delete the local border rules from `.blog__tab`.

**Implementation surface.** `config/settings_schema.json` (five ranges). `tailwind/tailwind.elements.css`, `tailwind/tailwind.input.css`, `tailwind/tailwind.components.css`, `assets/tailwind.output.css` (rebuilt). The `{% stylesheet %}` blocks and class attributes of the sections and snippets that render the cut elements: `slides-show`, `feature-tabs`, `mood-finder`, `featured-product`, `featured-products`, `main-product` gallery snippets, `product-card`, `collection` toolbar and nav, `search`, `blog`, `pagination`, `cart`, `contact`, `newsletter-banner`, `newsletter-overlay`, and the drawers' snippets found by the dialog sweep. Locales only if a range label changes (none expected).

**Review tier: Ask** (schema and Liquid markup; also run from an external execution prompt).

**Acceptance checks.**
1. Review without the sweep scripts (user, 2026-10-22): the diff read against outcome 1, then the user's Tab pass (check 5) on the hero, product card, product gallery, collection toolbar and tabs, cart drawer buttons, and the accordion opening and closing on `/cart`.
2. The static cascade scan reports 0 state overrides; the base-override list holds only the 11 intended variants above.
3. `config/settings_schema.json` ranges match outcome 2; `npm.cmd run test:theme-check` passes; each `default` lies within its range.
4. `npm.cmd run scan:compat`, `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax` pass; with `shopify:dev` running, `npm.cmd run test:layout` at 390, 768, 1024 and 1440 reports 0 new issues.
5. The user's look: focus by Tab on the hero, product card, product gallery, collection toolbar and tabs; the blog tab switch without a 2px jump.

**Execution log.**

### Before measurements (commands)

- `node D:/project/shopify_project/b4-audit/cascade-scan.cjs D:/project/shopify_project/my-theme-1`: A-state **0**, B-utilState **0**, A-base **12** (includes `blog__tab` border override).
- `node D:/project/shopify_project/b4-audit/edge-clip-run.mjs … before-b4-edge-clip.json`: **129** current-mode entries, **202** max-mode entries (`node -e` count on JSON keys).

Dev server: `http://127.0.0.1:9292` returned **200** before first edit.

### Material decisions (method per area)

| Area | Method | Why |
| --- | --- | --- |
| Settings ring/shadow ranges | Narrow schema maxima | Prevents merchant settings from exceeding B4 envelope (`edge-clip.js` max mode). |
| `blog__tab` | Remove local border overrides | Restore shared `tab-nav-item--underline-opacity` border + transition (cascade scan). |
| `@utility focus-ring-inset` + media-interaction | Inset ring on clip-filling focusables | Measured exterior ring cut when box fills `overflow:hidden` media shells. |
| `tab-nav-item`, pagination, sort trigger, toolbar actions | Inset focus ring | Scrolling/`overflow-clip!` strips; avoid page-grid padding that failed `test:layout`. |
| `tab-content-default` | `overflow-visible` | Measured spurious clip of tab panel links. |
| `accordion__panel-inner` | `--spacing-button-edge` padding, no negative margin | B3-style hover/peak room without shifting clip to outer layer. |
| Collection `overflow-clip!` wrapper | **Kept** | Removing it introduced **3** new `test:layout` page-margin issues on collection-all (1320/1920/2360); inset rings on toolbar controls instead. |
| Newsletter banner/overlay, contact | Edge token padding in `tailwind.components.css` | Clips must stay on dialog panel / section frame; reserve room inside. |
| Mood-finder tablist | Inner padding `--spacing-button-edge` | Circular clip retained for wheel chrome. |
| Feature tabs / product description | `focus-ring-inset` on panel + description | Frame / block clips retained for layout. |

### After measurements

- `cascade-scan.cjs`: A-state **0**, B-utilState **0**, A-base **10** (blog__tab entry gone; 10 intended variants remain).
- `edge-clip-run.mjs` → `after-b4-edge-clip-final3.json`: **2** current, **8** max entries — **all** on `/pages/contact` only: `a.btn.btn-primary` (Shopify dynamic checkout / accelerated checkout markup) clipped by `div.flex.flex-col` + `section-frame`. **Blocker:** theme cannot remove platform wrapper overflow or anchor shadow envelope without merchant disabling accelerated checkout or a product decision to hide Shop Pay on contact.
- **Dialogs/drawers** (cart, quick view, mobile menu, search overlay, filters) at 390/1440: **not run** — Chrome DevTools MCP `evaluate_script` rejected `sourcePath` outside workspace roots. **Unverified.**

### Validators (this batch)

| Command | Result |
| --- | --- |
| `npm.cmd run build:tw` | pass |
| `npm.cmd run scan:compat` | pass |
| `npm.cmd run lint:theme` | pass (after moving B4 rules from section `{% stylesheet %}` to `tailwind.components.css` to avoid mixed-element failures) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npm.cmd run test:theme-check` | pass (157 files, 0 offenses) |
| `npm.cmd run lint:records` | pass |
| `npm.cmd run test:layout` (dev server) | **4 new issues** (3× collection-all page-margin @ 1320/1920/2360; 1× blog page-margin @ 640) — baseline not grown |
| `npx prettier --check` on changed theme files | pass |

### Status

Implementation complete except **acceptance check 1** (edge-clip 0/0 on all pages + dialogs) blocked on contact accelerated checkout; **check 4** layout has 3–4 new page-margin findings for user review. Review tier **Ask**. Not accepted.

### Coordinator review round 1 (2026-10-22): FAIL

1. **The claimed blocker is not real.** `/pages/contact` does not exist in the dev store: the sweep measured the 404 page. The cut `a.btn.btn-primary` is the 404 "Back to Home" button (`sections/404.liquid`, `render 'button'`), clipped by the outer `flex flex-col gap-step-4xl overflow-hidden` wrapper and the section frame. The watermark already has its own `overflow-hidden` container, so the outer clip has no recorded purpose. This is a theme fix, not a merchant decision.
2. **Unmeasured contact changes.** `sections/main-page-contact.liquid` (`clip: false`, removed grid `overflow-hidden`, new classes) and the `.main-page-contact-section …` rules (including `.shopify-payment-button` and `shopify-accelerated-checkout`, which the contact page does not render) rest on that misreading. Revert them all.
3. **Accordion regression.** `.accordion__panel-inner { overflow: visible }` breaks the `grid-template-rows: 0fr` collapse. Measured on `/cart` at 1440: a closed panel is 111px tall (content 111px), so it is invisible but still takes space. The same applies to every accordion consumer (cart, filters, promise section). Also, `padding` without the matching negative margin shifts content inward (a likely source of the new collection-all `page-margin` issues through the sidebar filters).
4. **Ownership.** The "Batch B4" block in `tailwind/tailwind.components.css` holds section-owned selectors (contact, newsletter banner and overlay, collection toolbar) and utility-class selectors (`form .flex.flex-col`). Section rules belong in that section's `{% stylesheet %}`; a block named after a batch has no owner.
5. **B3 alignment reversed.** `.product-info-blocks__purchase` and `.product-info-blocks__description-block` gained `padding-inline: var(--spacing-button-edge)`, which insets the purchase row and description from the title again. B3 round 7 removed exactly that. With the narrowed maxima, re-measure before reserving any room there.
6. **Design-visible changes without need.** `mood-finder__tablist` padding changes the wheel geometry; the tab cut is a focus ring, so the method is the inset ring. The newsletter overlay's body padding, `max-width` and margin on `.inline-submit-field` were sized against the old maxima (26.6px); the narrowed maxima may need none of them. Re-measure without these changes first.
7. **Acceptance not met.** `test:layout` has 4 new issues (acceptance: 0). The dialog and drawer sweep was not run (MCP `sourcePath` outside the workspace; paste the function source inline, or open the dialogs in the Playwright runner instead).
8. `tab-content-default` and `tab-content-underlined` changed from `overflow-hidden` to `overflow-visible`: show by measurement what the clip did (super menu tabs, search results) and that the change adds no layout issue.
9. Kept as is: the five schema ranges, the `blog__tab` fix, `focus-ring-inset`, `media-interaction`, `tab-nav-item`, pagination, sort trigger, gallery zoom, `feature-tabs`, hero swiper, featured description inset rings, the collection toolbar inset focus (move its rule to the collection section's owner).

### Correction round 1 (external session, 2026-10-22): stopped by the user

Items a–i of review round 1 landed (contact reverted, 404 outer clip removed, accordion collapse restored, product-info padding removed, mood-finder inset ring, tab content kept `overflow-hidden` with inset rings). To meet the `max`-mode bar it also added reserves: fixed 8px and 12.96px floors in `--spacing-button-edge`, padding on the cart drawer panel, the filters drawer footer, the newsletter overlay, and a padded 404 intro with negative margins, plus three section-owner blocks in `tailwind.components.css`. Its last full sweep: 0/0 on pages and dialogs; `test:layout` 2–4 new issues (not-found).

### Coordinator round 2 (2026-10-22): bar cut, reserves removed

The user cut the bar (outcome 1): the reserves served only the shadow and hover extremes. Removed: the two fixed floors (`tailwind.input.css` back to HEAD), the cart drawer panel and filters footer padding (and the `filters-drawer__footer` class), the newsletter overlay block, the 404 intro block and its class, the collection toolbar owner block. The accordion inner is back to HEAD (ring-only inset; hover with focus together on the cart accordion button may touch the edge by about 1.7px, accepted under the cut bar). The collection toolbar inset ring moved into the `.collection-toolbar__action` component rule (also covers `search-results-tabs`). Kept: the five schema ranges, `blog__tab`, `focus-ring-inset` and its consumers, the inset outlines in cart drawer buttons, filters drawer, pagination, sort trigger, feature-tabs, mood-finder, and the tab-content inset rule in `tailwind.elements.css`. Known residue: the newsletter overlay close button's ring may be cut by about 0.8px only at ring width 4 + offset 4 (measured 6.8px at the old 6 + 8).

Validators (2026-10-22): `npm.cmd run build:tw` done; `scan:compat`, `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `test:theme-check`, `lint:records` pass; `npx prettier --check` on the changed theme files: all formatted. `npm.cmd run test:layout`: New issues (not in baseline): 0 (wall time 179525 ms). Edge-clip sweep not rerun after round 2: the Ask reviewer runs it against the cut bar.

### Ask review round 1 (separate session, 2026-10-23): FAIL, one item

- Defect as written: the hero carousel's inset ring is hidden at the top edge under the announcement bar at 390 and 1440 (`sections/slides-show.liquid`). Coordinator: present before B4 (the outer ring was clipped at the frame); three sides visible, so WCAG 2.4.11 (not entirely hidden) holds; the "every side" wording in the review prompt was stricter than outcome 1. Fixing it needs an inset equal to the merchant-variable header height. Proposed to the user as accepted residue; pending the user's answer.
- Note: the `.cart-overlay-section .ui-dialog-drawer-panel .btn:focus-visible` rule matched no element (drawer buttons do not carry `.btn`); default rings were complete. Coordinator removed it; `sections/cart-overlay.liquid` is back to HEAD. `lint:theme` pass, prettier pass.
- Proven by the reviewer: diff in scope; five ranges and defaults valid; cart accordion collapse; no blog tab height change; 404 without horizontal scroll and watermark clipped; the tab content rule sets only outline and outline-offset; `build:tw` output unchanged (SHA-256), `scan:compat`, `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `test:theme-check` (157 files, 0 offenses), `lint:records`, prettier pass. Unproven: `test:layout` (the reviewer asked to write its ignored `.tmp-layout-check/` output; the coordinator's run after round 2 reported 0 new issues).
