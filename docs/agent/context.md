# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; identity, accepted direction, and overall status live in `docs/project.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## 6-T4a Lighthouse CI

**Status:** the user agreed 2026-10-13 ("可以") to write the plan. **Not authorized:** execution waits for the user's explicit go, and dependency D1 must be resolved first.

**Outcome:** every push runs Shopify's official Lighthouse CI action against the CI store. The run fails when the home, product or collection page scores below the Theme Store bar: performance 0.6, accessibility 0.9. `test:layout` in CI is a separate later batch (6-T4b, on `docs/agent/board.md`).

**Review tier:** Ask (validator wiring: `.github/workflows/ci.yml`).

### Facts (checked 2026-10-13)

- **CI store:** `ci-test-rjx6y0iz.myshopify.com`, created by the user 2026-10-13. It is a Dev store on the Basic plan, holds only Shopify's performance test product CSV (20 collections, `collection1`…`collection20`), and is password-protected.
- **App:** Dev Dashboard app `lighthouse-ci`, version v1, scopes `read_products,write_themes`, installed on ci-test.
- **Secrets:** repository secrets `SHOP_STORE`, `SHOP_CLIENT_ID`, `SHOP_CLIENT_SECRET` and `SHOP_PASSWORD` were added by the user to `Joey-Fjh/my-theme-1`. The repository is public: secrets are not passed to workflows triggered from forks, and Actions minutes are free.
- **What the action does each run** (`Shopify/lighthouse-ci-action`, `entrypoint.sh`, read 2026-10-13):
  1. Exchanges the client ID and secret for a token.
  2. Runs `shopify theme push --development` with this commit's files, filtered by `.shopifyignore`.
  3. Audits `/`, the first published product, and the first **custom** collection (`custom_collections.json`).
  4. Asserts a minimum score per page on the median run. That is stricter than the Theme Store's average across pages.
  5. Deletes the development theme on exit (`trap cleanup`).
  6. Uploads the reports to `temporary-public-storage` (public, unguessable URLs).
- **Collection risk:** the collection list in the store admin showed a conditions column, so the CSV collections may be smart collections. In that case `custom_collections.json` returns none and the collection URL becomes `/collections/null`. Passing `collection_handle` explicitly avoids it (D1).

### Dependencies

- **D1 (user): resolved 2026-10-13.** The handle is `collection1`: the store admin's search engine listing shows `ci-test-rjx6y0iz.myshopify.com › 产品系列 › collection1`.

### Implementation surface

- `.github/workflows/ci.yml`: one new job `lighthouse`, triggered on `push` only, because fork pull requests get no secrets. It has a `concurrency` group per ref with `cancel-in-progress`, so a newer push cancels an older audit. Steps:
  - `actions/checkout@v4`;
  - `shopify/lighthouse-ci-action@v1` with `store`, `client_id`, `client_secret`, `password` from the four secrets, `collection_handle` from D1, and explicit `lhci_min_score_performance: 0.6` and `lhci_min_score_accessibility: 0.9`.

  The existing `lint` and `theme-check` jobs are unchanged. No `lhci_github_*` token: the result shows as the job's own pass or fail.
- `docs/references/code-review/launch-gate.md`: one line in the gate validation section. It says the CI `lighthouse` job audits home, product and collection on the CI store with Shopify's performance test data, and that it previews the Theme Store bar but is not the review itself.
- **Record files:** this file, `docs/agent/board.md` (6-T4b entry), and `docs/project.md` at close.

**Forbidden:**
- theme files;
- `package.json`;
- the layout check harness and its baseline (6-T4b);
- `.shopifyignore`;
- branch protection settings (the user's choice, not a file);
- any secret value in a file, log or chat.

### Acceptance checks

1. `git diff HEAD -- .github/workflows/ci.yml`: only the new `lighthouse` job is added, and `lint` and `theme-check` are byte-identical. The YAML parses (`node -e` with a YAML parser available in `node_modules`, or `npx yaml-lint`; name the command).
2. The job references only `secrets.SHOP_STORE`, `secrets.SHOP_CLIENT_ID`, `secrets.SHOP_CLIENT_SECRET` and `secrets.SHOP_PASSWORD`, and contains no literal store domain, password or token (`git grep`).
3. **First real run** (needs a push, which the user authorizes separately). Use `gh run list --workflow CI` and `gh run view <id> --log` to show:
   - the theme push succeeded;
   - three URLs were audited, and the collection URL uses the D1 handle;
   - the scores per page, with the job's pass or fail;
   - the cleanup step "Disposing development theme" ran.

   Record the scores in this file. A score below the bar is a finding about the theme, not a defect of this batch.
4. After the run, ci-test has no leftover development theme. The user checks Online Store → Themes, or the log shows the delete.
5. `npm.cmd run lint:doc-paths` and `npm.cmd run doctor:agent` pass; `git diff --check HEAD` is clean; `git diff --stat HEAD` shows only the surface.
6. Independent review (Ask) reports PASS.

## 6-T4a: executed, first run failed (authentication)

Authorized 2026-10-13 ("可以啊，执行并推送，只要不影响主分支就可以"): implement and push `refactor/skeleton-shell`; `main` untouched. Commit `6ceb2b6`, pushed.

Static checks, all passed:
- `js-yaml` parses the workflow into the jobs `lint`, `theme-check` and `lighthouse`.
- `git grep -n -i 'myshopify\|rjx6y0iz' .github` returns nothing (exit 1).
- `lint:doc-paths` passes; `doctor:agent` exits 0; `git diff --check` is clean.
- `npx prettier --check .github/workflows/ci.yml` passes; Prettier does cover this file.

**Run 1:** `gh run view 38362521872`. Lint, Theme Check and Theme Check Report succeeded; **Lighthouse failed**.
- **Cause:** the Lighthouse step "Creating development theme" stopped on `themeCreate`: "Access denied ... The user needs write_themes and an exemption from Shopify to modify themes". A Dev Dashboard app with `write_themes` is not enough. Modifying themes through an app token needs an exemption from Shopify, granted through a request form.
- The action then continued. It resolved the product handle through the app token (`amazing-cotton-bag-collection15`) and set the password cookie. It failed at the preview cookie, because no theme was created, so the preview URL was invalid.
- No theme was created on ci-test, so there was nothing to clean up.
- This is a platform permission problem, not a theme finding.

**Proposed correction (needs the user's approval):** authenticate with a **Theme Access password** instead of the Dev Dashboard app.
- Shopify's docs, through the Dev MCP: the Theme Access app generates passwords scoped to `write_themes` for Shopify CLI, used in CI through `SHOPIFY_CLI_THEME_TOKEN`. The action exports exactly that from its `access_token` input.
- A Theme Access password cannot read products through the Admin API. The action calls that API only when no handle is given, so the job passes both `product_handle: amazing-cotton-bag-collection15` and `collection_handle: collection1`.
- **User steps:** install the Theme Access app on ci-test; create a password for the user's own email; add it as the repository secret `SHOP_ACCESS_TOKEN`.
- **Workflow change:** `access_token: ${{ secrets.SHOP_ACCESS_TOKEN }}` replaces `client_id` and `client_secret`, and `product_handle` is added.
- The `lighthouse-ci` app and its two secrets are then unused. Removing them is the user's choice.

**Correction approved (user, 2026-10-13):** the user installed Theme Access on ci-test, added `SHOP_ACCESS_TOKEN`, and asked to continue ("这一步已经配置好了，接下来了？").
- The `lighthouse` job now uses `access_token: secrets.SHOP_ACCESS_TOKEN` with `product_handle: amazing-cotton-bag-collection15` and `collection_handle: collection1`.
- Acceptance check 2 now reads: the job references only `secrets.SHOP_STORE`, `secrets.SHOP_ACCESS_TOKEN` and `secrets.SHOP_PASSWORD`.

**Run 2:** `gh run view 38363613541`, commit `851ca19`. All four jobs succeeded.
- The theme push created development theme `190864032057` on ci-test.
- Three URLs were audited three times each: `/`, `/products/amazing-cotton-bag-collection15` and `/collections/collection1` (the D1 handle).
- "Checking assertions against 3 URL(s), 9 total run(s)" was followed by "All results processed!".

Median-run scores, read from the three uploaded reports (`window.__LIGHTHOUSE_JSON__`, mobile form factor):

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 0.72 | 0.93 | 0.59 | 0.90 | 2.4 s | 560 ms | 0 |
| Product | 0.67 | 0.97 | 0.59 | 0.98 | 3.5 s | 480 ms | 0 |
| Collection | 0.48 | 0.96 | 0.59 | 0.98 | 5.5 s | 890 ms | 0 |

**Two plan facts were wrong; corrected after run 2:**

1. **The gate is not "per page on the median run, stricter than the Theme Store".**
   - lhci's category assertion reads all runs (`getCategoryAssertionResults` in `packages/utils/src/assertions.js`). `aggregationMethod: median-run` is not a value `getValueForAggregationMethod` handles for it, so the result falls through to `Math.max`.
   - The job therefore passes when the **best of three runs** meets the threshold. That is how the collection page passed with a median of 0.48.
   - The `launch-gate.md` line is rewritten to say this.
   - The mobile average of the three medians is 0.62. The collection median of 0.48 is a theme finding for the polish pass and the readiness review. It still needs ownership classification, because the CI store's content differs from the design content. It is not a defect of this batch.
2. **The action does not delete its development theme.**
   - `cleanup()` runs `shopify theme delete -d -f` only when a variable `theme` is set, and `entrypoint.sh` never sets it. The run 2 log has no "Disposing development theme" step.
   - Each run therefore leaves one development theme on ci-test. Per Shopify's CLI docs, development themes do not count toward the theme limit and are deleted after seven days of inactivity.
   - Acceptance check 4 ("no leftover development theme") cannot be met by this action. Whether to add a cleanup step is filed on the board as an open choice.

Best practices 0.59 on all three pages is not gated by the action; it is filed with the Lighthouse findings.

Checks 1, 2 (as corrected), 3 and 5 pass. Check 4 is not met; the reason is above, and it is the user's decision. Check 6 (independent review) is pending.

**Independent review round 1 (2026-10-13): FAIL.** The job, the run evidence, the score table and both corrected facts were re-proven. Two findings:

1. Acceptance check 4 is unmet and no user disposition is recorded. It is waiting on the user: waive it (accept leftover development themes, which Shopify removes after seven idle days) or approve a cleanup step.
2. `docs/agent/board.md` still said each run "deletes" its theme. Corrected: the sentence now says the action does not delete it.

**Check 4 waived (user, 2026-10-13, "A"):** leftover development themes on ci-test are accepted. Shopify removes them after seven idle days, they do not count toward the theme limit, and ci-test serves CI only. The matching clause of check 3 (the cleanup step ran) is waived for the same reason. No cleanup step is added. A step that deletes all development themes could remove a theme another concurrent run is using. Revisit only if the leftovers cause a real problem.

Independent review round 2: pending.

**Independent review round 2 (2026-10-13): FAIL** on one record defect. Both round 1 findings were confirmed resolved, and `ci.yml` is byte-identical to `851ca19`.
- **Defect:** the board said a cleanup step "would have to delete every development theme". Shopify CLI can delete one theme (`shopify theme delete --theme`).
- **Correction:** the board now says a cleanup step should target the run's own theme, that the action exposes no outputs (`action.yml` has no `outputs` key) so the id must be found another way, and that a blanket delete is only the simpler, riskier variant.
- The waiver sentence above ("A step that deletes all development themes could remove...") describes that blanket variant only.
- The user was told of the correction and the waiver stands unless they say otherwise.

**Independent review round 3 (2026-10-13): PASS**, no findings. The corrected cleanup statement was verified against the Shopify CLI docs and the action's `action.yml`. The user's waiver stands. `ci.yml` is byte-identical to `851ca19` (blob `4da5677f`).

**Batch complete.**
