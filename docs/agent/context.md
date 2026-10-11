# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-11.

## 6-D1 Design tokens: schema defaults and code

**Status:** authorized by the user 2026-10-11; executed from an external execution prompt; checks 2, 3 and 5 run by the coordinator after the dev server started; review round 1 FAIL corrected, round 2 PASS; accepted by the user 2026-10-11 on the review; the browser look (check 7) moves to after 6-D2, one look for both.

**Outcome:** the theme code carries `docs/design/design.md`: schema defaults equal the design's default settings, and the code changes its sections name (weight loading, a stepped heading line height, a fluid page margin, a card radius) exist. The merchant preset (`config/settings_data.json`: fonts, colour scheme values, page margin) is a separate batch, 6-D2, after this one (Gotchas: configuration changes are not mixed with code).

**Why the look changes in this batch:** `config/settings_data.json` stores only six global keys (fonts, page width and margin, toast position, reveal behaviour) and the colour schemes; every other global setting renders from its schema default. Changing those defaults therefore changes the live store for weights, line heights, letter spacing and radii. Colour scheme values and fonts do not change until 6-D2.

**Review tier:** Ask (`config/settings_schema.json`, Liquid and stylesheet markup, new setting and locale keys).

**Dependencies:** `docs/design/design.md` (committed `405d2b1`); `npm.cmd run shopify:dev` running for `test:layout`.

### Items

1. **Colour scheme defaults** (`color_scheme_group` definition defaults, `config/settings_schema.json`): the Ceylune canvas scheme. Background `#f1f1f1`; text, border, focus ring, primary button background and border, secondary button label and border `#263d29`; primary button label `#ffffff`; secondary button background `#ffffff`; badge background `#ffffff`, label and border `#263d29`; accent `#d5ff83`; card `#ffffff`; input background `#ffffff`, input text `#263d29`, input border and placeholder `#677769` (ink at 70% over white: 4.75:1 on white, 3.81:1 on sage). Status pairs unchanged.
2. **Badge defaults** (global settings): sale background `#d5ff83`, text `#263d29`; sold out background `#677769`, text `#ffffff` (4.75:1); custom 1 unchanged (`#263d29` / `#ffffff`); custom 2 background `#e3e8da`, text `#263d29`.
3. **Typography defaults and options:**
    - `heading_weight` and `subtitle_weight` gain a `500` option (label key `t:config.typography.options.weight.medium`, added to `locales/en.default.schema.json`); defaults `heading_weight` 500, `subtitle_weight` 500.
    - Defaults: `heading_line_height` 1.0, `heading_letter_spacing` `-0.02em`, `body_line_height` 1.4.
    - `snippets/css-variables.liquid` loads the heading face at `settings.heading_weight` (`font_modify: 'weight'`, falling back to the picked face when the family has no such weight) besides bold and italics, and loads the subtitle weight's face for its source family the same way. CSS keeps reading weights through `--font-heading-weight` and `--font-subtitle-weight`, so no literal 500 appears and `unloaded-font-weight` is unchanged.
4. **Stepped heading line height** (`tailwind/tailwind.typography.css`): `title-xl` and larger use `--font-heading-line-height`; `title-l` and `title-m` use `max(var(--font-heading-line-height), 1.1)`; `title-s` and `title-xs` use `max(var(--font-heading-line-height), 1.2)`. The legacy aliases inherit through `@apply`.
5. **Fluid page margin** (`snippets/css-variables.liquid`): `--page-margin` becomes `clamp(min(16px, v), a + b·vw, v)` for the `page_margin` setting `v`, from 375px to 1280px (the section padding clamp's construction, in rem). Schema defaults: `page_margin` 24, `page_width` 1600.
6. **Radii:**
    - Defaults: `button_radius` 4, `input_radius` 4, `product_card_radius` 0, `dialog_radius` 16 (toast unchanged at 8).
    - New global setting `card_radius` (range 0–40px, step 2, default 16, label and info keys in `locales/en.default.schema.json`) in the cards group, emitting `--radius-card` (the value) and `--radius-media` (half of it) in `snippets/css-variables.liquid`.
    - Adopted by the feature cards: `sections/scroll-categories.liquid` (`var(--radius-xl, 1rem)`), `sections/testimonial-featured.liquid` (`var(--radius-xl, 0.75rem)`), `sections/scatter-gallery.liquid` (`0.75rem`, `1rem`). Other raw radii stay for the polish pass.
7. **Record:** `docs/design/design.md` "Default settings this implies" lines say which values landed in 6-D1 and which wait for 6-D2.

### Implementation surface

`config/settings_schema.json`, `locales/en.default.schema.json`, `snippets/css-variables.liquid`, `tailwind/tailwind.typography.css`, `sections/scroll-categories.liquid`, `sections/testimonial-featured.liquid`, `sections/scatter-gallery.liquid` (their `{% stylesheet %}` radius declarations only), `assets/tailwind.output.css` (rebuilt by `npm.cmd run build:tw`, never hand-edited), `docs/design/design.md`.

Out of surface: `config/settings_data.json`, `templates/*.json`, `sections/*-group.json` (6-D2 or merchant content).

### Acceptance checks

1. Schema: each default and option in items 1–3, 5 and 6 equals the plan (a script reads `config/settings_schema.json` and prints them); `card_radius` exists with the stated range and default; every new label key resolves in `locales/en.default.schema.json`.
2. Rendered page (outside script with `playwright-core`, not the Chrome MCP), home at 375 and 1440: the emitted `--page-margin` clamp, evaluated for `v` = 24, gives 16px at 375 and 24px at 1280 and above, and for the preset's current `v` = 10 gives a constant 10px (no mobile margin larger than the setting); `--radius-card` is 16px and `--radius-media` 8px; an `@font-face` for the heading's selected weight is present when the family offers that weight.
3. A `title-s` heading renders with line height ≥ 1.2 and a `title-4xl` heading with the setting's value (computed style).
4. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`: pass.
5. `npm.cmd run build:tw`, then `npm.cmd run test:layout`: 0 new issues; the baseline may only shrink.
6. `npx prettier --check` on changed files passes.
7. Browser look by the user (step 8): home at 375 and 1440, headings, buttons, cards, inputs.

### Progress

**Status:** implementation complete (external executor); checks 2, 3 and 5 run by the coordinator 2026-10-11 once the dev server was up; check 7 pending the user.

**Implemented (items 1–7):**

- Colour scheme definition defaults → Ceylune canvas values in `config/settings_schema.json`.
- Product badge global colour defaults → plan values.
- Typography: weight 500 option + defaults; line height / letter spacing / body line height defaults; `snippets/css-variables.liquid` loads heading and subtitle selected weights via guarded `font_modify` + `font_face`.
- Stepped heading line heights in `tailwind/tailwind.typography.css` (`title-l`/`title-m` floor 1.1; `title-s`/`title-xs` floor 1.2).
- Fluid `--page-margin` clamp (375–1280, `min(16px, v)` floor); `page_margin` 24, `page_width` 1600 schema defaults.
- Radii defaults; `card_radius` setting + `--radius-card` / `--radius-media`; feature sections adopt tokens in `{% stylesheet %}` only.
- `docs/design/design.md` “Default settings this implies” updated for 6-D1 vs 6-D2.
- `npm.cmd run build:tw` regenerated `assets/tailwind.output.css`.

**Validation:**

| Check | Result |
| --- | --- |
| 1 Schema script | **PASS** — 46 assertions, 0 failed (`node` script over `settings_schema.json` + locale keys). |
| 2 Playwright rendered tokens | **PASS** (coordinator). Home at 375 and 1440: `--page-margin` emitted `1.0rem` (preset `v` = 10, constant 10px as planned); the emitted formula rebuilt for `v` = 24 gives 16px at 320 and 375, 19.76px at 800, 24px at 1280 and 1920. `--radius-card` 16px, `--radius-media` 8px; `.scroll-categories__media` and `.testimonial-featured__card` 16px, `.scatter-gallery__slot` 8px below 768 and 16px above. `@font-face` Inter 500 normal present beside 400, 700 and italics; `--font-heading-weight` and `--font-subtitle-weight` 500. |
| 3 Playwright title line heights | **PASS** (coordinator). Probe headings at both widths: `title-xs` and `title-s` 1.2, `title-m` and `title-l` 1.1, `title-xl` and `title-4xl` 1.0 (setting 1.0). Real headings follow their responsive tier (`heading-h3 pc:heading-xl`: 1.2 at 375, 1.0 at 1440). |
| 4 `lint:theme`, `test:theme-check`, `lint:i18n`, `lint:liquid-syntax`, `scan:compat` | **PASS** |
| 5 `test:layout` | **PASS** (coordinator): 0 new issues (182s). Observed: home `page-margin` 8, `tap-targets` 15, `clipped-text` 1; collection-all `page-margin` 2; not-found `page-margin` 3; all baseline entries. Baseline not pruned. |
| 6 `npx prettier --check` (changed files) | **PASS** |
| 7 User browser look | **Pending user** (step 8). |

**Material notes:** Preset fonts remain `inter_n4` (Inter 400) until 6-D2; Inter exposes weight 500 via Shopify `font_modify`, so guarded `@font-face` for `heading_weight` / `subtitle_weight` 500 is expected when the dev server runs. Preset `page_margin` stays 10 → constant `1rem` margin until 6-D2; schema default 24 drives the fluid clamp for merchants on schema defaults only.

**Review round 1 (external Verifier, 2026-10-11): FAIL**, one finding and one unproven item. Corrections by the coordinator:

1. **P2 change outside the surface (`docs/design/design.md`, Layout, "Wide page, small margins"):** the coordinator's own edit, made while writing this plan (after commit `405d2b1`) to correct the paragraph's claim that the preset page width was 1200px; it was not the executor's. The sentence then went stale (it still called 1200px the schema default, which 6-D1 sets to 1600px) and now reads "the wide page width (1600px, in the preset and as the schema default)". The surface is widened to that paragraph, as a coordinator record correction.
2. **Unproven, a family without the selected weight:** Shopify's `font_modify` reference ("Non-existent font variants") states that a variant that does not exist returns `nil`; every new `font_face` call is inside `{%- if … -%}` on that result, so such a family emits no extra `@font-face`, and the browser falls back to the loaded 400 face for a 500 request (no synthetic bold below 600). The two unconditional calls are the picked faces themselves, which always exist. Proven by the platform reference and the guard structure; not exercised on a live family, since that needs a `settings_data.json` change outside this batch.

**Review round 2 (external Verifier, 2026-10-11): PASS**, no findings: the `design.md` diff is limited to the "Default settings this implies" lines and the corrected paragraph, whose widths and margins agree with the schema (1600 / 24) and the preset (1600 / 10); the `font_modify` nil contract confirmed through Shopify Dev MCP, all eight modified-face `font_face` calls guarded; source blobs and the generated CSS hash unchanged since round 1; the same 11 files. Remaining: the user's browser look (check 7).
