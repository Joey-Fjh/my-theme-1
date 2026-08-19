# Launch Gate And Review Reference

Launch-readiness decision boundaries that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source.

## Lighthouse Issue Classification

Before changing code for a Lighthouse finding, classify it as one of:

1. Theme code issue.
2. Merchant configuration issue.
3. Merchant content or copy issue.
4. Uploaded asset or media issue.
5. Shopify platform, app, or vendor issue.
6. Measurement noise or run-to-run variance.

Do not code-fix configuration, content, asset, platform, or measurement-noise issues unless the user explicitly authorizes that scope.

For every Lighthouse code change, report: audit id, affected element or request, why it is code-owned, exact file changed, expected metric impact, and re-test instruction.

Color scheme contrast, merchant copy, collection/product content, uploaded media compression, Shopify platform scripts, app scripts, and vendor payloads are not theme-code issues by default.

## Accessibility Review Boundary

Accessibility is a hard Theme Store requirement. `AGENTS.md` already requires semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.

During launch review, verify user-facing controls, navigation, forms, dialogs, drawers, filters, search, cart, product media, and checkout-adjacent flows remain keyboard-operable, named, and understandable. Icon-only controls need translated accessible names. Dynamic status updates need appropriate live-region semantics when needed. Hidden UI must not retain reachable focus. Content access must not depend on animation, hover-only interaction, pointer dragging, or mouse-only controls.

Inspect touched interactive surfaces; do not treat accessibility as optional polish.

## Cleanup Safety

When normalizing older code:

1. Audit first; group findings by rule family.
2. Clean one rule family per change set when possible.
3. Preserve storefront behavior, schema IDs, block types, section types, and template references unless the task explicitly asks to change them.
4. Run the smallest relevant checks after each batch.

Do not redesign sections, rename schema identifiers, change business logic while fixing architecture, edit generated assets directly, or expand shared abstractions without passing the abstraction boundary gate. If a violation is widespread, stage cleanup instead of changing the entire theme in one pass.

## Repo Safety And Ignore Boundaries

- Never edit minified vendor files, `assets/tailwind.output.css`, or generated `assets/icon-*.svg`.
- Prefer minimal diffs; separate structural refactors from behavior changes.
- `.shopifyignore` controls Shopify CLI upload scope.
- `.gitignore` controls version-control scope.
- `.prettierignore` controls formatting scope only.

Tracked governance files such as `AGENTS.md` and `docs/references/agent-workflow/` must remain in Git, must be excluded from Shopify upload, and should remain Prettier-formatted unless there is a specific formatting risk. Do not add broad ignore patterns that hide source files, runtime files, schemas, locales, sections, snippets, templates, or config from review.

## Review Output

When reporting a review, use:

- **Blockers:** Critical issues that make the change unsafe to merge. If none, output `None`.
- **Warnings:** Non-blocking issues, edge cases, or consistency problems.
- **Suggestions:** Actionable improvements for maintainability, UX, accessibility, or performance.
- **Conclusion:** Output exactly `APPROVE` or `REQUEST CHANGES`.

## Gate Validation

- During development, run the smallest command that proves each change; see `AGENTS.md`.
- Tooling enforces many architecture, i18n, and compatibility rules; review-only gaps remain launch blockers when user-facing.
- Before PR, version/release, or Theme Store submission, run `npm.cmd run lint` and `npm.cmd test`.
- Run `npm.cmd run scan:compat` when Tailwind source changed.
- Run `npm.cmd run build:svg` when files in `icons/` changed.
