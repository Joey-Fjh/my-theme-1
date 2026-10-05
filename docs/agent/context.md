# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-06.

## Batch 6-S11: new `ritual-steps` section with two scroll styles

**Status:** authorized (2026-10-06); R1 executed; R2–R4 coordinator edits; user look accepted (logic and interaction; proportions, fonts, colours and spacing go to the Home polish pass); Ask review prompt delivered; not committed.

### Design

`docs/design/home/ritual-steps/` holds the following files. All are Git-ignored and local.

| File                                         | Content                                                    |
| -------------------------------------------- | ---------------------------------------------------------- |
| `desktop.png` (943 × 1165, about half scale) | Style A on top, style B below                              |
| `mobile.png` (398 × 947)                     | The mobile card                                            |
| `reference-apocalypse.png`                   | https://apocalypsecoffee.com/, the "sticky steps" block    |
| `reference-still.png`                        | https://www.drinkstill.nz/, the "Three formulations" block |

The design is the visual source; the references give the interaction only.

**Style A ("sticky media").**

- **Left column (about 48% of the content width):**
    - the section heading "THE CEYLUNE RITUAL", very large, uppercase, two lines;
    - per step, a filled sage badge ("01 CLEANSE"), a large uppercase step heading ("REMOVE THE UNNECESSARY."), one line of text, and an uppercase CTA with an arrow and a resting underline.
- **Right column:** a tilted oval (an ellipse rotated about −20°) clips an upright scene photo, with a thin outline ring offset around it and a small four-point star on the ring.

**Style B ("scroll carousel").**

- **Left column:**
    - an italic monospace eyebrow (the section heading);
    - a large uppercase step heading;
    - the badge;
    - the product title in uppercase, its description, the price (monospace italic), and the CTA.
- **Right column:** the product packshot, centred, in front of a huge outline numeral ("01") drawn only as a thin stroke.
- **Navigation:** small "01 02 03" step numbers at the bottom right, with the active one darker.

**Mobile (both styles).** One card per step in a swipeable rail, with dots below. The card (style A) holds the oval scene, the section heading, the badge, the step heading, the text and the CTA.

**Reference measurements** (coordinator, Chrome DevTools at 1440 × 900, 2026-10-06):

- **apocalypsecoffee** (`section.sticky-steps`):
    - the step texts are in normal flow, each about 600px tall;
    - the active step's text has opacity 1 and the others 0.3, with `opacity 0.5s ease-in-out`;
    - the media column holds a `position: sticky; top: 0` frame one screen tall, and the step images cross-fade with `opacity 0.5s ease-in-out`.
- **drinkstill** (`#flavors`):
    - a GSAP pin keeps the section on screen for about 2700px of scroll (3 flavours, about one screen each);
    - scrolling advances the flavour, and the numbers switch it;
    - per the user, the product image swings and the text fades.
    - Automated scrolling did not trigger the flavour change (the site runs its own scroll handling), so its timing was not measured. A soft glow behind the can pulses in scale between 0.95 and 1.03 as ambient motion.

### Decisions (user, 2026-10-06)

- **New section `ritual-steps`.** One section with two styles, chosen by a setting.
- **Home.** Add it after `featured-product`; the coordinator adds two instances, one per style, so both can be seen.
- **Other home sections.** The remaining unredesigned home sections stay as they are. Their code is kept, and which ones stay on home is decided later, when the order is reviewed.
- **No GSAP:** sticky positioning, IntersectionObserver and CSS transitions or keyframes.

### Outcome

**`sections/ritual-steps.liquid` (new).**

Section settings:

| Setting                         | Type                                                         | Use                                               |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| `layout`                        | select: `sticky_media` (A, default) or `scroll_carousel` (B) | the interaction style                             |
| `heading`                       | `inline_richtext`                                            | the section heading: large in A, the eyebrow in B |
| `color_scheme`                  | `color_scheme`                                               | default `scheme-2`                                |
| `padding_top`, `padding_bottom` | `range`                                                      | spacing                                           |

Block `step` (`max_blocks` 5; the preset has 3 steps):

| Setting              | Type              | Use                                                                                                                                          |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`              | text              | "Cleanse"; the badge shows "01 Cleanse" with the number from the block order                                                                 |
| `heading`            | `inline_richtext` | the step heading                                                                                                                             |
| `text`               | `inline_richtext` | step text: style A; style B when the product has no description                                                                              |
| `image`              | `image_picker`    | style A scene in the oval                                                                                                                    |
| `product`            | product           | style B title, description excerpt, price, packshot                                                                                          |
| `product_image`      | `image_picker`    | style B packshot override (a transparent PNG); fallback: the product's featured image                                                        |
| `link_label`, `link` | text, url         | the CTA; label default "Discover the ritual" through a locale key; link fallback: the product URL, then `routes.all_products_collection_url` |

Every user-visible string and schema label goes through locale keys. A placeholder step (no product) renders a placeholder title, the step text and no price. Blank images render placeholders.

**Desktop (≥1024px), style A:**

- **Columns.** Two columns in `container-page`: text 48%, media 52%.
- **Left column.** The section heading once at the top, then one block per step with `min-height` of about 70svh.
- **Active state.** When JavaScript runs (an enhanced class on the root), inactive steps sit at opacity 0.3 and the active one at 1, with a 500ms ease-in-out transition. Without JavaScript every step is fully opaque.
- **Right column.** A `position: sticky; top: 0` frame `100svh` tall, centred, holding one scene layer per step.
    - Layers are stacked; only the active one is visible, cross-fading over 500ms.
    - Inactive layers end at `visibility: hidden` and `aria-hidden` is not needed.
    - Without JavaScript, layer 1 shows.
- **Oval.**
    - A portrait box (aspect about 0.72, height about 70% of the frame) with `border-radius: 50%` and `overflow: hidden`, rotated about −20°.
    - The image inside is counter-rotated so the photo stays upright and covers the oval.
    - A second, slightly larger ellipse with a 1px foreground border at low opacity, offset a few percent, is the ring.
    - A small four-point star sits on the ring's upper right as an icon asset (Phosphor `sparkle`, MIT, the same set as `icon-content-*`, through `npm.cmd run build:svg`). No inline SVG.
- **Active step.** It changes when a step's text crosses the viewport's vertical centre: an IntersectionObserver with `rootMargin: '-50% 0px -50% 0px'`.

**Desktop (≥1024px), style B:**

- **Pin.** With JavaScript (the enhanced class), the section is `steps × 100svh` tall and holds a `position: sticky; top: 0` stage `100svh` tall. The stage keeps its own two-column layout in `container-page`.
- **Without JavaScript,** the section is one stage tall, shows step 1 and hides the numbers.
- **Progress.** Invisible sentinel elements, one per step, each `100svh` tall, are stacked inside the tall section. An IntersectionObserver on the centre line selects the active step, so scrolling down or up moves one step per screen.
- **Numbers.** Bottom right, "01 02 03": `<button>`s with locale-key accessible names ("Go to step 2") and `aria-current="step"` on the active one. A click scrolls the page to that step's sentinel, smooth unless reduced motion, so the scroll position and the active step never disagree.
- **Step content.** Stacked absolutely in the left column. Only the active step is visible: inactive steps are `visibility: hidden` once their fade-out ends, so their links leave the Tab order.
    - The text fades out and in over about 400ms with a 1rem rise.
- **Packshot.** It swings on every step change: a CSS keyframe, `transform-origin: top center`, rotate −8° → 5° → −2° → 0 over about 900ms ease-out, with a cross-fade between packshots.
- **Outline numeral.** A huge zero-padded step number behind the packshot, transparent fill with a thin stroke at low opacity in the scheme foreground (`-webkit-text-stroke` with a standard fallback). It cross-fades with the step.
- **Theme Editor.** Selecting a step block (`shopify:block:select`) activates that step, in both styles and on mobile.

**Mobile (<1024px), both styles:**

- **Rail.** A native horizontal scroll-snap rail, one full-width card per step, with dots below as `<button>`s (locale-key names, `aria-current`).
- **Dots.** A dot click scrolls the rail to its card. An IntersectionObserver rooted on the rail updates the active dot when the user swipes.
- **Cards.**
    - Style A: the oval scene, the section heading, the badge, the step heading, the text and the CTA.
    - Style B: the packshot with the outline numeral, the eyebrow, the step heading, the badge, the product title, the description, the price and the CTA.
- **Heading copies.** The section heading copies inside the cards are `aria-hidden="true"` and are not heading elements. There is exactly one real section heading (the 6-S8 pattern).
- **No pinning or sticky** on mobile.

**Motion gates.**

- With `motion_enabled` off or `prefers-reduced-motion: reduce`: no swing, no fades and no rise; changes are instant. Scrolling, numbers and dots still switch steps; smooth scrolling becomes instant.
- Without JavaScript: style A shows all text and the first scene; style B shows step 1 unpinned; the mobile rail still swipes, and the dots do nothing.

**`assets/ritual-steps.js` (new).**

- An Alpine component registered with `define()`, plus an entry in the `snippets/scripts.liquid` import map.
- It handles the enhanced class, the observers, the number and dot clicks, and the editor block select.
- `destroy()` removes every observer and listener.
- No GSAP.

**`templates/index.json`.** Two new entries right after `featured_product_pFb7bJ` in the order: `ritual_steps_sticky` (style A) and `ritual_steps_carousel` (style B), each with 3 steps:

| Step | Label   | Heading                   | Text                                            |
| ---- | ------- | ------------------------- | ----------------------------------------------- |
| 1    | Cleanse | "Remove the unnecessary." | "Gentle cleansing for fresh, balanced skin."    |
| 2    | Treat   | "Restore what matters."   | "Targeted care for clearer, calmer skin."       |
| 3    | Protect | "Seal in the balance."    | "Daily protection that keeps skin comfortable." |

- Section heading: "The Ceylune Ritual".
- Products (style B): the dev store's `casual-knitted-shirt3`, `casual-knitted-shirt2` and `casual-knitted-shirt4`.
- Images stay blank.

### Implementation surface

- `sections/ritual-steps.liquid` (new)
- `assets/ritual-steps.js` (new)
- `assets/icon-sparkle.svg` (new, through `build:svg`)
- `snippets/scripts.liquid` (one import-map entry)
- `locales/en.default.json` and `locales/en.default.schema.json` (`ritual-steps` keys only)
- `templates/index.json` (the two new entries and their order lines only)
- `assets/tailwind.output.css` (generated rebuild)

Temporary files go to the system temp directory, never the project root.

### Review tier

**Ask.** A new section, schema and `assets/*.js`, run from an external execution prompt.

### Acceptance checks

**Gates:**

- `npm.cmd run lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat` and `lint:liquid-syntax` pass.
- Prettier passes on the changed files.
- `shopify theme dev` syncs (restart it if stale).

**Non-visual browser checks** (1440 × 900 and 390 × 844, numbers in the report):

1. **Style A.**
    - The media frame computes `position: sticky` and `top: 0px`.
    - Scrolling so that step 2's text crosses the centre makes step 2 active: text opacity 1, the others 0.3, and only scene layer 2 visible after 500ms.
    - Scrolling back reverses it.
    - Every step's CTA is reachable by Tab.
2. **Style B.**
    - The section height equals steps × viewport height (±2px), and the stage computes `position: sticky`.
    - Scrolling one viewport advances exactly one step; scrolling back reverses it.
    - Clicking number 3 scrolls to step 3 and sets `aria-current` on it.
    - Inactive steps' links are not reachable by Tab.
    - The packshot runs the swing keyframes on a change: read the animation name and its running state.
3. **Gates.**
    - With `motion_enabled` off and with reduced motion, no animation or transition runs on a change (duration 0 or none), and steps still switch.
    - With JavaScript off, style A shows all texts and scene 1, and style B shows step 1 at one stage tall with the numbers hidden.
4. **Mobile.**
    - No sticky elements.
    - Swiping to card 2 sets dot 2 current, and clicking dot 3 scrolls the rail to card 3.
    - No horizontal page overflow.
    - Exactly one real section heading per section instance.
5. **Theme Editor.** A `shopify:block:select` event for step 3 activates step 3. Dispatch it on the block element if the editor is unavailable.
6. **Cleanup.** No console errors. After `destroy()` no observer or listener remains.

Visual detail (fonts, including the monospace italic; colours; the oval angle; the ring and star placement; sizes) is out of scope for review and goes to the Home polish pass.

### Execution (2026-10-06)

**Changed files:** `sections/ritual-steps.liquid`, `assets/ritual-steps.js`, `assets/icon-sparkle.svg`, `snippets/scripts.liquid` (import map), `locales/en.default.json`, `locales/en.default.schema.json`, `templates/index.json`, `assets/tailwind.output.css` (rebuild).

**Validators:**

| Command                                 | Result                       |
| --------------------------------------- | ---------------------------- |
| `npm.cmd run lint:theme`                | pass                         |
| `npm.cmd run test:theme-check`          | pass (151 files, 0 offenses) |
| `npm.cmd run lint:i18n`                 | pass                         |
| `npm.cmd run lint:compat`               | pass                         |
| `npm.cmd run lint:liquid-syntax`        | pass                         |
| `npx prettier --check` on changed files | pass                         |

**Icon:** Phosphor `sparkle` downloaded to temp, built via `npm.cmd run build:svg` → `assets/icon-sparkle.svg`; `icons/` removed.

**Deviations / notes:**

- Style B eyebrow and price use italic body tiers only (no `font-mono`); `lint:theme` rejects `font-mono`. Design monospace italic deferred to Home polish.
- Outline numerals use `calc(var(--font-heading-scale) * …rem)` instead of viewport-based `clamp`.
  **Browser (1440×900 / 390×844):**

| Check                                        | Result                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A sticky frame                               | `position: sticky`, `top: 0px`                                                                                      |
| A step 2 active                              | text opacities 0.3 / 1 / 0.3; scene layer 2 `opacity: 1`, layer 2 `visibility: hidden` on inactive after transition |
| B pin height                                 | `2700px` (= 3 × `900px` viewport, Δ 0)                                                                              |
| B stage                                      | `position: sticky`, `top: 0px`                                                                                      |
| B scroll 1×vh                                | steps `0 → 1 → 2`, scroll back → `1`                                                                                |
| B click “03”                                 | `aria-current="step"` on index 2 (desktop nav); dots duplicate nodes in DOM query                                   |
| B swing                                      | `ritual-steps-swing`, `0.9s`, `running` on step change                                                              |
| Motion off (class removed)                   | panel `transition-duration: 0s`                                                                                     |
| No JS                                        | not re-tested this pass                                                                                             |
| Mobile sticky inside ritual root             | none visible (`stickyInRitual: []`)                                                                                 |
| Mobile dot 3                                 | `aria-current="true"` on dot index 2; `scrollLeft` 778 vs card3 `843` (−65px; snap may still align visually)        |
| Page horizontal overflow                     | false                                                                                                               |
| Visible `h2` per instance                    | 1 each (2 in DOM, one `pc:hidden`)                                                                                  |
| `theme:editor:block-select` on carousel root | step `0 → 2` (`step_protect`)                                                                                       |
| `destroy()`                                  | observers `1 → 0`, `ritual-steps--enhanced` removed                                                                 |
| Console                                      | theme/vendor noise (400/404, shopify-account); no ritual-steps errors                                               |

**Follow-up:** inactive carousel panel links still report `tabIndex: 0` in script while parent `visibility: hidden` — verify Tab order manually if needed.

### Round R2 (coordinator direct edit, user look, 2026-10-06)

**User look:** style A put the text in the right half with an empty left half, showed no oval, stretched the badge across the row, and set the headings in mixed case.

**Causes and fixes:**

- **Columns.** Both desktop grids also carried `container-page`, whose `& > * { grid-column: 2 }` forced both columns into the second track of the section's own 48/52 template. The text landed on the right, and the media dropped below it, out of view.
    - `container-page` is removed from `.ritual-steps__sticky-grid` and `.ritual-steps__carousel-grid`.
    - The page width now comes from `padding-inline: max(var(--page-margin), calc((100% - var(--page-width)) / 2))`.
- **Breakpoint.** The mobile and desktop wrappers used the `pc:` utilities (768px). They now switch at `min-width: 64rem` in the stylesheet, as the plan requires.
- **Badge.** `align-self: flex-start; width: fit-content` in the flex column.
- **Uppercase.** The heading tiers set `text-transform` from a theme variable, which overrode the `uppercase` utility. The step headings now carry `ritual-steps__step-heading`, and the stylesheet sets uppercase on them and on the style A section heading.
- **Validators:** Prettier, `lint:theme`, `lint:compat` and `test:theme-check` pass.

### Round R3 (coordinator direct edit, user look on R2, 2026-10-06)

**User look:**

- Style A's sticky media was broken; the later steps spread below with an empty band.
- The oval was a thin sliver.
- Style B differs from the design: the packshot and numeral are tiny, the content is bunched in the middle, the swing is barely visible, and the numbers sit outside the page margin.
- Rule (user): a section may be full-bleed, but its content keeps the page width and margins.

**Causes and fixes:**

- **Style A, sticky.** The media column was only `min-height: 100svh` in a grid with `align-items: start`, so the sticky frame had no room to stick. The grid now uses `align-items: stretch`.
- **Style A, step slots.** Each step slot is `100svh` tall with its content centred. The section heading moved into the first step's slot (rendered once, `h2`), so the active step sits beside the oval.
- **Oval.** The box is 76% of the frame height with `aspect-ratio: 0.7` (the width no longer capped at 22rem). The clip is inset 4% 6% and rotated −22°; the image is counter-rotated and scaled 1.35 to cover. The ring is offset and rotated −22°, and the sparkle sits on the ring's upper right.
- **Style B, layout.**
    - The stage grid stretches and pads `9svh` / `11svh`.
    - Each panel spreads between the step heading at the top and a new `ritual-steps__panel-detail` group at the bottom: badge, title, text, price, CTA.
    - The packshot box fills the media column height (inset 0 24%) with the image anchored bottom-centre.
    - The outline numeral is `calc(var(--font-heading-scale) * 26rem)`, italic.
- **Swing.** A stronger rock from the base (`transform-origin: 50% 100%`): −10° → 7° → −4° → 1.5° → 0 over 1100ms.
- **Numbers.** Positioned with the page-width inset (`right: max(var(--page-margin), calc((100% - var(--page-width)) / 2))`), `bottom: 4svh`.
- **Validators:** Prettier, `lint:theme` (after replacing a literal `svh` font size), `lint:compat`, `lint:liquid-syntax` and `test:theme-check` pass.
- **Incident.** A `sed -i` edit left a transient `sections/sedXXXX` file that `shopify theme dev` failed to upload; the dev server needs a restart. `sed -i` is no longer used on theme files.
- **Browser check** (coordinator, 1440 × 900, after the dev restart):
    - **Style A:** the media frame stays at `top: 0` through all 3 steps; the text opacity reads 1/0.3/0.3, then 0.3/1/0.3, then 0.3/0.3/1; the oval is 479 × 684 (ratio 0.70).
    - **Style B:**
        - the pin is 2700px (3 × 900) and the stage sticks;
        - the step heading sits at the top of the panel (y 127) and the details at the bottom (y 572 to 801);
        - the packshot box is about 367 × 720;
        - the numeral is 260px;
        - the numbers sit at x 1330 to 1415, inside the 10px page margin.
    - **Fix:** the last step had only half a screen of dwell while the middle step had a full screen.
        - The sentinel track now starts at `50svh`, and each sentinel is `(steps − 1) / steps × 100svh`.
        - The measured switches are at 0.67 and 1.33 screens of the 2-screen pin.
        - The number clicks land on the right step, and `ritual-steps-swing 1.1s` runs on a change.

### Round R4 (coordinator direct edit, user look on R3, 2026-10-06)

**User look:** better; what remains is proportions and spacing. In style A, only step 1 had the big title, so the later steps felt abrupt; the user asked to add it to each step.

**Fixes:**

- **Style A, title.** Steps 2 and later render the section title through the `heading` snippet with `attrs: 'aria-hidden="true"'`. Every slot matches the design composition, and assistive technology still gets one section heading (measured: step 1 `h2` with no `aria-hidden`; steps 2 and 3 `aria-hidden="true"`).
- **Badges.** The tier is now `body-sm pc:body-lg` (18px at 1440), with padding `0.4em 0.85em`, a sage mix of the foreground (62%) and light text.
- **CTAs.** The `link` variant is now `default` (a resting underline, per the design).
- **Style B.**
    - The product title is now an `h4` at `heading-h6 pc:heading-h4`, uppercase. The lint forbids heading tiers on `p`.
    - The price is `body-lg pc:body-xl` italic.
    - The description is truncated to 18 words.
    - The detail gap is `1.75rem`.
- **Spacing.** The style A step slot gap is `2rem`, and the section title margin is reduced so the title sits closer to the badge.
- **Validators:** Prettier, `lint:theme`, `lint:liquid-syntax` and `test:theme-check` pass.

### Review R1 (verifier, 2026-10-06): FAIL, 2 findings, fixed by the coordinator

- **P2, desktop style A CTA fallback.** A blank link went straight to the all-products collection, skipping the plan's product URL step; mobile already had the full chain. Fix: link → `block.settings.product.url` → `routes.all_products_collection_url`.
- **P2, mobile style B product title was a `p`.** It is now an `h4` (`heading-h6`, uppercase) linking to the product, matching desktop.
- **Validators after the fixes:** Prettier, `lint:theme`, `lint:liquid-syntax` and `test:theme-check` pass.
- **Everything else proven by the verifier:**
    - schema and locales;
    - style A sticky and centre-line switching;
    - style B pin 2700, switches at 600 and 1200, numbers, Tab exclusion, swing;
    - mobile dots and overflow;
    - one exposed `h2` per instance;
    - motion-off, reduced motion and JavaScript off;
    - the editor block select;
    - `destroy()`;
    - the sparkle SVG.
- **Unproven:** native Theme Editor forwarding in a real editor session; style A with a configured product (fallback read from Liquid).

### Re-check (verifier, 2026-10-06): PASS

- Both fixes are confirmed: the style A CTA chain, and the mobile style B titles as `h4` links.
- There is still one exposed section `h2` per instance at both widths.
- **Limit:** the new section file has no prior snapshot, so a byte-for-byte proof that only two spots changed is not possible.
