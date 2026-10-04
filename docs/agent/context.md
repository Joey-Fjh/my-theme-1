# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-04.

## Batch 5-B2: fix the pre-existing dialog close labels and the initial variant selection

Status: executed and accepted; independent review PASS (2026-10-04). Authorized 2026-10-04 ("直接来"). Review tier **Ask** (Liquid markup and `assets/*.js`). Reviewer: independent reviewer the user names. Both defects are pre-existing on the live theme (browser pass parts 1 and 2, `docs/agent/board.md`, Evidence).

### Outcome and cause

- **Close labels.** Every dialog close button whose caller passes `close_label` is named `Translation missing: en.<label>` (quick view, collection navigation drawer, collection and search filters drawers). Cause: `snippets/ui-dialog.liquid` runs `close_label | default: 'accessibility.close_dialog' | t`, translating the already translated label. The four callers (`snippets/product-card.liquid`, `sections/collection.liquid` twice, `snippets/search-results-tabs.liquid`) pass translated strings, as the `@param` documents. Fix: translate only the default.
- **Initial variant.** Opening a product with `?variant=<id>` (or a store-selected variant) renders that variant on the server, then `VariantPicker._setInitialSelection` (`assets/variant-picker.js`) selects the first available variant instead, rewrites the URL to it, and the option labels follow the wrong selection (reproduced on dev 2026-10-04: `?variant=42693391974474` S/Black → selection XS/Brown, URL rewritten, Black marked sold out). Fix: the picker root passes `data-selected-variant-id="{{ product.selected_or_first_available_variant.id }}"` (`snippets/product-variant-picker.liquid`); `_setInitialSelection` uses that variant when it exists in `variants`, else the current fallback.

### Implementation surface

`snippets/ui-dialog.liquid`, `snippets/product-variant-picker.liquid`, `assets/variant-picker.js`.

### Acceptance checks

- C1: `git diff --stat` touches only the surface plus the record files.
- C2: `ui-dialog.liquid` applies `t` only to the default key; a passed `close_label` is output unchanged (escaped). No caller changes; `grep -rn "close_label:"` lists the four callers, each passing a `| t` result.
- C3: the picker root carries `data-selected-variant-id`; `_setInitialSelection` prefers it, falling back to first available, then the first variant. No other picker behaviour changes.
- C4: `lint:theme`, `test:theme-architecture`, `test:theme-check`, `lint:liquid-syntax`, `lint:compat`, `lint:i18n` pass; `npx prettier --check` on changed files.
- C5 (browser): the quick view and collection drawer close buttons are named `Close quick view` / `Close collections drawer`; `?variant=42693391974474` keeps S/Black selected, keeps the URL, and marks only Bronze, Gold, Red sold out.

### Progress

Executed 2026-10-04 by the coordinator.

| Check | Result |
| --- | --- |
| C1 | `git diff --stat`: `assets/variant-picker.js`, `snippets/product-variant-picker.liquid`, `snippets/ui-dialog.liquid`, `docs/agent/context.md` |
| C2 | `ui-dialog.liquid` keeps a passed `close_label` and translates only `accessibility.close_dialog`; callers unchanged (`sections/collection.liquid` ×2, `snippets/product-card.liquid`, `snippets/search-results-tabs.liquid`, each `assign … \| t`) |
| C3 | `data-selected-variant-id="{{ product.selected_or_first_available_variant.id }}"` on the picker root; `_setInitialSelection(selectedVariantId)` order: matching id, first available, first variant (local renamed `first` → `initial`) |
| C4 | `lint:theme` passed; `test:theme-architecture` 155 pass, 0 fail; `test:theme-check` 146 files, no offenses; `lint:liquid-syntax` passed; `lint:compat` passed; `lint:i18n` and unused-key lint passed; `npx prettier --check` on the changed files passed |
| C5 (coordinator, dev server, Chrome DevTools MCP, 1440×900) | `?variant=42693391974474`: attribute present, selection `{Size: S, Color: Black}`, URL kept, sold-out labels only Bronze, Gold, Red (before: XS/Brown, URL rewritten to `42693390663754`, Black sold out). `/collections/all`, every `button[aria-label]` including `<template>` content: no `Translation missing`; `Close collections drawer` and `Close quick view` present. The filters drawer's own button reads `Close` (`snippets/filters-drawer.liquid`, `accessibility.close`), a valid label outside this batch. Not run: live side by side, search filters drawer |

### Independent review (2026-10-04): PASS

No findings. C1–C5 re-run. All eight `ui-dialog` callers checked: four pass a translated `close_label`, four omit it and use their own translated button. The initial variant is proven on the product page (`?variant=` S/Black: price, buy buttons, quantity, hidden `id`, gallery slide to its image, URL kept), a sold-out `?variant=` (XS/Black stays selected, add button disabled "Sold out"), featured-product on `/` (URL not rewritten) and quick view (server id matches the checked radios). A missing or unknown id falls back to the first available variant as before. Unproven: live side by side; the `accessibility.close_dialog` default has no rendered consumer today.
