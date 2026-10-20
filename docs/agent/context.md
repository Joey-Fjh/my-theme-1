# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; accepted, unscheduled work lives in `docs/agent/backlog.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-20.

Previous batch: H2 (Claude Code hooks and record checks), closed with Ask review PASS and the user's live check; record: `git show aa14969:docs/agent/context.md`.

## Batch H3: CI merchant-path guard and reference table pointers

**Status:** executed and reviewed (2026-10-20): Ask review PASS in round 3; acceptance 8 (GitHub `Lint` run) owed after push.

**Outcome.** A change to merchant-owned files can no longer reach a branch silently: CI fails when a commit in the pushed or pull-request range touches `config/settings_data.json`, `templates/*.json` or `sections/*-group.json` without either coming from the Shopify GitHub integration or carrying an authorization trailer. The H2 shell check stays advisory; this is the hard gate. Separately, the references stop copying snippet `{% doc %}` parameter tables (two copies have already drifted) and point to the snippet instead.

**Decisions:** the guard and the table pointers were agreed in the harness round (user, 2026-10-20; board). H3 runs before H4, the prose slimming that closes the round (user, 2026-10-20).

**Coordinator choices in this plan (the user may change them when authorizing):**
- **Marker form:** a Git commit trailer `Merchant-Change: <reason>` in the commit that touches a merchant path. It lives in history, needs no extra file, and `git interpret-trailers` can read it. An agent adds it only when the user authorized that merchant change in the batch plan or in chat; the trailer reason names the authorization.
- **Exemption:** commits authored by the Shopify GitHub integration (`shopify[bot]`, 95 of the merchant-path commits in history) pass without a trailer; they are the merchant's editor writes.
- **Range:** pull requests: `base.sha..head.sha`; pushes: `before..sha`, or, for a new branch (`before` all zeros), commits not on the default branch. Merge commits are skipped (their content is checked through the commits they bring in); a hand-edited conflict resolution in a merge is a known gap, recorded.
- **Where:** a step in the existing `Lint` job (no new required check, so the ruleset and `ci-contract` stay unchanged); checkout gets `fetch-depth: 0`.

**Dependencies:** the user authorizes the batch. Nothing else.

**Design:**
1. **`.agents/tools/merchant-guard.mjs`** (`npm run lint:merchant`): takes `--range <a>..<b>` (or reads the GitHub event from `GITHUB_EVENT_PATH` and `GITHUB_EVENT_NAME` in CI); lists non-merge commits in the range with `git log -z`; for each commit whose changed paths (`git diff-tree -z --no-commit-id --name-only -r`) match a merchant glob, passes when the author email is the Shopify integration's (`79544226+shopify[bot]@users.noreply.github.com`) or the message has a `Merchant-Change:` trailer with a non-empty reason; otherwise prints `<sha> <subject>: <paths>` and exits 1. Merchant globs are read from `.agents/tools/harness/routes.json` (one source). Node ESM, no new dependencies, a `node:test` file with disposable repositories.
2. **`.github/workflows/ci.yml`:** `fetch-depth: 0` on the `Lint` checkout and one step `npm run lint:merchant` (CI mode). Job names unchanged.
3. **`package.json`:** `lint:merchant`; its test joins `test:validators`. `lint:merchant` does not join `lint` (it needs a range, which local `lint` has none of).
4. **`AGENTS.md`:** Core Rules, the merchant-owned list: one sentence naming the `Merchant-Change:` trailer and that CI enforces it; one Validation table row for `.agents/tools/merchant-guard.mjs`. `routes.json` gains a route for the new script (validators: its test).
5. **References:** every table in `docs/references/**` that restates a snippet's `{% doc %}` parameters (known: the `section-frame` table in `abstraction-boundaries.md`, the Parameters table in `image-display-contract.md`) is replaced by a pointer to the snippet's `{% doc %}` block plus only the guidance that the `{% doc %}` does not carry. The implementer lists every such table found, with the search used.

**Implementation surface:** `.agents/tools/merchant-guard.mjs` and its test (new), `.agents/tools/harness/routes.json`, `.github/workflows/ci.yml` (the `Lint` job only), `package.json` (scripts), `AGENTS.md` (the two places in item 4), `docs/references/**` (the tables in item 5 only), `docs/agent/context.md`, `docs/agent/board.md`. Not in the surface: snippets and every other theme file (a `{% doc %}` block that lacks a parameter the reference had is reported, not edited), `.github/rulesets/**`, `.claude/**`, `.cursor/**`, `.codex/**`.

**Acceptance checks:**
1. `git diff --name-only` plus untracked files list only surface files.
2. The guard's test passes and asserts, against disposable repositories: a commit touching `templates/index.json` without a trailer fails; with `Merchant-Change: user approved X` passes; with an empty trailer fails; a `shopify[bot]` commit passes; a commit touching only `sections/foo.liquid` passes; `sections/header-group.json` and `config/settings_data.json` are guarded; a merge commit is skipped; the new-branch range (`before` all zeros) is resolved against the default branch; paths with spaces and non-ASCII names are read correctly.
3. `npm.cmd run lint:merchant -- --range 0a5fd1d..HEAD` exits 0 on this branch (no merchant changes since then), and the same command over a range that includes a past human merchant commit without a trailer exits 1 and names it (proves the guard on real history).
4. `npm.cmd run test:ci-contract` passes (job names unchanged); `ci.yml` diff is limited to the `Lint` checkout and the new step.
5. No table in `docs/references/**` restates `{% doc %}` parameters (search recorded); each replaced table's guidance not in the `{% doc %}` is kept as prose; `npm.cmd run lint:doc-paths` passes.
6. `npm.cmd run test:validators`, `npm.cmd run test:harness`, `npm.cmd run doctor:agent` pass; `npx.cmd prettier --check --ignore-path NUL` on the new script, its test, `routes.json` and `package.json`; `git diff --check` clean.
7. `AGENTS.md` diff touches only the two places in item 4.
8. After commit and push of the batch, the `Lint` job on GitHub passes with the new step (run link recorded; the user pushes or approves the push).

**Review tier:** Ask (workflow, validator wiring, agent rules). Execution: external prompt, then a separate verifier; complete only on PASS and check 8.

**Next (board):** H4, prose slimming with the bundled Pending migration approval; it closes the harness round.

## Progress

- Authorized (user, 2026-10-20): the four coordinator choices stand. Standing guidance from H2: the leanest implementation that meets the checks; record any simplification as a deviation.
- Implemented (2026-10-20). Not committed, not pushed, not accepted. No Agent Skills trigger (no motion, GSAP consumer, or visual-direction change).

### Deviations

- The layout-primitives table is one table for five snippets (`section-frame`, `heading`, `text`, `button`, `content-group`). The whole table was replaced; a `section-frame`-only edit would have left the other rows restating `{% doc %}` parameters.
- Image `## Parameters` is a pointer only. Cells that repeated the `{% doc %}` or a section that remains were not copied again. Two phrases were treated as already covered: `mobile_image` "byte-identical to the pre-parameter path" (the doc says output is unchanged from the desktop-only path) and `wrapper_class` "preferred" (the doc says `class` is a deprecated alias and `wrapper_class` is canonical). Display Modes and the ratio-vocabulary table stay; they are not parameter lists.
- This Git's `git interpret-trailers --parse` still prints `Merchant-Change:` when the value is empty or whitespace. The guard treats a whitespace-only value as missing, which is the plan's non-empty reason.
- A `Merchant-Change:` line above the trailer block is a test, from the engineering constraint, in addition to the numbered checks.
- An all-zero `before` of 64 characters resolves like one of 40, so a SHA-256 new-branch push uses `origin/<default_branch>` too.

### `{% doc %}` comparison

No `{% doc %}` block lacks a parameter the reference table had. Snippets were not edited. The tables were subsets of the docs. Parameters present in the doc and absent from the table: `section-frame` `section_class`, `root_class`, `inner_class`; `heading` `class`; `text` `element`, `class`, `style`; `button` `type`, `class`, `aria_label`; `content-group` `class`; `image` `url`, `interactive`, `wrapper`, `width`, `height`, `crop`, `decoding`, `placeholder_key`, `placeholder_class`, `placeholder_aspect_ratio`, `extra_attributes`.

Guidance kept because the `{% doc %}` does not carry it: `scheme_target: none` keeps `HEAD`'s colour-scheme placement; `section-frame__overlay-safe-top` on a top block for the first-section header offset when padding is overlay; `clip: false` adds `section-frame--no-clip`; Alpine mount attributes belong on an inner element in `children`; `content-group` is not a generic flex wrapper.

### Parameter-table search

Command: `rg -n --glob "*.md" -e "Parameters \(semantic\)" -e "^\| Parameter \| Meaning \|" -e "^## Parameters$" docs/references`

Before:

- `docs/references/style-system/image-display-contract.md:18:## Parameters`
- `docs/references/style-system/image-display-contract.md:20:| Parameter | Meaning |`
- `docs/references/architecture/abstraction-boundaries.md:60:| Snippet | Parameters (semantic) | Notes |`

After: one hit, `docs/references/style-system/image-display-contract.md:18:## Parameters` (the pointer heading, not a table). A follow-up `rg -n --glob "*.md" "^\| (Snippet \| Parameters|Parameter \| Meaning)" docs/references` exited 1 with no hits.

### Validation

| Check | Command | Result |
| --- | --- | --- |
| Surface | `git diff --name-only` and `git status --short` | Tracked: `.agents/tools/harness/routes.json`, `.github/workflows/ci.yml`, `AGENTS.md`, `docs/agent/board.md`, `docs/agent/context.md`, `docs/references/architecture/abstraction-boundaries.md`, `docs/references/style-system/image-display-contract.md`, `package.json`. Untracked: `.agents/tools/merchant-guard.mjs`, `.agents/tools/merchant-guard.test.mjs`. `board.md` and `context.md` were already modified before this execution (H3 plan; H2 closed and H4 on the board). This execution added Progress and changed the H3 board line to implemented, awaiting review. |
| `AGENTS.md` | `git diff -- AGENTS.md` | Two hunks: the merchant-list sentence, and one Validation row for `.agents/tools/merchant-guard.mjs` |
| `ci.yml` | `git diff -- .github/workflows/ci.yml` | Lint checkout `fetch-depth: 0`, and one step `npm run lint:merchant`. Job names unchanged |
| Guard tests | `npm.cmd run test:merchant` | 12 pass, 0 fail |
| Passing range | `npm.cmd run lint:merchant -- --range 0a5fd1d..HEAD` | `Merchant path guard passed.` Exit 0 |
| Failing range | `npm.cmd run lint:merchant -- --range 0ea9051aedcdf4a10a20a87b22db782c40612b08..0ff2b99eba1fa969acda01461de389d4b673403e` | Exit 1. `0ff2b99eba1fa969acda01461de389d4b673403e feat(6-P5..6-P7): carousel dots, product page right column, template: templates/product.json`. Human commit `0ff2b99eba1fa969acda01461de389d4b673403e` (`1834879843@qq.com`, one parent `0ea9051aedcdf4a10a20a87b22db782c40612b08`, path `templates/product.json`, no trailer). Found with `git log -z --format=%H%x00%ae%x00%s%x00%B` over `config/settings_data.json`, `:(glob)templates/*.json`, and `:(glob)sections/*-group.json`, excluding `79544226+shopify[bot]@users.noreply.github.com` |
| CI contract | `npm.cmd run test:ci-contract` | 18 pass, 0 fail |
| Validators | `npm.cmd run test:validators` | Exit 0. Nested: `test:i18n` 33 pass; `test:theme-architecture` 243 pass; `test:section-stylesheet-carry` 3 pass; `test:doc-paths` 7 pass; `test:ci-contract` 18 pass; `test:harness` 7 pass; `test:merchant` 12 pass |
| Harness | `npm.cmd run test:harness` | 7 pass, 0 fail |
| Doc paths | `npm.cmd run lint:doc-paths` | `Doc path lint passed.` |
| Doctor | `npm.cmd run doctor:agent` | Exit 0 |
| Prettier | `npx.cmd prettier --check --ignore-path NUL` on the new script, its test, `routes.json`, and `package.json` | `All matched files use Prettier code style!` |
| Whitespace | `git diff --check` | Exit 0, no output |

### Check 8 (owed after commit and push)

This session did not commit or push. After the user asks for both:

1. Commit the batch.
2. Push the branch (the user pushes or approves the push).
3. Open the GitHub Actions run for that push.
4. Confirm the job named `Lint` passed, including the step `npm run lint:merchant`.
5. Record the run URL in this Progress section.

### Not decided

Open board decisions were not decided: stylesheet raw spacing, `impeccable` adoption, the polish design choices, Lighthouse CI leftovers, the layout harness page-margin rule, and whether the Batch SOP stays always-on.

**Coordinator review (2026-10-20), two fixes before the verifier:**
1. **Pre-guard history.** The future pull request of this branch into `main` (`origin/main..HEAD`, 253 commits) failed on past human commits that changed merchant paths before the trailer rule existed (24 violations with `merchantGuardFrom` disabled; the earlier "15" came from truncated output, corrected in verifier round 2). Fixed: `routes.json` `merchantGuardFrom` (`aa14969`, the last commit before H3); commits reachable from it are excluded (`git log ... --not <sha>` when the commit exists in the clone). `npm.cmd run lint:merchant -- --range origin/main..HEAD`: `Merchant path guard passed.` Test added.
2. **Force-pushed `before`.** A push whose `before` is not in the clone made `git log` fail and the job red. Fixed: such a push resolves like a new branch (`origin/<default branch>..after`). Test added.
Acceptance check 3 now proves the guard on real history with the start commit disabled: `collectMerchantViolations(root, '0ea9051..0ff2b99', null)` returns `0ff2b99 ... templates/product.json` (the CLI over that range passes, as the commit predates the guard). After: `npm.cmd run test:merchant` 14 pass 0 fail; `npm.cmd run test:validators` exit 0; `npm.cmd run test:harness` 7 pass; prettier on the guard, its test, `routes.json` and `package.json` pass.

**Verifier round 1 (external session, 2026-10-20): FAIL.** Findings and coordinator fixes: (1) a root commit on an orphan branch showed no paths (`git diff-tree` without `--root`), so its merchant change passed; fixed with `--root`, orphan-branch test added. (2) A push deleting a branch or tag (`after` all zeros) failed the job with an invalid range; it now passes as a no-op, test added and the CLI run with such an event prints `Merchant path guard passed: the push deletes a ref.` After: `npm.cmd run test:merchant` 16 pass 0 fail; `npm.cmd run test:validators` exit 0.

**Verifier round 2 (external session, 2026-10-20): FAIL.** Round-1 fixes confirmed; acceptance 1-7 passed. Findings and coordinator fixes: (1) a fork pull request may arrive with an empty `pull_request` payload, which made the job fail; it now falls back to the checked-out PR merge commit's parents (`HEAD^1..HEAD^2`), and only throws when neither exists; tests cover the range and a CLI run that catches a fork merchant change. (2) The deletion test now runs the CLI with event files for a branch and a tag deletion. (3) The pre-guard count above corrected. After: `npm.cmd run test:merchant` 18 pass 0 fail.

**Verifier round 3 (external session, 2026-10-20): PASS**, no findings; acceptance 1-7 proven with fresh evidence. Remaining merge condition: acceptance 8, the `Lint` run on GitHub after commit and push.
