# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-09.

## Plan 6-V2: validator gaps and reference fixes

**Status:** authorized by the user 2026-10-09 ("给prompt吧", after accepting the batch on the board the same day). Executes in an external session.

**Outcome.** Three guards that were manual or missing become `lint:theme` checks, and three reference inaccuracies found by the closed-area audit are corrected. No theme behaviour changes. Source: `docs/agent/board.md`, "Closed-area audit, done".

**Dependencies.** None. Removing any dead setting found here is **not** in this batch: it changes schema and merchant data, so each one is listed for a later decision.

### Implementation surface

- `.agents/skills/check-theme-architecture/scripts/` (`lint-theme.js`, `lib/`, `theme-architecture.test.js`, a new baseline file for dead settings), `.agents/skills/check-theme-architecture/SKILL.md`.
- `docs/references/style-system/css-architecture.md` (the `stage-pc` row), `docs/references/architecture/javascript-runtime.md` (duplicate GSAP boundary, File Ownership table), `docs/project.md` ("Acceptance, phase 3" contract now names the lint).
- Already in the working tree from the coordinator, part of this batch: `docs/agent/board.md` (stale overlay item removed), `css-architecture.md` (media query rule moved out of the `no-hover` bullet; `theme()` reworded so the Tailwind editor extension stops misreading it).
- Out of surface: every theme file (`layout/`, `sections/`, `snippets/`, `templates/`, `config/`, `assets/`, `tailwind/`, `locales/`).

### Work

1. **`js-section-mutation` and `js-custom-event`** in `lint:theme`, same pattern and skips as the existing `js-*-outlet` checks (vendor files, `.min.js`, `JS_LINT_SKIP`), honouring `/* lint-allow <id>: reason */`:
    - `new CustomEvent` only in `assets/events.js`;
    - `innerHTML =`, `outerHTML =`, `.replaceWith(` only in `assets/https.js` (SectionRefresher).
    Today's tree has no hit outside those files.
2. **`dead-setting`** in `lint:theme`:
    - section and block settings: a setting `id` in a section's `{% schema %}` is used when `settings.<id>` or `settings['<id>']` appears in that section or in any snippet it renders, followed transitively through `{% render %}` (static names only);
    - global settings in `config/settings_schema.json`: used when `settings.<id>` appears in any Liquid file under `layout/`, `sections/`, `snippets/`, `templates/`;
    - settings without an `id` (`header`, `paragraph`) are skipped; a file with dynamic access (`settings[` with a non-literal key) is reported once as unprovable instead of guessing;
    - the current dead settings go into a baseline file that may only shrink (same ratchet rules as `migration-baseline.json`); each entry is also listed in the execution log for the user's later keep / wire / remove decision.
3. **References:** `stage-pc` row says `(width >= 48rem)` / `tablet`, not "`pc` media query"; the GSAP on-demand boundary stated once in `javascript-runtime.md`; its File Ownership table marked as illustrative with a pointer to the import map in `snippets/scripts.liquid` as the full inventory; `docs/project.md` phase 3 acceptance names the two new checks instead of manual searches.

### Acceptance checks

1. `npm.cmd run lint:theme` passes on the current tree.
2. `npm.cmd run test:theme-architecture` passes, with new tests for: `CustomEvent` outside and inside `events.js`; each mutation form outside and inside `https.js`; a `lint-allow` exemption; a dead section setting; a setting used only through a rendered snippet (passes); a setting used through a two-level render chain (passes); a dead global setting; a dynamic-access file reported as unprovable; the baseline refusing to grow.
3. Probe: adding `new CustomEvent('x')` to a temporary copy of any feature module fails `lint:theme` (run in a test fixture, never in the tree).
4. `SKILL.md` has a row for each new check that matches the code.
5. `npm.cmd run lint` and `npm.cmd run test:validators` pass (the CI gate); `npm.cmd run doctor:agent` exits 0; `git diff --stat` touches only the surface.

**Review tier:** Ask (validator wiring and rule text). Independent Verifier after execution.

**Execution log:**
- 2026-10-09, **6-V2** (external executor): **`js-custom-event`** — `new CustomEvent` only in `assets/events.js`, same JS discovery/skips/`lint-allow` as other outlet checks. **`js-section-mutation`** — `innerHTML =`, `outerHTML =`, `.replaceWith(` only in `assets/https.js`. **`dead-setting`** — section/block ids consumed in section markup plus transitive static `{% render %}` snippets; global ids in `config/settings_schema.json` consumed anywhere in layout/sections/snippets/templates Liquid; ratchet `scripts/dead-settings-baseline.json` (`--write-dead-settings-baseline` / `--shrink-dead-settings-baseline`). **`dead-setting-unprovable`** — note (not a failure) when a file contains dynamic `settings[…]` / `section.settings[…]`; sections whose render closure includes that pattern skip section dead analysis.
- Dead settings (baseline, **6** entries — keep / wire / remove later, not this batch):

| File | Setting id | Kind |
| --- | --- | --- |
| `sections/scatter-gallery.liquid` | `image` | block |
| `sections/testimonial-featured.liquid` | `author_name` | block |
| `sections/testimonial-featured.liquid` | `image` | block |
| `sections/testimonial-featured.liquid` | `quote` | block |
| `sections/testimonial-featured.liquid` | `rating` | block |
| `sections/testimonial-featured.liquid` | `show_image` | block |

- Unprovable (notes on `lint:theme`, not failures): `sections/header.liquid`, `snippets/header-dropdown-super-menu.liquid`, `snippets/social-icons.liquid`.
- References: `css-architecture.md` `stage-pc` row → `(width >= 48rem)` / `tablet`; `javascript-runtime.md` GSAP boundary deduped, File Ownership marked illustrative + import map pointer; `docs/project.md` phase 3 names `js-custom-event` and `js-section-mutation`.
- Stop-and-report: none (today's tree has no `js-custom-event` / `js-section-mutation` violations outside the owner files).
- Validation: `lint:theme` passed (3 unprovable notes); `test:theme-architecture` 194 pass; `npm.cmd run lint` passed; `npm.cmd run test:validators` passed; `npm.cmd run doctor:agent` exit 0; Prettier `--check` clean on changed files.
- 2026-10-09, **coordinator check of the execution:** the six reported dead settings (`scatter-gallery` `image`; `testimonial-featured` `author_name`, `image`, `quote`, `rating`, `show_image`) were false positives: the block matcher required the literal `block.settings.<id>`, but these sections read blocks through loop variables (`image_block`, `testimonial_card_block`). Fixed in `lib/dead-setting-lint.js` (`<any variable>.settings.<id>`), regression test added, baseline shrunk to empty, `SKILL.md` row corrected. **The theme has 0 dead settings** (3 files are skipped as unprovable: `header`, `header-dropdown-super-menu`, `social-icons`). Tests 195 pass; `lint:theme` passes. Next: independent Verifier.
- 2026-10-09, **independent review round 1: FAIL**, all three findings confirmed and fixed by the coordinator: `new window.` / `globalThis.` / `self.CustomEvent` now fail outside `events.js`; dead-setting matching is scope-aware (`section.settings` for section settings, bare `settings` for globals, other loop variables for blocks), so a same-named setting in another scope no longer hides a dead one; comments are removed before matching (shared `maskNonMarkup`). Three existing fixtures had encoded the scope bug (bare `settings.x` for a section setting) and were corrected. The real theme still has 0 dead settings. Tests 198 pass.
- 2026-10-09, **independent review round 2: PASS** (no concrete defects; acceptance checks 1-5 pass; 0 dead settings confirmed by sampling 14 section/block settings and 3 globals). No theme file changed, so no layout check or browser look applies. Batch complete; waiting for the user's commit instruction.
- 2026-10-09, pre-commit (coordinator): the `stylesheet-directive` message in `theme-contracts.js` reworded so the Tailwind editor extension stops reading `theme()` as a call, and its stale `(min-width: 64rem)` hint changed to `(width >= 64rem)` per the 6-C2 media-query rule. `npm.cmd run lint` and `npm.cmd test` pass; the Tailwind build is unchanged.
