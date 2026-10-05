# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-05.

## Batch 6-S7: `testimonial-featured` redesign as a testimonial marquee

**Status:** accepted by the user (2026-10-05). R5 was confirmed in the user's screenshot after a `shopify theme dev` restart. The user waived a further review of R4 and R5, on the coordinator's static check. Committed.

### Process (user, 2026-10-05)

- The section is accepted on its logic, interaction and a rough look.
- The user takes the pc and mobile screenshots. Detail tuning goes to the Home polish pass on the board.
- The executor does not open the browser.
- The verifier runs non-visual checks only.

### Design

`docs/design/home/testimonial-marquee/` holds `desktop.png` (about 1594 wide), `mobile.png` and `reference-festivent.png`. All three are local and Git-ignored. The reference is https://festivent.ca/, the "Artistes 2026" strip.

- **Heading:** a large two-line heading at the left, "Beyond clients. Trusted partners."
- **Strip:** a horizontal strip of columns. Each column stacks two cards, and alternate columns are offset vertically (about 43px).
- **Card:** a rounded card with the image on the left (about 42% of the card) and an italic quote, star rating and "— Author" on the right. A card without an image shows only the quote and the author.
- **Row colours:** top-row cards are dark green with lime text; bottom-row cards are light.
- **Mobile:** the same strip, with the cards at about 80% of the viewport width.

### Motion (user)

- The strip runs as a marquee. At rest it moves left or right, as configured.
- Page scrolling speeds it up, as the 6-S2 marquee does, and hover pauses it.
- While it runs, each column bobs up and down like the `featured-products` watermark marquee: the `watermark-marquee-bounce` keyframes with a phase offset per column.

### Decisions (user, 2026-10-05)

- **Rewrite `testimonial-featured` in place.** The `testimonial` block keeps `rating`, `quote` and `author_name`, so the home page's three testimonials survive, and gains an optional `image`. What the design does not show is deleted:
  - section settings: `image`, `show_floating_card`, `card_label`, `card_title`, `is_auto_slide`, `slide_delay`;
  - block setting: `author_title`;
  - the Swiper carousel, with `assets/testimonial-featured.js` and its import-map entry, because nothing else uses them.

  This also closes the board's WCAG 2.2.2 note (autoplay without a pause control).
- **Card colours alternate by row.** The section has two card scheme settings: the top row uses the first (default: the dark green scheme with lime text) and the bottom row the second (default: a light scheme). Cards take the blocks in order, column by column (block 1 top, block 2 bottom, block 3 top…).
- **Shared carousel controls:** the board item that tied extraction to `testimonial-featured` is dropped, because the new design has no pagination.

### Outcome

**Settings after the batch**

Section:

| Setting | Status |
| --- | --- |
| `color_scheme` | kept |
| `padding_top`, `padding_bottom` | kept |
| `heading` | **new**, inline richtext, locale default "Beyond clients. Trusted partners." with a line break as in the design |
| `heading_size` | **new**, tier select, as in other sections |
| `card_scheme_top`, `card_scheme_bottom` | **new**, `color_scheme` |
| `marquee_direction` | **new**, right to left or left to right |
| `marquee_speed` | **new**, slow, normal or fast |
| `marquee_pause_on_hover` | **new**, checkbox, default true |

Use the same option labels as the watermark and `scrolling-icon-with-text` settings, reusing locale keys where they exist.

Block `testimonial`: `rating`, `quote`, `author_name` kept; `image` (`image_picker`) **new**; `author_title` **deleted**. Keep the section type, name, block type and preset.

**Reuse the 6-S2 marquee module.** `assets/scrolling-marquee.js` currently looks up `.scrolling-icon-with-text__marquee` and `__track`. Generalize it to data hooks, `[data-scrolling-marquee]` for the moving element and `[data-scrolling-marquee-track]` for the track. The pause button keeps `data-scrolling-marquee-pause`.

- Update `sections/scrolling-icon-with-text.liquid` to carry the hooks, with no behaviour change there.
- The testimonial section mounts the same module, which gives it the velocity-linked rate, hover pause, focus pause, the `motion_enabled` and reduced-motion gates, and the focus-revealed pause button.
- Reuse the `watermark-marquee-x` keyframes for the horizontal loop and `watermark-marquee-bounce` for the column bob, with the section's own custom properties for duration, amplitude and phase. Add no new keyframes unless the existing ones cannot express the motion, and record the reason if you do.

**Markup**

- The heading is an `<h2>`.
- The testimonials are a list (`<ul>` / `<li>`, one `<li>` per card, grouped into columns) inside a labelled region.
- The loop copies are `aria-hidden="true"` and `inert`, as in 6-S2. Render enough copies for a seamless loop with the demo's six testimonials at 1440, following the 6-S2 approach.
- Stars: `snippets/stars.liquid`, plus a visually hidden text through a locale key ("Rated N out of 5").
- Images: through `snippets/image.liquid`, lazy, `alt` from `image.alt`. A block without an image renders the text-only card.
- Quote: the richtext output, italic.

**Gates**

- When `motion_enabled` is off or under `prefers-reduced-motion: reduce`, no animation runs.
- The strip then becomes a horizontally scrollable row (`overflow-x: auto`, scroll snap), so every testimonial is still reachable and readable. The loop copies stay hidden.
- With no JavaScript, the CSS marquee runs as 6-S2's does.

**Styles:** in the section `{% stylesheet %}`, following `docs/references/style-system/css-architecture.md`.

- Tier classes for type.
- Scheme roles via the two card scheme classes.
- `%` and `aspect-ratio` for the card image.
- Plain media queries (no Tailwind functions in the stylesheet).
- Targets from the design are guidance only.

**Demo content** in `templates/index.json`, `testimonial_featured_VedNFm` only:

- remove the deleted settings' keys;
- add `heading` and the card schemes;
- keep the three testimonials, removing `author_title`;
- add three more, so there are six. Use the design copy: the quote "I love the subtle botanical scent and how gentle it feels on my sensitive skin. After a few weeks, my complexion looks brighter and more even.", rating 4, author "Amelia R.". One of them is text only, with author "Ceylune Community".
- images stay blank (placeholders: the card shows a placeholder image with the light scheme surface, as in 6-S5).

The section keeps its current place in `order`.

### Implementation surface

- `sections/testimonial-featured.liquid`
- `assets/scrolling-marquee.js` and `sections/scrolling-icon-with-text.liquid` (the data hooks only)
- `assets/testimonial-featured.js` (deleted) and `snippets/scripts.liquid` (its import-map entry removed, and the `scrolling-marquee` entry kept)
- `locales/en.default.json` and `locales/en.default.schema.json`
- `templates/index.json`: `testimonial_featured_VedNFm` only
- `assets/tailwind.output.css`, generated by `npm.cmd run build:tw` only
- record files and `docs/design/home/testimonial-marquee/notes.md`

**Out of scope:**

- `tailwind/tailwind.animates.css`, unless reusing the keyframes is impossible (then stop and report);
- `snippets/watermark.liquid`;
- colour scheme values;
- other sections.

### Review tier

Ask (Liquid, schema deletions, a JS deletion, a shared module change).

### Rules for the executor

- No browser.
- Never rename, alias or restructure code to get past a lint rule.
- Open board decisions may be cited but not decided.
- Write counts from command output.

### Acceptance checks

1. **Static (executor):**
   - `git diff --stat` and the untracked files stay inside the surface.
   - The schema IDs equal the tables above (compare with a command).
   - No consumer of the deleted settings, locale keys or `testimonial-featured.js` remains (search the theme).
   - `rg "scrolling-icon-with-text__marquee|scrolling-icon-with-text__track" assets` is empty.
   - No Tailwind function appears in the stylesheet.
   - Validators pass: `lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat`, `scan:compat`, `lint:liquid-syntax`, and `npx.cmd prettier --check` on changed files.
2. **User:** pc and mobile screenshots, and a scroll to feel the speed-up and the bob.
3. **Verifier (non-visual, after the user's look):**
   - both marquees run, `scrolling-icon-with-text` unchanged;
   - the velocity-linked rate and hover pause on the testimonial strip;
   - focus pause and the pause button (keyboard reachable, toggles);
   - the loop copies hidden and inert;
   - the `motion_enabled` off and reduced-motion paths give a scrollable row with every testimonial reachable;
   - the star rating's text alternative;
   - no horizontal page overflow.

### Progress

**Implementation (2026-10-05):**

- Rewrote `sections/testimonial-featured.liquid`: `<h2>` heading, column marquee (`scrollingMarquee()`, `data-module-id="scrolling-marquee"`), two-card columns with row schemes, loop copies `aria-hidden` + `inert`, `snippets/starts.liquid` + `snippets/image.liquid`, placeholder SVG for blank images except demo text-only author `Ceylune Community`, section `{% stylesheet %}` reusing `watermark-marquee-x` / `watermark-marquee-bounce`.
- Generalized `assets/scrolling-marquee.js` to `[data-scrolling-marquee]` / `[data-scrolling-marquee-track]`; added matching hooks on `sections/scrolling-icon-with-text.liquid` (classes unchanged).
- Deleted `assets/testimonial-featured.js`; removed its import-map entry from `snippets/scripts.liquid`.
- Locales: updated `en.default.schema.json` and `en.default.json` (removed deleted keys; added heading, card schemes, marquee labels, marquee region aria, defaults); removed top-level `testimonial.defaults.author_title`.
- `templates/index.json` `testimonial_featured_VedNFm`: six blocks (Amelia R. quote/rating 4, Ceylune Community text-only, Jordan K.), new section settings, removed deleted keys.
- `npm.cmd run build:tw` → `assets/tailwind.output.css`.

**Loop copies:** six blocks → `testimonial_column_count = 3`, `testimonial_copies_per_set = 2` (same tiering as 6-S2: more than two items → two copies per set), outer `pass in (1..2)` → **12 column groups** on the track (3 unique columns × 2 copies × 2 passes) for a seamless loop at ~1440px.

**Motion-off / reduced-motion gates:** `body[data-motion-enabled='false']` and `@media (prefers-reduced-motion: reduce)` in section `{% stylesheet %}` — horizontal scroll + snap on `.testimonial-featured__viewport`, animations disabled on track/columns, `[aria-hidden='true']` columns `display: none`.

**Static acceptance:**

- `git diff --stat`: 11 files, 795 insertions, 258 deletions (within surface; `docs/agent/context.md` + `board.md` record updates included).
- Schema IDs: section `color_scheme, heading, heading_size, card_scheme_top, card_scheme_bottom, marquee_direction, marquee_speed, marquee_pause_on_hover, padding_top, padding_bottom`; block `image, rating, quote, author_name` (verified via Node parse of schema JSON).
- No `.liquid` / `.js` consumer of deleted settings or `testimonial-featured.js` (`rg` on `*.{liquid,js}`).
- `rg "scrolling-icon-with-text__marquee|scrolling-icon-with-text__track" assets --glob "*.js"`: **0 matches** (exit 1).
- No Tailwind functions in `sections/testimonial-featured.liquid` `{% stylesheet %}`.

**Validators:**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | pass |
| `npm.cmd run test:theme-check` | pass (150 files, 0 offenses) |
| `npm.cmd run lint:i18n` | pass (including unused-key lint) |
| `npm.cmd run lint:compat` | pass |
| `npm.cmd run scan:compat` | pass |
| `npm.cmd run lint:liquid-syntax` | pass |
| `npx.cmd prettier --check` (changed files) | pass after `--write` on `sections/testimonial-featured.liquid` |

**Out of scope / notes:**

- `templates/page.about.json` still references removed section/block settings (not in implementation surface).
- Plan cites `snippets/stars.liquid`; theme uses `snippets/starts.liquid` (same aria pattern via `components.stars.rating_aria_label`).
- Demo text-only card: blank image + author name `Ceylune Community`; other blank images use `placeholder_svg_tag` (6-S5-style surface).

### User look (R1), 2026-10-05: FAIL; coordinator fix specification

The user's screenshots, against the design:

- the cards are malformed: a 650px empty dark block, the quote overflowing, the image and text not side by side, the stars a few pixels tall;
- the bottom-row light cards are invisible (`scheme-2` equals the section background);
- the mobile heading wraps to four lines;
- the scroll speed-up and the bob are barely noticeable.

**Causes found in the source:**

- `.testimonial-featured__column` uses `width: 80%` inside a `width: max-content` track (a circular percentage), so the cards are sized by their content.
- The bob uses the watermark default `--wm-bounce` of 0.18em, about 3px at card text size.
- The velocity constants are the 6-S2 icon-strip values.

**R1 fixes:**

1. **Card size from the viewport, not the track.**
   - Desktop: card width about `36vw` (design 570 of 1594), with a fixed `aspect-ratio` of about 570/258.
   - Mobile (below 768px): card width about `78vw`, with an aspect ratio of about 1.8.
   - Text-only cards: the same height at about 58% of the card width.
   - The column width equals the card width. No percentage is taken against the track.
2. **Card inner layout:** a grid with the image column at 42% (the image fills the full card height, `object-fit: cover`, no inner padding, the card radius clipping it) and the text column with the quote at the top and a bottom row of stars at the left and "— Author" at the right.
   - The quote is italic at a body tier near 20px desktop and 16px mobile, line-clamped to fit the card.
   - Stars at about 1em of the text.
   - The text padding is about 1.2em.
3. **Light card surface:**
   - The scheme list has no white scheme (scheme-1 is dark green, scheme-2 is `#f1f1f1` like the section, scheme-3 is lime).
   - Bottom-row cards get a white surface (`bg-white`, as the 6-S3 cards do) on top of their scheme, so the text colour still comes from the scheme.
   - This is recorded under the card surface item in the Home polish pass.
4. **Column offset:** columns alternate a vertical offset of about 2.7em through `margin-block-start` (not `transform`, which the bob owns).
   - The parity comes from a global column index that Liquid writes across all loop copies.
   - The column count in half of the track must be even, so the seam keeps the alternation. Report the count.
5. **Bob:**
   - Set `--wm-bounce` on the columns to about `1.2rem` on desktop and `0.8rem` on mobile, with `--wm-bounce-duration` about `3.2s`.
   - `--wm-phase` = the column index modulo 4, so neighbouring columns move out of step.
   - The keyframes stay untouched.
6. **Scroll speed-up:** `scrolling-marquee.js` reads optional `data-scrolling-velocity-k` and `data-scrolling-max-rate` from the marquee element, with the current constants (0.12 and 4) as defaults. The testimonial strip sets about 0.35 and 6. `scrolling-icon-with-text` does not set them, so it is unchanged.
7. **Heading:** pick a smaller tier pair so the heading is two lines on mobile (390) and two lines on desktop, as in the design. Update the schema default and the demo `heading_size` value if they change (`templates/index.json`: this entry's `heading_size` only).

**Process change (proposed to the user):** for visual batches, the executor opens the page itself before reporting, to self-check against the design. This is not evidence; the user's screenshots still decide.

**Out-of-scope note:** `templates/page.about.json` still holds the old testimonial keys. Shopify ignores keys that are not in the schema, so this is listed for the section cleanup sweep, not fixed here.

### R1 execution (2026-10-05)

| R1 item | Change |
| --- | --- |
| 1 Card size | Section CSS vars: mobile `78vw` / ratio `1.8`; desktop (≥768px) `36vw` / ratio `570÷258` (`2.209302`); column width = card width; text-only `58%` width, same height as media cards. |
| 2 Inner layout | 42%/58% grid, no inner padding on media row; `1.2em` text padding; quote `body-md pc:body-lg` + 5-line clamp; meta row stars left / author right; stars `1em`. |
| 3 Light surface | Bottom row: `bg-white` on `testimonial-featured__card--bottom` with scheme text colours retained. |
| 4 Column offset | Global column index across all loop copies; `--offset` class with `margin-block-start: 2.7em` on even indices. **Columns per half-track (one pass):** `2 copies × 3 columns = 6` (even). Total columns on track: **12**. |
| 5 Bob | `--wm-bounce` `0.8rem` mobile / `1.2rem` desktop; `--wm-bounce-duration` `3.2s`; `--wm-phase` from global index mod 4. |
| 6 Speed-up | Marquee `data-scrolling-velocity-k="0.35"` `data-scrolling-max-rate="6"`; JS defaults remain **0.12** / **4** when attrs absent. |
| 7 Heading | Responsive tier map (`heading-h2 pc:heading-2xl` for default); schema default `heading-2xl`; demo `templates/index.json` `heading_size` → `heading-2xl`. |

**Self-check:** `http://127.0.0.1:9292/` returned Shopify CLI **Failed to Upload Theme Files** (`heading` setting: `<br>` not allowed in inline richtext). No visual self-check possible until dev upload succeeds.

**Validators (R1):** `lint:theme` pass; `test:theme-check` pass (150 files); `lint:compat` pass; `scan:compat` pass; `lint:liquid-syntax` pass; Prettier pass on `sections/testimonial-featured.liquid`, `assets/scrolling-marquee.js`, `docs/agent/context.md`.

### R2 (coordinator, from the R1 report, 2026-10-05)

- **Upload blocker:** the plan asked for a line break in the heading, so the demo `heading` holds `<br>`. `inline_richtext` rejects `<br>`, and `shopify theme dev` fails to upload `templates/index.json`.
  - Fix: remove `<br>` from the template value and from the `locales/en.default.json` default.
  - The two lines come from an `em` max-width on the heading.
- **Hard-coded text-only rule:** `testimonial_card_author == 'Ceylune Community'` decides the text-only card. The cause is a contradiction in the plan (blank image = text-only, and demo images blank = placeholders).
  - Fix: a new block checkbox `show_image`, default true. True with a blank image shows the placeholder; false shows the text-only card.
  - The demo "Ceylune Community" block sets it to false.
  - The new setting needs the user's approval, which was asked for in chat.

### R2 execution (2026-10-05)

- Removed `<br>` from `locales/en.default.json` `sections.testimonial-featured.defaults.heading` and `templates/index.json` `testimonial_featured_VedNFm.settings.heading` (plain text: "Beyond clients. Trusted partners.").
- Added `.testimonial-featured__heading` max-width **`10em`** (mobile) and **`11em`** (≥768px) in section `{% stylesheet %}` for two-line wrap.
- Block checkbox **`show_image`** (default true, label in `en.default.schema.json`); Liquid uses it for media vs text-only; removed author-name hack.
- Demo block **`testimonial_Ceylune`**: `"show_image": false`.
- **Upload:** `http://127.0.0.1:9292/` serves home (title `joey-new-store`); no "Failed to Upload Theme Files" after sync.
- **Self-check (390×844 / 1440×900):** heading **2 lines** at both (CDP: mobile `max-width` 200px/10em, desktop ~660px/11em). Cards show 42/58 grid, white bottom row, text-only Ceylune card, placeholders elsewhere. Remaining vs design PNGs: grey `#f1f1f1` section vs sage comp, placeholder SVGs vs photos, demo copy differs from Amelia design quote on some blocks, horizontal gap/marquee density not pixel-matched.
- **Validators:** `lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat`, `scan:compat`, `lint:liquid-syntax`, Prettier — all pass.

### User look (R3), 2026-10-05

The user found mobile acceptable. Desktop issues: the placeholder images have no frame and look odd; the bob should be larger; the scroll speed-up is not felt, here or on the 6-S2 icon strip.

**Causes:**

- `.testimonial-featured__media--placeholder` takes the card's own background with no border, so it merges into the card.
- The bottom card's `bg-white` utility loses to the scheme class background.
- Scroll velocity is in px/ms (a fast scroll is about 2 to 5), so at k 0.12 the rate peaks near 1.5×, which is not perceptible on a 40s loop.

**R3 fixes:**

1. **Placeholder surface:** as the 6-S5 placeholder.
   - Background `color-mix(in oklab, rgb(var(--color-background)) 92%, rgb(var(--color-foreground)) 8%)`, with an `@supports` fallback.
   - A 1px border of `rgba(var(--color-foreground), 0.12)`.
   - It fills the 42% media column of both the dark and the light cards.
2. **Light card surface:** set `background-color: #fff` on `.testimonial-featured__card--bottom` in the section `{% stylesheet %}` (unlayered, so it wins over the scheme background; white is an allowed literal), and drop the `bg-white` utility from the markup.
3. **Bob:**
   - `--wm-bounce` about `2.4rem` from 768px and `1.4rem` below.
   - `--wm-bounce-duration` about `3.6s`.
   - Keep enough block padding on the viewport so the bob is not clipped.
4. **Speed-up:**
   - The testimonial strip gets `data-scrolling-velocity-k="1.2"` and `data-scrolling-max-rate="8"`.
   - The `scrolling-icon-with-text` marquee gets `data-scrolling-velocity-k="1"` and `data-scrolling-max-rate="6"` (attributes only, as the user asked).
   - The module defaults stay at 0.12 and 4.

### R3 execution (2026-10-05)

| R3 item | Change |
| --- | --- |
| 1 Placeholder | `.testimonial-featured__media--placeholder`: 1px `rgba(var(--color-foreground), 0.12)` border; `color-mix` 92%/8% with `@supports` fallback to `rgb(var(--color-background))`. |
| 2 Light card | `.testimonial-featured__card--bottom { background-color: #fff; }`; removed `bg-white` from markup. |
| 3 Bob | `--wm-bounce` `1.4rem` / `2.4rem` (≥768px); `--wm-bounce-duration` `3.6s`; viewport `padding-block` `2rem` / `3rem` (≥768px). |
| 4 Speed-up | Testimonial marquee `data-scrolling-velocity-k="1.2"` `data-scrolling-max-rate="8"`; `scrolling-icon-with-text` `data-scrolling-velocity-k="1"` `data-scrolling-max-rate="6"`. JS defaults **0.12** / **4** unchanged. |

**Validators (R3):** `lint:theme`, `test:theme-check` (150 files), `lint:compat`, `scan:compat`, `lint:liquid-syntax`, Prettier on changed surface files — pass. `git diff --stat`: 11 files (batch cumulative).

**Self-check (390×844 / 1440×900, vs `desktop.png` / `mobile.png`):** No password gate; no newsletter modal. DOM: testimonial `data-scrolling-velocity-k="1.2"` `data-scrolling-max-rate="8"`; icon strip `1` / `6`; bottom card `background-color: rgb(255, 255, 255)` without `bg-white`; placeholder `border-top-width: 1px`. **1440:** heading two lines; media placeholders show tinted panel + border on dark and light cards; bottom row reads white (not `#f1f1f1` section); column stagger + 42/58 cards match structure. **390:** heading two lines; card width ~78vw; light-card placeholder framed; layout consistent with R2 mobile acceptance. **Still vs comps:** section `#f1f1f1` vs sage mockup; SVG placeholders vs photography; demo quotes/authors differ from comp Amelia copy. Scroll speed-up not judged in this pass (user scroll still decides).

### User look after R3 (2026-10-05): PASS

The user accepted both widths and the motion. The remaining design differences (the sage background, demo copy, placeholders against photos, exact sizes) go to the Home polish pass. The `scrolling-icon-with-text` speed-up tuning (k 1, max rate 6) was applied at the user's request through data attributes only.

### Independent review (2026-10-05): FAIL; R4 and R5

Proven:

- both marquees run;
- the icon strip keeps its behaviour;
- the testimonial playback rate peaks at 5.68 and returns to 1;
- the hover, focus and pause button (keyboard, `aria-pressed`);
- the copies `aria-hidden` and inert;
- the `motion_enabled` off path as a scrollable row;
- the rating text alternative and the placeholders;
- no page overflow;
- schema, scope, deletions, module defaults and the stylesheet rules;
- validators.

- **R4 (P1):** `divided_by: 2` floors the column count. Odd counts drop the last testimonial, and the one-block preset renders nothing. Fix: a ceiling count, with the last column holding one card.
- **R5 (P2):** the verifier saw the `show_image: false` block render placeholder media. The source condition looks correct, and the user's R3 screenshot shows that card as text-only. Diagnose (copies, or the dev sync) before changing code.
- **Reduced motion:** the MCP emulation does not take effect (a known tool limit, as in 6-M1). The CSS shares one rule set with the `motion_enabled` path, which is proven. Accepted on static evidence; a real-device check is listed for the final browser pass.

### R4–R5 execution (2026-10-05)

**R4 (P1): column count ceiling**

- `testimonial_column_count = testimonial_block_count | plus: 1 | divided_by: 2` (integer ceiling). Loop-copy tiers unchanged (1 block → 6 copies; 2 → 3; else → 2). Bottom slot skipped when `{%- if testimonial_card_block -%}` is blank (odd last column, top row only).

| Blocks (n) | `column_count` | `copies_per_set` | Columns per half-pass (× copies) | Cards in one unique set | Column → block indices (top / bottom) |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | 6 | 6 (even) | 1 | col1: 0 / — |
| 2 | 1 | 3 | 3 (odd, pre-existing) | 2 | col1: 0 / 1 |
| 3 | 2 | 2 | 4 (even) | 3 | col1: 0/1; col2: 2 / — |
| 5 | 3 | 2 | 6 (even) | 5 | col1: 0/1; col2: 2/3; col3: 4 / — |
| 6 | 3 | 2 | 6 (even) | 6 | col1: 0/1; col2: 2/3; col3: 4/5 |

Global column index / offset parity unchanged (even half-pass column totals except n=2).

**R5 (P2): `show_image` / text-only card**

- **Diagnosis (1440×900, `http://127.0.0.1:9292/`):** All four loop copies of the Ceylune quote render `.testimonial-featured__media--placeholder` (no `testimonial-featured__card--text-only`). Temporary `data-debug-show-image` on those cards logged **`true`** from Liquid (removed before finish). Repo `templates/index.json` → `testimonial_Ceylune.settings.show_image` is **`false`**. **Cause:** dev theme block settings are not applying that JSON value (schema default `true` wins at runtime). Not a copy-loop bug; all copies read the same block object.
- **Section Rendering API:** `?sections=testimonial-featured` returns the section-type preset (~811 bytes, no home blocks). `?sections=21686097576010__testimonial_featured_VedNFm` returned **empty HTML** (len 0) — verifier must use a live instance with synced template JSON, not the type slug alone.
- **Section change (defensive):** read `show_image` with `| default: true, allow_false: true` and treat `false` / `'false'` as text-only (matches `snippets/product-card.liquid` checkbox handling). **Does not fix** the current dev store until `templates/index.json` (or theme editor) persists `show_image: false` on `testimonial_Ceylune`.
- **User action:** confirm `shopify theme dev` uploads `templates/index.json`; re-save the Ceylune block with “Show image” off, or push template JSON. Re-check primary + inert copies for text-only markup.

**Validators (R4–R5):** `lint:theme`, `test:theme-check` (150 files), `lint:compat`, `scan:compat`, `lint:liquid-syntax`, Prettier on `sections/testimonial-featured.liquid` — pass. No Tailwind class changes (no `build:tw` required beyond scan:compat).
