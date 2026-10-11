# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-11.

## 6-T5 Layout check precision

**Status:** accepted and authorized by the user 2026-10-11 (coordinator executes); executed; review round 1 FAIL corrected, round 2 PASS; awaiting user acceptance.

**Outcome:** the layout check stops reporting two classes of non-defects, so its baseline holds only real issues and the polish-pass rail candidates.

**Review tier:** Ask (validator code and configuration).

**Dependencies:** `npm.cmd run shopify:dev` running (port 9292), storefront password in `.env`.

### Items

1. **Screen-reader-only text.** `checkClippedText` in `.agents/tools/layout-check/checks.mjs` skips an element when it or an ancestor is a screen-reader-only box: border box at most 1×1px, `overflow` hidden or clip, and `clip-path` not `none` or `clip` not `auto` (the Tailwind v4 `sr-only` shape). Nothing else changes in the check.
2. **Password-locked Storefront API message.** One `exceptions` entry in `layout-check.config.json` for the exact runtime selector `console:[shopify-account] Menu "customer-account-main-menu" not found in Storefront API. Falling back to default menu items.` (check `runtime`), whose reason names the cause: the store is password-protected, so the component's Storefront API request returns 400 `Online Store channel is locked.`; the menu exists (user, 2026-10-11). Other runtime messages are unaffected.
3. **Baseline:** `npm.cmd run test:layout -- --prune-baseline` (shrink only).

### Implementation surface

`.agents/tools/layout-check/checks.mjs`, `.agents/tools/layout-check/layout-check.config.json`, `.agents/tools/layout-check/layout-check.test.mjs`, `.agents/tools/layout-check/fixtures/` (new fixtures), `.agents/tools/layout-check/layout-check.baseline.json` (prune only), and `.agents/tools/layout-check/run-rules.mjs` + `layout-check.mjs` (`isExcepted` moved to the pure module so it can be tested; extended during execution).

### Acceptance checks

1. Fixtures: text in a Tailwind-shaped `sr-only` element, and in a child of one, is not reported; text clipped in an ordinary `overflow: hidden` box is still reported; a 1×1px `overflow: hidden` box without `clip-path` / `clip` is still reported.
2. A runtime console message that differs from the excepted one by any character is still reported (unit test against `isExcepted` semantics: exact selector match).
3. `npm.cmd run test:layout-harness` passes.
4. Full `npm.cmd run test:layout`: 0 new issues. The prune removes only entries of the two classes: every removed entry is listed with its class, and each removed `clipped-text` selector is shown to be `sr-only` (or inside one) on the live page.
5. `npx prettier --check` on changed files passes.

### Progress

Executed by the coordinator, 2026-10-11.

- **Item 1:** `isScreenReaderOnlyBox` / `isInsideScreenReaderOnlyBox` in `checks.mjs`; `checkClippedText` skips an element inside such a box. Fixtures `clipped-text-sr-only-negative.html` (Tailwind `sr-only`, a child of one, a legacy `clip: rect()` box) and `clipped-text-tiny-box-positive.html` (1×1px, overflow hidden, no clip: still reported).
- **Item 2:** the config exception, exact selector. Writing its test exposed that `isExcepted` also matched any selector that starts with the excepted one plus a space (a CSS-selector prefix rule), so a longer console message would have been excepted too. `isExcepted` moved to `run-rules.mjs` (exported, pure) and now matches runtime selectors (`console:`, `pageerror:`, `http:`) exactly; CSS selectors keep the prefix rule. The existing `http:GET:self/...404` exception has no suffix, so it is unaffected. Test `6-T5 the locked-channel console exception matches that exact message only`.
- **Item 3:** full run with `--prune-baseline`: 0 new issues, baseline 63 → 29 (corrected to 32 after review round 1). Removed (34): `runtime` ×10, the locked-channel message, one per page; `clipped-text` ×21, each checked in the templates as `sr-only` or inside one: the cart note, country, province and zip labels; the search input label, `h1` and results-status `div` (`search-results-tabs.liquid`); the quantity labels; the newsletter `inline-submit-field` labels (about, blog, article); the `slides-show` `h1`; the `ritual-steps` mobile section heading (`sr-only` in its class list); the `routine-showcase` tab `aria` span; the variant picker swatch label's second `span`. Also removed, unrelated to this change: `page-margin` ×3 (`ritual-steps` mobile badge at 600 ×2, `featured-products` tab 2 at 760) were not observed in this run. All three are polish-pass rail and tab candidates and stay listed on the board; if they recur, they report as new and are handled as candidates.
- **Validation:** `test:layout-harness` 27 pass / 0 fail; prettier pass on `.agents/tools/layout-check/`.
- The Chrome DevTools MCP hung repeatedly during verification, so the `sr-only` evidence comes from the Liquid templates, not the live DOM.

**Review round 1 (external Verifier, 2026-10-11): FAIL**, two findings. Corrections by the coordinator:

1. **P2 visible text suppressed:** a static 1×1 `overflow: hidden` box with a legacy `clip` qualified, but `clip` has no effect on a static box, so an absolutely positioned child escaped it visibly (HEAD reported it). `isScreenReaderOnlyBox` now requires `position: absolute` or `fixed` (a positioned box also contains and clips its absolutely positioned children), and `isInsideScreenReaderOnlyBox` stops at a `position: fixed` element between the text and the box. Fixture `clipped-text-escaping-child-positive.html` (both shapes reported); test `6-T5 review: text escaping a static clip box or through a fixed child is still reported`.
2. **P2 prune exceeded check 4:** the three `page-margin` entries the prune removed (run-to-run variation, not this batch) are restored; the baseline is now the HEAD baseline minus exactly the 31 entries of the two classes (63 → 32), in HEAD order.

Accepted limit (verifier note): runtime selectors now match exactly, so an exception for `http:GET:self/<path>` no longer covers a synthetic `http:...<path> child` selector; real HTTP selectors carry no such suffix.

After the corrections: `test:layout-harness` 28 pass / 0 fail; full `test:layout` 0 new issues (179s); prettier pass.

**Review round 2 (external Verifier, 2026-10-11): PASS**, no findings: 15 visibility shapes (relative, fixed, sticky and transformed children, legacy `clip` and `clip-path`) suppress no text HEAD reports visibly; the 21 live `sr-only` selectors stay skipped; the baseline is HEAD minus exactly the 10 + 21 entries, order kept (63 → 32); 128 exception mutation probes pass. Unproven by design: every CSS shape and browser; the cause of the page-margin run-to-run variation.
