# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-23.

## Batch H8: board as a topic board (status and date per topic, no word ratchet)

**Status:** executed by the coordinator (authorized by the user, 2026-10-23); Ask review PASS after round 2 (2026-10-23); not committed (user: hold the commit).

**Why.** The board was designed (2026-09-28, `af05311`) as the place to discuss, research and plan: open decisions with an owner and a deadline, an Evidence section, deferred ideas. H1 (2026-10-20) cleaned a 10,866-word board that had piled up finished records, accepted work and rules, and kept Evidence. H2 then added a shrink-only word ratchet (`records.baseline.json`), and Evidence later disappeared; discussion moved into chat and was lost when a session ended (user, 2026-10-23: items drift and stay unhandled). The ratchet measures size, while the actual failure was decided content not leaving the board.

**Industry practice used (user, 2026-10-23: follow Anthropic or what was found).**
- Anthropic, "Effective harnesses for long-running agents": a status per item (`passes` in `feature_list.json`), a progress log, git; each session starts by reading them and ends in a clean state.
- Architecture decision records: each decision carries a status (proposed, accepted, rejected, superseded); the discussion and rationale live in the proposed record; decided records are not kept open.
- Spec-driven development (Spec Kit, Kiro; Martin Fowler's review): heavy process on small tasks is "a sledgehammer to crack a nut"; the review burden of many Markdown files outweighs it.

**Outcome.**
1. `docs/agent/board.md` holds topics. Each topic is a `###` heading under `## Topics` with one line `Status: <discussing | awaiting user> · Opened: YYYY-MM-DD · Updated: YYYY-MM-DD`, followed by its evidence, options and current leaning. When the user decides, the topic leaves the board in that change: into a plan in `context.md`, one line in `backlog.md`, a line under Pending migration, or deletion. `## Pending migration` and `## Deferred ideas` stay.
2. `lint:records` checks the topic format instead of the board's size: every topic has the status line with an allowed status and valid dates, and `Updated` is not older than `Opened`. The word ratchet and `records.baseline.json` are removed. The existing date and completion-record checks stay.
3. The prompt hook (`core.mjs`, all three clients) adds one line next to the context status: `board: N open topics; oldest updated YYYY-MM-DD (<title>)`, so drift is visible at the start of every session.
4. `AGENTS.md` Batch SOP steps 2 and 3 and Record-layer checks describe the topic board in those terms (no other rule changes).

**Implementation surface.** `docs/agent/board.md` (rewritten in the topic format: the current open decision "Board drift" leaves it into this plan; the harness review becomes a topic), `.agents/tools/harness/record-check.mjs`, `.agents/tools/harness/records.baseline.json` (deleted), `.agents/tools/harness/core.mjs`, `.agents/tools/harness/harness.test.mjs`, `AGENTS.md` (the three places above), `docs/agent/context.md`.

**Out of scope.** Process tiering by task size (an open topic on the new board, for the user to decide); the Stop hook seeing another session's edits; validator friction; rule document length.

**Review tier: Ask** (agent rules and validator wiring).

**Cost.** About 45 minutes for the coordinator in this session (small code change, context already here), plus one separate-session review.

**Acceptance checks.**
1. `npm.cmd run lint:records` passes on the new board and prints no word count or baseline; `records.baseline.json` no longer exists and nothing references it (`git grep records.baseline` empty).
2. `npm.cmd run test:harness` passes, with cases for: a topic without a status line fails; an unknown status fails; `Updated` older than `Opened` fails; a well-formed board passes; the prompt hook prints the topic count and the oldest topic.
3. The prompt hook output in this session shows the board line.
4. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; `npx prettier --check` on the changed files.

**Execution log (2026-10-23).**
- `record-check.mjs`: word count, `records.baseline.json` and `--prune-baseline` removed; `boardTopics()` exported; `checkBoard` fails a topic without the status line, with a status other than `discussing` or `awaiting user`, or with `Updated` older than `Opened`; notes print `board topics: N` and `pending migration lines: N`. `records.baseline.json` deleted (`git rm`).
- `core.mjs`: `planContext` adds `board: N open topics; oldest updated <date> (<title>).` (or `board: no open topics.`); the Stop hook's `prompt:` notice is removed, since only the word ratchet produced it.
- `harness.test.mjs`: `initRepo` writes no baseline; the prune test is replaced by four topic cases (well-formed, no status line, unknown status, dates reversed); the Stop test's word-ratchet case ("loud") is removed with the notice it checked; the prompt test asserts the board line with two topics.
- `board.md` rewritten: five topics (process weight by change size, awaiting user; review findings bar, `AGENTS.md` length, permission allowlist, remaining harness friction, discussing), each with the evidence from 2026-10-23; Pending migration and Deferred ideas kept; the Pending migration line drops "not under Open decisions" (that section no longer exists).
- `AGENTS.md`: Batch SOP steps 2 and 3, Record-layer checks (board line).
- Checks: `npm.cmd run lint:records` pass (`board topics: 5`, `pending migration lines: 1`, no word or baseline line); `npm.cmd run test:harness` pass (19 tests); `lint:doc-paths`, `doctor:agent`, `test:merchant` pass; `npx prettier --check` on the six changed files: all formatted. `git grep records.baseline` hits only this plan's own text. Prompt hook run by hand (`node .claude/claude-hook.mjs prompt` with a Windows `cwd`): prints the plan pointer and `board: 5 open topics; oldest updated 2026-10-23 (Plan and review weight by the size of the change).`

**Ask review round 1 (separate session, 2026-10-23): FAIL, one item.** Topic dates were checked for shape only (`2026-99-99` passed), against outcome 2's "valid dates". Proven: ratchet removal and the other checks unchanged; core change in scope (the ratchet was the only `prompt:` producer); tests; the three `AGENTS.md` places; board content kept; all commands pass; the hook prints the board line. Notes: `git grep records.baseline` hits only this plan's text (acceptance check 1 wording); "Board drift" was an uncommitted board edit, so HEAD shows `None`.

**Fix (coordinator, 2026-10-23).** `record-check.mjs`: `isCalendarDate()` (the parsed date must print back as the same string); a topic with an impossible Opened or Updated fails with "must be real dates". `harness.test.mjs`: case "impossible date" (2026-02-30). `npm.cmd run test:harness` 19 pass, 0 fail; `npm.cmd run lint:records` pass; prettier pass.

**Ask review round 2 (separate session, 2026-10-23): PASS.** The date fix and its test case verified; no other change since round 1.
