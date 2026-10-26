# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan F1: fonts and weights (backlog group 2)

**Outcome.** The font group closes with one family: the 500 face is confirmed loaded, no serif heading role is added, and the design's monospace italic (prices, numbers) becomes the body family with tabular figures, upright. `design.md` records the decision and its official basis.

**Decided (user, 2026-10-26).** Option A: keep one sans family. Basis, Shopify Theme Store requirements read through Shopify Dev MCP on 2026-10-26: requirement 15 (font pickers only, defaults from available fonts, bold, italic and bold-italic loaded through `font_modify`), which the theme already meets (`snippets/css-variables.liquid`); design criterion "Consistent typography" (consistent font pairing everywhere), which rules out a serif only in the product page's editorial sections; requirement 2 (Uniqueness) names typography swaps as cosmetic, so a serif preset would not answer the first rejection. 500 weight: `heading_weight` and `subtitle_weight` default to 500 and their faces are emitted by `font_face` (static evidence; the browser check is acceptance check 3).

**Dependencies.** `npm.cmd run shopify:dev` running for acceptance check 3 and `test:layout`.

**Implementation surface.**
1. `sections/ritual-steps.liquid`: the prices (`ritual-steps__mobile-price`, `ritual-steps__product-price`) lose `italic` and gain tabular figures; the step badge (`ritual-steps__badge`, number plus label, already uppercase on an ink chip) gains tabular figures. The italic section-heading tier and the style B outline numeral stay (accepted design, B6).
2. `sections/formula-details.liquid`: `formula-details__number` gains tabular figures.
3. `docs/design/design.md` (Typography: the decision and its basis in one or two sentences) and `docs/design/product/formula-details/notes.md` (the "waits for the font-role decision" line).

**Method.** Tabular figures through the Tailwind `tabular-nums` utility in markup or `font-variant-numeric: tabular-nums` in the section's `{% stylesheet %}`, whichever the section already uses for that element; then `npm.cmd run build:tw` if a new utility is used.

**Review tier.** Ask (Liquid markup).

**Estimate:** 1 hour plus the Ask review.

**Checkpoint:** after the edits and validators, before the review; stop if a change needs more than the surface above.

**Bar:** Must fix: an acceptance check failing; a new `test:layout` issue. Accepted residue: font weights a merchant gets when choosing a different body family from the heading family (synthesised medium in `sections/search.liquid`). Judged on the default settings.

**Acceptance checks.**
1. `git grep -n "italic" sections/ritual-steps.liquid` shows no price element; `git grep -n "tabular" sections/ritual-steps.liquid sections/formula-details.liquid` shows the badge, both prices and the number.
2. Computed style (Chrome DevTools MCP, home and product at 1440): `font-variant-numeric: tabular-nums` and `font-style: normal` on a ritual price, `tabular-nums` on a `formula-details__number`.
3. Network panel on home: an Instrument Sans weight 500 font file loads, and the computed `font-weight` of a section heading is 500.
4. Validators pass: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run scan:compat`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:doc-paths`, and `npm.cmd run test:layout` at 390 and 1440 with 0 new issues.

**Status.** Planned 2026-10-26. Authorized by the user 2026-10-26 ("开始"); implemented by the coordinator in this session, no subagent and no external execution prompt.

**Execution (2026-10-26).** Prices and `formula-details__number` carry the `tabular-nums` utility in markup (the prices lose `italic`); the three `ritual-steps__badge` elements take `font-variant-numeric: tabular-nums` in the existing `:where(.ritual-steps__badge)` rule instead, because a utility on that own-class element failed `mixed-element`. `build:tw` adds the `tabular-nums` utility to `assets/tailwind.output.css`. Docs: `docs/design/design.md` (One family paragraph), `docs/design/product/formula-details/notes.md`.

**Validation (coordinator, 2026-10-26).**
1. `git diff`: no `italic` left on a price; `tabular-nums` on both prices, the badge rule and the four `formula-details__number` spans.
2. Chrome DevTools MCP at 1440 against `shopify theme dev`: home `.ritual-steps__badge`, `.ritual-steps__product-price` and `.ritual-steps__mobile-price` computed `font-variant-numeric: tabular-nums`, `font-style: normal`, Instrument Sans; product `/products/floral-white-top` `.formula-details__number` the same.
3. Home: `instrumentsans_n5` woff2 requested, `document.fonts` reports Instrument Sans 500 loaded, the first `main h2` computes weight 500.
4. `lint:theme` passed; `test:theme-check` 157 files, no offenses; `scan:compat` passed; `lint:liquid-syntax` passed; `lint:doc-paths` passed; `lint:records` passed; `prettier --check` on the changed files passed; `test:layout --widths 390,1440`: 0 new issues.

**Review 1 (external Verifier, 2026-10-26): FAIL**, two findings, storefront checks proven. (1) `design.md` presented the one-family choice as a Theme Store prohibition; the requirement asks for a consistent, complementary pairing. (2) No `frontend-design` output was recorded, which `AGENTS.md` requires for typography direction. The verifier did not run `scan:compat` (calls `build:tw`) or `test:layout` (writes reports) under its read-only role; the coordinator's runs above stand for those.

**Correction (coordinator, 2026-10-26).**
1. `docs/design/design.md` One family paragraph: the requirement is quoted as a consistent, complementary pairing, and one family in every section is stated as the project's choice.
2. `frontend-design` (`.agents/skills/frontend-design/SKILL.md`, read 2026-10-26), applied to the font decision: "use one family or two, and if two, make them clearly distinct" (one family is within it); its calibration list names "a warm cream background with a high-contrast serif display" and "a monospace face for small data labels" as generated-design defaults, both of which the product designs show on a cream canvas, so dropping the serif and the monospace follows it; "spend your boldness in one place" supports seeking distinctiveness in structure (home polish, group 4) rather than a font swap. Suggestions not adopted, for the user to discuss at the polish pass: it lists all-caps labels and `01 / 02 / 03` numbering as defaults unless the content is a sequence (the ritual steps are one; the `formula-details` attributes and ingredients are not, and the step badges and badges are uppercase by `design.md`).

**Review 2 (external Verifier, correction, 2026-10-26): PASS.** Noted as unproven, not a defect: the chronology of the `frontend-design` reading.

**After review (coordinator, user's point, 2026-10-26).** `design.md` wording: one family is the default preset's value for the two global font pickers, not a theme limit; a merchant can choose a serif through the heading font picker. Documentation wording only; `lint:doc-paths`, `lint:records` and `prettier --check` rerun.

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.
