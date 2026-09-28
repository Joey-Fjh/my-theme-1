# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-09-28.

## Open decisions

Active: none while phase 1 is planned or executing (see `docs/agent/context.md`).

Queued (decide before the phase that needs them):

- **Migration stop-loss point (before phase 4).** The latest date, or the capability threshold, at which the migration stops expanding and design rework starts, given the three-submission / 90-day constraint in `docs/project.md`. Owner: user (with the business owner).

- **Swiper (before phase 3).** The skeleton ships no Swiper asset, but its Cleanup Test treats Swiper as a selectable architecture direction. Options: keep the vendored `vendor-swiper.min.js` behind a skeleton-style module and lifecycle, or replace carousels with another approach.

## Evidence

- Phase 0a (2026-09-28): capability inventory, merchant references, runtime dependencies, sizes, and browser checklist under `docs/migration/phase0/`. Review 1 found three defects (CAP-15 too coarse, CAP-22 cited a nonexistent Swiper decision, Swiper section miscount); all corrected and re-verified. Notable: section type `promo-bannder` is a typo fixed in merchant JSON and must not be renamed; theme-owned JS+CSS on every page is about 1.03 MB raw / 184 KB gzip.
- Process calibration: write acceptance counts from commands, not by hand; execution prompts must state that open board decisions may be cited but not decided.
- `docs/migration/step1-outer-files.md`: read-only comparison of files outside the business directories (S/T/M/D/? classification, required checks, proposed order). Corrections already accepted: do not check out `docs/` or `README.md` wholesale (`docs/project.md`, `docs/agent/*` and `README.md` are theme-owned or merged by hand); replace skeleton-owned directories wholesale instead of per-file `git rm`; drop `merge -s ours`; rename `package.json` `name` back to `my-theme-1`.
- Probe run of the skeleton `lint:theme` against this theme (2026-09-24, not kept): 343 findings in 96 files. 121 missing `data-module-id`, 86 Alpine attributes containing Liquid or statements, 29 Alpine API calls outside `alpine.adapter.js`, about 80 typography/color token-chain bypasses.
- External review (GPT, 2026-09-28), points adopted: capability inventory with merchant JSON references as the definition of "preserve business logic"; freeze a behavior baseline before old validators are replaced; per-file ownership for mixed directories; `npm ci` early; Theme Editor section load/unload and block select as acceptance items; a stop-loss point. Not adopted: design first, compatibility layer, a single end-of-migration acceptance.

## Deferred ideas

- Backport the merchant JSON `.prettierignore` exclusion to the skeleton once settled here.
- When the skeleton `lint:doc-paths` arrives in phase 1, decide whether `docs/migration/` is scanned; the reports cite skeleton-only paths.
