# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 6-S1: home slideshow redesign

Status: planned 2026-10-04; execution by external prompt. Review tier **Ask** (Liquid markup and schema, `assets/*.js`, deleted settings and locale keys, a primitive snippet API change). Review: coordinator, then an independent reviewer; both must PASS. User acceptance on the dev server against the design.

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
