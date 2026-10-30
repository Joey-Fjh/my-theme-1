# Launch Gate And Review Reference

Read when: classifying a Lighthouse finding, changing an ignore file, planning Theme Store submission, or deciding whether a cleanup is safe.

Launch-readiness boundaries that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source.

## Lighthouse Issue Classification

Before changing code for a Lighthouse finding, classify it as one of:

1. Theme code.
2. Merchant configuration.
3. Merchant content or copy.
4. Uploaded asset or media.
5. Shopify platform, app, or vendor.
6. Measurement noise or run-to-run variance.

Do not code-fix configuration, content, asset, platform, or measurement-noise issues unless the user authorizes that scope.

For every Lighthouse code change, report the audit id, the affected element or request, why it is code-owned, the file changed, the expected metric impact, and how to re-test.

Colour-scheme contrast, merchant copy, collection or product content, uploaded media compression, Shopify platform scripts, app scripts, and vendor payloads are not theme-code issues by default.

There is no computed-style tool. A batch that must prove "no rendering change" rewrites the comparison from `git show 9bf1b64:docs/agent/context.md`: noise per (slot, element path, property), both sides through the online preview, and the first slot of a run lands on `/`.

## Browser sweep

Sweep through the `shopify theme dev` proxy. With an isolated MCP profile, storefront image, section, and search requests return 401 until the storefront password is entered, which hides real failures. Restart `shopify theme dev` before a sweep if it has been left running. The password lives in `.env` (ignored by `.gitignore` and `.shopifyignore`); scripts load it. Never print its value in chat or records.

## Accessibility Review Boundary

Accessibility is required for every retained or added interaction. It does not depend on Theme Store submission scope.

During launch review, confirm that controls, navigation, forms, dialogs, drawers, filters, search, cart, product media, and checkout-adjacent flows stay keyboard-operable, named, and understandable. Icon-only controls need translated accessible names. Dynamic status updates need a live region when the user must hear them. Hidden UI must not retain reachable focus. Content access must not depend on animation, hover-only interaction, pointer dragging, or mouse-only controls.

Inspect the interactive surfaces the change touches.

## Cleanup Safety

When normalizing older code:

1. Audit first, and group findings by rule family.
2. Clean one rule family per change set when possible.
3. Preserve storefront behavior, schema IDs, block types, section types, and template references unless the task asks to change them.
4. Run the smallest relevant checks after each batch.

Do not redesign a section, rename a schema identifier, change business logic while fixing architecture, edit a generated asset directly, or extend a shared abstraction without the abstraction-boundary gate. If a violation is widespread, stage the cleanup.

## Repo Safety And Ignore Boundaries

- Do not edit minified vendor files, `assets/tailwind.output.css`, or optimized `assets/icon-*.svg` directly.
- Prefer a minimal diff. Separate a structural refactor from a behavior change.
- `.shopifyignore` is Shopify CLI upload scope. `.gitignore` is version-control scope. `.prettierignore` is formatting scope only.

Tracked governance files (`AGENTS.md`, `.agents/`, `docs/references/`) stay in Git and stay out of the Shopify upload. Do not add an ignore pattern that hides source, runtime files, schemas, locales, sections, snippets, templates, or config from review. Merchant-owned JSON that the Shopify GitHub integration writes back (`templates/*.json`, `config/settings_data.json`, `sections/*-group.json`) is the formatting exception: `.prettierignore` excludes it, and it stays tracked in Git and in review.

## Review Output

Reviews use the output format in the Output section of `.agents/roles/verifier.md`.

## Gate Validation

- Commands per change surface and for release gates: `AGENTS.md` Validation. Icon import: `docs/references/style-system/css-architecture.md` (SVG Icons).
- Tooling enforces many architecture, i18n, and compatibility rules. A review-only gap on a user-facing surface is still a launch blocker.
- The `Lighthouse` workflow (`.github/workflows/lighthouse.yml`, `shopify/lighthouse-ci-action`) runs on pull requests into `main`, on pushes to `main`, and on manual runs. Development-branch pushes do not trigger it. It audits home, product, and collection on the dedicated CI store, which holds Shopify's performance test product CSV. Each page is audited three times on mobile emulation. The job fails when a page's best run is below performance 0.6 or accessibility 0.9. That gate is coarser than the Theme Store bar (average across pages, desktop and mobile). Read the median scores from the reports linked in the job log. A green job does not prove the bar is met. Classify scores under Lighthouse Issue Classification before any code change.
