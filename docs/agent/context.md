# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-02.

## Plan: JS close-out: interaction sweep and runtime fixes (batch 5-F)

Status: direction from the user (2026-10-02: "可以继续js的…得加快速度，不能一个个，而是一批次"), recorded as authorized; 5-D closed in `96c0f13`, so it starts now. Review tier: **Ask** (`assets/*.js`, Liquid markup). Implementer: external session with the browser MCP (execution prompt); reviewer: coordinator, then GPT. Browser checks beyond the executor's own MCP runs go to the consolidated pass.

**Outcome.** Every interactive surface works under the new runtime with a clean console, and the known runtime defects are fixed in one batch, so the JS track is closed before the CSS architecture work.

**Scope rule.** Fix in this batch: migration regressions, console errors, first-viewport (no-JS) failures, and accessibility defects in interactive controls, when the fix lives in JS or Liquid markup. Log, do not fix: pure styling or layout defects (CSS phase), pre-existing defects that are not accessibility or console errors, anything needing schema, setting, or merchant-config changes (stop and list).

**Known items.**

- S2 product page first load: gallery blank and the no-JS per-variant "Add to Cart" fallback visible until modules load. Diagnose first (compare with the live theme): which markup hides the gallery and shows the fallback before Alpine; fix so the first viewport renders the gallery's first media and one purchase control from Liquid, with no flash of the fallback when JS runs.
- S6 predictive search cards show no product image: `snippets/predictive-search-product-card.liquid` passes `x-bind:src` through `{% render 'image' %}`, which emits a placeholder SVG with no `<img>` for JSON-driven results. Fix with a client-bound `<img>` in the card (width/height, `loading="lazy"`, alt binding), not a new `image` snippet mode.
- S3 filter drawer: unlabeled chevron control under filter lists. Identify it; give it its locale-keyed label or remove the empty control.
- S7 `/search?q=` without `type` selects the Articles tab and lists nothing while reporting product results. Confirm on the live theme; fix the tab derivation in `sections/search.liquid` so the default tab is the first type with results (products first when present).
- Menu `<summary>` link: `snippets/header-dropdown-super-menu.liquid` (and any other menu snippet doing the same, `snippets/header-dropdown-menu.liquid` included) renders an interactive `<a>` inside `<summary>`. Keep the parent label as `<summary>` text; if the parent link must stay reachable, render it inside the panel.
- Interaction sweep: every interactive surface on the `docs/migration/phase0/browser-checklist.md` pages (header, menus desktop/mobile, search overlay and page, localization, product purchase and media, quick view, cart drawer and page, filters and sorting, pagination, carousels, accordions/tabs, newsletter and contact forms, popups), desktop and 390×844, console as the floor. Each finding: classification (migration regression / pre-existing, checked on the live theme), cause, fixed or logged.

**Implementation surface.** `assets/*.js` (not vendor or generated files), `sections/*.liquid` and `snippets/*.liquid` markup and their `{% stylesheet %}` blocks only where a fix needs it, `layout/theme.liquid`, `locales/*.json` (new keys for labels, English source plus every locale file the i18n lint requires). Forbidden: `config/settings_data.json`, `config/settings_schema.json`, `templates/*.json`, `sections/*-group.json`, `{% schema %}` blocks, vendor and generated assets, the agent rules and validator wiring.

**Acceptance checks.**

- F1 S2: with JavaScript disabled, the product page shows the first gallery media and the purchase form; with JavaScript enabled, per-frame or screenshot sampling from navigation to module ready shows no blank gallery and no per-variant fallback buttons.
- F2 S6: predictive search for a term with product results shows an `<img>` with the product image URL in every product card; no placeholder SVG when the product has an image.
- F3 S3: the control has an accessible name from a locale key, or no longer renders; Chrome accessibility tree shows no unnamed button in the filter drawer.
- F4 S7: `/search?q=<term>` without `type` lists the results the count reports; with `type=article` and `type=page` the tabs behave as on `HEAD`.
- F5 menu: no `<a>` (or other interactive element) inside any `<summary>` in `snippets/header-*.liquid` (search command recorded); Chrome reports no "Interactive element inside of a <summary> element" on the home page; every menu item stays reachable by keyboard.
- F6 sweep: a findings table in this file (surface, viewport, finding, classification, cause, fixed / logged); console free of errors on every swept page after the fixes.
- F7 static: `npm.cmd run lint:theme`, `lint:compat`, `test:theme-check`, `lint:liquid-syntax`, `lint:i18n`, `lint:doc-paths`, Prettier on changed files; ThemeEvents and SectionRefresher greps from `docs/project.md` (Theme-Specific Contracts) show no new matches.
- Interactive JS changes carry a runnable check (MCP script or harness) recorded here; `HEAD` comparisons through `git show` or a separate worktree, never stash, checkout, restore, or reset.
