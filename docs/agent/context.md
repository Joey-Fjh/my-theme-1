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
