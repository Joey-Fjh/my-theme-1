# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-09-28.

## Open decisions

Active: phase 2 plan (file ownership map for mixed directories), to draft next.

Queued (decide before the phase that needs them):

- **Old CSS structure conventions (before phase 2 ends).** The deleted `css-layer-allowlist.json` and old `lint:theme` held theme CSS rules the skeleton validators do not check: the `tab-nav-item` class on `role="tab"` (with the `product-gallery__thumbnail` exception), promoted snippet prefixes (`tab-nav-item`, `accordion__`, `icon-with-text-item`, `buy-buttons__`), the `components.css` ban on `*-section` roots, and `tailwind.animates.css` excluded from motion lint; also the newsletter overlay stylesheet scoping note. Options once the phase 2 Tailwind ownership map exists: a theme-only lint allowlist in the new validators, manual review, or drop with the old CSS structure. Evidence: `docs/migration/step1/retention-audit.md` (C3–C5, C10).
- **Migration stop-loss point (before phase 4).** The latest date, or the capability threshold, at which the migration stops expanding and design rework starts, given the three-submission / 90-day constraint in `docs/project.md`. Owner: user (with the business owner).


## Evidence

- Swiper resolved (user, 2026-09-28): keep Swiper as the skeleton's selected carousel library (skeleton `AGENTS.md:11`). The earlier open question rested on a wrong premise (the skeleton ships no Swiper asset but had already selected it). How carousels mount under the module model is settled in phases 2-3 per `docs/references/architecture/javascript-runtime.md`.
- Phase 0a (2026-09-28): capability inventory, merchant references, runtime dependencies, sizes, and browser checklist under `docs/migration/phase0/`. Review 1 found three defects (CAP-15 too coarse, CAP-22 cited a nonexistent Swiper decision, Swiper section miscount); all corrected and re-verified. Notable: section type `promo-bannder` is a typo fixed in merchant JSON and must not be renamed; theme-owned JS+CSS on every page is about 1.03 MB raw / 184 KB gzip.
- Process calibration: write acceptance counts from commands, not by hand; execution prompts must state that open board decisions may be cited but not decided.
- `docs/migration/step1-outer-files.md`: read-only comparison of files outside the business directories (S/T/M/D/? classification, required checks, proposed order). Corrections already accepted: do not check out `docs/` or `README.md` wholesale (`docs/project.md`, `docs/agent/*` and `README.md` are theme-owned or merged by hand); replace skeleton-owned directories wholesale instead of per-file `git rm`; drop `merge -s ours`; rename `package.json` `name` back to `my-theme-1`.
- Probe run of the skeleton `lint:theme` against this theme (2026-09-24, not kept): 343 findings in 96 files. 121 missing `data-module-id`, 86 Alpine attributes containing Liquid or statements, 29 Alpine API calls outside `alpine.adapter.js`, about 80 typography/color token-chain bypasses.
- External review (GPT, 2026-09-28), points adopted: capability inventory with merchant JSON references as the definition of "preserve business logic"; freeze a behavior baseline before old validators are replaced; per-file ownership for mixed directories; `npm ci` early; Theme Editor section load/unload and block select as acceptance items; a stop-loss point. Not adopted: design first, compatibility layer, a single end-of-migration acceptance.

## Deferred ideas

- Backport the merchant JSON `.prettierignore` exclusion to the skeleton once settled here.
- When the skeleton `lint:doc-paths` arrives in phase 1, decide whether `docs/migration/` is scanned; the reports cite skeleton-only paths.
