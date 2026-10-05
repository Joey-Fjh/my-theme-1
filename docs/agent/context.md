# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-06.

## Batch 6-S9: `promo-bannder` redesign as stacked panels

**Status:** authorized (2026-10-06); R1 executed; R2 coordinator edits done; user look accepted; Ask review prompt delivered; **not** committed.

### Implementation status (2026-10-06)

**Files changed:** `sections/promo-bannder.liquid` (rewrite), `assets/promo-bannder.js` (new), `snippets/scripts.liquid` (import map), `locales/en.default.schema.json`, `templates/index.json` (`promo_bannder_QtDDTf`), `assets/tailwind.output.css` (rebuilt). `locales/en.default.json` unchanged (no prior `promo-bannder` storefront keys).

**Validators (all pass):**

- `npm.cmd run lint:theme` — Theme architecture lint passed.
- `npm.cmd run test:theme-check` — 150 files, 0 offenses.
- `npm.cmd run lint:i18n` — i18n + unused keys passed.
- `npm.cmd run lint:compat` — stylelint, eslint, embedded compat passed.
- `npm.cmd run lint:liquid-syntax` — passed.
- `npx prettier --check` on changed Liquid/JS/JSON — passed.
- `npm.cmd run build:tw` — rebuilt `assets/tailwind.output.css`.

**`shopify theme dev`:** Home at `http://127.0.0.1:9292/` shows “Nourishing Oils” / “Active Ingredients” panels; no upload errors observed this session.

**Non-visual browser checks (Chrome via MCP, desktop 1440×900 unless noted):**

1. **Stacking:** `getComputedStyle(panel)` → `position: sticky`, `top: 0px`. After scroll ~one viewport into section, `elementFromPoint(720, 450)` hit is inside panel 2 (`stackHit: true`).
2. **Scale (panel 2 `.promo-bannder__media-scale`, `parseScale` from `matrix(a,…)`):** before enter `1.2`; with `is-in-view` after scroll + 900ms → `1`; +400ms → `1` (within 700ms window); after scroll away +850ms → `1.2`. Mid-transition not scrubbed with scroll held.
3. **Motion gates:** Removing `.promo-bannder--motion` → `transform: none` (scale 1). JS-off / theme `motion_enabled` / reduced-motion not re-run in browser (CSS uses `prefers-reduced-motion: reduce` to drop scale).
4. **Mobile 390×844:** panel `position: relative` (not sticky); `scrollWidth === clientWidth` (390), no horizontal overflow.
5. **A11y:** Two panel `<h2>` in DOM order (“Nourishing Oils”, “Active Ingredients”). Placeholder main/small images use heading-based or empty alt. Index cards have no link → Tab link check N/A.
6. **Cleanup:** No console errors during checks. `promoBannder.destroy()` → `_panelObserver` null, `.promo-bannder--motion` removed.

**Deviations / polish notes:**

- Desktop text block uses `margin-top: 12%` in section CSS rather than Tailwind `pc:` utilities (layout in `{% stylesheet %}` per plan).
- Reference “EXPLORE +” links not in `index.json` (optional; both `link` / `link_text` empty).
- Visual parity (serif weight, exact small-image size, header overlap while sticky) deferred to Home polish.

### Design

`docs/design/home/promo-panels/` holds `desktop.png` (about 1900 wide), `mobile.png` (about 210 wide, scaled down) and `reference-loiseau.png`. All are Git-ignored and local. The reference is the "Skin care" block of https://loiseau.framer.website/.

- **Desktop:** each panel is one screen tall and split in halves. One half is a full-bleed main image; the other is a coloured panel with a serif heading and a one-to-two-line description centred in its upper part, and a small landscape image lower down (about 365 × 210 at 1900). The reference also has an "EXPLORE +" link under the small image.
- **Alternation:** panel 1 has the image on the left, panel 2 on the right, panel 3 on the left, and so on.
- **Mobile:** each panel stacks the main image above its text block: heading, description, small image. The panels follow each other in normal flow.

**Reference measurements** (coordinator, Chrome DevTools at 1440 × 900, 2026-10-06):

- **Stacking.** The section is the panels' combined height, and each panel is a direct child with `position: sticky; top: 0` at about one screen tall. Scrolling down, the next panel rises from the bottom and covers the previous one; scrolling up reverses it.
- **Image scale.** The main image's wrapper is scaled 1.2 while its panel is out of view and 1 while it is in view. This is a time-based transition of about 600ms, ease-in-out, triggered when the panel enters or leaves the viewport. It is not a scroll scrub. The image is clipped by its half.

### Decisions (user, 2026-10-06)

- **Rewrite `promo-bannder` in place.** It is used only by `templates/index.json`. The section type ID keeps its spelling. Settings the design does not show are deleted.
- **Match the reference effect without GSAP:**
    - CSS sticky stacking;
    - an IntersectionObserver that toggles an in-view class;
    - a CSS transition for the scale.
- **No stacking on mobile.** Panels are taller than the screen there, so sticky would cover the text before it is read. The image scale effect stays.

### Outcome

**`sections/promo-bannder.liquid`, rewritten in place.** Keep the section type, name and preset name.

Section settings:

| Setting                                                                                                                                  | Status                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `heading_size` (the panel heading tier), `padding_top`, `padding_bottom`                                                                 | kept, same IDs and types                       |
| `color_scheme`                                                                                                                           | kept; the section background behind the panels |
| `subtitle_size`, `hero_image`, `hero_subtitle`, `hero_heading`, `hero_link`, `hero_link_text`, `show_badge`, `badge_text`, `badge_value` | **deleted**                                    |

Block type `card` is kept (existing blocks keep working), with `max_blocks` 5:

| Setting                        | Status                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `image`                        | kept: the main image                                                                                               |
| `heading`, `link`, `link_text` | kept; the link shows only when both `link` and `link_text` are set, as an uppercase text link with a trailing icon |
| `subtitle`                     | **deleted**                                                                                                        |
| `description`                  | **new**, `inline_richtext`                                                                                         |
| `image_small`                  | **new**, `image_picker`: the small image                                                                           |
| `color_scheme`                 | **new**, `color_scheme`: the panel colours; default `scheme-3`                                                     |

The preset holds 2 cards. Delete the locale keys that only the deleted settings and markup used.

**Layout:**

- **Desktop (≥1024px).** Each panel is `100svh` tall (minimum 40rem), `position: sticky; top: 0`, in two equal columns.
    - Odd panels place the image on the left and even panels on the right. Use a modifier class from `forloop.index`; the DOM order stays image then text.
    - Text column: the heading and description are centred, in the upper third. The small image is centred lower down, about 19% of the column width with a landscape ratio of about 1.7, followed by the optional link.
    - Each later panel stacks above the earlier one (increasing `z-index`). The panels carry their own scheme background, so the panel below is fully covered.
- **Mobile (<1024px).** No sticky. Each panel shows the image at its natural aspect, about 4:3 for a placeholder, and then the text block with vertical padding: heading, description, small image (about 45% of the width), link.
- **Placeholders.** A blank main image shows the `lifestyle` placeholder covering its half. A blank small image shows a small placeholder at the same box.
- **Typography:** tier classes only; colours from scheme roles. The section uses `section-frame` like the other sections.

**Motion (`assets/promo-bannder.js`, new, with an entry in the `snippets/scripts.liquid` import map):**

- **Observer.** An Alpine component on the section root holds one IntersectionObserver over the panels, at a threshold of about 0.5. It toggles `is-in-view` on each panel.
- **CSS.** The image wrapper is `transform: scale(1.2)` by default **only under `.promo-bannder--motion`**, a class the component adds on init. A `.is-in-view` panel's wrapper scales to 1, with a transition of 600ms `ease-in-out` on `transform`.
- **Without JavaScript,** with `motion_enabled` off, or with `prefers-reduced-motion: reduce`: the motion class is never added, so the images rest at scale 1 and nothing animates. Sticky stacking still works without JavaScript.
- **Cleanup:** `destroy()` disconnects the observer.

**`templates/index.json`:** only the `promo_bannder_QtDDTf` entry changes.

- Remove the deleted settings.
- Set the 2 cards: heading "Nourishing Oils" with the design's description, scheme-3; heading "Active Ingredients" with the design's description, scheme-2. Images stay blank (placeholders).
- Section padding 0.

### Implementation surface

- `sections/promo-bannder.liquid`
- `assets/promo-bannder.js` (new)
- `snippets/scripts.liquid` (one import-map entry)
- `locales/en.default.json` and `locales/en.default.schema.json` (`promo-bannder` keys only)
- `templates/index.json` (the `promo_bannder_QtDDTf` entry only)
- `assets/tailwind.output.css` (generated rebuild)

Temporary files go to the system temp directory and are deleted before the report.

### Review tier

**Ask.** Liquid markup and schema change, settings are deleted, a new `assets/*.js` file is added, and the batch runs from an external execution prompt.

### Acceptance checks

**Gates:**

- `npm.cmd run lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat` and `lint:liquid-syntax` all pass.
- Prettier passes on the changed files.
- `shopify theme dev` syncs.

**Static:**

- The schema matches the tables.
- No deleted setting ID remains in Liquid, locales or `templates/index.json`.

**Non-visual browser checks:**

1. **Desktop stacking (1440 × 900).** Each panel computes `position: sticky` and `top: 0px`. After scrolling one screen past the section top, panel 2's top is 0 and covers panel 1: `elementFromPoint` at the viewport centre is inside panel 2. Scrolling back reverses it.
2. **Image scale, measured over time.** Panel 2's image wrapper reads `matrix(1.2…)` before it enters, about 1 within 700ms of being at least half in view, and 1.2 again after it leaves. No scale ever goes below 1. The transition is not tied to scroll position: with scrolling stopped, the value settles.
3. **Gates.** With JavaScript off, with `motion_enabled` off, and with reduced motion, every image wrapper computes `transform: none` or a scale of 1. Stacking still works with JavaScript off.
4. **Mobile (390).** No panel is sticky; there is no horizontal overflow; the scale toggle still runs.
5. **Accessibility.**
    - Panel headings are real heading elements in order.
    - Main images carry alt text from the image or are decorative (`alt=""`) when only decoration; the small image follows the same rule.
    - Optional links are reachable by Tab.
6. **Cleanup.** No console errors. After `destroy()` no observer remains.

Visual detail (fonts, colours, the header overlap with sticky panels, exact sizes) is out of scope for review and goes to the Home polish pass.

### Round R2 (coordinator direct edit, user look, 2026-10-06)

**User look on R1:** the stacking and the image scale are accepted. Problems:

- the PC small image sits at the bottom and is cut off;
- the heading breaks inside a word ("Nourishin/g");
- the mobile text block is cramped;
- there are only 2 panels against the design's 3;
- the panel colours do not differ.

**Causes and fixes:**

- **Text and small-image position.** The copy used `margin-top: 12%`, and percentage margins resolve against width, not height.
    - The panel now defines `--promo-bannder-panel-height`.
    - The desktop text column pads its top by 24% and its bottom by 28% of that height.
    - The small image is pushed down by `margin-top: auto`, so it ends at about 72% of the panel. That sits between the design (85%) and the reference (70%), near the user's mark.
- **Small image width.** 30% of the column on desktop; it was 19%, measured by mistake against the full width (the design is about 39%, the reference 28%).
- **Heading.** The copy width is 65% of the column, with `overflow-wrap: normal` and `word-break: normal`.
- **Mobile.** The text block has a minimum height of `100vw`, with top padding of `12vw` and bottom padding of `16vw`. The small image is pushed down by `margin-top: auto`.
- **Third panel.** `templates/index.json` gains card 3, "Botanical Extracts", with the design copy and scheme-3.
- **Colours.** The template already sets card 2 to scheme-2 and the copy, but the dev store showed defaults, so the `shopify theme dev` sync was stale; restart it. The design's pale sage (panel 1) against bright lime (panel 3) needs a fourth colour scheme, which is merchant configuration; recorded for the polish pass.
- **Validators:** Prettier, `lint:theme`, `lint:compat` and `test:theme-check` pass.
- **Follow-up (user look on R2, mobile).**
    - The image-right `order` rules applied on mobile too, so panel 2 showed its text before its image and panel 1's small image sat against it. The rules are now scoped to `min-width: 64rem`, and every mobile panel is image then content.
    - The mobile main image ratio is now 4:5 (portrait, per the design); it was 4:3.
    - Validators pass.

### Review R1 (verifier, 2026-10-06): FAIL, 2 findings

- **P2, placeholder images had no accessible name and were not marked decorative.** The `image` snippet's placeholder branch ignores `alt`. Fix: when `image` or `image_small` is blank, the wrapper (`.promo-bannder__media-scale` or `.promo-bannder__small-wrap`) carries `aria-hidden="true"`. The shared snippet is unchanged.
- **P3, Prettier on `context.md`.** The nested bullets were mis-indented; the file is reformatted with an empty ignore path.
- **Proven by the verifier:**
    - schema, deletions and scope;
    - sticky stacking (z 1, 2, 3; works with JavaScript off);
    - image scale timing;
    - JavaScript off, motion flag and reduced motion;
    - mobile order, 4:5 and no overflow;
    - headings, module registration and `destroy()`;
    - the generated CSS matches a fresh build.
- **Unproven:** optional-link Tab access, since no links are configured.
