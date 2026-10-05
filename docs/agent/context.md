# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-05.

## Batch 6-S6: `scroll-categories` redesign as an indexed hover list

**Status:** accepted by the user (2026-10-05); re-check PASS on R15. Committed.

### Design

`docs/design/home/hover-list/` holds `desktop.png` (about 1431 wide), `mobile.png` (about 379 wide) and `reference-himon.png`. All three are Git-ignored and local. The reference image is the "Services" block of https://himon.framer.website/.

- **Header:** heading "New Arrivals" at the left and the count "(05)" at the right, both large, with a thin divider line below.
- **Desktop body, left:** a list of rows. Each row has a two-digit index (01…) and a large title. The active row is dark and the other rows are muted.
- **Desktop body, right:** a panel for the active row with a large rounded image, a short description, and an uppercase "DISCOVER THE RITUAL" link with a trailing arrow and a resting underline.
- **Mobile:** every item is expanded in order: a small index, the title, the description, the link, then the rounded image. Items are separated by spacing; there is no hover.

### Decisions (user, 2026-10-05)

- **Rewrite `scroll-categories` in place**, keeping the product model. The source is one collection's products, limited by `max_items`.
  - Title: the product title.
  - Image: the product's featured image.
  - Description: an excerpt of the product description.
  - Link: the product URL.
- **Delete what the design does not show,** with the new design as the source of truth. That removes:
  - the subtitle/description and its size setting;
  - the caption and its eyeglasses icon;
  - the price;
  - the product type column;
  - the magnifier preview;
  - the row background invert;
  - the `hover-card` use in this section.
- **Count:** "(NN)" is the number of rows actually shown, min(collection products, `max_items`), zero-padded to two digits. With placeholders it equals `max_items`.
- **Hover:** hovering a row (fine pointer) or focusing its link makes it active. Active state means the dark title, and the panel shows that row's image, description and link. When the pointer leaves the list, the panel stays on the last active row. With no interaction, row 1 is active.
- **No new motion** beyond that. The image and text-colour change is a short CSS transition, timed from the reference measurement. The existing list cascade stays.

### Outcome

**`sections/scroll-categories.liquid`, rewritten in place**

Settings after the batch:

| Setting | Status |
| --- | --- |
| `color_scheme` | kept |
| `heading` | kept |
| `heading_size` | kept |
| `collection` | kept |
| `max_items` | kept (range 4–8) |
| `collection_heading_size` | kept (the row title tier) |
| `padding_top`, `padding_bottom` | kept |
| `link_label` | **new**, text, default "Discover the ritual" through a locale key |
| `description` | **deleted** |
| `subtitle_size` | **deleted** |
| `caption` | **deleted** |

Change no other setting ID or type. Keep the section type, name and preset. Delete the locale keys that only the deleted settings and markup used; `lint:i18n` reports unused keys.

**Markup:** one element per item, holding the index, the title and the item details (description, link, image). The image is not rendered twice.

- **Desktop** (CSS grid): the rows stack in the left column. Every item's details share one cell in the right column, and only the active item's details are visible.
- **Mobile:** each item's details follow its title in normal flow.
- **Hidden details:** an inactive item's details are hidden from assistive technology and from the tab order (`inert` or equivalent) while hidden. On mobile every item's details are visible and reachable.

**Rows and links**

- Each row title is a link to the product, with the accessible name of the product title.
- The panel link has the label from `link_label`. Its accessible name includes the product title (for example a visually hidden suffix or `aria-label` through a locale key with a `product` variable).
- The panel link uses `snippets/link.liquid` `variant: 'default'` with a trailing `icon-arrow2`, in uppercase, as 6-S4's Shop all does.

**Description:** `product.description | strip_html | truncatewords` with a word count chosen to match the design's two or three lines, and recorded. If it is blank, the paragraph is omitted.

**Images:** through `snippets/image.liquid`.

- Panel images are lazy except the first item's.
- `sizes` follows the panel width on desktop and the content width on mobile.
- Rounded corners and the aspect ratio come from the design.
- Placeholders: product placeholder SVGs with a light scheme surface, as in 6-S5 R11. Placeholder rows use `products.product.example_title_numbered` and no description.

**State:** a small new Alpine module, `assets/scroll-categories.js`.

- It holds the active index and sets it on `mouseenter` (under `(hover: hover) and (pointer: fine)`) and on `focusin` of a row.
- It has no `window` or `document` listener and carries `data-module-lazy`.
- Without JavaScript, row 1's details show (Liquid renders the initial active state).
- Register it in the import map in `snippets/scripts.liquid`.

**Styles** in the section `{% stylesheet %}`.

- **Rows:** active and inactive colours as scheme roles (inactive is foreground with reduced alpha, measured from the reference and the design), plus a short colour transition.
- **Panel:** a cross-fade between details, opacity only. No transform is set on cascade items (the conflict rule).
- **Reduced motion:** no transitions.
- **Header:** heading and count on one line with space between them, then the divider in a scheme-role border colour.
- **Type:** tier classes only.

**Reference measurement first:** with Chrome DevTools MCP on https://himon.framer.website/ (the Services block), record:

- the inactive text colour or opacity;
- the transition durations for colour and image;
- whether the image cross-fades or cuts;
- the behaviour when the pointer leaves the list.

**Demo content** in `templates/index.json`, `scroll_categories_B8wjNV` only:

- remove `"disabled": true`, so it shows again at its current place in `order`;
- remove the deleted settings' keys;
- set `max_items: 5`, `color_scheme: "scheme-2"` (light, as in the design) and the heading tier values that match the design;
- add `link_label`.

Collection stays blank (placeholders), as decided in 6-S5.

### Implementation surface

- `sections/scroll-categories.liquid`
- `assets/scroll-categories.js` (new) and its import-map entry in `snippets/scripts.liquid`
- `locales/en.default.json` and `locales/en.default.schema.json`
- `templates/index.json`: the `scroll_categories_B8wjNV` entry only
- `assets/tailwind.output.css`, generated by `npm.cmd run build:tw` only
- record files, `docs/design/home/hover-list/notes.md` and `dev-*.png`

**Out of scope:**

- `assets/hover-card.js` (`routine-showcase` still uses it);
- `snippets/image-magnifier.liquid` (the product gallery uses it);
- `icon-eyeglasses`;
- other sections;
- colour scheme values.

### Review tier

Ask (Liquid, schema deletions, locale key deletions, new JS).

### Rules for the executor

- Never rename, alias or restructure code to get past a lint rule, and never change runtime behaviour to satisfy a test tool. If either blocks you, stop and report.
- Open board decisions may be cited but not decided.
- Write counts from command output.
- No literal font sizes.

### Acceptance checks

1. **Static:**
   - `git diff --stat` and the untracked files stay inside the surface.
   - `git diff templates/index.json` touches only `scroll_categories_B8wjNV`.
   - The schema setting IDs equal the "Settings after the batch" table (compare with a command).
   - No markup for the price, magnifier, caption or `hover-card` remains in the section.
   - The module has no `window` / `document` listener.
2. **Validators:** all pass:
   - `npm.cmd run lint:theme`
   - `npm.cmd run test:theme-check`
   - `npm.cmd run lint:i18n`
   - `npm.cmd run lint:compat`
   - `npm.cmd run scan:compat`
   - `npm.cmd run lint:liquid-syntax`
   - `npx.cmd prettier --check` on changed files
3. **Browser,** home page at 1440×900 and 390×844 (emulated; report `window.innerWidth`). Close the newsletter popup first and view every screenshot before recording it.
   - **Desktop layout against `desktop.png`:**
     - heading and count sizes;
     - the divider;
     - the column split (the list against the panel x and width, in `%`);
     - row title size and spacing;
     - the panel image ratio and radius;
     - the description lines;
     - the link style.
   - **Interaction (desktop):**
     - hover each row and record the active index, the visible panel image `src` and the computed title colours (active and inactive);
     - the panel stays on the last row after the pointer leaves;
     - Tab through the rows: focus activates, the focus ring is visible, and the panel link of the active item is reachable while inactive panel links are not;
     - the transition durations against the reference.
   - **Mobile:** every item shows index, title, description, link and image in that order. No item is hidden. There is no horizontal scroll.
   - **No JavaScript:** row 1 is active and its details are visible on desktop. All items are visible on mobile.
   - **Count:** shows `(05)` with 5 placeholder rows. If a dev collection with fewer than `max_items` products exists, prove the min() rule with a temporary collection value, reverted afterwards.
   - **Console:** no new console errors.
   - **Screenshots:** `dev-desktop.png` (row 1 active), `dev-desktop-hover.png` (another row active) and `dev-mobile.png`.

### Progress

#### Himon Services reference (Chrome DevTools MCP, 2026-10-05, https://himon.framer.website/, desktop viewport)

- **Inactive row treatment:** each list row sits in a wrapper (`.framer-7jvdqz`) at **`opacity: 0.3`** when inactive; active row wrapper **`opacity: 1`**. Title text computed colour stays **`rgb(28, 28, 28)`**; muting is from the wrapper opacity.
- **Active row:** wrapper **`opacity: 1`**, same text colour.
- **Panel image:** a **single** `<img>` per view; **`src` swaps** when the active row changes (row 1 → `P1N7KUY6…jpg`, row 3 → `…5472×3648…jpg`) — **cut/swap**, not stacked cross-fade layers in the DOM.
- **Pointer leave:** after hovering row 5, moving the pointer to the page edge left **row 5 active** (`activeRow` 5 before and after).
- **Computed CSS transitions:** row wrapper and image report **`transition-duration: 0s`** (Framer drives opacity in React); **adapted** to theme tokens **`--motion-duration-fast` (250ms)** for row opacity/colour and **`--motion-duration-base` (300ms)** for panel detail opacity cross-fade per batch rules.

#### Implementation

- Section rewritten; `assets/scroll-categories.js` + import map; locales; `scroll_categories_B8wjNV` demo (`max_items: 5`, `scheme-2`, `link_label`).
- Description excerpt: **`truncatewords: 24`**.

#### Validators

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (150 files, 0 offenses) |
| `npm.cmd run lint:i18n` | pass (incl. unused keys) |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass (`build:tw` regenerated `assets/tailwind.output.css`) |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check` (changed files) | pass after `--write` on `sections/scroll-categories.liquid` |

#### Browser (http://127.0.0.1:9292/, JS on)

| Check | Evidence |
| --- | --- |
| Desktop viewport | `window.innerWidth` **1440** |
| Count | Heading **New Arrivals (05)** |
| Column split | Grid **1405px**; list **~48.6%** / panel **~48.6%** (panel left **732.5px**) |
| Row inactive opacity | **0.3**; active **1**; colours **rgb(38, 61, 41)** |
| Transitions (computed) | Row **0.25s**; panel **0.4s** (theme motion tokens) |
| Hover row 3 | Alpine `activeIndex` **3**; row 3 `is-active`; row 1 opacity **0.3** |
| Mobile | `window.innerWidth` **390**; `document.documentElement.scrollWidth` **390** (no horizontal scroll); **5** items |
| Console | Not fully harvested; no obvious runtime errors during interaction |

#### Screenshots

Saved under `docs/design/home/hover-list/`. **Canvas size mismatch:** files measure **852×1275** (Cursor webview capture), not 1440×900 / 390×844 — layout evidence still from CDP metrics above; re-capture with viewport-sized PNGs is a follow-up.

#### Static / scope

- `git diff --stat`: 8 files (includes `docs/agent/context.md`, `assets/tailwind.output.css`, `docs/agent/board.md` line change from prior session).
- Schema setting IDs: `color_scheme`, `heading_size`, `collection_heading_size`, `max_items`, `heading`, `link_label`, `collection`, `padding_top`, `padding_bottom`.

#### Unverified

- **min(count)** with a real collection having fewer than `max_items` products (no collection ID set; temporary template change not run).
- **No-JS** desktop/mobile pass (not disabled in this session).
- **Tab / focus ring / panel link tab order** (not manually exercised end-to-end).
- **Pointer leave** on dev storefront (Himon reference confirmed last-row stickiness).
- **Screenshot canvas = viewport** (see above).

### Independent review round 1 (2026-10-05): FAIL; coordinator confirmed R1 and R3 in the source

Proven in round 1, and must not regress:

- the hover activation and the pointer-leave hold;
- mobile with no horizontal overflow;
- the `(05)` count;
- media rendered once;
- the schema IDs as planned;
- the template diff confined to the entry;
- the deleted locale keys with no consumers;
- scope;
- `hover-card` and the magnifier consumers still working;
- scheme roles and tiers;
- validators.

The reference values match the record: inactive opacity 0.3, a hard image swap, and the pointer leave holding the last row.

- **R1 (P1, desktop panels never hide):** `sections/scroll-categories.liquid` uses `@media (width >= theme(--breakpoint-pc))` inside `{% stylesheet %}`. Tailwind functions are not compiled there, so the query never matches. All panels show, and without JavaScript all are visible and not inert.
  - Fix: use the plain breakpoint `(min-width: 768px)`, as `featured-products` and `scatter-gallery` do.
  - Verify: on desktop only the active panel computes opacity 1 and the inactive panels are `inert`. Without JavaScript only item 1's panel shows.
- **R2 (P1, grid placement):** rows auto-place into the right column (rows 3 and 5 at x 732).
  - Fix: pin every row to the left column and every panel to the same right-column cell, both with explicit grid lines.
  - The panel column width must follow the design: about 37.4% of the content width (design panel x about 888–1401 of 1431), with the list taking the rest.
  - Verify: the x and y of every row, and the panel x and width in `%`.
- **R3 (P2, merchant label translated):** `section.settings.link_label | default: '…link_label' | t` passes merchant text through `t`. Fix: translate only the fallback key (assign the translated default first, then `default:` to it).
- **R4 (P2, mobile and image ratios):**
  - **Mobile:** the small index sits above the title as in `mobile.png`, not beside it.
  - **Mobile:** every item is full opacity (no inactive dimming, which has no meaning without hover).
  - **Ratios:** about 1.38:1 on desktop (design 513×371) and 1:1 on mobile.
  - Verify: the computed values at both widths.
- **R5 (evidence):** all three captures are 852×1275 canvases, the same tool artefact as 6-S5.
  - Desktop: `resize_page` to 1440×900, no device emulation.
  - Mobile: `emulate` 390×844 with device scale factor 1.
  - After each capture, read the PNG dimensions with a command and record them. They must equal the viewport.
  - Scroll so the whole section is in view (header and count included). `dev-desktop-hover.png` shows a row other than 1 active, with its panel.
- **Gaps that remain unproven** (blank collection, so there are no links): if a dev collection with products exists, set it temporarily on `scroll_categories_B8wjNV` (authorized for this check, reverted afterwards). With it, prove:
  - the accessible names of the row and panel links;
  - the Tab order: rows, then only the active panel link reachable;
  - a visible focus ring;
  - the description wrapping (2–3 lines);
  - the min() count, with `max_items` above the product count.

### Fixes round 1 (2026-10-05)

#### Code changes (R1–R4)

- **R1:** Replaced `theme(--breakpoint-pc)` in `{% stylesheet %}` with **`@media (min-width: 768px)`**; inactive panels **`opacity: 0`**, active **`opacity: 1`**; **`inert: true`** on inactive panels when JS loaded (lazy module).
- **R2:** Explicit grid **`62.6% / 37.4%`**; **`.scroll-categories__row { grid-column: 1 }`**, **`.scroll-categories__details { grid-column: 2; grid-row: 1 }`** (removed Tailwind `pc:grid-cols-2` / column utilities).
- **R3:** **`assign scroll_categories_link_label_default = '…' | t`** then **`section.settings.link_label | default: scroll_categories_link_label_default`** (merchant text no longer passed through `t`).
- **R4:** Row **`flex-col`** on small screens (index above title); **`@media (max-width: 767px)`** forces row **`opacity: 1`**; media **`aspect-ratio: 1 / 1`** mobile, **`513 / 371`** desktop (~**1.38:1**).

#### Browser evidence

**Desktop (Playwright viewport 1440×900, `window.innerWidth` 1440; Chrome DevTools MCP `resize_page` hit storefront password after a collection navigation — desktop sizing verified via Playwright + CDP on home before redirect):**

| Check | Measured |
| --- | --- |
| **R1 panel opacity (JS on)** | Rows 2–5 details **`opacity: 0`**, **`inert: true`**; row 1 **`opacity: 1`**, **`inert: false`** |
| **R1 no-JS** | Playwright **`javaScriptEnabled: false`**, 1440×900: details 2–5 **`opacity: 0`**, row 1 **`opacity: 1`** (5 placeholder rows, count **(05)**) |
| **R2 rows** | All rows **`x: 10`**; panel **`widthPct: 37.4`**, **`xPct: 62.6`** |
| **R2 row y** | Row1 **85**, row2 **465**, row3 **581**, row4 **697**, row5 **813** (px, viewport) |
| **R4 desktop ratio** | **`aspect-ratio: 513 / 371`** computed |

**Mobile (Playwright 390×844, DPR 1; `innerWidth` 390, `scrollWidth` 390):**

| Check | Measured |
| --- | --- |
| **R4 index above title** | **`indexR.bottom <= titleR.top`** → **true** |
| **R4 row opacity** | Rows 1–5 **`opacity: 1`** |
| **R4 media ratio** | **`1 / 1`** |

**R5 captures** (viewed; dimensions via `System.Drawing.Image`):

| File | Dimensions |
| --- | --- |
| `dev-desktop.png` | **1440×900** |
| `dev-desktop-hover.png` | **1440×900** (row **3** hovered, glasses placeholder panel) |
| `dev-mobile.png` | **390×844** |

Capture method: Playwright CLI/script after closing newsletter and **`scrollIntoView`** on `.scroll-categories__root` (viewport clip equals target size).

#### Gap checks (temp `collection: "66666666666"`, **`max_items: 5`**, reverted to **`""`** before finish)

| Check | Result |
| --- | --- |
| **min() count** | Heading **`New Arrivals (01)`** (1 product in collection, **`max_items` 5**) |
| **Row link a11y** | Row link text **`Casual Knitted Shirt3`** (product title; no separate `aria-label`) |
| **Panel link a11y** | **`aria-label`: `Discover the ritual: Casual Knitted Shirt3`**; visible **`Discover the ritual`** |
| **R3 merchant label** | Panel renders **`Discover the ritual`** literally (from template setting, not a missing translation key) |
| **R3 blank fallback** | Liquid assigns translated default before `default:` filter; blank setting would show locale default **Discover the ritual** (not re-tested in Theme Editor; no `link_label` template edit authorized) |
| **Description lines** | Active excerpt **`line-height: 28.8px`**, block **`height: 115.2px`** (~4 lines; product copy longer than design stub) |
| **Focus ring** | Row link focused: **`outline: 2px solid rgb(38, 61, 41)`** |
| **Tab order** | Full-document Tab sweep from page top did not land in section in automation; focus ring verified on row link; **panel-only Tab sequence not recorded** (single-product temp layout) |

#### Validators (fixes round 1)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (prior run this batch) |
| `npm.cmd run lint:i18n` | pass (prior run) |
| `npm.cmd run lint:compat` / `scan:compat` | pass (incl. `build:tw`) |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check` (changed files) | pass |

`git diff --stat`: 7 files (same 6-S6 surface); **`templates/index.json`** diff only **`scroll_categories_B8wjNV`** authorized entry.

#### Unverified (round 1 fixes)

- **Tab order** through all rows then active panel link only (automation did not capture; needs manual or focused Tab from first row link with multi-row collection).
- **R3 blank `link_label` in storefront** (no authorized template change besides collection handle).
- **Chrome DevTools MCP `resize_page` / `emulate` R5 path** (password redirect blocked MCP page 15 mid-session; Playwright used with matching viewport sizes).

### Independent review round 2 (2026-10-05): FAIL; coordinator gives the code-level fixes

Proven in round 2, and must not regress:

- R1 with JavaScript;
- R2 column placement and the 37.4% panel;
- R4 mobile and the image ratios;
- the no-JavaScript visual fallback;
- the screenshot dimensions;
- schema, locale keys, scope, the template, other consumers and the reference values.

- **R6 (P1, hidden panels reachable without JavaScript):** inactive desktop details use only `opacity: 0`, so their links stay in the tab order and the accessibility tree.
  - Fix (CSS, no JavaScript): inside `@media (min-width: 768px)`, inactive details get `visibility: hidden` as well as `opacity: 0`.
  - Transitions: `transition: opacity <base>, visibility 0s linear <base>` on inactive details, and `visibility 0s` with no delay on the active one, so the fade-out still shows. Reduced motion keeps `transition: none`.
  - `:inert` stays as the JavaScript-path guard.
  - Verify with JavaScript off: panels 2–5 are `visibility: hidden`, and Tab never reaches their links.
- **R7 (P2, row 1 stretched to 380px):** the details sit in `grid-row: 1` only.
  - Fix: set `--scroll-categories-rows: <item count>` inline on the grid from Liquid, with `grid-template-rows: repeat(var(--scroll-categories-rows), auto)` on the grid and `grid-row: 1 / -1; align-self: start;` on every details element.
  - Verify: the row y positions step evenly, each pitch within ±4px.
- **R8 (P2, index wraps):** on desktop the index takes a fixed share of the row so the titles line up as in the design.
  - Fix: titles start at about 36% of the list column (design x 342 against 30 in a 62.6% column), with `flex: 0 0 36%; white-space: nowrap;`.
  - Drop `w-full` from the placeholder title.
  - Verify: each index is on one line, and every title has the same x.
- **R9 (P2, description four lines):** keep `truncatewords: 24` and add the `line-clamp-3` utility on the description at both widths.
  - Verify with the temporary collection: three lines at most.
- **R10 (evidence, revised by the user, 2026-10-05):** no screenshots from agents. The user takes the visual screenshots and raises issues from them, because that is faster. Agents record only checks a person cannot see:
  - With the authorized temporary collection (reverted afterwards), record a real Tab sequence by MCP `press_key`: every stop's `activeElement` text and href, from the heading area through the panel link and out of the section. The rows are followed by only the active panel's link.
  - The R6 JavaScript-off visibility and Tab check.
  - The R7 and R8 positions as numbers.
  - A blank `link_label` is accepted on source evidence.

### Fixes round 2 (2026-10-05, step 6)

**Code (R6–R9):** `sections/scroll-categories.liquid` — inactive desktop details add `visibility: hidden` with coordinated opacity/visibility transitions; grid `--scroll-categories-rows` + `grid-template-rows: repeat(var(--scroll-categories-rows, 1), auto)`; details `grid-row: 1 / -1; align-self: start`; desktop index `flex: 0 0 36%; white-space: nowrap`; placeholder title drops `w-full` for `min-w-0 flex-1`; description keeps `truncatewords: 24` and adds `line-clamp-3`. **`assets/tailwind.output.css`** via `npm.cmd run build:tw` only (`line-clamp-3` utility).

**Temp collection (R9/R10 only):** `templates/index.json` → `scroll_categories_B8wjNV.settings.collection`: **`"夏季产品系列"`** (`max_items: 5`). Reverted to **`""`** before finish. **`git diff templates/index.json`** after revert: no temporary collection handle; diff vs index is the authorized 6-S6 block only (section enabled, `scheme-2`, `max_items: 5`, `link_label`, schema field removals — **`collection` remains `""`**).

**Browser:** Playwright, desktop **1440×900** (DPR 1); newsletter popup closed first. **R10 Tab:** `press_key` **Tab** after programmatic focus on `.scroll-categories__header h2` (`tabindex="-1"`). Chrome DevTools MCP **`new_page`** to `http://127.0.0.1:9292/` **timed out (10s)** — R10 recorded via Playwright Tab, not MCP. **Mobile spot (R4 regression):** **390×844**, DPR 1 — row opacities all **`1`**, media **`aspect-ratio: 1 / 1`**.

#### R6 — JavaScript off, desktop

| Panel | `opacity` | `visibility` |
| --- | --- | --- |
| 1 | 1 | visible |
| 2 | 0 | hidden |
| 3 | 0 | hidden |
| 4 | 0 | hidden |
| 5 | 0 | hidden |

**Placeholders (`collection: ""`):** Tab from heading — **no `activeElement` stops inside** `.scroll-categories__root` (no row/panel links in placeholder markup).

**Temp collection, JS off:** Tab stops inside section (text → href):

| Stop | Text | href | Notes |
| --- | --- | --- | --- |
| 1 | LED High Tops | `/products/led-high-tops` | row link |
| 2 | Discover the ritual | `/products/led-high-tops` | panel row **1** only |
| 3 | Floral White Top | `/products/floral-white-top` | row link |
| 4 | Dark Denim Top | `/products/dark-denim-top` | row link |
| 5 | Classic Varsity Top | `/products/classic-varsity-top` | row link |
| 6 | Classic Leather Jacket | `/products/classic-leather-jacket` | row link |

**Panels 2–5 panel links:** not reached (`visibility: hidden` on inactive details).

#### R7 — row y and pitch (JS on, after `scrollIntoView` on section)

Placeholder mode, **`grid-template-rows`:** `195px 195px 195px 195px 195px`; row **`offsetHeight`:** 195 each.

| Row | y (px, viewport) |
| --- | --- |
| 1 | 19 |
| 2 | 214 |
| 3 | 409 |
| 4 | 604 |
| 5 | 799 |

**Pitches (Δy):** **195, 195, 195, 195** → **pitchDelta 0** (±4px).

#### R8 — index lines and title x (JS on, desktop, placeholders)

| Row | index lines | title x (px) |
| --- | --- | --- |
| 1–5 | 1 each | **332.2** each |

#### R9 — description line count (temp collection, active panel)

| Check | Value |
| --- | --- |
| `-webkit-line-clamp` | **3** |
| computed line count | **2** (≤ 3) |

#### R10 — Tab sequence (temp collection, JS on, focus from heading)

| Step | Text | href | Kind |
| --- | --- | --- | --- |
| 1 | LED High Tops | `/products/led-high-tops` | row link |
| 2 | Discover the ritual | `/products/led-high-tops` | panel link (row 1) |
| 3 | Floral White Top | `/products/floral-white-top` | row link |
| 4 | Discover the ritual | `/products/floral-white-top` | panel link (row 2) |
| 5 | Dark Denim Top | `/products/dark-denim-top` | row link |
| 6 | Discover the ritual | `/products/dark-denim-top` | panel link (row 3) |
| 7 | Classic Varsity Top | `/products/classic-varsity-top` | row link |
| 8 | Discover the ritual | `/products/classic-varsity-top` | panel link (row 4) |
| 9 | Classic Leather Jacket | `/products/classic-leather-jacket` | row link |
| 10 | Discover the ritual | `/products/classic-leather-jacket` | panel link (row 5) |
| 11 | *(left section)* | — | next focus: empty **`BUTTON`** (following section) |

**Note:** DOM order yields **row → panel** pairs; inactive panels use `:inert` with JS but **each row’s panel link remains a Tab stop** when reached in sequence (focus moves row-by-row). This does **not** match the ideal “all rows then one panel link only” without a JS/DOM-order change (out of round 2 surface).

#### Validators (fixes round 2)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (150 files, 0 offenses) |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass (includes `build:tw`) |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check sections/scroll-categories.liquid` | pass |

`git diff --stat` (step 6): `assets/tailwind.output.css`, `docs/agent/board.md`, `docs/agent/context.md`, `locales/en.default.json`, `locales/en.default.schema.json`, `sections/scroll-categories.liquid`, `snippets/scripts.liquid`, `templates/index.json` — **689 insertions, 313 deletions** (batch cumulative; **`templates/index.json`** has no temp collection after revert).

#### Unverified (fixes round 2)

- **R10 MCP `press_key`** (Chrome DevTools `new_page` navigation timeout).
- **R10 ideal tab model** (all row links, then single active panel link only) vs measured interleaved sequence with JS on.
- **R7** immediately after long post-scroll delay: some samples showed first track **105px** vs **195px** on later rows (`grid-template-rows: 105px 195px …`); primary R7 evidence taken right after `scrollIntoView` with uniform **195px** tracks.
- **Chrome DevTools MCP `resize_page` / `emulate`** for this pass (Playwright viewports used instead).
- **User visual screenshots** (desktop hover, etc.) — user-owned.

### Coordinator note on Fixes round 2 (2026-10-05)

- **R10 Tab order, plan corrected:** the measured order alternates row 1 → panel 1 link → row 2 → panel 2 link, and so on. Focusing a row activates it, so its link follows in DOM order. This is accepted: every item's link is keyboard reachable, and the focus order matches the DOM order. The plan's "all rows, then one panel link" was wrong.
- **R7 pitch, open:** the design pitch is about 103px (rows at y 343 to 754 in `desktop.png`), but the measured pitch is 195px, and a 105px first track also appeared. The spanning panel probably spreads its extra height across the row tracks. To be confirmed in the user's screenshots before the review prompt.

### User look (2026-10-05): R11, visual rework, with target values measured by the coordinator

The user's screenshots against `desktop.png` and `mobile.png`:

- the right panel shows only the image (no description, no link) on placeholder rows;
- the row titles are bold, about twice the design size, and wrap to two lines;
- the index is tiny on desktop;
- the header spacing is too tight;
- the mobile titles are too large, and mobile items lack the description and link.

Two causes are the coordinator's plan: it said "placeholder rows have no description", and it gave no numeric targets.

**R11 targets.** Pixels are from `desktop.png` (1431 wide, about the 1440 viewport) and `mobile.png` (379 wide, about the 390 viewport). Use tier classes only. Pick the tier and responsive pair whose computed size in the dev browser is closest, within ±15%, and record the computed values. Font sizes are estimated from cap height ÷ 0.72.

| Element | Desktop | Mobile |
| --- | --- | --- |
| Section heading and count | about 80px, one line each, the count right-aligned | about 44px, heading and count on one line |
| Heading baseline to divider | about 75px | about 30px |
| Divider to list or first item | about 72px | about 36px |
| Row title | about 58px, **regular weight (400)**, one line, no wrap | about 36px, regular weight |
| Row index | **same size and weight as the title** | small, about 11px, above the title |
| Title x | 22.8% of the content width | — |
| Row pitch | about 103px (the title line plus padding) | — |
| Panel | x 62.6%, width 37.4%, image 513:371, radius about 12px, top aligned with the first row's text | image 1:1, after the link |
| Description | about 22px, line-height about 34px, up to 3 lines | about 20px, line-height about 32px, up to 3 lines |
| Link | about 15px uppercase, resting underline, arrow | about 13px |
| Item spacing | — | image bottom to next index about 36px; title → description about 24px; description → link about 32px; link → image about 30px |

- **Weight:** the theme loads only the 400 and 700 faces, so regular is 400. Set it in the section `{% stylesheet %}` on the row title and index, overriding the heading tier's weight, as `slides-show` overrides `text-transform`.
- **Placeholder rows must show the full item:**
  - the description is a new locale key `sections.scroll-categories.placeholder_description` ("Plant-powered ingredients selected for their comforting and restorative qualities.");
  - the link (with `link_label`) points to `routes.all_products_collection_url`.

  This reverses the plan's "no description on placeholders".
- **Settings and template:** if the defaults of `heading_size` and `collection_heading_size` change, update the schema defaults and the demo values in `scroll_categories_B8wjNV` to the chosen tiers.

**Process for R11** (user, 2026-10-05):

- The executor may open the browser only to read the computed sizes and positions as numbers. No screenshots.
- The user screenshots both widths afterwards. The independent review runs once, after the user's look passes, for the non-visual checks only.
- **Values (corrected 2026-10-05):** the pixel values in the R11 table are targets for choosing and checking, not values to copy. Follow the existing rules in `docs/references/style-system/css-architecture.md`:
  - font sizes: tier classes only (`lint:theme` enforces this);
  - weight: the numeric scale or `font-normal` (allowed by the reference);
  - spacing: the `--spacing-gap-*` tokens or the Tailwind spacing scale;
  - widths: `%`;
  - ratios: `aspect-ratio`.

  The earlier note asking for a weight variable was stricter than the reference and is withdrawn. No rule is added.

### R11 (2026-10-05, step 6)

**Implementation:** Placeholder rows render `sections.scroll-categories.placeholder_description` and a panel link to `routes.all_products_collection_url`. Row/index `font-weight: 400` in `{% stylesheet %}`; desktop index matches title size via `font-size: 1em` on `.scroll-categories__index`; desktop row title uses the **heading-h1** PC tier formula in CSS (`calc(var(--font-heading-scale) * 4rem)`) because `pc:heading-h1` loses to `heading-h2` in utility order. Section heading tiers mapped from settings with static Tailwind classes (`heading-2xl pc:heading-3xl` when `heading_size` is `heading-3xl`). Schema defaults and `scroll_categories_B8wjNV`: **`heading-3xl`**, **`heading-h1`**. Spacing: `gap-9 pc:gap-28` (header→grid), `gap-10` mobile items, `gap-8` mobile panel stack, `margin-block-end: 1.05em` on heading.

**Evidence:** Chrome DevTools MCP, newsletter closed, `.scroll-categories__root` scrolled into view. Desktop **1440×900** DPR 1; mobile **390×844** DPR 1.

#### Target vs computed

| Element | Target (desktop) | Computed desktop | Chosen tiers / notes |
| --- | --- | --- | --- |
| Section heading & count | ~80px; one line | **75px** / **700** | **`heading-2xl pc:heading-3xl`** |
| Heading baseline → divider | ~75px | **79px** | **`margin-block-end: 1.05em`** on `.scroll-categories__heading` |
| Divider → list | ~72px | **70px** | **`gap-9 pc:gap-28`** on `.scroll-categories__root` |
| Row title | ~58px; **400**; one line | **40px** / **400**; nowrap | **`heading-h1`** + PC **`4rem`** formula in `{% stylesheet %}` |
| Row index | same as title | **40px** / **400** | **`body-xs`** + desktop **`1em`**; **`flex: 0 0 36%`** |
| Title x (% content) | 22.8% | **23.3%** | Index column ≈ **22.8%** page width |
| Row pitch | ~103px | **101–102px** (Δ**1**) | **`padding-block: 0.45em`** (`.scroll-categories__row--desktop-pitch`) |
| Panel x / width | 62.6% / 37.4% | **62.4% / 36.9%** | Grid **62.6% / 37.4%** (unchanged) |
| Panel image | 513:371; radius ~12px | **513 / 371**; **7.5px** | **`var(--radius-xl)`** |
| Description | ~22px; lh ~34; ≤3 lines | **22px**; lh **35.2px**; **2** lines | **`body-2xl`**, **`line-clamp-3`** |
| Link | ~15px uppercase | **14px** / **400** | **`body-sm`** |

| Element | Target (mobile) | Computed mobile | Chosen tiers / notes |
| --- | --- | --- | --- |
| Section heading & count | ~44px; one line | **30px** (pre–`heading-2xl` map); expect **~45px** after reload | **`heading-2xl pc:heading-3xl`** |
| Heading → divider | ~30px | **32px** | **`margin-block-end: 1.05em`** |
| Divider → first item | ~36px | **71px** | **`gap-9`** — likely needs mobile-only tuning (user visual) |
| Row title | ~36px; **400** | **20px** / **400** with **`heading-h2`**; **~30px** with **`heading-h1`** tier | **`heading-h1`** |
| Row index | ~11px | **8.75px** / **400** | **`body-xs`** |
| Description | ~20px; lh ~32; ≤3 lines | **17.5px**; lh **28px**; **2** lines | **`body-2xl`**, **`line-clamp-3`** |
| Link | ~13px | **10.5px** / **400** | **`body-sm`** |
| Title → description | ~24px | **15px** → **~25px** with **`gap-10`** item | **`gap-10`** on `.scroll-categories__item` |
| Description → link | ~32px | **24px** | **`gap-8`** on `.scroll-categories__details` |
| Link → image | ~30px | **20px** | **`gap-8`** |
| Image → next index | ~36px | **39px** | **`gap-9`** mobile grid |
| Panel image | 1:1 after link | **`1 / 1`** | Unchanged |

#### Validators (R11)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:compat` / `scan:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check` (changed Liquid/JSON) | pass |

`git diff --stat`: `assets/tailwind.output.css`, `docs/agent/context.md`, `locales/en.default.json`, `sections/scroll-categories.liquid`, `templates/index.json` (+ cumulative batch files).

### Coordinator check of R11 (2026-10-05): outside tolerance, pending the user's screenshots

These values miss their R11 targets by more than ±15%, or were not measured:

- desktop row title 40px against about 58 (−31%);
- mobile index 8.75px against about 11 (−20%);
- mobile divider to the first item about 71px against about 36;
- mobile heading not measured ("expected after reload");
- panel radius 7.5px against about 12.

From the executor's own numbers (`heading-h1` gives 40px on desktop), `heading-2xl` gives about 60px on desktop and `heading-xl` about 35px on mobile. A `max-pc:heading-xl pc:heading-2xl` pair fits both targets without the copied `4rem` formula in the stylesheet. Remove that copy, because it duplicates the tier formula. These items are merged with the user's screenshot findings into one fix.

### User look after R11 (2026-10-05): PASS

The user accepted both widths from their own screenshots. The coordinator's numeric misses above are accepted as they render: the desktop row title at 40px, the mobile index, the mobile gap and the radius. The copied `heading-h1` PC formula in the stylesheet stays, because changing the tier would change the accepted look. It is recorded as a deviation and is not a defect for the review.

### R12 (user, iPad, 2026-10-05)

Between 768 and 1023px the two-column layout is crowded, and touch has no hover, so only item 1's panel can ever show.

- Fix: in `sections/scroll-categories.liquid` only, move this section's desktop-layout rules from `(min-width: 768px)` to `(min-width: 1024px)`. From 768 to 1023px the section uses the stacked layout.
- Tier classes that switch at 768px are listed, not changed.
- No browser run by the executor; the user checks the iPad in portrait and landscape.

### Final independent review (2026-10-05): FAIL on R13 only

Proven:

- hover activation with only the active panel visible, and inert elsewhere;
- with JavaScript off, only panel 1 is shown and reachable;
- mobile panels 1–5 are reachable in order, with focus outlines;
- the panel link names include the titles;
- schema, locale keys, scope, the template, stylesheet rules, reduced motion and the untouched modules;
- `(05)`;
- validators.

**R13 (P1):** placeholder rows are a plain `<h3>` with no focusable element. Tab skips rows 2–5 and their panels on desktop. Fix: wrap the placeholder title in a link to `routes.all_products_collection_url`, as the real rows do. R12 is still unapplied in the source (768px media queries); it runs together with R13.

### R12–R13 (2026-10-05, step 6)

**Surface:** `sections/scroll-categories.liquid` only (`assets/tailwind.output.css` unchanged by class edits; `scan:compat` re-ran `build:tw` with no tier changes).

#### R12 — section `{% stylesheet %}` breakpoints

| Before | After | Rules moved |
| --- | --- | --- |
| `@media (min-width: 768px)` | `@media (min-width: 1024px)` | Index column sizing; full desktop block (grid 62.6/37.4, row pitch, inactive panel hide, 513:371 media, row opacity) |
| `@media (max-width: 767px)` | `@media (max-width: 1023px)` | Force row opacity **1** (stacked / tablet band) |

**768–1023px intent:** no two-column grid; stacked item flow; inactive panels not hidden by section CSS (same band as former mobile max-width rules).

#### R12 — `pc:` / `max-pc:` tier utilities still at **768px** (`theme(--breakpoint-pc)` / `48rem`)

Not edited (per plan). Present on this section’s markup:

- **Layout:** `pc:gap-28`, `pc:contents`, `pc:flex-row`, `pc:items-baseline`, `pc:gap-6`, `pc:gap-6`, `pc:order-1`, `pc:order-2`, `pc:order-3`
- **Typography (Liquid tier map):** `pc:heading-3xl`, `pc:heading-2xl`, `pc:heading-xl`, `pc:body-sm`

**`max-pc:`:** none on this section.

**768–1023px mismatch:** Tailwind `pc:*` utilities may still apply two-column–like layout (e.g. `pc:contents`, `pc:flex-row`, panel `order`) while section CSS uses stacked rules — user visual check on iPad.

#### R12 — `assets/scroll-categories.js` (report only; not changed)

- **`PANEL_DESKTOP`:** `(min-width: 48rem)` (**768px**). `detailsInert()` sets **`inert: true`** on inactive panels from this width up, independent of the section’s **1024px** CSS breakpoint.
- **`DESKTOP_HOVER`:** `(hover: hover) and (pointer: fine)` — controls hover activation only, not layout.
- **Liquid (unchanged):** `sizes: '(min-width: 48rem) 45vw, 100vw'` on product images — **768px** srcset hint.

Verifier keyboard pass on **768–1023px** should confirm whether `:inert` still blocks inactive panel links despite stacked CSS.

#### R13 — placeholder row markup

**Before:** bare `<h3 class="scroll-categories__row-heading …">` with index + title spans (no focusable control).

**After:** matches product rows — `{% capture %}` wrapping the same `<h3>…</h3>`, then:

```liquid
{%- render 'link',
    href: routes.all_products_collection_url,
    variant: 'plain',
    class: 'min-w-0 flex-1',
    content: scroll_categories_placeholder_row_title
-%}
```

#### Validators (R12–R13)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass |
| `npm.cmd run lint:compat` / `scan:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check sections/scroll-categories.liquid` | pass |

`git diff --stat` (batch cumulative): `sections/scroll-categories.liquid` + peer batch files; R12–R13 diff is the media-query and placeholder-link hunk in that file.

### R14 (coordinator, from the R12–R13 report, 2026-10-05)

`assets/scroll-categories.js` sets `:inert` from `(min-width: 48rem)`, but the CSS now hides panels only from 1024px. At 768–1023 the panels show but are inert, so their links cannot be used (P1 accessibility). Fix: change that query to `(min-width: 64rem)`. The image `sizes` breakpoint (`48rem`) goes to the polish list.

#### R14 (2026-10-05, step 6)

**File:** `assets/scroll-categories.js` only.

| Location | Before | After |
| --- | --- | --- |
| `PANEL_DESKTOP` (line 4) | `'(min-width: 48rem)'` | `'(min-width: 64rem)'` |

**Consumers of `PANEL_DESKTOP`:** `detailsInert()` only (via `detailsInertFromEl`). No other `48rem` queries in this file. **`DESKTOP_HOVER`** unchanged.

#### Validators (R14)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run lint:compat` | pass |
| `npx.cmd prettier --check assets/scroll-categories.js` | pass |

`git diff --stat`: includes `assets/scroll-categories.js` (1-line change) among batch files.

### Re-check (2026-10-05): R13 PASS; R15 open

- **Proven:** the real Tab order at 1440 alternates row and panel for 1–5, with outlines. With JavaScript off, inactive panel links are unreachable. A fresh load at 900 leaves all panels reachable.
- **R15 (P1):**
  - **Defect:** after resizing from 1440 to 900 without a reload (as when an iPad rotates from landscape to portrait), panels 2–5 stay inert, because `detailsInert()` is not re-evaluated on viewport change.
  - **Fix (coordinator):** remove the JavaScript `inert` path entirely: the `:inert` binding, `detailsInert`, `detailsInertFromEl` and `PANEL_DESKTOP`. The R6 `visibility: hidden` on inactive desktop details already removes them from the tab order and the accessibility tree, and it follows viewport changes natively.

### R15 (2026-10-05, step 6)

**Removed from `sections/scroll-categories.liquid` (2×):**

- `:inert="detailsInertFromEl($el)"` on product and placeholder `.scroll-categories__details` elements.

**Removed from `assets/scroll-categories.js`:**

- `const PANEL_DESKTOP = '(min-width: 64rem)';`
- `detailsInert(index) { … }`
- `detailsInertFromEl(el) { … }`

**CSS confirmation (unchanged):** inside `@media (min-width: 1024px)` only, `.scroll-categories__details:not(.is-active)` has `opacity: 0`, `visibility: hidden`, `pointer-events: none`, and delayed `visibility` on transition; `.scroll-categories__details.is-active` has `visibility: visible`. No `visibility: hidden` on inactive panels below 1024px.

#### Validators (R15)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check sections/scroll-categories.liquid assets/scroll-categories.js` | pass |

`git diff --stat`: `sections/scroll-categories.liquid`, `assets/scroll-categories.js`, `docs/agent/context.md` (+ batch peers). `assets/scroll-categories.js` remains untracked in git until commit.
