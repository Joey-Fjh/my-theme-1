# Work Board

The board is where work is discussed, researched and planned before it becomes a plan. Each topic carries its evidence, options and current leaning, and a status line (`discussing` or `awaiting user`, with the dates it was opened and last updated). When the user decides, the topic leaves the board in that change: into a plan in `docs/agent/context.md`, one line in `docs/agent/backlog.md`, a line under Pending migration, or deletion. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-23.

## Topics

None open. (Closed 2026-10-23 with no change, judged against official best practice: Stop hook scope, since the whole-worktree scan is the documented practice and parallel writers use separate worktrees; `mixed-element`, since B4's final commit displaced no CSS, the `:where(.own-class)` route exists, and the ban matches the unlayered section stylesheets; the `AGENTS.md` pass, see Deferred ideas. Evidence: git history of this file.)

## Pending migration

- **Review leftovers: defects to the backlog, notes stay notes** (target `AGENTS.md`, Batch SOP step 7; user, 2026-10-21, narrowed 2026-10-23): a defect a batch does not fix leaves the batch as one `backlog.md` line in the matching section; a review note becomes a backlog line only when the user names it. The board gets only a choice the user can make now. Design choices wait in the polish sections of `backlog.md`.

## Deferred ideas

- **`AGENTS.md` pass** (user, 2026-10-23): not now. The file is 173 lines (official target: under 200) and about 5.4k tokens; moving the sections needed only sometimes (Agent Adapters, Audit practice) saves about 550 tokens per session for 1.5 hours plus a review. Revisit on a real signal: a rule repeatedly ignored, or the file passing 200 lines; then handle that rule or section only.
- **Section cleanup sweep** (user, 2026-10-05): after the design phase, review unused sections in one batch. Keep: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons in `snippets/social-icons.liquid`.
- **Looping media video** (user, 2026-10-05): viewport-triggered play on `snippets/media-video.liquid` when a design needs it; WCAG 2.2.2 pause still required.
- **Home scroll narrative** (user, 2026-09-30): GSAP ScrollTrigger sections on demand via section modules; Three.js closed (2026-10-08). Constraints: motion reference classifies choreography; first frame in Liquid; `motion_enabled` and reduced motion; no full-page library load.
- **Lighthouse CI development themes** (user, 2026-10-13): the action never deletes its development theme (its cleanup tests a variable it never sets); left as is, revisit only if the leftovers cause a problem (then delete the run's own theme, not all development themes).
- **Carried (2026-10-13):** root size 62.5% has no primary-source endorsement with Tailwind; px body tokens ignore the user's default font size; revisit with the type token batch.

Harness history: H1 to H5 closed 2026-10-21 (`d31acef`, `aa14969`, `3503596`, `69151ad`, `b5a5ae1`); their discussion and evidence: `git show 69151ad:docs/agent/board.md`. H8 topic board (`3564715`); H9 plan and review weight (`704bc35`).
