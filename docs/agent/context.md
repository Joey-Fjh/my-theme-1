# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-20.

## Batch H1: record layer (backlog file, record rules, board cleanup)

**Status:** planned (2026-10-20). Not authorized. Execution expected on the user's other machine after this plan and the board are committed and pushed.

**Outcome.** Accepted-but-unscheduled work has its own file, `docs/agent/backlog.md`, one line per item. `AGENTS.md` describes the record layer that way. The board holds only undecided matters, live evidence, rule decisions pending migration, and deferred ideas, and shrinks from about 9,600 words to a size that becomes the ratchet baseline for the `Stop` checks in H2.

**Decisions (user, 2026-10-20; discussion on the board):**
- A new `docs/agent/backlog.md`, not `todo` (collides with the session to-do tool and `TODO` comments).
- No decision log. A settled decision goes to its owner: a rule that binds agents waits on the board under "Pending migration" and is approved in one bundle at the end of a stage (not per batch); a decision about one piece of work sits on that work's `backlog.md` line and ends with it; history stays in Git.
- No fixed board word cap: the size after this cleanup is the ratchet baseline (2,500 words was the coordinator's estimate, not a standard).
- The Batch SOP section stays always-on in this batch; moving it to read-on-demand is a separate user decision.

**Dependencies:** the user authorizes the batch. Nothing else.

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
8. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; Markdown link and syntax check of the changed files (headings, lists, backticks render).

**Review tier:** Ask (changes `AGENTS.md`, an agent rule). The coordinator hands the user a verifier prompt (`.agents/roles/verifier.md` template) to run in a separate session, preferably another client or model; the batch is complete only on PASS.

**Next (board):** H2, hooks and checks (Claude Code only).

## Progress

Not started.
