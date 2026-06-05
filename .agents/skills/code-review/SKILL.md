---
name: code-review
description: Review Shopify theme changes for launch readiness, Theme Check risk, architecture, i18n, accessibility, SEO, and merchant-owned boundaries. Use when asked to review code, inspect a diff, or classify blockers.
---

# Code Review

Use this skill for review-only work. Do not refactor while reviewing unless the user explicitly asks for implementation after the review.

## Workflow

1. Read `AGENTS.md` first. It is the authority for repository rules.
2. Follow `AGENTS.md` behavior rules for question policy, task frame, and cross-session context.
3. Inspect the current diff and the files changed by the task.
4. Classify findings by `AGENTS.md` rule strength and launch impact.
5. Report findings before summaries, ordered by severity.

## References

Load only the reference that matches the review scope:

- `docs/references/code-review/pre-merge.md` for general Shopify theme pre-merge review.
- `docs/references/code-review/i18n-checklist.md` for translation, schema locale, and hardcoded copy review.

For implementation-pattern checks, use `docs/references/patterns/` and load only the matching pattern reference.

## Output

Use this order:

1. **Blockers:** launch-blocking or unsafe-to-merge issues. Use `None` if none.
2. **Warnings:** non-blocking issues or post-launch debt.
3. **Suggestions:** optional improvements.
4. **Conclusion:** exactly `APPROVE` or `REQUEST CHANGES`.

Include file and line references whenever possible. Do not promote style preferences to blockers unless `AGENTS.md` makes them launch-blocking for the touched scope.
