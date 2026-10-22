# Work Board

This board holds only what is not yet decided: open decisions, evidence that has not become a plan, rules awaiting migration, deferred ideas, and the active harness round. Accepted work that no batch has scheduled yet lives in `docs/agent/backlog.md` (one line per item). `docs/agent/context.md` holds the plan under execution, or no plan; extra plans may coexist only when each is executed and waiting on verification the agent cannot perform (`AGENTS.md`, Record-layer checks). Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-22.

## Open decisions

None.

## Pending migration

- **Review leftovers go straight to the backlog** (target `AGENTS.md`, Batch SOP step 7; user, 2026-10-21): a finding a batch does not fix leaves the batch as one `backlog.md` line in the matching section; the board gets only a choice the user can make now. Design choices wait in the polish sections of `backlog.md`, not under Open decisions.

## Deferred ideas

- **Section cleanup sweep** (user, 2026-10-05): after the design phase, review unused sections in one batch. Keep: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons in `snippets/social-icons.liquid`.
- **Looping media video** (user, 2026-10-05): viewport-triggered play on `snippets/media-video.liquid` when a design needs it; WCAG 2.2.2 pause still required.
- **Home scroll narrative** (user, 2026-09-30): GSAP ScrollTrigger sections on demand via section modules; Three.js closed (2026-10-08). Constraints: motion reference classifies choreography; first frame in Liquid; `motion_enabled` and reduced motion; no full-page library load.
- **Lighthouse CI development themes** (user, 2026-10-13): the action never deletes its development theme (its cleanup tests a variable it never sets); left as is, revisit only if the leftovers cause a problem (then delete the run's own theme, not all development themes).
- **Carried (2026-10-13):** root size 62.5% has no primary-source endorsement with Tailwind; px body tokens ignore the user's default font size; revisit with the type token batch.

## Harness round

Closed 2026-10-21: H1 record layer (`d31acef`), H2 Claude Code hooks and record checks (`aa14969`), H3 CI merchant-path guard (`3503596`), H4 prose slimming and the bundled Pending migration (`69151ad`); follow-up H5 pre-push check (`b5a5ae1`). Discussion, evidence and transcript statistics: `git show 69151ad:docs/agent/board.md`.
