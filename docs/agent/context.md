# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-20.

## Batch H1: record layer (backlog file, record rules, board cleanup)

**Status:** executed (implementer, 2026-10-20). Awaiting Ask-tier verifier review; not marked accepted.

**Outcome.** Accepted-but-unscheduled work has its own file, `docs/agent/backlog.md`, one line per item. `AGENTS.md` describes the record layer that way. The board holds only undecided matters, live evidence, rule decisions pending migration, and deferred ideas, and shrinks from about 9,600 words to a size that becomes the ratchet baseline for the `Stop` checks in H2.

**Decisions (user, 2026-10-20; discussion on the board):**
- A new `docs/agent/backlog.md`, not `todo` (collides with the session to-do tool and `TODO` comments).
- No decision log. A settled decision goes to its owner: a rule that binds agents waits on the board under "Pending migration" and is approved in one bundle at the end of a stage (not per batch); a decision about one piece of work sits on that work's `backlog.md` line and ends with it; history stays in Git.
- No fixed board word cap: the size after this cleanup is the ratchet baseline (2,500 words was the coordinator's estimate, not a standard).
- The Batch SOP section stays always-on in this batch; moving it to read-on-demand is a separate user decision.

**Dependencies:** the user authorizes the batch. Nothing else.

**Step 0, before the cleanup (home machine; read-only; done 2026-10-20, see Progress):** collect the transcript statistics from that machine's Claude Code and Codex sessions for this repository, mainly to fill the gaps in the 2026-10-20 sample (10-01 to 10-07, after 10-13 17:54). Same measures as the board's "Transcript statistics": `Skill` tool calls and skill file reads (`review-animations`, the GSAP skills, `frontend-design`); validator runs by npm script; reads and writes of the record files and references; record writes through the shell vs Edit or Write; visible `lint:theme` failure kinds. Add the result to the board's harness round evidence as one compressed bullet (machine, session counts, date range, the numbers that differ from this machine's sample), then run the cleanup, so the ratchet baseline includes it. A read-only subagent runs it only if the user approves one at the time (Batch SOP); raw detail stays in the session scratchpad. If that machine has no usable transcripts, record that in Progress and continue.

**Classification rules for the board content (apply to every paragraph and bullet of the current board):**
1. **Completion record** (a "Done", "done" or batch-result paragraph, plan and review pointers for finished work): delete. Keep a `git show` pointer only inside a line that still needs it.
2. **Accepted, unscheduled work** (polish notes, open defects and leftovers, consolidated browser pass rows, Lighthouse and CI follow-ups, layout baseline debt, rail entries, card surface, shared carousel controls, section cleanup, open browser checks of finished sections): one `backlog.md` line each, with the work decision that governs it on the same line.
3. **Rule or contract that binds agents** (rule conflict decisions, audit practice, the CSS readiness definition, design source and design input decisions, "Pattern for later sections" and lessons from the 6-S batches, the 6-C6 stylesheet lesson, the `docs/project.md` motion-settings correction): one line each under a board section "Pending migration", naming the target file (`AGENTS.md`, a reference, or `docs/project.md`), with a `git show <pre-H1>:docs/agent/board.md` pointer for the full text. Do not edit the target files in this batch.
4. **Visual specification** already agreed for a finished section and missing from `docs/design/design.md`: add it to `design.md` (additions only; existing text unchanged). If it is already in `design.md` or in the code, delete it from the board.
5. **Undecided matter:** stays under Open decisions, compressed.
6. **Evidence** still needed by an open item: stays under Evidence, compressed; otherwise delete.
7. **Deferred idea:** stays under Deferred ideas.
8. **Superseded or obsolete** (for example "External design skills, background", "Conclusion: design input" of 2026-10-07, the 2026-10-04 browser pass status once its open rows are in the backlog): delete.
9. The harness round (H2 direction, its evidence, the client hook support and the classification statistics) stays on the board: it is the next plan.

**`backlog.md` format:** a short header stating its role (accepted, unscheduled work; one line per item; an item leaves when a batch plan takes it into `context.md`). Items grouped under `##` areas (for example Theme polish: home, product, global; Defects; Browser pass; Readiness, Lighthouse and CI; Harness). Each item is a single list line: `- <item>. Source: <batch or date>. Surface: <files, sections or pages>.` plus the governing decision when there is one.

**Implementation surface:**
- `docs/agent/backlog.md` (new).
- `docs/agent/board.md` (rewrite per the rules above; `Last updated` set).
- `AGENTS.md`, section "Record-layer checks" only, and the words naming the record files in Batch SOP steps 1, 2, 3 and 9 where they must mention `backlog.md` or "Pending migration". `CLAUDE.md` is a symlink to it; do not edit it separately.
- `docs/design/design.md` (additions only, rule 4).
- `docs/agent/context.md` (Progress).
- Not in the surface: `docs/project.md`, `docs/references/**`, `.agents/**`, client adapters, `package.json`, workflows, any theme file.

**Acceptance checks:**
1. `git diff --name-only` lists only files of the surface.
2. `docs/agent/backlog.md` exists; every list item under its `##` areas is one line and contains `Source:` (count of item lines equals count of lines containing `Source:`).
3. `docs/agent/board.md` has no completion records: `grep -nE 'Done:|\*\*Done|done \(' docs/agent/board.md` returns nothing; it has a "Pending migration" section whose every line names a target file.
4. Nothing is lost: Progress holds a mapping table from every top-level heading or bold lead of the pre-cleanup board (`git show <pre-H1>:docs/agent/board.md`, where `<pre-H1>` is the last commit before execution starts, recorded first in Progress) to its destination (backlog area, Pending migration, `design.md`, kept on board, or deleted with the rule number). The verifier samples at least ten rows against the files.
5. `docs/design/design.md`: `git diff --numstat` shows 0 deleted lines.
6. `AGENTS.md`: the diff touches only "Record-layer checks" and the named record-file words in the Batch SOP; it names `backlog.md`, its one-line format, and the bundled approval of "Pending migration".
7. Board word count before and after recorded in Progress (the after value is the H2 ratchet baseline).
7a. Step 0: the board's harness round evidence holds a transcript statistics bullet for the other machine (machine, session counts, date range), or Progress records that no usable transcripts were found; the "Deferred" lines no longer list these statistics.
8. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; Markdown link and syntax check of the changed files (headings, lists, backticks render).

**Review tier:** Ask (changes `AGENTS.md`, an agent rule). The coordinator hands the user a verifier prompt (`.agents/roles/verifier.md` template) to run in a separate session, preferably another client or model; the batch is complete only on PASS.

**Next (board):** H2, hooks and checks (Claude Code only).

## Progress

- Step 0 done (coordinator, 2026-10-20, home machine): 19 Claude coordinator sessions counted; Codex has only guardian-review threads for this repository, none counted. Result added to the board's harness round evidence.
- Authorized (user, 2026-10-20). Execution handed to an external implementer by prompt (user: a large batch goes to an execution prompt), so review stays Ask with a separate verifier.
- **`<pre-H1>`:** `0a5fd1d` plus the uncommitted step-0 edits to `board.md` and `context.md` (the step-0 evidence bullet and the two "Deferred" wording changes). The mapping table reads the working-tree board as it stood before the cleanup; for every other line `git show 0a5fd1d:docs/agent/board.md` is identical. Board size before: 10,866 words and 359 lines (`0a5fd1d` board plus the step-0 bullet, reconstructed by the verifier, 2026-10-20; the earlier 11,000 / 365 also counted the step-0 wording edits and was rounded).
- **Coordinator draft, done:** `docs/agent/backlog.md` written (areas: Theme polish home, product, global; Later batches; Defects; Browser pass; Readiness, Lighthouse and CI; Harness). The implementer checks it against the board, completes or corrects it, and owns it from here.
- **Coordinator classification notes, for the implementer (not yet applied to the board):**
    - Rule 1 / 8, delete: "Work now: the theme track" (already in `docs/project.md` Status); "Framework track, how it ended"; "Product page done rough"; "Polish pass, first step" (done; its open adoption question stays as one Open decisions line); "Order after 6-D2" (done parts; open parts are in the backlog); "Done: 6-C6" (its lesson goes to Pending migration); "Motion simplification done" and "Home `slides-show` redesigned" (open parts in the backlog); the cleanup survey (open parts in the backlog; the `ritual-steps` both-instances decision is in the templates); "External design skills, background"; "Conclusion: design input"; the 2026-10-04 browser pass status (rows in the backlog); "Filed for the product page (6-C6)" (6-P6 made buy it now an outlined secondary button); the Deferred idea "CSS craft" (`design.md` now exists); the `design.md` format and "CSS layers" bullets (embodied in `design.md`).
    - Rule 4: no `design.md` additions found. The section specifications (6-S1 to 6-S12) are in code; their open items are in the backlog; their patterns and lessons go to Pending migration.
    - Rule 3, Pending migration, proposed targets: `motion-architecture.md` (overlays follow `prefers-reduced-motion` only, partly present; the motion gate `body:not([data-motion-enabled='false'])`; GSAP sections load one viewport ahead through their own observer); `abstraction-boundaries.md` (the carousel indicator exception to the third-consumer threshold; decorative full-bleed shapes in the frame's `background` slot); `css-architecture.md` (CSS readiness definition with hard requirements vs open choices; the 6-C6 unlayered-stylesheet lesson; never `container-page` on a custom grid; sticky child needs a stretched parent; heading tiers on `h*` only and uppercase from a section rule; percentage margins resolve against width; inactive content hidden with CSS visibility under the layout media query, not JS `inert`); `image-display-contract.md` (pass `position` whenever the layout needs an anchor); `javascript-runtime.md` (own loader over Async Alpine; vendored libraries upgraded only for a library bug); `launch-gate.md` (no computed-style tool, the 6-R3 comparison recipe; browser sweep environment: password from `.env`, never printed, restart `shopify theme dev`); `AGENTS.md` (audit practice and per-CSS-batch checks; Gotchas: `inline_richtext` rejects `<br>` and a rejected template blocks the whole upload, Theme Editor saves are not written back without `--theme-editor-sync`; `main` fixes through a `fix/` branch and pull request; plan numeric targets against the section's real container); `docs/project.md` (the motion-settings list correction; design workflow of 2026-10-04; design source of 2026-10-08; design input and "we replace the designer" of 2026-10-11); `.agents/skills/check-theme-architecture/SKILL.md` (known colour-lint regex limitation). Already migrated, so delete: the rem 10px pattern (`css-architecture.md`), the screenshot-width rule (`design.md` Do's, `AGENTS.md` Sources).
    - Stay on the board: the harness round (rule 9); Open decisions "Gap found in 6-P1" (raw spacing in stylesheets) and `impeccable` adoption; Evidence: the `impeccable` critique, compressed; Deferred ideas: `test:layout` in CI, base scales and design pipeline (Stitch), platform-agnostic skill, section cleanup sweep (with the keep list: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons), looping media video, scroll narrative (compressed), DesignSync, the three carried items.

### H1 implementation (2026-10-20)

- Rewrote `docs/agent/board.md` (Open decisions, Pending migration, Evidence, Deferred ideas, Harness round); header names `backlog.md`.
- Verified `docs/agent/backlog.md` against the pre-cleanup board; added one Defects line (`docs/project.md` motion settings); fixed header so `Source:` line count matches list items (51 each).
- Updated `AGENTS.md` Record-layer checks and Batch SOP steps 1, 2, 3, 9 only.
- No `docs/design/design.md` edits (rule 4: coordinator found none).

**Coordinator review (2026-10-20):** structure and checks hold; `wc -w docs/agent/board.md` confirms 1605. Two corrections by the coordinator: the `docs/project.md` motion-settings line removed from `backlog.md` Defects (it is a rule-3 item, already under Pending migration; backlog now 50 item lines, 50 with `Source:`); `AGENTS.md` step 9 reworded so it no longer says to migrate contracts per batch, which contradicted the bundled end-of-stage approval. Verifier: Ask tier, pending.

**Verifier round 1 (external session, 2026-10-20): FAIL**, mechanical checks passed; semantic findings fixed by the coordinator:
1. Undecided matters filed as backlog work → moved to board Open decisions under "Polish design choices": serif heading face, hero CTA underline, product page add to cart, section heights, `badge_*` retirement (removed from `backlog.md`).
2. Duplicates → the 6-T4 CI line removed (Deferred `test:layout` in CI covers it; Lighthouse is already in CI); the iPad browser-pass line merged into the home tablet-width and hover lines; `slides-show` native reduced motion named in the per-section browser checks.
3. Already-migrated rules removed from Pending migration: `motion_enabled` scope and overlays (`motion-architecture.md`, Merchant motion settings), the image `position` line (`image-display-contract.md`), the screenshot and design widths (`AGENTS.md` Sources, `design.md`), "we replace the designer" (`docs/project.md` Accepted direction). Kept: the CSS gate selector `body:not([data-motion-enabled='false'])`, not in the target.
4. Stale evidence → before size, the Open-defects mapping row and the backlog count row corrected.
5. The `editorial-collage` settled radius choice removed from `backlog.md` (no work; its live checks are in Browser pass).
After: backlog 42 item lines, 42 with `Source:`; board 1688 words (`wc -w`), superseded by round 2 below.

**Board word count after:** see the latest review round (`wc -w docs/agent/board.md`); that value is the H2 ratchet baseline. The implementer's first count was 1605.

**Deviations from coordinator notes:** Split **Batch SOP always-on** into its own Open decisions line (still undecided; was nested under harness). Moved **test:layout in CI** to Deferred ideas only (was also nested under Open decisions on the pre-cleanup board). Bundled screenshot-width rule conflicts into the `AGENTS.md` Pending migration line (coordinator listed motion-architecture separately for overlay/motion gate only).

### Pre-cleanup board → destination mapping

| Pre-cleanup heading or lead | Destination |
| --- | --- |
| `## Open decisions` | Restructured (see rows below) |
| **Work now: the theme track** | Deleted, rule 1/8 (`docs/project.md` Status) |
| **Framework track, how it ended** | Deleted, rule 1 |
| **Deferred: `test:layout` in CI** | `board.md` Deferred ideas |
| **Product page done rough** | Deleted, rule 1 |
| **Harness round before the polish** | `board.md` Harness round; the Batch SOP always-on question → `board.md` Open decisions |
| **Polish notes from 6-P1–6-P7** | `backlog.md` Theme polish (product, global); not-yet-seen live checks → `backlog.md` Browser pass (per-section checks); Theme Editor saves without `--theme-editor-sync` → Pending migration (`AGENTS.md` Gotchas); serif face → `board.md` Open decisions (Polish design choices) |
| **Gap found in 6-P1** | `board.md` Open decisions |
| **Evidence: `impeccable` critique** | `board.md` Evidence (compressed) + Open decisions (adoption) |
| **Polish pass, first step** | Deleted, rule 1; adoption → Open decisions |
| **Open defects and leftovers** | `backlog.md` Defects (pagination, loading indicator); plain dropdown → `backlog.md` Browser pass; the `docs/project.md` motion-settings item → Pending migration (`docs/project.md`); product page add to cart → `board.md` Open decisions |
| **Consolidated browser pass** | `backlog.md` Browser pass |
| **Lighthouse and CI** | `backlog.md` Readiness, Lighthouse and CI; app and secrets removal → `board.md` Open decisions; development themes → Deferred ideas; branch-protection `fix/` rule → Pending migration (`AGENTS.md`); branch-protection facts deleted, rule 6 (in `.github/rulesets/main.json` and `docs/project.md` Status) |
| **Decisions that still apply** | Rule conflicts: carousel indicator exception → Pending migration (`abstraction-boundaries.md`), motion and width parts deleted, rule 3 (already in their targets); submission rule → Pending migration (`docs/project.md`); 6-T3 checklist → `backlog.md` Readiness; no computed-style tool → Pending migration (`launch-gate.md`) |
| **Decided: order after 6-D2** | Completed parts (6-R1, 6-R2, 6-V5, 6-A1, 6-D3, font families) deleted, rule 1; open parts → `backlog.md` Theme polish: home (collection tab bar, mobile rails), Theme polish: global (migration ratchets and raw radii, monospace italic font role), Readiness (layout baseline to 0); the 6-T4 `test:layout` CI remainder → `board.md` Deferred ideas |
| **Layout check baseline** | `backlog.md` Readiness (debt, unconfirmed entries) and Theme polish: home (rails) |
| **External design skills, background** | Deleted, rule 8 |
| **Known limitation (6-V3 colour lints)** | Pending migration → `check-theme-architecture/SKILL.md` |
| **Filed for the product page (6-C6 buy button)** | Deleted, rule 8 (6-P6) |
| **Done: 6-C6 stylesheet ownership** | Pending migration → `css-architecture.md` (lesson); rest deleted, rule 1 |
| **Decided: audit practice** | Pending migration → `AGENTS.md`; consolidation → `backlog.md` Readiness |
| **Decided: CSS readiness definition** | Pending migration → `css-architecture.md` |
| **Decided: design source** | Intent-not-values rule → Pending migration (`docs/project.md`); design production and base scales → `board.md` Deferred ideas (base scales and design pipeline) |
| **Conclusion: design input** | Deleted, rule 8 |
| **design.md format / CSS layers bullets** | Deleted, rule 8 (`design.md` exists) |
| **Decided design input / we replace designer (2026-10-11)** | Design input → Pending migration (`docs/project.md`); "we replace the designer" deleted, rule 3 (already in `docs/project.md`) |
| **Cleanup survey** | `backlog.md` global (six sections); keep list → Deferred section cleanup; both `ritual-steps` instances deleted, rule 4 (embodied in `templates/index.json`) |
| **Motion simplification done** | Completed part (6-M1, GSAP arrival in 6-S5) deleted, rule 1; follow-ups → `backlog.md` Theme polish: global (motion reveal rewrite, carousel clipping) |
| **Home `slides-show` redesigned** | Completed part (6-S1) deleted, rule 1; open checks → `backlog.md` Browser pass (per-section checks) |
| **Design workflow (2026-10-04)** | Pending migration → `docs/project.md` |
| **Design specification (6-S1–6-S12)** | Deleted, rule 4 (in code); patterns → Pending migration; open items → `backlog.md` Theme polish: home (sage backgrounds, badge colours, section items), Theme polish: global (font role), Browser pass (per-section checks), Later batches (card surface, shared carousel indicator); hero CTA underline and `badge_*` → `board.md` Open decisions |
| **Home polish pass (2026-10-05)** | `backlog.md` Theme polish: home and global; testimonial native reduced-motion check → `backlog.md` Browser pass (per-section checks); hero CTA underline and serif face → `board.md` Open decisions |
| **Design phase inputs** | `backlog.md` Theme polish: global; section heights → `board.md` Open decisions |
| **Card surface and depth** | `backlog.md` Later batches; product-card depth → `board.md` Open decisions |
| **Shared carousel controls** | `backlog.md` Later batches |
| `## Evidence` | Restructured |
| **Browser pass status (2026-10-04)** | Deleted, rule 8; rows → `backlog.md` Browser pass |
| **Final browser pass, scroll-linked** | `backlog.md` Browser pass |
| **Final browser pass, tablet widths** | `backlog.md` Theme polish: home (tablet widths and hover lines, iPad check merged) |
| **Browser sweep environment** | Pending migration → `launch-gate.md` |
| **Layout harness candidate** | `board.md` Open decisions (layout harness page-margin rule) |
| `## Deferred ideas` | `board.md` Deferred ideas, except: CSS craft deleted (rule 8); from the scroll-narrative paragraph, the loader choice and the vendored-library upgrade rule → Pending migration (`javascript-runtime.md`) |
| **CSS craft** | Deleted, rule 8 |

### Validation (2026-10-20)

| Check | Command | Result |
| --- | --- | --- |
| Surface-only diff | `git diff --name-only` (+ untracked `docs/agent/backlog.md`) | `AGENTS.md`, `docs/agent/board.md`, `docs/agent/context.md`; `?? docs/agent/backlog.md` |
| Backlog item vs Source count | PowerShell `Select-String` on `^- ` and `Source:` | 51 = 51 at implementation; 42 = 42 after round 1; 39 = 39 after round 2 |
| No completion records on board | `grep -nE 'Done:\|\*\*Done\|done \(' docs/agent/board.md` | no matches |
| `design.md` additions only | `git diff --numstat docs/design/design.md` | empty (0 changes) |
| Doc paths | `npm.cmd run lint:doc-paths` | pass |
| Agent doctor | `npm.cmd run doctor:agent` | exit 0 |
| Prettier | `npx prettier --check` on changed markdown | pass |

**Unverified (implementer, before review):** Markdown rendering spot-check only (structure: headings, lists, backticks present; no browser preview).

**Risks:** Pending migration lines compress long board text; verifier should sample `git show 0a5fd1d:docs/agent/board.md` against targets. The H2 ratchet baseline is the final count recorded in the latest review round.

**Verifier round 2 (external session, 2026-10-20): FAIL**, mechanical checks and the round-1 moves passed; findings fixed by the coordinator:
1. Undecided or non-work lines left `backlog.md`: product-card hover depth → board Open decisions (Polish design choices); Lighthouse CI app and secrets removal → board Open decisions; development themes left as is → Deferred ideas; the submission rule → Pending migration (`docs/project.md`); the layout harness page-margin question → board Open decisions (the backlog Harness area is now empty and removed).
2. Mapping rows updated for every moved item (polish notes, Lighthouse and CI, decisions that still apply, layout baseline, design input, design specification, design phase inputs, card surface, tablet widths, layout harness).
3. One board count: the earlier 1605 and 1688 values are superseded; the final count is below.
After: backlog 39 item lines, 39 with `Source:`; board 1865 words (`wc -w docs/agent/board.md`) = **H2 ratchet baseline**.

**Verifier round 4 (external session, 2026-10-20): FAIL** on check 4 only (five composite mapping rows incomplete: polish notes 6-P1 to 6-P7, design source, cleanup survey, home polish pass, Deferred ideas). Rows corrected by the coordinator; all other checks passed.

**Verifier round 5 (external session, 2026-10-20): FAIL** on check 4 only (order after 6-D2 and design specification named no backlog areas; motion simplification and `slides-show` omitted their rule-1 deletions). The coordinator corrected those four rows and, unasked, the Lighthouse and CI row (branch-protection facts).

**Verifier round 6 (external session, 2026-10-20): FAIL** on check 4 only: two deletion clauses (decisions that still apply; design input) named no rule. Both now name rule 3.

**Verifier round 7 (external session, 2026-10-20): PASS**, no findings; all acceptance checks 1-8 and 7a proven with fresh evidence (78 pre-cleanup leads against 43 mapping rows; board 1865 words; backlog 39/39).

**Restore note (coordinator, 2026-10-20):** a coordinator script in round 2 truncated Progress after the round-1 note (mapping table, validation table, risks). Restored from the Claude Code file history (state after round 1) with the round-2 edits re-applied; found by verifier round 3.
