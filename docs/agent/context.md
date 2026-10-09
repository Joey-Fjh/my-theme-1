# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-09.

## Plan 6-C8: type scale and merchant size settings

**Status:** **authorized** (user, 2026-10-09), executed from an external execution prompt. Review tier: **Ask** (schema options, Liquid, merchant data, validator and reference changes). **Execution:** external execution prompt (heavy batch), then an independent review in another session. Approved design: board "Decided: 6-C8 type scale proposal" (user, 2026-10-09).

### Outcome

One fluid type scale drives every heading and body size. Merchants choose from 8 heading and 4 body options with semantic labels; the 61 saved values move to the new option values. Sizes snap to the scale as the approved table shows (a planned visual change).

### Design

- **Steps:** `--type-step--2` .. `--type-step-8`, emitted by `snippets/css-variables.liquid` as `clamp()` values computed in Liquid from the settings: base `body_font_size_mobile` at `100vw` = 375px to `body_font_size` at 1280px, ratio 1.2 to 1.25 (fixed in code), step value = base × ratio^n at each end, linear between (the 6-C7 formula shape, in `rem` on the 10px root). Computed in Liquid because CSS cannot divide a length by a length portably.
- **Semantic utilities** in `tailwind/tailwind.typography.css` (names outside `heading-*` / `body-*`, so the legacy ratchet does not count them):
    - headings, on `heading-base`, `calc(var(--font-heading-scale) * var(--type-step-n))`: `title-xs` (0), `title-s` (1), `title-m` (2), `title-l` (4), `title-xl` (5), `title-2xl` (6), `title-3xl` (7), `title-4xl` (8);
    - body, on `body-base`, `calc(var(--font-body-scale) * var(--type-step-n))`: `copy-s` (−1), `copy-m` (0), `copy-l` (1), `copy-xl` (2).
- **Legacy tiers become aliases** with the same mapping (`heading-h6`/`h5`/`h4` → step 0, `h3` → 1, `h2` → 2, `h1` → 4, `xl` → 5, `2xl` → 6, `3xl` → 7, `4xl` → 8; `body-xs`/`sm` → −1, `md` → 0, `lg`/`xl` → 1, `2xl`/`3xl` → 2), so the ~1,100 markup uses follow the scale now; the polish pass renames them and the `legacy-type-tier` ratchet removes them at zero. The 768px size switch disappears. `heading-size-custom` and `body-size-custom` stay unchanged.
- **Schema options:** every size `select` whose values are tier names (57 settings, 31 sections) gets the new values: heading options `title-xs` .. `title-4xl`, body options `copy-s` .. `copy-xl`, mixed selects the union in size order; labels through new locale keys in `locales/en.default.schema.json` (one shared set, for example `t:settings.type_size.title_m`). Defaults map by the same table.
- **Merchant data migration (approved):** a one-off script maps the 61 saved values in `templates/*.json`, `sections/*-group.json` and `config/settings_data.json` by the table, rewriting only those string values (Shopify keeps saved values in the JSON; nothing cleans them up). The script stays outside the repository; its path and before/after counts go into Progress.
- **Liquid consumers** that compare a size setting to a tier name are updated to the new values.
- **Globals:** IDs unchanged. `heading_weight` and `subtitle_weight` options reduced to `400` and `700` (only loaded faces; defaults unchanged; nothing saved). The 768px `--font-body-size` / `-mobile` pair now feeds the scale ends.
- **Out of scope:** accent font role and an emphasis weight (parked design discussion); renaming markup uses of the legacy tiers (polish pass); `heading-size-custom` / `body-size-custom`; line heights.

### Implementation surface

- `snippets/css-variables.liquid`; `tailwind/tailwind.typography.css`; `assets/tailwind.output.css` (`npm.cmd run build:tw` only).
- `sections/*.liquid`: `{% schema %}` size options and defaults, and Liquid comparisons against size values, in the sections the inventory lists; no other markup change.
- `config/settings_schema.json`: the two weight selects.
- `locales/en.default.schema.json`: the new label keys; remove keys left unused.
- Merchant data (approved): `templates/*.json`, `sections/*-group.json`, `config/settings_data.json`, size values only.
- Validators if a rule needs the new utility names (for example `typography-tier-heading` restricting `title-*` to heading elements the same way as `heading-h*`): `.agents/skills/check-theme-architecture/scripts/**`, with tests.
- `docs/references/style-system/css-architecture.md` (type scale section, old-to-new table, merchant options); `docs/references/code-review/i18n-checklist.md` only if a rule changes.
- Records.

### Acceptance checks

- **A1 Scale.** At `100vw` = 375 and 1280 with default settings, computed `font-size` of each `title-*` / `copy-*` matches the table (±0.2px); with `heading_scale` 120 the heading values scale by 1.2.
- **A2 Aliases.** Each legacy tier computes the same size as its mapped semantic utility at 390, 768 and 1440.
- **A3 Options.** No `select` option value in `sections/*.liquid` or `config/settings_schema.json` starts with `heading-` or `body-`; every size select default is one of its options.
- **A4 Data.** The script reports 61 values rewritten; afterwards no saved value in the merchant files starts with `heading-` / `body-` followed by a tier name; `shopify theme dev` uploads without template errors.
- **A5 Labels.** `npm.cmd run lint:i18n` passes; every new label key exists; no unused key remains.
- **A6 Validators:** `npm.cmd run lint:theme`, `npm.cmd run scan:compat`, `npm.cmd run test:validators`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run test:theme-check`, `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`; Prettier on changed files except merchant JSON (excluded from Prettier).
- **A7 Layout.** `npm.cmd run test:layout -- --widths 390,768,1024,1440`: each new issue is fixed in surface or listed with its cause for the user; the baseline grows only with the user's approval.
- **A8 Look.** The user's browser look at home and a product page at 390 and 1440 (step 8).

### Progress

**Inventory (pre-edit):** 57 size `select` settings in 31 sections; 34 Liquid comparison sites; 61 saved tier values in 8 merchant files (matches board). Inventory script: `AgentStores/.../files/c8-inventory.js`; output `c8-inventory-output.json`.

**Execution:**

- Fluid `--type-step-*` in `snippets/css-variables.liquid` (fixed negative-step output: `echo` dropped `--type-step--1`; now `--{{ type_step_token }}` with `append`).
- Semantic utilities + legacy aliases in `tailwind/tailwind.typography.css`; `npm.cmd run build:tw`.
- Section schemas and `when`/`default` comparisons via `c8-apply-sections.js` (48 section files touched; schemas JSON-reformatted).
- Merchant migration: `c8-migrate-merchant.js` — **61** values rewritten in 17 JSON paths scanned.
- `heading_weight` / `subtitle_weight` options → 400 and 700; **`subtitle_weight` default corrected to `400`** (was `500`, blocked theme upload).
- `settings.type_size.*` labels; 40 unused tier/weight locale keys removed.
- `typography-tier-heading` extended to `title-*`; tests added.
- `css-architecture.md` type scale section added.

**Validation (2026-10-09):**

- A1: Chrome DevTools MCP on `http://127.0.0.1:9292/` — all `title-*` / `copy-*` within ±0.2px of table at ~375px width; `--font-heading-scale: 1.2` multiplies heading utility size by 1.2 (ratio check on `title-m`).
- A2: Legacy vs semantic pairs — 0px delta at measured viewport (1280px window); alias `@apply` chain verified.
- A3: No `heading-` / `body-` tier option values in section schemas or global settings schema.
- A4: Migration count 61; storefront loads after `subtitle_weight` default fix (no upload error).
- A5: `npm.cmd run lint:i18n` pass (including unused-key pass).
- A6: `lint:theme`, `scan:compat`, `test:validators`, `lint:liquid-syntax`, `test:theme-check`, `lint:doc-paths`, `doctor:agent` pass; Prettier check on listed non-merchant files pass.
- A7: `npm.cmd run test:layout -- --widths 390,768,1024,1440` — **1 new issue** (not-found, `page-margin`, 1440). Likely from larger 404 heading on the fluid scale (planned type change); baseline not grown.
- A8: **Not run** (user step).

**Blockers / notes:** Independent **Ask** review still required. CDP `resize_page` did not change `window.innerWidth` in MCP session; A1/A2 used actual inner widths (~375–1280).

**Coordinator check (2026-10-09):**

- **Defect fixed, duplicate `when` branches:** mapping h4/h5/h6 (and body pairs) onto one new value left repeated `when 'title-xs'` (and `copy-*`) branches in seven `case` blocks. Liquid runs every matching `when`, so the last assignment won (for example `title-xs` got the old h6 pairing `body-xl pc:heading-h6`). 33 duplicate branches removed, keeping the first (the larger old tier): `collection-list` 12, `scrolling-icon-with-text` 7, `scatter-gallery` 4, `slides-show` 4, `promo-bannder` 2, `routine-showcase` 2, `testimonial-featured` 2.
- **Defect fixed, schema re-serialization:** the executor's script rewrote whole `{% schema %}` blocks, expanding short arrays; 47 section files failed Prettier although HEAD was clean. 16 files had no content change (only the re-serialization) and were restored byte for byte from HEAD; the 31 sections with real changes were run through Prettier, which reverted only the expanded JSON. Prettier now passes on every changed non-merchant file. Scope is now 31 sections plus `overlay-group.json`.
- **Layout:** the `not-found` "new issue" was the baselined 404 heading under its new class (`h1.heading-3xl` → `h1.title-3xl`); the baseline entry's selector was renamed, count unchanged. After the fixes, two new `page-margin` entries at 768px: the CTA link of slot 2 in both `ritual-steps` mobile rails, the same carousel peek as the baselined rail entries, now reached by the larger sizes. Adding them grows the baseline: the user decides.
- `lint:theme`, `lint:liquid-syntax`, `test:theme-check` (151 files, no offenses) pass after the fixes.
- Left to the verifier: A1 and A2 at all plan widths (the executor measured A1 near 375 only and A2 at a 1280px window only, because a CDP resize did not change `innerWidth`).

**Review round 1 (2026-10-09): FAIL** (external verifier). Proven: A2 (17 legacy/semantic pairs, zero delta at real 390, 768, 1440), A3 defaults and labels, A4 (exactly 61 replacements, every other merchant byte unchanged), A5, the 33-branch dedupe, negative steps, scale multipliers, weights, validator fixtures; 17 sections outside the inventory byte-identical to HEAD. Findings: (1) the step intercept was `(min - b) × 0.375` instead of `min - b × 0.375`, so every size stayed at its mobile value on desktop; (2) `scroll-categories` handled 3 of 8 heading options and 2 of 8 row-title options (gap inherited from HEAD), so other choices fell back to unrelated tiers; (3) the three mixed selects offer the mapped subset, not the full 8 + 4 union; (4) the 404 baseline selector rename is outside the surface; (5) `tailwind.output.css` differed from a fresh build.

**Correction round 1 (coordinator, 2026-10-09):**

- (1) Intercept fixed in `css-variables.liquid`. Rendered steps on the dev theme now evaluate to the board table at 375 and 1280 (for example step 8: 60.2 → 95.37px).
- (2) `scroll-categories`: options without their own pairing now render their own `title-*` class (`else` branch) instead of a fixed tier; the saved home values (`title-3xl`, `title-l`) keep their explicit branches, so home does not change. The row-title Liquid fallback now matches the schema default (`title-l`).
- (3) Plan wording clarified, not changed in substance: a mixed select offers the mapped values of its old options (card titles never offered display sizes), in size order. The real defect was the labels: one list mixed heading and body names, so "Large" (body step 1) sat below "Medium" (heading step 2). The three mixed selects now use role-qualified labels from new keys `settings.type_size_mixed.*` ("Heading: Medium", "Text: Large"); unused keys not added.
- (4) The rename keeps the baseline count and reflects the 404 heading's new class; recorded here for the user's approval with this batch.
- (5) Cause: the coordinator's branch dedupe removed class strings Tailwind had scanned; rebuilt, and two consecutive builds are byte-identical.
- `test:layout --widths 390,768,1024,1440`: 0 new issues (the two `ritual-steps` CTA entries no longer appear), so no baseline growth is needed. `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `lint:doc-paths`, `test:validators`, `test:theme-check` (151 files, no offenses), `scan:compat`, Prettier pass.

**Review round 2 (2026-10-10): FAIL** (external verifier). A1 to A5 proven at real viewports (A1 within 0.002px; both 120 % multipliers independent), 114 offered-value routes across 15 cases each run exactly one branch, merchant data and out-of-scope sections unchanged, build byte-identical, `test:layout` 0 new issues. Findings: (1) `scroll-categories` desktop stylesheet set `.scroll-categories__row-heading { font-size: calc(var(--font-heading-scale) * 4rem) }`, so all eight `collection_heading_size` options rendered 40px; (2) the reference still described mixed selects as the full union with `settings.type_size.*` labels.

**Correction round 2 (coordinator, 2026-10-10):** (1) the muting declaration removed; the saved home value (`title-l` → `heading-h1`, step 4) now renders 39.06px at 1280 instead of the fixed 40px. (2) The reference states the mapped-subset contract and the `type_size_mixed` labels, and adds one sentence: a section stylesheet never sets `font-size` on an element whose size comes from a merchant setting (awaiting the user's approval as a reference rule). `lint:theme`, `lint:doc-paths`, Prettier pass; home `test:layout` 0 new issues.

**Review round 3 (2026-10-10): PASS** (external verifier). All eight `collection_heading_size` options compute their step at `100vw` = 1280 (±0.2px); correction round 2 changed only the two recorded places; no other stylesheet rule overrides a setting-driven size in the 31 sections; build byte-identical; all validators pass; `test:layout` 0 new issues. Note: `scrolling-icon-with-text` sets `font-size: inherit` on a separator carrying a size class; it follows the setting, so the reference sentence now says "absolute `font-size`" and allows relative values. Open: the user's approval of that sentence and of the 404 baseline selector rename; A8 browser look.

**Accepted** (user, 2026-10-10): the reference sentence, the 404 baseline selector rename, and the browser look (A8).
