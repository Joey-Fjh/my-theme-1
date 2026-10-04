# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-05.

## Batch 6-S3: home "Shop by category" as a new `collection-list` section

**Status:** executed; independent review round 2 PASS on code (V1–V3, formatting); V4 evidence retaken and checked by the coordinator 2026-10-05. Not proven (MCP limits): genuine touch tap, forced `:hover`. Awaiting commit.

**Design:** `docs/design/home/category-grid/` contains:

- `desktop.png` and `mobile.png`;
- `reference-hover-partakefoods.png`, the hover reference only, from https://partakefoods.com/ (home product cards);
- `notes.md`.

The design shows:

- a centred uppercase heading;
- a horizontal carousel of white rounded cards: a packshot image on top, the centred collection title below;
- the next card peeking at the right edge;
- previous and next arrows at the bottom right;
- no pagination, subheading or "view all" link.

On hover a card:

- tilts a few degrees and lifts;
- gains an offset shadow;
- swaps to a full-bleed lifestyle image with white title text.

**Decisions (user, 2026-10-05):**

- **A new section, carousel only.** No grid layout and no column settings. `category-grid` stays unchanged; on the home page it is replaced by the new section, in the same position.
- **Data source:** a section-level `collection_list` setting, with no blocks.
- **Card images:**
  - **Rest:** the first product's first media image.
  - **Hover:** the same product's second media image.
  - **No second image:** the collection's featured image.
  - **No image to swap to:** no swap; tilt, lift and shadow only.
  - **Empty collection:** the collection image, with no swap.
- **Hover motion** is a CSS-only micro-interaction:
  - it follows only `prefers-reduced-motion` (no tilt or lift, instant swap), not `motion_enabled`;
  - it applies under `(hover: hover) and (pointer: fine)` and on the card link's `:focus-visible`;
  - touch shows the rest state only.

**Outcome:**

- **`sections/collection-list.liquid`:** a new section built on `section-frame`, `disabled_on` header, footer and overlay groups, with preset "Collection list".
  - **Settings:**
    - `color_scheme`;
    - `heading` (text) and `heading_size` (tier select, desktop plus mobile pair with literal `pc:` / `max-pc:` classes as in `slides-show`);
    - `heading_alignment` (left / center);
    - `collection_list` (limit 12);
    - `card_title_size` (tier pair);
    - `show_arrows` (checkbox);
    - `padding_top` and `padding_bottom`.
  - Add other settings only when the design needs them, and record why.
- **Card snippet:** `snippets/collection-card.liquid`, or a name that does not clash with existing snippets (check first). It is a single `<a>` card (accessible name = collection title).
  - It renders the rest image and an optional hover image through `snippets/image.liquid`. Lazy loading applies, and the hover image is never in the first viewport's LCP path.
  - The title sits over a bottom gradient when hovered.
  - Images are decorative (`alt=""`) because the link text names the card.
- **Carousel:** Swiper through the `carousel-swiper` adapter, following the `featured-products` module pattern (load on demand, `destroySwiper` on unmount).
  - About 4.4 cards visible at 1440 and about 2.3 at 390, read from the design; no loop.
  - Prev and next buttons are real `<button>` elements with locale-key labels, at least 24×24, and disabled at the ends.
  - **Without JS:** the track is a native horizontal scroll (`overflow-x: auto`, scroll-snap) with every card visible and reachable. The arrows are hidden until the module mounts.
  - The tilt must not be clipped by the Swiper container (give it vertical padding or an overflow allowance) and must not shift layout.
- **Hover values:** measure them on the reference site with Chrome DevTools MCP: tilt angle, lift distance, shadow, transition duration and easing, and whether the image swap cross-fades. Record the values. Adapt them to the design (the design's shadow is a soft green-tinted shadow, not a hard offset; follow the design where the two differ).
- **New JS module** `assets/collection-list.js`, with an import-map entry. It holds no hover logic.
- **Locales:**
  - schema labels in `locales/en.default.schema.json`;
  - `accessibility.*` labels: reuse the existing `previous_slide` / `next_slide` / `carousel` keys where they fit;
  - a carousel region label, either a new key or an existing one.
- **Demo content** in `templates/index.json`:
  - replace `category_grid_LU4hyd` with a `collection-list` entry at the same position in `order`; the `category-grid` entry is removed from the home page;
  - heading "Shop by category", centred, a tier pair matching the design (about 48px at 1440, about 24px at 390);
  - five collections from the dev store: find them with the storefront or the Admin. Pick ones with products that have at least two images where possible, and record which. If none fit, use what exists and record the gap;
  - `scheme-2`.

**Implementation surface:**

- `sections/collection-list.liquid` (new)
- the new card snippet
- `assets/collection-list.js` (new) and its import-map entry in `snippets/scripts.liquid`
- `locales/en.default.json` and `locales/en.default.schema.json`
- `templates/index.json`: this entry and the removal of the `category_grid_LU4hyd` entry only
- `assets/tailwind.output.css`, generated by `npm.cmd run build:tw`
- record files and `docs/design/home/category-grid/dev-*.png`

Out of scope:

- `category-grid` code;
- `featured-products`;
- the shared carousel controls component;
- colour scheme values. The design background is a light sage while `scheme-2` is `#f1f1f1`; this is a known gap and is recorded only.

**Review tier:** Ask.

**Rules for the executor:** never rename, alias or restructure code to get past a lint rule, and never change runtime behaviour to satisfy a test tool. If either blocks you, stop and report.

**Acceptance checks:**

1. **Static:**
   - `git diff --stat` and the untracked files stay inside the surface. In `templates/index.json`, only this section's entry and its place in `order` change.
   - The schema has `collection_list` and no `blocks`. Every label is a locale key.
   - The module has no `window` / `document` listener.
2. **Validators:** all pass:
   - `npm.cmd run lint:theme`
   - `npm.cmd run test:theme-check`
   - `npm.cmd run lint:i18n`
   - `npm.cmd run lint:compat`
   - `npm.cmd run scan:compat`
   - `npm.cmd run lint:liquid-syntax`
3. **Browser,** home page at 1440×900 and 390×844, with measured values (1rem = 10px):
   - **Layout:**
     - the section sits directly under the marquee;
     - heading font size, transform (uppercase) and alignment;
     - card count matches the collections;
     - visible cards about 4.4 / 2.3, with the next card peeking;
     - card radius, background and title size;
     - arrow positions at the bottom right.
   - **Images:**
     - each card's rest and hover `src` follow the image rules; report the rule used per card;
     - the hover image loads lazily and does not affect LCP;
     - no layout shift on hover (the card's `getBoundingClientRect` box without transform is unchanged).
   - **Hover (1440):** force the hover state, or use the MCP hover tool on the card link:
     - computed `transform` (rotation and translate) and `box-shadow`;
     - the hover image is visible, with opacity 1;
     - title colour is white with contrast of at least 4.5:1 against the gradient area;
     - the transition duration matches the recorded values;
     - the tilted card is not clipped (compare its bounding box with the container).
   - **Focus:** Tab to a card. `:focus-visible` shows a visible focus ring and the same raised state.
   - **Arrows:**
     - next and previous move by the configured step;
     - they are disabled at the ends, with `aria-disabled` or `disabled`;
     - both are at least 24×24.
   - **No JS** (disable JavaScript): every card is reachable by horizontal scroll, the arrows are hidden, and there is no blank area.
   - **Reduced motion:** check statically (no transform or transition under `prefers-reduced-motion: reduce`).
   - **Section reload:** use the Theme Editor or `replaceRegion`; Swiper is destroyed and re-created with no duplicate instance.
   - **Console:** no new console errors.
   - Dev screenshots `dev-desktop.png` and `dev-mobile.png` have different md5 hashes. Add a hover-state screenshot `dev-desktop-hover.png`.

**Progress:**

**Partake reference (Chrome DevTools MCP, `.animate--hover-rotation` on partakefoods.com):**

| Property | Reference |
| --- | --- |
| Transform | `translateY(-8px) rotate(3deg)` |
| Box shadow | `6px 6px 0` (hard offset, product foreground colour) |
| Transition | `transform`, `box-shadow`, `opacity` — **0.2s** `cubic-bezier(0.4, 0, 0.2, 1)` |
| Image swap | Dual `img`: on hover first `opacity: 0`, second `opacity: 1` with `transition: transform var(--duration-long) ease` |

**Adapted (Ceylune design — soft green shadow, CCW tilt):**

| Property | Value |
| --- | --- |
| Transform | `translateY(-6px) rotate(-2deg)` |
| Box shadow | `0 16px 32px rgba(38, 61, 41, 0.18)` |
| Transition | surface `transform` / `box-shadow` **0.2s** `cubic-bezier(0.4, 0, 0.2, 1)`; images **0.3s** `ease` opacity swap |
| Reduced motion | no transform/transition; instant opacity swap only |

**Demo collections** (`templates/index.json` → `collection_list_6S3`, five handles):

| Handle | Title | First product | Images on first product | Expected card image rule |
| --- | --- | --- | --- | --- |
| `66666666666` | 66666666666 | Casual Knitted Shirt3 | 8 | `second_product_media` |
| `夏季产品系列` | 夏季产品系列 | LED High Tops | 1 | `collection_featured_fallback` (collection has featured image) |
| `女士衣服` | 女士衣服 | Casual Knitted Shirt - White | 1 | `collection_featured_fallback` |
| `睡衣` | 睡衣 | Casual Knitted Shirt - White | 1 | `collection_featured_fallback` |
| `77777777777777` | 77777777777777 | Casual Knitted Shirt4 | 1 | `tilt_only_no_second_media` if no collection image; else `collection_featured_fallback` |

**Gap:** only one dev collection’s first product has 2+ images (`66666666666`); others use collection featured image for hover where available.

**Validators (all pass):** `lint:theme`, `test:theme-check` (148 files), `lint:i18n`, `lint:compat`, `scan:compat`, `lint:liquid-syntax`. `rg addEventListener assets/collection-list.js` → empty.

**Static:** schema has `collection_list`, no `blocks`; import map `collection-list`; `git status` surface-only (plus pre-existing `docs/agent/board.md` touch).

**S1–S5 fix (2026-10-05):** hover image + gradient in `.collection-card__hover-layer` (`inset: 0`); section `overflow-x: clip` + `@supports not (overflow: clip)` → `hidden`; 5 placeholder cards when `collection_list` empty (`sections.collection-list.placeholder_card_title`); neutral black scrim `rgba(0,0,0,0.58)` + shadow `rgba(var(--color-foreground), 0.18)`; removed `will-change` and Swiper `observer` / `observeParents`. Card `bg-white` remains a design gap.

**Validators (post S1–S5):** all six pass.

**Browser §3 (focus-visible; MCP cannot rely on `:hover` — used `focus({ focusVisible: true })` on card link, same CSS rules):**

| Check | 1440×900 | 390×844 |
| --- | --- | --- |
| `scrollWidth === clientWidth` (S2) | **true** (1425) | **true** (390) |
| Gap below marquee | **0px** (desktop; marquee selector N/A in script) | — |
| Heading size / uppercase | **45px** / **uppercase** | **20px** / **uppercase** |
| Card count | **5** | **5** |
| Visible slides ≈ | **4.58** (target ~4.4) | **2.44** (target ~2.3) |
| Card title size | **15px** | **16px** |
| Card radius / bg | **16px** / **white** | same |
| Nav buttons | **24×24**, bottom-right row | same |
| S1 hover layer = surface rect | **match** (±0px) | — |
| Focus raised state | transform `translateY(-6px) rotate(-2deg)`, shadow `0 16px 32px rgba(38,61,41,0.18)`, hover layer opacity **1**, title **white** | — |
| S4 contrast (white on scrim solid equiv. `rgb(107,107,107)`) | **5.33:1** | — |
| Tilt not clipped vertically (S2) | **true** (with outer padding) | — |
| Hover image `loading` | **lazy** | — |
| First card rule | `second_product_media` | — |

**S3 (temp blank `collection_list`, reverted 2026-10-05):** **5** cards, all `placeholder` rule, title **Collection title**, **5** placeholder SVGs, carousel present.

**Screenshots:** `docs/design/home/category-grid/dev-desktop.png`, `dev-mobile.png`, `dev-desktop-hover.png` (focus-visible state).

**Deviations recorded:** `scheme-2` vs design sage; card `bg-white` vs design surface token (S4 note); shadow computes to `rgb(38, 61, 41)` under `scheme-2` foreground.

### Coordinator static review (2026-10-05): **remediated** — S1–S5 fixed; browser §3 completed 2026-10-05 after user unlocked storefront password.

### Coordinator static re-review (2026-10-05): **D1–D3 remediated**; S1–S5 unchanged.

**D1:** `.collection-card__surface` `aspect-ratio: 3 / 5`; rest media `contain` + padding; hover layer full-bleed `cover`. **D2:** default tiers `heading-h2` (desktop) / `body-xl` (mobile); schema adds `heading-h2` / `heading-h3` desktop options; demo `index.json` updated. **D3:** `rotate(2deg)`. **Stray:** deleted `test-results/.last-run.json`.

**Validators (post D1–D3):** `lint:theme`, `lint:i18n`, `scan:compat`, `lint:liquid-syntax` pass.

**Browser (focus-visible for raised state; MCP `:hover` unreliable):**

| Check | 1440×900 | 390×844 |
| --- | --- | --- |
| Card W×H / W÷H | **307×512** / **0.60** (3:5) | **152×253** / **0.60** |
| Visible slides | **4.58** | **2.44** |
| Rest `object-fit` | **contain** | **contain** |
| Title size | **24px** (`pc:heading-h2`; store `--font-heading-scale` &lt; 1 vs design 28–30 at scale 1) | **16px** (`body-xl`) |
| Raised `transform` | **`rotate(2deg)`** + `translateY(-6px)` | — |
| Hover layer = surface | **true** (rest + raised) | — |
| `scrollWidth === clientWidth` | **true** (1425) | **true** (390) |

**Screenshots refreshed:** `docs/design/home/category-grid/dev-desktop.png`, `dev-mobile.png`, `dev-desktop-hover.png`.

### Coordinator static check of D1–D3 (2026-10-05)

D1 (3:5 portrait card, `contain` rest image, `cover` hover layer), D3 (`rotate(2deg)`, clockwise in the screenshot) and the stray file are verified. D2 is accepted at 24px for desktop (`pc:heading-h2` under the store's heading scale), recorded as a small gap against the design's estimated 28–30px; the merchant can choose a larger tier.

Evidence (superseded by V4 retake): see **Independent review round 1** evidence retake note.

### Independent review round 1 (2026-10-05): **V1–V4 remediated** (formatting + evidence retake)

Proven:

- surface;
- template (only the entry and its `order` slot);
- schema;
- 31 tier classes;
- the image chain per card;
- lazy loading and `alt=""`;
- no hover image as LCP;
- 3:5 cards;
- `contain` / `cover` fits;
- desktop raised state (`rotate(2deg)`, −6px, shadow, layer = surface, no neighbour shift, no clip);
- arrows;
- `scrollWidth`;
- section replacement;
- no-JS fallback;
- placeholders;
- reduced motion;
- validators.

Not proven (MCP limits): a genuine touch tap and forced `:hover`.

- **V1 (high):** cards without a swap lose their content when raised. The raised rules hide the rest image and turn the title white even when no hover layer exists, leaving a blank white card.
  - Fix: scope the image hiding, scrim and white title to cards that have a hover layer (for example a `collection-card--has-swap` class from Liquid).
  - Cards without a swap keep the rest image and the normal title, with tilt, lift and shadow only.
- **V2 (medium):** scrim contrast at the text position is 3.78:1 over a white image at the title's top edge. The 5.33:1 figure used the gradient endpoint.
  - Fix: make the scrim at least about 0.58 opaque across the whole title box (for example a gradient that reaches full strength above the title's top edge).
  - Verify: contrast of at least 4.5:1 at the title's top edge over a white image.
- **V3 (low):** the keyboard raised state only works on fine-pointer devices, because the `:focus-visible` selectors sit inside the `(hover: hover) and (pointer: fine)` query.
  - Fix: keep `:hover` inside the query and move the `:focus-visible` rules outside it, so keyboard focus raises the card on every device. Reduced motion still removes the motion.
- **V4 (low):** evidence. `dev-mobile.png` shows the slideshow, and `dev-desktop.png` hides the heading under the sticky header and shows the end of the carousel.
  - Fix: retake both, with the heading and the initial card position visible.
- **Formatting:** Prettier reports warnings on the two new Liquid files (`sections/collection-list.liquid`, `snippets/collection-card.liquid`). Fix them so `npx.cmd prettier --check` passes on both files.

**Fixes (2026-10-05):** **V1** — Liquid `collection-card--has-swap`; swap-only white title, rest hide, hover layer show; no-swap raised = tilt/lift/shadow only. **V2** — gradient reaches **0.58** from above title top (`calc(100% - 5.6rem)` stop). **V3** — `:hover` in `(hover: hover) and (pointer: fine)`; `:focus-visible` raised rules global. **V4** — screenshots retaken: carousel `slideTo(0)`, scroll clears sticky header (heading ~98px / ~58px from top), blur rest; hover via **Tab** `:focus-visible`. **Formatting** — `prettier --write` on the two Liquid files.

**Browser verify:** **V1** — DevTools removed hover layer + `--has-swap` on a card: rest opacity **1**, title **rgb(38,61,41)**, transform **rotate(2deg)**. **V2** — contrast at title top over white image **5.33:1**. **V3** — at **390×844**, `:focus-visible` transform **not none** (`rotate(2deg)`). **Validators + Prettier:** six validators pass; `prettier --check` on both Liquid files pass.

**Evidence retake (V4, 2026-10-05):** `dev-desktop.png` / `dev-mobile.png` — rest, heading + first slides visible; `dev-desktop-hover.png` — collection-list section, card raised by Tab (card 2 in capture).

Accepted gaps: heading at 45/20px against the estimated 48/24px; desktop title at 24px; `scheme-2` grey against sage; card `bg-white`; dev store demo data.

### Independent review round 2 (2026-10-05): V1–V3 and formatting PASS; V4 evidence only

The reviewer measured, at both widths:

- the no-swap card keeps its image and normal title colour;
- the scrim is 0.58 at the title's top edge, giving 5.32:1;
- `:focus-visible` raises the card on both widths;
- the layer equals the surface;
- no neighbour shift;
- `scrollWidth` equals `clientWidth`;
- validators and Prettier pass.

**Final evidence retake (round 2, 2026-10-05, no code):** `dev-desktop.png` — 1440×900, heading clears sticky header, `slideTo(0,0)`, `blur()`, no `:focus-visible` on cards, prev disabled, all cards rest. `dev-desktop-hover.png` — Tab to **first** card (`66666666666`), `slideIndex` 0, prev disabled, first card fully visible and raised (`rotate(2deg)`), heading visible.

Remaining: coordinator static image check on the two PNGs; then batch complete.
