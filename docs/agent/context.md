# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-06.

## Batch 6-S8: `routine-showcase` redesign as a step showcase

**Status:** authorized (2026-10-06); R1–R5 executed; R6 coordinator edits done; Ask review prompt delivered; **not** user-accepted; **not** committed.

### Design

`docs/design/home/routine-showcase/` holds `desktop.png` (about 1850 wide) and `mobile.png` (about 540 wide). Both are Git-ignored and local.

- **Desktop, left column, top:** a small uppercase eyebrow ("CEYLUNE"), a large two-line heading ("Serums & Treatments"), a one-line subtitle, and an uppercase CTA with a trailing arrow and a resting underline.
- **Desktop, left column, bottom:** the active step's product: an uppercase title, the price, a short divider, and a description excerpt.
- **Desktop, centre:** a tall arch, a rectangle with fully rounded top and bottom, holding a lifestyle scene. The active product's image overlaps the lower part of the arch and extends past its bottom edge.
- **Desktop, right column:**
  - top: a counter "01 / 03" with one short bar per step below it, the active bar dark;
  - middle: a vertical text label at the right edge;
  - bottom: a row of thumbnails, each with a caption below. The active thumbnail has a dark outline and the others are faded.
- **Background:** a soft full-bleed image (leaf shadows) behind everything.
- **Mobile:** a horizontal rail of white cards with the next card peeking at the right. Each card is one step and holds, in order:
  - the product image, with a soft glow;
  - the eyebrow and heading;
  - a step badge ("01 CLEANSE");
  - the product title, description and price;
  - the CTA.

### Decisions (user, 2026-10-06)

- **Rewrite `routine-showcase` in place**, with the new design as the source of truth. Settings and markup the design does not show are deleted.
- **One block = one step = one product.** The section steps through several products. It does not step through one product's images.
  - The arch scene image is per block, optional. When it is blank the arch shows the placeholder scene.
  - The background image is one per section and shared by all steps.
- **Autoplay:** yes, with merchant settings to turn it off and to set the interval.
- **No scroll-linked motion** in this section. No parallax and no GSAP.

### Outcome

**`sections/routine-showcase.liquid`, rewritten in place.** Keep the section type, name and preset name.

Section settings:

| Setting | Status |
| --- | --- |
| `color_scheme`, `bg_img`, `eyebrow`, `heading`, `heading_size`, `description` (the subtitle), `cta_text`, `cta_link`, `padding_top`, `padding_bottom` | kept, same IDs and types |
| `autoplay` | **new** checkbox, default on |
| `autoplay_speed` | **new** range, 3–10 seconds, step 1, default 5 |
| `collection`, `product_position`, `content_position`, `badge_position`, `rotate_badge_text`, `rotate_badge_percent` | **deleted** |

New block type `step`, with a maximum of 5 blocks:

| Setting | Type | Use |
| --- | --- | --- |
| `product` | product | title, price, description excerpt, image, link |
| `label` | text | step name, for example "Cleanse"; default through a locale key |
| `image` | image_picker | the arch scene, optional |

The preset holds 3 `step` blocks. Delete the locale keys that only the deleted settings and markup used.

Content rules:

- **Step number:** `01`, `02` … comes from the block order and is zero-padded.
- **Step text:**
  - the thumbnail caption and the mobile badge show the step label ("01 Cleanse" on the badge);
  - the vertical desktop text shows the active step's label.
- **Product links:** the product title and the product image link to the product. The CTA uses the section's `cta_text` and `cta_link`.
- **Product blank:** the step renders placeholder product content (placeholder image, a placeholder title from a locale key, no price) and stays focusable, following the 6-S6 placeholder rows.
- **Shopify attributes:** each step carries `block.shopify_attributes`.

**Layout:**

- **Breakpoint:** the three-column desktop layout starts at 1024px, matching 6-S6. Below 1024px the mobile card rail applies.
- **Rail:** a native horizontal scroll-snap list with the next card peeking. It needs no JavaScript and has no autoplay.
- **Heading:** exactly one real heading element per section. The eyebrow and heading copies inside the mobile cards are `aria-hidden="true"` and are not heading elements.
- **Background:** `bg_img` covers the whole section. When it is blank, there is no image layer and the scheme background shows.
- **Typography:** tier classes only (`heading-*`, `body-*`, `pc:` / `max-pc:` pairs), no literal font sizes; colours from scheme roles.

**Desktop interaction** (`assets/routine-showcase.js`, rewritten; Swiper is no longer used here):

- **Thumbnails:** they are tab buttons in a tablist (WAI-ARIA tabs pattern). Click or Enter/Space selects; Left/Right/Home/End move between tabs; only the active tab is in the Tab order (roving tabindex). Each tab has an accessible name that includes the step number and the product title.
- **Panels:** each step's panel holds its scene, product image and product info.
  - Inactive panels use `visibility: hidden` under the desktop media query, with no JavaScript `inert` (the 6-S6 pattern).
  - Step 1 is active in the server markup, so with JavaScript off desktop shows step 1 complete and usable.
- **Changing step:**
  - the scene image cross-fades;
  - the product image rises and fades in about 100ms after the scene;
  - the product info fades and moves up slightly;
  - the counter, the vertical label and the active bar update.
  - CSS transitions only. When `motion_enabled` is off or `prefers-reduced-motion: reduce` is set, the change is instant.
- **Autoplay** (desktop only, when `autoplay` is on and there are at least 2 steps):
  - the active bar fills over `autoplay_speed` seconds, then the next step activates and the last step wraps to the first;
  - the fill is a CSS animation whose duration comes from a `data-*` value, and its end advances the step;
  - autoplay pauses while the pointer is over the section, while focus is inside it, while the section is out of the viewport, and while the document is hidden;
  - a visible pause/play button sits next to the counter (WCAG 2.2.2), with locale-key labels and `aria-pressed` or a swapped label. After the user presses pause, autoplay stays paused until they press play;
  - reduced motion: no autoplay, and the button is hidden.
- **Cleanup:** `destroy()` removes every listener, observer and timer (Theme Editor section reload).

**`templates/index.json`:** only the `routine_showcase_m77bpB` entry changes.

- Remove its deleted settings.
- Add `autoplay` true and `autoplay_speed` 5.
- Add 3 `step` blocks with labels Cleanse, Treat, Protect and empty products (placeholders are accepted).
- Keep the section's position on the page.

### Implementation surface

- `sections/routine-showcase.liquid`
- `assets/routine-showcase.js`
- `locales/en.default.json` and `locales/en.default.schema.json` (routine keys only)
- `templates/index.json` (the `routine_showcase_m77bpB` entry only)

`snippets/scripts.liquid` keeps the `routine-showcase` import-map entry unchanged. Nothing else changes. Temporary files go to the system temp directory and are deleted before the report, not to the project root.

### Review tier

**Ask.** Liquid markup and schema change, settings are deleted, `assets/*.js` is rewritten, and the batch runs from an external execution prompt.

### Acceptance checks

**Gates:**

- `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:compat` and `npm.cmd run lint:liquid-syntax` all pass.
- `shopify theme dev` uploads with no rejected template.

**Static:**

- The schema matches the settings table, including the new `step` block with a maximum of 5.
- No deleted setting ID remains in Liquid, JS, locales or `templates/index.json`.
- `assets/routine-showcase.js` no longer imports `carousel-swiper`.

**Non-visual browser checks** at 1440 desktop and 390 mobile; the user takes the visual screenshots:

1. **Desktop Tab order:** the section CTA, then the active tab only, then the active panel's product link or links, then the pause button. Left/Right move tab focus and activate the step; `aria-selected` and the tabindex values update.
2. **Desktop panels:** inactive panels compute `visibility: hidden`, and their links are not reachable by Tab. The same holds with JavaScript off, where step 1 is the visible panel.
3. **Autoplay:** with a 3s test interval, the step advances on its own and wraps from the last step to the first. It does not advance while hovering, while focus is inside, or after pressing pause, and it resumes after pressing play. Measure by reading the active index over time.
4. **Autoplay off:** with `autoplay` off, the step does not advance in 15s.
5. **Mobile:** the rail scrolls horizontally with snap; every card's links are reachable by Tab; the page has no horizontal overflow (`document.documentElement.scrollWidth` equals the viewport width).
6. **Heading:** the section has exactly one heading element, and the mobile copies carry `aria-hidden="true"`.
7. **Console and cleanup:** no console errors on load or step change. A Theme Editor section reload, or calling `destroy()`, leaves no running timer.

Visual detail (sizes, spacing, colours, glow, the tablet range) is out of scope for review and goes to the Home polish pass.

### Execution status (implementer, 2026-10-06)

**Status:** implementation complete; **not** user-accepted; **not** committed. Review tier **Ask** still pending independent verifier.

**Delivered:**

- `sections/routine-showcase.liquid` — step showcase markup (mobile scroll-snap rail, desktop 1024px grid, WAI-ARIA tabs, CSS transitions, `{% stylesheet %}` motion/autoplay rules, schema with 10 settings + `step` blocks `max_blocks: 5`, preset 3 steps).
- `assets/routine-showcase.js` — Alpine `routineShowcase` (roving tabindex, autoplay via `routine-showcase-progress` + `animationend`, pause/hover/focus/viewport/hidden/user pause, `destroy()`).
- `locales/en.default.json` / `locales/en.default.schema.json` — routine keys only; removed `accessibility.routine_carousel` and other orphan keys.
- `templates/index.json` — `routine_showcase_m77bpB` only: deleted legacy settings, `autoplay` / `autoplay_speed`, three `step` blocks (Cleanse / Treat / Protect, empty products).

**Correction during execution:** progress bars and side labels lacked `data-item-index`, so `barClassFromEl` / `barFillClassFromEl` resolved index `-1` and broke bar states and autoplay. Added `data-item-index` on `.routine-showcase__bar` and `.routine-showcase__bar-fill` (and side labels).

**Validators (2026-10-06, after correction):**

| Command | Result |
| --- | --- |
| `npm.cmd run test:theme-check` | pass (150 files) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx prettier --check` (surface files) | pass |
| `npm.cmd run lint:theme` | **fail** — `snippets/scripts.liquid`: import map `"hover-card"` unused (former routine consumer removed; **out of batch surface**) |
| Shopify MCP `validate_theme` | pass — `sections/routine-showcase.liquid`, `templates/index.json` |

**`shopify theme dev` upload:** stale local dev process initially rejected `templates/index.json` (`step` block type) until dev was restarted; after restart, `GET /` 200. `shopify theme push --development` for section + index succeeded on theme `#156450390090`.

**Non-visual browser self-check** (`http://127.0.0.1:9292/`, Chrome DevTools MCP):

| # | Result | Notes |
| --- | --- | --- |
| 1 Tab order / keyboard | partial | Roving tabindex / `aria-selected` OK at 1440; synthetic `ArrowRight` on tablist inconclusive in MCP (handler expects target tab). Manual Tab pass recommended for verifier. |
| 2 Panels `visibility: hidden` | pass | Inactive panels `visibility: hidden` at 1440; step 0 visible. JS-off step 1 **not** re-tested in this session. |
| 3 Autoplay | partial | With default 5s speed, active tab index 0→1 after ~6.2s; user pause held index 1 for 6.5s. Hover/focus pause and play-resume **not** exercised. 3s interval / wrap **not** measured. |
| 4 Autoplay off 15s | **not run** | Requires `autoplay: false` in theme settings (no live setting toggle in MCP). |
| 5 Mobile | partial | 390×844: `scrollWidth === clientWidth === 390`; mobile rail present; desktop chrome hidden. Per-card Tab reachability **not** scripted. |
| 6 Heading | pass | One `h2` in section at 1440 and 390; mobile eyebrow/heading copies are `<p aria-hidden="true">`. |
| 7 Console / destroy | partial | No routine-specific console errors; platform noise (CSP shop.app, GraphQL 400, etc.) unchanged. `destroy()` via MCP could not resolve Alpine `$data` on section wrapper — **not verified**. |

**Risks / follow-ups:**

- **`lint:theme` hover-card orphan** — needs a follow-up batch (`snippets/scripts.liquid` and/or remove `hover-card` asset) or acceptance gate waiver.
- **Visual polish** — deferred to Home polish pass per plan.
- **Verifier** — run Ask-tier review in a separate session per `.agents/roles/verifier.md`.

### Round R2 execution (implementer, 2026-10-06)

**Status:** R2 complete; **not** user-accepted; **not** committed.

**Changes:**

- Removed `assets/hover-card.js` and the `hover-card` import-map entry in `snippets/scripts.liquid`.
- `routine-showcase`: desktop stage `min-height: 58vw`, 33% / 27% / 20% columns, tall pill arch with `arch-compose` product overlay (40%×72%, no frame), short fixed-width progress bars, 2:3 tab thumbs, typography tiers per R2; mobile white cards, radial glow, sage badge via `color-mix` scheme tokens.
- A11y: removed counter `aria-live`; product image links `tabindex="-1"` + `aria-hidden="true"` (title links only in tab order); pause uses fixed `accessibility.slideshow_pause` + `aria-pressed`; removed routine autoplay play/pause locale keys and JS `autoplayControlLabel`.
- `templates/index.json` — `routine_showcase_m77bpB` design copy; `heading_size`: `heading-h1` (~64px tier at 1440).

**Validators (2026-10-06):**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass (after body-tier fix for `<p>` and badge `color-mix`) |
| `npm.cmd run test:theme-check` | pass |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| Prettier (R2 surface files) | pass |
| `shopify theme dev` | restarted; `GET /` 200, sync OK |

**Browser self-check (127.0.0.1:9292):**

| Check | Result |
| --- | --- |
| Desktop proportions | grid height ≈ 0.57× viewport width; arch ~379×744px at 1440 (tall pill) |
| Image links out of tab order | pass (`tabindex="-1"`, `aria-hidden="true"`) |
| Pause control | fixed label “Pause slideshow”; `aria-pressed` present |
| Single heading | 1× `h2` |
| Mobile overflow | `scrollWidth` 390 at 390px viewport |

**Remaining vs design (honest gaps):**

- Exact arch centre at 57% of content and product 8% below arch lip are approximated with percentage positioning; merchant images/placeholders may read differently from PNG packshots.
- Mobile badge sage is scheme-mixed, not a literal design swatch; card `#fff` matches 6-S7 pattern (literal white in stylesheet).
- Vertical side label copy follows step block labels, not the design’s long “Serums & Treatments” string on every step.
- Tablet 768–1023px not tuned in R2.

**Risks:** Large `58vw` stage may feel tall on short laptop viewports; Ask-tier review still required for Liquid/schema/JS/import-map changes.

### Round R2 (coordinator and user, 2026-10-06)

**Surface widened** (user, 2026-10-06):

- delete `assets/hover-card.js`;
- delete the `hover-card` import-map entry in `snippets/scripts.liquid`.

The old `routine-showcase` was their only consumer. This was a planning gap.

**Coordinator static review:**

1. **Counter announcements.** `aria-live="polite"` on the counter announces every autoplay step. Remove it.
2. **Product image links.**
   - The placeholder image links have no accessible name.
   - The real image links duplicate the title links.
   - Fix: take every product image link out of the Tab order and the accessibility tree (`tabindex="-1"`, `aria-hidden="true"`). The title link is the one focus stop.
3. **Pause button.** It combines `aria-pressed` with a label that swaps between pause and play. Use a fixed label (the existing `accessibility.slideshow_pause`) with `aria-pressed`. Remove the then-unused routine play/pause keys.

**User look:** the desktop result does not resemble the design:

- the section is a short strip;
- the arch is a small circle;
- the product image is a small framed box;
- the heading is small and bold;
- the thumbnails are tiny squares;
- the bars span the column.

Structure and proportions are a defect of this batch, not polish. Targets are measured on `desktop.png` and scaled to a 1440 viewport.

**Desktop (≥1024px) targets:**

- **Section height:** the stage is about 0.58 × the viewport width (about 830px at 1440). The left and right columns use the full stage height: their top group sits at the top and their bottom group at the bottom.
- **Columns:** left about 33% of the content width; the arch column about 27%, its centre about 57% across the content; right about 20%, its content right-aligned to the content edge.
- **Arch:**
  - a tall pill: width about 27% of the content width, height about 0.9 × the stage height (aspect about 0.58 width/height), `border-radius: 9999px`, image `cover`;
  - the placeholder scene fills the pill.
- **Product image:**
  - centred on the arch;
  - about 40% of the arch width wide and about 72% of the arch height tall, `contain`;
  - no frame, border or background box, so a transparent packshot sits directly on the scene;
  - it starts at about 35% of the arch height and extends about 8% of the arch height below the arch's bottom edge;
  - the placeholder product also has no box.
- **Left top:**
  - the eyebrow is a muted uppercase body tier, about 24px at 1850;
  - the heading is about 80px at 1850 (about 64px at 1440), regular or medium weight (not bold), and wraps to 2 lines;
  - the subtitle is a body-lg tier;
  - the CTA is uppercase, about 24px at 1850, with a resting underline and an arrow.
- **Left bottom:**
  - the product title is uppercase, about 40px at 1850 (a heading-h4 range), tight leading;
  - the price is at the same size;
  - the divider is short, about 110px at 1850, not the column width;
  - the description is a body-lg tier, about 3 lines in a column about 550px wide at 1850.
- **Right top:**
  - the counter is about 26px at 1850 and right-aligned with letter spacing;
  - below it are bars sized for the count, each about 50 × 4px with gaps of about 10px, aligned under the counter;
  - the pause button stays small next to the counter.
- **Right middle:** a vertical label at the far right edge, vertically centred, reading top to bottom (`writing-mode: vertical-rl`), uppercase with letter spacing, body tier.
- **Right bottom:**
  - thumbnails about 100 × 150px at 1850 (portrait 2:3), gap about 15px, radius about 8px, image `contain` on a light surface;
  - the active one has a dark 1.5px outline and the inactive ones are at about 50% opacity;
  - each has a centred caption below, at a body-sm tier, up to 2 lines.

**Mobile (<1024px) targets:**

- **Cards:**
  - about 78% of the viewport wide;
  - background `#fff` (as the 6-S7 light cards), radius about 8px;
  - about 20px of padding.
- **Product image:** the area is about 1:1 with `contain`, and a soft radial glow is drawn behind the packshot.
- **Text:**
  - the heading copy is uppercase, about 48px at 540 wide (about 35px at 390);
  - the step badge has a filled sage background, light text and a radius of about 6px;
  - the product title is uppercase, at a heading-h5/h6 tier;
  - the description is body-sm and muted;
  - the price is followed by the CTA with a resting underline.

**Home content** (`routine_showcase_m77bpB` only, to compare against the design):

| Setting | Value |
| --- | --- |
| `eyebrow` | `Ceylune` |
| `heading` | `Serums & Treatments` |
| `description` | `<p>Targeted care for balanced, luminous skin.</p>` |
| `cta_text` | `Shop serums` |
| `heading_size` | the tier closest to about 64px at 1440 |

### Round R3 (user and coordinator, 2026-10-06)

**User look on R2** (viewport about 2000 wide): still far from the design.

**Coordinator cause analysis:**

- **Plan error, mine.** R2 tied the stage height to the viewport width (`58vw`) while the content sits inside the capped `container-page` width. On a wide screen the arch grows taller than the screen and the columns drift apart. The design is full-bleed with a small page gutter, and the stage is bounded by the screen height.
- **Execution defects:**
  - the placeholders do not fill their boxes: the scene is a small illustration inside the arch, and the product is a tiny icon;
  - the thumbnail captions break inside a word ("Cleans/e");
  - the progress bars are wrong (below).
- **Pause button (user):** the design has none. Remove it.

**R3 targets:**

1. **Width:** the section content spans the full width minus the page margin (`--page-margin`). It does not use the `--page-width` cap.
2. **Stage height:**
   - `clamp(40rem, 58vw, calc(100svh - 4rem))`, so it never exceeds the screen;
   - the left and right columns fill this height: their top group at the top, their bottom group at the bottom.
3. **Arch size:**
   - height about 90% of the stage;
   - width derived from the height with `aspect-ratio: 0.58`, never from the column width;
   - the centre column is as wide as the arch.
4. **Placeholders:** the scene placeholder covers the whole arch. The product placeholder fills the product box (about 40% of the arch width × 72% of its height, `contain`), like a real packshot.
5. **Captions:**
   - the thumbnails are at least about 80px wide at 1440;
   - captions never break inside a word (`overflow-wrap: normal`, `word-break: normal`) and clamp to 2 lines.
6. **Progress bars:**
   - the active bar always reads as active. With autoplay off or reduced motion it shows full and dark; inactive bars are light; there is no "complete" state.
   - with autoplay running, the active bar fills from 0 to full over `autoplay_speed`, and its end advances the step;
   - a step change, by autoplay or by the user, restarts the fill on the new active bar;
   - a hover or focus pause freezes the fill where it is (`animation-play-state: paused`) and resumes from there. Today the fill is removed and later restarted from 0.
7. **Pause control:** remove the pause button with its markup, CSS and JS.
   - Autoplay still pauses on hover, focus inside, out of the viewport, and document hidden.
   - Any user selection of a step (click or keyboard) stops autoplay for the rest of the page view.
   - Remove `userPaused` and `toggleAutoplay`. `accessibility.slideshow_pause` stays: other sections use it.

The vertical label stays the active step's label. The heading face (the design shows a serif in one export) belongs to the polish pass.

### Round R3 execution (implementer, 2026-10-06)

**Status:** R3 complete; **not** user-accepted; **not** committed.

**Changes:**

- `sections/routine-showcase.liquid` — full-bleed inner (`padding-inline: var(--page-margin)` only, no `container-page`); stage `clamp(40rem, 58vw, calc(100svh - 4rem))`; arch `height: 90%` + `aspect-ratio: 0.58` (center column shrink-wraps arch); placeholder SVG fill classes; progress bar CSS (`is-static-full`, `is-animating`, `is-autoplay-paused` + `animation-play-state`); removed pause button markup/CSS; tab thumb `8rem` min width; caption `overflow-wrap`/`word-break` normal.
- `assets/routine-showcase.js` — removed pause UI API; `_autoplayStoppedByUser` on tab click/keyboard; `_applyBarStates` / `_updateAutoplayPauseClass` (hover/focus/viewport/hidden freeze without animation restart); removed `is-complete`.

**Validators:** `lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat`, `lint:liquid-syntax`, Prettier — all pass (2026-10-06).

**Numeric / behaviour checks (127.0.0.1:9292):**

| Check | 1440×900 | 2000×1000 |
| --- | --- | --- |
| Stage height ≤ viewport | 827 ≤ 900 | 960 ≤ 1000 |
| Arch width/height ratio | 0.58 | 0.58 |
| Tab thumb width | 80px (after `8rem` fix) | 80px |
| Pause button absent | yes | yes |
| Click tab index 2, 15s | index stays `2` | (same session) |
| Hover freeze | `animation-play-state` → `paused`; transform drift ≈0 over 2s when `_hoverPaused` set via Alpine API | same |

**Remaining vs design:** serif heading, exact gutter rhythm at ultra-wide, real product/scene assets vs placeholders, tablet range — polish pass.

**Risks:** `58vw` middle term still influences stage height on mid-width viewports but capped by `100svh - 4rem`; Ask-tier review still pending.

### Round R4 (user and coordinator, 2026-10-06)

**User look on R3:**

1. **Autoplay.** A user selection must not stop autoplay. It restarts the progress fill on the new step, and autoplay continues. (User decision: no pause button. Hover and focus pause stay, and are the only user mechanism to stop the motion.)
2. **Width.** The content must keep the `page-width` container with its margins. R3 target 1 was wrong (coordinator error); revert to `container-page`.
3. **Left bottom.** The price and the description are missing: placeholder steps render neither.
4. **Centre.** There is no real scene image, and no product image floating over the bottom of the arch. The line-art placeholders do not read as the design.

**R4 targets:**

1. **Autoplay.**
   - Remove `_autoplayStoppedByUser`. A click or key selection activates the step and restarts the fill from 0.
   - Autoplay continues after a selection. The existing hover and focus pauses still apply, so a click with the pointer over the section stays paused until the pointer leaves.
2. **Container.**
   - Back inside `container-page`.
   - The stage height comes from the **content width**, not the viewport: about 0.58 × the content width, capped at `calc(100svh - 4rem)`, minimum 40rem. Use a container query unit (`cqi` on an `inline-size` container) or an equivalent calc on `--page-width` and `--page-margin`, whichever `lint:compat` accepts.
   - The right column's thumbnails fit inside the column: no clipping at the right edge.
3. **Placeholder content.** A placeholder step also renders:
   - a placeholder description from a locale key, about 25 words;
   - a sample price (`1999 | money`).
   This way the left-bottom block always has the design's full structure.
4. **Scene fallback.** When a step's `image` is blank and the product has a second image, the arch uses that image. Only when neither exists does it fall back to the placeholder scene.
5. **Product image.**
   - The floating product image sits low on the arch. Its box runs from about 35% of the arch height to about 8% below the arch's bottom edge, so it visibly overlaps that edge.
   - `contain`, aligned to the bottom of its box, with no frame.
6. **Home content.** Set the 3 step blocks' `product` to 3 real products from the dev store that have at least 2 images (for example from `/products.json` on the dev server), so the section shows real titles, prices, descriptions, scenes and packshots. The labels stay Cleanse, Treat and Protect.

**Surface:** unchanged from R2. Locales gain the 2 placeholder keys; `templates/index.json` changes in the `routine_showcase_m77bpB` entry only.

### Round R4 execution (implementer, 2026-10-06)

**Status:** R4 complete; **not** user-accepted; **not** committed.

**Changes:**

- `assets/routine-showcase.js` — removed `_autoplayStoppedByUser` and `userInitiated` stop; tab click/keyboard restarts progress fill and autoplay continues (hover/focus pause unchanged).
- `sections/routine-showcase.liquid` — `container-page` on inner; stage `clamp(40rem, 58cqi, calc(100svh - 4rem))` via `container-type: inline-size`; placeholder steps show `placeholder_description` + `1999 | money`; scene fallback block image → `product.images[1]` / `media[1].preview_image` → placeholder; product float `top 35%` / `height 73%`, bottom-aligned `contain`; right tabs flex to fit column (`max-width: 5rem` per thumb).
- `locales/en.default.json` — `placeholder_description`, `placeholder_scene_alt` (storefront only; schema file unchanged — unused schema keys fail `lint:i18n`).
- `templates/index.json` — `routine_showcase_m77bpB` steps: products `casual-knitted-shirt3`, `casual-knitted-shirt2`, `casual-knitted-shirt4`.

**Validators (2026-10-06):**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (150 files) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:compat` | pass (`58cqi` / container queries in section stylesheet) |
| `npm.cmd run lint:liquid-syntax` | pass |
| Prettier (R4 surface files) | pass |

**Numeric / behaviour checks (`http://127.0.0.1:9292/`, Chrome DevTools):**

| Check | 1440×900 | 2000×1000 |
| --- | --- | --- |
| `container-page` on inner | yes | yes |
| Content edge Δ vs other `.container-page` | Δleft 0, Δright 0 | Δleft 0, Δright 0 |
| Stage height ≤ viewport | 826.5 ≤ 900 | 960 ≤ 1000 |
| Last tab thumb right ≤ inner right | 1415 ≤ 1425 | (not re-measured; layout same rules) |
| Product float bottom − arch bottom | +59.5px (> 0) | — |
| Active step scene real image (step 1, shirt3) | yes (`images[1]` fallback) | — |
| Left-bottom price + description (real product) | $69.00, desc len 212 | — |
| Click tab 2 → fill ≈ 0; after ~5.2s → step 3 | scale ≈ 0.03 at 150ms; active index 2 after wait | same session |

**Dev store products:** only `casual-knitted-shirt3` has ≥2 images in `/products.json` (8 images). Steps 2–3 use single-image products so arch scene falls back to placeholder until block `image` or a second product image exists.

**Remaining vs design:**

- Arch compose measured ratio ≈ 0.67 width/height at runtime (not 0.58) — investigate flex sizing on center column in polish pass.
- Treat/Protect steps lack second-image scene on this dev catalog.
- Serif heading, exact thumb pixel sizes, tablet range — polish pass.
- Ask-tier independent review still pending for Liquid/JS/index changes.

### Round R5 (user, 2026-10-06)

**User look on R4:** the structure is accepted, apart from two items.

1. **Arch boundary.**
   - **Problem:** the pill shape shows only when the scene image is opaque and differs from the page background. With the dev store's cut-out model image, the arch has no visible edge.
   - **Fix:**
     - the arch clips its content (`overflow: hidden`, full radius);
     - it draws its own boundary that does not depend on the image or a background colour: a 1px border in the scheme foreground at low opacity, for example `rgba(var(--color-foreground), 0.15)`;
     - the scene image covers the pill.
2. **Floating product image.**
   - **Problem:** it renders as a small square (the contain box centres a square image) in the lower middle of the arch.
   - **Fix:** match the design crop (`desktop.png`, centre).
     - The box is about 40% of the arch width wide.
     - Its top sits at about 38% of the arch height and its bottom at about 8% below the arch's bottom edge.
     - The image uses `object-fit: contain` with `object-position: bottom center`, so the visible image is anchored to the box bottom and overlaps the arch edge.
     - There is no frame or background.
3. **Autoplay** (user decision; supersedes the R3 and R4 pause rules).
   - Autoplay always runs. Hovering and focus inside the section do not pause it.
   - A user selection jumps to that step and restarts its fill from 0, and autoplay continues from there.
   - The only remaining pauses are the ones the user cannot see: the section is out of the viewport, or the document is hidden.
   - `prefers-reduced-motion: reduce` keeps autoplay off.
   - **Accessibility note:** with no hover, focus or button pause, WCAG 2.2.2 (Pause, Stop, Hide) has no user mechanism; only the merchant's `autoplay` setting can turn it off. The user accepts this. Record it in the polish list for a final decision before any Theme Store submission.

**R5 item 3, amended** (user, 2026-10-06; replaces the accessibility note above):

- **Hover pause.** Hovering the **active** step's thumbnail pauses the active bar's fill in place (`animation-play-state: paused`). Leaving it resumes from there.
  - Hovering an inactive thumbnail or anywhere else in the section does not pause.
  - The pause starts only on `pointerenter`, so a click that makes the hovered thumbnail active restarts its fill from 0 and keeps it running until the pointer leaves and re-enters.
- **Keyboard pause.** Keyboard focus (`:focus-visible`) on the active tab pauses the same way, and moving focus out resumes. A mouse click that leaves focus on the tab does not pause.
- **Other pauses:** out of the viewport and document hidden still pause. Reduced motion keeps autoplay off.
- **WCAG 2.2.2:** the hover and keyboard pauses give mouse and keyboard users a mechanism. Touch devices at or above 1024px have no hover; record this as a polish item.

### Round R5 execution (implementer, 2026-10-06)

**Status:** R5 complete; **not** user-accepted; **not** committed.

**Changes:**

- `sections/routine-showcase.liquid` — `.routine-showcase__arch`: `overflow: hidden`, `border-radius: 9999px`, `border: 1px solid rgba(var(--color-foreground), 0.15)`, scene still `object-cover`; product float `top: 38%`, `height: 70%` (≈8% past arch bottom), `width: 40%`; product/placeholder `object-fit: contain` + `object-position: bottom center` on img/SVG.
- `assets/routine-showcase.js` — removed root `mouseenter`/`mouseleave`/`focusin`/`focusout`; active-thumb `pointerenter`/`pointerleave` pause with `_thumbSuppressPauseUntilLeave` on click; `:focus-visible` on active tab pauses via `_syncFocusVisiblePause`; viewport + `document.hidden` unchanged.

**Validators (2026-10-06):**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (150 files) |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| Prettier (`sections/routine-showcase.liquid`, `assets/routine-showcase.js`) | pass |

**Numeric / behaviour checks (`http://127.0.0.1:9292/`, 1440×900, Chrome DevTools):**

| Check | Result |
| --- | --- |
| Arch `overflow` | `hidden` |
| Arch `border-top-width` | `1px` |
| Product box width ÷ arch width | **0.4** |
| (box top − arch top) ÷ arch height | **0.38** |
| (box bottom − arch bottom) ÷ arch height | **0.08** (+59.5px) |
| Pointer on section intro (not thumb), ~5.5s | active index advanced (2→0 wrap); not `is-autoplay-paused` |
| Inactive thumb `pointerenter` 2s | `is-autoplay-paused` false; scale Δ ≈ **0.401** |
| Active thumb `pointerenter` 2s (after click suppress cleared) | `is-autoplay-paused` true; `animation-play-state: paused`; scale Δ **0**; after `pointerleave`, scale resumes (Δ ≈ 0.11 in 0.5s) |
| Click tab 3, pointer stays | scale ≈ **0.039** at 200ms; `running`; after ~5.2s active **0** (wrap) |
| `focus()` on active tab with `:focus-visible` | `is-autoplay-paused` **true** |

**Remaining vs design / polish:**

- Arch compose runtime aspect still ≈0.67 (R4 note); pill border now visible regardless of scene asset.
- Touch desktop (≥1024px): no thumb-hover pause — per R5 item 3 amended polish note.
- Dev catalog: Treat/Protect still single-image scenes.

### Round R6 (coordinator direct edit, user request, 2026-10-06)

The user accepted R5, apart from two items, and asked the coordinator to fix them directly.

- **Arch width.** The arch read too wide. The centre column width is now explicit: `stage height × 0.9 × --routine-arch-ratio`, with `--routine-arch-ratio: 0.5`, taken from the user's marked box. The stage height lives in the `--routine-stage-height` custom property on the grid. The arch fills the column at 90% of the stage height. The earlier `aspect-ratio: 0.58` with `width: auto` measured 0.67.
- **Product box.** The box is now `top: 34%`, `height: 74%` (bottom about 8% below the arch) and `width: 46%`.
- **Limit:** the dev store's packshots are square images with a background, so `contain` shows them as a square at the box bottom. Only a tall transparent cut-out fills the box as in the design.
- **Validators:** Prettier check, `lint:theme` and `lint:compat` pass.
- **Follow-up (user look on R6).** The product image sat centred in its box. The `image` snippet keeps Shopify's focal-point inline `object-position` unless `position` is passed, which overrode `object-bottom`. The fix passes `position: 'bottom'` (`image-display-contract.md`). Prettier and `lint:theme` pass.
- **Floating product image** (user, option B, 2026-10-06): new optional `step` setting `product_image` (`image_picker`), with label and info locale keys. The float on desktop and the mobile card image both use it; when it is blank they fall back to the product's featured image, then to the placeholder. A merchant uploads a tall transparent PNG to get the design's packshot. Validators pass: Prettier, `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `test:theme-check`.

### Review R1 (verifier, 2026-10-06): FAIL, 1 finding

- **P2, `sections/routine-showcase.liquid`:** the scene fallback had an extra `product.media[1].preview_image` branch beyond the plan's chain (block image → the product's second image → placeholder). The coordinator removed it. Prettier, `lint:theme`, `lint:liquid-syntax` and `test:theme-check` pass.
- **Everything else proven by the verifier:** tabs and keys, visibility with JavaScript on and off, ARIA, autoplay pause rules with numbers, autoplay off, viewport pause, `destroy()` (14 → 0 listeners), mobile Tab reach and overflow, schema, deletions, locales, scope.
- **Unproven:** native reduced motion (skipped); a native background-tab pause (source reviewed only).
