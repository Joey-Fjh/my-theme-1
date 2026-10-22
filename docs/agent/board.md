# Work Board

The board is where work is discussed, researched and planned before it becomes a plan. Each topic carries its evidence, options and current leaning, and a status line (`discussing` or `awaiting user`, with the dates it was opened and last updated). When the user decides, the topic leaves the board in that change: into a plan in `docs/agent/context.md`, one line in `docs/agent/backlog.md`, a line under Pending migration, or deletion. Recording a plan does not authorize implementation. Project identity, scope, accepted direction, and overall status belong in `docs/project.md`; completed execution history belongs in Git.

Last updated: 2026-10-23.

## Topics

### Plan and review weight by the size of the change

Status: awaiting user · Opened: 2026-10-23 · Updated: 2026-10-23

Every change runs the full Batch SOP (plan, authorization, tier, records), and any Liquid change is Ask tier with a separate-session review. B4 ended at 42 source lines after about two hours, mostly measurement and correction rounds. Claude Code best practices: planning "adds overhead"; "if you could describe the diff in one sentence, skip the plan". Birgitta Böckeler on spec-driven tools (martinfowler.com): heavy process on a small bug is "a sledgehammer to crack a nut". Kept by the user: execution prompts and separate reviews for token cost. Open: whether, and by what line, a small change takes a lighter path. Second opinion (separate session, 2026-10-23): draw the line by risk and uncertainty, not line count (a small cart condition can matter); one procedure with variable detail; routine plans state outcome, permitted files, checks, review boundary and a time limit; every plan adds an estimate and a stop-and-reassess point. Coordinator agrees.

### Review findings bar

Status: discussing · Opened: 2026-10-23 · Updated: 2026-10-23

H1 took 7 review rounds, H7 8, B4 two correction rounds driven by a bar that counted cosmetic extremes. Claude Code best practices: a reviewer asked for gaps "will usually report some"; "chasing every finding leads to over-engineering"; flag only gaps that affect correctness or the stated requirements. Leaning: every plan's bar separates must-fix (function, accessibility, layout, rules) from accepted residue, and review prompts say the rest are notes. Second opinion: put it in the `verifier.md` template, not each plan; FAIL needs evidence of a violated requirement or correctness problem; a correction review checks the correction and its regression surface; default budget one full review plus one correction review, then the user decides; notes do not become backlog lines automatically. Coordinator agrees.

### `AGENTS.md` length

Status: discussing · Opened: 2026-10-23 · Updated: 2026-10-23

172 lines but 2,816 words, loaded every session; the Batch SOP table is the densest part. Claude Code best practices: keep it short; for each line ask whether removing it would cause a mistake; a long file makes the model ignore rules; move occasional workflows into skills or linked docs. Next: a line-by-line pass with that question. Second opinion: 2,858 words after H8; density and duplication matter more than line count; keep architecture, merchant protection, authorization, routing and gotchas; move detailed procedure into the existing role files; no new length target. Coordinator agrees.

### Permission allowlist for validators

Status: discussing · Opened: 2026-10-23 · Updated: 2026-10-23

No `permissions` in `.claude/settings.json`; the B4 reviewer asked the user to confirm each validator and the dev server. Claude Code best practices recommend allowlisting safe commands such as `npm run lint`. The verifier roles are read-only in all three clients, while review prompts ask for `build:tw` (writes) and the dev server. Second opinion: keep the reviewer read-only; the implementer builds and starts the server before handoff; preapprove only named, inspected commands per client, never blanket `npm` or `node` (scripts include builds and rewriting formatters). Coordinator agrees (an allowlist alone does not fix the role mismatch).

### Remaining harness friction

Status: discussing · Opened: 2026-10-23 · Updated: 2026-10-23

The Stop hook runs on the shared worktree and reported another session's half-done edit as this session's failure. `lint:theme` `mixed-element` kept B4 rules out of section stylesheets, pushing them into `tailwind.components.css` against stylesheet ownership. Second opinion: `mixed-element` enforces a written rule (`css-architecture.md`), so it is not shown to be a false positive; reconsider the blanket mixing ban rather than move CSS to satisfy it. Stop hook: the fingerprint covers the whole worktree (`core.mjs`); make worktree-wide findings advisory and run one explicit completion check at handoff. Also found: `routes.json` marks every Liquid file Ask while `AGENTS.md` lets stylesheet-only changes be Show. Kept by the user: hooks in all three clients (shared core, thin adapters), CI.

## Pending migration

- **Review leftovers go straight to the backlog** (target `AGENTS.md`, Batch SOP step 7; user, 2026-10-21): a finding a batch does not fix leaves the batch as one `backlog.md` line in the matching section; the board gets only a choice the user can make now. Design choices wait in the polish sections of `backlog.md`.

## Deferred ideas

- **Section cleanup sweep** (user, 2026-10-05): after the design phase, review unused sections in one batch. Keep: `custom-liquid`, `pickup-availability`, `collection-navigation-items`, social icons in `snippets/social-icons.liquid`.
- **Looping media video** (user, 2026-10-05): viewport-triggered play on `snippets/media-video.liquid` when a design needs it; WCAG 2.2.2 pause still required.
- **Home scroll narrative** (user, 2026-09-30): GSAP ScrollTrigger sections on demand via section modules; Three.js closed (2026-10-08). Constraints: motion reference classifies choreography; first frame in Liquid; `motion_enabled` and reduced motion; no full-page library load.
- **Lighthouse CI development themes** (user, 2026-10-13): the action never deletes its development theme (its cleanup tests a variable it never sets); left as is, revisit only if the leftovers cause a problem (then delete the run's own theme, not all development themes).
- **Carried (2026-10-13):** root size 62.5% has no primary-source endorsement with Tailwind; px body tokens ignore the user's default font size; revisit with the type token batch.

Harness history: H1 to H5 closed 2026-10-21 (`d31acef`, `aa14969`, `3503596`, `69151ad`, `b5a5ae1`); their discussion and evidence: `git show 69151ad:docs/agent/board.md`. H8 (this topic board) is in `docs/agent/context.md`.
