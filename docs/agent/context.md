# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-23.

## Batch H9: plan and review weight (estimate, checkpoint, bar; review budget; reviewer without writes)

**Status:** plan recorded, waiting for the user's authorization. H8 committed as `3564715` (its plan and reviews: `git show 3564715:docs/agent/context.md`).

**Why.** Board topics "Plan and review weight", "Review findings bar" and "Permission allowlist", plus the tier mismatch in "Remaining harness friction" (2026-10-23), with an independent second opinion on each (`git show 3564715:docs/agent/board.md`). User (2026-10-23): do items 1 to 5; make sure the findings fit this project's own rules and the same problems do not come back. `AGENTS.md` pruning and the Stop hook scope are later (`backlog.md`, Harness).

**Project principles kept (user, 2026-10-23).** Best practices are evidence, not authority; where one conflicts with these, the principle wins, and a change that conflicts with one is must-fix:
1. A team-style workflow: discuss and research on the board, plan in `context.md`, explicit user authorization, execution, review, commit.
2. The user owns the harness; agents propose and wait.
3. When a mistake recurs, a computational check (script or hook) before prose.
4. Execution prompts and separate-session reviews, for token cost.
5. One writer per worktree.
6. Records live in the repository, not only in chat; history lives in Git.
7. Merchant configuration and content are protected.
8. Shopify's official sources are authority; references and best practices are experience.
9. Browser checks are consolidated; commits are grouped.
The theme's technical rules (`AGENTS.md` Tech Stack, Hard implementation rules) are outside this batch. Not adopted from the second opinion: "a direct user request counts as authorization" (conflicts with 1).

**Estimate:** about 2.5 hours of coordinator time in this session, plus one separate-session review.
**Checkpoint:** after the templates, the `AGENTS.md` lines and the plan-field check (about 1 hour), stop and report to the user before the client permission configuration, which needs each client's official syntax.
**Bar:** must-fix: a prevention row below without its change, a conflict with an existing project rule (merchant protection, Ask triggers, execution prompts and separate reviews kept by the user), a failing validator, or a permission entry that allows a command which writes outside ignored temp output. Accepted residue: wording preferences; clients without a documented project-level permission mechanism (documented in `README.md` instead).

**Outcome.**
1. **Plan fields.** Every plan in `context.md` carries `**Estimate:**`, `**Checkpoint:**` (where the implementer stops and reports) and `**Bar:**` (must-fix versus accepted residue, and the input it is judged on, such as default settings). Detail scales with risk and uncertainty, not line count: a routine plan may be just outcome, surface, checks, review tier, estimate, checkpoint and bar. `lint:records` fails a `## Batch` plan without the three fields (extends the existing `checkContext`; no new tool).
2. **Before a plan (Batch SOP step 2).** The coordinator gives the scope options with an estimate and expected payoff, and the user picks.
3. **Implementer template.** One status line per task; stop and report at the checkpoint and whenever a fix needs a method the plan does not name; no files outside the repository and no long-running processes left behind without telling the user; before handoff, build generated output and start the dev server the review needs.
4. **Verifier template and checklist.** FAIL needs evidence of a violated requirement, rule or correctness problem; the rest are notes; an unfixed defect becomes one `backlog.md` line, a note only when the user names it (board Pending migration, narrowed 2026-10-23). A correction review checks the correction and its regression surface. Budget: one full review plus one correction review; after that, open defects go to the user, who decides (the budget never turns FAIL into PASS). No writes: no builds, formatters or server starts; one status line per item; ask before widening the checks.
5. **Hook tier computed like the rule (principle 3).** For a Liquid file whose changed lines all fall inside its `{% stylesheet %}` block, the hook suggests Show, as `AGENTS.md` review tiers already allow; any other Liquid change stays Ask. The plan's tier still decides, and may only be raised.
6. **Named commands preapproved.** Read-only validators whose effects are inspected (script by script) are preapproved per client through its documented project-level mechanism; never blanket `npm`, `node` or shell. Builds, formatters, `shopify` commands and `test:layout` stay prompted.

**Prevention map (acceptance: each row names the change that now prevents it).**

| Incident (2026-10-22/23) | Prevented by |
| --- | --- |
| B4 started theme-wide without cost options | Outcome 2; Estimate field (outcome 1) |
| B4 bar "0 cuts at settings maxima" drove reserves and a regression | Bar field (outcome 1); verifier FAIL rule (outcome 4) |
| Executor kept adding padding for about an hour | Checkpoint field; implementer stop rule (outcome 3) |
| Audit scripts created outside the repo without the user knowing | Implementer and verifier no-files rule (outcomes 3, 4) |
| Reviewer prompted for every command; read-only role asked to build and start a server | Implementer prepares build and server (outcome 3); verifier no-writes (outcome 4); preapproval (outcome 6) |
| H1 7 rounds, H7 8 rounds, B4 correction rounds | Review budget and correction scope (outcome 4) |
| Hook reported Ask where the rule allows Show | Outcome 5 (new harness test: stylesheet-only diff gives Show, markup diff gives Ask) |
| Board discussion lost between sessions | Done in H8 |
| Stop hook blocks on another session's edits | Not prevented here: `backlog.md`, Harness (later) |

**Implementation surface.** `AGENTS.md` (Batch SOP steps 2, 3, 5, 7 wording and the review tier note on hook hints), `.agents/roles/implementer.md`, `.agents/roles/verifier.md`, `.agents/tools/harness/record-check.mjs`, `.agents/tools/harness/core.mjs` (stylesheet-only tier), `.agents/tools/harness/routes.json` if the route needs a flag, `.agents/tools/harness/harness.test.mjs`, client permission configuration (`.claude/settings.json`, and Cursor and Codex project files only where their official docs define one), `README.md` (setup note for any client without a project-level mechanism), `docs/agent/board.md`, `docs/agent/backlog.md`, `docs/agent/context.md`.

**Review tier: Ask** (agent rules and validator wiring). The review prompt uses the new verifier template.

**Acceptance checks.**
1. Each prevention row maps to a changed line, quoted with its file in the execution log.
2. No conflict with the project principles above: merchant paths still ask or deny in all three clients (`npm.cmd run test:harness`, `npm.cmd run test:merchant`); Ask triggers, explicit authorization (step 4), execution prompts and separate reviews unchanged; the reviewer checks each changed rule line against the nine principles.
3. `lint:records` fails a `## Batch` plan missing any of `**Estimate:**`, `**Checkpoint:**`, `**Bar:**` (new harness test cases) and passes this plan.
4. Every preapproved command is listed in the execution log with what it writes (none, or ignored temp output) and the source of the client syntax.
5. `npm.cmd run test:harness`, `lint:records`, `lint:doc-paths`, `doctor:agent`, `test:merchant` pass; `npx prettier --check` on the changed files.

**Execution log.** Not started.
