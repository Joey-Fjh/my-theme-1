# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-25.

## Batch B7: `feature-tabs` one image with numbered product markers

**Status:** executed and reviewed; Ask review PASS (separate session, 2026-10-25); user looked in the editor and accepted the correction round (2026-10-25); correction review PASS (separate session, 2026-10-25). Closed; waiting for the user to ask for the commit. Coordinator review done (F1, F2 fixed). Authorized 2026-10-25 (user: external execution). Plan amended the same day: markers without a product (user, 2026-10-25).

**Why.** Reported by the user, 2026-10-25 (screenshot at 1440): the section should show one image whose numbered markers match the tab numbers; each marker links to a product. The design notes had dropped the reference's markers; the user reverses that. Decisions (user, 2026-10-25): option A; one image only (the per-block image is retired); no tooltip or bubble component: a marker's hover and keyboard focus look the same as the active tab's highlighted marker. Evidence (reference site inspected with Chrome DevTools MCP: markers are positioned discs, the active one filled; Shopify has no official hotspot pattern; `templates/product.json` sets no block image): `git show` of this commit's `docs/agent/board.md` history.

**Outcome.**
1. Section setting `image` (`image_picker`) is the only image; the block setting `image` and the per-block image layers and their cross-fade are removed. Placeholder when empty, as now.
2. Each `item` block adds `product` (`product`), `marker_x` and `marker_y` (`range` 0–100, step 1, unit `%`). Every item renders a marker disc with its two-digit number at its position, with or without an image (user, 2026-10-25). With a product the marker is an `<a href="{{ product.url }}">`, accessible name from a locale key ("{{ index }} {{ title }}"), 24px minimum target, visible focus ring. Without a product it is a plain `aria-hidden` number (it repeats the tab number). The four preset blocks and the no-block placeholder use four spread default positions that do not overlap.
3. Markers sit in a box that has the image's own aspect ratio and is scaled to cover the media column (centred, cropped like the image), so a marker stays on its object at every width. The image crop and the box crop match.
4. The marker of the active tab is highlighted; a marker under hover or `:focus-visible` gets the same look. Tab rows, panels, counter and their motion are unchanged. Clicking a marker navigates; it does not change the tab.
5. Without JavaScript: the image and the markers render and the links work (first marker highlighted as the first tab is).
6. Design notes updated: markers used, with the decisions above.

**Dependencies.** None.

**Implementation surface.** `sections/feature-tabs.liquid` (markup, `{% stylesheet %}`, schema); `locales/en.default.json`, `locales/en.default.schema.json`; `docs/design/product/feature-tabs/notes.md`. Not in surface: `assets/tab-control.js` (the active index is read through the existing `isActive()` binding), `templates/product.json` (merchant content; positions and products are set by the merchant in the editor).

**Review tier:** Ask (schema and markup change; removes a block setting).

**Acceptance checks.**
1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat` pass.
2. `git grep -n "block.settings.image" sections/feature-tabs.liquid` returns nothing; the schema has one section `image_picker` with id `image` and no block `image_picker`.
3. With products set on the four blocks (theme editor, not committed), at 390 and 1440: four markers render as links to the four product URLs; each accessible name contains the number and the product title (Chrome DevTools MCP snapshot).
4. Clicking tab 3 highlights marker 03 and no other; hovering and focusing marker 01 give it the same computed background and colour as the highlighted marker.
5. At 768, 1024 and 1440 a marker set to a fixed point on the image stays on the same image pixel (marker centre over the image within 2% of the image width), measured by script.
6. With the committed defaults (no image, no product): the placeholder shows markers 01 to 04 at their default positions, none of them links, all hidden from the accessibility tree, and the active tab's marker highlighted. A section with no blocks shows four placeholder markers the same way.
7. `npm.cmd run test:layout` with `shopify:dev` running: 0 new issues.
8. Motion: `review-animations` on the marker state transition; output recorded here.

**Estimate:** about 3 hours plus the Ask review.

**Checkpoint:** after checks 1 to 7 pass, before the review prompt; also stop if the cover box cannot keep markers on the image (check 5) with CSS alone.

**Bar:** must fix: any check above failing, a marker that is not a keyboard-reachable link with a name, the tab behaviour or look changing. Accepted residue: a marker placed near the image edge may be cropped out at some widths (merchant placement). Judged on the section's default settings plus four products and one uploaded image set in the editor.

### Execution log (implementer, 2026-10-25)

**Material decisions.** Active marker binding: `:class="{ 'is-active': isActive(tabIndexFor($el)) }"` with `data-tab-index` on each marker (same index space as tabs). Cover-box method: `.feature-tabs__cover-box` flex-centers `.feature-tabs__cover-inner` with `aspect-ratio: var(--feature-tabs-image-aspect-ratio)` (section image `aspect_ratio`, else `4/3` placeholder), `min-width: 100%` + `min-height: 100%` so the inner box tracks object-cover crop; markers use `%` + `translate(-50%, -50%)` inside the inner box. Legacy template blocks without saved marker coordinates: items 2–4 still at schema default `22/28` use preset spread positions from the index map (`22,28|78,22|28,72|72,68`).

**Check 1:** PASS — `npm.cmd run lint:theme` (passed); `npm.cmd run test:theme-check` (157 files, 0 offenses); `npm.cmd run lint:i18n` (passed; unused keys passed); `npm.cmd run lint:liquid-syntax` (passed); `npm.cmd run scan:compat` (build:tw + lint:compat passed).

**Check 2:** PASS — `git grep -n "block.settings.image" sections/feature-tabs.liquid` (exit 1, no matches); section schema `image_picker` id `image`; block `image_picker` removed.

**Check 3:** UNVERIFIED (needs editor setup) — committed defaults: 4 markers, 0 links, all `aria-hidden` (Chrome DevTools MCP on `http://127.0.0.1:9292/products/floral-white-top` at 390 and 1440). Product links and accessible names require products on blocks in the theme editor (no `--theme-editor-sync`).

**Check 4:** PARTIAL — tab 3 → only marker 03 `.is-active` (script on dev product page). Hover/focus vs active: CSS gives `.is-active`, `:hover` (fine pointer), and `:focus-visible` the same foreground fill (active marker computed `rgb(38, 61, 41)` / `rgb(241, 241, 241)`); product-link focus not exercised without products.

**Check 5:** PARTIAL — marker 01 centre vs `.feature-tabs__cover-inner` within 2% at 768, 1024, 1440 on placeholder (script: Δx/Δy < 0.01). With uploaded section image + custom coordinates: unverified (editor).

**Check 6:** PASS — 4 non-link `aria-hidden` markers at spread defaults; marker 01 `.is-active` with tab 1 (defaults + 390 viewport).

**Check 7:** PASS — `npm.cmd run test:layout`: **New issues (not in baseline): 0** (186192ms wall time).

**Check 8 (review-animations):** PASS — marker diff adds `background-color` / `color` / `border-color` transitions at `--motion-duration-fast` with `--motion-ease-enter`, hover gated `@media (hover: hover) and (pointer: fine)`, `prefers-reduced-motion: reduce` disables transitions; matches existing `.feature-tabs__tab` color transitions (cohesive state indication). No `transition: all`, no layout-property animation.

**Validators (completion):** `npm.cmd run lint:records` (board topics: 0). `npx prettier --check` on changed files (All matched files use Prettier code style).

**Dev server:** `127.0.0.1:9292` already in use (existing `shopify theme dev`); new `npm.cmd run shopify:dev` exited EADDRINUSE.

**Checkpoint:** checks 1–7 recorded; stopping before Ask review prompt per plan.

### Coordinator review (2026-10-25)

- **F1, fixed by the coordinator:** each block carried `{{ block.shopify_attributes }}` twice (tab button and marker), so the theme editor saw two elements per block. Removed from both marker branches; the tab button keeps it. Re-run: `lint:theme` passed, `test:theme-check` 157 files 0 offenses, `lint:liquid-syntax` passed, `lint:compat` passed, prettier clean.
- **F2, fixed by the coordinator (user chose a, 2026-10-25):** blocks 2 to 4 at exactly `22/28` were moved to the spread defaults, so a merchant placing marker 2, 3 or 4 at `22/28` was silently moved. The heuristic is deleted from the block loop (the no-block placeholder keeps its four default positions); `templates/product.json` `feature_tabs_product` now stores `marker_x`/`marker_y` 22/28, 78/22, 28/72, 72/68 on its four blocks. Surface widened to `templates/product.json` by the user; the commit carries `Merchant-Change: B7 marker positions, user 2026-10-25`. Re-run: `lint:theme` passed, `test:theme-check` 157 files 0 offenses, `lint:liquid-syntax` passed, prettier clean on both files.
- **Noted, no change:** image alt without merchant alt falls back to a generic locale string instead of an item heading (one image now serves all items); markers are 24px against the reference's larger discs (size is polish-pass work, `docs/project.md` rough-then-polish).

### Ask review (separate session, 2026-10-25): PASS

Re-ran `lint:theme`, `test:theme-check` (157 files, 0 offenses), `lint:i18n`, `lint:liquid-syntax`, `lint:compat`, `lint:records`, `test:layout` (0 new issues), prettier and `git diff --check`: all pass; `scan:compat` not run (it builds; read-only role). Proven: no consumer of the removed image layers or block image; marker `data-tab-index` shares the zero-based index space of `registerTab()` and `tabIndexFor()`; tab 3 click and ArrowDown move the highlight to exactly one marker; `block.shopify_attributes` once per block; no marker toggles a tab; locale keys complete; `templates/product.json` adds only the four positions; seven files, all in the surface; default markers `aria-hidden`, not focusable, at least 24px; server HTML has four markers with only 01 highlighted; reduced motion sets transitions to `none`.

Unproven (no image or products were set in the editor for the review): navigation, Tab order and focus-ring clipping of real product links; marker drift on an uploaded image; a real no-JavaScript browser. These go to the user's look below.

### User look and correction round (2026-10-25)

User's look in the editor with an uploaded image: (1) the number sits too close to the disc outline; (2) at `0/0` or `100/100` the marker leaves the visible area (centred on the image corner, and the image corner can be cropped out). User's rule: `0/0` is the top-left and `100/100` the bottom-right of the visible square, never outside.

Fixed by the coordinator in `sections/feature-tabs.liquid`: marker a fixed 36px disc (`--feature-tabs-marker-size: 3.6rem`, was a 24px minimum); positions passed unitless; `.feature-tabs__cover-box` is a size container; the marker's `left`/`top` map 0–100 to the marker's own edge on the image edge (`x / 100 * (cover width − marker size)`, no centring transform) and `clamp()` keeps it 0.8rem inside the visible crop (cover size `max(100cqw, 100cqh × ratio)`, crop offset half the overflow). Chrome DevTools MCP with the uploaded image: at 1249 (cover 835×626 in a 711×626 box) and at the 500px minimum window (449×337), `0/0`, `100/100`, `0/100` sit 8px inside the visible corners and `50/50` is centred. Re-run: `lint:theme` passed, `test:theme-check` 157 files 0 offenses, `lint:liquid-syntax` passed, `scan:compat` passed, prettier clean (the coordinator ran `prettier --write` on this one file to lay out the new `clamp()`). Trade-off: a marker's centre is no longer exactly at `x%` of the image; it moves by up to half a marker toward the middle, and the clamp may pull it off its object where the crop hides that spot.

### Correction review (separate session, 2026-10-25): PASS

At 390, 768, 1024 and 1440 every marker at the four extremes stays inside `.feature-tabs__cover-box`, 8px from the matching edges; 50/50 centred; an interior 30/40 point drifts under 0.2% across 768 to 1440; markers 36×36px; the focus ring keeps 4px clearance at clamped corners (temporary DevTools styling); unitless positions in all three branches, computed transform `none`; tab sync and reduced motion unchanged; media height positive at every width; container query units have no unsupported configured target. Validators: `lint:theme`, `test:theme-check` (157 files, 0 offenses), `lint:liquid-syntax`, `lint:compat`, `lint:records`, `test:layout` (0 new issues), prettier, `git diff --check`: all pass. The review saw the placeholder only; the cropped uploaded image was measured by the coordinator (correction round above). Unproven: native Tab focus and navigation on real product-marker links, moved to `docs/agent/backlog.md` (Browser pass).

## Batch B8: `mood-finder` card padding

**Status:** authorized 2026-10-25 (user: "先改这个"); coordinator edits directly. executed; first value `step-m`, then `step-s` (about 10px at 1440, 6px at 390) after the user's look asked for less (2026-10-25); validators pass (`lint:theme`, `scan:compat`, prettier, `test:layout` 0 new issues with B9); user accepted 2026-10-25; waiting for the commit.

**Why.** Reported by the user, 2026-10-25 (screenshot at about 1440): in the right card the image has too much space around it; less, but not none. Classified as code: `.mood-finder__panel-layer` pads the card with `--spacing-step-l` (about 20px at 1440). The large grey area inside the image box is the placeholder artwork, not spacing.

**Outcome.** `.mood-finder__panel-layer` padding `--spacing-step-l` → `--spacing-step-s` (about 15px at 1440, 9px at 390); the text below keeps the same inset as the image.

**Implementation surface.** `sections/mood-finder.liquid` `{% stylesheet %}` only.

**Review tier:** Show.

**Acceptance checks.** `npm.cmd run lint:theme` and `npm.cmd run scan:compat` pass; `npx prettier --check sections/mood-finder.liquid`; `git diff sections/mood-finder.liquid` shows only the padding line; the user's look at 390 and 1440.

**Estimate:** 10 minutes.

**Checkpoint:** after the validators, report to the user for the look.

**Bar:** must fix: a validator failing or a change outside the stylesheet line; accepted: placeholder artwork whitespace inside the image box. Judged on default settings.

## Batch B9: `ritual-steps` style B left column gap and outline numeral

**Status:** executed; validators pass; user accepted 2026-10-25; waiting for the commit. Authorized 2026-10-25 (user chose A for the gap and the proposed numeral fix; coordinator edits directly).

**Why.** Reported by the user, 2026-10-25 (screenshots at about 2000 and 1040, design at about 1900). (1) The step detail sat at the bottom of the one-screen stage (`justify-content: space-between` in absolutely stacked panels), so the gap under the heading was all leftover height. (2) The outline numeral behind the packshot wrapped "0" over "3" between 1024 and about 1280, sized by a viewport-width type token with no `nowrap`. Board discussion: git history of `docs/agent/board.md`.

**Outcome.** (1) The section heading and the active panel form one group centred by auto margins (top-aligned if it overflows); panels share one grid cell, so the stack takes the tallest panel's height; the panel gap is `clamp(--spacing-step-3xl, 14svh, 2 × --spacing-step-4xl)`. (2) The numeral gets `white-space: nowrap`; its size stays on the type token. A column-sized numeral (`min(…cqi, …cqh)`) was tried and dropped: `lint:theme` `stylesheet-font-size` counts container units and growing its baseline needs the user's approval, and `nowrap` alone fits at every measured width.

**Implementation surface.** `sections/ritual-steps.liquid` `{% stylesheet %}` only.

**Review tier:** Show.

**Acceptance checks.** `lint:theme`, `scan:compat`, prettier pass; `test:layout` 0 new issues; numeral one line inside its column and the group centred at 1024×640, 1040×900, 1440×900, 1920×1080 (Chrome DevTools MCP); the user's look.

**Estimate:** about 1.5 hours.

**Checkpoint:** after the validators and the measurements, report to the user for the look.

**Bar:** must fix: a validator failing, the numeral wrapping or overflowing its column at default settings, the group clipped at 1024×640. Accepted: a larger `heading_scale` setting can push the numeral past its column (decorative, no page overflow). Judged on default settings.

**Execution (coordinator, 2026-10-25).** Measured with the home template defaults: numeral width / column width 444/477 (1024×640), 447/485 (1040×900), 499/691 (1440×900), 499/807 (1920×1080), one line each; group space above = below: 13, 109, 101, 160px; panel gap 90, 126, 126, 151px; no horizontal overflow. `lint:theme` passed; `scan:compat` passed; prettier clean; `test:layout` (with B8): New issues 0.

## Batch B10: `slides-show` space between heading and action

**Status:** executed; validators pass; user accepted 2026-10-25; waiting for the commit. Authorized 2026-10-25 (user chose option A, `em` spacing; coordinator edits directly).

**Why.** Reported by the user, 2026-10-25 (screenshot and the home design): the call to action sits right under the display heading. The heading group used only the related gap (`gap-step-s`, about 10px), which `docs/design/design.md` assigned to "text and its button" whatever the heading size. Board discussion (mainstream practice: spacing by relationship, coarse merchant settings, space after a heading in `em`): git history of `docs/agent/board.md`.

**Outcome.** `docs/design/design.md` (Spacing scale) gains the rule "Space after a display heading follows the heading": `margin-block-end` in `em` of the heading, on top of the related gap. `.slides-show-section .slides-show__headline` gets `margin-block-end: 0.6em`.

**Implementation surface.** `sections/slides-show.liquid` `{% stylesheet %}`; `docs/design/design.md`.

**Review tier:** Show.

**Acceptance checks.** `lint:theme`, `scan:compat`, `lint:doc-paths`, prettier pass; heading-to-link distance grows with the heading size (Chrome DevTools MCP at 1440 and the narrowest window); no horizontal overflow; the user's look.

**Estimate:** 30 minutes.

**Checkpoint:** after the validators and the measurement, report to the user for the look.

**Bar:** must fix: a validator failing, the link pushed out of the slide at default settings. Accepted: the exact factor (0.6em) is tuned by the user's look. Judged on default settings.

**Execution (coordinator, 2026-10-25).** Home template defaults: 1440×900 heading 95.4px, margin 57.2px, heading to link 67px; 500×844 heading 44.1px, margin 26.5px, heading to link 33px; no horizontal overflow. `lint:theme`, `scan:compat`, `lint:doc-paths` passed; prettier clean.

## Batch B11: `testimonial-featured` section width setting

**Status:** executed and reviewed (Ask review PASS, separate session, 2026-10-25); user accepted 2026-10-25; executed, waiting for the commit. Authorized 2026-10-25 (user: coordinator edits directly).

**Why.** Reported by the user, 2026-10-25 (screenshot): the testimonial marquee should be able to run to both browser edges, but the section fixes `section-frame` `width: 'page'`. User direction (2026-10-25): the architecture offers the capability, the design decides per section; `docs/design/design.md` must not list which sections may bleed (its case-level detail goes to a backlog pass).

**Outcome.**
1. `testimonial-featured` gets the `section_width` select used by `custom-liquid` and `scrolling-icon-with-text` (`fixed` default, `full`), mapped to `section-frame` `width` (`page` / `full`). With the default nothing changes; the stored template needs no edit.
2. With `full`, only the testimonial track spans the viewport; the heading and other copy keep the page margins (user, 2026-10-25). Prefer the page grid's `full` column line (6-C5) for the track over switching the whole frame; colour scheme, padding (`scheme_target: 'inner'`) and the marquee keep working; no horizontal page scroll.
3. `docs/design/design.md` Overview rule 5 and the matching Don't are generalised: content keeps the page margins by default; a section may offer a full-width setting where its design needs it (no list of section kinds).

**Implementation surface.** `sections/testimonial-featured.liquid` (Liquid and schema); `locales/en.default.schema.json` (reuse the existing option wording as new keys under `testimonial-featured`); `docs/design/design.md`.

**Review tier:** Ask (schema and markup).

**Acceptance checks.**
1. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`, `npm.cmd run lint:doc-paths`, prettier pass.
2. Default (`fixed`): the section renders as before (same computed width and left edge as HEAD at 390 and 1440).
3. `full` (set in the live DOM or the editor, not in the template): the marquee track spans the viewport at 390, 1024 and 1440 while the heading's left edge equals the page-margin edge of the section above; no horizontal overflow on the document; scheme background and padding unchanged.
4. `npm.cmd run test:layout`: 0 new issues.

**Estimate:** about 1 hour plus the Ask review.

**Checkpoint:** after checks 1 to 4, before the review prompt.

**Bar:** must fix: any check failing, the default look changing, horizontal page scroll with `full`. Accepted: none beyond the default look. Judged on default settings, then `full`.

**Execution (coordinator, 2026-10-25).** Setting `marquee_width` (`page` default, `full`) under the Marquee header, labels `sections.testimonial-featured.settings.marquee_width` and `options.page_width` / `options.full_width` (named for what it changes: only the track bleeds, so not `section_width`). With `full` the layout gets `testimonial-featured__layout--full container-page` instead of the flex classes; `:where()` rules put every child on the page grid's `full` lines and the heading back on `content`, and set `row-gap: var(--spacing-step-xl)` (the `:where(.own-class)` route; `mixed-element` rejected a core utility next to the styled class, and a rule naming `__module`, which carries `relative`). `section-frame` stays `width: 'page'`. `docs/design/design.md` rule 5 and the matching Don't generalised. Measured on the home page by switching the layout class in the live DOM (template untouched): default and before are identical; with `full` at 1440, 1024 and 500 the track runs from 0 to the scrollbar (right inset 15px = scrollbar), the heading stays at the page margin (24, 22, 17px), the heading-to-track gap is unchanged (30, 26, 19px), no document overflow. Validators: `lint:theme` passed, `test:theme-check` 157 files 0 offenses, `lint:i18n` and unused keys passed, `lint:liquid-syntax` passed, `scan:compat` passed, `lint:doc-paths` passed, prettier clean, `test:layout` New issues 0.

**Ask review (separate session, 2026-10-25): PASS.** Default identical to HEAD at 390, 1024, 1440; with the Liquid-emitted `full` class list the marquee viewport spans 0 to the scrollbar (0–375, 0–1009, 0–1425), heading left edge 16, 21.59, 24px matching neighbours, gap 18, 26.41, 30px in both modes, no document overflow; colour scheme and padding unchanged; computed columns `full` for layout and module, `content` for the heading; marquee, focus pause, Enter toggle and reduced motion unchanged; locale keys present and used. Validators: `lint:theme`, `test:theme-check` (157 files, 0 offenses), `lint:i18n`, `lint:liquid-syntax`, `lint:compat`, `lint:doc-paths`, `lint:records`, `test:layout` (0 new), prettier, `git diff --check`: all pass. Unproven: the theme editor toggle itself (user's look).

## Batch B12: product buttons follow the colour scheme (Buy it now)

**Status:** executed; user accepted 2026-10-25 after the hover correction; waiting for the commit. Authorized 2026-10-25 (user: coordinator edits directly).

**Why.** Reported by the user, 2026-10-25 (two screenshots): product buttons ignore the colour scheme's button colours. User direction: every product-related button is one class and follows the scheme's primary or secondary button; the only exception is what Shopify renders (branded accelerated checkout, closed shadow DOM, only size, radius and shadow properties per shopify.dev "Accelerated checkout").

**Audit.** Script over `tailwind/` and every section and snippet stylesheet for button rules setting colours outside the scheme button tokens, plus the button classes in markup. All product buttons (product page, featured product, quick view, cards, recommendations, cart, cart drawer) use `btn-primary` / `btn-secondary`. The only bypass: the unbranded Buy it now in the purchase row (`tailwind/tailwind.components.css` and `snippets/buy-buttons.liquid` set transparent fill, line border, muted hover, no motion). Disabled and unavailable states use the line, strong-surface and subtle roles (the scheme has no disabled button colour); kept. The card Add to cart in the user's screenshot is token-driven (`product-card__btn-secondary` applies `btn-secondary`; scheme-2 secondary is white in the local `config/settings_data.json`); the black seen is likely dev-theme configuration not synced locally: the user checks by changing that scheme's secondary colour. Outside product buttons: `sections/collection.liquid` filter buttons add `surface-inverted` to `btn-primary` (backlog).

**Outcome.** Buy it now in the purchase row takes `btn-secondary` from an unlayered rule in `tailwind/tailwind.elements.css` beside the base unbranded rule (both must beat Shopify's own unlayered CSS; a `components`-layer rule loses to the base `btn-primary`). The local colour overrides are deleted from `tailwind/tailwind.components.css` and `snippets/buy-buttons.liquid`; uppercase and letter spacing stay. The unbranded hover fallback without `color-mix` now reads `--btn-*` instead of the primary colours.

**Implementation surface.** `tailwind/tailwind.elements.css`, `tailwind/tailwind.components.css`, `snippets/buy-buttons.liquid` `{% stylesheet %}`.

**Review tier:** Show.

**Acceptance checks.** `lint:theme`, `scan:compat`, prettier pass; `test:layout` 0 new issues; on the product page Buy it now computes the scheme's secondary colours and follows a changed `--color-secondary-button` (Chrome DevTools MCP); the user's look.

**Estimate:** 20 minutes.

**Checkpoint:** after the validators and the measurement, report to the user for the look.

**Bar:** must fix: a validator failing, Buy it now not following the scheme. Accepted: Buy it now now has the secondary hover motion of other secondary buttons. Judged on default settings.

**Execution (coordinator, 2026-10-25).** Product page (scheme-2): before, transparent fill and line border; first attempt (secondary in the components layer) rendered the primary colours (the unlayered base rule won), corrected by moving the rule. After: background white, text and border `#263d29` (scheme-2 secondary); with `--color-secondary-button: 200, 30, 30` and text `10, 10, 120` set live on the parent, the button rendered those after its transition. `lint:theme` passed; `scan:compat` passed; prettier clean; `test:layout` New issues 0.

**Correction round (user's look, 2026-10-25).** The card Add to cart looked disabled on hover. Cause: `btn-secondary` mixed fill 42% toward the label and the label 65% toward the fill, so the two crossed (contrast 1.17:1 on scheme-2, computed). User chose option A (design.md Component States: a filled button darkens one step): `--btn-reverse-fill-hover` 16%, `--btn-reverse-text-hover` 0% in `tailwind/tailwind.elements.css`; every secondary button changes. Scheme-2 contrast (computed, WCAG formula): hover 8.84:1, breath peak 8.02:1. `lint:theme`, `scan:compat`, prettier pass.

## Batch B13: mobile card rails show one card per view

**Status:** executed; user accepted 2026-10-25 after the page-inset correction; waiting for the commit. The coordinator edited directly after the user's report named the sections and the expected behaviour (2026-10-25); no separate authorization line.

**Why.** Reported by the user, 2026-10-25 (screenshot at mobile width and an example): in `routine-showcase` and `ritual-steps` (styles A and B) the next card peeks in at the right edge; target: one card per view with the page margin on both sides, switched by swipe or the dots. Takes the named part of the `docs/agent/backlog.md` item "Mobile rails, one card per view" (the user named these sections; the other candidates stay there).

**Cause.** `.card-rail` padded the rail with the side inset and gave each slot the rail's content width with no gap, so the next slot started inside the right inset (17px visible at 500).

**Outcome.** `tailwind/tailwind.components.css`: each `.card-rail__slot` is one rail width (`flex: 0 0 100%`) and carries the inset inside it (`padding-inline: max(var(--page-margin), calc((100% - 48rem) / 2))`); the rail drops its inline padding and scroll padding. A first attempt (gap equal to the inset through `cqi`) failed above about 512px because `cqi` measures the rail's content box, without its padding.

**Implementation surface.** `tailwind/tailwind.components.css` (card rail block).

**Review tier:** Show.

**Acceptance checks.** `lint:theme`, `scan:compat`, prettier pass; `test:layout` 0 new issues; at 500 and 720 each rail shows exactly one card with equal side space at the first and second card (Chrome DevTools MCP); the user's look on a phone width.

**Estimate:** 30 minutes.

**Checkpoint:** after the validators and the measurement, report to the user for the look.

**Bar:** must fix: a peeking card at mobile widths, unequal side space, dots or swipe not landing on one card. Judged on default settings.

**Execution (coordinator, 2026-10-25).** Home page, all three rails (`routine-showcase`, two `ritual-steps`): at 500 the visible card widths were 451 / 0 / 0 with insets 17 / 17, and after scrolling the second card into the centre 0 / 451 / 0 with 17 / 17; at 720 480 / 0 / 0 with 113 / 113, then 0 / 480 / 0 with 113 / 113. `card-rail.js` `scrollToIndex` centres by `offsetLeft`, unchanged. `lint:theme`, `scan:compat`, prettier pass; `test:layout` New issues 0.

**Correction round (user, 2026-10-25).** The user asked whether 17px and 113px were fixed values: 17px was `--page-margin`, but 113px came from the rail's own 48rem card cap, outside the page width and margin settings. User direction: the rail must follow the layout settings like every other section. `.card-rail__slot` `padding-inline` is now `var(--page-inset)` (`assets/base.css`, the page grid's side inset); the 48rem cap is gone. Measured: rail card insets equal the page-grid content insets of the sections around it (17 / 17 at 500, 19 / 19 at 720, one card visible at the first and second position). `lint:theme`, `scan:compat`, prettier pass; `test:layout` New issues 0. Swiper: the rail is native scroll snap plus `card-rail.js`, not Swiper (the shared indicator item stays in `docs/agent/backlog.md`).
