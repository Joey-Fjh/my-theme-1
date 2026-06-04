---
name: agent-router
description: Route non-trivial Shopify theme agent work before implementation. Use when a task needs classification, skill selection, docs routing, validation planning, third-party skill evaluation, governance/doc cleanup, review versus implementation boundaries, or when the user asks broadly to implement, review, validate, refactor, investigate, plan, clean up, or continue cross-session work.
---

# Agent Router

Use this skill as the project task dispatcher. It does not replace implementation, review, or validation skills; it decides which docs, skills, and checks should be used.

## Workflow

1. Read `AGENTS.md` first.
2. Classify the task by intent, ownership, risk, and allowed action.
3. Read `docs/references/agent-workflow/collaboration-standard.md` when deciding whether the task is non-trivial or when the user provides an override such as review-only, prompt-only, or scope limits.
4. Read `docs/references/agent-workflow/skill-routing.md` for the routing matrix when the task is non-trivial, ambiguous, broad, cross-session, governance-related, or touches multiple rule families.
5. Read `docs/references/agent-workflow/external-skills.md` before using or recommending third-party skills.
6. Route to the smallest relevant project skill or docs reference.
7. State the intended route before acting when the task is broad, risky, or likely to trigger multiple skills.

## Routing Principles

- `AGENTS.md` is the rule source.
- `docs/references/` stores long shared references.
- `.agents/skills/` stores project-approved reusable workflows and deterministic tool resources.
- Tool-specific directories such as `.claude/`, `.codex/`, or `.cursor/` are adapters, not project knowledge sources.
- Third-party skills are not project rules until adapted and approved.
- Users may state intent naturally; manual skill names are optional overrides.
- User overrides such as review-only, plan-only, prompt-only, scope limits, merchant-owned approval, external skill permission, or skipped validation must be honored within `AGENTS.md` boundaries.

## Common Routes

- Implementation or cleanup: use `implement-theme-pattern`, then validate with `run-shopify-theme`.
- Review, diff inspection, launch readiness, or blocker classification: use `code-review`.
- Validation, lint, Theme Check, Tailwind or SVG command choice: use `run-shopify-theme`.
- i18n, locale keys, user-facing copy, schema text, ARIA labels: use `check-i18n`.
- Liquid/JS architecture, cart, HTTP, SectionRefresher, Alpine, headings: use `check-theme-architecture`.
- Icon source or generated SVG assets: use `build-svg-icons`.
- Collaboration standard, routing, third-party skill governance, MCP/hooks planning, or docs structure: read the matching `docs/references/agent-workflow/` reference.

## Output

For non-trivial routing, report:

```text
Intent:
Risk:
Docs:
Skills:
Validation:
Notes:
```

Keep the route short. Do not load every docs reference or every skill.
