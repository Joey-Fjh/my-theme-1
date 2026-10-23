# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-23.

## Batch H9: plan and review weight (estimate, checkpoint, bar; review budget; reviewer without writes)

**Status:** authorized by the user 2026-10-23; executed and reviewed (review 2 PASS, 2026-10-23); waiting for the user to commit. No browser pass needed. H8 committed as `3564715` (its plan and reviews: `git show 3564715:docs/agent/context.md`).

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

**Execution log.**

- Outcome 1, done: `AGENTS.md` step 3 names the three fields; `record-check.mjs` `checkContext` fails a plan missing `**Estimate:**`, `**Checkpoint:**` or `**Bar:**` (or with an empty one); test "context plans need estimate, checkpoint and bar fields" (4 cases); the shared fixture `PLAN_BODY` carries the fields.
- Outcome 2, done: `AGENTS.md` step 2 "Before a plan, give the scope options, each with an estimate and its expected payoff; the user picks."
- Outcome 3, done: `implementer.md` Working method (status line, checkpoint stop, no outside files or leftover processes, build and dev server before handoff) and the same items in Task template step 3; `AGENTS.md` step 5 "stop and report at the plan's checkpoint and whenever a fix needs a method the plan does not name".
- Outcome 4, done: `verifier.md` checklist (FAIL rule against the Bar, unfixed defect to one backlog line, correction review scope, budget) and Boundaries (write nothing, status lines, ask before widening); review prompt template (no builds, formatters or server starts; full or correction review; FAIL rule); `AGENTS.md` step 7 budget. The Pending migration line "Review leftovers" stays on the board for the end-of-stage bundle (its `AGENTS.md` target is not written by this batch; the verifier template carries the rule now).
- Outcome 5, done before the checkpoint: `routes.json` `liquid` route `"stylesheetTier": "Show"`; `core.mjs` `stylesheetOnly` (every hunk's removed and added lines inside the `{% stylesheet %}` block, file tracked in HEAD) lowers that route to Show in `stopCheck`, tier computed over all matched routes; the post hint reads "Ask (Show when only the {% stylesheet %} block changes)"; `AGENTS.md` review tiers note on the hint. Test "stop hints Show for a stylesheet-only Liquid diff and Ask for a markup diff". `snippets/image.liquid` (`image` route, no flag) stays Ask.
- Outcome 6 (user go-ahead 2026-10-23): preapproved scripts and what they write, from `grep` of each script for file writes and subprocesses: `lint:theme`, `lint:liquid-syntax`, `lint:i18n`, `lint:doc-paths` none; `lint:records`, `lint:merchant` none (read `git log`/`git` only); `lint:compat` none (eslint and stylelint, no `--cache` or `--fix` in `package.json`, `eslint.config.cjs`, `stylelint.config.cjs`); `doctor:agent` none (reports only); `test:harness`, `test:merchant` temporary Git repositories under the system temp directory, removed in `finally`. Not preapproved: builds, formatters, `shopify` commands, `test:layout`, `scan:compat` (runs `build:tw`).
  - Canonical list: `routes.json` `preapproved` (10 scripts).
  - Claude Code: `.claude/settings.json` `permissions.allow`, exact rules `Bash(npm.cmd run <script>)` and `PowerShell(npm.cmd run <script>)` (source: code.claude.com/docs/en/permissions: exact match without `*`; each subcommand of a compound command must match). The agent's edit was denied by the auto-mode classifier as self-modification; **the user added the block** (2026-10-23).
  - Cursor: `.cursor/permissions.json` `terminalAllowlist`, entries `npm.cmd:run <script>` (source: cursor.com/docs/reference/permissions: colon separates base command and argument glob; prefix semantics; the key replaces the in-app allowlist).
  - Codex: `.codex/rules/validators.rules`, one `prefix_rule` with alternatives, `decision = "allow"`, inline `match`/`not_match` (source: learn.chatgpt.com/docs/agent-configuration/rules: project rules load when `.codex/` is trusted; `allow` runs outside the sandbox).
  - Decision path (user, 2026-10-23): first draft committed Claude only; a hook-based approval was proposed and withdrawn as against the board's accepted direction ("preapprove only named, inspected commands per client" through each client's mechanism, `git show 3564715:docs/agent/board.md`); final: native file per client plus a consistency test, after the MCP server-list precedent (`doctor:agent`).
  - Test "preapproved validators are read-only scripts listed alike in every client": the three client lists equal `preapproved`; each script and every npm script it runs has no `--write`, `--fix`, `--cache`, `tailwindcss`, `svgo`, `shopify`, `layout-check` or `build:`; Claude rules are exact `npm.cmd run` rules only.
  - **Unverified:** Cursor's colon parsing and Codex matching on Windows (no `codex` or `cursor-agent` CLI here). Verified at the H9 review if it runs in Cursor or Codex: a listed validator that still prompts is a finding.
  - `README.md` "Preapproved validators" documents the three files and the check.
- User, 2026-10-23, during execution: the backlog line "Private agent memory into the project" was an over-reading of the discussion; removed from `backlog.md`.
- Validation (2026-10-23): `npm.cmd run test:harness` 21 tests, 21 pass; `npm.cmd run lint:records` exit 0 (board topics 0, pending migration lines 1); `npm.cmd run lint:doc-paths` passed; `npm.cmd run doctor:agent` exit 0; `npm.cmd run test:merchant` 18 tests, 18 pass; `npx prettier --check` on the 9 changed files: all formatted.
- **Checkpoint reached** (2026-10-23): reported to the user; user approved outcome 6.
- Validation after outcome 6 (2026-10-23): `npm.cmd run test:harness` 22 tests, 22 pass; `npm.cmd run test:merchant` 18 tests, 18 pass; `lint:records` exit 0; `lint:doc-paths` passed; `doctor:agent` exit 0; `npx prettier --check` on `README.md`, `.claude/settings.json`, `.cursor/permissions.json`, `routes.json`, `harness.test.mjs`, `context.md`: all formatted (`.codex/rules/validators.rules` is not a Prettier language).
- Surface note: `.codex/rules/validators.rules` and `.cursor/permissions.json` are the plan's "Cursor and Codex project files where their official docs define one"; no adapter or `config.toml` change.

**Review 1 (full, Codex, separate session, 2026-10-23): FAIL, three must-fix findings.** Report kept in chat. Passed there: scope, authorization, prevention rows, the nine principles, ordinary stylesheet hunk cases, `snippets/image.liquid` Ask, all named validators; `npm.cmd run lint:records` ran without a prompt in Codex.

**Correction 1 (coordinator, 2026-10-23).**

- F1 (P1) prefix preapproval allows writing arguments (`codex execpolicy check ... -- npm.cmd run lint:theme -- --shrink-migration-baseline` gives allow; `lint-theme.js` `--write-*`/`--shrink-*` baseline flags; `node --test` reporter destination). Same prefix semantics documented for Cursor's `terminalAllowlist`. User chose option A: `.codex/rules/validators.rules` and `.cursor/permissions.json` deleted; Claude Code exact rules kept. The test (renamed "preapproved validators are read-only scripts allowed only by exact rules") now also fails if either file is committed again; `README.md` "Preapproved validators" gives the reason. Accepted residue: in Codex and Cursor the validators may prompt (in Codex's read-only sandbox only `test:harness` and `test:merchant`, which write to system temp).
- F2 (P2) an empty field followed by another line passed: `record-check.mjs` `checkContext` now requires `[ \t]*\S` on the field's own line; two test cases added (empty field before another field, before a paragraph).
- F3 (P2) `config/settings_schema.json` could hint Show: `core.mjs` `stylesheetOnly` returns false for any non-`.liquid` path; the stylesheet test adds a schema whose strings contain the tags and asserts false and "Review tier: Ask."
- Validation (2026-10-23): `npm.cmd run test:harness` 22 tests, 22 pass; `npm.cmd run test:merchant` 18 tests, 18 pass; `lint:doc-paths` passed; `doctor:agent` exit 0; `lint:records` exit 0; `npx prettier --check` on `README.md`, `harness.test.mjs`, `core.mjs`, `record-check.mjs`: all formatted (the reviewer's note stands: `.prettierignore` excludes most of these paths, so this proves `README.md` only).
- Next: one correction review (the last in the budget).

**Review 2 (correction, Codex, separate session, 2026-10-23): PASS.** F1 to F3 resolved; regression surface (post hint, records, merchant guards, scope) passed; `test:harness` 22 pass, `test:merchant` 18 pass, `lint:records`, `lint:doc-paths`, `doctor:agent` exit 0; 11 modified files, none outside the surface. Unproven, accepted as a limitation: live Claude Code permission loading (exact rules and documented semantics verified).
