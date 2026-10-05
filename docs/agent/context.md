# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-06.

## Batch 6-S10: `icon-with-text` as the home trust strip with a bottom wave

**Status:** authorized (2026-10-06); implemented by the coordinator; user look accepted; Ask review prompt delivered; not committed.

### Design

`docs/design/home/trust-icons/` holds `desktop.png` and `mobile.png`. Both are Git-ignored and local.

- **Content:** three items, each a line icon above an uppercase title and a one-line description, left-aligned.
- **Layout:** three columns on desktop and one column on mobile.
- **Background:** a sage section background with a light hilly wave along the bottom edge. The dark footer follows.
- **Motion:** none.

### Decisions (user, 2026-10-06)

- **Extend the existing `icon-with-text`.** No page uses it today. Its layout settings (columns, gap, direction, icon size, carousel) stay; nothing is deleted.
- **No new motion.** The section's existing `data-motion-cascade` list reveal stays.
- **Place it last on home,** after `google-map` and before the footer.

### Outcome

| Area                                                                         | Change                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `snippets/icon-with-text-item.liquid`                                        | Optional `text` and `text_class` params. When `text` is set, the title and text are wrapped in `icon-with-text-item__body`; other consumers' markup is unchanged.                                                                                                                                                                                            |
| `sections/icon-with-text.liquid`, section settings                           | New: `alignment` (left or center; default center, the previous behaviour), `show_wave` (checkbox, default off), `wave_color_scheme` (default scheme-2).                                                                                                                                                                                                      |
| `sections/icon-with-text.liquid`, block settings                             | New: `text` (`inline_richtext`, description). New icon options: `icon-content-shield-check` and `icon-content-hand-heart`.                                                                                                                                                                                                                                   |
| `sections/icon-with-text.liquid`, item rendering                             | The title tier is now `heading-h6 pc:heading-h5 uppercase` (was `body-xl`); the description uses `body-sm pc:body-md`.                                                                                                                                                                                                                                       |
| `sections/icon-with-text.liquid`, wave                                       | Rendered through the `section-frame` `background` slot as `icons` → `icon-divider-wave` (no inline SVG; `lint:theme` forbids it). It is absolutely positioned at the bottom, full width, `clamp(2.5rem, 5vw, 4.5rem)` tall, `aria-hidden`. Its fill is the wave scheme's background, and the wrapper overrides the scheme class's background to transparent. |
| `assets/icon-content-shield-check.svg`, `assets/icon-content-hand-heart.svg` | Phosphor regular (MIT, the same set as the existing `icon-content-*` icons), through `npm.cmd run build:svg`.                                                                                                                                                                                                                                                |
| `assets/icon-divider-wave.svg`                                               | A new `preserveAspectRatio="none"` divider path, through `npm.cmd run build:svg`.                                                                                                                                                                                                                                                                            |
| `locales/en.default.schema.json`                                             | Keys for the new settings and options.                                                                                                                                                                                                                                                                                                                       |
| `templates/index.json`                                                       | A new `icon_with_text_trust` entry, last in the order. Scheme-3 for the section (the design's sage is not a scheme yet), wave scheme-2, the three design items, alignment left, padding 100/100.                                                                                                                                                             |

### Review tier

**Ask.** The batch changes Liquid, the schema and a shared snippet, and adds assets. The coordinator implemented it, so an independent verifier reviews.

### Acceptance checks

**Gates:**

- `npm.cmd run lint:theme`, `test:theme-check`, `lint:i18n`, `lint:compat` and `lint:liquid-syntax` pass.
- Prettier passes on the changed files.

**Behaviour:**

1. **Other consumers.** `scrolling-icon-with-text` and `product-info-blocks` render the item snippet without `text`, and their markup is unchanged.
2. **Defaults.** With `show_wave` off nothing extra renders, and `alignment` defaults to center, the previous behaviour.
3. **Wave.** The wave is `aria-hidden`, does not intercept pointer events, and sits inside the bottom padding. It never covers item text at 1440 or 390.
4. **Mobile.** At 390 there is one column and no horizontal overflow.
5. **Motion.** The cascade reveal still runs, and is static with motion off.

### Execution (coordinator, 2026-10-06)

All gates pass: `lint:theme`, `lint:i18n`, `lint:compat`, `lint:liquid-syntax`, `test:theme-check` (150 files, 0 offenses), and Prettier on the changed files. `build:tw` produced no change, since the tiers already existed. The first `lint:theme` run rejected an inline wave SVG, which was moved to `assets/icon-divider-wave.svg`.

### Review R1 (verifier, 2026-10-06): PASS

- **Findings:** no batch defects.
- **Observations:**
  - `THIRD_PARTY_NOTICES.md` has no entry for the Phosphor icon set (MIT). This predates the batch; recorded on the board.
  - Prettier has no parser for the SVG assets; the verifier checked them with SVGO instead.
