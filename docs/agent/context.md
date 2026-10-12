# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-A1 Autoplay pause button where no other pause exists

**Status:** accepted by the user 2026-10-13 (board item 2, "Revised": a button only where no other way to pause exists; option 1, devices that cannot hover; `routine-showcase` included). Run from an external execution prompt on the main model.

**Outcome:** on devices that cannot hover, `slides-show` and `routine-showcase` show a pause/play toggle while their autoplay can run; with a mouse nothing visible changes (hover and keyboard focus keep pausing). WCAG 2.2.2 is met on touch screens at every width.

**Review tier:** Ask (Liquid markup, a new snippet, `assets/*.js`, a locale key, external execution prompt).

### Design

- **Shared snippet** `snippets/autoplay-pause-button.liquid`: one `<button type="button">` with `aria-pressed="false"`, a fixed accessible name from a new key `accessibility.autoplay_pause` ("Pause autoplay") in `locales/en.default.json`, `focus-ring`, `data-autoplay-pause` for the module, a `class` parameter for placement; pause bars / play triangle drawn in CSS by `[aria-pressed]` (the pattern of `.scrolling-icon-with-text__pause-btn`), in the snippet's own `{% stylesheet %}`; 24×24px minimum target; colours from scheme roles (`currentcolor`). Rendered with the `hidden` attribute; the module unhides it.
- **Visibility:** the snippet's stylesheet hides it under `@media (hover: hover) and (pointer: fine)` (the project's `can-hover` condition, no other hover query). The module unhides it only when its autoplay can run (setting on, more than one slide/step, reduced motion off, and for `routine-showcase` its desktop media query matches). No JavaScript: it stays hidden (the slideshow controls row already does).
- **State:** each module adds `_userPaused`. A click toggles it and `aria-pressed`. It joins the existing pause sources: `slides-show.js` `_isInteractionPaused()`, `routine-showcase.js` `_isAutoplayFrozen()`. Pointer leave, focus leave, a manual slide or tab change, and viewport re-entry never clear it; only the button does. Remaining time is kept as for the other pauses.
- **Placement:** `slides-show`: last item of `.slides-show__controls-row`, after the pagination group (multi-slide only, like the row). `routine-showcase`: next to `.routine-showcase__tabs` but outside the `role="tablist"` element.
- **Not touched:** the two marquee pause buttons (`scrolling-icon-with-text`, `testimonial-featured`) keep their own code; moving them onto the snippet is a later candidate.

### Implementation surface

- New `snippets/autoplay-pause-button.liquid`.
- `sections/slides-show.liquid` and `sections/routine-showcase.liquid`: markup to render the snippet, and their `{% stylesheet %}` for placement only; no schema change.
- `assets/slides-show.js`, `assets/routine-showcase.js`.
- `locales/en.default.json`: the one key.
- This file.

Forbidden: `{% schema %}` blocks, `config/**`, `templates/**`, `sections/*-group.json`, `tailwind/**`, other sections and modules, the marquee buttons, baselines, `prettier --write`.

### Acceptance checks

1. **Behaviour, Playwright against local `npm.cmd run shopify:dev`** (scratch script outside the repo, password from `.env`, never printed):
   - touch emulation (`hasTouch`, `isMobile`, a coarse pointer so `(hover: hover) and (pointer: fine)` is false) at 375 and 1280: the slideshow button is visible and named "Pause autoplay"; a click sets `aria-pressed="true"` and Swiper autoplay is paused, the active slide does not change for longer than the autoplay delay; a second click resumes; a dot tap while paused changes the slide and stays paused. `routine-showcase` at 1280 touch: the same on its steps; at 375 no button (no autoplay there).
   - desktop emulation (fine pointer, hover) at 1280: both buttons are not displayed; hover on the active dot / thumbnail still pauses.
   - `prefers-reduced-motion: reduce`: no button displayed.
   - keyboard: the button is reachable by Tab, toggles with Enter and Space, and has a visible focus ring.
2. **Accessibility tree:** the button exposes role button, name "Pause autoplay", pressed state; nothing is inserted inside `role="tablist"`.
3. **Validators:** `npm.cmd run lint:theme`, `test:theme-check`, `lint:liquid-syntax`, `lint:i18n`, `lint:compat`, `scan:compat`, `lint:doc-paths`, `npx prettier --check` on changed files; `npm.cmd run test:layout` 0 new against the 42-entry baseline (headless desktop: the button is not displayed, so geometry is unchanged; if a new issue appears, stop and report).
4. **No regression:** `git diff HEAD` touches only the surface; schema blocks unchanged (script).
5. **User look** at the button on a touch device: in the consolidated browser pass.

## 6-A1: executed

**Status of this record:** implemented and validated. The plan above is not marked accepted. Not committed.

### Progress

- Added `snippets/autoplay-pause-button.liquid` (hidden until the module unhides it; CSS hides it under `(hover: hover) and (pointer: fine)`; pause bars / play triangle from `[aria-pressed]`, `currentcolor`). Added `accessibility.autoplay_pause` ("Pause autoplay") in `locales/en.default.json`.
- `sections/slides-show.liquid` renders it last in `.slides-show__controls-row` (multi-slide only). `sections/routine-showcase.liquid` renders it beside `.routine-showcase__tabs`, outside `role="tablist"`, inside `.routine-showcase__desktop`. Placement CSS only in those stylesheets. No schema change.
- `assets/slides-show.js` and `assets/routine-showcase.js`: `_userPaused`, click toggle sets `aria-pressed`, the button is unhidden only when autoplay can run, and the flag joins `_isInteractionPaused()` / `_isAutoplayFrozen()`. Pointer leave, focus leave, a manual slide or tab change, and viewport re-entry do not clear it.
- Correction after the first Playwright run: Swiper resumes autoplay on its own after a manual slide (`slideChangeTransitionEnd` / `autoplayResume`). While `_userPaused`, those events and the pagination click call `_syncAutoplay()` again. Focusing the pause button does not set `_focusPaused` (Chromium leaves `:focus-visible` after a click, which would block the second click from resuming); dots still pause on keyboard focus.
- Scratch script `D:/project/shopify_project/6-a1-evidence/accept.cjs` (outside the repo; delete at batch close). Dev server was already on `http://127.0.0.1:9292`. Password read from `.env` inside the script and never printed.

### Acceptance 1 and 2

Command: `node D:\project\shopify_project\6-a1-evidence\accept.cjs`. First run exit 1, 31 cases, 4 failed (slideshow dot-tap at 375 and 1280: the slide changed and `aria-pressed` stayed `true`, but Swiper `autoplay.paused` became false, then the follow-up wait advanced). After the correction above, the second run exit 0, 31 cases, 0 failed. Each case below is from that second run.

| Case | Result |
| --- | --- |
| emulation 375 touch: can-hover is false | PASS (`canHover` false, `hover` false, `fine` false, `reduce` false, width 375) |
| slideshow 375 touch: button visible and named Pause autoplay | PASS |
| slideshow 375 touch: click pauses and sets aria-pressed true | PASS (`pressed` true, index 0, `paused` true, `running` true, delay 5000) |
| slideshow 375 touch: slide unchanged for longer than the autoplay delay | PASS (index 0 before and after, delay 5000) |
| slideshow 375 touch: dot tap while paused changes the slide and stays paused | PASS (0 → 1, `paused` true, `stillPressed` true) |
| slideshow 375 touch: stays paused after the dot tap | PASS (index 1, `paused` true, delay 5000) |
| slideshow 375 touch: second click resumes | PASS (`aria-pressed` false, `paused` false, `running` true, then the slide advanced) |
| routine 375 touch: no pause button | PASS (`routineVisible` false) |
| accessibility tree: button role, name Pause autoplay, pressed state | PASS (role button, name "Pause autoplay", pressed "false", ignored false; one node) |
| keyboard: pause button reachable by Tab | PASS |
| keyboard: Enter and Space toggle aria-pressed | PASS (Enter `true`, Space `false`) |
| keyboard: visible focus ring | PASS (`outlineStyle` solid, `outlineWidth` 2px) |
| emulation 1280 touch: can-hover is false | PASS (width 1280) |
| slideshow 1280 touch: button visible and named Pause autoplay | PASS |
| slideshow 1280 touch: click pauses and sets aria-pressed true | PASS (index 0, `paused` true, delay 5000) |
| slideshow 1280 touch: slide unchanged for longer than the autoplay delay | PASS |
| slideshow 1280 touch: dot tap while paused changes the slide and stays paused | PASS (0 → 1, `paused` true, `stillPressed` true) |
| slideshow 1280 touch: stays paused after the dot tap | PASS (index 1, `paused` true) |
| slideshow 1280 touch: second click resumes | PASS (`paused` false, then the slide advanced) |
| routine 1280 touch: button visible and named Pause autoplay | PASS |
| routine: pause button is outside role=tablist | PASS (`insideTablist` false) |
| routine 1280 touch: click pauses and sets aria-pressed true | PASS (index "0", `playState` paused, pressed true) |
| routine 1280 touch: step unchanged for longer than the autoplay delay | PASS (index "0" before and after, `speedMs` 5000) |
| routine 1280 touch: tab tap while paused changes the step and stays paused | PASS ("0" → "1", `playState` paused, pressed true) |
| routine 1280 touch: second click resumes | PASS (`playState` running, pressed false, then the step advanced) |
| emulation 1280 desktop: can-hover is true | PASS (`canHover` true, `hover` true, `fine` true, width 1280) |
| desktop 1280: both pause buttons are not displayed | PASS (`slideVisible` false, `routineVisible` false) |
| desktop 1280: hover on the active slideshow dot pauses | PASS (index 0, `paused` true) |
| desktop 1280: hover on the active routine thumbnail pauses | PASS (`playState` paused, pressed false; the attribute `hidden` is false and CSS `display: none` keeps it undisplayed) |
| emulation reduced motion: reduce matches | PASS (`reduce` true, `canHover` false, width 1280) |
| reduced motion: no pause button displayed | PASS (both not visible) |

### Acceptance 3

| Command | Result |
| --- | --- |
| `npx prettier --check` on `snippets/autoplay-pause-button.liquid`, `sections/slides-show.liquid`, `sections/routine-showcase.liquid`, `assets/slides-show.js`, `assets/routine-showcase.js`, `locales/en.default.json` | exit 0, "All matched files use Prettier code style!" |
| `npm.cmd run lint:theme` | exit 0, "Theme architecture lint passed." Three pre-existing `[dead-setting-unprovable]` notes (`sections/header.liquid`, `snippets/header-dropdown-super-menu.liquid`, `snippets/social-icons.liquid`). |
| `npm.cmd run lint:i18n` | exit 0, "i18n lint passed." and "Unused locale key lint passed." |
| `npm.cmd run lint:liquid-syntax` | exit 0, "Liquid syntax lint passed." |
| `npm.cmd run lint:compat` | exit 0, "Embedded compatibility lint passed (62 stylesheet blocks, 0 javascript blocks)." |
| `npm.cmd run scan:compat` | exit 0, Tailwind v4.1.18 done in 128ms, then the same embedded line (62 stylesheet blocks, 0 javascript blocks). |
| `npm.cmd run lint:doc-paths` | exit 0, "Doc path lint passed." |
| `npm.cmd run test:theme-check` | exit 0, "152 files inspected with no offenses found." |
| `npm.cmd run test:layout` | exit 0, "New issues (not in baseline): 0". Wall time 171520ms. |

### Acceptance 4

`git status --short` after `scan:compat`: the surface files plus `docs/agent/board.md` and `docs/agent/context.md`. `assets/tailwind.output.css` is not modified. `git diff -U0 HEAD -- sections/slides-show.liquid sections/routine-showcase.liquid` matched no `schema` lines. `docs/agent/board.md` is one pre-existing line outside this surface ("Plan after 6-V6" → "Planned as 6-A1"); this batch did not edit it. The new snippet is untracked, so it does not appear in `git diff HEAD`.

### Acceptance 5

Not run here. The user look on a touch device stays in the consolidated browser pass.


**Coordinator check of 6-A1 (2026-10-13):** code read in full (snippet, both modules, both sections, locale). The user pause joins each module's existing pause aggregate; slides-show re-applies it after Swiper's own resume (`slideChangeTransitionEnd`, `autoplayResume`, dot click), the fix the executor found on the first acceptance run. `routine-showcase__tabs-row` wraps the tablist: no child, sibling or structural selector targets `.routine-showcase__tabs` (`grep` over the section, its module and `tailwind/`); with the button hidden the tablist still fills the row (`flex: 1 1 auto`), so mouse layouts are unchanged (`test:layout` 0 new). The new snippet is untracked: review must include it (`git status`). Verdict: ready for independent review.

**Independent review 1 (2026-10-13): FAIL (P2).** At 1280 touch: select step 2, pause, resize to 375 and back, resume: the step never advances. The mobile rail sets `activeIndex` (to 0) alone, so tabs and the progress bar stay on the old step. Pre-existing (HEAD stalls the same way) but on the requested path. Everything else proven (slideshow edge cases including Editor events and viewport re-entry, desktop and reduced-motion hiding, keyboard, accessibility tree, tab geometry, code, i18n, validators).

**Coordinator correction after review 1 (2026-10-13):** `assets/routine-showcase.js`, the `_desktopMql` change handler: on entering desktop, `this.setActive(this.activeIndex)` resyncs tabs, focus index, a11y and restarts the active bar (the path a tab selection takes). Scratch Playwright (outside the repo; touch, 1280; newsletter popup suppressed as in `layout-check.mjs`): select step 2, pause, 375, back to 1280 (step resynced to 0), resume: advanced to step 1 within 6.5s. `lint:theme`, `lint:compat`, Prettier on the file pass.

**Independent review 2 (2026-10-13): PASS.** No findings (28 Playwright checks: the resize sequence and its variants, focus retention, desktop and slideshow regressions). Physical-device look: consolidated browser pass.
