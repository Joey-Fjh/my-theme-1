# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-11.

## 6-D2 Design preset

**Status:** approved and authorized by the user 2026-10-11 ("先这样，后期可以改设置": the values are a starting point, tuned later through the settings); the coordinator executes. Executed; accepted by the user 2026-10-12.

**Outcome:** the Ceylune preset carries `docs/design/design.md`'s default palette and fonts, so the store shows the designed look. One browser look by the user covers 6-D1 (`1e8ebfd`) and this batch.

**Review tier:** Show (merchant configuration values only; no Liquid, schema, CSS or JS). The user's browser look is the review.

**Dependencies:** 6-D1 committed (`1e8ebfd`: the weight 500 options this preset relies on); `npm.cmd run shopify:dev` running.

### Items

In `config/settings_data.json`, `current` and `presets.Ceylune` identically (they are identical today):

1. **Fonts:** `type_header_font` and `type_body_font` `instrument_sans_n4` (corrected during execution, see Progress).
2. **Page margin:** `page_margin` 24 (fluid from 16px at 375, 6-D1).
3. **One dark:** every `#1b2900`, `#1f3223` and `#111827` in the schemes becomes ink `#263d29` (inverse background, sage scheme text and border, button labels).
4. **Inverse scheme (`scheme-1`) buttons on the palette:** primary background and border `#ffffff`, label `#263d29`; secondary transparent with `#ffffff` label and border (today `#f9fafb` / `#111827`, off-palette).
5. **Inputs, every scheme:** text `#263d29`, border and placeholder `#677769` (6-D1 defaults); input background stays `#ffffff`.
6. **Record:** `docs/design/design.md` "Default settings this implies" and "Gaps found" lines say these landed in 6-D2.

Out of surface: every other setting and every scheme value not named above (status pairs, badges, accents, card backgrounds), templates and section groups.

### Implementation surface

`config/settings_data.json` (the values above only), `docs/design/design.md` (record lines).

### Acceptance checks

1. A script diff of `settings_data.json` before and after lists only the keys in items 1–5, in both `current` and `presets.Ceylune`; the leading comment and the file's formatting are kept.
2. No `#1b2900`, `#1f3223`, `#111827`, `#151515`, `#767676` or `#717171` remains in `settings_data.json`.
3. `npm.cmd run test:theme-check` and `npm.cmd run lint:theme` pass.
4. Live home at 375 and 1440: `--font-heading-family` and `--font-body-family` start with Instrument Sans, its 500 face loads, `--page-margin` is 16px at 375 and 24px at 1440.
5. `npm.cmd run test:layout`: 0 new issues; the baseline may only shrink.
6. Browser look by the user: home at 375 and 1440, together with 6-D1.

### Progress

Executed by the coordinator, 2026-10-11.

- **Items 1–5:** a script applied the values to `current` and `presets.Ceylune` and printed every changed leaf: 27 per side (fonts ×2, `page_margin`, `scheme-1` background, primary button background, label and border, secondary border and badge label, `scheme-4` text, border and focus ring, input text, border and placeholder in all five schemes). The leading comment and 4-space formatting are kept (54 lines out, 54 in). The secondary label in `scheme-1` was already `#ffffff`.
- **Correction, item 1:** the live page showed `neue_haas_unica_n4` rendering as Instrument Sans. The three-column font table read during the Typography section is Shopify's **deprecated fonts** list (font, handles, replacement), not the available list: Neue Haas Unica is deprecated, replaced by Instrument Sans, and Theme Store presets may not use deprecated fonts. The preset now names `instrument_sans_n4` directly; the rendered result is unchanged. Reported to the user.
- **Item 6:** `docs/design/design.md` Typography default family, the four "Default settings this implies" 6-D2 parts and the "Gaps found" list updated; board line updated.

**Validation:**

| Check | Result |
| --- | --- |
| 1 Changed keys only | **PASS** (script diff above). |
| 2 No old values left | **PASS**: 0 matches for the six hex values. |
| 3 `test:theme-check`, `lint:theme` | **PASS**: `lint:theme`; `test:theme-check` after the font correction (151 files, no offenses; Sonnet helper, read-only). |
| 4 Live fonts and margin | **PASS**, home at 375 and 1440: heading and body family Instrument Sans, its 500 face loaded, first heading weight 500; `--page-margin` 16px at 375, 24px at 1440; inverse scheme background `rgb(38, 61, 41)`. |
| 5 `test:layout` | **6 new issues**, all `page-margin` (Sonnet helper, read-only, 179s): home `ritual-steps` mobile rail CTA of slot 2 in both variants @800; collection-all toolbar tab links 5 @1040 and 8 @1920; product comparison table `h1` @2080; blog tab 1 @360. Classified by the coordinator on a fresh load: the collection tab bar overflows at 1040 with 5.9px to the right edge (fails the old 10px margin too; the merchant's test collection names are long), and at 1920 sits 19.4px from the edge (fails only the new 24px margin); the other four elements are absent at that width on a fresh load (rail and tab state), the `page-margin` run-to-run variation already noted in 6-T5. None is a new defect of this batch; all belong to the polish pass (rails, tab bars). The user approved adding the six to the baseline (2026-10-12); the coordinator's append was blocked by the permission classifier as a CI bypass, so the user ran the append script (append only): baseline 32 → 38, existing entries unchanged. |
| 6 Browser look | **Accepted** by the user 2026-10-12 (6-D1 and 6-D2 together: no problems; a question on one section's spacing answered: its proportions match the design, the remaining differences are polish-pass items). |
