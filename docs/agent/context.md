# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-T6 repository setup, small version

**Status:** direction accepted by the user on 2026-10-13 (option A on `docs/agent/board.md`, Repository setup automation). **Authorized** by the user on 2026-10-13 ("执行"), with the whole surface below, including the `.agents/tools/` and `package.json` changes. Implementer: the coordinator. Executed (see "6-T6: executed"). Independent review round 1 (2026-10-13): FAIL, three findings, all corrected. Round 2 (2026-10-13): FAIL, one new finding, corrected. Round 3 (2026-10-13): FAIL, one new finding; the user approved replacing the hand-written reader with `js-yaml` (plan amendment below). Round 4 (2026-10-13): FAIL, two findings (both wrong failures, no wrong pass), corrected. Round 5 (2026-10-13): PASS. Waiting for the user's acceptance and commit.

**Outcome:** a new theme repository made from this code can be protected the same way without remembering today's manual steps: the `main` ruleset travels as a file, the README lists the three setup steps, and a local check fails when the ruleset's required checks and the workflow job names drift apart. No setup script and no remote check. **Amended 2026-10-13 (user, option A after review round 3):** one declared dev dependency, `js-yaml`, which was already installed through `eslint` and `stylelint`.

**Review tier:** Ask (validator wiring: `.agents/tools/`, `package.json` scripts).

**Dependencies:** none for the work. One item only the user can verify, named under "Not proven by this batch".

### Evidence (read 2026-10-13)

- `GET https://api.github.com/repos/Joey-Fjh/my-theme-1/rulesets/13447964` answers without sign-in: target branch `~DEFAULT_BRANCH`, enforcement active, rules `deletion`, `non_fast_forward`, `pull_request` (0 approvals; merge, squash and rebase allowed) and `required_status_checks` (strict; `Lint`, `Theme Check`, `Lighthouse`, each with `integration_id` 15368, GitHub Actions). The anonymous answer does not include `bypass_actors`.
- Job names: `.github/workflows/ci.yml` has `Lint` and `Theme Check`; `.github/workflows/lighthouse.yml` has `Lighthouse`, which reads the secrets `SHOP_STORE`, `SHOP_ACCESS_TOKEN` and `SHOP_PASSWORD`.
- `.agents/tools/doctor-agent.mjs` has two modes. Hook mode checks the entry adapters only and exits before any tooling loads. CLI mode (`npm.cmd run doctor:agent`, also a step of the CI `Lint` job) adds the MCP configuration check. The script exports nothing and has no test.
- The repository has no YAML parser among its dependencies.

### Implementation surface

1. **`.github/rulesets/main.json`** (new). The ruleset in GitHub's import format: the API answer without `id`, `node_id`, `source`, `source_type`, the timestamps and `_links`, plus `bypass_actors` with the repository admin role in `pull_request` mode, as the board records it.
2. **`.agents/tools/ci-contract.mjs`** (new). A module with pure functions and no network access:
   - read the job names of every workflow under `.github/workflows/` (a job's name, or its id when it has none), parsed with `js-yaml` (amended 2026-10-13; the first version used a small indentation-based reader);
   - read the required check contexts of every ruleset file under `.github/rulesets/`;
   - report each required context that no job provides, and a ruleset file that cannot be parsed.

   A repository without `.github/rulesets/` passes.
3. **`.agents/tools/ci-contract.test.mjs`** (new). Fixture tests: matching names pass; a renamed job fails and names the missing context; a job without `name` is matched by its id; an unparsable ruleset fails; no rulesets directory passes.
4. **`.agents/tools/doctor-agent.mjs`.** CLI mode calls the check and prints its failures with a pointer to the README section. Hook mode is unchanged.
5. **`package.json`, `package-lock.json`.** A `test:ci-contract` script, added to `test:validators`; no other script changes. Amended 2026-10-13: `js-yaml` in `devDependencies`, with its one-line lockfile entry.
6. **`README.md`.** A section "New theme repository setup": import `.github/rulesets/main.json` (Settings, Rules, Rulesets, Import a ruleset), add the three Actions secrets by name, run the `Lighthouse` workflow once by hand, and what `doctor:agent` checks. It names the one-time `ci-test` store setup as already done and not repeated.
7. This file and `docs/agent/board.md`.

**Not in this batch:** a setup script, a remote check of secrets or of the live ruleset, moving the Lighthouse handles to configuration (backport), `AGENTS.md` (its Validation table already routes this surface to `doctor:agent`).

**Forbidden:** theme files, the workflows, `AGENTS.md`, the roles, the references, the lint baselines, any dependency other than `js-yaml`, commits, `prettier --write`.

### Acceptance checks

1. `npm.cmd run test:ci-contract` passes; state the test count from the output. `npm.cmd run test:validators` passes; state the counts before (HEAD) and after.
2. `npm.cmd run doctor:agent` exits 0 on the repository.
3. The check has teeth: in a scratch copy outside the repository, renaming one job in `ci.yml` makes the CLI exit 1 and name `Lint` (or the renamed context); hook mode on the same copy still prints nothing and exits 0.
4. `.github/rulesets/main.json` parses as JSON; its rules and required contexts equal a fresh anonymous read of ruleset 13447964 (state the command and the comparison).
5. `npm.cmd run lint:doc-paths` passes; `npx prettier --check` passes on every changed file Prettier covers; `git diff --check` is clean; `git diff --stat` shows only the surface.
6. `git diff -- package.json` shows the one new script, the `test:validators` change and (amended) the `js-yaml` dev dependency only; `git diff -- package-lock.json` shows that one declaration line only.
7. Independent review (Ask) reports PASS.

**Not proven by this batch:** that GitHub accepts the file on import, and that `bypass_actors` equals the live setting (it is invisible without admin sign-in). The user can prove both in a minute by exporting the live ruleset from its settings page and comparing, or at the first real import; until then the README says so.

## 6-T6: executed

Done by the coordinator on 2026-10-13. Nothing is committed.

**Changed files** (`git status --short`): new `.github/rulesets/main.json`, `.agents/tools/ci-contract.mjs`, `.agents/tools/ci-contract.test.mjs`; changed `.agents/tools/doctor-agent.mjs`, `package.json`, `README.md`, and the two record files.

**Also in the working tree, not part of this batch** (earlier work of the same session, user-approved, uncommitted): `.agents/tools/layout-check/layout-check.baseline.json` (pruned 42 → 39), `docs/design/design.md`, `docs/project.md`, and board edits for the three rule decisions.

**Material decisions and corrections to the plan:**

- **Formatting of the new JSON.** `npx prettier --check` rejected the file as first written. It was formatted by writing Prettier's standard output for that one file (`npx prettier .github/rulesets/main.json`) over it; `--write` was not used.
- **Check 3 could not be run as written.** The scratch copy was a local clone under the user's temp directory with `node_modules` joined in. This shell cannot create symlinks, so the clone had no `CLAUDE.md` or `.claude/skills`; the CLI therefore exited 1 in both runs, and hook mode printed its adapter message. The exit code does not isolate the new check, so the evidence is the output instead (table below).
- **One test more than planned:** a ruleset that requires a check while no workflows directory exists fails.
- **README.** The `doctor:agent` line in Commands now names the new check.

**Validation (2026-10-13, working tree):**

| Check | Command | Result |
| --- | --- | --- |
| 1 | `npm.cmd run test:ci-contract` | `# tests 7`, `# pass 7`, `# fail 0` |
| 1 | `npm.cmd run test:validators` | before (HEAD): 33 + 243 + 3 + 7 tests, all pass; after: 33 + 243 + 3 + 7 + 7, all pass |
| 2 | `npm.cmd run doctor:agent` | exit 0 |
| 3 | scratch clone, `node .agents/tools/doctor-agent.mjs` before the rename | no "Branch ruleset check failed" block |
| 3 | same, after `name: Lint` → `name: Linting` in `ci.yml` | prints `required check "Lint" is not the name of any job under .github/workflows` |
| 3 | same copy, `collectCiContractFailures(process.cwd())` | one failure, for `.github/rulesets/main.json` |
| 3 | same copy, `node .agents/tools/doctor-agent.mjs --hook \| grep -c -i ruleset` | 0 |
| 4 | `curl https://api.github.com/repos/Joey-Fjh/my-theme-1/rulesets/13447964`, then a Node comparison of the parsed objects | `rules`, `conditions`, `name`, `target` and `enforcement` equal the file's |
| 5 | `npm.cmd run lint:doc-paths` | passed |
| 5 | `npx prettier --check README.md package.json .github/rulesets/main.json` and the record files | all formatted (`.agents` is ignored by Prettier) |
| 5 | `git diff --check` | clean |
| 6 | `git diff -- package.json` | the new `test:ci-contract` script and the `test:validators` line only; `package-lock.json` not in `git status` |

**Not proven, as the plan says:** that GitHub accepts the file on import, and that `bypass_actors` (repository role id 5, `pull_request` mode) equals the live setting.

**Open:** check 7, the independent review.

## 6-T6: independent review, round 1

External Verifier session, 2026-10-13, read-only, against the uncommitted working tree. The report was given in chat; its evidence is summarised here.

**Verdict: FAIL**, three findings. The real workflows parsed correctly and the CLI wiring passed.

1. **Medium, the check could pass wrongly.** `parseScalar` in `.agents/tools/ci-contract.mjs` cut a quoted name at the first quote, so the YAML `name: 'Lint''s check'` (value `Lint's check`) was read as `Lint` and satisfied a required `Lint`.
2. **Low, the check could fail wrongly.** A folded name (`name: >-` with the text on the next line) was read as `>-`.
3. **Low, record.** `docs/agent/board.md` still said 6-T6 was waiting for authorization.

The Verifier's requirement: the small reader may limit what it supports, but a name in unsupported syntax must be reported, never turned into a wrong name silently.

**Corrections (coordinator, 2026-10-13):**

- `parseScalar` decodes three forms only: a plain value, a single-quoted value with `''` as one quote, and a double-quoted value without a backslash. Anything else (block scalars, escapes, anchors, tags, flow collections, an empty value) is not decoded.
- `readJobNames` became `readJobs`, returning `{ id, name, unreadable }` per job. `collectCiContractFailures` reports each unreadable name with its workflow file and job id, and does not add it to the known names.
- Four new tests: quoted names decoded including the doubled quote; unsupported syntax marked and not guessed (folded, escaped, empty); an escaped quote does not satisfy a required check (finding 1 as a fixture); an unreadable name fails and names the workflow and the job (finding 2 as a fixture).
- Both board lines for 6-T6 now say the batch is in execution.

**Validation after the corrections:**

| Command | Result |
| --- | --- |
| `npm.cmd run test:ci-contract` | `# tests 11`, `# pass 11`, `# fail 0` |
| `npm.cmd run test:validators` | 33 + 243 + 3 + 7 + 11 tests, 0 failures |
| `npm.cmd run doctor:agent` | exit 0 |
| `readJobs` on `.github/workflows/ci.yml` and `lighthouse.yml` | `Lint`, `Theme Check`; `Lighthouse`; no unreadable name |

**Proven by the Verifier in round 1, unchanged by the corrections:**

- **Check 3, isolated.** In a scratch copy with healthy adapter metadata: normal copy exit 0 with no output; `Lint` renamed to `Linting` exit 1 with only the ruleset block; `--hook` on that copy exit 0 with no output; no `.github/rulesets` exit 0; `--hook` without the module and without installed dependencies exit 0.
- **Check 4.** A fresh anonymous read (Node `fetch`, HTTP 200; `curl` failed on a Windows TLS credential error in that session) equals the file in `rules`, `conditions`, `name`, `target` and `enforcement`. The file holds no id, source, timestamp or link field.
- `.shopifyignore` still excludes `.github/**`. Every path, command, job name and secret name in the README section exists; the secrets match `lighthouse.yml`.
- `package.json`: only the new script and the `test:validators` change; the lockfile is unchanged; no new dependency. The approval for the `.agents/` and `package.json` changes is recorded.
- HEAD: 286 validator tests pass. `lint:doc-paths`, `lint:compat`, `prettier --check` and `git diff --check` pass.

## 6-T6: independent review, round 2

Same Verifier session, 2026-10-13, read-only. **Verdict: FAIL**, one new finding; the three round 1 findings are confirmed corrected.

- **Medium, the check could pass wrongly.** The reader ignored the continuation line of a multi-line plain name. With `name: Lint` followed by a deeper line `renamed`, the YAML value is `Lint renamed`, but the reader returned `Lint`, which satisfied a required `Lint`.

**Confirmed by the Verifier in round 2:** both round 1 fixtures behave correctly; double-quoted escapes, block scalars, anchors, aliases, tags, flow collections and empty values are marked unreadable; comments, ` #` inside quotes, trailing spaces and CRLF read correctly; the real workflows give exactly `Lint`, `Theme Check`, `Lighthouse`; `.agents/tools/doctor-agent.mjs` is byte-identical to round 1, so the isolated CLI and hook evidence still holds; the board and this file agree; the round 1 summary is accurate.

**Corrections (coordinator, 2026-10-13):**

- **The finding.** A line indented deeper than the job's keys, directly after a `name:` line, marks the name unreadable ("continued on the next line"). Regression test: the Verifier's fixture.
- **Two more silent cases found by the coordinator's own audit of the reader, same class.** A job whose value sits on its own line (`lint: *shared`, an alias or a flow mapping) and a job with a merge key (`<<:`) can take a name from elsewhere while the reader would fall back to the job id. Both are now marked unreadable.
- Three new tests: the continued name does not satisfy a required check; a name followed by a sibling key or by the next job is read normally (no false continuation); alias and merge-key jobs are marked unreadable, and a job line with only a comment is not.

**Validation after the corrections:**

| Command | Result |
| --- | --- |
| `npm.cmd run test:ci-contract` | `# tests 14`, `# pass 14`, `# fail 0` |
| `npm.cmd run test:validators` | 33 + 243 + 3 + 7 + 14 tests, 0 failures |
| `npm.cmd run doctor:agent` | exit 0 |
| `readJobs` on the two real workflows | `Lint`, `Theme Check`; `Lighthouse`; no unreadable name |

## 6-T6: independent review, round 3, and the plan amendment

Same Verifier session, 2026-10-13, read-only. **Verdict: FAIL**, one new finding; the round 2 correction is confirmed.

- **Medium, the check could pass wrongly.** The reader matched the key only as the exact text `name:`. The valid YAML keys `"name": Linting` and `name : Linting` were ignored, so the job fell back to its id `lint` and satisfied a required `lint`.

**Confirmed by the Verifier in round 3:** the continued-name fixture is reported and no longer satisfies `Lint`; no false report for a `name:` followed by a sibling key, a steps list at the same or a deeper indent, a comment, a blank line or the next job; the real workflows give exactly `Lint`, `Theme Check`, `Lighthouse`; `.agents/tools/doctor-agent.mjs` is byte-identical to round 1; the round 2 summary is accurate.

**Decision (user, 2026-10-13, option A).** Three rounds each found a silent wrong pass in the hand-written reader, so it is replaced by a standard parser instead of patched again. The plan's "no new dependency" is amended to allow `js-yaml` (4.3.1, MIT), which `eslint` and `stylelint` already install; it is now declared in `devDependencies`.

**Changes (coordinator, 2026-10-13):**

- `.agents/tools/ci-contract.mjs`: `readJobNames` parses the workflow with `js-yaml` and returns each job's `name`, or its id when the name is absent or empty. The indentation reader, `parseScalar`, `readJobs` and the "unreadable" reporting are removed. A workflow that does not parse is reported with its path.
- `.agents/tools/ci-contract.test.mjs`: rewritten, 14 tests. Each reviewer fixture is a test: the doubled single quote (round 1), the folded name (round 1, now read as `Lint` and passing), the name continued on the next line (round 2), the quoted key and the space before the colon (round 3). Also an alias and a merge key resolved, and an unparsable workflow reported.
- `package.json`: `js-yaml` `^4.3.1` in `devDependencies`. `package-lock.json`: the one declaration line. `npm install` had also rewritten the entry's `resolved` URL to a local mirror; that line was restored to `registry.npmjs.org`, so it is not in the diff.
- `.agents/tools/doctor-agent.mjs` is unchanged since round 1. It loads the check only in CLI mode, after hook mode has exited, as it does `smol-toml`.

**Validation:**

| Command | Result |
| --- | --- |
| `npm.cmd run test:ci-contract` | `# tests 14`, `# pass 14`, `# fail 0` |
| `npm.cmd run test:validators` | 33 + 243 + 3 + 7 + 14 tests, 0 failures |
| `npm.cmd run doctor:agent` | exit 0 |
| `node .agents/tools/doctor-agent.mjs --hook \| wc -c` | 0 |
| `readJobNames` on the two real workflows | `Lint`, `Theme Check`; `Lighthouse` |
| `git diff -- package-lock.json` | one added line, `"js-yaml": "^4.3.1"` |

## 6-T6: independent review, round 4

Same Verifier session, 2026-10-13, read-only. **Verdict: FAIL**, two undeclared limits of the name reading. Both make the check fail where it should pass; neither lets a missing check through. All five fixtures of rounds 1 to 3 now give the real YAML value.

1. **Medium, a valid name reported missing.** js-yaml's default schema reads `name: 2026-10-13` as a date, and `String()` then gave a date string with a time zone. GitHub's workflow parser uses the YAML 1.2 core schema, which keeps it a string.
2. **Medium, an expression name treated as literal text.** `name: ${{ 'Lint' }}` was compared as that raw text. It is neither a matrix name nor a reusable workflow, so the file header did not cover it. The Verifier asked for an explicit report or a user-approved exclusion, not an expression evaluator.

**Confirmed by the Verifier in round 4:** numbers and booleans were converted to strings (changed below); null and empty names fall back to the job id; duplicate keys, multiple documents and unparsable workflows are reported with the file path; `.yaml` and `.yml` are both read; the real workflows give exactly `Lint`, `Theme Check`, `Lighthouse`; `.agents/tools/doctor-agent.mjs` is byte-identical to round 1, and with a loader that forbids js-yaml the hook still exits 0 silently, so hook mode never loads it; `js-yaml` is declared, the lockfile adds the declaration line only with the `registry.npmjs.org` URL, and `npm.cmd ci --dry-run` succeeds; the plan amendment and the approval are recorded; the round 3 summary is accurate.

**Corrections (coordinator, 2026-10-13):**

- **Schema.** The workflow is parsed with js-yaml's `CORE_SCHEMA`: no date type and no merge key, which matches GitHub's parser more closely. The merge-key test is removed with it; the alias test stays.
- **Non-string names.** A name YAML reads as a number or a boolean is no longer converted (`1.0` would have become `1`, `0x10` would have become `16`). It fails with the workflow path, the job id and "quote it".
- **Expression names.** A name containing `${{` is not evaluated and is never counted as a known name. When a required check has no match, its failure lists the jobs whose expression names were not counted. An expression name that no required check depends on does not fail anything.
- **Declared limits.** The file header now lists the three limits: expression names (matrix names included), non-string names, and reusable-workflow check names.
- `readJobNames` is `readJobs` again, returning `{ id, name, expression }`.
- Four new tests: a date-like name stays text and satisfies its check (finding 1); `1.0`, `0x10` and `true` fail and ask for quotes, while `'1.0'` is read; an expression name is named in the failure (finding 2); an expression name elsewhere does not fail a satisfied check.

**Validation after the corrections:**

| Command | Result |
| --- | --- |
| `npm.cmd run test:ci-contract` | `# tests 18`, `# pass 18`, `# fail 0` |
| `npm.cmd run test:validators` | 33 + 243 + 3 + 7 + 18 tests, 0 failures |
| `npm.cmd run doctor:agent` | exit 0 |
| `readJobs` on the two real workflows | `Lint`, `Theme Check`; `Lighthouse`; none an expression |

## 6-T6: independent review, round 5

Same Verifier session, 2026-10-13, read-only. **Verdict: PASS, no new finding.**

- The date-like name stays `2026-10-13` and satisfies its check. An expression name is not counted; the failure names the workflow, the job id and "not evaluated"; an unrelated expression job causes no failure.
- The five fixtures of rounds 1 to 3 give the real YAML value.
- A non-string name is reported with path, job id and type. The three limits are declared. Further probes found no silent wrong match inside the batch's scope.
- The real workflows give exactly `Lint`, `Theme Check`, `Lighthouse`. `.agents/tools/doctor-agent.mjs` is byte-identical to round 1; the hook exits 0 silently.
- `package.json` and `package-lock.json` match their round 4 hashes.
- Fresh runs: `npm.cmd run test:ci-contract` 18 of 18; `npm.cmd run test:validators` 304 tests, exit 0; `npm.cmd run doctor:agent` exit 0; `npm.cmd run lint:doc-paths` passed; `git diff --check` clean.

**Still not proven, as the plan says:** that GitHub accepts the ruleset file on import, and that `bypass_actors` equals the live setting. Both are the user's to verify.

**After the review (2026-10-13):** the user exported the live ruleset from its settings page and compared it with `.github/rulesets/main.json`: no difference, so `bypass_actors` is confirmed. The README sentence that said this part had not been compared was removed (one sentence, after round 5; no other change). Still unproven: an actual import of the file into a new repository.

**Open:** the user's acceptance, then the commit and clearing this file.
