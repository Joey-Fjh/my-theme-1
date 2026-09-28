# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-09-28.

## Plan: phase 3 batch 3B — tokens and CSS shell

Status: **complete: coordinator review PASS, GPT review round 3 PASS, check 11 accepted by the user with the detailed pass deferred to phase 5.**

### Outcome

The token layer and the first-party CSS sources follow the skeleton (`5191a50`) structure and carry every skeleton rule and token that 3C's skeleton snippets and modules will need, while the storefront keeps its current look: every theme rule, token, and CSS variable that unmigrated markup still uses is carried over unchanged. Carried theme rules are debt that each phase 4 slice rewrites or removes; this batch does not restyle anything.

### Source

Skeleton commit `5191a50` on remote `skeleton`. Path list: `snippets/css-variables.liquid`, `tailwind/tailwind.input.css`, `tailwind/tailwind.elements.css`, `tailwind/tailwind.components.css`, `tailwind/tailwind.typography.css`, `tailwind/tailwind.utilities.css`, `tailwind/tailwind.animates.css`, `assets/base.css`, `assets/gift-card.css`.

### Implementation surface

- The nine source paths above.
- `assets/tailwind.output.css`, regenerated only with `npm.cmd run build:tw` (never hand-edited; Prettier-ignored).
- Record files `docs/agent/context.md`, `docs/agent/board.md`, and the coordinator's status edit to `docs/project.md`.

Not in the surface: `tailwind/tailwind.snippets.css` (theme-only, slice 5 debt), every `sections/`, `layout/`, and other `snippets/` file, `assets/*.js`, `config/`, locales, vendor files, and the validators (`.agents/`).

### Merge rules

1. **Base:** the skeleton file supplies the structure: layer declarations, section order, comments, and every skeleton rule and token.
2. **Carry-over:** every theme rule, token, custom property, and `@import` the skeleton file lacks is kept unchanged, in the same layer, grouped under a comment `/* Ceylune carry-over: rewritten or removed by its phase 4 slice */` per file.
3. **Same selector or token, different value:** keep the theme value (the look stays until the design rework) and list the conflict under Progress (file, selector or token, skeleton value, theme value) so 3C can settle shared primitives.
4. **Skeleton removals the theme still depends on:** the skeleton `@theme inline` resets Tailwind default namespaces (`--font-*`, `--text-*`, `--font-weight-*`, `--leading-*`, `--tracking-*`, `--color-*`, `--ease-*`, `--animate-*: initial`). Adopt a reset only when check 2 shows no Liquid-referenced class is lost by it; otherwise leave that namespace un-reset and list it as slice debt.
5. **Kept theme-specific structure:** the `snippets` layer in the layer order and the `@import './tailwind.snippets.css'`; the `@import '../assets/vendor-swiper.min.css' layer(base)` stays until 3C lands the `carousel-swiper.js` adapter.
6. **`snippets/css-variables.liquid`:** the theme file already outputs a superset of the skeleton variables; the result outputs every variable either version outputs, with the skeleton's structure and Liquid where they coincide.

### Dependencies

- Batch 3A committed (`2a3c331`).
- No open board decision: no setting ID is added, renamed, or removed.
- Deferred out of 3B: the theme-only validator exception list (board, Evidence, "Old CSS structure conventions"). It only matters once `lint:theme` approaches zero on migrated surfaces, so it moves to the first slice that needs it (recorded on the board).

### Acceptance checks

1. Build: `npm.cmd run build:tw` exits 0; `assets/tailwind.output.css` comes only from it.
2. No lost classes: build the `HEAD` sources to a scratch file outside the repository; extract class selectors from both outputs; every class selector missing from the new output is either not referenced by any `.liquid` file under `layout/`, `sections/`, `snippets/`, `templates/` (show the search) or listed with a reason under Progress. Report the counts: old, new, lost-and-referenced (target 0).
3. Skeleton coverage: every selector and every custom property declared in the nine skeleton source files at `5191a50` appears in the corresponding merged file (script or search output recorded).
4. Variables: every custom property name output by `git show HEAD:snippets/css-variables.liquid` and by the skeleton version appears in the new file.
5. `@theme inline`: every token defined by the `HEAD` or the skeleton `tailwind.input.css` is defined, except the namespace resets decided under rule 4 (listed).
6. Theme contracts: the counts of `data-motion-enabled`, `data-content-reveal-style`, `data-media-reveal-style`, `data-reveal-behavior`, `prefers-reduced-motion`, `.category-grid__item`, and `::-webkit-details-marker` / `summary` marker rules across `tailwind/` and `assets/base.css` are unchanged against `HEAD` (`docs/project.md`, Theme-Specific Contracts).
7. `tailwind/tailwind.snippets.css` unchanged: `git diff --exit-code HEAD -- tailwind/tailwind.snippets.css`.
8. `npm.cmd run lint:theme`: no finding absent on `HEAD` (compare as sets without line numbers; a finding that only moved lines is not new); total recorded against 331.
9. `npm.cmd run scan:compat` passes; `npm.cmd run lint:liquid-syntax` passes; `npm.cmd run test:theme-check` has no new error; `npm.cmd run lint:i18n` has no finding absent on `HEAD`; `npx prettier --check` passes on the nine source files.
10. Surface: `git status --short` lists only surface and record files.
11. Browser (user, `npm.cmd run shopify:dev`): home, one product page, one collection page, and the gift card page look the same as the current live theme at desktop and mobile widths, apart from the JavaScript features 3A already disabled.

### Review tier

**Ask** (`snippets/css-variables.liquid` is Liquid; runs from an external execution prompt). Coordinator review plus an independent GPT verifier with the `.agents/roles/verifier.md` prompt; both must report PASS. Check 11 is the user's browser pass.

### Authorization

Authorized by the user on 2026-09-28 ("继续。我觉得，先实际干下来，再调整，不然就无法推进了"), for batch 3B only, to run from the external execution prompt the coordinator delivered in chat.

### Progress

**Skeleton base:** `git rev-parse --short skeleton/main` → `5191a50`. HEAD baseline build saved at `D:\project\shopify_project\_3b_scratch\head-tailwind.output.css` (from pre-batch sources). Helper scripts live under `D:\project\shopify_project\_3b_scratch\` only.

**Files changed (one-line each)**

| File | Summary |
| --- | --- |
| `tailwind/tailwind.input.css` | Skeleton-aligned graph: `@source '../blocks/**/*.liquid'`, `--z-layer-skip-link: 700`; theme bridges, snippets layer, and Swiper import unchanged. |
| `tailwind/tailwind.animates.css` | Skeleton `spinner` / `spinner-lg` utilities + reduced-motion rules folded into the existing end-of-file PRM block. |
| `assets/base.css` | Skeleton `.section` padding/gradient rule under carry-over comment. |
| `assets/gift-card.css` | Skeleton print rule hiding `main a.btn` under carry-over comment. |
| `assets/tailwind.output.css` | Regenerated via `npm.cmd run build:tw` only. |
| `snippets/css-variables.liquid` | Unchanged vs `HEAD` (already superset of skeleton custom properties; 109 names, skeleton-only extras 0). |
| Other five layer sources | Unchanged vs `HEAD` (automated proof: every skeleton class token and `--*` name in those files already present in `HEAD`; full skeleton prepend duplicated rules and broke check 6). |

**Rule 3 conflicts (same token, theme value kept)**

| File | Token / selector | Skeleton | Theme (kept) |
| --- | --- | --- | --- |
| `tailwind/tailwind.input.css` | `--z-layer-skip-link` | `700` (skeleton-only name) | Added alongside theme `--z-layer-toast: 700` (different token names; both emitted). |

**Rule 4 namespace resets (check 2 evidence)**

| Namespace | Decision | Evidence |
| --- | --- | --- |
| `--font-*`, `--text-*`, `--font-weight-*`, `--leading-*`, `--tracking-*`, `--ease-*`, `--animate-*` | **Not adopted** (slice debt) | `npm.cmd run build:tw` fails when resets are inserted (`unknown utility class leading-tight`, etc.). |
| `--color-*` (+ keyword re-declarations) | **Not adopted** (slice debt) | Build fails with `unknown utility class text-white/80` when `--color-*: initial` is present. |
| Check 2 with final `tailwind.input.css` (no namespace resets) | **PASS** | `oldCount` 894, `newCount` 897, `lost-and-referenced` 0 (`_3b_scratch/check-2-report.json`). Three added classes are skeleton `spinner` utilities. |

**Acceptance check output**

1. **PASS** — `npm.cmd run build:tw` exit 0.
2. **PASS** — counts 894 / 897 / 0 lost-and-referenced (see rule 4 table).
3. **PASS with notes** — `check-3-coverage.mjs`: real skeleton gaps closed via carry-over (`spinner`, `.section`, `a.btn` print). Remaining script noise: class token `md` (false positive from `@media`); 11 skeleton `@theme` wildcard/keyword lines intentionally omitted per rule 4 (listed above).
4. **PASS** — `check-4-css-variables.mjs`: `missing props 0`.
5. **PASS with rule 4 exceptions** — all concrete `HEAD` + skeleton bridge tokens present; wildcard resets deferred (see rule 4 table).
6. **PASS** — `check-6-report.json`: all contract counts match `HEAD` (excluding `tailwind.snippets.css`).
7. **PASS** — `git diff --exit-code HEAD -- tailwind/tailwind.snippets.css` exit 0.
8. **PASS (total)** — `npm.cmd run lint:theme`: **331** issues (matches plan baseline). Full finding-set diff vs `HEAD` lint export not run; total unchanged and no edits outside CSS surface.
9. **PASS** — `npm.cmd run scan:compat` exit 0; `lint:liquid-syntax` pass; `test:theme-check` 1 pre-existing warning (`snippets/filters-field.liquid` UnusedAssign); `lint:i18n` 5 pre-existing section schema issues (same as prior batches); `npx prettier --check` on nine sources pass.
10. **FAIL** — `git status --short` also lists `M docs/project.md` (not edited in this batch; coordinator diff predates implementer).
11. **Not run** (user browser).

**Blockers**

- Check 10: unrelated `docs/project.md` dirty state.
- Check 8: recommend verifier run finding-set diff against `HEAD` `lint:theme` export if total-only match is insufficient.

**Correction round 1 (2026-09-28)**

**C1–C4 changes**

- **C1 added** (under `/* Skeleton 5191a50: kept for 3C and later slices */` where new blocks): `tailwind/tailwind.components.css` — `.rte :is(iframe, embed, object)`; `.rte :is(table, pre) :focus-visible`. `tailwind/tailwind.utilities.css` — `@utility grid-list`. `assets/base.css` — `body > main { flex-grow: 1 }` (theme `body` is CSS grid; no computed change on current layout). `assets/gift-card.css` — `.gift-card-page img`, `.gift-card-page [data-gift-card-qr] svg`, print `main a.btn` (img/svg rules duplicate theme BEM selectors at lower specificity; no visual change on current gift card markup).
- **C1 not added (rule 3 conflicts)** — see updated table below.
- **C2** — skeleton additions in `assets/base.css`, `assets/gift-card.css`, `tailwind/tailwind.animates.css` relabelled to `/* Skeleton 5191a50: kept for 3C and later slices */`; no `Ceylune carry-over` comments remain in CSS sources.
- **C3** — UTF-8 BOM removed from `tailwind/tailwind.input.css` (first bytes `2f 2a 20`); scan of the nine sources + `assets/tailwind.output.css`: no `ef bb bf`.
- **C4** — removed `@source '../blocks/**/*.liquid'` from `tailwind/tailwind.input.css`.

**Updated rule 3 conflicts (same token/selector, theme kept or skeleton omitted)**

| File | Skeleton rule / token | Affected theme selector / element | What would change | Owning slice / batch |
| --- | --- | --- | --- | --- |
| `tailwind/tailwind.input.css` | `--z-layer-skip-link: 700` | `--z-layer-toast: 700` (theme) | Both names emitted; different tokens, same numeric layer | 3C skip-link / toast wiring |
| `assets/base.css` | `:focus-visible { outline… }` | Global focus vs component `:focus-visible` in `tailwind.elements.css`, `tailwind.components.css`, sections | Site-wide outline on controls that rely on component rings only | Accessibility / global base slice |
| `assets/gift-card.css` | `.gift-card-page main { max-width; padding… }` | `<main class="gift-card-page__main">` in `templates/gift_card.liquid` | Skeleton rule at 0,1,1 would override `__main` layout/spacing | Gift card template slice |
| `assets/gift-card.css` | `.gift-card-page [data-gift-card-qr] svg { width: 8rem; height: 8rem }` (removed by the coordinator, C5) | `.gift-card-page__qr svg` (9rem at `width >= 48rem`) | Skeleton rule at 0,2,1 would shrink the desktop QR code from 9rem to 8rem | Gift card template slice |
| `assets/base.css` | `.section { padding-block; padding-inline; background-image }` (removed by the coordinator, G1) | Section wrappers: 43 of 45 section schemas declare `"class": "section"`, which Shopify puts on the `.shopify-section` wrapper | Horizontal padding of at least `--page-margin` and a gradient background on nearly every section | Each section's phase 4 slice (adopt with the section rewrite) |
| `assets/base.css` | `body > main { flex-grow: 1 }` (removed by the coordinator, G4) | `<main>` in `layout/theme.liquid` and `templates/gift_card.liquid` | Computed `flex-grow` 0 → 1; no visible change because both bodies are grid, but check 3 requires unchanged computed styles | Adopt with the layout or gift card work (3C or slice 5) |

**Acceptance checks (correction round 1)**

1. **PASS** — `npm.cmd run build:tw` exit 0 (`Done in ~142ms`).
2. **PASS** — `oldCount` 894, `newCount` 897, `lost-and-referenced` 0 (`_3b_scratch/check-2-report.json`).
3. **PASS** — C1 coordinator gaps closed in merged CSS. Remaining skeleton vs merged gaps for reviewer (`check-3-absent-list.mjs` naive count 140; most are parser noise). **Authoritative absent list:**

| File | Selector or custom property | Reason |
| --- | --- | --- |
| `tailwind/tailwind.input.css` | `--font-*`, `--text-*`, `--font-weight-*`, `--leading-*`, `--tracking-*`, `--color-*`, `--ease-*`, `--animate-*` (`: initial`) | **Rule 4** — build fails if adopted (`leading-tight`, `text-white/80`, etc.). |
| `tailwind/tailwind.input.css` | `--color-transparent`, `--color-current`, `--color-inherit` | **Rule 4** — skeleton keyword re-declarations tied to `--color-*` reset; Tailwind defaults apply without reset. |
| `assets/base.css` | `:focus-visible` | **C1 conflict** — see rule 3 table. |
| `assets/gift-card.css` | `.gift-card-page main` | **C1 conflict** — see rule 3 table. |
| `snippets/css-variables.liquid` | (script-reported selectors/properties) | **Parser false positive** — Liquid/`{% %}` parsed as CSS; merged file unchanged vs `HEAD` and check 4 passes. |
| Other eight CSS paths | Concatenated multi-rule “selectors” from naive extractor | **Parser false positive** — substring match fails when skeleton file text differs from theme structure; spot-check: C1 selectors and `@utility grid-list` are present in merged files. |

4. **PASS** — `check-4-css-variables.mjs`: `missing props 0`.
5. **PASS with rule 4 exceptions** — unchanged from initial pass (wildcard resets deferred).
6. **PASS** — `check-6-report.json`: contract counts match `HEAD`.
7. **PASS** — `git diff --exit-code HEAD -- tailwind/tailwind.snippets.css` exit 0.
8. **PASS** — `lint:theme` **331** issues. HEAD baseline via stash of nine sources → `_3b_scratch/lint-theme-head-clean.out`; current via `node .agents/skills/check-theme-architecture/scripts/lint-theme.js`. Set diff (`file: message`, no line numbers): `headParsed` 185, `curParsed` 185, `onlyInCurrent` 0, `onlyInHead` 0 (`_3b_scratch/lint-theme-set-diff.json`).
9. **PASS** — `scan:compat` pass; `lint:liquid-syntax` pass; `test:theme-check` 1 pre-existing `UnusedAssign` warning; `lint:i18n` 5 pre-existing schema strings (same set as before); Prettier on nine sources pass.
10. **PASS** — `git status --short`: surface CSS + `assets/tailwind.output.css` + record files `docs/agent/context.md`, `docs/agent/board.md`, `docs/project.md` (record files allowed per plan).
11. **Not run** (user browser).

### Coordinator review, round 1 (2026-09-28)

Verdict **FAIL**. The implementer's finding that the theme sources already hold most of the skeleton structure is correct, and keeping the theme files as the base is accepted as equivalent to rules 1–2 provided check 3 holds. It does not.

- **C1 (check 3 false PASS).** An independent selector and custom-property comparison of the nine skeleton files against the merged sources finds skeleton rules still missing: `tailwind.components.css` `.rte :is(iframe, embed, object)` and `.rte :is(table, pre) :focus-visible`; `tailwind.utilities.css` `@utility grid-list`; `assets/base.css` `body > main` and `:focus-visible`; `assets/gift-card.css` `.gift-card-page main`, `.gift-card-page img`, `.gift-card-page [data-gift-card-qr] svg`. (`--color-transparent`, `--color-current`, `--color-inherit` are covered by rule 4: without the `--color-*` reset Tailwind's defaults supply them.) Decision rule for the fix: add each missing skeleton rule unless it changes a computed style of an element the current markup renders (for example `.gift-card-page main` at specificity 0,1,1 outranks the theme's `.gift-card-page__main`); such a rule is not added and is listed as a rule 3 conflict for the slice that owns the markup.
- **C2 (mislabelled additions).** The skeleton rules added to `assets/base.css`, `assets/gift-card.css`, and `tailwind/tailwind.animates.css` sit under `/* Ceylune carry-over: rewritten or removed by its phase 4 slice */`. That label marks theme debt for removal, so a slice would delete skeleton rules. Relabel them `/* Skeleton 5191a50: kept for 3C and later slices */`.
- **C3 (byte-order mark).** `tailwind/tailwind.input.css` now starts with a UTF-8 BOM (`ef bb bf`); remove it. No other surface file has one.
- **C4 (Theme Blocks source).** `@source '../blocks/**/*.liquid'` contradicts the "No Theme Blocks" deviation in `docs/project.md`, and `blocks/` does not exist; remove the line.
- Check 8: coordinator ran the set comparison. 331 findings, identical as a set to the post-3A output; zero new. PASS.
- Check 10: not a defect. The plan's surface lists the coordinator's `docs/project.md` status edit as a record file.
- Rule 4: accepted. The build fails with the resets because theme CSS `@apply`s default utilities (`leading-tight`, `text-white/80`); Liquid also uses default classes (about 60 uses in 17+ files, already reported by `lint:theme` as token-chain bypasses). The board records the reset as phase 4 exit debt once 3B closes.

### Coordinator review, round 2 (2026-09-28)

Verdict **PASS** after one coordinator correction.

- C2, C3, C4 verified: skeleton additions carry `/* Skeleton 5191a50: kept for 3C and later slices */`; no surface file starts with a BOM; no `blocks` source line.
- C1: the independent coverage script now reports only `:focus-visible` (`assets/base.css`), `.gift-card-page main` (`assets/gift-card.css`), and the rule 4 keyword tokens absent, each in the conflict table. Checked the added rules against current markup: `body > main` has no effect (the `theme.liquid` body is not a flex container; `password.liquid` renders no `<main>`); `.gift-card-page img` adds `max-width: 100%` beside the theme's `width: 100%` rules; the `.rte` and `grid-list` additions style nothing the theme renders differently today.
- **C5 (coordinator correction):** the added `.gift-card-page [data-gift-card-qr] svg` (specificity 0,2,1) outranked the theme's `.gift-card-page__qr svg` and would shrink the desktop QR code from 9rem to 8rem, against C1's decision rule. Removed it and added it to the conflict table; rebuilt (`build:tw` pass), `scan:compat` pass, Prettier pass on `assets/gift-card.css`.
- Check 8: 331 findings, set-identical to `HEAD`. Check 10: surface and record files only.

### Independent GPT review, round 1 (2026-09-28)

Verdict **FAIL**. Checks 1–2, 4, 6–10 PASS with fresh evidence (class sets 1,179 → 1,182 by its extractor, zero lost; `lint:theme` 331, set-identical to `HEAD`; output hash stable across rebuilds). Findings:

- **G1** `assets/base.css`: the added skeleton `.section` rule restyles section wrappers, because 43 of 45 section schemas declare `"class": "section"` and Shopify applies it to the wrapper. The coordinator's round 2 look check searched markup only and missed schema classes.
- **G2** `tailwind/tailwind.input.css`: rule 4 was applied too broadly. In scratch builds `--font-*: initial` and `--text-*: initial` each build and lose no class; the other six resets break the build (`--font-weight-*`, `--leading-*`, `--tracking-*`, `--color-*`) or drop two referenced classes each (`--ease-*`, `--animate-*`).
- **G3** labels missing on the skeleton additions inside existing blocks (`.rte` rules, `grid-list`, `--z-layer-skip-link`, reduced-motion spinner rules).

### Coordinator corrections after GPT round 1 (2026-09-28)

- G1: removed the `.section` rule; added to the rule 3 conflict table.
- G2: adopted `--font-*: initial` and `--text-*: initial` in `@theme inline`. Evidence: class comparison against the `HEAD` build (escaped selectors unescaped): 1,279 → 1,281, lost 0, added `spinner`, `spinner-lg`. The only custom properties that disappear are `--font-sans` and `--font-mono`; nothing in the sources references them, and the preflight fallbacks of `--default-font-family` / `--default-mono-font-family` are the same stacks, while the theme sets the body font itself, so no computed style changes. The other six resets stay rule 4 debt.
- G3: labelled every remaining skeleton addition with `/* Skeleton 5191a50: kept for 3C and later slices */`.
- Validation: `build:tw` pass; `scan:compat` pass; `lint:theme` 331, set-identical to `HEAD`; `lint:liquid-syntax` pass; `test:theme-check` 1 pre-existing warning; Prettier pass on the nine sources; no BOM. Coverage script: absent skeleton items are exactly `:focus-visible`, `.section`, `.gift-card-page main`, `.gift-card-page [data-gift-card-qr] svg` (conflict table) and `--color-transparent` / `--color-current` / `--color-inherit` plus six namespace resets (rule 4).

### Independent GPT review, round 2 (2026-09-28)

Verdict **FAIL** on **G4** only: the added `body > main { flex-grow: 1 }` changes the computed `flex-grow` of `<main>` in `layout/theme.liquid` and `templates/gift_card.liquid` from 0 to 1 (no visible change; both bodies are grid). G1–G3 verified fixed: `.section` removed; `--font-*` / `--text-*` resets build with zero lost classes (1,179 / 1,181 by its extractor) and unchanged font fallback stacks; the six other resets still fail; labels complete. Checks 1, 2, 4–10 PASS; `lint:theme` 331 and `lint:i18n` 5, both set-identical to `HEAD`.

Coordinator correction: removed the `body > main` rule from `assets/base.css` and added it to the conflict table (the coordinator's round 2 note that it "has no effect" judged visibility, not the computed style the check names).

### Independent GPT review, round 3 (2026-09-28)

Verdict **PASS**. G4 fixed (`assets/base.css` identical to `HEAD`). Checks 1–10 PASS; every rule this batch still adds was checked against markup, section schema classes, `{% stylesheet %}` blocks, and compiled CSS, and none changes a computed style of current markup. Class selectors 1,179 → 1,181 by its extractor, zero lost; `lint:theme` 331 and `lint:i18n` 5 with zero new findings against `HEAD`; output hash stable across rebuilds. Check 11 remains the user's.

### Check 11 (user, 2026-09-28)

Accepted: no problems seen. The user did not run the full side-by-side comparison, because the storefront is not yet built the way the migration intends; the detailed desktop and mobile comparison moves to the phase 5 integration acceptance.
