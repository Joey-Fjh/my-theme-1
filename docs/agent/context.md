# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-23.

## Batch B6: packshot guidance, style B numeral, routine-showcase packshot box

**Status:** closed 2026-10-23: Show tier; the user's look accepted `routine-showcase`, the style B numeral and the style B packshot height.

**Why.** Reported by the user, 2026-10-23, with screenshots of the design and the current home page (board topic "Packshot images …", in this commit's `docs/agent/board.md` history). The bottles looked small because the home template sets no `product_image` and the fallback featured images are 616×616 PNGs with the bottle in the middle; with a tall transparent packshot uploaded in the editor (about 1:2.8) both sections render it large. User decisions, 2026-10-23: guidance option A (state the ratio in the setting info, no new setting); sizes are judged by the user's look, not read from the design's pixels (`docs/design/design.md`: "the design's pixel distances are read only as which intent applies"). Takes from `backlog.md` the style B numeral and packshot part of the `ritual-steps` line and the packshot box part of the `routine-showcase` line.

**Outcome (intent).** Revised with the user, 2026-10-23, after checking Shopify's sources (Shopify Dev MCP: input settings, image performance guidance, Theme Store settings requirement; no rule on floating packshot size; image_picker focal points matter only when a theme crops with cover). Approach: the packshot box has a fixed height and a capped width, and the image is contained in it from the bottom centre, so the image shows at the box height until its width reaches the cap (the common adapt-to-image pattern, without cropping). A ratio or size dropdown was considered and not adopted: with `contain` padding inside the image stays, with `cover` the product is cut.

1. Both `product_image_info` texts are short and plain (user, 2026-10-23): shown at a fixed height; best is a tall transparent PNG with the product filling it; wider images look smaller.
2. `ritual-steps` style B (`scroll_carousel`): packshot box at a fixed height with its width capped inside the media column, clear of the text column; the outline numeral sits behind the bottle across its middle, sized from the box height so it reads wider than a tall bottle on both sides. Mobile numeral (`--mobile`) and style A unchanged.
3. `routine-showcase`: packshot box width capped at the arch width; a tall packshot shows whole, its base may sit slightly below the arch but stays inside the section.

Tuned with the user's tall packshot (about 1:2.8) as the reference image; the square featured image is the second check (shown at the box height when its width fits the cap).

**Implementation surface.** `locales/en.default.schema.json` (the two `product_image_info` values); `sections/ritual-steps.liquid` and `sections/routine-showcase.liquid`, `{% stylesheet %}` blocks only. A change outside the stylesheet blocks (markup, schema) is a stop-and-report point.

**Estimate:** about 1 hour, plus the user's look (one or two value rounds).
**Checkpoint:** after the first values for points 2 and 3, report and wait for the user's look before any further tuning.
**Bar:** judged by the user's look on the home page at 1440 and 390 with the tall packshot uploaded in the editor, default section settings. Must-fix: the numeral hidden on either side of the bottle in style B at 1440; a routine-showcase packshot cut by the section edge; a change to style A, the mobile numeral, text, controls or other sections; a failing validator; a new `test:layout` issue. Accepted residue: exact sizes the user accepts by eye; square or wide images showing small (documented by point 1).

**Review tier: Show** (CSS in `{% stylesheet %}` blocks and locale string values only; raised to Ask if markup or schema must change).

**Acceptance checks.**

1. `git diff` touches only the two `product_image_info` values and the two `{% stylesheet %}` blocks.
2. The user's look accepts points 2 and 3 at 1440 and 390.
3. `npm.cmd run lint:i18n`, `npm.cmd run lint:theme`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check` pass; `npm.cmd run test:layout` with `shopify:dev` running reports 0 new issues; `npx prettier --check` on the changed files.

**Execution log.**

- Round 1 (2026-10-23), first values:
  - `routine-showcase` (`{% stylesheet %}`, desktop): `.routine-showcase__panel` `align-items` `flex-end` → `flex-start` (the arch, 90% of the stage, now sits at the top, leaving the bottom tenth free); `.routine-showcase__product-float` `left: 50%; top: 34%; width: 46%; height: 74%; transform: translateX(-50%)` → `left: 0; bottom: -6%; width: 100%; height: 70%` (fixed height, width capped at the arch, base just below the arch and inside the stage).
  - `ritual-steps` style B (`{% stylesheet %}`): `.ritual-steps__packshot` `inset: 0 24%` → `inset: 0` (width cap = media column); `.ritual-steps__carousel-col--media .ritual-steps__outline-num` `font-size` multiplier `2.7` → `5` and `inset: 16% 0 0` (centred lower, across the bottle body). A height-based size (`60cqh`) failed `lint:theme` `stylesheet-font-size` (only type steps or relative units are allowed), so the size stays on `--type-step-8`; it follows the viewport width, not the column height.
  - `locales/en.default.schema.json`: both `product_image_info` values → "Shown at a fixed height. A tall transparent PNG with the product filling it works best; wider images look smaller. Defaults to the product('s) featured image."
  - Validation: `lint:theme`, `lint:i18n` (and unused keys), `lint:compat` (66 stylesheet blocks), `test:theme-check` (157 files, no offenses), `npx prettier --check` on the three files passed. `test:layout` runs after the values are accepted.
- **Checkpoint reached:** waiting for the user's look at 1440 and 390.
- Round 2 (user's look, 2026-10-23): `routine-showcase` accepted; style B numeral size accepted; style B bottle too tall against the design's intent (about three quarters of the height, space above the bottle). `.ritual-steps__packshot` `inset: 0` → `inset: 10% 0 0` (box 90% of the column, base unchanged). The full column height was already the case before B6.
- Final validation (2026-10-23): `lint:i18n` (and unused keys), `lint:theme`, `lint:compat` (66 stylesheet blocks), `test:theme-check` (157 files, no offenses), `npx prettier --check` on the three files passed; `npm.cmd run test:layout` against the running `shopify:dev`: New issues (not in baseline): 0 (wall time 188202 ms). `git status`: no merchant file changed (the packshots uploaded in the editor stay in the development theme).
- Info text, round 2 (user, 2026-10-23: too vague, give the ratio or resolution): "Shown at a fixed height. Best: a transparent PNG about 1:2.5, at least 640 × 1600 px, with the product filling it. Wider images look smaller. Defaults to the product('s) featured image." The size follows the box: on desktop the packshot is at most about 70% of the stage (stage height at most the screen height minus 4rem), about 700 CSS px at a 1080 px screen, so about 1400 px at 2x density.
