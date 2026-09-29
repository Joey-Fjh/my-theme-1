# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-09-29.

## Open decisions

Active: none. 3C-3 accepted and authorized (2026-09-29; Swiper CSS stays bundled, lightbox without motion until slice 0); its plan is in `docs/agent/context.md`. 3D follows, per `docs/project.md`.

Queued (decide before the phase that needs them):

- **Theme-only settings (before phase 3 batch 3D).** 54 setting IDs exist only in this theme, most referenced by Liquid or merchant JSON: which stay global and which move to section settings. Renaming or removing a referenced ID needs the user. Evidence: `docs/migration/phase2/settings-schema.md`.
- **Schema locale merge timing (before phase 3 batch 3D).** Merge `locales/en.default.schema.json` with the skeleton keys in phase 3, or per slice as each section schema is rewritten. Evidence: `docs/migration/phase2/locales.md`.
- **Migration stop-loss point (before phase 4).** The latest date, or the capability threshold, at which the migration stops expanding and design rework starts, given the three-submission / 90-day constraint in `docs/project.md`. Owner: user (with the business owner).


## Evidence

- Pre-existing `lint:doc-paths` failure (found 2026-09-29; identical on `HEAD`): `docs/references/architecture/javascript-runtime.md` cites `assets/section-pagination.js` twice, a skeleton module this theme lands in slice 5. The reference belongs to the user-owned harness; fix, ignore marker, or wait for slice 5 is the user's call before the release gate.

- Process calibration from 3B and 3C-1 (2026-09-28): 3B needed three GPT rounds (look checks missed schema classes, then judged visibility instead of computed style); 3C-1 needed four, all on the dropdown Escape path, because the coordinator changed interactive behavior without running it. With browser passes deferred to phase 5, plans that change interactive JavaScript include a runnable harness check (module under stubbed imports and a minimal DOM, with a mutation check) before review, covering the interaction states the markup can reach.
- Process calibration from 3C-2 (2026-09-29): the executor's harness stubbed `store` as a value captured at import and ran its "mutations" on test objects, so half its checks could not fail; and its `git stash` comparison against `HEAD` reverted `docs/agent/board.md`. Execution prompts now require store stubs read at call time, mutations applied to module source, and `HEAD` comparisons through `git show` or a separate worktree, never stash or checkout.
- Recurrence in 3C-3 (2026-09-29): despite that prompt text, the executor again reset `docs/agent/board.md` and `docs/project.md` to `HEAD`, and its harness again passed mutations unconditionally. Prose did not hold, so per `AGENTS.md` (Authority) a computational check is proposed, pending the user: a pre-tool hook in each executor client that blocks worktree-rewriting git commands (`stash`, `checkout -- <path>`, `restore`, `reset --hard`) unless the user allows them. Not implemented; the harness is user-owned.

- CSS debt from batch 3B (2026-09-28), to clear before the phase 4 exit: (1) six skeleton `@theme inline` namespace resets not adopted (`--font-weight-*`, `--leading-*`, `--tracking-*`, `--color-*` break the build because theme CSS `@apply`s default utilities; `--ease-*`, `--animate-*` drop referenced classes); adopt each once the slices remove the default Tailwind classes (`lint:theme` reports them as token-chain bypasses). (2) Skeleton rules withheld because they would change current rendering, each to adopt with the markup that owns it: `.section` (section wrappers), `body > main`, global `:focus-visible` (`assets/base.css`); `.gift-card-page main`, `.gift-card-page [data-gift-card-qr] svg` (`assets/gift-card.css`). Details: the rule 3 conflict table in the 3B commit's `docs/agent/context.md`. (3) The user's detailed 3B browser comparison is deferred to phase 5.

- Pre-existing i18n failures (found in 3A review, 2026-09-28; identical on `HEAD`): `lint:i18n` reports hardcoded schema text in `sections/article.liquid`, `sections/before-after-comparison.liquid` (2), `sections/newsletter-overlay.liquid`, `sections/product-comparison-table.liquid`, and 34 unused locale keys. Each section's slice clears its own; any left must be zero before the release gate (lint failures are launch blockers). Batches until then check "no new findings against `HEAD`".

- Skeleton source access (2026-09-28): this checkout had no `skeleton` remote, and the sibling clone `../My-skeleton-theme` stops at `e96aedd`, behind `5191a50`. Added remote `skeleton` → `https://github.com/Joey-Fjh/my-skeleton-theme.git` and fetched; `skeleton/main` = `5191a50`, matching the recorded source. Older docs cite `d:\fjh\shopify\...` paths from another machine.

- Old CSS structure conventions resolved (user, 2026-09-28): do not restore `css-layer-allowlist.json`; after the phase 3 Tailwind merge, add a theme-only exception list to the new validators for the rules still valid (motion exclusions, WebKit guards, newsletter scoping); `tailwind/tailwind.snippets.css` is slice 5 debt. The exact list was due in phase 3; deferred from 3B (2026-09-28) to the first slice whose migrated files would otherwise fail on those rules, because until then `lint:theme` carries hundreds of unmigrated findings and an exception list proves nothing.
- Phase 2 decisions (user, 2026-09-28): add slice 0 for shared UI primitives; slices are computed by rule. Refined the same day after the first computation put 62 files, including the product purchase core, into slice 0: slice 0 holds only domain-neutral files carried by CAP-21 and CAP-01; every other file follows its earliest consumer slice, since slices run in order and later slices reuse earlier work. Swiper loading: first decided as the 12.1.2 ESM browser build, reversed the same day because no self-contained ESM file exists; final: the classic build behind an on-demand `carousel-swiper.js` adapter.
- Swiper resolved (user, 2026-09-28): keep Swiper as the skeleton's selected carousel library (skeleton `AGENTS.md:11`). The earlier open question rested on a wrong premise (the skeleton ships no Swiper asset but had already selected it). How carousels mount under the module model is settled in phases 2-3 per `docs/references/architecture/javascript-runtime.md`.
- Phase 0a (2026-09-28): capability inventory, merchant references, runtime dependencies, sizes, and browser checklist under `docs/migration/phase0/`. Review 1 found three defects (CAP-15 too coarse, CAP-22 cited a nonexistent Swiper decision, Swiper section miscount); all corrected and re-verified. Notable: section type `promo-bannder` is a typo fixed in merchant JSON and must not be renamed; theme-owned JS+CSS on every page is about 1.03 MB raw / 184 KB gzip.
- Process calibration: write acceptance counts from commands, not by hand; execution prompts must state that open board decisions may be cited but not decided.
- `docs/migration/step1-outer-files.md`: read-only comparison of files outside the business directories (S/T/M/D/? classification, required checks, proposed order). Corrections already accepted: do not check out `docs/` or `README.md` wholesale (`docs/project.md`, `docs/agent/*` and `README.md` are theme-owned or merged by hand); replace skeleton-owned directories wholesale instead of per-file `git rm`; drop `merge -s ours`; rename `package.json` `name` back to `my-theme-1`.
- Probe run of the skeleton `lint:theme` against this theme (2026-09-24, not kept): 343 findings in 96 files. 121 missing `data-module-id`, 86 Alpine attributes containing Liquid or statements, 29 Alpine API calls outside `alpine.adapter.js`, about 80 typography/color token-chain bypasses.
- External review (GPT, 2026-09-28), points adopted: capability inventory with merchant JSON references as the definition of "preserve business logic"; freeze a behavior baseline before old validators are replaced; per-file ownership for mixed directories; `npm ci` early; Theme Editor section load/unload and block select as acceptance items; a stop-loss point. Not adopted: design first, compatibility layer, a single end-of-migration acceptance.

## Deferred ideas

- Phase 5 design rework: the DesignSync tool (user-started `/design-sync`) syncs a local component library with a claude.ai/design design-system project (token and component preview cards). It does not build CSS; it could host the token and key-component previews while iterating on the visual direction the Theme Store review asked for.

- Backport the merchant JSON `.prettierignore` exclusion to the skeleton once settled here.
- When the skeleton `lint:doc-paths` arrives in phase 1, decide whether `docs/migration/` is scanned; the reports cite skeleton-only paths.
