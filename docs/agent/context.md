# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-29.

## Plan: phase 3 batch 3C-2 — purchase primitives

Status: **complete: coordinator review PASS after corrections; GPT review round 1 PASS; check 12 deferred to the consolidated browser pass.**

### Outcome

The skeleton (`5191a50`) `VariantPicker`, `QuantitySelector`, and `BuyButtons` modules replace the theme components of the same names (defined today in the D file `assets/alpine.components.product.js`), with the theme behavior that this batch's snippets use merged in. `assets/quantity-constraints.js` becomes the skeleton ES module plus the theme-only helpers. The three snippets mount their modules through `data-module-id`. Rendered markup keeps its current look and every current `{% render %}` caller keeps working. After this batch the product form picks variants, validates quantity, adds to cart, and runs Buy it now; the cart drawer, toasts, and gift card recipient validation stay inactive until their stores and modules land (slice 0 and slice 1).

### Source

Skeleton commit `5191a50` on remote `skeleton`. Path list: `assets/variant-picker.js`, `assets/quantity-selector.js`, `assets/buy-buttons.js`, `assets/quantity-constraints.js`, `snippets/product-variant-picker.liquid`, `snippets/quantity-selector.liquid`, `snippets/buy-buttons.liquid`.

### Implementation surface

- New modules: `assets/variant-picker.js`, `assets/quantity-selector.js`, `assets/buy-buttons.js`.
- Replaced: `assets/quantity-constraints.js` (skeleton ESM base).
- `layout/theme.liquid`: import-map entries `variant-picker`, `quantity-selector`, `buy-buttons`. Nothing else in the layout.
- Snippets: `snippets/product-variant-picker.liquid`, `snippets/quantity-selector.liquid`, `snippets/buy-buttons.liquid`.
- `locales/en.default.json`: only keys these snippets and modules reference that are missing today.
- Record files `docs/agent/context.md`, `docs/agent/board.md`, and the coordinator's status edits to `docs/project.md`.

Not in the surface: every `sections/` file (including `sections/cart.liquid`, which renders `quantity-selector`); other snippets, including `snippets/quantity-constraints.liquid` and `snippets/unit-price.liquid` (already byte-identical to the skeleton), `product-info-blocks`, `product-purchase-stack`, `quick-view-buy-actions`, `selling-plan-picker`, `gift-card-recipient-form`; the 17 D files (stay untouched); the other skeleton feature modules (3C-3); dialog and toast stores (slice 0); `tailwind/`, CSS, `config/`, schema locales, merchant JSON, vendor files, validators, references.

### Merge rules

1. **Modules:** the skeleton module is the base, with its public API names, `define` registration through `alpine-adapter`, `useDisposable` cleanup, and `ThemeEvents` for cross-component events. Add a theme behavior only when a surface snippet's markup uses it (a method, property, `$refs` name, event, or `data-*` input the skeleton module lacks); port it from the theme component in `assets/alpine.components.product.js` without `window.__Theme__`, `window.Alpine`, `new CustomEvent`, or section-HTML replacement. Alpine access goes through the adapter (`store`, `data`). List every added member under Progress with its theme source location. Behavior used only by out-of-surface mounts is not ported.
2. **Theme behavior wins (accepted 2026-09-29):** where the skeleton module and the theme component both define behavior that surface markup already shows, keep the theme behavior. Known cases: `BuyButtons.addToCart` keeps the theme flow (sections from `_getSections()` passed to `cart.add`; `cartType === 'page'` redirects to `cartUrl`; otherwise `openCartOnAdd` + `openDialogId` open the dialog store; success message through the toast store; errors to the gift card recipient API) and does not set the skeleton `isSuccess` state that would change `buttonText`; `QuantitySelector` limit feedback goes through the toast store (theme `_toast`), not the skeleton inline feedback element. Keep `buyNow` and `_getRecipientApi` (through adapter `data()`).
3. **Absent stores:** `store('dialog')` and `store('toast')` do not exist until slice 0, and `GiftCardRecipient` until slice 1. Calls to them are guarded no-ops (optional access), not removed.
4. **`assets/quantity-constraints.js`:** the skeleton ESM file is the base (`export default api`); add the theme-only `fromCartItem`, `nextValidTotal`, `largestValidTotal` to `api` with unchanged semantics; no `window.__Theme__`, no `module.exports`. Modules import it by relative path as the skeleton does; no import-map entry.
5. **Snippets:** the skeleton snippet is the structural base (doc block, `data-module-id` root, Alpine attributes as simple expressions). Keep every theme class, setting read, locale key, `data-*` input, and ARIA attribute that shapes today's rendering. Keep every parameter a current caller passes (`git grep "render '<snippet>'"`); document it in the `{% doc %}` block.
6. **Look preservation:** a change must not alter the computed style of anything rendered today. Check element markup and classes, section schema `"class"` values applied to wrappers, `{% stylesheet %}` blocks, and the compiled CSS rules that match. The four existing `font-medium` token-chain findings stay. A needed change that alters rendering is not made; list it as a conflict for the owning slice.
7. **Theme-only behavior with no clean port** that a surface snippet needs: stop and record the question under Progress.

### Dependencies

- 3A (`2a3c331`), 3B (`dcbac9f`), 3C-1 (`099ad3b`) committed.
- No open board decision: no setting ID, section type, or block type changes.

### Acceptance checks

1. Import map: keys are exactly `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, `accordion`, `dropdown`, `localization-switcher`, `variant-picker`, `quantity-selector`, `buy-buttons`; each maps to an existing file; `lint:theme` reports no `module-import-map-unused` and no missing-module-id finding for the surface.
2. Mounts: each `x-data="VariantPicker()"`, `x-data="QuantitySelector()"`, `x-data="BuyButtons()"` root in a surface snippet carries the matching `data-module-id`.
3. `npm.cmd run lint:theme`: surface findings are only the four pre-existing `font-medium` bypasses (`buy-buttons.liquid`, `product-variant-picker.liquid`, two each); no finding absent on `HEAD` elsewhere (sets compared without line numbers); total recorded against the `HEAD` count.
4. Callers: for every surface snippet, the parameters passed by each current `{% render %}` caller (search output recorded) are accepted and documented.
5. Markup bindings: every method, property, `$refs` name, and `data-*` input the three surface snippets reference exists in the matching module (script or search output recorded).
6. Look: for each changed snippet, the classes on rendered elements in the `HEAD` version are present in the new version, or each difference is shown to change no computed style under rule 6 (evidence per item).
7. Harness (board process calibration): a script outside the repository runs the three modules and `quantity-constraints.js` under stubbed imports and a minimal DOM and covers at least: variant change emits `PRODUCT_VARIANT_CHANGED` and updates quantity limits and buy-button availability; increment, decrement, and typed input snap to min, max, and step; `addToCart` passes the `_getSections()` list, redirects when `cartType` is `page`, calls the dialog and toast stores when present and does not throw when absent, and leaves `buttonText` unchanged after success; `buyNow` goes to `/checkout`; `fromCartItem`, `nextValidTotal`, `largestValidTotal` return the same values as the `HEAD` implementation for the same inputs. Record pass counts and a mutation check (reverting a ported behavior fails its assertion).
8. Module guards: no `__Theme__` or `window.Alpine` in the four modules; `git grep -n "new CustomEvent" -- "assets/*.js"` hits only `assets/events.js`, vendor files, and D files; `git grep -nE "innerHTML\s*=|outerHTML\s*=|replaceWith\(" -- assets sections snippets` hits only the SectionRefresher in `assets/https.js`, vendor files, and D files.
9. D files untouched (the 17 paths listed in `docs/migration/phase2/ownership-map.md`, class D): `git diff --stat HEAD` on them is empty.
10. `npm.cmd run lint:compat`, `npm.cmd run lint:liquid-syntax` pass; `npm.cmd run lint:i18n` and `npm.cmd run test:theme-check` add no finding absent on `HEAD`; `npx prettier --check` passes on changed files.
11. Surface: `git status --short` lists only surface and record files.
12. Browser (deferred to the consolidated phase 5 pass): on a product page, option changes update the URL and availability; quantity buttons and typed input respect min, max, and step; Add to cart adds the chosen quantity; Buy it now reaches checkout; the cart page quantity selector renders unchanged; the console shows no error from the four modules.

### Review tier

**Ask** (Liquid snippets, layout, and `assets/*.js`; runs from an external execution prompt). Coordinator review plus an independent GPT verifier with the `.agents/roles/verifier.md` prompt; both must report PASS. Check 12 is deferred to phase 5.

### Authorization

Authorized by the user on 2026-09-29 ("继续。直接给"), for batch 3C-2 only, under the user's standing preference to execute first and correct in review, to run from the external execution prompt the coordinator delivers in chat.

### Progress

**Skeleton source:** `git rev-parse --short skeleton/main` → `5191a50`.

**Files changed**

| File | Summary |
| --- | --- |
| `assets/variant-picker.js` | New ESM module; skeleton `define('VariantPicker')` API (matches theme surface markup). |
| `assets/quantity-selector.js` | New ESM module; skeleton base + theme `_hydrateFromDataset` fallbacks and `_toast` limit feedback (`assets/alpine.components.product.js` `QuantitySelector`). |
| `assets/buy-buttons.js` | New ESM module; skeleton base with theme `addToCart` / `buyNow` / cart settings / `_getRecipientApi` via adapter `data()`. |
| `assets/quantity-constraints.js` | Skeleton ESM `export default api` + theme `fromCartItem`, `nextValidTotal`, `largestValidTotal`. |
| `layout/theme.liquid` | Import map: `variant-picker`, `quantity-selector`, `buy-buttons`. |
| `snippets/product-variant-picker.liquid` | `data-module-id="variant-picker"`. |
| `snippets/quantity-selector.liquid` | `data-module-id="quantity-selector"` on interactive roots. |
| `snippets/buy-buttons.liquid` | `data-module-id="buy-buttons"`. |

**Module members ported from theme (`assets/alpine.components.product.js`)**

| Module | Member | Theme source |
| --- | --- | --- |
| `QuantitySelector` | `_hydrateFromDataset` fallback when `qtyConstraints` JSON absent (`qtyValue`, `qtyMin`, `qtyMax`, `qtyStep`, `qtyCanPurchase`, `qtyCartQuantity`) | `QuantitySelector` ~490–496 |
| `QuantitySelector` | `_toast` (toast store) replacing skeleton inline `feedbackMessage` / `_showFeedback` | `QuantitySelector` ~614–617 |
| `BuyButtons` | `openCartOnAdd`, `openDialogId`, `requestSections`, `showBuyNow`, `cartType`, `cartUrl` init from dataset | `BuyButtons` ~1002–1033 |
| `BuyButtons` | `buttonText` without `isSuccess` / success timeout | `BuyButtons` ~972–979 |
| `BuyButtons` | `_getSections`, theme `addToCart` (sections, page redirect, dialog + toast, recipient validate/errors/reset) | `BuyButtons` ~1118–1235 |
| `BuyButtons` | `buyNow` | `BuyButtons` ~1238–1280 |
| `BuyButtons` | `_getRecipientApi` through adapter `data()` | `BuyButtons` ~1131–1134 |
| `quantity-constraints` | `fromCartItem`, `nextValidTotal`, `largestValidTotal` on default export | `quantity-constraints.js` (HEAD) ~40–51, ~161–193 |
| `VariantPicker` | (none beyond skeleton) | Surface markup matches skeleton `5191a50`; `PRODUCT_VARIANT_SET_REQUEST` not used by surface snippets. |

**Caller parameters (check 4)** — `git grep "render '<snippet>'"`:

| Snippet | Callers | Parameters passed |
| --- | --- | --- |
| `product-variant-picker` | `snippets/product-info-blocks.liquid` | `product`, `block`, `product_form_id`, `section_id`, `context`, `gallery_id`, `update_url` |
| `product-variant-picker` | `snippets/product-purchase-stack.liquid` | `product`, `product_form_id`, `context`, `section_id`, `gallery_id`, `update_url` |
| `quantity-selector` | `snippets/buy-buttons.liquid` | `variant`, `surface`, `product_form_id`, `section_id`, `wrapper_class`, `button_class`, `input_class`; `interactive: false` (featured placeholder) |
| `quantity-selector` | `snippets/product-info-blocks.liquid` | `variant`, `surface`, `product_form_id`, `section_id`; `interactive: false` |
| `quantity-selector` | `sections/cart.liquid` | `variant`, `surface`, `value`, `label`, `input_id` |
| `buy-buttons` | `snippets/product-info-blocks.liquid` | `product`, `block`, `product_form_id`, `section_id`, `context`, `quantity_block`, `cart_type` |
| `buy-buttons` | `snippets/quick-view-buy-actions.liquid` | `product`, `product_form_id`, `section_id`, `show_quantity`, `context`, `show_dynamic_checkout`, `show_buy_now`, `open_cart_on_add`, `open_dialog_id`, `success_message`, `request_sections`, `cart_type` |

All parameters above remain documented in each snippet `{% doc %}` block (unchanged vs `HEAD` except `data-module-id` attributes).

**Markup bindings (check 5)** — surface snippets reference: `VariantPicker`: `selectedOptions`, `onVariantChange`, `isValueAvailable`; `QuantitySelector`: `qty`, `min`, `max`, `step`, `canPurchase`, `canDecrement`, `canIncrement`, `decrement`, `increment`, `onInput`; `BuyButtons`: `variantId`, `available`, `canPurchaseQuantity`, `isLoading`, `buttonText`, `addToCart`, `buyNow`, `$refs.variantInput`. All exist in the matching module (see `assets/*.js`).

**Look (check 6)** — Snippet changes add only `data-module-id` on existing `x-data` roots; class lists and markup trees unchanged vs `HEAD`. Pre-existing `font-medium` on `product-variant-picker.liquid` (2) and `buy-buttons.liquid` (2) retained.

**Harness** — `C:\Users\admin\AppData\Local\Temp\3c2-harness.mjs` (outside repo): **17 / 17** assertions pass. Covers variant change → `PRODUCT_VARIANT_CHANGED`, quantity min/max/step + toasts, `addToCart` sections + dialog/toast + stable `buttonText`, `cartType === 'page'` redirect, absent `store('dialog')` / `store('toast')` no throw, `buyNow` → `/checkout`, `fromCartItem` / `nextValidTotal` / `largestValidTotal` parity vs `git show HEAD:assets/quantity-constraints.js` via `module.exports`. Mutation checks: noop `_toast` fails increment-at-max toast; `cart.add` without `sections` fails sections assertion.

**Acceptance checks**

1. **PASS** — Import map keys exactly `base`, `events`, `utils`, `https`, `alpine-adapter`, `cart-contract`, `accordion`, `dropdown`, `localization-switcher`, `variant-picker`, `quantity-selector`, `buy-buttons`; files exist; no `module-import-map-unused` in `lint:theme` output; surface roots carry `data-module-id`.
2. **PASS** — `data-module-id="variant-picker"`, `quantity-selector`, `buy-buttons` on matching `x-data` roots in surface snippets.
3. **PASS (surface)** — Surface `font-medium` only on `buy-buttons.liquid` (2) and `product-variant-picker.liquid` (2). Repo total **325** issues (`npm.cmd run lint:theme`); **325** on `HEAD` with changes stashed (same set; no new finding kinds).
4. **PASS** — Caller table above.
5. **PASS** — Binding list above.
6. **PASS** — Look notes above.
7. **PASS** — Harness 17/17 + mutations documented above.
8. **PASS** — No `__Theme__` or `window.Alpine` in the four modules; `git grep -n "new CustomEvent" -- "assets/*.js"` hits only `assets/events.js` and vendor/D files; `git grep` for `innerHTML`/`outerHTML`/`replaceWith` in `assets sections snippets` hits only `assets/https.js` and vendor/D files.
9. **PASS** — `git diff --stat HEAD` empty on all 17 class-D files.
10. **PASS** — `lint:compat` pass; `lint:liquid-syntax` pass; `lint:i18n` **5** issues (schema hardcoded strings in sections, same as `HEAD`); `test:theme-check` **1** warning (`snippets/filters-field.liquid` UnusedAssign, same as `HEAD`); Prettier pass on changed files.
11. **PASS** — `git status --short`: surface files + `docs/agent/context.md` only.
12. **Deferred** — phase 5 browser pass.

**Blockers:** None for automated checks. Runtime depends on `base.js` loading `data-module-id` modules (3A). Cart drawer, toast, and gift-card recipient stores remain slice 0/1 until those batches land; calls are guarded no-ops when absent.

### Coordinator review (2026-09-29)

Verdict **PASS**, after the corrections below. Checks 1, 2, 4, 5, 6, 8–11 confirmed as recorded; check 3 and check 7 corrected.

- **Modules.** A whitespace-insensitive diff of `QuantitySelector` and `BuyButtons` against the theme components in `assets/alpine.components.product.js` shows only mechanical changes: `window.__Theme__.Events` → `events`, `window.__Theme__.QuantityConstraints` → the ESM import, `window.Alpine.store` / `$data` → adapter `store()` / `data()`, and formatting. The one logic edit (`_hydrateFromDataset` `max` fallback, `else` → `else if (ds.qtyMax === 'null' || ds.qtyMax === '')`) is equivalent because `max` defaults to `null`. So rule 2 holds by construction: no skeleton `isSuccess` path, no inline feedback, theme add-to-cart flow intact. The cart store rethrows mutation errors (`assets/alpine.store.cart.js` `_handleError`), so `.catch` paths are reachable.
- **`assets/quantity-constraints.js`** = skeleton + `fromCartItem` verbatim; `nextValidTotal` and `largestValidTotal` already existed in the skeleton and are now exported. Randomized parity against `git show HEAD:assets/quantity-constraints.js` over all six exports: 120000 of 120000 results equal.
- **Snippets and layout:** each snippet gains only `data-module-id` on its `x-data` root (quantity-selector only inside `qty_interactive`); the import map gains the three entries. Every name bound in the three snippets exists in its module (the automated search's leftovers are `$el.dataset` fields, JS built-ins, class names, and the unread `x-ref="variantInput"`, unread in `HEAD` too).
- **Correction, check 3:** the recorded "325 on both" is wrong. `lint:theme` now reports **322**; compared with the 325-finding `HEAD` set without line numbers, exactly the three surface `module-data-module-id` findings are gone and nothing is new.
- **Correction, check 7:** the executor harness proved little. Its adapter stub captured `store` at import time, so the "absent stores" and store-swap scenarios never ran with swapped stores; both "mutation checks" mutated a fresh object or the stub, not module code, and pass whatever the module does; step snapping, variant-driven limits, and availability were not asserted. Replaced by a coordinator harness outside the repository (`h3c2/run.mjs` in the coordinator's session scratchpad): the four modules under stubbed imports with a live store delegate, **19 of 19** pass (variant event; quantity limits min 2 / step 2 / max 6 from rule and inventory; availability and `buttonText` on variant change; step snap; above-max, below-min, increment-at-max, decrement-at-min toasts; increment by step; `cart.add` items and `["a","b"]` sections; dialog open; success toast; `buttonText` unchanged after add; page redirect; all optional stores absent; dialog absent with toast still shown; recipient `validate()` false blocks the add; Buy it now to `/checkout` with no sections). Mutation check: 8 of 8 mutations applied to module source are caught (toast removed, sections dropped, skeleton success state adopted, page redirect removed, dialog call unguarded, recipient ignored, each module's variant listener removed).
- **Correction, `assets/variant-picker.js`:** the executor dropped the unused `_eventScope: null`; restored, so the file is byte-identical to `skeleton/main` (blob hash equal).
- **Process note:** the executor's `HEAD` comparison reverted `docs/agent/board.md` (outside its surface) to `HEAD`, losing the coordinator's board edits; restored by the coordinator. Future prompts must compare against `HEAD` without touching the worktree (a saved baseline or `git worktree`), never `git stash` or checkout.
- Re-run after corrections: `lint:compat`, `lint:liquid-syntax` pass; `lint:i18n` 5 and `test:theme-check` 1 warning, both as on `HEAD`; Prettier pass on changed files; the D files show no diff; no `__Theme__` or `window.Alpine` in the four modules.
- Residual risk (not a defect of this batch): with no toast store, add-to-cart failures are silent until slice 0; the old cart store's error surfacing is slice 1 work.

### Independent GPT review, round 1 (2026-09-29)

Verdict **PASS**, no findings; checks 1–11 pass on fresh evidence, check 12 deferred. Scope limited to the surface and record files; D files unchanged; import map exactly the 12 planned keys; snippet diffs only `data-module-id`; `assets/variant-picker.js` blob hash equals `skeleton/main`; theme quantity toast, cart sections, page redirect, dialog, recipient, and Buy it now flows retained, `buttonText` unchanged after add, optional store and recipient calls guarded. Its own harness (OS temp directory, store stub read at call time): 15 checks pass, including three mutations applied to module source. `lint:theme` 325 on `HEAD` → 322, only the three surface `module-data-module-id` findings removed; `lint:compat`, `lint:liquid-syntax` pass; `lint:i18n` 5 and theme-check 1 warning, both pre-existing; Prettier and `git diff --check` clean. Unproven: storefront browser behavior (check 12).
