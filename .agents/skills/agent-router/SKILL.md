---
name: agent-router
description: Route non-trivial Shopify theme agent work. Use when a task needs classification, skill or docs selection, validation planning, governance, or cross-session continuation.
---

# Agent Router

Use this skill as the project task dispatcher. It chooses docs, skills, and checks; it does not implement theme behavior.

## Workflow

1. Read `AGENTS.md` first.
2. Classify the task by intent, ownership, risk, and allowed action.
3. Read `docs/references/agent-workflow/skill-routing.md` when the task is non-trivial, ambiguous, broad, cross-session, governance-related, or touches multiple rule families.
4. Inspect repository evidence before choosing an implementation path. Consult Shopify Dev MCP or Context7 when framework behavior is unclear.
5. Discuss unresolved architecture or merchant-owned choices with the user before implementation when the route is not obvious from source.
6. Route to the smallest relevant project skill or docs reference.
7. Apply the delegation test in `docs/references/agent-workflow/multi-agent-architecture.md` when independent subproblems, noisy output, or separate verification may justify multiple agents.
8. State the intended route before acting when the task is broad, risky, or likely to trigger multiple skills or agents.

## Routing Principles

- `AGENTS.md` is the rule source.
- `docs/references/` stores on-demand explanations and decision boundaries.
- `.agents/skills/` stores reusable workflows and deterministic tool resources.
- `.agents/roles/` and `.agents/contracts/` store portable role and handoff contracts.
- Tool-specific directories such as `.claude/`, `.codex/`, or `.cursor/` are adapters, not project knowledge sources.
- Users may state intent naturally; manual skill names are optional overrides.
- User overrides such as review-only, plan-only, prompt-only, scope limits, merchant-owned approval, or skipped validation must be honored within `AGENTS.md` boundaries.

## Common Routes

- Theme implementation or cleanup: inspect current source and the matching architecture reference; validate with the smallest `AGENTS.md` command for the changed surface.
- Ambiguous, broad, or high-risk requests: classify ownership and risk, inspect evidence, consult MCP when relevant, and ask the user before editing.
- Review, diff inspection, or launch readiness: read `docs/references/code-review/launch-gate.md`; run targeted validation only when needed.
- i18n, locale keys, user-facing copy, schema text, ARIA labels: use `check-i18n`.
- Liquid/JS architecture, cart, HTTP, SectionRefresher, Alpine, headings, compatibility: use `check-theme-architecture`.
- Icon source or generated SVG assets: use `build-svg-icons`.
- Multi-agent context isolation, parallel read-only work, or independent implementation and review: use `orchestrate-agents` after this router.
- Collaboration, routing, governance, MCP/hooks planning, or docs structure: read the matching `docs/references/agent-workflow/` reference.

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
