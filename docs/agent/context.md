# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-20.

Previous batch: H1 (record layer), closed with Ask review PASS; record: `git show d31acef:docs/agent/context.md`.

## Batch H2: Claude Code hooks and record checks

**Status:** executed and reviewed (2026-10-20): Ask review PASS in round 5; live check (acceptance 8) done.

**Outcome.** Claude Code sessions in this repository get rule timing from hooks instead of from prose the model may skip: a pointer to the current plan at prompt submit; a confirmation prompt before any subagent spawn and before writes to merchant-owned files (Edit and Write always; shell writes by an advisory heuristic, with CI in H3 as the hard gate); a once-per-session pointer to the validators, review tier and reference for the paths a change touches; and at `Stop`, the record checks plus the fast validators for the changed files. Rule content stays in project files (`routes.json`, the lint scripts); the hook only dispatches.

**Decisions (user, 2026-10-20, board harness round):** Claude Code only; no git hooks; pointers, not skill bodies, once per session; structural record violations block, counts only prompt; the board ratchet baseline is 1865 words (`wc -w`, after H1); `ask` on subagent spawns and on merchant-owned paths.

**Coordinator choices in this plan (the user may change them when authorizing):**
- **Split.** H2 is the Claude Code hooks and the record checks. The CI check for merchant-owned paths with an authorization marker, and replacing the reference copies of `{% doc %}` tables with pointers, become H3 (they do not depend on hooks).
- **One mechanism for confirmations.** `PreToolUse` hooks return `ask` (documented to prompt even in auto mode); path permission rules are not used, because they never see shell writes.
- **No `PostToolUse` per-file lint** in H2. The batch measures one `lint:theme` run and records it; adding it is a later decision.
- **Hook state** (what was already pointed out, the last checked diff) lives in the OS temp directory keyed by project path and `session_id`, so no ignore file changes.

**Facts checked (Claude Code docs through WebFetch, 2026-10-20):** the subagent tool is `Agent`; `PreToolUse` output `hookSpecificOutput.permissionDecision` `allow | deny | ask | defer` with `permissionDecisionReason`; `UserPromptSubmit` and `PostToolUse` take `hookSpecificOutput.additionalContext`; `Stop` input has `stop_hook_active` and `last_assistant_message`, blocks with top-level `{"decision": "block", "reason": ...}`, and stops after eight consecutive continuations; matcher `Edit|Write` is an exact list, other characters make a regex; command hook default timeout 600 s (30 s on `UserPromptSubmit`); a timed-out `PreToolUse` hook does not block unless `"onFailure": "block"`. The implementer re-checks any field it relies on against `https://code.claude.com/docs/en/hooks`.

**Dependencies:** the user authorizes the batch. Nothing else.

**Design:**
1. **`.agents/tools/harness/routes.json`** (data, no logic). Each route: `id`, `paths` (globs), optional `diff` (regex on added lines), `validators` (npm script names), `fast` (the subset safe to run at `Stop`: `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `lint:doc-paths`, `lint:records`; never `test:theme-check`, `test:layout`, `scan:compat`, `build:*`), `tier` (`Ask | Show | Ship`), `pointers` (reference or skill paths). Routes cover the `AGENTS.md` Validation table rows, the Review tier triggers, the Task Routing references and the skill triggers that a path or diff decides (for example `@keyframes|transition|animation` → `review-animations`; `assets/motion-gsap.js`, `assets/scatter-gallery.js` → GSAP skills). A `merchant` list holds the merchant-owned path globs from `AGENTS.md` Core Rules.
2. **`.agents/tools/harness/hook.mjs`**, one entry with a subcommand per event, reading the hook JSON on stdin:
    - `prompt` (`UserPromptSubmit`): once per session, `additionalContext` with the `## Batch` heading and `**Status:**` line of `docs/agent/context.md` (or "no plan under execution").
    - `pre` (`PreToolUse`, matcher `Agent|Edit|Write|NotebookEdit|Bash|PowerShell`): `ask` with a reason for every `Agent` call; for Edit, Write and NotebookEdit whose `file_path` matches a `merchant` glob; for Bash and PowerShell whose command names a merchant path together with a write form (`>`, `>>`, `sed -i`, `Set-Content`, `Out-File`, `Add-Content`, `Copy-Item`, `Move-Item`, `cp`, `mv`, `rm`, `tee`, `open(` with `'w'` or `'a'`, `git checkout --`, `git restore`) or runs `shopify theme pull`. Read-only commands pass with no output.
    - `post` (`PostToolUse`, matcher `Edit|Write|NotebookEdit`): for each route the edited path matches and not yet pointed out in this session, `additionalContext` naming its validators, tier and pointers.
    - `stop` (`Stop`): does nothing unless the working tree diff (tracked plus untracked names and content hash) or `HEAD` changed since the last check in this session. Then: (a) runs `record-check.mjs` when a record file changed or `HEAD` moved; (b) runs the `fast` validators of the routes matched by the changed files, each once, with a total budget of 90 s; (c) reports the highest review tier the changed paths trigger and the non-fast validators still owed. A structural record failure or a failed fast validator blocks (`decision: "block"`, reason with the failing lines, capped); counts and owed validators go to `additionalContext`. With `stop_hook_active` true it never blocks, only reports.
    - Any internal error exits 0 with a one-line stderr note (fail open; CI stays the hard gate).
3. **`.agents/tools/harness/record-check.mjs`** (also `npm run lint:records`). Structural, exit 1 on failure: `board.md` has no completion pattern (`Done:|\*\*Done|done \(`); every `backlog.md` list item under a `##` area is one line containing `Source:` and `Surface:`; `context.md` holds at most one `## Batch` section whose status is not "executed" and waiting on named verification; each record file's `Last updated` is not older than the date of the latest commit that changed it. Counts, printed, exit 0: board words against `records.baseline.json` (`{"boardWords": 1865}`; above it prints a prompt line); number of Pending migration lines. A `--prune-baseline` flag lowers the baseline only, as `test:layout` does.
4. **`.claude/settings.json`**: keep the `SessionStart` doctor hook; add `UserPromptSubmit`, `PreToolUse`, `PostToolUse` and `Stop` entries calling `node "${CLAUDE_PROJECT_DIR}/.agents/tools/harness/hook.mjs" <event>`.
5. **`package.json`**: `lint:records`, `test:harness` (`node --test .agents/tools/harness/harness.test.mjs`); `test:harness` joins `test:validators`; `lint:records` joins `lint` (structural only, so CI enforces it; the ratchet never fails CI).
6. **`AGENTS.md`**: one bullet under Agent Adapters (Claude Code hooks in `.claude/settings.json` dispatch from `.agents/tools/harness/`; routes live in `routes.json`; other clients read the prose) and one Validation table row for `.agents/tools/harness/**` (`npm.cmd run test:harness` + `npm.cmd run lint:records`). No other prose changes (prose shrinks only after enforcement, a later decision).

**Implementation surface:** `.agents/tools/harness/` (new: `hook.mjs`, `record-check.mjs`, `routes.json`, `records.baseline.json`, `harness.test.mjs`, fixtures if needed), `.claude/settings.json`, `package.json` (scripts only), `AGENTS.md` (the two places in item 6), `docs/agent/context.md`, `docs/agent/board.md` (harness round line). Not in the surface: `.cursor/**`, `.codex/**`, `.github/**`, `docs/references/**`, `.agents/skills/**`, `.agents/roles/**`, every theme file.

**Acceptance checks:**
1. `git diff --name-only` plus untracked files list only surface files.
2. `npm.cmd run test:harness` passes and covers, with stdin fixtures against `hook.mjs`: `prompt` emits the plan pointer once per session and nothing the second time; `pre` returns `ask` for `Agent`, for Edit of `templates/product.json`, `config/settings_data.json` and `sections/header-group.json`, for `echo x > templates/index.json`, `sed -i ... config/settings_data.json` and `shopify theme pull`, and returns nothing for `cat templates/index.json`, `git diff templates/index.json` and Edit of `sections/main-product.liquid`; `post` points out the `lint:theme` route for a `.liquid` edit once and not again; `stop` is silent on an unchanged diff, blocks on a board with `**Done`, blocks on a backlog line without `Source:`, only reports when the board exceeds the baseline, never blocks with `stop_hook_active: true`, and fails open on malformed stdin.
3. `routes.json` integrity, in the same test: every `validators` entry is a `package.json` script; every `pointers` path exists; every command in the `AGENTS.md` Validation table appears in at least one route; every merchant path in `AGENTS.md` Core Rules appears in `merchant`.
4. `npm.cmd run lint:records` exits 0 on the current repository and prints the board count (1865 or the current value) and the Pending migration count.
5. Timing, recorded in Progress with the command: `stop` with an unchanged diff under 1 s; one `npm.cmd run lint:theme` run (for the later `PostToolUse` decision).
6. `npm.cmd run test:validators`, `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent` pass; `npx prettier --check` on every changed file.
7. `AGENTS.md` diff touches only the two places in Design item 6.
8. Live check in a new Claude Code session (the user, or the implementer in a fresh session if the client allows): spawning a subagent and editing `templates/index.json` each show a confirmation prompt; editing a section shows the validator pointer once. Recorded in Progress with who ran it.

**Review tier:** Ask (adds validator wiring and agent rule text). Execution: external execution prompt (user: large batches), then a separate verifier session; complete only on PASS.

**Next (board):** H3, CI check for merchant-owned paths with an authorization marker, and pointers in place of the reference copies of `{% doc %}` tables.

## Progress

- Authorized (user, 2026-10-20): the four coordinator choices stand. User guidance for execution: aim for the leanest implementation that follows hook best practice; where the design above is heavier than the acceptance checks need, take the simpler form and record the deviation here.
- Board size when planned: 1874 words (`wc -w`), above the 1865 baseline by the H2/H3 lines; the ratchet only prompts.

### Docs re-check (2026-10-20)

Fetched `https://code.claude.com/docs/en/hooks`. Confirmed and used: `PreToolUse` `hookSpecificOutput.permissionDecision` `ask` with `permissionDecisionReason` and `hookEventName`; `UserPromptSubmit` and `PostToolUse` `hookSpecificOutput.additionalContext`; `Stop` input `stop_hook_active`; `Stop` block is top-level `decision: "block"` plus `reason`; matcher `Edit|Write` is an exact `|` list; command timeout default 600s, 30s on `UserPromptSubmit`; a timed-out `PreToolUse` hook does not block unless `onFailure` is `block` (left unset, so this hook fails open). Docs addition that changes the design: `Stop` `additionalContext` continues the turn under the same 8-continuation cap as `decision: "block"`.

### Deviations

- With `stop_hook_active` true the hook writes one stderr line and returns no JSON. `additionalContext` would continue the turn, so "only reports" stays off the continuation loop.
- With `stop_hook_active` true, fast validators are not run again.
- A passing record check does not inject the word count at `Stop` unless the board is above the baseline. `npm run lint:records` still prints the counts.
- `Stop` calls `checkRecords` in-process. `lint:records` is the CLI for the same function.
- No `frontend-design` route: the skill trigger is not decided by a path or diff.
- (Superseded in verifier round 1: `shopify:dev` is no longer routed; see below.) `build:tw` and `build:svg` are named under Validation but outside the table and are not routes.
- Tests may set `HARNESS_STATE_DIR`. The default state directory is the OS temp directory, keyed by a hash of the project path and `session_id`.

### Validation (2026-10-20)

| Check | Command | Result |
| --- | --- | --- |
| Surface | `git diff --name-only` and `git status --short` | `.claude/settings.json`, `AGENTS.md`, `docs/agent/board.md`, `docs/agent/context.md`, `package.json`; untracked `.agents/tools/harness/` |
| `AGENTS.md` | `git diff -- AGENTS.md` | Agent Adapters bullet and one Validation table row only |
| Harness tests | `npm.cmd run test:harness` | 7 pass, 0 fail |
| Record check | `npm.cmd run lint:records` | exit 0. `board words: 1882`, `baseline: 1865`, `pending migration lines: 8`, plus the above-baseline prompt line |
| Validators | `npm.cmd run test:validators` | exit 0 |
| Doc paths | `npm.cmd run lint:doc-paths` | Doc path lint passed |
| Doctor | `npm.cmd run doctor:agent` | exit 0 |
| Unchanged stop | node script in `$env:TEMP\harness-time.mjs`: two `stop` calls on a temp git repo, second call timed | `unchanged_stop_ms=120`, empty stdout, status 0 |
| `lint:theme` once | `Measure-Command` around `npm.cmd run lint:theme` | `lint:theme_ms=15650` (passed). Not added to `PostToolUse` |
| Prettier | `npx prettier --write --ignore-path <empty temp ignore>` on the three new `.mjs` files, then `--check` | those files formatted. `AGENTS.md`, `docs/agent/context.md`, and `.claude/settings.json` fail an explicit check; they are listed in `.prettierignore` (CRLF / existing JSON indent). Not rewritten |

### Live check

Owed by the user. This session cannot open a new Claude Code process. In a new Claude Code session in this repo: spawning a subagent and editing `templates/index.json` each show a confirmation prompt; editing a section shows the validator pointer once and not on the next edit of a path on the same routes.

**Unverified:** that live Claude Code prompt. Open board decisions (stylesheet spacing, `impeccable` adoption, Batch SOP always-on, and the other Open decisions) were not decided.

**Verifier round 1 (external session, 2026-10-20): FAIL.** Findings and coordinator fixes:
1. A passing `Stop` returned `additionalContext`, which continues the turn (one extra model turn per changed diff; observed live in the coordinator session). Fixed: `Stop` blocks only on failures; counts, tier and owed validators go to `systemMessage` (shown to the user, no turn; docs re-checked 2026-10-20). Test asserts a passing stop has no `hookSpecificOutput`.
2. Route semantics against `AGENTS.md`: `layout` route tier Ask → Show (CSS-only diffs now report Show); `shopify:dev` removed from validators (a prerequisite, not a validator); the `release` route (package.json → `lint`, `test`) removed and `package.json` plus `.github/**` added to the `rules` route (validator wiring, Ask); `lint:compat` added to the `liquid` route (embedded blocks). The integrity test now asserts path → tier and path → validators for CSS, Tailwind, locales, sections, JS and `package.json`, and that `lint`, `test`, `shopify:dev` are routed nowhere.
3. Shell merchant detection: now destination-aware (redirection target, last argument of copy or move, any argument of an in-place writer such as `sed -i`, `Set-Content`, `Remove-Item`, `writeFileSync`, `git checkout|restore|reset`). The verifier's false positives (`cat ... > /tmp/x`, `cp templates/... /tmp/x`) and false negatives (`echo x>templates/...`, `node -e writeFileSync`, `Remove-Item`, `git checkout HEAD --`) are test cases. The outcome now calls shell coverage advisory; H3 CI is the hard gate.
4. Live check (acceptance 8) still owed by the user. Partial evidence from the coordinator session (hooks loaded mid-session): `UserPromptSubmit` injected the plan pointer; `PostToolUse` pointed out the `rules` and `harness` routes once each on the first harness edit; `Stop` fired after a changed diff.
After the fixes: `npm.cmd run test:harness` 7 pass 0 fail; `npm.cmd run test:validators` exit 0; `npm.cmd run lint:doc-paths` pass; `npm.cmd run doctor:agent` exit 0; `npx prettier --check --ignore-path NUL` on the harness files and `package.json` pass.

**Verifier round 2 (external session, 2026-10-20): FAIL.** Findings and coordinator fixes:
1. The `Stop` fingerprint missed content changes inside untracked directories (`git status --porcelain` collapses them to `?? dir/`). Fixed: `git status --porcelain -uall`, so each untracked file is hashed. Regression test: changing a file inside an already-untracked directory changes the stored fingerprint.
2. The stale `shopify:dev` deviation line above is marked superseded.
Advisory shell gaps the verifier listed (`Copy-Item -Destination ... -Path`, `[IO.File]::WriteAllText`, and false positives such as `echo git checkout templates/index.json`) are accepted under the advisory boundary; H3 CI is the hard gate.
After: `npm.cmd run test:harness` 7 pass 0 fail.

**Verifier round 3 (external session, 2026-10-20): FAIL.** Round-2 fixes confirmed (nested untracked, superseded record line); acceptance 1-7 passed. Finding and coordinator fix: git C-quotes non-ASCII paths (`"docs/references/æ..."`), so `Stop` neither routed nor hashed them. Fixed: every git path list is read with `-z` (`status --porcelain -z -uall`, `diff --name-only -z`, `ls-files -z`), with rename and copy entries parsed. Regression test: an untracked `assets/测试.css` reaches its route (`test:layout` owed) and a later edit to it changes the fingerprint. After: `npm.cmd run test:harness` 7 pass 0 fail.

**Verifier round 4 (external session, 2026-10-20): FAIL.** The non-ASCII fix and all fingerprint fixtures passed; acceptance 1-7 passed. Findings and coordinator fixes: `addedLines()` still listed untracked paths without `-z` (no functional failure, contract unmet), now `ls-files ... -z` parsed with `nulList`; an extra blank line at the end of this file (`git diff --check`), removed.

**Verifier round 5 (external session, 2026-10-20): PASS**, no findings; acceptance 1-7 proven with fresh evidence. Remaining merge condition: acceptance 8, the user's live check in a new Claude Code session.

**Acceptance 8, live check (user, new Claude Code session, 2026-10-20): done.** Subagent spawn prompted and was rejected; a shell write to `templates/index.json` (Python `open(...,'w')`) prompted and was rejected. The section-edit step named a nonexistent file (`sections/main-product.liquid`, a coordinator error; the file is `sections/product.liquid`), so the once-per-session pointer is evidenced from the coordinator session instead (rules and harness routes pointed out once on the first harness edit, not again).
