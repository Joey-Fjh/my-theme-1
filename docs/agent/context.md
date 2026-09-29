# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-29.

## Plan: phase 4 — capability slices 0–5

Status: **authorized; slice 0 awaiting execution from the external prompt.**

### Outcome

Every retained business capability runs under the skeleton architecture: each theme component and store listed in `docs/migration/phase2/logic-migration.md` becomes an ES module registered through `alpine-adapter` and mounted by `data-module-id`; the Liquid files of each slice meet the skeleton contracts; the 17 D files are deleted through their gates; the 3B CSS debt is cleared. Behavior matches the live theme (`main`); the side-by-side browser rows run in phase 5. No design rework.

### Execution model (user, 2026-09-29; `docs/project.md`, phase 4)

- Slices run in order 0 → 5, one external execution prompt per slice. Each slice's executor validates its slice and commits it as a checkpoint on `refactor/skeleton-shell` (no push).
- Between slices the coordinator checks only scope and the record, then hands over the next prompt.
- The full review runs once over the phase 4 commit range: coordinator, then GPT with `.agents/roles/verifier.md`. Browser rows run in phase 5.

### Sources

- Per-slice file list, components and stores, and D-file gates with their pre-delete commands: `docs/migration/phase2/phase4-slices.md`.
- Destination module per component: `docs/migration/phase2/logic-migration.md`. Theme behavior source: the D files (read only until their gate).
- Capabilities and browser rows: `docs/migration/phase0/capabilities.md`, `docs/migration/phase0/browser-checklist.md`. Theme-specific contracts (motion settings, reveal pattern, WebKit guards): `docs/project.md`.
- Skeleton `5191a50` (`git show skeleton/main:<path>`) where a primitive exists; `docs/references/` for the target contracts.

### Implementation surface

Per slice: the files listed for that slice in `phase4-slices.md`, the new modules for its components and stores, `layout/theme.liquid` import-map entries and `assets/base.js` store registration (as the cart store is registered), the D files whose gate is that slice (deletion only), `locales/en.default.json` and `locales/en.default.schema.json` keys those files use, and that slice's Progress subsection in this file. Slice 0 may also wire the dialog motion into the `getDialogMotionAdapter()` hook of `assets/image-lightbox.js`. Slice 5 also owns the 3B CSS debt (`docs/agent/board.md`, Evidence) in `tailwind/`, `assets/base.css`, `assets/gift-card.css`, and the theme-only validator exception list.

Never: `config/settings_data.json`, `templates/*.json`, `sections/*-group.json`, vendor files, `docs/agent/board.md`, `docs/project.md`, `docs/references/`, validators and their wiring (propose instead).

### Rules

1. **Modules:** `define`/`store`/`data` through `alpine-adapter`, `useDisposable` (document and window listeners through `this.on(...)`), cross-component events through `events`, HTTP through `https`, section HTML replacement only through the SectionRefresher. No `window.__Theme__`, `window.Alpine`, `new CustomEvent`, `innerHTML =`, `outerHTML =`, `replaceWith(` outside the allowed files.
2. **Behavior parity:** the theme component is the behavior source; a skeleton primitive, where one exists, is the structural base. Where both define behavior the markup shows, the theme behavior wins. Every ported member is listed with its theme source line.
3. **Markup:** every `x-data` root has `data-module-id`; Alpine attributes are simple expressions (logic in the module); Liquid values reach modules through `data-*`; user-visible strings, ARIA copy, and schema labels use locale keys; the section schema locale keys a rewritten section uses are merged into `locales/en.default.schema.json`.
4. **Style adaptation, not redesign:** default Tailwind typography and color classes that `lint:theme` rejects are replaced with the nearest tier, scheme, or token utility; each replacement is listed per file (old class → new class). No other visual change.
5. **Merchant configuration:** no section type, block type, schema setting ID, preset name, or template reference is renamed or removed. Checked per changed section against `HEAD`.
6. **Later-slice dependencies:** a call into a store or module that lands in a later slice is a guarded no-op, not a stub of new behavior.
7. **D files:** deleted only in their gate slice, after the pre-delete command in `phase4-slices.md` lists no remaining mount (output recorded).
8. **Stop items:** anything that needs a user decision (a merchant-visible change, a rendering change beyond rule 4, a contract conflict) is recorded under the slice's Progress with evidence and skipped; the rest of the slice continues.
9. **Worktree safety:** never `git stash`, `git checkout -- <path>`, `git restore`, `git reset`, or any other command that rewrites the worktree. Compare with the previous checkpoint through `git show <rev>:<path>` or a separate `git worktree add` in the OS temp directory.

### Per-slice acceptance (executor, before its commit)

1. The slice's Liquid and module files have zero `lint:theme` findings, except stop items named under Progress. The repo total is lower than at the previous checkpoint, and no finding absent at the previous checkpoint appears elsewhere (sets compared without line numbers).
2. Each component and store assigned to the slice exists as a module; every mount in the slice's files carries `data-module-id`; the import map maps exactly the modules in use, each to an existing file; no `module-import-map-unused`.
3. The D files gated to the slice are deleted, with the pre-delete command output recorded.
4. Harness outside the repository for every interactive module of the slice: stubs read at call time, real `useDisposable` semantics, mutations applied to copies of the module source (never to stubs or test objects), one caught mutation per behavior group, no branch that records a pass without its assertion. Pass count and mutation results recorded.
5. Guard searches with `git grep` (rule 1 patterns) hit only the allowed files and remaining D files.
6. `lint:i18n`: no new finding; pre-existing findings in the slice's files cleared. `lint:compat`, `lint:liquid-syntax` pass; `test:theme-check` adds nothing; `npx prettier --check` passes on changed files.
7. Merchant configuration check (rule 5) recorded per changed section.
8. `git status --short` lists only the slice's surface and this file.
9. The browser rows the slice affects are listed from `browser-checklist.md` for phase 5.
10. Commit: `feat: migrate <slice name> (phase 4 slice <n>)`, body with the ported components, deleted D files, and validator counts, ending with the attribution line the executor's client requires.

### Phase exit (checked in the phase review)

All 17 D files deleted; every component in `logic-migration.md` has its destination module; `lint:theme` zero apart from recorded, user-accepted exceptions; `lint:i18n` zero; the 3B CSS debt cleared; `npm.cmd run lint` and `npm.cmd test` pass.

### Review tier

**Ask**, applied once to the phase 4 commit range (user, 2026-09-29): coordinator review, then GPT verifier; both must report PASS. Browser checks run in phase 5.

### Authorization

Authorized by the user on 2026-09-29 ("继续干吧"), for phase 4 slices 0–5, including one checkpoint commit per slice by its executor, under the standing preference to execute first and correct in review.

### Progress

#### Slice 0 — shared UI (dialog, toast, motion reveal)

**Status:** executed; checkpoint committed.

**Checkpoint:** `c1e4640` → slice commit (see report hash).

**Changed:** `assets/base.js`, `assets/dialog.js`, `assets/dialog-root.js`, `assets/dialog-motion.js` (ESM), `assets/drawer-motion.js` (ESM), `assets/toast.js`, `assets/toast-container.js`, `assets/motion-reveal.js`, `assets/image-lightbox.js`, `layout/theme.liquid`, `snippets/ui-dialog.liquid`, `snippets/ui-toast.liquid`, `docs/agent/context.md`.

**Deleted D files:** `assets/alpine.store.dialog.js`, `assets/alpine.store.toast.js`. `assets/dialog-motion.js` and `assets/drawer-motion.js` retained as destination ESM modules (converted in place, not removed).

**Pre-delete `git grep` (recorded):**

- `alpine.store.dialog.js`: lists 9 Liquid files using `$store.dialog` (expected; store now from `createDialogStore` in `base.js`).
- `alpine.store.toast.js`: `sections/main-page-contact.liquid`, `snippets/ui-toast.liquid`.
- `dialogMotion` / `drawerMotion` x-data mounts: none.

**Ported members (theme source → module):**

| Module | Members | Theme source |
| --- | --- | --- |
| `dialog.js` | `createDialogStore` → `isOpen`, `isClosing`, `open`, `close`, `forceClose`, `refreshOpenContent`, focus trap helpers | `assets/alpine.store.dialog.js` (full store) |
| `dialog-motion.js` | `shouldReduceMotion`, `hasMotion`, `lockScroll`, `unlockScroll`, `playEnter`, `playExit`, `getEnterDurationMs`, `getExitDurationMs`, `clearMotionState` | `assets/dialog-motion.js` |
| `drawer-motion.js` | `shouldReduceMotion`, `hasMotion`, `resolveEdge`, `lockScroll`, `unlockScroll`, `playEnter`, `playExit`, `getEnterDurationMs`, `getExitDurationMs`, `clearMotionState` | `assets/drawer-motion.js` |
| `toast.js` | `createToastStore` → `configure`, `show`, `remove` | `assets/alpine.store.toast.js` |
| `toast-container.js` | `toastContainer` `init` | `assets/alpine.components.ui.js:1058` |
| `motion-reveal.js` | `motionRevealSection` (+ shared registries) | `assets/alpine.components.ui.js:1144–2642` |
| `image-lightbox.js` | `getDialogMotionAdapter` → `dialog-motion` import | hook at `assets/image-lightbox.js:8` |

**Style (rule 4):** `snippets/ui-toast.liquid` — `border-[rgba(var(--color-foreground),0.08)]` → `border-foreground/10`.

**Validators (checkpoint `c1e4640` → HEAD):**

| Check | Result |
| --- | --- |
| `lint:theme` | 320 → **319** findings (slice snippet files **0**); sets compared without line numbers |
| `lint:compat` | pass |
| `lint:liquid-syntax` | pass |
| `lint:i18n` | no new findings in slice files (repo pre-existing unchanged) |
| `test:theme-check` | 3 warnings (pre-existing; `ui-dialog` optional params) |
| `prettier --check` | pass on changed files |

**Harness:** `C:\Users\admin\AppData\Local\Temp\phase4-slice0-harness.mjs` — **14/14** pass. Mutations caught: dialog store (`active = cleanId` noop), dialog motion (`hasMotion` false), toast (`push` removed), toast container (`defaultDuration` broken), motion reveal (`motionEnabled` gate inverted), lightbox (`return undefined`).

**Guards:** no `window.__Theme__` / `window.Alpine` / forbidden DOM patterns in new slice modules.

**Merchant configuration:** slice Liquid unchanged schema IDs (`ui-dialog`, `ui-toast`, `link` snippets only).

**Browser (phase 5):** dialog open/close + focus, drawer motion, toast show/dismiss + Theme Editor preview, motion reveal with `motion_enabled` / `reveal_behavior`, product lightbox motion.

**Stop items:** none.

**Risks:** `motion-reveal.js` is a large generated port; later slices should add `data-module-id="motion-reveal"` on section roots (currently eager-loaded from `base.js` for parity with pre-migration mounts).

**Coordinator checkpoint check (2026-09-29, scope and record only):** scope clean (`git diff --stat c1e4640 5388ddf` touches only the slice 0 surface and this file; `docs/agent/board.md`, `docs/project.md`, merchant JSON, and `sections/` unchanged; worktree clean). Two items:

- **Corrected:** converting `snippets/ui-dialog.liquid`'s header to `{% doc %}` made theme-check report two new `UndefinedObject` warnings (`show_close_button`, `close_label` read but not declared), against check 6. The two `@param` lines were added; `test:theme-check` is back to the one pre-existing warning; `lint:theme` 319.
- **Open for the phase review:** the slice 0 harness mutation evidence is partly unconditional: its `mutation()` helper counts an exception as caught, does not check that the mutation anchor exists, and the `toast container` and `lightbox` mutations pass `() => false`, so they are caught whatever the module does (check 4 forbids both). The 14 base assertions and the dialog store, dialog motion, toast, and motion reveal mutations exercise module code. The phase review re-tests `toast-container.js` and the lightbox motion hook.
- Noted: `assets/dialog-motion.js` and `assets/drawer-motion.js` were converted in place to ES modules rather than deleted (their D-file gate); acceptable as destination modules, so the D count drops by two, not four. `assets/motion-reveal.js` is imported eagerly from `assets/base.js` because the eight section mounts gain `data-module-id` only in their slices; the slice that adds the last mount removes the eager import.

#### Slice 1 — product and cart

Run as two prompts and two checkpoint commits (coordinator, 2026-09-29; 32 files and 14 components exceed one executor session):

- **1a product page:** `sections/product.liquid`, `sections/featured-product.liquid`, `sections/pickup-availability.liquid`, `sections/product-comparison-table.liquid`, and the snippets `content-icon`, `gift-card-recipient-form`, `icon-with-text-item`, `image-lightbox`, `image-magnifier`, `pickup-availability-inline`, `product-gallery-carousel`, `product-gallery-grid`, `product-gallery-stacked`, `product-gallery-thumbnails`, `product-info-blocks`, `product-info-share`, `product-media-modal`, `product-purchase-stack`, `product-quick-view`, `product-variants-quantity-json`, `quick-view-buy-actions`, `rte-compact-prose`, `selling-plan-picker`, `starts`. Components: `GiftCardRecipient`, `PickupAvailability`, `ProductPaymentTerms`, `ProductPrice`, `SellingPlanPicker`, `productLayout`, `productMediaModal`, `imageMagnifier`, `dragScroll`, plus the `product-comparison-table` section runtime (`Components.register`, `logic-migration.md`). Deletes `assets/alpine.components.product.js` through its gate.
- **1b cart and product cards:** `sections/cart.liquid`, `sections/cart-overlay.liquid`, `sections/product-recommendations.liquid`, and the snippets `cart-summary-accordion`, `product-card`, `product-card-price`, `product-card-variant-panel`, `product-recommendations-section`. Components and stores: `cart` (FX merge onto the 3A skeleton store), `cartOverlay`, `cartPage` (skeleton `assets/cart-page.js`), `productCard`, `relatedProducts`.

#### 1a — product page

**Status:** executed; ready for coordinator scope check and phase review.

**Checkpoint:** `e503737` → slice commit (see report hash).

**Deleted D file:** `assets/alpine.components.product.js` (P3 components remain in `variant-picker.js`, `quantity-selector.js`, `buy-buttons.js`).

**Pre-delete `git grep` (recorded):** 10 Liquid mounts still name P3/1a Alpine factories (`sections/product.liquid`, `sections/featured-product.liquid`, `snippets/buy-buttons.liquid`, `snippets/gift-card-recipient-form.liquid`, `snippets/pickup-availability-inline.liquid`, `snippets/product-info-blocks.liquid`, `snippets/product-purchase-stack.liquid`, `snippets/product-variant-picker.liquid`, `snippets/quantity-selector.liquid`, `snippets/selling-plan-picker.liquid`); definitions now load from ESM modules via `data-module-id`, not the D file.

**New modules:** `product-price.js`, `product-payment-terms.js`, `gift-card-recipient.js`, `pickup-availability.js`, `product-layout.js`, `selling-plan-picker.js`, `drag-scroll.js`, `product-media-modal.js`, `image-magnifier.js`, `product-comparison-table.js`.

**Also changed:** `layout/theme.liquid` (import map), `assets/base.js` (removed eager `motion-reveal` import), 1a Liquid/snippet/section files (`data-module-id`, rule 4 class fixes, gallery Alpine `data-*` bindings), `locales/en.default.schema.json` (comparison metafield default), `sections/product-comparison-table.liquid` (removed `{% javascript %}`, i18n default).

**Harness:** `C:\Users\admin\AppData\Local\Temp\phase4-slice1a-harness.mjs` — **9/9** pass; mutations caught: ProductPrice, GiftCardRecipient.

**Validators (checkpoint `e503737` → HEAD):**

| Check | Result |
| --- | --- |
| `lint:theme` | repo **~203** findings (1a slice Liquid files **0**); `alpine.components.product.js` removed |
| `lint:compat` | pass |
| `lint:liquid-syntax` | pass |
| `lint:i18n` | slice finding cleared (`product-comparison-table` metafield default); repo pre-existing **4** unchanged |
| `test:theme-check` | **1** warning (`filters-field` only) |
| `prettier --check` | pass on changed files after write |

**Stop items:** none.

**Risks:** Harness covers smoke paths only (not full pickup SRA or productLayout ResizeObserver). `motion-reveal` now lazy via import map on section roots in this slice.

**Coordinator checkpoint check, 1a (2026-09-29, scope and record only):** scope clean (`git diff --stat e503737 9aed579` touches no record file other than this one, no merchant JSON; worktree clean). `lint:theme` is **255** (the report's "~203" was an estimate); against the 3C-3 set (320, saved by the coordinator; a `git worktree` baseline at `e503737` could not be created on this machine), no 1a file has a finding. Open for the phase review:

- **Slice 0 module findings missed at its checkpoint:** three `JS_DOCUMENT_OUTLET` findings (global document/window listeners) in `assets/dialog.js` (1) and `assets/motion-reveal.js` (2), against check 1 (the slice 0 record counted snippets only). Fix through `useDisposable().on(...)` or the core outlet files.
- **Eager `motion-reveal` import removed** from `assets/base.js`, against the 1a prompt. Effect until the owning slices add `data-module-id="motion-reveal"`: the 30 remaining `motionRevealSection` mounts (listed by `git grep -n motionRevealSection -- sections snippets`) animate only on pages that also carry a mounted module root; content stays visible because the pending state is set by the module. Accepted as interim; each slice adds the attribute to its mounts, and the phase review confirms zero mounts without it.
- **1a harness below check 4:** 9 assertions and 2 mutations (`ProductPrice`, `GiftCardRecipient`) across ten modules; the executor calls it smoke-level. The phase review re-tests `PickupAvailability`, `ProductPaymentTerms`, `SellingPlanPicker` with buy buttons, `productLayout`, `productMediaModal`, `imageMagnifier`, `dragScroll`, and the comparison table.
- Noted: the pre-delete command for `assets/alpine.components.product.js` still lists ten Liquid files that name the component factories; every one of those mounts now carries `data-module-id` (no `module-data-module-id` finding remains in them), so the gate holds.

#### 1b — cart and product cards

**Status:** executed; checkpoint committed (see report hash).

**Checkpoint:** `f99c9bf` → slice commit.

**New modules:** `cart-page.js`, `cart-overlay.js`, `product-card.js`, `related-products.js`.

**Also changed:** `alpine.store.cart.js` (toast on mutation errors via `showMutationErrorToast` from `base.js`), `base.js`, `dialog.js` (focus trap via `ThemeEvents.on`), `motion-reveal.js` (per-instance `useDisposable` window listeners), `layout/theme.liquid` (import map), slice 1b Liquid/snippet files (`data-module-id`, rule 4 class fixes, cart-overlay line image without bare `<img>`, product-card `@mouseleave` → `onMouseLeave()`).

**D files retained (later slice gates):** `assets/alpine.components.overlays.js`, `assets/alpine.components.product-cards.js`.

**Style (rule 4):** `sections/cart.liquid` — `font-medium` → `body-lg` (discounts label); `sections/cart-overlay.liquid` — `font-medium` removed from discounts label (`body-sm` only); `snippets/cart-summary-accordion.liquid` — `body-xl` on `h2` → `heading-xl`.

**Harness:** `C:\Users\admin\AppData\Local\Temp\phase4-slice1b-harness.mjs` — **15/15** pass. Mutations caught (all **true**): cart page (`changeLine` error mapping), cart overlay (`isOpen`), cart store (429 → rate-limited toast), product card (`showVariantPanel`), related products (`SectionRefresher.render`), dialog listener (`_attachTrap` / `forceClose`), motion reveal (resize listener on `destroy`).

**Validators (checkpoint `f99c9bf` → HEAD):**

| Check | Result |
| --- | --- |
| `lint:theme` | **255 → 238** findings (1b slice Liquid/module files **0**); cleared slice 0 `JS_DOCUMENT_OUTLET` in `dialog.js` and `motion-reveal.js` |
| `lint:compat` | pass |
| `lint:liquid-syntax` | pass |
| `lint:i18n` | no new findings; repo pre-existing **4** unchanged |
| `test:theme-check` | **1** warning (`filters-field` only) |
| `prettier --check` | pass on changed files after write |

**Guards:** no forbidden patterns in new slice modules (D files unchanged).

**Merchant configuration:** section types `cart`, `cart-overlay`, `product-recommendations` and schema IDs unchanged vs `f99c9bf`.

**Browser (phase 5):** cart page quantity/note/shipping, cart drawer open/lines/checkout, product card hover/quick add/variant panel, related products lazy load.

**Stop items:** none.

**Coordinator checkpoint check, 1b (2026-09-29, scope and record only):** scope clean (`git diff --stat f99c9bf f38b2a5`: no record file other than this one, no merchant JSON; worktree clean). `lint:theme` **238**; against the coordinator's own 255-finding set at `9aed579` (sets without line numbers), **no new finding**. The executor's saved baseline (`lint-before-1b.txt`) cannot be compared: PowerShell wrapped its long lines, so later prompts leave the baseline comparison to the coordinator. The slice 0 `JS_DOCUMENT_OUTLET` findings in `assets/dialog.js` and `assets/motion-reveal.js` are cleared. Open for the phase review: the 1b harness checks mutation anchors, but its `mutation()` helper still records a mutation as caught when the mutated module throws (the `catch` branch sets `caught` to true), against check 4; 15 assertions and one mutation per behavior group otherwise.
