# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-10.

## Plan 6-C9: colour schemes and standalone colour settings

**Status:** **authorized** (user, 2026-10-10), executed from an external execution prompt. Review tier: **Ask** (schema, Liquid, merchant data, removed settings, validator). **Execution:** external execution prompt, then an independent review in another session. Approved design: board "Decided: 6-C9 colour proposal" (user, 2026-10-10).

### Outcome

Colour comes from schemes and their roles everywhere except a short, named allowlist. The design's sage sections get their own scheme; cards get a surface role; the standalone colour settings that duplicated scheme roles are gone, with their saved values removed.

### Design

1. **Schemes:** add `scheme-4` "Sage" (provisional: background `#e3e8da`, text, border and focus `#263d29`, buttons and badge as `scheme-2`, status pairs as the others) and `scheme-5` "Page" (background `#ffffff`, otherwise as `scheme-2`) in `config/settings_data.json`. Assign `scheme-4` in `templates/index.json` to the home sections the board's design notes place on sage (6-S3 `collection-list`, 6-S5, 6-S6 `scroll-categories`, 6-S10; 6-S9 panel 1 if it has its own scheme setting); list each instance in Progress.
2. **Card surface role:** new scheme field `card_background_color` (default `#ffffff`) → triplet `--color-card-background` per scheme in `css-variables.liquid`, Tailwind `--color-card: rgb(var(--color-card-background))` (`bg-card`). Values: white in every scheme. The white cards in `collection-card`, `routine-showcase`, `testimonial-featured` and the `routine-showcase` sage halo move to roles (the halo to `--color-card` / `--color-accent` mixes or the scheme background, keeping today's look within the contrast script's tolerance); their `lint-allow raw-colour: owner 6-C9` lines are removed.
3. **`scheme-1` badge:** background and border `#d5ff83`, label `#1b2900`.
4. **Standalone settings:**
    - global badge colours (8): kept, allowlisted as named global status colours;
    - `main-page-contact` `form_background_color` / `form_text_color` → removed; the form uses a new `form_color_scheme` picker (default the section's own scheme) through `color-{{ … }}` and roles;
    - `product-comparison-table` `comparison_column_bg_color` → `--color-card`; `comparison_success_color` / `comparison_danger_color` → `--color-success-foreground` / `--color-error-foreground`; the three settings removed;
    - `product` `zoom_overlay_color` → the 6-C4 scrim token; setting removed;
    - `product` `collapsible_tab` `icon_color` → `currentColor` / text role; setting removed;
    - `product` `callout` `background_color` / `text_color` → `--color-info-background` / `--color-info-foreground`; settings removed.
    - Saved values of every removed setting are deleted from `templates/*.json` (all in `templates/product.json` today); their locale keys are removed.
5. **Lint:** `lint:theme` rejects `color` / `color_background` settings in `config/settings_schema.json` and section or block schemas outside an allowlist with a reason per entry (the eight badge colours; the scheme group definition is exempt), with tests.
6. `assets/gift-card.css`: unchanged (exempt palette).

Out of scope: the calibrated sage value and other design colours; badge colour redesign; the colour-mode or palette model.

### Implementation surface

- `config/settings_schema.json` (scheme definition field), `config/settings_data.json` (schemes 4 and 5, `scheme-1` badge, new field values) — merchant data, approved.
- `templates/index.json` (scheme assignments), `templates/product.json` (removed settings' values) — merchant data, approved, only these keys.
- `snippets/css-variables.liquid`, `tailwind/tailwind.input.css`, `assets/tailwind.output.css` (`build:tw` only).
- `sections/main-page-contact.liquid`, `sections/product-comparison-table.liquid`, `sections/product.liquid`, `sections/routine-showcase.liquid`, `sections/testimonial-featured.liquid`, `snippets/collection-card.liquid`, and snippets those sections render for the removed settings (for example the zoom overlay consumer); schema and markup for the listed items only.
- `locales/en.default.schema.json` (scheme field label, new picker label, removed keys).
- `.agents/skills/check-theme-architecture/scripts/**` (the colour-setting lint and tests; `colour-role-sync` learns the new role).
- `docs/references/style-system/css-architecture.md` (schemes, card role, allowlist).
- Records.

### Acceptance checks

- **A1 Schemes.** The editor lists five schemes; `scan:contrast` reports 0 failing pairs, including schemes 4 and 5 and `scheme-1`'s badge.
- **A2 Roles.** `--color-card-background` is declared on `:root` and every `.color-scheme-*`; `colour-role-sync` passes; no `lint-allow raw-colour: owner 6-C9` remains.
- **A3 Settings.** The only `color` / `color_background` settings outside the scheme group are the eight badge colours; the new lint fails a fixture that adds one.
- **A4 Data.** No saved value remains for a removed setting; `templates/index.json` changes only `color_scheme` values of the listed instances; `shopify theme dev` syncs without template errors.
- **A5 Look.** Computed colours: cards white on every scheme; comparison table, callout, zoom overlay and collapsible icon use their roles; at defaults the contact form looks as before. Visual changes match the board table (sage sections, `scheme-1` badge, comparison success/danger, callout).
- **A6 Validators:** `lint:theme`, `lint:i18n`, `scan:compat`, `scan:contrast`, `test:validators`, `lint:liquid-syntax`, `test:theme-check`, `lint:doc-paths`, `doctor:agent`, `test:layout --widths 390,768,1024,1440` (0 new issues), Prettier on changed non-merchant files.
- **A7** The user's browser look at home and a product page.

### Progress

**Inventory (task 1)**

| Removed setting | Schema | Liquid / snippets | Saved values | JS |
| --- | --- | --- | --- | --- |
| `form_background_color`, `form_text_color` | `sections/main-page-contact.liquid` | same + `{% stylesheet %}` RTE colours | none (`templates/page.contact.json`) | none |
| `comparison_column_bg_color`, `comparison_success_color`, `comparison_danger_color` | `sections/product-comparison-table.liquid` | same (`comparison_root_style`, utility classes) | `templates/product.json` (`product_comparison_table_nHFiLM`) | `assets/product-comparison-table.js` (no colour settings) |
| `zoom_overlay_color` | `sections/product.liquid` | `snippets/product-gallery.liquid` → `snippets/image-lightbox.liquid` | `templates/product.json` (`main` section) | `assets/image-lightbox.js` (opacity only) |
| `icon_color` (collapsible_tab block) | `sections/product.liquid` | `snippets/product-info-blocks.liquid` → `snippets/content-icon.liquid` | `templates/product.json` block `collapsible_tab_7rmGkk` | none |
| `background_color`, `text_color` (callout block) | `sections/product.liquid` | `snippets/product-info-blocks.liquid`, `tailwind/tailwind.components.css` | `templates/product.json` block `callout_itCFQf` | none |

**Kept:** eight global badge colours in `config/settings_schema.json` (`badge_sale_*`, `badge_sold_out_*`, `badge_custom_1_*`, `badge_custom_2_*`).

**`lint-allow raw-colour: owner 6-C9` (removed):** `snippets/collection-card.liquid` (×2), `sections/routine-showcase.liquid` (card + halo), `sections/testimonial-featured.liquid` (card). Test fixture line in `theme-architecture.test.js` retained intentionally.

**Home → `scheme-4` (board 6-S3, 6-S5, 6-S6, 6-S9 panel 1, 6-S10):**

| Instance | Section type | Board note |
| --- | --- | --- |
| `collection_list_6S3` | `collection-list` | 6-S3 sage section background |
| `scatter_gallery_H3kLm9` | `scatter-gallery` | 6-S5 |
| `scroll_categories_B8wjNV` | `scroll-categories` | 6-S6 |
| `promo_bannder_QtDDTf` → block `card_4XMzQY` | `promo-bannder` card scheme | 6-S9 panel 1 |
| `icon_with_text_trust` | `icon-with-text` | 6-S10 trust strip |

**Colour readings (Chrome DevTools MCP, `window.innerWidth` 1249)**

| Target | Before | After |
| --- | --- | --- |
| `.collection-card__surface` bg | `rgb(255, 255, 255)` | `rgb(255, 255, 255)` |
| `.testimonial-featured__card--bottom` bg | `rgb(255, 255, 255)` | `rgb(255, 255, 255)` |
| `.routine-showcase__mobile-card` bg | `rgb(255, 255, 255)` | `rgb(255, 255, 255)` |
| Product callout bg / text | `rgb(214, 237, 255)` / `rgb(52, 129, 194)` | `rgb(244, 244, 245)` / `rgb(39, 39, 42)` (scheme info roles; expected) |
| Collapsible icon | `rgb(45, 70, 52)` | `rgba(38, 61, 41, 0.8)` (text role; expected) |
| Zoom overlay | `rgb(0, 0, 0)` @ 0.9 inline | not re-captured (lightbox click did not return overlay in this pass); implementation uses `bg-scrim-strong` + opacity setting |
| Contact form panel | defaults `#ffffff` / `#1a1a1a` (schema; no live contact page on dev) | `bg-card` + `form_color_scheme` defaulting to section scheme (not browser-verified) |
| Comparison highlight / success / danger | CSS vars `#f4f1e8`, `#228e58`, `#e04a4a` | roles `bg-card`, success/error foreground (visual change when rows render; `highlight_index` 0 in template) |

**Material decisions**

- `scheme-4` text/border/focus `#1f3223` (not `#263d29`) so `text-subtle` on sage background passes `scan:contrast` (4.5:1); sage background stays provisional `#e3e8da`.
- Routine mobile halo uses `var(--color-surface-strong)` / `var(--color-surface-muted)` gradient (replaces raw sage RGBA).
- Card surfaces in section CSS use `rgb(var(--color-card-background))`; markup uses `bg-card`.

**Validation (task 9)**

- `lint:theme` pass (after fixes).
- `lint:i18n` pass.
- `scan:compat` pass (via full batch run).
- `scan:contrast` 0 failing pairs (after scheme-4 text tweak).
- `test:validators` pass.
- `lint:liquid-syntax` pass.
- `test:theme-check` 0 offenses.
- `lint:doc-paths` pass.
- `doctor:agent` pass.
- `test:layout --widths 390,768,1024,1440` — 0 new issues.
- `npx prettier --check` on changed non-merchant files — pass.
- `git diff --stat` — surface files only (+ untracked `colour-setting-lint.js`).

**Still open:** A7 user browser look; independent Ask-tier review; contact form at defaults on a real contact page; zoom overlay after reading post-change.

**Coordinator check (2026-10-10):**

- Scope: all changes in the plan surface except `tailwind/tailwind.components.css`, where the shared `.product-info-blocks__callout` rule moved from the removed `--product-callout-*` variables to the `info` roles (a required consequence; awaiting the user's approval with the batch). New untracked `lib/colour-setting-lint.js` (in surface; `git add` at commit).
- Merchant data: `templates/index.json` changes five `color_scheme` values only (three from `scheme-2`, two from `scheme-3`, one of them block level); `templates/product.json` only deletes the seven saved values of removed settings; `config/settings_data.json` adds schemes 4 and 5, the `card_background_color` values and the `scheme-1` badge, in `current` and in the preset (keeps the shipped defaults consistent). No re-serialization.
- Deviations to note for the user: `scheme-4` text `#1f3223` instead of `#263d29` (contrast on sage); the contact form text at defaults moves from `#1a1a1a` to the `scheme-2` foreground `#263d29` (the plan expected no change at defaults); `templates/page.contact.json` exists, but the store has no page at `/pages/contact` (404), so the form was not rendered; a page using that template is needed to check it.
- Prettier passes on all changed non-merchant files; `assets/tailwind.output.css` matches a fresh build; `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `lint:doc-paths`, `test:validators`, `scan:contrast` (0 failing pairs), `test:theme-check` (151 files, no offenses) pass.

**Review round 1 (2026-10-10): FAIL** (external verifier). Proven: the five sage instances and their roles at 1440 and 390, white cards, callout and collapsible roles, merchant diffs limited to the listed keys, no removed setting or variable left, card triplets on every scheme, the halo without raw colours, build byte-identical, contrast 0 failing pairs, `test:layout` 0 new issues. Findings: (1) the lightbox backdrop became `rgba(0,0,0,0.8)` instead of opaque black (lighter than HEAD); (2) the contact form defaulted to `scheme-2`, whose unlayered background beat `bg-card`, so the default panel turned grey; (3) the badge allowlist matched IDs in section and block schemas too; (4) `--color-card` existed only as a Tailwind inline token, so CSS consumers got nothing and `colour-role-sync` did not guard it.

**Correction round 1 (coordinator, 2026-10-10):**

- (1) New fixed scrim `--color-scrim-solid: rgb(0, 0, 0)`; the lightbox backdrop uses `bg-scrim-solid` with the merchant opacity, as HEAD did with `#000000`. Reference scrim row updated.
- (2) `form_color_scheme` defaults to `scheme-5` (white Page scheme); `bg-card` removed from the panel, the scheme supplies the background. Rendered `/pages/privacy-policy?view=contact` carries `color-scheme-5`. Remaining default change: text `#1a1a1a` → `scheme-5` foreground `#263d29` (for the user).
- (3) The allowlist applies only to `config/settings_schema.json`; the section schema regex also reads `{%- schema -%}`. New test: badge IDs in a section and a block fail (2 failures).
- (4) `--color-card: rgb(var(--color-card-background))` re-declared in the scheme loop (rendered 5 times on home); `colour-role-sync` treats a role on `--color-card-background` as scheme dependent. New test: omitting it per scheme fails.
- Validators: `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `lint:doc-paths`, `test:validators` (architecture 209/209), `scan:contrast` 0 failing, `scan:compat`, Prettier, `test:layout` 0 new issues.

**Review round 2 (2026-10-10): FAIL on documentation only** (external verifier). All four round 1 defects proven closed (lightbox `rgb(0,0,0)` at opacity 1 like HEAD at 1440 and 390; contact white at defaults and picker-driven; 90 lint probes; `var(--color-card)` on `:root` and all five schemes, sync fixture fails when omitted); regressions none; 251 validator tests; 0 contrast failures; 0 new layout issues. Finding (P3): the reference said every layer-2 role sits on an alpha step and did not name the contact picker default.

**Correction round 2 (coordinator, 2026-10-10):** the layer table names `--color-card` as the role without a step; the standalone-settings paragraph states the global-only allowlist scope and the `main-page-contact` `form_color_scheme` default `scheme-5`. Documentation only.

**Review round 3 (2026-10-10): FAIL on documentation only** (external verifier). Implementation unchanged since round 2 (SHA-256 of 22 changed and 396 tracked files); every colour-section statement checked. Findings (P3): the layer table named `--color-card` as the only role without a step, but `--color-scrim-solid` and `--color-on-scrim` are fixed values too, and the mapping rule required every new role to sit on a step; the scrim row said the lightbox strength comes from the merchant opacity setting, but the open animation in `tailwind.animates.css` settles at opacity 1 (pre-existing, same on HEAD).

**Correction round 3 (coordinator, 2026-10-10):** the layer table lists the three named exceptions; the mapping rule allows a stepless role only as such a named exception; the scrim row describes the lightbox backdrop as opaque without claiming the setting controls it. The ineffective `zoom_overlay_opacity` setting is filed on the board for the product page work. Documentation only.

**Review round 4 (2026-10-10): PASS** (external verifier). Implementation byte-identical since round 2; all 20 layer-2 roles enumerated (17 on alpha steps, the three named exceptions listed); every colour-section statement matches the code; 251 validator tests pass. Open for the user: the `tailwind.components.css` callout change, the `scheme-4` text `#1f3223`, the contact form text `#263d29`, and the browser look (A7).

**Accepted** (user, 2026-10-10): the callout change in `tailwind.components.css`, the `scheme-4` and contact text colours, and the browser look (A7).
