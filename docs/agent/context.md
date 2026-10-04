# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 6-S1: home slideshow redesign

Status: executed by external prompt 2026-10-04; coordinator review found nine defects and fixed them; independent review round 1 FAIL (three findings), fixed by the coordinator; round 2 PASS (2026-10-04). Waiting on user acceptance in the browser. Review tier **Ask** (Liquid markup and schema, `assets/*.js`, deleted settings and locale keys, a primitive snippet API change). Review: coordinator, then an independent reviewer; both must PASS. User acceptance on the dev server against the design.

### Outcome

`sections/slides-show.liquid` matches `docs/design/home/slides-show/desktop.png` and `mobile.png` (user decisions 2026-10-04, design specification on `docs/agent/board.md`):

- Each slide: background image (desktop) with an optional mobile image, one headline, one link, one body text. Two content areas, each with the existing 3×3 position setting: the headline with its link, and the body text. The small "THE DAILY RITUAL" line in the design is part of the body rich text, not a field.
- Headline uppercase, very large, tight leading (existing `heading_size` / `heading_size_mobile` settings keep sizing). Link: underlined, uppercase, trailing arrow, the theme's `link` snippet.
- Autoplay with progress pagination: the active dot becomes a pill that fills over the autoplay delay; the other slides are dots. Next to it a small pause/play button (WCAG 2.2.2, required for autoplay). Desktop: bottom right. Mobile: bottom right with a bottom gap. Fixed position, no setting.
- Slide transition stays Swiper `fade`. On a slide change the incoming slide's headline group, then body, rise and fade in with a small stagger (CSS only). Never on the first slide at page load.

### Behaviour contract

- Autoplay runs only when the `autoplay` setting is on, the section has 2+ slides, and `prefers-reduced-motion` is not `reduce`. It pauses on pointer hover and while focus is inside the slideshow, resumes after; the pause/play button's state wins over both (a user pause stays paused). Hidden tabs pause (Swiper handles visibility).
- Pagination dots are `<button>`s with "Go to slide N" names and `aria-current` on the active one; pause/play is a `<button>` whose accessible name switches between pause and play. Keyboard arrows keep working. Single slide: no pagination, no autoplay, no pause button.
- The progress fill follows Swiper's `autoplayTimeLeft` event (Swiper autoplay module, already in `assets/vendor-swiper.min.js`; check the vendored version's event name and signature in the file, do not edit it). Paused: the fill holds. Autoplay off: the active pill shows full, no fill animation.
- Theme Editor: `shopify:block:select` on a slide moves to it and pauses; `shopify:block:deselect` resumes if autoplay is on. Section reload remounts cleanly.
- The text transition and the progress fill follow `body[data-motion-enabled='false']` and `prefers-reduced-motion` (no animation, content visible). Autoplay itself follows only `prefers-reduced-motion` and the user's pause.
- No-JS and first viewport: the first slide's image, headline, link and body render visible without JavaScript; pagination may stay hidden until the slideshow mounts. The first slide image keeps `loading: eager` and `fetchpriority: high`.
- Mobile image: when set, phones (below the `pc` breakpoint) load only the mobile image and desktops only the desktop image (`<picture>` with a `media` source), so the LCP image is not downloaded twice. When not set, the desktop image is used everywhere with its focal point.

### Implementation surface

- `sections/slides-show.liquid`: markup, `{% stylesheet %}`, `{% schema %}`.
  - Section settings: keep `color_scheme`, `heading_size`, `heading_size_mobile`, `subtitle_size` (now the body text size), `padding_top`, `padding_bottom`; add `autoplay` (checkbox, default true) and `autoplay_speed` (range, seconds, 3–10, step 1, default 5).
  - Block settings: keep `slide_image`, `headline`, `heading_position` (now positions the headline with its link), `description`, `caption_position` (now positions the body text), `cta_text`, `cta_link`; add `slide_image_mobile` (image_picker); remove `year`, `meta_text`, `meta_position`, `cta_style` and the headers or paragraphs that only served them.
- `assets/slides-show.js`: autoplay, pagination, pause/play, focus and hover pause, Theme Editor block events, cleanup in `destroy`. Keep the module ID, component name and Swiper loading through `carousel-swiper.js`.
- `snippets/image.liquid`: add an optional `mobile_image` parameter that renders a `<picture>` with a mobile `<source>` (below the `pc` breakpoint). Existing callers must render byte-identical output (prove it on at least three callers).
- `locales/en.default.json`, `locales/en.default.schema.json`: new labels and ARIA strings; remove keys only the removed settings used.
- `docs/references/style-system/image-display-contract.md` and the `image.liquid` doc header: document `mobile_image`.
- **Forbidden:** `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, vendor files, validators, `package.json`, other sections, the header.

### Acceptance checks

- S1: schema diff lists exactly the added and removed settings above; no other ID renamed; the preset still works with one block.
- S2: `grep` shows no `year`, `meta_text`, `meta_position`, `cta_style` in `sections/slides-show.liquid`; removed locale keys have no reference (`lint:i18n` unused-key check).
- S3: `image.liquid` callers render identically without `mobile_image` (show the rendered or diffed markup for three callers); with it, one `<picture>`, one `<img>`, the eager and high-priority attributes stay on the `<img>`.
- S4: JS: every listener, timer, Swiper event and Theme Editor subscription created in `init` is removed in `destroy`; single-slide, autoplay off, reduced motion and user pause paths each named with the code that handles them.
- S5: CSS: the text transition never runs on first paint (show the gate); `body[data-motion-enabled='false']` and `prefers-reduced-motion` rules disable the text transition and the fill animation.
- S6: validators: `lint:theme`, `test:theme-architecture`, `test:theme-check`, `lint:liquid-syntax`, `lint:compat`, `scan:compat`, `lint:i18n`, `lint:doc-paths`, and `npx prettier --check` on every changed file.
- S7 (dev server, Chrome DevTools MCP, executor and reviewers): at 1440×900 and 390×844, the first slide matches the design layout (headline top left, link below, body bottom left, pagination bottom right); the hero stays one screen (5-B1); autoplay advances and the fill tracks the delay; pause/play, dot buttons, arrows, hover and focus pause work; no console errors. Screenshots at both widths for the user's comparison.

### Progress

#### S1 — before state (2026-10-04, at batch start)

| Area | Before |
| --- | --- |
| Section settings | `color_scheme`, `heading_size`, `heading_size_mobile`, `subtitle_size`, `padding_top`, `padding_bottom` — no autoplay |
| Block settings | `slide_image`, `headline`, `heading_position`, `year`, `description`, `caption_position`, `cta_text`, `cta_link`, `cta_style`, `meta_text`, `meta_position` |
| Markup | Three content zones (caption with year+body+CTA, headline, meta); no custom pagination; Swiper fade, no autoplay |
| JS | `assets/slides-show.js`: load Swiper via `carousel-swiper.js`, fade, keyboard on container, `slideChange` → `aria-hidden` / `inert`; no Theme Editor block hooks |
| Images | Desktop `slide_image` only through `image.liquid` |

#### S1 — schema diff (after)

- **Section settings added:** `autoplay` (checkbox, default true), `autoplay_speed` (range 3–10 s, default 5).
- **Section settings kept:** `color_scheme`, `heading_size`, `heading_size_mobile`, `subtitle_size`, `padding_top`, `padding_bottom`.
- **Block settings added:** `slide_image_mobile`.
- **Block settings removed:** `year`, `meta_text`, `meta_position`, `cta_style`.
- **Block settings kept:** `slide_image`, `headline`, `heading_position`, `description`, `caption_position`, `cta_text`, `cta_link`.
- **Preset:** still one `slide` block.

#### S2 — removed setting / locale references

- `grep -E 'year|meta_text|meta_position|cta_style' sections/slides-show.liquid` → **0 matches**.
- `npm.cmd run lint:i18n` → **pass** (including unused-key pass after removing `sections.slides-show.options.link` / `button`).

#### S3 — `image.liquid` without `mobile_image`

- Code path: `{%- if mobile_image != blank -%}` wraps `<picture>`; `{%- else -%}` emits only `{{ image_tag_html }}` (unchanged desktop path). Documented in snippet `{% doc %}` and `image-display-contract.md` (`mobile_image` row).
- **Callers checked (no `mobile_image` passed):** `sections/article.liquid`, `sections/main-page-contact.liquid`, `snippets/product-card.liquid` — each still uses the same `render 'image'` argument set as before; with `mobile_image` unset Liquid treats it as blank, so output matches the pre-batch `else` branch (no `<picture>`).

#### S4 — `assets/slides-show.js` lifecycle

- **Single slide:** `_initSwiper` returns after `syncSlideAriaHidden` (no Swiper, controls stay hidden in Liquid).
- **Autoplay off / reduced motion:** `_shouldRunAutoplay` false → Swiper without autoplay module; toggle hidden; `_setProgress(1)` full pill.
- **User / hover / focus / editor pause:** `_userPaused`, `_hoverPaused`, `_focusPaused`, `_editorPaused` gate `_maybeResumeAutoplay` and `autoplayTimeLeft` → `_setProgress`.
- **`destroy`:** unsubscribes `SHOPIFY_BLOCK_SELECT` / `DESELECT`, disposes `ThemeEvents` scope, `swiper.off` slideChange + autoplayTimeLeft, `destroySwiper`, `dispose()` (DOM listeners from `useDisposable`).

#### S5 — text motion and fill gates

- **No first-paint text motion:** `_onSlideChanged` sets `_hasSlideChanged` on first `slideChange` and returns before `_updateTextMotionClasses`; class `is-slides-show-text-enter` only added when `_hasSlideChanged` is already true.
- **CSS:** `body[data-motion-enabled='false']` and `@media (prefers-reduced-motion: reduce)` disable `slides-show-text-rise` and dot-fill transition.

#### S6 — validators (2026-10-04)

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass (after rgba scheme-color fix in `slides-show` stylesheet) |
| `npm.cmd run test:theme-architecture` | **155** tests, **0** fail |
| `npm.cmd run test:theme-check` | **146** files, **0** offenses |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass (includes `build:tw`) |
| `npm.cmd run lint:i18n` | pass |
| `npm.cmd run lint:doc-paths` | pass |
| `npx prettier --check` on changed JS/Liquid | pass |

Changed files (prettier): `assets/slides-show.js`, `sections/slides-show.liquid`, `snippets/image.liquid`.

#### S7 — dev server browser pass (2026-10-04)

- **Server:** `npm.cmd run dev` → `http://127.0.0.1:9292` (store `joey-new-store.myshopify.com`). No storefront password prompt on this run.
- **Viewports:** 1440×900 (desktop), 390×844 (mobile). Screenshots: `docs/design/home/slides-show/dev-desktop.png`, `docs/design/home/slides-show/dev-mobile.png`.
- **Store content:** `templates/index.json` has **one** slideshow block; positions still `heading_position: place-bottom-left`, `caption_position: place-top-left` (legacy merchant JSON) — layout does **not** match design until the merchant moves headline to top-left and body to bottom-left in the Theme Editor.
- **Not exercised on live page:** autoplay, progress fill, pagination dots, pause/play (require 2+ slides). Arrow buttons not rendered for single slide.
- **Console:** no slideshow-specific errors; typical dev noise (CORS on Shopify CDN script, shop.app CSP frame, missing customer-account menu).
- **Swiper:** progress via vendored `autoplayTimeLeft` event (Swiper 11.x in `assets/vendor-swiper.min.js`).
- **Theme Editor:** `shopify:block:select` / `shopify:block:deselect` forwarded in `assets/base.js` → `theme:editor:block-select` / `block-deselect` (`assets/events.js`); handler uses `event.detail.sectionId` / `blockId` (same pattern as `selling-plan-picker.js`).

### Coordinator review (2026-10-04): nine defects, fixed by the coordinator

The executor reported the layout as matching the design; the dev server showed otherwise. Fixed:

1. Headline uppercase and tight leading did not apply on desktop: the responsive tier utility `pc:heading-*` resets `text-transform` and `line-height` from the global typography settings and comes later than `uppercase` / `leading-[0.95]`. Now an unlayered rule in the section stylesheet (`.slides-show-section .slides-show__headline`: uppercase, line-height 0.95, letter-spacing -0.02em); the utility classes are removed. Coordinator decision (user delegated): the hero headline is always uppercase, independent of the global `heading_text_transform`.
2. `snippets/image.liquid`: with `mobile_image` and no `widths`, the `<source>` srcset was empty; it now falls back to one URL at `width` (default 1500).
3. Visible previous/next arrow buttons were added, not in the design; removed with their CSS and the Swiper `navigation` wiring. Keyboard arrows, dots and pause stay. The `previous_slide` / `next_slide` locale keys stay (featured-products, routine-showcase use them).
4. The first slide change never played the text transition (`_onSlideChanged` returned on the first call). The listener is attached after Swiper init, so every call is a real change; the guard is removed.
5. The controls sat on the viewport edge: `display: flex` on the `container-page` element overrode its three-column page grid. The controls are now a `container-page` row with an inner flex row, sharing the copy's gutter (10px on both sides at 390).
6. On phones the full-width body text ran under the controls; the content grid gets bottom room when the section has several slides (`slides-show__content-grid--with-controls`).
7. The controls showed before JavaScript (`display` overrode `[hidden]`); a `[hidden] { display: none }` rule keeps them hidden until mount.
8. The stylesheet's new sizes assumed 1rem = 16px; the root is 62.5% (1rem = 10px). Converted; dot buttons are 24×24 (active pill button 56×24), the pause button 24×24 (WCAG 2.5.8; were 5×5 and 20×20). Media query `rem` values are unaffected.
9. The pill drained instead of filling: Swiper's `autoplayTimeLeft` passes the remaining fraction (1 → 0); now `1 - progress`. Inactive dots no longer show a full fill, and a new slide starts with an empty pill while autoplay runs.

Content (user delegated the decision): `templates/index.json` home slideshow now holds three slides matching the design (headline and link top left, body bottom left, the small label as bold first paragraph of the body), `autoplay` on at 5 s, `heading_size` `heading-4xl`, `heading_size_mobile` `heading-2xl`, `subtitle_size` `body-md`; the orphan `year`, `cta_style`, `meta_*` values are gone. No other section touched.

Dev server (Chrome DevTools MCP): 1440×900 and 390×844, headline uppercase, line-height 0.95 (90px / 85.5px), autoplay advances every 5 s; the fill grows (17.6px → 36.9px over 1.5 s); pause holds the slide for 6 s and the button name switches Pause ↔ Play; dot "Go to slide 2" moves and sets `aria-current`; the incoming slide's headline group and body get the enter class; no overlap of body and controls at 390 (body bottom 800, controls top 819); `scrollWidth` equals the viewport. The MCP window throttles frames (about 700 ms per frame), so a screenshot can catch the fade mid-transition; not a code issue. Screenshots: `docs/design/home/slides-show/dev-desktop.png`, `dev-mobile.png`.

Re-run: `npx prettier --check` on every changed file (bash, one argument per file) passed; `lint:theme` passed; `test:theme-architecture` 155 pass, 0 fail; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax`, `lint:compat`, `scan:compat`, `lint:i18n` and unused keys, `lint:doc-paths` passed.

Remaining differences from the design that are not this section's code: the colour scheme (the design is cream with dark green text; `scheme-1` is dark green with lime text), placeholder images (the store has no slide images), and the page gutter (global `page_margin`, 10px; the design is about 30px at 1440).

### Independent review round 1 (2026-10-04): FAIL, three findings, fixed by the coordinator (static; browser recheck by the reviewer)

1. The visible slide stayed `aria-hidden` and `inert`: `syncSlideAriaHidden` read the `swiper-slide-active` class, which Swiper has not moved yet on `slideChange`, and loop mode reorders the DOM. It now takes the active slide from `swiper.slides[swiper.activeIndex]` (`_activeSlide()`), at init and on every change; without Swiper (one slide) the first slide is the visible one (before, the single slide was hidden). `_updateTextMotionClasses` had the same class dependency and now uses `_activeSlide()` too, so the enter class lands on the incoming slide.
2. Theme Editor block select never arrived: `assets/base.js` (`forwardThemeEditorEvent`) emits on the module root without bubbling, and the listeners were on `document`. They now target `this._root`. The slide index came from the loop DOM order; each slide now carries `data-slide-index="{{ forloop.index0 }}"` and `_getSlideIndexForBlockId` reads it for `slideToLoop`.
3. `motion_enabled` off did not stop the progress fill. With the theme switch off or reduced motion, the script no longer writes progress (the pill is set full once), and CSS keeps the active fill at 100% under `body[data-motion-enabled='false']` and `prefers-reduced-motion` (replacing a no-op `transition: none` on the fill).

Re-run: `npx prettier --check` on every changed file passed; `lint:theme`; `test:theme-architecture` 155 pass, 0 fail; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax`; `lint:compat`; `scan:compat`; `lint:i18n` and unused keys; `lint:doc-paths` passed. Browser not run by the coordinator (user direction 2026-10-04: browser checks belong to the executor and the reviewer).

### Independent review round 2 (2026-10-04): PASS

No findings. Dev server at 390×844, 375×812, 1440×900, fresh loads: after load, ArrowRight, ArrowLeft, every dot (including 0 → 2) and autoplay, the slide with opacity 1 is the only one with `aria-hidden="false"` and no `inert`; the current dot matches its `data-slide-index`; the enter class appears only on the incoming slide's two groups and never at mount. Non-bubbling block select events on the root for indexes 2, 0, 1 landed on those slides and paused autoplay; deselect resumed it. Motion off before mount: autoplay advanced, the pill stayed 48/48px full in 14 samples, no enter class. Single slide: visible, not inert, no Swiper load. Round 1 items held (hover and focus pause 5.5 s, user pause wins, 24×24 targets, layout, no overlap, no slideshow console errors). Unproven: native reduced-motion emulation (code path checked) and a real Theme Editor session (manual step for the user: select a slide block, it shows and stays paused; deselect, autoplay resumes).
