---
name: orchestrate-agents
description: Orchestrate bounded multi-agent project work with isolated context, explicit roles, structured handoffs, and independent verification. Use after agent-router for broad audits, parallel read-heavy discovery, noisy command output, cross-domain work, or changes that benefit from separating implementation and review. Do not use for trivial, single-step, or tightly coupled work.
---

# Orchestrate Agents

Multi-agent execution dispatcher after `agent-router` selects it. Read `docs/references/agent-workflow/multi-agent-architecture.md` before delegating.

## Workflow

1. Confirm the delegation test passes.
2. Keep the primary agent as orchestrator and final decision owner.
3. Create one bounded task capsule per delegated role using `.agents/contracts/task.schema.json`.
4. Give each agent only task-local context, files, rules, permissions, and acceptance criteria.
5. Parallelize independent read-only work; keep dependent or write-heavy work sequential.
6. Allow only one writer in a shared worktree.
7. Require delegated results to map to `.agents/contracts/result.schema.json` and pass the shared runtime validator when available.
8. Reject invalid results; allow one format-only correction, then mark blocked.
9. Consolidate evidence before completion claims.
10. Persist only accepted decisions in the matching reference or `docs/agent/context.md`.

## Role Selection

Read `.agents/roles/<role>.md` before assigning: `scout`, `implementer`, `validator`, `verifier`, or `docs-steward`. The orchestrator role is in `.agents/roles/orchestrator.md`.

## Guardrails

- Do not pass full conversation history when a task capsule is sufficient.
- Do not return raw logs when a concise evidence summary is enough.
- Do not let delegated agents expand scope, approve their own work, change merchant-owned content without authorization, or create more agents (`allow_nested_delegation: false`).
- Do not use multiple agents merely to imitate parallelism.

## Fallback

If the client cannot create subagents or enforce role boundaries, run the lifecycle sequentially and report that independent execution was unavailable.
