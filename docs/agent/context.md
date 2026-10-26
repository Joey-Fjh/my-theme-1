# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-26.

## Plan HP1: home review risks (backlog group 4, part A)

**Outcome.** The home page's review-risk items from backlog group 4 are fixed: dimmed text passes contrast, the `scroll-categories` row switcher works on touch at its two-column width, sticky content clears the header, and a configured `promo-bannder` link is keyboard reachable. Tablet crowding and mobile rails (group 4 items needing screenshots), the `impeccable` narrative items and design-fidelity details are out of scope.

**Decided (user, 2026-10-26).** Order A (review risks) before B (design answer) and C (fidelity); A items 1 to 3 and 6 in this batch; external execution. Touch behaviour for item 2: option A, first tap selects, second tap opens (user, 2026-10-26).

**Evidence (coordinator, 2026-10-26).**
1. Contrast. `sections/ritual-steps.liquid` dims inactive steps with `.ritual-steps--enhanced .ritual-steps__step-text:not(.is-active) { opacity: 0.3 }` (text, heading, `rte`, badge; 1.5 to 1.7:1 in the L1 classification). `snippets/product-variant-picker.liquid` dims unavailable options with `.is-unavailable { opacity: 0.45 }` plus `line-through` (4 `color-contrast` nodes on home `featured-product`, L1 review). `sections/scroll-categories.liquid` dims inactive rows to `opacity: 0.3` (`docs/design/home/hover-list/notes.md`), not yet measured.
2. Touch. `sections/scroll-categories.liquid` switches the active row on `@mouseenter` and `@focusin` only; on a touch device at the two-column width (1024 and up, iPad landscape) a tap on a row link navigates at once, so the other rows' detail panels are never seen. The `collection-list` card hover is the decorative tilt (`design.md` rule 3 exception), not an action; it stays.
3. Sticky overlap. `sections/promo-bannder.liquid` panels are `position: sticky`; `sections/ritual-steps.liquid` uses a sticky grid; the header is fixed with hide and show on scroll. `tailwind/tailwind.utilities.css` has a sticky utility using `--sticky-viewport-top`.
4. `promo-bannder`'s optional link has never been tested with a link configured.

**Dependencies.** `npm.cmd run shopify:dev` running. Before measurements (contrast ratios, sticky positions) are taken before the first edit.

**Implementation surface.** `sections/ritual-steps.liquid`, `sections/scroll-categories.liquid`, `assets/scroll-categories.js` (only if Method 2 needs it), `snippets/product-variant-picker.liquid`, `sections/promo-bannder.liquid`, and only if the sticky offset belongs there `tailwind/tailwind.utilities.css` (then `npm.cmd run build:tw`). Temporary alternate templates `templates/index.<name>.json` for testing are allowed and must be deleted before handoff; no other template or settings file changes.

**Method.**
1. Contrast: replace `opacity` on dimmed text with an existing scheme colour token that passes 4.5:1 (normal text) or 3:1 (24px and up) on every colour scheme the home sections use by default, as L1 did; the active state stays full foreground; the `ritual-steps` badge keeps its chip but its inactive state passes too; unavailable variant options keep `line-through` so the state does not rely on colour alone. No new tokens or settings; if no existing token passes, stop and report.
2. Touch (`scroll-categories`, two-column layout only): on a device without hover (`(hover: none)`), the first tap on an inactive row makes it active instead of navigating, and a tap on the active row navigates; the panel's link always navigates. Pointer and keyboard behaviour stay as they are.
3. Sticky: sticky elements offset by the visible header height (existing `--sticky-viewport-top` or the header variables), so no content sits under the header while it is shown; when the header hides, a gap of at most the header height is accepted. If following the header's show and hide needs new JavaScript, stop and report.
4. `promo-bannder` link: test with a temporary template that configures the link; fix only if Tab does not reach it or focus is not visible.

**Review tier.** Ask (Liquid markup, possibly `assets/*.js`, external execution).

**Motion.** Contrast changes may touch transitions (`opacity` to `color`); `review-animations` runs on the motion diff before step 7 and its output is recorded here.

**Estimate:** 3 to 4 hours plus the Ask review.

**Checkpoint:** after Method 1 (report the chosen token and the ratios), before Methods 2 to 4; and whenever a fix needs a method not named above.

**Bar:** Must fix: an acceptance check failing; a new `test:layout` issue; a visible change to the active states or the pointer hover behaviour; a contrast fix that hard-codes a colour. Accepted residue: header-height gap while the header is hidden; group 4 items outside this plan. Judged on the default settings and default colour schemes.

**Acceptance checks.**
1. Desktop Lighthouse accessibility (Chrome DevTools MCP, home, 1440 and 390) reports no `color-contrast` node in `ritual-steps`, `scroll-categories` or the `featured-product` variant picker; ratios of the new colour against each default scheme background computed with a command and recorded.
2. Touch: with touch emulation at 1024 and 1366, the first tap on an inactive `scroll-categories` row shows its panel without navigating, the second navigates; at 1440 with a mouse, hover and click behave as before; keyboard Tab and Enter behave as before.
3. Sticky: at 390, 1024 and 1440, scrolling through `promo-bannder` and `ritual-steps` (style A) with the header shown, the stuck element's top is at or below the header's bottom (measured rectangles recorded).
4. `promo-bannder` with a configured link: Tab reaches the link, focus is visible, Enter navigates.
5. Validators: `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`, `npm.cmd run lint:compat` (if a JS file changed), `npm.cmd run lint:i18n`, `npm.cmd run test:layout` at 390, 768, 1024 and 1440 with 0 new issues, `npx prettier --check` on changed files; `git status` shows no template or settings file.

**History.** Authorized by the user 2026-10-26 ("A"); executed from an external execution prompt, checkpoint accepted 2026-10-26, coordinator corrections after handoff below; review 1 FAIL, correction below.

**Execution summary (implementer).** No `tailwind/tailwind.utilities.css` change: sticky uses the existing `--sticky-viewport-top` from `assets/base.css`. The implementer's client blocked the temporary template (merchant guard); check 4 was closed by the coordinator (corrections below). The implementer replaced this plan header with a summary during execution; the coordinator restored the authorized plan text above after review 1.

### Execution log

| Task | Status |
| --- | --- |
| 1. Before measurements | Done 2026-10-26 |
| 2. Method 1 (contrast) | Done 2026-10-26 |
| 3. Method 2 (touch) | Done 2026-10-26 |
| 4. Method 3 (sticky) | Done 2026-10-26 |
| 5. Method 4 (promo link) | Done 2026-10-26 (degraded template test; see below) |
| 6. review-animations | Done 2026-10-26 |
| 7. Acceptance checks 1–5 | Done 2026-10-26 (check 4 partial) |

### Accepted residue (visual — pending user look, user 2026-10-26)

1. Inactive steps/rows now dim to scheme **muted/subtle colour** instead of **opacity 0.3**, so the active/inactive difference is **weaker** than before.
2. The **ritual-steps badge no longer dims** on inactive steps (chip stays full contrast while step copy dims).

### Method 1 — contrast (summary)

**Tokens:** `--color-subtle` (ritual-steps, scheme-2); `--color-muted` (scroll-categories inactive rows, scheme-4; unavailable variant options, scheme-2). Home scheme ratios: scheme-2 muted 5.89:1, subtle 4.71:1; scheme-4 muted 5.51:1, subtle 4.45:1 (`npm.cmd run scan:contrast`). `[mixed-element]` fix: no `.text-theme-text` / `.text-muted` in section stylesheets.

### Method 2 — touch (`scroll-categories`)

`assets/scroll-categories.js`: `onRowLinkClick` when `(min-width: 64rem)` and not `(hover: hover) and (pointer: fine)` — first tap on inactive row `preventDefault` + `setActive`; active row navigates. Panel links unchanged. Liquid: `@click="onRowLinkClick($event)"` on row links via `attributes` on `link` render.

**Runtime (Chrome DevTools MCP, home `/`):**

| Viewport | Media | First tap inactive row | Second tap |
| --- | --- | --- | --- |
| 1024×768, mobile+touch | `hover: none`, two-column | Panel index 1→2, no navigation | Navigates to `/collections/all` |
| 1366×768, mobile+touch | same | Row becomes active, no navigation | Navigates |
| 1440×900, desktop | `hover: hover` | `mouseenter` on row 2 → details active `["2"]` (hover unchanged) |

### Method 3 — sticky

`top: var(--sticky-viewport-top, 1rem)` on `promo-bannder` panels (≥64rem), `ritual-steps__media-frame`, and scroll-carousel `ritual-steps__stage`. Uses existing `html { --sticky-viewport-top: calc(announcement + header + gap) }` and `html:has(header.is-hidden)` reduction in `assets/base.css` — **no new JS** for header show/hide.

**Computed `top` vs header at scroll 0 (header visible):**

| Viewport | Header bottom (px) | Panel / frame `top` (computed) |
| --- | --- | --- |
| 1440×900 | 134.8 | 144.4px |
| 1024×768 | 129.4 | 139.6px |

390×844: sticky_media / promo sticky panels are **desktop layout only** (≥64rem); mobile ritual uses card rail — no desktop sticky targets to measure.

When header hides on scroll, `--sticky-viewport-top` drops to announcement + gap (accepted residue per plan).

### Method 4 — `promo-bannder` link

**Blocker:** Merchant guard rejected creating `templates/index.hp1-promo-test.json` (plan-authorized temp file). No template in repo; `git status` has no template files.

**Degraded check:** Injected markup matching section output on live home promo content — `a.focus()`, `outlineWidth: 2px`, `outlineStyle: solid`, `focusIsLink: true`. Markup path: `promo-bannder__link` + `link` snippet (`variant: underline`). **Full check 4** (Tab order + Enter navigation with real block settings) needs user/Theme Editor link on a card or approved temp template write.

### review-animations (motion diff)

Scope: Method 1 colour transitions (`opacity` → `color` on row/step); no new motion in Methods 2–4.

| Finding | Severity | Notes |
| --- | --- | --- |
| `ritual-steps` inactive step `color` transition 500ms | Advisory | Same duration as prior `opacity` transition; state indication on occasional scroll content. `prefers-reduced-motion` already clears transitions on step text. |
| `scroll-categories` row `color` 250ms | OK | Under 300ms; enter-style ease token. |
| Touch `onRowLinkClick` | OK | No animation added. |
| Sticky `top` var | OK | Not animated. |

**Verdict:** PASS for batch bar; 500ms step colour is pre-existing budget, not expanded scope.

### Acceptance checks

**1. Lighthouse colour-contrast (home `/`, DevTools MCP snapshot):** Desktop 1440 — a11y 97, **no** `color-contrast` audit failure. Mobile 390 — a11y 97, **no** `color-contrast` failure. Ratios: Method 1 table + `npm.cmd run scan:contrast`.

**2. Touch / pointer / keyboard:** Touch 1024 and 1366 — pass (above). Desktop 1440 hover — pass. Keyboard: row `focusin` still calls `setActiveFromEl` (unchanged); not re-run Enter sequence in MCP this session.

**3. Sticky vs header:** CSS offset aligns with header bottom at scroll 0 on 1440 and 1024 (table above). Live stick while header visible hard to capture (header hides quickly on scroll); offset contract is `--sticky-viewport-top`.

**4. Promo link Tab/focus/Enter:** Partial — focus ring verified on injected configured link; temp template and Enter navigation **unverified** (merchant guard).

**5. Validators**

| Command | Result |
| --- | --- |
| `npm.cmd run lint:theme` | Passed |
| `npm.cmd run test:theme-check` | 157 files, 0 offenses |
| `npm.cmd run lint:liquid-syntax` | Passed |
| `npm.cmd run scan:compat` | Passed (includes `build:tw`) |
| `npm.cmd run lint:compat` | Passed (JS + embedded) |
| `npm.cmd run lint:i18n` | Passed |
| `npm.cmd run test:layout -- --widths 390,768,1024,1440` | **New issues: 0** |
| `npx prettier --check` (changed files) | Passed after `prettier --write` on `sections/ritual-steps.liquid` |
| `git status --short` | No `templates/` or `config/settings_data.json` |

### Before measurements (pre-edit archive)

Dimmed opacity vs background: scheme-2 opacity 0.3 → 1.74:1, 0.45 → 2.39:1; scheme-4 opacity 0.3 → 1.71:1. Pre-fix Lighthouse: desktop 14 ritual-steps contrast nodes; mobile 4 variant-picker nodes. Pre-fix sticky: stuck `top: 0` with header hidden during section scroll.

### Coordinator corrections after handoff (2026-10-26)

1. **Touch, Android tap order.** With touch emulation at 1024, a tap that focuses the link before `click` (Android Chrome) let `@focusin` activate the row first, so `onRowLinkClick` saw an active row and the first tap navigated (script: `pointerdown`, `focus()`, `click()` gave `defaultPrevented: false`). Fix within Method 2: the row link also carries `@pointerdown="onRowLinkPointerDown($event)"`, which records whether the row was active at pointerdown; `onRowLinkClick` decides from that record and falls back to the current state when there was no pointerdown (keyboard). After: plain tap, tap with focus first, and keyboard (focus then Enter) give first-tap navigates false / false / true and second tap navigates true in all three (`assets/scroll-categories.js`, `sections/scroll-categories.liquid`).
2. **Check 4 closed.** Temporary `templates/index.hp1promo.json` (first card link `shopify://collections/all`, deleted after): at 1440 the link is in the tab order; Shift+Tab then Tab lands on it with `:focus-visible` and a 2px outline at 2px offset; Enter navigates to `/collections/all`.
3. **Generated CSS.** The handoff's `assets/tailwind.output.css` had re-added `surface-inverted` and `hover:opacity-90`, which no theme file uses (removed in G3); `npm.cmd run build:tw` now leaves the file identical to `HEAD`.
4. Re-run after the corrections: `lint:theme` passed; `test:theme-check` 157 files, no offenses; `lint:compat` (css, js, embedded) exit 0; `npx prettier --check` on the two touched files passed; `git status` shows no template or settings file.

**Progress.** Executed; Ask review owed (external session).

### Review 1 (external Verifier, 2026-10-26): FAIL

1. P2: `assets/scroll-categories.js` used the pointerdown record for any click; after pointerdown, focus and `pointercancel` on an inactive row, a real Enter was prevented and the next Enter navigated.
2. P2: the plan's Estimate, Checkpoint and Bar were missing (the header had been replaced during execution); `lint:records` did not catch it.

Proven by the verifier: Lighthouse accessibility 97 at 1440 and 390 with no `color-contrast` failure; ratios from live scheme values (scheme-2 muted 5.89, subtle 4.71; scheme-4 muted 5.51, subtle 4.45); taps select first at 1024 and 1366, also with focus before click; hover, Tab and Enter at 1440; sticky clearance about 10px at 1024 and 1440 with the header shown; no scope violation.

### Correction (coordinator, 2026-10-26)

1. `onRowLinkClick` uses the pointerdown record only when `event.detail > 0` (a pointer click); keyboard activation (`detail` 0) ignores it, and the record is cleared on every click.
2. The authorized plan text (Evidence, Dependencies, Method, Motion, Estimate, Checkpoint, Bar, Acceptance checks) is restored above; the implementer's execution sections stay below it.

### Review 2 (external Verifier, correction, 2026-10-26): PASS

Cancelled touch then a real Enter navigates; plain and focus-before-click taps select first and navigate on the second tap, also as a real two-tap sequence; hover, Tab and Enter at 1440 unchanged; the plan fields are restored; the other implementation files match review 1. Pending: the user's look at the two accepted visual notes.

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.

## Plan H10: record checks recognise plan headings

**Outcome.** `lint:records` and the prompt hook recognise a plan titled `## Plan ...` as well as `## Batch ...`, and the plan status line written `**Status.**` as well as `**Status:**`, so a plan missing Estimate, Checkpoint or Bar fails `lint:records` and the hook reports the plan under execution.

**Decided (user, 2026-10-26).** Option A (make the checks accept `## Plan`), after HP1 review 1 found the plan fields missing while `lint:records` passed.

**Evidence (coordinator, 2026-10-26).** `.agents/tools/harness/record-check.mjs` `checkContext` splits plans on `^## Batch ` and reads the status from `\*\*Status:\*\*`; `.agents/tools/harness/core.mjs` finds the plan heading with `^## Batch .+$`. Plans L1, F1, G3 and HP1 were titled `## Plan ...` with `**Status.**`, so none of them was checked and every prompt reported "no plan under execution".

**Implementation surface.** `.agents/tools/harness/record-check.mjs`, `.agents/tools/harness/core.mjs`, `.agents/tools/harness/harness.test.mjs`.

**Method.** Widen the two heading patterns to `^## (?:Batch|Plan) ` and the status pattern to `\*\*Status[:.]\*\*`; add tests: a `## Plan` heading missing a field fails, a complete one passes, a `**Status.**` line parks a plan as `**Status:**` does, and the hook names a `## Plan` heading. No other rule changes.

**Review tier.** Ask (validator wiring).

**Estimate:** 30 minutes plus the Ask review.

**Checkpoint:** after the validators, before the review.

**Bar:** Must fix: a failing or missing test above; any existing harness test changed in meaning. Accepted residue: none. Judged on the repository's current record files.

**Acceptance checks.**
1. `npm.cmd run test:harness` passes, including the new tests.
2. `npm.cmd run lint:records` on the current `docs/agent/context.md` checks both plans (HP1 and H10) and passes.
3. A scratch copy of `docs/agent/context.md` with HP1's `**Bar:**` line removed makes `record-check.mjs` fail with `needs **Bar:**` (run against a temporary root, not the repository file).
4. The prompt hook output names `Plan HP1` instead of "no plan under execution" (`.agents/tools/harness/core.mjs` through its test or a direct call).

**Status.** Executed and reviewed; waiting for the commit, then this plan is cleared.


**Validation (coordinator, 2026-10-26).**
1. `npm.cmd run test:harness`: 24 tests, 24 pass, 0 fail (two new tests: `plan headings and status lines also use the Plan and Status. forms`, four cases including a parked `**Status.**` plan beside an active one and two active plans failing; `prompt names a plan titled with Plan and its Status. line`).
2. `npm.cmd run lint:records` on the current file (HP1 parked, H10 active): passed.
3. Temporary root (the three record files copied into a scratch git repo, HP1's `**Bar:**` line removed): `record-check.mjs` exits 1 with `plan "HP1: home review risks (backlog group 4, part A)" needs **Bar:**`.
4. `.claude/claude-hook.mjs prompt` on the repository with a scratch state directory: `Plan in docs/agent/context.md:` / `## Plan HP1: ...` / HP1's status line, instead of "no plan under execution". The hook names the first plan only, as before.
5. `npx prettier --check` on the three harness files and `docs/agent/context.md`: passed.

**Review 1 (external Verifier, 2026-10-26): PASS.** 24 of 24 harness tests; missing-Bar probes fail for both plans; 16 of 16 parked-plan cases and 7 of 7 non-plan heading probes behave as intended; only the four regex changes in production code.
