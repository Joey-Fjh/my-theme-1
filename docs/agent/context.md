# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-27.

## Plan PS1: product info load shift (backlog group 5)

**Outcome.** On the product page (and the home `featured-product`, which renders the same `buy-buttons` snippet) the product info blocks no longer move after first paint: the dynamic checkout area is present from the server render when the selected variant is available, and the pickup check adds height only when it has a real result.

**Decided (user, 2026-10-27).** Option A from board topic PS1, after reading Shopify's official sources:

- Performance best practices (https://shopify.dev/docs/storefronts/themes/best-practices/performance): critical content renders in Liquid and HTML, not JavaScript.
- Accelerated checkout (https://shopify.dev/docs/storefronts/themes/pricing-payments/accelerated-checkout): the `payment_button` container shows its own loading skeleton, 44px on product pages (`--shopify-accelerated-checkout-button-block-size`), so a visible container already holds its space.
- Pickup availability (https://shopify.dev/docs/storefronts/themes/delivery-fulfillment/pickup-availability): an empty container filled through the Section Rendering API, with output only when the variant has a pickup-enabled location; the official pattern has no visible loading state.

**Evidence (coordinator, Chrome DevTools, `shopify theme dev`, `/products/floral-white-top` at 1440, cache disabled, 2026-10-27).** About 2.4 s: `.shopify-payment-button-wrapper` 0 to 44px (rendered with `hidden` and the `hidden` class, cleared by Alpine `:hidden="!available || !canPurchaseQuantity"`), blocks below move 52px; same frame the pickup loading box (`x-show="isLoading"`, bordered, 39px) appears and leaves about 0.4 s later, blocks move back 39px. `layout-shift` entries 0.005, 0.0033, 0.0033 at 1440. About 1.6 s: `icon_with_text_group` 106 to 88px (likely the font swap; moves nothing above it; out of scope, note only).

**Implementation surface.**

- `snippets/buy-buttons.liquid`: the `.shopify-payment-button-wrapper` gets the `hidden` attribute and the `hidden` class from Liquid only when the selected variant is not available; the Alpine `:hidden` and `:class` bindings stay for later variant and quantity changes.
- `snippets/pickup-availability-inline.liquid`: the loading message keeps `role="status"` and `aria-live="polite"` but loses its visible box (screen-reader-only text, no border or padding), so no height appears while loading. The error and retry box and the content area stay as they are. The doc comment's description of the loading state follows.
- No change to `assets/buy-buttons.js` or `assets/pickup-availability.js`. If the fix turns out to need JS, stop and report (checkpoint).

**Review tier.** Ask (Liquid markup).

**Estimate:** 1 hour plus the Ask review.

**Checkpoint:** after the measurement in acceptance check 3, before the Ask review prompt; and whenever the fix needs a method not named above.

**Bar:** Must fix: a layout shift from the purchase block or the pickup area after first paint at 390 or 1440; the dynamic checkout button visible for an unavailable variant (initial render or after a variant change); the loading state no longer announced to screen readers; a new `test:layout` issue. Accepted residue: the font-swap height change of `icon_with_text_group`; a height change when pickup has a real result (official pattern). Judged on the default preset, `/products/floral-white-top` and one product with an unavailable variant if the store has one (else stated as unproven).

**Acceptance checks.**

1. Server HTML (`curl` of the product page): the wrapper carries no `hidden` attribute or class for an available initial variant; for an unavailable one it does.
2. The pickup loading element has `role="status"`, `aria-live="polite"`, screen-reader-only styling and no border or padding; the error box markup is unchanged.
3. `layout-shift` observer on `/products/floral-white-top` at 1440 (no throttling) and 390 (Slow 4G, CPU 4x), cache disabled: no entry whose sources include the purchase block or the blocks below it (record before and after).
4. Variant change to an unavailable variant hides the dynamic checkout area and back again shows it (if the store has such a variant).
5. `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:i18n` pass; `npm.cmd run test:layout -- --widths 390,768,1024,1440` reports 0 new issues.
6. The Ask review reports PASS; the user looks at the product page.

**History.** Authorized by the user 2026-10-27 ("可"); implemented by the coordinator in this session. No JS change was needed.

**Validation (coordinator, 2026-10-27).**
1. `snippets/buy-buttons.liquid` assigns `payment_button_hidden` (true unless `current_variant.available` and not `native_qty_blocked`) and outputs the wrapper's `hidden` attribute only then; the Alpine `:hidden` and `:class` bindings are unchanged (the original had the attribute only, no static class). Server HTML: `/products/floral-white-top` wrapper without `hidden`; sold-out `/products/casual-knitted-shirt5` with `hidden`.
2. `snippets/pickup-availability-inline.liquid`: the loading element is a persistent `sr-only` live region (`role="status"`, `aria-live="polite"`, `x-text="isLoading ? loadingText : ''"`), no `x-show`, border or padding; the error box and content area unchanged; doc comment updated. `.sr-only` is present in `assets/tailwind.output.css`.
3. `layout-shift` observer, cache disabled: 1440, no throttling: no entries (before: 0.005, 0.0033, 0.0033 from the product info blocks). 390, Slow 4G, CPU 4x: one entry 0.0005 from `header-navigation` (L1 header-group residue), none from the product info; at 390 the purchase block starts at 1050px, below the 844px viewport.
4. `/products/casual-knitted-shirt3`: initial XS / Brown wrapper visible 44px; XS / Black (sold out) `hidden`, 0px; back to XS / Brown visible 44px.
5. `lint:theme`, `test:theme-check` (157 files, no offenses), `lint:liquid-syntax`, `lint:i18n` passed; Prettier on both snippets passed; `test:layout -- --widths 390,768,1024,1440` 0 new issues.

**Ask review (separate session, 2026-10-27): PASS against the Bar.** Proven: scope and authorization; server HTML for available, sold-out and XS / Black; hydrated variant switching (0px and 44px); home `featured-product` wrapper 44px; persistent `sr-only` live region with zero padding and border, one loading message per distinct variant; no shift from checkout or pickup at 1440 and 390 throttled; the three Shopify sources say what the plan cites. All validators rerun, exit 0. Notes: (1) the coordinator's "1440, no entries" was not reproduced: fresh runs showed 0.001951 and 0.000068 from the accepted `icon_with_text_group` font swap (105.72 to 87.81px), checkout 44px and pickup 0px throughout; (2) one throttled trace showed a 0.515 whole product section shift that the next run did not reproduce, owner not established; (3) unproven: real screen-reader speech, live gift-card and quantity-blocked fixtures (Alpine `canPurchaseQuantity` defaults to true until its next-tick sync, as before this change), the historical before values.

**User look:** accepted 2026-10-27: no pickup box any more and no jump when reloading at the top; a jump remains when reloading partway down with the header shown or hidden (scroll restoration and the sticky header state, outside this surface; filed to `docs/agent/backlog.md` group 7).

**Status.** Executed, reviewed (PASS) and accepted; waiting for the commit.
