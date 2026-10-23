# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-23.

## Batch B5: `promo-bannder` small images share one ratio

**Status:** authorized by the user 2026-10-23 (coordinator executes in this session; `shopify:dev` running, started by the user); closed 2026-10-23: Ask review PASS (code); the user looked at the home page and accepted.

**Why.** Reported by the user, 2026-10-23, with screenshots: in `promo-bannder` the small image in each panel takes its own image's ratio (landscape in "Active Ingredients", portrait in "Botanical Extracts"); target: one width and height, a setting optional. Classified as code (reading, not yet measured): the call to `snippets/image.liquid` passes no `aspect_ratio`, so the snippet writes the image's own `width/height` into `--aspect-ratio` and `.theme-image { aspect-ratio: var(--aspect-ratio) }` applies; the section's `.promo-bannder__small { aspect-ratio: 1.7 / 1 }` sits on the same element at the same specificity and loses. The section's intent was already 17:10 (`placeholder_aspect_ratio: '17/10'`). User chose option A (fixed ratio, no setting) over B (a ratio setting), 2026-10-23.

**Outcome.** Every small image in `promo-bannder` renders at 17:10 whatever the uploaded image's ratio, cropped with `object-fit: cover` from the centre; empty panels keep the 17:10 placeholder. Width, position, the large image and every other part of the section are unchanged.

**Implementation surface.** `sections/promo-bannder.liquid` only: the small image `render 'image'` call gains `aspect_ratio: '17/10'`; the `.promo-bannder__small` rule in its `{% stylesheet %}` is deleted and the class leaves `wrapper_class` (its only consumer, `git grep`, 2026-10-23).

**Estimate:** about 20 minutes, plus one separate-session Ask review.
**Checkpoint:** after the edit and the validators, report before the review prompt.
**Bar:** judged at the section's default settings with the dev store's current images. Must-fix: any small image whose rendered box is not 17:10 (within 1px) at 390 and 1440; a change to the large image, panel layout or text; a failing validator; a new `test:layout` issue. Accepted residue: the crop of an image whose subject is off centre (the merchant picks the image).

**Review tier: Ask** (Liquid markup and a deleted class).

**Acceptance checks.**

1. `git diff` touches only `sections/promo-bannder.liquid`: the `aspect_ratio` argument, the `wrapper_class` value, and the deleted rule.
2. The rendered small image wrappers carry `--aspect-ratio: 17/10`, and their measured width / height is 1.7 (within 1px) for every panel at 390 and 1440 (Chrome DevTools MCP against `shopify theme dev`, run by the verifier); the user's look at the home page confirms.
3. `npm.cmd run lint:theme`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run test:theme-check` pass; `npm.cmd run test:layout` with `shopify:dev` running reports 0 new issues; `npx prettier --check sections/promo-bannder.liquid`.

**Execution log.**

- Done: `sections/promo-bannder.liquid` small image call gains `aspect_ratio: '17/10'` (`placeholder_aspect_ratio` kept); `wrapper_class` `'promo-bannder__small h-full w-full'` → `'h-full w-full'`; the `.promo-bannder__small { aspect-ratio: 1.7 / 1; }` rule deleted. `git diff --stat`: 1 theme file, 2 insertions, 5 deletions (rest is this record).
- Validation (2026-10-23): `npm.cmd run lint:theme` passed (three pre-existing `dead-setting-unprovable` notes); `npm.cmd run lint:liquid-syntax` passed; `npm.cmd run test:theme-check` 157 files, no offenses; `npm.cmd run lint:compat` passed (embedded: 66 stylesheet blocks); `npm.cmd run test:layout` against the running `shopify:dev`: New issues (not in baseline): 0 (wall time 189237 ms); `npx prettier --check sections/promo-bannder.liquid` passed.
- Not measured by the coordinator (rendered ratio at 390 and 1440): left to the verifier (Chrome DevTools MCP) and the user's look, per the plan.
- Note, outside the surface: the IDE flags the schema's `disabled_on.groups` value `custom.overlay` (pre-existing, Theme Check reports no offense).
- **Checkpoint reached:** reported to the user with the review prompt.

**Review 1 (full, separate session, 2026-10-23): PASS (code).** Scope (three planned edits), root cause (`snippets/image.liquid` uses the image's own ratio without `aspect_ratio`), fix (one call for every panel; placeholder still 17/10), regression (large image, layout, text, schema unchanged), no consumer of `promo-bannder__small` left (`git grep`, including `docs/references/`). Re-run: `lint:theme`, `lint:liquid-syntax`, `test:theme-check` (157 files, no offenses), `lint:compat`, prettier passed. Not proven by the review, by the user's instruction: the rendered ratio with the uploaded images, which the user confirms by looking (acceptance check 2); `test:layout` was not rerun.
