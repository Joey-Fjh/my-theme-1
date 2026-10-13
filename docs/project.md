# Project

This file holds what is specific to this repository: its identity, scope, accepted direction, and overall status. `AGENTS.md` holds the rules. Unresolved discussion lives in `docs/agent/board.md`; the plan under execution lives in `docs/agent/context.md`.

## Identity

Ceylune, a custom Shopify theme maintained as a multi-industry Shopify Theme Store candidate. This repository owns all of it: the Agent layer, the runtime, the style system, the validators, the business features, the page design, and the Theme Store positioning.

## Status

- Theme Store: submitted as tag `v1.0.0-submitted` (`3da19aa`). The first review was rejected because the design had no distinctive strength. Three submissions are allowed in total; exceeding them means a 90-day wait, which is not acceptable, so the next submission must answer the design feedback. The ZIP passed the automatic syntax check and the manual review stopped at the design, so Shopify has not yet checked the Lighthouse bar (average ≥ 60 performance, ≥ 90 accessibility on home, product, collection, desktop and mobile) or the technical requirements for any version of this theme.
- `main` (`926dddb`) and the store's current theme stay untouched, including Theme Editor saves, until the framework replacement and the design rework are complete; the current theme is the behavior baseline. `main` differs from `v1.0.0-submitted` only in Agent/tooling files; theme code is identical. `main` is connected to the store's current theme through the GitHub integration.
- The work happens on the branch `refactor/skeleton-shell`, developed with local `shopify theme dev` only (a temporary development theme, not a GitHub-connected store theme). On success it merges back into `main` with a new tag; on failure the branch is abandoned.
- Progress, state on 2026-10-13. Batch-by-batch history is in Git (`git log --oneline`); each batch's plan and reviews are in the commit that closed it (`git show <commit>:docs/agent/context.md`).
    - **Framework replacement:** done. The runtime, the token layer and every retained component run on modules mounted by `data-module-id`. The JS track and the CSS architecture are closed. The CSS specification batches 6-C1 to 6-C10 are done: tokens for colour, space, type and breakpoints, the page frame, and stylesheet ownership.
    - **Browser verification:** partial (three agent sessions, 2026-10-04; no open regression). The remaining rows and the consolidated pass are on `docs/agent/board.md`.
    - **Design language:** `docs/design/design.md` (Google DESIGN.md format, agreed section by section; we replace the designer, the Figma home design is a visual reference only), with the home design snapshot and three style references (`405d2b1`).
    - **Design tokens and preset:** 6-D1, 6-D2 and 6-D3 are done: Instrument Sans as the default font, heading weight 500, stepped heading line heights, fluid page margin, card radius.
    - **Migration debt closed** (user, 2026-10-13). What remains is design and moves to the polish pass: `body-size-custom` (6 `legacy-type-tier` hits and the countdown size), the quick-view viewport padding (`raw-spacing` 2), raw radii, and the italic and chip details of `ritual-steps`.
    - **Harness:** `lint:theme`, `lint:i18n`, the compatibility lints, `test:layout` (baseline 39), `scan:contrast`, and the review tools with named triggers (`AGENTS.md` Agent Skills).
    - **CI:** Lint and Theme Check run on every push. Lighthouse (`.github/workflows/lighthouse.yml`) audits home, product and collection on the dedicated CI store (`ci-test`, Shopify's performance test CSV) on pull requests into `main`, pushes to `main` and manual runs. It passes on the best of three mobile runs, so green does not prove the Theme Store bar. First medians (2026-10-13): performance 0.72 / 0.67 / 0.48, accessibility 0.93 / 0.97 / 0.96.
    - **Branch protection on `main`** (user, GitHub ruleset): pull request required; `Lint`, `Theme Check` and `Lighthouse` required and up to date; no force push or deletion; admin bypass for pull requests only.
    - **Framework track closed here** (user, 2026-10-13). Done on this branch: the framework browser smoke pass, the redundancy audit and tidy-up (6-V9, 6-V10), the two framework defect fixes (6-F1, `528a715`), and the repository setup (6-T6, `86ae604`: the `main` ruleset as a file, the README setup steps, a `doctor:agent` check that the ruleset's required checks are workflow job names). `test:layout` in CI (6-T4b) is deferred until a change can reach `main` without the local check.
    - **Next:** the theme track: the polish pass (home, then product and collection), the consolidated browser pass, the readiness review, the second submission. Detail on `docs/agent/board.md`. The user's look at the visible changes of the framework round goes to the consolidated browser pass.

## Accepted Direction

- Business behavior is preserved as capabilities, not as old implementations: each capability has user-visible acceptance criteria and is written under the framework contracts (`AGENTS.md` and `docs/references/`). Old runtime files and old components are not kept, and there is no compatibility layer.
- Merchant configuration stays valid: section types, block types, schema IDs, and setting IDs referenced by `templates/*.json` or `config/settings_data.json` are not renamed or removed without explicit approval.
- Component model (user, 2026-09-29): Alpine + Tailwind stay, for development speed, because similar themes are already listed in the Theme Store, and because the user's Web Components attempt found lifecycle upkeep harder. Not reopened unless measurement says otherwise. First-viewport content must not depend on Alpine to become visible.
- A feature module enters the import map in the batch that lands its first `data-module-id` consumer; the import-map lint rejects unused entries.
- Browser verification is consolidated (user, 2026-09-28): batches run no per-batch browser pass of their own beyond what their plan names, and one consolidated pass runs before the second submission. Batches close on the coordinator review and, for the Ask tier, an independent review.
- History: how the framework was replaced (phases 0 to 5) is in Git; this file as it stood before the record was shortened is `git show 9d366d5:docs/project.md`.

## Theme-Specific Contracts

Contracts this theme must keep. The validators do not check all of them.

- **Merchant motion settings.** `motion_enabled` in `config/settings_schema.json` is the single merchant switch for settings-driven motion. Off (`body[data-motion-enabled='false']`) stops the list/card cascade (`data-motion-cascade` with `data-motion-bound` items) and the decorative loops (watermark marquee, scrolling-icon-with-text, rotating badge). Future GSAP narrative choreography will follow the same switch. It is not a kill switch for hover, focus, dropdown, dialog, drawer, loading, or other state/micro interactions; those follow `prefers-reduced-motion` only.
- **Ordinary reveal pattern.** Settings-driven reveal is the cascade only: `motionRevealSection()` on a section or nested root with `data-motion-section`, a `data-motion-cascade` container, and `data-motion-bound` row items. The runtime sets `data-motion-state` once per page view. `prefers-reduced-motion: reduce` disables the cascade. Content stays visible without JavaScript until the module sets `data-motion-state="pending"`.
- **WebKit guards.** Custom `<summary>` controls hide the Safari disclosure marker. The validators do not check these; they are browser checklist rows.
- **Manual acceptance.** The retired browser checklist carried the checks for the contracts above (`git show 3652441:docs/migration/phase0/browser-checklist.md`). The manual test checklist is rewritten against Shopify's official checklist at the readiness review.
- **Outlet guards.** Cross-component events go through ThemeEvents; `lint:theme` check `js-custom-event` allows `new CustomEvent` only in `assets/events.js`. Section HTML replacement goes through the SectionRefresher; `js-section-mutation` allows `innerHTML =`, `outerHTML =`, and `.replaceWith(` only in `assets/https.js`.

## Composition And Local Setup

- **Section blocks only.** This theme composes pages with section blocks and ships no Theme Blocks (`blocks/` does not exist); `AGENTS.md` routes section-block questions here.
- **Module loading.** Module roots are held by init interception: `holdUntilReady` / `releaseHold` in `assets/alpine.adapter.js`, `holdForModule` in `assets/base.js`, and `scanModules` as download-ahead only. The contract is in `docs/references/architecture/javascript-runtime.md`.
- **Entry scripts.** The import map, the `base.js` module entry, and the Alpine script live in `snippets/scripts.liquid`, rendered by `layout/theme.liquid`. `lint:theme` reads the import map from the snippet and requires the layout's render.
- **Carousel library.** Swiper. The vendored classic `vendor-swiper.min.js` stays unchanged behind the `carousel-swiper.js` adapter, which loads it on demand, so Alpine remains the only classic script in the layout. Swiper 12.1.2 ships no self-contained ES module, so an ESM build is not an option without a bundling step.
- **`shopify.theme.toml`** is untracked in Git and kept locally; `npm run shopify:dev` runs `shopify theme dev -e development` against its `development` environment.
- **`.shopifyignore`** lists `__pycache__/*`, not `__pycache__/`, because `shopify theme dev` warns that the directory pattern may be misleading; `.gitignore` keeps `__pycache__/`, correct there.
