# Agent Rule Coverage

Use this file to decide whether a rule in `AGENTS.md` is enforced by tooling, checked during review, or still known legacy debt.

`AGENTS.md` remains the source of truth. If this file conflicts with `AGENTS.md`, follow `AGENTS.md` and update this file.

## Coverage Status

| Rule family | Current coverage | Gate | Status |
| --- | --- | --- | --- |
| Inline `<script>` in Liquid | `tools/lint-theme.js` AST check | Blocker | Enforced |
| Inline `<style>` in Liquid | `tools/lint-theme.js` AST check | Blocker | Enforced |
| Complex `x-data` values | `tools/lint-theme.js` partial check | Blocker for new code | Partially enforced |
| Raw `fetch()` in application code | `tools/lint-theme.js` JS-pattern check | Blocker | Enforced |
| Direct cart endpoints outside cart store | `tools/lint-theme.js` JS-pattern check | Blocker | Enforced |
| Manual section HTML replacement | `tools/lint-theme.js` JS-pattern check | Blocker | Enforced |
| Alpine component group references | `tools/lint-theme.js` JS-pattern check | Blocker | Enforced |
| Heading text-size utilities | `tools/lint-theme.js` Liquid-pattern check | Blocker | Enforced |
| Heading class on non-heading elements | `tools/lint-theme.js` Liquid-pattern check | Blocker | Enforced |
| Redundant matching heading classes | Review only | Warning | Not automated |
| Redundant default body typography classes | Review only | Warning | Legacy debt exists |
| CSS layer placement | Review only plus stylelint | Warning | Partially enforced |
| Motion recipe usage | Review only | Warning | Partially enforced |
| Accessibility semantics | Review only | Launch blocker when user-facing | Not automated |
| SEO metadata and structured content | Review only plus Lighthouse | Launch blocker when missing | Not automated |
| Generated files not hand-edited | Review only | Warning | Not automated |

## Interpretation

- **Enforced**: `npm run lint` should fail when the rule is violated.
- **Partially enforced**: tooling catches common violations, but review is still required.
- **Review only**: agents must check manually using `AGENTS.md` and related examples.
- **Legacy debt exists**: old code may still violate the preference; do not assume the whole theme is clean.

## Launch Policy

- A rule violation is a **blocker** when it can break runtime behavior, cart/checkout flow, section refresh, user input, accessibility, SEO indexing, or Lighthouse 95+ targets.
- A rule violation is a **warning** when it is mostly consistency, maintainability, or future cleanup risk.
- Widespread warnings should be staged after launch unless they affect Lighthouse or production stability.

## Known Follow-Ups

1. Add a typography lint for redundant default body classes after the `body` default size and `body-md` semantics are aligned.
2. Add a lint for redundant matching heading classes such as `<h2 class="h2">`.
3. Add a lint for empty `{% stylesheet %}` blocks.
4. Add a focused accessibility audit checklist for controls, dialogs, drawers, tabs, overlays, and predictive search.
5. Add a Lighthouse CI wrapper when the deployment URL and preview workflow are stable.
