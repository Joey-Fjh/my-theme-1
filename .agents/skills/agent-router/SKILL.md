---
name: agent-router
description: Route non-trivial Shopify theme agent work. Use when a task needs classification, skill or docs selection, validation planning, third-party skill evaluation, governance, or cross-session continuation.
---

# Agent Router

Use this skill as the project task dispatcher. It does not replace implementation, review, or validation skills; it decides which docs, skills, and checks should be used.

## Workflow

1. Read `AGENTS.md` first.
2. Classify the task by intent, ownership, risk, and allowed action.
3. Read `docs/references/agent-workflow/collaboration-standard.md` when deciding whether the task is non-trivial or when the user provides an override such as review-only, prompt-only, or scope limits.
4. Read `docs/references/agent-workflow/skill-routing.md` for the routing matrix when the task is non-trivial, ambiguous, broad, cross-session, governance-related, or touches multiple rule families.
5. Read `docs/references/agent-workflow/external-skills.md` for adoption history before recommending new third-party skills.
6. Route to the smallest relevant project skill or docs reference.
7. Apply the delegation test in `docs/references/agent-workflow/multi-agent-architecture.md` when independent subproblems, noisy output, or separate verification may justify multiple agents.
8. State the intended route before acting when the task is broad, risky, or likely to trigger multiple skills or agents.

## Routing Principles

- `AGENTS.md` is the rule source.
- `docs/references/` stores long shared references.
- `.agents/skills/` stores project-approved reusable workflows and deterministic tool resources.
- `.agents/roles/` and `.agents/contracts/` store portable role and handoff contracts.
- Tool-specific directories such as `.claude/`, `.codex/`, or `.cursor/` are adapters, not project knowledge sources.
- Third-party skills are not project rules until adapted and approved.
- Users may state intent naturally; manual skill names are optional overrides.
- User overrides such as review-only, plan-only, prompt-only, scope limits, merchant-owned approval, external skill permission, or skipped validation must be honored within `AGENTS.md` boundaries.

## Common Routes

- Implementation or cleanup: use `implement-theme-pattern`, then validate with `run-shopify-theme`.
- Ambiguous or broad user request (unclear scope, needs clarification): use `confusion-protocol`.
- Architecture decisions needing verification: use `verify-architecture`.
- Complex or broad implementation (multi-section, cross-component): use `implement-theme-pattern`.
- UI/CSS design, accessibility, or responsive patterns: use `frontend-design`.
- Review, diff inspection, launch readiness, or blocker classification: use `code-review`.
- Debugging or root-cause investigation: use `implement-theme-pattern`.
- Validation, lint, Theme Check, Tailwind or SVG command choice: use `run-shopify-theme`.
- i18n, locale keys, user-facing copy, schema text, ARIA labels: use `check-i18n`.
- Liquid/JS architecture, cart, HTTP, SectionRefresher, Alpine, headings: use `check-theme-architecture`.
- Icon source or generated SVG assets: use `build-svg-icons`.
- Multi-agent context isolation, parallel read-only work, or independent implementation and review: use `orchestrate-agents` after this router.
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
