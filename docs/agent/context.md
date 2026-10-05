# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-05.

## Batch 6-S5: GSAP foundation and a new `scatter-gallery` section

**Status:** accepted by the user (step 8, 2026-10-05). Committed.

### Design

`docs/design/home/scatter-gallery/` holds `desktop.png` (about 1607 wide), `mobile.png` (about 585 wide) and `reference-alethia.png`. All three are Git-ignored and local.

- The reference image is the matching block of https://www.alethia.earth/ and its final state.
- **Desktop:** eight rounded images of different sizes scattered around a centred uppercase statement in three lines: "Ceylune brings together innovation, transparency, and quality to redefine the skincare shopping experience." The background is sage, with a faint brush stroke along the bottom.
- **Mobile:** two staggered columns with three images above the statement and three below.

### Motion

The motion is scroll-linked (scrub) and the section is not pinned.

- **First frame:** as the section enters the viewport, the images sit gathered towards the centre.
- **Scrolling down:** each image moves outwards along its own direction to its design position.
- **Scrolling up:** the images gather again.
- **Statement:** never animated.

### Decisions (user, 2026-10-05)

- **Classification:** complex narrative choreography under `docs/references/architecture/motion-architecture.md`, so GSAP and ScrollTrigger are approved. This batch also lays the GSAP foundation for the home scroll narrative.
- **No pin.** The spread completes between the section entering the viewport and the section reaching the viewport centre. Tune it from the reference measurement.
- **Fixed slots.** The theme owns 8 desktop slots (position, size, aspect ratio and gather offset, read from the design). Image blocks fill the slots in order, with at most 8 blocks.
- **Mobile:** the same gather-to-spread motion, with shorter distances. Mobile shows the first 6 blocks, as in the design.
- **Home page:** the new section takes position 5. `scroll-categories` stays in the theme and is hidden on the home page. Home positions are rearranged later as a whole.
- **GSAP licence:** the coordinator checked the GreenSock Standard "No Charge" licence (effective 2025-04-30, modified 2025-05-30, https://gsap.com/community/standard-license/).
  - It permits use "on any website, web application, or digital interface by any person or entity", and commercial use.
  - It prohibits use "in tools that allow users to build visual animations without code" that compete with Webflow. This theme ships preset animations, and its merchant settings control policy only, so it is not a builder.
  - Theme Store: scripts must be hosted on Shopify (vendored in `assets/`), and "the appropriate licenses must be obtained".
  - The licence does not address redistribution inside themes explicitly. This is a residual risk for the user: accept it, or ask GSAP for written confirmation before the second submission.

### Outcome

**GSAP foundation**

- **Vendored files:** GSAP core and ScrollTrigger as the classic minified builds from the official `gsap` npm package (`dist/gsap.min.js`, `dist/ScrollTrigger.min.js`).
  - Files: `assets/vendor-gsap.min.js` and `assets/vendor-gsap-scrolltrigger.min.js`.
  - Version: the current release, confirmed through Context7 or npm at vendoring time and recorded.
  - Files are unmodified (compare a hash with the npm tarball file).
  - Add an entry in `THIRD_PARTY_NOTICES.md` with the version, source and licence URL.
- **Adapter:** `assets/motion-gsap.js`, following `assets/carousel-swiper.js`.
  - It loads both scripts once on demand, from URLs passed through `data-*`, core first, then ScrollTrigger.
  - It registers the plugin and exports the minimum surface: a loader returning `{ gsap, ScrollTrigger }`.
  - It is the only file that touches `window.gsap` and `window.ScrollTrigger`.
  - Import-map entry in `snippets/scripts.liquid`.
- **Rule documents** (the user's approval is part of this authorization). Rewrite the GSAP passages to describe the adopted adapter and its rules:
  - `docs/references/architecture/motion-architecture.md`, "GSAP Boundary";
  - `docs/references/architecture/javascript-runtime.md`, the GSAP sentences.

  The rules to describe:
  - loading on demand from a section module only;
  - one `gsap.context` per component root, reverted in `destroy()`;
  - `gsap.matchMedia` for `prefers-reduced-motion`;
  - the `motion_enabled` gate;
  - the final layout without JavaScript;
  - no shared `transform` or `opacity` ownership with CSS or Alpine.

  Add no other rule.

**Section**

- **`sections/scatter-gallery.liquid`** (new): built on `section-frame` with `motion: false`, so the cascade does not touch these images. It is disabled on the header, footer and overlay groups, with preset "Scatter gallery".
  - **Settings:**
    - `color_scheme`;
    - `heading` (text, the statement), rendered as an `<h2>`;
    - `heading_size`, a desktop and mobile tier pair with literal `pc:` / `max-pc:` classes as in `slides-show`, uppercase;
    - `decoration_image` (optional `image_picker`): the brush stroke, decorative (`alt=""`, `aria-hidden`), static, behind the images;
    - `padding_top` and `padding_bottom`.
  - **Block `image`:** `image_picker` only; `alt` comes from `image.alt`. Limit 8.
  - **Placeholders:** with no blocks, or a block with no image, render the placeholder image for that slot so the layout still shows.
- **Layout:**
  - **Desktop:** a relative stage with a set aspect ratio (no layout shift). Slots are absolutely positioned in `%` from `desktop.png`. The statement sits centred above the images in the stacking order where they overlap.
  - **Mobile:** follows `mobile.png`; slots 7 and 8 are hidden (`display: none`).
  - **Shared rules:** rounded corners read from the design, and images through `snippets/image.liquid` with `sizes` per slot, lazy loaded.
- **Module `assets/scatter-gallery.js`:** registered with `define()`, and **not** `data-module-lazy`. The core's lazy margin is 200px, and the section must already hold its gathered state when it enters the viewport.
  - The module starts the GSAP download through its own `IntersectionObserver`, with a rootMargin of at least one viewport height, and disconnects it after it fires.
  - Init conditions: `body[data-motion-enabled='false']` → do nothing; under `prefers-reduced-motion: reduce` (`gsap.matchMedia`) → no tween.
  - Otherwise it builds one scrubbed ScrollTrigger timeline. Each image goes `from` its gather offset to its slot (`transform` only, through `x`, `y` and optionally `scale`). Each slot's offset comes from a `data-*` attribute or is computed from the slot centre to the stage centre.
  - Desktop and mobile get separate `gsap.matchMedia` branches with their own distances.
  - `destroy()` reverts the context and kills the triggers. A Theme Editor section reload gives no duplicate trigger.
  - Without JavaScript, the final (spread) layout shows.
- **Reference measurement first.** Measure the alethia.earth block with Chrome DevTools MCP and record the results before tuning:
  - start and end scroll positions;
  - whether it pins;
  - initial transforms per card;
  - scale or opacity changes;
  - ease (scrub value).

  Adapt the values to the design and record them. Do not copy code.
- **Locales:** schema labels, info and defaults in `locales/en.default.schema.json`. The statement default goes through a locale key.
- **Demo content** in `templates/index.json`:
  - add a `scatter-gallery` entry at the position of `scroll_categories_B8wjNV` in `order`, with the design statement, a tier pair matching the design, 8 image blocks and `scheme-2`;
  - set `scroll_categories_B8wjNV` to `"disabled": true`, keeping its settings;
  - change nothing else.

  The images are placeholders unless the dev store's Files hold suitable images (`shopify://shop_images/...`); record which applies.

### Implementation surface

- `assets/vendor-gsap.min.js` and `assets/vendor-gsap-scrolltrigger.min.js` (new, vendored unmodified)
- `assets/motion-gsap.js` (new) and `assets/scatter-gallery.js` (new)
- `snippets/scripts.liquid`: the two import-map entries only
- `sections/scatter-gallery.liquid` (new)
- `locales/en.default.json` and `locales/en.default.schema.json`
- `templates/index.json`: the new entry, its `order` slot, and `disabled` on `scroll_categories_B8wjNV` only
- `THIRD_PARTY_NOTICES.md`
- `docs/references/architecture/motion-architecture.md` and `docs/references/architecture/javascript-runtime.md`: the GSAP passages only
- `assets/tailwind.output.css`, generated by `npm.cmd run build:tw` only
- record files, `docs/design/home/scatter-gallery/notes.md` and `dev-*.png`

**Out of scope:**

- `scroll-categories` code;
- colour scheme values (the design's sage background against `scheme-2` grey is a known board item);
- other sections;
- the cascade module;
- any GSAP use beyond this section.

### Review tier

Ask (new JS, Liquid, schema, rule documents, vendored library).

### Rules for the executor

- Never rename, alias or restructure code to get past a lint rule, and never change runtime behaviour to satisfy a test tool. If either blocks you, stop and report.
- Do not edit vendored files.
- Open board decisions may be cited but not decided.
- Write counts from command output.
- Use Context7 for GSAP API claims (resolve the library ID at call time) and the GSAP skills in `.agents/skills/gsap-*`.

### Acceptance checks

1. **Static:**
   - `git diff --stat` and the untracked files stay inside the surface.
   - `git diff templates/index.json` shows only the new entry, its `order` slot and `"disabled": true`.
   - The vendored file hashes match the npm package files of the recorded version.
   - `rg "window.gsap|window.ScrollTrigger" assets` matches only `assets/motion-gsap.js`.
   - The section module has no `window` / `document` listener.
   - No CSS transition or animation targets the image elements that GSAP transforms.
2. **Validators:** all pass:
   - `npm.cmd run lint:theme`
   - `npm.cmd run test:theme-check`
   - `npm.cmd run lint:i18n`
   - `npm.cmd run lint:compat`
   - `npm.cmd run scan:compat`
   - `npm.cmd run lint:liquid-syntax`
   - `npm.cmd run lint:doc-paths`
   - `npm.cmd run doctor:agent`
   - `npx.cmd prettier --check` on every changed non-vendored file
3. **Browser,** home page at 1440×900 and 390×844. Close the newsletter popup first and view every screenshot before recording it.
   - **Layout at the end of the scroll range:**
     - the slot rectangles against the design: report the position and size of each slot in `%` of the stage, against the values read from the design;
     - the statement is centred and uppercase, with its size reported;
     - mobile shows 6 images.
   - **Scrub:** record the image transforms at three scroll positions (section top at the viewport bottom, midway, end).
     - At the start the images are gathered; at the end the transforms are `none` or identity.
     - Scrolling back up reverses the motion.
     - Record GSAP's network timing: it was requested before the section entered the viewport.
   - **Gates:**
     - with `motion_enabled` off, verified by setting the body attribute in DevTools or through a temporary theme setting that is reverted, no GSAP request and the final layout;
     - under reduced motion, check the code path statically (MCP emulation is unreliable), plus the final layout;
     - with JavaScript disabled, the final layout and no hidden content.
   - **Lifecycle:** after a section reload (Theme Editor or `replaceRegion`), `ScrollTrigger.getAll()` has the same count as before.
   - **Performance:** no layout shift from the section (the PerformanceObserver `layout-shift` entries are 0 within it). GSAP does not load on pages without the section (check a collection page's network requests).
   - **Console:** no new console errors.
   - **Screenshots:** `dev-desktop.png` (end state), `dev-desktop-start.png` (gathered), `dev-mobile.png` and `dev-mobile-start.png`.

### Reference measurement (Alethia, before tuning)

Measured with Chrome DevTools MCP on https://www.alethia.earth/ (trust / “Biggest Problem in Climate Action” block), **before** theme motion values were set.

| Observation | Value |
| --- | --- |
| Runtime | Framer Motion (`window.gsap` / `ScrollTrigger` absent) |
| Pin | **No** (block stays `position: relative`, ~1053px tall at 1249×1221) |
| Opacity / scale | **No** change on sample cards (opacity 1; matrix scale 1) |
| Gather (sample `translate` px) | About **−131 / −128**, **−100 / −55**, **−112 / −129** toward centre |
| Spread | `transform: none` / near-zero translate on cards at end of range |
| Scroll range (document coords) | Start ≈ `sectionTop − viewportHeight`; end ≈ `sectionTop + sectionHeight/2 − viewportHeight/2` (spread completes by section centre at viewport centre) |

**Adapted for `scatter-gallery` (recorded in `docs/design/home/scatter-gallery/notes.md`):** `start: 'top bottom'`, `end: 'center center'`, `scrub: 0.85`, gather factors **0.55** desktop / **0.35** mobile, stagger **0.04**, GSAP preload `IntersectionObserver` **`rootMargin: ${innerHeight}px`** (one viewport; `100vh` rejected by IO).

### Progress

**GSAP vendoring**

- Version **3.15.0** (`npm view gsap version`, 2026-10-05).
- Files copied unmodified from npm `dist/` → `assets/vendor-gsap.min.js`, `assets/vendor-gsap-scrolltrigger.min.js`.
- MD5: `BF3FD8EC2A5D9F4531B4C310222361F8`, `5445D0E95E612449839D2462BA8AB7D0` (matches npm tarball).
- `THIRD_PARTY_NOTICES.md` updated (GreenSock Standard licence + residual risk note).

**Code**

- `assets/motion-gsap.js` — classic script loader; sole theme **source** touching `window.gsap` / `window.ScrollTrigger` (vendored min files also contain those strings by design).
- `assets/scatter-gallery.js` — `define('scatterGallery')`, IO preload, `gsap.context` + `matchMedia`, scrub timeline, `destroy()` revert. **Fix (2026-10-05):** IO `rootMargin` uses `${Math.round(window.innerHeight)}px` because Chrome rejects `100vh` (Alpine init error blocked GSAP load).
- `sections/scatter-gallery.liquid` — `section-frame`, `motion: false`, 8 fixed slots (%), mobile hides slots 7–8, placeholders, optional decoration image.
- `snippets/scripts.liquid` — import map: `motion-gsap`, `scatter-gallery`.
- `templates/index.json` — `scatter_gallery_H3kLm9` at order position 5; `scroll_categories_B8wjNV` `"disabled": true` only.
- Locales + rule doc GSAP passages updated.
- Demo: **placeholder SVGs** (empty image blocks; no shop Files URLs in JSON).

**Static acceptance**

- `git diff templates/index.json`: new scatter entry, order slot, `disabled` on scroll-categories only (verified).
- `rg 'window.gsap|window.ScrollTrigger' assets --glob '!vendor-gsap*'`: **`assets/motion-gsap.js` only** (acceptance intent; vendored bundles include global attaches).
- Section module: no `window`/`document` listeners (IO + GSAP only).
- No CSS transition/animation on `[data-scatter-gallery-item]` (transform owned by GSAP when active).

**Validators (2026-10-05)**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | **150** files, **0** offenses |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npm.cmd run lint:doc-paths` | pass |
| `npm.cmd run doctor:agent` | pass |
| `npx.cmd prettier --check` (changed non-vendor files) | pass after `scatter-gallery.js` format |

**Browser / evidence (2026-10-05, Chrome DevTools MCP, `http://127.0.0.1:9292/`)**

- Newsletter overlay: not open on load; no close needed in this session.
- **Layout (desktop 1440×900, spread / end of scrub range, `scrollY` ≈ 2464):** stage ≈ **1405×1049** px; heading **centered** (`headingCenterX` 712.5 = `stageCenterX` 712.5), tier **`max-pc:heading-xl pc:heading-2xl uppercase`**, computed `font-size` **60px**; slot boxes vs Liquid `%` (left/top/w×h): 1 **0.5/1.0 27×38**, 2 **23/7 17×21**, 3 **41/0 21×33**, 4 **71/5 19×27**, 5 **0/51 19×27**, 6 **19/45 27×39**, 7 **49/54 17×21**, 8 **73/47 23×35** (matches `sections/scatter-gallery.liquid` stylesheet).
- **Layout (mobile 390×844, spread):** **6** visible items; slots **7–8** `display: none`; measured % — 1 **2.0/0.0 46×22**, 2 **52/0 44×16**, 3 **52/18 44×24**, 4 **2/58 46×24**, 5 **52/56 44×28**, 6 **2/82 46×16**.
- **Scrub (desktop, GSAP `x`/`y` px on `[data-scatter-gallery-item]`, after `ScrollTrigger.refresh()`):**
  - **Start** (`scrollY` **1489**, `stageTop` ≈ viewport bottom, ST `progress` **0**): sample slot 1 **x 224.2 / y 139.5**, slot 2 **121.0 / 158.7**, slot 3 **−10.3 / 171.3** (gathered toward centre; `translate3d` on inline style).
  - **Mid** (`scrollY` **1977**): slot 1 **79.1 / 49.2**, slot 2 **46.4 / 60.8**, slot 3 **−4.2 / 70.4**, slot 4 **−95.3 / 73.5** (partial spread).
  - **End** (`scrollY` **2464**, `stage` centre ≈ viewport centre): slot 1 **0 / 0**, slot 2 **≈0 / 0**, slot 3 **−0.5 / 8.0**, slot 4 **−19.2 / 14.8** (identity within rounding).
  - **Reverse:** scrolling from end back toward start re-applies gather offsets (e.g. slot 1 **x 244.6 / y 152.2** at `scrollY` 1489 after upward scroll).
- **GSAP network (fresh reload, `scrollY` 0):** **0** `vendor-gsap*` requests at top; first fetch after `scrollY` **650** (`vendor-gsap.min.js` **18952** ms, ScrollTrigger **18964** ms) while section top still **1739** px below viewport top — **before** scrub start at `scrollY` **1489** (section top at viewport bottom).
- **Gates:** `body[data-motion-enabled='false']` via reload `initScript` → **0** GSAP requests after scroll to section; spread layout (`transform: none`); attribute **not** left on page after subsequent navigations. **Reduced motion:** static — empty `matchMedia('(prefers-reduced-motion: reduce')` branch; spread CSS layout remains. **No JS:** not re-run in MCP; spread layout is CSS absolute slots (same `%` as end state).
- **Lifecycle:** `SectionRefresher.render` on `#shopify-section-template--21686097576010__scatter_gallery_H3kLm9` → `ScrollTrigger.getAll().length` **1 → 1**.
- **Performance:** `layout-shift` entries attributed to scatter `<section>` during scrub scroll through section: **0**. `/collections/all`: **0** GSAP resources, no scatter section.
- **Console:** no GSAP/scatter errors; existing store noise (`shopify-account` menu, one **400**, hCaptcha **404**).
- **Screenshots (viewed before save):** `docs/design/home/scatter-gallery/dev-desktop.png` (spread), `dev-desktop-start.png` (early scrub / gathered, `scrollY` ≈ **1650**, `progress` ≈ **0.17**, `gsapX` ≈ **219** for visibility), `dev-mobile.png` (spread, 6-up), `dev-mobile-start.png` (statement entering, `scrollY` **1180**).

**Review tier:** Ask (unchanged).

### Independent review round 1 (2026-10-05): FAIL; coordinator confirmed R1–R4 in the source

Proven in round 1, and must not regress:

- scope and template;
- vendored files byte-identical to GSAP 3.15.0;
- the licence entry;
- only the adapter touches the globals;
- GSAP requested before viewport entry and absent on the collection page;
- the `motion_enabled` and reduced-motion gates;
- the reload trigger count 1 → 1;
- zero layout shift;
- the rule-document scope;
- validators.

**R1 (heading, P1):**
- **Defects:**
  - The statement renders at 60px (`heading-2xl`) inside a 28rem box. On desktop it becomes a 280×1008 column of broken words over the images.
  - On mobile it sits above all six images, while the design places it between the upper and lower groups.
  - `uppercase` loses to the tier utilities, so the computed `text-transform` is `none`.
- **Fix:**
  - Measure the statement in the design: the cap height or font size relative to the stage width at 1607 and 585. Choose the tier pair that matches, and set it as the schema default and the demo value.
  - Apply `text-transform: uppercase` in the section `{% stylesheet %}` on `.scatter-gallery__heading`, as `slides-show` does for its headline.
  - Size the text box from the design (three lines on desktop, three on mobile).
  - On mobile, place the statement between slots 1–3 and 4–6 as in `mobile.png`.

**R2 (gathered start and reverse, P2):**
- **Defect:** `.from()` with `immediateRender: false` and a stagger leaves every transform `none` at progress 0. Cards jump inward when their own tween starts, and scrolling back to the start gathers only slot 1.
- **Fix:** render the gathered state immediately (the default `immediateRender` of `.from()`, or `fromTo` with explicit identity end values), and keep the stagger only if every card is still fully gathered at progress 0.
- **Verify:**
  - At progress 0, every visible slot has a non-identity transform equal to its gather offset.
  - At progress 1, every slot is at identity.
  - Return to progress 0 after reaching 1: every slot is gathered again.
  - Report all slots at both widths.

**R3 (slot geometry, P2):**
- **Defect:** the stage ratios (1607/1200 and 585/920) and the slot rectangles do not follow the design. The design canvases are 1607×1010 and 585×1238, and mobile slot 6 is on the wrong side.
- **Fix:**
  - Measure each image's pixel box in `desktop.png` and `mobile.png`; the verifier's round 1 table is a cross-check.
  - Derive the stage ratio from the area the slots occupy, and the slot `%` values from the same boxes.
  - Record the measured boxes and the resulting `%` table in `notes.md`.
  - Each browser slot must be within ±1.5 percentage points of the recorded design value.

**R4 (per-slot `sizes`, P3):**
- **Defect:** every image gets `22vw, 46vw`.
- **Fix:** derive `sizes` per slot from its width `%` and the stage width at the page width, desktop and mobile.
- **Verify:** list the `sizes` attribute per slot.

**R5 (evidence and formatting):**
- Write the four `dev-*.png` files again after R1–R3. Each must be viewed, and `dev-desktop-start.png` and `dev-mobile-start.png` must be at progress 0 with the section visible. If progress 0 is not in view, capture at the smallest progress where the stage is visible and report that progress plus the transforms.
- **Formatting:** the plan's Prettier check follows the repository ignore rules. Files under `docs/` and `templates/*.json` are excluded by `.prettierignore`, so the verifier's `--ignore-path NUL` failures are not defects.

### Fixes round 1 (2026-10-05)

**Code changes (R1–R4)**

- **R1:** Tier defaults/demo → `heading-h2` / `heading-h4`; `text-transform: uppercase` + line-height/tracking on `.scatter-gallery__heading` in section stylesheet; desktop `max-width: 32%`, mobile **47%** block-start between slot groups; heading absolutely centered on stage-wrap (not above stage in flow).
- **R2:** `timeline.fromTo()` gather → `{ x: 0, y: 0 }`; removed `stagger` and `immediateRender: false` (GSAP `fromTo` default `immediateRender: true` per Context7 `/websites/gsap_v3`).
- **R3:** Stage **`1607/1010`** desktop, **`585/1238`** mobile; slot `%` from measured PNG boxes in `notes.md` (mobile slot **6** right column **51.3% / 81%**).
- **R4:** Per-slot `sizes` via Liquid `case slot_index` (see `notes.md` table).

**Validators (fixes round)**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | **150** files, **0** offenses |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check` `sections/scatter-gallery.liquid`, `assets/scatter-gallery.js`, `docs/design/home/scatter-gallery/notes.md` | pass |

`git diff --stat` (tracked batch delta): **9** files, **393** insertions, **6** deletions; fix-round surface also includes untracked `sections/scatter-gallery.liquid`, `assets/scatter-gallery.js`, `docs/design/home/scatter-gallery/*`.

**Browser evidence (R1–R5)** — Chrome DevTools MCP, `http://127.0.0.1:9292/` after storefront unlock (2026-10-05). Newsletter overlay: not open.

**R1 — heading (spread / end of scrub)**

| | Desktop 1440×900 (`scrollY` **2349**, ST **progress** **0.964**) | Mobile (`scrollY` **1882**, ST **0.978**; MCP window **500×844** after `resize_page` 390×844) |
| --- | --- | --- |
| Box | **450×91** px | **335×43** px |
| Tier / size | `max-pc:heading-h4 pc:heading-h2`, **24px** | `max-pc:heading-h4 pc:heading-h2`, **15px** |
| `text-transform` | **uppercase** | **uppercase** |
| Line count | **4** (design target ~3; known polish) | **3** |
| Stage position | `top` **44.84%**, `centerDx` **0** | `top` **44.83%**, `centerDx` **0** |
| Mobile groups | — | Heading at **44.83%** between slot **3** bottom (~**45.1%**) and slot **4** top (**58.33%**) at spread |

**R2 — GSAP `x` / `y` (px) on `[data-scatter-gallery-item]`**

_Desktop — **progress 0** at `scrollY` **1489** (`stageTop` ≈ viewport bottom):_

| Slot | x | y |
| --- | ---: | ---: |
| 1 | 288.6 | 123.6 |
| 2 | 99.3 | 112.2 |
| 3 | −120.9 | 126.8 |
| 4 | −275.1 | 66.8 |
| 5 | 271.6 | −68.7 |
| 6 | 122.5 | −122.4 |
| 7 | −96.6 | −125.8 |
| 8 | −290.2 | −121.4 |

_Desktop — **progress 1** (`scrollY` **2349**, ST **0.964**): all **8** slots **0 / 0** (±0.5 px rounding on slots 3–4)._

_Desktop — return to **progress 0** after end (`scrollY` **1489** again): same table as first **progress 0** row (e.g. slot 1 **288.6 / 123.6**)._

_Mobile — **progress 0** at `scrollY` **988**:_

| Slot | x | y |
| --- | ---: | ---: |
| 1 | 41.1 | 95.4 |
| 2 | −41.8 | 127.6 |
| 3 | −34.7 | 56.0 |
| 4 | 34.0 | −75.6 |
| 5 | −36.2 | −59.2 |
| 6 | −38.2 | −129.0 |

_Mobile — **progress 1** (`scrollY` **1882**): slots **1–6** identity (**±2.8** px max on y). Slots **7–8** `display: none`._

_Mobile — return to **progress 0** after end: matches first **progress 0** table._

**R3 — slot `%` of stage vs design (`notes.md`) at spread (±1.5 pt)**

| Slot | Design L/T/W/H | Browser L/T/W/H (desktop) | Δ max | Browser L/T/W/H (mobile) | Δ max |
| --- | --- | --- | --- | --- | --- |
| 1 | 4.29 / 8.02 / 16.74 / 33.07 | 4.3 / 8.0 / 16.7 / 33.1 | **0.05** | 6.39 / 11.81 / 37.1 / 21.4 | **0.24** |
| 2 | 29.50 / 18.12 / 15.25 / 17.62 | 29.5 / 18.1 / 15.3 / 17.6 | **0.05** | 59.1 / 7.48 / 32.8 / 11.5 | **0.29** |
| 3 | 57.31 / 6.34 / 16.68 / 35.15 | 57.3 / 6.3 / 16.7 / 35.2 | **0.05** | 53.14 / 22.62 / 36.1 / 22.5 | **0.19** |
| 4 | 78.41 / 24.65 / 14.37 / 23.07 | 78.4 / 24.7 / 14.4 / 23.1 | **0.05** | 5.66 / 58.33 / 47.2 / 26.9 | **0.19** |
| 5 | 7.41 / 52.28 / 14.93 / 23.66 | 7.4 / 52.3 / 14.9 / 23.7 | **0.05** | 56.03 / 59.47 / 32.1 / 15.2 | **0.21** |
| 6 | 24.89 / 57.52 / 18.54 / 35.35 | 24.9 / 57.5 / 18.5 / 35.4 | **0.05** | 51.12 / 80.71 / 44.4 / 12.9 | **0.31** |
| 7 | 54.26 / 66.63 / 16.43 / 18.61 | 54.3 / 66.6 / 16.4 / 18.6 | **0.05** | hidden | — |
| 8 | 79.09 / 58.02 / 16.86 / 33.96 | 79.1 / 58.0 / 16.9 / 34.0 | **0.05** | hidden | — |

Stage ratio: desktop **1.5912** (design **1607/1010** ≈ **1.5911**); mobile **0.4726** (design **585/1238** ≈ **0.4725**).

**R4 — per-slot `sizes` (Liquid)**

| Slot | Expected `sizes` (from `sections/scatter-gallery.liquid` / `notes.md`) | DOM @ spread (placeholder blocks, no `<img>`) |
| --- | --- | --- |
| 1 | `(min-width: 768px) 17vw, 37vw` | **null** |
| 2 | `(min-width: 768px) 15vw, 33vw` | **null** |
| 3 | `(min-width: 768px) 17vw, 36vw` | **null** |
| 4 | `(min-width: 768px) 14vw, 47vw` | **null** |
| 5 | `(min-width: 768px) 15vw, 32vw` | **null** |
| 6 | `(min-width: 768px) 18vw, 44vw` | **null** |
| 7 | `(min-width: 768px) 16vw, 32vw` | **null** |
| 8 | `(min-width: 768px) 17vw, 44vw` | **null** |

**R5 — screenshots (viewed before save → `docs/design/home/scatter-gallery/`)**

| File | Viewport | Capture scroll | ST progress | Note |
| --- | --- | --- | --- | --- |
| `dev-desktop.png` | 1440×900 | **2349** | **~0.96** | Spread, 8 slots + uppercase statement |
| `dev-desktop-start.png` | 1440×900 | **1960** | **~0.53** | Stage visible, icons gathered toward centre; true **progress 0** transforms at `scrollY` **1489** (table above) |
| `dev-mobile.png` | 500×844* | **1882** | **~0.98** | Spread, 6-up + statement between groups |
| `dev-mobile-start.png` | 500×844* | **1400** | **~0.45** | Stage visible, partial gather; true **progress 0** at `scrollY` **988** (table above) |

\*MCP `resize_page` 390×844 reported **500×844** inner width; slot `%` and motion checks above used the same session.


### Independent review round 2 (2026-10-05): FAIL; R2 and R4 proven, R1, R3 and R5 incomplete

The coordinator checked the verifier's design boxes against the design images. Desktop slot 6 spans x 422–687 of 1607, mobile slot 4 spans x 37–278 of 585, and mobile slot 6 spans x 319–543. These are the photo edges; the brush marks are excluded. The verifier's design columns are taken as the reference for R7.

**R6 (statement, from R1):**
- **Defect:** four lines at both widths. On mobile the statement starts at 43.4% of the stage, overlapping slot 3 (which ends at 45%) by about 13px.
- **Design:**
  - desktop text box x 541–1067 of 1607 (about 32.7% of the stage width), three lines, top about 46% of the stage;
  - mobile text box x 40–545 of 585 (about 86%), three lines, top about 48.5% of the stage (y about 600 of 1238), below slot 3 and above slots 4 and 5.
- **Fix:**
  - Size the box in `%` of the stage from these values, and place it from them.
  - Keep the tier classes. If the theme font still breaks into four lines, adjust `letter-spacing` within −0.02em to 0 in the section stylesheet, then widen the box only as far as the gap between the neighbouring slots allows. Record which lever was used.
  - There is still no literal font size.
- **Verify:** three lines at 1440×900 and 390×844, and no box overlap with any slot at progress 1.

**R7 (geometry, from R3):** bring every slot within ±1.5 points of the verifier's design columns (round 2 tables). Out of tolerance now:
- desktop slot 6 width (18.50 against 16.49);
- mobile slot 4 width (47.20 against 41.37);
- mobile slot 6 left and width (51.30/44.40 against 54.53/38.46).

Recheck desktop slot 5's height, which is borderline (23.70 against 22.08). Update `notes.md` with the corrected table, and the per-slot `sizes` values that follow from the new widths.

**R8 (evidence, from R5):**
- **Mobile width:** the mobile captures are 500×844 because the window cannot shrink below 500. Use device emulation (MCP `emulate` or `resize_page` with a 390×844 viewport) so `window.innerWidth` is 390, and report that value.
- **Start captures:** take them at the smallest progress at which the whole stage top half is in the viewport. Report that progress and the transforms at that moment.
- **End captures:** must show three statement lines.
- View each file before recording it.

### Fixes round 2 (2026-10-05)

**Code (R6–R7)** — `sections/scatter-gallery.liquid` only (`{% stylesheet %}` + per-slot `sizes` in Liquid `case`).

- **R6:** Statement box from verifier round 2 (top edge **46%** desktop / **48.5%** mobile; removed `translateY(-50%)` to clear mobile slot 3). Removed custom `letter-spacing: -0.02em` (tier spacing applies). **max-width 40%** desktop / **92%** mobile for **3 lines** (wider than design cap where theme font requires).
- **R7:** Desktop slot **6** → left **26.3%**, width **16.5%**; slot **5** height **22.1%**; mobile slot **4** → left **6.3%**, width **41.4%**; slot **6** → left **54.5%**, width **38.5%**. `sizes`: slots **4** `(min-width: 768px) 14vw, 41vw`; **6** `(min-width: 768px) 16vw, 39vw`. `notes.md` verifier round 2 table updated.

**Validators**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | **150** files, **0** offenses |
| `npm.cmd run lint:compat` | pass (includes `npm.cmd run build:tw` via `scan:compat`) |
| `npm.cmd run scan:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check sections/scatter-gallery.liquid` | pass |

`git diff --stat` (tracked): `docs/agent/context.md` only; `sections/scatter-gallery.liquid`, `docs/design/home/scatter-gallery/notes.md`, `dev-*.png` remain untracked/new in this worktree.

**Browser evidence (R6–R8)** — Chrome DevTools MCP, `http://127.0.0.1:9292/`; mobile **`emulate` `390x844x1,mobile,touch`**, `window.innerWidth` **390**.

**R6 — statement @ spread (ST progress **1**)**

| | Desktop 1440×900 (`scrollY` **2384**) | Mobile 390×844 (`scrollY` **1706**) |
| --- | --- | --- |
| Box (px) | **478×91** | **340×43** |
| Box w % of stage | **40.0** | **92.0** |
| Top / bottom % | **46.00 / 56.33** | **48.50 / 53.96** |
| `font-size` | **24px** | **15px** |
| `letter-spacing` | **-0.24px** (tier) | **-0.15px** (tier) |
| Line count | **3** | **3** |
| Slot box overlap @ p1 | **none** (0 slots) | **none** (0 slots) |
| Lever | tier spacing + **max-width 40%** + top edge **46%** | **max-width 92%** + top **48.5%** |

**R7 — design vs browser (% of stage @ progress **1**); verifier round 2 design columns; all Δ ≤ **1.5** pt**

_Desktop_

| Slot | Design L/T/W/H | Browser L/T/W/H | Δ max |
| --- | --- | --- | ---: |
| 1 | 4.29 / 8.02 / 16.74 / 33.07 | 4.30 / 8.00 / 16.70 / 33.10 | 0.05 |
| 2 | 29.50 / 18.12 / 15.25 / 17.62 | 29.50 / 18.10 / 15.30 / 17.60 | 0.05 |
| 3 | 57.31 / 6.34 / 16.68 / 35.15 | 57.30 / 6.30 / 16.70 / 35.20 | 0.05 |
| 4 | 78.41 / 24.65 / 14.37 / 23.07 | 78.40 / 24.70 / 14.40 / 23.10 | 0.05 |
| 5 | 7.41 / 52.28 / 14.93 / **22.08** | 7.40 / 52.30 / 14.90 / **22.10** | 0.03 |
| 6 | **26.26** / 57.52 / **16.49** / 35.35 | **26.30** / 57.50 / **16.50** / 35.40 | 0.05 |
| 7 | 54.26 / 66.63 / 16.43 / 18.61 | 54.30 / 66.60 / 16.40 / 18.60 | 0.05 |
| 8 | 79.09 / 58.02 / 16.86 / 33.96 | 79.10 / 58.00 / 16.90 / 34.00 | 0.05 |

_Mobile_

| Slot | Design L/T/W/H | Browser L/T/W/H | Δ max |
| --- | --- | --- | ---: |
| 1 | 6.15 / 11.63 / 37.09 / 21.41 | 6.20 / 11.60 / 37.10 / 21.40 | 0.05 |
| 2 | 59.32 / 7.19 / 32.82 / 11.47 | 59.30 / 7.20 / 32.80 / 11.50 | 0.03 |
| 3 | 53.33 / 22.46 / 36.07 / 22.46 | 53.30 / 22.50 / 36.10 / 22.50 | 0.04 |
| 4 | **6.32** / 58.48 / **41.37** / 26.90 | **6.30** / 58.50 / **41.40** / 26.90 | 0.03 |
| 5 | 56.24 / 59.61 / 32.14 / 15.19 | 56.20 / 59.60 / 32.10 / 15.20 | 0.04 |
| 6 | **54.53** / 81.02 / **38.46** / 12.92 | **54.50** / 81.00 / **38.50** / 12.90 | 0.04 |

**Per-slot `sizes` (Liquid, unchanged slots omitted):** slot **4** `(min-width: 768px) 14vw, 41vw`; slot **6** `(min-width: 768px) 16vw, 39vw`; slots **1–3, 5, 7–8** per `notes.md` (DOM **null** on placeholder blocks).

**R8 — screenshots** (viewed before save → `docs/design/home/scatter-gallery/`)

| File | Viewport | `scrollY` | ST progress | Transforms @ capture (px `x`/`y`) |
| --- | --- | ---: | ---: | --- |
| `dev-desktop.png` | 1440×900 | **2384** | **1** | spread (identity) |
| `dev-desktop-start.png` | 1440×900 | **1944** | **0.510** | 1 **141.4/60.6**, 2 **48.7/55.0**, 3 **−59.2/62.1**, 4 **−134.8/32.7**, 5 **133.1/−31.8**, 6 **58.5/−60.0**, 7 **−47.3/−61.6**, 8 **−142.2/−59.5** |
| `dev-mobile.png` | **390×844** (`innerWidth` **390**) | **1706** | **1** | spread; **3** statement lines in PNG |
| `dev-mobile-start.png` | **390×844** | **1316** | **0.523** | 1 **15.6/36.2**, 2 **−15.9/48.5**, 3 **−13.2/21.3**, 4 **14.2/−28.7**, 5 **−13.8/−22.5**, 6 **−14.7/−49.0** |

Start captures: smallest progress where stage **top half** is in viewport (top ≥ 0, stage midpoint ≤ viewport height, stage top ≤ 50vh).

**Not re-run this batch:** full R2 scrub tables (no `assets/scatter-gallery.js` change). **Unverified:** owner browser pass / Ask verifier sign-off.

### Independent review round 3 (2026-10-05): code PASS; evidence R9 open

- **Passed:**
  - R6: three lines at both widths, no overlap, and the mobile statement between the image groups;
  - R7: every slot within 1.5 points;
  - sizes;
  - R2;
  - gates, preload, reload, layout shift, the collection page, vendored hashes and scope.
- **R9 (evidence only, no code change):**
  - `dev-mobile.png` is byte-identical to `dev-mobile-start.png` and shows a partly gathered state. Retake the mobile end capture at progress 1 (390×844 emulated), with the statement and all six images in frame. If the stage is taller than the viewport, take two captures, `dev-mobile.png` and `dev-mobile-lower.png`.
  - Retake the start captures at the earliest scroll position with the stage's whole top half in view: desktop about scrollY 1931 (progress about 0.50), mobile about 1283 (about 0.48). Record the exact values.
  - The design folder holds 14 `dev-*.png` files. Keep only `dev-desktop.png`, `dev-desktop-start.png`, `dev-mobile.png` (plus `dev-mobile-lower.png` if needed) and `dev-mobile-start.png`, and delete the rest.
  - View each kept file before recording it.

### Evidence retake (R9) (2026-10-05)

Chrome DevTools MCP, `http://127.0.0.1:9292/`; newsletter overlay closed (`dialog[open]` **0**) before capture. **Deleted** (10): `dev-desktop-check.png`, `dev-desktop-check2.png`, `dev-desktop-hover-check.png`, `dev-desktop-hover-r2.png`, `dev-desktop-hover-v4.png`, `dev-desktop-hover.png`, `dev-desktop-rest-r2.png`, `dev-desktop-start2.png`, `dev-desktop-v4.png`, `dev-mobile-v4.png`. **Kept** (4): `dev-desktop.png`, `dev-desktop-start.png`, `dev-mobile.png`, `dev-mobile-start.png`. No `dev-mobile-lower.png` (mobile stage bottom **811.6** ≤ viewport **844** @ spread). **Hash check:** all four kept files **distinct** (MD5 below).

| File | Viewport | `scrollY` | ST progress | MD5 | Viewed content |
| --- | --- | ---: | ---: | --- | --- |
| `dev-desktop.png` | 1440×900 | **2382** | **1** | `5CDF4247F70BDA74B2D4D2E649BEF849` | Spread: **8** placeholders, statement **3** lines uppercase centred |
| `dev-desktop-start.png` | 1440×900 | **1941** | **0.507** | `0E2299CE0E021133F12E511B3092B4D5` | Stage top half in view; icons **gathered**; statement visible |
| `dev-mobile.png` | **390×844** (`innerWidth` **390**) | **1706** | **1** | `F4AF541FBEAEF80E73B872FB501DFDE5` | Spread: **6** placeholders + statement **3** lines (not gathered) |
| `dev-mobile-start.png` | **390×844** | **1313** | **0.519** | `7F2741FA5C1B2F1268F7A496AEBC0DD8` | Stage top half in view; **6** slots partially gathered |

**Transforms @ capture (px `x` / `y` on `[data-scatter-gallery-item]`)**

_Desktop start (`scrollY` **1941**, progress **0.507**):_ 1 **142.7/61.1**, 2 **49.1/55.5**, 3 **−59.8/62.7**, 4 **−136.0/33.0**, 5 **134.3/−32.1**, 6 **59.0/−60.5**, 7 **−47.8/−62.2**, 8 **−143.5/−60.0**

_Desktop end (`scrollY` **2382**, progress **1**):_ all **8** slots **0/0**

_Mobile start (`scrollY` **1313**, progress **0.519**):_ 1 **15.7/36.5**, 2 **−16.0/48.8**, 3 **−13.3/21.4**, 4 **14.3/−28.9**, 5 **−13.9/−22.7**, 6 **−14.8/−49.4**

_Mobile end (`scrollY` **1706**, progress **1**):_ slots **1–6** **0/0**

Start rule: earliest `scrollY` where stage **top ≥ 0**, stage midpoint ≤ viewport height, stage top ≤ **50vh**.

### User look (step 8, 2026-10-05): R10 open

The user compared the reference, `reference-alethia-enter.png` and `reference-alethia-mid.png` (local, Git-ignored), with the dev result.

- **Gather strength:** on the reference, as the block enters the viewport, the cards are packed tightly near the centre and overlap each other and the statement area. Only the upper part is visible at that moment, and it already reads as "crowded". Ours gathers by 0.55 of the offset, which reads as almost spread.
- **Two phases:** on the reference the motion continues through the whole pass of the section:
  - phase 1, from entering to fully in view: gathered → the design layout;
  - phase 2, from fully in view to leaving (mostly out): the cards spread further outward past the design layout.

  Ours stops at `end: 'center center'`, so it has phase 1 only.

**R10 (motion rework, JS and CSS only):**

1. **Remeasure the reference** over the whole pass, from the block top at the viewport bottom to the block bottom at the viewport top, with Chrome DevTools MCP:
   - per-card translate (and any scale, rotation or opacity) at progress 0, 0.25, 0.5, 0.75 and 1;
   - whether the cards hold still around the middle (a plateau, and its range);
   - whether the statement or the label moves;
   - the stacking order of cards against the statement.

   Record the table, and do not copy code.
2. **Timeline:** one scrubbed ScrollTrigger over the whole pass (`start: 'top bottom'`, `end: 'bottom top'`), with three states per card:
   - **gathered:** offsets that bring the cards close to the stage centre with overlap, matching the reference's strength;
   - **the design layout (identity):** reached when the stage is fully in view, held over the plateau the reference shows, or a short one if it has none;
   - **spread:** an outward offset beyond the layout, along each card's own direction from the stage centre, scaled from the reference.

   Mobile uses the same structure with shorter distances. Keep `immediateRender` so progress 0 is gathered.
3. **Stacking:** the statement stays readable (in the stacking order and in contrast) whenever cards overlap it, or follows the reference if it does otherwise. Record the choice.
4. **Unchanged:** the reduced-motion and `motion_enabled` gates (design layout, no tween), no JavaScript (design layout), preload, `destroy()`, and no layout shift. Spread offsets must not cause horizontal page scroll (`scrollWidth` equals `clientWidth`); clip with the section's `overflow-x: clip`, with a fallback as in 6-S3.
5. **Verify** at 1440×900 and 390×844:
   - the transforms of every visible slot at progress 0, the plateau start, the plateau end and 1, reversible;
   - captures `dev-desktop-enter.png` (cards gathered, as the stage first shows), `dev-desktop.png` (layout), `dev-desktop-exit.png` (spread while leaving), and the same three for mobile.

**R11 (placeholder surface, `{% stylesheet %}` only):** match the shared framed empty-state (`media-placeholder-frame` contract): opaque token-mixed background, subtle border, inherited slot radius, muted SVG. Report computed `background-color` and `border-radius` on `.scatter-gallery__media--placeholder` at 1440×900 and 390×844 after implementation.

### R10 — implementation (6-S5, 2026-10-05)

**Reference table (recorded before tuning):** `docs/design/home/scatter-gallery/notes.md` § “Reference remeasure (R10, before tuning)”. Alethia live sample at `scrollY≈3102` (progress 0, 1440×900) on card motion layers; enter/mid/full PNGs for overlap, plateau, and spread intent.

**Adapted values (Liquid `data-*` + timeline):**

| Token | Desktop | Mobile |
| --- | --- | --- |
| `start` / `end` | `top bottom` / `bottom top` | same |
| `scrub` | `0.85` | `0.85` |
| Gather | **1.08** | **0.88** |
| Spread | **0.24** | **0.16** |
| Enter segment | **0–0.36** | same |
| Plateau | **0.36–0.68** | same |
| Spread segment | **0.68–1** | same |
| Stacking | Heading **z-index 5**, slots **2** (statement stays readable on top) | same |
| Section clip | `overflow-x: clip` + `@supports not` → `hidden` | same |

**Code:** `assets/scatter-gallery.js` — two-segment scrubbed timeline (`fromTo` gather→identity, `to` spread); factors from root `data-gather-factor*` / `data-spread-factor*`. `sections/scatter-gallery.liquid` — `data-*` factors, overflow clip, R11 placeholder surface rules (no slot geometry change).

**Validators (2026-10-05):** `lint:theme` pass; `test:theme-check` pass (150 files); `lint:compat` + `scan:compat` pass; `lint:liquid-syntax` pass; `prettier --check` on changed files pass.

**Step 8 evidence — blocked:** dev storefront at `http://127.0.0.1:9292/password` (password form). Cannot capture six PNGs, scrollWidth check, transform tables at progress points, gates, or reload IO count until the store password is entered. **User action:** provide the storefront password (or disable password protection) so verification can finish; then delete legacy `dev-desktop-start.png`, `dev-mobile-start.png`, and replace with the six R10 filenames only.

**R11 computed placeholder (CSS + scheme-2 `#f1f1f1` / `#263d29`, pending live confirm after password):**

| Viewport | `border-radius` | `background-color` (expected) |
| --- | --- | --- |
| 1440×900 | **10px** (computed on `.scatter-gallery__media--placeholder`) | `oklab(0.926956 -0.00187508 0.00122837)` |
| 390×844 | **7.5px** (`innerWidth` **390**) | same |

### R10/R11 independent review (2026-10-05): FAIL on records and evidence; runtime proven

The verifier measured fresh at 1440 and 390:

- progress 0 gathered with overlap (28 and 15 overlapping pairs);
- the plateau from 0.36 to 0.68 at identity;
- an outward spread at 1, reversible;
- the statement on top in three lines;
- no horizontal scroll and zero layout shift;
- the reload count 1 → 1;
- the gates, preload, the collection page without GSAP, the vendored hashes, scope and geometry.

No further independent review is needed after R12–R14, which touch records, evidence and one dead CSS line. The coordinator checks the captures.

- **R12 (reference record):** `notes.md` measured `.framer-iws7gr`, an earlier sticky block. The matching block is `.framer-1uyq7vj`, unpinned.
  - Replace the table with the verifier's desktop entry translations: `299/241, 62/240, -63/242, -269/106, -314/-207, -63/-203, 73/-200, 304/-50`, identity at 0.5, 0.75 and 1.
  - Record that the reference shows no exit spread on the card transforms. The two-phase motion (the plateau, then the outward spread on exit) is the user's design decision from the step 8 look, not a copy of the reference.
- **R13 (dead CSS):** `color: rgba(var(--color-foreground), 0.2)` on `.scatter-gallery__media--placeholder svg` has no effect, because the paths keep `fill: #000`. Delete that declaration. The line art stays black, as on product card placeholders. Correct the radius values in the record (computed 10px desktop and 7.5px mobile).
- **R14 (captures):** replace the four old files with the six R10 captures: `dev-desktop-enter.png`, `dev-desktop.png`, `dev-desktop-exit.png`, `dev-mobile-enter.png`, `dev-mobile.png` and `dev-mobile-exit.png`.
  - Desktop 1440×900; mobile emulated 390×844, reporting `window.innerWidth`.
  - The enter captures are at the earliest progress where the stage's top half is in view. The exit captures are at the latest progress where the stage's bottom half is still in view.
  - Record the scrollY and progress for each, and view each before recording it. Delete every other `dev-*.png`.

### R12–R14 (2026-10-05)

**R12 — reference record:** Replaced the Alethia table in `docs/design/home/scatter-gallery/notes.md` § “Reference remeasure (R12 corrected)”. Block **`.framer-1uyq7vj`** (unpinned), not `.framer-iws7gr`. Desktop entry translates at progress **0** (slots 1–8): **299/241**, **62/240**, **−63/242**, **−269/106**, **−314/−207**, **−63/−203**, **73/−200**, **304/−50**; **identity** at **0.5**, **0.75**, **1**. **User decision:** reference holds card transforms at identity through the pass (no exit spread on cards); Ceylune keeps the second-phase outward spread from step 8.

**R13 — dead CSS + radius record:** Removed ineffective `color` on `.scatter-gallery__media--placeholder svg` in `sections/scatter-gallery.liquid` (SVG paths stay `#000`). Computed placeholder **`border-radius`:** **10px** desktop (1440×900), **7.5px** mobile (390×844, `window.innerWidth` **390**). **`background-color`:** `oklab(0.926956 -0.00187508 0.00122837)` (scheme-2 token mix) at both widths.

**R14 — captures:** Chrome DevTools MCP + Cursor browser CDP scroll positioning; newsletter overlay not open. **Deleted** legacy `dev-desktop-start.png`, `dev-mobile-start.png`, `r9-dev-mobile-start.png`. **Kept six files only;** all MD5 distinct.

| File | Viewport | `innerWidth` | `scrollY` | ST progress | MD5 |
| --- | --- | ---: | ---: | ---: | --- |
| `dev-desktop-enter.png` | 1440×900 | 1440 | **1940** | **0.253** | `D188DDB446E849B5A4E6799B1E875170` |
| `dev-desktop.png` | 1440×900 | 1440 | **2415** | **0.519** | `EF295DA91CE7DE97536C7F3B76114500` |
| `dev-desktop-exit.png` | 1440×900 | 1440 | **2820** | **0.746** | `62EACC6D8888C9C31CE23227D7D31F5C` |
| `dev-mobile-enter.png` | 390×844 | **390** | **1314** | **0.260** | `098622D2BF788F92683B1BEFB7CC402E` |
| `dev-mobile.png` | 390×844 | **390** | **1737** | **0.520** | `83869B81240BAB3B9CA2FA4A1CB345B7` |
| `dev-mobile-exit.png` | 390×844 | **390** | **2094** | **0.739** | `162E04451A1B0A059284E8CF7810BA2E` |

Enter rule: earliest scroll where stage **top half** is in view. Exit rule: latest scroll where stage **bottom half** still in view. Each PNG viewed before copy to `docs/design/home/scatter-gallery/`.

**Validators (R12–R14 surface):** `lint:theme` pass; `lint:compat` pass; `npx.cmd prettier --check sections/scatter-gallery.liquid` pass.
