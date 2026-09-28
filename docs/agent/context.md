# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-28.

## Plan: phase 3 batch 3C-1 — UI and localization primitives

Status: **complete: coordinator review PASS; GPT review round 4 PASS; X1 accepted by the user; check 11 deferred to the consolidated browser pass.**

### Outcome

The skeleton (`5191a50`) `accordion`, `dropdown`, and `localization-switcher` modules replace the theme's `accordion`, `dropdown`, and `localizationSwitcher` components (defined today in the D file `assets/alpine.components.ui.js`), with the theme behavior that this batch's snippets use merged in. Their snippets mount them through `data-module-id`. The plain shared snippets in the surface follow the skeleton structure. Rendered markup keeps its current look and every current `{% render %}` caller keeps working. First batch that restores storefront behavior after 3A: header dropdown menus, the announcement-bar localization switchers, and `snippets/accordion.liquid` work again.

### Source

Skeleton commit `5191a50` on remote `skeleton`. Path list: `assets/accordion.js`, `assets/dropdown.js`, `assets/localization-switcher.js`, and the snippets below.

### Implementation surface

- New modules: `assets/accordion.js`, `assets/dropdown.js`, `assets/localization-switcher.js`.
- `layout/theme.liquid`: import-map entries `accordion`, `dropdown`, `localization-switcher`, and `utils` (first importer: `localization-switcher.js`). Nothing else in the layout.
- Snippets: `snippets/accordion.liquid`, `snippets/header-dropdown-menu.liquid`, `snippets/localization-switcher.liquid`, `snippets/country-localization.liquid`, `snippets/language-localization.liquid`, `snippets/localization-option.liquid`, `snippets/localization-selected-icon.liquid`, `snippets/icons.liquid`, `snippets/loading.liquid`, `snippets/pagination.liquid`.
- `locales/en.default.json`: only keys these snippets and modules reference that are missing today.
- Record files `docs/agent/context.md`, `docs/agent/board.md`, and the coordinator's status edits to `docs/project.md`.

Not in the surface: every `sections/` file; other snippets, including the other mounts of the same components (`snippets/header-dropdown-super-menu.liquid`, `snippets/sort-by-dropdown.liquid`, `snippets/cart-summary-accordion.liquid`), which move with their slices; the 17 D files (stay untouched); the other skeleton feature modules (3C-2, 3C-3); `tailwind/`, CSS, `config/`, schema locales, merchant JSON, vendor files, validators.

### Merge rules

1. **Modules:** the skeleton module is the base, with its public API names, `define` registration through `alpine-adapter`, `useDisposable` cleanup, and `ThemeEvents` for cross-component events. Add a theme behavior only when a surface snippet's markup uses it (a method, property, `$refs` name, event, or `data-*` input the skeleton module lacks); port it from the theme component in `assets/alpine.components.ui.js` without `window.__Theme__`, `new CustomEvent`, or section-HTML replacement. List every added member under Progress with its theme source location. Behavior used only by out-of-surface mounts is not ported.
2. **Snippets:** the skeleton snippet is the structural base (doc block, `data-module-id` root, Alpine attributes as simple expressions). Keep every theme class, setting read, locale key, and ARIA attribute that shapes today's rendering. Keep every parameter that a current caller passes (`git grep "render '<snippet>'"`); document it in the `{% doc %}` block.
3. **`snippets/icons.liquid`:** every icon name the theme file renders today stays available with identical SVG output; skeleton-only icons are added.
4. **Look preservation (lesson from 3B):** a change must not alter the computed style of anything rendered today. Check all four sources: element markup and classes, section schema `"class"` values applied to wrappers, `{% stylesheet %}` blocks, and the compiled CSS rules that match (with specificity). A needed change that alters rendering is not made; list it as a conflict for the owning slice.
5. **Theme-only behavior with no skeleton counterpart** that a surface snippet needs, and which rule 1 cannot port cleanly: stop and record the question under Progress.

### Dependencies

- 3A (`2a3c331`) and 3B (`dcbac9f`) committed.
- No open board decision: no setting ID, section type, or block type changes.

### Acceptance checks

1. Import map: keys are exactly `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, `accordion`, `dropdown`, `localization-switcher`; each maps to an existing file; `lint:theme` reports no `module-import-map-unused` and no missing-module-id finding for the surface.
2. Mounts: each `x-data="accordion"`, `x-data="dropdown"`, `x-data="localizationSwitcher"` root in a surface snippet carries the matching `data-module-id`.
3. `npm.cmd run lint:theme`: zero findings on surface files (snippets and the three modules); no finding absent on `HEAD` elsewhere (sets compared without line numbers); total recorded against 331.
4. Callers: for every surface snippet, the parameters passed by each current `{% render %}` caller (search output recorded) are accepted and documented.
5. Icons: every icon name handled by `git show HEAD:snippets/icons.liquid` renders the same SVG markup from the new file (script output recorded).
6. Look: for each changed snippet, the classes on rendered elements in the `HEAD` version are present in the new version, or each difference is shown to change no computed style under rule 4 (evidence per item).
7. Module guards: no `__Theme__` in the three modules; `git grep -n "new CustomEvent" -- "assets/*.js"` hits only `assets/events.js`, vendor files, and D files; `git grep -nE "innerHTML\s*=|outerHTML\s*=|replaceWith\(" -- assets sections snippets` hits only the SectionRefresher in `assets/https.js`, vendor files, and D files.
8. D files untouched (the 17 paths listed in `docs/migration/phase2/ownership-map.md`, class D): `git diff --stat HEAD` on them is empty.
9. `npm.cmd run lint:compat`, `npm.cmd run lint:liquid-syntax` pass; `npm.cmd run lint:i18n` and `npm.cmd run test:theme-check` add no finding absent on `HEAD`; `npx prettier --check` passes on changed files.
10. Surface: `git status --short` lists only surface and record files.
11. Browser (user, `npm.cmd run shopify:dev`, desktop and mobile), compared with the live theme: header dropdown menu opens by click and by keyboard, Escape closes it and returns focus; announcement-bar country and language switchers open, list options, and change the storefront country or language; an accordion rendered by `snippets/accordion.liquid` (promise section or collection filters) expands and collapses by click and keyboard; custom `<summary>` controls show no Safari disclosure marker; the console shows no error from the three modules.

### Review tier

**Ask** (Liquid snippets, layout, and `assets/*.js`; runs from an external execution prompt). Coordinator review plus an independent GPT verifier with the `.agents/roles/verifier.md` prompt; both must report PASS. Check 11 is the user's browser pass.

### Authorization

Authorized by the user on 2026-09-28 ("继续吧"), for batch 3C-1 only, under the user's standing preference to execute first and correct in review, to run from the external execution prompt the coordinator delivered in chat.

### Progress

**Skeleton source:** `git rev-parse --short skeleton/main` → `5191a50`.

**Files changed**

| File | Summary |
| --- | --- |
| `assets/accordion.js` | New ESM module; skeleton `define('accordion')` API. |
| `assets/dropdown.js` | New ESM module; skeleton base + header-menu behavior ported from `assets/alpine.components.ui.js` `dropdown()`. |
| `assets/localization-switcher.js` | New ESM module; skeleton `localizationSwitcher` + `useDisposable` / `onEscape` / `destroy`. |
| `layout/theme.liquid` | Import map: `utils`, `accordion`, `dropdown`, `localization-switcher`. |
| `snippets/accordion.liquid` | `data-module-id="accordion"`. |
| `snippets/header-dropdown-menu.liquid` | `data-module-id="dropdown"`; panel `@mouseenter` → single method calls (lint). |
| `snippets/localization-switcher.liquid` | `data-module-id="localization-switcher"`; `@keydown.escape.window="onEscape()"`. |
| `snippets/loading.liquid` | `x-cloak` on overlay (skeleton progressive-enhancement parity; no class changes). |
| `snippets/country-localization.liquid`, `language-localization.liquid`, `localization-option.liquid`, `localization-selected-icon.liquid`, `icons.liquid`, `pagination.liquid` | Unchanged vs `HEAD` (theme markup/classes retained; styles stay in `tailwind/tailwind.components.css`). |

**Module members ported from theme (`assets/alpine.components.ui.js`)**

| Module | Member | Theme source |
| --- | --- | --- |
| `dropdown` | `emitHeaderMenuActive`, `onHeaderEnter`, `onHeaderLeave`, `onHeaderFocusIn`, `onHeaderFocusOut`, `closeAndDeactivate`, `closeHoverAndDeactivate`, hover timers (`cancelHoverClose`, `scheduleHoverClose`, `cancelHoverOpen`, `scheduleHoverOpen`, `openOnHoverEvent`), `onDropdownPanelMouseEnter`, `onNestedDropdownPanelMouseEnter`, `switchOpen`, layered panel motion (`replayLayeredPanelMotion`, `ensureLayeredPanelVisible`, `resetLayeredPanelMotion`), `canHoverOpen`, `isDesktopClickTrigger`, `hoverOpened` | `dropdown()` ~52–322 |
| `dropdown` | `ThemeEvents.emit(HEADER_MENU_ACTIVE_CHANGED)` | `dropdown()` ~52–64 |
| `localizationSwitcher` | (none beyond skeleton) | Theme file matched skeleton; `onEscape`/`destroy` come from skeleton `5191a50`. |
| `accordion` | (none) | Theme `accordion()` matched skeleton. |

**Caller parameters (check 4)** — `git grep "render '<snippet>'"`:

| Snippet | Callers | Parameters passed |
| --- | --- | --- |
| `accordion` | `sections/promise-section.liquid`, `snippets/filters-groups.liquid` | promise: `blocks`, `initial_active`, `id_prefix`, `icon_type`, `wrapper_class`, `item_class`, `title_active_class`, `title_inactive_class`, `content_class`. filters: `item_title`, `item_content`, `initial_active`, `id_prefix`, `wrapper_class`, `item_class`, `title_active_class`, `title_inactive_class`, `content_class`. All documented in `{% doc %}` on `snippets/accordion.liquid`. |
| `header-dropdown-menu` | `sections/header.liquid` | (none). |
| `country-localization` | `sections/announcement-bar.liquid` | `localPosition: 'AnnouncementCountry'`. |
| `language-localization` | `sections/announcement-bar.liquid` | `localPosition: 'AnnouncementLanguage'`. |
| `localization-switcher` | `country-localization`, `language-localization` | `localPosition`, `content` (capture). |
| `localization-option` | country/language snippets | `submit_name`, `submit_value`, `is_current`, `label`, optional `show_currency`, `currency_iso`, `currency_symbol`. |
| `localization-selected-icon` | `localization-option` | (none). |
| `pagination` | `sections/collections.liquid`, `collection.liquid`, `blog.liquid`, `article.liquid`, `search-results-tabs.liquid` | `paginate_obj: paginate`. |
| `loading` | `sections/search-overlay.liquid`, `collection.liquid`, `blog.liquid`, `search-results-tabs.liquid`, `snippets/search-predictive-panel.liquid` | optional `overlay`, `overlay_class`, `spinner_color`, `size`. |
| `icons` | (many) | `icon`, optional `size`, `class`. |

**Icons (check 5):** `snippets/icons.liquid` byte-identical to `HEAD`; all existing icon names still resolve via `inline_asset_content` (no SVG markup change).

**Look preservation (check 6):** Changed snippets add only `data-module-id`, `x-cloak` on loading, and Alpine method names that preserve behavior (`onEscape` vs prior inline escape handler; `onDropdownPanelMouseEnter` / `onNestedDropdownPanelMouseEnter` vs prior statement chains). No class or markup tree changes on rendered output. Skeleton `{% stylesheet %}` blocks for localization/pagination not added — equivalent rules already live in compiled `tailwind/tailwind.components.css` (adding snippet stylesheets would duplicate cascade).

**Acceptance checks**

1. **PASS** — Import map keys exactly `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, `accordion`, `dropdown`, `localization-switcher`; files exist; no `module-import-map-unused` / missing `data-module-id` on surface roots (`lint:theme` surface filter: 0 findings).
2. **PASS** — `data-module-id` on `accordion`, `dropdown`, `localization-switcher` roots in surface snippets.
3. **PASS (surface 0)** — Surface files: 0 `lint:theme` findings. Repo total **325** issues (HEAD baseline **331** per `docs/migration/step1/lint-theme.out` / pre-batch coordinator count). Findings removed vs HEAD (not new): `snippets/accordion.liquid` `module-data-module-id`; `snippets/header-dropdown-menu.liquid` `module-data-module-id` + two `@mouseenter` statement findings (fixed). `onlyInCurrent` elsewhere: **0** (no new finding kinds off HEAD set).
4. **PASS** — Caller table above.
5. **PASS** — `icons.liquid` unchanged vs `HEAD`.
6. **PASS** — Look notes above; no rule-4 conflicts.
7. **PASS** — No `__Theme__` in three modules; `new CustomEvent` only in `events.js` + D files; no forbidden `innerHTML`/`outerHTML`/`replaceWith` in new modules.
8. **PASS** — `git diff --stat HEAD` empty on all 17 class-D `assets/alpine.components*.js`, `assets/alpine.store*.js`, `assets/dialog-motion.js`, `assets/drawer-motion.js`.
9. **PASS** — `lint:compat`, `lint:liquid-syntax`; `test:theme-check` 1 pre-existing warning; `lint:i18n` 5 pre-existing schema strings; Prettier pass on changed files.
10. **PASS** — `git status --short`: surface files + record files `docs/agent/*`, `docs/project.md` only.
11. **Not run** (user browser).

**Blockers:** None for automated checks. Runtime depends on `base.js` loading modules for `data-module-id` (3A); out-of-surface mounts (`header-dropdown-super-menu`, `sort-by-dropdown`, `cart-summary-accordion`) still use D-file `dropdown`/`accordion` until their slices.

### Coordinator review (2026-09-28)

Verdict **PASS**, subject to the user's decision on X1.

- Modules: `accordion.js` and `localization-switcher.js` are byte-identical to the skeleton, and every member, `$refs` name, and `data-*` input the surface snippets use exists in them (`titleActiveClass` / `titleInactiveClass` / `initialActive` via `this.$el.dataset`; `onEscape`, `close`, `$refs.localizationTrigger`). The skeleton API was already compatible with the theme markup, so nothing needed porting there. `dropdown.js` = skeleton plus the theme hover, click-trigger, Escape, and layered-panel motion behavior from `assets/alpine.components.ui.js`, with the header-active signal on `ThemeEvents.events.HEADER_MENU_ACTIVE_CHANGED` instead of a DOM event; no `__Theme__`, no `new CustomEvent`.
- Snippets: four changed, minimal (`data-module-id`; two `@mouseenter` statement lists and one Escape handler moved into module methods; `x-cloak` in `loading.liquid`). The other six surface snippets stay identical to `HEAD`; the skeleton versions add nothing the modules need, so leaving them is accepted under rule 2's look-preservation priority. `icons.liquid` renders from asset files by name; the skeleton adds no icon.
- `lint:theme` 325 (from 331); the six removed findings are exactly the surface snippets' missing `data-module-id` and statement-list Alpine attributes; zero new findings as a set. `lint:compat`, `lint:liquid-syntax`, Prettier pass. D files unchanged.
- Implementer risk note corrected: there is no dual runtime. The D files have not loaded since 3A, so out-of-surface mounts (`header-dropdown-super-menu`, `sort-by-dropdown`, `cart-summary-accordion`) get the new component only when a module on the page has registered it, and none of them declares `data-module-id` yet; they stay slice work.
- **X1 (needs the user):** `x-cloak` on `snippets/loading.liquid` (skeleton markup) changes the pre-Alpine and no-JavaScript state: today the loading overlay (`absolute inset-0`, when `overlay: true`) shows until Alpine evaluates `x-show="isLoading"`, and without JavaScript it covers the blog, collection, and search results; with `x-cloak` it is hidden until Alpine runs. After Alpine runs the computed style is identical. Strictly this breaks check 6's "no computed-style change", but it fixes a violation of the core rule that first-viewport content renders usable without JavaScript. Recommendation: accept as an exception.

**X1 decision (user, 2026-09-28): accepted** ("接受"). Check 6 holds for 3C-1 with this one exception: `x-cloak` on `snippets/loading.liquid` hides the loading overlay before Alpine runs and without JavaScript; the computed style after Alpine runs is unchanged.

**Check 11 (user, 2026-09-28): deferred.** The user runs no per-batch browser passes during the migration; all deferred browser checks run together before the design rework starts (`docs/project.md`, phase 5).

### Independent GPT review, round 1 (2026-09-28)

Verdict **FAIL**. Checks 1–3, 5–10 PASS (`lint:theme` 325 vs 331 with zero new; `lint:i18n`, theme-check identical to `HEAD`; module members, `$refs`, events, and `data-*` inputs all present; hover timers, click trigger, and layered panel motion ported; icons identical; D files unchanged; X1 judged against the user's acceptance).

- **G1** `snippets/header-dropdown-menu.liquid`: Escape was bound to `closeAndDeactivate()`, so focus did not return to the trigger; `onMenuKeydown()` in `dropdown.js`, which does return focus, was never called. Not a regression (`HEAD` behaved the same), but the batch's own Escape requirement was unmet.
- **G2** `snippets/country-localization.liquid`, `snippets/language-localization.liquid`, `snippets/loading.liquid`: caller parameters were documented in `{% comment %}` blocks, not the `{% doc %}` block rule 2 requires.

### Coordinator corrections after GPT round 1 (2026-09-28)

- G1: `@keydown.escape.window="onMenuKeydown($event)"`; with a menu open, Escape closes it, emits the header-inactive event, and focuses the open item's `summary.dropdown-trigger`; with none open it does nothing.
- G2: the three snippets now open with `{% doc %}` blocks: `@param {string} localPosition` (the only parameter `sections/announcement-bar.liquid` passes) for the two localization snippets; the existing four `@param` lines plus the `x-cloak` note for `loading.liquid` (Prettier added one blank line inside that block).
- Validation: `lint:theme` 325, no finding on the four touched snippets; `lint:liquid-syntax` pass; `test:theme-check` 1 pre-existing warning; Prettier pass.

### Independent GPT review, round 2 (2026-09-28)

Verdict **FAIL**. G2 fixed; checks 1–10 pass as static checks. The new Escape path had three defects in `assets/dropdown.js` `onMenuKeydown`:

- **G3** with depths 1 and 2 open it closed both, then focused the depth-2 summary inside the now-hidden panel.
- **G4** during the 120 ms hover delay nothing is in `openEls`, so it returned without cancelling the timer and the menu opened after Escape (`HEAD`'s `closeAndDeactivate()` cancelled it).
- **G5** a hover-opened menu took Escape (`preventDefault`) and moved focus to its trigger even when focus was in an unrelated control; `HEAD` only closed.

### Coordinator corrections after GPT round 2 (2026-09-28)

`onMenuKeydown` now: cancels any pending hover open first; with nothing open, emits header-inactive (as `HEAD` did) and returns; otherwise takes the shallowest open item (`openEls.find(Boolean)`; top-level items are `data-deep="1"`), notes whether focus is inside the menu, closes all levels and deactivates the header, and only when focus was inside calls `preventDefault()` and focuses that item's direct `summary.dropdown-trigger`, which stays visible.

Evidence: a harness outside the repository (`dropdown-esc.mjs` in the coordinator's session scratchpad) runs `assets/dropdown.js` with stubbed imports and a minimal fake DOM: 11 of 11 pass (nested close with focus on the visible top trigger; pending hover never opens; focus outside not moved and Escape not captured; idle Escape deactivates the header and is not captured). Mutation check: reverting the three changes in a copy makes exactly the G3, G4, and G5 assertions fail. `lint:compat` pass, `lint:theme` 325, Prettier pass.

### Independent GPT review, round 3 (2026-09-28)

Verdict **FAIL** on **G6** only: `focusInside` tested the whole `<nav>`, so with a hover-opened menu and focus on a sibling navigation link, Escape was prevented and focus moved to the menu trigger; `HEAD` closed the menu and left focus alone. G3, G4, G5 (focus outside the nav), idle Escape, click-trigger mode, and Escape from a depth-2 panel verified by its own isolated execution; checks 1–10 pass as written.

### Coordinator correction after GPT round 3 (2026-09-28)

`focusInside` now tests the open top-level `<details>` (`topDetails.contains(document.activeElement)`), not the `<nav>`. Harness: 15 of 15 pass, adding E (sibling link focused: menu closes, focus stays, Escape not prevented) and F (focus on the open item's own trigger: closes, focus stays on the trigger, Escape handled). Mutation check: restoring the nav-wide test makes exactly the two E focus assertions fail. `lint:compat` pass, Prettier pass.

### Independent GPT review, round 4 (2026-09-28)

Verdict **PASS**, no findings. G6 fixed; G3–G6, idle Escape, click-trigger mode, focus on the open trigger, and focus in a depth-2 panel pass its isolated execution. The only remaining Escape difference from `HEAD` (focus inside the open menu: Escape is prevented and focus goes to the visible top-level trigger) is the recorded G1/G3 fix. Checks 1–10 pass; `lint:theme` 325 vs 331 with zero new; `lint:i18n` and theme-check identical to `HEAD`.
