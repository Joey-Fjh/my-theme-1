# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-T4c Lighthouse trigger timing

**Status:** proposed, accepted and authorized by the user 2026-10-13 ("是的，可以。… 这个lighthouse就没必要这个分支触发了。lint 和 theme check你来判断"). Executed by the coordinator; waiting on independent review (Ask).

**Outcome:** Lighthouse runs only where it gates a merge: pull requests into `main`, pushes to `main`, and manual runs. Development branch pushes no longer trigger it, so there is no 4 to 5 minute audit and no leftover development theme on ci-test per push. Lint and Theme Check stay on every push (the coordinator's call: they are cheap and give early feedback).

**Why a separate workflow file:** a job-level condition inside `ci.yml` would still report a skipped `Lighthouse` check on every branch push. GitHub counts skipped as passing, and that check would sit beside the real pull-request result under the same required name. In 6-T4a the job was `push`-only, so on a pull request it was skipped and the required check relied on the push run. A separate workflow does not run at all on branch pushes.

**Review tier:** Ask (validator wiring).

### Implementation surface

- `.github/workflows/ci.yml`: the `lighthouse` job is removed. The file is byte-identical to `c5869ae`, the state before 6-T4a.
- `.github/workflows/lighthouse.yml` (new):
  - Triggers: `push` to `main`, `pull_request` into `main`, and `workflow_dispatch`.
  - Concurrency: one group per ref, with cancel-in-progress.
  - Job `Lighthouse`: the same name the `main` ruleset requires. It is skipped for fork pull requests, which get no secrets. Its steps and inputs are identical to the 6-T4a job.
- `docs/references/code-review/launch-gate.md`: the Lighthouse line names the new file and the triggers.
- Record files.

**Forbidden:** theme files, `package.json`, secrets, the GitHub ruleset, `AGENTS.md` and the roles.

### Known limits (not defects)

- `workflow_dispatch` and the `pull_request` trigger read the workflow from the default branch or the pull request merge. The manual "Run workflow" button therefore appears only after this file reaches `main`. Until then, Lighthouse runs for this branch only through a pull request into `main`; a draft works.
- **Rule wording, approved by the user 2026-10-13 ("可以") and applied:** `AGENTS.md` (Authority) and `.agents/roles/verifier.md` named `.github/workflows/ci.yml` as the validator wiring. With a second workflow file, both now say the workflows under `.github/workflows/`. The surface gains these two one-phrase edits.

### Acceptance checks

1. `git diff c5869ae -- .github/workflows/ci.yml` is empty.
2. `js-yaml` parses both files. `lighthouse.yml` triggers are exactly `push` (branches `main`), `pull_request` (branches `main`) and `workflow_dispatch`. Its step inputs equal the 6-T4a job's (`git show 851ca19:.github/workflows/ci.yml`). It references only `secrets.SHOP_STORE`, `secrets.SHOP_ACCESS_TOKEN` and `secrets.SHOP_PASSWORD`.
3. After the push of this change, the `CI` run for the new commit has the jobs Lint, Theme Check and Theme Check Report and no Lighthouse job, and `gh run list --workflow Lighthouse` shows no run for that commit.
4. The pull-request trigger is proven at the first pull request into `main`. It is not part of this batch, because opening one is the user's decision. State it as unproven.
5. `npx prettier --check .github/workflows/*.yml`, `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; `git diff --check` is clean; `git diff --stat` shows only the surface.
6. Independent review (Ask) reports PASS.

**Check 3 (2026-10-13):** commit `e5c6ba2` pushed. `gh run list --commit e5c6ba2` shows one run, `CI` 38370212672. Its jobs are Lint and Theme Check (Theme Check Report is added by the action when it finishes), with no Lighthouse job. There is no `Lighthouse` workflow run for the commit. Checks 1, 2 and 5 pass with the commands named above. Check 4 is unproven by design. Check 6 is pending.

**Independent review round 1 (2026-10-13): PASS** for `a641b27..dfad11c`, no findings.
- It confirmed the separate-file reasoning and the `workflow_dispatch` limit against GitHub's documentation, and the fork skip.
- It noted that the fork skip also means a fork pull request is not held to a Lighthouse audit. That is accepted: the repository has a single developer.
- **Outside that review:** commit `1e3bc18` (the approved rule wording) and the pull-request run below. A short top-up review covers both.

**Check 4, pull-request trigger:** the user's "可以" (2026-10-13) was taken to cover the offered draft pull request. Draft pull request #21 (`refactor/skeleton-shell` → `main`, marked do not merge) was opened. It started the `Lighthouse` workflow on the `pull_request` event (run 38370537425) beside `CI`. The result is recorded when the run finishes.

**Check 4 proven (2026-10-13):** run 38370537425 (event `pull_request`, pull request #21) succeeded.
- It audited `/`, `/products/amazing-cotton-bag-collection15` and `/collections/collection1`, three runs each.
- "Checking assertions against 3 URL(s), 9 total run(s)" was followed by "All results processed!".
- `gh pr checks 21` shows Lighthouse, Lint, Theme Check and Theme Check Report passing. Lint and Theme Check appear twice, once for the push and once for the pull request, as expected while a pull request is open.

Top-up review pending, covering commit `1e3bc18` and this run.

**Pull request #21 closed (user, 2026-10-13):** it was closed after the trigger proof, and the branch was kept. GitHub cannot delete a pull request, only close it. From here a push to this branch runs `CI` only.
