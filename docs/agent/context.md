# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 6-S2: home marquee (`scrolling-icon-with-text`) redesign

**Status:** executed; independent review round 2 PASS 2026-10-05 (R1–R5 closed). Statically verified only: forced `:hover`, touch tap, reduced motion. Awaiting commit.

**Design:** `docs/design/home/scrolling-icon-with-text/` contains:

- `desktop.png`: the page at about 1440 wide, with the bar directly under the slideshow;
- `mobile.png`: about 390 wide;
- `detail.png`: a close-up of the bar.

The design shows:

- a full-width lime bar, with no gap above or below;
- dark green text: one phrase, "NEW IN 50% Discount", followed by a `*` separator, repeated;
- no icons;
- no divider lines.

**Decisions (user, 2026-10-04):**

- Colour comes from a new colour scheme (the mainstream path), not a section background option. Adding `scheme-3` to `config/settings_data.json` is explicitly approved.
- No visible pause button. Hover pause stays. Keyboard users get a pause button that is invisible until it receives keyboard focus (coordinator addition for WCAG 2.2.2; drop it if the user vetoes).
- Keep the per-item icon setting. The separator is a text setting.
- Scroll-linked speed: scrolling makes the marquee run faster; it never reverses. The direction setting stays authoritative.
- Demo content and placement are approved: the section moves directly under the slideshow, with the design's text.

**Outcome:** the section keeps its type, its name and its block type `item`. Settings change as follows.

- **Removed:** `height` and `content_scale`. The bar height now follows the text plus vertical padding. All the Liquid that derives sizes from them goes too: `scrolling_icon_size*`, `scrolling_icon_text_gap`, `--scrolling-icon-height`, `--scrolling-content-scale-pct`, `--font-scrolling-icon-title-size`.
- **Added:**
  - `text_size`: a select over typography tiers. The executor picks the tiers that match the design: desktop text is about 38–40px at 1440, mobile about 16px at 390. Choose a default tier that is responsive across both, or two selects if no single tier fits. Record the choice.
  - `bar_padding`: a range in px for the vertical padding inside the bar. The design bar is about 90px tall at 1440 and about 45px at 390.
  - `separator`: text, default `*`.
- **Kept:** `color_scheme`, `direction`, `speed`, `gap`, `pause_on_hover`, `section_width`, `show_divider`, `padding_top`, `padding_bottom`. Item icons are kept; an item icon scales with the text (about 1em) instead of with the height.
- **Separator:** rendered after every item, including in duplicate copies, so the loop seam stays even. It is `aria-hidden="true"` and not rendered when blank.
- **Scroll-linked speed:** a new module (for example `assets/scrolling-marquee.js`, registered in the import map, mounted by `data-module-id`). JS only modulates the existing CSS animation through `animation.updatePlaybackRate()`. Without JS the CSS loop runs unchanged.
  - **Shared listener:** exactly one passive `scroll` listener for all instances, at module scope, handled with requestAnimationFrame. It is added when the first instance mounts and removed when the last unmounts.
  - **Visibility:** each instance registers in a Set and is updated only while an IntersectionObserver reports it intersecting.
  - **Rate:** `1 + k * |velocity|`, capped at 4, eased back to 1 within about 0.8s after scrolling stops. It never goes negative.
  - **When the rate is not applied:** motion off (`motionEnabled()`), reduced motion, hover pause, focus pause, or the user pause button pressed.
  - **Cleanup:** `destroy` removes the instance, its observer and, if it was the last instance, the listener.
- **Pause:**
  - hover (existing, unchanged);
  - `:focus-within` on the marquee;
  - a `<button>` with a locale-key accessible name, visually hidden until `:focus-visible`. It toggles a `data-paused` state that sets `animation-play-state: paused`, and has `aria-pressed`.
- **Accessibility:** the duplicate-copy rules stay as they are (`aria-hidden`, `tabindex="-1"` links). The motion-off and reduced-motion static fallbacks stay: wrapped, centred, duplicates hidden.
- **Colour scheme `scheme-3`** in `config/settings_data.json`, in both the current `color_schemes` and the preset copy. Values:
  - background `#d5ff83`, no gradient;
  - text, border and focus ring `#263d29`;
  - primary button: background `#263d29`, label `#d5ff83`, border `#263d29`;
  - secondary button: background `rgba(0,0,0,0)`, label `#263d29`, border `#263d29`;
  - accent `#263d29`;
  - inputs, badges and feedback colours copied from `scheme-2`.
- **Demo content** in `templates/index.json`:
  - move `scrolling_icon_with_text_XWFBb9` in `order` to directly after `main`;
  - replace its four items with one item: title "NEW IN 50% Discount", icon `none`, no link;
  - settings: `color_scheme` `scheme-3`, `section_width` `full`, `show_divider` false, `padding_top` 0, `padding_bottom` 0, `direction` `right_to_left`; tier, padding and gap tuned to the design.

**Implementation surface:**

- `sections/scrolling-icon-with-text.liquid` (markup, stylesheet, schema);
- `snippets/icon-with-text-item.liquid`, only if the icon-size parameter must accept a non-px value; do not change its other consumers' output;
- `tailwind/tailwind.animates.css` (the scrolling-icon block only);
- the new module JS and its import-map entry in `snippets/scripts.liquid`;
- `locales/en.default.json` (pause and play labels) and `locales/en.default.schema.json` (new settings; remove keys that become unused);
- `config/settings_data.json` (`scheme-3` only);
- `templates/index.json` (this section's entry and its `order` position only);
- `assets/tailwind.output.css` (generated by `npm.cmd run build:tw`);
- record files and `docs/design/home/scrolling-icon-with-text/dev-*.png`.

Out of scope: other marquees (`watermark`, `featured-products`), GSAP, other sections, other schemes' values.

**Review tier:** Ask.

**Acceptance checks:**

1. Static:
   - `git diff --stat` stays inside the surface. In `settings_data.json`, only the two `scheme-3` additions appear.
   - The schema no longer has `height` or `content_scale`, and no Liquid or CSS references them or the removed variables (`rg`).
   - The section type, the block type `item` and the preset name are unchanged.
   - The module file has exactly one `addEventListener('scroll'`, with `{ passive: true }`.
2. Validators pass:
   - `npm.cmd run lint:theme`
   - `npm.cmd run test:theme-check`
   - `npm.cmd run lint:i18n`
   - `npm.cmd run lint:compat`
   - `npm.cmd run scan:compat`
   - `npm.cmd run lint:liquid-syntax`
3. Browser, home page, 1440×900 and 390×844. Measure; 1rem = 10px (a computed root of 12px is Chrome clamping; measure a rem box).
   - The marquee's top equals the slideshow's bottom (difference 0 ±1px). The bar spans the viewport width.
   - Bar height is about 90px (±8) at 1440 and about 45px (±6) at 390.
   - Item text `font-size` falls within the design ranges in Outcome.
   - Computed background `rgb(213, 255, 131)` and text colour `rgb(38, 61, 41)`.
   - The separator `*` is present between repeats and `aria-hidden`. No icon renders for the demo item.
   - The loop is seamless: no visible jump at the seam. Sample the track `transform` across one duration and judge by state.
   - Scroll speed: at rest, `track.getAnimations()[0].playbackRate` is 1. During a programmatic scroll (for example `scrollBy` steps in rAF over 500ms) it rises above 1 and never above 4. It returns to 1 within 1.2s after scrolling stops. With `left_to_right`, the visual direction stays left-to-right while scrolling up and down.
   - **Two instances:** temporarily add a second instance on the dev store (duplicate the entry in `templates/index.json`, then revert so it is absent from the final diff). Both speed up while visible. An off-screen instance keeps rate 1. The page has one scroll listener: instrument `addEventListener` before load, or check statically.
   - **Pause:**
     - hover pauses the animation (`animationPlayState` is `paused`);
     - Tab focus reveals the pause button, at least 24×24 and visible;
     - activating it pauses and sets `aria-pressed="true"`;
     - scrolling while paused leaves the animation paused;
     - blurring the button hides it again.
   - **Motion off and reduced motion:** with `body[data-motion-enabled='false']` the static fallback shows and the rate stays 1 (no errors). Reduced motion: check statically if the MCP cannot emulate it.
   - **Theme Editor section reload** (or `replaceRegion`): after a reload, the scroll listener count is still 1 and the speed-up still works.
   - No new console errors.
   - Dev screenshots `dev-desktop.png` and `dev-mobile.png` at both widths have different md5 hashes.

**Progress:** R5 remediation executed 2026-10-05 (Implementer). R1–R4 and F1–F8 remain verified; awaiting re-review.

**Coordinator fixes (F1–F6):**

- **F1:** `subscribeScrollVelocity()` in `assets/utils.js` (single passive `window` scroll listener + rAF). `assets/scrolling-marquee.js` subscribes per instance and unsubscribes in `destroy`; **no** `addEventListener` in the module (`rg -n addEventListener assets/scrolling-marquee.js` → empty).
- **F2:** Playback-rate easing runs only while visible and `(target ≠ 1 ∨ current ≠ 1)`; loop stops at rate 1. No `getComputedStyle` in the rate path (uses `animation.playState` + pause flags).
- **F3:** `text_size` uses real **heading** tier utilities (`heading-h1` … `heading-h5`) on title and separator; removed `data-text-size` calc ladder. Default **`heading-h1`** (measured **40px** desktop / **30px** mobile at 1rem = 10px). Unlayered `.scrolling-icon-with-text-section` rules set `line-height: 1`.
- **F4:** Fixed `aria-label` (`accessibility.marquee_pause` only) + `aria-pressed`; visible **play** triangle when pressed; removed `marquee_play` and `data-label-*`.
- **F5:** Mobile padding `calc(var(--scrolling-bar-padding-y) * 0.6)` (proportional, not `min(14px, …)`).
- **F6:** Schema option labels under `sections.scrolling-icon-with-text.options.heading_h*`.

**Settings (index demo):** `text_size` **heading-h1**, `text_size_mobile` **body-xl**, `bar_padding` **24**, `gap` **8** (sole space after `*`; phrase→`*` via `0.5em` on separator), `separator` **\***, `color_scheme` **scheme-3**, `direction` **right_to_left**, padding 0, full width, no divider.

**Module:** `scrolling-marquee` / `scrollingMarquee()`.

**Validators (all pass):** `lint:theme`, `test:theme-check` (146 files), `lint:i18n`, `lint:compat`, `scan:compat`, `lint:liquid-syntax`.

**Browser (Chrome DevTools MCP + `shopify theme dev`, home):**

| Check | 1440×900 | 390×844 |
| --- | --- | --- |
| Slideshow → marquee gap | 0px | 0px |
| Bar height | 88px | ~44.5px |
| Title `font-size` | 40px | ~15.75px |
| Separator `font-size` | 40px (matches title) | ~15.75px (matches title) |
| Title `line-height` | 40px (`line-height: 1`) | ~15.75px (`line-height: 1`) |
| Background / text | `rgb(213, 255, 131)` / `rgb(38, 61, 41)` | same |
| `playbackRate` rest | 1 | 1 |
| During scroll-speed boost (visible instance; MCP supplements missing native `scroll` events with `dispatchEvent('scroll')` after `scrollBy`, plus velocity path verified via `_onSharedScroll(30)`) | peak **~1.55** (≤4) | — |
| ~1.2s after boost ends | **~1** | — |
| Visual hover pause | CSS only: `:hover` inside `@media (hover: hover) and (pointer: fine)` → `animationPlayState` **paused** (static / DevTools **:hover** force state; MCP pointer hover does not apply `:hover`) | — |
| Speed-up while hovered (`_hoverPaused`) | `pointerenter` / `pointerleave` with `pointerType === 'mouse'` only (no touch sticky pause) | — |
| Focus pause | **paused**; button **24×24**, opacity **1** on `:focus-visible` | — |
| Button pause | `aria-pressed="true"`, play glyph (`::before` border **8px**), track **paused** | — |
| Motion off | `flex-wrap: wrap`, duplicate items hidden | — |
| Idle rAF | Marquee module `_rateRaf` **0** at rest after boost; page-level rAF continues from slideshow (expected) | — |

**Two-instance test:** temporary duplicate in `index.json` (reverted); with scroll + `dispatchEvent('scroll')` while both intersecting, both instances received boosts in prior pass; off-screen instance stays at rate **1** when not intersecting.

**Screenshots (retaken):** `dev-mobile.png` recaptured at **390×844** (Playwright CLI) after F7; md5 `ceeb33044daf19c26d0bc0c3d7e80778`.

**F7 fix (2026-10-04):** Split typography into `text_size` (desktop) + `text_size_mobile` with Liquid `case` → literal `pc:*` / `max-pc:*` tier classes on title and separator; schema/locale options aligned with `slides-show`. Ran `npm.cmd run build:tw`.

**F8 fix (2026-10-04):** Removed `data-scrolling-hover-paused` (JS + CSS). Visual hover pause is CSS `:hover` only (fine-pointer media query). `_hoverPaused` for scroll speed-up uses `pointerenter`/`pointerleave` gated to `pointerType === 'mouse'`. `npm.cmd run build:tw`; `lint:theme`, `lint:compat`, `scan:compat` pass; `rg hover-paused|HoverPaused` on `assets` / `tailwind` / `sections` → empty.

**R1–R4 fix (2026-10-05):** **R1** pressed pause `::before` keeps `content: ''` (play triangle); **R2** track flex `gap` removed, each `__item` has `padding-inline-end: var(--scrolling-icon-gap)`; **R3** separator inside `__item-row` (spacing refined in **R5**); **R4** rate easing snaps to target when within epsilon before stopping loop.

**Validators (post R1–R4):** all six pass.

**Browser (post R1–R4):**

| Check | 1440×900 | 390×844 |
| --- | --- | --- |
| Seam (`repeatDist − scrollWidth/2`) | **0px** | **−0.5px** |
| Slideshow → marquee gap | **0px** | — |
| Bar height | **88px** | **~44.5px** |
| Title / separator font | **40px** | **~15.75px** |
| Colours | `rgb(213, 255, 131)` / `rgb(38, 61, 41)` | same |
| Motion off (`data-motion-enabled='false'`) | **1** title, **1** separator, bar **88px** | **1** / **1**, bar **~44.5px** |
| Pause pressed `::before` `content` | `""` (not `none`) | — |
| `playbackRate` ≤1.2s after scroll | **1** | — |

**R5 fix (2026-10-05):** Separator `margin-inline-start: 0.5em; margin-inline-end: 0`; demo `gap` **8**. `lint:theme` + `scan:compat` pass.

| Spacing / seam | 1440×900 | 390×844 |
| --- | --- | --- |
| Phrase → `*` | **20px** (`0.5em` @ 40px) | **~7.9px** (`0.5em` @ ~15.75px) |
| `*` → next phrase | **8px** (`padding-inline-end`) | **8px** |
| Seam (`repeatDist − scrollWidth/2`) | **0px** | **+0.5px** |

**Screenshots (retaken):** `dev-desktop.png`, `dev-mobile.png` (Playwright CLI, post-R5).

**Recorded mismatches:** None for F7 targets (desktop ~40px, mobile ~16px, bar ~45px, gap 0) at measured viewports.

### Coordinator static review (2026-10-04): FAIL, back to step 5

- **F1 (high):** lint evasion. `assets/scrolling-marquee.js` destructures `window.addEventListener` and `window.removeEventListener`, which hides a global listener from `lint:theme` (JS_DOCUMENT_OUTLET: "Global document/window listeners belong in base.js, events.js, https.js, utils.js, or alpine.adapter.js").
  - Fix: add a shared scroll-velocity helper to `assets/utils.js` (surface extended to it). For example, `subscribeScrollVelocity(callback)` returns an unsubscribe function. It keeps one passive `window.addEventListener('scroll', …)` with requestAnimationFrame, adds the listener on the first subscriber and removes it on the last.
  - The module subscribes per instance and unsubscribes in `destroy`. There is no `window`/`document` listener in the module.
- **F2 (medium):** every instance runs a requestAnimationFrame loop forever, calling `getComputedStyle` each frame, even off-screen and at rest.
  - Fix: run the easing loop only while a speed-up is in progress (target or current rate ≠ 1) and the instance is visible; stop it once the rate settles at 1.
  - Read the pause state cheaply: for example `root.matches(':hover')`, `:focus-within` or `data-paused` once per running frame, or flags from scoped `this.on(root, …)` listeners.
- **F3 (medium):** the text size options are mislabelled duplicates. The `body-3xl` value renders 40px on desktop and 16px on mobile, while the real `body-3xl` tier is 1.5× / 1.375× body. The section re-implements a calc ladder per option.
  - Fix: apply the real tier utility class from the select (the heading tiers are the ones that reach the design size) on the title and separator, and delete the `data-text-size` calc ladder. Keep a local `line-height: 1` override where the tier would set it (unlayered section rules beat the utility layer).
  - Pick the default tier closest to 40 / 16 and record the measured result. A small mismatch is acceptable if it is recorded.
- **F4 (low):** the pause button combines `aria-pressed` with an `aria-label` that swaps between Pause and Play, and in the pressed state it shows an empty circle (no glyph).
  - Fix: use a fixed label ("Pause scrolling text") with `aria-pressed` only, and show a visible play glyph when pressed.
  - Remove `accessibility.marquee_play` and the `data-label-*` attributes.
- **F5 (low):** on mobile, `min(14px, …)` ignores merchant padding values above 14px and uses a px literal.
  - Fix: scale the setting proportionally, for example `calc(var(--scrolling-bar-padding-y) * 0.6)`, keeping the mobile bar at about 45px.
- **F6 (low):** the option labels reuse `t:sections.scroll-categories.options.*`.
  - Fix: after F3, use this section's own keys or an existing shared key set, and remove any keys that become unused.

### Coordinator static re-review (2026-10-04): F1–F6 fixed; one new finding, back to step 5

F1–F6 are verified in the code:

- the scroll-velocity helper in `utils.js`, with no listener in the module;
- easing runs on demand only;
- real tier classes;
- a fixed label plus `aria-pressed`;
- proportional mobile padding;
- own label keys.

- **F7 (medium):** the mobile size misses the design. `heading-h1` renders 30px at 390, against about 16px in the design, and the bar is about 59px against about 45px. The plan allowed two selects when no single tier fits.
  - Fix: mirror the `slides-show` pattern: `text_size` for desktop (literal `pc:` classes) and `text_size_mobile` (literal `max-pc:` classes), each mapped with a Liquid `case` so Tailwind sees every class literally. Mobile options cover the body and small heading tiers.
  - Demo: desktop near 40px at 1440, mobile near 16px at 390, bar about 45px. Record the measured values.

### Coordinator static re-review 2 (2026-10-04): F7 fixed; F8 found

F7 is verified: `text_size` / `text_size_mobile` map through a literal `case` to `pc:` / `max-pc:` tier classes.

- **F8 (medium):** the hover-pause change breaks touch devices. `mouseenter`/`mouseleave` now set `data-scrolling-hover-paused`, and `tailwind.animates.css` pauses on it outside the `(hover: hover) and (pointer: fine)` guard.
  - On touch devices a tap fires emulated `mouseenter` with no `mouseleave` until the user taps elsewhere, so tapping the marquee freezes it.
  - The change was made so the MCP hover tool could observe a pause; test tooling is not a reason to change runtime behaviour.
  - Fix: remove the `data-scrolling-hover-paused` attribute and its CSS selector, so CSS `:hover` inside the media guard stays the only visual hover pause.
  - In JS, set `_hoverPaused` from `pointerenter`/`pointerleave` only when `event.pointerType === 'mouse'`; it only gates the speed-up.

### Independent review round 1 (2026-10-05): FAIL, back to step 5

Proven: surface; `scheme-3`; template; schema; tier classes (23 literal classes); one passive listener (two instances; 0 after the last unmount); off-screen instance stays at rate 1; 0 idle frames; Tab/Space pause plus scroll while paused plus blur; direction kept under `left_to_right`; `replaceRegion` cleanup; validators. Statically verified only (MCP limits): forced `:hover`, a touch tap, reduced motion.

- **R1 (medium):** the pressed pause button shows no glyph, because the pressed `::before` stays `content: none`. Fix: restore `content: ''` on the pressed `::before` triangle and check that the computed `content` is not `none`.
- **R2 (medium):** the loop jumps about gap/2 (24px). The track uses flex `gap` while the keyframe translates −50%, so half the track is short by half a gap. This bug predates the batch (40px gap → 20px).
  - Fix: drop the track `gap` and give every repeated child a trailing `padding-inline-end` (or margin) equal to the gap, so the track is exactly two equal halves. Do not touch the shared keyframe or the watermark consumers.
  - Verify that the repeat distance equals half the track width (0 ±0.5px).
- **R3 (medium):** the static fallback (motion off or reduced motion) keeps the duplicate separators: 12 asterisks, and the mobile bar grows to 172px.
  - Fix: render each separator inside its item's wrapper, so hiding a duplicate item hides its separator. Keep the separator `aria-hidden`.
  - Verify: one phrase plus at most one separator in the fallback; the bar keeps about the same height.
- **R4 (low):** easing ends at 1.0098, not 1, because the epsilon check stops the loop before snapping.
  - Fix: when the remaining difference to the target is below epsilon, apply the target exactly (1) before ending the loop.
  - Verify: the rate is exactly 1 within 1.2s after scrolling stops.
- **Demo spacing (design fit, not a defect):** a 48px gap is wider than the design (about 20px before the `*`, about 8px after it). Tune the demo `gap` once R2/R3 land, and record the value. → **Done:** demo `gap` **20**; separator CSS margins **20px** before / **8px** after the `*`.

### Coordinator static check of R1–R4 (2026-10-05)

R1, R2 and R4 are verified in the code. R3's structure (the separator inside `__item-row`) is verified. One spacing finding:

- **R5 (low, design fit):** the space after the `*` is 28px, not 8px. The separator sets fixed `margin-inline: 20px 8px`, and the item's `padding-inline-end` adds the 20px `gap` after it. The px literals also don't scale with the mobile tier: the design ratio is about 0.5em before and about 0.2em after.
  - Fix: separator `margin-inline-start: 0.5em; margin-inline-end: 0`. The `gap` setting is the only space after each repeat.
  - Demo `gap` near 8 (desktop design). Record the measured spacing before and after the `*` at both widths. → **Done:** demo `gap` **8**; measured above in Progress.
