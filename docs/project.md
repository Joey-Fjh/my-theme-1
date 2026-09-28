# Project

This file holds what is specific to this repository: its identity, scope, accepted migration direction, and overall status. `AGENTS.md` holds the rules. Unresolved discussion lives in `docs/agent/board.md`; the plan under execution lives in `docs/agent/context.md`.

## Identity

Ceylune, a custom Shopify theme maintained as a multi-industry Shopify Theme Store candidate. The Agent layer, runtime, style system, and validators are being replaced by those of the internal mother template `my-skeleton-theme` (sibling directory `../my-skeleton-theme`); this theme owns its business features, page design, and Theme Store positioning.

## Status

- Theme Store: submitted as tag `v1.0.0-submitted` (`3da19aa`). The first review was rejected because the design had no distinctive strength. Three submissions are allowed in total; exceeding them means a 90-day wait, which is not acceptable, so the next submission must answer the design feedback.
- `main` (`926dddb`) and the store's current theme stay untouched, including Theme Editor saves, until the migration and the design rework are complete; the current theme is the behavior baseline. `main` differs from `v1.0.0-submitted` only in Agent/tooling files; theme code is identical. `main` is connected to the store's current theme through the GitHub integration.
- Migration work happens on `refactor/skeleton-shell`, developed with local `shopify theme dev` only (a temporary development theme, not a GitHub-connected store theme). On success it merges back into `main` with a new tag; on failure the branch is abandoned.
- The Agent layer, validators, and runtime contracts are not yet migrated. Until step 1 below lands, `AGENTS.md` still describes the old runtime (`Components.register()`, `AlpineComponentsFactory`); only the record flow (`board.md` / `context.md`) follows the skeleton convention.

## Migration Direction (accepted)

- Full framework replacement: the skeleton's Agent SOP, rules, references, validators, runtime JavaScript, and Tailwind token layer replace this theme's. There is no compatibility layer; old runtime files and old components are not kept.
- Business behavior is preserved as capabilities, not as old implementations: each capability is inventoried with user-visible acceptance criteria and rewritten under the skeleton contracts.
- Merchant configuration stays valid: section types, block types, schema IDs, and setting IDs referenced by `templates/*.json` or `config/settings_data.json` are not renamed or removed without explicit approval.
- Design rework is a separate batch after the migration, built on the new framework.
- Files move by path from the skeleton (`git checkout skeleton/main -- <path>`), never `git merge skeleton/main`: the shared history would turn the skeleton's business deletions into deletions here. No `merge -s ours` either; each import records the skeleton commit and path list instead.
- Skeleton version used as the source: `5191a50` (`v1.0.0` plus the merchant JSON Prettier exclusion).

Phases:

0. Baseline and capability inventory (read-only), done 2026-09-28: `docs/migration/phase0/`. No separate browser baseline or screenshots: `main` and the current theme stay untouched, so the current theme is the live baseline.
1. Outer framework: Agent layer, docs, validators, configs, CI (see `docs/migration/step1-outer-files.md`). `npm ci` runs right after the `package.json`/lock merge; a review gate follows the mechanical directory replacement.
2. File ownership map for mixed directories (`layout/`, `assets/`, `tailwind/`, `snippets/`, `locales/`): framework file, business file to rewrite, or delete.
3. Import framework files (runtime, layout, Tailwind layer). The branch storefront is expected to break from here until phase 4 completes.
4. Rewrite capabilities in slices. Each slice is verified side by side: the matching `docs/migration/phase0/browser-checklist.md` rows run on the current theme and on the development theme with the same store data; a row that fails on both is a pre-existing defect, a row that fails only on the development theme is a migration regression. Slices: product and cart; navigation and search; collection filters; carousels and display sections; the rest. Section-level style adaptation happens inside each slice.
5. Full integration acceptance, then design rework.

## Deviations From The Skeleton

- No theme blocks: this theme keeps section blocks. Converting them would change block types referenced by merchant JSON and change the Theme Editor workflow; Shopify does not require theme blocks. The skeleton's `blocks/` and `docs/references/architecture/theme-blocks.md` are not imported, and rules routing to them are adjusted.
