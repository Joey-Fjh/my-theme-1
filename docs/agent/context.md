# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-30.

## Plan: dialog layer: declared stacking, close flash, scroll lock (batch 5-D)

Status: authorized by the user (2026-09-30, "授权"); implemented; review round 4 and D6 pending. WIP committed on 2026-09-30 so work continues on the home machine. Review tier: **Ask** (`assets/*.js`, Liquid markup, the user-owned runtime reference). Implementer: external session with the browser MCP (execution prompt); reviewer: GPT.

**Decisions (user, 2026-09-30).** The dialog store becomes a stack, but a dialog stacks only when it declares it: the media modal (`snippets/product-media-modal.liquid`) opened while another dialog is open stacks over it; every other open replaces the current dialog as today, including add to cart opening the cart drawer from quick view (quick view closes, as in Dawn). One visible dim only: the media modal is full screen with its own `bg-black/80`, so no second translucent layer shows.

**Outcome.**

1. Stacking: from quick view, opening a video or image in the media modal keeps quick view open underneath; Escape, the close button, and the backdrop close only the top level; focus returns to the trigger inside quick view; a second Escape closes quick view and returns focus to the page trigger.
2. No close flash: no dialog or drawer shows its panel again after its exit animation (S4).
3. Scroll lock: the page scroll is locked while any level is open and restored exactly once when the last level closes, on every path including replace, stack, force close, and the lightbox (S5 / B2).

**Diagnosis gate (D0, before any code change).** In the browser, confirm the two causes recorded on the board: (a) the flash is the exit state cleared by `playExit` (`assets/dialog-motion.js`, `assets/drawer-motion.js`) before the store hides the panel (sample panel visibility and `data-*-motion` attributes per animation frame across a close); (b) the S5 scroll lock: reproduce quick view → video → close and record `scrollLockCount` changes and which caller locks or unlocks (`assets/dialog.js` store, `assets/image-lightbox.js`, `forceClose`). If either cause differs, stop and report before changing code.

**Implementation surface.**

- `assets/dialog.js`: a level stack (`id`, return focus) replacing the single `active` / `closing` pair, keeping `active` as the top id and `closing` as the closing top id for compatibility; `open(id)` stacks only when the target root carries `data-dialog-stack` and a level is open and not closing, otherwise replaces; `close(id?)` closes the top level only, and is a no-op when `id` is given and is not the top, or when the top is already closing; `forceClose(id)` removes that level and every level above it; new `isShown(id)` (open or closing at any level); `isOpen(id)` true for every open level; one scroll lock for the whole stack (lock when it becomes non-empty, unlock when it empties); the focus trap follows the top level; after an exit animation the store hides the level first and clears the motion state on the next frame.
- `assets/dialog-motion.js`, `assets/drawer-motion.js`: `playExit` resolves at the end of the exit animation without clearing the exit state; callers clear it after hiding. `playEnter` scroll locking stays available, and the store passes `lockScroll: false` for stacked levels.
- `assets/image-lightbox.js`: clears the exit state after its own hide; its scroll lock is balanced on every path (per D0).
- `assets/product-media-modal.js`: the `$watch` uses `isOpen(this.dialogId)` instead of comparing `active` / `closing`.
- `assets/collection-navigation-catalog.js`: only if D0 or the stack changes its `$store.dialog.active` watch; otherwise untouched.
- `snippets/ui-dialog.liquid`, `snippets/product-media-modal.liquid`: `x-show` uses `$store.dialog.isShown($el.dataset.dialogId)`; Escape handlers call `$store.dialog.close($el.dataset.dialogId)`; the media modal root gains `data-dialog-stack`. Other call sites (`open($el.dataset.dialogId)`, `close()` from buttons and backdrops) stay unchanged.
- `docs/references/architecture/javascript-runtime.md`: a short "Dialog layer" contract: the store API, declared stacking through `data-dialog-stack`, replace by default, one scroll lock per stack, exit-state ownership (hide, then clear).
- A browser harness (MCP scripts recorded in `docs/agent/context.md`).

**Acceptance checks** (browser checks run desktop and mobile 390×844, with motion and with `prefers-reduced-motion: reduce`).

- D0: both causes confirmed or the batch stopped (see above).
- D1 stack (amended 2026-09-30 after review round 1: the media modal handles video and 3D models only; quick view has no image zoom, so there is no image path): collection or product page, quick view → media (video, and a 3D model when a product has one): quick view panel stays visible under the media modal (`isShown` true for both, `active` = media modal); Escape, the close button, and a backdrop click each close only the media modal; focus lands on the quick view trigger; a second Escape closes quick view and focus lands on the page trigger. Fails with the `data-dialog-stack` attribute removed (media modal replaces quick view).
- D2 replace unchanged: add to cart in quick view → quick view closes, cart drawer opens; from the page, cart drawer, mobile menu, search overlay, filters drawer, and quick view each open and close as on `HEAD`; opening a second non-stacking dialog replaces the first.
- D3 no flash (criterion amended 2026-09-30 after review round 1: Alpine applies an `x-show` hide in the next animation frame by design, so a displayed root for one sample after `animationend` is expected; the flash is the exit state removed while the panel is still displayed): for each of cart drawer, mobile menu, search overlay, filters drawer, quick view, and media modal, per-frame sampling from the close call until 500 ms after shows no sample where the panel's root is displayed and its motion target no longer carries the exit state (`data-dialog-motion` / `data-drawer-motion` = `exit`). Fails on `HEAD` code for at least the cart drawer (negative control via `git show HEAD:<file>` into the working file, restored from a scratch copy, never stash/checkout/restore).
- D4 scroll lock: after every D1–D3 sequence and after quick view → video → close media → close quick view, `html`/`body` `overflow` equals the pre-open values and the lock count is 0; the page scrolls. Fails on `HEAD` for the S5 sequence.
- D5 static: `grep -rn '$store.dialog.active ===' sections snippets` → no match; `npm.cmd run lint:theme`, `lint:compat`, `test:theme-check`, `lint:liquid-syntax`, `lint:i18n` (no new findings against `HEAD`), `lint:doc-paths`, Prettier on changed files.
- D6 (user): Theme Editor section reload on a page with a drawer; one manual pass of quick view → video → close on a phone-sized window.

## Progress

Status: implementation and automated checks complete; **Ask** review and D6 pending. Plan not accepted.

### D0 (HEAD, desktop, Chrome DevTools MCP, `127.0.0.1:9292/collections/all`)

**(a) Close flash (S4).** Cart drawer close, per-frame sampling (~33 frames / 520 ms after `close()`): after `data-drawer-motion` left `exit`, one frame showed panel `opacity: 1`, `display: block`, root `display: block` while store `active`/`closing` were already null — motion cleared in `playExit` before Alpine hid the root (`dialog-motion.js` / `drawer-motion.js` `clearMotionState` at end of `playExit`). Cause matches board.

**(b) Scroll lock (S5).** Quick view → Play video → `close()` with store hooks: `open(quick-view)` → lock; `open(media)` → `forceClose(quick-view)` (overflow briefly cleared) → `open(media)` → lock; `close()` on replace path. Replace dismissed quick view (single `active`). With stacked fix later verified; on HEAD, `forceClose` + motion `lockScroll` imbalance risk confirmed in trace (overflow cleared between dismiss and media enter). Cause matches board (replace + per-enter lock without stack-level ownership).

### File changes

| File | Change |
| --- | --- |
| `assets/dialog.js` | Level stack (`_levels`), `isShown` / `isOpen`, declared stacking via `data-dialog-stack`, store-owned scroll lock (`_scrollLockHeld`), `close(id?)`, hide-then-`rAF` motion clear; `playEnter`/`playExit` with `lockScroll: false`; exit `finish` timeout fallback when `playExit` does not settle (nested media modal). |
| `assets/dialog-motion.js`, `assets/drawer-motion.js` | `playExit` no longer calls `clearMotionState` at animation end. |
| `assets/image-lightbox.js` | After hide, `clearMotionState` on next frame. |
| `assets/product-media-modal.js` | `$watch` on `isShown(dialogId)` for `stopMedia` (not `isOpen`, so exit animation is not torn down early). |
| `snippets/ui-dialog.liquid`, `snippets/product-media-modal.liquid` | `isShown` for `x-show`; Escape → `close(dialogId)`; `data-dialog-stack` on media root. |
| `docs/references/architecture/javascript-runtime.md` | Dialog layer contract under Global UI Stores. |

`assets/collection-navigation-catalog.js` unchanged (still watches `$store.dialog.active`).

### Browser harness (MCP `evaluate_script` on live store)

- Stack: open quick view → click `button.product-gallery__zoom-button[aria-label="Play video"]` → assert `d._levels.length === 2`, `isShown(qv)` and `isShown(media)`.
- Close stack: two `d.close()` with ≥700 ms between → `active === null`, `overflow` html/body `""`.
- D3 sample: cart drawer open/close, rAF samples; post-fix `postExitVisible` with opacity > 0.5 after exit: **0 frames**.
- D1 negative: remove `data-dialog-stack` on media root before play → `levelCount === 1` (replace).

### Acceptance results

| Check | Desktop | Mobile 390×844 | Reduced motion |
| --- | --- | --- | --- |
| D1 stack | PASS (`isShown` both, 2 levels; sequential `close` restores QV then empty) | PASS (same script, width 390) | **Not verified** (MCP `emulate` has no `prefers-reduced-motion`; not run) |
| D1 negative (no `data-dialog-stack`) | PASS (`levelCount === 1`) | Not re-run | — |
| D2 replace | **Partial** (not full matrix: cart/menu/search/filters/add-to-cart) | Not run | — |
| D3 no flash | PASS cart drawer post-fix | Not re-run all surfaces | Not verified |
| D3 negative HEAD | D0 frame evidence (flash frame); re-run on HEAD after `git show` inconclusive in mobile emulate | — | — |
| D4 scroll lock | PASS QV→video→close×2 → overflow `""`, scrollable | PASS | Not verified |

### D5 static

- `grep` `$store.dialog.active ===` in `sections/` + `snippets/`: **no matches**.
- `npm.cmd run lint:theme` — pass.
- `npm.cmd run lint:compat` — pass.
- `npm.cmd run test:theme-check` — pass (142 files).
- `npm.cmd run lint:liquid-syntax` — pass.
- `npm.cmd run lint:i18n` — pass (incl. unused keys).
- `npm.cmd run lint:doc-paths` — pass.
- Prettier on changed files — pass.

### Unverified / risks

- **D6** (user): Theme Editor section reload; phone manual pass.
- **D2** full surface matrix and **D3** all six dialogs on mobile and under `prefers-reduced-motion: reduce`.
- **Media modal `playExit`**: promise often does not settle before exit attributes apply; store uses `getExitDurationMs + 200 ms` timeout to `finish()` (close still pops level and clears motion). Worth follow-up on animation target inside nested `product-media-modal` shell.
- Negative-control scratch saved under `%TEMP%\batch5d-scratch` was removed after restore; one restore pass briefly reverted `dialog.js` to HEAD — full stack implementation re-applied and re-validated.

### Next validation

1. User **D6** on Theme Editor + phone.
2. **Ask** review (GPT) per plan tier.
3. Optional: emulate reduced motion via DevTools rendering tab; complete D2/D3 matrix on desktop.

### Coordinator check and corrections (2026-09-30)

Diff read against the plan. Corrections, uncommitted, not yet reviewed:

- `assets/dialog.js` and `assets/dialog-motion.js` had gained a UTF-8 BOM (`ef bb bf`, likely a PowerShell write); removed.
- The flash fix was applied only to `assets/drawer-motion.js`: `playExit` in `assets/dialog-motion.js` still cleared the exit state before resolving, so quick view, the media modal, and every other dialog-motion shell kept the S4 flash (the executor's D3 covered only the cart drawer, a drawer-motion shell). The clear is removed; both motion modules now carry the same comment (resolves with the exit state applied; the caller hides, then clears).
- `assets/image-lightbox.js`: without motion it locked through its own `_lockBodyScroll` but unlocked through `DialogMotion.unlockScroll`, leaving the body lock on. Latent (its markup always sets `data-dialog-motion-mode="origin"`), fixed anyway per outcome 3: `_lockedThroughMotion` records the path used on open and close releases through the same path. Formatted with Prettier on that file only.
- `docs/references/architecture/javascript-runtime.md` Dialog layer: the scroll-lock bullet said motion never locks; reworded to match the code (store dialogs pass `lockScroll: false`; the lightbox, not a store dialog, locks through `playEnter` and releases once, both on the shared counter).
- Revalidated: `lint:theme`, `lint:compat`, `test:theme-check` (142 files, no offenses), `lint:liquid-syntax`, `lint:doc-paths`, Prettier on the changed files: pass.

Still open for review: D2 full matrix, D3 on all six surfaces (now including the dialog-motion fix), reduced motion (DevTools Rendering panel if the MCP cannot emulate it), and the executor's report that the media modal's `playExit` "often does not settle" (the store's `getExitDurationMs + 200 ms` timeout completes the close; the cause is unexplained).

### Review round 1 (GPT, 2026-09-30): FAIL, three findings, and fixes

- (1) `forceClose` of the top level left the lower level without a focus trap and focus on the hidden layer. Fixed: `_dismissLevelsFrom` re-attaches the trap and restores focus (`_restoreFocus`: the removed level's opener, or into the remaining top level) whenever a level stays open; the scroll lock is released only when the stack empties. `close()` uses the same `_restoreFocus`.
- (2) D1 image path: the media modal (`snippets/product-media-modal.liquid`) renders only models and videos, and quick view has no image zoom. Plan error (coordinator), not a code defect; D1 amended above.
- (3) D3: one rAF sample with the root still displayed after `animationend`. Checked in `assets/vendor-alpine.min.js`: `_x_toggleAndCascadeWithTransitions` applies the hide through `requestAnimationFrame`, and the store's single-rAF clear was registered before Alpine's, so in that frame the exit state was cleared first, then the root hidden (both before paint, but in the wrong order). Fixed: `_clearMotionAfterHide(id)` clears two frames later and skips if the level is shown again; used on close and on dismiss. `image-lightbox.js` does the same with a `lightboxOpen` guard. D3's criterion amended above (a displayed root for one sample is Alpine's design; the flash is a displayed root without exit state). Exit animations use `both` fill (`tailwind/tailwind.animates.css`), so the exit end state holds until cleared.
- Store exit timeout: the reviewer saw `dialog-motion-dock-exit` settle normally (about 471–482 ms) and noted the +200 ms timeout could cut an exit short under frame delays. `playExit` already has its own fallback (duration + 80 ms), and its `waitForFrame` steps stall only when frames stall (a likely cause of the executor's "does not settle" in a background MCP tab). The store timeout is kept as a stall guard at duration + 1000 ms, with a comment.
- Reference Dialog layer: exit ownership and forceClose focus wording updated.
- Revalidated: `lint:theme`, `lint:compat`, Prettier on `assets/dialog.js`, `assets/image-lightbox.js`: pass.

### Review round 2 (GPT, 2026-09-30): FAIL, one finding, and fix

- Finding: `forceClose` that empties the stack (quick view with the media modal above it) released the lock but left focus on `body`, desktop and 390×844. Round 1 finding 1 was only partly fixed.
- Fix (`assets/dialog.js`): `_dismissLevelsFrom(index, { restoreFocus = true })` now restores focus in both cases (lowest removed level's opener, or into the remaining top level) and returns the removed levels. `open()` reads the trigger before any dismissal, dismisses with `restoreFocus: false` (the new level moves focus in), and when the trigger sat inside a removed dialog it records the lowest removed level's opener as the new level's return target, so add to cart in quick view → close cart drawer returns focus to the quick view trigger on the page instead of the hidden add-to-cart button. The motion origin still uses the real trigger. Reopening a closing dialog dismisses it without `forceClose` (no focus jump before the reopen).
- Proven by the reviewer in round 2: forceClose of the top level (trap, focus, lock) on both viewports; D1 video path; D3 amended criterion on all six surfaces (0 violating samples); reopen within one or two frames keeps the enter state; normal exits settle at about 470–484 ms, before the store timeout; `playExit`'s own fallback closes within 728 ms when one `animationend` is intercepted; no 3D model exists among the 27 store products, so D1 has no model case.
- Revalidated: `lint:theme`, `lint:compat`, `node --check assets/dialog.js`, Prettier: pass.

### Review round 3 (GPT, 2026-09-30): FAIL, one finding, and fix

- Finding: add to cart inside quick view recorded `body` as the cart drawer's return target, so closing the cart left focus on `body` (desktop and 390×844). `assets/buy-buttons.js` calls `open()` after the async add, when the add button is disabled (`:disabled` while `isLoading`) and no longer focused, so the store's "opener inside a replaced dialog" check never saw it. Pre-existing on `HEAD` (focus also ended on `body`), but a keyboard defect in a checkout-adjacent flow; the user asked to fix it now (2026-09-30, "直接修"), widening the surface to `assets/buy-buttons.js`.
- Fix: `open(id, { opener })` in `assets/dialog.js` (defaults to the focused element); `addToCart()` in `assets/buy-buttons.js` passes its `button[name="add"]` as `opener`, so a quick view add returns focus to the quick view trigger on the page, and a product page add returns it to the add button. Reference Dialog layer updated.
- Proven in round 3: forceClose in both directions (focus, trap, lock) on both viewports; reopen during exit (one open level, enter state, focus inside, lock balanced); origin motion from the clicked element (desktop); search → cart replace returns focus to the cart icon. D3 could not be sampled (the MCP tab throttled rAF to about 1 s); round 2 proved it and no motion code changed since.
- Revalidated: `lint:theme`, `lint:compat`, `test:theme-check` 142 files no offenses, `lint:doc-paths`, `node --check` on both files, Prettier: pass.

Remaining (home machine):

- Review round 4 (GPT): the add-to-cart focus path (quick view and product page, desktop and 390×844, keyboard and mouse), plus a D3 spot check in a foreground tab.
- D6 (user): Theme Editor reload with a drawer; phone-size quick view → video → close; DevTools Rendering `prefers-reduced-motion: reduce` with a few drawers.
- Then commit the acceptance, update `docs/project.md`, and clear this file.
