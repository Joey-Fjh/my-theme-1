# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-12.

## 6-R4 The remaining `mixed-element` to 0, then a strict check

**Status:** accepted and authorized by the user 2026-10-12 ("同意" to Decisions 1–5; Decision 5 amended the same day: keep `mixed-element` as a strict check instead of deleting it). Decisions 3 and 4 change the lint and are explicitly approved. Run from an external execution prompt on the main model.

**Outcome:** `mixed-element` 27 → 0 and its baseline entries gone, so any new mixed element fails `lint:theme`. Rendering stays the same below 48rem everywhere; at 48rem and above only the listed elements change (Decision 1).

**Review tier:** Ask (validator code, Liquid markup and stylesheets, rule text, external execution prompt).

### Decisions (user, 2026-10-12)

1. **Vocabulary conflicts, 16 elements** (inventory: `git show 9bf1b64:docs/agent/context.md`, rows with a vocabulary reason): move the core utilities into `:where(.own-class)` like 6-R3. The owner then beats `copy-*` / `title-*` / `btn` at every width. Today the core utility already wins below 48rem; at 48rem and up a `tablet:copy-*` / `tablet:title-*` variant comes later in the output and overrides it. Expected changes, with default settings (`--font-body-text-transform: none`, `--font-body-style` normal): `ritual-steps__badge` ×3 and `routine-showcase__side-label` uppercase at ≥48rem; `testimonial-featured__quote` italic at ≥48rem; `ritual-steps__product-title` (the one with `tablet:title-xs`) uppercase at ≥48rem. Every other element: no change.
2. **State variants, 2 elements** (`article-sidebar__link`, `collections-section__card`): `hover:` utilities become owner rules under the project's `can-hover` media query `(hover: hover) and (pointer: fine)`.
3. **Special cases:** `filters-field` option: a new fixed BEM class on the option (today the own class appears only when disabled) and `:where(.<class>:not(.hidden))` for `display: flex`, so Alpine's `hidden` still hides it. `product-gallery`: move (`h-full w-full min-w-0`; the only caller class is `featured-product__gallery h-full`, same value). `sr-only`: the lint exempts `sr-only` and `not-sr-only` from `mixed-element` (accessibility utilities; the `clip-path` move is rejected by embedded compat).
4. **False positives:** `featured-products.liquid` slider branch gets a BEM class and `w-full relative` move to it. The lint stops reading a Liquid string literal as a class token when it is a comparison operand (`== 'x'`, `!= 'x'`, `when 'x'`, `contains 'x'`), which clears the five `pagination.liquid` rows without editing pagination.
5. **Strict check:** at 0, the `mixed-element` baseline entries are removed; the check stays.

### Implementation surface

- `.agents/skills/check-theme-architecture/scripts/lib/stylesheet-ownership-lint.js` and `theme-architecture.test.js` (Decisions 3 and 4 only).
- `.agents/skills/check-theme-architecture/scripts/stylesheet-ownership-baseline.json` (shrink flag only).
- `.liquid` files of the 27 elements under `sections/` and `snippets/`: class attributes, `{% capture *class* %}` bodies and `{% stylesheet %}` blocks only.
- `assets/tailwind.output.css` via `npm.cmd run build:tw` only.
- `docs/references/style-system/css-architecture.md` (`mixed-element` row and extraction bullets: `sr-only` exemption, comparison literals, strict at 0; count line) and the `mixed-element` row of `.agents/skills/check-theme-architecture/SKILL.md` if it describes a ratchet.
- This file.

Forbidden: `tailwind/**`, `config/**`, `templates/**`, `sections/*-group.json`, `locales/**`, `assets/*.js`, `{% schema %}` / `{% javascript %}` blocks, other lints, the migration and layout baselines, renaming or removing an existing class, editing `pagination.liquid` or `product-variant-picker.liquid`.

### Acceptance checks

1. **Lint:** fixtures pass for: own class + `sr-only` is not mixed; own class + `{% if x == 'outline' %}` / `{% when 'outline' %}` literal is not mixed; own class + a literal that is not a comparison operand (`{% cycle 'flex', 'grid' %}`) still counts; own class + static text inside a branch (`{% if a %}flex{% endif %}`) still counts; own class + `flex` still mixed. `npm.cmd run test:theme-architecture` passes. `collectStylesheetOwnershipCounts` gives `mixed-element` 0 (command named); the baseline has no `mixed-element` entry; a fixture or a scratch run shows one new mixed element fails `lint:theme`. `stylesheet-font-size` stays 15.
2. **Moves:** every removed utility has its declarations in that file's stylesheet (script check, values from `assets/tailwind.output.css`, allowed media forms, `can-hover` for `hover:`); new classes are BEM names of the file's own block and unused elsewhere (`git grep`); no `:where()` class matches markup outside its owner file; no existing class renamed or removed; schema and javascript blocks unchanged versus HEAD (script); `git diff HEAD -- tailwind config templates locales "assets/*.js"` empty.
3. **Computed style, one serving pipeline:** before the first edit, capture every page in `.agents/tools/layout-check/layout-check.config.json` at 375, 768, 1024, 1280 and 1440 from local `npm.cmd run shopify:dev`, twice; after the change, once, same server. Noise is excluded per (slot, element path, property), never per property name. The first slot of a run can land on `/`: check each saved slot's URL. Report every difference; the only accepted ones are Decision 1's list at ≥48rem and the `can-hover` change (none expected under headless Chrome's fine pointer). Pages the config does not cover (password) are listed as unproven. Scripts and snapshots outside the repo: `D:/project/shopify_project/6-r4-evidence/`, deleted at batch close.
4. **Validators:** `npm.cmd run lint:theme`, `test:theme-check`, `lint:liquid-syntax`, `scan:compat`, `lint:doc-paths`, `npx prettier --check` on changed files; `npm.cmd run test:layout` 0 new against the 42-entry baseline (not edited).
5. **User look:** the Decision 1 elements at ≥48rem.

### 6-R4: executed

**Status:** implemented; not accepted (Ask review and user look remain).

**Inventory (start):** `node -e "const b=require('./.agents/skills/check-theme-architecture/scripts/stylesheet-ownership-baseline.json'); console.log(b['mixed-element'])"` → 15 files, 27 elements (sum of per-file counts). Re-derived at 0 with `node -e "const {collectStylesheetOwnershipCounts}=require('./.agents/skills/check-theme-architecture/scripts/lib/stylesheet-ownership-lint'); const c=collectStylesheetOwnershipCounts('.'); console.log(c['mixed-element'])"` → `{}` (total **0**).

**Per-element results**

| file:line | own class | action |
| --- | --- | --- |
| sections/article.liquid:78 | `article-sidebar__link` | Core utilities → `:where(.article-sidebar__link)`; hover → `@media (hover: hover) and (pointer: fine)`; branch colours → `article-sidebar__link--current` / `--other` (replaces `text-muted` / `text-subtle` / `underline` utilities in markup). |
| sections/collections.liquid:59 | `collections-section__card` | `block`, `overflow-hidden`, `bg-theme-bg`, `max-tablet:shadow-md`, `hover:shadow-md` → `:where(.collections-section__card)` + width/hover media. |
| sections/password.liquid:57 | `password-section__submit` | `uppercase`, `tablet:min-w-40` → `:where(.password-section__submit)`. |
| sections/ritual-steps.liquid:190,343,505 | `ritual-steps__badge` | `uppercase` → `:where(.ritual-steps__badge)`. |
| sections/ritual-steps.liquid:217,509 | `ritual-steps__product-title` | `text-theme-text`, `uppercase` → `:where(.ritual-steps__product-title)`. |
| sections/routine-showcase.liquid:201 | `routine-showcase__mobile-badge` | `uppercase` → `:where(.routine-showcase__mobile-badge)`. |
| sections/routine-showcase.liquid:269 | `routine-showcase__heading` | `text-theme-text` → `:where(.routine-showcase__heading)`. |
| sections/routine-showcase.liquid:542 | `routine-showcase__side-label` | `uppercase`, `text-theme-text` → `:where(.routine-showcase__side-label)`. |
| sections/scroll-categories.liquid:68 | `scroll-categories__heading` | `flex`, `items-end`, `justify-between`, `gap-step-m`, `text-theme-text` → `:where(.scroll-categories__heading)`. |
| sections/testimonial-featured.liquid:67 | `testimonial-featured__heading` | `text-theme-text` → `:where(.testimonial-featured__heading)`. |
| sections/testimonial-featured.liquid:210 | `testimonial-featured__quote` | `text-theme-text`, `italic` → `:where(.testimonial-featured__quote)`. |
| sections/featured-products.liquid:78 | `featured-products__slider-shell` (new) | `w-full relative` when slider → `:where(.featured-products__slider-shell)`. |
| snippets/buy-buttons.liquid:470,479 | `buy-buttons__submit--placeholder` (new) | `pointer-events-none`, `relative`, `w-full`, `cursor-default` → `:where(.buy-buttons__submit--placeholder)`. |
| snippets/collection-card.liquid:108 | `collection-card__title` | `px-step-s`, `pt-step-s`, `pb-step-m`, `text-center`, `font-normal` → `:where(.collection-card__title)`. |
| snippets/filters-field.liquid:72 | `filters-field__option` (new on all options) | `flex`, `items-center`, `gap-step-xs` → `:where(.filters-field__option:not(.hidden))`; disabled keeps `filters-field__option--disabled`. |
| snippets/product-card-badge.liquid:55 | `product-card-shell__badge` | `font-normal`, `tracking-wide`, `uppercase` → `:where(.product-card-shell__badge)`. |
| snippets/product-gallery.liquid:76 | `product-gallery` | `h-full`, `w-full`, `min-w-0` → `:where(.product-gallery)`. |
| snippets/pagination.liquid (5 rows) | — | **Lint only:** comparison-operand string literals no longer count (`stylesheet-ownership-lint.js`); file not edited. |
| snippets/product-variant-picker.liquid:164 | `peer` + `sr-only` | **Lint only:** `sr-only` / `not-sr-only` exempt; file not edited. |

**Lint (Decisions 3–4):** `stylesheet-ownership-lint.js` — `ACCESSIBILITY_UTILITY_NAMES`; `stripComparisonLiteralsFromLiquidTag` in `staticClassTokens`. Fixture test `mixed-element lint: sr-only and comparison literals are not mixed; cycle and branch literals still count` in `theme-architecture.test.js`.

**Evidence (`D:/project/shopify_project/6-r4-evidence/`):** `computed-style.mjs`, `compare-per-cell.mjs`, `classify-differences.mjs`, `before-1/`, `before-2/`, `after/` (each: `manifest.json`, `slots/*.json`), `compare-summary.json`, `differences.jsonl`, `classification.json`, `REPORT.md`. Password page not captured.

**Computed-style summary:** see `REPORT.md`. Noise 35,605 cells (two before-runs). After diff 25,662 cells; 23,900 are head-`style` index or missing-path structural (corrected after review 1: 6,214 + 4,780 + 12,906) (dev `theme dev` stylesheet injection / DOM tree drift). Remaining include Decision 1 `text-transform: uppercase` on home ritual/routine/testimonial nodes at ≥1024 widths; `home__375` body nodes lack those uppercase diffs in `differences.jsonl`. 1,762 other value cells include `shopify-account` hydration and sub-pixel opacity (runtime).

**Validation**

1. **Lint:** `npm.cmd run test:theme-architecture` → **236** pass, **0** fail (includes sr-only/comparison fixtures and `mixed-element lint: new mixed region fails`). `node -e "…collectStylesheetOwnershipCounts…"` → `mixed-element` **0**, `stylesheet-font-size` **15**. `stylesheet-ownership-baseline.json` → `"mixed-element": {}`. `npm.cmd run lint:theme` → passed.
2. **Moves:** `git grep` — new classes only in owner files (see commands in implementer report). `git diff HEAD -- tailwind config templates locales "assets/*.js"` → empty.
3. **Layout:** `npm.cmd run test:layout` → **0** new issues.
4. **Other:** `npm.cmd run test:theme-check` → 151 files, no offenses. `npm.cmd run lint:liquid-syntax` → passed. `npm.cmd run scan:compat` → passed. `npm.cmd run lint:doc-paths` → passed. `npx prettier --check` on changed files → passed.
5. **User look:** not run (Joey).

**Blockers / unverified:** Ask-tier independent review not run. User look at Decision 1 ≥48rem. Password template computed-style unproven. Full interpretation of 1,762 non-structural diff cells (runtime vs regression) not fully classified by element class (paths are tag-only).


**Coordinator check of 6-R4 (2026-10-12):** the executor left 1,762 body value cells and the structural rows unclassified. Classified from `D:/project/shopify_project/6-r4-evidence/` (`differences.jsonl`, slot files), plus `after-2` (a fresh home run, all widths, current tree) and a Playwright probe by DOM path against local dev:
- **Decision 1, as expected:** `text-transform` none → uppercase (ritual-steps badges, routine-showcase labels) and `font-style` normal → italic (testimonial quote, home and page-about-view) at 768–1440; the width and height changes on those same `p` elements follow from the text change. Home 375: 0 differences (`after` and `after-2`).
- **Not in the plan's list, same mechanism:** `collection-card__title` (home, five cards) `font-weight` 500 → 400 at 768–1440. `font-normal` already won below 48rem; a `tablet:title-*` tier overrode it above. Now 400 at every width. `design.md` gives headings and labels 500, so this one moves away from the design; for the user.
- **Before-run artefact, home 1280 (872 cells, reproduced identically by `after-2`):** Swiper had not initialised in `before-1` at 768 and 1280 or in `before-2` at 1280 (3,898 elements and no Swiper notification `span`; 3,915 at the other widths). Both before-runs missed it at 1280, so per-cell noise could not exclude it. Every after slot is initialised. Not caused by this batch.
- **Runtime state:** product 1440, the pickup-availability loading notice (`x-show="isLoading"`, "Checking store pickup availability…") was visible in the before-runs and hidden after (probe); the containers above it shrink by its 39px. Blog tab `opacity` 1 → 0.986 at every width (fade timing; the element is a blog tab, corrected after review 1). `shopify-account` (blog 1280) font and size: the platform web component hydrating. Product 375 and other `body > div` pairs: injected sibling order.
- **Equivalent paint:** collections 375 card `box-shadow`: the four transparent zero Tailwind ring layers are gone, the visible `0 8px 24px rgba(0,0,0,.1)` layer is unchanged. Collection-all filter options 7–11 (`hidden`): `align-items` and gaps no longer apply while `display: none`; they apply again when shown (`:not(.hidden)`).
- **Structural:** `head > style` index shifts (dev injection) and the Swiper nodes above.
- Verdict: ready for independent review, with the `collection-card__title` weight change for the user's look.
- **Accepted by the user (2026-10-12):** the `collection-card__title` weight change (400 at every width); weights and sizes are tuned in the polish pass.

**Independent review 1 (2026-10-13): FAIL.** Rendering accounted for (all 1,762 value cells classified by the reviewer; title weight accepted). Defects: (1) comparison literals without spaces (`x=='outline'`) and later `when` values (`when 'nope', 'outline'`) still counted, and the fixtures lacked generated `.outline` / `.not-sr-only`, so they passed on the old lint too; (2) the baseline kept a `"mixed-element": {}` key; (3) two record wordings.

**Coordinator corrections after review 1 (2026-10-13):**
- `stripComparisonLiteralsFromLiquidTag`: `==` / `!=` / `contains` with optional spaces; a `when` tag drops all its literals.
- Strict in code: `compareWithBaseline` reads no `mixed-element` allowance and `toBaseline` never writes one; the key is removed from `stylesheet-ownership-baseline.json`.
- Fixtures: the output now generates `.grid`, `.outline`, `.sr-only`, `.not-sr-only`; added `widget outline` (1), `x=='outline'`, `'outline' != x`, `contains 'outline'`, `when 'nope', 'outline'`, `when 'nope' or 'outline'` (0 each); new test "strict, a baseline allowance is ignored". The two ratchet-mechanic tests now use `stylesheet-font-size` (still a ratchet) and assert `mixed-element` is never written.
- Discrimination check (scratch copy outside the repo): 12 literal / exemption cases (the fixture list then held 13; corrected after review 2) against the HEAD lint (pre-6-R4): 9 mismatches (every exemption case); against the new lint: 0.
- `npm.cmd run test:theme-architecture`: 237 pass, 0 fail.
- Record wording: structural total 23,900; the opacity element is a blog tab.
- Rule text: the SKILL.md `mixed-element` row and `css-architecture.md` (row and count line) now say strict with no baseline allowance read or written, instead of "ratchet".

**Independent review 2 (2026-10-13): FAIL.** Strictness and baseline proven. Defects: (1) a literal on the left of `contains`, and both literals of `'a'=='b'` / `'a'!='b'` / `'a'contains'b'`, still counted (the first regex replacement removed the operator before the second could see the left operand; 10 of the reviewer's 30 extended cases failed); (2) the rewritten shrink test lost its "a rising count never raises the allowance" step; (3) the fixture count in the record (13, not 12).

**Coordinator corrections after review 2 (2026-10-13):**
- `classLiteralsOfLiquidTag` replaces the regex replacements: each literal is judged against the original tag and dropped when the text right before or after it is a comparison operator (`==`, `!=`, `<>`, `<`, `>`, `<=`, `>=`, `contains`; spaces optional); a `when` tag drops all its literals.
- Fixtures: the list now holds 20 cases (count by `awk` over the test); added `'outline' contains x`, `'outline'contains'grid'`, `'outline'=='grid'`, `'outline'!='grid'`, `'outline' <> x`, `x >= 'outline'` (0 each) and `a == 'x' and 'outline'` (1, a bare literal is not a comparison operand).
- Shrink test: a step where the font-size count rises from 1 to 2 asserts the allowance stays 1, before the step where it falls to 0.
- Extended scratch set (outside the repo, 30 cases: 22 comparison forms, 3 `when` forms, 5 non-comparison literals): 0 mismatches.
- `npm.cmd run test:theme-architecture`: 237 pass, 0 fail. Prettier passes on both changed scripts. Note: `prettier --write` was run once on `theme-architecture.test.js` by mistake; `git diff -U0 HEAD` shows hunks only in the mixed-element and stylesheet-ownership tests.

**Independent review 3 (2026-10-13): PASS.** No findings: 30 + 74 extended literal cases, 20 fixtures (pre-6-R4 lint 15 mismatches, current 0), shrink test, counts (`mixed-element` 0, `stylesheet-font-size` 15), strictness, and the change surface since review 2 all proven. The user's look at the Decision 1 elements (acceptance check 5) goes to the consolidated browser pass (standing preference: no per-batch browser pass during migration).
