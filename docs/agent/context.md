# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-20.

Previous batch: H3 (CI merchant-path guard, reference table pointers) closed: Ask review PASS in round 3, and acceptance 8 passed on GitHub (CI run 39450026571, `Lint` with `npm run lint:merchant` green: https://github.com/Joey-Fjh/my-theme-1/actions/runs/39450026571). Plan, fixes and review rounds: `git show 3503596:docs/agent/context.md`.

## Batch H4: prose slimming and the bundled Pending migration (closes the harness round)

**Status:** executed and reviewed (2026-10-21): Ask review PASS in round 3.

**Outcome.** The always-on and routed prose says each rule once, in its owner, and stops restating what a check or a source file already enforces. The eight Pending migration rules move into their targets in the same batch, so additions and cuts are counted together. The board's Pending migration section ends empty. After H4 the harness round closes; Cursor and Codex hooks and the `AGENTS.md` routing-table cut stay deferred on the board.

**Decisions so far (user, 2026-10-20, board):** prose shrinks only where its rule is enforced elsewhere or is duplicated or stale; Pending migration is approved in one bundle at the end of the stage; H4 closes the round.

**User decisions needed when authorizing:**
1. **The Pending migration bundle.** Authorizing H4 approves the eight lines on the board (targets: `motion-architecture.md`, `abstraction-boundaries.md`, `css-architecture.md`, `javascript-runtime.md`, `launch-gate.md`, `AGENTS.md`, `docs/project.md`, `check-theme-architecture/SKILL.md`), unless the user strikes any line. `docs/project.md` is the user's file; the approval covers only that line's edits.
2. **Batch SOP placement.** Coordinator recommendation: keep it in `AGENTS.md` (Cursor and Codex read only that file, and the hooks do not drive the SOP), but compress it: the step table stays, the prose around it that repeats the table goes. Alternative: move it to `.agents/roles/` or a reference read when a batch starts, leaving a three-line pointer.
3. **Optional scope:** also classify and slim `css-architecture.md` (7,541 words) and `javascript-runtime.md` (3,133 words), which the 2026-10-20 classification did not cover. Coordinator recommendation: not in H4; only their Pending migration additions are. A later batch can do them if the user wants.

**Classification rules (from the 2026-10-20 per-section classification, A to D):**
- **D, duplicated or stale:** delete. Duplicated text keeps one owner (the more specific file wins, `AGENTS.md` keeps a pointer if routing needs it); stale text includes migration markers (`HEAD`, `CAP-01`, `5-C3a`, `6-C4` and similar batch IDs used as context) and descriptions of states that no longer exist.
- **A, restates an existing check:** cut to one line naming the check (script or test) and what it guards, only when the named check covers it; the implementer proves coverage by citing the check's code or test case. `check-theme-architecture/SKILL.md` "What lint:theme Covers" (about 1,400 words) becomes a short pointer to the script and its test file; `check-i18n/SKILL.md` keeps its trigger and points to the Validation table.
- **B, judgment with a decidable trigger:** keep. In `AGENTS.md` its routing tables stay (other clients read them); trim wording only.
- **C, judgment or process without a trigger:** keep, compress wording.
- Nothing changes meaning. A rule moved or cut names where it now lives.

**Implementation surface:** `AGENTS.md` (`CLAUDE.md` is a symlink), `docs/project.md` (the approved Pending migration line only), `docs/references/**`, `.agents/skills/check-theme-architecture/SKILL.md`, `.agents/skills/check-i18n/SKILL.md`, `docs/agent/board.md` (Pending migration emptied; harness round closed), `docs/agent/context.md`. Not in the surface: `.agents/roles/**` (unless the user picks the Batch SOP alternative), vendored skills, scripts and tests, `.claude/**`, `routes.json`, theme files. If a cut needs a check that does not exist, keep the prose and list the check as a candidate.

**Acceptance checks:**
1. `git diff --name-only` lists only surface files.
2. Word counts before and after (`wc -w`) for every changed file and in total, recorded in Progress; the total for the classified set (`AGENTS.md`, `i18n-checklist.md`, `abstraction-boundaries.md`, `browser-compatibility.md`, `image-display-contract.md`, both `check-*` `SKILL.md`) falls, net of the migrated rules.
3. A cut table in Progress: every removed or rewritten paragraph or table row → class (A, B, C or D) → where the rule now lives (check name with file, other doc path, or "stale, why"). The verifier samples it against `git diff`.
4. Each of the eight Pending migration lines (or those the user kept) is present in its target with the same meaning; the board's Pending migration section is empty; `npm.cmd run lint:records` prints 0 pending migration lines.
5. No migration marker left in `docs/references/**` and the two `SKILL.md` files (search recorded, with any intentional exception named).
6. `AGENTS.md` keeps every hook-routed item `routes.json` points to (pointers resolve; `npm.cmd run test:harness` passes) and every Validation table command (`npm.cmd run test:harness` integrity test).
7. `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, `npm.cmd run test:validators` pass; `git diff --check` clean; Markdown structure intact.
8. Board size recorded; if it falls below the 1865 baseline, `npm.cmd run lint:records -- --prune-baseline` lowers it.

**Review tier:** Ask (agent rules and references). Execution: external prompt, then a separate verifier; complete only on PASS. Commit and push afterwards; CI must stay green (checked through the public API).

## Progress

- Authorized (user, 2026-10-20) with the coordinator's recommendations: (1) all eight Pending migration lines approved as a bundle, none struck; (2) Batch SOP stays in `AGENTS.md`, compressed (the step table stays, prose repeating it goes); (3) `css-architecture.md` and `javascript-runtime.md` are not slimmed in H4, they only receive their migrated rules. Standing guidance: the leanest result that meets the checks; record deviations here.
- Before counts (`D:\git_download\Git\usr\bin\wc.exe -w`, before the first content edit): `AGENTS.md` 2753; `docs/project.md` 1328; `docs/references/code-review/i18n-checklist.md` 493; `docs/references/architecture/abstraction-boundaries.md` 865; `docs/references/code-review/browser-compatibility.md` 466; `docs/references/style-system/image-display-contract.md` 912; `docs/references/architecture/motion-architecture.md` 771; `docs/references/code-review/launch-gate.md` 659; `docs/references/style-system/css-architecture.md` 7541; `docs/references/architecture/javascript-runtime.md` 3133; `.agents/skills/check-theme-architecture/SKILL.md` 1620; `.agents/skills/check-i18n/SKILL.md` 180; `docs/agent/board.md` 1878; `docs/agent/context.md` 908; total 23507. Classified set (`AGENTS.md`, `i18n-checklist.md`, `abstraction-boundaries.md`, `browser-compatibility.md`, `image-display-contract.md`, both `check-*` `SKILL.md`): 7289.
- After counts (same `wc.exe -w`, after the content edits, before this Progress close-out): `AGENTS.md` 2773; `docs/project.md` 1598; `i18n-checklist.md` 326; `abstraction-boundaries.md` 797; `browser-compatibility.md` 383; `image-display-contract.md` 770; `motion-architecture.md` 754; `launch-gate.md` 727; `css-architecture.md` 7864; `javascript-runtime.md` 3207; `check-theme-architecture/SKILL.md` 279; `check-i18n/SKILL.md` 178; `docs/agent/board.md` 1517; `docs/agent/context.md` 959. Classified set from a second `wc.exe -w` on those seven files: total 5506 (7289 − 5506 = 1783). The set falls with the migrated rules included. `docs/agent/context.md` after this close-out: 2212.
- Cut-table rows (node match on the table): 35. A 7, B 1, C 8, D 10, migration 9.
- Implemented, awaiting review. Not accepted. No commit. Open board decisions were not decided. The Batch SOP always-on decision stays open; this batch kept the step table in `AGENTS.md` because the authorization said to. No Agent Skills trigger applies (no motion, GSAP consumer, or visual-direction change).

### Deviations

- **`motion_enabled` list.** The 0a5fd1d source says the code also stops autoplay, tilts, and zooms. Current code stops the promo-banner zoom (`assets/promo-bannder.js`) and the ritual-steps packshot tilt (`assets/ritual-steps.js`). It does not stop slideshow or routine autoplay (`assets/slides-show.js` `_shouldRunAutoplay`, `assets/routine-showcase.js` `_canRunAutoplayAnimation` read reduced motion only). The list follows the code.
- **Migration markers in `css-architecture.md`.** User decision 3 limits that file, and `javascript-runtime.md`, to migrated rules. Markers were removed from the slimmed references and both `SKILL.md` files. They remain in `css-architecture.md`. `javascript-runtime.md` had none.
- **Check 8 prune not run.** `npm.cmd run lint:records` printed `board words: 1517`, `baseline: 1865`, `pending migration lines: 0`. Prune would write `.agents/tools/harness/records.baseline.json`, which the task forbids and which would fail check 1. Needs the user to allow that one write.

### Check candidates

- Bare global DOM listeners inside a Liquid `{% javascript %}` block. `executable-inline-script` matches `<script>` bodies only (`.agents/skills/check-theme-architecture/scripts/lib/theme-contracts.js`). The Liquid sentence stays in `AGENTS.md`.
- Omitting a preset or default setting that already equals the schema default, and omitting an empty block `settings` object. `lint:i18n` rejects `t:` in those values and does not require the omission. The two sentences stay in `i18n-checklist.md`.

### Marker search

Command: `rg -n -e "HEAD|CAP-01|\b[0-9]+-[A-Z][0-9]+"` on `docs/references` and the two `SKILL.md` files, piped to `wc -l`. Before, `git grep` of the same pattern on `HEAD` for those paths: 43 lines. After: 32 lines, all in `docs/references/style-system/css-architecture.md` (the exception above). No hit in the slimmed references or either `SKILL.md`. No living-name exception was kept in those files.

### Cut table

| Removed or rewritten | Class | Where the rule lives now |
| --- | --- | --- |
| `check-theme-architecture/SKILL.md` "What lint:theme Covers" table (check ids and rule text) | A | `.agents/skills/check-theme-architecture/scripts/lint-theme.js` and `.agents/skills/check-theme-architecture/scripts/theme-architecture.test.js`; the skill now points at them |
| Same file, batch ids on check rows (`6-C4`, `6-C9`, `6-C3`, `6-C2`, `6-V6`, `6-C6`, `6-R4`) | D | stale batch context; the check ids remain in the script |
| Same file, colour-lint regex limitation added | migration | `.agents/skills/check-theme-architecture/SKILL.md` "What lint:theme covers" |
| `check-i18n/SKILL.md` restatement of what the validator supplements | A | `.agents/skills/check-i18n/scripts/lint-i18n.js`; one line kept, plus the Validation pointer |
| `i18n-checklist.md` locale table, schema-localizable field list, preset `t:` rules, Unicode and uppercase notes | A | `lint-i18n.test.js` cases named in the checklist (`duplicate locale JSON key fails`, `preset settings with t: value fails`, `lowercase text setting defaults require translation`, `uppercase visible html text fails`, and the others listed there); `shouldRequireSchemaTranslation` in `lint-i18n.js` |
| Same file, JS copy row | A | `lint:theme` `js-user-visible-copy` in `theme-contracts.js`; the `data-*` path stays as one sentence |
| Same file, "omit preset/default when already the schema default" and "omit empty settings" | C | kept, compressed, under "Review judgment the check does not make" |
| `browser-compatibility.md` enumerated Safari/Chrome/Firefox/Edge/webview list | D | the linked Shopify requirements section is the owner; the "follow the current page" sentence stays |
| Same file, build-boundary, static-scope, adoption, and evidence paragraphs | C | same file, compressed; Vite/Autoprefixer/Browserslist sentence kept |
| Same file, commands paragraph | A | `AGENTS.md` Validation |
| `image-display-contract.md` Decision Flow steps 1–5 | D | Display Modes table and Object-position / Fit sections in the same file |
| Same file, "caller decides the mode" | C | kept as one sentence under Display Modes |
| Same file, "do not default position before detecting" review row | D | Object-position section, same file |
| Same file, raw `<img>` review row | A | `lint:theme` `bare-img` in `theme-contracts.js` |
| Same file, heading `Ratio vocabulary (5-C3a)` | D | stale batch id; the ratio table stays |
| `abstraction-boundaries.md` principle, gate, resolution, snippet rules | C | same file, compressed |
| Same file, anti-pattern table rows | C | same table, shorter cells; third-consumer row kept |
| Same file, `HEAD` and `(5-C3a)` | D | stale; `scheme_target: none` now states the section writes the scheme class (`snippets/section-frame.liquid` `{% doc %}`) |
| Same file, carousel-indicator exception and full-bleed background slot | migration | same file, after the anti-pattern table |
| `motion-architecture.md` goals, ownership, decision table, page-type, tokens, performance | C | same file, compressed |
| Same file, "generous rootMargin" loading bullet | D | replaced by the migrated rule: one viewport in `assets/scatter-gallery.js` `preloadRootMargin()`, not the 200px margin in `assets/base.js` |
| Same file, motion CSS gate sentence | migration | same file, intro: `body:not([data-motion-enabled='false'])` |
| `launch-gate.md` classification, accessibility, cleanup, ignore files, Lighthouse workflow | C | same file, compressed |
| Same file, "AGENTS.md already requires semantic interactive elements…" | D | `AGENTS.md` Hard implementation rules |
| Same file, computed-style recipe and browser-sweep password rules | migration | same file, "Lighthouse Issue Classification" and "Browser sweep" |
| `AGENTS.md` two Batch SOP intro paragraphs | D | the step table (kept verbatim); the subagent proposal sentence stays |
| `AGENTS.md` runtime load-order and Vite/Browserslist sentences | D | `javascript-runtime.md` and `browser-compatibility.md`; one-line pointers kept |
| `AGENTS.md` Sources examples | C | same section, compressed |
| `AGENTS.md` Agent Skills inventory wording | B | same section; trigger conditions kept |
| `AGENTS.md` inline-script sentence | A | `executable-inline-script` in `theme-contracts.js`; listener half kept (see check candidates) |
| `AGENTS.md` audit practice, CSS-batch checks, and four Gotchas | migration | `AGENTS.md` "Audit practice" and "Gotchas" |
| `css-architecture.md` readiness, stylesheet-vs-Tailwind lesson, grid/sticky/heading/margin/visibility rules | migration | new "Readiness" section; file not otherwise slimmed |
| `javascript-runtime.md` own loader and library-upgrade rule | migration | new "Loader and library upgrades" |
| `docs/project.md` `motion_enabled` sentence, design workflow, design source, design input, second submission | migration | Theme-Specific Contracts and Accepted Direction |
| `docs/agent/board.md` eight Pending migration lines | migration | the targets above; section heading kept, body empty |

### Validation

- `git diff --name-only` and `git status --short`: the 14 surface files only (the two `SKILL.md` files, `AGENTS.md`, `docs/project.md`, six references, `css-architecture.md`, `javascript-runtime.md`, `board.md`, `context.md`). No forbidden path.
- `git diff --check`: no output, exit 0.
- `npm.cmd run lint:records`: `board words: 1517`, `baseline: 1865`, `pending migration lines: 0`. Exit 0.
- `npm.cmd run test:harness`: 7 tests, 7 pass, 0 fail. Exit 0. Includes `routes.json matches package scripts, pointers, validation commands, and merchant paths`.
- `npm.cmd run lint:doc-paths`: `Doc path lint passed.`
- `npm.cmd run doctor:agent`: exit 0, no failure printed.
- `npm.cmd run test:validators`: exit 0. Nested totals from that command: `test:i18n` 33 pass / 0 fail; `test:theme-architecture` 243 pass / 0 fail; `test:section-stylesheet-carry` 3 pass / 0 fail; `test:doc-paths` 7 pass / 0 fail; `test:ci-contract` 18 pass / 0 fail; `test:harness` 7 pass / 0 fail; `test:merchant` 18 pass / 0 fail.

**Coordinator review (2026-10-20):** (1) Check 8: the plan left `records.baseline.json` outside the surface, a planning error; the coordinator ran `npm.cmd run lint:records -- --prune-baseline` (board 1517, baseline 1865 → 1517). (2) The board's open decision on Batch SOP placement removed: the user decided it in the authorization. (3) The `motion_enabled` autoplay mismatch the implementer found (code vs `design.md`) filed in `backlog.md` Defects. (4) The two check candidates filed under board Deferred ideas.

**Verifier round 1 (external session, 2026-10-21): FAIL**, all automated checks passed; three meanings lost, restored by the coordinator: (1) `AGENTS.md` Batch SOP: "roles stay model-agnostic" restored; (2) migrated rules: the closed-area audit runs in an external Sonnet session with its report outside the repository (`AGENTS.md`), and the design workflow allows reference sites inspected for motion with Chrome DevTools MCP (`docs/project.md`); (3) `check-theme-architecture/SKILL.md` Reporting: a pre-existing finding is again classified as a warning or follow-up per `AGENTS.md`. Cut-table additions: the Batch SOP row now keeps the model-agnostic sentence; the SKILL.md Reporting rewrite is a C-row compression with meaning unchanged.

**Final word counts (coordinator, 2026-10-21, after the round-1 restorations; `git show HEAD:<file> | wc -w` against `wc -w <file>`; these supersede the implementer's after column):**

| File | HEAD | Final |
| --- | ---: | ---: |
| `AGENTS.md` | 2753 | 2787 |
| `docs/project.md` | 1328 | 1611 |
| `docs/references/code-review/i18n-checklist.md` | 493 | 326 |
| `docs/references/architecture/abstraction-boundaries.md` | 865 | 797 |
| `docs/references/code-review/browser-compatibility.md` | 466 | 383 |
| `docs/references/style-system/image-display-contract.md` | 912 | 770 |
| `docs/references/architecture/motion-architecture.md` | 771 | 754 |
| `docs/references/code-review/launch-gate.md` | 659 | 727 |
| `docs/references/style-system/css-architecture.md` | 7541 | 7864 |
| `docs/references/architecture/javascript-runtime.md` | 3133 | 3207 |
| `.agents/skills/check-theme-architecture/SKILL.md` | 1620 | 290 |
| `.agents/skills/check-i18n/SKILL.md` | 180 | 178 |
| `docs/agent/board.md` | 1896 | 1532 |
| `docs/agent/backlog.md` | 1733 | 1778 |
| `docs/agent/context.md` | 2189 | 2382 (before this table) |
| `.agents/tools/harness/records.baseline.json` | 4 | 4 |
| **All 16 changed files** | **26543** | **25390** |

Classified set (`AGENTS.md`, `i18n-checklist.md`, `abstraction-boundaries.md`, `browser-compatibility.md`, `image-display-contract.md`, both `check-*` `SKILL.md`): **7289 → 5531**, net of the migrated rules.

**Verifier round 2 (external session, 2026-10-21): FAIL** only on acceptance check 2 (the after column predated the round-1 restorations); the table above refreshes it. All meaning checks, validators and checks 1 and 3-8 passed.

**Verifier round 3 (external session, 2026-10-21): PASS**, no findings.
