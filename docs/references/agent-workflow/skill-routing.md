# Skill Routing Reference

How agents route tasks to project skills, docs, and validation commands. `AGENTS.md` remains the rule source.

## Routing Model

```text
User request
  -> AGENTS.md entry rules
  -> agent-router classification
  -> orchestrate-agents when the delegation test passes
  -> docs/skill selection
  -> inspect source and implement or review
  -> smallest relevant validation command
```

## Non-Trivial Tasks

A task is non-trivial when it requires editing files, reviewing or classifying risk, choosing rules/docs/skills/validation, touching multiple rule families, handling merchant-owned or launch-risk boundaries, continuing cross-session work, or evaluating governance changes.

Use `agent-router` first for non-trivial tasks. Skip it only for explicit single-step, low-risk, no-edit, no-choice tasks.

### User Overrides

- `review only` / `只审不改`: inspect and report; do not refactor.
- `plan only` / `只出计划`: produce a plan; do not edit.
- `prompt only` / `只写 prompt`: produce a prompt; do not implement.
- `limit scope to ...`: inspect or edit only named files or directories.
- `merchant-owned allowed`: merchant-owned files or content may be edited within stated scope.
- `skip validation ...`: skip a named validation command and report the reason.

Overrides cannot bypass `AGENTS.md`, launch blockers, or merchant-owned boundaries unless explicitly authorized.

## Task Classes

| Task class | Route | Read before acting | Validation |
| --- | --- | --- | --- |
| Implement or change theme behavior | Inspect current source + matching architecture reference | As needed from architecture/style docs | Smallest `AGENTS.md` command for the changed surface |
| Ambiguous, broad, or high-risk request | `agent-router` | Matching architecture reference | Discuss with user before editing |
| Review diff or launch readiness | `agent-router` | `code-review/launch-gate.md` | Targeted checks when needed |
| Browser compatibility audit | `check-theme-architecture` | `code-review/browser-compatibility.md` | `npm.cmd run lint:compat` or `scan:compat` |
| i18n or user-facing copy | `check-i18n` | `code-review/i18n-checklist.md` | `npm.cmd run lint:i18n` |
| Liquid/JS architecture | `check-theme-architecture` | Matching architecture reference | `npm.cmd run lint:theme` |
| SVG icon pipeline | `build-svg-icons` | `AGENTS.md` icon rules | `npm.cmd run build:svg` when icons changed |
| Multi-agent orchestration | `orchestrate-agents` after `agent-router` | `multi-agent-architecture.md` | Shared result contract plus domain validation |
| Collaboration, routing, governance | `agent-router` | `AGENTS.md` and this file | `git diff --check` for docs-only work |

## Decision Rules

- Use one primary skill whenever possible.
- Read docs only when the task touches that domain.
- Inspect current source instead of deleted cookbook examples.
- Use multiple agents only when the delegation test in `multi-agent-architecture.md` proves value. Keep one writer in a shared worktree.

## Fallback Without Skill Auto-Triggering

1. Read `AGENTS.md`.
2. Read this routing reference.
3. Manually open only the routed `.agents/skills/<name>/SKILL.md`.

## Hooks And MCP Boundary

- Hooks enforce deterministic lifecycle checks; MCP provides external tool/data access.
- Delegated results must pass `.agents/skills/orchestrate-agents/scripts/agent-result-validator.cjs` through vendor hooks such as `.codex/hooks.json` and `.cursor/hooks.json`. See `multi-agent-architecture.md`.
- `.cursor/agents/` are thin adapters to `.agents/roles/`; do not create a duplicate `.cursor/skills/` tree.
- Do not store project rules or long references in hooks or MCP configuration.

Project MCP allowlist:

- `shopify-dev-mcp`: Shopify API, Liquid, and theme architecture queries.
- `context7`: Tailwind CSS documentation queries.

Keep the shared allowlist identical in every adapter that declares MCP servers.

## Routing Updates

- New project skill: update this table and, if common, `agent-router`.
- New multi-agent role/contract: update `multi-agent-architecture.md`, `.agents/roles/` or `.agents/contracts/`, and affected vendor adapters.
- New long reference: add under `docs/references/` and route from `AGENTS.md` only when discoverability is needed.

## Skill And Docs Authoring

Skills are executable workflows, not knowledge bases. Keep SKILL.md limited to triggers, workflow steps, docs to read, guardrails, and validation choice. Long-lived knowledge belongs in `docs/`. Cross-session state belongs in `docs/agent/context.md` and must stay short.
