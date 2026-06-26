# Skill Routing Reference

This reference defines how agents route tasks to project skills, docs, and validation commands. `AGENTS.md` remains the rule source.

## Routing Model

Use this flow for non-trivial tasks:

```text
User request
  -> AGENTS.md entry rules
  -> agent-router classification
  -> docs/skill selection
  -> implementation or review skill
  -> run-shopify-theme validation
  -> report and cross-session context when needed
```

The router is a dispatcher. It should not become a large manual or duplicate the body of every project skill.

Read `docs/references/agent-workflow/collaboration-standard.md` for the definition of non-trivial tasks, trivial exceptions, and user overrides.

## Task Classes

| Task class | Route | Read before acting | Validation |
| --- | --- | --- | --- |
| Implement theme behavior | `implement-theme-pattern` | Matching architecture or pattern reference | `run-shopify-theme` chooses checks |
| Ambiguous or broad user request | `confusion-protocol` | Matching architecture reference | `run-shopify-theme` chooses checks |
| Architecture decisions with verification | `verify-architecture` | Matching architecture reference | `run-shopify-theme` chooses checks |
| Complex or broad implementation | `implement-theme-pattern` | Matching architecture or pattern reference | `run-shopify-theme` chooses checks |
| UI/CSS design or accessibility | `frontend-design` | Matching architecture reference | `run-shopify-theme` chooses checks |
| Review diff or launch readiness | `code-review` | `code-review/pre-merge.md` or `launch-gate.md` | Review may run targeted checks |
| Debugging or root-cause investigation | `implement-theme-pattern` | Matching architecture reference | Targeted validation of the fix |
| Validate current state | `run-shopify-theme` | Command docs in `AGENTS.md` and relevant skill | Smallest proving command |
| i18n or user-facing copy | `check-i18n` | `code-review/i18n-checklist.md` | `npm.cmd run lint:i18n` |
| Liquid/JS architecture | `check-theme-architecture` | Matching architecture/pattern reference | `npm.cmd run lint:theme` |
| SVG icon pipeline | `build-svg-icons` | Icon rules in style-system reference | `npm.cmd run build:svg` when icons changed |
| Collaboration, routing, governance | `agent-router` | `AGENTS.md` and this file | `git diff --check` for docs-only work |
| Third-party skill evaluation | `agent-router` | `agent-workflow/external-skills.md` (adoption record) | No install unless reviewed and approved |

## Decision Rules

- Use one primary skill whenever possible.
- Add a validation skill only when a command must be selected or explained.
- Read docs references only when the task touches that domain.
- Do not read all pattern references just because implementation is involved.

## Fallback For Agents Without Skill Auto-Triggering

If an agent cannot auto-discover or auto-trigger project skills:

1. Read `AGENTS.md`.
2. Read this routing reference.
3. Manually open only the routed `.agents/skills/<name>/SKILL.md`.
4. Follow that skill and any referenced docs.

Do not copy skill contents into tool-specific adapter directories.

## Hooks And MCP Boundary

Hooks and MCP are adapters and enforcement layers:

- Use hooks for deterministic lifecycle checks, safety gates, context injection, or post-edit validation.
- Use MCP for external tool/data access.
- Do not store project rules or long references in hooks or MCP configuration.
- Record any hook/MCP routing policy in docs before adding tool-specific config.

## Routing Update Requirements

- New project skill: update this routing table and, if it becomes common, `.agents/skills/agent-router/SKILL.md`.
- Third-party skill: review external source, record adoption in `docs/references/agent-workflow/external-skills.md`, then install adapted skill in `.agents/skills/`.
- Hook or MCP: document trigger, purpose, enforcement strength, and boundaries here before changing tool-specific config.
- New long reference: add it under `docs/references/` and route it from `AGENTS.md` only when agents need to discover it.

Do not install tools, add hooks, or approve skills without updating routing or registry docs.

## Skill and Docs Authoring

Skills are executable routing entries, not knowledge bases. Keep SKILL.md content limited to trigger conditions, workflow steps, docs to read, guardrails, and validation choice.

Description rules:

- Keep descriptions short, keyword-fronted, and agent-neutral.
- Do not use tool-specific names (Codex, Claude, Cursor, Copilot) in descriptions; use "agent" or omit the subject.
- Descriptions must be independently usable as triggers; do not depend on `when_to_use` as the only entry.
- Optional `when_to_use` frontmatter may clarify trigger scenarios but must not carry project rules, long checklists, or code examples. Not all agent clients read `when_to_use`; treat it as a progressive-disclosure enhancement only.

Content placement:

- Long-lived project knowledge belongs in `docs/`.
- Agent collaboration and governance rules belong in `docs/references/agent-workflow/`.
- Canonical implementation examples belong in `docs/references/patterns/`.
- Cross-session state belongs in `docs/agent/context.md` and must stay short.
- Long checklists, code examples, background explanation, and durable references belong in docs, not in skills.

Creation rules:

- New skills or docs must be routed from `AGENTS.md` or `agent-router` only when discoverability is needed.
- Prefer adding a concise governance rule over restructuring files.
- Tool-specific optimizations such as `paths` frontmatter or `.claude/rules/` require explicit approval and documentation before use.
- Third-party skills must be reviewed and adapted before installation. See `external-skills.md` for adoption history.
