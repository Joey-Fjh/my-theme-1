# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-21.

The harness round is closed: Batch H4 (prose slimming and the bundled Pending migration) passed Ask review in round 3; plan, cut table, word counts and review rounds: `git show 69151ad:docs/agent/context.md`. Its first push failed CI on `lint:records` (the record files' `Last updated` predated the commit date); fixed in the commit after it.

## Batch H5: pre-push check (harness follow-up)

**Status:** executed and reviewed (2026-10-21): Ask review PASS in round 3.

**Outcome.** A `git push` run by Claude Code is denied when the record checks fail or the commits being pushed have whitespace errors, so CI no longer goes red on what the `Stop` hook only sees after the turn (the first H4 push failed CI on stale `Last updated` dates).

**Authorization:** user, 2026-10-21 ("那就把做的就做了吧"), after the coordinator's harness assessment: item 1 (pre-push check) with item 2 folded in (`git diff --check`), and item 4 (a memory note). Not done, by the user's choice of scope: slimming `css-architecture.md`, CI action and runner upgrades.

**Surface:** `.agents/tools/harness/hook.mjs` (`prePushFailures`, a `deny` on `git push` in the `pre` handler), `.agents/tools/harness/harness.test.mjs` (three tests: the pre-push denial, push-form detection, git-failure fail-open), records. Also in this working tree, outside H5: the `design.md` Motion sentence (autoplay is controlled by each section's setting and reduced motion, not `motion_enabled`; user, 2026-10-21) and the matching backlog defect removed (Show tier).

**Acceptance checks:**
1. `npm.cmd run test:harness` passes, including the new test: a clean push passes; a pushed commit with a trailing-space line is denied naming `git diff --check`; a board completion record is denied naming it.
2. `npm.cmd run test:validators`, `npm.cmd run lint:records`, `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent` pass; `git diff --check` clean.
3. The hook fails open on errors and adds no work to commands other than `git push`.
4. After commit, the push itself goes through the new check, and CI is green (public API).

**Review tier:** Ask (validator wiring). External verifier, then commit and push.

## Progress

- Implemented: `npm.cmd run test:harness` 8 pass 0 fail.
- **Verifier round 1 (external session, 2026-10-21): FAIL.** Findings and coordinator fixes: (1) push detection was a regex (`git -C dir push`, `git.exe push`, `git --no-pager push` slipped through; `echo git push` was caught); now `runsGitPush` parses command segments: the program is `git` or `git.exe` (quoted paths with spaces included), global options are skipped (`-C`, `-c`, `--git-dir`, `--work-tree`, `--namespace` take a value), and the subcommand must be `push`; tested with push forms and look-alikes (counts in the round-2 note). (2) a git failure in `git diff --check` (fatal, no report) denied the push; now only a non-empty whitespace report blocks; tested with an upstream ref pointing at a missing object. After: `npm.cmd run test:harness` 10 pass 0 fail; `npm.cmd run test:validators` exit 0. (The coordinator used `sed -i` once on `harness.test.mjs`, against the standing rule; no effect outside `.agents/`.)
- **Verifier round 2 (external session, 2026-10-21): FAIL.** Findings and coordinator fixes: (1) a quoted `-C` value (`git -C "dir with space" push`) split on its space and slipped through; push detection now tokenizes the whole segment with quoted spans kept whole (`shellWords`), covering quoted program paths and quoted option values alike. The test has 14 push forms (including both quote styles for `-C`, `git -c x=y -C "C:\My Repo" push`, `& git push`) and 5 look-alikes. (2) Stale counts in this record corrected (three tests added, not one). After: `npm.cmd run test:harness` 10 pass 0 fail; `npm.cmd run test:validators` exit 0.
- **Verifier round 3 (external session, 2026-10-21): PASS**, no findings.
