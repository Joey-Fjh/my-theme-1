# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-29.

## Plan RR1-E: audit code fixes

**Status:** implemented (coordinator, 2026-10-29). Ask review 1: FAIL on record accuracy only (no code defect), record corrected. Correction review: **PASS** (external, 2026-10-29). Checks 1 to 4 and 6 met; check 2 residue is two pre-existing test fixtures, not consumers. Check 5: the 1024 `collection-all` nav-link entry is accepted residue under option a (user proceeded without objecting, 2026-10-29): pre-existing, outside the diff, off the 40px grid; the full sweep for the page reports 0 new; the baseline is unchanged. Check 7 met: the user checked select and reorder in the Theme Editor, and the reveal content shows (2026-10-29). **Batch complete.**

**Execution log (2026-10-29).**
- **J1 case:** forwarding scopes the event. `forwardThemeEditorEvent` emits a non-bubbling event only to module roots that are inside, equal to, or the closest ancestor of the section container. All 5 `motionRevealSection` roots carry `data-module-id="motion-reveal"` (`git grep`). So `_matchesSection` was removed, and both subscriptions now use `ThemeEvents.events.SHOPIFY_SECTION_SELECT` / `_REORDER` on `this.$el`. `_cleanupEditor` and the scroll flush are unchanged.
- **S1 choices:**
  - `--font-pagination-ratio` stays in `css-variables.liquid` as `calc(13 / <mobile body size>)`, the same computed value.
  - The radius is `border-radius: 4px` in the two rules. Before, `var(--pagination-radius)` = 4px overrode an earlier `0.25rem`; that dead `0.25rem` is gone.
  - The inline `style` (`--pagination-font-size`, which had no reader, and `--pagination-radius`) is removed.
  - The rendered classes stay `--hover-default` and `--current--default`. The seven `minimal` / `outline` rules are removed.
  - In `tailwind.components.css`, the skeleton is replaced by an owner comment that lists the real callers. `build:tw` leaves `assets/tailwind.output.css` unchanged (comments are stripped).
- **Motion:** no motion change. The pagination transitions are untouched, so `review-animations` was not triggered.
- **Validators**, all exit 0:
  - `lint:theme` passed (3 pre-existing `dead-setting-unprovable` info lines).
  - `lint:compat` and `scan:compat` passed (68 stylesheet blocks).
  - `lint:i18n` passed, including unused keys.
  - `lint:liquid-syntax` passed.
  - `test:theme-check`: 158 files, no offenses.
  - `npx prettier --check` on the 4 changed files passed.
- **Greps:** `settings.pagination_` and `shopify:section:` in `motion-reveal.js` return nothing outside `docs/agent/context.md`. The variant class names have no storefront consumer. `pagination__button--outline` still appears in two fixtures in `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`; they are pre-existing lint-test inputs, not consumers (reviewer, 2026-10-29).
- **`test:layout`**, with `shopify:dev` running:
  - `--widths 390,768,1024,1440`: 1 new issue, `collection-all` `page-margin` at 1024 on `a.collection__nav-link` (nth 5). This is the toolbar nav-link scroller, kept by decision (user, 2026-10-21; the baseline holds it at 1320, 1920 and 2360). The batch does not touch it: the only toolbar mention in the diff is in `tailwind.components.css`, where only a comment changed and the built CSS is identical. 1024 is off the 40px sweep grid, so the baseline never sees it.
  - `--page collection-all` over the full grid (57 widths): 0 new issues, the same 3 baseline entries.
  - The baseline is unchanged.
- **Ask review 1** (external, 2026-10-29): FAIL on the record only. It confirmed J1 (section isolation holds, cleanup intact) and S1 (same class sets). Check 6 measured on `/collections/all?page=1` and page 3: font 13.0306px at 390 and 14.8571px at 1440, radius 4px, matching the HEAD formula. Corrected here: this status, the grep claim, and the caller count (six → five). Reviewer note: its `scan:compat` run invoked `build:tw`, and the generated CSS stayed unchanged.
- **Correction review** (external, 2026-10-29): PASS, no findings.
- **Pre-commit:** `build:tw` re-run; `assets/tailwind.output.css` unchanged.

**Outcome.** The two code defects from the RR1-C audit are gone, and storefront output at default settings is unchanged:

- **J1.** `assets/motion-reveal.js` follows the runtime contract and subscribes to forwarded Theme Editor events on its own root.
- **S1.** `snippets/pagination.liquid` and `snippets/css-variables.liquid` no longer read the three settings that `config/settings_schema.json` never defined.

**Decided (user, 2026-10-29).** Option A of the RR1-C findings topic. Fixing S1 means removing the reads, not adding the settings: adding them would be a new feature, which needs its own decision.

**Evidence** (coordinator, `git grep`, 2026-10-29):

- J1. `motion-reveal.js` `init` (the `window.Shopify?.designMode` block) calls `ThemeEvents.on('shopify:section:select' | 'shopify:section:reorder', …, { target: document })` and filters with `_matchesSection(e, el)`. `docs/references/architecture/javascript-runtime.md` (Module Lifecycle) says the core listens on the platform names and components subscribe only to the forwarded names on their own root. `base.js` `setupThemeEditorForwarding` forwards `SHOPIFY_SECTION_SELECT` / `_REORDER` to `[data-module-id]` roots inside the affected section. Every `motion-reveal` root sits inside a section (`snippets/section-frame.liquid`, `sections/collection.liquid`, `sections/blog.liquid`, `snippets/product-recommendations-section.liquid`, `snippets/search-results-tabs.liquid`). The pattern to copy is `slides-show.js` and `ritual-steps.js`: `ThemeEvents.events.*` with `{ target: this._root }`.
- S1. `pagination.liquid` assigns `settings.pagination_style | default: 'default'`, `pagination_font_size | default: 13` and `pagination_border_radius | default: 4`. It writes `--pagination-font-size` and `--pagination-radius` inline, and branches into `minimal` and `outline` class variants. Its `{% doc %}` says the settings live in `settings_schema.json`, which they never did (`git log -S`). `css-variables.liquid` sets `--font-pagination-ratio: calc({{ settings.pagination_font_size | default: 13 }} / {{ theme_body_font_size_mobile }})`, which the pagination `{% stylesheet %}` reads for its font sizes. `tailwind/tailwind.components.css` holds an empty "Pagination" skeleton: one rule and comment headers, with a consumer list that does not match `git grep "render 'pagination'"`. Five callers render the snippet with `paginate_obj` only (plus the example in its `{% doc %}`).

**Implementation surface.**

- `assets/motion-reveal.js` (the Theme Editor block only).
- `snippets/pagination.liquid` (Liquid head, `{% doc %}`, class branches, `{% stylesheet %}`).
- `snippets/css-variables.liquid` (the `--font-pagination-ratio` line only).
- `tailwind/tailwind.components.css` (the Pagination block only) and the regenerated `assets/tailwind.output.css`.

**Method.**

1. **J1.** Replace the two `document` subscriptions with `ThemeEvents.events.SHOPIFY_SECTION_SELECT` and `SHOPIFY_SECTION_REORDER` on `{ target: this.$el }`. Drop the `_matchesSection` filter only if forwarding already scopes the event to this root; keep it if a root can receive another section's event. Read `forwardThemeEditorEvent` in `base.js` first and record which case applies. Keep `_cleanupEditor` and the scroll flush as they are. If `_matchesSection` loses its last caller, remove it.
2. **S1.**
   - Remove the three `settings.pagination_*` reads and the `minimal` / `outline` branches with their CSS. Keep the `default` output: the same classes on the rendered elements.
   - Keep the computed values: font ratio 13 over the mobile body size, and radius 4px. Write them as constants in the snippet's own stylesheet or inline style (implementer's choice, recorded), with no `settings.` read. Moving `--font-pagination-ratio` out of `css-variables.liquid` is allowed if the computed font size stays the same.
   - Update the `{% doc %}`.
   - In `tailwind.components.css`, remove the empty comment skeleton and keep `.pagination { list-style: none; }` under a correct owner comment. Then run `build:tw`.
3. Review the CSS with `review-animations` only if a transition changes. None is expected; record "no motion change".

**Review tier:** Ask (changes `assets/*.js` and Liquid markup; deletes classes).

**Estimate:** about 45 minutes, plus one Ask review and the user's Theme Editor check.

**Checkpoint:** one stop, after the validators pass. Report the diff, the validator output, and which J1 case applies.

**Bar:** must-fix:
- No `settings.pagination_` read left anywhere.
- Pagination renders the same at default settings on collection, blog and search: same classes, font size and radius as computed values.
- `motion-reveal.js` has no platform `shopify:` event name.
- No new `test:layout` issue.

Accepted residue: S2 (`reveal_behavior` in `settings_data.json`) stays as it is. Judged on the default settings in `config/settings_data.json`.

**Acceptance checks.**

1. `git grep -n "settings.pagination_"` returns nothing; `git grep -n "shopify:section:" -- assets/motion-reveal.js` returns nothing.
2. `git grep -n "pagination__button--outline\|--hover-minimal\|--hover-outline\|current--minimal\|current--outline"` returns nothing.
3. `npm.cmd run lint:theme`, `npm.cmd run lint:compat`, `npm.cmd run scan:compat`, `npm.cmd run lint:i18n` and `npm.cmd run test:theme-check` pass.
4. After `npm.cmd run build:tw`, `git diff -- assets/tailwind.output.css` is staged with the batch or empty.
5. `npm.cmd run test:layout` at 390, 768, 1024 and 1440 with `shopify:dev` running reports 0 new issues.
6. Verifier, against the dev server: computed `font-size` and `border-radius` of `.pagination__page` on `/collections/all?page=1` (or any paginated page) equal the values before the change.
7. User, in the Theme Editor: selecting and reordering a section with reveal motion still shows its content (no hidden reveal targets).
